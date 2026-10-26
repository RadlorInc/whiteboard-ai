// "corkring cx cy k lab=0 lit=ring" — a PART (PARTS.md, batch 5): the cork ring a round-bottomed flask sits in
// (flask.js k=round), its origin the bench point under its middle. A ring of pressed cork 5.4 cm across, a 3.4 cm hole,
// 1.3 cm thick (the same ring roundflask.js draws with ring=1), its edges rounded off, the cork's grain as fine dark
// and light flecks on its top and side. Static. Built in mm; anchors in cm: `seat` = the middle of the hole at the
// top, `flask` = where the lowest point of a 250 mL round flask's 8 cm ball comes to rest in it (place
// `roundflask … ring=0 at=<id>.flask`).
(() => {
  const K = window.K, G = window.G;
  let n = 0;
  const RI = 17, RO = 27, H = 13, BALL = 40;
  const CORK = ISO.tint("#e9cfa6", ["#b98c55", "#c79c66", "#d4ad7a", "#dfbe8f"], "#6e4a1e");

  ISO.add({
    name: "corkring", title: "Cork ring (part)", compare: null,
    about: "A cork ring 5.4 cm across that a round-bottomed flask sits in so it cannot roll; a bench part. anchors: seat flask",
    line: "corkring cx cy k lab=0 lit=ring",
    demo: { line: "corkring 470 310 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "ring" }, hold: 1.4 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const F = LAB.Z([0, 0, 0]), face = G.angleToward(F, G.viewOf(P));
      // grain flecks: on the top between the rounded edges, and on the side that faces us
      const top = [], topDark = [], side = [];
      for (let i = 0; i < 70; i++) { const a = i * 2.39996, r = RI + 2.2 + ((i * 0.618034) % 1) * (RO - RI - 4.4); (i % 3 ? top : topDark).push(K.iso([Math.cos(a) * r, Math.sin(a) * r, H + 0.05], Pm)); }
      for (let i = 0; i < 40; i++) { const a = face + (((i * 0.754878) % 1) - 0.5) * 2.6, s = 2.2 + ((i * 0.618034) % 1) * (H - 4.4); side.push(K.iso(G.pointOf(F, s, RO + 0.05, a), Pm)); }
      // through the hole: the far inner wall (darker cork) and the bench under it, clipped to the hole's top edge
      const id = "b14cr" + ++n, ell = (z, r) => K.pathOf(K.circleRing(0, 0, r, 48).map(([x, y]) => K.iso([x, y, z], Pm)), true);
      const hole = () => `<clipPath id="${id}"><path d="${ell(H, RI)}"/></clipPath><g clip-path="url(#${id})"><path d="${ell(H, RI)}" fill="#a87a45"/><path d="${ell(0, RI)}" fill="#e6e3dc"/></g><path d="${ell(H, RI)}" fill="none" stroke="#6e4a1e" stroke-width="0.7"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RO, y: -RO, w: 2 * RO, d: 2 * RO, r: RO }, 0, H, Pm)}"/>` +
        `<g data-name="ring">${ISO.tinted(CORK, S(G.ringBand(0, H, RI, RO, F, Pm, { hole: [H, RI] }), { tone: "mid" }) + hole() + LAB.L(G.arcOf(F, H - 1.2, RO + 0.02, Pm, { trim: 0 }), { tone: "faint" }) + D(top, { size: 0.3, tone: "faint" }) + D(topDark, { size: 0.4 }) + D(side, { size: 0.32 }))}</g><g data-part="words"></g>`;
      // an 8 cm ball resting on the hole's top inner edge (r 17 at the top, less its rounding)
      const rEdge = RI + 0.6, zEdge = H - 0.6, low = zEdge - (BALL - Math.sqrt(BALL * BALL - rEdge * rEdge));
      g.anchors = { seat: [0, 0, H / 10], flask: [0, 0, +(low / 10).toFixed(3)] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [RO + 6, 0, H / 2], "cork ring", "#6e4a1e", { anchor: "start" });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "cork ring 5.4 cm across, 1.3 cm thick: a round-bottomed flask sits in it and cannot roll";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
