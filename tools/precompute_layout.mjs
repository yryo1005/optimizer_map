// site/data/graph.json に配置（領域・列の2種）を事前計算して埋め込む．
// ブラウザでの力学計算・等高線計算を省き，初期表示を速くするため．
//
// 使い方: node tools/precompute_layout.mjs [graph.json]
// 前提:   python tools/build_graph.py で graph.json を生成済みであること．
import * as d3 from "d3";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { computeLayout } from "../site/assets/layout.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2] || path.join(root, "site", "data", "graph.json");
const graph = JSON.parse(readFileSync(file, "utf-8"));
const t0 = Date.now();
graph.layouts = {
  regions: computeLayout(graph, "regions", d3),
  columns: computeLayout(graph, "columns", d3),
};
writeFileSync(file, JSON.stringify(graph));
console.log(`precomputed layouts in ${Date.now() - t0} ms -> ${file}`);
