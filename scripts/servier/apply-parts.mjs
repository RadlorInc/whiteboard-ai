// Turns hand-picked part points (scripts/servier/parts/<id>.json) into pin-ready parts, and writes them into the drawing's
// on-demand file (public/player/lib/sv/<id>.js) and the catalogue (sv-catalogue.json, "parts" per drawing).
//   node scripts/servier/apply-parts.mjs [id ...]          (no ids: every parts file)
// A parts file: {"parts": {"<key>": {"name": "right atrium", "at": [x, y], "kind"?: "low|high|valve", "shapes"?: [i, ...]}}}
// at = a point on the part in the drawing's own box (0..1000 tall, as grid.mjs shows). Left out, "shapes" is found here:
// the topmost shape under the point that is neither a speck (<0.05% of the drawing) nor nearly all of it (>90%), so the pin
// traces that part. Each label goes on the side its point is nearer, spread so no two labels on a side are closer than
// 70 units, and kept inside the drawing's height.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname), dir = path.join(here, 'parts');
const svDir = path.join(here, '..', '..', 'public', 'player', 'lib', 'sv'), catFile = path.join(here, 'sv-catalogue.json');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
const readSv = id => { const t = fs.readFileSync(path.join(svDir, id + '.js'), 'utf8'); return JSON.parse(t.slice(t.indexOf(',') + 1).replace(/\);\s*$/, '')); };

function spread(items, GAP) {                         // items sorted by y; push apart to GAP, inside 30..990
  for (let i = 1; i < items.length; i++) items[i].y = Math.max(items[i].y, items[i - 1].y + GAP);
  if (items.length && items.at(-1).y > 990) { items.at(-1).y = 990; for (let i = items.length - 2; i >= 0; i--) items[i].y = Math.min(items[i].y, items[i + 1].y - GAP); }
  for (const it of items) it.y = Math.max(30, Math.round(it.y));
}

const b = await chromium.launch(); const page = await b.newPage();
const cat = JSON.parse(fs.readFileSync(catFile, 'utf8'));
for (const id of ids) {
  const file = path.join(dir, id + '.json'), spec = JSON.parse(fs.readFileSync(file, 'utf8')), d = readSv(id);
  await page.setViewportSize({ width: Math.ceil(d.w) + 20, height: 1020 });
  await page.setContent(`<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.w} 1000" width="${d.w}" height="1000">${
    d.shapes.map((s, i) => `<path data-i="${i}" d="${s[0]}" fill="${s[1]}"${s[3] ? ` stroke="${s[3]}" stroke-width="${s[4]}"` : ''}/>`).join('')}</svg></body>`);
  const parts = {};
  for (const [key, p] of Object.entries(spec.parts)) {
    // trace: false = a label only (checked by eye: the shape under the point is the whole drawing or the wrong part)
    const shapes = p.trace === false ? [] : p.shapes?.length ? p.shapes : await page.evaluate(([x0, y0, A]) => {
      // the point, then rings round it out to 32 units: a thin part (a tube, a fibre) is often just beside the point
      const near = [[0, 0], ...[8, 16, 24, 32].flatMap(r => [...Array(12)].map((_, k) => [r * Math.cos(k * Math.PI / 6), r * Math.sin(k * Math.PI / 6)]))];
      for (const [dx, dy] of near) { const x = x0 + dx, y = y0 + dy;
      const hit = document.elementsFromPoint(x, y).filter(e => e.dataset.i).map(e => { const r = e.getBBox(); return [+e.dataset.i, r.width * r.height, e.hasAttribute('stroke')]; });
      // an outlined shape first (highlights and textures have no outline); a single-organ drawing's organ is nearly all
      // of it, so then the smallest real shape under the point will do
      const fit = ([, a]) => a >= .0005 * A && a <= .9 * A;
      const ok = hit.find(h => fit(h) && h[2]) ?? hit.find(fit) ?? hit.filter(([, a]) => a >= .0005 * A).sort((p, q) => p[1] - q[1])[0];
      if (ok) return [ok[0]]; }
      return [];                                        // nothing near the point: a label with no trace
    }, [p.at[0], p.at[1], d.w * 1000]);
    parts[key] = { name: p.name, at: p.at, shapes, kind: p.kind ?? 'part', ...(p.trace === false && { trace: false }) };
  }
  for (const side of ['L', 'R']) {
    const items = Object.entries(parts).filter(([, p]) => (p.at[0] < d.w / 2 ? 'L' : 'R') === side).map(([k, p]) => ({ k, y: p.at[1] })).sort((a, b) => a.y - b.y);
    // ~24 board pixels apart: a lesson draws it about min(470, 440 000 / w) px tall (the pins' words need the sides)
    spread(items, Math.max(70, Math.ceil(24 * 1000 / Math.min(470, 440000 / d.w))));
    for (const it of items) parts[it.k].label = [side, it.y];
  }
  d.parts = parts;
  fs.writeFileSync(path.join(svDir, id + '.js'), `SV.add(${JSON.stringify(id)},${JSON.stringify(d)});\n`);
  fs.writeFileSync(file, JSON.stringify({ parts: Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, { name: p.name, at: p.at, kind: p.kind, shapes: p.shapes, ...(p.trace === false && { trace: false }) }])) }, null, 1));
  const c = cat.find(x => x.id === id); if (c) c.parts = Object.keys(parts);
  console.log(id, Object.entries(parts).map(([k, p]) => `${k}${p.shapes.length ? '' : '(no trace)'}`).join(' '));
}
fs.writeFileSync(catFile, JSON.stringify(cat));
await b.close();
