// "reagentbottle cx cy k glass=brown|clear cap=screw|dropper text=NaOH sub=0.1M fill=0..1 c=… lab=0 lit=bottle|cap|label" —
// a PART (PARTS.md): a small narrow-mouth reagent bottle standing on the bench, origin the bench point under its middle.
// 3.2 cm across, 5 cm of glass to the neck (as dissolve.js, indicator.js, precipitate.js draw it): rounded heel, straight
// wall, a shoulder, a short neck with its thread bead. cap=screw: a black ribbed screw cap (5.9 cm tall in all);
// cap=dropper: a ring cap with a black rubber teat and a glass dropper reaching down inside (8.4 cm, indicator.js).
// glass=brown is amber glass (light-sensitive solids, KMnO₄); glass=clear shows the solution inside (fill, c). A white
// paper label wraps the near side with text (the formula) and sub (a second line, e.g. "0.1 M"). Static. Built in mm.
(() => {
  const K = window.K, G = window.G;
  const R = 16, BODY = [[0, 15], [1, 16, 1], [34, 16], [40, 9, 1], [44, 7], [48, 7], [50, 7.4], [51, 7]], NZ = 51;
  const AMBER = ["#5a3414", "#a8692c"], CAPC = ["#2a2c30", "#5a5e66"];

  ISO.add({
    name: "reagentbottle", title: "Reagent bottle (part)", compare: null,
    about: "A small reagent bottle (brown or clear glass) with a screw cap or a dropper cap and a paper label naming what is in it; a bench part. anchors: cap",
    line: "reagentbottle cx cy k glass=brown|clear cap=screw|dropper text=NaOH sub=0.1M fill=0..1 c=clear|blue|red|green|yellow|purple lab=0 lit=bottle|cap|label",
    demo: { line: "reagentbottle 480 400 34 glass=brown cap=dropper text=NaOH sub=dilute", script: [{ set: { lit: "label" }, hold: 1.5 }, { set: { lit: "cap" }, hold: 1.5 }, { set: { lit: "bottle" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const clear = o.glass === "clear", dropper = o.cap === "dropper";
      const text = ISO.esc(String(o.text ?? "").slice(0, 12)), sub = ISO.esc(String(o.sub ?? "").slice(0, 16));
      const V = LAB.vessel(Pm, [0, 0, 0], BODY, { wall: 1.6, base: 3, rim: false });
      const face = V.facing, u = G.mul3(G.tangentOf(V.F, face), -1);
      // the glass: amber is opaque enough to draw as one turned body; clear glass is a vessel with its solution inside
      let glass;
      if (clear) {
        const f = ISO.clamp(ISO.num(o, "fill", 0.7), 0, 1), c = o.c || "clear";
        glass = V.back() + (f > 0 ? V.liquid(3 + (33 - 3) * f, c, { opacity: 0.6 }) : "") + (dropper ? LAB.tube(Pm, [[0, 0, NZ + 4], [0, 0, 10]], 2.2) : "") + V.front();
      } else glass = LAB.turned(Pm, [0, 0, 0], BODY, AMBER, "#3a200a", { rims: [34, 48] });
      // a highlight down the near-left of the glass
      const shine = K.pathOf([4, 31].map((s) => K.iso(G.pointOf(V.F, s, R + 0.1, face + 0.9), Pm)));
      glass += `<path d="${shine}" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="${clear ? 0.7 : 0.35}"/>`;
      // the paper label: a band round the near side from 10 to 28 mm up, two printed lines when no text is given
      const a0 = face - 0.78, a1 = face + 0.78, s0 = 9, s1 = 28, band = [];
      for (let i = 0; i <= 12; i++) band.push(K.iso(G.pointOf(V.F, s0, R + 0.25, a0 + ((a1 - a0) * i) / 12), Pm));
      for (let i = 12; i >= 0; i--) band.push(K.iso(G.pointOf(V.F, s1, R + 0.25, a0 + ((a1 - a0) * i) / 12), Pm));
      const rule = (s, w) => K.pathOf([0, 1, 2, 3, 4, 5, 6].map((i) => K.iso(G.pointOf(V.F, s, R + 0.3, face - w + (2 * w * i) / 6), Pm)));
      const label = `<path d="${K.pathOf(band, true)}" fill="#fbfbf7" stroke="#8a8a84" stroke-width="0.5"/>` +
        `<path d="${rule(s1 - 2.2, 0.62)}${rule(s0 + 2.2, 0.62)}" fill="none" stroke="#c0392b" stroke-width="0.5"/>` +
        (text ? LAB.faceText(Pm, G.pointOf(V.F, s0 + 9.4, R + 0.35, face), u, text, 5, clear ? "#33404c" : "#3a200a") : `<path d="${rule(s0 + 11, 0.45)}" fill="none" stroke="#6a6a64" stroke-width="1.1"/>`) +
        (sub ? LAB.faceText(Pm, G.pointOf(V.F, s0 + 4.3, R + 0.35, face), u, sub, 3.4, "#6a4a2a") : `<path d="${rule(s0 + 6, 0.3)}" fill="none" stroke="#9a9a94" stroke-width="0.8"/>`);
      // the cap: a ribbed black screw cap, or a ring cap with a rubber teat (the dropper's)
      const ribs = (z0, h, r) => { const q = []; for (let i = -5; i <= 5; i++) { const a = face + i * 0.26; q.push(K.pathOf([K.iso(G.pointOf(V.F, z0 + 0.8, r + 0.05, a), Pm), K.iso(G.pointOf(V.F, z0 + h - 0.8, r + 0.05, a), Pm)])); } return `<path d="${q.join("")}" stroke="#121214" stroke-width="0.45" opacity=".75"/>`; };
      const cap = dropper
        ? LAB.turned(Pm, [0, 0, NZ - 3], [[0, 8.4], [10, 8.4], [11, 4.4], [14, 4.4]], CAPC, "#111") + ribs(NZ - 3, 10, 8.4) +
          LAB.turned(Pm, [0, 0, NZ + 11], [[0, 3.8], [3, 4.6, 1], [12, 4.6, 1], [16, 2], [17, 0.5]], ["#222", "#55575c"], "#111")
        : LAB.turned(Pm, [0, 0, NZ - 3], [[0, 8.6], [10, 8.6], [11, 7.8], [11.5, 6]], CAPC, "#111") + ribs(NZ - 3, 10, 8.6);
      const top = dropper ? NZ + 28 : NZ + 8.5;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, 3, Pm)}"/>` +
        `<g data-name="bottle">${glass}</g><g data-name="label">${label}</g><g data-name="cap">${cap}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, top + 12], dropper ? "dropper bottle" : "reagent bottle", "#556");
      g.anchors = { cap: [0, 0, top / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `${clear ? "clear" : "brown"} glass reagent bottle, ${2 * R / 10} cm across, ${(top / 10).toFixed(1)} cm tall · ${dropper ? "dropper cap" : "screw cap"}${text ? " · label: " + text + (sub ? " " + sub : "") : ""}`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
