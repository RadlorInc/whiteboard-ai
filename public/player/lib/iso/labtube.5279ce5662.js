// "labtube cx cy k aim=up|tilt fill=0..1 c=… lab=0 lit=glass|liquid" — a PART (PARTS.md): a 16 × 150 mm borosilicate
// test tube (about 20 mL to the brim), origin its round bottom. aim=up stands it upright (held by a rack or a clamp);
// aim=tilt leans it 30° toward +x, as it is held in a flame, and the liquid's surface stays level. Round bottom, 0.9 mm
// wall, a rolled lip at the mouth. fill is the fraction of its length the liquid reaches; the volume is integrated
// from the glass's own profile. Built in mm with the lab helpers; anchors in cm. set({ fill, c }).
(() => {
  const K = window.K, G = window.G;
  const LEN = 150, R = 8, TILT = (30 * Math.PI) / 180;

  ISO.add({
    name: "labtube", title: "Test tube (part)", compare: null,
    about: "A 16 mm glass test tube, 15 cm long, upright or tilted 30° as held in a flame, holding a coloured liquid; a part to place in a rack, a clamp or a holder. anchors: mouth",
    line: "labtube cx cy k aim=up|tilt fill=0..1 c=blue|red|… lab=0 lit=glass|liquid",
    demo: { line: "labtube 480 420 18 aim=tilt fill=0.2 c=green", script: [{ set: { fill: 0.4 }, hold: "settle" }, { set: { c: "orange", lit: "liquid" }, hold: "settle" }, { set: { lit: "glass" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const tilt = o.aim === "tilt", ax = tilt ? [Math.sin(TILT), 0, Math.cos(TILT)] : [0, 0, 1];
      // the meridian starts at the bottom's outside: the vessel's own origin is s = 0 there
      const V = LAB.vessel(Pm, [0, 0, 0], window.CHEM.tube(LEN, R), { base: 1, wall: 0.9, axis: tilt ? ax : null });
      const st = { f: ISO.clamp(ISO.num(o, "fill", 0.3), 0, 1), c0: o.c || "blue", c1: o.c || "blue", mixT: 1 }, want = { f: st.f };
      let lit = o.lit || "";
      const levelS = () => 1 + (LEN - 4) * st.f;
      // the tube is convex, so the hull of its rings is its true outline (the helper's outline misses the round bottom's
      // bulge once the axis leans); swapped into the helper's back and front
      const ring = [];
      for (let s = 0; s <= LEN; s += s < R ? 0.5 : LEN / 12) for (let i = 0; i < 48; i++) ring.push(K.iso(G.pointOf(V.F, s, V.rAt(s), (i / 48) * Math.PI * 2), Pm));
      const sil = K.pathOf(ISO.hullOf(ring), true), swap = (svg) => svg.split(V.sil).join(sil);
      g.innerHTML = `<g data-name="glass">${swap(V.back())}</g><g data-name="liquid" data-part="liquid"></g><g data-name="glass">${swap(V.front())}</g><g data-part="words"></g>`;
      g.anchors = { mouth: ax.map((v) => (v * LEN) / 10) };
      const el = LAB.parts(g), w = ISO.writer();
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const draw = () => {
        const s = levelS(), c = colour();
        w.rebuild(el.liquid, `${s.toFixed(2)} ${c}`, () => V.liquid(s, c));
        if (lab) w.rebuild(el.words, `${Math.round(V.vol(s))} ${st.c1}`, () => LAB.word(Pm, lab, ax.map((v) => v * (LEN + 12)), "test tube", "#556") + LAB.word(Pm, lab, V.at(Math.max(s, 10), -1.4, 6), `${V.vol(s).toFixed(1)} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.45, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.f !== want.f || st.mixT < 1;
      };
      g.readout = () => `16 × 150 mm test tube${tilt ? ", tilted 30°" : ""} · about ${V.vol(levelS()).toFixed(1)} mL of ${st.c1} liquid`;
      draw();
      return g;
    },
  });
})();
