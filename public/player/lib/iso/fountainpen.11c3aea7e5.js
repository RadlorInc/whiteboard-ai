// "fountainpen cx cy k aim=down|wall|flat cap=0..1 lab=0 lit=nib|grip|barrel|cap|clip" — a PART (batch 6, money): a
// fountain pen, 14 cm long and 1.3 cm across the cap, its origin the nib's point. A steel nib with its slit, breather
// hole and shoulders, a black grip section, a gold thread ring, a navy barrel with a gold end band and a domed end;
// the cap with its gold mouth band, a gold clip with a ball end. aim=down: writing on a surface below (the pen
// stands up from the point); aim=wall: writing on the wall (−y); aim=flat: lying on a surface along x, point to +x
// (it rests on the cap and barrel). cap 0 → 1 pulls the cap off the nib, swings it round and posts it on the
// barrel's end, the way one does before signing a cheque or a contract. set({ cap }). 1 = 1 cm.
// anchors: tip (the nib's point) top (the far end of the pen)
(() => {
  const K = window.K, G = window.G;
  const NAVY = ISO.tint("#3a4f7a", ["#18233a", "#1f2d48", "#273856", "#2f4365"], "#0b1120");
  const BLACK = ISO.tint("#3a3c40", ["#151618", "#1c1d20", "#232528", "#2c2e31"], "#08090a");
  const GOLD = ISO.T.brass, STEEL = ISO.T.steel;
  const CAPL = 6.6, CAPR = 0.66, END = 14;
  const DIR = { down: [0, 0, -1], wall: [0, -1, 0] };
  function frameFor(aim) {
    if (aim !== "flat") { const d = DIR[aim]; return G.frameAlong([0, 0, 0], [-d[0], -d[1], -d[2]]); }
    return G.frameOf([0, 0, CAPR], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  }
  const at = (F, s, u = 0, v = 0) => [0, 1, 2].map((i) => F.o[i] + F.a[i] * s + F.u[i] * u + F.v[i] * v);
  ISO.add({
    name: "fountainpen", title: "Fountain pen (part)", compare: null,
    about: "A fountain pen, 14 cm: steel nib with its slit and breather hole, grip, navy barrel with gold bands, a cap with a gold clip; cap pulls the cap off and posts it on the end, ready to sign. The nib's point is the origin. anchors: tip top",
    line: "fountainpen cx cy k aim=down|wall|flat cap=0..1 lab=0 lit=nib|grip|barrel|cap|clip",
    demo: { line: "fountainpen 470 440 22 aim=down lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "cap" }, hold: 1.2 }, { set: { cap: 1, lit: "" }, hold: 3.4 }, { set: { lit: "nib" }, hold: 1.4 }, { set: { lit: "clip" }, hold: 1.2 }, { set: { cap: 0, lit: "barrel" }, hold: 3.4 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const B = window.B42, S = (p, s) => K.solidSvg(p, s);
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = DIR[o.aim] || o.aim === "flat" ? o.aim : "down", F = frameFor(aim), view = G.viewOf(P);
      const st = { cap: B.val(o, "cap", 0, 0, 1) }; st.want = st.cap;
      const cs = G.dot3(F.v, view) >= 0 ? 1 : -1;          // the clip and the nib's top on the side that faces us
      // the pen's pieces, sorted far to near along its axis
      const pieces = [];
      const add = (s, name, svg) => pieces.push({ s, name, svg });
      // the nib's slit, hole and shoulders on the side that faces us most
      const du = G.dot3(F.u, view), dv = G.dot3(F.v, view), dn = Math.hypot(du, dv) || 1, fu = du / dn, fv = dv / dn;
      const on = (s, r, t = 0) => K.iso(at(F, s, fu * r - fv * t, fv * r + fu * t), P);
      const slit = [on(0.06, 0.04), on(1.15, 0.27)];
      add(1, "nib", ISO.tinted(STEEL, S(G.solidOf([[0, 0.03], [0.5, 0.16, 1], [1.7, 0.34, 1], [2.3, 0.38]], F, P, { steps: 18 }), { tone: "hi" })) +
        `<path d="${K.pathOf(slit)}" stroke="#2a2c30" stroke-width="0.6" fill="none"/>` + K.dotsSvg([on(1.25, 0.3)], { size: Math.max(0.5, 0.09 * G.scaleOf(P)) }) +
        `<path d="${K.pathOf([on(1.75, 0.25, -0.22), on(1.55, 0.33), on(1.75, 0.25, 0.22)])}" stroke="#6d7178" stroke-width="0.45" fill="none"/>`);
      add(3.3, "grip", ISO.tinted(BLACK, S(G.solidOf([[2.0, 0.36], [2.3, 0.42, 1], [3.6, 0.44, 1], [4.4, 0.5]], F, P, { steps: 20 }), { tone: "mid" })));
      add(4.6, "barrel", ISO.tinted(GOLD, S(G.solidOf([[4.4, 0.55], [4.8, 0.55]], F, P, { steps: 20 }), { tone: "hi" })));
      add(8.6, "barrel", ISO.tinted(NAVY, S(G.solidOf([[4.8, 0.6], [5.2, 0.62, 1], [12.4, 0.6]], F, P, { steps: 22 }), { tone: "mid" })));
      add(12.6, "barrel", ISO.tinted(GOLD, S(G.solidOf([[12.4, 0.6], [12.8, 0.6]], F, P, { steps: 20 }), { tone: "hi" })));
      add(13.4, "barrel", ISO.tinted(NAVY, S(G.solidOf([[12.8, 0.58], [13.6, 0.5, 1], [END, 0]], F, P, { steps: 20 }), { tone: "mid" })));
      const depth = (s) => K.depthOf(at(F, s), P);
      pieces.sort((a, b) => depth(a.s) - depth(b.s));
      const pen = pieces.map((p) => `<g data-name="${p.name}">${p.svg}</g>`).join("");
      g.innerHTML = (aim === "flat" ? `<path class="iso-halo" d="${K.haloOf({ x: -END - 1, y: -1, w: END + 2, d: 2, r: 1 }, 0, 0.3, P)}"/>` : "") +
        `<g data-part="back"></g><g data-part="pen">${pen}</g><g data-part="front"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.anchors = { tip: [0, 0, 0], top: at(F, END) };
      // the cap in its own frame: origin its closed end, axis toward its mouth
      const capSvg = (o2, a2) => {
        const Fc = { o: o2, a: a2, u: G.cross3 ? G.cross3(F.v, a2) : F.u, v: F.v };
        const c = (s, v) => [0, 1, 2].map((i) => Fc.o[i] + Fc.a[i] * s + F.v[i] * v);
        const body = ISO.tinted(NAVY, S(G.solidOf([[0, 0.3], [0.25, 0.6, 1], [0.6, CAPR, 1], [CAPL - 0.55, CAPR]], Fc, P, { steps: 16 }), { tone: "mid" })) +
          ISO.tinted(GOLD, S(G.solidOf([[CAPL - 0.55, CAPR + 0.02], [CAPL, CAPR + 0.02]], Fc, P, { steps: 16 }), { tone: "hi" }));
        const side = [0, 1, 2].map((i) => Fc.u[i]);
        const box = (s0, s1, v0, v1, wd) => ISO.box((u, ww, y) => [0, 1, 2].map((i) => Fc.o[i] + Fc.a[i] * u + side[i] * ww + F.v[i] * cs * y), P, [s0, s1], [-wd, wd], [v0, v1], "hi");
        const clip = ISO.tinted(GOLD, box(0.15, 0.85, CAPR - 0.05, CAPR + 0.22, 0.16) + box(0.6, 4.6, CAPR + 0.06, CAPR + 0.16, 0.12) +
          K.dotsSvg([K.iso(c(4.6, cs * (CAPR + 0.14)), P)], { size: Math.max(0.6, 0.16 * G.scaleOf(P)) }));
        // the clip is on the side toward us, so it is drawn after the body
        return `<g data-name="cap">${body}<g data-name="clip">${clip}</g></g>`;
      };
      const capPose = (e) => {
        // A: slide off the nib; B: swing round beside the pen, turning end for end; C: slide onto the barrel's end
        const A = B.smooth(0, 0.3, e), Bq = B.smooth(0.3, 0.75, e), C = B.smooth(0.75, 1, e);
        const phi = Math.PI * Bq, a2 = [0, 1, 2].map((i) => F.a[i] * Math.cos(phi) + F.u[i] * Math.sin(phi));
        const s = -0.6 - 7 * A + 31.2 * Bq - 7.6 * C, side = 3.2 * Math.sin(Math.PI * Bq);
        return { A, Bq, C, o2: at(F, s, side), a2, behind: Bq > 0 && Bq < 1 && K.depthOf(at(F, s + 3.3 * Math.cos(phi), side + 3.3 * Math.sin(phi)), P) < depth(7) };
      };
      // the cap at rest and posted are built once; sliding along the axis is a flat move on the board
      const rest = capSvg(at(F, -0.6), F.a), posted = capSvg(at(F, 16), F.a.map((x) => -x));
      const o0 = K.iso(at(F, 0), P), o1 = K.iso(at(F, 1), P), along = [o1[0] - o0[0], o1[1] - o0[1]];
      const shift = (d) => `translate(${(along[0] * d).toFixed(2)} ${(along[1] * d).toFixed(2)})`;
      let lit = o.lit || "";
      const draw = () => {
        const { A, Bq, C, o2, a2, behind } = capPose(st.cap);
        const [key, svg, tr] = Bq <= 0 ? ["rest", () => rest, shift(-7 * A)] : Bq >= 1 ? ["posted", () => posted, shift(7.6 * (1 - C))] : [Bq.toFixed(3), () => capSvg(o2, a2), ""];
        const on = behind ? el.back : el.front, off = behind ? el.front : el.back;
        w.rebuild(off, "-", () => "");
        w.rebuild(on, key, svg);
        w.attr(on, "transform", tr);
        if (lab) w.rebuild(el.words, "1", () => { const p = K.iso(at(F, 8), P); return ISO.word([p[0] + 22, p[1]], "fountain pen", "#556", { size: 13, anchor: "start" }); });
        B.light(w, g, lit);
      };
      g.set = (p) => { st.want = B.pick(p, "cap", st.want, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const was = st.cap;
        st.cap = ISO.still() || Math.abs(st.want - st.cap) < 0.003 ? st.want : st.cap + Math.sign(st.want - st.cap) * Math.min(Math.abs(st.want - st.cap), dt * 0.55);
        if (st.cap !== was) draw();
        return st.cap !== st.want;
      };
      g.readout = () => `fountain pen · 14 cm · ${st.want >= 1 ? "cap posted on the end: ready to sign" : st.want <= 0 ? "capped" : "taking the cap off"}`;
      draw();
      return g;
    },
  });
})();
