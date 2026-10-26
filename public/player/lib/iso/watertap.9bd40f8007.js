// "watertap cx cy k reach=6..30 drop=5..60 open=0|1 lab=0 lit=pipe|tap|handle|water" — a PART (PARTS.md, batch 5): a
// bench water tap, its origin the bench point under the riser. A floor flange screwed down, a 15 mm steel riser 38 cm
// tall with a coupling, an elbow and an arm reaching `reach` cm along +x to a brass quarter-turn tap: its body, the
// bonnet and spindle, a lever on top (along the pipe = open, across it = shut), and the spout pointing down with a
// threaded hose nozzle. Open, water runs from the nozzle `drop` cm down (into the can or the sink under it). Reused
// from pressure.js (its riser, arm and tap) and distill.js (the bench taps). set({ open }) swings the lever and the
// stream follows. World units: 1 = 1 cm. anchors: spout (the nozzle's tip), top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RR = 1.05, RZ = 38, SP = 4.6;
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), DN = (o) => G.frameOf(o, [0, 0, -1], [1, 0, 0], [0, 1, 0]);

  function pipeSvg(P, reach) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -2.2, y: -2.2, w: 4.4, d: 4.4, r: 2.2 }, 0, 0.02, P)}"/>`];
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 2.2, 0, 0.45, P, 36, 0.12), { tone: "mid" }) + S(K.cylinder(0, 0, 1.35, 0.45, 1.2, P, 28, 0.1), { tone: "mid" })));
    out.push(D([0.5, 2.6, 4.7].map((a) => K.iso([Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0.46], P)), { size: 0.45 }));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RR, 1.65, RZ - 1.65, P, 22), { tone: "hi", crease: "none" }) + S(K.cylinder(0, 0, 1.32, 19, 1.8, P, 24, 0.12), { tone: "mid", inner: L(K.sideArc(0, 0, 1.32, 19.9, P, 20), { tone: "faint" }) })));
    out.push(ISO.tinted(ISO.T.steel, S(G.sphereOf([0, 0, RZ], 1.3, P), { tone: "hi" }) + S(G.disc(0.9, reach - 1.1, RR, X([0, 0, RZ]), P), { tone: "hi", crease: "none" }) + S(G.disc(reach - 2.6, reach - 1.2, 1.3, X([0, 0, RZ]), P), { tone: "mid" })));
    return out.join("");
  }
  // the spout under the body and its threaded nozzle
  const spoutSvg = (P, reach) => ISO.tinted(ISO.T.brass, S(G.disc(1, SP - 0.9, 0.6, DN([reach, 0, RZ]), P), { tone: "mid", crease: "none" }) +
    S(G.disc(SP - 0.9, SP, 0.78, DN([reach, 0, RZ]), P), { tone: "hi", inner: L(G.ribsOf(DN([reach, 0, RZ]), SP - 0.85, SP - 0.05, 0.78, 14, P, { seams: true }), { tone: "lo" }) }));
  // the body: a brass ball with its hex ends, the bonnet and the spindle
  const bodySvg = (P, reach) => ISO.tinted(ISO.T.brass, S(G.disc(-1.25, -0.8, 1.35, X([reach, 0, RZ]), P), { tone: "mid" }) + S(G.sphereOf([reach, 0, RZ], 1.5, P), { tone: "hi" }) +
    S(K.cylinder(reach, 0, 0.95, RZ + 1.1, 1.3, P, 6, 0.06), { tone: "mid" }) + S(K.cylinder(reach, 0, 0.32, RZ + 2.4, 0.7, P, 14), { tone: "hi", crease: "none" }));
  // the lever at angle a (0 = along +x: open; π/2 = along +y: shut), its boss, a grip and the nut on top
  function leverSvg(P, reach, a) {
    const o = [reach, 0, RZ + 3.1], d = [Math.cos(a), Math.sin(a), 0.12], F = G.frameAlong(o, d);
    const lever = ISO.tinted(ISO.T.steel, S(G.disc(-0.8, 3.4, 0.3, F, P), { tone: "hi" })) + ISO.tinted(ISO.T.red, S(G.solidOf([[3.2, 0.42], [3.5, 0.5, 1], [6.2, 0.5], [6.5, 0.38, 1]], F, P), { tone: "mid" }));
    const boss = ISO.tinted(ISO.T.steel, S(K.cylinder(reach, 0, 0.6, RZ + 2.8, 0.6, P, 6, 0.05), { tone: "mid" }));
    const nut = ISO.tinted(ISO.T.steel, S(K.cylinder(reach, 0, 0.4, RZ + 3.4, 0.4, P, 6, 0.04), { tone: "hi" }));
    // the half of the lever that points away is drawn before the boss, the half toward the viewer after
    const away = G.dot3(d, G.viewOf(P)) < 0;
    return away ? lever + boss + nut : boss + lever + nut;
  }

  ISO.add({
    name: "watertap", title: "Bench water tap (part)", compare: null,
    about: "A bench water tap: a steel riser 40 cm tall and an arm to a brass quarter-turn tap, its spout pointing down; open it (lever along the pipe) and water runs into the can or sink under it. anchors: spout top",
    line: "watertap cx cy k reach=6..30 drop=5..60 open=0|1 lab=0 lit=pipe|tap|handle|water",
    demo: { line: "watertap 430 515 12 reach=12 drop=22 open=0", script: [{ set: {}, hold: 1 }, { set: { open: 1, lit: "handle" }, hold: 2.4 }, { set: { lit: "water" }, hold: 1.6 }, { set: { open: 0, lit: "tap" }, hold: 2.4 }, { set: { lit: "pipe" }, hold: 1.2 }] },
    make([cx = 480, cy = 500, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const reach = ISO.clamp(ISO.num(o, "reach", 12), 6, 30), drop = ISO.clamp(ISO.num(o, "drop", 25), 5, 60);
      const st = { f: o.open === "1" ? 1 : 0, clock: 0 }, want = { f: st.f };
      let lit = o.lit || "";
      g.innerHTML = `<g data-name="pipe">${pipeSvg(P, reach)}</g><g data-name="tap">${spoutSvg(P, reach)}</g><g data-name="water" data-part="water"></g><g data-name="tap">${bodySvg(P, reach)}</g><g data-name="handle" data-part="lever"></g><g data-part="words"></g>`;
      const tip = [reach, 0, RZ - SP];
      g.anchors = { spout: tip, top: [0, 0, RZ + 1.3] };
      const el = LAB.parts(g), w = ISO.writer();
      // the stream: a dark edge and a light core, thinning as the tap closes, with flow marks running down it
      const stream = (f, ph) => {
        if (f < 0.03) return "";
        const a = K.iso(tip, P), b = K.iso([tip[0], 0, tip[2] - drop], P), wpx = G.scaleOf(P) * (0.25 + 0.5 * f);
        const seg = `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`, dash = (wpx * 3).toFixed(1);
        return `<path d="${seg}" stroke="#1f5f9f" stroke-width="${wpx.toFixed(2)}" stroke-linecap="round" opacity=".9"/><path d="${seg}" stroke="#8cc4f2" stroke-width="${(wpx * 0.5).toFixed(2)}" stroke-linecap="round"/>` +
          `<path d="${seg}" stroke="#e8f4fd" stroke-width="${(wpx * 0.22).toFixed(2)}" stroke-dasharray="${dash} ${dash}" stroke-dashoffset="${(-ph * wpx * 6).toFixed(1)}"/>`;
      };
      const draw = () => {
        const f = Math.round(st.f * 40) / 40, ph = Math.round((st.clock % 1) * 24) / 24;
        w.rebuild(el.lever, String(f), () => leverSvg(P, reach, (1 - f) * (Math.PI / 2)));
        w.rebuild(el.water, f < 0.03 ? "" : `${f} ${ph}`, () => stream(f, ph));
        if (lab) w.rebuild(el.words, String(want.f), () => LAB.word(P, lab, [reach + 1.5, 0, RZ + 4], want.f ? "tap open" : "tap shut", "#556", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.open !== undefined) want.f = +p.open ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.25, calm);
        if (Math.abs(st.f - want.f) < 0.01) st.f = want.f;
        st.clock = calm ? 0 : st.clock + dt;
        draw();
        return st.f !== want.f || (st.f > 0.03 && !calm);
      };
      g.readout = () => `bench tap ${want.f ? "open: lever along the pipe, water falls " + drop + " cm from the spout" : "shut: lever across the pipe"} · riser 40 cm, arm ${reach} cm`;
      draw();
      return g;
    },
  });
})();
