// Whiteboard library — biouni: AP Biology to university biology (enzyme kinetics, photosynthesis, respiration,
// molecular genetics, inheritance, evolution, ecology, physiology, protein structure, lab methods).
// Catalogue: biouni.txt. Same helpers and look as physuni.js.
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
  const rad = d => d * Math.PI / 180;
  const tip = (g, x, y, ax, ay, c, w = 3) => still(g, head(x, y, ax, ay, 8 + w * 1.6), c, w);
  const arrow = (g, x1, y1, x2, y2, c, w = 3, moving = false) => { (moving ? line : still)(g, `M${P(x1, y1)} L${P(x2, y2)}`, c, w); tip(g, x2, y2, x1, y1, c, w); };
  const dash = (g, d, c = GRY, w = 2) => still(g, d, c, w, { 'stroke-dasharray': '6 7' });
  const lb = (g, x, y, t, c = TXT.blue, s = 18, a = 'middle') => label(g, x, y, t, c, s, a);
  const curve = (f, x0, x1, n = 160) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? ' L' : 'M') + P(x, f(x)); } return d; };
  const pts = a => 'M' + a.map(p => P(p[0], p[1])).join(' L');
  const axes = (g, x0, y0, x1, y1, xl, yl) => { still(g, `M${x0} ${y1} V${y0} H${x1}`, DK, 3); tip(g, x0, y1, x0, y1 + 10, DK, 3); tip(g, x1, y0, x1 - 10, y0, DK, 3);
    if (xl) lb(g, x1, y0 + 26, xl, DK, 17, 'end'); if (yl) lb(g, x0 + 8, y1 + 4, yl, DK, 17, 'start'); };
  // biology extras: rounded box, a text pill, a polar point, an arc arrow round a cycle, a side reaction "bounce"
  const rr = (x, y, w, h, r = 8) => `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
  const tw = (s, n) => n * s * .4 + 16;
  const pill = (g, x, y, text, fill = '#fff', ink = DK, s = 15, c = DK) => { const w = tw(s, text.length), h = s + 11; part(g, rr(x - w / 2, y - h / 2, w, h, h / 2), fill, ink, 2); lb(g, x, y + s * .35, text, c, s); return [w, h]; };
  const pol = (r, a) => [r * Math.cos(rad(a)), r * Math.sin(rad(a))];
  const arcA = (g, r, a1, a2, c, w = 3) => { const [x1, y1] = pol(r, a1), [x2, y2] = pol(r, a2), [ax, ay] = pol(r, a2 - 4);
    line(g, `M${P(x1, y1)} A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${P(x2, y2)}`, c, w); tip(g, x2, y2, ax, ay, c, w); };
  // curved side arrow touching point m from outside: in at a, out at b (all screen points), labels at a and b
  const bounce = (g, a, m, b, ta, tb, c = ORG, ca = TXT.orange, cb = TXT.orange, s = 15) => {
    const mx = (8 * m[0] - a[0] - b[0]) / 6, my = (8 * m[1] - a[1] - b[1]) / 6, dx = (b[0] - a[0]) * .35, dy = (b[1] - a[1]) * .35;
    still(g, `M${P(...a)} C${P(mx - dx, my - dy)} ${P(mx + dx, my + dy)} ${P(...b)}`, c, 2.5); tip(g, b[0], b[1], mx + dx, my + dy, c, 2.5);
    const an = (p, q) => p[0] > m[0] + 4 ? 'start' : p[0] < m[0] - 4 ? 'end' : 'middle';
    const off = p => [p[0] + (p[0] - m[0]) * .12, p[1] + (p[1] - m[1]) * .12 + 5];
    if (ta) lb(g, ...off(a), ta, ca, s, an(a)); if (tb) lb(g, ...off(b), tb, cb, s, an(b)); };
  // smooth path through points (Catmull–Rom as cubic Béziers)
  const smooth = a => { let d = 'M' + P(...a[0]); for (let i = 0; i < a.length - 1; i++) { const p0 = a[i - 1] || a[i], p1 = a[i], p2 = a[i + 1], p3 = a[i + 2] || p2;
    d += ` C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`; } return d; };
  const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // an antibody: Y with stem down from (x, y) (dir = 1) or up (dir = −1)
  const ab = (g, x, y, c, dir = 1, s = 1) => still(g, `M${P(x, y + 14 * s * dir)} V${P(0, y).split(' ')[1]} L${P(x - 10 * s, y - 13 * s * dir)} M${P(x, y)} L${P(x + 10 * s, y - 13 * s * dir)}`, c, 3);
  const enz = (g, x, y) => { part(g, C(x, y, 8), '#ffd84a', '#b58a10', 2); lb(g, x, y + 4, 'E', '#7a5a00', 11); };

  Object.assign(window.RECIPES, {
    // "michaelis cx cy width k=mm|lineweaver inhib=none|competitive|noncompetitive |text"
    michaelis: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), inh = o.inhib || 'none', lw = o.k === 'lineweaver', IC = inh === 'competitive' ? TXT.orange : VIO;
      const note = { competitive: 'competitive inhibitor: Km ↑, Vmax same', noncompetitive: 'noncompetitive inhibitor: Vmax ↓, Km same' }[inh];
      if (lw) {
        const ox = -30, oy = 100, xi = 95, yi = 45;
        still(g, `M-215 ${oy} H200`, DK, 3); tip(g, 200, oy, 190, oy, DK, 3); still(g, `M${ox} ${oy + 25} V-140`, DK, 3); tip(g, ox, -140, ox, -130, DK, 3);
        lb(g, 200, oy + 28, '1/[S]', DK, 17, 'end'); lb(g, ox + 10, -126, '1/v₀', DK, 17, 'start');
        const L = (xint, yint, c, dsh) => { const s = yint / xint, x0 = ox - xint - 30, x1 = Math.min(195, ox + (oy - yint + 130) / s), y = x => oy - yint - s * (x - ox);
          (dsh ? dash : line)(g, `M${P(x0, y(x0))} L${P(x1, y(x1))}`, c, 3.5); return [x1, y(x1)]; };
        L(xi, yi, BLU);
        still(g, `M${ox - xi} ${oy - 6} v12`, DK, 2); lb(g, ox - xi, oy + 28, '−1/Km', TXT.blue, 16);
        still(g, `M${ox - 6} ${oy - yi} h12`, DK, 2); lb(g, ox + 10, oy - yi + 22, '1/Vmax', TXT.blue, 16, 'start');
        lb(g, 120, 0, 'slope = Km/Vmax', TXT.blue, 16, 'start');
        if (inh === 'competitive') { const [ex, ey] = L(xi * .4, yi, ORG, 1); lb(g, ex + 10, ey + 12, '+ inhibitor', TXT.orange, 16, 'start'); }
        if (inh === 'noncompetitive') { const [ex, ey] = L(xi, yi * 2.2, VIO, 1); lb(g, ex + 10, ey + 12, '+ inhibitor', VIO, 16, 'start'); }
        lb(g, 0, 160, note || '1/v₀ = (Km/Vmax)(1/[S]) + 1/Vmax', note ? IC : DK, 16);
      } else {
        const X = s => -180 + s * 36, Y = v => 120 - v * 210, mm = (vm, km) => x => { const s = (x + 180) / 36; return Y(vm * s / (km + s)); };
        axes(g, -180, 120, 205, -150, '[S]', 'reaction rate v₀');
        dash(g, `M-180 ${Y(1)} H190`, RED); lb(g, -188, Y(1) + 6, 'Vmax', TXT.red, 17, 'end');
        line(g, curve(mm(1, 2), -180, 180), BLU, 3.5);
        dash(g, `M-180 ${Y(.5)} H${X(2)} V120`, BLU, 2); lb(g, -188, Y(.5) + 6, 'Vmax/2', TXT.blue, 16, 'end'); lb(g, X(2), 144, 'Km', TXT.blue, 17);
        lb(g, 178, mm(1, 2)(180) - 12, 'no inhibitor', TXT.blue, 15, 'end');
        if (inh === 'competitive') { still(g, curve(mm(1, 6), -180, 180), ORG, 3, { 'stroke-dasharray': '9 7' }); lb(g, 178, mm(1, 6)(180) + 24, '+ competitive', TXT.orange, 15, 'end'); }
        if (inh === 'noncompetitive') { still(g, curve(mm(.5, 2), -180, 180), VIO, 3, { 'stroke-dasharray': '9 7' }); lb(g, 178, mm(.5, 2)(180) - 12, '+ noncompetitive', VIO, 15, 'end'); }
        if (note) lb(g, 10, 180, note, IC, 16);
      }
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "lightreactions cx cy width |text"
    lightreactions: ([cx, cy, W = 520], o, t, p) => {
      const g = G(cx, cy, W / 520, 0, p), m = 26;
      fl(g, R(-255, -170, 510, 140), '#eef6e8'); fl(g, R(-255, m, 510, 140), '#e6f0fa');
      part(g, R(-255, -m, 510, 2 * m), '#f3e3b8', '#b59a4a', 2);
      for (let x = -248; x < 255; x += 14) still(g, `M${x} ${-m + 3} v8 M${x} ${m - 3} v-8`, '#c9b27a', 1.5);
      const prot = (x, rx, ry, fill, ink, name, s = 15) => { part(g, E(x, 0, rx, ry), fill, ink, 2.5); lb(g, x, 5, name, '#fff', s); };
      prot(-180, 34, 50, '#5fae3a', '#2c6a22', 'PSII'); prot(-55, 28, 46, '#e08a3a', '#9a5410', 'b6f', 14); prot(70, 34, 50, '#5fae3a', '#2c6a22', 'PSI');
      // ATP synthase: F0 in the membrane, stalk, F1 head in the stroma
      part(g, R(185, -m - 2, 50, 2 * m + 4), '#c9b3e6', VIO, 2.5); part(g, R(204, -62, 12, 34), '#c9b3e6', VIO, 2); part(g, E(210, -92, 42, 32), '#c9b3e6', VIO, 2.5);
      // light onto both photosystems
      for (const [x, y] of [[-238, -150], [-8, -150]]) { const d = []; for (let i = 0; i <= 6; i++) d.push([x + i * 7 + (i % 2 ? 6 : -6), y + i * 13]); still(g, pts(d), '#d18b00', 3); tip(g, d[6][0], d[6][1], d[5][0], d[5][1], '#d18b00', 3); }
      lb(g, -230, -155, 'light', TXT.yellow, 16, 'end'); lb(g, -2, -155, 'light', TXT.yellow, 16, 'end');
      // water split in the lumen
      arrow(g, -200, 112, -190, 52, BLU, 2.5); lb(g, -205, 132, 'H₂O → ½O₂ + 2H⁺', TXT.blue, 15);
      // electron path
      line(g, smooth([[-170, -10], [-140, 0], [-118, 12], [-80, 10], [-55, 20], [-25, 50], [5, 58], [40, 45], [70, 20], [80, -20], [100, -50], [118, -58], [140, -70], [150, -100]]), ORG, 3.5);
      part(g, C(-118, 12, 15), '#fff', DK, 2); lb(g, -118, 17, 'Pq', DK, 15);
      part(g, C(5, 60, 15), '#fff', DK, 2); lb(g, 5, 65, 'Pc', DK, 15);
      part(g, C(118, -60, 15), '#fff', DK, 2); lb(g, 118, -55, 'Fd', DK, 15);
      tip(g, 150, -100, 147, -88, ORG, 3); lb(g, -86, -38, 'e⁻', TXT.orange, 18);
      lb(g, 150, -112, 'NADP⁺ + H⁺ → NADPH', TXT.green, 16, 'end');
      // b6f pumps H+ into the lumen; H+ flows back through ATP synthase
      arrow(g, -40, -110, -40, 105, RED, 2.5, true); lb(g, -40, -118, 'H⁺', TXT.red, 16);
      line(g, `M232 112 V-58`, RED, 3); tip(g, 232, -58, 232, -48, RED, 3); lb(g, 218, 118, 'H⁺', TXT.red, 16, 'end');
      lb(g, 205, -134, 'ADP + Pᵢ → ATP', TXT.green, 16);
      for (const [x, y] of [[-110, 95], [-5, 110], [60, 95], [130, 108], [175, 75]]) lb(g, x, y, 'H⁺', TXT.red, 14);
      lb(g, 250, -155, 'stroma', '#555', 17, 'end'); lb(g, 250, 160, 'thylakoid lumen (high H⁺)', '#555', 17, 'end');
      lb(g, 145, -4, 'thylakoid', '#8a7a40', 14); lb(g, 145, 13, 'membrane', '#8a7a40', 14);
      lb(g, 210, -94, 'ATP', DK, 15); lb(g, 210, -78, 'synthase', DK, 14);
      if (t) lb(g, 0, -185, t, TXT.blue, 20);
      return g;
    },
    // "calvin cx cy size |text"
    calvin: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), r = 112;
      const nodes = [[180, '3 RuBP'], [270, '6 3-PGA'], [0, '6 G3P'], [90, '5 G3P']], gap = { 180: 28, 270: 20, 0: 26, 90: 20 };
      nodes.forEach(([a], i) => { const b = nodes[(i + 1) % 4][0], a2 = b > a ? b : b + 360; arcA(g, r, a + gap[a], a2 - gap[b], GRN, 3.5); });
      nodes.forEach(([a, s]) => pill(g, ...pol(r, a), s, '#e3f1da', GRN, 18));
      // inputs and output
      const [ix, iy] = pol(r + 75, 225), [jx, jy] = pol(r + 6, 225); arrow(g, ix, iy, jx, jy, DK, 3); lb(g, ix - 4, iy - 8, '3 CO₂', DK, 17, 'end');
      lb(g, ...pol(r - 30, 222), 'rubisco', TXT.green, 14);
      const bo = (a, ta, tb, w = 13) => bounce(g, pol(r + 45, a - w), pol(r + 3, a), pol(r + 45, a + w), ta, tb, ORG, TXT.orange, TXT.orange, 16);
      bo(292, '6 ATP', '6 ADP'); bo(337, '6 NADPH', '6 NADP⁺'); bo(135, '3 ATP', '3 ADP');
      const [ox, oy] = pol(r + 8, 35), [px, py] = pol(r + 75, 35); arrow(g, ox, oy, px, py, RED, 3); lb(g, px + 4, py + 18, '1 G3P out', TXT.red, 16, 'start'); lb(g, px + 4, py + 37, '→ glucose, sugars', TXT.red, 14, 'start');
      lb(g, -50, -42, '① fixation', '#555', 15); lb(g, 50, -42, '② reduction', '#555', 15); lb(g, -30, 54, '③ regeneration', '#555', 15);
      lb(g, 0, 8, 'Calvin cycle', TXT.green, 20);
      lb(g, 0, r + 85, 'per 3 CO₂: 9 ATP, 6 NADPH → 1 G3P', DK, 16);
      if (t) lb(g, 0, -r - 70, t, TXT.blue, 20);
      return g;
    },
    // "glycolysis cx cy height |text"
    glycolysis: ([cx, cy, H = 440], o, t, p) => {
      const g = G(cx, cy, H / 440, 0, p), x = -30, st = 44, y0 = -198, Y = i => y0 + i * st;
      const names = ['glucose', 'G6P', 'F6P', 'F1,6BP', '2 G3P', '2 1,3-BPG', '2 3-PG', '2 2-PG', '2 PEP', '2 pyruvate'];
      for (let i = 0; i < 9; i++) arrow(g, x, Y(i) + 13, x, Y(i + 1) - 13, DK, 2.5);
      names.forEach((n, i) => pill(g, x, Y(i), n, i === 0 ? '#ffe7b0' : i === 9 ? '#f6c4b4' : '#fff', DK, 17));
      const bx = (i, a, b, ca, cb) => { const m = Y(i) + st / 2; bounce(g, [x + 58, m - 10], [x + 4, m], [x + 58, m + 10], a, b, ORG, ca, cb, 16); };
      bx(0, 'ATP', 'ADP', TXT.red, '#777'); bx(2, 'ATP', 'ADP', TXT.red, '#777');
      bx(4, '2 NAD⁺', '2 NADH', '#777', TXT.blue); bx(5, '2 ADP', '2 ATP', '#777', TXT.green); bx(8, '2 ADP', '2 ATP', '#777', TXT.green);
      for (const [i, e] of [[0, 'hexokinase'], [2, 'PFK-1'], [3, 'aldolase'], [8, 'pyruvate kinase']]) lb(g, x - 14, Y(i) + st / 2 + 5, e, '#888', 14, 'end');
      const br = (y0, y1, c, l1, l2) => { const xb = -140; still(g, `M${xb + 10} ${y0} H${xb} V${y1} H${xb + 10}`, c, 2.5);
        lb(g, xb - 8, (y0 + y1) / 2 - 4, l1, c, 17, 'end'); lb(g, xb - 8, (y0 + y1) / 2 + 16, l2, c, 15, 'end'); };
      br(Y(0) - 10, Y(4) - 4, TXT.red, 'energy investment', 'phase: uses 2 ATP'); br(Y(4) + 4, Y(9) + 10, TXT.green, 'energy payoff', 'phase: 4 ATP, 2 NADH');
      lb(g, 230, -190, 'net per glucose:', DK, 16, 'end'); lb(g, 230, -170, '2 ATP, 2 NADH,', DK, 16, 'end'); lb(g, 230, -150, '2 pyruvate', DK, 16, 'end');
      if (t) lb(g, 0, -228, t, TXT.blue, 20);
      return g;
    },
    // "krebs cx cy size |text"
    krebs: ([cx, cy, S = 340], o, t, p) => {
      const g = G(cx, cy, S / 340, 0, p), rx = 172, ry = 124, ep = (a, d = 0) => [(rx + d) * Math.cos(rad(a)), (ry + d) * Math.sin(rad(a))];
      const names = ['citrate', 'isocitrate', 'α-ketoglutarate', 'succinyl-CoA', 'succinate', 'fumarate', 'malate', 'oxaloacetate'];
      const A = i => -67.5 + 45 * i, gap = i => { const a = rad(A(i)), vx = -rx * Math.sin(a), vy = ry * Math.cos(a), sp = Math.hypot(vx, vy);
        return (tw(16, names[i].length) / 2 * Math.abs(vx / sp) + 14 * Math.abs(vy / sp) + 6) / sp * 180 / Math.PI; };
      for (let i = 0; i < 8; i++) { const a1 = A(i) + gap(i), a2 = A(i + 1) - gap((i + 1) % 8), q = []; for (let k = 0; k <= 30; k++) q.push(ep(a1 + (a2 - a1) * k / 30));
        line(g, pts(q), DK, 3); tip(g, ...q[30], ...q[27], DK, 3); }
      names.forEach((n, i) => pill(g, ...ep(A(i)), n, i === 7 ? '#f6dcc0' : '#fff', DK, 16));
      const out = (a, txt) => { const [x1, y1] = ep(a, 5), [x2, y2] = ep(a, 34), [lx, ly] = ep(a, 46), an = Math.cos(rad(a)) > .3 ? 'start' : Math.cos(rad(a)) < -.3 ? 'end' : 'middle';
        arrow(g, x1, y1, x2, y2, DK, 2.5); txt.forEach(([s, tc], k) => lb(g, lx, ly + 6 + (k - (txt.length - 1) / 2) * 19 + (Math.sin(rad(a)) > .5 ? 10 : 0), s, tc, 16, an)); };
      out(0, [['NADH', TXT.blue], ['CO₂', '#666']]); out(45, [['NADH', TXT.blue], ['CO₂', '#666']]); out(90, [['GTP (→ ATP)', TXT.green]]);
      out(135, [['FADH₂', VIO]]); out(225, [['NADH', TXT.blue]]);
      arrow(g, 0, -ry - 66, 0, -ry - 4, RED, 3.5); lb(g, 0, -ry - 74, 'acetyl-CoA (2C)', TXT.red, 17);
      lb(g, 0, -4, 'citric acid cycle', TXT.blue, 19); lb(g, 0, 18, '(Krebs cycle)', TXT.blue, 16);
      lb(g, 0, ry + 96, 'per acetyl-CoA: 3 NADH, 1 FADH₂, 1 GTP, 2 CO₂', '#555', 15);
      if (t) lb(g, 0, -ry - 102, t, TXT.blue, 20);
      return g;
    },
    // "atpsynthase cx cy size |text"
    atpsynthase: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), m = 24;
      fl(g, R(-200, -160, 400, 136), '#fbe3dc'); fl(g, R(-200, m, 400, 170), '#e6f0fa');
      part(g, R(-200, -m, 400, 2 * m), '#f3e3b8', '#b59a4a', 2);
      for (let x = -194; x < 200; x += 14) if (x < -70 || x > 95) still(g, `M${x} ${-m + 3} v8 M${x} ${m - 3} v-8`, '#c9b27a', 1.5);
      // F0 rotor ring (c subunits) + a subunit, central stalk, F1 head (α3β3), peripheral stator
      part(g, E(0, 0, 62, m + 4), '#c9b3e6', VIO, 2.5); for (let x = -45; x <= 45; x += 15) still(g, `M${x} ${-m + 2} V${m - 2}`, VIO, 1.5);
      part(g, R(64, -m - 4, 26, 2 * m + 8), '#b3d4f0', BLU, 2.5);
      part(g, R(-8, m + 4, 16, 52), '#c9b3e6', VIO, 2.5);
      still(g, `M86 ${m + 4} V120 Q86 132 70 132`, BLU, 5);
      for (let i = 0; i < 6; i++) { const x = -55 + i * 22; part(g, E(x, 112, 16, 30), i % 2 ? '#a7d18f' : '#e8d07a', i % 2 ? GRN : '#9a7a10', 2); }
      lb(g, 0, 155, 'F₁ head (α₃β₃)', DK, 15);
      // H+ through the a/c interface, rotation arrow
      for (const [x, y] of [[-150, -110], [-170, -70], [-30, -120], [20, -95], [140, -125], [170, -70]]) lb(g, x, y, 'H⁺', TXT.red, 16);
      line(g, `M78 -110 V-40 Q78 -10 58 0 Q40 14 50 60`, RED, 3.5); tip(g, 50, 60, 46, 48, RED, 3.5);
      line(g, `M-64 46 A70 20 0 0 0 64 46`, ORG, 3); tip(g, 64, 46, 54, 52, ORG, 3); lb(g, -72, 50, 'rotates', TXT.orange, 14, 'end');
      lb(g, -112, 88, 'ADP + Pᵢ', DK, 15, 'end'); arrow(g, -108, 100, -78, 112, DK, 2.5); arrow(g, 78, 112, 130, 100, GRN, 2.5); lb(g, 134, 104, 'ATP', TXT.green, 18, 'start');
      lb(g, -195, -140, 'intermembrane space (high H⁺)', '#555', 16, 'start'); lb(g, -195, 6, 'inner membrane', '#8a7a40', 14, 'start');
      lb(g, -195, 185, 'matrix (low H⁺)', '#555', 15, 'start'); lb(g, 96, 6, 'stator (a)', BLU, 14, 'start');
      still(g, 'M-95 -52 L-45 -16', VIO, 1.5); lb(g, -100, -56, 'F₀ rotor (c ring)', VIO, 15, 'end');
      lb(g, 12, 72, 'stalk', VIO, 14, 'start');
      if (t) lb(g, 0, -180, t, TXT.blue, 20);
      return g;
    },
    // "codon cx cy width |text"
    codon: ([cx, cy, W = 520], o, t, p) => {
      const g = G(cx, cy, W / 520, 0, p), B = 'UCAG', aa = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
      const three = { F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', '*': 'Stop', C: 'Cys', W: 'Trp', P: 'Pro', H: 'His', Q: 'Gln', R: 'Arg', I: 'Ile', M: 'Met', T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp', E: 'Glu', G: 'Gly' };
      const x0 = -215, y0 = -150, cw = 110, ch = 86, rh = 19;
      part(g, R(x0, y0, 4 * cw, 4 * ch), '#fff', DK, 2.5);
      for (let i = 1; i < 4; i++) still(g, `M${x0 + i * cw} ${y0} v${4 * ch} M${x0} ${y0 + i * ch} h${4 * cw}`, DK, 2);
      for (let i = 0; i < 4; i++) {
        lb(g, x0 + cw * (i + .5), y0 - 10, B[i], DK, 20); lb(g, x0 - 16, y0 + ch * (i + .5) + 7, B[i], DK, 20);
        for (let k = 0; k < 4; k++) lb(g, x0 + 4 * cw + 14, y0 + ch * i + 15 + k * rh + 4, B[k], '#888', 13);
      }
      lb(g, x0 + 2 * cw, y0 - 34, 'second base', DK, 16); lb(g, x0 - 16, y0 - 14, '1st', DK, 13); lb(g, x0 + 4 * cw + 14, y0 - 14, '3rd', DK, 13);
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) for (let c = 0; c < 4; c++) {
        const L = aa[16 * a + 4 * b + c], cod = B[a] + B[b] + B[c], x = x0 + b * cw + 10, y = y0 + a * ch + 15 + c * rh + 4;
        const st = L === '*', go = cod === 'AUG';
        if (st || go) fl(g, rr(x - 5, y - 14, cw - 10, rh - 1, 5), st ? '#f6c4b4' : '#cdeabf');
        lb(g, x, y, cod, DK, 14, 'start'); lb(g, x + 44, y, three[L], st ? TXT.red : go ? TXT.green : TXT.blue, 14, 'start');
      }
      lb(g, x0 - 16, y0 + 4 * ch + 26, 'mRNA codons read 5′ → 3′; green = start, red = stop', '#555', 14, 'start');
      if (t) lb(g, 0, y0 - 58, t, TXT.blue, 20);
      return g;
    },
    // "operon cx cy width k=off|on |text"
    operon: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), on = o.k === 'on', y = 30;
      still(g, `M-245 ${y - 7} H245 M-245 ${y + 7} H245`, DK, 2.5);
      const seg = (x0, x1, name, fill, ink, c = '#fff', s = 15) => { part(g, R(x0, y - 15, x1 - x0, 30), fill, ink, 2.5); lb(g, (x0 + x1) / 2, y + 6, name, c, s); };
      seg(-235, -170, 'lacI', '#a0a6ad', '#5a6068'); seg(-140, -95, 'P', '#e8d07a', '#9a7a10', DK); seg(-95, -55, 'O', '#f6c4b4', RED, DK);
      seg(-55, 65, 'lacZ', '#5f9ad8', BLU); seg(65, 145, 'lacY', '#5fae3a', GRN); seg(145, 220, 'lacA', '#e08a3a', '#9a5410');
      lb(g, -117, y + 40, 'promoter', '#777', 14); lb(g, -75, y + 58, 'operator', '#777', 14); lb(g, -202, y + 40, 'regulatory gene', '#777', 14);
      const repr = (x, yy) => part(g, `M${x - 26} ${yy + 14} Q${x - 30} ${yy - 22} ${x} ${yy - 20} Q${x + 30} ${yy - 22} ${x + 26} ${yy + 14} L${x + 12} ${yy + 4} L${x} ${yy + 14} L${x - 12} ${yy + 4} Z`, '#e04b3a', '#7a1f1f', 2.5);
      arrow(g, -202, y - 20, -202, -45, GRY, 2); lb(g, -198, -55, 'repressor made', '#777', 14, 'start');
      if (!on) {
        repr(-75, y - 30); lb(g, -75, y - 62, 'repressor', TXT.red, 16);
        part(g, E(-130, y - 32, 32, 18), '#c9b3e6', VIO, 2.5); lb(g, -130, y - 27, 'RNA pol', VIO, 14);
        lb(g, 90, y - 80, 'no lactose: repressor binds', TXT.red, 17); lb(g, 90, y - 58, 'operator, blocks RNA polymerase', TXT.red, 17);
        lb(g, 0, y + 95, 'genes OFF: no lac mRNA', DK, 17);
      } else {
        repr(-140, -110); part(g, 'M-148 -118 l8 -5 l8 5 v9 l-8 5 l-8 -5 Z', '#ffd84a', '#b58a10', 2);
        lb(g, -95, -112, 'repressor + allolactose', TXT.red, 16, 'start'); lb(g, -95, -93, '(inactive, off DNA)', TXT.red, 15, 'start');
        part(g, E(-15, y - 32, 32, 18), '#c9b3e6', VIO, 2.5); lb(g, -15, y - 27, 'RNA pol', VIO, 14);
        line(g, curve(x => y - 60 + 5 * Math.sin(x / 7), 15, 215), VIO, 3); tip(g, 215, y - 60 + 5 * Math.sin(215 / 7), 205, y - 60 + 5 * Math.sin(205 / 7), VIO, 3);
        lb(g, 115, y - 75, 'mRNA (lacZ, lacY, lacA)', VIO, 15);
        lb(g, 0, y + 95, 'lactose present: genes ON, transcribed together', DK, 17);
      }
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "pedigree cx cy width k=dominant|recessive|xlinked |text"
    pedigree: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), k = { recessive: 1, xlinked: 2 }[o.k] || 0, h = 14;
      const fam = [['Ma', 'Fu', 'Ma', 'Fu', 'Ma', 'Fu', 'Fa', 'Mu', 'Ma', 'Fu'], ['Mc', 'Fc', 'Mu', 'Fa', 'Mc', 'Fc', 'Fu', 'Ma', 'Fu', 'Mu'], ['Mu', 'Fx', 'Ma', 'Fu', 'Fx', 'Mu', 'Ma', 'Fu', 'Mu', 'Fu']][k];
      const yI = -140, yII = -30, yIII = 80, pos = [[-135, yI], [-55, yI], [-170, yII], [-95, yII], [-20, yII], [60, yII], [-70, yIII], [-10, yIII], [50, yIII], [110, yIII]];
      const sym = (x, y, s) => { const male = s[0] === 'M', o = male ? R(x - h, y - h, 2 * h, 2 * h) : C(x, y, h);
        fl(g, o, '#fff'); if (s[1] === 'a') fl(g, o, '#4a4f57');
        if (s[1] === 'c') fl(g, male ? R(x - h, y - h, h, 2 * h) : `M${x} ${y - h} A${h} ${h} 0 0 0 ${x} ${y + h} Z`, '#4a4f57');
        if (s[1] === 'x') fl(g, C(x, y, 4.5), '#4a4f57');
        still(g, o, DK, 2.5); };
      // matings and descent lines
      still(g, `M${-135 + h} ${yI} H${-55 - h} M-95 ${yI} V${yII - 45} M-170 ${yII - 45} H-20 M-170 ${yII - 45} V${yII - h} M-95 ${yII - 45} V${yII - h} M-20 ${yII - 45} V${yII - h}`, DK, 2.5);
      still(g, `M${-20 + h} ${yII} H${60 - h} M20 ${yII} V${yIII - 45} M-70 ${yIII - 45} H110 ${[-70, -10, 50, 110].map(x => `M${x} ${yIII - 45} V${yIII - h}`).join(' ')}`, DK, 2.5);
      fam.forEach((s, i) => sym(...pos[i], s));
      const num = [1, 2, 1, 2, 3, 4, 1, 2, 3, 4]; pos.forEach(([x, y], i) => lb(g, x, y + 33, String(num[i]), '#888', 14));
      [['I', yI], ['II', yII], ['III', yIII]].forEach(([n, y]) => lb(g, -225, y + 7, n, DK, 20, 'start'));
      // legend
      const lx = 160; [['Ma', 'affected'], ['Mu', 'unaffected'], [k === 2 ? 'Fx' : 'Mc', 'carrier']].slice(0, k ? 3 : 2).forEach(([s, n], i) => { sym(lx, -135 + i * 38, s); lb(g, lx + 22, -129 + i * 38, n, '#555', 15, 'start'); });
      lb(g, lx - 14, -168, '□ male  ○ female', '#555', 16, 'start');
      const note = [['autosomal dominant', 'every generation; affected father → affected son'], ['autosomal recessive', 'skips a generation; carrier × carrier → ¼ affected'], ['X-linked recessive', 'mostly males; carrier mother → ½ of sons affected']][k];
      lb(g, 0, 145, note[0], TXT.blue, 18); lb(g, 0, 167, note[1], '#555', 15);
      if (t) lb(g, 0, -185, t, TXT.blue, 20);
      return g;
    },
    // "hardyweinberg cx cy width |text"
    hardyweinberg: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), X = q => -170 + q * 340, Y = f => 120 - f * 240, F = h => x => Y(h((x + 170) / 340));
      axes(g, -170, 120, 200, -145, '', 'genotype frequency');
      for (const q of [0, .5, 1]) { still(g, `M${X(q)} 120 v8`, DK, 2); lb(g, X(q), 146, String(q), DK, 15); }
      for (const f of [.5, 1]) { still(g, `M-170 ${Y(f)} h-8`, DK, 2); lb(g, -182, Y(f) + 5, String(f), DK, 15, 'end'); }
      lb(g, 0, 172, 'allele frequency p (of A);  q = 1 − p', DK, 16);
      line(g, curve(F(p => p * p), -170, 170), BLU, 3.5); line(g, curve(F(p => (1 - p) ** 2), -170, 170), RED, 3.5); line(g, curve(F(p => 2 * p * (1 - p)), -170, 170), GRN, 3.5);
      dash(g, `M${X(.5)} ${Y(.5)} V120`, GRY, 1.5);
      lb(g, X(.72), Y(.85), 'AA = p²', TXT.blue, 18, 'end'); lb(g, X(.28), Y(.85), 'aa = q²', TXT.red, 18, 'start'); lb(g, 0, Y(.5) - 10, 'Aa = 2pq', TXT.green, 17);
      lb(g, 50, -128, 'p² + 2pq + q² = 1', DK, 20); lb(g, 50, -106, 'p + q = 1', '#555', 16);
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "pcrcycle cx cy width |text"
    pcrcycle: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), T = [95, 55, 72], cs = [RED, BLU, ORG], nm = ['denature', 'anneal', 'extend'];
      [-165, 0, 165].forEach((x, i) => {
        part(g, rr(x - 72, -190, 144, 120, 10), '#fbfbf8', '#b9c0c7', 2);
        lb(g, x, -168, `${i + 1} ${nm[i]} ${T[i]}°C`, cs[i] === ORG ? TXT.orange : cs[i], 17);
        const a = x - 55, b = x + 55, yt = -140, yb = -100;
        still(g, `M${a} ${yt} H${b}`, BLU, 3.5); still(g, `M${a} ${yb} H${b}`, '#5fae3a', 3.5);
        if (i === 0) { lb(g, x, -114, '↑  ↓', '#888', 14); }
        if (i >= 1) { still(g, `M${b - 22} ${yt + 8} H${b}`, RED, 5); still(g, `M${a} ${yb - 8} H${a + 22}`, RED, 5); }
        if (i === 2) { line(g, `M${b - 24} ${yt + 8} H${a + 10}`, ORG, 3.5); tip(g, a + 10, yt + 8, a + 20, yt + 8, ORG, 3); line(g, `M${a + 24} ${yb - 8} H${b - 10}`, ORG, 3.5); tip(g, b - 10, yb - 8, b - 20, yb - 8, ORG, 3);
          lb(g, x, -78, 'Taq polymerase', TXT.orange, 15); }
        if (i === 1) lb(g, x, -78, 'primers bind', TXT.red, 15);
        if (i === 0) lb(g, x, -78, 'strands separate', TXT.red, 15);
        if (i < 2) arrow(g, x + 75, -130, x + 90, -130, DK, 2.5);
      });
      lb(g, 0, -42, 'copies double each cycle: 1 → 2 → 4 → 8 … 2ⁿ after n cycles', DK, 16);
      // temperature vs time
      const Yt = c => 175 - (c - 20) * 1.8, x0 = -215;
      axes(g, x0, 175, 235, -15, 'time', '°C');
      const d = [[x0, Yt(25)], [x0 + 15, Yt(25)]]; let x = x0 + 15;
      for (let c = 0; c < 2; c++) for (const tc of T) { d.push([x + 6, Yt(tc)]); d.push([x + 66, Yt(tc)]); x += 66; }
      line(g, pts(d), RED, 3);
      T.forEach((tc, i) => lb(g, x0 + 51 + i * 66, Yt(tc) - 8, `${tc}°C`, cs[i] === ORG ? TXT.orange : cs[i], 16));
      still(g, `M${x0 + 18} 185 h196`, '#888', 2); lb(g, x0 + 117, 202, 'one cycle', '#888', 14);
      lb(g, 225, 60, 'repeat 25–35×', DK, 16, 'end');
      if (t) lb(g, 0, -210, t, TXT.blue, 20);
      return g;
    },
    // "speciation cx cy width k=allopatric|sympatric |text"
    speciation: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), sym = o.k === 'sympatric', ry = 60, rx = 64;
      const dots = (x, pick, seed) => { const r = rnd(seed), got = []; for (let n = 0; n < 16; n++) { let u, v, k = 0; do { u = r() * 2 - 1; v = r() * 2 - 1; k++; }
          while (k < 400 && (u * u + v * v > .72 || Math.abs(u) < (sym ? 0 : .2) || got.some(([a, b]) => Math.hypot((a - u) * rx, (b - v) * ry) < 17))); got.push([u, v]);
        const [c, sh] = pick(u, n), px = x + u * rx, py = -20 + v * ry;
        if (sh) part(g, `M${P(px, py - 7)} L${P(px + 7, py + 5)} L${P(px - 7, py + 5)} Z`, c, DK, 1.5); else part(g, C(px, py, 5.5), c, DK, 1.5); } };
      const land = x => part(g, E(x, -20, rx + 8, ry + 8), '#e3f1da', '#7aa860', 2.5);
      const river = x => { fl(g, `M${x - 10} ${-20 - ry - 8} Q${x + 8} -40 ${x - 6} -20 T${x - 2} ${-20 + ry + 8} H${x + 12} Q${x + 24} 0 ${x + 8} -20 T${x + 10} ${-20 - ry - 8} Z`, '#7fb7ea');
        still(g, `M${x - 10} ${-20 - ry - 8} Q${x + 8} -40 ${x - 6} -20 T${x - 2} ${-20 + ry + 8} M${x + 10} ${-20 - ry - 8} Q${x - 6} -40 ${x + 8} -20 T${x + 12} ${-20 + ry + 8}`, BLU, 2); };
      const BL = '#5f9ad8', OR = '#f4a531';
      [-165, 0, 165].forEach(x => land(x));
      dots(-165, () => [BL, 0], 7);
      if (sym) {
        dots(0, (u, n) => n % 5 === 0 ? [OR, 0] : [BL, 0], 11);
        dots(165, (u, n) => n % 2 ? [OR, 1] : [BL, 0], 13);
      } else {
        river(0); river(165);
        dots(0, () => [BL, 0], 11);
        dots(165, u => u > 0 ? [OR, 1] : [BL, 0], 13);
        lb(g, 0, -95, 'river (barrier)', TXT.blue, 15);
      }
      arrow(g, -94, -20, -74, -20, DK, 2.5); arrow(g, 71, -20, 91, -20, DK, 2.5);
      const cap = sym ? [['one population', ''], ['subgroup diverges', 'in the same area'], ['two species', 'no physical barrier']] : [['one population', ''], ['barrier splits it:', 'no gene flow'], ['two species', 'reproductively isolated']];
      cap.forEach(([a, b], i) => { lb(g, -165 + i * 165, 75, a, DK, 16); if (b) lb(g, -165 + i * 165, 94, b, '#666', 15); });
      still(g, 'M-230 115 H230', DK, 2.5); tip(g, 230, 115, 220, 115, DK, 2.5); lb(g, 228, 136, 'time', DK, 15, 'end');
      lb(g, -230, 136, sym ? 'sympatric: e.g. polyploidy, habitat or mate choice' : 'allopatric: geographic isolation', TXT.blue, 15, 'start');
      if (t) lb(g, 0, -110, t, TXT.blue, 20);
      return g;
    },
    // "popgrowth cx cy width |text"
    popgrowth: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), Y = n => 120 - n * 170, tt = x => (x + 180) / 36;
      axes(g, -180, 120, 205, -150, 'time', 'population size N');
      dash(g, `M-180 ${Y(1)} H195`, RED); lb(g, -186, Y(1) + 6, 'K', TXT.red, 19, 'end'); lb(g, 195, Y(1) - 8, 'carrying capacity', TXT.red, 15, 'end');
      const xe = -180 + 36 * Math.log(1.55 / .03) / .55;
      line(g, curve(x => Y(.03 * Math.exp(.55 * tt(x))), -180, xe), ORG, 3.5);
      line(g, curve(x => Y(1 / (1 + (1 / .03 - 1) * Math.exp(-.85 * tt(x)))), -180, 190), BLU, 3.5);
      lb(g, 45, -128, 'exponential (J)', TXT.orange, 17, 'end'); lb(g, 45, -108, 'dN/dt = rN', TXT.orange, 15, 'end');
      lb(g, 60, 0, 'logistic (S)', TXT.blue, 17, 'start'); lb(g, 60, 20, 'dN/dt = rN (K − N)/K', TXT.blue, 15, 'start');
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "actionpotential cx cy width |text"
    actionpotential: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), X = ms => -160 + ms * 70, Y = v => -60 - v * 2;
      still(g, `M-160 ${Y(-100)} V-150`, DK, 3); tip(g, -160, -150, -160, -140, DK, 3); still(g, `M-160 ${Y(-100)} H210`, DK, 3); tip(g, 210, Y(-100), 200, Y(-100), DK, 3);
      lb(g, 210, Y(-100) + 24, 'time (ms)', DK, 16, 'end'); lb(g, -152, -142, 'membrane potential (mV)', DK, 16, 'start');
      for (const [v, s, c] of [[0, '0', GRY], [-55, '−55', RED], [-70, '−70', BLU]]) { dash(g, `M-160 ${Y(v)} H200`, c, 1.5); lb(g, -168, Y(v) + 5, s, c === GRY ? DK : c, 15, 'end'); }
      still(g, `M-160 ${Y(30)} h-8`, DK, 2); lb(g, -172, Y(30) + 5, '+30', DK, 15, 'end');
      for (let ms = 1; ms <= 4; ms++) { still(g, `M${X(ms)} ${Y(-100)} v6`, DK, 2); lb(g, X(ms), Y(-100) + 22, String(ms), '#777', 13); }
      const k = [[0, -70], [.8, -70], [1.1, -64], [1.3, -55], [1.55, -10], [1.75, 26], [1.9, 30], [2.05, 20], [2.4, -30], [2.7, -68], [3.0, -80], [3.5, -76], [4.2, -71], [5, -70]];
      line(g, smooth(k.map(([a, v]) => [X(a), Y(v)])), RED, 3.5);
      lb(g, X(.4), Y(-70) - 8, 'resting', TXT.blue, 15); lb(g, X(.55), Y(-55) - 8, 'threshold', TXT.red, 15);
      lb(g, X(1.45) - 8, Y(0) - 22, 'depolarization', DK, 15, 'end'); lb(g, X(1.45) - 8, Y(0) - 4, 'Na⁺ in', TXT.orange, 15, 'end');
      lb(g, X(2.35) + 10, Y(0) - 22, 'repolarization', DK, 15, 'start'); lb(g, X(2.35) + 10, Y(0) - 4, 'K⁺ out', TXT.blue, 15, 'start');
      lb(g, X(3.1), Y(-80) + 26, 'hyperpolarization', VIO, 15);
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "o2curve cx cy width |text"
    o2curve: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), X = q => -170 + q * 3.5, Y = s => 120 - s * 2.4, hill = p50 => x => { const q = Math.max(0, (x + 170) / 3.5); return Y(100 * q ** 2.7 / (p50 ** 2.7 + q ** 2.7)); };
      axes(g, -170, 120, 200, -140, '', '% O₂ saturation of hemoglobin'); lb(g, 70, 170, 'pO₂ (mmHg)', DK, 17);
      for (const q of [20, 40, 60, 80, 100]) { still(g, `M${X(q)} 120 v7`, DK, 2); lb(g, X(q), 145, String(q), '#777', 14); }
      for (const s of [50, 100]) { still(g, `M-170 ${Y(s)} h-7`, DK, 2); lb(g, -180, Y(s) + 5, String(s), '#777', 14, 'end'); }
      line(g, curve(hill(26), -170, 180), RED, 3.5);
      still(g, curve(hill(36), -170, 180), VIO, 3, { 'stroke-dasharray': '9 7' });
      dash(g, `M-170 ${Y(50)} H${X(26)} V120`, GRY, 1.5); lb(g, X(26) - 4, 165, 'P₅₀ ≈ 26', '#777', 13);
      arrow(g, X(28), Y(60), X(46), Y(60), VIO, 2.5);
      lb(g, X(56), Y(30) - 6, 'right shift (Bohr effect):', VIO, 15, 'start'); lb(g, X(56), Y(30) + 14, '↑CO₂, ↑H⁺ (↓pH), ↑temperature', VIO, 14, 'start');
      lb(g, X(17), Y(62), 'normal', TXT.red, 16, 'end');
      lb(g, X(40), Y(8), 'tissues', '#555', 14); lb(g, X(100), Y(8), 'lungs', '#555', 14, 'end');
      dash(g, `M${X(40)} 120 V${Y(75)}`, '#bbb', 1.5); dash(g, `M${X(100)} 120 V${Y(97)}`, '#bbb', 1.5);
      if (t) lb(g, 0, -172, t, TXT.blue, 20);
      return g;
    },
    // "proteinlevels cx cy width |text"
    proteinlevels: ([cx, cy, W = 520], o, t, p) => {
      const g = G(cx, cy, W / 520, 0, p), cols = ['#e04b3a', '#f4a531', '#5fae3a', '#7fb7ea', '#b38ad8'];
      [-195, -65, 65, 195].forEach(x => part(g, rr(x - 62, -120, 124, 220, 10), '#fbfbf8', '#c9ced4', 1.5));
      // primary: a chain of amino-acid beads, N to C
      const bead = []; for (let i = 0; i < 12; i++) { const row = Math.floor(i / 4), j = row % 2 ? 3 - i % 4 : i % 4; bead.push([-237 + j * 28, -70 + row * 55 + (i % 2) * 8]); }
      still(g, smooth(bead), DK, 2.5); bead.forEach(([x, y], i) => part(g, C(x, y, 10), cols[(i * 3) % 5], DK, 2));
      lb(g, -237, -88, 'N', DK, 15); lb(g, -237 + 84, bead[11][1] + 28, 'C', DK, 15);
      // secondary: α-helix coil and β-sheet strands
      let hx = ''; for (let i = 0; i <= 120; i++) { const s = i / 120 * 5 * 2 * Math.PI; hx += (i ? ' L' : 'M') + P(-65 + 24 * Math.sin(s), -92 + i * .6 + 7 * Math.cos(s)); }
      still(g, hx, RED, 3); lb(g, -65, 2, 'α-helix', TXT.red, 15);
      for (const [y, d] of [[22, 1], [46, -1], [70, 1]]) { const a = d > 0 ? -105 : -25, b = d > 0 ? -25 : -105;
        part(g, `M${a} ${y - 6} L${b - 14 * d} ${y - 6} L${b - 14 * d} ${y - 11} L${b} ${y} L${b - 14 * d} ${y + 11} L${b - 14 * d} ${y + 6} L${a} ${y + 6} Z`, '#f4a531', '#9a5410', 2); }
      for (const x of [-90, -65, -40]) dash(g, `M${x} 28 V40 M${x} 52 V64`, GRY, 1.5); lb(g, -65, 94, 'β-sheet', TXT.orange, 15);
      // tertiary: one chain folded in 3-D
      let h = ''; for (let i = 0; i <= 80; i++) { const u = i / 80 * 4 * 2 * Math.PI; h += (i ? ' L' : 'M') + P(30 + 12 * Math.sin(u), -85 + i * .7 + 4 * Math.cos(u)); }
      still(g, h, RED, 3);
      still(g, smooth([[30, -29], [40, -5], [70, 10], [95, -10], [100, -50], [80, -80], [60, -60], [62, -25], [40, 30], [55, 70], [90, 72], [100, 40], [80, 25]]), BLU, 3.5);
      dash(g, 'M62 -38 L95 -22', '#d18b00', 2.5); lb(g, 100, -24, 'S–S', '#9a7a10', 14, 'start');
      // quaternary: four subunits (α2β2, as in hemoglobin)
      [[-26, -26, '#f6c4b4', RED], [26, -26, '#c6dcf2', BLU], [-26, 26, '#c6dcf2', BLU], [26, 26, '#f6c4b4', RED]].forEach(([dx, dy, f, c]) => {
        part(g, E(195 + dx, -10 + dy, 27, 25), f, c, 2.5); lb(g, 195 + dx, -3 + dy, c === RED ? 'α' : 'β', c, 20); });
      lb(g, 195, 62, 'e.g. hemoglobin', '#777', 14); lb(g, 195, 80, '(2 α + 2 β)', '#777', 14);
      [['primary', 'amino acid sequence'], ['secondary', 'H-bonds in backbone'], ['tertiary', '3-D fold of one chain'], ['quaternary', 'several subunits']].forEach(([a, b], i) => {
        lb(g, -195 + i * 130, 125, a, DK, 18); lb(g, -195 + i * 130, 146, b, '#666', 15); });
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "elisa cx cy width k=elisa|western |text"
    elisa: ([cx, cy, W = 520], o, t, p) => {
      const g = G(cx, cy, W / 520, 0, p), xs = [-195, -65, 65, 195], AG = '#e04b3a';
      if (o.k === 'western') {
        const lanes = x => [x - 28, x, x + 28];
        // 1 gel
        part(g, R(-240, -90, 90, 140), '#dfe6ee', '#7a8a9a', 2.5); lanes(-195).forEach(l => fl(g, R(l - 10, -86, 20, 6), '#7a8a9a'));
        lanes(-195).forEach((l, j) => [-60, -40, -22, -5, 15, 32].forEach((y, k) => (k + j) % 3 !== 2 && still(g, `M${l - 10} ${y + j * 3} h20`, '#5a6a8a', 3.5)));
        lb(g, -248, -76, '−', DK, 18, 'end'); lb(g, -248, 48, '+', DK, 18, 'end'); arrow(g, -142, -60, -142, 30, GRY, 2);
        // 2 transfer
        part(g, R(-108, -70, 30, 120), '#dfe6ee', '#7a8a9a', 2.5); part(g, R(-74, -70, 16, 120), '#fff', DK, 2.5);
        for (const y of [-40, 0, 30]) arrow(g, -120, y, -40, y, ORG, 2.5, true);
        lb(g, -93, -80, 'gel', '#777', 14); lb(g, -62, -80, 'membrane', '#777', 14, 'start');
        // 3 antibodies on the membrane
        part(g, R(25, -90, 80, 140), '#fff', DK, 2.5); still(g, 'M40 0 h50', '#d0a0a0', 4);
        ab(g, 65, -15, BLU, -1); ab(g, 65, -42, GRN, -1); enz(g, 65, -64);
        lb(g, 65, 22, '1° antibody', TXT.blue, 14); lb(g, 65, 40, '2° + enzyme', TXT.green, 14);
        // 4 bands
        part(g, R(150, -90, 90, 140), '#fff', DK, 2.5);
        [-70, -45, -20, 10, 35].forEach(y => still(g, `M158 ${y} h16`, '#888', 3)); ['100', '50', '25'].forEach((s, k) => lb(g, 146, [-66, -16, 39][k], s, '#777', 13, 'end'));
        [195, 222].forEach(x => still(g, `M${x - 10} -2 h20`, '#2a2a2a', 6));
        lb(g, 146, -96, 'kDa', '#777', 13, 'end');
        [['gel electrophoresis', 'SDS-PAGE: size'], ['transfer', 'blot onto membrane'], ['antibody probe', 'binds target protein'], ['detection', 'bands = target, size']].forEach(([a, b], i) => {
          lb(g, xs[i], 82, a, DK, 15); lb(g, xs[i], 101, b, '#666', 13); });
      } else {
        const well = x => { fl(g, `M${x - 45} -40 V40 Q${x - 45} 60 ${x - 25} 60 H${x + 25} Q${x + 45} 60 ${x + 45} 40 V-40 Z`, '#f2f5f8');
          still(g, `M${x - 45} -60 V40 Q${x - 45} 60 ${x - 25} 60 H${x + 25} Q${x + 45} 60 ${x + 45} 40 V-60`, '#5a6068', 3); };
        fl(g, `M${xs[3] - 45} -20 V40 Q${xs[3] - 45} 60 ${xs[3] - 25} 60 H${xs[3] + 25} Q${xs[3] + 45} 60 ${xs[3] + 45} 40 V-20 Z`, '#ffd84a');
        xs.forEach((x, i) => { if (i < 3) well(x); else still(g, `M${x - 45} -60 V40 Q${x - 45} 60 ${x - 25} 60 H${x + 25} Q${x + 45} 60 ${x + 45} 40 V-60`, '#5a6068', 3);
          for (const dx of [-24, 0, 24]) { ab(g, x + dx, 40, BLU, 1); if (i >= 1) part(g, C(x + dx, 22, 6), AG, '#7a1f1f', 1.5);
            if (i >= 2) { ab(g, x + dx, 6, GRN, -1); enz(g, x + dx, -16); } } });
        [['capture antibody', 'coats the well'], ['add sample:', 'antigen binds'], ['detection antibody', 'with enzyme'], ['substrate →', 'coloured product']].forEach(([a, b], i) => {
          lb(g, xs[i], 88, a, DK, 15); lb(g, xs[i], 107, b, '#666', 13); });
        lb(g, 0, 140, 'wash between steps; colour intensity ∝ amount of antigen', '#555', 14);
        for (let i = 0; i < 3; i++) arrow(g, xs[i] + 50, -80, xs[i + 1] - 50, -80, DK, 2.5);
      }
      if (t) lb(g, 0, -130, t, TXT.blue, 20);
      return g;
    },
  });
})();
