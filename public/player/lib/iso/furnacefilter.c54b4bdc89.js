// "furnacefilter cx cy width k=clean|dirty lab=1 lit=…" — a furnace with its return-air duct and the filter slot.
// The filter is a 16 × 25 × 4 in pleated media filter in a card frame: pleats run top to bottom, card straps hold
// them, and its end (the face you see in the slot) carries the size and the AIR FLOW arrow, which must point the way
// the air goes: along the return duct, toward the furnace. set({ phase: "out" }) slides the old filter out of the
// slot; set({ phase: "in" }) slides the new one in. k=dirty starts with a grey, dust-laden filter in the slot.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. A 16 × 25 × 4 in filter is 39.4 × 62.2 × 9.5 cm actual.
  const DUCT = { x0: -52, x1: 0, y0: -34, y1: 34, z0: 0, z1: 46 }, FURN = { x0: 0, x1: 54, y0: -36, y1: 36, z1: 96 };
  const FX = [-14.75, -5.25], FY = [-27.7, 34.5], FZ = [2.6, 42], OUT = 74;
  const C = { clean: ["#e9ecef", "#ffffff"], dirty: ["#8f8778", "#a79f8e"], card: ISO.T.amber, arrow: "#1f4f8f" };

  function roomSvg(P, lab) {
    const out = [], at3 = (p) => K.iso(p, P);
    const floor = { x: -58, y: -40, w: 118, d: 120, r: 2 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -3, 3, P)}"/>`, S(K.slabOf(floor, -3, 3, P, 3, 0.6), { tone: "lo" }));
    // Furnace cabinet: two front panels, louvres (closed slots), a rating plate and the flue collar on top.
    const furnace = [ISO.wbox(P, [FURN.x0, FURN.x1], [FURN.y0, FURN.y1], [0, FURN.z1], "mid")];
    furnace.push(ISO.wbox(P, [FURN.x0 + 3, FURN.x1 - 3], [FURN.y1, FURN.y1 + 0.6], [4, 44], "mid"), ISO.wbox(P, [FURN.x0 + 3, FURN.x1 - 3], [FURN.y1, FURN.y1 + 0.6], [47, FURN.z1 - 4], "mid"));
    for (let i = 0; i < 6; i++) { const z = FURN.z1 - 12 - i * 3; furnace.push(`<path d="${K.pathOf([[12, z], [42, z], [42, z + 1.2], [12, z + 1.2]].map(([x, zz]) => at3([x, FURN.y1 + 0.62, zz])), true)}" fill="#c9cdd2" stroke="#3c3f45" stroke-width="0.5"/>`); }
    furnace.push(`<path d="${K.pathOf([[20, 30], [34, 30], [34, 38], [20, 38]].map(([x, z]) => at3([x, FURN.y1 + 0.62, z])), true)}" fill="#f4f4ef" stroke="#3c3f45" stroke-width="0.5"/>`);
    for (const z of [32, 34, 36]) furnace.push(ISO.seam(P, [[22, FURN.y1 + 0.63, z], [z === 36 ? 32 : 29, FURN.y1 + 0.63, z]], "#7a7f86", 0.5));
    furnace.push(D([[6, 24], [48, 24], [6, 70], [48, 70]].map(([x, z]) => at3([x, FURN.y1 + 0.6, z])), { size: 0.55 }));
    furnace.push(S(K.cylinder(27, 0, 7.5, FURN.z1, 6, P, 32), { tone: "mid" }), L(K.ring(27, 0, 5.8, FURN.z1 + 6, P, 28), { tone: "lo" }));
    // Return duct into the furnace's side, with its seams and the slot's channel round the opening.
    out.push(`<g data-name="duct">${ISO.wbox(P, [DUCT.x0, FX[0] - 0.6], [DUCT.y0, DUCT.y1], [DUCT.z0, DUCT.z1], "mid")}${ISO.wbox(P, [FX[1] + 0.6, DUCT.x1], [DUCT.y0, DUCT.y1], [DUCT.z0, DUCT.z1], "mid")}` +
      `${ISO.wbox(P, [FX[0] - 0.6, FX[1] + 0.6], [DUCT.y0, DUCT.y1], [FZ[1] + 0.6, DUCT.z1], "mid")}</g>`);
    for (const x of [-38, -26]) out.push(ISO.seam(P, [[x, DUCT.y1, 0], [x, DUCT.y1, DUCT.z1], [x, DUCT.y0, DUCT.z1]], "#7a7f86", 0.6));
    // Slot channel flanges on the duct front, either side of the opening.
    for (const [a, b] of [[FX[0] - 3, FX[0] - 0.6], [FX[1] + 0.6, FX[1] + 3]]) out.push(ISO.wbox(P, [a, b], [DUCT.y1, DUCT.y1 + 1.2], [0, DUCT.z1], "mid"));
    out.push(D([[FX[0] - 1.8, 6], [FX[0] - 1.8, 40], [FX[1] + 1.8, 6], [FX[1] + 1.8, 40]].map(([x, z]) => at3([x, DUCT.y1 + 1.2, z])), { size: 0.5 }));
    // The furnace is nearer than the duct (it stands on the duct's +x end), so it is drawn after it.
    out.push(`<g data-name="furnace">${furnace.join("")}</g>`);
    // Air-flow arrow on the duct side, pointing to the furnace.
    out.push(`<path d="${K.pathOf([[-46, 30], [-34, 30], [-34, 33], [-28, 28], [-34, 23], [-34, 26], [-46, 26]].map(([x, z]) => at3([x, DUCT.y1 + 0.02, z])), true)}" fill="#dfe6ee" stroke="${C.arrow}" stroke-width="0.7"/>`);
    if (lab) {
      out.push(ISO.word(at3([27, FURN.y1, FURN.z1]), "Furnace", "#444", { size: 13, dy: -14 }));
      out.push(ISO.word(at3([-40, DUCT.y1, DUCT.z1]), "Return air", "#444", { size: 13, dy: -8 }));
    }
    return out.join("");
  }
  // A filter, built in the slot: card frame round the pleats, two card straps, and its printed end.
  function filterSvg(P, dirty, name) {
    const [x0, x1] = FX, [y0, y1] = FY, [z0, z1] = FZ, b = 2.2, out = [];
    const media = dirty ? C.dirty : C.clean;
    out.push(ISO.tinted(C.card, ISO.wbox(P, [x0, x1], [y0, y1], [z0, z0 + b], "mid") + ISO.wbox(P, [x0, x1], [y0, y0 + b], [z0, z1], "mid")));
    // Pleats seen on the downstream face (+x): alternating folds between the frame bars.
    const pleats = [], px = x1 - 0.4;
    for (let y = y0 + b, i = 0; y < y1 - b - 0.01; y += 1.6, i++) {
      const e = Math.min(y + 1.6, y1 - b);
      pleats.push(`<path d="${K.pathOf([[y, z0 + b], [e, z0 + b], [e, z1 - b], [y, z1 - b]].map(([yy, z]) => K.iso([px, yy, z], P)), true)}" fill="${media[i % 2]}" stroke="${media[0]}" stroke-width="0.3"/>`);
    }
    out.push(pleats.join(""));
    if (dirty) for (let i = 0; i < 26; i++) { const y = y0 + 4 + ((i * 37) % 54), z = z0 + 4 + ((i * 23) % 32); const a = K.iso([px + 0.02, y, z], P); out.push(`<circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="${(0.8 + (i % 3) * 0.5).toFixed(1)}" fill="#6f675a" opacity=".45"/>`); }
    // Card straps across the pleats.
    for (const yy of [y0 + 21, y0 + 41]) out.push(ISO.tinted(C.card, ISO.wbox(P, [x1 - 0.4, x1], [yy - 1, yy + 1], [z0 + b, z1 - b], "mid")));
    out.push(ISO.tinted(C.card, ISO.wbox(P, [x0, x1], [y0, y1], [z1 - b, z1], "mid") + ISO.wbox(P, [x0, x1], [y1 - b, y1], [z0, z1], "mid")));
    // The end you see in the slot: size and the AIR FLOW arrow, pointing along +x (toward the furnace).
    const m = ISO.faceMatrix(P, [x0, y1 + 0.02, z1], 1), font = "'Helvetica Neue',Arial,sans-serif";
    out.push(`<g transform="${m}"><text x="4.75" y="5.5" text-anchor="middle" style="font:700 1.5px ${font}" fill="#3a2a0c">16×25×4</text>` +
      `<text x="4.75" y="16" text-anchor="middle" style="font:700 1.5px ${font}" fill="${C.arrow}">AIR FLOW</text>` +
      `<path d="M1.2 19.2 H6.4 V17.6 L8.6 20 L6.4 22.4 V20.8 H1.2 Z" fill="${C.arrow}"/>` +
      `<text x="4.75" y="34" text-anchor="middle" style="font:600 1.2px ${font}" fill="#3a2a0c">${dirty ? "MERV 8" : "MERV 11"}</text></g>`);
    return `<g data-name="${name}">${out.join("")}</g>`;
  }

  ISO.add({
    name: "furnacefilter", title: "Furnace filter", compare: "furnacefilter 480 270 380",
    about: "Furnace and its return-air duct with a 16×25×4 pleated filter in the slot: the dusty old filter slides out and a new one slides in with its AIR FLOW arrow pointing toward the furnace.",
    line: "furnacefilter cx cy width k=clean|dirty lab=1 lit=old|new|duct|furnace",
    demo: { line: "furnacefilter 480 270 380 k=dirty", script: [{ set: {}, hold: 1 }, { set: { phase: "out" }, hold: "settle" }, { set: { phase: "in" }, hold: "settle" }] },
    make([cx, cy, width = 380], o, t, parent) {
      const lab = o.lab !== "0", W = width * 1.45, H = width * 1.05;
      const { P, g } = ISO.frame([[-58, -40, -3], [60, -40, -3], [-58, 80, -3], [60, 80, -3], [FURN.x0, FURN.y0, FURN.z1 + 6], [FURN.x1, FURN.y1, FURN.z1], [DUCT.x0, DUCT.y0, DUCT.z1]], cx, cy, W, H, { azimuth: 66, elevation: 24 }, parent);
      // What sits inside the duct is hidden: each filter is clipped to the space in front of the duct's face.
      const clip = ISO.hullOf([[-20, DUCT.y1, -4], [0, DUCT.y1, -4], [-20, DUCT.y1, 60], [0, DUCT.y1, 60], [-20, 160, -4], [0, 160, -4], [-20, 160, 60], [0, 160, 60]].map((p) => K.iso(p, P)));
      const id = `ff${Math.round(Math.random() * 1e9)}`;
      const dirty0 = o.k === "dirty";
      g.innerHTML = `<g>${roomSvg(P, lab)}</g><clipPath id="${id}"><path d="${K.pathOf(clip, true)}"/></clipPath>` +
        `<g data-part="lane" clip-path="url(#${id})"><g data-part="old">${filterSvg(P, dirty0, "old")}</g><g data-part="new">${filterSvg(P, false, "new")}</g></g><g data-part="words"></g>`;
      const oldF = g.querySelector('[data-part="old"]'), newF = g.querySelector('[data-part="new"]'), words = g.querySelector('[data-part="words"]'), w = ISO.writer();
      const s = { a: 0, aT: 0, b: OUT, bT: OUT, aFade: 1, bFade: 0, phase: "", lit: o.lit || "" };
      const draw = () => {
        w.attr(oldF, "transform", K.translateAlong(P, [0, s.a, 0])); w.attr(oldF, "opacity", s.aFade.toFixed(2)); w.shown(oldF, s.aFade > 0.01);
        w.attr(newF, "transform", K.translateAlong(P, [0, s.b, 0])); w.attr(newF, "opacity", s.bFade.toFixed(2)); w.shown(newF, s.bFade > 0.01);
        const lit = s.lit || (s.phase === "out" ? "old" : s.phase === "in" ? "new" : "");
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
        w.rebuild(words, `${lab} ${s.phase} ${s.a > OUT - 1} ${s.b < 1}`, () => {
          if (!lab) return "";
          if (s.phase === "out" && s.a > OUT - 1) return ISO.word(K.iso([FX[0], FY[1] + OUT, FZ[1]], P), dirty0 ? "Old filter: clogged with dust" : "Old filter", "#7a5a2e", { anchor: "end", size: 13, dy: -6 });
          if (s.phase === "in") return ISO.word(K.iso([FX[1], FY[1] + s.b, FZ[1]], P), "Arrow points to the furnace", "#1f4f8f", { anchor: "start", size: 13, dy: -6 });
          return "";
        });
      };
      g.set = (p) => {
        if (p.phase === "out") { s.phase = "out"; s.aT = OUT; }
        if (p.phase === "in") { s.phase = "in"; s.aT = OUT; s.bT = 0; }
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), was = [s.a, s.b, s.aFade, s.bFade];
        // Pulled by hand at a steady pace (an eased follow), the new one only after the old one is clear and set aside.
        s.a = ISO.follow(s.a, s.aT, dt, 0.45, calm);
        s.aFade = ISO.follow(s.aFade, s.phase === "in" ? 0 : 1, dt, 0.25, calm);
        if (s.phase === "in") {
          s.bFade = ISO.follow(s.bFade, 1, dt, 0.25, calm);
          if (s.bFade > 0.9 || calm) s.b = ISO.follow(s.b, s.bT, dt, 0.5, calm);
        }
        draw();
        return [s.a, s.b, s.aFade, s.bFade].some((v, i) => Math.abs(v - was[i]) > 1e-4);
      };
      g.readout = () => {
        if (s.phase === "out") return s.a > OUT - 1 ? `old filter out · ${dirty0 ? "grey with dust: it chokes the air flow, the furnace works harder" : "still clean"}` : "sliding the old filter out of the slot";
        if (s.phase === "in") return s.b < 0.5 ? "new 16×25×4 in filter in · AIR FLOW arrow points toward the furnace · change every 6–12 months (1 in filters: 1–3)" : "sliding the new filter in, arrow toward the furnace";
        return `16×25×4 in filter in the return-air slot · ${dirty0 ? "dirty" : "clean"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
