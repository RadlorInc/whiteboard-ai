// "precipitate cx cy size c=yellow|white|blue|brown|green t=0..1 lab=1 lit=tube|dropper|solid|stand |text" — a
// precipitation test: a test tube of one clear solution held in a clamp on a stand, a dropping pipette of the other
// solution above it, a reagent bottle beside. set({ t }) runs it: 0 → 0.15 a drop falls in; the two solutions meet and
// an insoluble solid forms at once as a cloud through the liquid (0.15 → 0.35); then it slowly settles to the bottom
// as a layer and the liquid above clears (→ 1). yellow: lead(II) nitrate + potassium iodide → lead(II) iodide;
// white: silver nitrate + sodium chloride → silver chloride; blue: copper(II) sulfate + sodium hydroxide → copper(II)
// hydroxide; brown: iron(III) chloride + sodium hydroxide → iron(III) hydroxide; green: iron(II) sulfate + sodium
// hydroxide → iron(II) hydroxide.
(() => {
  const K = window.K, G = window.G;
  const BASE = { x: -70, y: -70, w: 150, d: 120, r: 4 }, ROD = [-42, -50], TUBE = [22, 8], TZ = 30, LEN = 125, R = 8;
  const RX = {
    yellow: { sol: "#e6eef4", add: "#e6eef4", ppt: "#f2c81e", a: "lead(II) nitrate", b: "potassium iodide", p: "lead(II) iodide, PbI₂", f: "KI" },
    white: { sol: "#e6eef4", add: "#e6eef4", ppt: "#f4f4f0", a: "silver nitrate", b: "sodium chloride", p: "silver chloride, AgCl", f: "NaCl" },
    blue: { sol: "#9cc8ee", add: "#e6eef4", ppt: "#4f9ee0", a: "copper(II) sulfate", b: "sodium hydroxide", p: "copper(II) hydroxide, Cu(OH)₂", f: "NaOH" },
    brown: { sol: "#f2c77a", add: "#e6eef4", ppt: "#b5622a", a: "iron(III) chloride", b: "sodium hydroxide", p: "iron(III) hydroxide, Fe(OH)₃", f: "NaOH" },
    green: { sol: "#d6ead2", add: "#e6eef4", ppt: "#5f8f4a", a: "iron(II) sulfate", b: "sodium hydroxide", p: "iron(II) hydroxide, Fe(OH)₂", f: "NaOH" },
  };
  const DOTS = Array.from({ length: 40 }, (_, i) => { const a = i * 2.39996, r = Math.sqrt((0.5 + i * 0.5698403) % 1) * (R - 2), f = (0.5 + i * 0.7548777) % 1; return [Math.cos(a) * r, Math.sin(a) * r, f]; });

  ISO.add({
    name: "precipitate", title: "Precipitation test", compare: "precipitate 480 255 250 c=yellow",
    about: "Two clear solutions meet in a test tube and an insoluble solid forms as a cloud, then settles to the bottom as a precipitate.",
    line: "precipitate cx cy size c=yellow|white|blue|brown|green t=0..1 lab=1 lit=tube|dropper|solid|stand |text",
    demo: { line: "precipitate 480 265 250 c=yellow", script: [{ set: { lit: "dropper" }, hold: 1.2 }, { set: { t: 0.35, lit: "tube" }, hold: "settle" }, { set: { t: 1, lit: "solid" }, hold: "settle" }, { set: { lit: "" }, hold: 1 }] },
    make([cx, cy, size = 250], o, tx, parent) {
      const LAB = window.LAB, CHEM = window.CHEM, S = LAB.S;
      const lab = o.lab !== "0", rx = RX[o.c] || RX.yellow, W = size * 1.6, H = size * 1.35;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 0, 8), [ROD[0], ROD[1], 205], [TUBE[0], TUBE[1], TZ + LEN + 96], [70, 30, 80]], cx, cy, W, H, { azimuth: 52, elevation: 20 }, parent);
      const st = { t: ISO.clamp(ISO.num(o, "t", 0), 0, 1), want: 0, lit: o.lit || "", litDrawn: null };
      st.want = st.t;
      const V = LAB.vessel(P, [TUBE[0], TUBE[1], TZ], CHEM.tube(LEN, R), { base: 1, wall: 0.9 });
      const cl = LAB.clamp(P, ROD, TZ + LEN - 40, G.unit3([TUBE[0] - ROD[0], TUBE[1] - ROD[1], 0]).slice(0, 2), Math.hypot(TUBE[0] - ROD[0], TUBE[1] - ROD[1]), R + 0.5);
      // the dropping pipette above the mouth: rubber teat, glass barrel tapering to a jet; drawn as turned outlines
      const PZ = TZ + LEN + 8, pip = LAB.turned(P, [TUBE[0], TUBE[1], PZ], [[0, 0.6], [14, 2.6, 1], [16, 3.4], [40, 3.4], [41, 3.8]], ["#c9dde9", "#f4f9fc"], LAB.GLASS) + LAB.turned(P, [TUBE[0], TUBE[1], PZ + 41], [[0, 4.4], [4, 5.6, 1], [16, 6, 1], [22, 4.2, 1], [24, 0.5]], ["#7a1f17", "#d8503f"], "#4a120c");
      // a reagent bottle with the second solution
      const BX = -30, BY = 22, bottle = LAB.turned(P, [BX, BY, 8], [[0, 13], [1, 14, 1], [40, 14], [46, 8, 1], [50, 6], [54, 6]], ["#b9cfdd", "#eef6fb"], LAB.GLASS, { rims: [40] }) + LAB.turned(P, [BX, BY, 62], [[0, 6.8], [10, 6.8]], ["#2a2c30", "#5a5e66"], "#111") +
        `<path d="${K.pathOf([[BX - 10, BY + 13.95, 16], [BX + 10, BY + 13.95, 16], [BX + 10, BY + 13.95, 32], [BX - 10, BY + 13.95, 32]].map((p) => K.iso(p, P)), true)}" fill="#fbfbf7" stroke="#8a8a84" stroke-width="0.5"/>` + LAB.faceText(P, [BX, BY + 14, 25.6], [1, 0, 0], rx.f, 4.4, "#33404c") + LAB.faceText(P, [BX, BY + 14, 19.6], [1, 0, 0], "(aq)", 3.2, "#5a6a78");
      // a white tile under the tube so the colour shows
      const tile = ISO.tint("#f6f7f8", ["#c9ccd1", "#d5d8dc", "#e0e2e5", "#eaecee"], "#6c737c");
      g.innerHTML = `<g data-name="stand">${LAB.standBase(P, BASE, ROD)}${LAB.rod(P, ROD, 14, 205)}${LAB.boss(P, ROD, TZ + LEN - 40, G.unit3([TUBE[0] - ROD[0], TUBE[1] - ROD[1], 0]).slice(0, 2))}${cl.back}</g>` +
        `<g>${ISO.tinted(tile, ISO.wbox(P, [2, 42], [-12, 28], [7.6, 10], "hi"))}</g><g data-name="bottle">${bottle}</g><g data-name="tube">${V.back()}</g><g data-part="liquid"></g><g data-name="solid" data-part="solid"></g><g data-name="tube">${V.front()}</g><g data-name="stand">${cl.front}</g><g data-name="dropper">${pip}</g><g data-part="drop"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")];
      const LEVEL = 52, SOLID = 9;
      const draw = () => {
        const t = Math.round(st.t * 200) / 200;
        const cloud = ISO.smooth(0.14, 0.3, t) * (1 - ISO.smooth(0.4, 1, t)), settled = ISO.smooth(0.35, 1, t), lvl = LEVEL + 4 * ISO.smooth(0.1, 0.16, t);
        w.rebuild(el.liquid, String(t), () => {
          const c = LAB.mix(t < 0.14 ? rx.sol : LAB.mix(rx.sol, rx.add, 0.3), rx.ppt, 0.85 * cloud);
          return V.liquid(lvl, c, { opacity: 0.45 + 0.45 * cloud });
        });
        w.rebuild(el.solid, String(t), () => {
          const out = [];
          if (settled > 0.01) out.push(V.liquid(1 + SOLID * settled, rx.ppt, { opacity: 0.95, meniscus: false }));
          // grains still settling: dots in the clearing liquid, fewer and lower as time goes on
          if (t > 0.15 && settled < 0.98) {
            const pts = [], n = Math.round(DOTS.length * (1 - settled));
            for (let i = 0; i < n; i++) { const [x, y, f] = DOTS[i], z = TZ + 2 + SOLID * settled + (lvl - 4 - SOLID * settled) * f * (1 - settled * 0.9); pts.push(K.iso([TUBE[0] + x, TUBE[1] + y, z], P)); }
            out.push(K.dotsSvg(pts, { size: 0.7, tone: "hi" }).replace("<g", `<g style="--anatomy-hi:${LAB.mix(rx.ppt, "#000000", 0.35)}"`));
          }
          return out.join("");
        });
        // the drop: forms at the jet, falls, lands
        w.rebuild(el.drop, String(t), () => { if (t <= 0.01 || t > 0.15) return ""; const f = ISO.smooth(0.02, 0.15, t), z = PZ - 1 - f * (PZ - TZ - lvl); return LAB.drop(P, [TUBE[0], TUBE[1], z], 1.8, "#dcecf6"); });
        if (lab) w.rebuild(el.words, String(t < 0.14 ? 0 : t < 0.4 ? 1 : 2), () => LAB.word(P, lab, [TUBE[0], TUBE[1], TZ + LEN + 84], t < 0.14 ? `${rx.a} + ${rx.b}` : t < 0.4 ? "a solid forms at once: a cloud" : `precipitate: ${rx.p.split(",")[0]}`, LAB.mix(rx.ppt, "#000000", 0.4), { size: 14 }) +
          LAB.word(P, lab, [TUBE[0] + 12, TUBE[1], PZ + 30], "dropping pipette", "#556", { size: 12, anchor: "start" }) + LAB.word(P, lab, [BX, BY, 80], rx.b, "#556", { size: 12 }));
        if (st.litDrawn !== st.lit || el.solid._fresh) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
      };
      g.set = (p) => { if (p.t !== undefined) st.want = ISO.clamp(+p.t, 0, 1); if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        st.t = calm ? st.want : st.t + Math.sign(st.want - st.t) * Math.min(Math.abs(st.want - st.t), dt * 0.11);
        draw();
        return st.t !== st.want;
      };
      g.readout = () => `${rx.a} + ${rx.b} → ${rx.p} (insoluble) · ${st.t < 0.14 ? "adding a drop" : st.t < 0.4 ? "the solid forms at once as a cloud" : st.t < 1 ? "the solid settles; the liquid above clears" : "settled: the solid is the precipitate, filter it off to collect it"}`;
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, tx);
      return g;
    },
  });
})();
