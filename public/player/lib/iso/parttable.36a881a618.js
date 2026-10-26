// "parttable cx cy k mark=0|1 lab=0 lit=top|legs|rails|mark" — a PART (PARTS.md, batch 6): the small steel work stand of
// a robot cell, 52 × 52 cm and 75 cm tall, origin the floor point under its middle. A 4 mm steel top plate on a
// welded angle frame, four square-tube legs on levelling feet, cross rails on all four sides 18 cm up, and on the top
// a yellow painted square (mark=1) showing where the part is put down (anchor top: its middle). Built from the robot
// scene's tables, made the real height. Static. anchors: top
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const HW = 26, TT = 75, LG = 21, LS = 2, RZ = 18, PL = 0.4;
  const steel = (svg) => ISO.tinted(ISO.T.steel, svg), dark = ISO.tint("#7c8087", ["#4a4e55", "#555960", "#60646b", "#6b6f76"], "#25282c");
  ISO.add({
    name: "parttable", title: "Steel work stand (part)", compare: null,
    about: "A small steel work stand 52 × 52 × 75 cm: square top on four legs with cross rails and levelling feet, a yellow square marked where the part goes. anchors: top",
    line: "parttable cx cy k mark=0|1 lab=0 lit=top|legs|rails|mark",
    demo: { line: "parttable 480 450 4.5 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "mark" }, hold: 1.2 }, { set: { lit: "rails" }, hold: 1 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 450, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", mark = o.mark !== "0";
      const legs = [[-LG, -LG], [LG, -LG], [-LG, LG], [LG, LG]].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
      const leg = ([x, y]) => ISO.tinted(dark, S(K.cylinder(x, y, 2.2, 0, 0.8, P, 14), { tone: "lo" })) + steel(S(K.cylinder(x, y, 0.6, 0.8, 1.6, P, 8), { tone: "mid" })) +
        steel(ISO.wbox(P, [x - LS / 2, x + LS / 2], [y - LS / 2, y + LS / 2], [2.4, TT - 3.6], "mid")) + ISO.tinted(dark, ISO.wbox(P, [x - 1.6, x + 1.6], [y - 1.6, y + 1.6], [1.6, 2.4], "lo"));
      // rails between the legs on each side, the far two drawn before the near legs
      const railX = (y) => steel(ISO.wbox(P, [-LG + LS / 2, LG - LS / 2], [y - 0.75, y + 0.75], [RZ, RZ + 3], "mid"));
      const railY = (x) => steel(ISO.wbox(P, [x - 0.75, x + 0.75], [-LG + LS / 2, LG - LS / 2], [RZ, RZ + 3], "mid"));
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HW, y: -HW, w: 2 * HW, d: 2 * HW, r: 1 }, 0, TT, P)}"/>`];
      // far leg, the two far rails, the side legs, the two near rails, the near leg
      out.push(`<g data-name="legs">${leg(legs[0])}</g><g data-name="rails">${railX(-LG)}${railY(-LG)}</g>`);
      out.push(`<g data-name="legs">${leg(legs[1])}${leg(legs[2])}</g><g data-name="rails">${railX(LG)}${railY(LG)}</g><g data-name="legs">${leg(legs[3])}</g>`);
      // the frame under the top (angle iron round the edge) and the top plate with its four countersunk screws
      out.push(`<g data-name="top">${steel(ISO.wbox(P, [-HW + 1, HW - 1], [-HW + 1, HW - 1], [TT - 3.6, TT - PL], "lo"))}`);
      out.push(steel(S(K.slabOf({ x: -HW, y: -HW, w: 2 * HW, d: 2 * HW, r: 0.6 }, TT - PL, PL, P, 2, 0.1), { tone: "hi" })));
      out.push(D([[-LG, -LG], [LG, -LG], [-LG, LG], [LG, LG]].map(([x, y]) => K.iso([x, y, TT + 0.01], P)), { size: 0.5 }), "</g>");
      if (mark) {
        const sq = (r) => K.pathOf([[-r, -r], [r, -r], [r, r], [-r, r]].map(([x, y]) => K.iso([x, y, TT + 0.02], P)), true);
        out.push(`<g data-name="mark"><path d="${sq(16)}${sq(14.6)}" fill="#e8b400" fill-rule="evenodd" stroke="#8a6a00" stroke-width=".4"/></g>`);
      }
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      if (lab) g.querySelector('[data-part="words"]').innerHTML = B36.word(P, [HW, HW, TT], "work stand, 75 cm") + (mark ? B36.word(P, [0, 16, TT], "put-down mark", { dy: 16, anchor: "middle", dx: 0 }) : "");
      g.anchors = { top: [0, 0, TT] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B36.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "steel work stand · 52 × 52 cm top at 75 cm · holds about 150 kg";
      B36.light(w, g, lit);
      return g;
    },
  });
})();
