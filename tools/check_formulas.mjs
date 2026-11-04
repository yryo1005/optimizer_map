// data/nodes/*.json の更新式（update_rule）が KaTeX で描画できるかを検証する．
// 使い方: node tools/check_formulas.mjs
import katex from "katex";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "data", "nodes");
let bad = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const n = JSON.parse(readFileSync(path.join(dir, f), "utf-8"));
  try {
    katex.renderToString(n.update_rule, { displayMode: true, throwOnError: true, strict: "ignore" });
  } catch (e) {
    bad++;
    console.log(`ERROR ${f}: ${e.message}`);
  }
}
console.log(`formulas checked, errors=${bad}`);
process.exit(bad ? 1 : 0);
