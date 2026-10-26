// "barmagnet cx cy k len=5..20 aim=x|y lab=0 lit=magnet|north|south" — a PART (PARTS.md): a school steel bar magnet
// lying on the bench, its origin the surface point under its middle, its length along aim (x or y), north toward +aim.
// Two painted halves (red north, blue south) with chamfered edges, the seam where the paint meets, N and S stamped on
// the top and on the near side, a stamped arrow on the north half. A 10 cm magnet is 2.2 × 1 cm. Anchors n and s: the
// middle of each end face (where field lines leave and enter). set({ len, aim }) rebuilds it. World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  // the same red and blue as the magnet recipe (magnet.js), so a lesson's magnets match
  const RED = ISO.tint("#f9dcd7", ["#e07a6c", "#e88e82", "#efa398", "#f4b8ae"], "#8a1d16"), BLUE = ISO.tint("#dde8f6", ["#7d9fcf", "#91afd8", "#a6bfe0", "#bacde8"], "#1f4f8f");
  const sizeOf = (len) => { const w = ISO.clamp(0.16 * len + 0.6, 1.4, 3.2); return { w, h: w * 0.45, len }; };

  function magnetSvg(P, len, aim, lab) {
    const { w, h } = sizeOf(len), half = len / 2, Y = aim === "y";
    // world point from (s along the magnet, t across it, z up)
    const at = (s, t, z) => (Y ? [-t, s, z] : [s, t, z]);
    const plan = (s0, s1) => (Y ? { x: -w / 2, y: s0, w, d: s1 - s0, r: 0.12 } : { x: s0, y: -w / 2, w: s1 - s0, d: w, r: 0.12 });
    const bevel = Math.min(0.08, h * 0.15);
    const halves = [
      { name: "south", tint: BLUE, s: [-half, 0], letter: "S" },
      { name: "north", tint: RED, s: [0, half], letter: "N" },
    ].sort((a, b) => K.depthOf(at((a.s[0] + a.s[1]) / 2, 0, 0), P) - K.depthOf(at((b.s[0] + b.s[1]) / 2, 0, 0), P));
    const out = [`<path class="iso-halo" d="${K.haloOf(plan(-half, half), 0, h, P)}"/>`, `<g data-name="magnet">`];
    // printed / stamped marks: letters lie on the top (reading along the magnet) and on the near side face
    const along = Y ? [0, 1, 0] : [1, 0, 0], away = Y ? [1, 0, 0] : [0, -1, 0];
    const size = Math.min(w * 0.62, half * 0.5);
    const near = Y ? { p: (s) => [w / 2 + 0.01, s, h * 0.25], u: [0, -1, 0] } : { p: (s) => [s, w / 2 + 0.01, h * 0.25], u: [1, 0, 0] };
    for (const hf of halves) {
      const mid = (hf.s[0] + hf.s[1]) / 2, sl = hf.s[1] - hf.s[0];
      const ink = hf.name === "north" ? "#7a1a12" : "#173f78";
      const marks = [LAB.faceText(P, at(mid + (hf.name === "north" ? 1 : -1) * sl * 0.12, size * 0.36, h + 0.01), along, hf.letter, size, ink, away)];
      // the near side: the letter again, smaller, as a stamped side mark
      marks.push(LAB.faceText(P, near.p(mid), near.u, hf.letter, h * 0.62, ink, [0, 0, 1]));
      if (hf.name === "north") {
        // a stamped arrow pointing to the north end, on the top between the seam and the letter
        const a0 = sl * 0.18, a1 = sl * 0.42, aw = w * 0.13, z = h + 0.01;
        const pts = [[a0, -aw * 0.45], [a1 - aw, -aw * 0.45], [a1 - aw, -aw], [a1, 0], [a1 - aw, aw], [a1 - aw, aw * 0.45], [a0, aw * 0.45]].map(([s, t]) => K.iso(at(s, t, z), P));
        marks.push(`<path d="${K.pathOf(pts, true)}" fill="${ink}" fill-opacity=".75"/>`);
      }
      out.push(`<g data-name="${hf.name}">${ISO.tinted(hf.tint, S(K.slabOf(plan(hf.s[0], hf.s[1]), 0, h, P, 3, bevel), { tone: "mid" }) + marks.join(""))}</g>`);
    }
    // the seam where the two paints meet, up the side we see and across the top (it ends on the bench and the far edge)
    const tn = Y ? -w / 2 + 0.002 : w / 2 - 0.002;   // the side we see
    const seam = [at(0, tn, 0), at(0, tn, h), at(0, -tn, h)].map((p) => K.iso(p, P));
    out.push(`<path d="${K.pathOf(seam)}" fill="none" stroke="#3a2d3a" stroke-opacity=".55" stroke-width="0.7"/>`, "</g>");
    if (lab) out.push(CIRC.word(P, at(half, 0, h), "N, north pole"), CIRC.word(P, at(-half, 0, h + w * 0.6), "S, south pole"));
    const fix = (p) => p.map((v) => +v.toFixed(3));
    return { svg: out.join(""), anchors: { n: fix(at(half, 0, h / 2)), s: fix(at(-half, 0, h / 2)) } };
  }

  ISO.add({
    name: "barmagnet", title: "Bar magnet (part)", compare: null,
    about: "A steel bar magnet lying on the bench, red north half and blue south half with N and S stamped on it; lies along x or y with north toward +x (or +y). anchors: n s",
    line: "barmagnet cx cy k len=5..20 aim=x|y lab=0 lit=magnet|north|south",
    demo: { line: "barmagnet 480 300 54 len=10", script: [{ set: {}, hold: 1 }, { set: { lit: "north" }, hold: 1.2 }, { set: { lit: "south" }, hold: 1.2 }, { set: { aim: "y", lit: "" }, hold: 1.2 }, { set: { len: 7.5, aim: "x", lit: "magnet" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { len: ISO.clamp(ISO.num(o, "len", 10), 5, 20), aim: o.aim === "y" ? "y" : "x", lit: o.lit || "" };
      const build = () => { const m = magnetSvg(P, st.len, st.aim, lab); g.innerHTML = m.svg; g.anchors = m.anchors; CIRC.lighter(g)(st.lit); };
      g.set = (p) => {
        let again = false;
        if (p.len !== undefined && Number.isFinite(+p.len) && +p.len !== st.len) { st.len = ISO.clamp(+p.len, 5, 20); again = true; }
        if ((p.aim === "x" || p.aim === "y") && p.aim !== st.aim) { st.aim = p.aim; again = true; }
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build(); else CIRC.lighter(g)(st.lit);
      };
      g.update = () => false;
      g.readout = () => { const { w, h } = sizeOf(st.len); return `bar magnet ${+st.len.toFixed(1)} × ${w.toFixed(1)} × ${h.toFixed(1)} cm · north end toward +${st.aim} · field lines leave N and enter S`; };
      build();
      return g;
    },
  });
})();
