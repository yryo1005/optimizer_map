"""data/nodes/*.json からレビュー用Markdown（review/nodes_review.md）を生成する．

使い方: python tools/build_review_md.py [data_dir] [output_md]
並び順は発表年→idの昇順．
"""
import json
import sys
from pathlib import Path

HEADER = """# Optimizer Map データレビュー（ドラフト）

本資料は，`data/nodes/`に格納された最適化手法データを確認するためのレビュー用資料である．
Citation数は生成時点（本資料の作成セッション）での概算値であり，Semantic Scholar等のAPIによる
自動取得に置き換えるまでの暫定値として扱う．内容を確認し，修正が必要な場合は指示すること．

"""


def fmt_cit(c):
    return "なし（null）" if c is None else f"{c:,}"


def main(data_dir: Path, out: Path):
    nodes = [json.loads(p.read_text(encoding="utf-8")) for p in (data_dir / "nodes").glob("*.json")]
    tp = data_dir / "improvement_types.json"
    type_label = {t["id"]: t["label"] for t in json.loads(tp.read_text(encoding="utf-8"))} if tp.exists() else {}
    nodes.sort(key=lambda n: (n["year"], n["id"]))
    by_id = {n["id"]: n for n in nodes}
    lines = [HEADER, f"収録手法数: {len(nodes)}\n", "\n---\n"]
    for n in nodes:
        lines += [f"\n## {n['name']}\n",
                  f"- **ID**: `{n['id']}`",
                  f"- **発表年**: {n['year']}",
                  f"- **Citation数（概算）**: {fmt_cit(n.get('citations'))}",
                  f"- **分野タグ**: {'，'.join(n['categories'])}",
                  f"- **参考文献**: {n['reference']}"]
        if n.get("notes"):
            lines.append(f"- **備考**: {n['notes']}")
        lines += ["", "**概要**", "", n["summary"], "", "**更新式**", "",
                  f"$$ {n['update_rule']} $$", "", "**派生元と改善内容**", ""]
        if n["parents"]:
            for e in n["parents"]:
                pname = by_id.get(e["id"], {}).get("name", "（未登録）")
                tags = "，".join(type_label.get(t, t) for t in e.get("types", []))
                tags = f"［{tags}］" if tags else ""
                lines.append(f"- {pname}（`{e['id']}`）から{tags}: {e['improvement']}")
        else:
            lines.append("なし（起点となる手法）")
        lines += ["", "---"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out} ({len(nodes)} nodes)")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    d = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "data"
    o = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "review" / "nodes_review.md"
    main(d, o)
