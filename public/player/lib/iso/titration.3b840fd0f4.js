// "titration cx cy width k=strongstrong|weakstrong lab=1 lit=burette|stopcock|clamp" — an acid–alkali titration at the bench.
// The burette rig (see burette.js) holds 0.100 mol/dm³ sodium hydroxide; the conical flask on the white tile holds
// 25.0 cm³ of 0.100 mol/dm³ acid (hydrochloric for strongstrong, ethanoic for weakstrong) with phenolphthalein.
// Each drop flashes pink where it lands and swirls away while acid is left; at the end point (25.00 cm³) one drop of
// excess keeps the whole flask pale pink. The flask is swirled while alkali goes in. pH comes from the same charge
// balance the app's titration curve uses. set({ deliver: cm³ }) runs alkali in: a rough fast run, then dropwise.
(() => {
  const K = window.K;
  const ACID = 25.0, CA = 0.1, CB = 0.1, Kw = 1e-14;
  const pHOf = (v, Ka) => {
    const Ca = (CA * ACID) / (ACID + v), Na = (CB * v) / (ACID + v);
    let lo = 0, hi = 14;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2, H = 10 ** -m, f = H + Na - Kw / H - (Ca * Ka) / (Ka + H); f > 0 ? (lo = m) : (hi = m); }
    return (lo + hi) / 2;
  };

  ISO.add({
    name: "titration", title: "Titration", compare: "titration 480 270 440 k=weakstrong",
    about: "Alkali from a burette into acid with phenolphthalein: drops flash pink and swirl away until, at 25.00 cm³, the flask stays pale pink.",
    line: "titration cx cy width k=strongstrong|weakstrong deliver=0 lab=1 lit=burette|stopcock|clamp",
    demo: { line: "titration 480 270 440", script: [{ set: { deliver: 20, lit: "stopcock" }, hold: "settle" }, { set: { deliver: 24.9 }, hold: "settle" }, { set: { deliver: 25.0 }, hold: "settle" }, { set: { deliver: 25.05 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const LAB = window.LAB;
      const lab = o.lab !== "0", weak = o.k === "weakstrong", Ka = weak ? 1.8e-5 : 1e9, W = size * 1.1, H2 = size * 1.1;
      const P0 = ISO.frame([[-78, -108, 0], [78, 64, 0], [0, -86, 560], [0, 0, 540]], cx, cy, W, H2, { azimuth: 50, elevation: 16 }, parent);
      const { P, g } = P0;
      const rig = LAB.buretteRig(P, g, { lab, indicator: "pink", acidMl: ACID, swirl: true, burColour: "clear" });
      // replace the burette's own words with the titration's
      rig.st.target = rig.st.V = ISO.clamp(ISO.num(o, "deliver", 0), 0, 50);
      let lit = o.lit || "";
      const w = ISO.writer(), words = LAB.parts(g).words, extra = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.append(extra);
      const sayWords = () => {
        if (!lab) return "";
        return LAB.word(P, lab, [-60, 0, 520], "NaOH 0.100 M", "#2b6cc4", { anchor: "end" }) +
          LAB.word(P, lab, [-46, 0, 40], weak ? "ethanoic acid 25.0 cm³" : "HCl 25.0 cm³", "#556", { anchor: "end" }) + LAB.word(P, lab, [-46, 0, 40], "+ phenolphthalein", "#b0507a", { anchor: "end", dy: 16, size: 12 });
      };
      extra.innerHTML = sayWords();
      g.set = (p) => { rig.set(p); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => { const m = rig.update(dt); LAB.light(w, g, lit); return m; };
      g.readout = () => {
        const V = rig.st.V, pH = pHOf(V, Ka), end = V >= ACID - 1e-6 + 0.01;
        return `titre ${V.toFixed(2)} cm³ · pH ${pH.toFixed(1)} · ${end ? `end point: pale pink stays · acid = 0.100 × ${V.toFixed(2)} ÷ 25.0 = ${(CB * V / ACID).toFixed(3)} mol/dm³` : V > 0 ? "pink flashes and swirls away: acid still left" : "colourless: acid with phenolphthalein"}`;
      };
      void words;
      rig.draw(); LAB.light(w, g, lit);
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
