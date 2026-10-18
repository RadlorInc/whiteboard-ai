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
const GAP = 70;

function spread(items) {                              // items sorted by y; push apart to GAP, inside 30..990
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
    const shapes = p.shapes?.length ? p.shapes : await page.evaluate(([x, y, A]) => {
      const hit = document.elementsFromPoint(x, y).filter(e => e.dataset.i).map(e => { const r = e.getBBox(); return [+e.dataset.i, r.width * r.height]; });
      // a single-organ drawing's organ is nearly all of it: then the smallest real shape under the point will do
      const ok = hit.find(([, a]) => a >= .0005 * A && a <= .9 * A) ?? hit.filter(([, a]) => a >= .0005 * A).sort((p, q) => p[1] - q[1])[0];
      return ok ? [ok[0]] : [];                         // nothing under the point: a label with no trace
    }, [p.at[0], p.at[1], d.w * 1000]);
    parts[key] = { name: p.name, at: p.at, shapes, kind: p.kind ?? 'part' };
  }
  for (const side of ['L', 'R']) {
    const items = Object.entries(parts).filter(([, p]) => (p.at[0] < d.w / 2 ? 'L' : 'R') === side).map(([k, p]) => ({ k, y: p.at[1] })).sort((a, b) => a.y - b.y);
    spread(items);
    for (const it of items) parts[it.k].label = [side, it.y];
  }
  d.parts = parts;
  fs.writeFileSync(path.join(svDir, id + '.js'), `SV.add(${JSON.stringify(id)},${JSON.stringify(d)});\n`);
  fs.writeFileSync(file, JSON.stringify({ parts: Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, { name: p.name, at: p.at, kind: p.kind, shapes: p.shapes }])) }, null, 1));
  const c = cat.find(x => x.id === id); if (c) c.parts = Object.keys(parts);
  console.log(id, Object.entries(parts).map(([k, p]) => `${k}${p.shapes.length ? '' : '(no trace)'}`).join(' '));
}
fs.writeFileSync(catFile, JSON.stringify(cat));
await b.close();
