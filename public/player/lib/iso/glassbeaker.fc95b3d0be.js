// "glassbeaker cx cy k ml=50|100|250|500|1000 fill=0..1 c=blue lab=0 lit=glass|liquid|scale" — a PART (PARTS.md):
// a borosilicate low-form (Griffin) beaker standing on the bench, origin the bench point under its middle. Real sizes
// (DIN ISO 3819, outer diameter × height): 50 mL 51 × 70, 100 mL 60 × 70, 250 mL 70 × 95, 500 mL 90 × 125,
// 1000 mL 105 × 145 mm. Rounded heel, pouring spout, a white enamel marking patch and a white printed mL scale up the
// near wall (ticks hang from its rule); the liquid stands at fill × the glass height, its volume integrated from the
// glass's own profile. Built in mm with the lab helpers; anchors in cm. set({ fill, c }) fills it or changes colour.
(() => {
  const K = window.K, G = window.G;
  // ml: [outer diameter, height, scale from, scale step, wall]
  const SIZES = { 50: [51, 70, 10, 5, 1.2], 100: [60, 70, 20, 10, 1.3], 250: [70, 95, 50, 25, 1.4], 500: [90, 125, 100, 50, 1.6], 1000: [105, 145, 200, 100, 1.8] };
  const BASE = 2;   // glass floor, mm
  // the white enamel: ink lines in white, with a thin glass-blue line under each so they read on clear glass
  const ENAMEL = ISO.tint("#ffffff", ["#ffffff", "#ffffff", "#ffffff", "#ffffff"], "#ffffff");

  ISO.add({
    name: "glassbeaker", title: "Glass beaker (part)", compare: null,
    about: "A glass lab beaker (50 to 1000 mL, real sizes) with a spout and a printed mL scale, holding a coloured liquid; a bench part to place on a tripod, a mat or a hot plate. anchors: rim spout inside",
    line: "glassbeaker cx cy k ml=50|100|250|500|1000 fill=0..1 c=blue|red|… lab=0 lit=glass|liquid|scale",
    demo: { line: "glassbeaker 480 420 26 ml=250 fill=0.3 c=blue", script: [{ set: { fill: 0.75 }, hold: "settle" }, { set: { lit: "scale" }, hold: 1.5 }, { set: { c: "red", fill: 0.5, lit: "liquid" }, hold: "settle" }, { set: { lit: "glass" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ml = SIZES[o.ml] ? +o.ml : 250, [D, H, m0, step, wall] = SIZES[ml], R = D / 2;
      const V = LAB.vessel(Pm, [0, 0, 0], window.CHEM.beaker(R, H), { spout: true, wall, base: BASE });
      const top = H - 2, st = { f: ISO.clamp(ISO.num(o, "fill", 0.5), 0, 1), c0: o.c || "blue", c1: o.c || "blue", mixT: 1 }, want = { f: st.f };
      let lit = o.lit || "";
      const levelZ = () => BASE + (top - BASE) * st.f;
      // the marking patch: a white enamel area on the near wall with its rule lines and the nominal volume
      const patch = () => {
        const a0 = V.facing + 0.12, a1 = V.facing + 0.12 + 22 / R, s0 = H * 0.3, s1 = H * 0.3 + Math.min(26, H * 0.3), pts = [];
        for (let i = 0; i <= 10; i++) pts.push(K.iso(G.pointOf(V.F, s0, R + 0.2, a0 + ((a1 - a0) * i) / 10), Pm));
        for (let i = 10; i >= 0; i--) pts.push(K.iso(G.pointOf(V.F, s1, R + 0.2, a0 + ((a1 - a0) * i) / 10), Pm));
        const mid = (a0 + a1) / 2, u = G.mul3(G.tangentOf(V.F, mid), -1), sz = (s1 - s0) / 4.2;
        const rule = (s) => { const q = []; for (let i = 0; i <= 6; i++) q.push(K.iso(G.pointOf(V.F, s, R + 0.25, a0 + 0.06 + ((a1 - a0 - 0.12) * i) / 6), Pm)); return K.pathOf(q); };
        return `<path d="${K.pathOf(pts, true)}" fill="#ffffff" fill-opacity=".92" stroke="${LAB.GLASS}" stroke-width="0.5"/>` + L(rule(s0 + (s1 - s0) * 0.3), { tone: "lo", free: true }) +
          LAB.faceText(Pm, G.pointOf(V.F, s0 + (s1 - s0) * 0.62, R + 0.3, mid), u, `${ml} mL`, sz) + LAB.faceText(Pm, G.pointOf(V.F, s0 + (s1 - s0) * 0.12, R + 0.3, mid), u, "± 5 %", sz * 0.6, "#6b8496");
      };
      // the printed scale: a rule up the wall, a tick every step (long every second) and the number at each long one
      const scale = () => {
        const from = V.levelFor(m0), to = V.levelFor(ml), ds = (V.levelFor(m0 + step) - from) / 2, side = -0.3, u = G.mul3(G.tangentOf(V.F, V.facing + side), -1), out = [];
        const lines = V.scale(from, to, ds, 2, { side, len: [R * 0.07, R * 0.13] });
        out.push(`<g style="stroke-width:1.6;opacity:.55">${lines}</g>`, ISO.tinted(ENAMEL, lines));
        for (let m = m0; m <= ml + 1e-6; m += step) out.push(LAB.faceText(Pm, G.pointOf(V.F, V.levelFor(m) - R * 0.035, R + 0.3, V.facing + side - (R * 0.16) / R - 0.12), u, String(m), R * 0.085, "#ffffff"));
        return out.join("");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: D, d: D, r: R }, 0, 4, Pm)}"/>` +
        `<g data-name="glass">${V.back()}</g><g data-name="liquid" data-part="liquid"></g><g data-name="glass">${V.front()}${patch()}</g>` +
        `<g data-name="scale" style="paint-order:stroke">${scale()}</g><g data-part="words"></g>`;
      g.anchors = { rim: [0, 0, H / 10], spout: G.pointOf(V.F, H + 1.6, R + 3.2, V.facing + Math.PI * 0.62).map((v) => v / 10), inside: [0, 0, BASE / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const draw = () => {
        const z = levelZ(), c = colour();
        w.rebuild(el.liquid, `${z.toFixed(2)} ${c}`, () => V.liquid(z, c));
        if (lab) w.rebuild(el.words, `${Math.round(V.vol(z))} ${st.c1}`, () => LAB.word(Pm, lab, [0, 0, H + 14], "beaker", "#556") + LAB.word(Pm, lab, V.at(Math.max(z, 8), -1.3, 6), `${Math.round(V.vol(z))} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.45, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.f !== want.f || st.mixT < 1;
      };
      g.readout = () => `${ml} mL beaker (${D} × ${H} mm) · ${Math.round(V.vol(levelZ()))} mL of ${st.c1} liquid, ${(levelZ() - BASE).toFixed(0)} mm deep`;
      draw();
      return g;
    },
  });
})();
