// "cashdrawer cx cy k out=0..1 notes=0..10 lab=0 lit=housing|drawer|notes|coins" — a PART (batch 6, money): a till
// cash drawer on its own, 41 × 42 × 10 cm, standing on a counter or a shelf, its origin the surface point under its
// middle, its front toward the room (+y). A black steel housing, and inside it a drawer on rails: a black insert with
// five note slots at the back (5, 10, 20, 50, 100), each with a chrome spring clip lying on its notes, eight round coin
// cups along the front with a few coins in each, and a front panel with a key lock and a finger pull underneath.
// out slides the drawer out (0 shut, 1 open about 30 cm); notes = how many notes lie in each slot (the float or the
// takings to count). set({ out, notes }). World: 1 = 1 cm. anchors: top front
(() => {
  const K = window.K;
  const W = 41, D = 42, H = 10;
  ISO.add({
    name: "cashdrawer", title: "Till cash drawer (part)", compare: null,
    about: "A till cash drawer 41 × 42 × 10 cm: steel housing, a drawer on rails with five note slots under spring clips and eight coin cups; out slides it open, notes sets how many notes lie in each slot (the float or the takings). anchors: top front",
    line: "cashdrawer cx cy k out=0..1 notes=0..10 lab=0 lit=housing|drawer|notes|coins",
    demo: { line: "cashdrawer 480 300 9 out=0 notes=3 lab=1", script: [{ set: {}, hold: 1 }, { set: { out: 1, lit: "drawer" }, hold: "settle" }, { set: { notes: 8, lit: "notes" }, hold: 1.5 }, { set: { notes: 0, lit: "coins" }, hold: 1.5 }, { set: { out: 0.4, notes: 5, lit: "housing" }, hold: "settle" }, { set: { out: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { out: B.num(o, "out", 0, 0, 1), notes: Math.round(B.num(o, "notes", 3, 0, 10)), lit: o.lit || "" };
      st.want = st.out;
      const dr = B.drawer(P, W, D, H);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -W / 2 - 1, y: -D / 2 - 1, w: W + 2, d: D + 2 + dr.travel, r: 1 }, 0, 0.1, P)}"/>` +
        `<g data-name="housing">${dr.back}</g><g data-part="tray"></g><g data-name="housing">${dr.fore}</g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H], front: [0, D / 2 + 1, H / 2] };
      const el = LAB.parts(g), w = ISO.writer(), o0 = K.iso([0, 0, 0], P), o1 = K.iso([0, 1, 0], P);
      const draw = () => {
        w.rebuild(el.tray, String(st.notes), () => dr.tray(st.notes));
        const s = st.out * dr.travel;
        w.attr(el.tray, "transform", `translate(${((o1[0] - o0[0]) * s).toFixed(2)} ${((o1[1] - o0[1]) * s).toFixed(2)})`);
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([W / 2 + 1, -D / 2, H + 2], P), "cash drawer", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.out !== undefined) st.want = B.num(p, "out", st.want, 0, 1);
        if (p.notes !== undefined) st.notes = Math.round(B.num(p, "notes", st.notes, 0, 10));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.out = ISO.follow(st.out, st.want, dt, 0.3, ISO.still());
        if (Math.abs(st.out - st.want) < 0.002) st.out = st.want;
        draw();
        return st.out !== st.want;
      };
      g.readout = () => `cash drawer · ${st.want > 0.05 ? "open" : "shut"} · ${st.notes} notes in each of 5 slots (${B.VALUES.join(", ")}) = ${st.notes * B.VALUES.reduce((a, b) => a + b, 0)} in notes`;
      draw();
      return g;
    },
  });
})();
