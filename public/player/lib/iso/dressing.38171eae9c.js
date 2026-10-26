// "dressing cx cy size open=0..1 lbl=0 lab=0 lit=film|pad|contact|wound" — a wound dressing, layers lifted apart.
// A block of model skin (skin, dermis, fat on the cut face) on a base board, with a shallow open wound in its top.
// Above it, lifted apart in the order they go on: the contact layer (a thin perforated mesh that won't stick to the
// wound), the absorbent foam pad with its backing, and the clear cover film with an adhesive border and two handling
// tabs. set({ open: 0 }) lowers them onto the wound; the film drapes over the pad and seals on the skin all round.
// open: 1 lifts them apart again. World units: 1 = 1 mm (the skin layers are drawn thicker than life for clarity).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BASE = { x: -96, y: -64, w: 192, d: 128, r: 6 }, BLOCK = { x: -72, y: -46, w: 144, d: 92, r: 2 };
  const ZS = 30;                                                          // the skin's top
  const CON = { x: -34, y: -25, w: 68, d: 50, r: 4 }, PAD = { x: -30, y: -21, w: 60, d: 42, r: 6 };
  const FT = { x: -31, y: -22, w: 62, d: 44 }, FB = { x: -50, y: -38, w: 100, d: 76 };   // the film: over the pad, and its border
  const TC = 0.8, TP = 6, TF = 0.4, LIFT = { con: 22, pad: 46, film: 74 };
  const SKIN = ISO.tint("#f6dccb", ["#d9a68a", "#e2b49a", "#eac3ab", "#f0d0bc"], "#7a4a32");
  const DERMIS = ISO.tint("#f4c7bd", ["#d88f84", "#e09f95", "#e8b0a7", "#efbfb7"], "#7a3a30");
  const FAT = ISO.tint("#fbefc4", ["#e3c56e", "#e9d083", "#efdb9a", "#f4e5b1"], "#7a6420");
  const MESH = ISO.tint("#eef3f6", ["#b9c6cf", "#c7d2d9", "#d4dde3", "#e1e8ec"], "#4a5a66");
  const FOAM = ISO.tint("#fdfdfb", ["#cfd3d6", "#dadddf", "#e4e6e8", "#eeeff0"], "#5a6066");
  const FILM = ISO.tint("#e3f1fb", ["#a9cde8", "#bcd8ee", "#cde3f3", "#dbebf7"], "#2f6a96");
  const ell = (cx, cy, rx, ry, z, n = 40) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a), z]; });

  function skinSvg(P) {
    const out = [ISO.baseboard(P, BASE, { h: 8, ruler: {} })];
    out.push(`<path class="iso-halo" d="${K.haloOf(BLOCK, 0, 4, P)}"/>`);
    out.push(ISO.tinted(FAT, S(K.slabOf(BLOCK, 0, 16, P, 2, 0.4), { tone: "mid" })));
    out.push(ISO.tinted(DERMIS, S(K.slabOf(BLOCK, 16, 10, P, 2, 0.4), { tone: "mid" })));
    out.push(ISO.tinted(SKIN, S(K.slabOf(BLOCK, 26, ZS - 26, P, 2, 0.4), { tone: "hi" })));
    // fat lobules on the cut faces: closed rings, nothing to end
    const lob = [];
    for (let i = 0; i < 9; i++) { const x = -64 + i * 16, z = 5 + (i % 2) * 5; lob.push(K.pathOf(ell(x, 0, 5, 0, z, 16).map(([u, , w], j) => K.iso([u, BLOCK.y + BLOCK.d + 0.05, z + 3.2 * Math.sin((j / 16) * Math.PI * 2)], P)), true)); }
    for (let i = 0; i < 5; i++) { const y = -36 + i * 18, z = 7 + (i % 2) * 4; lob.push(K.pathOf(Array.from({ length: 16 }, (_, j) => { const a = (j / 16) * Math.PI * 2; return K.iso([BLOCK.x + BLOCK.w + 0.05, y + 5 * Math.cos(a), z + 3.2 * Math.sin(a)], P); }), true)); }
    out.push(`<path d="${lob.join("")}" fill="none" stroke="#c9a54a" stroke-width=".6"/>`);
    // the wound: an open, shallow oval in the top, its pink bed and darker edge
    const W = [-4, 2];
    out.push(`<g data-name="wound"><path d="${K.pathOf(ell(W[0], W[1], 22, 14, ZS + 0.03).map((p) => K.iso(p, P)), true)}" fill="#b8473f" stroke="#7a2a24" stroke-width=".8"/>`);
    out.push(`<path d="${K.pathOf(ell(W[0] + 0.6, W[1] + 0.8, 18.5, 11.2, ZS + 0.04).map((p) => K.iso(p, P)), true)}" fill="#e98a7f" stroke="#a8443b" stroke-width=".5"/>`);
    out.push(D([[-12, -2], [-6, 6], [0, -4], [6, 4], [10, -1], [-2, 1], [-15, 5], [4, 9], [-9, -7], [12, 6]].map(([x, y]) => K.iso([W[0] + x, W[1] + y, ZS + 0.05], P)), { size: 0.7, tone: "lo" }) + "</g>");
    return out.join("");
  }
  function conSvg(P) {
    const out = [ISO.tinted(MESH, S(K.slabOf(CON, ZS, TC, P, 3, 0.2), { tone: "mid", crease: "none" }))];
    const dots = [];
    for (let x = CON.x + 4; x <= CON.x + CON.w - 4; x += 4) for (let y = CON.y + 4; y <= CON.y + CON.d - 4; y += 4) dots.push(K.iso([x, y, ZS + TC], P));
    out.push(D(dots, { size: 0.45, tone: "lo" }));
    return out.join("");
  }
  function padSvg(P) {
    const z0 = ZS + TC;
    return ISO.tinted(FOAM, S(K.slabOf(PAD, z0, TP, P, 5, 1.2), { tone: "hi", inner: L(K.sideSeam(PAD, z0 + TP - 1.2, P, 5), { tone: "faint" }) })) +
      L(K.planOutline(K.insetPlan(PAD, 3), z0 + TP, P, 3), { tone: "faint" });
  }
  // The film as one sheet: flat over the pad and, as it comes down, draped to its border on the skin.
  function filmSvg(P, open) {
    const drape = (TC + TP) * (1 - ISO.smooth(0, 0.3, open)), zt = ZS + TC + TP + TF + open * LIFT.film, zb = zt - TF - drape;
    const V = [[FT.x, FT.y, zt], [FT.x + FT.w, FT.y, zt], [FT.x + FT.w, FT.y + FT.d, zt], [FT.x, FT.y + FT.d, zt], [FB.x, FB.y, zb], [FB.x + FB.w, FB.y, zb], [FB.x + FB.w, FB.y + FB.d, zb], [FB.x, FB.y + FB.d, zb]];
    const out = [`<g opacity=".82">${ISO.tinted(FILM, ISO.poly(V, ISO.BOX_F, P, "mid"))}</g>`];
    // the adhesive border, inset on the sheet's skirt: a closed ring
    const k = 0.84, ring = [[FB.x, FB.y], [FB.x + FB.w, FB.y], [FB.x + FB.w, FB.y + FB.d], [FB.x, FB.y + FB.d]].map(([x, y], i) => {
      const t = [[FT.x, FT.y], [FT.x + FT.w, FT.y], [FT.x + FT.w, FT.y + FT.d], [FT.x, FT.y + FT.d]][i];
      return [t[0] + (x - t[0]) * k, t[1] + (y - t[1]) * k, zt + (zb - zt) * k + (drape > 0.1 ? 0.15 : 0.05)];
    });
    out.push(`<path d="${K.pathOf(ring.map((p) => K.iso(p, P)), true)}" fill="none" stroke="#2f6a96" stroke-width=".6" stroke-dasharray="2 1.6"/>`);
    // two handling tabs on the short ends, lying on the border
    for (const sx of [-1, 1]) {   // audit: "loose", but they lie on the film's border (an ISO.poly it doesn't record)
      const x0 = sx < 0 ? FB.x - 7 : FB.x + FB.w, x1 = x0 + 7, z = zb + 0.05;
      out.push(ISO.tinted(ISO.T.blue, ISO.wbox(P, [x0, x1], [-9, 9], [z, z + 0.5], "mid")));
    }
    return out.join("");
  }

  ISO.add({
    name: "dressing", title: "Wound dressing layers", compare: "dressing 460 280 340",
    about: "A wound dressing lifted apart over a block of model skin: contact layer, absorbent pad and cover film come down onto the wound and the film seals on the skin.",
    line: "dressing cx cy size open=0..1 lbl=0 lab=0 lit=film|pad|contact|wound",
    demo: { line: "dressing 480 280 340", script: [{ set: {}, hold: 1.2 }, { set: { open: 0 }, hold: "settle" }, { set: { open: 1 }, hold: "settle" }] },
    make([cx, cy, size = 340], o, t, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = size * 2, H = size * 1.42;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -12, 0), [FB.x - 7, FB.y, ZS + 90], [FB.x + FB.w + 7, FB.y + FB.d, ZS + 90], [130, 0, 0]], cx, cy, W, H, { azimuth: 42, elevation: 30 }, parent);
      g.innerHTML = `<g data-name="skin">${skinSvg(P)}</g><g data-name="contact">${conSvg(P)}</g><g data-name="pad">${padSvg(P)}</g><g data-name="film"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { skin: q("skin"), contact: q("contact"), pad: q("pad"), film: q("film"), wound: q("wound"), words: q("words") }, w = ISO.writer();
      const o0 = ISO.clamp(ISO.num(o, "open", 1), 0, 1);
      const s = { open: o0, want: o0 };
      let lit = o.lit || "";
      const draw = () => {
        const f = s.open, key = f.toFixed(3);
        w.attr(el.contact, "transform", K.translateAlong(P, [0, 0, f * LIFT.con]));
        w.attr(el.pad, "transform", K.translateAlong(P, [0, 0, f * LIFT.pad]));
        w.rebuild(el.film, key, () => filmSvg(P, f));
        const apart = f > 0.5;
        w.rebuild(el.words, lab ? String(apart) : "", () => !lab ? "" : apart ? [
          ISO.word(K.iso([FB.x + FB.w + 16, 0, ZS + TC + TP + LIFT.film], P), "cover film: keeps germs and water out", "#1f4f8f", { anchor: "start", size: 14 }),
          ISO.word(K.iso([PAD.x + PAD.w + 2, 0, ZS + TC + TP / 2 + LIFT.pad], P), "absorbent pad: soaks up fluid", "#444", { anchor: "start", size: 14, dy: 4 }),
          ISO.word(K.iso([CON.x + CON.w + 2, 0, ZS + LIFT.con], P), "contact layer: won't stick to the wound", "#444", { anchor: "start", size: 14, dy: 4 }),
          ISO.word(K.iso([-28, 2, ZS], P), "wound bed", "#8f2a22", { anchor: "end", size: 14, dy: 4 }),
        ].join("") : ISO.word(K.iso([FB.x + FB.w, 0, ZS + 4], P), "film seals on the skin all round", "#1f4f8f", { anchor: "start", size: 14, dy: 4 }) +
          ISO.word(K.iso([BLOCK.x + BLOCK.w, BLOCK.y + BLOCK.d, 12], P), "skin · dermis · fat", "#555", { anchor: "start", size: 13, dy: 4 }));
        const want = lit || (f > 0.02 && f < 0.98 ? "film" : "");
        const groups = { film: el.film, pad: el.pad, contact: el.contact, wound: el.wound };
        w.light(Object.values(groups), groups[want] ? [groups[want]] : []);
      };
      g.set = (p) => { if (p.open !== undefined) s.want = ISO.clamp(+p.open, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), rate = 0.55;
        s.open = calm || Math.abs(s.want - s.open) <= rate * dt ? s.want : s.open + Math.sign(s.want - s.open) * rate * dt;
        draw();
        return s.open !== s.want;
      };
      g.readout = () => s.open >= 0.98 ? "layers lifted apart, in the order they go on: contact layer, pad, film (60 × 42 mm pad)"
        : s.open <= 0.02 ? "dressing on · the contact layer touches the wound, the pad holds fluid, the film seals 10–18 mm of skin all round"
        : s.open < s.want ? "lifting the layers apart" : "lowering the layers onto the wound";
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
