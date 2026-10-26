// "teatpipette cx cy k aim=down|flat fill=0..1 c=… drops=0..40 lab=0 lit=bulb|barrel|liquid" — a PART (PARTS.md): a
// dropper (teat pipette), origin its tip. A red rubber bulb (2.2 cm across) on a 1 cm glass barrel that narrows to a fine
// tip, 13.2 cm in all (dropper.js's own shapes). aim=down hangs it tip-down over a tube or a well; aim=flat lies it on
// the bench (origin then its middle on the surface, resting on the bulb and the tip). fill = how far up the barrel the
// liquid stands. set({ drops: n }) squeezes the bulb until n drops in all have fallen: each swells at the tip until its
// weight beats surface tension (about 0.05 mL, 4.6 mm across), breaks off and falls under gravity (9.81 m/s²) `fall` cm
// (default 6), and the level in the 8 mm bore drops 1 mm a drop; an empty dropper gives no more. Built in mm.
(() => {
  const K = window.K, G = window.G;
  const BAR = [[0, 0.9], [6, 1.6], [24, 3.6, 1], [30, 5], [92, 5]], DROP_ML = 0.05, BORE = 4, LEN = 132, LOW = 8, HIGH = 80;
  const MMPERDROP = (DROP_ML * 1000) / (Math.PI * BORE * BORE);
  const FLAT = Math.asin((11 - 1) / 109);   // lying: the bulb's belly and the tip both on the bench

  ISO.add({
    name: "teatpipette", title: "Dropper / teat pipette (part)", compare: null,
    about: "A dropper (teat pipette): squeeze the red rubber bulb and drops of about 0.05 mL swell at the glass tip, break off and fall; hangs tip-down over a tube or lies on the bench. anchors: tip top",
    line: "teatpipette cx cy k aim=down|flat fill=0..1 c=clear|blue|red|green|purple|… drops=0..40 fall=1..30 lab=0 lit=bulb|barrel|liquid",
    demo: { line: "teatpipette 480 400 26 aim=down fill=0.6 c=purple fall=4", script: [{ set: { drops: 3, lit: "bulb" }, hold: "settle" }, { set: { drops: 5, lit: "liquid" }, hold: "settle" }, { set: { lit: "barrel" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const flat = o.aim === "flat", c = o.c || "clear", fall = ISO.clamp(ISO.num(o, "fall", 6), 1, 30) * 10;
      const AX = flat ? [Math.cos(FLAT), 0, Math.sin(FLAT)] : [0, 0, 1], tip = flat ? [-(LEN / 2) * Math.cos(FLAT), 0, 1] : [0, 0, 0];
      const at = (s) => [tip[0] + AX[0] * s, 0, tip[2] + AX[2] * s];
      const st = { n: 0, want: 0, sq: 0, drop: 0, fallZ: null, fallV: 0, lvl: LOW + (HIGH - LOW) * ISO.clamp(ISO.num(o, "fill", 0.6), 0, 1) };
      st.want = flat ? 0 : Math.max(0, Math.round(ISO.clamp(ISO.num(o, "drops", 0), 0, 40)));
      let lit = o.lit || "";
      const glass = LAB.vessel(Pm, tip, BAR, { axis: flat ? AX : null, base: 0.4, wall: 1, rim: false });
      g.innerHTML = `<g data-name="barrel">${glass.back()}</g><g data-name="liquid" data-part="liquid"></g><g data-name="barrel">${glass.front()}</g><g data-part="bulb" data-name="bulb"></g><g data-part="drop"></g><g data-part="words"></g>`;
      g.anchors = { tip: [0, 0, 0].map((v, i) => tip[i] / 10), top: at(LEN).map((v) => v / 10) };
      const el = LAB.parts(g), w = ISO.writer();
      const level = () => Math.max(LOW, st.lvl - (st.n + (st.fallZ !== null ? 1 : 0) + st.drop) * MMPERDROP);
      const canDrop = () => level() - MMPERDROP > LOW + 0.5;
      // lying flat the liquid runs to the low end: drawn along the axis as a short slug from the tip
      const draw = () => {
        w.rebuild(el.liquid, level().toFixed(2), () => (level() > LOW + 0.3 || !flat ? glass.liquid(level(), c, { meniscus: true }) : ""));
        w.rebuild(el.bulb, st.sq.toFixed(3), () => {
          const sq = ISO.ease(st.sq), prof = [[84, 6.2], [86, 6.2]];
          for (let i = 0; i <= 14; i++) { const u = i / 14, r = (5.6 + 5.4 * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.7) * (1 - 0.32 * sq * Math.sin(Math.PI * u)); prof.push([86 + u * 46, Math.max(i === 14 ? 2 : 4, r), 1]); }
          return LAB.turned(Pm, tip, prof, ["#a8362b", "#ef7a68"], "#5a1a12", { axis: flat ? AX : null, rims: [86, 92] });
        });
        w.rebuild(el.drop, `${st.drop.toFixed(3)} ${st.fallZ === null ? "" : st.fallZ.toFixed(1)}`, () => {
          const out = [];
          if (st.drop > 0.02) { const r = 2.3 * Math.cbrt(st.drop); out.push(LAB.drop(Pm, [0, 0, -r * 0.9], r, c)); }
          if (st.fallZ !== null) out.push(LAB.drop(Pm, [0, 0, st.fallZ], 2.3, c));
          return out.join("");
        });
        if (lab) w.rebuild(el.words, String(st.n), () => LAB.word(Pm, lab, at(LEN + 14), "rubber bulb", "#556") + (flat ? "" : LAB.word(Pm, lab, [6, 0, -10], `${st.n} drop${st.n === 1 ? "" : "s"} · ${(st.n * DROP_ML).toFixed(2)} mL`, LAB.ink(c), { anchor: "start", size: 13 })));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.drops !== undefined && !flat && Number.isFinite(+p.drops)) st.want = ISO.clamp(Math.round(+p.drops), 0, 40);
        if (p.fill !== undefined && Number.isFinite(+p.fill)) { st.lvl = LOW + (HIGH - LOW) * ISO.clamp(+p.fill, 0, 1) + st.n * MMPERDROP; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (ISO.still()) { while (st.n < st.want && canDrop()) st.n++; st.sq = 0; st.drop = 0; st.fallZ = null; draw(); return false; }
        const pending = st.n + (st.fallZ !== null ? 1 : 0) < st.want && (st.fallZ !== null || canDrop());
        st.sq = ISO.follow(st.sq, pending ? 1 : 0, dt, 0.18);
        if (Math.abs(st.sq - (pending ? 1 : 0)) < 0.004) st.sq = pending ? 1 : 0;
        if (pending && st.fallZ === null && st.sq > 0.6) st.drop = Math.min(1, st.drop + dt / 0.7);   // the drop swells while the bulb is pressed
        if (st.drop >= 1 && st.fallZ === null) { st.fallZ = -2.3; st.fallV = 0; st.drop = 0; }          // weight beats surface tension
        if (st.fallZ !== null) {
          st.fallV += 9810 * dt; st.fallZ -= st.fallV * dt;
          if (st.fallZ <= -fall) { st.fallZ = null; st.n++; }
        }
        if (!pending && st.drop > 0 && st.fallZ === null) st.drop = Math.max(0, st.drop - dt / 0.4);    // let go: a half-swollen drop draws back
        draw();
        return pending || st.sq > 0 || st.fallZ !== null || st.drop > 0;
      };
      g.readout = () => (flat ? `dropper lying on the bench · ${(level() - LOW).toFixed(0)} mm of ${c} liquid in the barrel` : `${st.n} drop${st.n === 1 ? "" : "s"} out · about ${DROP_ML} mL each → ${(st.n * DROP_ML).toFixed(2)} mL · ${st.sq > 0.5 ? "bulb squeezed" : "bulb released"}${canDrop() ? "" : " · empty"}`);
      draw();
      return g;
    },
  });
})();
