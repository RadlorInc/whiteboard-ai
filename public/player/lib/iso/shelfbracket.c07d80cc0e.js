// "shelfbracket cx cy k lab=0 lit=bracket|screws" — a PART (PARTS.md): a steel L shelf bracket, its origin the top-back
// corner of the L on the wall face. 3 mm zinc-plated steel, 3.2 cm wide: a 20 cm wall leg flat on the wall with two
// countersunk screw holes (anchors hole1 at 5 cm down, hole2 at 15 cm down, on the wall face: a `woodscrew aim=wall`
// placed at each goes through its hole), a 15 cm shelf leg with two smaller holes for screws up into the shelf, a
// filleted bend, a small corner web and a diagonal flat-bar brace welded between the legs. A shelf board's underside
// back edge sits on `top` (the origin). A pair 60 cm apart into studs holds about 40 kg. World units: 1 = 1 cm.
(() => {
  const K = window.K, D = (p, s) => K.dotsSvg(p, s);
  const W = 1.6, T = 0.3, HL = 20, DL = 15, FIL = 0.5;
  const INK = "#3c3f45", DARK = "#8d9096", LIGHT = "#dcdde0", FACE = "#c4c7cb";
  const HOLES = [-5, -15], UP = [4.5, 12.5];
  const px = (P, pts, x0, x1) => ISO.prismX(P, pts, x0, x1, [DARK, LIGHT], FACE, INK);

  function bracketSvg(P) {
    const out = [];
    // the wall leg with the inside of the bend filleted
    const fillet = ISO.arc(T + FIL, -T - FIL, FIL, Math.PI / 2, Math.PI, 6).map(([y, z]) => [y, z]);
    out.push(px(P, [[0, 0], [T + FIL, 0], [T + FIL, -T], ...fillet.slice(1, -1), [T, -T - FIL], [T, -HL], [0, -HL]], -W, W));
    // the corner web and the diagonal brace (a 1.6 × 0.3 cm flat bar), welded to both legs
    out.push(px(P, [[T, -T], [T + 2.6, -T], [T, -T - 2.6]], -0.15, 0.15));
    // the brace: a bar 0.3 thick along a → b, its ends cut square to the wall leg (y = T) and the shelf leg (z = −T)
    const a = [T, -13.6], b = [9.6, -T], len = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], nrm = [-d[1], d[0]];
    const side = (h) => { const o = [a[0] + nrm[0] * h, a[1] + nrm[1] * h]; return [[T, o[1] + (d[1] / d[0]) * (T - o[0])], [o[0] + (d[0] / d[1]) * (-T - o[1]), -T]]; };
    const [l1, l2] = [side(0.15), side(-0.15)];
    out.push(px(P, [l1[0], l1[1], l2[1], l2[0]], -0.8, 0.8));
    // weld beads at the brace's ends
    out.push(`<g style="--anatomy-dot:#6d7076">${D([K.iso([0.81, a[0] + 0.15, a[1]], P), K.iso([0.81, b[0], b[1] - 0.15], P)], { size: 0.5 })}</g>`);
    // the shelf leg on top
    out.push(px(P, [[0, 0], [DL, 0], [DL, -T], [0, -T]], -W, W));
    return out.join("");
  }
  // the screw holes: countersunk in the wall leg's face, plain in the shelf leg's top
  function holesSvg(P) {
    const out = [];
    for (const z of HOLES) {
      out.push(`<path d="${K.sideRing([0, T + 0.002, z], 0.46, "y", P, 28)}" fill="#a9acb2" stroke="${INK}" stroke-width="0.5"/>`);
      out.push(`<path d="${K.sideRing([0, T + 0.004, z], 0.27, "y", P, 20)}" fill="#2a2c30" stroke="${INK}" stroke-width="0.4"/>`);
    }
    for (const y of UP) out.push(`<path d="${K.ring(0, y, 0.22, 0.002, P, 18)}" fill="#2a2c30" stroke="${INK}" stroke-width="0.4"/>`);
    return out.join("");
  }

  ISO.add({
    name: "shelfbracket", title: "Shelf bracket (part)", compare: null,
    about: "A steel L shelf bracket 20 × 15 cm: wall leg with two countersunk screw holes, shelf leg with two more, a welded diagonal brace; a shelf board sits on its top. anchors: top hole1 hole2",
    line: "shelfbracket cx cy k lab=0 lit=bracket|screws",
    demo: { line: "shelfbracket 470 140 16", script: [{ set: {}, hold: 1 }, { set: { lit: "screws" }, hold: 1.5 }, { set: { lit: "bracket" }, hold: 1.5 }] },
    make([cx = 480, cy = 200, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = `<g data-name="bracket">${bracketSvg(P)}</g><g data-name="screws">${holesSvg(P)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([W, DL, 0], P), "shelf bracket", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="6" x="');
      g.anchors = { top: [0, 0, 0], hole1: [0, 0, HOLES[0]], hole2: [0, 0, HOLES[1]] };
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => w.light(parts, parts.filter((p) => p.dataset.name === lit));
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
      g.update = () => false;
      g.readout = () => "steel shelf bracket · 20 cm wall leg, 15 cm shelf leg · two screws into a stud · a pair holds about 40 kg";
      draw();
      return g;
    },
  });
})();
