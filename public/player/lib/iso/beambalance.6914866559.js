// "beambalance cx cy k tilt=-20..20 lab=0 lit=base|pillar|beam|pans|pointer|scale" — a PART (PARTS.md, batch 5): a
// school two-pan beam balance standing on the bench, origin the bench point under the base's middle. A wooden base
// 22 × 5.2 cm on four feet with an arrest knob at the front, a brass pillar to a pivot block at 15 cm, a 19 cm brass
// beam resting on a steel knife edge, a brass pan (6.4 cm) hanging from each end on a three-wire stirrup, and a
// pointer from the pivot down over a small printed scale on the pillar. tilt (degrees, + = right/+x end down) eases
// the beam and the pans swing with it (each pan carries its own stirrup; anchors are placed once, at build).
// Reused from labscale.js (k=pan). Built in mm; anchors in cm. set({ tilt }). anchors: pivot left right
(() => {
  const K = window.K, G = window.G;
  const BASEP = { x: -110, y: -26, w: 220, d: 52, r: 5 }, BH = 12, ARM = 92, TOPZ = 150, DROP = 70, PR = 32, PY = 11;

  ISO.add({
    name: "beambalance", title: "Beam balance (part)", compare: null,
    about: "A two-pan beam balance: a brass beam on a knife edge on a pillar, a pan hanging from each end and a pointer over a scale; the beam tilts toward the heavier pan. anchors: pivot left right",
    line: "beambalance cx cy k tilt=-20..20 lab=0 lit=base|pillar|beam|pans|pointer|scale",
    demo: { line: "beambalance 480 420 20 tilt=0 lab=1", script: [{ set: { lit: "beam" }, hold: 1 }, { set: { tilt: 12, lit: "pans" }, hold: "settle" }, { set: { tilt: -8, lit: "pointer" }, hold: "settle" }, { set: { tilt: 0, lit: "scale" }, hold: "settle" }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const LAB = window.LAB, B18 = window.B18, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = ISO.mm(Pc), lab = o.lab === "1";
      const tiltOf = (v) => (Number.isFinite(+v) ? ISO.clamp(+v, -20, 20) : 0);
      const st = { a: tiltOf(ISO.num(o, "tilt", 0)), want: 0 };
      st.want = st.a;
      let lit = o.lit || "";
      // static: base with feet and arrest knob, pillar, pivot block and the knife edge's steel prism, the scale plate
      const feet = [[-98, -18], [98, -18], [-98, 18], [98, 18]].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P)).map(([x, y]) => ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 5, -3, 3, P, 16), { tone: "lo" }))).join("");
      const knob = ISO.tinted(ISO.T.brass, S(G.disc(26, 30, 2, LAB.Y([0, 0, 6]), P), { tone: "mid" }) + S(G.disc(30, 36, 6, LAB.Y([0, 0, 6]), P), { tone: "hi", inner: L(G.ribsOf(LAB.Y([0, 0, 6]), 30, 36, 6, 16, P, { seams: true }), { tone: "lo" }) }));
      const pillar = ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 12, BH, 6, P, 24), { tone: "mid" }) + S(K.cylinder(0, 0, 8, BH + 6, TOPZ - 30 - BH - 6, P, 24), { tone: "mid", crease: "none" })) +
        ISO.tinted(ISO.T.brass, ISO.wbox(P, [-10, 10], [-6, 6], [TOPZ - 30, TOPZ - 6], "mid")) +
        ISO.tinted(ISO.T.steel, ISO.prismX(P, [[-4, TOPZ - 6], [4, TOPZ - 6], [0, TOPZ - 2.5]], -3, 3, ["#8d9096", "#c7c9cd"], "#d9dadd", "#3c3f45"));
      // the scale: a white plate on a bracket in front of the pillar, ticks every 5° of the pointer, 0 in the middle
      const SZ = TOPZ - 66, RP = 66, scale = (() => {
        const out = [ISO.tinted(ISO.T.brass, ISO.wbox(P, [-3, 3], [8, PY - 0.6], [SZ - 4, SZ + 2], "mid")), ISO.tinted(ISO.tint("#fbfbf7", ["#d8d8d2", "#e2e2dc", "#ececE6", "#f4f4ef"], "#55534c"), ISO.wbox(P, [-18, 18], [PY - 0.6, PY], [SZ - 7, SZ + 3], "mid"))];
        const tk = [];
        for (let d = -15; d <= 15; d += 5) { const a = (d * Math.PI) / 180; tk.push(K.segment([Math.sin(a) * (RP - 2), PY + 0.02, TOPZ - Math.cos(a) * (RP - 2)], [Math.sin(a) * (RP + (d ? 1.5 : 3)), PY + 0.02, TOPZ - Math.cos(a) * (RP + (d ? 1.5 : 3))], P)); }
        out.push(`<path d="${tk.join("")}" stroke="#33404c" stroke-width="0.6"/>`);
        return out.join("");
      })();
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(BASEP, 0, BH, P)}"/>` + `<g data-name="base">${feet}${LAB.mat(P, BASEP, BH, "mid", ISO.T.wood)}${D([[-100, -16], [100, -16], [-100, 16], [100, 16]].map(([x, y]) => K.iso([x, y, BH], P)), { size: 0.5 })}${knob}</g>` +
        `<g data-name="pillar">${pillar}</g><g data-name="scale">${scale}</g><g data-part="pan0"></g><g data-part="beam"></g><g data-part="pan1"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const endOf = (a, s) => [s * ARM * Math.cos(a), 0, TOPZ - s * ARM * Math.sin(a)];
      const pa = (st.a * Math.PI) / 180;
      g.anchors = { pivot: [0, 0, TOPZ / 10], left: [endOf(pa, -1)[0] / 10, 0, (endOf(pa, -1)[2] - DROP + 0.5) / 10], right: [endOf(pa, 1)[0] / 10, 0, (endOf(pa, 1)[2] - DROP + 0.5) / 10] };
      const panSvg = (s, a) => {
        const e = endOf(a, s), pz = e[2] - DROP, rim = [0, 1, 2].map((i) => { const b = (i / 3) * Math.PI * 2 + 0.5; return [e[0] + Math.cos(b) * (PR - 2), Math.sin(b) * (PR - 2), pz + 5.6]; });
        const wires = `<path d="${rim.map((r) => K.pathOf([K.iso([e[0], 0, e[2] - 4], P), K.iso(r, P)])).join("")}" stroke="#55606b" stroke-width="0.8" fill="none"/>`;
        const dish = ISO.tinted(ISO.T.brass, S(G.solidOf([[0, PR - 8], [3, PR - 2, 1], [6, PR]], LAB.Z([e[0], 0, pz]), P), { tone: "hi" }));
        const hook = ISO.tinted(ISO.T.steel, S(G.sphereOf([e[0], 0, e[2] - 4], 2.2, P), { tone: "mid" }));
        return { k: K.depthOf([e[0], 0, pz], P), svg: `<g data-name="pans">${dish}${wires}${hook}</g>` };
      };
      // the pans hang plumb, so a tilt only moves them: built once at level, then translated with their beam end
      const order = [-1, 1].sort((p, q) => panSvg(p, 0).k - panSvg(q, 0).k);
      order.forEach((s, i) => (el["pan" + i].innerHTML = panSvg(s, 0).svg));
      const draw = () => {
        const aq = Math.round(st.a * 8) / 8;   // redraw in 1/8° steps
        w.rebuild(el.beam, String(aq), () => {
          const a = (aq * Math.PI) / 180, out = [];
          // the beam: a brass bar turned by a about the knife edge, knife-edge bearings at its ends, a centre boss
          const beam = ISO.box((u, w2, y) => [u * Math.cos(a) + w2 * Math.sin(a), y, TOPZ - u * Math.sin(a) + w2 * Math.cos(a)], P, [-ARM - 4, ARM + 4], [-1, 5], [-2.5, 2.5], "hi");
          out.push(`<g data-name="beam">${ISO.tinted(ISO.T.brass, beam)}${ISO.tinted(ISO.T.steel, [-1, 1].map((s) => S(G.sphereOf(endOf(a, s), 2.6, P), { tone: "mid" })).join(""))}${ISO.tinted(ISO.T.brass, S(G.disc(-4, 4, 7, LAB.Y([0, 0, TOPZ + 2]), P), { tone: "mid" }))}</g>`);
          // the pointer: from the pivot down to just over the scale, a fine tip
          const tip = [Math.sin(a) * -(RP + 1), PY + 1.2, TOPZ - Math.cos(a) * (RP + 1)];
          out.push(`<g data-name="pointer"><path d="${K.pathOf([K.iso([0, PY + 1.2, TOPZ - 4], P), K.iso(tip, P)])}" stroke="#26262a" stroke-width="1.4" stroke-linecap="round"/>${ISO.tinted(ISO.T.brass, S(G.disc(4, PY + 1.6, 2.4, LAB.Y([0, 0, TOPZ - 4]), P), { tone: "mid" }))}</g>`);
          return out.join("") + (lab ? LAB.word(P, lab, [0, 0, TOPZ + 22], aq > 0.5 ? "right pan heavier" : aq < -0.5 ? "left pan heavier" : "balanced", "#556") : "");
        });
        order.forEach((s, i) => { const e = endOf((aq * Math.PI) / 180, s), e0 = endOf(0, s); w.attr(el["pan" + i], "transform", K.translateAlong(P, [e[0] - e0[0], 0, e[2] - e0[2]])); });
        B18.light(w, g, lit);
      };
      g.set = (p) => { if (p.tilt !== undefined) st.want = tiltOf(p.tilt); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => { st.a = ISO.follow(st.a, st.want, dt, 0.5, ISO.still()); if (Math.abs(st.a - st.want) < 0.02) st.a = st.want; draw(); return st.a !== st.want; };
      g.readout = () => (Math.abs(st.want) < 0.5 ? "beam level: both pans hold the same mass" : `beam tilted ${st.want}°: the ${st.want > 0 ? "right" : "left"} pan is lower, so heavier`);
      draw();
      return g;
    },
  });
})();
