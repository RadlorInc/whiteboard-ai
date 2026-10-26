// "foilframe cx cy k lab=0 lit=foil|frame|foot" — a PART (PARTS.md, batch 5): the gold foil of goldfoil.js, standing on
// the bench (or the chamber floor), its origin the point under its middle. A square brass frame 7 × 7 cm, 3 mm thick,
// standing upright across the beam (it faces ±x), held by four screws; in its 5 × 5 cm window a gold leaf about 0.4 µm
// thick (some thousand atoms), stretched with a few faint crinkles. Its middle is 4.5 cm up, the alphasource beam's
// height. The frame stands in a slot in a small steel foot (2 × 5 cm, so it fits inside a scintdetector's turning ring).
// Anchor `foil`: the foil's middle. Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const GOLD = "#e8c44a", BZ = 45, H = 35, WIN = 25, T = 1.5, FZ = 12;

  ISO.add({
    name: "foilframe", title: "Gold foil in a frame (part)", compare: null,
    about: "A gold leaf 0.4 µm thick stretched in a 7 cm square brass frame standing across the alpha beam, its middle 4.5 cm up; static. anchors: foil",
    line: "foilframe cx cy k lab=0 lit=foil|frame|foot",
    demo: { line: "foilframe 480 410 36 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "foil" }, hold: 1.2 }, { set: { lit: "frame" }, hold: 1.2 }, { set: { lit: "foot" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const brass = (svg) => ISO.tinted(ISO.T.brass, svg);
      const foot = ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -10, y: -25, w: 20, d: 50, r: 2 }, 0, FZ, Pm, 4, 0.8), { tone: "mid" })) +
        `<path d="${K.pathOf([[-T - 0.4, -25, FZ + 0.05], [T + 0.4, -25, FZ + 0.05], [T + 0.4, 25, FZ + 0.05], [-T - 0.4, 25, FZ + 0.05]].map((p) => K.iso(p, Pm)), true)}" fill="#3c3f45"/>`;
      // the foil: a flat leaf at x = 0 in the window, its crinkles faint (lines on it end on the frame)
      const fx = (y, z) => K.iso([0, y, z], Pm);
      const foil = `<path d="${K.pathOf([fx(-WIN, BZ - WIN), fx(WIN, BZ - WIN), fx(WIN, BZ + WIN), fx(-WIN, BZ + WIN)], true)}" fill="${GOLD}" fill-opacity=".92" stroke="#8a6a10" stroke-width="0.5"/>` +
        `<path d="${[[-WIN, BZ + 9, WIN, BZ + 14], [-WIN, BZ - 6, WIN, BZ - 2], [-8, BZ - WIN, -3, BZ + WIN]].map(([y0, z0, y1, z1]) => K.pathOf([fx(y0, z0), fx(y1, z1)])).join("")}" stroke="#fff3b8" stroke-width="0.7" opacity=".7"/>`;
      // the frame: four bars round the window (two upright, two between them), painted far to near
      const bars = [[[-H, -WIN], [BZ - H, BZ + H]], [[-WIN, WIN], [BZ - H, BZ - WIN]], [[-WIN, WIN], [BZ + WIN, BZ + H]], [[WIN, H], [BZ - H, BZ + H]]]
        .map(([y, z]) => brass(ISO.wbox(Pm, [-T, T], y, z, "mid"))).join("");
      const screws = [[-30, BZ - 30], [30, BZ - 30], [-30, BZ + 30], [30, BZ + 30]].map(([y, z]) => ISO.tinted(ISO.T.steel, S(G.disc(0, 1.2, 2, LAB.A([T, y, z], [1, 0, 0]), Pm), { tone: "hi" }))).join("");
      const stamp = LAB.faceText(Pm, [T + 0.05, 0, BZ - WIN - 6.5], [0, -1, 0], "Au · 0.4 µm", 3.6, "#6b5114");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -10, y: -25, w: 20, d: 50, r: 2 }, 0, FZ, Pm)}"/>` +
        `<g data-name="foot">${foot}</g><g data-name="foil">${foil}</g><g data-name="frame">${bars}${screws}${stamp}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, BZ + H + 6], "gold foil", "#8a6a10", { dy: -6 });
      g.anchors = { foil: [0, 0, BZ / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "gold foil about 0.4 µm thick (a few thousand atoms) in a 7 cm brass frame · its middle 4.5 cm up, on the alpha beam";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
