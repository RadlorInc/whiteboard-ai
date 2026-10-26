// "turntable cx cy k deg=0..360 h=4..12 prism=0|1 lab=0 lit=base|ring|table|prism" — a PART (PARTS.md, batch 5): the
// prism table of prism.js, standing on the bench, its origin the bench point under its middle. A cast foot on three
// rubber pads, a steel column with a collar and a lock knob, a fixed degree ring 10 cm across (a tick every 5°, longer
// every 30°, numbers every 30°; ticks hang from the ring's rim) and the turning table inside it with two engraved
// centre lines and an index tab whose red line reads the angle on the ring. h = the table top's height (4 cm as made;
// h = 12 lifts it on a longer column so a prism's middle sits at the 13.5 cm beam height). prism=1 stands a
// glassprism on the table that turns with it. deg turns the table (eased; 0 = index toward +x, counted toward +y).
// World units: 1 = 1 cm. anchors: top (the table's centre) centre (the prism's middle when prism=1).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const RR = 5, RT = 3.9, RF = 4, RC = 1, IRON = ISO.tint("#d6d9dd", ["#7f858c", "#90969d", "#a2a7ad", "#b3b8bd"], "#2e3338");
  const INK = ISO.tint("#2b2b28", ["#2b2b28", "#2b2b28", "#2b2b28", "#2b2b28"], "#2b2b28");

  function baseSvg(P, h) {
    const B03 = window.B03, out = [`<path class="iso-halo" d="${K.haloOf({ x: -RR, y: -RR, w: 2 * RR, d: 2 * RR, r: RR }, 0, 0.02, P)}"/>`];
    const pads = [0, 120, 240].map((a) => [Math.cos(((a + 30) * Math.PI) / 180) * 3.2, Math.sin(((a + 30) * Math.PI) / 180) * 3.2]).sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
    out.push(`<g data-name="base">`, ...pads.map(([x, y]) => ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 0.45, 0, 0.2, P, 14), { tone: "lo" }))));
    out.push(ISO.tinted(IRON, S(K.cylinder(0, 0, RF, 0.2, 0.6, P, 48, 0.12), { tone: "mid" }) + S(K.cylinder(0, 0, 1.6, 0.8, 0.3, P, 32, 0.08), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RC, 1.1, h - 2.2 - 1.1, P, 28), { tone: "hi", crease: "none" })));
    // the collar under the ring and its lock knob (toward +y)
    out.push(ISO.tinted(IRON, S(K.cylinder(0, 0, 1.45, h - 2.2, 1.1, P, 32, 0.1), { tone: "mid" })));
    const F = window.B25.Y([0, 0, h - 1.65]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(1.4, 1.9, 0.22, F, P), { tone: "mid" })), B03.knob(P, F, 1.9, 2.6, 0.55), `</g>`);
    return out.join("");
  }
  // the fixed degree ring: a disc under the table, ticks on its top annulus hanging from the rim, numbers every 30°
  function ringSvg(P, h) {
    const LAB = window.LAB, z = h - 0.6, out = [];
    out.push(ISO.tinted(IRON, S(K.cylinder(0, 0, RR, h - 1.1, 0.5, P, 72, 0), { tone: "mid", inner: L(K.sideArc(0, 0, RR, h - 0.85, P, 48), { tone: "faint" }) })));
    // radialTicks counts from +y going toward +x (angle a: sin a, −cos a); start at 90° so tick 0 is on +x
    const t = K.radialTicks(0, 0, RR, 72, 6, z, [0.35, 0.65], P, Math.PI / 2);
    out.push(ISO.tinted(INK, L(t.minor, { tone: "lo", free: "start" }) + L(t.major, { tone: "hi", free: "start" })));
    for (let d = 0; d < 360; d += 30) {
      const a = (d * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), r = RR - 0.88;
      out.push(LAB.faceText(P, [c * r, s * r, z + 0.005], [-s, c, 0], String(d), 0.34, "#2b2b28", [c, s, 0]));
    }
    return out.join("");
  }
  // the turning table at angle a (rad): plate, engraved centre lines, the index tab over the ring with its red line
  function tableSvg(P, h, a) {
    const c = Math.cos(a), s = Math.sin(a), out = [];
    const at = (u, w, v) => [u * c - v * s, u * s + v * c, w];
    const tab = ISO.tinted(IRON, ISO.box(at, P, [RT - 0.4, RR - 0.08], [h - 0.6, h - 0.48], [-0.3, 0.3], "hi"));
    const red = `<path d="${K.pathOf([K.iso(at(RT + 0.05, h - 0.475, 0), P), K.iso(at(RR - 0.1, h - 0.475, 0), P)])}" stroke="#d0392b" stroke-width="${Math.max(0.5, G.scaleOf(P) * 0.05).toFixed(2)}" data-free=""/>`;
    // the tab sits on the ring in front of the plate when it points toward you, behind it otherwise
    const front = K.depthOf(at(RT + 0.6, 0, 0), P) > 0;
    if (!front) out.push(tab, red);
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RT, h - 0.6, 0.6, P, 64, 0.08), { tone: "hi" })));
    out.push(L(K.lineOnTop(at(-RT + 0.3, 0, 0), at(RT - 0.3, 0, 0), h, P) + K.lineOnTop(at(0, 0, -RT + 0.3), at(0, 0, RT - 0.3), h, P), { tone: "faint", free: true }));
    out.push(`<path d="${G.circleOf(window.B25.Z([0, 0, h]), 0.002, 1.2, P)}" fill="none" stroke="#6f757c" stroke-width="0.5" opacity=".7"/>`);
    out.push(D([at(RT - 0.6, h, 1.3), at(RT - 0.6, h, -1.3)].map((p) => K.iso(p, P)), { size: 0.4 }));
    if (front) out.push(tab, red);
    return out.join("");
  }

  ISO.add({
    name: "turntable", title: "Prism turntable (part)", compare: null,
    about: "A turning table 10 cm across in a fixed degree ring on a column and foot, with an index that reads its angle; prism=1 carries a 60° glass prism that turns with it; h lifts the top to the beam. anchors: top centre",
    line: "turntable cx cy k deg=0..360 h=4..12 prism=0|1 lab=0 lit=base|ring|table|prism",
    demo: { line: "turntable 480 360 34 prism=1", script: [{ set: {}, hold: 1 }, { set: { deg: 40 }, hold: "settle" }, { set: { deg: 150, lit: "ring" }, hold: "settle" }, { set: { deg: 0, lit: "table" }, hold: "settle" }, { set: { lit: "prism" }, hold: 1.2 }] },
    make([cx = 480, cy = 360, k = 3], o, t, parent) {
      const B25 = window.B25, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const h = ISO.clamp(ISO.num(o, "h", 4), 4, 12), prism = o.prism === "1";
      const st = { d: ISO.num(o, "deg", 0) }, want = { d: st.d };
      let lit = o.lit || "";
      g.innerHTML = (prism ? B25.GLASS : "") + baseSvg(P, h) + `<g data-name="ring">${ringSvg(P, h)}</g><g data-name="table" data-part="table"></g>` +
        (prism ? `<g data-name="prism" data-part="prism"></g>` : "") + `<g data-part="words">${LAB.word(P, lab, [RR, 0, h - 0.8], "turntable", "#556", { anchor: "start", dy: 4 })}</g>`;
      const el = LAB.parts(g);
      const draw = () => {
        const q = Math.round(st.d * 4) / 4, a = B25.rad(q);
        w.rebuild(el.table, String(q), () => tableSvg(P, h, a));
        if (prism) w.rebuild(el.prism, String(q), () => B25.prism(P, h, a));
        B25.light(w, g, lit);
      };
      g.anchors = { top: [0, 0, h], centre: [0, 0, h + B25.PRISM.h / 2] };
      g.set = (p) => {
        if (p.deg !== undefined && Number.isFinite(+p.deg)) want.d = +p.deg;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.d = ISO.follow(st.d, want.d, dt, 0.5, ISO.still());
        if (Math.abs(st.d - want.d) < 0.05) st.d = want.d;
        draw();
        return st.d !== want.d;
      };
      g.readout = () => `turntable ${2 * RR} cm across, top ${h} cm up · index at ${(((Math.round(st.d) % 360) + 360) % 360)}° on the ring${prism ? " · carrying a 60° glass prism" : ""}`;
      draw();
      return g;
    },
  });
})();
