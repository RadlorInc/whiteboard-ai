// "brakes cx cy size press=0|1 lab=1 lit=disc|caliper|pads|hub|hose" — a car's disc brake on its hub.
// The vented disc (two plates joined by vanes, a ring of cross-drilled holes) turns with the hub and its five studs.
// A red sliding caliper straddles the disc's edge: its piston side behind, its fingers in front, a pad on each side,
// the brake hose and bleed nipple on the piston side, all on a bracket bolted to the steering knuckle. Pressing the
// pedal sends fluid at 42 bar: the 54 mm piston pushes the inner pad onto the disc and the caliper slides to pull the
// outer pad on too, clamping it with 9.7 kN; the disc stops in about 2½ s from 50 km/h. The pad gaps (really about
// 0.2 mm) are drawn 25× wider so you can see them close. set({ press }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const ZC = 24, R = 14, T = 1.2, TH = (38 * Math.PI) / 180, GAP = 0.5, V0 = 50;
  const PEDAL = 300, RATIO = 4, MASTER = 2.84, PISTON = 22.9, MU = 0.4, RE = 0.115, DECEL = 5.8;
  const pressure = (PEDAL * RATIO) / (MASTER * 1e-4);                   // Pa
  const clamp = pressure * PISTON * 1e-4;                               // N
  const torque = 2 * MU * clamp * RE;                                   // N·m
  const RED = ISO.tint("#f2b1a8", ["#a3271b", "#b8382a", "#cc4a3a", "#dc5f4f"], "#5e120a");
  const STEEL = ISO.T.steel, RUBBER = ISO.T.rubber;
  const DISC = ISO.tint("#d5d6d8", ["#7d8086", "#90939a", "#a4a7ad", "#b8babf"], "#34373c");
  const BASE = { x: -20, y: -19, w: 40, d: 28, r: 4 };
  const F0 = G.frameOf([0, 0, ZC], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const rad = [Math.cos(TH), 0, Math.sin(TH)], tan = [-Math.sin(TH), 0, Math.cos(TH)];
  // A box in the caliper's frame: u along the disc's turn, w out from the axle, y through the disc.
  const cal = (P, [u0, u1], [w0, w1], [y0, y1], tone = "hi") => ISO.box((u, w, y) => [rad[0] * w + tan[0] * u, y, ZC + rad[2] * w + tan[2] * u], P, [u0, u1], [w0, w1], [y0, y1], tone);
  const at = (u, w, y) => [rad[0] * w + tan[0] * u, y, ZC + rad[2] * w + tan[2] * u];

  function standSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, -5, 5, P)}"/>`, S(K.slabOf(BASE, -5, 5, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(BASE, -2.5, P, 4), { tone: "faint" }) }), L(K.planOutline(K.insetPlan(BASE, 3), 0, P), { tone: "faint" })];
    // the steering knuckle: an upright casting behind the disc, the spindle boss, and the bracket arm to the caliper
    out.push(ISO.wbox(P, [-5, 5], [-14, -9], [0, ZC + 10], "mid"));
    out.push(S(G.disc(-9, -5.5, 4.6, F0, P), { tone: "mid" }));
    out.push(ISO.box((u, w, y) => [rad[0] * w + tan[0] * u, y, ZC + rad[2] * w + tan[2] * u], P, [-6, 6], [4, R - 2], [-9, -7.4], "mid"));
    out.push(D([[-4, ZC + 7], [4, ZC + 7], [-4, 4], [4, 4]].map(([x, z]) => K.iso([x, -9, z], P)), { size: 0.55, tone: "hi" }));
    // dust shield: a thin plate just behind the disc
    out.push(S(G.disc(-3.4, -3, R + 0.6, F0, P), { tone: "lo" }));
    return out.join("");
  }
  // Behind the disc: the caliper's piston side, the bracket ears, the hose with its banjo bolt and the bleed nipple.
  function calBackSvg(P) {
    const out = [ISO.tinted(STEEL, cal(P, [-7.5, 7.5], [R - 6.2, R - 4.6], [-7.4, -1.6], "mid"))];
    out.push(ISO.tinted(RED, cal(P, [-5.6, 5.6], [R - 5, R + 1.4], [-6.6, -2.9 - GAP])));
    const nip = at(-3.2, R + 1.4, -4.6);
    out.push(ISO.tinted(STEEL, S(G.disc(0, 1.6, 0.6, G.frameAlong(nip, rad), P), { tone: "hi" }) + S(G.disc(1.6, 2.1, 0.8, G.frameAlong(nip, rad), P), { tone: "mid" })));
    const banjo = at(2.6, R + 1.4, -4.6);
    out.push(ISO.tinted(STEEL, S(G.prismOf(G.frameAlong(banjo, rad), Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * 1, Math.sin(i * 1.047) * 1]), 0, 1, P), { tone: "mid" })));
    // the rubber hose rises from the banjo to a crimped ferrule, and a steel line runs on to a nut on the knuckle
    const h0 = G.add3(banjo, G.mul3(rad, 1)), h1 = G.add3(banjo, G.mul3(rad, 5.4)), top = [0, -11.5, ZC + 10];
    out.push(ISO.tinted(RUBBER, S(G.disc(0, 4.4, 0.6, G.frameAlong(h0, rad), P), { tone: "hi" })));
    out.push(ISO.tinted(STEEL, S(G.disc(0, 1.2, 0.75, G.frameAlong(h1, rad), P), { tone: "mid" })));
    const h2 = G.add3(h1, G.mul3(rad, 1.2)), seg = G.sub3(top, h2), len = G.len3(seg);
    out.push(ISO.tinted(STEEL, S(G.sphereOf(h2, 0.45, P), { tone: "mid" }) + S(G.disc(0, len, 0.3, G.frameAlong(h2, G.unit3(seg)), P), { tone: "hi" }) +
      S(G.prismOf(G.frameAlong(top, [0, 0, 1]), Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * 0.8, Math.sin(i * 1.047) * 0.8]), -0.8, 0, P), { tone: "mid" })));
    return out.join("");
  }
  // The pads: friction block on a steel backing plate; side −1 inner, +1 outer; off = how far each stands off the disc.
  function padSvg(P, side, off) {
    const y0 = side * (T + off), y1 = side * (T + off + 1.1), y2 = side * (T + off + 1.6);
    return ISO.tinted(ISO.tint("#8a8378", ["#4b463f", "#57524a", "#635d55", "#6f6960"], "#2a2622"), cal(P, [-4.4, 4.4], [R - 4.2, R - 0.5], side > 0 ? [y0, y1] : [y1, y0])) +
      ISO.tinted(STEEL, cal(P, [-5, 5], [R - 4.6, R], side > 0 ? [y1, y2] : [y2, y1], "mid"));
  }
  // In front: the bridge over the disc's edge and the two fingers that hold the outer pad, with the guide-pin boots.
  function calFrontSvg(P, slide) {
    const y = -slide;
    const out = [ISO.tinted(RED, cal(P, [-5.6, 5.6], [R + 0.8, R + 3.2], [-6.6 + y, T + GAP + 3.4 + y]))];
    for (const u of [-4.4, 1.2]) out.push(ISO.tinted(RED, cal(P, [u, u + 3.2], [R - 4.4, R + 0.8], [T + GAP + 1.6 + y, T + GAP + 3.4 + y])));
    out.push(ISO.tinted(RUBBER, S(G.disc(0, 2.4, 0.9, G.frameAlong(at(-6.6, R - 5.4, -5 + y), tan), P), { tone: "hi" })));
    return out.join("");
  }
  // The disc: its body once, and what turns on it at turn a (vanes on the edge between seams, the drilled holes).
  function discBody(P) {
    return ISO.tinted(DISC, S(G.disc(-T, T, R, F0, P), { tone: "hi" }) + L(G.circleOf(F0, T, R - 0.4, P) + G.circleOf(F0, T, R - 4.5, P), { tone: "faint" }));
  }
  function discTurn(P, a) {
    const holes = [];
    for (let i = 0; i < 24; i++) holes.push(K.iso(G.pointOf(F0, T, i % 2 ? 10.6 : 12.2, a + (i * Math.PI) / 12), P));
    return ISO.tinted(DISC, K.fadedSvg(G.ribsOf(F0, -0.4, 0.4, R, 40, P, { phase: a, fade: [0.1, 0.5], seams: true }), { tone: "lo" }) + `<g style="--anatomy-dot:#3b3e44">${D(holes, { size: 1.1, tone: "hi" })}</g>`);
  }
  function hubBody(P) {
    return ISO.tinted(STEEL, S(G.solidOf([[T, 7.2], [2.4, 7.2], [2.4, 6.4], [3.8, 6.4]], F0, P), { tone: "mid", inner: L(G.arcOf(F0, 1.8, 7.2, P), { tone: "faint" }) }) + L(G.circleOf(F0, 3.8, 2.6, P), { tone: "lo" }) + S(G.disc(3.8, 5, 1.8, F0, P), { tone: "hi" }) + L(G.circleOf(F0, 5, 0.9, P), { tone: "lo" }));
  }
  function hubTurn(P, a) {
    const out = [];
    for (let k = 0; k < 5; k++) { const c = G.pointOf(F0, 0, 5, a + (k * 2 * Math.PI) / 5); out.push(S(G.disc(3.8, 6, 0.62, G.frameOf(c, [0, 1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 16 }), { tone: "hi" })); }
    return ISO.tinted(STEEL, out.join(""));
  }

  ISO.add({
    name: "brakes", title: "Disc brake", compare: "brakes 470 270 320",
    about: "A disc brake on its hub: pressing the pedal pushes the caliper's piston, the pads squeeze the spinning disc from both sides and it stops.",
    line: "brakes cx cy size press=0|1 lab=1 lit=disc|caliper|pads|hub|hose",
    demo: { line: "brakes 470 270 320", script: [{ set: {}, hold: 1.6 }, { set: { press: 1 }, hold: "settle" }, { set: { press: 0 }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", BW = size * 2.3, BH = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -8, 0), [-R, 0, ZC + R + 1], [R, 0, ZC + R + 1], ...[[-6, R + 4, 5], [6, R + 4, -7]].map(([u, w, y]) => at(u, w, y))], cx, cy, BW, BH, { azimuth: 58, elevation: 22 }, parent);
      const names = ["stand", "calback", "padin", "discbody", "disc", "padout", "calfront", "hubbody", "hub", "words"];
      g.innerHTML = names.map((n) => `<g data-k="${n}"></g>`).join("");
      const el = Object.fromEntries(names.map((n) => [n, g.querySelector(`[data-k="${n}"]`)])), w = ISO.writer();
      el.stand.innerHTML = standSvg(P); el.calback.innerHTML = calBackSvg(P); el.discbody.innerHTML = discBody(P); el.hubbody.innerHTML = hubBody(P);
      const s = { press: +(o.press === "1"), v: o.press === "1" ? 0 : V0, a: 0 }, goal = { press: s.press };
      let lit = o.lit || "";
      const STEP = Math.PI / 60, discCache = [], hubCache = [];
      const parts = { disc: [el.discbody, el.disc], caliper: [el.calback, el.calfront], pads: [el.padin, el.padout], hub: [el.hubbody, el.hub], hose: [el.calback] };
      const draw = () => {
        const off = GAP * (1 - s.press), key = off.toFixed(3);
        w.rebuild(el.padin, key, () => padSvg(P, -1, off));
        w.rebuild(el.padout, key, () => padSvg(P, 1, off));
        w.rebuild(el.calfront, key, () => calFrontSvg(P, GAP - off));
        // the disc's texture repeats every 30° and the studs every 72° (3° steps), each built once and kept
        const dk = Math.round((s.a % (Math.PI / 6)) / STEP) % 10, hk = Math.round((s.a % (0.4 * Math.PI)) / STEP) % 24;
        w.rebuild(el.disc, String(dk), () => discCache[dk] || (discCache[dk] = discTurn(P, dk * STEP)));
        w.rebuild(el.hub, String(hk), () => hubCache[hk] || (hubCache[hk] = hubTurn(P, hk * STEP)));
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" : [
          ISO.word(K.iso(at(0, R + 3.4, 0), P), "caliper", "#8f2a22", { anchor: "start", size: 15, dy: -6 }),
          ISO.word(K.iso([-R * 0.7, T, ZC - R * 0.75], P), "disc", "#444", { anchor: "end", size: 15, dy: 8 }),
          ISO.word(K.iso(at(5.6, R - 3, T + 3), P), "pads", "#444", { anchor: "start", size: 15, dy: 10 }),
          ISO.word(K.iso([0, 6, ZC - 6], P), "hub", "#444", { size: 14, dy: 14 })].join(""));
        const want = lit || (s.press > 0.05 && s.press < 0.95 ? "pads" : s.press >= 0.95 && s.v > 0 ? "pads" : "disc");
        w.light(Object.values(parts).flat(), parts[want] || []);
      };
      g.set = (p) => { if (p.press !== undefined) goal.press = +p.press ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.press = ISO.follow(s.press, goal.press, dt, 0.12, calm);
        if (Math.abs(s.press - goal.press) < 2e-3) s.press = goal.press;
        // clamped, the disc slows at 5.8 m/s² (0.6 g); released, it is driven back up to speed
        const vms = s.v / 3.6, next = s.press >= 0.98 ? Math.max(0, vms - DECEL * dt) : goal.press ? vms : Math.min(V0 / 3.6, vms + 4 * dt);
        s.v = calm ? (goal.press ? 0 : V0) : next * 3.6;
        // the drawing turns at a calm 1/12 of the real 420 rpm, so the holes don't strobe
        s.a += (s.v / 3.6 / 0.32) * dt / 12;
        draw();
        return s.press !== goal.press || (goal.press ? s.v > 0 : false);
      };
      g.readout = () => {
        if (s.press < 0.5) return `pedal up · disc spinning at ${Math.round(s.v)} km/h · pads stand 0.2 mm off it`;
        return `pedal ${PEDAL} N · fluid at ${Math.round(pressure / 1e5)} bar · pads clamp ${(clamp / 1000).toFixed(1)} kN · friction ${Math.round(torque)} N·m · ${s.v > 0 ? `slowing: ${Math.round(s.v)} km/h` : "stopped"}`;
      };
      draw();
      if (t) label(parent, cx, cy - BH / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
