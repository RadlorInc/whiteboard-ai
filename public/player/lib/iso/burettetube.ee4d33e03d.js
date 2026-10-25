// "burettetube cx cy k level=0..50 open=0|1 c=clear|… lab=0 lit=burette|tap|stand|scale|liquid" — a PART (PARTS.md,
// batch 4): a 50 mL class A burette in a burette clamp on its own retort stand, origin the bench point straight under
// its tip (the tip is 28 cm above the bench: room for a conical flask on a tile). The stand stands behind it (−y): a
// cast base 13 × 20 cm, a 75 cm rod, a boss head and a clamp reaching 11 cm forward to the burette (LAB.standBase,
// LAB.rod, LAB.boss, LAB.clamp, as retortstand.js). The burette: an 11.5 mm bore (1 mL = 9.6 mm), a scale from 0.00 at
// the top to 50 mL with a line every 0.1 mL (half-way lines every 0.5, long lines every 1, numbered every 1), its
// marking, a glass stopcock barrel with a PTFE key whose blue handle turns from across the tube (shut) to along it
// (open), and a drawn delivery tip. level is the reading (mL, at the bottom of the meniscus: the liquid's surface is
// level × 9.6 mm below the 0 mark). open=1 turns the tap: drops form at the tip and fall, and the reading rises at about
// 0.5 mL/s (easing in and out) until open=0 or 50 mL. set({ level, open, c }). Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const BORE = 5.75, R = 7.25, MMML = 1000 / (Math.PI * BORE * BORE), CAP = 50, RATE = 0.5;   // bore radius, outer radius, mm per mL
  const ZTIP = 280, ZS = 345, ZB = ZS + 8, S50 = 70, S0 = S50 + CAP * MMML, LT = Math.round(S0 + 70), ZTOP = ZB + LT;
  const ROD = [0, -110], RODTOP = 750, BASE = { x: -65, y: -280, w: 130, d: 200, r: 5 }, ZC = 690, REACH = -ROD[1];
  const PTFE = ISO.tint("#f6f7f8", ["#c9ced4", "#d6dade", "#e2e5e8", "#eceef0"], "#5d6670");

  ISO.add({
    name: "burettetube", title: "Burette on a stand (part)", compare: null,
    about: "A 50 mL burette in a burette clamp on its own retort stand, its tip 28 cm over the bench for a conical flask; the scale reads 0 at the top to 50 mL, and opening the tap lets drops fall as the reading rises. anchors: tip top",
    line: "burettetube cx cy k level=0..50 open=0|1 c=clear|… lab=0 lit=burette|tap|stand|scale|liquid",
    demo: { line: "burettetube 480 480 3.5 level=0 c=clear", script: [{ set: { lit: "scale" }, hold: 1.2 }, { set: { open: 1, lit: "tap" }, hold: 5 }, { set: { open: 0, lit: "" }, hold: "settle" }, { set: { level: 20, c: "purple", lit: "liquid" }, hold: "settle" }, { set: { lit: "stand" }, hold: 1.2 }, { set: { lit: "burette" }, hold: 1.2 }] },
    make([cx = 480, cy = 480, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const bur = LAB.vessel(Pm, [0, 0, ZB], [[0, 3.8], [8, 3.8], [20, R - 0.2, 1], [24, R], [LT, R], [LT + 1, R + 1, 1], [LT + 3, R + 0.8]], { base: 4, wall: R - BORE });
      // the delivery tip: a drawn glass jet below the stopcock, pointing down; its own inside always full of liquid
      const TIP = [[0, 1.5], [1, 1.9, 1], [16, 2.6], [44, 3.4], [ZS - 6 - ZTIP, 4]], TIPIN = [[0.3, 0.45], [16, 1], [44, 1.4], [ZS - 6 - ZTIP, 1.6]];
      const tip = LAB.vessel(Pm, [0, 0, ZTIP], TIP, { base: 0, wall: 0.8, rim: false });
      const st = { lv: ISO.clamp(ISO.num(o, "level", 0), 0, CAP), open: o.open === "1", tap: o.open === "1" ? 1 : 0, rate: 0, drops: [], bead: 0, c0: o.c || "clear", c1: o.c || "clear", mixT: 1 };
      const want = { lv: st.lv };
      let lit = o.lit || "";
      // ── the stand (static): base, rod split round the boss, the boss, the clamp's back half; the clamp's front later
      const z = ZC - 6.5, cl = LAB.clamp(Pm, ROD, z, [0, 1], REACH, R + 0.2, { jawH: 16 });
      const rodSeg = (z0, z1) => S(K.cylinder(ROD[0], ROD[1], 4, z0, z1 - z0, Pm, 24), { tone: "mid", crease: "none" });
      const Fs = LAB.A([-(R + 6), -R - 1.4, ZC], [1, 0, 0]), nx = 2 * R + 12;
      const screw = S(G.disc(0, nx + 3, 1.2, Fs, Pm), { tone: "mid" }) + S(G.disc(-1.6, 0, 2.4, Fs, Pm), { tone: "mid" }) + S(G.disc(nx - 0.5, nx + 1.8, 2.6, Fs, Pm), { tone: "mid" }) +
        ISO.wbox(Pm, [R + 6, R + 7.2], [-R - 2.6, -R - 0.2], [ZC - 6, ZC + 6], "mid");
      const standSvg = () => ISO.tinted(ISO.T.paint, LAB.standBase(Pm, BASE, ROD)) + `<g transform="${K.translateAlong(Pm, [0, 0, 7.6])}">${ISO.plate(Pm, { x: -20, y: -230, w: 40, d: 16, r: 1 })}</g>` +
        rodSeg(14, z) + LAB.boss(Pm, ROD, z, [0, 1]) + rodSeg(z + 13, RODTOP) + S(K.cylinder(ROD[0], ROD[1], 4.4, RODTOP, 1.6, Pm, 24, 0.4), { tone: "mid" }) + cl.back + screw;
      // ── the scale: a rule up the near side, a line every 0.1 mL hanging from it, numbers every 1 mL, the marking
      const scale = () => {
        const a = bur.facing - 0.5, r = R + 0.15, rule = [], minor = [], half = [], major = [], nums = [];
        for (let i = 0; i <= CAP * 4; i++) rule.push(K.iso(G.pointOf(bur.F, S0 - (i / 4) * MMML, r, a), Pm));
        for (let v = 0; v <= CAP * 10; v++) {
          const s = S0 - (v / 10) * MMML, n = v % 10 === 0 ? 6.2 : v % 5 === 0 ? 4 : 2.4;
          (v % 10 === 0 ? major : v % 5 === 0 ? half : minor).push(K.pathOf([0, 0.5, 1].map((q) => K.iso(G.pointOf(bur.F, s, r, a + (q * n) / r), Pm))));
          if (v % 10 === 0) { const an = a + 9.4 / r; nums.push(LAB.faceText(Pm, G.pointOf(bur.F, s - 1.5, r + 0.1, an), G.mul3(G.tangentOf(bur.F, an), -1), String(v / 10), 4.2, "#24425c")); }
        }
        const mid = bur.facing - 0.1, u = G.mul3(G.tangentOf(bur.F, mid), -1);
        return L(K.pathOf(rule), { tone: "mid" }) + L(minor.join(""), { tone: "lo", free: "end" }) + L(half.join(""), { tone: "mid", free: "end" }) + L(major.join(""), { tone: "hi", free: "end" }) + nums.join("") +
          LAB.faceText(Pm, G.pointOf(bur.F, S0 + 34, r + 0.1, mid), u, "50 mL", 3.8, "#24425c") + LAB.faceText(Pm, G.pointOf(bur.F, S0 + 28, r + 0.1, mid), u, "0.1  A", 2.8, "#24425c") +
          LAB.faceText(Pm, G.pointOf(bur.F, S0 + 23, r + 0.1, mid), u, "Ex 20 °C", 2.4, "#24425c") + LAB.faceText(Pm, G.pointOf(bur.F, S0 + 18.5, r + 0.1, mid), u, "± 0.05", 2.4, "#24425c");
      };
      // ── the stopcock: a glass barrel across the tube (along x), the PTFE key, its lock nut (−x, behind) and handle (+x)
      const FX = LAB.X([0, 0, ZS]);
      const barrel = `<g style="${ISO.T.glass}">${S(G.solidOf([[-12, 4.6], [-11, 5.4, 1], [11, 5.4], [12, 4.6, 1]], FX, Pm), { tone: "mid" })}${S(G.solidOf([[0, 4.4], [4, 4.4], [8, 3.8]], LAB.Z([0, 0, ZS + 2]), Pm), { tone: "mid" })}</g>`;
      const nut = ISO.tinted(PTFE, S(G.disc(-13.5, -12, 4.2, FX, Pm), { tone: "mid" }) + S(G.disc(-19, -13.5, 4.6, FX, Pm), { tone: "mid", inner: L(G.ribsOf(FX, -19, -13.5, 4.6, 16, Pm), { tone: "lo" }) }) + S(G.disc(-21, -19, 2, FX, Pm), { tone: "mid" }));
      const handle = (open) => {
        const th = (1 - open) * (Math.PI / 2), d = [0, Math.sin(th), Math.cos(th)], n = [0, Math.cos(th), -Math.sin(th)];
        const at = (u, w, x) => [x, d[1] * u + n[1] * w, ZS + d[2] * u + n[2] * w];
        return ISO.tinted(PTFE, S(G.disc(12, 14, 4.4, FX, Pm), { tone: "mid" })) + ISO.tinted(ISO.T.blue, S(G.disc(14, 17, 3.4, FX, Pm), { tone: "hi" }) + ISO.box(at, Pm, [-11, 11], [-2.2, 2.2], [17, 20.5], "hi") + ISO.box(at, Pm, [-11, -8.5], [-2.2, 2.2], [20.5, 21.6], "hi") + ISO.box(at, Pm, [8.5, 11], [-2.2, 2.2], [20.5, 21.6], "hi"));
      };
      g.innerHTML = `<g data-name="stand" data-part="standback"></g><g data-name="tap">${nut}</g>` +
        `<g data-name="burette">${tip.back()}</g><g data-name="liquid" data-part="tipliq"></g><g data-name="burette">${tip.front({ shine: false })}${bur.back()}</g>` +
        `<g data-name="liquid" data-part="liquid"></g><g data-name="burette">${bur.front()}</g><g data-name="scale" data-part="scale" style="paint-order:stroke"></g>` +
        `<g data-name="tap">${barrel}<g data-part="handle"></g></g><g data-name="stand">${cl.front}</g><g data-name="liquid" data-part="drops"></g><g data-part="words"></g>`;
      g.anchors = { tip: [0, 0, ZTIP / 10], top: [0, 0, (ZTOP + 3) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      ISO.later(() => { el.standback.innerHTML = standSvg(); });   // the stand and the 501 ticks: build parts of their own (phone budget)
      ISO.later(() => { el.scale.innerHTML = scale(); });
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const q = Math.max(0.005, 1 / (3 * MMML * G.scaleOf(Pm)));   // a visible step of the surface: a third of a board pixel
      const draw = () => {
        const lv = Math.round(st.lv / q) * q, s = S0 - lv * MMML, c = colour(), ink = LAB.ink(c);
        w.rebuild(el.liquid, `${lv.toFixed(3)} ${c}`, () => {
          const rise = 1.5, lo = G.arcOf(bur.F, s, BORE, Pm, { least: -0.3 }), hi = G.arcOf(bur.F, s + rise, BORE, Pm, { least: -0.3 });
          return bur.liquid(s, c, { meniscus: false, opacity: 0.6 }) + `<path d="${G.circleOf(bur.F, s + rise, BORE, Pm)}" fill="none" stroke="${ink}" stroke-width="0.5" opacity=".55"/><path d="${hi}" fill="none" stroke="${ink}" stroke-width="0.8" opacity=".75"/><path d="${lo}" fill="none" stroke="${ink}" stroke-width="1.1"/>`;
        });
        w.rebuild(el.tipliq, c, () => `<g opacity=".6">${LAB.turned(Pm, [0, 0, ZTIP], TIPIN, [LAB.mix(LAB.col(c), "#000000", 0.18), LAB.mix(LAB.col(c), "#ffffff", 0.2)], ink)}</g>`);
        w.rebuild(el.handle, st.tap.toFixed(2), () => handle(st.tap));
        // the drop forming on the tip (it swells to 0.05 mL and lets go) and the ones falling
        w.rebuild(el.drops, `${st.bead.toFixed(2)} ${st.drops.map((d) => d.z.toFixed(0)).join()} ${c}`, () =>
          (st.bead > 0.08 ? LAB.drop(Pm, [0, 0, ZTIP - 1.2 - 1.6 * st.bead], 2.3 * Math.cbrt(st.bead), c) : "") + st.drops.map((d) => LAB.drop(Pm, [0, 0, d.z], 2.3, c)).join(""));
        if (lab) w.rebuild(el.words, `${st.lv.toFixed(2)} ${st.c1}`, () => LAB.word(Pm, lab, bur.at(s, 1.3, 14), `${st.lv.toFixed(2)} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }) + LAB.word(Pm, lab, [0, 0, ZTOP + 16], "burette", "#556", { dy: -4 }) +
          LAB.word(Pm, lab, [30, 0, ZS], "tap", "#556", { anchor: "start", dy: 4 }) + LAB.word(Pm, lab, [ROD[0] + 10, ROD[1], RODTOP - 40], "stand", "#556", { anchor: "start" }) + LAB.word(Pm, lab, [-R - 14, 0, ZC + 10], "clamp", "#556", { anchor: "end" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.level !== undefined) want.lv = ISO.clamp(+p.level, 0, CAP);
        if (p.open !== undefined) st.open = String(p.open) === "1";
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (ISO.still()) {
          // the end pose: the tap where it was set, the reading where it was set, nothing falling
          Object.assign(st, { tap: st.open ? 1 : 0, rate: 0, drops: [], bead: 0, lv: want.lv, mixT: 1 });
          draw(); return false;
        }
        const tapTo = st.open ? 1 : 0;
        st.tap = ISO.follow(st.tap, tapTo, dt, 0.12);
        if (Math.abs(st.tap - tapTo) < 0.005) st.tap = tapTo;
        // flow follows the tap (eased in and out), and stops at the 50 mL line
        const flowTo = st.open && want.lv < CAP ? RATE * st.tap : 0;
        st.rate = ISO.follow(st.rate, flowTo, dt, 0.35);
        if (flowTo === 0 && st.rate < 0.004) st.rate = 0;
        if (st.rate > 0) {
          const dv = Math.min(CAP - want.lv, st.rate * dt);
          want.lv += dv;
          st.bead += dv / 0.05;
          if (st.bead >= 1) { st.bead -= 1; st.drops.push({ z: ZTIP - 4, v: 0 }); }
        } else if (st.bead > 0 && !st.open) st.bead = Math.max(0, st.bead - dt * 0.6);   // a part-formed drop draws back up
        for (const d of st.drops) { d.v += 9810 * dt; d.z -= d.v * dt; }
        st.drops = st.drops.filter((d) => d.z > 12);
        // while it runs, the reading is what has run out (the flow itself eases); a level set by hand eases there
        st.lv = st.rate > 0 ? want.lv : ISO.follow(st.lv, want.lv, dt, 0.45);
        if (Math.abs(st.lv - want.lv) < 0.001) st.lv = want.lv;
        st.mixT = Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.tap !== tapTo || st.rate > 0 || st.drops.length > 0 || st.lv !== want.lv || st.mixT < 1 || (st.bead > 0 && !st.open);
      };
      g.readout = () => `50 mL burette · reads ${st.lv.toFixed(2)} mL at the bottom of the meniscus · tap ${st.tap > 0.5 ? `open, ${st.rate.toFixed(2)} mL/s (${Math.round(st.rate / 0.05)} drops a second)` : "shut"} · tip 28 cm above the bench`;
      draw();
      return g;
    },
  });
})();
