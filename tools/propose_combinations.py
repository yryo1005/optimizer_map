"""組み合わせの提案（プロトタイプ）: まだ組み合わされていない手法の組を，改善の候補として順位付けする．

考え方（詳細は docs/combination_proposal.md）
  - 派生元を2つ以上持つ手法（例: Adam ← モーメント法 + RMSprop）は「組み合わせ」によって生まれた．
  - 各手法の「改良の署名」S(v) を，祖先から v までのエッジに付いた改良パターンの集合とする．
  - 候補の組 (A, B) は，祖先・子孫の関係になく，まだ両方を祖先に持つ手法がない組とする（既に組み合わされた組は除く）．
  - 次の特徴量の重み付き和で順位付けする．
      complement : 署名の対称差の割合（互いに持たない改良を補い合うほど高い）
      activity   : 直近 W 年に派生先が生まれた数（今まさに改良が続いている手法ほど高い．将来の情報を使わない人気度）
      proximity  : 共通の祖先からの距離が近いほど高い（同じ系統の中の組み合わせが起きやすい）
      task       : 主な用途（practical.tasks）の一致度
      recency    : 新しい手法ほど高い
  - バックテスト: ある年 Y までのデータだけで提案し，Y より後に実際に同じ手法の派生元として組み合わされた組を正解として評価する．

使い方:
  python tools/propose_combinations.py --top 20               # 現在のデータで提案を出力
  python tools/propose_combinations.py --backtest             # 年ごとのバックテスト（Precision@k，Recall@k）
  python tools/propose_combinations.py --top 30 --json out.json
依存: Python標準ライブラリのみ
"""
import argparse
import json
import math
import random
import sys
from collections import defaultdict, deque
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEIGHTS = {"complement": 1.0, "activity": 1.5, "proximity": 1.0, "task": 0.5, "recency": 0.5}
ACTIVITY_WINDOW = 3


def load_nodes():
    return {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "data" / "nodes").glob("*.json"))}


class Graph:
    """年 cutoff までの手法だけを含む部分グラフ．"""

    def __init__(self, nodes, cutoff):
        self.cutoff = cutoff
        self.nodes = {k: v for k, v in nodes.items() if v["year"] <= cutoff}
        self.parents = defaultdict(list)
        self.children = defaultdict(list)
        for nid, n in self.nodes.items():
            for p in n["parents"]:
                if p["id"] in self.nodes:
                    self.parents[nid].append((p["id"], p.get("types", [])))
                    self.children[p["id"]].append(nid)
        self._anc = {}
        self._sig = {}

    def ancestors(self, v):
        """{祖先: 最短距離}"""
        if v not in self._anc:
            dist = {}
            q = deque([(v, 0)])
            while q:
                cur, d = q.popleft()
                for p, _ in self.parents[cur]:
                    if p not in dist:
                        dist[p] = d + 1
                        q.append((p, d + 1))
            self._anc[v] = dist
        return self._anc[v]

    def signature(self, v):
        if v not in self._sig:
            sig = set()
            for u in [v, *self.ancestors(v)]:
                for _, types in self.parents[u]:
                    sig.update(types)
            self._sig[v] = sig
        return self._sig[v]

    def already_combined(self):
        """両方を（祖先または自身として）含む手法がある組の集合．"""
        done = set()
        for v in self.nodes:
            anc = set(self.ancestors(v))
            for a, b in combinations(sorted(anc), 2):
                done.add((a, b))
        return done


def features(g: Graph, a: str, b: str):
    A, B = g.nodes[a], g.nodes[b]
    sa, sb = g.signature(a), g.signature(b)
    union = sa | sb
    complement = len(sa ^ sb) / len(union) if union else 0.0
    act = lambda v: sum(1 for c in g.children[v] if g.nodes[c]["year"] > g.cutoff - ACTIVITY_WINDOW)  # noqa: E731
    activity = math.log1p(min(act(a), act(b)))
    da, db = g.ancestors(a), g.ancestors(b)
    common = set(da) & set(db)
    proximity = max((1.0 / max(da[c], db[c]) for c in common), default=0.0)
    ta, tb = set((A.get("practical") or {}).get("tasks", [])), set((B.get("practical") or {}).get("tasks", []))
    task = len(ta & tb) / len(ta | tb) if ta | tb else 0.0
    recency = math.exp(-(g.cutoff - min(A["year"], B["year"])) / 5.0)
    return {"complement": complement, "activity": activity, "proximity": proximity, "task": task, "recency": recency}


def candidates(g: Graph):
    done = g.already_combined()
    ids = sorted(g.nodes)
    for a, b in combinations(ids, 2):
        if (a, b) in done:
            continue
        if a in g.ancestors(b) or b in g.ancestors(a):
            continue
        yield a, b


def rank(g: Graph, weights=WEIGHTS):
    out = []
    for a, b in candidates(g):
        f = features(g, a, b)
        out.append((sum(weights[k] * f[k] for k in weights), a, b, f))
    out.sort(key=lambda x: -x[0])
    return out


def future_combinations(nodes, cutoff):
    """cutoff より後に，cutoff 以前の2手法を派生元として持つ手法が生まれた組（正解）．"""
    truth = set()
    for n in nodes.values():
        if n["year"] <= cutoff:
            continue
        ps = sorted(p["id"] for p in n["parents"] if nodes[p["id"]]["year"] <= cutoff)
        for a, b in combinations(ps, 2):
            truth.add((a, b))
    return truth


def explain(g: Graph, a, b, f):
    sa, sb = g.signature(a), g.signature(b)
    only_a, only_b = sorted(sa - sb), sorted(sb - sa)
    common = set(g.ancestors(a)) & set(g.ancestors(b))
    lca = min(common, key=lambda c: max(g.ancestors(a)[c], g.ancestors(b)[c])) if common else None
    return {
        "a": a, "b": b,
        "a_only_types": only_a, "b_only_types": only_b,
        "common_ancestor": lca,
        "features": {k: round(v, 3) for k, v in f.items()},
    }


def backtest(nodes, cutoffs, ks=(20, 50, 100), weights=WEIGHTS, seed=0):
    rows = []
    for y in cutoffs:
        g = Graph(nodes, y)
        truth = future_combinations(nodes, y)
        truth &= set(candidates(g))  # 評価対象は「まだ組み合わされていない」候補に限る
        if not truth:
            continue
        ranked = [(a, b) for _, a, b, _ in rank(g, weights)]
        n_cand = len(ranked)
        pop = sorted(ranked, key=lambda p: -min(nodes[p[0]].get("citations") or 0, nodes[p[1]].get("citations") or 0))
        rnd = ranked[:]
        random.Random(seed).shuffle(rnd)
        row = {"cutoff": y, "candidates": n_cand, "positives": len(truth)}
        for k in ks:
            hit = lambda lst: len(set(lst[:k]) & truth)  # noqa: E731
            row[f"P@{k}"] = hit(ranked) / k
            row[f"R@{k}"] = hit(ranked) / len(truth)
            row[f"P@{k}_citations"] = hit(pop) / k
            row[f"P@{k}_random"] = hit(rnd) / k
        rows.append(row)
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=20)
    ap.add_argument("--backtest", action="store_true")
    ap.add_argument("--cutoffs", type=int, nargs="*", default=[2014, 2016, 2018, 2020, 2022, 2023, 2024])
    ap.add_argument("--json", type=Path)
    args = ap.parse_args()
    nodes = load_nodes()
    if args.backtest:
        rows = backtest(nodes, args.cutoffs)
        keys = ["cutoff", "candidates", "positives", "P@20", "P@20_citations", "P@20_random", "P@50", "R@50", "R@100"]
        print(" | ".join(keys))
        for r in rows:
            print(" | ".join(f"{r[k]:.3f}" if isinstance(r[k], float) else str(r[k]) for k in keys))
        avg = lambda k: sum(r[k] for r in rows) / len(rows)  # noqa: E731
        print("平均 | | | " + " | ".join(f"{avg(k):.3f}" for k in keys[3:]))
        return 0
    g = Graph(nodes, max(n["year"] for n in nodes.values()))
    ranked = rank(g)[: args.top]
    out = [explain(g, a, b, f) | {"score": round(s, 3)} for s, a, b, f in ranked]
    for i, o in enumerate(out, 1):
        A, B = nodes[o["a"]], nodes[o["b"]]
        print(f"{i:>2}. {A.get('short_name', A['name'])} × {B.get('short_name', B['name'])}  score={o['score']}  "
              f"共通祖先={o['common_ancestor']}  A固有={','.join(o['a_only_types'])}  B固有={','.join(o['b_only_types'])}")
    if args.json:
        args.json.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
