// "lightswitch cx cy height k=up|down lab=1 lit=toggle|plate|lamp" — a wall light switch and the lamp it works.
// A single-pole toggle switch on a wall: cover plate with two screws, the toggle lever in its slot, ON or OFF written
// below it. Above, a wall lamp: a base plate, an arm and a 60 W bulb. Flipping the toggle up snaps the switch's
// contacts together (a spring takes it over centre, so it never rests half way), closing the hot wire to the lamp:
// 120 V drives 0.5 A through the bulb and it lights. Down opens the circuit. set({ k }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CZ = 30, PW = 7, PH = 11.4, LX = 14, LZ = CZ + 4, ANG = (24 * Math.PI) / 180;
  const IVORY = ISO.tint("#f7f4ec", ["#cbc6b8", "#d6d2c5", "#e1ddd1", "#ebe8de"], "#6f6a5c"), WALL = ISO.tint("#f1efe9", ["#c9c6be", "#d3d0c8", "#dddad2", "#e7e4dc"], "#7a776f");
  const BRASS = ISO.T.brass, WOOD = ISO.T.wood;
  let uid = 0;

  function wallSvg(P) {
    return ISO.tinted(WOOD, ISO.wbox(P, [-9, -5.2], [-10.2, -1.3], [CZ - 9, CZ + 11], "hi")) + ISO.tinted(WALL, ISO.wbox(P, [-9, 21], [-1.3, 0], [CZ - 9, CZ + 11], "hi")) +
      D([CZ - 6, CZ + 8].map((z) => K.iso([-7.1, 0.01, z], P)), { size: 0.5, tone: "mid" });
  }
  function plateSvg(P) {
    const out = [ISO.tinted(IVORY, ISO.wbox(P, [-PW / 2, PW / 2], [0, 0.3], [CZ - PH / 2, CZ + PH / 2], "hi"))];
    out.push(`<path d="${K.pathOf([[-0.55, CZ - 1.2], [0.55, CZ - 1.2], [0.55, CZ + 1.2], [-0.55, CZ + 1.2]].map(([x, z]) => K.iso([x, 0.31, z], P)), true)}" fill="#2b2a26"/>`);
    for (const z of [CZ - 3.8, CZ + 3.8]) out.push(L(K.sideRing([0, 0.31, z], 0.42, "y", P, 16), { tone: "lo" }), `<path d="${K.pathOf([K.iso([-0.3, 0.32, z], P), K.iso([0.3, 0.32, z], P)])}" stroke="#6f6a5c" stroke-width="0.5"/>`);
    return out.join("");
  }
  // The toggle: a tapered lever out of the slot, turned by a about the pivot behind the plate (+ = up).
  function toggleSvg(P, a) {
    const c = Math.cos(a), s = Math.sin(a), at = (u, w, x) => [x, 0.2 + u * c - w * s, CZ + u * s + w * c];
    const V = [[0, -0.45, -0.5], [0, 0.45, -0.5], [0, 0.45, 0.5], [0, -0.45, 0.5], [2.3, -0.3, -0.36], [2.3, 0.3, -0.36], [2.3, 0.3, 0.36], [2.3, -0.3, 0.36]].map(([u, w, x]) => at(u, w, x));
    return ISO.tinted(IVORY, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "hi"));
  }
  function lampSvg(P, on, id) {
    const out = [ISO.tinted(BRASS, S(G.disc(0, 0.6, 3, G.frameOf([LX, 0, LZ], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" }))];
    out.push(ISO.tinted(BRASS, S(G.disc(0.6, 5, 0.5, G.frameOf([LX, 0, LZ], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 14 }), { tone: "hi" }) + S(G.disc(0, 1.6, 1.3, G.frameOf([LX, 5, LZ - 1.2], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 20 }), { tone: "hi" })));
    const c = [LX, 5, LZ + 2.9];
    if (on > 0.01) { const q = K.iso(c, P); out.push(`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(14 + 10 * on).toFixed(1)}" fill="url(#${id}g)" opacity="${on.toFixed(2)}"/>`); }
    out.push(ISO.tinted(on > 0.5 ? ISO.T.amber : ISO.T.glass, S(G.sphereOf(c, 2.6, P), { tone: "hi" })));
    out.push(`<path d="${K.pathOf([[-0.7, LZ + 1.2], [-0.7, LZ + 2.8], [-0.35, LZ + 3.4], [0, LZ + 2.8], [0.35, LZ + 3.4], [0.7, LZ + 2.8], [0.7, LZ + 1.2]].map(([x, z]) => K.iso([LX + x, 5.3, z], P)))}" fill="none" stroke="${on > 0.4 ? "#c45a00" : "#6d6f74"}" stroke-width="${on > 0.4 ? 1 : 0.6}"/>`);
    return out.join("");
  }

  ISO.add({
    name: "lightswitch", title: "Light switch", compare: "lightswitch 480 270 260",
    about: "A toggle light switch and the wall lamp it works: up snaps the contacts closed and the bulb lights, down opens the circuit.",
    line: "lightswitch cx cy height k=up|down lab=1 lit=toggle|plate|lamp",
    demo: { line: "lightswitch 480 270 260 k=down", script: [{ set: {}, hold: 1 }, { set: { k: "up" }, hold: 2.2 }, { set: { k: "down" }, hold: 2.2 }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.6, H = size * 1.75, id = `ls${++uid}`;
      const { P, g } = ISO.frame([[-9, -10, CZ - 9], [21, 0, CZ - 9], [-9, -10, CZ + 11], [21, 0, CZ + 11], [LX, 7, LZ + 7]], cx, cy, W, H, { azimuth: 68, elevation: 12 }, parent);
      g.innerHTML = `<defs><radialGradient id="${id}g"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd84a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient></defs>` +
        `<g>${wallSvg(P)}</g><g data-name="plate">${plateSvg(P)}</g><g data-name="toggle"></g><g data-name="lamp"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { plate: q("plate"), toggle: q("toggle"), lamp: q("lamp"), words: q("words") }, w = ISO.writer();
      const up0 = o.k === "up";
      const s = { a: up0 ? ANG : -ANG, glow: up0 ? 1 : 0 }, goal = { up: up0 };
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.toggle, s.a.toFixed(3), () => toggleSvg(P, s.a));
        w.rebuild(el.lamp, s.glow.toFixed(2), () => lampSvg(P, s.glow, id));
        const on = s.a > 0;
        w.rebuild(el.words, lab ? String(on) : "", () => !lab ? "" : ISO.word(K.iso([0, 0.3, CZ - PH / 2], P), on ? "ON" : "OFF", on ? "#2c6a22" : "#444", { size: 18, dy: 22 }) +
          ISO.word(K.iso([LX, 5, LZ + 6], P), on ? "lamp lit" : "lamp", "#444", { size: 14, dy: -6 }));
        const want = lit || (Math.abs(s.a - (goal.up ? ANG : -ANG)) > 1e-3 ? "toggle" : on ? "lamp" : "");
        w.light([el.plate, el.toggle, el.lamp], [q(want)].filter(Boolean));
      };
      g.set = (p) => { if (p.k) goal.up = p.k === "up"; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), to = goal.up ? ANG : -ANG;
        // over centre the spring snaps it the rest of the way: slow to the middle, fast after
        const rate = Math.sign(to - s.a) === Math.sign(s.a) || s.a === 0 ? 14 : 3;
        s.a = calm || Math.abs(to - s.a) <= rate * dt ? to : s.a + Math.sign(to - s.a) * rate * dt;
        s.glow = ISO.follow(s.glow, s.a > 0 ? 1 : 0, dt, 0.08, calm); if (Math.abs(s.glow - (s.a > 0 ? 1 : 0)) < 0.01) s.glow = s.a > 0 ? 1 : 0;
        draw();
        return s.a !== to || s.glow !== (s.a > 0 ? 1 : 0);
      };
      g.readout = () => (s.a > 0 ? "ON · contacts closed · 120 V across a 60 W bulb: 0.5 A flows and it lights" : "OFF · contacts apart · no current, the lamp is dark");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
