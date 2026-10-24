// The lamp-globe-moon bench (one rig, two recipes):
// "moonphases cx cy width labels=0 day=0..29.5 lab=1 lit=lamp|earth|moon|arm" — a lamp for the Sun at one end of a
//   bench, a globe on a post, and a small Moon ball on a brass arm that swings round the globe's post. The lamp always
//   lights half the Moon; how much of that lit half faces the globe gives the phase, shown in the card "seen from Earth".
//   One lap from new Moon to new Moon takes 29.5 days. set({ day }) swings the arm (always forward).
// "eclipse cx cy width k=solar|lunar labels=0 line=0..1 lab=1 lit=lamp|earth|moon|shadow" — the same bench: line=1 brings the
//   Moon exactly into line. Solar: the Moon between lamp and globe, its shadow a dark spot on Earth (penumbra about
//   6,400 km across, the dark umbra under 270 km). Lunar: the Moon behind the globe, inside Earth's shadow (umbra 2.6
//   Moon-widths across there), turning coppery red from sunlight bent through Earth's air.
// Shadow sizes are true to Earth and Moon; the distances are shortened to fit the bench (really 60 Earth radii).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const { add3, sub3, mul3, unit3, dot3, len3 } = G;
  const LZ = 50, RE = 22, RMOON = 6, ARM = 58, BR = 10, LX = 118, CE = [-20, 0, LZ], TILT = 23.4, MONTH = 29.53;
  const LAMP = [LX, 0, LZ], PL = { x: -104, y: -76, w: 248, d: 152, r: 12 };
  const AX = unit3([Math.sin(TILT * Math.PI / 180) * -0.7, Math.sin(TILT * Math.PI / 180) * 0.7, Math.cos(TILT * Math.PI / 180)]);
  // the Moon's place for an elongation e (degrees from the lamp's direction, as seen from the globe), going anticlockwise
  const moonAt = (e) => { const t = (e * Math.PI) / 180; return [CE[0] + ARM * Math.cos(t), CE[1] + ARM * Math.sin(t), LZ]; };
  const PHASES = ["new Moon", "waxing crescent", "first quarter", "waxing gibbous", "full Moon", "waning gibbous", "last quarter", "waning crescent"];
  const phaseOf = (e) => PHASES[Math.floor((((e % 360) + 360) % 360 + 22.5) / 45) % 8];

  // The static bench: board, the lamp's foot, the globe's post with the collar the arm turns on.
  function bench(P) {
    const out = [ISO.baseboard(P, PL, { h: 7, tint: ISO.T.wood }), EARTH.lamp(P, LAMP, BR)];
    out.push(ISO.tinted(ISO.T.wood, S(G.lathe([[0, 0], [0, 18], [1.4, 17.4, 1], [3, 14, 1], [4, 9], [4, 0]], LAB.Z([CE[0], CE[1], 0]), P, { steps: 48 }), { tone: "mid" })));
    return out.join("");
  }
  // The globe on its post (the post runs up to a ball joint; the axis rod leans 23.4° through the globe).
  function earthSvg(P, opt) {
    const V = G.viewOf(P), J = add3(CE, mul3(AX, -(RE + 6))), out = [];
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(J[0], J[1], 2.4, 4, J[2] - 6, P, 18), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(J[0], J[1], 5, 13, 3.4, P, 24, 0.4), { tone: "mid" })), ISO.tinted(ISO.T.brass, S(G.sphereOf(J, 3, P), { tone: "mid" })));
    const low = EARTH.rod(P, J, add3(CE, mul3(AX, -(RE - 1))), 1.1), top = EARTH.rod(P, add3(CE, mul3(AX, RE - 1)), add3(CE, mul3(AX, RE + 6)), 1.1) + ISO.tinted(ISO.T.brass, S(G.sphereOf(add3(CE, mul3(AX, RE + 6)), 1.7, P), { tone: "mid" }));
    const front = dot3(AX, V) > 0;
    out.push(front ? low : top);
    const F = EARTH.frame(CE, RE, AX, 2.2);
    out.push(EARTH.ball(P, F, { flat: true, tint: ISO.tint("#e8f2fb", ["#a9c9e8", "#bcd6ee", "#cfe2f4", "#dceaf7"], "#1f4f8f"), land: "#cfe7b9", light: unit3(sub3(LAMP, CE)), dark: 0.62, spots: opt.spots }));
    out.push(front ? top : low);
    return out.join("");
  }
  // audit: the arm is ISO.poly (not recorded), so the Moon's post and ball read as loose
  // The Moon on its arm: the arm from the collar, a post up to the Moon, the Moon lit by the lamp.
  function moonSvg(P, M, red = 0) {
    const J = CE.map((v, i) => (i === 2 ? 0 : v)), dir = unit3([M[0] - J[0], M[1] - J[1], 0]), side = [-dir[1], dir[0], 0], r1 = Math.hypot(M[0] - J[0], M[1] - J[1]);
    const bar = [[5.4, -1.8, 14], [r1 + 2.4, -1.8, 14], [r1 + 2.4, 1.8, 14], [5.4, 1.8, 14], [5.4, -1.8, 15.6], [r1 + 2.4, -1.8, 15.6], [r1 + 2.4, 1.8, 15.6], [5.4, 1.8, 15.6]].map(([s, q, z]) => [J[0] + dir[0] * s + side[0] * q, J[1] + dir[1] * s + side[1] * q, z]);
    const out = [ISO.tinted(ISO.T.brass, ISO.poly(bar, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"))];
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(M[0], M[1], 1.3, 15.6, M[2] - RMOON - 14.6, P, 14), { tone: "mid", crease: "none" })));
    const grey = red ? LAB.blend("#efefeb", "#e3a184", red) : "#efefeb", ink = red ? LAB.blend("#5f5f58", "#7a2f18", red) : "#5f5f58";
    const F = EARTH.frame(M, RMOON, [0, 0, 1], 0.5);
    out.push(EARTH.ball(P, F, { flat: true, tint: ISO.tint(grey, ["#bdbdb5", "#cacac3", "#d7d7d1", "#e2e2dd"], ink), ink, light: red > 0.6 ? null : unit3(sub3(LAMP, M)), dark: 0.7,
      spots: [[30, 20, 14, "#c9c6be", "none"], [-30, -10, 18, "#cfccc4", "none"], [100, 30, 12, "#c9c6be", "none"], [190, -20, 16, "#cfccc4", "none"]] }));
    return `<g data-name="arm">${out.slice(0, 2).join("")}</g><g data-name="moon">${out[2]}</g>`;
  }
  // The phase as it looks from the globe: a flat disc with the lit part (northern-hemisphere view, waxing on the right).
  function phaseCard(at, e, rr = 24) {
    const a = (((e % 360) + 360) % 360) * Math.PI / 180, sg = a < Math.PI ? 1 : -1, cosA = -Math.cos(a), n = 36, pts = [];
    for (let i = 0; i <= n; i++) { const t = (i / n) * Math.PI; pts.push([at[0] + sg * rr * Math.sin(t), at[1] - rr * Math.cos(t)]); }
    for (let i = n - 1; i > 0; i--) { const t = (i / n) * Math.PI; pts.push([at[0] - sg * cosA * rr * Math.sin(t), at[1] - rr * Math.cos(t)]); }
    return `<circle cx="${at[0].toFixed(1)}" cy="${at[1].toFixed(1)}" r="${rr + 5}" fill="#f6f7f8" stroke="#8a8f96" stroke-width="1"/><circle cx="${at[0].toFixed(1)}" cy="${at[1].toFixed(1)}" r="${rr}" fill="#3a4258"/>` +
      `<path d="${K.pathOf(pts, true)}" fill="#f5ecc8" stroke="none"/><circle cx="${at[0].toFixed(1)}" cy="${at[1].toFixed(1)}" r="${rr}" fill="none" stroke="#2a3044" stroke-width="1.2"/>`;
  }

  // Shared make: builds the bench and the moving Moon; mode "phases" or "solar"/"lunar".
  function makeRig([cx, cy, w], o, t, parent, mode) {
    const lab = o.lab !== "0" && o.labels !== "0", W = Math.min(w * 1.12, 900), H = Math.min(w * 0.82, 470);
    const { P, g } = ISO.frame([[PL.x, PL.y, -12], [PL.x + PL.w, PL.y + PL.d, -12], [PL.x, PL.y + PL.d, 0], [PL.x + PL.w, PL.y, 0], [LX, 0, LZ + BR + 22], [CE[0], CE[1], LZ + RE + 26]], cx, cy, W, H, { azimuth: 38, elevation: 22 }, parent);
    g.innerHTML = `<g>${bench(P)}</g><g data-part="movers"><g data-part="lamp" data-name="lamp">${EARTH.bulb(P, LAMP, BR)}</g><g data-part="earth" data-name="earth"></g><g data-part="moon"></g><g data-part="shadow" data-name="shadow"></g></g><g data-part="card"></g><g data-part="words"></g>`;
    const el = LAB.parts(g), wr = ISO.writer(), sort = ISO.sorter(P, el.movers), glow = EARTH.glow(g, P, W, H, el.movers, LAMP, 52);
    const solar = mode === "solar", lunar = mode === "lunar";
    const st = { e: 0 }, want = { e: 0 };
    const eOf = (v) => (mode === "phases" ? (v / MONTH) * 360 : solar ? -36 * (1 - v) : 180 - 36 * (1 - v));
    const v0 = mode === "phases" ? ISO.clamp(ISO.num(o, "day", 0), 0, MONTH) : ISO.clamp(ISO.num(o, "line", 0), 0, 1);
    st.e = want.e = eOf(v0);
    let lit = o.lit || "";
    // how deep the Moon sits in Earth's shadow (lunar): 0 outside the penumbra … 1 at the shadow's centre
    const shadeOf = (M) => {
      const ax = unit3(sub3(CE, LAMP)), q = sub3(M, CE), along = dot3(q, ax), b = len3(sub3(q, mul3(ax, along)));
      if (along < 0) return 0;
      const um = RMOON * 2.65, pen = RMOON * 4.6;
      return ISO.clamp((pen - b) / (pen - um), 0, 1);
    };
    const draw = () => {
      const key = Math.round(st.e * 2) / 2, M = moonAt(key), red = lunar ? shadeOf(M) : 0;
      wr.rebuild(el.moon, `${key}`, () => moonSvg(P, M, red));
      // solar: the Moon's shadow on the globe, where the line from the lamp through the Moon meets it
      let spots = null, cone = "", mid = M;
      if (solar) {
        const d = unit3(sub3(M, LAMP)), oc = sub3(LAMP, CE), bq = dot3(oc, d), cq = dot3(oc, oc) - RE * RE, disc = bq * bq - cq;
        const ax = sub3(CE, LAMP), along = dot3(ax, d), miss = len3(sub3(ax, mul3(d, along))), pen = 0.5 * RE;
        if (miss < RE + pen) {
          const hit = disc > 0 ? add3(LAMP, mul3(d, -bq - Math.sqrt(disc))) : add3(CE, mul3(unit3(sub3(add3(LAMP, mul3(d, along)), CE)), RE));
          const F = EARTH.frame(CE, RE, AX, 2.2), n = unit3(sub3(hit, CE)), loc = [dot3(n, F.u), dot3(n, F.v), dot3(n, F.a)];
          const lon = Math.atan2(loc[1], loc[0]) / EARTH.R, lat = Math.asin(ISO.clamp(loc[2], -1, 1)) / EARTH.R;
          spots = [[lon, lat, 30 * Math.min(1, (RE + pen - miss) / pen), "#55607a", "none"], ...(miss < RE * 0.4 ? [[lon, lat, 2.4, "#1a2034", "none"]] : [])];
          const a = K.iso(M, P), b = K.iso(hit, P), dx = b[0] - a[0], dy = b[1] - a[1], L0 = Math.hypot(dx, dy) || 1, nx = -dy / L0, ny = dx / L0, k = K.cameraOf(P).k;
          const r0 = RMOON * k, r1 = pen * k * 0.9; mid = mul3(add3(M, hit), 0.5);
          cone = `<path d="${K.pathOf([[a[0] + nx * r0, a[1] + ny * r0], [b[0] + nx * r1, b[1] + ny * r1], [b[0] - nx * r1, b[1] - ny * r1], [a[0] - nx * r0, a[1] - ny * r0]], true)}" fill="#2a3044" fill-opacity="${(0.16 * ISO.clamp((RE + pen - miss) / pen, 0, 1)).toFixed(3)}" stroke="none"/>`;
        }
      }
      if (lunar) {
        // Earth's shadow reaching back past the Moon: as wide as the globe at the globe, 0.73 of it at the Moon's distance
        const ax = unit3(sub3(CE, LAMP)), end = add3(CE, mul3(ax, ARM + 22)); mid = add3(CE, mul3(ax, RE * 1.2)); const a = K.iso(CE, P), b = K.iso(end, P), dx = b[0] - a[0], dy = b[1] - a[1], L0 = Math.hypot(dx, dy) || 1, nx = -dy / L0, ny = dx / L0, k = K.cameraOf(P).k;
        const gid = `lc${Math.round(a[0])}${Math.round(b[1])}`;
        cone = `<defs><linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"><stop offset="0" stop-color="#2a3044" stop-opacity=".14"/><stop offset=".7" stop-color="#2a3044" stop-opacity=".1"/><stop offset="1" stop-color="#2a3044" stop-opacity="0"/></linearGradient></defs>` +
          `<path d="${K.pathOf([[a[0] + nx * RE * k, a[1] + ny * RE * k], [b[0] + nx * RE * k * 0.66, b[1] + ny * RE * k * 0.66], [b[0] - nx * RE * k * 0.66, b[1] - ny * RE * k * 0.66], [a[0] - nx * RE * k, a[1] - ny * RE * k]], true)}" fill="url(#${gid})" stroke="none"/>`;
      }
      wr.rebuild(el.earth, spots ? JSON.stringify(spots.map((s) => s.map((x) => (typeof x === "number" ? Math.round(x) : x)))) : "plain", () => earthSvg(P, { spots }));
      wr.rebuild(el.shadow, `${key}`, () => cone);
      // the shadow cone lies behind the Moon (lunar) or between Moon and globe (solar): keep it under the movers' top
      sort({ lamp: el.lamp, earth: el.earth, moon: el.moon, shadow: el.shadow }, { lamp: LAMP, earth: CE, moon: M, shadow: mid });
      if (mode === "phases") wr.rebuild(el.card, `${key}`, () => { const at = K.iso([PL.x + 16, PL.y + PL.d - 10, LZ + 40], P); return phaseCard(at, key) + (lab ? ISO.word([at[0], at[1] + 46], "seen from Earth", "#445", { size: 13 }) + ISO.word([at[0], at[1] + 62], phaseOf(key), "#2a3044", { size: 13 }) : ""); });
      if (lab) wr.rebuild(el.words, "w", () => ISO.word(K.iso([LX, 0, LZ + BR + 4], P), "lamp = Sun", "#8a6a10", { size: 13, dy: -6 }) + ISO.word(K.iso([CE[0], CE[1], LZ + RE + 12], P), "Earth", "#1f4f8f", { size: 14 }));
      glow(1);
      LAB.light(wr, g, lit);
    };
    g.set = (p) => {
      if (mode === "phases" && p.day !== undefined) { let e = eOf(ISO.clamp(+p.day, 0, MONTH)); while (e < want.e - 0.5) e += 360; want.e = e; }
      if (mode !== "phases" && p.line !== undefined) want.e = eOf(ISO.clamp(+p.line, 0, 1));
      if (p.lit !== undefined) lit = p.lit;
    };
    g.update = (dt) => {
      st.e = ISO.follow(st.e, want.e, dt, mode === "phases" ? 0.8 : 1.1, ISO.still());
      if (Math.abs(st.e - want.e) < 0.05) st.e = want.e;
      draw();
      return st.e !== want.e;
    };
    g.readout = () => {
      const e = ((st.e % 360) + 360) % 360, lit = (1 - Math.cos((e * Math.PI) / 180)) / 2;
      if (mode === "phases") return `day ${((e / 360) * MONTH).toFixed(1)} of 29.5 · ${phaseOf(e)} · ${Math.round(lit * 100)}% of the face we see is lit · the lamp always lights half the Moon`;
      const off = solar ? Math.abs(e > 180 ? e - 360 : e) : Math.abs(180 - e);
      if (solar) return off < 0.5 ? "total solar eclipse · the Moon (400× smaller than the Sun but 400× nearer) just covers it · dark umbra under 270 km wide · totality up to 7.5 min" : `Moon ${off.toFixed(0)}° from the line · its shadow ${off < 14 ? "falls partly on Earth: a partial eclipse there" : "misses Earth"}`;
      return off < 0.5 ? "total lunar eclipse · the Moon inside Earth's umbra (2.6 Moon-widths across there) · red from sunlight bent through Earth's air · totality up to 1 h 46 min" : `Moon ${off.toFixed(0)}° from the line · ${shadeOf(moonAt(st.e)) > 0 ? "entering Earth's shadow" : "still in full sunlight"}`;
    };
    draw();
    LAB.title(parent, cx, cy - H / 2 - 8, t);
    return g;
  }

  ISO.add({
    name: "moonphases", title: "Moon phases (lamp, globe, moon)", compare: "moonphases 480 260 860",
    about: "A lamp, a globe and a Moon ball on an arm: the lamp always lights half the Moon, and how much of that half faces Earth makes the phase.",
    line: "moonphases cx cy width labels=0 day=0..29.5 lab=1 lit=lamp|earth|moon|arm",
    demo: { line: "moonphases 480 270 760 day=0", script: [{ set: { day: 7.4 }, hold: "settle" }, { set: { day: 14.8 }, hold: "settle" }, { set: { day: 22.1 }, hold: "settle" }, { set: { day: 29.5 }, hold: "settle" }] },
    make: ([cx, cy, w = 820], o, t, parent) => makeRig([cx, cy, w], o, t, parent, "phases"),
  });
  ISO.add({
    name: "eclipse", title: "Eclipse (lamp, globe, moon)", compare: "eclipse 480 260 500 k=solar",
    about: "The lamp-globe-moon bench: line the Moon up and its shadow falls on Earth (solar), or it passes into Earth's shadow and turns red (lunar).",
    line: "eclipse cx cy width k=solar|lunar labels=0 line=0..1 lab=1 lit=lamp|earth|moon|shadow",
    demo: { line: "eclipse 480 270 640 k=solar", script: [{ set: {}, hold: 1 }, { set: { line: 1 }, hold: "settle" }, { set: { lit: "shadow" }, hold: 1.6 }] },
    make([cx, cy, w = 480], o, t, parent) {
      const k = o.k || "solar";
      if (!["solar", "lunar"].includes(k)) throw new Error(`Unknown eclipse "${o.k}" (use solar|lunar)`);
      return makeRig([cx, cy, w], o, t, parent, k);
    },
  });
})();
