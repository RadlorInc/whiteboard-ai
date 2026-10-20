// Whiteboard library: homefix — home fixes and everyday how-to: plumbing, electrics, tools, tying a tie
// (the Car fixes / Home fixes chat subjects, 20 Oct 2026). Catalogue: homefix.txt.
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

  Object.assign(window.RECIPES, {
    // ---------- home and everyday ----------
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
      label(g, -128, -110, k, '#c0392b', 34, 'middle');
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
    // "smokealarm cx cy size k=ok|beep" — ceiling smoke alarm; ok has a green light, beep has a red light and chirp waves (low battery)
    smokealarm: make(260, (g, o) => {
      const beep = o.k === 'beep';
      line(g, 'M-130 -96 H130', '#9aa3ad', 4);
      P(g, 'M-104 -92 L104 -92 L96 -64 L-96 -64 Z', '#e8ecef');
      P(g, E(0, -62, 96, 20), '#ffffff');
      line(g, 'M-50 -62 h30 M-10 -62 h20 M20 -62 h30', '#9aa3ad', 3);
      P(g, C(56, -60, 6), beep ? '#e04b3a' : '#5fae3a', DK, 2);
      if (beep) for (const r of [30, 52, 74]) line(g, `M${-r} -30 A${r} ${r * .6} 0 0 0 ${r} -30`, '#e04b3a', 3);
    }),
    // "handtool cx cy length k=hammer|screwdriver|wrench|pliers rot=deg" — a hand tool for home fixes
    handtool: make(300, (g, o) => pick({
      hammer: g => {
        P(g, R(-12, -40, 24, 170, 8), '#c9925a', '#7a4a20');
        P(g, R(-15, 76, 30, 62, 10), '#e04b3a');
        P(g, 'M-92 -84 L36 -84 Q74 -96 98 -60 Q72 -66 36 -46 L-92 -46 Z', '#9aa3ad');
      },
      screwdriver: g => {
        P(g, R(-6, -140, 12, 160), '#c9d1d9'); P(g, 'M-6 -140 L6 -140 L3 -156 L-3 -156 Z', '#9aa3ad', DK, 2);
        P(g, R(-12, 16, 24, 22, 3), '#9aa3ad');
        P(g, R(-24, 36, 48, 112, 16), '#e04b3a'); line(g, 'M-10 52 V132 M0 52 V132 M10 52 V132', '#a02a20', 2.4);
      },
      wrench: g => {
        P(g, R(-12, -86, 24, 176, 8), '#c9d1d9');
        P(g, 'M-32 -86 Q-44 -128 -16 -150 L-10 -116 L10 -116 L16 -150 Q44 -128 32 -86 Z', '#c9d1d9');
        P(g, C(0, 110, 32), '#c9d1d9'); P(g, poly(0, 110, 15, 6), '#ffffff', DK, 2.4);
      },
      pliers: g => {
        P(g, 'M-6 -20 L-14 -150 L-2 -150 L8 -20 Z', '#9aa3ad'); P(g, 'M6 -20 L14 -150 L2 -150 L-8 -20 Z', '#9aa3ad');
        P(g, 'M-6 -4 Q-30 60 -52 146 L-34 150 Q-12 70 8 6 Z', '#e04b3a'); P(g, 'M6 -4 Q30 60 52 146 L34 150 Q12 70 -8 6 Z', '#e04b3a');
        P(g, C(0, -14, 12), '#c9d1d9', DK, 2.4);
      },
    }, o.k, 'hammer', 'handtool')(g)),

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
    // "plunger cx cy height k=sink|toilet" — cup plunger sealed over a clogged drain, push-pull arrows
    plunger: make(320, (g, o) => {
      if (o.k === 'toilet') { P(g, 'M-120 -20 Q-120 120 0 130 Q120 120 120 -20 Z', '#ffffff'); P(g, E(0, -20, 120, 26), '#f2f5f7'); P(g, E(0, -14, 90, 16), '#bfe3fa', '#7fb7ea', 2); }
      else { P(g, 'M-150 -20 L150 -20 L120 70 L-120 70 Z', '#e8ecef'); P(g, E(0, -6, 120, 14), '#bfe3fa', '#7fb7ea', 2); P(g, E(0, 62, 18, 5), '#3a3f45', DK, 2); }
      P(g, R(-8, -170, 16, 150, 4), '#c9925a', '#7a4a20');
      P(g, 'M-50 -10 Q-50 -44 0 -44 Q50 -44 50 -10 L40 4 L-40 4 Z', '#e04b3a');
      arrow(g, 'M80 -150 V-90', 80, -90, 80, -150, '#2b6cc4', 4); arrow(g, 'M104 -90 V-150', 104, -150, 104, -90, '#2b6cc4', 4);
    }),
    // "outlet cx cy height k=standard|gfci" — US wall outlet: two plug faces (hot, neutral, ground holes), or a GFCI with TEST and RESET buttons
    outlet: make(280, (g, o) => {
      P(g, R(-80, -126, 160, 252, 12), '#f7f4ec');
      const face = y => { P(g, `M-44 ${y - 38} H44 Q50 ${y - 38} 50 ${y - 30} V${y + 24} Q50 ${y + 38} 30 ${y + 38} H-30 Q-50 ${y + 38} -50 ${y + 24} V${y - 30} Q-50 ${y - 38} -44 ${y - 38} Z`, '#ffffff', DK, 2.4);
        P(g, R(-26, y - 22, 8, 22, 2), '#2f3a45', DK, 1.4); P(g, R(18, y - 22, 8, 28, 2), '#2f3a45', DK, 1.4); P(g, `M-7 ${y + 26} V${y + 18} Q0 ${y + 11} 7 ${y + 18} V${y + 26} Z`, '#2f3a45', DK, 1.4); };
      if (o.k === 'gfci') { face(-70); face(78); P(g, R(-34, -16, 30, 22, 4), '#2f3a45'); P(g, R(4, -16, 30, 22, 4), '#e04b3a'); label(g, -19, 24, 'TEST', DK, 13, 'middle'); label(g, 19, 24, 'RESET', '#c0392b', 13, 'middle'); }
      else { face(-56); face(56); }
      P(g, C(0, 0, 6), '#c9d1d9', DK, 1.6);
    }),
    // "extinguisher cx cy height k=1|2|3|4" — using a fire extinguisher (PASS): 1 pull the pin, 2 aim at the base of the fire, 3 squeeze the handle, 4 sweep side to side
    extinguisher: make(340, (g, o) => {
      const k = String(o.k || '1');
      if (!['1', '2', '3', '4'].includes(k)) throw new Error(`Unknown step "${k}" (use 1|2|3|4)`);
      P(g, R(-120, -70, 80, 200, 30), '#e04b3a');
      P(g, R(-104, -96, 48, 28, 6), '#3a3f45'); line(g, 'M-104 -96 L-150 -118 M-56 -96 L-20 -112', DK, 7);
      line(g, 'M-60 -84 Q10 -80 20 0 L44 60', DK, 8); line(g, 'M-60 -84 Q10 -80 20 0 L44 60', '#3a3f45', 4); P(g, R(36, 54, 20, 30, 4), '#2f3a45');
      P(g, R(-104, 0, 48, 50, 4), '#ffffff', DK, 2); label(g, -80, 32, 'ABC', '#c0392b', 16, 'middle');
      const fire = (x, y) => { P(g, `M${x - 40} ${y} Q${x - 46} ${y - 50} ${x - 16} ${y - 76} Q${x - 10} ${y - 40} ${x} ${y - 56} Q${x + 18} ${y - 90} ${x + 24} ${y - 60} Q${x + 46} ${y - 40} ${x + 40} ${y} Z`, '#f4a531', '#d0551f', 2.4); };
      if (k === '1') { P(g, C(-38, -118, 10), null, '#f3c33b', 4); arrow(g, 'M-24 -122 L30 -150', 30, -150, -24, -122, '#2b6cc4', 4); }
      if (k === '2') { fire(150, 120); arrow(g, 'M60 88 L118 112', 118, 112, 60, 88, '#2b6cc4', 3); }
      if (k === '3') { arrow(g, 'M-150 -150 L-140 -126', -140, -126, -150, -150, '#2b6cc4', 4); arrow(g, 'M-20 -150 L-30 -124', -30, -124, -20, -150, '#2b6cc4', 4); }
      if (k === '4') { fire(150, 120); P(g, 'M56 84 L110 60 Q150 90 120 124 Z', '#e8ecef', '#9aa3ad', 2); arrow(g, 'M100 140 Q150 160 196 130', 196, 130, 150, 160, '#2b6cc4', 3); arrow(g, 'M196 130 Q150 160 100 140', 100, 140, 150, 160, '#2b6cc4', 3); }
      label(g, -160, -150, k, '#c0392b', 34, 'middle');
    }),
    // "studfinder cx cy width" — finding a stud: the wall's hidden studs (dashed), the stud finder lit over one, a nail into it holding a picture
    studfinder: make(440, g => {
      P(g, R(-210, -130, 420, 260, 4), '#efe7d6', '#c9b896');
      for (const x of [-160, -16, 128]) line(g, `M${x} -128 V128 M${x + 38} -128 V128`, '#c9925a', 2.4, { 'stroke-dasharray': '10 8' });
      P(g, R(-36, 30, 80, 46, 14), '#ffd84a'); for (const x of [-16, 3, 22]) P(g, C(x, 46, 5), '#5fae3a', DK, 1.6);
      arrow(g, 'M-120 104 H-50', -50, 104, -120, 104, '#2b6cc4', 3);
      P(g, C(3, -96, 4), '#5a626b', DK, 2); line(g, 'M3 -96 L-50 -60 M3 -96 L56 -60', '#7a848e', 2);
      P(g, R(-60, -60, 126, 80, 4), '#c9925a', '#7a4a20'); P(g, R(-48, -48, 102, 56), '#bfe3fa', '#7a4a20', 2);
    }),

    // ---------- home: water, power, walls ----------
    // "shutoff cx cy height k=open|closed" — water shutoff valve on the pipe under a sink (oval handle); closed = turned clockwise, arrow
    shutoff: make(300, (g, o) => {
      const shut = o.k === 'closed';
      line(g, 'M0 140 V-20 Q0 -60 40 -60 H150', DK, 26); line(g, 'M0 140 V-20 Q0 -60 40 -60 H150', '#c9925a', 18);
      P(g, R(-26, 30, 52, 50, 6), '#c9d1d9'); P(g, R(-8, -10, 16, 42), '#9aa3ad', DK, 2);
      P(g, shut ? E(0, -16, 18, 46) : E(0, -16, 46, 18), '#e8ecef', DK, 2.4);
      line(g, 'M-10 -50 Q-60 -40 -70 10', '#2b6cc4', 3); line(g, head(-70, 10, -66, -10, 11), '#2b6cc4', 3);
      label(g, -76, 34, 'righty tighty', '#2b6cc4', 14, 'middle');
    }),
    // "lightswitch cx cy height k=up|down" — wall light switch (toggle) on its plate; up = on
    lightswitch: make(260, (g, o) => {
      P(g, R(-64, -110, 128, 220, 10), '#f7f4ec'); P(g, R(-18, -50, 36, 100, 6), '#e8e3d6', DK, 2);
      P(g, o.k === 'down' ? 'M-12 0 L12 0 L10 40 L-10 40 Z' : 'M-12 0 L12 0 L10 -40 L-10 -40 Z', '#ffffff', DK, 2.4);
      for (const y of [-80, 80]) P(g, C(0, y, 6), '#c9d1d9', DK, 1.6);
      label(g, 0, 140, o.k === 'down' ? 'OFF' : 'ON', o.k === 'down' ? DK : '#2c6a22', 22, 'middle');
    }),
    // "spiritlevel cx cy length k=level|tilted" — spirit level with its bubble vial; level = bubble between the lines, tilted = bubble off to one side
    spiritlevel: make(440, (g, o) => {
      P(g, R(-200, -26, 400, 52, 6), '#ffd84a'); P(g, R(-46, -14, 92, 28, 12), '#d8f0a8', DK, 2);
      line(g, 'M-14 -14 V14 M14 -14 V14', DK, 2.4);
      P(g, E(o.k === 'tilted' ? 34 : 0, 0, 11, 9), '#ffffff', '#7a848e', 2);
      for (const x of [-150, 150]) P(g, C(x, 0, 12), '#2f3a45', DK, 1.4);
    }),
    // "paintroller cx cy width" — paint roller loaded with paint, and the tray with paint in its well
    paintroller: make(420, g => {
      P(g, 'M-200 90 L-40 30 L60 30 L60 110 L-200 110 Z', '#c9d1d9'); P(g, 'M-170 104 L-60 60 L50 60 L50 104 Z', '#7fb7ea', null);
      P(g, R(-40, -150, 200, 56, 26), '#7fb7ea'); line(g, 'M-30 -122 H150', '#5a93c8', 2);
      line(g, 'M160 -122 H190 V-60 H60 V60', DK, 8); line(g, 'M160 -122 H190 V-60 H60 V60', '#9aa3ad', 4);
      P(g, R(48, 50, 24, 70, 10), '#e04b3a');
    }),
    // "ladder cx cy height" — A-frame step ladder fully open, spreaders locked; the top cap marked "not a step"
    ladder: make(400, g => {
      line(g, 'M-60 -170 L-130 180 M60 -170 L130 180', DK, 12); line(g, 'M-60 -170 L-130 180 M60 -170 L130 180', '#c9d1d9', 7);
      line(g, 'M40 -150 L150 180', '#9aa3ad', 7);
      for (let i = 1; i <= 5; i++) { const y = -170 + i * 58, w = 60 + i * 14; P(g, R(-w, y - 6, 2 * w, 12, 3), '#c9d1d9', DK, 2); }
      P(g, R(-72, -186, 144, 22, 5), '#e04b3a'); label(g, 0, -196, 'not a step', '#c0392b', 16, 'middle');
      line(g, 'M-100 60 L60 70', '#5a626b', 3);
    }),
    // "thermostat cx cy size temp=N" — wall thermostat: display with the set temperature in °F, up/down buttons, heat/cool mode
    thermostat: make(260, (g, o) => {
      const t = Math.round(+(o.temp ?? 70));
      P(g, R(-110, -110, 220, 220, 30), '#f2f5f7'); P(g, R(-80, -76, 160, 92, 10), '#1f2a33');
      label(g, 0, -12, `${t}°`, '#7fe08a', 46, 'middle'); label(g, -56, -52, 'HEAT', '#f4a531', 14);
      for (const [x, d] of [[-34, 'M-46 74 L-34 56 L-22 74 Z'], [34, 'M22 56 L34 74 L46 56 Z']]) { P(g, C(x, 64, 22), '#d5dce2', DK, 2); P(g, d, DK, DK, 1.4); }
    }),
    // "furnacefilter cx cy width k=clean|dirty" — furnace air filter: pleated card frame with the airflow arrow; dirty = grey with dust
    furnacefilter: make(380, (g, o) => {
      const dirty = o.k === 'dirty';
      P(g, R(-160, -110, 320, 220, 4), '#c9b896'); P(g, R(-142, -92, 284, 184, 2), dirty ? '#9a9488' : '#ffffff', DK, 2);
      for (let x = -130; x <= 130; x += 18) line(g, `M${x} -92 L${x + 9} 92`, dirty ? '#7a7468' : '#d5dce2', 2);
      P(g, R(-60, -30, 120, 60, 6), '#ffffff', DK, 2); label(g, 0, 8, 'AIR FLOW', DK, 18, 'middle'); arrow(g, 'M-40 44 H40', 40, 44, -40, 44, DK, 3);
    }),
    // "waterheater cx cy height" — tank water heater cut open: cold in down the dip tube, hot out the top, burner, T&P relief valve, drain valve
    waterheater: make(400, g => {
      P(g, R(-100, -170, 200, 330, 40), '#e8ecef'); P(g, R(-84, -150, 168, 270, 30), '#f0b8a0', DK, 2);
      P(g, R(-84, 30, 168, 90, 0), '#a8d0f0', null);
      line(g, 'M-50 -200 V-170 M50 -200 V-170', DK, 12); line(g, 'M-50 -200 V-170', '#4f93d6', 7); line(g, 'M50 -200 V-170', '#e04b3a', 7);
      line(g, 'M-50 -170 V100', '#4f93d6', 5); label(g, -60, -206, 'cold in', '#2b6cc4', 15, 'end'); label(g, 60, -206, 'hot out', '#c0392b', 15);
      P(g, R(100, -130, 30, 20, 3), '#c9a227', DK, 2); line(g, 'M130 -120 H150 V40', '#9aa3ad', 5); label(g, 160, -126, 'T&P valve', DK, 14);
      for (const x of [-40, 0, 40]) P(g, `M${x - 12} 150 Q${x} 118 ${x + 12} 150 Z`, '#4f93d6', '#2b6cc4', 2);
      P(g, R(100, 110, 26, 18, 4), '#9aa3ad', DK, 2); label(g, 134, 124, 'drain', DK, 14);
    }),
    // "iron cx cy width" — steam iron on its heel: soleplate, water tank, temperature dial, steam puffs
    iron: make(360, g => {
      P(g, 'M-150 60 Q-150 -10 -60 -40 L120 -40 Q150 -40 150 0 L150 60 Z', '#7fb7ea');
      P(g, 'M-160 60 L160 60 L150 80 L-150 80 Z', '#c9d1d9');
      P(g, 'M-40 -40 Q-40 -110 30 -110 L120 -110 Q140 -110 130 -80 L110 -40', '#e8ecef');
      P(g, C(30, 10, 18), '#ffffff', DK, 2); line(g, 'M30 10 L40 -2', '#e04b3a', 3);
      for (const [x, y] of [[-150, 96], [-110, 104], [-70, 100]]) P(g, E(x, y, 16, 9), '#ffffff', '#c9d1d9', 2);
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
    // "tapemeasure cx cy width" — tape measure with its case, lock button and the yellow tape pulled out, inch marks and hook
    tapemeasure: make(420, g => {
      P(g, R(-60, -12, 250, 34, 2), '#ffd84a');
      for (let i = 0; i < 25; i++) line(g, `M${-50 + i * 10} -12 v${i % 4 ? 8 : 16}`, DK, 1.6);
      for (let i = 1; i <= 5; i++) label(g, -50 + i * 40, 18, String(i), DK, 14, 'middle');
      P(g, R(190, -20, 10, 46, 2), '#9aa3ad', DK, 2);
      P(g, R(-200, -80, 150, 150, 30), '#3a3f45'); P(g, C(-125, -5, 46), '#5a626b', DK, 2); P(g, R(-90, -96, 34, 18, 5), '#e04b3a', DK, 2);
    }),
    // "toolbox cx cy width" — open toolbox: red box with handle, tray of tools (hammer, screwdriver, wrench) showing
    toolbox: make(400, g => {
      line(g, 'M-60 -110 V-140 H60 V-110', DK, 10); line(g, 'M-60 -110 V-140 H60 V-110', '#3a3f45', 5);
      line(g, 'M-120 -90 L-40 -150 M100 -100 L140 -160', '#9aa3ad', 10);
      P(g, R(-60, -120, 18, 50, 3), '#e04b3a', DK, 2);
      P(g, R(-170, -90, 340, 170, 10), '#e04b3a'); line(g, 'M-170 -40 H170', '#a02a20', 4);
      for (const x of [-120, 100]) P(g, R(x, -60, 26, 14, 3), '#c9d1d9', DK, 2);
    }),
  });
})();
