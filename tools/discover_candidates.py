"""arXiv の新着論文から，Optimizer Map に追加する候補（新しい最適化手法の論文）を抽出する．

1. arXiv API で cs.LG / math.OC / stat.ML の最近の論文をキーワード検索する．
2. 既に data/nodes の reference に含まれる arXiv ID と，data/candidates/seen.json に記録済みのものを除外する．
3. タイトル・要旨のキーワードで「手法の提案らしさ」を点数化し，上位を data/candidates/candidates.json に出力する．

出力した候補は tools/generate_nodes_gemini.py でノードのJSONに変換する．

使い方:
  python tools/discover_candidates.py --days 30 --max 200 --top 20
依存: Python標準ライブラリのみ
"""
import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "candidates"
ATOM = "{http://www.w3.org/2005/Atom}"
QUERY = ('(cat:cs.LG OR cat:math.OC OR cat:stat.ML) AND '
         '(ti:optimizer OR ti:optimization OR ti:"gradient descent" OR ti:momentum OR ti:Adam OR ti:preconditioner '
         'OR ti:"learning rate" OR ti:"second-order" OR ti:Muon OR ti:Shampoo OR ti:"variance reduction")')
POSITIVE = [r"\bwe propose\b", r"\bnovel optimizer\b", r"\bnew optimizer\b", r"\boptimizer\b", r"\bupdate rule\b",
            r"\bconverge", r"\bpretraining\b", r"\bAdamW?\b", r"\bmomentum\b", r"\bprecondition", r"\blearning rate\b"]
NEGATIVE = [r"\bhyperparameter optimization\b", r"\bbayesian optimization\b", r"\bcombinatorial\b", r"\bportfolio\b",
            r"\bpower system", r"\bsurvey\b", r"\bbenchmark(ing)?\b"]


def known_arxiv_ids() -> set:
    ids = set()
    for p in (ROOT / "data" / "nodes").glob("*.json"):
        ref = json.loads(p.read_text(encoding="utf-8")).get("reference", "")
        m = re.search(r"arxiv\.org/(?:abs|pdf)/([0-9]{4}\.[0-9]{4,5})", ref)
        if m:
            ids.add(m.group(1))
    return ids


def fetch(max_results: int):
    params = {"search_query": QUERY, "sortBy": "submittedDate", "sortOrder": "descending", "start": 0, "max_results": max_results}
    url = "https://export.arxiv.org/api/query?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "optimizer-map-discover/1.0"})
    with urllib.request.urlopen(req, timeout=60) as res:
        root = ET.fromstring(res.read())
    for e in root.findall(f"{ATOM}entry"):
        aid = re.sub(r"v\d+$", "", e.find(f"{ATOM}id").text.rsplit("/", 1)[-1])
        yield {
            "arxiv_id": aid,
            "title": " ".join(e.find(f"{ATOM}title").text.split()),
            "abstract": " ".join(e.find(f"{ATOM}summary").text.split()),
            "published": e.find(f"{ATOM}published").text,
            "authors": [a.find(f"{ATOM}name").text for a in e.findall(f"{ATOM}author")],
            "url": f"https://arxiv.org/abs/{aid}",
        }


def score(c: dict) -> int:
    text = f"{c['title']} {c['abstract']}"
    s = sum(2 if re.search(p, c["title"], re.I) else 1 for p in POSITIVE if re.search(p, text, re.I))
    s -= sum(3 for p in NEGATIVE if re.search(p, text, re.I))
    return s


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--max", type=int, default=200)
    ap.add_argument("--top", type=int, default=20)
    args = ap.parse_args()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seen_path = OUT_DIR / "seen.json"
    seen = set(json.loads(seen_path.read_text(encoding="utf-8"))) if seen_path.exists() else set()
    known = known_arxiv_ids()
    since = datetime.now(timezone.utc) - timedelta(days=args.days)
    cands = []
    for c in fetch(args.max):
        if c["arxiv_id"] in known or c["arxiv_id"] in seen:
            continue
        if datetime.fromisoformat(c["published"].replace("Z", "+00:00")) < since:
            continue
        c["score"] = score(c)
        cands.append(c)
    time.sleep(3)  # arXiv API の利用規約（連続アクセスの間隔）に従う
    cands = [c for c in sorted(cands, key=lambda c: -c["score"]) if c["score"] > 0][: args.top]
    (OUT_DIR / "candidates.json").write_text(json.dumps(cands, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    seen_path.write_text(json.dumps(sorted(seen | {c["arxiv_id"] for c in cands}), indent=2) + "\n", encoding="utf-8")
    print(f"candidates={len(cands)} -> {OUT_DIR / 'candidates.json'}")
    for c in cands:
        print(f"  [{c['score']:>2}] {c['arxiv_id']} {c['title']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
