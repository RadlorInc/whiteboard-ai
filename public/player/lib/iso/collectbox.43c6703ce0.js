// "collectbox cx cy k fill=0..1 drop=0..1 lab=0 lit=box|lid|lock|card|money" — a PART (batch 6, money): a clear acrylic
// collection box standing on a table, its origin the table point under its middle, its front toward the room (+y).
// 20 × 15 × 25 cm, 5 mm walls on four small feet; a lid with a slot for coins and folded notes, hinged at the back and
// shut at the front by a hasp with a brass padlock; inside, a printed backer card against the back wall (PLEASE GIVE ·
// a heart · every coin helps · thank you) and the money given: generic coins and notes (plain numbers, no real design)
// heaped to fill × 19 cm. drop 0 → 1 lets one coin go through the slot: it falls edge-down to the heap (gravity,
// slowed to a quarter so the eye can follow) and lands on it; back to 0 a new coin waits in the slot. set({ fill,
// drop }). For crowdfunding or charity giving. World: 1 = 1 cm. anchors: slot (the lid's slot) top (the lid's middle)
(() => {
  const K = window.K, G = window.G;
  const HX = 10, HY = 7.5, H = 25, WT = 0.5, FZ = 0.8, FULL = 19, SL = 4;
  const IX = HX - WT, IY = HY - WT;
  const pane = (P, pts, fill, op, stroke = "#7f9fb3") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="0.8" stroke-linejoin="round"/>`;
  // a seeded list of what lies in the heap, as flat art: coins (face-on circles, edge-on bars) and note corners
  const rnd = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
  function heapArt(B, w, h, seed, top) {
    const r = rnd(seed), s = [`<rect width="${w}" height="${h}" fill="${top ? "#d9b866" : "#b8913c"}"/>`], cols = ["#e8c870", "#d8dadd", "#e2be5e", "#c9ccd1"];
    const n = Math.round((w * h) / (top ? 2.6 : 2.2));
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = r() * h, c = cols[(r() * 4) | 0], kind = r();
      if (kind < 0.12) { const nc = ["#cfe3c2", "#c9d8ea", "#e9dcc0", "#dccfe6"][(r() * 4) | 0]; s.push(`<rect x="${(x - 2).toFixed(2)}" y="${(y - 1).toFixed(2)}" width="4.4" height="2.2" fill="${nc}" stroke="#55665a" stroke-width="0.06" transform="rotate(${((r() - 0.5) * 60).toFixed(0)} ${x.toFixed(2)} ${y.toFixed(2)})"/>`); }
      else if (top || kind < 0.55) s.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.9 + r() * 0.4).toFixed(2)}" fill="${c}" stroke="#6b5114" stroke-width="0.07"/>`);
      else s.push(`<rect x="${(x - 1.1).toFixed(2)}" y="${y.toFixed(2)}" width="2.3" height="0.32" rx="0.1" fill="${c}" stroke="#6b5114" stroke-width="0.05" transform="rotate(${((r() - 0.5) * 30).toFixed(0)} ${x.toFixed(2)} ${y.toFixed(2)})"/>`);
    }
    return s.join("");
  }
  function cardArt(B) {
    return `<rect width="17" height="11" rx="0.4" fill="#fbfaf6" stroke="#9aa1a9" stroke-width="0.06"/><rect width="17" height="2.4" fill="#2f7a5a"/>` +
      B.text(8.5, 1.75, "PLEASE GIVE", 1.4, "#ffffff", "middle", 800) +
      `<path d="M8.5 7.4C6.2 5.8 5.6 4.6 6.3 3.8C7 3 8 3.4 8.5 4.1C9 3.4 10 3 10.7 3.8C11.4 4.6 10.8 5.8 8.5 7.4Z" fill="#d8453a"/>` +
      B.text(8.5, 9, "Every coin helps", 1.1, "#3c4047", "middle", 700) + B.text(8.5, 10.4, "thank you", 0.9, "#6f757d", "middle", 600);
  }
  ISO.add({
    name: "collectbox", title: "Collection box (part)", compare: null,
    about: "A clear acrylic collection box with a slot in its lid, a hasp and padlock, a backer card and coins and notes inside; fill heaps the money given, drop lets a coin fall through the slot. anchors: slot top",
    line: "collectbox cx cy k fill=0..1 drop=0..1 lab=0 lit=box|lid|lock|card|money",
    demo: { line: "collectbox 480 440 13 fill=0.2 drop=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { drop: 1, lit: "money" }, hold: "settle" }, { set: { drop: 0, fill: 0.6, lit: "" }, hold: "settle" }, { set: { drop: 1, lit: "lock" }, hold: "settle" }, { set: { fill: 0.95, lit: "card" }, hold: "settle" }, { set: { drop: 0, lit: "lid" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { fill: B.num(o, "fill", 0.3, 0, 1), drop: B.num(o, "drop", 0, 0, 1), lit: o.lit || "", v: 0 };
      st.fWant = st.fill; st.dWant = st.drop;
      const Z0 = FZ + WT, ZL = FZ + H;   // the inside floor and the lid's underside
      // far walls and floor: back pane, left pane, floor, their cut edges; the backer card on the back wall
      const far = pane(P, [[-HX, -HY, FZ], [HX, -HY, FZ], [HX, -HY, ZL], [-HX, -HY, ZL]], "#e9f3f9", 0.55) + pane(P, [[-HX, -HY, FZ], [-HX, HY, FZ], [-HX, HY, ZL], [-HX, -HY, ZL]], "#e2eef6", 0.55) +
        pane(P, [[-IX, -IY, Z0], [IX, -IY, Z0], [IX, IY, Z0], [-IX, IY, Z0]], "#dfeaf2", 0.6) +
        K.lineSvg(K.segment([-IX, -IY, Z0], [-IX, -IY, ZL - 0.3], P) + K.segment([-IX, -IY, Z0], [IX, -IY, Z0], P) + K.segment([-IX, -IY, Z0], [-IX, IY, Z0], P), { tone: "faint", free: true });
      const feet = ISO.tinted(ISO.T.rubber, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => K.solidSvg(K.cylinder(sx * (HX - 1.5), sy * (HY - 1.5), 0.8, 0, FZ, P, 14), { tone: "lo" })).join(""));
      const card = TE.flat(P, [-8.5, -IY + 0.05, Z0 + 21.5], [1, 0, 0], [0, 0, -1], cardArt(B));
      // near panes: nearly clear, cut edges and a highlight streak on each
      const near = pane(P, [[-HX, HY, FZ], [HX, HY, FZ], [HX, HY, ZL], [-HX, HY, ZL]], "#eef6fb", 0.12) + pane(P, [[HX, -HY, FZ], [HX, HY, FZ], [HX, HY, ZL], [HX, -HY, ZL]], "#e2eef6", 0.16) +
        `<path d="${K.segment([-HX + 3, HY + 0.01, 4], [-HX + 7, HY + 0.01, 21], P) + K.segment([HX + 0.01, -HY + 2.5, 6], [HX + 0.01, -HY + 5, 19], P)}" stroke="#fff" stroke-width="${Math.max(1, k * 0.35).toFixed(2)}" stroke-linecap="round" opacity=".75"/>` +
        K.lineSvg(K.segment([-HX, HY - WT, ZL], [HX, HY - WT, ZL], P) + K.segment([HX - WT, -HY, ZL], [HX - WT, HY, ZL], P), { tone: "faint" });
      // the lid: a slab a little bigger than the box, the slot through it, two hinge knuckles at the back
      const lid = `<g opacity=".5">${TE.slab(P, { x: -HX - 0.3, y: -HY - 0.3, w: 2 * HX + 0.6, d: 2 * HY + 0.6, r: 0.4 }, ZL, 0.6, "mid", ISO.T.glass, 3)}</g>` +
        TE.quad(P, [[-SL, -0.45, ZL + 0.61], [SL, -0.45, ZL + 0.61], [SL, 0.45, ZL + 0.61], [-SL, 0.45, ZL + 0.61]], "#5d7f96", "#3a5566", 0.7) +
        [-6, 6].map((x) => ISO.tinted(ISO.T.steel, K.solidSvg(G.disc(-1.2, 2.4, 0.4, LAB.X([x, -HY - 0.3, ZL + 0.3]), P), { tone: "mid" }))).join("");
      // the hasp: a steel plate down from the lid over a staple on the front, the padlock's shackle through it
      const hasp = TE.box(P, [-1.2, 1.2], [HY + 0.3, HY + 0.5], [ZL - 4, ZL + 0.6], "mid", ISO.T.steel) + TE.quad(P, [[-0.35, HY + 0.51, ZL - 3.4], [0.35, HY + 0.51, ZL - 3.4], [0.35, HY + 0.51, ZL - 1.6], [-0.35, HY + 0.51, ZL - 1.6]], "#3c3f45") +
        ISO.tinted(ISO.T.steel, K.solidSvg(G.solidOf([[0, 0.35], [1.2, 0.35]], LAB.Y([0, HY + 0.4, ZL - 2.6]), P), { tone: "mid" }));
      const shackle = (() => { const pts = ISO.arc(0, ZL - 4.6, 0.9, 0, Math.PI, 12).map(([x, z]) => [x, HY + 1.6, z]); return `<path d="${K.pathOf([[0.9, HY + 1.6, ZL - 6.2], ...pts, [-0.9, HY + 1.6, ZL - 6.2]].map((p) => K.iso(p, P)))}" fill="none" stroke="#3c3f45" stroke-width="${(G.scaleOf(P) * 0.42).toFixed(2)}" stroke-linecap="round"/><path d="${K.pathOf([[0.9, HY + 1.6, ZL - 6.2], ...pts, [-0.9, HY + 1.6, ZL - 6.2]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c7c9cd" stroke-width="${(G.scaleOf(P) * 0.26).toFixed(2)}" stroke-linecap="round"/>`; })();
      const lock = shackle + TE.box(P, [-1.5, 1.5], [HY + 1, HY + 2.2], [ZL - 8.8, ZL - 6], "mid", ISO.T.brass) +
        `<path d="${G.circleOf(LAB.Y([0, HY + 2.2, ZL - 7.6]), 0.01, 0.28, P)}" fill="#3a2a08"/>` + TE.quad(P, [[-0.08, HY + 2.21, ZL - 7.9], [0.08, HY + 2.21, ZL - 7.9], [0.08, HY + 2.21, ZL - 8.4], [-0.08, HY + 2.21, ZL - 8.4]], "#3a2a08");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.6 }, 0, 0.02, P)}"/>` +
        `<g data-name="box">${feet}${far}</g><g data-name="card">${card}</g><g data-name="money" data-part="heap"></g>` +
        `<g data-name="box">${near}</g><g data-name="lid">${lid}</g><g data-name="money" data-part="coin"></g><g data-name="lock">${hasp}${lock}</g><g data-part="words"></g>`;
      g.anchors = { slot: [0, 0, ZL + 0.6], top: [0, 0, ZL + 0.6] };
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(K.iso([HX, 0, ZL + 3], P), "collection box", "#556", { size: 13, anchor: "start" });
      // the heap: its front and right faces against the glass and its top, each a clipped piece of flat art
      const heapSvg = (hz) => {
        if (hz < 0.05) return "";
        const zt = Z0 + hz, id = `b40h${B.uid = (B.uid || 0) + 1}`, wav = (n, len) => Array.from({ length: n + 1 }, (_, i) => `${((len * i) / n).toFixed(2)} ${(0.35 * Math.sin(i * 1.7) + 0.35).toFixed(2)}`).join("L");
        const front = TE.flat(P, [-IX, IY - 0.02, zt], [1, 0, 0], [0, 0, -1], `<clipPath id="${id}f"><path d="M${wav(10, 2 * IX)}L${2 * IX} ${hz}H0Z"/></clipPath><g clip-path="url(#${id}f)">${heapArt(B, 2 * IX, hz, 7, false)}</g>`);
        const right = TE.flat(P, [IX - 0.02, IY, zt], [0, -1, 0], [0, 0, -1], `<clipPath id="${id}r"><path d="M${wav(8, 2 * IY)}L${2 * IY} ${hz}H0Z"/></clipPath><g clip-path="url(#${id}r)">${heapArt(B, 2 * IY, hz, 11, false)}</g>`);
        const top = TE.flat(P, [-IX, -IY, zt - 0.2], [1, 0, 0], [0, 1, 0], heapArt(B, 2 * IX, 2 * IY, 3, true));
        return top + front + right;
      };
      // the dropping coin (drawn after the clear lid and panes, which it shows through): upright in the slot (half above the lid), falling edge-down, then lying on the heap
      const coinSvg = (d, hz) => {
        if (d >= 1) return B.coin(P, [1.5, 1, Z0 + hz - 0.1], 1.2, 0.2, "gold", true, 0);
        const z = ZL + 0.6 - (ZL + 0.6 - (Z0 + hz + 1.2)) * d, F = LAB.Y([0, -0.1, z]);
        return ISO.tinted(ISO.T.brass, K.solidSvg(G.disc(0, 0.2, 1.2, F, P), { tone: "mid" }) + `<path d="${G.circleOf(F, 0.202, 0.95, P)}" fill="none" stroke="#6b5114" stroke-width="0.5"/>`);
      };
      const draw = () => {
        const hz = Math.round(st.fill * FULL * 8) / 8;
        w.rebuild(el.heap, `${hz}`, () => heapSvg(hz));
        const dq = Math.round(st.drop * 60) / 60;
        w.rebuild(el.coin, `${dq} ${hz}`, () => coinSvg(dq, hz));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) st.fWant = ISO.clamp(+p.fill, 0, 1);
        if (p.drop !== undefined) { st.dWant = ISO.clamp(+p.drop, 0, 1); if (st.dWant < st.drop) { st.drop = st.dWant; st.v = 0; } }
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.fill = ISO.follow(st.fill, st.fWant, dt, 0.5, calm); if (Math.abs(st.fill - st.fWant) < 0.003) st.fill = st.fWant;
        if (calm) st.drop = st.dWant;
        else if (st.drop < st.dWant) {
          const D = Math.max(1, ZL + 0.6 - (Z0 + st.fill * FULL + 1.2));   // cm to fall
          st.v += 981 * 0.25 * dt; st.drop = Math.min(st.dWant, st.drop + (st.v * dt) / D);
          if (st.drop >= st.dWant) st.v = 0;
        }
        draw();
        return st.fill !== st.fWant || st.drop !== st.dWant;
      };
      g.readout = () => `collection box · heaped ${Math.round(st.fWant * FULL)} cm of ${FULL} cm (${Math.round(st.fWant * 100)}% full)${st.dWant >= 1 ? " · a coin has dropped in" : st.dWant > 0 ? " · a coin falling" : " · a coin waits in the slot"}`;
      draw();
      return g;
    },
  });
})();
