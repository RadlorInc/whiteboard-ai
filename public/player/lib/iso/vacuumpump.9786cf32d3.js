// "vacuumpump cx cy k on=0|1 lab=0 lit=foot|motor|pump|gauge|switch|inlet" — a PART (PARTS.md, batch 5): the electric
// vacuum pump of belljar.js at real size (25 × 12 × 15 cm), standing on the bench, origin the bench point under its
// middle. A steel foot on rubber pads; the motor lying along x on its own feet, cooling fins, a terminal box with a
// rocker switch on top, a fan cowl on the +x end (grille rings, the fan turning behind them); a bell housing over the
// coupling; the painted pump block with the barbed inlet on top (the hose to the plate), an oil filler cap, an oil
// sight glass and a vacuum gauge on its front (0 to −100 kPa). on=1: the switch rocks over, the fan spins up, and the
// gauge shows the inlet's vacuum falling toward −100 kPa (τ 1.6 s, the scene's pump-down); on=0 it spins down and the
// air leaks back. set({ on }). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const MZ = 62, MR = 46, M0 = -12, M1 = 104, CW = 118, BX = [-122, -24], BY = 44, BT = 112, GZ = 64, GX = -73, IN = [-98, 0];
  const WHITE = ISO.tint("#fbfbf7", ["#d9d9d2", "#e3e3dc", "#ecece6", "#f4f4ef"], "#55575c");
  const GREEN = ISO.tint("#7fb08a", ["#3f6e4a", "#4b7c56", "#588a63", "#679871"], "#1e3a25");
  const ang = (v) => ((-135 + 270 * v) * Math.PI) / 180;      // vacuum 0..1 → dial angle, 0 at lower left

  function staticSvg(P) {
    const B08 = window.B08, out = [`<path class="iso-halo" d="${K.haloOf({ x: -125, y: -60, w: 250, d: 120, r: 6 }, 0, 4, P)}"/>`];
    // the foot: four rubber pads, a steel plate with two slots
    out.push(`<g data-name="foot">${ISO.tinted(ISO.T.rubber, [[-112, -48], [-112, 48], [108, -48], [108, 48]].map(([x, y]) => S(K.cylinder(x, y, 8, 0, 6, P, 18, 0.5), { tone: "mid" })).join(""))}` +
      ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -125, y: -60, w: 250, d: 120, r: 6 }, 6, 6, P, 4, 0.8), { tone: "mid" })) +
      [-80, 70].map((x) => `<path d="${K.pathOf([[x - 14, 46, 12.05], [x + 14, 46, 12.05], [x + 14, 53, 12.05], [x - 14, 53, 12.05]].map((p) => K.iso(p, P)), true)}" fill="#55575c" stroke="#3c3f45" stroke-width="0.5"/>`).join("") + "</g>");
    // the pump block (painted), on the foot at the far left: block, top plate, oil cap, barbed inlet
    const bx = BX, bp = `<g data-name="pump">${ISO.tinted(GREEN, ISO.wbox(P, bx, [-BY, BY], [12, BT], "hi") + ISO.wbox(P, [bx[0] + 4, bx[1] - 4], [-BY + 4, BY - 4], [BT, BT + 5], "mid"))}`;
    out.push(bp + [[bx[0] + 8, -BY + 8], [bx[1] - 8, -BY + 8], [bx[0] + 8, BY - 8], [bx[1] - 8, BY - 8]].map(([x, y]) => B08.screwHead(P, [x, y, BT + 5], 2.6)).join(""));
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(-46, -16, 9, BT + 5, 7, P, 24), { tone: "mid" }) + L(K.knurl(-46, -16, 9, BT + 5, BT + 12, 18, P, 0.02), { tone: "lo" })));
    // the sight glass on the front face, low: a brass ring and the oil level line behind its glass
    const Fs = B08.Y([-40, BY, 32]);
    out.push(ISO.tinted(ISO.T.brass, S(G.disc(0, 2, 9, Fs, P), { tone: "hi" })), ISO.tinted(ISO.T.amber, S(G.disc(2, 2.4, 6.5, Fs, P), { tone: "mid" })), L(K.segment(G.pointOf(Fs, 2.5, 6.4, Math.PI * 0.95), G.pointOf(Fs, 2.5, 6.4, Math.PI * 0.05), P), { tone: "lo" }), "</g>");
    out.push(`<g data-name="inlet">${ISO.tinted(ISO.T.brass, S(K.cylinder(IN[0], IN[1], 11, BT + 5, 6, P, 6, 0.4), { tone: "hi" }) +
      S(G.lathe([[0, 0], [0, 6], [6, 6], [8, 7.6], [14, 6], [16, 7.6], [22, 6], [24, 7.6], [30, 6], [30, 0]], B08.Z([IN[0], IN[1], BT + 11]), P), { tone: "hi" }))}${S(G.disc(30, 30.2, 3.6, B08.Z([IN[0], IN[1], BT + 11]), P), { tone: "lo" })}</g>`);
    // the bell housing over the coupling, then the motor: feet, finned body, terminal box (the switch is drawn later)
    const F = B08.X([0, 0, MZ]);
    out.push(`<g data-name="motor">${ISO.tinted(ISO.T.paint, S(G.disc(BX[1], M0, 34, F, P), { tone: "mid" }))}`);
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [M0 + 10, M0 + 36], [-38, 38], [12, 26], "mid") + ISO.wbox(P, [M1 - 36, M1 - 10], [-38, 38], [12, 26], "mid")));
    out.push(ISO.tinted(ISO.T.paint, S(G.disc(M0, M0 + 8, MR + 2, F, P), { tone: "mid" }) + S(G.disc(M0 + 8, M1 - 8, MR, F, P), { tone: "hi", inner: L(G.ribsOf(F, M0 + 8, M1 - 8, MR, 28, P, { seams: true }), { tone: "lo" }) }) + S(G.disc(M1 - 8, M1, MR + 2, F, P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [22, 66], [-22, 22], [MZ + MR - 6, MZ + MR + 18], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 9, 5, B08.Y([44, 22, MZ + MR + 6]), P), { tone: "mid" })), "</g>");
    // the fan cowl on the +x end: its drum (the fan and the grille go on its face, drawn after)
    out.push(`<g data-name="motor">${ISO.tinted(ISO.T.paint, S(G.disc(M1, CW, MR - 2, F, P), { tone: "mid" }))}</g>`);
    return out.join("");
  }
  // the dial face (static ink) on the pump's front: white face, scale 0 → −100 kPa, numbers
  function dialSvg(P) {
    const B08 = window.B08, F = B08.Y([GX, BY, GZ]), out = [ISO.tinted(ISO.T.steel, S(G.disc(0, 6, 30, F, P), { tone: "hi" })), ISO.tinted(WHITE, S(G.disc(6, 6.6, 26, F, P), { tone: "hi" }))];
    const on = (r, a) => G.pointOf(F, 6.7, r, Math.PI / 2 - a), arc = Array.from({ length: 41 }, (_, i) => K.iso(on(21, ang(i / 40)), P)), minor = [], major = [];
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[40]], { size: 0.5, tone: "lo" }));
    for (let i = 0; i <= 20; i++) (i % 5 ? minor : major).push(K.segment(on(21, ang(i / 20)), on(i % 5 ? 18.6 : 17, ang(i / 20)), P));
    out.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    const txt = (p, t, size, c = "#2a2b2f") => LAB.faceText(P, p, [1, 0, 0], t, size, c);
    for (const v of [0, 0.5, 1]) { const p = on(13, ang(v)); out.push(txt([p[0], p[1] + 0.05, p[2] - 1.5], v ? `−${v * 100}` : "0", 4.4)); }
    out.push(txt(on(5.5, 0.5), "kPa", 3.6, "#55575c"));
    return out.join("");
  }
  const needleSvg = (P, v) => {
    const F = window.B08.Y([GX, BY, GZ]), a = Math.PI / 2 - ang(v), tip = G.pointOf(F, 7.3, 20, a), tail = G.pointOf(F, 7.3, 5, a + Math.PI), side = (d) => G.pointOf(F, 7.3, 1.4, a + d);
    return `<path d="${K.pathOf([tail, side(Math.PI / 2), tip, side(-Math.PI / 2)].map((p) => K.iso(p, P)), true)}" fill="#d63e2a" stroke="#7a1f1f" stroke-width="0.5" stroke-linejoin="round"/>` + ISO.tinted(ISO.T.steel, S(G.disc(7.3, 8.4, 2.4, F, P), { tone: "mid" }));
  };
  // the fan seen through the cowl's grille: six blades on the end face at phase a, then the grille rings and the hub
  const fanSvg = (P, a) => {
    const F = window.B08.X([0, 0, MZ]), s = CW + 0.05, out = [];
    out.push(`<path d="${K.pathOf(Array.from({ length: 48 }, (_, i) => K.iso(G.pointOf(F, s, MR - 5, (i / 48) * Math.PI * 2), P)), true)}" fill="#2a2b2f" stroke="#121214" stroke-width="0.6"/>`);
    for (let i = 0; i < 6; i++) {
      const b = a + (i / 6) * Math.PI * 2, pts = [G.pointOf(F, s, 8, b - 0.25), G.pointOf(F, s, MR - 7, b - 0.05), G.pointOf(F, s, MR - 7, b + 0.32), G.pointOf(F, s, 8, b + 0.25)];
      out.push(`<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="#8d9096" stroke="#3c3f45" stroke-width="0.5" stroke-linejoin="round"/>`);
    }
    return out.join("");
  };
  const grilleSvg = (P) => {
    const F = window.B08.X([0, 0, MZ]), s = CW + 0.4, out = [];
    for (const r of [12, 20, 28, 36]) out.push(`<path d="${G.circleOf(F, s, r, P)}" fill="none" stroke="#c6d5e5" stroke-width="${Math.max(0.8, G.scaleOf(P) * 2.2).toFixed(2)}"/>`);
    for (let i = 0; i < 4; i++) { const b = (i / 4) * Math.PI * 2 + Math.PI / 4; out.push(`<path d="${K.segment(G.pointOf(F, s, 6, b), G.pointOf(F, s, MR - 5, b), P)}" stroke="#c6d5e5" stroke-width="${Math.max(0.8, G.scaleOf(P) * 2.4).toFixed(2)}" stroke-linecap="round"/>`); }
    out.push(ISO.tinted(ISO.T.paint, S(G.disc(CW, CW + 3, 6, F, P), { tone: "hi" })));
    return out.join("");
  };
  // the rocker switch on the terminal box: its bezel and the rocker tilted toward I (on) or O (off)
  const switchSvg = (P, on) => {
    const z = MZ + MR + 18, t = on ? 1 : -1, pts = [[34 - 1, z], [54 + 1, z], [54, z + 6 + 2 * t], [44, z + 7], [34, z + 6 - 2 * t]];
    return ISO.tinted(ISO.T.plastic, ISO.wbox(P, [32, 56], [-10, 10], [z, z + 2.5], "mid")) +
      ISO.prismY(P, pts, -7, 7, on ? ["#a8302a", "#d65446"] : ["#1f2226", "#363a40"], on ? "#e2604f" : "#3a3e44", "#0d0e10") +
      LAB.faceText(P, [on ? 50 : 38, 0, z + 7.2], [1, 0, 0], on ? "I" : "O", 5, "#ffffff", [0, -1, 0]);
  };

  ISO.add({
    name: "vacuumpump", title: "Vacuum pump (part)", compare: null,
    about: "An electric vacuum pump 25 × 12 × 15 cm: a motor on a steel foot with a fan cowl and a rocker switch, the pump block with a barbed inlet on top for the hose, an oil sight glass and a vacuum gauge; on=1 the motor runs and the gauge falls toward −100 kPa. anchors: inlet switch",
    line: "vacuumpump cx cy k on=0|1 lab=0 lit=foot|motor|pump|gauge|switch|inlet",
    demo: { line: "vacuumpump 480 380 22", script: [{ set: {}, hold: 1 }, { set: { on: 1, lit: "motor" }, hold: 3 }, { set: { lit: "gauge" }, hold: 2 }, { set: { lit: "inlet" }, hold: 1 }, { set: { on: 0, lit: "switch" }, hold: "settle" }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = staticSvg(Pm) + `<g data-name="gauge">${dialSvg(Pm)}<g data-part="needle"></g></g><g data-name="motor"><g data-part="fan"></g>${grilleSvg(Pm)}</g>` +
        `<g data-name="switch" data-part="switch"></g>` + (lab ? CIRC.word(P, [12.5, 0, 15], "vacuum pump") : "");
      g.anchors = { inlet: [IN[0] / 10, IN[1] / 10, (BT + 41) / 10], switch: [4.4, 0, (MZ + MR + 25) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const s = { on: o.on === "1", spd: 0, a: 0, vac: 0 };
      if (s.on && ISO.still()) { s.spd = 1; s.vac = 1; }
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.fan, (s.a % (Math.PI / 3)).toFixed(3), () => fanSvg(Pm, s.a % (Math.PI / 3)));
        w.rebuild(el.needle, s.vac.toFixed(4), () => needleSvg(Pm, s.vac));
        w.rebuild(el.switch, String(s.on), () => switchSvg(Pm, s.on));
        window.B08.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) s.on = String(p.on) === "1";
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still(), want = s.on ? 1 : 0, d = Math.min(dt, 0.25);
        s.spd = ISO.follow(s.spd, want, d, s.on ? 0.4 : 0.8, calm);
        if (Math.abs(s.spd - want) < 0.002) s.spd = want;
        if (!calm) s.a = (s.a + d * s.spd * 2 * Math.PI * 1.3) % (Math.PI * 2);   // drawn slower than 24 rev/s so it reads
        s.vac = calm ? want * 0.998 : want + (s.vac - want) * Math.exp(-d / (s.on ? 1.6 : 2.5));
        if (Math.abs(s.vac - want * 0.998) < 0.002) s.vac = want * 0.998;
        draw();
        return s.spd > 0 || s.vac !== want * 0.998;
      };
      g.readout = () => `${s.on ? "motor running" : s.spd > 0.02 ? "motor running down" : "motor off"} · inlet vacuum ${(-100 * s.vac).toFixed(0)} kPa (gauge) · ${s.on ? "pumping air out through the hose" : "not pumping"}`;
      draw();
      return g;
    },
  });
})();
