// "stepstool cx cy k lab=0 lit=treads|sides|feet" — a PART (PARTS.md): a two-step wooden step stool standing on the
// floor, its origin the floor point under its middle. Two plywood side panels cut as a staircase, a lower tread at
// 23 cm and a top tread at 45 cm screwed between them, a back brace, rubber feet, ribbed anti-slip strips on each
// tread and a hand hole in each side. It holds about 150 kg. World units: 1 = 1 cm (x along the wall, y into the room).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 19, T = 1.8, BACK = -16, FRONT = 22, MID = 6, Z1 = 23, Z2 = 45, TT = 2;
  const PLY = ISO.tint("#f3dfbd", ["#c99a5e", "#d4aa70", "#ddb983", "#e7c99a"], "#6e4a1e");
  // the side panel's outline in (y, z): back edge up, the top tread's line, the step down, the lower tread, the front
  const SIDE = [[BACK, 0], [BACK + 6, 0], [BACK + 6, 6], [FRONT - 6, 6], [FRONT - 6, 0], [FRONT, 0], [FRONT, Z1], [MID, Z1], [MID, Z2], [BACK, Z2]];
  const side = (P, x0, x1) => ISO.prismX(P, SIDE, x0, x1, ["#c99a5e", "#ead2a8"], "#f0dcb6", "#6e4a1e");
  // a tread: a slab between the panels, three ribs of grip tape across it, each from panel to panel
  function treadSvg(P, y0, y1, z) {
    const out = [ISO.tinted(PLY, ISO.wbox(P, [-HX + T, HX - T], [y0, y1], [z - TT, z], "mid"))];
    const ribs = [0.3, 0.5, 0.7].map((f) => y0 + (y1 - y0) * f);
    out.push(`<path d="${ribs.map((y) => K.pathOf([K.iso([-HX + T, y, z + 0.01], P), K.iso([HX - T, y, z + 0.01], P)])).join("")}" stroke="#7a5a2e" stroke-width="0.6"/>`);
    out.push(ISO.tinted(ISO.T.rubber, ISO.wbox(P, [-HX + T + 2, HX - T - 2], [y1 - 2.2, y1 - 0.6], [z, z + 0.25], "lo")));
    return out.join("");
  }
  // the near panel's face: the hand hole (a closed slot), two screws at each tread, a small label plate
  function nearFace(P) {
    const x = HX + 0.01, at = (y, z) => K.iso([x, y, z], P), out = [];
    const hole = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, y = -5 + Math.cos(a) * 5.5, z = 36 + Math.sin(a) * 1.8; hole.push(at(y + (Math.cos(a) > 0 ? 2 : -2), z)); }
    out.push(`<path d="${K.pathOf(hole, true)}" fill="#5a4022" fill-opacity=".55" stroke="#6e4a1e" stroke-width="0.7"/>`);
    out.push(D([[BACK + 3, Z2 - 1], [MID - 3, Z2 - 1], [MID + 3, Z1 - 1], [FRONT - 3, Z1 - 1]].map(([y, z]) => at(y, z)), { size: 0.45 }));
    out.push(`<path d="${K.pathOf([at(-10, 14), at(-2, 14), at(-2, 18), at(-10, 18)], true)}" fill="#eef0f2" stroke="#55534c" stroke-width="0.5"/>`);
    out.push(`<path d="${[15, 16, 17].map((z) => K.pathOf([at(-9.2, z), at(-2.8, z)])).join("")}" stroke="#8a877f" stroke-width="0.35"/>`);
    return out.join("");
  }
  ISO.add({
    name: "stepstool", title: "Step stool (part)", compare: null,
    about: "A two-step wooden step stool, treads at 23 and 45 cm, to stand on to reach a shelf or a light; a part to place in any scene. anchors: top step",
    line: "stepstool cx cy k lab=0 lit=treads|sides|feet",
    demo: { line: "stepstool 480 400 6 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "treads" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const halo = { x: -HX - 2, y: BACK - 2, w: 2 * HX + 4, d: FRONT - BACK + 4, r: 2 };
      // painted back to front: halo, far panel, back brace, feet, top tread (further back), lower tread, near panel
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, -1, 1, P)}"/>` +
        `<g data-name="sides">${side(P, -HX, -HX + T)}</g>` +
        `<g data-name="feet">${ISO.tinted(ISO.T.rubber, [BACK + 0.5, FRONT - 3.5].map((y) => ISO.wbox(P, [-HX - 0.3, -HX + T + 0.3], [y, y + 3], [0, 0.8], "lo") + ISO.wbox(P, [HX - T - 0.3, HX + 0.3], [y, y + 3], [0, 0.8], "lo")).join(""))}</g>` +
        ISO.tinted(PLY, ISO.wbox(P, [-HX + T, HX - T], [BACK, BACK + 2], [8, 13], "lo")) +
        `<g data-name="treads">${treadSvg(P, BACK, MID, Z2)}${treadSvg(P, MID, FRONT, Z1)}</g>` +
        `<g data-name="sides">${side(P, HX - T, HX)}${nearFace(P)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([HX, FRONT, Z1 + 6], P), "step stool", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="6" x="');
      g.anchors = { top: [0, (BACK + MID) / 2, Z2], step: [0, (MID + FRONT) / 2, Z1] };   // where a foot (or a box) goes
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => w.light(parts, parts.filter((p) => p.dataset.name === lit));
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
      g.update = () => false;
      g.readout = () => "step stool · treads at 23 and 45 cm · holds about 150 kg";
      draw();
      return g;
    },
  });
})();
