// "airtank cx cy k lab=0 lit=tank|cradles|outlet|valve" — a PART (PARTS.md, batch 5): a compressed-air receiver tank
// (gauge.js's tank, real size): a red welded steel shell 40 cm long and 20 cm across with dished ends, lying along x
// on two bolted steel saddle cradles, its origin the floor point under its middle. Circumferential weld seams, a
// stencilled "AIR · 10 bar max", a brass safety valve with its ring on top, a drain cock underneath, and the outlet
// boss on the +x end with a threaded socket (anchor outlet, its face, pointing +x: a handvalve screws in there).
// Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RT = 100, ZA = 130, HL = 200, CX = [-120, 120];
  const RED = ISO.tint("#e45a48", ["#9e2a1e", "#b23426", "#c64232", "#d44e3c"], "#4a120c");
  const xF = (x) => G.frameOf([x, 0, ZA], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  // a saddle's end profile in (y, z): its foot, then up and round under the shell
  const SADDLE = (() => {
    const pts = [[-86, 0], [86, 0], [86, 10], [78, 10]];
    const top = []; for (let i = 0; i <= 14; i++) { const th = Math.asin(78 / (RT + 3)) * (1 - (2 * i) / 14); top.push([(RT + 3) * Math.sin(th), ZA - (RT + 3) * Math.cos(th)]); }
    return [...pts, ...top, [-78, 10], [-86, 10]];
  })();

  ISO.add({
    name: "airtank", title: "Compressed-air tank (part)", compare: null,
    about: "A red compressed-air receiver, 40 cm long and 20 cm across, lying on two saddle cradles: weld seams, a safety valve on top, a drain cock under it, the outlet boss on its +x end. anchors: outlet top",
    line: "airtank cx cy k lab=0 lit=tank|cradles|outlet|valve",
    demo: { line: "airtank 460 350 9 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "outlet" }, hold: 1.2 }, { set: { lit: "valve" }, hold: 1.2 }, { set: { lit: "cradles" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -HL, y: -RT, w: 2 * HL + 40, d: 2 * RT, r: 30 }, 0, 4, Pm)}"/>`);
      // the drain cock under the middle (seen between the cradles), then the cradles, each with its two foot bolts
      const dF = G.frameAlong([0, 0, ZA - RT], [0, 0, -1]);
      out.push(`<g data-name="tank">${ISO.tinted(ISO.T.brass, B15.hex(Pm, dF, -2, 10, 17) + S(G.disc(10, 22, 4, dF, Pm), { tone: "hi" }))}</g>`);
      out.push(`<g data-name="cradles">`);
      for (const x of CX) {
        out.push(ISO.prismX(Pm, SADDLE, x - 22, x + 22, ["#3a3e44", "#9aa0a8"], "#6f757d", "#15181b"));
        for (const y of [-72, 72]) out.push(ISO.tinted(ISO.T.steel, B15.hex(Pm, G.frameAlong([x, y, 10], [0, 0, 1]), 0, 5, 13) + S(G.disc(5, 8, 4, G.frameAlong([x, y, 10], [0, 0, 1]), Pm), { tone: "hi" })));
      }
      out.push(`</g>`);
      // the shell: dished ends, two seams where the heads are welded on, a long seam along the bottom, the stencil
      const F = xF(0);
      out.push(`<g data-name="tank">${ISO.tinted(RED, S(G.solidOf([[-HL, 34], [-HL + 6, 70, 1], [-HL + 26, RT, 1], [HL - 26, RT], [HL - 6, 70, 1], [HL, 34]], F, Pm), { tone: "hi", inner: L(G.arcOf(F, -HL + 30, RT, Pm) + G.arcOf(F, HL - 30, RT, Pm), { tone: "lo" }) }))}`);
      const side = [0, RT + 0.4, ZA], up = [0, 0, 1];
      out.push(LAB.faceText(Pm, [side[0] - 40, side[1], ZA + 10], [1, 0, 0], "AIR", 22, "#fbe9e4", up), LAB.faceText(Pm, [side[0] - 40, side[1], ZA - 14], [1, 0, 0], "10 bar max", 12, "#fbe9e4", up));
      out.push(`<path d="${K.pathOf([[20, RT + 0.3, ZA + 22], [150, RT + 0.3, ZA + 22], [150, RT + 0.3, ZA - 22], [20, RT + 0.3, ZA - 22]].map((p) => K.iso(p, Pm)), true)}" fill="#e8eaec" stroke="#55534c" stroke-width="0.6"/>`);
      out.push(`<path d="${[8, 0, -8].map((dz) => K.pathOf([K.iso([30, RT + 0.35, ZA + dz], Pm), K.iso([dz ? 120 : 140, RT + 0.35, ZA + dz], Pm)])).join("")}" stroke="#8a877f" stroke-width="0.8"/></g>`);
      // the safety valve on top: a boss, a brass body, the pull ring
      const vF = G.frameAlong([-60, 0, ZA + RT - 3], [0, 0, 1]);
      out.push(`<g data-name="valve">${ISO.tinted(ISO.T.steel, S(G.disc(0, 8, 14, vF, Pm), { tone: "mid" }))}${ISO.tinted(ISO.T.brass, B15.hex(Pm, vF, 8, 18, 22) + S(G.solidOf([[18, 9], [30, 9], [34, 6, 1], [44, 5]], vF, Pm), { tone: "hi" }))}` +
        `${ISO.tinted(ISO.T.steel, S(G.ringBand(-1.4, 1.4, 6, 9, G.frameOf([-60, 0, ZA + RT + 48], [0, 1, 0], [1, 0, 0], [0, 0, 1]), Pm), { tone: "hi" }))}</g>`);
      // the outlet on the +x end: a welded boss with a threaded socket
      const oF = xF(HL - 2);
      out.push(`<g data-name="outlet">${ISO.tinted(ISO.T.steel, S(G.disc(0, 10, 18, oF, Pm), { tone: "mid" }) + B15.hex(Pm, oF, 10, 20, 26))}<path d="${G.circleOf(oF, 20.05, 7, Pm)}" fill="#3c3f45" stroke="#1d1f22" stroke-width="0.6"/></g>`);
      if (lab) out.push(CIRC.word(P, [HL / 10 + 2.5, 0, (ZA + RT) / 10], "air tank"));
      g.innerHTML = out.join("");
      g.anchors = { outlet: [(HL + 18) / 10, 0, ZA / 10], top: [-6, 0, (ZA + RT + 57) / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B15.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "compressed-air tank · 40 cm long, 20 cm across, about 11 litres · safe up to 10 bar";
      B15.light(w, g, lit);
      return g;
    },
  });
})();
