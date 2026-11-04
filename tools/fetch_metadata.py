"""Semantic Scholar API から各手法の原典論文の書誌情報を取得し，data/metadata.json に保存する．

取得する情報: タイトル，著者，掲載先，発表年，Citation数，オープンアクセス版PDFのURL，Semantic ScholarのURL
build_graph.py は data/metadata.json があればそれを優先して使う（Citation数・PDFリンク・著者等）．

論文の特定方法（reference から自動判定）:
  arxiv.org/abs/<id> → ARXIV:<id>
  doi.org/<doi>      → DOI:<doi>
  それ以外           → 英語名でのタイトル検索（/paper/search/match）．年が±2年を超えてずれる場合は needs_review を付ける
  手動で指定したい場合は data/metadata_overrides.json に {"<node id>": "<Semantic Scholar の paper id か ARXIV:/DOI: 形式>"} を書く．

使い方:
  python tools/fetch_metadata.py                 # 全手法を取得（取得済みでも更新）
  python tools/fetch_metadata.py --only adam sgd # 指定した手法のみ
  python tools/fetch_metadata.py --dry-run       # 問い合わせに使うIDを表示するだけ
  python tools/fetch_metadata.py --write-citations  # 取得したCitation数を data/nodes/*.json の citations にも書き戻す

環境変数: S2_API_KEY（任意．あるとレート制限が緩和される）
依存: Python標準ライブラリのみ
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
API = "https://api.semanticscholar.org/graph/v1"
FIELDS = "title,year,venue,authors,citationCount,openAccessPdf,url,externalIds,publicationDate"
BATCH = 100


def english_title(name: str) -> str:
    """表示名から検索用の英語名を取り出す（例: '確率的勾配降下法 (Stochastic Gradient Descent, SGD)' → 'Stochastic Gradient Descent'）．"""
    m = re.match(r"^(.*?)\s*\((.*)\)\s*$", name)
    if not m:
        return name
    head, par = m.group(1), m.group(2)
    if re.search(r"[぀-ヿ一-鿿]", head):
        return re.split(r"[,，]", par)[0].strip()
    return f"{head} {par}".strip()


def lookup_key(node: dict, overrides: dict) -> str | None:
    if node["id"] in overrides:
        return overrides[node["id"]]
    ref = node.get("reference", "")
    m = re.search(r"arxiv\.org/(?:abs|pdf)/([0-9]{4}\.[0-9]{4,5}|[a-z\-]+/[0-9]{7})", ref)
    if m:
        return f"ARXIV:{m.group(1)}"
    m = re.search(r"doi\.org/(10\.[^\s?#]+)", ref)
    if m:
        return f"DOI:{urllib.parse.unquote(m.group(1))}"
    return None


def request(method: str, url: str, body: dict | None = None, retries: int = 6):
    headers = {"Content-Type": "application/json", "User-Agent": "optimizer-map-metadata/1.0"}
    key = os.environ.get("S2_API_KEY")
    if key:
        headers["x-api-key"] = key
    data = json.dumps(body).encode() if body is not None else None
    delay = 2.0
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=60) as res:
                return json.loads(res.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if e.code in (429, 500, 502, 503, 504) and attempt < retries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise
        except urllib.error.URLError:
            if attempt < retries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise
    return None


def slim(p: dict) -> dict:
    oa = p.get("openAccessPdf") or {}
    return {
        "paperId": p.get("paperId"),
        "title": p.get("title"),
        "year": p.get("year"),
        "venue": p.get("venue") or None,
        "authors": [a.get("name") for a in (p.get("authors") or []) if a.get("name")],
        "citationCount": p.get("citationCount"),
        "openAccessPdf": oa.get("url") or None,
        "url": p.get("url"),
        "externalIds": p.get("externalIds") or {},
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", help="対象の手法ID")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--write-citations", action="store_true")
    ap.add_argument("--sleep", type=float, default=1.1, help="タイトル検索の間隔（秒）")
    args = ap.parse_args()

    nodes = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted((DATA / "nodes").glob("*.json"))}
    if args.only:
        nodes = {k: v for k, v in nodes.items() if k in set(args.only)}
    ov_path = DATA / "metadata_overrides.json"
    overrides = json.loads(ov_path.read_text(encoding="utf-8")) if ov_path.exists() else {}
    meta_path = DATA / "metadata.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}

    keyed = {nid: lookup_key(n, overrides) for nid, n in nodes.items()}
    if args.dry_run:
        for nid, k in keyed.items():
            print(f"{nid}\t{k or 'title:' + english_title(nodes[nid]['name'])}")
        return 0

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    # 1) ID が分かるものはバッチで取得
    with_key = [(nid, k) for nid, k in keyed.items() if k]
    for i in range(0, len(with_key), BATCH):
        chunk = with_key[i:i + BATCH]
        res = request("POST", f"{API}/paper/batch?fields={FIELDS}", {"ids": [k for _, k in chunk]}) or []
        for (nid, k), p in zip(chunk, res):
            if p:
                meta[nid] = {**slim(p), "lookup": k, "fetched_at": now}
            else:
                print(f"WARN {nid}: {k} が見つからない", file=sys.stderr)
        print(f"batch {i // BATCH + 1}: {len(chunk)} ids")
    # 2) それ以外はタイトル検索
    for nid, k in keyed.items():
        if k:
            continue
        n = nodes[nid]
        q = english_title(n["name"])
        res = request("GET", f"{API}/paper/search/match?query={urllib.parse.quote(q)}&fields={FIELDS}")
        time.sleep(args.sleep)
        data = (res or {}).get("data") or []
        if not data:
            print(f"WARN {nid}: タイトル検索で見つからない（{q}）", file=sys.stderr)
            continue
        p = slim(data[0])
        p["lookup"] = f"title:{q}"
        p["fetched_at"] = now
        if p.get("year") and abs(p["year"] - n["year"]) > 2:
            p["needs_review"] = f"年が一致しない（データ {n['year']} / 取得 {p['year']}）．data/metadata_overrides.json で指定すること"
        meta[nid] = p

    meta_path.write_text(json.dumps(dict(sorted(meta.items())), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {meta_path} ({len(meta)} entries)")

    if args.write_citations:
        changed = 0
        for nid, n in nodes.items():
            m = meta.get(nid)
            if not m or m.get("needs_review") or m.get("citationCount") is None:
                continue
            if n.get("citations") != m["citationCount"]:
                n["citations"] = m["citationCount"]
                (DATA / "nodes" / f"{nid}.json").write_text(json.dumps(n, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                changed += 1
        print(f"updated citations in {changed} node files")
    reviews = [k for k, v in meta.items() if v.get("needs_review")]
    if reviews:
        print("needs_review: " + ", ".join(reviews))
    return 0


if __name__ == "__main__":
    sys.exit(main())
