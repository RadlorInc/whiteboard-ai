// "toolbox cx cy width open=0|1 lab=1 lit=box|lid|latches|tray|tools" — a red steel toolbox that opens.
// A 41 cm steel box: folded body with a rolled lip, a domed lid on a full-length piano hinge, a fold-flat carry handle
// on the lid, two spring draw-latches on the front, and inside a lift-out tray (screws, wall plugs, bits, a
// screwdriver and a spanner) beside the deep well where the hammer stands. set({ open: 1 }) flips the latches down and
// swings the lid back to 105° on its hinge; open: 0 closes it and snaps the latches. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const X = 20.5, Y = 9.5, H = 17, LID = 5, OPEN = (105 * Math.PI) / 180;
  const RED = ISO.tint("#f4a59a", ["#a3271b", "#b8382a", "#cc4a3a", "#dc5f4f"], "#5e120a"), STEEL = ISO.T.steel, WOOD = ISO.T.wood, PLASTIC = ISO.T.plastic;
  const BENCH = { x: -30, y: -20, w: 60, d: 38, r: 3 };
  const frame = (o, a, u) => G.frameOf(o, a, u, G.cross3(a, u));
  // The lid's profile in y–z (closed), turned by a about the hinge at the back top edge.
  const LIDP = [[-Y, 0], [Y, 0], [Y, LID - 1.6], [Y - 0.6, LID - 0.5], [Y - 2, LID], [-Y + 2, LID], [-Y + 0.6, LID - 0.5], [-Y, LID - 1.6]];
  const turn = (a) => ([y, z]) => { const dy = y + Y, c = Math.cos(a), s = Math.sin(a); return [-Y + dy * c - z * s, H + dy * s + z * c]; };

  function lidSvg(P, a) {
    const tr = turn(a), pts = LIDP.map(tr), out = [], V = G.viewOf(P), up = -Math.sin(a) * V[1] + Math.cos(a) * V[2] > 0;
    const shell = ISO.tinted(RED, ISO.prismX(P, pts, -X, X, ["#9c2416", "#e0604e"], "#d84c3a", "#5e120a"));
    // the carry handle on the lid's top, folded flat: two pivot brackets and the grip bar
    const top = (x, y, z) => { const [yy, zz] = tr([y, LID + z]); return [x, yy, zz]; };
    for (const x of [-8, 8]) out.push(ISO.tinted(STEEL, ISO.poly([[x - 1, -1, 0], [x + 1, -1, 0], [x + 1, 1, 0], [x - 1, 1, 0], [x - 1, -1, 1.2], [x + 1, -1, 1.2], [x + 1, 1, 1.2], [x - 1, 1, 1.2]].map(([u, v, w]) => top(u, v, w)), ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(PLASTIC, ISO.poly([[-7, 1.2, 0.2], [7, 1.2, 0.2], [7, 3.4, 0.2], [-7, 3.4, 0.2], [-7, 1.2, 1.3], [7, 1.2, 1.3], [7, 3.4, 1.3], [-7, 3.4, 1.3]].map(([u, v, w]) => top(u, v, w)), ISO.BOX_F, P, "hi")));
    // pressed rib round the lid's top face: a closed outline, so it ends on nothing
    if (up) out.push(`<path d="${K.pathOf([[-X + 2, -Y + 2], [X - 2, -Y + 2], [X - 2, Y - 2], [-X + 2, Y - 2]].map(([x, y]) => K.iso(top(x, y, 0.02), P)), true)}" fill="none" stroke="#5e120a" stroke-width="0.6" stroke-opacity=".55"/>`);
    if (!up) return out.join("") + shell;
    out.unshift(shell);
    // the latch strikes on the lid's front lip
    for (const x of [-13, 13]) { const p0 = top(x - 1.6, Y, -LID + 0.6), p1 = top(x + 1.6, Y, -LID + 0.6), p2 = top(x + 1.6, Y, -LID + 2), p3 = top(x - 1.6, Y, -LID + 2); out.push(`<path d="${K.pathOf([p0, p1, p2, p3].map((p) => K.iso([p[0], p[1] + 0.05, p[2]], P)), true)}" fill="#c9cbcf" stroke="#3c3f45" stroke-width="0.5"/>`); }
    return out.join("");
  }
  // A draw-latch: a plate on the body, and a bail that flips from hooked (f = 0) to hanging down (f = 1).
  function latchSvg(P, f) {
    const out = [];
    for (const x of [-13, 13]) {
      out.push(ISO.tinted(STEEL, ISO.wbox(P, [x - 2, x + 2], [Y, Y + 0.4], [H - 6, H - 1.6], "mid")));
      const a = f * 2.4;
      out.push(ISO.tinted(STEEL, ISO.poly([[-1.5, 0, -0.4], [1.5, 0, -0.4], [1.5, 0.5, -0.4], [-1.5, 0.5, -0.4], [-1.5, 0, 3], [1.5, 0, 3], [1.5, 0.5, 3], [-1.5, 0.5, 3]].map(([u, w, y]) => { const c = Math.cos(a), s = Math.sin(a); return [x + u, Y + 0.4 + w * c + y * s, H - 2.6 - w * s + y * c]; }), ISO.BOX_F, P, "hi")));
      out.push(D([K.iso([x, Y + 0.45, H - 2.6], P)], { size: 0.55, tone: "hi" }));
    }
    return out.join("");
  }
  // The open box: back and side walls, then what is inside, then the front wall with its rolled lip and badge.
  function backSvg(P) {
    return ISO.tinted(RED, ISO.wbox(P, [-X, X], [-Y, Y], [0, 0.5], "mid") + ISO.wbox(P, [-X, X], [-Y, -Y + 0.5], [0, H], "hi") + ISO.wbox(P, [-X, -X + 0.5], [-Y, Y], [0, H], "hi"));
  }
  function insideSvg(P) {
    const out = [];
    // the hammer stands head-down in the deep right-hand well, its handle leaning on the box's back edge
    const base = [12, 2, 0.5], tip = [9, -6.5, 30], ax = G.unit3(G.sub3(tip, base)), F = frame(G.add3(base, [0, 0, 3.2]), ax, G.unit3(G.cross3(ax, [1, 0, 0])));
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [9.5, 14.5], [0.8, 3.2], [0.5, 3.2], "hi")));
    out.push(ISO.tinted(WOOD, S(G.solidOf([[0, 1.1], [24, 0.95, 1], [27, 1.05, 1], [28, 0.9]], F, P, { steps: 20 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.rubber, S(G.disc(18, 27.2, 1.3, F, P, { steps: 20 }), { tone: "hi" })));
    // the tray: walls, two dividers, and its handle bar; in it screws, wall plugs, bits, a screwdriver and a spanner
    const T0 = -X + 0.6, T1 = 4, z0 = H - 5.5, z1 = H - 0.4;
    out.push(`<g data-name="tray">` + ISO.wbox(P, [T0, T1], [-Y + 0.6, Y - 0.6], [z0, z0 + 0.4], "mid") + ISO.wbox(P, [T0, T1], [-Y + 0.6, -Y + 1], [z0, z1], "mid") + ISO.wbox(P, [T1 - 0.4, T1], [-Y + 0.6, Y - 0.6], [z0, z1], "mid") + ISO.wbox(P, [T0, T0 + 0.4], [-Y + 0.6, Y - 0.6], [z0, z1], "mid"));
    out.push(ISO.wbox(P, [-9, -8.6], [-Y + 1, Y - 0.6], [z0, z1 - 1.2], "mid"));
    const screws = [], plugs = [];
    for (let i = 0; i < 9; i++) screws.push(K.iso([-17 + (i % 3) * 2.4, -5 + Math.floor(i / 3) * 2.6, z0 + 0.5], P));
    out.push(D(screws, { size: 0.9, tone: "mid" }));
    for (let i = 0; i < 4; i++) plugs.push(ISO.tinted(ISO.T.amber, S(G.disc(0, 2.6, 0.45, frame([-17.5 + i * 1.6, 3, z0 + 0.85], [0, 1, 0], [1, 0, 0]), P, { steps: 12 }), { tone: "hi" })));
    out.push(plugs.join(""));
    const Fs = frame([-7.5, 6.5, z0 + 1.6], G.unit3([1, -0.6, 0]), [0, 0, 1]);
    out.push(ISO.tinted(STEEL, S(G.disc(0, 7.5, 0.3, Fs, P, { steps: 12 }), { tone: "hi" })), ISO.tinted(ISO.T.red, S(G.solidOf([[7.5, 0.8], [8.2, 1.1, 1], [12, 1.15, 1], [12.8, 0.8, 1], [13, 0]], Fs, P, { steps: 16 }), { tone: "hi" })));
    out.push(ISO.tinted(STEEL, ISO.box((u, w, y) => [-7 + u, -3 + w, y], P, [0, 10], [-0.6, 0.6], [z0 + 0.4, z0 + 1], "hi")));
    out.push("</g>");
    return out.join("");
  }
  function frontSvg(P) {
    return ISO.tinted(RED, ISO.wbox(P, [X - 0.5, X], [-Y, Y], [0, H], "hi") + ISO.wbox(P, [-X, X], [Y - 0.5, Y], [0, H], "hi") + ISO.wbox(P, [-X - 0.3, X + 0.3], [Y - 0.6, Y + 0.3], [H - 0.6, H], "hi")) +
      `<path d="${K.pathOf([[-4.5, 4], [4.5, 4], [4.5, 7], [-4.5, 7]].map(([x, z]) => K.iso([x, Y + 0.05, z], P)), true)}" fill="#f3f3f0" stroke="#5e120a" stroke-width="0.5"/>` +
      `<path d="${K.pathOf([[-3.4, 5.5], [3.4, 5.5]].map(([x, z]) => K.iso([x, Y + 0.06, z], P)))}" stroke="#8a8a85" stroke-width="0.6"/>`;
  }

  ISO.add({
    name: "toolbox", title: "Steel toolbox", compare: "toolbox 480 280 400",
    about: "A red steel toolbox: the draw-latches flip down, the lid swings back on its piano hinge, and inside are the lift-out tray and the hammer in its well.",
    line: "toolbox cx cy width open=0|1 lab=1 lit=box|lid|latches|tray|tools",
    demo: { line: "toolbox 480 280 400", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { open: 0 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.9, Hh = size * 1.15;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, -4, 0), [-X, -Y - LID, H + 2 * Y + 2], [X, -Y - LID, H + 2 * Y + 2], [9, -6.5, 31]], cx, cy, W, Hh, { azimuth: 56, elevation: 26 }, parent);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(BENCH, -4, 4, P)}"/>` + ISO.tinted(WOOD, S(K.slabOf(BENCH, -4, 4, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(BENCH, -2, P, 3), { tone: "faint" }) })) +
        `<path class="iso-halo" d="${K.haloOf({ x: -X - 1, y: -Y - 1, w: 2 * X + 2, d: 2 * Y + 2, r: 2 }, 0, 2, P)}"/>` +
        `<g data-k="lidback"></g><g data-name="box">${backSvg(P)}</g><g data-name="tools">${insideSvg(P)}</g><g data-k="box2">${frontSvg(P)}</g><g data-name="latches"></g><g data-k="lidfront"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-k="${n}"],[data-part="${n}"]`), el = { lidback: q("lidback"), lidfront: q("lidfront"), latches: q("latches"), words: q("words"), box: q("box"), box2: q("box2"), tools: q("tools"), tray: q("tray") }, w = ISO.writer();
      const op = o.open === "1";
      const s = { latch: op ? 1 : 0, lid: op ? 1 : 0 }, goal = { open: op ? 1 : 0 };
      let lit = o.lit || "";
      const draw = () => {
        const a = s.lid * OPEN, back = a > 1.2, key = a.toFixed(3);
        w.rebuild(el.lidback, back ? key : "", () => (back ? lidSvg(P, a) : ""));
        w.rebuild(el.lidfront, back ? "" : key, () => (back ? "" : lidSvg(P, a)));
        w.rebuild(el.latches, s.latch.toFixed(3), () => latchSvg(P, s.latch));
        w.attr(el.tools, "visibility", a > 0.25 ? "visible" : "hidden");
        w.rebuild(el.words, lab ? String(a > 1) : "", () => !lab ? "" : [
          ISO.word(K.iso([X, Y, 4], P), "steel box", "#8f2a22", { anchor: "start", size: 15, dy: 4 }),
          ISO.word(K.iso([13, Y + 0.5, H - 6], P), "latches", "#444", { anchor: "start", size: 14, dy: 16 }),
          a > 1 ? ISO.word(K.iso([-14, -2, H + 1], P), "tray", "#444", { size: 15, dy: -4 }) + ISO.word(K.iso([9, -6.5, 31], P), "hammer", "#444", { anchor: "start", size: 15, dy: 0 }) + ISO.word(K.iso([0, -Y - 6, H + 16], P), "lid", "#8f2a22", { size: 15, dy: -6 }) : ISO.word(K.iso([0, 0, H + LID + 1], P), "handle", "#444", { size: 14, dy: -10 }),
        ].join(""));
        const want = lit || (s.latch > 0.02 && s.latch < 0.98 ? "latches" : s.lid > 0.02 && s.lid < 0.98 ? "lid" : s.lid >= 0.98 ? "tray" : "");
        const groups = { lid: [el.lidback, el.lidfront], latches: [el.latches], box: [el.box, el.box2], tray: [el.tray], tools: [el.tools] };
        w.light(Object.values(groups).flat().filter(Boolean), (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.open !== undefined) goal.open = +p.open ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, rate) => (calm ? to : Math.abs(to - v) <= rate * dt ? to : v + Math.sign(to - v) * rate * dt);
        // opening: latches first, then the lid; closing: the lid first, then the latches snap
        if (goal.open) { s.latch = step(s.latch, 1, 3); if (s.latch >= 1) s.lid = step(s.lid, 1, 0.9); }
        else { s.lid = step(s.lid, 0, 1.1); if (s.lid <= 0) s.latch = step(s.latch, 0, 4); }
        draw();
        return goal.open ? s.lid < 1 || s.latch < 1 : s.lid > 0 || s.latch > 0;
      };
      g.readout = () => {
        if (s.lid <= 0 && s.latch <= 0) return "41 × 19 × 22 cm steel toolbox · latched shut · carry it by the lid's handle";
        if (s.lid <= 0) return "latches flipped down · lid free to lift";
        return `lid swung back ${Math.round(s.lid * 105)}° on its piano hinge${s.lid >= 1 ? " · lift the tray out to reach the deep well" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
