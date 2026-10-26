// "manometertube cx cy k h=0..28 lab=0 lit=tube|water|scale|collar" — a PART (PARTS.md, batch 5): one manometer
// tube of bernoulli.js at real size, standing up open at the top, origin the point under its middle where it stands
// (place it at= a venturitube's t1, t2 or t3). A glass tube 8 mm across and 30 cm high with a fire-polished lip, a
// black rubber collar at its foot that seals it on the tapping, a cm scale etched up its front (a tick every cm,
// longer every 5), and water standing h cm above the foot with a curved meniscus. h is the pressure at the foot
// measured as a height of water (1 cm = 98 Pa); set({ h }) moves the column there, eased.
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 4, RI = 3, H = 300, C = 22, MAX = 280;
  const WATER = ISO.tint("#a8d1f2", ["#5c97cf", "#6ea6da", "#83b6e3", "#97c4ec"], "#1f4f8f");

  const waterSvg = (P, h) => {
    if (h < 1) return "";
    const F = window.B08.Z([0, 0, 0]), top = Math.max(2, h);
    // the column with its meniscus: the surface dips about 1 mm in the middle (water wets glass)
    return ISO.tinted(WATER, S(G.lathe([[2, 0], [2, RI], [top, RI], [top - 0.6, RI * 0.75, 1], [top - 1.1, 0]], F, P), { tone: "mid" }));
  };
  function glassSvg(P) {
    const B08 = window.B08, F = B08.Z([0, 0, 0]), face = G.angleToward(F, G.viewOf(P)), out = [B08.glassCss("mt-glass", 0.14, 0.3)];
    out.push(`<g class="mt-glass" style="${ISO.T.glass}" data-name="tube">${S(K.cylinder(0, 0, R, 0, H - 1.2, P, 20), { tone: "hi", crease: "none" })}${S(G.lathe([[H - 1.2, R], [H - 0.6, R + 0.35, 1], [H, R - 0.2, 1], [H, RI]], F, P), { tone: "hi" })}</g>`);
    // the etched scale on the near side: a rule from the collar's top to 28 cm, a tick every cm (every 5 longer)
    const a = face - 0.35, at = (z, da = 0) => G.pointOf(F, z, R + 0.05, a + da), minor = [], major = [];
    for (let z = 30; z <= MAX; z += 10) ((z % 50) ? minor : major).push(K.pathOf([K.iso(at(z), P), K.iso(at(z, z % 50 ? 0.55 : 0.95), P)]));
    out.push(`<g data-name="scale">${L(K.pathOf([K.iso(at(30), P), K.iso(at(MAX), P)]), { tone: "lo" })}${L(minor.join(""), { tone: "lo", free: "end" })}${L(major.join(""), { tone: "mid", free: "end" })}</g>`);
    // the glare down the tube
    out.push(`<path d="${K.pathOf([K.iso(G.pointOf(F, C + 8, R + 0.1, face + 0.7), P), K.iso(G.pointOf(F, H - 12, R + 0.1, face + 0.7), P)])}" stroke="#ffffff" stroke-width="${Math.max(0.6, G.scaleOf(P) * 1.1).toFixed(2)}" stroke-linecap="round" opacity=".85"/>`);
    // the rubber collar at the foot (over the glass), its rolled top
    out.push(`<g data-name="collar">${ISO.tinted(ISO.T.rubber, S(G.lathe([[0, 0], [0, 6.5], [C - 2, 6], [C - 0.5, 5.4, 1], [C, R + 0.4]], F, P), { tone: "mid" }))}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "manometertube", title: "Manometer tube (part)", compare: null,
    about: "An open glass manometer tube 8 mm across and 30 cm high on a rubber collar, a cm scale etched up its front, water standing h cm in it (the pressure at its foot as a height of water); stands on a venturi tube's tapping. anchors: top",
    line: "manometertube cx cy k h=0..28 lab=0 lit=tube|water|scale|collar",
    demo: { line: "manometertube 480 500 15 h=12", script: [{ set: {}, hold: 1 }, { set: { h: 22, lit: "water" }, hold: "settle" }, { set: { h: 6, lit: "scale" }, hold: "settle" }, { set: { lit: "collar" }, hold: 1 }, { set: { h: 15, lit: "tube" }, hold: "settle" }] },
    make([cx = 480, cy = 500, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -7, y: -7, w: 14, d: 14, r: 7 }, 0, 2, Pm)}"/><g data-name="water" data-part="water"></g>` + glassSvg(Pm) + `<g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H / 10] };
      const el = LAB.parts(g), w = ISO.writer(), s = { h: ISO.clamp(ISO.num(o, "h", 10), 0, 28) * 10 };
      s.to = s.h;
      let lit = o.lit || "";
      const draw = () => {
        const h = Math.round(s.h * 4) / 4;
        w.rebuild(el.water, h.toFixed(2), () => waterSvg(Pm, h));
        if (lab) w.rebuild(el.words, h.toFixed(0), () => CIRC.word(P, [R / 10, 0, h / 10], `${(h / 10).toFixed(1)} cm`));
        window.B08.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.h !== undefined && Number.isFinite(+p.h)) s.to = ISO.clamp(+p.h, 0, 28) * 10;
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        s.h = ISO.follow(s.h, s.to, Math.min(dt, 0.25), 0.5, ISO.still());
        if (Math.abs(s.h - s.to) < 0.05) s.h = s.to;
        draw();
        return s.h !== s.to;
      };
      g.readout = () => `water ${(s.h / 10).toFixed(1)} cm up the tube · pressure at its foot ${(s.h * 9.81).toFixed(0)} Pa above the air's`;
      draw();
      return g;
    },
  });
})();
