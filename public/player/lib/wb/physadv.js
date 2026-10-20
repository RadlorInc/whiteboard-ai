// Whiteboard library — physadv: AP Physics 1/2/C to graduate level (founder, 19 Oct 2026).
// Orbits, rotation, oscillations, fluids, waves, fields, circuits, AC, modern and particle physics, astrophysics.
// Catalogue: physadv.txt. Only the physics subject prompt lists these. Same helpers and look as physuni.js.
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
  const showLab = o => o.lab !== '0' && o.labels !== '0';   // lab=0 / labels=0 hide the recipe's own words
  const curve = (f, x0, x1, n = 160) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? ' L' : 'M') + P(x, f(x)); } return d; };
  const pts = a => 'M' + a.map(p => P(p[0], p[1])).join(' L');
  const axes = (g, x0, y0, x1, y1, xl, yl) => { still(g, `M${x0} ${y1} V${y0} H${x1}`, DK, 3); tip(g, x0, y1, x0, y1 + 10, DK, 3); tip(g, x1, y0, x1 - 10, y0, DK, 3);
    if (xl) lb(g, x1, y0 + 26, xl, DK, 17, 'end'); if (yl) lb(g, x0 + 8, y1 + 4, yl, DK, 17, 'start'); };
  // a wavy line from a to b (photon, W boson); with an arrowhead unless bare
  const wavy = (g, x1, y1, x2, y2, c = VIO, waves = 5, A = 7, bare = false) => { const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, a = [];
    for (let i = 0; i <= 100; i++) { const s = i / 100, w = A * Math.sin(s * waves * 2 * Math.PI) * (bare || s < .9 ? 1 : (1 - s) * 10); a.push([x1 + ux * L * s - uy * w, y1 + uy * L * s + ux * w]); }
    line(g, pts(a), c, 2.5); if (!bare) tip(g, x2, y2, x2 - ux * 10, y2 - uy * 10, c, 2.5); };
  const photon = (g, x1, y1, x2, y2, c = VIO, waves = 5, A = 7) => wavy(g, x1, y1, x2, y2, c, waves, A);
  // straight fermion line with an arrow at its middle (back = arrow against the drawn direction: antiparticle)
  const fermion = (g, x1, y1, x2, y2, back = false, c = DK) => { still(g, `M${P(x1, y1)} L${P(x2, y2)}`, c, 3);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L = Math.hypot(x2 - x1, y2 - y1), s = (back ? -8 : 8) / L; tip(g, mx + (x2 - x1) * s, my + (y2 - y1) * s, mx - (x2 - x1) * s, my - (y2 - y1) * s, c, 3); };
  const charge = (g, x, y, q, r = 16) => { part(g, C(x, y, r), q > 0 ? '#e04b3a' : '#5b86c8', q > 0 ? '#7a1f1f' : '#1f3f7a', 2.5); lb(g, x, y + 7, q > 0 ? '+' : '−', '#fff', 22); };
  const zig = (x0, x1, y, n = 6, h = 10) => { let d = `M${x0} ${y}`; const s = (x1 - x0) / n; for (let i = 0; i < n; i++) d += ` L${P(x0 + s * (i + .5), y + (i % 2 ? h : -h))}`; return d + ` L${x1} ${y}`; };
  const crosses = (g, x0, x1, y0, y1, step, skip = () => false) => { for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) if (!skip(x, y)) lb(g, x, y + 7, '×', '#9aa0a8', 20); };
  // a label with a superscript (Kalam has no ⁻ glyph): base then a small raised part
  const sup = (g, x, y, base, sp, c = DK, s = 18, a = 'middle') => { const wb = .5 * s * [...base].length, ws = .36 * s * [...sp].length, x0 = a === 'end' ? x - wb - ws : a === 'start' ? x : x - (wb + ws) / 2;
    lb(g, x0, y, base, c, s, 'start'); lb(g, x0 + wb, y - s * .42, sp, c, s * .68, 'start'); };
  const legend = (g, x, y, rows, show = true) => rows.forEach(([c, s], i) => { still(g, `M${x} ${y + i * 22} h26`, c, 3.5); if (show) lb(g, x + 34, y + i * 22 + 5, s, c, 15, 'start'); });

  Object.assign(window.RECIPES, {
    // "kepler cx cy width k=ellipse|areas |text"
    kepler: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), areas = o.k === 'areas', a = 172, e = .55, b = a * Math.sqrt(1 - e * e), c = a * e;
      const at = Ea => [a * Math.cos(Ea), -b * Math.sin(Ea)];  // eccentric anomaly → point; counter-clockwise on screen
      const ecc = M => { let x = M; for (let i = 0; i < 30; i++) x -= (x - e * Math.sin(x) - M) / (1 - e * Math.cos(x)); return x; };
      if (areas) {
        // equal mean-anomaly intervals = equal times = equal areas swept from the Sun
        for (const [m0, fill] of [[-.45, '#fde3d6'], [Math.PI - .45, '#dbe8f7']]) { const q = [[c, 0]]; for (let i = 0; i <= 30; i++) q.push(at(ecc(m0 + .9 * i / 30))); part(g, pts(q) + ' Z', fill, GRY, 1.5); }
        if (showLab(o)) { lb(g, 132, 6, 'A₁', TXT.red, 17); lb(g, -148, 6, 'A₂', TXT.blue, 17); }
        arrow(g, a, 0, a, -78, GRN, 3); if (showLab(o)) lb(g, a + 8, -60, 'fast', TXT.green, 15, 'start');
        arrow(g, -a, 0, -a, 22, GRN, 3); if (showLab(o)) lb(g, -a - 8, 30, 'slow', TXT.green, 15, 'end');
        if (showLab(o)) lb(g, 0, b + 34, 'equal areas in equal times: A₁ = A₂', TXT.blue, 17);
      } else {
        dash(g, `M${-a} 0 H${a}`); arrow(g, 0, 0, -a + 10, 0, '#777', 2); if (showLab(o)) lb(g, -a * .75, -10, 'a', DK, 20);
        arrow(g, 0, 0, c - 16, 0, '#777', 2); if (showLab(o)) lb(g, c / 2, 22, 'c', DK, 18); part(g, C(0, 0, 3), DK, DK, 1);
        part(g, C(-c, 0, 5), '#fff', DK, 2); if (showLab(o)) lb(g, -c, 24, 'empty focus', '#777', 13);
        const [qx, qy] = at(2.0); dash(g, `M${P(qx, qy)} L${c} 0 M${P(qx, qy)} L${-c} 0`, VIO, 2);
        if (showLab(o)) { lb(g, (qx + c) / 2 + 6, qy / 2 - 6, 'r₁', VIO, 17, 'start'); lb(g, (qx - c) / 2 - 8, qy / 2, 'r₂', VIO, 17, 'end'); }
        part(g, C(qx, qy, 9), '#5b86c8', '#1f3f7a', 2);
        if (showLab(o)) lb(g, 0, b + 34, 'e = c / a  (here 0.55);   r₁ + r₂ = 2a', TXT.blue, 17);
      }
      still(g, E(0, 0, a, b), DK, 3); for (const Ea of [1.2, 4.0]) { const [x1, y1] = at(Ea), [x0, y0] = at(Ea - .08); tip(g, x1, y1, x0, y0, DK, 3); }
      part(g, C(c, 0, 16), '#ffd84a', '#c97a10', 2.5); if (showLab(o)) lb(g, c, -24, 'Sun', TXT.orange, 15);
      part(g, C(a, 0, 8), '#5b86c8', '#1f3f7a', 2); part(g, C(-a, 0, 8), '#5b86c8', '#1f3f7a', 2);
      if (showLab(o)) { lb(g, a + 10, 30, 'perihelion', DK, 14, 'start'); lb(g, -a - 10, areas ? -10 : 30, 'aphelion', DK, 14, 'end'); }
      if (t) lb(g, 0, -b - 22, t, TXT.blue, 20);
      return g;
    },
    // "rotation cx cy size k=disk|rod |text"
    rotation: ([cx, cy, S = 320], o, t, p) => {
      const g = G(cx, cy, S / 320, 0, p);
      if (o.k === 'rod') {
        const rod = (y, px, name, I) => { part(g, R(-130, y - 9, 260, 18), '#e0c08a', '#8a6a30', 2.5); dash(g, `M${px} ${y - 62} V${y + 40}`, DK, 2);
          still(g, `M${px - 24} ${y - 44} A24 8 0 1 0 ${px + 24} ${y - 44}`, GRN, 2.5); tip(g, px + 24, y - 46, px + 23, y - 40, GRN, 2.5); if (showLab(o)) lb(g, px + 30, y - 50, 'ω', TXT.green, 18, 'start');
          part(g, C(px, y, 5), DK, DK, 1); if (showLab(o)) { lb(g, 140, y + 6, name, DK, 15, 'start'); lb(g, 140, y + 28, I, TXT.red, 19, 'start'); } };
        rod(-60, -130, 'axis at end', 'I = ML²/3'); rod(90, 0, 'axis at centre', 'I = ML²/12');
        arrow(g, 0, -30, -130, -30, '#777', 2); arrow(g, 0, -30, 130, -30, '#777', 2); if (showLab(o)) lb(g, 0, -12, 'L, mass M', DK, 15);
        if (showLab(o)) lb(g, 30, 165, 'parallel axis: I_end = I_cm + M(L/2)²', TXT.blue, 16);
        if (t) lb(g, 30, -150, t, TXT.blue, 20);
        return g;
      }
      const r0 = 110, a1 = rad(40), a2 = rad(100), px = r0 * Math.cos(a1), py = -r0 * Math.sin(a1);
      part(g, C(0, 0, r0), '#dbe8f7', BLU, 3); still(g, C(0, 0, 9), VIO, 2); part(g, C(0, 0, 2.5), VIO, VIO, 1);
      arrow(g, 0, 0, px, py, DK, 3); if (showLab(o)) lb(g, px / 2 + 12, py / 2 + 14, 'r', DK, 20, 'start');
      dash(g, `M${P(px, py)} L${P(px * 1.55, py * 1.55)}`);
      arrow(g, px, py, px + 100 * Math.cos(a2), py - 100 * Math.sin(a2), RED, 4); if (showLab(o)) lb(g, px + 100 * Math.cos(a2) - 10, py - 100 * Math.sin(a2) + 4, 'F', TXT.red, 22, 'end');
      still(g, `M${P(px + 32 * Math.cos(a1), py - 32 * Math.sin(a1))} A32 32 0 0 0 ${P(px + 32 * Math.cos(a2), py - 32 * Math.sin(a2))}`, DK, 2); if (showLab(o)) lb(g, px + 36, py - 30, 'θ', DK, 17, 'start');
      const arc = (rr, b0, b1) => `M${P(rr * Math.cos(rad(b0)), -rr * Math.sin(rad(b0)))} A${rr} ${rr} 0 0 0 ${P(rr * Math.cos(rad(b1)), -rr * Math.sin(rad(b1)))}`;
      still(g, arc(140, 195, 290), GRN, 3); tip(g, 140 * Math.cos(rad(290)), -140 * Math.sin(rad(290)), 140 * Math.cos(rad(284)), -140 * Math.sin(rad(284)), GRN, 3);
      if (showLab(o)) lb(g, -128, 116, 'ω, α', TXT.green, 20, 'end');
      if (showLab(o)) lb(g, -14, -14, 'τ out of page', VIO, 14, 'end');
      if (showLab(o)) { lb(g, 160, 40, 'τ = r × F', TXT.red, 19, 'start'); lb(g, 160, 66, '|τ| = rF sin θ', TXT.red, 16, 'start'); }
      if (showLab(o)) { lb(g, 160, 96, 'τ = Iα', TXT.blue, 19, 'start'); lb(g, 160, 122, 'disk: I = ½MR²', TXT.blue, 16, 'start'); }
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "resonance cx cy width k=resonance|damped |text"
    resonance: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      if (o.k === 'damped') {
        const y0 = 10, A = 100, X = tt => -195 + tt * 16;
        still(g, `M-200 ${y0} H215`, DK, 2.5); tip(g, 215, y0, 205, y0, DK, 2.5); still(g, 'M-200 125 V-120', DK, 3); tip(g, -200, -120, -200, -110, DK, 3);
        if (showLab(o)) { lb(g, 212, y0 + 24, 't', DK, 17, 'end'); lb(g, -192, -112, 'x', DK, 17, 'start'); }
        const b1 = .12, wd = Math.sqrt(1 - b1 * b1), b2 = 2, r1 = -b2 + Math.sqrt(b2 * b2 - 1), r2 = -b2 - Math.sqrt(b2 * b2 - 1);
        const under = s => Math.exp(-b1 * s) * (Math.cos(wd * s) + b1 / wd * Math.sin(wd * s)), crit = s => (1 + s) * Math.exp(-s), over = s => (r2 * Math.exp(r1 * s) - r1 * Math.exp(r2 * s)) / (r2 - r1);
        const plot = f => curve(x => y0 - A * f((x + 195) / 16), -195, 205, 300);
        dash(g, plot(s => Math.exp(-b1 * s)), '#9aa0a8', 1.5); dash(g, plot(s => -Math.exp(-b1 * s)), '#9aa0a8', 1.5);
        line(g, plot(under), BLU, 3); line(g, plot(over), RED, 3); line(g, plot(crit), GRN, 3);
        if (showLab(o)) lb(g, X(9.5), y0 - A * Math.exp(-b1 * 9.5) - 8, 'envelope e^(−bt/2m)', '#777', 13, 'start');
        legend(g, 40, -105, [[BLU, 'underdamped'], [GRN, 'critically damped'], [RED, 'overdamped']], showLab(o));
        if (showLab(o)) lb(g, 0, 160, 'critical damping returns to x = 0 fastest, no overshoot', TXT.blue, 15);
        if (t) lb(g, 0, -140, t, TXT.blue, 20);
        return g;
      }
      const y0 = 120, X = w => -200 + w * 190, Amp = gm => w => { const v = w; return y0 - 50 / Math.sqrt((1 - v * v) ** 2 + (gm * v) ** 2); };
      axes(g, -200, y0, 215, -150, showLab(o) && 'driving frequency ω', showLab(o) && 'amplitude A');
      dash(g, `M${X(1)} ${y0} V-140`); if (showLab(o)) lb(g, X(1), y0 + 22, 'ω₀', DK, 18);
      const set = [[.2, BLU, 'light damping'], [.45, GRN, 'medium'], [1, RED, 'heavy']];
      for (const [gm, c] of set) line(g, curve(x => Amp(gm)((x + 200) / 190), -200, 205, 300), c, 3);
      legend(g, 60, -120, set.map(([, c, s]) => [c, s]), showLab(o));
      if (showLab(o)) lb(g, 0, 170, 'resonance: largest amplitude when ω ≈ ω₀ = √(k/m)', TXT.blue, 15);
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "bernoulli cx cy width |text"
    bernoulli: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), hh = x => { const a = Math.abs(x); return a <= 40 ? 25 : a >= 100 ? 60 : 25 + 35 * (a - 40) / 60; };
      const top = curve(x => -hh(x), -230, 230, 92), bot = curve(x => hh(x), 230, -230, 92).replace('M', 'L');
      fl(g, top + ' ' + bot + ' Z', '#d6eaf8');
      fl(g, R(-170, -175, 20, 116), '#9cc8ec'); fl(g, R(-10, -110, 20, 86), '#9cc8ec');
      for (const f of [-.72, -.36, 0, .36, .72]) line(g, curve(x => f * hh(x), -228, 228, 92), '#5b9bd5', 2, { opacity: .8 });
      still(g, 'M-230 -60 H-170 M-150 -60 H-100 L-40 -25 H-10 M10 -25 H40 L100 -60 H230 M-230 60 H-100 L-40 25 H40 L100 60 H230', DK, 3.5);
      still(g, 'M-170 -60 V-210 M-150 -60 V-210 M-10 -25 V-210 M10 -25 V-210', DK, 2.5);
      still(g, 'M-170 -175 H-150 M-10 -110 H10', BLU, 2.5);
      dash(g, 'M-150 -175 H40 M10 -110 H40', '#777', 1.5); arrow(g, 32, -142, 32, -175, '#777', 2); arrow(g, 32, -142, 32, -110, '#777', 2); if (showLab(o)) lb(g, 40, -136, 'Δh: P₁ > P₂', DK, 15, 'start');
      arrow(g, -222, 0, -186, 0, GRN, 3.5); arrow(g, -40, 0, 40, 0, GRN, 3.5);
      if (showLab(o)) { lb(g, -165, 88, 'wide: A₁, v₁ slow, P₁ high', TXT.blue, 15); lb(g, 0, 50, 'narrow: v₂ fast, P₂ low', TXT.red, 15); }
      if (showLab(o)) { lb(g, 0, 120, 'A₁v₁ = A₂v₂', TXT.green, 18); lb(g, 0, 148, 'P₁ + ½ρv₁² = P₂ + ½ρv₂²', TXT.blue, 17); }
      if (t) lb(g, 0, -228, t, TXT.blue, 20);
      return g;
    },
    // "standingwave cx cy width k=string|openpipe|closedpipe |text"
    standingwave: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), k = o.k || 'string', x0 = -220, L = 320, pipe = k !== 'string', closed = k === 'closedpipe';
      const ns = closed ? [1, 3, 5] : [1, 2, 3], Amp = pipe ? 24 : 32;
      ns.forEach((n, i) => {
        const y = -110 + i * 110, f = s => closed ? Math.sin(n * Math.PI * s / (2 * L)) : k === 'openpipe' ? Math.cos(n * Math.PI * s / L) : Math.sin(n * Math.PI * s / L);
        if (pipe) { fl(g, R(x0, y - 34, L, 68), '#eef4fa'); still(g, `M${x0} ${y - 34} H${x0 + L} M${x0} ${y + 34} H${x0 + L}`, DK, 3); if (closed) still(g, `M${x0} ${y - 38} V${y + 38}`, DK, 7); }
        else { still(g, `M${x0} ${y - 22} V${y + 22} M${x0 + L} ${y - 22} V${y + 22}`, DK, 6); part(g, C(x0, y, 4), DK, DK, 1); part(g, C(x0 + L, y, 4), DK, DK, 1); }
        line(g, curve(x => y - Amp * f(x - x0), x0, x0 + L), BLU, 3); dash(g, curve(x => y + Amp * f(x - x0), x0, x0 + L), GLE, 2);
        const step = closed ? L / n : L / (2 * n);
        for (let s = 0; s <= L + .1; s += step) { const node = Math.abs(f(s)) < .5; if (showLab(o)) lb(g, x0 + s, y + (pipe ? 54 : 52), node ? 'N' : 'A', node ? TXT.red : TXT.green, 15); }
        const lam = closed ? (n === 1 ? '4L' : `4L/${n}`) : (n === 1 ? '2L' : n === 2 ? 'L' : `2L/${n}`);
        if (showLab(o)) { lb(g, x0 + L + 16, y - 4, `n = ${n}`, DK, 17, 'start'); lb(g, x0 + L + 16, y + 20, `λ = ${lam}`, TXT.blue, 17, 'start'); }
      });
      if (showLab(o)) lb(g, x0 + L / 2, 205, { string: 'string fixed at both ends: λ = 2L/n, f = nv/2L', openpipe: 'open at both ends: λ = 2L/n, all n', closedpipe: 'closed at one end: λ = 4L/n, odd n only' }[k], TXT.blue, 16);
      if (showLab(o)) lb(g, x0 + L + 16, 205, pipe ? 'displacement N, A' : 'N node, A antinode', '#777', 13, 'start');
      if (t) lb(g, -20, -175, t, TXT.blue, 20);
      return g;
    },
    // "doppler cx cy width |text"
    doppler: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), sx = 40;
      for (let k = 1; k <= 5; k++) { const r = 28 * k; line(g, C(sx - .5 * r, 0, r), BLU, 2.2, { opacity: .85 }); }
      for (let k = 1; k <= 5; k++) part(g, C(sx - 14 * k, 0, 2.5), GRY, GRY, 1);
      part(g, C(sx, 0, 9), '#e04b3a', '#7a1f1f', 2); arrow(g, sx + 14, 0, sx + 66, 0, GRN, 4); if (showLab(o)) lb(g, sx + 44, -12, 'v_s', TXT.green, 17);
      const person = x => { part(g, C(x, -34, 10), '#f3d7b5', DK, 2.5); still(g, `M${x} -24 V14 M${x} 14 l-12 26 M${x} 14 l12 26 M${x - 16} -8 H${x + 16}`, DK, 3); };
      person(205); person(-215);
      if (showLab(o)) { lb(g, 205, 70, 'higher f', TXT.red, 16); lb(g, 205, 90, 'shorter λ', TXT.red, 14); }
      if (showLab(o)) { lb(g, -215, 70, 'lower f', TXT.blue, 16); lb(g, -215, 90, 'longer λ', TXT.blue, 14); }
      if (showLab(o)) lb(g, 0, 172, "f' = f · v / (v ∓ v_s)   (− approaching, + receding)", DK, 16);
      if (t) lb(g, 0, -160, t, TXT.blue, 20);
      return g;
    },
    // "efield cx cy size k=point|dipole|parallel|like |text"
    efield: ([cx, cy, S = 320], o, t, p) => {
      const g = G(cx, cy, S / 320, 0, p), k = o.k || 'point', bx = 185, by = 150;
      const trace = (Q, x, y) => { const a = [[x, y]]; for (let i = 0; i < 500; i++) { let ex = 0, ey = 0;
        for (const [qx, qy, q] of Q) { const dx = x - qx, dy = y - qy, r3 = (dx * dx + dy * dy) ** 1.5; ex += q * dx / r3; ey += q * dy / r3; }
        const m = Math.hypot(ex, ey); x += 3 * ex / m; y += 3 * ey / m; a.push([x, y]);
        if (Math.abs(x) > bx || Math.abs(y) > by || Q.some(([qx, qy, q]) => q < 0 && Math.hypot(x - qx, y - qy) < 16)) break; } return a; };
      const fline = (a, at) => { line(g, pts(a), BLU, 2.2); const i = Math.min(a.length - 1, at ?? Math.floor(a.length / 2)); tip(g, a[i][0], a[i][1], a[i - 3][0], a[i - 3][1], BLU, 2.2); };
      if (k === 'parallel') {
        for (const y of [-80, -40, 0, 40, 80]) arrow(g, -84, y, 84, y, BLU, 2.2, true);
        line(g, 'M-84 -108 Q0 -150 84 -108', BLU, 2); line(g, 'M-84 108 Q0 150 84 108', BLU, 2);
        dash(g, 'M-30 -110 V110 M30 -110 V110', GRY, 1.5); if (showLab(o)) lb(g, 0, -150, 'dashed: equipotentials', '#777', 13);
        part(g, R(-102, -115, 12, 230), '#f6c4b4', RED, 2.5); part(g, R(90, -115, 12, 230), '#c6dcf2', BLU, 2.5);
        for (const y of [-90, -45, 0, 45, 90]) { lb(g, -116, y + 6, '+', TXT.red, 22); lb(g, 116, y + 6, '−', TXT.blue, 22); }
        arrow(g, 0, 140, -96, 140, '#777', 2); arrow(g, 0, 140, 96, 140, '#777', 2); if (showLab(o)) lb(g, 0, 165, 'd', DK, 18);
        if (showLab(o)) { lb(g, 150, -20, 'uniform E', TXT.blue, 16, 'start'); lb(g, 150, 4, 'E = V / d', TXT.red, 17, 'start'); }
      } else if (k === 'point') {
        for (const r of [60, 110]) dash(g, C(0, 0, r), GRY, 1.5);
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; arrow(g, 20 * Math.cos(a), 20 * Math.sin(a), 150 * Math.cos(a), 150 * Math.sin(a), BLU, 2.2, true); }
        charge(g, 0, 0, 1); if (showLab(o)) { lb(g, 160, -130, 'E = kq / r²', TXT.red, 17, 'start'); lb(g, 160, 150, 'dashed: equipotentials', '#777', 13, 'start'); }
      } else {
        const like = k === 'like', Q = [[-75, 0, 1], [75, 0, like ? 1 : -1]];
        for (let i = 0; i < 14; i++) { const a = i * 2 * Math.PI / 14 + .22; if (like && Math.cos(a) > .9) continue;
          const l = trace(Q, -75 + 16 * Math.cos(a), 16 * Math.sin(a)); fline(l, like ? 26 : undefined);
          // mirror image: for the dipole the escaping lines come back into −; for like charges the right charge's lines
          const end = l[l.length - 1], m = l.map(([x, y]) => [-x, y]);
          if (like) fline(m, 26); else if (Math.hypot(end[0] - 75, end[1]) > 20) fline(m.reverse()); }
        if (like) line(g, 'M-59 0 H-6 M6 0 H59', BLU, 2.2);
        charge(g, -75, 0, 1); charge(g, 75, 0, like ? 1 : -1);
        if (showLab(o)) lb(g, 0, 175, like ? 'like charges repel: no field line joins them' : 'dipole: lines start on + and end on −', TXT.blue, 15);
      }
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "rccircuit cx cy width k=charge|discharge |text"
    rccircuit: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), dis = o.k === 'discharge', WI = '#b5651d';
      line(g, `M-220 ${dis ? 90 : 10} V90 H-150 M-100 90 H-20 V10 M-20 -10 V-90 H-90 M-150 -90 H-220 V${dis ? 90 : -10}`, WI, 3);
      still(g, zig(-150, -90, -90), DK, 3); if (showLab(o)) lb(g, -120, -108, 'R', DK, 18);
      still(g, 'M-42 -8 H2 M-42 8 H2', DK, 4); if (showLab(o)) lb(g, 10, 6, 'C', DK, 18, 'start');
      part(g, C(-150, 90, 4), '#fff', DK, 2); part(g, C(-100, 90, 4), '#fff', DK, 2); still(g, 'M-150 90 L-104 80', DK, 3); if (showLab(o)) lb(g, -125, 116, 'S (closed at t = 0)', DK, 14);
      if (dis) { if (showLab(o)) { lb(g, -48, -14, '+Q₀', TXT.red, 14, 'end'); lb(g, -48, 26, '−Q₀', TXT.blue, 14, 'end'); } tip(g, -195, -90, -185, -90, RED, 3); if (showLab(o)) lb(g, -190, -102, 'I', TXT.red, 18); }
      else { still(g, 'M-242 -10 H-198 M-231 8 H-209', DK, 3); still(g, 'M-231 8 H-209', DK, 6); if (showLab(o)) lb(g, -248, -4, 'V₀', DK, 17, 'end'); lb(g, -196, -16, '+', TXT.red, 16, 'start');
        tip(g, -180, -90, -190, -90, RED, 3); if (showLab(o)) lb(g, -186, -102, 'I', TXT.red, 18); }
      const X = s => 40 + 58 * s, Y = f => 95 - 150 * f, f = dis ? s => Math.exp(-s) : s => 1 - Math.exp(-s);
      axes(g, 40, 95, 245, -95, showLab(o) && 't', showLab(o) && 'V_C');
      dash(g, `M40 ${Y(dis ? 0 : 1)} H240`, '#9aa0a8', 1.5); if (!dis && showLab(o)) lb(g, 236, Y(1) - 8, 'V₀', DK, 15, 'end');
      line(g, curve(x => Y(f((x - 40) / 58)), 40, 238), dis ? BLU : RED, 3.5);
      dash(g, `M${X(1)} 95 V${P(0, Y(f(1))).split(' ')[1]} H40`, '#777', 1.5); part(g, C(X(1), Y(f(1)), 4), DK, DK, 1);
      if (showLab(o)) { lb(g, X(1), 117, 'τ = RC', TXT.blue, 15); lb(g, X(1) + 10, Y(f(1)) + (dis ? -10 : 20), dis ? '0.37 V₀' : '0.63 V₀', DK, 14, 'start'); }
      if (dis && showLab(o)) lb(g, 48, Y(1) + 4, 'V₀', DK, 15, 'start');
      if (showLab(o)) lb(g, 140, 150, dis ? 'discharging: V_C = V₀ e^(−t/RC)' : 'charging: V_C = V₀(1 − e^(−t/RC))', dis ? TXT.blue : TXT.red, 16);
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "phasor cx cy width k=phasor|rlc |text"
    phasor: ([cx, cy, W = 500], o, t, p) => {
      const g = G(cx, cy, W / 500, 0, p), WI = '#b5651d';
      if (o.k === 'rlc') {
        line(g, 'M-180 -24 V-100 H-120 M-60 -100 H20 M100 -100 H180 V-12 M180 12 V100 H-180 V24', WI, 3);
        part(g, C(-180, 0, 24), '#fff', DK, 2.5); still(g, curve(x => -10 * Math.sin((x + 180) * Math.PI / 12), -192, -168, 30), DK, 2.5);
        still(g, zig(-120, -60, -100), DK, 3); still(g, 'M20 -100 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0', DK, 3);
        still(g, 'M158 -12 H202 M158 12 H202', DK, 4);
        if (showLab(o)) { lb(g, -90, -118, 'R', DK, 19); lb(g, 60, -124, 'L', DK, 19); lb(g, 212, 6, 'C', DK, 19, 'start'); lb(g, -214, 6, 'V(t)', DK, 16, 'end'); }
        tip(g, 20, 100, 30, 100, RED, 3); if (showLab(o)) lb(g, 20, 88, 'I', TXT.red, 18);
        if (showLab(o)) { lb(g, -50, -36, 'X_L = ωL', TXT.blue, 16); lb(g, 60, -36, 'X_C = 1/(ωC)', TXT.blue, 16); lb(g, 0, -6, 'Z = √(R² + (X_L − X_C)²)', TXT.blue, 16); }
        if (showLab(o)) { lb(g, 0, 26, 'I = V / Z', TXT.blue, 16); lb(g, 0, 56, 'resonance: ω₀ = 1/√(LC)', TXT.red, 16); }
        if (t) lb(g, 0, -150, t, TXT.blue, 20);
        return g;
      }
      const ox = -220, oy = 30, phi = Math.atan2(80, 120);
      dash(g, `M${ox} ${oy} H${ox + 165}`, '#9aa0a8', 1.5); if (showLab(o)) lb(g, ox + 170, oy + 5, 'I', TXT.red, 17, 'start');
      arrow(g, ox, oy, ox + 120, oy, RED, 3.5); if (showLab(o)) lb(g, ox + 60, oy + 24, 'V_R', TXT.red, 16);
      arrow(g, ox, oy, ox, oy - 140, GRN, 3.5); if (showLab(o)) lb(g, ox + 8, oy - 132, 'V_L', TXT.green, 16, 'start');
      arrow(g, ox, oy, ox, oy + 60, BLU, 3.5); if (showLab(o)) lb(g, ox + 8, oy + 58, 'V_C', TXT.blue, 16, 'start');
      dash(g, `M${ox + 120} ${oy} V${oy - 80}`, '#777', 1.5); if (showLab(o)) lb(g, ox + 126, oy - 36, 'V_L − V_C', '#777', 13, 'start');
      arrow(g, ox, oy, ox + 120, oy - 80, VIO, 4); if (showLab(o)) lb(g, ox + 52, oy - 52, 'V', VIO, 20, 'end');
      still(g, `M${ox + 46} ${oy} A46 46 0 0 0 ${P(ox + 46 * Math.cos(phi), oy - 46 * Math.sin(phi))}`, DK, 2); if (showLab(o)) lb(g, ox + 52, oy - 6, 'φ', DK, 18, 'start');
      const x0 = 20, T = 220, w = 2 * Math.PI / T, sh = phi / w, ph = -1.2;
      still(g, `M${x0} ${oy} H${x0 + 225}`, DK, 2.5); tip(g, x0 + 225, oy, x0 + 215, oy, DK, 2.5); still(g, `M${x0} ${oy + 85} V${oy - 95}`, DK, 2.5);
      if (showLab(o)) lb(g, x0 + 222, oy + 22, 't', DK, 16, 'end');
      line(g, curve(x => oy - 70 * Math.sin(w * (x - x0) + ph + phi), x0, x0 + 215), VIO, 3); line(g, curve(x => oy - 45 * Math.sin(w * (x - x0) + ph), x0, x0 + 215), RED, 3);
      const pi = x0 + (Math.PI / 2 - ph) / w, pv = pi - sh; dash(g, `M${P(pv, oy - 70)} V${oy} M${pi} ${oy - 45} V${oy}`, '#777', 1.5);
      if (showLab(o)) { lb(g, pv, oy - 78, 'v', VIO, 18); lb(g, pi + 8, oy - 50, 'i', TXT.red, 18, 'start'); lb(g, (pv + pi) / 2, oy + 22, 'φ/ω', DK, 14); }
      if (showLab(o)) lb(g, 0, 140, 'tan φ = (X_L − X_C) / R:  v leads i when X_L > X_C', TXT.blue, 15);
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "righthand cx cy size k=force|circle |text"
    righthand: ([cx, cy, S = 320], o, t, p) => {
      const g = G(cx, cy, S / 320, 0, p);
      if (o.k === 'circle') {
        const yc = -20, r = 100; crosses(g, -150, 150, -110, 110, 50, (x, y) => Math.abs(Math.hypot(x, y - yc) - r) < 16 || (Math.abs(x) < 16 && y > yc) || (Math.abs(y - yc - r) < 22 && x > 0 && x < 120));
        line(g, C(0, yc, r), VIO, 2.5, { 'stroke-dasharray': '10 8' });
        for (const a of [0, 90, 180]) { const ar = rad(a), x = r * Math.cos(ar), y = yc - r * Math.sin(ar); tip(g, x - 6 * Math.sin(ar), y - 6 * Math.cos(ar), x + 6 * Math.sin(ar), y + 6 * Math.cos(ar), VIO, 2.5); }
        charge(g, 0, yc + r, 1, 13); arrow(g, 15, yc + r, 90, yc + r, GRN, 4); if (showLab(o)) lb(g, 96, yc + r + 6, 'v', TXT.green, 20, 'start');
        arrow(g, 0, yc + r - 15, 0, yc + 20, RED, 4); if (showLab(o)) lb(g, 8, yc + 50, 'F', TXT.red, 20, 'start'); part(g, C(0, yc, 3), DK, DK, 1);
        dash(g, `M0 ${yc} L${P(-r * .7071, yc - r * .7071)}`, '#777', 1.5); if (showLab(o)) lb(g, -40, yc - 44, 'r', DK, 18, 'end');
        if (showLab(o)) lb(g, 0, 150, 'r = mv / (qB): + charge circles counter-clockwise', TXT.blue, 15);
        if (showLab(o)) lb(g, 150, -135, 'B into page', '#777', 15, 'end');
        if (t) lb(g, 0, -165, t, TXT.blue, 20);
        return g;
      }
      crosses(g, -150, 150, -110, 90, 50, (x, y) => (Math.abs(y - 20) < 20 && x > -20) || (Math.abs(x) < 20 && y < 30));
      charge(g, 0, 20, 1, 14); arrow(g, 16, 20, 140, 20, GRN, 4); if (showLab(o)) lb(g, 146, 26, 'v', TXT.green, 22, 'start');
      arrow(g, 0, 4, 0, -115, RED, 4); if (showLab(o)) lb(g, 10, -100, 'F', TXT.red, 22, 'start');
      if (showLab(o)) lb(g, -150, -128, 'B into page (×)', '#777', 15, 'start');
      if (showLab(o)) lb(g, 0, 140, 'F = qv × B,   |F| = qvB sin θ', TXT.red, 18);
      if (showLab(o)) lb(g, 0, 166, 'right hand: fingers along v, curl toward B, thumb = F (for +q)', TXT.blue, 13);
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "qho cx cy width |text"
    qho: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), ox = -50, y0 = 150, s = 52, x0 = 50, A = 20;
      const H = [() => 1, z => 2 * z, z => 4 * z * z - 2, z => 8 * z ** 3 - 12 * z];
      still(g, `M${ox - 200} ${y0} H${ox + 200}`, DK, 2.5); if (showLab(o)) lb(g, ox + 200, y0 + 24, 'x', DK, 17, 'end');
      still(g, curve(x => y0 - s * ((x - ox) / x0) ** 2 / 2, ox - 150, ox + 150), DK, 3); if (showLab(o)) lb(g, ox + 158, -60, 'V = ½kx²', DK, 15, 'start');
      for (let n = 0; n < 4; n++) {
        const y = y0 - s * (n + .5), xt = Math.sqrt(2 * n + 1) * x0, psi = z => H[n](z) * Math.exp(-z * z / 2);
        let m = 0; for (let z = -4; z <= 4; z += .02) m = Math.max(m, Math.abs(psi(z)));
        still(g, `M${P(ox - xt, y)} H${P(ox + xt, y)}`, '#9aa0a8', 2);
        line(g, curve(x => y - A * psi((x - ox) / x0) / m, ox - 190, ox + 190, 240), [BLU, RED, GRN, VIO][n], 3);
        if (showLab(o)) lb(g, ox + 205, y + 6, `n=${n}  E=${['½', '3/2', '5/2', '7/2'][n]} ħω`, [TXT.blue, TXT.red, TXT.green, VIO][n], 15, 'start');
      }
      const ya = y0 - s * .5, yb = y0 - s * 1.5; arrow(g, ox - 205, (ya + yb) / 2, ox - 205, ya, '#777', 2); arrow(g, ox - 205, (ya + yb) / 2, ox - 205, yb, '#777', 2); if (showLab(o)) lb(g, ox - 212, (ya + yb) / 2 + 6, 'ħω', DK, 16, 'end');
      if (showLab(o)) lb(g, 0, y0 + 32, 'E = (n + ½)ħω: equally spaced levels', TXT.blue, 16);
      if (t) lb(g, 0, -110, t, TXT.blue, 20);
      return g;
    },
    // "curvedspace cx cy width |text"
    curvedspace: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), D0 = 110, sy = 82, sr = 30;
      const pr = (u, v) => { const f = 1 + .35 * v, d = D0 / (1 + (u * u + v * v) / .0625); return [u * 185 * f, (v * 100 + d) * f - 20]; };
      const path = q => { let d = '', pen = false; for (const [x, y] of q) { if (Math.hypot(x, y - sy) < sr + 3) { pen = false; continue; } d += (pen ? ' L' : ' M') + P(x, y); pen = true; } return d; };
      let grid = ''; for (let i = 0; i <= 12; i++) { const c = -1 + i / 6, a = [], b = [];
        for (let j = 0; j <= 80; j++) { const s = -1 + j / 40; a.push(pr(c, s)); b.push(pr(s, c)); } grid += path(a) + path(b); }
      still(g, grid, '#7d9cc4', 1.6);
      part(g, C(0, sy, sr), '#ffd84a', '#c97a10', 2.5); if (showLab(o)) lb(g, 0, sy + 7, 'M', '#8a5a00', 20);
      const ro = .42, ring = []; for (let i = 0; i <= 120; i++) { const a = i * Math.PI / 60; ring.push(pr(ro * Math.cos(a), ro * Math.sin(a))); }
      dash(g, pts(ring), GRN, 2); const at = a => pr(ro * Math.cos(a), ro * Math.sin(a)), [qx, qy] = at(-.35), [rx, ry] = at(-.05);
      arrow(g, qx, qy, rx, ry, GRN, 2.5); part(g, C(qx, qy, 9), '#5b86c8', '#1f3f7a', 2);
      const ray = []; for (let i = 0; i <= 80; i++) { const u = -1 + i / 40; ray.push(pr(u, -.85 + .4 * (1 + Math.tanh(2.5 * u)) / 2)); }
      line(g, pts(ray), RAY, 3.5); const [e1, e2] = ray[80], [d1, d2] = ray[77]; tip(g, e1, e2, d1, d2, RAY, 3.5);
      if (showLab(o)) { lb(g, e1 + 8, e2 + 5, 'light bends', TXT.orange, 16, 'start'); lb(g, qx + 16, qy + 5, 'planet', TXT.green, 14, 'start'); }
      if (showLab(o)) lb(g, 0, 172, 'mass curves spacetime; light and planets follow the curves', TXT.blue, 15);
      if (t) lb(g, 0, -110, t, TXT.blue, 20);
      return g;
    },
    // "standardmodel cx cy width |text"
    standardmodel: ([cx, cy, W = 520], o, t, p) => {
      const g = G(cx, cy, W / 520, 0, p), cw = 92, ch = 78, X = i => -228 + i * 98 + (i === 4 ? 6 : 0), Y = j => -150 + j * 84;
      const kinds = { q: ['#ece0f8', VIO], l: ['#dff0d8', GRN], b: ['#fde3d6', RED], h: ['#fff1b8', '#b58a10'] };
      const cells = [
        [0, 0, 'q', 'u', '', 'up', '+2/3'], [1, 0, 'q', 'c', '', 'charm', '+2/3'], [2, 0, 'q', 't', '', 'top', '+2/3'],
        [0, 1, 'q', 'd', '', 'down', '−1/3'], [1, 1, 'q', 's', '', 'strange', '−1/3'], [2, 1, 'q', 'b', '', 'bottom', '−1/3'],
        [0, 2, 'l', 'e', '', 'electron', '−1'], [1, 2, 'l', 'μ', '', 'muon', '−1'], [2, 2, 'l', 'τ', '', 'tau', '−1'],
        [0, 3, 'l', 'ν', 'e', 'e neutrino', '0'], [1, 3, 'l', 'ν', 'μ', 'μ neutrino', '0'], [2, 3, 'l', 'ν', 'τ', 'τ neutrino', '0'],
        [3, 0, 'b', 'g', '', 'gluon', '0'], [3, 1, 'b', 'γ', '', 'photon', '0'], [3, 2, 'b', 'Z', '', 'Z boson', '0'], [3, 3, 'b', 'W', '', 'W boson', '±1'],
        [4, 0, 'h', 'H', '', 'Higgs', '0']];
      for (const [i, j, kd, sym, sub, name, q] of cells) { const x = X(i), y = Y(j), [fill, ink] = kinds[kd];
        part(g, `M${x + 8} ${y} H${x + cw - 8} Q${x + cw} ${y} ${x + cw} ${y + 8} V${y + ch - 8} Q${x + cw} ${y + ch} ${x + cw - 8} ${y + ch} H${x + 8} Q${x} ${y + ch} ${x} ${y + ch - 8} V${y + 8} Q${x} ${y} ${x + 8} ${y} Z`, fill, ink, 2);
        if (showLab(o)) lb(g, x + 7, y + 16, q, '#666', 12, 'start'); lb(g, x + cw / 2 - (sub ? 5 : 0), y + 48, sym, ink, 32); if (sub) lb(g, x + cw / 2 + 7, y + 56, sub, ink, 16, 'start');
        if (showLab(o)) lb(g, x + cw / 2, y + 70, name, DK, 12); }
      if (showLab(o)) { ['I', 'II', 'III'].forEach((s, i) => lb(g, X(i) + cw / 2, -158, s, DK, 16)); lb(g, X(1) + cw / 2, -180, 'three generations of matter', DK, 14); }
      if (showLab(o)) { lb(g, X(3) + cw / 2, -158, 'gauge bosons', TXT.red, 13); lb(g, X(4) + cw / 2, -158, 'scalar', '#b58a10', 13); }
      const side = (y, s, c) => { const e = lb(g, -240, y, s, c, 15); e.setAttribute('transform', `rotate(-90 -240 ${y})`); };
      if (showLab(o)) { side(Y(1) - 3, 'quarks', VIO); side(Y(3) - 3, 'leptons', GRN); }
      if (showLab(o)) { lb(g, X(4) + cw / 2, Y(1) + 22, 'charge in e', '#666', 12); lb(g, X(4) + cw / 2, Y(1) + 40, '(top left)', '#666', 12); }
      if (t) lb(g, 0, -205, t, TXT.blue, 20);
      return g;
    },
    // "feynman cx cy width k=qed|beta|annihilation |text"
    feynman: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), k = o.k || 'qed', dot = (x, y) => part(g, C(x, y, 5), DK, DK, 1);
      arrow(g, -205, 120, -205, -110, '#777', 2.5); if (showLab(o)) { const tl = lb(g, -215, 5, 'time', '#777', 15); tl.setAttribute('transform', 'rotate(-90 -215 5)'); }
      if (k === 'beta') {
        fermion(g, -140, 130, -140, -130); fermion(g, -115, 130, -115, -130); fermion(g, -90, 130, -90, 10); fermion(g, -90, 10, -90, -130);
        wavy(g, -90, 10, 30, -50, RED, 4, 7, true); fermion(g, 30, -50, 100, -130); fermion(g, 30, -50, 160, -95, true, VIO);
        dot(-90, 10); dot(30, -50);
        if (showLab(o)) { lb(g, -115, 156, 'n (u d d)', DK, 17); lb(g, -115, -142, 'p (u d u)', DK, 17); lb(g, -80, 80, 'd', DK, 18, 'start'); lb(g, -80, -70, 'u', DK, 18, 'start'); }
        if (showLab(o)) { sup(g, -12, -2, 'W', '−', TXT.red, 19, 'start'); sup(g, 106, -132, 'e', '−', DK, 20, 'start'); lb(g, 166, -92, 'ν̄', VIO, 20, 'start'); lb(g, 177, -86, 'e', VIO, 13, 'start'); }
        if (showLab(o)) lb(g, 30, 175, 'beta-minus decay: d → u + W−,  W− → e− + ν̄', TXT.blue, 16);
      } else if (k === 'annihilation') {
        fermion(g, -140, 130, -55, 40); fermion(g, 140, 130, 55, 40, true); fermion(g, -55, 40, 55, 40);
        wavy(g, -55, 40, -140, -120, VIO, 5, 7, true); wavy(g, 55, 40, 140, -120, VIO, 5, 7, true); dot(-55, 40); dot(55, 40);
        if (showLab(o)) { sup(g, -148, 152, 'e', '−', DK, 20); sup(g, 148, 152, 'e', '+', DK, 20); lb(g, -150, -128, 'γ', VIO, 20); lb(g, 150, -128, 'γ', VIO, 20); }
        if (showLab(o)) lb(g, 30, 178, 'e+ e− → γ γ   (arrow against time = antiparticle)', TXT.blue, 15);
      } else {
        fermion(g, -130, 130, -60, 0); fermion(g, -60, 0, -130, -130); fermion(g, 130, 130, 60, 0); fermion(g, 60, 0, 130, -130);
        wavy(g, -60, 0, 60, 0, VIO, 5, 7, true); dot(-60, 0); dot(60, 0);
        if (showLab(o)) for (const [x, y] of [[-140, 152], [140, 152], [-140, -138], [140, -138]]) sup(g, x, y, 'e', '−', DK, 20);
        if (showLab(o)) { lb(g, 0, -18, 'γ', VIO, 20); lb(g, 30, 178, 'e− e− scattering: one virtual photon exchanged', TXT.blue, 15); }
      }
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "transistor cx cy size k=bjt|mosfet |text"
    transistor: ([cx, cy, S = 320], o, t, p) => {
      const g = G(cx, cy, S / 320, 0, p);
      if (o.k === 'mosfet') {
        part(g, R(-170, -20, 340, 150), '#f8d7d2', DK, 2.5);
        part(g, 'M-170 -20 H-80 V20 Q-80 45 -110 45 H-170 Z', '#cfe0f5', BLU, 2); part(g, 'M170 -20 H80 V20 Q80 45 110 45 H170 Z', '#cfe0f5', BLU, 2);
        part(g, R(-90, -34, 180, 14), '#f1f1e6', '#8a7a60', 2); part(g, R(-80, -66, 160, 32), '#c9ccd2', DK, 2.5);
        part(g, R(-160, -44, 60, 24), '#c9ccd2', DK, 2.5); part(g, R(100, -44, 60, 24), '#c9ccd2', DK, 2.5);
        still(g, 'M-130 -44 V-100 M0 -66 V-100 M130 -44 V-100 M0 130 V160', DK, 3);
        if (showLab(o)) { lb(g, -130, -108, 'S source', DK, 16); lb(g, 0, -108, 'G gate', DK, 16); lb(g, 130, -108, 'D drain', DK, 16); lb(g, 10, 170, 'B body', DK, 14, 'start'); }
        if (showLab(o)) { lb(g, -128, 18, 'n⁺', TXT.blue, 18); lb(g, 128, 18, 'n⁺', TXT.blue, 18); lb(g, 0, 105, 'p-type substrate', TXT.red, 16); }
        line(g, 'M-80 -15 H80', BLU, 5, { opacity: .8 }); arrow(g, -60, 8, 60, 8, BLU, 2.5, true); if (showLab(o)) lb(g, 0, 32, 'electrons: n-channel', TXT.blue, 14);
        if (showLab(o)) { lb(g, 0, -23, 'oxide', '#8a7a60', 11); lb(g, 0, -44, 'metal', '#555', 13); lb(g, 0, 60, 'channel forms when V_GS > V_th', DK, 14); }
        if (t) lb(g, 0, -140, t, TXT.blue, 20);
        return g;
      }
      part(g, C(10, 0, 70), '#f3f6fa', DK, 2.5);
      still(g, 'M-120 0 H-20 M-20 -42 V42', DK, 4); still(g, 'M-20 -20 L35 -55 V-140 M-20 20 L35 55 V140', DK, 3);
      tip(g, 26, 49, 0, 33, DK, 3.5);
      if (showLab(o)) { lb(g, -128, 6, 'B', DK, 22, 'end'); lb(g, 24, -122, 'C', DK, 22, 'end'); lb(g, 24, 140, 'E', DK, 22, 'end'); }
      arrow(g, -110, -16, -60, -16, RED, 2); if (showLab(o)) lb(g, -85, -26, 'I_B (small)', TXT.red, 14);
      arrow(g, 60, -140, 60, -90, RED, 5); if (showLab(o)) lb(g, 72, -100, 'I_C (large)', TXT.red, 15, 'start');
      arrow(g, 60, 90, 60, 140, RED, 5); if (showLab(o)) lb(g, 72, 120, 'I_E', TXT.red, 15, 'start');
      if (showLab(o)) { lb(g, -95, 90, 'NPN', DK, 18); lb(g, 175, -20, 'I_C = β I_B', TXT.blue, 18, 'start'); lb(g, 175, 8, 'I_E = I_B + I_C', TXT.blue, 16, 'start'); lb(g, 175, 34, 'β ≈ 100', '#777', 14, 'start'); }
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "laser cx cy width |text"
    laser: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), ox = -30;
      part(g, R(ox - 160, -150, 320, 66), '#f8d7d2', '#b0645a', 2.5);
      part(g, R(ox - 186, -168, 14, 102), '#a9aeb6', DK, 2.5); part(g, R(ox + 172, -168, 7, 102), '#dfe6ee', GLE, 2);
      for (const y of [-128, -117, -106]) line(g, `M${ox - 170} ${y} H${ox + 170}`, RED, 2, { opacity: .7 });
      line(g, `M${ox + 180} -117 H${ox + 262}`, RED, 5); tip(g, ox + 266, -117, ox + 256, -117, RED, 4);
      for (const x of [-100, 0, 100]) arrow(g, ox + x, -44, ox + x, -78, GRN, 3, true);
      if (showLab(o)) { lb(g, ox - 179, -176, 'full mirror', DK, 13); lb(g, ox + 176, -176, 'partial mirror', DK, 13); lb(g, ox, -92, 'gain medium', '#8a3a30', 14); }
      if (showLab(o)) { lb(g, ox + 50, -30, 'pump', TXT.green, 15, 'start'); lb(g, ox + 266, -132, 'coherent beam', TXT.red, 14, 'end'); }
      // inset: three-level system
      const L1 = 160, L2 = 85, L3 = 30, xl = -170, xr = 60;
      part(g, R(-235, 5, 470, 180), '#fbfbf8', '#c8ccd2', 1.5);
      for (const [y, s] of [[L1, 'E₁ ground'], [L2, 'E₂ metastable'], [L3, 'E₃']]) { still(g, `M${xl} ${y} H${xr}`, DK, 3); if (showLab(o)) lb(g, xr + 8, y + 5, s, DK, 14, 'start'); }
      arrow(g, xl + 20, L1, xl + 20, L3 + 3, GRN, 3); if (showLab(o)) lb(g, xl + 14, 100, 'pump', TXT.green, 14, 'end');
      { const q = []; for (let y = L3 + 2; y <= L2 - 4; y += 1) q.push([xl + 62 + 5 * Math.sin(y / 4), y]); line(g, pts(q), '#777', 2); } tip(g, xl + 62, L2 - 2, xl + 62, L2 - 12, '#777', 2.5); if (showLab(o)) lb(g, xl + 72, 62, 'fast decay', '#777', 12, 'start');
      for (const x of [-60, -45, -30, -15, 0]) part(g, C(x, L2 - 6, 4.5), BLU, BLU, 1);
      for (const x of [-140, -125]) part(g, C(x, L1 - 6, 4.5), BLU, BLU, 1);
      arrow(g, 30, L2, 30, L1 - 3, RED, 3);
      photon(g, -40, 125, 15, 125, RED, 3, 5); photon(g, 40, 110, 110, 110, RED, 4, 5); photon(g, 40, 132, 110, 132, RED, 4, 5);
      if (showLab(o)) { lb(g, 118, 126, 'two identical photons', TXT.red, 13, 'start'); lb(g, 118, 142, '(stimulated emission)', TXT.red, 12, 'start'); }
      if (showLab(o)) lb(g, -30, 54, 'population inversion on E₂', TXT.blue, 13, 'start');
      if (t) lb(g, 0, -200, t, TXT.blue, 20);
      return g;
    },
    // "halleffect cx cy width |text"
    halleffect: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), WI = '#b5651d';
      part(g, R(-170, -70, 340, 140), '#eef2f6', DK, 3);
      crosses(g, -150, 150, -40, 40, 50, (x, y) => (Math.abs(x - 40) < 40 && Math.abs(y) < 40) || (Math.abs(x + 90) < 40 && y > 10));
      line(g, 'M-215 0 H-170 M170 0 H195', WI, 3); tip(g, -185, 0, -195, 0, RED, 3); tip(g, 192, 0, 182, 0, RED, 3); if (showLab(o)) lb(g, -200, -12, 'I', TXT.red, 19);
      for (let x = -150; x <= 150; x += 30) { lb(g, x, -50, '−', TXT.blue, 20); lb(g, x, 62, '+', TXT.red, 20); }
      part(g, C(40, 0, 10), '#5b86c8', '#1f3f7a', 2); lb(g, 40, 6, '−', '#fff', 18);
      arrow(g, 28, 0, -30, 0, GRN, 3); if (showLab(o)) lb(g, -36, 6, 'v', TXT.green, 18, 'end'); arrow(g, 40, -12, 40, -40, RED, 3); if (showLab(o)) lb(g, 48, -26, 'F = qvB', TXT.red, 15, 'start');
      if (showLab(o)) lb(g, -90, 40, 'electron drift', TXT.green, 14);
      line(g, 'M120 -70 V-100 H235 V-67 M235 -23 V100 H120 V70', WI, 2.5); part(g, C(235, -45, 22), '#fff', DK, 2.5); lb(g, 235, -38, 'V', DK, 19); if (showLab(o)) lb(g, 264, -39, 'V_H', TXT.red, 18, 'start');
      if (showLab(o)) lb(g, -170, -112, 'B into page (×)', '#777', 15, 'start');
      if (showLab(o)) { lb(g, 0, 140, 'electrons pushed up until qE_H = qvB', TXT.blue, 15); lb(g, 0, 166, 'V_H = IB / (nqt)', TXT.red, 18); }
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "hrdiagram cx cy width |text"
    hrdiagram: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), X = lt => -170 + (4.7 - lt) / 1.3 * 370, Y = ll => 130 - (ll + 5) / 11 * 280;
      const col = lt => lt > 4.3 ? '#6f8ff0' : lt > 4.0 ? '#a8bdf7' : lt > 3.85 ? '#e8ecf8' : lt > 3.74 ? '#ffe680' : lt > 3.6 ? '#f6a64a' : '#e0583a';
      fl(g, R(-170, -150, 370, 280), '#1f2433', { opacity: .12 });
      const ms = [[4.65, 5.6], [4.4, 4.2], [4.2, 3], [4.0, 1.7], [3.85, .7], [3.76, 0], [3.65, -.8], [3.55, -1.8], [3.45, -3.2]];
      const up = ms.map(([a, b]) => [X(a), Y(b + .55)]), dn = ms.map(([a, b]) => [X(a), Y(b - .55)]).reverse();
      part(g, pts([...up, ...dn]) + ' Z', '#dfe6f2', '#9aa6ba', 1.5);
      part(g, E(X(3.66), Y(2.2), 42, 24), '#f9d9b6', '#c97a10', 1.5); part(g, E(X(3.9), Y(4.9), 118, 17), '#f8cfc4', '#c0392b', 1.5);
      part(g, E(X(4.15), Y(-3.2), 32, 14), '#e2e8f6', '#5b86c8', 1.5);
      for (let i = 0; i < ms.length - 1; i++) for (const s of [.25, .75]) { const lt = ms[i][0] + (ms[i + 1][0] - ms[i][0]) * s, ll = ms[i][1] + (ms[i + 1][1] - ms[i][1]) * s;
        part(g, C(X(lt), Y(ll) + (s < .5 ? -5 : 5), 5), col(lt), '#555', 1); }
      for (const [lt, ll] of [[3.62, 2], [3.7, 2.5], [3.66, 1.8], [4.25, 4.9], [3.9, 5], [3.58, 4.85], [4.2, -3.1], [4.05, -3.4]]) part(g, C(X(lt), Y(ll), 5), col(lt), '#555', 1);
      part(g, C(X(3.762), Y(0), 8), '#ffd84a', '#c97a10', 2.5); still(g, `M${X(3.762)} ${Y(0) + 11} v18`, '#c97a10', 1.5); if (showLab(o)) lb(g, X(3.762), Y(0) + 46, 'Sun', TXT.orange, 16);
      still(g, `M-170 -150 V130 H200`, DK, 3);
      for (const [ll, s] of [[-4, '−4'], [-2, '−2'], [0, ''], [2, '2'], [4, '4'], [6, '6']]) { still(g, `M-176 ${Y(ll)} H-170`, DK, 2); if (s) sup(g, -180, Y(ll) + 5, '10', s, DK, 14, 'end'); else lb(g, -180, Y(ll) + 5, '1', DK, 14, 'end'); }
      for (const [lt, s] of [[Math.log10(30000), '30 000'], [4, '10 000'], [Math.log10(6000), '6000'], [Math.log10(3000), '3000']]) { still(g, `M${X(lt)} 130 V136`, DK, 2); lb(g, X(lt), 152, s, DK, 13); }
      [['O', 4.6], ['B', 4.24], ['A', 3.94], ['F', 3.83], ['G', 3.75], ['K', 3.64], ['M', 3.48]].forEach(([s, lt]) => lb(g, X(lt), -158, s, DK, 17));
      if (showLab(o)) lb(g, 15, 176, 'surface temperature (K)  ← hotter', DK, 15);
      if (showLab(o)) { const yl = lb(g, -222, -10, 'luminosity (L☉)', DK, 15); yl.setAttribute('transform', 'rotate(-90 -222 -10)'); }
      if (showLab(o)) { lb(g, X(4.15), Y(.6), 'main sequence', TXT.blue, 15); lb(g, X(3.66), Y(2.2) + 38, 'giants', TXT.orange, 15); }
      if (showLab(o)) { lb(g, X(3.9), Y(4.9) + 36, 'supergiants', TXT.red, 15); lb(g, X(4.15), Y(-3.2) + 30, 'white dwarfs', TXT.blue, 15); }
      if (t) lb(g, 0, -185, t, TXT.blue, 20);
      return g;
    },
    // "blackbody cx cy width |text"
    blackbody: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), y0 = 120, X = l => -200 + l * .16, B = T => l => 1 / (l ** 5 * (Math.exp(14388000 / (l * T)) - 1));
      const peak = T => 2.898e6 / T, top = B(5000)(peak(5000)), Y = (T, l) => y0 - 230 * B(T)(l) / top, id = 'bbG' + clipN++;
      const gr = mk('linearGradient', { id, x1: 0, x2: 1, y1: 0, y2: 0 }, g);
      ['#8b3fd1', '#3f5fe0', '#2fb5d8', '#4cc14a', '#f2e030', '#f59a23', '#e0332a'].forEach((c, i) => mk('stop', { offset: i / 6, 'stop-color': c }, gr));
      fl(g, R(X(380), -130, X(750) - X(380), 250), `url(#${id})`, { opacity: .45 });
      axes(g, -200, y0, 215, -150, '', showLab(o) && 'intensity'); if (showLab(o)) lb(g, 215, y0 + 46, 'wavelength λ (nm)', DK, 16, 'end');
      for (const l of [500, 1000, 1500, 2000]) { still(g, `M${X(l)} ${y0} v6`, DK, 2); lb(g, X(l), y0 + 22, String(l), DK, 13); }
      if (showLab(o)) { lb(g, X(565), -136, 'visible', DK, 13); lb(g, X(190), y0 + 22, 'UV', '#777', 13); lb(g, X(2350), y0 + 22, 'infrared', '#777', 13); }
      const set = [[5000, RED, TXT.red], [4000, RAY, TXT.orange], [3000, '#8a3a30', '#8a3a30']];
      for (const [T, c] of set) line(g, curve(x => Y(T, Math.max(60, (x + 200) / .16)), X(100), 208, 260), c, 3);
      dash(g, curve(x => { const l = (x + 200) / .16, T = 2.898e6 / l; return Y(T, l); }, X(peak(5000)), X(peak(3000)) + 15, 40), DK, 1.5);
      for (const [T, , tc] of set) { const l = peak(T); part(g, C(X(l), Y(T, l), 3.5), DK, DK, 1); if (showLab(o)) lb(g, X(l) + 10, Y(T, l) - 6, `${T} K`, tc, 14, 'start'); }
      if (showLab(o)) { lb(g, 100, -60, 'Wien: λmax T = 2.898 mm·K', TXT.blue, 15); lb(g, 100, -38, 'hotter: peak moves to shorter λ', TXT.blue, 14); }
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
  });
})();
