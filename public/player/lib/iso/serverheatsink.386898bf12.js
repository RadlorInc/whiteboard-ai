// "serverheatsink cx cy k lab=0 lit=base|fins|screws" — a PART (batch 6): a passive server processor heatsink, 9 cm
// across, 11 cm long, 2.6 cm tall (fits a 1U server), its origin the surface point under its middle. A copper base
// plate 0.5 cm thick, a block of 34 thin aluminium fins standing along y (the server's air runs between them, front to
// back), and four spring-loaded captive screws at the corners of the base that hold it down on the processor.
// Reused from server.js (its heatsinks). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K;
  const HX = 4.5, HY = 5.5, ZB = 0.5, ZT = 2.6, FX = 4.2, FY = 4.3, PITCH = 0.25, FT = 0.06;
  ISO.add({
    name: "serverheatsink", title: "Server heatsink (part)", compare: null,
    about: "A passive server processor heatsink: a copper base, a block of tall thin aluminium fins the server's fans blow air through, and four captive screws at the corners. Origin: surface under its middle. anchors: top",
    line: "serverheatsink cx cy k lab=0 lit=base|fins|screws",
    demo: { line: "serverheatsink 480 360 34", script: [{ set: {}, hold: 1.2 }, { set: { lit: "fins" }, hold: 1.2 }, { set: { lit: "base" }, hold: 1.2 }, { set: { lit: "screws" }, hold: 1.2 }] },
    make([cx = 480, cy = 360, k = 3], o, t, parent) {
      const T = window.TECH, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      // a captive screw: a spring round its shank, a domed head with a cross recess
      const screw = (x, y) => T.cyl(P, x, y, 0.32, ZB, 0.9, "mid", T.C.steel, 14) +
        `<path d="${[0.25, 0.45, 0.65, 0.85].map((z) => K.pathOf([K.iso([x - 0.32, y, ZB + z], P), K.iso([x + 0.32 * 0.5, y + 0.32 * 0.87, ZB + z + 0.08], P)])).join("")}" stroke="#5a6068" stroke-width="0.5" data-free=""/>` +
        T.cyl(P, x, y, 0.42, ZB + 0.9, 0.3, "hi", T.C.steel, 16) +
        `<path d="M${K.iso([x - 0.2, y, ZB + 1.21], P)}L${K.iso([x + 0.2, y, ZB + 1.21], P)}M${K.iso([x, y - 0.2, ZB + 1.21], P)}L${K.iso([x, y + 0.2, ZB + 1.21], P)}" stroke="#4a5058" stroke-width="0.6" data-free=""/>`;
      const fins = [];
      for (let x = -FX; x <= FX - FT + 1e-6; x += PITCH) fins.push(ISO.tinted(T.C.alu, ISO.wbox(P, [x, x + FT], [-FY, FY], [ZB, ZT], "hi")));
      const SX = 3.7, SY = 4.95;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.4 }, 0, 0.02, P)}"/>` +
        `<g data-name="base">${ISO.tinted(T.C.copper, ISO.wbox(P, [-HX, HX], [-HY, HY], [0, ZB], "mid"))}${ISO.tinted(T.C.copper, ISO.wbox(P, [-FX, FX], [-FY, FY], [ZB, ZB + 0.12], "lo"))}</g>` +
        `<g data-name="screws">${screw(-SX, -SY)}${screw(SX, -SY)}</g><g data-name="fins">${fins.join("")}</g>` +
        `<g data-name="screws">${screw(-SX, SY)}${screw(SX, SY)}</g><g data-part="words"></g>`;
      if (lab) LAB.parts(g).words.innerHTML = LAB.word(P, lab, [HX, 0, ZT + 0.6], "heatsink", "#445", { anchor: "start" }) + LAB.word(P, lab, [HX, HY, 0.2], "copper base", "#445", { anchor: "start" });
      g.anchors = { top: [0, 0, ZT] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "processor heatsink · copper base spreads the heat, 34 aluminium fins hand it to the air the fans push through · 9 × 11 × 2.6 cm";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
