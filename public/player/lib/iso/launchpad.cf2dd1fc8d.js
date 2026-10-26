// "launchpad cx cy k lab=0 lit=legs|hub|deflector|rod|cap" — a PART (PARTS.md, batch 5): the tripod launch pad of
// rocket.js, standing on the ground, origin the ground point under its hub. Three steel legs from a cast hub out to
// rubber feet on a 15 cm radius (30 cm across), a tilt bracket with its wing bolt on the hub, the steel blast deflector
// plate (10 cm across, its rim turned down) on top, and a 90 cm launch rod (3/16 in, 4.8 mm) standing in the hub through
// a hole in the plate, with a stop collar for the rocket's lug and a red safety cap on its top. A modelrocket placed
// at= its `rocket` anchor stands with its lug on the rod and its nozzle 3 cm over the plate. Static.
// World units: 1 = 1 cm. anchors: rocket top
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HUB = [5, 9], DEF = [-1.75, 0], DR = 5, DZ = 9.6, RR = 0.24, TOP = 99, ROCK = DZ + 0.3 + 3;

  function padSvg(P) {
    const LAB = window.LAB, out = [];
    // the legs (steel strips from the hub sloping down to the feet), each with its rubber foot; far ones first
    const legs = [Math.PI / 2, Math.PI / 2 + 2.094, Math.PI / 2 + 4.189].map((a) => [Math.cos(a), Math.sin(a)]).sort((p, q) => K.depthOf([p[0] * 15, p[1] * 15, 0], P) - K.depthOf([q[0] * 15, q[1] * 15, 0], P));
    const legSvg = legs.map((d) => ISO.box((u, w, y) => [u * d[0] - y * d[1], u * d[1] + y * d[0], 6.6 - (u * 5.2) / 15 + w], P, [1.5, 15], [-0.45, 0.45], [-0.9, 0.9], "mid") +
      ISO.tinted(ISO.T.rubber, S(K.cylinder(d[0] * 15, d[1] * 15, 1.3, 0, 1.4, P, 18, 0.2), { tone: "hi" })));
    out.push(`<g data-name="legs">${ISO.tinted(ISO.T.steel, legSvg.join(""))}</g>`);
    // the hub: a cast collar with its tilt bracket and wing bolt (along +y, toward the room)
    out.push(`<g data-name="hub">${S(K.cylinder(0, 0, 2, HUB[0], HUB[1] - HUB[0], P, 28, 0.3), { tone: "mid", inner: L(K.sideArc(0, 0, 2, 7, P, 20), { tone: "faint" }) })}` +
      ISO.wbox(P, [-0.8, 0.8], [1.9, 2.9], [5.6, 8.4], "mid") + S(G.disc(0, 0.9, 0.35, G.frameAlong([0, 2.9, 7], [0, 1, 0]), P, { steps: 12 }), { tone: "mid" }) +
      ISO.box((u, w, y) => [u, 3.8 + y, 7 + w], P, [-1.1, 1.1], [-0.35, 0.35], [-0.12, 0.12], "mid") + "</g>");
    // the blast deflector: a steel plate on the hub's top, its rim turned down, the rod's hole through it
    out.push(`<g data-name="deflector">${ISO.tinted(ISO.T.steel, S(K.cylinder(DEF[0], DEF[1], DR, DZ - 0.6, 0.6, P, 48), { tone: "mid" }) + S(K.cylinder(DEF[0], DEF[1], DR - 0.25, DZ, 0.3, P, 48, 0.1), { tone: "hi" }))}` +
      L(K.ring(DEF[0], DEF[1], DR - 1.4, DZ + 0.31, P, 40), { tone: "faint" }) + `<path d="${G.circleOf(LAB.Z([0, 0, DZ + 0.3]), 0, RR + 0.18, P)}" fill="#2f343a"/></g>`);
    return out.join("");
  }
  // the rod out of the plate, the stop collar with its set screw, the safety cap
  function rodSvg(P) {
    const cz = ROCK + 12 - 0.6;
    return `<g data-name="rod">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RR, DZ + 0.3, TOP - DZ - 0.3, P, 12), { tone: "mid", crease: "none" }) +
      S(K.cylinder(0, 0, 0.5, cz, 0.6, P, 16), { tone: "mid" }) + S(G.disc(0.5, 0.85, 0.12, G.frameAlong([0, 0, cz + 0.3], [0, 1, 0]), P, { steps: 8 }), { tone: "mid" }))}</g>` +
      `<g data-name="cap">${ISO.tinted(ISO.T.red, S(K.cylinder(0, 0, 0.75, TOP - 1.2, 1.6, P, 18, 0.25), { tone: "hi" }))}</g>`;
  }

  ISO.add({
    name: "launchpad", title: "Rocket launch pad (part)", compare: null,
    about: "A model rocket launch pad: a steel tripod with rubber feet, a blast deflector plate and a 90 cm launch rod with a stop collar and a red safety cap; a rocket stands on it at the rocket anchor. anchors: rocket top",
    line: "launchpad cx cy k lab=0 lit=legs|hub|deflector|rod|cap",
    demo: { line: "launchpad 480 470 3.6 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "deflector" }, hold: 1.3 }, { set: { lit: "rod" }, hold: 1.3 }, { set: { lit: "cap" }, hold: 1.3 }] },
    make([cx = 480, cy = 470, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -16, y: -16, w: 32, d: 32, r: 16 }, 0, 0.02, P)}"/>${padSvg(P)}${rodSvg(P)}` +
        (lab ? LAB.word(P, lab, [0, 0, TOP + 2], "launch rod", "#555", { anchor: "start", dy: -4 }) + LAB.word(P, lab, [DEF[0] + DR + 1, 0, DZ], "blast deflector", "#555", { anchor: "start" }) : "");
      g.anchors = { rocket: [DEF[0], DEF[1], ROCK], top: [0, 0, TOP + 0.4] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B27.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "launch pad · tripod 30 cm across · 90 cm rod, 4.8 mm · steel blast deflector · keep 5 m back";
      B27.light(w, g, lit);
      return g;
    },
  });
})();
