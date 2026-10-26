// "barcodescanner cx cy k trigger=0..1 beam=0..1 lab=0 lit=scanner|trigger|cradle|cable|beam" — a PART (batch 6,
// money): a handheld barcode scanner standing in its counter cradle, 7 × 16 × 17 cm, its origin the counter point under
// the cradle's middle, the scan window toward the room (+y) and tipped down. A dark grip with a ribbed back, the head
// with its red scan window, the trigger under the head, a weighted cradle that holds the grip, and a coiled cable from
// the cradle's back along the counter to its plug. trigger pulls the trigger (0 rest, 1 squeezed); beam lights the red
// scan fan and the red line it throws (anchor beam = the middle of that line, where a product box's barcode goes).
// set({ trigger, beam }). World: 1 = 1 cm. anchors: window beam
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BODY = ISO.tint("#5a5e66", ["#2c2f34", "#363a40", "#41454b", "#4c5057"], "#15171a");
  const ACCENT = ISO.tint("#f2c94c", ["#b8901c", "#c89f2a", "#d8b03a", "#e6be44"], "#5a4508");
  const HEAD = [[-5.2, 12.4], [5.5, 12.0], [7.0, 14.6], [5.4, 16.6], [-3.5, 16.6], [-5.2, 15.5]];
  const GRIP = [[0.4, 2.2], [-0.4, 12.5], [-4.6, 12.5], [-3.2, 2.0]];
  const CUP = [[1.6, 1.2], [1.1, 5.2], [-4.4, 5.8], [-4.4, 1.2]];
  // the window: the front face of the head, its normal and its middle
  const WA = [5.5, 12.0], WB = [7.0, 14.6], WN = (() => { const d = [WB[0] - WA[0], WB[1] - WA[1]], l = Math.hypot(...d); return [d[1] / l, -d[0] / l]; })();
  const WC = [0, (WA[0] + WB[0]) / 2 + WN[0] * 0.02, (WA[1] + WB[1]) / 2 + WN[1] * 0.02], REACH = 13;
  const BEAM = [0, WC[1] + WN[0] * REACH, WC[2] + WN[1] * REACH];
  ISO.add({
    name: "barcodescanner", title: "Barcode scanner (part)", compare: null,
    about: "A handheld barcode scanner in its counter cradle, 7 × 16 × 17 cm: grip, head with a red scan window, trigger, coiled cable to a plug; trigger squeezes it and beam throws the red scan fan and line onto what is held in front. anchors: window beam",
    line: "barcodescanner cx cy k trigger=0..1 beam=0..1 lab=0 lit=scanner|trigger|cradle|cable|beam",
    demo: { line: "barcodescanner 440 400 18 trigger=0 beam=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { trigger: 1, lit: "trigger" }, hold: "settle" }, { set: { beam: 1, lit: "beam" }, hold: "settle" }, { set: { lit: "cable" }, hold: 1 }, { set: { trigger: 0, beam: 0, lit: "cradle" }, hold: "settle" }, { set: { lit: "scanner" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { trigger: B.num(o, "trigger", 0, 0, 1), beam: B.num(o, "beam", 0, 0, 1), lit: o.lit || "" };
      st.wT = st.trigger; st.wB = st.beam;
      const prism = (pts, x0, x1, tint) => ISO.tinted(tint, ISO.prismX(P, pts, x0, x1, ["var(--anatomy-shade-0)", "var(--anatomy-shade-3)"], "var(--anatomy-top)", "var(--anatomy-hi)"));
      // the coiled cable: a helix round the line from the cradle's back down to the counter, then straight to the plug
      const A = [0, -4.42, 3.4], Bc = [0.8, -11.5, 0.75], coil = [];
      for (let i = 0; i <= 220; i++) {
        const u = i / 220, c = [A[0] + (Bc[0] - A[0]) * u, A[1] + (Bc[1] - A[1]) * u, A[2] + (Bc[2] - A[2]) * u], a = u * Math.PI * 2 * 9, r = 0.7 * Math.min(1, u * 12, (1 - u) * 12);
        coil.push(K.iso([c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r * 0.9], P));
      }
      const kS = window.G.scaleOf(P);
      const cable = `<path d="${K.pathOf(coil)}${K.pathOf([K.iso(Bc, P), K.iso([1.2, -12.6, 0.45], P)])}" fill="none" stroke="#202226" stroke-width="${Math.max(0.8, kS * 0.22).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
        ISO.tinted(BODY, ISO.wbox(P, [0.4, 2.0], [-15.2, -12.6], [0, 0.9], "mid") + ISO.wbox(P, [0.7, 1.7], [-15.9, -15.2], [0.2, 0.7], "lo"));
      const base = ISO.tinted(BODY, S(K.slabOf({ x: -3.5, y: -5.5, w: 7, d: 9, r: 1.2 }, 0, 1.2, P, 6, 0.2), { tone: "mid" })) + ISO.tinted(ISO.T.rubber, S(K.slabOf({ x: -3.2, y: -5.2, w: 6.4, d: 8.4, r: 1 }, 0, 0.01, P, 6), { tone: "lo" }));
      const cup = prism(CUP, -2.4, 2.4, BODY);
      // the cup's near walls again over the grip: clipped to the screen below its rim
      const rim = [[-2.4, 1.1, 5.2], [2.4, 1.1, 5.2], [2.4, -4.4, 5.8]].map((p) => K.iso(p, P));
      const below = `M${rim[0][0].toFixed(1)} ${rim[0][1].toFixed(1)}L${rim[1][0].toFixed(1)} ${rim[1][1].toFixed(1)}L${rim[2][0].toFixed(1)} ${rim[2][1].toFixed(1)}L${(rim[2][0] + 400).toFixed(1)} ${(rim[2][1] + 9999).toFixed(1)}L${(rim[0][0] - 400).toFixed(1)} ${(rim[0][1] + 9999).toFixed(1)}Z`;
      const [cDefs, cOpen] = B.clip(below);
      // the grip with its ribs on the back edge, the head, a yellow band on the head's top, the window
      const ribs = L([4, 5.5, 7, 8.5, 10].map((z) => { const f = (z - 2) / 10.5, y = -3.2 + (-4.6 + 3.2) * f; return K.pathOf([K.iso([1.71, y + 0.05, z], P), K.iso([1.71, y + 1.1, z + 0.1], P)]); }).join(""), { tone: "lo", free: true });
      const grip = prism(GRIP, -1.7, 1.7, BODY) + ribs;
      const head = prism(HEAD, -3, 3, BODY) + ISO.tinted(ACCENT, ISO.wbox(P, [-3, 3], [-1.2, 1.2], [16.6, 16.75], "hi"));
      const win = (on) => {
        const pt = (x, s) => [x, WA[0] + (WB[0] - WA[0]) * s + WN[0] * 0.03, WA[1] + (WB[1] - WA[1]) * s + WN[1] * 0.03];
        return B.quad(P, [pt(-2.4, 0.15), pt(2.4, 0.15), pt(2.4, 0.85), pt(-2.4, 0.85)], on > 0.05 ? `rgb(${Math.round(120 + 135 * on)},40,40)` : "#4a1f22", "#15171a", 0.6);
      };
      const trig = (tr) => prism([[-0.3, 9.0], [1.6, 9.6], [2.0, 12.1], [-0.2, 12.1]].map(([y, z]) => [y - 0.8 * tr, z]), -0.8, 0.8, ISO.T.rubber);
      const beamSvg = (b) => {
        if (b < 0.02) return "";
        const ap = K.iso(WC, P), e0 = K.iso([-4.5, BEAM[1], BEAM[2]], P), e1 = K.iso([4.5, BEAM[1], BEAM[2]], P);
        return `<path d="M${ap[0].toFixed(1)} ${ap[1].toFixed(1)}L${e0[0].toFixed(1)} ${e0[1].toFixed(1)}L${e1[0].toFixed(1)} ${e1[1].toFixed(1)}Z" fill="#ff2a2a" opacity="${(0.18 * b).toFixed(3)}"/>` +
          `<path data-free="" d="M${e0[0].toFixed(1)} ${e0[1].toFixed(1)}L${e1[0].toFixed(1)} ${e1[1].toFixed(1)}" stroke="#ff2020" stroke-width="${Math.max(1, kS * 0.12).toFixed(2)}" stroke-linecap="round" opacity="${b.toFixed(3)}"/>`;
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -4, y: -16, w: 8, d: 24, r: 1 }, 0, 0.1, P)}"/><defs>${cDefs}</defs>` +
        `<g data-name="cable">${cable}</g><g data-name="cradle">${base}${cup}</g><g data-name="scanner">${grip}</g><g data-name="cradle">${cOpen}${cup}</g></g>` +
        `<g data-name="trigger" data-part="trig"></g><g data-name="scanner">${head}<g data-part="win"></g></g><g data-name="beam" data-part="beam"></g><g data-part="words"></g>`;
      g.anchors = { window: WC, beam: BEAM };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const tr = Math.round(st.trigger * 50) / 50, b = Math.round(st.beam * 50) / 50;
        w.rebuild(el.trig, String(tr), () => trig(tr));
        w.rebuild(el.win, String(b), () => win(b));
        w.rebuild(el.beam, String(b), () => beamSvg(b));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([3.5, -4, 18], P), "barcode scanner", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.trigger !== undefined) st.wT = B.num(p, "trigger", st.wT, 0, 1);
        if (p.beam !== undefined) st.wB = B.num(p, "beam", st.wB, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.trigger = ISO.follow(st.trigger, st.wT, dt, 0.08, calm); if (Math.abs(st.trigger - st.wT) < 0.01) st.trigger = st.wT;
        st.beam = ISO.follow(st.beam, st.wB, dt, 0.06, calm); if (Math.abs(st.beam - st.wB) < 0.01) st.beam = st.wB;
        draw();
        return st.trigger !== st.wT || st.beam !== st.wB;
      };
      g.readout = () => `barcode scanner · trigger ${st.wT > 0.5 ? "squeezed" : "at rest"} · beam ${st.wB > 0.05 ? "on" : "off"}`;
      draw();
      return g;
    },
  });
})();
