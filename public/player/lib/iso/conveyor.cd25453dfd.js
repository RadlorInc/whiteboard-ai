// "conveyor cx cy length run=1 speed=0.5 boxes=3 lab=1 lit=belt|head|tail|motor|rollers|boxes" — a belt conveyor.
// A rubber belt runs over a driven head drum and a tail drum on two steel side channels, carried on idler rollers and
// brought back underneath on return rollers. A geared motor hangs on the head drum's shaft (a torque arm holds the
// gearbox from turning). Boxes ride on the top run from the tail to the head. Belt speed v = π · D · n: a 180 mm drum
// at 53 rpm moves the belt 0.5 m/s, and boxes 1 m apart arrive at v/1 m × 60 = 30 a minute. 1 unit = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HL = 150, BW = 30, CH = [30, 34], DZ = 70, DR = 9, TOP = 80, BOX = [40, 36, 28], GAP = 100, TAU = Math.PI * 2;
  const FLOOR = { x: -176, y: -56, w: 352, d: 128, r: 6 };
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const steel = (svg) => ISO.tinted(ISO.T.steel, svg), blue = (svg) => ISO.tinted(ISO.T.paint, svg);
  const LEGS = [-128, 0, 128];

  function legSvg(P, y) {
    const out = [];
    for (const x of LEGS) {
      out.push(steel(S(K.slabOf({ x: x - 7, y: y - 7, w: 14, d: 14, r: 1 }, 0, 1.5, P, 2), { tone: "lo" })));
      out.push(blue(ISO.wbox(P, [x - 3, x + 3], [y - 3, y + 3], [1.5, CH[0] + 34], "mid")));
      out.push(D([K.iso([x - 5, y + 5, 1.5], P), K.iso([x + 5, y + 5, 1.5], P)], { size: 0.6 }));
    }
    // a stringer along the bottom ties the legs of one side
    for (let i = 0; i < 2; i++) out.push(blue(ISO.wbox(P, [LEGS[i] + 3, LEGS[i + 1] - 3], [y - 2, y + 2], [18, 22], "mid")));
    return out.join("");
  }
  function channelSvg(P, y0, y1, front) {
    const out = [blue(ISO.wbox(P, [-HL, HL], [y0, y1], [CH[0] + 34, TOP - 2], "hi"))];
    // idler shaft ends bolted through the channel's web, one every 30 cm
    if (front) out.push(D(Array.from({ length: 9 }, (_, i) => K.iso([-120 + i * 30, y1, 74], P)), { size: 0.9, tone: "mid" }));
    return out.join("");
  }
  // a pillow-block bearing on the channel's outside, round the drum shaft
  function bearingSvg(P, x, y, side) {
    const y0 = side > 0 ? y : y - 8, y1 = side > 0 ? y + 8 : y;
    return steel(ISO.wbox(P, [x - 9, x + 9], [y0, y1], [60, 64], "mid")) + steel(S(G.disc(y0, y1, 6, yAx([x, 0, DZ]), P), { tone: "hi" })) + D([K.iso([x - 6, y1, 64], P), K.iso([x + 6, y1, 64], P)], { size: 0.6 });
  }
  function drumSvg(P, x) {
    const F = yAx([x, 0, DZ]);
    return steel(S(G.disc(-BW, BW, DR - 1, F, P), { tone: "mid" })) + ISO.tinted(ISO.T.rubber, S(G.ringBand(-BW, BW, DR - 0.6, DR + 1, F, P), { tone: "hi" }));
  }
  function motorSvg(P) {
    const out = [], gx = HL, y0 = 42, y1 = 58;
    // shaft-mounted gearbox, its torque arm down to the leg, and the motor along the channel with cooling fins
    const F = G.frameOf([gx - 12, 50, 62], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(blue(S(G.solidOf([[0, 9], [6, 9], [6, 8, 1], [38, 8, 1], [40, 7], [46, 6.5, 1], [48, 3]], F, P), { tone: "hi" }) + K.fadedSvg(G.ribsOf(F, 6, 38, 8.05, 26, P, { fade: [0.1, 0.5], seams: true }), { tone: "lo" })));
    out.push(blue(ISO.wbox(P, [gx - 32, gx - 22], [45, 55], [70, 76], "hi")));
    out.push(blue(ISO.wbox(P, [gx - 12, gx + 12], [y0, y1], [52, 84], "hi")), D([[gx - 9, 56], [gx + 9, 56], [gx - 9, 80], [gx + 9, 80]].map(([x, z]) => K.iso([x, y1, z], P)), { size: 0.6 }));
    out.push(steel(ISO.wbox(P, [gx - 2, gx + 2], [y0 + 6, y0 + 10], [1.5, 52], "mid")), steel(S(K.slabOf({ x: gx - 7, y: y0 + 1, w: 14, d: 14, r: 1 }, 0, 1.5, P, 2), { tone: "lo" })), D([K.iso([gx - 5, y0 + 13, 1.5], P), K.iso([gx + 5, y0 + 13, 1.5], P)], { size: 0.6 }));
    return out.join("");
  }
  const boxSvg = (P, x, y) => {
    const [w, d, h] = BOX;
    return ISO.tinted(ISO.T.wood, ISO.wbox(P, [x - w / 2, x + w / 2], [y - d / 2, y + d / 2], [TOP, TOP + h], "hi")) +
      ISO.seam(P, [[x - w / 2, y, TOP + h], [x + w / 2, y, TOP + h]], "#b08850", 3.2) + ISO.seam(P, [[x + w / 2, y, TOP + h], [x + w / 2, y, TOP + h - 8]], "#b08850", 3.2);
  };

  ISO.add({
    name: "conveyor", title: "Belt conveyor", compare: "conveyor 480 280 500",
    about: "A belt conveyor: a geared motor turns the head drum, the rubber belt runs over idlers and back underneath, and boxes ride from the tail to the head.",
    line: "conveyor cx cy length run=1 speed=0.5 boxes=3 lab=1 lit=belt|head|tail|motor|rollers|boxes",
    demo: { line: "conveyor 480 285 500", script: [{ set: { run: 1 }, hold: 5 }, { set: { lit: "motor" }, hold: 2.5 }, { set: { run: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 500], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.6, H = size * 0.86;
      const speed = ISO.clamp(ISO.num(o, "speed", 0.5), 0.1, 2), nBox = Math.round(ISO.clamp(ISO.num(o, "boxes", 3), 0, 3));
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -4, 0), [-HL - DR, 0, TOP + BOX[2]], [HL + DR, 0, TOP + BOX[2]]], cx, cy, W, H, { azimuth: 62, elevation: 24, pad: 6 }, parent);
      const st = (svg) => `<g>${svg}</g>`;
      const back = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -4, 4, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -4, 4, P, 4, 0.6), { tone: "lo" })), legSvg(P, -32)];
      // return run under the frame: its rollers hang from brackets under the channels
      const rollers = [];
      for (const x of [-64, 64]) {
        rollers.push(blue(ISO.wbox(P, [x - 2, x + 2], [-CH[1], -CH[0]], [54, CH[0] + 34], "mid")));
        rollers.push(steel(S(G.disc(-CH[0], CH[0], 3.2, yAx([x, 0, DZ - DR - 1 - 3.2]), P), { tone: "hi" })));
      }
      // carrying idlers under the top run, every 30 cm (hidden by the belt; their shaft ends show as bolts)
      for (let i = 0; i < 9; i++) rollers.push(steel(S(G.disc(-CH[0], CH[0], 3, yAx([-120 + i * 30, 0, TOP - 1 - 3]), P), { tone: "hi" })));
      back.push(named("rollers", rollers.join("")));
      back.push(named("belt", ISO.tinted(ISO.T.rubber, S(K.slabOf({ x: -HL, y: -BW, w: HL * 2, d: BW * 2, r: 0 }, DZ - DR - 1, 1, P, 2), { tone: "hi" }))));
      back.push(bearingSvg(P, -HL, -CH[1], -1), bearingSvg(P, HL, -CH[1], -1), channelSvg(P, -CH[1], -CH[0], false));
      back.push(named("tail", drumSvg(P, -HL)));
      back.push(named("belt", ISO.tinted(ISO.T.rubber, S(K.slabOf({ x: -HL, y: -BW, w: HL * 2, d: BW * 2, r: 0 }, TOP - 1, 1, P, 2), { tone: "hi" }))));
      const front = [named("head", drumSvg(P, HL)), channelSvg(P, CH[0], CH[1], true), bearingSvg(P, -HL, CH[1], 1), bearingSvg(P, HL, CH[1], 1), legSvg(P, 32)];
      for (const x of [-64, 64]) front.push(blue(ISO.wbox(P, [x - 2, x + 2], [CH[0], CH[1]], [54, CH[0] + 34], "mid")));
      front.push(named("motor", motorSvg(P)));
      const k = K.cameraOf(P).k;
      const words = !lab ? "" : [
        ISO.word(K.iso([HL, 52, 52], P), "motor + gearbox", "#555", { size: 14, dy: 22 }),
        ISO.word(K.iso([-HL, 40, DZ - DR], P), "tail drum", "#555", { size: 14, anchor: "end", dy: 12 }),
        ISO.word(K.iso([HL + DR, -20, DZ + 6], P), "head drum", "#555", { size: 14, anchor: "start", dy: -14 }),
        ISO.word(K.iso([-HL + 70, BW, TOP], P), "belt", "#555", { size: 14, dy: 16 }),
      ].join("");
      g.innerHTML = st(back.join("")) + `<g data-name="belt"><path data-part="marks" fill="none" stroke="#9aa0a7" stroke-width="${(1.2 * k).toFixed(2)}"/></g><g data-name="tail"><g data-part="tailmark"></g></g>` +
        `<g data-name="boxes" data-part="boxes"></g>` + st(front.join("")) + `<g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const s = { on: o.run === "1", w: o.run === "1" ? 1 : 0, x: 0 };
      let lit = o.lit || "";
      const boxCache = new Map();
      const draw = () => {
        const q = Math.round(s.x * 2) / 2;                                        // belt travel, quantised to 5 mm
        // marks across the belt every 20 cm, moving with it (they run edge to edge of the belt)
        const off = ((q % 20) + 20) % 20, m = [];
        for (let x = -HL + off; x <= HL; x += 20) m.push(K.pathOf([K.iso([x, -BW, TOP + 0.02], P), K.iso([x, BW, TOP + 0.02], P)]));
        w.attr(el.marks, "d", m.join(""));
        // a mark on each drum's shaft end turns with the belt: angle = travel / radius
        const a = -q / DR;
        const mark = (x, y) => `<path d="${K.pathOf([K.iso(G.pointOf(yAx([x, 0, DZ]), y, 0, a), P), K.iso(G.pointOf(yAx([x, 0, DZ]), y, 5, a), P)])}" stroke="#c4382c" stroke-width="${(1.4 * k).toFixed(2)}" stroke-linecap="round"/>`;
        w.rebuild(el.tailmark, q.toFixed(1), () => mark(-HL, CH[1] + 8.05));
        // boxes 1 m apart from the tail to the head, appearing and leaving with a fade at the ends
        const span = GAP * 3, list = [];
        for (let i = 0; i < nBox; i++) list.push(-HL + 4 + ((((q + i * GAP) % span) + span) % span));
        w.rebuild(el.boxes, q.toFixed(1), () => list.sort((a1, b1) => a1 - b1).map((x) => {
          const fade = Math.min(ISO.smooth(-HL + 4, -HL + 40, x), 1 - ISO.smooth(HL - 40, HL - 4 + 20, x));
          const key = x.toFixed(1);
          if (!boxCache.has(key)) boxCache.set(key, boxSvg(P, x, -2));
          return `<g opacity="${fade.toFixed(2)}">${boxCache.get(key)}</g>`;
        }).join(""));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.run !== undefined) s.on = !!+p.run; if (p.lit !== undefined) lit = p.lit; };
      // the motor brings the belt up to speed in about a second and coasts down when stopped
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.w = ISO.follow(s.w, target, dt, 0.45, ISO.still());
        if (s.w < 0.002 && !s.on) s.w = 0;
        if (!ISO.still()) s.x += s.w * speed * 100 * 0.5 * dt;                       // shown at half speed
        draw();
        return s.w !== target || s.w > 0;
      };
      g.readout = () => {
        const v = speed * s.w, n = (v * 60) / (Math.PI * 0.18);
        return `belt ${v.toFixed(2)} m/s = π × 0.18 m drum × ${n.toFixed(0)} rpm · motor 1440 rpm through a ${(1440 / ((speed * 60) / (Math.PI * 0.18))).toFixed(0)}:1 gearbox · boxes 1 m apart → ${(v * 60).toFixed(0)} a minute`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
