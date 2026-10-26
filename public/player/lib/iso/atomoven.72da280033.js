// "atomoven cx cy k lab=0 lit=oven|nozzle|stand|terminals" — a PART (PARTS.md, batch 5): the silver oven of
// sterngerlach.js. A 5 cm copper furnace block wound with a heater wire (its turns wrap the corner), a bolted lid with
// two ceramic feedthrough terminals for the heater current, a stamped label, and on its −x face a 2.5 cm nozzle tube the
// silver atoms stream out of (about 1000 °C inside; the beam travels toward −x, as light does on a bench). It sits on
// a ceramic pedestal on a steel foot plate, so the nozzle is 5 cm over the surface: the same height as the sgmagnet's
// gap and the glassplate's centre, all on one rail (the vacuumtube's `floor`). Origin the surface under its middle.
// Static. anchors: nozzle (the jet's mouth, beam start) top. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const B = 2.5, Z0 = 2.5, Z1 = 7.5, BEAM = 5;
  const CERAMIC = ISO.tint("#f4f1ea", ["#c9c3b5", "#d6d1c4", "#e2ded3", "#ece9e1"], "#6d675a");

  ISO.add({
    name: "atomoven", title: "Silver atom oven (part)", compare: null,
    about: "A small electric furnace: a 5 cm copper block wound with a heater wire, two terminals on its lid, on a ceramic pedestal; silver boils inside and a beam of atoms leaves its nozzle toward −x, 5 cm above the surface. anchors: nozzle top",
    line: "atomoven cx cy k lab=0 lit=oven|nozzle|stand|terminals",
    demo: { line: "atomoven 480 400 38 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "nozzle" }, hold: 1.4 }, { set: { lit: "terminals" }, hold: 1.2 }, { set: { lit: "stand" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kS = G.scaleOf(P), B29 = window.B29;
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -2.2, y: -2.2, w: 4.4, d: 4.4, r: 0.4 }, 0, 0.2, P)}"/>`;
      // the stand: foot plate with four screws, ceramic pedestal with a collar
      const stand = ISO.tinted(ISO.T.steel, ISO.wbox(P, [-2.2, 2.2], [-2.2, 2.2], [0, 0.35], "mid") + D([[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]].map(([x, y]) => K.iso([x, y, 0.35], P)), { size: 0.5 })) +
        ISO.tinted(CERAMIC, S(K.cylinder(0, 0, 0.95, 0.35, Z0 - 0.35 - 0.3, P, 24), { tone: "hi", inner: L(K.sideArc(0, 0, 0.95, 1.1, P, 18) + K.sideArc(0, 0, 0.95, 1.6, P, 18), { tone: "faint" }) })) +
        ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.4, Z0 - 0.3, 0.3, P, 24), { tone: "mid" }));
      // the nozzle on the −x face (far side): a short tube with a fine bore, and its flange
      const F = G.frameAlong([-B, 0, BEAM], [-1, 0, 0]);
      const nozzle = ISO.tinted(ISO.T.copper, S(G.disc(0, 0.25, 0.8, F, P), { tone: "mid" }) + S(G.solidOf([[0.25, 0.42], [0.6, 0.3, 1], [2.3, 0.3, 1], [2.5, 0.22]], F, P), { tone: "hi" })) +
        D([K.iso(G.pointOf(F, 2.51, 0, 0), P)], { size: 0.45 });
      // the furnace block; the heater wire's turns round its visible faces, wrapping the +x/+y corner; the lid
      const wire = [3.3, 3.9, 4.5, 5.1, 5.7, 6.3].map((z) => K.pathOf([[-B, B + 0.01, z], [B + 0.01, B + 0.01, z], [B + 0.01, -B, z]].map((p) => K.iso(p, P)))).join("");
      const body = ISO.tinted(ISO.T.copper, ISO.wbox(P, [-B, B], [-B, B], [Z0, Z1 - 0.5], "mid")) +
        `<path d="${wire}" fill="none" stroke="#4d3a2a" stroke-width="${Math.max(0.8, kS * 0.09).toFixed(2)}"/>` +
        `<path d="${K.pathOf([[-B, B + 0.02, 3], [B + 0.02, B + 0.02, 3], [B + 0.02, -B, 3]].map((p) => K.iso(p, P)))}${K.pathOf([[-B, B + 0.02, 6.6], [B + 0.02, B + 0.02, 6.6], [B + 0.02, -B, 6.6]].map((p) => K.iso(p, P)))}" fill="none" stroke="#6e3a1c" stroke-width="0.6"/>`;
      const lid = ISO.tinted(ISO.T.copper, ISO.wbox(P, [-B - 0.15, B + 0.15], [-B - 0.15, B + 0.15], [Z1 - 0.5, Z1], "hi")) +
        ISO.tinted(ISO.T.steel, [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]].map(([x, y]) => S(K.cylinder(x, y, 0.28, Z1, 0.18, P, 6), { tone: "mid" })).join(""));
      // two feedthroughs: a ceramic insulator, a brass post, a nut
      const term = (x) => ISO.tinted(CERAMIC, S(K.cylinder(x, -0.6, 0.45, Z1, 0.7, P, 16), { tone: "hi" })) + ISO.tinted(ISO.T.brass, S(K.cylinder(x, -0.6, 0.14, Z1 + 0.7, 0.55, P, 10), { tone: "hi", crease: "none" }) + S(K.cylinder(x, -0.6, 0.3, Z1 + 0.85, 0.2, P, 6), { tone: "mid" }));
      const label = ISO.tinted(ISO.T.steel, ISO.prismY(P, [[-1.6, 3.7], [1.6, 3.7], [1.6, 5.3], [-1.6, 5.3]], B, B + 0.06, ["#8d9096", "#c7c9cd"], "#eef0f2", "#3c3f45")) +
        window.LAB.faceText(P, [0, B + 0.07, 4.65], [1, 0, 0], "Ag", 0.75, "#33363b") + window.LAB.faceText(P, [0, B + 0.07, 3.98], [1, 0, 0], "1000 °C", 0.42, "#55585e");
      g.innerHTML = halo + `<g data-name="stand">${stand}</g><g data-name="nozzle">${nozzle}</g><g data-name="oven">${body}${lid}${label}</g><g data-name="terminals">${term(-0.9)}${term(0.9)}</g>` +
        `<g data-part="words">${lab ? ISO.word(K.iso([-B - 2.5, 0, BEAM], P), "nozzle", "#6e3a1c", { size: 13, anchor: "end", dy: -8 }) + ISO.word(K.iso([B, B, Z1 + 1.4], P), "silver oven", "#555", { size: 13, anchor: "start", dy: -4 }) : ""}</g>`;
      g.anchors = { nozzle: [-B - 2.5, 0, BEAM], top: [0, 0, Z1] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B29.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "silver oven · about 1000 °C: silver atoms leave the nozzle in a beam toward −x, 5 cm above the surface";
      B29.light(w, g, lit);
      return g;
    },
  });
})();
