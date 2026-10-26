// "raybox cx cy k n=1|3|5 on=0|1 ray=5..60 lab=0 lit=box|comb|switch|cable|rays" — a PART (PARTS.md, batch 5): a school
// ray box standing on the bench (or on a papersheet), its origin the surface point under the middle of its foot; the
// light leaves along +x. A 12 × 8 cm foot plate on four rubber pads, a painted steel lamp housing 8 cm tall with a
// screwed lid and four vent slots, a slit comb in two guide rails on the front face (n slits, cut down to the bench so
// the rays light up the paper, a tab on top to pull it out), a rocker switch on the lid, a rating plate on the near
// side, and the mains lead leaving the back through a cable gland (hex nut, rubber boot) and lying on the bench.
// on=1: the lamp lights the slits and n parallel rays run out along the bench to `ray` cm (eased, as the light runs
// out); on=0 they draw back. set({ on, n, ray }). Built in mm (ISO.mm); anchors in cm: beam (where the middle ray
// leaves the comb, on the surface), top (the lid's middle).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const FOOT = { x: -60, y: -40, w: 110, d: 80, r: 3 }, HX = [-52, 46], HY = 32, Z0 = 7, ZT = 74, FX = 50.5, RAY = "#e09a00";
  const SLITS = { 1: [0], 3: [-12, 0, 12], 5: [-24, -12, 0, 12, 24] };
  const BODY = ISO.tint("#e3ebf3", ["#97abc2", "#aabcd0", "#bccbdc", "#cdd9e6"], "#2f4a66");
  const COMB = ISO.tint("#6a7078", ["#3a3e44", "#454a51", "#50555c", "#5c6168"], "#16181b");

  function staticSvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FOOT, 0, 2, P)}"/>`];
    // the cable gland on the back face (−x), drawn first (the box hides part of it): the lead lying on the bench, a hex nut, the rubber boot
    const F = G.frameOf([HX[0], 16, 26], [-1, 0, 0], [0, 1, 0], [0, 0, 1]), hex = Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3) * 7, Math.sin((i * Math.PI) / 3) * 7]);
    const lead = G.fillet([[HX[0] - 15, 16, 26], [HX[0] - 24, 16, 26], [HX[0] - 24, 16, 2.6], [HX[0] - 70, 16, 2.6]], 8, 7).map((p) => K.iso(p, P));
    out.push(`<g data-name="cable">` + CIRC.tube(K.pathOf(lead), 2.6 * 2 * K.screenRise(1, P), ["#2c2f34", "#0d0e10"]));
    out.push(`${ISO.tinted(ISO.T.plastic, S(G.prismOf(F, hex, 0, 4, P), { tone: "mid" }) + S(G.solidOf([[4, 5.2], [9, 4.2, 1], [15, 3]], F, P, { steps: 20 }), { tone: "mid", inner: L([6, 9, 12].map((s) => G.arcOf(F, s, 4.6 - (s - 6) * 0.2, P)).join(""), { tone: "lo" }) }))}`);
    out.push("</g>");
    // four rubber pads, the foot plate, the housing (a box with its lid)
    out.push(ISO.tinted(ISO.T.rubber, [[-54, -34], [44, -34], [-54, 34], [44, 34]].map(([x, y]) => S(K.cylinder(x, y, 3.2, 0, 2, P, 16), { tone: "lo" })).join("")));
    out.push(`<g data-name="box">${ISO.tinted(BODY, S(K.slabOf(FOOT, 2, 5, P, 3, 0.8), { tone: "mid" }))}`);
    out.push(ISO.tinted(BODY, ISO.wbox(P, HX, [-HY, HY], [Z0, ZT - 2], "mid")));
    out.push(ISO.tinted(BODY, S(K.slabOf({ x: HX[0] - 1.5, y: -HY - 1.5, w: HX[1] - HX[0] + 3, d: 2 * HY + 3, r: 2 }, ZT - 2, 2.5, P, 3, 0.5), { tone: "hi" })));
    // the lid's four screws, the foot's four screws, the vent slots across the lid
    out.push(D([[HX[0] + 4, -HY + 4], [HX[1] - 4, -HY + 4], [HX[0] + 4, HY - 4], [HX[1] - 4, HY - 4]].map(([x, y]) => K.iso([x, y, ZT + 0.5], P)), { size: 0.5 }));
    out.push(D([[-56, -36], [46, -36], [-56, 36], [46, 36]].map(([x, y]) => K.iso([x, y, 7.01], P)), { size: 0.45 }));
    for (let i = 0; i < 4; i++) out.push(L(K.planOutline({ x: -30 + i * 9, y: -22, w: 3.4, d: 34, r: 1.6 }, ZT + 0.5, P, 3), { tone: "lo" }));
    // the rating plate on the near side (+y), riveted, with its print
    const py = HY + 0.05, pa = (x, z) => K.iso([x, py, z], P);
    out.push(`<path d="${K.pathOf([pa(-34, 24), pa(6, 24), pa(6, 46), pa(-34, 46)], true)}" fill="#f2f3f0" stroke="#55534c" stroke-width="0.5"/>`);
    out.push(LAB.faceText(P, [-14, py + 0.05, 38.5], [1, 0, 0], "RAY BOX", 5, "#33506f"), LAB.faceText(P, [-14, py + 0.05, 30], [1, 0, 0], "12 V  24 W", 4, "#55534c"));
    out.push(D([pa(-32, 26), pa(4, 26), pa(-32, 44), pa(4, 44)], { size: 0.4 }));
    // the guide rails either side of the comb on the front face
    out.push(ISO.tinted(BODY, ISO.wbox(P, [HX[1], FX - 0.2], [-HY, -HY + 4], [Z0, ZT - 4], "mid") + ISO.wbox(P, [HX[1], FX - 0.2], [HY - 4, HY], [Z0, ZT - 4], "mid")), "</g>");
    if (lab) out.push(CIRC.word(P, [HX[1], HY, 86], "ray box"));
    return out.join("");
  }
  // the comb plate across the front: thin blackened steel down to the bench, n slits, a pull tab on top
  function combSvg(P, n, glow) {
    const out = [ISO.tinted(COMB, ISO.wbox(P, [FX - 0.2, FX + 1], [-HY + 1.5, HY - 1.5], [0.6, ZT - 6], "mid") + ISO.wbox(P, [FX - 0.2, FX + 1], [-9, 9], [ZT - 6, ZT - 1], "mid"))];
    out.push(D([K.iso([FX + 1.05, 0, ZT - 3.5], P)], { size: 0.6, tone: "hi" }));
    const lit = glow > 0.02 ? `fill="#fff1c2" stroke="#e09a00" stroke-width="0.4" fill-opacity="${(0.25 + 0.75 * glow).toFixed(2)}"` : `fill="#121315"`;
    out.push(`<path d="${SLITS[n].map((y) => K.pathOf([[FX + 1.05, y - 0.9, 1.2], [FX + 1.05, y - 0.9, 56], [FX + 1.05, y + 0.9, 56], [FX + 1.05, y + 0.9, 1.2]].map((p) => K.iso(p, P)), true)).join("")}" ${lit}/>`);
    return out.join("");
  }
  // the rocker switch in its bezel on the lid: rocked toward the back (off) or the front (on, its red window lit)
  function switchSvg(P, on) {
    const out = [ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-44, -30], [12, 26], [ZT + 0.5, ZT + 2.5], "mid"))];
    const hi = 6, lo = 3.2, zf = on ? lo : hi, zb = on ? hi : lo, z = ZT + 2.5;
    const V = [[-42, 14, z], [-32, 14, z], [-32, 24, z], [-42, 24, z], [-42, 14, z + zb], [-32, 14, z + zf], [-32, 24, z + zf], [-42, 24, z + zb]];
    out.push(ISO.tinted(on ? ISO.T.red : ISO.T.plastic, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid")));
    const mark = on ? [[-34.5, 19, z + zf - 0.4], [-34.5, 21, z + zf - 0.4]] : [[-39.5, 18, z + zb + 0.05], [-39.5, 20, z + zb + 0.05]];
    out.push(`<path d="${K.pathOf(mark.map((p) => K.iso(p, P)))}" stroke="#f4f4f0" stroke-width="0.8"/>`);
    return out.join("");
  }

  ISO.add({
    name: "raybox", title: "Ray box (part)", compare: null,
    about: "A school ray box on its foot: lamp housing with vents and a rating plate, a slit comb of 1, 3 or 5 slits on the front, a rocker switch, the lead out through a cable gland; on=1 throws n parallel rays along the bench (+x) for ray cm. anchors: beam top",
    line: "raybox cx cy k n=1|3|5 on=0|1 ray=5..60 lab=0 lit=box|comb|switch|cable|rays",
    demo: { line: "raybox 330 330 30 n=5 ray=14 lab=1", script: [{ set: {}, hold: 1 }, { set: { on: 1, lit: "rays" }, hold: "settle" }, { set: { n: 3, lit: "comb" }, hold: 1.4 }, { set: { n: 1, ray: 20, lit: "switch" }, hold: "settle" }, { set: { on: 0, lit: "cable" }, hold: "settle" }, { set: { lit: "box" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { n: SLITS[o.n] ? +o.n : 3, on: o.on === "1", ray: ISO.clamp(ISO.num(o, "ray", 25), 5, 60), lit: o.lit || "" };
      const s = { len: st.on ? st.ray : 0 };
      g.innerHTML = `<g>${staticSvg(Pm, lab)}</g><g data-name="switch" data-part="sw"></g><g data-name="comb" data-part="comb"></g><g data-name="rays" data-part="rays"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.anchors = { beam: [(FX + 1.1) / 10, 0, 0], top: [0, 0, (ZT + 0.5) / 10] };
      const draw = () => {
        const glow = st.ray > 0 ? ISO.clamp(s.len / Math.min(st.ray, 6), 0, 1) : 0, len = Math.round(s.len * 20) / 20;
        w.rebuild(el.sw, String(st.on), () => switchSvg(Pm, st.on));
        w.rebuild(el.comb, `${st.n} ${glow.toFixed(2)}`, () => combSvg(Pm, st.n, glow));
        w.rebuild(el.rays, `${st.n} ${len}`, () => {
          if (len < 0.05) return "";
          // each ray: a pale wide band of light on the bench, a bright core, fading over its last fifth
          const x0 = FX + 1.1, x1 = x0 + len * 10, xf = x0 + len * 8, seg = (y, a, b) => K.pathOf([K.iso([a, y, 0.3], Pm), K.iso([b, y, 0.3], Pm)]);
          const wpx = (mm) => (mm * 2 * K.screenRise(1, Pm)).toFixed(2), ys = SLITS[st.n];
          return `<path d="${ys.map((y) => seg(y, x0, xf)).join("")}" stroke="#ffd36b" stroke-opacity=".35" stroke-width="${wpx(2.4)}" fill="none"/>` +
            `<path d="${ys.map((y) => seg(y, x0, xf)).join("")}" stroke="${RAY}" stroke-width="${Math.max(0.9, +wpx(0.5)).toFixed(2)}" fill="none"/>` +
            `<path d="${ys.map((y) => seg(y, xf, x1)).join("")}" stroke="${RAY}" stroke-opacity=".4" stroke-width="${Math.max(0.9, +wpx(0.5)).toFixed(2)}" fill="none"/>`;
        });
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.n !== undefined && SLITS[p.n]) st.n = +p.n;
        if (p.on !== undefined) st.on = String(p.on) === "1";
        if (p.ray !== undefined && p.ray !== "" && Number.isFinite(+p.ray)) st.ray = ISO.clamp(+p.ray, 5, 60);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const want = st.on ? st.ray : 0;
        // the light runs out at about 60 cm a second, and draws back as fast
        if (ISO.still() || dt > 1) s.len = want;
        else if (s.len !== want) { const step = 60 * dt; s.len = Math.abs(want - s.len) <= step ? want : s.len + Math.sign(want - s.len) * step; }
        draw();
        return s.len !== want;
      };
      g.readout = () => `ray box · 12 V 24 W lamp · ${st.n} slit${st.n > 1 ? "s" : ""} · ${st.on ? `${st.n} parallel ray${st.n > 1 ? "s" : ""} along the bench, ${s.len.toFixed(0)} cm` : "switched off"}`;
      draw();
      return g;
    },
  });
})();
