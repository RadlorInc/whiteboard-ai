// "oven cx cy size temp=180 lab=1" — a freestanding gas-hob cooker with an electric fan oven, built from its parts.
// Four adjustable feet under the plinth; the storage drawer; the oven door (a frame round a smoked-glass window, its
// handle bar on two stand-offs); the fascia with six knobs (four hob burners, oven function, oven temperature), the
// clock and the heating light; the hob plate on top with four burners (cup, crown, cap) under two cast-iron pan
// supports. Through the window: the enamelled cavity with shelf runners on both walls, the oven lamp, the fan cover on
// the back wall, the top (grill) element under the roof, a baking tray on the low runners and a wire shelf with a cake
// tin on it. set({ bake: 1 }) turns the knob to `temp`: the lamp lights the cavity, the element glows, and the cake
// rises as CO₂ from the baking powder expands in the heat (about 30 min, shown fast). 1 unit = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const X = 30, BK = -30, FR = 28, DOOR_T = 4, TOP = 85;
  const CAV = { x: 24, y0: -26, z0: 24, z1: 65 }, RAILS = [30, 38, 46, 54], SHELF = 38, TRAY = 30, FAN_Z = 35, EL_Z = 61, DOOR_Z = 70;
  const WIN = { x: 21, z0: 28, z1: 66, y: FR + 2 };
  const KNOBS = [-24, -17, -10, 10, 17, 24], KZ = 77.5;
  const BURNERS = [[-14.5, -12], [14.5, -12], [-14.5, 12], [14.5, 12]];
  const yF = (o) => G.frameAlong(o, [0, 1, 0]), zF = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const ENAMEL = ISO.tint("#5a6068", ["#2e3237", "#383c42", "#42474d", "#4d5258"], "#14171a");
  const IRON = ISO.tint("#4a4d52", ["#222427", "#2b2d31", "#34373b", "#3e4045"], "#0d0e10");

  ISO.add({
    name: "oven", title: "Oven", compare: "oven 480 270 300",
    about: "A cooker's fan oven at 180 °C: the element glows, the cake rises as gas bubbles in the batter expand in the heat; four gas burners on the hob above.",
    line: "oven cx cy size temp=180 lab=1",
    demo: { line: "oven 480 270 320", script: [{ set: { bake: 1 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 1.3;
      const { P, g } = ISO.frame([[-X, BK, 0], [X, BK, 0], [-X, FR + 9, 0], [X, FR + 9, 0], [-X, BK, 92], [X, FR + 3, 92], [-X, FR + 3, 92]], cx, cy, W, H, { azimuth: 56, elevation: 20, pad: size * 0.1 }, parent);
      const box = (x, y, z, tone = "mid", tint = "", lit = false) => ISO.tinted(tint, ISO.wbox(P, x, y, z, tone, lit));
      const quad = (pts, attrs) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" ${attrs}/>`;
      const line = (pts, attrs) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" ${attrs}/>`;
      const byDepth = (pts) => [...pts].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
      const out = [];

      // ── feet, plinth, back panel and far side
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -X, y: BK, w: 2 * X, d: FR + DOOR_T - BK, r: 2 }, 0, 4, P)}"/>`);
      for (const [x, y] of byDepth([[-X + 4, BK + 4], [X - 4, BK + 4], [-X + 4, FR - 4], [X - 4, FR - 4]])) out.push(S(K.cylinder(x, y, 2.4, 0, 0.8, P, 20), { tone: "lo" }), S(K.cylinder(x, y, 1.4, 0.8, 1.7, P, 16), { tone: "mid" }));
      out.push(box([-X + 0.5, X - 0.5], [BK + 0.5, FR - 1], [2.5, 8], "lo"));
      out.push(box([-X + 1, X - 1], [BK, BK + 1], [8, TOP], "lo"), box([-X, -X + 1], [BK, FR], [8, TOP], "mid"));
      // ── the cavity (a darker enamel), lit while the oven is on
      const cav = [box([-X + 1, X - 1], [BK + 1, FR], [21, CAV.z0], "mid"), box([-CAV.x, CAV.x], [BK + 1, CAV.y0], [CAV.z0, CAV.z1], "mid"),
        S(G.disc(0, 0.8, 8.5, yF([0, CAV.y0, FAN_Z]), P), { tone: "hi" })];
      // fan cover (hidden from this camera behind the door's right bar, kept because it is there): a raised disc with a ring of slots; the element's two terminals on the back wall under the roof
      const slots = [];
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; slots.push([[Math.cos(a) * 3.2, Math.sin(a) * 3.2], [Math.cos(a) * 7, Math.sin(a) * 7]].map(([u, v]) => [u, CAV.y0 + 0.85, FAN_Z + v])); }
      cav.push(`<path d="${slots.map((s) => K.pathOf(s.map((p) => K.iso(p, P)))).join("")}" stroke="#14171a" stroke-width="1.1" stroke-linecap="round" fill="none"/>`);
      cav.push(box([-7, -4], [CAV.y0, CAV.y0 + 1.2], [59.2, CAV.z1], "mid"), box([4, 7], [CAV.y0, CAV.y0 + 1.2], [59.2, CAV.z1], "mid"));
      cav.push(box([-X + 1, -CAV.x], [CAV.y0, FR], [CAV.z0, CAV.z1], "mid"));
      for (const z of RAILS) cav.push(box([-CAV.x, -CAV.x + 1.2], [CAV.y0 + 2, FR - 4], [z - 1, z], "hi"));
      cav.push(`<g data-part="lamp"></g>`);
      cav.push(box([CAV.x, X - 1], [CAV.y0, FR], [CAV.z0, CAV.z1], "mid"));
      for (const z of RAILS) cav.push(box([CAV.x - 1.2, CAV.x], [CAV.y0 + 2, FR - 4], [z - 1, z], "hi"));
      cav.push(box([-X + 1, X - 1], [BK + 1, FR], [CAV.z1, CAV.z1 + 4], "mid"));
      // baking tray on the low runners, the wire shelf (frame and wires) on the middle runners, the cake tin on it
      cav.push(box([-CAV.x + 1.2, CAV.x - 1.2], [CAV.y0 + 3, FR - 6], [TRAY, TRAY + 1.4], "hi", ISO.T.steel));
      const wires = [box([-CAV.x + 1.2, CAV.x - 1.2], [CAV.y0 + 3, CAV.y0 + 3.6], [SHELF, SHELF + 0.6], "hi", ISO.T.steel), box([-CAV.x + 1.2, CAV.x - 1.2], [FR - 6.6, FR - 6], [SHELF, SHELF + 0.6], "hi", ISO.T.steel)];
      for (let x = -20; x <= 20; x += 5) wires.push(box([x - 0.2, x + 0.2], [CAV.y0 + 3.6, FR - 6.6], [SHELF, SHELF + 0.6], "hi", ISO.T.steel));
      cav.push(wires.join(""), ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 9, SHELF + 0.6, 5, P, 48, 0.3), { tone: "hi" })));
      out.push(`<g data-part="cavity" style="${ENAMEL}">${cav.join("")}<g data-part="cake"></g><g data-part="element"></g></g>`);
      // ── the near side panel, the drawer, the door, the fascia
      out.push(box([X - 1, X], [BK, FR], [8, TOP], "mid"));
      out.push(box([-X + 0.5, X - 0.5], [FR - 1, FR + 2], [8.5, 20.5], "hi"), box([-12, 12], [FR + 2, FR + 2.8], [17, 18.6], "mid", ISO.T.steel));
      const winPts = [[-WIN.x, WIN.y, WIN.z0], [WIN.x, WIN.y, WIN.z0], [WIN.x, WIN.y, WIN.z1], [-WIN.x, WIN.y, WIN.z1]];
      out.push(`<g data-part="glass">${quad(winPts, `fill="#1d2228" fill-opacity=".5"`)}</g>${quad(winPts, `fill="none" stroke="#0d0e10" stroke-width=".8"`)}`);
      out.push(box([-X + 0.5, -WIN.x], [FR, FR + DOOR_T], [21, DOOR_Z], "hi"), box([-WIN.x, WIN.x], [FR, FR + DOOR_T], [21, WIN.z0], "hi"),
        box([-WIN.x, WIN.x], [FR, FR + DOOR_T], [WIN.z1, DOOR_Z], "hi"), box([WIN.x, X - 0.5], [FR, FR + DOOR_T], [21, DOOR_Z], "hi"));
      // handle bar on its two stand-offs
      out.push(box([-22, -20], [FR + DOOR_T, FR + DOOR_T + 3], [66.9, 69.1], "mid", ISO.T.steel), box([20, 22], [FR + DOOR_T, FR + DOOR_T + 3], [66.9, 69.1], "mid", ISO.T.steel));
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(-25, 25, 1.2, G.frameAlong([0, FR + DOOR_T + 4.2, 68], [1, 0, 0]), P), { tone: "hi" })));
      out.push(box([-X + 0.5, X - 0.5], [FR, FR + 3], [DOOR_Z, TOP], "mid"));
      // clock display and heating light between the knobs
      out.push(box([-5, 5], [FR + 3, FR + 3.3], [75, 80], "lo", ISO.tint("#16241c", ["#0c140f", "#101a14", "#132018", "#16241c"], "#050806")), `<g data-part="clock"></g>`);
      out.push(`<g data-part="neon"></g>`);
      out.push(`<g data-part="knobs"></g><g data-part="tknob"></g>`);
      // ── the hob: plate, four burners, two pan supports (each on four feet, bars split where they cross)
      out.push(box([-X, X], [BK, FR + 3], [TOP, TOP + 1], "mid", ENAMEL));
      for (const [x, y] of byDepth(BURNERS)) {
        const big = x < 0 && y > 0 ? 1 : 0;
        out.push(S(K.cylinder(x, y, 5.6 + big, TOP + 1, 1, P, 40, 0.3), { tone: "mid" }), S(K.cylinder(x, y, 4.2 + big, TOP + 2, 1.2, P, 36), { tone: "mid" }),
          ISO.tinted(IRON, S(K.cylinder(x, y, 3.6 + big, TOP + 3.2, 0.8, P, 32, 0.3), { tone: "hi" })));
      }
      const grate = (x0, x1, xm) => {
        const z = [TOP + 5, TOP + 6.4], b = 1.2, y0 = BK + 0.5, y1 = FR + 2.5, r = [];
        for (const [fx, fy] of byDepth([[x0 + 0.6, y0 + 0.6], [x1 - 0.6, y0 + 0.6], [x0 + 0.6, y1 - 0.6], [x1 - 0.6, y1 - 0.6]])) r.push(S(K.cylinder(fx, fy, 0.55, TOP + 1, 4, P, 12), { tone: "mid" }));
        r.push(box([x0, x1], [y0, y0 + b], z, "hi"), box([x0, x0 + b], [y0 + b, y1 - b], z, "hi"), box([x1 - b, x1], [y0 + b, y1 - b], z, "hi"));
        r.push(box([xm - 0.6, xm + 0.6], [y0 + b, -0.6], z, "hi"), box([x0 + b, xm - 0.6], [-0.6, 0.6], z, "hi"), box([xm + 0.6, x1 - b], [-0.6, 0.6], z, "hi"), box([xm - 0.6, xm + 0.6], [0.6, y1 - b], z, "hi"));
        r.push(box([x0, x1], [y1 - b, y1], z, "hi"));
        return ISO.tinted(IRON, r.join(""));
      };
      out.push(grate(-X + 0.5, -0.5, -14.5), grate(0.5, X - 0.5, 14.5));
      if (lab) {
        const w = (p, txt, anchor = "middle", dy = 0, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 13, dy }); };
        out.push(`<g data-part="words">${w([-X, BK, TOP + 6], "hob: four burners", "end", -4, -6)}${w([X, FR + 3, KZ], "knobs and clock", "start", 4, 8)}` +
          `${w([X, FR + DOOR_T, SHELF + 4], "wire shelf", "start", 4, 8)}${w([X, FR + DOOR_T, TRAY], "baking tray", "start", 4, 8)}${w([-X, FR + DOOR_T, EL_Z], "top element", "end", 4, -8)}`+
          `${w([0, FR + 3, 8.5], "storage drawer", "middle", 18)}</g>`);
      }
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), wr = ISO.writer();

      const st = { temp: ISO.clamp(ISO.num(o, "temp", 180), 50, 250), rise: 0, on: false, glow: 0, knob: 0 };
      // knob angle: off at 0, 50 °C at 30°, 250 °C at 300°; the burner knobs stay off
      const knobsSvg = (deg, list) => list.map((i) => {
        const x = KNOBS[i], F = yF([x, FR + 3, KZ]), a = i === 5 ? (deg * Math.PI) / 180 : i === 4 ? (deg > 0 ? Math.PI * 0.5 : 0) : 0;
        const tip = [x + Math.sin(a) * 1.9, FR + 6.25, KZ + Math.cos(a) * 1.9];
        return S(G.disc(0, 0.5, 2.9, F, P), { tone: "mid" }) + ISO.tinted(ISO.T.steel, S(G.disc(0.5, 3.2, 2.3, F, P), { tone: "hi" })) + line([[x, FR + 6.25, KZ], tip], `stroke="#2a2e33" stroke-width="1.2" stroke-linecap="round"`);
      }).join("");
      const cakeSvg = (r) => {
        const d = 0.6 + 4.6 * r;
        return ISO.tinted(ISO.T.amber, S(G.lathe([[0, 8.6], [d * 0.45, 8.3, 1], [d * 0.85, 6, 1], [d, 0]], zF([0, 0, SHELF + 5.6]), P, { steps: 44 }), { tone: "hi" }));
      };
      const draw = () => {
        const deg = st.knob, hot = st.glow;
        // the burner knobs never move; the function knob flips to fan, the temperature knob turns (3° steps)
        wr.rebuild(el.knobs, String(deg > 0), () => knobsSvg(deg, [0, 1, 2, 3, 4]));
        const q = Math.round(deg / 3) * 3;
        wr.rebuild(el.tknob, String(q), () => knobsSvg(q, [5]));
        wr.rebuild(el.cake, (Math.round(st.rise * 30) / 30).toFixed(3), () => cakeSvg(Math.round(st.rise * 30) / 30));
        // the grill element: a bent tube from the two terminals, glowing red as it heats
        const k = Math.round(hot * 10) / 10;
        wr.rebuild(el.element, String(k), () => {
          const pts = [[-5.5, CAV.y0 + 1.2], [-5.5, 17], [-14, 17], [-14, -20], [-19, -20], [-19, 24], [19, 24], [19, -20], [14, -20], [14, 17], [5.5, 17], [5.5, CAV.y0 + 1.2]].map(([x, y]) => [x, y, EL_Z]);
          const glow = k > 0 ? line(pts, `stroke="#ff7a2e" stroke-opacity="${(0.35 * k).toFixed(2)}" stroke-width="5" stroke-linejoin="round"`) : "";
          return glow + line(pts, `stroke="#1a1c1f" stroke-width="2.4" stroke-linejoin="round"`) + line(pts, `stroke="${k > 0 ? `color-mix(in srgb, #ff5a1f ${Math.round(k * 100)}%, #4a4f56)` : "#4a4f56"}" stroke-width="1.4" stroke-linejoin="round"`);
        });
        wr.attr(el.cavity, "style", st.on ? ISO.T.amber : ENAMEL);
        wr.rebuild(el.lamp, String(st.on), () => box([-CAV.x, -CAV.x + 0.6], [13, 18], [57, 60], "hi", st.on ? ISO.tint("#fff3c4", ["#f2cf6e", "#f5d985", "#f8e29c", "#fbebb3"], "#8a5a10") : ISO.T.glass, st.on));
        wr.rebuild(el.neon, String(st.on), () => ISO.tinted(st.on ? ISO.T.amber : "", S(G.disc(0, 0.5, 0.8, yF([8, FR + 3, 82.2]), P), { tone: "hi" })));
        wr.attr(el.glass.firstChild, "fill", st.on ? "#e9a35a" : "#1d2228");
        wr.attr(el.glass.firstChild, "fill-opacity", st.on ? ".28" : ".5");
        const clock = st.on ? `${st.temp}°` : st.rise >= 1 ? "End" : "12:00";
        wr.rebuild(el.clock, clock, () => `<g transform="${ISO.faceMatrix(P, [-5, FR + 3.32, 80], 1)}"><text x="5" y="3.6" text-anchor="middle" style="font:700 2.9px ui-monospace,Menlo,monospace" fill="#7fe0a0">${clock}</text></g>`);
      };
      g.set = (p) => {
        if (p.temp !== undefined) st.temp = ISO.clamp(+p.temp, 50, 250);
        if (p.bake) { st.on = true; st.rise = 0; }
      };
      g.update = (dt) => {
        const calm = ISO.still(), knobTo = st.on ? 30 + ((st.temp - 50) / 200) * 270 : 0;
        st.knob = ISO.follow(st.knob, knobTo, dt, 0.2, calm);
        st.glow = ISO.follow(st.glow, st.on ? 1 : 0, dt, 0.5, calm);
        if (st.on) { st.rise = calm ? 1 : Math.min(1, st.rise + dt * 0.25); if (st.rise >= 1) st.on = false; }
        draw();
        return st.on || st.knob !== knobTo || Math.abs(st.glow - (st.on ? 1 : 0)) > 0.01;
      };
      g.readout = () => (st.on ? `baking at ${st.temp} °C · fan spreads the heat · CO₂ from the baking powder expands in the heat and the cake rises (about 30 min, shown fast)` : st.rise >= 1 ? "baked · risen and set · knob back to off" : `oven set to ${st.temp} °C`);
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
