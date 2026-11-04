"""参考文献URL（data/nodes/*.json の reference）のリンク切れを検出する．

HEAD で確認し，HEAD を受け付けないサイトには GET（先頭のみ）で再確認する．
403/429 は自動アクセスの拒否の可能性があるため WARN 扱い（リンク切れとはみなさない）．

使い方:
  python tools/check_links.py                  # 結果を表示し，リンク切れがあれば終了コード1
  python tools/check_links.py --report out.md  # Markdown のレポートも出力
依存: Python標準ライブラリのみ
"""
import argparse
import json
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UA = "Mozilla/5.0 (compatible; optimizer-map-linkcheck/1.0)"


def check(url: str, timeout: float = 20.0):
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, "Range": "bytes=0-1023"})
            with urllib.request.urlopen(req, timeout=timeout) as res:
                return "ok", res.status
        except urllib.error.HTTPError as e:
            if method == "HEAD" and e.code in (400, 403, 405, 501):
                continue
            if e.code in (401, 403, 429):
                return "warn", e.code
            return "broken", e.code
        except Exception as e:  # noqa: BLE001 - ネットワーク例外は種類を問わず記録する
            if method == "HEAD":
                continue
            return "broken", type(e).__name__
    return "broken", "unknown"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", type=Path)
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()
    nodes = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((ROOT / "data" / "nodes").glob("*.json"))]
    with ThreadPoolExecutor(args.workers) as ex:
        results = list(ex.map(lambda n: (n["id"], n["reference"], *check(n["reference"])), nodes))
    broken = [r for r in results if r[2] == "broken"]
    warns = [r for r in results if r[2] == "warn"]
    for nid, url, st, code in broken:
        print(f"BROKEN {nid}: {code} {url}")
    for nid, url, st, code in warns:
        print(f"WARN   {nid}: {code} {url}")
    print(f"checked={len(results)} broken={len(broken)} warn={len(warns)}")
    if args.report:
        lines = ["# 参考文献リンクの確認結果", "", f"確認数: {len(results)}，リンク切れ: {len(broken)}，要確認: {len(warns)}", ""]
        if broken:
            lines += ["## リンク切れ", "", "| ID | 状態 | URL |", "|---|---|---|"] + [f"| `{a}` | {d} | {b} |" for a, b, c, d in broken] + [""]
        if warns:
            lines += ["## 要確認（自動アクセスの拒否の可能性）", "", "| ID | 状態 | URL |", "|---|---|---|"] + [f"| `{a}` | {d} | {b} |" for a, b, c, d in warns]
        args.report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
