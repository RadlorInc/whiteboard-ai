// "ship cx cy length run=0|1 rudder=-35..35 lab=1 lit=hull|containers|bridge|funnel|propeller|rudder" — a container ship
// cut out of a block of sea, so the hull below the waterline shows: red antifouling paint, the bulbous bow, and at the
// stern the four-blade propeller on its shaft with the rudder behind it. run=1 turns the propeller (shown slowed; true
// 90 rpm gives about 16 knots) and the funnel smokes harder. rudder swings the blade (positive = to starboard): the
// propeller's stream pushes on it, the stern swings the other way and the ship turns to the side the rudder points.
// 1 unit ≈ 0.6 m: hull 190 m long, 27 m beam, 10 m draught, about 1 100 containers (20-ft) when full.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const DEG = Math.PI / 180, TAU = Math.PI * 2, HB = 22, DECK = 12, DRAFT = -17, PX = -153, PZ = -8.5;
  const NAVY = ISO.tint("#5d7190", ["#2c3b52", "#34445d", "#3d4e68", "#475973"], "#141c28");
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  // The hull's plan at a given narrowing: a square-ish stern, parallel middle body, a fine bow.
  const plan = (inset, bow = 165, stern = -150) => {
    const hb = HB - inset, out = [];
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * Math.PI; out.push([stern + inset + 6 - Math.cos(a) * 6, Math.sin(a) * hb]); }   // stern (rounded corners)
    for (let i = 0; i <= 16; i++) { const f = i / 16, x = 90 + (bow - inset * 2 - 90) * f; out.push([x, hb * Math.cos(f * Math.PI / 2) ** 0.8]); }
    for (let i = 15; i >= 0; i--) { const f = i / 16, x = 90 + (bow - inset * 2 - 90) * f; out.push([x, -hb * Math.cos(f * Math.PI / 2) ** 0.8]); }
    return out.reverse();
  };
  const COLORS = [ISO.T.red, ISO.T.blue, ISO.T.green, ISO.T.amber, ISO.T.steel];
  const slabV = (c, th, n) => [...c.map((p) => p.map((v, i) => v - (n[i] * th) / 2)), ...c.map((p) => p.map((v, i) => v + (n[i] * th) / 2))];
  const QF = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];

  function underSvg(P) {
    // below the waterline: the antifouling-red hull in two narrowing layers, the bulb, the stern tube
    const out = [ISO.tinted(ISO.T.red, S(K.extrude(plan(7, 158, -142), DRAFT, 7, P), { tone: "mid" }) + S(K.extrude(plan(1.5), DRAFT + 7, -DRAFT - 7, P), { tone: "mid" }))];
    const FB = G.frameOf([0, 0, -10], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.red, S(G.solidOf([[148, 5], [156, 6.4, 1], [166, 5.4, 1], [171, 2.6, 1], [172.5, 0.4]], FB, P), { tone: "mid" })));
    const FS = G.frameOf([0, 0, PZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.red, S(G.solidOf([[-150, 3.2], [-144, 4.4, 1], [-136, 5]], FS, P), { tone: "mid" })));           // stern tube boss
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-151.5, -150, 1.4, FS, P), { tone: "mid" })));                                       // shaft
    return named("hull", out.join(""));
  }
  function aboveSvg(P) {
    const hull = plan(0), out = [ISO.tinted(NAVY, S(K.extrude(hull, 0, DECK, P), { tone: "mid", inner: K.lineSvg(K.ringSeam(hull, 2, P), { tone: "faint" }) }))];
    out.push(ISO.tinted(NAVY, S(K.extrude(plan(0.6, 164, 128).filter(([x]) => x >= 128), DECK, 6, P), { tone: "mid" })));                         // forecastle
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(150, 8, 2.2, DECK + 6, 2.4, P, 16), { tone: "mid" }) + S(K.cylinder(150, -8, 2.2, DECK + 6, 2.4, P, 16), { tone: "mid" })));   // windlasses
    out.push(D([K.iso([158, HB * 0.42, DECK - 2], P)], { size: 1.6, tone: "hi" }));
    out.push(ISO.tinted(NAVY, ISO.wbox(P, [-163, -150], [-2.4, 2.4], [1.1, 4], "mid")));                                         // rudder horn on the transom                                              // hawse pipe
    return named("hull", out.join(""));
  }
  // the audit doesn't record K.extrude (the hull), so everything standing on the deck reads as loose there
  function containersSvg(P) {
    const out = [], k = K.cameraOf(P).k;
    let n = 0;
    for (let b = 8; b >= 0; b--) for (let c = 0; c < 3; c++) {   // far to near: the viewer is aft, on the port side
      const tiers = [3, 4, 4, 4, 3, 4, 4, 3, 2][b] - (c === 1 ? 0 : b % 3 === 2 ? 1 : 0);
      for (let z = 0; z < tiers; z++) {
        const x0 = -76 + b * 22, y0 = -15.6 + c * 10.4, z0 = DECK + z * 9;
        const tone = COLORS[(b * 7 + c * 3 + z * 5) % 5];
        out.push(ISO.tinted(tone, ISO.wbox(P, [x0, x0 + 20.6], [y0, y0 + 10], [z0, z0 + 8.8], "mid")));
        // corrugation on the faces we see (printed ribs: raw strokes that run edge to edge)
        const rib = [];
        for (let i = 1; i < 10; i++) rib.push(K.pathOf([K.iso([x0 + i * 2.06, y0 + 10, z0 + 0.6], P), K.iso([x0 + i * 2.06, y0 + 10, z0 + 8.2], P)]));
        for (let i = 1; i < 5; i++) rib.push(K.pathOf([K.iso([x0, y0 + i * 2, z0 + 0.6], P), K.iso([x0, y0 + i * 2, z0 + 8.2], P)]));
        out.push(`<path d="${rib.join("")}" stroke="#0004" stroke-width="${(0.25 * k).toFixed(2)}"/>`);
        n++;
      }
    }
    return { svg: named("containers", out.join("")), n };
  }
  function bridgeSvg(P) {
    const out = [], k = K.cameraOf(P).k;
    out.push(S(K.slabOf({ x: -126, y: -18, w: 32, d: 36, r: 1 }, DECK, 40, P, 2), { tone: "hi", inner: [1, 2, 3].map((i) => K.lineSvg(K.sideSeam({ x: -126, y: -18, w: 32, d: 36, r: 1 }, DECK + i * 10, P, 2), { tone: "faint" })).join("") }));
    out.push(S(K.slabOf({ x: -124, y: -HB - 3, w: 18, d: 2 * HB + 6, r: 1 }, DECK + 40, 7, P, 2), { tone: "hi" }));        // bridge deck with its wings
    // windows: a row on each deck facing the bow, the bridge's long window band
    const win = [];
    for (let i = 1; i < 4; i++) for (let j = 0; j < 5; j++) win.push(K.iso([-122 + j * 6, 18, DECK + i * 10 - 4], P));
    out.push(D(win, { size: (0.9 * k).toFixed(2), tone: "hi" }));
    out.push(`<path d="${K.pathOf([[-122, HB + 3, DECK + 44.5], [-108, HB + 3, DECK + 44.5]].map((p) => K.iso(p, P)))}" stroke="#2f3a48" stroke-width="${(2.6 * k).toFixed(2)}"/>`);
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(-116, 0, 0.9, DECK + 47, 14, P, 10), { tone: "mid" }) + ISO.wbox(P, [-120, -112], [-1, 1], [DECK + 59, DECK + 60.4], "hi")));   // mast and radar
    return named("bridge", out.join(""));
  }
  function funnelSvg(P) {
    const F = { x: -142, y: -7, w: 14, d: 14, r: 4 };
    return named("funnel", ISO.tinted(ISO.T.amber, S(K.slabOf(F, DECK, 52, P, 4), { tone: "mid" })) + ISO.tinted(ISO.T.plastic, S(K.slabOf(F, DECK + 52, 6, P, 4), { tone: "mid" })));
  }
  function seaSvg(P, side) {
    const X = [-190, 196], Y = [-52, 52], Z = [-27, 0], blue = "#3f86c9", out = [];
    const face = (pts) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${blue}" fill-opacity="${side === "top" ? 0.22 : 0.3}" stroke="#2a5f93" stroke-width="1" stroke-linejoin="round"/>`;
    if (side === "top") {
      out.push(face([[X[0], Y[0], 0], [X[1], Y[0], 0], [X[1], Y[1], 0], [X[0], Y[1], 0]]));
      // ripples on the surface, short strokes that stop inside the sheet
      const k = K.cameraOf(P).k, rip = [];
      for (let i = 0; i < 26; i++) { const x = X[0] + 10 + ((i * 97) % 370), y = Y[0] + 6 + ((i * 53) % 92); if (Math.abs(y) < HB + 4 && x > -176 && x < 175) continue; rip.push(K.pathOf([-4, -1.5, 0, 1.5, 4].map((d, j) => K.iso([x + d * 2, y + (j % 2 ? 0.8 : 0), 0], P)))); }
      out.push(`<path d="${rip.join("")}" fill="none" stroke="#2a6fb0" stroke-width="${(0.5 * k).toFixed(2)}" stroke-linecap="round"/>`);
    } else {
      out.push(face([[X[0], Y[1], Z[0]], [X[1], Y[1], Z[0]], [X[1], Y[1], 0], [X[0], Y[1], 0]]), face([[X[0], Y[0], Z[0]], [X[0], Y[1], Z[0]], [X[0], Y[1], 0], [X[0], Y[0], 0]]));
    }
    return out.join("");
  }
  // the propeller in the y–z plane at x = PX: four skewed blades round a boss, angle a
  function propSvg(P, a) {
    const F = G.frameOf([PX, 0, PZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]), out = [], blades = [];
    for (let i = 0; i < 4; i++) {
      const b = a + i * TAU / 4, pts = [[2, -0.35], [5, -0.62], [7.6, -0.45], [8.4, 0], [7.6, 0.4], [5, 0.5], [2, 0.3]].map(([r, d]) => G.pointOf(F, -d * 4, r, b + d));
      blades.push({ d: K.depthOf(G.pointOf(F, 0, 5, b), P), svg: `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="#e4c77c" stroke="#6b5114" stroke-width="0.9" stroke-linejoin="round"/>` });
    }
    blades.sort((p, q) => p.d - q.d);
    out.push(...blades.slice(0, 2).map((x) => x.svg), ISO.tinted(ISO.T.brass, S(G.solidOf([[-1.5, 2.6], [1.5, 2.6, 1], [3.4, 1.6, 1], [4.4, 0.3]], { ...F, a: [-1, 0, 0] }, P), { tone: "mid" })), ...blades.slice(2).map((x) => x.svg));
    return named("propeller", out.join(""));
  }
  // the rudder blade behind the propeller, turning about its stock (positive = trailing edge to starboard, −y)
  function rudderSvg(P, deg) {
    const a = deg * DEG, c = [[0, 0, -16], [-12, 0, -15], [-12, 0, 0.5], [0, 0, 0.5]];
    const V = slabV(c, 2.2, [0, 1, 0]).map(([x, y, z]) => [-160 + x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z]);
    return named("rudder", ISO.tinted(ISO.T.red, ISO.poly(V, QF, P, "mid")) + ISO.tinted(ISO.T.steel, S(K.cylinder(-160, 0, 1, 0.5, 0.6, P, 10), { tone: "mid" })));
  }

  ISO.add({
    name: "ship", title: "Container ship", compare: "ship 480 280 500",
    about: "A container ship cut out of the sea: hull, containers, bridge and funnel above the water; below it the bulbous bow, the propeller and the rudder that steers it.",
    line: "ship cx cy length run=0|1 rudder=-35..35 lab=1 lit=hull|containers|bridge|funnel|propeller|rudder",
    demo: { line: "ship 480 280 500", script: [{ set: { run: 1, lit: "propeller" }, hold: 3 }, { set: { rudder: 30, lit: "rudder" }, hold: 3 }, { set: { rudder: 0, lit: "" }, hold: 2 }, { set: { run: 0 }, hold: "settle" }] },
    make([cx, cy, size = 500], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 0.8;
      const { P, g } = ISO.frame([[-190, -52, 0], [196, -52, 0], [196, 52, -27], [-190, 52, -27], [-135, 0, DECK + 80], [-135, 0, DECK + 64]], cx, cy, W, H, { azimuth: 128, elevation: 22, pad: 8 }, parent);
      const cont = containersSvg(P);
      const words = !lab ? "" : [
        ISO.word(K.iso([PX, 0, PZ - 8.4], P), "propeller", "#555", { size: 14, anchor: "start", dy: 16 }),
        ISO.word(K.iso([-176, 0, -16], P), "rudder", "#555", { size: 14, anchor: "end", dy: 14 }),
        ISO.word(K.iso([-110, 0, DECK + 62], P), "bridge", "#555", { size: 14, anchor: "start", dy: -6 }),
        ISO.word(K.iso([20, 18, DECK + 38], P), "containers", "#555", { size: 14, dy: -8 }),
        ISO.word(K.iso([60, 52, 0], P), "waterline", "#2a5f93", { size: 13, anchor: "start", dy: 14 }),
      ].join("");
      g.innerHTML = `<g>${underSvg(P)}</g><g>${seaSvg(P, "front")}${seaSvg(P, "top")}</g>` +
        // propeller and rudder hang aft of the transom, nearer the viewer than the hull, so they come after it
        `<g>${aboveSvg(P)}</g><g data-part="prop"></g><g data-part="rud"></g><g>${cont.svg}${bridgeSvg(P)}${funnelSvg(P)}</g><g data-part="smoke"></g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const fx = ISO.puffsFx(g, P, W, H, el.smoke, 6);
      const s = { on: o.run === "1", w: o.run === "1" ? 1 : 0, a: 0, rud: ISO.clamp(ISO.num(o, "rudder", 0), -35, 35), clock: 0 };
      let wantRud = s.rud, lit = o.lit || "";
      const memo = new Map(), Q = 24;
      const smoke = () => {
        const list = Array.from({ length: 6 }, (_, i) => { const f = (s.clock * 0.25 + i / 6) % 1, amt = 0.25 + 0.55 * s.w; return [-135 - f * 40, f * 6, DECK + 60 + f * 34, 4 + f * 9, amt * Math.sin(Math.PI * f) * (1 - 0.3 * f)]; });
        if (fx) return fx(list);
        // without WebGL: the same puffs as grey discs
        w.rebuild(el.smoke, `${s.clock.toFixed(1)} ${s.w.toFixed(2)}`, () => `<g fill="#cfd6dd" stroke="#9aa3ad" stroke-width="0.5">${list.map(([x, y, z, r, al]) => { const c = K.iso([x, y, z], P); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(r * K.cameraOf(P).k * 0.7).toFixed(1)}" opacity="${(al * 0.8).toFixed(2)}"/>`; }).join("")}</g>`);
      };
      const draw = () => {
        const q = ((Math.round((s.a / (TAU / 4)) * Q) % Q) + Q) % Q;
        if (el.prop._key !== q) {
          if (!memo.has(q)) { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = propSvg(P, (q / Q) * TAU / 4); memo.set(q, e); }
          el.prop._key = q; el.prop.replaceChildren(memo.get(q)); el.prop._fresh = true;
        }
        w.rebuild(el.rud, s.rud.toFixed(1), () => rudderSvg(P, s.rud));
        smoke();
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.run !== undefined) s.on = !!+p.run; if (p.rudder !== undefined) wantRud = ISO.clamp(+p.rudder || 0, -35, 35); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const target = s.on ? 1 : 0, calm = ISO.still();
        s.w = ISO.follow(s.w, target, dt, 1.2, calm);
        if (s.w < 0.002 && !s.on) s.w = 0;
        // the steering gear swings the rudder at about 2.3°/s on a real ship; shown at 15°/s
        const d = wantRud - s.rud; s.rud = calm || Math.abs(d) < 0.05 ? wantRud : s.rud + Math.sign(d) * Math.min(Math.abs(d), 15 * dt);
        if (!calm) { s.a += s.w * 0.6 * TAU * dt; s.clock += dt * (0.4 + s.w); }
        draw();
        return s.w !== target || s.w > 0 || s.rud !== wantRud;
      };
      g.readout = () => {
        const r = s.rud, turn = Math.abs(r) < 0.5 ? "holding course" : `rudder ${Math.abs(r).toFixed(0)}° to ${r > 0 ? "starboard → stern swings to port, ship turns to starboard" : "port → stern swings to starboard, ship turns to port"}`;
        return `propeller ${(90 * s.w).toFixed(0)} rpm (shown slowed) · speed about ${(16 * s.w).toFixed(1)} knots · ${turn} · ${cont.n} containers on deck · 190 m long, 10 m draught`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
