// Optimizer Map — 最適化手法の系譜グラフ
//
// データ: data/graph.json（tools/build_graph.py が生成し，tools/precompute_layout.mjs が配置を埋め込む）
// 依存:   d3 v7（グローバル d3），KaTeX（グローバル katex），./layout.js（配置計算）
//
// 表示の方針
//   縦軸:   発表年（古いものを上）．存在する年ごとに横帯を割り当てる．
//   横軸:   領域配置（既定: 全所属グループの間に置き，グループの範囲を等高線で囲う）／列配置（主分野の列）．
//   大きさ: Citation数の対数．色: 主分野のグループ．複数グループは外周リング．
//   改良パターン: エッジの types で同じ改良をマップ全体で強調し，パターン表で未適用の組み合わせを示す．
//   比較・経路: 2〜3手法を並べて比較し，手法間の系譜の経路（改良の積み重ね）を表示する．
//   年スライダー: 指定した年までの手法だけを表示し，マップが育つ様子を再生する．

import { computeLayout, LAYOUT_CONFIG, makeRadiusScale } from "./layout.js";

const d3 = window.d3;
const katex = window.katex;

const CONFIG = {
  dataUrl: "data/graph.json",
  labelTopN: 45,
  zoomLabelK: 1.6,
  labelFont: '11px system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif',
  badgeMaxEdges: 200,
  compareMax: 3,
  playIntervalMs: 350,
  eras: [
    { label: "〜1999", from: -Infinity, to: 1999 },
    { label: "2000–09", from: 2000, to: 2009 },
    { label: "2010–14", from: 2010, to: 2014 },
    { label: "2015–19", from: 2015, to: 2019 },
    { label: "2020–22", from: 2020, to: 2022 },
    { label: "2023–", from: 2023, to: Infinity },
  ],
  seqLight: ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95"],
  seqDark: ["#0d366b", "#104281", "#184f95", "#256abf", "#3987e5", "#6da7ec"],
};

const state = {
  graph: null,
  byId: new Map(),
  parents: new Map(),   // id -> [{node, edge}]
  children: new Map(),  // id -> [{node, edge}]
  typeById: new Map(),
  layouts: {},
  layout: null,
  hiddenGroups: new Set(),
  selectedId: null,
  hoverId: null,
  pattern: null,
  patternGroup: null,
  patternEra: null,
  path: null,             // { nodes:Set, edges:Set(edgeKey), label }
  emphGroup: null,
  layoutMode: "regions",
  view: "graph",          // graph | table | matrix | compare
  matrixAxis: "group",
  idea: null,             // { type, group }
  compare: [],
  yearMax: Infinity,
  filters: { state: new Set(), implementations: new Set(), tasks: new Set() },
  trendMetric: "groups",  // groups | patterns
  playing: null,
  tableSort: { key: "year", dir: 1 },
  themeMode: "auto",
  transform: d3.zoomIdentity,
};

const $ = (id) => document.getElementById(id);
const els = {
  graph: $("graph"), table: $("table-view"), matrix: $("matrix-view"), compare: $("compare-view"),
  tooltip: $("tooltip"), panel: $("panel"), panelBody: $("panel-body"), status: $("status"),
  search: $("search-input"), searchList: $("search-list"), groupLegend: $("group-legend"), sizeLegend: $("size-legend"),
  patternSelect: $("pattern-select"), note: $("focus-note"),
  yearSlider: $("year-slider"), yearOut: $("year-out"), btnPlay: $("btn-play"),
  trend: $("trend-view"), filterMenu: $("filter-menu"), filterBody: $("filter-body"),
  exportMenu: $("export-menu"), exportBody: $("export-body"),
};

let svg, root, zoom, rScale;
let nodeSel, edgeSel, edgeHitSel, regionSel, regionLabelSel, badgeLayer, columnLayer, axisLayer, yearClipRect;

// ================================================================ utilities

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) if (c != null) e.append(c);
  return e;
}

const fmtInt = new Intl.NumberFormat("ja-JP");
const fmtCitations = (c) => (c == null ? "不明" : fmtInt.format(c));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : null);
const groupOf = (id) => state.graph.groups.find((g) => g.id === id);
const groupColor = (gid) => `var(--g-${gid})`;
const edgeKey = (e) => `${e.source}>${e.target}`;
const isDark = () => state.themeMode === "dark" || (state.themeMode === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
const eraOf = (year) => CONFIG.eras.findIndex((r) => year >= r.from && year <= r.to);
const sortedGroups = () => [...state.graph.groups].sort((a, b) => a.order - b.order);
const firstSentence = (s) => (s.split("．")[0] || s) + "．";

const measureCtx = document.createElement("canvas").getContext("2d");
const textWidthCache = new Map();
function textWidth(s) {
  if (!textWidthCache.has(s)) { measureCtx.font = CONFIG.labelFont; textWidthCache.set(s, measureCtx.measureText(s).width); }
  return textWidthCache.get(s);
}

function splitFormula(tex) {
  const parts = [];
  let depth = 0, env = 0, start = 0;
  for (let i = 0; i < tex.length; i++) {
    const ch = tex[i];
    if (ch === "\\") {
      if (tex.startsWith("\\begin{", i)) env++;
      else if (tex.startsWith("\\end{", i)) env--;
      else if (depth === 0 && env === 0 && tex.startsWith("\\quad", i) && !/[a-zA-Z]/.test(tex[i + 5] || "")) {
        const before = tex.slice(start, i).replace(/,\s*$/, "");
        if (before.trim()) parts.push(before.trim());
        start = i + 5; i += 4;
        continue;
      }
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
  }
  const rest = tex.slice(start).trim();
  if (rest) parts.push(rest);
  return parts.length ? parts : [tex];
}

function renderFormula(container, tex) {
  const opts = { displayMode: true, throwOnError: true, strict: "ignore" };
  try {
    for (const p of splitFormula(tex)) { const div = el("div"); katex.render(p, div, opts); container.append(div); }
  } catch {
    container.replaceChildren();
    const div = el("div");
    katex.render(tex, div, { ...opts, throwOnError: false });
    container.append(div);
  }
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = el("textarea", { style: "position:fixed;left:-9999px" });
    ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    ta.remove();
  }
  if (btn) { const old = btn.textContent; btn.textContent = "コピーしました"; setTimeout(() => (btn.textContent = old), 1500); }
}

// ================================================================ data

async function loadGraph() {
  const res = await fetch(CONFIG.dataUrl);
  if (!res.ok) throw new Error(`${CONFIG.dataUrl}: HTTP ${res.status}`);
  return res.json();
}

function indexGraph(graph) {
  state.graph = graph;
  const catGroup = new Map(graph.categories.map((c) => [c.id, c.group]));
  for (const t of graph.improvement_types || []) state.typeById.set(t.id, t);
  for (const n of graph.nodes) {
    n.groups = [...new Set(n.categories.map((c) => catGroup.get(c)))];
    n.links = n.links || { paper: n.reference };
    state.byId.set(n.id, n);
    state.parents.set(n.id, []);
    state.children.set(n.id, []);
  }
  for (const e of graph.edges) {
    e.types = e.types || [];
    state.parents.get(e.target).push({ node: state.byId.get(e.source), edge: e });
    state.children.get(e.source).push({ node: state.byId.get(e.target), edge: e });
  }
  state.edgeByKey = new Map(graph.edges.map((e) => [edgeKey(e), e]));
  state.years = [...new Set(graph.nodes.map((n) => n.year))].sort((a, b) => a - b);
}

function injectGroupColors(groups) {
  const light = groups.map((g) => `--g-${g.id}: ${g.color.light};`).join(" ");
  const dark = groups.map((g) => `--g-${g.id}: ${g.color.dark};`).join(" ");
  document.head.append(el("style", { text: `:root { ${light} }
@media (prefers-color-scheme: dark) { :root:where(:not([data-theme="light"])) { ${dark} } }
:root[data-theme="dark"] { ${dark} }` }));
}

/** 事前計算済みの配置があれば使い，なければブラウザで計算する． */
function getLayout(mode) {
  if (!state.layouts[mode]) state.layouts[mode] = state.graph.layouts?.[mode] || computeLayout(state.graph, mode, d3);
  return state.layouts[mode];
}

// ================================================================ render

function edgePath(e) {
  const s = state.byId.get(e.source), t = state.byId.get(e.target);
  const dx = t.x - s.x, dy = t.y - s.y;
  const len = Math.hypot(dx, dy) || 1;
  if (Math.abs(dy) < 6) {
    const x1 = s.x + (dx / len) * s.r, y1 = s.y, x2 = t.x - (dx / len) * (t.r + 4), y2 = t.y;
    const bend = Math.min(40, Math.abs(dx) * 0.3);
    return `M${x1},${y1} C${x1},${y1 - bend} ${x2},${y2 - bend} ${x2},${y2}`;
  }
  const sign = Math.sign(dy);
  const x1 = s.x, y1 = s.y + sign * s.r, x2 = t.x, y2 = t.y - sign * (t.r + 4);
  const my = (y2 - y1) * 0.5;
  return `M${x1},${y1} C${x1},${y1 + my} ${x2},${y2 - my} ${x2},${y2}`;
}

function setupSvg() {
  svg = d3.select(els.graph).append("svg").attr("role", "img")
    .attr("aria-label", "最適化手法の系譜グラフ（ノード: 手法，矢印: 改善の方向）");
  const defs = svg.append("defs");
  for (const [id, cls] of [["arrow", "arrow-head"], ["arrow-active", "arrow-head-active"]]) {
    defs.append("marker").attr("id", id).attr("viewBox", "0 0 10 10").attr("refX", 6).attr("refY", 5)
      .attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M0,0 L10,5 L0,10 z").attr("class", cls);
  }
  yearClipRect = defs.append("clipPath").attr("id", "year-clip").append("rect").attr("x", -1e5).attr("y", -1e5).attr("width", 2e5).attr("height", 2e5);
  root = svg.append("g").attr("class", "viewport");
  axisLayer = root.append("g").attr("class", "year-axis");
  root.append("g").attr("class", "regions").attr("clip-path", "url(#year-clip)");
  columnLayer = root.append("g").attr("class", "group-heads");
  const edgeLayer = root.append("g").attr("class", "edges");
  root.append("g").attr("class", "edge-hits");
  root.append("g").attr("class", "nodes");
  badgeLayer = root.append("g").attr("class", "badges");
  root.append("g").attr("class", "region-labels");

  const edges = state.graph.edges;
  edgeSel = edgeLayer.selectAll("path.edge").data(edges, edgeKey).join("path").attr("class", "edge").attr("marker-end", "url(#arrow)");
  edgeHitSel = root.select(".edge-hits").selectAll("path").data(edges, edgeKey).join("path").attr("class", "edge-hit")
    .on("pointermove", (ev, e) => showEdgeTooltip(ev, e))
    .on("pointerleave", hideTooltip);

  nodeSel = root.select(".nodes").selectAll("g.node").data(state.graph.nodes, (n) => n.id).join("g")
    .attr("class", (n) => `node${n.citations == null ? " is-unknown-citation" : ""}`)
    .on("pointerenter", (ev, n) => { state.hoverId = n.id; applyFocus(); })
    .on("pointermove", (ev, n) => showNodeTooltip(ev, n))
    .on("pointerleave", () => { state.hoverId = null; hideTooltip(); applyFocus(); })
    .on("click", (ev, n) => { ev.stopPropagation(); select(n.id); });
  nodeSel.append("circle").attr("class", "hit");
  nodeSel.append("g").attr("class", "ring");
  nodeSel.append("circle").attr("class", "body").style("fill", (n) => groupColor(n.group));
  nodeSel.append("text").attr("y", 4).text((n) => n.short_name);
  nodeSel.append("title").text((n) => `${n.name}（${n.year}）`);

  let raf = 0;
  zoom = d3.zoom().scaleExtent([0.1, 6]).on("zoom", (ev) => {
    root.attr("transform", ev.transform);
    state.transform = ev.transform;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateLabels);
  });
  svg.call(zoom).on("dblclick.zoom", null);
  svg.on("click", () => { select(null); });
}

function renderLayout(layout, animate = false) {
  state.layout = layout;
  for (const n of state.graph.nodes) Object.assign(n, layout.positions[n.id]);
  const T = (sel) => (animate ? sel.transition().duration(700) : sel);

  axisLayer.selectAll("*").remove();
  layout.rows.forEach((r, i) => {
    if (i % 2 === 0) axisLayer.append("rect").attr("class", "year-band").attr("x", 0).attr("y", r.y0).attr("width", layout.totalWidth).attr("height", r.h);
    axisLayer.append("text").attr("class", "year-label").attr("x", LAYOUT_CONFIG.axisWidth - 10).attr("y", r.cy + 4).attr("text-anchor", "end").text(r.year);
  });

  columnLayer.selectAll("*").remove();
  if (layout.mode === "columns") {
    for (const col of layout.columns) {
      columnLayer.append("line").attr("class", "group-divider").attr("x1", col.x0).attr("x2", col.x0).attr("y1", LAYOUT_CONFIG.header - 8).attr("y2", layout.totalHeight);
      const t = columnLayer.append("text").attr("class", "group-header").attr("x", col.cx).attr("y", LAYOUT_CONFIG.header - 30).attr("text-anchor", "middle");
      const label = col.label;
      const cut = label.length > 12 ? label.lastIndexOf("・", Math.ceil(label.length / 2) + 2) : -1;
      if (cut > 0) {
        t.append("tspan").attr("x", col.cx).attr("dy", 0).text(label.slice(0, cut + 1));
        t.append("tspan").attr("x", col.cx).attr("dy", 14).text(label.slice(cut + 1));
      } else t.text(label);
      columnLayer.append("rect").attr("x", col.cx - 14).attr("y", LAYOUT_CONFIG.header - 50).attr("width", 28).attr("height", 4).attr("rx", 2).style("fill", groupColor(col.id));
    }
  }

  const path = d3.geoPath(d3.geoIdentity().scale(LAYOUT_CONFIG.region.cell));
  regionSel = root.select(".regions").selectAll("path.region").data(layout.regions, (r) => r.gid).join("path")
    .attr("class", "region").attr("d", (r) => path(r.contour))
    .style("fill", (r) => groupColor(r.gid)).style("stroke", (r) => groupColor(r.gid));
  regionLabelSel = root.select(".region-labels").selectAll("g.region-label").data(layout.regions, (r) => r.gid).join((enter) => {
    const g = enter.append("g").attr("class", "region-label");
    g.append("rect").attr("class", "key").attr("width", 14).attr("height", 4).attr("rx", 2).attr("y", -5);
    g.append("text").attr("x", 18);
    return g;
  });
  regionLabelSel.attr("transform", (r) => `translate(${r.label.x - 30},${r.label.y})`);
  regionLabelSel.select("rect").style("fill", (r) => groupColor(r.gid));
  regionLabelSel.select("text").text((r) => groupOf(r.gid).label);

  // 半径に依存する要素（リング・当たり判定・ラベル位置）
  const arc = d3.arc();
  nodeSel.select("circle.hit").attr("r", (n) => Math.max(12, n.r + 4));
  nodeSel.select("circle.body").attr("r", (n) => n.r);
  nodeSel.select("text").attr("x", (n) => n.r + (n.groups.length > 1 ? 7 : 4));
  nodeSel.select("g.ring").selectAll("path")
    .data((n) => (n.groups.length > 1 ? n.groups.map((g, i) => ({ g, i, k: n.groups.length, r: n.r })) : []))
    .join("path")
    .attr("d", (d) => arc({ innerRadius: d.r + 2, outerRadius: d.r + 5, startAngle: (2 * Math.PI * d.i) / d.k, endAngle: (2 * Math.PI * (d.i + 1)) / d.k, padAngle: 0.08 }))
    .style("fill", (d) => groupColor(d.g));

  T(nodeSel).attr("transform", (n) => `translate(${n.x},${n.y})`);
  T(edgeSel).attr("d", edgePath);
  edgeHitSel.attr("d", edgePath);
  applyVisibility(false);
  applyFocus();
}

function fitView(animate = true, nodes = null) {
  const box = els.graph.getBoundingClientRect();
  if (!box.width || !box.height) return;
  let bb;
  if (nodes && nodes.length) {
    const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y), pad = 90;
    bb = { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, width: Math.max(...xs) - Math.min(...xs) + 2 * pad + 120, height: Math.max(...ys) - Math.min(...ys) + 2 * pad };
  } else if (Number.isFinite(state.yearMax) || state.hiddenGroups.size || Object.values(state.filters).some((f) => f.size)) {
    // 年・グループ・実用情報で絞り込み中は，表示中の手法の範囲に合わせる
    return fitView(animate, state.graph.nodes.filter((n) => isVisible(n.id)));
  } else {
    bb = root.node().getBBox();
  }
  if (!bb.width) return;
  const m = 16;
  const k = Math.min((box.width - 2 * m) / bb.width, (box.height - 2 * m) / bb.height, nodes ? 2.2 : Infinity);
  const t = d3.zoomIdentity.translate((box.width - bb.width * k) / 2 - bb.x * k, Math.max(m, (box.height - bb.height * k) / 2) - bb.y * k).scale(k);
  (animate ? svg.transition().duration(500) : svg).call(zoom.transform, t);
}

function zoomTo(n) {
  const box = els.graph.getBoundingClientRect();
  const k = Math.max(d3.zoomTransform(svg.node()).k, 1.3);
  let visibleH = box.height;
  if (!els.panel.hidden) {
    const pr = els.panel.getBoundingClientRect();
    if (pr.top > box.top && pr.top < box.bottom && pr.left <= box.left + 1) visibleH = pr.top - box.top;
  }
  svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity.translate(box.width / 2 - n.x * k, visibleH / 2 - n.y * k).scale(k));
}

// ================================================================ labels & badges（重なりの解消）

/**
 * 表示するラベルを優先度順に貪欲に選び，画面上で重なるものは表示しない．
 * 優先度: 選択中 > 強調中（ホバー・経路・系譜・パターン）> Citation数．
 * 倍率が低いときは上位 labelTopN 件と強調中の手法だけを候補にする．
 */
function updateLabels() {
  if (!nodeSel) return;
  const t = state.transform, k = t.k;
  const focus = els.graph.classList.contains("has-focus");
  const zoomed = k >= CONFIG.zoomLabelK;
  const rank = state.citationRank;
  const cands = [], circles = [];
  nodeSel.each(function (n) {
    if (!isVisible(n.id)) return;
    const cr = (n.r + (n.groups.length > 1 ? 5 : 0)) * k;
    circles.push({ id: n.id, x0: t.applyX(n.x) - cr, y0: t.applyY(n.y) - cr, x1: t.applyX(n.x) + cr, y1: t.applyY(n.y) + cr });
    const related = this.classList.contains("is-related");
    const selected = n.id === state.selectedId;
    if (!selected && !(focus ? related : (zoomed || rank.get(n.id) < CONFIG.labelTopN))) return;
    const pri = (selected ? 1e7 : 0) + (related ? 1e6 : 0) + (n.citations ?? 0);
    const x = t.applyX(n.x + n.r + (n.groups.length > 1 ? 7 : 4)), y = t.applyY(n.y);
    const w = textWidth(n.short_name) * k, h = 13 * k;
    cands.push({ n, pri, box: [x, y - h / 2, x + w, y + h / 2], circle: [t.applyX(n.x), t.applyY(n.y), n.r * k] });
  });
  cands.sort((a, b) => b.pri - a.pri);
  const placed = [], on = new Set();
  const box = els.graph.getBoundingClientRect();
  for (const c of cands) {
    const [x0, y0, x1, y1] = c.box;
    if (x1 < 0 || x0 > box.width || y1 < 0 || y0 > box.height) continue;
    if (placed.some((p) => x0 < p[2] && x1 > p[0] && y0 < p[3] && y1 > p[1])) continue;
    // 他の手法の円に重なるラベルも出さない（選択中の手法は例外）
    if (c.n.id !== state.selectedId && circles.some((o) => o.id !== c.n.id && x0 < o.x1 && x1 > o.x0 && y0 < o.y1 && y1 > o.y0)) continue;
    placed.push(c.box);
    on.add(c.n.id);
  }
  nodeSel.classed("label-on", (n) => on.has(n.id));
}

/** 強調中のエッジの中点に改良パターンの略号を表示する（重なるものは省略）． */
function renderBadges(edges) {
  const visible = edges.filter((e) => isVisible(e.source) && isVisible(e.target));
  const paths = new Map();
  edgeSel.each(function (e) { paths.set(edgeKey(e), this); });
  const items = [];
  if (visible.length <= CONFIG.badgeMaxEdges) {
    const placed = [];
    const sorted = [...visible].sort((a, b) => (state.byId.get(b.target).citations ?? 0) - (state.byId.get(a.target).citations ?? 0));
    for (const e of sorted) {
      const p = paths.get(edgeKey(e));
      const len = p.getTotalLength();
      const label = e.types.map((t) => state.typeById.get(t)?.badge ?? t).join("·");
      const w = label.length * 6.4 + 6, h = 13;
      // 中点から少しずつずらして空いている位置を探す
      let pos = null;
      for (const f of [0.5, 0.4, 0.6, 0.3, 0.7]) {
        const pt = p.getPointAtLength(len * f);
        const b = [pt.x - w / 2 - 1, pt.y - h / 2 - 1, pt.x + w / 2 + 1, pt.y + h / 2 + 1];
        if (!placed.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1])) { pos = pt; placed.push(b); break; }
      }
      if (pos) items.push({ e, x: pos.x, y: pos.y, label, w });
    }
  }
  const sel = badgeLayer.selectAll("g.badge").data(items, (d) => edgeKey(d.e)).join((enter) => {
    const g = enter.append("g").attr("class", "badge");
    g.append("rect").attr("rx", 3).attr("height", 13).attr("y", -7);
    g.append("text").attr("y", 3);
    return g;
  });
  sel.attr("transform", (d) => `translate(${d.x},${d.y})`);
  sel.select("text").text((d) => d.label);
  sel.select("rect").attr("x", (d) => -d.w / 2).attr("width", (d) => d.w);
}

// ================================================================ focus, pattern, path & selection

function lineage(id) {
  const anc = new Set(), desc = new Set();
  const walk = (start, map, out) => {
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop();
      for (const { node } of map.get(cur)) if (!out.has(node.id)) { out.add(node.id); stack.push(node.id); }
    }
  };
  walk(id, state.parents, anc);
  walk(id, state.children, desc);
  return { anc, desc };
}

function patternMatches(e) {
  if (!state.pattern || !e.types.includes(state.pattern)) return false;
  const t = state.byId.get(e.target);
  if (state.patternGroup && t.group !== state.patternGroup) return false;
  if (state.patternEra != null && eraOf(t.year) !== state.patternEra) return false;
  return true;
}

/** 強調の優先順位: ホバー > 経路 > 選択 > 改良パターン． */
function applyFocus() {
  let related = null, activeEdge = null;
  if (state.hoverId) {
    const id = state.hoverId;
    related = new Set([id, ...state.parents.get(id).map((p) => p.node.id), ...state.children.get(id).map((c) => c.node.id)]);
    activeEdge = (e) => e.source === id || e.target === id;
  } else if (state.path) {
    related = state.path.nodes;
    activeEdge = (e) => state.path.edges.has(edgeKey(e));
  } else if (state.selectedId) {
    const id = state.selectedId;
    const { anc, desc } = lineage(id);
    const up = new Set([id, ...anc]), down = new Set([id, ...desc]);
    related = new Set([...up, ...down]);
    activeEdge = (e) => (up.has(e.source) && up.has(e.target)) || (down.has(e.source) && down.has(e.target));
  } else if (state.pattern) {
    related = new Set();
    for (const e of state.graph.edges) if (patternMatches(e)) { related.add(e.source); related.add(e.target); }
    activeEdge = patternMatches;
  }
  els.graph.classList.toggle("has-focus", !!related);
  nodeSel.classed("is-related", (n) => !!related && related.has(n.id));
  nodeSel.classed("is-selected", (n) => n.id === state.selectedId);
  edgeSel.classed("is-active", (e) => !!activeEdge && activeEdge(e))
    .classed("is-pattern", (e) => !state.hoverId && !state.path && !state.selectedId && !!state.pattern && patternMatches(e))
    .attr("marker-end", (e) => (activeEdge && activeEdge(e) ? "url(#arrow-active)" : "url(#arrow)"));
  renderBadges(activeEdge ? state.graph.edges.filter(activeEdge) : []);
  applyRegionEmphasis();
  updateLabels();
}

function applyRegionEmphasis() {
  if (!regionSel) return;
  const emph = state.emphGroup;
  regionSel.classed("is-emph", (r) => r.gid === emph).classed("is-dim", (r) => !!emph && r.gid !== emph);
  regionLabelSel.classed("is-dim", (r) => !!emph && r.gid !== emph);
}

function select(id, { zoomToNode = false, updateHash = true } = {}) {
  state.selectedId = id;
  if (id && state.path && !state.path.nodes.has(id)) state.path = null;
  applyFocus();
  updateNote();
  if (id) {
    renderPanel(state.byId.get(id));
    if (zoomToNode && state.view !== "graph") setView("graph");
    if (zoomToNode) zoomTo(state.byId.get(id));
  } else {
    els.panel.hidden = true;
  }
  if (updateHash) history.replaceState(null, "", id ? `#${encodeURIComponent(id)}` : location.pathname + location.search);
}

function setPattern(typeId, { group = null, era = null } = {}) {
  state.pattern = typeId || null;
  state.patternGroup = typeId ? group : null;
  state.patternEra = typeId ? era : null;
  els.patternSelect.value = state.pattern || "";
  if (state.selectedId) select(null);
  state.path = null;
  applyFocus();
  updateNote();
  if (state.view === "matrix") renderMatrix();
}

function setPath(path) {
  state.path = path;
  if (path) { state.selectedId = null; els.panel.hidden = true; }
  applyFocus();
  updateNote();
}

/** 凡例の下の1行: 現在の強調（経路・改良パターン）の説明と解除ボタン． */
function updateNote() {
  const parts = [];
  if (state.path) {
    parts.push(el("span", { text: `経路: ${state.path.label}` }), el("button", { type: "button", class: "note-clear", text: "経路を解除", onclick: () => setPath(null) }));
  }
  if (state.pattern) {
    const t = state.typeById.get(state.pattern);
    const n = state.graph.edges.filter(patternMatches).length;
    const scope = [state.patternGroup && groupOf(state.patternGroup).label, state.patternEra != null && CONFIG.eras[state.patternEra].label].filter(Boolean).join("・");
    parts.push(el("span", { text: `改良パターン［${t.badge}］${t.label}${scope ? `（${scope}）` : ""}: ${n}本 — ${t.description}` }),
      el("button", { type: "button", class: "note-clear", text: "解除", onclick: () => setPattern(null) }));
  }
  els.note.replaceChildren(...parts);
  els.note.hidden = parts.length === 0;
}

// ================================================================ tooltip

function placeTooltip(ev) {
  const box = els.graph.parentElement.getBoundingClientRect();
  const tt = els.tooltip;
  let x = ev.clientX - box.left + 14, y = ev.clientY - box.top + 14;
  if (x + tt.offsetWidth > box.width - 8) x = ev.clientX - box.left - tt.offsetWidth - 14;
  if (y + tt.offsetHeight > box.height - 8) y = ev.clientY - box.top - tt.offsetHeight - 14;
  tt.style.left = `${x}px`;
  tt.style.top = `${y}px`;
}

function showNodeTooltip(ev, n) {
  const rows = [el("div", { class: "tt-title", text: n.short_name }),
    el("div", { text: `Citation数: ${fmtCitations(n.citations)}（${n.citations_source || "概算"}）` }),
    el("div", { text: `${n.year}年 · ${n.categories.join("，")}` })];
  for (const g of n.groups) rows.push(el("div", {}, el("span", { class: "tt-key", style: `background:${groupColor(g)}` }), document.createTextNode(groupOf(g).label)));
  els.tooltip.replaceChildren(...rows);
  els.tooltip.hidden = false;
  placeTooltip(ev);
}

function typeChips(types) {
  const wrap = el("span", { class: "type-chips" });
  for (const t of types) {
    const def = state.typeById.get(t);
    if (def) wrap.append(el("span", { class: "type-chip", title: def.description, text: `${def.badge} ${def.label}` }));
  }
  return wrap;
}

function showEdgeTooltip(ev, e) {
  const s = state.byId.get(e.source), t = state.byId.get(e.target);
  els.tooltip.replaceChildren(el("div", { class: "tt-title", text: `${s.short_name} → ${t.short_name}` }), typeChips(e.types), el("div", { text: e.improvement }));
  els.tooltip.hidden = false;
  placeTooltip(ev);
}

function hideTooltip() { els.tooltip.hidden = true; }

// ================================================================ detail panel（共通フォーマット）

function linkButtons(n) {
  const L = n.links || {};
  const defs = [["paper", "論文ページ"], ["pdf", "PDF"], ["scholar", "Google Scholar"], ["semantic_scholar", "Semantic Scholar"]];
  const wrap = el("div", { class: "link-buttons" });
  for (const [k, label] of defs) {
    const u = safeUrl(L[k]);
    if (u) wrap.append(el("a", { class: "link-btn", href: u, target: "_blank", rel: "noopener noreferrer", text: label }));
  }
  return wrap;
}

function relationList(items) {
  if (!items.length) return el("p", { class: "notes", text: "なし" });
  const ul = el("ul", { class: "relations" });
  for (const { node, edge } of [...items].sort((a, b) => a.node.year - b.node.year)) {
    ul.append(el("li", {},
      el("button", { type: "button", text: `${node.short_name}（${node.year}）`, onclick: () => select(node.id, { zoomToNode: true }) }),
      typeChips(edge.types),
      el("span", { class: "improvement", text: edge.improvement })));
  }
  return ul;
}

function groupTags(n) {
  const wrap = el("div", { class: "group-tags" });
  for (const g of n.groups) wrap.append(el("span", { class: "group-tag" }, el("span", { class: "swatch", style: `background:${groupColor(g)}` }), document.createTextNode(groupOf(g).label)));
  return wrap;
}

function metaList(n) {
  const url = safeUrl(n.reference);
  const items = [
    el("dt", { text: "発表年" }), el("dd", { class: "num", text: String(n.year) }),
    el("dt", { text: "Citation数" }), el("dd", { class: "num", text: `${fmtCitations(n.citations)}（${n.citations_source || "概算"}）` }),
    el("dt", { text: "分野タグ" }), el("dd", { text: n.categories.join("，") }),
  ];
  if (n.paper?.title) items.push(el("dt", { text: "論文" }), el("dd", { text: n.paper.title }));
  if (n.paper?.authors?.length) items.push(el("dt", { text: "著者" }), el("dd", { text: n.paper.authors.slice(0, 6).join(", ") + (n.paper.authors.length > 6 ? " ほか" : "") }));
  if (n.paper?.venue) items.push(el("dt", { text: "掲載先" }), el("dd", { text: n.paper.venue }));
  items.push(el("dt", { text: "参考文献" }), el("dd", {}, url ? el("a", { href: url, target: "_blank", rel: "noopener noreferrer", text: url }) : document.createTextNode(n.reference)));
  items.push(el("dt", { text: "ID" }), el("dd", {}, el("code", { text: n.id })));
  return el("dl", {}, ...items);
}

function renderPanel(n) {
  const body = els.panelBody;
  body.replaceChildren();
  const formula = el("div", { class: "formula" });
  const inCompare = state.compare.includes(n.id);
  body.append(
    el("h2", { text: n.name }),
    groupTags(n),
    linkButtons(n),
    el("div", { class: "panel-actions" },
      el("button", { type: "button", text: inCompare ? "比較から外す" : "比較に追加", onclick: () => toggleCompare(n.id) }),
      state.compare.length && !inCompare ? el("span", { class: "notes", text: `比較中: ${state.compare.map((id) => state.byId.get(id).short_name).join("，")}` }) : null),
    metaList(n),
    el("h3", { text: "概要" }), el("p", { text: n.summary }),
    el("h3", { text: "更新式" }), formula,
    el("h3", { text: `派生元と改善内容（${state.parents.get(n.id).length}）` }), relationList(state.parents.get(n.id)),
    el("h3", { text: `派生先（${state.children.get(n.id).length}）` }), relationList(state.children.get(n.id)),
  );
  if (n.practical) body.append(el("h3", { text: "実用情報" }), practicalList(n));
  if (n.deep_dive) body.append(el("h3", { text: "解説" }), deepDive(n));
  if (n.notes) body.append(el("h3", { text: "備考" }), el("p", { class: "notes", text: n.notes }));
  renderFormula(formula, n.update_rule);
  els.panel.hidden = false;
  els.panel.scrollTop = 0;
}

const vocabLabel = (kind, id) => state.graph.practical_vocab?.[kind]?.find((v) => v.id === id)?.label ?? id;

function practicalList(n) {
  const P = n.practical;
  const tags = (kind, ids) => el("span", { class: "practical-tags" }, ...(ids || []).map((v) => el("span", { class: "practical-tag", text: vocabLabel(kind, v) })));
  const stateDesc = state.graph.practical_vocab?.state?.find((v) => v.id === P.state)?.description;
  return el("div", {},
    el("dl", {},
      el("dt", { text: "状態量" }), el("dd", { title: stateDesc || "" , text: `${vocabLabel("state", P.state)}${stateDesc ? `（${stateDesc}）` : ""}` }),
      el("dt", { text: "実装" }), el("dd", {}, P.implementations?.length ? tags("implementations", P.implementations) : document.createTextNode("主要な実装なし（論文の公式実装を参照）")),
      el("dt", { text: "ハイパラ" }), el("dd", { text: (P.hyperparameters || []).join("，") || "—" }),
      el("dt", { text: "主な用途" }), el("dd", {}, tags("tasks", P.tasks))),
    el("p", { class: "notes", text: "実用情報は生成AIによる整理であり，実装の有無やバージョンは各ライブラリの文書で確認すること．" }));
}

function deepDive(n) {
  const D = n.deep_dive;
  const sec = (title, text) => (text ? [el("h4", { text: title }), el("p", { text })] : []);
  return el("div", { class: "deep-dive" }, ...sec("なぜ効くか", D.why), ...sec("弱点・注意点", D.weaknesses), ...sec("典型的な設定", D.settings));
}

// ================================================================ filters

function setupFilters() {
  const V = state.graph.practical_vocab;
  if (!V) { els.filterMenu.hidden = true; return; }
  const counts = (kind) => d3.rollup(state.graph.nodes.flatMap((n) => {
    const P = n.practical || {};
    return kind === "state" ? [P.state] : P[kind] || [];
  }), (v) => v.length, (x) => x);
  const group = (kind, title) => {
    const c = counts(kind);
    return el("fieldset", {}, el("legend", { text: title }), ...V[kind].map((v) => {
      const cb = el("input", { type: "checkbox", value: v.id });
      cb.addEventListener("change", () => { if (cb.checked) state.filters[kind].add(v.id); else state.filters[kind].delete(v.id); onFilterChange(); });
      return el("label", { title: v.description || "" }, cb, document.createTextNode(`${v.label}（${c.get(v.id) || 0}）`));
    }));
  };
  const clear = el("button", { type: "button", text: "すべて解除", onclick: () => {
    for (const k of Object.keys(state.filters)) state.filters[k].clear();
    els.filterBody.querySelectorAll("input[type=checkbox]").forEach((cb) => { cb.checked = false; });
    onFilterChange();
  } });
  els.filterBody.append(group("state", "状態量（メモリ）"), group("implementations", "実装"), group("tasks", "主な用途"),
    el("div", { class: "menu-actions" }, clear), el("p", { class: "hint", text: "同じ項目内は「いずれか」，項目間は「すべて」を満たす手法を表示する．" }));
}

function onFilterChange() {
  const active = Object.values(state.filters).some((f) => f.size);
  const n = state.graph.nodes.filter((x) => isShownIgnoringYear(x)).length;
  els.filterMenu.classList.toggle("is-active", active);
  els.filterMenu.querySelector("summary").textContent = active ? `絞り込み（${n}件）` : "絞り込み";
  applyVisibility();
  if (state.view === "trend") renderTrend();
}

// ================================================================ legend, visibility, year slider

function buildLegend() {
  const counts = d3.rollup(state.graph.nodes.flatMap((n) => n.groups), (v) => v.length, (g) => g);
  for (const g of sortedGroups()) {
    const cats = state.graph.categories.filter((c) => c.group === g.id).map((c) => c.id).join("，");
    const btn = el("button", { type: "button", "aria-pressed": "true", "data-group": g.id, title: `含まれる分野: ${cats}（クリックで表示/非表示）` },
      el("span", { class: "swatch", style: `background:${groupColor(g.id)}` }),
      document.createTextNode(`${g.label}（${counts.get(g.id) || 0}）`));
    btn.addEventListener("click", () => {
      if (state.hiddenGroups.has(g.id)) state.hiddenGroups.delete(g.id); else state.hiddenGroups.add(g.id);
      syncLegend();
      applyVisibility();
    });
    btn.addEventListener("pointerenter", () => { state.emphGroup = g.id; applyRegionEmphasis(); });
    btn.addEventListener("pointerleave", () => { state.emphGroup = null; applyRegionEmphasis(); });
    els.groupLegend.append(el("li", {}, btn));
  }
  const samples = [100, 1000, 10000, 100000];
  const R = LAYOUT_CONFIG.radius;
  const s = d3.create("svg").attr("width", 210).attr("height", 2 * R.max + 4);
  let x = 0;
  const cy = R.max + 2;
  for (const c of samples) {
    const r = rScale(c);
    s.append("circle").attr("cx", x + r).attr("cy", cy).attr("r", r).style("fill", "none").style("stroke", "var(--ink-muted)");
    s.append("text").attr("x", x + r).attr("y", cy + 4).attr("text-anchor", "middle").style("font-size", "9px").style("fill", "var(--ink-2)").text(c >= 1000 ? `${c / 1000}k` : c);
    x += 2 * r + 6;
  }
  s.append("circle").attr("cx", x + R.unknown).attr("cy", cy).attr("r", R.unknown).style("fill", "none").style("stroke", "var(--ink-muted)").style("stroke-dasharray", "2 2");
  els.sizeLegend.append(el("span", { text: "Citation数（対数・等倍時）" }), s.node(), el("span", { text: "破線: 不明 / 外周リング: 複数分野" }));
}

function syncLegend() {
  els.groupLegend.querySelectorAll("button[data-group]").forEach((b) => b.setAttribute("aria-pressed", String(!state.hiddenGroups.has(b.dataset.group))));
}

/** 実用情報による絞り込み（同じ項目内は OR，項目間は AND）． */
function passFilters(n) {
  const F = state.filters, P = n.practical || {};
  if (F.state.size && !F.state.has(P.state)) return false;
  if (F.implementations.size && !(P.implementations || []).some((v) => F.implementations.has(v))) return false;
  if (F.tasks.size && !(P.tasks || []).some((v) => F.tasks.has(v))) return false;
  return true;
}
/** 表示判定（年を除く）: 主分野のグループが表示中，かつ絞り込みに一致． */
const isShownIgnoringYear = (n) => !state.hiddenGroups.has(n.group) && passFilters(n);
/** 表示判定: 上記に加えて年スライダーの年以前． */
const isVisible = (id) => { const n = state.byId.get(id); return isShownIgnoringYear(n) && n.year <= state.yearMax; };

function applyVisibility(refocus = true) {
  nodeSel.style("display", (n) => (isVisible(n.id) ? null : "none"));
  const ev = (e) => (isVisible(e.source) && isVisible(e.target) ? null : "none");
  edgeSel.style("display", ev);
  edgeHitSel.style("display", ev);
  if (regionSel && state.layout) {
    const firstYear = (r) => d3.min(r.members, (id) => state.byId.get(id).year);
    regionSel.style("display", (r) => (state.hiddenGroups.has(r.gid) ? "none" : null));
    // 絞り込み中は範囲が全手法を基に描かれているため薄くする
    const filtering = Object.values(state.filters).some((f) => f.size);
    regionSel.classed("is-filter-dim", filtering);
    regionLabelSel.classed("is-filter-dim", filtering);
    regionLabelSel.style("display", (r) => (state.hiddenGroups.has(r.gid) || firstYear(r) > state.yearMax ? "none" : null));
    const rows = state.layout.rows.filter((r) => r.year <= state.yearMax);
    const yMax = rows.length ? rows[rows.length - 1].y1 : 0;
    yearClipRect.attr("height", Number.isFinite(state.yearMax) ? yMax + 1e5 : 2e5);
  }
  if (state.view === "table") renderTable();
  if (state.selectedId && !isVisible(state.selectedId)) select(null);
  else if (refocus) applyFocus();
}

function setupYearSlider() {
  const years = state.years;
  const s = els.yearSlider;
  s.min = 0; s.max = years.length - 1; s.step = 1; s.value = years.length - 1;
  const apply = () => {
    const y = years[Number(s.value)];
    state.yearMax = Number(s.value) === years.length - 1 ? Infinity : y;
    els.yearOut.textContent = Number.isFinite(state.yearMax) ? `${y}年まで` : "全期間";
    applyVisibility();
  };
  s.addEventListener("input", apply);
  els.btnPlay.addEventListener("click", () => {
    if (state.playing) { clearInterval(state.playing); state.playing = null; els.btnPlay.textContent = "▶ 再生"; return; }
    if (Number(s.value) >= years.length - 1) s.value = 0;
    els.btnPlay.textContent = "■ 停止";
    apply();
    state.playing = setInterval(() => {
      if (Number(s.value) >= years.length - 1) { clearInterval(state.playing); state.playing = null; els.btnPlay.textContent = "▶ 再生"; return; }
      s.value = Number(s.value) + 1;
      apply();
    }, CONFIG.playIntervalMs);
  });
  apply();
}

// ================================================================ search & pattern control

function setupSearch() {
  const options = [...state.graph.nodes].sort((a, b) => a.short_name.localeCompare(b.short_name, "ja"));
  for (const n of options) els.searchList.append(el("option", { value: n.short_name, label: `${n.name}（${n.year}）` }));
  const find = (q) => {
    q = q.trim().toLowerCase();
    if (!q) return null;
    return options.find((n) => n.short_name.toLowerCase() === q || n.id === q)
      || options.find((n) => n.short_name.toLowerCase().includes(q) || n.name.toLowerCase().includes(q));
  };
  const go = () => {
    const n = find(els.search.value);
    if (!n) { els.status.textContent = `「${els.search.value}」に一致する手法はありません`; return; }
    els.status.textContent = "";
    state.hiddenGroups.delete(n.group);
    if (n.year > state.yearMax) { els.yearSlider.value = els.yearSlider.max; els.yearSlider.dispatchEvent(new Event("input")); }
    syncLegend();
    applyVisibility();
    select(n.id, { zoomToNode: true });
  };
  els.search.addEventListener("change", go);
  els.search.addEventListener("keydown", (ev) => { if (ev.key === "Enter") go(); });
}

function setupPatternControl() {
  const counts = d3.rollup(state.graph.edges.flatMap((e) => e.types), (v) => v.length, (t) => t);
  els.patternSelect.append(el("option", { value: "", text: "改良パターン: なし" }));
  for (const t of state.graph.improvement_types) els.patternSelect.append(el("option", { value: t.id, text: `［${t.badge}］${t.label}（${counts.get(t.id) || 0}）` }));
  els.patternSelect.addEventListener("change", () => setPattern(els.patternSelect.value));
}

// ================================================================ table view

function renderTable() {
  const { key, dir } = state.tableSort;
  const rows = state.graph.nodes.filter((n) => isVisible(n.id));
  const stateOrder = (state.graph.practical_vocab?.state || []).map((v) => v.id);
  const val = (n) => (key === "citations" ? n.citations ?? -1 : key === "group" ? groupOf(n.group).order : key === "name" ? n.short_name.toLowerCase()
    : key === "state" ? stateOrder.indexOf(n.practical?.state) : n[key]);
  rows.sort((a, b) => (val(a) < val(b) ? -dir : val(a) > val(b) ? dir : a.year - b.year));
  const cols = [["name", "手法"], ["year", "発表年"], ["group", "分野"], ["citations", "Citation数"], ["state", "状態量"], [null, "実装"], [null, "リンク"]];
  const thead = el("tr", {}, ...cols.map(([k, label]) => el("th", { scope: "col", "aria-sort": k && k === key ? (dir > 0 ? "ascending" : "descending") : null },
    k ? el("button", { type: "button", class: "th-btn", text: label + (k === key ? (dir > 0 ? " ▲" : " ▼") : ""),
      onclick: () => { state.tableSort = { key: k, dir: k === key ? -dir : 1 }; renderTable(); } }) : document.createTextNode(label))));
  const tbody = el("tbody");
  for (const n of rows) {
    const nameCell = el("td");
    for (const g of n.groups) nameCell.append(el("span", { class: "swatch", style: `background:${groupColor(g)}` }));
    nameCell.append(document.createTextNode(n.short_name));
    const linkCell = el("td", { class: "links" });
    for (const [k, label] of [["paper", "論文"], ["pdf", "PDF"]]) {
      const u = safeUrl(n.links?.[k]);
      if (u) linkCell.append(el("a", { href: u, target: "_blank", rel: "noopener noreferrer", text: label, onclick: (ev) => ev.stopPropagation() }));
    }
    const tr = el("tr", { tabindex: "0" }, nameCell, el("td", { class: "num", text: String(n.year) }), el("td", { text: n.categories.join("，") }),
      el("td", { class: "num", text: fmtCitations(n.citations) }),
      el("td", { text: n.practical ? vocabLabel("state", n.practical.state) : "" }),
      el("td", { text: (n.practical?.implementations || []).map((v) => vocabLabel("implementations", v)).join("，") }), linkCell);
    const open = () => select(n.id);
    tr.addEventListener("click", open);
    tr.addEventListener("keydown", (ev) => { if (ev.key === "Enter") open(); });
    tbody.append(tr);
  }
  els.table.replaceChildren(el("table", {}, el("caption", { class: "visually-hidden", text: "最適化手法の一覧" }), el("thead", {}, thead), tbody));
}

// ================================================================ matrix view & idea candidates

function renderMatrix() {
  const axisGroup = state.matrixAxis === "group";
  const colsDef = axisGroup ? sortedGroups().map((g) => ({ key: g.id, label: g.label, swatch: g.id })) : CONFIG.eras.map((r, i) => ({ key: i, label: r.label }));
  const count = new Map();
  for (const e of state.graph.edges) {
    const t = state.byId.get(e.target);
    const ck = axisGroup ? t.group : eraOf(t.year);
    for (const ty of e.types) count.set(`${ty}|${ck}`, (count.get(`${ty}|${ck}`) || 0) + 1);
  }
  const max = d3.max([...count.values()]) || 1;
  const ramp = isDark() ? CONFIG.seqDark : CONFIG.seqLight;
  const step = (v) => Math.min(ramp.length - 1, Math.floor((Math.sqrt(v) / Math.sqrt(max)) * ramp.length));
  const header = el("tr", {}, el("th", { scope: "col", text: "改良パターン" }),
    ...colsDef.map((c) => el("th", { scope: "col" }, c.swatch ? el("span", { class: "swatch", style: `background:${groupColor(c.swatch)}` }) : null, document.createTextNode(c.label))),
    el("th", { scope: "col", text: "合計" }));
  const tbody = el("tbody");
  for (const t of state.graph.improvement_types) {
    let total = 0;
    const tds = colsDef.map((c) => {
      const v = count.get(`${t.id}|${c.key}`) || 0;
      total += v;
      if (!v) {
        if (!axisGroup) return el("td", { class: "empty", title: `${t.label} × ${c.label}: なし`, text: "·" });
        const active = state.idea && state.idea.type === t.id && state.idea.group === c.key;
        return el("td", { class: "empty" }, el("button", {
          type: "button", class: `idea-cell${active ? " is-active" : ""}`, text: "＋",
          title: `${t.label} × ${c.label}: 未適用．クリックで改善アイデアの候補を表示`,
          onclick: () => { state.idea = { type: t.id, group: c.key }; renderMatrix(); els.matrix.querySelector(".idea-box")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); },
        }));
      }
      const s = step(v);
      const active = state.pattern === t.id && (axisGroup ? state.patternGroup === c.key : state.patternEra === c.key);
      return el("td", {}, el("button", {
        type: "button", class: `cell${active ? " is-active" : ""}`, text: String(v),
        title: `${t.label} × ${c.label}: ${v}本（クリックでマップ上で強調）`,
        style: `background:${ramp[s]};color:${(isDark() ? s <= 3 : s >= 3) ? "#ffffff" : "#0b0b0b"}`,
        onclick: () => { setView("graph"); setPattern(t.id, axisGroup ? { group: c.key } : { era: c.key }); fitView(); },
      }));
    });
    const rowHead = el("th", { scope: "row" }, el("button", {
      type: "button", class: `row-btn${state.pattern === t.id && !state.patternGroup && state.patternEra == null ? " is-active" : ""}`,
      title: t.description, text: `［${t.badge}］${t.label}`,
      onclick: () => { setView("graph"); setPattern(t.id); fitView(); },
    }));
    tbody.append(el("tr", {}, rowHead, ...tds, el("td", { class: "num total", text: String(total) })));
  }
  const axisToggle = el("div", { class: "matrix-controls", role: "group", "aria-label": "列の切り替え" },
    el("span", { text: "列:" }),
    el("button", { type: "button", "aria-pressed": String(axisGroup), text: "分野グループ", onclick: () => { state.matrixAxis = "group"; renderMatrix(); } }),
    el("button", { type: "button", "aria-pressed": String(!axisGroup), text: "年代", onclick: () => { state.matrixAxis = "era"; state.idea = null; renderMatrix(); } }));
  const note = el("p", { class: "matrix-note", text: axisGroup
    ? "数値は，派生先の手法（主分野）がその分野グループに属する改良の本数．数値のセルをクリックするとマップ上で強調する．「＋」はその分野でまだ適用されていない改良パターン（改善の候補）であり，クリックすると対象になり得る手法と他分野での適用例を表示する．"
    : "数値は，派生先の手法の発表年代ごとの改良の本数．改良パターンの流行の推移を示す．セルをクリックするとマップ上で該当する改良を強調する．" });
  const children = [axisToggle, note, el("table", { class: "matrix" }, el("caption", { class: "visually-hidden", text: "改良パターンと分野・年代の対応表" }), el("thead", {}, header), tbody)];
  if (axisGroup && state.idea) children.push(ideaBox(state.idea));
  els.matrix.replaceChildren(...children);
}

/** 未適用の組み合わせ（改良パターン × 分野グループ）に対する改善アイデアの候補． */
function ideaBox({ type, group }) {
  const t = state.typeById.get(type), g = groupOf(group);
  const targets = state.graph.nodes.filter((n) => n.group === group).sort((a, b) => (b.citations ?? 0) - (a.citations ?? 0)).slice(0, 10);
  const examples = state.graph.edges.filter((e) => e.types.includes(type))
    .sort((a, b) => (state.byId.get(b.target).citations ?? 0) - (state.byId.get(a.target).citations ?? 0)).slice(0, 8);
  const nodeBtn = (n) => el("button", { type: "button", class: "link-like", text: `${n.short_name}（${n.year}）`, onclick: () => select(n.id, { zoomToNode: true }) });
  const prompt = [
    "# 最適化手法の改善アイデアの検討",
    "",
    `改良パターン: ${t.label}（${t.description}）`,
    `対象分野: ${g.label}`,
    "Optimizer Map 上では，この分野の手法にこの改良パターンを適用した例がまだない．",
    "",
    "## 対象分野の主な手法",
    ...targets.map((n) => `- ${n.name}（${n.year}）: ${firstSentence(n.summary)}\n  更新式: ${n.update_rule}`),
    "",
    "## 他分野での同じ改良パターンの適用例",
    ...examples.map((e) => `- ${state.byId.get(e.source).short_name} → ${state.byId.get(e.target).short_name}: ${e.improvement}`),
    "",
    "## 依頼",
    "上記を踏まえ，対象分野の手法にこの改良パターンを適用する具体的なアイデアを3つ挙げよ．",
    "それぞれについて，(1) 対象とする手法，(2) 更新式の変更案（LaTeX），(3) 期待される効果，(4) 想定される課題，(5) 関連しそうな既存研究 を示せ．",
  ].join("\n");
  const copyBtn = el("button", { type: "button", text: "生成AIへの相談用プロンプトをコピー" });
  copyBtn.addEventListener("click", () => copyText(prompt, copyBtn));
  return el("section", { class: "idea-box", "aria-label": "改善アイデアの候補" },
    el("h3", { text: `改善アイデアの候補: ［${t.badge}］${t.label} × ${g.label}` }),
    el("p", { class: "notes", text: `${g.label}の手法には「${t.label}」の改良がまだ登録されていない．次の手法への適用が検討の出発点になる．` }),
    el("div", { class: "idea-cols" },
      el("div", {}, el("h4", { text: "対象になり得る手法（Citation数順）" }), el("ul", {}, ...targets.map((n) => el("li", {}, nodeBtn(n), el("span", { class: "notes", text: ` ${firstSentence(n.summary)}` }))))),
      el("div", {}, el("h4", { text: "他分野での適用例" }), el("ul", {}, ...examples.map((e) => el("li", {},
        nodeBtn(state.byId.get(e.source)), document.createTextNode(" → "), nodeBtn(state.byId.get(e.target)),
        el("span", { class: "notes", text: `: ${e.improvement}` })))))),
    el("div", { class: "idea-actions" }, copyBtn,
      el("button", { type: "button", text: "マップでこのパターンを強調", onclick: () => { setView("graph"); setPattern(type); fitView(); } })));
}

// ================================================================ compare view & path

function toggleCompare(id) {
  const i = state.compare.indexOf(id);
  if (i >= 0) state.compare.splice(i, 1);
  else {
    if (state.compare.length >= CONFIG.compareMax) state.compare.shift();
    state.compare.push(id);
  }
  $("btn-compare").textContent = `比較（${state.compare.length}）`;
  if (state.selectedId) renderPanel(state.byId.get(state.selectedId));
  if (state.view === "compare") renderCompare();
}

/** 有向経路（派生元 → 派生先）を幅優先探索で求める．見つからなければ null． */
function directedPath(from, to) {
  const prev = new Map([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) break;
    for (const { node } of state.children.get(cur)) if (!prev.has(node.id)) { prev.set(node.id, cur); queue.push(node.id); }
  }
  if (!prev.has(to)) return null;
  const path = [];
  for (let cur = to; cur != null; cur = prev.get(cur)) path.unshift(cur);
  return path;
}

/** 2手法の関係: 直系なら経路，そうでなければ最も新しい共通の祖先からの2本の経路． */
function relation(a, b) {
  const ab = directedPath(a, b), ba = directedPath(b, a);
  if (ab) return { kind: "direct", paths: [ab] };
  if (ba) return { kind: "direct", paths: [ba] };
  const ancA = new Set([a, ...lineage(a).anc]), ancB = new Set([b, ...lineage(b).anc]);
  const common = [...ancA].filter((x) => ancB.has(x));
  if (!common.length) return { kind: "none", paths: [] };
  const lowest = common.filter((c) => !state.children.get(c).some(({ node }) => common.includes(node.id)));
  const lca = lowest.sort((x, y) => state.byId.get(y).year - state.byId.get(x).year)[0];
  return { kind: "common", lca, paths: [directedPath(lca, a), directedPath(lca, b)] };
}

function pathChain(path) {
  const wrap = el("div", { class: "path-chain" });
  path.forEach((id, i) => {
    const n = state.byId.get(id);
    if (i > 0) {
      const e = state.edgeByKey.get(`${path[i - 1]}>${id}`);
      wrap.append(el("span", { class: "path-arrow", title: e.improvement }, document.createTextNode("→"), typeChips(e.types)));
    }
    wrap.append(el("button", { type: "button", class: "path-node", onclick: () => select(id, { zoomToNode: true }) },
      el("span", { class: "swatch", style: `background:${groupColor(n.group)}` }), document.createTextNode(`${n.short_name}（${n.year}）`)));
  });
  return wrap;
}

function showPathOnMap(paths, label) {
  const nodes = new Set(paths.flat());
  const edges = new Set();
  for (const p of paths) for (let i = 1; i < p.length; i++) edges.add(`${p[i - 1]}>${p[i]}`);
  for (const id of nodes) state.hiddenGroups.delete(state.byId.get(id).group);
  syncLegend();
  setView("graph");
  applyVisibility(false);
  setPath({ nodes, edges, label });
  fitView(true, [...nodes].map((id) => state.byId.get(id)));
}

function renderCompare() {
  const ids = state.compare;
  const head = el("div", { class: "compare-head" },
    el("p", { class: "matrix-note", text: "詳細パネルの「比較に追加」で最大3手法まで選べる．2手法以上を選ぶと，手法間の系譜の経路（改良の積み重ね）を表示する．" }),
    el("div", { class: "compare-chips" }, ...ids.map((id) => el("span", { class: "compare-chip" },
      document.createTextNode(state.byId.get(id).short_name),
      el("button", { type: "button", "aria-label": `${state.byId.get(id).short_name}を比較から外す`, text: "×", onclick: () => toggleCompare(id) })))));
  if (ids.length === 0) { els.compare.replaceChildren(head, el("p", { class: "notes", text: "比較する手法が選ばれていない．" })); return; }

  const rel = el("section", { class: "compare-relations" });
  if (ids.length >= 2) {
    rel.append(el("h3", { text: "系譜の経路" }));
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const a = state.byId.get(ids[i]), b = state.byId.get(ids[j]);
      const r = relation(ids[i], ids[j]);
      const box = el("div", { class: "relation" }, el("h4", { text: `${a.short_name} と ${b.short_name}` }));
      if (r.kind === "none") box.append(el("p", { class: "notes", text: "共通の祖先がない（別系統の手法）．" }));
      else {
        box.append(el("p", { class: "notes", text: r.kind === "direct" ? "直系の関係（派生元 → 派生先）．" : `共通の祖先 ${state.byId.get(r.lca).short_name}（${state.byId.get(r.lca).year}）から分岐した関係．` }));
        for (const p of r.paths) box.append(pathChain(p));
        const label = r.kind === "direct" ? `${state.byId.get(r.paths[0][0]).short_name} → ${state.byId.get(r.paths[0].at(-1)).short_name}` : `${state.byId.get(r.lca).short_name} → ${a.short_name} / ${b.short_name}`;
        box.append(el("button", { type: "button", text: "マップで経路を表示", onclick: () => showPathOnMap(r.paths, label) }));
      }
      rel.append(box);
    }
  }

  const grid = el("div", { class: "compare-grid", style: `grid-template-columns: repeat(${ids.length}, minmax(260px, 1fr))` });
  for (const id of ids) {
    const n = state.byId.get(id);
    const formula = el("div", { class: "formula" });
    grid.append(el("article", { class: "compare-col" },
      el("h3", { text: n.name }), groupTags(n), linkButtons(n), metaList(n),
      el("h4", { text: "概要" }), el("p", { text: n.summary }),
      el("h4", { text: "更新式" }), formula,
      el("h4", { text: "派生元と改善内容" }), relationList(state.parents.get(id))));
    renderFormula(formula, n.update_rule);
  }
  els.compare.replaceChildren(head, rel, grid);
}

// ================================================================ trend view（分野・改良パターンの年次推移）

/**
 * 小さな棒グラフを並べる（small multiples）．縦軸は全カードで共通の尺度にする．
 * 2009年以前は1本の棒「〜09」にまとめ，2010年以降は1年ごとの棒とする．
 */
function renderTrend() {
  const metric = state.trendMetric;
  const nodes = state.graph.nodes.filter(isShownIgnoringYear);
  const maxYear = d3.max(state.graph.nodes, (n) => n.year);
  const bins = [{ key: "pre", label: "〜09", test: (y) => y < 2010 }];
  for (let y = 2010; y <= maxYear; y++) bins.push({ key: y, label: String(y).slice(2), test: (yy) => yy === y });
  const binOf = (y) => bins.findIndex((b) => b.test(y));

  let series;
  if (metric === "groups") {
    // 分野グループ: その年に発表された手法の数（副分野を含む所属で数える）
    series = sortedGroups().map((g) => ({
      key: g.id, label: g.label, color: groupColor(g.id),
      counts: bins.map(() => 0), onTitle: () => { state.hiddenGroups = new Set(state.graph.groups.map((x) => x.id).filter((x) => x !== g.id)); syncLegend(); setView("graph"); applyVisibility(); fitView(); },
    }));
    const idx = new Map(series.map((s, i) => [s.key, i]));
    for (const n of nodes) for (const g of n.groups) series[idx.get(g)].counts[binOf(n.year)]++;
  } else {
    // 改良パターン: 派生先の発表年ごとの改良の本数
    series = state.graph.improvement_types.map((t) => ({
      key: t.id, label: `［${t.badge}］${t.label}`, color: "var(--series-1)",
      counts: bins.map(() => 0), onTitle: () => { setView("graph"); setPattern(t.id); fitView(); },
    }));
    const idx = new Map(series.map((s, i) => [s.key, i]));
    const visible = new Set(nodes.map((n) => n.id));
    for (const e of state.graph.edges) {
      if (!visible.has(e.target) || !visible.has(e.source)) continue;
      const b = binOf(state.byId.get(e.target).year);
      for (const t of e.types) series[idx.get(t)].counts[b]++;
    }
  }
  for (const s of series) s.total = d3.sum(s.counts);
  const yMax = d3.max(series, (s) => d3.max(s.counts.slice(1))) || 1;

  // 増加傾向: 直近3年と，その前の3年の比較
  const lastIdx = bins.length - 1;
  const recent = (s) => d3.sum(s.counts.slice(lastIdx - 2, lastIdx + 1));
  const before = (s) => d3.sum(s.counts.slice(lastIdx - 5, lastIdx - 2));
  const risers = series.filter((s) => recent(s) >= 3).map((s) => ({ s, r: (recent(s) + 1) / (before(s) + 1) })).sort((a, b) => b.r - a.r).slice(0, 3);
  const y1 = maxYear;
  const insight = risers.length
    ? `直近3年（${y1 - 2}–${y1}）に，その前の3年（${y1 - 5}–${y1 - 3}）より増えているもの: ` + risers.map(({ s }) => `${s.label}（${before(s)}→${recent(s)}）`).join("，")
    : "直近の増加傾向を判定できるだけのデータがない．";

  const W = 260, H = 110, m = { t: 6, r: 6, b: 18, l: 22 };
  const x = d3.scaleBand().domain(d3.range(bins.length)).range([m.l, W - m.r]).paddingInner(0.15);
  const y = d3.scaleLinear().domain([0, yMax]).nice(3).range([H - m.b, m.t]);
  const cards = series.map((s) => {
    const svgSel = d3.create("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img").attr("aria-label", `${s.label}の年次推移`);
    const ax = svgSel.append("g").attr("class", "trend-axis");
    for (const tv of y.ticks(3)) {
      ax.append("line").attr("class", "trend-grid-line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(tv)).attr("y2", y(tv));
      ax.append("text").attr("x", m.l - 4).attr("y", y(tv) + 3).attr("text-anchor", "end").text(tv);
    }
    for (const i of [0, 1, Math.floor(bins.length / 2), bins.length - 1]) ax.append("text").attr("x", x(i) + x.bandwidth() / 2).attr("y", H - 5).attr("text-anchor", "middle").text(bins[i].label);
    svgSel.append("line").attr("class", "trend-baseline").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(0)).attr("y2", y(0));
    // 〜09 の棒は複数年の合計なので上限で切り詰め，薄く表示する
    svgSel.append("g").selectAll("rect").data(s.counts.map((v, i) => ({ v, i }))).join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.i)).attr("width", x.bandwidth())
      .attr("y", (d) => y(Math.min(d.v, yMax))).attr("height", (d) => Math.max(0, y(0) - y(Math.min(d.v, yMax))))
      .attr("rx", 1.5)
      .style("fill", s.color).style("opacity", (d) => (d.i === 0 ? 0.45 : 1))
      .on("pointermove", (ev, d) => {
        els.tooltip.replaceChildren(el("div", { class: "tt-title", text: String(d.v) }), el("div", { text: `${s.label} · ${d.i === 0 ? "2009年以前（合計）" : `${bins[d.i].key}年`}` }));
        els.tooltip.hidden = false; placeTooltip(ev);
      })
      .on("pointerleave", hideTooltip);
    const title = el("button", { type: "button", text: s.label, title: metric === "groups" ? "このグループだけをマップに表示" : "マップでこの改良パターンを強調", onclick: s.onTitle });
    return el("article", { class: "trend-card" },
      el("h4", {}, el("span", { class: "swatch", style: `background:${s.color}` }), title, el("span", { class: "total", text: `計${s.total}` })),
      svgSel.node());
  });
  const toggle = el("div", { class: "trend-controls", role: "group", "aria-label": "指標の切り替え" },
    el("span", { text: "指標:" }),
    el("button", { type: "button", "aria-pressed": String(metric === "groups"), text: "分野グループごとの手法数", onclick: () => { state.trendMetric = "groups"; renderTrend(); } }),
    el("button", { type: "button", "aria-pressed": String(metric === "patterns"), text: "改良パターンごとの改良の本数", onclick: () => { state.trendMetric = "patterns"; renderTrend(); } }));
  const note = el("p", { class: "matrix-note", text: (metric === "groups"
    ? "各分野グループに属する手法（副分野を含む）の発表年ごとの数．"
    : "各改良パターンの改良（エッジ）の本数を，派生先の手法の発表年ごとに数えたもの．")
    + "縦軸は全グラフで共通．「〜09」の棒は2009年以前の合計（上限で切り詰め，薄く表示）．絞り込み・グループの表示/非表示が反映される．見出しをクリックするとマップに移動する．" });
  els.trend.replaceChildren(toggle, el("p", { class: "trend-insight", text: insight }), note, el("div", { class: "trend-grid" }, ...cards));
}

// ================================================================ export（BibTeX・CSV・SVG・PNG）

function download(name, blob) {
  const a = el("a", { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** 書き出しの対象: 比較中 > 選択中 > 表示中の手法． */
function exportScope() {
  if (state.compare.length) return { label: `比較中の${state.compare.length}件`, nodes: state.compare.map((id) => state.byId.get(id)) };
  if (state.selectedId) return { label: `選択中の1件（${state.byId.get(state.selectedId).short_name}）`, nodes: [state.byId.get(state.selectedId)] };
  const nodes = state.graph.nodes.filter((n) => isVisible(n.id));
  return { label: `表示中の${nodes.length}件`, nodes };
}

const bibEscape = (s) => String(s ?? "").replace(/[{}\\]/g, (c) => `\\${c}`);
function englishTitle(name) {
  const m = name.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!m) return name;
  return /[぀-ヿ一-鿿]/.test(m[1]) ? m[2].split(/[,，]/)[0].trim() : `${m[1]} (${m[2]})`;
}

function toBibtex(n) {
  const title = n.paper?.title || englishTitle(n.name);
  const authors = n.paper?.authors?.length ? n.paper.authors.join(" and ") : null;
  const ref = n.reference || "";
  const arxiv = ref.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5})/);
  const doi = ref.match(/doi\.org\/(10\.[^\s?#]+)/);
  const f = [`  title = {${bibEscape(title)}}`];
  if (authors) f.push(`  author = {${bibEscape(authors)}}`);
  f.push(`  year = {${n.year}}`);
  if (n.paper?.venue) f.push(`  howpublished = {${bibEscape(n.paper.venue)}}`);
  if (arxiv) f.push(`  eprint = {${arxiv[1]}}`, "  archivePrefix = {arXiv}");
  if (doi) f.push(`  doi = {${bibEscape(decodeURIComponent(doi[1]))}}`);
  f.push(`  url = {${bibEscape(ref)}}`);
  if (!authors) f.push("  note = {著者情報は未取得（tools/fetch_metadata.py で補完）}");
  return `@misc{${n.id},\n${f.join(",\n")}\n}`;
}

function toCsv(nodes) {
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["id", "name", "short_name", "year", "citations", "citations_source", "categories", "group", "state", "implementations", "tasks", "hyperparameters", "reference", "pdf", "parents"];
  const rows = nodes.map((n) => [n.id, n.name, n.short_name, n.year, n.citations ?? "", n.citations_source || "", n.categories.join(";"), groupOf(n.group).label,
    n.practical?.state ?? "", (n.practical?.implementations || []).join(";"), (n.practical?.tasks || []).join(";"), (n.practical?.hyperparameters || []).join(";"),
    n.reference, n.links?.pdf ?? "", state.parents.get(n.id).map((p) => `${p.node.id}[${p.edge.types.join("+")}]`).join(";")].map(q).join(","));
  return "﻿" + [header.join(","), ...rows].join("\n");
}

/** 表示中のマップを，計算済みのスタイルを埋め込んだ自己完結の SVG 文字列にする． */
function serializeMap() {
  const src = svg.node();
  const clone = src.cloneNode(true);
  const props = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-linejoin", "opacity", "display", "visibility",
    "font-size", "font-family", "font-weight", "paint-order", "text-anchor"];
  const a = src.querySelectorAll("*"), b = clone.querySelectorAll("*");
  for (let i = 0; i < a.length; i++) {
    const cs = getComputedStyle(a[i]);
    b[i].setAttribute("style", props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";"));
    b[i].removeAttribute("class");
  }
  const box = src.getBoundingClientRect();
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", box.width);
  clone.setAttribute("height", box.height);
  clone.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%"); bg.setAttribute("height", "100%");
  bg.setAttribute("fill", getComputedStyle(els.graph.parentElement).backgroundColor);
  clone.insertBefore(bg, clone.firstChild);
  return { text: new XMLSerializer().serializeToString(clone), width: box.width, height: box.height };
}

async function exportPng() {
  const { text, width, height } = serializeMap();
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const scale = 2;
  const canvas = el("canvas");
  canvas.width = width * scale; canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  canvas.toBlob((blob) => download("optimizer-map.png", blob), "image/png");
}

function setupExport() {
  const render = () => {
    const scope = exportScope();
    const item = (text, title, fn) => el("button", { type: "button", class: "menu-item", text, title, onclick: () => { fn(); els.exportMenu.open = false; } });
    const needGraph = (fn) => () => { if (state.view !== "graph") setView("graph"); fn(); };
    els.exportBody.replaceChildren(
      el("p", { class: "hint", text: `対象: ${scope.label}（比較中 ＞ 選択中 ＞ 表示中の順に選ばれる）` }),
      item("BibTeX（.bib）", "論文の参考文献リスト", () => download("optimizer-map.bib", new Blob([scope.nodes.map(toBibtex).join("\n\n") + "\n"], { type: "text/plain" }))),
      item("BibTeX をコピー", "クリップボードにコピー", () => copyText(scope.nodes.map(toBibtex).join("\n\n"))),
      item("CSV（.csv）", "表計算ソフト向けの一覧", () => download("optimizer-map.csv", new Blob([toCsv(scope.nodes)], { type: "text/csv" }))),
      item("マップの画像（SVG）", "表示中の範囲をそのまま書き出す（スライド・論文向け）", needGraph(() => download("optimizer-map.svg", new Blob([serializeMap().text], { type: "image/svg+xml" })))),
      item("マップの画像（PNG・2倍解像度）", "表示中の範囲をそのまま書き出す", needGraph(() => exportPng())),
      el("p", { class: "hint", text: "画像は現在の表示範囲・強調・配色のまま書き出す．" }));
  };
  els.exportMenu.addEventListener("toggle", () => { if (els.exportMenu.open) render(); });
}

// ================================================================ views, layout mode, theme

function setView(view) {
  state.view = view;
  els.table.hidden = view !== "table";
  els.matrix.hidden = view !== "matrix";
  els.compare.hidden = view !== "compare";
  els.trend.hidden = view !== "trend";
  els.graph.style.visibility = view === "graph" ? "visible" : "hidden";
  els.sizeLegend.hidden = view !== "graph";
  for (const [id, v] of [["btn-table", "table"], ["btn-matrix", "matrix"], ["btn-compare", "compare"], ["btn-trend", "trend"]]) $(id).setAttribute("aria-pressed", String(view === v));
  if (view === "table") renderTable();
  if (view === "matrix") renderMatrix();
  if (view === "compare") renderCompare();
  if (view === "trend") renderTrend();
}

function setLayoutMode(mode, animate = true) {
  state.layoutMode = mode;
  const btn = $("btn-layout");
  btn.textContent = mode === "regions" ? "配置: 領域" : "配置: 列";
  btn.setAttribute("aria-label", `配置の切り替え（現在: ${mode === "regions" ? "領域で囲う" : "分野ごとの列"}）`);
  renderLayout(getLayout(mode), animate);
  if (animate) setTimeout(() => (state.selectedId ? zoomTo(state.byId.get(state.selectedId)) : fitView()), 720);
}

function setupTheme() {
  const btn = $("btn-theme");
  const modes = ["auto", "light", "dark"];
  const labels = { auto: "配色: 自動", light: "配色: ライト", dark: "配色: ダーク" };
  let saved = null;
  try { saved = localStorage.getItem("optimizer-map-theme"); } catch { /* storage unavailable */ }
  const apply = (m) => {
    state.themeMode = m;
    if (m === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", m);
    btn.textContent = labels[m];
    try { localStorage.setItem("optimizer-map-theme", m); } catch { /* ignore */ }
    if (state.view === "matrix") renderMatrix();
    if (state.view === "trend") renderTrend();
  };
  apply(modes.includes(saved) ? saved : "auto");
  btn.addEventListener("click", () => apply(modes[(modes.indexOf(state.themeMode) + 1) % modes.length]));
}

// ================================================================ boot

async function main() {
  setupTheme();
  try {
    const graph = await loadGraph();
    indexGraph(graph);
    injectGroupColors(graph.groups);
    rScale = makeRadiusScale(graph.nodes, d3);
    state.citationRank = new Map([...graph.nodes].sort((a, b) => (b.citations ?? -1) - (a.citations ?? -1)).map((n, i) => [n.id, i]));
    buildLegend();
    setupPatternControl();
    setupSvg();
    setLayoutMode(state.layoutMode, false);
    setupYearSlider();
    fitView(false);
    setupSearch();
    $("btn-fit").addEventListener("click", () => fitView());
    $("btn-table").addEventListener("click", () => setView(state.view === "table" ? "graph" : "table"));
    $("btn-matrix").addEventListener("click", () => setView(state.view === "matrix" ? "graph" : "matrix"));
    $("btn-compare").addEventListener("click", () => setView(state.view === "compare" ? "graph" : "compare"));
    $("btn-trend").addEventListener("click", () => setView(state.view === "trend" ? "graph" : "trend"));
    setupFilters();
    setupExport();
    // メニューの外側をクリックしたら閉じる
    document.addEventListener("click", (ev) => { for (const m of [els.filterMenu, els.exportMenu]) if (m.open && !m.contains(ev.target)) m.open = false; });
    $("btn-layout").addEventListener("click", () => setLayoutMode(state.layoutMode === "regions" ? "columns" : "regions"));
    $("panel-close").addEventListener("click", () => select(null));
    window.addEventListener("keydown", (ev) => {
      if (ev.key !== "Escape") return;
      if (state.selectedId) select(null); else if (state.path) setPath(null); else if (state.pattern) setPattern(null);
    });
    new ResizeObserver(() => { if (!state.selectedId && !state.path) fitView(false); }).observe(els.graph);
    const selectFromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && state.byId.has(id) && id !== state.selectedId) select(id, { zoomToNode: true, updateHash: false });
    };
    window.addEventListener("hashchange", selectFromHash);
    selectFromHash();
    els.status.textContent = graph.layouts ? "" : "配置をブラウザで計算しました（tools/precompute_layout.mjs で事前計算すると表示が速くなります）";
    setTimeout(() => { if (els.status.textContent.startsWith("配置を")) els.status.textContent = ""; }, 4000);
  } catch (err) {
    console.error(err);
    els.status.textContent = `データの読み込みに失敗しました: ${err.message}（tools/build_graph.py で site/data/graph.json を生成してください）`;
  }
}

main();
