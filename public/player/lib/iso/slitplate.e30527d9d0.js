// "slitplate cx cy k gap=0.1..5 slit=v|h lab=0 lit=plate|foot" — a PART (PARTS.md, batch 5): a slit plate that
// narrows a beam (of light, α particles or atoms) travelling along x: a blackened steel plate 0.5 cm thick, 5 cm
// wide and 6 cm tall, standing in a slotted steel foot held by two thumb screws; origin the bench point under its
// middle. The slit, gap mm wide and 3 cm long, is cut through the plate's middle with its centre 3.6 cm up: upright
// (slit=v, as for single-slit light) or across (slit=h, as the Stern–Gerlach beam slits); its width is engraved below
// it. `slit` = the slit's centre, where the beam passes. Static. goldfoil.js's and sterngerlach.js's slit plates.
// Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const TX = 2.5, HY = 25, Z0 = 8, Z1 = 60, ZS = 36, SL = 15;
  const BLACK = ISO.tint("#5a5f66", ["#2b2e33", "#34383d", "#3e4248", "#484c52"], "#121417");

  function plateSvg(P, gap, slit) {
    // one solid plate; the slit is drawn on its beam-side face (seen at this angle, the through-cut would hide in its own jaws)
    const g = gap / 2, parts = [ISO.wbox(P, [-TX, TX], [-HY, HY], [Z0, Z1], "mid")];
    // the slit's mouth on the beam side: light showing through, a bright edge on each jaw
    const [y0, y1, z0, z1] = slit === "v" ? [-g, g, ZS - SL, ZS + SL] : [-SL, SL, ZS - g, ZS + g], at = (y, z) => K.iso([TX + 0.05, y, z], P);
    const mouth = `<path d="${K.pathOf([at(y0, z0), at(y1, z0), at(y1, z1), at(y0, z1)], true)}" fill="#eef3f7" stroke="#9aa3ad" stroke-width="${(G.scaleOf(P) * 0.35).toFixed(2)}" stroke-linejoin="round"/>`;
    return ISO.tinted(BLACK, parts.join("")) + mouth;
  }
  // the slotted foot, its rubber pads and the two thumb screws in its +x face
  function footSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -14, y: -32, w: 28, d: 64, r: 2 }, 0, 2, P)}"/>`];
    for (const y of [-26, 26]) out.push(ISO.tinted(ISO.T.rubber, ISO.wbox(P, [-12, 12], [y - 3, y + 3], [0, 1.2], "lo")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-12, -TX], [-30, 30], [1.2, 12], "mid") + ISO.wbox(P, [-TX, TX], [-30, 30], [1.2, Z0], "mid")));
    return out.join("");
  }
  // the foot's near jaw (in front of the plate) with its screws
  function footFront(P) {
    const out = [ISO.tinted(ISO.T.steel, ISO.wbox(P, [TX, 12], [-30, 30], [1.2, 12], "mid"))];
    for (const y of [-16, 16]) {
      const F = G.frameOf([12, y, 6.6], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 2, 1.6, F, P), { tone: "mid" }) + S(G.disc(2, 5, 3.6, F, P), { tone: "hi" }) + K.lineSvg(G.ribsOf(F, 2, 5, 3.6, 12, P, { seams: true }), { tone: "lo" })));
    }
    return out.join("");
  }

  ISO.add({
    name: "slitplate", title: "Slit plate (part)", compare: null,
    about: "A blackened steel plate 5 × 6 cm in a slotted foot with a narrow slit (gap mm wide, upright or across) through its middle, to narrow a beam travelling along x. anchors: slit",
    line: "slitplate cx cy k gap=0.1..5 slit=v|h lab=0 lit=plate|foot",
    demo: { line: "slitplate 480 430 52 gap=1 slit=v", script: [{ set: {}, hold: 1 }, { set: { lit: "plate" }, hold: 1.2 }, { set: { lit: "foot" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const gap = ISO.clamp(ISO.num(o, "gap", 0.5), 0.1, 5), slit = o.slit === "h" ? "h" : "v";
      const mark = LAB.faceText(Pm, [TX + 0.05, 0, slit === "v" ? 15 : 22], [0, -1, 0], `${+gap.toFixed(2)} mm`, 4.2, "#d9dde2");
      g.innerHTML = `<g data-name="foot">${footSvg(Pm)}</g><g data-name="plate">${plateSvg(Pm, gap, slit)}${mark}</g><g data-name="foot">${footFront(Pm)}</g>` +
        (lab ? CIRC.word(P, [0, HY / 10, Z1 / 10], "slit") : "");
      g.anchors = { slit: [0, 0, ZS / 10] };
      const light = CIRC.lighter(g);
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => `slit plate · a ${slit === "v" ? "upright" : "level"} slit ${+gap.toFixed(2)} mm wide and ${(2 * SL) / 10} cm long, ${ZS / 10} cm above the bench · only the part of the beam that meets the slit gets through`;
      light(lit);
      return g;
    },
  });
})();
