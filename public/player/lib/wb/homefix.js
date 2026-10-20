// Whiteboard library: homefix — home fixes and how-to: plumbing, the breaker, walls, tying a tie (Home fixes subject)
// Catalogue: homefix.txt. Words a drawing writes itself show by default; lab=0 hides them (the model labels it).
// Child-safe: no brands, no logos, no real people.
(() => {
  const DK = '#2f3a45';
  const P = (g, d, fill, ink = DK, w = 3) => { if (fill) mk('path', { d, fill, filter: 'url(#wc)', class: 'fillable' }, g); return line(g, d, ink, w); };
  const R = (x, y, w, h, r = 0) => r
    ? `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`
    : `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
  const E = (x, y, rx, ry = rx) => `M${x + rx} ${y} A${rx} ${ry} 0 1 0 ${x - rx} ${y} A${rx} ${ry} 0 1 0 ${x + rx} ${y} Z`;
  const C = (x, y, r) => E(x, y, r);
  const poly = (x, y, r, n, a0 = -90) => 'M' + Array.from({ length: n }, (_, i) => { const a = (a0 + i * 360 / n) * Math.PI / 180; return `${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' L') + ' Z';
  const pick = (K, k, d, what) => { const f = K[k || d]; if (!f) throw new Error(`Unknown ${what} "${k}" (use ${Object.keys(K).join('|')})`); return f; };
  const arrow = (g, d, x2, y2, ax, ay, c = '#2b6cc4', w = 3) => { line(g, d, c, w); line(g, head(x2, y2, ax, ay, 12), c, w); };
  // a drawing in its own unit box: base = default size; cx cy is its centre
  const make = (base, draw) => ([cx, cy, size = base], o, t, parent) => {
    const s = size / base, g = mk('g', { transform: `translate(${cx} ${cy}) rotate(${o.rot || 0}) scale(${s})` }, parent);
    draw(g, o, t); return g;
  };
  const OIL = '#c98a1a';
  // a strip (tie end, pipe…) from (x1,y1) width w1 to (x2,y2) width w2, with a pointed tip when tip=1
  const strip = (x1, y1, x2, y2, w1, w2, tip = 1) => {
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a), f = n => n.toFixed(1);
    const p1 = [x1 + nx * w1 / 2, y1 + ny * w1 / 2], p2 = [x2 + nx * w2 / 2, y2 + ny * w2 / 2], p3 = [x2 - nx * w2 / 2, y2 - ny * w2 / 2], p4 = [x1 - nx * w1 / 2, y1 - ny * w1 / 2];
    const tipP = [x2 + Math.cos(a) * w2 * .55, y2 + Math.sin(a) * w2 * .55];
    return `M${f(p1[0])} ${f(p1[1])} L${f(p2[0])} ${f(p2[1])}${tip ? ` L${f(tipP[0])} ${f(tipP[1])}` : ''} L${f(p3[0])} ${f(p3[1])} L${f(p4[0])} ${f(p4[1])} Z`;
  };
  const drop = (x, y, s = 1) => `M${x} ${y - 10 * s} Q${x + 7 * s} ${y + 2 * s} ${x} ${y + 6 * s} Q${x - 7 * s} ${y + 2 * s} ${x} ${y - 10 * s} Z`;

  const showLab = o => o.lab !== '0' && o.labels !== '0';
  Object.assign(window.RECIPES, {
    // "tieknot cx cy height k=1|2|3|4" — tying a tie (four-in-hand), step 1 cross, 2 wrap around, 3 up through the neck loop, 4 down through the knot
    tieknot: make(320, (g, o) => {
      const k = String(o.k || '1'), W = '#2b6cc4', N = '#7fb7ea';
      if (!['1', '2', '3', '4'].includes(k)) throw new Error(`Unknown step "${k}" (use 1|2|3|4)`);
      line(g, 'M-34 -116 Q0 -100 34 -116', W, 10);
      if (k === '1') {
        P(g, strip(24, -104, 14, 40, 16, 20), N);
        P(g, strip(-24, -104, 66, 104, 20, 46), W);
        arrow(g, 'M-70 60 Q-20 120 40 140', 40, 140, -20, 120);
      } else if (k === '2') {
        P(g, strip(-24, -104, 4, -40, 20, 30, 0), W);
        P(g, strip(4, -40, -84, 64, 30, 46), W);
        P(g, strip(24, -104, 14, 60, 16, 20), N);
        arrow(g, 'M70 -10 Q30 40 -40 0', -40, 0, 0, 30);
      } else if (k === '3') {
        P(g, strip(24, -104, 14, 60, 16, 20), N);
        P(g, strip(-24, -104, 2, -40, 20, 30, 0), W);
        P(g, strip(2, -40, 0, -150, 30, 44), W);
        arrow(g, 'M64 30 Q76 -60 40 -130', 40, -130, 66, -70);
      } else {
        P(g, strip(0, -64, 0, 120, 26, 54), W);
        line(g, 'M0 -50 Q4 -30 0 -14', '#1a3a6a', 2.4);
        P(g, 'M-20 -98 L20 -98 L13 -64 L-13 -64 Z', W);
      }
      P(g, 'M-84 -136 L-12 -98 L-34 -58 Z', '#f2f5f7'); P(g, 'M84 -136 L12 -98 L34 -58 Z', '#f2f5f7');
      if (showLab(o)) label(g, -128, -110, k, '#c0392b', 34, 'middle');
    }),
    // "breaker cx cy height trip=N" — home breaker panel: main switch and ten breakers; trip=N (1-10) shows that one tripped in red
    breaker: make(320, (g, o) => {
      const trip = +o.trip || 0;
      P(g, R(-100, -150, 200, 300, 10), '#c9d1d9'); P(g, R(-82, -132, 164, 264, 6), '#eef1f4');
      P(g, R(-44, -122, 88, 34, 5), '#3a4450'); P(g, R(-30, -114, 34, 18, 3), '#9aa3ad', DK, 2);
      for (let i = 0; i < 10; i++) {
        const x = i < 5 ? -40 : 40, y = -66 + (i % 5) * 44, tripped = i + 1 === trip;
        P(g, R(x - 30, y - 14, 60, 28, 4), '#2f3a45');
        P(g, R(tripped ? x - 8 : x + 4, y - 9, 16, 18, 3), tripped ? '#e04b3a' : '#9aa3ad', DK, 1.6);
        label(g, x + (i < 5 ? -38 : 38), y + 7, String(i + 1), '#7a848e', 15, 'middle');
      }
    }),
    // "ptrap cx cy width leak=1" — under-sink drain: tailpipe, U-bend holding water, slip nuts, pipe into the wall; leak=1 drips into a bucket
    ptrap: make(380, (g, o) => {
      P(g, 'M-180 -160 L180 -160 L160 -116 L-160 -116 Z', '#e8ecef');
      P(g, R(150, -80, 30, 200), '#d9c7a8', '#7a5a3a');
      const pipe = 'M-40 -116 V0 Q-40 64 10 64 Q60 64 60 0 V-30 H150';
      line(g, pipe, DK, 30); line(g, pipe, '#f2f5f7', 22);
      line(g, 'M-40 12 Q-40 54 10 54 Q60 54 60 12', '#7fb7ea', 10);
      P(g, R(-58, -74, 36, 18, 4), '#c9d1d9', DK, 2.4); P(g, R(42, -14, 36, 18, 4), '#c9d1d9', DK, 2.4);
      if (+o.leak) {
        for (const [y, s] of [[-40, 1], [-6, .9], [26, .8]]) P(g, drop(-62, y, s), '#4f93d6', '#2b6cc4', 2);
        P(g, 'M-104 88 L-20 88 L-28 140 L-96 140 Z', '#ffd84a'); P(g, E(-62, 92, 40, 6), '#7fb7ea', DK, 2);
      }
    }),
    // "toilettank cx cy height k=ok|running" — toilet tank cut open: fill valve and float, overflow tube, flapper on its chain to the handle; running = flapper not sealing, water leaking past
    toilettank: make(340, (g, o) => {
      const run = o.k === 'running';
      P(g, R(-130, -150, 260, 270, 10), '#f2f5f7');
      P(g, R(-118, -50, 236, 158, 4), '#bfe3fa', '#7fb7ea', 2);
      P(g, R(-96, -40, 18, 148, 3), '#9aa3ad', DK, 2); P(g, R(-104, -30, 34, 40, 6), '#5a626b', DK, 2); P(g, R(-100, -76, 26, 28, 4), '#c9d1d9', DK, 2);
      P(g, R(48, -60, 18, 150, 3), '#c9d1d9', DK, 2);
      P(g, R(-30, 96, 80, 14, 4), '#9aa3ad', DK, 2);
      P(g, run ? 'M-24 86 Q10 64 44 74 L44 84 Q10 76 -24 96 Z' : 'M-26 92 Q10 82 46 92 L46 98 Q10 90 -26 98 Z', '#e04b3a', '#a02a20', 2.4);
      line(g, `M10 ${run ? 72 : 84} L-36 -110`, '#7a848e', 2.4, { 'stroke-dasharray': '4 3' });
      line(g, 'M-150 -116 L-40 -116', DK, 8); P(g, R(-176, -130, 28, 28, 6), '#c9d1d9');
      if (run) for (const x of [-6, 14, 34]) line(g, `M${x} 100 v22`, '#2b6cc4', 3, { 'stroke-dasharray': '6 4' });
    }),
    // "studfinder cx cy width scan=1" — electronic stud finder: yellow body, LED row lit green over a stud; scan=1 slides it along the wall (arrow)
    studfinder: make(240, (g, o) => {
      P(g, R(-100, -60, 200, 120, 34), '#ffd84a');
      P(g, R(-70, -36, 140, 34, 8), '#2f3a45');
      for (const x of [-48, -24, 0, 24, 48]) P(g, C(x, -19, 7), Math.abs(x) < 30 ? '#5fae3a' : '#3a4450', DK, 1.6);
      P(g, R(-26, 14, 52, 26, 8), '#e8ecef', DK, 2); line(g, 'M0 -60 V-76 M-6 -70 L0 -78 L6 -70', '#e04b3a', 3);
      if (+o.scan) arrow(g, 'M-90 84 H40', 40, 84, -90, 84, '#2b6cc4', 3);
    }),
    // "paintroller cx cy width" — paint roller loaded with paint, and the tray with paint in its well
    paintroller: make(420, g => {
      P(g, 'M-200 90 L-40 30 L60 30 L60 110 L-200 110 Z', '#c9d1d9'); P(g, 'M-170 104 L-60 60 L50 60 L50 104 Z', '#7fb7ea', null);
      P(g, R(-40, -150, 200, 56, 26), '#7fb7ea'); line(g, 'M-30 -122 H150', '#5a93c8', 2);
      line(g, 'M160 -122 H190 V-60 H60 V60', DK, 8); line(g, 'M160 -122 H190 V-60 H60 V60', '#9aa3ad', 4);
      P(g, R(48, 50, 24, 70, 10), '#e04b3a');
    }),
    // "furnacefilter cx cy width k=clean|dirty" — furnace air filter: pleated card frame with the airflow arrow; dirty = grey with dust
    furnacefilter: make(380, (g, o) => {
      const dirty = o.k === 'dirty';
      P(g, R(-160, -110, 320, 220, 4), '#c9b896'); P(g, R(-142, -92, 284, 184, 2), dirty ? '#9a9488' : '#ffffff', DK, 2);
      for (let x = -130; x <= 130; x += 18) line(g, `M${x} -92 L${x + 9} 92`, dirty ? '#7a7468' : '#d5dce2', 2);
      P(g, R(-60, -30, 120, 60, 6), '#ffffff', DK, 2); label(g, 0, 8, 'AIR FLOW', DK, 18, 'middle'); arrow(g, 'M-40 44 H40', 40, 44, -40, 44, DK, 3);
    }),
    // "caulkgun cx cy width" — caulk gun with its tube, trigger and plunger rod, a bead of caulk along a seam
    caulkgun: make(440, g => {
      P(g, R(-120, -30, 210, 46, 6), '#ffffff'); P(g, 'M90 -22 L170 -10 L170 2 L90 8 Z', '#ffffff'); P(g, R(-128, -36, 12, 58, 3), '#e04b3a', DK, 2);
      line(g, 'M-200 -8 H-128', '#9aa3ad', 6); line(g, 'M-210 -20 V4', DK, 6);
      P(g, 'M-150 16 L-130 16 L-120 100 L-140 100 Z', '#e04b3a'); P(g, 'M-110 16 L-96 16 L-80 80 L-96 84 Z', '#3a3f45');
      line(g, 'M-160 140 H200', '#c9b896', 6); line(g, 'M60 132 Q120 126 180 132', '#ffffff', 8); line(g, 'M60 132 Q120 126 180 132', '#9aa3ad', 1.4);
    }),
    // "drywall cx cy width k=hole|patch" — a hole in drywall; patch = mesh patch over it with joint compound spread by a putty knife
    drywall: make(400, (g, o) => {
      P(g, R(-190, -130, 380, 260, 2), '#f2efe8', '#c9c2b0');
      if (o.k === 'patch') {
        P(g, R(-60, -50, 120, 100, 4), '#f7f4ec', '#c9c2b0', 2);
        for (let i = -50; i <= 50; i += 12) line(g, `M${i} -44 V44 M-54 ${i * .8} H54`, '#d9d2bf', 1.4);
        P(g, E(0, 0, 90, 70), '#ffffff', null);
        P(g, 'M80 -40 L170 -100 L190 -76 L104 -10 Z', '#c9d1d9'); P(g, R(166, -122, 50, 30, 6), '#3a3f45');
      } else { P(g, 'M-40 -30 L-10 -46 L30 -36 L46 0 L30 34 L-6 42 L-38 26 L-50 -4 Z', '#4a4038', '#7a6a58', 2.4); }
    }),
  });
})();
