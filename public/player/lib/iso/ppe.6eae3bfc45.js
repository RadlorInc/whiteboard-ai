// "ppe cx cy size k=gloves|mask|gown|goggles step=0..4 lab=1 lit=gown|mask|goggles|gloves|box|gel" — protective gear laid out.
// A steel trolley top with the kit set out in the order it goes on: a folded isolation gown (knit cuffs, waist ties),
// a three-pleat surgical mask (nose wire, ear loops), sealed goggles with their strap, and a pair of nitrile gloves in
// front of their dispenser box, with a pump bottle of hand gel at the back. k picks one item (lifted and lit); step 1–4
// walks the donning order (gown, mask, goggles, gloves) and step 0 sets everything down. World units: 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const TOP = { x: -38, y: -24, w: 76, d: 48, r: 2.4 };
  const YEL = ISO.tint("#fbeea8", ["#d9b52a", "#e2c246", "#ead062", "#f1dc80"], "#7a6410"), MASK = ISO.tint("#d6ebfa", ["#7fb2dc", "#93c0e3", "#a8cdea", "#bcd9f0"], "#2f6a96");
  const NIT = ISO.tint("#9cc8f4", ["#2f6cb4", "#3f7cc2", "#558ece", "#6ba1d8"], "#173f70"), WHITE = ISO.T.paint, GREY = ISO.T.rubber, STEEL = ISO.T.steel;
  const ORDER = ["gown", "mask", "goggles", "gloves"];
  const SAY = {
    gown: "1 · gown first: ties at the neck and the waist, covers you from neck to knees and arms to wrists",
    mask: "2 · mask: loops over the ears, pinch the metal strip to the nose, cover nose, mouth and chin",
    goggles: "3 · goggles (or a face shield) over the eyes, strap snug",
    gloves: "4 · gloves last: pull their cuffs over the gown's knit cuffs",
  };
  // A glove lying flat, palm down, fingers toward −y: one outline (thumb toward +x; mirror for the left hand).
  const GLOVE = [[-4.5, 12], [4.5, 12], [4.6, 4], [5.2, 1.5], [7.6, -2.5], [8.3, -5], [7.4, -6.4], [6.2, -5.6], [4.9, -3.6], [4.8, -4], [4.7, -10.4], [4, -11.3], [3.2, -11.3], [2.6, -10.4], [2.5, -4.5],
    [2.3, -4.5], [2.2, -11.4], [1.5, -12.2], [0.6, -12.2], [0, -11.4], [-0.1, -4.6], [-0.3, -4.6], [-0.4, -10.8], [-1.1, -11.6], [-2, -11.6], [-2.6, -10.8], [-2.6, -4.4], [-2.8, -4.3], [-2.9, -8.6], [-3.5, -9.4], [-4.3, -9.4], [-4.8, -8.6], [-4.8, -3], [-4.6, 4]];
  const glove = (P, [cx, cy], mirror, turn, z = 0) => {
    const c = Math.cos(turn), s = Math.sin(turn), ring = GLOVE.map(([x, y]) => { const xx = mirror ? -x : x; return [cx + xx * c - y * s, cy + xx * s + y * c]; });
    const r2 = mirror ? ring.reverse() : ring;
    const cuff = [[-4.5, 12], [4.5, 12], [4.55, 10.4], [-4.55, 10.4]].map(([x, y]) => { const xx = mirror ? -x : x; return K.iso([cx + xx * c - y * s, cy + xx * s + y * c, z + 0.81], P); });
    return ISO.tinted(NIT, S(K.extrude(r2, z, 0.8, P, { convex: false }), { tone: "hi" })) + `<path d="${K.pathOf(cuff, true)}" fill="#7fb0e6" stroke="#173f70" stroke-width=".5"/>`;
  };

  function gownSvg(P) {
    const out = [];
    // the ties run out from under the folded gown: two flat white tapes
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [-12, -4], [7.2, 8.2], [0, 0.15], "lo") + ISO.wbox(P, [-12, -3], [11, 12], [0, 0.15], "lo")));
    out.push(ISO.tinted(YEL, S(K.slabOf({ x: -35, y: -2, w: 23, d: 18, r: 1.2 }, 0, 2.4, P, 4, 0.4), { tone: "mid", inner: L(K.sideSeam({ x: -35, y: -2, w: 23, d: 18, r: 1.2 }, 1.2, P, 4), { tone: "faint" }) })));
    out.push(ISO.tinted(YEL, S(K.slabOf({ x: -34, y: -1, w: 21, d: 12, r: 1 }, 2.4, 1.4, P, 4, 0.4), { tone: "hi" })));
    // a sleeve's blue knit cuff peeking out of the fold, with its ribs round it
    const F = G.frameOf([-13.6, 4.5, 3.4], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.blue, S(G.disc(0, 3.4, 1.2, F, P, { steps: 20 }), { tone: "hi" })));
    return out.join("");
  }
  function maskSvg(P) {
    const x0 = -16, x1 = 1.5, y0 = -21, y1 = -11.5, out = [];
    out.push(ISO.tinted(MASK, ISO.wbox(P, [x0, x1], [y0, y1], [0, 0.3], "mid")));
    // three pleats across it, the white binding down each end, the nose wire along the top edge
    for (const y of [-18.6, -16.2, -13.8]) out.push(ISO.tinted(MASK, ISO.wbox(P, [x0 + 0.8, x1 - 0.8], [y, y + 1.4], [0.3, 0.6], "hi")));
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [x0, x0 + 0.8], [y0, y1], [0.3, 0.7], "hi") + ISO.wbox(P, [x1 - 0.8, x1], [y0, y1], [0.3, 0.7], "hi")));
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [x0 + 4, x1 - 4], [y0 + 0.3, y0 + 0.9], [0.3, 0.55], "hi")));
    // the ear loops: thin elastic lying in loops off each end (a cord, not a seam)
    const loop = (x, dir) => { const m = (y0 + y1) / 2, ry = (y1 - y0) / 2 - 1; return K.pathOf(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 2 + (i / 20) * Math.PI; return K.iso([x + dir * 5.4 * Math.cos(a), m + ry * Math.sin(a) * (1 + 0.25 * Math.cos(a)), 0.5], P); })); };
    const d = loop(x0 + 0.4, -1) + loop(x1 - 0.4, 1);
    out.push(`<path d="${d}" fill="none" stroke="#8a97a3" stroke-width="1.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f7f9fb" stroke-width=".9" stroke-linecap="round"/>`);
    return out.join("");
  }
  // Goggles standing on the tray, lens to the front: a soft frame (a prism of the goggle outline, nose notch and all),
  // the lens on its front, the elastic strap lying round the back on the tray, and four vent caps on top.
  const GOG = [[-8, 1.2], [-7.6, 5.6], [-6, 7], [6, 7], [7.6, 5.6], [8, 1.2], [6.4, 0], [2.6, 0], [1.2, 2], [-1.2, 2], [-2.6, 0], [-6.4, 0]];
  function gogglesSvg(P) {
    const cx = 2, y0 = 2, y1 = 5.2, out = [];
    out.push(ISO.tinted(GREY, ISO.wbox(P, [cx - 8, cx - 7], [y0 - 7, y0], [0, 2], "mid") + ISO.wbox(P, [cx - 8, cx + 8], [y0 - 7.8, y0 - 7], [0, 2], "mid")));
    out.push(ISO.prismY(P, GOG.map(([x, z]) => [cx + x, z]), y0, y1, ["#5f6873", "#a9b2bb"], "#dcebf5", "#2a3038"));
    out.push(`<path d="${K.pathOf(GOG.map(([x, z]) => [cx + x * 0.86, 0.5 + z * 0.86]).map(([x, z]) => K.iso([x, y1 + 0.02, z], P)), true)}" fill="#eef6fb" stroke="#5d7f96" stroke-width=".6"/>`);
    out.push(ISO.tinted(GREY, ISO.wbox(P, [cx + 7, cx + 8], [y0 - 7, y0], [0, 2], "mid")));
    // the vent caps sit on the frame's top (a prism, which audit.mjs doesn't see, so it calls them loose)
    for (const x of [-5, -2.5, 2.5, 5]) out.push(ISO.tinted(GREY, ISO.wbox(P, [cx + x - 0.6, cx + x + 0.6], [y0 + 0.8, y0 + 2.4], [7, 7.5], "hi")));
    return out.join("");
  }
  function glovesSvg(P) { return glove(P, [15.5, 9.5], true, 0.12) + glove(P, [28.5, 9], false, -0.1); }
  // The glove dispenser: a printed card box with an oval slot and the next glove's tuft poking out.
  function boxSvg(P) {
    const x0 = 9, x1 = 33, y0 = -22, y1 = -9.5, h = 9, out = [ISO.tinted(WHITE, ISO.wbox(P, [x0, x1], [y0, y1], [0, h], "mid"))];
    out.push(`<path d="${K.pathOf([[x0, y1 + 0.05, 2], [x1, y1 + 0.05, 2], [x1, y1 + 0.05, 4.5], [x0, y1 + 0.05, 4.5]].map((p) => K.iso(p, P)), true)}" fill="#3f7cc2" stroke="#173f70" stroke-width=".5"/>`);
    const slot = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return K.iso([21 + 7 * Math.cos(a), -15.75 + 2.2 * Math.sin(a), h + 0.02], P); });
    out.push(`<path d="${K.pathOf(slot, true)}" fill="#2a3440" stroke="#173f70" stroke-width=".6"/>`);
    out.push(ISO.tinted(NIT, ISO.poly([[18, -16.4, h], [24, -16.4, h], [24, -15.1, h], [18, -15.1, h], [20.4, -16, h + 3.4], [22.8, -15.9, h + 2.8]], [[0, 1, 2, 3], [0, 1, 5, 4], [1, 2, 5], [2, 3, 4, 5], [3, 0, 4]], P, "hi")));
    return out.join("");
  }
  // Hand gel: a clear bottle of gel with a pump collar, head and nozzle.
  function gelSvg(P) {
    const x = -29, y = -15, out = [];
    out.push(ISO.tinted(ISO.T.glass, S(K.cylinder(x, y, 4, 0, 13, P, 32, 0.6), { tone: "hi", inner: `<path d="${G.arcOf(G.frameOf([x, y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 4, 4.02, P) + G.arcOf(G.frameOf([x, y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 9, 4.02, P)}" fill="none" stroke="#5d7f96" stroke-width=".6"/>` })));
    out.push(ISO.tinted(WHITE, S(K.cylinder(x, y, 2, 13, 1.6, P, 24), { tone: "mid" }) + S(K.cylinder(x, y, 0.6, 14.6, 1.6, P, 12), { tone: "mid" }) + S(K.cylinder(x, y, 1.6, 16.2, 1.6, P, 20), { tone: "hi" })));
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [x, x + 4], [y - 0.5, y + 0.5], [16.8, 17.6], "hi")));
    return out.join("");
  }

  ISO.add({
    name: "ppe", title: "Protective gear", compare: "ppe 480 270 260 k=gloves",
    about: "Protective gear laid out in the order it goes on: gown, mask, goggles, gloves; each lifts and lights in turn.",
    line: "ppe cx cy size k=gloves|mask|gown|goggles step=0..4 lab=1 lit=gown|mask|goggles|gloves|box|gel",
    steps: ORDER.map((n, i) => ({ title: `${i + 1} ${n}`, say: SAY[n], lit: n })),
    demo: { line: "ppe 480 280 300", script: [{ set: { step: 1 }, hold: 1.6 }, { set: { step: 2 }, hold: 1.6 }, { set: { step: 3 }, hold: 1.6 }, { set: { step: 4 }, hold: "settle" }, { set: { step: 0 }, hold: "settle" }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.9, H = size * 1.7;
      const { P, g } = ISO.frame([...K.boxCorners(TOP, -10, 0), [TOP.x, TOP.y, 18], [TOP.x + TOP.w, TOP.y, 14]], cx, cy, W, H, { azimuth: 58, elevation: 42 }, parent);
      // back to front: gel and the glove box, the mask, goggles, the gown and the gloves
      const parts = { gel: gelSvg(P), box: boxSvg(P), mask: maskSvg(P), goggles: gogglesSvg(P), gown: gownSvg(P), gloves: glovesSvg(P) };
      const seq = ["gel", "box", "mask", "goggles", "gown", "gloves"];
      g.innerHTML = ISO.baseboard(P, TOP, { h: 2, feet: 3, tint: STEEL }) + seq.map((n) => `<g data-name="${n}">${parts[n]}</g>`).join("") + `<g data-part="words"></g>`;
      const el = Object.fromEntries([...seq, "words"].map((n) => [n, g.querySelector(`[data-name="${n}"],[data-part="${n}"]`)])), w = ISO.writer();
      const pick = (k) => (ORDER.includes(k) ? k : "");
      let sel = pick(o.k || ""), lit = o.lit || "";
      if (o.step !== undefined) sel = ORDER[(+o.step | 0) - 1] || "";
      const lift = Object.fromEntries(seq.map((n) => [n, n === sel ? 1 : 0]));
      const ANCH = { gown: [-23.5, 16, 3.8], mask: [-7, -11.5, 0.7], goggles: [2, 5.2, 7.5], gloves: [22, 21, 0.8], box: [33, -9.5, 4], gel: [-29, -11, 17.6] };
      const draw = () => {
        for (const n of ORDER) w.attr(el[n], "transform", K.translateAlong(P, [0, 0, 4 * ISO.ease(lift[n])]));
        w.rebuild(el.words, lab ? sel : "", () => !lab ? "" : [
          ...ORDER.map((n, i) => ISO.word(K.iso(ANCH[n], P), `${i + 1} ${n}`, n === sel ? "#a3271b" : "#33506f", { size: 15, dy: n === "mask" || n === "goggles" ? -12 : 22 })),
          ISO.word(K.iso(ANCH.gel, P), "hand gel", "#5d7f96", { size: 13, dy: -10 }), ISO.word(K.iso(ANCH.box, P), "glove box", "#444", { size: 13, anchor: "start", dy: 4 }),
        ].join(""));
        const want = lit || sel;
        w.light(seq.map((n) => el[n]), want ? [el[want]].filter(Boolean) : []);
      };
      g.set = (p) => {
        if (p.k !== undefined) sel = pick(p.k);
        if (p.step !== undefined) sel = ORDER[(+p.step | 0) - 1] || "";
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        for (const n of ORDER) { const to = n === sel ? 1 : 0; lift[n] = calm ? to : Math.abs(to - lift[n]) <= dt * 2.5 ? to : lift[n] + Math.sign(to - lift[n]) * dt * 2.5; if (lift[n] !== to) moving = true; }
        draw();
        return moving;
      };
      g.readout = () => (sel ? SAY[sel] : "put on in this order: gown, mask, goggles, gloves · take off: gloves, goggles, gown, mask, then clean your hands");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
