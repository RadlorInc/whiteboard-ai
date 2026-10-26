// "pulley cx topY size k=fixed|movable load=0.4 lab=1 lit=…" — a pulley rig on a lab stand.
// A string runs from a winch on the base, through a newton meter, over a pulley on the crossbar and down to a hanger
// of 100 g slotted masses. k=fixed: one strand holds the load, so the meter reads its weight and the load rises as
// far as the string is wound. k=movable: the load hangs from a second pulley held by two strands, so the meter reads
// half and the load rises half as far. set({ wind }) winds the string (world units), set({ k, load }) changes the rig.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const g9 = 9.81;
  const BOARD = { x: -90, y: -34, w: 180, d: 68, r: 6 };
  const POST = [-62, -6], TOP = 166, BAR_Z = 160;
  const FIX = [11, 0, 146], R = 9;                   // fixed pulley centre and radius
  const ANCHOR_X = -16, MOVE_X = -7;                 // movable rig: rope anchor on the bar, movable pulley centre x
  const DRUM = [25, 0, 18], DRUM_R = 5;
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);

  function standSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 40, y: -26, w: 40, d: 14, r: 1.2 })];
    // Upright rod in a foot collar, a boss clamp with a thumb screw, and the crossbar with an end cap.
    out.push(S(K.cylinder(POST[0], POST[1], 7, 0, 3, P, 32, 0.5), { tone: "mid" }), L(K.sideArc(POST[0], POST[1], 7, 1.5, P, 20), { tone: "faint" }));
    out.push(S(K.cylinder(POST[0], POST[1], 2.6, 3, TOP - 3, P, 24), { tone: "mid", crease: "none" }), L(K.sideArc(POST[0], POST[1], 2.6, 60, P, 12), { tone: "faint" }));
    out.push(S(K.cylinder(POST[0], POST[1], 3, TOP, 1.4, P, 24), { tone: "mid" }));
    out.push(ISO.wbox(P, [POST[0] - 5, POST[0] + 5], [POST[1] - 5, POST[1] + 5], [BAR_Z - 6, BAR_Z + 6], "mid"));
    out.push(S(G.disc(5, 9, 1.8, G.frameOf([POST[0], POST[1], BAR_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
    out.push(S(G.disc(9, 12, 3, G.frameOf([POST[0], POST[1], BAR_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }), L(G.ribsOf(G.frameOf([POST[0], POST[1], BAR_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 9, 12, 3, 16, P, { seams: true }), { tone: "lo" }));
    out.push(S(G.disc(POST[0] + 5, 42, 2.2, xAx([0, 0, BAR_Z]), P), { tone: "mid" }), S(G.disc(42, 45, 2.8, xAx([0, 0, BAR_Z]), P), { tone: "mid" }));
    // Winch on the base: two cheek plates, the drum on its axle and a crank with a knob.
    for (const y of [-8, 8]) out.push(ISO.prismY(P, [[DRUM[0] - 7, 0], [DRUM[0] + 7, 0], [DRUM[0] + 7, 16], [DRUM[0] + 4, 24], [DRUM[0] - 4, 24], [DRUM[0] - 7, 16]], y - 1.2, y + 1.2, ["#8d9096", "#d3d5d9"], "#c7c9cd", "#3c3f45"));
    if (lab) out.push(ISO.word(K.iso([DRUM[0], 34, -6], P), "Winch", "#555", { dy: 22 }));
    return out.join("");
  }
  // The pulley wheel in its strap, on a horizontal axle along y; phase turns its spokes.
  function wheelSvg(P, c, phase, strapUp) {
    const F = yAx(c), out = [];
    for (const y of [-4.2]) out.push(ISO.prismY(P, [[c[0] - 4, c[2] - 3], [c[0] + 4, c[2] - 3], [c[0] + 2.5, c[2] + (strapUp ? 14 : -14)], [c[0] - 2.5, c[2] + (strapUp ? 14 : -14)]].map(([x, z]) => [x, z]), y - 0.8, y + 0.8, ["#8d9096", "#d3d5d9"], "#c7c9cd", "#3c3f45"));
    out.push(ISO.tinted(ISO.T.brass, S(G.disc(-2.4, 2.4, R - 1.6, F, P), { tone: "hi" }) + S(G.ringBand(-3, -1.6, R - 2, R, F, P), { tone: "hi" }) + S(G.ringBand(1.6, 3, R - 2, R, F, P), { tone: "hi" }) +
      L(G.circleOf(F, 2.4, 2.2, P) + G.circleOf(F, 2.4, R - 1.6, P), { tone: "lo" })));
    out.push(S(G.disc(2.4, 5, 1.4, F, P), { tone: "mid" }));
    out.push(ISO.prismY(P, [[c[0] - 4, c[2] - 3], [c[0] + 4, c[2] - 3], [c[0] + 2.5, c[2] + (strapUp ? 14 : -14)], [c[0] - 2.5, c[2] + (strapUp ? 14 : -14)]], 4.2 - 0.8, 4.2 + 0.8, ["#8d9096", "#d3d5d9"], "#c7c9cd", "#3c3f45"));
    out.push(D([K.iso([c[0], 5.1, c[2]], P)], { size: 0.8, tone: "hi" }));
    return out.join("");
  }
  // A hanger of 100 g slotted masses, hook at (x, z).
  function hangerSvg(P, x, z, kg) {
    const n = Math.max(1, Math.round(kg / 0.1)), out = [];
    out.push(S(G.disc(z - 6, z, 0.7, zAx([x, 0, 0]), P), { tone: "mid" }));
    const top = z - 6, bottom = top - 6 - n * 3.2;
    out.push(S(K.cylinder(x, 0, 0.9, bottom, top - bottom, P, 12), { tone: "mid", crease: "none" }));
    for (let i = 0; i < n; i++) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, 0, 7, bottom + 1.4 + i * 3.2, 2.8, P, 40, 0.4), { tone: "hi" })));
    out.push(S(K.cylinder(x, 0, 7.6, bottom, 1.4, P, 40), { tone: "mid" }));
    return { svg: out.join(""), bottom };
  }
  // A newton meter on the string: tube with a scale, its pointer at `newtons` on a 0–5 N scale.
  function meterSvg(P, x, z0, newtons) {
    const len = 30, out = [];
    out.push(S(K.cylinder(x, 0, 3.6, z0 - len, len, P, 32, 0.4), { tone: "hi" }));
    const ticks = [], major = [];
    for (let i = 0; i <= 10; i++) (i % 2 ? ticks : major).push(K.segment([x - 2.6, 3.4, z0 - 4 - i * 2.2], [x - (i % 2 ? 1.2 : 0.4), 3.6, z0 - 4 - i * 2.2], P));
    out.push(L(ticks.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    out.push(L(K.segment([x - 2.6, 3.45, z0 - 3], [x - 2.6, 3.45, z0 - 27], P), { tone: "lo" }));
    const pz = z0 - 4 - ISO.clamp(newtons / 5, 0, 1) * 22;
    out.push(`<path class="iso-line" data-tone="lit" data-free="" d="${K.segment([x - 3.2, 3.7, pz], [x + 2.4, 3.7, pz], P)}" style="stroke-width:1.4"/>`);
    out.push(S(K.cylinder(x, 0, 2.4, z0, 2, P, 20), { tone: "mid" }), S(K.cylinder(x, 0, 1, z0 - len - 4, 4, P, 12), { tone: "mid" }));
    return out.join("");
  }

  ISO.add({
    name: "pulley", title: "Pulley rig", compare: "pulley 480 130 280",
    about: "Pulley on a lab stand with a winch, a newton meter in the string and slotted masses: one strand lifts the weight; a movable pulley's two strands halve it.",
    line: "pulley cx topY size k=fixed|movable load=0.4 lab=1 lit=meter|load|pulley|winch",
    demo: { line: "pulley 480 70 300", script: [{ set: { wind: 40 }, hold: "settle" }, { set: { wind: 0 }, hold: "settle" }, { set: { k: "movable" }, hold: 1.2 }, { set: { wind: 40 }, hold: "settle" }] },
    make([cx, top, size = 280], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.55, H = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [POST[0], 0, TOP + 4], [48, 0, BAR_Z + 4]], cx, top + H / 2, W, H, { azimuth: 64, elevation: 22 }, parent);
      const m = { k: o.k === "movable" ? "movable" : "fixed", load: ISO.clamp(ISO.num(o, "load", 0.4), 0.1, 0.8) };
      g.innerHTML = `<g data-part="stand">${standSvg(P, lab)}</g><g data-part="rig"></g>`;
      const rig = g.querySelector('[data-part="rig"]'), w = ISO.writer();
      const s = { wind: 0, target: 0 };
      let lit = o.lit || "meter", layout = "", el = {};
      const meterTop = 104, fixLeft = FIX[0] - R, fixRight = FIX[0] + R, F = yAx([DRUM[0] + DRUM_R, 0, DRUM[2]]);
      // Parts that only change with the rig (k, load) are built once per rig; while winding, the hanger and the movable
      // pulley just move, and only the rope, the spokes and the crank are redrawn.
      const build = () => {
        const n = m.k === "movable" ? 2 : 1, newtons = (m.load * g9) / n, hz = 88;   // the load hook: on the string (fixed) or under the movable pulley's strap
        const hanger = hangerSvg(P, n === 1 ? fixLeft : MOVE_X, hz, m.load);
        rig.innerHTML = `<g data-name="winch">${S(G.disc(-6.8, 6.8, DRUM_R, F, P), { tone: "mid" })}${S(G.disc(9.2, 11, 1.2, F, P), { tone: "mid" })}<g data-part="crank"></g></g>` +
          `<g data-name="pulley">${wheelSvg(P, FIX, 0, true)}<g data-part="spokes"></g></g>` +
          `<path data-part="rope" fill="none" stroke="#6b5a3a" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<g data-name="meter">${meterSvg(P, fixRight, meterTop, newtons)}</g>` +
          `${D([K.iso([fixRight, 0.2, meterTop + 2], P), K.iso([DRUM[0], 0.2, meterTop - 34], P)], { size: 0.9, tone: "mid" })}` +
          (n === 2 ? `<g data-name="pulley" data-part="move">${wheelSvg(P, [MOVE_X, 0, 88 + 14], 0, false)}</g>` : "") +
          `<g data-name="load" data-part="hang">${hanger.svg}${lab ? ISO.word(K.iso([n === 1 ? fixLeft - 12 : MOVE_X - 12, 0, hanger.bottom + 4], P), `Load ${m.load} kg`, "#2b6cc4", { anchor: "end" }) : ""}</g>` +
          (lab ? ISO.word(K.iso([fixRight + 8, 0, meterTop - 14], P), `${newtons.toFixed(1)} N`, "#c0392b", { anchor: "start", size: 17 }) : "");
        el = Object.fromEntries([...rig.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
      };
      const draw = () => {
        const key = `${m.k} ${m.load}`;
        if (key !== layout) { layout = key; build(); }
        const n = m.k === "movable" ? 2 : 1, rise = s.wind / n, loadZ = 88 + rise;
        w.attr(el.hang, "transform", K.translateAlong(P, [0, 0, rise]));
        if (el.move) w.attr(el.move, "transform", K.translateAlong(P, [0, 0, rise]));
        const rope = [[[fixRight, meterTop + 2], [fixRight, FIX[2]]], Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (i / 12); return [FIX[0] + Math.cos(a) * R, FIX[2] + Math.sin(a) * R]; })];
        if (n === 1) rope.push([[fixLeft, FIX[2]], [fixLeft, loadZ]]);
        else {
          const mz = loadZ + 14;
          rope.push([[fixLeft, FIX[2]], [MOVE_X + R, mz]], Array.from({ length: 13 }, (_, i) => { const a = -Math.PI * (i / 12); return [MOVE_X + Math.cos(a) * R, mz + Math.sin(a) * R]; }), [[ANCHOR_X, mz], [ANCHOR_X, BAR_Z - 2.2]]);
        }
        rope.push([[DRUM[0], DRUM[2] + DRUM_R], [DRUM[0], meterTop - 34]]);
        w.attr(el.rope, "d", rope.map((pts) => K.pathOf(pts.map(([x, z]) => K.iso([x, 0.2, z], P)))).join(""));
        const turn = s.wind / DRUM_R;
        w.rebuild(el.spokes, s.wind.toFixed(2), () => L(G.spokesOf(yAx(FIX), 2.4, 2.2, R - 1.6, 6, P, { phase: s.wind / R }), { tone: "lo" }));
        w.rebuild(el.crank, s.wind.toFixed(2), () => L(G.ribsOf(F, -6.8, 6.8, DRUM_R, 14, P, { phase: turn, seams: true }), { tone: "lo" }) +
          ISO.box((u, ww, y) => { const c = Math.cos(turn), sn = Math.sin(turn); return [DRUM[0] + DRUM_R + u * c - ww * sn, y, DRUM[2] + u * sn + ww * c]; }, P, [-1.4, 12], [-1.4, 1.4], [11, 13], "mid") +
          S(G.disc(13, 18, 1.6, yAx([DRUM[0] + DRUM_R + Math.cos(turn) * 11, 0, DRUM[2] + Math.sin(turn) * 11]), P), { tone: "hi" }));
        const parts = [...rig.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((q) => q.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.wind !== undefined) s.target = ISO.clamp(+p.wind, 0, 50);
        if (p.k) { m.k = p.k === "movable" ? "movable" : "fixed"; s.wind = s.target = 0; }
        if (p.load !== undefined) m.load = ISO.clamp(+p.load, 0.1, 0.8);
        if (p.lit) lit = p.lit;
      };
      g.update = (dt) => {
        s.wind = ISO.follow(s.wind, s.target, dt, 0.6, ISO.still());
        draw();
        return s.wind !== s.target;
      };
      g.readout = () => {
        const n = m.k === "movable" ? 2 : 1;
        return `${n} strand${n > 1 ? "s" : ""} hold the load · meter ${((m.load * g9) / n).toFixed(1)} N for ${m.load} kg (${(m.load * g9).toFixed(1)} N) · string wound ${s.wind.toFixed(0)} · load up ${(s.wind / n).toFixed(0)}`;
      };
      draw();
      if (t) label(parent, cx, top - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
