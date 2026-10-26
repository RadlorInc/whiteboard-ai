// "concretepad cx cy k w=100..600 d=100..500 lab=0 lit=slab|joints" — a PART (PARTS.md, batch 6): a concrete floor
// slab 15 cm thick, 400 × 300 cm by default, for a robot cell or a cell-tower equipment compound; origin the ground
// point under its middle, top at z = 15 (anchor top: where things stand). Its near cut edges show the stones in the
// concrete; saw-cut joints split the top into bays about 150 cm square (each joint runs edge to edge); a faint
// broom-finish texture. Static. anchors: top
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const TH = 15, CON = ISO.tint("#dcdad5", ["#a3a19b", "#afada7", "#bbb9b3", "#c7c5bf"], "#5f5d58");
  // a cheap repeatable scatter (no Math.random: the same slab every build)
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  ISO.add({
    name: "concretepad", title: "Concrete slab (part)", compare: null,
    about: "A concrete floor slab 15 cm thick (400 × 300 cm unless w= d= say), saw-cut joints and a cut edge showing its stones; robots, cabinets and towers stand on its top. anchors: top",
    line: "concretepad cx cy k w=100..600 d=100..500 lab=0 lit=slab|joints",
    demo: { line: "concretepad 480 300 1.2 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "joints" }, hold: 1.2 }, { set: { lit: "slab" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 1], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const W = B36.num(o, "w", 400, 100, 600), D = B36.num(o, "d", 300, 100, 500), X = -W / 2, Y = -D / 2;
      const plan = { x: X, y: Y, w: W, d: D, r: 0 }, at = (x, y, z) => K.iso([x, y, z], P), out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf(plan, 0, TH, P)}"/>`);
      out.push(`<g data-name="slab">${ISO.tinted(CON, S(K.slabOf(plan, 0, TH, P, 1), { tone: "mid" }))}`);
      // stones on the two near cut faces (x = X + W and y = Y + D, the faces the camera sees), small closed blobs
      const stones = [];
      const blob = (p, r) => K.pathOf([0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; return at(p[0] + (p[3] ? 0 : Math.cos(a) * r), p[1] + (p[3] ? Math.cos(a) * r : 0), p[2] + Math.sin(a) * r * 0.7); }), true);
      const nx = Math.round(W / 9), ny = Math.round(D / 9);
      for (let i = 0; i < nx; i++) stones.push(blob([X + 4 + (W - 8) * rnd(i), Y + D + 0.05, 2.5 + 10 * rnd(i + 99), 0], 0.8 + rnd(i + 7) * 1.3));
      for (let i = 0; i < ny; i++) stones.push(blob([X + W + 0.05, Y + 4 + (D - 8) * rnd(i + 300), 2.5 + 10 * rnd(i + 400), 1], 0.8 + rnd(i + 500) * 1.3));
      out.push(`<path d="${stones.join("")}" fill="#9a978f" fill-opacity=".55" stroke="#7d7a73" stroke-width=".4"/>`);
      // broom finish: short faint strokes on the top, each a printed mark
      const br = [];
      for (let i = 0; i < Math.round((W * D) / 900); i++) { const x = X + 6 + (W - 12) * rnd(i + 900), y = Y + 6 + (D - 12) * rnd(i + 1900); br.push(K.pathOf([at(x - 3, y, TH + 0.01), at(x + 3, y, TH + 0.01)])); }
      out.push(`<path data-free d="${br.join("")}" stroke="#b3b1ab" stroke-width=".5"/></g>`);
      // saw-cut joints: bays about 150 cm, every joint from edge to edge and down a little into each near cut face
      const jx = Math.max(1, Math.round(W / 150)), jy = Math.max(1, Math.round(D / 150)), J = [];
      for (let i = 1; i < jx; i++) { const x = X + (W * i) / jx; J.push(K.pathOf([at(x, Y, TH), at(x, Y + D, TH), at(x, Y + D, TH - 2.5)])); }
      for (let i = 1; i < jy; i++) { const y = Y + (D * i) / jy; J.push(K.pathOf([at(X, y, TH), at(X + W, y, TH), at(X + W, y, TH - 2.5)])); }
      out.push(`<g data-name="joints"><path d="${J.join("")}" fill="none" stroke="#6f6d68" stroke-width="${Math.max(0.6, k * 0.8).toFixed(2)}"/></g>`);
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      if (lab) g.querySelector('[data-part="words"]').innerHTML = B36.word(P, [X + W, Y + D, TH], `concrete slab ${(W / 100).toFixed(1)} × ${(D / 100).toFixed(1)} m, 15 cm thick`, { dy: 18 });
      g.anchors = { top: [0, 0, TH] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B36.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `concrete slab ${(W / 100).toFixed(1)} × ${(D / 100).toFixed(1)} m × 15 cm · about ${((W * D * TH) / 1e6 * 2.4).toFixed(1)} tonnes`;
      B36.light(w, g, lit);
      return g;
    },
  });
})();
