"""data/ 以下のJSONを集約し，可視化サイト用の site/data/graph.json を生成する．

GitHub Pagesは静的配信のためディレクトリ一覧を取得できない．
そのため手法ごとのJSON（data/nodes/*.json）をビルド時に1ファイルへまとめる．

使い方: python tools/build_graph.py [--data DATA_DIR] [--out OUT_JSON]
"""
import argparse
import json
import re
import sys
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def english_title(name: str) -> str:
    """表示名から検索用の英語名を取り出す（fetch_metadata.py と同じ規則）．"""
    m = re.match(r"^(.*?)\s*\((.*)\)\s*$", name)
    if not m:
        return name
    head, par = m.group(1), m.group(2)
    if re.search(r"[\u3040-\u30ff\u4e00-\u9fff]", head):
        return re.split(r"[,，]", par)[0].strip()
    return f"{head} {par}".strip()


def build_links(n: dict, meta: dict | None) -> dict:
    """論文ページ・PDF・検索のリンクを作る．PDF本体はリポジトリに置かずリンクのみとする．"""
    ref = n["reference"]
    title = (meta or {}).get("title") or english_title(n["name"])
    q = urllib.parse.quote(title)
    links = {"paper": ref}
    m = re.search(r"arxiv\.org/(?:abs|pdf)/([0-9]{4}\.[0-9]{4,5}|[a-z\-]+/[0-9]{7})", ref)
    if m:
        links["pdf"] = f"https://arxiv.org/pdf/{m.group(1)}"
    elif ref.lower().endswith(".pdf"):
        links["pdf"] = ref
    elif meta and meta.get("openAccessPdf"):
        links["pdf"] = meta["openAccessPdf"]
    links["scholar"] = f"https://scholar.google.com/scholar?q={q}"
    links["semantic_scholar"] = (meta or {}).get("url") or f"https://www.semanticscholar.org/search?q={q}"
    return links


def build(data_dir: Path) -> dict:
    groups = sorted(load_json(data_dir / "groups.json"), key=lambda g: g["order"])
    categories = load_json(data_dir / "categories.json")
    group_ids = {g["id"] for g in groups}
    cat_to_group = {}
    for c in categories:
        if c.get("group") not in group_ids:
            raise ValueError(f"category '{c['id']}' has unknown group '{c.get('group')}'")
        cat_to_group[c["id"]] = c["group"]

    meta_path = data_dir / "metadata.json"
    metadata = load_json(meta_path) if meta_path.exists() else {}

    nodes = []
    for p in sorted((data_dir / "nodes").glob("*.json")):
        n = load_json(p)
        primary = n["categories"][0]
        m = metadata.get(n["id"])
        use_meta = bool(m) and not m.get("needs_review")
        nodes.append({
            "id": n["id"],
            "name": n["name"],
            "short_name": n.get("short_name") or n["name"],
            "year": n["year"],
            "citations": m["citationCount"] if use_meta and m.get("citationCount") is not None else n.get("citations"),
            "citations_source": f"Semantic Scholar（{m['fetched_at'][:10]}取得）" if use_meta and m.get("citationCount") is not None else "概算",
            "paper": {k: m.get(k) for k in ("title", "authors", "venue", "year")} if use_meta else None,
            "links": build_links(n, m if use_meta else None),
            "categories": n["categories"],
            "group": cat_to_group[primary],
            "reference": n["reference"],
            "summary": n["summary"],
            "update_rule": n["update_rule"],
            "notes": n.get("notes"),
            "practical": n.get("practical"),
            "deep_dive": n.get("deep_dive"),
        })

    ids = {n["id"] for n in nodes}
    edges = []
    for p in sorted((data_dir / "nodes").glob("*.json")):
        n = load_json(p)
        for e in n.get("parents", []):
            if e["id"] not in ids:
                raise ValueError(f"{n['id']}: unknown parent '{e['id']}'")
            edges.append({"source": e["id"], "target": n["id"], "types": e.get("types", []), "improvement": e["improvement"]})

    types_path = data_dir / "improvement_types.json"
    improvement_types = load_json(types_path) if types_path.exists() else []
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "improvement_types": improvement_types,
        "practical_vocab": load_json(data_dir / "practical_vocab.json") if (data_dir / "practical_vocab.json").exists() else None,
        "groups": groups,
        "categories": categories,
        "nodes": nodes,
        "edges": edges,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, default=ROOT / "data")
    ap.add_argument("--out", type=Path, default=ROOT / "site" / "data" / "graph.json")
    args = ap.parse_args()
    graph = build(args.data)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(graph, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {args.out} (nodes={len(graph['nodes'])}, edges={len(graph['edges'])})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
