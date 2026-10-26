// "scalestrip cx cy k lab=0 lit=strip|scale" — a PART (PARTS.md, batch 5): the centimetre strip of pinhole.js, a
// 50 × 2 cm white card scale lying flat on the bench along x, its origin the middle of the strip on the bench. Zero is
// at the −x end (put it at a pinhole or a lens, ax= in cm) and it counts toward +x, where the light source stands on a
// bench. A cm tick every centimetre, longer every 5 with its number, ticks hanging from the back (−y) edge; a printed
// border line and "cm". Static. World units: 1 = 1 cm (the card is built in mm). anchors: zero end
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const LEN = 500, W = 20, T = 0.6;
  const CARD = ISO.tint("#fbfaf4", ["#d8d5c8", "#e2dfd3", "#ebe9df", "#f3f1e9"], "#6a675c");
  ISO.add({
    name: "scalestrip", title: "Centimetre scale strip (part)", compare: null,
    about: "A 50 cm white card scale strip lying on the bench along x, zero at its −x end, cm ticks and a number every 5 cm; to read how far a candle or a screen is from a pinhole or a lens. anchors: zero end",
    line: "scalestrip cx cy k lab=0 lit=strip|scale",
    demo: { line: "scalestrip 480 300 15", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.4 }, { set: { lit: "strip" }, hold: 1.4 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      const x0 = -LEN / 2, top = (x, y) => [x, y, T + 0.02], u = [1, 0, 0], up = [0, -1, 0], out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: x0, y: -W / 2, w: LEN, d: W, r: 1 }, 0, T, Pm)}"/>`);
      out.push(`<g data-name="strip">${ISO.tinted(CARD, S(K.slabOf({ x: x0, y: -W / 2, w: LEN, d: W, r: 0.6 }, 0, T, Pm, 3), { tone: "mid", crease: "none" }))}` +
        L(K.pathOf([top(x0 + 1.5, W / 2 - 1.5), top(x0 + LEN - 1.5, W / 2 - 1.5)].map((p) => K.iso(p, Pm))), { tone: "faint", free: true }) + `</g>`);
      // the scale: a tick every cm from the back edge, every 5 cm longer with its number under it
      const minor = [], major = [], nums = [];
      for (let c = 0; c <= 50; c++) {
        const x = x0 + c * 10 + (c === 0 ? 0.6 : c === 50 ? -0.6 : 0), big = c % 5 === 0;
        (big ? major : minor).push(K.segment(top(x, -W / 2), top(x, -W / 2 + (big ? 7 : 4)), Pm));
        if (big) nums.push(LAB.faceText(Pm, top(x0 + c * 10 + (c === 0 ? 1.6 : c === 50 ? -2.2 : 0), -W / 2 + 11), u, String(c), 4, "#2b2a26", up));
      }
      const ink = ISO.tint("#2b2a26", ["#2b2a26", "#2b2a26", "#2b2a26", "#2b2a26"], "#2b2a26");
      out.push(`<g data-name="scale">${ISO.tinted(ink, L(minor.join(""), { tone: "mid", free: "end" }) + L(major.join(""), { tone: "hi", free: "end" }))}${nums.join("")}` +
        LAB.faceText(Pm, top(x0 + 27, W / 2 - 5), u, "cm", 3.4, "#6a675c", up) + `</g>`);
      if (lab) out.push(LAB.word(Pm, lab, [0, -W, T + 6], "scale (cm)", "#556"));
      g.innerHTML = out.join("");
      g.anchors = { zero: [x0 / 10, 0, T / 10], end: [-x0 / 10, 0, T / 10] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "50 cm scale strip · cm ticks, numbers every 5 cm · zero at the −x end";
      B20.light(w, g, lit);
      return g;
    },
  });
})();
