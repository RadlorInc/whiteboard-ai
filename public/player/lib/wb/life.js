// Whiteboard library — life: ecology, evolution and the kingdoms beyond animals and plants (founder, 19 Oct 2026:
// "cover every biology category in one go"). Catalogue: life.txt. Only the biology subject prompt lists these.
// Same layered look as lib/wb/world.js: far parts darker, body with a dark edge, a shadow, a lighter underside,
// details, an eye with a shine, a white highlight.
(() => {
  const F = (g, d, f, ex = {}) => mk('path', { d, fill: f, filter: 'url(#wc)', class: 'fillable', ...ex }, g);
  const P = (g, d, f, ink = '#3a3430', w = 3) => { F(g, d, f); return line(g, d, ink, w); };
  const dot = (g, x, y, c = '#2a2420', w = 7) => line(g, `M${x} ${y} l.01 0`, c, w);
  const E = (x, y, rx, ry = rx) => `M${x - rx} ${y} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
  const smooth = (p, closed = true) => {
    const n = p.length, at = i => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
      d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0]} ${c[1]}`;
    }
    return closed ? d + ' Z' : d;
  };
  const hi = (g, d, w = 3) => line(g, d, '#fff', w, { opacity: .55 });
  const arrow = (g, d, x2, y2, x1, y1, c, w = 3) => { line(g, d, c, w); line(g, head(x2, y2, x1, y1, 11), c, w, { class: 'ink head' }); };
  const pick = (K, k, d, what) => { const f = K[k || d]; if (!f) throw new Error(`Unknown ${what} "${k}" (use ${Object.keys(K).join('|')})`); return f; };
  const list = (t, def) => (t || def).split(',').map(s => s.trim()).filter(Boolean);
  const lab = o => o.lab !== '0';
  const L = (g, x, y, t, c = '#444', s = 17, a = 'middle') => label(g, x, y, t, c, s, a);
  // a drawing in its own unit box: base = default size; may return a caption y for |text
  const make = (base, draw) => ([cx, cy, size = base], o, t, parent) => {
    const outer = mk('g', {}, parent), s = size / base;
    const g = mk('g', { transform: `translate(${cx} ${cy}) rotate(${o.rot || 0}) scale(${o.flip ? -s : s} ${s})` }, outer);
    const by = draw(g, o, t, outer);
    if (t && typeof by === 'number') label(outer, cx, cy + by * s, t, TXT[o.c] || TXT.blue, 24, 'middle');
    return outer;
  };
  const GREEN = '#5fae3a', LEAF = '#24561c', SOIL = '#a87a4e', SOILI = '#5e3b1c';
  const plant = (g, x, y, h) => {                       // a small green plant standing on y
    line(g, `M${x} ${y} Q${x - 4} ${y - h / 2} ${x} ${y - h}`, '#2f7d27', 4);
    for (const [dy, s] of [[.35, -1], [.6, 1], [.82, -1]]) P(g, `M${x} ${y - h * dy} q${s * 26} -18 ${s * 40} -6 q${-s * 18} 14 ${-s * 40} 6 Z`, GREEN, LEAF, 2);
    P(g, E(x, y - h - 6, 9, 11), '#8cc63f', LEAF, 2);
  };
  const shroom = (g, x, y, s = 1, cap = '#c9a06a') => {
    P(g, `M${x - 6 * s} ${y} L${x - 4 * s} ${y - 22 * s} L${x + 4 * s} ${y - 22 * s} L${x + 6 * s} ${y} Z`, '#f3e6c8', '#8a7660', 2);
    P(g, `M${x - 22 * s} ${y - 20 * s} Q${x} ${y - 48 * s} ${x + 22 * s} ${y - 20 * s} Z`, cap, '#6a4a20', 2);
  };

  // ---------- nitrogen cycle ----------
  const nitrogencycle = make(400, (g, o) => {
    const R = '#3a6ea8', ARW = '#2b6cc4';
    F(g, 'M-200 -130 L200 -130 L200 -60 L-200 -60 Z', '#e8f3fc');                                   // air
    if (lab(o)) L(g, 0, -100, 'Nitrogen gas in the air (N₂)', '#1f4f8f', 18);
    P(g, 'M-200 40 L200 40 L200 130 L-200 130 Z', '#d9b88c', SOILI, 2.4);                            // soil
    line(g, 'M-200 40 Q-100 34 0 40 T200 40', '#5a7a3a', 3);
    for (const [x, y] of [[-150, 70], [-120, 100], [-60, 90], [10, 110], [70, 80], [130, 105], [170, 70]]) dot(g, x, y, '#8a5a2b', 5);
    // lightning
    P(g, 'M-176 -66 L-160 -30 L-170 -30 L-150 6 L-176 -24 L-166 -24 L-184 -66 Z', '#ffd84a', '#c97a10', 2);
    // plant with root nodules (bacteria fix nitrogen)
    plant(g, -60, 40, 90);
    line(g, 'M-60 40 L-60 90 M-60 60 L-84 84 M-60 66 L-36 92 M-60 80 L-74 104', '#8a6a3a', 2.4);
    for (const [x, y] of [[-84, 84], [-36, 92], [-74, 104], [-60, 92]]) P(g, E(x, y, 6), '#f4a3a8', '#a03a4a', 1.6);
    // grazing animal
    P(g, 'M40 -6 Q40 -30 70 -30 L118 -30 Q140 -30 140 -6 Q140 14 118 14 L62 14 Q40 14 40 -6 Z', '#f4efe6', '#6a6058', 2.6);
    for (const x of [56, 70, 108, 122]) line(g, `M${x} 14 L${x} 40`, '#6a6058', 5);
    P(g, E(150, -22, 16, 12), '#f4efe6', '#6a6058', 2.4); dot(g, 154, -26, '#222', 5);
    // decomposers in the soil
    shroom(g, 180, 40, .9);
    line(g, 'M100 60 q10 -6 20 0 q10 6 20 0', '#c46a74', 6);
    // arrows: fixing, lightning, absorbed, eaten, decay, back to air
    arrow(g, 'M-120 -60 Q-100 10 -86 78', -86, 78, -96, 40, ARW);
    arrow(g, 'M-158 6 L-150 52', -150, 52, -158, 6, '#c97a10');
    arrow(g, 'M10 96 Q-20 80 -50 82', -50, 82, -30, 80, R);
    arrow(g, 'M-14 -30 Q10 -40 34 -20', 34, -20, 10, -38, '#2f7d27');
    arrow(g, 'M140 18 Q160 26 166 38', 166, 38, 156, 24, SOILI);
    arrow(g, 'M196 76 Q212 0 170 -60', 170, -60, 202, -10, ARW);
    if (lab(o)) {
      L(g, -146, 24, 'lightning', '#c97a10', 14, 'start');
      L(g, -60, 124, 'nodules: fixing bacteria', '#a03a4a', 14); L(g, 40, 124, 'nitrates', SOILI, 14);
      L(g, 10, -46, 'eaten', '#2f7d27', 14); L(g, 140, 124, 'decomposers', SOILI, 14);
      L(g, 196, -70, 'denitrifying bacteria', ARW, 13, 'end');
    }
  });

  // ---------- habitats (backgrounds: draw them first, put animals on them) ----------
  const HABITAT = {
    desert: (g, W, H) => {
      F(g, `M${-W / 2} ${-H / 2} H${W / 2} V${H / 2} H${-W / 2} Z`, '#fdeec8');
      P(g, E(W / 2 - 60, -H / 2 + 50, 26), '#ffd84a', '#e09f00', 2);
      P(g, `M${-W / 2} ${H / 2} L${-W / 2} 20 Q${-W / 4} -20 0 20 Q${W / 4} 50 ${W / 2} 10 L${W / 2} ${H / 2} Z`, '#f2c97a', '#c9952a', 2.4);
      F(g, `M${-W / 2} ${H / 2} L${-W / 2} 60 Q0 30 ${W / 2} 70 L${W / 2} ${H / 2} Z`, '#e6b45a');
      cactusAt(g, -W / 3, 40, .55); cactusAt(g, W / 4, 70, .4);
    },
    ocean: (g, W, H) => {
      F(g, `M${-W / 2} ${-H / 2} H${W / 2} V${H / 2} H${-W / 2} Z`, '#5aa8de');
      F(g, `M${-W / 2} 0 H${W / 2} V${H / 2} H${-W / 2} Z`, '#2f7fc6', { opacity: .6 });
      line(g, `M${-W / 2} ${-H / 2 + 8} q20 -8 40 0` + ' t40 0'.repeat(Math.max(0, Math.ceil(W / 40) - 1)), '#d8eefc', 3);
      P(g, `M${-W / 2} ${H / 2} L${-W / 2} ${H / 2 - 30} Q0 ${H / 2 - 50} ${W / 2} ${H / 2 - 26} L${W / 2} ${H / 2} Z`, '#e8d3a0', '#b59a5a', 2);
      for (const x of [-W / 3, -W / 3 + 26, W / 3]) line(g, `M${x} ${H / 2 - 36} q-12 -30 0 -60 q12 -30 0 -60`, '#2f8a4a', 6);
      for (const [x, y] of [[-40, -20], [-30, -50], [-20, -80]]) line(g, E(x, y, 5), '#d8eefc', 2);
    },
    grassland: (g, W, H) => {
      F(g, `M${-W / 2} ${-H / 2} H${W / 2} V${H / 2} H${-W / 2} Z`, '#dff0fb');
      P(g, `M${-W / 2} ${H / 2} L${-W / 2} 10 Q0 -10 ${W / 2} 16 L${W / 2} ${H / 2} Z`, '#c9d97a', '#7a8a2a', 2.4);
      line(g, `M${W / 4} 10 L${W / 4 + 4} -60 M${W / 4 + 2} -40 L${W / 4 - 30} -66 M${W / 4 + 3} -48 L${W / 4 + 34} -70`, '#6b4a2e', 6);
      P(g, `M${W / 4 - 80} -66 Q${W / 4} -110 ${W / 4 + 80} -66 Q${W / 4} -50 ${W / 4 - 80} -66 Z`, '#5a8f2a', '#2f5a1a', 2.4);
      for (let x = -W / 2 + 20; x < W / 2 - 10; x += 34) line(g, `M${x} ${30 + (x % 3)} q-2 -14 -6 -22 M${x} ${30} q2 -16 6 -24`, '#7a8a2a', 2.4);
    },
    arctic: (g, W, H) => {
      F(g, `M${-W / 2} ${-H / 2} H${W / 2} V${H / 2} H${-W / 2} Z`, '#d6ecfa');
      F(g, `M${-W / 2} 30 H${W / 2} V${H / 2} H${-W / 2} Z`, '#3d78c2');
      P(g, `M${-W / 2} 40 L${-W / 2} -10 Q${-W / 4} -24 ${-20} -6 L0 40 Z`, '#f7fbff', '#7fb7ea', 2.4);
      P(g, `M${W / 6} 50 L${W / 6 + 20} 10 L${W / 2} 6 L${W / 2} 50 Z`, '#f7fbff', '#7fb7ea', 2.4);
      F(g, `M${-W / 2} 30 L${-W / 2} 40 L0 40 L-6 30 Z`, '#a9cdee', { opacity: .7 });
      for (const [x, y] of [[-W / 3, -H / 3], [0, -H / 2.6], [W / 3, -H / 3.4], [W / 6, -H / 4]]) line(g, `M${x - 5} ${y} l10 0 M${x} ${y - 5} l0 10`, '#fff', 2);
    },
    forest: (g, W, H) => {
      F(g, `M${-W / 2} ${-H / 2} H${W / 2} V${H / 2} H${-W / 2} Z`, '#e6f3e0');
      P(g, `M${-W / 2} ${H / 2} L${-W / 2} 40 Q0 30 ${W / 2} 44 L${W / 2} ${H / 2} Z`, '#7a9a4a', '#3f5a1a', 2.4);
      for (const [x, s] of [[-W / 2.6, 1], [-W / 6, .8], [W / 8, 1.1], [W / 2.8, .9]]) {
        P(g, `M${x - 8 * s} 46 L${x - 6 * s} -10 L${x + 6 * s} -10 L${x + 8 * s} 46 Z`, '#8a5a32', '#5e3b1c', 2);
        P(g, `M${x - 46 * s} -6 L${x} ${-120 * s} L${x + 46 * s} -6 Z`, '#3f8a3a', '#1f4a17', 2.4);
        F(g, `M${x} ${-120 * s} L${x + 46 * s} -6 L${x + 10 * s} -6 Z`, '#2f6e2a', { opacity: .6 });
      }
      shroom(g, 0, 50, .7, '#e04b3a');
    },
  };
  const habitat = ([cx, cy, W = 600], o, t, parent) => {
    const g = mk('g', { transform: `translate(${cx} ${cy})` }, parent), H = W * .55;
    pick(HABITAT, o.k, 'grassland', 'habitat')(g, W, H);
    line(g, `M${-W / 2} ${-H / 2} H${W / 2} V${H / 2} H${-W / 2} Z`, '#8a8f96', 2);
    if (t) label(g, -W / 2 + 14, -H / 2 + 28, t, '#1f3a5a', 22, 'start');
    return g;
  };

  // ---------- cactus ----------
  function cactusAt(g, x, y, s = 1) {
    const C = '#6cb848', I = '#2f6a1e';
    P(g, `M${x - 20 * s} ${y} L${x - 20 * s} ${y - 150 * s} Q${x} ${y - 176 * s} ${x + 20 * s} ${y - 150 * s} L${x + 20 * s} ${y} Z`, C, I, 2.6);
    P(g, `M${x - 20 * s} ${y - 70 * s} L${x - 50 * s} ${y - 70 * s} Q${x - 62 * s} ${y - 70 * s} ${x - 62 * s} ${y - 84 * s} L${x - 62 * s} ${y - 120 * s} Q${x - 50 * s} ${y - 134 * s} ${x - 40 * s} ${y - 120 * s} L${x - 40 * s} ${y - 90 * s} L${x - 20 * s} ${y - 90 * s} Z`, C, I, 2.4);
    P(g, `M${x + 20 * s} ${y - 50 * s} L${x + 46 * s} ${y - 50 * s} Q${x + 58 * s} ${y - 50 * s} ${x + 58 * s} ${y - 64 * s} L${x + 58 * s} ${y - 96 * s} Q${x + 46 * s} ${y - 110 * s} ${x + 36 * s} ${y - 96 * s} L${x + 36 * s} ${y - 70 * s} L${x + 20 * s} ${y - 70 * s} Z`, C, I, 2.4);
    for (const dx of [-10, 0, 10]) line(g, `M${x + dx * s} ${y - 4} L${x + dx * s} ${y - 150 * s}`, '#4e9a34', 1.6);
    for (let yy = y - 20 * s; yy > y - 150 * s; yy -= 22 * s) line(g, `M${x - 20 * s} ${yy} l-7 -3 M${x + 20 * s} ${yy} l7 -3`, '#f4efe6', 1.6);
    return s;
  }
  const cactus = make(220, (g, o) => {
    line(g, 'M-110 100 L110 100', '#c9952a', 3);
    cactusAt(g, 0, 100, 1.1);
    P(g, E(0, -94, 12, 8), '#f4a3c0', '#a03a5a', 2);
    if (lab(o)) {
      L(g, 76, -100, 'spines: leaves', '#2f6a1e', 15, 'start'); L(g, 76, -82, 'that lose little water', '#2f6a1e', 15, 'start');
      L(g, 76, 40, 'thick stem', '#2f6a1e', 15, 'start'); L(g, 76, 58, 'stores water', '#2f6a1e', 15, 'start');
    }
    return 124;
  });

  // ---------- fungi ----------
  const FUNGUS = {
    mushroom: g => {
      const ink = '#6a4a20';
      for (const d of ['M0 60 Q-40 80 -90 76', 'M0 60 Q30 86 88 80', 'M-6 60 Q-20 92 -60 100', 'M6 60 Q30 98 70 100'])   // hyphae in the soil
        line(g, d, '#d8c8a8', 2);
      line(g, 'M-110 60 L110 60', '#8a6a3a', 3);
      P(g, 'M-16 60 Q-12 10 -12 -10 L12 -10 Q12 10 16 60 Z', '#f3e6c8', '#8a7660');
      F(g, 'M4 60 Q8 20 8 -10 L12 -10 Q12 10 16 60 Z', '#dccaa4');
      P(g, 'M-80 -8 Q-82 -90 0 -92 Q82 -90 80 -8 Q0 6 -80 -8 Z', '#c98a4a', ink);
      F(g, 'M-76 -14 Q0 -2 76 -14 Q60 -4 0 2 Q-60 -4 -76 -14 Z', '#9a6430');
      for (let x = -64; x <= 64; x += 10) line(g, `M${x} -6 L${x * .8} -12`, '#7a5230', 1.4);       // gills
      hi(g, 'M-56 -60 Q-20 -84 20 -84', 5);
      return 110;
    },
    mould: g => {
      P(g, 'M-90 -70 Q-90 -100 -50 -100 L50 -100 Q90 -100 90 -70 L90 80 L-90 80 Z', '#e9c98a', '#a87a3a');   // bread slice
      F(g, 'M-76 -64 Q-76 -86 -46 -86 L46 -86 Q76 -86 76 -64 L76 68 L-76 68 Z', '#f8ecd0');
      for (const [x, y, r, c] of [[-30, -30, 26, '#6a9a5a'], [30, 20, 32, '#4a7a8a'], [-20, 40, 18, '#7aa86a']]) {
        F(g, E(x, y, r), c, { opacity: .85 });
        for (let a = 0; a < 6.28; a += .5) line(g, `M${x + r * .6 * Math.cos(a)} ${y + r * .6 * Math.sin(a)} l${8 * Math.cos(a)} ${8 * Math.sin(a)}`, '#fff', 1.6);
        dot(g, x, y, '#2a3a2a', 6);
      }
      return 104;
    },
    yeast: g => {
      for (const [x, y, r] of [[-40, 0, 34], [10, -20, 26], [40, 30, 30], [-6, 44, 20]]) {
        P(g, E(x, y, r, r * .85), '#f6e7b8', '#a08a4a', 2.4);
        P(g, E(x - r * .2, y, r * .32), '#e0c47a', '#8a6a2a', 1.6);
        hi(g, `M${x - r * .6} ${y - r * .4} q${r * .3} ${-r * .4} ${r * .7} ${-r * .4}`, 2.4);
      }
      P(g, E(30, -46, 12, 10), '#f6e7b8', '#a08a4a', 2);                                              // a bud
      return 80;
    },
    bracket: g => {
      P(g, 'M-110 -40 L110 -60 L110 60 L-110 80 Z', '#8a5a32', '#5e3b1c');                              // log
      for (const y of [-10, 20, 50]) line(g, `M-100 ${y + 10} Q0 ${y - 4} 100 ${y - 10}`, '#6b4426', 1.8);
      for (const [y, w] of [[-34, 70], [0, 90], [34, 64]]) {
        P(g, `M30 ${y} Q${30 + w} ${y - 30} ${30 + w + 10} ${y} Q${30 + w} ${y + 10} 30 ${y + 8} Z`, '#e0a24a', '#8a5a1a', 2.4);
        line(g, `M40 ${y} Q${30 + w / 2} ${y - 16} ${30 + w} ${y - 4}`, '#f6d48a', 2);
      }
      return 96;
    },
  };
  const fungus = make(220, (g, o) => pick(FUNGUS, o.k, 'mushroom', 'fungus')(g));

  // ---------- Darwin's finches: one bird, four beaks ----------
  const BEAK = {
    seed: ['M54 -40 Q96 -40 96 -22 Q96 -4 56 -10 Z', 'large crushing beak: seeds'],
    insect: ['M56 -34 L104 -28 L56 -20 Z', 'thin pointed beak: insects'],
    probe: ['M56 -32 Q100 -30 132 -16 Q98 -20 56 -22 Z', 'long probing beak: flowers'],
    cactus: ['M56 -36 Q90 -34 108 -24 Q88 -14 56 -16 Z', 'medium beak: cactus'],
  };
  const finch = make(220, (g, o, t) => {
    const ink = '#3a2a1a', c = '#8a6a4a', [beak, what] = pick(BEAK, o.k, 'seed', 'finch beak');
    line(g, 'M-110 70 L100 64', '#7a5230', 6);                                                        // branch
    line(g, 'M-10 40 L-14 66 M10 40 L8 66', ink, 3);
    P(g, smooth([[-90, 10], [-110, 30], [-70, 26]]), '#5a4030', ink, 2.4);                            // tail
    P(g, smooth([[-80, 12], [-40, -36], [20, -50], [60, -30], [50, 20], [0, 42], [-60, 34]]), c, ink);
    F(g, smooth([[-50, 30], [0, 38], [44, 14], [30, 30], [0, 42], [-40, 36]]), '#d8c0a0');
    P(g, smooth([[-60, 0], [-10, -26], [20, -10], [-20, 16]]), '#6a4a30', ink, 2);                    // wing
    for (const x of [-40, -24, -8]) line(g, `M${x} -8 q6 8 4 18`, '#4a3020', 1.6);
    P(g, beak, '#e0b060', '#7a5a20', 2.6);
    P(g, E(36, -32, 6), '#111', '#111', 1); dot(g, 34, -34, '#fff', 3);
    hi(g, 'M-40 -30 Q-10 -48 20 -48');
    if (!t && lab(o)) L(g, 0, 100, what, '#5a4030', 16);
    return 100;
  });

  // ---------- peppered moth on bark ----------
  const pepperedmoth = make(220, (g, o) => {
    const dark = o.k === 'dark', sootBark = o.bark ? o.bark === 'dark' : false;
    P(g, 'M-100 -100 L100 -100 L100 100 L-100 100 Z', sootBark ? '#3a3632' : '#c9c4b8', sootBark ? '#1a1816' : '#7a756a', 2.4);
    for (let i = 0; i < 9; i++) line(g, `M${-90 + i * 22} -100 q${i % 2 ? 6 : -6} 100 0 200`, sootBark ? '#2a2622' : '#a8a296', 2);
    if (!sootBark) for (const [x, y, r] of [[-60, -60, 14], [50, 50, 18], [60, -70, 10], [-50, 60, 12]]) F(g, E(x, y, r), '#b9c8a0', { opacity: .8 });   // lichen
    const w = dark ? '#2e2b28' : '#ece8de', wi = dark ? '#111' : '#5a564e';
    for (const s of [-1, 1]) {
      P(g, `M0 -10 Q${s * 50} -60 ${s * 76} -30 Q${s * 70} 0 0 6 Z`, w, wi, 2);
      P(g, `M0 0 Q${s * 50} 10 ${s * 56} 40 Q${s * 30} 50 0 14 Z`, w, wi, 2);
      if (!dark) for (const [x, y] of [[30, -30], [46, -20], [20, -16], [56, -34], [36, 20], [24, 30]]) dot(g, s * x, y, '#2a2622', 4);
      line(g, `M0 -20 Q${s * 10} -40 ${s * 24} -46`, wi, 1.6);
    }
    P(g, E(0, 0, 7, 26), dark ? '#1a1816' : '#8a8478', wi, 1.6);
    return 124;
  });

  // ---------- evolution tree (cladogram) ----------
  const cladogram = make(500, (g, o, t) => {
    const names = list(t, 'Fish, Amphibians, Reptiles, Birds, Mammals'), n = names.length, C = ['#4a7a8a', '#5fae3a', '#8a9a2a', '#2b6cc4', '#c97a10', '#a03a5a'];
    const W = 460, x0 = -230, top = -100, base = 110, gap = W / Math.max(1, n - 1);
    line(g, `M${x0} ${base} L${x0 + W} ${top}`, '#5a4a3a', 4);                                        // the main stem, oldest at the left
    names.forEach((nm, i) => {
      const tx = x0 + i * gap, along = (i + .5) / n, bx = x0 + W * Math.min(1, along), by = base + (top - base) * Math.min(1, along);
      if (i < n - 1) line(g, `M${bx} ${by} L${tx} ${top}`, C[i % 6], 3.4);
      dot(g, i < n - 1 ? bx : x0 + W, i < n - 1 ? by : top, C[i % 6], 9);
      label(g, tx, top - 16, nm, C[i % 6], 20, 'middle');
    });
    if (lab(o)) { label(g, x0 + 10, base + 30, 'common ancestor', '#5a4a3a', 16, 'start'); label(g, x0 + W, base + 30, 'time →', '#5a4a3a', 16, 'end'); }
  });

  // ---------- protists ----------
  const PROTIST = {
    paramecium: g => {
      const ink = '#2f6a7a';
      const body = smooth([[-100, 0], [-80, -34], [-10, -40], [60, -30], [100, -6], [80, 30], [10, 40], [-70, 32]]);
      for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, x = 104 * Math.cos(a), y = 44 * Math.sin(a); line(g, `M${x * .96} ${y * .9} l${x * .1} ${y * .18}`, ink, 1.4); }   // cilia
      P(g, body, '#cfeef0', ink);
      P(g, 'M-6 -40 Q10 -10 -6 10 Q-20 -6 -6 -40 Z', '#a8d8de', ink, 1.6);                             // oral groove
      P(g, E(20, 6, 22, 14), '#9ab0e0', '#3a4a8a', 2); P(g, E(10, 14, 7), '#6a7ac0', '#3a4a8a', 1.4);   // nuclei
      for (const [x, y] of [[-70, -6], [70, -6]]) { P(g, E(x, y, 10), '#ffffff', ink, 1.6); for (let a = 0; a < 6.28; a += 1.05) line(g, `M${x + 10 * Math.cos(a)} ${y + 10 * Math.sin(a)} l${8 * Math.cos(a)} ${8 * Math.sin(a)}`, ink, 1.2); }   // contractile vacuoles
      for (const [x, y] of [[-40, 14], [-30, -16], [44, -18]]) P(g, E(x, y, 6), '#e0c070', '#8a6a2a', 1.2);   // food vacuoles
      hi(g, 'M-70 -24 Q-20 -36 30 -32');
      return 70;
    },
    euglena: g => {
      const ink = '#2f6a2e';
      line(g, 'M90 -6 Q130 -40 120 -80 Q112 -100 136 -110', '#3a5a2a', 2.4);                            // flagellum
      P(g, smooth([[-100, 10], [-60, -26], [20, -30], [90, -10], [96, 6], [20, 28], [-60, 26]]), '#d8f0b8', ink);
      for (const [x, y] of [[-50, 0], [-20, -12], [-30, 14], [10, 10], [40, -8], [0, -16]]) P(g, E(x, y, 9, 5), '#5fae3a', ink, 1.2);   // chloroplasts
      P(g, E(-10, 2, 12), '#b0c4e0', '#3a4a8a', 1.6);
      P(g, E(76, -8, 5), '#e04b3a', '#8a1f12', 1.2);                                                    // eyespot
      hi(g, 'M-60 -16 Q0 -28 50 -22');
      return 60;
    },
    algae: g => {                                                                                       // Spirogyra: a filament of cells, spiral chloroplasts
      const ink = '#2f6a2e';
      for (let i = 0; i < 4; i++) {
        const x = -110 + i * 56;
        P(g, `M${x} -20 L${x + 56} -20 L${x + 56} 20 L${x} 20 Z`, '#e6f6d8', ink, 2.4);
        line(g, `M${x + 4} -16 Q${x + 18} 16 ${x + 28} -16 Q${x + 40} 16 ${x + 52} -16`, '#3f9a2a', 4);
        dot(g, x + 28, 0, '#7a6a2a', 6);
      }
      hi(g, 'M-104 -14 L106 -14', 2);
      return 50;
    },
  };
  const protist = make(220, (g, o) => pick(PROTIST, o.k, 'paramecium', 'protist')(g));

  // ---------- moss and fern ----------
  const LOWER = {
    moss: g => {
      P(g, 'M-110 80 Q0 60 110 80 L110 100 L-110 100 Z', SOIL, SOILI, 2);
      for (let x = -96; x <= 96; x += 12) { const h = 30 + Math.abs(((x * 7) % 23)); line(g, `M${x} 80 Q${x - 3} ${80 - h / 2} ${x} ${80 - h}`, '#3f8a2a', 4);
        for (let y = 80 - h + 6; y < 76; y += 7) line(g, `M${x} ${y} l-5 -3 M${x} ${y} l5 -3`, '#6cb848', 2); }
      for (const x of [-60, -10, 40, 84]) { line(g, `M${x} 40 Q${x + 4} -10 ${x + 2} -40`, '#9a6a3a', 2); P(g, E(x + 2, -46, 4, 8), '#b07a3a', '#6a4a20', 1.4); }   // spore capsules
      return 120;
    },
    fern: g => {
      line(g, 'M0 100 Q-10 0 30 -100', '#4e7a2a', 4);
      for (let i = 1; i < 12; i++) { const t = i / 12, x = -6 * (1 - t) + 30 * t * t, y = 100 - 200 * t, len = 70 * (1 - t * .7);
        for (const s of [-1, 1]) { P(g, `M${x} ${y} q${s * len * .5} ${-len * .3} ${s * len} ${-len * .1} q${-s * len * .5} ${len * .25} ${-s * len} ${len * .1} Z`, GREEN, LEAF, 1.6);
          if (i % 3 === 1) dot(g, x + s * len * .6, y - len * .1, '#a0522d', 4); } }   // spore dots underneath
      line(g, 'M-50 100 Q-60 60 -40 50 a10 10 0 1 1 -2 14', '#6a9a2a', 3);                              // fiddlehead
      return 120;
    },
  };
  const lowerplant = make(220, (g, o) => pick(LOWER, o.k, 'moss', 'plant')(g));

  // ---------- seed dispersal ----------
  const DISPERSE = {
    dandelion: g => {
      line(g, 'M0 100 Q-6 40 0 -10', '#5a8f2a', 4);
      for (let a = 0; a < 6.28; a += .3) { line(g, `M0 -10 L${50 * Math.cos(a)} ${-10 + 50 * Math.sin(a)}`, '#c8c8c8', 1.2); dot(g, 50 * Math.cos(a), -10 + 50 * Math.sin(a), '#e8e8e8', 7); }
      for (const [x, y] of [[70, -60], [94, -86], [110, -50]]) { line(g, `M${x} ${y} l-8 14`, '#8a7a5a', 1.6); line(g, `M${x - 10} ${y} q10 -10 20 0`, '#c8c8c8', 1.4); }   // seeds blowing away
      P(g, E(0, -10, 8), '#c9a040', '#7a5a20', 1.6);
      return 120;
    },
    burr: g => {
      P(g, E(0, 0, 50), '#a07a3a', '#5e3b1c');
      for (let a = 0; a < 6.28; a += .32) { const x = 50 * Math.cos(a), y = 50 * Math.sin(a); line(g, `M${x} ${y} l${22 * Math.cos(a)} ${22 * Math.sin(a)} q${-6 * Math.sin(a)} ${6 * Math.cos(a)} ${-8 * Math.cos(a)} ${-4 * Math.sin(a)}`, '#5e3b1c', 2); }   // hooks
      hi(g, 'M-30 -26 Q-10 -40 14 -40');
      return 96;
    },
    sycamore: g => {
      for (const s of [-1, 1]) P(g, `M0 30 Q${s * 30} -20 ${s * 90} -80 Q${s * 100} -60 ${s * 70} -30 Q${s * 40} 0 ${s * 10} 40 Z`, '#d8b86a', '#8a6a2a', 2.4);
      for (const s of [-1, 1]) line(g, `M${s * 6} 30 Q${s * 40} -20 ${s * 86} -72`, '#a8884a', 1.4);
      P(g, E(0, 40, 14, 12), '#a07a3a', '#5e3b1c', 2.4);
      line(g, 'M-40 80 a30 12 0 1 0 60 0', '#7fb7ea', 2);                                             // it spins as it falls
      return 110;
    },
    berry: g => {
      line(g, 'M0 -100 Q-10 -50 -20 -10 M-10 -50 Q30 -30 40 0 M-14 -30 Q-50 -10 -50 20', '#5a3a1a', 3);
      P(g, 'M-6 -96 q40 -20 60 6 q-30 16 -60 -6 Z', GREEN, LEAF, 2);
      for (const [x, y] of [[-20, 0], [-6, 14], [-32, 16], [40, 10], [52, 26], [30, 28], [-50, 30], [-60, 44]]) { P(g, E(x, y, 12), '#c0283a', '#6a1020', 2); dot(g, x - 4, y - 4, '#fff', 4); }
      return 80;
    },
  };
  const dispersal = make(220, (g, o) => pick(DISPERSE, o.k, 'dandelion', 'seed')(g));

  Object.assign(window.RECIPES, {
    nitrogencycle: nitrogencycle,
    habitat: habitat,
    cactus: cactus,
    fungus: fungus,
    finch: finch,
    pepperedmoth: pepperedmoth,
    cladogram: cladogram,
    protist: protist,
    lowerplant: lowerplant,
    dispersal: dispersal,
  });
})();
