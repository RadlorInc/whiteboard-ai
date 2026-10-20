// Whiteboard library — chemgr: upper-division and graduate chemistry diagrams (19 Oct 2026).
// Symmetry, Hückel and frontier orbitals, potential surfaces and Marcus theory, organic mechanisms and synthesis,
// catalysis and coordination, diffraction, NMR, photophysics, electrochemistry, chromatography, kinetics,
// thermodynamics, surfaces, polymers, nuclear stability and solutions.
// Catalogue: chemgr.txt. Same helpers and look as chemuni.js. Molecule structures themselves live elsewhere.
(() => {
  const DK = '#33363b', RED = '#c0392b', BLU = '#2b6cc4', GRN = '#2c6a22', VIO = '#7a4ab0', ORG = '#c97a10', GRY = '#8a9098';
  const G = (cx, cy, s, rot, parent) => mk('g', { transform: `translate(${cx} ${cy}) rotate(${rot || 0}) scale(${s})` }, parent);
  const fl = (g, d, fill, extra = {}) => mk('path', { d, fill, filter: 'url(#wc)', class: 'fillable', ...extra }, g);
  const still = (g, d, c, w = 3, extra = {}) => line(g, d, c, w, { ...extra, class: 'ink head' });
  const part = (g, d, fill, ink = DK, w = 3) => { fl(g, d, fill); return still(g, d, ink, w); };
  const C = (x, y, r) => `M${x + r} ${y} A${r} ${r} 0 1 1 ${x - r} ${y} A${r} ${r} 0 1 1 ${x + r} ${y} Z`;
  const E = (x, y, rx, ry) => `M${x + rx} ${y} A${rx} ${ry} 0 1 1 ${x - rx} ${y} A${rx} ${ry} 0 1 1 ${x + rx} ${y} Z`;
  const R = (x, y, w, h) => `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
  const P = (x, y) => `${(+x).toFixed(1)} ${(+y).toFixed(1)}`;
  const rad = d => d * Math.PI / 180;
  const tip = (g, x, y, ax, ay, c, w = 3) => still(g, head(x, y, ax, ay, 8 + w * 1.6), c, w);
  const arrow = (g, x1, y1, x2, y2, c, w = 3, moving = false) => { (moving ? line : still)(g, `M${P(x1, y1)} L${P(x2, y2)}`, c, w); tip(g, x2, y2, x1, y1, c, w); };
  const dbl = (g, x1, y1, x2, y2, c, w = 2) => { arrow(g, x1, y1, x2, y2, c, w); tip(g, x1, y1, x2, y2, c, w); };
  const dash = (g, d, c = GRY, w = 2) => still(g, d, c, w, { 'stroke-dasharray': '6 7' });
  // the hand fonts lack superscript glyphs (⁺ ⁻ ⁶ …): any run of them is drawn as raised small text instead.
  // also: "^{text}" raised, "_{text}" lowered (subscripts such as t_{R}, C_{2v}, E_{pa})
  const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻', PLAIN = '0123456789+−';
  const lb = (g, x, y, t, c = TXT.blue, s = 18, a = 'middle') => /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻^]|_\{/.test(t)
    ? lbsup(g, x, y, t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => '^{' + [...m].map(ch => PLAIN[SUPS.indexOf(ch)]).join('') + '}'), c, s, a) : label(g, x, y, t, c, s, a);
  const OFF = { '^': -.38, '_': .24, '': 0 };
  const lbsup = (g, x, y, txt, c, s, a = 'middle') => { const e = label(g, x, y, '', c, s, a); let lv = '';
    txt.split(/(\^\{[^}]*\}|_\{[^}]*\}|\^[0-9+−]+)/).forEach(part => { if (!part) return;
      const k = part[0] === '^' || part[0] === '_' ? part[0] : '', body = k ? part.slice(1).replace(/^\{|\}$/g, '') : part;
      const sp = mk('tspan', k ? { 'font-size': (s * .64).toFixed(1) } : {}, e), dy = (OFF[k] - OFF[lv]) * s;
      if (dy) sp.setAttribute('dy', dy.toFixed(1)); lv = k; sp.textContent = body; }); return e; };
  let SHOW = true; const showLab = o => o.lab !== '0' && o.labels !== '0', lbw = (...a) => SHOW ? lb(...a) : null;   // lab=0 / labels=0 hide the words
  const curve = (f, x0, x1, n = 160) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? ' L' : 'M') + P(x, f(x)); } return d; };
  const pts = a => 'M' + a.map(p => P(p[0], p[1])).join(' L');
  const axes = (g, x0, y0, x1, y1, xl, yl) => { still(g, `M${x0} ${y1} V${y0} H${x1}`, DK, 3); tip(g, x0, y1, x0, y1 + 10, DK, 3); tip(g, x1, y0, x1 - 10, y0, DK, 3);
    if (xl) lbw(g, x1, y0 + 26, xl, DK, 17, 'end'); if (yl) lbw(g, x0 + 8, y1 + 4, yl, DK, 17, 'start'); };
  const dot = (g, x, y, c = DK) => still(g, C(x, y, 1.6), c, 4);
  const harrow = (g, x, y, h, up, c = BLU) => { const a = up ? y + h / 2 : y - h / 2, b = up ? y - h / 2 : y + h / 2; still(g, `M${P(x, a)} L${P(x, b)}`, c, 2.2); still(g, head(x, b, x, a, 6), c, 2.2); };
  const curly = (g, x1, y1, cx1, cy1, cx2, cy2, x2, y2, c = RED) => { line(g, `M${P(x1, y1)} C${P(cx1, cy1)} ${P(cx2, cy2)} ${P(x2, y2)}`, c, 2.5); tip(g, x2, y2, cx2, cy2, c, 2.2); };
  // fishhook (single-electron) arrow: one barb only
  const fish = (g, x1, y1, cx1, cy1, cx2, cy2, x2, y2, c = RED) => { line(g, `M${P(x1, y1)} C${P(cx1, cy1)} ${P(cx2, cy2)} ${P(x2, y2)}`, c, 2.3);
    const a = Math.atan2(y2 - cy2, x2 - cx2); still(g, `M${P(x2 - 11 * Math.cos(a - .55), y2 - 11 * Math.sin(a - .55))} L${P(x2, y2)}`, c, 2.3); };
  // retrosynthetic arrow ⇒
  const retro = (g, x1, y1, x2, y2, c = DK) => { const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy * 4, ny = ux * 4, e = 10;
    still(g, `M${P(x1 + nx, y1 + ny)} L${P(x2 - ux * e + nx, y2 - uy * e + ny)} M${P(x1 - nx, y1 - ny)} L${P(x2 - ux * e - nx, y2 - uy * e - ny)}`, c, 2.4);
    still(g, `M${P(x2 - ux * 14 + nx * 3, y2 - uy * 14 + ny * 3)} L${P(x2, y2)} L${P(x2 - ux * 14 - nx * 3, y2 - uy * 14 - ny * 3)}`, c, 2.4); };
  // wavy (non-radiative) arrow
  const wavy = (g, x1, y1, x2, y2, c, w = 2.4) => { const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, n = Math.max(2, Math.round((L - 12) / 9));
    let d = `M${P(x1, y1)}`; for (let i = 1; i <= n * 4; i++) { const s = (L - 12) * i / (n * 4), a = 4 * Math.sin(i * Math.PI / 2); d += ` L${P(x1 + ux * s - uy * a, y1 + uy * s + ux * a)}`; }
    line(g, d + ` L${P(x2, y2)}`, c, w); tip(g, x2, y2, x1, y1, c, w); };
  const bracket = (g, x1, x2, y, c, up = 1) => still(g, `M${x1} ${y + 6 * up} V${y} H${x2} V${y + 6 * up}`, c, 1.8);
  const harm = (g, x, y, n) => { if (n > 0) harrow(g, x - (n === 2 ? 6 : 0), y - 10, 18, true); if (n === 2) harrow(g, x + 6, y - 10, 18, false); };
  // 3D: orthographic view, yaw about the vertical y axis then pitch; returns [sx, sy, depth]
  const view = (yaw, pitch, s, ox = 0, oy = 0) => ([x, y, z]) => { const a = rad(yaw), b = rad(pitch), x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
    return [ox + x1 * s, oy - (y * Math.cos(b) - z1 * Math.sin(b)) * s, y * Math.sin(b) + z1 * Math.cos(b)]; };
  // text box size estimate for the hand font
  const tw = (t, s) => [...t.replace(/[_^]\{|\}/g, '')].reduce((w, ch) => w + (/[₀-₉⁰-⁹⁺⁻ᵢ]/.test(ch) ? .32 : /[ilI.,:;'′|()\-–]/.test(ch) ? .3 : /[MWmw]/.test(ch) ? .78 : .52) * s, 0);
  // structure: atoms [sym, x, y, dx], bonds [i, j, order, colour]; bonds stop at each label's box; double bonds drawn
  // centred, or offset toward side (+1/-1) when given as order 2.1 / 2.2 (inner line toward the left/right of i→j)
  const mol = (g, atoms, bonds, s = 18, c = DK) => {
    const clear = (a, ux, uy) => { if (!a[0]) return 0; const hw = tw(a[0], s) / 2 + 3, hh = s * .42, ox = (a[3] || 0); let t = 1e9;
      if (ux) for (const e of [ox - hw, ox + hw]) { const k = e / ux; if (k > 0) t = Math.min(t, k); }
      if (uy) for (const e of [-hh, hh]) { const k = e / uy; if (k > 0) t = Math.min(t, k); } return t; };
    for (const [i, j, ord, col] of bonds) { const a = atoms[i], b = atoms[j], L = Math.hypot(b[1] - a[1], b[2] - a[2]), ux = (b[1] - a[1]) / L, uy = (b[2] - a[2]) / L;
      const ca = clear(a, ux, uy), cb = clear(b, -ux, -uy), x1 = a[1] + ux * ca, y1 = a[2] + uy * ca, x2 = b[1] - ux * cb, y2 = b[2] - uy * cb;
      const o = Math.round(ord), side = Math.round((ord - o) * 10), w = col ? 3.6 : 2.4, cc = col || c;
      const offs = o === 3 ? [[-5, 0], [0, 0], [5, 0]] : o === 2 ? (side ? [[0, 0], [side === 1 ? -6 : 6, .16]] : [[-3.2, 0], [3.2, 0]]) : [[0, 0]];
      for (const [k, sh] of offs) { const sx = (x2 - x1) * sh, sy = (y2 - y1) * sh; still(g, `M${P(x1 - uy * k + sx, y1 + ux * k + sy)} L${P(x2 - uy * k - sx, y2 + ux * k - sy)}`, cc, w); } }
    for (const a of atoms) if (a[0]) lb(g, a[1] + (a[3] || 0), a[2] + s * .35, a[0], a[4] || c, s); };
  // pointy-top hexagon vertex i (0 top, clockwise)
  const hv = (x, y, r, i) => [x + r * Math.sin(rad(60 * i)), y - r * Math.cos(rad(60 * i))];
  // benzene-type ring: doubles = list of edge starts (edge i joins vertex i and i+1), drawn inside
  const ring = (g, x, y, r, doubles, c = DK, red = []) => { for (let i = 0; i < 6; i++) { const [x1, y1] = hv(x, y, r, i), [x2, y2] = hv(x, y, r, i + 1);
      still(g, `M${P(x1, y1)} L${P(x2, y2)}`, red.includes(i) ? RED : c, red.includes(i) ? 3.6 : 2.4);
      if (doubles.includes(i)) { const k = .78, a = [x + (x1 - x) * k, y + (y1 - y) * k], b = [x + (x2 - x) * k, y + (y2 - y) * k], m = .14;
        still(g, `M${P(a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m)} L${P(b[0] - (b[0] - a[0]) * m, b[1] - (b[1] - a[1]) * m)}`, c, 2.4); } } };
  // a p orbital: two lobes, top filled when sign > 0 (size ∝ |coefficient|)
  const porb = (g, x, y, c, sc = 1) => { const h = (14 + 34 * Math.abs(c)) * sc, w = (7 + 12 * Math.abs(c)) * sc, up = c >= 0;
    const lobe = dir => `M${P(x, y)} C${P(x - w * 1.6, y + dir * h * .55)} ${P(x - w, y + dir * h)} ${P(x, y + dir * h)} C${P(x + w, y + dir * h)} ${P(x + w * 1.6, y + dir * h * .55)} ${P(x, y)} Z`;
    part(g, lobe(-1), up ? '#7fa8de' : '#fff', BLU, 1.8); part(g, lobe(1), up ? '#fff' : '#7fa8de', BLU, 1.8); };
  // marching squares: segments of f = lev on an n×n grid over [x0,x1]×[y0,y1]
  const contour = (f, x0, x1, y0, y1, n, lev) => { const V = [], seg = [];
    for (let j = 0; j <= n; j++) { V.push([]); for (let i = 0; i <= n; i++) V[j].push(f(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * j / n) - lev); }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], hit = [];
      for (let e = 0; e < 4; e++) { const [a, b] = [c[e], c[(e + 1) % 4]], va = V[a[1]][a[0]], vb = V[b[1]][b[0]];
        if ((va < 0) !== (vb < 0)) { const t = va / (va - vb), u = a[0] + (b[0] - a[0]) * t, v = a[1] + (b[1] - a[1]) * t; hit.push([x0 + (x1 - x0) * u / n, y0 + (y1 - y0) * v / n]); } }
      if (hit.length >= 2) seg.push([hit[0], hit[1]]); if (hit.length === 4) seg.push([hit[2], hit[3]]); }
    return seg; };
  const title = (g, t, y) => { if (t) lb(g, 0, y, t, TXT.blue, 20); };

  // the A + BC surface: Morse-type bonds with a coupling term (AB bond 25 % stronger: exoergic, early barrier)
  const MO = r => (1 - Math.exp(-1.8 * (r - 1))) ** 2 - 1;
  const PES = (x, y) => 1.25 * MO(x) + MO(y) + 1.3 * Math.sqrt(1.25) * MO(x) * MO(y);
  const pesPath = (() => { let cache;
    return () => { if (cache) return cache; const h = 1e-4, gr = (x, y) => [(PES(x + h, y) - PES(x - h, y)) / 2 / h, (PES(x, y + h) - PES(x, y - h)) / 2 / h];
      let [x, y] = [1.3, 1.3];                                           // Newton on ∇V = 0 → saddle point
      for (let k = 0; k < 60; k++) { const [gx, gy] = gr(x, y), [ax, ay] = gr(x + h, y), [bx, by] = gr(x, y + h), hxx = (ax - gx) / h, hxy = (ay - gy) / h, hyx = (bx - gx) / h, hyy = (by - gy) / h, det = hxx * hyy - hxy * hyx;
        x -= (hyy * gx - hxy * gy) / det; y -= (-hyx * gx + hxx * gy) / det; }
      const sad = [x, y], [ax, ay] = gr(x + h, y), [bx, by] = gr(x, y + h), [gx0, gy0] = gr(x, y);
      const hxx = (ax - gx0) / h, hxy = (ay - gy0) / h, hyy = (by - gy0) / h, tr = hxx + hyy, lam = tr / 2 - Math.sqrt(tr * tr / 4 - (hxx * hyy - hxy * hxy));
      let ev = [hxy, lam - hxx]; const n0 = Math.hypot(...ev); ev = [ev[0] / n0, ev[1] / n0];   // unstable direction
      const walk = sg => { const out = []; let [px, py] = [x + sg * ev[0] * .02, y + sg * ev[1] * .02];
        for (let k = 0; k < 900 && px < 3.5 && py < 3.5; k++) { out.push([px, py]); const [gx, gy] = gr(px, py), m = Math.hypot(gx, gy) || 1; px -= gx / m * .01; py -= gy / m * .01; } return out; };
      const a = walk(1), b = walk(-1), toR = (a[a.length - 1][0] > a[a.length - 1][1]) ? a : b, toP = toR === a ? b : a;
      return (cache = { sad, path: [...toR.reverse(), sad, ...toP] }); }; })();

  // cyclic voltammetry: explicit finite-difference simulation of a reversible couple R ⇌ O + e⁻ (equal D)
  const cvSim = (() => { let cache; return () => { if (cache) return cache; const nx = 110, dx = .4, dt = .06, k = dt / dx / dx; let O = new Array(nx).fill(0); const out = [];
    for (let t = 0; t < 32; t += dt) { const xi = t < 16 ? -8 + t : 8 - (t - 16), N = O.slice();
      for (let i = 1; i < nx - 1; i++) N[i] = O[i] + k * (O[i + 1] - 2 * O[i] + O[i - 1]);
      N[0] = 1 / (1 + Math.exp(-xi)); O = N; out.push([xi, (O[0] - O[1]) / dx]); }
    const m = Math.max(...out.map(p => p[1])); return (cache = out.map(([a, b]) => [a, b / m])); }; })();

  Object.assign(window.RECIPES, {
    // "pointgroup cx cy size k=h2o|nh3|bf3|ch4 |text"
    pointgroup: ([cx, cy, S = 480], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, S / 480, 0, p), k = ['h2o', 'nh3', 'bf3', 'ch4'].includes(o.k) ? o.k : 'h2o';
      const VW = { h2o: [35, 12], nh3: [25, 22], bf3: [20, 28], ch4: [28, 20] }[k], pr = view(VW[0], VW[1], 86, -100, 5);
      const sheet = (cs, fill, ink) => { const q = cs.map(pr); fl(g, pts(q) + ' Z', fill, { opacity: .3 }); still(g, pts(q) + ' Z', ink, 1.6); };
      const axis = (a, b, c, txt, end = 1) => { const A = pr(a), B = pr(b); still(g, `M${P(A[0], A[1])} L${P(B[0], B[1])}`, c, 2.6, { 'stroke-dasharray': '12 5' });
        const T = end ? B : A, U = end ? A : B, L = Math.hypot(T[0] - U[0], T[1] - U[1]); lbw(g, T[0] + (T[0] - U[0]) / L * 16, T[1] + (T[1] - U[1]) / L * 16 + 6, txt, c, 18); };
      const ball = (atoms, bonds) => { for (const [i, j] of bonds) { const A = pr(atoms[i][1]), B = pr(atoms[j][1]); still(g, `M${P(A[0], A[1])} L${P(B[0], B[1])}`, '#6b7178', 5); }
        atoms.map(a => [a, pr(a[1])]).sort((u, v) => u[1][2] - v[1][2]).forEach(([[sym, , r, fill], q]) => { part(g, C(q[0], q[1], r), fill, DK, 2); lb(g, q[0], q[1] + 5, sym, sym === 'H' ? DK : '#fff', r > 15 ? 16 : 13); }); };
      const ang = (i, r, y) => [r * Math.cos(rad(90 + 120 * i)), y, r * Math.sin(rad(90 + 120 * i))];
      let info;
      if (k === 'h2o') {
        sheet([[-1.45, 1.2, 0], [1.45, 1.2, 0], [1.45, -1.1, 0], [-1.45, -1.1, 0]], '#9cc3ee', BLU);
        sheet([[0, 1.2, -1.15], [0, 1.2, 1.15], [0, -1.1, 1.15], [0, -1.1, -1.15]], '#f4c27a', ORG);
        ball([['O', [0, .3, 0], 19, '#e04b3a'], ['H', [-.8, -.3, 0], 13, '#fff'], ['H', [.8, -.3, 0], 13, '#fff']], [[0, 1], [0, 2]]);
        axis([0, -1.45, 0], [0, 1.6, 0], RED, 'C_{2}');
        const a = pr([-1.45, -1.1, 0]), b = pr([0, -1.1, 1.15]); lbw(g, a[0] - 4, a[1] + 22, 'σ_{v} (molecular plane)', BLU, 15, 'start'); lbw(g, b[0] + 6, b[1] + 16, 'σ′_{v}', ORG, 17, 'start');
        info = ['H₂O', 'C_{2v}', ['E, C_{2}, σ_{v}, σ′_{v}'], 'order h = 4'];
      } else if (k === 'nh3') {
        const cols = [['#9cc3ee', BLU], ['#f4c27a', ORG], ['#b9e0a5', GRN]];
        for (let i = 0; i < 3; i++) { const d = ang(i, 1.25, 0); sheet([[d[0], 1.25, d[2]], [-d[0], 1.25, -d[2]], [-d[0], -.95, -d[2]], [d[0], -.95, d[2]]], ...cols[i]); }
        ball([['N', [0, .35, 0], 19, '#5b86c8'], ...[0, 1, 2].map(i => ['H', ang(i, .92, -.2), 13, '#fff'])], [[0, 1], [0, 2], [0, 3]]);
        axis([0, -1.4, 0], [0, 1.65, 0], RED, 'C_{3}');
        const q = pr([1.1, -.95, 0]); lbw(g, -100, 150, 'three σ_{v}, each holds one N–H', DK, 15, 'middle');
        info = ['NH₃', 'C_{3v}', ['E, 2C_{3}, 3σ_{v}'], 'order h = 6'];
      } else if (k === 'bf3') {
        sheet([[-1.55, 0, -1.4], [1.55, 0, -1.4], [1.55, 0, 1.4], [-1.55, 0, 1.4]], '#9cc3ee', BLU);
        for (let i = 0; i < 3; i++) axis(ang(i, -1.25, 0), ang(i, 1.45, 0), VIO, i === 0 ? 'C_{2}' : '', 1);
        ball([['B', [0, 0, 0], 18, '#f0a35a'], ...[0, 1, 2].map(i => ['F', ang(i, 1, 0), 15, '#5fae3a'])], [[0, 1], [0, 2], [0, 3]]);
        axis([0, -1.3, 0], [0, 1.45, 0], RED, 'C_{3}');
        const q = pr([-1.55, 0, 1.4]); lbw(g, q[0] - 6, q[1] + 22, 'σ_{h} (molecular plane)', BLU, 15, 'start');
        const v = pr(ang(1, 1.45, 0)); lbw(g, v[0] - 18, v[1] + 4, 'C_{2}', VIO, 15, 'end'); const w = pr(ang(2, 1.45, 0)); lbw(g, w[0] + 16, w[1] + 4, 'C_{2}', VIO, 15, 'start');
        info = ['BF₃', 'D_{3h}', ['E, 2C_{3}, 3C_{2}, σ_{h},', '2S_{3}, 3σ_{v}'], 'order h = 12'];
      } else {
        const c = .62, cube = [];
        for (const a of [-c, c]) for (const b of [-c, c]) { cube.push([[a, b, -c], [a, b, c]], [[a, -c, b], [a, c, b]], [[-c, a, b], [c, a, b]]); }
        dash(g, cube.map(([a, b]) => { const A = pr(a), B = pr(b); return `M${P(A[0], A[1])} L${P(B[0], B[1])}`; }).join(' '), '#a9aeb5', 1.4);
        axis([0, -1.45, 0], [0, 1.5, 0], VIO, 'S_{4} (also C_{2})', 1);
        const s3 = 1.45 / Math.sqrt(3); axis([-s3, -s3, -s3], [s3, s3, s3], RED, 'C_{3}', 1);
        ball([['C', [0, 0, 0], 18, '#55595f'], ...[[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(v => ['H', v.map(u => u * c), 12, '#fff'])], [[0, 1], [0, 2], [0, 3], [0, 4]]);
        lbw(g, -100, 158, 'H atoms on alternate cube corners', '#555', 14);
        info = ['CH₄', 'T_{d}', ['E, 8C_{3}, 3C_{2},', '6S_{4}, 6σ_{d}'], 'order h = 24'];
      }
      const [nm, pg, ops, ord] = info, ix = 175;
      lbw(g, ix, -80, nm, DK, 22); lbw(g, ix, -25, pg, RED, 44);
      ops.forEach((l, i) => lbw(g, ix, 18 + i * 24, l, DK, 17)); lbw(g, ix, 24 + ops.length * 24, ord, '#555', 15);
      lbw(g, ix, 110, 'dashed line = rotation axis', '#555', 13); lbw(g, ix, 128, 'tinted sheet = mirror plane', '#555', 13);
      title(g, t, -150);
      return g;
    },
    // "huckel cx cy width k=butadiene|benzene |text"
    huckel: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k === 'benzene' ? 'benzene' : 'butadiene';
      still(g, 'M-245 135 V-140', DK, 2); tip(g, -245, -140, -245, -130, DK, 2); lbw(g, -238, -128, 'E', DK, 16, 'start');
      if (k === 'butadiene') {
        const xs = [-185, -120], ax = [25, 70, 115, 160];
        const L = [[1.618, '+ 1.618β', [.372, .602, .602, .372], 2], [.618, '+ 0.618β', [.602, .372, -.372, -.602], 2], [-.618, '− 0.618β', [.602, -.372, -.372, .602], 0], [-1.618, '− 1.618β', [.372, -.602, .602, -.372], 0]];
        dash(g, `M${xs[0] - 10} 0 H${xs[1] + 10}`, GRY, 1.5); lbw(g, xs[0] - 16, 5, 'α', DK, 17, 'end');
        L.forEach(([e, txt, cs, n], i) => { const y = e * 62;
          still(g, `M${xs[0]} ${y} H${xs[1]}`, DK, 3); harm(g, (xs[0] + xs[1]) / 2, y, n);
          lb(g, xs[1] + 10, y + 6, `ψ_{${i + 1}}`, VIO, 18, 'start'); lbw(g, xs[1] + 42, y + 6, 'α ' + txt, DK, 15, 'start');
          still(g, `M${ax[0]} ${y} H${ax[3]}`, '#9aa0a6', 1.5);
          cs.forEach((c, j) => porb(g, ax[j], y, c, .6));
          for (let j = 0; j < 3; j++) if (cs[j] * cs[j + 1] < 0) dash(g, `M${(ax[j] + ax[j + 1]) / 2} ${y - 26} V${y + 26}`, RED, 1.6);
          lbw(g, 185, y + 5, `${i} node${i === 1 ? '' : 's'}`, TXT.red, 14, 'start');
          if (i === 1 || i === 2) lbw(g, (xs[0] + xs[1]) / 2, y + 20, i === 1 ? 'HOMO' : 'LUMO', '#555', 12); });
        lbw(g, 92, -135, 'C1  C2  C3  C4', '#555', 13);
        lbw(g, 0, 150, 'β < 0, so ψ₁ is lowest;  E_{π} = 4α + 4.472β (4 π electrons)', DK, 15);
      } else {
        const fx = -130, Rr = 100, lx = 30, lw = 50;
        still(g, C(fx, 0, Rr), '#9aa0a6', 1.8); dash(g, `M${fx - Rr + 5} 0 H${lx + 2 * lw + 30}`, GRY, 1.4); lbw(g, lx + 2 * lw + 38, 6, 'α', DK, 16, 'start');
        const V = [0, 1, 2, 3, 4, 5].map(i => [fx + Rr * Math.sin(rad(60 * i)), Rr * Math.cos(rad(60 * i))]);
        still(g, pts([...V, V[0]]), BLU, 2.6); V.forEach(([x, y]) => part(g, C(x, y, 4), BLU, BLU, 1));
        const lv = [[100, [[lx + lw * .75]], 'α + 2β', 2], [50, [[lx], [lx + lw * 1.5]], 'α + β', 2], [-50, [[lx], [lx + lw * 1.5]], 'α − β', 0], [-100, [[lx + lw * .75]], 'α − 2β', 0]];
        for (const [y, xs, txt, n] of lv) { dash(g, `M${fx + (y === 100 || y === -100 ? 0 : Rr * .87) + 6} ${y} H${xs[0][0] - 6}`, '#b0b5bb', 1.3);
          for (const [x] of xs) { still(g, `M${x} ${y} H${x + lw}`, DK, 3); harm(g, x + lw / 2, y, n); }
          lbw(g, lx + 2 * lw + 38, y + 6, txt, DK, 16, 'start'); }
        lb(g, lx + lw * .75 + lw / 2, 122, 'ψ₁', VIO, 15); lbw(g, lx + lw * 1.25, 68, 'HOMO (×2)', '#555', 12); lbw(g, lx + lw * 1.25, -36, 'LUMO (×2)', '#555', 12);
        lbw(g, fx, 128, 'Frost circle: radius 2|β|,', '#555', 14); lbw(g, fx, 146, 'ring drawn vertex down', '#555', 14);
        lbw(g, 80, 140, 'E_{π} = 6α + 8β;  delocalization energy 2β', DK, 15);
      }
      title(g, t, -150);
      return g;
    },
    // "pes cx cy width k=contour|profile |text"
    pes: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), k = o.k === 'profile' ? 'profile' : 'contour', { sad, path } = pesPath();
      if (k === 'contour') {
        const x0 = -205, y0 = 140, sz = 290, lo = .6, hi = 3.6, X = r => x0 + (r - lo) / (hi - lo) * sz, Y = r => y0 - (r - lo) / (hi - lo) * sz;
        fl(g, R(x0, y0 - sz, sz, sz), '#f6f8fb');
        const levels = [-1.2, -1.1, -.98, -.88, -.78, -.66, -.5, -.3, -.1, .2], cols = ['#1d4f91', '#2b6cc4', '#4f93d6', '#7fb7ea', '#9fb9c9', '#c7a46b', '#d27b0c', '#c96a2b', '#b05a3a', '#8a5a4a'];
        levels.forEach((lev, i) => { const seg = contour(PES, lo, hi, lo, hi, 70, lev); if (seg.length) still(g, seg.map(([a, b]) => `M${P(X(a[0]), Y(a[1]))} L${P(X(b[0]), Y(b[1]))}`).join(' '), cols[i], 1.7); });
        const pp = path.filter(([a, b]) => a < 3.5 && b < 3.5).map(([a, b]) => [X(a), Y(b)]);
        line(g, pts(pp), RED, 3.2, { 'stroke-dasharray': '9 7' }); const e = pp[pp.length - 1], f = pp[pp.length - 6]; tip(g, e[0], e[1], f[0], f[1], RED, 2.6);
        part(g, C(X(sad[0]), Y(sad[1]), 6), RED, RED, 1); lb(g, X(sad[0]) + 12, Y(sad[1]) - 10, '‡', RED, 24, 'start');
        axes(g, x0, y0, x0 + sz + 12, y0 - sz - 12, '', '');
        lbw(g, x0 + sz, y0 + 26, 'r_{AB}', DK, 18, 'end'); lbw(g, x0 - 12, y0 - sz + 8, 'r_{BC}', DK, 18, 'end');
        const ax = 105;
        lbw(g, ax, -95, 'reactant valley:', BLU, 15, 'start'); lbw(g, ax, -77, 'A + BC (r_{AB} large)', DK, 15, 'start');
        lbw(g, ax, -45, 'product valley:', BLU, 15, 'start'); lbw(g, ax, -27, 'AB + C (r_{BC} large)', DK, 15, 'start');
        lbw(g, ax, 5, '‡ saddle point =', RED, 15, 'start'); lbw(g, ax, 23, 'transition state', DK, 15, 'start');
        lbw(g, ax, 55, 'red dashes: minimum-', RED, 15, 'start'); lbw(g, ax, 73, 'energy path', RED, 15, 'start');
        lbw(g, ax, 105, 'upper right: A + B + C', '#555', 14, 'start'); lbw(g, ax, 123, 'blue = low energy', '#555', 14, 'start');
        lbw(g, X(3.0), Y(1.0) + 30, 'A + BC', DK, 15); lbw(g, X(1.0) + 6, Y(3.15), 'AB + C', DK, 15, 'start');
      } else {
        let s = 0; const prof = path.map((q, i) => { if (i) s += Math.hypot(q[0] - path[i - 1][0], q[1] - path[i - 1][1]); return [s, PES(q[0], q[1])]; });
        const x0 = -200, x1 = 200, y0 = 110, Sx = x => x0 + 10 + x / s * (x1 - x0 - 20), Vy = v => y0 - 10 - (v + 1.3) / .6 * 200;
        axes(g, x0, y0, x1 + 15, -125, '', 'V');
        lbw(g, x1 + 10, y0 + 26, 'reaction coordinate (distance along the path)', DK, 15, 'end');
        line(g, pts(prof.map(([a, v]) => [Sx(a), Vy(v)])), BLU, 3.4);
        const top = prof.reduce((m, q) => q[1] > m[1] ? q : m), r0 = prof[0], p0 = prof[prof.length - 1];
        lbw(g, Sx(top[0]), Vy(top[1]) - 14, '‡ saddle point', RED, 17);
        const ea = Sx(r0[0]) + 45; dash(g, `M${ea - 10} ${Vy(top[1])} H${Sx(top[0])}`, GRY, 1.5); dbl(g, ea, Vy(r0[1]), ea, Vy(top[1]), RED, 2);
        lbw(g, ea + 8, (Vy(r0[1]) + Vy(top[1])) / 2 + 2, 'E_{a}', TXT.red, 17, 'start');
        dash(g, `M${Sx(r0[0])} ${Vy(r0[1])} H${Sx(p0[0]) - 10}`, GRY, 1.5); dbl(g, Sx(p0[0]) - 20, Vy(r0[1]), Sx(p0[0]) - 20, Vy(p0[1]), GRN, 2);
        lbw(g, Sx(p0[0]) - 30, (Vy(r0[1]) + Vy(p0[1])) / 2 + 6, 'ΔE', TXT.green, 16, 'end');
        lbw(g, Sx(r0[0]), Vy(r0[1]) + 26, 'A + BC', DK, 16, 'start'); lbw(g, Sx(p0[0]) - 10, Vy(p0[1]) + 26, 'AB + C', DK, 16, 'end');
        lbw(g, 0, -115, 'energy along the minimum-energy path; early barrier', '#555', 14);
      }
      title(g, t, -165);
      return g;
    },
    // "marcus cx cy width k=normal|inverted |text"
    marcus: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), inv = o.k === 'inverted', dG = inv ? -1.8 : -.3, q0 = inv ? -1.15 : -.8, q1 = inv ? 2.05 : 1.85;
      const Gmin = dG - .12, Gmax = inv ? .95 : 1.25, x0 = -235, x1 = 175, yb = 125, yt = -105;
      const X = q => x0 + (q - q0) / (q1 - q0) * (x1 - x0), Y = G2 => yb - (G2 - Gmin) / (Gmax - Gmin) * (yb - yt);
      const GR = q => q * q, GP = q => (q - 1) ** 2 + dG, qs = (1 + dG) / 2, Gs = (1 + dG) ** 2 / 4;
      const arc = f => { const a = []; for (let i = 0; i <= 200; i++) { const q = q0 + (q1 - q0) * i / 200; if (f(q) <= Gmax) a.push([X(q), Y(f(q))]); } return pts(a); };
      axes(g, x0, yb, x1 + 15, yt - 15, '', 'G');
      lbw(g, x1 + 10, yb + 26, 'reaction coordinate (nuclear configuration)', DK, 15, 'end');
      line(g, arc(GR), BLU, 3.4); line(g, arc(GP), GRN, 3.4);
      lbw(g, X(Math.sqrt(Gmax)) + 8, Y(Gmax) + 4, 'D–A', BLU, 17, 'start'); lbw(g, X(inv ? 1.9 : 1.72) + 6, Y(GP(inv ? 1.9 : 1.72)) - 4, 'D⁺–A⁻', GRN, 17, 'start');
      dash(g, `M${X(0)} ${Y(0)} H${X(inv ? 1.55 : 1.42)}`, GRY, 1.5); dash(g, `M${X(1)} ${Y(dG)} H${X(inv ? 1.55 : 1.42)}`, GRY, 1.5);
      dbl(g, X(inv ? 1.45 : 1.32), Y(0), X(inv ? 1.45 : 1.32), Y(dG), DK, 2); lbw(g, X(inv ? 1.45 : 1.32) + 8, Y(dG / 2) + 6, 'ΔG°', DK, 17, 'start');
      if (inv) { dash(g, `M${X(0) - 25} ${Y(dG)} H${X(1)}`, GRY, 1.5); dbl(g, X(0), Y(dG), X(0), Y(GP(0)), VIO, 2); lbw(g, X(0) + 8, Y(dG + .5) + 6, 'λ', VIO, 20, 'start'); }
      else { dbl(g, X(1), Y(0), X(1), Y(1), VIO, 2); lbw(g, X(1) + 8, Y(.62), 'λ', VIO, 20, 'start'); }
      dash(g, `M${X(Math.min(0, qs)) - 20} ${Y(0)} H${X(0)}`, GRY, 1.5);
      const ax = X(qs); dash(g, `M${ax - 8} ${Y(0)} H${X(Math.max(0, qs))}`, GRY, 1.2);
      still(g, `M${ax - 5} ${Y(0)} h10 M${ax} ${Y(0)} V${Y(Gs)} M${ax - 5} ${Y(Gs)} h10`, RED, 2.2); part(g, C(X(qs), Y(Gs), 4), RED, RED, 1);
      lbw(g, ax + (inv ? -4 : 0), Y(0) + 22, 'ΔG‡', TXT.red, 17, inv ? 'end' : 'middle'); lb(g, X(qs) + 6, Y(Gs) - 10, '‡', RED, 18, 'start');
      lbw(g, 0, -150, 'ΔG‡ = (λ + ΔG°)² / 4λ', DK, 20); lbw(g, 0, -125, 'k_{ET} ∝ exp(−ΔG‡/k_{B}T);  λ = reorganization energy', '#555', 15);
      lbw(g, inv ? 0 : -40, yb + 50, inv ? 'inverted region: −ΔG° > λ, crossing left of the D–A minimum; rate falls' : 'normal region: −ΔG° < λ; more exergonic → faster (barrierless at −ΔG° = λ)', inv ? TXT.red : TXT.green, 14);
      title(g, t, -180);
      return g;
    },
    // "dielsalder cx cy width k=mech|orbitals |text"
    dielsalder: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k === 'orbitals' ? 'orbitals' : 'mech';
      if (k === 'mech') {
        const r = 46, ax = -165, ay = -5, sh = 42, v = i => hv(ax, ay, r, i), [c1, c2, c3, c4] = [v(0), v(5), v(4), v(3)], c6 = [v(1)[0] + sh, v(1)[1]], c5 = [v(2)[0] + sh, v(2)[1]];
        const at = q => ['', q[0], q[1]];
        mol(g, [at(c1), at(c2), at(c3), at(c4), at(c5), at(c6), ['CO₂Me', c5[0] + 34, c5[1] + 22, 18]], [[0, 1, 2.2], [1, 2, 1], [2, 3, 2.2], [4, 5, 2.1], [4, 6, 1]], 16);
        still(g, `M${P(...c1)} L${P(...c6)} M${P(...c4)} L${P(...c5)}`, '#c3c7cc', 1.8, { 'stroke-dasharray': '3 6' });
        const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const a1 = m(c1, c2), a2 = m(c2, c3); curly(g, a1[0] - 4, a1[1] - 2, a1[0] - 32, a1[1] - 8, a2[0] - 36, a2[1] - 8, a2[0] - 8, a2[1] - 2);
        const b1 = m(c3, c4), b2 = m(c4, c5); curly(g, b1[0] - 2, b1[1] + 4, b1[0] - 8, b1[1] + 40, b2[0] - 4, b2[1] + 34, b2[0], b2[1] + 6);
        const d1 = m(c5, c6), d2 = m(c6, c1); curly(g, d1[0] + 5, d1[1], d1[0] + 30, d1[1] - 30, d2[0] + 10, d2[1] - 38, d2[0], d2[1] - 7);
        arrow(g, 15, ay, 70, ay, DK, 2.6); lbw(g, 42, ay - 12, 'Δ', DK, 18);
        const px = 140, w = i => hv(px, ay, r, i);
        mol(g, [0, 1, 2, 3, 4, 5].map(i => at(w(i))).concat([['CO₂Me', w(2)[0] + 34, w(2)[1] + 22, 18]]),
          [[0, 1, 1, RED], [1, 2, 1], [2, 3, 1, RED], [3, 4, 1], [4, 5, 2.2], [5, 0, 1], [2, 6, 1]], 16);
        lbw(g, ax - 18, 85, 'diene (s-cis)', DK, 15); lbw(g, ax + 62, 85, 'dienophile', DK, 15); lbw(g, px, 85, 'cyclohexene', DK, 15);
        lbw(g, 0, 125, 'concerted [4+2] cycloaddition: 6 electrons, suprafacial on both partners', '#555', 14);
        lbw(g, 0, 147, 'red: the two new σ bonds; new π bond between C2 and C3', TXT.red, 14);
      } else {
        const dx = [-105, -35, 35, 105], dy = -55, ex = [-62, 62], ey = 70;
        still(g, `M${dx[0]} ${dy} H${dx[3]}`, '#9aa0a6', 1.6); still(g, `M${ex[0]} ${ey} H${ex[1]}`, '#9aa0a6', 1.6);
        [.60, .37, -.37, -.60].forEach((c, i) => porb(g, dx[i], dy, c, .8)); [-.70, .70].forEach((c, i) => porb(g, ex[i], ey, c, .8));
        still(g, `M${dx[0]} ${dy + 32} L${ex[0]} ${ey - 32} M${dx[3]} ${dy + 32} L${ex[1]} ${ey - 32}`, GRN, 2.4, { 'stroke-dasharray': '5 5' });
        lbw(g, -118, 13, 'in phase', TXT.green, 14, 'end'); lbw(g, 118, 13, 'in phase', TXT.green, 14, 'start');
        lbw(g, 0, -122, 'HOMO of diene (ψ₂): C1 and C4 lobes opposite', BLU, 16); lbw(g, 0, 140, 'LUMO of dienophile (π*)', BLU, 16);
        ['C1', 'C2', 'C3', 'C4'].forEach((s, i) => lbw(g, dx[i] + 14, dy - 32, s, '#555', 12, 'start'));
        lbw(g, 140, 60, 'both new σ bonds', DK, 14, 'start'); lbw(g, 140, 78, 'form with bonding', DK, 14, 'start'); lbw(g, 140, 96, 'overlap: [π4s + π2s],', DK, 14, 'start'); lbw(g, 140, 114, 'thermally allowed', TXT.green, 14, 'start');
        lbw(g, -250, 100, 'shaded = + phase', '#555', 13, 'start');
      }
      title(g, t, -160);
      return g;
    },
    // "fmo cx cy width |text"
    fmo: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), L = -150, Rx = 150, hw = 42;
      still(g, 'M-245 140 V-135', DK, 2); tip(g, -245, -135, -245, -125, DK, 2); lbw(g, -238, -122, 'E', DK, 16, 'start');
      const lvl = (x, y, n, txt, c = DK, w = hw) => { still(g, `M${x - w} ${y} H${x + w}`, c, 3); harm(g, x, y, n); if (txt) lbw(g, x, y + 18, txt, '#555', 13); };
      lvl(L, -110, 0, 'LUMO'); lvl(L, 25, 2, 'HOMO'); lvl(L, 95, 2, '');
      lvl(Rx, -25, 0, 'LUMO'); lvl(Rx, 115, 2, 'HOMO');
      lvl(0, 62, 2, '', GRN, 32); lvl(0, -60, 0, '', '#9aa0a6', 32); lbw(g, 0, 82, 'new bonding MO', TXT.green, 13); lbw(g, 0, 98, '(stabilized by ΔE)', TXT.green, 12); lbw(g, 0, -72, 'antibonding', '#777', 13);
      for (const [x1, y1] of [[L + hw, 25], [Rx - hw, -25]]) for (const y2 of [62, -60]) dash(g, `M${x1} ${y1} L${x1 < 0 ? -32 : 32} ${y2}`, y2 > 0 ? GRN : '#b0b5bb', 1.6);
      dbl(g, -85, 25, -85, -25, GRN, 2.2); dash(g, `M${L + hw + 2} -25 H${Rx - hw - 2}`, '#cfd3d8', 1); lbw(g, -95, -2, 'small gap:', TXT.green, 12, 'end'); lbw(g, -95, 12, 'strong', TXT.green, 12, 'end');
      dash(g, `M${L + hw + 2} -110 H${Rx + hw + 30}`, '#d5d8dc', 1); dbl(g, Rx + hw + 22, 115, Rx + hw + 22, -110, '#9aa0a6', 1.8);
      lbw(g, Rx + hw + 14, 50, 'large gap:', '#777', 13, 'end'); lbw(g, Rx + hw + 14, 66, 'weak', '#777', 13, 'end');
      lbw(g, L, -140, 'nucleophile', BLU, 18); lbw(g, L, -122, '(electron donor)', '#555', 13);
      lbw(g, Rx, -140, 'electrophile', RED, 18); lbw(g, Rx, -122, '(electron acceptor)', '#555', 13);
      lbw(g, 0, 160, 'stabilization ΔE ≈ (c_{Nu} c_{E} β)² / (E_{LUMO} − E_{HOMO}): smallest gap dominates', DK, 14);
      title(g, t, -170);
      return g;
    },
    // "aldol cx cy width enone=1 |text"
    aldol: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), en = o.enone === '1' || o.enone === 'yes', s = 17;
      // 1: hydroxide removes an α-H
      const y1 = -105; lb(g, -248, y1 + 6, 'HO⁻', BLU, 18, 'start'); dot(g, -234, y1 - 12, BLU); dot(g, -226, y1 - 12, BLU);
      mol(g, [['H', -180, y1 - 30], ['', -160, y1], ['', -125, y1 - 20], ['O', -90, y1], ['H', -125, y1 - 55]], [[0, 1, 1], [1, 2, 1], [2, 3, 2.2], [2, 4, 1]], s);
      curly(g, -228, y1 - 18, -226, y1 - 50, -205, y1 - 50, -190, y1 - 34);
      curly(g, -168, y1 - 13, -178, y1 + 22, -150, y1 + 22, -143, y1 - 7);
      curly(g, -104, y1 - 14, -100, y1 - 40, -82, y1 - 38, -86, y1 - 14);
      lbw(g, -160, y1 + 40, 'α-H removed', '#555', 12);
      arrow(g, -60, y1, -20, y1, DK, 2.5);
      mol(g, [['H₂C', 5, y1, 0], ['', 42, y1 - 20], ['O⁻', 78, y1, 2], ['H', 42, y1 - 55]], [[0, 1, 2], [1, 2, 1], [1, 3, 1]], s);
      lb(g, 112, y1 + 6, '+  H₂O', DK, 17, 'start'); lbw(g, 42, y1 + 34, 'enolate', TXT.blue, 14);
      lbw(g, 205, y1 + 6, '1  enolate', '#555', 13, 'middle'); lbw(g, 205, y1 + 22, 'formation', '#555', 13, 'middle');
      // 2: enolate adds to a second aldehyde
      const y2 = 0;
      mol(g, [['⁻O', -225, y2, -2], ['', -192, y2 - 20], ['CH₂', -155, y2, 2], ['H', -192, y2 - 55], ['', -88, y2], ['O', -88, y2 - 40], ['CH₃', -52, y2 + 20], ['H', -122, y2 + 22]],
        [[0, 1, 1], [1, 2, 2], [1, 3, 1], [4, 5, 2], [4, 6, 1], [4, 7, 1]], s);
      curly(g, -232, y2 - 12, -238, y2 - 42, -214, y2 - 40, -210, y2 - 16);
      curly(g, -170, y2 - 16, -160, y2 - 50, -118, y2 - 40, -96, y2 - 4);
      curly(g, -82, y2 - 22, -64, y2 - 26, -62, y2 - 46, -74, y2 - 50);
      arrow(g, -25, y2, 15, y2, DK, 2.5);
      const prod = (x0, y, oh, enone) => mol(g, [['O', x0, y - 18], ['', x0 + 28, y], ['', x0 + 58, y - 18], ['', x0 + 88, y], ['', x0 + 118, y - 18], ...(oh ? [[oh, x0 + 88, y + 34, oh === 'O⁻' ? 3 : 4]] : [])],
        [[0, 1, 2.2], [1, 2, 1], [2, 3, enone ? 2.2 : 1], [3, 4, 1], ...(oh ? [[3, 5, 1]] : [])], s);
      prod(35, y2 + 5, 'O⁻'); lbw(g, 103, y2 + 70, 'alkoxide', TXT.blue, 14);
      lbw(g, 205, y2 - 8, '2  C–C bond', '#555', 13); lbw(g, 205, y2 + 8, 'formation', '#555', 13);
      // 3: protonation (and optional dehydration)
      const y3 = 115, ax = en ? -235 : -150;
      arrow(g, ax, y3, ax + 45, y3, DK, 2.5); lbw(g, ax + 22, y3 - 10, 'H₂O', DK, 14);
      prod(ax + 62, y3, 'OH'); lb(g, ax + 180, y3 + 4, '+ HO⁻', DK, 16, 'start');
      lbw(g, ax + 120, y3 - 26, 'α', TXT.red, 14); lbw(g, ax + 138, y3 + 24, 'β', TXT.red, 14);
      lbw(g, ax + 120, y3 + 62, 'β-hydroxy aldehyde (aldol)', TXT.green, 14);
      if (en) { arrow(g, 15, y3, 70, y3, DK, 2.5); lbw(g, 42, y3 - 10, '−H₂O, Δ', DK, 13); lbw(g, 42, y3 + 18, 'E1cB', '#555', 12);
        prod(85, y3, '', true); lbw(g, 145, y3 + 40, 'α,β-unsaturated aldehyde', TXT.green, 14); }
      else lbw(g, 205, y3 + 4, '3  protonation', '#555', 13);
      title(g, t, -175);
      return g;
    },
    // "grignard cx cy width |text"
    grignard: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), s = 18;
      const y1 = -115; lbw(g, -150, y1 + 6, 'R–Br  +  Mg', DK, 19); arrow(g, -80, y1, -5, y1, DK, 2.5); lbw(g, -42, y1 - 10, 'dry Et₂O', DK, 13);
      lbw(g, 50, y1 + 6, 'R–MgBr', DK, 19); lbw(g, 165, y1 - 2, 'C–Mg polarized:', '#555', 13); lbw(g, 165, y1 + 14, 'carbon is nucleophilic', '#555', 13);
      const y2 = -10;
      mol(g, [['R', -225, y2], ['MgBr', -170, y2, 12], ['', -85, y2], ['O', -85, y2 - 40], ['R′', -115, y2 + 25], ['R″', -55, y2 + 25]], [[0, 1, 1], [2, 3, 2], [2, 4, 1], [2, 5, 1]], s);
      lb(g, -225, y2 - 18, 'δ−', TXT.red, 13); lb(g, -165, y2 - 18, 'δ+', TXT.red, 13);
      curly(g, -206, y2 + 4, -195, y2 + 62, -85, y2 + 66, -85, y2 + 6);
      curly(g, -79, y2 - 22, -60, y2 - 26, -60, y2 - 46, -73, y2 - 50);
      arrow(g, -25, y2, 20, y2, DK, 2.5);
      mol(g, [['', 90, y2], ['O⁻', 90, y2 - 40, 3], ['R′', 55, y2], ['R″', 125, y2], ['R', 90, y2 + 38]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], s);
      lb(g, 108, y2 - 42, '⁺MgBr', DK, 15, 'start'); lbw(g, 205, y2 + 6, 'alkoxide', TXT.blue, 14);
      const y3 = 105; arrow(g, -120, y3, -60, y3, DK, 2.5); lbw(g, -90, y3 - 12, 'H₃O⁺', DK, 15); lbw(g, -90, y3 + 20, 'workup', '#555', 12);
      mol(g, [['', 0, y3], ['OH', 0, y3 - 38, 4], ['R′', -35, y3], ['R″', 35, y3], ['R', 0, y3 + 36]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], s);
      lbw(g, 60, y3 + 6, '+  Mg²⁺ salts', DK, 15, 'start'); lbw(g, 0, y3 + 66, 'ketone → 3° alcohol;  aldehyde → 2°;  HCHO → 1°', '#555', 14);
      title(g, t, -165);
      return g;
    },
    // "wittig cx cy width |text"
    wittig: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), s = 18;
      const y1 = -60;
      mol(g, [['Ph₃P⁺', -200, y1 - 40, -12], ['⁻CHR', -200, y1 + 25, -6], ['O', -120, y1 - 40], ['', -120, y1 + 25], ['R′', -95, y1 + 50], ['R′', -145, y1 + 50]],
        [[0, 1, 1], [2, 3, 2], [3, 4, 1], [3, 5, 1]], s);
      curly(g, -200, y1 + 8, -175, y1 + 2, -150, y1 + 10, -132, y1 + 22);
      curly(g, -114, y1 - 8, -98, y1 - 30, -140, y1 - 72, -178, y1 - 50);
      lbw(g, -200, y1 + 72, 'ylide', TXT.blue, 14); lbw(g, -120, y1 + 82, 'ketone or aldehyde', TXT.blue, 14);
      arrow(g, -60, y1, -10, y1, DK, 2.5); lbw(g, -35, y1 - 12, '[2+2]', '#555', 13);
      const ox = (x, y) => mol(g, [['Ph₃P', x, y - 32, -12], ['O', x + 66, y - 32], ['CR′₂', x + 66, y + 32, 10], ['CHR', x, y + 32, -8]], [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], s);
      ox(30, y1); lbw(g, 63, y1 + 72, 'oxaphosphetane', TXT.blue, 14); lbw(g, 205, y1 + 2, '4-membered', '#555', 13); lbw(g, 205, y1 + 18, 'P–C–C–O ring', '#555', 13);
      const y2 = 80; ox(-210, y2);
      curly(g, -216, y2 + 4, -232, y2 + 20, -205, y2 + 58, -175, y2 + 44);
      curly(g, -138, y2 + 2, -125, y2 - 10, -140, y2 - 40, -175, y2 - 44);
      arrow(g, -95, y2, -50, y2, DK, 2.5); lbw(g, -72, y2 - 12, 'retro', '#555', 12);
      mol(g, [['RHC', -5, y2, -4], ['CR′₂', 60, y2, 6]], [[0, 1, 2]], s); lb(g, 100, y2 + 6, '+  Ph₃P=O', DK, 18, 'start');
      lbw(g, 30, y2 + 50, 'driving force: very strong P=O bond', TXT.red, 14); lbw(g, 30, y2 + 70, 'unstabilized ylide → mainly (Z)-alkene', '#555', 13);
      title(g, t, -165);
      return g;
    },
    // "eas cx cy width k=mech|directing |text"
    eas: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k === 'directing' ? 'directing' : 'mech', r = 30;
      const plus = (x, y, i) => { const [vx, vy] = hv(x, y, r, i); lb(g, x + (vx - x) * .55, y + (vy - y) * .55 + 6, '+', TXT.red, 18); };
      const sp3 = (x, y, fl = 1) => { const [vx, vy] = hv(x, y, r, 0); still(g, `M${P(vx, vy)} L${P(vx - 15, vy - 20)} M${P(vx, vy)} L${P(vx + 15, vy - 20)}`, DK, 2.4);
        lb(g, vx - 21 * fl, vy - 22, 'H', DK, 16); lb(g, vx + 22 * fl, vy - 22, 'E', RED, 16); };
      if (k === 'mech') {
        const y1 = -60, bx = -215;
        ring(g, bx, y1, r, [0, 2, 4]); lb(g, -158, y1 - 34, 'E⁺', RED, 20);
        const m = hv(bx, y1, r, .5); curly(g, m[0] - 2, m[1] + 4, m[0] + 14, m[1] - 30, -180, y1 - 48, -170, y1 - 42);
        arrow(g, -140, y1, -105, y1, DK, 2.5); lbw(g, -122, y1 - 10, 'slow', '#555', 12);
        const fx = [-50, 50, 150]; still(g, 'M-82 -125 h-7 V-10 h7 M182 -125 h7 V-10 h-7', DK, 2.2);
        [[[2, 4], 1], [[1, 4], 3], [[1, 3], 5]].forEach(([d, pi], i) => { ring(g, fx[i], y1, r, d); sp3(fx[i], y1); plus(fx[i], y1, pi); if (i < 2) lb(g, fx[i] + 50, y1 + 6, '↔', DK, 20); });
        lbw(g, 50, 8, 'arenium ion (σ-complex): + at ortho and para positions', TXT.blue, 14);
        const y2 = 85, ax = -150;
        ring(g, ax, y2, r, [2, 4]); sp3(ax, y2, -1); plus(ax, y2, 1);
        lb(g, ax + 72, y2 - 52, ':B', VIO, 17); curly(g, ax + 62, y2 - 64, ax + 55, y2 - 88, ax + 30, y2 - 86, ax + 24, y2 - 72);
        curly(g, ax + 9, y2 - r - 9, ax + 34, y2 - r - 4, ax + 32, y2 - r + 14, ax + 17, y2 - r + 10);
        arrow(g, -95, y2, -55, y2, DK, 2.5); lbw(g, -75, y2 - 10, 'fast', '#555', 12);
        ring(g, 0, y2, r, [0, 2, 4]); const [ex, ey] = hv(0, y2, r, 0); still(g, `M${ex} ${ey} V${ey - 18}`, DK, 2.4); lb(g, ex, ey - 22, 'E', RED, 16);
        lb(g, 45, y2 + 6, '+  H–B⁺', DK, 17, 'start');
        lbw(g, 160, y2 - 10, 'aromaticity', TXT.green, 14); lbw(g, 160, y2 + 8, 'restored', TXT.green, 14);
        lbw(g, 0, 150, 'E⁺ = NO₂⁺ (HNO₃/H₂SO₄), Br₂·FeBr₃, R⁺, RCO⁺ (AlCl₃); step 1 is rate-determining', '#555', 13);
      } else {
        const x0 = -255, xm = -85, x1 = 85, y0 = -120;
        still(g, `M${x0} ${y0} H${x1} M${x0} ${y0 + 30} H${x1} M${xm} ${y0} V${y0 + 215}`, DK, 2);
        lbw(g, (x0 + xm) / 2, y0 + 21, 'ortho / para directors', TXT.blue, 16); lbw(g, (xm + x1) / 2, y0 + 21, 'meta directors', TXT.red, 16);
        const op = [['strongly activating', '–NH₂, –NHR, –OH, –O⁻'], ['moderately activating', '–OR, –NHCOR'], ['weakly activating', '–R (alkyl), –Ph'], ['weakly deactivating', '–F, –Cl, –Br, –I']];
        op.forEach(([h, gs], i) => { lbw(g, x0 + 8, y0 + 52 + i * 46, h, i === 3 ? TXT.orange : TXT.green, 13, 'start'); lbw(g, x0 + 8, y0 + 70 + i * 46, gs, DK, 15, 'start'); });
        lbw(g, xm + 8, y0 + 52, 'all deactivating', TXT.red, 13, 'start');
        ['–NO₂, –NR₃⁺, –CF₃', '–CN, –SO₃H', '–CHO, –COR', '–CO₂H, –CO₂R'].forEach((l, i) => lbw(g, xm + 8, y0 + 74 + i * 24, l, DK, 15, 'start'));
        const bx = 175, by = -20; ring(g, bx, by, 34, [0, 2, 4]); const [vx, vy] = hv(bx, by, 34, 0); still(g, `M${vx} ${vy} V${vy - 20}`, DK, 2.4); lb(g, vx, vy - 26, 'Y', VIO, 18);
        [[1, 'o'], [5, 'o'], [2, 'm'], [4, 'm'], [3, 'p']].forEach(([i, s]) => { const [x, y] = hv(bx, by, 52, i); lbw(g, x, y + 6, s, s === 'm' ? TXT.red : TXT.blue, 18); });
        lbw(g, bx, 70, 'o/p: lone pair (+M) or alkyl', '#555', 12); lbw(g, bx, 86, 'stabilizes the σ-complex', '#555', 12);
        lbw(g, bx, 108, 'meta: −M/−I groups avoid', '#555', 12); lbw(g, bx, 124, '+ next to Y', '#555', 12);
        lbw(g, -85, 125, 'halogens: deactivate (−I) but direct o/p (+M)', TXT.orange, 13);
      }
      title(g, t, -160);
      return g;
    },
    // "retrosynthesis cx cy width |text"
    retrosynthesis: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), s = 18, tx = -190, ty = -20;
      mol(g, [['', tx, ty], ['OH', tx, ty - 40, 4], ['Ph', tx - 45, ty], ['Et', tx + 45, ty], ['CH₃', tx, ty + 38]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], s);
      const wav = (x, y, c) => still(g, `M${x} ${y - 14} q5 4 0 7 t0 7 t0 7 t0 7`, c, 2.2);
      wav(tx - 22, ty, RED); wav(tx + 22, ty, BLU); lbw(g, tx - 22, ty - 20, 'a', TXT.red, 14); lbw(g, tx + 22, ty - 20, 'b', TXT.blue, 14);
      lbw(g, tx, ty + 72, 'target', DK, 15); lbw(g, tx, ty + 90, '2-phenylbutan-2-ol', '#555', 13);
      retro(g, -135, -45, -95, -88, RED); retro(g, -135, 5, -95, 48, BLU);
      lbw(g, -80, -110, 'disconnection a:  Ph⁻  +  ⁺C(OH)(CH₃)Et', TXT.red, 15, 'start');
      lbw(g, -80, -86, 'synthons', '#777', 12, 'start');
      lbw(g, -80, -46, 'reagents (synthetic equivalents):', '#777', 12, 'start');
      lbw(g, -80, -20, 'PhMgBr  +  butan-2-one', TXT.green, 16, 'start');
      lbw(g, -80, 50, 'disconnection b:  Et⁻  +  ⁺C(OH)(CH₃)Ph', TXT.blue, 15, 'start');
      lbw(g, -80, 74, 'synthons', '#777', 12, 'start');
      lbw(g, -80, 104, 'reagents (synthetic equivalents):', '#777', 12, 'start');
      lbw(g, -80, 128, 'EtMgBr  +  acetophenone', TXT.green, 16, 'start');
      still(g, 'M-255 148 H255', '#d5d8dc', 1.2);
      lbw(g, -250, 175, 'forward:  PhMgBr + butan-2-one', DK, 15, 'start'); arrow(g, -5, 170, 60, 170, DK, 2.5); lbw(g, 28, 160, '1. Et₂O  2. H₃O⁺', '#555', 11);
      lbw(g, 70, 175, 'target', DK, 15, 'start'); lbw(g, 255, -130, '⇒ = "is made from"', '#555', 13, 'end');
      title(g, t, -160);
      return g;
    },
    // "catcycle cx cy width |text"
    catcycle: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), Rr = 105, oy = 0, at = a => [Rr * Math.cos(rad(a)), oy + Rr * Math.sin(rad(a))];
      const arcp = (a1, a2) => { const [x1, y1] = at(a1), [x2, y2] = at(a2); return `M${P(x1, y1)} A${Rr} ${Rr} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${P(x2, y2)}`; };
      for (const [a1, a2] of [[-68, 8], [52, 128], [172, 248]]) { line(g, arcp(a1, a2), DK, 3); const [x, y] = at(a2), [u, v] = at(a2 - 4); tip(g, x, y, u, v, DK, 2.6); }
      const st = (a, txt, fill, ink) => { const [x, y] = at(a), w = tw(txt.replace(/[⁰-⁹⁺⁻]/g, 'x'), 17) + 18; part(g, R(x - w / 2, y - 15, w, 30), fill, ink, 2); lb(g, x, y + 6, txt, DK, 17); };
      st(-90, 'L₂Pd(0)', '#d8ecd0', GRN); st(30, 'Ar–Pd(II)L₂–X', '#f6dfc0', ORG); st(150, 'Ar–Pd(II)L₂–Ar′', '#f6dfc0', ORG);
      const ins = (a, x, y, txt, out, c) => { const [u, v] = at(a), [ex, ey] = [u * 1.06, oy + (v - oy) * 1.06]; out ? arrow(g, ex, ey, x, y, c, 2.2, true) : arrow(g, x, y, ex, ey, c, 2.2, true);
        lb(g, x + (x > 0 ? 6 : -6), y + (y > 0 ? 18 : -6), txt, c, 16, x > 0 ? 'start' : 'end'); };
      ins(-30, 175, -105, 'Ar–X', false, BLU); ins(72, 120, 150, 'Ar′–B(OH)₂ + base', false, BLU); ins(108, -120, 150, 'X⁻ + B(OH)₃', true, '#777'); ins(210, -175, -105, 'Ar–Ar′', true, GRN);
      lbw(g, 50, -30, 'oxidative', DK, 14); lbw(g, 50, -14, 'addition', DK, 14); lbw(g, 50, 2, 'Pd 0 → +2', TXT.red, 12);
      lbw(g, 0, 78, 'transmetalation', DK, 14); lbw(g, 0, 94, 'Pd stays +2', TXT.red, 12);
      lbw(g, -52, -30, 'reductive', DK, 14); lbw(g, -52, -14, 'elimination', DK, 14); lbw(g, -52, 2, 'Pd +2 → 0', TXT.red, 12);
      lbw(g, 0, 35, 'Suzuki', TXT.blue, 15);
      title(g, t, -165);
      return g;
    },
    // "complexgeom cx cy width k=all|isomers |text"
    complexgeom: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), k = o.k === 'isomers' ? 'isomers' : 'all';
      const LG = '#f3d29a', CL = '#5fae3a', NH = '#7fb7ea';
      const draw = (ox, oy, lig, cols, faces = [], sc = 62, pitch = 18) => { const pr = view(28, pitch, sc, ox, oy);
        for (const [cs, fill, ink] of faces) { const q = cs.map(pr); fl(g, pts(q) + ' Z', fill, { opacity: .35 }); still(g, pts(q) + ' Z', ink, 1.4); }
        const items = lig.map((v, i) => [pr(v), cols[i] || LG]).sort((a, b) => a[0][2] - b[0][2]), m = pr([0, 0, 0]);
        const bond = q => still(g, `M${P(m[0], m[1])} L${P(q[0], q[1])}`, '#6b7178', 4.5);
        items.filter(([q]) => q[2] < -.01).forEach(([q, c]) => { bond(q); part(g, C(q[0], q[1], 10), c, DK, 1.8); });
        part(g, C(m[0], m[1], 15), '#8e9bb0', DK, 2.2); lb(g, m[0], m[1] + 5, 'M', '#fff', 14);
        items.filter(([q]) => q[2] >= -.01).forEach(([q, c]) => { bond(q); part(g, C(q[0], q[1], 10), c, DK, 1.8); }); };
      const oct = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
      if (k === 'all') {
        const tbp = [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-.5, 0, .866], [-.5, 0, -.866]], c = .577, tet = [[c, c, c], [c, -c, -c], [-c, c, -c], [-c, -c, c]];
        const cells = [[-130, -75, oct, 'octahedral, ML₆', '90°   [Co(NH₃)₆]³⁺', 18], [130, -75, [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]], 'square planar, ML₄', '90°   [PtCl₄]²⁻ (d⁸)', 32],
          [-130, 85, tet, 'tetrahedral, ML₄', '109.5°   [NiCl₄]²⁻', 18], [130, 85, tbp, 'trigonal bipyramidal, ML₅', '90°, 120°   Fe(CO)₅', 14]];
        for (const [x, y, L, nm, ex, pt] of cells) { draw(x, y - 10, L, [], [], 55, pt); lbw(g, x, y + 62, nm, DK, 16); lbw(g, x, y + 80, ex, '#555', 13); }
      } else {
        const sq = (x, y, cis) => { const L = [[-1, 0], [1, 0], [0, -1], [0, 1]], lab = cis ? ['Cl', 'NH₃', 'Cl', 'NH₃'] : ['Cl', 'Cl', 'NH₃', 'NH₃'], d = 40;
          L.forEach(([u, v]) => still(g, `M${x} ${y} L${x + u * d} ${y + v * d}`, '#6b7178', 4.5));
          part(g, C(x, y, 15), '#8e9bb0', DK, 2.2); lb(g, x, y + 5, 'Pt', '#fff', 13);
          L.forEach(([u, v], i) => { const isCl = lab[i] === 'Cl', px = x + u * d, py = y + v * d; part(g, C(px, py, 10), isCl ? CL : NH, DK, 1.8);
            lb(g, px + (u ? u * (16 + tw(lab[i], 14) / 2) : 14), py + 5, lab[i], isCl ? TXT.green : TXT.blue, 14, u ? 'middle' : 'start'); }); };
        lbw(g, -95, -152, '[Pt(NH₃)₂Cl₂], square planar', TXT.blue, 15);
        sq(-180, -80, true); sq(-10, -80, false);
        lbw(g, -180, -4, 'cis (cisplatin)', DK, 15); lbw(g, -10, -4, 'trans', DK, 15);
        lbw(g, -95, 22, '[Co(NH₃)₃Cl₃], octahedral', TXT.blue, 15);
        const fac = [CL, NH, CL, NH, CL, NH], mer = [CL, CL, CL, NH, NH, NH];
        draw(-180, 92, oct, fac, [[[[1, 0, 0], [0, 1, 0], [0, 0, 1]], '#b9e0a5', GRN]], 52);
        draw(-10, 92, oct, mer, [[[[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]], '#b9e0a5', GRN]], 52);
        lbw(g, -180, 165, 'fac', DK, 16); lbw(g, -10, 165, 'mer', DK, 16);
        part(g, C(125, 50, 8), CL, DK, 1.6); lbw(g, 139, 55, '= Cl', TXT.green, 15, 'start'); part(g, C(195, 50, 8), NH, DK, 1.6); lbw(g, 209, 55, '= NH₃', TXT.blue, 15, 'start');
        lbw(g, 110, 90, 'fac: 3 Cl on one face', DK, 13, 'start'); lbw(g, 110, 107, '(all mutually cis)', '#555', 12, 'start');
        lbw(g, 110, 135, 'mer: 3 Cl on a meridian', DK, 13, 'start'); lbw(g, 110, 152, '(two of them trans)', '#555', 12, 'start');
        lbw(g, 110, -90, 'cis: like ligands 90°', DK, 13, 'start'); lbw(g, 110, -70, 'trans: like ligands 180°', DK, 13, 'start');
      }
      title(g, t, -170);
      return g;
    },
    // "bragg cx cy width |text"
    bragg: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), th = rad(28), d = 52, u = [Math.cos(th), Math.sin(th)], v = [Math.cos(th), -Math.sin(th)];
      const ys = [-10, -10 + d, -10 + 2 * d];
      for (const y of ys) { dash(g, `M-250 ${y} H-20`, '#b8bdc3', 1.4); for (let x = -238; x <= -30; x += 30) part(g, C(x + (y === ys[1] ? 15 : 0), y, 6), '#9cc3ee', BLU, 1.5); }
      const A = [-127, ys[0]], B = [-127, ys[1]], L = 120;
      for (const [Q, c] of [[A, BLU], [B, VIO]]) { const s = [Q[0] - L * u[0], Q[1] - L * u[1]], e = [Q[0] + L * v[0], Q[1] + L * v[1]];
        arrow(g, s[0], s[1], Q[0] - 8 * u[0], Q[1] - 8 * u[1], c, 2.6, true); line(g, `M${P(Q[0], Q[1])} L${P(e[0], e[1])}`, c, 2.6); tip(g, e[0], e[1], Q[0], Q[1], c, 2.6); }
      const ds = d * Math.sin(th), F1 = [B[0] - ds * u[0], B[1] - ds * u[1]], F2 = [B[0] + ds * v[0], B[1] + ds * v[1]];
      dash(g, `M${P(...A)} L${P(...F1)} M${P(...A)} L${P(...F2)}`, '#777', 1.5);
      still(g, `M${P(...F1)} L${P(...B)} L${P(...F2)}`, RED, 4.2);
      lbw(g, B[0] - 6, B[1] + 26, 'd sin θ', TXT.red, 14, 'end'); lbw(g, B[0] + 6, B[1] + 26, 'd sin θ', TXT.red, 14, 'start');
      still(g, `M${A[0] - 36} ${A[1]} A36 36 0 0 1 ${P(A[0] - 36 * u[0], A[1] - 36 * u[1])}`, DK, 1.8); lbw(g, A[0] - 46, A[1] - 6, 'θ', DK, 17, 'end');
      dbl(g, -35, ys[0], -35, ys[1], DK, 2); lbw(g, -28, (ys[0] + ys[1]) / 2 + 6, 'd', DK, 18, 'start');
      lbw(g, -235, -80, 'incident X-rays', BLU, 14, 'start'); lbw(g, -50, -82, 'diffracted', BLU, 14, 'middle');
      lbw(g, -135, 135, 'nλ = 2d sin θ', TXT.red, 22); lbw(g, -135, 157, 'path difference = 2d sin θ', '#555', 13);
      const gx0 = 30, gx1 = 245, gy0 = 100, gy1 = -100, X = a => gx0 + 10 + (a - 30) / 60 * (gx1 - gx0 - 20);
      axes(g, gx0, gy0, gx1 + 10, gy1 - 10, '', 'I');
      const pk = [[43.3, 1], [50.4, .46], [74.1, .21], [89.0, .17]], prof = x => gy0 - 4 - pk.reduce((sm, [a, h]) => sm + h * 170 / (1 + ((x - X(a)) / 2.2) ** 2), 0);
      line(g, curve(prof, gx0 + 2, gx1, 420), DK, 2);
      [[43.3, 1, '(111)'], [50.4, .46, '(200)'], [74.1, .21, '(220)'], [89.0, .17, '(311)']].forEach(([a, h, hk]) => lbw(g, X(a) + (a === 43.3 ? -4 : a > 80 ? -2 : 2), gy0 - 12 - h * 170, hk, TXT.red, 14, a === 43.3 ? 'end' : 'middle'));
      [40, 60, 80].forEach(a => { still(g, `M${X(a)} ${gy0} v6`, DK, 1.5); lb(g, X(a), gy0 + 22, String(a), '#555', 13); });
      lbw(g, gx1, gy0 + 42, '2θ (degrees)', DK, 14, 'end'); lbw(g, 150, -110, 'Cu (fcc), Cu Kα', '#555', 13, 'middle');
      title(g, t, -150);
      return g;
    },
    // "cosy cx cy width |text"
    cosy: ([cx, cy, W = 480], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), x0 = -115, y0 = -75, sz = 215, hi = 5, lo = .5;
      const X = d => x0 + (hi - d) / (hi - lo) * sz, Y = d => y0 + (d - lo) / (hi - lo) * sz;
      const pk = [['a', 4.38, [1, 2, 1], 2], ['b', 2.03, [1, 5, 10, 10, 5, 1], 2], ['c', 1.03, [1, 2, 1], 3]];
      part(g, R(x0, y0, sz, sz), '#fbfbfc', DK, 2);
      still(g, `M${X(hi)} ${Y(hi)} L${X(lo)} ${Y(lo)}`, '#d5d8dc', 1.2);
      const blob = (a, b, c) => { const x = X(a), y = Y(b); part(g, E(x, y, 11, 11), c === RED ? '#f4c7b8' : '#bcd4f0', c, 1.8); still(g, E(x, y, 5, 5), c, 1.6); };
      for (const [, d] of pk) blob(d, d, BLU);
      const pairs = [[0, 1], [1, 2]];
      for (const [i, j] of pairs) { const a = pk[i][1], b = pk[j][1];
        dash(g, `M${X(a)} ${Y(a)} V${Y(b)} H${X(b)} M${X(a)} ${Y(a)} H${X(b)} V${Y(b)}`, '#c9a0a0', 1.3); blob(a, b, RED); blob(b, a, RED); }
      // 1D spectra
      const mult = (d, I, n, horiz) => { let s = ''; const tot = I.reduce((a, b) => a + b, 0), sp = 3.2;
        I.forEach((h, i) => { const off = (i - (I.length - 1) / 2) * sp, len = h / Math.max(...I) * (14 + n * 10);
          s += horiz ? `M${P(X(d) + off, y0 - 8)} v${(-len).toFixed(1)} ` : `M${P(x0 - 8, Y(d) + off)} h${(-len).toFixed(1)} `; }); return s; };
      still(g, `M${x0} ${y0 - 8} H${x0 + sz} M${x0 - 8} ${y0} V${y0 + sz}`, '#9aa0a6', 1.2);
      still(g, pk.map(([, d, I, n]) => mult(d, I, n, true)).join(''), DK, 1.6); still(g, pk.map(([, d, I, n]) => mult(d, I, n, false)).join(''), DK, 1.6);
      pk.forEach(([nm, d]) => { lbw(g, X(d), y0 - 52, nm, VIO, 15); lbw(g, x0 - 58, Y(d) + 5, nm, VIO, 15); });
      for (let d = 1; d <= 4; d++) { still(g, `M${X(d)} ${y0 + sz} v6 M${x0 + sz} ${Y(d)} h6`, DK, 1.5); lb(g, X(d), y0 + sz + 22, String(d), '#555', 13); lb(g, x0 + sz + 12, Y(d) + 5, String(d), '#555', 13, 'start'); }
      lbw(g, x0 + sz / 2, y0 + sz + 44, 'F2: δ (ppm)', DK, 15); lbw(g, x0 + sz + 12, y0 - 12, 'F1: δ (ppm)', DK, 14, 'start');
      const ix = 195; lbw(g, ix, -40, 'CH₃–CH₂–CH₂–NO₂', DK, 14, 'middle'); lbw(g, ix, -22, 'c        b        a', VIO, 14, 'middle');
      lbw(g, ix, 10, 'blue: diagonal peaks', BLU, 13); lbw(g, ix, 28, 'red: cross peaks', RED, 13); lbw(g, ix, 46, '(a–b, b–c: ³J coupled)', '#555', 12);
      lbw(g, ix, 74, 'no a–c cross peak:', '#555', 12); lbw(g, ix, 90, 'not coupled', '#555', 12); lbw(g, ix, 112, 'symmetric about diagonal', '#555', 12);
      title(g, t, -150);
      return g;
    },
    // "jcoupling cx cy width n=3 |text"
    jcoupling: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), n = Math.max(1, Math.min(5, Math.round(+o.n || 3))), hz = 6;
            // doublet of doublets
      const lx = -150, J1 = 10, J2 = 4, lv = [-95, -45, 5], yb = 95;
      still(g, `M${lx} -125 V${lv[0]}`, DK, 2.4);
      const split = (xs, J, ya, yb2, c) => { const out = []; let d = ''; for (const x of xs) for (const s of [-1, 1]) { const nx = x + s * J * hz / 2; d += `M${P(x, ya)} L${P(nx, yb2)} `; out.push(nx); } still(g, d, c, 2); return out; };
      const a = split([lx], J1, lv[0], lv[1], BLU), b = split(a, J2, lv[1], lv[2], GRN);
      still(g, b.map(x => `M${x} ${lv[2]} V${yb - 2}`).join(' '), '#c3c7cc', 1.2, { 'stroke-dasharray': '3 4' });
      still(g, b.map(x => `M${x} ${yb} v-40`).join(' '), DK, 3); still(g, `M${lx - 60} ${yb} H${lx + 60}`, '#9aa0a6', 1.4);
      bracket(g, b[0], b[2], lv[2] + 34, BLU, -1); lbw(g, lx + 42, lv[2] + 38, 'J_{ab} = 10 Hz', TXT.blue, 14, 'start');
      bracket(g, b[2], b[3], lv[2] + 14, GRN, -1); lbw(g, lx + 42, lv[2] + 18, 'J_{ac} = 4 Hz', TXT.green, 14, 'start');
      lbw(g, lx, yb + 24, '1 : 1 : 1 : 1', DK, 15); lbw(g, lx, yb + 46, 'doublet of doublets (dd)', TXT.blue, 15);
      lbw(g, lx, -135, 'H_{a} with neighbours H_{b}, H_{c}', DK, 14);
      // n equivalent neighbours
      const rx = 55, J = 7, step = (lv[2] - lv[0]) / n, hz2 = Math.min(hz, 130 / n / J);
      let xs = [rx]; still(g, `M${rx} -125 V${lv[0]}`, DK, 2.4); let d = '';
      for (let i = 0; i < n; i++) { const ya = lv[0] + i * step, yb2 = ya + step, nx = []; for (const x of xs) for (const s of [-1, 1]) { const q = x + s * J * hz2 / 2; d += `M${P(x, ya)} L${P(q, yb2)} `; nx.push(+q.toFixed(2)); } xs = [...new Set(nx)]; }
      still(g, d, VIO, 2);
      const bin = [1]; for (let i = 0; i < n; i++) { for (let j = bin.length - 1; j > 0; j--) bin[j] += bin[j - 1]; bin.push(1); }
      xs.sort((u, v) => u - v);
      still(g, xs.map(x => `M${x} ${lv[2]} V${yb - 2}`).join(' '), '#c3c7cc', 1.2, { 'stroke-dasharray': '3 4' });
      still(g, xs.map((x, i) => `M${x} ${yb} v${(-bin[i] / Math.max(...bin) * 55).toFixed(1)}`).join(' '), DK, 3); still(g, `M${xs[0] - 20} ${yb} H${xs[xs.length - 1] + 20}`, '#9aa0a6', 1.4);
      bracket(g, xs[0], xs[1], lv[2] + 10, VIO); lbw(g, (xs[0] + xs[1]) / 2, lv[2] + 30, 'J = 7 Hz', VIO, 13);
      lbw(g, rx, yb + 24, bin.join(' : '), DK, 15); lbw(g, rx, yb + 46, `n = ${n} equivalent H → ${['', 'doublet', 'triplet', 'quartet', 'quintet', 'sextet'][n]}`, VIO, 15);
      lbw(g, rx, -135, 'n + 1 rule', DK, 14);
      const px = 205; lbw(g, px, -112, "Pascal's triangle", '#555', 13);
      for (let r = 0, row = [1]; r <= 5; r++) { lbw(g, px, -88 + r * 22, row.join('  '), r === n ? TXT.red : DK, 14); row = [1, ...row.slice(1).map((v2, i) => v2 + row[i]), 1]; }
      title(g, t, -165);
      return g;
    },
    // "jablonski cx cy width |text"
    jablonski: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p);
      const st = (x1, x2, y, nm, side) => { still(g, `M${x1} ${y} H${x2}`, DK, 3.4); still(g, [1, 2, 3].map(i => `M${x1} ${y - i * 13} H${x2}`).join(' '), '#9aa0a6', 1.3);
        lb(g, side ? x2 + 8 : x1 - 8, y + 6, nm, DK, 18, side ? 'start' : 'end'); };
      const S0 = 120, S1 = -5, S2 = -105, T1 = 40;
      st(-215, 105, S0, 'S₀'); st(-215, -30, S1, 'S₁'); st(-215, -30, S2, 'S₂'); st(15, 105, T1, 'T₁', true);
      arrow(g, -200, S0, -200, S1 - 26, BLU, 3, true); arrow(g, -180, S0, -180, S2 - 39, BLU, 3, true);
      wavy(g, -160, S2 - 26, -160, S2, GRY); wavy(g, -140, S2, -140, S1 - 39, GRY); wavy(g, -140, S1 - 39, -140, S1, GRY);
      arrow(g, -115, S1, -115, S0 - 26, GRN, 3, true); wavy(g, -85, S1, -85, S0 - 39, GRY);
      wavy(g, -55, S1, 22, T1 - 26, VIO); wavy(g, 35, T1 - 26, 35, T1, GRY);
      arrow(g, 60, T1, 60, S0 - 13, RED, 3, true); wavy(g, 85, T1, 85, S0 - 39, '#b0b5bb', 2);
      const lg = 135, item = (y, c, wv, txt, sub) => { wv ? wavy(g, lg, y, lg + 30, y, c, 2.2) : arrow(g, lg, y, lg + 30, y, c, 2.6); lbw(g, lg + 38, y + 5, txt, c === GRY ? '#555' : c, 14, 'start'); if (sub) lbw(g, lg + 38, y + 21, sub, '#777', 11, 'start'); };
      item(-130, BLU, 0, 'absorption', '~10⁻¹⁵ s'); item(-92, GRY, 1, 'IC / vib. relaxation', '10⁻¹⁴–10⁻¹¹ s'); item(-54, GRN, 0, 'fluorescence', '10⁻⁹–10⁻⁷ s');
      item(-16, VIO, 1, 'intersystem crossing', 'spin flip, 10⁻¹⁰–10⁻⁶ s'); item(22, RED, 0, 'phosphorescence', '10⁻⁴–10² s (spin-forbidden)');
      lbw(g, 190, 80, 'straight = radiative', '#555', 13); lbw(g, 190, 98, 'wavy = non-radiative', '#555', 13);
      lbw(g, -122, S2 - 55, 'singlets (paired spins)', '#555', 13); lbw(g, 60, T1 - 60, 'triplet', '#555', 13);
      title(g, t, -175);
      return g;
    },
    // "cyclicvolt cx cy width conv=iupac|us |text"
    cyclicvolt: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), us = o.conv === 'us', sgn = us ? -1 : 1, sim = cvSim(), xc = 30, yc = 10, hx = 190, hy = 95;
      const X = xi => xc + sgn * xi / 8 * hx, Y = i => yc - sgn * i * hy;
      still(g, `M${xc - hx - 10} ${yc} H${xc + hx + 10}`, '#9aa0a6', 1.4); still(g, `M${xc - hx - 10} ${yc - hy - 30} V${yc + hy + 30}`, DK, 2.4);
      still(g, `M${xc - hx - 10} ${yc + hy + 30} H${xc + hx + 10}`, DK, 2.4);
      [[-7.8, us ? '+0.2' : '−0.2'], [0, '0'], [7.8, us ? '−0.2' : '+0.2']].forEach(([xi, s], i) => { const x = xc - hx + i * hx; still(g, `M${x} ${yc + hy + 30} v6`, DK, 1.5); lb(g, x, yc + hy + 52, s, '#555', 13); });
      lbw(g, xc + hx + 10, yc + hy + 74, 'E − E°′ (V)', DK, 14, 'end');
      lbw(g, xc - hx - 16, yc - hy - 14, us ? 'cathodic i' : 'anodic i', us ? TXT.red : TXT.blue, 13, 'end'); lbw(g, xc - hx - 16, yc + hy + 24, us ? 'anodic' : 'cathodic', us ? TXT.blue : TXT.red, 13, 'end');
      line(g, pts(sim.map(([xi, i]) => [X(xi), Y(i)])), BLU, 3.2);
      const fw = sim.slice(0, sim.length / 2), bw = sim.slice(sim.length / 2), pa = fw.reduce((m, q) => q[1] > m[1] ? q : m), pc = bw.reduce((m, q) => q[1] < m[1] ? q : m);
      const mid = (pa[0] + pc[0]) / 2;
      dash(g, `M${X(pa[0])} ${Y(pa[1])} V${yc + sgn * (hy + 30)}`, BLU, 1.4); dash(g, `M${X(pc[0])} ${Y(pc[1])} V${yc + sgn * (hy + 30)}`, RED, 1.4);
      lbw(g, X(pa[0]) + sgn * 6, Y(pa[1]) - sgn * 10 + (us ? 14 : 0), 'E_{pa}', TXT.blue, 16, us ? 'end' : 'start'); lbw(g, X(pc[0]) - sgn * 6, Y(pc[1]) + sgn * 22 - (us ? 10 : 0), 'E_{pc}', TXT.red, 16, us ? 'start' : 'end');
      const yd = Y(pc[1]) + sgn * 30; dbl(g, X(pc[0]), yd, X(pa[0]), yd, DK, 1.8); lbw(g, X(pa[0]) + sgn * 8, yd + 5, 'ΔE_{p}', DK, 14, us ? 'end' : 'start');
      dbl(g, X(pa[0]) + sgn * 26, Y(0), X(pa[0]) + sgn * 26, Y(pa[1]), BLU, 1.6); lbw(g, X(pa[0]) + sgn * 32, Y(pa[1] / 2) + 5, 'i_{pa}', TXT.blue, 14, us ? 'end' : 'start');
      dbl(g, X(pc[0]) - sgn * 26, Y(0), X(pc[0]) - sgn * 26, Y(pc[1]), RED, 1.6); lbw(g, X(pc[0]) - sgn * 32, Y(pc[1] / 2) + 5, 'i_{pc}', TXT.red, 14, us ? 'start' : 'end');
      still(g, `M${X(mid)} ${yc + hy + 22} v16`, VIO, 2.6); lbw(g, X(mid) + 5, yc + hy + 18, 'E_{1/2}', VIO, 14, 'start');
      const sc = (xi, dir, src) => { const q = src.reduce((m, r) => Math.abs(r[0] - xi) < Math.abs(m[0] - xi) ? r : m), x = X(q[0]), y = Y(q[1]); arrow(g, x - sgn * dir * 16, y, x + sgn * dir * 6, y, DK, 2); };
      sc(-4, 1, fw); sc(4.5, -1, bw);
      const ix = us ? 150 : -95, iy = -72; still(g, `M${ix - 50} ${iy + 30} V${iy - 32} M${ix - 50} ${iy + 30} H${ix + 55}`, DK, 1.6);
      still(g, `M${ix - 50} ${iy + 22} L${ix} ${iy - 24} L${ix + 50} ${iy + 22}`, ORG, 2.4); lbw(g, ix, iy - 30, 'E_{λ}', TXT.orange, 13); lbw(g, ix + 55, iy + 44, 't', DK, 13, 'end'); lbw(g, ix - 56, iy - 22, 'E', DK, 13, 'end');
      lbw(g, 0, -150, 'reversible couple:  ΔE_{p} = E_{pa} − E_{pc} ≈ 59/n mV (25 °C)', DK, 15);
      lbw(g, 0, -130, 'E_{1/2} = (E_{pa} + E_{pc})/2 ≈ E°′;   i_{pa}/i_{pc} ≈ 1;   i_{p} ∝ v^{1/2}', '#555', 13);
      lbw(g, xc + hx + 10, yc + hy + 94, us ? 'US convention (cathodic up)' : 'IUPAC convention (anodic up)', '#777', 11, 'end');
      title(g, t, -175);
      return g;
    },
    // "chromatogram cx cy width col=1 |text"
    chromatogram: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), col = o.col === '1' || o.col === 'yes', x0 = -230, x1 = 240, yb = 75, H = 165, X = tm => x0 + 10 + tm * 46;
      const pk = [[1.0, .14, .06], [3.2, .72, .12], [4.6, 1, .15], [5.2, .58, .16], [8.0, .55, .26]];
      const f = x => { const tm = (x - x0 - 10) / 46; return yb - 3 - pk.reduce((s, [r, h, sg]) => s + h * H * Math.exp(-((tm - r) ** 2) / 2 / sg / sg), 0); };
      axes(g, x0, yb, x1, yb - H - 40, '', 'detector response');
      line(g, curve(f, x0 + 2, x1 - 6, 600), BLU, 2.6);
      [0, 2, 4, 6, 8].forEach(tm => { still(g, `M${X(tm)} ${yb} v6`, DK, 1.5); lb(g, X(tm), yb + 22, String(tm), '#555', 13); }); lbw(g, x1, yb + 22, 't (min)', DK, 14, 'end');
      still(g, `M${X(0)} ${yb} v-14`, ORG, 2.4); lbw(g, X(0) + 4, yb - 18, 'inject', TXT.orange, 12, 'start');
      // t0 and tR
      const dim = (y, tm, txt, c) => { dbl(g, X(0), y, X(tm), y, c, 1.8); lbw(g, (X(0) + X(tm)) / 2, y + 18, txt, c, 14); };
      dim(yb + 44, 1.0, '', VIO); lbw(g, X(1.0) + 8, yb + 50, 't_{0} (unretained)', VIO, 13, 'start'); dim(yb + 76, 8.0, 't_{R} (peak 4)', RED);
      dash(g, `M${X(8)} ${f(X(8))} V${yb + 78}`, RED, 1.2); dash(g, `M${X(1)} ${f(X(1))} V${yb + 46}`, VIO, 1.2);
      // tangent lines → baseline width 4σ
      const [r, h, sg] = pk[4], hp = h * H * Math.exp(-.5), sl = h * H * Math.exp(-.5) / sg;
      for (const s of [-1, 1]) { const xi = X(r + s * sg), yi = yb - 3 - hp, xe = X(r + s * 2 * sg); still(g, `M${P(xi + (xi - xe) * .7, yi - (yb - yi) * .7)} L${P(xe - (xi - xe) * .25, yb + (yb - yi) * .25)}`, GRN, 1.6, { 'stroke-dasharray': '5 4' }); }
      bracket(g, X(r - 2 * sg), X(r + 2 * sg), yb + 12, GRN, -1); lbw(g, X(r), yb + 22, '', GRN, 1); lbw(g, X(r + 2 * sg) + 6, yb - 8, 'w', TXT.green, 15, 'start');
      ['1', '2', '3', '4'].forEach((s, i) => lbw(g, X(pk[i + 1][0]) + (i === 1 ? -8 : i === 2 ? 8 : 0), f(X(pk[i + 1][0])) - 10, s, VIO, 14, i === 1 ? 'end' : i === 2 ? 'start' : 'middle'));
      lbw(g, 40, -150, 'resolution:  R_{s} = 2(t_{R,3} − t_{R,2}) / (w_{2} + w_{3})', DK, 14);
      lbw(g, 40, -132, 'peaks 2, 3: R_{s} ≈ 1 (baseline separation needs 1.5)', '#777', 12); still(g, `M${X(4.9)} ${f(X(4.6)) - 24} V-124`, '#9aa0a6', 1.2);
      lbw(g, 170, -70, 'k = (t_{R} − t_{0}) / t_{0}', DK, 14); lbw(g, 170, -48, 'N = 16 (t_{R} / w)²', DK, 14);
      if (col) { const cx0 = 168, cy0 = 135; part(g, R(cx0, cy0 - 9, 56, 18), '#eef3f8', DK, 2); [[11, '#e04b3a'], [28, '#f4a531'], [44, '#5fae3a']].forEach(([dx, c]) => fl(g, E(cx0 + dx, cy0, 4, 7), c));
        still(g, `M${cx0 + 56} ${cy0} H${cx0 + 62}`, DK, 2); part(g, R(cx0 + 62, cy0 - 12, 24, 24), '#fff', DK, 2); lbw(g, cx0 + 74, cy0 + 5, 'D', DK, 14);
        lbw(g, cx0 + 43, cy0 + 28, 'column → detector', '#555', 12); }
      title(g, t, -175);
      return g;
    },
    // "arrhenius cx cy width |text"
    arrhenius: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), x0 = -205, y0 = 115, Y = lk => y0 - (lk + 8) / 36 * 235, X = inv => x0 + inv / .004 * 400;
      const lnA = 27, slope = -7500, lk = inv => lnA + slope * inv;
      axes(g, x0, y0, x0 + 420, y0 - 245, '', '');
      lbw(g, x0 + 420, y0 + 42, '1/T (K⁻¹)', DK, 15, 'end'); lbw(g, x0 + 10, y0 - 232, 'ln k', DK, 17, 'start');
      [0, .001, .002, .003, .004].forEach(v => { still(g, `M${X(v)} ${y0} v6`, DK, 1.5); lb(g, X(v), y0 + 22, v ? v.toFixed(3) : '0', '#555', 12); });
      dash(g, `M${X(0)} ${Y(lk(0))} L${X(.0027)} ${Y(lk(.0027))}`, BLU, 2); line(g, `M${X(.0027)} ${Y(lk(.0027))} L${X(.0038)} ${Y(lk(.0038))}`, BLU, 3.2);
      [.0028, .00305, .0033, .00355, .0037].forEach((v, i) => part(g, C(X(v), Y(lk(v) + [.4, -.5, .3, -.3, .2][i]), 4.5), '#fff', BLU, 2));
      part(g, C(X(0), Y(lnA), 5), RED, RED, 1); lbw(g, X(0) + 10, Y(lnA) + 64, 'intercept = ln A', TXT.red, 15, 'start'); still(g, `M${X(0) + 12} ${Y(lnA) + 50} L${X(0) + 4} ${Y(lnA) + 8}`, RED, 1.4);
      const a = .0029, b = .0035; still(g, `M${X(a)} ${Y(lk(a))} H${X(b)} V${Y(lk(b))}`, GRN, 2);
      lbw(g, (X(a) + X(b)) / 2, Y(lk(a)) - 8, 'Δ(1/T)', TXT.green, 13); lbw(g, X(b) + 6, (Y(lk(a)) + Y(lk(b))) / 2 + 5, 'Δ ln k', TXT.green, 13, 'start');
      lbw(g, X(.0029) - 14, Y(lk(.0029)) + 40, 'slope = −E_{a}/R', TXT.green, 17, 'end');
      lbw(g, 120, -95, 'k = A e^{−Ea/RT}', DK, 19); lbw(g, 120, -68, 'ln k = ln A − (E_{a}/R)(1/T)', DK, 15);
      lbw(g, x0 + 200, y0 + 48, '← high T      low T →', '#777', 12);
      title(g, t, -150);
      return g;
    },
    // "gibbs cx cy width k=signs|equilibrium |text"
    gibbs: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k === 'equilibrium' ? 'equilibrium' : 'signs';
      if (k === 'signs') {
        const x0 = -215, x1 = 115, T = x => x - x0;
        fl(g, R(x0, 0, x1 - x0, 125), '#d8ecd0'); fl(g, R(x0, -125, x1 - x0, 125), '#f6dcd6');
        lbw(g, x1 - 6, 118, 'spontaneous (ΔG < 0)', TXT.green, 13, 'end'); lbw(g, x1 - 6, -112, 'non-spontaneous (ΔG > 0)', TXT.red, 13, 'end');
        still(g, `M${x0} 125 V-135`, DK, 2.6); tip(g, x0, -135, x0, -125, DK, 2.6); still(g, `M${x0} 0 H${x1 + 15}`, DK, 2.6); tip(g, x1 + 15, 0, x1 + 5, 0, DK, 2.6);
        lbw(g, x0 + 8, -122, 'ΔG', DK, 17, 'start'); lbw(g, x1 + 15, 22, 'T', DK, 17, 'end'); lb(g, x0 - 6, 5, '0', DK, 14, 'end');
        const L = [[-40, .2, BLU, 'ΔH < 0, ΔS > 0', 'spontaneous at all T'], [40, -.2, RED, 'ΔH > 0, ΔS < 0', 'never spontaneous'],
          [-70, -.3, GRN, 'ΔH < 0, ΔS < 0', 'spontaneous below T*'], [80, .5, VIO, 'ΔH > 0, ΔS > 0', 'spontaneous above T*']];
        L.forEach(([dH, dS, c, l1, l2], i) => { const f = x => -(dH - T(x) * dS); line(g, `M${x0} ${f(x0)} L${x1} ${f(x1)}`, c, 3);
          if (dH * dS > 0) { const xc = x0 + dH / dS; part(g, C(xc, 0, 4.5), c, c, 1); lbw(g, xc + (i === 2 ? 4 : -6), i === 2 ? -24 : 20, 'T* = ΔH/ΔS', c, 12, i === 2 ? 'start' : 'end'); }
          lbw(g, 140, -100 + i * 52, l1, c, 14, 'start'); lbw(g, 140, -82 + i * 52, l2, '#555', 12, 'start'); still(g, `M128 ${-105 + i * 52} h-0.1`, c, 8); });
        lbw(g, -50, -150, 'ΔG = ΔH − TΔS   (lines start at ΔH, slope −ΔS)', DK, 16);
      } else {
        const x0 = -200, x1 = 120, Gf = xi => { const a = Math.max(1e-6, 1 - xi), b = Math.max(1e-6, xi); return -1.2 * xi + (a * Math.log(a) + b * Math.log(b)); };
        const X = xi => x0 + xi * (x1 - x0), Y = G2 => -55 - G2 * 105;
        still(g, `M${x0} 125 V-105 M${x1} 125 V-105`, DK, 2.4); still(g, `M${x0} 125 H${x1}`, DK, 2.4);
        lbw(g, x0, 147, 'pure A', DK, 13); lbw(g, x1, 147, 'pure B', DK, 13); lbw(g, x0 + 30, 147, 'extent of reaction ξ  →', DK, 14, 'start'); lbw(g, x0 - 8, -90, 'G', DK, 17, 'end');
        line(g, curve(x => Y(Gf((x - x0) / (x1 - x0))), x0, x1, 300), BLU, 3.2);
        let em = 0; for (let i = 1; i < 1000; i++) if (Gf(i / 1000) < Gf(em)) em = i / 1000;
        part(g, C(X(em), Y(Gf(em)), 5), RED, RED, 1); dash(g, `M${X(em)} ${Y(Gf(em))} V125`, RED, 1.4); lbw(g, X(em) - 20, 170, 'equilibrium: Q = K, ΔG_{r} = 0', TXT.red, 14);
        const tan = (xi, c, w) => { const h = 1e-4, s = (Gf(xi + h) - Gf(xi - h)) / 2 / h, x = X(xi), y = Y(Gf(xi)), dx = 38; still(g, `M${x - dx} ${y + s * dx / (x1 - x0) * 90} L${x + dx} ${y - s * dx / (x1 - x0) * 90}`, c, 2.4); };
        tan(.3, GRN); tan(.95, ORG);
        lbw(g, X(.3) - 10, Y(Gf(.3)) - 20, 'ΔG_{r} < 0, Q < K: forward', TXT.green, 13, 'start'); lbw(g, X(.95) - 6, Y(Gf(.95)) - 48, 'ΔG_{r} > 0, Q > K:', TXT.orange, 13, 'end'); lbw(g, X(.95) - 6, Y(Gf(.95)) - 32, 'reverse', TXT.orange, 13, 'end');
        dash(g, `M${x0} ${Y(0)} H${x1 + 30}`, GRY, 1.3); dash(g, `M${x1} ${Y(-1.2)} H${x1 + 30}`, GRY, 1.3); dbl(g, x1 + 24, Y(0), x1 + 24, Y(-1.2), VIO, 2); lbw(g, x1 + 32, Y(-.6) + 5, 'ΔG°', VIO, 16, 'start');
        lbw(g, x0 + 6, Y(0) - 8, 'G°(A)', '#555', 12, 'start'); lbw(g, x1 + 32, Y(-1.2) + 18, 'G°(B)', '#555', 12, 'start');
        lbw(g, -40, -150, 'ΔG_{r} = (∂G/∂ξ)_{T,p} = ΔG° + RT ln Q', DK, 15); lbw(g, -40, -126, 'at equilibrium:  ΔG° = −RT ln K', RED, 16);
      }
      title(g, t, -175);
      return g;
    },
    // "langmuir cx cy width |text"
    langmuir: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), x0 = -230, x1 = 60, y0 = 105, h = 190, th = (P2, K) => K * P2 / (1 + K * P2), K = 1 / 45;
      axes(g, x0, y0, x1 + 15, y0 - h - 30, 'P', 'θ');
      dash(g, `M${x0} ${y0 - h} H${x1 + 10}`, GRY, 1.5); lb(g, x0 - 8, y0 - h + 5, '1', DK, 15, 'end'); lb(g, x0 - 8, y0 + 5, '0', DK, 15, 'end');
      line(g, curve(x => y0 - h * th(x - x0, K), x0, x1 + 5), BLU, 3.2);
      still(g, curve(x => y0 - h * th(x - x0, 1 / 12), x0, x1 + 5), '#9aa0a6', 2, { 'stroke-dasharray': '6 5' }); lbw(g, x0 + 40, y0 - h + 22, 'larger K', '#777', 12, 'start');
      dash(g, `M${x0} ${y0} L${x0 + 36} ${y0 - 36 * K * h}`, ORG, 1.8); lbw(g, x0 + 48, -18, 'θ ≈ KP', TXT.orange, 14, 'start');
      lbw(g, -85, -125, 'θ = KP / (1 + KP)', DK, 20);
      const site = (sx, sy, occ, gas) => { still(g, `M${sx} ${sy} H${sx + 150}`, DK, 2.4); for (let i = 0; i < 8; i++) { const x = sx + 10 + i * 18.5; still(g, `M${x - 7} ${sy} q7 -9 14 0`, '#6b7178', 1.6); if (occ.includes(i)) part(g, C(x, sy - 9, 6.5), '#f4a531', ORG, 1.6); }
        gas.forEach(([dx, dy]) => part(g, C(sx + dx, sy - dy, 5), '#fbe0b0', ORG, 1.4)); fl(g, R(sx, sy, 150, 10), '#c9ced4'); };
      site(95, -40, [2, 6], [[30, 40], [110, 55]]); lbw(g, 170, -12, 'low P: few sites filled', DK, 13); lbw(g, 170, 4, 'θ grows ∝ P', '#555', 12);
      site(95, 85, [0, 1, 2, 3, 5, 6, 7], [[20, 35], [55, 50], [85, 30], [120, 45], [140, 25], [40, 22]]); lbw(g, 170, 113, 'high P: θ → 1', DK, 13); lbw(g, 170, 129, '(full monolayer)', '#555', 12);
      for (const [px, txt] of [[x0 + 14, 'low P'], [x1 - 10, 'high P']]) { const py = y0 - h * th(px - x0, K); part(g, C(px, py, 4.5), RED, RED, 1); lbw(g, px + 8, py + 20, txt, TXT.red, 13, 'start'); }
      lbw(g, -90, 150, 'assumes: one monolayer, identical independent sites, no lateral interactions', '#555', 12);
      title(g, t, -160);
      return g;
    },
    // "polymerization cx cy width k=chain|step |text"
    polymerization: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k === 'step' ? 'step' : 'chain';
      if (k === 'chain') {
        const hd = (y, txt, c) => lbw(g, -250, y, txt, c, 15, 'start');
        hd(-125, 'initiation', TXT.blue);
        lb(g, -160, -98, 'RO', DK, 18); still(g, 'M-145 -104 H-125', DK, 2.4); lb(g, -110, -98, 'OR', DK, 18);
        fish(g, -137, -110, -137, -132, -150, -134, -158, -118); fish(g, -133, -110, -133, -132, -120, -134, -112, -118);
        arrow(g, -80, -104, -40, -104, DK, 2.5); lbw(g, -60, -114, 'Δ or hν', '#555', 12); lb(g, -25, -98, '2 RO•', DK, 18, 'start');
        lbw(g, 50, -98, 'RO• + CH₂=CHX → RO–CH₂–CHX•', DK, 15, 'start');
        hd(-55, 'propagation (repeats thousands of times)', TXT.green);
        const y = 0; lb(g, -184, y + 6, '~CH₂–', DK, 18, 'end'); lb(g, -184, y + 6, 'CHX', DK, 18, 'start'); dot(g, -178, y - 16, RED);
        lb(g, -95, y + 6, 'H₂C', DK, 18); still(g, `M-77 ${y - 3} H-47 M-77 ${y + 3} H-47`, DK, 2.4); lb(g, -30, y + 6, 'CHX', DK, 18);
        fish(g, -177, y - 20, -165, y - 52, -130, y - 50, -114, y - 16);
        fish(g, -63, y - 7, -70, y - 40, -95, y - 42, -108, y - 16);
        fish(g, -61, y + 8, -55, y + 34, -40, y + 34, -36, y + 18);
        arrow(g, 10, y, 45, y, DK, 2.5); lb(g, 55, y + 6, '~CH₂–CHX–CH₂–CHX•', DK, 17, 'start');
        lbw(g, 0, y + 38, 'fishhook arrows = single electrons', '#555', 12);
        hd(80, 'termination', TXT.red);
        lbw(g, -250, 108, 'combination:', '#555', 13, 'start'); lbw(g, -160, 108, '2 ~CH₂–CHX•  →  ~CH₂–CHX–CHX–CH₂~', DK, 15, 'start');
        lbw(g, -250, 134, 'disproportionation:', '#555', 13, 'start'); lbw(g, -125, 134, '→  ~CH=CHX  +  ~CH₂–CH₂X', DK, 15, 'start');
        lbw(g, 0, 165, 'long chains form at once; monomer is used up gradually', TXT.blue, 14);
      } else {
        lbw(g, 0, -135, 'n HOOC–R–COOH + n HO–R′–OH ⇌ H–[O–CO–R–CO–O–R′]_{n}–OH + (2n−1) H₂O', DK, 14);
        lbw(g, 0, -112, 'any two chain ends can react: monomer → dimer → tetramer → …', '#555', 13);
        const x0 = -215, x1 = 85, y0 = 120, h = 190, X = pp => x0 + pp * (x1 - x0), Y = xn => y0 - xn / 100 * h;
        axes(g, x0, y0, x1 + 25, y0 - h - 15, '', '');
        lbw(g, x1 + 25, y0 + 40, 'conversion p', DK, 14, 'end'); lbw(g, x0 + 8, y0 - h - 6, 'X_{n}', DK, 17, 'start');
        [0, .5, 1].forEach(v => { still(g, `M${X(v)} ${y0} v6`, DK, 1.5); lb(g, X(v), y0 + 22, String(v), '#555', 13); });
        [50, 100].forEach(v => { still(g, `M${x0} ${Y(v)} h-6`, DK, 1.5); lb(g, x0 - 10, Y(v) + 5, String(v), '#555', 13, 'end'); });
        const pa = []; for (let i = 0; i <= 200; i++) { const pp = .99 * (1 - (1 - i / 200) ** 2.2); pa.push([X(pp), Y(1 / (1 - pp))]); } line(g, pts(pa), BLU, 3.2);
        dash(g, `M${X(.02)} ${Y(80)} H${X(1)}`, RED, 2); lbw(g, X(.25), Y(80) - 8, 'chain growth (compare)', TXT.red, 12);
        for (const [pp, txt, dx] of [[.9, 'p = 0.90: X_{n} = 10', -6], [.99, 'p = 0.99: X_{n} = 100', -6]]) { part(g, C(X(pp), Y(1 / (1 - pp)), 4), BLU, BLU, 1); lbw(g, X(pp) + dx, Y(1 / (1 - pp)) - 10, txt, TXT.blue, 13, 'end'); }
        lbw(g, 180, -40, 'Carothers:', DK, 15); lbw(g, 180, -14, 'X_{n} = 1 / (1 − p)', RED, 17); lbw(g, 180, 4, '(number-average DP)', '#555', 12);
        lbw(g, 180, 40, 'high polymer only', '#555', 13); lbw(g, 180, 56, 'at very high', '#555', 13); lbw(g, 180, 72, 'conversion', '#555', 13);
      }
      title(g, t, -165);
      return g;
    },
    // "bandofstability cx cy width |text"
    bandofstability: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), x0 = -175, y0 = 130, X = z => x0 + z * 2.9, Y = n => y0 - n * 1.72;
      axes(g, x0, y0, X(108), Y(160), '', '');
      lbw(g, X(105), y0 + 40, 'protons, Z', DK, 15, 'end'); lbw(g, x0 + 8, Y(155), 'neutrons, N', DK, 15, 'start');
      [20, 40, 60, 80, 100].forEach(z => { still(g, `M${X(z)} ${y0} v6`, DK, 1.4); lb(g, X(z), y0 + 21, String(z), '#555', 12); });
      [40, 80, 120].forEach(n => { still(g, `M${x0} ${Y(n)} h-6`, DK, 1.4); lb(g, x0 - 9, Y(n) + 4, String(n), '#555', 12, 'end'); });
      const zs = A => A / (1.98 + .0155 * A ** (2 / 3)), up = [], dn = [], dots = [];
      for (let A = 2; A <= 210; A += 2) { const z = zs(A), n = A - z, w = 1.5 + A / 45; up.push([X(z - w * .3), Y(n + w)]); dn.push([X(z + w * .3), Y(n - w)]); }
      fl(g, pts([...up, ...dn.reverse()]) + ' Z', '#9cc3ee');
      let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let A = 4; A <= 209; A += 3) { const z = Math.round(zs(A)); if (z > 83) continue; const n = A - z + Math.round((rnd() - .5) * (1 + A / 30)); dots.push(C(X(z), Y(n), 1.6)); }
      still(g, dots.join(' '), BLU, 2.4);
      dash(g, `M${X(0)} ${Y(0)} L${X(100)} ${Y(100)}`, DK, 1.6); lbw(g, X(100) + 4, Y(100) + 4, 'N = Z', DK, 14, 'start');
      dash(g, `M${X(83)} ${Y(100)} V${Y(150)}`, '#9aa0a6', 1.4); lbw(g, X(83) - 5, Y(146), 'Z > 83: none stable', '#555', 12, 'end');
      arrow(g, X(28), Y(62), X(40), Y(50), RED, 2.6); lbw(g, X(6), Y(76), 'neutron-rich: β⁻ decay', TXT.red, 14, 'start'); lbw(g, X(6), Y(76) + 16, '(n → p + e⁻)', '#555', 12, 'start');
      arrow(g, X(62), Y(52), X(52), Y(64), GRN, 2.6); lbw(g, X(64), Y(48), 'proton-rich: β⁺ or EC', TXT.green, 14, 'start'); lbw(g, X(64), Y(48) + 16, '(p → n)', '#555', 12, 'start');
      arrow(g, X(98), Y(142), X(90), Y(134), ORG, 2.6); lbw(g, X(98) + 2, Y(142) - 6, 'α decay', TXT.orange, 14, 'start');
      part(g, C(X(82), Y(126), 4), RED, RED, 1); lbw(g, X(82) - 8, Y(126) - 6, '²⁰⁸Pb', DK, 13, 'end');
      lbw(g, X(24), Y(14), 'N/Z ≈ 1', '#555', 12, 'start'); lbw(g, X(86), Y(118), 'N/Z ≈ 1.5', '#555', 12, 'start');
      title(g, t, -160);
      return g;
    },
    // "binaryphase cx cy width k=eutectic|vle |text"
    binaryphase: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k === 'vle' ? 'vle' : 'eutectic', x0 = -205, x1 = 105, yb = 120, yt = -120, X = x => x0 + x * (x1 - x0);
      still(g, `M${x0} ${yt} V${yb} H${x1} V${yt}`, DK, 2.6); lb(g, x0, yb + 22, 'A', DK, 15); lb(g, x1, yb + 22, 'B', DK, 15); lbw(g, x0 - 8, yt + 10, 'T', DK, 17, 'end');
      if (k === 'eutectic') {
        const TA = -65, TB = -90, xE = .62, TE = 60;
        const liqA = x => TA + (TE - TA) * (x / xE) ** 1.35, liqB = x => TB + (TE - TB) * ((1 - x) / (1 - xE)) ** 1.25;
        fl(g, pts([[X(0), TA], ...Array.from({ length: 41 }, (_, i) => [X(xE * i / 40), liqA(xE * i / 40)]), [X(0), TE]]) + ' Z', '#e6eef8');
        fl(g, pts([[X(1), TB], ...Array.from({ length: 41 }, (_, i) => [X(1 - (1 - xE) * i / 40), liqB(1 - (1 - xE) * i / 40)]), [X(1), TE]]) + ' Z', '#f3ead8');
        line(g, curve(x => liqA((x - x0) / (x1 - x0)), X(0), X(xE), 80), BLU, 3.2); line(g, curve(x => liqB((x - x0) / (x1 - x0)), X(xE), X(1), 80), BLU, 3.2);
        still(g, `M${x0} ${TE} H${x1}`, RED, 3);
        part(g, C(X(xE), TE, 5), RED, RED, 1); lbw(g, X(xE) + 8, TE + 22, 'E (eutectic)', TXT.red, 14, 'start');
        lbw(g, X(.45), -95, 'liquid (L)', DK, 16); lbw(g, X(.33), 30, 'A(s) + L', DK, 15); lbw(g, X(.86), 20, 'B(s) + L', DK, 15); lbw(g, X(.5), 98, 'A(s) + B(s)', DK, 15);
        lbw(g, x0 - 8, TA + 5, 'T_{m}(A)', '#555', 12, 'end'); lbw(g, x1 + 8, TB + 5, 'T_{m}(B)', '#555', 12, 'start'); lbw(g, x0 - 8, TE + 5, 'T_{E}', TXT.red, 12, 'end');
        lbw(g, X(.3) + 12, liqA(.3) - 8, 'liquidus', TXT.blue, 13, 'start'); lbw(g, x1 + 8, TE + 5, 'solidus', TXT.red, 13, 'start');
        const xi = .12; dash(g, `M${X(xi)} -120 V${liqA(xi)}`, VIO, 1.6); arrow(g, X(xi), liqA(xi), X(xi), TE + 30, VIO, 1.8); part(g, C(X(xi), liqA(xi), 4), VIO, VIO, 1);
        lbw(g, X(xi) - 6, -105, 'cooling', VIO, 12, 'end');
        lbw(g, 185, -60, 'at E:', DK, 14); lbw(g, 185, -40, 'L → A(s) + B(s)', DK, 14); lbw(g, 185, -12, 'F = C − P + 1 = 0', '#555', 13); lbw(g, 185, 6, '(constant p)', '#555', 12);
        lbw(g, X(.5), yb + 44, 'composition, x_{B}', DK, 14);
      } else {
        const TbA = 383, TbB = 353, R8 = 8.314, hA = 33000, hB = 31000, Ty = T => yb - 25 - (T - TbB) / (TbA - TbB) * 190;
        const ps = (h, Tb, T) => Math.exp(-h / R8 * (1 / T - 1 / Tb)), xl = T => (1 - ps(hA, TbA, T)) / (ps(hB, TbB, T) - ps(hA, TbA, T)), yv = T => xl(T) * ps(hB, TbB, T);
        const bub = [], dew = []; for (let i = 0; i <= 80; i++) { const T = TbB + (TbA - TbB) * i / 80; bub.push([X(xl(T)), Ty(T)]); dew.push([X(yv(T)), Ty(T)]); }
        fl(g, pts([...bub, ...dew.slice().reverse()]) + ' Z', '#e6eef8');
        line(g, pts(bub), BLU, 3.2); line(g, pts(dew), RED, 3.2);
        const T1 = 366, a = xl(T1), b = yv(T1), z = a + .42 * (b - a), y1 = Ty(T1);
        still(g, `M${X(a)} ${y1} H${X(b)}`, DK, 2.4); part(g, C(X(a), y1, 4.5), BLU, BLU, 1); part(g, C(X(b), y1, 4.5), RED, RED, 1); part(g, C(X(z), y1, 4.5), '#fff', DK, 2);
        dash(g, `M${X(z)} ${y1} V${yb}`, GRY, 1.4); dash(g, `M${X(a)} ${y1} V${yb}`, BLU, 1.2); dash(g, `M${X(b)} ${y1} V${yb}`, RED, 1.2);
        lbw(g, X(a), yb + 22, 'x_{L}', TXT.blue, 13); lbw(g, X(z), yb + 22, 'z', DK, 13); lbw(g, X(b), yb + 22, 'y_{V}', TXT.red, 13);
        bracket(g, X(a), X(z), y1 - 10, GRN, -1); bracket(g, X(z), X(b), y1 - 10, ORG, -1);
        lbw(g, (X(a) + X(z)) / 2, y1 - 16, 'l_{L}', TXT.green, 14); lbw(g, (X(z) + X(b)) / 2, y1 - 16, 'l_{V}', TXT.orange, 14);
        lbw(g, X(.55), -100, 'vapour', DK, 16); lbw(g, X(.35), 95, 'liquid', DK, 16); lbw(g, X(.55), Ty(372) + 6, 'L + V', DK, 14);
        lbw(g, X(.2), Ty(374) + 40, 'bubble curve', TXT.blue, 13, 'start'); lbw(g, X(.48), Ty(378) - 4, 'dew curve', TXT.red, 13, 'start');
        lbw(g, x0 - 8, Ty(TbA) + 5, 'T_{b}(A)', '#555', 12, 'end'); lbw(g, x1 + 8, Ty(TbB) + 5, 'T_{b}(B)', '#555', 12, 'start');
        lbw(g, 185, -50, 'lever rule:', DK, 14); lbw(g, 185, -26, 'n_{L} l_{L} = n_{V} l_{V}', RED, 16); lbw(g, 185, 4, 'tie line joins', '#555', 13); lbw(g, 185, 20, 'L and V at the same T', '#555', 13);
        lbw(g, 185, 50, 'constant p', '#555', 12); lbw(g, X(.5), yb + 44, 'mole fraction of B', DK, 14);
      }
      title(g, t, -160);
      return g;
    },
    // "colligative cx cy width |text"
    colligative: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), x0 = -225, x1 = 65, yb = 110, xb = 15, sc = 80, ss = 45, xt = -125, Y = pp => yb - pp, atm = 150;
      const pl = x => atm * Math.exp((x - xb) / sc), pt = pl(xt), psub = x => pt * Math.exp((x - xt) / ss), fus = (p0, xx0) => pp => xx0 - (pp - p0) * .06;
      const xt2 = xt + Math.log(.8) / (1 / ss - 1 / sc), pt2 = psub(xt2), xmax = xb + sc * Math.log(215 / atm);
      axes(g, x0, yb, x1 + 35, yb - 235, 'T', 'P');
      still(g, curve(x => Y(psub(x)), x0, xt, 60), DK, 3); still(g, curve(x => Y(pl(x)), xt, xmax, 80), DK, 3); still(g, `M${xt} ${Y(pt)} L${fus(pt, xt)(220)} ${Y(220)}`, DK, 3);
      still(g, curve(x => Y(.8 * pl(x)), xt2, xb + sc * Math.log(215 / atm / .8), 80), BLU, 3, { 'stroke-dasharray': '8 6' }); still(g, `M${xt2} ${Y(pt2)} L${fus(pt2, xt2)(220)} ${Y(220)}`, BLU, 3, { 'stroke-dasharray': '8 6' });
      dash(g, `M${x0} ${Y(atm)} H${x1 + 20}`, GRY, 1.4); lb(g, x0 - 6, Y(atm) + 5, '1 atm', '#555', 12, 'end');
      const fp = fus(pt, xt)(atm), fp2 = fus(pt2, xt2)(atm), bp2 = xb + sc * Math.log(1 / .8);
      for (const x of [fp, fp2, xb, bp2]) dash(g, `M${x} ${Y(atm) - 14} V${yb}`, '#c3c7cc', 1.2);
      dbl(g, fp2, Y(atm) - 10, fp, Y(atm) - 10, RED, 1.6); lbw(g, fp2 - 4, Y(atm) - 14, 'ΔT_{f}', TXT.red, 14, 'end');
      dbl(g, xb, Y(atm) - 10, bp2, Y(atm) - 10, RED, 1.6); lbw(g, bp2 + 8, Y(atm) + 18, 'ΔT_{b}', TXT.red, 14, 'start');
      const xv = -45; dbl(g, xv, Y(pl(xv)), xv, Y(.8 * pl(xv)), VIO, 1.6); lbw(g, xv + 6, Y(.9 * pl(xv)) + 22, 'Δp', VIO, 14, 'start');
      lbw(g, -195, 20, 'solid', DK, 16); lbw(g, -75, -80, 'liquid', DK, 16); lbw(g, 20, 85, 'gas', DK, 16);
      lbw(g, -200, 140, 'black: pure solvent', DK, 13, 'start'); lbw(g, -60, 140, 'blue dashed: solution', BLU, 13, 'start');
      lbw(g, 170, -140, 'ΔT_{b} = i K_{b} m', DK, 15); lbw(g, 170, -118, 'ΔT_{f} = i K_{f} m', DK, 15); lbw(g, 170, -96, 'p = x_{solvent} p*', DK, 15);
      const ux = 130, uw = 30, uy = 18;   // osmosis U-tube inset
      still(g, `M${ux} ${uy - 40} V${uy + 70} Q${ux} ${uy + 100} ${ux + 40} ${uy + 100} H${ux + 40 + 2 * uw} Q${ux + 80 + 2 * uw} ${uy + 100} ${ux + 80 + 2 * uw} ${uy + 70} V${uy - 40}`, DK, 2.4);
      still(g, `M${ux + uw} ${uy - 40} V${uy + 62} Q${ux + uw} ${uy + 70} ${ux + 40} ${uy + 70} H${ux + 40 + uw} Q${ux + 50 + uw} ${uy + 70} ${ux + 50 + uw} ${uy + 62} V${uy - 40}`, DK, 2.4);
      fl(g, `M${ux} ${uy + 10} V${uy + 70} Q${ux} ${uy + 100} ${ux + 40} ${uy + 100} H${ux + 70} V${uy + 70} H${ux + 40} Q${ux + uw} ${uy + 70} ${ux + uw} ${uy + 62} V${uy + 10} Z`, '#bcd4f0');
      fl(g, `M${ux + 70} ${uy + 100} H${ux + 40 + 2 * uw} Q${ux + 80 + 2 * uw} ${uy + 100} ${ux + 80 + 2 * uw} ${uy + 70} V${uy - 20} H${ux + 50 + uw} V${uy + 62} Q${ux + 50 + uw} ${uy + 70} ${ux + 40 + uw} ${uy + 70} H${ux + 70} Z`, '#f3d29a');
      still(g, `M${ux + 70} ${uy + 70} V${uy + 100}`, VIO, 2.4, { 'stroke-dasharray': '3 3' });
      dash(g, `M${ux} ${uy + 10} H${ux + 80 + 2 * uw + 10}`, GRY, 1); dbl(g, ux + 80 + 2 * uw + 8, uy + 10, ux + 80 + 2 * uw + 8, uy - 20, RED, 1.6); lbw(g, ux + 80 + 2 * uw + 14, uy + 0, 'h', TXT.red, 14, 'start');
      lbw(g, ux + 15, uy - 50, 'solvent', BLU, 12); lbw(g, ux + 65 + 2 * uw, uy - 50, 'solution', TXT.orange, 12); lbw(g, ux + 70, uy + 122, 'semipermeable membrane', VIO, 11);
      lbw(g, ux + 70, uy - 72, 'osmotic pressure π = iMRT', RED, 14);
      title(g, t, -165);
      return g;
    },
    // "raoult cx cy width k=ideal|deviation |text"
    raoult: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k === 'deviation' ? 'deviation' : 'ideal';
      const panel = (x0, x1, yb, h, pA, pB, Wm, big, nm) => { const X = x => x0 + x * (x1 - x0), Y = q => yb - q * h;
        still(g, `M${x0} ${yb - h - 10} V${yb} H${x1} V${yb - h - 10}`, DK, 2.4); lbw(g, x0 - 8, yb - h - 2, 'p', DK, 16, 'end');
        lb(g, x0, yb + 20, '0', '#555', 12); lb(g, x1, yb + 20, '1', '#555', 12); lbw(g, (x0 + x1) / 2, yb + 22, 'x_{B}', DK, 14);
        const lin = (f, c, wd, ex = {}) => still(g, curve(x => Y(f((x - x0) / (x1 - x0))), x0, x1, 120), c, wd, ex);
        const ideal = Wm === 0, cA = ideal ? BLU : '#b7c9e0', cB = ideal ? GRN : '#b9d3b0', cT = ideal ? RED : '#e2b5ad';
        lin(x => (1 - x) * pA, cA, ideal ? 3 : 1.8); lin(x => x * pB, cB, ideal ? 3 : 1.8); lin(x => (1 - x) * pA + x * pB, cT, ideal ? 3.4 : 1.8);
        if (!ideal) { const fa = x => (1 - x) * pA * Math.exp(Wm * x * x), fb = x => x * pB * Math.exp(Wm * (1 - x) ** 2), d = { 'stroke-dasharray': '8 6' };
          lin(fa, BLU, 2.8, d); lin(fb, GRN, 2.8, d); lin(x => fa(x) + fb(x), RED, 3.2, d); }
        lbw(g, x0 - 6, Y(pA) + 5, 'p_{A}*', BLU, 13, 'end'); lbw(g, x1 + 6, Y(pB) + 5, 'p_{B}*', GRN, 13, 'start');
        if (big) [[RED, 'p = p_{A} + p_{B}'], [GRN, 'p_{B} = x_{B} p_{B}*'], [BLU, 'p_{A} = x_{A} p_{A}*']].forEach(([c, txt], i) => { still(g, `M${x1 + 40} ${-60 + i * 34} h26`, c, 3.4); lbw(g, x1 + 72, -55 + i * 34, txt, c, 15, 'start'); });
        if (nm) lbw(g, (x0 + x1) / 2, yb - h - 26, nm, DK, 15); };
      if (k === 'ideal') { panel(-210, 90, 110, 200, .6, 1, 0, true);
        lbw(g, 0, 150, 'ideal solution: A–B interactions like A–A and B–B (ΔH_{mix} = 0)', '#555', 13); lbw(g, -40, -125, 'Raoult: p_{i} = x_{i} p_{i}*', DK, 16); }
      else { panel(-215, -30, 100, 170, .6, 1, 1.1, false, 'positive deviation'); panel(45, 230, 100, 170, .6, 1, -1.1, false, 'negative deviation');
        lbw(g, -122, 140, 'weaker A–B attraction', TXT.red, 13); lbw(g, -122, 156, 'e.g. ethanol–hexane', '#555', 12);
        lbw(g, 137, 140, 'stronger A–B attraction', TXT.blue, 13); lbw(g, 137, 156, 'e.g. acetone–chloroform', '#555', 12);
        lbw(g, 0, -125, 'dashed: real solution;  faint solid: Raoult (ideal)', '#555', 13); }
      title(g, t, -160);
      return g;
    },
  });
})();
