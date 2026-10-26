// "photoelectric cx cy size color=red|green|blue|uv lab=1" — the photoelectric effect with a vacuum photocell.
// Light from a lamp passes a colour filter onto a photocell: a curved potassium cathode facing a wire anode in an
// evacuated glass bulb, wired to a microammeter. Potassium needs 2.3 eV per electron (light below 540 nm): red light
// (1.9 eV) frees none however bright it is; green, blue and ultraviolet do, and the electrons leave with up to
// hf − φ of energy. set({ color }) turns the filter wheel; the meter and the electrons follow.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const PHI = 2.3, BEAM_Z = 40, LAMP_X = -100, CELL = [40, 0, BEAM_Z], METER = [40, 46];
  const LIGHT = { red: { nm: 680, c: "#e5302a" }, green: { nm: 530, c: "#22b04b" }, blue: { nm: 450, c: "#2b6cc4" }, uv: { nm: 300, c: "#8a4fd6" } };
  const eV = (nm) => 1240 / nm;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function staticSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -130, y: -40, w: 240, d: 110, r: 6 }, { h: 6 })];
    // Lamp in a housing on a post, with a filter wheel in front of its lens.
    out.push(S(K.cylinder(LAMP_X, 0, 7, 0, BEAM_Z - 16, P, 24), { tone: "mid" }), ISO.wbox(P, [LAMP_X - 14, LAMP_X + 8], [-11, 11], [BEAM_Z - 13, BEAM_Z + 13], "mid"));
    out.push(ISO.tinted(ISO.T.glass, S(G.disc(8, 10, 7, xAx([LAMP_X, 0, BEAM_Z]), P), { tone: "hi" })));
    out.push(S(K.cylinder(LAMP_X + 24, 0, 2, 0, BEAM_Z, P, 16), { tone: "mid", crease: "none" }));
    // Photocell base: a black socket on a stand.
    out.push(S(K.cylinder(CELL[0], 0, 9, 0, 12, P, 32, 0.5), { tone: "mid" }), ISO.tinted(ISO.T.plastic, S(K.cylinder(CELL[0], 0, 8, 12, 6, P, 32), { tone: "hi" })));
    // Microammeter on the base in front of the cell.
    const [mx, my] = METER;
    out.push(ISO.wbox(P, [mx - 16, mx + 16], [my - 10, my + 10], [0, 22], "mid"));
    out.push(`<path d="${K.pathOf([[mx - 13, my + 10.05, 3], [mx + 13, my + 10.05, 3], [mx + 13, my + 10.05, 20], [mx - 13, my + 10.05, 20]].map((p) => K.iso(p, P)), true)}" fill="#fbfbfa" stroke="#8a8a8f" stroke-width="0.6"/>`);
    out.push(`<path d="${K.pathOf([[CELL[0] - 6, 6, 12], [mx - 8, my - 6, 22]].map((p) => K.iso(p, P)))}${K.pathOf([[CELL[0] + 6, 6, 12], [mx + 8, my - 6, 22]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c0392b" stroke-width="1.2"/>`);
    if (lab) out.push(ISO.word(K.iso([LAMP_X, 0, BEAM_Z + 14], P), "lamp", "#555", { size: 13, dy: -4 }), ISO.word(K.iso([mx, my + 10, 0], P), "microammeter", "#555", { size: 13, dy: 16 }));
    return out.join("");
  }
  // The filter wheel: four coloured windows on a disc, the chosen one in the beam.
  function wheelSvg(P, a) {
    const F = G.frameOf([LAMP_X + 24, 0, BEAM_Z + 12], [1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]), out = [S(G.disc(-1, 1, 16, xAx([LAMP_X + 24, 0, BEAM_Z + 12]), P), { tone: "mid" })];
    Object.values(LIGHT).forEach((l, i) => { const c = G.pointOf(F, 1.05, 10, -Math.PI / 2 + (i * Math.PI) / 2); out.push(`<path d="${G.circleOf(G.frameOf(c, [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 4, P)}" fill="${l.c}" fill-opacity=".7" stroke="#3c3f45" stroke-width="0.5"/>`); });
    return out.join("");
  }
  // The photocell: electrodes behind, electrons flying across when freed, the glass bulb in front.
  function electrodesSvg(P) {
    return ISO.prismY(P, ISO.arc(CELL[0], BEAM_Z, 14, Math.PI * 0.7, Math.PI * 1.3, 12).concat(ISO.arc(CELL[0], BEAM_Z, 12, Math.PI * 1.3, Math.PI * 0.7, 12)).map(([x, z]) => [x + 10, z]), -8, 8, ["#8d9096", "#d8dbe0"], "#c7c9cd", "#3c3f45") +
      S(K.cylinder(CELL[0] + 6, 0, 0.8, 18, BEAM_Z - 14, P, 10), { tone: "mid", crease: "none" }) + `<path d="${G.circleOf(G.frameOf([CELL[0] + 6, 0, BEAM_Z + 4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 5, P)}" fill="none" stroke="#55575c" stroke-width="1"/>`;
  }
  function electronsSvg(P, t) {
    const out = [];
    for (let i = 0; i < 6; i++) { const f = (t * 1.6 + i / 6) % 1, z = BEAM_Z - 10 + (i % 3) * 6, x = CELL[0] - 2 + f * 9, q = K.iso([x, 0, z], P); out.push(`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="1.2" fill="#1f4f8f"/>`); }
    return out.join("");
  }
  const glassSvg = (P) => ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, 6], [6, 7, 1], [14, 14, 1], [26, 16, 1], [38, 13, 1], [44, 6, 1], [46, 0]], G.frameOf([CELL[0], 0, 18], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { smooth: true }), { tone: "hi" }).replace('class="iso-fill"', 'class="iso-fill" fill-opacity=".25"'));
  function needleSvg(P, v) {
    const [mx, my] = METER, c = [mx, my + 10.1, 6], rr = 11, d = (-50 + ISO.clamp(v, 0, 1) * 100) * (Math.PI / 180), arc = [];
    for (let k = -50; k <= 50; k += 4) arc.push(K.iso([c[0] + Math.sin((k * Math.PI) / 180) * rr, c[1], c[2] + Math.cos((k * Math.PI) / 180) * rr], P));
    return L(K.pathOf(arc), { tone: "lo" }) + D([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "lo" }) +
      `<path class="iso-line" data-tone="lit" data-free="end" d="${K.segment(c, [c[0] + Math.sin(d) * (rr + 1), c[1], c[2] + Math.cos(d) * (rr + 1)], P)}" style="stroke-width:1.2"/>` + D([K.iso(c, P)], { size: 0.8, tone: "hi" });
  }

  ISO.add({
    name: "photoelectric", title: "Photoelectric effect", compare: "photoelectric 480 290 300",
    about: "A photocell under coloured light: red frees no electrons however bright; green, blue and UV do, with more energy the bluer the light.",
    line: "photoelectric cx cy size color=red|green|blue|uv lab=1",
    demo: { line: "photoelectric 480 280 320", script: [{ set: { color: "red" }, hold: 2.2 }, { set: { color: "green" }, hold: 2.4 }, { set: { color: "blue" }, hold: 2.4 }, { set: { color: "uv" }, hold: 2.4 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.6, H = size * 1.1;
      const { P, g } = ISO.frame([[-130, -40, -10], [110, 70, -10], [-110, 0, 70], [60, 0, 70]], cx, cy, W, H, { azimuth: 50, elevation: 24 }, parent);
      const order = Object.keys(LIGHT), s = { color: LIGHT[o.color] ? o.color : "red", a: 0, aT: 0, needle: 0, t: 0 };
      s.a = s.aT = -order.indexOf(s.color) * (Math.PI / 2);
      g.innerHTML = `<g>${staticSvg(P, lab)}</g><g data-part="wheel"></g><path data-part="beam" stroke-width="3" opacity=".55" stroke-linecap="round"/><g>${electrodesSvg(P)}</g><g data-part="electrons"></g><g opacity=".42">${glassSvg(P)}</g><g data-part="needle"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const freed = () => eV(LIGHT[s.color].nm) > PHI;
      const draw = () => {
        w.rebuild(el.wheel, s.a.toFixed(3), () => wheelSvg(P, s.a));
        w.attr(el.beam, "d", K.pathOf([K.iso([LAMP_X + 10, 0, BEAM_Z], P), K.iso([CELL[0] - 4, 0, BEAM_Z], P)]));
        w.attr(el.beam, "stroke", LIGHT[s.color].c);
        w.rebuild(el.electrons, freed() ? ((s.t * 1.6) % 1).toFixed(2) : "x", () => (freed() ? electronsSvg(P, s.t) : ""));
        w.rebuild(el.needle, s.needle.toFixed(3), () => needleSvg(P, s.needle));
        if (lab) w.rebuild(el.words, s.color, () => ISO.word(K.iso([CELL[0], 0, 66], P), `${s.color === "uv" ? "UV" : s.color} ${LIGHT[s.color].nm} nm · ${eV(LIGHT[s.color].nm).toFixed(1)} eV`, LIGHT[s.color].c, { size: 14, dy: -4 }));
      };
      g.set = (p) => { if (p.color && LIGHT[p.color]) { s.color = p.color; s.aT = -order.indexOf(p.color) * (Math.PI / 2); } };
      g.update = (dt) => {
        s.a = ISO.follow(s.a, s.aT, dt, 0.3, ISO.still()); s.t += dt;
        s.needle = ISO.follow(s.needle, freed() ? 0.3 + 0.18 * (eV(LIGHT[s.color].nm) - PHI) : 0, dt, 0.2, ISO.still());
        draw();
        return true;
      };
      g.readout = () => { const E = eV(LIGHT[s.color].nm); return E > PHI ? `${E.toFixed(2)} eV photons > 2.3 eV needed by potassium · electrons freed with up to ${(E - PHI).toFixed(2)} eV · current flows` : `${E.toFixed(2)} eV photons < 2.3 eV · no electrons, however bright the lamp`; };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
