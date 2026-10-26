// "spoutcan cx cy k level=4..29 open=0|1 fall=0..100 lab=0 lit=can|spouts|sight|scale|water|jets" — a PART (PARTS.md,
// batch 24): a tall tinned-steel can 10 cm across and 30 cm high standing on its base (origin the surface point under
// its middle; place it at= a canstand's top). Three brass spouts toward +x at 7, 15 and 23 cm up, each closed by a red
// rubber stopper until open=1; a glass sight tube on the side toward you shows the water level against a cm scale
// printed on a white enamel strip. Water leaves a spout h cm under the surface at v = √(2gh) (Torricelli) and falls
// `fall` cm below the can's base (to a tray on the floor: 30 on a canstand), landing 2√(h·y) out (y = the spout's
// height over the landing), so the deeper the hole the faster and further the jet. set({ open }) pulls the stoppers
// (the jets grow out), set({ level }) lets the water fall or rise to that level, eased. Reused from pressure.js
// (k=depth: can, sight tube, jets). World units: 1 = 1 cm. anchors: rim base land.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CR = 5, CH = 30, HOLES = [7, 15, 23], SX = CR + 1.5, g9 = 981;          // cm, cm/s²
  const ENAMEL = ISO.tint("#ffffff", ["#d9dcdf", "#e4e6e8", "#eef0f1", "#f7f8f8"], "#5a5e62");
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const stroke = (P, pts, color, w) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const ring = (P, r, z) => K.pathOf(Array.from({ length: 48 }, (_, i) => K.iso([Math.cos((i / 48) * 2 * Math.PI) * r, Math.sin((i / 48) * 2 * Math.PI) * r, z], P)), true);
  let uid = 0;

  function canSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -CR, y: -CR, w: 2 * CR, d: 2 * CR, r: CR }, 0, 0.02, P)}"/>`];
    // the body with its rolled beads, the chime round the base and the rolled rim on top
    out.push(`<g data-name="can">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, CR + 0.12, 0, 0.6, P, 64, 0.08), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, CR, 0.6, CH - 0.6, P, 64, 0), { tone: "hi", inner: L([1.6, 10.5, 19.5, CH - 1.4].map((z) => K.sideArc(0, 0, CR, z, P, 48)).join(""), { tone: "faint" }) })) +
      ISO.tinted(ISO.T.steel, S(G.ringBand(CH - 0.25, CH + 0.2, CR - 0.12, CR + 0.15, zAx([0, 0, 0]), P, { steps: 64 }), { tone: "hi" })) +
      `<path d="${ring(P, CR - 0.12, CH + 0.2)}" fill="#55595f" stroke="#3c3f45" stroke-width="0.5"/></g>`);
    return out.join("");
  }
  // the spouts toward +x: a collar soldered on the wall, the brass tube, and the stopper while closed
  function spoutsSvg(P, closed) {
    return `<g data-name="spouts">` + HOLES.map((h) => {
      const F = xAx([0, 0, h]);
      return ISO.tinted(ISO.T.brass, S(G.disc(CR - 0.25, CR + 0.25, 0.6, F, P), { tone: "mid" }) + S(G.disc(CR + 0.25, SX, 0.32, F, P), { tone: "hi" })) +
        (closed ? ISO.tinted(ISO.T.red, S(G.solidOf([[SX - 0.5, 0.36], [SX + 0.4, 0.46]], F, P), { tone: "mid" })) : `<path d="${G.circleOf(F, SX, 0.22, P)}" fill="#2a2d31"/>`);
    }).join("") + `</g>`;
  }
  // the sight tube on the side toward you (angle a): elbows into the can, the glass, its water; and the printed scale
  function sightSvg(P, a, level) {
    const c = Math.cos(a), s = Math.sin(a), R = CR + 1.1, x = c * R, y = s * R, out = [];
    // the scale: an enamel strip on the can wall beside the tube, a tick every cm (long every 5), numbers every 5
    const a0 = a + 0.2, a1 = a + 0.55, z0 = 0.9, z1 = CH - 1.2, strip = [];
    for (let i = 0; i <= 8; i++) strip.push(K.iso([Math.cos(a0 + ((a1 - a0) * i) / 8) * (CR + 0.02), Math.sin(a0 + ((a1 - a0) * i) / 8) * (CR + 0.02), z0], P));
    for (let i = 8; i >= 0; i--) strip.push(K.iso([Math.cos(a0 + ((a1 - a0) * i) / 8) * (CR + 0.02), Math.sin(a0 + ((a1 - a0) * i) / 8) * (CR + 0.02), z1], P));
    const minor = [], major = [], nums = [];
    for (let cm = 1; cm <= 28; cm++) {
      const da = cm % 5 ? 0.06 : 0.11, pts = [0, 0.5, 1].map((f) => { const q = a0 + 0.02 + da * f; return K.iso([Math.cos(q) * (CR + 0.03), Math.sin(q) * (CR + 0.03), cm], P); });
      (cm % 5 ? minor : major).push(K.pathOf(pts));
      if (cm % 5 === 0) { const q = a0 + 0.2; nums.push(window.LAB.faceText(P, [Math.cos(q) * (CR + 0.04), Math.sin(q) * (CR + 0.04), cm - 0.3], [Math.sin(q), -Math.cos(q), 0], String(cm), 0.75, "#33404c")); }
    }
    out.push(`<g data-name="scale"><path d="${K.pathOf(strip, true)}" fill="#ffffff" stroke="#8a8f94" stroke-width="0.5"/>` + L(minor.join(""), { tone: "lo", free: true }) + L(major.join(""), { tone: "mid", free: true }) + nums.join("") + `</g>`);
    // the elbows, the glass tube with its nuts, the water standing in it at the can's level
    const el = (z) => ISO.tinted(ISO.T.brass, S(G.disc(CR - 0.1, R, 0.28, G.frameAlong([0, 0, z], [c, s, 0]), P), { tone: "mid" }));
    out.push(`<g data-name="sight">${el(1.2)}${el(CH - 1.6)}` + ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 0.55, 0.7, 1.0, P, 16, 0.05), { tone: "mid" })) +
      ISO.tinted(ISO.T.blue, S(K.cylinder(x, y, 0.3, 1.7, Math.max(0.05, level - 1.7), P, 12), { tone: "hi", crease: "none" })) +
      `<g class="sc-glass" style="${ISO.T.glass}">${S(K.cylinder(x, y, 0.42, 1.7, CH - 3.8, P, 14), { tone: "hi" })}</g>` +
      ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 0.55, CH - 2.1, 1.0, P, 16, 0.05), { tone: "mid" })) + `</g>`);
    return out.join("");
  }
  // the water surface seen through the open top, clipped to the rim
  const surfaceSvg = (P, id, level) => `<g data-name="water"><clipPath id="${id}"><path d="${ring(P, CR - 0.14, CH + 0.2)}"/></clipPath><path clip-path="url(#${id})" d="${ring(P, CR - 0.14, level)}" fill="#9ccbf2" stroke="#1f5f9f" stroke-width="0.6"/></g>`;
  // one jet from the spout at h, `reach` (0–1) how far its front has fallen since the stopper came out
  function jet(P, h, level, reach, fall) {
    const d = level - h, y0 = h + fall, s = G.scaleOf(P);
    if (d <= 0.2 || reach < 0.01) return { svg: "", d: Math.max(0, d) };
    const pts = [];
    for (let i = 0; i <= 24; i++) { const drop = (i / 24) ** 2 * y0 * reach; pts.push([SX + 2 * Math.sqrt(d * drop), 0, h - drop]); }
    const w = s * Math.min(0.5, 0.18 + d * 0.015);
    let svg = stroke(P, pts, "#1f5f9f", w + 1.2) + stroke(P, pts, "#8cc4f2", w);
    if (reach > 0.98) { const c = K.iso([SX + 2 * Math.sqrt(d * y0), 0, -fall], P); svg += `<ellipse cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" rx="${(s * 1.2).toFixed(2)}" ry="${(s * 0.45).toFixed(2)}" fill="none" stroke="#1f5f9f" stroke-width="0.8"/>`; }
    return { svg, d };
  }

  ISO.add({
    name: "spoutcan", title: "Can with three spouts (part)", compare: null,
    about: "A tall can (10 × 30 cm) with spouts at three depths toward +x and a sight tube with a cm scale; open=1 pulls the stoppers and water jets out at √(2gh), the deeper jets faster and further; the level can fall. anchors: rim base land",
    line: "spoutcan cx cy k level=4..29 open=0|1 fall=0..100 lab=0 lit=can|spouts|sight|scale|water|jets",
    demo: { line: "spoutcan 330 330 5.6 level=28 fall=30", script: [{ set: {}, hold: 1 }, { set: { open: 1, lit: "jets" }, hold: "settle" }, { set: { level: 16, lit: "sight" }, hold: "settle" }, { set: { level: 28, lit: "spouts" }, hold: "settle" }, { set: { open: 0, lit: "can" }, hold: "settle" }, { set: { lit: "scale" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), id = `sc${++uid}`;
      const fall = ISO.clamp(ISO.num(o, "fall", 30), 0, 100), tv = K.towardViewer(P), a = Math.atan2(tv[1], tv[0]) - 0.35;
      const s = { level: ISO.clamp(ISO.num(o, "level", 28), 4, 29), open: o.open === "1" ? 1 : 0 }; s.levelT = s.level; s.openT = s.open;
      let lit = o.lit || "", jets = [];
      g.innerHTML = `<style>.sc-glass .iso-fill{fill-opacity:.15}.sc-glass .iso-shade,.sc-glass .iso-top{opacity:.3}</style>` + canSvg(P) +
        `<g data-part="surface"></g><g data-part="sight"></g><g data-part="spouts"></g><g data-name="jets" data-part="jets"></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      g.anchors = { rim: [0, 0, CH], base: [0, 0, 0], land: [SX, 0, -fall] };
      const draw = () => {
        jets = HOLES.map((h) => jet(P, h, s.level, s.open, fall));
        w.rebuild(el.surface, s.level.toFixed(2), () => surfaceSvg(P, id, s.level));
        w.rebuild(el.sight, s.level.toFixed(2), () => sightSvg(P, a, s.level));
        w.rebuild(el.spouts, String(s.openT || s.open > 0), () => spoutsSvg(P, !(s.openT || s.open > 0)));
        w.rebuild(el.jets, `${s.level.toFixed(2)} ${s.open.toFixed(3)}`, () => jets.map((j) => j.svg).join(""));
        if (lab) w.rebuild(el.words, `${s.level.toFixed(1)} ${s.open > 0.98}`, () => HOLES.map((h, i) => (jets[i].d > 0.2 && s.open > 0.98 ? LAB.word(P, lab, [SX + 0.6, 0, h + 0.8], `${jets[i].d.toFixed(0)} cm deep: ${(Math.sqrt(2 * g9 * jets[i].d) / 100).toFixed(1)} m/s`, "#1f4f8f", { size: 12, anchor: "start" }) : "")).join("") + LAB.word(P, lab, [0, 0, CH + 3], "water can", "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.open !== undefined) s.openT = +p.open ? 1 : 0;
        if (p.level !== undefined && Number.isFinite(+p.level)) s.levelT = ISO.clamp(+p.level, 4, 29);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.open = calm ? s.openT : s.openT ? Math.min(1, s.open + dt / 0.9) : 0;
        s.level = ISO.follow(s.level, s.levelT, dt, 1.2, calm);
        draw();
        return s.open !== s.openT || s.level !== s.levelT;
      };
      g.readout = () => {
        const each = HOLES.map((h) => { const d = s.level - h; return d > 0.2 ? `${d.toFixed(0)} cm deep → ${(Math.sqrt(2 * g9 * d) / 100).toFixed(2)} m/s, lands ${(2 * Math.sqrt(d * (h + fall))).toFixed(0)} cm out` : "dry"; });
        return `water ${s.level.toFixed(0)} cm deep · v = √(2gh): ${s.open > 0.5 ? each.join(" · ") : "spouts stoppered"}`;
      };
      draw();
      return g;
    },
  });
})();
