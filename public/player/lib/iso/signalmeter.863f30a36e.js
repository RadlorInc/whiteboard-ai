// "signalmeter cx cy k sig=0..100 gain=0..10 strap=0|1 lab=0 lit=case|dial|needle|knob|ports|strap" — a PART
// (PARTS.md): the satellite signal finder of satdish.js (the meter on the pole), 10 × 4 × 7 cm, its origin the middle
// of its back (place it at= a steelpole's `strap`; it faces +y). A grey case with rubber corner bumpers, a window on
// its face with a printed 0–10 scale (red to green band, ticks hanging from the arc) and a needle, the GAIN knob with
// its knurled rim and pointer, a lock lamp, the buzzer's holes, and two F sockets on top: LNB (the cable from the
// dish, which also powers the meter) and REC (on to the receiver). strap=1 draws the Velcro strap's two runs back to
// a 6 cm pole behind it. The needle follows sig × gain / 5 (gain 5 = as is), eased like a damped coil and stopping on
// the pin at 10; the lamp lights over 7. set({ sig, gain }). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const X = 50, D = 40, Z = 35, ARC = { u: -14, v: 26, r: 23, half: 50 }, KN = { x: 28, z: 6, r: 9, h: 8 };
  const CASE = ISO.tint("#dfe2e6", ["#8c929a", "#9ca2a9", "#adb2b8", "#bdc1c6"], "#2f343a");
  const reading = (sig, gain) => ISO.clamp((sig * gain) / 5, 0, 100) / 10;
  const txt = (u, v, s, size, w = 700, c = "#2a2e33", a = "middle") => `<text x="${u}" y="${v}" text-anchor="${a}" fill="${c}" style="font:${w} ${size}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;

  // the strap's two runs from the case's back edges round to a 6 cm pole (its middle 3 cm behind the back)
  function strapSvg(P) {
    const out = [];
    for (const sx of [-1, 1]) {
      const a = [sx * (X - 6), 0], b = [sx * 31, -34];
      const V = [[a[0], a[1], -10], [b[0], b[1], -10], [b[0], b[1], 10], [a[0], a[1], 10], [a[0] + sx * 1.5, a[1] - 0.6, -10], [b[0] + sx * 1.5, b[1] - 0.6, -10], [b[0] + sx * 1.5, b[1] - 0.6, 10], [a[0] + sx * 1.5, a[1] - 0.6, 10]];
      out.push(ISO.tinted(ISO.T.rubber, ISO.poly(V, ISO.BOX_F, P, "lo")));
    }
    return out.join("");
  }
  function caseSvg(P) {
    const out = [ISO.tinted(CASE, S(K.slabOf({ x: -X, y: 0, w: 2 * X, d: D, r: 5 }, -Z, 2 * Z, P, 4, 1.2), { tone: "mid" }))];
    // the seam where the two shells meet, round the case's middle
    out.push(L(K.planOutline({ x: -X, y: 0, w: 2 * X, d: D, r: 5 }, 0, P, 4), { tone: "faint" }));
    // rubber bumpers on the four upright corners at the front
    for (const x of [-X + 3, X - 3]) for (const z of [-Z, Z - 9]) out.push(ISO.tinted(ISO.T.rubber, S(K.slabOf({ x: x - 3.4, y: D - 6.4, w: 6.8, d: 6.8, r: 3 }, z, 9, P, 4), { tone: "lo" })));
    return out.join("");
  }
  // the face: the window and its printed card, words, the lamp, the buzzer holes, two screws (flat on y = D)
  function faceSvg(P, m) {
    const out = [`<rect x="-42" y="-12" width="56" height="42" rx="2" fill="#2a2e33"/><rect x="-40.5" y="-10.5" width="53" height="39" rx="1.2" fill="#f7f3e6"/>`];
    const at = (deg, r) => [ARC.u + r * Math.sin((deg * Math.PI) / 180), ARC.v - r * Math.cos((deg * Math.PI) / 180)];
    const band = (d0, d1, c) => { const p = []; for (let d = d0; d <= d1 + 1e-6; d += 2) p.push(at(d, ARC.r + 1.2)); for (let d = d1; d >= d0 - 1e-6; d -= 2) p.push(at(d, ARC.r + 3)); return `<path d="M${p.map(([u, v]) => `${u.toFixed(2)} ${v.toFixed(2)}`).join("L")}Z" fill="${c}"/>`; };
    out.push(band(-ARC.half, -20, "#e0574a"), band(-20, 20, "#f0b94a"), band(20, ARC.half, "#5fae3a"));
    const arc = [], ticks = [];
    for (let d = -ARC.half; d <= ARC.half + 1e-6; d += 2) arc.push(at(d, ARC.r));
    for (let i = 0; i <= 20; i++) { const d = -ARC.half + (2 * ARC.half * i) / 20, [a, b] = [at(d, ARC.r), at(d, ARC.r - (i % 2 ? 2 : 3.6))]; ticks.push(`M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`); }
    out.push(`<path d="M${arc.map(([u, v]) => `${u.toFixed(2)} ${v.toFixed(2)}`).join("L")}" fill="none" stroke="#2a2e33" stroke-width=".6" data-free=""/><path d="${ticks.join("")}" stroke="#2a2e33" stroke-width=".5" data-free=""/>`);
    for (let n = 0; n <= 10; n += 2) { const [u, v] = at(-ARC.half + (2 * ARC.half * n) / 10, ARC.r - 6.4); out.push(txt(u.toFixed(1), (v + 1.2).toFixed(1), n, 3.4)); }
    out.push(txt(ARC.u, 19, "SIGNAL", 3.6, 800, "#5a5f66"));
    // the lamp's bezel and the words beside it, the buzzer's holes, the case's printed words, two screws
    out.push(`<circle cx="22" cy="-24" r="2.8" fill="#2a2e33"/>`, txt(22, -17, "LOCK", 3, 700, "#3a3f45"), txt(KN.x, 9, "GAIN", 3.4, 800, "#3a3f45"));
    out.push(txt(KN.x - 13, 0, "−", 4, 700, "#3a3f45"), txt(KN.x + 13, 0, "+", 4, 700, "#3a3f45"));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) out.push(`<circle cx="${(32 + c * 3.2).toFixed(1)}" cy="${(-27 + r * 3.2).toFixed(1)}" r=".9" fill="#3a3f45"/>`);
    out.push(txt(-14, -23, "SAT FINDER", 4.4, 800, "#2a2e33"), txt(-14, -18, "13–18 V from the receiver", 2.6, 600, "#5a5f66"));
    for (const u of [-46, 46]) out.push(`<circle cx="${u}" cy="0" r="1.4" fill="#9aa0a7" stroke="#3a3f45" stroke-width=".4"/>`);
    return `<g transform="${m}">${out.join("")}</g>`;
  }
  const needleSvg = () => `<g data-part="turn"><path d="M${ARC.u} ${ARC.v + 1}L${ARC.u} ${ARC.v - ARC.r + 0.5}" stroke="#1b1d20" stroke-width=".7" stroke-linecap="round"/><path d="M${ARC.u} ${ARC.v - ARC.r + 4}L${ARC.u} ${ARC.v - ARC.r + 0.5}" stroke="#c0392b" stroke-width=".7" stroke-linecap="round"/></g><circle cx="${ARC.u}" cy="${ARC.v}" r="2.2" fill="#2a2e33"/>`;
  // the knob: a short knurled cylinder standing out of the face, its top drawn flat with the pointer (turned)
  function knobSvg(P) {
    const F = G.frameOf([KN.x, D, KN.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    const knurl = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; knurl.push(K.pathOf([G.pointOf(F, 1.5, KN.r, a), G.pointOf(F, KN.h - 1, KN.r, a)].map((p) => K.iso(p, P)))); }
    return ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, KN.r + 1.5], [1.2, KN.r + 1.5], [1.4, KN.r], [KN.h - 0.6, KN.r], [KN.h, KN.r - 0.8]], F, P, { steps: 28 }), { tone: "mid", inner: `<path d="${knurl.filter((_, i) => i % 2 === 0).join("")}" stroke="#53585f" stroke-width=".5" fill="none"/>` }));
  }

  ISO.add({
    name: "signalmeter", title: "Satellite signal meter (part)", compare: null,
    about: "A satellite signal finder strapped to the dish's pole: a needle dial 0–10, a gain knob, a lock lamp and two F sockets (LNB from the dish, REC to the receiver); the needle follows the signal. anchors: lnb rec",
    line: "signalmeter cx cy k sig=0..100 gain=0..10 strap=0|1 lab=0 lit=case|dial|needle|knob|ports|strap",
    demo: { line: "signalmeter 480 300 30 sig=10 gain=5 lab=1", script: [{ set: {}, hold: 1 }, { set: { sig: 85, lit: "needle" }, hold: "settle" }, { set: { gain: 3, lit: "knob" }, hold: "settle" }, { set: { sig: 40, gain: 8, lit: "ports" }, hold: "settle" }, { set: { strap: 0, lit: "" }, hold: 1 }, { set: { strap: 1, sig: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { sig: B37.num(o, "sig", 0, 0, 100), gain: B37.num(o, "gain", 5, 0, 10), strap: o.strap === "0" ? 0 : 1, lit: o.lit || "" };
      const m = TECH.mat(Pm, [0, D + 0.15, 0], [1, 0, 0], [0, 0, -1]), mk = TECH.mat(Pm, [KN.x, D + KN.h + 0.05, KN.z], [1, 0, 0], [0, 0, -1]);
      const ports = [[-30, "lnb"], [30, "rec"]].map(([x, n]) => ({ n, foot: [x / 10, D / 20, Z / 10], tip: [x / 10, D / 20, Z / 10 + 1.1] }));
      g.innerHTML = `<g data-name="strap">${strapSvg(Pm)}</g><g data-name="case">${caseSvg(Pm)}</g><g data-name="dial">${faceSvg(Pm, m)}</g>` +
        `<g data-name="needle"><g transform="${m}">${needleSvg()}</g></g><g data-part="lamp"></g>` +
        `<g data-name="knob">${knobSvg(Pm)}<g transform="${mk}"><g data-part="ptr"><path d="M0 -1.5L0 -7.6" stroke="#f2f2f2" stroke-width="1.3" stroke-linecap="round"/></g></g></g>` +
        `<g data-name="ports">${ports.map((p) => B37.fport(P, p.foot, [0, 0, 1])).join("")}<g transform="${m}">${txt(-30, -30.2, "LNB", 3.6, 800, "#3a3f45")}${txt(30, -30.2, "REC", 3.6, 800, "#3a3f45")}</g></g><g data-part="words"></g>`;
      g.anchors = Object.fromEntries(ports.map((p) => [p.n, p.tip]));
      const q = (n) => g.querySelector(`[data-part="${n}"]`), el = { turn: q("turn"), ptr: q("ptr"), lamp: q("lamp"), words: q("words"), strap: g.querySelector('[data-name="strap"]') }, w = ISO.writer();
      const s = { f: reading(st.sig, st.gain), vf: 0, kn: st.gain };
      if (lab) el.words.innerHTML = ISO.word(K.iso([X / 10, D / 10, 2], P), "signal meter", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="10" x="');
      const draw = () => {
        w.attr(el.turn, "transform", `rotate(${(-ARC.half + (2 * ARC.half * s.f) / 10).toFixed(2)} ${ARC.u} ${ARC.v})`);
        w.attr(el.ptr, "transform", `rotate(${(-135 + 27 * s.kn).toFixed(1)})`);
        const on = s.f > 7;
        w.rebuild(el.lamp, String(on), () => `<g transform="${m}"><circle cx="22" cy="-24" r="1.9" fill="${on ? "#5fe05a" : "#4a5a4a"}"/>${on ? `<circle cx="22" cy="-24" r="4" fill="#5fe05a" opacity=".3"/>` : ""}</g>`);
        w.shown(el.strap, !!st.strap);
        B37.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.sig !== undefined) st.sig = B37.num(p, "sig", st.sig, 0, 100);
        if (p.gain !== undefined) st.gain = B37.num(p, "gain", st.gain, 0, 10);
        if (p.strap !== undefined) st.strap = String(p.strap) === "0" ? 0 : 1;
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // a damped moving coil (a quick swing, almost no overshoot); the knob turns at a hand's pace
      g.update = (dt) => {
        const to = reading(st.sig, st.gain), h = Math.min(dt, 0.05);
        if (ISO.still()) { s.f = to; s.vf = 0; s.kn = st.gain; }
        else { const a = 140 * (to - s.f) - 20 * s.vf; s.vf += a * h; s.f = ISO.clamp(s.f + s.vf * h, 0, 10.2); s.kn = ISO.follow(s.kn, st.gain, dt, 0.25, false); }
        if (Math.abs(s.f - to) < 0.005 && Math.abs(s.vf) < 0.02) { s.f = to; s.vf = 0; }
        if (Math.abs(s.kn - st.gain) < 0.01) s.kn = st.gain;
        draw();
        return s.f !== to || s.kn !== st.gain;
      };
      g.readout = () => { const r = reading(st.sig, st.gain); return `signal meter reads ${r.toFixed(1)} of 10 · signal ${Math.round(st.sig)} %, gain ${st.gain}${r > 7 ? " · lock lamp on" : ""}${r >= 10 ? " · needle on the stop: turn the gain down" : ""}`; };
      draw();
      return g;
    },
  });
})();
