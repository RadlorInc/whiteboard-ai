// "tidal cx cy width tide=-1..1 lab=1" — a tidal stream turbine as a museum model in a clear acrylic sea block.
// The walnut plinth carries the seabed cut open along the front (sand over rock, scour stones round the feet) and a
// block of clear sea over it. On the bed stands the turbine: a tripod of steel legs on pads, the column, the yaw
// bearing, the nacelle with its gearbox and generator, the hub and three blades 10 m long, and the export cable along
// the bed to the shore. tide=1 is the flood running left to right at 2.5 m/s, 0 is slack water, -1 the ebb running
// back; the rotor turns one way on the flood and the other on the ebb, and the readout gives P = ½ ρ A v³ Cp.
// World units: 1 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S, D = M.D;
  const Y0 = -38, CUT = 0, SEA = 30, HUB = [-9.5, -19, 15.5], RR = 10, VMAX = 2.5, CP = 0.4, RATED = 1.5;
  const PLINTH = { x: -50, y: -45, w: 100, d: 62, r: 4 }, XB = 44;
  const BED = [[-XB, -4], [XB, -4], [XB, 0.6], [30, 0], [12, 0.8], [-16, 0], [-34, 0.7], [-XB, 0]];
  const ROCK = [[-XB, -10], [XB, -10], [XB, -4], [-XB, -4]];
  const C = [-3, -19], FEET = [0, 120, 240].map((d) => { const a = ((d + 30) * Math.PI) / 180; return [C[0] + 9.5 * Math.cos(a), C[1] + 9.5 * Math.sin(a)]; });
  const bedZ = (x) => { for (let i = 2; i < BED.length - 1; i++) { const [x1, z1] = BED[i], [x0, z0] = BED[i + 1]; if (x <= x1 && x >= x0) return z0 + ((z1 - z0) * (x - x0)) / (x1 - x0); } return 0; };
  const AXF = (o) => G.frameAlong(o, [1, 0, 0]);

  function bedSvg(P) {
    const out = [`<g transform="${K.translateAlong(P, [0, 0, -10])}">${M.plinth(P, PLINTH)}</g>`];   // the plinth's top meets the block's floor
    out.push(M.sec(P, ROCK, Y0, CUT, "rock", M.grains(P, ROCK, CUT, 50, "#8d939a", 0.7, 4)));
    out.push(M.sec(P, BED, Y0, CUT, "sand", M.grains(P, BED, CUT, 40, "#a8925a", 0.45, 6)));
    const k = K.cameraOf(P).k;
    // scour stones round the feet, pads, legs, column and yaw bearing
    for (const [x, y] of FEET) {
      for (let i = 0; i < 7; i++) { const a = i * 0.9, r = 3.4; out.push(ISO.tinted(ISO.T.road, S(G.sphereOf([x + r * Math.cos(a), y + r * Math.sin(a), bedZ(x) + 0.4], 0.9, P, { steps: 12 }), { tone: "mid" }))); }
      out.push(ISO.tinted(ISO.T.amber, S(K.cylinder(x, y, 2.2, bedZ(x), 1.4, P, 20), { tone: "mid" })));
    }
    const legs = FEET.map(([x, y]) => ({ k: K.depthOf([x, y, 0], P), svg: M.pipe(P, [[x, y, bedZ(x) + 1.4], [C[0] + (x - C[0]) * 0.19, C[1] + (y - C[1]) * 0.19, 9]], 0.8, { body: "#f2cd45", ink: "#6b5208", shine: "#fbe9a0" }) }));
    legs.sort((a, b) => a.k - b.k);
    const back = legs.filter((l) => l.k < K.depthOf([C[0], C[1], 0], P)), front = legs.filter((l) => l.k >= K.depthOf([C[0], C[1], 0], P));
    out.push(...back.map((l) => l.svg));
    out.push(ISO.tinted(ISO.T.amber, S(K.cylinder(C[0], C[1], 1.7, bedZ(C[0]), HUB[2] - 3.4 - bedZ(C[0]), P, 24), { tone: "hi" })));
    out.push(...front.map((l) => l.svg));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(C[0], C[1], 2.3, HUB[2] - 3.4, 1.2, P, 24), { tone: "mid" })));
    // the export cable from the column's foot along the bed and out through the block's right side
    const cab = [[C[0] + 1.7, C[1], 1.2], [8, -19, bedZ(8) + 0.4], [28, -16, bedZ(28) + 0.4], [XB, -14, bedZ(XB) + 0.4]];
    out.push(`<path d="${K.pathOf(cab.map((p) => K.iso(p, P)))}" fill="none" stroke="#2a2b2f" stroke-width="${(1.1 * k).toFixed(2)}" stroke-linecap="round"/>`);
    return out.join("");
  }
  // nacelle along x: tail cone, body with a service hatch seam, the hub's spinner at the front (−x)
  function nacelleSvg(P) {
    const F = AXF([HUB[0] + 1.2, HUB[1], HUB[2]]), out = [];
    out.push(ISO.tinted(ISO.T.amber, S(G.lathe([[0, 0], [0, 2.2], [0.8, 2.4, 1], [9.4, 2.4, 1], [11.4, 1.5, 1], [12.2, 0]], F, P, { steps: 40 }), { tone: "hi", inner: `<path d="${G.arcOf(F, 4, 2.42, P) + G.arcOf(F, 7.4, 2.42, P)}" fill="none" stroke="#8a5a10" stroke-width=".6"/>` })));
    return out.join("");
  }
  function hubSvg(P) {
    const F = AXF([HUB[0] + 1.2, HUB[1], HUB[2]]);
    return ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 2.3], [-1.6, 2.1, 1], [-3, 1.2, 1], [-3.6, 0]], F, P, { steps: 32 }), { tone: "hi" }));
  }
  // three blades in the plane x = HUB[0], turned to angle th about x; drawn round the nacelle by depth
  const POSE = new Map();
  function rotorSvg(P, th, parts) {
    const ref = K.depthOf([HUB[0] + 2, HUB[1], HUB[2]], P), blades = [];
    for (let i = 0; i < 3; i++) {
      const a = th + (i * 2 * Math.PI) / 3;
      const at = (u, w, x) => { const c = 1.25 - 0.085 * u, tw = 0.5 - 0.04 * u; return [HUB[0] + x + w * c * Math.sin(tw), HUB[1] + u * Math.cos(a) - w * c * Math.cos(tw) * Math.sin(a), HUB[2] + u * Math.sin(a) + w * c * Math.cos(tw) * Math.cos(a)]; };
      blades.push({ k: K.depthOf(at(5, 0, 0), P), svg: ISO.tinted(ISO.T.paint, ISO.box(at, P, [1.8, RR], [-1.1, 1.1], [-0.3, 0.3], "mid")) });
    }
    return blades.filter((b) => b.k < ref).map((b) => b.svg).join("") + parts + blades.filter((b) => b.k >= ref).map((b) => b.svg).join("");
  }
  // the sea: a clear block (tinted see-through) with its waterline drawn on the front and side
  function seaSvg(P) {
    const out = [`<g opacity=".28">${M.sec(P, [[-XB, 0], [XB, 0.6], [XB, SEA], [-XB, SEA]], Y0, CUT, "sea")}</g>`];
    const k = K.cameraOf(P).k, line = [[-XB, CUT, SEA], [XB, CUT, SEA], [XB, Y0, SEA]];
    out.push(`<path d="${K.pathOf(line.map((p) => K.iso(p, P)))}" fill="none" stroke="#285f98" stroke-width="${(0.5 * k).toFixed(2)}"/>`);
    return out.join("");
  }

  ISO.add({
    name: "tidal", title: "Tidal stream turbine", compare: "tidal 480 260 480",
    about: "A tidal turbine on a tripod on the seabed, in a clear sea block: the flood tide turns the rotor one way, slack water stops it, the ebb turns it back.",
    line: "tidal cx cy width tide=-1..1 lab=1 lit=rotor|nacelle|tripod|cable",
    demo: { line: "tidal 480 270 520 tide=0", script: [{ set: { tide: 1 }, hold: 5 }, { set: { tide: 0 }, hold: 4 }, { set: { tide: -1 }, hold: 5 }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.05, H = size * 0.75;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, -23, -10), [-XB, Y0, SEA], [XB, CUT, SEA], [XB, Y0, SEA]], cx, cy, W, H, { azimuth: 58, elevation: 26 }, parent);
      g.innerHTML = `<g data-name="tripod">${bedSvg(P)}</g><g data-name="rotor" data-part="rotor"></g><g>${seaSvg(P)}</g><g data-part="flow"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const parts = `<g data-name="nacelle">${nacelleSvg(P)}</g>${hubSvg(P)}`;
      POSE.clear();
      const s = { tide: ISO.clamp(ISO.num(o, "tide", 1), -1, 1), v: 0, th: 0, ph: 0 };
      let want = s.tide, lit = o.lit || "";
      s.v = s.tide;
      const draw = () => {
        const pitch = (2 * Math.PI) / 3, q = Math.round((((s.th % pitch) + pitch) % pitch) / pitch * 30) % 30;
        w.rebuild(el.rotor, q, () => { if (!POSE.has(q)) POSE.set(q, rotorSvg(P, (q / 30) * pitch, parts)); return POSE.get(q); });
        const amt = Math.abs(s.v), fk = amt > 0.03 ? `${(Math.round(s.ph * 2) / 2 % 16).toFixed(1)} ${Math.round(amt * 20)}` : "";
        w.rebuild(el.flow, fk, () => {
          if (!fk) return "";
          const dir = Math.sign(s.v), runs = [[CUT + 0.2, 8], [CUT + 0.2, 30], [CUT + 0.2, 38], [-30, 33], [-30, 8], [-50, 24]];
          return runs.map(([y, z], i) => { const a = [-XB + 3, y, z], b = [XB - 3, y, z]; return M.flow(P, dir > 0 ? [a, b] : [b, a], s.ph * (z > 15 ? 1 : 0.8) + i * 5, { gap: 16, dash: 7, amount: Math.min(1, amt * 1.4), color: y === CUT + 0.2 ? "#1f4f8f" : "#5e95c6", w: 1.4 }); }).join("");
        });
        const dirWord = s.v > 0.05 ? "flood tide →" : s.v < -0.05 ? "← ebb tide" : "slack water";
        w.rebuild(el.words, lab ? dirWord : "", () => !lab ? "" : [
          M.label(P, [-XB + 4, CUT, SEA + 3], dirWord, "#1f4f8f", { size: 15, anchor: "start" }), M.label(P, [HUB[0], HUB[1] + RR, HUB[2] - RR], "rotor", "#33506f", { anchor: "end", dy: 4 }),
          M.label(P, [4, -19, HUB[2] + 3], "nacelle: gearbox + generator", "#444", { anchor: "start", dy: -4 }), M.label(P, [-28, CUT, 0], "seabed", "#6b4f2e", { dy: 14 }),
          M.label(P, [34, -14, 2], "cable to shore", "#444", { dy: -6 })].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => { if (p.tide !== undefined) want = ISO.clamp(+p.tide, -1, 1); if (p.lit !== undefined) lit = p.lit; };
      // the tide turns over minutes; here it eases over a few seconds, and the rotor's speed follows the current
      g.update = (dt) => {
        const calm = ISO.still();
        s.v = ISO.follow(s.v, want, dt, 0.9, calm); if (Math.abs(s.v - want) < 2e-3) s.v = want;
        if (!calm) { s.th += dt * 2.2 * s.v; s.ph += dt * 26 * Math.abs(s.v); }
        draw();
        return Math.abs(s.v) > 0.01 || s.v !== want;
      };
      g.readout = () => {
        const v = Math.abs(s.v) * VMAX, A = Math.PI * RR * RR, Pw = Math.min(RATED * 1e6, 0.5 * 1025 * A * v ** 3 * CP);
        return `current ${v.toFixed(1)} m/s ${s.v > 0.02 ? "(flood)" : s.v < -0.02 ? "(ebb)" : "(slack)"} · power = ½ ρ A v³ Cp = ½ × 1025 × ${A.toFixed(0)} m² × ${v.toFixed(1)}³ × ${CP} ≈ ${(Pw / 1000).toFixed(0)} kW (rated ${RATED} MW) · double the current, eight times the power`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
