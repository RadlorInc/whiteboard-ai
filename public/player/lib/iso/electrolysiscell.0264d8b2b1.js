// "electrolysiscell cx cy k on=0|1 kind=water|brine lab=0 lit=base|cell|liquid|cathode|anode|terminals" — a PART
// (PARTS.md, batch 5): a school electrolysis cell standing on the bench, origin the bench
// point under its middle. A white plastic base 10.8 × 10.8 × 1.4 cm with a black (−) and a red (+) terminal post on
// its front edge, wired inside to two carbon rods 5.6 mm × 4.4 cm that come up through the floor of a glass cell
// 9.2 cm across and 11.2 cm tall, filled to 8.8 cm with the electrolyte (dilute sulfuric acid for kind=water, brine for
// kind=brine). on=1 (current flowing): gas bubbles stream off both rods and rise to the surface, twice as many off the
// cathode (−, hydrogen) as off the anode (+, oxygen) for water, about as many (chlorine) for brine; set({ on }).
// Anchors: cathode and anode (each rod's top, where an upturned test tube's mouth goes over it), minus and plus (the
// terminal caps' tops), rim (the cell's rim, on its axis). Built in mm from the electrolysis scene; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const B = 54, BZ = 14, R = 46, CH = 112, CB = 3, LIQ = 88, ER = 2.8, EH = 44, EX = 20, TX = 36, TY = 42, NB = 16;
  const OUTER = [[0, R - 3], [0.7, R - 1.2, 1], [2.2, R - 0.2, 1], [4, R], [CH, R]];
  const WHITE = ISO.tint("#f4f4f2", ["#c4c6c8", "#d2d4d6", "#dfe1e2", "#eaebec"], "#5a5d62");
  const CARBON = ISO.tint("#6c7076", ["#26282c", "#303236", "#3b3e42", "#484b50"], "#121314");

  ISO.add({
    name: "electrolysiscell", title: "Electrolysis cell (part)", compare: null,
    about: "A school electrolysis cell: white base with a black (−) and a red (+) terminal, a glass cell of electrolyte with two carbon rods up through its floor; on=1 gas bubbles stream off both rods, twice as fast off the cathode for water. anchors: cathode anode minus plus rim",
    line: "electrolysiscell cx cy k on=0|1 kind=water|brine lab=0 lit=base|cell|liquid|cathode|anode|terminals",
    demo: { line: "electrolysiscell 480 400 26 on=0", script: [{ set: {}, hold: 1 }, { set: { on: 1, lit: "cathode" }, hold: 2 }, { set: { lit: "anode" }, hold: 1.5 }, { set: { lit: "terminals" }, hold: 1 }, { set: { on: 0, lit: "cell" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", brine = o.kind === "brine";
      const cell = LAB.vessel(Pm, [0, 0, BZ], OUTER, { base: CB });
      const plan = { x: -B, y: -B, w: 2 * B, d: 2 * B, r: 4 };
      const minus = CIRC.post(Pm, [-TX, TY, BZ], { r: 4, h: 8, cap: ISO.T.plastic }), plus = CIRC.post(Pm, [TX, TY, BZ], { r: 4, h: 8, cap: ISO.T.red });
      // the base: a moulded slab with a groove round its top, feet under it, the − and + moulded by the posts
      const base = `<path class="iso-halo" d="${K.haloOf(plan, 0, BZ, Pm)}"/>` + ISO.tinted(WHITE, S(K.slabOf(plan, 0, BZ, Pm, 3, 0.8), { tone: "hi", inner: L(K.sideSeam(plan, 3, Pm, 3), { tone: "faint" }) })) +
        L(K.planOutline(K.insetPlan(plan, 4), BZ, Pm, 3), { tone: "faint" }) +
        LAB.faceText(Pm, [-TX - 10, TY, BZ + 0.05], [1, 0, 0], "−", 6, "#26282c", [0, -1, 0]) + LAB.faceText(Pm, [TX + 10, TY, BZ + 0.05], [1, 0, 0], "+", 6, "#b8202a", [0, -1, 0]);
      // a carbon rod: up from the cell's floor through a rubber seal, a rounded top
      const rod = (x) => ISO.tinted(ISO.T.rubber, S(K.cylinder(x, 0, ER + 1.6, BZ + CB, 2, Pm, 18, 0.3), { tone: "mid" })) +
        ISO.tinted(CARBON, S(G.lathe([[0, ER], [EH - 1, ER], [EH - 0.2, ER * 0.7, 1], [EH, 0]], LAB.Z([x, 0, BZ + CB]), Pm), { tone: "mid" }));
      g.innerHTML = `<g data-name="base">${base}</g><g data-name="terminals">${minus.svg}</g><g data-name="terminals">${plus.svg}</g><g data-name="cell">${cell.back()}</g>` +
        `<g data-name="cathode">${rod(-EX)}</g><g data-name="anode">${rod(EX)}</g><g data-name="liquid">${cell.liquid(LIQ, brine ? "#cfe6f0" : "#a9d3f2", { opacity: 0.55 })}</g>` +
        `<g data-part="bub">${Array.from({ length: NB }, () => `<circle r="1" fill="#ffffff" fill-opacity=".7" stroke="#4d7590" stroke-width="0.5" opacity="0"/>`).join("")}</g><g data-name="cell">${cell.front()}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [-TX, TY + 6, 0], "cathode (−)", "#2b6cc4", { anchor: "end", dy: 16, size: 12 }) + LAB.word(Pm, lab, [TX, TY + 6, 0], "anode (+)", "#c0392b", { anchor: "start", dy: 16, size: 12 });
      g.anchors = { cathode: [-EX / 10, 0, (BZ + CB + EH) / 10], anode: [EX / 10, 0, (BZ + CB + EH) / 10], minus: minus.top.map((v) => v / 10), plus: plus.top.map((v) => v / 10), rim: [0, 0, (BZ + CH) / 10] };
      const bub = [...g.querySelectorAll('[data-part="bub"] circle')], w = ISO.writer();
      // bubbles 0..9 off the cathode; the anode gets half as many for water (2H₂O → 2H₂ + O₂), nearly as many for brine
      const NC = 10, NA = brine ? 6 : 5;
      const s = { amt: +o.on ? 1 : 0, ph: 0, on: +o.on ? 1 : 0 };
      let lit = o.lit || "";
      const move = () => {
        const sc = G.scaleOf(Pm), top = BZ + LIQ - 1.5;
        bub.forEach((c, i) => {
          const cat = i < NC, j = cat ? i : i - NC, n = cat ? NC : NA;
          if (!cat && j >= NA) { w.attr(c, "opacity", "0"); return; }
          // each bubble leaves the rod somewhere along its length and rises, wobbling, to the surface
          const ph = (s.ph * (cat ? 0.42 : 0.36) + j / n) % 1, z0 = BZ + CB + 4 + ((j * 7) % 10) * 3.6, z = z0 + ph * (top - z0);
          const side = (j * 2.39) % (Math.PI * 2), x = (cat ? -EX : EX) + Math.cos(side) * (ER + 0.8) + Math.sin(ph * 8 + j) * 1.2, y = Math.sin(side) * (ER + 0.8);
          const p = K.iso([x, y, z], Pm);
          w.attr(c, "cx", p[0].toFixed(1)); w.attr(c, "cy", p[1].toFixed(1)); w.attr(c, "r", Math.max(0.5, sc * (0.7 + ph * 0.7)).toFixed(2));
          w.attr(c, "opacity", (s.amt * Math.min(1, ph * 8) * Math.min(1, (1 - ph) * 10)).toFixed(2));
        });
      };
      g.set = (p) => { if (p.on !== undefined) s.on = +p.on ? 1 : 0; if (p.lit !== undefined) lit = p.lit; B13.light(w, g, lit); };
      g.update = (dt) => {
        const calm = ISO.still(), target = calm ? 0 : s.on;
        s.amt = ISO.follow(s.amt, target, dt, 0.4, calm); if (Math.abs(s.amt - target) < 0.004) s.amt = target;
        if (!calm) s.ph += dt;
        move();
        return s.amt !== target;
      };
      g.readout = () => (s.on ? `current on · hydrogen bubbles off the cathode (−), ${brine ? "chlorine" : "oxygen"} off the anode (+)${brine ? "" : " at half the rate"}` : `switched off · carbon electrodes in ${brine ? "brine" : "dilute sulfuric acid"}, no gas`);
      move();
      B13.light(w, g, lit);
      return g;
    },
  });
})();
