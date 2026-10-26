// "readingcard cx cy k z=3..24 lab=0 lit=card|clip|stand" — a PART (PARTS.md, batch 5): a meniscus reading card on its
// stand, its origin the bench point under the card's middle. A white card 4 × 6 cm with a black band, facing +y (put
// it behind a measuring cylinder: the cylinder at ay= +3 or more), held at its edge by a spring clip on a sleeve that
// slides up a 27 cm steel rod in a weighted round foot 3 cm to the card's left (−x). z = the height of the band's top
// edge over the bench (cm): set it just under the meniscus and the curve stands out dark; set({ z }) slides the card.
// Anchor `band` = the middle of the band's top edge (as built). From mcylinder.js's card. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RX = -3, ROD = 27, CW = 2, BAND = 2;

  function movingSvg(P, z) {
    const top = z + 2.5, bot = z - 3.5, out = [], F = G.frameAlong([RX, 0.45, top - 0.7], [0, 1, 0]);
    const q = (x, zz) => K.iso([x, 0.04, zz], P);
    // back jaw, the card (a thin slab), its band on the face we see, the front jaw, the arm and the sleeve with its screw
    out.push(`<g data-name="clip">${ISO.tinted(ISO.T.steel, ISO.wbox(P, [-CW - 0.15, -CW + 0.55], [-0.2, -0.03], [top - 1.4, top + 0.2], "mid"))}</g>`);
    out.push(`<g data-name="card">${ISO.wbox(P, [-CW, CW], [-0.03, 0.03], [bot, top], "mid")}<path d="${K.pathOf([q(-CW, z - BAND), q(CW, z - BAND), q(CW, z), q(-CW, z)], true)}" fill="#22262b"/></g>`);
    out.push(`<g data-name="clip">${ISO.tinted(ISO.T.steel, ISO.wbox(P, [RX + 0.45, -CW - 0.15], [-0.25, 0.25], [top - 0.9, top - 0.2], "mid") + ISO.wbox(P, [-CW - 0.15, -CW + 0.55], [0.03, 0.2], [top - 1.4, top + 0.2], "mid") +
      S(K.cylinder(RX, 0, 0.5, top - 1.4, 1.4, P, 20, 0.08), { tone: "mid" }) + S(G.disc(0, 0.5, 0.15, F, P), { tone: "mid" }) + S(G.disc(0.5, 0.8, 0.42, F, P), { tone: "mid" }))}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "readingcard", title: "Meniscus reading card (part)", compare: null,
    about: "A white meniscus reading card with a black band on a small stand with a sliding clip; put it behind a measuring cylinder and slide the band's top just under the meniscus. anchors: band",
    line: "readingcard cx cy k z=3..24 lab=0 lit=card|clip|stand",
    demo: { line: "readingcard 480 470 14 z=12 lab=1", script: [{ set: {}, hold: 1 }, { set: { z: 20, lit: "card" }, hold: "settle" }, { set: { z: 6, lit: "clip" }, hold: "settle" }, { set: { z: 14, lit: "stand" }, hold: "settle" }] },
    make([cx = 480, cy = 470, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { z: ISO.clamp(ISO.num(o, "z", 12), 3, 24) }, want = { z: st.z };
      let lit = o.lit || "";
      const stand = `<path class="iso-halo" d="${K.haloOf({ x: RX - 1.8, y: -1.8, w: 3.6, d: 3.6, r: 1.8 }, 0, 0.7, P)}"/>` + ISO.tinted(ISO.T.rubber, S(K.cylinder(RX, 0, 1.75, 0, 0.12, P, 32), { tone: "mid" })) +
        ISO.tinted(ISO.T.paint, S(K.cylinder(RX, 0, 1.8, 0.12, 0.6, P, 32, 0.1), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, S(K.cylinder(RX, 0, 0.2, 0.72, ROD - 0.72, P, 14), { tone: "mid", crease: "none" }) + S(K.cylinder(RX, 0, 0.26, ROD, 0.25, P, 14, 0.06), { tone: "mid" }));
      g.innerHTML = `<g data-name="stand">${stand}</g><g data-part="moving"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.anchors = { band: [0, 0, st.z] };
      const draw = () => {
        const z = Math.round(st.z * 50) / 50;
        w.rebuild(el.moving, String(z), () => movingSvg(P, z));
        if (lab) w.rebuild(el.words, String(z), () => ISO.word(K.iso([CW, 0, z - 1], P), "reading card", "#555", { size: 14, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="'));
        window.B19.light(w, g, lit);
      };
      g.set = (p) => { if (p.z !== undefined && Number.isFinite(+p.z)) want.z = ISO.clamp(+p.z, 3, 24); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => { st.z = ISO.follow(st.z, want.z, dt, 0.4, ISO.still()); draw(); return st.z !== want.z; };
      g.readout = () => `reading card band top ${st.z.toFixed(1)} cm over the bench · set it just under the meniscus to read its bottom`;
      draw();
      return g;
    },
  });
})();
