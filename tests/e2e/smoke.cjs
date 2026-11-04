// Optimizer Map の E2E スモークテスト（Playwright）
//
// - site/ を内蔵の静的サーバーで配信し，CDN（jsdelivr）の d3・katex は node_modules の同一バージョンに差し替える．
//   そのため外部ネットワークなしで実行でき，CI でも結果が安定する．
// - 前提: npm ci，python tools/build_graph.py，node tools/precompute_layout.mjs を実行済みであること．
//
// 使い方: node tests/e2e/smoke.cjs        （失敗があれば終了コード1）
//         SCREENSHOTS=dir node tests/e2e/smoke.cjs  （各テストの画面を保存）
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium, devices } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const SITE = path.join(ROOT, "site");
const NM = path.join(ROOT, "node_modules");
const SHOTS = process.env.SCREENSHOTS;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(SITE, url === "/" ? "index.html" : url);
    if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function newContext(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...opts });
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/(d3|katex)@[^/]+\/(.*)$/, (route) => {
    const m = route.request().url().match(/npm\/(d3|katex)@[^/]+\/(.*)$/);
    route.fulfill({ path: path.join(NM, m[1], m[2]) });
  });
  return ctx;
}

async function main() {
  const graph = JSON.parse(fs.readFileSync(path.join(SITE, "data", "graph.json"), "utf-8"));
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const results = [];
  const test = async (name, fn, ctxOpts) => {
    const ctx = await newContext(browser, ctxOpts);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    try {
      await fn(page);
      assert.deepEqual(errors, [], "コンソールエラー");
      results.push([name, "ok"]);
    } catch (e) {
      results.push([name, `FAIL: ${e.message.split("\n")[0]}`]);
    } finally {
      if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${name.replace(/[^\w-]+/g, "_")}.png`) }).catch(() => {}); }
      await ctx.close();
    }
  };
  const open = async (page, hash = "") => { await page.goto(base + hash, { waitUntil: "networkidle" }); await page.waitForTimeout(300); };
  const visibleNodeIds = (page) => page.evaluate(() => [...document.querySelectorAll(".node")].filter((n) => n.style.display !== "none").map((n) => n.__data__.id));

  await test("load", async (p) => {
    await open(p);
    assert.equal(await p.locator(".node").count(), graph.nodes.length);
    assert.equal(await p.locator("path.edge").count(), graph.edges.length);
    assert.equal(await p.locator(".region").count(), graph.groups.length);
    assert.equal((await p.textContent("#status")).trim(), "");
  });

  await test("panel-and-links", async (p) => {
    await open(p, "#adam");
    await p.waitForSelector("#panel:not([hidden])");
    assert.match(await p.textContent("#panel h2"), /Adam/);
    assert.ok((await p.locator("#panel .katex").count()) > 0, "KaTeX で更新式が描画される");
    assert.ok((await p.locator("#panel .link-btn").count()) >= 3, "論文リンク");
    assert.ok((await p.locator("#panel .deep-dive").count()) === 1, "解説");
    assert.ok((await p.textContent("#panel")).includes("実用情報"));
  });

  await test("pattern-highlight", async (p) => {
    await open(p);
    await p.selectOption("#pattern-select", "momentum");
    const expected = graph.edges.filter((e) => e.types.includes("momentum")).length;
    assert.equal(await p.locator("path.edge.is-pattern").count(), expected);
    assert.ok((await p.locator("g.badge").count()) > 0, "略号のバッジ");
  });

  await test("matrix-and-idea", async (p) => {
    await open(p);
    await p.click("#btn-matrix");
    assert.equal(await p.locator("table.matrix tbody tr").count(), graph.improvement_types.length);
    await p.locator("button.idea-cell").first().click();
    await p.waitForSelector(".idea-box");
    assert.ok((await p.locator(".idea-box li").count()) > 0);
  });

  await test("compare-and-path", async (p) => {
    await open(p, "#adam");
    await p.click("text=比較に追加");
    await p.evaluate(() => { location.hash = "#muon"; });
    await p.waitForTimeout(300);
    await p.click("text=比較に追加");
    await p.click("#btn-compare");
    await p.waitForSelector(".relation .path-chain");
    await p.click("text=マップで経路を表示");
    await p.mouse.move(1, 899);
    await p.waitForTimeout(300);
    const active = await p.locator("path.edge.is-active").count();
    assert.ok(active >= 1, "経路のエッジが強調される");
  });

  await test("year-slider", async (p) => {
    await open(p);
    await p.evaluate(() => {
      const s = document.getElementById("year-slider");
      s.value = String(Number(s.max) - 12);
      s.dispatchEvent(new Event("input"));
    });
    const limit = Number((await p.textContent("#year-out")).match(/\d{4}/)[0]);
    const years = new Map(graph.nodes.map((n) => [n.id, n.year]));
    const vis = await visibleNodeIds(p);
    assert.ok(vis.length > 0 && vis.every((id) => years.get(id) <= limit), "指定年以前の手法のみ表示");
  });

  await test("filters", async (p) => {
    await open(p);
    await p.click("#filter-menu summary");
    await p.check('#filter-body input[value="compressed"]');
    const states = new Map(graph.nodes.map((n) => [n.id, n.practical?.state]));
    const vis = await visibleNodeIds(p);
    assert.equal(vis.length, graph.nodes.filter((n) => n.practical?.state === "compressed").length);
    assert.ok(vis.every((id) => states.get(id) === "compressed"));
  });

  await test("trend", async (p) => {
    await open(p);
    await p.click("#btn-trend");
    assert.equal(await p.locator(".trend-card").count(), graph.groups.length);
    await p.click("text=改良パターンごとの改良の本数");
    assert.equal(await p.locator(".trend-card").count(), graph.improvement_types.length);
  });

  await test("table-and-layout", async (p) => {
    await open(p);
    await p.click("#btn-table");
    assert.equal(await p.locator(".table-view tbody tr").count(), graph.nodes.length);
    await p.click("#btn-table");
    await p.click("#btn-layout");
    await p.waitForTimeout(900);
    assert.equal(await p.locator(".group-header").count(), graph.groups.length);
  });

  await test("export", async (p) => {
    await open(p, "#adam");
    const grab = async (label) => {
      await p.click("#export-menu summary");
      const [dl] = await Promise.all([p.waitForEvent("download"), p.click(`#export-body >> text=${label}`)]);
      return fs.readFileSync(await dl.path(), "utf-8");
    };
    assert.match(await grab("BibTeX（.bib）"), /@misc\{adam,/);
    assert.match(await grab("CSV（.csv）"), /^﻿id,name/);
    assert.match(await grab("マップの画像（SVG）"), /^<svg/);
  });

  await test("mobile", async (p) => {
    await open(p, "#sam");
    await p.waitForSelector("#panel:not([hidden])");
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth), await p.evaluate(() => window.innerWidth), "横スクロールが生じない");
  }, { ...devices["iPhone 13"], acceptDownloads: false });

  await browser.close();
  server.close();
  let failed = 0;
  for (const [name, r] of results) { console.log(`${r === "ok" ? "PASS" : "FAIL"}  ${name}${r === "ok" ? "" : `  ${r}`}`); if (r !== "ok") failed++; }
  console.log(`${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
