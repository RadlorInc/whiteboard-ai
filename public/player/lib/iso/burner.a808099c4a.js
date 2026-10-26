// "burner cx cy k air=0..1 on=0|1 lab=0 lit=base|barrel|collar|tap|flame" — a PART (PARTS.md, batch 2): a school
// Bunsen burner 15 cm tall standing on the bench, its origin the bench point under its middle. A heavy cast base (9 cm
// across) with a domed hub, a gas inlet arm out along +x with a small tap (its lever along the arm = open) and a
// ribbed hose nozzle, the barrel, and the turning air collar whose hole lines up with the barrel's. on=1 lights a
// flame (ISO.flameFx WebGL, LAB.flame SVG without it) whose colour follows air: 0 = collar shut, a tall wavy yellow
// safety flame (about 300 °C); 1 = open, a short roaring blue flame with a pale inner cone (about 1500 °C).
// Built in mm (LAB's units) with Pm = ISO.mm(P); g.P stays the cm camera and the anchors are in cm.
// The burner's geometry follows LAB.bunsen (_lab.js), resized to a real burner and split into named parts.
(() => {
  const K = window.K, G = window.G;
  const H = 150, RB = 45, HUB = [16, 30], RBAR = 5.6, ARMZ = 22, NOZ = 36, FLAME_L = 45;
  let n = 0;

  ISO.add({
    name: "burner", title: "Bunsen burner (part)", compare: null,
    about: "A Bunsen burner 15 cm tall on the bench: turn the air collar and its yellow safety flame becomes a hot blue roaring flame; a part to place under a tripod or a clamped tube. anchors: mouth tap",
    line: "burner cx cy k air=0..1 on=0|1 lab=0 lit=base|barrel|collar|tap|flame",
    demo: { line: "burner 480 480 17 on=1 air=0 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "collar" }, hold: 1.4 }, { set: { air: 1 }, hold: "settle" }, { set: { lit: "tap", air: 0.5 }, hold: "settle" }, { set: { on: 0, lit: "" }, hold: "settle" }, { set: { on: 1, air: 1, lit: "flame" }, hold: "settle" }] },
    make([cx = 480, cy = 450, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", id = `bu${n++}`;
      const st = { air: ISO.clamp(ISO.num(o, "air", 1), 0, 1), lv: ISO.num(o, "on", 1) >= 0.5 ? 1 : 0 }, want = { ...st };
      let lit = o.lit || "", clock = 0;
      const Fz = LAB.Z([0, 0, 0]), face = G.angleToward(Fz, G.viewOf(Pm));
      // ── the base: a heavy cast disc with a turned seam, the domed hub on it, three felt pads under its rim
      const base = [`<path class="iso-halo" d="${K.haloOf({ x: -RB, y: -RB, w: 2 * RB, d: 2 * RB, r: RB }, 0, 8, Pm)}"/>`];
      base.push(S(K.cylinder(0, 0, RB, 0, 7, Pm, 64, 0.8), { tone: "mid", inner: L(K.sideArc(0, 0, RB, 3.2, Pm, 48), { tone: "faint" }) }));
      base.push(S(G.solidOf([[7, 41], [9, 38, 1], [12, 30, 1], [15, 20, 1], [HUB[0], 12]], Fz, Pm, { steps: 48 }), { tone: "mid", inner: L(G.arcOf(Fz, 7.05, 41.02, Pm, { trim: 0 }), { tone: "faint" }) }));
      // the hub: the gas way's block the barrel screws into (the inlet arm comes off its side)
      const hub = S(K.cylinder(0, 0, 8, HUB[0], HUB[1] - HUB[0], Pm, 32, 0.5), { tone: "mid", inner: L(K.sideArc(0, 0, 8, HUB[0] + 3, Pm, 24), { tone: "faint" }) }) +
        S(K.cylinder(0, 0, 7.6, HUB[1], 3.2, Pm, 6, 0.3), { tone: "mid" });   // the hex nut the barrel screws in through
      // ── the inlet arm along +x: a pipe out of the hub, the tap's body, then the ribbed hose nozzle
      const Fa = LAB.A([0, 0, ARMZ], [1, 0, 0]), TAPX = 17;
      const arm = S(G.disc(7, TAPX - 3.5, 3.2, Fa, Pm), { tone: "mid" }) +
        S(G.solidOf([[TAPX + 3.5, 3.6], [TAPX + 6, 3.6], [TAPX + 6, 3], [TAPX + 9, 3.4], [TAPX + 9, 2.8], [TAPX + 12, 3.2], [TAPX + 12, 2.6], [TAPX + 15, 3], [TAPX + 15, 2.5], [NOZ, 2.5]], Fa, Pm), { tone: "mid" });
      const tapBody = S(K.cylinder(TAPX, 0, 4.4, ARMZ - 5, 10, Pm, 24, 0.4), { tone: "mid" }) + S(K.cylinder(TAPX, 0, 2, ARMZ + 5, 2.2, Pm, 16), { tone: "mid" });
      // the tap's lever on its spindle: along the arm when open, across it when shut (redrawn when on changes)
      const lever = (open) => {
        const a = open ? 0 : Math.PI / 2, d = [Math.cos(a), Math.sin(a)], at = (u, w, z) => [TAPX + d[0] * u - d[1] * w, d[1] * u + d[0] * w, z];
        return ISO.tinted(ISO.T.amber, ISO.box(at, Pm, [-3, 15], [-2, 2], [ARMZ + 7.2, ARMZ + 9.4], "hi")) + LAB.D([K.iso([TAPX, 0, ARMZ + 9.4], Pm)], { size: 0.4 });
      };
      // ── the barrel with its rim and dark mouth, the collar with its knurl; the collar's hole and lever turn with air
      const barrel = S(K.cylinder(0, 0, RBAR, HUB[1], H - HUB[1] - 1.6, Pm, 32), { tone: "hi", crease: "none", inner: L(K.sideArc(0, 0, RBAR, H - 8, Pm, 24), { tone: "faint" }) }) +
        S(K.cylinder(0, 0, RBAR + 0.5, H - 1.6, 1.6, Pm, 32, 0.3), { tone: "mid" }) +
        `<path d="${K.pathOf(K.circleRing(0, 0, RBAR - 1.4, 24).map(([a, b]) => K.iso([a, b, H], Pm)), true)}" fill="#2a2e33"/>`;
      const C0 = HUB[1] + 4.5, C1 = C0 + 14, RC = RBAR + 1.2;
      const collarRing = S(K.cylinder(0, 0, RC, C0, C1 - C0, Pm, 32, 0.4), { tone: "mid", inner: L(K.knurl(0, 0, RC, C1 - 4, C1 - 0.6, 30, Pm, 0.2), { tone: "lo" }) });
      const collar = (air) => {
        const open = 0.15 + 0.85 * air, a0 = face - 0.45 * open, a1 = face + 0.45 * open, hole = [];
        for (let i = 0; i <= 8; i++) hole.push(K.iso(G.pointOf(Fz, C0 + 2.5, RC + 0.05, a0 + ((a1 - a0) * i) / 8), Pm));
        for (let i = 8; i >= 0; i--) hole.push(K.iso(G.pointOf(Fz, C0 + 7, RC + 0.05, a0 + ((a1 - a0) * i) / 8), Pm));
        const la = face + 1.6 - 1.0 * air;   // beside the hole, never over it
        return `<path d="${K.pathOf(hole, true)}" fill="#1f2328" stroke="#3a3f46" stroke-width="0.6"/>` +
          S(G.disc(RC - 0.2, RC + 6.5, 1.1, LAB.A([0, 0, C0 + 5], [Math.cos(la), Math.sin(la), 0]), Pm), { tone: "mid" });
      };
      // painter's order: base, hub, then the arm (it points toward the viewer's right, in front of the hub's far side)
      g.innerHTML = LAB.flameDefs(id) + `<g data-name="base">${base.join("")}${hub}</g><g data-name="tap">${arm}${tapBody}<g data-part="lever"></g></g>` +
        `<g data-name="barrel">${barrel}</g><g data-name="collar">${collarRing}<g data-part="collar"></g></g><g data-name="flame" data-part="flame"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), O = [0, 0, H + 0.5];
      // the shader is the slow part of the build: its own build part (ISO.later); until it runs the SVG flame shows
      let fx = null;
      g.anchors = { mouth: [0, 0, H / 10], tap: [NOZ / 10, 0, ARMZ / 10] };
      const draw = () => {
        const a = Math.round(st.air * 40) / 40, lv = Math.round(st.lv * 40) / 40, tq = Math.round(clock * 24) / 24;
        w.rebuild(el.collar, String(a), () => collar(a));
        w.rebuild(el.lever, String(want.lv > 0.5), () => lever(want.lv > 0.5));
        if (fx) { fx.flame(a, lv); w.rebuild(el.flame, "gl", () => ""); }
        else w.rebuild(el.flame, lv ? `${a} ${lv} ${tq}` : "", () => (lv ? `<g opacity="${Math.min(1, lv * 1.4).toFixed(2)}">${LAB.flame(Pm, O, a, FLAME_L * (0.35 + 0.65 * lv), tq, id)}</g>` : ""));
        if (lab) w.rebuild(el.words, `${a} ${lv > 0.5}`, () => (lv > 0.5 ? LAB.word(Pm, lab, [0, 0, H + (a > 0.6 ? 72 : 108)], a > 0.6 ? "blue roaring flame" : a < 0.25 ? "yellow safety flame" : "air hole half open", a > 0.6 ? "#2b5cc4" : "#b0701a", { size: 14 }) : "") +
          LAB.word(Pm, lab, [-RC - 4, 0, C0 + 6], "air hole", "#556", { anchor: "end" }) + LAB.word(Pm, lab, [NOZ + 4, 0, ARMZ - 2], "gas in", "#556", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.air !== undefined) want.air = ISO.clamp(+p.air, 0, 1);
        if (p.on !== undefined) want.lv = +p.on >= 0.5 ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt, c) => {
        const calm = ISO.still();
        clock = calm ? 0 : c || clock + dt;
        for (const key of ["air", "lv"]) { st[key] = ISO.follow(st[key], want[key], dt, key === "air" ? 0.4 : 0.25, calm); if (Math.abs(st[key] - want[key]) < 0.003) st[key] = want[key]; }
        draw();
        return st.air !== want.air || st.lv !== want.lv;
      };
      g.readout = () => (st.lv < 0.5 ? "burner off · gas tap shut" : st.air > 0.6 ? `air hole open ${Math.round(st.air * 100)}% · blue roaring flame · about 1500 °C above the inner cone · no soot` : st.air < 0.25 ? "air hole shut · yellow safety flame · about 300 °C · easy to see, sooty" : `air hole ${Math.round(st.air * 100)}% open · flame turning blue and hotter`);
      draw();
      ISO.later(() => { fx = ISO.flameFx(g, Pm, 960, 540, el.flame, O, FLAME_L); draw(); });
      return g;
    },
  });
})();
