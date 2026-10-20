// Whiteboard library — physuni: university physics (founder, 19 Oct 2026: the app serves 18+ physics majors too).
// Wave optics, Maxwell's equations, quantum mechanics, special relativity, thermodynamic cycles and solid state.
// Catalogue: physuni.txt. Only the physics subject prompt lists these. Same helpers and look as phys.js.
(() => {
  const DK = '#33363b', RED = '#c0392b', BLU = '#2b6cc4', RAY = '#e0802a', GLASS = '#cfe9f7', GLE = '#4f93d6', GRN = '#2c6a22', VIO = '#7a4ab0';
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
  const dash = (g, d, c = '#8a9098', w = 2) => still(g, d, c, w, { 'stroke-dasharray': '6 7' });
  const lb = (g, x, y, t, c = TXT.blue, s = 18, a = 'middle') => label(g, x, y, t, c, s, a);
  const showLab = o => o.lab !== '0' && o.labels !== '0';   // lab=0 hides the drawing's own words
  // a curve y = f(x) sampled from x0 to x1 (screen units)
  const curve = (f, x0, x1, n = 160) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? ' L' : 'M') + P(x, f(x)); } return d; };
  const pts = a => 'M' + a.map(p => P(p[0], p[1])).join(' L');
  const axes = (g, x0, y0, x1, y1, xl, yl) => { still(g, `M${x0} ${y1} V${y0} H${x1}`, DK, 3); tip(g, x0, y1, x0, y1 + 10, DK, 3); tip(g, x1, y0, x1 - 10, y0, DK, 3);
    if (xl) lb(g, x1, y0 + 26, xl, DK, 17, 'end'); if (yl) lb(g, x0 + 8, y1 + 4, yl, DK, 17, 'start'); };
  // a photon: a wavy line from a to b with an arrowhead
  const photon = (g, x1, y1, x2, y2, c = VIO, waves = 5, A = 7) => { const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, a = [];
    for (let i = 0; i <= 80; i++) { const s = i / 80, w = A * Math.sin(s * waves * 2 * Math.PI) * (s < .9 ? 1 : (1 - s) * 10); a.push([x1 + ux * L * s - uy * w, y1 + uy * L * s + ux * w]); }
    line(g, pts(a), c, 2.5); tip(g, x2, y2, x2 - ux * 10, y2 - uy * 10, c, 2.5); };
  const bulb = (g, x, y) => { part(g, C(x, y, 14), '#fff1a0', '#b58a10', 2.5); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4;
    still(g, `M${P(x + 19 * Math.cos(a), y + 19 * Math.sin(a))} L${P(x + 27 * Math.cos(a), y + 27 * Math.sin(a))}`, INK.yellow, 2.5); } };

  Object.assign(window.RECIPES, {
    // "doubleslit cx cy width |text"
    doubleslit: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), sl = 30;
      bulb(g, -215, 0); for (const x of [-180, -150, -120]) line(g, `M${x} -70 V70`, BLU, 2, { opacity: .7 });
      for (const y of [-sl, sl]) for (let r = 28; r <= 196; r += 28)
        line(g, `M${P(-80 + r * Math.cos(rad(-62)), y + r * Math.sin(rad(-62)))} A${r} ${r} 0 0 1 ${P(-80 + r * Math.cos(rad(62)), y + r * Math.sin(rad(62)))}`, BLU, 1.8, { opacity: .55 });
      still(g, `M-80 -150 V${-sl - 6} M-80 ${-sl + 6} V${sl - 6} M-80 ${sl + 6} V150`, DK, 7);
      part(g, R(140, -150, 10, 300), '#efe6d6', '#8a7a60', 2);
      const I = y => Math.cos(Math.PI * y / 38) ** 2 * Math.exp(-(y * y) / (2 * 95 * 95));
      for (let y = -140; y <= 140; y += 4) fl(g, R(141, y, 8, 4), '#d63', { opacity: I(y + 2).toFixed(2) });
      part(g, (() => { let d = 'M160 -145'; for (let y = -145; y <= 145; y += 3) d += ` L${P(160 + 70 * I(y), y)}`; return d + ' L160 145 Z'; })(), '#fbd2b8', RED, 2);
      arrow(g, -110, -sl, -110, sl, '#777', 2); arrow(g, -110, sl, -110, -sl, '#777', 2); showLab(o) && lb(g, -126, 6, 'd', DK, 20, 'end');
      arrow(g, 30, 175, 140, 175, '#777', 2); arrow(g, 30, 175, -80, 175, '#777', 2); showLab(o) && lb(g, 30, 200, 'L', DK, 20);
      showLab(o) && lb(g, 240, 0, 'bright fringes', TXT.red, 16, 'start'); showLab(o) && lb(g, 240, 22, 'y = mλL/d', TXT.red, 16, 'start');
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "diffraction cx cy width k=single|grating |text"
    diffraction: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), grat = o.k === 'grating', y0 = 110, H = 200;
      still(g, `M-210 ${y0} H210`, DK, 3); tip(g, 210, y0, 200, y0, DK, 3); still(g, `M0 ${y0} V-120`, '#9aa0a8', 1.5, { 'stroke-dasharray': '5 6' });
      showLab(o) && lb(g, 205, y0 + 26, 'angle θ', DK, 16, 'end'); showLab(o) && lb(g, -205, -110, 'intensity', DK, 16, 'start');
      if (grat) {
        [[0, 1, 'm = 0'], [90, .62, 'm = 1'], [-90, .62, 'm = −1'], [180, .3, 'm = 2'], [-180, .3, 'm = −2']].forEach(([x, h, tx]) => {
          part(g, `M${x - 7} ${y0} Q${x} ${y0 - H * h * 2.1} ${x + 7} ${y0} Z`, '#fbd2b8', RED, 2); lb(g, x, y0 + 26, tx, TXT.red, 15); });
        showLab(o) && lb(g, 0, -130, 'd sin θ = mλ', TXT.blue, 18);
      } else {
        const I = x => { const b = Math.PI * x / 60; return x === 0 ? 1 : (Math.sin(b) / b) ** 2; };
        part(g, curve(x => y0 - H * I(x), -200, 200, 240) + ' Z', '#fbd2b8', RED, 2.5);
        showLab(o) && lb(g, 0, y0 - H - 10, 'central maximum', TXT.red, 16); showLab(o) && lb(g, 60, y0 + 26, 'first minimum', DK, 14); still(g, `M60 ${y0} v-8`, DK, 2);
        showLab(o) && lb(g, 120, -40, 'a sin θ = mλ (minima)', TXT.blue, 16, 'start');
      }
      if (t) lb(g, 0, -160, t, TXT.blue, 20);
      return g;
    },
    // "thinfilm cx cy width |text"
    thinfilm: ([cx, cy, W = 400], o, t, p) => {
      const g = G(cx, cy, W / 400, 0, p);
      fl(g, R(-190, -20, 380, 40), '#bfe2f5'); still(g, 'M-190 -20 H190 M-190 20 H190', GLE, 2.5); fl(g, R(-190, 20, 380, 60), '#e8eef3');
      const i = rad(40), r = Math.asin(Math.sin(i) / 1.4), A = [-60, -20], B = [-60 + 40 * Math.tan(r), 20], Cp = [-60 + 80 * Math.tan(r), -20];
      const back = 150, out = 150;
      line(g, pts([[A[0] - back * Math.sin(i), -20 - back * Math.cos(i)], A]), RAY, 3); tip(g, A[0] - 40 * Math.sin(i), -20 - 40 * Math.cos(i), A[0] - 50 * Math.sin(i), -20 - 50 * Math.cos(i), RAY, 3);
      line(g, pts([A, [A[0] + out * Math.sin(i), -20 - out * Math.cos(i)]]), RAY, 3);
      line(g, pts([A, B, Cp, [Cp[0] + out * Math.sin(i), -20 - out * Math.cos(i)]]), '#c06010', 3);
      showLab(o) && lb(g, A[0] + out * Math.sin(i) + 6, -20 - out * Math.cos(i), '1', TXT.orange, 18, 'start'); showLab(o) && lb(g, Cp[0] + out * Math.sin(i) + 6, -20 - out * Math.cos(i), '2', TXT.orange, 18, 'start');
      arrow(g, 150, 0, 150, -20, '#777', 2); arrow(g, 150, 0, 150, 20, '#777', 2); showLab(o) && lb(g, 160, 6, 't', DK, 18, 'start');
      showLab(o) && lb(g, -180, 6, 'film, n', TXT.blue, 16, 'start'); showLab(o) && lb(g, -180, -40, 'air', '#777', 15, 'start');
      showLab(o) && lb(g, 0, 115, 'path difference 2nt cos r: colours where 1 and 2 add up', TXT.blue, 16);
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "polarisation cx cy width |text"
    polarisation: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), plate = (x, ang) => { part(g, `M${x - 18} -80 L${x + 18} -100 L${x + 18} 80 L${x - 18} 100 Z`, '#eef2f6', '#777', 2.5);
        for (let k = -3; k <= 3; k++) { const s = k * 9, c = Math.cos(rad(ang)), sn = Math.sin(rad(ang)); still(g, `M${P(x + s * c - 60 * sn * .3, -60 * c + s * sn)} L${P(x + s * c + 60 * sn * .3, 60 * c + s * sn)}`, '#555', 1.5); } };
      still(g, 'M-230 0 H230', '#9aa0a8', 1.5, { 'stroke-dasharray': '5 6' });
      for (const a of [0, 45, 90, 135]) { const c = Math.cos(rad(a)) * 40, s = Math.sin(rad(a)) * 40; still(g, `M${P(-180 - c, -s)} L${P(-180 + c, s)}`, VIO, 2.5); tip(g, -180 + c, s, -180 + c * .8, s * .8, VIO, 2); tip(g, -180 - c, -s, -180 - c * .8, -s * .8, VIO, 2); }
      plate(-100, 0); line(g, curve(x => -40 * Math.sin((x + 80) / 14), -80, 60), VIO, 2.5);
      plate(80, 40); line(g, curve(x => -40 * Math.cos(rad(40)) * Math.sin((x - 100) / 14), 100, 220), VIO, 2.5);
      showLab(o) && lb(g, -180, 70, 'unpolarised', TXT.blue, 15); showLab(o) && lb(g, -100, 125, 'polariser', DK, 15); showLab(o) && lb(g, 80, 125, 'analyser at θ', DK, 15);
      showLab(o) && lb(g, 160, -70, 'I = I₀ cos²θ', TXT.red, 18);
      if (t) lb(g, 0, -140, t, TXT.blue, 20);
      return g;
    },
    // "michelson cx cy size |text"
    michelson: ([cx, cy, S = 320], o, t, p) => {
      const g = G(cx, cy, S / 320, 0, p);
      bulb(g, -210, 0); part(g, 'M-14 14 L14 -14 L20 -8 L-8 20 Z', GLASS, GLE, 2);
      part(g, R(-40, -160, 80, 10), '#c9ccd2', DK, 2.5); part(g, R(150, -40, 10, 80), '#c9ccd2', DK, 2.5); dash(g, 'M172 -40 V40', '#777', 1.5);
      line(g, 'M-190 0 H-4', RAY, 3); line(g, 'M-6 -4 V-150', RAY, 3); line(g, 'M6 -150 V-4', RAY, 3, { opacity: .7 });
      line(g, 'M4 -6 H150', RAY, 3); line(g, 'M150 6 H4', RAY, 3, { opacity: .7 }); line(g, 'M0 8 V140', RAY, 3);
      tip(g, -90, 0, -100, 0, RAY, 3); tip(g, 0, 90, 0, 80, RAY, 3);
      part(g, R(-30, 140, 60, 26), '#555', DK, 2.5); arrow(g, 165, 60, 195, 60, GRN, 3);
      showLab(o) && lb(g, 0, -172, 'fixed mirror', DK, 15); showLab(o) && lb(g, 175, 85, 'movable mirror', DK, 15, 'start'); showLab(o) && lb(g, 30, 30, 'beam splitter', TXT.blue, 15, 'start');
      showLab(o) && lb(g, 0, 195, 'detector: fringes shift as the mirror moves λ/2', TXT.blue, 15);
      if (t) lb(g, 0, -200, t, TXT.blue, 20);
      return g;
    },
    // "emwave cx cy width |text"
    emwave: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), A = 90, k = 2 * Math.PI / 200, x0 = -220, x1 = 200;
      still(g, `M${x0} 0 H${x1 + 20}`, DK, 2.5); tip(g, x1 + 20, 0, x1 + 10, 0, DK, 2.5); showLab(o) && lb(g, x1 + 24, 6, 'c', DK, 20, 'start');
      let dE = '', dB = ''; for (let x = x0; x <= x1; x += 14) { const s = Math.sin(k * (x - x0)); dE += `M${x} 0 V${P(0, -A * s).split(' ')[1]} `; dB += `M${x} 0 L${P(x + .55 * A * s * .9, .4 * A * s)} `; }
      still(g, dE, RED, 1.2, { opacity: .55 }); still(g, dB, BLU, 1.2, { opacity: .55 });
      line(g, curve(x => -A * Math.sin(k * (x - x0)), x0, x1), RED, 3.5);
      const b = []; for (let i = 0; i <= 160; i++) { const x = x0 + (x1 - x0) * i / 160, s = Math.sin(k * (x - x0)); b.push([x + .55 * A * s * .9, .4 * A * s]); } line(g, pts(b), BLU, 3.5);
      showLab(o) && lb(g, x0 + 50, -A - 10, 'E', TXT.red, 24); showLab(o) && lb(g, x0 + 95, 55, 'B', TXT.blue, 24);
      showLab(o) && lb(g, 0, 140, 'E ⊥ B ⊥ direction; c = 1/√(μ₀ε₀)', TXT.blue, 17);
      if (t) lb(g, 0, -130, t, TXT.blue, 20);
      return g;
    },
    // "gauss cx cy size k=sphere|cylinder |text"
    gauss: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), cyl = o.k === 'cylinder';
      if (cyl) {
        fl(g, R(-70, -110, 140, 220), '#e8f1fa'); dash(g, `${E(0, -110, 70, 18)} M-70 -110 V110 M70 -110 V110`, GLE, 2); dash(g, 'M-70 110 A70 18 0 0 0 70 110', GLE, 2);
        still(g, 'M0 -150 V150', RED, 6); for (let y = -120; y <= 120; y += 30) lb(g, 12, y + 6, '+', TXT.red, 16, 'start');
        for (const y of [-70, 0, 70]) { arrow(g, 10, y, 140, y, BLU, 2.5); arrow(g, -10, y, -140, y, BLU, 2.5); }
        showLab(o) && lb(g, 0, 175, 'E = λ / (2πε₀r)', TXT.red, 18);
      } else {
        fl(g, C(0, 0, 110), '#e8f1fa'); dash(g, C(0, 0, 110), GLE, 2); dash(g, E(0, 0, 110, 28), GLE, 1.5);
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; arrow(g, 30 * Math.cos(a), 30 * Math.sin(a), 150 * Math.cos(a), 150 * Math.sin(a), BLU, 2.5); }
        part(g, C(0, 0, 18), '#e04b3a', '#7a1f1f', 2.5); lb(g, 0, 7, '+q', '#fff', 16);
        showLab(o) && lb(g, 0, 185, '∮ E·dA = q / ε₀', TXT.red, 19);
      }
      showLab(o) && lb(g, 120, -125, 'Gaussian surface', TXT.blue, 15, 'start');
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "capacitorfield cx cy width |text"
    capacitorfield: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      line(g, 'M-220 0 H-44 M44 0 H220', '#b5651d', 5); tip(g, -120, 0, -130, 0, RED, 3.5); tip(g, 140, 0, 130, 0, RED, 3.5); showLab(o) && lb(g, -130, -16, 'I', TXT.red, 20);
      part(g, R(-48, -90, 8, 180), '#c9ccd2', DK, 2.5); part(g, R(40, -90, 8, 180), '#c9ccd2', DK, 2.5);
      for (const y of [-60, -20, 20, 60]) arrow(g, -36, y, 36, y, GRN, 2.5);
      for (const [rx, ry] of [[22, 120], [30, 150]]) { line(g, E(0, 0, rx, ry), BLU, 2); tip(g, rx, 0, rx, -10, BLU, 2.5); }
      showLab(o) && lb(g, 0, -165, 'B circles the gap too', TXT.blue, 16); showLab(o) && lb(g, 0, 185, 'displacement current  I_d = ε₀ dΦ_E/dt', TXT.green, 16);
      lb(g, -12, -100, '+', TXT.red, 22); lb(g, 52, -100, '−', TXT.blue, 22);
      if (t) lb(g, 0, -195, t, TXT.blue, 20);
      return g;
    },
    // "maxwelleqs cx cy width k=integral|differential |text"
    maxwelleqs: ([cx, cy, W = 520], o, t, p) => {
      const g = G(cx, cy, W / 520, 0, p), diff = o.k === 'differential';
      const eq = diff ? ['∇·E = ρ/ε₀', '∇·B = 0', '∇×E = −∂B/∂t', '∇×B = μ₀J + μ₀ε₀ ∂E/∂t']
        : ['∮ E·dA = Q/ε₀', '∮ B·dA = 0', '∮ E·dl = −dΦ_B/dt', '∮ B·dl = μ₀I + μ₀ε₀ dΦ_E/dt'];
      const nm = ["Gauss's law", 'no magnetic monopoles', "Faraday's law", 'Ampère–Maxwell law'], fills = ['#fde3d6', '#dbe8f7', '#e3f1dc', '#efe2f5'];
      [[-128, -60], [128, -60], [-128, 60], [128, 60]].forEach(([x, y], i) => { part(g, `M${x - 120} ${y - 50} H${x + 120} V${y + 50} H${x - 120} Z`, fills[i], '#8a9098', 2);
        showLab(o) && lb(g, x, y - 18, nm[i], DK, 16); showLab(o) && lb(g, x, y + 22, eq[i], [TXT.red, TXT.blue, TXT.green, VIO][i], i === 3 ? 17 : 21); });
      if (t) lb(g, 0, -135, t, TXT.blue, 20);
      return g;
    },
    // "wellbox cx cy width n=3 |text"
    wellbox: ([cx, cy, W = 400], o, t, p) => {
      const g = G(cx, cy, W / 400, 0, p), N = Math.min(4, Math.max(1, +o.n || 3)), y0 = 140, E1 = 30, A = 22;
      still(g, `M-150 -175 V${y0} H150 V-175`, DK, 4); for (let y = -165; y < y0; y += 18) { still(g, `M-150 ${y} l-12 10 M150 ${y} l12 10`, '#888', 1.5); }
      for (let n = 1; n <= N; n++) { const y = y0 - E1 * n * n; dash(g, `M-150 ${y} H150`, '#9aa0a8', 1.5);
        line(g, curve(x => y - A * Math.sin(n * Math.PI * (x + 150) / 300), -150, 150), [BLU, RED, GRN, VIO][n - 1], 3);
        showLab(o) && lb(g, 160, y + 6, `n=${n}  E=${n * n}E₁`, [TXT.blue, TXT.red, TXT.green, VIO][n - 1], 15, 'start'); }
      showLab(o) && lb(g, 0, y0 + 30, 'Eₙ = n²h² / 8mL²', TXT.blue, 17); arrow(g, -150, y0 + 52, 150, y0 + 52, '#777', 2); arrow(g, 150, y0 + 52, -150, y0 + 52, '#777', 2); showLab(o) && lb(g, 0, y0 + 74, 'L', DK, 18);
      if (t) lb(g, 0, -190, t, TXT.blue, 20);
      return g;
    },
    // "tunnelling cx cy width |text"
    tunnelling: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), k = 2 * Math.PI / 60, d = 22;
      part(g, R(0, -70, 60, 170), '#e7e1d6', '#8a7a60', 2.5); still(g, 'M-220 100 H220', DK, 2.5); dash(g, 'M-220 0 H220', '#9aa0a8', 1.5);
      line(g, curve(x => -40 * Math.cos(k * x), -220, 0), BLU, 3);
      line(g, curve(x => -40 * Math.exp(-x / d), 0, 60), BLU, 3);
      const a2 = 40 * Math.exp(-60 / d); line(g, curve(x => -a2 * Math.cos(k * (x - 60)) * 1, 60, 220), BLU, 3);
      showLab(o) && lb(g, -110, -60, 'incoming wave', TXT.blue, 15); showLab(o) && lb(g, 30, -82, 'barrier V₀', DK, 15); showLab(o) && lb(g, 140, -30, 'some gets through', TXT.blue, 15);
      showLab(o) && lb(g, -200, -6, 'E < V₀', '#777', 14, 'start'); showLab(o) && lb(g, 30, 130, 'decays inside: T ≈ e^(−2κa)', TXT.red, 16);
      if (t) lb(g, 0, -120, t, TXT.blue, 20);
      return g;
    },
    // "energylevels cx cy height |text"
    energylevels: ([cx, cy, H = 320], o, t, p) => {
      const g = G(cx, cy, H / 320, 0, p), y = n => -140 + 280 / (n * n);
      for (const n of [1, 2, 3, 4, 5]) { still(g, `M-150 ${P(0, y(n)).split(' ')[1]} H150`, DK, n === 1 ? 3 : 2); lb(g, -160, y(n) + 5, `n=${n}`, DK, 14, 'end'); lb(g, 160, y(n) + 5, `${(-13.6 / n / n).toFixed(2)} eV`, '#777', 13, 'start'); }
      dash(g, 'M-150 -140 H150', '#9aa0a8', 1.5); lb(g, 160, -135, '0 eV', '#777', 13, 'start');
      [2, 3, 4].forEach((n, i) => arrow(g, -110 + i * 22, y(n), -110 + i * 22, y(1) - 3, VIO, 2.5));
      [3, 4, 5].forEach((n, i) => arrow(g, 30 + i * 22, y(n), 30 + i * 22, y(2) - 3, [RED, '#2a8a8a', BLU][i], 2.5));
      showLab(o) && lb(g, -88, 165, 'Lyman (UV)', VIO, 15); showLab(o) && lb(g, 52, 165, 'Balmer (visible)', TXT.red, 15);
      if (t) lb(g, 0, -165, t, TXT.blue, 20);
      return g;
    },
    // "compton cx cy width |text"
    compton: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      photon(g, -210, 0, -16, 0, VIO, 8, 8); part(g, C(0, 0, 12), '#7fb7ea', BLU, 2); lb(g, 0, 5, '−', BLU, 16);
      photon(g, 14, -8, 170, -110, RED, 4, 8); arrow(g, 12, 10, 120, 90, BLU, 3.5);
      dash(g, 'M0 0 H200'); still(g, 'M60 0 A60 60 0 0 0 50 -33', DK, 2); showLab(o) && lb(g, 72, -10, 'θ', DK, 18, 'start');
      showLab(o) && lb(g, -120, -22, 'photon λ', VIO, 15); showLab(o) && lb(g, 150, -125, "λ' > λ", TXT.red, 15); showLab(o) && lb(g, 125, 110, 'electron recoils', TXT.blue, 15);
      showLab(o) && lb(g, 0, 150, "λ' − λ = (h / mc)(1 − cos θ)", TXT.red, 17);
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "orbitals cx cy size k=s|p|d |text"
    orbitals: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), k = o.k || 'p';
      dash(g, 'M-150 0 H150 M0 -150 V150', '#9aa0a8', 1.5); showLab(o) && lb(g, 146, 18, 'x', DK, 16); showLab(o) && lb(g, 12, -140, 'y', DK, 16, 'start');
      const lobe = (a, L, w, fill, ink) => { const q = mk('g', { transform: `rotate(${a})` }, g); part(q, `M0 0 C${L * .25} ${-w} ${L} ${-w} ${L} 0 C${L} ${w} ${L * .25} ${w} 0 0 Z`, fill, ink, 2.5); };
      if (k === 's') { part(g, C(0, 0, 90), '#f4c7b8', RED, 3); showLab(o) && lb(g, 0, 130, 's orbital: a sphere', TXT.red, 16); }
      else if (k === 'd') { [45, 135, 225, 315].forEach((a, i) => lobe(a, 120, 40, i % 2 ? '#bcd4f0' : '#f4c7b8', i % 2 ? BLU : RED)); showLab(o) && lb(g, 0, 160, 'd_xy: four lobes between the axes', TXT.blue, 16); }
      else { [0, 180].forEach((a, i) => lobe(a, 125, 45, i ? '#bcd4f0' : '#f4c7b8', i ? BLU : RED)); [90, 270].forEach((a, i) => lobe(a, 110, 36, i ? '#bfe3c0' : '#f6e3a8', i ? GRN : '#b58a10'));
        showLab(o) && lb(g, 120, -50, 'p_x', TXT.red, 17); showLab(o) && lb(g, 40, -120, 'p_y', '#b58a10', 17); showLab(o) && lb(g, 0, 165, 'colours: + and − phase', '#777', 14); }
      if (t) lb(g, 0, -170, t, TXT.blue, 20);
      return g;
    },
    // "sterngerlach cx cy width |text"
    sterngerlach: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p);
      part(g, R(-230, -25, 50, 50), '#e0a040', DK, 2.5); showLab(o) && lb(g, -205, 50, 'oven', DK, 14);
      line(g, 'M-180 0 H-60', VIO, 3); part(g, 'M-60 -70 L60 -70 L60 -22 L0 -8 L-60 -22 Z', '#e04b3a', DK, 2.5); part(g, R(-60, 18, 120, 50), '#5b86c8', DK, 2.5);
      lb(g, 0, -40, 'N', '#fff', 20); lb(g, 0, 50, 'S', '#fff', 20);
      line(g, 'M60 0 L200 -60', VIO, 3); line(g, 'M60 0 L200 60', VIO, 3); part(g, R(200, -120, 12, 240), '#efe6d6', '#8a7a60', 2);
      part(g, E(206, -60, 6, 12), VIO, VIO, 1); part(g, E(206, 60, 6, 12), VIO, VIO, 1);
      showLab(o) && lb(g, 220, -55, 'spin up', VIO, 15, 'start'); showLab(o) && lb(g, 220, 65, 'spin down', VIO, 15, 'start');
      showLab(o) && lb(g, 0, 115, 'two spots, not a smear: spin is quantised', TXT.red, 16);
      if (t) lb(g, 0, -110, t, TXT.blue, 20);
      return g;
    },
    // "wavepacket cx cy width |text"
    wavepacket: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), s = 55, env = x => 90 * Math.exp(-(x * x) / (2 * s * s));
      still(g, 'M-210 0 H210', '#c8ccd2', 1.5); dash(g, curve(x => -env(x), -210, 210), '#9aa0a8', 1.5); dash(g, curve(x => env(x), -210, 210), '#9aa0a8', 1.5);
      line(g, curve(x => -env(x) * Math.cos(x / 9), -210, 210, 300), BLU, 3);
      arrow(g, 0, 120, s, 120, '#777', 2); arrow(g, 0, 120, -s, 120, '#777', 2); showLab(o) && lb(g, 0, 145, 'Δx', DK, 18);
      showLab(o) && lb(g, 0, -115, 'Δx · Δp ≥ ħ/2', TXT.red, 19);
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "lightclock cx cy width |text"
    lightclock: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), top = -90, bot = 70, mir = (x, op = 1) => { still(g, `M${x - 30} ${top} H${x + 30} M${x - 30} ${bot} H${x + 30}`, '#555', 5, { opacity: op }); };
      mir(-170); line(g, `M-170 ${bot} V${top} `, RAY, 3); tip(g, -170, top + 30, -170, top + 40, RAY, 3); showLab(o) && lb(g, -170, 105, 'at rest: t₀', TXT.blue, 16);
      [10, 100, 190].forEach((x, i) => mir(x, i === 2 ? 1 : .35));
      line(g, `M10 ${bot} L100 ${top} L190 ${bot}`, RAY, 3); tip(g, 55, (bot + top) / 2, 50, (bot + top) / 2 + 17.8, RAY, 3);
      arrow(g, 60, 125, 140, 125, GRN, 3.5); showLab(o) && lb(g, 150, 131, 'v', TXT.green, 18, 'start');
      showLab(o) && lb(g, 100, 105, 'moving: longer path', TXT.red, 16); showLab(o) && lb(g, 0, -125, 't = γ t₀,  γ = 1/√(1 − v²/c²)', TXT.red, 18);
      if (t) lb(g, 0, -160, t, TXT.blue, 20);
      return g;
    },
    // "spacetime cx cy size v=0.5 |text"
    spacetime: ([cx, cy, S = 320], o, t, p) => {
      const g = G(cx, cy, S / 320, 0, p), v = Math.min(.9, Math.max(.1, +o.v || .5)), L = 140;
      fl(g, `M0 0 L${-L} ${-L} L${L} ${-L} Z`, '#fdeed3'); fl(g, `M0 0 L${-L} ${L} L${L} ${L} Z`, '#e8eef3');
      still(g, `M${-L - 10} 0 H${L + 10} M0 ${L + 10} V${-L - 10}`, DK, 3); tip(g, L + 10, 0, L, 0, DK, 3); tip(g, 0, -L - 10, 0, -L, DK, 3);
      showLab(o) && lb(g, L + 14, 6, 'x', DK, 18, 'start'); showLab(o) && lb(g, 8, -L - 14, 'ct', DK, 18, 'start');
      dash(g, `M${-L} ${L} L${L} ${-L} M${-L} ${-L} L${L} ${L}`, RAY, 2.5); showLab(o) && lb(g, L - 4, -L + 18, 'light', TXT.orange, 15, 'end');
      line(g, `M0 0 L${P(v * L, -L)}`, VIO, 3.5); showLab(o) && lb(g, v * L + 8, -L + 4, "ct'", VIO, 16, 'start');
      line(g, `M0 0 L${P(L, -v * L)}`, VIO, 3.5); showLab(o) && lb(g, L + 4, -v * L - 6, "x'", VIO, 16, 'start');
      showLab(o) && lb(g, -70, -100, 'future', TXT.orange, 16); showLab(o) && lb(g, -70, 110, 'past', TXT.blue, 16);
      showLab(o) && lb(g, 0, L + 40, `moving frame at v = ${v}c: axes tilt toward the light line`, '#555', 14);
      if (t) lb(g, 0, -L - 40, t, TXT.blue, 20);
      return g;
    },
    // "contraction cx cy width |text"
    contraction: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), L0 = 320, L = L0 * .6;
      part(g, R(-L0 / 2, -80, L0, 30), '#7fb7ea', BLU, 2.5); for (let x = -L0 / 2; x <= L0 / 2; x += 32) still(g, `M${x} -50 v-10`, BLU, 1.5);
      arrow(g, 0, -20, -L0 / 2, -20, '#777', 2); arrow(g, 0, -20, L0 / 2, -20, '#777', 2); showLab(o) && lb(g, 0, -95, 'at rest: L₀', TXT.blue, 16);
      part(g, R(-L / 2, 50, L, 30), '#7fb7ea', BLU, 2.5); arrow(g, L / 2 + 20, 65, L / 2 + 90, 65, GRN, 3.5); showLab(o) && lb(g, L / 2 + 100, 71, 'v', TXT.green, 18, 'start');
      arrow(g, 0, 110, -L / 2, 110, '#777', 2); arrow(g, 0, 110, L / 2, 110, '#777', 2); showLab(o) && lb(g, 0, 140, 'moving: L = L₀ / γ', TXT.red, 17);
      if (t) lb(g, 0, -130, t, TXT.blue, 20);
      return g;
    },
    // "pvcycle cx cy width k=carnot|otto|diesel |text"
    pvcycle: ([cx, cy, W = 420], o, t, p) => {
      const g = G(cx, cy, W / 420, 0, p), k = o.k || 'carnot', X = V => -160 + (V - 1) * 62, Y = Pp => 120 - Pp * 40;
      // schematic, like a textbook: a steeper adiabat (exponent 2) so the cycle encloses a readable area
      const curveV = (f, a, b) => { const r = []; for (let i = 0; i <= 40; i++) { const V = a + (b - a) * i / 40; r.push([X(V), Y(f(V))]); } return r; };
      const iso = (c, a, b) => curveV(V => c / V, a, b), adi = (c, a, b, n = 2) => curveV(V => c / V ** n, a, b);
      const flat = (V, a, b) => [[X(V), Y(a)], [X(V), Y(b)]], bar = (Pp, a, b) => [[X(a), Y(Pp)], [X(b), Y(Pp)]];
      let legs, names, notes;
      if (k === 'otto') { const n = 1.4, c1 = .6 * 4.5 ** n, c2 = 5.8 * 1.5 ** n;
        legs = [adi(c1, 4.5, 1.5, n), flat(1.5, c1 / 1.5 ** n, 5.8), adi(c2, 1.5, 4.5, n), flat(4.5, c2 / 4.5 ** n, .6)];
        names = ['1', '2', '3', '4']; notes = [[X(1.5) + 8, Y(4.4), 'Q in'], [X(4.5) + 10, Y(.95), 'Q out']]; }
      else if (k === 'diesel') { const n = 1.4, c1 = .6 * 4.5 ** n, p2 = c1, c3 = p2 * 2.2 ** n;
        legs = [adi(c1, 4.5, 1, n), bar(p2, 1, 2.2), adi(c3, 2.2, 4.5, n), flat(4.5, c3 / 4.5 ** n, .6)];
        names = ['1', '2', '3', '4']; notes = [[X(1.4), Y(p2) - 14, 'Q in'], [X(4.5) + 10, Y(1.15), 'Q out']]; }
      else { legs = [iso(5, 1, 2), adi(10, 2, 4), iso(2.5, 4, 2), adi(5, 2, 1)];
        names = ['1', '2', '3', '4']; notes = [[X(1.6), Y(3.3), 'Q_H in (T_H)'], [X(2.8), Y(.85) + 26, 'Q_C out (T_C)']]; }
      fl(g, pts(legs.flat()) + ' Z', '#fde3d6');
      axes(g, -180, 130, 190, -140, showLab(o) && 'V', showLab(o) && 'P');
      legs.forEach((l, i) => { line(g, pts(l), [RED, BLU, RED, BLU][i], 3.5); const m = l[Math.floor(l.length / 2)], n = l[Math.floor(l.length / 2) + 1] || l[l.length - 1];
        tip(g, ...(l.length === 2 ? [(l[0][0] + l[1][0]) / 2, (l[0][1] + l[1][1]) / 2, l[0][0] + (l[1][0] - l[0][0]) * .4, l[0][1] + (l[1][1] - l[0][1]) * .4] : [n[0], n[1], m[0], m[1]]), DK, 2.5);
        part(g, C(l[0][0], l[0][1], 5), DK, DK, 1); showLab(o) && lb(g, l[0][0] + 10, l[0][1] - 8, names[i], DK, 16, 'start'); });
      for (const [x, y, s] of notes) showLab(o) && lb(g, x, y, s, TXT.red, 15, 'start');
      showLab(o) && lb(g, X(k === 'carnot' ? 2 : 2.6), Y(k === 'carnot' ? 1.85 : 2.1), 'W = area', TXT.orange, 16);
      showLab(o) && lb(g, 0, 165, { carnot: 'Carnot: two isotherms, two adiabats; η = 1 − T_C/T_H', otto: 'Otto (petrol): adiabats + constant volume', diesel: 'Diesel: heat in at constant pressure' }[k] || '', TXT.blue, 15);
      if (t) lb(g, 0, -165, t, TXT.blue, 20);
      return g;
    },
    // "heatengine cx cy size k=engine|fridge |text"
    heatengine: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), fr = o.k === 'fridge';
      part(g, R(-130, -160, 260, 50), '#f6c4b4', RED, 3); showLab(o) && lb(g, 0, -128, 'hot reservoir T_H', TXT.red, 17);
      part(g, R(-130, 110, 260, 50), '#c6dcf2', BLU, 3); showLab(o) && lb(g, 0, 142, 'cold reservoir T_C', TXT.blue, 17);
      part(g, C(0, 0, 50), '#eef2f6', DK, 3); showLab(o) && lb(g, 0, 6, fr ? 'fridge' : 'engine', DK, 17);
      if (fr) { arrow(g, 0, 108, 0, 52, BLU, 5); arrow(g, 0, -52, 0, -108, RED, 5); arrow(g, 170, 0, 54, 0, GRN, 5); showLab(o) && lb(g, 175, -10, 'W in', TXT.green, 17, 'start');
        showLab(o) && lb(g, 0, 210, 'K = Q_C / W', TXT.blue, 18); }
      else { arrow(g, 0, -108, 0, -52, RED, 5); arrow(g, 0, 52, 0, 108, BLU, 5); arrow(g, 54, 0, 170, 0, GRN, 5); showLab(o) && lb(g, 175, -10, 'W out', TXT.green, 17, 'start');
        showLab(o) && lb(g, 0, 210, 'η = W / Q_H ≤ 1 − T_C / T_H', TXT.red, 18); }
      showLab(o) && lb(g, 12, -75, 'Q_H', TXT.red, 16, 'start'); showLab(o) && lb(g, 12, 85, 'Q_C', TXT.blue, 16, 'start');
      if (t) lb(g, 0, -185, t, TXT.blue, 20);
      return g;
    },
    // "speeddist cx cy width |text"
    speeddist: ([cx, cy, W = 420], o, t, p) => {
      const g = G(cx, cy, W / 420, 0, p), y0 = 120, f = a => x => { const v = x + 180; return y0 - 230 * (v * v / (a * a)) * Math.exp(-(v * v) / (a * a)) * (60 / a) * 2.7 / 2; };
      axes(g, -180, y0, 200, -140, showLab(o) && 'speed v', showLab(o) && 'number of molecules');
      line(g, curve(f(70), -180, 200), BLU, 3.5); line(g, curve(f(120), -180, 200), RED, 3.5);
      showLab(o) && lb(g, -95, -60, 'low T', TXT.blue, 16); showLab(o) && lb(g, 60, 10, 'high T', TXT.red, 16);
      dash(g, `M-110 ${y0} V${P(0, f(70)(-110)).split(' ')[1]}`, BLU, 1.5); showLab(o) && lb(g, -110, y0 + 22, 'v_p', TXT.blue, 15);
      showLab(o) && lb(g, 10, 165, 'Maxwell–Boltzmann: hotter = faster and wider', '#555', 15);
      if (t) lb(g, 0, -165, t, TXT.blue, 20);
      return g;
    },
    // "bands cx cy width k=all|metal|semi|insulator |text"
    bands: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p), k = o.k || 'all';
      const one = (x, kind) => { const gap = { metal: -20, semi: 40, insulator: 130 }[kind], vt = 40, ct = vt - gap;
        part(g, R(x - 50, vt, 100, 90), '#7fb7ea', BLU, 2.5);
        part(g, R(x - 50, ct - 90, 100, 90), kind === 'metal' ? '#bcd4f0' : '#fff', BLU, 2.5);
        if (kind === 'metal') fl(g, R(x - 50, ct - 10, 100, 10), '#7fb7ea');
        if (gap > 0) { arrow(g, x + 62, ct, x + 62, vt, '#777', 2); arrow(g, x + 62, vt, x + 62, ct, '#777', 2); showLab(o) && lb(g, x + 68, (ct + vt) / 2 + 6, 'E_g', DK, 14, 'start'); }
        dash(g, `M${x - 58} ${kind === 'metal' ? ct : (ct + vt) / 2} H${x + 58}`, RED, 2);
        showLab(o) && lb(g, x, 160, { metal: 'metal', semi: 'semiconductor', insulator: 'insulator' }[kind], DK, 16); };
      const list = k === 'all' ? ['metal', 'semi', 'insulator'] : [k];
      list.forEach((kind, i) => one(list.length === 1 ? 0 : -160 + i * 160, kind));
      showLab(o) && lb(g, -225, 90, 'valence', TXT.blue, 14, 'start'); showLab(o) && lb(g, -225, -110, 'conduction', TXT.blue, 14, 'start'); showLab(o) && lb(g, 225, -150, 'red dashes: Fermi level', TXT.red, 13, 'end');
      if (t) lb(g, 0, -175, t, TXT.blue, 20);
      return g;
    },
    // "crystal cx cy size k=sc|bcc|fcc |text"
    crystal: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), k = o.k || 'sc', a = 150, Q = (x, y, z) => [(x + z * .45 - .72) * a, (-y - z * .35 + .68) * a];
      const V = []; for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) V.push([x, y, z]);
      // the back-bottom-left corner (0,0,1) is hidden: its three edges are dashed
      for (const [u, v] of [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]]) {
        const hid = [V[u], V[v]].some(([x, y, z]) => !x && !y && z);
        (hid ? dash : still)(g, `M${P(...Q(...V[u]))} L${P(...Q(...V[v]))}`, '#7a7f88', 2); }
      const atoms = V.map(v => [...v, 16, '#5b86c8']);
      if (k === 'bcc') atoms.push([.5, .5, .5, 18, '#e04b3a']);
      if (k === 'fcc') for (const f of [[.5, .5, 0], [.5, .5, 1], [.5, 0, .5], [.5, 1, .5], [0, .5, .5], [1, .5, .5]]) atoms.push([...f, 14, '#5fae3a']);
      atoms.sort((m, n) => n[2] - m[2]).forEach(([x, y, z, r, c]) => { const [px, py] = Q(x, y, z); part(g, C(px, py, r), c, DK, 2); });
      showLab(o) && lb(g, 0, 150, { sc: 'simple cubic', bcc: 'body-centred cubic', fcc: 'face-centred cubic' }[k], DK, 17);
      if (t) lb(g, 0, -150, t, TXT.blue, 20);
      return g;
    },
    // "pnjunction cx cy width k=none|forward|reverse |text"
    pnjunction: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p);
      part(g, R(-200, -70, 200, 140), '#f8d7d2', DK, 3); part(g, R(0, -70, 200, 140), '#d4e5f6', DK, 3); fl(g, R(-45, -70, 90, 140), '#ffffff', { opacity: .6 });
      dash(g, 'M-45 -70 V70 M45 -70 V70', '#777', 1.5);
      for (const [x, y] of [[-170, -40], [-130, 10], [-90, -25], [-160, 40], [-100, 45], [-60, 0]]) { part(g, C(x, y, 9), '#fff', RED, 2); lb(g, x, y + 5, '+', TXT.red, 14); }
      for (const [x, y] of [[170, -40], [130, 10], [90, -25], [160, 40], [100, 45], [60, 0]]) { fl(g, C(x, y, 8), BLU); lb(g, x, y + 5, '−', '#fff', 14); }
      for (const y of [-45, 0, 45]) { part(g, C(-25, y, 10), '#f4c7b8', RED, 1.5); lb(g, -25, y + 5, '−', TXT.red, 14); part(g, C(25, y, 10), '#bcd4f0', BLU, 1.5); lb(g, 25, y + 5, '+', TXT.blue, 14); }
      arrow(g, 35, -90, -35, -90, GRN, 3); showLab(o) && lb(g, 0, -100, 'E', TXT.green, 18);
      showLab(o) && lb(g, -100, 100, 'p-type (holes)', TXT.red, 16); showLab(o) && lb(g, 100, 100, 'n-type (electrons)', TXT.blue, 16); showLab(o) && lb(g, 0, 128, 'depletion region', DK, 15);
      if (o.k === 'forward' || o.k === 'reverse') { const fw = o.k === 'forward'; still(g, 'M-200 0 H-230 V160 H-20 M20 160 H230 V0 H200', DK, 2.5);
        still(g, `M-9 ${160 - 24} V${160 + 24}`, DK, 4); still(g, `M9 ${160 - 13} V${160 + 13}`, DK, 7);
        lb(g, fw ? -26 : 26, 148, '+', TXT.red, 20); lb(g, fw ? 28 : -28, 152, '−', TXT.blue, 20);
        showLab(o) && lb(g, 0, 205, fw ? 'forward bias: barrier lowered, current flows' : 'reverse bias: depletion widens, almost no current', TXT.blue, 15); }
      if (t) lb(g, 0, -130, t, TXT.blue, 20);
      return g;
    },
  });
})();
