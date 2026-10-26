// "railsignal cx cy height k=stop|go lab=1 lit=arm|lamp|ladder|lever" — an upper-quadrant semaphore home signal.
// A tall square post by the track carries the red arm (white stripe) on a pivot; on the arm's other end the spectacle
// holds a red and a green glass in front of the oil lamp, so by night the driver sees red when the arm is level and
// green when it is raised 45°. The signalman's wire pulls the balance lever at the foot of the post, and the down rod
// turns the arm; the heavy spectacle drops the arm back to danger if the wire breaks (it fails safe). A ladder climbs
// to the lamp platform. k=stop: arm level, red; k=go: arm up 45°, green. The arm settles with a small bounce.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const GROUND = { x: -118, y: -34, w: 230, d: 104, r: 4 }, TOP = 236, PIV = [-5, 9, 206], ARM = 66, LAMP = [12, -12];
  const RED_AT = [12, -12], GREEN_AT = [16.97, 0], TRACK_Y = 48;
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const RED = ISO.tint("#e8503f", ["#9c2a1f", "#b2372b", "#c64536", "#d84f40"], "#5a140e"), named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const rot = (u, w, a) => [PIV[0] + u * Math.cos(a) - w * Math.sin(a), PIV[2] + u * Math.sin(a) + w * Math.cos(a)];

  function groundSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(GROUND, -6, 6, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(GROUND, -6, 6, P, 4, 0.6), { tone: "lo" }))];
    return out.join("");
  }
  function trackSvg(P) {
    const out = [];
    // ballast bed, sleepers and the two rails
    out.push(ISO.tinted(ISO.T.road, ISO.poly([[-118, 30, 0], [112, 30, 0], [112, 66, 0], [-118, 66, 0], [-118, 34, 5], [112, 34, 5], [112, 62, 5], [-118, 62, 5]], ISO.BOX_F, P, "mid")));
    for (let x = -110; x <= 104; x += 14) out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x, x + 7], [35, 61], [5, 8], "mid")));
    for (const y of [TRACK_Y - 8, TRACK_Y + 8]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-118, 112], [y - 1.6, y + 1.6], [8, 9.5], "mid") + ISO.wbox(P, [-118, 112], [y - 0.6, y + 0.6], [9.5, 14], "mid") + ISO.wbox(P, [-118, 112], [y - 1.2, y + 1.2], [14, 15.6], "hi")));
    return out.join("");
  }
  function footSvg(P) {
    const out = [];
    // the post's concrete foot
    out.push(ISO.wbox(P, [-12, 12], [-12, 12], [0, 8], "mid"), D([[-8, 8], [8, 8], [8, -8]].map(([x, y]) => K.iso([x, y, 8], P)), { size: 0.7 }));
    return out.join("");
  }
  function postSvg(P) {
    const out = [ISO.tinted(ISO.T.wood, ISO.wbox(P, [-4, 4], [-4, 4], [8, TOP], "hi") + L([60, 120, 170].map((z) => K.sideSeam({ x: -4, y: -4, w: 8, d: 8, r: 0 }, z, P, 1)).join(""), { tone: "lo" }))];
    out.push(ISO.wbox(P, [-5, 5], [-5, 5], [TOP, TOP + 2], "mid"), S(G.solidOf([[0, 3], [3, 3], [6, 4.2, 1], [9, 3, 1], [11, 0]], zAx([0, 0, TOP + 2]), P), { tone: "hi" }));
    // the arm's bearing bracket and the lamp bracket
    out.push(ISO.wbox(P, [-7, 7], [4, 8], [PIV[2] - 6, PIV[2] + 6], "mid"));
    out.push(ISO.wbox(P, [4, LAMP[0] + 6], [-4, 2], [PIV[2] + LAMP[1] - 8, PIV[2] + LAMP[1] - 6], "mid"));
    return out.join("");
  }
  function lampSvg(P, glow) {
    const c = [PIV[0] + LAMP[0], 2, PIV[2] + LAMP[1]], out = [ISO.wbox(P, [c[0] - 6, c[0] + 6], [-5, 6], [c[2] - 6, c[2] + 8], "mid")];
    out.push(S(G.solidOf([[0, 4.4], [3, 3.6, 1], [5, 2], [7, 1.6]], zAx([c[0], 0.5, c[2] + 8]), P), { tone: "mid" }));
    out.push(S(G.disc(6, 7.2, 4.4, yAx(c), P), { tone: "hi" }), `<path d="${G.circleOf(yAx(c), 7.25, 3.4, P)}" fill="${glow > 0.5 ? "#fff6c9" : "#e9e2c4"}" stroke="#555" stroke-width="0.5"/>`);
    return named("lamp", out.join(""));
  }
  // The arm, its stripe and the spectacle with two glasses, at angle a (0 = level, −45° = raised).
  function armSvg(P, a, lampOn) {
    const at = (u, w, y) => { const [x, z] = rot(u, w, a); return [x, y, z]; }, out = [];
    // spectacle plate (between the glasses) behind the arm, on the pivot's side
    const ring = (u, w, r) => Array.from({ length: 25 }, (_, i) => at(u + r * Math.cos((i / 24) * Math.PI * 2), w + r * Math.sin((i / 24) * Math.PI * 2), 10.2));
    const hull = ISO.hullOf([...ring(0, 0, 4), ...ring(...RED_AT, 6.2), ...ring(...GREEN_AT, 6.2)].map((p) => K.iso(p, P)));
    out.push(`<path d="${K.pathOf(hull, true)}" fill="#2b2e33" stroke="#0b0c0e" stroke-width="0.8"/>`);
    for (const [[u, w], hot, cold] of [[RED_AT, "#e5322b", "#7a2420"], [GREEN_AT, "#2fb36b", "#1d5a3a"]]) {
      const lined = Math.hypot(...rot(u, w, a).map((v, i) => v - [PIV[0] + LAMP[0], PIV[2] + LAMP[1]][i])) < 2.5 && lampOn;
      out.push(`<path d="${K.pathOf(ring(u, w, 4.6).map((p) => K.iso([p[0], 10.4, p[2]], P)), true)}" fill="${lined ? hot : cold}" stroke="#0b0c0e" stroke-width="0.6"/>`);
      if (lined) { const c = K.iso(at(u, w, 10.5), P); out.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(K.cameraOf(P).k * 14).toFixed(1)}" fill="${hot}" opacity=".22"/>`); }
    }
    out.push(ISO.tinted(RED, ISO.box(at, P, [-ARM, -3], [-4.2, 4.2], [8.6, 10], "hi")));
    out.push(ISO.box(at, P, [-ARM + 6, -ARM + 11], [-4.2, 4.2], [10, 10.15], "hi"));
    out.push(S(G.disc(8, 11, 3, yAx([PIV[0], 0, PIV[2]]), P), { tone: "mid" }), D([K.iso([PIV[0], 11.05, PIV[2]], P)], { size: 1, tone: "hi" }));
    return named("arm", out.join(""));
  }
  // Down rod from the spectacle's crank to the balance lever at the foot, which turns with it.
  function rodSvg(P, a) {
    const [cx, cz] = rot(10, 8, a), lift = (cz - rot(10, 8, 0)[1]);
    const pivot = [-14, 14, 22], th = Math.atan2(lift, 26) * 0.9, end = [pivot[0] + Math.cos(th) * 26, 14, pivot[2] + Math.sin(th) * 26], wt = [pivot[0] - Math.cos(th) * 16, 14, pivot[2] - Math.sin(th) * 16];
    const out = [`<path d="${K.pathOf([K.iso([cx, 11.5, cz], P), K.iso(end, P)])}" fill="none" stroke="#3c3f45" stroke-width="1.2"/>`];
    out.push(ISO.wbox(P, [-17, -11], [10, 13], [8, 24], "mid"), ISO.box((u, w, y) => [pivot[0] + u * Math.cos(th) - w * Math.sin(th), y, pivot[2] + u * Math.sin(th) + w * Math.cos(th)], P, [-18, 27], [-1.2, 1.2], [13, 15.4], "hi"));
    out.push(S(G.disc(-3.5, 3.5, 4.6, yAx(wt), P), { tone: "mid" }), D([K.iso([cx, 11.6, cz], P), K.iso([end[0], 15.5, end[2]], P), K.iso([pivot[0], 15.5, pivot[2]], P)], { size: 0.9, tone: "hi" }));
    return named("lever", out.join(""));
  }
  function ladderSvg(P) {
    const out = [], rungs = [];
    for (const x of [-5, 5]) out.push(ISO.wbox(P, [x - 0.8, x + 0.8], [16, 17.6], [0, 186], "mid"));
    for (let z = 10; z < 184; z += 9) rungs.push(K.segment([-4.2, 16.8, z], [4.2, 16.8, z], P));
    out.push(L(rungs.join(""), { tone: "mid" }));
    for (const z of [60, 130]) out.push(ISO.wbox(P, [-1, 1], [4, 16], [z - 1, z + 1], "mid"));
    // the lamp platform with its railing
    out.push(ISO.wbox(P, [-14, 22], [4, 22], [184, 186], "mid"));
    const posts = [[-13, 21], [21, 21], [21, 5]];
    for (const [x, y] of posts) out.push(ISO.wbox(P, [x - 0.7, x + 0.7], [y - 0.7, y + 0.7], [186, 198], "mid"));
    out.push(ISO.seam(P, posts.map(([x, y]) => [x, y, 198]), "#3c3f45", 1.4), ISO.seam(P, posts.map(([x, y]) => [x, y, 192]), "#3c3f45", 1));
    return named("ladder", out.join(""));
  }

  ISO.add({
    name: "railsignal", title: "Semaphore signal", compare: "railsignal 480 270 420 k=stop",
    about: "An upper-quadrant semaphore by the track: the arm level means stop (red glass in front of the lamp), raised 45° means go (green); a ladder climbs to the lamp platform.",
    line: "railsignal cx cy height k=stop|go lab=1 lit=arm|lamp|ladder|lever",
    demo: { line: "railsignal 480 280 440 k=stop", script: [{ set: { k: "stop" }, hold: 1.5 }, { set: { k: "go" }, hold: "settle" }, { set: { k: "stop" }, hold: "settle" }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size;
      const { P, g } = ISO.frame([...K.boxCorners(GROUND, -6, 0), [0, 0, TOP + 13], [PIV[0] - ARM * 0.72, 9, PIV[2] + ARM * 0.72], [PIV[0] - ARM, 9, PIV[2]]], cx, cy, W, H, { azimuth: 70, elevation: 18 }, parent);
      const s = { a: o.k === "go" ? -Math.PI / 4 : 0, v: 0, k: o.k === "go" ? "go" : "stop" };
      g.innerHTML = `<g>${groundSvg(P)}${footSvg(P)}${postSvg(P)}</g><g data-part="lamp">${lampSvg(P, 1)}</g><g>${ladderSvg(P)}</g><g data-part="rod"></g><g data-part="arm"></g><g>${trackSvg(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "";
      const target = () => (s.k === "go" ? -Math.PI / 4 : 0);
      const draw = () => {
        w.rebuild(el.arm, s.a.toFixed(4), () => armSvg(P, s.a, true));
        w.rebuild(el.rod, s.a.toFixed(3), () => rodSvg(P, s.a));
        w.rebuild(el.words, s.k, () => !lab ? "" : ISO.word(K.iso([PIV[0] - ARM, 9, PIV[2] + (s.k === "go" ? ARM * 0.72 : 0)], P), s.k === "go" ? "arm raised: go" : "arm level: stop", s.k === "go" ? "#2c6a22" : "#c0392b", { size: 16, anchor: "end", dy: -12 }) +
          ISO.word(K.iso([22, 13, 186], P), "lamp platform", "#555", { size: 13, anchor: "start", dy: 4 }) + ISO.word(K.iso([-5, 17, 70], P), "ladder", "#555", { size: 13, anchor: "end" }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.k) s.k = p.k === "go" ? "go" : "stop"; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const goal = target();
        if (ISO.still()) { s.a = goal; s.v = 0; }
        else {
          // a damped spring: the heavy arm overshoots a little and settles, as real arms do
          const kk = 60, c = 7;
          for (let i = 0; i < 4; i++) { const h = dt / 4; s.v += (-kk * (s.a - goal) - c * s.v) * h; s.a += s.v * h; }
          if (Math.abs(s.a - goal) < 5e-4 && Math.abs(s.v) < 5e-3) { s.a = goal; s.v = 0; }
        }
        draw();
        return s.a !== goal || s.v !== 0;
      };
      g.readout = () => `${s.k === "go" ? "clear: arm raised 45°, green glass before the lamp" : "danger: arm level, red glass before the lamp"} · arm at ${(-s.a * 180 / Math.PI).toFixed(0)}° · if the wire breaks, the spectacle's weight drops the arm to danger`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
