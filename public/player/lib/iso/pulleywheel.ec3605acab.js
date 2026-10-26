// "pulleywheel cx cy k kind=fixed|movable pull=0..100 rope=0..60 lab=0 lit=wheel|block|axle|rope" — a PART (PARTS.md,
// batch 5): the pulley of pulley.js, a 5 cm brass wheel with six spokes and a groove between two flanges, turning on
// a steel axle in a block of two steel side plates joined by a bridge with an eye. kind=fixed: the block points up and
// hangs from its eye (origin = the eye's hanging point, on a hook or a clamp); kind=movable: the block points down,
// the load hooks on its eye and the wheel rides in a loop of rope (origin = the axle's centre). rope = how far the
// two strands run from the groove (cm; down for fixed, up to their fixed ends for movable; 0 = no rope).
// pull = cm of rope pulled at the free end, eased: a fixed wheel turns by pull ÷ r; a movable one rises pull ÷ 2
// (two strands share the load) and turns as it rolls up the fixed strand. World units: 1 = 1 cm.
// anchors: eye left right (the rope's tangent points on the groove, at the axle's height) hook (movable: the eye).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 2.5, RG = 2.06, RR = 2.1, HW = 0.67, FL = [0.45, 0.83], PY = [0.95, 1.17], EYE = 4.4, EYE_R = 0.32;
  const STRAP = ISO.tint("#dfe2e6", ["#8d9096", "#a2a5ab", "#b6b9be", "#c7c9cd"], "#3c3f45");

  // the block's side plate in xz (sign = +1: the strap rises above the axle, −1: hangs below it)
  const plate = (P, zc, sg, y0, y1) => ISO.prismY(P, [[-1.1, -0.85], [1.1, -0.85], [0.7, 3.9], [-0.7, 3.9]].map(([x, z]) => [x, zc + sg * z]), y0, y1, ["#8d9096", "#d3d5d9"], "#c7c9cd", "#3c3f45");
  function blockBack(P, zc, sg) { return plate(P, zc, sg, -PY[1], -PY[0]); }
  function blockFront(P, zc, sg) {
    const out = [ISO.tinted(STRAP, ISO.wbox(P, [-0.72, 0.72], [-PY[0], PY[0]], sg > 0 ? [zc + 3.3, zc + 3.9] : [zc - 3.9, zc - 3.3], "mid"))];
    out.push(plate(P, zc, sg, PY[0], PY[1]));
    // the eye: a steel ring standing in the xz plane on the bridge
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(-0.15, 0.15, EYE_R, 0.6, window.B25.Y([0, 0, zc + sg * EYE]), P), { tone: "hi" })));
    return out.join("");
  }
  // the axle: its stub through the far plate (seen past the wheel) and the hex nut on the near plate
  const axleFront = (P, zc) => { const F = window.B25.Y([0, 0, zc]); return ISO.tinted(ISO.T.steel, S(G.disc(PY[1], PY[1] + 0.18, 0.4, F, P, { steps: 6 }), { tone: "mid" }) + S(G.disc(PY[1] + 0.18, PY[1] + 0.34, 0.22, F, P), { tone: "hi" })); };
  // the wheel: far flange, the groove's floor (the disc between the flanges), hub; the near flange and the spokes on
  // the near face come after the rope
  function wheelBack(P, zc) {
    const F = window.B25.Y([0, 0, zc]);
    return ISO.tinted(ISO.T.brass, S(G.ringBand(-FL[1], -FL[0], RG - 0.12, R, F, P), { tone: "hi" }) + S(G.disc(-HW, HW, RG, F, P), { tone: "hi" }) + S(G.disc(HW, HW + 0.22, 0.58, F, P), { tone: "mid" }));
  }
  const wheelFront = (P, zc) => ISO.tinted(ISO.T.brass, S(G.ringBand(FL[0], FL[1], RG - 0.12, R, window.B25.Y([0, 0, zc]), P), { tone: "hi" }));
  const spokes = (P, zc, phase) => { const F = window.B25.Y([0, 0, zc]); return ISO.tinted(ISO.T.brass, L(G.spokesOf(F, HW, 0.62, RG - 0.12, 6, P, { phase }), { tone: "lo" }) + L(G.circleOf(F, HW, 0.62, P) + G.circleOf(F, HW, RG - 0.12, P), { tone: "lo" })); };

  ISO.add({
    name: "pulleywheel", title: "Pulley wheel in its block (part)", compare: null,
    about: "A 5 cm brass pulley wheel with spokes and a grooved rim on an axle in a steel block with an eye; fixed hangs from its eye and turns as rope is pulled, movable rides in the rope with the load on its eye and rises half as far. anchors: eye left right hook",
    line: "pulleywheel cx cy k kind=fixed|movable pull=0..100 rope=0..60 lab=0 lit=wheel|block|axle|rope",
    demo: { line: "pulleywheel 480 150 40 rope=4", script: [{ set: {}, hold: 1 }, { set: { pull: 12, lit: "wheel" }, hold: "settle" }, { set: { pull: 0, lit: "block" }, hold: "settle" }, { set: { lit: "axle" }, hold: 1 }] },
    make([cx = 480, cy = 150, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const mov = o.kind === "movable", sg = mov ? -1 : 1, zc = mov ? 0 : -(EYE + EYE_R), rope = ISO.clamp(ISO.num(o, "rope", 0), 0, 60);
      const st = { pull: ISO.clamp(ISO.num(o, "pull", 0), 0, 100) }, want = { pull: st.pull };
      let lit = o.lit || "";
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -PY[1], w: 2 * R, d: 2 * PY[1], r: 0.3 }, zc - R, 2 * R, P)}"/>`;
      g.innerHTML = `<g data-part="move">${halo}<g data-name="block">${blockBack(P, zc, sg)}</g><g data-name="wheel">${wheelBack(P, zc)}</g>` +
        `<g data-name="rope" data-part="rope"></g><g data-name="wheel">${wheelFront(P, zc)}<g data-part="spokes"></g></g><g data-name="block">${blockFront(P, zc, sg)}</g><g data-name="axle">${axleFront(P, zc)}</g>` +
        `<g data-part="words">${LAB.word(P, lab, [R + 0.6, 0, zc], mov ? "movable pulley" : "fixed pulley", "#556", { anchor: "start" })}</g></g>`;
      const el = LAB.parts(g), kS = G.scaleOf(P);
      g.anchors = { eye: [0, 0, mov ? -EYE - EYE_R : 0], left: [-RR, 0, zc], right: [RR, 0, zc], hook: [0, 0, zc + sg * (EYE - EYE_R)] };
      const draw = () => {
        const rise = mov ? st.pull / 2 : 0, phase = (mov ? rise : st.pull) / RR, q = phase.toFixed(3);
        w.attr(el.move, "transform", K.translateAlong(P, [0, 0, rise]));
        w.rebuild(el.spokes, q, () => spokes(P, zc, phase));
        // the rope over the groove (fixed) or under it (movable), its strands straight off the tangent points; a
        // movable wheel's strands shorten as it climbs, their tops staying where they are tied
        const len = mov ? Math.max(0, rope - rise) : rope;
        w.rebuild(el.rope, rope ? len.toFixed(2) : "", () => {
          if (!rope) return "";
          const arc = Array.from({ length: 17 }, (_, i) => { const a = Math.PI * (i / 16); return [-Math.cos(a) * RR, 0, zc + sg * Math.sin(a) * RR]; });
          const pts = [[-RR, 0, zc + -sg * len], ...arc, [RR, 0, zc + -sg * len]].map((p) => K.iso(p, P));
          const d = K.pathOf(pts);
          return `<path d="${d}" fill="none" stroke="#4a3d26" stroke-width="${Math.max(1, kS * 0.2).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#9c8558" stroke-width="${Math.max(0.5, kS * 0.12).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(kS * 0.16).toFixed(2)} ${(kS * 0.1).toFixed(2)}"/>`;
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.pull !== undefined && Number.isFinite(+p.pull)) want.pull = ISO.clamp(+p.pull, 0, 100);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.pull = ISO.follow(st.pull, want.pull, dt, 0.6, ISO.still());
        if (Math.abs(st.pull - want.pull) < 0.01) st.pull = want.pull;
        draw();
        return st.pull !== want.pull;
      };
      g.readout = () => {
        const turns = ((mov ? st.pull / 2 : st.pull) / (2 * Math.PI * RR)).toFixed(2);
        return mov ? `movable pulley · rope pulled ${st.pull.toFixed(0)} cm, the pulley and its load rise ${(st.pull / 2).toFixed(1)} cm (two strands share the load: half the force, twice the pull) · wheel turned ${turns} turns`
          : `fixed pulley 5 cm · rope pulled ${st.pull.toFixed(0)} cm, the load rises ${st.pull.toFixed(0)} cm (it changes the pull's direction, not its size) · wheel turned ${turns} turns`;
      };
      draw();
      return g;
    },
  });
})();
