// A library model on the board: "eng": "m3 id=jet" in els, moved with the player's set command:
//   set eng view=side cut=1 xray=0 explode=0 hi=fan,nozzle labels=fan speed=0.12 mt=0     (hi= clears; what is left out stays)
// The model's code is in lib/m/<id>.js (library/export.mjs); this is the live half of the lesson player: changes ease in
// as the words come, and it holds, seeks and ends with the board (PAUSED, FAST, ENDED in index.html).
(() => {
  const W = 1600, H = 900, CAM_T = 1.4, TOG_T = 0.8;                // the size models lay out in; seconds a move takes
  const css = document.createElement('style');
  css.textContent = `.wrap{position:relative}
  .m3{position:absolute;left:0;right:0;top:0;aspect-ratio:16/9;overflow:hidden;pointer-events:none;background:#f4ede4;display:none}
  .m3 canvas{position:absolute;inset:0;width:100%!important;height:100%!important}
  .m3 svg{position:absolute;inset:0;width:100%;height:100%;background:none;border:0;box-shadow:none;border-radius:0}
  .m3 line{stroke:#2a2521;stroke-width:1.2} .m3 circle{fill:#f08a24;stroke:#fff;stroke-width:1.5}
  .m3 .l{position:absolute;left:0;top:0;white-space:nowrap;font:600 var(--f) Inter,system-ui,sans-serif;color:#2a2521;background:rgba(252,249,245,.95);border:1px solid #e6dbcc;border-radius:5px;padding:.2em .5em}
  .m3 .l.on{background:#2a2521;color:#fff;border-color:#2a2521}
  .m3 .n{position:absolute;right:2%;bottom:3%;background:rgba(252,249,245,.95);border:1px solid #eadfd0;border-radius:6px;padding:.4em .7em;font:600 var(--f) system-ui,sans-serif;color:#7a6c5e}
  .m3 .n div{display:flex;gap:.8em;justify-content:space-between} .m3 .n b{color:#2a2521}`;
  document.head.append(css);

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const ease = x => { x = clamp(x, 0, 1); return x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2; };
  const lerp = (a, b, k) => a + (b - a) * k;
  const wrapDeg = d => ((((d + 180) % 360) + 360) % 360) - 180;

  let layer, labels, lines, nums, live = null, raf = 0, last = 0, lastNums = '';
  const models = {};              // a model is built once per page: a seek rebuilds the board, and phones allow few 3D canvases

  const sizeUp = m => {
    const w = layer.clientWidth || 960; m.scale = w / W;
    m.pr = clamp((devicePixelRatio || 1) * m.scale, .75, 2) * m.q;    // q: how far this phone's speed has brought detail down
    m.model.resize(W, H, m.pr);
    layer.style.setProperty('--f', `${clamp(16 * m.scale, 9.5, 15).toFixed(1)}px`);
  };
  function open(id) {
    if (!layer) {
      layer = document.createElement('div'); layer.className = 'm3';
      layer.innerHTML = '<svg></svg><div class="ls"></div><div class="n"></div>';
      [lines, labels, nums] = layer.children;
      document.querySelector('.wrap').append(layer);
      new ResizeObserver(() => { if (live) { sizeUp(live); draw(live); } }).observe(layer);
    }
    layer.style.display = 'block';
    if (!models[id]) {
      const canvas = document.createElement('canvas'), t0 = performance.now();
      layer.prepend(canvas);
      const model = M3M[id](canvas);
      models[id] = { id, model, canvas, buildMs: performance.now() - t0, q: 1, frames: 0, slow: 0, spent: 0, t1: performance.now() + 2000 };   // the first 2 s build shaders: not the phone's speed
      model.warm?.();
    }
    return models[id];
  }

  const start = m => {
    const view = Object.keys(m.model.views)[0];
    Object.assign(m, { t: 0, speed: 1, u: 1e3, to: { view, cut: 0, xray: 0, explode: 0, hi: {}, lab: {} }, from: null });
  };
  // where everything is now, part way from the last change to this one
  function now(m) {
    const { from, to, u } = m, V = m.model.views, k = ease(u / TOG_T), c = ease(u / CAM_T);
    const a = from || to, cam = {}, vA = V[a.view], vB = V[to.view];
    for (const key of ['tx', 'ty', 'tz', 'el', 'd']) cam[key] = lerp(vA[key], vB[key], c);
    cam.az = vA.az + wrapDeg(vB.az - vA.az) * c;
    const mixSet = key => { const o = {}; for (const p of Object.keys(m.model.parts)) o[p] = lerp(a[key][p] || 0, to[key][p] || 0, k); return o; };
    return { cam, hi: mixSet('hi'), lab: mixSet('lab'), cut: lerp(a.cut, to.cut, k), xray: lerp(a.xray, to.xray, k), explode: lerp(a.explode, to.explode, k), k, c };
  }
  function draw(m) {
    const n = now(m), s = { t: m.t, cut: n.cut, xray: n.xray, explode: n.explode, hi: n.hi };
    m.model.frame(s, n.cam);
    const nu = m.model.readouts(s).slice(0, m.scale < .4 ? 3 : 5).map(([a, v, u]) => `<div>${a}<b>${v} ${u}</b></div>`).join('');
    if (nu !== lastNums) nums.innerHTML = lastNums = nu;
    // labels on leaders, pushed out from the model's centre so they never sit on the part; words stay readable on a phone
    const P = q => { const p = m.model.project(q); return p && [p[0] * m.scale, p[1] * m.scale]; };
    const w = layer.clientWidth, h = layer.clientHeight, push = Math.max(m.scale, .45);
    const centre = P(m.model.anchor('_centre', s)) || [w / 2, h / 2];
    let svg = '';
    for (const [k, t] of Object.entries(m.model.parts)) {
      const a = n.lab[k]; let d = m.labs[k];
      const p = a > .01 ? P(m.model.anchor(k, s)) : null;
      if (!p) { if (d) d.style.display = 'none'; continue; }
      if (!d) { d = m.labs[k] = document.createElement('div'); d.className = 'l'; d.textContent = t; labels.append(d); }
      d.style.display = 'block';
      const dx = p[0] - centre[0], dy = p[1] - centre[1], len = Math.hypot(dx, dy) || 1, bw = d.offsetWidth, bh = d.offsetHeight;
      const x = clamp(p[0] + dx / len * 70 * push + (dx < 0 ? -bw : 0), 2, w - bw - 2), y = clamp(p[1] + dy / len * 50 * push, 2, h - bh - 2);
      d.style.opacity = a; d.style.transform = `translate(${x}px,${y}px)`; d.classList.toggle('on', n.hi[k] > .5);
      svg += `<line x1="${p[0]}" y1="${p[1]}" x2="${x + bw / 2}" y2="${y + bh / 2}" opacity="${a}"/><circle cx="${p[0]}" cy="${p[1]}" r="3" opacity="${a}"/>`;
    }
    lines.setAttribute('viewBox', `0 0 ${w} ${h}`); lines.innerHTML = svg;
  }
  // too slow on this phone: draw fewer pixels rather than stutter
  function watch(m, dt, at) {
    if (at < m.t1) return;
    m.frames++; m.spent += dt; if (dt > .034) m.slow++;
    if (at - m.t1 < 2000) return;
    const fps = m.frames / m.spent, slow = m.slow / m.frames;
    if (slow > .3 && m.pr > .5) { m.q *= .75; sizeUp(m); }
    parent.postMessage({ type: 'm3stats', fps: Math.round(fps), slow: Math.round(slow * 100), pr: +m.pr.toFixed(2), width: layer.clientWidth, buildMs: Math.round(m.buildMs), model: m.id }, '*');
    m.frames = m.slow = m.spent = 0; m.t1 = at;
  }
  function tick(at) {
    raf = 0; if (!live) return;
    const dt = Math.min(.1, (at - last) / 1000); last = at;
    if (!PAUSED && !ENDED) { live.u += dt; live.t += live.speed * dt; draw(live); if (!FAST && dt > 0) watch(live, dt, at); }
    if (!ENDED) raf = requestAnimationFrame(tick);
  }

  self.M3 = {
    make(id, parent) {
      if (!Object.hasOwn(self.M3M || {}, id)) throw new Error(`No model "${id}"`);
      const m = live = open(id);
      m.labs ||= {}; m.canvas.style.display = 'block';
      for (const o of Object.values(models)) if (o !== m) o.canvas.style.display = 'none';
      start(m); sizeUp(m);
      const e = mk('g', {}, parent);
      e.iso = {
        children: [],                  // the board's "draw" has nothing to build part by part
        set(kv) {
          m.from = { ...now(m), view: m.to.view, hi: { ...now(m).hi }, lab: { ...now(m).lab } };
          // a camera caught mid-move starts from where its last target was; cuts and highlights start from where they are
          const to = { ...m.to };
          if (kv.view && Object.hasOwn(m.model.views, kv.view)) to.view = kv.view;
          for (const k of ['cut', 'xray', 'explode']) if (Number.isFinite(+kv[k]) && kv[k] !== undefined) to[k] = clamp(+kv[k], 0, 1);
          const names = v => Object.fromEntries(v.split(',').filter(p => Object.hasOwn(m.model.parts, p)).map(p => [p, 1]));
          if (kv.hi !== undefined) to.hi = names(kv.hi);
          if (kv.labels !== undefined) to.lab = names(kv.labels);
          if (Number.isFinite(+kv.speed) && kv.speed !== undefined) m.speed = clamp(+kv.speed, 0, 4);
          if (Number.isFinite(+kv.mt) && kv.mt !== undefined) m.t = +kv.mt;
          m.to = to; m.u = FAST ? 1e3 : 0;
        },
        update() { draw(m); },
      };
      last = performance.now(); if (!raf) raf = requestAnimationFrame(tick);
      draw(m);
      return e;
    },
    dispose() {
      live = null; if (raf) cancelAnimationFrame(raf); raf = 0;
      if (layer) { layer.style.display = 'none'; labels.replaceChildren(); lines.innerHTML = ''; }
      for (const m of Object.values(models)) m.labs = {};
    },
  };
})();
