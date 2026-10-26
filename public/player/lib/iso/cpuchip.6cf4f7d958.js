// "cpuchip cx cy k lid=0..1 run=0|1 lab=0 lit=substrate|lid|die|cores" — a PART (PARTS.md): chip.js's desktop
// processor on its own, 3.75 × 3.75 × 0.45 cm, its origin the middle of its underside (place it at= a cpusocket's
// `seat`). The green substrate with the gold pin-1 triangle and a row of tiny capacitors along two edges; the nickel
// heat spreader (the lid: a flange and a raised top printed CPU) glued on with a bead of sealant; under it the dark
// silicon die on a bed of thermal paste, its eight cores in two rows of four with the shared cache between and the
// I/O strip at its end. lid 0 → 1 lifts the lid straight up 2 cm and slides it back off, so the die shows; run=1
// lights the cores in turn (they take turns as work arrives). set({ lid, run }). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K;
  const SUB = 18.75, ZT = 1.2, LID = { base: 16.5, top: 14, z1: 2.4, z2: 4.5 }, DIE = { x: 6.2, y: 8, z: ZT + 0.7 }, LIFT = 20, SLIDE = 18;

  ISO.add({
    name: "cpuchip", title: "Processor chip (part)", compare: null,
    about: "A desktop processor: green substrate with edge capacitors, the metal heat spreader lid printed CPU, and under it the silicon die with eight cores and the cache on thermal paste; the lid lifts off and the cores light. anchors: top die",
    line: "cpuchip cx cy k lid=0..1 run=0|1 lab=0 lit=substrate|lid|die|cores",
    demo: { line: "cpuchip 480 330 60 lab=1", script: [{ set: {}, hold: 1 }, { set: { lid: 1, lit: "lid" }, hold: "settle" }, { set: { run: 1, lit: "cores" }, hold: 3 }, { set: { lid: 0, run: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), T = TECH, lab = o.lab === "1";
      const tv = K.towardViewer(Pm), fl = Math.hypot(tv[0], tv[1]) || 1, FAR = [-tv[0] / fl, -tv[1] / fl];
      const box = (x, y, z, tone, c) => T.box(Pm, x, y, z, tone, c), out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -SUB, y: -SUB, w: 2 * SUB, d: 2 * SUB, r: 1 }, 0, ZT, Pm)}"/>`);
      // the substrate, its pin-1 triangle, the sealant bead the lid sits in, the edge capacitors (far to near)
      const sub = [box([-SUB, SUB], [-SUB, SUB], [0, ZT], "mid", T.C.pcb)];
      sub.push(T.quad(Pm, [[-SUB + 1, -SUB + 1, ZT + 0.01], [-SUB + 4, -SUB + 1, ZT + 0.01], [-SUB + 1, -SUB + 4, ZT + 0.01]], "#e0bf66", "#6b4f0e", 0.5));
      sub.push(`<path data-free d="${K.planOutline({ x: -LID.base + 0.4, y: -LID.base + 0.4, w: 2 * LID.base - 0.8, d: 2 * LID.base - 0.8, r: 0.8 }, ZT + 0.01, Pm, 3)}" fill="none" stroke="#3a4a36" stroke-width="${(K.cameraOf(Pm).k * 0.5).toFixed(2)}" opacity=".55"/>`);
      const ec = [];
      for (let i = -4; i <= 4; i++) ec.push([i * 3, -SUB + 1.3], [i * 3, SUB - 1.3]);
      ec.sort((a, b) => K.depthOf([...a, 0], Pm) - K.depthOf([...b, 0], Pm));
      for (const [x, y] of ec) sub.push(T.box(Pm, [x - 0.5, x + 0.5], [y - 0.8, y + 0.8], [ZT, ZT + 0.6], "mid", T.C.paper) + T.box(Pm, [x - 0.5, x + 0.5], [y - 0.8, y - 0.5], [ZT, ZT + 0.62], "mid", T.C.steel) + T.box(Pm, [x - 0.5, x + 0.5], [y + 0.5, y + 0.8], [ZT, ZT + 0.62], "mid", T.C.steel));
      out.push(`<g data-name="substrate">${sub.join("")}</g>`);
      // the die on its paste bed, then the cores (rebuilt when they light)
      out.push(`<g data-name="die">${box([-DIE.x - 0.5, DIE.x + 0.5], [-DIE.y - 0.5, DIE.y + 0.5], [ZT, ZT + 0.2], "lo", T.C.white)}${box([-DIE.x, DIE.x], [-DIE.y, DIE.y], [ZT + 0.2, DIE.z], "hi", T.C.chip)}</g>`);
      out.push(`<g data-name="cores"></g>`);
      // the lid: flange, raised top, the word CPU and two printed code lines (no maker's name)
      const lid = [box([-LID.base, LID.base], [-LID.base, LID.base], [ZT, LID.z1], "mid", T.C.steel), box([-LID.top, LID.top], [-LID.top, LID.top], [LID.z1, LID.z2], "hi", T.C.steel)];
      lid.push(T.flat(Pm, [0, 0, LID.z2 + 0.01], [1, 0, 0], [0, 1, 0], T.text(0, 1.5, "CPU", 6.5, "#4a5058", "middle", 800) +
        `<path data-free d="M-8 6.5H8M-6 9H6" stroke="#7a8088" stroke-width=".7" stroke-linecap="round"/>`));
      out.push(`<g data-name="lid">${lid.join("")}</g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { lid: q("lid"), cores: q("cores"), words: q("words") }, w = ISO.writer();
      // eight cores in two rows of four and the cache between, flat on the die; a working core glows amber
      const coresSvg = (phase) => {
        const z = DIE.z + 0.01, s = [], cw = (2 * DIE.x - 1.6) / 2, ch = (2 * DIE.y - 3.4) / 4;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
          const x0 = c ? DIE.x - 0.6 - cw * 0.78 : -DIE.x + 0.6, y0 = -DIE.y + 0.8 + r * (ch + 0.4), on = phase >= 0 && (r * 2 + c + phase) % 3 !== 0;
          s.push(T.quad(Pm, [[x0, y0, z], [x0 + cw * 0.78, y0, z], [x0 + cw * 0.78, y0 + ch, z], [x0, y0 + ch, z]], on ? "#f6ad48" : "#4b5058", on ? "#8a4a08" : "#6b7078", 0.4));
        }
        const cx0 = -DIE.x + 0.6 + cw * 0.78 + 0.5, cx1 = DIE.x - 0.6 - cw * 0.78 - 0.5;
        s.push(T.quad(Pm, [[cx0, -DIE.y + 0.8, z], [cx1, -DIE.y + 0.8, z], [cx1, DIE.y - 2.4, z], [cx0, DIE.y - 2.4, z]], "#6d737c", "#8d9399", 0.4));
        s.push(T.quad(Pm, [[-DIE.x + 0.6, DIE.y - 1.8, z], [DIE.x - 0.6, DIE.y - 1.8, z], [DIE.x - 0.6, DIE.y - 0.6, z], [-DIE.x + 0.6, DIE.y - 0.6, z]], "#585e66", "#7a8088", 0.4));
        return s.join("");
      };
      const st = { lid: B37.num(o, "lid", 0, 0, 1), run: o.run === "1", lit: o.lit || "" }, s = { lid: st.lid, ph: 0 };
      const draw = () => {
        const a = s.lid, up = ISO.smooth(0, 0.6, a), off = ISO.smooth(0.35, 1, a);
        w.attr(el.lid, "transform", K.translateAlong(Pm, [FAR[0] * off * SLIDE, FAR[1] * off * SLIDE, up * LIFT]));
        const phase = st.run ? Math.floor(s.ph * 3) % 3 : -1;
        w.rebuild(el.cores, String(phase), () => coresSvg(phase));
        w.rebuild(el.words, lab ? String(off > 0.5) : "", () => !lab ? "" : off > 0.5
          ? T.word(Pm, [DIE.x, -DIE.y, DIE.z], "silicon die: 8 cores + cache", { anchor: "start", dx: 14, dy: 4, color: "#1f4f8f" })
          : T.word(Pm, [SUB, -SUB, ZT], "processor", { anchor: "start", dx: 10, dy: 4 }));
        B37.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.lid !== undefined) st.lid = B37.num(p, "lid", st.lid, 0, 1);
        if (p.run !== undefined) st.run = String(p.run) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // a hand lifts the lid at a steady pace; the cores take turns
      g.update = (dt) => {
        const calm = ISO.still();
        s.lid = calm ? st.lid : s.lid + ISO.clamp(st.lid - s.lid, -dt * 0.6, dt * 0.6);
        if (!calm) s.ph = (s.ph + dt) % 100;
        draw();
        return s.lid !== st.lid;
      };
      g.readout = () => (s.lid > 0.9
        ? (st.run ? "running · 8 cores at up to 5 GHz, each doing billions of steps a second · the die is about 1.5 cm² with some 10 billion transistors" : "lid off · the die sits on thermal paste on the substrate, which fans its connections out to the pads underneath")
        : "processor · 3.75 cm square · the metal lid spreads the die's heat to the cooler");
      draw();
      g.anchors = { top: [0, 0, LID.z2 / 10], die: [0, 0, DIE.z / 10] };
      return g;
    },
  });
})();
