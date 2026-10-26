// "breadboard cx cy k lab=0 lit=board|strips|rails" — a PART (PARTS.md, batch 5): the white solderless breadboard of
// rccircuit.js, lying on the bench, its origin the bench point under its middle. A full-size 830-point board,
// 16.5 × 5.5 × 1 cm: 63 columns of terminal strips at 0.1 in (2.54 mm) pitch, rows a–e and f–j either side of the
// centre channel, a pair of power rails along each long edge (+ outside with its red line, − inside with its blue
// line, 50 holes each in groups of five), printed column numbers and row letters, a paper backing under it.
// Anchors (cm, on the top face): top (the middle), plus and minus (the back rails' left-hand holes), a1 (row a,
// column 1) and j1 (row j, column 1); a column is 0.254 cm further along +x. Static. Built in mm (ISO.mm).
(() => {
  const K = window.K, PITCH = 2.54, HX = 82.5, HY = 27.5, H = 10;
  const WHITE = ISO.tint("#fbfbf8", ["#d8d8d2", "#e0e0da", "#e8e8e2", "#f0f0ea"], "#7a7a74");
  const BACKING = ISO.tint("#f1efe6", ["#c9c6ba", "#d3d0c5", "#ddd9cf", "#e6e3da"], "#77746a");
  const ROWS = [-13.97, -11.43, -8.89, -6.35, -3.81, 3.81, 6.35, 8.89, 11.43, 13.97];   // a … j
  const PLUS = 22.86, MINUS = 20.32, colX = (c) => (c - 31) * PITCH;                     // c = 0 … 62 (column 1 … 63)
  const railX = []; for (let p = 0; p < 60; p++) if (p % 6 !== 5) railX.push((p - 29.5) * PITCH);
  // a square hole on the top face, 1 mm across
  const sq = (Pm, x, y) => K.pathOf([[x - 0.5, y - 0.5], [x + 0.5, y - 0.5], [x + 0.5, y + 0.5], [x - 0.5, y + 0.5]].map(([a, b]) => K.iso([a, b, H + 0.02], Pm)), true);

  ISO.add({
    name: "breadboard", title: "Breadboard (part)", compare: null,
    about: "A white solderless breadboard (830 holes at 2.54 mm): terminal strips a–e and f–j either side of a centre channel, red + and blue − power rails along both edges; a bench part that resistors, capacitors, switches and leads plug into. anchors: top plus minus a1 j1",
    line: "breadboard cx cy k lab=0 lit=board|strips|rails",
    demo: { line: "breadboard 480 300 30 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "strips" }, hold: 1.2 }, { set: { lit: "rails" }, hold: 1.2 }, { set: { lit: "board" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1.5 };
      const top = (x, y) => K.iso([x, y, H + 0.02], Pm);
      const print = (x, y, text, size, color = "#6d6d66") => LAB.faceText(Pm, [x, y, H + 0.03], [1, 0, 0], text, size, color, [0, -1, 0]);
      // the body: paper backing, the moulded block; the centre channel and the two rail grooves run edge to edge
      const body = ISO.tinted(BACKING, S(K.slabOf(plan, 0, 0.6, Pm, 2), { tone: "lo", crease: "none" })) +
        ISO.tinted(WHITE, S(K.slabOf(plan, 0.6, H - 0.6, Pm, 2, 0.4), { tone: "mid" }));
      const channel = `<path d="${K.pathOf([top(-HX + 0.4, -1.3), top(HX - 0.4, -1.3), top(HX - 0.4, 1.3), top(-HX + 0.4, 1.3)], true)}" fill="#cfcfc8"/>` +
        L(K.lineOnTop([-HX + 0.4, -1.3], [HX - 0.4, -1.3], H + 0.02, Pm), { tone: "lo" }) + L(K.lineOnTop([-HX + 0.4, 1.3], [HX - 0.4, 1.3], H + 0.02, Pm), { tone: "faint" });
      const grooves = [-17.2, 17.2].map((y) => L(K.lineOnTop([-HX + 0.4, y], [HX - 0.4, y], H + 0.02, Pm), { tone: "faint" })).join("");
      // the terminal strips: 63 × 10 holes, numbers every 5 columns on both sides, a–j at both ends
      const holes = []; for (let c = 0; c < 63; c++) for (const y of ROWS) holes.push(sq(Pm, colX(c), y));
      let labels = "";
      for (const c of [0, 4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 62]) labels += print(colX(c), -15.6, String(c + 1), 1.5) + print(colX(c), 16.6, String(c + 1), 1.5);
      "abcdefghij".split("").forEach((r, i) => { labels += print(-80.9, ROWS[i] + 0.55, r, 1.6) + print(80.9, ROWS[i] + 0.55, r, 1.6); });
      const strips = `<path d="${holes.join("")}" fill="#3e3e3a"/>${labels}`;
      // the power rails: + outside, − inside, along both edges; a red line beside each +, a blue one beside each −
      const rh = []; for (const x of railX) for (const y of [-PLUS, -MINUS, MINUS, PLUS]) rh.push(sq(Pm, x, y));
      const line = (y, c) => `<path d="${K.pathOf([top(-77, y), top(77, y)])}" stroke="${c}" stroke-width="${Math.max(0.5, 0.35 * G0(Pm)).toFixed(2)}" data-free=""/>`;
      const rails = `<path d="${rh.join("")}" fill="#3e3e3a"/>` + line(-25.3, "#c0392b") + line(-18.3, "#2b6cc4") + line(25.3, "#c0392b") + line(18.3, "#2b6cc4") +
        [-1, 1].map((s) => print(-79.6, s * PLUS + 0.6, "+", 2.4, "#c0392b") + print(-79.6, s * MINUS + 0.6, "−", 2.4, "#2b6cc4") + print(79.6, s * PLUS + 0.6, "+", 2.4, "#c0392b") + print(79.6, s * MINUS + 0.6, "−", 2.4, "#2b6cc4")).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, H, Pm)}"/>` +
        `<g data-name="board">${body}${channel}${grooves}</g><g data-name="strips">${strips}</g><g data-name="rails">${rails}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, -HY, H + 8], "breadboard", "#556") + LAB.word(Pm, lab, [-60, HY, H], "power rails", "#556", { dy: 16 });
      g.anchors = { top: [0, 0, H / 10], plus: [railX[0] / 10, -PLUS / 10, H / 10], minus: [railX[0] / 10, -MINUS / 10, H / 10], a1: [colX(0) / 10, ROWS[0] / 10, H / 10], j1: [colX(0) / 10, ROWS[9] / 10, H / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; window.B26.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "breadboard · 830 holes at 2.54 mm · each column of five (a–e, f–j) is joined inside; each rail is joined along its length";
      window.B26.light(w, g, lit);
      return g;
    },
  });
  // the board scale of the mm camera (px per mm), for stroke widths that stay printed-thin
  function G0(Pm) { return window.G.scaleOf(Pm); }
})();
