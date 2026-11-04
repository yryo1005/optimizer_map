"""`data/nodes/*.json`の内容を，人間が確認しやすいMarkdown形式のレビュー資料へ変換するスクリプト．

生成AI（現在はClaude Code，将来はGemini）が作成したノードデータをユーザーが確認する際に，
JSONを直接読むのではなく，手法ごとに見出しで区切られた読みやすいMarkdownを確認できるようにする．
確定前のレビュー資料であるため，`.reports/draft_review_{通し番号}.md`として出力する．
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
NODES_DIR = DATA_DIR / "nodes"
REPORTS_DIR = PROJECT_ROOT / ".reports"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from schema import OptimizerNode  # noqa: E402


def load_all_nodes() -> list[OptimizerNode]:
    """`data/manifest.json`に列挙された全ノードを読み込み，発表年の昇順に並べる関数．

    引数:
        なし．
    戻り値:
        list[OptimizerNode]: 発表年の昇順に並べたノードのリスト．
    """
    manifest_path = DATA_DIR / "manifest.json"
    with manifest_path.open(encoding="utf-8") as f:
        node_ids = json.load(f)["nodes"]

    nodes = []
    for node_id in node_ids:
        node_path = NODES_DIR / f"{node_id}.json"
        with node_path.open(encoding="utf-8") as f:
            nodes.append(OptimizerNode.model_validate(json.load(f)))
    return sorted(nodes, key=lambda n: n.year)


def _format_derived_from(node: OptimizerNode, id_to_name: dict[str, str]) -> str:
    """`derived_from`を人間が読みやすい文章に整形する関数．

    引数:
        node (OptimizerNode): 整形対象のノード．
        id_to_name (dict[str, str]): ノードIDから正式名称への対応表．
    戻り値:
        str: 派生元の手法名と改善内容を列挙した文字列．起点となる手法の場合は「なし（起点となる手法）」．
    """
    if not node.derived_from:
        return "なし（起点となる手法）"
    lines = []
    for derived in node.derived_from:
        parent_name = id_to_name.get(derived.parent_id, derived.parent_id)
        lines.append(f"- {parent_name}（`{derived.parent_id}`）から: {derived.relation}")
    return "\n".join(lines)


def render_markdown(nodes: list[OptimizerNode]) -> str:
    """ノードのリストを，レビュー用のMarkdown文字列へ変換する関数．

    引数:
        nodes (list[OptimizerNode]): 発表年の昇順に並んだノードのリスト．
    戻り値:
        str: レビュー用Markdownの全文．
    """
    id_to_name = {node.id: node.name for node in nodes}

    lines = [
        "# Optimizer Map データレビュー（ドラフト）",
        "",
        "本資料は，`data/nodes/`に格納された最適化手法データを確認するためのレビュー用資料である．",
        "Citation数は生成時点（本資料の作成セッション）での概算値であり，Semantic Scholar等のAPIによる",
        "自動取得に置き換えるまでの暫定値として扱う．内容を確認し，修正が必要な場合は指示すること．",
        "",
        "---",
        "",
    ]

    for node in nodes:
        category_str = "，".join(c.value for c in node.category)
        lines.extend(
            [
                f"## {node.name}",
                "",
                f"- **ID**: `{node.id}`",
                f"- **発表年**: {node.year}",
                f"- **Citation数（概算）**: {node.citation_count:,}",
                f"- **分野タグ**: {category_str}",
                f"- **参考文献**: {node.paper_url}",
                "",
                "**概要**",
                "",
                node.summary,
                "",
                "**更新式**",
                "",
                f"$$ {node.update_rule} $$",
                "",
                "**派生元と改善内容**",
                "",
                _format_derived_from(node, id_to_name),
                "",
                "---",
                "",
            ]
        )

    return "\n".join(lines)


def main(report_number: int) -> None:
    """レビュー用Markdownを生成し，`.reports/draft_review_{report_number:03}.md`へ保存する関数．

    引数:
        report_number (int): レポートの通し番号（対応する`.orders/order_{n:03}.md`の番号）．
    戻り値:
        なし．
    """
    nodes = load_all_nodes()
    markdown = render_markdown(nodes)

    REPORTS_DIR.mkdir(exist_ok=True)
    output_path = REPORTS_DIR / f"draft_review_{report_number:03}.md"
    output_path.write_text(markdown, encoding="utf-8")
    print(f"レビュー用Markdownを書き出しました: {output_path}")


if __name__ == "__main__":
    main(report_number=1)
