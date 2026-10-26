// "cashnote cx cy k value=1..100 fold=0..1 lab=0 lit=left|right" — a PART (batch 6, money): one generic paper banknote
// lying flat on a table, its origin the table point under its middle. 15 × 7 cm, paper 0.1 mm thick: a printed border
// of small diamonds, wavy guilloche lines across the middle, a round watermark window with a plain leaf, a dashed
// security thread, the value big in one corner and small in the other (no faces, no real currency, no brand). Its
// colour follows the value (under 5 amber, under 20 green, under 50 blue, else violet). The back has a geometric
// rosette and the value. fold 0 → 1 folds the right half up about the middle line and over onto the left half (its
// back then shows). set({ value, fold }). World: 1 = 1 cm. anchors: top (its middle, where another note lands)
(() => {
  const K = window.K, G = window.G;
  const W = 15, H = 7, HW = W / 2, HH = H / 2;
  let uid = 0;
  ISO.add({
    name: "cashnote", title: "Banknote (part)", compare: null,
    about: "One generic paper banknote, 15 × 7 cm: border pattern, a big plain number, a leaf in a round window, a security thread, no faces or real design; fold folds it in half. anchors: top",
    line: "cashnote cx cy k value=1..100 fold=0..1 lab=0 lit=left|right",
    demo: { line: "cashnote 480 300 40 value=20 lab=1", script: [{ set: {}, hold: 1 }, { set: { fold: 0.5, lit: "right" }, hold: "settle" }, { set: { fold: 1, lit: "" }, hold: "settle" }, { set: { fold: 0, value: 50, lit: "left" }, hold: "settle" }, { set: { value: 5, lit: "" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { value: Math.round(B.num(o, "value", 10, 1, 100)), fold: B.num(o, "fold", 0, 0, 1), lit: o.lit || "" };
      st.want = st.fold;
      const id = "b41n" + uid++, view = G.viewOf(P);
      const half = (side, x0) => `<clipPath id="${id}${side}"><rect x="${x0}" y="0" width="${HW}" height="${H}"/></clipPath><g clip-path="url(#${id}${side})" data-part="art${side}"></g>`;
      g.innerHTML = `<path class="iso-halo" data-part="halo"/>` +
        `<g data-name="left"><g transform="${B.plane(P, [-HW, -HH, 0], [1, 0, 0], [0, 1, 0])}">${half("L", 0)}</g></g>` +
        `<g data-name="right"><g data-part="rf">${half("R", HW)}</g><g data-part="rb">${half("B", 0)}</g></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, 0.01] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const a = Math.round(st.fold * 300) / 300 * Math.PI, ur = [Math.cos(a), 0, Math.sin(a)], lift = 0.02 * st.fold;
        const front = -Math.sin(a) * view[0] + Math.cos(a) * view[2] > 0;
        w.rebuild(el.artL, `${st.value}`, () => B.note(W, H, st.value));
        w.rebuild(el.artR, `${st.value}`, () => B.note(W, H, st.value));
        w.rebuild(el.artB, `${st.value}`, () => B.note(W, H, st.value, true));
        // the folding half: its front (art x 7.5..15) from the hinge out, or its back seen from the other side
        const hinge = [0, -HH, lift];
        w.attr(el.rf, "transform", B.plane(P, B.add(hinge, ur, -HW), ur, [0, 1, 0]));
        w.attr(el.rb, "transform", B.plane(P, B.add(hinge, ur, HW), ur.map((q) => -q), [0, 1, 0]));
        w.shown(el.rf, front); w.shown(el.rb, !front);
        const reach = Math.max(0, HW * Math.cos(a));   // how far the folding half still reaches out along x
        w.attr(el.halo, "d", K.haloOf({ x: -HW, y: -HH, w: HW + reach, d: H, r: 0.3 }, 0, 0.02 + HW * Math.sin(a) * 0.2, P));
        if (lab) w.rebuild(el.words, `${st.want > 0.5} ${st.value}`, () => ISO.word(K.iso([HW * (st.want >= 0.5 ? 0 : 1) + 0.6, 0, 0], P), `note of ${st.value}${st.want > 0.5 ? ", folded" : ""}`, "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.value !== undefined) st.value = Math.round(B.num(p, "value", st.value, 1, 100));
        if (p.fold !== undefined) st.want = B.num(p, "fold", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.fold = ISO.follow(st.fold, st.want, dt, 0.3, ISO.still());
        if (Math.abs(st.fold - st.want) < 0.002) st.fold = st.want;
        draw();
        return st.fold !== st.want;
      };
      g.readout = () => `banknote of ${st.value} · ${st.want < 0.05 ? "flat" : st.want > 0.95 ? "folded in half" : "folding"} · 15 × 7 cm`;
      draw();
      return g;
    },
  });
})();
