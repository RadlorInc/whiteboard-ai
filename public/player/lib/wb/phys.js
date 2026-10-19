// Whiteboard library — phys: the school physics syllabus beyond lib/wb/physics.js (founder, 19 Oct 2026: "physics the
// way biology was done"). Circuits with symbols, static, fields and induction, refraction, ray diagrams, mirrors, the eye,
// sound, motion, moments, springs, pressure, expansion, radioactivity, the atom, mains plugs. Catalogue: phys.txt.
// Only the physics subject prompt lists these. Same helpers and look as physics.js: `line` marches under flow
// (wires, rays, field lines), `still` does not.
(() => {
  const DK = '#33363b', RED = '#c0392b', BLU = '#2b6cc4', RAY = '#e0802a', GLASS = '#cfe9f7', GLE = '#4f93d6', GRN = '#2c6a22';
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
  // a light ray through points, with an arrowhead halfway along each part (dashed = a ray that only seems to be there)
  const ray = (g, pts, c = RAY, w = 3, dashed = false) => {
    (dashed ? still : line)(g, 'M' + pts.map(p => P(...p)).join(' L'), c, dashed ? 2 : w, dashed ? { 'stroke-dasharray': '6 7', opacity: .75 } : {});
    if (!dashed) for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 40) tip(g, m[0], m[1], m[0] - (b[0] - a[0]) * .01, m[1] - (b[1] - a[1]) * .01, c, w); }
  };
  const dash = (g, d, c = '#8a9098', w = 2) => still(g, d, c, w, { 'stroke-dasharray': '6 7' });
  const lb = (g, x, y, t, c = TXT.blue, s = 20, a = 'middle') => label(g, x, y, t, c, s, a);
  const sine = (x0, x1, y, A, cycles, n = 120) => { let d = ''; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n;
    d += (i ? ' L' : 'M') + P(x, y - A * Math.sin(2 * Math.PI * cycles * i / n)); } return d; };
  const zig = (x, y1, y2, w, n) => { let d = `M${x} ${y1}`; const h = (y2 - y1) / (2 * n + 2); d += ` L${x} ${y1 + h}`;
    for (let i = 0; i < 2 * n; i++) d += ` L${x + (i % 2 ? -w : w)} ${P(0, y1 + h * (i + 1.5)).split(' ')[1]}`; return d + ` L${x} ${y2 - h} L${x} ${y2}`; };
  const hatch = (g, x1, x2, y, c = '#777', down = -1) => { let d = ''; for (let x = x1; x <= x2; x += 16) d += `M${x} ${y} l-10 ${12 * down} `; still(g, d, c, 2); };
  const vhatch = (g, x, y1, y2, side = 1) => { let d = ''; for (let y = y1; y <= y2; y += 16) d += `M${x} ${y} l${12 * side} -10 `; still(g, d, '#777', 2); };
  // circuit-symbol pieces, centred on x y, lying along the wire (horizontal)
  const cellSym = (g, x, y) => { still(g, `M${x - 9} ${y - 26} L${x - 9} ${y + 26}`, DK, 4); still(g, `M${x + 9} ${y - 14} L${x + 9} ${y + 14}`, DK, 7);
    lb(g, x - 24, y - 20, '+', TXT.red, 24); lb(g, x + 26, y - 16, '−', TXT.blue, 24); };
  const lampSym = (g, x, y, on = true) => { part(g, C(x, y, 18), on ? '#fff1a0' : '#fff', DK, 3); still(g, `M${x - 12.7} ${y - 12.7} L${x + 12.7} ${y + 12.7} M${x - 12.7} ${y + 12.7} L${x + 12.7} ${y - 12.7}`, DK, 2.5); };
  const meter = (g, x, y, t, r = 18) => { part(g, C(x, y, r), '#fff', DK, 3); lb(g, x, y + 8, t, DK, 22); };
  const cart = (g, x, y, w, fill, t) => { part(g, `M${x - w / 2} ${y - 46} H${x + w / 2} V${y - 12} H${x - w / 2} Z`, fill, DK, 3);
    for (const dx of [-w / 3, w / 3]) part(g, C(x + dx, y - 6, 9), '#555', DK, 2); if (t) lb(g, x, y - 23, t, '#fff', 18); };
  const flame = (g, x, y, s = 1) => { const f = mk('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    part(f, 'M0 -60 C18 -38 28 -22 22 -8 C17 4 -17 4 -22 -8 C-28 -22 -12 -36 0 -60 Z', '#f4a531', RED, 2.5);
    fl(f, 'M0 -34 C8 -24 12 -14 9 -6 C6 1 -6 1 -9 -6 C-12 -14 -5 -22 0 -34 Z', '#ffd84a'); };
  const magnetBar = (g, x, y, L = 150, H = 40) => { part(g, R(x - L / 2, y - H / 2, L / 2, H), '#e04b3a', DK, 3); part(g, R(x, y - H / 2, L / 2, H), '#5b86c8', DK, 3);
    lb(g, x - L / 4, y + 8, 'N', '#fff', 24); lb(g, x + L / 4, y + 8, 'S', '#fff', 24); };
  const eyeIcon = (g, x, y, s = 1) => { const e = mk('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    part(e, 'M-26 0 Q0 -20 26 0 Q0 20 -26 0 Z', '#fff', DK, 2.5); part(e, C(0, 0, 8), '#5a7fb0', DK, 2); fl(e, C(0, 0, 3.5), '#222'); };

  Object.assign(window.RECIPES, {
    // "seriespar cx cy width k=series|parallel |text"
    seriespar: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, o.rot, p), par = o.k === 'parallel';
      const wires = par
        ? ['M-28 110 H-100', 'M-140 110 H-200 V-110 H-18', 'M18 -110 H200 V110 H28', 'M-200 0 H-18', 'M18 0 H200']
        : ['M-28 110 H-100', 'M-140 110 H-200 V-110 H-98', 'M-62 -110 H62', 'M98 -110 H200 V110 H28'];
      for (const d of wires) line(g, d, DK, 3.5);
      cellSym(g, 0, 110); meter(g, -120, 110, 'A', 20);
      if (par) { lampSym(g, 0, -110); lampSym(g, 0, 0); for (const x of [-200, 200]) fl(g, C(x, 0, 6), DK);
        line(g, 'M-30 -110 V-170 H-18 M18 -170 H30 V-110', DK, 2.5); meter(g, 0, -170, 'V');
        tip(g, 100, 0, 90, 0, RED, 3.5); }
      else { lampSym(g, -80, -110); lampSym(g, 80, -110); line(g, 'M50 -110 V-170 H62 M98 -170 H110 V-110', DK, 2.5); meter(g, 80, -170, 'V'); }
      for (const [x, y, ax, ay] of [[-165, 110, -155, 110], [-200, -50, -200, -40], [140, -110, 130, -110], [200, 55, 200, 45]]) tip(g, x, y, ax, ay, RED, 3.5);
      lb(g, 0, 165, par ? 'parallel: each lamp has its own path' : 'series: one path for the current', TXT.blue, 20);
      if (t) lb(g, -200, -200, t, TXT.red, 22, 'start');
      return g;
    },
    // "symbols cx cy width"
    symbols: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), cols = [-180, -60, 60, 180], rows = [-110, 0, 110];
      const S = {
        cell: (x, y) => { still(g, `M${x - 40} ${y} H${x - 8} M${x + 8} ${y} H${x + 40}`, DK, 3); still(g, `M${x - 8} ${y - 20} V${y + 20}`, DK, 3.5); still(g, `M${x + 8} ${y - 11} V${y + 11}`, DK, 6); },
        battery: (x, y) => { still(g, `M${x - 40} ${y} H${x - 22} M${x + 22} ${y} H${x + 40}`, DK, 3); for (const d of [-14, 14]) { still(g, `M${x + d - 8} ${y - 20} V${y + 20}`, DK, 3.5); still(g, `M${x + d + 8} ${y - 11} V${y + 11}`, DK, 6); } dash(g, `M${x - 6} ${y} H${x + 6}`, DK, 2); },
        lamp: (x, y) => { still(g, `M${x - 40} ${y} H${x - 16} M${x + 16} ${y} H${x + 40}`, DK, 3); part(g, C(x, y, 16), '#fff1a0'); still(g, `M${x - 11} ${y - 11} L${x + 11} ${y + 11} M${x - 11} ${y + 11} L${x + 11} ${y - 11}`, DK, 2.5); },
        switch: (x, y) => { still(g, `M${x - 40} ${y} H${x - 18} M${x + 18} ${y} H${x + 40} M${x - 18} ${y} L${x + 14} ${y - 18}`, DK, 3); fl(g, C(x - 18, y, 4), DK); fl(g, C(x + 18, y, 4), DK); },
        resistor: (x, y) => { still(g, `M${x - 40} ${y} H${x - 24} M${x + 24} ${y} H${x + 40}`, DK, 3); part(g, R(x - 24, y - 10, 48, 20), '#fff'); },
        'variable resistor': (x, y) => { still(g, `M${x - 40} ${y} H${x - 24} M${x + 24} ${y} H${x + 40}`, DK, 3); part(g, R(x - 24, y - 10, 48, 20), '#fff'); arrow(g, x - 26, y + 20, x + 26, y - 22, DK, 2.5); },
        ammeter: (x, y) => { still(g, `M${x - 40} ${y} H${x - 17} M${x + 17} ${y} H${x + 40}`, DK, 3); meter(g, x, y, 'A', 17); },
        voltmeter: (x, y) => { still(g, `M${x - 40} ${y} H${x - 17} M${x + 17} ${y} H${x + 40}`, DK, 3); meter(g, x, y, 'V', 17); },
        diode: (x, y) => { still(g, `M${x - 40} ${y} H${x + 40}`, DK, 3); part(g, `M${x - 12} ${y - 14} L${x + 12} ${y} L${x - 12} ${y + 14} Z`, '#fff'); still(g, `M${x + 12} ${y - 14} V${y + 14}`, DK, 3.5); },
        LED: (x, y) => { still(g, `M${x - 40} ${y} H${x + 40}`, DK, 3); part(g, `M${x - 12} ${y - 14} L${x + 12} ${y} L${x - 12} ${y + 14} Z`, '#ffd84a'); still(g, `M${x + 12} ${y - 14} V${y + 14}`, DK, 3.5);
          arrow(g, x - 2, y - 18, x + 10, y - 32, RAY, 2); arrow(g, x + 8, y - 14, x + 20, y - 28, RAY, 2); },
        fuse: (x, y) => { part(g, R(x - 24, y - 10, 48, 20), '#fff'); still(g, `M${x - 40} ${y} H${x + 40}`, DK, 3); },
        earth: (x, y) => { still(g, `M${x} ${y - 24} V${y + 2} M${x - 22} ${y + 2} H${x + 22} M${x - 14} ${y + 10} H${x + 14} M${x - 6} ${y + 18} H${x + 6}`, DK, 3); },
      };
      Object.keys(S).forEach((name, i) => { const x = cols[i % 4], y = rows[Math.floor(i / 4)]; S[name](x, y - 12); lb(g, x, y + 38, name, TXT.blue, 18); });
      if (t) lb(g, 0, -170, t, TXT.red, 24);
      return g;
    },
    // "static cx cy size k=balloon|electroscope |text"
    static: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, o.rot, p), sign = (x, y, s, c) => lb(g, x, y + 7, s, c, 22);
      if (o.k === 'electroscope') {
        part(g, 'M-90 140 L-90 -10 Q-90 -60 -40 -60 L40 -60 Q90 -60 90 -10 L90 140 Z', '#eef6fb', GLE, 3);
        part(g, R(-110, 140, 220, 16), '#b58a5a', DK, 3);
        part(g, E(0, -118, 46, 10), '#d9b54a', '#8a6a1a', 3); still(g, 'M0 -108 V60', '#8a6a1a', 5);
        part(g, R(-14, -66, 28, 14), '#777', DK, 2);
        part(g, 'M0 60 L-34 118 L-26 122 L0 70 Z', '#f3c33b', '#b58a10', 2); part(g, 'M0 60 L34 118 L26 122 L0 70 Z', '#f3c33b', '#b58a10', 2);
        for (const [x, y] of [[-30, -122], [0, -126], [30, -122], [-26, 96], [26, 96]]) sign(x, y, '+', RED);
        part(g, 'M-150 -210 L-60 -150 L-52 -162 L-142 -222 Z', '#c99a6a', DK, 2.5);
        for (const [x, y] of [[-118, -192], [-92, -175]]) sign(x, y, '+', RED);
        lb(g, 130, -110, 'metal cap', TXT.blue, 18, 'start'); lb(g, 50, 110, 'gold leaves spread', TXT.blue, 18, 'start');
        lb(g, -160, -230, 'charged rod', TXT.blue, 18, 'start');
      } else {
        part(g, E(-30, -80, 62, 76), '#e04b3a', '#7a1f1f', 3); part(g, 'M-38 -4 L-22 -4 L-30 8 Z', '#c0392b', '#7a1f1f', 2);
        still(g, 'M-30 8 Q-40 50 -22 90 Q-8 120 -28 150', '#555', 2);
        for (const [x, y] of [[-60, -115], [-25, -125], [5, -95], [-60, -65], [-20, -55], [10, -40]]) sign(x, y, '−', '#fff');
        part(g, R(90, -190, 30, 360), '#efe6d6', '#8a7a60', 3);
        for (const [x, y] of [[78, -130], [78, -90], [78, -50]]) sign(x, y, '+', RED);
        arrow(g, 40, -165, 72, -165, GRN, 3); lb(g, 56, -180, 'attract', TXT.green, 16);
        lb(g, -120, 120, 'rubbed balloon (−)', TXT.blue, 18, 'end'); lb(g, 140, 0, 'wall', TXT.blue, 18, 'start');
      }
      if (t) lb(g, 0, 200, t);
      return g;
    },
    // "wirefield cx cy size k=wire|solenoid |text"
    wirefield: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, o.rot, p), fc = '#4f6fb0';
      if (o.k === 'solenoid') {
        for (const s of [-1, 1]) for (const [y, h] of [[12, 110], [24, 170]]) line(g, `M150 ${s * y} C170 ${s * h} -170 ${s * h} -150 ${s * y}`, fc, 2.5);
        for (const y of [-20, 0, 20]) line(g, `M-150 ${y} H150`, fc, 2.5);
        tip(g, 60, 0, 50, 0, fc, 2.5); tip(g, 0, -95, 10, -95, fc, 2.5); tip(g, 0, 95, 10, 95, fc, 2.5);
        for (let i = 0; i < 9; i++) { const x = -96 + i * 24; still(g, `M${x} -42 C${x + 18} -42 ${x + 18} 42 ${x + 6} 42`, '#b5651d', 4); still(g, `M${x + 6} 42 C${x - 6} 42 ${x + 6} -42 ${x + 24} -42`, '#b5651d', 2, { opacity: .5 }); }
        line(g, 'M-96 42 L-96 170 L-20 170 M20 170 L114 170 L114 42', DK, 3); cellSym(g, 0, 170);
        lb(g, 178, 9, 'N', TXT.red, 28); lb(g, -178, 9, 'S', TXT.blue, 28);
      } else {
        part(g, E(0, 30, 170, 50), '#f6f1e4', '#8a7a60', 2.5);
        for (const [rx, ry] of [[50, 15], [95, 28], [140, 41]]) { line(g, `M${-rx} 30 A${rx} ${ry} 0 1 0 ${rx} 30 A${rx} ${ry} 0 1 0 ${-rx} 30`, fc, 2.5); tip(g, 0, 30 + ry, 10, 30 + ry, fc, 2.5); }
        line(g, 'M0 160 V-150', '#b5651d', 6); tip(g, 0, -150, 0, -140, RED, 4); lb(g, 18, -130, 'current', TXT.red, 18, 'start');
        lb(g, 150, -10, 'magnetic field', TXT.blue, 18, 'start');
      }
      if (t) lb(g, 0, -175, t);
      return g;
    },
    // "induction cx cy width |text"
    induction: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, o.rot, p);
      magnetBar(g, -150, -40, 140, 40); arrow(g, -110, -90, -40, -90, GRN, 3.5); lb(g, -150, -102, 'push magnet in', TXT.green, 17);
      for (let i = 0; i < 7; i++) { const x = -10 + i * 22; still(g, `M${x} -80 C${x + 16} -80 ${x + 16} 0 ${x + 5} 0`, '#b5651d', 4); still(g, `M${x + 5} 0 C${x - 6} 0 ${x + 6} -80 ${x + 22} -80`, '#b5651d', 2, { opacity: .5 }); }
      line(g, 'M-10 -80 V-100 M-10 0 L-10 100 L90 100 M152 -80 L152 -100 L200 -100 L200 100 L150 100', DK, 3);
      part(g, C(120, 100, 32), '#fff', DK, 3); still(g, `M98 92 A24 24 0 0 1 142 92`, DK, 2); still(g, 'M120 108 L136 80', RED, 3); lb(g, 120, 126, 'G', DK, 18);
      lb(g, 70, 160, 'needle moves: a current is made', TXT.blue, 18);
      if (t) lb(g, 0, -150, t);
      return g;
    },
    // "refraction cx cy size k=slab|bent|tir|fibre |text"
    refraction: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, o.rot, p), k = o.k || 'slab';
      if (k === 'slab') {
        part(g, R(-120, -70, 240, 140), GLASS, GLE, 3);
        const i = rad(50), r = Math.asin(Math.sin(i) / 1.5), P1 = [-40, -70], Q = [-40 + 140 * Math.tan(r), 70];
        dash(g, 'M-40 -150 V0'); dash(g, `M${Q[0].toFixed(1)} 0 V150`);
        ray(g, [[-40 - 130 * Math.sin(i), -70 - 130 * Math.cos(i)], P1, Q, [Q[0] + 110 * Math.sin(i), 70 + 110 * Math.cos(i)]]);
        lb(g, -58, -100, 'i', TXT.red, 22); lb(g, -28, -30, 'r', TXT.red, 22);
        lb(g, 140, -90, 'air', TXT.blue, 18, 'start'); lb(g, 70, 30, 'glass', TXT.blue, 18); lb(g, 50, -110, 'normal', '#777', 16, 'start');
      } else if (k === 'bent') {
        part(g, 'M-130 -60 L130 -60 L130 130 L-130 130 Z', '#cfe9f7', GLE, 3); still(g, 'M-140 -40 H140', GLE, 2);
        part(g, 'M-110 -170 L-96 -180 L4 -46 L-10 -36 Z', '#f3c33b', '#8a6a10', 2.5);
        part(g, 'M-3 -41 L60 10 L54 22 L-10 -32 Z', '#f3c33b', '#8a6a10', 2.5); dash(g, 'M-3 -41 L90 84', '#8a6a10', 2);
        lb(g, 70, -10, 'seen here', TXT.red, 18, 'start'); lb(g, 96, 100, 'really here', '#777', 16, 'start');
        lb(g, 0, 160, 'light bends as it leaves the water', TXT.blue, 18);
      } else if (k === 'tir') {
        part(g, 'M-160 0 A160 160 0 0 0 160 0 Z', GLASS, GLE, 3);
        const a = rad(50), L = 150; dash(g, 'M0 -60 V150');
        ray(g, [[-L * Math.sin(a), L * Math.cos(a)], [0, 0], [L * Math.sin(a), L * Math.cos(a)]]);
        lb(g, -30, 60, 'i', TXT.red, 22); lb(g, 0, -80, 'angle bigger than the critical angle', TXT.blue, 18);
        lb(g, 0, 190, 'total internal reflection', TXT.red, 20);
      } else {
        still(g, 'M-220 -25 H220', GLE, 3); still(g, 'M-220 25 H220', GLE, 3); fl(g, R(-220, -25, 440, 50), GLASS);
        const pts = [[-260, 0]]; for (let x = -200, s = -1; x <= 220; x += 60, s = -s) pts.push([x, s * 25]); pts.push([260, 0]); ray(g, pts);
        lb(g, 0, 60, 'optical fibre: light reflects all the way along', TXT.blue, 18);
      }
      if (t) lb(g, 0, -190, t);
      return g;
    },
    // "raydiagram cx cy width k=convex|concave obj=far|2f|mid|near |text"
    raydiagram: ([cx, cy, W = 480], o, t, p) => {
      const g = G(cx, cy, W / 480, 0, p), cave = o.k === 'concave', f = cave ? -80 : 80, h = 60;
      const u = { far: 220, '2f': 160, mid: 120, near: 50 }[o.obj || 'far'] || 220, v = 1 / (1 / f - 1 / u), iy = h * v / u, real = v > 0;
      dash(g, 'M-250 0 H250', '#9aa0a8', 2);
      part(g, cave ? 'M-18 -95 L18 -95 Q4 0 18 95 L-18 95 Q-4 0 -18 -95 Z' : 'M0 -95 Q34 0 0 95 Q-34 0 0 -95 Z', GLASS, GLE, 3);
      for (const x of [-160, -80, 80, 160]) { still(g, `M${x} -6 V6`, DK, 2.5); lb(g, x, 26, Math.abs(x) === 80 ? 'F' : '2F', TXT.red, 17); }
      still(g, `M${-u} 0 L${-u} ${-h}`, GRN, 5); tip(g, -u, -h, -u, 0, GRN, 5); lb(g, -u, 26, 'object', TXT.green, 16);
      // ray 1: parallel to the axis, then through F (or away from F); ray 2: straight through the centre
      const fx = Math.abs(f), slope = cave ? -h / fx : h / fx, endX = 245, y1 = x => -h + slope * x;
      ray(g, [[-u, -h], [0, -h], [endX, y1(endX)]]);
      ray(g, [[-u, -h], [endX, endX * h / u]]);
      if (!real) { dash(g, `M0 ${-h} L${P(v, iy)}`, RAY); dash(g, `M0 0 L${P(v, iy)}`, RAY); }
      (real ? still : dash)(g, `M${P(v, 0)} L${P(v, iy)}`, '#7a4ab0', real ? 5 : 3);
      tip(g, v, iy, v, 0, '#7a4ab0', 4);
      lb(g, v, real ? iy + 24 : iy - 12, real ? 'real image' : 'virtual image', '#7a4ab0', 16);
      if (t) lb(g, 0, -120, t);
      return g;
    },
    // "curvedmirror cx cy size k=concave|convex |text"
    curvedmirror: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, o.rot, p), vex = o.k === 'convex', Rr = 240, ys = [-60, -25, 25, 60];
      const mx = y => vex ? Rr - Math.sqrt(Rr * Rr - y * y) : -Rr + Math.sqrt(Rr * Rr - y * y);
      const arc = []; for (let y = -110; y <= 110; y += 10) arc.push(P(mx(y), y));
      still(g, 'M' + arc.join(' L'), '#555', 5); let hd = ''; for (let y = -105; y <= 105; y += 16) hd += `M${P(mx(y), y)} l12 -8 `; still(g, hd, '#888', 2);
      dash(g, 'M-260 0 H160', '#9aa0a8', 2);
      const F = vex ? Rr / 2 : -Rr / 2; part(g, C(F, 0, 5), RED, '#7a1f1f', 2); lb(g, F, 28, 'F', TXT.red, 22);
      for (const y of ys) { const m = [mx(y), y];
        if (vex) { const dx = m[0] - F, dy = y, k = 160 / Math.hypot(dx, dy); ray(g, [[-260, y], m, [m[0] + dx * k, y + dy * k]]); dash(g, `M${P(...m)} L${F} 0`, RAY); }
        else { const dx = F - m[0], dy = -y, k = 1.5; ray(g, [[-260, y], m, [m[0] + dx * k, y + dy * k]]); } }
      lb(g, 0, 150, vex ? 'convex mirror: rays spread out' : 'concave mirror: rays meet at F', TXT.blue, 18);
      if (t) lb(g, 0, -140, t);
      return g;
    },
    // "eyedefect cx cy width k=normal|myopia|hyper fix=0|1 |text"
    eyedefect: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), k = o.k || 'normal', fix = o.fix === '1' && k !== 'normal';
      part(g, C(40, 0, 100), '#fbfbfb', DK, 3); part(g, 'M-55 -45 Q-80 0 -55 45', '#e8f4fb', GLE, 2.5);
      still(g, 'M120 -60 A100 100 0 0 1 120 60', RED, 5); lb(g, 150, -70, 'retina', TXT.red, 16, 'start');
      part(g, E(-30, 0, 14, 42), GLASS, GLE, 2.5);
      const focus = fix || k === 'normal' ? 138 : k === 'myopia' ? 80 : 210;
      for (const s of [-1, 1]) { const y0 = 36 * s, pts = [[-210, y0]];
        if (fix) { const y1 = k === 'myopia' ? y0 * 1.25 : y0 * .8; pts.push([-150, y0], [-30, y1]); } else pts.push([-30, y0]);
        const last = pts[pts.length - 1];
        if (focus <= 138) { pts.push([focus, 0]); if (focus < 120) pts.push([120 + (120 - focus) * 0, -last[1] * (120 - focus) / (focus + 30)]); ray(g, pts); }
        else { ray(g, [...pts, [130, last[1] * (1 - 160 / 240)]]); dash(g, `M130 ${P(0, last[1] * (1 - 160 / 240)).split(' ')[1]} L${focus} 0`, RAY); } }
      if (fix) part(g, k === 'myopia' ? 'M-165 -60 L-135 -60 Q-146 0 -135 60 L-165 60 Q-154 0 -165 -60 Z' : 'M-150 -60 Q-130 0 -150 60 Q-170 0 -150 -60 Z', GLASS, GLE, 2.5);
      const name = { normal: 'normal eye: image on the retina', myopia: 'short sight: image in front of the retina', hyper: 'long sight: image behind the retina' }[k];
      lb(g, 0, 140, fix ? (k === 'myopia' ? 'fixed with a concave lens' : 'fixed with a convex lens') : name, TXT.blue, 18);
      if (t) lb(g, 0, -125, t);
      return g;
    },
    // "pinhole cx cy width |text"
    pinhole: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      part(g, R(-210, -10, 22, 60), '#fff4d6', '#8a7a60', 2.5); flame(g, -199, -12, .9);
      fl(g, R(0, -80, 200, 160), '#3b3f47', { opacity: .15 }); still(g, 'M0 -80 V-3 M0 3 V80 M0 80 H200 V-80 H0', DK, 4); still(g, 'M200 -80 V80', '#c8b98a', 6);
      ray(g, [[-199, -62], [0, 0], [199, 62]], RAY, 2.5); ray(g, [[-199, 50], [0, 0], [199, -50]], RAY, 2.5);
      const im = mk('g', { transform: 'translate(188 0) scale(.75 -.75)' }, g); part(im, R(-11, -10, 22, 60), '#fff4d6', '#8a7a60', 2); flame(im, 0, -12, .8);
      lb(g, 0, -95, 'pinhole', TXT.blue, 16); lb(g, 205, 110, 'upside-down image', TXT.red, 16); lb(g, -200, 80, 'candle', TXT.blue, 16);
      if (t) lb(g, 0, -130, t);
      return g;
    },
    // "shadow cx cy width |text"
    shadow: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      part(g, C(-200, 0, 16), '#fff1a0', '#b58a10', 2.5); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; still(g, `M${P(-200 + 22 * Math.cos(a), 22 * Math.sin(a))} L${P(-200 + 32 * Math.cos(a), 32 * Math.sin(a))}`, INK.yellow, 2.5); }
      fl(g, 'M0 -40 L180 -76 L180 76 L0 40 Z', '#3b3f47', { opacity: .35 });
      ray(g, [[-200, 0], [0, -40], [180, -76]], RAY, 2.5); ray(g, [[-200, 0], [0, 40], [180, 76]], RAY, 2.5);
      part(g, C(0, 0, 40), '#8a929c', DK, 3); part(g, R(180, -130, 14, 260), '#efe6d6', '#8a7a60', 2.5); part(g, R(180, -76, 14, 152), '#4a4e56', DK, 2);
      lb(g, -200, 50, 'light', TXT.blue, 16); lb(g, 0, 75, 'opaque ball', TXT.blue, 16); lb(g, 220, 0, 'shadow', TXT.red, 18, 'start');
      if (t) lb(g, 0, -150, t);
      return g;
    },
    // "periscope cx cy height |text"
    periscope: ([cx, cy, H = 320], o, t, p) => {
      const g = G(cx, cy, H / 320, 0, p);
      fl(g, 'M-110 -150 H40 V90 H110 V150 H-40 V-90 H-110 Z', '#d9dde3');
      still(g, 'M-110 -150 H40 V90 H110 M110 150 H-40 V-90 H-110', DK, 4);
      still(g, 'M-30 -150 L30 -90', '#4f93d6', 6); still(g, 'M-30 90 L30 150', '#4f93d6', 6);
      ray(g, [[-200, -120], [0, -120], [0, 120], [140, 120]]); eyeIcon(g, 168, 120, .9);
      lb(g, 40, -120, 'mirror at 45°', TXT.blue, 16, 'start'); lb(g, -40, 125, 'mirror', TXT.blue, 16, 'end');
      if (t) lb(g, 0, -175, t);
      return g;
    },
    // "belljar cx cy size air=0|1 |text"
    belljar: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), air = o.air === '1';
      part(g, R(-150, 110, 300, 20), '#8a929c', DK, 3);
      part(g, 'M-110 110 L-110 -40 Q-110 -150 0 -150 Q110 -150 110 -40 L110 110', '#eef6fb', GLE, 3);
      part(g, R(-14, -158, 28, 10), '#9aa0a8', DK, 2);
      still(g, 'M0 40 V110', DK, 3); part(g, 'M-40 40 Q-40 -30 0 -30 Q40 -30 40 40 Z', '#f3c33b', '#8a6a10', 3); part(g, C(30, 40, 9), '#555', DK, 2);
      line(g, 'M-20 110 V150 H-60 M20 110 V150 H60', DK, 3); cellSym(g, -80, 150);
      still(g, 'M150 120 H230', DK, 6); part(g, R(230, 90, 50, 60), '#c9ccd2', DK, 3); lb(g, 255, 175, 'pump', TXT.blue, 16);
      if (air) for (const r of [140, 165, 190]) still(g, `M${P(r * Math.cos(rad(-40)), r * Math.sin(rad(-40)) - 20)} A${r} ${r} 0 0 1 ${P(r * Math.cos(rad(20)), r * Math.sin(rad(20)) - 20)}`, BLU, 2.5);
      lb(g, 0, 200, air ? 'air inside: we hear the bell' : 'air pumped out: no sound', air ? TXT.blue : TXT.red, 18);
      if (t) lb(g, 0, -180, t);
      return g;
    },
    // "echo cx cy width |text"
    echo: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      part(g, R(-220, -24, 22, 48), '#555', DK, 3); part(g, 'M-198 -24 L-160 -55 L-160 55 L-198 24 Z', '#9aa0a8', DK, 3);
      part(g, R(190, -140, 30, 250), '#c97a5a', '#7a3a2a', 3); for (let y = -110; y < 110; y += 30) still(g, `M190 ${y} H220`, '#7a3a2a', 2);
      for (const x of [-120, -60, 0, 60]) line(g, `M${x} -40 Q${x + 20} 0 ${x} 40`, BLU, 3);
      for (const x of [170, 110]) line(g, `M${x} -40 Q${x - 20} 0 ${x} 40`, RED, 3, { opacity: .8 });
      arrow(g, -120, -75, 120, -75, BLU, 3); arrow(g, 150, 75, -100, 75, RED, 3);
      lb(g, 0, -88, 'sound goes out', TXT.blue, 17); lb(g, 25, 100, 'echo comes back', TXT.red, 17);
      arrow(g, -160, 140, 185, 140, '#777', 2); arrow(g, 185, 140, -160, 140, '#777', 2); lb(g, 12, 165, 'd', DK, 20);
      if (t) lb(g, 0, -150, t);
      return g;
    },
    // "wavecompare cx cy width k=pitch|loud |text"
    wavecompare: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), loud = o.k === 'loud';
      for (const y of [-70, 70]) still(g, `M-200 ${y} H200`, '#c8ccd2', 1.5);
      line(g, sine(-200, 200, -70, loud ? 18 : 40, loud ? 3 : 2), BLU, 3.5); line(g, sine(-200, 200, 70, 50, loud ? 3 : 6), RED, 3.5);
      lb(g, -210, -66, loud ? 'soft (small amplitude)' : 'low pitch (low frequency)', TXT.blue, 18, 'end');
      lb(g, -210, 74, loud ? 'loud (big amplitude)' : 'high pitch (high frequency)', TXT.red, 18, 'end');
      if (t) lb(g, 0, -140, t);
      return g;
    },
    // "collision cx cy width k=stick|bounce |text"
    collision: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p), stick = o.k !== 'bounce';
      for (const y of [-40, 120]) still(g, `M-220 ${y} H220`, '#777', 2);
      lb(g, -220, -110, 'before', TXT.blue, 20, 'start'); lb(g, -220, 50, 'after', TXT.blue, 20, 'start');
      cart(g, -110, -40, 90, '#e04b3a', 'm'); cart(g, 60, -40, 90, '#5b86c8', 'm'); arrow(g, -150, -100, -70, -100, GRN, 3.5); lb(g, -50, -95, 'v', TXT.green, 20, 'start');
      lb(g, 60, -100, 'at rest', '#777', 16);
      if (stick) { cart(g, -20, 120, 90, '#e04b3a', 'm'); cart(g, 70, 120, 90, '#5b86c8', 'm'); arrow(g, 0, 60, 50, 60, GRN, 3.5); lb(g, 60, 66, 'v/2', TXT.green, 20, 'start'); }
      else { cart(g, -40, 120, 90, '#e04b3a', 'm'); cart(g, 120, 120, 90, '#5b86c8', 'm'); lb(g, -40, 60, 'stops', '#777', 16); arrow(g, 90, 60, 170, 60, GRN, 3.5); lb(g, 180, 66, 'v', TXT.green, 20, 'start'); }
      lb(g, 0, 165, 'momentum before = momentum after', TXT.red, 18);
      if (t) lb(g, 0, -150, t);
      return g;
    },
    // "circular cx cy size |text"
    circular: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p);
      dash(g, C(0, 0, 120), '#9aa0a8', 2); part(g, C(0, 0, 6), DK, DK, 2);
      const sw = mk('g', {}, g); g.swing = sw; const a = rad(-45), bx = 120 * Math.cos(a), by = 120 * Math.sin(a);
      still(sw, `M0 0 L${P(bx, by)}`, '#8a7a60', 2.5); part(sw, C(bx, by, 16), '#e04b3a', '#7a1f1f', 3);
      arrow(sw, bx, by, bx + 90 * Math.sin(a), by - 90 * Math.cos(a), GRN, 4);
      arrow(sw, bx * .8, by * .8, bx * .35, by * .35, RED, 4);
      lb(g, bx - 60, by - 75, 'velocity', TXT.green, 18, 'end'); lb(g, 40, -10, 'force to the centre', TXT.red, 16, 'start');
      if (t) lb(g, 0, 160, t);
      return g;
    },
    // "moments cx cy width |text"
    moments: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      part(g, R(-200, -10, 400, 16), '#c99a6a', '#7a5a3a', 3); part(g, 'M0 6 L-26 60 L26 60 Z', '#8a929c', DK, 3); hatch(g, -50, 50, 60, '#777', 1);
      part(g, R(-170, -60, 50, 50), '#5b86c8', DK, 3); lb(g, -145, -28, '2 N', '#fff', 18);
      part(g, R(90, -50, 40, 40), '#e04b3a', DK, 3); lb(g, 110, -24, '3 N', '#fff', 16);
      for (const [x1, x2, tx] of [[-145, 0, 'd1 = 3 m'], [0, 110, 'd2 = 2 m']]) { arrow(g, (x1 + x2) / 2, 90, x1, 90, '#777', 2); arrow(g, (x1 + x2) / 2, 90, x2, 90, '#777', 2); lb(g, (x1 + x2) / 2, 115, tx, DK, 17); }
      arrow(g, -145, -5, -145, 40, BLU, 0.1); still(g, 'M-90 -90 A100 60 0 0 0 -170 -70', BLU, 2.5); tip(g, -170, -70, -160, -78, BLU, 2.5);
      still(g, 'M70 -90 A100 60 0 0 1 150 -70', RED, 2.5); tip(g, 150, -70, 140, -78, RED, 2.5);
      lb(g, 0, 150, '2 N × 3 m = 3 N × 2 m: balanced', TXT.red, 18);
      if (t) lb(g, 0, -130, t);
      return g;
    },
    // "hooke cx cy width |text"
    hooke: ([cx, cy, W = 400], o, t, p) => {
      const g = G(cx, cy, W / 400, 0, p);
      part(g, R(-190, -150, 360, 14), '#8a929c', DK, 3); hatch(g, -180, 160, -150, '#777', -1);
      part(g, R(150, -136, 30, 300), '#fff4d6', '#8a7a60', 2); for (let y = -126; y < 160; y += 20) still(g, `M150 ${y} h${(y + 126) % 100 ? 8 : 16}`, '#8a7a60', 1.5);
      [0, 1, 2].forEach(n => { const x = -120 + n * 110, end = -36 + n * 50;
        still(g, zig(x, -136, end, 16, 7), '#555', 3);
        for (let i = 0; i < n; i++) part(g, R(x - 22, end + i * 28, 44, 26), '#7a7f88', DK, 2.5);
        dash(g, `M${x + 26} ${end} H140`, n ? RED : '#9aa0a8', 1.5); lb(g, x, 172, ['no load', '1 weight', '2 weights'][n], TXT.blue, 16); });
      lb(g, 60, -20, 'x', TXT.red, 20); lb(g, 60, 30, '2x', TXT.red, 20);
      if (t) lb(g, 0, -170, t);
      return g;
    },
    // "freefall cx cy height k=strobe|forces |text"
    freefall: ([cx, cy, H = 320], o, t, p) => {
      const g = G(cx, cy, H / 320, 0, p);
      if (o.k === 'forces') {
        [[10, 'speeding up'], [45, 'still speeding up'], [80, 'terminal velocity']].forEach(([up, tx], i) => { const x = -150 + i * 150;
          part(g, C(x, 0, 26), '#e04b3a', '#7a1f1f', 3); arrow(g, x, 26, x, 106, RED, 4); arrow(g, x, -26, x, -26 - up, BLU, 4); lb(g, x, 140, tx, DK, 16); });
        lb(g, -200, 90, 'weight', TXT.red, 16, 'end'); lb(g, -200, -40, 'air resistance', TXT.blue, 16, 'end');
      } else {
        still(g, 'M-60 -150 V180', '#8a7a60', 3); for (let y = -150; y <= 180; y += 33) still(g, `M-60 ${y} h-12`, '#8a7a60', 2);
        [1, 2, 3, 4, 5, 6].forEach(n => { const s = n - 1, y = -150 + 9 * n * n; part(g, C(0, y, 11), '#e04b3a', '#7a1f1f', 2.5); lb(g, 30, y + 6, `${s} s`, '#777', 15, 'start'); });
        lb(g, 0, 205, 'it falls further every second', TXT.blue, 17);
      }
      if (t) lb(g, 0, -175, t);
      return g;
    },
    // "pressure cx cy width k=depth|barometer |text"
    pressure: ([cx, cy, W = 400], o, t, p) => {
      const g = G(cx, cy, W / 400, 0, p);
      if (o.k === 'barometer') {
        part(g, 'M-110 90 L-110 140 L110 140 L110 90', '#d8dbe0', DK, 3); fl(g, R(-108, 104, 216, 34), '#9aa3ad');
        part(g, R(-14, -170, 28, 300), '#eef6fb', GLE, 2.5); fl(g, R(-12, -120, 24, 248), '#9aa3ad');
        lb(g, 20, -150, 'vacuum', '#777', 15, 'start');
        arrow(g, 40, -120, 40, 104, RED, 2); arrow(g, 40, 104, 40, -120, RED, 2); lb(g, 50, -10, '76 cm', TXT.red, 18, 'start');
        for (const x of [-80, -50, 60, 90]) arrow(g, x, 40, x, 98, BLU, 3); lb(g, -70, 30, 'air pushes down', TXT.blue, 16);
        lb(g, 0, 170, 'mercury', DK, 16);
      } else {
        part(g, 'M-120 -150 L-120 150 L20 150 L20 -150', '#eef6fb', DK, 3); fl(g, R(-118, -120, 136, 268), '#7fb7ea');
        [[-80, 50], [0, 90], [80, 135]].forEach(([y, reach]) => { part(g, C(20, y, 5), '#fff', DK, 2);
          line(g, `M25 ${y} Q${25 + reach * .6} ${y} ${25 + reach} ${150}`, BLU, 3.5); });
        lb(g, 120, -60, 'deeper: higher pressure,', TXT.blue, 16, 'start'); lb(g, 120, -38, 'water spurts further', TXT.blue, 16, 'start');
      }
      if (t) lb(g, 0, -185, t);
      return g;
    },
    // "bimetal cx cy width k=cold|hot |text"
    bimetal: ([cx, cy, W = 400], o, t, p) => {
      const g = G(cx, cy, W / 400, 0, p), hot = o.k === 'hot';
      part(g, R(-200, -40, 30, 80), '#8a929c', DK, 3);
      const strip = (dy, fill) => { const pts = []; for (let i = 0; i <= 20; i++) { const x = -170 + i * 17, s = i / 20;
        pts.push([x, dy + (hot ? 120 * s * s : 0)]); } part(g, 'M' + pts.map(q => P(q[0], q[1] - 6)).join(' L') + ' L' + pts.reverse().map(q => P(q[0], q[1] + 6)).join(' L') + ' Z', fill, DK, 2); };
      strip(-6, '#e0a040'); strip(6, '#9aa3ad');
      lb(g, -60, -24, 'brass', '#a56a10', 17); lb(g, -60, 40, 'iron', '#555', 17);
      if (hot) { flame(g, 0, 140, 1.1); lb(g, 0, 170, 'heated: brass expands more, so it bends', TXT.red, 17); }
      else lb(g, 0, 90, 'cold: straight', TXT.blue, 17);
      if (t) lb(g, 0, -90, t);
      return g;
    },
    // "penetration cx cy width |text"
    penetration: ([cx, cy, W = 460], o, t, p) => {
      const g = G(cx, cy, W / 460, 0, p);
      part(g, R(-230, -100, 50, 200), '#f3c33b', DK, 3); lb(g, -205, 130, 'source', DK, 16);
      for (const [x, w, fill, tx] of [[-80, 6, '#f6f1e4', 'paper'], [30, 14, '#c9ccd2', 'aluminium'], [150, 34, '#5a5f68', 'lead']]) { part(g, R(x, -110, w, 220), fill, DK, 2.5); lb(g, x + w / 2, 135, tx, DK, 16); }
      ray(g, [[-178, -60], [-82, -60]], RED, 4); lb(g, -135, -72, 'alpha α', TXT.red, 17);
      ray(g, [[-178, 0], [28, 0]], GRN, 3.5); lb(g, -135, -12, 'beta β', TXT.green, 17);
      ray(g, [[-178, 60], [148, 60]], '#7a4ab0', 3); still(g, 'M186 60 H230', '#7a4ab0', 1.5, { opacity: .5 }); lb(g, -135, 48, 'gamma γ', '#7a4ab0', 17);
      if (t) lb(g, 0, -135, t);
      return g;
    },
    // "halflife cx cy width |text"
    halflife: ([cx, cy, W = 420], o, t, p) => {
      const g = G(cx, cy, W / 420, 0, p), x0 = -180, y0 = 130, T = 90, N0 = 240;
      still(g, `M${x0} -130 V${y0} H210`, DK, 3); tip(g, x0, -130, x0, -120, DK, 3); tip(g, 210, y0, 200, y0, DK, 3);
      let d = ''; for (let i = 0; i <= 80; i++) { const x = i * 4.5; d += (i ? ' L' : 'M') + P(x0 + x, y0 - N0 * Math.pow(.5, x / T)); } line(g, d, RED, 3.5);
      ['N', 'N/2', 'N/4', 'N/8'].forEach((tx, i) => { const y = y0 - N0 / 2 ** i, x = x0 + i * T;
        if (i) dash(g, `M${x0} ${y} H${x} V${y0}`); lb(g, x0 - 8, y + 6, tx, TXT.red, 16, 'end'); if (i) lb(g, x, y0 + 22, `${i}T`, DK, 16); });
      lb(g, 15, y0 + 46, 'time (T = half-life)', DK, 17); lb(g, x0, -145, 'atoms left', DK, 17);
      if (t) lb(g, 60, -120, t);
      return g;
    },
    // "goldfoil cx cy width |text"
    goldfoil: ([cx, cy, W = 440], o, t, p) => {
      const g = G(cx, cy, W / 440, 0, p);
      part(g, R(-220, -30, 50, 60), '#9aa3ad', DK, 3); lb(g, -195, 55, 'alpha source', DK, 15);
      part(g, R(-4, -120, 8, 240), '#f3c33b', '#8a6a10', 2.5); lb(g, 0, 145, 'gold foil', '#8a6a10', 17);
      for (const y of [-24, -8, 8, 24]) ray(g, [[-170, y], [210, y]], RED, 2.5);
      ray(g, [[-170, -14], [0, -14], [180, -90]], RED, 2.5); ray(g, [[-170, 16], [0, 16], [-140, 120]], RED, 2.5);
      lb(g, 150, 50, 'most go straight through', TXT.blue, 16); lb(g, -120, 150, 'a few bounce back', TXT.red, 16);
      if (t) lb(g, 0, -140, t);
      return g;
    },
    // "photoelectric cx cy size |text"
    photoelectric: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p);
      part(g, 'M-140 60 L140 60 L120 110 L-160 110 Z', '#c9ccd2', DK, 3); lb(g, -10, 140, 'metal', DK, 17);
      for (const x of [-120, -60, 0]) { const d = []; for (let i = 0; i <= 40; i++) { const s = i / 40, px = x - 70 + 70 * s, py = -150 + 200 * s, w = 8 * Math.sin(s * 6 * 2 * Math.PI);
        d.push(P(px + w * .94, py - w * .33)); } line(g, 'M' + d.join(' L'), '#7a4ab0', 2.5); tip(g, x, 50, x - 7, 30, '#7a4ab0', 2.5); }
      lb(g, -150, -150, 'light', '#7a4ab0', 18);
      for (const [x, dx, dy] of [[40, 50, -110], [90, 90, -60], [60, 110, -130]]) { part(g, C(x, 50, 10), '#7fb7ea', BLU, 2); lb(g, x, 56, '−', BLU, 16); arrow(g, x + 8, 40, x + dx * .6, 50 + dy * .6, BLU, 2.5); }
      lb(g, 150, -40, 'electrons fly out', TXT.blue, 17, 'start');
      if (t) lb(g, 0, -175, t);
      return g;
    },
    // "plug3 cx cy size k=uk|india |text"
    plug3: ([cx, cy, S = 300], o, t, p) => {
      const g = G(cx, cy, S / 300, 0, p), uk = o.k !== 'india';
      const col = uk ? { L: '#8a5a2a', N: '#2b6cc4', E: '#5fae3a' } : { L: '#c0392b', N: '#33363b', E: '#5fae3a' };
      part(g, 'M-130 -120 Q-130 -150 -100 -150 L100 -150 Q130 -150 130 -120 L130 90 Q130 130 90 130 L-90 130 Q-130 130 -130 90 Z', '#f6f6f2', DK, 3);
      part(g, R(-40, 130, 80, 60), '#555', DK, 3);
      for (const [x, y, k] of [[0, -100, 'E'], [-70, 20, 'N'], [70, 20, 'L']]) part(g, R(x - 14, y - 22, 28, 44), '#d9b54a', '#8a6a1a', 2.5);
      line(g, 'M0 130 C0 40 0 -40 0 -78', col.E, 7); if (uk) still(g, 'M0 120 C0 40 0 -40 0 -78', '#f3c33b', 3, { 'stroke-dasharray': '10 10' });
      line(g, 'M-20 130 C-40 90 -70 70 -70 42', col.N, 7);
      if (uk) { line(g, 'M20 130 C40 110 60 110 70 96', col.L, 7); part(g, R(56, 46, 28, 50), '#fff', DK, 2.5); lb(g, 100, 78, 'fuse', TXT.red, 16, 'start'); }
      else line(g, 'M20 130 C40 90 70 70 70 42', col.L, 7);
      lb(g, 0, -160, 'earth', TXT.green, 17); lb(g, -140, 26, 'neutral', DK, 17, 'end'); lb(g, 140, 26, 'live', TXT.red, 17, 'start');
      if (t) lb(g, 0, 220, t);
      return g;
    },
    // "motiongraph cx cy width k=dt|vt |text"
    motiongraph: ([cx, cy, W = 420], o, t, p) => {
      const g = G(cx, cy, W / 420, 0, p), vt = o.k === 'vt', x0 = -170, y0 = 120;
      still(g, `M${x0} -130 V${y0} H200`, DK, 3); tip(g, x0, -130, x0, -120, DK, 3); tip(g, 200, y0, 190, y0, DK, 3);
      lb(g, 15, y0 + 32, 'time', DK, 18); lb(g, x0, -140, vt ? 'velocity' : 'distance', DK, 18);
      const L = vt
        ? [[`M${x0} 20 H180`, BLU, 'steady speed', 6], [`M${x0} ${y0} L120 -110`, RED, 'speeding up', -110], [`M${x0} -60 L150 ${y0 - 4}`, GRN, 'slowing down', 105]]
        : [[`M${x0} 60 H180`, '#777', 'at rest', 46], [`M${x0} ${y0} L170 -50`, BLU, 'steady speed', -50], [`M${x0} ${y0} Q60 ${y0} 140 -120`, RED, 'speeding up', -110]];
      for (const [d, c, tx, ly] of L) { line(g, d, c, 3.5); lb(g, 186, ly, tx, c, 16, 'start'); }
      if (t) lb(g, 15, -150, t);
      return g;
    },
  });
})();
