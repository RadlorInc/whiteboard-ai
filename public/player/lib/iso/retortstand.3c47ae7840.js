// "retortstand cx cy k cz=10..55 reach=6..20 lab=0 lit=base|rod|boss|clamp" — a PART (PARTS.md, batch 2): a retort
// stand on the bench, its origin the bench point under the middle of its base. A painted cast-iron base 20 × 13 cm on
// four feet with a maker's plate, a 60 cm steel rod screwed into a boss at the base's back end, a boss head on the rod
// at height cz (its thumb screw behind), and a clamp arm reaching `reach` cm out along +y to two cork-lined jaws, closed
// by a wing nut. `clamp` = the middle between the jaws (a flask neck, a tube or a thermometer goes there); `top` = the
// rod's top. set({ cz }) slides the boss and clamp up or down the rod.
// Built in mm (LAB's units) with Pm = ISO.mm(P) from LAB.standBase, LAB.rod, LAB.boss and LAB.clamp; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const BASE = { x: -65, y: -100, w: 130, d: 200, r: 5 }, ROD = [0, -72], RR = 4, TOP = 600, JAW = 10;

  ISO.add({
    name: "retortstand", title: "Retort stand and clamp (part)", compare: null,
    about: "A retort stand: a cast base, a 60 cm rod, a boss head and a clamp that holds a flask neck, a tube or a thermometer at any height over the bench. anchors: clamp top",
    line: "retortstand cx cy k cz=10..55 reach=6..20 lab=0 lit=base|rod|boss|clamp",
    demo: { line: "retortstand 480 490 6.2 cz=30 reach=12 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "clamp" }, hold: 1.4 }, { set: { cz: 48 }, hold: "settle" }, { set: { cz: 18, lit: "boss" }, hold: "settle" }] },
    make([cx = 480, cy = 490, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const reach = ISO.clamp(ISO.num(o, "reach", 12), 6, 20) * 10, end = [ROD[0], ROD[1] + reach];
      const st = { cz: ISO.clamp(ISO.num(o, "cz", 30), 10, 55) * 10 }, want = { cz: st.cz };
      let lit = o.lit || "";
      const rodSeg = (z0, z1) => S(K.cylinder(ROD[0], ROD[1], RR, z0, z1 - z0, Pm, 24), { tone: "mid", crease: "none" });
      // the base, its maker's plate (moved up onto the casting's top) and the rod's top end with its cap
      const base = ISO.tinted(ISO.T.paint, LAB.standBase(Pm, BASE, ROD)) + `<g transform="${K.translateAlong(Pm, [0, 0, 7.6])}">${ISO.plate(Pm, { x: -20, y: 40, w: 40, d: 16, r: 1 })}</g>`;
      // what moves with cz: the rod below the boss, the boss, the rod above it (it comes out of the boss's top), the clamp
      const moving = (zc) => {
        const z = zc - 6.5, cl = LAB.clamp(Pm, ROD, z, [0, 1], reach, JAW, { jawH: 12 });
        // the wing-nut screw across the jaws, just in front of the yoke: a threaded rod along x, the nut on the near side
        const Fs = LAB.A([-(JAW + 5), end[1] - JAW - 1, zc], [1, 0, 0]), nx = 2 * JAW + 10;
        const screw = S(G.disc(0, nx + 3, 1.2, Fs, Pm), { tone: "mid" }) + S(G.disc(-1.6, 0, 2.4, Fs, Pm), { tone: "mid" }) +
          S(G.disc(nx - 0.5, nx + 1.8, 2.6, Fs, Pm), { tone: "mid" }) + ISO.wbox(Pm, [JAW + 5, JAW + 6.2], [end[1] - JAW - 2.2, end[1] - JAW + 0.2], [zc - 6, zc + 6], "mid");
        return `<g data-name="rod">${rodSeg(14, z)}</g><g data-name="boss">${LAB.boss(Pm, ROD, z, [0, 1])}</g><g data-name="rod">${rodSeg(z + 13, TOP)}${S(K.cylinder(ROD[0], ROD[1], RR + 0.4, TOP, 1.6, Pm, 24, 0.4), { tone: "mid" })}</g>` +
          `<g data-name="clamp">${cl.back}${screw}${cl.front}</g>`;
      };
      g.innerHTML = `<g data-name="base">${base}</g><g data-part="moving"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const zc = Math.round(st.cz);
        w.rebuild(el.moving, String(zc), () => moving(zc));
        g.anchors = { clamp: [end[0] / 10, end[1] / 10, zc / 10], top: [ROD[0] / 10, ROD[1] / 10, (TOP + 1.6) / 10] };
        if (lab) w.rebuild(el.words, String(zc), () => LAB.word(Pm, lab, [end[0] - JAW - 8, end[1], zc + 4], "clamp", "#556", { anchor: "end" }) + LAB.word(Pm, lab, [ROD[0] + 12, ROD[1], zc - 4], "boss head", "#556", { anchor: "start" }) +
          LAB.word(Pm, lab, [ROD[0] + 10, ROD[1], TOP - 20], "rod", "#556", { anchor: "start" }) + LAB.word(Pm, lab, [BASE.x - 8, BASE.y + BASE.d, 4], "base", "#556", { anchor: "end" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.cz !== undefined) want.cz = ISO.clamp(+p.cz, 10, 55) * 10;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.cz = ISO.follow(st.cz, want.cz, dt, 0.35, ISO.still());
        if (Math.abs(st.cz - want.cz) < 0.2) st.cz = want.cz;
        draw();
        return st.cz !== want.cz;
      };
      g.readout = () => `retort stand · 60 cm rod · clamp at ${(st.cz / 10).toFixed(1)} cm, reaching ${reach / 10} cm out`;
      draw();
      return g;
    },
  });
})();
