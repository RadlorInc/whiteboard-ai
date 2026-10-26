// "curvedmagnet cx cy k pole=N|S face=+y|-y lab=0 lit=magnet|block" — a PART (PARTS.md, batch 5): one of the two
// curved magnets of motor.js, its origin the surface point under its middle. A ceramic arc magnet 4.4 cm long (x),
// 3.8 cm tall and 1.8 cm thick, its inner face hollowed to a 2.4 cm radius, standing on a painted wooden block
// 5 × 2.6 × 1.2 cm with two brass screws in its front. The hollow (concave) face looks toward `face` and is one pole,
// painted for it (N red, S blue) with the letter on its end; the coil turns about `axis`, the centre of that hollow
// (two of these, N and S, face each other across the coil). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 2.2, BZ = 1.2, ZC = BZ + 1.9, HZ = 1.9, RA = 2.4, BACK = 0.9, N = 14;
  const COL = { N: { sides: ["#c05a4e", "#f4b8ae"], face: "#e88e82", ink: "#8a1d16" }, S: { sides: ["#5d80b8", "#bacde8"], face: "#91afd8", ink: "#1f4f8f" } };
  const sag = RA - Math.sqrt(RA * RA - HZ * HZ), YC = BACK - sag + RA;   // the hollow's centre, for face = +y

  function magnetSvg(P, pole, sg, lab) {
    const c = COL[pole], out = [`<path class="iso-halo" d="${K.haloOf({ x: -2.5, y: -1.3, w: 5, d: 2.6, r: 0.2 }, 0, BZ, P)}"/>`];
    // the block, its two brass screws on the front (+y) face holding the magnet's clamp plate
    out.push(`<g data-name="block">${ISO.tinted(ISO.T.wood, S(K.slabOf({ x: -2.5, y: -1.3, w: 5, d: 2.6, r: 0.15 }, 0, BZ, P, 3, 0.05), { tone: "mid" }))}` +
      [-1.6, 1.6].map((x) => ISO.tinted(ISO.T.brass, S(G.disc(0, 0.07, 0.2, G.frameAlong([x, 1.3, BZ / 2], [0, 1, 0]), P), { tone: "hi" })) + `<path d="${K.segment([x - 0.14, 1.375, BZ / 2], [x + 0.14, 1.375, BZ / 2], P)}" stroke="#6b5114" stroke-width="${Math.max(0.4, G.scaleOf(P) * 0.04).toFixed(2)}" data-free=""/>`).join("") + `</g>`);
    // the profile in (y, z): the hollow face (an arc about the centre), then the flat back
    const prof = Array.from({ length: N + 1 }, (_, i) => { const z = -HZ + (2 * HZ * i) / N; return [sg * (YC - Math.sqrt(RA * RA - z * z)), ZC + z]; });
    const shape = [...prof, [-sg * BACK, ZC + HZ], [-sg * BACK, ZC - HZ]];
    out.push(`<g data-name="magnet">${ISO.prismX(P, sg > 0 ? shape.reverse() : shape, -HX, HX, c.sides, c.face, c.ink)}` +
      window.LAB.faceText(P, [HX + 0.01, -sg * 0.47, ZC - 0.3], [0, -1, 0], pole, 0.85, c.ink) + `</g>`);
    if (lab) out.push(window.LAB.word(P, lab, [0, 0, ZC + HZ + 0.6], `${pole} pole`, c.ink));
    return out.join("");
  }

  ISO.add({
    name: "curvedmagnet", title: "Curved motor magnet (part)", compare: null,
    about: "A curved (arc) ceramic magnet on a wooden block, its hollow face one pole (N red, S blue) toward face; two, N and S, face each other across a motor's coil, which turns about their axis. anchors: face axis",
    line: "curvedmagnet cx cy k pole=N|S face=+y|-y lab=0 lit=magnet|block",
    demo: { line: "curvedmagnet 480 370 50 pole=N face=+y", script: [{ set: {}, hold: 1 }, { set: { lit: "magnet" }, hold: 1.2 }, { set: { pole: "S", face: "-y", lit: "block" }, hold: 1.3 }, { set: { pole: "N", face: "+y", lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 370, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let pole = o.pole === "S" ? "S" : "N", sg = o.face === "-y" ? -1 : 1, lit = o.lit || "";
      const build = () => {
        g.innerHTML = magnetSvg(P, pole, sg, lab);
        g.anchors = { face: [0, +(sg * (YC - RA)).toFixed(3), ZC], axis: [0, +(sg * YC).toFixed(3), ZC] };
        B20.light(w, g, lit);
      };
      g.set = (p) => {
        let again = false;
        if ((p.pole === "N" || p.pole === "S") && p.pole !== pole) { pole = p.pole; again = true; }
        if ((p.face === "+y" || p.face === "-y") && (p.face === "-y" ? -1 : 1) !== sg) { sg = -sg; again = true; }
        if (p.lit !== undefined) lit = p.lit;
        if (again) build(); else B20.light(w, g, lit);
      };
      g.update = () => false;
      g.readout = () => `curved magnet · ${pole} pole on its hollow face, facing ${sg > 0 ? "+y" : "−y"} · field lines cross the gap straight toward the axis, ${YC.toFixed(1)} cm out`;
      build();
      return g;
    },
  });
})();
