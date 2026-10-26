// "paperclip cx cy k aim=flat|hang deg=0..360 lab=0 lit=clip" — a PART (PARTS.md, batch 5): a steel Gem paper clip,
// 3.2 × 0.8 cm, bent from 0.9 mm wire into three nested loops (the outer leg, the big end loop, the small end loop and
// the inner leg). aim=flat: lying on a surface, its origin its middle on that surface, turned deg about the vertical
// (0 = long side along x); aim=hang: hanging by its big loop from a magnet's pole or from another clip, its origin the
// hanging point, the clip down −z in a plane turned deg about the vertical. Anchors top (the big loop's end) and
// bottom (the small loop's end): a second clip placed at=<clip>.bottom aim=hang hangs from the first (a chain under an
// electromagnet). Picked up or dropped = placed again with aim=hang or flat. set({ aim, deg }). World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, RW = 0.045, LEN = 3.2;
  const STEEL = { ink: "#3c3f45", body: "#b9bcc1", shine: "#f4f5f7" };
  // the wire's centre line in the clip's own plane (u along its length 0..3.2, v across ±0.4)
  const arc = (cu, cv, r, a0, a1, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cu + Math.cos(a) * r, cv + Math.sin(a) * r]; });
  const H = Math.PI / 2;
  const PATH = [[0.42, -0.355], ...arc(2.8, 0, 0.355, -H, H, 18), ...arc(0.4, 0.075, 0.28, H, 3 * H, 14), ...arc(2.52, 0, 0.205, -H, H, 12), [1.05, 0.205]];
  const TOP = [LEN - RW, 0], BOTTOM = [0.12 + RW, 0.075];

  function clipSvg(P, aim, deg) {
    const c = Math.cos(deg), s = Math.sin(deg);
    // flat: u along the heading, v across it, lying a wire's radius up; hang: u down from the top end, v across
    const at = aim === "hang" ? ([u, v]) => [v * -s, v * c, -(LEN - RW - u)] : ([u, v]) => [(u - LEN / 2) * c - v * s, (u - LEN / 2) * s + v * c, RW];
    const pts = PATH.map(at), out = [];
    if (aim === "flat") {
      const sh = PATH.map(([u, v]) => { const p = at([u, v * 1.15]); return K.iso([p[0], p[1], 0], P); });
      out.push(`<path d="${K.pathOf(sh)}" fill="none" stroke="#3a3e44" stroke-opacity=".16" stroke-width="${(RW * 4 * K.screenRise(1, P) + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    out.push(`<g data-name="clip">${PHYS.wire(P, PHYS.path(P, pts), RW, STEEL)}`);
    // the two cut ends of the wire: small dull faces
    out.push(K.dotsSvg([K.iso(pts[0], P), K.iso(pts.at(-1), P)], { size: Math.max(0.3, RW * G.scaleOf(P) * 0.35), tone: "lo" }), "</g>");
    return { svg: out.join(""), anchors: { top: at(TOP).map((v) => +v.toFixed(3)), bottom: at(BOTTOM).map((v) => +v.toFixed(3)) } };
  }

  ISO.add({
    name: "paperclip", title: "Paper clip (part)", compare: null,
    about: "A steel Gem paper clip 3.2 × 0.8 cm bent from 0.9 mm wire: lying flat on a surface turned deg, or hanging by its big loop from a magnet or another clip (chain them at=<clip>.bottom). anchors: top bottom",
    line: "paperclip cx cy k aim=flat|hang deg=0..360 lab=0 lit=clip",
    demo: { line: "paperclip 480 280 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { deg: 50, lit: "clip" }, hold: 1.2 }, { set: { aim: "hang", deg: 20, lit: "" }, hold: 1.2 }, { set: { deg: 300 }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { aim: o.aim === "hang" ? "hang" : "flat", deg: ISO.clamp(ISO.num(o, "deg", 0), -720, 720), lit: o.lit || "" };
      const w = ISO.writer();
      const build = () => {
        const c = clipSvg(P, st.aim, (st.deg * Math.PI) / 180);
        g.innerHTML = c.svg + (lab ? CIRC.word(P, c.anchors.top.map((v, i) => v + [0.3, 0, st.aim === "hang" ? -1 : 0.2][i]), "paper clip") : "");
        g.anchors = c.anchors;
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => {
        let again = false;
        if ((p.aim === "flat" || p.aim === "hang") && p.aim !== st.aim) { st.aim = p.aim; again = true; }
        if (p.deg !== undefined && p.deg !== "" && Number.isFinite(+p.deg)) { st.deg = ISO.clamp(+p.deg, -720, 720); again = true; }
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build(); else LAB.light(w, g, st.lit);
      };
      g.update = () => false;
      g.readout = () => `steel paper clip 3.2 × 0.8 cm, 0.9 mm wire, about 0.5 g · ${st.aim === "hang" ? "hanging by its big loop" : "lying flat"}`;
      build();
      return g;
    },
  });
})();
