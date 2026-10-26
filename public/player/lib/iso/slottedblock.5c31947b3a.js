// "slottedblock cx cy k curve=concave|convex R=10..18 lab=0 lit=block|screws" — a PART (PARTS.md, batch 5): the
// curved-mirror scene's holder, a beech block 8 × 2 × 2 cm lying on the bench along y, origin the bench point under its
// middle. A slot 2.5 mm wide and 1 cm deep is sawn along its top on a circle of radius R cm, so a mirror strip (8 cm
// wide) stands in it bent to that curve: curve=concave bows its ends toward +x (the strip's mirror face, toward a
// light coming along −x, is concave), convex toward −x. Two slot-head screws in its top behind the slot clamp the
// strip; eased edges, long grain on the top and side, rings on the end grain. Static. World: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const HX = 1, HY = 4, H = 2, C = 0.12, SW = 0.125, DEPTH = 1;
  const BEECH = ISO.tint("#f6e3c4", ["#d2a46c", "#dbb37f", "#e3c294", "#ebd0aa"], "#74511f"), GRAIN = "#b4844a";

  ISO.add({
    name: "slottedblock", title: "Slotted block (part)", compare: null,
    about: "An 8 × 2 × 2 cm wooden block with a curved slot sawn along its top, so a mirror strip stands in it bent concave or convex, clamped by two screws. anchors: slot top",
    line: "slottedblock cx cy k curve=concave|convex R=10..18 lab=0 lit=block|screws",
    demo: { line: "slottedblock 480 330 50 curve=concave R=14 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "block" }, hold: 1.5 }, { set: { lit: "screws" }, hold: 1.5 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const R = ISO.clamp(ISO.num(o, "R", 14), 10, 18), cave = o.curve !== "convex", sg = cave ? 1 : -1;
      const sag = (y) => R - Math.sqrt(R * R - y * y), mid = sag(HY) / 2;
      const xs = (y) => sg * (sag(y) - mid);   // the slot's middle line, centred on the block
      const at = (x, y, z) => K.iso([x, y, z], P), run = (pts) => K.pathOf(pts.map((p) => at(...p)));
      // the block: an eight-sided section (its long edges eased) run along y
      const sec = [[-HX + C, 0], [HX - C, 0], [HX, C], [HX, H - C], [HX - C, H], [-HX + C, H], [-HX, H - C], [-HX, C]], n = sec.length;
      const V = [...sec.map(([x, z]) => [x, -HY, z]), ...sec.map(([x, z]) => [x, HY, z])];
      const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => i + n), ...sec.map((_, i) => [i, (i + 1) % n, ((i + 1) % n) + n, i + n])];
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX - 0.3, y: -HY - 0.3, w: 2 * HX + 0.6, d: 2 * HY + 0.6, r: 0.4 }, 0, 0.2, P)}"/>`, ISO.tinted(BEECH, ISO.poly(V, F, P, "mid"))];
      // grain: long lines on the top (clear of the slot) and on the near side, each from end to end
      const grain = [];
      for (const [x, a] of [[-0.82, 0.03], [-0.62, -0.04], [0.66, 0.04], [0.84, -0.03]]) grain.push(run(Array.from({ length: 9 }, (_, i) => [x + a * Math.sin(i * 1.3), -HY + 0.02 + ((2 * HY - 0.04) * i) / 8, H + 0.005])));
      for (const [z, a] of [[0.55, 0.04], [1.3, -0.05]]) grain.push(run(Array.from({ length: 9 }, (_, i) => [HX + 0.005, -HY + 0.02 + ((2 * HY - 0.04) * i) / 8, z + a * Math.sin(i * 1.1 + 1)])));
      // growth rings on the near end grain (y = +HY), arcs that stay on the face
      const rings = [];
      for (const r of [0.6, 1.1, 1.6]) {
        const pts = [];
        for (let i = 0; i <= 24; i++) { const q = Math.PI * (0.05 + (0.9 * i) / 24), x = -0.7 + Math.cos(q) * r, z = -0.5 + Math.sin(q) * r; if (Math.abs(x) < HX - C && z > C && z < H - C) pts.push([x, HY + 0.005, z]); }
        if (pts.length > 1) rings.push(run(pts));
      }
      out.push(`<path d="${grain.join("")}${rings.join("")}" fill="none" stroke="${GRAIN}" stroke-width="0.6" stroke-linecap="round" data-free=""/>`);
      // the slot: its opening on the top (dark, the far wall faintly lit), and where it comes out of the near end
      const edge = (off, z) => Array.from({ length: 25 }, (_, i) => { const y = -HY + (2 * HY * i) / 24; return [xs(y) + off, y, z]; });
      const open = [...edge(-SW, H + 0.01), ...edge(SW, H + 0.01).reverse()];
      const wall = [...edge(-SW, H + 0.015), ...edge(-SW * 0.25, H + 0.015).reverse()];
      const endX = xs(HY), notch = [[endX - SW, HY + 0.01, H], [endX + SW, HY + 0.01, H], [endX + SW, HY + 0.01, H - DEPTH], [endX - SW, HY + 0.01, H - DEPTH]];
      out.push(`<path d="${K.pathOf(open.map((p) => at(...p)), true)}" fill="#3b2a17" stroke="#5a3f20" stroke-width="0.5"/>`,
        `<path d="${K.pathOf(wall.map((p) => at(...p)), true)}" fill="#7a5530" opacity=".7"/>`,
        `<path d="${K.pathOf(notch.map((p) => at(...p)), true)}" fill="#3b2a17" stroke="#5a3f20" stroke-width="0.5"/>`);
      // two slot-head screws behind the slot (toward −x), their slots turned at random-looking angles
      const screws = [-2.6, 2.6].map((y, i) => {
        const x = -0.62 + (cave ? -0.05 : 0.05), r = 0.27, a = i ? 0.9 : 2.1;
        return ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, r, H, 0.09, P, 18, 0.03), { tone: "hi" })) +
          `<path d="${K.segment([x - Math.cos(a) * r * 0.75, y - Math.sin(a) * r * 0.75, H + 0.1], [x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75, H + 0.1], P)}" stroke="#3c3f45" stroke-width="${Math.max(0.4, k * 0.05).toFixed(2)}" stroke-linecap="butt"/>`;
      });
      g.innerHTML = `<g data-name="block">${out.join("")}</g><g data-name="screws">${screws.join("")}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(at(HX, HY, H + 0.4), `slotted block (${cave ? "concave" : "convex"}, R = ${R} cm)`, "#445", { size: 14, anchor: "start" });
      // slot: the floor of the slot at its middle (the strip's lowest middle point, its vertex); top: the block's top
      g.anchors = { slot: [+xs(0).toFixed(3), 0, H - DEPTH], top: [0, 0, H] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B11.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `beech block 8 × 2 × 2 cm · slot 1 cm deep on a circle of R = ${R} cm: holds the strip ${cave ? "concave" : "convex"} toward +x, f = R/2 = ${R / 2} cm`;
      B11.light(w, g, lit);
      return g;
    },
  });
})();
