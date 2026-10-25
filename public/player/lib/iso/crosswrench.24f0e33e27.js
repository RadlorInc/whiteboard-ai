// "crosswrench cx cy k aim=wall turn=0..1 lab=0 lit=wrench" — a PART (PARTS.md): a four-way cross wheel wrench, two
// 35 cm bars of 17 mm steel crossed and welded at the middle, a socket forged on each end (17, 19, 21, 23 mm across
// the flats). Its origin is the bottom of the 19 mm socket's bore, the arm pointing −y (aim=wall, the only aim): placed
// at= a wheel's nut anchor (carwheel's nutN, the nut's outer face) the socket sits over that nut. The arm toward you
// (21 mm) and the two side arms (17, 23 mm) are the handle. set({ turn }) spins it by turn × 360° about the nut's axis,
// anticlockwise as you face the wheel (the way a nut comes loose). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const ARM = 17.5, ROD = 0.85, DEPTH = 1.8, MID = [0, ARM - DEPTH, 0], TAU = Math.PI * 2;
  const MM = { back: 19, front: 21, a: 17, b: 23 }, STEEL = ISO.T.steel, Y = [0, 1, 0];
  // a side arm's direction for screen angle φ (from the right, anticlockwise as you face the wheel)
  const radial = (phi) => [Math.cos(phi), 0, Math.sin(phi)];
  // one arm along frame A from the weld (s = 0) to the socket's mouth (s = ARM): the bar, a tapered neck, the socket
  // with its chamfer and two stamped rings, and the hex bore when its mouth faces you (A.u sets the hex's turn)
  const boreOf = (P, A, mm) => {
    const hex = mm / 20 / Math.cos(Math.PI / 6), pts = Array.from({ length: 6 }, (_, i) => K.iso(G.pointOf(A, ARM, hex, (i * Math.PI) / 3), P));
    return `<path d="${K.pathOf(pts, true)}" fill="#2f3338" stroke="#1b1d20" stroke-width="0.6"/>`;
  };
  function armSvg(P, A, mm, view, bore = true) {
    const r = mm / 20 + 0.5, s0 = ARM - 6.2;
    // bar, collar and socket as three plain turned solids (one lathe of the whole arm would fill its hull across the
    // neck, and a sloped neck costs several times as much to build), painted far one first
    const bar = S(G.disc(1.2, s0 - 0.6, ROD, A, P, { steps: 14 }), { tone: "hi" });
    const collar = S(G.disc(s0 - 0.6, s0 + 0.4, r * 0.8, A, P, { steps: 16 }), { tone: "hi" });
    const socket = S(G.disc(s0 + 0.4, ARM, r, A, P, { steps: 18 }), { tone: "hi", inner: L([s0 + 1.6, s0 + 2.3, ARM - 0.4].map((s) => G.arcOf(A, s, r, P)).join(""), { tone: "faint" }) });
    const out = [G.dot3(A.a, view) > 0 ? bar + collar + socket : socket + collar + bar];
    if (bore && G.dot3(A.a, view) > 0.15) out.push(boreOf(P, A, mm));
    return out.join("");
  }
  // a side arm's frame: along d, its hex flats lined up with the wrench's axis so they turn with it
  const sideFrame = (d) => G.frameOf(MID, d, Y, G.cross3(d, Y));

  ISO.add({
    name: "crosswrench", title: "Cross wheel wrench (part)", compare: null,
    about: "A four-way cross wheel wrench: two 35 cm steel bars welded in a cross, a socket on each arm (17, 19, 21, 23 mm); its origin is the 19 mm socket's end, which goes over a wheel nut, and turn spins it about the nut (anticlockwise = loosen); `left` and `right` = where two hands hold the side arms (at turn 0). anchors: left right",
    line: "crosswrench cx cy k aim=wall turn=0..1 lab=0 lit=wrench",
    demo: { line: "crosswrench 600 190 13 lab=1", script: [{ set: {}, hold: 1 }, { set: { turn: 0.25, lit: "wrench" }, hold: "settle" }, { set: { turn: 0.5 }, hold: "settle" }, { set: { turn: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", view = G.viewOf(P);
      g.innerHTML = `<g data-name="wrench" style="${STEEL}"><g data-w="back"></g><g data-w="away"></g><g data-w="ball"></g><g data-w="near"></g><g data-w="front"></g><g data-w="bore"></g></g><g data-part="words"></g>`;
      const slot = Object.fromEntries([...g.querySelectorAll("[data-w]")].map((e) => [e.dataset.w, e]));
      const wrench = g.querySelector('[data-name="wrench"]'), words = g.querySelector('[data-part="words"]'), w = ISO.writer();
      // the arm into the nut and the weld never change as it turns (the socket is round outside)
      slot.back.innerHTML = armSvg(P, G.frameAlong(MID, [0, -1, 0]), MM.back, view);
      slot.front.innerHTML = armSvg(P, G.frameAlong(MID, Y), MM.front, view, false);
      slot.ball.innerHTML = S(G.sphereOf(MID, ROD * 1.75, P), { tone: "hi" }) + D([K.iso(MID, P)], { size: 0.55, tone: "hi" });
      g.anchors = { right: G.add3(MID, G.mul3(radial(0), ARM - 4)), left: G.add3(MID, G.mul3(radial(Math.PI), ARM - 4)) };   // hands, at turn 0
      const s = { turn: ISO.clamp(ISO.num(o, "turn", 0), 0, 1) }, goal = { turn: s.turn };
      let lit = o.lit || "";
      // the side arms in one-degree steps, each built once (a turn back and forth reuses them)
      const cache = new Map(), STEP = Math.PI / 180;
      const sideArms = (q) => {
        if (!cache.has(q)) cache.set(q, [[q * STEP, MM.a], [q * STEP + Math.PI, MM.b]].map(([a, mm]) => { const d = radial(a); return { k: G.dot3(d, view), svg: armSvg(P, sideFrame(d), mm, view) }; }));
        return cache.get(q);
      };
      const draw = () => {
        const phi = s.turn * TAU, q = Math.round(phi / STEP) % 360, key = String(q);
        w.rebuild(slot.bore, key, () => boreOf(P, G.frameOf(MID, Y, radial(q * STEP), G.cross3(Y, radial(q * STEP))), MM.front));
        if (slot.key !== key) {
          slot.key = key;
          const arms = sideArms(q);
          slot.away.innerHTML = arms.filter((a) => a.k < 0).map((a) => a.svg).join("");
          slot.near.innerHTML = arms.filter((a) => a.k >= 0).map((a) => a.svg).join("");
          for (const e of [slot.away, slot.near]) e.querySelectorAll(".iso-solid").forEach((n) => n.toggleAttribute("data-lit", lit === "wrench"));
        }
        w.rebuild(words, lab ? String(Math.round(q / 6)) : "", () => {
          if (!lab) return "";
          const end = (d, mm, anchor, dy) => ISO.word(K.iso(G.add3(MID, G.mul3(d, ARM + 1.6)), P), `${mm} mm`, "#555", { size: 12, anchor, dy });
          const a = radial(phi), b = radial(phi + Math.PI);
          return ISO.word(K.iso(G.add3(MID, [0, 0, -ARM - 3]), P), "cross wheel wrench", "#444", { size: 14, dy: 14 }) +
            end(a, MM.a, a[0] >= 0 ? "start" : "end", 4) + end(b, MM.b, b[0] >= 0 ? "start" : "end", 4) + end([0, 1, 0], MM.front, "middle", 22) + end([0, -1, 0], MM.back, "start", -6);
        });
        w.light([wrench], lit === "wrench" ? [wrench] : []);
      };
      g.set = (p) => {
        if (p.turn !== undefined) goal.turn = ISO.clamp(+p.turn, 0, 1);
        if (p.lit !== undefined) { lit = p.lit; slot.key = ""; draw(); }
      };
      g.update = (dt) => {
        if (s.turn === goal.turn) return false;
        // two hands swing it about a turn in two seconds
        s.turn = ISO.follow(s.turn, goal.turn, dt, 0.5, ISO.still());
        if (Math.abs(s.turn - goal.turn) < 0.001) s.turn = goal.turn;
        draw();
        return s.turn !== goal.turn;
      };
      // 2 hands × 250 N on 17.5 cm arms
      g.readout = () => `cross wheel wrench · 35 cm bars, sockets 17, 19, 21, 23 mm · turned ${Math.round(s.turn * 360)}° anticlockwise (loosening) · two hands of 250 N give ${Math.round(2 * 250 * (ARM / 100))} N·m`;
      draw();
      return g;
    },
  });
})();
