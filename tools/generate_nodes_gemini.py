"""候補論文（data/candidates/candidates.json）から，Gemini で手法ノードのJSONを生成する．

処理:
  1. 候補ごとに，タイトル・要旨・既存の手法ID一覧・分野タグ・改良パターンの語彙・記述規約をプロンプトに入れて問い合わせる．
  2. 構造化出力（responseSchema）で {is_optimizer_method, reason, node} を受け取る．
  3. 新しい最適化手法でないもの（is_optimizer_method=false）は data/candidates/rejected.json に記録して破棄する．
  4. tools/validate_nodes.py の validate() で既存データと合わせて検証し，通ったものだけ data/nodes/<id>.json に書き出す．
     （更新式の KaTeX 検証は CI の tools/check_formulas.mjs で行う）
  5. 結果を data/candidates/generated.json に記録する．人手のレビューは Pull Request 上で review/nodes_review.md を見て行う．

使い方:
  GEMINI_API_KEY=... python tools/generate_nodes_gemini.py [--limit 5] [--model gemini-2.5-flash] [--dry-run]

環境変数:
  GEMINI_API_KEY  必須（--dry-run 時は不要）
  GEMINI_MODEL    任意（既定は --model の値）．無料枠で使えるモデル名は時期により変わるため適宜更新すること．

ローカルのリポジトリに .ai/ai-agent/core/llm.py（Gemini構造化出力のビルダー）がある場合は，
call_gemini() をそちらの呼び出しに置き換えてよい（プロンプトとスキーマは build_prompt()/response_schema() を流用）．
依存: Python標準ライブラリのみ
"""
import argparse
import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_nodes import load_vocab, validate  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
CAND = DATA / "candidates"
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

STYLE_RULES = """\
- 文体は「である調」．句読点は全角の「，」「．」を使う．
- name は「日本語名 (英語名, 略称)」．日本語名がない手法は「略称 (英語の正式名)」．
- short_name はノードのラベルに使う短い名前（例: Adam, AdamW, Muon）．
- year は arXiv 初出年．citations は null（後で Semantic Scholar から取得する）．
- categories は与えられた分野タグから1〜3個．先頭が主分野．
- summary は2〜4文．派生元の手法の問題点 → 本手法の工夫 → 効果 の順に書く．
- update_rule は KaTeX で描画できる LaTeX（$$ は付けない）．記法は既存データに合わせる:
  パラメータ {\\mathbf w}_t，勾配 {\\mathbf g}_t = \\nabla f_t({\\mathbf w}_t)，行列は {\\mathbf W}_t，
  複数の式は ", \\quad " で区切る．
- parents は既存の手法ID から選ぶ（1〜3個）．types は改良パターンの語彙から1〜2個（先頭が主）．
  improvement は「何をどう変えたか」を名詞句で簡潔に書く（例: 「重み減衰のモーメント計算からの分離」）．
- practical（実用情報）: state は状態量（パラメータと同じ大きさの状態をいくつ持つか），implementations は確実に分かるものだけ，
  hyperparameters は主なもの（記号），tasks は主な用途．deep_dive は「なぜ効くか」「弱点・注意点」「典型的な設定」を各1〜2文．
- 既存の手法と同じものなら is_optimizer_method を false にする．最適化手法の提案でない論文（応用・解析のみ・ベンチマーク等）も false．
"""


def load(path: Path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def response_schema(node_ids, categories, types, practical_vocab=None):
    s = lambda **kw: kw  # noqa: E731
    return s(type="OBJECT", required=["is_optimizer_method", "reason"], properties={
        "is_optimizer_method": s(type="BOOLEAN"),
        "reason": s(type="STRING"),
        "node": s(type="OBJECT", required=["id", "name", "short_name", "year", "categories", "reference", "summary", "update_rule", "parents"], properties={
            "id": s(type="STRING", description="英小文字・数字・_ のみ"),
            "name": s(type="STRING"),
            "short_name": s(type="STRING"),
            "year": s(type="INTEGER"),
            "categories": s(type="ARRAY", items=s(type="STRING", enum=categories)),
            "reference": s(type="STRING"),
            "summary": s(type="STRING"),
            "update_rule": s(type="STRING"),
            "parents": s(type="ARRAY", items=s(type="OBJECT", required=["id", "types", "improvement"], properties={
                "id": s(type="STRING", enum=node_ids),
                "types": s(type="ARRAY", items=s(type="STRING", enum=types)),
                "improvement": s(type="STRING"),
            })),
            "notes": s(type="STRING"),
            "practical": s(type="OBJECT", required=["state", "implementations", "hyperparameters", "tasks"], properties={
                "state": s(type="STRING", enum=[v["id"] for v in (practical_vocab or {}).get("state", [])] or None),
                "implementations": s(type="ARRAY", items=s(type="STRING", enum=[v["id"] for v in (practical_vocab or {}).get("implementations", [])] or None)),
                "hyperparameters": s(type="ARRAY", items=s(type="STRING")),
                "tasks": s(type="ARRAY", items=s(type="STRING", enum=[v["id"] for v in (practical_vocab or {}).get("tasks", [])] or None)),
            }),
            "deep_dive": s(type="OBJECT", properties={"why": s(type="STRING"), "weaknesses": s(type="STRING"), "settings": s(type="STRING")}),
        }),
    })


def build_prompt(cand, nodes, categories, types):
    catalog = "\n".join(f"- {n['id']}: {n.get('short_name', n['name'])} ({n['year']})" for n in sorted(nodes.values(), key=lambda n: n["year"]))
    cats = "\n".join(f"- {c['id']}: {c['description']}" for c in categories)
    tys = "\n".join(f"- {t['id']}（{t['label']}）: {t['description']}" for t in types)
    examples = json.dumps([nodes[k] for k in ("adamw", "lion") if k in nodes], ensure_ascii=False, indent=1)
    return f"""あなたは最適化アルゴリズムの系譜マップ（Optimizer Map）のデータ作成者である．
次の論文が新しい最適化手法を提案しているかを判定し，提案している場合は手法ノードのJSONを作成せよ．

# 論文
タイトル: {cand['title']}
arXiv: {cand['url']}（初出 {cand['published'][:10]}）
著者: {', '.join(cand.get('authors', [])[:8])}
要旨: {cand['abstract']}

# 記述規約
{STYLE_RULES}
# 分野タグ（categories に使う）
{cats}

# 改良パターン（parents[].types に使う）
{tys}

# 既存の手法（parents[].id に使う．同じ手法なら新規作成しない）
{catalog}

# 既存データの例
{examples}
"""


def call_gemini(prompt, schema, model, api_key, retries=4):
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "responseSchema": schema, "temperature": 0.2},
    }
    delay = 10.0
    for attempt in range(retries):
        try:
            req = urllib.request.Request(API.format(model=model), data=json.dumps(body).encode(),
                                         headers={"Content-Type": "application/json", "x-goog-api-key": api_key}, method="POST")
            with urllib.request.urlopen(req, timeout=120) as res:
                out = json.loads(res.read().decode())
            return json.loads(out["candidates"][0]["content"]["parts"][0]["text"])
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=5)
    ap.add_argument("--model", default=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"))
    ap.add_argument("--interval", type=float, default=8.0, help="無料枠のレート制限に合わせた問い合わせ間隔（秒）")
    ap.add_argument("--dry-run", action="store_true", help="1件目のプロンプトを表示して終了")
    args = ap.parse_args()

    cands = load(CAND / "candidates.json", [])
    if not cands:
        print("候補がない（先に tools/discover_candidates.py を実行する）")
        return 0
    categories = load(DATA / "categories.json", [])
    types = load(DATA / "improvement_types.json", [])
    nodes = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted((DATA / "nodes").glob("*.json"))}
    practical_vocab = load(DATA / "practical_vocab.json", None)
    schema = response_schema(sorted(nodes), [c["id"] for c in categories], [t["id"] for t in types], practical_vocab)
    if args.dry_run:
        print(build_prompt(cands[0], nodes, categories, types))
        return 0
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY が未設定", file=sys.stderr)
        return 1

    cat_ids, type_ids = load_vocab(DATA)
    generated, rejected = load(CAND / "generated.json", []), load(CAND / "rejected.json", [])
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    added = 0
    for cand in cands[: args.limit]:
        try:
            res = call_gemini(build_prompt(cand, nodes, categories, types), schema, args.model, api_key)
        except Exception as e:  # noqa: BLE001 - 1件の失敗で全体を止めない
            print(f"ERROR {cand['arxiv_id']}: {e}", file=sys.stderr)
            continue
        time.sleep(args.interval)
        if not res or not res.get("is_optimizer_method") or not res.get("node"):
            rejected.append({"arxiv_id": cand["arxiv_id"], "title": cand["title"], "reason": (res or {}).get("reason"), "at": now})
            print(f"SKIP  {cand['arxiv_id']}: {(res or {}).get('reason')}")
            continue
        node = res["node"]
        node["citations"] = None
        node.setdefault("reference", cand["url"])
        if node["id"] in nodes:
            rejected.append({"arxiv_id": cand["arxiv_id"], "title": cand["title"], "reason": f"id '{node['id']}' が既存", "at": now})
            print(f"SKIP  {cand['arxiv_id']}: id '{node['id']}' が既存")
            continue
        ordered = {k: node[k] for k in ("id", "name", "short_name", "year", "citations", "categories", "reference", "summary", "update_rule", "parents", "practical", "deep_dive", "notes") if k in node}
        errors, _ = validate({**nodes, ordered["id"]: ordered}, cat_ids, type_ids, practical_vocab=practical_vocab)
        errors = [e for e in errors if ordered["id"] in e]
        if errors:
            rejected.append({"arxiv_id": cand["arxiv_id"], "title": cand["title"], "reason": "検証エラー: " + " / ".join(errors), "node": ordered, "at": now})
            print(f"FAIL  {cand['arxiv_id']}: {errors}")
            continue
        (DATA / "nodes" / f"{ordered['id']}.json").write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        nodes[ordered["id"]] = ordered
        generated.append({"arxiv_id": cand["arxiv_id"], "id": ordered["id"], "model": args.model, "at": now})
        added += 1
        print(f"ADD   {cand['arxiv_id']} -> data/nodes/{ordered['id']}.json")
    (CAND / "generated.json").write_text(json.dumps(generated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (CAND / "rejected.json").write_text(json.dumps(rejected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"added={added}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
