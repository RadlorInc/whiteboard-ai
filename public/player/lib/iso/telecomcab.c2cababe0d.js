// "telecomcab cx cy k kind=radio|power lab=0 lit=cabinet|door|vents|plinth" — a PART (batch 6): celltower.js's
// outdoor equipment cabinet at real size, 80 × 70 × 160 cm on a 10 cm steel plinth: grey powder-coated steel, a roof
// that overhangs with a rain lip, door seams, three hinges, a swing handle with its lock, louvred vents in the side.
// kind=radio: the radio/baseband cabinet, one tall door with a heat-exchanger grille, a cable entry plate low on the
// side with its glands; kind=power: the power cabinet with battery backup, an upper door for the rectifiers and a
// lower battery door with its own vents and a yellow warning sign, a maker's plate. Origin: the ground point under its
// middle (the door faces +y). Static. World: 1 = 1 cm. anchors: top (the roof's middle), gland (the cable entry).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const HX = 40, HY = 35, ZP = 10, ZT = 160, STEEL = ISO.tint("#e2e5e8", ["#a3a9b0", "#b2b8be", "#c2c7cc", "#d1d5d9"], "#3f454c");
  const PLINTH = ISO.tint("#8d9299", ["#5d6269", "#666b72", "#70757c", "#7a7f86"], "#2a2d31");

  function cabSvg(P, kind, lab) {
    const fy = HY + 0.02, fx = HX + 0.02, F = (x, z) => K.iso([x, fy, z], P), Sx = (y, z) => K.iso([fx, y, z], P);
    const rect = (f, a0, b0, a1, b1, fill = "none", stroke = "#59606a", sw = 0.7) => `<path d="${K.pathOf([f(a0, b0), f(a1, b0), f(a1, b1), f(a0, b1)], true)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX - 2, y: -HY - 2, w: 2 * HX + 4, d: 2 * HY + 4, r: 2 }, 0, 0.1, P)}"/>`];
    // the plinth: a steel frame with a recessed kick panel
    out.push(`<g data-name="plinth">${ISO.tinted(PLINTH, ISO.wbox(P, [-HX + 2, HX - 2], [-HY + 2, HY - 2], [0, ZP], "mid"))}</g>`);
    // the body, the roof with its overhang and rain lip
    out.push(`<g data-name="cabinet">${ISO.tinted(STEEL, ISO.wbox(P, [-HX, HX], [-HY, HY], [ZP, ZT - 6], "mid"))}` +
      ISO.tinted(STEEL, S(K.slabOf({ x: -HX - 3, y: -HY - 3, w: 2 * HX + 6, d: 2 * HY + 6, r: 1 }, ZT - 6, 6, P, 3, 1), { tone: "mid" })) +
      ISO.tinted(STEEL, ISO.wbox(P, [-HX - 3, HX + 3], [HY + 2.2, HY + 3], [ZT - 8, ZT - 6], "mid")) + `</g>`);
    // the doors: seams, hinges on the −x edge, a swing handle with its lock on the +x edge
    const doors = kind === "power" ? [[ZP + 58, ZT - 10], [ZP + 4, ZP + 54]] : [[ZP + 4, ZT - 10]];
    let door = "";
    for (const [z0, z1] of doors) {
      door += rect(F, -HX + 4, z0, HX - 4, z1, "none", "#4f565f", 0.9) + rect(F, -HX + 5.5, z0 + 1.5, HX - 5.5, z1 - 1.5, "none", "#a8aeb5", 0.5);
      const hz = z1 - z0 > 80 ? [z0 + 12, (z0 + z1) / 2, z1 - 12] : [z0 + 10, z1 - 10];
      door += ISO.tinted(PLINTH, hz.map((z) => ISO.wbox(P, [-HX + 2.4, -HX + 4], [HY, HY + 1.4], [z - 4, z + 4], "mid")).join(""));
      const hm = z1 - z0 > 80 ? z0 + 0.55 * (z1 - z0) : (z0 + z1) / 2;
      door += ISO.tinted(PLINTH, ISO.wbox(P, [HX - 12, HX - 8], [HY, HY + 0.8], [hm - 9, hm + 9], "mid") + ISO.wbox(P, [HX - 11.4, HX - 8.6], [HY + 0.8, HY + 2.2], [hm - 7, hm + 3], "hi"));
      const lk = K.iso([HX - 10, HY + 0.82, hm + 6], P);
      door += `<circle cx="${lk[0].toFixed(1)}" cy="${lk[1].toFixed(1)}" r="${Math.max(0.6, K.cameraOf(P).k * 1).toFixed(1)}" fill="#c9a85a" stroke="#6b5114" stroke-width="0.4"/>`;
    }
    // radio: the heat-exchanger grille on the door; power: the battery door's vents and its warning sign
    const slots = (f, a0, a1, b0, b1, n) => { let s = ""; for (let i = 0; i < n; i++) { const b = b0 + ((b1 - b0) * (i + 0.5)) / n; s += rect(f, a0, b - 0.6, a1, b + 0.6, "#5b626b", "#3f454c", 0.4); } return s; };
    let vents = "";
    if (kind === "power") {
      vents += slots(F, -HX + 12, HX - 20, ZP + 10, ZP + 30, 6);
      const c = [0, ZP + 42], tri = [F(c[0] - 6, c[1] - 4.5), F(c[0] + 6, c[1] - 4.5), F(c[0], c[1] + 6)];
      door += `<path d="${K.pathOf(tri, true)}" fill="#f2c230" stroke="#2a2a2a" stroke-width="0.6"/><path d="${K.pathOf([F(0.8, c[1] + 3), F(-1.4, c[1] - 0.2), F(1.2, c[1] - 0.2), F(-0.8, c[1] - 3.4)])}" fill="none" stroke="#2a2a2a" stroke-width="0.8" data-free=""/>`;
      door += rect(F, -HX + 12, ZT - 28, -HX + 32, ZT - 20, "#eef0f2", "#55534c", 0.5) + `<path d="${[ZT - 26, ZT - 24, ZT - 22].map((z, i) => K.pathOf([F(-HX + 14, z), F(-HX + 30 - i * 4, z)])).join("")}" stroke="#8a877f" stroke-width="0.4" data-free=""/>`;
    } else {
      door += rect(F, -HX + 12, ZP + 70, HX - 20, ZT - 22, "#c9ced3", "#59606a", 0.6) + slots(F, -HX + 14, HX - 22, ZP + 72, ZT - 24, 14);
      door += rect(F, -HX + 12, ZP + 14, -HX + 32, ZP + 22, "#eef0f2", "#55534c", 0.5) + `<path d="${[ZP + 16, ZP + 18, ZP + 20].map((z, i) => K.pathOf([F(-HX + 14, z), F(-HX + 30 - i * 4, z)])).join("")}" stroke="#8a877f" stroke-width="0.4" data-free=""/>`;
    }
    out.push(`<g data-name="door">${door}</g>`);
    // the side: louvres high up, and (radio) the cable entry plate with three glands low down
    vents += slots(Sx, -HY + 12, HY - 12, ZT - 50, ZT - 18, 8);
    if (kind === "radio") {
      vents += rect(Sx, -HY + 14, ZP + 8, HY - 14, ZP + 26, "#c2c7cc", "#3f454c", 0.7);
      for (const y of [-12, 0, 12]) vents += ISO.tinted(ISO.T.rubber, S(window.G.disc(0, 2, 2.6, window.G.frameAlong([HX, y, ZP + 17], [1, 0, 0]), P), { tone: "mid" }));
    } else vents += slots(Sx, -HY + 12, HY - 12, ZP + 8, ZP + 30, 6);
    out.push(`<g data-name="vents">${vents}</g>`);
    if (lab) out.push(ISO.word(K.iso([HX, 0, ZT + 4], P), kind === "power" ? "power cabinet (batteries)" : "radio cabinet", "#1f4f8f", { size: 13, anchor: "start" }).replace('x="', 'dx="6" x="'));
    return out.join("");
  }

  ISO.add({
    name: "telecomcab", title: "Outdoor telecom cabinet (part)", compare: null,
    about: "A grey steel outdoor telecom cabinet 80 × 70 × 160 cm on a plinth, door seams, hinges, a lockable handle and vents; radio/baseband, or power with battery backup. anchors: top gland",
    line: "telecomcab cx cy k kind=radio|power lab=0 lit=cabinet|door|vents|plinth",
    demo: { line: "telecomcab 480 450 2.2 kind=radio", script: [{ set: {}, hold: 1 }, { set: { lit: "door" }, hold: 1.2 }, { set: { lit: "vents" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", kind = o.kind === "power" ? "power" : "radio";
      g.innerHTML = cabSvg(P, kind, lab);
      g.anchors = { top: [0, 0, ZT], gland: [HX, 0, ZP + 17] };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) B31.light(w, g, p.lit); };
      g.update = () => false;
      g.readout = () => kind === "power" ? "power cabinet · rectifiers turn the mains into the radios' 48 V, batteries below keep the site on air for a few hours if the mains fails" : "radio cabinet · the baseband units that handle the calls, cooled through the door's heat exchanger · the cables enter low on the side";
      B31.light(w, g, o.lit || "");
      return g;
    },
  });
})();
