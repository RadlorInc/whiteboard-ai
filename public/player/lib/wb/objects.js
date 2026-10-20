// Whiteboard library: objects — everyday things any lesson can use: tools, home fixtures, car parts, appliances (founder, 20 Oct 2026: shared by every subject)
// Catalogue: objects.txt. Words a drawing writes itself show by default; lab=0 hides them (the model labels it).
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

  const showLab = o => o.lab !== '0' && o.labels !== '0';
  Object.assign(window.RECIPES, {
    // "tire cx cy size k=good|flat" — road wheel: tyre, rim, five lug nuts; flat = squashed bottom with a nail in it
    tire: make(240, (g, o) => {
      if (o.k === 'flat') {
        P(g, 'M-110 0 A110 110 0 0 1 110 0 Q112 70 92 96 Q60 112 0 112 Q-60 112 -92 96 Q-112 70 -110 0 Z', '#3a3f45');
        line(g, 'M-100 104 H100', '#9aa3ad', 3);
        line(g, 'M58 70 L84 60', '#9aa3ad', 5); P(g, C(86, 59, 6), '#c9d1d9', DK, 2);
      } else {
        P(g, C(0, 0, 110), '#3a3f45');
        for (let i = 0; i < 28; i++) { const a = i * Math.PI * 2 / 28; line(g, `M${(98 * Math.cos(a)).toFixed(1)} ${(98 * Math.sin(a)).toFixed(1)} L${(110 * Math.cos(a)).toFixed(1)} ${(110 * Math.sin(a)).toFixed(1)}`, '#6a737c', 3); }
      }
      P(g, C(0, 0, 66), '#d5dce2', DK, 2.4);
      for (let i = 0; i < 5; i++) { const a = (-90 + i * 72) * Math.PI / 180; line(g, `M0 0 L${(58 * Math.cos(a)).toFixed(1)} ${(58 * Math.sin(a)).toFixed(1)}`, '#9aa3ad', 10); }
      P(g, C(0, 0, 22), '#9aa3ad', DK, 2);
      for (let i = 0; i < 5; i++) { const a = (-54 + i * 72) * Math.PI / 180; P(g, poly(34 * Math.cos(a), 34 * Math.sin(a), 6, 6), '#5a626b', DK, 1.6); }
      P(g, R(-4, -78, 8, 12, 2), '#5a626b', DK, 1.6);
    }),
    // "jack cx cy height up=0-100" — scissor jack; up opens it from folded (0) to fully raised (100)
    jack: make(220, (g, o) => {
      const up = Math.max(0, Math.min(100, +(o.up ?? 50))) / 100;
      scissor(g, 20, 100, 100 - (60 + up * 110));
    }),
    // "tiregauge cx cy size psi=0-60" — dial tire-pressure gauge on a valve stem, needle at psi
    tiregauge: make(300, (g, o) => {
      const psi = Math.max(0, Math.min(60, +(o.psi ?? 32))), A = v => (-225 + v / 60 * 270) * Math.PI / 180;
      line(g, 'M0 60 Q0 110 60 120 L100 120', DK, 12); line(g, 'M0 60 Q0 110 60 120 L100 120', '#3a3f45', 7);
      P(g, R(96, 108, 30, 24, 4), '#c9d1d9', DK, 2); P(g, R(126, 112, 26, 16, 3), '#5a626b', DK, 2);
      P(g, C(0, -20, 86), '#d5dce2'); P(g, C(0, -20, 72), '#ffffff', DK, 2.4);
      for (let v = 0; v <= 60; v += 5) { const a = A(v), r1 = v % 10 ? 62 : 56; line(g, `M${(r1 * Math.cos(a)).toFixed(1)} ${(-20 + r1 * Math.sin(a)).toFixed(1)} L${(68 * Math.cos(a)).toFixed(1)} ${(-20 + 68 * Math.sin(a)).toFixed(1)}`, DK, v % 10 ? 1.6 : 2.6);
        if (v % 20 === 0) label(g, (44 * Math.cos(a)).toFixed(1), (-14 + 44 * Math.sin(a)).toFixed(1), String(v), DK, 15, 'middle'); }
      const a = A(psi); line(g, `M0 -20 L${(58 * Math.cos(a)).toFixed(1)} ${(-20 + 58 * Math.sin(a)).toFixed(1)}`, '#e04b3a', 4); P(g, C(0, -20, 6), DK, DK, 2);
      if (showLab(o)) label(g, 0, 30, `${psi} psi`, '#c0392b', 20, 'middle');
    }),
    // "headlight cx cy width k=on|off" — headlight from the front: lens, reflector and the bulb with its socket behind; on shines a beam
    headlight: make(380, (g, o) => {
      if (o.k !== 'off') P(g, 'M60 -40 L190 -90 L190 90 L60 40 Z', '#fff4b8', '#f3c33b', 2);
      P(g, 'M-170 -60 Q-170 -90 -130 -90 L50 -80 Q80 -78 80 -40 L80 40 Q80 78 50 80 L-130 90 Q-170 90 -170 60 Z', '#e8ecef');
      P(g, E(-20, 0, 80, 66), '#c9d1d9', DK, 2.4); P(g, E(-20, 0, 46, 38), '#eef1f4', DK, 2);
      P(g, E(-20, 0, 16, 22), o.k === 'off' ? '#ffffff' : '#ffe38a', DK, 2); line(g, 'M-20 22 V40', DK, 3);
      P(g, R(-210, -16, 46, 32, 6), '#3a3f45'); line(g, 'M-226 -8 H-210 M-226 8 H-210', '#c9a227', 4);
    }),
    // "brakes cx cy size" — disc brake: the rotor on the hub, the caliper over its edge, the two pads squeezing it (arrows)
    brakes: make(320, g => {
      P(g, C(-20, 0, 130), '#b8c1ca'); P(g, C(-20, 0, 112), '#d5dce2', DK, 2);
      for (let i = 0; i < 18; i++) { const a = i * Math.PI / 9; P(g, C(-20 + 92 * Math.cos(a), 92 * Math.sin(a), 4), '#9aa3ad', DK, 1); }
      P(g, C(-20, 0, 54), '#9aa3ad'); P(g, C(-20, 0, 18), '#5a626b', DK, 2);
      for (let i = 0; i < 5; i++) { const a = (-90 + i * 72) * Math.PI / 180; P(g, C(-20 + 34 * Math.cos(a), 34 * Math.sin(a), 6), '#3a3f45', DK, 1.4); }
      P(g, 'M60 -100 Q150 -120 160 -40 L160 40 Q150 120 60 100 L74 70 Q120 70 122 30 L122 -30 Q120 -70 74 -70 Z', '#e04b3a');
      P(g, R(100, -54, 16, 108, 3), '#5a626b', DK, 2);
      arrow(g, 'M190 0 H136', 136, 0, 190, 0, '#2b6cc4', 4);
    }),
    // "radiator cx cy width" — radiator with its fins, hoses and pressure cap, and the coolant overflow tank with MIN/MAX marks
    radiator: make(420, g => {
      P(g, R(-190, -110, 280, 220, 8), '#9aa3ad'); P(g, R(-176, -96, 252, 192, 4), '#c9d1d9', DK, 2);
      for (let x = -168; x <= 68; x += 12) line(g, `M${x} -96 V96`, '#9aa3ad', 2);
      P(g, R(-60, -132, 40, 24, 6), '#ffd84a');
      line(g, 'M90 -80 Q130 -80 130 -120', DK, 14); line(g, 'M90 -80 Q130 -80 130 -120', '#3a3f45', 9);
      line(g, 'M-190 80 Q-215 80 -215 120', DK, 14); line(g, 'M-190 80 Q-215 80 -215 120', '#3a3f45', 9);
      P(g, R(140, -60, 70, 120, 12), '#f2f5f7'); P(g, R(142, -10, 66, 68, 0), '#ff9fb6', DK, 1.4); P(g, R(160, -74, 30, 16, 4), '#ffd84a', DK, 2);
      line(g, 'M212 -30 h10 M212 30 h10', DK, 2.4); label(g, 226, -24, 'MAX', '#2c6a22', 13); label(g, 226, 36, 'MIN', '#c0392b', 13);
    }),
    // "belt cx cy size" — serpentine belt routed round its pulleys: crankshaft, alternator, power steering, A/C, water pump and the spring tensioner
    belt: make(380, (g, o) => {
      const pul = [['crank', 0, 110, 46], ['A/C', -120, 60, 32], ['alternator', -110, -90, 30], ['tensioner', -20, -40, 20], ['water pump', 50, -110, 32], ['steering', 130, 10, 32]];
      line(g, 'M-46 110 Q-120 110 -152 60 Q-160 -40 -140 -90 Q-110 -126 -80 -90 Q-40 -60 -10 -60 Q20 -150 50 -142 Q90 -140 82 -110 Q120 -40 162 10 Q160 60 46 110 Z', DK, 10);
      line(g, 'M-46 110 Q-120 110 -152 60 Q-160 -40 -140 -90 Q-110 -126 -80 -90 Q-40 -60 -10 -60 Q20 -150 50 -142 Q90 -140 82 -110 Q120 -40 162 10 Q160 60 46 110 Z', '#3a3f45', 6);
      for (const [t, x, y, r] of pul) { P(g, C(x, y, r), '#c9d1d9', DK, 2.4); P(g, C(x, y, r * .3), '#7a848e', DK, 1.6); if (showLab(o)) label(g, x, y + r + 20, t, DK, 15, 'middle'); }
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

    // "toolbox cx cy width" — open toolbox: red box with handle, tray of tools (hammer, screwdriver, wrench) showing
    toolbox: make(400, g => {
      line(g, 'M-60 -110 V-140 H60 V-110', DK, 10); line(g, 'M-60 -110 V-140 H60 V-110', '#3a3f45', 5);
      line(g, 'M-120 -90 L-40 -150 M100 -100 L140 -160', '#9aa3ad', 10);
      P(g, R(-60, -120, 18, 50, 3), '#e04b3a', DK, 2);
      P(g, R(-170, -90, 340, 170, 10), '#e04b3a'); line(g, 'M-170 -40 H170', '#a02a20', 4);
      for (const x of [-120, 100]) P(g, R(x, -60, 26, 14, 3), '#c9d1d9', DK, 2);
    }),
    // "tapemeasure cx cy width" — tape measure with its case, lock button and the yellow tape pulled out, inch marks and hook
    tapemeasure: make(420, g => {
      P(g, R(-60, -12, 250, 34, 2), '#ffd84a');
      for (let i = 0; i < 25; i++) line(g, `M${-50 + i * 10} -12 v${i % 4 ? 8 : 16}`, DK, 1.6);
      for (let i = 1; i <= 5; i++) label(g, -50 + i * 40, 18, String(i), DK, 14, 'middle');
      P(g, R(190, -20, 10, 46, 2), '#9aa3ad', DK, 2);
      P(g, R(-200, -80, 150, 150, 30), '#3a3f45'); P(g, C(-125, -5, 46), '#5a626b', DK, 2); P(g, R(-90, -96, 34, 18, 5), '#e04b3a', DK, 2);
    }),
    // "spiritlevel cx cy length k=level|tilted" — spirit level with its bubble vial; level = bubble between the lines, tilted = bubble off to one side
    spiritlevel: make(440, (g, o) => {
      P(g, R(-200, -26, 400, 52, 6), '#ffd84a'); P(g, R(-46, -14, 92, 28, 12), '#d8f0a8', DK, 2);
      line(g, 'M-14 -14 V14 M14 -14 V14', DK, 2.4);
      P(g, E(o.k === 'tilted' ? 34 : 0, 0, 11, 9), '#ffffff', '#7a848e', 2);
      for (const x of [-150, 150]) P(g, C(x, 0, 12), '#2f3a45', DK, 1.4);
    }),
    // "ladder cx cy height" — A-frame step ladder fully open, spreaders locked; the top cap marked "not a step"
    ladder: make(400, g => {
      line(g, 'M-60 -170 L-130 180 M60 -170 L130 180', DK, 12); line(g, 'M-60 -170 L-130 180 M60 -170 L130 180', '#c9d1d9', 7);
      line(g, 'M40 -150 L150 180', '#9aa3ad', 7);
      for (let i = 1; i <= 5; i++) { const y = -170 + i * 58, w = 60 + i * 14; P(g, R(-w, y - 6, 2 * w, 12, 3), '#c9d1d9', DK, 2); }
      P(g, R(-72, -186, 144, 22, 5), '#e04b3a');
      line(g, 'M-100 60 L60 70', '#5a626b', 3);
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
    // "lightswitch cx cy height k=up|down" — wall light switch (toggle) on its plate; up = on
    lightswitch: make(260, (g, o) => {
      P(g, R(-64, -110, 128, 220, 10), '#f7f4ec'); P(g, R(-18, -50, 36, 100, 6), '#e8e3d6', DK, 2);
      P(g, o.k === 'down' ? 'M-12 0 L12 0 L10 40 L-10 40 Z' : 'M-12 0 L12 0 L10 -40 L-10 -40 Z', '#ffffff', DK, 2.4);
      for (const y of [-80, 80]) P(g, C(0, y, 6), '#c9d1d9', DK, 1.6);
      if (showLab(o)) label(g, 0, 140, o.k === 'down' ? 'OFF' : 'ON', o.k === 'down' ? DK : '#2c6a22', 22, 'middle');
    }),
    // "thermostat cx cy size temp=N" — wall thermostat: display with the set temperature in °F, up/down buttons, heat/cool mode
    thermostat: make(260, (g, o) => {
      const t = Math.round(+(o.temp ?? 70));
      P(g, R(-110, -110, 220, 220, 30), '#f2f5f7'); P(g, R(-80, -76, 160, 92, 10), '#1f2a33');
      label(g, 0, -12, `${t}°`, '#7fe08a', 46, 'middle'); label(g, -56, -52, 'HEAT', '#f4a531', 14);
      for (const [x, d] of [[-34, 'M-46 74 L-34 56 L-22 74 Z'], [34, 'M22 56 L34 74 L46 56 Z']]) { P(g, C(x, 64, 22), '#d5dce2', DK, 2); P(g, d, DK, DK, 1.4); }
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
    // "waterheater cx cy height" — tank water heater cut open: cold in down the dip tube, hot out the top, burner, T&P relief valve, drain valve
    waterheater: make(400, (g, o) => {
      P(g, R(-100, -170, 200, 330, 40), '#e8ecef'); P(g, R(-84, -150, 168, 270, 30), '#f0b8a0', DK, 2);
      P(g, R(-84, 30, 168, 90, 0), '#a8d0f0', null);
      line(g, 'M-50 -200 V-170 M50 -200 V-170', DK, 12); line(g, 'M-50 -200 V-170', '#4f93d6', 7); line(g, 'M50 -200 V-170', '#e04b3a', 7);
      line(g, 'M-50 -170 V100', '#4f93d6', 5); if (showLab(o)) { label(g, -60, -206, 'cold in', '#2b6cc4', 15, 'end'); label(g, 60, -206, 'hot out', '#c0392b', 15); }
      P(g, R(100, -130, 30, 20, 3), '#c9a227', DK, 2); line(g, 'M130 -120 H150 V40', '#9aa3ad', 5); if (showLab(o)) label(g, 160, -126, 'T&P valve', DK, 14);
      for (const x of [-40, 0, 40]) P(g, `M${x - 12} 150 Q${x} 118 ${x + 12} 150 Z`, '#4f93d6', '#2b6cc4', 2);
      P(g, R(100, 110, 26, 18, 4), '#9aa3ad', DK, 2); if (showLab(o)) label(g, 134, 124, 'drain', DK, 14);
    }),
    // "iron cx cy width" — steam iron on its heel: soleplate, water tank, temperature dial, steam puffs
    iron: make(360, g => {
      P(g, 'M-150 60 Q-150 -10 -60 -40 L120 -40 Q150 -40 150 0 L150 60 Z', '#7fb7ea');
      P(g, 'M-160 60 L160 60 L150 80 L-150 80 Z', '#c9d1d9');
      P(g, 'M-40 -40 Q-40 -110 30 -110 L120 -110 Q140 -110 130 -80 L110 -40', '#e8ecef');
      P(g, C(30, 10, 18), '#ffffff', DK, 2); line(g, 'M30 10 L40 -2', '#e04b3a', 3);
      for (const [x, y] of [[-150, 96], [-110, 104], [-70, 100]]) P(g, E(x, y, 16, 9), '#ffffff', '#c9d1d9', 2);
    }),
    // "plunger cx cy height k=sink|toilet" — cup plunger sealed over a clogged drain, push-pull arrows
    plunger: make(320, (g, o) => {
      if (o.k === 'toilet') { P(g, 'M-120 -20 Q-120 120 0 130 Q120 120 120 -20 Z', '#ffffff'); P(g, E(0, -20, 120, 26), '#f2f5f7'); P(g, E(0, -14, 90, 16), '#bfe3fa', '#7fb7ea', 2); }
      else { P(g, 'M-150 -20 L150 -20 L120 70 L-120 70 Z', '#e8ecef'); P(g, E(0, -6, 120, 14), '#bfe3fa', '#7fb7ea', 2); P(g, E(0, 62, 18, 5), '#3a3f45', DK, 2); }
      P(g, R(-8, -170, 16, 150, 4), '#c9925a', '#7a4a20');
      P(g, 'M-50 -10 Q-50 -44 0 -44 Q50 -44 50 -10 L40 4 L-40 4 Z', '#e04b3a');
      arrow(g, 'M80 -150 V-90', 80, -90, 80, -150, '#2b6cc4', 4); arrow(g, 'M104 -90 V-150', 104, -150, 104, -90, '#2b6cc4', 4);
    }),
    // "shutoff cx cy height k=open|closed" — water shutoff valve on the pipe under a sink (oval handle); closed = turned clockwise, arrow
    shutoff: make(300, (g, o) => {
      const shut = o.k === 'closed';
      line(g, 'M0 140 V-20 Q0 -60 40 -60 H150', DK, 26); line(g, 'M0 140 V-20 Q0 -60 40 -60 H150', '#c9925a', 18);
      P(g, R(-26, 30, 52, 50, 6), '#c9d1d9'); P(g, R(-8, -10, 16, 42), '#9aa3ad', DK, 2);
      P(g, shut ? E(0, -16, 18, 46) : E(0, -16, 46, 18), '#e8ecef', DK, 2.4);
      if (shut) { line(g, 'M-10 -50 Q-60 -40 -70 10', '#2b6cc4', 3); line(g, head(-70, 10, -66, -10, 11), '#2b6cc4', 3); }
    }),
    // "extinguisher cx cy height k=1|2|3|4" — using a fire extinguisher (PASS): 1 pull the pin, 2 aim at the base of the fire, 3 squeeze the handle, 4 sweep side to side
    extinguisher: make(340, (g, o) => {
      const k = String(o.k || 'plain');
      if (!['plain', '1', '2', '3', '4'].includes(k)) throw new Error(`Unknown step "${k}" (use plain|1|2|3|4)`);
      P(g, R(-120, -70, 80, 200, 30), '#e04b3a');
      P(g, R(-104, -96, 48, 28, 6), '#3a3f45'); line(g, 'M-104 -96 L-150 -118 M-56 -96 L-20 -112', DK, 7);
      line(g, 'M-60 -84 Q10 -80 20 0 L44 60', DK, 8); line(g, 'M-60 -84 Q10 -80 20 0 L44 60', '#3a3f45', 4); P(g, R(36, 54, 20, 30, 4), '#2f3a45');
      P(g, R(-104, 0, 48, 50, 4), '#ffffff', DK, 2); label(g, -80, 32, 'ABC', '#c0392b', 16, 'middle');
      const fire = (x, y) => { P(g, `M${x - 40} ${y} Q${x - 46} ${y - 50} ${x - 16} ${y - 76} Q${x - 10} ${y - 40} ${x} ${y - 56} Q${x + 18} ${y - 90} ${x + 24} ${y - 60} Q${x + 46} ${y - 40} ${x + 40} ${y} Z`, '#f4a531', '#d0551f', 2.4); };
      if (k === '1') { P(g, C(-38, -118, 10), null, '#f3c33b', 4); arrow(g, 'M-24 -122 L30 -150', 30, -150, -24, -122, '#2b6cc4', 4); }
      if (k === '2') { fire(150, 120); arrow(g, 'M60 88 L118 112', 118, 112, 60, 88, '#2b6cc4', 3); }
      if (k === '3') { arrow(g, 'M-150 -150 L-140 -126', -140, -126, -150, -150, '#2b6cc4', 4); arrow(g, 'M-20 -150 L-30 -124', -30, -124, -20, -150, '#2b6cc4', 4); }
      if (k === '4') { fire(150, 120); P(g, 'M56 84 L110 60 Q150 90 120 124 Z', '#e8ecef', '#9aa3ad', 2); arrow(g, 'M100 140 Q150 160 196 130', 196, 130, 150, 160, '#2b6cc4', 3); arrow(g, 'M196 130 Q150 160 100 140', 100, 140, 150, 160, '#2b6cc4', 3); }
      if (k !== 'plain' && showLab(o)) label(g, -160, -150, k, '#c0392b', 34, 'middle');
    }),
    // "carbattery cx cy width k=good|dead lab=0" — 12-volt car battery: case, red + and black − terminals with caps; dead = grey case; lab=0 hides its words
    carbattery: make(300, (g, o) => {
      P(g, R(-130, -70, 260, 160, 12), o.k === 'dead' ? '#7a848e' : '#3a4450');
      P(g, R(-130, -70, 260, 26, 8), '#2f3a45');
      P(g, R(-100, -96, 40, 28, 5), '#e04b3a', DK, 2); P(g, R(60, -96, 40, 28, 5), '#2f3a45', DK, 2);
      label(g, -80, -104, '+', '#c0392b', 30, 'middle'); label(g, 80, -104, '−', DK, 30, 'middle');
      if (showLab(o)) label(g, 0, 30, '12V', '#e8ecef', 28, 'middle');
    }),
    // "wallstuds cx cy width" — a wall section with its hidden wooden studs shown dashed every 16 inches behind the drywall
    wallstuds: make(440, g => {
      P(g, R(-210, -130, 420, 260, 4), '#efe7d6', '#c9b896');
      for (const x of [-160, -16, 128]) line(g, `M${x} -128 V128 M${x + 38} -128 V128`, '#c9925a', 2.4, { 'stroke-dasharray': '10 8' });
      line(g, 'M-210 128 H210', '#9a8a6a', 6);
    }),
  });
})();
