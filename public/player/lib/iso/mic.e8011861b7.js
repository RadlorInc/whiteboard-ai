// "mic cx cy height open=0..1 talk=0|1 lab=1 lit=grille|capsule|diaphragm|coil|magnet|stand" — a dynamic microphone on
// a desk stand. A cast round base with a rubber ring under it, the pole, the swivel knuckle with its thumb screw and the
// arm out to the clip ring that holds the mic. The mic: a tapered steel body, the XLR plug under it with its cable
// over the base and off the desk, and the ball grille on top. open=1 unscrews the grille and lifts it, and the capsule
// shows cut through its middle: the thin dome diaphragm, the voice coil glued under it, hanging in the gap of the
// magnet (a neodymium disc with its pole piece, in a steel pot), on a rubber shock ring. talk=1: sound waves from a
// voice in front reach the diaphragm, it moves the coil in the magnet's field, and that makes the signal.
// set({ open, talk, lit }). 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const DESK = { x: -120, y: -100, w: 250, d: 230, r: 4 }, MY = 46, ZB = 16, ZK = 126;   // desk, mic axis y, base top, knuckle
  const Z_BODY = [100, 240], CAP = 240, LIFT = 76;                                         // body, capsule base, grille lift
  const zF = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const M = {
    steel: [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"], magnet: [["#3e434a", "#7d838b"], "#5d636a", "#1a1d20"],
    copper: [["#c98258", "#f7d9c4"], "#e2a985", "#6e3a1c"], film: [["#9db6c6", "#eef6fb"], "#d4e5ef", "#3f6178"],
    rubber: [["#2a2b2f", "#55575c"], "#3e3f44", "#121214"],
  };
  // a section face in the plane x = 0 through the mic's axis, given in (s = height, r from the axis)
  const sec = (P, pts, m) => ISO.prismX(P, pts.map(([s, r]) => [MY + r, s]), -1, 0, ...M[m]);
  const both = (P, pts, m) => sec(P, pts, m) + sec(P, pts.map(([s, r]) => [s, -r]), m);
  const rect = (s0, s1, r0, r1) => [[s0, r0], [s1, r0], [s1, r1], [s0, r1]];
  const C0 = CAP + 6;                                                       // capsule floor

  ISO.add({
    name: "mic", title: "Microphone on a stand", compare: "mic 480 270 400",
    about: "A dynamic microphone: lift the grille to see the capsule cut open, then talk: the sound moves a thin diaphragm, the coil under it moves in a magnet's field, and that makes the electrical signal.",
    line: "mic cx cy height open=0..1 talk=0|1 lab=1 lit=grille|capsule|diaphragm|coil|magnet|stand",
    demo: { line: "mic 480 270 400", script: [{ set: { open: 1 }, hold: "settle" }, { set: { talk: 1 }, hold: 3.2 }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 1.18;
      const { P, g } = ISO.frame([...K.boxCorners(DESK, -12, 0), [0, MY, CAP + 70 + LIFT], [0, MY + 150, CAP + 30]], cx, cy, W, H, { azimuth: 40, elevation: 18, pad: size * 0.04 }, parent);
      const S = T.S, out = [];
      // ── desk, base on its rubber ring, pole, knuckle with thumb screw, arm, clip ring
      out.push(`<path class="iso-halo" d="${K.haloOf(DESK, -12, 12, P)}"/>`, T.slab(P, DESK, -12, 12, "lo", ISO.T.wood, 6, 1));
      out.push(T.L(K.planOutline(K.insetPlan(DESK, 5), 0, P), { tone: "faint" }));
      const stand = [ISO.tinted(T.C.rubber, S(G.lathe([[0, 50], [0, 57], [3, 57], [3, 50]], zF(0, 0, 0), P), { tone: "lo" }))];
      stand.push(ISO.tinted(T.C.dark, S(G.lathe([[3, 0], [3, 60], [11, 60, 1], [ZB, 52, 1], [ZB, 10], [ZB + 4, 8], [ZB + 4, 0]], zF(0, 0, 0), P, { steps: 72 }), { tone: "mid", inner: `<path d="${G.arcOf(zF(0, 0, 0), 7, 60, P)}" fill="none" stroke="#5a5f66" stroke-width=".6"/>` })));
      stand.push(ISO.tinted(T.C.steel, S(K.cylinder(0, 0, 6, ZB + 4, ZK - 18 - ZB - 4, P, 24), { tone: "hi", inner: T.L(K.sideArc(0, 0, 6, 70, P, 16), { tone: "faint" }) })));
      stand.push(T.cyl(P, 0, 0, 8, ZK - 18, 8, "mid", T.C.dark, 24));
      const xF = G.frameAlong([0, 0, ZK], [1, 0, 0]);
      stand.push(ISO.tinted(T.C.dark, S(G.disc(-10, 10, 10, xF, P), { tone: "mid" })));
      stand.push(ISO.tinted(T.C.dark, S(G.disc(10, 13, 5, xF, P), { tone: "mid" }) + S(G.disc(13, 20, 8, xF, P), { tone: "hi" })));
      stand.push(T.box(P, [-6, 6], [9.6, MY - 23.6], [ZK - 6, ZK + 6], "mid", T.C.dark));
      out.push(`<g data-name="stand">${stand.join("")}</g>`);
      // ── the cable: out of the plug, down onto the base, over its rim, along the desk and off its right edge
      const k = K.cameraOf(P).k, cab = [[0, MY, 74], [0, MY, 50], [0, MY, 30], [0, MY + 2, ZB + 6], [0, 52, ZB + 3], [4, 60, 12], [10, 64, 1.2], [40, 72, 1.2], [90, 70, 1.2], [DESK.x + DESK.w, 66, 1.2]];
      const cd = K.pathOf(cab.map((p) => K.iso(p, P)));
      out.push(`<path d="${cd}" fill="none" stroke="#0d0e10" stroke-width="${(5.2 * k).toFixed(2)}" stroke-linecap="butt" stroke-linejoin="round"/><path d="${cd}" fill="none" stroke="#4a4f56" stroke-width="${(3.4 * k).toFixed(2)}" stroke-linecap="butt" stroke-linejoin="round"/>`);
      // ── the mic: XLR plug, tapered body with a seam, the clip ring round it, the threaded top the grille screws on
      const mF = zF(0, MY, 0), mic = [];
      mic.push(ISO.tinted(T.C.dark, S(G.lathe([[70, 0], [70, 7], [74, 9], [90, 9], [90, 0]], mF, P, { steps: 32 }), { tone: "mid" })));
      mic.push(ISO.tinted(T.C.steel, S(G.lathe([[90, 0], [90, 12], [Z_BODY[0], 16], [Z_BODY[1] - 6, 22, 1], [Z_BODY[1], 23], [Z_BODY[1], 0]], mF, P, { steps: 64 }), { tone: "hi", inner: `<path d="${G.arcOf(mF, 102, 16.2, P)}" fill="none" stroke="#8d9096" stroke-width=".6"/>` })));
      // the clip ring grips the body round its side (audit.mjs lists the plug, body and top ring as loose: it doesn't
      // count a ring gripping a taper as support)
      mic.push(ISO.tinted(T.C.dark, S(G.ringBand(ZK - 8, ZK + 8, 16.6, 24, mF, P), { tone: "mid" })));
      mic.push(ISO.tinted(T.C.steel, S(G.ringBand(Z_BODY[1], CAP + 6, 21, 23.5, mF, P), { tone: "mid" })));
      out.push(`<g data-name="mic">${mic.join("")}</g>`);
      // ── the capsule, cut through its middle: shock ring, steel pot (with the far half of its inside behind),
      // magnet disc and pole piece, top plate, then the moving voice coil and diaphragm
      const halfRing = (s, r) => Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 + (i / 24) * Math.PI; return [r * Math.cos(a), MY + r * Math.sin(a), s]; });
      const potIn = `<path d="${K.pathOf([...halfRing(C0 + 22, 18.5), ...halfRing(C0 + 4, 18.5).reverse()].map((p) => K.iso(p, P)), true)}" fill="#a2a5ab" stroke="#3c3f45" stroke-width=".5"/>`;
      const cap = [both(P, rect(C0 - 4, C0, 6, 20), "rubber"), potIn];
      cap.push(sec(P, [[C0, -20], [C0, 20], [C0 + 22, 20], [C0 + 22, 18.5], [C0 + 4, 18.5], [C0 + 4, -18.5], [C0 + 22, -18.5], [C0 + 22, -20]], "steel"));
      cap.push(`<g data-name="magnet">${sec(P, rect(C0 + 4, C0 + 13, -9, 9), "magnet")}${sec(P, rect(C0 + 13, C0 + 18, -8, 8), "steel")}${both(P, rect(C0 + 16, C0 + 20, 12, 18.5), "steel")}</g>`);
      const moving = `<g data-name="coil">${both(P, rect(C0 + 13, C0 + 25.6, 8.8, 11), "copper")}</g><g data-name="diaphragm">${sec(P, [...ISO.arc(C0 - 2.1, 0, 30.1, 0.52, -0.52, 18), ...ISO.arc(C0 - 2.1, 0, 29.3, -0.52, 0.52, 18)], "film")}${both(P, [[C0 + 22, 15], [C0 + 22, 18.5], [C0 + 24, 18.5], [C0 + 25, 15]], "film")}</g>`;
      out.push(`<g data-name="capsule">${cap.join("")}<g data-part="mov">${moving}</g></g>`);
      // ── the grille: collar, ball of mesh (latitude wires end on its outline), a band at its widest
      const gF = zF(0, MY, CAP);
      const gr = [ISO.tinted(T.C.dark, S(G.ringBand(0, 8, 21, 24, gF, P), { tone: "mid" }))];
      gr.push(ISO.tinted(T.C.alu, S(G.lathe([[8, 0], [8, 29], [22, 32, 1], [40, 30, 1], [56, 20, 1], [64, 0]], gF, P, { steps: 64 }), {
        tone: "hi", inner: `<path d="${[12, 16, 28, 34, 40, 46, 51].map((s) => { const r = s < 22 ? 29 + ((s - 8) / 14) * 3 : s < 40 ? 32 - ((s - 22) / 18) * 2 : 30 - ((s - 40) / 16) * 10; return G.arcOf(gF, s, r, P); }).join("")}" fill="none" stroke="#8a9098" stroke-width=".55"/>`,
      })));
      gr.push(ISO.tinted(T.C.steel, S(G.ringBand(21, 25, 31.6, 32.6, gF, P), { tone: "mid" })));
      out.push(`<g data-part="grille"><g data-name="grille">${gr.join("")}</g></g><g data-part="waves"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const st = { open: ISO.clamp(ISO.num(o, "open", 0), 0, 1), openT: 0, talk: o.talk === "1", amp: 0, ph: 0, wph: 0, lit: o.lit || "" };
      st.openT = st.open;
      const MOUTH = [0, MY + 150, CAP + 20], xP = G.frameAlong(MOUTH, [1, 0, 0]);
      const draw = () => {
        w.attr(el.grille, "transform", K.translateAlong(P, [0, 0, st.open * LIFT]));
        w.attr(el.mov, "transform", K.translateAlong(P, [0, 0, st.amp * Math.sin(st.ph) * 1.6]));
        const q = Math.floor((st.wph % 1) * 24), on = st.amp > 0.02;
        w.rebuild(el.waves, on ? `${q} ${st.amp.toFixed(1)}` : "", () => !on ? "" : [0, 1, 2].map((i) => {
          const f = (q / 24 + i / 3) % 1;
          return `<path d="${G.circleOf(xP, 0, 14 + f * 84, P)}" fill="none" stroke="#2f7fd6" stroke-width="${(1.8 - f).toFixed(2)}" opacity="${(st.amp * Math.sin(Math.PI * f) * 0.75).toFixed(2)}"/>`;
        }).join(""));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const open = st.open > 0.5;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : [
          ...(open ? [T.word(P, [0, MY - 19, C0 + 24], "diaphragm", { anchor: "end", dx: -10, dy: -6 }), T.word(P, [0, MY + 11, C0 + 16], "coil", { color: "#8f4a1c", anchor: "start", dx: 30, dy: -4 }),
            T.word(P, [0, MY + 9, C0 + 8], "magnet", { anchor: "start", dx: 34, dy: 10 }), T.word(P, [0, MY, CAP + 64 + LIFT], "grille", { dy: -10 })] : [T.word(P, [0, MY + 32, CAP + 22], "grille", { anchor: "start", dx: 10 })]),
          T.word(P, [0, MY - 24, ZK], "clip", { anchor: "end", dx: -10 }), T.word(P, [0, MY + 9, 80], "XLR plug", { anchor: "start", dx: 10 }),
          T.word(P, [0, 60, 0], "stand", { dy: 18 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.open !== undefined) st.openT = ISO.clamp(+p.open, 0, 1);
        if (p.talk !== undefined) st.talk = !!+p.talk;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // Speech is shown slowed (a voice is 100–3000 vibrations a second) and the diaphragm's travel drawn large.
      g.update = (dt) => {
        const calm = ISO.still();
        st.open = ISO.follow(st.open, st.openT, dt, 0.3, calm); if (Math.abs(st.open - st.openT) < 0.002) st.open = st.openT;
        st.amp = ISO.follow(st.amp, st.talk ? 1 : 0, dt, 0.35, calm); if (!st.talk && st.amp < 0.01) st.amp = 0;
        if (!calm) { st.ph += dt * Math.PI * 4 * (1 + 0.3 * Math.sin(st.wph * 9)); st.wph += dt * 0.6; }
        draw();
        return st.open !== st.openT || st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? `talking · the sound moves the diaphragm, the coil glued to it moves in the magnet's gap, and that makes a tiny voltage: about 2 millivolts, sent down the cable (motion shown slowed and enlarged)`
        : st.open > 0.5 ? "grille off · the capsule cut open: diaphragm on top, the voice coil under it hangs in the magnet's narrow gap" : "a dynamic microphone on a desk stand");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
