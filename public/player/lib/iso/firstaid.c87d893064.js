// "firstaid cx cy size open=0|1 lab=1 lit=box|lid|latches|tray|bandage|gauze|plasters|tape|scissors|gloves|wipes" — a green first-aid box.
// A 30 × 18 × 13 cm moulded green case: body with a rolled lip and a white cross on its front, a lid on a full-length
// hinge with a white cross and a fold-flat carry handle, two snap latches. Inside, a divider splits it: a crepe
// bandage roll, sterile gauze pads, a box of plasters, a roll of tape, blunt-tip scissors, a pair of gloves in their
// packet and antiseptic wipes. set({ open: 1 }) flips the latches down and swings the lid back 105°. World units: 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const X = 15, Y = 9, H = 10, LID = 3, OPEN = (105 * Math.PI) / 180;
  const GREEN = ISO.tint("#a8dcb4", ["#1f7a3a", "#2b8a47", "#3a9a55", "#4caa66"], "#0f4a22"), STEEL = ISO.T.steel, WHITE = ISO.T.glass, PLASTIC = ISO.T.plastic;
  const BENCH = { x: -20, y: -13, w: 40, d: 26, r: 3 };
  // the white cross: a plus 6 cm across with 2 cm arms, as an outline in a face's own (a, b) coordinates
  const CROSS = [[-1, -3], [1, -3], [1, -1], [3, -1], [3, 1], [1, 1], [1, 3], [-1, 3], [-1, 1], [-3, 1], [-3, -1], [-1, -1]];
  const LIDP = [[-Y, 0], [Y, 0], [Y, LID - 1.2], [Y - 0.6, LID - 0.4], [Y - 1.6, LID], [-Y + 1.6, LID], [-Y + 0.6, LID - 0.4], [-Y, LID - 1.2]];
  const turn = (a) => ([y, z]) => { const dy = y + Y, c = Math.cos(a), s = Math.sin(a); return [-Y + dy * c - z * s, H + dy * s + z * c]; };

  function lidSvg(P, a) {
    const tr = turn(a), pts = LIDP.map(tr), out = [], V = G.viewOf(P), up = -Math.sin(a) * V[1] + Math.cos(a) * V[2] > 0;
    const shell = ISO.tinted(GREEN, ISO.prismX(P, pts, -X, X, ["#1a6e33", "#5cba74"], "#46a862", "#0f4a22"));
    const top = (x, y, z) => { const [yy, zz] = tr([y, LID + z]); return [x, yy, zz]; };
    if (!up) return shell;
    out.push(shell);
    // pressed rib round the lid top (closed), then the cross printed on it
    out.push(`<path d="${K.pathOf([[-X + 1.6, -Y + 1.6], [X - 1.6, -Y + 1.6], [X - 1.6, Y - 1.6], [-X + 1.6, Y - 1.6]].map(([x, y]) => K.iso(top(x, y, 0.02), P)), true)}" fill="none" stroke="#0f4a22" stroke-width="0.6" stroke-opacity=".5"/>`);
    out.push(`<path d="${K.pathOf(CROSS.map(([u, v]) => K.iso(top(u * 1.2 - 5, v * 1.2 + 1.2, 0.03), P)), true)}" fill="#fdfdfb" stroke="#0f4a22" stroke-width="0.7"/>`);
    // the carry handle, folded flat towards the back: two pivot lugs and the grip
    for (const x of [3, 11]) out.push(ISO.tinted(GREEN, ISO.poly([[x - 0.8, -4.2, 0], [x + 0.8, -4.2, 0], [x + 0.8, -2.6, 0], [x - 0.8, -2.6, 0], [x - 0.8, -4.2, 1], [x + 0.8, -4.2, 1], [x + 0.8, -2.6, 1], [x - 0.8, -2.6, 1]].map(([u, v, w]) => top(u, v, w)), ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(PLASTIC, ISO.poly([[3.8, -3.9, 0.15], [10.2, -3.9, 0.15], [10.2, -1.2, 0.15], [3.8, -1.2, 0.15], [3.8, -3.9, 1], [10.2, -3.9, 1], [10.2, -1.2, 1], [3.8, -1.2, 1]].map(([u, v, w]) => top(u, v, w)), ISO.BOX_F, P, "hi")));
    // the latch keepers on the lid's front lip
    for (const x of [-10, 10]) out.push(`<path d="${K.pathOf([[x - 1.4, -LID + 0.5], [x + 1.4, -LID + 0.5], [x + 1.4, -LID + 1.8], [x - 1.4, -LID + 1.8]].map(([u, z]) => K.iso(G.add3(top(u, Y, z), [0, 0.05, 0]), P)), true)}" fill="#e8ece9" stroke="#0f4a22" stroke-width="0.5"/>`);
    return out.join("");
  }
  // a snap latch: a plate on the body and a flap that flips from hooked (f 0) to hanging (f 1)
  function latchSvg(P, f) {
    const out = [];
    for (const x of [-10, 10]) {
      out.push(ISO.tinted(PLASTIC, ISO.wbox(P, [x - 1.8, x + 1.8], [Y, Y + 0.35], [H - 4.5, H - 1.2], "mid")));
      const a = f * 2.4, c = Math.cos(a), s = Math.sin(a);
      out.push(ISO.tinted(PLASTIC, ISO.poly([[-1.4, 0, -0.3], [1.4, 0, -0.3], [1.4, 0.45, -0.3], [-1.4, 0.45, -0.3], [-1.4, 0, 2.6], [1.4, 0, 2.6], [1.4, 0.45, 2.6], [-1.4, 0.45, 2.6]].map(([u, w, y]) => [x + u, Y + 0.35 + w * c + y * s, H - 2 - w * s + y * c]), ISO.BOX_F, P, "hi")));
      out.push(D([K.iso([x, Y + 0.4, H - 2], P)], { size: 0.5, tone: "hi" }));
    }
    return out.join("");
  }
  function backSvg(P) {
    return ISO.tinted(GREEN, ISO.wbox(P, [-X, X], [-Y, Y], [0, 0.5], "mid") + ISO.wbox(P, [-X, X], [-Y, -Y + 0.5], [0, H], "hi") + ISO.wbox(P, [-X, -X + 0.5], [-Y, Y], [0, H], "hi"));
  }
  // The contents, back to front. Each group is named so a script can circle it.
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  function insideSvg(P) {
    const out = [], z0 = 5.5, T0 = -X + 0.5, T1 = X - 0.5, V0 = -Y + 0.5, V1 = Y - 0.5;
    // the lift-out tray resting on the box's floor ribs 5 cm up: a white floor and low walls, then the divider
    // across it 5 cm from the right (the bulky spares live under it)
    out.push(`<g data-name="tray">` + ISO.tinted(WHITE, ISO.wbox(P, [T0, T1], [V0, V1], [z0 - 0.4, z0], "mid") + ISO.wbox(P, [T0, T1], [V0, V0 + 0.3], [z0, z0 + 1.2], "mid") + ISO.wbox(P, [T0, T0 + 0.3], [V0, V1], [z0, z0 + 1.2], "mid")) + `</g>`);
    out.push(ISO.tinted(GREEN, ISO.wbox(P, [8.6, 9.1], [V0 + 0.3, V1], [z0, H - 1], "mid")));
    // back left: the crepe bandage roll lying along x, with its clip
    out.push(`<g data-name="bandage">` + ISO.tinted(WHITE, S(G.disc(-13.6, -3.6, 3.2, xAx([0, -5, z0 + 3.2]), P, { steps: 32 }), { tone: "hi", inner: `<path d="${G.arcOf(xAx([0, -5, z0 + 3.2]), -9, 3.21, P) + G.arcOf(xAx([0, -5, z0 + 3.2]), -6.5, 3.21, P)}" fill="none" stroke="#9fb6c4" stroke-width=".5"/>` })) +
      `<path d="${G.circleOf(xAx([0, -5, z0 + 3.2]), -3.58, 1.2, P, 20)}" fill="#c9dde9" stroke="#5d7f96" stroke-width=".5"/>` + ISO.tinted(STEEL, ISO.wbox(P, [-9.6, -8.6], [-1.8, -1.6], [z0 + 2.2, z0 + 4.2], "hi")) + `</g>`);
    // back right of the bandage: the box of plasters
    out.push(`<g data-name="plasters">` + ISO.tinted(ISO.T.amber, ISO.wbox(P, [-2.6, 7.8], [-8, -2.4], [z0, z0 + 4.2], "hi")) +
      `<path d="${K.pathOf([[-1.6, -7], [6.8, -7], [6.8, -3.4], [-1.6, -3.4]].map(([x, y]) => K.iso([x, y, z0 + 4.22], P)), true)}" fill="none" stroke="#8a5a10" stroke-width=".5"/>` +
      `<path d="${K.pathOf(CROSS.map(([u, v]) => K.iso([2.6 + u * 0.4, -2.38, z0 + 2.1 - v * 0.4], P)), true)}" fill="#c0392b" stroke="#8a1a12" stroke-width=".4"/>` + `</g>`);
    // right well, behind the divider: the tape roll standing up and the scissors leaning on the wall
    const TF = zAx([11.9, -4.6, z0]);
    out.push(`<g data-name="tape">` + ISO.tinted(WHITE, S(G.ringBand(0, 2.5, 1.6, 2.4, TF, P, { steps: 32 }), { tone: "hi" })) + `<path d="${G.circleOf(TF, 2.51, 1.6, P, 28)}" fill="#e9d0ad" stroke="#7a5a2e" stroke-width=".5"/><path d="${G.circleOf(TF, 2.52, 1.2, P, 28)}" fill="#c9d3da" stroke="#7a5a2e" stroke-width=".5"/>` + `</g>`);
    // the blunt-tip scissors lying flat beside it, blades pointing to the front
    const SF = G.frameOf([11.8, -0.6, z0 + 0.15], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    const blade = (side) => ISO.poly([[-0.3, -0.12, 0], [0.3, -0.12, 0], [0.3, 0.12, 0], [-0.3, 0.12, 0], [-0.12, -0.12, 6.6], [0.12, -0.12, 6.6], [0.12, 0.12, 6.6], [-0.12, 0.12, 6.6]].map(([u, v, s]) => G.pointOf(SF, s + 1.4, 0, 0).map((c, i) => c + SF.u[i] * (u + side * 0.22) + SF.v[i] * (v + 0.12 + side * 0.12))), ISO.BOX_F, P, "hi");
    const ring = (x) => S(G.ringBand(0, 0.45, 0.6, 1.1, G.frameOf([x, -1.4, z0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 20 }), { tone: "hi" }) + `<path d="${G.circleOf(G.frameOf([x, -1.4, z0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0.46, 0.6, P, 16)}" fill="#eef2f4" stroke="#8f2a22" stroke-width=".45"/>`;
    out.push(`<g data-name="scissors">` + ISO.tinted(ISO.T.red, ring(10.9) + ring(12.7)) + ISO.tinted(STEEL, blade(-1) + blade(1)) + D([K.iso(G.pointOf(SF, 2.6, 0, 0).map((c, i) => c + SF.v[i] * 0.36), P)], { size: 0.45 }) + `</g>`);
    // front left: the sterile gauze pads, a stack of four sealed packets
    out.push(`<g data-name="gauze">` + [0, 1, 2, 3].map((i) => ISO.tinted(WHITE, ISO.wbox(P, [-13.8 + i * 0.15, -5.4 + i * 0.15], [-0.6, 7.6], [z0 + i * 0.6, z0 + i * 0.6 + 0.55], "hi"))).join("") +
      `<path d="${K.pathOf([[-12.8, 0.6], [-6.2, 0.6], [-6.2, 6.6], [-12.8, 6.6]].map(([x, y]) => K.iso([x + 0.45, y, z0 + 2.37], P)), true)}" fill="none" stroke="#5d7f96" stroke-width=".5" stroke-dasharray="1 .8"/>` + `</g>`);
    // front middle: the gloves in their packet, and the antiseptic wipes in a row of sachets
    out.push(`<g data-name="gloves">` + ISO.tinted(ISO.T.blue, ISO.wbox(P, [-4.6, 2.4], [-1, 3.6], [z0, z0 + 1.4], "hi")) +
      `<path d="${K.pathOf([[-3.6, 0], [1.4, 0], [1.4, 2.6], [-3.6, 2.6]].map(([x, y]) => K.iso([x, y, z0 + 1.42], P)), true)}" fill="#cde2f6" stroke="#1f4f8f" stroke-width=".5"/>` + `</g>`);
    out.push(`<g data-name="wipes">` + [0, 1, 2].map((i) => ISO.tinted(ISO.T.paint, ISO.wbox(P, [-4.6 + i * 2.4, -2.6 + i * 2.4], [4.4, 8], [z0, z0 + 0.5], "hi"))).join("") + `</g>`);
    return out.join("");
  }
  function frontSvg(P) {
    return ISO.tinted(GREEN, ISO.wbox(P, [X - 0.5, X], [-Y, Y], [0, H], "hi") + ISO.wbox(P, [-X, X], [Y - 0.5, Y], [0, H], "hi") + ISO.wbox(P, [-X - 0.3, X + 0.3], [Y - 0.6, Y + 0.3], [H - 0.6, H], "hi")) +
      // the white cross on its front
      `<path d="${K.pathOf(CROSS.map(([u, v]) => K.iso([u * 1.05, Y + 0.05, 4.4 - v * 1.05], P)), true)}" fill="#fdfdfb" stroke="#0f4a22" stroke-width="0.7"/>`;
  }

  ISO.add({
    name: "firstaid", title: "First-aid box", compare: "firstaid 480 270 280",
    about: "A green first-aid box: the latches flip down and the lid swings back to show the bandage, gauze pads, plasters, tape, scissors, gloves and wipes inside.",
    line: "firstaid cx cy size open=0|1 lab=1 lit=box|lid|latches|tray|bandage|gauze|plasters|tape|scissors|gloves|wipes",
    demo: { line: "firstaid 480 280 300", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { lit: "gauze" }, hold: 1.4 }, { set: { lit: "", open: 0 }, hold: "settle" }] },
    make([cx, cy, size = 280], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.6, Hh = size * 1.6;
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, -4, 0), [-X, -Y - LID, H + 2 * Y + 1], [X, -Y - LID, H + 2 * Y + 1]], cx, cy, W, Hh, { azimuth: 56, elevation: 38 }, parent);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(BENCH, -4, 4, P)}"/>` + ISO.tinted(ISO.T.wood, S(K.slabOf(BENCH, -4, 4, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(BENCH, -2, P, 3), { tone: "faint" }) })) +
        `<path class="iso-halo" d="${K.haloOf({ x: -X - 1, y: -Y - 1, w: 2 * X + 2, d: 2 * Y + 2, r: 2 }, 0, 2, P)}"/>` +
        `<g data-k="lidback"></g><g data-name="box">${backSvg(P)}</g><g data-k="inside">${insideSvg(P)}</g><g data-k="box2">${frontSvg(P)}</g><g data-name="latches"></g><g data-k="lidfront"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-k="${n}"],[data-part="${n}"]`), w = ISO.writer();
      const el = Object.fromEntries(["lidback", "lidfront", "latches", "words", "box", "box2", "inside"].map((n) => [n, q(n)]));
      const NAMES = ["tray", "bandage", "gauze", "plasters", "tape", "scissors", "gloves", "wipes"], items = Object.fromEntries(NAMES.map((n) => [n, q(n)]));
      const op = o.open === "1", s = { latch: op ? 1 : 0, lid: op ? 1 : 0 }, goal = { open: op ? 1 : 0 };
      let lit = o.lit || "";
      const draw = () => {
        const a = s.lid * OPEN, back = a > 1.2, key = a.toFixed(3);
        w.rebuild(el.lidback, back ? key : "", () => (back ? lidSvg(P, a) : ""));
        w.rebuild(el.lidfront, back ? "" : key, () => (back ? "" : lidSvg(P, a)));
        w.rebuild(el.latches, s.latch.toFixed(3), () => latchSvg(P, s.latch));
        w.attr(el.inside, "visibility", a > 0.25 ? "visible" : "hidden");
        const open = a > 1;
        w.rebuild(el.words, lab ? `${open} ${lit}` : "", () => !lab ? "" : [
          ISO.word(K.iso([X, Y, 2], P), "first-aid box", "#1f6a34", { anchor: "start", size: 15, dy: 4 }),
          open ? [ISO.word(K.iso([-9, -5, 12.5], P), "bandage", "#444", { size: 13, dy: -4 }), ISO.word(K.iso([2.6, -5, 10.5], P), "plasters", "#8a5a10", { size: 13, dy: -8 }),
            ISO.word(K.iso([14.6, -4.6, 7], P), "tape", "#444", { size: 13, anchor: "start", dy: -8 }), ISO.word(K.iso([14.6, 4, 6], P), "scissors", "#444", { size: 13, anchor: "start", dy: 4 }),
            ISO.word(K.iso([-9.6, 3.5, 8.5], P), "gauze pads", "#444", { size: 13, dy: -4 }), ISO.word(K.iso([-1, 1.3, 7.5], P), "gloves", "#1f4f8f", { size: 13, dy: -4 }),
            ISO.word(K.iso([-0.2, 6.2, 6.5], P), "wipes", "#444", { size: 13, dy: 12 })].join("") : ISO.word(K.iso([0, 0, H + LID + 1.4], P), "lid", "#1f6a34", { size: 14, dy: -10 }),
        ].join(""));
        const want = lit || (s.latch > 0.02 && s.latch < 0.98 ? "latches" : s.lid > 0.02 && s.lid < 0.98 ? "lid" : "");
        const groups = { lid: [el.lidback, el.lidfront], latches: [el.latches], box: [el.box, el.box2], ...Object.fromEntries(NAMES.map((n) => [n, [items[n]]])) };
        w.light(Object.values(groups).flat(), groups[want] || []);
      };
      g.set = (p) => { if (p.open !== undefined) goal.open = +p.open ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, rate) => (calm ? to : Math.abs(to - v) <= rate * dt ? to : v + Math.sign(to - v) * rate * dt);
        if (goal.open) { s.latch = step(s.latch, 1, 3); if (s.latch >= 1) s.lid = step(s.lid, 1, 0.9); }
        else { s.lid = step(s.lid, 0, 1.1); if (s.lid <= 0) s.latch = step(s.latch, 0, 4); }
        draw();
        return goal.open ? s.lid < 1 || s.latch < 1 : s.lid > 0 || s.latch > 0;
      };
      g.readout = () => {
        if (s.lid <= 0 && s.latch <= 0) return "30 × 18 × 13 cm first-aid box · green with a white cross so anyone can find it fast";
        if (s.lid < 1) return `lid swung back ${Math.round(s.lid * 105)}°`;
        return "inside: crepe bandage, 4 sterile gauze pads, plasters, tape, blunt-tip scissors, gloves, antiseptic wipes · restock what you use";
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
