// "tuningfork cx cy k aim=down|up|flat ring=0..1 lab=0 lit=stem|prongs" — a PART (PARTS.md, batch 5): the 512 Hz
// tuning fork of resonance.js. A steel fork 15 cm long: a round stem 8 mm across with a ball end, the yoke, and two
// prongs 9.8 cm long, 5 mm wide and 7 mm deep with 8 mm between them, "512 Hz" and "C" stamped on a prong.
// Its origin is the stem's end (a tool's working point): aim=down hangs it prongs-down from a clamp (over a resonance
// tube), aim=up stands it on its stem (pressed on a bench or a sound box), aim=flat lays it on a surface along +x
// (then the origin is its middle on that surface). ring=1 strikes it: the prongs swing in and out against each other
// at 512 Hz, far too fast to see, so each shows as a faint blur at both ends of its swing, dying away over about ten
// seconds the way a struck fork does; ring=0 stops it (a hand on the prongs). set({ ring }).
// Anchors (cm): stem (the stem's end), tips (between the prong tips). Built in mm (ISO.mm).
(() => {
  const K = window.K, G = window.G, LEN = 150, S0 = 40, S1 = 52, PW = 5, PD = 3.5, GAP = 4, TAU = 2.5, MAXA = 4.5   // MAXA: the blur drawn bigger than a real swing (≈0.5 mm) so it reads;

  ISO.add({
    name: "tuningfork", title: "Tuning fork (part)", compare: null,
    about: "A 512 Hz steel tuning fork 15 cm long (stem, yoke, two prongs stamped 512 Hz); struck, its prongs vibrate as a blur that dies away over about ten seconds. anchors: stem tips",
    line: "tuningfork cx cy k aim=down|up|flat ring=0..1 lab=0 lit=stem|prongs",
    demo: { line: "tuningfork 480 100 22 aim=down lab=1", script: [{ set: {}, hold: 1 }, { set: { ring: 1, lit: "prongs" }, hold: 3 }, { set: { lit: "stem" }, hold: 2 }, { set: { ring: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const aim = ["up", "flat"].includes(o.aim) ? o.aim : "down";
      // the fork's frame: a along the stem toward the prongs, p across the prongs (the way they swing), q their depth
      const fr = aim === "up" ? { o: [0, 0, 0], a: [0, 0, 1], p: [1, 0, 0], q: [0, 1, 0] }
        : aim === "flat" ? { o: [-LEN / 2, 0, 4], a: [1, 0, 0], p: [0, 1, 0], q: [0, 0, 1] }
          : { o: [0, 0, 0], a: [0, 0, -1], p: [1, 0, 0], q: [0, 1, 0] };
      const at = (s, pp, qq) => fr.o.map((v, i) => v + fr.a[i] * s + fr.p[i] * pp + fr.q[i] * qq);
      const box = (s0, s1, p0, p1, tone = "mid", bend = 0) => ISO.box((u, w, y) => at(u, w + bend * ((u - s0) / (s1 - s0)) ** 2, y), Pm, [s0, s1], [p0, p1], [-PD, PD], tone);
      const st = { amp: ISO.clamp(ISO.num(o, "ring", 0), 0, 1), want: 0, clock: 0 };
      st.decay = st.amp > 0;
      let lit = o.lit || "";
      // the stem with its ball end (turned), and the yoke: a block whose prong-side end splits into the two prongs
      const stem = ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 0], [0, 2.4], [1.2, 4.6, 1], [3.6, 4.6, 1], [5, 3.6], [S0 - 2, 3.6], [S0, 4.4, 1], [S0 + 1, 4.4]], G.frameOf(fr.o, fr.a, fr.p, fr.q), Pm, { steps: 24 }), { tone: "hi" }));
      const R9 = GAP + PW, D = []; for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + (i / 16) * Math.PI; D.push([S1 - 3 + Math.cos(a) * (S1 - 3 - S0) * 0.999, Math.sin(a) * R9]); }
      D.push([S1, -R9], [S1, R9]);   // the yoke: rounded under the stem, square where the prongs leave it
      const yoke = ISO.tinted(ISO.T.steel, S(G.prismOf(G.frameOf(at(0, 0, -PD), fr.q, fr.a, fr.p), D, 0, 2 * PD, Pm), { tone: "mid" }));
      // each prong: at rest, or (ringing) a faint copy at each end of its swing, the outer side bent out by d mm at the tip
      const prong = (side, d) => ISO.tinted(ISO.T.steel, side < 0 ? box(S1, LEN, -GAP - PW, -GAP, "hi", -d) : box(S1, LEN, GAP, GAP + PW, "hi", d));
      const stamp = LAB.faceText(Pm, at(S1 + 50, GAP + PW / 2, PD + 0.05), fr.a, "512 Hz", 3, "#5d6168", fr.p) + LAB.faceText(Pm, at(S1 + 74, GAP + PW / 2, PD + 0.05), fr.a, "C", 3, "#5d6168", fr.p);
      // painter's order: the far prong first; down: prongs under the yoke and stem, up/flat: the stem first
      const depth = (side) => K.depthOf(at((S1 + LEN) / 2, side * (GAP + PW / 2), 0), Pm);
      const sides = depth(-1) < depth(1) ? [-1, 1] : [1, -1];
      const stemPart = `<g data-name="stem">${stem}${yoke}</g>`;
      const prongParts = sides.map((s) => `<g data-name="prongs" data-part="p${s < 0 ? "L" : "R"}"></g>`).join("");
      g.innerHTML = (aim === "down" ? "" : `<path class="iso-halo" d="${K.haloOf(aim === "flat" ? { x: -LEN / 2, y: -GAP - PW, w: LEN, d: 2 * (GAP + PW), r: 4 } : { x: -GAP - PW, y: -PD, w: 2 * (GAP + PW), d: 2 * PD, r: 2 }, 0, 0.1, Pm)}"/>`) +
        (aim === "down" ? prongParts + stemPart : stemPart + prongParts) + `<g data-part="words"></g>`;
      const tip = at(LEN, 0, 0);
      g.anchors = { stem: fr.o.map((v) => v / 10), tips: tip.map((v) => +(v / 10).toFixed(3)) };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.amp * 20) / 20;
        for (const s of [-1, 1]) w.rebuild(el[s < 0 ? "pL" : "pR"], String(q), () => (q > 0 ? `<g opacity="${(0.3 + 0.4 * q).toFixed(2)}">${prong(s, q * MAXA)}${prong(s, -q * MAXA)}</g>` : "") + prong(s, 0) + (s > 0 ? stamp : ""));
        if (lab) w.rebuild(el.words, q > 0 ? "on" : "off", () => LAB.word(Pm, lab, aim === "flat" ? at(LEN / 2, 0, 20) : at(LEN * 0.6, GAP + PW + 6, 0), q > 0 ? "512 Hz fork, ringing" : "512 Hz tuning fork", "#556", { anchor: aim === "flat" ? "middle" : "start" }));
        window.B26.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.ring !== undefined && Number.isFinite(+p.ring)) { const r = ISO.clamp(+p.ring, 0, 1); if (r > 0) { st.amp = Math.max(st.amp, r); st.decay = true; } else st.decay = false; st.hit = r; }
        if (p.lit !== undefined) lit = p.lit;
      };
      // a struck fork dies away exponentially (τ 2.5 s, gone in about ten); damped by a hand it stops in a blink
      g.update = (dt) => {
        if (ISO.still()) { draw(); return false; }   // a still frame keeps the fork as it is
        st.amp = st.decay ? st.amp * Math.exp(-dt / TAU) : st.amp * Math.exp(-dt / 0.08);
        if (st.amp < 0.02) st.amp = 0;
        draw();
        return st.amp > 0;
      };
      g.readout = () => `512 Hz tuning fork · ${st.amp > 0 ? `ringing (${Math.round(st.amp * 100)}% of its strike)` : "still"} · in air its note has λ = 343 ÷ 512 = 0.67 m`;
      draw();
      return g;
    },
  });
})();
