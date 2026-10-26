// "trafficlight cx cy height k=red|redamber|green|amber lab=1 lit=head|button|pole" — a UK traffic signal at the kerb.
// A pole on a bolted base flange carries a three-aspect signal head (red, amber, green lenses, each under its visor,
// on a black backboard with a white border) and, at hand height, the pedestrian push-button box. The UK sequence is
// red → red + amber (2 s, get ready) → green (at least 7 s) → amber (3 s, stop if safe) → red. set({ k }) shows one
// aspect; the demo runs the whole cycle (shown faster).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const PAVE = { x: -60, y: -46, w: 120, d: 70, r: 3 }, H0 = 118, LZ = [H0 + 66, H0 + 40, H0 + 14], LR = 9.5, PY = -22;
  const COL = { red: ["#e5322b", "#5a1c19"], amber: ["#f2a21d", "#5c4214"], green: ["#2fb36b", "#173f2a"] };
  const ON = { red: ["red"], redamber: ["red", "amber"], green: ["green"], amber: ["amber"] };
  const SAY = { red: "red · stop (often 30 s or more)", redamber: "red and amber · get ready, do not go yet (2 s)", green: "green · go if the way is clear (at least 7 s)", amber: "amber · stop unless it is unsafe to (3 s)" };
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const BLACK = ISO.T.plastic, named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const YELLOW = ISO.tint("#ffe27a", ["#c9a21c", "#d8b22a", "#e6c23a", "#f2d24f"], "#6b5208");

  function groundSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(PAVE, -8, 8, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(PAVE, -8, 8, P, 3, 0.6), { tone: "mid" }))];
    const flags = []; for (const x of [-30, 0, 30]) flags.push(K.lineOnTop([x, PAVE.y], [x, 10], 0, P)); flags.push(K.lineOnTop([PAVE.x, -18], [PAVE.x + PAVE.w, -18], 0, P));
    out.push(L(flags.join(""), { tone: "faint" }));
    out.push(ISO.tinted(ISO.T.road, ISO.wbox(P, [-60, 60], [10, 24], [-9, 0.5], "hi")), L(K.lineOnTop([-60, 13], [60, 13], 0.5, P), { tone: "faint" }));
    // base flange with four bolts and the pole root collar
    out.push(S(K.cylinder(0, PY, 10, 0, 2, P, 40, 0.4), { tone: "mid" }), D([0, 1, 2, 3].map((i) => K.iso([Math.cos(i * Math.PI / 2 + 0.78) * 7.4, PY + Math.sin(i * Math.PI / 2 + 0.78) * 7.4, 2], P)), { size: 0.8 }));
    out.push(S(K.cylinder(0, PY, 6, 2, 8, P, 32), { tone: "mid" }));
    return out.join("");
  }
  function poleSvg(P) {
    const top = H0 + 86, out = [S(K.cylinder(0, PY, 4, 10, top - 10, P, 28), { tone: "mid", inner: L([30, 70, 110].map((z) => K.sideArc(0, PY, 4, z, P, 16)).join(""), { tone: "faint" }) })];
    out.push(S(K.cylinder(0, PY, 4.8, top, 2, P, 28), { tone: "mid" }), S(G.solidOf([[0, 4.8], [2, 4, 1], [3.4, 2.2, 1], [4, 0]], zAx([0, PY, top + 2]), P), { tone: "mid" }));
    // two brackets from the pole to the head's back
    for (const z of [H0 + 8, H0 + 74]) out.push(ISO.wbox(P, [-3, 3], [PY + 3, -13], [z - 2.5, z + 2.5], "mid"), S(K.cylinder(0, PY, 5.2, z - 3, 6, P, 28), { tone: "mid" }));
    return named("pole", out.join(""));
  }
  function headSvg(P) {
    const out = [ISO.tinted(BLACK, ISO.wbox(P, [-24, 24], [-13, -11], [H0 - 8, H0 + 88], "hi"))];
    out.push(`<path d="${K.pathOf([[-22.5, -10.95, H0 - 6.5], [22.5, -10.95, H0 - 6.5], [22.5, -10.95, H0 + 86.5], [-22.5, -10.95, H0 + 86.5]].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#f4f4f2" stroke-width="1.4"/>`);
    out.push(D([[-21, H0 - 4], [21, H0 - 4], [-21, H0 + 84], [21, H0 + 84]].map(([x, z]) => K.iso([x, -10.9, z], P)), { size: 0.6, tone: "lo" }));
    out.push(ISO.tinted(BLACK, ISO.wbox(P, [-14, 14], [-11, 9], [H0, H0 + 80], "hi")));
    out.push(D([H0 + 12, H0 + 68].map((z) => K.iso([14, -6, z], P)), { size: 0.7, tone: "lo" }), S(G.disc(-3, 0, 2.4, zAx([0, -1, H0]), P), { tone: "mid" }));
    return out.join("");
  }
  // A lens: bezel ring, the coloured glass (bright with a glow when lit), then its visor.
  function lensSvg(P, z, col, lvl) {
    const F = yAx([0, 0, z]), out = [ISO.tinted(BLACK, S(G.disc(9, 10.6, LR + 1.6, F, P), { tone: "hi" }))];
    const [hot, cold] = COL[col], c = K.iso([0, 10.7, z], P);
    out.push(`<path d="${G.circleOf(F, 10.65, LR, P)}" fill="color-mix(in srgb, ${hot} ${Math.round(lvl * 100)}%, ${cold})" stroke="#111" stroke-width="0.6"/>`);
    out.push(`<path d="${G.circleOf({ ...F, o: [-3, 0, z + 3.5] }, 10.7, 2.4, P)}" fill="#fff" opacity="${(0.15 + 0.45 * lvl).toFixed(2)}"/>`);
    if (lvl > 0.02) out.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(K.cameraOf(P).k * 22).toFixed(1)}" fill="url(#tl-${col})" opacity="${lvl.toFixed(2)}"/>`);
    const hood = [...ISO.arc(0, z, LR + 2.6, -0.25, Math.PI + 0.25, 20), ...ISO.arc(0, z, LR + 1.6, Math.PI + 0.25, -0.25, 20)];
    out.push(ISO.prismY(P, hood, 10.6, 24, ["#121316", "#4a4e55"], "#2b2e33", "#0b0c0e"));
    return out.join("");
  }
  // The pedestrian push-button box on the pole: yellow case, the black WAIT panel, a silver button.
  function buttonSvg(P, wait) {
    const out = [ISO.tinted(YELLOW, ISO.wbox(P, [-9, 9], [PY + 4, PY + 14], [44, 74], "hi"))];
    out.push(`<path d="${K.pathOf([[-6.5, PY + 14.05, 62], [6.5, PY + 14.05, 62], [6.5, PY + 14.05, 70], [-6.5, PY + 14.05, 70]].map((p) => K.iso(p, P)), true)}" fill="#1b1c1f" stroke="#000" stroke-width="0.5"/>`);
    const m = ISO.faceMatrix(P, [-5, PY + 14.1, 67.6], 1);
    out.push(`<text transform="${m}" style="font:700 4px 'Helvetica Neue',Arial,sans-serif" fill="${wait ? "#ffb02e" : "#4a3a1a"}">WAIT</text>`);
    out.push(S(G.disc(14, 15.4, 3.4, yAx([0, PY, 53]), P), { tone: "mid" }), S(G.disc(15.4, 16.6, 2.4, yAx([0, PY, 53]), P), { tone: "hi" }));
    return named("button", out.join(""));
  }
  const defs = `<defs>${Object.entries(COL).map(([k, [hot]]) => `<radialGradient id="tl-${k}"><stop offset="0" stop-color="${hot}" stop-opacity=".55"/><stop offset=".45" stop-color="${hot}" stop-opacity=".18"/><stop offset="1" stop-color="${hot}" stop-opacity="0"/></radialGradient>`).join("")}</defs>`;

  ISO.add({
    name: "trafficlight", title: "Traffic light", compare: "trafficlight 480 280 400 k=red",
    about: "A UK three-aspect traffic signal on its pole, visors over each lens, with the pedestrian push-button box: red, red and amber, green, amber, red.",
    line: "trafficlight cx cy height k=red|redamber|green|amber lab=1 lit=head|button|pole",
    demo: { line: "trafficlight 480 280 420 k=red", script: [{ set: { k: "red" }, hold: 2.4 }, { set: { k: "redamber" }, hold: 1.6 }, { set: { k: "green" }, hold: 2.6 }, { set: { k: "amber" }, hold: 2 }, { set: { k: "red" }, hold: 1.5 }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.2, H = size;
      const { P, g } = ISO.frame([...K.boxCorners(PAVE, -8, 0), [0, PY, H0 + 92], [-24, -12, H0 + 88], [24, 24, H0 + 70]], cx, cy, W, H, { azimuth: 64, elevation: 16 }, parent);
      const st = { k: ON[o.k] ? o.k : "red", lv: { red: 0, amber: 0, green: 0 } };
      for (const c of ON[st.k]) st.lv[c] = 1;
      g.innerHTML = defs + `<g>${groundSvg(P)}</g><g>${poleSvg(P)}</g><g data-part="button"></g><g data-name="head">${headSvg(P)}<g data-part="red"></g><g data-part="amber"></g><g data-part="green"></g></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "";
      const draw = () => {
        ["red", "amber", "green"].forEach((c, i) => w.rebuild(el[c], st.lv[c].toFixed(2), () => lensSvg(P, LZ[i], c, st.lv[c])));
        w.rebuild(el.button, String(st.k === "red" || st.k === "redamber"), () => buttonSvg(P, st.k === "green" || st.k === "amber"));
        w.rebuild(el.words, st.k, () => !lab ? "" : ISO.word(K.iso([24, 10, LZ[ON[st.k].length > 1 ? 1 : ["red", "amber", "green"].indexOf(ON[st.k][0])]], P), ON[st.k].map((c) => c).join(" + "), COL[ON[st.k][ON[st.k].length - 1]][0], { size: 16, anchor: "start", dy: 5 }) +
          ISO.word(K.iso([9, PY + 14, 50], P), "push button", "#555", { size: 13, anchor: "start" }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.k && ON[p.k]) st.k = p.k; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        let moving = false;
        for (const c of ["red", "amber", "green"]) { const want = ON[st.k].includes(c) ? 1 : 0; st.lv[c] = ISO.follow(st.lv[c], want, dt, 0.07, ISO.still()); if (st.lv[c] !== want) moving = true; }
        draw();
        return moving;
      };
      g.readout = () => `${SAY[st.k]} · UK order: red → red + amber → green → amber → red`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
