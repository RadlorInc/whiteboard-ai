// "barometertube cx cy k p=90..106 lab=0 lit=tube|mercury|vacuum|dish" — a PART (PARTS.md, batch 24): Torricelli's
// barometer, a 90 cm glass tube 1 cm across, closed at the top, filled with mercury and upended in a dish of mercury
// (origin the bench point under the dish's middle). The air pressing on the dish holds up a column h = p ÷ ρg over the
// dish's surface (760 mm at 101.3 kPa, ρ = 13 595 kg/m³) with a vacuum above it; the column's top is a domed meniscus.
// Hold it with a retortstand at= its `clamp` and read h with a metrerule standing at= `surface`. set({ p }) changes the
// air pressure (kPa), the column eases to its new height. Reused from pressure.js (k=barometer). World units: 1 = 1 cm.
// anchors: top clamp surface column.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RT = 0.5, RB = 0.32, TOP = 90.6, ZS = 2.2, DR = 5, DH = 3, HG = 13595, g9 = 9.81;
  const colOf = (kPa) => ((kPa * 1000) / (HG * g9)) * 100;                         // cm of mercury
  const PORC = ISO.tint("#ffffff", ["#cfd2d4", "#dcdfe1", "#e8eaeb", "#f3f4f5"], "#5a5e62");
  const HGT = ISO.tint("#eceef1", ["#7d828a", "#959aa1", "#b0b4ba", "#cdd0d4"], "#2e3237");
  const Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  let uid = 0;
  // the porcelain dish, its opening (the inner wall's shade) and the mercury's surface seen through it
  function dishSvg(P, id) {
    const F = Z([0, 0, 0]), rim = (r, z) => K.pathOf(Array.from({ length: 48 }, (_, i) => K.iso([Math.cos((i / 48) * 2 * Math.PI) * r, Math.sin((i / 48) * 2 * Math.PI) * r, z], P)), true);
    return `<path class="iso-halo" d="${K.haloOf({ x: -DR, y: -DR, w: 2 * DR, d: 2 * DR, r: DR }, 0, 0.02, P)}"/>` +
      `<g data-name="dish">${ISO.tinted(PORC, S(G.solidOf([[0, DR - 0.6], [0.3, DR - 0.3, 1], [DH - 0.15, DR], [DH, DR - 0.1, 1]], F, P), { tone: "mid" }))}` +
      `<path d="${rim(DR - 0.3, DH)}" fill="#d9dcdf" stroke="#8a8f94" stroke-width="0.5"/></g>` +
      `<g data-name="mercury"><clipPath id="${id}"><path d="${rim(DR - 0.3, DH)}"/></clipPath><path clip-path="url(#${id})" d="${rim(DR - 0.3, ZS)}" fill="#b7bcc2" stroke="#5c6168" stroke-width="0.6"/>` +
      `<path clip-path="url(#${id})" d="${K.pathOf([K.iso([-2.6, -1.2, ZS], P), K.iso([1.2, -2.4, ZS], P)])}" stroke="#f4f6f8" stroke-width="${(G.scaleOf(P) * 0.35).toFixed(2)}" stroke-linecap="round" opacity=".8"/></g>`;
  }
  const glassSvg = (P) => `<g data-name="tube" class="bt-glass" style="${ISO.T.glass}">${S(G.solidOf([[ZS - 0.02, RT], [TOP - 0.5, RT], [TOP - 0.15, RT * 0.7, 1], [TOP, 0]], Z([0, 0, 0]), P), { tone: "hi" })}</g>`;
  // the column (mercury from the dish's surface to h, domed) and the vacuum over it; the glass round both is static
  function tubeSvg(P, h) {
    const F = Z([0, 0, 0]), top = ZS + h, out = [];
    out.push(`<g data-name="mercury">${ISO.tinted(HGT, S(G.solidOf([[ZS, RB], [top - 0.18, RB], [top - 0.04, RB * 0.72, 1], [top, 0]], F, P), { tone: "hi", crease: "none" }))}</g>`);
    out.push(`<g data-name="vacuum" class="bt-vac">${S(G.solidOf([[top - 0.04, RB * 0.72], [TOP - 0.5, RB], [TOP - 0.2, 0]], F, P), { tone: "hi", crease: "none" })}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "barometertube", title: "Mercury barometer tube (part)", compare: null,
    about: "Torricelli's barometer: a 90 cm glass tube upended in a dish of mercury; the air holds up a column h = p ÷ ρg (760 mm at 101.3 kPa) with a vacuum above it; set p and the column moves. anchors: top clamp surface column",
    line: "barometertube cx cy k p=90..106 lab=0 lit=tube|mercury|vacuum|dish",
    demo: { line: "barometertube 480 500 4.6 p=101.3", script: [{ set: {}, hold: 1 }, { set: { p: 92, lit: "mercury" }, hold: "settle" }, { set: { p: 106, lit: "vacuum" }, hold: "settle" }, { set: { p: 101.3, lit: "tube" }, hold: "settle" }, { set: { lit: "dish" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const s = { p: ISO.clamp(ISO.num(o, "p", 101.3), 90, 106) }; s.pT = s.p;
      let lit = o.lit || "";
      g.innerHTML = `<style>.bt-glass .iso-fill{fill-opacity:.15}.bt-glass .iso-shade,.bt-glass .iso-top{opacity:.3}.bt-vac .iso-fill{fill:#f4f8fb;fill-opacity:.5}.bt-vac .iso-shade,.bt-vac .iso-top{opacity:.12}</style>` +
        dishSvg(P, `bt${++uid}`) + `<g data-part="tube"></g>` + glassSvg(P) + `<g data-part="words"></g>`;
      const el = LAB.parts(g);
      g.anchors = { top: [0, 0, TOP], clamp: [0, 0, 60], surface: [0, 0, ZS], column: [0, 0, ZS + colOf(s.p)] };
      const draw = () => {
        const h = Math.round(colOf(s.p) * 20) / 20, key = h.toFixed(2);
        w.rebuild(el.tube, key, () => tubeSvg(P, h));
        if (lab) w.rebuild(el.words, key, () => LAB.word(P, lab, [RT, 0, ZS + h + (TOP - ZS - h) / 2], "vacuum", "#777", { anchor: "start" }) + LAB.word(P, lab, [RT, 0, ZS + h], `${(h * 10).toFixed(0)} mm of mercury`, "#a3271b", { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.p !== undefined && Number.isFinite(+p.p)) s.pT = ISO.clamp(+p.p, 90, 106);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => { s.p = ISO.follow(s.p, s.pT, dt, 0.6, ISO.still()); draw(); return s.p !== s.pT; };
      g.readout = () => `air pressure ${s.p.toFixed(1)} kPa holds up h = p ÷ ρg = ${(colOf(s.p) * 10).toFixed(0)} mm of mercury · vacuum above the column`;
      draw();
      return g;
    },
  });
})();
