// "cointray cx cy k coins=0..10 lab=0 lit=tray|coins" — a PART (batch 6, money): the shallow change tray on a shop
// counter, 14 × 10 × 1.5 cm, its origin the counter point under its middle. A moulded grey-blue tray on a thin
// rubber foot with two rounded wells (a big one for coins and a small one beside it), a dimpled grip pattern on the
// well floors, and the coins handed back lying in them (generic gold and silver coins, 2.2 cm). coins = how many lie
// in the tray; a coin added drops in from above. set({ coins }). World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  const W = 14, D = 10, H = 1.5, DEEP = 1.0;
  const TRAY = ISO.tint("#c9d6df", ["#7d909e", "#8fa1ae", "#a1b2be", "#b4c3cd"], "#2d3e4a");
  const WELLS = [{ x: -6.3, y: -4.2, w: 8.6, d: 8.4, r: 2.4 }, { x: 3.1, y: -4.2, w: 3.2, d: 8.4, r: 1.4 }];
  // where each coin lies: [well, x, y, metal]; the first seven in the big well
  const SPOTS = [[0, -3.8, -1.6, "gold"], [0, -1.2, 1.8, "silver"], [0, -0.6, -1.9, "gold"], [0, -4.0, 1.7, "silver"], [0, -2.3, 0.2, "gold"], [0, 0.6, 0.0, "silver"], [0, -3.4, -0.1, "gold"], [1, 4.7, -2.1, "silver"], [1, 4.7, 0.3, "gold"], [1, 4.7, 2.5, "silver"]];
  const R = 1.1;
  ISO.add({
    name: "cointray", title: "Change tray (part)", compare: null,
    about: "The shallow change tray on a shop counter, 14 × 10 cm, two rounded wells with a dimpled floor, and the coins handed back lying in it; coins sets how many (a new one drops in). anchors: top",
    line: "cointray cx cy k coins=0..10 lab=0 lit=tray|coins",
    demo: { line: "cointray 480 300 34 coins=2 lab=1", script: [{ set: {}, hold: 1 }, { set: { coins: 5, lit: "coins" }, hold: "settle" }, { set: { coins: 10 }, hold: "settle" }, { set: { coins: 0, lit: "tray" }, hold: "settle" }, { set: { coins: 3, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { want: Math.round(B.num(o, "coins", 2, 0, 10)), lit: o.lit || "" };
      st.shown = st.want;
      const plan = { x: -W / 2, y: -D / 2, w: W, d: D, r: 1.6 };
      const floorZ = H - DEEP, mouths = WELLS.map((p) => K.planOutline(p, H, P, 8));
      // a dimpled floor: rows of small dots that stay inside each well
      const dimples = (p) => { const pts = []; for (let x = p.x + 0.8; x < p.x + p.w - 0.6; x += 0.9) for (let y = p.y + 0.8; y < p.y + p.d - 0.6; y += 0.9) pts.push(K.iso([x, y, floorZ + 0.01], P)); return K.dotsSvg(pts, { size: 0.35, tone: "faint" }); };
      const coin = (i, lift = 0) => { const [, x, y, m] = SPOTS[i], z = floorZ + (i === 4 ? 0.2 : i === 6 ? 0.4 : 0) + lift; return B.coin(P, [x, y, z], R, 0.2, m, true, 30); };
      const clips = WELLS.map((p, i) => B.clip(mouths[i]));
      // the falling coin is seen through its well's mouth or anywhere above the tray's near edge
      const fallId = B.id(), fallClip = (wi) => `<clipPath id="${fallId}${wi}"><path d="${mouths[wi]}"/><path d="${B.above(P, [-W, D / 2, H], [W, D / 2, H])}"/></clipPath>`;
      const wellSvg = (p, i) => `<path d="${mouths[i]}" fill="#6f8392"/>${clips[i][1]}<path d="${K.planOutline(K.insetPlan(p, 0.5), floorZ, P, 8)}" fill="#a3b4c0"/>${dimples(p)}<g data-part="coins${i}"></g></g><path d="${mouths[i]}" fill="none" stroke="#2d3e4a" stroke-width="0.6"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, H, P)}"/><defs>${clips.map((c) => c[0]).join("")}${fallClip(0)}${fallClip(1)}</defs>` +
        `<g data-name="tray">${ISO.tinted(ISO.T.rubber, K.solidSvg(K.slabOf(K.insetPlan(plan, 0.4), 0, 0.2, P, 6), { tone: "lo" }))}` +
        `${ISO.tinted(TRAY, K.solidSvg(K.slabOf(plan, 0.2, H - 0.2, P, 6, 0.25), { tone: "mid" }))}${WELLS.map(wellSvg).join("")}</g>` +
        `<g data-name="coins" data-part="fall"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H] };
      const el = LAB.parts(g), w = ISO.writer(), o0 = K.iso([0, 0, 0], P), oz = K.iso([0, 0, 1], P);
      const draw = () => {
        const n = Math.floor(st.shown + 1e-6), f = st.shown - n;
        for (const wi of [0, 1]) w.rebuild(el["coins" + wi], `${n}`, () => `<g data-name="coins">${SPOTS.slice(0, n).map((s, i) => (s[0] === wi ? coin(i) : "")).join("")}</g>`);
        const falling = f > 0.002 && n < 10, lift = falling ? (1 - ISO.ease(f)) * 5 : 0;
        w.rebuild(el.fall, falling ? String(n) : "", () => (falling ? `<g clip-path="url(#${fallId}${SPOTS[n][0]})"><g data-part="drop">${coin(n)}</g></g>` : ""));
        if (falling) { const d = el.fall.querySelector("g[data-part=drop]"); w.attr(d, "transform", `translate(0 ${(-(oz[1] - o0[1]) * -lift).toFixed(2)})`); }
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([W / 2 + 0.5, 0, H + 1], P), "change tray", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.coins !== undefined) st.want = Math.round(B.num(p, "coins", st.want, 0, 10));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // coins drop in one at a time (about 0.35 s each); taking coins out lifts them away at once
      g.update = (dt) => {
        if (ISO.still() || st.want < st.shown) st.shown = st.want;
        else if (st.shown < st.want) st.shown = Math.min(st.want, st.shown + dt / 0.35);
        draw();
        return st.shown !== st.want;
      };
      g.readout = () => `change tray · ${st.want} coin${st.want === 1 ? "" : "s"} in it`;
      draw();
      return g;
    },
  });
})();
