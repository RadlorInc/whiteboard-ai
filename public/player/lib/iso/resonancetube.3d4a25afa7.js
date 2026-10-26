// "resonancetube cx cy k L=5..55 lab=0 lit=tube|scale|water" — a PART (PARTS.md, batch 5): the glass resonance tube
// of resonance.js, open at both ends, 60 cm long and 3 cm across (1.5 mm wall), standing in a tall jar of water. Origin:
// the point on its axis at the water surface (place it at= a talljar's `water` anchor; a retortstand's clamp holds it).
// L = the air column above the water (cm): the tube's top stands L over the origin, its foot 60 − L under water, the
// water inside it level with the jar's. A scale is printed down the tube from 0 at the top, so the waterline reads L.
// The column is closed at the water and open at the top, so its own notes are f = v/(4(L + e)) and 3v/(4(L + e))
// (v = 343 m/s, end correction e = 0.6r = 0.9 cm): with a 512 Hz fork it resonates at L = 15.9 cm and 49.4 cm.
// set({ L }) slides the tube (eased). Built in mm (ISO.mm, LAB.vessel) once at L = 30 and slid by a transform;
// anchors in cm: top foot.
(() => {
  const K = window.K, G = window.G;
  const R = 15, LEN = 600, WALL = 1.5, L0 = 300, V = 343, F = 512, E = 0.6 * (R / 10);
  const note = (Lcm) => V / (4 * ((Lcm + E) / 100));
  const near = (Lcm) => Math.min(...[1, 3].map((n) => Math.abs((n * note(Lcm)) / F - 1)));

  ISO.add({
    name: "resonancetube", title: "Resonance tube (part)", compare: null,
    about: "A glass tube 60 cm long, open at both ends, standing in a jar of water; sliding it sets the air column L above the water, whose own note v/4(L + e) rings with a 512 Hz fork at L = 15.9 cm. anchors: top foot",
    line: "resonancetube cx cy k L=5..55 lab=0 lit=tube|scale|water",
    demo: { line: "resonancetube 480 310 4 L=10", script: [{ set: { L: 10 }, hold: 1 }, { set: { L: 15.9, lit: "scale" }, hold: "settle" }, { set: { L: 40, lit: "tube" }, hold: "settle" }, { set: { L: 49.4, lit: "water" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { L: ISO.clamp(ISO.num(o, "L", 12), 5, 55) * 10 }, want = { L: st.L };
      let lit = o.lit || "";
      const bot0 = L0 - LEN, Vt = LAB.vessel(Pm, [0, 0, bot0], [[0, R], [LEN, R]], { wall: WALL, base: 0 });
      // the printed scale: a rule down the near wall, a tick every cm (longer every 5, numbered every 10) from 0 at the top
      const scale = () => {
        const side = -0.35, u = G.mul3(G.tangentOf(Vt.F, Vt.facing + side), -1), out = [Vt.scale(LEN - 550, LEN, 10, 5, { side, len: [2.2, 4.2] })];
        for (let n = 0; n <= 50; n += 10) out.push(LAB.faceText(Pm, G.pointOf(Vt.F, LEN - n * 10 - 1.2, R + 0.3, Vt.facing + side + 0.42), u, String(n), 4.2, "#2f4a5e"));
        out.push(LAB.faceText(Pm, G.pointOf(Vt.F, LEN - 562, R + 0.3, Vt.facing + side + 0.3), u, "cm", 3.6, "#2f4a5e"));
        return out.join("");
      };
      // the foot's rim and the top's rim: fire-polished, a little thicker
      const rims = `<path d="${G.circleOf(Vt.F, 0, R, Pm)}" fill="none" stroke="${LAB.GLASS}" stroke-width="1" opacity=".75"/>` +
        `<path d="${G.arcOf(Vt.F, LEN, R - WALL, Pm, { inward: true })}" fill="none" stroke="${LAB.GLASS}" stroke-width="0.8"/>`;
      g.innerHTML = `<g data-part="slide"><g data-name="tube">${Vt.back()}</g><g data-name="water" data-part="water"></g><g data-name="tube">${rims}${Vt.front()}</g>` +
        `<g data-name="scale" style="paint-order:stroke">${scale()}</g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const Lq = Math.round(st.L * 2) / 2, dz = Lq - L0;
        w.attr(el.slide, "transform", K.translateAlong(Pm, [0, 0, dz]));
        // the water inside, up to the jar's surface: world z 0 is s = LEN − L in the tube's own (built) frame
        w.rebuild(el.water, String(Lq), () => Vt.liquid(LEN - Lq, "clear", { opacity: 0.6, from: 1 }));
        g.anchors = { top: [0, 0, Lq / 10], foot: [0, 0, (Lq - LEN) / 10] };
        if (lab) w.rebuild(el.words, String(Math.round(Lq)), () => LAB.word(Pm, lab, [-R - 10, 0, Lq / 2], `L = ${(Lq / 10).toFixed(1)} cm`, "#333", { anchor: "end", size: 14 }) + LAB.word(Pm, lab, [0, 0, Lq + 24], "resonance tube", "#556"));
        B27.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.L !== undefined && Number.isFinite(+p.L)) want.L = ISO.clamp(+p.L, 5, 55) * 10;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.L = ISO.follow(st.L, want.L, dt, 0.5, ISO.still());
        if (Math.abs(st.L - want.L) < 0.2) st.L = want.L;
        draw();
        return st.L !== want.L;
      };
      g.readout = () => {
        const Lc = st.L / 10, f1 = note(Lc);
        return `air column L = ${Lc.toFixed(1)} cm · its notes ${f1.toFixed(0)} Hz and ${(3 * f1).toFixed(0)} Hz · ${near(Lc) < 0.03 ? "one matches a 512 Hz fork: resonance" : "no match with 512 Hz"} · resonance at λ/4 − e = 15.9 cm and 3λ/4 − e = 49.4 cm`;
      };
      draw();
      return g;
    },
  });
})();
