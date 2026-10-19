// Library drawings the model made (founder, 19 Oct 2026). A lesson that draws something the library lacks names its
// parts new_<name>_<part> (the subject prompts' DRAW_OWN rule); after the video is saved those lines are kept as a
// candidate (save_drawing_candidates), an admin approves one on /admin, and it becomes an "sv id=<slug>" drawing:
// the same {w, h: 1000, shapes: [[d, fill, opacity, stroke, width]]} data as the Servier and Bioicons drawings.

const KEEP = new Set(['path', 'circle', 'ellipse', 'rect', 'line']);   // shapes only: never words
const PART = /^new_([a-z]{2,30})_[a-z0-9_]{1,40}$/;

// One element line, as the player reads it: "type n n n opt=v ... | content".
function parseLine(spec) {
  const s = String(spec), bar = s.indexOf('|'), head = (bar < 0 ? s : s.slice(0, bar)).trim().split(/\s+/);
  const n = [], o = {};
  for (const t of head.slice(1)) { const m = /^(\w+)=(.*)$/.exec(t); if (m) o[m[1]] = m[2]; else if (t !== '' && !isNaN(+t)) n.push(+t); }
  return { type: head[0], n, o, content: bar < 0 ? '' : s.slice(bar + 1).trim() };
}

// The parts of each new drawing in a finished script: [{name, lines: {id: line}}], at most 3, each 2-60 shapes.
export function candidateGroups(els) {
  const groups = {};
  for (const [id, spec] of Object.entries(els || {})) {
    const m = PART.exec(id), line = String(spec);
    if (!m || line.length > 4000 || !KEEP.has(parseLine(line).type)) continue;
    (groups[m[1]] ||= {})[id] = line;
  }
  return Object.entries(groups).filter(([, l]) => Object.keys(l).length >= 2 && Object.keys(l).length <= 60)
    .slice(0, 3).map(([name, lines]) => ({ name, lines }));
}

// SVG path data -> absolute commands, each as [cmd, ...numbers]. H/V become L; arcs keep their radii and flags.
const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
export function absolute(d) {
  const toks = String(d).match(/[MLHVCSQTAZ]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) || [], out = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
  const num = () => { const v = +toks[i++]; if (!Number.isFinite(v)) throw new Error('bad path'); return v; };
  while (i < toks.length) {
    if (/[a-z]/i.test(toks[i])) cmd = toks[i++];
    else if (!cmd) throw new Error('bad path');
    const C = cmd.toUpperCase(), rel = cmd !== C;
    if (C === 'Z') { out.push(['Z']); x = sx; y = sy; if (i < toks.length && !/[a-z]/i.test(toks[i])) throw new Error('bad path'); continue; }
    const a = Array.from({ length: ARGS[C] }, num);
    if (C === 'H') { const nx = rel ? x + a[0] : a[0]; out.push(['L', nx, y]); x = nx; }
    else if (C === 'V') { const ny = rel ? y + a[0] : a[0]; out.push(['L', x, ny]); y = ny; }
    else if (C === 'A') { const ex = rel ? x + a[5] : a[5], ey = rel ? y + a[6] : a[6]; out.push(['A', a[0], a[1], a[2], a[3], a[4], ex, ey]); x = ex; y = ey; }
    else {
      for (let k = 0; k < a.length; k += 2) if (rel) { a[k] += x; a[k + 1] += y; }
      out.push([C, ...a]); x = a[a.length - 2]; y = a[a.length - 1];
      if (C === 'M') { sx = x; sy = y; cmd = rel ? 'l' : 'L'; }     // extra pairs after M are line-tos
    }
  }
  return out;
}

// A shape line -> absolute path commands (circle, ellipse, rect, line become paths).
function shapeOf({ type, n, content }) {
  const k = .5523;
  if (type === 'path') return absolute(content);
  if (type === 'line') return [['M', n[0], n[1]], ['L', n[2], n[3]]];
  if (type === 'rect') { const [x, y, w, h] = n; return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']]; }
  const [cx, cy, rx, ry = rx] = type === 'circle' ? [n[0], n[1], n[2], n[2]] : n;
  return [['M', cx - rx, cy], ['C', cx - rx, cy - k * ry, cx - k * rx, cy - ry, cx, cy - ry], ['C', cx + k * rx, cy - ry, cx + rx, cy - k * ry, cx + rx, cy],
    ['C', cx + rx, cy + k * ry, cx + k * rx, cy + ry, cx, cy + ry], ['C', cx - k * rx, cy + ry, cx - rx, cy + k * ry, cx - rx, cy], ['Z']];
}

const COLOUR = /^#[0-9a-f]{3,8}$/i;
// The approved candidate's lines (back to front) -> library data in a 1000-tall box. Throws on a line it cannot read.
export function toDrawing(lines) {
  const parts = Object.values(lines).map(parseLine).filter(p => KEEP.has(p.type)).map(p => ({ p, cmds: shapeOf(p) }));
  if (!parts.length) throw new Error('no shapes');
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const { cmds } of parts) for (const c of cmds) {
    const xy = c[0] === 'A' ? [c[6], c[7]] : c.slice(1);
    for (let k = 0; k + 1 < xy.length; k += 2) { x0 = Math.min(x0, xy[k]); x1 = Math.max(x1, xy[k]); y0 = Math.min(y0, xy[k + 1]); y1 = Math.max(y1, xy[k + 1]); }
  }
  if (!(y1 > y0) || !(x1 > x0)) throw new Error('flat drawing');
  const s = 1000 / (y1 - y0), X = v => Math.round((v - x0) * s), Y = v => Math.round((v - y0) * s), R = v => Math.round(v * s);
  const shapes = parts.map(({ p, cmds }) => {
    const d = cmds.map(c => c[0] === 'Z' ? 'Z' : c[0] === 'A' ? `A${R(c[1])} ${R(c[2])} ${c[3]} ${c[4] ? 1 : 0} ${c[5] ? 1 : 0} ${X(c[6])} ${Y(c[7])}`
      : c[0] + c.slice(1).map((v, k) => k % 2 ? Y(v) : X(v)).join(' ')).join(' ');
    const fill = p.type !== 'line' && COLOUR.test(p.o.f ?? '') ? p.o.f : 'none';
    const stroke = p.o.c === 'none' ? null : COLOUR.test(p.o.c ?? '') ? p.o.c : '#222';   // the player's default ink
    return [d, fill, 1, stroke, stroke ? Math.round((+p.o.w || 5) * s * 10) / 10 : 0];
  });
  return { w: Math.round((x1 - x0) * s), h: 1000, shapes };
}

// The player's check of a drawing sent with a script (bridge.js keeps its own copy of this rule).
export function validDrawing(d) {
  return !!d && Number.isFinite(d.w) && d.w > 0 && d.w < 20000 && d.h === 1000 && Array.isArray(d.shapes) && d.shapes.length <= 2000
    && d.shapes.every(s => Array.isArray(s) && typeof s[0] === 'string' && s[0].length < 20000 && /^[MLCSQTAZ0-9 .-]*$/.test(s[0])
      && (s[1] === 'none' || COLOUR.test(s[1])) && (s[3] === null || COLOUR.test(s[3])));
}

// Approved drawings as a find_drawing category (the same line shape as build-prompts.mjs's svCat).
export const SAVED_CAT = 'saved';
export const savedCat = rows => ({ cat: SAVED_CAT, lines: rows.map(r => ({ name: r.slug, sig: `sv id=${r.slug} cx cy height`,
  example: `sv id=${r.slug} 480 270 300`, desc: `${r.name} (whiteboard drawing; width ${(r.data.w / 1000).toFixed(2)} x its height): ${[r.name, ...(r.tags || [])].join(' ')}` })) });
