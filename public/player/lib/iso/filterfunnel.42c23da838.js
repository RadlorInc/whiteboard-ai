// "filterfunnel cx cy k fill=0..1 residue=0..1 c=clear|… drip=0|1 lab=0 lit=funnel|paper|residue|filtrate" — a PART
// (PARTS.md, batch 4): a 75 mm glass filter funnel (a 60° cone on a 70 mm stem 8 mm across), its origin the stem's tip,
// placed at= a conical flask's `neck` (az= a little lower, so the stem sits in the neck). In it a 12.5 cm filter paper
// folded in four and opened into a cone: one fold line on each side and the edge of the outer layer, so one half of the
// cone is three layers thick (darker) and the other one. The mixture stands in the paper at fill (a fraction of the
// paper's height), wetting the paper below its level; the residue (the insoluble solid) settles in the paper's point
// and coats its wall as residue grows 0 → 1; drip=1 fills the stem with filtrate and drops fall from the tip. Paper
// and glass are drawn translucent so what is inside shows, as wet paper does. Built in mm; anchors in cm.
// set({ fill, residue, c, drip }).
(() => {
  const K = window.K, G = window.G;
  const STEM = 70, C0 = 73, C1 = 133, RT = 37.5, H = 136;
  const FUN = [[0, 3.4], [0.6, 4, 1], [STEM, 4], [C0 - 1.2, 4.6, 1], [C0, 5.6, 1], [C1, RT], [C1 + 1.5, RT + 1.2, 1], [H, RT + 0.8]];
  const P0 = 66, P1 = 120, MUD = "#5e3d20";   // a 12.5 cm paper: its point down in the throat, its edge 13 mm under the rim
  const rCone = (s) => 5.6 + ((RT - 5.6) * (s - C0)) / (C1 - C0) - 1.3;   // the glass's inside face
  const rPaper = (s) => Math.max(0.2, ((rCone(P1) - 0.5) * (s - P0)) / (P1 - P0));   // a cone parallel to the glass, its point at P0

  ISO.add({
    name: "filterfunnel", title: "Filter funnel (part)", compare: null,
    about: "A glass filter funnel with a folded filter paper cone in it, the mixture standing in the paper (fill), the solid residue left on the paper (residue) and filtrate dripping from the stem (drip); placed at a conical flask's neck. anchors: top",
    line: "filterfunnel cx cy k fill=0..1 residue=0..1 c=clear|… drip=0|1 lab=0 lit=funnel|paper|residue|filtrate",
    demo: { line: "filterfunnel 480 490 27 fill=0.85 residue=0.1 c=blue lab=1", script: [{ set: { drip: 1 }, hold: 1.6 }, { set: { fill: 0.15, residue: 0.85, lit: "residue" }, hold: "settle" }, { set: { lit: "paper" }, hold: 1.4 }, { set: { drip: 0, lit: "filtrate" }, hold: 1.6 }, { set: { lit: "funnel" }, hold: 1.4 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const V = LAB.vessel(Pm, [0, 0, 0], FUN, { base: 0.5, wall: 1 }), F = V.F, face = V.facing;
      const st = { f: ISO.clamp(ISO.num(o, "fill", 0.6), 0, 1), r: ISO.clamp(ISO.num(o, "residue", 0), 0, 1), c0: o.c || "clear", c1: o.c || "clear", mixT: 1, drip: ISO.num(o, "drip", 0) >= 0.5 ? 1 : 0, drops: [], spawn: 0 };
      const want = { f: st.f, r: st.r }, s = { amt: st.drip };
      let lit = o.lit || "";
      const at = (z, r, a) => K.iso(G.pointOf(F, z, r, a), Pm);
      const arc = (z, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => at(z, r, a0 + ((a1 - a0) * i) / n));
      const apex = at(P0, 0, 0);
      // the paper: its far wall (seen through the mouth and the glass), and its near wall over what is inside
      const paperSil = K.pathOf(ISO.hullOf([apex, ...arc(P1, rPaper(P1), 0, Math.PI * 2, 48)]), true);
      const nearOf = (z) => K.pathOf([apex, ...arc(z, rPaper(z), face - Math.PI / 2, face + Math.PI / 2)], true);
      const tri0 = face - 0.9, tri1 = face + Math.PI - 0.9;   // the three-layer half lies between the outer layer's edge and the far fold
      const triple = K.pathOf([apex, ...arc(P1, rPaper(P1) + 0.15, tri0, face + Math.PI / 2, 18)], true);
      const folds = [face - Math.PI / 2, face + Math.PI / 2, tri0].map((a) => K.pathOf([apex, at(P1, rPaper(P1) + 0.2, a)])).join("");
      const paperFar = `<path d="${paperSil}" fill="#f3efe2" fill-opacity=".88" stroke="#b9b29c" stroke-width="0.6"/><path d="${K.pathOf([apex, at(P1, rPaper(P1), tri1)])}" stroke="#c4bda8" stroke-width="0.6" fill="none"/>`;
      const paperNear = `<path d="${nearOf(P1)}" fill="#f6f2e6" fill-opacity=".2"/><path d="${triple}" fill="#e6dec4" fill-opacity=".18"/>` +
        `<path d="${folds}" fill="none" stroke="#a9a28c" stroke-width="0.7"/><path d="${G.circleOf(F, P1, rPaper(P1), Pm)}" fill="none" stroke="#9e977f" stroke-width="0.8"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -6, y: -6, w: 12, d: 12, r: 6 }, 0, 2, Pm)}"/>` +
        `<g data-name="funnel">${V.back()}</g><g data-name="filtrate" data-part="stem"></g><g data-name="paper">${paperFar}</g><g data-name="residue" data-part="residue"></g><g data-part="liquid"></g>` +
        `<g data-name="paper"><g data-part="wet"></g>${paperNear}</g><g data-name="funnel">${V.front()}</g><g data-name="filtrate" data-part="drops"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const resTop = () => P0 + 1.5 + 16 * ISO.ease(st.r);
      const levelZ = () => Math.max(resTop() + 0.5, P0 + 2 + (P1 - 4 - P0 - 2) * st.f);
      // the paper as a vessel, so the liquid and the residue are true volumes inside its cone
      const pv = LAB.vessel(Pm, [0, 0, P0], [[0, 0.2], [P1 - P0, rPaper(P1) + 0.5]], { base: 0, wall: 0.5 });
      const draw = () => {
        const rq = Math.round(st.r * 50) / 50, z = Math.round(levelZ() * 2) / 2, c = colour(), rt = resTop();
        w.rebuild(el.residue, String(rq), () => {
          if (rq < 0.02) return "";
          // the solid packed in the point, speckled, and a thinner coat up the far wall where the mixture stood
          const sr = P0 + 1.5 + 16 * ISO.ease(rq), coat = sr + 10 * rq, band = [...arc(sr, rPaper(sr) - 0.2, face + Math.PI / 2, face + Math.PI * 1.5, 16), ...arc(coat, rPaper(coat) - 0.2, face + Math.PI * 1.5, face + Math.PI / 2, 16)];
          const dots = []; for (let i = 0; i < 30; i++) { const ss = P0 + 2 + ((i * 7) % 13) / 13 * (sr - P0 - 2), a = i * 2.39; dots.push(K.iso(G.pointOf(pv.F, ss - P0, rPaper(ss) * (0.2 + 0.7 * (((i * 5) % 7) / 7)), a), Pm)); }
          return `<path d="${K.pathOf(band, true)}" fill="${MUD}" fill-opacity="${(0.45 * rq).toFixed(2)}"/>` + `<path d="${K.pathOf(ISO.hullOf([apex, ...arc(sr, rPaper(sr) - 0.3, 0, Math.PI * 2, 32)]), true)}" fill="${MUD}" fill-opacity=".95"/>` +
            `<path d="${G.circleOf(F, sr, rPaper(sr) - 0.3, Pm)}" fill="${LAB.mix(MUD, "#ffffff", 0.22)}" stroke="${LAB.mix(MUD, "#000000", 0.3)}" stroke-width="0.6"/>` + `<g style="--anatomy-mid:#d9c4a0">${LAB.D(dots, { size: 0.7, tone: "mid" })}</g>`;
        });
        w.rebuild(el.liquid, `${z} ${c} ${rq}`, () => (z - rt > 1.5 ? pv.liquid(z - P0, c, { opacity: 0.85, from: rt - P0 }) : ""));
        // the paper below the level is wet: darker and tinted by the liquid
        w.rebuild(el.wet, `${z} ${c} ${z - rt > 1.5}`, () => (z - rt > 1.5 ? `<path d="${nearOf(z)}" fill="${LAB.mix(c, "#efe9d6", 0.25)}" fill-opacity=".3"/>` : ""));
        const sq = Math.round(s.amt * 10) / 10;
        w.rebuild(el.stem, `${sq} ${c}`, () => (sq > 0.05 ? `<g opacity="${sq}">${V.liquid(STEM + 2, c, { opacity: 0.7, from: 0.6, meniscus: false })}</g>` : ""));
        w.rebuild(el.drops, st.drops.map((d) => d.toFixed(0)).join() + c, () => st.drops.map((d) => LAB.drop(Pm, [0, 0, d], 1.6, c)).join(""));
        if (lab) w.rebuild(el.words, `${rq > 0.1} ${sq > 0.05}`, () => [LAB.word(Pm, lab, [RT + 6, 0, H + 4], "filter funnel", "#556", { anchor: "start" }),
          LAB.word(Pm, lab, [0, 0, H + 20], "filter paper", "#556"),
          rq > 0.1 ? LAB.word(Pm, lab, [RT * 0.9, 0, P0 + 6], "residue", MUD, { anchor: "start" }) : "",
          sq > 0.05 ? LAB.word(Pm, lab, [10, 0, 10], "filtrate", LAB.ink(st.c1), { anchor: "start" }) : ""].join(""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.residue !== undefined) want.r = ISO.clamp(+p.residue, 0, 1);
        if (p.drip !== undefined) st.drip = +p.drip >= 0.5 ? 1 : 0;
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // the paper drains slowly (filtering is slow) and the residue builds as it does
        st.f = ISO.follow(st.f, want.f, dt, 2.4, calm);
        st.r = ISO.follow(st.r, want.r, dt, 2.4, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        s.amt = ISO.follow(s.amt, st.drip, dt, 0.4, calm); if (Math.abs(s.amt - st.drip) < 0.004) s.amt = st.drip;
        if (calm) st.drops = [];
        else {
          if (st.drip) { st.spawn += dt * 1.8; if (st.spawn > 1) { st.spawn = 0; st.drops.push(-2); } }
          st.drops = st.drops.map((d) => d - (6 - d) * 8 * dt).filter((d) => d > -70);
        }
        draw();
        return st.f !== want.f || st.r !== want.r || st.mixT < 1 || s.amt !== st.drip;
      };
      g.readout = () => `75 mm filter funnel with a folded filter paper · ${Math.round(pv.vol(levelZ() - P0) - pv.vol(resTop() - P0))} mL of ${st.c1} mixture in the paper${st.r > 0.05 ? " · residue (the insoluble solid) stays on the paper" : ""}${st.drip ? " · filtrate dripping from the stem" : ""}`;
      draw();
      return g;
    },
  });
})();
