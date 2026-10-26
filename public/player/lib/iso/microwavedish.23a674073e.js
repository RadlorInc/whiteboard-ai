// "microwavedish cx cy k deg=0..360 lab=0 lit=dish|arm|pipe" — a PART (batch 6): celltower.js's microwave link dish
// at real size: a 60 cm shallow grey reflector shell under a white fabric radome cover held by eight clips round its
// rim, the round outdoor radio unit (ODU) on its back, on a short arm and an elevation strut from a clamp on a 7.6 cm
// mount pipe (70 cm of it shown). It links the mast to the next site by a narrow beam. deg = the bearing it faces
// (0 = +x, 90 = +y). Origin: the pipe's axis at the dish's height (where it is clamped to a mast). Static.
// World: 1 = 1 cm. anchors: top (the pipe's top), face (the radome's middle).
(() => {
  const K = window.K;
  ISO.add({
    name: "microwavedish", title: "Microwave link dish (part)", compare: null,
    about: "A 60 cm microwave link dish: grey shell with a white radome cover, the radio unit on its back, on an arm from a mount pipe; it carries the mast's calls to the network on a narrow beam. anchors: top face",
    line: "microwavedish cx cy k deg=0..360 lab=0 lit=dish|arm|pipe",
    demo: { line: "microwavedish 470 280 4.6 deg=10", script: [{ set: {}, hold: 1 }, { set: { lit: "dish" }, hold: 1.2 }, { set: { lit: "arm" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const a = (B31.num(o, "deg", 40, 0, 360) * Math.PI) / 180, n = [Math.cos(a), Math.sin(a), 0];
      const items = B31.dishItems(P, [0, 0, 0], n);
      items[0].name = "pipe"; items[1].name = "arm";
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -20, y: -20, w: 40, d: 40, r: 20 }, -40, 0.1, P)}"/><g data-part="body"></g>` +
        (lab ? ISO.word(K.iso([41 * n[0], 41 * n[1], 34], P), "microwave link dish", "#444", { size: 13 }) : "");
      // the shell, the radome and the radio unit are each a build slice of their own (ISO.later)
      B31.place(g.querySelector('[data-part="body"]'), items);
      g.anchors = { top: [0, 0, 30], face: [41 * n[0], 41 * n[1], 0] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B31.light(w, g, lit); } };
      ISO.later(() => B31.light(w, g, lit));
      g.update = () => false;
      g.readout = () => "microwave link dish · 60 cm across, white radome over the reflector, radio unit on its back · a narrow beam to the next site, a few km away";
      B31.light(w, g, o.lit || "");
      return g;
    },
  });
})();
