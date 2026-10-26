// "dimmstick cx cy k run=0|1 lab=0 lit=board|chips|contacts|spd|resistors|label" — a PART (PARTS.md, batch 6): a
// desktop memory stick (DIMM) 13.3 × 3.1 cm, standing upright on its contact edge, its board along x and its chip
// face toward +y, origin the middle of the bottom (contact) edge. From ram.js: a green board with eight black memory
// chips, the small settings (SPD) chip, a row of resistors, a printed label, 144 gold contacts a side along the bottom
// edge split by the off-centre key notch, and a notch in each end where the slot's latches hook. run=1 lights the
// chips one pair after another as data moves. For a stick in its slot use dimmslot (it carries its own stick).
// set({ run }). anchors: top notch
(() => {
  const K = window.K, T = window.TECH;
  ISO.add({
    name: "dimmstick", title: "Memory stick (part)", compare: null,
    about: "A desktop memory stick (DIMM) 13.3 × 3.1 cm: green board, eight black memory chips, settings chip, resistors, 144 gold contacts a side split by the off-centre key notch, latch notches at the ends; run=1 lights the chips as data moves. anchors: top notch",
    line: "dimmstick cx cy k run=0|1 lab=0 lit=board|chips|contacts|spd|resistors|label",
    demo: { line: "dimmstick 480 340 50 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "contacts" }, hold: 1.2 }, { set: { run: 1, lit: "chips" }, hold: 2.4 }, { set: { run: 0, lit: "" }, hold: 0.8 }] },
    make([cx = 480, cy = 340, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", D = B36.DIMM;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -D.HL / 10, y: -0.1, w: D.HL / 5, d: 0.3, r: 0.05 }, 0, D.PH / 10, P)}"/>${B36.stick(Pm)}<g data-part="words"></g>`;
      g.anchors = { top: [0, 0, D.PH / 10], notch: [D.NOTCH / 10, 0, 0] };
      const el = B36.parts(g), w = ISO.writer(), st = { run: o.run === "1", ph: 0, lit: o.lit || "" };
      if (lab) el.words.innerHTML = T.word(Pm, [-D.HL, D.TH, 18], "memory chips", { anchor: "end", dx: -10 }) + T.word(Pm, [D.NOTCH, D.TH, 0], "key notch", { dy: 16, color: "#1f4f8f" }) + T.word(Pm, [D.HL, D.TH, 2], "gold contacts", { anchor: "start", dx: 10 });
      const draw = () => {
        const lit = st.run ? Math.floor(st.ph * 6) % 8 : -1;
        w.rebuild(el.chips, String(lit), () => B36.chips(Pm, lit));
        B36.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.run !== undefined) st.run = String(p.run) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => { st.ph = (st.ph + dt) % 100; draw(); return st.run; };
      g.readout = () => (st.run ? "data moving · each chip holds 2 GB in billions of tiny charge cells, lost when the power goes off" : "16 GB DDR5 memory stick · 288 contacts (144 a side) · the key notch is off centre, so it fits one way round");
      draw();
      return g;
    },
  });
})();
