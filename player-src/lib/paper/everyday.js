// Paper-motion library: EVERYDAY — tech ideas, data, energy, transport, home, food, sport, work and school.
// Every call: name x y scale (centred on x y; defaults 480 300 1), rot=deg; colour override c=#rrggbb where noted.
// Flat cut-paper shapes, dark ~3 px outlines, nothing written inside the frame.
{
const at = (a, f) => { const [x = 480, y = 300, s = 1] = a.v; cx.save(); cx.translate(x + jig(f, 1), y + jig(f, 2));
  if (a.rot) cx.rotate(a.rot * Math.PI / 180); cx.scale(s, s); };
const D = fn => (a, t, f) => { at(a, f); try { fn(t, f, a); } finally { cx.restore(); } };
const ed = c => mix(c, '#000000', .55);
const col = (a, def) => typeof a.c === 'string' && /^#[0-9a-f]{6}$/i.test(a.c) ? a.c : def;
const ell = (x, y, rx, ry, rot, fill, edge, lw = 3) => { cx.beginPath(); cx.ellipse(x, y, rx, ry, rot, 0, TAU); if (fill) { cx.fillStyle = fill; cx.fill(); } if (edge) { cx.strokeStyle = edge; cx.lineWidth = lw; cx.stroke(); } };
const limb = (pts, fill, edge, w) => { path(pts, edge, w + 6); path(pts, fill, w); };
const ph = (t, p, o = 0) => (((t + o) % p) + p) % p / p;                       // phase 0..1 of a p-second loop
const sm = u => (u = clamp(u), u * u * (3 - 2 * u));
const tri = u => 1 - Math.abs(2 * u - 1);
const wheel = (x, y, r, ang) => { circ(x, y, r, '#2a2a33', '#111118', 3); circ(x, y, r * .55, '#c9c4ba', '#4a4f5a', 2.5);
  for (let k = 0; k < 4; k++) path([[x, y], [x + Math.cos(ang + k * Math.PI / 2) * r * .5, y + Math.sin(ang + k * Math.PI / 2) * r * .5]], '#4a4f5a', 3); circ(x, y, r * .14, '#4a4f5a'); };
const star = (x, y, r, fill, edge, n = 4, rot = 0) => { const p = []; for (let i = 0; i < n * 2; i++) { const an = rot + i / (n * 2) * TAU, rr = i % 2 ? r * .38 : r; p.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); } poly(p, fill, edge, 2); };
const steam = (x, y, t, n = 3, h = 80, gap = 20) => { for (let i = 0; i < n; i++) { const u = (t * .45 + i / n) % 1, pts = [];
  for (let j = 0; j < 7; j++) pts.push([x + (i - (n - 1) / 2) * gap + Math.sin(j * 1.1 + t * 3 + i * 2) * 6, y - u * h - j * 7]);
  path(pts, '#8a93a6', 11, { alpha: (1 - u) * .7 }); path(pts, '#ffffff', 6, { alpha: (1 - u) * .95 }); } };
const bolt = (x, y, s, fill = '#ffd75e', edge = '#a8741a') => poly([[4, -22], [-10, 3], [0, 3], [-4, 22], [10, -4], [0, -4]].map(([px, py]) => [x + px * s, y + py * s]), fill, edge, 2.5);
const cloudShape = (x, y, s, fill = '#f6f4f0', edge = '#7a8296') => { const P = [[-44, 8, 28], [-16, -12, 34], [20, -14, 32], [46, 8, 26], [0, 12, 30]];
  P.forEach(([px, py, r]) => circ(x + px * s, y + py * s, r * s, null, edge, 6)); P.forEach(([px, py, r]) => circ(x + px * s, y + py * s, r * s, fill)); };
const laptop = (x, y, s = 1, screen = '#9fc4e6') => { rrect(x - 52 * s, y - 70 * s, 104 * s, 66 * s, 6 * s, '#3d4452', '#1c2029'); rrect(x - 44 * s, y - 62 * s, 88 * s, 50 * s, 3 * s, screen, '#1c2029', 2);
  poly([[x - 64 * s, y - 4 * s], [x + 64 * s, y - 4 * s], [x + 72 * s, y + 8 * s], [x - 72 * s, y + 8 * s]], '#a9b0bd', '#4a4f5a'); };
const handset = (x, y, s = 1, screen = '#9fc4e6') => { rrect(x - 26 * s, y - 50 * s, 52 * s, 100 * s, 9 * s, '#2f3542', '#14171d'); rrect(x - 20 * s, y - 40 * s, 40 * s, 76 * s, 4 * s, screen, '#14171d', 2); circ(x, y + 43 * s, 3 * s, '#5a6170'); };
const note = (x, y, fill, edge, two) => { if (two) { path([[x + 8, y], [x + 8, y - 36], [x + 36, y - 44], [x + 36, y - 8]], edge, 9); path([[x + 8, y], [x + 8, y - 36], [x + 36, y - 44], [x + 36, y - 8]], fill, 4);
    ell(x, y, 10, 7, -.4, fill, edge, 2.5); ell(x + 28, y - 8, 10, 7, -.4, fill, edge, 2.5); return; }
  path([[x + 8, y], [x + 8, y - 38]], edge, 9); path([[x + 8, y], [x + 8, y - 38]], fill, 4); poly([[x + 8, y - 40], [x + 24, y - 26], [x + 22, y - 20], [x + 8, y - 30]], fill, edge, 2); ell(x, y, 10, 7, -.4, fill, edge, 2.5); };
// faceless cut-paper figure: joints from hip; legs/arms as [thigh angle, knee bend] from straight down
const seg = (p, ang, L) => [p[0] + Math.sin(ang) * L, p[1] + Math.cos(ang) * L];
const figure = (hip, shoulder, head, legs, arms, body = '#e07b39', skin = '#c98a5e', leg = '#3d4f8a') => {
  const ln = (o, [a1, a2], L, fill, w) => { const k = seg(o, a1, L), e = seg(k, a1 + a2, L); limb([o, k, e], fill, ed(fill), w); };
  ln(hip, legs[1], 30, mix(leg, '#000000', .2), 12); ln(shoulder, arms[1], 24, mix(skin, '#000000', .2), 9);
  limb([hip, shoulder], body, ed(body), 22); circ(head[0], head[1], 14, skin, ed(skin));
  ln(hip, legs[0], 30, leg, 12); ln(shoulder, arms[0], 24, skin, 9); };
const fabric = (x, y, w, h, fill, edge) => rrect(x, y, w, h, 4, fill, edge);

Object.assign(LIB, {
  // "datadots x y s"
  datadots: D(t => { laptop(-120, 30, 1); handset(130, 0, 1);
    const up = [], dn = []; for (let i = 0; i <= 20; i++) { const u = i / 20; up.push([lerp(-80, 100, u), -40 - Math.sin(u * Math.PI) * 70]); dn.push([lerp(100, -80, u), 40 + Math.sin(u * Math.PI) * 40]); }
    path(up, '#7a8296', 3, { dash: [8, 8], alpha: .7 }); path(dn, '#7a8296', 3, { dash: [8, 8], alpha: .7 });
    const C = ['#e05a4f', '#f6d65a', '#4fa3d8', '#6fbf73', '#9f74c0'];
    for (let i = 0; i < 5; i++) { const [px, py] = along(up, (t * .45 + i / 5) % 1); circ(px, py, 8, C[i], ed(C[i]), 2.5);
      const [qx, qy] = along(dn, (t * .35 + i / 5 + .1) % 1); rrect(qx - 6, qy - 6, 12, 12, 2, C[4 - i], ed(C[4 - i]), 2.5); }
    for (let r = 0; r < 3; r++) rrect(-156, -24 + r * 12 - 12, 30 + ((Math.floor(t * 3) + r) % 3) * 16, 6, 3, '#4fa3d8');
    for (let r = 0; r < 3; r++) rrect(118, -20 + r * 14, 14 + ((Math.floor(t * 3) + r + 1) % 3) * 4, 6, 3, '#4fa3d8'); }),

  // "cloudsync x y s"
  cloudsync: D(t => { cloudShape(0, -70, 1.6, '#f6f4f0');
    cx.save(); cx.translate(0, -68); cx.rotate(t * 1.6);
    for (const k of [0, Math.PI]) { cx.save(); cx.rotate(k); const arc = []; for (let i = 0; i <= 10; i++) { const an = -2.6 + i / 10 * 2.2; arc.push([Math.cos(an) * 26, Math.sin(an) * 26]); }
      path(arc, '#2a6fb0', 7); arrowHead(arc, '#2a6fb0', 11); cx.restore(); } cx.restore();
    laptop(-120, 110, .8); handset(130, 80, .7);
    const L = [[-110, 40], [-80, -20]], R = [[80, -20], [120, 36]];
    path(L, '#7a8296', 3, { dash: [6, 7] }); path(R, '#7a8296', 3, { dash: [6, 7] });
    for (let i = 0; i < 3; i++) { const u = (t * .6 + i / 3) % 1; const [ax, ay] = along(L, u); circ(ax, ay, 6, '#f29a52', '#8a4a1a', 2);
      const [bx, by] = along(R, u); circ(bx, by, 6, '#6fbf73', '#2a5a2e', 2); } }),

  // "passcode x y s"
  passcode: D(t => { const n = Math.floor(ph(t, 4.2) * 7), full = n >= 6;
    rrect(-150, -36, 250, 72, 16, '#f6f4f0', '#4a4f5a');
    for (let i = 0; i < 6; i++) { const x = -122 + i * 38; if (i < n) circ(x, 0, 11, '#2f3542', '#14171d', 2); else rrect(x - 10, 10, 20, 4, 2, '#a9b0bd'); }
    if (!full && Math.floor(t * 3) % 2) rrect(-130 + n * 38, -16, 4, 32, 2, '#2a6fb0');
    const lift = full ? 0 : 14; cx.save(); cx.translate(160, 0);
    const sh = []; for (let i = 0; i <= 12; i++) { const an = Math.PI + i / 12 * Math.PI; sh.push([Math.cos(an) * 22, -10 - lift + Math.sin(an) * 28]); }
    sh.unshift([-22, 6 - lift]); sh.push([22, 6 - lift * (full ? 1 : 0) + (full ? 0 : 0)]);
    path(sh, '#4a4f5a', 13); path(sh, '#a9b0bd', 7);
    rrect(-34, -10, 68, 58, 8, full ? '#6fbf73' : '#f6c445', full ? '#2a5a2e' : '#8a6414'); circ(0, 14, 7, ed(full ? '#6fbf73' : '#f6c445')); rrect(-3, 14, 6, 16, 2, ed(full ? '#6fbf73' : '#f6c445'));
    cx.restore(); }),

  // "robotarm x y s"
  robotarm: D(t => { const u = ph(t, 3.2), go = sm(clamp((u - .1) / .35)), back = sm(clamp((u - .6) / .35)), k = go - back, carry = u > .08 && u < .5;
    rrect(-190, 76, 380, 14, 4, '#7a8296', '#3d4452');
    rrect(-150, 40, 70, 36, 4, '#c9a46a', '#6a4a24'); rrect(80, 40, 70, 36, 4, '#c9a46a', '#6a4a24'); rrect(90, 4, 50, 36, 4, '#e0b98a', '#6a4a24');
    if (u >= .5) rrect(96, -32, 40, 36, 4, '#e05a4f', '#6a2a24');
    rrect(-30, 50, 60, 26, 6, '#3d4452', '#1c2029');
    const a1 = lerp(-.75, .75, k) + Math.sin(t * 2) * .02, sh = [0, 44], el = [sh[0] + Math.sin(a1) * 110, sh[1] - Math.cos(a1) * 110];
    const tip = [lerp(-115, 116, k), lerp(-6 + 46 * tri(go * .999) * 0, -40, 0)];
    tip[1] = -50 + Math.sin(k * Math.PI) * -30;
    limb([sh, el], '#f29a52', '#8a4a1a', 22); limb([el, tip], '#f6c445', '#8a6414', 16); circ(sh[0], sh[1], 16, '#4a4f5a', '#1c2029'); circ(el[0], el[1], 11, '#4a4f5a', '#1c2029');
    rrect(tip[0] - 20, tip[1], 40, 10, 3, '#4a4f5a', '#1c2029'); rrect(tip[0] - 20, tip[1] + 6, 6, 18, 2, '#4a4f5a'); rrect(tip[0] + 14, tip[1] + 6, 6, 18, 2, '#4a4f5a');
    if (carry) rrect(tip[0] - 14, tip[1] + 14, 28, 26, 3, '#e05a4f', '#6a2a24');
    else if (u < .08 || u > .9) rrect(-129, 14, 28, 26, 3, '#e05a4f', '#6a2a24'); }),

  // "aiweb x y s"
  aiweb: D(t => { ell(-46, 0, 110, 96, 0, '#eadcf3', '#9f74c0', 3); ell(46, 0, 110, 96, 0, '#eadcf3', '#9f74c0', 3); ell(0, 0, 150, 90, 0, '#eadcf3');
    path([[0, -86], [-6, -40], [6, 0], [-4, 50], [0, 88]], '#c4a8de', 3);
    const N = [[-110, -10], [-80, -60], [-70, 30], [-30, -20], [-40, 66], [0, -70], [10, 30], [40, -30], [50, 64], [80, -64], [84, 10], [118, -14], [-100, 54], [30, 0]];
    const E = []; N.forEach((p, i) => N.forEach((q, j) => { if (j > i && Math.hypot(p[0] - q[0], p[1] - q[1]) < 66) E.push([i, j]); }));
    E.forEach(([i, j]) => path([N[i], N[j]], '#8a6aa8', 3));
    E.forEach(([i, j], e) => { const u = (t * .7 + e * .37) % 1; const [px, py] = along([N[i], N[j]], u); circ(px, py, 4, '#ffd75e', '#a8741a', 1.5); });
    N.forEach(([x, y], i) => { const g = .5 + .5 * Math.sin(t * 3 + i * 1.7); circ(x, y, 9 + g * 4, mix('#5d6fd0', '#f6d65a', g), '#2a2f6a', 2.5); }); }),

  // "satdish x y s"
  satdish: D(t => { rrect(-70, 96, 120, 14, 4, '#7a8296', '#3d4452'); poly([[-30, 96], [-10, 20], [10, 20], [10, 96]], '#a9b0bd', '#4a4f5a');
    cx.save(); cx.translate(0, 10); cx.rotate(-.7 + Math.sin(t * .8) * .06);
    cx.beginPath(); cx.ellipse(0, 0, 80, 36, 0, 0, Math.PI); cx.closePath(); cx.fillStyle = '#e8ecf2'; cx.fill(); cx.strokeStyle = '#4a4f5a'; cx.lineWidth = 3; cx.stroke();
    path([[-60, 6], [0, -70]], '#4a4f5a', 4); path([[60, 6], [0, -70]], '#4a4f5a', 4); circ(0, -72, 9, '#e05a4f', '#6a2a24', 2.5);
    for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1, r = 20 + u * 110, arc = []; for (let j = 0; j <= 12; j++) { const an = -Math.PI / 2 - .6 + j / 12 * 1.2; arc.push([Math.cos(an) * r, -72 + Math.sin(an) * r]); }
      path(arc, '#2a6fb0', 7, { alpha: 1 - u }); }
    cx.restore(); star(150, -120, 14, '#f6d65a', '#a8741a', 4, t); }),

  // "notify x y s"
  notify: D(t => { handset(0, 10, 1.9, '#cfe2f3'); const u = ph(t, 3), pop = u < .15 ? sm(u / .15) * 1.15 : u < .22 ? lerp(1.15, 1, (u - .15) / .07) : u > .9 ? 1 - sm((u - .9) / .1) : 1;
    const slide = sm(clamp((u - .05) / .2)) * (u > .9 ? 1 - sm((u - .9) / .1) : 1);
    cx.save(); cx.beginPath(); cx.rect(-38, -66, 76, 140); cx.clip(); cx.translate(0, lerp(-60, 0, slide));
    rrect(-34, -60, 68, 34, 7, '#ffffff', '#4a4f5a', 2.5); circ(-20, -43, 8, '#4fa3d8', '#1f4e78', 2); rrect(-8, -50, 36, 5, 2, '#a9b0bd'); rrect(-8, -40, 26, 5, 2, '#cfd3da'); cx.restore();
    cx.save(); cx.translate(48, -92); cx.scale(pop, pop); circ(0, 0, 18, '#e05a4f', '#6a2a24'); circ(0, 0, 6, '#ffffff'); cx.restore();
    cx.save(); cx.translate(-90, -40); cx.rotate(Math.sin(t * 18) * .25 * (u < .3 ? 1 : 0));
    poly([[-18, 14], [-14, -8], [-8, -18], [8, -18], [14, -8], [18, 14]], '#f6c445', '#8a6414'); rrect(-22, 12, 44, 8, 4, '#f6c445', '#8a6414'); circ(0, 24, 6, '#f6c445', '#8a6414', 2.5); cx.restore(); }),

  // "videoplay x y s"
  videoplay: D(t => { rrect(-170, -110, 340, 200, 12, '#2f3542', '#14171d'); rrect(-156, -98, 312, 160, 6, '#9fd0e8', '#14171d', 2);
    cx.save(); cx.beginPath(); cx.rect(-156, -98, 312, 160); cx.clip(); circ(110 + Math.sin(t) * 6, -60, 22, '#f6d65a', '#c98a1a', 2.5);
    ell(-90, 80, 140, 60, 0, '#6fbf73', '#2a5a2e'); ell(90, 90, 160, 60, 0, '#4caf5a', '#1f5a2a'); cx.restore();
    const p = 1 + Math.sin(t * 4) * .08; cx.save(); cx.translate(0, -18); cx.scale(p, p); circ(0, 0, 40, 'rgba(255,255,255,.85)', '#14171d'); poly([[-12, -20], [22, 0], [-12, 20]], '#e05a4f', '#6a2a24'); cx.restore();
    const k = ph(t, 6); rrect(-150, 72, 300, 8, 4, '#5a6170'); rrect(-150, 72, 300 * k, 8, 4, '#e05a4f'); circ(-150 + 300 * k, 76, 8, '#f6f4f0', '#14171d', 2);
    rrect(-30, 90, 60, 14, 3, '#4a4f5a', '#14171d'); rrect(-70, 104, 140, 10, 4, '#3d4452', '#14171d'); }),

  // "camera x y s"
  camera: D(t => { const u = ph(t, 2.4), fl = u > .8 ? 1 - (u - .8) / .2 : 0, shut = u > .74 && u < .86 ? tri((u - .74) / .12) : 0;
    rrect(-60, -92, 60, 26, 6, '#3d4452', '#1c2029'); rrect(60, -86, 30, 16, 4, '#e05a4f', '#6a2a24');
    rrect(-140, -70, 280, 160, 22, '#4a4f5a', '#1c2029'); rrect(-140, -30, 280, 70, 0, '#2f3542'); rrect(-140, -70, 280, 160, 22, null, '#1c2029');
    rrect(80, -58, 40, 22, 4, '#f6f4f0', '#1c2029', 2.5);
    circ(0, 10, 66, '#2f3542', '#14171d'); circ(0, 10, 50, '#5d6fd0', '#14171d');
    cx.save(); cx.translate(0, 10); for (let i = 0; i < 6; i++) { cx.save(); cx.rotate(i / 6 * TAU + shut * .9); poly([[0, -50], [50 * Math.sin(1.05), -50 * Math.cos(1.05)], [lerp(30, 4, shut), lerp(-10, 0, shut)]], '#2a2a33', '#111118', 1.5); cx.restore(); }
    cx.restore(); circ(-18, -8, 10, 'rgba(255,255,255,.55)');
    if (fl > 0) { cx.save(); cx.globalAlpha = fl; soft([[100, -48, 70, '#ffffff']]); star(100, -48, 60 * fl + 20, '#ffffff', '#f6d65a', 4, .4); cx.restore(); } }),

  // "charging x y s c=#hex"
  charging: D((t, f, a) => { const c = col(a, '#6fbf73'), k = ph(t, 4), lvl = sm(clamp(k / .85));
    rrect(-120, -56, 220, 112, 18, '#f6f4f0', '#3d4452', 4); rrect(100, -22, 18, 44, 5, '#3d4452');
    cx.save(); cx.beginPath(); cx.roundRect(-110, -46, 200, 92, 10); cx.clip(); rrect(-110, -46, 200 * lvl, 92, 0, lvl > .9 ? c : mix('#f6c445', c, lvl), ed(c), 3);
    for (let i = 1; i < 4; i++) rrect(-110 + i * 50 - 2, -46, 4, 92, 0, 'rgba(0,0,0,.08)'); cx.restore();
    const b = 1 + Math.sin(t * 6) * .08; cx.save(); cx.translate(-10, 0); cx.scale(b * 1.6, b * 1.6); bolt(0, 0, 1); cx.restore();
    const cord = [[-120, 0], [-150, 0], [-170, 30], [-180, 90]]; path(cord, '#14171d', 10); path(cord, '#3d4452', 6);
    for (let i = 0; i < 2; i++) { const [px, py] = along(cord.slice().reverse(), (t * .7 + i / 2) % 1); circ(px, py, 5, '#ffd75e', '#a8741a', 1.5); } }),

  // "socket x y s"
  socket: D(t => { const u = ph(t, 2.6), push = sm(clamp(u / .4)) - sm(clamp((u - .85) / .15)), x = lerp(150, 62, push);
    rrect(-90, -90, 150, 180, 16, '#f6f4f0', '#7a8296'); rrect(-60, -60, 90, 120, 45, '#e8ecf2', '#7a8296');
    circ(-30, -12, 8, '#3d4452'); circ(-30, 18, 8, '#3d4452'); circ(-2, 3, 8, '#3d4452');
    cx.save(); cx.translate(x, 0); rrect(-26, -20, 18, 8, 2, '#c9a46a', '#6a4a24', 2); rrect(-26, 12, 18, 8, 2, '#c9a46a', '#6a4a24', 2);
    rrect(-10, -40, 50, 80, 12, '#3d4452', '#14171d'); rrect(36, -14, 30, 28, 6, '#3d4452', '#14171d');
    const cord = [[64, 0], [110, 10], [140, 60], [180, 70]]; path(cord, '#14171d', 12); path(cord, '#3d4452', 7); cx.restore();
    if (push > .95 && u < .85) { const s = (Math.floor(t * 12) % 3) / 2; for (let i = 0; i < 3; i++) star(54 + (i - 1) * 4, (i - 1) * 26, 10 + s * 8 * (i === 1 ? 1 : .6), '#ffd75e', '#a8741a', 4, t * 4 + i);
      circ(-16, -64, 7, '#6fbf73', '#2a5a2e', 2); } else circ(-16, -64, 7, '#a9b0bd', '#4a4f5a', 2); }),

  // "solarpanel x y s"
  solarpanel: D(t => { cx.save(); cx.translate(-140, -100); cx.rotate(t * .4); for (let i = 0; i < 10; i++) { cx.rotate(TAU / 10); poly([[34, -6], [52, 0], [34, 6]], '#f6d65a', '#c98a1a', 2); } cx.restore();
    circ(-140, -100, 30, '#f6d65a', '#c98a1a');
    for (let i = 0; i < 3; i++) { const r = [[-110 + i * 6, -76 + i * 6], [-10 + i * 40, 0 + i * 6]]; path(r, '#f6d65a', 4, { dash: [10, 10], f: t * 12 }); }
    rrect(26, 70, 12, 50, 2, '#7a8296', '#3d4452'); rrect(-30, 116, 120, 10, 3, '#7a8296', '#3d4452');
    const Q = [[-60, 70], [-10, -40], [150, -40], [120, 70]]; poly(Q, '#2a4f8a', '#14223d', 4);
    for (let i = 1; i < 4; i++) { const k = i / 4; path([lerp2(Q[0], Q[1], 0, k), lerp2(Q[3], Q[2], 0, k)], '#7aa6dc', 2.5); }
    for (let i = 1; i < 5; i++) { const k = i / 5; path([lerp2(Q[1], Q[2], 0, k), lerp2(Q[0], Q[3], 0, k)], '#7aa6dc', 2.5); }
    const g = (t * .8) % 1; cx.save(); cx.beginPath(); Q.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.clip(); path([[-80 + g * 260, 80], [-30 + g * 260, -50]], 'rgba(255,255,255,.55)', 16); cx.restore();
    const wire = [[120, 70], [170, 110], [190, 60]]; path(wire, '#3d4452', 5);
    soft([[190, 40, 20, '#ffe68a']]); circ(190, 40, 18, '#ffe68a', '#a8741a'); rrect(182, 56, 16, 10, 2, '#7a8296'); }),

  // "turbine x y s"
  turbine: D(t => { ell(0, 140, 200, 40, 0, '#6fbf73', '#2a5a2e'); poly([[-8, 130], [-4, -60], [4, -60], [8, 130]], '#f6f4f0', '#7a8296');
    rrect(-12, -74, 34, 20, 8, '#f6f4f0', '#7a8296'); cx.save(); cx.translate(-6, -64); cx.rotate(t * 2.2);
    for (let i = 0; i < 3; i++) { cx.rotate(TAU / 3); cx.beginPath(); cx.moveTo(0, 0); cx.quadraticCurveTo(16, -40, 6, -118); cx.quadraticCurveTo(-8, -50, 0, 0); cx.fillStyle = '#f6f4f0'; cx.fill(); cx.strokeStyle = '#7a8296'; cx.lineWidth = 3; cx.stroke(); }
    cx.restore(); circ(-6, -64, 9, '#e05a4f', '#6a2a24', 2.5);
    for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; path([[-200 + u * 120, -110 + i * 40], [-160 + u * 120, -110 + i * 40]], '#ffffff', 5, { alpha: tri(u) }); } }),

  // "evcharge x y s c=#hex"
  evcharge: D((t, f, a) => { const c = col(a, '#4fa3d8'), lvl = sm(ph(t, 5) / .9);
    rrect(110, -60, 50, 150, 8, '#3d4452', '#14171d'); rrect(118, -48, 34, 26, 4, '#9fd0e8', '#14171d', 2); bolt(135, 10, .9);
    const cord = [[135, 60], [120, 110], [60, 110], [52, 28]]; path(cord, '#14171d', 10); path(cord, '#3d4452', 6);
    for (let i = 0; i < 3; i++) { const [px, py] = along(cord, (t * .6 + i / 3) % 1); circ(px, py, 4, '#ffd75e', '#a8741a', 1.5); }
    cx.save(); cx.translate(-60, 40); poly([[-40, -30], [-24, -62], [36, -62], [58, -30]], c, ed(c)); rrect(-90, -34, 180, 50, 16, c, ed(c));
    poly([[-30, -32], [-18, -54], [0, -54], [0, -32]], '#cfe2f3', ed(c), 2.5); poly([[8, -32], [8, -54], [30, -54], [46, -32]], '#cfe2f3', ed(c), 2.5);
    wheel(-50, 18, 18, -t * 0); wheel(50, 18, 18, 0); cx.restore();
    rrect(-100, -110, 80, 34, 6, '#f6f4f0', '#3d4452'); rrect(-20, -100, 6, 14, 2, '#3d4452'); rrect(-95, -105, 70 * lvl, 24, 3, '#6fbf73', '#2a5a2e', 2); }),

  // "trafficlight x y s"
  trafficlight: D(t => { const u = ph(t, 6), st = u < .42 ? 0 : u < .5 ? 1 : u < .92 ? 2 : 1;
    rrect(-8, 90, 16, 80, 2, '#4a4f5a', '#1c2029'); rrect(-40, 160, 80, 12, 3, '#4a4f5a', '#1c2029');
    rrect(-46, -150, 92, 244, 18, '#2f3542', '#14171d');
    [['#e05a4f', -100], ['#f6c445', -28], ['#6fbf73', 44]].forEach(([cl, y], i) => { const on = i === st;
      if (on) soft([[0, y, 40, cl]]); poly([[-38, y - 30], [38, y - 30], [30, y - 18], [-30, y - 18]], '#1c2029'); circ(0, y, 26, on ? cl : mix(cl, '#2f3542', .75), '#14171d'); if (on) circ(-8, y - 8, 7, 'rgba(255,255,255,.5)'); }); }),

  // "busstop x y s c=#hex"
  busstop: D((t, f, a) => { const c = col(a, '#e05a4f'), u = ph(t, 7), bx = u < .18 ? lerp(330, -20, sm(u / .18)) : u < .75 ? -20 : lerp(-20, -480, sm((u - .75) / .25));
    rrect(-240, 110, 480, 10, 3, '#7a8296', '#3d4452');
    rrect(-200, -80, 8, 190, 2, '#4a4f5a'); circ(-196, -94, 22, '#4fa3d8', '#1f4e78'); rrect(-205, -100, 18, 12, 2, '#f6f4f0');
    rrect(-160, -60, 120, 10, 3, '#4a4f5a', '#1c2029'); rrect(-158, -50, 6, 160, 2, '#4a4f5a'); rrect(-48, -50, 6, 160, 2, '#4a4f5a');
    rrect(-150, -50, 100, 120, 0, 'rgba(159,196,230,.5)', '#7a8296', 2); rrect(-150, 66, 100, 10, 3, '#9a6b45', '#4f3420');
    cx.save(); cx.beginPath(); cx.rect(-240, -200, 480, 400); cx.clip(); cx.translate(bx, 0);
    rrect(-10, -40, 240, 130, 16, c, ed(c)); for (let i = 0; i < 4; i++) rrect(10 + i * 50, -26, 40, 40, 4, '#cfe2f3', ed(c), 2.5);
    rrect(196, -26, 26, 90, 4, '#cfe2f3', ed(c), 2.5); rrect(-10, 36, 240, 10, 0, '#f6f4f0');
    const turn = u < .18 || u > .75 ? t * 8 : 0; wheel(40, 92, 20, turn); wheel(180, 92, 20, turn); cx.restore(); }),

  // "takeoff x y s c=#hex"
  takeoff: D((t, f, a) => { const c = col(a, '#f6f4f0'), u = ph(t, 4.5), run = sm(clamp(u / .4)), lift = clamp((u - .3) / .7);
    rrect(-240, 100, 480, 24, 3, '#4a4f5a', '#1c2029'); for (let i = 0; i < 8; i++) rrect(-230 + i * 60 - (t * 120) % 60 * 0, 110, 30, 4, 1, '#f6f4f0');
    const x = lerp(-180, 0, run) + lift * 200, y = 80 - lift * lift * 190, ang = -lift * .45;
    if (lift > 0) path([[x - 140, y + 30], [x - 70, y + 6]], '#ffffff', 5, { dash: [12, 10], alpha: .8 });
    cx.save(); cx.translate(x, y); cx.rotate(ang); poly([[-6, 0], [-30, 30], [-14, 30], [24, 2]], mix(c, '#7a8296', .4), '#3d4452');
    rrect(-80, -16, 150, 30, 15, c, '#3d4452'); poly([[-80, -2], [-92, -38], [-74, -38], [-56, -10]], '#e05a4f', '#6a2a24');
    poly([[64, -12], [82, 0], [64, 12]], c, '#3d4452'); for (let i = 0; i < 5; i++) circ(-40 + i * 18, -4, 4, '#4fa3d8');
    poly([[-10, 2], [10, -4], [-28, -30], [-40, -30]], mix(c, '#7a8296', .25), '#3d4452', 2.5);
    if (lift < .3) { circ(-40, 20, 6, '#2a2a33'); circ(30, 20, 6, '#2a2a33'); } cx.restore(); }),

  // "harbour x y s"
  harbour: D(t => { const u = ph(t, 5), drop = u < .5 ? sm(u / .5) : 1 - sm((u - .6) / .4), landed = u > .5 && u < .6;
    rrect(-240, 60, 120, 70, 0, '#9a8a74', '#5a4a34'); for (let i = 0; i < 2; i++) { const w = []; for (let x = -240; x <= 240; x += 10) w.push([x, 86 + i * 22 + Math.sin(x * .05 + t * 2 + i) * 5]); path(w, i ? '#2a6fb0' : '#4fa3d8', 8); }
    rrect(-220, -150, 14, 210, 2, '#f6c445', '#8a6414'); rrect(-160, -150, 14, 210, 2, '#f6c445', '#8a6414'); rrect(-240, -164, 330, 18, 3, '#f6c445', '#8a6414');
    for (let i = 0; i < 6; i++) path([[-230 + i * 54, -164], [-210 + i * 54, -146]], '#8a6414', 3);
    const tx = 10; rrect(tx - 18, -150, 36, 14, 3, '#3d4452'); const hy = lerp(-120, -20, drop); path([[tx, -136], [tx, hy]], '#3d4452', 3);
    const bob = Math.sin(t * 1.6) * 3; cx.save(); cx.translate(0, bob);
    poly([[-90, 50], [200, 50], [176, 100], [-70, 100]], '#e05a4f', '#6a2a24'); rrect(-80, 44, 280, 8, 2, '#f6f4f0'); rrect(150, 0, 40, 46, 4, '#f6f4f0', '#4a4f5a'); rrect(158, 10, 10, 10, 2, '#4fa3d8');
    rrect(-60, 14, 60, 30, 2, '#4fa3d8', '#1f4e78'); rrect(80, 14, 60, 30, 2, '#6fbf73', '#2a5a2e'); cx.restore();
    rrect(tx - 32, hy, 64, 30, 2, '#f29a52', '#8a4a1a'); for (let i = 1; i < 4; i++) path([[tx - 32 + i * 16, hy + 4], [tx - 32 + i * 16, hy + 26]], '#8a4a1a', 2); }),

  // "truck x y s c=#hex"
  truck: D((t, f, a) => { const c = col(a, '#4fa3d8');
    for (let i = 0; i < 6; i++) { const x = 220 - ((t * 140 + i * 90) % 540); rrect(x, 108, 44, 6, 3, '#a9b0bd'); }
    const bob = Math.abs(Math.sin(t * 8)) * 2; cx.save(); cx.translate(0, -bob);
    rrect(-170, -70, 220, 140, 8, '#f6f4f0', '#4a4f5a'); rrect(-170, 30, 220, 12, 0, c);
    for (const [x, y, w, h] of [[-150, -50, 50, 46], [-94, -50, 60, 46], [-28, -50, 60, 46], [-140, -2, 70, 28], [-62, -2, 60, 28]]) { rrect(x, y, w, h, 2, '#c9a46a', '#6a4a24', 2.5); path([[x + w / 2, y], [x + w / 2, y + h]], '#a8854a', 4); }
    rrect(-170, -70, 220, 112, 8, null, '#4a4f5a'); poly([[54, -40], [120, -40], [150, 0], [150, 70], [54, 70]], c, ed(c)); poly([[66, -30], [114, -30], [136, 0], [66, 0]], '#cfe2f3', ed(c), 2.5);
    rrect(140, 38, 16, 10, 3, '#ffd75e', ed(c), 2); cx.restore();
    wheel(-110, 78, 24, t * 9); wheel(-50, 78, 24, t * 9); wheel(100, 78, 24, t * 9);
    for (let i = 0; i < 3; i++) path([[-200 - i * 6, -40 + i * 30], [-230 - i * 10 - Math.sin(t * 6 + i) * 8, -40 + i * 30]], '#7a8296', 4, { alpha: .6 }); }),

  // "parcelbelt x y s"
  parcelbelt: D(t => { rrect(-230, 20, 330, 30, 15, '#3d4452', '#1c2029'); for (let i = 0; i < 9; i++) { const x = -215 + i * 38; circ(x, 35, 10, '#7a8296', '#1c2029', 2);
      path([[x, 35], [x + Math.cos(t * 6) * 8, 35 + Math.sin(t * 6) * 8]], '#1c2029', 2); }
    rrect(-200, 50, 14, 70, 2, '#4a4f5a'); rrect(60, 50, 14, 70, 2, '#4a4f5a');
    poly([[100, 30], [150, 60], [140, 76], [94, 50]], '#a9b0bd', '#4a4f5a'); rrect(130, 70, 90, 60, 6, '#4fa3d8', '#1f4e78'); rrect(130, 70, 90, 12, 3, '#2a6fb0');
    const P = [['#c9a46a', 46, 36], ['#e0b98a', 36, 30], ['#c9a46a', 54, 42], ['#d9a86a', 40, 34]];
    for (let i = 0; i < 4; i++) { const u = (t * .22 + i / 4) % 1, [cl, w, h] = P[i]; let x = lerp(-230, 110, u / .8), y = 20 - h, r = 0;
      if (u > .8) { const k = (u - .8) / .2; x = 110 + k * 50; y = 20 - h + k * k * 80; r = k * .6; }
      cx.save(); cx.translate(x, y + h / 2); cx.rotate(r); cx.globalAlpha *= u > .95 ? (1 - u) / .05 : 1; rrect(-w / 2, -h / 2, w, h, 3, cl, '#6a4a24', 2.5); rrect(-4, -h / 2, 8, h, 0, '#a8854a'); cx.restore(); } }),

  // "boilpot x y s"
  boilpot: D(t => { for (let i = 0; i < 5; i++) { const h = 22 + Math.sin(t * 9 + i * 2) * 6; poly([[-60 + i * 30 - 12, 110], [-60 + i * 30, 110 - h], [-60 + i * 30 + 12, 110]], i % 2 ? '#f6c445' : '#4fa3d8', i % 2 ? '#8a6414' : '#1f4e78', 2); }
    rrect(-120, 108, 240, 12, 3, '#3d4452', '#1c2029');
    rrect(-150, -6, 40, 14, 6, '#3d4452', '#1c2029'); rrect(110, -6, 40, 14, 6, '#3d4452', '#1c2029');
    rrect(-110, -20, 220, 126, 18, '#c0472f', '#5a1e14'); rrect(-110, -20, 220, 16, 6, '#d9634a', '#5a1e14');
    for (let i = 0; i < 5; i++) { const u = (t * .9 + i / 5) % 1; circ(-80 + i * 40, -20 - u * 14, 5 + u * 5, '#ffffff', '#8a93a6', 2); }
    const r = Math.sin(t * 20) * .06, up = Math.abs(Math.sin(t * 10)) * 6; cx.save(); cx.translate(0, -28 - up); cx.rotate(r);
    ell(0, 0, 112, 14, 0, '#d9634a', '#5a1e14'); rrect(-14, -24, 28, 14, 6, '#3d4452', '#1c2029'); cx.restore();
    steam(0, -60, t, 3, 90, 50); }),

  // "fruitbowl x y s"
  fruitbowl: D(t => { const b = i => Math.sin(t * 2.4 + i * 1.3) * 3;
    for (let i = 0; i < 7; i++) circ(70 + (i % 3) * 14 - (i > 5 ? 7 : 0), -50 + Math.floor(i / 3) * 14 + b(5), 9, '#8a5ab0', '#43245e', 2.5);
    cx.save(); cx.translate(-8, -40 + b(1)); cx.rotate(-.3); cx.beginPath(); cx.moveTo(-80, 0); cx.quadraticCurveTo(0, 70, 80, -10); cx.quadraticCurveTo(0, 36, -80, 0); cx.fillStyle = '#f6d65a'; cx.fill(); cx.strokeStyle = '#a8741a'; cx.lineWidth = 3; cx.stroke(); rrect(-86, -4, 10, 8, 2, '#6a4a24'); cx.restore();
    circ(-50, -40 + b(2), 34, '#e05a4f', '#6a2a24'); rrect(-52, -82 + b(2), 5, 14, 2, '#6a4a24'); ell(-38, -74 + b(2), 12, 6, -.5, '#6fbf73', '#2a5a2e', 2); circ(-60, -50 + b(2), 8, 'rgba(255,255,255,.35)');
    circ(16, -30 + b(3), 32, '#f29a52', '#8a4a1a'); circ(16, -58 + b(3), 3, '#6a8a2a');
    cx.beginPath(); cx.moveTo(-140, -14); cx.lineTo(140, -14); cx.quadraticCurveTo(130, 90, 0, 90); cx.quadraticCurveTo(-130, 90, -140, -14); cx.fillStyle = '#4fa3d8'; cx.fill(); cx.strokeStyle = '#1f4e78'; cx.lineWidth = 3; cx.stroke();
    path([[-120, 20], [120, 20]], '#cfe2f3', 6); rrect(-40, 88, 80, 14, 4, '#2a6fb0', '#1f4e78'); }),

  // "bread x y s"
  bread: D(t => { const k = .55 + .45 * sm(ph(t, 5) / .7), g = .5 + .5 * Math.sin(t * 3);
    soft([[0, 0, 110, '#ffcf7a']]);
    cx.save(); cx.translate(0, 40); cx.scale(1, k); cx.beginPath(); cx.moveTo(-110, 0); cx.bezierCurveTo(-130, -120, 130, -120, 110, 0); cx.closePath();
    cx.fillStyle = mix('#f3d08a', '#c9853a', k - .4); cx.fill(); cx.strokeStyle = '#6a3e14'; cx.lineWidth = 3 / k; cx.stroke();
    for (let i = -1; i <= 1; i++) { cx.beginPath(); cx.moveTo(i * 50 - 16, -60 + Math.abs(i) * 12); cx.quadraticCurveTo(i * 50, -78 + Math.abs(i) * 12, i * 50 + 16, -64 + Math.abs(i) * 12); cx.strokeStyle = '#7a4a1a'; cx.lineWidth = 4 / k; cx.stroke(); } cx.restore();
    poly([[-120, 30], [120, 30], [104, 110], [-104, 110]], '#7a8296', '#3d4452');
    for (let i = 0; i < 3; i++) path([[-60 + i * 60, 140], [-60 + i * 60 + 8, 128], [-60 + i * 60, 118]], mix('#f29a52', '#e05a4f', g), 4, { alpha: .8 }); }),

  // "ricebowl x y s"
  ricebowl: D(t => { cx.beginPath(); cx.ellipse(0, 0, 120, 60, 0, Math.PI, TAU); cx.fillStyle = '#f6f4f0'; cx.fill(); cx.strokeStyle = '#8a93a6'; cx.lineWidth = 3; cx.stroke();
    const R = rng(7); for (let i = 0; i < 46; i++) { const an = Math.PI + R() * Math.PI, rr = Math.sqrt(R()); ell(Math.cos(an) * 110 * rr, Math.sin(an) * 52 * rr, 6, 3, R() * 3, '#ffffff', '#b8bcc6', 1.5); }
    cx.beginPath(); cx.moveTo(-130, 0); cx.lineTo(130, 0); cx.quadraticCurveTo(120, 100, 0, 100); cx.quadraticCurveTo(-120, 100, -130, 0); cx.fillStyle = '#e05a4f'; cx.fill(); cx.strokeStyle = '#6a2a24'; cx.lineWidth = 3; cx.stroke();
    for (let i = 0; i < 4; i++) circ(-75 + i * 50, 42, 8, '#f6f4f0', '#6a2a24', 2); rrect(-44, 96, 88, 14, 4, '#c0472f', '#6a2a24');
    path([[60, -40], [170, -120]], '#6a4a24', 9); path([[60, -40], [170, -120]], '#c9a46a', 5); path([[76, -36], [180, -104]], '#6a4a24', 9); path([[76, -36], [180, -104]], '#c9a46a', 5);
    steam(-20, -50, t, 3, 90, 40); }),

  // "milkglass x y s"
  milkglass: D(t => { const u = ph(t, 5), lvl = sm(clamp(u / .8)), pour = u < .8;
    cx.save(); cx.translate(60, -150); cx.rotate(pour ? -1.05 : -.5); poly([[-24, 0], [44, 0], [40, 90], [-20, 90]], '#4fa3d8', '#1f4e78'); poly([[-24, 0], [-40, -10], [-22, 18]], '#4fa3d8', '#1f4e78');
    cx.beginPath(); cx.moveTo(44, 16); cx.bezierCurveTo(74, 16, 74, 70, 40, 72); cx.strokeStyle = '#1f4e78'; cx.lineWidth = 12; cx.stroke(); cx.strokeStyle = '#4fa3d8'; cx.lineWidth = 6; cx.stroke(); cx.restore();
    const top = 100 - lvl * 150;
    if (pour) { const w = 4 + Math.sin(t * 20) * 1.5; path([[18, -150], [8, -120], [6, top]], '#d0d4dc', w * 2 + 4); path([[18, -150], [8, -120], [6, top]], '#ffffff', w * 2); }
    cx.save(); cx.beginPath(); cx.moveTo(-60, -60); cx.lineTo(60, -60); cx.lineTo(48, 100); cx.lineTo(-48, 100); cx.closePath(); cx.clip();
    rrect(-70, top, 140, 170, 0, '#ffffff'); ell(0, top, 70, 6 + Math.sin(t * 8) * 2, 0, '#f2f2ee', '#d0d4dc', 2); cx.restore();
    poly([[-60, -60], [60, -60], [48, 100], [-48, 100]], 'rgba(207,226,243,.35)', '#7a8296'); path([[-44, -40], [-36, 80]], 'rgba(255,255,255,.7)', 6); }),

  // "goal x y s"
  goal: D(t => { const u = ph(t, 3.2), roll = sm(clamp(u / .55)), bulge = u > .5 && u < .8 ? Math.sin((u - .5) / .3 * Math.PI) * 18 : 0;
    rrect(-240, 110, 480, 20, 0, '#4caf5a', '#1f5a2a'); for (let i = 0; i < 5; i++) rrect(-240 + i * 100, 112, 50, 16, 0, '#6fbf73');
    const net = (x, y) => [x + (x > 40 ? bulge * ((y + 90) / 200) : 0), y];
    for (let x = 40; x <= 210; x += 24) path([net(x, -90), net(x + 20, 110)], '#f6f4f0', 2);
    for (let y = -90; y <= 110; y += 22) path([net(40, y), net(220, y)], '#f6f4f0', 2);
    path([[40, 110], [40, -90], [200, -90], [220, 110]], '#3d4452', 12); path([[40, 110], [40, -90], [200, -90], [220, 110]], '#f6f4f0', 7);
    const bx = lerp(-200, 150, roll), by = 82 - Math.sin(roll * Math.PI) * 40, br = 26;
    cx.save(); cx.translate(bx, by); circ(0, 0, br, '#ffffff', '#2a2a33'); cx.rotate(roll * 12);
    cx.beginPath(); cx.arc(0, 0, br, 0, TAU); cx.clip(); const pent = (px, py, r) => poly([0, 1, 2, 3, 4].map(i => [px + Math.cos(i * TAU / 5) * r, py + Math.sin(i * TAU / 5) * r]), '#2a2a33');
    pent(0, 0, 9); for (let i = 0; i < 5; i++) pent(Math.cos(i * TAU / 5 + .6) * 24, Math.sin(i * TAU / 5 + .6) * 24, 8); cx.restore(); circ(bx, by, br, null, '#2a2a33');
    if (roll < 1) for (let i = 0; i < 3; i++) path([[bx - 40 - i * 4, by - 10 + i * 10], [bx - 70 - i * 6, by - 10 + i * 10]], '#ffffff', 4, { alpha: .7 }); }),

  // "cricket x y s"
  cricket: D(t => { const u = ph(t, 2.4), swing = u < .4 ? lerp(-1.9, -2.2, u / .4) : u < .55 ? lerp(-2.2, .4, sm((u - .4) / .15)) : lerp(.4, -1.9, sm((u - .55) / .45));
    rrect(-240, 110, 480, 16, 0, '#c9a46a', '#6a4a24');
    for (let i = 0; i < 3; i++) rrect(-200 + i * 16, -10, 8, 120, 3, '#f3d9a8', '#8a6414', 2.5); rrect(-204, -16, 22, 6, 3, '#f3d9a8', '#8a6414', 2); rrect(-180, -16, 22, 6, 3, '#f3d9a8', '#8a6414', 2);
    cx.save(); cx.translate(-90, -40); cx.rotate(swing + Math.PI); rrect(-6, -10, 12, 46, 5, '#3d4452', '#1c2029'); rrect(-15, 34, 30, 110, 8, '#f3d9a8', '#8a6414'); path([[0, 44], [0, 134]], '#d9b878', 4); cx.restore();
    const hit = u >= .5; const bx = hit ? lerp(-40, 220, (u - .5) / .5) : lerp(220, -40, u / .5), by = hit ? 70 - Math.sin((u - .5) / .5 * Math.PI * .8) * 190 : 40 + Math.sin(u / .5 * Math.PI) * -30 + (u / .5) * 30;
    circ(bx, by, 14, '#c0272d', '#5a1014'); path([[bx - 10, by - 6], [bx + 10, by + 6]], '#f6f4f0', 2, { dash: [3, 3] });
    if (u > .5 && u < .62) for (let i = 0; i < 5; i++) { const an = i / 5 * TAU; path([[-40 + Math.cos(an) * 20, 60 + Math.sin(an) * 20], [-40 + Math.cos(an) * 36, 60 + Math.sin(an) * 36]], '#f6d65a', 5); } }),

  // "basketball x y s"
  basketball: D(t => { const u = ph(t, 1.1), h = 1 - (2 * u - 1) ** 2, y = 80 - h * 170, sq = u < .08 || u > .92 ? .82 : 1;
    rrect(-240, 106, 480, 20, 0, '#d9a86a', '#8a5a24'); for (let i = 0; i < 6; i++) path([[-240 + i * 90, 108], [-240 + i * 90, 124]], '#8a5a24', 2);
    rrect(120, -170, 100, 70, 6, '#f6f4f0', '#3d4452'); rrect(146, -150, 48, 34, 2, null, '#e05a4f', 4); rrect(150, -100, 8, 206, 2, '#4a4f5a');
    ell(150, -110, 30, 7, 0, null, '#e05a4f', 5); for (let i = 0; i < 5; i++) path([[124 + i * 13, -108], [132 + i * 9, -76]], '#f6f4f0', 2);
    ell(-20, 108, 40 * (.5 + .5 * (1 - h)), 6, 0, 'rgba(0,0,0,.18)');
    cx.save(); cx.translate(-20, y + 26 * (1 - sq)); cx.scale(1 / sq, sq); cx.rotate(t * 3); circ(0, 0, 28, '#f29a52', '#7a3a10');
    path([[-28, 0], [28, 0]], '#7a3a10', 3); path([[0, -28], [0, 28]], '#7a3a10', 3);
    cx.beginPath(); cx.arc(-34, 0, 24, -.95, .95); cx.stroke(); cx.beginPath(); cx.arc(34, 0, 24, Math.PI - .95, Math.PI + .95); cx.stroke(); cx.restore(); }),

  // "runner x y s c=#hex"
  runner: D((t, f, a) => { const c = col(a, '#e05a4f'), p = t * 9, s = Math.sin(p), b = Math.abs(Math.cos(p)) * -6;
    rrect(-240, 76, 480, 70, 0, '#c0472f', '#5a1e14'); for (let i = 0; i < 2; i++) path([[-240, 100 + i * 24], [240, 100 + i * 24]], '#f6f4f0', 3);
    for (let i = 0; i < 4; i++) { const x = 240 - ((t * 260 + i * 130) % 520); rrect(x, 96, 4, 8, 1, '#f6f4f0'); }
    for (let i = 0; i < 3; i++) path([[-70 - i * 10, -40 + i * 26], [-110 - i * 14, -40 + i * 26]], '#7a8296', 4, { alpha: .6 });
    cx.save(); cx.translate(0, b); const hip = [0, 22], sh = [14, -28];
    figure(hip, sh, [22, -50], [[s * .9, Math.max(0, -s) * 1.4 + .2], [-s * .9, Math.max(0, s) * 1.4 + .2]].map(([a1, a2]) => [a1, -a2]),
      [[-s * 1.1, 1.6], [s * 1.1, 1.6]].map(([a1, a2]) => [a1, a2 * Math.sign(1)]), c); cx.restore(); }),

  // "swimmer x y s c=#hex"
  swimmer: D((t, f, a) => { const c = col(a, '#f6c445'), p = t * 3.2, x = Math.sin(t * .7) * 30;
    rrect(-240, 0, 480, 140, 0, '#4fa3d8');
    for (let k = 0; k < 2; k++) { const arm = (p + k * Math.PI) % TAU, over = arm < Math.PI, ang = arm;
      if (!over) { const e = [x + 30 + Math.cos(ang + Math.PI) * -54, 6 + Math.sin(ang) * 40]; limb([[x + 30, -2], e], '#a8744a', '#5a3a1a', 9); } }
    ell(x, 0, 74, 13, 0, c, ed(c)); circ(x + 76, -8, 14, '#c98a5e', '#5a3a1a'); cx.beginPath(); cx.arc(x + 76, -8, 14, Math.PI, TAU); cx.fillStyle = '#e05a4f'; cx.fill(); cx.strokeStyle = '#6a2a24'; cx.lineWidth = 3; cx.stroke();
    for (let k = 0; k < 2; k++) { const arm = (p + k * Math.PI) % TAU; if (arm < Math.PI) { const e = [x + 30 - Math.cos(arm) * 56, -2 - Math.sin(arm) * 56]; limb([[x + 30, -2], e], '#c98a5e', '#5a3a1a', 9); } }
    for (let k = 0; k < 2; k++) limb([[x - 66, 2], [x - 120, 2 + Math.sin(t * 12 + k * Math.PI) * 10]], '#c98a5e', '#5a3a1a', 10);
    const w = []; for (let X = -240; X <= 240; X += 8) w.push([X, 4 + Math.sin(X * .06 + t * 3) * 4]); path(w, '#cfe8f6', 5);
    for (let i = 0; i < 5; i++) { const u = (t * .9 + i / 5) % 1; circ(x - 130 - u * 60, -6 - Math.sin(u * Math.PI) * 18, 6 * (1 - u) + 2, '#ffffff', '#8ab8d8', 1.5); }
    path([[-240, 120], [240, 120]], '#f6f4f0', 6, { dash: [30, 20], f: 0 }); }),

  // "speaker x y s"
  speaker: D(t => { const b = Math.sin(t * 9), C = [['#e05a4f', '#6a2a24'], ['#f6c445', '#8a6414'], ['#4fa3d8', '#1f4e78'], ['#9f74c0', '#43245e']];
    rrect(-140, -110, 130, 220, 14, '#3d4452', '#14171d'); circ(-75, -50, 30 + b * 1.5, '#2a2a33', '#14171d'); circ(-75, -50, 12 + b * 2, '#7a8296', '#14171d', 2);
    circ(-75, 40, 46 + b * 3, '#2a2a33', '#14171d'); circ(-75, 40, 20 + b * 3, '#7a8296', '#14171d', 2);
    for (let i = 0; i < 3; i++) { const r = 70 + i * 26 + b * 2, arc = []; for (let j = 0; j <= 10; j++) { const an = -.6 + j / 10 * 1.2; arc.push([-75 + Math.cos(an) * r, 40 + Math.sin(an) * r * .8]); } path(arc, '#7a8296', 4, { alpha: .35 + .25 * Math.sin(t * 5 - i) }); }
    for (let i = 0; i < 4; i++) { const u = (t * .3 + i / 4) % 1, [fl, eg] = C[i]; cx.save(); cx.globalAlpha *= u < .15 ? u / .15 : u > .8 ? (1 - u) / .2 : 1;
      cx.translate(10 + u * 150, 40 - u * 160 + Math.sin(u * 9 + i) * 14); cx.rotate(Math.sin(t * 3 + i) * .2); note(0, 0, fl, eg, i % 2); cx.restore(); } }),

  // "paintbrush x y s c=#hex"
  paintbrush: D((t, f, a) => { const c = col(a, '#e05a4f'), u = ph(t, 3.5), k = sm(clamp(u / .7)), fade = u > .88 ? 1 - (u - .88) / .12 : 1;
    rrect(-200, -110, 400, 220, 6, '#fbf8f0', '#c9c4ba');
    const S = []; for (let i = 0; i <= 30; i++) { const v = i / 30; S.push([lerp(-160, 160, v), Math.sin(v * TAU * 1.1) * 40 + 10]); }
    const done = upto(S, k); cx.save(); cx.globalAlpha *= fade; path(done, ed(c), 34); path(done, c, 28); path(done.map(([x, y]) => [x, y - 7]), mix(c, '#ffffff', .3), 6); cx.restore();
    const [hx, hy] = along(S, k); cx.save(); cx.translate(hx, hy); cx.rotate(.5);
    poly([[-14, 0], [14, 0], [10, -34], [-10, -34]], c, ed(c)); rrect(-12, -54, 24, 22, 3, '#c9c4ba', '#5a6170'); rrect(-8, -150, 16, 98, 8, '#c9853a', '#6a3e14'); cx.restore(); }),

  // "sewing x y s"
  sewing: D(t => { const n = Math.sin(t * 14), shift = (t * 30) % 24;
    rrect(-200, 60, 400, 26, 6, '#cfd3da', '#5a6170');
    cx.save(); cx.beginPath(); cx.rect(-200, 40, 400, 24); cx.clip(); rrect(-210, 40, 420, 22, 0, '#4fa3d8', '#1f4e78');
    for (let x = -220 + shift; x < 40; x += 24) rrect(x, 49, 14, 4, 2, '#f6f4f0'); cx.restore();
    poly([[-160, 60], [-160, -100], [110, -100], [130, -60], [130, -20], [70, -20], [70, -50], [-110, -50], [-110, 60]], '#e05a4f', '#6a2a24');
    rrect(-120, -90, 200, 12, 6, '#f29a52'); circ(-176, -40, 26, '#a9b0bd', '#4a4f5a'); path([[-176, -40], [-176 + Math.cos(t * 6) * 20, -40 + Math.sin(t * 6) * 20]], '#4a4f5a', 4);
    rrect(-40, -122, 16, 26, 4, '#f6c445', '#8a6414'); path([[-32, -96], [60, -96], [92, -50]], '#f6c445', 2);
    const ny = 10 + n * 10; rrect(84, -20, 16, 24 + n * 4, 2, '#7a8296', '#3d4452'); path([[92, 0], [92, ny + 30]], '#3d4452', 3); circ(92, ny + 30, 2, '#3d4452'); }),

  // "washer x y s c=#hex"
  washer: D((t, f, a) => { const c = col(a, '#f6f4f0'), sh = Math.sin(t * 30) * 1.5;
    cx.save(); cx.translate(sh, 0); rrect(-120, -140, 240, 270, 16, c, ed(c) === '#000000' ? '#4a4f5a' : '#7a8296'); rrect(-120, -140, 240, 50, 16, mix(c, '#7a8296', .25), '#7a8296');
    circ(70, -115, 13, '#3d4452', '#1c2029', 2.5); path([[70, -115], [70 + Math.cos(t) * 10, -115 + Math.sin(t) * 10]], '#f6f4f0', 3); rrect(-100, -122, 50, 14, 4, '#9fd0e8', '#1f4e78', 2);
    circ(0, 20, 90, '#a9b0bd', '#4a4f5a', 4); circ(0, 20, 72, '#4fa3d8', '#1f4e78');
    cx.save(); cx.beginPath(); cx.arc(0, 20, 72, 0, TAU); cx.clip(); cx.translate(0, 20); cx.rotate(t * 4);
    [['#e05a4f', 0], ['#f6c445', 2.1], ['#6fbf73', 4.2]].forEach(([cl, an]) => { cx.save(); cx.rotate(an); rrect(-12, 22, 40, 26, 6, cl, ed(cl), 2.5); cx.restore(); });
    for (let i = 0; i < 6; i++) circ(Math.cos(i) * 50, Math.sin(i * 2) * 40, 7, 'rgba(255,255,255,.7)'); cx.restore();
    ell(-26, -6, 22, 12, -.6, 'rgba(255,255,255,.45)'); cx.restore(); }),

  // "broom x y s"
  broom: D(t => { const s = Math.sin(t * 3.4);
    rrect(-240, 100, 480, 12, 0, '#c9a46a', '#6a4a24');
    for (let i = 0; i < 9; i++) circ(-150 + (i % 5) * 12 + (i > 4 ? 6 : 0), 92 - (i > 4 ? 10 : 0), 8, '#a9946e', '#6a5a3a', 2);
    for (let i = 0; i < 3; i++) { const u = (t * .9 + i / 3) % 1; cx.save(); cx.globalAlpha *= 1 - u; circ(-30 + s * 60 - u * 70 - i * 10, 86 - u * 50, 8 + u * 14, '#d6cfbf', '#9a8e74', 2); cx.restore(); }
    cx.save(); cx.translate(s * 60 + 40, 96); cx.rotate(.5 + s * .12);
    rrect(-7, -230, 14, 200, 6, '#c9853a', '#6a3e14'); rrect(-20, -40, 40, 16, 4, '#e05a4f', '#6a2a24');
    poly([[-20, -26], [20, -26], [44, 6], [-44, 6]], '#f6c445', '#8a6414'); for (let i = -3; i <= 3; i++) path([[i * 5, -22], [i * 12, 4]], '#a8741a', 2); cx.restore(); }),

  // "alarmclock x y s"
  alarmclock: D(t => { const u = ph(t, 3), ring = u < .6, w = ring ? Math.sin(t * 40) * .08 : 0;
    cx.save(); cx.rotate(w);
    for (const sd of [-1, 1]) { ell(sd * 62, -88, 34, 26, sd * .6, '#f6c445', '#8a6414'); }
    const hm = ring ? Math.sin(t * 60) * 22 : 0; path([[0, -94], [hm, -116]], '#3d4452', 5); circ(hm, -118, 8, '#3d4452');
    path([[-60, 70], [-80, 100]], '#3d4452', 10); path([[60, 70], [80, 100]], '#3d4452', 10);
    circ(0, 0, 96, '#e05a4f', '#6a2a24'); circ(0, 0, 76, '#f6f4f0', '#6a2a24');
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; circ(Math.cos(an) * 64, Math.sin(an) * 64, i % 3 ? 3 : 6, '#3d4452'); }
    const hr = t * .2, mn = t * 1.6; path([[0, 0], [Math.sin(hr) * 36, -Math.cos(hr) * 36]], '#3d4452', 7); path([[0, 0], [Math.sin(mn) * 54, -Math.cos(mn) * 54]], '#3d4452', 4); circ(0, 0, 7, '#e05a4f', '#6a2a24', 2); cx.restore();
    if (ring) for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const an = -Math.PI / 2 + sd * (.9 + i * .25), r = 130 + Math.sin(t * 20) * 6;
      path([[Math.cos(an) * r, Math.sin(an) * r - 20], [Math.cos(an) * (r + 30), Math.sin(an) * (r + 30) - 20]], '#3d4452', 5); } }),

  // "sleep x y s"
  sleep: D(t => { const br = Math.sin(t * 1.6);
    rrect(-60, -150, 150, 110, 6, '#1f2a4f', '#f6f4f0', 6); path([[15, -150], [15, -40]], '#f6f4f0', 5); path([[-60, -95], [90, -95]], '#f6f4f0', 5);
    cx.save(); cx.beginPath(); cx.rect(-60, -150, 150, 110); cx.clip(); circ(50, -110, 24, '#f6e8a6', '#a8741a', 2.5); circ(62, -118, 22, '#1f2a4f');
    for (let i = 0; i < 4; i++) { const tw = .5 + .5 * Math.sin(t * 3 + i * 2); star(-40 + i * 26, -130 + (i % 2) * 40, 5 + tw * 4, '#f6e8a6', null, 4); } cx.restore();
    rrect(-200, -40, 26, 160, 6, '#9a6b45', '#4f3420'); rrect(176, 10, 24, 110, 6, '#9a6b45', '#4f3420'); rrect(-190, 50, 380, 40, 6, '#9a6b45', '#4f3420');
    rrect(-180, 18, 360, 34, 10, '#f6f4f0', '#8a93a6'); ell(-140, 8, 34, 18, 0, '#f6f4f0', '#8a93a6'); circ(-128, -6, 18, '#c98a5e', '#5a3a1a');
    cx.beginPath(); cx.moveTo(-110, 22); cx.quadraticCurveTo(0, -12 - br * 6, 180, 14); cx.lineTo(186, 56); cx.lineTo(-114, 56); cx.closePath(); cx.fillStyle = '#5d6fd0'; cx.fill(); cx.strokeStyle = '#2a2f6a'; cx.lineWidth = 3; cx.stroke();
    path([[-80, 40], [170, 40]], '#8a9ae0', 4); }),

  // "schoolbag x y s c=#hex"
  schoolbag: D((t, f, a) => { const c = col(a, '#4fa3d8'), b = Math.sin(t * 2.2) * 4;
    cx.save(); cx.translate(0, b); cx.rotate(Math.sin(t * 1.1) * .03);
    rrect(-12, -134, 24, 40, 12, null, ed(c), 7);
    [['#f6c445', -40, -.15], ['#e05a4f', -12, .05], ['#6fbf73', 20, .2]].forEach(([cl, x, r], i) => { cx.save(); cx.translate(x, -70); cx.rotate(r + Math.sin(t * 2 + i) * .04); rrect(-7, -50 - i * 6, 14, 70, 2, cl, ed(cl), 2.5); poly([[-7, -50 - i * 6], [0, -64 - i * 6], [7, -50 - i * 6]], '#f3d9a8', ed(cl), 2); cx.restore(); });
    rrect(-90, -100, 180, 210, 40, c, ed(c)); rrect(-60, 10, 120, 80, 16, mix(c, '#ffffff', .2), ed(c)); rrect(-60, 10, 120, 20, 8, mix(c, '#000000', .15), ed(c), 2.5);
    path([[-90, -60], [90, -60]], ed(c), 3, { dash: [8, 6] }); rrect(-6, 20, 12, 16, 3, '#f6c445', '#8a6414', 2); cx.restore(); }),

  // "gradcap x y s"
  gradcap: D(t => { const C = [['#2f3542', '#14171d', -120, 0], ['#3d4f8a', '#1a2448', 20, .33], ['#2f3542', '#14171d', 140, .66]];
    for (let i = 0; i < 14; i++) { const u = (t * .3 + i / 14) % 1, x = -200 + (i * 37) % 400 + Math.sin(u * 8 + i) * 10, y = -140 + u * 280; cx.save(); cx.translate(x, y); cx.rotate(u * 9 + i);
      rrect(-5, -3, 10, 6, 1, ['#e05a4f', '#f6c445', '#4fa3d8', '#6fbf73', '#9f74c0'][i % 5]); cx.restore(); }
    C.forEach(([fl, eg, x0, o]) => { const u = ph(t, 2.4, o * 2.4), h = 1 - (2 * u - 1) ** 2, y = 90 - h * 200; cx.save(); cx.translate(x0, y); cx.rotate(u * TAU * (o > .5 ? -1 : 1));
      poly([[-34, 0], [34, 0], [30, 30], [-30, 30]], fl, eg); poly([[0, -26], [64, 0], [0, 26], [-64, 0]], fl, eg); circ(0, 0, 5, '#f6c445', '#8a6414', 2);
      const sw = Math.sin(t * 6 + o * 9) * 6; path([[0, 0], [40, 6], [44 + sw, 40]], '#f6c445', 4); rrect(38 + sw, 36, 12, 16, 3, '#f6c445', '#8a6414', 2); cx.restore(); }); }),
});
const lerp2 = (p, q, _, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
}
