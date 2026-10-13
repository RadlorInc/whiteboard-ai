// Shared canvas helpers for the two non-whiteboard styles (stop-motion montage, match-cut).
// Kept apart from recipes.js on purpose: these styles must not borrow the whiteboard look.
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2);
const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;     // seeded, so stars stay put
const mix = (c1, c2, k) => { const p = c => c.match(/\w\w/g).map(h => parseInt(h, 16)); const a = p(c1), b = p(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };

function makeKit(cx) {
  const poly = (pts, fill, stroke, lw = 3) => { cx.beginPath(); pts.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.closePath();
    if (fill) { cx.fillStyle = fill; cx.fill(); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw; cx.lineJoin = 'round'; cx.stroke(); } };
  const circ = (x, y, r, fill, stroke, lw = 3) => { cx.beginPath(); cx.arc(x, y, Math.max(r, 0), 0, TAU); if (fill) { cx.fillStyle = fill; cx.fill(); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw; cx.stroke(); } };
  const rrect = (x, y, w, h, r, fill, stroke, lw = 3) => { cx.beginPath(); cx.roundRect(x, y, w, h, r); if (fill) { cx.fillStyle = fill; cx.fill(); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw; cx.stroke(); } };
  const grad = (y0, y1, stops) => { const g = cx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; };
  const stars = (n, seed, w, h, col = '#fff') => { const r = rng(seed); cx.fillStyle = col; for (let i = 0; i < n; i++) { const s = r() * 1.6 + .4; cx.globalAlpha = .4 + r() * .6; cx.fillRect(r() * w, r() * h, s, s); } cx.globalAlpha = 1; };

  // ---- stop-motion look: grain sheets swapped every frame + the box friend, redrawn a hair differently each frame
  const GRAIN = [1, 2, 3].map(seed => { const c = document.createElement('canvas'); c.width = 480; c.height = 300; const g = c.getContext('2d'), im = g.createImageData(480, 300), r = rng(seed * 99);
    for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 26; } g.putImageData(im, 0, 0); return c; });
  const grain = (f, w, h) => { cx.save(); cx.globalCompositeOperation = 'multiply'; cx.drawImage(GRAIN[f % 3], 0, 0, w, h); cx.restore(); };
  const BODY = '#d07a55', EDGE = '#7a3f27';
  function boxFriend(x, y, f, pose = {}) {       // pose: walk (phase), happy, closed, armUp, armsUp, body/edge colours
    const B = pose.body || BODY, E = pose.edge || EDGE;
    const jit = rng(f % 3 + 7);
    cx.save(); cx.translate(x + (jit() - .5) * 1.5, y + (jit() - .5) * 1.5); cx.rotate(-.06 + (jit() - .5) * .01);
    [-44, -18, 14, 40].forEach((lx, i) => { const swing = pose.walk != null ? Math.sin(pose.walk * TAU + i * Math.PI) * .25 : 0;
      cx.save(); cx.translate(lx, 34); cx.rotate(swing); rrect(-6, 0, 12, 46, 3, B, E, 2.5); cx.restore(); });
    cx.save(); cx.translate(-66, -4); cx.rotate(pose.armsUp ? .9 : 0); rrect(-22, -11, 26, 22, 3, B, E, 2.5); cx.restore();
    cx.save(); cx.translate(66, -4); cx.rotate(pose.armUp || pose.armsUp ? -.9 : 0); rrect(-4, -11, 26, 22, 3, B, E, 2.5); cx.restore();
    rrect(-64, -46, 128, 86, 6, B, E, 3);
    if (pose.closed) { cx.strokeStyle = '#2a1a12'; cx.lineWidth = 4; cx.lineCap = 'round'; for (const ex of [-22, 22]) { cx.beginPath(); cx.moveTo(ex - 9, -6); cx.lineTo(ex + 9, -6); cx.stroke(); } }
    else if (pose.happy) { cx.strokeStyle = '#2a1a12'; cx.lineWidth = 4; cx.lineCap = 'round';
      for (const ex of [-22, 22]) { cx.beginPath(); cx.moveTo(ex - 9, -2); cx.lineTo(ex, -12); cx.lineTo(ex + 9, -2); cx.stroke(); } }
    else for (const ex of [-22, 22]) rrect(ex - 4.5, -18, 9, 22, 4, '#2a1a12');
    cx.restore();
  }

  // ---- match-cut look: an object is a shape along its length, tail (u=0) to nose (u=1).
  // Every object is sampled at the same u points, so any object can flow into any other.
  const M = 160;
  const outline = o => { const top = [], bot = [];
    for (let i = 0; i <= M; i++) { const u = i / M, x = (u - .5) * o.L; top.push([x, o.top(u)]); bot.push([x, o.bot(u)]); } return [top, bot]; };
  // draw object A turning into object B (k = 0..1) at x,y, pointing along angle `ang`
  function morphObject(A, B, k, x, y, ang = 0, glow = 0) {
    const [ta, ba] = outline(A), [tb, bb] = outline(B);
    const top = ta.map((p, i) => [lerp(p[0], tb[i][0], k), lerp(p[1], tb[i][1], k)]);
    const bot = ba.map((p, i) => [lerp(p[0], bb[i][0], k), lerp(p[1], bb[i][1], k)]);
    const shape = [...top, ...bot.slice().reverse()];
    cx.save(); cx.translate(x, y); cx.rotate(ang);
    if (glow) { cx.shadowColor = glow; cx.shadowBlur = 16; }
    poly(shape, mix(A.fill, B.fill, k)); cx.shadowBlur = 0;
    cx.save(); cx.beginPath(); shape.forEach(([px, py], i) => i ? cx.lineTo(px, py) : cx.moveTo(px, py)); cx.closePath(); cx.clip();
    const parts = (o, a) => { if (a <= 0.01) return; cx.globalAlpha = a;
      (o.parts || []).forEach(([u0, u1, col]) => { const i0 = Math.round(u0 * M), i1 = Math.round(u1 * M);
        poly([...top.slice(i0, i1 + 1), ...bot.slice(i0, i1 + 1).reverse()], col); });
      (o.lines || []).forEach(([u0, v0, u1, v1, col, w]) => { const at = (u, v) => { const i = Math.round(u * M); return [top[i][0], lerp(top[i][1], bot[i][1], (v + 1) / 2)]; };
        const [x0, y0] = at(u0, v0), [x1, y1] = at(u1, v1); cx.strokeStyle = col; cx.lineWidth = w || 2; cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke(); });
      cx.globalAlpha = 1; };
    parts(A, 1 - k); parts(B, k);
    cx.restore();
    poly(shape, null, mix(A.edge, B.edge, k), 3);
    cx.restore();
  }
  const tipOf = (o, x, y, ang) => [x + Math.cos(ang) * o.L / 2, y + Math.sin(ang) * o.L / 2];   // where the nose is on screen
  return { poly, circ, rrect, grad, stars, grain, boxFriend, BODY, EDGE, morphObject, tipOf };
}

// ---- tiny narrated player: scenes [start, end, draw(t, f)], captions [time, text], fixed fps for stop-motion
function narratedPlayer({ canvas, kit, scenes, caps = [], fps = 60, len, grainOn = false, captionEl, voiceEl }) {
  const cx = canvas.getContext('2d'); let run = 0;
  const frameAt = t => { const tq = Math.floor(t * fps) / fps, f = Math.floor(t * fps);
    const sc = scenes.find(s => tq >= s[0] && tq < s[1]) || scenes[scenes.length - 1];
    cx.save(); cx.clearRect(0, 0, canvas.width, canvas.height); sc[2](tq - sc[0], f, tq); cx.restore();
    if (grainOn) kit.grain(f, canvas.width, canvas.height); };
  const capAt = t => { let c = -1; caps.forEach((x, i) => { if (t >= x[0]) c = i; }); return c; };
  function play(at = 0, still = false) {
    const id = ++run; let t0 = performance.now() - at * 1000, said = -2, holdAt = 0, busy = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    self.hushVoice?.();
    // With the app's spoken lines (bridge.js), arriving one by one, the clock holds just before the next line until
    // that line has arrived and the one before has finished, so a line is never cut or late (the estimated
    // timeline then stretches to the real voice).
    const wavs = !still && self.VOICE_WAVS?.length === caps.length ? self.VOICE_WAVS : null;
    const tick = () => { if (id !== run) return;
      const now = performance.now(); if (holdAt) { t0 += now - holdAt; holdAt = now; }
      let t = still ? at : (now - t0) / 1000;
      const next = Math.max(0, said + 1);                  // said starts at -2: nothing said yet
      if (wavs && next < caps.length && t >= caps[next][0] - .6 && (busy || wavs[next] === undefined)) holdAt ||= now;
      else holdAt = 0;
      frameAt(Math.min(t, len - .01));
      const c = holdAt ? said : capAt(t); if (c !== said) {             // holding: the next line has not started said = c; if (captionEl) captionEl.textContent = c >= 0 ? caps[c][1] : '';
        if (!still && c >= 0 && wavs) { busy = true; self.sayLine(wavs[c], caps[c][1]).then(() => { busy = false; }); }
        else if (!still && c >= 0 && voiceEl?.checked && window.speechSynthesis) { const u = new SpeechSynthesisUtterance(caps[c][1]); u.rate = 1.02; speechSynthesis.speak(u); } }
      if (!still && t < len) requestAnimationFrame(tick); };
    tick();
  }
  return { play, stop: () => { run++; } };                         // a new show() stops the old player's clock
}
