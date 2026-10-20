// Whiteboard library — physgr: physics majors and graduate level (founder, 19 Oct 2026).
// Classical mechanics, fluids, Fourier, E&M, statistical mechanics, quantum, particle, condensed matter, astro, nuclear.
// Catalogue: physgr.txt. Same helpers and look as physadv.js. Notation as in Goldstein, Griffiths, Jackson, Sakurai, Kittel.
(() => {
  const DK = '#33363b', RED = '#c0392b', BLU = '#2b6cc4', RAY = '#e0802a', GLE = '#4f93d6', GRN = '#2c6a22', VIO = '#7a4ab0', GRY = '#8a9098';
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
  const lb = (g, x, y, t, c = TXT.blue, s = 18, a = 'middle') => label(g, x, y, t, c, s, a);
  const showLab = o => o.lab !== '0' && o.labels !== '0';   // lab=0 hides the drawing's own words
  const curve = (f, x0, x1, n = 160) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? ' L' : 'M') + P(x, f(x)); } return d; };
  const pts = a => 'M' + a.map(p => P(p[0], p[1])).join(' L');
  const axes = (g, x0, y0, x1, y1, xl, yl) => { still(g, `M${x0} ${y1} V${y0} H${x1}`, DK, 3); tip(g, x0, y1, x0, y1 + 10, DK, 3); tip(g, x1, y0, x1 - 10, y0, DK, 3);
    if (xl) lb(g, x1, y0 + 26, xl, DK, 17, 'end'); if (yl) lb(g, x0 + 8, y1 + 4, yl, DK, 17, 'start'); };
  const wavy = (g, x1, y1, x2, y2, c = VIO, waves = 5, A = 7, bare = false) => { const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, a = [];
    for (let i = 0; i <= 100; i++) { const s = i / 100, w = A * Math.sin(s * waves * 2 * Math.PI) * (bare || s < .9 ? 1 : (1 - s) * 10); a.push([x1 + ux * L * s - uy * w, y1 + uy * L * s + ux * w]); }
    line(g, pts(a), c, 2.5); if (!bare) tip(g, x2, y2, x2 - ux * 10, y2 - uy * 10, c, 2.5); };
  // a label with a superscript (Kalam has no ⁻ glyph): base then a small raised part
  const sup = (g, x, y, base, sp, c = DK, s = 18, a = 'middle') => { const wb = .5 * s * [...base].length, ws = .36 * s * [...sp].length, x0 = a === 'end' ? x - wb - ws : a === 'start' ? x : x - (wb + ws) / 2;
    lb(g, x0, y, base, c, s, 'start'); lb(g, x0 + wb, y - s * .42, sp, c, s * .68, 'start'); };
  // rich label: x_1  x_{ij}  e^{−E_i/kT} (nests)  `x ẋ  ``x ẍ — drawn as raised / lowered tspans (the hand font has few sub/superscript glyphs)
  const rt = (g, x, y, str, c = DK, s = 18, a = 'middle') => {
    const e = lb(g, x, y, '', c, s, a); let dy = 0, dx = 0;
    const add = (txt, fs, ddx = 0, ddy = 0) => { const sp = mk('tspan', { 'font-size': fs.toFixed(1), dx: (dx + ddx).toFixed(1), dy: (dy + ddy).toFixed(1) }, e); sp.textContent = txt; dy = 0; dx = 0; return sp; };
    const run = (str, fs) => { const ch = [...str]; let buf = '', i = 0; const flush = () => { if (buf) add(buf, fs); buf = ''; };
      while (i < ch.length) { const c0 = ch[i];
        if ((c0 === '_' || c0 === '^') && i + 1 < ch.length) { flush(); let body;
          if (ch[i + 1] === '{') { let j = i + 2, dep = 1; for (; j < ch.length; j++) { if (ch[j] === '{') dep++; if (ch[j] === '}' && !--dep) break; } body = ch.slice(i + 2, j).join(''); i = j + 1; }
          else { body = ch[i + 1]; i += 2; }
          const d = c0 === '^' ? -fs * .42 : fs * .24; dy += d; run(body, fs * .66); dy -= d; }
        else if (c0 === '`') { flush(); let n = 0; while (ch[i] === '`') { n++; i++; }  // time derivative: letter in a local serif font, dot(s) centred over it
          const ser = "'Times New Roman', Times, serif", b = add(ch[i], fs * 1.08), up = /[θbdfhklt]/.test(ch[i]) ? fs * .3 : 0; b.setAttribute('font-family', ser); i++;
          const dd = add(n > 1 ? '¨' : '˙', fs * 1.08, 0, -up); dd.setAttribute('font-family', ser);
          const w = b.getComputedTextLength() || fs * .54, d = dd.getComputedTextLength() || fs * .36; dd.setAttribute('dx', (-(w + d) / 2).toFixed(1)); dx += (w - d) / 2; dy += up; }
        else { buf += c0; i++; } }
      flush(); };
    run(str, s); return e; };
  const legend = (g, x, y, rows, s = 15) => rows.forEach(([c, txt, d], i) => { still(g, `M${x} ${y + i * 22} h26`, c, 3.5, d ? { 'stroke-dasharray': d } : {}); rt(g, x + 34, y + i * 22 + 5, txt, c, s, 'start'); });
  const box = (g, x, y, w, h, c = RED) => still(g, R(x, y, w, h), c, 1.8);
  const polar = (x, y, r, deg) => [x + r * Math.cos(rad(deg)), y - r * Math.sin(rad(deg))];
  const arcD = (x, y, r, a0, a1, n = 40) => pts(Array.from({ length: n + 1 }, (_, i) => polar(x, y, r, a0 + (a1 - a0) * i / n)));
  const rng = seed => () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const ket = s => `|${s}⟩`;

  Object.assign(window.RECIPES, {
    // "doublependulum cx cy width k=still|chaos |text"
    doublependulum: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), px = 0, py = -168, l1 = 80, l2 = 72, t1 = rad(30), t2 = rad(52);
      const x1 = px + l1 * Math.sin(t1), y1 = py + l1 * Math.cos(t1), x2 = x1 + l2 * Math.sin(t2), y2 = y1 + l2 * Math.cos(t2);
      if (o.k === 'chaos') { // RK4 of the full equations of motion, equal masses, lengths as drawn
        let s = [rad(105), rad(-30), 0, 0]; const L1 = l1 / 80, L2 = l2 / 80, gg = 9.81, dt = .004, q = [];
        const f = ([a, b, w1, w2]) => { const d = a - b, den = 3 - Math.cos(2 * d);
          return [w1, w2, (-gg * 3 * Math.sin(a) - gg * Math.sin(a - 2 * b) - 2 * Math.sin(d) * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) / (L1 * den),
            2 * Math.sin(d) * (w1 * w1 * L1 * 2 + gg * 2 * Math.cos(a) + w2 * w2 * L2 * Math.cos(d)) / (L2 * den)]; };
        for (let i = 0; i < 4500; i++) { const k1 = f(s), k2 = f(s.map((v, j) => v + dt / 2 * k1[j])), k3 = f(s.map((v, j) => v + dt / 2 * k2[j])), k4 = f(s.map((v, j) => v + dt * k3[j]));
          s = s.map((v, j) => v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); if (i % 3 === 0) q.push([px + l1 * Math.sin(s[0]) + l2 * Math.sin(s[1]), py + l1 * Math.cos(s[0]) + l2 * Math.cos(s[1])]); }
        line(g, pts(q), VIO, 1.2, { opacity: .25 });
        showLab(o) && lb(g, -150, -40, 'lower bob path', VIO, 14); showLab(o) && lb(g, -150, -22, '(chaotic)', VIO, 14);
      }
      still(g, `M${px - 40} ${py} H${px + 40}` + [-32, -16, 0, 16, 32].map(x => ` M${px + x} ${py} l-10 -10`).join(''), DK, 3);
      dash(g, `M${px} ${py} V${py + 74} M${P(x1, y1)} V${(y1 + 66).toFixed(1)}`, GRY, 1.6);
      still(g, `M${px} ${py} L${P(x1, y1)} L${P(x2, y2)}`, DK, 3);
      const ang = (x, y, r, th, c) => still(g, pts(Array.from({ length: 21 }, (_, i) => [x + r * Math.sin(th * i / 20), y + r * Math.cos(th * i / 20)])), c, 2);
      ang(px, py, 40, t1, RED); ang(x1, y1, 34, t2, RED);
      showLab(o) && rt(g, px + 52 * Math.sin(t1 / 2) + 2, py + 52 * Math.cos(t1 / 2) + 10, 'θ_1', TXT.red, 17, 'start');
      showLab(o) && rt(g, x1 + 44 * Math.sin(t2 / 2) + 2, y1 + 44 * Math.cos(t2 / 2) + 10, 'θ_2', TXT.red, 17, 'start');
      showLab(o) && rt(g, (px + x1) / 2 + 10, (py + y1) / 2 - 2, 'l_1', DK, 17, 'start'); showLab(o) && rt(g, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8, 'l_2', DK, 17, 'start');
      part(g, C(x1, y1, 12), '#7fb7ea', '#1f3f7a', 2.5); part(g, C(x2, y2, 14), '#e04b3a', '#7a1f1f', 2.5);
      showLab(o) && rt(g, x1 + 16, y1 - 6, 'm_1', DK, 17, 'start'); showLab(o) && rt(g, x2 + 18, y2 + 6, 'm_2', DK, 17, 'start');
      showLab(o) && rt(g, 150, -150, 'generalized', DK, 15); showLab(o) && rt(g, 150, -130, 'coordinates', DK, 15); showLab(o) && rt(g, 150, -104, 'q = (θ_1, θ_2)', TXT.red, 18);
      showLab(o) && rt(g, 0, 18, 'L = T − V', TXT.blue, 20);
      showLab(o) && rt(g, 0, 48, 'T = ½(m_1+m_2)l_1^2`θ_1^2 + ½m_2l_2^2`θ_2^2 + m_2l_1l_2`θ_1`θ_2 cos(θ_1 − θ_2)', DK, 15);
      showLab(o) && rt(g, 0, 76, 'V = −(m_1+m_2)g l_1cos θ_1 − m_2g l_2cos θ_2', DK, 15);
      showLab(o) && rt(g, 0, 116, 'd/dt (∂L/∂`q_i) − ∂L/∂q_i = 0', TXT.red, 20); showLab(o) && box(g, -130, 92, 260, 34);
      showLab(o) && lb(g, 0, 152, 'Euler–Lagrange: two coupled nonlinear ODEs', '#777', 14);
      if (t) lb(g, 0, -192, t, TXT.blue, 20);
      return g;
    },
    // "phasespace cx cy width k=sho|pendulum|damped |text"
    phasespace: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), k = o.k || 'sho';
      const flow = (q, i, c) => tip(g, q[i][0], q[i][1], q[i - 2][0], q[i - 2][1], c, 2.5);
      still(g, 'M-215 0 H212', DK, 2.5); tip(g, 214, 0, 204, 0, DK, 2.5); still(g, 'M0 142 V-140', DK, 2.5); tip(g, 0, -142, 0, -132, DK, 2.5);
      if (k === 'pendulum') {
        const th1 = 1.25 * Math.PI, sx = 205 / th1, sp = 42, X = th => th * sx, Y = pp => -pp * sp;
        showLab(o) && rt(g, 210, 24, 'θ', DK, 18, 'end'); showLab(o) && rt(g, 8, -128, 'p_θ', DK, 18, 'start');
        for (const E of [-.65, -.15, .45]) { const m = Math.acos(-E), q = [];
          for (let i = 0; i <= 80; i++) { const th = -m + 2 * m * i / 80; q.push([X(th), Y(Math.sqrt(Math.max(0, 2 * (E + Math.cos(th)))))]); }
          for (let i = 80; i >= 0; i--) { const th = -m + 2 * m * i / 80; q.push([X(th), -Y(Math.sqrt(Math.max(0, 2 * (E + Math.cos(th)))))]); }
          line(g, pts(q) + ' Z', BLU, 2.5); flow(q, 40, BLU); flow(q, 121, BLU); }
        for (const s of [1, -1]) line(g, curve(x => Y(s * 2 * Math.cos(x / sx / 2)), -205, 205, 120), RED, 3);
        for (const E of [1.7, 2.8]) for (const s of [1, -1]) { const q = []; for (let i = 0; i <= 100; i++) { const x = s * (-205 + 4.1 * i); q.push([x, Y(s * Math.sqrt(2 * (E + Math.cos(x / sx))))]); }
          line(g, pts(q), GRN, 2.5); flow(q, 60, GRN); }
        for (const s of [-1, 1]) { part(g, C(X(s * Math.PI), 0, 5), '#fff', RED, 2); lb(g, X(s * Math.PI), 22, s < 0 ? '−π' : 'π', DK, 15); }
        part(g, C(0, 0, 4), DK, DK, 1);
        showLab(o) && legend(g, -205, 162, [[BLU, 'librations (closed)']], 14); showLab(o) && legend(g, -40, 162, [[RED, 'separatrix']], 14); showLab(o) && legend(g, 90, 162, [[GRN, 'rotations (open)']], 14);
        showLab(o) && rt(g, 0, 196, 'H = p_θ^2/2ml^2 − mgl cos θ;   saddles at θ = ±π (unstable)', TXT.blue, 15);
      } else if (k === 'damped') {
        showLab(o) && rt(g, 210, 24, 'x', DK, 18, 'end'); showLab(o) && rt(g, 8, -128, 'p', DK, 18, 'start');
        const gm = .1, q = []; for (let i = 0; i <= 700; i++) { const s = i * .05, e = Math.exp(-gm * s); q.push([195 * e * Math.cos(s), 120 * e * (Math.sin(s) + gm * Math.cos(s))]); }
        line(g, pts(q), BLU, 2.6); for (const i of [30, 95, 155, 220, 285, 345]) flow(q, i, BLU);
        part(g, C(0, 0, 5), RED, RED, 1); showLab(o) && lb(g, 10, 24, 'stable focus', TXT.red, 14, 'start');
        part(g, C(q[0][0], q[0][1], 4), DK, DK, 1); showLab(o) && lb(g, q[0][0] - 10, q[0][1] + 20, 'start', '#777', 13, 'end');
        showLab(o) && rt(g, 0, 172, 'm``x + b`x + kx = 0:  energy lost each turn,', TXT.blue, 16); showLab(o) && rt(g, 0, 196, 'the orbit spirals into the fixed point (an attractor)', TXT.blue, 16);
      } else {
        showLab(o) && rt(g, 210, 24, 'x', DK, 18, 'end'); showLab(o) && rt(g, 8, -128, 'p', DK, 18, 'start');
        const cols = [BLU, GRN, VIO, RED];
        [48, 92, 136, 180].forEach((a, i) => { const b = a * .64, q = []; for (let j = 0; j <= 80; j++) { const s = Math.PI - j * 2 * Math.PI / 80; q.push([a * Math.cos(s), -b * Math.sin(s)]); }
          line(g, pts(q) + ' Z', cols[i], 2.5); flow(q, 22, cols[i]); flow(q, 62, cols[i]); });
        part(g, C(0, 0, 4), DK, DK, 1); showLab(o) && rt(g, 136, -98, 'E_1 < E_2 < …', '#777', 14, 'start');
        showLab(o) && rt(g, 0, 172, 'H = p^2/2m + ½mω^2x^2 = E:  ellipses of constant energy', TXT.blue, 16);
        showLab(o) && rt(g, 0, 196, 'clockwise, one period T = 2π/ω on every orbit', '#777', 14);
      }
      if (t) lb(g, 0, -162, t, TXT.blue, 20);
      return g;
    },
    // "normalmodes cx cy width |text"
    normalmodes: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), zz = (x0, x1, y) => { let d = `M${x0} ${y} h10`; const n = 8, s = (x1 - x0 - 20) / n; for (let i = 0; i < n; i++) d += ` L${P(x0 + 10 + s * (i + .5), y + (i % 2 ? 9 : -9))}`; return d + ` L${x1 - 10} ${y} H${x1}`; };
      const row = (y, anti, title, sub, note) => {
        for (const s of [-1, 1]) still(g, `M${s * 225} ${y - 30} V${y + 30}` + [-24, -12, 0, 12, 24].map(d => ` M${s * 225} ${y + d} l${s * 10} -8`).join(''), DK, 3);
        for (const [a, b] of [[-225, -100], [-50, 50], [100, 225]]) still(g, zz(a, b, y), GRY, 2.5);
        for (const x of [-75, 75]) { part(g, R(x - 25, y - 22, 50, 44), anti && x > 0 ? '#f6c4b4' : '#cfe0f5', DK, 2.5); showLab(o) && lb(g, x, y + 7, 'm', DK, 18); }
        for (const x of [-162, 0, 162]) showLab(o) && lb(g, x, y - 16, 'k', '#666', 15);
        arrow(g, -100, y - 36, -50, y - 36, RED, 3, true); anti ? arrow(g, 100, y - 36, 50, y - 36, RED, 3, true) : arrow(g, 50, y - 36, 100, y - 36, RED, 3, true);
        showLab(o) && rt(g, 0, y - 62, title, TXT.blue, 18); showLab(o) && rt(g, 0, y + 46, note, '#777', 14); return sub; };
      row(-68, false, 'symmetric, in phase:  ω_1 = √(k/m)', 0, 'middle spring never stretches');
      row(96, true, 'antisymmetric, out of phase:  ω_2 = √(3k/m)', 0, 'middle spring stretched twice as much');
      showLab(o) && rt(g, 0, 178, 'normal coordinates  q_± = (x_1 ± x_2)/√2;  any motion is a sum of the two', DK, 15);
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "gyroscope cx cy size |text"
    gyroscope: ([cx, cy, S = 460], o, t, p) => {
      const g = G(cx, cy, S / 460, 0, p), Px = 20, Py = 130, ce = -112, Rp = 137, ry = 30, k = ry / Rp;
      const tipx = Px + Rp * Math.cos(rad(30)), tipy = ce + ry * .5, ux0 = tipx - Px, uy0 = tipy - Py, Lr = Math.hypot(ux0, uy0), ux = ux0 / Lr, uy = uy0 / Lr;
      const at = s => [Px + s * ux, Py + s * uy], ang = Math.atan2(uy, ux) * 180 / Math.PI + 90, [cmx, cmy] = at(118);
      still(g, `M${Px - 70} ${Py} H${Px + 70}` + [-56, -36, -16, 4, 24, 44, 64].map(x => ` M${Px + x} ${Py} l-10 10`).join(''), DK, 3);
      dash(g, `M${Px} ${Py} V-200`, GRY, 1.8); still(g, E(Px, ce, Rp, ry), GRY, 1.8, { 'stroke-dasharray': '6 7' });
      { const a = rad(-150), x = Px + Rp * Math.cos(a), y = ce - ry * Math.sin(a), tx = -Math.sin(a), ty = -k * Math.cos(a); tip(g, x, y, x - tx * 12, y - ty * 12 * Rp / Rp, GRY, 2.5); }
      still(g, `M${Px} ${Py} L${P(...at(150))}`, DK, 4);
      const dk = mk('g', { transform: `translate(${P(cmx, cmy)}) rotate(${ang.toFixed(1)})` }, g); part(dk, E(0, 0, 58, 15), '#e0c08a', '#8a6a30', 2.5);
      arrow(g, ...at(150), tipx, tipy, RED, 4); showLab(o) && lb(g, tipx - 10, tipy - 10, 'L', TXT.red, 22, 'end');
      { const [sx, sy] = at(196), sp = mk('g', { transform: `translate(${P(sx, sy)}) rotate(${ang.toFixed(1)})` }, g), q = [];
        for (let i = 0; i <= 30; i++) { const a = rad(200 + i * 5.5); q.push([18 * Math.cos(a), -6 * Math.sin(a)]); }
        still(sp, pts(q), GRN, 2.2); tip(sp, q[30][0], q[30][1], q[27][0], q[27][1], GRN, 2.2); showLab(o) && lb(g, sx - 26, sy + 2, 'ω', TXT.green, 18, 'end'); }
      const tx = .5, ty = -k * .866, tm = Math.hypot(tx, ty); arrow(g, tipx, tipy, tipx + 70 * tx / tm, tipy + 70 * ty / tm, VIO, 3.5);
      showLab(o) && lb(g, tipx + 72 * tx / tm + 6, tipy + 72 * ty / tm, 'τ = dL/dt', VIO, 17, 'start');
      arrow(g, cmx, cmy, cmx, cmy + 70, GRN, 3.5); showLab(o) && lb(g, cmx + 8, cmy + 64, 'mg', TXT.green, 18, 'start');
      part(g, C(cmx, cmy, 4), DK, DK, 1); showLab(o) && lb(g, (Px + cmx) / 2 - 10, (Py + cmy) / 2 + 8, 'r', DK, 19, 'end'); part(g, C(Px, Py, 4.5), DK, DK, 1);
      arrow(g, Px, -150, Px, -196, BLU, 3.5); still(g, `M${Px - 20} -168 A20 6 0 0 0 ${Px + 20} -168`, BLU, 2.2); tip(g, Px + 20, -168, Px + 13, -163, BLU, 2.2); showLab(o) && lb(g, Px - 12, -182, 'Ω', TXT.blue, 20, 'end');
      showLab(o) && lb(g, Px + 30, -190, 'precession about the vertical', '#777', 13, 'start');
      showLab(o) && rt(g, -235, -20, 'L = Iω  along the axle', DK, 16, 'start'); showLab(o) && rt(g, -235, 8, 'τ = r × mg  (horizontal)', DK, 16, 'start');
      showLab(o) && rt(g, -235, 36, 'dL = τ dt ⊥ L: L swings', DK, 16, 'start'); showLab(o) && rt(g, -235, 58, 'round, |L| unchanged', DK, 16, 'start');
      showLab(o) && rt(g, -170, 106, 'Ω = mgr / (Iω)', TXT.red, 21); showLab(o) && box(g, -235, 82, 130, 34);
      if (t) lb(g, 0, -215, t, TXT.blue, 20);
      return g;
    },
    // "laminar cx cy width k=laminar|turbulent|boundary |text"
    laminar: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), k = o.k || 'laminar', Rr = 70, x0 = -40;
      if (k === 'boundary') {
        const d = x => 5 * Math.sqrt(Math.max(0, x + 150)), yp = 60;
        fl(g, R(-150, yp, 380, 14), '#c9ccd2'); still(g, `M-150 ${yp} H230 M-150 ${yp + 14} H230 M-150 ${yp} V${yp + 14}`, DK, 3);
        for (let y = -110; y <= 40; y += 30) arrow(g, -232, y, -180, y, GRN, 2.5);
        showLab(o) && lb(g, -206, -122, 'U∞', TXT.green, 18);
        for (const y0 of [-100, -60, -20, 20, 44]) line(g, curve(x => { const dd = d(x); return y0 - (x > -150 ? Math.min(1, (yp - y0) / Math.max(dd, 1)) * .34 * dd * Math.min(1, (yp - y0) / 40) : 0); }, -170, 230, 100), '#5b9bd5', 1.8, { opacity: .8 });
        dash(g, curve(x => yp - d(x), -150, 230, 80), RED, 2.2); showLab(o) && lb(g, 236, yp - d(230) + 4, 'δ(x)', TXT.red, 17, 'start');
        for (const xs of [-40, 140]) { const dd = d(xs); still(g, `M${xs} ${yp} V${yp - dd - 26}`, DK, 1.5);
          for (let h = 8; h <= dd + 20; h += 12) { const e = Math.min(1, h / dd), u = 2 * e - e * e, L = 64 * u; if (L > 6) arrow(g, xs, yp - h, xs + L, yp - h, BLU, 2); }
          still(g, pts(Array.from({ length: 31 }, (_, i) => { const h = (dd + 20) * i / 30, e = Math.min(1, h / dd); return [xs + 64 * (2 * e - e * e), yp - h]; })), RED, 2); }
        showLab(o) && rt(g, -150, yp + 34, 'leading edge', '#777', 13); showLab(o) && rt(g, 60, yp + 34, 'no slip: u = 0 at the plate', TXT.red, 14);
        showLab(o) && rt(g, 0, 134, 'boundary layer thickens downstream:  δ(x) ≈ 5x/√(Re_x)', TXT.blue, 16);
        showLab(o) && rt(g, 0, 160, 'Re_x = ρUx/μ;  in general Re = ρvL/μ (inertia / viscosity)', DK, 15);
      } else {
        const turb = k === 'turbulent';
        fl(g, R(-220, -Rr, 440, 2 * Rr), '#e3f0fb'); still(g, `M-220 ${-Rr} H220 M-220 ${Rr} H220`, DK, 4);
        for (const s of [-1, 1]) still(g, Array.from({ length: 22 }, (_, i) => `M${-214 + i * 20} ${s * Rr} l8 ${s * 9}`).join(' '), GRY, 1.5);
        const prof = y => turb ? Math.pow(Math.max(0, 1 - Math.abs(y) / Rr), 1 / 7) : 1 - (y * y) / (Rr * Rr), U = 150;
        if (turb) { for (const [ex, ey, s] of [[140, -38, 1], [190, -12, .9], [150, 30, .8], [205, 40, 1], [200, -48, .7]]) { const q = []; for (let j = 0; j <= 40; j++) { const a = j * .38, rr = (2 + j * .45) * s; q.push([ex + rr * Math.cos(a), ey + rr * Math.sin(a)]); } line(g, pts(q), '#5b9bd5', 1.8); }
          for (const y0 of [-48, -16, 16, 48]) { const r2 = rng(y0 + 100); line(g, curve(x => y0 + 6 * Math.sin(x / 17 + r2() * 6) + 4 * Math.sin(x / 7), -215, -70, 50), '#5b9bd5', 1.8, { opacity: .8 }); } }
        else for (let y = -56; y <= 56; y += 14) line(g, `M-215 ${y} H215`, '#5b9bd5', 1.6, { opacity: .7, 'stroke-dasharray': '10 8' });
        still(g, `M${x0} ${-Rr} V${Rr}`, DK, 1.8);
        for (let y = -60; y <= 60; y += 12) { const L = U * prof(y); if (L > 8) arrow(g, x0, y, x0 + L, y, BLU, 2.2); }
        still(g, pts(Array.from({ length: 61 }, (_, i) => { const y = -Rr + 2 * Rr * i / 60; return [x0 + U * prof(y), y]; })), RED, 2.5);
        showLab(o) && lb(g, -200, -Rr - 10, turb ? 'turbulent flow' : 'laminar flow', turb ? TXT.red : TXT.blue, 17, 'start');
        showLab(o) && rt(g, x0 + U + 6, -6, 'u_{max}', TXT.red, 15, 'start');
        if (turb) { showLab(o) && rt(g, 0, 104, 'flat core, steep near the walls:  u ≈ u_{max}(1 − r/R)^{1/7}', TXT.red, 16);
          showLab(o) && rt(g, 0, 130, 'eddies mix momentum across the pipe', DK, 15); showLab(o) && rt(g, 0, 156, 'Re = ρvL/μ ≳ 4000 (L = pipe diameter): turbulent', TXT.blue, 16); }
        else { showLab(o) && rt(g, 0, 104, 'parabolic profile:  u(r) = u_{max}(1 − r^2/R^2)', TXT.red, 16);
          showLab(o) && rt(g, 0, 130, 'Poiseuille:  Q = πR^4ΔP / (8μL)', DK, 16); showLab(o) && rt(g, 0, 156, 'Re = ρvL/μ ≲ 2000 (L = pipe diameter): laminar', TXT.blue, 16); }
      }
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "fourier cx cy width k=series|transform |text"
    fourier: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p);
      if (o.k === 'transform') {
        const row = (y, st, note) => { const sw = 540 / st, gs = (x, s) => Math.exp(-x * x / (2 * s * s));
          for (const [c0, s, col] of [[-125, st, BLU], [125, sw, RED]]) { still(g, `M${c0 - 100} ${y + 34} H${c0 + 100}`, DK, 2.5); still(g, `M${c0} ${y + 40} V${y - 44}`, GRY, 1.5);
            fl(g, curve(x => y + 34 - 70 * gs(x - c0, s), c0 - 100, c0 + 100) + ` L${c0 + 100} ${y + 34} L${c0 - 100} ${y + 34} Z`, col === BLU ? '#d6e6f7' : '#f8d7d2');
            line(g, curve(x => y + 34 - 70 * gs(x - c0, s), c0 - 100, c0 + 100), col, 3); }
          still(g, `M-20 ${y} H20`, DK, 2.5); tip(g, 22, y, 12, y, DK, 2.5); tip(g, -22, y, -12, y, DK, 2.5); showLab(o) && lb(g, 0, y - 10, 'F', DK, 16);
          showLab(o) && lb(g, 0, y + 58, note, '#777', 14); };
        showLab(o) && lb(g, -125, -150, 'signal f(t)', TXT.blue, 17); showLab(o) && lb(g, 125, -150, 'spectrum |F(ω)|', TXT.red, 17);
        row(-90, 46, 'wide pulse ↔ narrow spectrum'); row(40, 11, 'narrow pulse ↔ wide spectrum');
        showLab(o) && rt(g, 0, 128, 'F(ω) = ∫ f(t) e^{−iωt} dt', TXT.blue, 17); showLab(o) && rt(g, 0, 156, 'Gaussian ↔ Gaussian:  e^{−t²/2σ²}  ↔  e^{−σ²ω²/2}', TXT.blue, 17);
        showLab(o) && rt(g, 0, 186, 'Δt · Δω ≥ ½  (equality only for a Gaussian)', TXT.red, 17);
      } else {
        const X = s => -225 + s * 450 / (3 * Math.PI), Y = f => -84 - 52 * f, S = (s, n) => { let v = 0; for (let m = 1; m <= n; m += 2) v += Math.sin(m * s) / m; return 4 / Math.PI * v; };
        still(g, 'M-228 -84 H226', DK, 2); showLab(o) && lb(g, 224, -64, 't', DK, 16, 'end');
        dash(g, curve(x => { const s = (x + 225) * 3 * Math.PI / 450, ph = s % (2 * Math.PI); return Y(ph < Math.PI ? 1 : -1); }, -224.5, 224.5, 900), GRY, 2);
        [[1, BLU, 2.4], [3, GRN, 2.4], [5, RED, 3]].forEach(([n, c, w]) => line(g, curve(x => Y(S((x + 225) * 3 * Math.PI / 450, n)), -225, 225, 300), c, w));
        showLab(o) && lb(g, X(Math.PI / 5), -152, 'Gibbs overshoot ≈ 9%', '#777', 13, 'start');
        showLab(o) && legend(g, -215, -2, [[BLU, 'n = 1']], 14); showLab(o) && legend(g, -95, -2, [[GRN, '1 + 3']], 14); showLab(o) && legend(g, 25, -2, [[RED, '1 + 3 + 5']], 14); showLab(o) && legend(g, 150, -2, [[GRY, 'square', '6 6']], 14);
        axes(g, -215, 146, -20, 30); showLab(o) && rt(g, -207, 34, 'b_n', DK, 17, 'start'); showLab(o) && lb(g, -14, 152, 'n', DK, 16, 'start'); const bx = n => -215 + n * 22;
        [[1, '1'], [3, '1/3'], [5, '1/5'], [7, '1/7']].forEach(([n, s]) => { const h = 92 / n; part(g, R(bx(n) - 6, 146 - h, 12, h), '#f6c4b4', RED, 2); lb(g, bx(n), 140 - h, s, TXT.red, 13); lb(g, bx(n), 166, String(n), DK, 13); });
        showLab(o) && rt(g, 115, 64, 'odd harmonics only', DK, 15); showLab(o) && rt(g, 115, 94, 'f(t) = (4/π) Σ_{n odd} sin(nωt) / n', TXT.blue, 17);
        showLab(o) && rt(g, 115, 124, '= (4/π)[sin ωt + (1/3)sin 3ωt', TXT.blue, 15); showLab(o) && rt(g, 115, 146, '+ (1/5)sin 5ωt + …]', TXT.blue, 15);
      }
      if (t) lb(g, 0, -178, t, TXT.blue, 20);
      return g;
    },
    // "multipole cx cy width |text"
    multipole: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), bx = 74;
      const field = (Q, x, y) => { let ex = 0, ey = 0; for (const [qx, qy, q] of Q) { const dx = x - qx, dy = y - qy, r3 = (dx * dx + dy * dy) ** 1.5; ex += q * dx / r3; ey += q * dy / r3; } return [ex, ey]; };
      const trace = (Q, x, y) => { const a = [[x, y]]; for (let i = 0; i < 400; i++) { const [ex, ey] = field(Q, x, y), m = Math.hypot(ex, ey); x += 2 * ex / m; y += 2 * ey / m; a.push([x, y]);
        if (Math.hypot(x, y) > bx || Q.some(([qx, qy, q]) => q < 0 && Math.hypot(x - qx, y - qy) < 10)) break; } return a; };
      const panel = (x0, Q, n, name, v, e) => { const pg = mk('g', { transform: `translate(${x0} -62)` }, g);
        still(pg, C(0, 0, bx), '#d0d6de', 1.2, { 'stroke-dasharray': '4 6' });
        for (const [qx, qy, q] of Q) if (q > 0) for (let i = 0; i < n; i++) { const a = 2 * Math.PI * (i + .5) / n + .2, l = trace(Q, qx + 12 * Math.cos(a), qy + 12 * Math.sin(a));
          line(pg, pts(l), BLU, 1.8); const j = Math.min(l.length - 1, 14); if (j > 3) tip(pg, l[j][0], l[j][1], l[j - 3][0], l[j - 3][1], BLU, 1.8); }
        for (const [qx, qy, q] of Q) { part(pg, C(qx, qy, 10), q > 0 ? '#e04b3a' : '#5b86c8', q > 0 ? '#7a1f1f' : '#1f3f7a', 2); lb(pg, qx, qy + 6, q > 0 ? '+' : '−', '#fff', 17); }
        showLab(o) && lb(g, x0, 40, name, DK, 18); showLab(o) && rt(g, x0, 70, v, TXT.red, 19); showLab(o) && rt(g, x0, 96, e, '#666', 15); };
      panel(-170, [[0, 0, 1]], 10, 'monopole q', 'V ∝ 1/r', 'E ∝ 1/r^2');
      panel(0, [[-20, 0, 1], [20, 0, -1]], 12, 'dipole p = qd', 'V ∝ 1/r^2', 'E ∝ 1/r^3');
      panel(170, [[-18, -18, 1], [18, 18, 1], [18, -18, -1], [-18, 18, -1]], 7, 'quadrupole', 'V ∝ 1/r^3', 'E ∝ 1/r^4');
      showLab(o) && rt(g, 0, 140, 'V(r) = (1/4πε_0) [ q/r + p cos θ/r^2 + ½Q_{ij}n_in_j/r^3 + … ]', TXT.blue, 17);
      showLab(o) && lb(g, 0, 166, 'far away the lowest nonzero moment dominates', '#777', 14);
      if (t) lb(g, 0, -160, t, TXT.blue, 20);
      return g;
    },
    // "waveguide cx cy width |text"
    waveguide: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), a = 180, x0 = -235, yt = -30, b = 90;
      part(g, R(x0, yt, a, b), '#eef2f6', DK, 4);
      for (let i = 0; i < 9; i++) { const x = x0 + a * (i + .5) / 9, L = 74 * Math.sin(Math.PI * (x - x0) / a); arrow(g, x, yt + b / 2 + L / 2, x, yt + b / 2 - L / 2, RED, 2.2); }
      dash(g, `M${x0} -48 H${x0 + a}`, GRY, 1.2); line(g, curve(x => -48 - 46 * Math.sin(Math.PI * (x - x0) / a), x0, x0 + a, 60), RED, 2.6);
      showLab(o) && rt(g, x0 + a / 2, -104, '|E_y| ∝ sin(πx/a)', TXT.red, 16);
      still(g, `M${x0} 80 H${x0 + a}`, '#777', 1.5); tip(g, x0, 80, x0 + 10, 80, '#777', 1.5); tip(g, x0 + a, 80, x0 + a - 10, 80, '#777', 1.5); showLab(o) && lb(g, x0 + a / 2, 100, 'a', DK, 19);
      still(g, `M${x0 + a + 14} ${yt} V${yt + b}`, '#777', 1.5); tip(g, x0 + a + 14, yt, x0 + a + 14, yt + 10, '#777', 1.5); tip(g, x0 + a + 14, yt + b, x0 + a + 14, yt + b - 10, '#777', 1.5); showLab(o) && lb(g, x0 + a + 22, yt + b / 2 + 6, 'b', DK, 19, 'start');
      arrow(g, x0, 116, x0 + 26, 116, DK, 2); arrow(g, x0, 116, x0, 90, DK, 2); showLab(o) && lb(g, x0 + 30, 122, 'x', DK, 14, 'start'); showLab(o) && lb(g, x0 + 6, 92, 'y', DK, 14, 'start'); showLab(o) && lb(g, x0 + 60, 122, 'z out of page ⊙', DK, 13, 'start');
      showLab(o) && lb(g, x0 + a / 2, -128, 'cross-section, TE₁₀', DK, 15);
      const z0 = 10, L = 225, lg = 112; part(g, R(z0, yt, L, b), '#eef2f6', DK, 4);
      for (let z = 7; z < L; z += 14) { const v = 36 * Math.cos(2 * Math.PI * z / lg); if (Math.abs(v) > 12) arrow(g, z0 + z, yt + b / 2 + v, z0 + z, yt + b / 2 - v, RED, 2); }
      line(g, curve(x => yt + b / 2 - 36 * Math.cos(2 * Math.PI * (x - z0) / lg), z0, z0 + L, 120), RED, 1.8, { opacity: .55 });
      arrow(g, z0, 80, z0 + L, 80, GRN, 3, true); showLab(o) && lb(g, z0 + L - 4, 100, 'z: propagation', TXT.green, 15, 'end');
      still(g, `M${z0 + 7} -44 H${z0 + 7 + lg}`, '#777', 1.5); tip(g, z0 + 7, -44, z0 + 17, -44, '#777', 1.5); tip(g, z0 + 7 + lg, -44, z0 + lg - 3, -44, '#777', 1.5); showLab(o) && rt(g, z0 + 7 + lg / 2, -52, 'λ_g', DK, 16);
      showLab(o) && lb(g, z0 + L / 2, -78, 'side view at x = a/2', DK, 15);
      showLab(o) && rt(g, 0, 150, 'TE_{10}:  E_y = E_0 sin(πx/a) cos(kz − ωt)', TXT.blue, 16);
      showLab(o) && rt(g, 0, 176, 'cutoff  f_c = c/2a:  only f > f_c propagates;   k = √(ω^2/c^2 − π^2/a^2)', TXT.red, 15);
      if (t) lb(g, 0, -158, t, TXT.blue, 20);
      return g;
    },
    // "dipoleradiation cx cy width |text"
    dipoleradiation: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), ox = -80, oy = 10, R0 = 150, th = rad(55);
      for (const r of [60, 110, 160]) for (const s of [1, -1]) line(g, pts(Array.from({ length: 31 }, (_, i) => { const a = rad(25 + i * 130 / 30); return [ox + s * r * Math.sin(a), oy - r * Math.cos(a)]; })), GLE, 1.5, { opacity: .45 });
      const lobe = pts(Array.from({ length: 241 }, (_, i) => { const a = i * 2 * Math.PI / 240, r = R0 * Math.sin(a) ** 2; return [ox + r * Math.sin(a), oy - r * Math.cos(a)]; })) + ' Z';
      part(g, lobe, '#fde3c8', RAY, 3);
      dash(g, `M${ox} ${oy + 165} V${oy - 170}`, GRY, 1.8); showLab(o) && lb(g, ox + 8, oy - 158, 'z (dipole axis)', DK, 14, 'start');
      showLab(o) && lb(g, ox - 10, oy - 132, 'no radiation along the axis', '#777', 13, 'end');
      still(g, `M${ox} ${oy + 22} V${oy - 22}`, DK, 3.5); tip(g, ox, oy - 24, ox, oy - 14, DK, 3.5); tip(g, ox, oy + 24, ox, oy + 14, DK, 3.5);
      showLab(o) && rt(g, -245, 150, 'dipole along z:  p(t) = p_0 cos ωt', DK, 15, 'start');
      const px = ox + 185 * Math.sin(th), py = oy - 185 * Math.cos(th); dash(g, `M${ox} ${oy} L${P(px, py)}`, DK, 1.5);
      still(g, arcD(ox, oy, 46, 90, 90 - 55), DK, 2); showLab(o) && lb(g, ox + 20, oy - 52, 'θ', DK, 17);
      arrow(g, px, py, px + 52 * Math.sin(th), py - 52 * Math.cos(th), GRN, 3); showLab(o) && lb(g, px + 58 * Math.sin(th) + 4, py - 58 * Math.cos(th), 'S', TXT.green, 18, 'start');
      arrow(g, px, py, px + 44 * Math.cos(th), py + 44 * Math.sin(th), BLU, 3); showLab(o) && lb(g, px + 48 * Math.cos(th) + 4, py + 48 * Math.sin(th) + 10, 'E', TXT.blue, 18, 'start');
      still(g, C(px - 26, py - 4, 8) + ` M${px - 31} ${py - 9} L${px - 21} ${py + 1} M${px - 21} ${py - 9} L${px - 31} ${py + 1}`, VIO, 2); showLab(o) && lb(g, px - 38, py, 'B', VIO, 18, 'end');
      showLab(o) && rt(g, 245, 40, 'E along θ̂, B along φ̂ (⊗),', '#666', 13, 'end'); showLab(o) && rt(g, 245, 58, 'S along r̂', '#666', 13, 'end');
      showLab(o) && rt(g, 245, 96, 'dP/dΩ ∝ sin^2θ', TXT.orange, 17, 'end'); showLab(o) && rt(g, 245, 128, '⟨P⟩ = μ_0p_0^2ω^4 / 12πc', TXT.blue, 17, 'end');
      showLab(o) && rt(g, 245, 160, 'P ∝ ω^4p^2', TXT.red, 20, 'end');
      if (t) lb(g, 0, -178, t, TXT.blue, 20);
      return g;
    },
    // "boltzmann cx cy width |text"
    boltzmann: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), ys = [110, 66, 22, -22, -66];
      still(g, 'M-246 128 V-96', DK, 2.5); tip(g, -246, -98, -246, -88, DK, 2.5); showLab(o) && lb(g, -246, -104, 'E', DK, 17);
      ys.forEach((y, i) => showLab(o) && rt(g, -222, y + 5, `E_${i}`, DK, 15, 'end'));
      const panel = (c, kT, title) => { const N = ys.map((_, i) => Math.round(14 * Math.exp(-i / kT)));
        ys.forEach((y, i) => { still(g, `M${c - 98} ${y} H${c + 98}`, DK, 3); for (let j = 0; j < N[i]; j++) part(g, C(c - 90 + j * 12.6, y - 7, 5), '#7fb7ea', '#1f3f7a', 1.5); });
        dash(g, pts(Array.from({ length: 41 }, (_, i) => { const e = i / 10; return [c - 96 + 12.6 * 14 * Math.exp(-e / kT), 110 - 44 * e - 7]; })), RED, 2);
        showLab(o) && rt(g, c, -100, title, TXT.blue, 17); return N; };
      panel(-120, .5, 'low T  (kT = ½ΔE)'); panel(128, 2, 'high T  (kT = 2ΔE)');
      showLab(o) && rt(g, 0, 156, 'N_i ∝ g_i e^{−E_i/kT}', TXT.red, 20); showLab(o) && rt(g, 0, 186, 'Z = Σ_i g_i e^{−E_i/kT},   N_i / N = g_i e^{−E_i/kT} / Z', TXT.blue, 17);
      showLab(o) && rt(g, 0, 208, 'here every degeneracy g_i = 1; dashed: exponential envelope', '#777', 13);
      if (t) lb(g, 0, -130, t, TXT.blue, 20);
      return g;
    },
    // "quantumstats cx cy width |text"
    quantumstats: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), X = u => -30 + 34 * u, Y = n => 112 - 92 * n, nmax = 2.35;
      axes(g, -215, 112, 222, -128, showLab(o) && 'ε', showLab(o) && 'n(ε)');
      dash(g, `M${X(0)} 112 V-122`, GRY, 1.5); showLab(o) && rt(g, X(0), 132, 'μ', DK, 18);
      dash(g, `M-215 ${Y(1)} H215`, '#c3c8ce', 1.2); lb(g, -222, Y(1) + 5, '1', DK, 14, 'end');
      still(g, `M-215 ${Y(1)} H${X(0)} V112`, GRY, 2, { 'stroke-dasharray': '3 5' });
      line(g, curve(x => Y(1 / (Math.exp((x + 30) / 34) + 1)), -215, 215), BLU, 3.2);
      line(g, curve(x => Y(Math.min(nmax, 1 / (Math.exp((x + 30) / 34) - 1))), X(Math.log(1 + 1 / nmax)), 215), RED, 3);
      line(g, curve(x => Y(Math.min(nmax, Math.exp(-(x + 30) / 34))), X(-Math.log(nmax)), 215), GRN, 3);
      for (const u of [-2, 2]) dash(g, `M${X(u)} ${Y(1 / (Math.exp(u) + 1))} V150`, BLU, 1.2);
      still(g, `M${X(-2)} 150 H${X(2)}`, BLU, 1.8); tip(g, X(-2), 150, X(-2) + 9, 150, BLU, 1.8); tip(g, X(2), 150, X(2) - 9, 150, BLU, 1.8); showLab(o) && lb(g, X(2) + 8, 155, '≈ 4kT smearing', TXT.blue, 14, 'start');
      showLab(o) && legend(g, 50, -92, [[BLU, 'Fermi–Dirac  1/(e^x + 1)'], [RED, 'Bose–Einstein  1/(e^x − 1)'], [GRN, 'Maxwell–Boltzmann  e^{−x}'], [GRY, 'FD at T = 0', '3 5']], 14);
      showLab(o) && rt(g, 84, -2, 'x = (ε − μ)/kT', DK, 15, 'start');
      showLab(o) && rt(g, 214, 94, 'all agree when ε − μ ≫ kT', '#666', 13, 'end');
      showLab(o) && lb(g, X(.4), Y(nmax) - 6, 'BE diverges as ε → μ', TXT.red, 13, 'start');
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "ising cx cy width |text"
    ising: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), n = 8, cs = 17;
      const lattice = (x0, y0, up) => { fl(g, R(x0, y0, n * cs, n * cs), '#f3f5f8'); let du = '', dd = '';
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = x0 + cs * (i + .5), y = y0 + cs * (j + .5);
          if (up(i, j)) du += `M${x} ${y + 6} V${y - 6} ` + head(x, y - 6, x, y + 6, 5) + ' '; else dd += `M${x} ${y - 6} V${y + 6} ` + head(x, y + 6, x, y - 6, 5) + ' '; }
        still(g, R(x0, y0, n * cs, n * cs), '#b9c0c7', 1.5); if (du) still(g, du, RED, 2); if (dd) still(g, dd, BLU, 2); };
      const r = rng(11);
      lattice(-245, -140, (i, j) => !((i - 5.2) ** 2 + (j - 4.8) ** 2 < 5.5 || (i === 1 && j === 1) || (i === 2 && j === 6)));
      const rs = Array.from({ length: n * n }, () => r() < .5); lattice(-92, -140, (i, j) => rs[i * n + j]);
      showLab(o) && rt(g, -177, 22, 'T < T_c', TXT.blue, 17); showLab(o) && lb(g, -177, 42, 'ordered domains', '#666', 14);
      showLab(o) && rt(g, -24, 22, 'T > T_c', TXT.blue, 17); showLab(o) && lb(g, -24, 42, 'random, M ≈ 0', '#666', 14);
      const X = s => 92 + 100 * s, Y = m => 40 - 140 * m, Kc = Math.log(1 + Math.SQRT2) / 2;
      axes(g, 92, 40, 244, -128, '', showLab(o) && 'M'); showLab(o) && rt(g, 244, 64, 'T/T_c', DK, 15, 'end');
      dash(g, `M${X(1)} 40 V-110`, GRY, 1.5); lb(g, X(1), 58, '1', DK, 14); lb(g, 84, Y(1) + 5, '1', DK, 14, 'end'); dash(g, `M92 ${Y(1)} H${X(1)}`, '#c3c8ce', 1.2);
      line(g, curve(x => { const s = Math.max((x - 92) / 100, .01), K = Kc / s; return Y(s >= 1 ? 0 : Math.pow(Math.max(0, 1 - Math.sinh(2 * K) ** -4), 1 / 8)); }, 93, X(1), 200) + ` L${X(1.5)} 40`, RED, 3.2);
      showLab(o) && rt(g, X(.55), Y(.45), 'Onsager', '#666', 13);
      showLab(o) && rt(g, 0, 98, 'H = −J Σ_{⟨ij⟩} s_i s_j,   s_i = ±1', TXT.blue, 18);
      showLab(o) && rt(g, 0, 128, '2D:  kT_c = 2J / ln(1 + √2) ≈ 2.27 J', DK, 16);
      showLab(o) && rt(g, 0, 156, 'M ∝ (T_c − T)^β  with β = 1/8:  falls to zero at T_c', TXT.red, 16);
      if (t) lb(g, 0, -162, t, TXT.blue, 20);
      return g;
    },
    // "bec cx cy width |text"
    bec: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), y0 = -18, gs = (x, s) => Math.exp(-x * x / (2 * s * s));
      const panel = (c, s1, h1, h2, lab, sub) => { const f = x => y0 - h1 * gs(x - c, s1) - h2 * gs(x - c, 5.5);
        fl(g, curve(f, c - 70, c + 70, 140) + ` L${c + 70} ${y0} L${c - 70} ${y0} Z`, '#cfe0f5');
        if (h2) fl(g, curve(f, c - 16, c + 16, 40) + ' ' + curve(x => y0 - h1 * gs(x - c, s1), c + 16, c - 16, 30).replace('M', 'L') + ' Z', '#f6b9a8');
        still(g, `M${c - 72} ${y0} H${c + 72}`, DK, 2.5); line(g, curve(f, c - 70, c + 70, 160), h2 > 60 ? RED : BLU, 2.8);
        showLab(o) && rt(g, c, y0 + 24, lab, TXT.blue, 17); showLab(o) && lb(g, c, y0 + 44, sub, '#666', 13); showLab(o) && lb(g, c + 74, y0 + 5, 'v', DK, 14, 'start'); };
      panel(-165, 34, 58, 0, 'T > T_c', 'thermal cloud'); panel(-5, 30, 54, 34, 'T ≈ T_c', 'condensate appears'); panel(155, 26, 26, 128, 'T < T_c', 'sharp v ≈ 0 spike');
      showLab(o) && lb(g, 0, -160, 'velocity distribution of the trapped atoms', '#666', 14);
      const X = s => -205 + 120 * s, Y = f => 160 - 90 * f; axes(g, -205, 160, -20, 52, '', showLab(o) && 'N₀/N'); showLab(o) && rt(g, -20, 184, 'T/T_c', DK, 15, 'end');
      line(g, curve(x => { const s = (x + 205) / 120; return Y(s < 1 ? 1 - s ** 1.5 : 0); }, -205, -30, 120), RED, 3);
      dash(g, `M${X(1)} 160 V60`, GRY, 1.5); lb(g, X(1), 178, '1', DK, 14); lb(g, -212, Y(1) + 5, '1', DK, 14, 'end');
      showLab(o) && rt(g, 128, 80, 'N_0/N = 1 − (T/T_c)^{3/2}', TXT.red, 17); showLab(o) && rt(g, 128, 112, 'kT_c = (2πħ^2/m)(n/ζ(3/2))^{2/3}', TXT.blue, 16);
      showLab(o) && rt(g, 128, 136, 'ζ(3/2) ≈ 2.612', '#666', 14); showLab(o) && rt(g, 128, 162, 'ground state macroscopically occupied', DK, 14);
      if (t) lb(g, 0, -186, t, TXT.blue, 20);
      return g;
    },
    // "blochsphere cx cy size |text"
    blochsphere: ([cx, cy, S = 400], o, t, p) => {
      const g = G(cx, cy, S / 400, 0, p), ox = -50, oy = -10, Rr = 125, az = rad(22), el = rad(18), th = rad(52), ph = rad(58);
      const pr = (x, y, z) => [ox + Rr * (-x * Math.sin(az) + y * Math.cos(az)), oy - Rr * (z * Math.cos(el) - (x * Math.cos(az) + y * Math.sin(az)) * Math.sin(el))];
      const depth = (x, y, z) => (x * Math.cos(az) + y * Math.sin(az)) * Math.cos(el) + z * Math.sin(el);
      fl(g, C(ox, oy, Rr), '#e9f1fa', { opacity: .8 });
      const eq = (front) => { let d = '', pen = false; for (let i = 0; i <= 120; i++) { const a = i * Math.PI / 60, v = [Math.cos(a), Math.sin(a), 0];
        if ((depth(...v) >= 0) === front) { d += (pen ? ' L' : ' M') + P(...pr(...v)); pen = true; } else pen = false; } return d; };
      still(g, eq(false), GRY, 1.6, { 'stroke-dasharray': '5 6' }); still(g, eq(true), GRY, 2);
      still(g, C(ox, oy, Rr), DK, 3);
      const ax = (v, l, s) => { const [x1, y1] = pr(...v.map(c => c * s)); arrow(g, ox, oy, x1, y1, DK, 2.2); return [x1, y1]; };
      const [zx, zy] = ax([0, 0, 1], 'z', 1.32); showLab(o) && lb(g, zx + 10, zy + 4, 'z', DK, 17, 'start');
      const [xx, xy] = ax([1, 0, 0], 'x', 1.5); showLab(o) && lb(g, xx - 6, xy + 18, 'x', DK, 17, 'end');
      const [yx, yy] = ax([0, 1, 0], 'y', 1.38); showLab(o) && lb(g, yx + 6, yy + 14, 'y', DK, 17, 'start');
      dash(g, `M${P(...pr(0, 0, -1))} L${P(...pr(0, 0, -1.25))}`, DK, 1.6);
      const n = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], [nx, ny] = pr(...n), [qx, qy] = pr(n[0], n[1], 0);
      dash(g, `M${ox} ${oy} L${P(qx, qy)} L${P(nx, ny)}`, VIO, 1.6);
      arrow(g, ox, oy, nx, ny, RED, 3.5); part(g, C(nx, ny, 5), RED, RED, 1); showLab(o) && rt(g, nx + 10, ny - 6, '|ψ⟩', TXT.red, 19, 'start');
      still(g, pts(Array.from({ length: 21 }, (_, i) => { const s = th * i / 20; return pr(.34 * Math.sin(s) * Math.cos(ph), .34 * Math.sin(s) * Math.sin(ph), .34 * Math.cos(s)); })), GRN, 2.2);
      { const s = th / 2, [lx, ly] = pr(.48 * Math.sin(s) * Math.cos(ph), .48 * Math.sin(s) * Math.sin(ph), .48 * Math.cos(s)); showLab(o) && lb(g, lx + 2, ly + 2, 'θ', TXT.green, 18, 'start'); }
      still(g, pts(Array.from({ length: 21 }, (_, i) => pr(.36 * Math.cos(ph * i / 20), .36 * Math.sin(ph * i / 20), 0))), VIO, 2.2);
      { const [lx, ly] = pr(.5 * Math.cos(ph / 2), .5 * Math.sin(ph / 2), 0); showLab(o) && lb(g, lx, ly + 18, 'φ', VIO, 18); }
      const [n0x, n0y] = pr(0, 0, 1), [s0x, s0y] = pr(0, 0, -1);
      part(g, C(n0x, n0y, 5), BLU, BLU, 1); part(g, C(s0x, s0y, 5), BLU, BLU, 1);
      showLab(o) && rt(g, n0x - 12, n0y - 4, '|0⟩', TXT.blue, 20, 'end'); showLab(o) && rt(g, s0x + 12, s0y + 12, '|1⟩', TXT.blue, 20, 'start');
      showLab(o) && rt(g, 105, -90, 'pure states: points', '#666', 14, 'start'); showLab(o) && rt(g, 105, -70, 'on the unit sphere', '#666', 14, 'start');
      showLab(o) && rt(g, 105, -40, '0 ≤ θ ≤ π,  0 ≤ φ < 2π', '#666', 14, 'start');
      showLab(o) && rt(g, 0, 166, '|ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩', TXT.red, 20);
      if (t) lb(g, 0, -190, t, TXT.blue, 20);
      return g;
    },
    // "radialwave cx cy width k=prob|wave |text"
    radialwave: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), wave = o.k === 'wave', rmax = wave ? 15 : 20, X = r => -175 + 400 * r / rmax;
      const fns = [['1s', r => 2 * Math.exp(-r), [], BLU], ['2s', r => Math.SQRT1_2 * (1 - r / 2) * Math.exp(-r / 2), [2], GRN],
        ['2p', r => r * Math.exp(-r / 2) / (2 * Math.sqrt(6)), [], VIO], ['3s', r => 2 / (3 * Math.sqrt(3)) * (1 - 2 * r / 3 + 2 * r * r / 27) * Math.exp(-r / 3), [1.902, 7.098], RED]];
      fns.forEach(([name, Rf, nodes, c], i) => {
        const f = wave ? Rf : r => r * r * Rf(r) ** 2; let m = 0; for (let r = 0; r <= rmax; r += .02) m = Math.max(m, Math.abs(f(r)));
        const yb = wave ? -112 + i * 72 : -88 + i * 72, A = wave ? 32 : 58;
        if (!wave) fl(g, curve(x => yb - A * f((x + 175) * rmax / 400) / m, -175, 225, 200) + ` L225 ${yb} L-175 ${yb} Z`, ['#d6e6f7', '#d8eed2', '#ebe0f6', '#f8d7d2'][i]);
        still(g, `M-175 ${yb} H228`, DK, 2); line(g, curve(x => yb - A * f((x + 175) * rmax / 400) / m, -175, 225, 220), c, 3);
        for (const r0 of nodes) { part(g, C(X(r0), yb, 4.5), '#fff', DK, 2); }
        showLab(o) && lb(g, -190, yb - (wave ? 0 : 18) + 6, name, c, 19, 'end');
        if (!wave && i === 0) { dash(g, `M${X(1)} ${yb} V${yb - 62}`, DK, 1.2); showLab(o) && rt(g, X(2.2), yb - 36, 'peak at r = a_0', '#666', 13, 'start'); }
      });
      const yax = wave ? 116 : 140; still(g, `M-175 ${yax} H225`, DK, 2.5); tip(g, 228, yax, 218, yax, DK, 2.5);
      for (const r of wave ? [0, 5, 10, 15] : [0, 5, 10, 15, 20]) { still(g, `M${X(r)} ${yax} v6`, DK, 2); lb(g, X(r), yax + 22, String(r), DK, 13); }
      showLab(o) && rt(g, 228, yax + 42, 'r / a_0', DK, 16, 'end');
      showLab(o) && rt(g, 0, -150, wave ? 'radial functions R_{nl}(r):  n − l − 1 radial nodes' : 'P(r) = r^2|R_{nl}|^2:  n − l − 1 radial nodes', TXT.blue, 17);
      if (t) lb(g, 0, -178, t, TXT.blue, 20);
      return g;
    },
    // "zeeman cx cy width k=normal|stark |text"
    zeeman: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), stark = o.k === 'stark', yU = -40, yL = 112, x0 = stark ? -120 : -150, x1 = stark ? 40 : 0, x2 = stark ? x1 : 96, sl = .45;
      const Ym = (m, x) => yU - m * sl * (Math.min(x, x1) - x0);
      still(g, `M-225 ${yU} H${x0}`, DK, 3); const cs = [RED, DK, BLU];
      [1, 0, -1].forEach((m, i) => { still(g, `M${x0} ${yU} L${x1} ${Ym(m, x1).toFixed(1)} H${x2}`, cs[i], stark && m === 0 ? 4.5 : 3);
        if (stark) showLab(o) && rt(g, x1 + 8, Ym(m, x1) + 5, ['+3ea_0E_{ext}', '0  (×2)', '−3ea_0E_{ext}'][i], cs[i], 14, 'start');
        else showLab(o) && rt(g, x1 + 4, Ym(m, x1) - 7, `m_l = ${['+1', '0', '−1'][i]}`, cs[i], 14, 'start'); });
      still(g, `M-225 ${yL} H${x2}`, DK, 3);
      still(g, `M${x0} 140 H${x1 + 10}`, DK, 2); tip(g, x1 + 12, 140, x1 + 2, 140, DK, 2); dash(g, `M${x0} ${yU} V140`, GRY, 1.2);
      showLab(o) && rt(g, x1 + 16, 145, stark ? 'field E_{ext}' : 'B', DK, 16, 'start'); lb(g, x0, 158, '0', DK, 14);
      if (stark) {
        showLab(o) && rt(g, -225, yU - 10, 'n = 2  (4 states)', DK, 14, 'start'); showLab(o) && rt(g, -225, yL - 10, 'n = 1:  no linear shift', DK, 15, 'start');
        const tx = 182; showLab(o) && rt(g, tx, -110, 'linear Stark effect', TXT.blue, 17); showLab(o) && rt(g, tx, -80, 'ΔE = ±3ea_0E_{ext}', TXT.red, 18);
        showLab(o) && rt(g, tx, -48, 'm = 0: 2s and 2p_0 mix', DK, 14); showLab(o) && rt(g, tx, -28, 'into (ψ_{200} ± ψ_{210})/√2', DK, 14);
        showLab(o) && rt(g, tx, 4, 'm = ±1: unshifted', DK, 14); showLab(o) && rt(g, tx, 40, 'needs the 2s–2p', '#777', 13); showLab(o) && rt(g, tx, 58, 'degeneracy of hydrogen', '#777', 13);
        showLab(o) && rt(g, 0, 186, 'first-order perturbation: W = eE_{ext}z in the n = 2 subspace', TXT.blue, 15);
      } else {
        showLab(o) && rt(g, -225, yU - 10, 'l = 1 (p)', DK, 15, 'start'); showLab(o) && rt(g, -225, yL - 10, 'l = 0 (s)', DK, 15, 'start');
        [1, 0, -1].forEach((m, i) => { const x = 58 + i * 14; arrow(g, x, Ym(m, x), x, yL, [GRN, VIO, GRN][i], 2.2); });
        showLab(o) && rt(g, 72, yL + 22, 'Δm_l = 0, ±1', '#666', 13);
        const sx = 182; still(g, `M${sx - 60} -70 H${sx + 60} M${sx - 60} 40 H${sx + 60}`, DK, 2);
        still(g, `M${sx} -70 V-122`, VIO, 4); showLab(o) && lb(g, sx, -132, 'B = 0: one line', DK, 14);
        for (const [d, c] of [[-34, GRN], [0, VIO], [34, GRN]]) still(g, `M${sx + d} 40 V-12`, c, 4); showLab(o) && lb(g, sx, -22, 'B > 0: three lines', DK, 14);
        still(g, `M${sx} 54 H${sx + 34}`, '#777', 1.5); tip(g, sx + 34, 54, sx + 26, 54, '#777', 1.5); showLab(o) && rt(g, sx + 17, 74, 'μ_B B', DK, 14);
        showLab(o) && lb(g, sx + 64, 46, 'ν', DK, 16, 'start');
        showLab(o) && rt(g, 0, 186, 'ΔE = μ_B m_l B,   μ_B = eħ/2m_e ≈ 5.79×10^{−5} eV/T', TXT.blue, 16);
      }
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "crosssection cx cy width |text"
    crosssection: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), Tx = -40, Ty = 60, v = 1, kk = 23;
      const run = b => { let x = -240, y = Ty - b, vx = v, vy = 0; const q = [[x, y]]; for (let i = 0; i < 4000; i++) { const dx = x - Tx, dy = y - Ty, r = Math.hypot(dx, dy), f = kk / (r * r * r);
          vx += f * dx * .5; vy += f * dy * .5; x += vx * .5; y += vy * .5; if (i % 4 === 0) q.push([x, y]); if (x > 245 || y < -195 || x < -245) break; } return { q, vx, vy, x, y }; };
      dash(g, `M-245 ${Ty} H245`, GRY, 1.5);
      for (const b of [16, 70, 112]) line(g, pts(run(b).q), '#7fa9dc', 2, { opacity: .8 });
      const m = run(40); line(g, pts(m.q), BLU, 3); const n = m.q.length - 1; tip(g, m.q[n][0], m.q[n][1], m.q[n - 3][0], m.q[n - 3][1], BLU, 3);
      for (const b of [16, 40, 70, 112]) tip(g, -200, Ty - b, -210, Ty - b, b === 40 ? BLU : '#7fa9dc', 2.5);
      const th = Math.atan2(-m.vy, m.vx), s = (Ty - 40 - m.y) / m.vy, Ix = m.x + s * m.vx, Iy = Ty - 40;
      dash(g, `M${P(Ix, Iy)} H${P(Ix + 90, Iy)}`, DK, 1.5); still(g, arcD(Ix, Iy, 40, 0, th * 180 / Math.PI), RED, 2); showLab(o) && lb(g, Ix + 46, Iy - 12, 'θ', TXT.red, 19, 'start');
      dash(g, `M${P(Ix, Iy)} L${P(Ix + 40 * Math.cos(th) * 1.3, Iy - 40 * Math.sin(th) * 1.3)}`, DK, 1.2);
      still(g, `M-222 ${Ty} V${Ty - 40}`, '#777', 1.5); tip(g, -222, Ty - 40, -222, Ty - 30, '#777', 1.5); tip(g, -222, Ty, -222, Ty - 10, '#777', 1.5); showLab(o) && lb(g, -230, Ty - 14, 'b', DK, 19, 'end');
      part(g, C(Tx, Ty, 9), '#e04b3a', '#7a1f1f', 2); showLab(o) && lb(g, Tx, Ty + 30, 'target  +Ze', TXT.red, 15);
      showLab(o) && lb(g, -238, Ty - 150, 'incident beam, flux I', TXT.blue, 15, 'start');
      const Dr = 200, d0 = th * 180 / Math.PI, [ax, ay] = polar(Tx, Ty, Dr, d0 - 6), [bx2, by2] = polar(Tx, Ty, Dr, d0 + 6);
      dash(g, `M${Tx} ${Ty} L${P(ax, ay)} M${Tx} ${Ty} L${P(bx2, by2)}`, VIO, 1.4);
      part(g, arcD(Tx, Ty, Dr, d0 - 7, d0 + 7, 10) + ' L' + arcD(Tx, Ty, Dr + 12, d0 + 7, d0 - 7, 10).slice(1) + ' Z', '#d9d2ea', VIO, 2);
      { const [lx, ly] = polar(Tx, Ty, Dr + 22, d0 - 8); showLab(o) && lb(g, lx, ly, 'detector', VIO, 15, 'start'); showLab(o) && lb(g, lx, ly + 18, 'dΩ = dA/r²', VIO, 15, 'start'); }
      showLab(o) && rt(g, 0, 128, 'dσ/dΩ = (b / sin θ) |db/dθ|  =  scattered rate per dΩ / incident flux', DK, 15);
      showLab(o) && rt(g, 0, 160, 'Rutherford:  dσ/dΩ = (zZe^2 / 16πε_0E)^2 / sin^4(θ/2)', TXT.red, 18);
      if (t) lb(g, 0, -180, t, TXT.blue, 20);
      return g;
    },
    // "belltest cx cy width |text"
    belltest: ([cx, cy, W = 520], o, t, p) => {
      const g = G(cx, cy, W / 520, 0, p), ya = -120;
      part(g, R(-34, ya - 20, 68, 40), '#fff1b8', '#b58a10', 2.5); showLab(o) && lb(g, 0, ya + 6, 'source', '#8a5a00', 14);
      wavy(g, -36, ya, -112, ya, RAY, 4, 5, true); wavy(g, 36, ya, 112, ya, RAY, 4, 5, true);
      const pol = (x, deg, nm) => { part(g, C(x, ya, 20), '#e3edf8', BLU, 2.5); const dx = 17 * Math.sin(rad(deg)), dy = 17 * Math.cos(rad(deg)); still(g, `M${P(x - dx, ya + dy)} L${P(x + dx, ya - dy)}`, BLU, 3); showLab(o) && lb(g, x, ya - 30, nm, TXT.blue, 15); };
      pol(-132, 0, 'polarizer a'); pol(132, 22.5, 'polarizer b');
      for (const s of [-1, 1]) { line(g, `M${s * 152} ${ya} H${s * 178}`, RAY, 2.5); part(g, `M${s * 180} ${ya - 16} A16 16 0 0 ${s > 0 ? 1 : 0} ${s * 180} ${ya + 16} Z`, '#c9ccd2', DK, 2.5);
        showLab(o) && rt(g, s * 200, ya + 6, s < 0 ? 'D_A' : 'D_B', DK, 15, s < 0 ? 'end' : 'start'); still(g, `M${s * 186} ${ya + 16} V${ya + 50} H${s * 62}`, '#b5651d', 2); }
      part(g, R(-62, ya + 36, 124, 28), '#eef2f6', DK, 2); showLab(o) && lb(g, 0, ya + 55, 'coincidences', DK, 13);
      const X = d => -215 + 2.6 * d, Y = e => 72 - 72 * e;
      axes(g, -215, 146, 25, -22, '', showLab(o) && 'E(a, b)'); still(g, `M-215 ${Y(0)} H25`, '#c3c8ce', 1.2); showLab(o) && lb(g, -95, 190, 'angle difference a − b', DK, 14);
      for (const [d, s] of [[0, '0'], [22.5, '22.5°'], [45, '45°'], [90, '90°']]) { still(g, `M${X(d)} 146 v6`, DK, 2); lb(g, X(d), 168, s, DK, 12); }
      for (const [e, s] of [[1, '+1'], [-1, '−1']]) lb(g, -221, Y(e) + 5, s, DK, 13, 'end');
      line(g, curve(x => Y(Math.cos(2 * rad((x + 215) / 2.6))), -215, X(90), 120), BLU, 3);
      line(g, `M${X(0)} ${Y(1)} L${X(90)} ${Y(-1)}`, RED, 2.6, { 'stroke-dasharray': '9 6' });
      dash(g, `M${X(22.5)} 146 V${Y(Math.SQRT1_2)}`, GRY, 1.2);
      showLab(o) && legend(g, 56, 0, [[BLU, 'quantum: E = cos 2(a − b)'], [RED, 'local hidden variables', '9 6']], 14);
      showLab(o) && rt(g, 56, 64, 'CHSH:  S = E(a,b) − E(a,b′)', DK, 15, 'start'); showLab(o) && rt(g, 104, 86, '+ E(a′,b) + E(a′,b′)', DK, 15, 'start');
      showLab(o) && rt(g, 56, 118, 'local realism:  |S| ≤ 2', TXT.red, 17, 'start'); showLab(o) && rt(g, 56, 146, 'quantum:  S = 2√2 ≈ 2.83', TXT.blue, 17, 'start');
      showLab(o) && lb(g, 56, 168, 'at 22.5° steps: Bell inequality violated', '#666', 13, 'start');
      if (t) lb(g, 0, -172, t, TXT.blue, 20);
      return g;
    },
    // "qcircuit cx cy width k=bell|teleport |text"
    qcircuit: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), tele = o.k === 'teleport';
      const gate = (x, y, s, c = '#e3edf8', ink = BLU) => { part(g, R(x - 17, y - 17, 34, 34), c, ink, 2.5); lb(g, x, y + 7, s, ink, 20); };
      const cnot = (x, yc, yt) => { still(g, `M${x} ${yc} V${yt + (yt > yc ? 14 : -14)}`, DK, 2.5); part(g, C(x, yc, 5.5), DK, DK, 1); still(g, C(x, yt, 14) + ` M${x - 14} ${yt} H${x + 14} M${x} ${yt - 14} V${yt + 14}`, DK, 2.5); };
      const meter = (x, y) => { part(g, R(x - 20, y - 17, 40, 34), '#f3f5f8', DK, 2.5); still(g, `M${x - 12} ${y + 8} A13 13 0 0 1 ${x + 12} ${y + 8} M${x} ${y + 9} L${x + 9} ${y - 9}`, DK, 2); };
      const cw = (d) => { still(g, d, DK, 1.6, { transform: 'translate(0 -2.5)' }); still(g, d, DK, 1.6, { transform: 'translate(0 2.5)' }); };
      const cwv = (x, y1, y2) => { still(g, `M${x - 2.5} ${y1} V${y2} M${x + 2.5} ${y1} V${y2}`, DK, 1.6); };
      if (tele) {
        const ys = [-80, 0, 80]; rt(g, -212, -74, '|ψ⟩', TXT.red, 19, 'end'); rt(g, -212, 6, '|0⟩', DK, 19, 'end'); rt(g, -212, 86, '|0⟩', DK, 19, 'end');
        still(g, `M-205 -80 H40 M-205 0 H40 M-205 80 H215`, DK, 2.5);
        gate(-160, 0, 'H'); cnot(-110, 0, 80); cnot(-50, -80, 0); gate(0, -80, 'H'); meter(60, -80); meter(60, 0);
        cw('M80 -80 H190'); cwv(190, -80, 63); cw('M80 0 H130'); cwv(130, 0, 63); gate(130, 80, 'X', '#f8d7d2', RED); gate(190, 80, 'Z', '#f8d7d2', RED);
        rt(g, 222, 86, '|ψ⟩', TXT.red, 19, 'start');
        still(g, R(-185, -24, 100, 128), GRN, 1.5, { 'stroke-dasharray': '5 5' }); showLab(o) && lb(g, -135, 124, 'Bell pair', TXT.green, 14);
        still(g, R(-75, -106, 158, 128), VIO, 1.5, { 'stroke-dasharray': '5 5' }); showLab(o) && lb(g, 4, -114, 'Bell measurement', VIO, 14);
        showLab(o) && rt(g, 160, 124, 'X if m_2 = 1, then Z if m_1 = 1', TXT.red, 14); showLab(o) && rt(g, 92, -92, 'm_1', DK, 14, 'start'); showLab(o) && rt(g, 92, -12, 'm_2', DK, 14, 'start');
        showLab(o) && rt(g, 0, 160, 'two classical bits + one shared Bell pair send |ψ⟩ to qubit 3', TXT.blue, 15);
        showLab(o) && lb(g, 0, 182, 'the original is destroyed by the measurement: no cloning, no faster-than-light signal', '#777', 12);
      } else {
        rt(g, -212, -34, '|0⟩', DK, 20, 'end'); rt(g, -212, 46, '|0⟩', DK, 20, 'end'); showLab(o) && lb(g, -205, -54, 'q₁', '#777', 13, 'start'); showLab(o) && lb(g, -205, 26, 'q₂', '#777', 13, 'start');
        still(g, 'M-205 -40 H60 M-205 40 H60', DK, 2.5); gate(-120, -40, 'H'); cnot(-30, -40, 40); meter(80, -40); meter(80, 40); cw('M100 -40 H170'); cw('M100 40 H170');
        for (const x of [-160, -75, 20]) dash(g, `M${x} -70 V70`, '#c3c8ce', 1.2);
        showLab(o) && rt(g, -160, -82, '|00⟩', TXT.blue, 15); showLab(o) && rt(g, -75, -82, '(|0⟩+|1⟩)|0⟩/√2', TXT.blue, 14); showLab(o) && rt(g, 22, -100, '(|00⟩+|11⟩)/√2', TXT.red, 15);
        showLab(o) && lb(g, 180, -35, '0 or 1', '#777', 13, 'start'); showLab(o) && lb(g, 180, 45, 'same bit', '#777', 13, 'start');
        showLab(o) && rt(g, 0, 118, 'Bell state  |Φ^+⟩ = (|00⟩ + |11⟩)/√2', TXT.red, 19);
        showLab(o) && lb(g, 0, 146, 'outcomes 00 or 11, 50% each: perfectly correlated', DK, 15);
      }
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "detector cx cy size |text"
    detector: ([cx, cy, S = 500], o, t, p) => {
      const g = G(cx, cy, S / 500, 0, p), ox = -70, oy = 0, rT = 50, rE = 76, rH = 110, rS = 121, rM = 172;
      const layers = [[rM, '#f6dcdc', '#b05a5a', 'muon chambers + iron'], [rS, '#b9bec6', '#6f757d', 'solenoid magnet'], [rH, '#f9e3b8', '#c97a10', 'HCAL: hadrons'], [rE, '#d7efd2', GRN, 'ECAL: e, γ'], [rT, '#e3edf8', BLU, 'tracker']];
      for (const [r, f, c] of layers) part(g, C(ox, oy, r), f, c, 2);
      part(g, C(ox, oy, 5), '#fff', DK, 1.5);
      for (const r of [134, 148, 162]) still(g, C(ox, oy, r), '#b05a5a', 2, { 'stroke-dasharray': '10 5' });
      const track = (deg, curv, rmax, c, w, extra = {}) => { let x = 0, y = 0, a = rad(deg); const q = [[ox, oy]];
        while (Math.hypot(x, y) < rmax) { const r = Math.hypot(x, y); a += (r < rS ? curv : -curv * .6) * 2; x += 2 * Math.cos(a); y += 2 * Math.sin(a); q.push([ox + x, oy - y]); }
        line(g, pts(q), c, w, extra); return q; };
      const shower = (deg, r0, r1, c, f) => { const [ax, ay] = polar(ox, oy, r0, deg), q = [[ax, ay], polar(ox, oy, r1, deg - 9), polar(ox, oy, r1 + 3, deg), polar(ox, oy, r1, deg + 9)];
        part(g, pts(q) + ' Z', f, c, 1.8); still(g, [-5, 0, 5].map(d => `M${P(ax, ay)} L${P(...polar(ox, oy, r1 - 3, deg + d))}`).join(' '), c, 1.4); };
      track(62, 0, rT, VIO, 2.2, { 'stroke-dasharray': '4 5' }); line(g, `M${P(...polar(ox, oy, rT, 62))} L${P(...polar(ox, oy, rE - 18, 62))}`, VIO, 2.2, { 'stroke-dasharray': '4 5' }); shower(62, rE - 18, rE - 2, VIO, '#e2d6f2');
      { const q = track(118, .006, rE - 22, BLU, 2.8); const [lx, ly] = q.at(-1); const deg = Math.atan2(oy - ly, lx - ox) * 180 / Math.PI; shower(deg, rE - 22, rE - 3, BLU, '#cfe0f5'); }
      { const q = track(165, -.005, rH - 26, RED, 2.8); const [lx, ly] = q.at(-1); const deg = Math.atan2(oy - ly, lx - ox) * 180 / Math.PI; shower(deg, rH - 26, rH - 3, RED, '#f8cfc4'); }
      line(g, `M${ox} ${oy} L${P(...polar(ox, oy, rH - 30, 215))}`, RAY, 2.2, { 'stroke-dasharray': '4 5' }); shower(215, rH - 30, rH - 3, RAY, '#fde3c8');
      { const q = track(285, .004, rM + 16, GRN, 3); const n = q.length - 1; tip(g, q[n][0], q[n][1], q[n - 3][0], q[n - 3][1], GRN, 3);
        for (const r of [134, 148, 162]) { const pnt = q.find(([x, y]) => Math.hypot(x - ox, y - oy) >= r); still(g, `M${pnt[0] - 5} ${pnt[1] - 5} l10 10 M${pnt[0] + 5} ${pnt[1] - 5} l-10 10`, GRN, 2); } }
      line(g, `M${ox} ${oy} L${P(...polar(ox, oy, rM + 18, 0))}`, '#7d838b', 2, { 'stroke-dasharray': '2 5' }); tip(g, ...polar(ox, oy, rM + 20, 0), ...polar(ox, oy, rM + 10, 0), '#7d838b', 2);
      showLab(o) && rt(g, ox + rM + 24, oy + 5, 'missing E_T', '#555', 14, 'start');
      layers.slice().reverse().forEach(([, f, c, s], i) => { part(g, R(132, -170 + i * 22, 16, 13), f, c, 1.5); showLab(o) && lb(g, 154, -159 + i * 22, s, DK, 13, 'start'); });
      showLab(o) && legend(g, 132, 52, [[VIO, 'photon γ', '4 5'], [BLU, 'electron'], [RED, 'charged hadron'], [RAY, 'neutral hadron', '4 5'], [GRN, 'muon'], ['#7d838b', 'neutrino', '2 5']], 13);
      showLab(o) && lb(g, -245, 192, 'transverse view; beams along z, out of the page', '#777', 13, 'start');
      if (t) lb(g, 0, -200, t, TXT.blue, 20);
      return g;
    },
    // "phonons cx cy width |text"
    phonons: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), yc = -160;
      for (let i = 0; i < 7; i++) still(g, `M${-200 + i * 40 + (i % 2 ? 7 : 11)} ${yc} ` + Array.from({ length: 6 }, (_, j) => `L${P(-200 + i * 40 + 13 + j * 3.5, yc + (j % 2 ? 5 : -5))}`).join(' ') + ` L${-200 + (i + 1) * 40 - ((i + 1) % 2 ? 7 : 11)} ${yc}`, GRY, 1.8);
      for (let i = 0; i < 8; i++) { const big = i % 2 === 0; part(g, C(-200 + i * 40, yc, big ? 11 : 7), big ? '#7fb7ea' : '#e04b3a', big ? '#1f3f7a' : '#7a1f1f', 2); }
      showLab(o) && rt(g, -200, yc + 30, 'm_1', TXT.blue, 15); showLab(o) && rt(g, -160, yc + 30, 'm_2', TXT.red, 15);
      still(g, `M-120 ${yc - 22} V${yc - 30} H-40 V${yc - 22}`, DK, 1.6); showLab(o) && lb(g, -80, yc - 36, 'a', DK, 16); showLab(o) && lb(g, 100, yc - 6, 'spring constant C,  m₁ > m₂', '#666', 14, 'start');
      const s = 115, X = q => 172 * q / Math.PI, Y = w => 128 - s * w, m1 = 2, m2 = 1, C0 = 1;
      const om = (q, sg) => { const A = C0 * (1 / m1 + 1 / m2); return Math.sqrt(A + sg * Math.sqrt(A * A - 4 * C0 * C0 * Math.sin(q / 2) ** 2 / (m1 * m2))); };
      fl(g, R(X(-Math.PI), Y(Math.sqrt(2 * C0 / m2)), 2 * X(Math.PI), s * (Math.sqrt(2 * C0 / m2) - Math.sqrt(2 * C0 / m1))), '#fde3c8');
      showLab(o) && lb(g, X(-2.6), Y(1.2) + 5, 'gap', TXT.orange, 16);
      still(g, `M-200 128 H205`, DK, 2.5); tip(g, 207, 128, 197, 128, DK, 2.5); still(g, `M0 128 V-92`, DK, 2.5); tip(g, 0, -94, 0, -84, DK, 2.5);
      showLab(o) && lb(g, 205, 150, 'k', DK, 17, 'end'); showLab(o) && lb(g, 10, -84, 'ω', DK, 18, 'start');
      for (const sg of [-1, 1]) dash(g, `M${X(sg * Math.PI)} 128 V-70`, GRY, 1.4);
      lb(g, X(-Math.PI), 150, '−π/a', DK, 15); lb(g, X(Math.PI), 150, 'π/a', DK, 15); lb(g, 0, 150, '0', DK, 14);
      line(g, curve(x => Y(om(x * Math.PI / 172, -1)), X(-Math.PI), X(Math.PI), 200), BLU, 3.2); line(g, curve(x => Y(om(x * Math.PI / 172, 1)), X(-Math.PI), X(Math.PI), 200), RED, 3.2);
      showLab(o) && lb(g, 50, Y(1.78) - 2, 'optical', TXT.red, 16, 'start'); showLab(o) && lb(g, 100, Y(.5) + 22, 'acoustic', TXT.blue, 16, 'start');
      showLab(o) && rt(g, X(Math.PI) + 6, Y(Math.SQRT2) - 6, '√(2C/m_2)', TXT.red, 13, 'start'); showLab(o) && rt(g, X(Math.PI) + 6, Y(1) + 16, '√(2C/m_1)', TXT.blue, 13, 'start');
      showLab(o) && rt(g, 0, 182, 'ω^2 = C(1/m_1 + 1/m_2) ± C√[(1/m_1 + 1/m_2)^2 − 4 sin^2(ka/2)/m_1m_2]', TXT.blue, 14);
      if (t) lb(g, 0, -196, t, TXT.blue, 20);
      return g;
    },
    // "bandstructure cx cy width k=nfe|zones |text"
    bandstructure: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), red = o.k === 'zones', U = .24, U2 = .12, kx = red ? 170 : 100, X = q => kx * q, Y = e => 132 - 56 * e, top = 4.3;
      // central equation in a 5 plane-wave basis k + nG (units: G = 2, E⁰(π/a) = 1), Fourier components U_G, U_2G; Jacobi eigenvalues
      const eig = q => { const A = [-2, -1, 0, 1, 2].map((n, i) => [-2, -1, 0, 1, 2].map((m, j) => i === j ? (q + 2 * n) ** 2 : Math.abs(i - j) === 1 ? U : Math.abs(i - j) === 2 ? U2 : 0));
        for (let sw = 0; sw < 40; sw++) { let off = 0; for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) off += A[i][j] ** 2; if (off < 1e-14) break;
          for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) { if (Math.abs(A[i][j]) < 1e-15) continue;
            const th = (A[j][j] - A[i][i]) / (2 * A[i][j]), tt = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), sn = tt * c;
            for (let k = 0; k < 5; k++) { const u = A[k][i], v = A[k][j]; A[k][i] = c * u - sn * v; A[k][j] = sn * u + c * v; }
            for (let k = 0; k < 5; k++) { const u = A[i][k], v = A[j][k]; A[i][k] = c * u - sn * v; A[j][k] = sn * u + c * v; } } }
        return A.map((r, i) => r[i]).sort((x, y) => x - y); };
      const band = n => x => eig(x / kx)[n];
      fl(g, R(X(-1), -112, 2 * kx, 244), '#eef3fa');
      showLab(o) && lb(g, red ? 0 : -50, -116, '1st Brillouin zone', TXT.blue, 15);
      const span = red ? 1 : 2; still(g, `M${X(-span) - 10} 132 H${X(span) + 12}`, DK, 2.5); tip(g, X(span) + 14, 132, X(span) + 4, 132, DK, 2.5);
      still(g, `M0 132 V-108`, DK, 2.5); tip(g, 0, -110, 0, -100, DK, 2.5); showLab(o) && lb(g, X(span) + 14, 120, 'k', DK, 17, 'end'); showLab(o) && lb(g, 10, -96, 'E', DK, 18, 'start');
      const marks = red ? [[-1, '−π/a'], [1, 'π/a']] : [[-2, '−2π/a'], [-1, '−π/a'], [1, 'π/a'], [2, '2π/a']];
      for (const [q, s] of marks) { dash(g, `M${X(q)} 132 V-104`, GRY, 1.3); lb(g, X(q), 154, s, DK, 14); }
      const cc = (f, a, b, n) => { let d = '', pen = false; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, e = f(x); if (e > top) { pen = false; continue; } d += (pen ? ' L' : ' M') + P(x, Y(e)); pen = true; } return d; };
      const [g1, g2] = eig(1);
      if (red) {
        for (const sh of [0, 2, -2]) dash(g, cc(x => (x / kx - sh) ** 2, X(-1), X(1), 120), GRY, 1.6);
        line(g, cc(band(0), X(-1), X(1), 120), BLU, 3.2); line(g, cc(band(1), X(-1), X(1), 120), RED, 3.2);
        showLab(o) && lb(g, X(.55), Y(band(0)(X(.55))) - 14, 'band 1', TXT.blue, 15); showLab(o) && lb(g, X(.62) + 10, Y(band(1)(X(.62))) - 6, 'band 2', TXT.red, 15, 'start');
        showLab(o) && legend(g, X(1) + 16, -80, [[GRY, 'folded free-', '6 7']], 13); showLab(o) && lb(g, X(1) + 50, -58, 'electron bands', GRY, 13, 'start');
        showLab(o) && rt(g, 0, 182, 'reduced zone: k → k − G folds every band into −π/a < k ≤ π/a', TXT.blue, 15);
      } else {
        dash(g, cc(x => (x / kx) ** 2, X(-2), X(2), 200), GRY, 1.8);
        line(g, cc(band(0), X(-1), X(1), 120), BLU, 3.2);
        for (const sg of [-1, 1]) line(g, cc(band(1), sg < 0 ? X(-2) : X(1), sg < 0 ? X(-1) : X(2), 80), RED, 3.2);
        showLab(o) && legend(g, 40, -130, [[GRY, 'free electron E = ħ^2k^2/2m', '6 7']], 13);
        showLab(o) && rt(g, 0, 182, 'extended zone: Bragg reflection at k = ±π/a opens gaps', TXT.blue, 15);
      }
      for (const sg of red ? [1] : [-1, 1]) { const x = X(sg * 1) + (red ? -16 : sg * 14), y0 = Y(g1), y1 = Y(g2);
        still(g, `M${x} ${y0} V${y1}`, DK, 1.8); tip(g, x, y1, x, y1 + 8, DK, 1.8); tip(g, x, y0, x, y0 - 8, DK, 1.8);
        if (sg > 0) showLab(o) && rt(g, x + (red ? -8 : 8), (y0 + y1) / 2 + 5, 'E_g ≈ 2|U_G|', TXT.red, 14, red ? 'end' : 'start'); }
      if (t) lb(g, 0, -146, t, TXT.blue, 20);
      return g;
    },
    // "superconductor cx cy width |text"
    superconductor: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), Rs = 30;
      const panel = (c, cy0, sc) => { part(g, C(c, cy0, Rs), sc ? '#cfe0f5' : '#dde0e4', sc ? BLU : DK, 2.5);
        for (const yi of [-62, -44, -26, -9, 9, 26, 44, 62]) { let q;
          if (!sc) q = [[c - 66, cy0 + yi], [c + 66, cy0 + yi]];
          else q = Array.from({ length: 61 }, (_, i) => { const x = -66 + 132 * i / 60, s = Math.sign(yi); let lo = 0, hi = 140;
            for (let k = 0; k < 40; k++) { const y = (lo + hi) / 2, r = Math.hypot(x, y), f = r <= Rs ? -1 : y * y * (1 - Rs ** 3 / r ** 3) - yi * yi; f < 0 ? lo = y : hi = y; } return [c + x, cy0 + s * (lo + hi) / 2]; });
          line(g, pts(q), VIO, 1.8); const n = q.length - 1; tip(g, q[n][0], q[n][1], q[n - 1][0] - (sc ? 0 : 10), q[n - 1][1], VIO, 1.8); }
        showLab(o) && rt(g, c, cy0 + 92, sc ? 'T < T_c' : 'T > T_c', TXT.blue, 17); showLab(o) && lb(g, c, cy0 + 112, sc ? 'B expelled: Meissner' : 'B passes through', '#666', 14); };
      panel(-175, -60, false); panel(-30, -60, true); showLab(o) && rt(g, -248, -128, 'B →', VIO, 16, 'start');
      const x0 = 70, y0 = 30, Tc = 135, X = T => x0 + T, Y = r => y0 - r;
      axes(g, x0, y0, 245, -135, '', showLab(o) && 'R'); showLab(o) && rt(g, 245, y0 + 24, 'T', DK, 16, 'end');
      line(g, `M${x0} ${y0} H${Tc} V${Y(52)} ` + curve(T => Y(52 + 1.3e-3 * (T - Tc) * (T - Tc) * 1.6 + .25 * (T - Tc)), Tc, 238, 40).replace('M', 'L'), RED, 3.2);
      dash(g, curve(T => Y(30 + 22 * ((T - x0) / (Tc - x0)) ** 2), x0, Tc, 40), GRY, 1.6); showLab(o) && lb(g, x0 + 8, -64, 'dashed: normal metal', '#777', 12, 'start');
      dash(g, `M${Tc} ${y0} V${y0 + 6}`, DK, 1.5); showLab(o) && rt(g, Tc, y0 + 22, 'T_c', DK, 15); showLab(o) && rt(g, (x0 + Tc) / 2 + 6, y0 - 8, 'R = 0', TXT.red, 14);
      showLab(o) && rt(g, 0, 110, 'below T_c:  R = 0  and  B = 0 inside (perfect diamagnet, χ = −1)', TXT.blue, 16);
      showLab(o) && rt(g, 0, 138, 'field penetrates only a thin skin: London depth λ_L ≈ 50 nm', DK, 15);
      showLab(o) && rt(g, 0, 164, 'BCS: electrons bind into Cooper pairs (k↑, −k↓), gap 2Δ ≈ 3.5 kT_c', '#666', 14);
      if (t) lb(g, 0, -168, t, TXT.blue, 20);
      return g;
    },
    // "hubble cx cy width k=plot|expansion |text"
    hubble: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p);
      const gal = (x, y, s = 1, c = '#7fb7ea', ink = '#1f3f7a', ang = -25) => { const gg = mk('g', { transform: `translate(${P(x, y)}) rotate(${ang}) scale(${s})` }, g); part(gg, E(0, 0, 8, 3.6), c, ink, 1.4); };
      if (o.k === 'expansion') {
        const grid = (c0, sp, lab) => { const n = 4, h = sp * (n - 1) / 2; let d = ''; for (let i = 0; i < n; i++) d += `M${P(c0 - h, -h + i * sp - 10)} H${(c0 + h).toFixed(1)} M${P(c0 - h + i * sp, -h - 10)} V${(h - 10).toFixed(1)} `;
          still(g, d, '#c3c8ce', 1.4); const at = (i, j) => [c0 - h + i * sp, -h + j * sp - 10];
          for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const [x, y] = at(i, j); i === 1 && j === 2 ? gal(x, y, 1.2, '#e04b3a', '#7a1f1f') : gal(x, y, 1, '#7fb7ea', '#1f3f7a', -25 + 40 * ((i * 3 + j) % 3)); }
          const [ax, ay] = at(1, 2), [bx, by] = at(3, 2), [qx, qy] = at(2, 0);
          arrow(g, ax + 10, ay, bx - 10, by, GRN, 2.2); arrow(g, ax + 5, ay - 8, qx - 5, qy + 8, RAY, 2.2);
          showLab(o) && lb(g, c0, h + 26, lab, TXT.blue, 16); return [ax, ay, bx, by, qx, qy, sp]; };
        const [ax, ay, bx, by, qx, qy] = grid(-140, 34, 't₁:  a = 1'), m = grid(105, 54, 't₂:  a = 1.6');
        showLab(o) && rt(g, (ax + bx) / 2 - 17, ay + 22, 'd_1', TXT.green, 15); showLab(o) && rt(g, qx + 8, qy - 10, 'd_2', TXT.orange, 15, 'start');
        showLab(o) && rt(g, (m[0] + m[2]) / 2 - 27, m[1] + 30, '1.6 d_1', TXT.green, 15); showLab(o) && rt(g, m[4] + 8, m[5] - 10, '1.6 d_2', TXT.orange, 15, 'start');
        arrow(g, -55, -10, -5, -10, DK, 3); showLab(o) && lb(g, -30, -22, 'time', DK, 14);
        showLab(o) && rt(g, 0, 128, 'all distances grow by the scale factor a(t):  d(t) = a(t) d_0', DK, 15);
        showLab(o) && rt(g, 0, 156, 'so  v = `d = (`a/a) d = H d:  farther galaxies recede faster', TXT.red, 16);
        showLab(o) && lb(g, 0, 180, 'every galaxy sees the same picture: no centre', '#777', 13);
        if (t) lb(g, 0, -140, t, TXT.blue, 20);
        return g;
      }
      const X = d => -195 + .8 * d, Y = v => 130 - 240 * v / 35000, r = rng(5);
      axes(g, -195, 130, 222, -140, '', showLab(o) && 'v (km/s)'); showLab(o) && lb(g, 222, 172, 'distance d (Mpc)', DK, 16, 'end');
      for (const d of [100, 200, 300, 400, 500]) { still(g, `M${X(d)} 130 v6`, DK, 2); lb(g, X(d), 152, String(d), DK, 13); }
      for (const v of [10000, 20000, 30000]) { still(g, `M-201 ${Y(v)} h6`, DK, 2); lb(g, -205, Y(v) + 5, `${v / 1000} 000`, DK, 13, 'end'); }
      line(g, `M${X(0)} ${Y(0)} L${X(500)} ${Y(35000)}`, RED, 2.5, { 'stroke-dasharray': '10 6' });
      for (let i = 0; i < 16; i++) { const d = 25 + i * 29 + r() * 15, v = 70 * d * (1 + (r() - .5) * .3) + (r() - .5) * 2500; gal(X(d), Y(v), 1, '#7fb7ea', '#1f3f7a', -60 + 120 * r()); }
      showLab(o) && rt(g, -170, -112, 'v = H_0 d', TXT.red, 24, 'start'); showLab(o) && rt(g, -170, -84, 'slope H_0 ≈ 70 km/s/Mpc', TXT.red, 16, 'start');
      showLab(o) && rt(g, -170, -60, 'Hubble time 1/H_0 ≈ 14 Gyr', '#666', 14, 'start');
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "gravwave cx cy width |text"
    gravwave: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), sx = -150, sy = -88;
      { const q = []; for (let i = 0; i <= 400; i++) { const ph = i * .07, r = 72 * Math.pow(1 - i / 430, .25); q.push([sx + r * Math.cos(ph), sy + .55 * r * Math.sin(ph)]); } line(g, pts(q), GLE, 1.6, { opacity: .8 });
        const ph = 400 * .07, r = 72 * Math.pow(1 - 400 / 430, .25); for (const s of [1, -1]) part(g, C(sx + s * r * Math.cos(ph), sy + s * .55 * r * Math.sin(ph), 9), '#2a2d33', '#000', 2); }
      showLab(o) && lb(g, sx, sy + 66, 'black hole binary inspiral', DK, 14);
      const ring = (c, ex, lab) => { dash(g, C(c, sy, 38), GRY, 1.2); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; part(g, C(c + 38 * (1 + ex) * Math.cos(a), sy + 38 * (1 - ex) * Math.sin(a), 4.5), ex > 0 ? '#e04b3a' : '#5b86c8', ex > 0 ? '#7a1f1f' : '#1f3f7a', 1.2); }
        showLab(o) && rt(g, c, sy + 62, lab, ex > 0 ? TXT.red : TXT.blue, 15); };
      ring(60, .28, 'h_+ > 0'); ring(170, -.28, 'h_+ < 0'); showLab(o) && lb(g, 115, sy - 66, 'ring of free masses, wave along z (out of page)', '#666', 13);
      const y0 = 80, xm = 118, Xs = -228; still(g, `M${Xs} ${y0} H232`, DK, 2); tip(g, 234, y0, 224, y0, DK, 2); showLab(o) && lb(g, 230, y0 + 22, 't', DK, 16, 'end'); showLab(o) && rt(g, Xs, y0 - 70, 'h(t)', DK, 16, 'start');
      const tau = x => (xm - x) / (xm - Xs), Phi = x => -2 * Math.PI * 11 * Math.pow(Math.max(tau(x), 0), 5 / 8), Amp = x => Math.min(62, 15 * Math.pow(Math.max(tau(x), 1e-4), -.25));
      const x1 = xm - 1.5, w1 = (Phi(x1) - Phi(x1 - .5)) / .5, a1 = Amp(x1), q = [];
      for (let x = Xs; x <= 230; x += .5) { if (x <= x1) q.push([x, y0 - Amp(x) * Math.cos(Phi(x))]); else { const d = x - x1; q.push([x, y0 - a1 * Math.exp(-d / 13) * Math.cos(Phi(x1) + w1 * d)]); } }
      line(g, pts(q), RED, 2.4);
      dash(g, `M${xm} ${y0 - 72} V${y0 + 72}`, GRY, 1.2);
      showLab(o) && lb(g, -100, y0 + 86, 'inspiral', TXT.blue, 15); showLab(o) && lb(g, xm, y0 + 86, 'merger', TXT.red, 15); showLab(o) && lb(g, 190, y0 + 86, 'ringdown', VIO, 15);
      showLab(o) && rt(g, 0, y0 + 114, 'chirp: f ∝ (t_c − t)^{−3/8},  h ∝ (t_c − t)^{−1/4};  ΔL/L = h/2', TXT.blue, 15);
      if (t) lb(g, 0, -178, t, TXT.blue, 20);
      return g;
    },
    // "bindingenergy cx cy width |text"
    bindingenergy: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), X = A => -195 + 1.72 * A, Y = b => 130 - 26 * b;
      axes(g, -195, 130, 228, -128, '', showLab(o) && 'B/A (MeV)'); showLab(o) && lb(g, 228, 174, 'mass number A', DK, 16, 'end');
      for (const A of [50, 100, 150, 200]) { still(g, `M${X(A)} 130 v6`, DK, 2); lb(g, X(A), 152, String(A), DK, 13); }
      for (const b of [2, 4, 6, 8]) { still(g, `M-201 ${Y(b)} h6`, DK, 2); lb(g, -205, Y(b) + 5, String(b), DK, 13, 'end'); }
      const light = [[2, 1.112], [3, 2.573], [6, 5.332], [7, 5.606], [9, 6.463], [11, 6.928], [12, 7.680]];
      const main = [[12, 7.680], [14, 7.476], [16, 7.976], [20, 8.032], [24, 8.261], [28, 8.448], [32, 8.493], [40, 8.551], [48, 8.666], [56, 8.790], [62, 8.795], [70, 8.76], [84, 8.717],
        [98, 8.635], [120, 8.505], [138, 8.393], [166, 8.142], [184, 8.005], [208, 7.867], [232, 7.615], [238, 7.570]];
      still(g, pts(light.map(([A, b]) => [X(A), Y(b)])), '#7d9cc4', 1.8);
      const sm = main.map(([A, b]) => [X(A), Y(b)]), q = [sm[0]]; for (let i = 1; i < sm.length; i++) { const [x0, y0] = sm[i - 1], [x1, y1] = sm[i]; q.push([(x0 + x1) / 2, (y0 + y1) / 2], [x1, y1]); }
      still(g, 'M' + q.map(v => P(...v)).join(' L'), BLU, 3.2);
      for (const [A, b] of [...light, ...main.slice(1)]) part(g, C(X(A), Y(b), 2.8), '#7fb7ea', '#1f3f7a', 1);
      const mark = (A, b, s, dx, dy, a = 'start') => { part(g, C(X(A), Y(b), 5.5), '#e04b3a', '#7a1f1f', 1.8); showLab(o) && lb(g, X(A) + dx, Y(b) + dy, s, TXT.red, 15, a); };
      mark(2, 1.112, 'H-2  (1.1 MeV)', 10, 5); mark(4, 7.074, 'He-4  (7.1)', 12, 20); mark(56, 8.790, 'Fe-56  ≈ 8.8 MeV', 6, -16); mark(235, 7.591, 'U-235  (7.6)', 0, -14, 'end');
      arrow(g, -170, 40, -110, 40, GRN, 3.5); showLab(o) && lb(g, -140, 28, 'fusion', TXT.green, 17); arrow(g, 205, 40, 120, 40, RAY, 3.5); showLab(o) && lb(g, 162, 28, 'fission', TXT.orange, 17);
      showLab(o) && lb(g, 15, 84, 'both release energy by moving toward the peak near iron', '#666', 14);
      showLab(o) && lb(g, 15, 106, '(most tightly bound per nucleon)', '#666', 13);
      if (t) lb(g, 0, -158, t, TXT.blue, 20);
      return g;
    },
  });
})();
