// "powersupply cx cy k kind=dc|hv v=0.. a=0.. on=0|1 lab=0 lit=case|display|knobs|switch|terminals" — a PART
// (PARTS.md, batch 5): a bench power supply 20 × 15 × 8 cm standing on the bench, origin the bench point under its
// middle, its front panel facing +y. A painted steel case on four rubber feet with vents on the top and the side, a
// dark front panel with two green LED displays (volts and amps), a VOLTS and a CURRENT knob (knurled, a white line
// pointing at its setting on a printed arc), a rocker switch and a power lamp; on the low front ledge a red +, a
// black − and a green earth post (anchors plus minus: the caps' tops, where a lead clips on). kind=dc: 0–30 V, 0–5 A;
// kind=hv: a He-Ne laser's high-voltage supply, 0–2 kV and 0–10 mA, a yellow HIGH VOLTAGE plate. v and a are what it
// gives out (V and A, or kV and mA for hv); the displays count to a new setting in about half a second and the knob
// turns with it; on=0 the displays go dark. set({ v, a, on }). Built in mm (ISO.mm); anchors in cm. wirefield.js's
// supply (a box, a meter window, two posts, a knob) made a real one.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const X = 100, YB = -75, YP = 45, YF = 75, ZT = 80, ZL = 24, FOOT = 4, PY = YP + 1.4;
  const PROF = [[YB, FOOT], [YF, FOOT], [YF, ZL], [YP, ZL], [YP, ZT], [YB, ZT]];
  const KINDS = { dc: { vmax: 30, amax: 5, vu: "V", au: "A", vd: 1, ad: 2 }, hv: { vmax: 2, amax: 10, vu: "kV", au: "mA", vd: 2, ad: 1 } };
  const KNOB = { v: [44, 62], a: [76, 62] }, KR = 8.5;
  const GREEN = ISO.tint("#7fd07f", ["#2f7a35", "#3a8a40", "#47994c", "#56a85a"], "#1b4a1f"), RED = ISO.tint("#e0574a", ["#9a2a20", "#b0352a", "#c44436", "#d24f40"], "#4a120c");
  const knobAng = (f) => ((-135 + 270 * ISO.clamp(f, 0, 1)) * Math.PI) / 180;   // 0 at the bottom left, clockwise
  const panelPt = (x, z, lift = 0) => [x, PY + lift, z];

  function caseSvg(P, kind) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -X, y: YB, w: 2 * X, d: YF - YB, r: 4 }, 0, ZT, P)}"/>`];
    for (const [x, y] of [[-X + 10, YB + 10], [X - 10, YB + 10], [-X + 10, YF - 10], [X - 10, YF - 10]]) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 6, 0, FOOT, P, 16), { tone: "lo" })));
    out.push(`<g data-name="case">${ISO.prismX(P, PROF, -X, X, ["#6d7f93", "#c9d4df"], "#b7c4d1", "#27384a")}`);
    // vents: slots across the top and down the +x side, the top's seam where the cover meets the chassis
    const slot = (pts) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="#33404d" fill-opacity=".8"/>`;
    const vents = [];
    for (let i = 0; i < 9; i++) { const x = -60 + i * 9; vents.push(slot([[x, -55, ZT + 0.05], [x + 4, -55, ZT + 0.05], [x + 4, 10, ZT + 0.05], [x, 10, ZT + 0.05]])); }
    for (let i = 0; i < 6; i++) { const z = 30 + i * 7; vents.push(slot([[X + 0.05, -60, z], [X + 0.05, 20, z], [X + 0.05, 20, z + 3], [X + 0.05, -60, z + 3]])); }
    out.push(vents.join(""), L(K.segment([X, YB, ZT - 12], [X, YP, ZT - 12], P) + K.segment([X, YP, ZT - 12], [X, YP, ZL], P), { tone: "faint" }));
    out.push(C.screw(P, [X, -66, 70]), C.screw(P, [X, 36, 70]), C.screw(P, [X, -66, 14]), "</g>");
    return out.join("");
  }
  const C = {
    // a screw head flush on the +x side face
    screw: (P, [x, y, z]) => ISO.tinted(ISO.T.steel, S(G.disc(0, 0.8, 2.2, G.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" })),
  };
  // the front panel: its plate, the two display windows, their names, the knobs' printed arcs, the HV plate
  function panelSvg(P, kind) {
    const out = [ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-X + 4, X - 4], [YP, PY], [ZL + 2, ZT - 3], "mid"))];
    const txt = (x, z, s, size, c = "#d9dde2", lift = 0.1) => LAB.faceText(P, panelPt(x, z, lift), [1, 0, 0], s, size, c);
    const win = (x0, x1, z0, z1) => `<path d="${K.pathOf([[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([x, z]) => K.iso(panelPt(x, z, 0.08), P)), true)}" fill="#101712" stroke="#6b7480" stroke-width="${(G.scaleOf(P) * 1.2).toFixed(2)}"/>`;
    out.push(`<g data-name="display">${win(-88, -40, 52, 72)}${win(-32, 16, 52, 72)}</g>`);
    out.push(txt(-64, 45, kind === "hv" ? "KILOVOLTS" : "VOLTS", 4.6), txt(-8, 45, kind === "hv" ? "MILLIAMPS" : "AMPS", 4.6));
    for (const [key, [x, z]] of Object.entries(KNOB)) {
      const arc = Array.from({ length: 31 }, (_, i) => K.iso(panelPt(x + (KR + 3) * Math.sin(knobAng(i / 30)), z + (KR + 3) * Math.cos(knobAng(i / 30)), 0.1), P));
      out.push(`<path d="${K.pathOf(arc)}" fill="none" stroke="#c9ced5" stroke-width="${(G.scaleOf(P) * 0.7).toFixed(2)}"/>`, txt(x, z - KR - 8.5, key === "v" ? "VOLTAGE" : "CURRENT", 3.6));
    }
    out.push(txt(-56, 33, "ON", 3.4));
    // the rating sticker on the lid (yellow HIGH VOLTAGE on the hv supply), read from the front
    const top = (x, y, s, size, c) => LAB.faceText(P, [x, y, ZT + 0.5], [1, 0, 0], s, size, c, [0, -1, 0]);
    out.push(ISO.tinted(kind === "hv" ? ISO.T.amber : ISO.T.paint, ISO.wbox(P, [28, 90], [14, 38], [ZT, ZT + 0.4], "hi")));
    out.push(kind === "hv" ? top(59, 24, "⚠ HIGH VOLTAGE", 5.4, "#3a2a06") + top(59, 33, "0–2 kV · 10 mA", 4.4, "#3a2a06") : top(59, 24, "DC POWER SUPPLY", 5, "#33506f") + top(59, 33, "0–30 V · 0–5 A", 4.4, "#33506f"));
    return out.join("");
  }
  // a knob: knurled skirt and cap along +y, a white line on the cap at the setting f (0..1)
  function knobSvg(P, [x, z], f) {
    const F = G.frameOf(panelPt(x, z), [0, 1, 0], [1, 0, 0], [0, 0, 1]), a = Math.PI / 2 - knobAng(f);
    return ISO.tinted(ISO.T.plastic, S(G.disc(0, 8, KR, F, P), { tone: "mid" }) + L(G.ribsOf(F, 0, 8, KR, 18, P, { seams: true }), { tone: "lo" }) + S(G.disc(8, 10, KR - 1.4, F, P), { tone: "hi" })) +
      `<path d="${K.pathOf([G.pointOf(F, 10.05, 1.5, a), G.pointOf(F, 10.05, KR - 2, a)].map((p) => K.iso(p, P)))}" stroke="#f4f6f8" stroke-width="${(G.scaleOf(P) * 1.3).toFixed(2)}" stroke-linecap="round"/>`;
  }
  // the rocker switch (red, lit when on) and the lamp beside it
  function switchSvg(P, on) {
    const x0 = -88, x1 = -76, z0 = 26, z1 = 40, zm = (z0 + z1) / 2, tip = on ? 1 : -1;
    const face = [[x0, PY, z0], [x1, PY, z0], [x1, PY + 3.5 + tip * 1.2, zm - tip * 3], [x0, PY + 3.5 + tip * 1.2, zm - tip * 3]];
    const face2 = [[x0, PY + 3.5 + tip * 1.2, zm - tip * 3], [x1, PY + 3.5 + tip * 1.2, zm - tip * 3], [x1, PY, z1], [x0, PY, z1]];
    const poly = (pts, c) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${c}" stroke="#3a0e0a" stroke-width="${(G.scaleOf(P) * 0.7).toFixed(2)}" stroke-linejoin="round"/>`;
    const lamp = K.iso(panelPt(-63, 28, 0.6), P);
    return ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x0 - 1.5, x1 + 1.5], [YP, PY + 0.6], [z0 - 1.5, z1 + 1.5], "lo")) + poly(on ? face2 : face, "#b8352a") + poly(on ? face : face2, on ? "#ef6a5a" : "#d24f40") +
      `<circle cx="${lamp[0].toFixed(1)}" cy="${lamp[1].toFixed(1)}" r="${(G.scaleOf(P) * 2.4).toFixed(2)}" fill="${on ? "#ff5a3c" : "#5a1c19"}" stroke="#2a0c0a" stroke-width="${(G.scaleOf(P) * 0.6).toFixed(2)}"/>`;
  }

  ISO.add({
    name: "powersupply", title: "Bench power supply (part)", compare: null,
    about: "A bench power supply 20 × 15 × 8 cm: green volt and amp displays, voltage and current knobs, a power switch and lamp, red + and black − output posts (kind=hv: a laser tube's high-voltage supply in kV and mA). anchors: plus minus",
    line: "powersupply cx cy k kind=dc|hv v=0.. a=0.. on=0|1 lab=0 lit=case|display|knobs|switch|terminals",
    demo: { line: "powersupply 480 400 22 v=0 a=0 on=0", script: [{ set: {}, hold: 1 }, { set: { on: 1, lit: "switch" }, hold: 1 }, { set: { v: 12, a: 0.5, lit: "display" }, hold: "settle" }, { set: { v: 6, a: 2.4, lit: "knobs" }, hold: "settle" }, { set: { kind: "hv", v: 1.5, a: 5, lit: "terminals" }, hold: "settle" }, { set: { on: 0, lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { kind: o.kind === "hv" ? "hv" : "dc", on: o.on !== "0", lit: o.lit || "" };
      const lim = () => KINDS[st.kind];
      st.vT = ISO.clamp(ISO.num(o, "v", 0), 0, lim().vmax); st.aT = ISO.clamp(ISO.num(o, "a", 0), 0, lim().amax); st.v = st.vT; st.a = st.aT;
      const w = ISO.writer();
      let el = {}, light = null;
      const build = () => {
        const posts = [["minus", -2, ISO.T.plastic], ["plus", 32, RED], ["earth", 62, GREEN]].map(([n, x, cap]) => ({ n, ...CIRC.post(Pm, [x, (YP + YF) / 2 - 2, ZL], { r: 5, h: 13, cap }) }));
        const signs = LAB.faceText(Pm, [-2, YF - 1.5, ZL + 0.05], [1, 0, 0], "−", 8, "#1d2024", [0, -1, 0]) + LAB.faceText(Pm, [32, YF - 1.5, ZL + 0.05], [1, 0, 0], "+", 7, "#b0281c", [0, -1, 0]) + LAB.faceText(Pm, [62, YF - 1.5, ZL + 0.05], [1, 0, 0], "⏚", 6.5, "#2c6a22", [0, -1, 0]);
        g.innerHTML = caseSvg(Pm, st.kind) + panelSvg(Pm, st.kind) + `<g data-name="display" data-part="read"></g><g data-name="knobs" data-part="knobs"></g><g data-name="switch" data-part="sw"></g>` +
          `<g data-name="terminals">${signs}${posts.map((p) => p.svg).join("")}</g><g data-part="words">${lab ? CIRC.word(P, [X / 10, 0, ZT / 10 + 0.4], st.kind === "hv" ? "high-voltage supply" : "power supply") : ""}</g>`;
        g.anchors = Object.fromEntries(posts.filter((p) => p.n !== "earth").map((p) => [p.n, p.top.map((v) => +(v / 10).toFixed(3))]));
        el = LAB.parts(g); light = CIRC.lighter(g);
        drawn = {};
      };
      let drawn = {};
      const draw = () => {
        const L0 = lim(), vq = st.v.toFixed(L0.vd), aq = st.a.toFixed(L0.ad);
        const key = `${st.on} ${vq} ${aq}`;
        if (drawn.read !== key) { drawn.read = key; el.read.innerHTML = st.on ? LAB.faceText(Pm, panelPt(-64, 56.5, 0.15), [1, 0, 0], `${vq} ${L0.vu}`, 13, "#7fe08a") + LAB.faceText(Pm, panelPt(-8, 56.5, 0.15), [1, 0, 0], `${aq} ${L0.au}`, 13, "#7fe08a") : ""; }
        const kk = `${(st.v / L0.vmax).toFixed(3)} ${(st.a / L0.amax).toFixed(3)}`;
        if (drawn.knobs !== kk) { drawn.knobs = kk; el.knobs.innerHTML = knobSvg(Pm, KNOB.v, st.v / L0.vmax) + knobSvg(Pm, KNOB.a, st.a / L0.amax); }
        if (drawn.sw !== st.on) { drawn.sw = st.on; el.sw.innerHTML = switchSvg(Pm, st.on); }
        light(st.lit);
      };
      g.set = (p) => {
        if (p.kind !== undefined && KINDS[p.kind] && p.kind !== st.kind) { st.kind = p.kind; build(); st.v = Math.min(st.v, lim().vmax); st.a = Math.min(st.a, lim().amax); st.vT = Math.min(st.vT, lim().vmax); st.aT = Math.min(st.aT, lim().amax); }
        if (p.v !== undefined && Number.isFinite(+p.v)) st.vT = ISO.clamp(+p.v, 0, lim().vmax);
        if (p.a !== undefined && Number.isFinite(+p.a)) st.aT = ISO.clamp(+p.a, 0, lim().amax);
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still(), L0 = lim();
        st.v = ISO.follow(st.v, st.vT, dt, 0.15, calm); if (Math.abs(st.v - st.vT) < L0.vmax * 1e-4) st.v = st.vT;
        st.a = ISO.follow(st.a, st.aT, dt, 0.15, calm); if (Math.abs(st.a - st.aT) < L0.amax * 1e-4) st.a = st.aT;
        draw();
        return st.v !== st.vT || st.a !== st.aT;
      };
      g.readout = () => {
        const L0 = lim(), name = st.kind === "hv" ? "high-voltage supply" : "bench power supply";
        if (!st.on) return `${name} · switched off · set to ${st.vT.toFixed(L0.vd)} ${L0.vu}, ${st.aT.toFixed(L0.ad)} ${L0.au}`;
        const W = st.v * st.a;   // kV × mA is W too
        return `${name} · on · ${st.v.toFixed(L0.vd)} ${L0.vu} across + and −, ${st.a.toFixed(L0.ad)} ${L0.au} out · ${W.toFixed(1)} W`;
      };
      build(); draw();
      return g;
    },
  });
})();
