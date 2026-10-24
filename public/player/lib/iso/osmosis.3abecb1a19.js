// "osmosis cx cy size k=start|end lab=1" — osmosis in a U-tube with a partly permeable membrane.
// Pure water on the left, sugar solution on the right, a membrane at the bottom of the U that lets water molecules
// through but not sugar. Water moves into the sugar side (from more water to less), so its level rises and the
// water side falls, until the extra height pushes back as hard as osmosis pulls. set({ k: "start"|"end" }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const ARM_X = 26, R = 9, BASE_Z = 30, TOP = 140, LEVEL0 = 100, RISE = 22;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  // Sugar molecules: fixed spots in the right arm below its level.
  const SUGAR = Array.from({ length: 26 }, (_, i) => [ARM_X - 5 + ((i * 37) % 11), -4 + ((i * 53) % 9), BASE_Z + 8 + ((i * 29) % 80)]);

  function standSvg(P, lab) {
    const out = [ISO.baseboard(P, { x: -60, y: -34, w: 120, d: 68, r: 6 }, { h: 6 }), ISO.plate(P, { x: 14, y: 20, w: 36, d: 10, r: 1 })];
    out.push(S(K.cylinder(-48, -22, 2.4, 0, 150, P, 16), { tone: "mid", crease: "none" }), ISO.wbox(P, [-52, 40], [-24, -20], [118, 124], "mid"));
    for (const x of [-ARM_X, ARM_X]) out.push(ISO.wbox(P, [x - 6, x + 6], [-14, -8], [116, 126], "mid"));
    // A millimetre scale behind the arms.
    const minor = [], major = [];
    for (let z = BASE_Z + 20; z <= TOP - 6; z += 2.5) ((z - BASE_Z - 20) % 25 ? minor : major).push(K.segment([-8, -11.95, z], [-8 + ((z - BASE_Z - 20) % 25 ? 2.5 : 4.5), -11.95, z], P));
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-8, 8], [-16, -12], [BASE_Z + 14, TOP], "mid")), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    return out.join("");
  }
  // Liquid in an arm from the bend up to level z (and the bend itself), as a tinted column seen through the glass.
  const column = (P, x, z, color) => `<path d="${K.pathOf([[x - R + 1.5, 0.1, BASE_Z + 6], [x + R - 1.5, 0.1, BASE_Z + 6], [x + R - 1.5, 0.1, z], [x - R + 1.5, 0.1, z]].map((p) => K.iso(p, P)), true)}" fill="${color}" fill-opacity=".45"/>`;
  function liquidSvg(P, f) {
    const left = LEVEL0 - RISE * f, right = LEVEL0 + RISE * f, out = [];
    out.push(column(P, -ARM_X, left, "#4f93d6"), column(P, ARM_X, right, "#8a6fd6"));
    out.push(`<path d="${K.pathOf(ISO.arc(0, BASE_Z + 6, ARM_X, Math.PI, 2 * Math.PI, 24).map(([x, z]) => K.iso([x, 0.1, z], P)))}" stroke="#6b8fd6" stroke-width="${2 * R - 3}" fill="none" opacity=".45"/>`);
    out.push(D(SUGAR.filter((p) => p[2] < right - 2).map((p) => K.iso([p[0], 0.2, p[2]], P)), { size: 1.1, tone: "hi" }));
    for (const [x, z] of [[-ARM_X, left], [ARM_X, right]]) out.push(`<path d="${K.pathOf([[x - R + 1.5, 0.2, z], [x + R - 1.5, 0.2, z]].map((p) => K.iso(p, P)))}" stroke="#1f4f8f" stroke-width="1.2"/>`);
    return out.join("");
  }
  // The glass U: two straight arms joined by a bend at the bottom, the membrane across the bend's middle.
  function glassSvg(P) {
    const out = [];
    for (const x of [-ARM_X, ARM_X]) out.push(S(G.disc(BASE_Z + 6, TOP, R, zAx([x, 0, 0]), P, { steps: 28 }), { tone: "hi" }));
    out.push(`<path d="${K.pathOf(ISO.arc(0, BASE_Z + 6, ARM_X, Math.PI, 2 * Math.PI, 24).map(([x, z]) => K.iso([x, 0, z], P)))}" stroke="#bcd3e2" stroke-width="${2 * R}" fill="none" opacity=".6"/>`);
    return `<g opacity=".5">${ISO.tinted(ISO.T.glass, out.join(""))}</g>` + `<path d="${K.pathOf([[0, -R, BASE_Z + 6 - ARM_X + 1], [0, R, BASE_Z + 6 - ARM_X + 1]].map((p) => K.iso(p, P)))}${K.pathOf([[0, 0.3, BASE_Z + 6 - ARM_X - R + 2], [0, 0.3, BASE_Z + 6 - ARM_X + R - 2]].map((p) => K.iso(p, P)))}" stroke="#2c6a22" stroke-width="2" stroke-dasharray="1.6 1.4"/>`;
  }

  ISO.add({
    name: "osmosis", title: "Osmosis (U-tube)", compare: "osmosis 480 270 300 k=end",
    about: "Water and sugar solution either side of a partly permeable membrane: water moves into the sugar side and its level rises.",
    line: "osmosis cx cy size k=start|end lab=1",
    demo: { line: "osmosis 480 270 320 k=start", script: [{ set: {}, hold: 1.2 }, { set: { k: "end" }, hold: "settle" }, { set: { k: "start" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 1.35;
      const { P, g } = ISO.frame([[-60, -34, -10], [60, 34, -10], [-50, -24, TOP + 12], [50, 24, TOP + 12], [0, 0, BASE_Z - ARM_X - R]], cx, cy, W, H, { azimuth: 70, elevation: 14 }, parent);
      const s = { f: o.k === "end" ? 1 : 0, fT: 0 }; s.fT = s.f;
      g.innerHTML = `<g>${standSvg(P, lab)}</g><g data-part="liquid"></g><g>${glassSvg(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.liquid, s.f.toFixed(3), () => liquidSvg(P, s.f));
        if (lab) w.rebuild(el.words, s.f.toFixed(1), () => ISO.word(K.iso([-ARM_X - 12, 0, LEVEL0 - RISE * s.f], P), "water", "#1f4f8f", { size: 13, anchor: "end" }) + ISO.word(K.iso([ARM_X + 12, 0, LEVEL0 + RISE * s.f], P), "sugar solution", "#5a3fa0", { size: 13, anchor: "start" }) +
          ISO.word(K.iso([0, 12, BASE_Z - ARM_X - 4], P), "membrane: water passes, sugar can't", "#2c6a22", { size: 13, dy: 18 }));
      };
      g.set = (p) => { if (p.k) s.fT = p.k === "end" ? 1 : 0; };
      g.update = (dt) => { s.f = ISO.follow(s.f, s.fT, dt, 1.2, ISO.still()); draw(); return s.f !== s.fT; };
      g.readout = () => (s.f < 0.05 ? "start: both levels equal · more water molecules on the left than in the sugar solution" : s.f > 0.95 ? `end: the sugar side stands ${2 * RISE} mm higher than the water side · that height pushes back as hard as osmosis pulls` : "water moving through the membrane into the sugar solution…");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
