// Whiteboard library — biology: detailed, labelled teaching diagrams for the core school topics (heart and
// circulation, breathing, digestion, nerves, DNA and cell division, leaves and plants). Catalogue: biology.txt.
// Every drawing names its parts by default (lab=0 hides the words) and is drawn polished (class polished). Only the biology subject prompt lists these.
(() => {
  // class polished: clean lines, flat colour, plain labels (index.html), not the rough whiteboard look
  const G = (cx, cy, S, D, o, parent) => mk('g', { class: 'polished', transform: `translate(${cx} ${cy}) rotate(${o.rot || 0}) scale(${S / D})` }, parent);
  const fill = (g, d, f, ex = {}) => mk('path', { d, fill: f, filter: 'url(#wc)', class: 'fillable', ...ex }, g);
  const part = (g, d, f, ink, w = 3) => { fill(g, d, f); return line(g, d, ink, w); };
  const ell = (x, y, rx, ry = rx) => `M${x - rx} ${y} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
  const sheen = (g, d, w = 6) => line(g, d, '#ffffff', w, { opacity: .55 });
  const lab = o => o.lab !== '0' && o.labels !== '0';
  const L = (g, x, y, t, c = '#444', s = 19, a = 'middle') => label(g, x, y, t, c, s, a);
  const arrow = (g, d, x2, y2, ax, ay, c, w = 2.6, h = 11) => { line(g, d, c, w); line(g, head(x2, y2, ax, ay, h), c, w); };
  // a part's name with a thin leader line from the part (x1 y1) to the words (x2 y2)
  const tag = (g, x1, y1, x2, y2, t, c = '#444', s = 19) => {
    line(g, `M${x1} ${y1} L${x2} ${y2}`, '#8a8f96', 1.4);
    L(g, x2 + (x2 > x1 ? 6 : x2 < x1 ? -6 : 0), y2 + (y2 > y1 + 4 ? 16 : y2 < y1 - 4 ? -6 : 6), t, c, s, x2 > x1 ? 'start' : x2 < x1 ? 'end' : 'middle');
  };
  const BLUE = '#5d93d6', BLUEI = '#1f4f8f', RED = '#d9483c', REDI = '#7a1f1f';

  Object.assign(window.RECIPES, {
    // "heartsection cx cy size lab=1" — heart cut open: 4 chambers, valves, vessels, blood-flow arrows
    heartsection: ([cx, cy, S = 320], o, t, parent) => {
      const g = G(cx, cy, S, 320, o, parent);
      // vessels behind the heart
      part(g, 'M-128 -96 L-128 -176 Q-128 -184 -120 -184 L-106 -184 Q-98 -184 -98 -176 L-98 -100 Z', BLUE, BLUEI, 3);           // vena cava
      part(g, 'M-36 -96 L-36 -140 C-36 -156 -46 -162 -70 -162 L-70 -178 C-36 -180 -6 -168 -6 -140 L-6 -96 Z', BLUE, BLUEI, 3); // pulmonary artery
      part(g, 'M8 -96 C6 -176 70 -206 130 -176 L122 -152 C84 -174 40 -160 40 -96 Z', RED, REDI, 3);                                // aorta
      for (const y of [-86, -52]) part(g, `M120 ${y - 13} L190 ${y - 13} L190 ${y + 13} L120 ${y + 13} Z`, RED, REDI, 3);           // pulmonary veins
      // muscle wall, then the four chambers' blood
      const H = 'M0 135 C-70 115 -150 60 -148 -10 C-146 -70 -120 -112 -70 -112 L70 -112 C120 -112 146 -70 148 -10 C150 60 70 115 0 135 Z';
      part(g, H, '#e58a84', '#5b1a1a', 3.6);
      sheen(g, 'M-132 -50 C-126 -80 -106 -100 -80 -104');
      const RA = 'M-125 -55 C-125 -90 -95 -100 -70 -98 C-45 -96 -30 -80 -30 -55 C-30 -30 -50 -18 -75 -18 C-105 -18 -125 -30 -125 -55 Z';
      const LA = RA.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => `${-x} ${y}`);
      const RV = 'M-122 8 L-34 8 C-30 50 -30 85 -16 112 C-62 96 -112 62 -122 8 Z';
      const LV = 'M34 10 L110 10 C102 52 72 82 22 106 C18 76 26 42 34 10 Z';
      part(g, RA, '#a9c8ee', BLUEI, 2.6); part(g, RV, '#a9c8ee', BLUEI, 2.6);
      part(g, LA, '#f4a39a', REDI, 2.6); part(g, LV, '#f4a39a', REDI, 2.6);
      // valves (white flaps) between atria and ventricles, and at the two arteries
      line(g, 'M-106 -16 L-96 6 M-50 -16 L-62 6 M106 -16 L96 6 M50 -16 L62 6', '#ffffff', 4.5);
      line(g, 'M-32 -96 L-26 -108 M-10 -96 L-16 -108 M12 -96 L20 -108 M36 -96 L28 -108', '#ffffff', 3.5);
      // blood flow: blue in on the right side of the body (viewer's left), red on the left side
      arrow(g, 'M-113 -150 L-113 -70', -113, -70, -113, -150, BLUEI, 3);
      arrow(g, 'M-80 -45 L-80 60', -80, 60, -80, -45, BLUEI, 3);
      arrow(g, 'M-52 72 C-36 40 -21 20 -21 -132', -21, -132, -21, -60, BLUEI, 3);
      arrow(g, 'M184 -60 L96 -60', 96, -60, 184, -60, REDI, 3);
      arrow(g, 'M78 -40 L66 62', 66, 62, 78, -40, REDI, 3);
      arrow(g, 'M50 74 C34 40 22 20 22 -140', 22, -140, 22, -60, REDI, 3);
      if (lab(o)) {
        tag(g, -128, -160, -165, -160, 'vena cava', BLUEI);
        tag(g, -100, -55, -170, -55, 'right atrium', BLUEI);
        tag(g, -88, 55, -170, 85, 'right ventricle', BLUEI);
        L(g, -40, -188, 'to lungs', BLUEI, 17);
        L(g, 110, -200, 'aorta', REDI);
        L(g, 196, -96, 'from lungs', REDI, 17, 'start');
        tag(g, 90, -36, 175, -10, 'left atrium', REDI);
        tag(g, 78, 50, 172, 85, 'left ventricle', REDI);
        tag(g, 4, 60, 4, 160, 'septum (wall)', '#5b1a1a', 17);
      }
      return g;
    },

    // "circulation cx cy size lab=1" — double circulation: heart pumps blood to the lungs and round the body
    circulation: ([cx, cy, S = 400], o, t, parent) => {
      const g = G(cx, cy, S, 400, o, parent);
      // capillary beds: lungs at the top, body at the bottom
      part(g, 'M-90 -195 L90 -195 Q100 -195 100 -185 L100 -145 Q100 -135 90 -135 L-90 -135 Q-100 -135 -100 -145 L-100 -185 Q-100 -195 -90 -195 Z', '#f8c6c9', '#9a3b46', 3);
      part(g, 'M-90 135 L90 135 Q100 135 100 145 L100 185 Q100 195 90 195 L-90 195 Q-100 195 -100 185 L-100 145 Q-100 135 -90 135 Z', '#f6dcc0', '#8a5a2a', 3);
      line(g, 'M-80 -165 q10 -16 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0', '#a0507a', 2);
      line(g, 'M-80 165 q10 -16 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0', '#a0507a', 2);
      // vessels: oxygen-poor blue on the left, oxygen-rich red on the right
      arrow(g, 'M-52 24 C-120 24 -125 -165 -104 -165', -104, -165, -118, -150, BLUEI, 7, 14);
      arrow(g, 'M104 -165 C125 -165 125 -22 54 -22', 54, -22, 90, -22, REDI, 7, 14);
      arrow(g, 'M52 24 C160 24 165 165 104 165', 104, 165, 140, 165, REDI, 7, 14);
      arrow(g, 'M-104 165 C-165 165 -160 -22 -54 -22', -54, -22, -90, -22, BLUEI, 7, 14);
      // the heart: four chambers (left side of the body on the viewer's right)
      fill(g, 'M-50 -48 L0 -48 L0 48 L-50 48 Q-56 48 -56 42 L-56 -42 Q-56 -48 -50 -48 Z', '#9cc0ec');
      fill(g, 'M50 -48 L0 -48 L0 48 L50 48 Q56 48 56 42 L56 -42 Q56 -48 50 -48 Z', '#f19a90');
      line(g, 'M-50 -48 L50 -48 Q56 -48 56 -42 L56 42 Q56 48 50 48 L-50 48 Q-56 48 -56 42 L-56 -42 Q-56 -48 -50 -48 Z', '#5b1a1a', 3.4);
      line(g, 'M0 -48 L0 48 M-56 0 L-6 0 M6 0 L56 0', '#5b1a1a', 2.6);
      for (const [x, y, s] of [[-28, -16, 'RA'], [28, -16, 'LA'], [-28, 32, 'RV'], [28, 32, 'LV']]) if (lab(o)) L(g, x, y, s, '#ffffff', 18);
      if (lab(o)) {
        L(g, 0, -205, 'lungs: blood picks up oxygen', '#9a3b46', 18);
        L(g, 0, 220, 'body: oxygen is used', '#8a5a2a', 18);
        L(g, -140, -70, 'to lungs', BLUEI, 17, 'end'); L(g, 140, -70, 'from lungs', REDI, 17, 'start');
        L(g, -160, 100, 'from body', BLUEI, 17, 'end'); L(g, 160, 100, 'to body', REDI, 17, 'start');
        L(g, 0, 78, 'heart', '#5b1a1a', 20);
      }
      return g;
    },

    // "breathing cx cy height lab=1" — breathing system: nose and mouth, windpipe, bronchi, lungs, ribs, diaphragm, alveoli
    breathing: ([cx, cy, S = 420], o, t, parent) => {
      const g = G(cx, cy, S, 420, o, parent);
      // ribs behind the lungs
      for (const y of [-55, -20, 15, 50, 85]) for (const s of [-1, 1]) line(g, `M${s * 14} ${y} C${s * 80} ${y - 14} ${s * 140} ${y} ${s * 150} ${y + 32}`, '#b9b2a6', 4);
      line(g, 'M0 -70 L0 120', '#b9b2a6', 6);
      // head with nose and mouth, throat down to the windpipe
      part(g, ell(0, -168, 36, 44), '#f3e2cf', '#6b4a30', 3);
      line(g, 'M-4 -172 L-8 -160 L2 -158 M-10 -146 Q0 -140 10 -146', '#6b4a30', 2.2);
      line(g, 'M-14 -124 L-14 -112 M14 -124 L14 -112', '#6b4a30', 3);
      RECIPES.lungs([0, 20, 260], { lbl: '0' }, '', g);
      // diaphragm: the dome of muscle under the lungs
      part(g, 'M-150 150 C-100 98 100 98 150 150 L150 162 C100 112 -100 112 -150 162 Z', '#d97a6a', '#7a2f24', 2.6);
      // alveoli close-up
      fill(g, ell(195, 70, 58), '#fffaf4'); line(g, ell(195, 70, 58), '#8a8f96', 2, { 'stroke-dasharray': '6 5' });
      RECIPES.alveolus([195, 74, 92], { lbl: '0' }, '', g);
      line(g, 'M92 72 L137 70', '#8a8f96', 1.6, { 'stroke-dasharray': '5 4' });
      if (lab(o)) {
        tag(g, -16, -150, -80, -172, 'nose and mouth', '#6b4a30');
        tag(g, 9, -90, 70, -112, 'windpipe (trachea)', '#5a6a7a');
        tag(g, 40, -28, 120, -50, 'bronchus', '#5a6a7a');
        tag(g, -84, 20, -170, 0, 'lung', '#9a3b46');
        tag(g, -146, 78, -180, 96, 'ribs', '#7a7268');
        tag(g, -70, 120, -120, 178, 'diaphragm', '#7a2f24');
        L(g, 195, 162, 'alveoli (air sacs)', '#9a3b46', 17);
      }
      return g;
    },

    // "gut cx cy height lab=1" — digestive system in the body: mouth, food pipe, stomach, liver, pancreas, intestines
    gut: ([cx, cy, S = 460], o, t, parent) => {
      const g = G(cx, cy, S, 460, o, parent);
      RECIPES.digestive([0, 10, 420], {}, '', g);
      part(g, 'M30 26 C46 18 70 20 84 14 C92 12 94 22 86 26 C70 34 48 32 30 32 Z', '#f6cf7a', '#9a6a14', 2.2);   // pancreas
      line(g, 'M-12 -142 Q0 -136 12 -142', '#8a2e3e', 2.6);                                                          // mouth
      if (lab(o)) {
        tag(g, -12, -140, -110, -170, 'mouth', '#6b4a30');
        tag(g, 1, -100, -110, -110, 'food pipe (gullet)', '#8a2e3e');
        tag(g, -60, -38, -140, -50, 'liver', '#5b1e18');
        tag(g, 40, -6, 140, -60, 'stomach', '#8a2e3e');
        tag(g, 80, 22, 150, 10, 'pancreas', '#9a6a14');
        tag(g, -10, 90, -150, 70, 'small intestine', '#a8484a');
        tag(g, 62, 120, 150, 120, 'large intestine', '#7a4520');
        tag(g, 10, 154, 10, 190, 'rectum', '#7a4520', 17);
      }
      return g;
    },

    // "reflexarc cx cy width lab=1" — reflex arc: hot flame, receptor, sensory neuron, spinal cord, relay and motor neuron, muscle
    reflexarc: ([cx, cy, W = 700], o, t, parent) => {
      const g = G(cx, cy, W, 700, o, parent);
      // fingertip near a flame (stimulus and receptor)
      part(g, 'M-380 -84 L-276 -84 C-256 -84 -246 -74 -246 -66 C-246 -58 -256 -48 -276 -48 L-380 -48 Z', '#f3d7bf', '#6b4a30', 3);
      part(g, 'M-292 -84 L-272 -84 C-262 -83 -255 -79 -252 -73 L-292 -73 Z', '#fbeee2', '#9a7a5a', 1.8);
      part(g, 'M-286 -112 C-300 -130 -290 -150 -272 -170 C-270 -152 -256 -146 -254 -128 C-252 -112 -268 -100 -286 -112 Z', '#f7a531', '#c0392b', 2.4);
      fill(g, 'M-276 -114 C-282 -124 -276 -136 -268 -144 C-266 -134 -260 -128 -262 -120 C-264 -112 -270 -110 -276 -114 Z', '#ffd84a');
      fill(g, ell(-262, -60, 6), '#2b6cc4'); line(g, ell(-262, -60, 6), BLUEI, 2);
      // muscle (effector)
      part(g, 'M-350 110 C-320 72 -230 72 -200 110 C-230 148 -320 148 -350 110 Z', '#e58a84', '#7a2f24', 3);
      line(g, 'M-330 104 C-300 96 -250 96 -220 104 M-330 118 C-300 126 -250 126 -220 118', '#b85a52', 1.8);
      // spinal cord cross-section: white matter round grey butterfly
      part(g, ell(240, -20, 80, 66), '#f6f0e2', '#7a7268', 3);
      part(g, 'M240 -40 C226 -80 196 -76 200 -50 C204 -30 222 -24 226 -20 C222 -14 204 -6 202 16 C200 40 228 40 240 0 C252 40 280 40 278 16 C276 -6 258 -14 254 -20 C258 -24 276 -30 280 -50 C284 -76 254 -80 240 -40 Z', '#cfc6d8', '#6b5a7a', 2.4);
      // sensory neuron (blue): receptor → cell body outside the cord → into the cord
      line(g, 'M-256 -62 C-190 -110 -60 -100 60 -96 C110 -94 140 -90 160 -84 C190 -74 205 -60 214 -44', '#2b6cc4', 4);
      part(g, ell(110, -95, 12), '#9cc0ec', BLUEI, 2.4);
      // relay neuron inside the cord
      line(g, 'M216 -42 C226 -30 232 -10 230 8', '#8a5bb0', 4);
      // motor neuron (red): cell body in the cord → out to the muscle
      part(g, ell(232, 14, 9), '#f4a39a', REDI, 2.2);
      line(g, 'M226 20 C200 50 160 70 100 76 C0 84 -120 92 -204 104', '#c9352b', 4);
      line(g, 'M-204 104 L-216 96 M-204 104 L-218 108 M-204 104 L-214 116', '#c9352b', 2.4);
      // the impulse's direction
      line(g, head(-80, -102, -140, -104, 14), '#2b6cc4', 3); line(g, head(40, -97, -20, -99, 14), '#2b6cc4', 3);
      line(g, head(40, 81, 100, 76, 14), '#c9352b', 3); line(g, head(-110, 91, -50, 87, 14), '#c9352b', 3);
      if (lab(o)) {
        L(g, -276, -192, 'heat', '#c0392b', 18);
        tag(g, -262, -54, -262, 0, 'receptor in skin', BLUEI, 17);
        L(g, -40, -118, 'sensory neuron', BLUEI);
        L(g, 240, -100, 'spinal cord', '#6b5a7a');
        tag(g, 232, -14, 340, -40, 'relay neuron', '#6b3f8a', 17);
        L(g, -40, 116, 'motor neuron', REDI);
        L(g, -275, 170, 'muscle (effector)', '#7a2f24');
      }
      return g;
    },

    // "dnaladder cx cy height lab=1" — DNA unzipped into a ladder: sugar-phosphate backbones, A–T and G–C base pairs
    dnaladder: ([cx, cy, S = 420], o, t, parent) => {
      const g = G(cx, cy, S, 420, o, parent);
      const C = { A: ['#e05a4f', '#8a2a22'], T: ['#f3c33b', '#8a6414'], G: ['#4f8fd6', '#1f4f8f'], C: ['#5fae3a', '#24561c'] };
      const pairs = ['AT', 'GC', 'TA', 'CG', 'AT', 'GC'], ys = pairs.map((p, i) => -150 + i * 60);
      // backbones: phosphate circles joined to sugar pentagons
      for (const s of [-1, 1]) {
        line(g, `M${s * 112} -180 L${s * 112} 180`, '#8a6414', 3);
        ys.forEach(y => { part(g, ell(s * 112, y - 30, 9), '#ffd84a', '#8a6414', 2);
          part(g, `M${s * 112} ${y - 14} L${s * 126} ${y - 4} L${s * 121} ${y + 12} L${s * 103} ${y + 12} L${s * 98} ${y - 4} Z`, '#f4a531', '#8a5a14', 2); });
      }
      // bases: each pair meets in the middle, joined by hydrogen bonds (2 for A–T, 3 for G–C)
      pairs.forEach(([a, b], i) => {
        const y = ys[i];
        part(g, `M-98 ${y - 11} L-10 ${y - 11} L-10 ${y + 11} L-98 ${y + 11} Z`, C[a][0], C[a][1], 2.2);
        part(g, `M10 ${y - 11} L98 ${y - 11} L98 ${y + 11} L10 ${y + 11} Z`, C[b][0], C[b][1], 2.2);
        L(g, -54, y + 8, a, '#ffffff', 22); L(g, 54, y + 8, b, '#ffffff', 22);
        const n = a === 'A' || a === 'T' ? [-5, 5] : [-7, 0, 7];
        line(g, n.map(d => `M-9 ${y + d} L9 ${y + d}`).join(' '), '#555', 1.6, { 'stroke-dasharray': '2 3' });
      });
      if (lab(o)) {
        tag(g, 126, -180, 175, -170, 'backbone: sugar + phosphate', '#8a5a14', 17);
        tag(g, 98, -30, 175, -30, 'base pair', '#444', 17);
        tag(g, 0, 145, 0, 196, 'hydrogen bonds hold the pairs', '#555', 16);
        L(g, -260, 0, 'A pairs with T', '#8a2a22', 18, 'start'); L(g, -260, 30, 'G pairs with C', '#1f4f8f', 18, 'start');
      }
      return g;
    },

    // "cellcycle cx cy width lab=1" — mitosis in a row: interphase, prophase, metaphase, anaphase, telophase, two daughter cells
    cellcycle: ([cx, cy, W = 860], o, t, parent) => {
      const g = G(cx, cy, W, 860, o, parent);
      const ks = ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'daughters'];
      const names = ['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', '2 new cells'];
      ks.forEach((k, i) => {
        const x = -360 + i * 144;
        RECIPES.mitosis([x, 0, 120], { k }, '', g);
        if (i < 5) arrow(g, `M${x + 58} -52 Q${x + 72} -66 ${x + 86} -52`, x + 86, -52, x + 78, -62, '#8a96a3', 2.4, 9);
        if (lab(o)) { L(g, x, 66, names[i], '#444', 18); L(g, x, -64, String(i + 1), '#8a96a3', 16); }
      });
      return g;
    },

    // "leafsection cx cy width lab=1" — leaf cross-section: cuticle, epidermis, palisade, spongy layer, vein, stoma, gases
    leafsection: ([cx, cy, W = 600], o, t, parent) => {
      const g = G(cx, cy, W, 640, o, parent), X0 = -300, X1 = 120;
      const box = (x, y, w, h, r = 6) => `M${x + r} ${y} L${x + w - r} ${y} Q${x + w} ${y} ${x + w} ${y + r} L${x + w} ${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} L${x + r} ${y + h} Q${x} ${y + h} ${x} ${y + h - r} L${x} ${y + r} Q${x} ${y} ${x + r} ${y} Z`;
      fill(g, `M${X0} -122 L${X1} -122 L${X1} 106 L${X0} 106 Z`, '#eef6dc');                  // air spaces
      line(g, `M${X0} -124 L${X1} -124`, '#c9a227', 4);                                       // waxy cuticle
      for (let x = X0; x < X1; x += 42) part(g, box(x + 1, -120, 40, 26), '#f4f8ec', '#5c8a3a', 2);   // upper epidermis
      for (let x = X0; x < X1; x += 30) {                                                       // palisade
        part(g, box(x + 2, -90, 26, 78, 12), '#b5dc8a', '#3f7a26', 2);
        for (const y of [-78, -62, -46, -30]) fill(g, ell(x + 15 + (y % 3) * 2, y, 4.5, 3.5), '#3f9a2c');
      }
      for (const [x, y, rx, ry] of [[-282, 12, 18, 14], [-246, 40, 16, 13], [-210, 8, 20, 14], [-176, 46, 18, 14], [-140, 14, 17, 13], [-104, 50, 16, 12],
                                    [-70, 10, 19, 14], [-30, 18, 16, 13], [-282, 60, 14, 12], [-214, 66, 15, 11], [-140, 70, 14, 11], [-56, 62, 14, 12], [104, 62, 12, 10]])
        { part(g, ell(x, y, rx, ry), '#cfe8a8', '#5c8a3a', 2); fill(g, ell(x - 4, y - 2, 3.5, 2.6), '#3f9a2c'); fill(g, ell(x + 5, y + 3, 3.5, 2.6), '#3f9a2c'); }
      // vein: xylem (water, blue) above phloem (sugar, orange)
      part(g, ell(70, 30, 30, 26), '#f1ead2', '#7a6428', 2.4);
      for (const [x, y] of [[58, 20], [74, 16], [88, 24]]) part(g, ell(x, y, 6), '#9cc0ec', BLUEI, 1.6);
      for (const [x, y] of [[60, 40], [76, 44], [88, 38]]) part(g, ell(x, y, 5), '#f6cf7a', '#9a6a14', 1.6);
      // lower epidermis with a stoma (two guard cells round the pore)
      for (let x = X0; x < X1; x += 42) if (x < -20 || x > 30) part(g, box(x + 1, 82, 40, 24), '#f4f8ec', '#5c8a3a', 2);
      part(g, 'M-12 84 C-4 84 2 92 2 96 C2 100 -4 106 -12 106 C-22 106 -22 84 -12 84 Z', '#8ccf5c', '#3f7a26', 2);
      part(g, 'M30 84 C22 84 16 92 16 96 C16 100 22 106 30 106 C40 106 40 84 30 84 Z', '#8ccf5c', '#3f7a26', 2);
      line(g, `M${X0} 108 L${X1} 108`, '#c9a227', 3);
      // light in at the top; carbon dioxide in and oxygen + water vapour out through the stoma
      arrow(g, 'M-250 -200 L-210 -136', -210, -136, -250, -200, '#d18b00', 3);
      arrow(g, 'M-40 176 C-30 150 -6 130 4 104', 4, 104, -6, 130, '#5a6a7a', 3);
      arrow(g, 'M14 104 C30 130 52 150 70 176', 70, 176, 52, 150, '#2b6cc4', 3);
      if (lab(o)) {
        L(g, -262, -206, 'light', '#d18b00', 18, 'end');
        L(g, -46, 196, 'CO₂ in', '#5a6a7a', 18, 'end'); L(g, 76, 196, 'O₂ + water out', '#2b6cc4', 18, 'start');
        tag(g, X1, -124, 150, -140, 'waxy cuticle', '#8a6a14', 17);
        tag(g, X1, -107, 150, -107, 'upper epidermis', '#3f7a26', 17);
        tag(g, X1, -50, 150, -60, 'palisade layer (most chloroplasts)', '#3f7a26', 17);
        tag(g, 104, 62, 150, 74, 'spongy layer + air spaces', '#3f7a26', 17);
        tag(g, 100, 30, 150, 30, 'vein: xylem + phloem', '#7a6428', 17);
        tag(g, X1, 96, 150, 110, 'lower epidermis', '#3f7a26', 17);
        tag(g, 24, 106, 150, 146, 'stoma + guard cells', '#3f7a26', 17);
      }
      return g;
    },

    // "plantparts cx cy height lab=1" — flowering plant: flower, bud, leaves, stem, roots, root hairs
    plantparts: ([cx, cy, S = 440], o, t, parent) => {
      const g = G(cx, cy, S, 440, o, parent);
      // soil, stem and roots
      fill(g, 'M-170 92 L170 92 L170 210 L-170 210 Z', '#e8d5b5'); line(g, 'M-170 92 L170 92', '#8a6a3a', 3);
      line(g, 'M0 90 C-4 20 6 -60 0 -112', '#3f7a26', 7);
      line(g, 'M2 -40 C30 -60 50 -80 62 -104', '#3f7a26', 5);
      line(g, 'M0 92 C2 130 -2 170 0 200 M0 120 C-30 140 -60 150 -90 180 M0 130 C30 150 70 160 96 190 M-2 160 C-20 176 -40 186 -54 204 M0 150 C20 166 36 180 44 202', '#8a5a2a', 3.4);
      line(g, 'M84 178 l-4 -9 M90 184 l6 -8 M76 172 l-7 -6 M92 188 l9 -3 M70 166 l-3 -9', '#8a5a2a', 1.5);
      // leaves on the stem
      RECIPES.leaf([-64, 10, 130], { rot: 200 }, '', g);
      RECIPES.leaf([62, 40, 130], { rot: -20 }, '', g);
      RECIPES.leaf([-56, -76, 100], { rot: 210 }, '', g);
      // flower and a bud
      for (let i = 0; i < 6; i++) part(mk('g', { transform: `rotate(${i * 60} 0 -160)` }, g), 'M0 -160 C-20 -174 -18 -204 0 -212 C18 -204 20 -174 0 -160 Z', '#f6a6c1', '#a8406a', 2.2);
      part(g, ell(0, -160, 16), '#ffd84a', '#b5651d', 2.4);
      part(g, 'M62 -104 C50 -110 52 -132 66 -142 C78 -128 76 -110 62 -104 Z', '#f6a6c1', '#3f7a26', 2.2);
      line(g, 'M56 -108 C58 -116 62 -120 62 -120 M68 -108 C66 -116 64 -120 64 -120', '#3f7a26', 2);
      if (lab(o)) {
        tag(g, 40, -180, 110, -200, 'flower', '#a8406a');
        tag(g, 70, -126, 130, -140, 'bud', '#a8406a');
        tag(g, 100, 34, 160, 0, 'leaf', '#2c6a22');
        tag(g, 3, -92, -150, -140, 'stem', '#2c6a22');
        tag(g, -60, 160, -150, 140, 'roots', '#8a5a2a');
        tag(g, 92, 182, 160, 150, 'root hairs', '#8a5a2a', 17);
        L(g, 150, 116, 'soil', '#8a6a3a', 17, 'start');
      }
      return g;
    },
  });
})();
