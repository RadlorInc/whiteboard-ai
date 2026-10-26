// "serverrack cx cy k lab=0 lit=posts|nearpost|frame|plinth|top|feet" — a PART (batch 6): an open 19-inch server rack,
// 60 cm wide, 100 cm deep, 200 cm tall, 42U (1U = 4.445 cm). Its origin is the floor point under its middle; its front
// faces the room (+y). Four posts with square mounting holes, three per U, 46.5 cm apart across (the 19-inch
// pattern), side beams, a plinth on four levelling feet, a top panel with a cable slot and vent slots. Anchor `front`
// = the middle of the front mounting face at the bottom of U1: `server1u … at=rack.front az=<(U − 1) × 4.445>` racks a
// unit. The near front post's outer part is its own name (`nearpost`): place a second `serverrack … only=nearpost`
// after the units so that post covers their sides as it should. Reused from server.js (its rack). Static.
(() => {
  const K = window.K;
  const F = 480, RX = -480, PD = 40, Y0 = 225, Y1 = 300, Z0 = 100, NU = 42, U = 44.45, TOP = Z0 + NU * U + 8, ZT = 2000;
  ISO.add({
    name: "serverrack", title: "Server rack (part)", compare: null,
    about: "An open 19-inch server rack, 42U: four posts with mounting holes every U, side beams, a plinth on four feet and a top panel; units go in at its front anchor (az = (U − 1) × 4.445 cm). A second copy with only=nearpost placed after the units redraws the near front post over them. anchors: front top",
    line: "serverrack cx cy k lab=0 lit=posts|nearpost|frame|plinth|top|feet",
    demo: { line: "serverrack 470 490 2.2", script: [{ set: {}, hold: 1.2 }, { set: { lit: "posts" }, hold: 1.4 }, { set: { lit: "frame" }, hold: 1.2 }, { set: { lit: "top" }, hold: 1.2 }, { set: { lit: "feet" }, hold: 1.2 }] },
    make([cx = 480, cy = 480, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B38, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", V = B.view(P), box = V.box, out = [];
      const ys = (s, a, b) => (s > 0 ? [a, b] : [-b, -a]);
      // square cage-nut holes on a post's front face, three per U, on the 19-inch line (±232.5 mm)
      const holes = (x, s) => {
        const d = [];
        for (let u = 0; u < NU; u++) for (const dz of [6.35, 22.2, 38.1]) { const z = Z0 + u * U + dz; d.push(K.pathOf([[x + 0.1, s * 232.5 - 4.75, z - 4.75], [x + 0.1, s * 232.5 + 4.75, z - 4.75], [x + 0.1, s * 232.5 + 4.75, z + 4.75], [x + 0.1, s * 232.5 - 4.75, z + 4.75]].map(V.iso), true)); }
        return `<path d="${d.join("")}" fill="#2a2d31" stroke="none"/>`;
      };
      const post = (x, s, near) => {
        const inner = box([x - PD, x], ys(s, Y0, 241.5), [Z0, TOP], "mid", T.C.steel) + holes(x, s);
        const outer = box([x - PD, x], ys(s, 241.5, Y1), [Z0, TOP], "mid", T.C.dark);
        return `<g data-name="posts">${inner}</g>` + (near ? `<g data-name="nearpost">${outer}</g>` : `<g data-name="posts">${outer}</g>`);
      };
      const beams = (s) => `<g data-name="frame">${box([RX + PD, F - PD], ys(s, 265, Y1), [Z0, Z0 + 40], "mid", T.C.dark)}${box([RX + PD, F - PD], ys(s, 265, Y1), [TOP - 40, TOP], "mid", T.C.dark)}</g>`;
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -30, y: -50, w: 60, d: 100, r: 1 }, 0, 0.05, P)}"/>`);
      const feet = [[RX + 30, -265], [F - 30, -265], [RX + 30, 265], [F - 30, 265]].sort((a, b) => V.depth([...a, 0]) - V.depth([...b, 0]));
      out.push(`<g data-name="feet">${feet.map(([x, y]) => T.cyl(V.Pm, y, x, 22, 0, 12, "lo", T.C.rubber, 24) + T.cyl(V.Pm, y, x, 9, 12, 40, "mid", T.C.steel, 16) + T.cyl(V.Pm, y, x, 14, 40, 8, "hi", T.C.steel, 6)).join("")}</g>`);
      out.push(`<g data-name="plinth">${box([RX - 10, F + 10], [-Y1, Y1], [48, Z0], "lo", T.C.dark)}${V.fq(F + 10.05, -260, 260, 60, 88, "#2a2d31", "#16191d", 0.4)}</g>`);
      // rear posts, the rear cross rail at the bottom, side beams, front posts (the near one last)
      out.push(post(RX + PD, -1), post(RX + PD, 1), `<g data-name="frame">${box([RX, RX + PD], [-Y0, Y0], [Z0, Z0 + 40], "mid", T.C.dark)}</g>`, beams(-1), beams(1), post(F, -1), post(F, 1, true));
      // the top panel: a slab on the posts, a brush cable slot near the back and a row of vent slots
      const topFace = (x0, x1, y0, y1) => T.quad(V.Pm, [[y0, x0, ZT + 0.1], [y1, x0, ZT + 0.1], [y1, x1, ZT + 0.1], [y0, x1, ZT + 0.1]], "#2a2d31", "#16191d", 0.4);
      out.push(`<g data-name="top">${box([RX - 10, F + 10], [-Y1, Y1], [TOP, ZT], "mid", T.C.dark)}${topFace(-400, -340, -180, 180)}${Array.from({ length: 6 }, (_, i) => topFace(200 - i * 50, 230 - i * 50, -120, 120)).join("")}</g>`);
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(V.iso([F, Y1, 1400]), "19-inch rack, 42U", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="10" x="') + ISO.word(V.iso([F, -Y1, 700]), "mounting holes every U", "#444", { size: 13, anchor: "end" }).replace('x="', 'dx="-10" x="');
      g.anchors = { front: [0, F / 10, Z0 / 10], top: [0, 0, ZT / 10] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "19-inch rack · 42U of 4.445 cm · mounting holes 46.5 cm apart, 3 per U · 60 × 100 × 200 cm";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
