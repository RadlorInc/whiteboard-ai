// Whiteboard library: carfix — car care and fixes: changing a tire, the oil, under the hood (Car fixes subject)
// Catalogue: carfix.txt. Words a drawing writes itself show by default; lab=0 hides them (the model labels it).
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
  // a road wheel: tyre, rim with five spokes, hub and five lug nuts
  const wheel = (g, x, y, r) => {
    P(g, C(x, y, r), '#3a3f45', DK, 3);
    P(g, C(x, y, r * .6), '#d5dce2', DK, 2.4);
    for (let i = 0; i < 5; i++) { const a = (-90 + i * 72) * Math.PI / 180; line(g, `M${x} ${y} L${(x + r * .52 * Math.cos(a)).toFixed(1)} ${(y + r * .52 * Math.sin(a)).toFixed(1)}`, '#9aa3ad', r * .12); }
    P(g, C(x, y, r * .2), '#9aa3ad', DK, 2);
    for (let i = 0; i < 5; i++) { const a = (-54 + i * 72) * Math.PI / 180; P(g, C(x + r * .32 * Math.cos(a), y + r * .32 * Math.sin(a), r * .05), '#5a626b', DK, 1.4); }
  };
  // a scissor jack from the ground (y0) up to its saddle (y1), screw and crank on the left
  const scissor = (g, x, y0, y1) => {
    const top = y1 + 4, bot = y0 - 10, m = (top + bot) / 2, w = Math.max(26, 66 - (bot - top) * .25);
    P(g, R(x - 48, y0 - 10, 96, 10, 3), '#5a626b', DK, 2.4);
    const arms = `M${x} ${bot} L${x - w} ${m} L${x} ${top} L${x + w} ${m} Z`;
    line(g, arms, DK, 11); line(g, arms, '#e9b100', 6);
    line(g, `M${x - w - 40} ${m} H${x + w + 6}`, '#7a848e', 4);
    line(g, `M${x - w - 40} ${m} l-14 16 h-20`, DK, 4);
    P(g, R(x - 24, y1 - 6, 48, 10, 3), '#5a626b', DK, 2.4);
    for (const [px, py] of [[x, bot], [x - w, m], [x, top], [x + w, m]]) P(g, C(px, py, 4.5), '#9aa3ad', DK, 1.6);
  };
  const drop = (x, y, s = 1) => `M${x} ${y - 10 * s} Q${x + 7 * s} ${y + 2 * s} ${x} ${y + 6 * s} Q${x - 7 * s} ${y + 2 * s} ${x} ${y - 10 * s} Z`;

  // ---------- the car ----------
  const carBody = (g, color) => {
    P(g, 'M-190 18 L-190 -14 Q-188 -30 -170 -32 L-120 -38 L-84 -80 Q-76 -88 -62 -88 L48 -88 Q64 -88 74 -78 L116 -38 L172 -30 Q190 -26 192 -8 L192 18 Q192 28 184 28 L160 28 A42 42 0 0 0 76 28 L-76 28 A42 42 0 0 0 -160 28 L-182 28 Q-190 28 -190 18 Z', color);
    P(g, 'M-112 -40 L-80 -78 Q-76 -82 -68 -82 L-16 -82 L-16 -40 Z', '#bfe3fa', DK, 2.4);
    P(g, 'M-6 -40 L-6 -82 L44 -82 Q58 -82 66 -74 L102 -40 Z', '#bfe3fa', DK, 2.4);
    line(g, 'M-11 -40 V22 M-120 -38 H116', DK, 2.4);
    line(g, 'M-50 -22 h18 M40 -22 h18', DK, 4);
    P(g, E(182, -14, 9, 7), '#ffe38a', DK, 2); P(g, R(-192, -18, 8, 14, 2), '#e04b3a', DK, 2);
  };
  const CAR = {
    side: g => {
      line(g, 'M-205 62 H205', '#9aa3ad', 3);
      carBody(g, '#4f93d6'); wheel(g, -118, 28, 34); wheel(g, 118, 28, 34);
    },
    jacked: g => {
      line(g, 'M-205 62 H205', '#9aa3ad', 3);
      scissor(g, 64, 62, 14);
      const b = mk('g', { transform: 'rotate(-5 -118 62)' }, g);
      carBody(b, '#4f93d6'); wheel(b, -118, 28, 34); wheel(b, 118, 28, 34);
      arrow(g, 'M150 -60 V-98', 150, -98, 150, -60, '#e04b3a', 3);
    },
  };


  const showLab = o => o.lab !== '0' && o.labels !== '0';
  Object.assign(window.RECIPES, {
    // "car cx cy width k=side|jacked" — family car from the side; jacked = front lifted on a scissor jack, wheel off the ground
    car: make(420, (g, o) => pick(CAR, o.k, 'side', 'car')(g)),
    // "lugwrench cx cy length rot=deg" — four-way cross lug wrench with a socket on each arm
    lugwrench: make(300, g => {
      line(g, 'M-140 0 H140 M0 -140 V140', DK, 16); line(g, 'M-140 0 H140 M0 -140 V140', '#9aa3ad', 10);
      for (const [x, y] of [[-140, 0], [140, 0], [0, -140], [0, 140]]) { P(g, C(x, y, 16), '#c9d1d9', DK, 2.4); P(g, poly(x, y, 8, 6), '#5a626b', DK, 1.6); }
      P(g, C(0, 0, 12), '#c9d1d9', DK, 2.4);
    }),
    // "lugorder cx cy size" — tighten lug nuts in a star: five nuts numbered 1-5 with the star path between them
    lugorder: make(260, g => {
      P(g, C(0, 0, 124), '#d5dce2'); P(g, C(0, 0, 18), '#9aa3ad', DK, 2);
      const pt = i => { const a = (-90 + i * 72) * Math.PI / 180; return [92 * Math.cos(a), 92 * Math.sin(a)]; };
      const order = [0, 2, 4, 1, 3, 0];
      for (let i = 0; i < 5; i++) {   // one arrow per move, stopping short of each nut
        const [x1, y1] = pt(order[i]), [x2, y2] = pt(order[i + 1]);
        const sx = x1 + (x2 - x1) * .12, sy = y1 + (y2 - y1) * .12, ex = x1 + (x2 - x1) * .86, ey = y1 + (y2 - y1) * .86;
        arrow(g, `M${sx.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`, ex, ey, sx, sy, '#2b6cc4', 3.4);
      }
      order.slice(0, 5).forEach((p, n) => {
        const [x, y] = pt(p), a = (-90 + p * 72) * Math.PI / 180;
        P(g, poly(x, y, 15, 6), '#5a626b', DK, 2);
        label(g, (x + 34 * Math.cos(a)).toFixed(1), (y + 34 * Math.sin(a) + 10).toFixed(1), String(n + 1), '#c0392b', 30, 'middle');
      });
    }),
    // "warntriangle cx cy size" — red reflective warning triangle on its stand, set behind a stopped car
    warntriangle: make(240, g => {
      line(g, 'M-60 70 L-86 104 M60 70 L86 104', '#3a4450', 5);
      P(g, 'M0 -104 L104 76 L-104 76 Z', '#e04b3a', '#a02a20');
      P(g, 'M0 -50 L58 48 L-58 48 Z', '#fdfdfb', '#a02a20', 2.4);
    }),

    // "enginebay cx cy width" — open hood seen from the front: engine, yellow oil cap and dipstick loop, coolant tank, battery
    enginebay: make(420, g => {
      P(g, 'M-170 -110 L170 -110 L196 -170 L-196 -170 Z', '#4f93d6');
      P(g, 'M-196 -110 L196 -110 L176 110 L-176 110 Z', '#4a5560');
      P(g, R(-92, -82, 184, 140, 10), '#9aa3ad'); P(g, R(-78, -72, 156, 64, 8), '#c9d1d9');
      line(g, 'M-60 -60 V-20 M-30 -60 V-20 M0 -60 V-20 M30 -60 V-20 M60 -60 V-20', '#9aa3ad', 3);
      P(g, C(-46, -40, 16), '#ffd84a', DK, 2.4); P(g, drop(-46, -38, .9), OIL, DK, 1.6);
      line(g, C(56, 30, 13), DK, 9); line(g, C(56, 30, 13), '#f3c33b', 5); line(g, 'M56 43 V60', DK, 4);
      P(g, R(-170, -70, 62, 82, 6), '#3a4450'); P(g, R(-160, -80, 12, 10, 2), '#e04b3a', DK, 2); P(g, R(-130, -80, 12, 10, 2), '#2f3a45', DK, 2);
      P(g, R(112, -70, 52, 74, 10), '#f2f5f7'); P(g, R(114, -30, 48, 30, 0), '#ff9fb6', DK, 1.6); P(g, R(126, -82, 24, 12, 3), '#ffd84a', DK, 2);
      P(g, C(138, 54, 12), '#4f93d6', DK, 2.4);
      P(g, R(-150, 74, 300, 28, 6), '#2f3a45');
      line(g, 'M-120 78 V98 M-80 78 V98 M-40 78 V98 M0 78 V98 M40 78 V98 M80 78 V98 M120 78 V98', '#7a848e', 3);
    }),
    // "dipstick cx cy length level=0-100" — oil dipstick: yellow loop, MIN and MAX holes, oil film up to level (0 = below MIN, 100 = MAX)
    dipstick: make(400, (g, o) => {
      const lv = Math.max(0, Math.min(100, +(o.level ?? 60))) / 100, x = 170 - lv * 62;
      line(g, E(-168, 0, 28, 20), DK, 12); line(g, E(-168, 0, 28, 20), '#f3c33b', 7);
      line(g, 'M-140 0 H184', DK, 8); line(g, 'M-140 0 H184', '#d5dce2', 4);
      line(g, `M${x.toFixed(1)} 0 H184`, OIL, 9);
      line(g, 'M118 -5 l12 10 M130 -5 l12 10 M142 -5 l12 10 M154 -5 l12 10', '#7a848e', 1.6);
      for (const hx of [108, 160]) P(g, C(hx, 0, 5), '#ffffff', DK, 2);
      if (showLab(o)) { label(g, 160, 34, 'MIN', '#c0392b', 18, 'middle'); label(g, 108, 34, 'MAX', '#2c6a22', 18, 'middle'); }
    }),
    // "oildrain cx cy width flow=1" — under the car: drain plug out, old oil pouring into a drain pan; flow=1 runs the oil
    oildrain: make(400, (g, o) => {
      P(g, R(-190, -150, 380, 30, 4), '#4a5560');
      P(g, 'M-150 -120 L150 -120 L128 -52 L-128 -52 Z', '#5a626b');
      P(g, R(30, -56, 20, 8, 2), '#3a3f45', DK, 2);
      const s = line(g, 'M40 -48 Q46 0 24 44', OIL, 9, { 'stroke-dasharray': '16 6' });
      if (+o.flow) mk('animate', { attributeName: 'stroke-dashoffset', from: 0, to: -44, dur: '0.8s', repeatCount: 'indefinite' }, s);
      P(g, 'M-112 40 L112 40 L96 104 L-96 104 Z', '#e8ecef');
      P(g, E(0, 46, 106, 9), '#8a5a14', DK, 2);
      line(g, 'M-200 108 H200', '#9aa3ad', 3);
      P(g, poly(150, 92, 12, 6), '#9aa3ad', DK, 2); P(g, R(162, 88, 18, 8, 2), '#9aa3ad', DK, 2);
    }),
    // "oilfilter cx cy height" — spin-on oil filter: blue can with grip ridges, base plate and rubber gasket
    oilfilter: make(260, g => {
      P(g, R(-70, -96, 140, 176, 14), '#2b6cc4');
      line(g, 'M-56 -92 V-46 M-42 -92 V-46 M-28 -92 V-46 M-14 -92 V-46 M0 -92 V-46 M14 -92 V-46 M28 -92 V-46 M42 -92 V-46 M56 -92 V-46', '#1a3a6a', 2.4);
      P(g, R(-70, -22, 140, 44), '#ffffff', DK, 2.4); label(g, 0, 8, 'OIL FILTER', DK, 20, 'middle');
      P(g, R(-78, 80, 156, 14, 4), '#9aa3ad'); line(g, 'M-58 100 H58', '#2a2a2a', 5);
    }),
    // "oilbottle cx cy height" — jug of motor oil with handle, cap and grade label
    oilbottle: make(260, g => {
      P(g, 'M-60 -40 Q-106 -40 -106 8 Q-106 58 -60 58 L-60 40 Q-88 40 -88 8 Q-88 -22 -60 -22 Z', '#ffd84a');
      P(g, 'M-60 100 L-60 -40 Q-60 -62 -38 -64 L8 -64 L8 -88 L46 -88 L46 -64 Q72 -60 72 -32 L72 100 Q72 112 60 112 L-48 112 Q-60 112 -60 100 Z', '#ffd84a');
      P(g, R(2, -112, 50, 26, 5), '#2f3a45');
      P(g, R(-42, -6, 100, 70, 8), '#2f3a45'); label(g, 8, 24, 'OIL', '#ffffff', 26, 'middle'); label(g, 8, 52, '5W-30', '#ffd84a', 18, 'middle');
      line(g, 'M60 -36 V96', '#c98a1a', 4, { opacity: .7 });
    }),

    // "jumpstart cx cy width" — jump-starting: dead and good batteries, red and black cables, clamps numbered in the order they go on (1-4)
    jumpstart: make(460, (g, o) => {
      for (const [bx, name, f] of [[-120, 'DEAD', '#5a626b'], [120, 'GOOD', '#3a4450']]) {
        P(g, R(bx - 72, -40, 144, 92, 8), f);
        P(g, R(bx - 52, -58, 22, 18, 3), '#e04b3a', DK, 2); P(g, R(bx + 30, -58, 22, 18, 3), '#2f3a45', DK, 2);
        label(g, bx - 41, -66, '+', '#c0392b', 24, 'middle'); label(g, bx + 41, -66, '−', DK, 24, 'middle');
        if (showLab(o)) label(g, bx, 24, name, '#ffffff', 22, 'middle');
      }
      P(g, poly(-10, 104, 12, 6), '#c9d1d9', DK, 2); if (showLab(o)) label(g, -10, 140, 'bare metal', '#7a848e', 16, 'middle');
      line(g, 'M-161 -60 Q-40 -170 79 -60', DK, 9); line(g, 'M-161 -60 Q-40 -170 79 -60', '#e04b3a', 5);
      line(g, 'M161 -60 Q236 -40 214 60 Q190 118 -4 98', DK, 9); line(g, 'M161 -60 Q236 -40 214 60 Q190 118 -4 98', '#3a3f45', 5);
      for (const [x, y, n, c] of [[-161, -60, 1, '#c0392b'], [79, -60, 2, '#c0392b'], [161, -60, 3, DK], [-4, 98, 4, DK]]) {
        P(g, R(x - 9, y - 12, 18, 16, 3), c === DK ? '#3a3f45' : '#e04b3a', DK, 2);
        P(g, C(x + (n === 4 ? -30 : 0), y - (n === 4 ? -4 : 34), 15), '#ffffff', c, 2.4);
        label(g, x + (n === 4 ? -30 : 0), y - (n === 4 ? -4 : 34) + 8, String(n), c, 22, 'middle');
      }
    }),
    // "treaddepth cx cy width k=good|worn" — tire tread in cross-section with a depth gauge in a groove; worn = tread down to the wear bar
    treaddepth: make(400, (g, o) => {
      const worn = o.k === 'worn', h = worn ? 22 : 64;
      P(g, R(-180, 20, 360, 60, 6), '#3a3f45');
      for (let i = 0; i < 5; i++) P(g, R(-176 + i * 74, 20 - h, 52, h + 4, 4), '#4a5058');
      for (let i = 0; i < 4; i++) P(g, R(-124 + i * 74, 2, 22, 18, 2), '#7a848e', DK, 1.6);
      if (showLab(o)) label(g, -113, 50, 'wear bar', '#c9d1d9', 15, 'middle');
      P(g, R(30, 20 - h - 90, 16, 90 + h - 2, 3), '#c9d1d9', DK, 2); P(g, R(10, 20 - h - 120, 56, 34, 5), '#ffd84a');
      label(g, 38, 20 - h - 96, worn ? '2/32"' : '8/32"', DK, 18, 'middle');
    }),
    // "wiper cx cy width" — windshield wiper on the glass: arm from its pivot, blade with its rubber edge, the release tab
    wiper: make(420, g => {
      P(g, 'M-200 100 Q0 70 200 100 L170 -110 Q0 -136 -170 -110 Z', '#bfe3fa', '#5a626b');
      line(g, 'M140 90 L-60 -40', DK, 10); line(g, 'M140 90 L-60 -40', '#3a3f45', 6);
      P(g, C(140, 90, 12), '#3a3f45', DK, 2);
      line(g, 'M10 6 L-150 -98', DK, 9); line(g, 'M10 6 L-150 -98', '#5a626b', 5); line(g, 'M14 14 L-148 -90', '#1a1a1a', 3);
      P(g, R(-72, -50, 22, 14, 3), '#e04b3a', DK, 2);
    }),
    // "dashlight cx cy size k=engine|oil|battery|temp|brake|tpms" — a dashboard warning light: check engine and tire pressure (amber), oil, battery, coolant temperature, brake (red)
    dashlight: make(220, (g, o) => {
      const k = o.k || 'engine', amber = '#f4a531', red = '#e04b3a';
      P(g, R(-100, -100, 200, 200, 26), '#2a3138');
      const S = {
        engine: () => P(g, 'M-60 -10 L-60 30 L-40 30 L-40 44 L30 44 L44 30 L60 30 L60 -24 L40 -24 L40 -40 L-10 -40 L-10 -50 L10 -50 M-34 -40 L-34 -10 Z', null, amber, 7),
        oil: () => { line(g, 'M-70 10 L-40 -6 L30 -6 L60 -30 L64 -24 L34 20 L-40 20 Z M-40 -6 V-26 M-56 -26 H-24', red, 7); P(g, drop(70, 30, 1.3), red, red, 2); },
        battery: () => { line(g, 'M-64 -36 H64 V44 H-64 Z M-44 -50 V-36 M44 -50 V-36', red, 7); line(g, 'M-40 4 H-16 M-28 -8 V16 M16 4 H40', red, 6); },
        temp: () => { line(g, 'M0 -60 V20 M0 -40 H20 M0 -20 H20 M0 0 H20', red, 7); P(g, C(0, 30, 12), red, red, 2); line(g, 'M-70 60 q17 -12 35 0 t35 0 t35 0 t35 0', red, 6); },
        brake: () => { line(g, C(0, 0, 48), red, 7); line(g, 'M-66 -40 Q-84 0 -66 40 M66 -40 Q84 0 66 40', red, 7); line(g, 'M0 -26 V8', red, 8); P(g, C(0, 24, 5), red, red, 2); },
        tpms: () => { line(g, 'M-56 44 Q-70 0 -50 -40 Q0 -60 50 -40 Q70 0 56 44 M-70 44 H70 M-40 44 V56 M-14 44 V56 M14 44 V56 M40 44 V56', amber, 7); line(g, 'M0 -26 V8', amber, 8); P(g, C(0, 24, 5), amber, amber, 2); },
      };
      pick(S, k, 'engine', 'dashlight')();
    }),

    // "airfilter cx cy width k=clean|dirty" — engine air filter: pleated panel in its frame; dirty = grey with dust
    airfilter: make(360, (g, o) => {
      const dirty = o.k === 'dirty';
      P(g, R(-160, -90, 320, 180, 12), '#2f3a45');
      P(g, R(-140, -70, 280, 140, 4), dirty ? '#a59a86' : '#f4e3b0', DK, 2);
      for (let x = -130; x <= 130; x += 20) line(g, `M${x} -70 V70`, dirty ? '#7a7062' : '#d9c48a', 3);
      if (dirty) for (const [x, y] of [[-90, -30], [-30, 20], [40, -40], [100, 30], [0, -10]]) P(g, E(x, y, 22, 12), '#8a8070', null);
    }),
    // "fusebox cx cy width blown=N" — open fuse box: rows of coloured blade fuses with amp numbers, puller tool; blown=N (1-12) marks a broken fuse
    fusebox: make(380, (g, o) => {
      const blown = +o.blown || 0, cols = ['#e04b3a', '#4f93d6', '#ffd84a', '#5fae3a', '#e8ecef', '#f4a531'], amps = [10, 15, 20, 30, 25, 5];
      P(g, R(-170, -110, 300, 220, 12), '#2f3a45'); P(g, R(-156, -96, 272, 192, 6), '#4a5560');
      for (let i = 0; i < 12; i++) {
        const x = -134 + (i % 6) * 44, y = i < 6 ? -40 : 44, c = cols[i % 6];
        P(g, R(x, y - 34, 30, 40, 4), c, DK, 2); line(g, `M${x + 8} ${y + 6} v14 M${x + 22} ${y + 6} v14`, '#c9d1d9', 4);
        label(g, x + 15, y - 6, String(amps[i % 6]), DK, 14, 'middle');
        if (i + 1 === blown) line(g, `M${x + 4} ${y - 28} L${x + 26} ${y}`, '#1a1a1a', 4);
      }
      P(g, R(146, -60, 26, 110, 6), '#ffffff'); line(g, 'M150 50 v14 M168 50 v14', DK, 4);
    }),
    // "gearstick cx cy size k=manual|auto" — manual: H gear pattern (1-5, R) on the knob and the clutch, brake and gas pedals; auto: P R N D lever
    gearstick: make(400, (g, o) => {
      if (o.k === 'auto') {
        P(g, R(-90, -120, 180, 240, 18), '#3a3f45'); P(g, R(-12, -100, 24, 200, 10), '#1f252b');
        ['P', 'R', 'N', 'D'].forEach((t, i) => label(g, 50, -64 + i * 46, t, i === 3 ? '#ffd84a' : '#e8ecef', 30, 'middle'));
        P(g, R(-30, 54, 60, 40, 10), '#7a848e', DK, 2); return;
      }
      P(g, C(-90, -40, 70), '#3a3f45');
      line(g, 'M-130 -70 V-10 M-90 -70 V-10 M-50 -70 V-10 M-130 -40 H-50', '#e8ecef', 4);
      [['1', -130, -80], ['2', -130, 14], ['3', -90, -80], ['4', -90, 14], ['5', -50, -80], ['R', -50, 14]].forEach(([t, x, y]) => label(g, x, y + 4, t, '#ffffff', 18, 'middle'));
      line(g, 'M-90 30 V120', DK, 10);
      [['clutch', 40, '#9aa3ad'], ['brake', 110, '#9aa3ad'], ['gas', 170, '#9aa3ad']].forEach(([t, x, c], i) => {
        line(g, `M${x} -60 L${x} ${i === 2 ? 60 : 40}`, DK, 6); P(g, R(x - (i === 2 ? 14 : 24), i === 2 ? 40 : 30, i === 2 ? 28 : 48, i === 2 ? 70 : 34, 6), c);
        if (showLab(o)) label(g, x, 140, t, DK, 18, 'middle'); });
    }),
    // "muffler cx cy width" — exhaust under the car: pipe from the engine, catalytic converter, muffler and tailpipe, smoke out the back
    muffler: make(460, (g, o) => {
      line(g, 'M-220 -30 Q-190 -30 -170 0 H220', DK, 16); line(g, 'M-220 -30 Q-190 -30 -170 0 H220', '#9aa3ad', 10);
      P(g, R(-130, -24, 90, 48, 22), '#c9d1d9'); if (showLab(o)) label(g, -85, 50, 'catalytic converter', DK, 14, 'middle');
      P(g, R(20, -38, 150, 76, 30), '#9aa3ad'); if (showLab(o)) label(g, 95, 62, 'muffler', DK, 16, 'middle');
      for (const [x, y, r] of [[236, -6, 10], [252, -20, 14], [270, -36, 18]]) P(g, C(x, y, r), '#e8ecef', '#9aa3ad', 2);
      if (showLab(o)) label(g, -220, -48, 'engine', DK, 16, 'middle');
    }),
  });
})();
