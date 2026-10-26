// "toothbrush cx cy width paste=0|1 lab=1 lit=…" — a manual toothbrush and a tube of fluoride paste on a worktop.
// The brush: a handle with a rubber grip band (ridged) and a thumb pad, the slim neck, the head, and 40 tufts of
// nylon bristles in four rows; the middle rows are blue "indicator" tufts and the tip tufts are longer and lean
// forward to reach the back teeth. The tube: crimped end, body, shoulder, nozzle and a ribbed flip cap.
// set({ paste: 1 }) squeezes a pea-sized blob (about 0.25 g, 8 mm across) onto the bristles.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  // World units: 1 = 1 cm. Brush 18.6 cm long; head 2.9 × 1.1 cm; bristles 1.0 cm (tip tufts 1.2).
  const TOP = { x: -1.5, y: -2.2, w: 21.6, d: 10, r: 0.8 };
  const ZA = 0.75, HEAD = [15.4, 18.2], HZ = [ZA - 0.3, ZA + 0.2];
  const X_AX = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const BRUSH = X_AX([0, 0, ZA]);
  const HANDLE = ISO.tint("#e8f1fb", ["#7fa8d6", "#93b7df", "#a8c6e7", "#bcd4ee"], "#244c78");
  const GRIP = ISO.tint("#c9e8d8", ["#3f8a63", "#4f9a72", "#62aa83", "#78ba96"], "#1d4a33");
  const BRISTLE = ISO.tint("#ffffff", ["#cfd3d8", "#dadde1", "#e4e6e9", "#eeeff1"], "#7a7f86");
  const INDIC = ISO.tint("#dcecfb", ["#6c9fd6", "#80addd", "#94bbe4", "#a8c9eb"], "#25507f");
  const PASTE = ISO.tint("#ffffff", ["#d9e7ef", "#e2edf3", "#ebf2f7", "#f3f8fa"], "#6b8fa3");
  const TUBE_F = X_AX([3.4, 6, 1.4]);

  function benchSvg(P) {
    return `<path class="iso-halo" d="${K.haloOf(TOP, -1.2, 1.2, P)}"/>` + ISO.tinted(ISO.T.wood, S(K.slabOf(TOP, -1.2, 1.2, P, 4, 0.4), { tone: "mid", inner: L(K.sideSeam(TOP, -0.6, P, 4), { tone: "faint" }) })) +
      L(K.planOutline(K.insetPlan(TOP, 1.2), 0, P), { tone: "faint" });
  }
  function brushSvg(P) {
    const out = [];
    // handle: plastic butt, rubber grip band with ridges, plastic body tapering to the neck
    out.push(ISO.tinted(HANDLE, S(G.solidOf([[0, 0.4], [0.4, 0.6, 1], [2.6, 0.72]], BRUSH, P), { tone: "hi" })));
    out.push(ISO.tinted(GRIP, S(G.solidOf([[2.6, 0.72], [4, 0.76, 1], [5.6, 0.72]], BRUSH, P), { tone: "hi", inner: L([3.0, 3.4, 3.8, 4.2, 4.6, 5.0].map((s) => G.arcOf(BRUSH, s, s < 4 ? 0.735 + (s - 2.6) * 0.018 : 0.76 - (s - 4) * 0.025, P, { trim: 0 })).join(""), { tone: "lo" }) })));
    out.push(ISO.tinted(HANDLE, S(G.solidOf([[5.6, 0.72], [8, 0.68, 1], [10.5, 0.55, 1], [12, 0.38]], BRUSH, P), { tone: "hi" })));
    // the thumb pad: a rubber oval set into the top of the handle
    const pad = Array.from({ length: 20 }, (_, k) => { const a = (k / 20) * 2 * Math.PI, s = 8.6 + 1.1 * Math.cos(a), ang = Math.PI / 2 + 0.55 * Math.sin(a); return K.iso(G.pointOf(BRUSH, s, 0.68 - (s - 8) * 0.05 + 0.01, ang), P); });
    out.push(ISO.tinted(GRIP, `<path d="${K.pathOf(pad, true)}" fill="var(--anatomy-shade-2)" stroke="var(--anatomy-lo)" stroke-width="0.7"/>`));
    // neck and the head block with its rounded tip
    out.push(ISO.tinted(HANDLE, S(G.solidOf([[12, 0.38], [13.6, 0.27, 1], [15.2, 0.27, 1], [15.5, 0.33]], BRUSH, P), { tone: "hi" }) +
      S(G.prismOf(X_AX([0, 0, ZA]), [[-0.55, -0.3], [0.55, -0.3], [0.55, 0.2], [-0.55, 0.2]], HEAD[0], HEAD[1], P), { tone: "hi" }) +
      S(K.cylinder(HEAD[1], 0, 0.55, HZ[0], HZ[1] - HZ[0], P, 28), { tone: "hi" })));
    return `<g data-name="handle">${out.join("")}</g>`;
  }
  // Tufts: 10 across the head in 4 rows, far to near; strands drawn as fine strokes splaying from each tuft's top.
  function tuftsSvg(P) {
    const list = [];
    for (let i = 0; i < 10; i++) for (const y of [-0.39, -0.13, 0.13, 0.39]) {
      const x = HEAD[0] + 0.25 + i * 0.29, tip = i >= 8, mid = Math.abs(y) < 0.2 && !tip;
      if (tip && Math.abs(y) > 0.3 && i === 9) continue;               // the rounded tip has room for two tufts in its last row
      const len = tip ? 1.2 : 1.0, lean = tip ? 0.22 : 0, base = [x, y, HZ[1]], dir = G.unit3([lean, 0, 1]);
      list.push({ base, dir, len, mid, k: K.depthOf(base, P) });
    }
    list.sort((a, b) => a.k - b.k);
    return `<g data-name="bristles">${list.map(({ base, dir, len, mid }) => {
      const F = G.frameAlong(base, dir), top = G.pointOf(F, len, 0, 0);
      const strands = [0, 1, 2, 3, 4].map((j) => { const a = j * 1.26; return K.pathOf([K.iso(G.pointOf(F, len * 0.55, 0.06, a), P), K.iso(G.pointOf(F, len + 0.04, 0.11, a + 0.3), P)]); }).join("");
      return ISO.tinted(mid ? INDIC : BRISTLE, S(G.disc(0, len, 0.11, F, P, { steps: 14 }), { tone: "hi" }) + `<path d="${strands}" stroke="var(--anatomy-lo)" stroke-width="0.5" fill="none"/>`) + (top ? "" : "");
    }).join("")}</g>`;
  }
  // The tube, lying in front of the brush: crimped end, body, shoulder, nozzle and cap.
  function tubeSvg(P) {
    const out = [];
    out.push(S(G.prismOf(X_AX([3.4, 6, 1.4]), [[-1.3, -0.12], [1.3, -0.12], [1.3, 0.12], [-1.3, 0.12]], -1.1, 0, P), { tone: "mid" }));
    out.push(S(G.solidOf([[0, 0.9], [1.2, 1.32, 1], [3, 1.38, 1], [4.2, 1.4, 1], [6.2, 1.4, 1], [7.4, 1.4, 1], [8.6, 1.4, 1], [9.6, 1.2, 1], [10.2, 0.6]], TUBE_F, P), { tone: "hi", inner: L(G.arcOf(TUBE_F, 3, 1.38, P, { trim: 0 }) + G.arcOf(TUBE_F, 7.4, 1.4, P, { trim: 0 }), { tone: "faint" }) }));
    out.push(S(G.disc(10.2, 10.7, 0.42, TUBE_F, P), { tone: "mid" }));
    out.push(ISO.tinted(ISO.T.red, S(G.disc(10.7, 12.1, 0.8, TUBE_F, P), { tone: "hi", inner: K.fadedSvg(G.ribsOf(TUBE_F, 10.75, 12.05, 0.8, 24, P, { fade: [0.08, 0.45], seams: true }), { tone: "lo" }) })));
    // the label band: a printed stripe round the body
    out.push(ISO.tinted(ISO.T.blue, L(G.arcOf(TUBE_F, 4.2, 1.4, P, { trim: 0 }) + G.arcOf(TUBE_F, 6.2, 1.4, P, { trim: 0 }), { tone: "mid" })));
    return `<g data-name="tube">${out.join("")}</g>`;
  }
  // The pea-sized blob, grown by k (0–1), resting on the middle of the bristles.
  const blobSvg = (P, k) => (k < 0.02 ? "" : `<g data-name="paste">${ISO.tinted(PASTE, S(G.sphereOf([16.8, 0, HZ[1] + 1.0 + 0.4 * k], 0.42 * k, P), { tone: "hi" }) +
    S(G.sphereOf([16.82, 0, HZ[1] + 1.0 + 0.72 * k], 0.2 * k, P), { tone: "hi" }))}</g>`);

  ISO.add({
    name: "toothbrush", title: "Toothbrush and paste", compare: "toothbrush 480 270 360",
    about: "A toothbrush (handle with rubber grip, neck, head with tufts of bristles) and a tube of fluoride paste: a pea-sized blob (about 0.25 g) is enough.",
    line: "toothbrush cx cy width paste=0|1 lab=1 lit=handle|bristles|tube|paste",
    demo: { line: "toothbrush 480 270 360", script: [{ set: { paste: 1 }, hold: "settle" }] },
    make([cx, cy, width = 360], o, t, parent) {
      const lab = o.lab !== "0", Wd = width * 2.5, Hd = width * 1.35;
      const { P, g } = ISO.frame([...K.boxCorners(TOP, -1.2, 0), [17, 0, 3.4]], cx, cy, Wd, Hd, { azimuth: 66, elevation: 30 }, parent);
      g.innerHTML = `<g>${benchSvg(P)}</g><g>${brushSvg(P)}</g><g>${tuftsSvg(P)}</g><g data-part="blob"></g><g>${tubeSvg(P)}</g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const st = { v: ISO.num(o, "paste", 0) ? 1 : 0, vT: 0, lit: o.lit || "" };
      st.vT = st.v;
      if (lab) {
        const word = (p, text, anchor = "middle", dy = 0) => ISO.word(K.iso(p, P), text, "#444", { anchor, size: 14, dy });
        el.words.innerHTML = word([3.5, -0.8, 0], "Rubber grip", "middle", 18) + word([13.6, -0.3, 0.4], "Neck", "middle", 22) + word([17, -0.6, 2.4], "Bristle tufts", "end", -6) +
          word([18.6, 0.4, 2.4], "Longer tip tufts", "start", -2) + word([8.5, 7.6, 0], "Toothpaste", "middle", 22) + word([8.6, -0.7, 1.3], "Thumb pad", "middle", -12);
      }
      let lastLit = null;
      const draw = () => {
        w.rebuild(el.blob, st.v.toFixed(2), () => blobSvg(P, st.v));
        if (st.lit !== lastLit || el.blob._fresh) {
          lastLit = st.lit;
          const all = [...g.querySelectorAll("[data-name]")];
          w.light(all, all.filter((p) => p.dataset.name === st.lit));
        }
      };
      g.set = (p) => { if (p.paste !== undefined) st.vT = +p.paste ? 1 : 0; if (p.lit !== undefined) st.lit = p.lit; };
      g.update = (dt) => {
        st.v = ISO.follow(st.v, st.vT, dt, 0.5, ISO.still());
        if (Math.abs(st.v - st.vT) < 0.004) st.v = st.vT;
        draw();
        return st.v !== st.vT;
      };
      g.readout = () => (st.v > 0.95 ? "a pea-sized blob, about 0.25 g, 8 mm across · fluoride paste (1350–1450 ppm for adults) · bristles at 45° to the gum line, small circles, 2 minutes twice a day · spit, don't rinse" :
        st.v > 0.05 ? "squeezing…" : "soft nylon bristles in 38 tufts · blue indicator tufts fade when the brush is worn (change it every 3 months)");
      draw();
      if (t) label(parent, cx, cy - Hd / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
