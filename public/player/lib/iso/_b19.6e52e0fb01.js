// Batch b19 helpers (PARTS.md, batch 5): the lab lever's pieces (leverplank carries the vial, the cast weight and the
// rider, so the same drawing code serves those parts alone and riding the plank). Not a recipe: it only defines
// window.B19. A frame `at(u, w, y)` gives the world point u along, w up, y across (an object's own surface middle is
// at(0, 0, 0)); a part alone uses B19.flat, the plank passes its tilted frame. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const B19 = (window.B19 = {});
  B19.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  B19.flat = (u, w, y) => [u, y, w];
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dirs = (at) => { const o = at(0, 0, 0); return { o, du: sub(at(1, 0, 0), o), dw: sub(at(0, 1, 0), o), dy: sub(at(0, 0, 1), o) }; };
  const BRASS = ISO.T.brass, STEEL = ISO.T.steel;

  // the lever's fixed geometry (scaled 1:4 from lever.js): the pin 7.5 cm over the bench, the plank's underside 0.5 cm
  // under the pin, its ends 32.5 cm left and 62.5 cm right of it, rubber stops 1 cm tall under x = -30.5 and +60.5
  B19.LEVER = { pinZ: 7.5, under: 0.5, thick: 1.5, from: -32.5, to: 62.5, half: 2.5, stops: [-30.5, 60.5], stopH: 1 };
  // the tilt (rad, + = right end up) at which the plank's underside lands on the stop under x
  B19.stopAngle = (x) => {
    const L = B19.LEVER, qz = L.stopH - L.pinZ, f = (t) => -x * Math.sin(t) + qz * Math.cos(t) + L.under;
    let a = 0, b = x < 0 ? 0.6 : -0.6;
    for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (Math.sign(f(m)) === Math.sign(f(a))) a = m; else b = m; }
    return (a + b) / 2;
  };

  // a cast load block 8 × 6 × 8 cm: body with a bevelled top, two handle posts and the bar, mass on the near face
  B19.castweight = (at, P, kg) => {
    const { o, du, dw } = dirs(at), out = [];
    out.push(ISO.box(at, P, [-4, 4], [0, 5.5], [-3, 3], "hi"), ISO.box(at, P, [-3.7, 3.7], [5.5, 6], [-2.7, 2.7], "hi"));
    for (const u of [-2.8, 2.8]) out.push(ISO.box(at, P, [u - 0.35, u + 0.35], [6, 7.5], [-0.35, 0.35], "hi"));
    out.push(ISO.box(at, P, [-3.2, 3.2], [7.5, 8], [-0.45, 0.45], "hi"));
    const p = at(0, 2.2, 3.01);
    out.push(LAB.faceText(P, p, du, `${+(+kg).toFixed(2)} kg`, 1.5, "#1f4f8f", dw));
    out.push(`<path d="${K.pathOf([at(-3.4, 4.6, 3.01), at(3.4, 4.6, 3.01)].map((q) => K.iso(q, P)))}" stroke="#1f4f8f" stroke-opacity=".35" stroke-width="0.6"/>`);
    out.push(K.dotsSvg([at(-3.4, 0.7, 3.01), at(3.4, 0.7, 3.01)].map((q) => K.iso(q, P)), { size: 0.5 }));
    void o;
    return ISO.tinted(ISO.T.blue, out.join(""));
  };

  // the red rider 3 × 6 × 3 cm (250 g with its stem) clamping a 5 × 1.5 cm plank, n slotted 250 g brass masses on its
  // stem; at(0,0,0) = the plank's top under the rider's middle. back = what lies behind the plank, front = the rest
  B19.MASS_T = 1.5;
  B19.rider = (at, P, n) => {
    const { du, dw, dy } = dirs(at), L = B19.LEVER;
    const back = [ISO.box(at, P, [-1.5, 1.5], [-L.thick - 0.5, 0], [-3, -L.half]), ISO.box(at, P, [-1.5, 1.5], [-L.thick - 0.5, -L.thick], [-L.half, L.half])];
    const front = [ISO.box(at, P, [-1.5, 1.5], [0, 0.8], [-3, 3], "hi"), ISO.box(at, P, [-1.5, 1.5], [-L.thick - 0.5, 0], [L.half, 3], "hi")];
    const Fs = G.frameAlong(at(0, -0.8, 3), dy);
    front.push(ISO.tinted(STEEL, S(G.disc(0, 0.5, 0.25, Fs, P), { tone: "mid" }) + S(G.disc(0.5, 0.95, 0.6, Fs, P), { tone: "mid" })));
    const Fz = G.frameAlong(at(0, 0.8, 0), dw), top = 0.8 + n * B19.MASS_T;
    front.push(ISO.tinted(STEEL, S(G.disc(0, top + 0.7, 0.3, Fz, P), { tone: "mid", crease: "none" })));
    const masses = [];
    for (let i = 0; i < n; i++) masses.push(S(G.disc(i * B19.MASS_T + 0.03, (i + 1) * B19.MASS_T, 2.4, Fz, P), { tone: "hi" }));
    if (n) {
      // the slot of the top mass (stem to rim, toward +u) and its stamp
      const z = top + 0.01, slot = [[0.3, -0.32], [2.4, -0.32], [2.4, 0.32], [0.3, 0.32]].map(([u, y]) => K.iso(at(u, z, y), P));
      masses.push(`<path d="${K.pathOf(slot, true)}" fill="#6b5114" fill-opacity=".7"/>`, LAB.faceText(P, at(-1.2, z, 0), dy.map((v) => -v), "250 g", 0.55, "#6b5114", du.map((v) => -v)));
      masses.push(S(G.disc(top - 0.01, top + 0.7, 0.3, Fz, P), { tone: "mid", crease: "none" }));
    }
    return { back: ISO.tinted(ISO.T.red, back.join("")), front: ISO.tinted(ISO.T.red, front.join("")) + ISO.tinted(BRASS, masses.join("")), top };
  };

  // a spirit-level vial 6 × 1.2 cm in a brass seat 6.6 × 1.8 cm; b = how far the bubble sits from the middle (+u)
  B19.VIAL_R = 30;   // the vial's curve: 1° moves the bubble 5 mm; it reaches an end at about ±4°
  B19.bubbleOf = (tilt) => ISO.clamp(B19.VIAL_R * tilt, -2.1, 2.1);
  B19.vial = (at, P, b) => {
    const { du } = dirs(at), out = [ISO.tinted(BRASS, ISO.box(at, P, [-3.3, 3.3], [0, 0.35], [-0.9, 0.9], "mid"))];
    const F = G.frameAlong(at(0, 0.6, 0), du);
    out.push(ISO.tinted(BRASS, S(G.disc(-3.2, -2.95, 0.66, F, P), { tone: "mid" })));
    out.push(`<g opacity=".9">${ISO.tinted(LAB.tintOf("#e3ea7a", "#6b6410"), S(G.disc(-2.95, 2.95, 0.6, F, P), { tone: "hi", crease: "none" }))}</g>`);
    const ring = (s) => { const q = []; for (let i = 0; i <= 12; i++) q.push(K.iso(G.pointOf(F, s, 0.61, Math.PI * (0.05 + (0.9 * i) / 12)), P)); return K.pathOf(q); };
    out.push(`<path d="${ring(-0.75) + ring(0.75)}" fill="none" stroke="#222" stroke-width="0.6"/>`);
    const bub = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; bub.push(K.iso(G.pointOf(F, b + Math.cos(a) * 0.55, 0.62, Math.PI / 2 + Math.sin(a) * 0.55), P)); }
    out.push(`<path d="${K.pathOf(bub, true)}" fill="#fbfdf0" stroke="#7c7a20" stroke-width="0.5"/>`);
    out.push(ISO.tinted(BRASS, S(G.disc(2.95, 3.2, 0.66, F, P), { tone: "mid" })));
    return out.join("");
  };

  // the fulcrum's cheek plate on side y0..y1 (from the plinth top to 0.8 cm over the pin), with the pin's hole ring
  B19.cheek = (P, y0, y1, oz = 0) => {
    const L = B19.LEVER;
    return ISO.tinted(STEEL, ISO.wbox(P, [-1.5, 1.5], [y0, y1], [0.75 + oz, L.pinZ + 0.8 + oz], "mid"));
  };
  // the pin's near end, standing out of the near cheek (y 3.1 .. 3.4) with its head
  B19.pinEnd = (P, z) => {
    const F = G.frameAlong([0, 3.1, z], [0, 1, 0]);
    return ISO.tinted(STEEL, S(G.disc(0, 0.12, 0.45, F, P), { tone: "mid" }) + S(G.disc(0.12, 0.35, 0.3, F, P), { tone: "mid" }));
  };
})();
