// "rope cx cy k r=2..10 drum=4..30 drop=10..300 turns=0..20 core=0|1 pail=0|1 lab=0 lit=rope|hook|pail|drum" —
// a PART (PARTS.md, batch 5): wheelaxle.js's rope, 1 cm thick (three-strand, its lay drawn), wound round a drum of
// radius r and length drum (cm) and hanging from its near side, drop cm below the axle, with an eye at its end and a
// steel hook in the eye. Origin: the middle of the drum's axle (the hanging point; place it at= a windlass's drum).
// Three turns are always on the drum; turns winds more on, coil by coil from the −x end (a second layer when a
// layer is full): each turn takes up 2π(r + 0.5) cm, so the end rises by that much and steps 1 cm along x, as a real
// windlass rope does. set({ turns }) eases there. core=1 draws a plain wooden drum with flanges (alone on a board);
// pail=1 hangs wheelaxle's wooden pail of water on the hook (it rises with the rope: what moves together is one part).
// anchors: end (the hook's bowl at turns 0). World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RW = 0.5, BASE = 3, PH = 24, PRB = 10.5, PRT = 12.5, BAIL = 12;
  const ROPE = { ink: "#5a4526", body: "#bf9f66", shine: "#ecdcb4" };
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  // a rope along world points: the wire's three strokes, plus the strands' lay as short dark dashes
  const ropeSvg = (P, pts) => {
    const d = PHYS.path(P, pts), w = K.screenRise(1, P) * RW * 2;
    return PHYS.wire(P, d, RW, ROPE) + (w > 2.2 ? `<path d="${d}" fill="none" stroke="#6e5530" stroke-width="${(w * 0.75).toFixed(2)}" stroke-dasharray="${(w * 0.16).toFixed(2)} ${(w * 0.55).toFixed(2)}" opacity=".55"/>` : "");
  };
  const viewOf = (P) => { const d0 = K.depthOf([0, 0, 0], P), v = [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0], n = Math.hypot(...v); return v.map((c) => c / n); };

  // the wound coils: a helix of n turns, its free end leaving the drum's near side (+y) at axle height going down
  function helix(m, n, x0, r) {
    const pt = (t) => {
      const L1 = Math.min(Math.floor(t / m), 2), u = t - L1 * m, x = L1 % 2 ? x0 + m - u : x0 + u, rr = r + RW + 2 * RW * L1, th = 2 * Math.PI * (n - t);
      return { p: [x, rr * Math.cos(th), rr * Math.sin(th)], nrm: [0, Math.cos(th), Math.sin(th)], rr };
    };
    return pt;
  }
  function coilsSvg(P, st, view) {
    const m = Math.max(1, Math.floor(st.drum - 2 * RW)), n = BASE + st.turns, x0 = -st.drum / 2 + RW, pt = helix(m, n, x0, st.r);
    const runs = [], steps = Math.ceil(n * 28);
    let run = [];
    for (let i = 0; i <= steps; i++) {
      const q = pt((i / steps) * n), vis = q.nrm[1] * view[1] + q.nrm[2] * view[2] > -0.05;
      if (vis) run.push(q.p); else if (run.length) { runs.push(run); run = []; }
    }
    if (run.length) runs.push(run);
    const items = runs.filter((r) => r.length > 1).map((r) => ({ k: K.depthOf(r[Math.floor(r.length / 2)], P), svg: ropeSvg(P, r) }));
    items.sort((a, b) => a.k - b.k);
    const end = pt(n);
    return { svg: items.map((i) => i.svg).join(""), end: end.p };
  }
  // the eye at the rope's end (in the y–z plane), the steel hook through it, its bowl at hz (all at x)
  function hookSvg(P, x, y, z) {
    const eye = Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 + (i / 24) * 2 * Math.PI; return [x, y + Math.cos(a) * 1.1, z - 1.1 + Math.sin(a) * 1.1]; });
    const ze = z - 2.0, hook = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 - (i / 16) * 2 * Math.PI * 0.9; hook.push([x + Math.cos(a) * 0.6, y, ze + Math.sin(a) * 0.6 - 0.6]); }
    hook.push([x, y, ze - 1.2], [x, y, ze - 4]);
    for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI * 0.95; hook.push([x + 1.4 + Math.cos(a) * 1.4, y, ze - 4 + Math.sin(a) * 1.4]); }
    const tip = hook.at(-1);
    return { rope: ropeSvg(P, eye), hook: PHYS.wire(P, PHYS.path(P, hook), 0.3, { ink: "#3c3f45", body: "#a4a8ae", shine: "#eef0f2" }) + `<circle cx="${K.iso(tip, P)[0].toFixed(1)}" cy="${K.iso(tip, P)[1].toFixed(1)}" r="${(K.screenRise(1, P) * 0.32).toFixed(2)}" fill="#a4a8ae" stroke="#3c3f45" stroke-width="0.6"/>`, bowl: [x + 1.4, y, ze - 5.4] };
  }
  // wheelaxle's wooden pail at real size: staves, two steel hoops, water inside, ears and a steel bail up to the hook
  function pailSvg(P, [x, y, zb]) {
    const zr = zb - BAIL, z0 = zr - PH, F = Z([x, y, z0]), out = [];
    const r = (s) => PRB + ((PRT - PRB) * s) / PH;
    const hoop = (s) => { const wd = K.screenRise(1, P) * 1.4, d = G.arcOf(F, s, r(s) + 0.05, P, { trim: wd / 2 + 0.5 }); return `<path d="${d}" fill="none" stroke="#3c3f45" stroke-width="${(wd + 1).toFixed(2)}"/><path d="${d}" fill="none" stroke="#b6b9be" stroke-width="${wd.toFixed(2)}"/>`; };
    out.push(ISO.tinted(ISO.T.wood, S(G.lathe([[0, 0], [0, PRB], [PH, PRT], [PH, 0]], F, P), { tone: "hi", inner: L(G.ribsOf(F, 0, PH, PRB, 16, P, { r1: PRT, seams: true }), { tone: "lo" }) })));
    out.push(hoop(4), hoop(PH - 4));
    out.push(`<path d="${G.circleOf(F, PH - 0.01, PRT - 1.2, P, 40)}" fill="#7a5a2e" fill-opacity=".55"/>`, `<path d="${G.circleOf(F, PH - 4, PRT - 1.9, P, 40)}" fill="#4f7fae"/>`);
    const bail = []; for (let i = 0; i <= 24; i++) { const a = Math.PI - (i / 24) * Math.PI; bail.push([x + Math.cos(a) * (PRT + 0.5), y, zr - 3 + Math.sin(a) * (BAIL + 3)]); }
    const ears = [-1, 1].map((sx) => ISO.tinted(ISO.T.steel, S(G.disc(-0.3, 0.3, 0.9, X([x + sx * (PRT + 0.2), y, zr - 3]), P), { tone: "mid" }))).join("");
    out.push(ears, PHYS.wire(P, PHYS.path(P, bail), 0.25, { ink: "#3c3f45", body: "#a4a8ae", shine: "#eef0f2" }));
    return out.join("");
  }
  // a plain wooden drum with two flanges and the axle's stubs (core=1): far half before the coils, near half after
  function drumSvg(P, st, near) {
    const h = st.drum / 2, F = X([0, 0, 0]);
    const stub = ISO.tinted(ISO.T.steel, S(G.disc(near ? h + 0.8 : -h - 3.8, near ? h + 3.8 : -h - 0.8, 1.2, F, P), { tone: "mid" }));
    const flange = ISO.tinted(ISO.T.wood, S(G.disc(near ? h : -h - 0.8, near ? h + 0.8 : -h, st.r + 2.6, F, P), { tone: "mid" }));
    const core = near ? "" : ISO.tinted(ISO.T.wood, S(G.disc(-h, h, st.r, F, P), { tone: "hi", inner: L(G.ribsOf(F, -h, h, st.r, 10, P, { seams: true }), { tone: "faint" }) }));
    return near ? flange + stub : stub + flange + core;
  }

  ISO.add({
    name: "rope", title: "Rope on a drum (part)", compare: null,
    about: "A 1 cm rope wound on a windlass drum and hanging from it to an eye and a steel hook (optionally a wooden pail of water on it); turns winds more rope on, coil by coil, and lifts the end 2π(r + 0.5) cm a turn. anchors: end",
    line: "rope cx cy k r=2..10 drum=4..30 drop=10..300 turns=0..20 core=0|1 pail=0|1 lab=0 lit=rope|hook|pail|drum",
    demo: { line: "rope 480 110 3.6 core=1 pail=1 drop=60", script: [{ set: {}, hold: 1 }, { set: { turns: 1, lit: "rope" }, hold: "settle" }, { set: { turns: 0.4, lit: "pail" }, hold: "settle" }, { set: { lit: "hook" }, hold: 1 }, { set: { turns: 0, lit: "drum" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { r: B30.num(o, "r", 4, 2, 10), drum: B30.num(o, "drum", 12, 4, 30), drop: B30.num(o, "drop", 60, 10, 300), turns: 0, target: 0, lit: o.lit || "" };
      const core = o.core === "1", pail = o.pail === "1", view = viewOf(P);
      const per = 2 * Math.PI * (st.r + RW), maxT = Math.min(20, Math.max(0, (st.drop - 6) / per));
      st.turns = st.target = ISO.clamp(B30.num(o, "turns", 0, 0, 20), 0, maxT);
      g.innerHTML = (core ? `<g data-name="drum">${drumSvg(P, st, false)}</g>` : "") + `<g data-name="rope" data-part="coils"></g>` + (core ? `<g data-name="drum">${drumSvg(P, st, true)}</g>` : "") +
        `<g data-name="rope" data-part="fall"></g><g data-part="end"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-part="${n}"]`), coilsEl = q("coils"), fall = q("fall"), endG = q("end"), words = q("words"), w = ISO.writer();
      const c0 = coilsSvg(P, { ...st, turns: 0 }, view), e0 = c0.end, hk = hookSvg(P, e0[0], e0[1], -st.drop);
      endG.innerHTML = `<g data-name="rope">${hk.rope}</g><g data-name="hook">${hk.hook}</g>` + (pail ? `<g data-name="pail">${pailSvg(P, hk.bowl)}</g>` : "");
      g.anchors = { end: hk.bowl.map((v) => +v.toFixed(3)) };
      let lastEnd = e0;
      const draw = () => {
        w.rebuild(coilsEl, st.turns.toFixed(3), () => { const c = coilsSvg(P, st, view); lastEnd = c.end; return c.svg; });
        const rise = st.turns * per, e = lastEnd;
        w.rebuild(fall, st.turns.toFixed(3), () => ropeSvg(P, [e, [e[0], e[1], -st.drop + rise - 0.05]]));
        w.attr(endG, "transform", K.translateAlong(P, [e[0] - e0[0], e[1] - e0[1], rise]));
        w.rebuild(words, lab ? "1" : "", () => (lab ? CIRC.word(P, [e0[0] + 1, e0[1], -st.drop / 2], "rope") : ""));
        B30.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.turns !== undefined && p.turns !== "" && Number.isFinite(+p.turns)) st.target = ISO.clamp(+p.turns, 0, maxT);
        if (p.lit !== undefined) { st.lit = p.lit; B30.light(w, g, st.lit); }
      };
      g.update = (dt) => { st.turns = ISO.follow(st.turns, st.target, dt, 0.7, ISO.still()); draw(); return st.turns !== st.target; };
      g.readout = () => `rope 1 cm thick on a drum of radius ${st.r} cm · ${(BASE + st.turns).toFixed(1)} turns on the drum · each turn winds up 2π(r + 0.5) = ${per.toFixed(1)} cm · end ${(st.drop - st.turns * per).toFixed(0)} cm below the axle${pail ? " · a 10 L wooden pail of water on the hook" : ""}`;
      draw();
      return g;
    },
  });
})();
