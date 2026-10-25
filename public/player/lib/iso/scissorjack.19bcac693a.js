// "scissorjack cx cy k lift=0..1 lab=0 lit=base|arms|screw|saddle" — a PART (PARTS.md): a car's scissor jack standing
// on the floor, its origin the floor point under its middle. A stamped steel base with two uprights, four arms (each a
// pair of pressed plates with a stiffening rib) on six pins, the saddle on top with the slot the car's sill seam sits
// in, and the long lead screw across the middle: held at the right joint by a thrust washer (its eye there takes the
// crank's hook) and threaded through a nut at the left joint, so every turn pulls the joints 3 mm closer and the
// diamond grows taller; the screw's end sticks out past the nut as the jack rises. lift 0 → 1 raises the saddle's top
// from 10 to 38 cm; set({ lift }) winds it there. Anchor: top (the saddle's top, where the car's jacking point sits).
// Geometry and drawing follow the jack recipe (jack.js). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const ARM = 17.5, GAP = 1.6, ZB = 3, CAP = 2.8, Z0 = 10, Z1 = 38, PITCH = 0.3, LOAD = 400;
  const H0 = (Z0 - ZB - CAP) / 2, H1 = (Z1 - ZB - CAP) / 2;
  const STEEL = ISO.T.steel, PAINT = ISO.tint("#e9eef3", ["#9aa6b2", "#adb8c3", "#c0c9d2", "#d1d8df"], "#3b4652");
  const xAxis = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAxis = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // the diamond for lift u: half-height h, the side joints at ±xs, height zm; the saddle's pins at zt, its top at top
  const geo = (u) => { const h = H0 + (H1 - H0) * u, a = Math.sqrt(ARM * ARM - h * h); return { h, zm: ZB + h, zt: ZB + 2 * h, xs: GAP + a, top: ZB + 2 * h + CAP }; };
  const G0 = geo(0), SCREW = 2 * G0.xs + 5;
  const turnsAt = (u) => (2 * (G0.xs - geo(u).xs)) / PITCH;
  const pull = (u) => { const { h, xs } = geo(u); return (LOAD * 9.81 * (xs - GAP)) / h; };   // N along the screw holding LOAD kg

  // a box along the segment A→B in the x–z plane, w across it in that plane, y through it
  const bar = (P, A, B, [w0, w1], [y0, y1], ext = 1.4) => {
    const dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
    return ISO.box((u, w, y) => [A[0] + ux * u - uz * w, y, A[1] + uz * u + ux * w], P, [-ext, l + ext], [w0, w1], [y0, y1], "mid");
  };
  const pin = (P, x, z, y) => S(G.disc(y, y + 0.6, 0.95, yAxis([x, 0, z]), P), { tone: "hi" }) + D([K.iso([x, y + 0.6, z], P)], { size: 0.5, tone: "mid" });
  function baseSvg(P, back) {
    if (back) return ISO.wbox(P, [-13, 13], [-5.2, 5.2], [0, 0.8], "mid") + ISO.wbox(P, [-9, 9], [-4, -3.3], [0.8, ZB + 1.4], "mid") +
      D([[-11.2, 3.8], [11.2, 3.8], [-11.2, -3.8], [11.2, -3.8]].map(([x, y]) => K.iso([x, y, 0.8], P)), { size: 0.5 }) + L(K.planOutline({ x: -12.2, y: -4.4, w: 24.4, d: 8.8, r: 1 }, 0.8, P, 2), { tone: "faint" });
    return ISO.wbox(P, [-9, 9], [3.3, 4], [0.8, ZB + 1.4], "mid") + D([-GAP, GAP].map((x) => K.iso([x, 4, ZB], P)), { size: 0.55, tone: "hi" });
  }
  // the four arms' back plates (y −3…−2.2) or front plates (2.2…3); the front ones show a pressed rib (a closed slot)
  function armsSvg(P, g, side) {
    const y = side === "back" ? [-3, -2.2] : [2.2, 3], out = [];
    for (const sx of [-1, 1]) {
      const joint = [sx * g.xs, g.zm];
      out.push(bar(P, [sx * GAP, ZB], joint, [-1.3, 1.3], y), bar(P, [sx * GAP, g.zt], joint, [-1.3, 1.3], y));
      if (side === "front") for (const A of [[sx * GAP, ZB], [sx * GAP, g.zt]]) {
        const dx = joint[0] - A[0], dz = joint[1] - A[1], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
        out.push(L(K.pathOf([[3, -0.45], [l - 3, -0.45], [l - 3, 0.45], [3, 0.45]].map(([u, w]) => K.iso([A[0] + ux * u - uz * w, 3.02, A[1] + uz * u + ux * w], P)), true), { tone: "faint" }));
      }
    }
    return out.join("");
  }
  // built once at the folded pose and moved with a translate: the screw rides with the right joint, the nut with the left
  const Fs = G.frameOf([G0.xs + 1.2, 0, G0.zm], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  function screwInSvg(P) {
    const rings = []; for (let s = 1.2; s < SCREW - 0.6; s += 0.6) rings.push(G.arcOf(Fs, s, 0.8, P));
    return S(G.solidOf([[0, 0.8], [SCREW - 0.3, 0.8], [SCREW, 0.55]], Fs, P), { tone: "hi", inner: L(rings.join(""), { tone: "lo" }) });
  }
  const blockSvg = (P, x, z) => ISO.wbox(P, [x - 1.2, x + 1.2], [-2.2, 2.2], [z - 1.3, z + 1.3], "mid");
  function nutSvg(P) {
    const x = -G0.xs - 1.2;
    return S(G.prismOf(xAxis([x, 0, G0.zm]), Array.from({ length: 6 }, (_, i) => [Math.cos(0.5 + i * 1.047) * 1.7, Math.sin(0.5 + i * 1.047) * 1.7]), -1.4, 0, P), { tone: "mid" }) + blockSvg(P, -G0.xs, G0.zm);
  }
  // the thrust washer, the bearing and the eye (a ring the crank's hook goes through) past the right joint
  function screwOutSvg(P) {
    const x = G0.xs + 1.2, z = G0.zm;
    return S(G.disc(0, 0.5, 1.9, xAxis([x, 0, z]), P), { tone: "mid" }) + S(G.disc(0.5, 1.5, 1.3, xAxis([x, 0, z]), P), { tone: "hi" }) +
      S(G.disc(1.5, 2.6, 0.8, xAxis([x, 0, z]), P), { tone: "hi" }) + S(G.ringBand(-0.55, 0.55, 0.7, 1.5, yAxis([x + 3.9, 0, z]), P), { tone: "hi" });
  }
  function saddleSvg(P, z, back) {
    if (back) return ISO.wbox(P, [-4.5, 4.5], [-3.9, -3.2], [z - 1.6, z + 0.8], "mid");
    return ISO.wbox(P, [-4.5, 4.5], [3.2, 3.9], [z - 1.6, z + 0.8], "mid") + D([-GAP, GAP].map((x) => K.iso([x, 3.9, z], P)), { size: 0.55, tone: "hi" }) +
      ISO.wbox(P, [-5.5, 5.5], [-3.9, 3.9], [z + 0.8, z + 1.8], "hi") + ISO.wbox(P, [-5.5, 5.5], [-3.9, -1.1], [z + 1.8, z + CAP], "hi") + ISO.wbox(P, [-5.5, 5.5], [1.1, 3.9], [z + 1.8, z + CAP], "hi");
  }

  ISO.add({
    name: "scissorjack", title: "Scissor jack (part)", compare: null,
    about: "A car's scissor jack on the floor: base, four arms on pins, the long screw with its eye across the middle and the saddle on top; each turn of the screw pulls the side joints together and lift 0 → 1 raises the saddle from 10 to 38 cm. anchors: top",
    line: "scissorjack cx cy k lift=0..1 lab=0 lit=base|arms|screw|saddle",
    demo: { line: "scissorjack 470 430 9 lift=0.1 lab=1", script: [{ set: {}, hold: 1 }, { set: { lift: 0.6, lit: "screw" }, hold: "settle" }, { set: { lift: 1, lit: "saddle" }, hold: "settle" }, { set: { lift: 0.3, lit: "arms" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const names = ["base0", "saddle0", "arms0", "screwIn", "nut", "blockR", "screwOut", "arms", "pinL", "pinR", "base", "saddle", "words"];
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -14, y: -6, w: 28, d: 12, r: 2 }, 0, 1, P)}"/><g style="${PAINT}">` + names.map((n) => `<g data-k="${n}"></g>`).join("") + "</g>";
      const el = Object.fromEntries(names.map((n) => [n, g.querySelector(`[data-k="${n}"]`)])), w = ISO.writer();
      el.base0.innerHTML = baseSvg(P, true); el.base.innerHTML = baseSvg(P, false);
      for (const n of ["screwIn", "nut", "blockR", "screwOut"]) el[n].setAttribute("style", STEEL);
      el.screwIn.innerHTML = screwInSvg(P); el.nut.innerHTML = nutSvg(P); el.blockR.innerHTML = blockSvg(P, G0.xs, G0.zm); el.screwOut.innerHTML = screwOutSvg(P);
      el.saddle0.innerHTML = saddleSvg(P, G0.zt, true); el.saddle.innerHTML = saddleSvg(P, G0.zt, false);
      el.pinL.innerHTML = pin(P, -G0.xs, G0.zm, 3); el.pinR.innerHTML = pin(P, G0.xs, G0.zm, 3);
      const groups = { base: [el.base0, el.base], saddle: [el.saddle0, el.saddle], arms: [el.arms0, el.arms, el.pinL, el.pinR], screw: [el.screwIn, el.nut, el.blockR, el.screwOut] };
      for (const [n, list] of Object.entries(groups)) for (const e of list) e.dataset.name = n;
      const all = Object.values(groups).flat();
      const s = { lift: ISO.clamp(ISO.num(o, "lift", 0), 0, 1) }, goal = { lift: s.lift };
      let lit = o.lit || "";
      const draw = () => {
        const gm = geo(s.lift), key = s.lift.toFixed(4), dz = gm.zm - G0.zm, dx = gm.xs - G0.xs;
        g.anchors.top = [0, 0, gm.top];
        w.rebuild(el.arms0, key, () => armsSvg(P, gm, "back"));
        w.rebuild(el.arms, key, () => armsSvg(P, gm, "front"));
        for (const e of [el.saddle0, el.saddle]) w.attr(e, "transform", K.translateAlong(P, [0, 0, 2 * dz]));
        for (const e of [el.screwIn, el.blockR, el.screwOut, el.pinR]) w.attr(e, "transform", K.translateAlong(P, [dx, 0, dz]));
        for (const e of [el.nut, el.pinL]) w.attr(e, "transform", K.translateAlong(P, [-dx, 0, dz]));
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" : [
          ISO.word(K.iso([0, 0, gm.top], P), "saddle", "#444", { size: 14, dy: -10 }),
          ISO.word(K.iso([gm.xs + 5.4, 0, gm.zm], P), "screw", "#444", { anchor: "start", size: 14, dy: 5 }),
          ISO.word(K.iso([-(GAP + gm.xs) / 2, 3, (ZB + gm.zm) / 2], P), "arm", "#444", { anchor: "end", size: 14, dy: 12 }),
          ISO.word(K.iso([-13, 5.2, 0], P), "base", "#444", { anchor: "end", size: 14, dy: 4 }),
        ].join(""));
        w.light(all, groups[lit] || []);
      };
      g.set = (p) => {
        if (p.lift !== undefined) goal.lift = ISO.clamp(+p.lift, 0, 1);
        if (p.lit !== undefined) { lit = p.lit; draw(); }
      };
      g.update = (dt) => {
        if (s.lift === goal.lift) return false;
        s.lift = ISO.follow(s.lift, goal.lift, dt, 0.6, ISO.still());
        if (Math.abs(s.lift - goal.lift) < 0.0005) s.lift = goal.lift;
        draw();
        return s.lift !== goal.lift;
      };
      g.readout = () => `scissor jack · saddle top ${geo(s.lift).top.toFixed(1)} cm high (10 folded, 38 fully up) · ${Math.round(turnsAt(s.lift))} turns of the screw from folded (3 mm each) · holding ${LOAD} kg the screw pulls ${(pull(s.lift) / 1000).toFixed(1)} kN`;
      draw();
      return g;
    },
  });
})();
