// "lamphousing cx cy k on=0|1 lab=0 lit=base|post|housing|lens" — a PART (PARTS.md, batch 5): an optics lamp on the
// bench, its origin the bench point under its post. A cast round foot, a steel post with a collar and thumb screw, a
// fork that holds the housing on two pivot knobs, a painted housing 10 × 8 × 8 cm with vent slots in its side and a
// louvred hood on top (warm light shows through them when on), a rocker switch, a maker's plate, the lens tube on the
// −x face with its bezel and condenser glass, the cable down the back into the foot. The beam
// leaves toward −x at 13.5 cm (stood on an opticalbench's rail top: a benchrider post=10 + lensholder mount=post).
// Reused from photoelectric.js and polarisation.js (their lamp housings). Static.
// World units: 1 = 1 cm. anchors: beam (the lens's front centre), top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BZ = 13.5, HX = 5, HY = 4, Z0 = BZ - 4, Z1 = BZ + 4, LENS = [HX, HX + 2.2, HX + 2.6];
  const X = (o) => G.frameOf(o, [-1, 0, 0], [0, -1, 0], [0, 0, 1]), Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function lampSvg(P, on, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -LENS[2], y: -4, w: LENS[2] + 4, d: 8, r: 4 }, 0, 0.02, P)}"/>`];
    // the lens tube on the far (−x) face, its bezel and the glass; the light on the glass when on (seen round the edge)
    const F = X([0, 0, BZ]);
    out.push(`<g data-name="lens">${ISO.tinted(ISO.T.plastic, S(G.disc(LENS[0], LENS[1], 2.3, F, P), { tone: "mid" }))}${ISO.tinted(ISO.T.steel, S(G.ringBand(LENS[1], LENS[2], 1.9, 2.6, F, P), { tone: "hi" }))}` +
      `<path d="${G.circleOf(F, LENS[1] + 0.1, 1.9, P, 48)}" fill="${on ? "#fff1b8" : "#cfe0ea"}" stroke="#5d7f96" stroke-width="0.5"/>`);
    out.push(`<path d="${G.arcOf(F, LENS[1] + 0.12, 1.4, P, { from: 1.9, to: 3.0 })}" fill="none" stroke="#ffffff" stroke-width="${(G.scaleOf(P) * 0.12).toFixed(2)}" stroke-linecap="round" opacity=".8"/>`);
    if (on) out.push(`<path d="${G.circleOf(F, LENS[2] + 0.05, 3.4, P, 64)}" fill="#ffd36a" fill-opacity=".28"/><path d="${G.circleOf(F, LENS[2] + 0.06, 2.6, P, 64)}" fill="#fff3c4" fill-opacity=".35"/>`);
    out.push(`</g>`);
    // foot, post, collar with its thumb screw
    out.push(`<g data-name="base">${ISO.tinted(ISO.T.paint, S(K.cylinder(0, 0, 4, 0, 1.2, P, 40, 0.3), { tone: "mid" }) + S(K.cylinder(0, 0, 2.4, 1.2, 0.6, P, 32, 0.2), { tone: "mid" }))}` +
      S(K.cylinder(2.6, 0, 0.45, 1.2, 0.5, P, 14), { tone: "lo" }) + `</g>`);
    out.push(`<g data-name="post">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.6, 1.8, Z0 - 3.2, P, 20), { tone: "hi", crease: "none" }) + S(K.cylinder(0, 0, 1, Z0 - 2.4, 1.4, P, 24, 0.15), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.steel, S(G.disc(1, 1.7, 0.22, Y([0, 0, Z0 - 1.7]), P), { tone: "mid" })) + ISO.tinted(ISO.T.plastic, S(G.disc(1.7, 2.2, 0.6, Y([0, 0, Z0 - 1.7]), P), { tone: "hi", inner: L(G.ribsOf(Y([0, 0, Z0 - 1.7]), 1.7, 2.2, 0.6, 10, P, { seams: true }), { tone: "lo" }) })) + `</g>`);
    // the cable from the housing's back down into the foot
    out.push(`<path d="${K.pathOf(G.fillet([[HX - 0.6, 0, Z0 + 0.4], [HX - 0.6, 0, Z0 - 3], [2.6, 0, 3], [2.6, 0, 1.7]], 1.2, 7).map((p) => K.iso(p, P)))}" fill="none" stroke="#26272b" stroke-width="${(G.scaleOf(P) * 0.32).toFixed(2)}" stroke-linecap="round"/>`);
    // the fork: its bar under the housing and the far arm (the near arm goes in front of the housing)
    const arm = (y0, y1) => ISO.wbox(P, [-0.8, 0.8], [y0, y1], [Z0 - 1, BZ + 0.8], "mid");
    out.push(`<g data-name="post">${ISO.tinted(ISO.T.steel, ISO.wbox(P, [-0.8, 0.8], [-HY - 0.7, HY + 0.7], [Z0 - 1, Z0 - 0.4], "mid") + arm(-HY - 0.7, -HY - 0.1))}</g>`);
    // the housing: rounded painted box, vent slots on the near side, louvred hood and a rocker switch on top, a plate
    const glow = on ? "#ffd36a" : "#2c3b4c", slot = (x, z0, z1, y) => K.pathOf([[x - 0.2, y, z0], [x + 0.2, y, z0], [x + 0.2, y, z1], [x - 0.2, y, z1]].map((p) => K.iso(p, P)), true);
    const hood = { x: -3.4, y: -2.6, w: 5, d: 5.2, r: 0.4 };
    const top = [ISO.tinted(ISO.T.paint, S(K.slabOf(hood, Z1, 0.7, P, 3, 0.15), { tone: "mid" }))];
    const louv = []; for (let i = 0; i < 5; i++) { const x = hood.x + 0.8 + i * 0.85; louv.push(K.pathOf([[x - 0.18, hood.y + 0.7, Z1 + 0.72], [x + 0.18, hood.y + 0.7, Z1 + 0.72], [x + 0.18, hood.y + hood.d - 0.7, Z1 + 0.72], [x - 0.18, hood.y + hood.d - 0.7, Z1 + 0.72]].map((p) => K.iso(p, P)), true)); }
    top.push(`<path d="${louv.join("")}" fill="${glow}" fill-opacity="${on ? 0.9 : 0.55}" stroke="#33506f" stroke-width="0.5"/>`);
    top.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [2.6, 4.2], [-1, 1], [Z1, Z1 + 0.35], "mid") + ISO.wbox(P, [3.3, 4], [-0.7, 0.7], [Z1 + 0.35, Z1 + 0.8], "hi")));
    const vy = HY + 0.03, vents = []; for (let i = 0; i < 4; i++) vents.push(slot(1.75 + i * 0.75, Z0 + 1.4, Z1 - 1.4, vy));
    const pa = (x, z) => K.iso([x, vy, z], P);
    out.push(`<g data-name="housing">${ISO.tinted(ISO.T.paint, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.8 }, Z0, Z1 - Z0, P, 4, 0.3), { tone: "mid", inner: L(K.sideSeam({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.8 }, Z1 - 0.9, P, 4), { tone: "faint" }) }))}` +
      `<path d="${vents.join("")}" fill="${glow}" fill-opacity="${on ? 0.9 : 0.55}" stroke="#33506f" stroke-width="0.5"/>` +
      `<path d="${K.pathOf([pa(-4.2, Z0 + 0.8), pa(-1.4, Z0 + 0.8), pa(-1.4, Z0 + 2.4), pa(-4.2, Z0 + 2.4)], true)}" fill="#eef0f2" stroke="#55534c" stroke-width="0.5"/><path d="${[Z0 + 2, Z0 + 1.6, Z0 + 1.2].map((z, i) => K.pathOf([pa(-3.9, z), pa(-1.7 - i * 0.6, z)])).join("")}" stroke="#8a877f" stroke-width="0.35"/>` +
      top.join("") + `</g>`);
    // the near fork arm and its pivot knob
    out.push(`<g data-name="post">${ISO.tinted(ISO.T.steel, arm(HY + 0.1, HY + 0.7))}${ISO.tinted(ISO.T.plastic, S(G.disc(HY + 0.7, HY + 1.1, 0.9, Y([0, 0, BZ]), P), { tone: "mid" }) + S(G.disc(HY + 1.1, HY + 1.6, 0.75, Y([0, 0, BZ]), P), { tone: "hi", inner: L(G.ribsOf(Y([0, 0, BZ]), HY + 1.1, HY + 1.6, 0.75, 12, P, { seams: true }), { tone: "lo" }) }))}</g>`);
    if (lab) out.push(window.LAB.word(P, lab, [0, 0, Z1 + 2.4], on ? "lamp (on)" : "lamp", "#556"));
    return out.join("");
  }

  ISO.add({
    name: "lamphousing", title: "Lamp housing on a post (part)", compare: null,
    about: "An optics lamp: a vented housing on a fork and post, the light leaving through a lens toward −x (the optical bench's rule) at 13.5 cm over what it stands on, warm light in its vents. anchors: beam top",
    line: "lamphousing cx cy k on=0|1 lab=0 lit=base|post|housing|lens",
    demo: { line: "lamphousing 470 420 20 on=1", script: [{ set: {}, hold: 1 }, { set: { lit: "lens" }, hold: 1.3 }, { set: { lit: "housing" }, hold: 1.3 }, { set: { lit: "post" }, hold: 1.3 }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", on = o.on !== "0";
      g.innerHTML = lampSvg(P, on, lab);
      g.anchors = { beam: [-LENS[2], 0, BZ], top: [0, 0, Z1 + 0.8] };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) window.LAB.light(w, g, p.lit); };
      g.update = () => false;
      g.readout = () => `lamp ${on ? "on" : "off"} · housing 10 × 8 × 8 cm · beam toward −x at 13.5 cm`;
      window.LAB.light(w, g, o.lit || "");
      return g;
    },
  });
})();
