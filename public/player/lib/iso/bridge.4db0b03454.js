// "bridge cx cy width k=beam|arch|suspension|cable|truss forces=1 truck=0..1 load=40 lab=1" — a river crossing as a
// museum model. A walnut plinth carries a block of ground cut along its front: rock, the river-bed silt, the two banks
// and the river in section, embankments carrying the road up to deck level. Across it stands one of five bridges:
// a girder on two river piers (beam), a concrete arch with spandrel columns (arch), two towers with parabolic main
// cables, hangers and anchorages (suspension), one pylon with a fan of stays (cable), or a Warren truss (truss). A
// lorry drives across (truck=0..1). With forces=1 every member takes the colour of its force — compression red,
// tension blue, stronger colour for more force — the deck sags under the lorry (drawn 150× bigger than it is) and
// arrows show the load and what the supports push back. The readout gives the true statics: reactions, moments,
// cable pull, stay and chord forces, for a deck of 10 t per metre and the lorry's weight. World units: 1 m.
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const Y0 = -30, CUT = 0, BOT = -24, YB = -16, YF = -8, DT = 16, DB = 12, gD = 98.1;   // deck 10 t/m = 98.1 kN/m
  const PLINTH = { x: -146, y: -38, w: 292, d: 58, r: 4 };
  const RED = "#c0392b", BLUE = "#1f4f8f", GREY = "#9aa1a9";
  const KINDS = ["beam", "arch", "suspension", "cable", "truss"];
  // the spans the deck sags over, per kind, and how much the drawing exaggerates it
  const SPANS = { beam: [-100, -35, 35, 100], arch: [-80, 80], suspension: [-60, 60], cable: [-100, 0, 100], truss: [-96, 96] };
  const AMP = { beam: 1.4, arch: 0.5, suspension: 2.4, cable: 1.6, truss: 1.2 };
  const f1 = (v) => v.toFixed(1);
  const iso = (P, p) => K.iso(p, P);
  const tube = (P, pts, w, color) => {
    const k = K.cameraOf(P).k, d = K.pathOf(pts.map((p) => iso(P, p)));
    return `<path d="${d}" fill="none" stroke="#2f343a" stroke-width="${f1((w + 0.7) * k)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${f1(w * k)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const CONC = M.tintOf("concrete"), SOIL = M.tintOf("soil");
  const box = (P, x, y, z, tint = CONC, tone = "mid") => ISO.tinted(tint, ISO.wbox(P, x, y, z, tone));

  // the ground: rock, silt, banks, grass, the river (water only up to its surface, so piers rise out of it)
  function groundSvg(P) {
    const out = [M.plinth(P, PLINTH, { z: BOT })];
    const ROCK = [[-140, BOT], [140, BOT], [140, -16], [-140, -16]];
    out.push(M.sec(P, ROCK, Y0, CUT, "rock", M.grains(P, ROCK, CUT, 40, "#8d939a", 0.7, 5)));
    const SILT = [[-72, -16], [72, -16], [72, -12], [-72, -12]];
    out.push(M.sec(P, SILT, Y0, CUT, "sand", M.grains(P, SILT, CUT, 30, "#8a7440", 0.4, 2)));
    for (const s of [-1, 1]) {
      const bank = [[-140, -16], [-72, -16], [-72, -12], [-90, 8], [-140, 8]].map(([x, z]) => [s * x, z]);
      out.push(M.sec(P, s > 0 ? bank.reverse() : bank, Y0, CUT, "soil", M.grains(P, bank, CUT, 26, "#8a6a45", 0.6, 3 + s)));
      out.push(M.sec(P, [[-140, 8], [-90, 8], [-90.6, 8.8], [-140, 8.8]].map(([x, z]) => [s * x, z]), Y0, CUT, "grass"));
    }
    out.push(M.sec(P, [[-72, -12], [72, -12], [82.8, 0], [-82.8, 0]], Y0, CUT, "water"));
    // ripples on the water's top, edge to edge across the river's width
    const k = K.cameraOf(P).k;
    out.push(`<path d="${[-50, -20, 10, 40].map((x, i) => K.pathOf([iso(P, [x, Y0 + 6 + i * 5, 0.02]), iso(P, [x + 10, Y0 + 6 + i * 5, 0.02])])).join("")}" stroke="#fdfdfb" stroke-width="${f1(0.6 * k)}" stroke-linecap="round" opacity=".8"/>`);
    // embankments up to deck level, the road on them, abutments where the deck lands
    for (const s of [-1, 1]) {
      const xs = (a, b) => (s < 0 ? [-b, -a] : [a, b]);
      out.push(M.named("abutments", box(P, xs(90, 100), [-18, -6], [8, DB])));
      out.push(box(P, xs(100, 140), [-18, -6], [8, DT - 0.3], SOIL, "lo"), box(P, xs(100, 140), [YB, YF], [DT - 0.3, DT], ISO.T.road, "hi"));
      out.push(M.tree(P, s * 116, -25, 8.8, 0.6), M.tree(P, s * 132, -25.5, 8.8, 0.55));
    }
    return out.join("");
  }
  // audit.mjs notes: banks and grass are prismY sections it doesn't record, so the abutments, embankments and trees
  // on them read as loose; anchorages are cast into the embankments and the tower cross-beams run through the legs
  // (both sunk on purpose).
  // the fixed structure per kind: back parts (drawn before the deck) and front parts (after the lorry)
  function fixedSvg(P, k) {
    const back = [], front = [];
    if (k === "beam") for (const x of [-35, 35]) back.push(M.named("piers", box(P, [x - 5, x + 5], [-20, -4], [0, 1.5]) + box(P, [x - 2.4, x + 2.4], [-15, -9], [1.5, 10.6]) + box(P, [x - 4, x + 4], [-18, -6], [10.6, DB - 0.4]) +
      box(P, [x - 1.2, x + 1.2], [-15, -13], [DB - 0.4, DB], ISO.T.steel, "hi") + box(P, [x - 1.2, x + 1.2], [-11, -9], [DB - 0.4, DB], ISO.T.steel, "hi")));
    if (k === "arch") for (const s of [-1, 1]) back.push(M.named("arch", box(P, s < 0 ? [-88, -78] : [78, 88], [-18, -6], [-5, 0])));
    if (k === "suspension") {
      for (const x of [-60, 60]) {
        back.push(box(P, [x - 5, x + 5], [-21, -3], [0, 2]), M.named("towers", box(P, [x - 2, x + 2], [-19, -16], [2, 58]) + box(P, [x - 1.6, x + 1.6], [-19, -5], [9, DB - 0.2])));
        front.push(M.named("towers", box(P, [x - 2, x + 2], [-8, -5], [2, 58]) + box(P, [x - 1.4, x + 1.4], [-19, -16], [58, 59.6], ISO.T.steel, "hi") + box(P, [x - 1.4, x + 1.4], [-8, -5], [58, 59.6], ISO.T.steel, "hi") + box(P, [x - 1.6, x + 1.6], [-19, -5], [30, 33]) + box(P, [x - 1.6, x + 1.6], [-19, -5], [53, 56])));
      }
      for (const s of [-1, 1]) front.push(M.named("anchor", box(P, s < 0 ? [-133, -117] : [117, 133], [-21, -3], [8, DT])));
    }
    if (k === "cable") {
      back.push(box(P, [-6, 6], [-22, -2], [0, 2]), M.named("towers", box(P, [-2.4, 2.4], [-19, -16], [2, 66]) + box(P, [-2, 2], [-19, -5], [8, DB - 0.2])));
      front.push(M.named("towers", box(P, [-2.4, 2.4], [-8, -5], [2, 66]) + box(P, [-2, 2], [-19, -5], [62, 66])));
    }
    if (k === "truss") for (const x of [-96, 96]) back.push(box(P, [x - 1.5, x + 1.5], [-17, -15], [DB, DB + 0.8], ISO.T.steel, "hi"), box(P, [x - 1.5, x + 1.5], [-9, -7], [DB, DB + 0.8], ISO.T.steel, "hi"));
    return [back.join(""), front.join("")];
  }

  // statics: the span holding x, the lorry's sag shape and the bending moment and shear there
  const spanOf = (k, x) => { const s = SPANS[k]; for (let i = 1; i < s.length; i++) if (x >= s[i - 1] && x <= s[i]) return [s[i - 1], s[i]]; return null; };
  const sagAt = (k, x, xt, Wn) => {
    const sp = spanOf(k, xt);
    if (!sp || x < sp[0] || x > sp[1]) return 0;
    const L = sp[1] - sp[0], a = xt - sp[0], b = L - a, X = x - sp[0], d = X <= a ? (b * X * (L * L - b * b - X * X)) / (6 * L) : (a * (L - X) * (L * L - a * a - (L - X) * (L - X))) / (6 * L);
    return (AMP[k] * Wn * d) / ((L * L * L) / 48);
  };
  // moment (kN·m) and shear (kN) at x on a simply supported span [x0, x1] from the deck's weight and the lorry
  const MV = (x0, x1, x, xt, W) => {
    const L = x1 - x0, X = x - x0, a = xt - x0, on = xt > x0 && xt < x1;
    const m = (gD * X * (L - X)) / 2 + (on ? (X <= a ? (W * X * (L - a)) / L : (W * a * (L - X)) / L) : 0);
    const v = gD * (L / 2 - X) + (on ? (X < a ? W * (1 - a / L) : (-W * a) / L) : 0);
    return [m, v];
  };
  const colourOf = (F, ref, on, plain) => (!on ? plain : `color-mix(in srgb, ${F < 0 ? RED : BLUE} ${Math.round(25 + 75 * Math.min(1, Math.abs(F) / ref))}%, ${GREY})`);

  // everything that changes with the lorry: members behind the deck, the deck, members in front, force arrows
  function liveSvg(P, k, xt, W, forces) {
    const Wn = W / 392.4, onBridge = Math.abs(xt) < 100;
    const sag = (x) => (forces && onBridge ? sagAt(k, x, xt, Wn) : 0);
    const back = [], front = [], arrows = [];
    const both = (fn) => { back.push(fn(YB, "b")); front.push(fn(YF, "f")); };
    if (k === "arch") {
      const za = (x) => -2 + 12 * (1 - (x / 80) ** 2), f = 12, L = 160, a = xt + 80;
      const M0 = onBridge && Math.abs(xt) < 80 ? (W * Math.min(a, L - a)) / 2 : 0, H = ((gD * L * L) / 8 + M0) / f;
      const rib = Array.from({ length: 33 }, (_, i) => -80 + i * 5);
      // the thrust grows only a little toward the springings (N = H·√(1+z'²)), so one colour per rib reads true
      both((y) => M.named("arch", tube(P, rib.map((x) => [x, y + (y < -12 ? 1 : -1), za(x)]), 2.8, colourOf(-H * 1.1, 1.9e5, forces, "#cfccc4"))));
      for (const x of [-70, -56, -42, -28, -14, 14, 28, 42, 56, 70]) {
        const share = gD * 7 + (onBridge ? W * Math.max(0, 1 - Math.abs(xt - x) / 14) / 2 : 0);
        both((y) => tube(P, [[x, y + (y < -12 ? 1 : -1), za(x)], [x, y + (y < -12 ? 1 : -1), DB - sag(x)]], 1.4, colourOf(-share, 1100, forces, "#cfccc4")));
      }
      if (forces) for (const s of [-1, 1]) arrows.push(M.arrow(P, [s * 100, -3, -2], [s * 84, -3, -2], { color: RED, w: 2, head: 5 }));
    }
    if (k === "suspension") {
      const L = 120, f = 30, a = xt + 60, on = onBridge && Math.abs(xt) < 60;
      const H = ((gD / 2) * L * L / 8 + (on ? (W / 2) * Math.min(a, L - a) / 2 : 0)) / f;
      const zc = (x) => (Math.abs(x) <= 60 ? 26 + 30 * (x / 60) ** 2 : 58 - (43 * (Math.abs(x) - 60)) / 65);
      const cable = [-125, ...Array.from({ length: 25 }, (_, i) => -60 + i * 5), 125].map((x) => x);
      const yc = (y) => (y < -12 ? -17.5 : -6.5);
      both((y) => M.named("cables", tube(P, cable.map((x) => [x, yc(y), zc(x)]), 1.3, colourOf(H, 9000, forces, "#5a6068"))));
      for (let x = -96; x <= 96; x += 8) {
        if (Math.abs(Math.abs(x) - 60) < 3) continue;
        const share = (gD * 8) / 2 + (onBridge ? (W / 2) * Math.max(0, 1 - Math.abs(xt - x) / 8) : 0);
        both((y) => tube(P, [[x, yc(y), zc(x)], [x, yc(y), DT - 2 - sag(x)]], 0.45, colourOf(share, 600, forces, "#5a6068")));
      }
      if (forces) for (const s of [-1, 1]) arrows.push(M.arrow(P, [s * 125, -2, 15], [s * 136, -2, 8], { color: BLUE, w: 2, head: 5 }));
    }
    if (k === "cable") {
      for (const s of [-1, 1]) for (let i = 1; i <= 6; i++) {
        const xd = s * 16 * i, zp = 38 + 4 * i, sin = (zp - DT) / Math.hypot(zp - DT, 16 * i);
        const T = ((gD * 16 + (onBridge ? W * Math.max(0, 1 - Math.abs(xt - xd) / 16) : 0)) / 2) / sin;
        both((y) => M.named("cables", tube(P, [[0, y < -12 ? -17.5 : -6.5, zp], [xd, y, DT - 0.6 - sag(xd)]], 0.55, colourOf(T, 2600, forces, "#5a6068"))));
      }
    }
    if (k === "truss") {
      const h = 18, bz = (x) => DT - 2 - sag(x), tz = (x) => bz(x) + h, sin = h / Math.hypot(h, 6);
      const mv = (x) => MV(-96, 96, x, xt, onBridge ? W : 0);
      const ref = mv(0)[0] / h * 1.2;
      both((y) => {
        const out = [];
        for (let j = 0; j < 16; j++) {
          const xb0 = -96 + 12 * j, xt0 = xb0 + 6, xb1 = xb0 + 12, V = mv(xt0)[1];
          out.push(tube(P, [[xb0, y, bz(xb0)], [xb1, y, bz(xb1)]], 1.5, colourOf(mv(xt0)[0] / h, ref, forces, "#c9ced4")));
          if (j < 15) out.push(tube(P, [[xt0, y, tz(xt0)], [xt0 + 12, y, tz(xt0 + 12)]], 1.6, colourOf(-mv(xt0 + 6)[0] / h, ref, forces, "#c9ced4")));
          out.push(tube(P, [[xb0, y, bz(xb0)], [xt0, y, tz(xt0)]], 1, colourOf(-V / sin, ref * 0.35, forces, "#c9ced4")), tube(P, [[xt0, y, tz(xt0)], [xb1, y, bz(xb1)]], 1, colourOf(V / sin, ref * 0.35, forces, "#c9ced4")));
        }
        return M.named("truss", out.join(""));
      });
      // portal struts across the top, from the back truss to the front one
      front.unshift(`<path d="${Array.from({ length: 8 }, (_, j) => -90 + 24 * j).map((x) => K.pathOf([iso(P, [x, YB, tz(x)]), iso(P, [x, YF, tz(x)])])).join("")}" stroke="#2f343a" stroke-width="${f1(0.7 * K.cameraOf(P).k)}"/>`);
      if (forces) { const R = (W * (96 - (onBridge ? xt : 0))) / 192; arrows.push(M.arrow(P, [-96, -3, -1], [-96, -3, 3 + R / 60], { color: BLUE, w: 2, head: 4 }), M.arrow(P, [96, -3, -1], [96, -3, 3 + (W - R) / 60], { color: BLUE, w: 2, head: 4 })); }
    }
    if (k === "beam" && forces && onBridge) {
      const sp = spanOf("beam", xt), a = xt - sp[0], L = sp[1] - sp[0];
      for (const [x, R] of [[sp[0], W * (1 - a / L)], [sp[1], (W * a) / L]]) arrows.push(M.arrow(P, [x, -3, Math.abs(x) > 50 ? 8 - 10 - R / 40 : -2 - R / 40], [x, -3, Math.abs(x) > 50 ? 8 : DB - 1.5], { color: BLUE, w: 2, head: 4 }));
    }
    if (forces && onBridge) arrows.push(M.arrow(P, [xt, -3, 36], [xt, -3, DT + 8 - sag(xt)], { color: RED, w: 2.4, head: 5 }));
    // the deck: a ribbon whose top and front follow the sag; a beam's front face shows its bending by colour
    const xs = Array.from({ length: 51 }, (_, i) => -100 + i * 4), zt = (x) => DT - sag(x), zb = (x) => DB - sag(x);
    const top = [...xs.map((x) => iso(P, [x, YB, zt(x)])), ...xs.slice().reverse().map((x) => iso(P, [x, YF, zt(x)]))];
    const frontFace = [...xs.map((x) => iso(P, [x, YF, zt(x)])), ...xs.slice().reverse().map((x) => iso(P, [x, YF, zb(x)]))];
    const end = [[100, YB, zt(100)], [100, YF, zt(100)], [100, YF, zb(100)], [100, YB, zb(100)]].map((p) => iso(P, p));
    let deck = `<path d="${K.pathOf(top, true)}" fill="#cfcfcb" stroke="#3c3f45" stroke-width=".8" stroke-linejoin="round"/><path d="${K.pathOf(frontFace, true)}" fill="#dfe6ed" stroke="#3c3f45" stroke-width=".8" stroke-linejoin="round"/><path d="${K.pathOf(end, true)}" fill="#b9c3cc" stroke="#3c3f45" stroke-width=".8"/>`;
    if (k === "beam" && forces) {
      const quads = [];
      for (let i = 0; i < xs.length - 1; i++) {
        const xm = (xs[i] + xs[i + 1]) / 2, sp = spanOf("beam", xm), m = MV(sp[0], sp[1], xm, xt, onBridge ? W : 0)[0], c = (F) => colourOf(F, 9e4, true, GREY);
        const q = (z0, z1, fill) => `<path d="${K.pathOf([[xs[i], z0], [xs[i + 1], z0], [xs[i + 1], z1], [xs[i], z1]].map(([x, z]) => iso(P, [x, YF + 0.02, z - sag(x === xs[i] ? xs[i] : xs[i + 1])])), true)}" fill="${fill}"/>`;
        quads.push(q(DB + 2, DT, c(-m)), q(DB, DB + 2, c(m)));
      }
      deck += quads.join("") + `<path d="${K.pathOf(frontFace, true)}" fill="none" stroke="#3c3f45" stroke-width=".8"/>`;
    }
    // the centre line, painted on the road
    deck += `<path d="${K.pathOf(xs.map((x) => iso(P, [x, (YB + YF) / 2, zt(x) + 0.02])))}" fill="none" stroke="#fdfdfb" stroke-width="${f1(0.4 * K.cameraOf(P).k)}" stroke-dasharray="${f1(3 * K.cameraOf(P).k)} ${f1(3 * K.cameraOf(P).k)}"/>`;
    return { back: back.join(""), deck: M.named("deck", deck), front: front.join(""), arrows: arrows.join(""), sag };
  }
  // the lorry, built once at x = 0 on the road and moved along it
  function truckSvg(P) {
    const R = ISO.tint("#e8584a", ["#a8302a", "#b83a32", "#c8463c", "#d85044"], "#6a1a12");
    const out = [box(P, [-8, 5], [-13.4, -10.6], [DT + 0.9, DT + 1.5], ISO.T.plastic, "mid"), box(P, [-8, 3], [-13.6, -10.4], [DT + 1.5, DT + 5.6], ISO.T.paint, "hi"), box(P, [3.4, 6.8], [-13.4, -10.6], [DT + 1.5, DT + 4.8], R, "hi"),
      box(P, [6, 6.85], [-13, -11], [DT + 3, DT + 4.4], ISO.T.glass, "hi")];
    for (const x of [-6, -3.4, 5]) out.push(ISO.tinted(ISO.T.rubber, S(G.disc(0, 0.7, 0.95, M.Y([x, -10.4, DT + 0.95]), P, { steps: 16 }), { tone: "mid" })));
    return out.join("");
  }

  ISO.add({
    name: "bridge", title: "Bridge over a river", compare: "bridge 480 280 520 k=suspension forces=1",
    about: "A museum model of a river crossing in five kinds (beam, arch, suspension, cable-stayed, truss); a lorry drives across and, with forces on, each member shows compression (red) or tension (blue) and the deck sags.",
    line: "bridge cx cy width k=beam|arch|suspension|cable|truss forces=1 truck=0..1 load=40 lab=1 lit=deck|piers|abutments|arch|towers|cables|anchor|truss",
    demo: { line: "bridge 480 285 560 k=suspension forces=1", script: [{ set: { truck: 1 }, hold: "settle" }, { set: { k: "truss", truck: 0 }, hold: "settle" }, { set: { k: "arch", truck: 0.5 }, hold: "settle" }] },
    make([cx, cy, size = 520], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.16, H = size * 0.66;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, BOT - 13, BOT), [-140, Y0, 66], [140, CUT, 66]], cx, cy, W, H, { azimuth: 72, elevation: 24 }, parent);
      g.innerHTML = `<g>${groundSvg(P)}</g><g data-part="fixb"></g><g data-part="back"></g><g data-part="deck"></g><g data-part="truck">${truckSvg(P)}</g><g data-part="fixf"></g><g data-part="front"></g><g data-part="arrows"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const s = { k: KINDS.includes(o.k) ? o.k : "beam", forces: o.forces === "1", u: ISO.clamp(ISO.num(o, "truck", 0), 0, 1), W: ISO.clamp(ISO.num(o, "load", 40), 1, 100) * 9.81 };
      let want = s.u, lit = o.lit || "";
      const memo = new Map(), fixes = {};
      const xOf = (u) => -125 + 250 * u;
      const draw = () => {
        const q = Math.round(s.u * 100), key = `${s.k} ${q} ${s.forces} ${s.W}`;
        if (!memo.has(key)) { if (memo.size > 600) memo.clear(); memo.set(key, liveSvg(P, s.k, xOf(q / 100), s.W, s.forces)); }
        const L = memo.get(key);
        const fix = fixes[s.k] || (fixes[s.k] = fixedSvg(P, s.k));
        w.rebuild(el.fixb, s.k, () => fix[0]); w.rebuild(el.fixf, s.k, () => fix[1]);
        w.rebuild(el.back, key, () => L.back); w.rebuild(el.deck, key, () => L.deck); w.rebuild(el.front, key, () => L.front); w.rebuild(el.arrows, key, () => L.arrows);
        const xt = xOf(s.u);
        w.attr(el.truck, "transform", K.translateAlong(P, [xt, 0, -L.sag(xt)]));
        w.rebuild(el.words, lab ? `${s.k} ${s.forces}` : "", () => {
          if (!lab) return "";
          const name = { beam: "beam bridge", arch: "arch bridge", suspension: "suspension bridge", cable: "cable-stayed bridge", truss: "truss bridge" }[s.k];
          const out = [M.label(P, [0, CUT, -20], name, "#333", { size: 15, dy: 0 }), M.label(P, [-110, CUT, 0], "river bank", "#6b4f2e")];
          if (s.forces) {
            const at = { beam: [[-68, YF, 20], [-68, YF, 6]], arch: [[0, YF, 4], null], suspension: [[-60, -5, 62], [-30, -6.5, 36]], cable: [[0, -5, 70], [40, -6.5, 40]], truss: [[0, YF, 40], [0, YF, 9]] }[s.k];
            if (at[0]) out.push(M.label(P, at[0], "compression", RED, { size: 14 }));
            if (at[1]) out.push(M.label(P, at[1], "tension", BLUE, { size: 14 }));
            out.push(M.label(P, [70, CUT, -20], "sag drawn 150× bigger", "#777", { size: 11 }));
          }
          return out.join("");
        });
        M.light(g, w, lit);
      };
      g.set = (p) => {
        if (p.truck !== undefined) want = ISO.clamp(+p.truck, 0, 1);
        if (p.k !== undefined && KINDS.includes(p.k)) s.k = p.k;
        if (p.forces !== undefined) s.forces = !!+p.forces;
        if (p.load !== undefined) s.W = ISO.clamp(+p.load, 1, 100) * 9.81;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the lorry drives at a steady 0.16 of the crossing per second, easing in and out
      g.update = (dt) => {
        const d = want - s.u, v = 0.16, m = Math.min(Math.abs(d), v * dt * Math.min(1, 0.3 + Math.abs(d) / (v * 0.8)));
        s.u = ISO.still() || Math.abs(d) < 1e-4 ? want : s.u + Math.sign(d) * m;
        draw();
        return s.u !== want;
      };
      g.readout = () => {
        const xt = xOf(s.u), on = Math.abs(xt) < 100, Wk = s.W, t = (Wk / 9.81).toFixed(0), kN = (v) => `${Math.round(v).toLocaleString("en")} kN`;
        const head = `lorry ${t} t ${on ? `at ${xt.toFixed(0)} m` : "on the road"} · deck 10 t/m`;
        if (s.k === "beam") {
          const sp = spanOf("beam", on ? xt : 0), L = sp[1] - sp[0], a = (on ? xt : 0) - sp[0], R1 = on ? Wk * (1 - a / L) : 0, Mx = on ? MV(sp[0], sp[1], xt, xt, Wk)[0] : (gD * L * L) / 8;
          return `${head} · span ${L} m: supports push up ${kN(R1 + (gD * L) / 2)} and ${kN(Wk - R1 + (gD * L) / 2)} · bending ${(Mx / 1000).toFixed(0)} MN·m (top squeezed, bottom stretched)`;
        }
        if (s.k === "arch") { const a = xt + 80, M0 = on && Math.abs(xt) < 80 ? (Wk * Math.min(a, 160 - a)) / 2 : 0, H = ((gD * 160 * 160) / 8 + M0) / 12; return `${head} · span 160 m, rise 12 m · the arch is squeezed: thrust H = M/rise = ${kN(H)}, pushed into the banks at each end`; }
        if (s.k === "suspension") { const a = xt + 60, on2 = on && Math.abs(xt) < 60, H = (gD * 120 * 120 / 8 + (on2 ? (Wk * Math.min(a, 120 - a)) / 2 : 0)) / 30; return `${head} · main span 120 m, sag 30 m · cables pull H = wL²/8f = ${kN(H)} (both cables), ${kN(H * Math.SQRT2)} at the tower tops · anchorages hold the ends down`; }
        if (s.k === "cable") {
          let best = 0, bx = 0;
          for (const sg of [-1, 1]) for (let i = 1; i <= 6; i++) { const xd = sg * 16 * i, zp = 38 + 4 * i, T = (gD * 16 + (on ? Wk * Math.max(0, 1 - Math.abs(xt - xd) / 16) : 0)) / 2 / ((zp - DT) / Math.hypot(zp - DT, 16 * i)); if (T > best) { best = T; bx = xd; } }
          return `${head} · 24 stays each carry the deck 16 m either side · busiest stay (at ${bx} m) pulls ${kN(best)} · the pylon is squeezed by them all`;
        }
        const [Mx] = MV(-96, 96, on ? xt : 0, xt, on ? Wk : 0);
        return `${head} · span 192 m, truss 18 m deep · chord force = M/h = ${kN(Mx / 18)} under the lorry: top chord squeezed, bottom chord stretched, diagonals take turns`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
