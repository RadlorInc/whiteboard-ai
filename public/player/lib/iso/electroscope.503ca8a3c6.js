// "electroscope cx cy k spread=0..1 marks=0|1 lab=0 lit=case|cap|rod|plug|leaves|earth" — a PART (PARTS.md, batch 5):
// a school gold-leaf electroscope, as static.js draws it, at its real size (10 × 12 cm base, 20 cm to the cap). A
// wooden base; a glass-sided case in a metal frame with a printed angle scale on its back pane; a white insulating
// plug in the lid; the brass rod through it with the cap disc on top and, inside, its foot plate with two gold leaves;
// an earth wire from the frame to a terminal on the base. Origin: the bench point under the case's middle.
// spread 0 → 1 opens the leaves (0 = hanging together, 1 = about 85° apart); set({ spread }) eases them (charge
// on the cap pushes them apart, earthing lets them fall). marks=1 prints "−" on the leaves while they are apart.
// Built in mm; anchors in cm: cap (the cap's top middle), rim (its +x edge, where a rod touches), earth.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const C = { x: 40, y: 40, z0: 14, z1: 150 }, LID = 156, PLUG = 166, CAPZ = 190, CAPR = 22, FOOT = 90, LEAF = 45;
  const FRAME = ISO.T.steel, PTFE = ISO.tint("#fbfbf8", ["#cfcfc8", "#dcdcd6", "#e8e8e3", "#f2f2ee"], "#77776f");
  const GOLD = ["#e8c44a", "#8a6a10"];

  ISO.add({
    name: "electroscope", title: "Gold-leaf electroscope (part)", compare: null,
    about: "A gold-leaf electroscope: glass case, brass cap and rod through an insulating plug, two gold leaves that spread when it is charged and fall when it is earthed, and an earth wire. anchors: cap rim earth",
    line: "electroscope cx cy k spread=0..1 marks=0|1 lab=0 lit=case|cap|rod|plug|leaves|earth",
    demo: { line: "electroscope 480 440 17 marks=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { spread: 0.8, lit: "leaves" }, hold: "settle" }, { set: { spread: 0.3, lit: "cap" }, hold: "settle" }, { set: { spread: 0, lit: "earth" }, hold: "settle" }, { set: { lit: "plug" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", marks = o.marks === "1";
      const st = { s: ISO.clamp(ISO.num(o, "spread", 0), 0, 1) }, want = { s: st.s };
      let lit = o.lit || "";
      const pane = (pts, fill, op) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, Pm)), true)}" fill="${fill}" fill-opacity="${op}" stroke="#5d7f96" stroke-width="0.5"/>`;
      const post = (x, y) => ISO.tinted(FRAME, ISO.wbox(Pm, [x - 1.6, x + 1.6], [y - 1.6, y + 1.6], [C.z0, C.z1], "mid"));
      const { x: X, y: Y, z0, z1 } = C;
      // the angle scale printed on the back pane: an arc round the leaves' hinge, a tick every 10°, longer every 30°
      const scale = () => {
        const yb = -Y + 0.3, at = (a, r) => K.iso([Math.sin(a) * r, yb, FOOT - Math.cos(a) * r], Pm), arc = [], ticks = [];
        for (let d = -60; d <= 60; d += 2) arc.push(at((d * Math.PI) / 180, 40));
        for (let d = -60; d <= 60; d += 10) ticks.push(K.pathOf([at((d * Math.PI) / 180, 40), at((d * Math.PI) / 180, d % 30 ? 37 : 35)]));
        return `<path d="${K.pathOf(arc)}${ticks.join("")}" fill="none" stroke="#5d6f80" stroke-width="0.6" data-free=""/>`;
      };
      // base, the case's plinth, its far corner post, back panes and the scale, the side posts
      const back = [
        `<path class="iso-halo" d="${K.haloOf({ x: -50, y: -50, w: 100, d: 120, r: 4 }, 0, 10, Pm)}"/>`,
        `<g data-name="case">${ISO.tinted(ISO.T.wood, S(K.slabOf({ x: -50, y: -50, w: 100, d: 120, r: 4 }, 0, 10, Pm, 3, 1), { tone: "mid" }))}`,
        ISO.tinted(FRAME, ISO.wbox(Pm, [-X - 2, X + 2], [-Y - 2, Y + 2], [10, z0], "mid")),
        post(-X, -Y),
        pane([[-X, -Y, z0], [X, -Y, z0], [X, -Y, z1], [-X, -Y, z1]], "#eef6fb", 0.85), pane([[-X, -Y, z0], [-X, Y, z0], [-X, Y, z1], [-X, -Y, z1]], "#e7f1f8", 0.85), scale(),
        post(X, -Y), post(-X, Y), `</g>`,
        // the earth terminal on the base, in front of the case
        `<g data-name="earth">${ISO.tinted(ISO.T.brass, S(K.cylinder(30, 58, 3.2, 10, 3, Pm, 20), { tone: "mid" }) + S(K.cylinder(30, 58, 1.4, 13, 5, Pm, 14), { tone: "hi" }) + S(K.cylinder(30, 58, 2.8, 16, 2.4, Pm, 6), { tone: "mid" }))}</g>`,
        // the rod inside the case and its foot plate (the leaves hang from its two sides)
        `<g data-name="rod">${ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 1.5, FOOT + 4, z1 - FOOT - 4, Pm, 14), { tone: "hi", crease: "none" }) + ISO.wbox(Pm, [-2.4, 2.4], [-1, 1], [FOOT - 2, FOOT + 6], "hi"))}</g>`,
      ].join("");
      const front = [
        `<g data-name="case">`, pane([[X, -Y, z0], [X, Y, z0], [X, Y, z1], [X, -Y, z1]], "#cfe2f2", 0.16), pane([[-X, Y, z0], [X, Y, z0], [X, Y, z1], [-X, Y, z1]], "#cfe2f2", 0.18), post(X, Y),
        ISO.tinted(FRAME, ISO.wbox(Pm, [-X - 2, X + 2], [-Y - 2, Y + 2], [z1, LID], "mid")), `</g>`,
        `<g data-name="earth"><path d="${K.pathOf([[X + 1.6, Y - 1, 20], [X - 2, Y + 8, 12], [30, 58, 18.4]].map((p) => K.iso(p, Pm)))}" fill="none" stroke="#2c9a3a" stroke-width="${Math.max(0.8, G.scaleOf(Pm) * 1.2).toFixed(2)}" stroke-linecap="round"/></g>`,
        `<g data-name="plug">${ISO.tinted(PTFE, S(K.cylinder(0, 0, 9, LID, PLUG - LID, Pm, 28, 0.8), { tone: "hi" }))}</g>`,
        `<g data-name="rod">${ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 1.5, PLUG, CAPZ - PLUG, Pm, 14), { tone: "hi", crease: "none" }))}</g>`,
        `<g data-name="cap">${ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, CAPR, CAPZ, 3.5, Pm, 48, 0.8), { tone: "hi" }) + S(K.cylinder(0, 0, 3, CAPZ + 3.5, 1.5, Pm, 16, 0.4), { tone: "mid" }))}</g>`,
      ].join("");
      g.innerHTML = back + `<g data-name="leaves" data-part="leaves"></g>` + front + `<g data-part="words"></g>`;
      g.anchors = { cap: [0, 0, (CAPZ + 5) / 10], rim: [CAPR / 10, 0, (CAPZ + 1.75) / 10], earth: [3, 5.8, 1.84] };
      const el = LAB.parts(g), w = ISO.writer();
      const angle = (s) => 0.05 + 0.69 * s;
      const leaves = (a, s) => {
        const out = [];
        for (const side of [-1, 1]) {
          const tip = [side * (2.4 + Math.sin(a) * LEAF), 0, FOOT - Math.cos(a) * LEAF], wd = [Math.cos(a) * 5 * side, 0, Math.sin(a) * 5];
          const pts = [[side * 2.4, 0, FOOT + 4], [side * 2.4 + wd[0] * 0.3, 0, FOOT + 4 + wd[2] * 0.3], [tip[0] + wd[0], 0, tip[2] + wd[2]], [tip[0], 0, tip[2]]];
          out.push(`<path d="${K.pathOf(pts.map((p) => K.iso(p, Pm)), true)}" fill="${GOLD[0]}" stroke="${GOLD[1]}" stroke-width="0.5"/>`);
          if (marks && s > 0.2) out.push(ISO.word(K.iso([side * (2.4 + Math.sin(a) * LEAF * 0.6 + 9), 0, FOOT - Math.cos(a) * LEAF * 0.6], Pm), "−", "#1f4f8f", { size: Math.max(10, G.scaleOf(Pm) * 9), halo: false }));
        }
        return out.join("");
      };
      const draw = () => {
        const q = Math.round(st.s * 200) / 200;
        w.rebuild(el.leaves, String(q), () => leaves(angle(q), q));
        if (lab) w.rebuild(el.words, "w", () => LAB.word(Pm, lab, [0, 0, CAPZ + 14], "brass cap", "#6b5114") + LAB.word(Pm, lab, [X + 2, Y, FOOT - 20], "gold leaves", "#8a6a10", { anchor: "start" }) + LAB.word(Pm, lab, [30, 58, 0], "earth", "#2c6a22", { dy: 16 }) + LAB.word(Pm, lab, [X + 2, 0, LID + 4], "insulating plug", "#556", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.spread !== undefined && Number.isFinite(+p.spread)) want.s = ISO.clamp(+p.spread, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.s = ISO.follow(st.s, want.s, dt, 0.3, ISO.still()); draw(); return st.s !== want.s; };
      g.readout = () => `gold-leaf electroscope · leaves ${Math.round((angle(st.s) * 2 * 180) / Math.PI)}° apart · ${st.s > 0.15 ? "charged: the leaves carry the same charge and repel" : "uncharged: the leaves hang together"}`;
      draw();
      return g;
    },
  });
})();
