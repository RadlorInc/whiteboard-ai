// "rampboard cx cy k len=60..150 deg=0..40 lab=0 lit=board|block|scale" — a PART (PARTS.md): a school runway plank
// propped on a stack of wooden blocks, its origin the bench point under the board's low end; the board rises along +x
// at deg. A 15 cm wide, 1.8 cm pine plank resting on its low edge, a rubber stop across its low end, a printed cm
// scale along its near edge, a stack of 5 cm blocks (and a thinner slat on top) at three-fifths of its length whose
// height sets the slope (the board rests on the stack's low top edge, so height = that edge's distance × tan deg), and
// a clear protractor standing behind the low end, read along the board's top. set({ deg }) tilts it (eased), set({ len })
// rebuilds it. Anchors top and bottom: the board's surface centre-line 13 cm and 15 cm in from its ends, where a trolley
// starts and where its plunger meets the stop (a labtrolley placed at= top with the same tilt has its four wheels on the
// board). Reuses incline.js's quadrant idea. World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BW = 15, T = 1.8, BX = 10, BY = 12, BH = 5, PR = 16, IN_TOP = 13, IN_BOT = 15;
  const PINE = ISO.tint("#f7e6c8", ["#d8b27c", "#e0bf8e", "#e8cca2", "#efd8b5"], "#7a5a2e");
  const OAK = ISO.tint("#f0d9b5", ["#c49a62", "#cfa873", "#d9b686", "#e3c49a"], "#6b4a20");
  const rad = (d) => (d * Math.PI) / 180;
  // the board's frame: u along it from the low end, w up from its underside, y across
  const onBoard = (th) => (u, w, y) => [u * Math.cos(th) - w * Math.sin(th), y, u * Math.sin(th) + w * Math.cos(th)];
  const stackOf = (len, th) => { const x0 = 0.6 * len * Math.cos(th) - BX / 2; return { x0, h: x0 * Math.tan(th) }; };

  // the stack of blocks under the board: whole 5 cm blocks, then a slat for the rest (none when the board lies flat)
  function blockSvg(P, len, th) {
    const { x0, h } = stackOf(len, th), out = [];
    if (h < 0.3) return "";
    let z = 0, i = 0;
    while (h - z > 1e-6) {
      const t = h - z >= BH + 0.3 ? BH : h - z, dx = i % 2 ? 0.25 : 0;
      out.push(ISO.tinted(i % 2 ? PINE : OAK, ISO.wbox(P, [x0 + dx, x0 + BX + dx], [-BY / 2, BY / 2], [z, z + t], "mid")));
      z += t; i++;
    }
    return `<g data-name="block">${out.join("")}</g>`;
  }
  function boardSvg(P, len, th) {
    const at = onBoard(th), out = [ISO.box(at, P, [0, len], [0, T], [-BW / 2, BW / 2], "mid")];
    // the printed scale along the near edge: every 2 cm, longer every 10, a number every 20; ticks hang from the edge
    const minor = [], major = [];
    for (let u = 2; u <= len - 2; u += 2) (u % 10 ? minor : major).push(K.segment(at(u, T, BW / 2), at(u, T, BW / 2 - (u % 10 ? 0.9 : 1.8)), P));
    const nums = [L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" })];
    for (let u = 20; u <= len - 10; u += 20) nums.push(LAB.faceText(P, at(u, T + 0.01, BW / 2 - 3.2), [Math.cos(th), 0, Math.sin(th)], String(u), 1.3, "#7a5a2e", [0, -1, 0]));
    out.push(`<g data-name="scale">${nums.join("")}</g>`);
    // the rubber stop across the low end, and two screws holding it
    out.push(ISO.tinted(ISO.T.rubber, ISO.box(at, P, [0.4, 2.2], [T, T + 1.6], [-BW / 2 + 0.5, BW / 2 - 0.5], "mid")));
    return `<g data-name="board">${ISO.tinted(PINE, out.join(""))}</g>`;
  }
  // a clear quarter protractor standing on the bench behind the low end (far side, so it never covers what rides the
  // board), its centre at the board's top low corner; ticks every 5°, numbers every 10, a red hairline printed along
  // the board's top surface: read where it crosses the arc
  function protractorSvg(P, th) {
    const y = -BW / 2 - 0.6, cx = -T * Math.sin(th), cz = T * Math.cos(th), out = [];
    const ar = (a, r) => [cx + Math.cos(rad(a)) * r, y + 0.01, cz + Math.sin(rad(a)) * r];
    const shape = [[cx, 0], [cx + PR, 0], ...ISO.arc(cx, cz, PR, 0, Math.PI / 2, 30)];
    out.push(`<g opacity=".55">${ISO.prismY(P, shape, y - 0.3, y, ["#c9dde9", "#eef6fb"], "#eef6fb", "#5d7f96")}</g>`);
    const arc = [], minor = [], major = [];
    for (let a = 0; a <= 90; a += 3) arc.push(K.iso(ar(a, PR - 0.6), P));
    for (let a = 0; a <= 90; a += 5) (a % 10 ? minor : major).push(K.segment(ar(a, PR - 0.6), ar(a, PR - (a % 10 ? 1.5 : 2.2)), P));
    out.push(L(K.pathOf(arc), { tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    for (let a = 10; a <= 80; a += 10) out.push(LAB.faceText(P, ar(a, PR - 3.4), [Math.sin(rad(a)), 0, -Math.cos(rad(a))], String(a), 0.95, "#33506f", [Math.cos(rad(a)), 0, Math.sin(rad(a))]));
    out.push(`<path d="${K.pathOf([K.iso([cx, y + 0.02, cz], P), K.iso(ar((th * 180) / Math.PI, PR - 0.6), P)])}" stroke="#c0392b" stroke-width="0.9"/>`);
    return `<g data-name="scale">${out.join("")}</g>`;
  }

  ISO.add({
    name: "rampboard", title: "Ramp board (part)", compare: null,
    about: "A runway plank on a stack of wooden blocks that sets its slope deg, a rubber stop at its low end, a cm scale along it and a protractor at the low end; it rises along +x from its low end. anchors: top bottom",
    line: "rampboard cx cy k len=60..150 deg=0..40 lab=0 lit=board|block|scale",
    demo: { line: "rampboard 330 400 5 len=100 deg=15", script: [{ set: {}, hold: 1 }, { set: { lit: "block" }, hold: 1.2 }, { set: { deg: 30, lit: "scale" }, hold: "settle" }, { set: { deg: 5, lit: "board" }, hold: "settle" }, { set: { len: 70, deg: 15, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const s = { len: ISO.clamp(ISO.num(o, "len", 100), 60, 150), to: rad(ISO.clamp(ISO.num(o, "deg", 15), 0, 40)), th: 0 };
      s.th = s.to;
      g.innerHTML = `<g data-part="halo"></g><g data-part="pro"></g><g data-part="ramp"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      let lit = o.lit || "";
      const draw = () => {
        const th = Math.round(s.th * 2000) / 2000, key = `${s.len} ${th}`, { x0, h } = stackOf(s.len, th);
        w.rebuild(el.halo, key, () => `<path class="iso-halo" d="${K.haloOf({ x: -1, y: -BW / 2 - 1, w: s.len * Math.cos(th) + 2, d: BW + 2, r: 1 }, 0, 0.6, P)}"/>`);
        w.rebuild(el.ramp, key, () => blockSvg(P, s.len, th) + boardSvg(P, s.len, th));
        w.rebuild(el.pro, String(th), () => protractorSvg(P, th));
        w.rebuild(el.words, lab ? key : "", () => (lab ? CIRC.word(P, onBoard(th)(s.len, T, 0), `ramp at ${Math.round((th * 180) / Math.PI)}°`) + (h >= 0.3 ? CIRC.word(P, [x0 + BX, BY / 2, h / 2], "blocks") : "") : ""));
        const at = onBoard(th), fix = (p) => p.map((v) => +v.toFixed(3));
        g.anchors = { top: fix(at(s.len - IN_TOP, T, 0)), bottom: fix(at(IN_BOT, T, 0)) };
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.deg !== undefined && Number.isFinite(+p.deg)) s.to = rad(ISO.clamp(+p.deg, 0, 40));
        if (p.len !== undefined && Number.isFinite(+p.len)) s.len = ISO.clamp(+p.len, 60, 150);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => { s.th = ISO.follow(s.th, s.to, dt, 0.3, ISO.still() || dt > 1); if (Math.abs(s.th - s.to) < 1e-4) s.th = s.to; draw(); return s.th !== s.to; };
      g.readout = () => {
        const th = s.th, top = s.len * Math.sin(th);
        return `ramp ${s.len} cm at ${((th * 180) / Math.PI).toFixed(1)}° · top end ${top.toFixed(1)} cm up · blocks ${stackOf(s.len, th).h.toFixed(1)} cm high · a trolley on it is pulled down the slope by g·sin θ = ${(9.81 * Math.sin(th)).toFixed(2)} m/s²`;
      };
      draw();
      return g;
    },
  });
})();
