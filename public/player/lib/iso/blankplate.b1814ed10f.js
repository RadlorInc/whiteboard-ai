// "blankplate cx cy k lab=0 lit=plate|screws" — a PART (batch 6): a 1U rack blanking plate, flat steel 48.3 × 4.4 cm,
// 2 mm thick, that closes an empty U so cold air cannot short-cut round the servers. Its origin is the middle of its
// bottom edge on its back face (the rack's front mounting face), so `at=rack.front az=<U × 4.445>` fits it. A plate with
// eased edges, two pressed stiffening ribs, a rack-screw slot at each end on the 46.5 cm line, a cage-nut screw in
// each. Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HX = 24.15, TH = 0.2, Z0 = 0.05, Z1 = 4.4;
  ISO.add({
    name: "blankplate", title: "Rack blanking plate (part)", compare: null,
    about: "A 1U rack blanking plate: a flat steel plate with a rack-screw slot at each end, screwed over an empty U. Origin: its back face (the rack's mounting face), bottom middle. anchors: none",
    line: "blankplate cx cy k lab=0 lit=plate|screws",
    demo: { line: "blankplate 480 300 16", script: [{ set: {}, hold: 1.2 }, { set: { lit: "plate" }, hold: 1.2 }, { set: { lit: "screws" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const at = (x, z, dy = 0) => K.iso([x, TH + 0.01 + dy, z], P), quad = (x0, x1, z0, z1, dy = 0) => K.pathOf([at(x0, z0, dy), at(x1, z0, dy), at(x1, z1, dy), at(x0, z1, dy)], true);
      const slot = (xc) => { const pts = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, x = xc + Math.cos(a) * 0.32 + (Math.cos(a) > 0 ? 0.22 : -0.22); pts.push(at(x, 2.2 + Math.sin(a) * 0.32)); } return `<path d="${K.pathOf(pts, true)}" fill="#2a2d31" stroke="#16191d" stroke-width="0.4"/>`; };
      const Yf = (o2) => G.frameOf(o2, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      const screw = (x) => ISO.tinted(ISO.T.steel, S(G.disc(0, 0.12, 0.4, Yf([x, TH, 2.2]), P), { tone: "hi" })) +
        `<path d="M${at(x - 0.17, 2.2, 0.13)}L${at(x + 0.17, 2.2, 0.13)}M${at(x, 2.03, 0.13)}L${at(x, 2.37, 0.13)}" stroke="#4a5058" stroke-width="0.6" data-free=""/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -0.5, w: 2 * HX, d: 1, r: 0.3 }, 0, 0.02, P)}"/>` +
        `<g data-name="plate">${ISO.tinted(T.C.dark, ISO.wbox(P, [-HX, HX], [0, TH], [Z0, Z1], "mid"))}` +
        `<path d="${quad(-HX + 2.4, HX - 2.4, 1.2, 1.45)}${quad(-HX + 2.4, HX - 2.4, 2.95, 3.2)}" fill="#41464d" stroke="#262a30" stroke-width="0.4"/>` +
        `${slot(-23.25)}${slot(23.25)}</g><g data-name="screws">${screw(-23.25)}${screw(23.25)}</g><g data-part="words"></g>`;
      if (lab) LAB.parts(g).words.innerHTML = LAB.word(P, lab, [HX, TH, Z1 + 1], "blanking plate", "#445", { anchor: "start" });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "1U blanking plate · 48.3 × 4.4 cm steel · two rack screws on the 46.5 cm line";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
