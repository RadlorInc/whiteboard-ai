// "dialmeter cx cy k kind=A|V max=1..20 value=0.. lab=0 lit=case|dial|needle|plus|minus" — a PART (PARTS.md): a
// school moving-coil ammeter (kind=A) or voltmeter (kind=V), 10 × 8.5 cm, its origin the surface point under its
// middle. A slate-grey case on four rubber feet, its front sloped up toward you, a window in the slope with a printed
// dial 0..max (major and minor ticks hanging from the scale arc, a mirror strip), a black needle with a red tip on a
// pivot, a glass with a glare, a zero-adjust screw under it; on the low front ledge the black − and red + terminal
// posts, anchors minus and plus (the caps' tops). The needle follows value, eased like a damped coil (past max it
// stops on the pin). set({ value, max, kind }). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const PROF = [[-40, 3], [45, 3], [45, 17], [32, 17], [32, 22], [-26, 66], [-40, 66]], XW = 50, TY = 38.5, TXP = 30;
  const A = [-26, 66], D = [58 / 72.8, -44 / 72.8], N = [44 / 72.8, 58 / 72.8], ARC = { u: 40, v: 42, r: 30, half: 48 };
  const RED = ISO.tint("#e0574a", ["#9a2a20", "#b0352a", "#c44436", "#d24f40"], "#4a120c");
  // a point on the slope: u across (mm from its left end), v down the slope (mm from the window's top), lifted off it
  const onSlope = (u, v, lift = 0.25) => [-40 + u, A[0] + D[0] * (8 + v) + N[0] * lift, A[1] + D[1] * (8 + v) + N[1] * lift];
  const tickAt = (deg, r) => onSlope(ARC.u + r * Math.sin((deg * Math.PI) / 180), ARC.v - r * Math.cos((deg * Math.PI) / 180));
  const niceStep = (max) => [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10].find((s) => max / s <= 6.01) || 5;
  const fmt = (x) => String(+x.toFixed(2));

  function caseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -XW, y: -40, w: 2 * XW, d: 85, r: 3 }, 0, 4, P)}"/>`];
    for (const [x, y] of [[-44, -35], [44, -35], [-44, 40], [44, 40]]) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 3.4, 0, 3, P, 16), { tone: "lo" })));
    out.push(`<g data-name="case">${ISO.prismX(P, PROF, -XW, XW, ["#30353b", "#7c838c"], "#555b63", "#15181b")}`);
    // the end panel's two screws, the seam where the front ledge meets the slope
    out.push(K.dotsSvg([[XW + 0.1, -30, 10], [XW + 0.1, -32, 56]].map((p) => K.iso(p, P)), { size: 0.7, tone: "hi" }));
    out.push(L(K.segment([-XW, 32, 22], [XW, 32, 22], P), { tone: "faint" }), "</g>");
    return out.join("");
  }
  // the dial card in its window: scale arc, ticks hanging from it, numbers, the unit, the mirror strip
  function dialSvg(P, kind, max) {
    const at = (u, v, l) => K.iso(onSlope(u, v, l), P), out = [];
    out.push(`<path d="${K.pathOf([at(0, 0, 0.1), at(80, 0, 0.1), at(80, 50, 0.1), at(0, 50, 0.1)], true)}" fill="#f7f3e6" stroke="#2a2e33" stroke-width="1.1"/>`);
    const arc = []; for (let d = -ARC.half; d <= ARC.half + 1e-6; d += 3) arc.push(K.iso(tickAt(d, ARC.r), P));
    const step = niceStep(max), minor = [], major = [], nums = [];
    const mstep = step / (String(step).startsWith("2.5") ? 5 : String(step).startsWith("2") ? 4 : 5);
    for (let i = 0, x = 0; x <= max + 1e-6; i++, x = i * mstep) {
      const deg = -ARC.half + (2 * ARC.half * x) / max, big = Math.abs(x / step - Math.round(x / step)) < 1e-6;
      (big ? major : minor).push(K.pathOf([K.iso(tickAt(deg, ARC.r), P), K.iso(tickAt(deg, ARC.r + (big ? 4.4 : 2.6)), P)]));
      if (big) nums.push([deg, x]);
    }
    out.push(L(K.pathOf(arc), { tone: "mid" }), L(minor.join(""), { tone: "mid", free: "end" }), L(major.join(""), { tone: "hi", free: "end" }));
    // the mirror strip under the scale (line up the needle with its own reflection to read it)
    const mir = []; for (let d = -ARC.half + 4; d <= ARC.half - 4 + 1e-6; d += 4) mir.push(K.iso(tickAt(d, ARC.r - 3.2), P));
    out.push(`<path d="${K.pathOf(mir)}" fill="none" stroke="#9aa3ad" stroke-width="${(G.scaleOf(P) * 1.6).toFixed(2)}" stroke-linecap="butt" opacity=".8"/>`);
    // printed words, drawn flat in the slope's plane
    const m = TECH.mat(P, onSlope(0, 0, 0.15), [1, 0, 0], [0, D[0], D[1]]);
    const txt = (u, v, s, size, w = 700, c = "#2a2e33", a = "middle") => `<text x="${u}" y="${v}" text-anchor="${a}" fill="${c}" style="font:${w} ${size}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;
    const words = nums.map(([deg, x]) => { const r = ARC.r + 8.6, u = ARC.u + r * Math.sin((deg * Math.PI) / 180), v = ARC.v - r * Math.cos((deg * Math.PI) / 180) + 1.8; return txt(u.toFixed(1), v.toFixed(1), fmt(x), 5); });
    words.push(txt(68, 44, kind, 10, 800), txt(5, 47, "DC · class 2.5", 3.2, 600, "#5a5f66", "start"));
    out.push(`<g transform="${m}">${words.join("")}</g>`);
    return { svg: out.join(""), m };
  }
  // the needle (drawn flat on the dial, turned by a transform) and the glass over the window
  function needleSvg(P, m) {
    const { u, v, r } = ARC;
    return `<g transform="${m}"><g data-part="turn"><path d="M${u} ${v + 7}L${u} ${v - r + 6}" stroke="#1b1d20" stroke-width="0.9" stroke-linecap="round"/><path d="M${u} ${v - r + 6}L${u} ${v - r - 3}" stroke="#c0392b" stroke-width="0.55" stroke-linecap="round"/><rect x="${u - 1.6}" y="${v + 4}" width="3.2" height="4" rx=".6" fill="#1b1d20"/></g>` +
      `<circle cx="${u}" cy="${v}" r="2.6" fill="#2a2e33"/><circle cx="${u - 0.6}" cy="${v - 0.6}" r="0.8" fill="#9aa3ad"/></g>`;
  }
  function glassSvg(P) {
    const at = (u, v) => K.iso(onSlope(u, v, 0.6), P);
    return `<path d="${K.pathOf([at(6, 46), at(18, 4)])}" stroke="#ffffff" stroke-width="${(G.scaleOf(P) * 3).toFixed(2)}" stroke-linecap="round" opacity=".45"/>` +
      `<path d="${K.pathOf([at(-1.5, -1.5), at(81.5, -1.5), at(81.5, 51.5), at(-1.5, 51.5)], true)}" fill="none" stroke="#202328" stroke-width="${(G.scaleOf(P) * 2.4).toFixed(2)}" stroke-linejoin="round"/>`;
  }
  function frontSvg(P) {
    const out = [];
    // the zero-adjust screw in the slope under the window
    const F = G.frameOf(onSlope(40, 57, 0), [0, N[0], N[1]], [1, 0, 0], [0, -D[0], -D[1]]);
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0, 1.2, 4.2, F, P), { tone: "mid" })), `<path d="${K.pathOf([G.pointOf(F, 1.25, 2.8, 0.5), G.pointOf(F, 1.25, 2.8, 0.5 + Math.PI)].map((p) => K.iso(p, P)))}" stroke="#0d0e10" stroke-width="${(G.scaleOf(P) * 0.7).toFixed(2)}"/>`);
    // the signs printed on the ledge beside each terminal
    out.push(LAB.faceText(P, [-TXP - 11, TY + 2, 17.05], [1, 0, 0], "−", 10, "#eef1f4", [0, -1, 0]), LAB.faceText(P, [TXP + 11, TY + 2, 17.05], [1, 0, 0], "+", 9, "#ff9a8a", [0, -1, 0]));
    return out.join("");
  }

  ISO.add({
    name: "dialmeter", title: "Ammeter / voltmeter (part)", compare: null,
    about: "A school ammeter (kind=A) or voltmeter (kind=V): sloped case, printed dial 0..max with ticks and a mirror strip, a needle that swings to value, red + and black − terminal posts on its front ledge. anchors: plus minus",
    line: "dialmeter cx cy k kind=A|V max=1..20 value=0.. lab=0 lit=case|dial|needle|plus|minus",
    demo: { line: "dialmeter 480 380 42 kind=A max=1 value=0", script: [{ set: {}, hold: 1 }, { set: { value: 0.5 }, hold: "settle" }, { set: { value: 0.8, lit: "needle" }, hold: "settle" }, { set: { kind: "V", max: 5, value: 3, lit: "plus" }, hold: "settle" }, { set: { value: 0, lit: "dial" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { kind: o.kind === "V" ? "V" : "A", max: ISO.clamp(ISO.num(o, "max", 1), 1, 20), value: Math.max(0, ISO.num(o, "value", 0)), lit: o.lit || "" };
      const minus = CIRC.post(Pm, [-TXP, TY, 17.04], { r: 4.6, h: 11, cap: ISO.T.plastic }), plus = CIRC.post(Pm, [TXP, TY, 17.04], { r: 4.6, h: 11, cap: RED });
      g.innerHTML = caseSvg(Pm) + `<g data-name="dial"></g><g data-name="needle"></g>${glassSvg(Pm)}${frontSvg(Pm)}<g data-name="minus">${minus.svg}</g><g data-name="plus">${plus.svg}</g><g data-part="words"></g>`;
      g.anchors = { minus: minus.top.map((v) => v / 10), plus: plus.top.map((v) => v / 10) };
      const el = { dial: g.querySelector('[data-name="dial"]'), needle: g.querySelector('[data-name="needle"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      let turn = null, light = null;
      const frac = (v) => ISO.clamp(v / st.max, -0.03, 1.04);   // the needle's pins just past 0 and max
      const s = { f: frac(st.value), vf: 0 };
      const dial = () => {
        const d = dialSvg(Pm, st.kind, st.max);
        el.dial.innerHTML = d.svg; el.needle.innerHTML = needleSvg(Pm, d.m);
        turn = el.needle.querySelector('[data-part="turn"]'); light = CIRC.lighter(g);
        w.rebuild(el.words, lab ? st.kind : "", () => (lab ? CIRC.word(P, [5, 3, 6], st.kind === "A" ? "ammeter" : "voltmeter") : ""));
      };
      const draw = () => { w.attr(turn, "transform", `rotate(${(-ARC.half + 2 * ARC.half * s.f).toFixed(2)} ${ARC.u} ${ARC.v})`); light(st.lit); };
      g.set = (p) => {
        let again = false;
        if (p.kind !== undefined && (p.kind === "A" || p.kind === "V") && p.kind !== st.kind) { st.kind = p.kind; again = true; }
        if (p.max !== undefined) { const m = ISO.clamp(+p.max, 1, 20); if (m !== st.max) { st.max = m; again = true; } }
        if (p.value !== undefined) st.value = Math.max(0, +p.value);
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) dial();
        draw();
      };
      // a damped moving coil: a quick swing that settles with almost no overshoot
      g.update = (dt) => {
        const to = frac(st.value);
        if (ISO.still()) { s.f = to; s.vf = 0; }
        else { const a = 140 * (to - s.f) - 20 * s.vf; s.vf += a * Math.min(dt, 0.05); s.f += s.vf * Math.min(dt, 0.05); }
        if (Math.abs(s.f - to) < 0.0005 && Math.abs(s.vf) < 0.002) { s.f = to; s.vf = 0; }
        draw();
        return s.f !== to;
      };
      g.readout = () => {
        const u = st.kind, name = u === "A" ? "ammeter" : "voltmeter";
        return st.value > st.max ? `${name} off the scale · more than ${fmt(st.max)} ${u}` : `${name} reads ${fmt(st.value)} ${u} · scale 0–${fmt(st.max)} ${u}`;
      };
      dial(); draw();
      return g;
    },
  });
})();
