// Whiteboard library — chemuni: high-school, AP and university chemistry diagrams (19 Oct 2026).
// Electron configuration, bonding and shapes, MO and crystal-field diagrams, phase and energy diagrams, gas laws,
// kinetics, equilibrium, acid–base, electrochemistry, thermochemistry, spectroscopy and organic mechanisms.
// Catalogue: chemuni.txt. Same helpers and look as physuni.js. Molecule structures themselves live elsewhere.
(() => {
  const DK = '#33363b', RED = '#c0392b', BLU = '#2b6cc4', GRN = '#2c6a22', VIO = '#7a4ab0', ORG = '#c97a10', GRY = '#8a9098', GLE = '#4f93d6';
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
  const dash = (g, d, c = GRY, w = 2) => still(g, d, c, w, { 'stroke-dasharray': '6 7' });
  // the hand fonts lack superscript glyphs (⁺ ⁻ ⁶ …): any run of them is drawn as raised small text instead
  const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻', PLAIN = '0123456789+−';
  const lb = (g, x, y, t, c = TXT.blue, s = 18, a = 'middle') => /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/.test(t)
    ? lbsup(g, x, y, t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, m => '^' + [...m].map(ch => PLAIN[SUPS.indexOf(ch)]).join('')), c, s, a) : label(g, x, y, t, c, s, a);
  let SHOW = true; const showLab = o => o.lab !== '0' && o.labels !== '0', lbw = (...a) => SHOW ? lb(...a) : null;   // lab=0 / labels=0 hide the words
  const curve = (f, x0, x1, n = 160) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? ' L' : 'M') + P(x, f(x)); } return d; };
  const pts = a => 'M' + a.map(p => P(p[0], p[1])).join(' L');
  const axes = (g, x0, y0, x1, y1, xl, yl) => { still(g, `M${x0} ${y1} V${y0} H${x1}`, DK, 3); tip(g, x0, y1, x0, y1 + 10, DK, 3); tip(g, x1, y0, x1 - 10, y0, DK, 3);
    if (xl) lbw(g, x1, y0 + 26, xl, DK, 17, 'end'); if (yl) lbw(g, x0 + 8, y1 + 4, yl, DK, 17, 'start'); };
  // chemistry extras
  const SUP = s => String(s).replace(/[0-9+−-]/g, c => ({ '+': '⁺', '-': '⁻', '−': '⁻' })[c] || '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
  // "1s^2 2s^2" → label with raised small numbers
  const lbsup = (g, x, y, txt, c, s, a = 'middle') => { const e = lb(g, x, y, '', c, s, a);
    txt.split(/(\^[0-9+−]+)/).forEach(part => { if (!part) return; const sp = mk('tspan', part[0] === '^' ? { 'font-size': s * .62, dy: -s * .38 } : { dy: 0 }, e);
      if (part[0] !== '^' && e.lastSup) sp.setAttribute('dy', s * .38); e.lastSup = part[0] === '^'; sp.textContent = part[0] === '^' ? part.slice(1) : part; }); return e; };
  const dot = (g, x, y, c = DK) => still(g, C(x, y, 1.6), c, 4);
  const harrow = (g, x, y, h, up, c = BLU) => { const a = up ? y + h / 2 : y - h / 2, b = up ? y - h / 2 : y + h / 2; still(g, `M${P(x, a)} L${P(x, b)}`, c, 2.2); still(g, head(x, b, x, a, 6), c, 2.2); };
  // an orbital box with 0, 1 or 2 electrons (up, then down: Pauli)
  const obox = (g, x, y, w, n, c = BLU) => { part(g, R(x, y - w / 2, w, w), '#fff', DK, 2); const h = w * .66;
    if (n === 1) harrow(g, x + w / 2, y, h, true, c); if (n === 2) { harrow(g, x + w * .32, y, h, true, c); harrow(g, x + w * .68, y, h, false, c); } };
  // electrons spread Hund-style over m boxes: singles first, then pairs
  const hund = (n, m) => Array.from({ length: m }, (_, i) => (i < Math.min(n, m) ? 1 : 0) + (i < n - m ? 1 : 0));
  const curly = (g, x1, y1, cx1, cy1, cx2, cy2, x2, y2, c = RED) => { line(g, `M${P(x1, y1)} C${P(cx1, cy1)} ${P(cx2, cy2)} ${P(x2, y2)}`, c, 2.5); tip(g, x2, y2, cx2, cy2, c, 2.2); };
  const wedge = (g, x1, y1, x2, y2, c = DK) => { const L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L * 6, ny = (x2 - x1) / L * 6;
    part(g, `M${P(x1, y1)} L${P(x2 + nx, y2 + ny)} L${P(x2 - nx, y2 - ny)} Z`, c, c, 1.5); };
  const hash = (g, x1, y1, x2, y2, c = DK) => { const L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L, ny = (x2 - x1) / L; let d = '';
    for (let i = 1; i <= 6; i++) { const s = i / 6.4, w = 1 + 6 * s, x = x1 + (x2 - x1) * s, y = y1 + (y2 - y1) * s; d += `M${P(x + nx * w, y + ny * w)} L${P(x - nx * w, y - ny * w)} `; }
    still(g, d, c, 2); };
  const bondTo = (g, x1, y1, x2, y2, kind, c = DK, w = 3) => kind === 'w' ? wedge(g, x1, y1, x2, y2, c) : kind === 'd' ? hash(g, x1, y1, x2, y2, c) : still(g, `M${P(x1, y1)} L${P(x2, y2)}`, c, w);

  const ELS = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr'.split(' ');
  const SUBS = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6]];
  const config = Z => { let left = Z; const e = SUBS.map(([, cap]) => { const n = Math.min(cap, left); left -= n; return n; });
    if (Z === 24 || Z === 29) { e[5] = 1; e[6] += 1; } return e; };          // Cr 4s¹3d⁵, Cu 4s¹3d¹⁰

  // a simple stick structure: atoms [sym, x, y], bonds [i, j, order]; labelled atoms shorten their bonds
  const struct = (g, atoms, bonds, s = 20, c = DK) => {
    for (const [i, j, ord] of bonds) { const [a, b] = [atoms[i], atoms[j]], L = Math.hypot(b[1] - a[1], b[2] - a[2]), ux = (b[1] - a[1]) / L, uy = (b[2] - a[2]) / L;
      const ca = a[0] ? s * .55 + (a[0].length > 1 && Math.abs(ux) > .5 ? s * .35 : 0) : 0, cb = b[0] ? s * .55 + (b[0].length > 1 && Math.abs(ux) > .5 ? s * .35 : 0) : 0;
      const x1 = a[1] + ux * ca, y1 = a[2] + uy * ca, x2 = b[1] - ux * cb, y2 = b[2] - uy * cb;
      const offs = ord === 3 ? [-5, 0, 5] : ord === 2 ? [-3.2, 3.2] : [0];
      for (const k of offs) still(g, `M${P(x1 - uy * k, y1 + ux * k)} L${P(x2 - uy * k, y2 + ux * k)}`, c, 2.4); }
    for (const [sym, x, y] of atoms) if (sym) lb(g, x, y + s * .35, sym, c, s); };

  Object.assign(window.RECIPES, {
    // "econfig cx cy width el=O |text"
    econfig: ([cx, cy, W = 480], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), sym = ELS.find(s => s.toLowerCase() === String(o.el || 'O').toLowerCase()) || 'O', Z = ELS.indexOf(sym) + 1;
      const e = config(Z), last = e.reduce((m, n, i) => n ? i : m, 0), bw = 40, gap = 16;
      const rows = [[0, 1, 2, 3, 4].filter(i => i <= last), [5, 6, 7].filter(i => i <= last)].filter(r => r.length);
      rows.forEach((row, ri) => {
        const y = rows.length === 1 ? -20 : ri ? 40 : -60, wid = row.reduce((s, i) => s + SUBS[i][1] / 2 * bw, 0) + gap * (row.length - 1);
        let x = -wid / 2;
        for (const i of row) { const m = SUBS[i][1] / 2, occ = hund(e[i], m);
          occ.forEach((n, b) => obox(g, x + b * bw, y, bw, n)); lb(g, x + m * bw / 2, y + 44, SUBS[i][0], DK, 19); x += m * bw + gap; }
      });
      const full = SUBS.map(([s], i) => e[i] ? s + '^' + e[i] : '').filter(Boolean).join(' ');
      const core = Z > 18 ? [18, '[Ar]'] : Z > 10 ? [10, '[Ne]'] : Z > 2 ? [2, '[He]'] : null;
      const nCore = core && SUBS.findIndex((_, i) => e.slice(0, i + 1).reduce((s, n) => s + n, 0) >= core[0]);
      const short = core && core[1] + ' ' + SUBS.map(([s], i) => i > nCore && e[i] ? s + '^' + e[i] : '').filter(Boolean).join(' ');
      if (SHOW) lbsup(g, 0, rows.length === 1 ? 70 : 125, full, TXT.blue, Z > 20 ? 21 : 24); if (short && SHOW) lbsup(g, 0, rows.length === 1 ? 98 : 153, short, TXT.green, 22);
      lbw(g, 0, rows.length === 1 ? -75 : -115, `${sym}  (Z = ${Z})`, DK, 26);
      if (Z === 24 || Z === 29) lbw(g, 0, 180, `exception: ${Z === 24 ? 'half-filled' : 'filled'} 3d is extra stable`, TXT.red, 15);
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "trends cx cy width k=radius|ionization|electronegativity|all |text"
    trends: ([cx, cy, W = 460], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 460, 0, p), k = o.k || 'all', c = 20, x0 = -180, y0 = -70;
      const has = (r, j) => j === 0 || j === 17 || (r >= 1 && (j === 1 || j >= 12)) || (r >= 3);
      const col = { radius: '#5b86c8', ionization: '#e04b3a', electronegativity: '#5fae3a' }[k];
      let grid = '';
      for (let r = 0; r < 7; r++) for (let j = 0; j < 18; j++) if (has(r, j)) {
        const v = (j / 17 + (6 - r) / 6) / 2, sh = k === 'radius' ? 1 - v : v;
        if (col && !(k === 'electronegativity' && j === 17)) fl(g, R(x0 + j * c, y0 + r * c, c, c), col, { opacity: (.1 + .8 * sh).toFixed(2) });
        else fl(g, R(x0 + j * c, y0 + r * c, c, c), '#eef0f2');
        grid += R(x0 + j * c, y0 + r * c, c, c) + ' '; }
      still(g, grid, '#6b7178', 1.3);
      const across = (dir, colr, txt, y) => { const a = dir > 0 ? [x0, x0 + 360] : [x0 + 360, x0]; arrow(g, a[0], y, a[1], y, colr, 3.5); lbw(g, 0, y - 10, txt, colr, 16); };
      const down = (dir, colr, x) => { const a = dir > 0 ? [y0, y0 + 140] : [y0 + 140, y0]; arrow(g, x, a[0], x, a[1], colr, 3.5); };
      if (k === 'all') {
        across(1, RED, 'ionization energy & electronegativity increase', y0 - 18); down(-1, RED, x0 + 380);
        across(-1, BLU, 'atomic radius increases', y0 + 165); down(1, BLU, x0 - 20);
      } else {
        const up = k !== 'radius', colr = { radius: BLU, ionization: RED, electronegativity: GRN }[k], nm = { radius: 'atomic radius', ionization: 'ionization energy', electronegativity: 'electronegativity' }[k];
        across(up ? 1 : -1, colr, nm + ' increases', y0 - 18); down(up ? -1 : 1, colr, x0 + 380);
        const why = up ? ['across: more protons hold electrons tighter', 'up a group: electrons closer to the nucleus'] : ['across: more protons pull electrons in → smaller', 'down a group: more shells → larger'];
        lbw(g, 0, y0 + 168, why[0], DK, 15); lbw(g, 0, y0 + 190, why[1], DK, 15);
        if (k === 'electronegativity') lb(g, x0 + 345, y0 + 10, 'F', '#fff', 15); if (k === 'ionization') lb(g, x0 + 350, y0 + 15, 'He', '#fff', 13);
        if (k === 'radius') lb(g, x0 + 10, y0 + 135, 'Fr', '#fff', 12);
      }
      if (t) lb(g, 0, y0 - 52, t, TXT.blue, 20);
      return g;
    },
    // "lewis cx cy size k=h2o|co2|nh3|ch4|o2|n2|hcl |text"
    lewis: ([cx, cy, S = 300], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, S / 300, 0, p), k = o.k || 'h2o';
      // [sym, x, y, lone-pair angles]
      const M = {
        h2o: [[['O', 0, -15, [-55, -125]], ['H', -66, 30, []], ['H', 66, 30, []]], [[0, 1, 1], [0, 2, 1]], 'water, H₂O'],
        co2: [[['O', -90, 0, [125, -125]], ['C', 0, 0, []], ['O', 90, 0, [55, -55]]], [[0, 1, 2], [1, 2, 2]], 'carbon dioxide, CO₂'],
        nh3: [[['N', 0, -10, [-90]], ['H', -70, -10, []], ['H', 70, -10, []], ['H', 0, 60, []]], [[0, 1, 1], [0, 2, 1], [0, 3, 1]], 'ammonia, NH₃'],
        ch4: [[['C', 0, 0, []], ['H', -70, 0, []], ['H', 70, 0, []], ['H', 0, -68, []], ['H', 0, 68, []]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], 'methane, CH₄'],
        o2: [[['O', -40, 0, [125, -125]], ['O', 40, 0, [55, -55]]], [[0, 1, 2]], 'oxygen, O₂'],
        n2: [[['N', -40, 0, [180]], ['N', 40, 0, [0]]], [[0, 1, 3]], 'nitrogen, N₂'],
        hcl: [[['H', -55, 0, []], ['Cl', 30, 0, [-90, 0, 90]]], [[0, 1, 1]], 'hydrogen chloride, HCl'],
      }[k] || [[], [], ''];
      const [a0, bonds, name] = M, fs = 40, atoms = a0.map(([s, x, y, l]) => [s, x * 1.35, y * 1.35, l]);
      for (const [i, j, ord] of bonds) { const a = atoms[i], b = atoms[j], L = Math.hypot(b[1] - a[1], b[2] - a[2]), ux = (b[1] - a[1]) / L, uy = (b[2] - a[2]) / L;
        const ca = a[0].length > 1 ? 28 : 19, cb = b[0].length > 1 ? 28 : 19;
        for (const off of ord === 3 ? [-7, 0, 7] : ord === 2 ? [-5, 5] : [0])
          still(g, `M${P(a[1] + ux * ca - uy * off, a[2] + uy * ca + ux * off)} L${P(b[1] - ux * cb - uy * off, b[2] - uy * cb + ux * off)}`, DK, 3); }
      let ve = bonds.reduce((s, b) => s + 2 * b[2], 0);
      for (const [sym, x, y, lp] of atoms) { lb(g, x, y + fs * .36, sym, sym === 'H' ? DK : TXT.blue, fs);
        for (const a of lp) { const d = 28 + (sym.length > 1 && Math.abs(Math.cos(rad(a))) > .5 ? 10 : 0), px = x + d * Math.cos(rad(a)), py = y + d * Math.sin(rad(a)), nx = -Math.sin(rad(a)) * 6, ny = Math.cos(rad(a)) * 6;
          dot(g, px + nx, py + ny, RED); dot(g, px - nx, py - ny, RED); ve += 2; } }
      lbw(g, 0, 130, name, DK, 20); lbw(g, 0, 156, `${ve} valence electrons: lines = shared pairs, red dots = lone pairs`, '#555', 14);
      if (t) lb(g, 0, -125, t, TXT.blue, 20);
      return g;
    },
    // "vsepr cx cy size k=linear|trigonal|tetrahedral|pyramidal|bent|tbp|octahedral|all |text"
    vsepr: ([cx, cy, S = 300], o, t, p) => {
      SHOW = showLab(o);
      const k = o.k || 'tetrahedral', all = k === 'all', g = G(cx, cy, S / 300, 0, p);
      // bonds [angle, p|w|d], lone pairs [angle], arc [a1, a2, text]
      const D = {
        linear: [[[180, 'p'], [0, 'p']], [], [180, 360, '180°'], 'linear', 'AX₂, e.g. CO₂', '180°'],
        trigonal: [[[-90, 'p'], [30, 'p'], [150, 'p']], [], [30, 150, '120°'], 'trigonal planar', 'AX₃, e.g. BF₃', '120°'],
        tetrahedral: [[[-90, 'p'], [160.5, 'p'], [55, 'w'], [12, 'd']], [], [160.5, 270, '109.5°'], 'tetrahedral', 'AX₄, e.g. CH₄', '109.5°'],
        pyramidal: [[[160.5, 'p'], [55, 'w'], [12, 'd']], [-90], [55, 160.5, '107°'], 'trigonal pyramidal', 'AX₃E, e.g. NH₃', '107°'],
        bent: [[[142, 'p'], [38, 'p']], [-50, -130], [38, 142, '104.5°'], 'bent', 'AX₂E₂, e.g. H₂O', '104.5°'],
        tbp: [[[-90, 'p'], [90, 'p'], [180, 'p'], [32, 'w'], [-32, 'd']], [], [-32, 32, '120°'], 'trigonal bipyramidal', 'AX₅, e.g. PCl₅', '90°, 120°'],
        octahedral: [[[-90, 'p'], [90, 'p'], [180, 'p'], [0, 'p'], [128, 'w'], [-52, 'd']], [], [180, 270, '90°'], 'octahedral', 'AX₆, e.g. SF₆', '90°'],
      };
      const one = (q, x0, y0, s, key, big) => {
        const [bonds, lps, arc, nm, axe] = D[key], L = 90 * s, at = a => [x0 + L * Math.cos(rad(a)), y0 + L * Math.sin(rad(a))];
        for (const a of lps) { const r = q, dx = Math.cos(rad(a)), dy = Math.sin(rad(a)), nx = -dy, ny = dx, l = 70 * s, w = 24 * s;
          part(r, `M${P(x0, y0)} C${P(x0 + dx * l * .5 + nx * w, y0 + dy * l * .5 + ny * w)} ${P(x0 + dx * l + nx * w * .8, y0 + dy * l + ny * w * .8)} ${P(x0 + dx * l, y0 + dy * l)} C${P(x0 + dx * l - nx * w * .8, y0 + dy * l - ny * w * .8)} ${P(x0 + dx * l * .5 - nx * w, y0 + dy * l * .5 - ny * w)} ${P(x0, y0)} Z`, '#f3e3b0', '#b58a10', 1.8);
          dot(r, x0 + dx * l * .62 + nx * 5 * s, y0 + dy * l * .62 + ny * 5 * s, ORG); dot(r, x0 + dx * l * .62 - nx * 5 * s, y0 + dy * l * .62 - ny * 5 * s, ORG); }
        const order = [...bonds].sort((a, b) => (a[1] === 'd' ? -1 : 0) - (b[1] === 'd' ? -1 : 0));
        for (const [a, kind] of order.filter(b => b[1] === 'd')) { const [x, y] = at(a); bondTo(q, x0, y0, x, y, 'd', '#555'); part(q, C(x, y, 13 * s), '#dfe7ef', '#777', 2); }
        for (const [a, kind] of order.filter(b => b[1] !== 'd')) { const [x, y] = at(a); bondTo(q, x0, y0, x, y, kind, '#555', 5 * s); part(q, C(x, y, 15 * s), '#fff', DK, 2.2); }
        part(q, C(x0, y0, 21 * s), '#5b86c8', BLU, 2.5);
        if (big) { const [a1, a2, txt] = arc, r = 44, s1 = rad(a1), s2 = rad(a2), mid = rad((a1 + a2) / 2);
          still(q, `M${P(x0 + r * Math.cos(s1), y0 + r * Math.sin(s1))} A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${P(x0 + r * Math.cos(s2), y0 + r * Math.sin(s2))}`, RED, 2);
          lb(q, x0 + 66 * Math.cos(mid), y0 + 66 * Math.sin(mid) + 6, txt, TXT.red, 17);
          lbw(q, x0, y0 + 130, nm, DK, 20); lbw(q, x0, y0 + 154, axe, '#555', 15); }
      };
      if (all) {
        Object.keys(D).forEach((key, i) => { const x = i < 4 ? -195 + i * 130 : -130 + (i - 4) * 130, y = i < 4 ? -95 : 85;
          one(g, x, y, .45, key, false); lbw(g, x, y + 62, D[key][3], DK, 15); lbw(g, x, y + 80, D[key][5] + '  ' + D[key][4].split(',')[0], '#555', 13); });
      } else one(g, 0, -10, 1, D[k] ? k : 'tetrahedral', true);
      if (t) lb(g, 0, all ? -165 : -130, t, TXT.blue, 20);
      return g;
    },
    // "hybrid cx cy width k=sp|sp2|sp3 |text"
    hybrid: ([cx, cy, W = 480], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), k = ['sp', 'sp2', 'sp3'].includes(o.k) ? o.k : 'sp3', nh = { sp: 2, sp2: 3, sp3: 4 }[k], hx = -130;
      const lobe = (dx, dy, len, fill, ink, wd = 24) => { const a = Math.atan2(dy, dx) * 180 / Math.PI, q = mk('g', { transform: `translate(${hx} 0) rotate(${a.toFixed(1)})` }, g);
        part(q, `M0 0 C${len * .3} ${-wd} ${len} ${-wd} ${len} 0 C${len} ${wd} ${len * .3} ${wd} 0 0 Z`, fill, ink, 2);
        part(q, `M0 0 C-5 -9 -16 -9 -16 0 C-16 9 -5 9 0 0 Z`, fill, ink, 1.5); };
      const pz = (dx, dy, len) => { for (const sgn of [1, -1]) { const a = Math.atan2(sgn * dy, sgn * dx) * 180 / Math.PI, q = mk('g', { transform: `translate(${hx} 0) rotate(${a.toFixed(1)})` }, g);
        fl(q, `M0 0 C${len * .2} -18 ${len} -20 ${len} 0 C${len} 20 ${len * .2} 18 0 0 Z`, '#f4c7b8'); dash(q, `M0 0 C${len * .2} -18 ${len} -20 ${len} 0 C${len} 20 ${len * .2} 18 0 0 Z`, RED, 1.8); } };
      if (k === 'sp') { pz(0, -1, 70); pz(.75, .45, 55); lobe(1, 0, 95, '#bcd4f0', BLU); lobe(-1, 0, 95, '#bcd4f0', BLU); }
      else if (k === 'sp2') { pz(0, -1, 75); for (const a of [90, 210, 330]) lobe(Math.cos(rad(a)), .42 * Math.sin(rad(a)), 90, '#bcd4f0', BLU); }
      else for (const a of [20, 60, 160.5, -90]) lobe(Math.cos(rad(a)), Math.sin(rad(a)), 85, '#bcd4f0', BLU, 20);
      part(g, C(hx, 0, 7), DK, DK, 1);
      lbw(g, hx, 140, { sp: 'sp: 2 hybrids at 180°, linear', sp2: 'sp²: 3 hybrids at 120°, trigonal planar', sp3: 'sp³: 4 hybrids at 109.5°, tetrahedral' }[k], TXT.blue, 16);
      if (k !== 'sp3') lbw(g, hx, 160, `${3 - nh + 1} unhybridized p (dashed) → π bond${k === 'sp' ? 's' : ''}`, TXT.red, 14);
      // energy boxes: carbon 2s² 2p² → hybrids, one electron each
      still(g, 'M-10 110 V-110', DK, 2); tip(g, -10, -110, -10, -100, DK, 2); lbw(g, -16, -96, 'E', DK, 16, 'end');
      const bw = 26; obox(g, 6, 80, bw, 2); lb(g, 19, 113, '2s', DK, 15); [1, 1, 0].forEach((n, i) => obox(g, 6 + i * bw, -50, bw, n)); lb(g, 45, -72, '2p', DK, 15);
      arrow(g, 100, 15, 130, 15, ORG, 2.5); lbw(g, 116, 0, 'mix', TXT.orange, 13);
      for (let i = 0; i < nh; i++) obox(g, 138 + i * bw, 30, bw, 1, VIO); lb(g, 138 + nh * bw / 2, 63, { sp: 'two sp', sp2: 'three sp²', sp3: 'four sp³' }[k], VIO, 15);
      for (let i = 0; i < 4 - nh; i++) obox(g, 138 + i * bw, -50, bw, 1, RED); if (nh < 4) lb(g, 138 + (4 - nh) * bw / 2, -72, '2p', TXT.red, 15);
      lbw(g, 110, 150, 'carbon: one electron per orbital', '#555', 14);
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "modiagram cx cy width k=o2|n2|h2 |text"
    modiagram: ([cx, cy, W = 480], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), k = ['o2', 'n2', 'h2'].includes(o.k) ? o.k : 'o2', ax = 165;
      const lvl = (x, y, w, n, c = BLU) => { still(g, `M${P(x - w / 2, y)} H${(x + w / 2).toFixed(1)}`, DK, 3); if (n === 1) harrow(g, x, y - 10, 20, true, c); if (n === 2) { harrow(g, x - 7, y - 10, 20, true, c); harrow(g, x + 7, y - 10, 20, false, c); } };
      const set = (x, y, occ, w = 36, gp = 6) => { const tot = occ.length * w + (occ.length - 1) * gp; occ.forEach((n, i) => lvl(x - tot / 2 + w / 2 + i * (w + gp), y, w, n)); return tot / 2; };
      const link = (x1, y1, x2, y2) => dash(g, `M${P(x1, y1)} L${P(x2, y2)}`, '#a0a6ad', 1.5);
      const name = k === 'h2' ? 'H' : k === 'n2' ? 'N' : 'O';
      still(g, 'M-225 150 V-150', DK, 2); tip(g, -225, -150, -225, -140, DK, 2); lbw(g, -218, -140, 'energy', DK, 14, 'start');
      if (k === 'h2') {
        for (const s of [-1, 1]) { set(s * ax, 0, [1]); lb(g, s * ax, 26, '1s', DK, 15); link(s * (ax - 18), 0, s * 22, 70); link(s * (ax - 18), 0, s * 22, -70); }
        set(0, 70, [2], 44); set(0, -70, [0], 44); lb(g, 30, 92, 'σ1s', DK, 16, 'start'); lb(g, 30, -80, 'σ*1s', DK, 16, 'start');
        lbw(g, 0, 150, 'bond order = (2 − 0) / 2 = 1', TXT.red, 18);
      } else {
        const o2 = k === 'o2', ae = o2 ? [1, 1, 2].reverse() : [1, 1, 1], yS = 140, yP = -30, sp = o2 ? 52 : 10, pi = o2 ? 12 : 42, pis = -78, ss = -125;
        for (const s of [-1, 1]) { set(s * ax, yS, [2]); lb(g, s * ax, yS + 24, '2s', DK, 15);
          const h = set(s * ax, yP, o2 ? [2, 1, 1] : ae, 22, 5); lb(g, s * ax, yP + 24, '2p', DK, 15);
          link(s * (ax - 18), yS, s * 22, yS + 30); link(s * (ax - 18), yS, s * 22, yS - 30);
          for (const y of [sp, pi, pis, ss]) link(s * (ax - h), yP, s * (y === sp || y === ss ? 22 : 40), y); }
        set(0, yS + 30, [2], 44); set(0, yS - 30, [2], 44);
        set(0, sp, [2], 44); set(0, pi, [2, 2], 36, 8); set(0, pis, o2 ? [1, 1] : [0, 0], 36, 8); set(0, ss, [0], 44);
        const L = (x, y, s) => lb(g, x, y, s, DK, 15, 'start');
        L(26, yS + 48, 'σ2s'); L(26, yS - 38, 'σ*2s'); L(o2 ? 26 : 26, sp + (o2 ? 20 : -10), 'σ2p'); L(44, pi + 20, 'π2p'); L(44, pis - 10, 'π*2p'); L(26, ss - 10, 'σ*2p');
        lbw(g, 0, 212, o2 ? 'bond order = (8 − 4) / 2 = 2; two unpaired e⁻ → paramagnetic' : 'bond order = (8 − 2) / 2 = 3; all paired → diamagnetic', TXT.red, 16);
      }
      lbw(g, -ax, -165, name + ' atom', DK, 17); lbw(g, ax, -165, name + ' atom', DK, 17); lbw(g, 0, -165, { o2: 'O₂', n2: 'N₂', h2: 'H₂' }[k] + ' molecule', TXT.blue, 18);
      if (t) lb(g, 0, -195, t, TXT.blue, 20);
      return g;
    },
    // "hbond cx cy size k=hbond|dipole|dispersion |text"
    hbond: ([cx, cy, S = 320], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, S / 320, 0, p), k = o.k || 'hbond';
      if (k === 'dipole') {
        const mol = (x, y) => { part(g, E(x + 14, y, 30, 22), '#cfe8c4', GRN, 2.2); part(g, C(x - 26, y, 12), '#fff', DK, 2); lb(g, x - 26, y + 5, 'H', DK, 13); lb(g, x + 14, y + 6, 'Cl', GRN, 16);
          lb(g, x - 30, y - 18, 'δ+', TXT.blue, 15); lb(g, x + 30, y - 24, 'δ−', TXT.red, 15); };
        for (const y of [-55, 55]) for (const x of [-120, 0, 120]) { mol(x, y); if (x < 120) dash(g, `M${x + 46} ${y} H${x + 80}`, RED, 2); }
        lbw(g, 0, 125, 'δ+ end of one polar molecule attracts δ− end of the next', DK, 15); lbw(g, 0, 148, 'dipole–dipole forces, e.g. HCl', TXT.blue, 16);
      } else if (k === 'dispersion') {
        const atom = (x, y, sh, labels) => { part(g, E(x + sh, y, 46, 40), '#d4e5f6', BLU, 2); part(g, C(x, y, 6), RED, RED, 1);
          if (labels) { lb(g, x - 52, y - 30, sh > 0 ? 'δ+' : 'δ−', sh > 0 ? TXT.blue : TXT.red, 15); lb(g, x + 52, y - 30, sh > 0 ? 'δ−' : 'δ+', sh > 0 ? TXT.red : TXT.blue, 15); } };
        atom(-70, -60, 0, false); atom(70, -60, 0, false); lbw(g, 0, -120, 'on average: even electron clouds, no dipole', DK, 15);
        atom(-70, 50, 16, true); atom(70, 50, 16, true); dash(g, 'M-10 50 H14', RED, 2);
        lbw(g, -70, 112, 'temporary dipole', TXT.red, 14); lbw(g, 70, 112, 'induced dipole', TXT.red, 14);
        lbw(g, 0, 145, 'London dispersion: grows with more electrons', TXT.blue, 16);
      } else {
        const w = (x, y, th) => { const hs = [th - 52.25, th + 52.25].map(a => [x + 34 * Math.cos(rad(a)), y + 34 * Math.sin(rad(a))]);
          for (const [hx, hy] of hs) still(g, `M${P(x, y)} L${P(hx, hy)}`, DK, 3);
          part(g, C(x, y, 17), '#e04b3a', '#7a1f1f', 2); lb(g, x, y + 6, 'O', '#fff', 16);
          for (const [hx, hy] of hs) { part(g, C(hx, hy, 11), '#fff', DK, 2); lb(g, hx, hy + 5, 'H', DK, 12); } return hs; };
        const c0 = [0, -10], th0 = 90, hs = w(...c0, th0), D = 100;
        // neighbours that accept the central H's
        for (const a of [th0 - 52.25, th0 + 52.25]) { const x = c0[0] + D * Math.cos(rad(a)), y = c0[1] + D * Math.sin(rad(a)); w(x, y, a);
          dash(g, `M${P(c0[0] + 47 * Math.cos(rad(a)), c0[1] + 47 * Math.sin(rad(a)))} L${P(x - 18 * Math.cos(rad(a)), y - 18 * Math.sin(rad(a)))}`, BLU, 2.5); }
        // neighbours that donate an H to the central O
        for (const a of [-40, -140]) { const x = c0[0] + D * Math.cos(rad(a)), y = c0[1] + D * Math.sin(rad(a)), back = a + 180, th = back + (a > -90 ? 52.25 : -52.25); w(x, y, th);
          dash(g, `M${P(x + 47 * Math.cos(rad(back)), y + 47 * Math.sin(rad(back)))} L${P(c0[0] - 18 * Math.cos(rad(back)), c0[1] - 18 * Math.sin(rad(back)))}`, BLU, 2.5); }
        lb(g, -24, -24, 'δ−', TXT.red, 15, 'end'); lb(g, hs[1][0] - 10, hs[1][1] + 26, 'δ+', TXT.blue, 15);
        lbw(g, 150, -85, 'hydrogen bond', TXT.blue, 15, 'start'); still(g, 'M146 -82 Q80 -82 34 -40', BLU, 1.5);
        lbw(g, 0, 155, 'H on O, N or F attracts a lone pair on a neighbour', DK, 15);
      }
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "phasediagram cx cy width k=generic|water |text"
    phasediagram: ([cx, cy, W = 440], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 440, 0, p), wat = o.k === 'water', TP = [-60, 60], CP = [125, -75], top = -140, y1 = -15;
      const bez = s => { const u = 1 - s, c = [55, 40]; return [u * u * TP[0] + 2 * u * s * c[0] + s * s * CP[0], u * u * TP[1] + 2 * u * s * c[1] + s * s * CP[1]]; };
      const vap = Array.from({ length: 41 }, (_, i) => bez(i / 40)), sub = Array.from({ length: 21 }, (_, i) => { const s = i / 20, u = 1 - s; return [u * u * -175 + 2 * u * s * -110 + s * s * TP[0], u * u * 128 + 2 * u * s * 118 + s * s * TP[1]]; });
      const fx = wat ? -95 : -25, fus = y => TP[0] + (fx - TP[0]) * (TP[1] - y) / (TP[1] - top);
      fl(g, pts([[-175, 128], ...sub, [fx, top], [-175, top]]) + ' Z', '#d4e5f6');
      fl(g, pts([TP, [fx, top], [CP[0], top], ...[...vap].reverse()]) + ' Z', '#d8eed0');
      fl(g, pts([[-175, 128], ...sub, ...vap, [200, CP[1]], [200, 128]]) + ' Z', '#fdeed3');
      axes(g, -180, 130, 210, -160, wat ? 'temperature (°C)' : 'temperature', 'pressure');
      still(g, pts(sub), DK, 3); still(g, pts(vap), DK, 3); still(g, `M${P(...TP)} L${P(fx, top)}`, DK, 3);
      const vb = vap.reduce((b, q) => Math.abs(q[1] - y1) < Math.abs(b[1] - y1) ? q : b), mx = fus(y1);
      dash(g, `M-180 ${y1} H${vb[0].toFixed(1)}`, '#777', 1.8); dash(g, `M${mx.toFixed(1)} ${y1} V130 M${vb[0].toFixed(1)} ${y1} V130`, '#777', 1.8);
      lb(g, -186, y1 + 5, '1 atm', DK, 14, 'end');
      (wat ? lb : lbw)(g, mx, 150, wat ? '0 °C' : 'normal m.p.', TXT.blue, 14); (wat ? lb : lbw)(g, vb[0], 150, wat ? '100 °C' : 'normal b.p.', TXT.red, 14);
      part(g, C(...TP, 5), DK, DK, 1); part(g, C(...CP, 5), DK, DK, 1);
      lbw(g, TP[0] + 10, TP[1] + 26, wat ? 'triple point 0.01 °C, 0.006 atm' : 'triple point', DK, 14, 'start');
      lbw(g, CP[0] + 8, CP[1] - 10, wat ? 'critical point 374 °C, 218 atm' : 'critical point', DK, 14, 'middle');
      lbw(g, wat ? -150 : -120, -90, wat ? 'ice' : 'solid', TXT.blue, 20); lbw(g, wat ? 20 : 45, -100, wat ? 'water' : 'liquid', TXT.green, 20); lbw(g, 150, 40, wat ? 'vapor' : 'gas', TXT.orange, 20);
      lbw(g, 175, -115, 'supercritical', '#777', 13);
      if (wat) lbw(g, -100, -150, 'solid–liquid line slopes left: ice is less dense', TXT.red, 14, 'start');
      if (t) lb(g, 0, -180, t, TXT.blue, 20);
      return g;
    },
    // "heatingcurve cx cy width |text"
    heatingcurve: ([cx, cy, W = 460], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 460, 0, p), Y = T => 100 - (T + 20) * 1.55, x0 = -180;
      const xs = [x0, x0 + 30, x0 + 80, x0 + 160, x0 + 340, x0 + 380], ys = [Y(-20), Y(0), Y(0), Y(100), Y(100), Y(130)];
      axes(g, x0, 125, 215, -150, 'heat added', 'temperature (°C)');
      for (const T of [0, 100]) { dash(g, `M${x0} ${Y(T)} H${xs[T ? 3 : 1]}`, '#9aa0a8', 1.5); lb(g, x0 - 8, Y(T) + 5, `${T}`, DK, 15, 'end'); }
      line(g, pts(xs.map((x, i) => [x, ys[i]])), RED, 4);
      lbw(g, xs[0] + 22, ys[0] + 6, 'ice', TXT.blue, 15, 'start'); lbw(g, (xs[1] + xs[2]) / 2, Y(0) + 24, 'melting', TXT.blue, 14); lbw(g, (xs[1] + xs[2]) / 2, Y(0) - 12, 'ΔHfus', TXT.red, 15);
      lbw(g, (xs[2] + xs[3]) / 2 + 14, Y(50), 'water', TXT.blue, 15, 'start'); lbw(g, (xs[3] + xs[4]) / 2, Y(100) + 24, 'boiling: water + steam', TXT.blue, 14); lbw(g, (xs[3] + xs[4]) / 2, Y(100) - 12, 'ΔHvap (much larger)', TXT.red, 15);
      lbw(g, xs[5] - 8, ys[5] - 12, 'steam', TXT.blue, 15, 'end');
      lbw(g, 10, 182, 'slopes: q = mcΔT    plateaus: q = nΔH, temperature constant', '#555', 14);
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "gaslaw cx cy width k=boyle|charles|gaylussac|ideal |text"
    gaslaw: ([cx, cy, W = 460], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 460, 0, p), k = o.k || 'boyle';
      const gas = (x, y, w, h, n, seed = 1) => { let r = seed; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
        for (let i = 0; i < n; i++) { const px = x + 10 + rnd() * (w - 20), py = y + 10 + rnd() * (h - 20), a = rnd() * 6.28;
          part(g, C(px, py, 5), '#7fb7ea', BLU, 1.5); line(g, `M${P(px, py)} L${P(px + 16 * Math.cos(a), py + 16 * Math.sin(a))}`, '#9aa0a8', 1.5); } };
      if (k === 'boyle') {
        axes(g, -220, 110, 0, -130, 'V', 'P'); line(g, curve(x => 110 - 5200 / (x + 245), -200, -10), RED, 3.5);
        for (const V of [-180, -115]) { const y = 110 - 5200 / (V + 245); dash(g, `M-220 ${P(0, y).split(' ')[1]} H${V} V110`, '#9aa0a8', 1.5); part(g, C(V, y, 4), DK, DK, 1); }
        lbw(g, -110, 150, 'PV = constant (n, T fixed)', TXT.red, 16);
        part(g, R(60, -40, 130, 150), '#eef4fa', DK, 3); part(g, R(64, 10, 122, 12), '#c9ccd2', DK, 2.5); still(g, 'M125 10 V-70', DK, 5);
        arrow(g, 155, -80, 155, -20, GRN, 3); lbw(g, 162, -55, 'push', TXT.green, 14, 'start'); gas(64, 22, 122, 88, 12);
        lbw(g, 125, 140, 'smaller V → more hits → higher P', DK, 14);
        lbw(g, -110, -150, "Boyle's law  P₁V₁ = P₂V₂", TXT.blue, 18);
      } else if (k === 'charles' || k === 'gaylussac') {
        const ch = k === 'charles', X = T => -150 + (T + 273) * .62, x0 = ch ? -220 : -150;
        axes(g, x0, 110, 210, -130, ch ? 'T (°C)' : 'T (K)', ch ? 'V' : 'P');
        const Yv = T => 110 - (T + 273) * .45;
        dash(g, `M${X(-273)} 110 L${P(X(ch ? -50 : -173), Yv(ch ? -50 : -173))}`, RED, 2.5); line(g, `M${P(X(ch ? -50 : -173), Yv(ch ? -50 : -173))} L${P(X(230), Yv(230))}`, RED, 3.5);
        for (const T of [0, 100, 200]) part(g, C(X(T), Yv(T), 4), DK, DK, 1);
        if (ch) { lb(g, X(-273), 132, '−273 °C', TXT.red, 14); lb(g, X(-273), 150, '= 0 K', TXT.red, 14); still(g, `M${X(0)} 110 v8`, DK, 2); lb(g, X(0), 134, '0 °C', DK, 14);
          lbw(g, 20, -150, "Charles's law  V₁/T₁ = V₂/T₂ (P, n fixed)", TXT.blue, 17); lbw(g, 70, 30, 'dashed: extrapolated', '#777', 13, 'start'); }
        else { lb(g, X(-273), 132, '0 K', TXT.red, 14); still(g, `M${X(0)} 110 v8`, DK, 2); lb(g, X(0), 134, '273 K', DK, 14);
          lbw(g, 30, -150, "Gay-Lussac's law  P₁/T₁ = P₂/T₂ (V, n fixed)", TXT.blue, 17); }
        lbw(g, 30, 175, ch ? 'V/T constant, T in kelvin: hot gas expands' : 'P/T constant, T in kelvin: hot particles hit walls harder', '#555', 14);
      } else {
        part(g, R(-210, -100, 190, 190), '#eef4fa', DK, 3); gas(-210, -100, 190, 190, 16, 7);
        lbw(g, -115, 120, 'n mol of gas in volume V at T', DK, 15);
        lbw(g, 110, -60, 'PV = nRT', TXT.red, 34);
        for (const [i, s] of ['P pressure (atm)', 'V volume (L)', 'n amount (mol)', 'T temperature (K)', 'R = 0.08206 L·atm/(mol·K)'].entries()) lbw(g, 20, -10 + i * 24, s, i === 4 ? TXT.blue : DK, 15, 'start');
      }
      if (t) lb(g, 0, -180, t, TXT.blue, 20);
      return g;
    },
    // "mole cx cy width |text"
    mole: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p);
      const box = (x, y, w, s1, s2, fill, ink) => { part(g, R(x - w / 2, y - 32, w, 64), fill, ink, 3); lbw(g, x, y - 4, s1, ink, 20); lbw(g, x, y + 20, s2, '#555', 13); };
      box(0, -50, 110, 'moles', '(mol)', '#fde3d6', RED); box(-205, -50, 110, 'mass', '(g)', '#dbe8f7', BLU); box(205, -50, 110, 'particles', 'atoms, molecules', '#e3f1dc', GRN); box(0, 110, 170, 'gas volume', 'at STP (0 °C, 1 atm)', '#efe2f5', VIO);
      const pair = (x1, x2, y, top, bot) => { arrow(g, x1, y - 10, x2, y - 10, DK, 2.5); arrow(g, x2, y + 10, x1, y + 10, DK, 2.5); lbw(g, (x1 + x2) / 2, y - 20, top, TXT.blue, 14); lbw(g, (x1 + x2) / 2, y + 34, bot, TXT.blue, 14); };
      pair(-148, -57, -50, '÷ molar mass', '× molar mass'); pair(57, 148, -50, '× 6.022×10²³', '÷ 6.022×10²³');
      arrow(g, -12, -16, -12, 76, DK, 2.5); arrow(g, 12, 76, 12, -16, DK, 2.5); lbw(g, -20, 34, '× 22.4 L/mol', TXT.blue, 14, 'end'); lbw(g, 20, 34, '÷ 22.4 L/mol', TXT.blue, 14, 'start');
      lbw(g, 0, -115, 'always go through moles', '#555', 15);
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "energyprofile cx cy width k=exo|endo cat=1 |text"
    energyprofile: ([cx, cy, W = 440], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 440, 0, p), endo = o.k === 'endo', yR = endo ? 95 : 25, yP = endo ? 25 : 95;
      const f = H => x => yR + (yP - yR) / (1 + Math.exp(-x / 22)) - H * Math.exp(-((x / 55) ** 2));
      const pk = H => { let b = [0, 1e9]; for (let x = -100; x <= 100; x++) { const y = f(H)(x); if (y < b[1]) b = [x, y]; } return b; };
      axes(g, -200, 140, 210, -150, 'reaction progress', 'potential energy');
      if (o.cat) dash(g, curve(f(endo ? 120 : 75), -185, 195), GRN, 3);
      line(g, curve(f(endo ? 190 : 150), -185, 195), RED, 3.5);
      const [px, py] = pk(endo ? 190 : 150);
      dash(g, `M-170 ${yR} H${endo ? 195 : 160}`, '#9aa0a8', 1.5); dash(g, `M-125 ${py.toFixed(1)} H${px}`, '#9aa0a8', 1.5);
      arrow(g, -125, yR, -125, py + 2, BLU, 2.5); lbw(g, -132, (yR + py) / 2 + 5, 'Ea', TXT.blue, 18, 'end');
      arrow(g, 160, yR, 160, yP + (endo ? 2 : -2), VIO, 2.5); lbw(g, 168, (yR + yP) / 2 + 5, endo ? 'ΔH > 0' : 'ΔH < 0', VIO, 17, 'start');
      lbw(g, -160, yR - 10, 'reactants', DK, 15); lbw(g, endo ? 195 : 150, yP - 10, 'products', DK, 15, 'end');
      lbw(g, px, py - 14, 'transition state ‡', TXT.red, 15);
      if (o.cat) { const [cx2, cy2] = pk(endo ? 120 : 75); lbw(g, cx2, cy2 + 30, 'catalyst:', TXT.green, 14); lbw(g, cx2, cy2 + 46, 'lower Ea', TXT.green, 14); }
      lbw(g, 0, 192, endo ? 'endothermic: products higher, heat absorbed' : 'exothermic: products lower, heat released', '#555', 15);
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "collisiontheory cx cy width |text"
    collisiontheory: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p);
      const ball = (x, y, f, ink, s) => { part(g, C(x, y, 13), f, ink, 2); lb(g, x, y + 5, s, '#fff', 13); };
      const A = (x, y) => ball(x, y, '#e04b3a', '#7a1f1f', 'A'), B = (x, y) => ball(x, y, '#5b86c8', BLU, 'B'), Cc = (x, y) => ball(x, y, '#5fae3a', GRN, 'C');
      const bc = (x, y, flip) => { still(g, `M${x} ${y} H${x + 26}`, DK, 4); flip ? (Cc(x, y), B(x + 26, y)) : (B(x, y), Cc(x + 26, y)); };
      // effective
      lbw(g, -120, -120, 'effective: right orientation, E ≥ Ea', TXT.green, 15); A(-245, -80); arrow(g, -228, -80, -200, -80, DK, 2.5, true); bc(-180, -80, false);
      arrow(g, -132, -80, -102, -80, ORG, 3); still(g, 'M-60 -80 H-34', DK, 4); A(-60, -80); B(-34, -80); Cc(10, -80); arrow(g, 26, -80, 46, -80, DK, 2.5, true);
      // ineffective
      lbw(g, -120, 0, 'ineffective: wrong orientation or too slow', TXT.red, 15); A(-245, 40); arrow(g, -228, 40, -200, 40, DK, 2.5, true); bc(-180, 40, true);
      arrow(g, -132, 40, -102, 40, ORG, 3); A(-75, 40); arrow(g, -90, 40, -110, 40, DK, 2.5, true); bc(-40, 40, true); lbw(g, -60, 75, 'bounce apart', '#777', 13);
      // Maxwell–Boltzmann
      const x0 = 80, y0 = 120, f = kt => u => { const e = u / 1; return y0 - 11000 * Math.sqrt(e) / kt ** 1.5 * Math.exp(-e / kt); }, Ea = 95;
      axes(g, x0, y0, 255, -120, 'energy', 'fraction');
      fl(g, curve(f(55), x0 + Ea, x0 + 170, 40).replace(/^M/, `M${x0 + Ea} ${y0} L`) + ` L${x0 + 170} ${y0} Z`, '#f4b7a8');
      line(g, curve(u => f(30)(u - x0), x0, x0 + 170), BLU, 3); line(g, curve(u => f(55)(u - x0), x0, x0 + 170), RED, 3);
      dash(g, `M${x0 + Ea} ${y0} V-60`, DK, 2); lbw(g, x0 + Ea, -68, 'Ea', DK, 16);
      lbw(g, x0 + 32, -45, 'T₁', TXT.blue, 15); lbw(g, x0 + 72, 30, 'T₂ > T₁', TXT.red, 15, 'start');
      lbw(g, 168, 172, 'shaded: more molecules with E ≥ Ea', TXT.red, 13);
      if (t) lb(g, 0, -160, t, TXT.blue, 20);
      return g;
    },
    // "equilibrium cx cy width |text"
    equilibrium: ([cx, cy, W = 460], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 460, 0, p), x0 = -200, td = 250, tau = 40, Y = c => 110 - c * 150;
      const A = u => u < td ? .4 + .6 * Math.exp(-u / tau) : .6 + (.9 - .6) * Math.exp(-(u - td) / tau), B = u => u < td ? 1 - A(u) : 1.5 - A(u);
      axes(g, x0, 115, 215, -130, 'time', 'concentration');
      line(g, curve(x => Y(A(x - x0)), x0, x0 + td - .5, 120) + ` L${x0 + td} ${Y(.9)} ` + curve(x => Y(A(x - x0)), x0 + td, 205, 80).replace('M', 'L'), RED, 3.5);
      line(g, curve(x => Y(B(x - x0)), x0, 205, 200), BLU, 3.5);
      dash(g, `M${x0 + 150} 115 V-120`, '#9aa0a8', 1.5); dash(g, `M${x0 + td} 115 V-120`, '#9aa0a8', 1.5);
      lbw(g, x0 + 10, Y(1) - 12, '[A]', TXT.red, 16, 'start'); lbw(g, x0 + 70, 95, '[B]', TXT.blue, 16, 'start');
      lbw(g, x0 + 200, -110, 'Q = K', DK, 15); lbw(g, x0 + 262, Y(.22), 'A added', TXT.red, 14, 'start'); lbw(g, x0 + 262, Y(.22) + 18, 'Q < K → shifts right', TXT.red, 14, 'start');
      lbw(g, x0 + 75, -110, 'Q < K', DK, 15);
      lbw(g, 0, 168, 'A ⇌ B, K = [B]/[A]: Le Chatelier — system shifts to undo the change', '#555', 14);
      if (t) lb(g, 0, -160, t, TXT.blue, 20);
      return g;
    },
    // "titration cx cy width k=strongstrong|weakstrong |text"
    titration: ([cx, cy, W = 440], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 440, 0, p), weak = o.k === 'weakstrong', Ka = weak ? 1.8e-5 : 1e9, Kw = 1e-14;
      const pH = v => { const Ca = .1 * 25 / (25 + v), Na = .1 * v / (25 + v); let lo = 0, hi = 14;
        for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, H = 10 ** -m, f = H + Na - Kw / H - Ca * Ka / (Ka + H); f > 0 ? lo = m : hi = m; } return (lo + hi) / 2; };
      const X = v => -180 + v * 7.4, Y = q => 130 - q * 18.5;
      if (weak) fl(g, R(X(4), Y(14), X(21) - X(4), Y(0) - Y(14)), '#e3f1dc');
      axes(g, -180, 130, 210, -145, 'volume NaOH added (mL)', 'pH');
      for (const q of [0, 7, 14]) { still(g, `M-186 ${Y(q)} h6`, DK, 2); lb(g, -192, Y(q) + 5, `${q}`, DK, 14, 'end'); }
      for (const v of [25]) lb(g, X(v), 150, `${v}`, DK, 14);
      dash(g, `M-180 ${Y(7)} H200`, '#c0c4c9', 1.5);
      const a = []; for (let v = 0; v <= 50; v += .25) a.push([X(v), Y(pH(v))]); line(g, pts(a), RED, 3.5);
      const pe = pH(25); dash(g, `M${X(25)} 130 V${Y(pe).toFixed(1)}`, '#777', 1.5); part(g, C(X(25), Y(pe), 5), VIO, VIO, 1);
      lbw(g, X(25) + 10, Y(pe) + 5, weak ? `equivalence point, pH ≈ ${pe.toFixed(1)} (> 7)` : 'equivalence point, pH = 7', VIO, 14, 'start');
      if (weak) { const ph = pH(12.5); part(g, C(X(12.5), Y(ph), 5), GRN, GRN, 1); dash(g, `M${X(12.5)} 130 V${Y(ph).toFixed(1)} H-180`, GRN, 1.5);
        lbw(g, X(12.5) + 8, Y(ph) + 24, 'half-equivalence:', TXT.green, 14, 'start'); lbw(g, X(12.5) + 8, Y(ph) + 42, 'pH = pKa = 4.74', TXT.green, 14, 'start'); lbw(g, X(12.5), Y(1), 'buffer region', TXT.green, 14); }
      lbw(g, 0, -160, weak ? 'weak acid (CH₃COOH) + strong base' : 'strong acid (HCl) + strong base', TXT.blue, 16);
      if (t) lb(g, 0, -185, t, TXT.blue, 20);
      return g;
    },
    // "buffer cx cy width |text"
    buffer: ([cx, cy, W = 480], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 480, 0, p);
      fl(g, 'M-90 -60 V60 Q-90 80 -70 80 H70 Q90 80 90 60 V-60 Z', '#dbe8f7'); still(g, 'M-95 -90 L-90 -80 V60 Q-90 80 -70 80 H70 Q90 80 90 60 V-90', DK, 3);
      for (const [x, y, s] of [[-55, -40, 'HA'], [30, -45, 'A⁻'], [-40, 10, 'A⁻'], [45, 5, 'HA'], [-10, 50, 'HA'], [55, 50, 'A⁻']]) lb(g, x, y, s, s === 'HA' ? TXT.red : TXT.blue, 20);
      lbw(g, 0, -100, 'buffer: weak acid HA + its conjugate base A⁻', DK, 16);
      arrow(g, -225, -20, -100, -20, RED, 3, true); lbw(g, -165, -32, 'add H⁺', TXT.red, 16);
      lbw(g, -165, 20, 'A⁻ + H⁺ → HA', TXT.red, 15); lbw(g, -165, 42, 'base soaks up acid', '#555', 13);
      arrow(g, 225, -20, 100, -20, BLU, 3, true); lbw(g, 165, -32, 'add OH⁻', TXT.blue, 16);
      lbw(g, 165, 20, 'HA + OH⁻ → A⁻ + H₂O', TXT.blue, 15); lbw(g, 165, 42, 'acid soaks up base', '#555', 13);
      part(g, R(-190, 105, 380, 50), '#fdf3d6', ORG, 2); lbw(g, 0, 138, 'pH = pKa + log([A⁻] / [HA])', TXT.orange, 20);
      lbw(g, 0, 178, 'pH barely changes while both HA and A⁻ remain', '#555', 14);
      if (t) lb(g, 0, -130, t, TXT.blue, 20);
      return g;
    },
    // "electrolysis cx cy size k=nacl|water |text"
    electrolysis: ([cx, cy, S = 360], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, S / 360, 0, p), wat = o.k === 'water';
      fl(g, R(-150, -40, 300, 150), wat ? '#d4e8f7' : '#f8e3c8'); still(g, 'M-155 -70 V115 H155 V-70', DK, 3); still(g, 'M-150 -40 H150', wat ? GRY : ORG, 1.5);
      part(g, R(-95, -110, 22, 190), '#9aa0a8', DK, 2.5); part(g, R(73, -110, 22, 190), '#9aa0a8', DK, 2.5);
      // power supply
      part(g, R(-40, -175, 80, 40), '#eef0f2', DK, 2.5); lb(g, -24, -148, '+', TXT.red, 22); lb(g, 24, -148, '−', TXT.blue, 22);
      still(g, 'M-40 -155 H-84 V-110 M40 -155 H84 V-110', DK, 2.5);
      arrow(g, -84, -122, -84, -140, ORG, 2.5, true); arrow(g, 60, -165, 84, -165, ORG, 2.5, true); lb(g, 72, -180, 'e⁻', TXT.orange, 14); lb(g, -100, -132, 'e⁻', TXT.orange, 14, 'end');
      lbw(g, -84, 102, 'anode (+)', TXT.red, 15); lbw(g, 84, 102, 'cathode (−)', TXT.blue, 15);
      const ion = (x, y, s, plus) => { part(g, C(x, y, 11), plus ? '#f4c7b8' : '#bcd4f0', plus ? RED : BLU, 1.8); lb(g, x, y + 4, s, plus ? TXT.red : TXT.blue, wat ? 11 : 10); };
      if (wat) {
        for (const [x, y] of [[-84, -60], [-80, -20], [-88, 20], [-82, 50]]) still(g, C(x + 16, y, 4), '#777', 1.5);
        for (const [x, y] of [[84, -60], [80, -35], [88, -10], [82, 15], [86, 40], [80, 60]]) still(g, C(x - 16, y, 4), '#777', 1.5);
        lbw(g, -102, -55, 'O₂', TXT.red, 16, 'end'); lbw(g, 102, -55, 'H₂ (2×)', TXT.blue, 15, 'start');
        lbw(g, 0, 140, 'anode: 2H₂O → O₂ + 4H⁺ + 4e⁻ (oxidation)', TXT.red, 14); lbw(g, 0, 162, 'cathode: 2H₂O + 2e⁻ → H₂ + 2OH⁻ (reduction)', TXT.blue, 14);
        ion(-20, 10, '+', true); arrow(g, -6, 10, 20, 10, RED, 2, true); ion(25, 60, '−', false); arrow(g, 11, 60, -15, 60, BLU, 2, true);
      } else {
        for (const [x, y] of [[-30, 12], [10, 62]]) { ion(x, y, 'Na⁺', true); arrow(g, x + 14, y, x + 40, y, RED, 2, true); }
        for (const [x, y] of [[30, 30], [-10, 86]]) { ion(x, y, 'Cl⁻', false); arrow(g, x - 14, y, x - 40, y, BLU, 2, true); }
        lbw(g, 0, 140, 'anode: 2Cl⁻ → Cl₂ + 2e⁻ (oxidation)', TXT.red, 14); lbw(g, 0, 162, 'cathode: Na⁺ + e⁻ → Na (reduction)', TXT.blue, 14);
        lbw(g, 0, -22, 'molten NaCl', ORG, 14);
      }
      lbw(g, 0, 186, 'cations → cathode, anions → anode', '#555', 13);
      if (t) lb(g, 0, -205, t, TXT.blue, 20);
      return g;
    },
    // "calorimeter cx cy size k=coffee|bomb |text"
    calorimeter: ([cx, cy, S = 340], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, S / 340, 0, p), bomb = o.k === 'bomb';
      const therm = (x, y1, y2) => { part(g, `M${x - 6} ${y1} V${y2} A6 6 0 0 0 ${x + 6} ${y2} V${y1} A6 6 0 0 0 ${x - 6} ${y1} Z`, '#fff', DK, 2); part(g, C(x, y2 + 6, 9), '#e04b3a', RED, 2); fl(g, R(x - 2, y2 - 90, 4, 96), '#e04b3a'); };
      if (!bomb) {
        part(g, 'M-120 -60 L-95 130 H55 L80 -60 Z', '#f2f2ee', '#888', 2.5); part(g, 'M-106 -60 L-84 116 H44 L66 -60 Z', '#fbfbf8', '#888', 2);
        fl(g, 'M-98 0 L-84 116 H44 L58 0 Z', '#cfe5f6'); still(g, 'M-98 0 H58', GLE, 1.5);
        part(g, R(-128, -78, 216, 18), '#e0ddd5', DK, 2.5);
        therm(20, -175, 90); still(g, 'M-40 -150 V95 M-60 95 H-20', DK, 3); still(g, 'M-52 -150 H-28', DK, 5);
        lbw(g, 36, -150, 'thermometer', DK, 14, 'start'); lbw(g, -48, -160, 'stirrer', DK, 14, 'end'); lbw(g, -134, -66, 'lid', DK, 14, 'end');
        lbw(g, -20, 150, 'two nested foam cups', '#555', 14); lbw(g, -20, 60, 'solution', TXT.blue, 14);
        lbw(g, 110, 10, 'q = mcΔT', TXT.red, 22, 'start'); lbw(g, 110, 40, 'q(rxn) = −q(soln)', TXT.red, 16, 'start'); lbw(g, 110, 64, 'constant pressure: ΔH', '#555', 13, 'start');
      } else {
        part(g, R(-150, -100, 240, 230), '#e6e1d8', DK, 3); lbw(g, -30, 150, 'insulated jacket', '#555', 14);
        part(g, R(-130, -70, 200, 185), '#fff', '#888', 2); fl(g, R(-128, -40, 196, 153), '#cfe5f6'); still(g, 'M-128 -40 H68', GLE, 1.5);
        part(g, 'M-90 -10 H10 Q20 -10 20 0 V90 Q20 100 10 100 H-90 Q-100 100 -100 90 V0 Q-100 -10 -90 -10 Z', '#a7adb5', DK, 3);
        part(g, 'M-62 70 H-28 L-34 84 H-56 Z', '#f6c26b', ORG, 2); still(g, 'M-88 -10 V62 M-12 -10 V62 M-88 62 Q-45 52 -12 62', '#555', 1.8);
        still(g, 'M-88 -10 V-130 M-12 -10 V-130', ORG, 2); lbw(g, -45, -138, 'ignition wires', TXT.orange, 13);
        therm(45, -170, 70); still(g, 'M-115 -120 V95 M-125 95 H-105', DK, 3);
        lbw(g, -50, 20, 'steel bomb', '#fff', 14); lbw(g, -50, 38, 'sample + O₂', '#fff', 12); lbw(g, 60, -180, 'thermometer', DK, 13, 'start'); lbw(g, -115, -128, 'stirrer', DK, 13);
        lbw(g, 105, 10, 'q(rxn) = −C(cal) ΔT', TXT.red, 18, 'start'); lbw(g, 105, 38, 'water bath', TXT.blue, 14, 'start'); lbw(g, 105, 60, 'constant volume: ΔU', '#555', 13, 'start');
      }
      if (t) lb(g, 0, -200, t, TXT.blue, 20);
      return g;
    },
    // "bornhaber cx cy width |text"
    bornhaber: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), Y = e => 160 - (e + 411) * .33;
      const L = (e, x1, x2) => still(g, `M${x1} ${Y(e).toFixed(1)} H${x2}`, DK, 3), T = (x, e, s, a = 'start', dy = 5) => lbw(g, x, Y(e) + dy, s, DK, 14, a);
      L(0, -230, 40); T(46, 0, 'Na(s) + ½Cl₂(g)'); L(108, -190, 40); T(46, 108, 'Na(g) + ½Cl₂(g)'); L(229, -150, 40); T(46, 229, 'Na(g) + Cl(g)');
      L(725, -110, 100); T(106, 725, 'Na⁺(g) + e⁻ + Cl(g)'); L(376, 60, 235); T(150, 376, 'Na⁺(g) + Cl⁻(g)', 'middle', -8); L(-411, -230, 235); T(0, -411, 'NaCl(s)', 'middle', 22);
      const A = (x, e1, e2, c, s1, s2, side, em = (e1 + e2) / 2) => { arrow(g, x, Y(e1), x, Y(e2) + (e2 > e1 ? 2 : -2), c, 2.8);
        lbw(g, x + (side ? 6 : -6), Y(em) - 3, s1, c, 13, side ? 'start' : 'end'); lbw(g, x + (side ? 6 : -6), Y(em) + 13, s2, c, 13, side ? 'start' : 'end'); };
      A(-190, 0, 108, RED, 'sublimation', '+108', true); A(-150, 108, 229, RED, '½ bond energy', '+121', true);
      A(-110, 229, 725, RED, 'ionization', 'energy +496', true); A(80, 725, 376, BLU, 'electron', 'affinity −349', false);
      A(220, 376, -411, BLU, 'lattice', 'energy −787', false, -250); A(-215, 0, -411, VIO, 'ΔHf°', '−411', true);
      lbw(g, 0, 210, 'ΔHf° = 108 + 121 + 496 − 349 − 787 = −411 kJ/mol', TXT.blue, 15);
      if (t) lb(g, 0, -245, t, TXT.blue, 20);
      return g;
    },
    // "irspectrum cx cy width k=alcohol|ketone|acid |text"
    irspectrum: ([cx, cy, W = 460], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 460, 0, p), k = o.k || 'alcohol', X = nu => -200 + (4000 - nu) * 400 / 3500, Yt = T => 110 - T * 2.1;
      const PK = { alcohol: [[3350, 170, 70], [2960, 30, 50], [2880, 22, 35], [1460, 15, 25], [1380, 12, 18], [1050, 25, 65], [880, 15, 20]],
        ketone: [[2975, 35, 30], [1715, 18, 85], [1460, 15, 22], [1360, 15, 35], [1220, 18, 40]],
        acid: [[3000, 330, 50], [2950, 22, 18], [1710, 22, 85], [1420, 15, 25], [1250, 25, 45], [930, 30, 30]] }[k] || [];
      const T = nu => 92 - PK.reduce((s, [c, w, d]) => s + d * Math.exp(-(((nu - c) / w) ** 2)), 0) - 2 * Math.sin(nu / 23) * (nu < 1500 ? 1 : 0);
      axes(g, -200, 115, 215, -125, '', '% transmittance'); lbw(g, 0, 160, 'wavenumber (cm⁻¹)', DK, 16);
      for (const nu of [4000, 3000, 2000, 1500, 1000, 500]) { still(g, `M${X(nu)} 115 v6`, DK, 2); lb(g, X(nu), 138, `${nu}`, DK, 13); }
      const a = []; for (let nu = 4000; nu >= 500; nu -= 5) a.push([X(nu), Yt(T(nu))]); line(g, pts(a), RED, 2.5);
      const tag = (nu, s, dy = 18) => lbw(g, X(nu), Yt(T(nu)) + dy, s, TXT.blue, 13);
      if (k === 'alcohol') tag(3350, 'O–H broad ~3300'); if (k === 'acid') lbw(g, X(3540), Yt(40), 'O–H very broad 3300–2500', TXT.blue, 12);
      lbw(g, X(2900), Yt(97) - 2, 'C–H ~2900', TXT.blue, 13);
      const side = (nu, s) => lbw(g, X(nu) + 8, Yt(T(nu)) + 4, s, TXT.blue, 13, 'start');
      if (k !== 'alcohol') side(1715, 'C=O sharp ~1715'); if (k === 'alcohol') side(1050, 'C–O ~1050'); if (k === 'acid') side(1250, 'C–O');
      still(g, `M${X(1500)} -112 H${X(500)}`, '#9aa0a8', 1.5); lbw(g, (X(1500) + X(500)) / 2, -118, 'fingerprint region', '#777', 12);
      lbw(g, 0, -140, { alcohol: 'alcohol (e.g. ethanol)', ketone: 'ketone (e.g. acetone)', acid: 'carboxylic acid (e.g. acetic acid)' }[k], TXT.blue, 16);
      if (t) lb(g, 0, -165, t, TXT.blue, 20);
      return g;
    },
    // "nmrspectrum cx cy width |text"
    nmrspectrum: ([cx, cy, W = 460], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 460, 0, p), X = d => 200 - d * 40, y0 = 100, U = 80, sp = .16;
      still(g, `M-205 ${y0} H210`, DK, 3);
      for (let d = 0; d <= 10; d++) { still(g, `M${X(d)} ${y0} v6`, DK, 2); if (d % 2 === 0 || d === 1) lb(g, X(d), y0 + 24, `${d}`, DK, 13); }
      lbw(g, 0, y0 + 48, 'chemical shift δ (ppm)', DK, 15);
      const multi = (c, rel, tot) => { const s = rel.reduce((a, b) => a + b, 0); rel.forEach((r, i) => { const x = X(c + (i - (rel.length - 1) / 2) * sp); still(g, `M${P(x, y0)} V${(y0 - U * tot * r / s).toFixed(1)}`, RED, 2.5); }); };
      multi(1.2, [1, 2, 1], 3); multi(3.7, [1, 3, 3, 1], 2); multi(2.6, [1], 1); multi(0, [1], .6);
      lbw(g, X(1.2), y0 - 170, 'CH₃ triplet', TXT.red, 14); lbw(g, X(1.2), y0 - 152, '3H', TXT.blue, 15);
      lbw(g, X(3.7), y0 - 100, 'CH₂ quartet', TXT.red, 14); lbw(g, X(3.7), y0 - 82, '2H', TXT.blue, 15);
      lbw(g, X(2.6), y0 - 130, 'OH singlet', TXT.red, 14); lbw(g, X(2.6), y0 - 112, '1H', TXT.blue, 15);
      lbw(g, X(0), y0 - 60, 'TMS', '#777', 13);
      lbw(g, -120, -110, 'ethanol CH₃CH₂OH', TXT.blue, 17); lbw(g, -120, -88, 'integration 3 : 2 : 1', '#555', 14); lbw(g, -120, -68, 'n neighbours → n + 1 peaks', '#555', 14);
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "massspec cx cy width k=generic|chlorine |text"
    massspec: ([cx, cy, W = 440], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 440, 0, p), cl = o.k === 'chlorine', mx = cl ? 60 : 65, X = m => -190 + (m - 10) * 380 / (mx - 10), Yb = a => 110 - a * 2.1;
      const B = cl ? [[15, 12], [35, 5], [37, 2], [47, 9], [49, 10], [50, 100], [51, 2], [52, 32]] : [[15, 6], [27, 37], [28, 32], [29, 44], [39, 12], [41, 27], [43, 100], [57, 3], [58, 12]];
      axes(g, -200, 110, 215, -130, 'm/z', 'relative abundance');
      for (const m of cl ? [10, 20, 30, 40, 50, 60] : [10, 20, 30, 40, 50, 60]) { still(g, `M${X(m)} 110 v6`, DK, 2); lb(g, X(m), 132, `${m}`, DK, 13); }
      for (const a of [50, 100]) lb(g, -206, Yb(a) + 5, `${a}`, DK, 12, 'end');
      for (const [m, a] of B) part(g, R(X(m) - 3, Yb(a), 6, a * 2.1), m === (cl ? 50 : 58) || (cl && m === 52) ? '#e04b3a' : '#5b86c8', DK, 1.5);
      if (cl) { lbw(g, X(50) - 8, Yb(100) - 8, 'M⁺ 50 (³⁵Cl)', TXT.red, 14, 'end'); lbw(g, X(52) + 8, Yb(32) - 6, 'M+2 52 (³⁷Cl)', TXT.red, 14, 'start');
        lbw(g, -70, -95, 'M : M+2 ≈ 3 : 1 → one Cl atom', TXT.blue, 15); lbw(g, X(15), Yb(12) - 8, 'CH₃⁺', '#555', 12); lbw(g, -70, -150, 'chloromethane CH₃Cl', DK, 16); }
      else { lbw(g, X(58), Yb(12) - 10, 'M⁺ 58', TXT.red, 14); lbw(g, X(43), Yb(100) - 8, 'base peak 43 (M − CH₃)', TXT.blue, 14); lbw(g, X(29), Yb(44) - 8, 'C₂H₅⁺', '#555', 12);
        lbw(g, 0, -150, 'butane C₄H₁₀: molecular ion and fragments', DK, 16); }
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "beerlambert cx cy width |text"
    beerlambert: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), yA = -110;
      part(g, C(-215, yA, 16), '#fff1a0', '#b58a10', 2.5); lbw(g, -215, yA + 40, 'light source', DK, 13);
      arrow(g, -190, yA, -105, yA, ORG, 3, true); lbw(g, -148, yA - 12, 'I₀', TXT.orange, 16);
      part(g, R(-95, yA - 40, 50, 80), '#f3d4e6', DK, 2.5); still(g, `M-95 ${yA - 55} V${yA - 40} M-45 ${yA - 55} V${yA - 40}`, DK, 2);
      arrow(g, -70, yA + 52, -95, yA + 52, '#777', 2); arrow(g, -70, yA + 52, -45, yA + 52, '#777', 2); lbw(g, -70, yA + 72, 'b (cm)', DK, 14); lbw(g, -70, yA - 62, 'cuvette, conc. c', DK, 13);
      arrow(g, -35, yA, 40, yA, ORG, 2, true); lbw(g, 2, yA - 12, 'I', TXT.orange, 16);
      part(g, R(50, yA - 25, 60, 50), '#c9ccd2', DK, 2.5); lbw(g, 80, yA + 45, 'detector', DK, 13);
      lbw(g, 190, yA - 5, 'A = εbc', TXT.red, 26); lbw(g, 190, yA + 20, 'A = log(I₀ / I)', TXT.red, 14);
      axes(g, -190, 150, 30, -20, 'concentration c', 'absorbance A'); still(g, 'M-190 150 L20 0', BLU, 3);
      for (const f of [.2, .4, .6, .8]) part(g, C(-190 + 210 * f, 150 - 150 * f, 4.5), DK, DK, 1);
      lbw(g, -40, 60, 'slope = εb', TXT.blue, 15, 'start');
      for (const [i, s] of ['ε molar absorptivity', 'b path length (cm)', 'c concentration (M)', 'straight line → find c', 'of an unknown'].entries()) lbw(g, 75, 40 + i * 22, s, i < 3 ? DK : '#555', 14, 'start');
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "functionalgroups cx cy width |text"
    functionalgroups: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), z = (i, dy = 0) => [-36 + 24 * i, (i % 2 ? -7 : 7) + dy];
      const A = (s, i) => [s, ...z(i)], up = i => ['O', z(i)[0], z(i)[1] - 26];
      const F = [
        ['alkene', 'C=C', [A('R', 0), A('', 1), A('', 2), A('R', 3)], [[0, 1, 1], [1, 2, 2], [2, 3, 1]]],
        ['alkyne', 'C≡C', [['R', -42, 0], ['', -16, 0], ['', 12, 0], ['R', 38, 0]], [[0, 1, 1], [1, 2, 3], [2, 3, 1]]],
        ['alcohol', 'R–OH', [A('R', 0), A('', 1), A('OH', 2)], [[0, 1, 1], [1, 2, 1]]],
        ['ether', 'R–O–R′', [A('R', 0), A('O', 1), A('R′', 2)], [[0, 1, 1], [1, 2, 1]]],
        ['aldehyde', 'R–CHO', [A('R', 0), A('', 1), A('H', 2), up(1)], [[0, 1, 1], [1, 2, 1], [1, 3, 2]]],
        ['ketone', 'R–CO–R′', [A('R', 0), A('', 1), A('R′', 2), up(1)], [[0, 1, 1], [1, 2, 1], [1, 3, 2]]],
        ['carboxylic acid', 'R–COOH', [A('R', 0), A('', 1), A('OH', 2), up(1)], [[0, 1, 1], [1, 2, 1], [1, 3, 2]]],
        ['ester', 'R–COO–R′', [A('R', 0), A('', 1), A('O', 2), A('R′', 3), up(1)], [[0, 1, 1], [1, 2, 1], [2, 3, 1], [1, 4, 2]]],
        ['amine', 'R–NH₂', [A('R', 0), A('', 1), A('NH₂', 2)], [[0, 1, 1], [1, 2, 1]]],
        ['amide', 'R–CONH₂', [A('R', 0), A('', 1), A('NH₂', 2), up(1)], [[0, 1, 1], [1, 2, 1], [1, 3, 2]]],
        ['haloalkane', 'R–X (X = F, Cl, Br, I)', [A('R', 0), A('', 1), A('X', 2)], [[0, 1, 1], [1, 2, 1]]],
        ['arene', 'Ar–R (benzene ring)', null, null],
      ];
      F.forEach(([nm, form, atoms, bonds], i) => { const x = -195 + (i % 4) * 130, y = -110 + Math.floor(i / 4) * 118;
        part(g, R(x - 62, y - 52, 124, 110), ['#fde3d6', '#dbe8f7', '#e3f1dc', '#efe2f5'][(i + Math.floor(i / 4)) % 4], '#b9c0c7', 1.5);
        const q = mk('g', { transform: `translate(${x} ${y - 14})` }, g);
        if (atoms) struct(q, atoms.map(a => [a[0], a[1] + 6, a[2] + 6]), bonds, 17);
        else { const h = Array.from({ length: 6 }, (_, j) => [-6 + 18 * Math.cos(rad(30 + 60 * j)), 6 + 18 * Math.sin(rad(30 + 60 * j))]);
          still(q, pts([...h, h[0]]), DK, 2.4); for (const j of [0, 2, 4]) { const a = h[j], b = h[j + 1], m = [-6, 6]; still(q, `M${P(a[0] + (m[0] - a[0]) * .22 + (b[0] - a[0]) * .15, a[1] + (m[1] - a[1]) * .22 + (b[1] - a[1]) * .15)} L${P(b[0] + (m[0] - b[0]) * .22 - (b[0] - a[0]) * .15, b[1] + (m[1] - b[1]) * .22 - (b[1] - a[1]) * .15)}`, DK, 2.2); }
          still(q, `M${P(h[5][0], h[5][1])} L${P(h[5][0] + 14, h[5][1] - 10)}`, DK, 2.4); lb(q, h[5][0] + 22, h[5][1] - 8, 'R', DK, 17); }
        lbw(g, x, y + 30, nm, DK, 15); lbw(g, x, y + 48, form, TXT.blue, form.length > 12 ? 11 : 13); });
      if (t) lb(g, 0, -180, t, TXT.blue, 20);
      return g;
    },
    // "sn2 cx cy width k=sn2|sn1|e2 |text"
    sn2: ([cx, cy, W = 520], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 520, 0, p), k = o.k || 'sn2', L = 36;
      // carbon at (x, y) with substituents [angle, p|w|d, text]
      const cen = (x, y, subs, sym = 'C') => { for (const [a, kind, s] of subs) { const ex = x + L * Math.cos(rad(a)), ey = y + L * Math.sin(rad(a));
          bondTo(g, x + 9 * Math.cos(rad(a)), y + 9 * Math.sin(rad(a)), ex - 8 * Math.cos(rad(a)), ey - 8 * Math.sin(rad(a)), kind);
          lb(g, ex + 6 * Math.cos(rad(a)), ey + 6 * Math.sin(rad(a)) + 6, s, DK, 15); }
        lb(g, x, y + 7, sym, DK, 19); };
      const Nu = (x, y, s = 'HO') => { lb(g, x, y + 7, s, TXT.blue, 19); lb(g, x + 20, y - 8, '⁻', TXT.blue, 19); dot(g, x - 4, y - 14, TXT.blue); dot(g, x + 4, y - 14, TXT.blue); };
      const Xbond = (x1, x2, y, partial) => partial ? dash(g, `M${x1} ${y} H${x2}`, DK, 2) : still(g, `M${x1} ${y} H${x2}`, DK, 3);
      const plus = (x, y) => lb(g, x, y + 6, '+', DK, 20);
      if (k === 'sn2') {
        Nu(-235, -60); cen(-150, -60, [[-115, 'p', 'H'], [125, 'w', 'R'], [168, 'd', 'R′']]); Xbond(-140, -112, -60, false); lb(g, -96, -53, 'Br', DK, 19);
        curly(g, -228, -78, -215, -110, -185, -100, -168, -70); curly(g, -126, -66, -120, -90, -106, -88, -98, -74);
        arrow(g, -65, -60, -30, -60, DK, 2.5);
        still(g, 'M-12 -115 h-8 V-5 h8 M200 -115 h8 V-5 h-8', DK, 2.5); lb(g, 218, -112, '‡', DK, 20, 'start');
        lb(g, 10, -53, 'HO', TXT.blue, 18); lb(g, 10, -80, 'δ−', TXT.red, 14); Xbond(32, 74, -60, true); cen(90, -60, [[-90, 'p', 'H'], [115, 'w', 'R'], [65, 'd', 'R′']]);
        Xbond(106, 148, -60, true); lb(g, 165, -53, 'Br', DK, 18); lb(g, 165, -80, 'δ−', TXT.red, 14);
        arrow(g, -230, 60, -195, 60, DK, 2.5); cen(-90, 60, [[-65, 'p', 'H'], [55, 'w', 'R'], [12, 'd', 'R′']]); still(g, 'M-102 60 H-130', DK, 3); lb(g, -150, 67, 'HO', TXT.blue, 19);
        lb(g, 10, 67, '+  Br⁻', DK, 19, 'start');
        lbw(g, 0, 130, 'one step: backside attack → inversion of configuration', TXT.red, 15); lbw(g, 0, 155, 'rate = k[R–Br][OH⁻]; fastest for methyl and 1°', '#555', 14);
      } else if (k === 'sn1') {
        cen(-200, -60, [[-115, 'p', 'R'], [125, 'w', 'R′'], [168, 'd', 'R″']]); Xbond(-190, -162, -60, false); lb(g, -146, -53, 'Br', DK, 19);
        curly(g, -176, -66, -170, -95, -152, -92, -146, -76); arrow(g, -110, -60, -70, -60, DK, 2.5); lbw(g, -90, -72, 'slow', '#777', 13);
        cen(10, -60, [[-90, 'p', 'R'], [150, 'p', 'R′'], [30, 'p', 'R″']]); lb(g, 26, -78, '+', TXT.red, 18); plus(85, -60); lb(g, 125, -53, 'Br⁻', DK, 19);
        lbw(g, 10, -5, 'planar carbocation', TXT.red, 14);
        Nu(-80, 60, 'Nu'); Nu(100, 60, 'Nu'); arrow(g, -60, 60, -25, 60, BLU, 2.5, true); arrow(g, 80, 60, 45, 60, BLU, 2.5, true); lb(g, 10, 66, 'C⁺', DK, 18);
        lbw(g, 10, 100, 'attack from either face → racemic mixture', TXT.red, 15);
        lbw(g, 0, 140, 'two steps; rate = k[R–Br]; fastest for 3° (stable C⁺)', '#555', 14);
      } else {
        Nu(-220, -95); still(g, 'M-50 -20 H5', DK, 3); lb(g, -60, -13, 'C', DK, 19); lb(g, 15, -13, 'C', DK, 19);
        still(g, 'M-60 -32 V-62', DK, 3); lb(g, -60, -70, 'H', DK, 17); still(g, 'M15 -6 V26', DK, 3); lb(g, 15, 46, 'Br', DK, 17);
        still(g, 'M-70 -14 L-95 -2', DK, 3); lb(g, -107, 4, 'R', DK, 15); still(g, 'M25 -24 L50 -36', DK, 3); lb(g, 62, -34, 'R', DK, 15);
        curly(g, -205, -100, -170, -125, -110, -100, -72, -78); curly(g, -54, -46, -30, -55, -18, -40, -22, -26); curly(g, 22, 10, 40, 20, 40, 34, 30, 40);
        lbw(g, -60, -110, 'β-H', TXT.red, 13); arrow(g, 95, -20, 135, -20, DK, 2.5);
        lb(g, 205, -13, 'R–CH=CH–R', DK, 17); lb(g, 205, 15, '+ H₂O + Br⁻', DK, 16);
        lbw(g, 0, 95, 'one step: base removes β-H as Br⁻ leaves', TXT.red, 15); lbw(g, 0, 120, 'H and Br anti-periplanar; rate = k[R–Br][base]', '#555', 14);
      }
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "crystalfield cx cy width k=oct|tet n=6 spin=high|low |text"
    crystalfield: ([cx, cy, W = 480], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 480, 0, p), tet = o.k === 'tet', n = Math.max(0, Math.min(10, +(o.n ?? 6))), low = !tet && o.spin === 'low', bw = 28;
      const [a, b] = tet ? [2, 3] : [3, 2], yLo = tet ? 45 : 60, yHi = tet ? -40 : -70;
      let lo, hi;
      if (low) { lo = hund(Math.min(n, 2 * a), a); hi = hund(Math.max(0, n - 2 * a), b); }
      else { const s = Math.min(n, 5), pr = Math.max(0, n - 5); lo = Array.from({ length: a }, (_, i) => (i < Math.min(s, a) ? 1 : 0) + (i < Math.min(pr, a) ? 1 : 0));
        hi = Array.from({ length: b }, (_, i) => (i < s - a ? 1 : 0) + (i < pr - a ? 1 : 0)); }
      for (let i = 0; i < 5; i++) obox(g, -225 + i * bw, 0, bw, 0); lbw(g, -155, 34, 'free ion: 5 equal d', DK, 14);
      const xs = 120, row = (m, y, occ) => { const x0 = xs - m * bw / 2; occ.forEach((e, i) => obox(g, x0 + i * bw, y, bw, e)); return x0; };
      const xl = row(a, yLo, lo), xh = row(b, yHi, hi);
      dash(g, `M-85 0 L${xl - 4} ${yLo} M-85 0 L${xh - 4} ${yHi}`, '#a0a6ad', 1.5); dash(g, `M-85 0 H${xs + 70}`, '#d0d4d8', 1.5);
      arrow(g, xs + 90, yLo, xs + 90, yHi + 2, RED, 2.5); arrow(g, xs + 90, yHi, xs + 90, yLo - 2, RED, 2.5); lbw(g, xs + 98, (yLo + yHi) / 2 + 6, tet ? 'Δt' : 'Δo', TXT.red, 18, 'start');
      lb(g, xs, yHi - 24, tet ? 't₂ (dxy, dxz, dyz)' : 'eg (dz², dx²−y²)', TXT.blue, 14); lb(g, xs, yLo + 36, tet ? 'e (dz², dx²−y²)' : 't₂g (dxy, dxz, dyz)', TXT.blue, 14);
      const unp = [...lo, ...hi].filter(v => v === 1).length;
      lbw(g, 0, 140, `${tet ? 'tetrahedral' : 'octahedral'} d${SUP(n)}, ${low ? 'low' : 'high'} spin: ${unp} unpaired`, DK, 16);
      lbw(g, 0, 164, tet ? 'Δt ≈ 4/9 Δo, small → always high spin' : low ? 'strong-field ligands: Δo > pairing energy' : 'weak-field ligands: Δo < pairing energy', '#555', 14);
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "rateorder cx cy width k=all|zero|first|second |text"
    rateorder: ([cx, cy, W = 500], o, t, p) => {
      SHOW = showLab(o);
      const g = G(cx, cy, W / 500, 0, p), k = o.k || 'all';
      const D = { zero: ['[A]', -1, 'slope = −k', '[A] = [A]₀ − kt', 'zero order', 't½ = [A]₀ / 2k'], first: ['ln[A]', -1, 'slope = −k', 'ln[A] = ln[A]₀ − kt', 'first order', 't½ = 0.693 / k'],
        second: ['1/[A]', 1, 'slope = +k', '1/[A] = 1/[A]₀ + kt', 'second order', 't½ = 1 / k[A]₀'] };
      const one = (x, y, w, h, key, big) => { const [yl, s, sl, eq, nm, half] = D[key];
        axes(g, x - w / 2, y + h / 2, x + w / 2, y - h / 2, 't', yl);
        const ya = s < 0 ? y - h * .3 : y + h * .3, yb = s < 0 ? y + h * .35 : y - h * .35; line(g, `M${x - w / 2} ${ya} L${x + w * .4} ${yb}`, [RED, BLU, GRN][Object.keys(D).indexOf(key)], 3);
        for (const f of [.15, .4, .65]) part(g, C(x - w / 2 + (w * .9) * f, ya + (yb - ya) * f, 3.5), DK, DK, 1);
        lbw(g, x + w * (s < 0 ? .05 : .1), (ya + yb) / 2 + (s < 0 ? -12 : 30), sl, DK, big ? 16 : 13, 'start');
        lbw(g, x, y - h / 2 - 26, nm, TXT.blue, big ? 20 : 16); lbw(g, x, y + h / 2 + 48, eq, TXT.red, big ? 18 : 13); if (big) lbw(g, x, y + h / 2 + 72, half, '#555', 15); };
      if (D[k]) one(0, -10, 300, 200, k, true);
      else ['zero', 'first', 'second'].forEach((key, i) => one(-170 + i * 170, -10, 130, 150, key, false));
      if (!D[k]) lbw(g, 0, 140, 'the plot that gives a straight line shows the order', '#555', 14);
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
  });
})();
