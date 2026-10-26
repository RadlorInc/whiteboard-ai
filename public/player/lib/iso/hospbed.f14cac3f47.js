// "hospbed cx cy length head=0-70 rails=up|down brake=0|1 lab=1 lit=head|rail|brake|mattress|control" — a hospital bed.
// A base frame on four castors with brake pedals, two lifting columns, the upper frame and a deck in four parts with
// the mattress and pillow; headboard and footboard; split side rails (the head rails ride on the head section, the
// foot rails on the frame) and the hand control hanging on a rail. set({ head }) raises the head section about its
// hinge; set({ rails }) slides the rails up or down; set({ brake: 1 }) presses the brake pedals: red down means locked.
// The readout gives the head angle and what it is for (30° semi-Fowler, 45° Fowler).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Head end at -x; the long side facing you is +y.
  const X0 = -100, X1 = 100, HW = 44, DECK = 54, MT = 13, HINGE = -28, HEADL = 70, RAIL_DROP = 26;
  const FRAME = ISO.tint("#e7ebef", ["#a9b3bd", "#b9c2cb", "#c8d0d7", "#d6dce2"], "#3f4a55");
  const MATT = ISO.tint("#dbe9f5", ["#9fbbd4", "#b1c8dd", "#c2d4e6", "#d0deed"], "#2f5677");
  const PILLOW = ISO.tint("#fbfbfa", ["#d7d9dc", "#e1e3e5", "#eaebed", "#f2f3f4"], "#6b7480");
  const BOARD = ISO.tint("#e9e1d3", ["#bfae94", "#cdbea7", "#d9ccb8", "#e3d8c7"], "#5e5140");
  // the head section's frame: u toward the head along the deck, w up out of it, opened by angle th about the hinge
  const headAt = (th) => (u, w, y) => [HINGE - u * Math.cos(th) + w * Math.sin(th), y, DECK + u * Math.sin(th) + w * Math.cos(th)];
  const flatAt = (u, w, y) => [u, y, w];

  function baseSvg(P, brake) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: X0, y: -HW, w: X1 - X0, d: 2 * HW, r: 10 }, 0, 20, P)}"/>`];
    const casters = [[X0 + 12, -HW + 8], [X1 - 12, -HW + 8], [X0 + 12, HW - 8], [X1 - 12, HW - 8]].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    for (const [x, y] of casters) {
      out.push(ISO.tinted(ISO.T.rubber, S(G.disc(-2, 2, 6, G.frameAlong([x + 2, y, 6], [0, 1, 0]), P), { tone: "mid" })));
      out.push(ISO.tinted(FRAME, ISO.wbox(P, [x - 2.5, x + 6.5], [y - 3, -y > 0 ? y - 2.2 : y - 2.2], [6, 12], "mid") + ISO.wbox(P, [x - 2.5, x + 6.5], [y + 2.2, y + 3], [6, 12], "mid") + ISO.wbox(P, [x - 2.5, x + 6.5], [y - 3, y + 3], [12, 14], "mid")));
      // the brake pedal on the outside of the castor: tilted down when braked
      const a = brake ? -0.35 : 0.12, side = y > 0 ? 1 : -1;
      const ped = (u, w, yy) => [x - 4 + u, y + side * (3 + yy), 13 + w + u * Math.sin(a)];
      out.push(ISO.tinted(brake ? ISO.T.red : ISO.T.green, ISO.box(ped, P, [-6, 2], [-1, 1], [0, 5], "hi")));
    }
    // base frame: two long tubes, two cross tubes
    out.push(ISO.tinted(FRAME, ISO.wbox(P, [X0 + 6, X1 - 6], [-HW + 5, -HW + 11], [14, 19], "mid") + ISO.wbox(P, [X0 + 6, X0 + 18], [-HW + 5, HW - 5], [14, 19], "mid") + ISO.wbox(P, [X1 - 18, X1 - 6], [-HW + 5, HW - 5], [14, 19], "mid")));
    out.push(ISO.tinted(FRAME, ISO.wbox(P, [X0 + 6, X1 - 6], [HW - 11, HW - 5], [14, 19], "mid")));
    // lifting columns and the upper frame
    for (const x of [X0 + 40, X1 - 40]) out.push(ISO.tinted(FRAME, ISO.wbox(P, [x - 7, x + 7], [-10, 10], [19, DECK - 7], "mid") + ISO.wbox(P, [x - 9, x + 9], [-12, 12], [DECK - 16, DECK - 7], "mid")));
    out.push(ISO.tinted(FRAME, ISO.wbox(P, [X0 + 4, X1 - 4], [-HW + 2, HW - 2], [DECK - 7, DECK - 2], "mid")));
    return out.join("");
  }
  function boardSvg(P, x, top) {
    const t = 3, out = [];
    for (const y of [-HW + 2, HW - 6]) out.push(ISO.tinted(FRAME, ISO.wbox(P, [x - 2.5, x + 2.5], [y, y + 4], [DECK - 8, top], "mid")));
    out.push(ISO.tinted(BOARD, ISO.prismX(P, [[-HW + 1, DECK - 6], [HW - 1, DECK - 6], [HW - 1, top - 8], [HW - 9, top], [-HW + 9, top], [-HW + 1, top - 8]], x - t / 2, x + t / 2, ["#bfae94", "#e3d8c7"], "#e9e1d3", "#5e5140")));
    return out.join("");
  }
  // The flat part of the deck and mattress (seat, knee, foot), from the hinge to the foot.
  function flatSvg(P) {
    return ISO.tinted(FRAME, ISO.wbox(P, [HINGE, X1 - 6], [-HW + 3, HW - 3], [DECK - 2, DECK], "mid")) +
      ISO.tinted(MATT, S(K.slabOf({ x: HINGE, y: -HW + 4, w: X1 - 8 - HINGE, d: 2 * HW - 8, r: 4 }, DECK, MT, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam({ x: HINGE, y: -HW + 4, w: X1 - 8 - HINGE, d: 2 * HW - 8, r: 4 }, DECK + MT / 2, P, 4), { tone: "faint" }) }));
  }
  // A side rail at side y, built in frame `at` from u0 to u1 (along), lowered by drop.
  function railSvg(P, at, u0, u1, y, drop) {
    const z0 = MT - 6 - drop, z1 = MT + 22 - drop, out = [];
    out.push(ISO.tinted(FRAME, ISO.box(at, P, [u0, u1], [z1 - 3.4, z1], [y - 1.4, y + 1.4], "mid")));
    out.push(ISO.tinted(FRAME, ISO.box(at, P, [u0, u1], [z0, z0 + 3], [y - 1.4, y + 1.4], "mid")));
    for (let k = 0; k <= 4; k++) { const u = u0 + 3 + (k * (u1 - u0 - 6)) / 4; out.push(ISO.tinted(FRAME, ISO.box(at, P, [u - 1, u + 1], [z0 + 3, z1 - 3.4], [y - 1, y + 1], "mid"))); }
    return out.join("");
  }
  // The head section at angle th: deck, mattress, pillow, the wedge that fills the bend, the head rails.
  function headSvg(P, th, drop, side) {
    const at = headAt(th), out = [];
    if (side === "far") return railSvg(P, at, 8, HEADL - 10, -HW - 1.6, drop);
    if (side === "near") return railSvg(P, at, 8, HEADL - 10, HW + 1.6, drop);
    out.push(ISO.tinted(FRAME, ISO.box(at, P, [0, HEADL - 4], [-2, 0], [-HW + 3, HW - 3], "mid")));
    out.push(ISO.tinted(MATT, ISO.box(at, P, [0, HEADL - 6], [0, MT], [-HW + 4, HW - 4], "mid")));
    if (th > 0.01) {
      const a = at(0, MT, 0), V = [[HINGE, -HW + 4, DECK], [HINGE, -HW + 4, DECK + MT], [a[0], -HW + 4, a[2]], [HINGE, HW - 4, DECK], [HINGE, HW - 4, DECK + MT], [a[0], HW - 4, a[2]]];
      out.push(ISO.tinted(MATT, ISO.poly(V, [[0, 1, 2], [3, 4, 5], [1, 2, 5, 4], [0, 1, 4, 3], [0, 2, 5, 3]], P, "mid")));
    }
    out.push(ISO.tinted(PILLOW, ISO.box(at, P, [HEADL - 34, HEADL - 10], [MT, MT + 8], [-HW + 12, HW - 12], "hi")));
    return out.join("");
  }
  function controlSvg(P, drop) {
    // the hand control hangs on the near foot rail by its hook
    const x = 30, y = HW + 3.8, z = DECK + MT + 18 - drop;
    return ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 4, x + 4], [y - 1.4, y + 1.4], [z - 22, z - 6], "hi")) + ISO.tinted(FRAME, ISO.wbox(P, [x - 1, x + 1], [y - 2.6, y + 1.4], [z - 6, z + 2.4], "mid")) +
      D([[x - 1.8, z - 10], [x + 1.8, z - 10], [x - 1.8, z - 14], [x + 1.8, z - 14], [x - 1.8, z - 18], [x + 1.8, z - 18]].map(([a, b]) => K.iso([a, y + 1.45, b], P)), { size: 0.9, tone: "hi" });
  }

  ISO.add({
    name: "hospbed", title: "Hospital bed", compare: "hospbed 480 270 400",
    about: "A hospital bed: the head section rises about its hinge, the side rails slide up, and the castor brake pedals lock the wheels.",
    line: "hospbed cx cy length head=0-70 rails=up|down brake=0|1 lab=1 lit=head|rail|brake|mattress|control",
    demo: { line: "hospbed 480 270 400 head=0 rails=down brake=0", script: [{ set: { brake: 1, lit: "brake" }, hold: "settle" }, { set: { rails: "up", lit: "rail" }, hold: "settle" }, { set: { head: 30, lit: "head" }, hold: "settle" }, { set: { head: 45 }, hold: "settle" }] },
    make([cx, cy, length = 400], o, t, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = length * 1.3, H = length * 0.88;
      const pts = [[X0, -HW, 0], [X1, HW, 0], [X0, HW, 0], [X1, -HW, 0], [X0, 0, 108], [X1, 0, 92], [HINGE - 75 * Math.cos(1.2), HW + 2, DECK + 75 * Math.sin(1.2) + 30]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 62, elevation: 24 }, parent);
      g.innerHTML = `<g data-name="brake"></g><g>${boardSvg(P, X0 + 2, 108)}</g><g data-name="rail-far"></g><g data-name="rail-farfoot"></g><g data-name="mattress">${flatSvg(P)}</g><g data-name="head"></g>` +
        `<g data-name="rail-nearfoot"></g><g data-name="rail-near"></g><g data-name="control"></g><g>${boardSvg(P, X1 - 2, 92)}</g><g data-part="words"></g>`;
      const nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const s = { head: ISO.clamp(ISO.num(o, "head", 30), 0, 70), th: 0, rails: o.rails !== "down", r: 0, brake: o.brake !== "0", b: 0, lit: o.lit || "" };
      s.th = s.head; s.r = s.rails ? 0 : 1; s.b = s.brake ? 1 : 0;
      if (lab) {
        const word = (p, txt, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 14, dy }); };
        g.querySelector('[data-part="words"]').innerHTML = word([X0 + 12, HW, 0], "Brake pedal", "middle", 26) + word([X1 - 2, 0, 92], "Footboard", "middle", -8) +
          word([X0 + 2, 0, 108], "Headboard", "middle", -8) + word([40, HW + 2, DECK + MT + 22], "Side rail", "start", -6, 6);
      }
      const draw = () => {
        const th = (s.th * Math.PI) / 180, drop = s.r * RAIL_DROP;
        w.rebuild(nm("brake"), s.b > 0.5 ? "on" : "off", () => baseSvg(P, s.b > 0.5));
        const key = `${s.th.toFixed(2)} ${drop.toFixed(2)}`;
        w.rebuild(nm("head"), key, () => headSvg(P, th, drop));
        w.rebuild(nm("rail-far"), key, () => headSvg(P, th, drop, "far"));
        w.rebuild(nm("rail-near"), key, () => headSvg(P, th, drop, "near"));
        w.rebuild(nm("rail-farfoot"), drop.toFixed(2), () => railSvg(P, (u, ww, y) => [u, y, DECK + ww], 2, 62, -HW - 1.6, drop));
        w.rebuild(nm("rail-nearfoot"), drop.toFixed(2), () => railSvg(P, (u, ww, y) => [u, y, DECK + ww], 2, 62, HW + 1.6, drop));
        w.rebuild(nm("control"), drop.toFixed(2), () => controlSvg(P, drop));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
      };
      g.set = (p) => {
        if (p.head !== undefined) s.head = ISO.clamp(+p.head, 0, 70);
        if (p.rails !== undefined) s.rails = p.rails !== "down";
        if (p.brake !== undefined) s.brake = !!+p.brake;
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // the head motor runs at about 6° a second; rails and pedals ease
        s.th = calm ? s.head : Math.abs(s.head - s.th) < 6 * dt ? s.head : s.th + Math.sign(s.head - s.th) * 6 * dt;
        s.r = ISO.follow(s.r, s.rails ? 0 : 1, dt, 0.25, calm);
        s.b = ISO.follow(s.b, s.brake ? 1 : 0, dt, 0.15, calm);
        draw();
        return s.th !== s.head || Math.abs(s.r - (s.rails ? 0 : 1)) > 1e-3 || Math.abs(s.b - (s.brake ? 1 : 0)) > 1e-3;
      };
      g.readout = () => {
        const a = Math.round(s.th), use = a >= 45 ? "Fowler: sitting up to eat or breathe more easily" : a >= 30 ? "semi-Fowler: eases breathing, lowers the risk of choking on reflux" : a >= 15 ? "slightly raised" : "flat";
        return `head of bed ${a}° · ${use} · rails ${s.rails ? "up" : "down"} · brakes ${s.brake ? "on: the bed can't roll" : "off: free to roll"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
