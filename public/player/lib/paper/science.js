// Paper-motion library: science. Each drawing is "name x y scale" (+ rot=deg, k=variant), drawn around (x, y),
// about 300-400 px across at scale 1, alive in t. Flat cut-paper shapes, ~3 px darker edges, nothing written.
(() => {
const ell = (x, y, rx, ry, rot, fill, edge, lw = 3) => { cx.beginPath(); cx.ellipse(x, y, Math.max(rx, 0), Math.max(ry, 0), rot, 0, TAU);
  if (fill) { cx.fillStyle = fill; cx.fill(); } if (edge) { cx.strokeStyle = edge; cx.lineWidth = lw; cx.stroke(); } };
const shape = (draw, fill, edge, lw = 3) => { cx.beginPath(); draw(); if (fill) { cx.fillStyle = fill; cx.fill(); }
  if (edge) { cx.strokeStyle = edge; cx.lineWidth = lw; cx.lineJoin = 'round'; cx.stroke(); } };
const line2 = (pts, col, w, opt = {}) => { path(pts, opt.under || 'rgba(20,24,48,.55)', w + 5, opt); path(pts, col, w, opt); };   // reads on light and dark scenes
const hi = (x, y, r) => circ(x, y, r, 'rgba(255,255,255,.4)');
const tri = u => Math.abs(((u % 2) + 2) % 2 - 1);
const S = Math.sin, C = Math.cos;
const arcPts = (x, y, rx, ry, a0, a1, n = 32) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [x + C(a) * rx, y + S(a) * ry]; });
// place a drawing: translate (with the boil), rotate, scale; the drawing works around 0,0
const put = fn => (a, t, f) => { const [x = 480, y = 300, s = 1] = a.v; cx.save(); cx.translate(x + jig(f, 1), y + jig(f, 2));
  if (a.rot) cx.rotate(a.rot * Math.PI / 180); cx.scale(s, s); try { fn(a, t, f); } finally { cx.restore(); } };

const ATOMC = { O: ['#e05a4f', '#7a2a24', 46], H: ['#f6f4f0', '#5a5348', 30], C: ['#4a4f60', '#1a1d30', 44], N: ['#4f7fd8', '#1f3f78', 44] };
const MOLS = {
  water: { a: [['O', 0, -14], ['H', -64, 38], ['H', 64, 38]], b: [[0, 1, 1], [0, 2, 1]] },
  co2: { a: [['O', -112, 0], ['C', 0, 0], ['O', 112, 0]], b: [[0, 1, 2], [1, 2, 2]] },
  o2: { a: [['O', -46, 0], ['O', 46, 0]], b: [[0, 1, 2]] },
  methane: { a: [['C', 0, 0], ['H', 0, -92], ['H', 88, 26], ['H', -88, 26], ['H', 0, 92]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
  ammonia: { a: [['N', 0, -10], ['H', -82, 36], ['H', 82, 36], ['H', 0, 90]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
};

// planets: base, edge, bands [y, h, colour], features [u, y, rx, ry, colour], ring [rx, ry, rot, width, colour, edge]
const PLANETS = {
  earth: { c: ['#3f7fd0', '#1f3f78'], feat: [[0, -30, 34, 26, '#5fae5f'], [.3, 25, 40, 30, '#5fae5f'], [.62, -10, 28, 40, '#5fae5f'], [.82, 40, 22, 16, '#5fae5f'], [.15, -62, 30, 7, '#f6f4f0'], [.5, 58, 34, 7, '#f6f4f0']], caps: '#f6f4f0' },
  mars: { c: ['#d0643a', '#6a2a14'], feat: [[0, 10, 30, 18, '#9a4024'], [.35, -20, 24, 14, '#9a4024'], [.7, 30, 36, 14, '#a84a2a']], caps: '#f6f4f0' },
  jupiter: { c: ['#e0b080', '#7a5030'], bands: [[-70, 16, '#c0805a'], [-35, 14, '#f0d8b0'], [-8, 18, '#c48a60'], [26, 14, '#f0d8b0'], [56, 16, '#b8784e']], feat: [[.2, 34, 22, 12, '#c0503a']] },
  saturn: { c: ['#e8cc88', '#8a6a2a'], bands: [[-50, 14, '#d8b06a'], [-12, 16, '#f2e0b0'], [30, 14, '#d0a460']], feat: [], ring: [190, 44, -.22, 22, '#d8c08a', '#8a6a2a'] },
  venus: { c: ['#e8c870', '#8a6a1a'], bands: [[-40, 10, '#f2dca0'], [10, 12, '#d8b458'], [50, 10, '#f2dca0']], feat: [[.4, -10, 40, 10, '#f2dca0']] },
  mercury: { c: ['#9a9590', '#4a4540'], feat: [[0, -20, 16, 16, '#7a7570'], [.25, 30, 12, 12, '#7a7570'], [.5, -40, 10, 10, '#7a7570'], [.75, 10, 20, 20, '#7a7570']] },
  moon: { c: ['#c9c6bc', '#5a5750'], feat: [[0, -24, 22, 18, '#a8a59a'], [.3, 28, 16, 14, '#a8a59a'], [.55, -40, 12, 12, '#a8a59a'], [.8, 14, 26, 20, '#a8a59a']] },
  uranus: { c: ['#8fd8e0', '#2a7a88'], bands: [[-30, 10, '#a8e4ea'], [30, 10, '#7ac8d2']], feat: [[.5, 0, 30, 8, '#a8e4ea']] },
  neptune: { c: ['#3f5fd0', '#1a2a78'], bands: [[-45, 12, '#5a7ae0'], [20, 10, '#3450b8']], feat: [[.3, -10, 20, 12, '#22307a'], [.7, 40, 14, 6, '#c8d8f8']] },
};
function planet(k, t, r = 100) { const P = PLANETS[k] || PLANETS.earth, [fill, edge] = P.c, R = P.ring;
  const ring = (a0, a1) => { const pts = arcPts(0, 0, R[0], R[1], a0, a1, 40).map(([x, y]) => [x * C(R[2]) - y * S(R[2]), x * S(R[2]) + y * C(R[2])]);
    path(pts, R[5], R[3] + 6); path(pts, R[4], R[3]); path(pts, R[5], 2, { alpha: .5 }); };
  if (R) ring(Math.PI, TAU);                                                    // the far half of the ring, behind the ball
  cx.save(); cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.clip(); circ(0, 0, r, fill);
  (P.bands || []).forEach(([y, h, c]) => { cx.fillStyle = c; cx.fillRect(-r, y * r / 100 - h / 2, 2 * r, h); });
  P.feat.forEach(([u, y, rx, ry, c]) => { const x = (((u + t * .06) % 1) * 2.6 - 1.3) * r; ell(x, y * r / 100, rx * r / 100, ry * r / 100, 0, c, c === '#f6f4f0' ? null : 'rgba(0,0,0,.18)', 2); });
  if (P.caps) { ell(0, -r * .98, r * .45, r * .16, 0, P.caps); ell(0, r * .98, r * .35, r * .12, 0, P.caps); }
  cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.arc(-r * .28, -r * .22, r * 1.02, 0, TAU); cx.fillStyle = 'rgba(10,15,50,.22)'; cx.fill('evenodd');
  cx.restore(); hi(-r * .4, -r * .4, r * .18); circ(0, 0, r, null, edge, 3.5);
  if (R) ring(0, Math.PI); }

function moonLit(r, p) { const side = p < .5 ? 1 : -1, k = C(p * TAU);              // p: 0 new, .25 first quarter, .5 full, .75 last quarter
  cx.beginPath(); cx.moveTo(0, -r); cx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, side < 0);
  cx.ellipse(0, 0, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === (side > 0)); cx.closePath(); }
function moonDisc(r, p) { circ(0, 0, r, '#3a4050', '#1a1d30', 3); cx.save(); moonLit(r, p); cx.fillStyle = '#f2eedc'; cx.fill(); cx.clip();
  [[-.35, -.3, .2], [.3, .2, .15], [-.1, .45, .12], [.4, -.4, .1]].forEach(([x, y, q]) => circ(x * r, y * r, q * r, '#d8d2bc')); cx.restore(); circ(0, 0, r, null, '#1a1d30', 3); }

function gear(n, r, fill, edge, ang) { const s = TAU / n, pts = [];
  for (let i = 0; i < n; i++) { const a = i * s; [[0, r - 11], [.15, r + 11], [.45, r + 11], [.6, r - 11]].forEach(([q, R]) => pts.push([C(a + q * s + ang) * R, S(a + q * s + ang) * R])); }
  poly(pts, fill, edge, 3); circ(0, 0, r * .62, null, edge, 2.5);
  for (let i = 0; i < 4; i++) { const a = ang + i * TAU / 4; circ(C(a) * r * .38, S(a) * r * .38, r * .12, mix(fill, edge, .45)); }
  circ(0, 0, r * .14, edge); }

const RUNG = [['#e05a4f', '#4fa3d8'], ['#f6d65a', '#6fbf73'], ['#4fa3d8', '#e05a4f'], ['#6fbf73', '#f6d65a']];
const STARC = { yellow: ['#f6d65a', '#c98a1a', '#fff3a8'], white: ['#f6f4f0', '#8a93a6', '#ffffff'], red: ['#ee6a3a', '#7a2a14', '#ffb08a'], blue: ['#8fc0f8', '#2a4f9a', '#cfe4ff'] };
const sparkle = (L, w) => { const pts = []; for (let i = 0; i < 8; i++) { const a = i * TAU / 8 - Math.PI / 2, R = i % 2 ? w : L; pts.push([C(a) * R, S(a) * R]); } return pts; };

// butterfly life-cycle stages, each about 260 px across
const leafShape = (L, w) => shape(() => { cx.moveTo(-L, 0); cx.quadraticCurveTo(0, -w, L, 0); cx.quadraticCurveTo(0, w, -L, 0); }, '#6fbf73', '#2f6b3a', 3.5);
const STAGE = {
  egg: (t, f) => { leafShape(130, 110); path([[-120, 0], [118, 0]], '#2f6b3a', 3);
    [[-30, -14], [0, -18], [30, -14], [-16, 12], [16, 12]].forEach(([x, y], i) => { cx.save(); cx.translate(x + jig(f, i), y); cx.rotate(S(t * 3 + i) * .08); ell(0, 0, 13, 16, 0, '#f6f0c8', '#8a8a4a', 2.5); hi(-4, -6, 4); cx.restore(); }); },
  caterpillar: (t, f) => { path([[-140, 40], [140, 40]], '#6b4c33', 10);
    for (let i = 6; i >= 0; i--) { const x = -96 + i * 30 + S(t * 2) * 6, y = 18 - 16 * Math.max(0, S(t * 4 - i * .8)), r = i === 6 ? 25 : 21;
      circ(x + jig(f, i), y, r, i === 6 ? '#5fae5f' : i % 2 ? '#f6d65a' : '#6fbf73', '#2f6b3a', 3);
      if (i === 6) { circ(x + 9, y - 6, 5, '#1a1a1a'); path([[x + 4, y - 22], [x + 10, y - 38]], '#2f6b3a', 3); } else path([[x - 4, y + 18], [x - 6, y + 22]], '#2f6b3a', 3); } },
  chrysalis: (t, f) => { path([[-130, -110], [130, -110]], '#6b4c33', 12); cx.save(); cx.translate(0, -104); cx.rotate(S(t * 1.5) * .12);
    shape(() => { cx.moveTo(0, 0); cx.bezierCurveTo(46, 30, 52, 140, 0, 190); cx.bezierCurveTo(-52, 140, -46, 30, 0, 0); }, '#7cc47f', '#2f6b3a', 3.5);
    path([[-30, 70], [30, 70]], '#2f6b3a', 2.5); for (let i = -2; i <= 2; i++) circ(i * 10, 70, 3.5, '#f2c230'); cx.restore(); },
  adult: (t, f) => { const fl = .2 + .8 * Math.abs(C(t * 4.5)); cx.translate(0, S(t * 4.5) * 6);
    for (const sd of [-1, 1]) { cx.save(); cx.scale(sd * fl, 1);
      shape(() => { cx.moveTo(4, -8); cx.bezierCurveTo(60, -120, 150, -100, 128, -30); cx.bezierCurveTo(118, 0, 60, 4, 4, 0); }, '#f29a52', '#7a3a14', 3.5);
      shape(() => { cx.moveTo(4, 4); cx.bezierCurveTo(90, 10, 120, 70, 80, 96); cx.bezierCurveTo(50, 112, 20, 60, 4, 14); }, '#e8783a', '#7a3a14', 3.5);
      circ(92, -56, 13, '#f6f4f0', '#7a3a14', 2.5); circ(62, 52, 9, '#f6f4f0', '#7a3a14', 2.5); cx.restore(); }
    ell(0, 4, 9, 54, 0, '#3a2a20', '#1a1210', 2.5); circ(0, -54, 11, '#3a2a20');
    for (const sd of [-1, 1]) { path([[0, -60], [sd * 18, -94], [sd * 28, -104]], '#3a2a20', 3); circ(sd * 28, -104, 5, '#3a2a20'); } },
};

Object.assign(LIB, {
  atom: put((a, t) => {
    for (let k = 0; k < 3; k++) { cx.save(); cx.rotate(k * Math.PI / 3); ell(0, 0, 150, 50, 0, null, 'rgba(20,24,60,.5)', 8); ell(0, 0, 150, 50, 0, null, '#f6f4f0', 3.5); cx.restore(); }
    const p = 1 + .05 * S(t * 4);
    [[0, 0, 0], [-15, -10, 1], [15, -12, 0], [-14, 14, 0], [14, 12, 1], [0, -22, 1], [2, 21, 0]].forEach(([x, y, n]) => { circ(x * p, y * p, 15, n ? '#9aa0aa' : '#e05a4f', n ? '#4a4f60' : '#7a2a24', 3); hi(x * p - 5, y * p - 5, 4); });
    for (let k = 0; k < 3; k++) { const th = t * (1.7 + .35 * k) + k * 2.1, ex = C(th) * 150, ey = S(th) * 50, r = k * Math.PI / 3;
      circ(ex * C(r) - ey * S(r), ex * S(r) + ey * C(r), 12, '#f6d65a', '#8a6414', 3); } }),

  molecule: put((a, t) => { const M = MOLS[a.k] || MOLS.water; cx.translate(0, S(t * 2) * 6); cx.rotate(S(t * 1.2) * .12);
    const P = M.a.map(([e, x, y], i) => { const v = 1 + .04 * S(t * 6 + i); return [e, x * v, y * v]; });
    M.b.forEach(([i, j, n]) => { for (let q = 0; q < n; q++) { const o = n > 1 ? (q - .5) * 18 : 0, [, x1, y1] = P[i], [, x2, y2] = P[j], L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L * o, ny = (x2 - x1) / L * o;
      path([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny]], '#3a3a3a', 15); path([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny]], '#d8d2c4', 8); } });
    P.forEach(([e, x, y]) => { const [fl, ed, r] = ATOMC[e]; circ(x, y, r, fl, ed, 3.5); hi(x - r * .32, y - r * .32, r * .22); }); }),

  magnet: put((a, t, f) => {
    for (let k = 1; k <= 3; k++) for (const sd of [-1, 1]) { const h = 30 + k * 42, w = 130 + k * 34, pts = [];
      for (let i = 0; i <= 28; i++) { const u = i / 28, v = 1 - u; pts.push([v ** 3 * 120 + 3 * v * v * u * (120 + w * .7) - 3 * v * u * u * (120 + w * .7) - u ** 3 * 120, sd * ((3 * v * v * u + 3 * v * u * u) * h * 1.25 + 8)]); }
      line2(pts, '#f6f4f0', 3, { alpha: .9 }); for (let j = 0; j < 2; j++) circ(...along(pts, (t * .25 + j / 2 + k * .2) % 1), 5, '#f6d65a', '#8a6414', 2); }
    rrect(-130, -34, 130, 68, [10, 0, 0, 10], '#4f7fd8', '#1f3f78', 3.5); rrect(0, -34, 130, 68, [0, 10, 10, 0], '#e05a4f', '#7a2a24', 3.5);
    rrect(-118, -24, 236, 10, 5, 'rgba(255,255,255,.35)'); }),

  circuit: put((a, t) => { const L = [[-150, -90], [150, -90], [150, 90], [-150, 90], [-150, -90]];
    path(L, '#3a3a3a', 11); path(L, '#d08a4a', 5);
    for (let i = 0; i < 10; i++) circ(...along(L, (t * .12 + i / 10) % 1), 7, '#f6d65a', '#8a6414', 2.5);
    rrect(-52, 74, 104, 32, 8, '#4a4f60', '#1a1d30', 3); rrect(16, 74, 36, 32, [0, 8, 8, 0], '#f29a52', '#1a1d30', 3); rrect(52, 82, 10, 16, 3, '#c9c4ba', '#1a1d30', 2.5);
    rrect(-18, -112, 36, 28, 5, '#9aa0aa', '#3a4050', 3); path([[-18, -102], [18, -102]], '#3a4050', 2.5);
    const g = .5 + .5 * S(t * 5); cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 30 + 25 * g; circ(0, -148, 40, mix('#f6e27a', '#fff8d0', g), '#a8761a', 3.5); cx.restore();
    path([[-10, -114], [-10, -142], [-5, -152], [0, -142], [5, -152], [10, -142], [10, -114]], '#a8640a', 3); hi(-14, -162, 8); }),

  battery: put((a, t) => { const lv = .25 + .75 * ((t * .3) % 1);
    rrect(-16, -118, 32, 22, 5, '#c9c4ba', '#5a5348', 3); rrect(-48, -102, 96, 204, 14, '#4a4f60', '#1a1d30', 3.5); rrect(-48, -102, 96, 52, [14, 14, 0, 0], '#f29a52', '#1a1d30', 3.5);
    rrect(-26, -32, 52, 116, 8, '#1a1d30'); rrect(-20, 78 - 104 * lv, 40, 104 * lv, 5, lv < .4 ? '#e05a4f' : '#6fbf73'); rrect(-40, -94, 10, 184, 5, 'rgba(255,255,255,.25)'); }),

  lightning: put((a, t) => { const fl = .5 + .5 * S(t * 23) * S(t * 7);
    soft([[0, 0, 120, '#fff3a8']]); cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 20 + 30 * fl; cx.globalAlpha = .7 + .3 * fl;
    poly([[22, -160], [-62, 14], [-6, 14], [-44, 160], [74, -34], [16, -34], [54, -160]], '#f6d65a', '#a8640a', 4); cx.restore();
    path([[-30, 60], [-80, 90], [-90, 130]], '#f6d65a', 5, { alpha: fl }); }),

  soundwave: put((a, t) => {
    for (let i = 0; i < 5; i++) { const u = (t * .45 + i / 5) % 1, r = 50 + u * 190; cx.save(); cx.globalAlpha = 1 - u;
      line2(arcPts(-110, 0, r, r, -.6, .6, 20), '#f29a52', 5, { under: '#7a3a14' }); cx.restore(); }
    rrect(-170, -36, 44, 72, 6, '#4a4f60', '#1a1d30', 3); poly([[-128, -32], [-80, -84 - 3 * S(t * 30)], [-80, 84 + 3 * S(t * 30)], [-128, 32]], '#8a93a6', '#3a4050', 3); }),

  prism: put((a, t) => { const T = [[0, -120], [-125, 95], [125, 95]], E = [-62, -12];
    RAIN.forEach((c, i) => { const X = along([T[0], T[2]], .45 + i * .035), an = .1 + i * .075 + .02 * S(t * 2 + i); path([X, [X[0] + C(an) * 250, X[1] + S(an) * 250]], c, 8); });
    poly(T, 'rgba(205,232,250,.6)', null);
    RAIN.forEach((c, i) => path([E, along([T[0], T[2]], .45 + i * .035)], c, 3, { alpha: .9 }));
    path([[-270, 40], E], 'rgba(20,24,60,.5)', 13); path([[-270, 40], E], '#ffffff', 8);
    circ(...along([[-270, 40], E], (t * .8) % 1), 7, '#fff3a8');
    poly(T, null, '#2f5a8a', 4); path([[-20, -80], [-70, 10]], 'rgba(255,255,255,.7)', 5); }),

  lens: put((a, t, f) => { const F = [170, 0];
    [-72, -36, 0, 36, 72].forEach((y, i) => { const R = [[-250, y], [0, y], F, [270, -y * 100 / 170]]; line2(R, '#f6d65a', 4, { under: 'rgba(90,58,10,.6)' }); circ(...along(R, (t * .3 + i * .13) % 1), 6, '#fff8d0', '#a8761a', 2); });
    shape(() => { cx.moveTo(0, -115); cx.quadraticCurveTo(48, 0, 0, 115); cx.quadraticCurveTo(-48, 0, 0, -115); }, 'rgba(205,232,250,.65)', '#2f5a8a', 4);
    path([[-8, -70], [-12, -10]], 'rgba(255,255,255,.75)', 5);
    cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 25; circ(...F, 10 + 4 * S(t * 5), '#fff8d0', '#a8761a', 2.5); cx.restore(); }),

  planet: put((a, t) => planet(a.k || 'earth', t)),

  solarsystem: put((a, t) => { const O = [[70, 7, '#9a9590', '#4a4540'], [105, 10, '#e8c870', '#8a6a1a'], [145, 12, '#3f7fd0', '#1f3f78'], [185, 9, '#d0643a', '#6a2a14'], [235, 20, '#e0b080', '#7a5030']];
    O.forEach(([R]) => { const pts = arcPts(0, 0, R, R * .38, 0, TAU, 60); path(pts, 'rgba(20,24,60,.35)', 5); path(pts, 'rgba(255,255,255,.8)', 2); });
    const P = O.map(([R, r, c, e], i) => { const th = t * 1.4 / (R / 70) ** 1.5 + i * 1.9; return [C(th) * R, S(th) * R * .38, r, c, e]; });
    const draw = ([x, y, r, c, e]) => { circ(x, y, r, c, e, 2.5); hi(x - r * .35, y - r * .35, r * .25); };
    P.filter(p => p[1] < 0).forEach(draw);
    cx.save(); cx.rotate(t * .3); for (let i = 0; i < 10; i++) { cx.rotate(TAU / 10); poly([[44, -7], [60, 0], [44, 7]], '#f6d65a', '#c98a1a', 2); } cx.restore();
    cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 30; circ(0, 0, 42, '#f6d65a', '#c98a1a', 3.5); cx.restore(); hi(-14, -14, 9);
    P.filter(p => p[1] >= 0).forEach(draw); }),

  moonphase: put((a, t) => { if (!a.row) return moonDisc(110, a.p ?? (t * .12 + .15) % 1);
    const on = Math.floor(t * 1.5) % 8;
    for (let i = 0; i < 8; i++) { cx.save(); cx.translate(-350 + i * 100, 0); if (i === on) circ(0, 0, 50, null, '#f6d65a', 5); moonDisc(40, i / 8); cx.restore(); } }),

  rocket: put((a, t) => { cx.translate(S(t * 31) * 1.5, S(t * 2) * 6);
    for (let i = 0; i < 4; i++) { const u = (t * .7 + i / 4) % 1; cx.save(); cx.globalAlpha = 1 - u; circ((i - 1.5) * 36 * u, 200 + u * 50, 14 + 20 * u, '#e6e2da', '#8a93a6', 3); cx.restore(); }
    const fl = 1 + .18 * S(t * 25) + .1 * S(t * 41);
    shape(() => { cx.moveTo(-24, 76); cx.quadraticCurveTo(-24, 76 + 60 * fl, 0, 76 + 110 * fl); cx.quadraticCurveTo(24, 76 + 60 * fl, 24, 76); }, '#f29a52', '#a8400a', 3);
    shape(() => { cx.moveTo(-12, 76); cx.quadraticCurveTo(-12, 76 + 36 * fl, 0, 76 + 64 * fl); cx.quadraticCurveTo(12, 76 + 36 * fl, 12, 76); }, '#f6d65a');
    for (const sd of [-1, 1]) poly([[sd * 38, 0], [sd * 82, 62], [sd * 82, 92], [sd * 38, 60]], '#e05a4f', '#7a2a24', 3.5);
    rrect(-26, 58, 52, 20, 5, '#8a93a6', '#3a4050', 3);
    const body = () => { cx.moveTo(0, -150); cx.bezierCurveTo(50, -110, 42, -40, 40, 64); cx.lineTo(-40, 64); cx.bezierCurveTo(-42, -40, -50, -110, 0, -150); };
    shape(body, '#f6f4f0'); cx.save(); shape(body); cx.clip(); cx.fillStyle = '#e05a4f'; cx.fillRect(-60, -160, 120, 66); cx.restore(); shape(body, null, '#3a4050', 3.5);
    path([[-46, -94], [46, -94]], '#7a2a24', 3); circ(0, -38, 19, '#4fa3d8', '#1f3f78', 5); hi(-6, -44, 6); }),

  satellite: put((a, t) => { cx.translate(0, S(t * 1.6) * 8); cx.rotate(S(t * .7) * .2);
    for (let i = 0; i < 4; i++) { const u = (t * .6 + i / 4) % 1, r = 24 + u * 96; cx.save(); cx.globalAlpha = .35 + .65 * (1 - u); cx.lineCap = 'round';
      line2(arcPts(0, -74, r, r, -Math.PI * .78, -Math.PI * .22, 16), '#f6d65a', 7, { under: '#1a2a78' }); cx.restore(); }
    path([[-190, 0], [190, 0]], '#3a4050', 6);
    for (const sd of [-1, 1]) { const x0 = sd < 0 ? -190 : 52; rrect(x0, -26, 138, 52, 3, '#3f5fd0', '#1a2a78', 3);
      for (let i = 1; i < 4; i++) path([[x0 + i * 34.5, -24], [x0 + i * 34.5, 24]], '#8fb0f0', 2); path([[x0 + 2, 0], [x0 + 136, 0]], '#8fb0f0', 2); }
    rrect(-38, -34, 76, 68, 6, '#f2c230', '#8a6414', 3.5); path([[-24, -34], [-10, 34]], '#c8961a', 2.5); path([[12, -34], [22, 34]], '#c8961a', 2.5);
    path([[0, -34], [0, -50]], '#3a4050', 4); shape(() => cx.ellipse(0, -58, 26, 10, 0, 0, Math.PI), '#e6e2da', '#3a4050', 3); circ(0, -70, 4, '#3a4050'); }),

  brightstar: put((a, t) => { const [fill, edge, glow] = STARC[a.k] || STARC.yellow, tw = .85 + .15 * S(t * 4);
    cx.save(); cx.shadowColor = glow; cx.shadowBlur = 40; cx.rotate(t * .2);
    poly(sparkle(120 * tw, 20), fill, edge, 3); cx.restore();
    circ(0, 0, 42, fill, edge, 3.5); hi(-12, -12, 10);
    [[-130, -90, 1], [120, 100, 2], [140, -70, 3]].forEach(([x, y, i]) => { const k = .5 + .5 * S(t * 3 + i * 2); cx.save(); cx.translate(x, y); cx.scale(k, k); poly(sparkle(22, 6), fill, edge, 2); cx.restore(); }); }),

  galaxy: put((a, t) => { const Y = .78, r = rng(7), sp = t * .3, arms = 3, at = (arm, i) => { const an = arm * TAU / arms + i * .075 + sp, R = 34 + i * 4.6; return [C(an) * R, S(an) * R * Y]; };
    const g = cx.createRadialGradient(0, 0, 8, 0, 0, 220); g.addColorStop(0, 'rgba(255,236,190,.95)'); g.addColorStop(.3, 'rgba(150,110,220,.5)'); g.addColorStop(1, 'rgba(70,40,140,0)');
    cx.save(); cx.scale(1, Y); circ(0, 0, 220, g); cx.restore();
    for (let arm = 0; arm < arms; arm++) { const pts = []; for (let i = 0; i <= 38; i++) pts.push(at(arm, i));
      cx.save(); cx.lineCap = 'round'; cx.filter = 'blur(6px)'; path(pts, '#7a5ac8', 34, { alpha: .55 }); cx.filter = 'none'; path(pts, '#b8a0f0', 6, { alpha: .6 }); cx.restore();
      for (let i = 1; i <= 38; i++) for (let q = 0; q < 2; q++) { const [x, y] = at(arm, i + r() - .5), j = (r() - .5) * (6 + i * .9), s = 7 - i * .13 - q * 2, c = (i + q) % 4 ? '#ffffff' : ((i + q) % 8 ? '#9fd0ff' : '#f6d65a');
        circ(x + j, y + (r() - .5) * (6 + i * .5), Math.max(1.6, s), c, '#3a1f78', 1.5); } }
    [[-150, -110, 0], [170, -90, 1], [150, 120, 2], [-170, 110, 3]].forEach(([x, y, i]) => { const k = .45 + .4 * S(t * 3 + i * 1.7); cx.save(); cx.translate(x, y); cx.scale(k, k); poly(sparkle(22, 6), '#fff3c4', '#c98a1a', 2); cx.restore(); });
    cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 40 + 10 * S(t * 2); circ(0, 0, 40, '#ffe9a8', '#c98a1a', 3.5); cx.restore(); circ(0, 0, 24, '#fffbea'); hi(-12, -12, 8); }),

  volcano: put((a, t) => { cx.translate(0, 80);
    for (let i = 0; i < 5; i++) { const u = (t * .3 + i / 5) % 1; cx.save(); cx.globalAlpha = 1 - u * .85; circ(S(u * 3 + i) * 18 - u * 50, -110 - u * 150, 10 + u * 14, '#8a8480', '#3a3430', 3); cx.restore(); }
    for (let i = 0; i < 7; i++) { const u = (t * .9 + i / 7) % 1; cx.save(); cx.shadowColor = '#f6a03a'; cx.shadowBlur = 14;
      circ((i - 3) * 42 * u, -60 - 380 * u + 340 * u * u, 10, '#f6a03a', '#a8400a', 2.5); cx.restore(); }
    poly([[-190, 110], [-54, -58], [54, -58], [190, 110]], '#8a5a3a', '#4a2a14', 3.5);
    poly([[-150, 60], [-80, -14], [-40, 0], [-110, 70]], '#a0704a'); ell(0, -58, 54, 12, 0, '#e0503a', '#4a2a14', 3);
    const k = ease(clamp(.3 + t / 1.6)), pulse = .5 + .5 * S(t * 5);
    ell(0, -58, 46, 9, 0, '#f6d65a'); cx.save(); cx.lineCap = 'round'; cx.lineJoin = 'round';
    for (const L of [[[-14, -54], [-40, -10], [-28, 30], [-70, 100]], [[18, -54], [44, 0], [34, 40], [84, 104]], [[0, -54], [6, -10], [-6, 40], [4, 104]]]) {
      const pts = upto(L, k); path(pts, '#7a2a0a', 30); path(pts, '#e0503a', 22); path(pts, '#f29a52', 13); path(pts, mix('#f6d65a', '#fff3c4', pulse), 5); }
    cx.restore(); }),

  earthlayers: put((a, t) => { const r = 125; planet('earth', t, r);
    const L = [[r, '#a07856'], [r * .9, '#e07a3a'], [r * .55, '#f2a830'], [r * .28, '#fff0a0']];
    L.forEach(([R, c], i) => { cx.save(); if (i === 3) { cx.shadowColor = '#fff3a8'; cx.shadowBlur = 20 + 15 * S(t * 3); }
      shape(() => { cx.moveTo(0, 0); cx.arc(0, 0, R, -Math.PI / 2, 0); cx.closePath(); }, c, '#4a2a14', 3); cx.restore(); }); }),

  tectonic: put((a, t) => { const apart = a.k !== 'together', dir = apart ? 1 : -1;
    rrect(-200, 20, 400, 100, 8, '#e07a3a', '#8a3a14', 3);
    for (const [ox, sg] of [[-100, -1], [100, 1]]) { path(arcPts(ox, 70, 80, 28, 0, TAU, 40), '#a84a1a', 3, { dash: [10, 10], alpha: .6 });
      for (let j = 0; j < 5; j++) { const th = (sg < 0 ? 0 : Math.PI) + sg * dir * -(t * .25 + j / 5) * TAU; circ(ox + C(th) * 80, 70 + S(th) * 28, 6, '#f6d65a', '#a8400a', 2); } }
    const g = apart ? 16 + 6 * S(t * 1.2) : 0, push = apart ? 0 : S(t * 1.2) * 4;
    for (const sd of [-1, 1]) { const x0 = sd < 0 ? -200 : g + push * -1, w = 200 - g - Math.abs(push);
      rrect(sd < 0 ? x0 + push : x0, -30, w, 50, 4, '#8a5a3a', '#4a2a14', 3); rrect(sd < 0 ? x0 + push : x0, -30, w, 12, [4, 4, 0, 0], '#6fbf73', '#2f6b3a', 2.5);
      const o = ((t * .8) % 1) * 14 * dir * sd, ax = sd * 110 + o, d = sd * dir;
      poly([[ax - d * 34, -64], [ax + d * 10, -64], [ax + d * 10, -78], [ax + d * 36, -56], [ax + d * 10, -34], [ax + d * 10, -48], [ax - d * 34, -48]], '#f6f4f0', '#3a4050', 3); }
    if (apart) { rrect(-g, -30, 2 * g, 52, 4, '#f29a52', '#a8400a', 2.5); circ(0, -30 + 6 * S(t * 3), g * .9, '#f6a03a', '#a8400a', 2.5); }
    else { const h = 64 * (1 + .08 * S(t * 1.2)); poly([[-70, -28], [-10, -28 - h], [0, -24 - h], [12, -30 - h * .9], [70, -28]], '#8a5a3a', '#4a2a14', 3); poly([[-22, -18 - h * .8], [-10, -28 - h], [0, -24 - h], [12, -30 - h * .9], [22, -22 - h * .7]], '#f6f4f0'); } }),

  celldivide: put((a, t) => { const r = 82 * (1 + .02 * S(t * 3)), d = r * 1.05 * ease(clamp((t - .3) / 2.4));
    circ(-d, 0, r, null, '#2f6b3a', 7); circ(d, 0, r, null, '#2f6b3a', 7); circ(-d, 0, r, '#9fd8a8'); circ(d, 0, r, '#9fd8a8');
    for (const sd of [-1, 1]) { circ(sd * d * .9, 0, 28, '#7a5ac0', '#2a1a58', 3); hi(sd * d * .9 - 9, -9, 6);
      [[-40, 34], [30, -44], [44, 30]].forEach(([x, y], i) => circ(sd * (d + x * .9), y * .9, 6, '#5fae6c')); } }),

  dna: put((a, t) => { const ys = []; for (let y = -150; y <= 150; y += 6) ys.push(y);
    const ph = y => y * .034 + t * 1.6, X = (y, s) => s * 56 * S(ph(y)), Z = (y, s) => s * C(ph(y));
    const seg = (s, front, w, col) => { for (let i = 1; i < ys.length; i++) if ((Z(ys[i], s) >= 0) === front) path([[X(ys[i - 1], s), ys[i - 1]], [X(ys[i], s), ys[i]]], col, w); };
    const cols = { 1: '#4f7fd8', [-1]: '#e05a8a' };
    for (const s of [1, -1]) { seg(s, false, 18, '#1a1d40'); seg(s, false, 11, mix(cols[s], '#1a1d40', .35)); }
    for (let y = -140, i = 0; y <= 140; y += 22, i++) { const x = X(y, 1); path([[x, y], [-x, y]], '#1a1d40', 11); path([[x, y], [0, y]], RUNG[i % 4][0], 6); path([[0, y], [-x, y]], RUNG[i % 4][1], 6); }
    for (const s of [1, -1]) { seg(s, true, 18, '#1a1d40'); seg(s, true, 11, cols[s]); } }),

  bacterium: put((a, t) => { cx.translate(-50 + S(t * 2) * 6, 0); cx.rotate(S(t * 2) * .06);
    const tail = []; for (let x = 0; x <= 150; x += 6) tail.push([110 + x, S(x * .07 - t * 9) * 16 * x / 150]);
    line2(tail, '#2f6b3a', 4, { under: 'rgba(20,40,20,.35)' });
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, x = C(an) * 118, y = S(an) * 50; path([[x, y], [x * 1.12, y * 1.25]], '#2f6b3a', 2.5); }
    rrect(-110, -44, 220, 88, 44, '#7cc47f', '#2f6b3a', 3.5);
    const coil = []; for (let x = -60; x <= 60; x += 4) coil.push([x, S(x * .12 + t * 2) * 12]); path(coil, '#2f6b3a', 3);
    [[-80, -18], [-70, 20], [74, -20], [82, 14], [40, 26], [-30, -28]].forEach(([x, y]) => circ(x, y, 5, '#4f9a58'));
    rrect(-96, -34, 150, 10, 5, 'rgba(255,255,255,.3)'); }),

  virus: put((a, t) => { cx.translate(0, S(t * 1.5) * 6); const sp = t * .3;
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + sp, L = 1 + .08 * S(t * 3 + i);
      path([[C(an) * 66, S(an) * 66], [C(an) * 96 * L, S(an) * 96 * L]], '#4a2a68', 7); circ(C(an) * 102 * L, S(an) * 102 * L, 11, '#f07aa0', '#8a2f4f', 3); }
    circ(0, 0, 72, '#9f74c0', '#4a2a68', 3.5);
    for (let i = 0; i < 6; i++) { const an = i * 1.1 + sp; circ(C(an) * 38, S(an) * 38, 8, '#b892d8'); } hi(-24, -24, 12); }),

  neuron: put((a, t) => { const ax = [[-90, 0], [-20, -10], [60, 8], [150, 0]], NC = '#f07aa0', NE = '#8a2f4f';
    [[[-120, 0], [-170, -60], [-200, -90]], [[-170, -60], [-160, -110]], [[-120, 0], [-195, -10], [-230, 10]], [[-195, -10], [-215, -45]], [[-120, 0], [-160, 60], [-150, 110]], [[-160, 60], [-210, 80]], [[-120, 0], [-100, -70], [-70, -110]]]
      .forEach((p, i) => line2(p, NC, i % 2 ? 5 : 8, { under: NE }));
    line2(ax, NC, 9, { under: NE }); [[150, 0], [190, -42], [205, 0], [190, 42]].slice(1).forEach(p => line2([[150, 0], p], NC, 6, { under: NE }));
    const u = (t * .55) % 1, end = u > .9 ? 1 - (u - .9) * 10 : 0;
    [[190, -42], [205, 0], [190, 42]].forEach(([x, y]) => { cx.save(); if (end) { cx.shadowColor = '#fff3a8'; cx.shadowBlur = 25 * end; } circ(x, y, 10, mix(NC, '#fff3a8', end), NE, 3); cx.restore(); });
    [-60, -6, 48, 102].forEach(x => rrect(x, -14 + (x > 0 ? 6 : -4), 40, 22, 11, '#f6f4f0', NE, 3));
    blob(-120, 0, 42, 38, 0, 3, NC, NE, 3.5); circ(-120, 0, 14, '#7a5ac0', '#2a1a58', 2.5);
    if (u < .92) { cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 25; circ(...along(ax, u / .92), 11, '#fff3a8', '#c98a1a', 2.5); cx.restore(); } }),

  lungs: put((a, t) => { const k = .5 + .5 * S(t * 1.5 - Math.PI / 2);
    rrect(-15, -160, 30, 92, 12, '#f6c0c8', '#8a2f4f', 3); for (let y = -148; y < -74; y += 14) path([[-13, y], [13, y]], '#c87a8a', 3);
    for (const sd of [-1, 1]) { cx.save(); cx.scale(sd, 1); cx.translate(-26, -70); cx.scale(1 + .07 * k, 1 + .05 * k); cx.translate(26, 70);
      shape(() => { cx.moveTo(-28, -76); cx.bezierCurveTo(-70, -116, -134, -64, -140, 26); cx.bezierCurveTo(-144, 96, -110, 124, -60, 114); cx.bezierCurveTo(-24, 108, -22, 64, -28, -76); }, '#f07a8a', '#8a2f4f', 3.5);
      path([[0, -72], [-40, -44], [-70, -4], [-100, 40]], '#a8405a', 7); path([[-40, -44], [-96, -30]], '#a8405a', 5); path([[-70, -4], [-60, 60], [-82, 92]], '#a8405a', 5); path([[-100, 40], [-120, 70]], '#a8405a', 4);
      rrect(-120, -50, 12, 70, 6, 'rgba(255,255,255,.25)'); cx.restore(); } }),

  eye: put((a, t) => { const bl = t % 4 - 3.6, open = bl > 0 && bl < .3 ? Math.abs(bl - .15) / .15 : 1, gx = S(t * .8) * 26, h = 96 * Math.max(open, .04);
    const lid = () => { cx.moveTo(-150, 0); cx.bezierCurveTo(-60, -h, 60, -h, 150, 0); cx.bezierCurveTo(60, h, -60, h, -150, 0); };
    shape(lid, '#f6f4f0'); cx.save(); shape(lid); cx.clip();
    circ(gx, 0, 58, '#3f9a8a', '#1f4a40', 3); for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; path([[gx + C(an) * 30, S(an) * 30], [gx + C(an) * 52, S(an) * 52]], '#6ac0ae', 3); }
    circ(gx, 0, 24 + 8 * S(t * 1.2), '#1a1a1a'); hi(gx + 20, -20, 10); cx.restore();
    shape(lid, null, '#3a2a20', 4.5);
    path(arcPts(0, 30, 160, 140, -Math.PI * .78, -Math.PI * .22, 20), '#3a2a20', 3, { alpha: .6 });
    for (let i = -2; i <= 2; i++) { const u = .5 + i * .14, bx = lerp(-150, 150, u), by = -h * .75 * (1 - (2 * u - 1) ** 2) - 2; path([[bx, by], [bx + i * 6, by - 18]], '#3a2a20', 3.5); } }),

  brain: put((a, t) => { const out = []; for (let i = 0; i < 72; i++) { const th = i / 72 * TAU, b = 1 + .035 * S(th * 9);
      let x = C(th) * 140 * b, y = S(th) * 100 * b - 10; if (y > 40) y = 40 + (y - 40) * .4; out.push([x, y]); }
    poly([[18, 40], [50, 40], [44, 124], [22, 124]], '#e08aa0', '#8a3a50', 3);
    ell(80, 58, 50, 32, 0, '#e08aa0', '#8a3a50', 3); for (let i = 0; i < 4; i++) path(arcPts(80, 58, 44 - i * 10, 26 - i * 6, Math.PI * .9, Math.PI * 2.1, 14), '#b85a74', 2.5);
    poly(out, '#f2a0b0', null); cx.save(); poly(out); cx.clip();
    for (let row = 0; row < 7; row++) { const pts = []; for (let x = -150; x <= 150; x += 6) pts.push([x, -88 + row * 22 + 9 * S(x * .07 + row * 2.1)]); path(pts, '#c06a84', 4); }
    path([[-80, 26], [-20, 6], [50, -8], [96, -4]], '#8a3a50', 5); cx.restore(); poly(out, null, '#8a3a50', 4);
    [[-90, -40], [-30, -70], [40, -50], [90, -30], [-60, 10], [20, 18]].forEach(([x, y], i) => { const g = Math.max(0, S(t * 3 + i * 1.7));
      if (g > .05) { cx.save(); cx.globalAlpha = g; cx.shadowColor = '#fff3a8'; cx.shadowBlur = 20; circ(x, y, 9, '#fff3a8', '#c98a1a', 2); cx.restore(); } }); }),

  thermometer: put((a, t) => { const cold = a.k === 'cold', col = cold ? ['#3f7fd0', '#1f3f78'] : ['#e0403a', '#7a1a14'];
    const lv = lerp(.45, cold ? .12 : .88, ease(clamp(t / 2.5))) + .015 * S(t * 3);
    rrect(-24, -170, 48, 270, 24, '#f6f4f0', '#3a4050', 3.5); for (let y = -130; y <= 70; y += 20) path([[24, y], [y % 40 ? 34 : 42, y]], '#3a4050', 3);
    rrect(-10, 80 - lv * 230, 20, lv * 230 + 30, 10, col[0]); circ(0, 112, 42, col[0], col[1], 3.5); hi(-13, 100, 10); rrect(-18, -150, 7, 220, 4, 'rgba(255,255,255,.6)');
    if (cold) { cx.save(); cx.translate(-110, -80); cx.rotate(t * .5); for (let i = 0; i < 3; i++) { cx.rotate(Math.PI / 3); line2([[-26, 0], [26, 0]], '#ffffff', 4, { under: '#1f3f78' }); } cx.restore(); }
    else for (let i = 0; i < 3; i++) { const pts = []; for (let j = 0; j < 10; j++) pts.push([-120 + i * 34 + S(j * .9 + t * 5 + i) * 7, 20 - j * 14 - (t * 40 % 14)]); line2(pts, '#f29a52', 4, { under: '#7a3a14', alpha: .9 }); } }),

  statechange: put((a, t) => { const s = { ice: 0, water: 1, steam: 2 }[a.k] ?? Math.min(2, t / 2.4), ia = clamp(1 - s), wa = s <= 1 ? s : 2 - s, sa = a.k === 'steam' ? 1 : clamp(s - 1);
    rrect(-200, 90, 400, 18, 9, '#c9c4ba', '#5a5348', 3);
    if (wa > .02) { const rx = 50 + 150 * wa, ry = 8 + 14 * wa; ell(0, 88, rx, ry, 0, '#3f8fd0', '#1a3f6b', 3.5); ell(0, 86, rx * .78, ry * .55, 0, '#6fb8e8');
      ell(-rx * .35, 84, rx * .22, ry * .22, 0, 'rgba(255,255,255,.75)');
      if (a.k === 'water') for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; cx.save(); cx.globalAlpha = 1 - u; ell(0, 88, 30 + 150 * u, 4 + 14 * u, 0, null, '#1a3f6b', 2.5); cx.restore(); } }
    if (ia > .02) { const L = 180 * Math.sqrt(ia); cx.save(); cx.translate(0, 86); cx.rotate(a.k === 'ice' ? S(t * 2) * .03 : 0);
      rrect(-L / 2, -L, L, L, 14 * ia + 2, '#bfe6f5', '#2a6a98', 4); rrect(-L / 2 + 8, -L + 8, L - 16, L * .22, 8 * ia + 2, '#e2f4fb');
      poly([[-L * .32, -L * .78], [-L * .12, -L * .78], [-L * .32, -L * .42]], 'rgba(255,255,255,.85)'); path([[L * .1, -L * .55], [L * .3, -L * .35], [L * .22, -L * .2]], '#7ab8d8', 3);
      if (ia < .98) for (let i = 0; i < 2; i++) { const u = (t * .8 + i / 2) % 1; ell(-L * .5 + 4 + i * (L - 8), -L * .2 + u * L * .2, 5, 8, 0, '#4fa3d8', '#1a3f6b', 2); }
      if (a.k === 'ice') { const k = .5 + .5 * S(t * 4); cx.translate(L * .25, -L * .7); cx.scale(k, k); poly(sparkle(18, 4), '#ffffff', '#2a6a98', 2); } cx.restore(); }
    if (sa > 0) for (let i = 0; i < 5; i++) { const u = (t * .4 + i / 5) % 1, pts = []; for (let j = 0; j < 8; j++) pts.push([(i - 2) * 40 + S(j * 1.1 + t * 4 + i) * 10, 66 - u * 160 - j * 13]);
      cx.save(); cx.lineCap = 'round'; line2(pts, '#e8ecf2', 6, { under: '#5a6478', alpha: (1 - u) * sa }); cx.restore(); } }),

  particles: put((a, t) => { const k = a.k || 'solid', B = (x, y) => { circ(x, y, 14, '#4fa3d8', '#1f4f78', 2.5); hi(x - 4, y - 4, 4); };
    rrect(-150, -110, 300, 220, 10, 'rgba(255,255,255,.35)', '#3a4050', 4);
    if (k === 'solid') for (let r = 0, i = 0; r < 5; r++) for (let c = 0; c < 7; c++, i++) B(-90 + c * 30 + 2.5 * S(t * 14 + i * 1.7), 81 - r * 30 + 2.5 * C(t * 13 + i * 2.3));
    else if (k === 'liquid') for (let j = 0, i = 0; j < 4; j++) for (let c = 0; c < (j < 3 ? 8 : 5); c++, i++)
      B(-112 + c * 32 + (j % 2) * 14 + 7 * S(t * 2.2 + j * 1.9) + 2 * S(t * 5 + i), 82 - j * 27 + 2 * C(t * 4 + i));
    else for (let i = 0; i < 10; i++) { const r = rng(i + 3), vx = .3 + r() * .4, vy = .3 + r() * .4;
      B(-132 + 264 * tri(t * vx + r() * 2), -92 + 184 * tri(t * vy + r() * 2)); } }),

  gears: put((a, t) => { const th = t * .6, s1 = TAU / 12, s2 = TAU / 8;
    cx.save(); cx.translate(-70, 0); gear(12, 96, '#f29a52', '#8a4a1a', th - .3 * s1); cx.restore();
    cx.save(); cx.translate(90, 0); gear(8, 64, '#4fa3d8', '#1f4f78', -th * 12 / 8 + Math.PI - .8 * s2); cx.restore(); }),

  pendulum: put((a, t) => { const L = 230, th = .55 * S(t * 2.2), bx = S(th) * L, by = -150 + C(th) * L;
    path(arcPts(0, -150, L, L, Math.PI / 2 - .58, Math.PI / 2 + .58, 24), '#3a4050', 2.5, { dash: [8, 8], alpha: .45 });
    rrect(-90, -170, 180, 18, 5, '#8a5a3a', '#4a2a14', 3); line2([[0, -150], [bx, by]], '#9aa0aa', 4, { under: '#3a4050' }); circ(0, -150, 7, '#3a4050');
    circ(bx, by, 32, '#e05a4f', '#7a2a24', 3.5); hi(bx - 10, by - 10, 8); }),

  coilspring: put((a, t) => { const yb = 30 + 32 * S(t * 3), pts = [[0, -150], [0, -134]], n = 12;
    for (let i = 0; i <= n; i++) pts.push([i === n ? 0 : (i % 2 ? 34 : -34), lerp(-128, yb - 14, i / n)]); pts.push([0, yb]);
    rrect(-90, -170, 180, 18, 5, '#8a5a3a', '#4a2a14', 3); line2(pts, '#c9ccd4', 5, { under: '#3a4050' });
    rrect(-46, yb, 92, 72, 8, '#5d6fd0', '#28307a', 3.5); rrect(-38, yb + 8, 12, 56, 6, 'rgba(255,255,255,.3)'); }),

  sprout: put((a, t) => { const g = ease(clamp(t / 2.4)), sw = S(t * 1.5) * 6 * g, top = [sw, 40 - 150 * g];
    rrect(-180, 20, 360, 120, 10, '#8a5a3a', '#4a2a14', 3); [[-130, 60], [-60, 110], [90, 50], [140, 100], [40, 120]].forEach(([x, y], i) => ell(x, y, 10, 6, i, '#6b4428'));
    path(upto([[0, 80], [-4, 100], [6, 120], [0, 132]], g), '#f2e8d0', 5); path(upto([[-2, 96], [-30, 118]], g), '#f2e8d0', 3); path(upto([[4, 108], [30, 126]], g), '#f2e8d0', 3);
    ell(0, 72, 24, 15, -.3, '#c8963a', '#6a4a1a', 3);
    if (g > .02) { const st = [[0, 62], [sw * .3, 20], [top[0] * .8, (40 + top[1]) / 2], top]; line2(upto(st, 1), '#5fae6c', 8, { under: '#2f6b3a' });
      const ls = ease((g - .4) / .6); if (ls > 0) for (const sd of [-1, 1]) { cx.save(); cx.translate(...top); cx.rotate(sd * (.9 - .3 * ls) + S(t * 1.5) * .05); cx.scale(ls, ls);
        shape(() => { cx.moveTo(0, 0); cx.quadraticCurveTo(sd * 30, -40, sd * 80, -10); cx.quadraticCurveTo(sd * 36, 20, 0, 0); }, '#6fbf73', '#2f6b3a', 3); cx.restore(); } } }),

  butterfly: put((a, t, f) => { const k = a.k || 'adult';
    if (k !== 'all') return (STAGE[k] || STAGE.adult)(t, f);
    const at = [['egg', 0, -150, .62], ['caterpillar', 215, 0, .58], ['chrysalis', 0, 160, .62], ['adult', -215, 0, .58]];   // stage, x, y, size
    at.forEach((_, i) => { const a0 = -Math.PI / 2 + i * Math.PI / 2; const pts = arcPts(0, 0, 215, 160, a0 + .5, a0 + 1.07, 14);
      cx.save(); cx.lineCap = 'round'; line2(pts, '#f6f4f0', 6, { under: '#3a4050' }); arrowHead(pts, '#3a4050', 15); cx.restore(); });
    at.forEach(([s, x, y, k], i) => { const b = 1 + .04 * S(t * 2.4 - i * Math.PI / 2); cx.save(); cx.translate(x, y + (s === 'chrysalis' ? -40 : 0)); cx.scale(k * b, k * b); STAGE[s](t, f); cx.restore(); }); }),
});
})();
