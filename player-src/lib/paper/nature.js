// Paper-motion library: NATURE — the body and health, weather, the earth, oceans and ecosystems.
// Every call: name x y scale (centred on x y; defaults 480 300 1), rot=deg; seasons takes k=. About 400-650 px across
// at scale 1, alive in t. Flat cut-paper shapes, ~3 px darker edges, nothing written inside the frame.
{
const S = Math.sin, C = Math.cos, PI = Math.PI;
const put = fn => (a, t, f) => { const [x = 480, y = 300, s = 1] = a.v; cx.save(); cx.translate(x + jig(f, 1), y + jig(f, 2));
  if (a.rot) cx.rotate(a.rot * PI / 180); cx.scale(s, s); try { fn(a, t, f); } finally { cx.restore(); } };
const ell = (x, y, rx, ry, rot, fill, edge, lw = 3) => { cx.beginPath(); cx.ellipse(x, y, Math.max(rx, .1), Math.max(ry, .1), rot, 0, TAU);
  if (fill) { cx.fillStyle = fill; cx.fill(); } if (edge) { cx.strokeStyle = edge; cx.lineWidth = lw; cx.stroke(); } };
const shape = (draw, fill, edge, lw = 3) => { cx.beginPath(); draw(); if (fill) { cx.fillStyle = fill; cx.fill(); }
  if (edge) { cx.strokeStyle = edge; cx.lineWidth = lw; cx.lineJoin = 'round'; cx.stroke(); } };
const hi = (x, y, r) => circ(x, y, r, 'rgba(255,255,255,.4)');
const limb = (pts, fill, edge, w) => { path(pts, edge, w + 6); path(pts, fill, w); };
// overlapping circles cut as one piece of paper: one outline round the whole group
const puff = (list, fill, edge, lw = 3) => { list.forEach(([x, y, r]) => circ(x, y, r + lw / 2, edge)); list.forEach(([x, y, r]) => circ(x, y, r - lw / 2, fill)); };
const at = (x, y, s, rot, fn) => { cx.save(); cx.translate(x, y); if (rot) cx.rotate(rot); if (s !== 1) cx.scale(s, s); fn(); cx.restore(); };
const fade = (k, fn) => { cx.save(); cx.globalAlpha *= clamp(k); fn(); cx.restore(); };
const clipRect = (x, y, w, h) => { cx.beginPath(); cx.rect(x, y, w, h); cx.clip(); };
const arcPts = (x, y, rx, ry, a0, a1, n = 32) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [x + C(a) * rx, y + S(a) * ry]; });
const drop = (x, y, r, fill = '#4fa3d8', edge = '#2a5f88') => shape(() => { cx.moveTo(x, y - r * 1.7); cx.quadraticCurveTo(x + r * 1.1, y - r * .2, x + r, y + r * .2);
  cx.arc(x, y + r * .2, r, 0, PI); cx.quadraticCurveTo(x - r * 1.1, y - r * .2, x, y - r * 1.7); }, fill, edge, 2.5);
const star = (x, y, r, fill, edge, lw = 2) => { const p = []; for (let i = 0; i < 10; i++) { const an = i * PI / 5 - PI / 2, R = i % 2 ? r * .45 : r; p.push([x + C(an) * R, y + S(an) * R]); } poly(p, fill, edge, lw); };
const twinkle = (x, y, r, k, fill = '#fff3c4', edge = '#c98a1a') => { if (k <= .05) return; const p = []; for (let i = 0; i < 8; i++) { const an = i * PI / 4, R = (i % 2 ? r * .28 : r) * k; p.push([x + C(an) * R, y + S(an) * R]); } poly(p, fill, edge, 2); };
// water block with a moving wavy top, from x0 to x1, down to bot
const wave = (x0, x1, y, amp, len, ph, bot, fill, edge, lw = 3) => { const p = []; for (let x = x0; x <= x1 + .1; x += 10) p.push([x, y + S(x / len * TAU + ph) * amp]); p.push([x1, bot], [x0, bot]); poly(p, fill, edge, lw); };
const rainLines = (x0, x1, y0, y1, n, t, col = '#4fa3d8', slant = -6, sp = 320) => { for (let i = 0; i < n; i++) { const x = x0 + (i * 53.7) % (x1 - x0), y = y0 + ((i * 71 + t * sp) % (y1 - y0));
  path([[x, y], [x + slant, y + 18]], col, 3.5); } };
const flakes = (x0, x1, y0, y1, n, t, r = 5) => { for (let i = 0; i < n; i++) { const x = x0 + (i * 67.3) % (x1 - x0) + S(t * 1.2 + i) * 10, y = y0 + ((i * 41 + t * 45) % (y1 - y0));
  circ(x, y, r - (i % 3), '#ffffff', '#7a8aa8', 1.5); } };
const sunDisc = (x, y, r, t) => { at(x, y, 1, t * .3, () => { for (let i = 0; i < 12; i++) { cx.rotate(TAU / 12); poly([[r + 6, -8], [r + 26, 0], [r + 6, 8]], '#f6d65a', '#c98a1a', 2.5); } });
  cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 24; circ(x, y, r, '#f6d65a', '#c98a1a', 3.5); cx.restore(); hi(x - r * .3, y - r * .3, r * .22); };
const cloudP = (x, y, s, fill = '#f6f4f0', edge = '#8a93a6') => at(x, y, s, 0, () => puff([[-60, 10, 36], [-24, -14, 46], [24, -18, 48], [62, 6, 36], [0, 16, 40]], fill, edge));
// a round leafy tree standing on (x, y); skew bends it (wind), positive = top to the right
const treeR = (x, y, s, crown, edge, t, i = 0, skew = 0) => at(x, y, s, 0, () => { cx.transform(1, 0, -(skew + S(t * 1.3 + i) * .03), 1, 0, 0);
  rrect(-11, -76, 22, 78, 4, '#9a6b45', '#4f3420'); puff([[0, -118, 46], [-38, -92, 34], [38, -92, 34], [0, -150, 30]], crown, edge); });
const pine = (x, y, s, t, i = 0, snow = false, skew = 0) => at(x, y, s, 0, () => { cx.transform(1, 0, -(skew + S(t * 1.3 + i) * .03), 1, 0, 0);
  rrect(-8, -26, 16, 28, 3, '#9a6b45', '#4f3420');
  [[58, -20, -86], [46, -62, -126], [34, -100, -158]].forEach(([w, b, top]) => { poly([[-w, b], [0, top], [w, b]], '#2f8a4a', '#1a4f2a');
    if (snow) poly([[-w * .45, top + (b - top) * .45], [0, top + 2], [w * .45, top + (b - top) * .45], [w * .2, top + (b - top) * .38], [0, top + (b - top) * .5], [-w * .2, top + (b - top) * .38]], '#ffffff'); }); });
const fishy = (x, y, s, col, edge, t, dir = 1, i = 0) => at(x, y, s, 0, () => { cx.scale(dir, 1);
  at(-34, 0, 1, S(t * 9 + i) * .3, () => poly([[4, 0], [-28, -20], [-28, 20]], col, edge, 2.5));
  ell(0, 0, 40, 22, 0, col, edge, 2.5); path([[6, -19], [10, 19]], edge, 2, { alpha: .45 }); circ(22, -5, 4.5, '#1a1a1a'); hi(2, -10, 5); });
const penguin = (x, y, s, t, i = 0) => at(x, y, s, S(t * 4 + i) * .1, () => {
  for (const sd of [-1, 1]) ell(sd * 13, -2, 12, 6, 0, '#f29a52', '#a8400a', 2);
  for (const sd of [-1, 1]) ell(sd * 32, -52, 9, 26, -sd * (.35 + .15 * S(t * 4 + i)), '#2a2f40', '#11141e', 2.5);
  ell(0, -52, 34, 50, 0, '#2a2f40', '#11141e', 3); ell(0, -44, 23, 38, 0, '#f6f4f0');
  circ(0, -96, 24, '#2a2f40', '#11141e', 3); ell(0, -92, 15, 13, 0, '#f6f4f0');
  circ(-6, -95, 3.5, '#11141e'); circ(6, -95, 3.5, '#11141e'); poly([[-6, -88], [6, -88], [0, -77]], '#f29a52', '#a8400a', 2); });
const house = (x, y, s, col, roof, rot = 0) => at(x, y, s, rot, () => { rrect(-40, -52, 80, 52, 2, col, mix(col, '#000000', .5));
  poly([[-52, -50], [0, -94], [52, -50]], roof, mix(roof, '#000000', .5)); rrect(-10, -28, 20, 28, 2, '#7a4a2a', '#3a2010', 2); rrect(16, -42, 15, 15, 2, '#9fc4e6', '#2a3f7a', 2); });
const flowerHead = (x, y, r, petal, edge, t, i = 0) => at(x, y, 1, S(t * 1.5 + i) * .08, () => {
  for (let k = 0; k < 6; k++) ell(C(k * PI / 3) * r * .9, S(k * PI / 3) * r * .9, r * .62, r * .38, k * PI / 3, petal, edge, 2.5);
  circ(0, 0, r * .5, '#f6c230', '#a8740a', 2.5); for (let k = 0; k < 5; k++) circ(C(k * 1.3) * r * .25, S(k * 1.3) * r * .25, 2.5, '#a8740a'); });
const germ = (x, y, r, t, i = 0) => at(x, y, 1, S(t * 2 + i) * .3, () => {
  for (let k = 0; k < 10; k++) { const an = k * TAU / 10, w = S(t * 6 + k + i) * .15; path([[C(an) * r * .9, S(an) * r * .9], [C(an + w) * r * 1.3, S(an + w) * r * 1.3]], '#2f6b3a', 3); }
  blobShape(r, '#7cc47f', '#2f6b3a', i); [[-.35, -.2, .18], [.3, .25, .14], [.1, -.4, .1], [-.15, .4, .12]].forEach(([u, v, q]) => circ(u * r, v * r, q * r, '#4f9a58')); hi(-r * .4, -r * .4, r * .15); });
const blobShape = (r, fill, edge, i = 0) => { const p = []; for (let k = 0; k < 24; k++) { const an = k * TAU / 24; p.push([C(an) * r * (1 + .07 * S(an * 3 + i)), S(an) * r * (1 + .07 * C(an * 2 + i))]); } poly(p, fill, edge, 3); };
const SK = '#e8b48a', SKE = '#8a5434';                       // skin and its edge
const RAINBOW = ['#e05a4f', '#f29a52', '#f6d65a', '#6fbf73', '#4fa3d8', '#5d6fd0', '#9f74c0'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

Object.assign(LIB, {
  heartpump: put((a, t, f) => { const b = 1 + .09 * Math.exp(-((t * 1.2) % 1) * 7), RX = 180, RY = 128;
    for (const sd of [-1, 1]) ell(sd * 44, -RY - 10, 40, 30, sd * .3, '#f5b5c3', '#a8566a', 3);
    rrect(-74, RY - 20, 148, 44, 22, '#f6dccb', '#c9a48c', 3);
    for (const [a0, a1, col, ed] of [[PI / 2, 3 * PI / 2, '#5d6fd0', '#2a3478'], [-PI / 2, PI / 2, '#e05a4f', '#7a1a1a']]) { const p = arcPts(0, 0, RX, RY, a0, a1, 40); path(p, ed, 30); path(p, col, 22); }
    for (let i = 0; i < 16; i++) { const an = t * 1.1 + i * TAU / 16, x = C(an) * RX, y = S(an) * RY; circ(x, y, 8, mix('#3f4fb8', '#c8323c', clamp(.5 + C(an) * 3)), '#2a1414', 2); }
    for (const sd of [-1, 1]) arrowHead([[sd * RX, -sd * 8], [sd * RX, sd * 8]], '#ffffff', 10);
    heartShape(0, 6, 1.1 * b, '#8fa6dc', '#e86a5c', f); }),

  stomach: put((a, t) => { const sq = S(t * 2.4) * .03;
    limb([[-4, -200], [-8, -150], [-14, -110]], '#f2a0a8', '#8a2f4f', 26); limb([[132, 26], [174, 8], [200, 40], [186, 96]], '#f2a0a8', '#8a2f4f', 24);
    const u = (t * .5) % 1; circ(...along([[132, 26], [174, 8], [200, 40], [186, 96]], u), 6, '#c98a50', '#6a3a14', 2);
    cx.save(); cx.scale(1 + sq, 1 - sq);
    const bag = () => { cx.moveTo(-28, -118); cx.bezierCurveTo(-140, -110, -162, 60, -60, 112); cx.bezierCurveTo(20, 150, 122, 110, 138, 44); cx.lineTo(150, 18);
      cx.lineTo(116, 8); cx.bezierCurveTo(96, 56, 30, 66, 4, 28); cx.bezierCurveTo(-16, -4, 14, -80, 10, -118); cx.closePath(); };
    shape(bag, '#f07a8a'); cx.save(); shape(bag); cx.clip();
    wave(-170, 160, 34, 6, 90, t * 3, 170, '#f6c06a', null);
    for (let i = 0; i < 8; i++) { const an = t * 1.3 + i * TAU / 8, r = 30 + (i % 3) * 16, k = .6 + .4 * C(t * .9 + i);
      circ(-56 + C(an) * r, 56 + S(an) * r * .55, (10 + (i % 3) * 3) * k, ['#6fbf73', '#e05a4f', '#f6d65a', '#c98a50'][i % 4], 'rgba(60,20,20,.5)', 2); }
    for (let i = 0; i < 5; i++) { const v = (t * .5 + i / 5) % 1; circ(-100 + i * 30, 96 - v * 80, 5, 'rgba(255,255,255,.6)'); }
    [[-110, -40, -64, -20], [-128, 0, -84, 18], [-40, -90, -16, -60]].forEach(([x1, y1, x2, y2]) => path([[x1, y1], [x2, y2]], '#c0505e', 3.5));
    rrect(-126, -50, 12, 70, 6, 'rgba(255,255,255,.25)'); cx.restore(); shape(bag, null, '#8a2f4f', 3.5); cx.restore(); }),

  kidney: put((a, t) => { cx.translate(-50, -20);
    const art = [[200, -70], [110, -40], [26, -24]], vein = [[26, 8], [110, 20], [200, 10]], ure = [[24, 40], [44, 100], [60, 150]];
    limb(art, '#e05a4f', '#7a1a1a', 16); limb(vein, '#5d6fd0', '#2a3478', 16); limb(ure, '#f6e08a', '#a8843a', 10);
    for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; circ(...along(art, u), 6, '#c8323c', '#3a1414', 2); circ(...along(vein, u), 6, '#3f4fb8', '#1a1d40', 2); drop(...along(ure, u), 5, '#f2d050', '#a8843a'); }
    const fill = .3 + .5 * ((t * .15) % 1); ell(66, 176, 46, 34, 0, '#fdf2d0', '#a8843a', 3);
    cx.save(); cx.beginPath(); cx.ellipse(66, 176, 46, 34, 0, 0, TAU); cx.clip(); cx.fillStyle = '#f6d65a'; cx.fillRect(10, 210 - 68 * fill, 120, 80); cx.restore(); ell(66, 176, 46, 34, 0, null, '#a8843a', 3);
    const bean = (s, ox = 0) => () => { cx.moveTo(30 * s + ox, -60 * s); cx.bezierCurveTo(40 * s + ox, -160 * s, -120 * s + ox, -160 * s, -120 * s + ox, 0); cx.bezierCurveTo(-120 * s + ox, 160 * s, 40 * s + ox, 160 * s, 30 * s + ox, 60 * s); cx.bezierCurveTo(0, 40 * s, 0, -40 * s, 30 * s + ox, -60 * s); };
    const pu = 1 + .015 * S(t * 3); cx.save(); cx.scale(pu, pu);
    shape(bean(1), '#c8464e', '#6a1a24', 3.5); shape(bean(.74, -14), '#a8323c');
    for (let i = 0; i < 5; i++) { const an = PI * (.6 + i * .2); poly([[-24 + C(an) * 70, S(an) * 76], [-24 + C(an + .2) * 74, S(an + .2) * 80], [-10 + C(an + .1) * 30, S(an + .1) * 34]], '#8a2430'); }
    shape(() => { cx.moveTo(26, -26); cx.quadraticCurveTo(-30, -40, -30, 0); cx.quadraticCurveTo(-30, 40, 26, 30); cx.closePath(); }, '#f6e08a', '#a8843a', 2.5);
    rrect(-104, -60, 12, 80, 6, 'rgba(255,255,255,.25)'); cx.restore(); }),

  skeleton: put((a, t) => { const w = t * 3.4, B = '#f6f4f0', E = '#6a6458', D = '#d6d0c2'; cx.translate(0, -Math.abs(S(w)) * 7);
    const bone = (p, q, wd, col) => { limb([p, q], col, E, wd); for (const [x, y] of [p, q]) { circ(x, y, wd * .62 + 2, E); circ(x, y, wd * .62 - 1, col); } };
    const leg = (s, col) => { const th = S(w) * .5 * s, kn = [S(th) * 72, 44 + C(th) * 72], sh = th - Math.max(0, -S(w) * s) * .7, an = [kn[0] + S(sh) * 70, kn[1] + C(sh) * 70];
      bone([0, 44], kn, 12, col); bone(kn, an, 10, col); bone(an, [an[0] + 26, an[1] + 2], 8, col); };
    const arm = (s, col) => { const th = -S(w) * .45 * s, el = [S(th) * 56, -90 + C(th) * 56], fo = th - .5, hd = [el[0] + S(fo) * 50, el[1] + C(fo) * 50];
      bone([0, -92], el, 9, col); bone(el, hd, 8, col); circ(...hd, 8, col, E, 2.5); };
    leg(-1, D); arm(-1, D);
    limb([[0, -112], [0, 44]], B, E, 12); for (let y = -100; y < 40; y += 14) path([[-7, y], [7, y]], E, 2.5);
    for (let i = 0; i < 4; i++) { const y = -90 + i * 17; limb([[-36 + i * 3, y + 10], [-18, y - 2], [0, y], [18, y - 2], [36 - i * 3, y + 10]], B, E, 7); }
    ell(0, 44, 32, 16, 0, B, E, 3); circ(-12, 44, 6, D);
    leg(1, B); arm(1, B);
    at(0, -150, 1, S(w) * .05, () => { circ(0, 0, 40, B, E, 3); rrect(-18, 22, 40, 20, 8, B, E, 3); for (let x = -10; x <= 14; x += 8) path([[x, 24], [x, 38]], E, 2);
      circ(-6, -4, 10, '#3a3a46'); circ(20, -4, 10, '#3a3a46'); circ(-4, -6, 3, '#ffffff'); circ(22, -6, 3, '#ffffff'); poly([[6, 6], [12, 6], [9, 14]], '#3a3a46'); }); }),

  muscle: put((a, t) => { const k = .5 - .5 * C(t * 1.6), an = -.15 - 1.8 * k, el = [-10, 40], hand = [el[0] + C(an) * 118, el[1] + S(an) * 118];
    rrect(-250, -50, 84, 180, 30, '#4f7fd8', '#1f3f78', 3); path([[-180, -40], [-180, 120]], '#1f3f78', 2.5, { alpha: .5 });
    limb([[-176, 44], el], SK, SKE, 56); limb([el, hand], SK, SKE, 46); circ(...el, 25, SK);
    ell(-92, 24 - 18 * k, 58 - 6 * k, 16 + 20 * k, 0, '#e07a6a', '#8a3a2a', 3); path(arcPts(-92, 24 - 18 * k, 40, 8 + 12 * k, -PI * .85, -PI * .15, 12), '#f4a898', 3);
    at(...hand, 1, an, () => { circ(0, 0, 32, SK, SKE, 3); for (let i = -1; i <= 1; i++) path([[10, i * 12], [26, i * 12]], SKE, 2.5); });
    for (let i = 0; i < 3; i++) twinkle(-150 + i * 50, -40 - 30 * k - (i % 2) * 20, 16, clamp((k - .6) * 3) * (.7 + .3 * S(t * 6 + i))); }),

  tooth: put((a, t) => { const bx = S(t * 7) * 46;
    for (let i = 0; i < 8; i++) { const u = (t * .45 + i / 8) % 1; fade(1 - u, () => { circ(-110 + i * 30 + S(u * 6 + i) * 8, -100 - u * 120, 7 + (i % 3) * 4, 'rgba(255,255,255,.6)', '#7ab0d8', 2); }); }
    shape(() => { cx.moveTo(-86, -30); cx.bezierCurveTo(-94, -112, -32, -122, -20, -92); cx.quadraticCurveTo(0, -80, 20, -92); cx.bezierCurveTo(32, -122, 94, -112, 86, -30);
      cx.bezierCurveTo(82, 20, 72, 60, 60, 120); cx.lineTo(-60, 120); cx.bezierCurveTo(-72, 60, -82, 20, -86, -30); cx.closePath(); }, '#fbfaf4', '#7a7466', 3.5);
    rrect(-66, -86, 14, 90, 7, 'rgba(160,200,230,.45)');
    rrect(-180, 50, 360, 90, 40, '#f07a8a', '#8a2f4f', 3); for (const x of [-140, 140]) shape(() => { cx.moveTo(x - 40, 52); cx.quadraticCurveTo(x, 20, x + 40, 52); }, '#f07a8a');
    path([[-180, 52], [-100, 52]], '#8a2f4f', 3); path([[100, 52], [180, 52]], '#8a2f4f', 3);
    at(bx, -160, 1, S(t * 7) * .06, () => { for (let i = 0; i < 9; i++) rrect(-46 + i * 10, -6, 7, 30, 3, '#ffffff', '#7ab0d8', 1.5); rrect(-54, -20, 108, 18, 8, '#4fa3d8', '#1f4f78', 3);
      rrect(50, -18, 180, 14, 7, '#4fa3d8', '#1f4f78', 3); });
    twinkle(70, -60, 20, .5 + .5 * S(t * 4)); twinkle(-40, 0, 14, .5 + .5 * S(t * 4 + 2)); }),

  skin: put((a, t) => { const W = 200, top = x => -98 + S(x * .05) * 5;
    rrect(-W, 40, 2 * W, 92, [0, 0, 12, 12], '#f6d68a', '#a8843a', 3);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) circ(-W + 24 + i * 44 + r * 22, 68 + r * 36, 19, '#fbe6a8', '#c8a050', 2);
    rrect(-W, -84, 2 * W, 126, 0, '#f2a8a0', '#a8565a', 3);
    const vr = [], vb = []; for (let x = -W; x <= W; x += 10) { vr.push([x, 4 + S(x * .02) * 8]); vb.push([x, 24 + S(x * .02 + 1) * 8]); }
    limb(vr, '#e05a4f', '#7a1a1a', 9); limb(vb, '#5d6fd0', '#2a3478', 9);
    for (let i = 0; i < 5; i++) { const u = (t * .25 + i / 5) % 1; circ(...along(vr, u), 4, '#ffd8d0'); circ(...along(vb, 1 - u), 4, '#d8e0ff'); }
    const sw = [[-120, -96]]; for (let k = 0; k <= 30; k++) sw.push([-120 + S(k * .9) * 14, -60 + k * 2.2]); limb(sw, '#9fd0f0', '#2a5f88', 5);
    ell(70, -28, 15, 48, 0, '#e88a8a', '#a8565a', 2.5); circ(70, 20, 12, '#c8566a', '#7a2a3a', 2.5);
    poly([[-W, -78], ...Array.from({ length: 41 }, (_, i) => [-W + i * W / 20, top(-W + i * W / 20)]), [W, -78]], '#e8b48a', SKE, 3);
    limb([[70, 18], [72, -60], [74, -100], [86 + S(t * 2) * 10, -170]], '#5a3a24', '#2a1a10', 4);
    const v = (t * .5) % 1; fade(1 - v, () => drop(-120 + S(v * 8) * 3, top(-120) - 14 - v * 70, 8, '#9fd0f0')); }),

  bloodvessel: put((a, t) => { const L = 250, H = 76;
    rrect(-L, -H - 18, 2 * L, 2 * H + 36, 0, '#e8838a', '#8a2f4f', 3); for (let x = -L + 30; x < L; x += 60) { path([[x, -H - 12], [x + 24, -H - 6]], '#c0505e', 3); path([[x + 20, H + 6], [x + 44, H + 12]], '#c0505e', 3); }
    cx.save(); clipRect(-L, -H, 2 * L, 2 * H); rrect(-L, -H, 2 * L, 2 * H, 0, '#fbd8c8');
    for (let i = 0; i < 16; i++) { const sp = 90 + (i % 4) * 18, x = ((i * 73 + t * sp) % (2 * L + 80)) - L - 40, y = ((i * 37) % (2 * H - 40)) - H + 20 + S(t * 2 + i) * 5;
      if (i % 8 === 7) { puff([[x, y, 24], [x + 12, y - 8, 14], [x - 12, y + 8, 14]], '#e8e0f6', '#7a68a8'); circ(x - 4, y, 7, '#9f74c0'); circ(x + 6, y + 4, 6, '#9f74c0'); continue; }
      if (i % 8 === 3) { ell(x, y, 8, 5, i, '#f6d65a', '#a8843a', 2); continue; }
      const ry = 22 * (.4 + .6 * Math.abs(C(t * 1.6 + i))); ell(x, y, 22, ry, 0, '#d8343e', '#7a1a1a', 2.5); ell(x, y, 10, ry * .45, 0, '#b8242e'); }
    cx.restore(); ell(L, 0, 18, H + 18, 0, '#e8838a', '#8a2f4f', 3); ell(L, 0, 10, H, 0, '#b8242e'); }),

  whitecell: put((a, t) => { cx.scale(1.5, 1.5); const an = t * 1.2, R = 130, RY = 80, gx = C(an) * R, gy = S(an) * RY, wa = an - .85, wx = C(wa) * R * .95, wy = S(wa) * RY * .95, d = Math.atan2(gy - wy, gx - wx), r = 14 * S(t * 4);
    ell(0, 0, 200, 125, 0, '#f8dcd2', '#d0a094', 2);
    at(gx, gy, 1, Math.atan2(C(an) * RY, -S(an) * R), () => { const tl = []; for (let x = 0; x <= 40; x += 4) tl.push([-26 - x, S(x * .2 - t * 12) * 6]); path(tl, '#2f6b3a', 3);
      rrect(-28, -15, 56, 30, 15, '#7cc47f', '#2f6b3a', 3); circ(-8, -2, 4, '#4f9a58'); circ(10, 4, 4, '#4f9a58'); });
    const pod = [wx + C(d) * (40 + r), wy + S(d) * (40 + r)];
    circ(wx, wy, 54, '#5a4a88'); ell(...pod, 32 + r * .4, 20, d, '#5a4a88'); circ(wx, wy, 51, '#efe8fa'); ell(...pod, 29 + r * .4, 17, d, '#efe8fa');
    for (const [u, v] of [[-14, -10], [8, -16], [10, 10], [-8, 14]]) circ(wx + u, wy + v, 13, '#9f74c0', '#5a3a88', 2);
    hi(wx - 26, wy - 24, 8); }),

  germs: put((a, t) => { const P = (t * .6) % 4, g = Math.floor(P), fr = ease(clamp((P - g) * 1.5)), n = 1 << g;
    const pos = (lv, i) => { if (!lv) return [0, 0]; const [px, py] = pos(lv - 1, i >> 1), d = [110, 70, 52][lv - 1], s = i & 1 ? 1 : -1; return lv % 2 ? [px + s * d, py] : [px, py + s * d]; };
    const r = [64, 54, 44, 38][g];
    for (let i = 0; i < n; i++) { const p0 = g ? pos(g - 1, i >> 1) : [0, 0], p1 = pos(g, i); fade(g === 3 && P > 3.85 ? (4 - P) / .15 : 1, () => germ(lerp(p0[0], p1[0], fr), lerp(p0[1], p1[1], fr), r, t, i)); } }),

  vaccine: put((a, t) => { const gl = .5 + .5 * S(t * 3);
    circ(-90, -120, 36, SK, SKE, 3); rrect(-150, -78, 120, 180, [50, 50, 10, 10], '#6fbf73', '#2f6b3a', 3);
    for (let i = 0; i < 3; i++) { const u = (t * .55 + i / 3) % 1, y = -90 + i * 80, x = u < .5 ? lerp(330, 150, u / .5) : lerp(150, 330, (u - .5) / .5), back = u > .5;
      fade(back ? 1.6 - (u - .5) * 3 : 1, () => germ(x, y + (back ? (u - .5) * 60 * (i - 1) : 0), 26, t, i)); if (Math.abs(u - .5) < .08) twinkle(126, y, 30, 1 - Math.abs(u - .5) / .08); }
    const sh = () => { cx.moveTo(30, -120); cx.quadraticCurveTo(80, -92, 126, -96); cx.quadraticCurveTo(136, 20, 30, 120); cx.quadraticCurveTo(-76, 20, -66, -96); cx.quadraticCurveTo(-20, -92, 30, -120); cx.closePath(); };
    cx.save(); cx.shadowColor = '#9fd8ff'; cx.shadowBlur = 20 + 20 * gl; shape(sh, '#4f7fd8'); cx.restore(); shape(sh, null, '#1f3f78', 3.5);
    at(30, 0, .74, 0, () => shape(sh, '#7aa6ea')); star(30, -4, 36, '#ffffff', '#1f3f78', 2.5); rrect(-40, -80, 12, 80, 6, 'rgba(255,255,255,.3)');
    at(-250, -150, 1, .6, () => { rrect(-14, -50, 28, 90, 6, 'rgba(220,236,248,.9)', '#4a6a88', 3); rrect(-10, 0, 20, 36, 3, '#6fbf73'); rrect(-20, -58, 40, 10, 4, '#a8b0bc', '#4a505c', 2.5);
      rrect(-4, -84, 8, 28, 3, '#a8b0bc', '#4a505c', 2); path([[0, 40], [0, 74]], '#7a808c', 3); }); }),

  handwash: put((a, t) => { const r = S(t * 6) * 18;
    rrect(-180, 120, 360, 50, [0, 0, 40, 40], '#f6f4f0', '#8a93a6', 3); ell(0, 120, 180, 16, 0, '#dfe8f0', '#8a93a6', 3);
    rrect(-180, -206, 196, 26, 10, '#a8b0bc', '#4a505c', 3); rrect(-8, -194, 26, 40, 8, '#a8b0bc', '#4a505c', 3); rrect(-60, -230, 40, 16, 6, '#e05a4f', '#7a2a24', 2.5);
    path([[5, -152], [5, 110]], '#4fa3d8', 12, { alpha: .8 }); path([[5, -152], [5, 110]], '#d8ecf7', 3, { dash: [14, 18], f: t * 40 });
    const hand = (sd, dx) => at(sd * (28 + dx), 10, 1, sd * .25, () => { cx.scale(sd, 1);
      ell(-26, -4, 15, 32, -.5, SK, SKE, 3); rrect(-30, -76, 64, 132, 30, SK, SKE, 3); for (let i = 0; i < 3; i++) path([[-12 + i * 16, -70], [-12 + i * 16, -40]], SKE, 2.5); });
    hand(-1, -r); hand(1, r);
    puff([[-20 + r, -40, 16], [10, -10, 20], [-10 - r, 30, 14], [20, 40, 12]], 'rgba(255,255,255,.9)', '#9ac0dc', 2.5);
    for (let i = 0; i < 9; i++) { const u = (t * .4 + i / 9) % 1, x = -140 + i * 34 + S(u * 6 + i) * 10, y = 40 - u * 230, rr = 8 + (i % 3) * 5;
      fade(1 - u * u, () => { circ(x, y, rr, 'rgba(255,255,255,.55)', '#7ab0d8', 2.5); hi(x - rr * .35, y - rr * .35, rr * .3); }); } }),

  plate: put((a, t) => { const pop = (i, x, y, fn) => { const k = ease(clamp((t - i * .15) / .4)); if (k > 0) at(x, y + S(t * 2 + i) * 3, k, 0, fn); };
    circ(-20, 6, 182, 'rgba(60,60,80,.12)'); circ(-20, 0, 176, '#f6f4f0', '#8a93a6', 3); circ(-20, 0, 146, '#fffdf8', '#c9c4ba', 3);
    path([[-166, 0], [126, 0]], '#e0dad0', 3); path([[-20, -146], [-20, 146]], '#e0dad0', 3);
    pop(0, -90, -64, () => { for (const [x, y] of [[-20, 30], [12, 34]]) limb([[x, y], [x * .5, 0]], '#8fcf7f', '#2f6b3a', 10); puff([[-26, -8, 22], [0, -22, 24], [24, -6, 22], [0, 6, 18]], '#4f9a58', '#1f5a2a');
      for (const [x, y, r] of [[38, 44, .5], [-40, 50, -.4]]) at(x, y, 1, r, () => rrect(-28, -7, 56, 14, 7, '#f29a52', '#a8400a', 2.5)); });
    pop(1, 56, -66, () => { for (const [x, y] of [[-20, -20], [4, -24], [-8, 0], [16, -2], [28, -24], [6, 22], [-26, 18]]) { circ(x, y, 13, '#9f74c0', '#4a2a68', 2.5); hi(x - 4, y - 4, 3); }
      shape(() => { cx.moveTo(10, 40); cx.arc(30, 40, 22, PI, 0); cx.closePath(); }, '#e05a4f', '#7a2a24', 2.5); shape(() => { cx.moveTo(14, 40); cx.arc(30, 40, 16, PI, 0); cx.closePath(); }, '#fff3d8'); });
    pop(2, 50, 64, () => { for (const x of [-26, 22]) { ell(x, 0, 26, 20, 0, '#ffffff', '#8a8478', 2.5); circ(x, 0, 10, '#f6c230', '#c98a1a', 2); }
      for (let i = 0; i < 6; i++) ell(-30 + i * 12, 38 + (i % 2) * 6, 8, 5, .3 * i, '#a8603a', '#5a2a14', 1.5); });
    pop(3, -92, 62, () => { shape(() => { cx.moveTo(-40, 44); cx.lineTo(-40, -10); cx.arc(-18, -16, 26, PI, -.3); cx.arc(18, -16, 26, -PI + .3, 0); cx.lineTo(40, 44); cx.closePath(); }, '#d8a860', '#8a5a2a', 3.5);
      shape(() => { cx.moveTo(-30, 36); cx.lineTo(-30, -8); cx.arc(-16, -14, 18, PI, -.3); cx.arc(16, -14, 18, -PI + .3, 0); cx.lineTo(30, 36); cx.closePath(); }, '#f2dca8');
      for (const [x, y] of [[-12, 0], [10, 14], [-4, 24], [14, -8]]) ell(x, y, 3, 2, 0, '#a8743a'); });
    pop(4, 230, -10, () => { poly([[-34, -70], [34, -70], [26, 70], [-26, 70]], 'rgba(200,226,240,.55)', '#7aa6c2', 3); poly([[-30, -30], [30, -30], [26, 66], [-26, 66]], '#7fc0ea'); rrect(-24, -56, 8, 110, 4, 'rgba(255,255,255,.5)'); }); }),

  waterglass: put((a, t) => { const k = ease(clamp(((t * .2) % 1.25))), wl = lerp(116, -86, k), G = [[-74, -112], [74, -112], [58, 124], [-58, 124]];
    poly(G, 'rgba(200,226,240,.35)');
    cx.save(); cx.beginPath(); G.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.clip();
    wave(-80, 80, wl, k < 1 ? 5 : 2, 50, t * 5, 130, '#4fa3d8', '#2a5f88'); rrect(-80, wl + 10, 160, 140, 0, '#4fa3d8');
    for (let i = 0; i < 6; i++) { const u = (t * .6 + i / 6) % 1, y = lerp(120, wl + 8, u); if (y > wl + 8) circ(-40 + i * 16, y, 4, 'rgba(255,255,255,.65)'); } cx.restore();
    poly(G, null, '#5a86a8', 4); rrect(-54, -100, 10, 210, 5, 'rgba(255,255,255,.55)');
    if (k < 1) { const s = []; for (let i = 0; i <= 12; i++) { const u = i / 12; s.push([lerp(96, 10, u) + S(u * 3) * 10, lerp(-150, wl, u * u)]); } path(s, '#2a5f88', 16); path(s, '#4fa3d8', 10); path(s, '#d8ecf7', 3, { dash: [10, 14], f: t * 30 }); }
    at(160, -190, 1, k < 1 ? .55 : .2, () => { shape(() => { cx.moveTo(-50, -50); cx.lineTo(40, -50); cx.lineTo(50, 50); cx.lineTo(-60, 50); cx.closePath(); }, 'rgba(200,226,240,.6)', '#5a86a8', 3);
      rrect(-56, -10, 106, 58, 6, '#4fa3d8'); poly([[-50, -50], [-76, -64], [-58, -30]], 'rgba(200,226,240,.8)', '#5a86a8', 3); path(arcPts(54, 0, 30, 34, -PI / 2, PI / 2, 16), '#5a86a8', 8); }); }),

  sleepmoon: put((a, t) => { circ(0, 0, 210, '#232a5c', '#11143a', 3.5);
    [[-130, -100, 0], [120, -130, 1], [150, 40, 2], [-150, 70, 3], [60, 150, 4], [-60, -170, 5], [170, -40, 6], [-170, -20, 7]].forEach(([x, y, i]) => star(x, y, 12 * (.6 + .4 * S(t * 3 + i * 1.7)), '#f6d65a', '#c98a1a', 2));
    for (let i = 0; i < 2; i++) { const x = ((t * 20 + i * 220) % 440) - 220; cx.save(); cx.beginPath(); cx.arc(0, 0, 206, 0, TAU); cx.clip(); at(x, 130 + i * 40, .7, 0, () => puff([[-40, 0, 26], [0, -12, 32], [40, 0, 26]], '#5a64a0', '#3a4280')); cx.restore(); }
    at(0, -6, 1, S(t * 1.2) * .14, () => { const R = 100, r = 88, d = 52, ix = (R * R - r * r + d * d) / (2 * d), iy = Math.sqrt(R * R - ix * ix), oa = Math.atan2(iy, ix), ia = Math.atan2(iy, ix - d);
      cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 30; shape(() => { cx.arc(0, 0, R, oa, TAU - oa); cx.arc(d, 0, r, -ia, ia, true); cx.closePath(); }, '#f6e08a', '#c9a030', 3.5); cx.restore();
      path(arcPts(-58, 4, 14, 9, .2, PI - .2, 10), '#8a6a14', 3.5); circ(-52, 26, 8, 'rgba(240,140,120,.5)');
      shape(() => { cx.moveTo(-60, -76); cx.quadraticCurveTo(-10, -150, 60, -150); cx.quadraticCurveTo(30, -120, 20, -96); cx.quadraticCurveTo(-20, -90, -60, -76); cx.closePath(); }, '#5d86e0', '#2a3f7a', 3);
      path([[-62, -78], [20, -98]], '#ffffff', 9); circ(62, -150, 13, '#ffffff', '#8a93a6', 2.5); }); }),

  thunderstorm: put((a, t) => { const ph = t % 2.4, on = ph > 1.3 && ph < 1.62 && !(ph > 1.42 && ph < 1.48);
    if (on) soft([[0, 40, 200, '#fff3a8']]);
    rainLines(-220, 220, -40, 190, 34, t, '#4f7fb8', -10, 360);
    if (on) { const B = [[-10, -40], [-40, 40], [0, 40], [-30, 120], [10, 120], [-20, 200], [50, 90], [14, 90], [44, 20], [6, 20], [30, -40]];
      cx.save(); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 30; poly(B, '#f6d65a', '#c98a1a', 3); cx.restore(); poly(B.map(([x, y]) => [x * .5 + 4, y * .9 + 10]), '#fff8d0'); }
    rrect(-300, 196, 600, 30, 15, '#5f9a5f', '#2f5a3a', 3);
    at(S(t * .6) * 12, -100, 1, 0, () => { puff([[-170, 10, 54], [-110, -30, 72], [-20, -56, 86], [80, -40, 76], [160, 0, 56], [-40, 20, 60], [60, 20, 60]], on ? '#8a90a8' : '#6a7088', '#3a3f55', 3.5);
      puff([[-90, 30, 40], [0, 36, 44], [90, 30, 40]], on ? '#7a8098' : '#585e78', '#3a3f55', 3); }); }),

  tornado: put((a, t) => { const xo = i => S(t * 2 - i * .45) * (6 + i * 3.4);
    for (let i = 0; i < 12; i++) { const y = -140 + i * 28, w = 160 - i * 12.5; ell(xo(i), y, w, 17, 0, i % 2 ? '#9aa0ae' : '#b4bac6', '#5a6070', 3);
      const s = t * 6 + i * .9; if (S(s) > 0) path([[xo(i) + C(s) * w * .8 - 16, y + 6], [xo(i) + C(s) * w * .8 + 16, y + 6]], '#eef0f6', 4); }
    for (let i = 0; i < 8; i++) { const an = t * 5 + i * TAU / 8, y = 130 + S(an) * 14 - (i % 3) * 30, x = xo(10) + C(an) * (70 + (i % 3) * 20);
      at(x, y, 1, an, () => i % 2 ? ell(0, 0, 10, 5, 0, '#6fbf73', '#2f6b3a', 2) : rrect(-6, -4, 12, 8, 2, '#a07856', '#5a3a1a', 2)); }
    rrect(-300, 168, 600, 30, 15, '#c8b080', '#7a6a40', 3);
    for (let i = 0; i < 4; i++) { const u = (t * .7 + i / 4) % 1; fade(1 - u, () => circ(xo(11) + (i % 2 ? 1 : -1) * (40 + u * 90), 160 - u * 30, 14 + u * 16, '#d8c8a0', '#9a8a60', 2.5)); }
    puff([[-150, -170, 46], [-70, -196, 58], [30, -200, 62], [120, -180, 50], [-20, -160, 50]], '#6a7088', '#3a3f55', 3.5); }),

  snowfall: put((a, t) => {
    shape(() => { cx.moveTo(-340, 170); cx.quadraticCurveTo(-180, -60, 20, 170); cx.closePath(); }, '#dfe8f4', '#8a9ab8', 3);
    shape(() => { cx.moveTo(-60, 170); cx.quadraticCurveTo(140, -40, 340, 170); cx.closePath(); }, '#dfe8f4', '#8a9ab8', 3);
    pine(-150, 70, .8, t, 0, true); pine(170, 80, .7, t, 1, true); pine(240, 120, .55, t, 2, true);
    shape(() => { cx.moveTo(-340, 172); cx.quadraticCurveTo(-100, 60, 120, 140); cx.quadraticCurveTo(240, 110, 340, 150); cx.lineTo(340, 172); cx.closePath(); }, '#f8fbff', '#8a9ab8', 3);
    house(30, 128, .9, '#e05a4f', '#f6f8fc'); for (let i = 0; i < 3; i++) { const u = (t * .4 + i / 3) % 1; fade(1 - u, () => circ(52 + u * 30, 30 - u * 90, 8 + u * 10, '#e6e2da', '#8a93a6', 2)); }
    flakes(-320, 320, -220, 170, 38, t, 6); }),

  rainbow: put((a, t) => { const k = ease(clamp(t / 1.4)), band = 20, R0 = 220, Y = 110;
    if (k > 0) { cx.save(); cx.lineCap = 'butt'; cx.strokeStyle = '#5a5f78'; cx.lineWidth = 7 * band + 6; cx.beginPath(); cx.arc(0, Y, R0 - 3 * band, PI, PI + PI * k); cx.stroke();
      RAINBOW.forEach((c, i) => { cx.strokeStyle = c; cx.lineWidth = band + .5; cx.beginPath(); cx.arc(0, Y, R0 - i * band, PI, PI + PI * k); cx.stroke(); }); cx.restore(); }
    for (let i = 0; i < 4; i++) { const an = PI + PI * ((t * .15 + i / 4) % 1) * k; twinkle(C(an) * (R0 + 14), Y + S(an) * (R0 + 14), 14, .5 + .5 * S(t * 4 + i)); }
    for (const x of [-190, 190]) cloudP(x, Y, .95 + .03 * S(t * 2 + x)); }),

  wind: put((a, t) => { const g = .5 + .5 * S(t * 1.6), sk = .12 + .16 * g;
    rrect(-330, 150, 660, 30, 15, '#6fbf73', '#2f6b3a', 3);
    treeR(-210, 154, 1, '#5fae5f', '#2f6b3a', t, 0, sk); treeR(20, 154, 1.2, '#4f9a58', '#1f5a2a', t, 1, sk * .9); pine(220, 154, 1, t, 2, false, sk * .8);
    for (let i = 0; i < 4; i++) { const u = (t * .45 + i / 4) % 1, x0 = -380 + u * 640, y = -150 + i * 56, p = [];
      for (let j = 0; j <= 14; j++) p.push([x0 + j * 11, y + S(j * .5 + t * 4) * 5]); for (let j = 1; j <= 10; j++) { const an = -PI / 2 + j * .6; p.push([x0 + 154 + C(an) * (16 - j), y - 12 + S(an) * (16 - j)]); }
      fade(S(u * PI) * 1.2, () => { path(p, '#5a7a9a', 9); path(p, '#ffffff', 4); }); }
    for (let i = 0; i < 7; i++) { const u = (t * .35 + i / 7) % 1; at(-260 + u * 600, -70 + i * 24 + S(u * 10 + i) * 30, 1, t * 4 + i, () => ell(0, 0, 11, 6, 0, i % 2 ? '#6fbf73' : '#f2a830', '#2f6b3a', 2)); } }),

  seasons: put((a, t) => { const k = SEASONS.includes(a.k) ? a.k : SEASONS[Math.floor(t / 2.5) % 4], w = k === 'winter';
    ell(0, 160, 290, 36, 0, w ? '#f6f8fc' : k === 'autumn' ? '#a8b858' : '#6fbf73', w ? '#8a9ab8' : '#2f6b3a', 3);
    if (k === 'summer') sunDisc(220, -150, 40, t); if (k === 'spring') { sunDisc(230, -150, 28, t); for (const x of [-200, -150, 160, 210]) { path([[x, 150], [x, 128]], '#2f6b3a', 3); circ(x, 124, 8, x < 0 ? '#f07aa0' : '#f6d65a', '#8a2f4f', 2); } }
    at(0, 160, 1, S(t * 1.3) * .02, () => { cx.translate(0, -160);
      for (const p of [[[0, 150], [0, 30]], [[0, 50], [-80, -30]], [[0, 30], [70, -50]], [[0, 0], [-20, -80]], [[-50, 0], [-110, -10]], [[40, -20], [110, -20]]]) limb(p, '#9a6b45', '#4f3420', p[0][1] === 150 ? 26 : 12);
      const crown = [[0, -60, 70], [-72, -30, 52], [72, -30, 52], [-40, -110, 50], [45, -106, 52], [0, -10, 50], [-110, -20, 34], [112, -26, 34]];
      if (k === 'spring') { puff(crown, '#a8dc8a', '#3f8a46'); for (let i = 0; i < 14; i++) { const an = i * 2.4, r = 30 + (i * 37) % 70; flowerHead(C(an) * r * 1.2, -50 + S(an) * r * .8, 9, '#f8b8d0', '#b85a7a', t, i); } }
      if (k === 'summer') { puff(crown, '#3f9a4a', '#1f5a2a'); for (let i = 0; i < 9; i++) { const an = i * 2.1, r = 30 + (i * 29) % 60; circ(C(an) * r * 1.3, -50 + S(an) * r * .8, 11, '#e05a4f', '#7a2a24', 2.5); } }
      if (k === 'autumn') { puff(crown, '#e8883a', '#8a3a14'); for (let i = 0; i < 10; i++) { const an = i * 2.3, r = 20 + (i * 31) % 70; ell(C(an) * r * 1.3, -50 + S(an) * r * .8, 14, 9, an, '#d8502a', null); } }
      if (w) for (const [x, y, l] of [[-80, -30, 40], [70, -50, 40], [-20, -80, 26], [-110, -10, 22], [110, -20, 22]]) rrect(x - l / 2, y - 7, l, 9, 4, '#ffffff', '#8a9ab8', 1.5); });
    if (k === 'autumn') for (let i = 0; i < 8; i++) { const u = (t * .3 + i / 8) % 1; fade(1.3 - u, () => at(-150 + (i * 47) % 300 + S(u * 9 + i) * 30, -60 + u * 210, 1, u * 9 + i, () => ell(0, 0, 13, 7, 0, i % 2 ? '#e8883a' : '#d8502a', '#7a2a14', 2))); }
    if (k === 'spring') for (let i = 0; i < 6; i++) { const u = (t * .25 + i / 6) % 1; fade(1 - u, () => ell(-120 + i * 50 + S(u * 7) * 20, -40 + u * 190, 6, 4, u * 6, '#f8b8d0', '#b85a7a', 1.5)); }
    if (w) flakes(-300, 300, -220, 150, 32, t, 6); }),

  ocean: put((a, t) => { cx.save(); clipRect(-340, -240, 680, 420);
    wave(-340, 340, -30, 10, 160, t * 1.5, 170, '#8fcaf0', '#2a6f98');
    const u = (t * .4) % 1; if (u < .7) { const v = u / .7; fishy(lerp(-150, 110, v), -30 - S(v * PI) * 140, 1, '#f29a52', '#a8400a', t, 1); }
    wave(-340, 340, 30, 13, 130, t * 2 + 1, 170, '#4fa3d8', '#2a5f88');
    for (let i = 0; i < 3; i++) fishy(((t * 50 + i * 240) % 760) - 380, 70 + i * 16, .6, ['#f6d65a', '#e05a4f', '#9f74c0'][i], ['#a8840a', '#7a2a24', '#4a2a68'][i], t, 1, i);
    wave(-340, 340, 100, 12, 110, t * 2.6 + 2, 170, '#3f7fd0', '#1f3f78');
    for (let x = -340; x < 340; x += 110) { const xx = x + ((t * 30) % 110); circ(xx, 100 + S(xx / 110 * TAU + t * 2.6 + 2) * 12 - 4, 8, '#ffffff'); }
    cx.restore(); }),

  reef: put((a, t) => { cx.save(); clipRect(-340, -240, 680, 420);
    for (let i = 0; i < 6; i++) { const u = (t * .3 + i / 6) % 1; fade(1 - u, () => circ(-260 + i * 100 + S(u * 8 + i) * 10, 130 - u * 340, 6 + (i % 3) * 3, 'rgba(255,255,255,.5)', '#7ab0d8', 2)); }
    for (let i = 0; i < 3; i++) fishy(((t * 45 * (i % 2 ? -1 : 1) + i * 260) % 760 + 760) % 760 - 380, -150 + i * 50, .7, ['#f29a52', '#f6d65a', '#4fa3d8'][i], ['#a8400a', '#a8840a', '#1f4f78'][i], t, i % 2 ? -1 : 1, i);
    for (let i = 0; i < 5; i++) { const x = -300 + i * 140 + (i % 2) * 30, p = []; for (let j = 0; j <= 8; j++) p.push([x + S(t * 1.5 + j * .5 + i) * j * 3, 140 - j * (18 + (i % 3) * 5)]); limb(p, '#5fae5f', '#2f6b3a', 10); }
    const branch = (x, y, len, an, d) => { const ex = x + C(an) * len, ey = y + S(an) * len; limb([[x, y], [ex, ey]], '#f07a9a', '#8a2f4f', 6 + d * 3); if (d) { branch(ex, ey, len * .72, an - .5 + S(t + d) * .03, d - 1); branch(ex, ey, len * .72, an + .45, d - 1); } else circ(ex, ey, 8, '#f8a8c0', '#8a2f4f', 2.5); };
    branch(-170, 140, 60, -PI / 2, 3);
    at(130, 130, 1, S(t * 1.1) * .05, () => { for (let i = 0; i <= 8; i++) { const an = -PI + .25 + i * (PI - .5) / 8; limb([[0, 0], [C(an) * 100, S(an) * 100]], '#9f74c0', '#4a2a68', 5); } path(arcPts(0, 0, 100, 100, -PI + .25, -.25, 20), '#4a2a68', 5); });
    shape(() => { cx.moveTo(-40, 140); cx.arc(10, 140, 50, PI, 0); cx.closePath(); }, '#f2a830', '#8a5a14', 3); for (let i = 0; i < 3; i++) path(arcPts(10, 140, 40 - i * 12, 34 - i * 10, PI + .2, -.2, 14), '#c87a14', 3);
    shape(() => { cx.moveTo(-340, 180); cx.lineTo(-340, 140); for (let x = -340; x <= 340; x += 40) cx.quadraticCurveTo(x + 20, 132, x + 40, 140); cx.lineTo(340, 180); cx.closePath(); }, '#e8c88a', '#a07a3a', 3);
    star(-260, 150, 18, '#f29a52', '#a8400a', 2.5); cx.restore(); }),

  whale: put((a, t) => { const bob = S(t * 1.2) * 6;
    wave(-340, 340, 10, 6, 140, t * 1.5, 170, '#8fcaf0', '#2a6f98');
    for (let i = 0; i < 14; i++) { const u = (t * 1.1 + i / 14) % 1, vx = ((i % 7) - 3) * 34; fade(1 - u * .7, () => drop(80 + vx * u, -86 + bob - 300 * u + 290 * u * u, 7 + (i % 3) * 2, '#bfe2f8', '#2a6f98')); }
    path([[80, -80 + bob], [80, -150 + bob + S(t * 6) * 6]], '#bfe2f8', 14, { alpha: .9 });
    at(0, bob, 1, 0, () => { at(-206, -26, 1, S(t * 1.6) * .25, () => shape(() => { cx.moveTo(10, 10); cx.quadraticCurveTo(-30, -10, -66, -40); cx.quadraticCurveTo(-46, -6, -30, 4); cx.quadraticCurveTo(-60, 20, -76, 46); cx.quadraticCurveTo(-30, 30, 10, 20); cx.closePath(); }, '#3f5fa8', '#1a2a5a', 3));
      const body = () => { cx.moveTo(180, 30); cx.bezierCurveTo(180, -80, 40, -104, -60, -64); cx.bezierCurveTo(-130, -40, -170, -20, -206, -30); cx.lineTo(-204, -10); cx.bezierCurveTo(-120, 40, 60, 80, 180, 30); cx.closePath(); };
      shape(body, '#3f5fa8'); cx.save(); shape(body); cx.clip(); shape(() => { cx.moveTo(190, 12); cx.bezierCurveTo(90, 50, -40, 40, -210, -10); cx.lineTo(-210, 90); cx.lineTo(190, 90); }, '#a8c0e8');
      for (let i = 0; i < 5; i++) path([[150 - i * 22, 26 + i * 2], [120 - i * 22, 40 + i * 2]], '#7a90c0', 3); cx.restore(); shape(body, null, '#1a2a5a', 3.5);
      circ(118, -12, 6, '#1a1a1a'); hi(115, -15, 2); path([[178, 14], [130, 20], [96, 14]], '#1a2a5a', 3); ell(40, 20, 30, 12, .5, '#2f4f98', '#1a2a5a', 3); ell(80, -82, 9, 4, 0, '#1a2a5a'); hi(40, -60, 10); });
    wave(-340, 340, 36, 8, 110, t * 2, 170, 'rgba(79,163,216,.92)', '#2a5f88'); }),

  tide: put((a, t) => { const k = .5 - .5 * C(t * .9), wl = lerp(76, -16, k), surf = x => x < -120 ? lerp(-36, -14, (x + 340) / 220) : x < 100 ? lerp(-14, 50, (x + 120) / 220) : lerp(50, 112, (x - 100) / 240);
    at(lerp(-140, 160, k), -150 - S(k * PI) * 30, 1, 0, () => { cx.save(); cx.shadowColor = '#fff3c4'; cx.shadowBlur = 20; circ(0, 0, 34, '#f2eedc', '#8a8470', 3); cx.restore(); circ(-10, -8, 7, '#d8d2bc'); circ(10, 10, 5, '#d8d2bc'); });
    wave(-340, 340, wl, 4, 80, t * 3, 170, '#4fa3d8', '#2a5f88');
    poly([[-340, -36], [-120, -14], [100, 50], [340, 112], [340, 170], [-340, 170]], '#e8c88a', '#a07a3a', 3);
    let sx = 340; for (let x = -340; x <= 340; x += 4) if (surf(x) >= wl) { sx = x; break; }
    fade(.9, () => ell(sx + 10 + S(t * 3) * 6, wl - 2, 26, 6, Math.atan2(64, 220) * .6, '#ffffff', '#8ab8d8', 2));
    ell(-220, -42, 40, 26, 0, '#9a9590', '#4a4540', 3); ell(-238, -54, 12, 6, 0, 'rgba(255,255,255,.35)');
    star(-150, -6, 14, '#f29a52', '#a8400a', 2); shape(() => { cx.arc(-60, 18, 12, PI, 0); cx.closePath(); }, '#f8d8e0', '#a8566a', 2.5);
    for (let i = 0; i < 3; i++) path([[-260 + i * 60, 30 + i * 20], [-240 + i * 60, 30 + i * 20]], '#c8a060', 3); }),

  river: put((a, t) => {
    rrect(-340, -40, 680, 210, 30, '#8fcf7f', '#2f6b3a', 3);
    for (const [x, h, w] of [[-250, 170, 110], [-150, 130, 90]]) { poly([[x - w, -30], [x, -30 - h], [x + w, -30]], '#9a8fb8', '#5a4f78', 3); poly([[x - w * .3, -30 - h * .7], [x, -30 - h], [x + w * .3, -30 - h * .7], [x + w * .1, -30 - h * .62], [x - w * .1, -30 - h * .72]], '#ffffff', '#5a4f78', 2); }
    shape(() => { cx.moveTo(340, 20); cx.quadraticCurveTo(200, 30, 180, 90); cx.quadraticCurveTo(160, 140, 120, 170); cx.lineTo(340, 170); cx.closePath(); }, '#3f7fd0', '#1f3f78', 3);
    for (let i = 0; i < 3; i++) { const x = 220 + i * 40 + S(t * 2 + i) * 6; path(arcPts(x, 70 + i * 30, 12, 5, PI, TAU, 8), '#d8ecf7', 3); }
    const R = [[-200, -60], [-170, -10], [-200, 40], [-110, 70], [-10, 40], [70, 90], [150, 110], [200, 112]];
    path(R, '#1f4f78', 30); path(R, '#4fa3d8', 22); path(R, '#d8ecf7', 4, { dash: [16, 22], f: t * 15 });
    for (const [x, y, s] of [[-40, -10, .45], [10, -20, .5], [60, 0, .42], [-80, 140, .4]]) treeR(x, y, s, '#4f9a58', '#1f5a2a', t, x);
    fishy(250 + S(t * .8) * 40, 140, .45, '#f29a52', '#a8400a', t, C(t * .8) > 0 ? 1 : -1); }),

  desert: put((a, t) => {
    sunDisc(210, -140, 46, t); soft([[210, -140, 90, '#f6a03a']]);
    shape(() => { cx.moveTo(-340, 60); cx.quadraticCurveTo(-180, -40, -20, 50); cx.quadraticCurveTo(140, -10, 340, 40); cx.lineTo(340, 170); cx.lineTo(-340, 170); cx.closePath(); }, '#f2c878', '#b8843a', 3);
    shape(() => { cx.moveTo(-340, 130); cx.quadraticCurveTo(-120, 70, 80, 120); cx.quadraticCurveTo(220, 150, 340, 110); cx.lineTo(340, 170); cx.lineTo(-340, 170); cx.closePath(); }, '#e8a860', '#a8702a', 3);
    for (let i = 0; i < 5; i++) { const u = (t * .4 + i / 5) % 1, p = []; for (let j = 0; j <= 10; j++) p.push([-260 + i * 120 + S(j * 1.1 + t * 5 + i) * 6, 40 - u * 140 - j * 8]); fade(S(u * PI) * .8, () => path(p, '#ffffff', 3.5)); }
    at(-110, 110, 1, S(t * 1.2) * .02, () => { const G = '#5fae5f', E = '#2f6b3a';
      limb([[-30, -60], [-60, -60], [-60, -110]], G, E, 30); limb([[30, -90], [56, -90], [56, -136]], G, E, 26);
      rrect(-24, -190, 48, 196, 24, G, E, 3); for (const x of [-10, 0, 10]) path([[x, -176], [x, -6]], '#3f8a46', 2);
      flowerHead(0, -194, 14, '#f07aa0', '#8a2f4f', t); });
    at(170, 130, .6, 0, () => { rrect(-24, -120, 48, 126, 24, '#6fbf73', '#2f6b3a', 3); limb([[22, -60], [44, -60], [44, -96]], '#6fbf73', '#2f6b3a', 22); });
    ell(40, 140, 18, 9, 0, '#a89880', '#5a4a3a', 2.5); ell(70, 146, 10, 6, 0, '#a89880', '#5a4a3a', 2); }),

  rainforest: put((a, t) => {
    for (const [x, w] of [[-250, 18], [-90, 24], [70, 20], [230, 22]]) { rrect(x - w / 2, -60, w, 230, 4, '#7a5232', '#3a2414', 3); path([[x, 40], [x + 40, 10]], '#3a2414', 6); }
    for (let i = 0; i < 4; i++) { const x = -260 + i * 170, s = S(t * 1.2 + i) * 4; puff([[x - 60 + s, -110, 56], [x + s, -150, 70], [x + 64 + s, -110, 56], [x + 20 + s, -80, 50]], i % 2 ? '#2f7a44' : '#3f9a52', '#1a4a28', 3); }
    for (let i = 0; i < 5; i++) { const x = -220 + i * 105, p = []; for (let j = 0; j <= 8; j++) p.push([x + S(t * 1.4 + i + j * .3) * j * 2.5, -70 + j * 22]); path(p, '#3f8a46', 4); for (let j = 2; j <= 8; j += 2) ell(p[j][0] + 6, p[j][1], 8, 4, .5, '#5fae5f', '#2f6b3a', 1.5); }
    at(-120, -12, 1, S(t * 2) * .05, () => { ell(0, 0, 18, 26, 0, '#e05a4f', '#7a2a24', 2.5); circ(4, -24, 13, '#e05a4f', '#7a2a24', 2.5); poly([[14, -28], [26, -20], [14, -16]], '#f6d65a', '#a8840a', 2); circ(6, -27, 3, '#1a1a1a');
      poly([[-8, 20], [-22, 50], [-2, 26]], '#4fa3d8', '#1f4f78', 2); ell(-8, 4, 8, 16, .3, '#4fa3d8', '#1f4f78', 2); });
    rainLines(-320, 320, -120, 170, 40, t, '#4f7fb8', -4, 340);
    rrect(-340, 150, 680, 26, 12, '#3f7a3a', '#1a4a28', 3);
    for (const x of [-280, -150, 0, 140, 280]) for (let j = -2; j <= 2; j++) at(x, 154, 1, j * .45 + S(t * 1.5 + x) * .05, () => ell(0, -40, 10, 40, 0, '#4f9a58', '#1f5a2a', 2)); }),

  polar: put((a, t) => { const bob = S(t * 1.4) * 4;
    poly([[120, 40], [180, -110], [230, -150], [270, -80], [330, 40]], '#eef6fb', '#6a8ab0', 3); poly([[230, -150], [270, -80], [330, 40], [240, 40]], '#c8e0f0');
    wave(-340, 340, 50, 5, 90, t * 2, 170, '#3f7fd0', '#1f3f78');
    at(0, bob, 1, 0, () => { poly([[-250, 62], [150, 56], [170, 92], [-230, 98]], '#c8e0f0', '#6a8ab0', 3); poly([[-260, 50], [140, 44], [150, 62], [-250, 64]], '#f8fcff', '#6a8ab0', 3);
      penguin(-150, 56, .9, t, 0); penguin(-50, 54, 1, t, 1.7); penguin(50, 52, .75, t, 3.1); });
    wave(-340, 340, 110, 6, 120, t * 2.4 + 1, 170, 'rgba(47,111,200,.95)', '#1f3f78');
    flakes(-320, 320, -230, 40, 20, t, 5); }),

  earthquake: put((a, t) => { const amp = .6 + .4 * S(t * 1.5), q = S(t * 30) * 5 * amp;
    for (let i = 0; i < 3; i++) { const u = (t * .7 + i / 3) % 1; cx.save(); clipRect(-330, 76, 660, 100); fade(1 - u, () => path(arcPts(0, 180, 40 + u * 300, 20 + u * 90, PI, TAU, 30), '#7a4a2a', 4)); cx.restore(); }
    for (const sd of [-1, 1]) at(q * sd * .3, sd > 0 ? 4 * amp : 0, 1, 0, () => { const x0 = sd < 0 ? -330 : 4;
      poly([[x0, 60], [x0 + 326, 60], [x0 + 326, 176], [x0, 176]].map(([x, y]) => [x === 4 || x === -4 ? x + (y > 100 ? -8 : 8) : x, y]), '#a07856', '#5a3a1a', 3); rrect(x0, 56, 326, 16, 6, '#6fbf73', '#2f6b3a', 3); });
    path([[0, 60], [-10, 90], [8, 116], [-6, 146], [4, 176]], '#3a2414', 5);
    house(-180, 58, 1, '#f2c230', '#e05a4f', S(t * 26) * .04 * amp); house(170, 62, 1.1, '#9fc4e6', '#5d6fd0', S(t * 24 + 1) * .04 * amp); treeR(-40, 58, .6, '#5fae5f', '#2f6b3a', t, 0, S(t * 28) * .1 * amp);
    for (const [x, y] of [[-250, -30], [-110, -30], [90, -40], [250, -40]]) for (const sd of [-1, 1]) path(arcPts(x + sd * 10, y, 12, 18, sd > 0 ? -PI / 3 : PI * 2 / 3, sd > 0 ? PI / 3 : PI * 4 / 3, 8), '#5a5348', 3, { alpha: .4 + .6 * amp }); }),

  tsunami: put((a, t) => { const u = (t * .16) % 1, wx = lerp(300, -60, ease(u)), H = (24 + 90 * ease(u)) * clamp((1 - u) / .22);
    const sea = []; for (let x = -160; x <= 340; x += 8) { const z = (x - wx) / 80; sea.push([x, 40 - H * Math.exp(-z * z) * (z < 0 ? 1.15 : .85) + S(x * .05 + t * 2) * 3]); } sea.push([340, 170], [-160, 170]);
    poly(sea, '#4fa3d8', '#2a5f88', 3);
    for (let i = -1; i <= 1; i++) { const x = wx + i * 26; circ(x, 40 - H * Math.exp(-(((x - wx) / 80) ** 2)) - 2, 8 + (1 - Math.abs(i)) * 4, '#ffffff', '#8ab8d8', 2); }
    shape(() => { cx.moveTo(-340, 170); cx.lineTo(-340, -80); cx.quadraticCurveTo(-260, -150, -180, -90); cx.quadraticCurveTo(-120, -40, -100, 30); cx.quadraticCurveTo(-60, 60, 0, 70); cx.lineTo(0, 170); cx.closePath(); }, '#7cbf7c', '#2f6b3a', 3);
    house(-240, -116, .9, '#f6f4f0', '#e05a4f'); treeR(-170, -98, .45, '#4f9a58', '#1f5a2a', t, 2);
    at(220, -150, 1, 0, () => puff([[-40, 0, 28], [0, -12, 36], [42, 0, 28]], '#f6f4f0', '#8a93a6')); }),

  foodchain: put((a, t) => { const ent = (i, x, y, fn) => { const k = ease(clamp((t - i * .35) / .5)); if (k > 0) fade(k, () => at(x - (1 - k) * 50, y + S(t * 2.4 + i) * 3, 1, 0, fn)); };
    for (const [x0, x1] of [[-190, -90], [70, 160]]) { const p = [[x0, 40], [x1, 40]]; path(p, '#5a5348', 8); arrowHead(p, '#5a5348', 16);
      for (let i = 0; i < 2; i++) circ(lerp(x0, x1 - 10, (t * .6 + i / 2) % 1), 40, 6, '#f6d65a', '#c98a1a', 2); }
    ent(0, -260, 80, () => { for (let j = -3; j <= 3; j++) at(j * 12, 0, 1, j * .22 + S(t * 2 + j) * .06, () => poly([[-7, 0], [0, -70 + Math.abs(j) * 8], [7, 0]], j % 2 ? '#5fae5f' : '#6fbf73', '#2f6b3a', 2.5));
      path([[30, 0], [32, -46]], '#2f6b3a', 3); flowerHead(32, -50, 10, '#f6f4f0', '#8a93a6', t); rrect(-56, -4, 112, 12, 6, '#8a6a3a', '#5a3a1a', 2.5); });
    ent(1, -6, 64, () => { const nib = Math.max(0, S(t * 5)) * 4; ell(20, 0, 52, 36, 0, '#c8b8a8', '#6a5a4a', 3); circ(70, -8, 16, '#ffffff', '#8a8478', 2.5);
      for (const sd of [-1, 1]) ell(16 + sd * 26, 30, 16, 8, 0, '#c8b8a8', '#6a5a4a', 2.5);
      at(-30, -18 + nib, 1, 0, () => { ell(-6, -46, 9, 30, -.25, '#c8b8a8', '#6a5a4a', 2.5); ell(10, -46, 9, 30, .2, '#c8b8a8', '#6a5a4a', 2.5); ell(10, -46, 4, 20, .2, '#f8c8d0');
        circ(0, 0, 26, '#c8b8a8', '#6a5a4a', 3); circ(-10, -6, 4, '#1a1a1a'); circ(-25, 4, 4, '#e88aa0'); }); });
    ent(2, 250, 52, () => { const sw = S(t * 2.2) * .15, F = '#e8803a', FE = '#7a3a14';
      at(60, 10, 1, -.5 + sw, () => { ell(40, 0, 50, 22, 0, F, FE, 3); ell(78, 0, 16, 14, 0, '#ffffff'); });
      ell(10, 10, 60, 36, 0, F, FE, 3); for (const x of [-30, 40]) rrect(x - 7, 30, 14, 34, 6, F, FE, 2.5); ell(-26, 14, 20, 24, 0, '#f6f4f0');
      at(-56, -28, 1, S(t * 1.5) * .05, () => { poly([[-14, -24], [-6, -54], [6, -26]], F, FE, 2.5); poly([[8, -24], [22, -52], [24, -20]], F, FE, 2.5);
        shape(() => { cx.moveTo(26, -18); cx.quadraticCurveTo(10, -36, -16, -24); cx.lineTo(-56, 6); cx.quadraticCurveTo(-30, 18, 20, 16); cx.closePath(); }, F, FE, 3);
        poly([[-56, 6], [-30, 12], [-20, 2]], '#f6f4f0'); circ(-56, 4, 5, '#1a1a1a'); circ(-14, -10, 4, '#1a1a1a'); }); }); }),

  pollinate: put((a, t) => { const u = (t * .25) % 1, sx = lerp(-150, 150, .5 - .5 * C(u * TAU)), hop = Math.abs(S(u * TAU)), bx = sx, by = -30 - 110 * hop + S(t * 9) * 3;
    for (const [x, h, c, e] of [[-150, 150, '#f07aa0', '#8a2f4f'], [150, 130, '#9f74c0', '#4a2a68']]) { path([[x, 170], [x + 6, 170 - h]], '#3c7a46', 10); ell(x - 20, 110, 26, 10, -.5, '#6fbf73', '#2f6b3a', 2.5); flowerHead(x + 6, 170 - h - 10, 34, c, e, t, x); }
    for (let j = 1; j <= 10; j++) { const v = u - j * .015, px = lerp(-150, 150, .5 - .5 * C(v * TAU)), py = -30 - 110 * Math.abs(S(v * TAU)); circ(px, py + 14, 4 - j * .25, '#f6c230', null); }
    at(bx, by, 1, 0, () => { cx.scale(S(u * TAU) >= 0 ? 1 : -1, 1); const fl = .3 + .7 * Math.abs(C(t * 30));
      for (const sd of [-1, 1]) fade(.8, () => ell(-4 + sd * 8, -22, 12, 22 * fl, sd * .4, '#e8f4ff', '#7a9ab8', 2));
      ell(0, 0, 30, 20, 0, '#f6d65a', '#3a2a10', 3); cx.save(); cx.beginPath(); cx.ellipse(0, 0, 30, 20, 0, 0, TAU); cx.clip(); for (const x of [-14, 2]) cx.fillRect(x, -22, 8, 44); cx.restore(); ell(0, 0, 30, 20, 0, null, '#3a2a10', 3);
      poly([[-30, -2], [-40, 0], [-30, 3]], '#3a2a10'); circ(28, -4, 12, '#3a2a10'); circ(32, -7, 3, '#ffffff'); for (let i = 0; i < 4; i++) circ(-18 + i * 9, 18, 3, '#f6c230'); }); }),

  roots: put((a, t) => {
    rrect(-260, 0, 520, 180, [0, 0, 18, 18], '#a07856', '#6b4c33', 3); for (const [x, y, r] of [[-200, 60, 10], [180, 140, 12], [-120, 150, 8], [210, 40, 7]]) ell(x, y, r * 1.4, r, 0, '#8a6a4a', '#5a3a1a', 2);
    rrect(-260, -6, 520, 14, 6, '#6fbf73', '#2f6b3a', 2.5);
    const R = [[[0, 0], [4, 60], [-6, 120], [0, 170]], [[2, 40], [-60, 80], [-110, 130]], [[2, 40], [60, 70], [120, 116]], [[-2, 90], [-56, 140]], [[0, 100], [50, 150]]];
    R.forEach(p => limb(p, '#f2e4c0', '#8a6a3a', 6));
    R.forEach((p, i) => { const end = p.at(-1); drop(end[0] + S(t * 2 + i) * 4 + (i % 2 ? 20 : -20), end[1] + 4, 6, '#4fa3d8'); });
    const stem = [[0, 0], [0, -80], [0, -170]]; limb(stem, '#5fae6c', '#2f6b3a', 12);
    for (const [y, sd] of [[-60, -1], [-110, 1], [-150, -1]]) at(0, y, 1, sd * (.5 + S(t * 1.5 + y) * .08), () => { cx.scale(sd, 1); shape(() => { cx.moveTo(0, 0); cx.quadraticCurveTo(40, -36, 90, -10); cx.quadraticCurveTo(40, 22, 0, 0); }, '#6fbf73', '#2f6b3a', 3); path([[0, 0], [80, -10]], '#2f6b3a', 2); });
    for (let i = 0; i < 10; i++) { const r = R[i % 5], route = [...r].reverse().concat(r === R[0] ? [] : [[0, 0]], [[0, -170]]), u = (t * .3 + i / 10) % 1;
      circ(...along(route, u), 5.5, '#4fa3d8', '#ffffff', 1.5); } }),

  compost: put((a, t) => { const k = (t * .2) % 1, gone = 1 - k * .7;
    shape(() => { cx.moveTo(-230, 140); cx.quadraticCurveTo(-200, -60, 0, -70); cx.quadraticCurveTo(200, -60, 230, 140); cx.closePath(); }, '#7a5232', '#3a2414', 3.5);
    for (let i = 0; i < 26; i++) circ(-180 + (i * 61) % 360, -30 + (i * 37) % 160, 4 + i % 3, '#5a3a20');
    const bits = [[-120, 20, '#6fbf73', '#2f6b3a', .4], [60, -20, '#f29a52', '#a8400a', -.6], [120, 60, '#e05a4f', '#7a2a24', .2], [-40, 70, '#d8a860', '#8a5a2a', 1.1], [-150, 90, '#9fd88a', '#3f8a46', -.3]];
    bits.forEach(([x, y, c, e, r], i) => fade(gone, () => at(x, y, gone, r + S(t + i) * .05, () => i % 2 ? rrect(-26, -9, 52, 18, 9, mix(c, '#7a5232', k), e, 2.5) : ell(0, 0, 28, 13, 0, mix(c, '#7a5232', k), e, 2.5))));
    const wp = []; for (let i = 0; i <= 14; i++) wp.push([30 + i * 7, 100 + S(i * .6 - t * 5) * 7 - Math.max(0, S(t * .9)) * 40 * (i / 14)]); limb(wp, '#f0a0a8', '#8a3a4a', 8); circ(...wp[14], 3, '#8a3a4a');
    const h = 70 * ease(clamp(k * 1.6)); limb([[0, -66], [0, -66 - h]], '#5fae6c', '#2f6b3a', 6);
    if (h > 20) for (const sd of [-1, 1]) at(0, -66 - h, h / 70, sd * .4, () => { cx.scale(sd, 1); shape(() => { cx.moveTo(0, 0); cx.quadraticCurveTo(20, -24, 46, -10); cx.quadraticCurveTo(22, 10, 0, 0); }, '#6fbf73', '#2f6b3a', 2.5); });
    for (let i = 0; i < 3; i++) { const u = (t * .4 + i / 3) % 1, p = []; for (let j = 0; j < 8; j++) p.push([-150 + i * 140 + S(j + t * 4 + i) * 6, -40 - u * 120 - j * 8]); fade((1 - u) * .7, () => path(p, '#ffffff', 3)); } }),

  carboncycle: put((a, t) => { const RX = 200, RY = 130, CY = -10;
    rrect(-330, 130, 660, 40, 16, '#a07856', '#6b4c33', 3); rrect(-330, 124, 660, 14, 6, '#6fbf73', '#2f6b3a', 2.5);
    const loop = arcPts(0, CY, RX, RY, 0, TAU, 60); path(loop, '#5a5348', 5, { dash: [14, 14], f: -t * 12, alpha: .6 });
    for (const an of [-PI / 4, -PI * 3 / 4, PI * 3 / 4, PI / 4]) { const p = [[C(an + .08) * RX, CY + S(an + .08) * RY], [C(an) * RX, CY + S(an) * RY]]; arrowHead(p, '#5a5348', 16); }
    for (let i = 0; i < 5; i++) { const an = -t * .6 + i * TAU / 5, x = C(an) * RX, y = CY + S(an) * RY; circ(x - 13, y, 8, '#e05a4f', '#7a2a24', 2); circ(x + 13, y, 8, '#e05a4f', '#7a2a24', 2); circ(x, y, 10, '#4a4f60', '#1a1d30', 2); }
    puff([[-60, -170, 34], [-16, -186, 42], [32, -180, 40], [70, -164, 30], [0, -160, 36]], '#c8ccd8', '#6a7088');
    treeR(-RX, 128, .85, '#4f9a58', '#1f5a2a', t);
    at(RX, 128, .9, 0, () => { rrect(-60, -80, 120, 80, 3, '#c8603a', '#6a2a14', 3); poly([[-60, -80], [-30, -110], [-30, -80], [0, -110], [0, -80], [30, -110], [30, -80]], '#a84a2a', '#6a2a14', 3);
      rrect(36, -150, 22, 70, 3, '#8a8a94', '#3a3a44', 3); rrect(-20, -50, 26, 50, 2, '#5a3a24'); for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; fade(1 - u, () => circ(47 - u * 30, -160 - u * 70, 10 + u * 14, '#a8acb8', '#5a5e6a', 2.5)); } });
    for (let i = 0; i < 3; i++) at(-40 + i * 40, 140, 1, i, () => ell(0, 0, 12, 6, 0, mix('#6fbf73', '#7a5232', ((t * .3 + i / 3) % 1)), '#3a2414', 2)); }),

  greenhouse: put((a, t) => { const E = [60, 40], R = 108, A = 168;
    soft([[E[0], E[1], 140, '#f29a52']]);
    circ(...E, A, 'rgba(160,214,240,.35)', '#6ab0d8', 4); circ(...E, A - 12, null, 'rgba(106,176,216,.4)', 2);
    cx.save(); cx.beginPath(); cx.arc(...E, R, 0, TAU); cx.clip(); circ(...E, R, '#3f7fd0');
    for (const [u, y, rx, ry] of [[0, -30, 36, 26], [.33, 25, 42, 30], [.62, -10, 28, 40], [.85, 40, 24, 16]]) ell(E[0] + (((u + t * .05) % 1) * 2.6 - 1.3) * R, E[1] + y, rx, ry, 0, '#5fae5f', 'rgba(0,0,0,.18)', 2);
    ell(E[0], E[1] - R, R * .5, R * .18, 0, '#f6f4f0'); cx.restore(); circ(...E, R, null, '#1f3f78', 3.5); hi(E[0] - 40, E[1] - 40, 18);
    sunDisc(-270, -170, 40, t);
    for (let i = 0; i < 3; i++) { const p = [[-224, -150 + i * 30], [E[0] - 70 + i * 6, E[1] - 70 + i * 34]]; path(p, '#c98a1a', 10); path(p, '#f6d65a', 6, { dash: [16, 12], f: t * 20 }); arrowHead(p, '#c98a1a', 14); }
    const routes = [[[E[0] + 60, E[1] - 90], [E[0] + 126, E[1] - 112], [E[0] + 92, E[1] - 30]], [[E[0] + 92, E[1] + 50], [E[0] + 158, E[1] + 64], [E[0] + 94, E[1] + 92]], [[E[0] - 10, E[1] - 104], [E[0] - 30, E[1] - 250]]];
    routes.forEach((r, i) => { const u = (t * .45 + i / 3) % 1, P = along(r, u), Q = along(r, Math.max(0, u - .12)), d = Math.atan2(P[1] - Q[1], P[0] - Q[0]);
      const w = []; for (let j = 0; j <= 10; j++) { const s = j / 10, x = lerp(Q[0], P[0], s), y = lerp(Q[1], P[1], s); w.push([x + C(d + PI / 2) * S(s * TAU * 1.5) * 6, y + S(d + PI / 2) * S(s * TAU * 1.5) * 6]); }
      path(w, '#a8240a', 9); path(w, '#f2603a', 5); arrowHead(w, '#a8240a', 13); }); }),

  glacier: put((a, t) => { const k = (t * .1) % 1, fx = lerp(190, 120, k);
    sunDisc(250, -170, 32, t);
    for (const [x, h, w] of [[-220, 220, 150], [120, 190, 130]]) { poly([[x - w, 60], [x, -60 - h * .6], [x + w, 60]], '#9a8fb8', '#5a4f78', 3); poly([[x - w * .3, -60 - h * .42], [x, -60 - h * .6], [x + w * .3, -60 - h * .42], [x, -60 - h * .48]], '#ffffff', '#5a4f78', 2); }
    wave(-340, 340, 80, 4, 90, t * 2, 170, '#3f7fd0', '#1f3f78');
    const ice = () => { cx.moveTo(-300, -10); cx.quadraticCurveTo(-120, -60, fx, 30); cx.lineTo(fx - 6, 96); cx.quadraticCurveTo(-60, 110, -300, 70); cx.closePath(); };
    shape(ice, '#e4f2fb', '#6a9ac0', 3.5); cx.save(); shape(ice); cx.clip(); poly([[fx - 30, 20], [fx + 10, 20], [fx, 110], [fx - 40, 110]], '#a8d0ea');
    for (const [x, y] of [[-200, 0], [-120, -10], [-40, 6], [40, 20]]) path([[x, y], [x + 10, y + 28], [x + 2, y + 48]], '#8ab8d8', 3);
    const st = [[-220, 30], [-100, 44], [20, 52], [fx - 10, 60]]; path(st, '#4fa3d8', 5); path(st, '#d8ecf7', 2, { dash: [8, 12], f: t * 20 }); cx.restore();
    for (let i = 0; i < 4; i++) { const u = (t * .9 + i / 4) % 1; drop(fx - 4 + i * 3, 70 + u * 30, 4, '#9fd0f0'); }
    const c = (t * .35) % 1, fall = Math.min(1, c * 2.2); at(fx + 14 + fall * 30 + Math.max(0, c - .45) * 120, 40 + fall * 50 + S(t * 2) * 2 * (c > .45), 1, fall * .5, () => poly([[-16, -26], [16, -22], [20, 22], [-18, 24]], '#e4f2fb', '#6a9ac0', 3));
    for (let i = 0; i < 2; i++) { const x = 240 + i * 60 + S(t + i) * 6; poly([[x - 20, 96], [x - 10, 76], [x + 14, 78], [x + 20, 96]], '#e4f2fb', '#6a9ac0', 2.5); } }),
});
}
