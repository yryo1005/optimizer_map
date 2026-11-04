"""data/nodes/*.json の整合性検証．

チェック内容（ERROR はビルドを止める，WARN は確認を促す）:
  - 必須キー・型                                         ERROR
  - ファイル名とidの一致，id重複                         ERROR
  - 派生元(parents)の参照先の存在，自己参照・循環の有無   ERROR
  - categories が data/categories.json に定義済みか       ERROR
  - 派生元の改良パターン（parents[].types）が定義済みか   ERROR
  - 派生元の発表年が派生先より新しくないか               WARN
  - 参考文献URLの重複（同一論文を別手法として登録していないか）  WARN
  - short_name の重複，同一の派生元の重複                WARN
  - 参考文献URLが http(s) で始まるか                     ERROR
  - 年が 1600〜（今年+1）の範囲か                         ERROR
  - summary が「である調」の句点「．」で終わるか          WARN

意図的な重複（同一論文で提案された複数の手法など）は，ノードの notes に「同一論文」と書くと参考文献URLの重複警告を抑制する．

使い方:
  python tools/validate_nodes.py [data_dir]
  （モジュールとして validate(nodes, categories, improvement_types) も利用できる）
"""
import json
import re
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

REQUIRED = {"id": str, "name": str, "year": int, "categories": list,
            "reference": str, "summary": str, "update_rule": str, "parents": list}
OPTIONAL = {"citations": (int, type(None)), "notes": str, "short_name": str, "practical": dict, "deep_dive": dict}
ID_RE = re.compile(r"^[a-z0-9_]+$")


def validate(nodes: dict, cats: set, imp_types: set | None, file_names: dict | None = None, practical_vocab: dict | None = None):
    """nodes: {id: node}．戻り値 (errors, warnings)．"""
    errors, warnings = [], []
    pv = practical_vocab or {}
    pv_ids = {k: {x["id"] for x in v} for k, v in pv.items()}
    file_names = file_names or {}
    max_year = date.today().year + 1
    for nid, n in nodes.items():
        label = file_names.get(nid, nid)
        if not isinstance(nid, str) or not ID_RE.match(nid):
            errors.append(f"{label}: id '{nid}' は英小文字・数字・_ のみ")
        for k, t in REQUIRED.items():
            if not isinstance(n.get(k), t):
                errors.append(f"{label}: 必須キー '{k}' が欠落または型不正")
        for k, t in OPTIONAL.items():
            if k in n and not isinstance(n[k], t):
                errors.append(f"{label}: キー '{k}' の型不正")
        for k in set(n) - set(REQUIRED) - set(OPTIONAL):
            warnings.append(f"{label}: 未定義キー '{k}'")
        for c in n.get("categories", []) or []:
            if c not in cats:
                errors.append(f"{label}: 未定義の分野タグ '{c}'")
        if not n.get("categories"):
            errors.append(f"{label}: categories が空")
        if isinstance(n.get("year"), int) and not (1600 <= n["year"] <= max_year):
            errors.append(f"{label}: year {n['year']} が範囲外")
        if isinstance(n.get("reference"), str) and not re.match(r"^https?://", n["reference"]):
            errors.append(f"{label}: reference が URL ではない")
        pr = n.get("practical")
        if isinstance(pr, dict) and pv_ids:
            if pr.get("state") not in pv_ids.get("state", set()):
                errors.append(f"{label}: practical.state '{pr.get('state')}' が未定義")
            for key in ("implementations", "tasks"):
                for v in pr.get(key, []) or []:
                    if v not in pv_ids.get(key, set()):
                        errors.append(f"{label}: practical.{key} の未定義の値 '{v}'")
            if not isinstance(pr.get("hyperparameters", []), list):
                errors.append(f"{label}: practical.hyperparameters はリスト")
        elif pv_ids and "practical" not in n:
            warnings.append(f"{label}: practical（実用情報）が未記入")
        dd = n.get("deep_dive")
        if isinstance(dd, dict):
            for k in dd:
                if k not in ("why", "weaknesses", "settings"):
                    errors.append(f"{label}: deep_dive の未定義キー '{k}'")
        if isinstance(n.get("summary"), str) and not n["summary"].rstrip().endswith("．"):
            warnings.append(f"{label}: summary が「．」で終わっていない（である調・句読点「，」「．」）")
    for nid, n in nodes.items():
        seen = set()
        for e in n.get("parents", []) or []:
            pid = e.get("id")
            if pid in seen:
                warnings.append(f"{nid}: 派生元 '{pid}' が重複")
            seen.add(pid)
            if pid == nid:
                errors.append(f"{nid}: 自己参照")
            elif pid not in nodes:
                errors.append(f"{nid}: 派生元 '{pid}' が存在しない")
            elif nodes[pid].get("year", 0) > n.get("year", 0):
                warnings.append(f"{nid}: 派生元 '{pid}'({nodes[pid]['year']}) が派生先({n['year']})より新しい")
            if not e.get("improvement"):
                errors.append(f"{nid}: 派生元 '{pid}' の improvement が空")
            if imp_types is not None:
                ts = e.get("types")
                if not isinstance(ts, list) or not ts:
                    errors.append(f"{nid}: 派生元 '{pid}' の types が空（improvement_types.json の id を1つ以上指定）")
                else:
                    for t in ts:
                        if t not in imp_types:
                            errors.append(f"{nid}: 派生元 '{pid}' の未定義の改良パターン '{t}'")
    # 重複の検出
    by_ref, by_short = defaultdict(list), defaultdict(list)
    for nid, n in nodes.items():
        ref = re.sub(r"(v\d+)?/?$", "", str(n.get("reference", "")).replace("http://", "https://"))
        if "同一論文" not in (n.get("notes") or ""):
            by_ref[ref].append(nid)
        by_short[(n.get("short_name") or n.get("name", "")).lower()].append(nid)
    for ref, ids in by_ref.items():
        if len(ids) > 1:
            warnings.append(f"参考文献URLが重複: {', '.join(sorted(ids))}（{ref}）")
    for s, ids in by_short.items():
        if len(ids) > 1:
            warnings.append(f"short_name が重複: {', '.join(sorted(ids))}（{s}）")
    # 循環検出
    state = {}

    def dfs(u, stack):
        state[u] = 1
        for e in nodes[u].get("parents", []) or []:
            v = e.get("id")
            if v not in nodes:
                continue
            if state.get(v) == 1:
                errors.append("循環: " + " -> ".join(stack + [v]))
            elif v not in state:
                dfs(v, stack + [v])
        state[u] = 2

    for u in nodes:
        if u not in state:
            dfs(u, [u])
    return errors, warnings


def load_vocab(data_dir: Path):
    cats = {c["id"] for c in json.loads((data_dir / "categories.json").read_text(encoding="utf-8"))}
    tp = data_dir / "improvement_types.json"
    imp_types = {t["id"] for t in json.loads(tp.read_text(encoding="utf-8"))} if tp.exists() else None
    return cats, imp_types


def load_practical_vocab(data_dir: Path):
    p = data_dir / "practical_vocab.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


def main(data_dir: Path) -> int:
    cats, imp_types = load_vocab(data_dir)
    nodes, file_names, errors = {}, {}, []
    for p in sorted((data_dir / "nodes").glob("*.json")):
        n = json.loads(p.read_text(encoding="utf-8"))
        nid = n.get("id")
        if nid != p.stem:
            errors.append(f"{p.name}: id '{nid}' がファイル名と不一致")
        if nid in nodes:
            errors.append(f"{p.name}: id '{nid}' が重複")
        nodes[nid] = n
        file_names[nid] = p.name
    e2, warnings = validate(nodes, cats, imp_types, file_names, load_practical_vocab(data_dir))
    errors += e2
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    n_edges = sum(len(n.get("parents", [])) for n in nodes.values())
    print(f"nodes={len(nodes)} edges={n_edges} errors={len(errors)} warnings={len(warnings)}")
    return 1 if errors else 0


if __name__ == "__main__":
    d = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "data"
    sys.exit(main(d))
