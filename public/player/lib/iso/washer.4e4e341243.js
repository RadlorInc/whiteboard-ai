// "washer cx cy height spin=0|1 lab=1 lit=drum|door|drawer|dial|filter" — a front-loading washing machine.
// Enamelled cabinet on four screw feet with a top lid; the control fascia carries the detergent drawer (pulled out a
// little so its three compartments show: pre-wash, main wash, softener with its siphon cap), the programme dial with
// its ring of programme lights, the display and the option buttons. The round door hangs on two hinge knuckles; its
// white frame holds a chrome ring and the glass, and through the glass you see the rubber door seal (the boot) and,
// behind its lip, the perforated stainless drum with three lifter paddles and the clothes. The kickplate has the
// pump-filter flap. spin=0 washes: the drum turns at 50 rpm, where the pull at the wall (ω²r ≈ 0.6 g) is less than
// gravity, so the lifters raise the clothes and they fall back through the water. spin=1 ramps to 1200 rpm (≈ 370 g):
// the clothes are pinned to the wall and the water leaves through the holes. The drum is shown slowed.
// World units: 1 cm. Cabinet 60 × 60 × 85, drum Ø 46 cm × 37 cm deep.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const FY = 30, DZ = 42, PY = 30.8;                       // cabinet front, door centre height, fascia front
  const RD = 23, DF = 24, DB = -13, LIP = 13.2, WIN = 14.2;  // drum radius, drum front/back, boot lip, glass
  const RPM_WASH = 50, RPM_SPIN = 1200, R_M = 0.23;
  const gOf = (rpm) => ((rpm * 2 * Math.PI) / 60) ** 2 * R_M / 9.81;
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const DOOR = yAx([0, FY, DZ]);
  const CAB = { x: -30, y: -30, w: 60, d: 60, r: 1.2 };
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const face = (P, pts, fill, stroke = "none", w = 0.6, y = PY) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const hex = (r, ph = 0) => Array.from({ length: 6 }, (_, i) => [Math.cos(ph + (i * Math.PI) / 3) * r, Math.sin(ph + (i * Math.PI) / 3) * r]);
  let uid = 0;
  // Many small holes as one filled path (cheaper per frame than a circle each).
  const holesOf = (pts, r, fill = "#6b7178") => `<path d="${pts.map(([x, y]) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join("")}" fill="${fill}"/>`;
  // A closed smooth outline through the midpoints of a polygon's sides (a soft heap of cloth).
  const soft = (pts) => { const m = pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; });
    return `M${m[0][0].toFixed(1)} ${m[0][1].toFixed(1)}` + m.map((_, i) => { const c = pts[(i + 1) % pts.length], e = m[(i + 1) % m.length]; return `Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`; }).join("") + "Z"; };

  // A hose along straight legs with a ball at each bend (each leg a cylinder from bend to bend). The audit reads each
  // leg's end as sunk into its bend ball by one radius: it is one continuous hose, so that report is a false positive.
  function hose(P, pts, r) {
    const out = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], d = b.map((v, k) => v - a[k]), l = Math.hypot(...d);
      out.push(S(G.disc(0, l, r, G.frameAlong(a, d.map((v) => v / l)), P), { tone: "mid", crease: "none" }));
      if (i + 2 < pts.length) out.push(S(G.sphereOf(b, r, P), { tone: "mid" }));
    }
    return out.join("");
  }
  function backSvg(P, lab) {
    const out = [], floor = { x: -40, y: -42, w: 88, d: 82, r: 3 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -2, 2, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(floor, -2, 2, P, 4, 0.5), { tone: "lo", crease: "none" })));
    // The drain: a standpipe on the floor behind the right side, and the drain hose from the back hooked into it.
    const up = zAx([40, -34, 0]);
    out.push(S(G.disc(0, 0.8, 4.4, up, P), { tone: "mid" }), S(G.disc(0.8, 54, 2.5, up, P), { tone: "mid", crease: "none" }), S(G.ringBand(54, 57, 2.4, 3.1, up, P, { hole: [57, 2.4] }), { tone: "mid" }));
    out.push(`<path d="${G.circleOf(up, 57, 2.4, P)}" fill="#3a3e44"/>`);
    out.push(hose(P, [[26, -30, 12], [26, -35, 12], [34, -35, 12], [34, -35, 66], [40, -34, 66], [40, -34, 55.4]], 1));
    // Four screw feet: a rubber pad, the threaded stem and its locknut, by depth.
    const feet = K.corners(CAB, 5).sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
    for (const [x, y] of feet) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 2.4, 0, 0.8, P, 20), { tone: "mid" })), S(K.cylinder(x, y, 1.1, 0.8, 1.2, P, 14), { tone: "mid" }), S(G.prismOf(zAx([x, y, 0.8]), hex(1.7), 0, 0.6, P), { tone: "mid" }));
    // The cabinet with a seam where the kickplate meets the front, and the top lid.
    out.push(S(K.slabOf(CAB, 2, 81, P, 6, 0.8), { tone: "hi", inner: L(K.sideSeam(CAB, 70, P, 6), { tone: "faint" }) }));
    out.push(S(K.slabOf({ x: -30.4, y: -30.6, w: 60.8, d: 61.2, r: 1.6 }, 83, 2.2, P, 6, 0.6), { tone: "hi" }));
    // Kickplate and the pump-filter flap with its coin slot.
    out.push(ISO.wbox(P, [-29.4, 29.4], [FY, FY + 0.6], [2.6, 9.2], "mid"));
    out.push(named("filter", ISO.wbox(P, [17.5, 27], [FY + 0.6, FY + 1], [3.6, 8.2], "hi") + face(P, rect(21, 23.5, 6.6, 7.2), "#3a3e44", "none", 0, FY + 1.01)));
    out.push(D([K.iso([-27, FY + 0.6, 5.9], P), K.iso([14, FY + 0.6, 5.9], P)], { size: 0.7 }));
    for (let i = 0; i < 5; i++) out.push(face(P, rect(-23 + i * 6.4, -18.6 + i * 6.4, 4.8, 6.6), "#c9ccd0", "#5f6369", 0.5, FY + 0.61));
    // Control fascia across the top of the front.
    out.push(ISO.wbox(P, [-29.6, 29.6], [FY, PY], [71.6, 81], "mid"));
    out.push(drawerSvg(P), dialSvg(P), panelSvg(P));
    // The door surround pressed into the front, the door-lock catch, and the rubber boot inside the opening.
    out.push(S(G.ringBand(0, 0.3, 16, 22.6, DOOR, P, { hole: [0.3, 16] }), { tone: "hi" }));
    out.push(face(P, rect(23.6, 25, 40.6, 43.4), "#3a3e44", "#3a3e44", 0.4, FY));
    out.push(`<path d="${G.circleOf(DOOR, 0.3, 16, P)}" fill="#55575c" stroke="#121214" stroke-width="0.8"/>`, `<path d="${G.circleOf(DOOR, -2.4, 14.8, P)}" fill="#48494e" stroke="#2a2b2f" stroke-width="0.6"/>`);
    return out.join("");
  }
  // The detergent drawer, pulled out 5 cm: its slot in the fascia, the tray floor, walls left to right (far to near),
  // a little powder in the main wash, the softener's siphon cap, and the drawer front with its finger recess.
  function drawerSvg(P) {
    const out = [face(P, rect(-27.4, -10.6, 74.2, 80.8), "#3a3e44")];
    out.push(ISO.wbox(P, [-27, -11], [PY, 36], [74.6, 75.2], "mid"));
    out.push(`<path d="${K.pathOf([[-20.8, 32, 75.2], [-17.8, 32, 75.2], [-18.4, 35, 75.2], [-20.4, 35, 75.2]].map((p) => K.iso(p, P)), true)}" fill="#f4f1ea" stroke="#9a968c" stroke-width="0.5"/>`);
    out.push(ISO.tinted(ISO.T.blue, S(K.cylinder(-13.8, 33, 1.1, 75.2, 2.6, P, 16), { tone: "hi" })));
    for (const [x0, x1] of [[-27, -26.5], [-22.2, -21.7], [-16.8, -16.3], [-11.5, -11]]) out.push(ISO.wbox(P, [x0, x1], [PY, 36], [75.2, 80.2], "hi"));
    out.push(ISO.wbox(P, [-27.6, -10.4], [36, 37.4], [74, 81.2], "hi"));
    out.push(face(P, rect(-22, -16, 79.2, 80.2), "#c9ccd0", "#5f6369", 0.5, 37.41));
    return named("drawer", out.join(""));
  }
  // The programme dial: a bezel on the fascia, the ribbed knob with its pointer, and the ring of programme lights.
  function dialSvg(P) {
    const F = yAx([-3, PY, 77]), out = [];
    out.push(S(G.disc(0, 0.5, 4.6, F, P), { tone: "mid" }));
    out.push(S(G.disc(0.5, 3, 3.6, F, P), { tone: "hi" }), K.fadedSvg(G.ribsOf(F, 0.5, 3, 3.6, 30, P, { fade: [0.1, 0.5] }), { tone: "lo" }));
    const a = Math.PI * 0.62;
    out.push(L(K.pathOf([G.pointOf(F, 3, 0.8, a), G.pointOf(F, 3, 3, a)].map((p) => K.iso(p, P))), { tone: "hi", free: true }));
    const lights = Array.from({ length: 12 }, (_, i) => K.iso(G.pointOf(F, 0, 6, Math.PI * (1.15 - (i / 11) * 1.3)), P));
    out.push(D(lights, { size: 0.7, tone: "lo" }), D([lights[3]], { size: 1.1, tone: "hi" }));
    return named("dial", out.join(""));
  }
  // Display bezel (the window itself is live), three option buttons with their lights, and the power button.
  function panelSvg(P) {
    const out = [ISO.wbox(P, [3, 16], [PY, PY + 0.4], [75, 80.4], "mid")];
    for (const x of [18.2, 21.6, 25]) out.push(ISO.wbox(P, [x, x + 2.6], [PY, PY + 0.8], [75.4, 77], "hi"));
    out.push(D([19.5, 22.9, 26.3].map((x) => K.iso([x, PY, 78.4], P)), { size: 0.7, tone: "lo" }));
    out.push(S(G.disc(0, 0.9, 1.3, yAx([26.3, PY, 80]), P), { tone: "hi" }));
    // start / pause: a ring bezel and the button in it, with its light
    out.push(S(G.disc(0, 0.4, 1.9, yAx([19.6, PY, 79.6]), P), { tone: "mid" }), S(G.disc(0.4, 1.2, 1.4, yAx([19.6, PY, 79.6]), P), { tone: "hi" }));
    out.push(D([K.iso([22.6, PY, 79.6], P)], { size: 0.8, tone: "hi" }));
    return out.join("");
  }
  // The door, in front of the drum: glass, the white frame, the chrome ring, the hinge knuckles and pin, the handle.
  function doorSvg(P) {
    const out = [`<path d="${G.circleOf(DOOR, 4.4, WIN, P)}" fill="#e6f1f7" fill-opacity=".22"/>`];
    out.push(S(G.lathe([[0.3, WIN], [0.3, 20.4], [1.4, 20.9, 1], [3, 20.6, 1], [4.4, 18.6], [4.4, WIN]], DOOR, P, { steps: 72, hole: [4.4, WIN] }), { tone: "hi" }));
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(4.4, 5.1, WIN, 17.6, DOOR, P, { hole: [5.1, WIN] }), { tone: "hi" })));
    out.push(ISO.wbox(P, [-24.4, -20.4], [FY + 0.3, 34], [33.6, 37.2], "mid"), ISO.wbox(P, [-24.4, -20.4], [FY + 0.3, 34], [46.8, 50.4], "mid"));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(-23.2, 32.4, 0.8, 37.2, 9.6, P, 14), { tone: "hi", crease: "none" })));
    out.push(D([[-23.4, 35.4], [-21.4, 35.4], [-23.4, 48.6], [-21.4, 48.6]].map(([x, z]) => K.iso([x, 34, z], P)), { size: 0.6 }));
    out.push(ISO.wbox(P, [20.4, 22.6], [FY + 1.4, 34.6], [37, 47], "hi"));
    return named("door", out.join(""));
  }

  // Inside the drum, seen through the glass and the boot's lip. Drum angle a, clothes from the tumble model.
  // The parts of the drum that only turn are kept by their angle, quantised to the pattern's own period (holes repeat
  // every 10° on the wall and every 60° on the back, the three lifters every 120°), so a turn reuses strings.
  const memo = (m, key, f) => m.get(key) ?? (m.set(key, f()), m.get(key));
  function drumSvg(P, s, c) {
    const out = [], { sinA, cosA, sinE, cosE } = K.cameraOf(P), V = [cosA * cosE, sinA * cosE, sinE], TAU = Math.PI * 2;
    const at = (th, y, r = RD) => [r * Math.cos(th), y, DZ + r * Math.sin(th)];
    const seen = (th) => -Math.cos(th) * V[0] - Math.sin(th) * V[2] > 0.02;
    const Fb = yAx([0, DB, DZ]);
    out.push(memo(c, "base", () => `<path d="${G.circleOf(DOOR, -5, LIP + 3, P)}" fill="#a9afb6"/>`));
    // holes in the far wall of the drum, in rows along its depth
    const qa = (per, n) => Math.round((((s.a % per) + per) % per) / per * n) % n;
    const w1 = qa(TAU / 36, 24);
    out.push(memo(c, `w${w1}`, () => { const a = (w1 / 24) * (TAU / 36), holes = [];
      for (let j = 0; j < 7; j++) for (let i = 0; i < 36; i++) { const th = a + (i + (j % 2) * 0.5) * (TAU / 36); if (seen(th)) holes.push(K.iso(at(th, DB + 3 + j * 5), P)); }
      return holesOf(holes, 0.8); }));
    // the back wall with its hub and rings of holes
    out.push(memo(c, "back", () => `<path d="${G.circleOf(Fb, 0, RD, P)}" fill="#cdd2d7" stroke="#5d636b" stroke-width="0.6"/><path d="${G.circleOf(Fb, 0, 4.6, P)}" fill="#bfc5cb" stroke="#5d636b" stroke-width="0.6"/>`));
    const b1 = qa(TAU / 6, 120);
    out.push(memo(c, `b${b1}`, () => { const a = (b1 / 120) * (TAU / 6), back = [];
      [[8, 12], [12, 18], [16, 24], [20, 30]].forEach(([r, n]) => { for (let i = 0; i < n; i++) back.push(K.iso(G.pointOf(Fb, 0, r, a + (i / n) * TAU), P)); });
      return holesOf(back, 0.8); }));
    // the three lifters, each a ridge along the drum wall
    const items = [], l1 = qa(TAU / 3, 360);
    for (let k = 0; k < 3; k++) {
      const th = (l1 / 360) * (TAU / 3) + (k * TAU) / 3, w = 0.12;
      items.push({ k: K.depthOf(at(th, (DB + DF) / 2, RD - 2), P), svg: memo(c, `l${l1}.${k}`, () => { const V6 = [at(th - w, DB), at(th + w, DB), at(th, DB, RD - 6), at(th - w, DF - 1), at(th + w, DF - 1), at(th, DF - 1, RD - 6)];
        return ISO.tinted(ISO.T.steel, ISO.poly(V6, [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], P, "mid")); }) });
    }
    const kk = K.cameraOf(P).k;
    s.clothes.forEach((c) => {
      const p = [c.x, c.y, c.z], q = K.iso(p, P), r = c.size * kk;
      const pts = Array.from({ length: 9 }, (_, i) => { const t = c.turn + (i / 9) * Math.PI * 2, rr = r * (0.78 + 0.22 * Math.sin(i * 2.3 + c.seed)); return [q[0] + Math.cos(t) * rr * 1.25, q[1] + Math.sin(t) * rr * 0.8]; });
      const fold = [[q[0] - r * 0.6, q[1] - r * 0.1], [q[0] + r * 0.4, q[1] + r * 0.25], [q[0] + r * 0.5, q[1] - r * 0.3]];
      items.push({ k: K.depthOf(p, P), svg: `<path d="${soft(pts)}" fill="${c.color}" stroke="#3b3b3b" stroke-width="0.6" stroke-linejoin="round"/><path d="${soft(fold)}" fill="#000" fill-opacity=".14"/>` });
    });
    items.sort((p, q) => p.k - q.k).forEach((it) => out.push(it.svg));
    if (s.water > 0.02) {
      const zw = DZ - RD + 8 * s.water, hw = Math.sqrt(RD * RD - (zw - DZ) ** 2);
      out.push(`<path d="${K.pathOf([[-hw, DB, zw], [hw, DB, zw], [hw, DF, zw], [-hw, DF, zw]].map((p) => K.iso(p, P)), true)}" fill="#9cc8ee" fill-opacity="${(0.45 * Math.min(1, s.water * 2)).toFixed(2)}"/>`);
    }
    return out.join("");
  }

  const CLOTHES = [["#c0574b", 0.0, 8, 7.5], ["#4f7fc0", 0.12, 16, 6.5], ["#e2b84a", 0.25, 11, 7], ["#6aa36a", 0.37, 19, 6], ["#e9e4da", 0.5, 4, 8], ["#8a6fb0", 0.62, 14, 6.5], ["#d98c5f", 0.75, 20, 6], ["#5d9aa8", 0.87, 9, 7]];
  // Tumble: each piece rides up on the wall from the bottom to about 45° past the side, then falls across the drum.
  // Spin: pinned to the wall, turning with it. k blends the two (it rises through the speed where ω²r = g).
  function placeClothes(s) {
    const k = ISO.smooth(70, 160, s.rpm);
    s.clothes = CLOTHES.map(([color, ph, y, size], i) => {
      const p = (ph + s.tumble) % 1, rr = RD - size * 1.3;
      let th, r;
      if (p < 0.62) { th = -Math.PI * 0.58 + (p / 0.62) * Math.PI * 0.85; r = rr; }
      else { const f = ((p - 0.62) / 0.38) ** 2, th0 = Math.PI * 0.27, a = [rr * Math.cos(th0), rr * Math.sin(th0)], b = [(rr - 1.5) * Math.cos(-Math.PI * 0.55), (rr - 1.5) * Math.sin(-Math.PI * 0.55)];
        const x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f; th = Math.atan2(z, x); r = Math.hypot(x, z); }
      const ts = s.a + ph * Math.PI * 2, rw = RD - size * 0.55, x = (1 - k) * r * Math.cos(th) + k * rw * Math.cos(ts), z = (1 - k) * r * Math.sin(th) + k * rw * Math.sin(ts);
      return { color, x, y, z: DZ + z, size: size * (1 - 0.3 * k), turn: s.a * (1 - k) * 0.7 + i + k * ts, seed: i * 1.7 };
    });
  }

  ISO.add({
    name: "washer", title: "Washing machine", compare: "washer 480 270 300 spin=1",
    about: "A front-loader: at 50 rpm the lifters raise the clothes and drop them through the water; at 1200 rpm they are pinned to the drum wall and the water is flung out through its holes.",
    line: "washer cx cy height spin=0|1 lab=1 lit=drum|door|drawer|dial|filter",
    demo: { line: "washer 480 270 320 spin=0", script: [{ set: { spin: 1 }, hold: 4 }, { set: { spin: 0 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 1.15;
      const { P, g } = ISO.frame([[-40, -42, -2], [48, -42, -2], [-40, 40, -2], [48, 40, -2], [40, -34, 67.5], [-31, -31, 85.2], [31, 31, 85.2]], cx, cy, W, H, { azimuth: 64, elevation: 20 }, parent);
      const s = { rpmT: o.spin === "1" ? RPM_SPIN : RPM_WASH, rpm: 0, a: 0, tumble: 0, water: 1, clothes: [], lit: o.lit || "" };
      s.rpm = s.rpmT; s.water = s.rpm > 300 ? 0 : 1;
      const cache = new Map(), id = `wd${uid++}`, win = G.circleOf(DOOR, 4.4, WIN, P), lip = G.circleOf(DOOR, -5, LIP, P);
      const words = !lab ? "" : [
        ISO.word(K.iso([-30.4, 34, 77.5], P), "detergent drawer", "#555", { size: 13, anchor: "end", dy: 4 }),
        ISO.word(K.iso([-3, PY, 85.2], P), "programme dial", "#555", { size: 13, dy: -14 }),
        ISO.word(K.iso([-30, FY, 50], P), "glass door", "#555", { size: 13, anchor: "end" }),
        ISO.word(K.iso([-30, FY, 36], P), "door seal, drum and lifters", "#555", { size: 13, anchor: "end" }),
        ISO.word(K.iso([43, -34, 66], P), "drain hose", "#555", { size: 13, anchor: "start", dy: 4 }),
        ISO.word(K.iso([30, FY + 1, 5.9], P), "pump filter", "#555", { size: 13, anchor: "start", dy: 4 }),
      ].join("");
      g.innerHTML = `<clipPath id="${id}w"><path d="${win}"/></clipPath><clipPath id="${id}l"><path d="${lip}"/></clipPath>` +
        `<g>${backSvg(P, lab)}</g><g clip-path="url(#${id}w)"><g clip-path="url(#${id}l)" data-name="drum"><g data-part="drum"></g></g></g>` +
        `<g data-part="lcd"></g><g>${doorSvg(P)}</g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const lcd = () => {
        const txt = s.rpmT === RPM_SPIN ? `${Math.round(s.rpm / 10) * 10}` : "0:48";
        return w.rebuild(el.lcd, txt, () => `<path d="${K.pathOf(rect(3.6, 15.4, 75.6, 79.8).map(([x, z]) => K.iso([x, PY + 0.41, z], P)), true)}" fill="#cfdccb" stroke="#3c3f45" stroke-width="0.5"/>` +
          `<g transform="${ISO.faceMatrix(P, [3.6, PY + 0.42, 79.8], 1)}"><clipPath id="${id}d"><rect x="0" y="0" width="11.8" height="4.2"/></clipPath><g clip-path="url(#${id}d)">` +
          `<text x="5.9" y="3.5" text-anchor="middle" fill="#1f2a1f" style="font:700 3.6px ui-monospace,Menlo,monospace">${txt}</text></g></g>`);
      };
      const draw = () => {
        placeClothes(s);
        w.rebuild(el.drum, `${s.a.toFixed(3)} ${s.tumble.toFixed(3)} ${s.water.toFixed(2)}`, () => drumSvg(P, s, cache));
        lcd();
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.set = (p) => { if (p.spin !== undefined) s.rpmT = +p.spin ? RPM_SPIN : RPM_WASH; if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        // a real machine takes a minute or two to reach full spin; here it ramps in a couple of seconds
        s.rpm = ISO.follow(s.rpm, s.rpmT, dt, s.rpmT > s.rpm ? 0.9 : 0.7, calm);
        if (Math.abs(s.rpm - s.rpmT) < 0.5) s.rpm = s.rpmT;
        s.water = ISO.follow(s.water, s.rpm > 300 ? 0 : 1, dt, s.rpm > 300 ? 0.6 : 1.2, calm);
        // shown slowed: 50 rpm is drawn at 0.75 rev/s, 1200 rpm at 2 rev/s
        const shown = s.rpm <= RPM_WASH ? (s.rpm / 60) * 0.9 : 0.75 + ((s.rpm - RPM_WASH) / (RPM_SPIN - RPM_WASH)) * 1.25;
        if (!calm) { s.a += shown * Math.PI * 2 * dt; s.tumble += shown * 0.9 * dt; }
        draw();
        return s.rpm !== s.rpmT || Math.abs(s.water - (s.rpm > 300 ? 0 : 1)) > 0.01;
      };
      g.readout = () => {
        const rpm = Math.round(s.rpm), gs = gOf(s.rpm);
        if (s.rpmT === RPM_WASH && rpm <= RPM_WASH + 1) return `washing · drum ${rpm} rpm · ${gs.toFixed(1)} g at the wall, less than gravity, so the lifters raise the clothes and they fall back through the water`;
        if (s.rpm < RPM_SPIN - 5 && s.rpmT === RPM_SPIN) return `speeding up · ${rpm} rpm · above 60 rpm (1 g at the wall) the clothes stop falling and stick to the drum`;
        if (s.rpmT === RPM_WASH) return `slowing down · ${rpm} rpm`;
        return `spinning · about 1200 rpm (shown slowed) · ${Math.round(gs)} g pins the clothes to the drum wall and flings the water out through its holes`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
