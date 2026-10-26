// "electromagnet cx cy length turns=40 on=1 lab=1" — an iron bolt wound with copper wire, lifting paper clips.
// The bolt lies in two wooden supports; enamelled wire is wound round it and runs to a battery and a push switch.
// Current in the coil makes the bolt a magnet whose strength grows with turns × current, so more turns pick up more
// clips from the dish; switch off and they drop. set({ on: 1|0, turns }) switches it or rewinds it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -110, y: -50, w: 220, d: 100, r: 6 }, AXZ = 40, BOLT = { x0: -60, x1: 56, r: 4 }, AMPS = 1.5;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const DISH = [70, 20], TIP = [BOLT.x1 + 2, 0, AXZ];
  const clipsFor = (turns) => Math.min(8, Math.round((turns * AMPS) / 14));
  // A paper clip: a long rounded loop of wire, lying at p, turned by a about z (or hanging by its end when hung).
  const clipPath = (P, p, a, hang) => {
    const pts = [[0, 0], [10, 0], [11.5, 1.5], [10, 3], [1.5, 3], [0.3, 2.1], [1.5, 1.2], [8.5, 1.2]].map(([u, v]) => hang ? [p[0] + v * Math.cos(a) * 0.6, p[1] + v * Math.sin(a), p[2] - u] : [p[0] + u * Math.cos(a) - v * Math.sin(a), p[1] + u * Math.sin(a) + v * Math.cos(a), p[2]]);
    return K.pathOf(pts.map((q) => K.iso(q, P)));
  };

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: -100, y: -44, w: 38, d: 12, r: 1 })];
    for (const x of [-50, 30]) out.push(ISO.tinted(ISO.T.wood, ISO.prismY(P, [[x - 8, 0], [x + 8, 0], [x + 8, AXZ - 6], [x + 4, AXZ - 2], [x - 4, AXZ - 2], [x - 8, AXZ - 6]], -6, 6, ["#d9b483", "#f0dcbf"], "#f7e8d0", "#7a5a2e")));
    // The bolt: hex head, shank, threaded tip.
    const F = xAx([0, 0, AXZ]);
    out.push(S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * 7, Math.sin(i * Math.PI / 3) * 7]), BOLT.x0 - 6, BOLT.x0, P), { tone: "mid" }));
    out.push(S(G.disc(BOLT.x0, BOLT.x1, BOLT.r, F, P), { tone: "mid" }), L(G.ribsOf(F, BOLT.x1 - 14, BOLT.x1, BOLT.r, 10, P, { twist: 3, seams: true }), { tone: "lo" }));
    // Battery holder and a push switch.
    out.push(ISO.wbox(P, [-96, -40], [24, 40], [0, 4], "mid"), ISO.tinted(ISO.T.copper, S(G.disc(0, 12, 6, xAx([-92, 32, 10]), P), { tone: "hi" })), S(G.disc(12, 46, 6, xAx([-92, 32, 10]), P), { tone: "hi" }));
    out.push(ISO.wbox(P, [-14, 6], [26, 42], [0, 6], "mid"));
    if (lab) out.push(ISO.word(K.iso([-68, 32, 0], P), "1.5 V cell", "#555", { size: 13, dy: 18 }), ISO.word(K.iso([-4, 34, 0], P), "switch", "#555", { size: 13, dy: 18 }));
    // The dish the clips lie in.
    out.push(S(K.cylinder(DISH[0], DISH[1], 18, 0, 1.4, P, 48, 0.5), { tone: "mid" }), S(K.cylinder(DISH[0], DISH[1], 16, 1.4, 2, P, 48), { tone: "lo" }));
    return out.join("");
  }
  // The coil: enamelled copper wound between the supports, back half before the bolt's front, front half after.
  const coilSvg = (P, turns) => {
    const c = K.coil(-40, 22, [0, AXZ], BOLT.r + 1, Math.max(4, turns / 3), "x", P);
    return { back: `<path d="${c.back}" fill="none" stroke="#9a5a22" stroke-width="1.6"/>`, front: `<path d="${c.front}" fill="none" stroke="#c97a3a" stroke-width="1.8"/>` };
  };

  ISO.add({
    name: "electromagnet", title: "Electromagnet", compare: "electromagnet 470 230 400",
    about: "An iron bolt wound with copper wire on a battery: switched on it picks up paper clips, more of them with more turns.",
    line: "electromagnet cx cy length turns=40 on=1 lab=1",
    demo: { line: "electromagnet 480 270 400 on=0", script: [{ set: { on: 1 }, hold: "settle" }, { set: { on: 0 }, hold: "settle" }, { set: { turns: 80 }, hold: 0.8 }, { set: { on: 1 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, 0, AXZ + 12]], cx, cy, W, H, { azimuth: 62, elevation: 30 }, parent);
      const m = { turns: ISO.clamp(ISO.num(o, "turns", 40), 10, 100), on: o.on !== "0" };
      const rest = Array.from({ length: 8 }, (_, i) => [DISH[0] - 9 + (i % 4) * 5, DISH[1] - 6 + Math.floor(i / 4) * 6, 3.6 + (i % 2) * 0.4]);
      const s = { k: Array(8).fill(m.on ? 1 : 0) };
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g data-part="coilback"></g><g data-part="clips"></g><g data-part="coilfront"></g><path data-part="leads" fill="none" stroke="#c97a3a" stroke-width="1.4"/><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      w.attr(el.leads, "d", K.pathOf([[-40, 0, AXZ - 5], [-40, 20, 12], [-50, 32, 12], [-56, 32, 12]].map((p) => K.iso(p, P))) + K.pathOf([[22, 0, AXZ - 5], [22, 24, 8], [6, 34, 6]].map((p) => K.iso(p, P))) + K.pathOf([[-14, 34, 6], [-36, 34, 10]].map((p) => K.iso(p, P))));
      const draw = () => {
        const c = coilSvg(P, m.turns), n = clipsFor(m.turns);
        w.rebuild(el.coilback, m.turns, () => c.back);
        w.rebuild(el.coilfront, m.turns, () => c.front);
        w.rebuild(el.clips, s.k.map((v) => v.toFixed(2)).join() + n, () => s.k.map((k, i) => {
          // From the dish up to the bolt's tip, where they hang in a little chain.
          const hung = [TIP[0] + (i % 2) * 2, TIP[1] - 2 + (i % 3), TIP[2] - 3 - i * 4.5], p = rest[i].map((v, j) => v + (hung[j] - v) * k);
          return `<path d="${clipPath(P, p, i * 0.7, k > 0.5)}" fill="none" stroke="#7d8288" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>`;
        }).join(""));
        if (lab) w.rebuild(el.words, `${m.turns} ${m.on}`, () => ISO.word(K.iso([-10, 0, AXZ + 8], P), `${m.turns} turns of wire`, "#9a5a22", { size: 14, dy: -6 }));
      };
      g.set = (p) => { if (p.on !== undefined) m.on = !!+p.on; if (p.turns !== undefined) m.turns = ISO.clamp(+p.turns, 10, 100); };
      g.update = (dt) => {
        const n = m.on ? clipsFor(m.turns) : 0;
        let moving = false;
        s.k = s.k.map((v, i) => { const want = i < n ? 1 : 0, nv = ISO.follow(v, want, dt, want ? 0.12 + i * 0.03 : 0.08, ISO.still()); if (nv !== want) moving = true; return nv; });
        draw();
        return moving;
      };
      g.readout = () => `${m.on ? "on" : "off"} · ${m.turns} turns × ${AMPS} A · picks up ${m.on ? clipsFor(m.turns) : 0} clips (strength grows with turns × current)`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
