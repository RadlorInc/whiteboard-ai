// "brasskey cx cy k aim=flat|x cuts=2,5,3,6,4 lab=0 lit=key|bow|blade" — a PART (b34): the brass door key of key.js
// at real size (6.3 × 2.1 cm, the blade 1.3 mm thick, the bow 1.8 mm). A round bow with its hole, the shoulder, the
// blade with its milled groove and five V cuts, each to depth 1 (shallow) … 6 (deep), 0.4 mm apart, set by cuts=.
// aim=flat lies it on a surface (origin its middle there, the blade along +x); aim=x holds it on edge, cuts up, ready
// to go into a lock along +x (origin = the blade's tip). Anchors `ring` (the bow's hole) and `tip`. Static.
// 1 unit = 0.4 mm (key.js's key units).
(() => {
  const K = window.K;
  ISO.add({
    name: "brasskey", title: "Brass door key (part)", compare: null,
    about: "A brass pin-tumbler door key: round bow with a hole, shoulder, blade with a milled groove and five V cuts whose depths (1 … 6) are its code; lying flat or held on edge ready to go into a lock. anchors: ring tip",
    line: "brasskey cx cy k aim=flat|x cuts=2,5,3,6,4 lab=0 lit=key|bow|blade",
    demo: { line: "brasskey 480 290 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { cuts: "6,1,6,1,6", lit: "blade" }, hold: 1.2 }, { set: { aim: "x", lit: "bow" }, hold: 1.2 }, { set: { cuts: "2,5,3,6,4", lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pu = { ...P, scale: P.scale / 25 }, lab = o.lab === "1", KY = B34.KEY, w = ISO.writer();
      const st = { aim: o.aim === "x" ? "x" : "flat", cuts: KY.parse(o.cuts), lit: o.lit || "" };
      const build = () => {
        const [bx, bz] = KY.BOW, flat = st.aim === "flat", O = flat ? [17, 0, 0] : [KY.TIP, 0, KY.KF + 8], Q = B34.shift(Pu, O);
        const cm = (p) => p.map((v, i) => +((v - O[i]) * KY.U).toFixed(2));
        const halo = flat ? `<path class="iso-halo" d="${K.haloOf({ x: -62, y: -26, w: 158, d: 52, r: 20 }, 0, 2, Q)}"/>` : "";
        const word = lab ? ISO.word(K.iso(flat ? [17, 30, 0] : [bx, 0, bz + 30], Q), `key, cuts ${st.cuts.join(" ")}`, "#6b5114", { size: 13, dy: flat ? 16 : -6 }) : "";
        g.innerHTML = `${halo}<g data-name="key">${flat ? KY.flatSvg(Q, st.cuts) : KY.edgeSvg(Q, st.cuts)}</g>${word}`;
        g.anchors = { ring: cm(flat ? [bx - 10, 0, 2.2] : [bx - 10, 0, bz]), tip: cm(flat ? [KY.TIP, bz - (KY.KF + 8), 0.8] : [KY.TIP, 0, KY.KF + 8]) };
        B34.light(w, g, st.lit);
      };
      g.set = (p) => {
        let again = false;
        if (p.aim !== undefined && (p.aim === "x" || p.aim === "flat") && p.aim !== st.aim) { st.aim = p.aim; again = true; }
        if (p.cuts !== undefined) { const c = KY.parse(p.cuts); if (c.join() !== st.cuts.join()) { st.cuts = c; again = true; } }
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build(); else B34.light(w, g, st.lit);
      };
      g.update = () => false;
      g.readout = () => `brass door key · cuts ${st.cuts.join(" ")} (depth 1 shallow … 6 deep, 0.4 mm steps) · each cut lifts one pin of the lock it was made for to the shear line`;
      build();
      return g;
    },
  });
})();
