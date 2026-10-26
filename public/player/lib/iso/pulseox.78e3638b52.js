// "pulseox cx cy size on=0|1 lab=0 lit=clip|screen|finger|hinge |text" — a fingertip pulse oximeter on a model finger.
// A plain teaching-model finger stands out of its block; the oximeter is a two-part clip on a sprung hinge with soft
// pads, a screen on top and a button. A red and an infrared light shine through the fingertip from the lower pad to
// a sensor in the upper one; blood that carries oxygen lets more red through, and each heartbeat swells the light a
// little, which is the beating bar. `text` is the reading (default 98%). set({ on: 1 }) opens the clip, slides it on
// and lets it close; after about 4 s of beats the screen shows SpO₂ and the pulse (72 a minute).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. Finger axis along x at height ZH; the clip's hinge is at x = HX.
  const ZH = 40, HX = -22, LEN = 60, HALF = 17, BEAT = 72, OFF = 74;
  const BLOCK = { x: -112, y: -22, w: 36, d: 44, r: 6 };
  const SKIN = ISO.tint("#ece7df", ["#bdb4a8", "#cbc3b8", "#d8d1c7", "#e3ddd4"], "#5e554a");
  const SHELL = ISO.tint("#e9eef3", ["#aab6c2", "#bcc6d0", "#ccd5dd", "#dbe2e8"], "#3e4a56");
  const PAD = ISO.tint("#6d737a", ["#3a3e43", "#43474d", "#4c5157", "#565b61"], "#1b1d20");
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // a 2D plane drawn through three world points: origin, +u (one unit right) and +v (one unit down the page)
  const planeMatrix = (P, o, eu, ev) => { const a = K.iso(o, P), b = K.iso(eu, P), c = K.iso(ev, P); return `matrix(${b[0] - a[0]} ${b[1] - a[1]} ${c[0] - a[0]} ${c[1] - a[1]} ${a[0]} ${a[1]})`; };

  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -125, y: -40, w: 190, d: 80, r: 20 }, 0, 10, P)}"/>`];
    out.push(S(K.slabOf({ x: -130, y: -46, w: 200, d: 92, r: 8 }, -8, 8, P, 6, 1), { tone: "lo", inner: L(K.sideSeam({ x: -130, y: -46, w: 200, d: 92, r: 8 }, -3, P, 6), { tone: "faint" }) }));
    out.push(ISO.tinted(SKIN, S(K.slabOf(BLOCK, 0, ZH + 14, P, 6, 1), { tone: "mid", inner: L(K.sideSeam(BLOCK, 8, P, 6), { tone: "faint" }) })));
    return out.join("");
  }
  // The finger: a smooth round form from the block to a domed tip at x = 16. Nothing else on it.
  function fingerSvg(P) {
    const F = xAx([BLOCK.x + BLOCK.w, 0, ZH]), len = 16 - (BLOCK.x + BLOCK.w), prof = [[0, 0], [0, 10.4], [12, 10, 1], [40, 9.3, 1], [len - 9, 8.6, 1]];
    for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push([len - 9 + 9 * Math.sin(a), 8.6 * Math.cos(a), i < 8 ? 1 : 0]); }
    return ISO.tinted(SKIN, S(G.lathe(prof, F, P), { tone: "hi", inner: L(G.arcOf(F, 12, 10, P, { slope: -0.03 }), { tone: "faint" }) }));
  }
  // The lower half, at the clip's rest place; it moves on and off with the whole clip by translation. Its far side
  // wall is drawn before the finger, its near side wall after, so the finger lies in it.
  const LOWP = { x: HX, y: -HALF, w: LEN, d: 2 * HALF, r: 7 };
  function lowerSvg(P, near) {
    const out = [], wall = (y0, y1) => ISO.tinted(SHELL, ISO.wbox(P, [HX + 3, HX + LEN - 3], [y0, y1], [ZH - 10, ZH + 1.5], "mid"));
    if (near) return wall(10.5, HALF - 0.5);
    out.push(ISO.tinted(SHELL, S(K.slabOf(LOWP, ZH - 24, 14, P, 5, 0.8), { tone: "mid", inner: L(K.sideSeam(LOWP, ZH - 19, P, 5), { tone: "faint" }) })));
    out.push(ISO.tinted(PAD, S(K.slabOf({ x: HX + 6, y: -10, w: LEN - 12, d: 20, r: 5 }, ZH - 10, 2.6, P, 4), { tone: "mid" })));
    out.push(`<ellipse cx="${K.iso([HX + 34, 0, ZH - 7.3], P)[0].toFixed(1)}" cy="${K.iso([HX + 34, 0, ZH - 7.3], P)[1].toFixed(1)}" rx="5" ry="2" fill="#e8402f" opacity=".85"/>`);
    out.push(wall(-HALF + 0.5, -10.5));
    // the hinge knuckles at the back
    for (const y of [-HALF + 2, HALF - 8]) out.push(ISO.tinted(SHELL, S(G.disc(0, 6, 4.6, yAx([HX - 1, y, ZH]), P), { tone: "mid" })));
    return out.join("");
  }
  // The upper half, opened by a about the hinge; its screen is drawn in its top face.
  function upperSvg(P, a) {
    const at = (u, w, y) => [HX + u * Math.cos(a) - w * Math.sin(a), y, ZH + u * Math.sin(a) + w * Math.cos(a)];
    const out = [ISO.tinted(PAD, ISO.box(at, P, [6, LEN - 6], [7.5, 10], [-10, 10], "mid"))];
    out.push(ISO.tinted(SHELL, ISO.box(at, P, [3, LEN - 3], [2, 10], [-HALF + 0.5, -10.5], "mid") + ISO.box(at, P, [3, LEN - 3], [2, 10], [10.5, HALF - 0.5], "mid")));
    out.push(ISO.tinted(SHELL, ISO.box(at, P, [0, LEN], [10, 25], [-HALF, HALF], "mid")));
    out.push(ISO.tinted(SHELL, ISO.box(at, P, [-2, 6], [4, 12], [-HALF + 7, HALF - 7], "mid")), S(G.disc(-1.5, 1.5, 4.6, yAx(at(-1, 0, -HALF + 7)), P), { tone: "mid" }));
    // screen glass and the button in front of it
    out.push(ISO.tinted(ISO.T.plastic, ISO.box(at, P, [10, 46], [25, 25.6], [-12, 12], "mid")));
    out.push(ISO.tinted(ISO.T.blue, S(G.disc(25, 27.4, 3.6, G.frameOf(at(52, 0, 0), [-Math.sin(a), 0, Math.cos(a)], [Math.cos(a), 0, Math.sin(a)], [0, 1, 0]), P), { tone: "hi" })));
    return out.join("");
  }
  const screenMatrix = (P, a, dx) => {
    const at = (u, y) => [HX + dx + u * Math.cos(a) - 25.7 * Math.sin(a), y, ZH + u * Math.sin(a) + 25.7 * Math.cos(a)];
    return planeMatrix(P, at(11, -11), at(12, -11), at(11, -10));
  };

  ISO.add({
    name: "pulseox", title: "Pulse oximeter", compare: "pulseox 500 270 300 |98%",
    about: "A fingertip pulse oximeter clipped on a model finger: red and infrared light shine through the fingertip; the screen shows SpO₂ and pulse, and a bar beats with each heartbeat.",
    line: "pulseox cx cy size on=0|1 lab=0 lit=clip|screen|finger|hinge |text",
    demo: { line: "pulseox 500 270 300 on=0 |98%", script: [{ set: { on: 1, lit: "clip" }, hold: "settle" }, { set: { lit: "screen" }, hold: 4 }] },
    make([cx, cy, size = 300], o, text, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = size * 1.9, H = size * 1.25;
      const spo2 = ISO.clamp(parseFloat(text) || 98, 50, 100);
      const pts = [[-130, -46, -8], [70 + OFF * 0.2, 46, -8], [-130, 46, -8], [70, -46, -8], [HX, 0, ZH + 52], [HX + LEN, 0, ZH + 26], [HX + LEN + OFF * 0.4, 0, ZH + 40]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 38, elevation: 34 }, parent);
      g.innerHTML = `<g>${baseSvg(P)}</g><g data-part="clip"><g data-name="clip-low">${lowerSvg(P, false)}</g></g><g data-name="finger">${fingerSvg(P)}</g><g data-part="clipnear"><g data-name="clip-near">${lowerSvg(P, true)}</g></g>` +
        `<g data-part="top"><g data-name="clip"></g><g data-name="screen"><g data-part="scr"><rect x="0" y="0" width="34" height="22" rx="1.5" fill="#06090d"/>` +
        `<text data-part="spo2" x="1.6" y="13.6" fill="#3fd0ff" style="font:700 11px 'Helvetica Neue',Arial,sans-serif"></text><text x="1.8" y="20.6" fill="#7fa9c4" style="font:600 3.4px 'Helvetica Neue',Arial,sans-serif">SpO₂ %</text>` +
        `<text data-part="pr" x="20.4" y="13.6" fill="#9dffb0" style="font:700 7px 'Helvetica Neue',Arial,sans-serif"></text><text x="21.6" y="20.6" fill="#7fa9c4" style="font:600 3.4px 'Helvetica Neue',Arial,sans-serif">PR bpm</text>` +
        `<text x="22" y="5.4" fill="#ff6b6b" data-part="heart" style="font:700 4.4px 'Helvetica Neue',Arial,sans-serif">♥</text>` +
        Array.from({ length: 6 }, (_, i) => `<rect data-bar="${i}" x="31" y="${18 - i * 3}" width="2" height="2.4" fill="#3fd0ff"/>`).join("") + `</g></g></g><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const clip = q("clip"), top = q("top"), upper = g.querySelector('[data-name="clip"]'), scr = q("scr"), bars = [...g.querySelectorAll("[data-bar]")];
      const on0 = o.on !== "0";
      const s = { on: on0, x: on0 ? 0 : 1, open: 0, t: 0, read: on0 ? 9 : 0, lit: o.lit || "" };
      if (lab) {
        const word = (p, t, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], t, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word([BLOCK.x + 10, BLOCK.y + BLOCK.d, ZH], "Model finger", "middle", 26) + word([HX + LEN, HALF, ZH - 24], "Oximeter clip", "start", 16, 4) + word([HX - 4, 0, ZH + 30], "Sprung hinge", "end", -2, -10);
      }
      const draw = () => {
        // slide on: open while sliding (the clip springs open before it reaches the tip), close once it is home
        const dx = OFF * ISO.ease(s.x), a = s.open * 0.42;
        w.attr(clip, "transform", K.translateAlong(P, [dx, 0, 0]));
        w.attr(top, "transform", K.translateAlong(P, [dx, 0, 0]));
        w.attr(q("clipnear"), "transform", K.translateAlong(P, [dx, 0, 0]));
        w.rebuild(upper, a.toFixed(3), () => upperSvg(P, a));
        w.attr(scr, "transform", screenMatrix(P, a, 0));
        const ready = s.read > 4, warm = s.on && s.x < 0.01 && s.open < 0.02;
        w.rebuild(q("spo2"), ready ? spo2 : warm ? "--" : "", () => (ready ? String(Math.round(spo2)) : warm ? "--" : ""));
        w.rebuild(q("pr"), ready ? "72" : warm ? "--" : "", () => (ready ? String(BEAT) : warm ? "--" : ""));
        // the beating bar: rises with each beat's swell of blood, then falls
        const ph = (s.t * BEAT) / 60 % 1, level = warm ? Math.round(6 * Math.exp(-ph * 4) * Math.min(1, ph * 12)) : 0;
        bars.forEach((b, i) => w.attr(b, "opacity", i < level ? "1" : "0.12"));
        w.attr(q("heart"), "opacity", warm && ph < 0.2 ? "1" : "0.15");
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
      };
      g.set = (p) => { if (p.on !== undefined) { s.on = !!+p.on; s.read = 0; } if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        const wantX = s.on ? 0 : 1, away = Math.abs(s.x - wantX) > 0.002;
        // open first, slide, then close
        if (away) { s.open = ISO.follow(s.open, 1, dt, 0.12, calm); if (s.open > 0.9 || calm) s.x = calm ? wantX : s.x + Math.sign(wantX - s.x) * Math.min(Math.abs(wantX - s.x), dt / 1.1); }
        else { s.x = wantX; s.open = ISO.follow(s.open, 0, dt, 0.1, calm); }
        if (s.on && !away && s.open < 0.02) s.read += dt; else if (!s.on) s.read = 0;
        if (calm && s.on) s.read = 9;
        draw();
        return away || s.open > 0.001 || (s.on && s.read < 4.2);
      };
      g.readout = () => {
        if (!s.on) return "clip off · press the back to open it, slide it onto the fingertip";
        if (s.read <= 4) return s.x > 0.01 || s.open > 0.02 ? "clip opening onto the fingertip" : "red and infrared light shine through the fingertip · finding the pulse…";
        return `SpO₂ ${Math.round(spo2)}% · ${Math.round(spo2)} in every 100 haemoglobin carry oxygen · normal 95–100% · pulse ${BEAT} a minute`;
      };
      draw();
      return g;
    },
  });
})();
