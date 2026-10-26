// "wallsocket cx cy k sw=0|1 lab=0 lit=plate|socket|switch|lamp|earth|live|neutral" — a PART (PARTS.md, batch 6): a
// switched wall socket plate, Indian 6 A style (IS 1293), from plug.js, its origin the plate's centre on the wall face
// (y = 0). A white plate 14 × 8.6 cm standing 1 cm off the wall, two fixing screws at its ends; on the right a raised
// round socket boss with the three holes, each showing its brass spring contact inside (live and neutral below, the
// bigger earth hole on top); on the left the rocker switch and a red neon lamp above it. sw=1 flips the switch on and
// lights the lamp (230 V on the socket). set({ sw }). anchors: socket switch
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const F = 0.113, PF = 9, SX = 22, PW = 62, PZ = 38;
  const PINS = { live: { x: 9.5, z: -6, r: 2.5 }, neutral: { x: -9.5, z: -6, r: 2.5 }, earth: { x: 0, z: 16, r: 3.5 } };
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const WHITE = ISO.tint("#fbfbf8", ["#c9c9c2", "#d6d6cf", "#e2e2db", "#ecece6"], "#6f6f66");
  function plateSvg(P) {
    const out = [`<g data-name="plate">${ISO.tinted(WHITE, ISO.wbox(P, [-PW, PW], [0, PF], [-PZ, PZ], "mid"))}`];
    out.push(`<path d="${K.pathOf([[-PW + 3, PF + 0.01, -PZ + 3], [PW - 3, PF + 0.01, -PZ + 3], [PW - 3, PF + 0.01, PZ - 3], [-PW + 3, PF + 0.01, PZ - 3]].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#c9c9c2" stroke-width=".6"/>`);
    for (const x of [-54, 54]) out.push(ISO.tinted(WHITE, S(G.solidOf([[PF, 2.4], [PF + 0.8, 2.2, 1], [PF + 1.2, 1.2]], yAx([x, 0, 0]), P, { steps: 14 }), { tone: "mid", inner: `<path d="${K.pathOf([K.iso([x - 1.6, PF + 1.21, 0], P), K.iso([x + 1.6, PF + 1.21, 0], P)])}" stroke="#6f6f66" stroke-width=".5"/>` })));
    out.push("</g>");
    // the socket boss and its three holes, each with its brass spring contact showing inside
    out.push(`<g data-name="socket">${ISO.tinted(WHITE, S(G.disc(PF, PF + 2.4, 27, yAx([SX, 0, 2]), P, { steps: 56 }), { tone: "mid" }))}</g>`);
    for (const [name, p] of Object.entries(PINS)) {
      const Fr = yAx([SX + p.x, 0, p.z]);
      out.push(`<g data-name="${name}"><path d="${G.circleOf(Fr, PF + 2.42, p.r + 1, P, 24)}" fill="#26292e" stroke="#0d0e10" stroke-width=".5"/><path d="${G.circleOf(Fr, PF + 2.43, p.r + 0.2, P, 24)}" fill="#c9a85a" stroke="#6b5114" stroke-width=".4"/><path d="${G.circleOf(Fr, PF + 2.44, p.r - 0.6, P, 20)}" fill="#3a2f18"/></g>`);
    }
    // the switch's raised surround
    out.push(`<g data-name="switch">${ISO.tinted(WHITE, ISO.wbox(P, [-44, -18], [PF, PF + 2], [-22, 22], "mid"))}</g>`);
    return out.join("");
  }
  function switchSvg(P, on, kq) {
    const th = on ? 0.16 : -0.16, c = [-31, PF + 2, -4], at = (u, w, v) => [c[0] + u, c[1] + w * Math.cos(th) + v * Math.sin(th), c[2] - w * Math.sin(th) + v * Math.cos(th)];
    const lamp = on ? ISO.tint("#ff9a8a", ["#e0402e", "#e85544", "#ef6c5c", "#f58a7c"], "#7a1810") : ISO.tint("#c9a8a4", ["#8a6a66", "#957672", "#a0827e", "#ab8e8a"], "#4a2a26");
    const glow = on ? (() => { const p = K.iso([-31, PF + 3, 15], P); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(6 * kq).toFixed(1)}" fill="#ff6a50" opacity=".35"/>`; })() : "";
    // the rocker, with a small raised mark on its "on" (upper) end
    const rocker = ISO.tinted(WHITE, ISO.box(at, P, [-9, 9], [0, 4], [-14, 14], "hi")) + `<path d="${K.pathOf([at(-3, 4.02, 9), at(3, 4.02, 9)].map((p) => K.iso(p, P)))}" stroke="#a3271b" stroke-width="${Math.max(0.6, kq * 1.2).toFixed(2)}" stroke-linecap="round"/>`;
    return `<g data-name="switch">${rocker}</g><g data-name="lamp">${ISO.tinted(lamp, S(G.disc(PF + 2, PF + 3.6, 2.6, yAx([-31, 0, 15]), P, { steps: 18 }), { tone: "hi" }))}${glow}</g>`;
  }
  ISO.add({
    name: "wallsocket", title: "Switched wall socket (part)", compare: null,
    about: "A switched wall socket plate (Indian 6 A style) 14 × 8.6 cm: three holes with brass spring contacts, the bigger earth hole on top, a switch and a red neon lamp on the left; sw=1 switches it on and lights the lamp. anchors: socket switch",
    line: "wallsocket cx cy k sw=0|1 lab=0 lit=plate|socket|switch|lamp|earth|live|neutral",
    demo: { line: "wallsocket 480 270 40 lab=1", script: [{ set: {}, hold: 1 }, { set: { sw: 1, lit: "lamp" }, hold: 1.4 }, { set: { lit: "earth" }, hold: 1.2 }, { set: { sw: 0, lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const Q = B36.cam(P, F), kq = K.cameraOf(Q).k;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -PW * F, y: 0, w: 2 * PW * F, d: 1.3, r: 0.3 }, -PZ * F, 2 * PZ * F, P)}"/>${plateSvg(Q)}<g data-part="sw"></g><g data-part="words"></g>`;
      g.anchors = { socket: [SX * F, (PF + 2.4) * F, 2 * F], switch: [-31 * F, (PF + 6) * F, -4 * F] };
      const el = B36.parts(g), w = ISO.writer(), st = { sw: o.sw === "1", lit: o.lit || "" };
      const draw = () => {
        w.rebuild(el.sw, String(st.sw), () => switchSvg(Q, st.sw, kq));
        w.rebuild(el.words, lab ? String(st.sw) : "", () => !lab ? "" : [
          ISO.word(K.iso([SX + 30, PF, 24], Q), "earth: bigger hole", "#2c6a22", { size: 13, anchor: "start" }),
          ISO.word(K.iso([SX + 9.5, PF, -12], Q), "live", "#a3271b", { size: 13, dy: 14 }),
          ISO.word(K.iso([SX - 9.5, PF, -12], Q), "neutral", "#1f4f8f", { size: 13, anchor: "end", dy: 14 }),
          ISO.word(K.iso([-31, PF, 26], Q), st.sw ? "switch on: lamp lit" : "switch off", st.sw ? "#a3271b" : "#444", { size: 13, dy: -4 }),
        ].join(""));
        B36.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.sw !== undefined) st.sw = String(p.sw) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => (st.sw ? "socket switched on · 230 V between live and neutral, the red lamp lit" : "socket off · the switch breaks the live wire");
      draw();
      return g;
    },
  });
})();
