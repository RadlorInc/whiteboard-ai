// "plug cx cy height k=plug|socket in=0|1 sw=0|1 lab=1 lit=plug|socket|switch|earth|live|neutral" — plug and socket.
// A 6 A three-pin plug (Indian IS 1293 style) on its cord, in front of a wall socket with its own switch, above the
// skirting board. The socket's three holes have brass spring contacts that grip the pins; the earth hole on top is
// bigger and the earth pin longer, so earth connects first and lets go last. The live and neutral pins wear
// insulating sleeves at their roots, so no bare metal shows while the pins go in. The switch breaks the live wire:
// only with the plug in and the switch on does current flow (230 V; the red lamp shows the socket is on).
// k=socket draws the socket alone. set({ in, sw, lit }). World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const PF = 9, SX = 22, SZ = 104, TRAVEL = 64, SIDE = 84;      // plate face, socket centre, how far out and to the side the plug starts
  // the plug's offset from home for in = 0..1: first slid across in front of the socket, then pushed straight in
  const offOf = (i) => [SIDE * (1 - ISO.ease(ISO.clamp(i * 2, 0, 1))), TRAVEL * (1 - ISO.ease(ISO.clamp(i * 2 - 1, 0, 1)))];
  const PINS = { live: { x: 9.5, z: -6, r: 2.5, len: 15, sleeve: 8 }, neutral: { x: -9.5, z: -6, r: 2.5, len: 15, sleeve: 8 }, earth: { x: 0, z: 16, r: 3.5, len: 20, sleeve: 0 } };
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const WHITE = ISO.tint("#fbfbf8", ["#c9c9c2", "#d6d6cf", "#e2e2db", "#ecece6"], "#6f6f66"), WALL = ISO.tint("#f1ede4", ["#cfc8b8", "#d8d2c4", "#e1dccf", "#e9e5da"], "#8a8270");
  // the plug's face outline (x, z about the socket centre): a rounded shield, wider at the top
  const BODY = (() => { const pts = []; const c = [[-21, 22], [21, 22], [16, -18], [-16, -18]], r = [8, 8, 7, 7], a0 = [Math.PI / 2, 0, -Math.PI / 2, Math.PI]; for (let k = 0; k < 4; k++) for (let i = 0; i <= 6; i++) { const a = a0[k] - (i / 6) * (Math.PI / 2); pts.push([c[k][0] + r[k] * Math.cos(a) - Math.sign(c[k][0]) * 0, c[k][1] + r[k] * Math.sin(a)]); } return pts; })();

  function roomSvg(P) {
    const out = [ISO.tinted(ISO.T.wood, S(K.slabOf({ x: -120, y: -14, w: 240, d: 150, r: 0 }, -8, 8, P, 2), { tone: "lo", halo: true }))];
    out.push(ISO.tinted(WALL, ISO.wbox(P, [-120, 120], [-14, 0], [0, 180], "lo")));
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [-120, 120], [0, 8], [0, 18], "mid")));
    // the plate: socket on the right, switch and lamp on the left, two fixing screws
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [-62, 62], [0, PF], [SZ - 40, SZ + 40], "mid")));
    for (const x of [-54, 54]) out.push(ISO.tinted(WHITE, S(G.solidOf([[PF, 2.4], [PF + 0.8, 2.2, 1], [PF + 1.2, 1.2]], yAx([x, 0, SZ]), P, { steps: 14 }), { tone: "mid", inner: `<path d="${K.pathOf([K.iso([x - 1.6, PF + 1.21, SZ], P), K.iso([x + 1.6, PF + 1.21, SZ], P)])}" stroke="#6f6f66" stroke-width=".5"/>` })));
    out.push(ISO.tinted(WHITE, S(G.disc(PF, PF + 2.4, 30, yAx([SX, 0, SZ + 2]), P, { steps: 56 }), { tone: "mid" })));
    // the holes, each with the brass spring contact showing inside
    for (const p of Object.values(PINS)) {
      const F = yAx([SX + p.x, 0, SZ + p.z]);
      out.push(`<path d="${G.circleOf(F, PF + 2.42, p.r + 1, P, 24)}" fill="#26292e" stroke="#0d0e10" stroke-width=".5"/><path d="${G.circleOf(F, PF + 2.43, p.r + 0.2, P, 24)}" fill="#c9a85a" stroke="#6b5114" stroke-width=".4"/><path d="${G.circleOf(F, PF + 2.44, p.r - 0.6, P, 20)}" fill="#3a2f18"/>`);
    }
    out.push(ISO.tinted(WHITE, ISO.wbox(P, [-44, -18], [PF, PF + 2], [SZ - 22, SZ + 22], "mid")));
    return out.join("");
  }
  function switchSvg(P, on) {
    const th = on ? 0.16 : -0.16, c = [-31, PF + 2, SZ - 4], at = (u, w, v) => [c[0] + u, c[1] + w * Math.cos(th) + v * Math.sin(th), c[2] - w * Math.sin(th) + v * Math.cos(th)];
    const lamp = on ? ISO.tint("#ff9a8a", ["#e0402e", "#e85544", "#ef6c5c", "#f58a7c"], "#7a1810") : ISO.tint("#c9a8a4", ["#8a6a66", "#957672", "#a0827e", "#ab8e8a"], "#4a2a26");
    const glow = on ? (() => { const p = K.iso([-31, PF + 3, SZ + 15], P), k = K.cameraOf(P).k; return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(6 * k).toFixed(1)}" fill="#ff6a50" opacity=".35"/>`; })() : "";
    return ISO.tinted(WHITE, ISO.box(at, P, [-9, 9], [0, 4], [-14, 14], "hi")) + ISO.tinted(lamp, S(G.disc(PF + 2, PF + 3.6, 2.6, yAx([-31, 0, SZ + 15]), P, { steps: 18 }), { tone: "hi" })) + glow;
  }
  // The plug drawn pushed home (face at Y0) and moved out by dy with a transform. Its pins are drawn only where they
  // are outside the plate (y > PF + 2.4 once moved), so they're rebuilt only while they are inside it.
  const Y0 = PF + 2.6;
  function pinsSvg(P, dy) {
    const out = [], y0 = Y0;
    const pinOrder = Object.entries(PINS).sort((a, b) => K.depthOf([SX + a[1].x, y0, SZ + a[1].z], P) - K.depthOf([SX + b[1].x, y0, SZ + b[1].z], P));
    for (const [name, p] of pinOrder) {
      const tip = Math.max(PF + 2.4 - dy, y0 - p.len), Fp = yAx([SX + p.x, 0, SZ + p.z]);
      if (y0 - tip < 0.2) continue;
      const brass = S(G.lathe([[tip, 0], [tip, p.r - (tip > y0 - p.len + 0.6 ? 0 : 0.6)], ...(tip > y0 - p.len + 0.6 ? [] : [[tip + 0.6, p.r]]), [y0, p.r], [y0, 0]], Fp, P, { steps: 20 }), { tone: "hi" });
      out.push(`<g data-name="${name}">${ISO.tinted(ISO.T.brass, brass)}${p.sleeve && y0 - p.sleeve > tip ? ISO.tinted(ISO.T.plastic, S(G.disc(Math.max(tip, y0 - p.sleeve), y0, p.r + 0.15, Fp, P, { steps: 20 }), { tone: "mid" })) : ""}</g>`);
    }
    return out.join("");
  }
  // In the first pose the plug is held out in the air by its cord (audit.mjs reads it as loose); the sleeves are
  // moulded over the pins' roots, and audit.mjs records the plug where it is built (pushed home, before the transform
  // that moves it out), so it reads the pins and body as sunk in the plate: both are false positives.
  function bodySvg(P) {
    const out = [], F = yAx([SX, 0, SZ]), y0 = Y0;
    out.push(`<g data-name="plug">${ISO.tinted(ISO.T.plastic, S(G.prismOf(F, BODY, y0, y0 + 26, P), { tone: "mid" }))}`);
    // grip ridges down both sides, a screw in the back, the cord's strain-relief boot out of the bottom
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(y0 + 26, y0 + 28, 12, F, P, { steps: 32 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[y0 + 28, 2.6], [y0 + 28.8, 2.4, 1], [y0 + 29.4, 1.2]], F, P, { steps: 14 }), { tone: "mid" })));
    const boot = G.frameOf([SX, y0 + 13, SZ - 25], [0, 0, -1], [1, 0, 0], [0, 1, 0]);
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 6.4], [6, 5.2, 1], [14, 4], [16, 3.6]], boot, P, { steps: 20 }), { tone: "mid" })), "</g>");
    return out.join("");
  }
  function cordSvg(P, x0, y0, on) {
    // the cord: from the boot down to the floor and away to the right
    const a = [x0, y0 + 13, SZ - 41], pts = [];
    for (let i = 0; i <= 20; i++) { const u = i / 20, v = 1 - u; pts.push([0, 1, 2].map((j) => v * v * v * a[j] + 3 * v * v * u * [x0, y0 + 13, 30][j] + 3 * v * u * u * [x0 + 10, y0 + 40, 3][j] + u * u * u * [118, 132, 3][j])); }
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), k = K.cameraOf(P).k;
    return (`<path d="${d}" fill="none" stroke="#0d0e10" stroke-width="${(6.4 * k).toFixed(1)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#3a3e44" stroke-width="${(4.8 * k).toFixed(1)}" stroke-linecap="round"/>` +
      (on ? `<path data-part="flow" d="${d}" fill="none" stroke="#ffd36b" stroke-width="${(1.4 * k).toFixed(1)}" stroke-dasharray="${(3 * k).toFixed(1)} ${(9 * k).toFixed(1)}" stroke-linecap="round"/>` : ""));
  }

  ISO.add({
    name: "plug", title: "Plug and wall socket", compare: "plug 480 270 360 k=plug",
    about: "A three-pin plug going into a switched wall socket: brass contacts grip the pins, earth connects first, and the switch breaks the live wire.",
    line: "plug cx cy height k=plug|socket in=0|1 sw=0|1 lab=1 lit=plug|socket|switch|earth|live|neutral",
    demo: { line: "plug 480 270 360 k=plug", script: [{ set: {}, hold: 1.2 }, { set: { in: 1 }, hold: "settle" }, { set: { sw: 1 }, hold: 2.4 }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.2, only = o.k === "socket";
      const { P, g } = ISO.frame([[-120, -14, -8], [120, -14, -8], [120, 136, -8], [-120, 136, -8], [-120, -14, 180], [120, -14, 180], [SX + SIDE + 30, PF + TRAVEL + 30, SZ + 30]], cx, cy, W, H, { azimuth: 62, elevation: 18 }, parent);
      g.innerHTML = `<g data-name="socket">${roomSvg(P)}</g><g data-name="switch"></g><g data-part="cord"></g><g data-part="plugset"><g data-part="pins"></g><g data-part="body"></g></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { sw: q("switch"), plug: q("plugset"), pins: q("pins"), body: q("body"), cord: q("cord"), words: q("words") }, w = ISO.writer();
      const in0 = o.in === "1" ? 1 : 0;
      const s = { in: in0, wantIn: in0, sw: o.sw === "1", t: 0 };
      let lit = o.lit || "";
      const on = () => s.sw && s.in === 1;
      const draw = () => {
        const iq = Math.round(s.in * 400) / 400, [dx, dy] = offOf(iq), y0 = PF + 2.6 + dy;
        w.rebuild(el.sw, String(s.sw), () => switchSvg(P, s.sw));
        const maxLen = PINS.earth.len;
        w.rebuild(el.body, only ? "" : "b", () => (only ? "" : bodySvg(P)));
        w.rebuild(el.pins, only ? "" : dy >= maxLen ? "free" : dy.toFixed(2), () => (only ? "" : pinsSvg(P, dy)));
        w.attr(el.plug, "transform", K.translateAlong(P, [dx, dy, 0]));
        w.rebuild(el.cord, only ? "" : `${dx.toFixed(2)} ${dy.toFixed(2)} ${on()}`, () => (only ? "" : cordSvg(P, SX + dx, y0, on())));
        const flow = el.cord.querySelector('[data-part="flow"]'); if (flow) flow.setAttribute("stroke-dashoffset", (-s.t * 30).toFixed(1));
        w.rebuild(el.words, lab ? `${iq > 0.5} ${s.sw}` : "", () => !lab ? "" : [
          ISO.word(K.iso([SX + 34, PF, SZ + 24], P), "earth: bigger hole, longest pin", "#2c6a22", { size: 13, anchor: "start" }),
          ISO.word(K.iso([SX + 9.5, PF, SZ - 12], P), "live", "#a3271b", { size: 13, dy: 12 }),
          ISO.word(K.iso([SX - 9.5, PF, SZ - 12], P), "neutral", "#1f4f8f", { size: 13, anchor: "end", dy: 12 }),
          ISO.word(K.iso([-31, PF, SZ + 26], P), s.sw ? "switch on: lamp lit" : "switch off", s.sw ? "#a3271b" : "#444", { size: 13, dy: -4 }),
          ...(only ? [] : [ISO.word(K.iso([SX + dx + 26, y0 + 20, SZ + 26], P), iq > 0.5 ? "brass springs grip the pins" : "sleeved pins", "#444", { size: 13, anchor: "start", dy: -6 })])].join(""));
        w.light([q("socket"), q("switch"), ...g.querySelectorAll('[data-name="plug"],[data-name="earth"],[data-name="live"],[data-name="neutral"]')], [...g.querySelectorAll(`[data-name="${lit}"]`)]);
      };
      g.set = (p) => {
        if (p.in !== undefined) s.wantIn = +p.in ? 1 : 0;
        if (p.sw !== undefined) s.sw = !!+p.sw;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        s.t += dt;
        s.in = ISO.follow(s.in, s.wantIn, dt, 0.35, ISO.still()); if (Math.abs(s.in - s.wantIn) < 0.002) s.in = s.wantIn;
        draw();
        return s.in !== s.wantIn;
      };
      g.readout = () => {
        const depth = offOf(s.in)[0] > 0.01 ? 0 : Math.max(0, PINS.earth.len - offOf(s.in)[1]);
        if (only) return s.sw ? "socket switched on · 230 V between live and neutral, nothing plugged in" : "socket off · the switch breaks the live wire";
        if (s.in < 1) return depth > 0 ? `going in · earth pin ${depth.toFixed(0)} mm deep, live and neutral ${Math.max(0, depth - 5).toFixed(0)} mm: earth always touches first` : "plug out · 6 A three-pin plug: live, neutral and the longer earth";
        return on() ? "plugged in, switch on · 230 V across the appliance, current out on live and back on neutral · earth carries none unless there's a fault" : "plugged in, switch off · the live wire is broken at the switch, no current";
      };
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
