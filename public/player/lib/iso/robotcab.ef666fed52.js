// "robotcab cx cy k on=0|1 warn=0|1 len=20..300 lab=0 lit=cabinet|door|lamps|cable" — a PART (PARTS.md, batch 6): a
// robot's control cabinet, a painted steel box 28 wide × 40 deep × 70 cm tall on a plinth, standing on the floor,
// origin the floor point under its middle. Its door is on the +x face (the camera's side): a shut line round it,
// hinges on the far edge, a swing handle with a key lock, a vent grille low down, a rating plate, and up top a green
// lamp (on=1: the robot is powered) and an amber one (warn=1: it is moving / a fault). Out of the plinth's +x foot
// its heavy cable runs over the floor len cm along +x to the robot (anchor cable: the cable's end on the floor).
// Built from the robot scene's cabinet. set({ on, warn }). anchors: cable top
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 14, HY = 20, H = 70, PZ = 6, CR = 1.2, DX = HX + 0.02;
  const GREY = ISO.tint("#e4e7ea", ["#a5abb2", "#b5bac0", "#c4c9ce", "#d3d7db"], "#3e4650");
  const lampTint = (on, c) => on ? ISO.tint(c[0], [c[1], c[1], c[0], c[0]], c[2]) : ISO.tint("#8d9096", ["#5a5e64", "#62666c", "#6a6e74", "#72767c"], "#2a2d31");
  const G_ON = ["#7be08a", "#2f9a40", "#1a4a20"], A_ON = ["#ffd27a", "#d98a10", "#6a4008"];
  ISO.add({
    name: "robotcab", title: "Robot control cabinet (part)", compare: null,
    about: "A robot's control cabinet 28 × 40 × 70 cm: steel box with a door, handle, vent and rating plate, a green lamp (on=1) and an amber lamp (warn=1), its cable laid len cm over the floor. anchors: cable top",
    line: "robotcab cx cy k on=0|1 warn=0|1 len=20..300 lab=0 lit=cabinet|door|lamps|cable",
    demo: { line: "robotcab 440 420 4.6 len=40 lab=1", script: [{ set: {}, hold: 1 }, { set: { on: 1, lit: "lamps" }, hold: 1.4 }, { set: { warn: 1 }, hold: 1.4 }, { set: { warn: 0, lit: "door" }, hold: 1 }, { set: { on: 0, lit: "" }, hold: 0.8 }] },
    make([cx = 440, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const LEN = B36.num(o, "len", 60, 20, 300), at = (y, z) => K.iso([DX, y, z], P);
      const st = { on: o.on === "1", warn: o.warn === "1", lit: o.lit || "" };
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 2 }, 0, H, P)}"/>`];
      // the cable first (it lies on the floor in front of the plinth's foot): out of a gland, a curve, then straight
      const cz = CR, pts = [[HX - 2, 6, 3.4], [HX + 3, 6, cz + 0.3], [HX + 10, 9, cz], [HX + 10 + Math.max(4, LEN - 10), 12, cz]];
      const cd = K.pathOf(pts.map((p) => K.iso(p, P))), kk = K.cameraOf(P).k;
      out.push(`<g data-name="cable"><path d="${cd}" fill="none" stroke="#14161a" stroke-width="${(2 * CR * kk + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${cd}" fill="none" stroke="#3a3e44" stroke-width="${(2 * CR * kk - 0.6).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
      out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(pts.at(-1)[0], pts.at(-1)[1], CR + 0.4, 0, 2 * CR + 0.4, P, 14), { tone: "mid" })), "</g>");
      // plinth, body, roof with a drip edge
      out.push(`<g data-name="cabinet">${ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-HX + 1, HX - 1], [-HY + 1, HY - 1], [0, PZ], "lo"))}`);
      out.push(ISO.tinted(GREY, ISO.wbox(P, [-HX, HX], [-HY, HY], [PZ, H - 1.5], "mid")));
      out.push(ISO.tinted(GREY, S(K.slabOf({ x: -HX - 0.8, y: -HY - 0.8, w: 2 * HX + 1.6, d: 2 * HY + 1.6, r: 0.4 }, H - 1.5, 1.5, P, 2, 0.3), { tone: "hi" })));
      // the cable gland in the plinth's +x face
      out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.9, 1.9, G.frameAlong([HX - 1, 6, 3.4], [1, 0, 0]), P, { steps: 16 }), { tone: "mid" })), "</g>");
      // the door on the +x face: shut line, hinges, vent grille, rating plate, handle and lock
      const door = [];
      door.push(`<path d="${K.pathOf([at(-HY + 2, PZ + 2), at(HY - 2, PZ + 2), at(HY - 2, H - 4), at(-HY + 2, H - 4)], true)}" fill="none" stroke="#3e4650" stroke-width=".9"/>`);
      for (const z of [PZ + 8, H - 12]) door.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [HX, HX + 0.6], [-HY + 0.6, -HY + 2.4], [z, z + 5], "mid")));
      const vents = []; for (let i = 0; i < 6; i++) { const z = PZ + 6 + i * 1.6; vents.push(K.pathOf([at(-6, z), at(8, z), at(8, z + 0.7), at(-6, z + 0.7)], true)); }
      door.push(`<path d="${vents.join("")}" fill="#4a525c" stroke="#2a3038" stroke-width=".4"/>`);
      door.push(`<path d="${K.pathOf([at(-12, H - 20), at(-3, H - 20), at(-3, H - 14.5), at(-12, H - 14.5)], true)}" fill="#f4f5f6" stroke="#5a6068" stroke-width=".5"/><path data-free d="${[H - 16, H - 17.5, H - 19].map((z, i) => K.pathOf([at(-11, z), at(-4.5 - i * 1.5, z)])).join("")}" stroke="#8a9098" stroke-width=".5"/>`);
      door.push(D([at(-11.3, H - 15.2), at(-3.7, H - 19.3)], { size: 0.35 }));
      door.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [HX, HX + 0.8], [HY - 5, HY - 3], [32, 44], "mid") + ISO.wbox(P, [HX + 0.8, HX + 1.8], [HY - 4.7, HY - 3.3], [34, 42], "hi")));
      door.push(`<path d="${G.circleOf(G.frameAlong([HX, HY - 4, 29], [1, 0, 0]), 0.05, 0.9, P, 14)}" fill="#c9ccd1" stroke="#3c3f45" stroke-width=".5"/>`);
      out.push(`<g data-name="door">${door.join("")}</g><g data-part="lamps" data-name="lamps"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      g.anchors = { cable: [pts.at(-1)[0], pts.at(-1)[1], 0], top: [0, 0, H] };
      const el = B36.parts(g), w = ISO.writer();
      const lampSvg = (y, on, c) => {
        const F = G.frameAlong([HX, y, H - 8], [1, 0, 0]);
        const glow = on ? (() => { const p = K.iso([HX + 1.4, y, H - 8], P); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(3.2 * kk).toFixed(1)}" fill="${c[0]}" opacity=".35"/>`; })() : "";
        return ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.6, 2, F, P, { steps: 18 }), { tone: "mid" })) + ISO.tinted(lampTint(on, c), S(G.disc(0.6, 1.4, 1.5, F, P, { steps: 18 }), { tone: "hi" })) + glow;
      };
      const draw = () => {
        w.rebuild(el.lamps, `${st.on} ${st.warn}`, () => lampSvg(-8, st.on, G_ON) + lampSvg(-2, st.warn, A_ON));
        w.rebuild(el.words, lab ? `${st.on} ${st.warn}` : "", () => !lab ? "" : B36.word(P, [HX, -HY, H], "control cabinet", { anchor: "end", dx: -8 }) +
          B36.word(P, [HX + 2, -HY, H - 8], st.warn ? "amber: robot moving" : st.on ? "green: power on" : "lamps off", { color: st.warn ? "#8a5a10" : st.on ? "#2c6a22" : "#444" }) + B36.word(P, pts.at(-1), "cable to the robot", { dy: 16, anchor: "end", dx: 0 }));
        B36.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) st.on = String(p.on) === "1";
        if (p.warn !== undefined) st.warn = String(p.warn) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => `robot control cabinet · ${st.on ? "power on" : "power off"}${st.warn ? " · amber: the robot is moving, keep out of the cell" : ""} · servo drives and the robot's computer inside`;
      draw();
      return g;
    },
  });
})();
