// "venturitube cx cy k flow=0..1 lab=0 lit=pipe|water|supports|flanges" — a PART (PARTS.md, batch 5): the venturi tube
// of bernoulli.js at real size, lying along x on two wooden saddles, origin the bench point under its middle. A glass
// pipe 50 cm long, 4 cm across, narrowing smoothly to 2 cm at the throat (a quarter of the area), flanged ends with
// four bolts and a hose tail, three tapping stubs on top (t1 wide, t2 the throat, t3 wide) where manometer tubes
// stand. It is full of water; flow 0..1 (0.6 m/s in the wide part at 1) moves tracer specks
// along three stream lines, and because the same water must pass every section they go 4× faster through the throat
// (A₁v₁ = A₂v₂). set({ flow }). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const AXZ = 80, R1 = 18, R2 = 9, GL = 2, HALF = 232, TAPS = [-170, 0, 170], SUP = [-195, 195], V1 = 0.6, RHO = 1000;
  const rAt = (x) => { const a = Math.abs(x); return a < 40 ? R2 : a < 120 ? R2 + (R1 - R2) * ISO.smooth(40, 120, a) : R1; };
  const WATER = ISO.tint("#a8d1f2", ["#5c97cf", "#6ea6da", "#83b6e3", "#97c4ec"], "#1f4f8f");
  // where a speck is at volume fraction f: x from the pipe's own volume ∫ r² dx (so its speed ∝ 1 / r²)
  const VOL = (() => { const xs = [], vs = [0]; for (let x = -HALF; x <= HALF; x += 2) xs.push(x); for (let i = 1; i < xs.length; i++) vs.push(vs[i - 1] + rAt(xs[i] - 1) ** 2 * 2); return { xs, vs, total: vs[vs.length - 1] }; })();
  const xOf = (f) => { const v = f * VOL.total, { xs, vs } = VOL; let lo = 0, hi = vs.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; vs[m] < v ? (lo = m) : (hi = m); } return xs[lo] + ((xs[hi] - xs[lo]) * (v - vs[lo])) / ((vs[hi] - vs[lo]) || 1); };

  function backSvg(P) {
    const B08 = window.B08, out = [`<path class="iso-halo" d="${K.haloOf({ x: -HALF - 18, y: -30, w: 2 * HALF + 36, d: 60, r: 10 }, 0, 4, P)}"/>`];
    // two saddles: a block with a curved seat that the pipe rests in, a felt pad in the seat
    for (const x of SUP) {
      const seat = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; seat.push([Math.cos(a) * (R1 + GL + 1), AXZ + Math.sin(a) * (R1 + GL + 1)]); }
      const pts = [[-26, 0], [26, 0], [26, AXZ - 6], ...seat.reverse(), [-26, AXZ - 6]];
      out.push(`<g data-name="supports">${ISO.tinted(ISO.T.wood, ISO.wbox(P, [x - 22, x + 22], [-30, 30], [0, 6], "mid"))}${ISO.prismX(P, pts, x - 9, x + 9, ["#d9b483", "#f0dcbf"], "#f7e8d0", "#7a5a2e")}</g>`);
    }
    return out.join("");
  }
  const F = () => window.B08.X([0, 0, AXZ]);
  function waterSvg(P) {
    const prof = [[-HALF + 8, 0]]; for (let x = -HALF + 8; x <= HALF - 8; x += 16) prof.push([x, rAt(x), 1]);
    prof.push([HALF - 8, 0]);
    return ISO.tinted(WATER, S(G.lathe(prof, F(), P, { smooth: true }), { tone: "mid" }));
  }
  function glassSvg(P) {
    const B08 = window.B08, prof = [[-HALF, 0], [-HALF, R1 + GL]];
    for (let x = -HALF + 8; x <= HALF - 8; x += 16) prof.push([x, rAt(x) + GL, 1]);
    prof.push([HALF, R1 + GL], [HALF, 0]);
    const out = [B08.glassCss("vt-glass", 0.16, 0.3), `<g class="vt-glass" style="${ISO.T.glass}" data-name="pipe">${S(G.lathe(prof, F(), P), { tone: "hi" })}`];
    // the three tapping stubs on top (glass), each with its hole
    for (const x of TAPS) { const z = AXZ + rAt(x) + GL - 1; out.push(S(K.cylinder(x, 0, 5, z, 9, P, 18), { tone: "hi" })); }
    out.push("</g>");
    for (const x of TAPS) { const z = AXZ + rAt(x) + GL + 8; out.push(`<path d="${K.ring(x, 0, 2.6, z, P, 16)}" fill="#5c97cf" stroke="#1f4f8f" stroke-width="0.5"/>`); }
    return out.join("");
  }
  // a flange and its hose tail: the far end (sg −1, drawn before the pipe: the tail behind it) or the near end (bolts)
  function endsSvg(P, sg) {
    const B08 = window.B08, f = F(), out = ['<g data-name="flanges">'], tail = ISO.tinted(ISO.T.steel, S(G.disc(sg < 0 ? -HALF - 18 : HALF + 12, sg < 0 ? -HALF - 12 : HALF + 18, 10, f, P), { tone: "hi" }));
    if (sg < 0) out.push(tail);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(sg < 0 ? -HALF - 12 : HALF, sg < 0 ? -HALF : HALF + 12, 32, f, P), { tone: "mid" })));
    if (sg > 0) {
      for (let i = 0; i < 4; i++) out.push(ISO.tinted(ISO.T.steel, S(G.disc(HALF + 12, HALF + 15, 3.4, B08.X(G.pointOf(f, 0, 25, Math.PI / 4 + (i * Math.PI) / 2)), P, { steps: 6 }), { tone: "hi" })));
      out.push(tail, `<path d="${G.circleOf(f, HALF + 18.05, 6.5, P)}" fill="#5c97cf" stroke="#1f4f8f" stroke-width="0.5"/>`);
    }
    out.push("</g>");
    return out.join("");
  }
  // the tracer specks: three stream lines (above, on and below the axis, scaled to the pipe's radius here)
  const specksSvg = (P, phase) => {
    const pts = [];
    for (const [row, off] of [[-0.55, 0.37], [0, 0], [0.55, 0.71]]) for (let i = 0; i < 26; i++) {
      const f = (((i + off) / 26 + phase) % 1 + 1) % 1, x = xOf(f);
      if (Math.abs(x) > HALF - 12) continue;
      pts.push(K.iso([x, rAt(x) * 0.35, AXZ + row * rAt(x)], P));
    }
    const r = Math.max(0.7, G.scaleOf(P) * 1.6).toFixed(2);
    return `<g fill="#ffffff" stroke="#2f6fae" stroke-width="0.5" opacity=".9">${pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`).join("")}</g>`;
  };

  ISO.add({
    name: "venturitube", title: "Venturi tube (part)", compare: null,
    about: "A glass venturi tube 50 cm long, 4 cm across narrowing to 2 cm at the throat, on two wooden saddles, full of water; flow moves tracer specks through it, 4× faster in the throat; three tapping stubs on top for manometer tubes. anchors: t1 t2 t3 in out",
    line: "venturitube cx cy k flow=0..1 lab=0 lit=pipe|water|supports|flanges",
    demo: { line: "venturitube 480 330 15 flow=0", script: [{ set: {}, hold: 1 }, { set: { flow: 0.5, lit: "water" }, hold: 2.5 }, { set: { flow: 1, lit: "pipe" }, hold: 2.5 }, { set: { lit: "flanges" }, hold: 1 }, { set: { flow: 0, lit: "supports" }, hold: "settle" }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = backSvg(Pm) + endsSvg(Pm, -1) + `<g data-name="water"><g data-part="water"></g><g data-part="specks"></g></g><g data-part="glass"></g>` + endsSvg(Pm, 1) +
        (lab ? CIRC.word(P, [HALF / 10, 0, (AXZ + 40) / 10], "venturi tube") + ISO.word(K.iso([-HALF / 10, 0, (AXZ + 30) / 10], P), "flow →", "#1f4f8f", { size: 13, anchor: "start" }) : "");
      const tap = (x) => [x / 10, 0, +((AXZ + rAt(x) + GL + 8) / 10).toFixed(2)];
      g.anchors = { t1: tap(TAPS[0]), t2: tap(TAPS[1]), t3: tap(TAPS[2]), in: [-(HALF + 18) / 10, 0, AXZ / 10], out: [(HALF + 18) / 10, 0, AXZ / 10] };
      const el = LAB.parts(g), w = ISO.writer(), s = { f: ISO.clamp(ISO.num(o, "flow", 0), 0, 1), to: 0, phase: 0 };
      s.to = s.f;
      let lit = o.lit || "";
      // the two lathes are the heavy part of the build: each its own slice (ISO.later)
      ISO.later(() => { el.water.innerHTML = waterSvg(Pm); window.B08.light(w, g, lit); });
      ISO.later(() => { el.glass.innerHTML = glassSvg(Pm); window.B08.light(w, g, lit); });
      const draw = () => { w.rebuild(el.specks, s.phase.toFixed(4), () => specksSvg(Pm, s.phase)); window.B08.light(w, g, lit); };
      g.set = (p) => {
        if (p.flow !== undefined && Number.isFinite(+p.flow)) s.to = ISO.clamp(+p.flow, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.f = ISO.follow(s.f, s.to, Math.min(dt, 0.25), 0.6, calm);
        // real speed: v1 m/s in the wide part, so the volume fraction moves at v1·A1 / V each second (drawn at ¼ speed)
        if (!calm) s.phase = (s.phase + (Math.min(dt, 0.25) * s.f * V1 * 1000 * R1 * R1 * 0.25) / VOL.total) % 1;
        draw();
        return !calm && s.f > 0.001 || s.f !== s.to;
      };
      g.readout = () => {
        const v1 = V1 * s.f, v2 = v1 * (R1 / R2) ** 2, dp = 0.5 * RHO * (v2 * v2 - v1 * v1);
        return s.f < 0.02 ? "no flow · water at rest: the same pressure all along" : `wide part ${v1.toFixed(2)} m/s · throat ${v2.toFixed(2)} m/s (area ¼, so 4× faster) · pressure in the throat ${dp.toFixed(0)} Pa lower = ${(dp / (RHO * 9.81) * 1000).toFixed(0)} mm of water`;
      };
      draw();
      return g;
    },
  });
})();
