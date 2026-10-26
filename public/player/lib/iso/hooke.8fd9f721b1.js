// "hooke cx cy width masses=0 k=20 lab=1" (also "spring cx topY length") — Hooke's law on a lab stand.
// A coil spring hangs from a clamp with a pointer at its foot beside a vertical rule; 100 g slotted masses go on a
// hanger under it. Extension = F / k: with k = 20 N/m each 100 g (0.98 N) stretches it 4.9 cm, and it bounces into
// place at its own rate, ω = √(k/m). set({ masses, k }) loads or unloads it; the readout is force, extension and k.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81, CM = 2;                         // world units per centimetre
  const BOARD = { x: -70, y: -40, w: 140, d: 76, r: 6 }, POST = [-48, -26], TOP = 170, HOOK = [0, 0, 160];
  const COIL = { r: 5, turns: 14, rest: 22 * CM, wire: 0.9 }, RULE = { x: 16, z0: 50, z1: 158 };

  // A vertical helix split into the half behind its axis and the half in front, for painter's order.
  function helix(P, x, y, zTop, zBot, r, turns) {
    const back = [], front = [], n = Math.round(turns * 24), axis = K.depthOf([x, y, (zTop + zBot) / 2], P);
    let run = [], side = null;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * turns * Math.PI * 2, z = zTop + (zBot - zTop) * (i / n), p = [x + Math.cos(a) * r, y + Math.sin(a) * r, z];
      const s = K.depthOf([p[0], p[1], (zTop + zBot) / 2], P) >= axis ? "f" : "b";
      if (side && s !== side) { (side === "f" ? front : back).push(K.pathOf([...run, K.iso(p, P)])); run = []; }
      side = s; run.push(K.iso(p, P));
    }
    (side === "f" ? front : back).push(K.pathOf(run));
    return { back: back.join(""), front: front.join("") };
  }

  function standSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 18, y: -32, w: 38, d: 14, r: 1.2 })];
    out.push(S(K.cylinder(POST[0], POST[1], 7, 0, 3, P, 32, 0.5), { tone: "mid" }), S(K.cylinder(POST[0], POST[1], 2.6, 3, TOP - 3, P, 24), { tone: "mid", crease: "none" }), S(K.cylinder(POST[0], POST[1], 3, TOP, 1.4, P, 24), { tone: "mid" }));
    out.push(ISO.wbox(P, [POST[0] - 5, POST[0] + 5], [POST[1] - 5, POST[1] + 5], [HOOK[2] + 2, HOOK[2] + 12], "mid"));
    out.push(S(G.disc(0, 50, 2, G.frameOf([POST[0] + 5, POST[1], HOOK[2] + 7], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    out.push(ISO.wbox(P, [-3.5, 3.5], [POST[1] + 2, 3], [HOOK[2] + 3, HOOK[2] + 10], "mid"));
    out.push(S(K.cylinder(0, 0, 1, HOOK[2], 3, P, 12), { tone: "mid" }));
    // The rule on its own foot: a wooden strip with centimetre ticks hanging from its left edge, every 5th longer.
    out.push(ISO.wbox(P, [RULE.x - 6, RULE.x + 14], [-6, 6], [0, 3], "mid"));
    out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [RULE.x, RULE.x + 8], [-1, 2], [3, RULE.z1], "mid")));
    const minor = [], major = [];
    for (let c = 0; c <= (RULE.z1 - RULE.z0) / CM; c++) {
      const z = RULE.z1 - 4 - c * CM;
      if (z < RULE.z0) break;
      (c % 5 ? minor : major).push(K.segment([RULE.x, 2.05, z], [RULE.x + (c % 5 ? 2.2 : 4), 2.05, z], P));
    }
    out.push(ISO.tinted(ISO.T.wood, L(minor.join(""), { tone: "lo", free: "end" }) + L(major.join(""), { tone: "mid", free: "end" })));
    if (lab) out.push(ISO.word(K.iso([RULE.x + 4, 2, RULE.z1 + 4], P), "cm rule", "#555", { size: 13, dy: -4 }));
    return out.join("");
  }

  const make = ([cx, cy, size = 400], o, t, parent, topAnchored) => {
    const lab = o.lab !== "0", W = size * 1.15, H = size * 1.25;
    const ccy = topAnchored ? cy + H / 2 : cy;
    const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [POST[0], POST[1], TOP + 3], [RULE.x + 8, 0, RULE.z1 + 6]], cx, ccy, W, H, { azimuth: 60, elevation: 18 }, parent);
    const m = { masses: ISO.clamp(Math.round(ISO.num(o, "masses", 0)), 0, 6), k: ISO.clamp(ISO.num(o, "k", 20), 10, 40) };
    const s = { x: 0, v: 0 };                         // extension in metres and its rate
    g.innerHTML = `<g>${standSvg(P, lab)}</g><g data-part="back"></g><g data-part="front"></g>`;
    const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
    const footZ = () => HOOK[2] - 4 - COIL.rest - s.x * 100 * CM;
    const draw = () => {
      const z1 = footZ(), coil = helix(P, 0, 0, HOOK[2] - 4, z1, COIL.r, COIL.turns), key = `${z1.toFixed(2)} ${m.masses}`;
      w.rebuild(el.back, key, () => `<path d="${coil.back}" fill="none" stroke="#5c6168" stroke-width="${COIL.wire * 1.2}" stroke-linecap="round"/>`);
      w.rebuild(el.front, key, () => {
        const out = [`<path d="${coil.front}" fill="none" stroke="#3c4148" stroke-width="${COIL.wire * 1.5}" stroke-linecap="round"/>`];
        // The foot: an end loop, the pointer to the rule (the reading), and the hanger with its masses.
        out.push(S(K.cylinder(0, 0, 1.6, z1 - 3, 3, P, 14), { tone: "mid" }));
        out.push(`<path class="iso-line" data-tone="lit" data-free="end" d="${K.segment([0, 0, z1 - 1.5], [RULE.x - 0.4, 0, z1 - 1.5], P)}" style="stroke-width:1.3"/>`);
        out.push(D([K.iso([0, 0, z1 - 1.5], P)], { size: 0.8, tone: "hi" }));
        const top = z1 - 3, bottom = top - 6 - Math.max(1, m.masses) * 3.2;
        out.push(S(K.cylinder(0, 0, 0.8, bottom, top - bottom, P, 12), { tone: "mid", crease: "none" }));
        for (let i = 0; i < m.masses; i++) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 7, bottom + 1.4 + i * 3.2, 2.8, P, 40, 0.4), { tone: "hi" })));
        out.push(S(K.cylinder(0, 0, 7.6, bottom, 1.4, P, 40), { tone: "mid" }));
        if (lab) out.push(ISO.word(K.iso([-10, 0, bottom + 4], P), `${m.masses * 100} g`, "#2b6cc4", { anchor: "end", size: 15 }));
        return out.join("");
      });
    };
    g.set = (p) => {
      if (p.masses !== undefined) m.masses = ISO.clamp(Math.round(+p.masses), 0, 6);
      if (p.k !== undefined) m.k = ISO.clamp(+p.k, 10, 40);
    };
    g.update = (dt) => {
      const mass = m.masses * 0.1, rest = (mass * g9) / m.k;
      if (ISO.still() || mass === 0) { s.x = ISO.follow(s.x, rest, dt, 0.2, ISO.still()); s.v = 0; }
      else for (let i = 0; i < 8; i++) { const h = dt / 8; s.v += (g9 - (m.k / mass) * s.x - 1.6 * s.v) * h; s.x += s.v * h; }
      const moving = Math.abs(s.x - rest) > 2e-4 || Math.abs(s.v) > 2e-3;
      if (!moving) { s.x = rest; s.v = 0; }
      draw();
      return moving;
    };
    g.readout = () => {
      const F = m.masses * 0.1 * g9;
      return `${m.masses * 100} g · force ${F.toFixed(2)} N · extension ${(s.x * 100).toFixed(1)} cm · k = F ÷ x = ${m.k} N/m`;
    };
    draw();
    if (t) label(parent, cx, ccy - H / 2 - 8, t, TXT.blue, 22, "middle");
    return g;
  };
  const demo = (line) => ({ line, script: [{ set: { masses: 1 }, hold: "settle" }, { set: { masses: 2 }, hold: "settle" }, { set: { masses: 4 }, hold: "settle" }, { set: { masses: 0 }, hold: "settle" }] });
  ISO.add({ name: "hooke", title: "Hooke's law", compare: "hooke 480 290 400", about: "Spring on a stand beside a centimetre rule: each 100 g stretches it the same 4.9 cm (k = 20 N/m).", line: "hooke cx cy width masses=0 k=20 lab=1", demo: demo("hooke 480 280 380"), make: (a, o, t, p) => make(a, o, t, p, false) });
  ISO.add({ name: "spring", title: "Spring and weights", compare: "spring 480 140 260", about: "The same spring rig, placed by its top like the whiteboard's spring.", line: "spring cx topY length masses=0 k=20 lab=1", demo: demo("spring 480 50 380"), make: (a, o, t, p) => make(a, o, t, p, true) });
})();
