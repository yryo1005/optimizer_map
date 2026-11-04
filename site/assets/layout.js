// Optimizer Map — 配置計算（ブラウザと Node.js の両方で動く純粋なモジュール）
//
// ブラウザ: app.js から import し，graph.json に事前計算済みの配置がない場合に使う．
// Node.js:  tools/precompute_layout.mjs から import し，ビルド時に配置を計算して graph.json に埋め込む．
//
// computeLayout(graph, mode, d3) は入力の graph を変更せず，シリアライズ可能な配置を返す．
//   mode: "regions"（範囲で囲う）| "columns"（主分野の列）

export const LAYOUT_CONFIG = {
  radius: { min: 4, max: 26, unknown: 5 },
  colWidth: { base: 130, perNode: 14, exp: 0.85 },
  row: { minHeight: 26, gap: 6, pad: 6 },
  regionRowScale: 1.25,
  header: 56,
  axisWidth: 64,
  forceTicks: 260,
  region: { cell: 6, sigmaPad: 16, sigmaY: 44, threshold: 0.45 },
};

/** Citation数 → 半径（対数スケール）． */
export function makeRadiusScale(nodes, d3, C = LAYOUT_CONFIG) {
  const maxCit = d3.max(nodes, (n) => n.citations ?? 0) || 1;
  const s = d3.scaleLinear().domain([0, Math.log10(1 + maxCit)]).range([C.radius.min, C.radius.max]);
  return (c) => (c == null ? C.radius.unknown : s(Math.log10(1 + c)));
}

/** 各手法の所属グループ（主分野のグループを先頭に重複なし）． */
export function nodeGroups(graph) {
  const catGroup = new Map(graph.categories.map((c) => [c.id, c.group]));
  return new Map(graph.nodes.map((n) => [n.id, [...new Set(n.categories.map((c) => catGroup.get(c)))]]));
}

function hashUnit(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000 - 0.5;
}

/** 同時に現れやすいグループ同士が隣接する並び（全順列から隣接重みの和が最大のもの）． */
export function optimizeGroupOrder(graph, groupsOf) {
  const ids = [...graph.groups].sort((a, b) => a.order - b.order).map((g) => g.id);
  const idx = new Map(ids.map((id, i) => [id, i]));
  const k = ids.length;
  const w = Array.from({ length: k }, () => new Array(k).fill(0));
  const add = (a, b, v) => { if (a !== b) { w[idx.get(a)][idx.get(b)] += v; w[idx.get(b)][idx.get(a)] += v; } };
  const primary = new Map(graph.nodes.map((n) => [n.id, groupsOf.get(n.id)[0]]));
  for (const n of graph.nodes) {
    const gs = groupsOf.get(n.id);
    for (let i = 0; i < gs.length; i++) for (let j = i + 1; j < gs.length; j++) add(gs[i], gs[j], 1);
  }
  for (const e of graph.edges) add(primary.get(e.source), primary.get(e.target), 0.5);
  let best = null, bestScore = -1;
  const used = new Array(k).fill(false), cur = [];
  const rec = (score) => {
    if (cur.length === k) { if (score > bestScore) { bestScore = score; best = [...cur]; } return; }
    for (let i = 0; i < k; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(i);
      rec(score + (cur.length > 1 ? w[cur[cur.length - 2]][i] : 0));
      cur.pop(); used[i] = false;
    }
  };
  rec(0);
  return best.map((i) => ids[i]);
}

function packLines(nodes, width, C) {
  const sorted = [...nodes].sort((a, b) => (b.citations ?? -1) - (a.citations ?? -1) || a.id.localeCompare(b.id));
  const lines = [];
  let cur = [], w = 0;
  for (const n of sorted) {
    const d = 2 * n.r + C.row.gap;
    if (cur.length && w + d > width) { lines.push(cur); cur = []; w = 0; }
    cur.push(n); w += d;
  }
  if (cur.length) lines.push(cur);
  return lines;
}

/**
 * 配置を計算する．
 * 戻り値: { mode, order, totalWidth, totalHeight, columns[], rows[], positions{id:{x,y,r}}, regions[] }
 */
export function computeLayout(graph, mode, d3, C = LAYOUT_CONFIG) {
  const groupsOf = nodeGroups(graph);
  const rOf = makeRadiusScale(graph.nodes, d3, C);
  // 作業用のコピー（入力は変更しない）
  const nodes = graph.nodes.map((n) => ({ id: n.id, year: n.year, citations: n.citations, groups: groupsOf.get(n.id), group: groupsOf.get(n.id)[0], r: rOf(n.citations) }));
  const groupsById = new Map(graph.groups.map((g) => [g.id, g]));
  const order = mode === "regions"
    ? optimizeGroupOrder(graph, groupsOf)
    : [...graph.groups].sort((a, b) => a.order - b.order).map((g) => g.id);

  const byGroup = d3.group(nodes, (n) => n.group);
  let x = C.axisWidth;
  const columns = new Map();
  for (const gid of order) {
    const count = (byGroup.get(gid) || []).length;
    const w = C.colWidth.base + C.colWidth.perNode * Math.pow(count, C.colWidth.exp);
    columns.set(gid, { id: gid, x0: x, x1: x + w, cx: x + w / 2, w });
    x += w;
  }
  const totalWidth = x;

  const years = [...new Set(nodes.map((n) => n.year))].sort((a, b) => a - b);
  const cell = d3.group(nodes, (n) => n.year, (n) => n.group);
  const rows = new Map();
  let y = C.header;
  const scale = mode === "regions" ? C.regionRowScale : 1;
  for (const yr of years) {
    let h = C.row.minHeight;
    for (const [gid, ns] of cell.get(yr) || []) {
      const lines = packLines(ns, columns.get(gid).w - 2 * C.row.pad, C);
      h = Math.max(h, (d3.sum(lines, (ln) => 2 * d3.max(ln, (n) => n.r) + C.row.gap) + C.row.pad) * scale);
    }
    rows.set(yr, { year: yr, y0: y, y1: y + h, cy: y + h / 2, h });
    y += h;
  }
  const totalHeight = y;

  for (const n of nodes) {
    n.ty = rows.get(n.year).cy;
    if (mode === "regions") {
      let sx = 0, sw = 0;
      n.groups.forEach((g, i) => { const wgt = i === 0 ? 2 : 1; sx += columns.get(g).cx * wgt; sw += wgt; });
      n.tx = sx / sw;
    } else {
      n.tx = columns.get(n.group).cx;
    }
  }
  if (mode === "columns") {
    for (const [yr, gmap] of cell) for (const [gid, ns] of gmap) {
      const col = columns.get(gid), row = rows.get(yr);
      const lines = packLines(ns, col.w - 2 * C.row.pad, C);
      const blockH = d3.sum(lines, (ln) => 2 * d3.max(ln, (n) => n.r) + C.row.gap);
      let ly = row.cy - blockH / 2;
      for (const ln of lines) {
        const lh = 2 * d3.max(ln, (n) => n.r) + C.row.gap;
        let lx = col.cx - d3.sum(ln, (n) => 2 * n.r + C.row.gap) / 2;
        for (const n of ln) { n.tx = lx + n.r + C.row.gap / 2; n.ty = ly + lh / 2; lx += 2 * n.r + C.row.gap; }
        ly += lh;
      }
    }
  }
  for (const n of nodes) { n.x = n.tx + hashUnit(n.id) * 30; n.y = n.ty + hashUnit(n.id + "y") * 4; }
  const sim = d3.forceSimulation(nodes)
    .force("x", d3.forceX((n) => n.tx).strength(mode === "regions" ? 0.18 : 0.35))
    .force("y", d3.forceY((n) => n.ty).strength(0.9))
    .force("collide", d3.forceCollide((n) => n.r + 3).iterations(2))
    .stop();
  for (let i = 0; i < C.forceTicks; i++) sim.tick();
  for (const n of nodes) {
    const row = rows.get(n.year);
    const x0 = mode === "regions" ? C.axisWidth : columns.get(n.group).x0;
    const x1 = mode === "regions" ? totalWidth : columns.get(n.group).x1;
    n.x = Math.max(x0 + n.r + 2, Math.min(x1 - n.r - 2, n.x));
    n.y = Math.max(row.y0 + n.r + 1, Math.min(row.y1 - n.r - 1, n.y));
  }

  const regions = mode === "regions" ? computeRegions(nodes, order, totalWidth, totalHeight, d3, C) : [];
  const round = (v) => Math.round(v * 10) / 10;
  return {
    mode,
    order,
    totalWidth,
    totalHeight,
    columns: [...columns.values()].map((c) => ({ ...c, label: groupsById.get(c.id).label })),
    rows: [...rows.values()],
    positions: Object.fromEntries(nodes.map((n) => [n.id, { x: round(n.x), y: round(n.y), r: round(n.r) }])),
    regions,
  };
}

/**
 * グループの範囲: 所属手法ごとの（年方向に長い）ガウス関数の和を格子上で求め，等高線で囲う．
 * contour は格子座標（1 = cell px）の GeoJSON MultiPolygon．
 */
function computeRegions(nodes, order, totalWidth, totalHeight, d3, C) {
  const { cell, sigmaPad, sigmaY, threshold } = C.region;
  const gw = Math.ceil((totalWidth + 80) / cell), gh = Math.ceil((totalHeight + 80) / cell);
  const regions = [];
  for (const gid of order) {
    const members = nodes.filter((n) => n.groups.includes(gid));
    if (!members.length) continue;
    const values = new Float32Array(gw * gh);
    for (const n of members) {
      const sx = n.r * 0.6 + sigmaPad, sx2 = 2 * sx * sx, sy2 = 2 * sigmaY * sigmaY;
      const cx = n.x / cell, cy = n.y / cell, radX = Math.ceil((3 * sx) / cell), radY = Math.ceil((3 * sigmaY) / cell);
      const ix0 = Math.max(0, Math.floor(cx - radX)), ix1 = Math.min(gw - 1, Math.ceil(cx + radX));
      const iy0 = Math.max(0, Math.floor(cy - radY)), iy1 = Math.min(gh - 1, Math.ceil(cy + radY));
      for (let iy = iy0; iy <= iy1; iy++) {
        const dy = iy * cell - n.y, ey = (dy * dy) / sy2;
        for (let ix = ix0; ix <= ix1; ix++) {
          const dx = ix * cell - n.x;
          values[iy * gw + ix] += Math.exp(-(dx * dx) / sx2 - ey);
        }
      }
    }
    const [contour] = d3.contours().size([gw, gh]).thresholds([threshold])(values);
    // 座標を丸めてサイズを抑える
    contour.coordinates = contour.coordinates.map((poly) => poly.map((ring) => ring.map(([a, b]) => [Math.round(a * 10) / 10, Math.round(b * 10) / 10])));
    const top = members.reduce((a, b) => (b.y < a.y ? b : a));
    regions.push({ gid, contour, members: members.map((n) => n.id), label: { x: top.x, y: top.y - top.r - 24 } });
  }
  return regions;
}
