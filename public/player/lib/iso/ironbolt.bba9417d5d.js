// "ironbolt cx cy k clips=0..8 lab=0 lit=bolt|head|tip|clips" — a PART (PARTS.md, batch 5): a soft-iron M10 × 100 bolt,
// the core of a school electromagnet, lying along x with its head toward −x. Origin: the middle of its axis (it lies in
// two woodsupports: at=<support>.cradle). A hex head 1.7 cm across the flats with its chamfered face and washer face, a
// plain 1 cm shank, a rolled thread over the last 2 cm and a chamfered tip. clips = how many steel paper clips cling to
// the tip while the coil wound on it (enamelwire at=<bolt>.coil) carries a current: up to four hang from the tip's
// end face and four more from the underside of the thread beside it (all about 3.7 cm down from the axis); set({ clips }) rises them up to it or drops them (eased).
// Anchors: head (the head's end), tip (the tip's end face), coil (the axis point where the winding's middle goes).
// World: 1 = 1 cm, built from the electromagnet scene's bolt.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 0.5, X0 = -5, X1 = 5, HEAD = 0.65, AF = 1.7, TH = 3, COIL = -0.85, CLIPS = 8;
  const IRON = ISO.tint("#c9ccd0", ["#7c8187", "#8f949a", "#a3a8ad", "#b6babe"], "#3c4046");
  const F = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  // where clip i hangs at full pull: row 1 from the tip's end face, row 2 from the thread's underside
  const LEN = 3.2;
  const pose = (i) => {
    const row = i < 4 ? 0 : 1, j = i % 4, a = 0.2 + j * 0.45, tilt = (j - 1.5) * 0.32 + (row ? (j - 1.5) * 0.12 : 0);
    const h = [-Math.sin(a), Math.cos(a), 0], Ld = [h[0] * Math.sin(tilt), h[1] * Math.sin(tilt), -Math.cos(tilt)], Ac = [h[0] * Math.cos(tilt), h[1] * Math.cos(tilt), Math.sin(tilt)];
    const top = row ? [X1 - 0.35 - j * 0.38, (j - 1.5) * 0.12, -R * 0.94] : [X1 + 0.02, (j - 1.5) * 0.22, -0.32 + Math.abs(j - 1.5) * 0.06];
    return { top, Ld, Ac, j };
  };
  const placed = (() => {
    const out = [];
    for (let i = 0; i < CLIPS; i++) {
      const p = pose(i);
      // the clip's own plane: u from its small end (0) to its big end (3.2), hung by the big end at top
      p.at = (q, drop) => [0, 1, 2].map((n) => p.top[n] + p.Ld[n] * (LEN - 0.045 - q[0]) + p.Ac[n] * q[1] - (n === 2 ? drop : 0));
      out.push(p);
    }
    return out;
  })();

  function boltSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: X0 - HEAD, y: -AF * 0.58, w: X1 - X0 + HEAD, d: AF * 1.16, r: 0.5 }, -AF * 0.58, AF * 0.58, P)}"/>`];
    // the head: a hex prism with its chamfered end and the washer face toward the shank
    const hex = Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3 + Math.PI / 6) * AF / Math.sqrt(3), Math.sin(i * Math.PI / 3 + Math.PI / 6) * AF / Math.sqrt(3)]);
    out.push(`<g data-name="head">${ISO.tinted(IRON, S(G.prismOf(F, hex, X0 - HEAD + 0.06, X0 - 0.03, P), { tone: "mid" }))}`);
    out.push(ISO.tinted(IRON, S(G.lathe([[X0 - HEAD, 0], [X0 - HEAD, AF * 0.42], [X0 - HEAD + 0.06, AF * 0.5]], F, P), { tone: "hi" })));
    out.push(ISO.tinted(IRON, S(G.disc(X0 - 0.03, X0, AF * 0.46, F, P), { tone: "lo" })), "</g>");
    // the shank, the thread and the chamfered tip, turned as one
    out.push(`<g data-name="bolt">${ISO.tinted(IRON, S(G.lathe([[X0, 0], [X0, R], [X1 - TH + 1, R], [X1 - TH + 1.05, R * 0.94], [X1 - 0.1, R * 0.94], [X1, R * 0.76], [X1, 0]], F, P), { tone: "mid" }))}`);
    // the rolled thread: a crest every 1.5 mm (M10 coarse pitch), each the visible half of a ring
    out.push(L(Array.from({ length: 12 }, (_, i) => G.arcOf(F, X1 - TH + 1.15 + i * 0.15, R * 0.94, P)).join(""), { tone: "lo" }), "</g>");
    out.push(`<g data-name="tip">${ISO.tinted(IRON, S(G.disc(X1, X1 + 0.005, R * 0.76, F, P), { tone: "hi" }))}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "ironbolt", title: "Iron bolt (part)", compare: null,
    about: "A soft-iron M10 × 100 bolt, the core of an electromagnet: hex head, plain shank, threaded tip, lying along x; clips = how many paper clips cling to its tip while the coil on it carries a current (0 = switched off, they drop). anchors: head tip coil",
    line: "ironbolt cx cy k clips=0..8 lab=0 lit=bolt|head|tip|clips",
    demo: { line: "ironbolt 500 190 40 clips=0", script: [{ set: {}, hold: 1 }, { set: { clips: 3, lit: "tip" }, hold: "settle" }, { set: { clips: 8, lit: "clips" }, hold: "settle" }, { set: { lit: "head" }, hold: 1 }, { set: { clips: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { n: Math.round(ISO.clamp(ISO.num(o, "clips", 0), 0, CLIPS)), lit: o.lit || "" };
      const s = { k: Array.from({ length: CLIPS }, (_, i) => (i < st.n ? 1 : 0)) };
      g.innerHTML = `${boltSvg(P)}<g data-name="clips"></g><g data-part="words"></g>`;
      g.anchors = { head: [X0 - HEAD, 0, 0], tip: [X1, 0, 0], coil: [COIL, 0, 0] };
      const el = { clips: g.querySelector('[data-name="clips"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const draw = () => {
        const q = s.k.map((v) => Math.round(v * 40) / 40);
        // a clip comes up from 4 cm below and fades in as it is pulled to the tip; the second row waits for the first
        w.rebuild(el.clips, q.join(), () => placed.map((p, i) => (q[i] > 0 ? B13.clip(P, (uv) => p.at(uv, (1 - ISO.ease(q[i])) * 4), { opacity: Math.min(1, q[i] * 1.6) }) : "")).join(""));
        w.rebuild(el.words, lab ? String(st.n) : "", () => (lab ? CIRC.word(P, [X0, 0, AF * 0.7], st.n ? `iron bolt, a magnet: ${st.n} clips` : "iron bolt") : ""));
        B13.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.clips !== undefined && p.clips !== "" && Number.isFinite(+p.clips)) st.n = Math.round(ISO.clamp(+p.clips, 0, CLIPS));
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        s.k = s.k.map((v, i) => { const want = i < st.n ? 1 : 0, nv = ISO.follow(v, want, dt, want ? 0.12 + i * 0.04 : 0.1, calm); if (nv !== want) moving = true; return nv; });
        draw();
        return moving;
      };
      g.readout = () => `soft-iron bolt M10 × 100 mm · ${st.n ? `magnetised by the coil: ${st.n} paper clip${st.n > 1 ? "s" : ""} cling to its tip` : "not magnetised: no clips held"}`;
      draw();
      return g;
    },
  });
})();
