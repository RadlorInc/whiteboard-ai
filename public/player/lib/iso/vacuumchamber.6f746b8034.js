// "vacuumchamber cx cy k lab=0 lit=base|ring|glass|flange|port" — a PART (PARTS.md, batch 5): the round vacuum
// chamber of a gold-foil (Rutherford) set-up (goldfoil.js's chamber, real size): 25 cm across and 18 cm tall, its
// origin the bench point under its middle. A turned steel base 3 cm thick with eight bolts round its rim, a degree
// ring printed on its floor (a tick every 10°, numbers every 30°, 0° along +x: the beam's line, the gap at 180° where
// the source sits), a rubber gasket, a glass wall with a steel top flange, and the pump port: a stub with a hose barb
// through the base's side (anchor port, its end). Anchor centre = the middle of the floor (where a foil holder stands),
// rim = the flange's top middle. Static; parts placed inside draw over the glass, as seen through it. Built in mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RB = 125, ZF = 30, RG = 110, ZT = 170, RR = 90, PA = -0.7;
  const rad = (d) => (d * Math.PI) / 180, onFloor = (d, r) => [Math.cos(rad(d)) * r, Math.sin(rad(d)) * r, ZF + 0.05];

  function ringSvg(P) {
    const arc = [], minor = [], major = [], out = [];
    for (let d = -170; d <= 170; d += 2) arc.push(K.iso(onFloor(d, RR), P));
    for (let d = -170; d <= 170; d += 10) (d % 30 ? minor : major).push(K.segment(onFloor(d, RR), onFloor(d, d % 30 ? RR - 4 : RR - 7), P));
    out.push(L(K.pathOf(arc), { tone: "mid" }), K.dotsSvg([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "mid" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    // the numbers lie flat on the floor, turned to read from the camera
    const o = ISO.unproject(P, K.iso([0, 0, ZF], P), ZF), sx = K.iso([0, 0, ZF], P), U = ISO.unproject(P, [sx[0] + 1, sx[1]], ZF), V = ISO.unproject(P, [sx[0], sx[1] + 1], ZF);
    const n = (v) => { const l = Math.hypot(v[0] - o[0], v[1] - o[1]); return [(v[0] - o[0]) / l, (v[1] - o[1]) / l, 0]; }, u = n(U), vv = n(V);
    for (let d = -150; d <= 180; d += 30) if (d !== 180) out.push(`<g transform="${TECH.mat(P, onFloor(d, RR - 15), u, vv)}"><text text-anchor="middle" y="2.2" fill="#3c4148" style="font:700 6.5px 'Helvetica Neue',Arial,sans-serif">${Math.abs(d)}°</text></g>`);
    out.push(`<path d="${K.pathOf([onFloor(0, 0), onFloor(0, RR - 22)].map((p) => K.iso(p, P)))}" stroke="#c45a00" stroke-width="${(G.scaleOf(P) * 0.8).toFixed(2)}" stroke-dasharray="3 3" fill="none"/>`);
    return out.join("");
  }
  // the top flange: an open steel ring (its side band toward us, its top face round the opening)
  function flangeSvg(P) {
    const ring = (z, r, a0, a1, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return K.iso([Math.cos(a) * r, Math.sin(a) * r, z], P); });
    const v = G.angleToward(LAB.Z([0, 0, 0]), G.viewOf(P)), R1 = RG + 8, R0 = RG - 6, Z1 = ZT + 10;
    const side = [...ring(ZT, R1, v - Math.PI / 2, v + Math.PI / 2), ...ring(Z1, R1, v + Math.PI / 2, v - Math.PI / 2)];
    const top = K.pathOf(ring(Z1, R1, 0, 2 * Math.PI, 72), true) + K.pathOf(ring(Z1, R0, 0, 2 * Math.PI, 72), true);
    return `<path d="${K.pathOf(side, true)}" fill="#a9acb2" stroke="#3c3f45" stroke-width="0.8" stroke-linejoin="round"/><path d="${top}" fill="#dfe0e3" fill-rule="evenodd" stroke="#3c3f45" stroke-width="0.8"/>` +
      `<path d="${K.pathOf(ring(Z1 - 0.05, R0, v + Math.PI / 2, v + 1.5 * Math.PI), false)}" fill="none" stroke="#8d9096" stroke-width="${(G.scaleOf(P) * 3).toFixed(2)}" opacity=".6"/>`;
  }
  const bolts = (P, near) => Array.from({ length: 8 }, (_, i) => (i + 0.5) * 45).map((d) => [d, onFloor(d, RB - 8)]).filter(([, p]) => (K.depthOf(p, P) > K.depthOf([0, 0, ZF], P)) === near)
    .map(([, p]) => ISO.tinted(ISO.T.steel, B15.hex(P, G.frameAlong([p[0], p[1], ZF], [0, 0, 1]), 0, 5, 10) + S(G.disc(5, 7, 3.6, G.frameAlong([p[0], p[1], ZF], [0, 0, 1]), P), { tone: "hi" }))).join("");

  ISO.add({
    name: "vacuumchamber", title: "Vacuum chamber (part)", compare: null,
    about: "The round vacuum chamber of a gold-foil experiment: a bolted steel base with a degree ring on its floor (0° along the beam), a glass wall with a steel flange, and a pump port with a hose barb. anchors: centre rim port",
    line: "vacuumchamber cx cy k lab=0 lit=base|ring|glass|flange|port",
    demo: { line: "vacuumchamber 470 340 13 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "ring" }, hold: 1.2 }, { set: { lit: "glass" }, hold: 1.2 }, { set: { lit: "port" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", out = [];
      const zF = LAB.Z([0, 0, 0]), pF = G.frameAlong([Math.cos(PA) * (RB - 6), Math.sin(PA) * (RB - 6), 15], [Math.cos(PA), Math.sin(PA), 0]);
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -RB, y: -RB, w: 2 * RB, d: 2 * RB, r: RB }, 0, 4, Pm)}"/>`);
      out.push(`<g data-name="base">${ISO.tinted(ISO.T.steel, S(G.solidOf([[0, RB - 3], [3, RB, 1], [ZF - 3, RB], [ZF, RB - 3, 1]], zF, Pm), { tone: "hi", inner: L(G.arcOf(zF, 8, RB, Pm), { tone: "faint" }) }))}${bolts(Pm, false)}</g>`);
      out.push(`<g data-name="ring">${ringSvg(Pm)}</g>`);
      const vessel = LAB.vessel(Pm, [0, 0, ZF + 3], [[0, RG], [ZT - ZF - 3, RG]], { base: 0, wall: 5 });
      out.push(`<g data-name="glass"><path d="${G.circleOf(zF, ZF + 0.1, RG + 2, Pm)}" fill="none" stroke="#2a2b2f" stroke-width="${(G.scaleOf(Pm) * 4).toFixed(2)}"/><path d="${vessel.sil}" fill="#dcebf4" fill-opacity=".22"/>${vessel.front()}</g>`);
      out.push(`<g data-name="flange">${flangeSvg(Pm)}</g>`);
      out.push(`<g data-name="base">${bolts(Pm, true)}</g>`);
      out.push(`<g data-name="port">${ISO.tinted(ISO.T.steel, S(G.disc(6, 14, 10, pF, Pm), { tone: "mid" }) + B15.hex(Pm, pF, 14, 22, 16) + S(G.solidOf([[22, 5], [30, 5], [31, 7, 1], [35, 5], [36, 7, 1], [40, 5], [41, 7, 1], [46, 5]], pF, Pm), { tone: "hi" }))}</g>`);
      if (lab) out.push(CIRC.word(P, [RB / 10, 0, (ZT + 20) / 10], "vacuum chamber"));
      g.innerHTML = out.join("");
      g.anchors = { centre: [0, 0, ZF / 10], rim: [0, 0, (ZT + 10) / 10], port: B15.cm(G.pointOf(pF, 46, 0, 0)) };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B15.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "vacuum chamber · 25 cm across, 18 cm tall · pumped out so the α particles are not stopped by air";
      B15.light(w, g, lit);
      return g;
    },
  });
})();
