// "icecube cx cy k n=1..5 s=1..3 melt=0..1 lab=0 lit=ice" — a PART (PARTS.md, batch 5): a few ice cubes lying on a
// surface (a beaker's floor: place it at= a glassbeaker's `inside`), as statechange.js heaps them: four on the floor at
// odd angles and the fifth resting on top. s = the cube's edge (cm, about 1.5 for a freezer tray); each cube is
// pale blue-white with a frosted top, a glossy streak and a cloud of trapped air in its middle. melt 0 → 1 shrinks
// them (each keeps its shape, its volume going as 1 − melt) until they are gone; the top cube settles as the others
// shrink. set({ melt }) eases it. The melt water belongs to the beaker (its fill).
(() => {
  const K = window.K;
  const ICE = ISO.tint("#f4fbff", ["#bcd8ea", "#cbe2f0", "#dbebf5", "#e8f3fa"], "#5d8fb0");
  // [x, y, z, turn] for a 1.5 cm cube, in cm (statechange's CUBES)
  const CUBES = [[-1.1, -0.9, 0, 0.3], [1.1, -0.8, 0, 1.1], [-0.3, 1.1, 0, 2.0], [1.4, 0.9, 0, 0.7], [0.1, -0.1, 1.3, 1.6]];

  ISO.add({
    name: "icecube", title: "Ice cubes (part)", compare: null,
    about: "A few ice cubes lying on a beaker's floor (or any surface), about 1.5 cm each; they shrink as they melt until they are gone. anchors: top",
    line: "icecube cx cy k n=1..5 s=1..3 melt=0..1 lab=0 lit=ice",
    demo: { line: "icecube 480 330 60 n=5 lab=1", script: [{ set: {}, hold: 1 }, { set: { melt: 0.5, lit: "ice" }, hold: "settle" }, { set: { melt: 0.9, lit: "" }, hold: "settle" }, { set: { melt: 1 }, hold: "settle" }, { set: { melt: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const n = Math.round(ISO.clamp(ISO.num(o, "n", 5), 1, 5)), S0 = ISO.clamp(ISO.num(o, "s", 1.5), 1, 3), f0 = S0 / 1.5;
      // with fewer than five, the floor ones go first (the top one needs at least two under it)
      const set = (n >= 5 ? CUBES : CUBES.slice(0, n)).map(([x, y, z, a]) => [x * f0, y * f0, z * f0, a]);
      const st = { m: ISO.clamp(ISO.num(o, "melt", 0), 0, 1) }, want = { m: st.m };
      let lit = o.lit || "";
      const cube = ([x, y, z, a], s) => {
        const c = Math.cos(a), sn = Math.sin(a), h = s / 2, zc = z + h;
        const at = (u, v, w) => [x + u * c - v * sn, y + u * sn + v * c, zc + w];
        // the body, then on its top a frosted inset and a glossy streak, and trapped air (dots) seen through the near side
        const top = [[-h * 0.7, -h * 0.7], [h * 0.7, -h * 0.7], [h * 0.7, h * 0.7], [-h * 0.7, h * 0.7]].map(([u, v]) => K.iso(at(u, v, h + 0.005), P));
        const streak = [[-h * 0.6, h * 0.25], [h * 0.2, -h * 0.55], [h * 0.35, -h * 0.4], [-h * 0.45, h * 0.4]].map(([u, v]) => K.iso(at(u, v, h + 0.01), P));
        const air = [[0, 0, -0.1], [0.15, -0.1, 0.05], [-0.12, 0.08, 0.1], [0.05, 0.14, -0.15]].map(([u, v, w]) => K.iso(at(u * h * 2, v * h * 2, w * h * 2), P));
        return ISO.tinted(ICE, ISO.box(at, P, [-h, h], [-h, h], [-h, h], "mid")) +
          `<path d="${K.pathOf(top, true)}" fill="#ffffff" fill-opacity=".45"/><path d="${K.pathOf(streak, true)}" fill="#ffffff" fill-opacity=".8"/>` +
          (s > 0.5 ? K.dotsSvg(air, { size: Math.max(0.3, s * 0.12) }).replace('class="iso-dots"', 'class="iso-dots" opacity=".35"') : "");
      };
      const svgOf = (m) => {
        if (m >= 0.995) return "";
        const f = Math.cbrt(1 - m), s = S0 * f;
        return set.map(([x, y, z, a]) => [x, y, z * f, a]).sort((p, q) => p[2] - q[2] || K.depthOf([p[0], p[1], 0], P) - K.depthOf([q[0], q[1], 0], P)).map((c) => cube(c, s)).join("");
      };
      g.innerHTML = `<g data-name="ice" data-part="ice"></g><g data-part="words"></g>`;
      const topZ = () => (n >= 5 ? set[4][2] + S0 : S0) / 1;
      g.anchors = { top: [0, 0, +topZ().toFixed(3)] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.m * 60) / 60;
        w.rebuild(el.ice, String(q), () => svgOf(q));
        if (lab) w.rebuild(el.words, q < 0.995 ? "i" : "", () => q < 0.995 ? LAB.word(P, lab, [0, 0, topZ() + 0.4], "ice", "#2f6fae") : "");
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.melt !== undefined && Number.isFinite(+p.melt)) want.m = ISO.clamp(+p.melt, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.m = ISO.follow(st.m, want.m, dt, 0.7, ISO.still()); draw(); return st.m !== want.m; };
      g.readout = () => {
        const v = set.length * (S0 ** 3) * (1 - st.m);
        return st.m >= 0.995 ? "the ice has all melted" : `${set.length} ice cube${set.length > 1 ? "s" : ""}, ${(S0 * Math.cbrt(1 - st.m)).toFixed(1)} cm each · about ${v.toFixed(1)} cm³ (${(v * 0.917).toFixed(1)} g) of ice left`;
      };
      draw();
      return g;
    },
  });
})();
