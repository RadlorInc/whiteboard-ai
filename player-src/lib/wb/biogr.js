// Whiteboard library — biogr: graduate / upper-division biology (protein structure, structural methods, bioinformatics,
// signalling, cell cycle, gene regulation, RNA, genomics methods, immunology, neuro, development, metabolism,
// population and systems biology, qPCR). Catalogue: biogr.txt. Same helpers and look as biouni.js.
(() => {
  const DK = '#33363b', RED = '#c0392b', BLU = '#2b6cc4', GRN = '#2c6a22', ORG = '#e0802a', VIO = '#7a4ab0', GRY = '#8a9098';
  const G = (cx, cy, s, rot, parent) => mk('g', { transform: `translate(${cx} ${cy}) rotate(${rot || 0}) scale(${s})` }, parent);
  const fl = (g, d, fill, extra = {}) => mk('path', { d, fill, filter: 'url(#wc)', class: 'fillable', ...extra }, g);
  const still = (g, d, c, w = 3, extra = {}) => line(g, d, c, w, { ...extra, class: 'ink head' });
  const part = (g, d, fill, ink = DK, w = 3) => { fl(g, d, fill); return still(g, d, ink, w); };
  const C = (x, y, r) => `M${x + r} ${y} A${r} ${r} 0 1 1 ${x - r} ${y} A${r} ${r} 0 1 1 ${x + r} ${y} Z`;
  const E = (x, y, rx, ry) => `M${x + rx} ${y} A${rx} ${ry} 0 1 1 ${x - rx} ${y} A${rx} ${ry} 0 1 1 ${x + rx} ${y} Z`;
  const R = (x, y, w, h) => `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
  const P = (x, y) => `${(+x).toFixed(1)} ${(+y).toFixed(1)}`;
  const tip = (g, x, y, ax, ay, c, w = 3) => still(g, head(x, y, ax, ay, 8 + w * 1.6), c, w);
  const arrow = (g, x1, y1, x2, y2, c, w = 3, moving = false) => { (moving ? line : still)(g, `M${P(x1, y1)} L${P(x2, y2)}`, c, w); tip(g, x2, y2, x1, y1, c, w); };
  const dash = (g, d, c = GRY, w = 2) => still(g, d, c, w, { 'stroke-dasharray': '6 7' });
  // the hand fonts lack superscript glyphs: ⁺ ⁻ ² … and ^{..} are drawn as raised small text, _{..} as lowered small text
  const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻', PLAIN = '0123456789+−';
  const lb = (g, x, y, t, c = TXT.blue, s = 18, a = 'middle') => {
    t = String(t).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => '^{' + [...m].map(ch => PLAIN[SUPS.indexOf(ch)]).join('') + '}');
    if (!/[\^_]\{/.test(t)) return label(g, x, y, t, c, s, a);
    const e = label(g, x, y, '', c, s, a); let at = 0;
    t.split(/([\^_]\{[^}]*\})/).forEach(pt => { if (!pt) return; const k = /^\^\{/.test(pt) ? -.38 : /^_\{/.test(pt) ? .22 : 0;
      const sp = mk('tspan', k ? { 'font-size': s * .72, dy: (k - at) * s } : { dy: -at * s }, e); at = k; sp.textContent = k ? pt.slice(2, -1) : pt; });
    return e; };
  const lbr = (g, x, y, t, c = DK, s = 16, rot = -90) => wl(mk('g', { transform: `translate(${x} ${y}) rotate(${rot})` }, g), 0, 0, t, c, s);
  // words (part names, captions, equations) go through wl: hidden with lab=0 or labels=0; t, symbols and tick numbers always show
  let LABS = true; const showLab = o => o.lab !== '0' && o.labels !== '0', wl = (...a) => LABS && lb(...a);
  const curve = (f, x0, x1, n = 160) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? ' L' : 'M') + P(x, f(x)); } return d; };
  const pts = a => 'M' + a.map(p => P(p[0], p[1])).join(' L');
  const axes = (g, x0, y0, x1, y1, xl, yl) => { still(g, `M${x0} ${y1} V${y0} H${x1}`, DK, 3); tip(g, x0, y1, x0, y1 + 10, DK, 3); tip(g, x1, y0, x1 - 10, y0, DK, 3);
    if (xl) wl(g, x1, y0 + 26, xl, DK, 17, 'end'); if (yl) wl(g, x0 + 8, y1 + 4, yl, DK, 17, 'start'); };
  const rr = (x, y, w, h, r = 8) => `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
  const tw = (s, n) => n * s * .4 + 16;
  const pill = (g, x, y, text, fill = '#fff', ink = DK, s = 15, c = DK) => { const w = tw(s, text.length), h = s + 11; part(g, rr(x - w / 2, y - h / 2, w, h, h / 2), fill, ink, 2); wl(g, x, y + s * .35, text, c, s); return [w, h]; };
  const smooth = a => { let d = 'M' + P(...a[0]); for (let i = 0; i < a.length - 1; i++) { const p0 = a[i - 1] || a[i], p1 = a[i], p2 = a[i + 1], p3 = a[i + 2] || p2;
    d += ` C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`; } return d; };
  const smoothC = a => { const n = a.length, q = i => a[(i + n) % n]; let d = 'M' + P(...a[0]);
    for (let i = 0; i < n; i++) { const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2);
      d += ` C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`; } return d + ' Z'; };
  const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = r => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  // a rotated ellipse as a smooth closed path
  const Er = (x, y, rx, ry, a = 0) => { const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
    return smoothC(Array.from({ length: 12 }, (_, i) => { const u = i * Math.PI / 6, px = rx * Math.cos(u), py = ry * Math.sin(u); return [x + px * c - py * s, y + px * s + py * c]; })); };
  // repression bar ⊣ at (x, y), line arriving from (ax, ay)
  const bar = (g, x, y, ax, ay, c, w = 3) => { const a = Math.atan2(y - ay, x - ax), h = 11;
    still(g, `M${P(x - h * Math.sin(a), y + h * Math.cos(a))} L${P(x + h * Math.sin(a), y - h * Math.cos(a))}`, c, w + 1); };
  const phos = (g, x, y, r = 9) => { part(g, C(x, y, r), '#ffd84a', '#b58a10', 2); lb(g, x, y + r * .45, 'P', '#7a5a00', r * 1.3); };
  // a labelled oval (protein)
  const prot = (g, x, y, rx, ry, fill, name, s = 14, c = DK) => { part(g, E(x, y, rx, ry), fill, DK, 2); if (name) wl(g, x, y + s * .35, name, c, s); };
  // stick structure: atoms [sym, x, y, colour, cut], bonds [i, j, order]
  const struct = (g, atoms, bonds, s = 24, c = DK) => {
    const cut = (a, ux) => a[4] ?? (a[0] ? s * .42 + Math.max(0, a[0].replace(/[₀-₉]/g, '').length - 1) * s * .24 * Math.abs(ux) : 0);
    for (const [i, j, ord] of bonds) { const a = atoms[i], b = atoms[j], L = Math.hypot(b[1] - a[1], b[2] - a[2]), ux = (b[1] - a[1]) / L, uy = (b[2] - a[2]) / L;
      const ca = cut(a, ux), cb = cut(b, ux), x1 = a[1] + ux * ca, y1 = a[2] + uy * ca, x2 = b[1] - ux * cb, y2 = b[2] - uy * cb;
      for (const k of ord === 2 ? [-3.5, 3.5] : [0]) still(g, `M${P(x1 - uy * k, y1 + ux * k)} L${P(x2 - uy * k, y2 + ux * k)}`, c, 2.6); }
    for (const [sym, x, y, col] of atoms) if (sym) lb(g, x, y + s * .35, sym, col || c, s); };
  const ab = (g, x, y, c, dir = 1, s = 1) => still(g, `M${P(x, y + 14 * s * dir)} L${P(x, y)} L${P(x - 10 * s, y - 13 * s * dir)} M${P(x, y)} L${P(x + 10 * s, y - 13 * s * dir)}`, c, 3);

  Object.assign(window.RECIPES, {
    // "aminoacid cx cy width k=general|peptide |text"
    aminoacid: ([cx, cy, W = 520], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), s = 24, Rc = (x, y) => part(g, C(x, y, 22), '#5fae3a', GRN, 2.5);
      if (o.k === 'peptide') {
        const y1 = -95, y2 = 95;
        dash(g, E(-18, -72, 62, 36), BLU, 2); wl(g, -18, -122, 'H₂O', TXT.blue, 18);
        Rc(-165, y1 - 58); Rc(145, y1 - 58);
        struct(g, [['H₂N', -240, y1], ['C', -165, y1], ['R₁', -165, y1 - 58, '#fff', 24], ['H', -165, y1 + 52], ['C', -95, y1], ['O', -70, y1 - 55], ['OH', -55, y1 + 42],
          ['H', 20, y1], ['N', 75, y1], ['H', 75, y1 + 52], ['C', 145, y1], ['R₂', 145, y1 - 58, '#fff', 24], ['H', 145, y1 + 52], ['C', 215, y1], ['O', 240, y1 - 55], ['OH', 255, y1 + 42]],
        [[0, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 1], [4, 5, 2], [4, 6, 1], [7, 8, 1], [8, 9, 1], [8, 10, 1], [10, 11, 1], [10, 12, 1], [10, 13, 1], [13, 14, 2], [13, 15, 1]], s);
        arrow(g, 0, -22, 0, 28, DK, 3, true); wl(g, 14, 8, 'condensation (dehydration)', DK, 15, 'start');
        fl(g, rr(-90, y2 - 9, 50, 18, 6), '#f4a531');
        Rc(-170, y2 - 58); Rc(40, y2 - 58);
        struct(g, [['H₂N', -240, y2], ['C', -170, y2], ['R₁', -170, y2 - 58, '#fff', 24], ['H', -170, y2 + 52], ['C', -100, y2], ['O', -100, y2 - 58], ['N', -30, y2], ['H', -30, y2 + 52],
          ['C', 40, y2], ['R₂', 40, y2 - 58, '#fff', 24], ['H', 40, y2 + 52], ['C', 110, y2], ['O', 135, y2 - 55], ['OH', 150, y2 + 42]],
        [[0, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 1], [4, 5, 2], [4, 6, 1], [6, 7, 1], [6, 8, 1], [8, 9, 1], [8, 10, 1], [8, 11, 1], [11, 12, 2], [11, 13, 1]], s);
        still(g, `M-90 ${y2} H-42`, ORG, 5);
        arrow(g, -65, 172, -65, 112, ORG, 2.5); wl(g, -65, 190, 'peptide bond (C–N amide)', TXT.orange, 16);
        wl(g, 200, y2 + 8, '+ H₂O', TXT.blue, 20, 'start');
        wl(g, -240, y2 + 40, 'N-terminus', '#666', 13); wl(g, 175, y2 + 75, 'C-terminus', '#666', 13);
        if (t) lb(g, 0, -200, t, TXT.blue, 20);
        return g;
      }
      dash(g, rr(-142, -18, 78, 54), BLU, 2); dash(g, rr(76, -80, 116, 172), RED, 2);
      Rc(0, -62);
      struct(g, [['H₂N', -100, 10], ['C', 0, 10], ['R', 0, -62, '#fff', 24], ['H', 0, 80], ['C', 100, 10], ['O', 135, -48], ['OH', 150, 62]],
        [[0, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 1], [4, 5, 2], [4, 6, 1]], 26);
      wl(g, 14, 2, 'α', DK, 15, 'start');
      wl(g, -103, 58, 'amino group', TXT.blue, 16); wl(g, 134, 116, 'carboxyl group', TXT.red, 16);
      wl(g, 30, -76, 'side chain (R group)', TXT.green, 16, 'start'); wl(g, -32, -30, 'α-carbon', DK, 15, 'end');
      wl(g, 0, 150, 'at pH 7: H₃N⁺–CαHR–COO⁻ (zwitterion)', DK, 16);
      wl(g, 0, 175, 'R differs among the 20 amino acids (Gly: R = H)', '#666', 14);
      if (t) lb(g, 0, -125, t, TXT.blue, 20);
      return g;
    },
    // "foldfunnel cx cy width |text"
    foldfunnel: ([cx, cy, W = 500], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), A = 200;
      const env = x => 150 - 300 * Math.pow(Math.abs(x) / A, .75);
      const rug = x => (7 * Math.sin(x * .23) + 5 * Math.sin(x * .51 + 1)) * Math.min(1, Math.abs(x) / 40);
      const trap = x => 30 * Math.exp(-(((x + 105) / 13) ** 2)) + 24 * Math.exp(-(((x - 118) / 12) ** 2));
      const f = x => env(x) + rug(x) + trap(x), d = curve(f, -A, A, 240);
      fl(g, d + ` L${A} -150 L${-A} -150 Z`, '#e6f0fa');
      still(g, d, BLU, 3.5);
      const r = rnd(7);
      for (const [x0, y0] of [[-100, -130], [0, -136], [100, -130]]) { const a = []; for (let i = 0; i < 8; i++) a.push([x0 - 35 + i * 10, y0 + (r() - .5) * 18]); still(g, smooth(a), VIO, 2.5); }
      wl(g, 0, -100, 'unfolded states', DK, 16);
      const pa = [[-150, -120], [-110, -70], [-60, -5], [-25, 70], [-4, 124]], pb = [[150, -120], [132, -80], [116, -40], [95, -35], [60, 10], [30, 68], [5, 124]];
      for (const q of [pa, pb]) { line(g, smooth(q), ORG, 2.5); const n = q.length; tip(g, q[n - 1][0], q[n - 1][1], q[n - 2][0], q[n - 2][1], ORG, 2.5); }
      part(g, C(0, 141, 7), '#5fae3a', GRN, 2);
      wl(g, 0, 178, 'native state N (lowest G)', TXT.green, 17);
      wl(g, -118, 20, 'kinetic trap', TXT.red, 15, 'end'); wl(g, -118, 38, '(misfolded)', TXT.red, 15, 'end');
      wl(g, 130, 0, 'local minimum', TXT.red, 15, 'start'); wl(g, 130, 18, '(partly folded)', TXT.red, 15, 'start');
      still(g, 'M-235 150 V-140', DK, 3); tip(g, -235, -140, -235, -130, DK, 3); lbr(g, -250, 0, 'free energy (G)', DK, 16);
      still(g, 'M-190 -162 H190', DK, 2.5); tip(g, 190, -162, 180, -162, DK, 2.5); tip(g, -190, -162, -180, -162, DK, 2.5);
      wl(g, 0, -172, 'conformational entropy (width = number of states)', DK, 15);
      wl(g, -60, -55, 'folding pathways', TXT.orange, 14, 'start');
      if (t) lb(g, 0, -200, t, TXT.blue, 20);
      return g;
    },
    // "ramachandran cx cy width |text"
    ramachandran: ([cx, cy, W = 480], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), h = 140, ox = -20, oy = -5;
      const X = f => ox + f / 180 * h, Y = s => oy - s / 180 * h, Q = a => a.map(([f, s]) => [X(f), Y(s)]);
      const LT = '#cfe3f7', DKF = '#7fb7ea';
      fl(g, R(X(-180), Y(180), 2 * h, 2 * h), '#fff');
      const edge = (a, cf, cs, fill) => { const d = smooth(Q(a)) + ` L${P(X(cf), Y(cs))} Z`; fl(g, d, fill); still(g, smooth(Q(a)), BLU, 1.5); };
      edge([[-45, 180], [-42, 140], [-55, 100], [-90, 80], [-140, 78], [-180, 85]], -180, 180, LT);
      edge([[-180, -160], [-120, -158], [-60, -165], [-48, -180]], -180, -180, LT);
      edge([[-62, 180], [-60, 145], [-78, 118], [-118, 105], [-160, 112], [-180, 118]], -180, 180, DKF);
      for (const [a, fill] of [[[[-160, -30], [-150, 25], [-100, 45], [-55, 20], [-35, -30], [-45, -75], [-100, -75], [-150, -55]], LT],
        [[[-100, -10], [-75, 5], [-48, -20], [-45, -55], [-70, -65], [-95, -45]], DKF],
        [[[45, 90], [80, 80], [90, 35], [75, 0], [50, 5], [38, 45]], LT], [[[55, 65], [72, 55], [72, 25], [58, 20], [50, 40]], DKF]]) { const d = smoothC(Q(a)); fl(g, d, fill); still(g, d, BLU, 1.5); }
      dash(g, `M${X(0)} ${Y(180)} V${Y(-180)} M${X(-180)} ${Y(0)} H${X(180)}`, GRY, 1.5);
      still(g, R(X(-180), Y(180), 2 * h, 2 * h), DK, 2.5);
      for (const v of [-180, -90, 0, 90, 180]) { const s = v < 0 ? '−' + -v : '' + v;
        still(g, `M${X(v)} ${Y(-180)} v6 M${X(-180)} ${Y(v)} h-6`, DK, 2);
        lb(g, X(v), Y(-180) + 24, s, DK, 14); lb(g, X(-180) - 10, Y(v) + 5, s, DK, 14, 'end'); }
      wl(g, X(0), Y(-180) + 50, 'φ (degrees)', DK, 17); lbr(g, X(-180) - 52, oy, 'ψ (degrees)', DK, 17);
      for (const [f, s] of [[-120, 130], [-57, -47], [57, 47]]) part(g, C(X(f), Y(s), 4), DK, DK, 2);
      wl(g, X(-120) + 9, Y(130) + 5, 'β-sheet', DK, 16, 'start');
      wl(g, X(-57) + 9, Y(-47) + 5, 'right-handed α-helix (αR)', DK, 16, 'start');
      wl(g, X(62), Y(102), 'left-handed helix (αL)', DK, 16);
      fl(g, R(132, -120, 18, 13), DKF); still(g, R(132, -120, 18, 13), BLU, 1.5); wl(g, 156, -109, 'favoured', DK, 14, 'start');
      fl(g, R(132, -96, 18, 13), LT); still(g, R(132, -96, 18, 13), BLU, 1.5); wl(g, 156, -85, 'allowed', DK, 14, 'start');
      wl(g, 132, -60, 'white:', '#666', 13, 'start'); wl(g, 132, -45, 'steric clash', '#666', 13, 'start');
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "cryoem cx cy width k=cryoem|xray |text"
    cryoem: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p), cap = (x, y, a, b) => { wl(g, x, y, a, DK, 16); if (b) wl(g, x, y + 18, b, '#666', 13); };
      const model = (x, y) => { const a = []; for (let u = 0; u <= 6 * Math.PI; u += .2) a.push([x - 42 + u * 2.4 + 7 * Math.cos(u), y - 18 + 13 * Math.sin(u)]);
        still(g, smooth([[x + 10, y - 18], [x + 30, y - 30], [x + 44, y - 5], [x + 30, y + 14]]), GRY, 2.5);
        still(g, pts(a), RED, 3); const s = `M${x - 40} ${y + 20} H${x + 10} V${y + 12} L${x + 30} ${y + 27} L${x + 10} ${y + 42} V${y + 34} H${x - 40} Z`; part(g, s, '#ffd84a', '#b58a10', 2);
        still(g, smooth([[x + 30, y + 14], [x + 40, y + 30], [x + 20, y + 48], [x - 30, y + 46]]), GRY, 2.5); };
      const xr = o.k === 'xray';
      if (xr) {
        const xs = [-195, -65, 65, 195], y = -15;
        // crystal: hexagonal prism
        const hx = Array.from({ length: 6 }, (_, i) => [xs[0] - 8 + 26 * Math.cos(i * Math.PI / 3), y + 10 + 26 * Math.sin(i * Math.PI / 3)]);
        part(g, `M${P(...hx[4])} L${P(hx[4][0] + 18, hx[4][1] - 22)} L${P(hx[5][0] + 18, hx[5][1] - 22)} L${P(hx[0][0] + 18, hx[0][1] - 22)} L${P(...hx[0])} L${P(...hx[5])} Z`, '#8fc7e3', '#2b6c94', 2.5);
        part(g, `M${P(...hx[0])} L${P(hx[0][0] + 18, hx[0][1] - 22)} L${P(hx[1][0] + 18, hx[1][1] - 22)} L${P(...hx[1])} Z`, '#6fb0d3', '#2b6c94', 2.5);
        part(g, pts(hx) + ' Z', '#bfe0f0', '#2b6c94', 2.5);
        // diffraction pattern on a detector, beam in from the left
        part(g, R(xs[1] - 38, y - 40, 76, 80), '#2e3440', DK, 2.5);
        const r = rnd(11); let d = '';
        for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { if (!i && !j) continue; const q = r(); if (q < .25) continue; const x = xs[1] + i * 8.4 + j * 1.2, yy = y + j * 8.4 - i * 1.2, rad = .6 + 2.4 * q * q;
          d += C(x, yy, rad) + ' '; }
        still(g, d, '#f4f6fa', 2); part(g, C(xs[1], y, 4), '#555', '#999', 1.5);
        arrow(g, xs[1] - 72, y - 52, xs[1] - 42, y - 30, VIO, 2.5, true); wl(g, xs[1] - 74, y - 58, 'X-rays', VIO, 13);
        // electron density mesh around a stick model
        const st = [[xs[2] - 32, y + 18], [xs[2] - 16, y - 6], [xs[2] + 4, y + 10], [xs[2] + 18, y - 14], [xs[2] + 34, y + 4]];
        still(g, smoothC(st.map(([x, yy], i) => [x + (i % 2 ? 4 : -4), yy + (i % 2 ? -14 : 14)]).concat(st.slice().reverse().map(([x, yy], i) => [x, yy + (i % 2 ? 14 : -14)]))), BLU, 1.6);
        still(g, smoothC(st.map(([x, yy]) => [x, yy - 22]).concat(st.slice().reverse().map(([x, yy]) => [x, yy + 22]))), '#7fb7ea', 1.4);
        still(g, pts(st), DK, 3); still(g, `M${st[1][0]} ${st[1][1]} l-4 -16 M${st[3][0]} ${st[3][1]} l4 -16`, RED, 3);
        model(xs[3], y - 10);
        for (let i = 0; i < 3; i++) arrow(g, xs[i] + 44, y, xs[i + 1] - 46, y, DK, 3, true);
        cap(xs[0], y + 65, '1 protein crystal'); cap(xs[1], y + 65, '2 diffraction', 'pattern (intensities)'); cap(xs[2], y + 65, '3 electron', 'density map'); cap(xs[3], y + 65, '4 atomic model');
        wl(g, 0, 125, 'phases (molecular replacement, SAD/MAD) + Fourier transform → ρ(x, y, z)', '#555', 15);
        if (t) lb(g, 0, -115, t, TXT.blue, 20);
        return g;
      }
      const y1 = -95, y2 = 95, xs = [-180, 0, 180];
      // 1 tube of purified protein
      { const x = xs[0], y = y1; fl(g, `M${x - 15} ${y - 5} H${x + 15} V${y + 12} L${x} ${y + 44} L${x - 15} ${y + 12} Z`, '#bcd6f5');
        still(g, `M${x - 16} ${y - 40} H${x + 16} V${y + 12} L${x} ${y + 44} L${x - 16} ${y + 12} Z M${x - 20} ${y - 40} H${x + 20}`, DK, 2.5);
        still(g, `M${x + 16} ${y - 40} q 14 -10 6 -22`, DK, 2);
        let d = ''; for (const [a, b] of [[-7, 4], [5, 10], [-2, 20], [6, -1], [-6, 14]]) d += C(x + a, y + b, 2.6) + ' '; still(g, d, VIO, 2); }
      // 2 grid with vitreous ice
      { const x = xs[1], y = y1, r = 42; part(g, C(x, y, r), '#e9b384', '#9a5a20', 2.5); let d = '';
        for (let k = -3; k <= 3; k++) { const u = k * 11, h = Math.sqrt(r * r - u * u); d += `M${x + u} ${P(0, y - h).split(' ')[1]} V${(y + h).toFixed(1)} M${(x - h).toFixed(1)} ${y + u} H${(x + h).toFixed(1)} `; }
        still(g, d, '#9a5a20', 1.4); }
      // 3 electron microscope column
      { const x = xs[2], y = y1; part(g, `M${x - 16} ${y - 52} H${x + 16} L${x + 22} ${y + 34} H${x - 22} Z`, '#dfe4ea', DK, 2.5);
        part(g, R(x - 30, y + 34, 60, 14), '#9aa3ad', DK, 2.5); part(g, C(x, y - 42, 7), '#ffd84a', DK, 2);
        for (const yy of [-22, -2, 18]) still(g, `M${x - 20} ${y + yy} q 8 -6 16 0 M${x + 4} ${y + yy} q 8 -6 16 0`, BLU, 2);
        line(g, `M${x} ${y - 34} V${y + 32}`, VIO, 2); wl(g, x + 30, y - 38, 'e⁻', VIO, 15, 'start'); }
      // 4 2D class averages
      { const x = xs[2], y = y2, r = rnd(5); for (let i = 0; i < 6; i++) { const a = x - 42 + (i % 3) * 29, b = y - 30 + Math.floor(i / 3) * 31;
        part(g, R(a, b, 26, 26), '#3a3f45', DK, 1.5); fl(g, Er(a + 13, b + 13, 9, 5 + 3 * r(), i * 33), '#e8edf2'); } }
      // 5 3D map
      { const x = xs[1], y = y2, r = rnd(3), a = Array.from({ length: 12 }, (_, i) => { const u = i * Math.PI / 6, q = 32 + 9 * r(); return [x + q * Math.cos(u), y + q * .8 * Math.sin(u)]; });
        part(g, smoothC(a), '#9cc3e6', BLU, 2.5); still(g, smoothC(a.map(([px, py]) => [x + (px - x) * .55 + 6, y + (py - y) * .55])), BLU, 1.5);
        still(g, smoothC(a.map(([px, py]) => [x + (px - x) * .25 - 8, y + (py - y) * .25 - 4])), BLU, 1.5); }
      // 6 atomic model
      model(xs[0], y2 - 10);
      arrow(g, -128, y1, -52, y1, DK, 3, true); arrow(g, 52, y1, 128, y1, DK, 3, true);
      line(g, `M240 ${y1 + 30} C 268 ${y1 + 60}, 268 ${y2 - 60}, 236 ${y2 - 34}`, DK, 3); tip(g, 236, y2 - 34, 252, y2 - 46, DK, 3);
      arrow(g, 128, y2, 52, y2, DK, 3, true); arrow(g, -52, y2, -128, y2, DK, 3, true);
      cap(xs[0], y1 + 68, '1 purified protein'); cap(xs[1], y1 + 68, '2 vitrified grid', 'plunge-frozen in liquid ethane'); cap(xs[2], y1 + 68, '3 cryo-EM imaging', 'many particle images');
      cap(xs[2], y2 + 66, '4 2D class averages'); cap(xs[1], y2 + 66, '5 3D map', 'reconstruction (~3 Å)'); cap(xs[0], y2 + 66, '6 atomic model', 'built into the map');
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "alignment cx cy width k=pairwise|grid |text"
    alignment: ([cx, cy, W = 520], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), BC = { A: '#bfe3a8', C: '#bcd6f5', G: '#ffe39a', T: '#f6c1b8' };
      if (o.k === 'grid') {
        const a = 'GCATG', b = 'GATG', m = b.length, n = a.length, F = [], cs = 38, gx = -250, gy = -150, gap = -1;
        for (let i = 0; i <= m; i++) { F.push([]); for (let j = 0; j <= n; j++) F[i][j] = !i ? j * gap : !j ? i * gap
          : Math.max(F[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 1 : -1), F[i - 1][j] + gap, F[i][j - 1] + gap); }
        const path = [[m, n]]; let i = m, j = n, ta = '', tb = '';
        while (i || j) { if (i && j && F[i][j] === F[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 1 : -1)) { ta = a[j - 1] + ta; tb = b[i - 1] + tb; i--; j--; }
          else if (i && F[i][j] === F[i - 1][j] + gap) { ta = '−' + ta; tb = b[i - 1] + tb; i--; } else { ta = a[j - 1] + ta; tb = '−' + tb; j--; } path.push([i, j]); }
        const X = j => gx + cs * (j + 1) + cs / 2, Y = i => gy + cs * (i + 1) + cs / 2;
        for (const [pi, pj] of path) fl(g, R(X(pj) - cs / 2 + 2, Y(pi) - cs / 2 + 2, cs - 4, cs - 4), '#ffe39a');
        let d = ''; for (let k = 0; k <= m + 1; k++) d += `M${gx + cs} ${gy + cs * (k + 1) - (k ? 0 : cs)} H${gx + cs * (n + 2)} `.replace(`M${gx + cs} ${gy}`, `M${gx + cs} ${gy + cs}`);
        d = ''; for (let k = 1; k <= m + 2; k++) d += `M${gx + cs} ${gy + cs * k} H${gx + cs * (n + 2)} `; for (let k = 1; k <= n + 2; k++) d += `M${gx + cs * k} ${gy + cs} V${gy + cs * (m + 2)} `;
        still(g, d, GRY, 1.5);
        for (let jj = 1; jj <= n; jj++) lb(g, X(jj), gy + cs / 2 + 8, a[jj - 1], TXT.blue, 22);
        for (let ii = 1; ii <= m; ii++) lb(g, gx + cs / 2, Y(ii) + 8, b[ii - 1], TXT.green, 22);
        for (let ii = 0; ii <= m; ii++) for (let jj = 0; jj <= n; jj++) { const v = F[ii][jj]; lb(g, X(jj), Y(ii) + 6, v < 0 ? '−' + -v : '' + v, DK, 16); }
        for (let k = 0; k < path.length - 1; k++) { const [i1, j1] = path[k], [i2, j2] = path[k + 1], x1 = X(j1) - (j1 - j2) * 11, y1 = Y(i1) - (i1 - i2) * 11, x2 = X(j2) + (j1 - j2) * 11, y2 = Y(i2) + (i1 - i2) * 11;
          arrow(g, x1, y1, x2, y2, ORG, 2.2); }
        const tx = 40; wl(g, tx, -130, 'F(i, j) = max of', DK, 16, 'start');
        wl(g, tx + 14, -106, 'F(i−1, j−1) + s(match / mismatch)', DK, 15, 'start'); wl(g, tx + 14, -84, 'F(i−1, j) − 1   (gap)', DK, 15, 'start'); wl(g, tx + 14, -62, 'F(i, j−1) − 1   (gap)', DK, 15, 'start');
        wl(g, tx, -32, 'match +1, mismatch −1, gap −1', '#666', 14, 'start');
        [...ta].forEach((ch, k) => { const x = tx + 30 + k * 28; lb(g, x, 20, ch, ch === '−' ? GRY : TXT.blue, 22); lb(g, x, 72, tb[k], tb[k] === '−' ? GRY : TXT.green, 22);
          if (ch === tb[k]) lb(g, x, 46, '|', DK, 20); });
        wl(g, tx + 120, 108, `traceback (orange) → optimal alignment, score ${F[m][n]}`, TXT.orange, 14);
        wl(g, gx + cs * (n + 2) / 2 + cs / 2, gy + cs * (m + 2) + 26, 'Needleman–Wunsch score grid', DK, 15);
        if (t) lb(g, 0, -175, t, TXT.blue, 20);
        return g;
      }
      const s1 = 'AGCT-ACGTA', s2 = 'AGCTTAGG-A', n = s1.length, cw = 38, x0 = -n * cw / 2; let mt = 0, mm = 0, gp = 0;
      for (let i = 0; i < n; i++) { const x = x0 + i * cw + cw / 2, a = s1[i], b = s2[i];
        if (a === '-' || b === '-') { gp++; fl(g, rr(x - 18, -84, 36, 126, 6), '#eef0f2'); } else if (a === b) mt++; else mm++;
        for (const [ch, y] of [[a, -62], [b, 20]]) { if (ch !== '-') part(g, rr(x - 15, y - 18, 30, 34, 6), BC[ch], DK, 1.8); lb(g, x, y + 8, ch === '-' ? '−' : ch, ch === '-' ? GRY : DK, 22); }
        if (a !== '-' && b !== '-') lb(g, x, -14, a === b ? '|' : '×', a === b ? DK : RED, 24); }
      wl(g, x0 - 12, -55, 'seq 1', DK, 16, 'end'); wl(g, x0 - 12, 27, 'seq 2', DK, 16, 'end');
      wl(g, -150, 82, '| match +1', DK, 16); wl(g, 0, 82, '× mismatch −1', TXT.red, 16); wl(g, 150, 82, '− gap −2', '#666', 16);
      const sc = mt - mm - 2 * gp;
      wl(g, 0, 118, `score = ${mt}(+1) + ${mm}(−1) + ${gp}(−2) = ${sc < 0 ? '−' + -sc : '+' + sc}`, TXT.blue, 18);
      wl(g, 0, 145, `identity = ${mt}/${n} = ${Math.round(100 * mt / n)}%`, '#555', 15);
      if (t) lb(g, 0, -120, t, TXT.blue, 20);
      return g;
    },
    // "phylotree cx cy width k=rooted|unrooted |text"
    phylotree: ([cx, cy, W = 480], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 480, 0, p);
      const T = { c: [{ l: .08, b: 100, c: [{ l: .1, b: 98, c: [{ l: .12, b: 100, c: [{ l: .06, b: 87, c: [{ n: 'mouse', l: .08 }, { n: 'rat', l: .09 }] }, { n: 'rabbit', l: .17 }] },
        { l: .14, b: 72, c: [{ n: 'chicken', l: .2 }, { n: 'lizard', l: .24 }] }] }, { n: 'frog', l: .32 }] }, { n: 'zebrafish', l: .45, out: 1 }] };
      const leaves = nd => nd.c ? nd.c.reduce((s, c) => s + leaves(c), 0) : 1, all = [];
      if (o.k === 'unrooted') {
        const k = 330, lay = (nd, x, y, a0, a1) => { nd.x = x; nd.y = y; all.push(nd); if (!nd.c) return; let a = a0; const tot = leaves(nd);
          for (const c of nd.c) { const span = (a1 - a0) * leaves(c) / tot, m = (a + span / 2) * Math.PI / 180; c.a = m; lay(c, x + c.l * k * Math.cos(m), y + c.l * k * Math.sin(m), a, a + span); a += span; } };
        lay(T, 0, 0, -20, 340);
        const xs = all.map(n => n.x), ys = all.map(n => n.y), sx = (Math.min(...xs) + Math.max(...xs)) / 2, sy = (Math.min(...ys) + Math.max(...ys)) / 2;
        all.forEach(n => { n.x -= sx; n.y -= sy + 10; });
        let d = ''; all.forEach(n => (n.c || []).forEach(c => { d += `M${P(n.x, n.y)} L${P(c.x, c.y)} `; })); still(g, d, DK, 3);
        all.forEach(n => { if (!n.c) { const ca = Math.cos(n.a), sa = Math.sin(n.a); part(g, C(n.x, n.y, 3.5), DK, DK, 1.5);
          wl(g, n.x + ca * 12, n.y + sa * 12 + 6, n.n, n.out ? '#666' : DK, 17, ca > .3 ? 'start' : ca < -.3 ? 'end' : 'middle'); }
          else if (n.b) wl(g, n.x + 6, n.y - 8, '' + n.b, TXT.red, 13, 'start'); });
        still(g, `M-200 150 h${.1 * k}`, DK, 3); wl(g, -200 + .05 * k, 170, '0.1 substitutions/site', DK, 14);
        wl(g, 90, 165, 'unrooted: no ancestor or time direction', '#666', 14); wl(g, 90, 183, 'red = bootstrap support (%)', TXT.red, 13);
        if (t) lb(g, 0, -180, t, TXT.blue, 20);
        return g;
      }
      const k = 560, x0 = -220; let li = 0;
      const lay = (nd, x) => { nd.x = x; all.push(nd); if (!nd.c) { nd.y = -140 + li++ * 44; return; } nd.c.forEach(c => lay(c, x + c.l * k)); nd.y = (nd.c[0].y + nd.c.at(-1).y) / 2; };
      lay(T, x0); let d = `M${x0 - 16} ${T.y} H${x0} `;
      all.forEach(n => { if (!n.c) return; d += `M${n.x} ${P(0, n.c[0].y).split(' ')[1]} V${n.c.at(-1).y.toFixed(1)} `; n.c.forEach(c => { d += `M${n.x} ${c.y.toFixed(1)} H${c.x.toFixed(1)} `; }); });
      still(g, d, DK, 3);
      all.forEach(n => { if (!n.c) wl(g, n.x + 8, n.y + 6, n.out ? n.n + ' (outgroup)' : n.n, n.out ? '#666' : DK, 17, 'start'); else if (n.b) wl(g, n.x - 5, n.y - 7, '' + n.b, TXT.red, 13, 'end'); });
      part(g, C(x0, T.y, 4), DK, DK, 2); wl(g, x0 - 22, T.y + 5, 'root', TXT.blue, 15, 'end');
      still(g, `M${x0} 175 h${.1 * k}`, DK, 3); wl(g, x0 + .05 * k, 195, '0.1 substitutions/site', DK, 14);
      wl(g, 90, 180, 'red = bootstrap support (%)', TXT.red, 14); wl(g, 90, 198, 'branch length = amount of change', '#666', 13);
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "genenetwork cx cy width k=feedforward|negfeedback|toggle |text"
    genenetwork: ([cx, cy, W = 460], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 460, 0, p), k = o.k || 'feedforward';
      const node = (x, y, name, fill) => { part(g, C(x, y, 30), fill, DK, 2.5); lb(g, x, y + 8, name, DK, 24); return [x, y]; };
      const edge = (A, B, act, bend = 0) => { const c = act ? GRN : RED, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]);
        const qx = mx - (B[1] - A[1]) / L * bend, qy = my + (B[0] - A[0]) / L * bend, r = 37, d1 = Math.hypot(qx - A[0], qy - A[1]), d2 = Math.hypot(B[0] - qx, B[1] - qy);
        const s = [A[0] + (qx - A[0]) / d1 * r, A[1] + (qy - A[1]) / d1 * r], e = [B[0] - (B[0] - qx) / d2 * r, B[1] - (B[1] - qy) / d2 * r];
        line(g, `M${P(...s)} Q${P(qx, qy)} ${P(...e)}`, c, 3.5); act ? tip(g, e[0], e[1], qx, qy, c, 3.5) : bar(g, e[0], e[1], qx, qy, c, 3.5); };
      const legend = y => { arrow(g, -150, y, -110, y, GRN, 3); wl(g, -102, y + 5, 'activation', TXT.green, 15, 'start');
        still(g, `M30 ${y} H66`, RED, 3); bar(g, 70, y, 30, y, RED, 3); wl(g, 80, y + 5, 'repression', TXT.red, 15, 'start'); };
      if (k === 'negfeedback') {
        const X = node(-110, -70, 'X', '#bcd6f5'), Y = node(110, -70, 'Y', '#f6c1b8'); edge(X, Y, 1, -50); edge(Y, X, 0, -50);
        wl(g, 0, -140, 'activates', TXT.green, 15); wl(g, 0, 2, 'represses', TXT.red, 15);
        wl(g, 0, 30, 'negative feedback loop (e.g. p53 → Mdm2 ⊣ p53)', DK, 16);
        const ax = -150, ay = 145; axes(g, ax, ay, 160, 55, '', 'level'); wl(g, 168, ay + 5, 'time', DK, 15, 'start');
        const f = (ph, u) => ay - 8 - 60 * (.5 + .45 * Math.exp(-u / 4) * Math.cos(u * 1.5 - ph));
        still(g, curve(x => f(0, (x - ax) / 22), ax, 150), BLU, 3); still(g, curve(x => f(1.3, (x - ax) / 22), ax, 150), RED, 3);
        wl(g, 100, 62, 'X', TXT.blue, 16); wl(g, 125, 62, 'Y', TXT.red, 16);
        wl(g, 0, 172, 'delayed negative feedback → pulses, homeostasis', '#666', 14);
        legend(198); if (t) lb(g, 0, -175, t, TXT.blue, 20); return g;
      }
      if (k === 'toggle') {
        const A = node(-110, -40, 'A', '#bcd6f5'), B = node(110, -40, 'B', '#f6c1b8'); edge(A, B, 0, -50); edge(B, A, 0, -50);
        for (const [x, s] of [[-110, 'inducer 1'], [110, 'inducer 2']]) { wl(g, x, -142, s, VIO, 15); still(g, `M${x} -132 V-80`, VIO, 3); bar(g, x, -80, x, -132, VIO, 3); }
        pill(g, -115, 65, 'state 1: A high, B low', '#e6f0fa', BLU, 15); pill(g, 115, 65, 'state 2: B high, A low', '#fde3de', RED, 15);
        wl(g, 0, 112, 'mutual repression → bistable switch (cell memory)', DK, 16);
        legend(160); if (t) lb(g, 0, -175, t, TXT.blue, 20); return g;
      }
      const X = node(-130, -80, 'X', '#bcd6f5'), Y = node(130, -80, 'Y', '#bfe3a8'), Z = node(0, 70, 'Z', '#ffe39a');
      edge(X, Y, 1); edge(X, Z, 1); edge(Y, Z, 1);
      wl(g, 0, 122, 'AND gate at Z promoter', '#666', 14);
      wl(g, 0, -140, 'coherent type-1 feed-forward loop', DK, 17);
      wl(g, 0, 150, 'Z turns on only if the X signal persists (filters brief pulses)', DK, 15);
      legend(185); if (t) lb(g, 0, -175, t, TXT.blue, 20); return g;
    },
    // "mapk cx cy width |text"
    mapk: ([cx, cy, W = 520], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 520, 0, p);
      fl(g, R(-262, -150, 524, 30), '#f3e3b8'); still(g, 'M-262 -150 H262 M-262 -120 H262', '#b59a4a', 2);
      wl(g, 258, -160, 'extracellular', '#666', 14, 'end'); wl(g, -258, 130, 'cytoplasm', '#666', 14, 'start');
      for (const x of [-165, -125]) { part(g, rr(x - 11, -205, 22, 50, 9), '#bcd6f5', BLU, 2); still(g, `M${x} -155 V-117`, BLU, 4);
        prot(g, x, -95, 15, 22, '#7fb7ea'); still(g, `M${x} -73 V-55`, BLU, 3); phos(g, x + (x < -145 ? -13 : 13), -64, 8); }
      part(g, C(-145, -214, 13), '#e04b3a', RED, 2); wl(g, -126, -222, 'growth factor', TXT.red, 14, 'start');
      wl(g, -182, -176, 'RTK', TXT.blue, 15, 'end'); wl(g, -182, -160, 'dimer', TXT.blue, 13, 'end');
      prot(g, -88, -70, 18, 12, '#bfe3a8', 'Grb2', 12); prot(g, -42, -92, 25, 15, '#d6c4ec', 'SOS', 14);
      still(g, 'M60 -115 V-120', DK, 3); prot(g, 60, -100, 36, 15, '#ffd27a', 'Ras-GTP', 14);
      arrow(g, -15, -96, 20, -98, DK, 2.5, true); wl(g, 2, -124 + 32, '', DK, 1);
      wl(g, 0, -70, 'GDP → GTP', '#666', 12);
      const ks = [['Raf', -50, '#f6c1b8', 'MAPKKK', 1], ['MEK', 15, '#c9e6c0', 'MAPKK', 2], ['ERK', 80, '#bcd6f5', 'MAPK', 2]];
      arrow(g, 82, -86, 116, -66, RED, 3, true);
      ks.forEach(([n, y, f, k, np], i) => { prot(g, 140, y, 32, 18, f, n, 16); wl(g, 205, y + 5, k, '#555', 14, 'start');
        for (let j = 0; j < np; j++) phos(g, 180, y - 8 + j * 17, 8);
        if (i < 2) arrow(g, 140, y + 20, 140, ks[i + 1][1] - 21, RED, 3, true); });
      fl(g, E(-20, 170, 232, 44), '#f1ecf7'); still(g, E(-20, 170, 232, 44), VIO, 2.5);
      still(g, 'M-170 188 H150 M-170 194 H150', DK, 2);
      arrow(g, 138, 100, 108, 146, RED, 3, true);
      prot(g, 100, 162, 26, 12, '#bcd6f5', 'ERK', 13); phos(g, 132, 156, 7);
      arrow(g, 72, 166, 50, 172, RED, 2.5, true);
      prot(g, 20, 176, 30, 12, '#bfe3a8', 'Elk-1', 13); phos(g, 20, 154, 7);
      still(g, 'M-15 188 V170 H-40', GRN, 3); tip(g, -42, 170, -30, 170, GRN, 3);
      wl(g, -50, 168, 'target genes on (e.g. c-fos)', TXT.green, 14, 'end'); wl(g, -90, 207, 'nucleus', VIO, 14);
      wl(g, -255, -30, 'each kinase phosphorylates', DK, 14, 'start'); wl(g, -255, -12, 'and activates the next', DK, 14, 'start');
      wl(g, -255, 6, '→ amplification', DK, 14, 'start'); phos(g, -246, 50, 8); wl(g, -234, 55, '= phosphate (from ATP)', DK, 14, 'start');
      if (t) lb(g, 0, -240, t, TXT.blue, 20);
      return g;
    },
    // "wnt cx cy width k=off|on|notch |text"
    wnt: ([cx, cy, W = 520], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k || 'off', BC = '#ffd27a';
      const nucleus = () => { fl(g, E(40, 152, 215, 55), '#f1ecf7'); still(g, E(40, 152, 215, 55), VIO, 2.5); still(g, 'M-130 182 H210 M-130 188 H210', DK, 2); wl(g, -105, 145, 'nucleus', VIO, 14); };
      const gene = on => { part(g, rr(70, 175, 100, 20, 5), on ? '#5fae3a' : '#cfd3d8', DK, 1.5); wl(g, 120, 190, 'target genes', on ? '#fff' : DK, 13); };
      const bcat = (x, y, s = 13) => prot(g, x, y, 25, 12, BC, 'β-cat', s);
      if (k === 'notch') {
        fl(g, R(-262, -215, 524, 65), '#fde9cf'); fl(g, R(-262, -158, 524, 16), '#f3e3b8'); fl(g, R(-262, -68, 524, 16), '#f3e3b8');
        still(g, 'M-262 -158 H262 M-262 -142 H262 M-262 -68 H262 M-262 -52 H262', '#b59a4a', 2);
        wl(g, -255, -190, 'signal-sending cell', TXT.orange, 15, 'start'); wl(g, -255, -30, 'signal-receiving cell', TXT.blue, 15, 'start');
        const x = -60; still(g, `M${x} -142 V-118`, RED, 4); prot(g, x, -112, 16, 8, '#e04b3a'); wl(g, x - 24, -116, 'Delta', TXT.red, 15, 'end');
        still(g, `M${x} -103 V-52`, VIO, 4); for (const y of [-98, -90]) prot(g, x, y, 9, 4, '#c9b3e6');
        part(g, rr(x - 6, -52, 12, 40, 4), '#7a4ab0', VIO, 2); wl(g, x - 24, -84, 'Notch', VIO, 15, 'end');
        const cutm = (y, s) => { still(g, `M${x - 12} ${y - 6} L${x + 12} ${y + 6} M${x - 12} ${y + 6} L${x + 12} ${y - 6}`, RED, 2.5); wl(g, x + 22, y + 5, s, DK, 13, 'start'); };
        cutm(-76, 'S2: ADAM10 cleaves'); cutm(-58, 'S3: γ-secretase cleaves'); 
        nucleus(); arrow(g, x + 10, -10, 0, 18, VIO, 3, true); prot(g, 32, 28, 30, 13, '#c9b3e6', 'NICD', 14);
        arrow(g, 30, 44, 12, 126, VIO, 3, true);
        prot(g, 0, 172, 30, 12, '#bfe3a8', 'CSL', 13); prot(g, 0, 146, 26, 12, '#c9b3e6', 'NICD', 12); prot(g, -48, 146, 22, 11, '#ffe39a', 'MAML', 11); gene(1);
        still(g, 'M75 175 V158 H100', GRN, 3); tip(g, 102, 158, 90, 158, GRN, 3); wl(g, 110, 140, 'Hes / Hey on', TXT.green, 14, 'start');
        wl(g, 120, -20, 'NICD = Notch intracellular domain', '#555', 13); wl(g, 120, 0, 'CSL = RBPJ', '#555', 13);
        if (t) lb(g, 0, -232, t, TXT.blue, 20); return g;
      }
      fl(g, R(-262, -150, 524, 25), '#f3e3b8'); still(g, 'M-262 -150 H262 M-262 -125 H262', '#b59a4a', 2);
      // Frizzled (7 TM) and LRP5/6
      let d = 'M-205 -165'; for (let i = 0; i < 7; i++) d += ` L${-200 + i * 8} ${i % 2 ? -158 : -117}`; still(g, d, BLU, 3); prot(g, -205, -172, 14, 9, '#bcd6f5');
      wl(g, -222, -200, 'Frizzled', TXT.blue, 14); still(g, 'M-110 -165 V-108', BLU, 4); part(g, rr(-120, -205, 20, 42, 6), '#bcd6f5', BLU, 2); wl(g, -76, -195, 'LRP5/6', TXT.blue, 14);
      nucleus(); prot(g, 0, 172, 32, 12, '#bfe3a8', 'TCF/LEF', 12);
      if (k === 'on') {
        part(g, smoothC([[-188, -186], [-158, -206], [-124, -206], [-121, -190], [-158, -180]]), '#e04b3a', RED, 2); wl(g, -150, -214, 'Wnt', TXT.red, 16);
        phos(g, -96, -100, 7); prot(g, -190, -100, 22, 11, '#bfe3a8', 'Dvl', 13);
        part(g, E(-110, -60, 40, 18), '#e3e5e8', GRY, 2); wl(g, -110, -55, 'APC·Axin·GSK3β', '#777', 12);
        still(g, 'M-190 -88 Q-180 -60 -156 -60', RED, 3); bar(g, -153, -60, -170, -62, RED, 3);
        wl(g, -110, -28, 'destruction complex inhibited', '#777', 13);
        for (const [x, y] of [[10, -90], [70, -70], [30, -45], [100, -30], [150, -75], [190, -40]]) bcat(x, y);
        wl(g, 115, -105, 'β-catenin accumulates', TXT.orange, 15);
        arrow(g, 40, -20, 10, 126, ORG, 3, true); bcat(0, 146, 12);
        still(g, 'M75 175 V158 H100', GRN, 3); tip(g, 102, 158, 90, 158, GRN, 3); gene(1);
        wl(g, 110, 140, 'ON: Axin2, c-Myc', TXT.green, 14, 'start');
      } else {
        wl(g, -10, -195, 'no Wnt ligand', TXT.red, 16);
        prot(g, -105, -40, 40, 20, '#c9b3e6', 'APC', 14); prot(g, -75, -68, 24, 12, '#bcd6f5', 'Axin', 12);
        prot(g, -60, -14, 28, 12, '#f6c1b8', 'GSK3β', 12); prot(g, -142, -68, 20, 11, '#bfe3a8', 'CK1', 11);
        wl(g, -105, 26, 'destruction complex', '#555', 14);
        bcat(-215, -20); wl(g, -215, -42, 'new β-catenin', TXT.orange, 13); arrow(g, -190, -26, -148, -36, ORG, 3, true);
        arrow(g, -30, -40, 8, -40, ORG, 3, true); bcat(36, -40); phos(g, 30, -60, 7); phos(g, 46, -58, 7);
        for (const [x, y] of [[66, -54], [78, -64], [90, -74]]) prot(g, x, y, 7, 7, '#e3e5e8'); wl(g, 104, -78, 'Ub', '#555', 13, 'start');
        arrow(g, 64, -38, 148, -38, ORG, 3, true);
        part(g, rr(152, -62, 54, 46, 8), '#cfd3d8', DK, 2); still(g, 'M152 -50 H206 M152 -39 H206 M152 -28 H206', GRY, 1.5); wl(g, 180, -72, 'proteasome', DK, 14);
        wl(g, 180, 0, 'β-catenin degraded', TXT.red, 14);
        prot(g, 0, 148, 32, 12, '#e3e5e8', 'Groucho', 12); gene(0);
        still(g, 'M100 164 L140 200 M140 164 L100 200', RED, 3); wl(g, 175, 160, 'OFF', TXT.red, 16, 'start');
      }
      if (t) lb(g, 0, -228, t, TXT.blue, 20);
      return g;
    },
    // "rtk cx cy width |text"
    rtk: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p), xs = [-200, -67, 67, 200];
      fl(g, R(-266, -14, 532, 28), '#f3e3b8'); still(g, 'M-266 -14 H266 M-266 14 H266', '#b59a4a', 2);
      const mono = (x, ph, side) => { part(g, rr(x - 11, -78, 22, 58, 8), '#bcd6f5', BLU, 2); still(g, `M${x} -20 V22`, BLU, 4);
        prot(g, x, 42, 13, 20, '#7fb7ea'); still(g, `M${x} 62 V100`, BLU, 3);
        for (const y of [74, 92]) ph ? phos(g, x + side * 11, y, 7) : lb(g, x + side * 9, y + 5, 'Y', DK, 13); };
      const lig = (x, y) => part(g, smoothC([[x - 18, y], [x - 8, y - 12], [x + 8, y - 12], [x + 18, y], [x, y + 8]]), '#e04b3a', RED, 2);
      mono(xs[0] - 30, 0, -1); mono(xs[0] + 30, 0, 1); lig(xs[0], -118); arrow(g, xs[0], -104, xs[0], -84, RED, 2.5, true);
      for (const i of [1, 2, 3]) { mono(xs[i] - 13, i > 1, -1); mono(xs[i] + 13, i > 1, 1); lig(xs[i], -86); }
      const x3 = xs[2]; still(g, `M${x3 - 8} 32 C ${x3 + 2} 48, ${x3 + 18} 60, ${x3 + 22} 72`, ORG, 2.5); tip(g, x3 + 22, 72, x3 + 18, 60, ORG, 2.5);
      still(g, `M${x3 + 8} 32 C ${x3 - 2} 48, ${x3 - 18} 60, ${x3 - 22} 72`, ORG, 2.5); tip(g, x3 - 22, 72, x3 - 18, 60, ORG, 2.5);
      wl(g, x3, 124, 'ATP → ADP', TXT.orange, 13);
      const x4 = xs[3]; part(g, `M${x4 + 30} 80 a12 12 0 1 1 0 24 h18 v-24 Z`, '#bfe3a8', GRN, 2); wl(g, x4 + 52, 97, 'SH2', TXT.green, 12, 'start');
      wl(g, x4 + 40, 122, 'Grb2', TXT.green, 14); arrow(g, x4 + 40, 128, x4 + 40, 150, GRN, 2.5, true); wl(g, x4 + 40, 166, 'Ras–MAPK', TXT.green, 13);
      for (let i = 0; i < 3; i++) arrow(g, xs[i] + 40, -120, xs[i + 1] - 40, -120, DK, 2.5);
      const caps = [['1 ligand binds', 'monomers'], ['2 dimerization', ''], ['3 trans-auto-', 'phosphorylation'], ['4 SH2 adaptor', 'docks on pY']];
      caps.forEach(([a, b], i) => { wl(g, xs[i] - (i === 3 ? 48 : 0), 160 + (i === 2 ? 12 : 0), a, DK, 15); if (b) wl(g, xs[i] - (i === 3 ? 48 : 0), 178 + (i === 2 ? 12 : 0), b, DK, 15); });
      wl(g, -262, -140, 'extracellular', '#666', 14, 'start'); wl(g, -262, 125, 'cytoplasm', '#666', 14, 'start');
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "cyclins cx cy width |text"
    cyclins: ([cx, cy, W = 500], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), X = f => -200 + f * 410, Y = c => 110 - 220 * c, sg = (u, s) => 1 / (1 + Math.exp(-u / s));
      const ph = [['G1', 0, .35, '#cfe8c4'], ['S', .35, .65, '#bcd6f5'], ['G2', .65, .82, '#ffe39a'], ['M', .82, 1, '#f6c1b8']];
      for (const [n, a, b, c] of ph) { part(g, R(X(a), 122, X(b) - X(a), 22), c, DK, 1.5); wl(g, (X(a) + X(b)) / 2, 139, n, DK, 16); }
      const cur = [['cyclin D + CDK4/6', GRN, f => .42 * sg(f - .12, .03)], ['cyclin E + CDK2', ORG, f => .85 * Math.exp(-(((f - .33) / .075) ** 2))],
        ['cyclin A + CDK2/1', BLU, f => .8 * sg(f - .45, .04) * sg(.86 - f, .012)], ['cyclin B + CDK1', RED, f => sg(f - .7, .05) * sg(.93 - f, .008)]];
      for (const [f, s, yl, a] of [[.35, 'G1/S checkpoint', -146, 'start'], [.82, 'G2/M checkpoint', -128, 'end'], [.91, 'spindle checkpoint', -146, 'end']]) {
        dash(g, `M${X(f)} 110 V${yl + 4}`, GRY, 2); wl(g, X(f) + (a === 'start' ? 4 : -4), yl, s, '#555', 15, a); }
      cur.forEach(([n, c, fn], i) => { line(g, curve(x => Y(fn((x + 200) / 410)), -200, 210, 200), c, 3.5);
        still(g, `M-196 ${-138 + i * 20} h18`, c, 3.5); wl(g, -174, -133 + i * 20, n, c === GRN ? TXT.green : c === ORG ? TXT.orange : c === BLU ? TXT.blue : TXT.red, 15, 'start'); });
      still(g, 'M-205 -160 V110 H220', DK, 3); tip(g, -205, -160, -205, -150, DK, 3); tip(g, 220, 110, 210, 110, DK, 3);
      lbr(g, -222, -20, 'cyclin level', DK, 16);
      wl(g, 0, 170, 'APC/C destroys cyclin B at anaphase; CDK level stays constant', '#555', 14);
      if (t) lb(g, 0, -180, t, TXT.blue, 20);
      return g;
    },
    // "methylation cx cy width |text"
    methylation: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p), top = 'TACGGATCGCTACG', CMP = { A: 'T', T: 'A', C: 'G', G: 'C' }, n = top.length, X = i => -208 + i * 32;
      for (let i = 0; i < n - 1; i++) if (top[i] === 'C' && top[i + 1] === 'G') fl(g, rr(X(i) - 14, -140, 60, 50, 8), '#fff1b0');
      still(g, `M${X(0) - 20} -145 H${X(n - 1) + 20} M${X(0) - 20} -85 H${X(n - 1) + 20}`, BLU, 4);
      lb(g, X(0) - 26, -140, '5′', DK, 14, 'end'); lb(g, X(n - 1) + 26, -140, '3′', DK, 14, 'start'); lb(g, X(0) - 26, -80, '3′', DK, 14, 'end'); lb(g, X(n - 1) + 26, -80, '5′', DK, 14, 'start');
      let d = ''; for (let i = 0; i < n; i++) d += `M${X(i)} -145 V-135 M${X(i)} -85 V-95 `; still(g, d, BLU, 2);
      for (let i = 0; i < n; i++) { lb(g, X(i), -121, top[i], DK, 16); lb(g, X(i), -99, CMP[top[i]], DK, 16); }
      for (let i = 0; i < n - 1; i++) if (top[i] === 'C' && top[i + 1] === 'G') {
        still(g, `M${X(i)} -145 V-158`, DK, 2.5); part(g, C(X(i), -164, 6), DK, DK, 2); lb(g, X(i) + 9, -160, 'CH₃', DK, 12, 'start');
        still(g, `M${X(i + 1)} -85 V-72`, DK, 2.5); part(g, C(X(i + 1), -66, 6), DK, DK, 2); lb(g, X(i + 1) + 9, -62, 'CH₃', DK, 12, 'start'); }
      wl(g, 0, -185, 'DNMT methylates C in CpG → 5-methylcytosine (symmetric on both strands)', DK, 15);
      const nuc = (x, y, mk2, u = 1) => { prot(g, x, y, 22, 17, '#f4c27a'); still(g, E(x, y, 27, 21), BLU, 2.5);
        for (const s of [-1, 1]) { still(g, `M${x + s * 8} ${y - 18 * u} L${x + s * 16} ${y - 34 * u}`, DK, 2);
          part(g, C(x + s * 17, y - 40 * u, 8), mk2 === 'Ac' ? '#5fae3a' : '#e04b3a', DK, 1.5); lb(g, x + s * 17, y - 40 * u + 3.5, mk2, '#fff', 9.5); } };
      still(g, 'M-255 70 C -240 90, -235 60, -220 70 M-193 70 C -175 85, -170 55, -150 70 M-123 70 C -105 85, -100 55, -80 70 M-53 70 C -40 82, -30 60, -20 70', BLU, 2.5);
      for (const x of [-220, -150, -80]) nuc(x, 70, 'Ac');
      still(g, 'M-40 70 V48 H-18', GRN, 3); tip(g, -16, 48, -26, 48, GRN, 3);
      wl(g, -140, -12, 'euchromatin (open, active)', TXT.green, 16); wl(g, -140, 160, 'acetylated tails (H3K27ac), H3K4me3', DK, 13);
      wl(g, -140, 180, 'transcription ON', TXT.green, 15);
      still(g, 'M65 80 C 75 95, 85 70, 95 80', BLU, 2.5);
      for (const [x, y, u] of [[100, 52, 1], [148, 46, 1], [196, 54, 1], [122, 92, -1], [172, 96, -1], [222, 90, -1]]) nuc(x, y, 'Me', u);
      still(g, `M80 84 V70`, DK, 2); part(g, C(80, 64, 5), DK, DK, 2);
      wl(g, 160, -12, 'heterochromatin (closed, silenced)', TXT.red, 16); wl(g, 160, 160, 'H3K9me3, H3K27me3 + CpG methylation', DK, 13);
      wl(g, 160, 180, 'transcription OFF', TXT.red, 15);
      arrow(g, -30, 22, 50, 22, VIO, 3); wl(g, 10, 14, 'HDAC, HMT', VIO, 13);
      arrow(g, 50, 110, -30, 110, VIO, 3); wl(g, 10, 104, 'HAT', VIO, 13);
      wl(g, 0, 208, 'Ac = acetyl (HAT adds, HDAC removes); Me = methyl', '#555', 14);
      if (t) lb(g, 0, -212, t, TXT.blue, 20);
      return g;
    },
    // "splicing cx cy width k=basic|alternative |text"
    splicing: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p), EC = ['#7fb7ea', '#b48ee0', '#f4a531', '#5fae3a'];
      const ex = (x0, x1, y, i, name) => { part(g, rr(x0, y - 14, x1 - x0, 28, 5), EC[i], DK, 2); wl(g, (x0 + x1) / 2, y + 5, name, '#fff', 14); };
      const intr = (x0, x1, y) => still(g, `M${x0} ${y} H${x1}`, GRY, 3);
      const cap = (x, y) => { part(g, C(x, y, 10), '#ffd27a', '#b58a10', 2); still(g, `M${x + 10} ${y} H${x + 16}`, DK, 2); };
      const pa = (x, y) => lb(g, x, y + 5, 'AAAA', TXT.red, 15, 'start');
      if (o.k === 'alternative') {
        const y = -110; cap(-240, y); intr(-150, -75, y); intr(0, 75, y);
        ex(-225, -150, y, 0, 'exon 1'); ex(-75, 0, y, 1, 'exon 2'); ex(75, 150, y, 2, 'exon 3'); pa(156, y);
        wl(g, -240, y - 22, '5′ cap', DK, 13); wl(g, 175, y - 22, 'poly(A)', TXT.red, 13);
        for (const [a, b] of [[-150, -75], [0, 75]]) { still(g, `M${a} ${y - 14} Q${(a + b) / 2} ${y - 60} ${b} ${y - 14}`, GRN, 2.5); }
        still(g, `M-150 ${y + 14} Q-37 ${y + 80} 75 ${y + 14}`, ORG, 2.5);
        wl(g, -37, y - 52, 'exon inclusion', TXT.green, 14); wl(g, -37, y + 62, 'exon skipping', TXT.orange, 14);
        arrow(g, -100, -30, -140, 10, DK, 2.5, true); arrow(g, 30, -30, 90, 10, DK, 2.5, true);
        const yA = 50; cap(-245, yA); ex(-229, -174, yA, 0, '1'); ex(-174, -119, yA, 1, '2'); ex(-119, -64, yA, 2, '3'); pa(-58, yA);
        wl(g, -150, yA - 25, 'mRNA isoform A', DK, 15);
        const xB = 40; cap(xB, yA); ex(xB + 16, xB + 71, yA, 0, '1'); ex(xB + 71, xB + 126, yA, 2, '3'); pa(xB + 132, yA);
        wl(g, xB + 80, yA - 25, 'mRNA isoform B', DK, 15);
        for (const [x0, ids, tx] of [[-229, [0, 1, 2], 'protein isoform A'], [xB + 16, [0, 2], 'protein isoform B (lacks exon 2 domain)']]) {
          ids.forEach((id, k) => fl(g, R(x0 + k * 55, 100, 55, 18), EC[id])); still(g, rr(x0, 100, ids.length * 55, 18, 6), DK, 2);
          wl(g, x0 + ids.length * 27.5, 140, tx, DK, 14); }
        arrow(g, -150, 68, -150, 94, DK, 2); arrow(g, xB + 71, 68, xB + 71, 94, DK, 2);
        wl(g, 0, 180, 'splice-site choice regulated by SR proteins and hnRNPs', '#555', 14);
        if (t) lb(g, 0, -200, t, TXT.blue, 20);
        return g;
      }
      const y = -140; cap(-240, y); ex(-225, -150, y, 0, 'exon 1'); intr(-150, -55, y); ex(-55, 20, y, 3, 'exon 2'); intr(20, 105, y); ex(105, 175, y, 2, 'exon 3'); pa(181, y);
      wl(g, -240, y - 22, '5′ cap', DK, 13); wl(g, 200, y - 22, 'poly(A) tail', TXT.red, 13); wl(g, -60, y - 30, 'pre-mRNA', DK, 16);
      lb(g, -145, y - 6, 'GU', VIO, 12, 'start'); lb(g, -80, y - 6, 'A', RED, 13); lb(g, -60, y - 6, 'AG', VIO, 12, 'end');
      lb(g, 25, y - 6, 'GU', VIO, 12, 'start'); lb(g, 100, y - 6, 'AG', VIO, 12, 'end');
      arrow(g, -100, -118, -100, -88, DK, 2.5, true);
      const y2 = -45; fl(g, E(-85, y2 + 15, 80, 48), '#e9def5'); still(g, E(-85, y2 + 15, 80, 48), VIO, 2, { 'stroke-dasharray': '5 6' });
      ex(-230, -150, y2, 0, 'exon 1'); ex(-20, 55, y2, 3, 'exon 2');
      still(g, `M-150 ${y2} C -125 ${y2}, -120 ${y2 + 20}, -110 ${y2 + 30}`, GRY, 3);
      still(g, `M-20 ${y2} C -45 ${y2}, -55 ${y2 + 10}, -62 ${y2 + 22}`, GRY, 3);
      still(g, C(-85, y2 + 30, 22), GRY, 3); lb(g, -85, y2 + 35, 'A', RED, 14);
      wl(g, -85, y2 + 82, 'spliceosome (U1, U2, U4/U6, U5 snRNPs)', VIO, 14);
      arrow(g, 70, y2, 120, y2, DK, 2.5, true); still(g, C(165, y2 + 2, 18), GRY, 3); still(g, `M183 ${y2 + 2} q 18 6 26 -12`, GRY, 3);
      wl(g, 165, y2 + 40, 'intron lariat', DK, 14); wl(g, 165, y2 + 57, '→ degraded', '#666', 13);
      arrow(g, -100, 48, -100, 96, DK, 2.5, true); wl(g, -90, 76, 'exons joined', '#555', 13, 'start');
      const y3 = 120; cap(-200, y3); ex(-184, -109, y3, 0, 'exon 1'); ex(-109, -34, y3, 3, 'exon 2'); ex(-34, 36, y3, 2, 'exon 3'); pa(42, y3);
      wl(g, -80, y3 + 38, 'mature mRNA → exported to cytoplasm', DK, 15);
      if (t) lb(g, 0, -195, t, TXT.blue, 20);
      return g;
    },
    // "rnai cx cy width |text"
    rnai: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p);
      const hp = (x, y, L, c = RED, tails = 0) => { still(g, `M${x} ${y - 4} H${x + L} A6 6 0 1 1 ${x + L} ${y + 4} H${x}`, c, 3);
        if (tails) still(g, `M${x} ${y - 4} q -12 -2 -24 -10 M${x} ${y + 4} q -12 2 -24 10`, c, 3); };
      fl(g, rr(-262, -210, 200, 120, 14), '#f1ecf7'); dash(g, rr(-262, -210, 200, 120, 14), VIO, 2); wl(g, -255, -98, 'nucleus', VIO, 14, 'start');
      hp(-210, -180, 60, RED, 1); wl(g, -138, -176, 'pri-miRNA', TXT.red, 14, 'start');
      arrow(g, -180, -168, -180, -142, DK, 2.5, true); wl(g, -170, -150, 'Drosha·DGCR8', '#555', 12, 'start');
      hp(-200, -125, 40); wl(g, -130, -120, 'pre-miRNA', TXT.red, 13, 'start');
      arrow(g, -180, -112, -180, -66, DK, 2.5, true); wl(g, -170, -76, 'Exportin-5', '#555', 12, 'start');
      hp(-200, -50, 40);
      still(g, 'M40 -170 H220 M40 -162 H220', RED, 3); wl(g, 130, -185, 'long dsRNA (virus or experimental)', TXT.red, 14);
      prot(g, -40, -40, 46, 20, '#f4a531', 'Dicer', 17);
      arrow(g, -145, -48, -90, -42, DK, 2.5, true); arrow(g, 120, -152, 5, -52, DK, 2.5, true);
      arrow(g, -40, -18, -40, 2, DK, 2.5, true);
      still(g, 'M-72 12 H-12', RED, 3.5); still(g, 'M-80 20 H-20', BLU, 3.5);
      wl(g, 2, 22, '21–23-nt duplex (2-nt 3′ overhangs)', DK, 13, 'start');
      arrow(g, -40, 28, -40, 52, DK, 2.5, true);
      part(g, smoothC([[-90, 80], [-70, 58], [-40, 66], [-10, 58], [10, 80], [-10, 102], [-40, 96], [-70, 104]]), '#9fd0c0', '#2a7a66', 2.5);
      still(g, 'M-72 80 H-8', RED, 3); wl(g, -40, 125, 'RISC (Argonaute + guide)', '#2a7a66', 14);
      arrow(g, 14, 70, 60, 58, BLU, 2.5, true); still(g, 'M66 56 H100', BLU, 3); wl(g, 106, 61, 'passenger strand discarded', TXT.blue, 13, 'start');
      const mrna = (x0, x1, y) => { still(g, `M${x0} ${y} H${x1}`, VIO, 3); part(g, C(x0 - 6, y, 6), '#ffd27a', '#b58a10', 1.5); lb(g, x1 + 4, y + 5, 'AAA', VIO, 12, 'start'); };
      arrow(g, -90, 96, -150, 140, DK, 2.5, true); arrow(g, 10, 96, 110, 140, DK, 2.5, true);
      mrna(-245, -95, 160); still(g, 'M-175 150 L-165 170 M-165 150 L-175 170', RED, 3); prot(g, -150, 160, 18, 9, '#9fd0c0');
      wl(g, -170, 190, 'perfect match: mRNA cleaved', DK, 14); wl(g, -170, 207, '(siRNA; Ago2 slicer)', '#555', 13);
      mrna(40, 210, 160); prot(g, 70, 152, 20, 13, '#cfd3d8', 'ribo', 10); prot(g, 175, 160, 18, 9, '#9fd0c0');
      still(g, 'M60 132 L80 144 M80 132 L60 144', RED, 3);
      wl(g, 125, 190, 'partial (seed) match in 3′ UTR:', DK, 14); wl(g, 125, 207, 'translation repressed, mRNA decays (miRNA)', '#555', 13);
      if (t) lb(g, 0, -228, t, TXT.blue, 20);
      return g;
    },
    // "ngsflow cx cy width |text"
    ngsflow: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p), BCOL = { A: '#2c8a2c', C: BLU, G: '#d18b00', T: RED }, r = rnd(19);
      const cap = (x, y, a, b) => { wl(g, x, y, a, DK, 15); if (b) wl(g, x, y + 17, b, '#666', 12.5); };
      const frag = (x, y, L) => still(g, `M${x} ${y - 3} h${L} M${x} ${y + 3} h${L}`, GRY, 2.5);
      // 1 fragment
      still(g, 'M-255 -175 C -230 -185, -210 -165, -185 -175 S -140 -185, -110 -175 M-255 -169 C -230 -179, -210 -159, -185 -169 S -140 -179, -110 -169', DK, 2.5);
      arrow(g, -182, -158, -182, -136, DK, 2.5, true);
      for (const [x, y, L] of [[-250, -120, 40], [-200, -112, 32], [-150, -122, 44], [-245, -92, 30], [-195, -86, 46], [-135, -94, 34]]) frag(x, y, L);
      // 2 adapters
      for (const [y, L] of [[-170, 50], [-140, 40], [-110, 56]]) { part(g, R(-L / 2 - 16, y - 5, 14, 10), '#7fb7ea', BLU, 1.5); frag(-L / 2, y, L); part(g, R(L / 2 + 2, y - 5, 14, 10), '#f4a531', ORG, 1.5); }
      // 3 flow cell with bridges and clusters
      part(g, R(115, -102, 135, 10), '#cfd3d8', DK, 2);
      let d = ''; for (let x = 120; x < 248; x += 9) d += `M${x} -102 v-6 `; still(g, d, GRY, 1.5);
      for (const x of [140, 182, 224]) still(g, `M${x - 12} -102 C ${x - 12} -150, ${x + 12} -150, ${x + 12} -102`, VIO, 2.5);
      d = ''; for (let i = 0; i < 26; i++) { const a = r() * 6.28, q = r() * 12; d += `M${(150 + i % 3 * 30 + q * Math.cos(a)).toFixed(1)} ${(-170 + q * Math.sin(a)).toFixed(1)} h.1 `; }
      still(g, d, VIO, 4); wl(g, 240, -168, 'clusters', VIO, 12, 'start');
      // 4 sequencing by synthesis
      part(g, R(118, 30, 74, 74), '#20262e', DK, 2);
      const bases = 'ACGT'; for (let i = 0; i < 30; i++) { const b = bases[Math.floor(r() * 4)]; still(g, `M${(126 + r() * 58).toFixed(1)} ${(38 + r() * 58).toFixed(1)} h.1`, BCOL[b], 6); }
      wl(g, 205, 46, 'cycle 1, 2, 3 …', '#555', 12, 'start'); still(g, 'M210 60 h30', GRY, 1.5);
      [...'CATGGA'].forEach((b, i) => lb(g, 208 + i * 9.5, 85, b, BCOL[b], 16, 'start'));
      wl(g, 205, 102, 'read', '#555', 12, 'start');
      // 5 align to reference
      const ref = 'ACGTTACCGATGCA', rx = i => -235 + i * 18, snp = 7;
      fl(g, R(rx(snp) - 9, 32, 18, 106), '#fff1b0');
      for (const [a, b, row] of [[0, 6, 0], [2, 9, 1], [5, 12, 2], [6, 13, 0], [1, 8, 3], [7, 13, 3]]) { const y = 44 + row * 18;
        part(g, rr(rx(a) - 8, y - 6, (b - a) * 18 + 16, 12, 5), '#e3e5e8', GRY, 1.5); if (a <= snp && snp <= b) lb(g, rx(snp), y + 5, 'T', TXT.red, 13); }
      [...ref].forEach((b, i) => lb(g, rx(i), 130, b, i === snp ? TXT.red : DK, 16));
      still(g, `M${rx(0) - 8} 136 H${rx(ref.length - 1) + 8}`, DK, 2.5); wl(g, rx(ref.length - 1) + 14, 134, 'reference', DK, 13, 'start');
      // arrows
      arrow(g, -100, -140, -60, -140, DK, 3, true); arrow(g, 70, -140, 108, -140, DK, 3, true);
      line(g, 'M255 -60 C 268 -20, 268 10, 235 30', DK, 3); tip(g, 235, 30, 252, 20, DK, 3);
      arrow(g, 108, 70, 40, 70, DK, 3, true);
      cap(-182, -55, '1 fragment DNA'); cap(0, -55, '2 ligate adapters'); cap(182, -55, '3 cluster amplification', 'bridge PCR on the flow cell');
      cap(170, 140, '4 sequencing by synthesis', 'one fluorescent base per cycle'); cap(-110, 168, '5 align reads to reference', 'C → T variant in every read');
      if (t) lb(g, 0, -205, t, TXT.blue, 20);
      return g;
    },
    // "flowcytometry cx cy width k=instrument|plot |text"
    flowcytometry: ([cx, cy, W = 500], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 500, 0, p);
      if (o.k === 'plot') {
        const L = v => -130 + v * 75, Yv = v => 140 - v * 75, r = rnd(23), gate = 1.7, cnt = [0, 0, 0, 0];
        part(g, R(L(0), Yv(4), 300, 300), '#fff', DK, 2.5);
        for (const [mx, my, sx, sy, n, c] of [[2.9, .6, .28, .25, 380, BLU], [.6, 2.9, .25, .28, 170, RED], [.55, .5, .25, .25, 40, GRY], [2.6, 2.6, .3, .3, 10, VIO]]) {
          let d = ''; for (let i = 0; i < n; i++) { const x = Math.min(3.95, Math.max(.05, mx + sx * gauss(r))), y = Math.min(3.95, Math.max(.05, my + sy * gauss(r)));
            cnt[(x > gate ? 1 : 0) + (y > gate ? 0 : 2)]++; d += `M${P(L(x), Yv(y))} h.1 `; } still(g, d, c, 3.2); }
        dash(g, `M${L(gate)} ${Yv(4)} V${Yv(0)} M${L(0)} ${Yv(gate)} H${L(4)}`, RED, 2);
        const tot = cnt.reduce((a, b) => a + b), pc = i => (100 * cnt[i] / tot).toFixed(1) + '%';
        wl(g, L(.08), Yv(3.75), 'CD4⁻CD8⁺ ' + pc(0), TXT.red, 14, 'start'); wl(g, L(3.92), Yv(3.75), pc(1), VIO, 14, 'end');
        wl(g, L(1.62), Yv(.08), pc(2), '#555', 14, 'end'); wl(g, L(3.92), Yv(1.45), 'CD4⁺CD8⁻ ' + pc(3), TXT.blue, 14, 'end');
        wl(g, L(3.92), Yv(3.45), 'double +', VIO, 12, 'end'); wl(g, L(1.62), Yv(.32), 'double −', '#555', 12, 'end');
        for (let v = 0; v <= 4; v++) { still(g, `M${L(v)} ${Yv(0)} v6 M${L(0)} ${Yv(v)} h-6`, DK, 2); lb(g, L(v), Yv(0) + 24, '10' + '⁰¹²³⁴'[v], DK, 14); lb(g, L(0) - 10, Yv(v) + 5, '10' + '⁰¹²³⁴'[v], DK, 14, 'end'); }
        wl(g, L(2), Yv(0) + 50, 'CD4 (FITC fluorescence)', DK, 16); lbr(g, L(0) - 50, Yv(2), 'CD8 (PE fluorescence)', DK, 16);
        wl(g, L(2), Yv(4) - 14, 'gated on CD3⁺ lymphocytes', '#555', 14);
        if (t) lb(g, 20, -190, t, TXT.blue, 20);
        return g;
      }
      const sx = -80, ip = -20;
      part(g, `M-125 -200 H-35 L${sx + 8} -128 H${sx - 8} Z`, '#e6f0fa', BLU, 2.5);
      still(g, `M${sx} -215 V-150`, VIO, 4); wl(g, -30, -185, 'sheath fluid', TXT.blue, 14, 'start'); wl(g, sx - 8, -220, 'sample (cells)', VIO, 14, 'end');
      fl(g, R(sx - 7, -128, 14, 300), '#e6f0fa'); still(g, `M${sx - 7} -128 V172 M${sx + 7} -128 V172`, BLU, 2);
      wl(g, -118, -112, 'hydrodynamic focusing:', '#555', 13, 'end'); wl(g, -118, -96, 'cells in single file', '#555', 13, 'end');
      for (const y of [-110, -75, -45, ip, 15, 50, 85, 120, 155]) part(g, C(sx, y, 5), y === ip ? '#5fae3a' : '#c9b3e6', DK, 1.5);
      part(g, rr(-252, ip - 13, 66, 26, 5), '#e04b3a', RED, 2); wl(g, -219, ip + 5, 'laser', '#fff', 14); wl(g, -219, ip - 20, '488 nm', TXT.red, 13);
      line(g, `M-186 ${ip} H${sx - 7}`, '#2b8fd6', 3);
      line(g, `M${sx + 7} ${ip} L45 ${ip - 14} M${sx + 7} ${ip} L45 ${ip + 14}`, '#2b8fd6', 2); part(g, R(28, ip - 5, 6, 10), DK, DK, 1.5);
      part(g, rr(48, ip - 26, 22, 52, 4), '#9aa3ad', DK, 2); wl(g, 59, ip - 34, 'FSC', DK, 15); wl(g, 78, ip + 5, 'forward scatter → size', DK, 13, 'start');
      line(g, `M${sx + 6} ${ip + 6} L-35 60 H225`, VIO, 2.5);
      const det = [[10, 'SSC', 'side scatter', '→ granularity', BLU], [95, 'FL1', 'green (FITC)', 'CD4', GRN], [180, 'FL2', 'orange (PE)', 'CD8', ORG]];
      for (const [x, n, a, b, c] of det) { still(g, `M${x - 12} 72 L${x + 12} 48`, DK, 4); line(g, `M${x} 62 V100`, c, 2.5); tip(g, x, 100, x, 90, c, 2.5);
        part(g, rr(x - 18, 104, 36, 26, 4), '#9aa3ad', DK, 2); wl(g, x, 122, n, '#fff', 13); wl(g, x, 148, a, DK, 13); wl(g, x, 164, b, '#555', 12); }
      wl(g, 100, 42, 'dichroic mirrors', '#555', 13); wl(g, sx - 12, 190, 'to waste', '#666', 13, 'end');
      wl(g, 100, 195, 'PMT signals → computer → dot plots', DK, 14);
      if (t) lb(g, 0, -235, t, TXT.blue, 20);
      return g;
    },
    // "vdj cx cy width |text"
    vdj: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p), VC = '#7fb7ea', DC = '#5fae3a', JC = '#f4a531', CC = '#b9c0c7';
      const seg = (x, w, y, fill, name, s = 12) => { part(g, R(x, y - 10, w, 20), fill, DK, 1.6); if (name) wl(g, x + w / 2, y + 4.5, name, DK, s); };
      const rss = (x, y, dir) => still(g, `M${x} ${y - 6} L${x + 6 * dir} ${y} L${x} ${y + 6} Z`, DK, 1.5);
      const y1 = -160; still(g, `M-262 ${y1} H255`, DK, 2);
      ['V1', 'V2', 'V3'].forEach((n, i) => { seg(-255 + i * 36, 26, y1, VC, n); rss(-227 + i * 36, y1, 1); });
      wl(g, -142, y1 + 5, '…', DK, 16); seg(-128, 26, y1, VC, 'Vn'); rss(-100, y1, 1);
      for (let i = 0; i < 4; i++) { rss(-78 + i * 20, y1, -1); seg(-76 + i * 20, 10, y1, DC); rss(-64 + i * 20, y1, 1); }
      for (let i = 0; i < 6; i++) { rss(4 + i * 16, y1, -1); seg(6 + i * 16, 9, y1, JC); }
      seg(120, 46, y1, CC, 'Cμ', 13); seg(174, 30, y1, CC, 'Cδ', 13); wl(g, 218, y1 + 5, '…', DK, 16);
      wl(g, -185, y1 - 18, 'V (~40)', TXT.blue, 14); wl(g, -48, y1 - 18, 'D (~23)', TXT.green, 14); wl(g, 50, y1 - 18, 'J (6)', TXT.orange, 14); wl(g, 165, y1 - 18, 'C', '#555', 14);
      wl(g, -262, y1 - 40, 'germline DNA (IgH locus)', DK, 15, 'start');
      arrow(g, -10, -142, -10, -98, DK, 2.5, true);
      wl(g, 2, -128, 'RAG1/RAG2 cut at RSSs (12/23 rule)', DK, 13, 'start'); wl(g, 2, -112, 'D–J, then V–DJ joining (NHEJ)', DK, 13, 'start');
      const y2 = -75; still(g, `M-262 ${y2} H100`, DK, 2);
      seg(-250, 26, y2, VC, 'V1'); seg(-160, 26, y2, VC, 'V2'); seg(-134, 12, y2, DC); seg(-122, 10, y2, JC);
      for (let i = 0; i < 4; i++) seg(-96 + i * 16, 9, y2, JC); seg(0, 46, y2, CC, 'Cμ', 13); seg(52, 30, y2, CC, 'Cδ', 13);
      still(g, `M-160 ${y2 + 14} v6 H-112 v-6`, VIO, 2); wl(g, -136, y2 + 34, 'VDJ exon', VIO, 13);
      wl(g, 110, y2 + 5, 'rearranged DNA in one B cell', DK, 13, 'start');
      arrow(g, -136, -36, -136, -6, DK, 2.5, true); wl(g, -124, -18, 'transcribe, splice, translate', '#555', 12, 'start');
      // antibody
      const band = (x1, y1b, x2, y2b, t0, c, w = 11) => { const a = [x1 + (x2 - x1) * t0, y1b + (y2b - y1b) * t0]; return [a, c, w]; };
      const chain = (x1, y1b, x2, y2b, f, cV, cC) => { const xm = x1 + (x2 - x1) * f, ym = y1b + (y2b - y1b) * f;
        still(g, `M${P(x1, y1b)} L${P(xm, ym)}`, cC, 11); still(g, `M${P(xm, ym)} L${P(x2, y2b)}`, cV, 11); };
      for (const s of [-1, 1]) { const bx = -140 + s * 10;
        still(g, `M${bx} 185 V110`, '#8a9098', 11); chain(bx, 110, bx + s * 48, 40, .55, BLU, '#8a9098'); chain(bx + s * 22, 118, bx + s * 66, 55, .5, ORG, CC); }
      wl(g, -140, 26, 'antigen-binding sites', DK, 13); wl(g, -118, 175, 'heavy chain: V(D)J + C', TXT.blue, 13, 'start');
      wl(g, -262, 120, 'light chain', TXT.orange, 13, 'start'); wl(g, -262, 136, '(VJ + C)', TXT.orange, 12, 'start');
      // clonal selection inset
      dash(g, rr(28, -42, 234, 238, 12), GRY, 2); wl(g, 145, -22, 'clonal selection', DK, 15);
      const cols = [BLU, GRN, RED, VIO];
      cols.forEach((c, i) => { const x = 60 + i * 56; part(g, C(x, 30, 15), '#eef2f6', DK, 2); ab(g, x - 7, 12, c, 1, .55); ab(g, x + 7, 12, c, 1, .55); });
      part(g, smoothC(Array.from({ length: 10 }, (_, i) => { const q = i % 2 ? 6 : 11, a = i * Math.PI / 5; return [172 + q * Math.cos(a), -6 + q * Math.sin(a)]; })), '#e04b3a', RED, 1.5);
      wl(g, 205, -2, 'antigen', TXT.red, 12, 'start');
      arrow(g, 172, 50, 172, 78, DK, 2.5, true); wl(g, 182, 68, 'proliferation', '#555', 12, 'start');
      for (let i = 0; i < 7; i++) { const x = 110 + (i % 4) * 30 + (i > 3 ? 15 : 0), y = 98 + (i > 3 ? 28 : 0); part(g, C(x, y, 11), '#eef2f6', DK, 1.5); ab(g, x, y - 12, RED, 1, .45); }
      wl(g, 145, 160, 'clonal expansion → plasma cells', DK, 12); wl(g, 145, 176, '(antibody) + memory B cells', DK, 12);
      if (t) lb(g, 0, -225, t, TXT.blue, 20);
      return g;
    },
    // "nernst cx cy width |text"
    nernst: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p);
      fl(g, R(-262, -190, 290, 78), '#eef6e8'); fl(g, R(-262, -88, 290, 72), '#e6f0fa');
      part(g, R(-262, -112, 290, 24), '#f3e3b8', '#b59a4a', 2);
      wl(g, -258, -175, 'outside', '#555', 14, 'start'); wl(g, -258, -24, 'inside', '#555', 14, 'start');
      const ion = (x, y, s, c) => lb(g, x, y, s, c, 16);
      const KC = VIO, NC = TXT.orange, CC = TXT.green;
      for (const [x, y] of [[-190, -160], [-110, -168], [-30, -150], [-150, -132]]) ion(x, y, 'Na⁺', NC);
      for (const [x, y] of [[-70, -170], [-220, -138], [0, -128]]) ion(x, y, 'Cl⁻', CC); ion(-80, -132, 'K⁺', KC);
      for (const [x, y] of [[-200, -60], [-130, -45], [-70, -62], [-10, -40], [-180, -30]]) ion(x, y, 'K⁺', KC);
      ion(-100, -28, 'Na⁺', NC); ion(-30, -66, 'Cl⁻', CC); ion(-240, -55, 'A⁻', '#666');
      part(g, R(-42, -116, 9, 32), '#c9b3e6', VIO, 1.5); part(g, R(-21, -116, 9, 32), '#c9b3e6', VIO, 1.5);
      line(g, 'M-27 -78 V-126', KC, 2.5); tip(g, -27, -126, -27, -116, KC, 2.5);
      lb(g, -258, -116, '+ + + + + + + + + +', TXT.red, 14, 'start'); lb(g, -258, -76, '− − − − − − − − − −', TXT.blue, 14, 'start');
      const rows = [['K⁺', 5, 140, 1, KC], ['Na⁺', 145, 12, 1, NC], ['Cl⁻', 110, 10, -1, CC]], cx2 = [62, 118, 168, 230];
      ['ion', 'out (mM)', 'in (mM)', 'E_{ion}'].forEach((h, i) => wl(g, cx2[i], -170, h, DK, 14));
      still(g, 'M42 -162 H262', DK, 1.5);
      rows.forEach(([n, a, b, z, c], i) => { const y = -140 + i * 28, e = 61.5 / z * Math.log10(a / b), es = (e < 0 ? '−' : '+') + Math.abs(e).toFixed(0) + ' mV';
        wl(g, cx2[0], y, n, c, 16); wl(g, cx2[1], y, '' + a, DK, 15); wl(g, cx2[2], y, '' + b, DK, 15); wl(g, cx2[3], y, es, c, 15); });
      wl(g, 152, -42, 'at 37 °C, mammalian neuron', '#666', 13);
      wl(g, -258, 10, 'Nernst equation (one ion at equilibrium):', DK, 15, 'start');
      wl(g, -230, 40, 'E_{ion} = (RT / zF) · ln([ion]_{o} / [ion]_{i})', TXT.blue, 19, 'start');
      wl(g, 60, 40, '≈ (61.5 mV / z) · log_{10}([ion]_{o} / [ion]_{i})', '#555', 14, 'start');
      wl(g, -258, 80, 'Goldman (GHK) equation (several permeant ions):', DK, 15, 'start');
      wl(g, -230, 126, 'V_{m} = (RT / F) · ln', TXT.blue, 19, 'start');
      wl(g, 90, 112, 'P_{K}[K⁺]_{o} + P_{Na}[Na⁺]_{o} + P_{Cl}[Cl⁻]_{i}', TXT.blue, 17); still(g, 'M-50 121 H230', TXT.blue, 2);
      wl(g, 90, 142, 'P_{K}[K⁺]_{i} + P_{Na}[Na⁺]_{i} + P_{Cl}[Cl⁻]_{o}', TXT.blue, 17);
      wl(g, 0, 182, 'resting V_{m} ≈ −70 mV  (P_{K} : P_{Na} : P_{Cl} ≈ 1 : 0.04 : 0.45), close to E_{K}', DK, 15);
      if (t) lb(g, 0, -208, t, TXT.blue, 20);
      return g;
    },
    // "channelgating cx cy width |text"
    channelgating: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p), xs = [-180, 0, 180];
      fl(g, R(-266, -35, 532, 70), '#f3e3b8'); still(g, 'M-266 -35 H266 M-266 35 H266', '#b59a4a', 2);
      wl(g, -262, -95, 'outside', '#555', 13, 'start'); wl(g, -262, 75, 'inside', '#555', 13, 'start');
      xs.forEach((x, i) => {
        part(g, rr(x - 46, -55, 30, 110, 10), '#7fb7ea', BLU, 2.5); part(g, rr(x + 16, -55, 30, 110, 10), '#7fb7ea', BLU, 2.5);
        const sy = i ? -32 : 32; lb(g, x - 31, sy + 6, '+', TXT.red, 20); lb(g, x + 31, sy + 6, '+', TXT.red, 20);
        if (i) still(g, `M${x - 16} -42 L${x - 16} -76`, DK, 6); else still(g, `M${x - 16} -42 L${x + 16} -42`, DK, 6);
        part(g, C(x - 16, -42, 4), DK, DK, 1.5);
        const ball = i === 2 ? [x, 50] : [x + 42, 96];
        still(g, `M${x + 30} 55 Q ${(x + 30 + ball[0]) / 2 + 12} ${i === 2 ? 90 : 85} ${ball[0]} ${ball[1] + 10}`, DK, 2.5);
        part(g, C(ball[0], ball[1], 10), '#e04b3a', RED, 2);
        for (const [dx, dy] of [[-40, -105], [30, -98]]) lb(g, x + dx, dy, 'Na⁺', TXT.orange, 15);
        if (i === 1) { line(g, `M${x} -95 V75`, ORG, 3.5); tip(g, x, 75, x, 65, ORG, 3.5); wl(g, x - 8, 92, 'Na⁺ in', TXT.orange, 14, 'end'); }
      });
      wl(g, -180, -62, 'activation gate', DK, 12); wl(g, -125, 101, 'inactivation gate', DK, 12, 'start'); wl(g, -125, 115, '(ball and chain)', '#666', 11, 'start');
      wl(g, -240, 38, 'S4 (+)', TXT.red, 12, 'end');
      const caps = [['closed (resting)', 'V_{m} ≈ −70 mV'], ['open (activated)', 'depolarized past ≈ −55 mV'], ['inactivated', '≈ +30 mV, ~1 ms later']];
      caps.forEach(([a, b], i) => { wl(g, xs[i], 132, a, DK, 16); wl(g, xs[i], 152, b, '#555', 14); });
      arrow(g, -118, -128, -62, -128, DK, 2.5); wl(g, -90, -138, 'depolarize', DK, 13);
      arrow(g, 62, -128, 118, -128, DK, 2.5); wl(g, 90, -138, '~1 ms', DK, 13);
      still(g, 'M180 168 Q 0 212 -172 170', DK, 2.5, { 'stroke-dasharray': '7 6' }); tip(g, -172, 170, -150, 178, DK, 2.5);
      wl(g, 0, 214, 'repolarize → recovery from inactivation (refractory period)', '#555', 13);
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "ltp cx cy width |text"
    ltp: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p);
      dash(g, 'M0 -230 V190', GRY, 2);
      const rec = (x, fill) => { part(g, rr(x - 12, -80, 9, 30, 3), fill, DK, 1.5); part(g, rr(x + 3, -80, 9, 30, 3), fill, DK, 1.5); };
      [-135, 135].forEach((dx, side) => {
        const after = side === 1;
        part(g, `M${dx - 90} -215 V-130 Q${dx - 90} -95 ${dx - 50} -95 H${dx + 50} Q${dx + 90} -95 ${dx + 90} -130 V-215`, '#e6f0fa', BLU, 2.5);
        for (const [x, y] of [[-50, -170], [-18, -190], [15, -165], [48, -185], [-5, -132]]) { part(g, C(dx + x, y, 10), '#fff', BLU, 1.5); still(g, `M${dx + x - 3} ${y} h.1 M${dx + x + 3} ${y + 2} h.1`, ORG, 4); }
        wl(g, dx, -200, 'presynaptic', TXT.blue, 13);
        let d = ''; for (const [x, y] of [[-60, -88], [-30, -84], [-5, -90], [25, -86], [55, -88], [70, -84]]) d += `M${dx + x} ${y} h.1 `; still(g, d, ORG, 5);
        part(g, `M${dx - 95} -65 H${dx + 95} Q${dx + 105} 30 ${dx + 25} 70 V120 H${dx - 25} V70 Q${dx - 105} 30 ${dx - 95} -65 Z`, '#fde9cf', '#b5722a', 2.5);
        const ampa = after ? [-75, -40, -5] : [-40]; ampa.forEach(x => rec(dx + x, '#7fb7ea')); rec(dx + 50, '#c9b3e6');
        wl(g, dx - 40, -36, 'AMPA', TXT.blue, 13); wl(g, dx + 50, -36, 'NMDA', VIO, 13);
        line(g, `M${dx - 40} -100 V-48`, ORG, 2.5); tip(g, dx - 40, -48, dx - 40, -58, ORG, 2.5); if (!after) wl(g, dx - 60, -54, 'Na⁺', TXT.orange, 12, 'end');
        if (!after) { part(g, C(dx + 50, -66, 6), '#9aa3ad', DK, 1.5); wl(g, dx + 50, -18, 'Mg²⁺ blocks', '#555', 12);
          wl(g, dx, 10, 'resting ≈ −70 mV', '#555', 13);
          wl(g, dx, -244, 'before: basal transmission', DK, 16); wl(g, dx, 150, 'glutamate opens AMPA only', DK, 13); wl(g, dx, 167, 'small EPSP', '#555', 13); }
        else { part(g, C(dx + 76, -80, 6), '#9aa3ad', DK, 1.5); arrow(g, dx + 56, -72, dx + 68, -78, GRY, 2);
          line(g, `M${dx + 50} -60 V-8`, RED, 3); tip(g, dx + 50, -8, dx + 50, -18, RED, 3); wl(g, dx + 62, -16, 'Ca²⁺', TXT.red, 14, 'start');
          prot(g, dx + 40, 12, 28, 12, '#f6c1b8', 'CaMKII', 12); phos(g, dx + 72, 4, 7);
          part(g, C(dx - 30, 40, 15), '#fff', BLU, 2); rec(dx - 30, '#7fb7ea');
          still(g, `M${dx + 12} 18 Q${dx} 40 ${dx - 12} 40`, RED, 2.5); tip(g, dx - 12, 40, dx - 4, 34, RED, 2.5);
          arrow(g, dx - 30, 24, dx - 30, -4, BLU, 2.5, true);
          wl(g, dx, -244, 'after LTP (high-frequency stimulation)', DK, 16); wl(g, dx, 150, 'depolarization removes Mg²⁺, Ca²⁺ in', DK, 13);
          wl(g, dx, 167, '→ CaMKII → more AMPA receptors: larger EPSP', '#555', 13); }
        wl(g, dx, 136, 'postsynaptic spine', '#b5722a', 13); });
      wl(g, 0, 190, 'orange dots = glutamate', TXT.orange, 13);
      if (t) lb(g, 0, -266, t, TXT.blue, 20);
      return g;
    },
    // "morphogen cx cy width |text"
    morphogen: ([cx, cy, W = 480], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), X = u => -200 + u * 400, Y = c => 40 - 180 * c, lam = .3, T1 = .5, T2 = .15;
      const u1 = -lam * Math.log(T1), u2 = -lam * Math.log(T2), f = x => Y(Math.exp(-((x + 200) / 400) / lam));
      fl(g, curve(f, -200, 200) + ' L200 40 L-200 40 Z', '#e6f0fa');
      still(g, 'M-200 -160 V40 H215', DK, 3); tip(g, -200, -160, -200, -150, DK, 3); tip(g, 215, 40, 205, 40, DK, 3);
      line(g, curve(f, -200, 200), BLU, 4);
      dash(g, `M-200 ${Y(T1)} H200`, RED, 2); dash(g, `M-200 ${Y(T2)} H200`, ORG, 2);
      wl(g, -208, Y(T1) + 5, 'T₁', TXT.red, 17, 'end'); wl(g, -208, Y(T2) + 5, 'T₂', TXT.orange, 17, 'end');
      dash(g, `M${X(u1)} ${Y(T1)} V104 M${X(u2)} ${Y(T2)} V104`, GRY, 2);
      const n = 16, cw = 400 / n;
      for (let i = 0; i < n; i++) { const u = (i + .5) / n, fill = u < u1 ? '#3f78d0' : u < u2 ? '#ffffff' : '#e04b3a';
        part(g, rr(-200 + i * cw + 1, 62, cw - 2, 40, 5), fill, DK, 1.5); still(g, C(-200 + (i + .5) * cw, 82, 4), DK, 1.5); }
      const reg = (a, b, l1, l2, c) => { wl(g, (X(a) + X(b)) / 2, 126, l1, c, 15); wl(g, (X(a) + X(b)) / 2, 144, l2, '#555', 13); };
      reg(0, u1, 'fate 1', '(C > T₁)', TXT.blue); reg(u1, u2, 'fate 2', '(T₂ < C < T₁)', DK); reg(u2, 1, 'fate 3', '(C < T₂)', TXT.red);
      part(g, C(-224, 82, 12), '#f4a531', ORG, 2); wl(g, -224, 110, 'source', TXT.orange, 13);
      wl(g, -192, -160, 'morphogen concentration C', DK, 15, 'start'); wl(g, 0, 166, 'position x (anterior → posterior)', DK, 15);
      wl(g, 40, -100, 'C(x) = C₀ e^{−x/λ}', TXT.blue, 19, 'start');
      wl(g, 0, 190, 'e.g. Bicoid gradient in the early Drosophila embryo ("French flag")', '#555', 14);
      if (t) lb(g, 0, -190, t, TXT.blue, 20);
      return g;
    },
    // "allosteric cx cy width |text"
    allosteric: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p);
      const enz = (x, y, act) => { const e = mk('g', { transform: `translate(${x} ${y})` }, g);
        const d = act ? 'M-60 0 C -60 -40, -40 -45, -18 -45 L -18 -25 L 18 -25 L 18 -45 C 40 -45, 60 -40, 60 0 C 60 35, 35 45, 16 45 A 16 16 0 0 0 -16 45 C -35 45, -60 35, -60 0 Z'
          : 'M-55 5 C -58 -38, -35 -48, -10 -45 L 0 -30 L 10 -45 C 35 -48, 58 -38, 55 5 C 52 38, 32 47, 16 47 A 16 16 0 0 0 -16 47 C -32 47, -52 38, -55 5 Z';
        part(e, d, act ? '#9cc3e6' : '#c9ced6', act ? BLU : GRY, 2.5); return e; };
      const a = enz(-150, -95, 1); part(a, rr(-15, -50, 30, 26, 4), '#f4a531', ORG, 2); lb(a, 0, -32, 'S', '#fff', 15);
      part(a, C(0, 44, 13), '#5fae3a', GRN, 2); lb(a, 0, 49, 'A', '#fff', 14);
      wl(g, -80, -125, 'active site', DK, 14, 'start'); still(g, 'M-82 -129 L-128 -128', GRY, 1.5);
      wl(g, -80, -40, 'allosteric site', DK, 14, 'start'); still(g, 'M-82 -44 L-136 -52', GRY, 1.5);
      wl(g, -150, -10, 'activator bound → active form', TXT.green, 15);
      const b = enz(-150, 95, 0); part(b, rr(-15, -90, 30, 26, 4), '#f4a531', ORG, 2); lb(b, 0, -72, 'S', '#fff', 15);
      still(b, 'M24 -88 L40 -68 M40 -88 L24 -68', RED, 3); part(b, C(0, 46, 13), '#e04b3a', RED, 2); lb(b, 0, 51, 'I', '#fff', 14);
      wl(g, -150, 185, 'inhibitor bound → inactive form', TXT.red, 15); wl(g, -80, 50, 'active site closed', '#666', 13, 'start');
      const x0 = 25, y0 = 80, X = s => x0 + s * 22, Y = v => y0 - 220 * v, hill = (K, n) => x => { const s = (x - x0) / 22; return Y(s ** n / (K ** n + s ** n)); };
      axes(g, x0, y0, 260, -155, '[S]', 'v');
      dash(g, `M${x0} ${Y(1)} H250`, GRY, 1.5); wl(g, x0 - 6, Y(1) + 5, 'Vmax', '#555', 13, 'end');
      line(g, curve(x => Y(((x - x0) / 22) / (1.5 + (x - x0) / 22)), x0, 245), BLU, 3);
      line(g, curve(hill(4, 3), x0, 245), VIO, 3.5);
      still(g, curve(hill(2.3, 3), x0, 245), GRN, 2.5, { 'stroke-dasharray': '8 6' }); still(g, curve(hill(6.5, 3), x0, 245), RED, 2.5, { 'stroke-dasharray': '8 6' });
      [['hyperbolic (Michaelis–Menten)', BLU, TXT.blue], ['sigmoidal (allosteric, cooperative)', VIO, VIO], ['+ activator: shifts left', GRN, TXT.green], ['+ inhibitor: shifts right', RED, TXT.red]]
        .forEach(([n, c, tc], i) => { still(g, `M30 ${112 + i * 19} h18`, c, 3); wl(g, 54, 117 + i * 19, n, tc, 14, 'start'); });
      if (t) lb(g, 0, -185, t, TXT.blue, 20);
      return g;
    },
    // "metabolicmap cx cy width |text"
    metabolicmap: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p);
      fl(g, rr(-125, -12, 387, 210, 24), '#fdf0e6'); dash(g, rr(-125, -12, 387, 210, 24), ORG, 2); wl(g, -115, 188, 'mitochondrion', TXT.orange, 14, 'start');
      wl(g, -258, -205, 'cytosol', '#666', 14, 'start');
      arrow(g, 0, -170, 0, -150, DK, 2.5, true); arrow(g, 0, -120, 0, -60, DK, 3, true);
      wl(g, 14, -96, 'glycolysis', DK, 15, 'start'); wl(g, 14, -78, '→ 2 ATP, 2 NADH', '#555', 13, 'start');
      still(g, 'M-38 -50 Q -78 -115 -45 -180', RED, 2.5, { 'stroke-dasharray': '7 6' }); tip(g, -45, -180, -55, -165, RED, 2.5);
      wl(g, -70, -75, 'gluconeogenesis', TXT.red, 14, 'end'); wl(g, -70, -59, '(via OAA, PEP)', TXT.red, 12, 'end');
      arrow(g, -32, -135, -118, -135, VIO, 2.5, true);
      arrow(g, 0, -30, 0, 5, DK, 3, true); wl(g, 10, -8, 'PDH (− CO₂)', '#555', 13, 'start');
      arrow(g, 0, 35, 0, 54, DK, 3, true);
      for (const [a1, a2] of [[-80, 10], [20, 110], [120, 190], [200, 260]]) { const r = 40, q = d => [r * Math.cos(d * Math.PI / 180), 100 + r * Math.sin(d * Math.PI / 180)];
        const [x1, y1] = q(a1), [x2, y2] = q(a2), [ax, ay] = q(a2 - 5); still(g, `M${P(x1, y1)} A${r} ${r} 0 0 1 ${P(x2, y2)}`, GRN, 3); tip(g, x2, y2, ax, ay, GRN, 3); }
      wl(g, 0, 97, 'citric acid', TXT.green, 13); wl(g, 0, 112, 'cycle', TXT.green, 13);
      arrow(g, 45, 100, 118, 100, BLU, 3, true); wl(g, 78, 86, 'NADH, FADH₂', TXT.blue, 12);
      arrow(g, 175, 115, 175, 140, GRN, 3, true); wl(g, 175, 160, 'ATP', TXT.green, 20); wl(g, 175, 178, 'O₂ → H₂O', '#555', 12);
      arrow(g, 175, -170, 175, 10, DK, 2.5, true); wl(g, 185, -60, 'fatty acyl-CoA', '#555', 12, 'start');
      arrow(g, 128, 25, 52, 22, DK, 2.5, true); arrow(g, 175, 40, 175, 85, BLU, 2.5, true);
      arrow(g, -140, -45, -50, -45, DK, 2.5, true); arrow(g, -165, -28, -45, 82, DK, 2.5, true); wl(g, -98, 52, 'α-KG, OAA', '#555', 12, 'end');
      arrow(g, -195, -28, -195, 62, VIO, 2.5, true); wl(g, -205, 20, 'NH₄⁺', VIO, 13, 'end');
      for (const [a1, a2] of [[-60, 100], [120, 280]]) { const r = 24, q = d => [-195 + r * Math.cos(d * Math.PI / 180), 90 + r * Math.sin(d * Math.PI / 180)];
        const [x1, y1] = q(a1), [x2, y2] = q(a2), [ax, ay] = q(a2 - 8); still(g, `M${P(x1, y1)} A${r} ${r} 0 0 1 ${P(x2, y2)}`, VIO, 2.5); tip(g, x2, y2, ax, ay, VIO, 2.5); }
      wl(g, -195, 88, 'urea', VIO, 11); wl(g, -195, 100, 'cycle', VIO, 11);
      arrow(g, -195, 116, -195, 140, VIO, 2.5, true); wl(g, -195, 158, 'urea (liver)', VIO, 14);
      pill(g, 0, -185, 'glucose', '#ffe7b0'); pill(g, 0, -135, 'glucose-6-P'); pill(g, 0, -45, 'pyruvate', '#f6c4b4'); pill(g, 0, 20, 'acetyl-CoA', '#ffe39a');
      pill(g, -188, -135, 'pentose phosphate', '#e6dcf5', VIO); wl(g, -188, -108, 'NADPH, ribose-5-P', VIO, 12);
      pill(g, 175, -185, 'fatty acids', '#e6f0fa'); pill(g, 175, 25, 'β-oxidation', '#e6f0fa', BLU); pill(g, 175, 100, 'ETC + ATP synthase', '#d8e8f8', BLU, 13);
      pill(g, -195, -45, 'amino acids', '#e3f1da', GRN);
      if (t) lb(g, 0, -228, t, TXT.blue, 20);
      return g;
    },
    // "geneticdrift cx cy width |text"
    geneticdrift: ([cx, cy, W = 520], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), GEN = 100, COLS = [BLU, RED, GRN, ORG, VIO, '#1a9a9a'];
      const sim = (N, seed) => { const r = rnd(seed); return COLS.map(() => { let q = .5; const a = [q];
        for (let i = 0; i < GEN; i++) { let k = 0; for (let j = 0; j < 2 * N; j++) if (r() < q) k++; q = k / (2 * N); a.push(q); } return a; }); };
      // pick a seed whose small-population run shows both fixation and loss
      let seed = 1, small; for (; ; seed++) { small = sim(10, seed); const ends = small.map(a => a[GEN]);
        if (ends.filter(v => v === 1).length >= 2 && ends.filter(v => v === 0).length >= 2) break; }
      const large = sim(2000, 7);
      [[-215, small, 'small population (N = 10)'], [30, large, 'large population (N = 2000)']].forEach(([x0, runs, name], k) => {
        const w = 195, X = i => x0 + i / GEN * w, Y = q => 90 - q * 200;
        still(g, `M${x0} -110 V90 H${x0 + w}`, DK, 2.5); dash(g, `M${x0} -110 H${x0 + w}`, GRY, 1.5);
        runs.forEach((a, i) => still(g, pts(a.map((q, j) => [X(j), Y(q)])), COLS[i], 2.2));
        for (const q of [0, .5, 1]) lb(g, x0 - 6, Y(q) + 5, '' + q, DK, 13, 'end');
        for (const i of [0, 50, 100]) lb(g, X(i), 108, '' + i, DK, 13);
        wl(g, x0 + w / 2, 128, 'generation', DK, 14); wl(g, x0 + w / 2, -128, name, DK, 16);
        if (!k) { wl(g, x0 + w - 3, -114, 'fixed', TXT.red, 12, 'end'); wl(g, x0 + w - 3, 84, 'lost', TXT.red, 12, 'end'); } });
      lbr(g, -248, -10, 'allele frequency p', DK, 15);
      wl(g, 0, 165, 'drift is strongest when N is small: Var(Δp) = p(1 − p) / 2N', DK, 15);
      if (t) lb(g, 0, -165, t, TXT.blue, 20);
      return g;
    },
    // "lotkavolterra cx cy width k=time|phase |text"
    lotkavolterra: ([cx, cy, W = 480], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), al = 1, be = .1, ga = 1.5, de = .075;
      const run = (N, Pp, T, dt = .01) => { const out = [[N, Pp]]; const f = (n, q) => [al * n - be * n * q, de * n * q - ga * q];
        for (let i = 0; i < T / dt; i++) { const k1 = f(N, Pp), k2 = f(N + dt / 2 * k1[0], Pp + dt / 2 * k1[1]), k3 = f(N + dt / 2 * k2[0], Pp + dt / 2 * k2[1]), k4 = f(N + dt * k3[0], Pp + dt * k3[1]);
          N += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); Pp += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); out.push([N, Pp]); } return out; };
      wl(g, -110, -170, 'dN/dt = αN − βNP', DK, 16); wl(g, 110, -170, 'dP/dt = δNP − γP', DK, 16);
      if (o.k === 'phase') {
        const o1 = run(10, 5, 9), o2 = run(15, 7, 9), mx = Math.max(...o1.map(v => v[0])) * 1.08, my = Math.max(...o1.map(v => v[1])) * 1.12;
        const X = n => -160 + n / mx * 340, Y = q => 120 - q / my * 260;
        axes(g, -160, 120, 195, -150, 'prey N', 'predator P');
        dash(g, `M${X(ga / de)} 120 V-140`, GRY, 1.5); dash(g, `M-160 ${Y(al / be)} H190`, GRY, 1.5);
        wl(g, X(ga / de) + 5, -128, 'dP/dt = 0', '#666', 13, 'start'); wl(g, 188, Y(al / be) - 6, 'dN/dt = 0', '#666', 13, 'end');
        for (const [orb, c] of [[o1, BLU], [o2, VIO]]) { line(g, pts(orb.filter((_, i) => i % 5 === 0).map(([n, q]) => [X(n), Y(q)])), c, 3);
          for (const i of [80, 300, 520]) { const [a, b] = orb[i], [a2, b2] = orb[i + 8]; tip(g, X(a2), Y(b2), X(a), Y(b), c, 3); } }
        part(g, C(X(ga / de), Y(al / be), 5), RED, RED, 2); wl(g, X(ga / de) + 10, Y(al / be) + 20, '(γ/δ, α/β)', TXT.red, 14, 'start');
        wl(g, 20, 160, 'closed orbits: neutral cycles around the equilibrium', '#555', 14);
      } else {
        const T = 25, run1 = run(10, 5, T), mx = Math.max(...run1.map(v => Math.max(v[0], v[1]))) * 1.1, n = run1.length;
        const X = i => -200 + i / (n - 1) * 410, Y = v => 120 - v / mx * 260;
        axes(g, -200, 120, 220, -150, 'time', 'population');
        line(g, pts(run1.filter((_, i) => i % 5 === 0).map(([a], i) => [X(i * 5), Y(a)])), BLU, 3.5);
        line(g, pts(run1.filter((_, i) => i % 5 === 0).map(([, b], i) => [X(i * 5), Y(b)])), RED, 3.5);
        let ip = 0, iq = 0; for (let i = 1; i < n / 3; i++) { if (run1[i][0] > run1[ip][0]) ip = i; if (run1[i][1] > run1[iq][1]) iq = i; }
        wl(g, X(ip) + 10, Y(run1[ip][0]) + 4, 'prey N', TXT.blue, 16, 'start'); wl(g, X(iq) + 10, Y(run1[iq][1]) - 6, 'predator P', TXT.red, 16, 'start');
        dash(g, `M${X(ip)} ${Y(run1[ip][0])} V120 M${X(iq)} ${Y(run1[iq][1])} V120`, GRY, 1.5);
        wl(g, 10, 160, 'predator peaks lag prey peaks by about a quarter cycle', '#555', 14);
      }
      if (t) lb(g, 0, -200, t, TXT.blue, 20);
      return g;
    },
    // "quorum cx cy width |text"
    quorum: ([cx, cy, W = 540], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 540, 0, p);
      const cell = (x, y, rot, glow) => { const e = mk('g', { transform: `translate(${x} ${y}) rotate(${rot})` }, g);
        if (glow) fl(e, E(0, 0, 30, 18), '#fff1a8'); part(e, rr(-18, -8, 36, 16, 8), glow ? '#ffd84a' : '#cfd8e3', DK, 2); };
      const dots = (x0, n, r) => { let d = ''; for (let i = 0; i < n; i++) d += `M${(x0 - 115 + r() * 230).toFixed(1)} ${(-128 + r() * 236).toFixed(1)} h.1 `; still(g, d, RED, 5); };
      [[-135, 0], [135, 1]].forEach(([x0, hi]) => { const r = rnd(hi ? 31 : 17);
        part(g, rr(x0 - 125, -140, 250, 260, 14), hi ? '#fbfaf0' : '#f7fbff', GRY, 2);
        if (!hi) { for (const [x, y, a] of [[-60, -60, 20], [40, 10, -35], [-30, 70, 70]]) cell(x0 + x, y, a, 0); dots(x0, 12, r); }
        else { const pos = []; while (pos.length < 15) { const x = x0 - 95 + r() * 190, y = -112 + r() * 205; if (pos.every(([a, b]) => Math.hypot(a - x, b - y) > 46)) pos.push([x, y]); }
          dots(x0, 70, r); pos.forEach(([x, y]) => cell(x, y, r() * 180, 1)); } });
      wl(g, -135, 145, 'low cell density', DK, 16); wl(g, -135, 164, 'autoinducer below threshold', '#555', 13); wl(g, -135, 181, 'lux genes off: no light', '#555', 13);
      wl(g, 135, 145, 'high cell density', DK, 16); wl(g, 135, 164, 'autoinducer above threshold', '#555', 13); wl(g, 135, 181, 'LuxR–AHL turns on luxCDABE: light', TXT.orange, 13);
      still(g, 'M-110 -160 h.1', RED, 6); wl(g, -100, -155, 'autoinducer (AHL), made by LuxI, diffuses across membranes', DK, 14, 'start');
      if (t) lb(g, 0, -190, t, TXT.blue, 20);
      return g;
    },
    // "qpcrcurve cx cy width |text"
    qpcrcurve: ([cx, cy, W = 500], o, t, p) => { LABS = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), X = c => -200 + c * 10.5, Y = F => 110 - F * 220, s = 1.55, T = .15, b = .02;
      const S = [[20, 1, BLU, '10⁶'], [23.3, .97, GRN, '10⁵'], [26.6, .94, ORG, '10⁴'], [29.9, .9, RED, '10³']];
      axes(g, -200, 110, 228, -140, '', 'fluorescence (ΔRn)');
      for (const c of [0, 10, 20, 30, 40]) { still(g, `M${X(c)} 110 v6`, DK, 2); lb(g, X(c), 132, '' + c, DK, 14); }
      wl(g, 10, 172, 'cycle number', DK, 16);
      dash(g, `M-200 ${Y(T)} H220`, RED, 2); wl(g, 222, Y(T) - 6, 'threshold', TXT.red, 14, 'end');
      still(g, curve(x => Y(b + .005 * (x + 200) / 420), X(1), X(40)), GRY, 2.5); wl(g, 222, Y(.03) - 6, 'NTC', '#666', 13, 'end');
      wl(g, -48, 152, 'Ct:', DK, 14, 'end');
      S.forEach(([ch, fm, c, lab], i) => { const F = x => b + fm / (1 + Math.exp(-((x + 200) / 10.5 - ch) / s)), ct = ch + s * Math.log((T - b) / (fm - (T - b)));
        line(g, curve(x => Y(F(x)), X(1), X(40)), c, 3.2);
        dash(g, `M${X(ct)} ${Y(T)} V110`, c, 1.5); wl(g, X(ct), 152, ct.toFixed(1), c, 13);
        still(g, `M-190 ${-88 + i * 20} h16`, c, 3.2); wl(g, -168, -83 + i * 20, lab + ' copies', c, 14, 'start'); });
      wl(g, -190, -110, 'starting template:', DK, 14, 'start');
      wl(g, X(9), Y(b) - 10, 'baseline', '#555', 14); wl(g, X(19), Y(.45), 'exponential phase', DK, 14, 'end'); wl(g, X(36), Y(1) - 14, 'plateau', DK, 14);
      wl(g, 10, 195, 'ΔCt ≈ 3.3 cycles per 10-fold dilution (100% efficiency)', '#555', 14);
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
  });
})();
