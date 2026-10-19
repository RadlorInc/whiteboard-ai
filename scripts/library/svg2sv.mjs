// Shared by the library sources (scripts/bioicons, scripts/phylopic, scripts/emoji): any SVG -> the same on-demand
// drawing files as the Servier library (public/player/lib/sv/<id>.js) and entries in scripts/servier/sv-catalogue.json.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const app = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
export const dest = path.join(app, 'public', 'player', 'lib', 'sv'), catFile = path.join(app, 'scripts', 'servier', 'sv-catalogue.json');
export const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'drawing';

// Founder, 19 Oct 2026: drawn like the Servier drawings, not dropped in. Servier's own art has thin dark outlines
// (#333333, median width 1.7 in the 1000-tall box, on about a third of its shapes) that the player's "draw" traces
// before "fill" colours in; Bioicons art has none, so every part big enough to read gets one the same way.
const area = path => { const n = path.match(/-?\d+/g).map(Number); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i + 1 < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]); }
  return (x1 - x0) * (y1 - y0); };
const light = c => { const n = parseInt(c.slice(1), 16); return (n >> 16) + (n >> 8 & 255) + (n & 255) > 690; };
// At most the 40 biggest parts, about a Servier drawing's median (43): the player gives every pen line at least 50 ms.
export const outline = d => { const all = d.w * 1000;
  d.shapes.map((s, i) => [s, i, area(s[0])]).filter(([s, , a]) => s[1] !== 'none' && !s[3] && a > all * 0.003 && !(light(s[1]) && a > all * 0.5))
    .sort((p, q) => q[2] - p[2]).slice(0, 40).forEach(([s]) => { s[3] = '#333333'; s[4] = 3; }); };   // a pale backdrop gets none

// A headless page with paper.js: flatten(svg) -> {w, h: 1000, shapes: [[d, fill, fillOpacity, stroke, strokeWidth]]} or null.
// SVGs are flattened in Chromium (transforms, CSS, shapes, arcs -> absolute paths); text and markers are dropped.
export async function openFlattener() {
  const browser = await chromium.launch(), page = await browser.newPage();
  await page.setContent('<html><body></body></html>');
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js' });
  await page.evaluate(() => { paper.setup(new paper.Size(1000, 1000)); });
  const flatten = svg => page.evaluate(svg => {
  paper.project.clear();
  let item; try { item = paper.project.importSVG(svg, { expandShapes: true, insert: true }); } catch { return null; }
  if (!item) return null;
  const hex = c => { if (!c) return null; if (c.type === 'gradient' || c.gradient) { const s = c.gradient.stops[0]; c = s && s.color; if (!c) return null; }
    return c.alpha === 0 ? null : '#' + c.toCSS(true).slice(1, 7); };
  const alpha = (p, c) => { let a = c && c.alpha != null ? c.alpha : 1; for (let q = p; q; q = q.parent) a *= q.opacity; return a; };
  const hidden = p => { for (let q = p; q; q = q.parent) if (!q.visible) return true; return false; };
  // Every subpath as absolute points in page coordinates: [[x, y] start, then [c1, c2, end] or [end] per segment].
  const subs = s => { const M = s.globalMatrix, g = s.segments, P = q => { q = M.transform(q); return [q.x, q.y]; };
    if (!g.length) return null;
    const segs = [], seg = (a, z) => segs.push(a.handleOut.isZero() && z.handleIn.isZero() ? [P(z.point)]
      : [P(a.point.add(a.handleOut)), P(z.point.add(z.handleIn)), P(z.point)]);
    for (let i = 1; i < g.length; i++) seg(g[i - 1], g[i]);
    if (s.closed) seg(g[g.length - 1], g[0]);
    return { start: P(g[0].point), segs, closed: s.closed }; };
  const pts = sp => [sp.start, ...sp.segs.flat()];
  const out = [];
  for (const p of item.getItems({ class: paper.PathItem })) {
    if (p.clipMask || hidden(p) || (p instanceof paper.Path && p.parent instanceof paper.CompoundPath)) continue;
    const fill = hex(p.fillColor), stroke = p.strokeWidth > 0 ? hex(p.strokeColor) : null;
    if (!fill && !stroke) continue;
    const sp = (p.children || [p]).map(subs).filter(Boolean); if (!sp.length) continue;
    out.push({ sp, fill: fill || 'none', fo: fill ? alpha(p, p.fillColor) : 1, stroke, w: stroke ? p.strokeWidth * p.globalMatrix.scaling.x : 0 });
  }
  const box = list => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const o of list) for (const s of o.sp) for (const [x, y] of pts(s)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
  // A page frame or background (a plain rectangle about as big as everything) is not part of the drawing.
  let b = box(out);
  for (const o of out) o.sp = o.sp.filter(s => { const q = pts(s), xs = new Set(q.map(v => Math.round(v[0]))), ys = new Set(q.map(v => Math.round(v[1])));
    const rect = s.segs.every(g => g.length === 1) && xs.size <= 2 && ys.size <= 2, bb = box([{ sp: [s] }]);
    return !(rect && bb.w * bb.h >= 0.8 * b.w * b.h); });
  const kept = out.filter(o => o.sp.length); if (!kept.length) return null;
  b = box(kept); if (!b.h || !b.w) return null;
  const k = 1000 / b.h, T = ([x, y]) => `${Math.round((x - b.x) * k)} ${Math.round((y - b.y) * k)}`;
  const d = sp => sp.map(s => `M${T(s.start)}` + s.segs.map(g => g.length === 1 ? ` L${T(g[0])}` : ` C${g.map(T).join(' ')}`).join('') + (s.closed ? ' Z' : '')).join(' ');
  return { w: Math.round(b.w * k), h: 1000, shapes: kept.map(o => [d(o.sp), o.fill, Math.round(o.fo * 10) / 10, o.stroke, Math.round(o.w * k * 10) / 10]) };
}, svg);
  return { flatten, close: () => browser.close() };
}

// Replace one source's drawings (its kits start with prefix): items = [{name, kit, tags, data}] -> [{id, ...item}].
// Ids never collide with another source's. Founder, 19 Oct 2026: every library drawing stays under MAX_BYTES (a lesson
// loads it on a phone); bigger ones are left out and listed in `skipped`, to simplify by hand or drop.
export const MAX_BYTES = 150_000;
export function replaceSource(prefix, items, subject = 'biology') {
  const old = JSON.parse(fs.readFileSync(catFile, 'utf8'));
  for (const c of old) if (c.kit.startsWith(prefix)) fs.rmSync(path.join(dest, c.id + '.js'), { force: true });
  const cat = old.filter(c => !c.kit.startsWith(prefix)), taken = new Set(cat.map(c => c.id)), out = [];
  let bytes = 0; const skipped = [];
  for (const it of items) {
    const body = JSON.stringify(it.data); if (body.length > MAX_BYTES) { skipped.push(`${it.name} (${Math.round(body.length / 1000)} KB)`); continue; }
    let id = slug(it.id || it.name), n = 1; const base = id; while (taken.has(id)) id = `${base}-${++n}`; taken.add(id);
    fs.writeFileSync(path.join(dest, id + '.js'), `SV.add(${JSON.stringify(id)},${body});\n`); bytes += body.length;
    cat.push({ id, name: it.name, subject, kit: it.kit, w: it.data.w, tags: it.tags });
    out.push({ ...it, id });
  }
  fs.writeFileSync(catFile, JSON.stringify(cat));
  return { kept: out, mb: (bytes / 1e6).toFixed(1), skipped };
}
