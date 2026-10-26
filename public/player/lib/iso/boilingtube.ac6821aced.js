// "boilingtube cx cy k fill=0..1 oil=0|1 bung=0|1 cloud=0..1 lab=0 lit=glass|water|oil|bung" — a PART (PARTS.md,
// batch 5): a 22 × 150 mm borosilicate boiling tube (wider and thicker-walled than a test tube), as rust.js draws its
// three tubes; origin its round bottom, standing upright (in a rack or a clamp). Round bottom, 1 mm wall, a rolled lip.
// fill = how far up its length the water stands; oil=1 floats a 1 cm layer of oil on it (keeps air out); bung=1 a
// rubber bung in the mouth. cloud 0 → 1: the water turns brown and rust flakes settle on the bottom (the rusting nail
// in tube 1); set({ cloud }) eases it. Built in mm with the lab helpers; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const LEN = 150, R = 11, WATER = "#cfe6f5", BROWN = "#d7a46a";

  ISO.add({
    name: "boilingtube", title: "Boiling tube (part)", compare: null,
    about: "A 2.2 cm glass boiling tube, 15 cm long, standing upright, with water (optionally under oil, or stoppered with a bung); the water can cloud brown with rust flakes. anchors: mouth inside",
    line: "boilingtube cx cy k fill=0..1 oil=0|1 bung=0|1 cloud=0..1 lab=0 lit=glass|water|oil|bung",
    demo: { line: "boilingtube 480 470 22 fill=0.35 lab=1", script: [{ set: {}, hold: 1 }, { set: { cloud: 0.6, lit: "water" }, hold: "settle" }, { set: { cloud: 1, lit: "" }, hold: "settle" }, { set: { lit: "glass" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const V = LAB.vessel(Pm, [0, 0, 0], window.CHEM.tube(LEN, R), { base: 1, wall: 1 });
      const fill = ISO.clamp(ISO.num(o, "fill", 0.35), 0, 0.9), oil = o.oil === "1", bung = o.bung === "1";
      const zw = 1 + (LEN - 4) * fill, zo = Math.min(LEN - 14, zw + 10);
      const st = { c: ISO.clamp(ISO.num(o, "cloud", 0), 0, 1) }, want = { c: st.c };
      let lit = o.lit || "";
      // rust flakes on the round bottom: small brown dots that thicken with cloud
      const kS = G.scaleOf(Pm), speck = (p, r, op) => { const c = K.iso(p, Pm); return `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(r * kS).toFixed(2)}" ry="${(r * kS * 0.6).toFixed(2)}" fill="#a84a22" opacity="${op.toFixed(2)}"/>`; };
      const flakes = (c) => {
        if (c < 0.08) return "";
        const out = [];
        for (let j = 0; j < 9; j++) out.push(speck([-6 + j * 1.5, ((j * 5) % 7) - 3, 2.2 + (j % 3) * 0.7], 0.6 + c * 0.7, 0.5 + c * 0.45));
        // a few still settling through the water
        for (let j = 0; j < 8; j++) out.push(speck([((j * 7) % 13) - 6, ((j * 3) % 7) - 3, 6 + ((j * 29) % 100) / 100 * (zw - 10)], 0.35, c * 0.6));
        return out.join("");
      };
      const water = (c) => (fill > 0.01 ? V.liquid(zw, LAB.blend(WATER, BROWN, c * 0.6), { opacity: 0.55 }) : "") + flakes(c);
      g.innerHTML = `<g data-name="glass">${V.back()}</g><g data-name="water" data-part="water"></g>` +
        (oil && fill > 0.01 ? `<g data-name="oil">${V.liquid(zo, "#f2d35a", { from: zw, opacity: 0.75 })}</g>` : "") +
        `<g data-name="glass">${V.front()}</g>` + (bung ? `<g data-name="bung">${LAB.bung(Pm, [0, 0], LEN - 6, R - 0.6, 12)}</g>` : "") + `<g data-part="words"></g>`;
      g.anchors = { mouth: [0, 0, (bung ? LEN + 6 : LEN) / 10], inside: [0, 0, 0.1] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.c * 40) / 40;
        w.rebuild(el.water, String(q), () => water(q));
        if (lab) w.rebuild(el.words, "w", () => LAB.word(Pm, lab, [0, 0, LEN + (bung ? 22 : 12)], "boiling tube", "#556") + (fill > 0.01 ? LAB.word(Pm, lab, [R + 3, 0, zw * 0.6], "water", "#2f6fae", { anchor: "start" }) : "") + (oil && fill > 0.01 ? LAB.word(Pm, lab, [R + 3, 0, zw + 6], "oil", "#8a6a10", { anchor: "start" }) : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.cloud !== undefined && Number.isFinite(+p.cloud)) want.c = ISO.clamp(+p.cloud, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.c = ISO.follow(st.c, want.c, dt, 0.6, ISO.still()); draw(); return st.c !== want.c; };
      g.readout = () => `22 × 150 mm boiling tube · about ${V.vol(zw).toFixed(0)} mL of water${oil ? " under 1 cm of oil" : ""}${bung ? ", stoppered" : ""}${st.c > 0.1 ? " · clouding brown with rust flakes" : ""}`;
      draw();
      return g;
    },
  });
})();
