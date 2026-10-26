// "dropper cx cy length c=purple rot=deg lab=1 lit=bulb|dropper|tile" — a glass dropper (teat pipette) over a spotting tile.
// A rubber bulb on a glass barrel that narrows to a fine tip, held in a clamp. Squeezing the bulb pushes liquid out: a
// drop swells at the tip until its weight beats surface tension (about 0.05 mL, a drop 4.6 mm across), breaks off,
// falls under gravity (9.81 m/s²) and lands in the middle well, and the level in the barrel drops 1 mm per drop
// (barrel bore 8 mm). set({ drops: n }) squeezes until n drops have fallen in all, then lets the bulb go.
// rot tilts the dropper (degrees), as the app's line does.
(() => {
  const K = window.K, G = window.G;
  const TIP = 54, BAR = [[0, 0.9], [6, 1.6], [24, 3.6, 1], [30, 5], [92, 5]], DROP_ML = 0.05, BORE = 4;
  const BASE = { x: -55, y: -92, w: 110, d: 62, r: 4 }, ROD = [0, -66], TILE = { x: -48, y: -20, w: 96, d: 40, r: 3 }, WELLS = [-28, 0, 28];
  const MMPERDROP = (DROP_ML * 1000) / (Math.PI * BORE * BORE);

  ISO.add({
    name: "dropper", title: "Dropper (teat pipette)", compare: "dropper 480 260 220 c=purple",
    about: "A dropper over a spotting tile: squeeze the bulb and drops of about 0.05 mL swell, break off and fall into the well.",
    line: "dropper cx cy length c=purple rot=deg drops=0 lab=1 lit=bulb|dropper|tile",
    demo: { line: "dropper 480 270 230 c=purple", script: [{ set: { drops: 3, lit: "bulb" }, hold: "settle" }, { set: { drops: 6, lit: "tile" }, hold: "settle" }] },
    make([cx, cy, size = 220], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.75, H2 = size * 1.6, c = o.c || "purple";
      const th = (ISO.clamp(ISO.num(o, "rot", 0), -30, 30) * Math.PI) / 180, AX = [Math.sin(th), 0, Math.cos(th)];
      const tipAt = [0, 0, TIP], at = (s) => [tipAt[0] + AX[0] * s, 0, TIP + AX[2] * s];
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 0, 8), ...K.boxCorners(TILE, 0, 10), [0, -66, 200], at(150)], cx, cy, W, H2, { azimuth: 52, elevation: 20 }, parent);
      const st = { n: 0, want: Math.max(0, Math.round(ISO.num(o, "drops", 0))), sq: 0, drop: 0, fallZ: null, fallV: 0 };
      let lit = o.lit || "";
      const zClamp = TIP + 66;
      const cl = LAB.clamp(P, ROD, zClamp - 6.5, [0, 1], 66, 5.6);
      // the spotting tile: white glazed slab with three hollow wells
      const tile = () => {
        const out = [LAB.mat(P, TILE, 10, "lo", ISO.tint("#ffffff", ["#d9dcdf", "#e3e6e8", "#eceef0", "#f5f6f7"], "#7c8389"))];
        for (const x of WELLS) out.push(`<path d="${K.pathOf(K.circleRing(x, 0, 11, 40).map(([a, b]) => K.iso([a, b, 10], P)), true)}" fill="#e6e9ec" stroke="#8a9198" stroke-width="0.7"/>`, `<path d="${K.pathOf(K.circleRing(x, 0, 11, 40).filter(([a, b]) => K.depthOf([a, b, 0], P) < K.depthOf([x, 0, 0], P)).map(([a, b]) => K.iso([a, b, 7], P)))}" fill="none" stroke="#c4c9ce" stroke-width="1.6"/>`);
        return out.join("");
      };
      const glass = LAB.vessel(P, tipAt, BAR, { axis: AX, base: 0.4, wall: 1, rim: false });
      g.innerHTML = `<g data-name="stand">${LAB.standBase(P, BASE, ROD)}${LAB.rod(P, ROD, 14, 200)}</g><g data-name="tile">${tile()}</g><g data-part="puddle"></g><g data-name="stand">${LAB.boss(P, ROD, zClamp - 6.5, [0, 1])}${cl.back}</g>` +
        `<g data-name="dropper">${glass.back()}</g><g data-part="liquid"></g><g>${glass.front()}</g><g data-part="bulb" data-name="bulb"></g><g data-name="stand">${cl.front}</g><g data-part="drop"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const level = () => Math.max(8, 72 - (st.n + (st.fallZ !== null ? 1 : 0) + st.drop) * MMPERDROP);
      const draw = () => {
        w.rebuild(el.liquid, level().toFixed(2), () => glass.liquid(level(), c, { meniscus: true }));
        w.rebuild(el.bulb, st.sq.toFixed(3), () => {
          const sq = ISO.ease(st.sq), prof = [];
          for (let i = 0; i <= 14; i++) { const u = i / 14, r = (5.6 + 5.4 * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.7) * (1 - 0.32 * sq * Math.sin(Math.PI * u)); prof.push([86 + u * 46, Math.max(i === 14 ? 2 : 4, r), 1]); }
          prof.unshift([84, 6.2], [86, 6.2]);
          return LAB.turned(P, tipAt, prof, ["#a8362b", "#ef7a68"], "#5a1a12", { axis: AX, rims: [86] });
        });
        w.rebuild(el.drop, `${st.drop.toFixed(3)} ${st.fallZ === null ? "" : st.fallZ.toFixed(1)}`, () => {
          const out = [];
          if (st.drop > 0.02) { const r = 2.3 * Math.cbrt(st.drop); out.push(LAB.drop(P, [tipAt[0], 0, TIP - r * 0.9], r, c)); }
          if (st.fallZ !== null) out.push(LAB.drop(P, [0, 0, st.fallZ], 2.3, c));
          return out.join("");
        });
        w.rebuild(el.puddle, String(st.n), () => (st.n ? `<path d="${K.pathOf(K.circleRing(0, 0, Math.min(9, 3 + 1.3 * Math.sqrt(st.n) * 2), 36).map(([a, b]) => K.iso([a, b, 8.6], P)), true)}" fill="${LAB.col(c)}" stroke="${LAB.ink(c)}" stroke-width="0.6" opacity=".9"/>` : ""));
        if (lab) w.rebuild(el.words, String(st.n), () => LAB.word(P, lab, at(150), "rubber bulb", "#556", { dy: -6 }) + LAB.word(P, lab, [TILE.x + TILE.w, 20, 0], `${st.n} drop${st.n === 1 ? "" : "s"} · ${(st.n * DROP_ML).toFixed(2)} mL`, LAB.ink(c), { anchor: "start", dy: 14 }) + LAB.word(P, lab, [TILE.x, 20, 0], "spotting tile", "#556", { anchor: "end", dy: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.drops !== undefined) st.want = ISO.clamp(Math.round(+p.drops), 0, 40);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (ISO.still()) { st.n = Math.max(st.n, st.want); st.sq = 0; st.drop = 0; st.fallZ = null; draw(); return false; }
        const pending = st.n + (st.fallZ !== null ? 1 : 0) < st.want;
        st.sq = ISO.follow(st.sq, pending ? 1 : 0, dt, 0.18);
        if (Math.abs(st.sq - (pending ? 1 : 0)) < 0.004) st.sq = pending ? 1 : 0;
        if (pending && st.sq > 0.6) st.drop = Math.min(1, st.drop + dt / 0.7);          // the drop swells while the bulb is pressed
        if (st.drop >= 1 && st.fallZ === null) { st.fallZ = TIP - 2.3; st.fallV = 0; st.drop = 0; }   // weight beats surface tension
        if (st.fallZ !== null) {
          st.fallV += 9810 * dt; st.fallZ -= st.fallV * dt;
          if (st.fallZ <= 11) { st.fallZ = null; st.n++; }
        }
        draw();
        return pending || st.sq > 0 || st.fallZ !== null || st.drop > 0;
      };
      g.readout = () => `${st.n} drop${st.n === 1 ? "" : "s"} in the well · about ${DROP_ML} mL each → ${(st.n * DROP_ML).toFixed(2)} mL · ${st.sq > 0.5 ? "bulb squeezed" : "bulb released"}`;
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
