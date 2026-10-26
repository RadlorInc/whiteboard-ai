// "dynamicmic cx cy k open=0..1 talk=0|1 lab=0 lit=plug|body|grille|capsule|diaphragm|coil|magnet" — a PART (PARTS.md,
// batch 6): the dynamic vocal microphone of mic.js without its stand, upright, its origin the middle of its XLR plug's
// end face (where a cable's plug goes on: xlrcable). The male XLR plug with its latch slot, the tapered steel body
// with its seam, the threaded top ring, and the ball mesh grille with its band. open=1 unscrews the grille and lifts
// it 6 cm: the capsule shows cut through its middle: the thin dome diaphragm, the voice coil glued under it hanging in
// the gap of the magnet (a neodymium disc and its pole piece in a steel pot), on a rubber shock ring. talk=1: sound
// from a voice in front (+y) reaches the diaphragm, it moves the coil in the magnet's field, and that makes the signal
// (shown slowed and enlarged). 5 dia × 17 cm. set({ open, talk }). Built in mm (ISO.mm) from mic.js; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const PLUG = 16, TOP = 116, CAP = 118, C0 = 126, LIFT = 60, HEAD = CAP + 50;
  const zF = (z) => G.frameOf([0, 0, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const M = {
    steel: [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"], magnet: [["#3e434a", "#7d838b"], "#5d636a", "#1a1d20"],
    copper: [["#c98258", "#f7d9c4"], "#e2a985", "#6e3a1c"], film: [["#9db6c6", "#eef6fb"], "#d4e5ef", "#3f6178"],
    rubber: [["#2a2b2f", "#55575c"], "#3e3f44", "#121214"],
  };
  // a section face in the plane x = 0 through the axis, given in (s = height, r from the axis)
  const sec = (P, pts, m) => ISO.prismX(P, pts.map(([s, r]) => [r, s]), -1, 0, ...M[m]);
  const both = (P, pts, m) => sec(P, pts, m) + sec(P, pts.map(([s, r]) => [s, -r]), m);
  const rect = (s0, s1, r0, r1) => [[s0, r0], [s1, r0], [s1, r1], [s0, r1]];
  // the grille ball's radius at height s above CAP (follows its lathe profile)
  const gR = (s) => (s < 18 ? 23.5 + ((s - 8) / 10) * 2 : s < 30 ? 25.5 - ((s - 18) / 12) * 1 : 24.5 - ((s - 30) / 12) * 8.5);

  ISO.add({
    name: "dynamicmic", title: "Dynamic microphone (part)", compare: null,
    about: "A dynamic vocal microphone standing on its XLR plug: unscrew the grille to see the capsule cut open, then talk: the sound moves a thin diaphragm, the coil under it moves in a magnet's field, and that makes the signal. anchors: plug head",
    line: "dynamicmic cx cy k open=0..1 talk=0|1 lab=0 lit=plug|body|grille|capsule|diaphragm|coil|magnet",
    demo: { line: "dynamicmic 470 470 18 lab=1", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { talk: 1, lit: "diaphragm" }, hold: 3.2 }, { set: { lit: "coil" }, hold: 1.4 }, { set: { talk: 0, lit: "magnet" }, hold: "settle" }, { set: { open: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B35, S = T.S;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = ISO.mm(Pc), lab = o.lab === "1", out = [];
      // ── the plug: a nickel shell with a groove and the latch slot; the body: tapered steel with its seam; the top ring
      const F0 = zF(0), plug = [ISO.tinted(T.C.steel, S(G.lathe([[0, 0], [0, 8.6], [1, 9.4], [PLUG, 9.4], [PLUG, 0]], F0, P, { steps: 40 }), { tone: "mid", inner: `<path d="${G.arcOf(F0, 5, 9.42, P)}" fill="none" stroke="#6f737a" stroke-width=".6"/>` }))];
      const ap = (ISO.PART_CAM.azimuth * Math.PI) / 180, slot = (da, z) => [9.45 * Math.cos(ap + da), 9.45 * Math.sin(ap + da), z];
      plug.push(T.quad(P, [slot(-0.16, 7), slot(0.16, 7), slot(0.16, 12.5), slot(-0.16, 12.5)], "#2a2d31", "#15171a", 0.4));
      out.push(`<g data-name="plug">${plug.join("")}</g>`);
      const body = ISO.tinted(T.C.steel, S(G.lathe([[PLUG, 0], [PLUG, 10.4], [PLUG + 10, 11.6, 1], [TOP - 8, 20.2, 1], [TOP, 21], [TOP, 0]], F0, P, { steps: 48 }), { tone: "hi", inner: `<path d="${G.arcOf(F0, PLUG + 12, 11.95, P)}" fill="none" stroke="#7d8187" stroke-width=".6"/><path d="${G.arcOf(F0, TOP - 2, 20.9, P)}" fill="none" stroke="#9a9ea4" stroke-width=".5"/>` }));
      out.push(`<g data-name="body">${body}${ISO.tinted(T.C.steel, S(G.ringBand(TOP, CAP + 6, 19.6, 21.8, F0, P), { tone: "mid" }))}</g>`);
      // ── the capsule, cut through its middle: shock ring, steel pot (the far half of its inside behind), magnet disc
      // and pole piece, top plate, then the moving voice coil and diaphragm
      const halfRing = (s, r) => Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 + (i / 24) * Math.PI; return [r * Math.cos(a), r * Math.sin(a), s]; });
      const potIn = `<path d="${K.pathOf([...halfRing(C0 + 22, 18.5), ...halfRing(C0 + 4, 18.5).reverse()].map((p) => K.iso(p, P)), true)}" fill="#a2a5ab" stroke="#3c3f45" stroke-width=".5"/>`;
      const capSvg = () => {
      const cap = [both(P, rect(C0 - 4, C0, 6, 19.4), "rubber"), potIn];
      cap.push(sec(P, [[C0, -20], [C0, 20], [C0 + 22, 20], [C0 + 22, 18.5], [C0 + 4, 18.5], [C0 + 4, -18.5], [C0 + 22, -18.5], [C0 + 22, -20]], "steel"));
      cap.push(`<g data-name="magnet">${sec(P, rect(C0 + 4, C0 + 13, -9, 9), "magnet")}${sec(P, rect(C0 + 13, C0 + 18, -8, 8), "steel")}${both(P, rect(C0 + 16, C0 + 20, 12, 18.5), "steel")}</g>`);
      const moving = `<g data-name="coil">${both(P, rect(C0 + 13, C0 + 25.6, 8.8, 11), "copper")}</g><g data-name="diaphragm">${sec(P, [...ISO.arc(C0 - 2.1, 0, 30.1, 0.52, -0.52, 18), ...ISO.arc(C0 - 2.1, 0, 29.3, -0.52, 0.52, 18)], "film")}${both(P, [[C0 + 22, 15], [C0 + 22, 18.5], [C0 + 24, 18.5], [C0 + 25, 15]], "film")}</g>`;
      return [cap.join(""), moving];
      };
      out.push(`<g data-name="capsule"><g data-part="capfix"></g><g data-part="mov"></g></g>`);
      // ── the grille: collar, ball of mesh (latitude wires end on its outline), a band at its widest
      const grilleSvg = () => {
      const gF = zF(CAP), gr = [ISO.tinted(T.C.dark, S(G.ringBand(0, 8, 21, 23.8, gF, P), { tone: "mid" }))];
      gr.push(ISO.tinted(T.C.alu, S(G.lathe([[8, 0], [8, 23.5], [18, 25.5, 1], [30, 24.5, 1], [42, 16, 1], [50, 0]], gF, P, { steps: 48 }), {
        tone: "hi", inner: `<path d="${[11, 14, 24, 28, 33, 37, 41].map((s) => G.arcOf(gF, s, gR(s), P)).join("")}" fill="none" stroke="#8a9098" stroke-width=".55"/>`,
      })));
      gr.push(ISO.tinted(T.C.steel, S(G.ringBand(17, 21, 25.3, 26.3, gF, P), { tone: "mid" })));
      return gr.join("");
      };
      out.push(`<g data-part="grille"><g data-name="grille"></g></g><g data-part="waves"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = LAB.parts(g), w = ISO.writer();
      const st = { open: B.num(o, "open", 0, 0, 1), talk: o.talk === "1", amp: 0, ph: 0, wph: 0, lit: o.lit || "" };
      st.openT = st.open;
      const fresh = () => { g.querySelectorAll("[data-name]").forEach((e) => (e._fresh = true)); B.light(w, g, st.lit); };
      // a build in three parts (ISO.later): plug and body now, the capsule and the grille each in their own slice
      ISO.later(() => { const [fix, mov] = capSvg(); el.capfix.innerHTML = fix; el.mov.innerHTML = mov; fresh(); });
      ISO.later(() => { el.grille.querySelector('[data-name="grille"]').innerHTML = grilleSvg(); fresh(); });
      const MOUTH = [0, 110, CAP + 20], xP = G.frameAlong(MOUTH, [1, 0, 0]);
      const draw = () => {
        w.attr(el.grille, "transform", K.translateAlong(P, [0, 0, st.open * LIFT]));
        w.attr(el.mov, "transform", K.translateAlong(P, [0, 0, st.amp * Math.sin(st.ph) * 1.6]));
        const q = Math.floor((st.wph % 1) * 24), on = st.amp > 0.02;
        w.rebuild(el.waves, on ? `${q} ${st.amp.toFixed(1)}` : "", () => !on ? "" : [0, 1, 2].map((i) => {
          const f = (q / 24 + i / 3) % 1;
          return `<path d="${G.circleOf(xP, 0, 10 + f * 64, P)}" fill="none" stroke="#2f7fd6" stroke-width="${(1.8 - f).toFixed(2)}" opacity="${(st.amp * Math.sin(Math.PI * f) * 0.75).toFixed(2)}"/>`;
        }).join(""));
        B.light(w, g, st.lit);
        const open = st.open > 0.5;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : [
          ...(open ? [T.word(P, [0, -19, C0 + 24], "diaphragm", { anchor: "end", dx: -10, dy: -6 }), T.word(P, [0, 11, C0 + 16], "coil", { color: "#8f4a1c", anchor: "start", dx: 30, dy: -4 }),
            T.word(P, [0, 9, C0 + 8], "magnet", { anchor: "start", dx: 34, dy: 10 }), T.word(P, [0, 0, HEAD + LIFT], "grille", { dy: -10 })] : [T.word(P, [0, 26, CAP + 22], "grille", { anchor: "start", dx: 10 })]),
          T.word(P, [0, 16, 70], "steel body", { anchor: "start", dx: 10 }), T.word(P, [0, 9.4, 8], "XLR plug", { anchor: "start", dx: 10 }),
        ].join(""));
      };
      g.anchors = { plug: [0, 0, 0], head: [0, 0, HEAD / 10] };
      g.set = (p) => {
        if (B.fin(p.open)) st.openT = ISO.clamp(+p.open, 0, 1);
        if (p.talk !== undefined) st.talk = String(p.talk) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // Speech is shown slowed (a voice is 100–3000 vibrations a second) and the diaphragm's travel drawn large.
      g.update = (dt) => {
        const calm = ISO.still();
        st.open = ISO.follow(st.open, st.openT, dt, 0.3, calm); if (Math.abs(st.open - st.openT) < 0.002) st.open = st.openT;
        st.amp = ISO.follow(st.amp, st.talk ? 1 : 0, dt, 0.35, calm); if (!st.talk && st.amp < 0.01) st.amp = 0;
        if (!calm) { st.ph = (st.ph + dt * Math.PI * 4 * (1 + 0.3 * Math.sin(st.wph * 9))) % (2 * Math.PI * 1000); st.wph = (st.wph + dt * 0.6) % 1000; }
        draw();
        return st.open !== st.openT || st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? "talking · the sound moves the diaphragm, the coil glued to it moves in the magnet's gap, and that makes a tiny voltage: about 2 millivolts, out through the XLR plug (motion shown slowed and enlarged)"
        : st.open > 0.5 ? "grille off · the capsule cut open: diaphragm on top, the voice coil under it hangs in the magnet's narrow gap" : "a dynamic vocal microphone · 5 cm grille, 17 cm long");
      draw();
      return g;
    },
  });
})();
