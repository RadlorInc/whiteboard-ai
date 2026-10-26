// "tripod cx cy k gauze=0|1 lab=0 lit=ring|legs|gauze" — a PART (PARTS.md, batch 2): a steel tripod 20 cm tall
// standing on the bench, its origin the bench point under its middle. A flat steel ring 12 cm across on three round
// legs (6 mm rod) welded to its outside and splayed out to small pads; on top (gauze=1) a 15 cm square of wire gauze
// with rolled edges and its round ceramic centre, which spreads a flame's heat under a beaker. `top` = the gauze's
// middle (the ring's when gauze=0). One leg points almost at the viewer, so a burner placed at the tripod's origin
// and drawn before the tripod sits behind that leg, clear of the other two, with its flame under the gauze.
// Built in mm (LAB's units) with Pm = ISO.mm(P), following LAB.tripod (_lab.js); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const Z = 200, R = 60, BAND = 4, LEG = 3, FOOT = 82, HS = 75, CER = 45;
  const MESH = ISO.tint("#c9ccd0", ["#8d9096", "#9a9da3", "#a9acb1", "#b8bbbf"], "#4a4e55");
  const CERAMIC = ISO.tint("#f3f0e9", ["#cfc9bd", "#d9d4c9", "#e3dfd5", "#ece9e1"], "#8a8478");

  ISO.add({
    name: "tripod", title: "Tripod and gauze (part)", compare: null,
    about: "A steel tripod 20 cm tall with a wire gauze and its ceramic centre on top, to stand a beaker over a Bunsen burner (draw the burner first, at the tripod's origin). anchors: top",
    line: "tripod cx cy k gauze=0|1 lab=0 lit=ring|legs|gauze",
    demo: { line: "tripod 480 470 15 gauze=1 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "legs" }, hold: 1.4 }, { set: { gauze: 0, lit: "ring" }, hold: 1.4 }, { set: { gauze: 1, lit: "gauze" }, hold: 1.4 }] },
    make([cx = 480, cy = 470, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const Fz = LAB.Z([0, 0, 0]), view = G.angleToward(Fz, G.viewOf(Pm));
      let gauze = ISO.num(o, "gauze", 1) >= 0.5, lit = o.lit || "";
      // a leg: a rod from its weld on the ring's outside down to a pad on the bench, with the weld bead at the top
      const leg = (a) => {
        const top = G.pointOf(Fz, Z - BAND / 2, R + LEG * 0.8, a), foot = G.pointOf(Fz, 2, FOOT, a);
        const d = foot.map((v, i) => v - top[i]), len = Math.hypot(...d);
        return S(K.cylinder(foot[0], foot[1], LEG + 1.6, 0, 2, Pm, 20, 0.4), { tone: "lo" }) +
          S(G.disc(0, len, LEG, LAB.A(top, d.map((v) => v / len)), Pm), { tone: "mid" }) + S(G.sphereOf(top, LEG + 0.6, Pm), { tone: "mid" });
      };
      const back = [], front = [];
      [0, 1, 2].forEach((i) => { const a = view + (15 * Math.PI) / 180 + (i * 2 * Math.PI) / 3; (Math.cos(a - view) > 0 ? front : back).push(leg(a)); });
      // the ring: a flat steel band, its seam where the strip was welded closed, and the legs' weld marks on top
      // the far half of the ring's inside face, seen through the hole (drawn first; the band's top covers its edge)
      const wall = [], rr = R - BAND - 0.05;
      for (let i = 0; i <= 32; i++) wall.push(K.iso(G.pointOf(Fz, Z, rr, view + Math.PI / 2 + (Math.PI * i) / 32), Pm));
      for (let i = 32; i >= 0; i--) wall.push(K.iso(G.pointOf(Fz, Z - BAND, rr, view + Math.PI / 2 + (Math.PI * i) / 32), Pm));
      const inner = `<path d="${K.pathOf(wall, true)}" fill="#b6b9be" stroke="#8d9096" stroke-width="0.5" stroke-linejoin="round"/>`;
      const ring = inner + S(G.ringBand(Z - BAND, Z, R - BAND, R, Fz, Pm, { hole: [Z, R - BAND] }), { tone: "mid" }) + L(G.arcOf(Fz, Z - BAND / 2, R + 0.02, Pm, { trim: 0 }), { tone: "faint" });
      // the gauze: a mesh sheet, rolled edges round it (the grid's wires end on them), the ceramic disc in the middle
      const gz = [S(K.slabOf({ x: -HS, y: -HS, w: 2 * HS, d: 2 * HS, r: 2 }, Z, 0.8, Pm, 2), { tone: "lo" })];
      const grid = [];
      for (let q = -HS + 9; q <= HS - 8; q += 6) grid.push(K.lineOnTop([q, -HS + 4], [q, HS - 2], Z + 0.8, Pm), K.lineOnTop([-HS + 4, q], [HS - 2, q], Z + 0.8, Pm));
      gz.push(L(grid.join(""), { tone: "lo" }));
      for (const [x, y, w, d] of [[-HS, -HS, 2 * HS, 4], [-HS, HS - 4, 2 * HS, 4], [-HS, -HS + 4, 4, 2 * HS - 8], [HS - 4, -HS + 4, 4, 2 * HS - 8]]) gz.push(ISO.wbox(Pm, [x, x + w], [y, y + d], [Z + 0.8, Z + 1.8], "mid"));
      const cer = [S(K.cylinder(0, 0, CER, Z + 0.8, 1.4, Pm, 56, 0.5), { tone: "lo" })];
      let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const flecks = []; for (let i = 0; i < 70; i++) { const r = CER * 0.92 * Math.sqrt(rnd()), a = rnd() * Math.PI * 2; flecks.push(K.iso([r * Math.cos(a), r * Math.sin(a), Z + 2.21], Pm)); }
      cer.push(D(flecks, { size: 0.35, tone: "faint" }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -FOOT - 6, y: -FOOT - 6, w: 2 * FOOT + 12, d: 2 * FOOT + 12, r: FOOT }, 0, 4, Pm)}"/>` +
        `<g data-name="legs">${back.join("")}</g><g data-name="ring" fill-rule="evenodd">${ring}</g><g data-name="legs">${front.join("")}</g>` +
        `<g data-name="gauze" data-part="gauze">${ISO.tinted(MESH, gz.join(""))}${ISO.tinted(CERAMIC, cer.join(""))}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.shown(el.gauze, gauze);
        g.anchors = { top: [0, 0, (gauze ? Z + 2.2 : Z) / 10] };
        if (lab) w.rebuild(el.words, String(gauze), () => (gauze ? LAB.word(Pm, lab, [HS, -HS, Z + 4], "gauze", "#556", { anchor: "start" }) + LAB.word(Pm, lab, [0, 0, Z + 30], "ceramic centre", "#556") : LAB.word(Pm, lab, [R, -R, Z + 4], "ring", "#556", { anchor: "start" })) +
          LAB.word(Pm, lab, G.pointOf(Fz, 60, FOOT - 6, view - 1.6), "leg", "#556", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.gauze !== undefined) gauze = +p.gauze >= 0.5;
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => `tripod · ring 12 cm across at 20 cm${gauze ? " · wire gauze 15 cm square with a ceramic centre" : " · no gauze"}`;
      draw();
      return g;
    },
  });
})();
