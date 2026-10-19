// Shrinks library drawings over MAX_BYTES (founder, 19 Oct 2026) without visibly changing them:
//   node scripts/library/shrink-sv.mjs [id ...]          (no ids: every catalogue drawing over the cap)
// Run it on a freshly built drawing only: each pass is lossy, and it rewrites the ids' parts files' shape indices.
// Each outline is flattened, thinned (Douglas-Peucker, `tol` drawing units; the drawing is 1000 tall) and written as
// whole-number relative line-tos; specks under 1 unit across go; shapes of one style become one path when nothing
// painted between them overlaps and their pieces do not overlap (or all are outline-free single rings, turned one way
// round); colours may snap to steps of `q`. Shapes a part points at (pins trace them) keep their place and are never
// merged or dropped. `tol` and `q` step up until the file fits; a file that never fits is left as it was.
import fs from 'node:fs';
import path from 'node:path';
import { MAX_BYTES } from './svg2sv.mjs';
const here = path.dirname(new URL(import.meta.url).pathname), root = path.join(here, '..', '..');
const svDir = path.join(root, 'public', 'player', 'lib', 'sv'), cat = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'servier', 'sv-catalogue.json'), 'utf8'));
// [tol, q, speck size] tried in turn; the last drops specks up to 4 units (dense stipple thins) and snaps colours harder.
// tol stays under ~1.2 screen px: a lesson shows a drawing about min(470, 440 000 / w) px tall.
const STEPS = [[0.5, 1], [0.7, 1], [1, 1], [1, 4], [1.4, 4], [2, 6], [2.5, 8], [3, 8], [4, 8], [5, 8], [2.5, 12, 4]], TARGET = MAX_BYTES - 5000;

// "M x y C ... L ... Z" (absolute, as the library stores it; relative too) -> subpaths of points, curves flattened
function outlines(d, tol) {
  const toks = d.match(/[a-z]|-?(?:\d+\.?\d*|\.\d+)/gi) || [], subs = [];
  let i = 0, cmd = '', x = 0, y = 0, cur = null;
  const num = () => +toks[i++];
  const bez = (x0, y0, x1, y1, x2, y2, x3, y3, out, depth = 0) => {   // subdivide until the control points hug the chord
    const dx = x3 - x0, dy = y3 - y0, L = Math.hypot(dx, dy) || 1e-9;
    const d1 = Math.abs((x1 - x0) * dy - (y1 - y0) * dx) / L, d2 = Math.abs((x2 - x0) * dy - (y2 - y0) * dx) / L;
    if (depth > 12 || Math.max(d1, d2) < tol / 4) { out.push([x3, y3]); return; }
    const ax = (x0 + x1) / 2, ay = (y0 + y1) / 2, bx = (x1 + x2) / 2, by = (y1 + y2) / 2, cx = (x2 + x3) / 2, cy = (y2 + y3) / 2;
    const ex = (ax + bx) / 2, ey = (ay + by) / 2, fx = (bx + cx) / 2, fy = (by + cy) / 2, mx = (ex + fx) / 2, my = (ey + fy) / 2;
    bez(x0, y0, ax, ay, ex, ey, mx, my, out, depth + 1); bez(mx, my, fx, fy, cx, cy, x3, y3, out, depth + 1);
  };
  while (i < toks.length) {
    if (/[a-z]/i.test(toks[i])) cmd = toks[i++];
    const C = cmd.toUpperCase(), r = cmd !== C, ox = r ? x : 0, oy = r ? y : 0;
    if (C === 'Z') { if (cur) { cur.closed = true; x = cur.pts[0][0]; y = cur.pts[0][1]; cur = null; } continue; }
    if (C === 'M') { x = ox + num(); y = oy + num(); cur = { pts: [[x, y]], closed: false }; subs.push(cur); cmd = r ? 'l' : 'L'; continue; }
    if (!cur) { cur = { pts: [[x, y]], closed: false }; subs.push(cur); }
    if (C === 'L') { x = ox + num(); y = oy + num(); cur.pts.push([x, y]); }
    else if (C === 'C') { const a = [ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()]; bez(x, y, ...a, cur.pts); x = a[4]; y = a[5]; }
    else throw new Error('unexpected path command ' + cmd);
  }
  return subs;
}

function dp(pts, tol) {                                   // Douglas-Peucker, iterative
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let far = -1, fd = tol;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    for (let k = a + 1; k < b; k++) {
      const [px, py] = pts[k], dd = L ? Math.abs((px - ax) * dy - (py - ay) * dx) / L : Math.hypot(px - ax, py - ay);
      if (dd > fd) { fd = dd; far = k; }
    }
    if (far > 0) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  return pts.filter((_, k) => keep[k]);
}

const join = ns => ns.reduce((s, n) => s + (s && n >= 0 ? ' ' : '') + n, '');
// one shape -> {d, box, one} (d null when nothing visible is left; one: a single ring, turned clockwise when `turn`)
function shrinkPath(d, tol, filled, turn) {
  let out = '', px = 0, py = 0, n = 0, ring = false; const box = [Infinity, Infinity, -Infinity, -Infinity];
  const subs = outlines(d, tol); if (subs.length !== 1) turn = false;   // only a lone ring turns: a hole must keep its way round
  for (const s of subs) {
    let pts = s.pts;
    if (s.closed && pts.length > 2) {                      // a ring: split at the point farthest from the start
      let far = 0, fd = -1; pts.forEach(([x, y], k) => { const v = (x - pts[0][0]) ** 2 + (y - pts[0][1]) ** 2; if (v > fd) { fd = v; far = k; } });
      const all = pts; pts = [...dp(all.slice(0, far + 1), tol), ...dp([...all.slice(far), all[0]], tol).slice(1, -1)];
      if (pts.length < 3) pts = [0, 1, 2, 3].map(k => all[Math.floor(k * all.length / 4)]);   // a dot stays a dot
    } else pts = dp(pts, tol);
    const r = []; for (const [x, y] of pts) { const p = [Math.round(x), Math.round(y)]; if (!r.length || p[0] !== r.at(-1)[0] || p[1] !== r.at(-1)[1]) r.push(p); }
    if (s.closed && r.length > 1 && r[0][0] === r.at(-1)[0] && r[0][1] === r.at(-1)[1]) r.pop();
    if (r.length < (filled && s.closed ? 3 : 2)) continue;
    n++; ring = s.closed;
    if (turn && s.closed && r.reduce((a, [x, y], k) => { const [u, v] = r[(k + 1) % r.length]; return a + x * v - u * y; }, 0) < 0) r.splice(1, r.length, ...r.slice(1).reverse());
    for (const [x, y] of r) { box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y); box[2] = Math.max(box[2], x); box[3] = Math.max(box[3], y); }
    out += (out ? 'm' + join([r[0][0] - px, r[0][1] - py]) : 'M' + join(r[0])) + 'l' + join(r.slice(1).flatMap(([x, y], k) => [x - r[k][0], y - r[k][1]])) + (s.closed ? 'z' : '');
    [px, py] = s.closed ? r[0] : r.at(-1);
  }
  return { d: out || null, box, one: n === 1 && ring };
}

// a colour snapped to steps of q per channel (q 1: as it was); invisible below ~8
const snap = (c, q) => q < 2 || !/^#[0-9a-f]{6}$/i.test(c ?? '') ? c
  : '#' + [1, 3, 5].map(k => Math.min(255, Math.round(parseInt(c.slice(k, k + 2), 16) / q) * q).toString(16).padStart(2, '0')).join('');
const apart = (b, boxes) => boxes.every(o => b[0] > o[2] || b[2] < o[0] || b[1] > o[3] || b[3] < o[1]);

export function shrink(data, tol, q = 1, speck = 1) {
  const inPart = new Set(Object.values(data.parts || {}).flatMap(p => p.shapes || []));
  const kept = [], remap = new Map();                     // kept: {s, boxes, part}; remap: old index -> new (part shapes)
  data.shapes.forEach((s0, i) => {
    const s = [s0[0], snap(s0[1], q), s0[2], snap(s0[3], q), s0[4]], [, fill, alpha, stroke, w] = s;
    const solid = fill !== 'none' && !stroke && alpha === 1, { d: nd, box, one } = shrinkPath(s[0], tol, fill !== 'none', solid), part = inPart.has(i);
    if (!part && (!nd || (fill === 'none' && !stroke) || alpha === 0 || Math.max(box[2] - box[0], box[3] - box[1]) + (stroke ? w : 0) < speck)) return;
    const pad = (stroke ? w : 0) + 1, b = [box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad], style = JSON.stringify(s.slice(1));
    // join an earlier shape of the same style when nothing painted since overlaps this one (so it may move down to
    // there) and it overlaps none of that shape's pieces (one path's pieces must not overlap: winding could cut holes),
    // or both are outline-free single rings of one solid colour, all turned clockwise: then overlaps fill just the same
    if (!part && alpha === 1) for (let k = kept.length - 1; k >= Math.max(0, kept.length - 400); k--) {
      const e = kept[k];
      if (!e.part && e.style === style && (apart(b, e.boxes) || (solid && one && e.rings))) { e.s[0] += nd; e.boxes.push(b); e.rings &&= solid && one; return; }   // its M is absolute
      if (!apart(b, e.boxes)) break;
    }
    if (part) remap.set(i, kept.length);
    kept.push({ s: [nd ?? 'M0 0', ...s.slice(1)], boxes: [b], part, style, rings: solid && one });
  });
  const out = { ...data, shapes: kept.map(e => e.s) };
  if (data.parts) out.parts = Object.fromEntries(Object.entries(data.parts).map(([k, p]) => [k, { ...p, shapes: (p.shapes || []).map(i => remap.get(i)) }]));
  return { out, remap };
}

const read = f => { const t = fs.readFileSync(f, 'utf8'); return JSON.parse(t.slice(t.indexOf(',') + 1).replace(/\);\s*$/, '')); };
const body = (id, d) => `SV.add(${JSON.stringify(id)},${JSON.stringify(d)});\n`;

if (import.meta.url === `file://${process.argv[1]}`) {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : cat.map(c => c.id).filter(id => fs.statSync(path.join(svDir, id + '.js')).size > MAX_BYTES);
  const left = [];
  for (const id of ids) {
    const file = path.join(svDir, id + '.js'), data = read(file), before = fs.statSync(file).size;
    let best = null;
    for (const [tol, q, speck] of STEPS.filter(([t]) => t * Math.min(470, 440000 / data.w) / 1000 <= 1.2)) { const r = shrink(data, tol, q, speck), t = body(id, r.out); best = { ...r, t, tol, q, speck }; if (t.length <= TARGET) break; }
    if (best.t.length > MAX_BYTES) { left.push(`${id} ${Math.round(best.t.length / 1000)} KB`); console.log(id, 'still', Math.round(best.t.length / 1000), 'KB: left as it was'); continue; }
    fs.writeFileSync(file, best.t);
    const pf = path.join(root, 'scripts', 'servier', 'parts', id + '.json');   // the parts file keeps the same indices
    if (data.parts && fs.existsSync(pf)) {
      const spec = JSON.parse(fs.readFileSync(pf, 'utf8'));
      for (const p of Object.values(spec.parts)) if (p.shapes) p.shapes = p.shapes.map(i => best.remap.get(i));
      fs.writeFileSync(pf, JSON.stringify(spec, null, 1));
    }
    console.log(id, Math.round(before / 1000), '->', Math.round(best.t.length / 1000), 'KB', `tol ${best.tol} q ${best.q}${best.speck ? ` speck ${best.speck}` : ''}`, `${data.shapes.length} -> ${best.out.shapes.length} shapes`);
  }
  if (left.length) console.log('over the cap still:', left.join(', '));
}
