// "screwdriver cx cy k aim=wall|down|up|flat turn=0..1 lab=0 lit=tip|shaft|handle" — a PART (PARTS.md): a Phillips
// PH2 screwdriver, 22 cm long, its origin the tip's point. A cross point with four flutes, a 6 mm chrome-vanadium
// shaft (black-oxide near the point, a hex bolster for a spanner near the handle), a crimped steel ferrule, and a
// red two-part handle: a hard core with a black rubber grip moulded over it, six flutes along the grip, a domed butt
// with a printed cross. aim says where the tip points: wall (−y), down (−z), up (+z), or flat (lying on a surface,
// tip touching, handle resting on its widest point; the origin is then the middle under it). set({ turn }) spins it
// by turn × 360° (clockwise from the handle, the way a screw goes in): the flutes and the tip's cross move.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const STEEL = ISO.T.steel, RUBBER = ISO.T.rubber;
  const OXIDE = ISO.tint("#7a7e85", ["#34363b", "#42454a", "#50535a", "#61646b"], "#16171a") + ";--anatomy-hi:#050506";
  const RED = ISO.tint("#f6b4a8", ["#a9342a", "#bd4637", "#cf5a49", "#de6e5d"], "#5e120a");
  const LEN = 22.2, GRIP = [14.3, 20.3], RMAX = 1.72, TAU = Math.PI * 2;
  const DIR = { wall: [0, -1, 0], down: [0, 0, -1], up: [0, 0, 1] };
  // The tool's frame: o = the tip, a = from the tip back along the tool. Flat: lying along x with the tip to +x,
  // tilted so the point and the grip's widest ring both touch the surface z = 0.
  function frameFor(aim) {
    if (aim !== "flat") { const d = DIR[aim]; return G.frameAlong([0, 0, 0], [-d[0], -d[1], -d[2]]); }
    const s = (GRIP[0] + GRIP[1]) / 2, th = Math.asin((RMAX - 0.06) / s), c = Math.cos(th);
    return G.frameAlong([(LEN / 2) * c, 0, 0.06 * c], [-c, 0, Math.sin(th)]);
  }
  // the pieces, coaxial, each with the place along the axis it is sorted by
  function piecesOf(F, P) {
    const tint = (t, svg) => ISO.tinted(t, svg), out = [];
    const add = (name, s, svg) => out.push({ name, s, svg });
    // the cross point: a cone to the 6 mm shaft, black oxide up to 2.4 cm
    add("tip", 0.6, tint(OXIDE, S(G.solidOf([[0, 0.05], [0.3, 0.16, 1], [0.9, 0.3, 1], [1.2, 0.3]], F, P, { steps: 24 }), { tone: "hi" })));
    add("tip", 0.61, '<g data-part="cross"></g>');
    add("tip", 1.8, tint(OXIDE, S(G.disc(1.2, 2.4, 0.3, F, P, { steps: 20 }), { tone: "hi" })));
    add("shaft", 6.3, tint(STEEL, S(G.disc(2.4, 10.2, 0.3, F, P, { steps: 20 }), { tone: "hi", inner: L(G.arcOf(F, 6.5, 0.3, P), { tone: "faint" }) })));
    // the hex bolster, its chamfered shoulders turned on the lathe
    add("shaft", 10.2, tint(STEEL, S(G.solidOf([[10.2, 0.3], [10.45, 0.5, 1], [10.5, 0.5]], F, P, { steps: 24 }), { tone: "hi" })));
    add("shaft", 10.85, tint(STEEL, S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos((i * Math.PI) / 3) * 0.58, Math.sin((i * Math.PI) / 3) * 0.58]), 10.5, 11.2, P), { tone: "hi" })));
    // the ferrule: a steel collar crimped onto the handle's nose (two crimp lines round it)
    add("handle", 11.6, tint(STEEL, S(G.solidOf([[11.2, 0.62], [11.3, 0.78, 1], [12.3, 0.82, 1], [12.5, 0.8]], F, P, { steps: 28 }), { tone: "hi", inner: L(G.arcOf(F, 11.7, 0.81, P) + G.arcOf(F, 12.05, 0.82, P), { tone: "lo" }) })));
    // the handle's hard core: nose, waist under the grip, shoulder, domed butt
    add("handle", 13.2, tint(RED, S(G.solidOf([[12.5, 0.92], [12.9, 1.25, 1], [13.6, 1.5, 1], [14.3, 1.56, 1], [14.4, 1.5]], F, P, { steps: 40 }), { tone: "hi" })));
    add("handle", 17.3, tint(RUBBER, S(G.solidOf([[14.3, 1.5], [14.5, 1.64, 1], [14.75, 1.68, 1], [17.3, 1.72, 1], [19.85, 1.64, 1], [20.1, 1.56, 1], [20.3, 1.48]], F, P, { steps: 44 }), { tone: "hi" })));
    add("handle", 17.31, '<g data-part="flutes"></g>');
    add("handle", 21.2, tint(RED, S(G.solidOf([[20.2, 1.5], [20.8, 1.48, 1], [21.5, 1.3, 1], [21.95, 0.95, 1], [LEN, 0]], F, P, { steps: 40 }), { tone: "hi", inner: L(G.arcOf(F, 21.5, 1.3, P, { slope: -0.4 }), { tone: "faint" }) })));
    add("handle", LEN + 0.01, '<g data-part="butt"></g>');
    return out;
  }
  ISO.add({
    name: "screwdriver", title: "Screwdriver (part)", compare: null,
    about: "A 22 cm Phillips (PH2) screwdriver: cross point, steel shaft, ferrule and a fluted red handle with a rubber grip; its tip is the origin, aim says where it points, turn spins it. anchors: none",
    line: "screwdriver cx cy k aim=wall|down|up|flat turn=0..1 lab=0 lit=tip|shaft|handle",
    demo: { line: "screwdriver 640 150 40 aim=wall lab=1", script: [{ set: {}, hold: 1 }, { set: { turn: 1, lit: "handle" }, hold: "settle" }, { set: { turn: 0.25, lit: "tip" }, hold: "settle" }] },
    make([cx = 480, cy = 270, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = DIR[o.aim] || o.aim === "flat" ? o.aim : "wall", F = frameFor(aim);
      const depth = (s) => K.depthOf(G.pointOf(F, s, 0, 0), P);
      const pieces = piecesOf(F, P).sort((a, b) => depth(a.s) - depth(b.s) || a.s - b.s);
      let html = "";
      if (aim === "flat") html += `<path class="iso-halo" d="${K.haloOf({ x: -LEN / 2 - 1, y: -1.3, w: LEN + 2, d: 2.6, r: 1.3 }, -0.1, 0.3, P)}"/>`;
      // consecutive pieces of one name share a group, so lit= and mark find them
      for (let i = 0; i < pieces.length; ) {
        const name = pieces[i].name; let body = "";
        while (i < pieces.length && pieces[i].name === name) body += pieces[i++].svg;
        html += `<g data-name="${name}">${body}</g>`;
      }
      g.innerHTML = html + '<g data-part="words"></g>';
      const q = (n) => g.querySelector(`[data-part="${n}"]`), el = { cross: q("cross"), flutes: q("flutes"), butt: q("butt"), words: q("words") };
      // the butt faces the viewer only when its axis does: then the printed cross shows on the dome
      const facing = G.dot3(F.a, G.viewOf(P));
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")], cache = {};
      const s = { turn: ISO.clamp(ISO.num(o, "turn", 0), 0, 1) }, goal = { turn: s.turn };
      let lit = o.lit || "";
      const draw = () => {
        const phi = -s.turn * TAU;                                   // positive turn about −a: a right-hand screw goes in
        const fk = Math.round(((((phi % (TAU / 8)) + TAU / 8) % (TAU / 8)) / (TAU / 8)) * 60) % 60;
        w.rebuild(el.flutes, `f${fk}`, () => (cache[`f${fk}`] ||= ISO.tinted(RUBBER + ";--anatomy-lo:#0b0b0d;--anatomy-hi:#8d9096", K.fadedSvg(G.ribsOf(F, 14.75, 19.85, 1.68, 8, P, { phase: (fk / 60) * (TAU / 8), fade: [0.2, 0.55], seams: true, r1: 1.64 }), { tone: "lo" }) +
          K.fadedSvg(G.ribsOf(F, 14.75, 19.85, 1.68, 8, P, { phase: (fk / 60) * (TAU / 8) + 0.07, fade: [0.2, 0.55], r1: 1.64 }), { tone: "hi" }))));
        const ck = Math.round(((((phi % (TAU / 4)) + TAU / 4) % (TAU / 4)) / (TAU / 4)) * 40) % 40;
        w.rebuild(el.cross, `c${ck}`, () => ISO.tinted(OXIDE, K.fadedSvg(G.ribsOf(F, 0.1, 1.2, 0.1, 4, P, { phase: (ck / 40) * (TAU / 4) + 0.4, fade: [-0.1, 0.25], r1: 0.3, seams: "last" }), { tone: "hi" })));
        const bk = facing > 0.05 ? Math.round(((((phi % (TAU / 4)) + TAU / 4) % (TAU / 4)) / (TAU / 4)) * 40) % 40 : -1;
        w.rebuild(el.butt, `b${bk}`, () => {
          if (bk < 0) return "";
          const a0 = (bk / 40) * (TAU / 4), arm = (a) => K.pathOf([K.iso(G.pointOf(F, LEN - 0.03, 0.08, a), P), K.iso(G.pointOf(F, LEN - 0.12, 0.55, a), P)]);
          return `<path d="${[0, 1, 2, 3].map((i) => arm(a0 + (i * TAU) / 4)).join("")}" fill="none" stroke="#3a0c06" stroke-width="${(0.12 * k).toFixed(2)}" stroke-linecap="round" data-free=""/>`;
        });
        w.rebuild(el.words, lab ? aim : "", () => {
          if (!lab) return "";
          const at = K.iso(G.pointOf(F, 6, 0, 0), P);
          return ISO.word([at[0] + 14, at[1] + 22], "screwdriver", "#444", { size: 14, anchor: "start" });
        });
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.turn !== undefined) goal.turn = ISO.clamp(+p.turn, 0, 1);
        if (p.lit !== undefined) { lit = p.lit; draw(); }
      };
      g.update = (dt) => {
        if (s.turn === goal.turn) return false;
        // a wrist turns a screwdriver about a third of a turn a second (0.4 s lag on the follow)
        s.turn = ISO.follow(s.turn, goal.turn, dt, 0.45, ISO.still());
        if (Math.abs(s.turn - goal.turn) < 0.002) s.turn = goal.turn;
        draw();
        return s.turn !== goal.turn;
      };
      g.readout = () => `Phillips PH2 screwdriver · 22 cm · tip pointing ${aim === "flat" ? "sideways, lying flat" : aim === "wall" ? "into the wall" : aim} · turned ${Math.round(s.turn * 360)}°`;
      draw();
      return g;
    },
  });
})();
