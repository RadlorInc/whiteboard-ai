// "glasshouse cx baseY width vent=0..1 sun=0..1 lab=1" — a Venlo glasshouse as a museum model.
// On the walnut plinth: a concrete floor and knee wall, steel posts carrying lattice trusses and the gutters, five
// saw-tooth roof spans glazed at 22°, ridge vents that hinge open, glass walls (the front and right ones see-through so
// the crop shows), four rows of tomato plants in grow bags on gutter rails, strung up to the trusses, and the pipe-rail
// heating between the rows. Sunlight comes in through the roof; the plants turn about half of it into evaporation and
// the rest warms the air, which only leaves through the glass or the vents. Open the vents (vent=1) and warm air
// streams out through the ridge and the inside temperature falls. World units: 0.1 m (house 16 m × 8 m, gutter 4 m).
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const XA = -80, XB = 80, YB = -80, YF = 0, GZ = 40, RZ = 46.5, SPAN = 32, NS = 5;
  const PLINTH = { x: -92, y: -92, w: 184, d: 108, r: 4 };
  const ROWS = [-60, -28, 4, 36, 66].slice(0, 4).map((x, i) => XA + 16 + i * 42);
  const GLASS = "#dff0f8", GINK = "#5d7f96", ALU = "#9aa3ad";
  const k3 = (P, pts) => K.pathOf(pts.map((p) => K.iso(p, P)), true);
  const pane = (P, pts, op = 0.4) => `<path d="${k3(P, pts)}" fill="${GLASS}" fill-opacity="${op}" stroke="${GINK}" stroke-width=".7" stroke-linejoin="round"/>`;
  const bars = (P, list, w = 0.6, color = ALU) => `<path d="${list.map((s) => K.pathOf(s.map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="${color}" stroke-width="${(w * K.cameraOf(P).k).toFixed(2)}" stroke-linecap="round"/>`;
  const AL = ISO.tint("#e4e7ea", ["#9aa1a9", "#adb3ba", "#c0c5cb", "#d2d6db"], "#4a5058");
  // the true heat balance: half the sunlight that gets through goes into evaporation, the rest warms the air, which
  // loses it through the glass (U 6 W/m²K over 1.4× the floor) and the vents (up to 60 air changes an hour)
  const AREA = 128, VOL = 576, OUT = 15;
  const target = (sun, vent) => OUT + (0.5 * 0.75 * 800 * sun * AREA) / (6 * 1.4 * AREA + 1.2 * 1005 * (VOL * 60 * vent / 3600 + VOL * 0.5 / 3600));

  function shellBack(P) {
    const out = [M.plinth(P, PLINTH)];
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [XA - 2, XB + 2], [YB - 2, YF + 2], [0, 1.2], "mid")));
    // knee walls on the back and left sides, glass above them
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [XA - 2, XB + 2], [YB - 2, YB], [1.2, 6], "mid") + ISO.wbox(P, [XA - 2, XA], [YB, YF + 2], [1.2, 6], "mid")));
    out.push(pane(P, [[XA, YB, 6], [XB, YB, 6], [XB, YB, GZ], [XA, YB, GZ]], 0.5), pane(P, [[XA, YB, 6], [XA, YF, 6], [XA, YF, GZ], [XA, YB, GZ]], 0.5));
    const b = [];
    for (let x = XA + 16; x < XB; x += 16) b.push([[x, YB, 6], [x, YB, GZ]]);
    for (let y = YB + 16; y < YF; y += 16) b.push([[XA, y, 6], [XA, y, GZ]]);
    b.push([[XA, YB, 23], [XB, YB, 23]], [[XA, YB, 23], [XA, YF, 23]]);
    out.push(bars(P, b));
    // back gable glass: the saw-tooth above the gutter
    for (let i = 0; i < NS; i++) { const x0 = XA + i * SPAN; out.push(pane(P, [[x0, YB, GZ], [x0 + SPAN, YB, GZ], [x0 + SPAN / 2, YB, RZ]], 0.5)); }
    // back posts
    for (let x = XA; x <= XB; x += SPAN) out.push(ISO.tinted(AL, ISO.wbox(P, [x - 0.8, x + 0.8], [YB - 0.8, YB + 0.8], [1.2, GZ], "mid")));
    for (const y of [-40, 0]) out.push(ISO.tinted(AL, ISO.wbox(P, [XA - 0.8, XA + 0.8], [y - 0.8, y + 0.8], [1.2, GZ], "mid")));
    return out.join("");
  }
  // heating pipes (pairs on their supports) between the rows, a header along the back; then the crop, far to near
  function cropSvg(P) {
    const out = [];
    const header = M.pipe(P, [[XA + 4, YB + 4, 3], [XB - 4, YB + 4, 3]], 0.9, { body: "#d98b6a", ink: "#6e3a1c", shine: "#f2c0a8" });
    out.push(header);
    // pipe-rail supports under the header, every 3.2 m
    for (let x = XA + 6; x < XB; x += 32) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 0.7, x + 0.7], [YB + 3.2, YB + 4.8], [1.2, 2.1], "mid")));
    for (const x of ROWS) for (const dx of [-21, -17]) if (x + dx > XA + 2) out.push(M.pipe(P, [[x + dx, YB + 4, 3], [x + dx, YF - 6, 3]], 0.7, { body: "#d98b6a", ink: "#6e3a1c", shine: "#f2c0a8", flange: false }));
    const heat = M.named("heating", out.splice(0).join("")), items = [];
    for (const x of ROWS) {
      items.push({ k: K.depthOf([x, YB + 4, 0], P), svg: ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 3, x + 3], [YB + 6, YF - 6], [1.2, 2], "mid")) + ISO.tinted(ISO.tint("#fbfbf8", ["#cfd2d4", "#dadcde", "#e4e6e7", "#eeeff0"], "#7a7d80"), ISO.wbox(P, [x - 2.6, x + 2.6], [YB + 7, YF - 7], [2, 4.2], "hi")) });
      for (let y = YB + 11; y < YF - 6; y += 9) {
        const j = Math.round(y), sw = (j % 2 ? 1 : -1) * 1.2;
        let svg = ISO.tinted(ISO.T.green, S(K.cylinder(x, y, 0.35, 4.2, 26, P, 8), { tone: "mid" }));
        for (const [dz, r, dx] of [[11, 3.2, sw], [19, 3.4, -sw], [27, 3, sw * 0.6]]) svg += ISO.tinted(ISO.T.green, S(G.sphereOf([x + dx, y, 4.2 + dz], r, P, { steps: 14 }), { tone: "mid" }));
        // trusses of tomatoes on the side facing the viewer, and the string up to the wire
        const k = K.cameraOf(P).k, tom = [[x + 1.8, y + 2, 9], [x + 2.4, y + 1.2, 10.4], [x + 1.4, y + 2.6, 11], [x - 1.6, y + 2.2, 15.4], [x - 0.8, y + 2.8, 16.6]];
        svg += tom.map((p, i) => { const q = K.iso(p, P); return `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(0.9 * k).toFixed(2)}" fill="${i < 3 ? "#d8432e" : "#f08a3a"}" stroke="#7a1a0a" stroke-width=".5"/>`; }).join("");
        svg += bars(P, [[[x, y, 30], [x, y, GZ - 2]]], 0.15, "#7a7d80");
        items.push({ k: K.depthOf([x, y, 0], P), svg });
      }
    }
    items.sort((a, b) => a.k - b.k);
    out.push(...items.map((i) => i.svg));
    // the crop wires along each row under the trusses
    out.push(bars(P, ROWS.map((x) => [[x, YB, GZ - 2], [x, YF, GZ - 2]]), 0.25, "#4a5058"));
    return heat + M.named("plants", out.join(""));
  }
  // trusses across the house at y = −80, −40, 0; gutters along y over each post line
  function frameSvg(P) {
    const out = [];
    for (const y of [YB, -40, YF]) {
      out.push(ISO.tinted(AL, ISO.wbox(P, [XA, XB], [y - 0.6, y + 0.6], [GZ - 4, GZ - 3.2], "mid")));
      const b = []; for (let x = XA; x < XB; x += 8) b.push([[x, y, GZ - 3.2], [x + 4, y, GZ - 0.2]], [[x + 4, y, GZ - 0.2], [x + 8, y, GZ - 3.2]]);
      out.push(bars(P, b, 0.4, "#6b737c"));
    }
    for (let x = XA; x <= XB; x += SPAN) out.push(ISO.tinted(AL, ISO.wbox(P, [x - 1.6, x + 1.6], [YB - 1, YF + 1], [GZ - 0.2, GZ + 1.4], "hi")));
    for (let x = XA + SPAN; x < XB; x += SPAN) out.push(ISO.tinted(AL, ISO.wbox(P, [x - 0.8, x + 0.8], [-40.8, -39.2], [1.2, GZ - 0.2], "mid")));
    return out.join("");
  }
  // the roof: two glass slopes per span with glazing bars, the vent openings left out of the right-hand slopes
  const VY = [[-66, -50], [-30, -14]];
  function roofSvg(P) {
    const out = [], b = [];
    for (let i = 0; i < NS; i++) {
      const x0 = XA + i * SPAN, xm = x0 + SPAN / 2, x1 = x0 + SPAN;
      out.push(pane(P, [[x0, YB, GZ + 1.4], [xm, YB, RZ], [xm, YF, RZ], [x0, YF, GZ + 1.4]], 0.3));
      const cuts = [YB, ...VY.flat(), YF];
      const hx = xm + 0.6 * SPAN / 2, hz = RZ + 0.6 * (GZ + 1.4 - RZ);
      for (const [y0, y1] of VY) out.push(pane(P, [[hx, y0, hz], [x1, y0, GZ + 1.4], [x1, y1, GZ + 1.4], [hx, y1, hz]], 0.3));
      for (let j = 0; j < cuts.length; j += 2) out.push(pane(P, [[xm, cuts[j], RZ], [x1, cuts[j], GZ + 1.4], [x1, cuts[j + 1], GZ + 1.4], [xm, cuts[j + 1], RZ]], 0.3));
      for (let y = YB + 8; y < YF; y += 8) b.push([[x0, y, GZ + 1.4], [xm, y, RZ]]);
      out.push(ISO.tinted(AL, ISO.wbox(P, [xm - 0.6, xm + 0.6], [YB, YF], [RZ - 0.4, RZ + 0.6], "hi")));
    }
    out.push(bars(P, b, 0.45));
    return out.join("");
  }
  // vent panels hinged at the ridge, opened by angle φ (up to 30°): a framed glass flap with its rack arm
  const VENT = new Map();
  function ventSvg(P, phi) {
    const out = [], a = Math.atan2(GZ + 1.4 - RZ, SPAN / 2) + phi, L = 0.6 * Math.hypot(SPAN / 2, RZ - GZ - 1.4);
    for (let i = 0; i < NS; i++) {
      const xm = XA + i * SPAN + SPAN / 2, ex = xm + Math.cos(a) * L, ez = RZ + Math.sin(a) * L;
      for (const [y0, y1] of VY) {
        if (phi > 0.01) out.push(`<path d="${k3(P, [[xm, y0, RZ], [xm + 0.3 * SPAN, y0, RZ + 0.6 * (GZ + 1.4 - RZ)], [xm + 0.3 * SPAN, y1, RZ + 0.6 * (GZ + 1.4 - RZ)], [xm, y1, RZ]])}" fill="#7b9db3" fill-opacity=".25"/>`);
        out.push(pane(P, [[xm, y0, RZ + 0.6], [ex, y0, ez + 0.6], [ex, y1, ez + 0.6], [xm, y1, RZ + 0.6]], 0.55));
        out.push(bars(P, [[[xm, y0, RZ + 0.6], [ex, y0, ez + 0.6]], [[xm, y1, RZ + 0.6], [ex, y1, ez + 0.6]], [[ex, y0, ez + 0.6], [ex, y1, ez + 0.6]]], 0.7, "#6b737c"));
        const ym = (y0 + y1) / 2; out.push(bars(P, [[[xm + 0.3 * SPAN + 0.4, ym, RZ + 0.6 * (GZ + 1.4 - RZ)], [ex, ym, ez + 0.4]]], 0.5, "#3c3f45"));
      }
    }
    return M.named("vents", out.join(""));
  }
  // the front (y = 0) and right (x = 80) walls: knee walls, see-through glass, posts, the door
  function shellFront(P) {
    const out = [ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [XB, XB + 2], [YB, YF + 2], [1.2, 6], "mid") + ISO.wbox(P, [XA, -8], [YF, YF + 2], [1.2, 6], "mid") + ISO.wbox(P, [8, XB], [YF, YF + 2], [1.2, 6], "mid"))];
    for (let x = XA + SPAN; x <= XB; x += SPAN) out.push(ISO.tinted(AL, ISO.wbox(P, [x - 0.8, x + 0.8], [YF - 0.8, YF + 0.8], [1.2, GZ], "mid")));
    out.push(ISO.tinted(AL, ISO.wbox(P, [XB - 0.8, XB + 0.8], [-40.8, -39.2], [1.2, GZ], "mid")));
    out.push(pane(P, [[XB, YB, 6], [XB, YF, 6], [XB, YF, GZ], [XB, YB, GZ]], 0.22));
    out.push(pane(P, [[XA, YF + 2, 6], [-8, YF + 2, 6], [-8, YF + 2, GZ], [XA, YF + 2, GZ]], 0.18), pane(P, [[8, YF + 2, 6], [XB, YF + 2, 6], [XB, YF + 2, GZ], [8, YF + 2, GZ]], 0.18));
    out.push(pane(P, [[-8, YF + 2, 1.2], [8, YF + 2, 1.2], [8, YF + 2, 26], [-8, YF + 2, 26]], 0.12), pane(P, [[-8, YF + 2, 26], [8, YF + 2, 26], [8, YF + 2, GZ], [-8, YF + 2, GZ]], 0.18));
    for (let i = 0; i < NS; i++) { const x0 = XA + i * SPAN; out.push(pane(P, [[x0, YF + 1, GZ + 1.4], [x0 + SPAN, YF + 1, GZ + 1.4], [x0 + SPAN / 2, YF + 1, RZ]], 0.2)); }
    const b = [];
    for (let x = XA + 16; x < XB; x += 16) if (Math.abs(x) > 8) b.push([[x, YF + 2, 6], [x, YF + 2, GZ]]);
    for (let y = YB + 16; y < YF; y += 16) b.push([[XB, y, 6], [XB, y, GZ]]);
    b.push([[XB, YB, 23], [XB, YF, 23]], [[-8, YF + 2, 1.2], [-8, YF + 2, GZ]], [[8, YF + 2, 1.2], [8, YF + 2, GZ]], [[-8, YF + 2, 26], [8, YF + 2, 26]], [[0, YF + 2, 1.2], [0, YF + 2, 26]]);
    out.push(bars(P, b));
    return out.join("");
  }

  ISO.add({
    name: "glasshouse", title: "Venlo glasshouse", compare: "glasshouse 480 400 480",
    about: "A model glasshouse: sunlight warms the air among the tomato rows; open the ridge vents and warm air streams out and the inside cools.",
    line: "glasshouse cx baseY width vent=0..1 sun=0..1 lab=1 lit=roof|vents|plants|heating",
    demo: { line: "glasshouse 480 420 500 vent=0 sun=0.3", script: [{ set: { sun: 1 }, hold: 4 }, { set: { vent: 1 }, hold: 5 }] },
    make([cx, by, size = 480], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.05, H = size * 0.72;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, -13, 0), [XA, YB, RZ + 14], [XB, YF, RZ + 10]], cx, by - H / 2, W, H, { azimuth: 56, elevation: 28 }, parent);
      g.innerHTML = `<g>${shellBack(P)}</g><g>${cropSvg(P)}</g><g>${frameSvg(P)}</g><g data-name="roof">${roofSvg(P)}</g><g data-part="vents"></g><g data-part="sun"></g><g>${shellFront(P)}</g><g data-part="flow"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      VENT.clear();
      const s = { vent: ISO.clamp(ISO.num(o, "vent", 0), 0, 1), sun: ISO.clamp(ISO.num(o, "sun", 1), 0, 1), ph: 0 };
      const want = { vent: s.vent, sun: s.sun };
      s.ti = target(s.sun, s.vent);
      let lit = o.lit || "";
      const draw = () => {
        const vk = Math.round(s.vent * 30);
        w.rebuild(el.vents, vk, () => { if (!VENT.has(vk)) VENT.set(vk, ventSvg(P, (vk / 30) * (30 * Math.PI) / 180)); return VENT.get(vk); });
        const sk = Math.round(s.sun * 10);
        w.rebuild(el.sun, sk, () => {
          if (!sk) return "";
          const k = K.cameraOf(P).k, rays = [];
          for (let x = XA + 6; x < XB; x += SPAN) for (const y of [-58, -22]) rays.push(K.pathOf([K.iso([x - 12, y - 9, RZ + 16], P), K.iso([x, y, GZ + 3.4], P)]));
          return `<path d="${rays.join("")}" fill="none" stroke="#f2b632" stroke-width="${(0.9 * k).toFixed(2)}" stroke-linecap="round" opacity="${(sk / 10 * 0.5).toFixed(2)}"/>`;
        });
        const amt = s.vent * Math.min(1, Math.max(0, (s.ti - OUT) / 6)), fk = amt > 0.03 ? `${(Math.round(s.ph * 2) / 2 % 12).toFixed(1)} ${Math.round(amt * 10)}` : "";
        w.rebuild(el.flow, fk, () => {
          if (!fk) return "";
          const a = Math.atan2(GZ + 1.4 - RZ, SPAN / 2) + s.vent * (30 * Math.PI) / 180, L = Math.hypot(SPAN / 2, RZ - GZ - 1.4), out = [];
          for (let i = 0; i < NS; i++) {
            const xm = XA + i * SPAN + SPAN / 2, ex = xm + Math.cos(a) * L * 0.4, ez = RZ + Math.sin(a) * L * 0.4;
            for (const [y0, y1] of VY) { const y = (y0 + y1) / 2; out.push(M.flow(P, [[xm + 2, y, 18], [xm + 6, y, GZ - 2], [ex, y, ez - 2], [ex + 4, y, ez + 14]], s.ph + i * 3, { color: "#d0603a", gap: 9, dash: 3.6, w: 1.1, amount: amt })); }
          }
          return out.join("");
        });
        const tk = Math.round(s.ti);
        w.rebuild(el.words, lab ? `${tk} ${Math.round(s.vent * 4)}` : "", () => !lab ? "" : [
          M.label(P, [XA - 4, YF, GZ], `inside ${tk} °C`, tk > 30 ? "#a3271b" : "#1f4f8f", { size: 16, anchor: "end" }) + M.label(P, [XA - 4, YF, GZ], `outside ${OUT} °C`, "#1f4f8f", { size: 13, anchor: "end", dy: 18 }),
          M.label(P, [XA + SPAN * 1.5, YB, RZ + 8], s.vent > 0.2 ? "ridge vents open" : "ridge vents", "#444", { dy: -4 }),
          M.label(P, [XB, -12, 22], "tomato rows", "#2c6a22", { anchor: "start" }), M.label(P, [XB, -74, 3], "heating pipes", "#6e3a1c", { anchor: "start", dy: -2 })].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.vent !== undefined) want.vent = ISO.clamp(+p.vent, 0, 1);
        if (p.sun !== undefined) want.sun = ISO.clamp(+p.sun, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      // vents open on their rack motors at a steady pace; the air follows its heat balance over a few seconds here
      g.update = (dt) => {
        const calm = ISO.still();
        s.vent = calm ? want.vent : s.vent + Math.sign(want.vent - s.vent) * Math.min(Math.abs(want.vent - s.vent), dt * 0.35);
        s.sun = ISO.follow(s.sun, want.sun, dt, 0.5, calm); if (Math.abs(s.sun - want.sun) < 2e-3) s.sun = want.sun;
        const T = target(s.sun, s.vent);
        s.ti = ISO.follow(s.ti, T, dt, 1.4, calm); if (Math.abs(s.ti - T) < 0.05) s.ti = T;
        if (!calm) s.ph += dt * 10;
        draw();
        return s.vent !== want.vent || s.sun !== want.sun || s.ti !== T || (s.vent > 0.03 && s.ti > OUT + 0.5);
      };
      g.readout = () => {
        const sunW = 0.75 * 800 * s.sun * AREA, ach = 60 * s.vent + 0.5;
        return `sunlight in ${(sunW / 1000).toFixed(0)} kW (75% of ${Math.round(800 * s.sun)} W/m² on ${AREA} m²), half spent evaporating water from the leaves · vents ${Math.round(s.vent * 100)}% open: ${ach.toFixed(0)} air changes an hour · inside ${s.ti.toFixed(1)} °C, outside ${OUT} °C`;
      };
      draw();
      if (t) label(parent, cx, by - H - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
