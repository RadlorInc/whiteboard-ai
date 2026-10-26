// "pcmouse cx cy k cable=0|1 lab=0 lit=shell|buttons|wheel|cable" — a PART (batch 6): a computer mouse on the desk,
// its origin its middle on the surface, its buttons pointing away from the user (−y, toward the monitor). A rounded
// shell 60 × 110 × 35 mm, highest over the palm, on a dark rubber skirt; the left and right buttons split down the
// middle, their back edge across the shell, the ribbed scroll wheel in its slot between them; cable=1 a cable leaves
// the front and runs off along the desk (cable=0 a wireless one, a small lamp instead). From computer.js (its mouse).
// Static. Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const A = 30, L = 55, ZB = 4, H = 35;
  // the outline: a rounded oval 60 × 110; over it the shell, a low nose at the buttons rising to its top over the palm
  const hw = (y) => A * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(y) / L, 2.5)), 0.4);
  const ridge = (y) => 22 + 13 * Math.exp(-(((y - 12) / 40) ** 2));
  const zOf = (x, y) => { const u = Math.min(1, Math.abs(x) / (hw(y) || 1e-6)), v = Math.min(1, Math.abs(y) / L); return ZB + (ridge(y) - ZB) * Math.cbrt(1 - u ** 3) * Math.pow(1 - v ** 6, 1 / 6); };
  const ring = (z) => Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2, y = L * Math.sin(a); return [Math.sign(Math.cos(a)) * hw(y), y, z]; });
  ISO.add({
    name: "pcmouse", title: "Computer mouse (part)", compare: null,
    about: "A computer mouse: rounded shell, two buttons, a scroll wheel between them, a cable or wireless; static. anchors: top front",
    line: "pcmouse cx cy k cable=0|1 lab=0 lit=shell|buttons|wheel|cable",
    demo: { line: "pcmouse 480 300 40 cable=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "buttons" }, hold: 1.4 }, { set: { lit: "wheel" }, hold: 1.4 }, { set: { lit: "cable" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", wired = o.cable !== "0";
      const on = (x, y, dz = 0.3) => [x, y, zOf(x, y) + dz], path = (pts) => K.pathOf(pts.map((p) => K.iso(p, Pm)));
      const skirt = B.shell(Pm, [...ring(0), ...ring(ZB)], ["#26282c", "#4a4d53"], "#0e0f11");
      const domePts = [];
      for (let i = 0; i <= 20; i++) for (let j = 0; j <= 10; j++) { const y = -L + (2 * L * i) / 20, x = hw(y) * (-1 + j / 5); domePts.push(on(x, y, 0)); }
      const dome = B.shell(Pm, domePts, ["#9aa0a8", "#f1f3f5"], "#3e434a");
      // the buttons: the split down the middle (in front of and behind the wheel) and their back edge across the shell
      const split = path([-54.8, -52, -48, -43].map((y) => on(0, y))) + path([-23, -19, -15, -11].map((y) => on(0, y)));
      const edge = path(Array.from({ length: 13 }, (_, i) => { const y0 = -11 + 6 * ((-1 + i / 6) ** 2), x = hw(y0) * (-1 + i / 6); return on(x, y0); }));
      // the wheel: a dark slot, the wheel standing in it, its ribs
      const slot = `<path d="${path([on(-5, -43), on(5, -43), on(5, -23), on(-5, -23)])}Z" fill="#1a1c1f" stroke="#0e0f11" stroke-width=".5"/>`;
      const z0 = zOf(0, -33), wheel = ISO.tinted(ISO.T.rubber, ISO.wbox(Pm, [-3.5, 3.5], [-40, -26], [z0 - 2, z0 + 1.4], "mid")) +
        K.lineSvg([-38, -35.5, -33, -30.5, -28].map((y) => K.pathOf([K.iso([3.5, y, z0 - 1.6], Pm), K.iso([3.5, y, z0 + 1.2], Pm)])).join(""), { tone: "faint", free: true });
      // the cable out of the front, off along the desk; or the wireless lamp on the back of the shell
      const cable = wired ? B.cable(Pm, [[0, -54, 9], [0, -60, 7], [2, -72, 2], [8, -100, 1.4], [20, -150, 1.4]], 1.8) : "";
      const lamp = wired ? "" : `<path d="${B.circle(Pm, on(0, 40, 0.4), [1, 0, 0], [0, 1, 0], 1.4, 12)}" fill="#3cc45a" stroke="#1d5f2c" stroke-width=".4"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -A, y: -L, w: 2 * A, d: 2 * L, r: 28 }, 0, H, Pm)}"/><g data-name="cable">${cable}</g>` +
        `<g data-name="shell">${skirt}${dome}${lamp}</g><g data-name="buttons"><path data-free d="${split + edge}" fill="none" stroke="#4f555d" stroke-width="1.1" stroke-linecap="round"/></g><g data-name="wheel">${slot}${wheel}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [A, 12, H], "mouse", "#556", { anchor: "start", dx: 10 });
      g.anchors = { top: [0, 1.2, H / 10], front: [0, -5.5, 0.9] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `computer mouse · two buttons and a scroll wheel · ${wired ? "on a cable" : "wireless"}`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
