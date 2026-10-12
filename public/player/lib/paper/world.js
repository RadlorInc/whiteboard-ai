// Paper-motion library: the WORLD — buildings, vehicles, tech, money, nature, animals, people, places, everyday things.
// Every call: name x y scale (centred on x y; defaults 480 300 1), rot=deg; colour override c=#rrggbb where noted.
// Flat cut-paper shapes, dark ~3 px outlines, nothing written inside the frame.
{
const W_HASH = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const wAt = (a, f, i = 0) => { const [x = 480, y = 300, s = 1] = a.v; cx.save(); cx.translate(x + jig(f, i + 1), y + jig(f, i + 2));
  if (a.rot) cx.rotate(a.rot * Math.PI / 180); cx.scale(s, s); };
const wCol = (a, def) => typeof a.c === 'string' && /^#[0-9a-f]{6}$/i.test(a.c) ? [a.c, mix(a.c, '#000000', .55)] : def;
const ell = (x, y, rx, ry, rot, fill, edge, lw = 3) => { cx.beginPath(); cx.ellipse(x, y, rx, ry, rot, 0, TAU); if (fill) { cx.fillStyle = fill; cx.fill(); } if (edge) { cx.strokeStyle = edge; cx.lineWidth = lw; cx.stroke(); } };
const limb = (pts, fill, edge, w) => { path(pts, edge, w + 6); path(pts, fill, w); };
const puffs = (x, y, t, col = '#d6d9e0', edge = '#7a808c', n = 4, h = 110) => { for (let i = 0; i < n; i++) { const u = (t * .35 + i / n) % 1;
  cx.save(); cx.globalAlpha *= (1 - u) * .95; circ(x + u * 40 + Math.sin(u * 6 + i) * 6, y - u * h, 10 + u * 20, col, edge, 2.5); cx.restore(); } };
const wheel = (x, y, r, ang) => { circ(x, y, r, '#2a2a33', '#111118', 3); circ(x, y, r * .55, '#c9c4ba', '#4a4f5a', 2.5);
  for (let k = 0; k < 4; k++) path([[x, y], [x + Math.cos(ang + k * Math.PI / 2) * r * .5, y + Math.sin(ang + k * Math.PI / 2) * r * .5]], '#4a4f5a', 3); circ(x, y, r * .14, '#4a4f5a'); };
const spark = (x, y, r, col) => { const p = []; for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, rr = i % 2 ? r * .3 : r; p.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); } poly(p, col); };
const clipRect = (x, y, w, h) => { cx.beginPath(); cx.rect(x, y, w, h); cx.clip(); };

const carBody = (t, col, edge) => {
  poly([[-64, -34], [-40, -74], [44, -74], [76, -34]], col, edge);
  rrect(-118, -38, 236, 58, 18, col, edge);
  poly([[-52, -38], [-34, -64], [-4, -64], [-4, -38]], '#9fc4e6', edge, 2.5); poly([[4, -38], [4, -64], [40, -64], [62, -38]], '#9fc4e6', edge, 2.5);
  circ(108, -16, 7, '#ffd75e', edge, 2); rrect(-121, -22, 10, 12, 3, '#d9473b');
  wheel(-66, 20, 24, t * 8); wheel(66, 20, 24, t * 8); };

const treeK = (k, t, f, i = 0) => { cx.save(); cx.translate(0, 130); cx.rotate(Math.sin(t * 1.4 + i) * .03); cx.translate(0, -130);
  if (k === 'pine') { rrect(-12 + jig(f, i), 90, 24, 40, 3, '#9a6b45', '#4f3420');
    [[100, 100, -10], [80, 40, -70], [60, -20, -130]].forEach(([w, b, top], j) => poly([[-w + jig(f, i + j), b], [jig(f, i + j + 5), top], [w, b]], '#2f8a4a', '#1a4f2a')); }
  else if (k === 'palm') { const trunk = [[0, 130], [8, 60], [20, -10], [30, -66]]; limb(trunk, '#b07a4a', '#5a3a1a', 22);
    for (let j = 1; j < 6; j++) { const [px, py] = along(trunk, j / 6); path([[px - 10, py], [px + 10, py - 3]], '#5a3a1a', 3); }
    for (const [rot, side] of [[-.7, 1], [-.15, 1], [.45, 1], [-.7, -1], [-.15, -1], [.45, -1], [-1.45, 1]]) { cx.save(); cx.translate(30, -70); cx.scale(side, 1); cx.rotate(rot + Math.sin(t * 2 + rot) * .05);
      cx.beginPath(); cx.moveTo(0, 0); cx.quadraticCurveTo(55, -38, 118, 8); cx.quadraticCurveTo(55, -4, 0, 0); cx.fillStyle = '#4caf5a'; cx.fill(); cx.strokeStyle = '#1f5a2a'; cx.lineWidth = 3; cx.stroke(); cx.restore(); }
    circ(22, -62, 10, '#7a4a2a', '#3d2412', 2.5); circ(38, -60, 10, '#7a4a2a', '#3d2412', 2.5); }
  else { poly([[-14, 130], [14, 130], [10, 0], [-10, 0]], '#9a6b45', '#4f3420');
    const C = [[-50, -30, 58], [48, -34, 58], [0, -82, 66], [0, -22, 62]]; C.forEach(([x, y, r], j) => circ(x + jig(f, i + j), y, r, null, '#1f5a2a', 6)); C.forEach(([x, y, r], j) => circ(x + jig(f, i + j), y, r, '#4caf5a')); }
  cx.restore(); };

const ANIMALS = {
  cow: (t, f) => { for (const x of [-82, -52, 40, 70]) { rrect(x, 30, 18, 70, 5, '#f6f4f0', '#3a3a3a'); rrect(x, 88, 18, 12, 3, '#3a3a3a'); }
    const sw = Math.sin(t * 3); path([[-102, -24], [-118 + sw * 8, 18], [-112 + sw * 14, 52]], '#3a3a3a', 4); circ(-112 + sw * 14, 56, 7, '#3a3a3a');
    rrect(-105, -55, 200, 95, 40, '#f6f4f0'); cx.save(); cx.beginPath(); cx.roundRect(-105, -55, 200, 95, 40); cx.clip(); circ(-45, -35, 30, '#3a3a3a'); circ(25, 20, 26, '#3a3a3a'); circ(75, -48, 20, '#3a3a3a'); cx.restore();
    rrect(-105, -55, 200, 95, 40, null, '#3a3a3a');
    cx.save(); cx.translate(92, -40); cx.rotate(Math.sin(t * 1.2) * .1); cx.translate(-92, 40);
    poly([[92, -96], [84, -116], [100, -100]], '#f3e3b0', '#7a6a3a', 2.5); poly([[132, -96], [142, -116], [124, -100]], '#f3e3b0', '#7a6a3a', 2.5);
    ell(82, -80, 16, 9, -.4, '#f6f4f0', '#3a3a3a'); rrect(88, -100, 56, 76, 24, '#f6f4f0', '#3a3a3a'); rrect(90, -46, 52, 32, 15, '#f0a6b0', '#8a4a54');
    circ(106, -30, 3.5, '#8a4a54'); circ(126, -30, 3.5, '#8a4a54'); circ(104, -72, 4.5, '#2a2a33'); circ(128, -72, 4.5, '#2a2a33'); cx.restore(); },
  sheep: (t, f) => { for (const x of [-60, -32, 32, 58]) rrect(x, 20, 14, 80, 5, '#3a3a3a', '#1a1a20', 2.5);
    const W = []; for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; W.push([Math.cos(an) * 78, -10 + Math.sin(an) * 44, 30]); }
    W.forEach(([x, y, r], i) => circ(x + jig(f, i), y, r, null, '#7a7466', 6)); W.forEach(([x, y, r], i) => circ(x + jig(f, i), y, r, '#f6f1e4')); ell(0, -10, 80, 46, 0, '#f6f1e4');
    cx.save(); cx.translate(92, -30); cx.rotate(Math.sin(t * 1.5) * .12); ell(14, -6, 26, 36, .5, '#3a3a3a', '#1a1a20'); ell(-4, -30, 16, 8, -.5, '#3a3a3a', '#1a1a20'); circ(18, -16, 4, '#f6f4f0'); cx.restore();
    circ(80, -40, 20, '#f6f1e4', '#7a7466'); },
  camel: (t, f) => { const C = '#d9a85c', E = '#7a5414';
    for (const x of [-72, -48, 44, 68]) { rrect(x, 0, 16, 100, 6, C, E); }
    const sw = Math.sin(t * 2.4); path([[-96, -6], [-108 + sw * 6, 30]], E, 4);
    const nod = Math.sin(t * 1.3) * 6, neck = [[78, -20], [110, -60], [124, -96 + nod]];
    ell(0, -6, 98, 42, 0, null, E, 6); ell(-14, -40, 52, 46, 0, null, E, 6); path(neck, E, 34);
    ell(0, -6, 98, 42, 0, C); ell(-14, -40, 52, 46, 0, C); path(neck, C, 28);
    ell(144, -100 + nod, 34, 18, .15, C, E); ell(118, -114 + nod, 8, 5, -.6, C, E, 2.5); circ(146, -108 + nod, 4, '#2a2a33'); },
  lion: (t, f) => { const C = '#e0a03a', E = '#7a4a10', M = '#b8601a';
    for (const x of [-86, -56, 30, 60]) rrect(x, 20, 22, 80, 8, C, E);
    const sw = Math.sin(t * 2.5); path([[-98, -10], [-130, -20 + sw * 10], [-140, -50 + sw * 14]], E, 6); circ(-140, -54 + sw * 14, 11, M, '#5a2a08');
    rrect(-102, -42, 182, 82, 38, C, E);
    const R = 64 + Math.sin(t * 2) * 2, P = []; for (let i = 0; i < 28; i++) { const an = i / 28 * TAU; P.push([96 + Math.cos(an) * (i % 2 ? R * .75 : R), -50 + Math.sin(an) * (i % 2 ? R * .75 : R)]); }
    poly(P, M, '#5a2a08'); circ(96, -50, 38, C, E); ell(110, -36, 18, 13, 0, '#f3d39a', E, 2.5);
    poly([[104, -46], [118, -46], [111, -38]], '#3a2010'); circ(88, -60, 4.5, '#2a2a33'); circ(114, -60, 4.5, '#2a2a33'); },
  elephant: (t, f) => { const C = '#9aa0aa', E = '#4a4f5a';
    for (const x of [-88, -46, 24, 64]) rrect(x, 0, 34, 100, 8, C, E);
    path([[-108, -20], [-122, 20]], E, 4);
    ell(0, -14, 112, 72, 0, C, E); circ(110, -46, 48, C, E);
    const sw = Math.sin(t * 1.6) * 14; limb([[140, -30], [156 + sw * .3, 10], [150 + sw, 52], [134 + sw, 66]], C, E, 24);
    poly([[128, -14], [150, 0], [130, -2]], '#f6f4f0', E, 2.5);
    const flap = .8 + .2 * Math.sin(t * 3); ell(86, -40, 36 * flap, 54, 0, '#8a909c', E); ell(88, -40, 22 * flap, 38, 0, '#c9a6ae');
    circ(128, -62, 5, '#2a2a33'); },
};

Object.assign(LIB, {
  // ---------- buildings and places
  house: (a, t, f) => { wAt(a, f); const [w, e] = wCol(a, ['#e8b04a', '#7a5414']);
    puffs(64, -124, t); rrect(50, -120, 28, 60, 3, '#c8473b', '#5a1c16');
    rrect(-100 + jig(f, 3), -30, 200, 130, 4, w, e); poly([[-122, -24], [jig(f, 4), -128], [122, -24]], '#c8473b', '#5a1c16');
    rrect(-22, 28, 44, 72, 6, '#7a4a2a', '#3d2412'); circ(12, 66, 4, '#f2c230');
    for (const wx of [-82, 44]) { rrect(wx, 0, 38, 36, 4, '#ffd75e', '#5a4a1a'); path([[wx + 19, 0], [wx + 19, 36]], '#5a4a1a', 3); path([[wx, 18], [wx + 38, 18]], '#5a4a1a', 3); }
    cx.restore(); },
  city: (a, t, f) => { wAt(a, f); const B = [[-240, 80, 190, '#3d4a8a'], [-158, 74, 260, '#2f3566'], [-82, 96, 210, '#4b2f74'], [16, 80, 290, '#2f3566'], [98, 70, 170, '#3d4a8a'], [170, 72, 230, '#4b2f74']];
    path([[56, -150], [56, -190]], '#151838', 4); circ(56, -192, 6, Math.floor(t * 2) % 2 ? '#e05a4f' : '#6b1e18');
    B.forEach(([x, w, h, c], b) => { rrect(x + jig(f, b), 140 - h, w, h, 3, c, '#151838');
      const cols = Math.floor((w - 12) / 22), x0 = x + (w - cols * 22 + 10) / 2;
      for (let r = 0; 20 + r * 30 + 16 < h - 10; r++) for (let k = 0; k < cols; k++) { const on = W_HASH(b * 97 + r * 13 + k + Math.floor(t * 1.2 + W_HASH(b + r * 3 + k) * 4) * 7) > .42;
        rrect(x0 + k * 22, 140 - h + 20 + r * 30, 12, 16, 2, on ? '#ffd75e' : '#1f2448'); } });
    cx.restore(); },
  factory: (a, t, f) => { wAt(a, f);
    for (const [x, top, w] of [[50, -170, 32], [104, -140, 28]]) { puffs(x + w / 2, top - 6, t + x * .01, '#c9cdd6', '#6a707c', 4, 120);
      rrect(x, top, w, -30 - top, 3, '#7d8796', '#3a3f4a'); rrect(x, top + 12, w, 10, 0, '#d9473b', '#6b1e18', 2); }
    for (let i = 0; i < 4; i++) { const x0 = -160 + i * 50; poly([[x0, -40], [x0, -92], [x0 + 50, -40]], '#7d8796', '#3a3f4a'); rrect(x0 + 3, -80, 8, 34, 2, '#9fc4e6'); }
    rrect(-160 + jig(f, 5), -40, 320, 150, 3, '#c8573b', '#5a1c16');
    for (let i = 0; i < 5; i++) rrect(-140 + i * 46, -12, 30, 34, 3, '#ffd75e', '#5a4a1a', 2.5);
    rrect(96, 40, 48, 70, 3, '#7d8796', '#3a3f4a'); for (let i = 1; i < 4; i++) path([[96, 40 + i * 17], [144, 40 + i * 17]], '#3a3f4a', 2.5);
    cx.restore(); },
  shop: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#d9473b', '#6b1e18']);
    rrect(-120, -50, 240, 150, 4, '#f6f4f0', '#5a5348'); rrect(-130, -92, 260, 42, 4, '#3d7fd0', '#1a3a6b');
    rrect(-100, 0, 112, 80, 4, '#9fc4e6', '#1a3a6b'); path([[-96, 50], [8, 50]], '#1a3a6b', 3);
    [['#ef8a2e', -82], ['#4caf5a', -58], ['#d9473b', -34]].forEach(([fc, x]) => circ(x, 38, 11, fc, '#3a3a3a', 2)); rrect(-14, 22, 20, 26, 2, '#f2c230', '#5a4a1a', 2); rrect(-84, 58, 30, 22, 2, '#7d55b8', '#3a2260', 2);
    rrect(32, 10, 60, 90, 4, '#2f8a4a', '#1f5a2a'); circ(80, 58, 4, '#f2c230');
    for (let i = 0; i < 6; i++) { const x = -120 + i * 40, col = i % 2 ? '#f6f4f0' : c, dy = Math.sin(t * 3 + i) * 2;
      cx.beginPath(); cx.moveTo(x, -50); cx.lineTo(x + 40, -50); cx.lineTo(x + 40, -16 + dy); cx.arc(x + 20, -16 + dy, 20, 0, Math.PI); cx.closePath(); cx.fillStyle = col; cx.fill(); cx.strokeStyle = e; cx.lineWidth = 3; cx.stroke(); }
    cx.restore(); },
  bank: (a, t, f) => { wAt(a, f); const S = '#ece4d0', E = '#6b6250';
    rrect(-160, 92, 320, 18, 2, S, E); rrect(-145, 76, 290, 18, 2, S, E); rrect(-130, -44, 260, 124, 0, '#d8ceb4', E);
    rrect(-18, 16, 36, 60, [18, 18, 0, 0], '#5a4a3a', '#2a2018');
    for (const x of [-96, -46, 46, 96]) { rrect(x - 14 + jig(f, x), -44, 28, 120, 2, S, E); path([[x - 5, -36], [x - 5, 70]], '#c9bfa4', 3); path([[x + 5, -36], [x + 5, 70]], '#c9bfa4', 3); }
    rrect(-150, -64, 300, 22, 2, S, E); poly([[-160, -62], [0, -140], [160, -62]], S, E);
    cx.save(); cx.translate(0, -88); cx.scale(Math.max(.15, Math.abs(Math.cos(t * 2))), 1); circ(0, 0, 20, '#f2c230', '#8a6414'); circ(0, 0, 13, null, '#c98a1a', 2.5); cx.restore();
    cx.restore(); },
  school: (a, t, f) => { wAt(a, f); const R = '#d9473b', E = '#6b1e18';
    rrect(-42, -132, 84, 96, 0, R, E); poly([[-54, -130], [jig(f, 3), -190], [54, -130]], '#2f3566', '#151838');
    rrect(-22, -120, 44, 44, [22, 22, 0, 0], '#3a1a14', '#1a0a08');
    cx.save(); cx.translate(0, -116); cx.rotate(Math.sin(t * 4) * .35); path([[0, 0], [0, 8]], '#5a4210', 3);
    cx.beginPath(); cx.moveTo(-14, 34); cx.quadraticCurveTo(-12, 8, 0, 8); cx.quadraticCurveTo(12, 8, 14, 34); cx.closePath(); cx.fillStyle = '#f2c230'; cx.fill(); cx.strokeStyle = '#8a6414'; cx.lineWidth = 2.5; cx.stroke(); circ(0, 36, 4, '#8a6414'); cx.restore();
    rrect(-160, -52, 320, 16, 3, '#7a2a24', '#3a1210'); rrect(-150 + jig(f, 4), -36, 300, 136, 3, R, E);
    for (const x of [-130, -88, 60, 102]) for (const y of [-20, 36]) { rrect(x, y, 28, 32, 3, '#9fc4e6', E, 2.5); path([[x + 14, y], [x + 14, y + 32]], E, 2); }
    rrect(-26, 40, 52, 60, [26, 26, 0, 0], '#2f3566', '#151838'); path([[0, 44], [0, 100]], '#151838', 3);
    cx.restore(); },
  hospital: (a, t, f) => { wAt(a, f);
    rrect(-150, -80, 300, 180, 4, '#f6f4f0', '#5a5348'); rrect(-160, -96, 320, 22, 4, '#4fa3d8', '#1a3a6b');
    cx.save(); cx.shadowColor = '#9fd0ff'; cx.shadowBlur = 12 + 10 * Math.sin(t * 4); rrect(-34, -156, 68, 58, 10, '#3d7fd0', '#1a3a6b'); cx.restore();
    rrect(-8, -144, 16, 36, 3, '#ffffff'); rrect(-18, -134, 36, 16, 3, '#ffffff');
    for (const x of [-132, -92, -52, 24, 64, 104]) for (const y of [-60, -18]) rrect(x, y, 28, 26, 3, '#9fc4e6', '#1a3a6b', 2.5);
    for (const x of [-132, -92, 64, 104]) rrect(x, 24, 28, 26, 3, '#9fc4e6', '#1a3a6b', 2.5);
    rrect(-38, 52, 76, 48, 3, '#cfe6f5', '#1a3a6b'); path([[0, 52], [0, 100]], '#1a3a6b', 3); rrect(-54, 40, 108, 12, 3, '#3d7fd0', '#1a3a6b');
    cx.restore(); },
  bridge: (a, t, f) => { wAt(a, f);
    rrect(-280, 40, 560, 80, 8, '#3d7fd0', '#1a3a6b');
    for (let r = 0; r < 2; r++) { const pts = []; for (let x = -260; x <= 260; x += 10) pts.push([x, 66 + r * 26 + Math.sin(x * .05 + t * 3 + r * 2) * 4]); path(pts, '#9fc4e6', 3, { alpha: .8 }); }
    const cab = x => Math.abs(x) <= 138 ? -150 + 130 * (1 - (x / 138) ** 2) : -150 + (Math.abs(x) - 138) / 142 * 146;
    const pts = []; for (let x = -280; x <= 280; x += 8) pts.push([x, cab(x)]);
    for (let x = -264; x <= 264; x += 24) if (Math.abs(Math.abs(x) - 138) > 10) path([[x, cab(x)], [x, -6]], '#6b1e18', 2.5);
    path(pts, '#6b1e18', 6);
    for (const x of [-150, 126]) rrect(x + jig(f, x), -160, 24, 220, 3, '#d9473b', '#6b1e18');
    rrect(-284, -8, 568, 20, 3, '#d9473b', '#6b1e18');
    cx.save(); clipRect(-282, -60, 564, 60); const cxp = (t * 110) % 640 - 320; cx.translate(cxp, -26); cx.scale(.2, .2); carBody(t, '#f2c230', '#8a6414'); cx.restore();
    cx.restore(); },
  road: (a, t, f) => { wAt(a, f);
    rrect(-300, 0, 600, 56, 4, '#4a4f5a', '#22252c'); rrect(-300, 56, 600, 10, 0, '#c9c4ba', '#7a7466', 2);
    cx.save(); clipRect(-300, 20, 600, 16); for (let x = -340 - (t * 160) % 70; x < 320; x += 70) rrect(x, 24, 36, 8, 3, '#f2c230'); cx.restore();
    cx.save(); clipRect(-300, -120, 600, 180);
    [['#d9473b', '#6b1e18', 0], ['#3d7fd0', '#1a3a6b', 230], ['#4caf5a', '#1f5a2a', 420]].forEach(([c, e, off]) => { const x = (t * 120 + off) % 680 - 340;
      cx.save(); cx.translate(x, -20 + Math.sin(t * 14 + off) * .8); cx.scale(.45, .45); carBody(t, c, e); cx.restore(); });
    cx.restore(); cx.restore(); },
  pyramid: (a, t, f) => { wAt(a, f);
    rrect(-280, 60, 560, 46, 6, '#e8c27a', '#8a6a2a');
    for (const [x, h, w] of [[140, 120, 220], [-80, 190, 320]]) {
      poly([[x - w / 2, 60], [x + jig(f, x), 60 - h], [x + w * .12, 60]], '#f2c26a'); poly([[x + w * .12, 60], [x + jig(f, x), 60 - h], [x + w / 2, 60]], '#c98f3a');
      for (let k = 1; k < 5; k++) { const y = 60 - h * k / 5, hw = w / 2 * (1 - k / 5); path([[x - hw, y], [x + w * .12 * (1 - k / 5), y]], '#d9a85c', 2.5); }
      poly([[x - w / 2, 60], [x + jig(f, x), 60 - h], [x + w / 2, 60]], null, '#6b4a14'); path([[x + jig(f, x), 60 - h], [x + w * .12, 60]], '#6b4a14', 2.5); }
    const gl = .5 + .5 * Math.sin(t * 2.2); cx.save(); cx.translate(-80, -130); cx.rotate(t * .6); cx.shadowColor = '#fff3a8'; cx.shadowBlur = 16; spark(0, 0, 14 + 14 * gl, '#fffbe0'); cx.restore();
    for (let i = 0; i < 3; i++) { const u = (t * .45 + i / 3) % 1, pts = []; for (let j = 0; j <= 12; j++) pts.push([-230 + j * 38, 30 - u * 70 + Math.sin(j * 1.3 + t * 6 + i) * 4]);
      cx.save(); cx.globalAlpha = Math.sin(u * Math.PI) * .5; cx.lineCap = 'round'; path(pts, '#fff6dc', 3); cx.restore(); }
    for (let i = 0; i < 16; i++) { const x = ((t * (50 + (i % 4) * 14) + W_HASH(i) * 600) % 600) - 300, y = 72 + (i % 3) * 10 + Math.sin(t * 3 + i) * 4; ell(x, y, 5, 2.5, 0, '#c98f3a'); }
    cx.restore(); },
  castle: (a, t, f) => { wAt(a, f); const S = '#b8b2a6', E = '#4a4f5a';
    for (let i = 0; i < 7; i++) rrect(-140 + i * 42, -62, 24, 24, 2, S, E);
    rrect(-140, -42, 280, 142, 0, S, E);
    for (const x of [-200, 130]) { rrect(x + jig(f, x), -110, 70, 210, 0, S, E); rrect(x + 30, -60, 10, 28, 3, '#2a2a33'); rrect(x + 30, 10, 10, 28, 3, '#2a2a33');
      poly([[x - 10, -108], [x + 35, -200], [x + 80, -108]], '#3d7fd0', '#1a3a6b'); path([[x + 35, -200], [x + 35, -232]], '#4a4f5a', 3);
      const fl = Math.sin(t * 5 + x) * 6; poly([[x + 35, -232], [x + 68, -224 + fl], [x + 35, -214]], '#d9473b', '#6b1e18', 2.5); }
    rrect(-40, 20, 80, 80, [40, 40, 0, 0], '#3a2a20', '#1a1008');
    cx.save(); cx.beginPath(); cx.roundRect(-40, 20, 80, 80, [40, 40, 0, 0]); cx.clip(); for (let x = -30; x <= 30; x += 15) path([[x, 20], [x, 100]], '#7a808c', 3); for (let y = 40; y < 100; y += 18) path([[-40, y], [40, y]], '#7a808c', 3); cx.restore();
    cx.restore(); },
  globe: (a, t, f) => { wAt(a, f); const R = 110;
    circ(0, 0, R, '#3d7fd0'); cx.save(); cx.beginPath(); cx.arc(0, 0, R, 0, TAU); cx.clip();
    const LAND = [[0, -40, 55, 40, 1], [-150, 30, 45, 55, 2], [120, 50, 62, 34, 3], [230, -55, 42, 30, 4], [-60, 70, 30, 20, 5]];
    for (const [lx, ly, rx, ry, sd] of LAND) { const sx = ((lx + t * 30) % (4 * R) + 6 * R) % (4 * R) - 2 * R; if (Math.abs(sx) > R + rx) continue;
      const P = []; for (let i = 0; i < 24; i++) { const an = i / 24 * TAU, k = 1 + .22 * Math.sin(3 * an + sd) + .12 * Math.sin(5 * an + sd * 2);
        const px = clamp((sx + Math.cos(an) * rx * k) / R, -1, 1), py = ly + Math.sin(an) * ry * k; P.push([R * Math.sin(px * Math.PI / 2) * Math.sqrt(Math.max(0, 1 - (py / R) ** 2)), py]); }
      poly(P, '#4caf5a', '#1f5a2a'); }
    for (const lat of [-.5, 0, .5]) { const hw = R * Math.sqrt(1 - lat * lat); path([[-hw, lat * R], [hw, lat * R]], 'rgba(255,255,255,.35)', 2.5); }
    for (let m = 0; m < 3; m++) { const ph = t * 30 / (4 * R) * TAU + m * Math.PI / 3; ell(0, 0, Math.abs(R * Math.cos(ph)), R, 0, null, 'rgba(255,255,255,.3)', 2.5); }
    cx.restore(); circ(-42, -46, 20, 'rgba(255,255,255,.3)'); circ(0, 0, R, null, '#1a3a6b', 4); cx.restore(); },
  map: (a, t, f) => { wAt(a, f);
    for (let i = 0; i < 3; i++) { const x0 = -210 + i * 140, d = i % 2 ? 10 : 0; poly([[x0, -130 + d], [x0 + 140, -130 + (i % 2 ? 0 : 10)], [x0 + 140, 130 + (i % 2 ? 0 : 10)], [x0, 130 + d]], i % 2 ? '#e6d3a0' : '#f2e3b8', '#8a6a2a'); }
    ell(-130, -60, 42, 26, .2, '#7fb8e6', '#3d6f9a'); for (const [x, y] of [[100, -84], [126, -70], [108, -50]]) poly([[x - 14, y + 12], [x, y - 14], [x + 14, y + 12]], '#4caf5a', '#1f5a2a', 2.5);
    for (const [x, y, h] of [[-10, 96, 34], [26, 100, 26]]) poly([[x - 24, y], [x, y - h], [x + 24, y]], '#9aa0aa', '#4a4f5a', 2.5);
    const R = [[-170, 90], [-110, 40], [-40, 60], [10, -10], [80, 10], [150, -70]], k = ease(t / 2);
    path(upto(R, k), '#d9473b', 6, { dash: [14, 10] }); circ(-170, 90, 10, '#d9473b', '#6b1e18');
    if (k > .9) { const d = ease((k - .9) / .1), y = -70 - 30 * (1 - d); cx.save(); cx.globalAlpha *= d; poly([[138, y - 30], [150, y], [162, y - 30]], '#d9473b', '#6b1e18'); circ(150, y - 38, 18, '#d9473b', '#6b1e18'); circ(150, y - 38, 7, '#f6f4f0'); cx.restore(); }
    cx.restore(); },

  // ---------- vehicles
  car: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#d9473b', '#6b1e18']);
    for (let i = 0; i < 3; i++) { const u = (t * 2 + i / 3) % 1; path([[-140 - u * 60, -30 + i * 22], [-170 - u * 60, -30 + i * 22]], '#f6f4f0', 5, { alpha: 1 - u }); }
    cx.translate(0, Math.sin(t * 14) * 1.2); carBody(t, c, e); cx.restore(); },
  bus: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#f2c230', '#8a6414']); cx.translate(0, Math.sin(t * 12) * 1.2);
    rrect(-160, -92, 320, 132, 16, c, e); rrect(-160, -14, 320, 12, 0, '#d9473b', '#6b1e18', 2);
    for (let i = 0; i < 5; i++) rrect(-148 + i * 50, -78, 40, 40, 5, '#9fc4e6', e, 2.5);
    rrect(106, -78, 40, 104, 5, '#9fc4e6', e, 2.5); path([[126, -78], [126, 26]], e, 2.5); circ(152, 16, 7, '#ffd75e', e, 2);
    wheel(-96, 40, 26, t * 7); wheel(70, 40, 26, t * 7); cx.restore(); },
  train: (a, t, f) => { wAt(a, f); cx.translate(10, 0);
    path([[-300, 72], [270, 72]], '#4a4f5a', 5); cx.save(); clipRect(-300, 72, 570, 14); for (let x = -330 - (t * 140) % 40; x < 280; x += 40) rrect(x, 74, 24, 8, 2, '#7a4a2a'); cx.restore();
    puffs(197, -90, t, '#e6e8ee', '#7a808c', 4, 130);
    for (const x0 of [-280, -125]) { rrect(x0, -66, 145, 100, 10, '#d9473b', '#6b1e18'); for (let i = 0; i < 3; i++) rrect(x0 + 14 + i * 44, -52, 32, 34, 4, '#9fc4e6', '#6b1e18', 2.5);
      wheel(x0 + 32, 52, 18, t * 9); wheel(x0 + 112, 52, 18, t * 9); path([[x0 + 145, 20], [x0 + 155, 20]], '#3a3a3a', 6); }
    rrect(36, -84, 70, 118, 6, '#2f8a4a', '#1a4f2a'); rrect(50, -72, 40, 32, 4, '#9fc4e6', '#1a4f2a', 2.5); rrect(30, -92, 82, 12, 3, '#1a4f2a');
    rrect(100, -30, 124, 64, 24, '#2f8a4a', '#1a4f2a'); rrect(186, -84, 24, 56, 3, '#3a3a3a', '#111'); rrect(180, -92, 36, 10, 3, '#3a3a3a', '#111'); circ(150, -34, 12, '#f2c230', '#8a6414');
    poly([[224, 18], [250, 52], [224, 52]], '#3a3a3a', '#111'); rrect(36, 30, 190, 12, 3, '#3a3a3a');
    for (const x of [78, 140, 196]) wheel(x, 52, 18, t * 9);
    cx.restore(); },
  plane: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#3d7fd0', '#1a3a6b']); cx.translate(0, Math.sin(t * 2) * 8); cx.rotate(Math.sin(t * 2 + 1) * .04);
    for (let i = 0; i < 2; i++) { cx.save(); cx.setLineDash([24, 16]); cx.lineDashOffset = t * 80; path([[-160, -6 + i * 16], [-320, -6 + i * 16]], '#f6f4f0', 4, { alpha: .7 }); cx.restore(); }
    poly([[-10, -12], [34, -12], [4, -62], [-28, -62]], mix(c, '#000000', .25), e);
    poly([[-140, -10], [-166, -82], [-124, -82], [-92, -14]], c, e);
    rrect(-150, -26, 300, 52, 26, '#f6f4f0', '#3a4a6b'); rrect(-150, 6, 300, 7, 0, c);
    for (let i = 0; i < 7; i++) circ(-92 + i * 26, -6, 6, '#9fc4e6', '#3a4a6b', 2); poly([[106, -14], [130, -8], [106, -2]], '#2f3566');
    rrect(-150, -26, 300, 52, 26, null, '#3a4a6b'); poly([[-34, 8], [30, 8], [-14, 84], [-56, 84]], c, e); rrect(-30, 28, 40, 18, 9, '#9aa0aa', '#4a4f5a', 2.5);
    cx.restore(); },
  ship: (a, t, f) => { wAt(a, f); cx.save(); cx.translate(0, Math.sin(t * 2) * 4); cx.rotate(Math.sin(t * 1.5) * .04);
    puffs(30, -126, t); rrect(12, -120, 36, 62, 4, '#ef8a2e', '#7a3d0e'); rrect(12, -120, 36, 14, 2, '#2a2a33');
    rrect(-100, -70, 160, 54, 6, '#f6f4f0', '#5a5348'); for (let i = 0; i < 5; i++) circ(-76 + i * 28, -44, 8, '#9fc4e6', '#5a5348', 2.5);
    poly([[-190, -20], [196, -20], [154, 52], [-150, 52]], '#2f3566', '#151838'); poly([[-163, 24], [171, 24], [154, 52], [-150, 52]], '#d9473b', '#6b1e18');
    path([[-180, -10], [184, -10]], '#f6f4f0', 3); cx.restore();
    cx.save(); clipRect(-260, -40, 520, 140);
    for (let r = 0; r < 2; r++) { const y = 40 + r * 24, off = ((t * 40 * (r ? -1 : 1)) % 60 + 60) % 60;
      cx.beginPath(); cx.moveTo(-320, y + 50); cx.lineTo(-320, y); for (let x = -320 + off - 60; x < 320; x += 60) cx.quadraticCurveTo(x + 30, y - 18, x + 60, y);
      cx.lineTo(320, y + 50); cx.closePath(); cx.fillStyle = r ? '#2a5fa8' : '#3d7fd0'; cx.fill(); cx.strokeStyle = '#1a3a6b'; cx.lineWidth = 3; cx.stroke(); }
    cx.restore(); cx.restore(); },
  bicycle: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#d9473b', '#6b1e18']), ang = t * 5;
    for (const x of [-92, 92]) { circ(x, 40, 56, null, '#2a2a33', 9); for (let k = 0; k < 8; k++) path([[x, 40], [x + Math.cos(ang + k * Math.PI / 4) * 52, 40 + Math.sin(ang + k * Math.PI / 4) * 52]], '#7a808c', 2); circ(x, 40, 7, '#4a4f5a'); }
    const R = [-92, 40], B = [-8, 40], S = [-36, -36], H = [60, -40], F = [92, 40];
    for (const p of [[R, B], [R, S], [S, B], [S, H], [B, H], [H, F]]) limb(p, c, e, 7);
    rrect(-60, -52, 46, 12, 6, '#2a2a33'); path([[60, -40], [54, -64], [84, -68]], '#2a2a33', 6);
    const pa = t * 5; path([[B[0] + Math.cos(pa) * 22, 40 + Math.sin(pa) * 22], [B[0] - Math.cos(pa) * 22, 40 - Math.sin(pa) * 22]], '#2a2a33', 6); circ(B[0], 40, 12, '#9aa0aa', '#2a2a33', 2.5);
    cx.restore(); },
  cart: (a, t, f) => { wAt(a, f); cx.translate(0, Math.abs(Math.sin(t * 8)) * -2);
    rrect(-70, -124, 60, 52, 4, '#ef8a2e', '#7a3d0e'); rrect(-4, -112, 50, 40, 4, '#3d7fd0', '#1a3a6b'); circ(76, -92, 22, '#4caf5a', '#1f5a2a');
    path([[-160, -108], [-124, -108], [-84, 40]], '#4a4f5a', 7);
    const B = [[-112, -80], [134, -80], [104, 30], [-82, 30]]; poly(B, 'rgba(233,238,247,.75)', '#4a4f5a', 4);
    for (let i = 1; i < 6; i++) { const k = i / 6; path([[lerp(-112, 134, k), -80], [lerp(-82, 104, k), 30]], '#7a808c', 2.5); }
    for (const k of [1 / 3, 2 / 3]) path([[lerp(-112, -82, k), lerp(-80, 30, k)], [lerp(134, 104, k), lerp(-80, 30, k)]], '#7a808c', 2.5);
    path([[-82, 30], [-70, 58], [110, 58]], '#4a4f5a', 6); wheel(-52, 72, 14, t * 8); wheel(92, 72, 14, t * 8);
    cx.restore(); },

  // ---------- technology
  computer: (a, t, f) => { wAt(a, f);
    rrect(-130, -170, 260, 168, 10, '#2f3566', '#151838'); rrect(-116, -156, 232, 138, 4, '#9fc4e6');
    const H = [50, 82, 64, 104], C = ['#3d7fd0', '#4caf5a', '#ef8a2e', '#d9473b'];
    H.forEach((h, i) => { const k = ease(clamp((t - i * .2) / .8)) * (1 + .06 * Math.sin(t * 3 + i)); rrect(-92 + i * 48, -30 - h * k, 34, h * k, 3, C[i], '#151838', 2.5); });
    path([[-104, -30], [104, -30]], '#151838', 3);
    poly([[-150, -4], [150, -4], [172, 16], [-172, 16]], '#c9c4ba', '#7a7466'); rrect(-30, 2, 60, 6, 3, '#9a948a');
    cx.restore(); },
  phone: (a, t, f) => { wAt(a, f);
    rrect(-62, -118, 124, 236, 20, '#2f3566', '#151838'); rrect(-52, -96, 104, 182, 6, '#d8ecf7'); rrect(-14, -108, 28, 5, 2, '#151838'); circ(0, 102, 7, '#3d4a8a', '#151838', 2);
    const p = t % 3.6;
    [[-44, -84, 62, '#f6f4f0'], [-18, -48, 62, '#3d7fd0'], [-44, -12, 72, '#f6f4f0'], [-18, 24, 62, '#3d7fd0']].forEach(([x, y, w, c], i) => { if (p < i * .8) return;
      const k = ease(clamp((p - i * .8) / .25)); cx.save(); cx.globalAlpha *= k; rrect(x, y + (1 - k) * 10, w, 26, 12, c, '#5a6070', 2); cx.restore(); });
    cx.restore(); },
  server: (a, t, f) => { wAt(a, f);
    rrect(-80, -160, 160, 310, 8, '#2f3566', '#151838'); rrect(-70, 150, 24, 10, 2, '#151838'); rrect(46, 150, 24, 10, 2, '#151838');
    const L = ['#4caf5a', '#f2c230', '#4fa3d8'];
    for (let i = 0; i < 6; i++) { const y = -146 + i * 49; rrect(-66, y, 132, 40, 4, '#3d4a8a', '#151838', 2.5);
      for (let k = 0; k < 3; k++) path([[-54, y + 12 + k * 8], [-14, y + 12 + k * 8]], '#262b55', 3);
      for (let k = 0; k < 3; k++) { const on = W_HASH(i * 7 + k * 3 + Math.floor(t * 6 + W_HASH(i + k * 5) * 6)) > .4;
        cx.save(); if (on) { cx.shadowColor = L[k]; cx.shadowBlur = 10; } circ(18 + k * 16, y + 20, 5, on ? L[k] : '#262b55'); cx.restore(); } }
    cx.restore(); },
  wifi: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#3d7fd0', '#1a3a6b']), step = Math.floor(t * 3) % 4;
    circ(0, 60, 16, c, e);
    for (let i = 0; i < 3; i++) { const r = 52 + i * 46; cx.save(); cx.lineCap = 'round'; cx.beginPath(); cx.arc(0, 60, r, -Math.PI * .75, -Math.PI * .25);
      cx.strokeStyle = e; cx.lineWidth = 24; cx.stroke(); cx.strokeStyle = i < step ? c : mix(c, '#ffffff', .6); cx.lineWidth = 17; cx.stroke(); cx.restore(); }
    cx.restore(); },
  lock: (a, t, f) => { wAt(a, f); const k = a.shut ? 1 - ease(t / .45) : ease((t - .6) / .6);   // shut: closing from the first frame, closed by .45 s
    cx.save(); cx.translate(-40, 10 - 34 * k); cx.rotate(-.35 * k);
    cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -60); cx.arc(40, -60, 40, Math.PI, 0); cx.lineTo(80, 0); cx.lineCap = 'butt';
    cx.strokeStyle = '#4a4f5a'; cx.lineWidth = 26; cx.stroke(); cx.strokeStyle = '#b8bcc6'; cx.lineWidth = 19; cx.stroke(); cx.restore();
    rrect(-76, -20, 152, 130, 18, '#f2c230', '#8a6414'); rrect(-62, -8, 12, 104, 6, 'rgba(255,255,255,.35)');
    circ(0, 30, 14, '#3a2a10'); poly([[-8, 36], [8, 36], [12, 72], [-12, 72]], '#3a2a10');
    cx.restore(); },
  idea: (a, t, f) => { wAt(a, f); const on = ease((t - .3) / .4), pulse = .5 + .5 * Math.sin(t * 4);
    if (on > 0) for (let i = 0; i < 8; i++) { const an = -Math.PI / 2 + (i - 3.5) * .42, r0 = 96, r1 = 96 + 34 * on * (.7 + .3 * pulse);
      if (i === 0 || i === 7) continue; cx.save(); cx.lineCap = 'round'; path([[Math.cos(an) * r0, -30 + Math.sin(an) * r0], [Math.cos(an) * r1, -30 + Math.sin(an) * r1]], '#f2a52e', 9); cx.restore(); }
    cx.save(); cx.shadowColor = '#ffe27a'; cx.shadowBlur = 40 * on;
    cx.beginPath(); cx.arc(0, -30, 75, Math.PI * .78, Math.PI * 2.22); cx.lineTo(32, 55); cx.lineTo(-32, 55); cx.closePath();
    cx.fillStyle = mix('#e9eef7', '#ffe27a', on); cx.fill(); cx.shadowBlur = 0; cx.strokeStyle = '#8a6414'; cx.lineWidth = 3.5; cx.stroke(); cx.restore();
    path([[-14, 55], [-14, 0], [-22, -14], [-8, -24], [0, -12], [8, -24], [22, -14], [14, 0], [14, 55]], mix('#9aa0aa', '#c96a1a', on), 3);
    circ(-34, -58, 14, 'rgba(255,255,255,.55)');
    rrect(-34, 55, 68, 16, 4, '#9aa0aa', '#4a4f5a'); rrect(-30, 71, 60, 14, 4, '#9aa0aa', '#4a4f5a'); rrect(-20, 85, 40, 14, [0, 0, 10, 10], '#4a4f5a', '#2a2a33');
    cx.restore(); },

  // ---------- money and work
  coin: (a, t, f) => { wAt(a, f); const sx = Math.cos(t * 2.2); cx.translate(0, Math.sin(t * 2) * 6); cx.scale(Math.max(.1, Math.abs(sx)), 1);
    const face = sx > 0 ? '#f2c230' : '#e0aa20'; circ(0, 0, 72, face, '#8a6414', 4); circ(0, 0, 54, null, '#c98a1a', 4);
    spark(0, 0, 30, '#c98a1a'); cx.beginPath(); cx.arc(0, 0, 62, Math.PI * 1.1, Math.PI * 1.45); cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = 5; cx.stroke();
    cx.restore(); },
  banknote: (a, t, f) => { wAt(a, f); cx.transform(1, Math.sin(t * 3) * .04, Math.sin(t * 2.3) * .06, 1, 0, 0);
    rrect(-140, -70, 280, 140, 8, '#7cc47f', '#2f6b3a'); rrect(-124, -54, 248, 108, 6, null, '#2f6b3a', 2.5);
    ell(0, 0, 40, 44, 0, '#4caf5a', '#2f6b3a'); ell(0, 0, 24, 28, 0, null, '#2f6b3a', 2.5);
    for (const [x, y] of [[-100, -30], [100, -30], [-100, 30], [100, 30]]) circ(x, y, 12, '#4caf5a', '#2f6b3a', 2.5);
    for (const s of [-1, 1]) path([[s * 54, -22], [s * 78, -22]], '#2f6b3a', 3), path([[s * 54, 22], [s * 78, 22]], '#2f6b3a', 3);
    cx.restore(); },
  moneyjar: (a, t, f) => { wAt(a, f); const P = .7, n = Math.min(12, 2 + Math.floor(t / P)), u = (t / P) % 1, top = 82 - n * 15;
    rrect(-80, -120, 160, 220, 26, 'rgba(200,226,240,.5)');
    for (let i = 0; i < n; i++) rrect(-52 + jig(f, i, 2) + (i % 2) * 4, 82 - i * 15, 100, 16, 8, '#f2c230', '#8a6414', 2.5);
    const coinAt = y => { cx.save(); cx.translate(0, y); cx.scale(Math.max(.55, Math.abs(Math.cos(t * 4))), 1); circ(0, 0, 34, '#f2c230', '#8a6414', 3.5); circ(0, 0, 24, null, '#c98a1a', 3); spark(0, 0, 12, '#c98a1a'); cx.restore(); };
    if (n < 12) coinAt(lerp(-225, top + 4, u * u));   // falls, speeding up; the lid hides it as it passes the slot
    rrect(-80, -120, 160, 220, 26, null, '#5b8fb8', 4); rrect(-66, -100, 12, 170, 6, 'rgba(255,255,255,.45)');
    rrect(-90, -142, 180, 26, 8, '#9a6b45', '#4f3420'); rrect(-30, -134, 60, 9, 3, '#3d2412');
    if (n < 12 && u < .45) coinAt(lerp(-225, top + 4, u * u));   // above the lid it is drawn in front
    else if (n >= 12) { const k = .5 + .5 * Math.sin(t * 4); cx.save(); cx.translate(30, top - 6); cx.scale(k, k); spark(0, 0, 18, '#fffbe0'); cx.restore(); }
    cx.restore(); },
  conveyor: (a, t, f) => { wAt(a, f);
    rrect(-226, 20, 16, 80, 3, '#7d8796', '#3a3f4a'); rrect(210, 20, 16, 80, 3, '#7d8796', '#3a3f4a');
    rrect(-260, -20, 520, 40, 20, '#3a3d48', '#15171c');
    for (let x = -240; x <= 240; x += 60) { circ(x, 0, 13, '#9aa0aa', '#4a4f5a', 2.5); const an = t * 5; path([[x - Math.cos(an) * 10, -Math.sin(an) * 10], [x + Math.cos(an) * 10, Math.sin(an) * 10]], '#4a4f5a', 3); }
    cx.save(); cx.setLineDash([16, 16]); cx.lineDashOffset = -t * 60; path([[-246, -20], [246, -20]], '#7a808c', 4); cx.restore();
    cx.save(); clipRect(-262, -200, 524, 181);
    for (let i = 0; i < 4; i++) { const x = ((t * 60 + i * 135) % 540) - 270; rrect(x - 32, -84, 64, 62, 4, '#c99a5b', '#6b4a24'); rrect(x - 7, -84, 14, 62, 0, '#e9d4a8'); }
    cx.restore(); cx.restore(); },

  // ---------- nature and animals
  tree: (a, t, f) => { wAt(a, f); treeK(a.k || 'round', t, f); cx.restore(); },
  forest: (a, t, f) => { wAt(a, f);
    [[-250, 'pine', .7], [-170, 'round', .8], [-85, 'pine', .95], [0, 'round', .9], [85, 'pine', .8], [165, 'round', .75], [245, 'pine', .85]].forEach(([x, k, s], i) => {
      cx.save(); cx.translate(x, 130); cx.scale(s, s); cx.translate(0, -130); treeK(k, t, f, i * 7); cx.restore(); });
    cx.restore(); },
  flower: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#e0567a', '#7a2040']), k = .25 + .75 * ease(t / 1.4);
    limb([[0, 130], [4, 60], [0, -10]], '#4caf5a', '#1f5a2a', 8); ell(-28, 70, 30, 12, -.5, '#4caf5a', '#1f5a2a'); ell(32, 40, 30, 12, .5, '#4caf5a', '#1f5a2a');
    cx.save(); cx.translate(0, -20); cx.rotate(Math.sin(t * 1.5) * .08);
    for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + t * .2; ell(Math.cos(an) * 36 * k, Math.sin(an) * 36 * k, 32 * k, 19 * k, an, c, e); }
    circ(0, 0, 20, '#f2c230', '#8a6414'); cx.restore(); cx.restore(); },
  bird: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#3d7fd0', '#1a3a6b']), fl = Math.sin(t * 7); cx.translate(0, Math.sin(t * 3.5) * 8 - fl * 4);
    const wing = (dx, col, k) => { const T = -110 * fl * k; cx.beginPath(); cx.moveTo(dx + 30, -6); cx.quadraticCurveTo(dx + 22, T * .7, dx - 34, T);   // leading edge to the tip
      [[-30, .78], [-48, .74], [-34, .52], [-52, .48], [-36, .26], [-50, .22]].forEach(([x, q]) => cx.lineTo(dx + x, T * q)); cx.lineTo(dx - 34, -2); cx.closePath(); cx.fillStyle = col; cx.fill(); cx.strokeStyle = e; cx.lineWidth = 3; cx.lineJoin = 'round'; cx.stroke(); };
    wing(10, mix(c, '#000000', .3), .8);
    cx.beginPath(); cx.moveTo(-62, -2); cx.lineTo(-118, -22); cx.lineTo(-100, 0); cx.lineTo(-118, 22); cx.closePath(); cx.fillStyle = c; cx.fill(); cx.strokeStyle = e; cx.lineWidth = 3; cx.lineJoin = 'round'; cx.stroke();
    cx.beginPath(); cx.moveTo(-76, 0); cx.bezierCurveTo(-40, -30, 30, -34, 62, -22); cx.bezierCurveTo(84, -14, 84, 10, 58, 14); cx.bezierCurveTo(20, 26, -40, 22, -76, 0); cx.closePath();
    cx.fillStyle = c; cx.fill(); cx.strokeStyle = e; cx.lineWidth = 3; cx.stroke();
    cx.beginPath(); cx.moveTo(-40, 8); cx.bezierCurveTo(-10, 22, 40, 20, 62, 10); cx.bezierCurveTo(30, 6, -10, 4, -40, 8); cx.fillStyle = mix(c, '#ffffff', .55); cx.fill();
    poly([[78, -10], [104, -2], [78, 4]], '#f2a52e', '#8a5a10', 2.5); circ(62, -10, 4.5, '#151838'); circ(63.5, -11.5, 1.5, '#ffffff');
    wing(0, c, 1);
    cx.restore(); },
  fish: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#ef8a2e', '#7a3d0e']); cx.translate(Math.sin(t * 1.2) * 24, Math.sin(t * 2) * 6);
    for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; circ(100 + Math.sin(u * 8 + i) * 6, -20 - u * 120, 6 + u * 6, null, 'rgba(255,255,255,.85)', 2.5); }
    cx.save(); cx.translate(-72, 0); cx.rotate(Math.sin(t * 8) * .35); poly([[6, 0], [-50, -42], [-38, 0], [-50, 42]], c, e); cx.restore();
    poly([[-30, -40], [10, -66], [30, -40]], mix(c, '#000000', .2), e);
    ell(0, 0, 82, 46, 0, c); cx.save(); cx.beginPath(); cx.ellipse(0, 0, 82, 46, 0, 0, TAU); cx.clip(); rrect(-30, -50, 16, 100, 0, '#f6f4f0'); rrect(18, -50, 16, 100, 0, '#f6f4f0'); cx.restore();
    ell(0, 0, 82, 46, 0, null, e); circ(52, -10, 10, '#ffffff', '#151838', 2.5); circ(55, -10, 4.5, '#151838'); path([[74, 12], [64, 16]], e, 3);
    cx.restore(); },
  insect: (a, t, f) => { wAt(a, f); cx.translate(Math.sin(t * 1.1) * 20, Math.sin(t * 2.2) * 12);
    if (a.k === 'bee') { const fl = .4 + .6 * Math.abs(Math.sin(t * 18));
      for (const [x, r] of [[-14, -.35], [10, .2]]) ell(x, -46, 22, 40 * fl, r, 'rgba(230,245,255,.85)', '#5b8fb8');
      poly([[-56, -4], [-78, 0], [-56, 6]], '#2a2a33');
      ell(0, 0, 58, 38, 0, '#f2c230'); cx.save(); cx.beginPath(); cx.ellipse(0, 0, 58, 38, 0, 0, TAU); cx.clip(); for (const x of [-32, -4, 24]) rrect(x, -40, 14, 80, 0, '#2a2a33'); cx.restore();
      ell(0, 0, 58, 38, 0, null, '#5a4210'); circ(58, -4, 22, '#2a2a33', '#111'); circ(66, -10, 5, '#ffffff');
      path([[62, -24], [70, -46]], '#2a2a33', 3); path([[52, -24], [52, -48]], '#2a2a33', 3); }
    else { const sc = .25 + .75 * Math.abs(Math.cos(t * 4));
      for (const side of [-1, 1]) { cx.save(); cx.scale(side * sc, 1);
        ell(46, -34, 50, 42, -.45, '#7d55b8', '#3a2260'); ell(36, 30, 34, 28, .45, '#ef8a2e', '#7a3d0e'); circ(56, -38, 12, '#f6d65a', '#3a2260', 2); circ(40, 32, 8, '#f6f4f0'); cx.restore(); }
      rrect(-8, -56, 16, 104, 8, '#2a2a33'); path([[-3, -54], [-20, -86]], '#2a2a33', 3); path([[3, -54], [20, -86]], '#2a2a33', 3); circ(-20, -88, 5, '#2a2a33'); circ(20, -88, 5, '#2a2a33'); }
    cx.restore(); },
  animal: (a, t, f) => { const draw = ANIMALS[a.k || 'cow']; if (!draw) throw Error(`No animal "${a.k}"`); wAt(a, f); draw(t, f); cx.restore(); },

  // ---------- people (faceless silhouettes)
  person: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#3d7fd0', '#1a3a6b']), back = mix(c, '#000000', .25);
    const leg = (hx, an) => limb([[hx, 4], [hx + Math.sin(an) * 92, 4 + Math.cos(an) * 92]], back === c ? c : c, e, 18);
    if (a.k === 'wave') { limb([[-24, -66], [-36, 6]], back, e, 16); leg(-12, -.12); leg(12, .12);
      rrect(-30, -84, 60, 96, 24, c, e); circ(0, -112, 26, c, e);
      const w = Math.sin(t * 7) * .45; limb([[24, -66], [58, -116], [58 + Math.sin(w) * 48, -116 - Math.cos(w) * 48]], c, e, 16); }
    else { const p = Math.sin(t * 5); cx.translate(0, -Math.abs(Math.cos(t * 5)) * 4);
      limb([[-6, -66], [-6 - Math.sin(p * .55) * 74, -66 + Math.cos(p * .55) * 74]], back, e, 16); limb([[-6, 4], [-6 + Math.sin(p * .45) * 92, 4 + Math.cos(p * .45) * 92]], back, e, 18);
      rrect(-28, -84, 56, 96, 24, c, e); circ(0, -112, 26, c, e);
      limb([[6, 4], [6 - Math.sin(p * .45) * 92, 4 + Math.cos(p * .45) * 92]], c, e, 18); limb([[6, -66], [6 + Math.sin(p * .55) * 74, -66 + Math.cos(p * .55) * 74]], c, e, 16); }
    cx.restore(); },
  crowd: (a, t, f) => { wAt(a, f); const n = a.n || 9, C = ['#3d7fd0', '#d9473b', '#4caf5a', '#ef8a2e', '#7d55b8', '#2f8a4a', '#c8573b', '#4b2f74', '#e0a03a'];
    const back = Math.floor(n / 2), front = n - back;
    const bust = (x, y, i) => { const c = C[i % C.length], e = mix(c, '#000000', .55), b = Math.sin(t * 3 + i * 1.3) * 4;
      rrect(x - 36, y - 10 + b, 72, 80, [32, 32, 6, 6], c, e); circ(x, y - 40 + b, 24, c, e); };
    for (let i = 0; i < back; i++) bust((i - (back - 1) / 2) * 76, -10, i + 5);
    for (let i = 0; i < front; i++) bust((i - (front - 1) / 2) * 76, 40, i);
    cx.restore(); },

  // ---------- everyday things
  clock: (a, t, f) => { wAt(a, f);
    circ(0, 0, 112, '#f6f4f0', '#d9473b', 14); circ(0, 0, 120, null, '#6b1e18', 3); circ(0, 0, 104, null, '#6b1e18', 2.5);
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, r0 = i % 3 ? 84 : 74; path([[Math.cos(an) * r0, Math.sin(an) * r0], [Math.cos(an) * 94, Math.sin(an) * 94]], '#2a2a33', i % 3 ? 3 : 6); }
    const hand = (an, L, w) => { cx.save(); cx.lineCap = 'round'; path([[0, 0], [Math.cos(an - Math.PI / 2) * L, Math.sin(an - Math.PI / 2) * L]], '#2a2a33', w); cx.restore(); };
    hand(1.9 + t * .5, 52, 10); hand(t * 3, 80, 6); circ(0, 0, 9, '#d9473b', '#6b1e18', 2.5);
    cx.restore(); },
  calendar: (a, t, f) => { wAt(a, f); const cyc = 1.6, page = Math.floor(t / cyc), p = (t % cyc) / .6;
    const sheet = (hi, fill) => { rrect(-120, -60, 240, 172, [0, 0, 10, 10], fill, '#5a5348');
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) rrect(-102 + c * 42, -44 + r * 38, 32, 28, 4, (r * 5 + c) === hi ? '#3d7fd0' : '#e3ddd0'); };
    sheet((page * 7 + 9) % 20, '#fbf8f2');
    rrect(-120, -110, 240, 52, [10, 10, 0, 0], '#d9473b', '#6b1e18');
    if (p < 1) { const sy = Math.cos(p * Math.PI); cx.save(); cx.translate(0, -60); cx.scale(1, sy); cx.translate(0, 60);
      if (sy > 0) sheet((page * 7 + 2) % 20, '#fbf8f2'); else rrect(-120, -60, 240, 172, [0, 0, 10, 10], '#e3ddd0', '#5a5348'); cx.restore(); }
    for (const x of [-60, 60]) rrect(x - 6, -128, 12, 32, 6, '#9aa0aa', '#4a4f5a');
    cx.restore(); },
  book: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#3d7fd0', '#1a3a6b']), k = ease(t / 1.2), sx = lerp(-1, 1, k);
    const page = (fill) => { poly([[0, -92], [150, -98], [150, 92], [0, 96]], fill, '#8a8272'); for (let i = 0; i < 7; i++) path([[18, -66 + i * 22], [i === 6 ? 80 : 132, -68 + i * 22]], '#b8b2a6', 3); };
    rrect(0, -104, 162, 208, [0, 8, 8, 0], c, e); page('#fbf8f2');
    cx.save(); cx.scale(sx, 1);
    if (sx < 0) { rrect(-162, -104, 162, 208, [8, 0, 0, 8], c, e); rrect(-136, -40, 110, 34, 4, '#f2c230', '#8a6414'); }
    else { rrect(-162, -104, 162, 208, [8, 0, 0, 8], c, e); cx.scale(-1, 1); page('#fbf8f2'); }
    cx.restore();
    if (t > 1.4) { const pp = ((t - 1.4) % 2.4) / .8; if (pp < 1) { cx.save(); cx.scale(lerp(1, -1, ease(pp)), 1); poly([[0, -92], [150, -98], [150, 92], [0, 96]], '#f3eee2', '#8a8272'); cx.restore(); } }
    path([[0, -96], [0, 96]], '#8a8272', 3);
    cx.restore(); },
  mail: (a, t, f) => { wAt(a, f); cx.translate(Math.sin(t * 2) * 10, Math.sin(t * 3) * 8); cx.rotate(-.08 + Math.sin(t * 3) * .04);
    for (let i = 0; i < 3; i++) { const u = (t * 2.4 + i * .33) % 1; path([[-130 - u * 70, -30 + i * 30], [-170 - u * 70, -30 + i * 30]], '#f6f4f0', 5, { alpha: 1 - u }); }
    rrect(-100, -62, 200, 124, 8, '#f6f4f0', '#5a5348'); path([[-96, 58], [-24, 2]], '#b8b2a6', 3); path([[96, 58], [24, 2]], '#b8b2a6', 3);
    poly([[-98, -60], [0, 14], [98, -60]], '#e9e2d4', '#5a5348'); circ(0, 12, 14, '#d9473b', '#6b1e18');
    cx.restore(); },
  bubble: (a, t, f) => { wAt(a, f); const k = clamp(t / .35), sc = k < 1 ? ease(k) * 1.08 : 1; cx.scale(sc, sc);
    if (a.k === 'think') { const C = [[-70, -10, 55], [-10, -42, 60], [62, -16, 55], [24, 30, 50], [-48, 32, 46]];
      C.forEach(([x, y, r], i) => circ(x + jig(f, i), y, r, null, '#2a2a33', 8)); C.forEach(([x, y, r], i) => circ(x + jig(f, i), y, r, '#f6f4f0'));
      circ(-96, 92, 15, '#f6f4f0', '#2a2a33', 4); circ(-122, 122, 9, '#f6f4f0', '#2a2a33', 4); }
    else { poly([[-62, 44], [-92, 112], [-14, 44]], '#f6f4f0', '#2a2a33', 4); rrect(-140, -86, 280, 140, 44, '#f6f4f0', '#2a2a33', 4); poly([[-58, 46], [-86, 104], [-20, 46]], '#f6f4f0'); }
    if (a.dots) for (let i = 0; i < 3; i++) circ(-36 + i * 36, a.k === 'think' ? -4 : -16, 10 + 3 * Math.sin(t * 6 - i), '#9aa0aa');
    cx.restore(); },
  trophy: (a, t, f) => { wAt(a, f); const G = '#f2c230', E = '#8a6414';
    for (const s of [-1, 1]) { cx.beginPath(); cx.arc(s * 82, -66, 32, 0, TAU); cx.strokeStyle = E; cx.lineWidth = 18; cx.stroke(); cx.strokeStyle = G; cx.lineWidth = 11; cx.stroke(); }
    cx.beginPath(); cx.moveTo(-84, -116); cx.lineTo(84, -116); cx.quadraticCurveTo(84, -8, 12, 2); cx.lineTo(-12, 2); cx.quadraticCurveTo(-84, -8, -84, -116); cx.closePath();
    cx.fillStyle = G; cx.fill(); cx.strokeStyle = E; cx.lineWidth = 3.5; cx.stroke();
    rrect(-58, -104, 14, 72, 7, 'rgba(255,255,255,.45)'); spark(0, -66, 22, '#c98a1a');
    rrect(-12, 2, 24, 40, 2, G, E); rrect(-52, 40, 104, 20, 4, G, E); rrect(-72, 60, 144, 42, 6, '#7a4a2a', '#3d2412'); rrect(-36, 70, 72, 22, 3, '#e8c27a', '#8a6a2a', 2);
    [[-112, -130], [110, -150], [126, -10]].forEach(([x, y], i) => spark(x, y, 16 * (.4 + .6 * Math.abs(Math.sin(t * 3 + i * 2))), '#fff3a8'));
    cx.restore(); },
  burst: (a, t, f) => { wAt(a, f); const [c, e] = wCol(a, ['#f2c230', '#8a6414']); cx.rotate(t * .4); const sc = 1 + .05 * Math.sin(t * 5); cx.scale(sc, sc);
    const P = []; for (let i = 0; i < 28; i++) { const an = i / 28 * TAU, r = i % 2 ? 84 : 124; P.push([Math.cos(an) * r, Math.sin(an) * r]); }
    poly(P, c, e, 3.5); circ(0, 0, 66, mix(c, '#ffffff', .45), e); spark(0, 0, 34, c);
    cx.restore(); },
});
}
