// "crane cx baseY height slew=0 r=180 hook=20 lab=1 lit=jib|trolley|counterweight|cab|mast" — a tower crane.
// A lattice mast on a concrete base carries the slewing ring; on it turn the cab, the tower head with its pendant ties,
// the long jib with the trolley and hook block, and the short counter-jib with the hoist winch and concrete
// counterweights. The demo lifts a steel beam, slews, runs the trolley in and lowers it. The readout compares the load's
// moment (load × radius) with the counterweight's: the counterweight balances the jib and part of the load, and the
// load chart keeps load × radius within what the mast can carry. 1 unit = 0.2 m; counterweight 10 t at 16 m; load 2 t.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const MZ = 300, HW = 6, TOPZ = 314, APEX = 362, JIB = 230, CJ = 88, CWS = 80, UNIT = 0.2, LOAD_T = 2, CW_T = 10, AZ = 60, REST = -32;
  const BASE = { x: -60, y: -50, w: 120, d: 100, r: 4 };
  const Y = ISO.tint("#ffd84d", ["#c99a12", "#d9ab1f", "#e7bd33", "#f2cd45"], "#6b5208"), YI = "#8a6414", YF = "#f2c230";
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const segs = (P, list) => list.map(([a, b]) => K.pathOf([K.iso(a, P), K.iso(b, P)])).join("");
  const tube = (d, w, k) => `<path d="${d}" fill="none" stroke="${YI}" stroke-width="${((w + 0.8) * k).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${YF}" stroke-width="${(w * k).toFixed(2)}" stroke-linecap="round"/>`;
  const brace = (d, k) => `<path d="${d}" fill="none" stroke="${YI}" stroke-width="${(0.9 * k).toFixed(2)}" stroke-linecap="round"/>`;

  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BASE, -6, 6, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(BASE, -6, 6, P, 4, 0.6), { tone: "lo" }))];
    out.push(ISO.tinted(ISO.T.road, S(K.slabOf({ x: -22, y: -22, w: 44, d: 44, r: 1 }, 0, 12, P, 2, 0.6), { tone: "hi" })));
    for (const [x, y] of [[-HW, -HW], [HW, -HW], [HW, HW], [-HW, HW]]) out.push(ISO.tinted(ISO.T.steel, S(K.slabOf({ x: x - 3, y: y - 3, w: 6, d: 6, r: 0.5 }, 12, 4, P, 2), { tone: "hi" })), D([K.iso([x - 2, y + 2, 16], P), K.iso([x + 2, y + 2, 16], P)], { size: 0.5 }));
    // a stack of steel beams waiting on the ground, and a site cabin corner for scale
    for (let i = 0; i < 3; i++) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [10, 54], [30 + i * 5, 34 + i * 5], [0, 3], "hi")));
    return out.join("");
  }
  // The mast: four chord tubes and K-bracing on every face, back faces first, front faces after.
  function mastSvg(P, front) {
    const k = K.cameraOf(P).k, c = [[-HW, -HW], [HW, -HW], [HW, HW], [-HW, HW]], view = [Math.cos(AZ * Math.PI / 180), Math.sin(AZ * Math.PI / 180)];
    const faces = [[0, 1, [0, -1]], [1, 2, [1, 0]], [2, 3, [0, 1]], [3, 0, [-1, 0]]].filter(([, , n]) => (n[0] * view[0] + n[1] * view[1] > 0) === front);
    const br = [];
    for (const [i, j] of faces) for (let z = 16; z < MZ - 1; z += 14) { const a = c[i], b = c[j], up = Math.min(MZ, z + 14); br.push([[a[0], a[1], z], [b[0], b[1], up]], [[b[0], b[1], up], [a[0], a[1], up]]); }
    const chords = c.filter(([x, y]) => ((x * view[0] + y * view[1]) > 0) === front || (front && Math.abs(x * view[0] + y * view[1]) < 1e-6)).map(([x, y]) => [[x, y, 16], [x, y, MZ]]);
    // ladder and rest platforms inside the mast show through the bracing
    const extra = front ? "" : brace(segs(P, [[[-2, 2, 16], [-2, 2, MZ]], [[2, 2, 16], [2, 2, MZ]], ...Array.from({ length: 70 }, (_, i) => [[-2, 2, 18 + i * 4], [2, 2, 18 + i * 4]])]), k * 0.7);
    return extra + brace(segs(P, br), k) + tube(segs(P, chords), 1.6, k);
  }
  // Everything on the slewing ring, turned to angle th (degrees from +x): ring, platform, tower head, ties, jib,
  // counter-jib, counterweights, winch, cab, trolley at radius r. Drawn far to near by which way the jib points.
  function topSvg(P, th, r) {
    const k = K.cameraOf(P).k, a = th * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], q = [-d[1], d[0]];
    const at = (s, l, z) => [s * d[0] + l * q[0], s * d[1] + l * q[1], z], box = (s, z, l, tone = "hi", lit) => ISO.box((u, w, y) => at(u, y, w), P, s, z, l, tone, lit);
    const view = [Math.cos(AZ * Math.PI / 180), Math.sin(AZ * Math.PI / 180)], jibNear = d[0] * view[0] + d[1] * view[1] > 0, cabNear = q[0] * view[0] + q[1] * view[1] > 0;
    // trolley on the bottom chords with its sheaves
    const trolley = r === undefined ? "" : named("trolley", ISO.tinted(Y, box([r - 6, r + 6], [TOPZ - 5, TOPZ - 1], [-7, 7])) + D([K.iso(at(r - 3, 0, TOPZ - 7), P), K.iso(at(r + 3, 0, TOPZ - 7), P)], { size: 1.6, tone: "mid" }));
    if (r !== undefined) return trolley;
    const ring = S(K.cylinder(0, 0, 10, MZ, 6, P, 40, 0.4), { tone: "mid" }) + ISO.tinted(Y, box([-10, 10], [MZ + 6, TOPZ], [-9, 9]));
    // jib: two bottom chords and a top chord (a triangle), zigzag on both sides, rungs between the bottom chords
    const bl = [[8, -5, TOPZ], [JIB, -5, TOPZ]], br = [[8, 5, TOPZ], [JIB, 5, TOPZ]], tp = [[8, 0, TOPZ + 13], [JIB - 6, 0, TOPZ + 4]];
    const jz = (s) => TOPZ + 13 - (9 * (s - 8)) / (JIB - 14), jb = [];
    for (let s = 8; s < JIB - 6; s += 12) { const s2 = Math.min(JIB - 6, s + 12); for (const l of [-5, 5]) jb.push([at(s, l, TOPZ), at(s + 6, 0, jz(s + 6))], [at(s + 6, 0, jz(s + 6)), at(s2, l, TOPZ)]); jb.push([at(s, -5, TOPZ), at(s, 5, TOPZ)]); }
    const jib = named("jib", brace(segs(P, jb), k) + tube(segs(P, [bl, br, tp].map(([p0, p1]) => [at(...p0), at(...p1)])), 1.5, k) + ISO.tinted(Y, box([JIB - 2, JIB + 1], [TOPZ - 2, TOPZ + 6], [-6, 6])));
    // counter-jib: a flat lattice with a walkway, the hoist winch and the counterweight slabs hanging at its end
    const cb = [];
    for (let s = -10; s > -CJ; s -= 12) for (const l of [-6, 6]) cb.push([at(s, l, TOPZ), at(s - 12, -l, TOPZ)]);
    const cw = [];
    for (let i = 0; i < 4; i++) cw.push(ISO.tinted(ISO.T.road, box([-CWS - 6, -CWS + 6], [TOPZ - 28 + i * 7, TOPZ - 21.4 + i * 7], [-8, 8])));
    const counter = brace(segs(P, cb), k) + tube(segs(P, [[at(-10, -6, TOPZ), at(-CJ, -6, TOPZ)], [at(-10, 6, TOPZ), at(-CJ, 6, TOPZ)]]), 1.5, k) +
      named("counterweight", cw.join("")) + ISO.tinted(Y, box([-56, -40], [TOPZ, TOPZ + 9], [-6, 6])) + box([-52, -44], [TOPZ + 9, TOPZ + 16], [-5, 5], "mid");
    // tower head (an A-frame) and the pendant ties from its apex to the jib and the counter-jib
    const head = tube(segs(P, [[at(-8, -7, TOPZ), at(0, 0, APEX)], [at(-8, 7, TOPZ), at(0, 0, APEX)], [at(8, -7, TOPZ), at(0, 0, APEX)], [at(8, 7, TOPZ), at(0, 0, APEX)]]), 1.4, k) + brace(segs(P, [[at(-6, 0, TOPZ + 14), at(6, 0, TOPZ + 14)], [at(-4, 0, TOPZ + 28), at(4, 0, TOPZ + 28)]]), k);
    const ties = `<path d="${segs(P, [[at(0, 0, APEX), at(150, 0, jz(150))], [at(0, 0, APEX), at(-CJ + 2, -6, TOPZ)], [at(0, 0, APEX), at(-CJ + 2, 6, TOPZ)]])}" fill="none" stroke="#3c3f45" stroke-width="${(0.7 * k).toFixed(2)}"/>`;
    const cab = named("cab", ISO.tinted(Y, box([6, 20], [MZ + 2, TOPZ + 4], cabNear ? [9, 19] : [-19, -9])) + ISO.tinted(ISO.T.glass, box([20, 20.4], [MZ + 7, TOPZ + 2], cabNear ? [10, 18] : [-18, -10])));
    const order = jibNear ? [counter, ring, cabNear ? "" : cab, head, ties, cabNear ? cab : "", jib] : [jib, ring, cabNear ? "" : cab, head, ties, cabNear ? cab : "", counter];
    return order.join("");
  }
  // The hook block on its two falls of rope, and the beam slung under it.
  function hookSvg(P, th, r, hz) {
    const a = th * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], q = [-d[1], d[0]], at = (s, l, z) => [s * d[0] + l * q[0], s * d[1] + l * q[1], z], k = K.cameraOf(P).k;
    const out = [`<path d="${segs(P, [[at(r - 3, 0, TOPZ - 8), at(r - 1.6, 0, hz + 16)], [at(r + 3, 0, TOPZ - 8), at(r + 1.6, 0, hz + 16)]])}" fill="none" stroke="#2f343a" stroke-width="${(0.6 * k).toFixed(2)}"/>`];
    out.push(ISO.tinted(Y, ISO.box((u, w, y) => at(u, y, w), P, [r - 3.4, r + 3.4], [hz + 9, hz + 17], [-2.4, 2.4], "hi")));
    out.push(`<path d="${K.pathOf([at(r, 0, hz + 9), at(r, 0, hz + 6), ...ISO.arc(0, 0, 2.2, Math.PI, Math.PI * 2.6, 10).map(([u, v]) => at(r + u, 0, hz + 4 + v))].map((p) => K.iso(p, P)))}" fill="none" stroke="#2f343a" stroke-width="${(1.1 * k).toFixed(2)}" stroke-linecap="round"/>`);
    // slings to the beam's ends, and the beam itself (an I-section along the jib's cross direction)
    out.push(`<path d="${segs(P, [[at(r, 0, hz + 3), at(r - 22, 0, hz - 12)], [at(r, 0, hz + 3), at(r + 22, 0, hz - 12)]])}" fill="none" stroke="#3c3f45" stroke-width="${(0.6 * k).toFixed(2)}"/>`);
    out.push(ISO.tinted(ISO.T.steel, ISO.box((u, w, y) => at(u, y, w), P, [r - 26, r + 26], [hz - 20, hz - 19], [-3, 3], "hi") + ISO.box((u, w, y) => at(u, y, w), P, [r - 26, r + 26], [hz - 19, hz - 13], [-0.7, 0.7], "hi") + ISO.box((u, w, y) => at(u, y, w), P, [r - 26, r + 26], [hz - 13, hz - 12], [-3, 3], "hi")));
    return named("load", out.join(""));
  }

  ISO.add({
    name: "crane", title: "Tower crane", compare: "crane 480 500 440",
    about: "A tower crane: lattice mast, slewing ring, cab, jib with trolley and hook, counter-jib with counterweights; it lifts a steel beam, slews and sets it down nearer the mast.",
    line: "crane cx baseY height slew=0 r=180 hook=20 lab=1 lit=jib|trolley|counterweight|cab|mast",
    demo: { line: "crane 480 510 450", script: [{ set: { hook: 140 }, hold: "settle" }, { set: { slew: 40 }, hold: "settle" }, { set: { r: 100 }, hold: "settle" }, { set: { hook: 20 }, hold: "settle" }] },
    make([cx, by, size = 440], o, t, parent) {
      const lab = o.lab !== "0", H = size, W = size * 1.5;
      const span = [REST, REST + 40].flatMap((th) => { const a = th * Math.PI / 180; return [[JIB * Math.cos(a), JIB * Math.sin(a), TOPZ + 13], [-CJ * Math.cos(a), -CJ * Math.sin(a), TOPZ - 30]]; });
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -6, 0), [0, 0, APEX], ...span], cx, by - H / 2, W, H, { azimuth: AZ, elevation: 16 }, parent);
      const s = { th: ISO.num(o, "slew", 0), r: ISO.clamp(ISO.num(o, "r", 180), 40, JIB - 12), hz: ISO.clamp(ISO.num(o, "hook", 20), 20, TOPZ - 40) };
      const want = { ...s };
      g.innerHTML = `<g>${baseSvg(P)}</g><g data-part="behind"></g><g data-name="mast">${mastSvg(P, false)}${mastSvg(P, true)}</g><g data-part="top"></g><g data-part="trolley"></g><g data-part="front"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "";
      const view = [Math.cos(AZ * Math.PI / 180), Math.sin(AZ * Math.PI / 180)];
      const draw = () => {
        const th = REST + s.th, key = `${th.toFixed(2)} ${s.r.toFixed(1)}`;
        w.rebuild(el.top, th.toFixed(2), () => topSvg(P, th));
        w.rebuild(el.trolley, key, () => topSvg(P, th, s.r));
        const a = th * Math.PI / 180, near = (Math.cos(a) * view[0] + Math.sin(a) * view[1]) * s.r > 0;
        const hk = `${key} ${s.hz.toFixed(1)}`;
        w.rebuild(el.front, near ? hk : "", () => (near ? hookSvg(P, th, s.r, s.hz) : ""));
        w.rebuild(el.behind, near ? "" : hk, () => (near ? "" : hookSvg(P, th, s.r, s.hz)));
        w.rebuild(el.words, key, () => !lab ? "" : ISO.word(K.iso([JIB * Math.cos(a), JIB * Math.sin(a), TOPZ + 6], P), "jib", "#555", { size: 14, dy: -12 }) +
          ISO.word(K.iso([-CJ * Math.cos(a), -CJ * Math.sin(a), TOPZ - 28], P), "counterweight", "#555", { size: 14, dy: 18 }) + ISO.word(K.iso([HW, HW, 120], P), "mast", "#555", { size: 14, anchor: "start", dy: 0 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.slew !== undefined) want.th = ISO.clamp(+p.slew, -30, 60);
        if (p.r !== undefined) want.r = ISO.clamp(+p.r, 40, JIB - 12);
        if (p.hook !== undefined) want.hz = ISO.clamp(+p.hook, 20, TOPZ - 40);
        if (p.lit !== undefined) lit = p.lit;
      };
      // a crane moves at steady speeds: slew 12°/s, trolley 40 units/s, hoist 50 units/s (eased at the ends)
      const step = (x, to, v, dt) => { const d = to - x, m = Math.min(Math.abs(d), v * dt * Math.min(1, 0.25 + Math.abs(d) / (v * 0.6))); return ISO.still() || Math.abs(d) < 1e-3 ? to : x + Math.sign(d) * m; };
      g.update = (dt) => {
        s.th = step(s.th, want.th, 12, dt); s.r = step(s.r, want.r, 40, dt); s.hz = step(s.hz, want.hz, 50, dt);
        draw();
        return s.th !== want.th || s.r !== want.r || s.hz !== want.hz;
      };
      g.readout = () => {
        const rm = s.r * UNIT, lm = LOAD_T * rm, cm = CW_T * CWS * UNIT;
        return `load ${LOAD_T} t × ${rm.toFixed(0)} m = ${lm.toFixed(0)} t·m · counterweight ${CW_T} t × ${(CWS * UNIT).toFixed(0)} m = ${cm.toFixed(0)} t·m (it also balances the jib's own weight) · hook ${(s.hz * UNIT).toFixed(0)} m up · slewed ${s.th.toFixed(0)}°`;
      };
      draw();
      if (t) label(parent, cx, by - H - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
