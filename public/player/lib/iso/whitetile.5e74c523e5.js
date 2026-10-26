// "whitetile cx cy k w=4..30 d=4..30 lab=0 lit=tile" — a PART (PARTS.md): a white glazed ceramic tile laid flat on the
// bench under a flask or a test tube so a colour change shows (burette, titration, indicator, precipitate, dissolve).
// Origin the bench point under its middle. Default 11.6 × 10.4 cm, 0.3 cm thick (as burette.js), 4 × 4 under a tube, 20 × 12
// under a dissolving beaker. The glaze rounds over the top edge (a thin bevel band), the buff clay body shows on the cut
// sides, and a faint sheen lies across the glaze. Built in mm.
(() => {
  const K = window.K;
  const GLAZE = ISO.tint("#ffffff", ["#d9dcdf", "#e3e6e8", "#eceef0", "#f5f6f7"], "#7c8389");
  const BODY = ISO.tint("#efe6d8", ["#cdbfa8", "#d8ccb7", "#e2d7c5", "#ebe2d3"], "#7c8389");
  const H = 3;   // mm

  ISO.add({
    name: "whitetile", title: "White tile (part)", compare: null,
    about: "A white glazed tile laid on the bench under a flask or a test tube so a colour change shows clearly; w × d in cm (11.6 × 10.4 by default). anchors: top",
    line: "whitetile cx cy k w=4..30 d=4..30 lab=0 lit=tile",
    demo: { line: "whitetile 480 300 40", script: [{ set: {}, hold: 1 }, { set: { lit: "tile" }, hold: 1.5 }, { set: { lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const W = ISO.clamp(ISO.num(o, "w", 11.6), 4, 30) * 10, D = ISO.clamp(ISO.num(o, "d", 10.4), 4, 30) * 10;
      const plan = { x: -W / 2, y: -D / 2, w: W, d: D, r: 2.5 }, inset = { x: -W / 2 + 1.6, y: -D / 2 + 1.6, w: W - 3.2, d: D - 3.2, r: 1.5 };
      // the clay body (its cut sides buff), the glaze on top as a slightly smaller slab whose edge rounds over it
      const sheen = [[0.18, 0.12], [0.62, 0.55]].map(([a, b]) => K.pathOf([[plan.x + W * a, plan.y + D * 0.2, H + 0.05], [plan.x + W * b, plan.y + D * 0.82, H + 0.05], [plan.x + W * (b + 0.08), plan.y + D * 0.82, H + 0.05], [plan.x + W * (a + 0.08), plan.y + D * 0.2, H + 0.05]].map((p) => K.iso(p, Pm)), true)).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, H, Pm)}"/><g data-name="tile">` +
        ISO.tinted(BODY, S(K.slabOf(plan, 0, H - 0.8, Pm, 3, 0.4), { tone: "lo" })) +
        ISO.tinted(GLAZE, S(K.slabOf(plan, H - 0.8, 0.8, Pm, 3, 0.6), { tone: "lo", crease: "none" }) + S(K.slabOf(inset, H - 0.01, 0.01, Pm, 3, 0.3), { tone: "faint", crease: "none" })) +
        `<path d="${sheen}" fill="#ffffff" opacity=".7"/></g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [W / 2, D / 2, 0], "white tile", "#556", { anchor: "start", dy: 14 });
      g.anchors = { top: [0, 0, H / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `white glazed tile ${W / 10} × ${D / 10} cm, ${H / 10} cm thick · a colour change shows clearly against it`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
