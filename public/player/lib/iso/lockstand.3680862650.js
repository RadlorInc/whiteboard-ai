// "lockstand cx cy k lab=0 lit=board|plate|clamps" — a PART (PARTS.md, batch 6): the display stand that holds a cut-open
// padlock, from padlock.js: a wooden board 12 × 8 cm on four felt feet, an upright plate 10 cm wide and 13.8 cm
// tall screwed to its back edge, and two steel clamp blocks standing out of the plate that grip the lock body's two
// sides. Origin: the floor point under the board's middle. The lock's place is anchor lock (7.8 cm up, so the key's
// bow hangs free under it): `pinpadlock … at=stand.lock clamp=1` (clamp=1 makes the lock draw the near clamp over
// itself, as it is in front of the lock's side). Static. anchors: lock
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const L = B36.LOCK, BX = 6, BY0 = -4, BY1 = 4, FT = 0.3, BT = 1.0, PY = [L.CY0 - 0.6, L.CY0], PX = 5, PH = 13.8;
  ISO.add({
    name: "lockstand", title: "Lock display stand (part)", compare: null,
    about: "A display stand for a cut-open lock: wooden board, upright plate and two steel clamp blocks that grip the lock body's sides; the lock goes at anchor lock with clamp=1. anchors: lock",
    line: "lockstand cx cy k lab=0 lit=board|plate|clamps",
    demo: { line: "lockstand 480 380 26 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "clamps" }, hold: 1.2 }, { set: { lit: "plate" }, hold: 1 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const plan = { x: -BX, y: BY0, w: 2 * BX, d: BY1 - BY0, r: 0.4 }, top = FT + BT, out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf(plan, 0, PH, P)}"/>`);
      // felt feet, the board with a routed edge line and its four screw heads (two hold the plate from below)
      const feet = K.corners(plan, 1).sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
      out.push(`<g data-name="board">${ISO.tinted(ISO.T.rubber, feet.map(([x, y]) => S(K.cylinder(x, y, 0.6, 0, FT, P, 12), { tone: "lo" })).join(""))}`);
      out.push(ISO.tinted(ISO.T.wood, S(K.slabOf(plan, FT, BT, P, 3, 0.15), { tone: "mid", inner: K.lineSvg(K.sideSeam(plan, FT + BT * 0.5, P, 3), { tone: "faint" }) })));
      out.push(K.lineSvg(K.planOutline(K.insetPlan(plan, 0.6), top, P, 3), { tone: "faint" }));
      out.push(D([[-BX + 1.2, 3], [BX - 1.2, 3]].map(([x, y]) => K.iso([x, y, top], P)), { size: 0.5 }), "</g>");
      // the upright plate on the board's back half, with four screws on its front face
      out.push(`<g data-name="plate">${ISO.tinted(ISO.T.wood, ISO.wbox(P, [-PX, PX], PY, [top, PH], "mid"))}`);
      out.push(D([[-PX + 0.8, top + 1], [PX - 0.8, top + 1], [-PX + 0.8, PH - 0.8], [PX - 0.8, PH - 0.8]].map(([x, z]) => K.iso([x, PY[1] + 0.01, z], P)), { size: 0.5 }), "</g>");
      // the two clamp blocks gripping the lock body's sides (the near one again by the lock when it is placed)
      out.push(`<g data-name="clamps">${B36.clamp(P, -1)}${B36.clamp(P, 1)}</g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      if (lab) g.querySelector('[data-part="words"]').innerHTML = B36.word(P, [L.HW + L.CW, L.Y, L.Z0 + L.CZ[1]], "clamp blocks") + B36.word(P, [BX, BY1, top], "stand", { dy: 14 });
      g.anchors = { lock: [0, L.Y, L.Z0] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B36.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "lock display stand · 12 × 8 cm board, the lock held 7.8 cm up between two clamp blocks";
      B36.light(w, g, lit);
      return g;
    },
  });
})();
