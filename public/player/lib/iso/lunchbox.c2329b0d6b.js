// "lunchbox cx cy width open=0..1 lab=1 lit=tub|lid|clips|sandwich|apple|carrots" — a bento lunchbox on a table.
// A 20 × 14 × 6.4 cm green plastic tub (1.4 L) with a white tray inside cut into three compartments by two dividers:
// a cheese sandwich cut corner to corner (bread, lettuce, cheese, bread) on the left, an apple at the back right and
// carrot sticks in front of it. The lid is hinged at the back on three knuckles and held shut by two clips that hook
// under ridges on the tub's front wall. set({ open: 1 }) flips the clips up, then swings the lid back to 105°;
// open: 0 closes it and snaps the clips down. World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const X = 100, Y = 70, H = 54, WALL = 4, FLOOR = 4, OPEN = (105 * Math.PI) / 180, LT = 7;
  const OUT = { x: -X, y: -Y, w: 2 * X, d: 2 * Y, r: 18 }, IN = K.insetPlan(OUT, WALL);
  const TOP = { x: -138, y: -100, w: 276, d: 196, r: 10 };
  const GREEN = ISO.tint("#bfe3a8", ["#4f9a33", "#5ea842", "#6fb654", "#82c268"], "#24561c");
  const WHITE = ISO.tint("#fbfcfd", ["#c9d0d6", "#d5dbe0", "#e0e5e9", "#eaeef1"], "#5b6670");
  const RED = ISO.tint("#f7b2a6", ["#b8301f", "#c8402d", "#d6533f", "#e26a55"], "#6e140a");
  const ORANGE = ISO.tint("#ffd2a0", ["#d9771a", "#e3872a", "#eb983d", "#f2aa55"], "#8a4508");
  const CLIPS = [-52, 52], DIV = 8, KR = 3.2;              // KR: hinge knuckle radius; the hinge axis is KR behind the back wall
  const Fz = (z) => G.frameOf([0, 0, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);    // outline in (x, y), extruded up

  // The tub: outer shell, the white tray's opening, its floor and dividers, the food (clipped to the opening).
  function tubSvg(P, id) {
    const out = [`<path class="iso-halo" d="${K.haloOf(OUT, 0, H, P)}"/>`];
    // (audit: the shell is drawn as one solid with the tray's opening painted on its top, so the dividers and the
    // food inside read as "sunk" into it; they sit on the tray floor)
    out.push(ISO.tinted(GREEN, S(K.slabOf(OUT, 0, H, P, 8, 1.4), { tone: "mid", inner: L(K.sideSeam(OUT, H - 9, P, 8), { tone: "lo" }) })));
    // the lip ridges the clips hook under, and the hinge knuckles at the back
    for (const x of CLIPS) out.push(ISO.tinted(GREEN, ISO.wbox(P, [x - 13, x + 13], [Y, Y + 2.4], [H - 15, H - 11], "mid")));
    const open = K.planOutline(IN, H, P);
    out.push(`<clipPath id="${id}"><path d="${open}"/></clipPath><path d="${open}" fill="#dfe4e8" stroke="#5b6670" stroke-width=".8"/>`);
    out.push(`<g clip-path="url(#${id})">`);
    out.push(`<path d="${K.planOutline(IN, FLOOR, P)}" fill="#f3f5f7" stroke="#8a949d" stroke-width=".6"/>`);
    out.push(`<g data-name="sandwich">${sandwichSvg(P)}</g>`);
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [DIV - 2, DIV + 2], [IN.y, IN.y + IN.d], [FLOOR, H - 6], "mid")));
    out.push(`<g data-name="apple">${appleSvg(P)}</g>`);
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [DIV + 2, IN.x + IN.w], [-2, 2], [FLOOR, H - 6], "mid")));
    out.push(`<g data-name="carrots">${carrotSvg(P)}</g>`);
    out.push("</g>");
    // the tray's top edge inside the shell
    out.push(L(K.planOutline(K.insetPlan(IN, -1.5), H, P), { tone: "faint" }));
    return out.join("");
  }
  // Two triangle halves of a square sandwich, each: bread, lettuce (frilled), cheese (overhanging), bread.
  function sandwichSvg(P) {
    const out = [], halves = [[[-92, -62], [2, -62], [-92, 32]], [[2, 62], [-92, 62], [2, -32]]];
    const grow = (tri, d) => { const c = tri.reduce((s, p) => [s[0] + p[0] / 3, s[1] + p[1] / 3], [0, 0]); return tri.map(([x, y]) => [x + (x - c[0]) * d, y + (y - c[1]) * d]); };
    const round = (tri, r = 6) => {                                       // soft corners, as bread has
      const pts = [];
      tri.forEach((p, i) => { const a = tri[(i + 2) % 3], b = tri[(i + 1) % 3]; const ua = G.unit3([a[0] - p[0], a[1] - p[1], 0]), ub = G.unit3([b[0] - p[0], b[1] - p[1], 0]); for (let k = 0; k <= 3; k++) { const t = k / 3; pts.push([p[0] + (ua[0] * (1 - t) + ub[0] * t) * r * (1 - Math.sin(t * Math.PI) * 0.45), p[1] + (ua[1] * (1 - t) + ub[1] * t) * r * (1 - Math.sin(t * Math.PI) * 0.45)]); } });
      return pts;
    };
    const frill = (tri) => { const pts = [], n = 10; tri.forEach((p, i) => { const q = tri[(i + 1) % 3]; for (let k = 0; k < n; k++) { const t = k / n, e = k % 2 ? 2.2 : 0; const c = tri.reduce((s, v) => [s[0] + v[0] / 3, s[1] + v[1] / 3], [0, 0]); const x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t, l = Math.hypot(x - c[0], y - c[1]); pts.push([x + ((x - c[0]) / l) * e, y + ((y - c[1]) / l) * e]); } }); return pts; };
    for (const tri of halves) {
      const t = grow(tri, -0.04);
      out.push(DAILY.prism(P, Fz(FLOOR), round(t), 0, 12, ["#b07a3a", "#e3b06e"], "#f6e6c4", "#7a5222"));
      out.push(DAILY.prism(P, Fz(FLOOR + 12), frill(grow(t, 0.02)), 0, 1.6, ["#4f9a33", "#8fd16c"], "#9fd97c", "#2c6a22"));
      out.push(DAILY.prism(P, Fz(FLOOR + 13.6), grow(t, 0.035), 0, 3, ["#d9a520", "#ffe066"], "#ffe27a", "#8a6a10"));
      out.push(DAILY.prism(P, Fz(FLOOR + 16.6), round(t), 0, 12, ["#b07a3a", "#e3b06e"], "#f6e6c4", "#7a5222",
        // the crumb's open pores on the cut face: a few closed specks
        `<path d="${[[0.3, 0.3], [0.5, 0.25], [0.25, 0.5], [0.42, 0.42]].map(([a, b]) => { const p = [t[0][0] + (t[1][0] - t[0][0]) * a + (t[2][0] - t[0][0]) * b, t[0][1] + (t[1][1] - t[0][1]) * a + (t[2][1] - t[0][1]) * b]; return K.pathOf([[0, 0], [2, 0.6], [1.2, 2]].map(([dx, dy]) => K.iso([p[0] + dx, p[1] + dy, FLOOR + 28.62], P)), true); }).join("")}" fill="#e2c99a"/>`));
    }
    return out.join("");
  }
  // The apple: a red sphere with the dimple ring at its top, a stem and one leaf.
  const AP = [52, -33, FLOOR + 25], AR = 25;
  function appleSvg(P) {
    const top = [AP[0], AP[1], AP[2] + AR];
    return ISO.tinted(RED, S(G.sphereOf(AP, AR, P, { steps: 48 }), { tone: "hi", inner: `<path d="${K.ring(AP[0] + 1, AP[1] + 1, 5, AP[2] + AR - 0.6, P, 20)}" fill="#c8402d" stroke="#6e140a" stroke-width=".5"/>` })) +
      `<path d="${K.pathOf([[0, 0, -1.4], [1.2, 0.4, 3], [3, 1, 7]].map(([a, b, c]) => K.iso([top[0] + 1 + a, top[1] + 1 + b, top[2] + c], P)))}" fill="none" stroke="#5a3a1a" stroke-width="${(1.8 * K.cameraOf(P).k).toFixed(2)}" stroke-linecap="round"/>` +
      ISO.tinted(ISO.T.green, ISO.poly([[4, 2, 4], [10, -1, 5.4], [16, -4, 6], [10, -5, 5.8], [4, 2, 4.6], [10, -1, 6], [16, -4, 6.4], [10, -5, 6.3]].map(([a, b, c]) => [top[0] + a, top[1] + b, top[2] + c]), [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"));
  }
  // Carrot sticks: tapered square sticks in two layers, far ones first.
  function carrotSvg(P) {
    const out = [], stick = (x0, y, z, len, flip) => {
      const a = 4.6, b = 3.4, x1 = x0 + len, e0 = flip ? b : a, e1 = flip ? a : b;
      const V = [[x0, y - e0, z], [x1, y - e1, z], [x1, y + e1, z], [x0, y + e0, z], [x0, y - e0, z + 2 * e0], [x1, y - e1, z + 2 * e1], [x1, y + e1, z + 2 * e1], [x0, y + e0, z + 2 * e0]];
      return ISO.tinted(ORANGE, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"));
    };
    [[16, 9], [20, 20], [15, 31], [19, 42], [17, 53]].forEach(([x, y], i) => out.push(stick(x, y, FLOOR, 68, i % 2)));
    [[22, 15], [18, 36], [24, 47]].forEach(([x, y], i) => out.push(stick(x, y, FLOOR + 9, 64, !(i % 2))));
    return out.join("");
  }
  // The back hinge's three knuckles on the tub (the lid's own knuckles sit between them).
  function hingeSvg(P) {
    const F = DAILY.xAx([0, -Y - KR, H]);
    return ISO.tinted(GREEN, ISO.wbox(P, [-79, 79], [-Y - KR, -Y], [H - 10, H - KR], "mid") + [-70, 0, 70].map((x) => S(G.disc(x - 9, x + 9, KR, F, P, { steps: 16 }), { tone: "mid" })).join(""));
  }
  // The lid turned a about the hinge line, with its clips turned c about their own hinges on its front edge.
  function lidSvg(P, a, c) {
    const ya = [0, Math.cos(a), Math.sin(a)], za = [0, -Math.sin(a), Math.cos(a)];
    const F = G.frameOf([0, -Y - KR, H], ya, [1, 0, 0], za), E = KR, out = [];
    // the lid's two knuckles on the same axis as the tub's three, between them
    for (const x of [-35, 35]) out.push(ISO.tinted(GREEN, S(G.disc(x - 26, x + 26, KR, G.frameOf(F.o, [1, 0, 0], ya, za), P, { steps: 16 }), { tone: "mid" })));
    out.push(DAILY.prism(P, F, DAILY.rrect(-X, E, X, E + 2 * Y, 18, 5), 0, LT, ["#4f9a33", "#9ad37e"], "#8cc96e", "#24561c"));
    out.push(DAILY.prism(P, F, DAILY.rrect(-X + 14, E + 14, X - 14, E + 2 * Y - 14, 11, 4), LT, LT + 2, ["#5ea842", "#a6db8a"], "#9ad37e", "#24561c"));
    for (const x of CLIPS) {
      // the bracket on the lid's edge, and the clip: a plate hanging from it, flipped out by c (0 down … 1 up)
      out.push(DAILY.box(P, F, [x - 15, x + 15], [E + 2 * Y, E + 2 * Y + 3], [1.5, LT - 1], "mid"));
      const h = DAILY.at(F, x, E + 2 * Y + 3, LT / 2), ang = c * 1.75, dA = G.add3(G.mul3(za, -Math.cos(ang)), G.mul3(ya, Math.sin(ang))), dN = G.add3(G.mul3(ya, Math.cos(ang)), G.mul3(za, Math.sin(ang)));
      const at = (u, al, th) => G.add3(G.add3(G.add3(h, [u, 0, 0]), G.mul3(dA, al)), G.mul3(dN, th));
      out.push(ISO.tinted(GREEN, ISO.poly([[-13, -3, 0], [13, -3, 0], [13, 21, 0], [-13, 21, 0], [-13, -3, 2.6], [13, -3, 2.6], [13, 21, 2.6], [-13, 21, 2.6]].map(([u, al, th]) => at(u, al, th)), ISO.BOX_F, P, "hi")));
      out.push(ISO.tinted(GREEN, ISO.poly([[-13, 17, -2.4], [13, 17, -2.4], [13, 21, -2.4], [-13, 21, -2.4], [-13, 17, 0], [13, 17, 0], [13, 21, 0], [-13, 21, 0]].map(([u, al, th]) => at(u, al, th)), ISO.BOX_F, P, "mid")));
      out.push(K.dotsSvg([K.iso(at(-9, -1, 2.7), P), K.iso(at(9, -1, 2.7), P)], { size: 0.5 }));
    }
    return out.join("");
  }

  let clipN = 0;
  ISO.add({
    name: "lunchbox", title: "Lunchbox", compare: "lunchbox 480 270 360",
    about: "A bento lunchbox: the clips flip up and the lid swings back on its hinge, showing three compartments with a cheese sandwich, an apple and carrot sticks.",
    line: "lunchbox cx cy width open=0..1 lab=1 lit=tub|lid|clips|sandwich|apple|carrots",
    demo: { line: "lunchbox 480 280 360 open=0", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { lit: "sandwich" }, hold: 1.5 }, { set: { lit: "" }, hold: 0.5 }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.0, Hh = size * 1.4;
      const { P, g } = ISO.frame([...K.boxCorners(TOP, -10, 0), [-X, -Y - 40, H + 2 * Y], [X, -Y - 40, H + 2 * Y]], cx, cy, W, Hh, { azimuth: 62, elevation: 44 }, parent);
      g.innerHTML = DAILY.table(P, TOP) + `<g data-k="lidback"></g><g data-name="tub">${hingeSvg(P)}${tubSvg(P, `lb-open-${++clipN}`)}</g><g data-k="lidfront"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["lidback", "lidfront", "words", "tub", "sandwich", "apple", "carrots"].map((n) => [n, q(n)])), w = ISO.writer();
      const memo = DAILY.memo();
      const op = ISO.clamp(ISO.num(o, "open", 1), 0, 1) > 0.5;
      const s = { clip: op ? 1 : 0, lid: op ? 1 : 0 }, goal = { open: op ? 1 : 0 };
      let lit = o.lit || "";
      const draw = () => {
        const a = s.lid * OPEN, back = a > 1.25, key = `${(Math.round(s.lid * 60) / 60).toFixed(3)} ${(Math.round(s.clip * 40) / 40).toFixed(3)}`;
        const lid = () => memo(key, () => lidSvg(P, (+key.split(" ")[0]) * OPEN, +key.split(" ")[1]));
        w.rebuild(el.lidback, back ? key : "", () => (back ? lid() : ""));
        w.rebuild(el.lidfront, back ? "" : key, () => (back ? "" : lid()));
        const shown = a > 0.5;
        w.rebuild(el.words, lab ? `${shown} ${s.clip > 0.5}` : "", () => !lab ? "" : [
          shown ? ISO.word(K.iso([-46, 0, FLOOR + 30], P), "cheese sandwich", "#7a5222", { size: 15, dy: -6 }) : "",
          shown ? ISO.word(K.iso([AP[0], AP[1], AP[2] + AR + 8], P), "apple", "#8f2a22", { size: 15, dy: -8 }) : "",
          shown ? ISO.word(K.iso([X, 34, H], P), "carrot sticks", "#8a4508", { anchor: "start", size: 15, dy: 4 }) : "",
          shown ? ISO.word(K.iso([0, -Y - 20, H + 2 * Y], P), "lid", "#24561c", { size: 15, dy: -6 }) : ISO.word(K.iso([0, 0, H + LT + 2], P), "lid", "#24561c", { size: 15, dy: -4 }),
          ISO.word(K.iso([CLIPS[1] + 14, Y + 3, H - 12], P), "clip", "#444", { anchor: "start", size: 13, dy: 8 }),
        ].join(""));
        const want = lit || (s.clip > 0.02 && s.clip < 0.98 ? "clips" : s.lid > 0.02 && s.lid < 0.98 ? "lid" : "");
        const groups = { lid: [el.lidback, el.lidfront], clips: [el.lidback, el.lidfront], tub: [el.tub], sandwich: [el.sandwich], apple: [el.apple], carrots: [el.carrots] };
        w.light([el.lidback, el.lidfront, el.tub, el.sandwich, el.apple, el.carrots], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.open !== undefined) goal.open = +p.open > 0.5 ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, rate) => (calm ? to : Math.abs(to - v) <= rate * dt ? to : v + Math.sign(to - v) * rate * dt);
        // opening: clips first, then the lid; closing: the lid first, then the clips snap down
        if (goal.open) { s.clip = step(s.clip, 1, 2.6); if (s.clip >= 1) s.lid = step(s.lid, 1, 0.8); }
        else { s.lid = step(s.lid, 0, 1); if (s.lid <= 0) s.clip = step(s.clip, 0, 3.2); }
        draw();
        return goal.open ? s.lid < 1 || s.clip < 1 : s.lid > 0 || s.clip > 0;
      };
      g.readout = () => {
        if (s.lid <= 0 && s.clip <= 0) return "20 × 14 × 6.4 cm lunchbox, 1.4 L · clipped shut, so it stays closed in a school bag";
        if (s.lid <= 0) return "clips flipped up off the ridges · the lid is free";
        return `lid open ${Math.round(s.lid * 105)}°${s.lid >= 1 ? " · sandwich about 300 kcal, apple about 95 kcal, carrot sticks about 25 kcal" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
