// "woodsupport cx cy k lab=0 lit=block" — a PART (PARTS.md, batch 5): a small pine support block, 4 cm wide (y) and
// 4 cm tall, 1 cm thick along x, with a round notch 1.1 cm across cut in its top and its top corners chamfered, so a
// 1 cm rod or bolt lying along x rests in it (two of them hold an electromagnet's bolt clear of the bench). Origin: the
// bench point under its middle. Anchor cradle: the axis of a 1 cm rod resting in the notch (ironbolt at=<this>.cradle
// with ax= to slide the bolt along). Static. World: 1 = 1 cm, from the electromagnet scene's supports.
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s);
  const HY = 2, H = 4, HX = 0.5, NR = 0.55, CH = 0.5;
  // the end profile in (y, z): up the far side, the chamfer, across to the notch, round it, out and down the near side
  const notch = Array.from({ length: 13 }, (_, i) => { const a = Math.PI + (i / 12) * Math.PI; return [Math.cos(a) * NR, H + Math.sin(a) * NR]; });
  const SIDE = [[-HY, 0], [HY, 0], [HY, H - CH], [HY - CH, H], ...notch.slice().reverse(), [-HY + CH, H], [-HY, H - CH]];

  ISO.add({
    name: "woodsupport", title: "Wooden support block (part)", compare: null,
    about: "A small pine block 4 cm wide and 4 cm tall with a round notch in its top, so a 1 cm bolt or rod lying along x rests in it; two of them hold an electromagnet's bolt above the bench. anchors: cradle",
    line: "woodsupport cx cy k lab=0 lit=block",
    demo: { line: "woodsupport 480 360 60", script: [{ set: {}, hold: 1 }, { set: { lit: "block" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const at = (x, y, z) => K.iso([x, y, z], P);
      // pine grain on the near end face: rings round a heart below the block, each cut where it meets the edges
      const rings = [];
      for (let r = 1.2; r < 4.6; r += 0.45) {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const a = Math.PI * 0.08 + (i / 40) * Math.PI * 0.84, y = 0.7 + Math.cos(a) * r * 1.3, z = -0.8 + Math.sin(a) * r;
          const inside = Math.abs(y) < HY - 0.05 && z > 0.05 && z < H - 0.05 && !(Math.hypot(y, z - H) < NR + 0.05) && z < H - CH + (HY - Math.abs(y)) - 0.05;
          if (inside) pts.push(at(HX + 0.01, y, z)); else if (pts.length) break;
        }
        if (pts.length > 3) rings.push(K.pathOf(pts));
      }
      // long grain on the top and the near side, along x
      const grain = [-1.5, -0.9, 0.9, 1.5].map((y) => K.pathOf([at(-HX + 0.05, y, Math.abs(y) > HY - CH ? H - CH + (HY - Math.abs(y)) + 0.01 : H + 0.01), at(HX - 0.05, y, Math.abs(y) > HY - CH ? H - CH + (HY - Math.abs(y)) + 0.01 : H + 0.01)])).join("") +
        [0.7, 1.5, 2.3, 3.1].map((z) => K.pathOf([at(-HX + 0.05, HY + 0.01, z), at(HX - 0.05, HY + 0.01, z)])).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.2 }, 0, H, P)}"/>` +
        `<g data-name="block">${ISO.prismX(P, SIDE, -HX, HX, ["#c99a5e", "#ead2a8"], "#f0dcb6", "#6e4a1e")}` +
        `<g style="opacity:.8">${L(rings.join(""), { tone: "faint", free: true })}${L(grain, { tone: "faint", free: true })}</g></g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = CIRC.word(P, [HX, HY, H], "wooden support");
      g.anchors = { cradle: [0, 0, H - NR + 0.5] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) lit = p.lit; B13.light(w, g, lit); };
      g.update = () => false;
      g.readout = () => "pine support block 4 × 4 × 1 cm · a 1.1 cm round notch holds a 1 cm bolt with its axis 3.95 cm above the bench";
      B13.light(w, g, lit);
      return g;
    },
  });
})();
