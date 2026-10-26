// "pencil cx cy k aim=wall|down|flat lab=0 lit=pencil" — a PART (PARTS.md): a yellow hexagonal HB pencil, 18 cm, its
// origin the lead's point. A 2 mm graphite lead sharpened to a point, the cedar cone (where the sharpener cut the hex
// body the paint ends in a scallop on every face), the painted body 7 mm across the flats with a stamped grade on
// one face, a crimped aluminium ferrule with its rings, and a pink eraser. aim=wall: writing on the wall (−y);
// aim=down: on a surface below (−z); aim=flat: lying on one face on a surface along x, lead to +x (the origin is then
// the middle under it). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const PAINT = ISO.tint("#ffe27a", ["#d9a400", "#e5b30f", "#efc226", "#f6d04a"], "#6b4f00");
  const CEDAR = ISO.tint("#f3d9b0", ["#c9995c", "#d4aa70", "#ddb983", "#e7c99a"], "#6e4a1e");
  const GRAPH = ISO.tint("#7a7e85", ["#3a3c41", "#46494e", "#53565c", "#62656b"], "#1a1b1e");
  const ALU = ISO.tint("#e3e6ea", ["#959ca4", "#a9afb6", "#bcc1c7", "#cfd3d8"], "#454c55");
  const PINK = ISO.tint("#f9c7c4", ["#d77a76", "#e08b86", "#e89d98", "#f0b1ac"], "#7a2e2a");
  const AP = 0.35, R = AP / Math.cos(Math.PI / 6), SA = 2.0, LEN = 18, SLOPE = (AP - 0.1) / (SA - 0.45), TAU = Math.PI * 2;
  const HEX = Array.from({ length: 6 }, (_, j) => [Math.cos((j * Math.PI) / 3) * R, Math.sin((j * Math.PI) / 3) * R]);
  const DIR = { wall: [0, -1, 0], down: [0, 0, -1] };
  function frameFor(aim) {
    if (aim !== "flat") { const d = DIR[aim]; return G.frameAlong([0, 0, 0], [-d[0], -d[1], -d[2]]); }
    // lying on a face: a back along −x, the hex's corners at 0°, 60°… so the faces at 90° and 270° are top and bottom
    return G.frameOf([LEN / 2, 0, AP], [-1, 0, 0], [0, 1, 0], [0, 0, -1]);
  }
  function piecesOf(F, P) {
    const V = G.viewOf(P), out = [], add = (s, svg) => out.push({ s, svg });
    const on = (s, rr, t) => K.iso(G.pointOf(F, s, rr, t), P);
    add(0.2, ISO.tinted(GRAPH, S(G.solidOf([[0, 0.012], [0.25, 0.07, 1], [0.45, 0.1]], F, P, { steps: 16 }), { tone: "hi" })));
    add(1.2, ISO.tinted(CEDAR, S(G.solidOf([[0.45, 0.1], [SA, AP]], F, P, { steps: 24 }), { tone: "hi" })));
    // the painted body; on each face that shows, the cedar scallop where the sharpener's cone cut through the paint
    const body = [ISO.tinted(PAINT, S(G.prismOf(F, HEX, SA, 16, P), { tone: "mid" }))];
    const tipOn = G.dot3(F.a, V) < 0;                           // the body's front end faces the viewer
    if (tipOn) body.push(`<path d="${K.pathOf(HEX.map(([x, y]) => K.iso([0, 1, 2].map((i) => F.o[i] + F.a[i] * SA + F.u[i] * x + F.v[i] * y), P)), true)}" fill="#e7c99a" stroke="#6e4a1e" stroke-width="0.5"/>`);
    for (let j = 0; j < 6; j++) {
      const c0 = (j * Math.PI) / 3, c1 = c0 + Math.PI / 3, mid = c0 + Math.PI / 6;
      if (G.dot3(G.radialOf(F, mid), V) < 0.05) continue;
      const curve = [];
      for (let i = 0; i <= 14; i++) { const t = c0 + ((c1 - c0) * i) / 14, d = AP / Math.cos(t - mid); curve.push(on(SA + (d - AP) / SLOPE, d, t)); }
      body.push(`<path d="${K.pathOf([...curve, on(SA, R, c1), on(SA, R, c0)], true)}" fill="#ecd0a4" stroke="none"/>`, `<path d="${K.pathOf(curve)}" fill="none" stroke="#8a6a1a" stroke-width="0.45"/>`);
    }
    // the stamped grade on the face nearest the viewer: three short gold rule lines near the ferrule
    let best = 0, bf = 0;
    for (let j = 0; j < 6; j++) { const f = G.dot3(G.radialOf(F, (j * Math.PI) / 3 + Math.PI / 6), V); if (f > best) { best = f; bf = j; } }
    const m = (bf * Math.PI) / 3 + Math.PI / 6;
    body.push(`<path d="${[-0.12, 0, 0.12].map((dt, i) => K.pathOf([on(11.2 + i * 0.6, AP / Math.cos(dt) + 0.002, m + dt), on(15.2, AP / Math.cos(dt) + 0.002, m + dt)])).join("")}" stroke="#9a7a10" stroke-width="0.45" data-free=""/>`);
    add(9, body.join(""));
    // the ferrule: crimped aluminium over the body's end, two pairs of rings
    add(16.6, ISO.tinted(ALU, S(G.solidOf([[15.95, 0.41], [16.0, 0.44], [17.2, 0.44], [17.22, 0.4]], F, P, { steps: 28 }), { tone: "hi", inner: L([16.25, 16.4, 16.8, 16.95].map((s) => G.arcOf(F, s, 0.44, P)).join(""), { tone: "lo" }) })));
    add(17.6, ISO.tinted(PINK, S(G.solidOf([[17.22, 0.38], [17.7, 0.38, 1], [17.92, 0.32, 1], [LEN, 0]], F, P, { steps: 28 }), { tone: "hi" })));
    return out;
  }
  ISO.add({
    name: "pencil", title: "Pencil (part)", compare: null,
    about: "A yellow hex HB pencil, 18 cm: graphite lead, sharpened cedar cone with the paint's scallop, painted body, aluminium ferrule and pink eraser; the lead's point is the origin and aim says where it points. anchors: none",
    line: "pencil cx cy k aim=wall|down|flat lab=0 lit=pencil",
    demo: { line: "pencil 600 160 40 aim=wall lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "pencil" }, hold: 1.4 }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = DIR[o.aim] || o.aim === "flat" ? o.aim : "wall", F = frameFor(aim);
      const depth = (s) => K.depthOf(G.pointOf(F, s, 0, 0), P);
      const pieces = piecesOf(F, P).sort((a, b) => depth(a.s) - depth(b.s) || a.s - b.s);
      const halo = aim === "flat" ? `<path class="iso-halo" d="${K.haloOf({ x: -LEN / 2 - 0.6, y: -0.8, w: LEN + 1.2, d: 1.6, r: 0.8 }, -0.1, 0.3, P)}"/>` : "";
      g.innerHTML = `${halo}<g data-name="pencil">${pieces.map((p) => p.svg).join("")}</g><g data-part="words"></g>`;
      if (lab) { const p = K.iso(G.pointOf(F, 8, 0, 0), P); g.querySelector('[data-part="words"]').innerHTML = ISO.word([p[0] + 16, p[1] + 24], "pencil", "#444", { size: 14, anchor: "start" }); }
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      let lit = o.lit || "";
      const draw = () => w.light(parts, parts.filter((p) => p.dataset.name === lit));
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
      g.update = () => false;
      g.readout = () => `HB pencil · 18 cm · lead point ${aim === "flat" ? "to the right, lying on a face" : aim === "wall" ? "on the wall" : "down on the surface"}`;
      draw();
      return g;
    },
  });
})();
