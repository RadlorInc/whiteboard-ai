// "powerline x1 x2 baseY height load=0-100 flow=1 lab=1 lit=tower|arm|insulator|wire|earthwire" — a 132 kV line.
// Two lattice steel pylons on concrete footings (four tapering legs, cross bracing, two levels of cross-arms and an
// earth-wire peak), each arm carrying a string of nine glass insulator discs, with the conductors hanging in a
// catenary from string to string and the earth wire over the top. The insulators keep the 132 kV in the wire from
// reaching the steel (each disc holds off about 15 kV). Current heats the aluminium wire: at higher load it runs
// hotter, grows longer and sags lower (the clearance to the ground is what limits it). flow=1 runs the current along
// the wires. set({ load, flow, lit }). World units: 1 = 1 m (the span is drawn far shorter than a real 300 m one).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const PH = 40, B = 4.2, WAIST = 1.5, WZ = 27, ARMS = [{ z: 25, half: 8.4 }, { z: 32, half: 6.6 }], STR = 3.2;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const GALV = ISO.tint("#e7e9ec", ["#a6abb2", "#b5b9bf", "#c4c7cc", "#d2d4d8"], "#4a4f56"), GLASS = ISO.tint("#dfeee6", ["#7fae96", "#90bba5", "#a3c7b4", "#b7d4c4"], "#2e5a46");
  const tempOf = (ld) => 25 + 55 * ld * ld, sagOf = (ld) => 3.4 + 0.045 * (tempOf(ld) - 25);
  // the tower's half-width at height z (legs taper to the waist, then run straight up to the peak)
  const half = (z) => (z < WZ ? B - ((B - WAIST) * z) / WZ : WAIST * (1 - (0.6 * (z - WZ)) / (PH - WZ)));

  function rod(P, a, b, r, tone = "mid") {
    const d = G.sub3(b, a);
    return ISO.tinted(GALV, S(G.disc(0, G.len3(d), r, G.frameAlong(a, d), P, { steps: 8 }), { tone, crease: "none" }));
  }
  // a world move is a flat screen move in this projection
  const shift = (P, p) => { const a = K.iso(p, P), o = K.iso([0, 0, 0], P); return [a[0] - o[0], a[1] - o[1]]; };
  const discMemo = new WeakMap();
  const discOf = (P) => { if (!discMemo.has(P)) discMemo.set(P, ISO.tinted(GLASS, S(G.lathe([[-0.12, 0], [-0.12, 0.3], [0, 0.5], [0.06, 0.2], [0.06, 0]], zAx([0, 0, 0]), P, { steps: 18 }), { tone: "mid", crease: "none" }))); return discMemo.get(P); };
  function pylonSvg(P, x0) {
    const out = [], legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    const at = (sx, sy, z) => [x0 + sx * half(z), sy * half(z), z];
    // footings, then the legs from back to front, the lattice between them, the arms and the peak
    for (const [sx, sy] of legs) out.push(ISO.tinted(ISO.T.road, S(K.cylinder(x0 + sx * B, sy * B, 1.1, 0, 1.2, P, 16), { tone: "lo" })));
    const lattice = [];
    const zs = [1.2, 6, 11, 16, 21, WZ, 30, 34, PH - 2];
    const face = (s0, s1) => { for (let i = 0; i < zs.length - 1; i++) { const a = at(...s0, zs[i]), b = at(...s1, zs[i + 1]), c = at(...s1, zs[i]), d = at(...s0, zs[i + 1]); lattice.push(K.pathOf([K.iso(a, P), K.iso(b, P)]), K.pathOf([K.iso(c, P), K.iso(d, P)]), K.pathOf([K.iso(d, P), K.iso(b, P)])); } };
    const back = (pts) => pts.every(([sx, sy]) => K.depthOf([sx, sy, 0], P) < 0.4 + K.depthOf([0, 0, 0], P));
    const faces = [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]];
    const behind = faces.filter((f) => back(f)), front = faces.filter((f) => !back(f));
    behind.forEach(([a, b]) => face(a, b));
    out.push(`<path d="${lattice.join("")}" fill="none" stroke="#7d838b" stroke-width=".5"/>`);
    lattice.length = 0;
    for (const [sx, sy] of legs) out.push(rod(P, at(sx, sy, 1.2), at(sx, sy, WZ), 0.22), rod(P, at(sx, sy, WZ), at(sx, sy, PH - 2), 0.16));
    front.forEach(([a, b]) => face(a, b));
    out.push(`<path d="${lattice.join("")}" fill="none" stroke="#5f656d" stroke-width=".55"/>`);
    // the peak where the earth wire sits
    out.push(ISO.tinted(GALV, ISO.wbox(P, [x0 - 0.7, x0 + 0.7], [-0.7, 0.7], [PH - 2, PH], "mid")));
    // the cross-arms: a box beam through the tower each side at each level, and their insulator strings
    for (const { z, half: hw } of ARMS) {
      out.push(`<g data-name="arm">${ISO.tinted(GALV, ISO.wbox(P, [x0 - half(z - 0.7), x0 + half(z - 0.7)], [-hw, hw], [z - 0.7, z], "mid"))}</g>`);
      const strings = [-hw + 0.4, hw - 0.4].sort((a, b) => K.depthOf([0, a, 0], P) - K.depthOf([0, b, 0], P));
      for (const y of strings) {
        // every disc is the same lathe moved in the world, so it is built once and moved on the screen
        const disc = discOf(P), discs = [];
        for (let i = 0; i < 9; i++) { const [dx, dy] = shift(P, [x0, y, z - 0.7 - 0.25 - i * 0.32]); discs.push(`<g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})">${disc}</g>`); }
        out.push(`<g data-name="insulator">${ISO.tinted(GALV, S(K.cylinder(x0, y, 0.06, z - 0.7 - STR, STR, P, 6), { tone: "mid", crease: "none" }))}${discs.join("")}</g>`);
      }
    }
    return out.join("");
  }
  // a hanging wire from a to b with its lowest point `sag` below the chord's middle (a parabola is a close catenary)
  const wire = (P, a, b, sag) => { const pts = []; for (let i = 0; i <= 32; i++) { const u = i / 32; pts.push(K.iso([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u - 4 * sag * u * (1 - u)], P)); } return K.pathOf(pts); };
  const ends = () => ARMS.flatMap(({ z, half: hw }) => [-hw + 0.4, hw - 0.4].map((y) => [y, z - 0.7 - STR]));
  function wiresSvg(P, sag, k, side, flow, SPAN) {
    const list = ends().filter(([y]) => (side < 0 ? y < 0 : y > 0)).map(([y, z]) => wire(P, [0, y, z], [SPAN, y, z], sag));
    const d = list.join("");
    return `<path d="${d}" fill="none" stroke="#2a2d31" stroke-width="${(0.12 * k + 0.6).toFixed(2)}"/>` + (flow ? `<path class="pl-flow" d="${d}" fill="none" stroke="#ffd36b" stroke-width="${(0.1 * k + 0.4).toFixed(2)}" stroke-dasharray="${(1.6 * k).toFixed(1)} ${(5 * k).toFixed(1)}" stroke-linecap="round"/>` : "");
  }

  ISO.add({
    name: "powerline", title: "Power line on pylons", compare: "powerline 260 700 470 340",
    about: "Two steel pylons carrying a 132 kV line: glass insulators keep the voltage off the steel, and the wires sag lower as the current heats them.",
    line: "powerline x1 x2 baseY height load=0-100 flow=1 lab=1 lit=tower|arm|insulator|wire|earthwire",
    demo: { line: "powerline 260 700 470 340 load=20", script: [{ set: {}, hold: 1.5 }, { set: { lit: "insulator" }, hold: 2 }, { set: { load: 100, lit: "wire" }, hold: 3.5 }] },
    make([x1 = 260, x2 = 700, by = 470, size = 340], o, t, parent) {
      // the board positions are the pylons' feet: `size` sets the scale (a pylon is size tall), x2 − x1 the span
      const lab = o.lab !== "0", AZ = 64, EL = 10, k = Math.max(60, size) / (PH * Math.cos((EL * Math.PI) / 180)), SPAN = Math.max(30, (x2 - x1) / (k * Math.sin((AZ * Math.PI) / 180)));
      const GR = { x: -12, y: -13, w: SPAN + 24, d: 26, r: 2 }, cx = (x1 + x2) / 2, H = size * 1.2;
      const { P, g } = ISO.frame([[0, 0, 0], [1, 1, 1]], 480, 270, 960, 540, { azimuth: AZ, elevation: EL }, parent);
      P.scale = k / K.cameraOf({ scale: 1 }).k; P.origin = [0, 0];
      // x1 on the first foot; the two feet sit either side of baseY (the line runs a little toward the viewer)
      const foot = K.iso([0, 0, 0], P), foot2 = K.iso([SPAN, 0, 0], P); P.origin = [x1 - foot[0], by - (foot[1] + foot2[1]) / 2];
      const pylon = pylonSvg(P, 0);   // the far pylon is the same one moved along the span
      g.innerHTML = `<g>${ISO.tinted(ISO.tint("#e6ead9", ["#b3b9a2", "#bec4ae", "#c9cfba", "#d4d9c6"], "#5a604c"), S(K.slabOf(GR, -1.4, 1.4, P, 4), { tone: "lo", halo: true }))}</g>
        <g data-part="far"></g><g data-name="tower">${pylon}</g><g data-name="tower2" transform="translate(${shift(P, [SPAN, 0, 0]).map((v) => v.toFixed(2)).join(" ")})">${pylon}</g><g data-name="earthwire"></g><g data-part="near"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { far: q("far"), near: q("near"), ew: q("earthwire"), words: q("words") }, w = ISO.writer();
      const ld0 = ISO.clamp(ISO.num(o, "load", 50), 0, 100) / 100;
      const s = { ld: ld0, want: ld0, flow: o.flow !== "0", t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const sag = Math.round(sagOf(s.ld) * 40) / 40;
        w.rebuild(el.far, `${sag} ${s.flow}`, () => wiresSvg(P, sag, k, -1, s.flow, SPAN));
        w.rebuild(el.near, `${sag} ${s.flow}`, () => wiresSvg(P, sag, k, 1, s.flow, SPAN));
        w.rebuild(el.ew, "e", () => `<path d="${wire(P, [0, 0, PH], [SPAN, 0, PH], 2.2)}" fill="none" stroke="#5a5f66" stroke-width="${(0.08 * k + 0.4).toFixed(2)}"/>`);
        for (const f of g.querySelectorAll(".pl-flow")) f.setAttribute("stroke-dashoffset", (-s.t * 14 * (0.3 + s.ld)).toFixed(1));
        const low = ARMS[0].z - 0.7 - STR - sag;
        w.rebuild(el.words, lab ? `${Math.round(tempOf(s.ld))} ${sag}` : "", () => !lab ? "" : [
          ISO.word(K.iso([SPAN / 2, 9, low], P), `wire ${Math.round(tempOf(s.ld))} °C · sags ${sag.toFixed(1)} m`, "#a3271b", { size: 13, dy: 22 }),
          ISO.word(K.iso([SPAN, ARMS[1].half, ARMS[1].z - 2], P), "glass insulators", "#2e5a46", { size: 13, anchor: "start" }).replace('x="', 'dx="10" x="'),
          ISO.word(K.iso([SPAN / 2, 0, PH - 2.2], P), "earth wire", "#555", { size: 12, dy: -6 }),
          ISO.word(K.iso([0, B, 6], P), "steel pylon", "#444", { size: 13, anchor: "end" }).replace('x="', 'dx="-8" x="')].join(""));
        w.light([...g.querySelectorAll('[data-name="tower"],[data-name="tower2"],[data-name="arm"],[data-name="insulator"],[data-name="earthwire"]'), el.far, el.near],
          lit === "wire" ? [el.far, el.near] : lit === "tower" ? [q("tower"), q("tower2")] : [...g.querySelectorAll(`[data-name="${lit}"]`)]);
      };
      g.set = (p) => {
        if (p.load !== undefined) s.want = ISO.clamp(+p.load, 0, 100) / 100;
        if (p.flow !== undefined) s.flow = !!+p.flow;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the wire warms and lengthens over minutes; shown over a couple of seconds
      g.update = (dt) => {
        s.t += dt;
        s.ld = ISO.follow(s.ld, s.want, dt, 0.7, ISO.still()); if (Math.abs(s.ld - s.want) < 0.003) s.ld = s.want;
        draw();
        return s.ld !== s.want;
      };
      g.readout = () => `132 kV line · load ${Math.round(s.ld * 100)} % · aluminium wire ≈ ${Math.round(tempOf(s.ld))} °C · it sags ${sagOf(s.ld).toFixed(1)} m here (hotter wire is longer) · 9 glass discs × ≈ 15 kV keep the voltage off the steel`;
      draw();
      if (t) label(parent, cx, by + 40, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
