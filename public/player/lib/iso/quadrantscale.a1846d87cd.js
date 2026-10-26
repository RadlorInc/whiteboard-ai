// "quadrantscale cx cy k lab=0 lit=plate|scale|foot" — a PART (PARTS.md): a quadrant angle scale standing on the bench
// beside a ramp's hinge, origin the bench point under the arc's centre. A 3 mm clear acrylic plate (25 cm reach) in the
// x–z plane, slotted into an aluminium foot; its centre (the hinge line) 3.8 cm up, with a brass pivot boss. Printed on
// its +y face: an arc at 23 cm with a tick every degree 0–45 (5° longer, 10° longest), numbers every 5°, and the 0°
// base line. A ramp rising along +x from its hinge reads its angle against the ticks. Static. Reused from incline.js
// (its quadrant), in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const ZC = 38, R = 250, RS = 230, T = 1.5, rad = (d) => (d * Math.PI) / 180;
  const ALU = ISO.tint("#e4e6e9", ["#a3a7ad", "#b5b9be", "#c7cacf", "#d6d8db"], "#4a4f56");

  ISO.add({
    name: "quadrantscale", title: "Quadrant angle scale (part)", compare: null,
    about: "A clear quadrant plate (25 cm) standing in an aluminium foot beside a ramp's hinge, printed with degree ticks 0–45 (numbers every 5°) round its centre 3.8 cm up; a ramp hinged there reads its angle on it. anchors: centre",
    line: "quadrantscale cx cy k lab=0 lit=plate|scale|foot",
    demo: { line: "quadrantscale 330 430 17 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.5 }, { set: { lit: "foot" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const w = ISO.writer(), fy = T + 0.1, on = (r, d) => [Math.cos(rad(d)) * r, fy, ZC + Math.sin(rad(d)) * r];
      // the plate: a strip under the centre line, then the sector out to R from 0° to 48°, back to the centre
      const outline = [[-20, 8], [R + 15, 8], [R + 15, ZC], ...ISO.arc(0, ZC, R + 15, 0, rad(48), 40).slice(1), [0, ZC + 22], [-20, ZC + 22]];
      const plate = ISO.prismY(Pm, outline, -T, T, ["#c9dde9", "#eef6fb"], "#eef6fb", "#5d7f96");
      // the pivot boss and two screws into the foot
      const Fy = (x, z) => G.frameOf([x, 0, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      const hw = ISO.tinted(ISO.T.brass, S(G.disc(T, T + 3, 6, Fy(0, ZC), Pm, { steps: 20 }), { tone: "mid" }) + S(G.disc(T + 3, T + 4, 2.5, Fy(0, ZC), Pm, { steps: 12 }), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, [60, 200].map((x) => S(G.disc(T, T + 1.2, 3, Fy(x, 18), Pm, { steps: 14 }), { tone: "mid" })).join(""));
      // the scale: arc, ticks hanging off it outward, numbers inside, the 0° base line from the centre
      const arc = [], minor = [], mid = [], major = [], nums = [];
      for (let d = 0; d <= 45; d += 0.5) arc.push(K.iso(on(RS, d), Pm));
      for (let d = 0; d <= 45; d++) (d % 10 === 0 ? major : d % 5 === 0 ? mid : minor).push(K.segment(on(RS, d), on(RS + (d % 10 === 0 ? 14 : d % 5 === 0 ? 10 : 6), d), Pm));
      for (let d = 0; d <= 45; d += 5) nums.push(LAB.faceText(Pm, [Math.cos(rad(d)) * (RS - 14), fy, ZC + Math.sin(rad(d)) * (RS - 14) - 3], [1, 0, 0], String(d), 8, "#1f4f8f"));
      const scale = L(K.pathOf(arc), { tone: "mid", free: true }) + L(minor.join(""), { tone: "lo", free: true }) + L(mid.join(""), { tone: "mid", free: true }) + L(major.join(""), { tone: "mid", free: true }) +
        L(K.segment(on(8, 0), on(RS, 0), Pm), { tone: "lo", free: true }) + nums.join("") + LAB.faceText(Pm, [130, fy, ZC + 70], [1, 0, 0], "degrees", 9, "#1f4f8f");
      // the foot: an aluminium bar with a slot the plate stands in, rubber pads under it
      const foot = ISO.tinted(ISO.T.rubber, [10, R - 10].map((x) => ISO.wbox(Pm, [x - 10, x + 10], [-12, 12], [0, 1.5], "lo")).join("")) + ISO.tinted(ALU, ISO.wbox(Pm, [-25, R + 20], [-14, 14], [1.5, 8], "mid"));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -25, y: -14, w: R + 45, d: 28, r: 3 }, 0, 8, Pm)}"/>` +
        `<g data-name="foot">${foot}</g><g data-name="plate">${plate}${hw}</g><g data-name="scale">${scale}</g><g data-part="words"></g>`;
      if (lab) LAB.parts(g).words.innerHTML = ISO.word(K.iso([R * 0.6, 0, ZC + R * 0.75 + 20], Pm), "quadrant (degrees)", "#445", { size: 13 });
      g.anchors = { centre: [0, 0, ZC / 10] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B17.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "quadrant scale · 0 to 45° in 1° steps round a centre 3.8 cm up · reach 25 cm";
      B17.light(w, g, lit);
      return g;
    },
  });
})();
