// "slideswitch cx cy k pos=a|b lab=0 lit=body|knob|pins" — a PART (PARTS.md, batch 5): the small slide switch of
// rccircuit.js (charge / discharge), standing on a breadboard or the bench, its origin the surface point under its
// middle. A single-pole changeover (SPDT) switch 12 × 5 × 6 mm: three pins at 2.54 mm on shoulders, a black plastic
// base, a folded steel cover with its end tabs crimped under the base, and a ridged knob riding in the cover's slot.
// pos=a slides the knob toward −x and joins the middle pin (com) to pin a; pos=b joins com to b. set({ pos }) slides
// it over, eased. Anchors (cm): a com b, the pins' feet on the surface. Built in mm (ISO.mm).
(() => {
  const K = window.K, HX = 6, HY = 2.5, Z0 = 0.8, ZB = 1.8, ZT = 4.2, ZK = 6, TRAVEL = 1.5;

  ISO.add({
    name: "slideswitch", title: "Slide switch (part)", compare: null,
    about: "A small slide switch (single-pole changeover) with three pins: sliding the knob joins the middle pin to the pin on that side; on a breadboard it picks charge or discharge. anchors: a com b",
    line: "slideswitch cx cy k pos=a|b lab=0 lit=body|knob|pins",
    demo: { line: "slideswitch 480 330 60 pos=a lab=1", script: [{ set: {}, hold: 1 }, { set: { pos: "b", lit: "knob" }, hold: "settle" }, { set: { pos: "a", lit: "pins" }, hold: "settle" }, { set: { lit: "body" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { pos: o.pos === "b" ? "b" : "a" };
      st.f = st.pos === "b" ? 1 : 0; st.fT = st.f;
      let lit = o.lit || "";
      const top = (x, y, z = ZT + 0.02) => K.iso([x, y, z], Pm);
      // the pins on their shoulders, then the base, then the cover with the slot and the end tabs
      const pins = ISO.tinted(ISO.T.steel, [-2.54, 0, 2.54].map((x) => S(K.cylinder(x, 0, 0.35, 0, Z0, Pm, 12), { tone: "mid" }) + ISO.wbox(Pm, [x - 0.6, x + 0.6], [-0.3, 0.3], [Z0 - 0.25, Z0], "mid")).join(""));
      const base = ISO.tinted(ISO.T.plastic, ISO.wbox(Pm, [-HX + 0.3, HX - 0.3], [-HY + 0.2, HY - 0.2], [Z0, ZB], "mid"));
      const cover = ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.3 }, ZB, ZT - ZB, Pm, 2, 0.25), { tone: "hi" }));
      const tabs = ISO.tinted(ISO.T.steel, [-1, 1].map((s) => ISO.wbox(Pm, s < 0 ? [-HX - 0.2, -HX] : [HX, HX + 0.2], [-1.1, 1.1], [Z0 + 0.1, ZB + 0.6], "lo")).join(""));
      const slot = `<path d="${K.pathOf([top(-3.4, -1.2), top(3.4, -1.2), top(3.4, 1.2), top(-3.4, 1.2)], true)}" fill="#1c1e22" stroke="#0d0e10" stroke-width="0.4"/>`;
      // two rivet dimples on the cover's top, either side of the slot
      const dimples = LAB.D([top(-4.9, 0), top(4.9, 0)], { size: Math.max(0.4, 0.25 * window.G.scaleOf(Pm)), tone: "lo" });
      // the knob: a block standing in the slot, its top ridged across (each ridge from edge to edge)
      const knob = (f) => {
        const x = -TRAVEL + 2 * TRAVEL * f, out = [ISO.tinted(ISO.T.plastic, ISO.wbox(Pm, [x - 1.4, x + 1.4], [-1.1, 1.1], [ZT - 0.6, ZK], "mid"))];
        out.push(`<path d="${[-0.8, 0, 0.8].map((d) => K.pathOf([K.iso([x + d, -1.1, ZK + 0.02], Pm), K.iso([x + d, 1.1, ZK + 0.02], Pm)])).join("")}" stroke="#55575c" stroke-width="0.5"/>`);
        return out.join("");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.3 }, 0, ZT, Pm)}"/>` +
        `<g data-name="pins">${pins}</g><g data-name="body">${base}${tabs}${cover}${slot}${dimples}</g><g data-name="knob" data-part="knob"></g><g data-part="words"></g>`;
      g.anchors = { a: [-0.254, 0, 0], com: [0, 0, 0], b: [0.254, 0, 0] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.knob, st.f.toFixed(3), () => knob(st.f));
        if (lab) w.rebuild(el.words, "1", () => LAB.word(Pm, lab, [-HX, 0, 0], "a", "#556", { dy: 14 }) + LAB.word(Pm, lab, [HX, 0, 0], "b", "#556", { dy: 14 }) + LAB.word(Pm, lab, [0, 0, ZK + 3], "slide switch", "#556"));
        window.B26.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.pos === "a" || p.pos === "b") { st.pos = p.pos; st.fT = p.pos === "b" ? 1 : 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.f = ISO.follow(st.f, st.fT, dt, 0.06, ISO.still()); draw(); return st.f !== st.fT; };
      g.readout = () => `slide switch · knob at ${st.pos} · the middle pin (com) is joined to pin ${st.pos}`;
      draw();
      return g;
    },
  });
})();
