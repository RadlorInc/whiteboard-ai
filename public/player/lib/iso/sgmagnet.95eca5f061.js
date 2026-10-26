// "sgmagnet cx cy k field=0|1 lab=0 lit=yoke|coil|sharp|groove|field" — a PART (PARTS.md, batch 5): the magnet of
// sterngerlach.js. A soft-iron C yoke (back limb, top and bottom arms) with a copper coil wound on its back limb;
// on the top arm a knife-edge pole (N, red) points down at a grooved pole (S, blue) on the bottom arm, 0.8 cm apart.
// The field between them is far stronger near the sharp edge than at the groove, so it is uneven (it has a gradient):
// that pushes each atom's tiny magnet up or down. field=1 (current in the coil) shows the field lines on the near end,
// crowded at the sharp edge and spreading to the groove's lips; set({ field }) fades them in or out.
// 10 × 6 × 10 cm, the beam runs along x through the gap, 5 cm over the surface (as atomoven's nozzle, glassplate's
// centre). Origin the surface under its middle. anchors: gap (its centre) in (+x end, atoms enter) out (−x end).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HX = 5, BEAM = 5, TIP = 5.4;
  const IRON = ISO.tint("#c4c7cc", ["#6f737a", "#80848b", "#92959b", "#a4a7ad"], "#2a2c30");
  const GROOVE = [[-1.6, 1.4], [1.6, 1.4], [1.6, 4.2], [0.8, 4.6], [0.45, 4.6], [0.3, 4.2], [-0.3, 4.2], [-0.45, 4.6], [-0.8, 4.6], [-1.6, 4.2]];
  const SHARP = [[-1.6, 8.6], [1.6, 8.6], [1.6, 6.6], [0, TIP], [-1.6, 6.6]];
  // the groove pole's top at y (on its end face), where a field line lands
  const grooveZ = (y) => { const a = Math.abs(y); return a <= 0.3 ? 4.2 : a <= 0.45 ? 4.2 + ((a - 0.3) / 0.15) * 0.4 : a <= 0.8 ? 4.6 : 4.6 - ((a - 0.8) / 0.8) * 0.4; };
  // the field lines on the near end face (x = HX): from the knife edge down, fanning out to the groove's lips
  function fieldSvg(P, kS) {
    const x = HX + 0.02, d = [];
    for (const y of [-1.35, -0.95, -0.62, 0, 0.62, 0.95, 1.35]) {
      const pts = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12, yy = y * (t * t * 0.55 + t * 0.45), z = TIP + (grooveZ(y) - TIP) * t; pts.push(K.iso([x, yy, z], P)); }
      d.push(K.pathOf(pts));
    }
    return `<path d="${d.join("")}" fill="none" stroke="#6a3fa8" stroke-width="${Math.max(0.7, kS * 0.05).toFixed(2)}" stroke-linecap="round" data-free=""/>`;
  }
  const poleText = (P, z, t, c) => window.LAB.faceText(P, [HX + 0.03, -1.0, z], [0, -1, 0], t, 0.9, c);

  ISO.add({
    name: "sgmagnet", title: "Stern–Gerlach magnet (part)", compare: null,
    about: "The Stern–Gerlach magnet: an iron C yoke with a coil, a knife-edge pole over a grooved pole; with the current on, the field in the gap is much stronger at the sharp edge, so it pushes each silver atom up or down by its spin. anchors: gap in out",
    line: "sgmagnet cx cy k field=0|1 lab=0 lit=yoke|coil|sharp|groove|field",
    demo: { line: "sgmagnet 480 420 30 field=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { field: 1, lit: "field" }, hold: "settle" }, { set: { lit: "sharp" }, hold: 1.2 }, { set: { lit: "groove" }, hold: 1.2 }, { set: { field: 0, lit: "coil" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kS = G.scaleOf(P), B29 = window.B29;
      const st = { f: o.field === "1" ? 1 : 0 }, want = { f: st.f };
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 0.6, y: -3.7, w: 2 * HX + 1.2, d: 6.2, r: 0.4 }, 0, 0.2, P)}"/>`;
      const wind = [3.3, 3.75, 4.2, 4.65, 5.1, 5.55, 6.0, 6.45].map((z) => K.pathOf([[-HX - 0.6, -1.09, z], [HX + 0.61, -1.09, z], [HX + 0.61, -3.7, z]].map((p) => K.iso(p, P)))).join("");
      const coil = ISO.tinted(ISO.T.copper, ISO.wbox(P, [-HX - 0.6, HX + 0.6], [-3.7, -1.1], [3, 7], "mid")) + `<path d="${wind}" fill="none" stroke="#6e3a1c" stroke-width="0.6" opacity=".7"/>` +
        ISO.tinted(ISO.T.copper, [-3.4, -2.6].map((y) => S(K.cylinder(HX - 1.2, y, 0.16, 7, 1.3, P, 8), { tone: "mid", crease: "none" })).join(""));
      const groove = ISO.tinted(ISO.T.blue, ISO.prismX(P, GROOVE, -HX, HX, ["#5d80b8", "#bacde8"], "#91afd8", "#1f4f8f")) + poleText(P, 2.4, "S", "#1f4f8f");
      const sharp = ISO.tinted(ISO.T.red, ISO.prismX(P, SHARP, -HX, HX, ["#c05a4e", "#f4b8ae"], "#e88e82", "#8a1d16")) + poleText(P, 7.2, "N", "#8a1d16");
      // painted back to front, bottom to top: back limb, bottom arm, coil, groove pole, field, sharp pole, top arm
      g.innerHTML = halo + `<g data-name="yoke" style="${IRON}">${ISO.wbox(P, [-HX, HX], [-3, -1.8], [1.4, 8.6], "mid")}${ISO.wbox(P, [-HX, HX], [-3, 2.5], [0, 1.4], "mid")}</g>` +
        `<g data-name="coil">${coil}</g><g data-name="groove">${groove}</g><g data-name="field" data-part="field">${fieldSvg(P, kS)}</g><g data-name="sharp">${sharp}</g>` +
        `<g data-name="yoke" style="${IRON}">${ISO.wbox(P, [-HX, HX], [-3, 2.5], [8.6, 10], "mid")}</g>` +
        `<g data-part="words">${lab ? ISO.word(K.iso([HX, 2.5, 10.4], P), "magnet", "#555", { size: 13, anchor: "start", dy: -4 }) + ISO.word(K.iso([HX + 0.6, -3.7, BEAM], P), "uneven field", "#6a3fa8", { size: 13, anchor: "start", dy: 4 }) : ""}</g>`;
      g.anchors = { gap: [0, 0, BEAM], in: [HX, 0, BEAM], out: [-HX, 0, BEAM] };
      const el = window.LAB.parts(g);
      let lit = o.lit || "";
      const draw = () => { w.attr(el.field, "opacity", st.f.toFixed(2)); w.shown(el.field, st.f > 0.01); B29.light(w, g, lit); };
      g.set = (p) => {
        if (p.field !== undefined) want.f = +p.field ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.f = ISO.follow(st.f, want.f, dt, 0.35, ISO.still()); draw(); return st.f !== want.f; };
      g.readout = () => (want.f ? "magnet on · the field is strongest at the sharp pole, so it is uneven: each silver atom is pushed up or down by its spin, never in between" : "magnet off · no current in the coil, no field: the atoms fly straight through the gap");
      draw();
      return g;
    },
  });
})();
