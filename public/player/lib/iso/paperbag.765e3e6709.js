// "paperbag cx cy k lab=0 lit=bag|handles|food" — a PART (batch 6, money): a brown paper shopping bag standing on the
// floor or a counter, 32 × 18 × 40 cm, its origin the surface point under its middle, a wide side toward the room (+y).
// Kraft paper with a folded-over top cuff, the side gussets with their middle crease and the bottom fold, two twisted
// paper handles glued inside the cuff (front and back), and the shopping peeking out of the open top: a baguette, a
// bunch of celery and an apple. What you carry home after paying. Static. World: 1 = 1 cm. anchors: top handle
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HX = 16, HY = 9, HZ = 38;
  const KRAFT = ISO.tint("#d8ad78", ["#9c6c38", "#ab7a44", "#bb8a52", "#c99a62"], "#5a3a16");
  const BREAD = ISO.tint("#e9b77a", ["#9a5a26", "#ad6b33", "#c07e43", "#d39556"], "#5e3412");
  const CELERY = ISO.tint("#d9ecb4", ["#8fb35a", "#a2c26c", "#b4d07f", "#c6dd96"], "#3e5a16");
  const APPLE = ISO.tint("#f08a7a", ["#a8281e", "#bb3428", "#cc4434", "#dc5a48"], "#5a120c");
  ISO.add({
    name: "paperbag", title: "Paper shopping bag (part)", compare: null,
    about: "A brown paper shopping bag 32 × 18 × 40 cm with a folded top, side gussets and twisted paper handles, a baguette, celery and an apple peeking out: what you carry home after paying. anchors: top handle",
    line: "paperbag cx cy k lab=0 lit=bag|handles|food",
    demo: { line: "paperbag 480 450 7.5 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "handles" }, hold: 1.2 }, { set: { lit: "food" }, hold: 1.2 }, { set: { lit: "bag" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), kS = G.scaleOf(P);
      const ix = HX - 0.25, iy = HY - 0.25, q = (pts, fill, stroke = "none", w = 0.6) => B.quad(P, pts, fill, stroke, w);
      // body, the cuff, the gusset creases on the near side (+x) and a glued seam on the front
      const body = ISO.tinted(KRAFT, ISO.wbox(P, [-HX, HX], [-HY, HY], [0, HZ], "mid") + ISO.wbox(P, [-HX - 0.15, HX + 0.15], [-HY - 0.15, HY + 0.15], [HZ - 3.5, HZ], "mid"));
      const crease = L(K.pathOf([K.iso([HX, 0, HZ - 3.5], P), K.iso([HX, 0, 7], P)]) + K.pathOf([K.iso([HX, -HY, 0], P), K.iso([HX, 0, 7], P), K.iso([HX, HY, 0], P)]) +
        K.pathOf([K.iso([HX + 0.15, 0, HZ], P), K.iso([HX + 0.15, 0, HZ - 3.5], P)]), { tone: "lo" });
      const seam = L(K.pathOf([K.iso([-HX + 2.5, HY, 0], P), K.iso([-HX + 2.5, HY, HZ - 3.5], P)]), { tone: "faint" });
      // the open top: dark inside, the far inner walls lit a little
      const mouth = [[-ix, -iy, HZ], [ix, -iy, HZ], [ix, iy, HZ], [-ix, iy, HZ]], mouthD = K.pathOf(mouth.map((p) => K.iso(p, P)), true);
      const [mDefs, mOpen] = B.clip(mouthD);
      const inside = q(mouth, "#6e4620", "#3a2410") + mOpen + q([[-ix, -iy, HZ], [ix, -iy, HZ], [ix, -iy, 18], [-ix, -iy, 18]], "#9c6c38") + q([[-ix, -iy, HZ], [-ix, iy, HZ], [-ix, iy, 18], [-ix, -iy, 18]], "#86592a") + "</g>";
      // food is seen through the mouth and above the near rim
      const A = K.iso([-ix, iy, HZ], P), Bq = K.iso([ix, iy, HZ], P), C = K.iso([ix, -iy, HZ], P), fx = (v) => v.toFixed(1);
      const [fDefs, fOpen] = B.clip(`M${fx(A[0])} ${fx(A[1])}L${fx(Bq[0])} ${fx(Bq[1])}L${fx(C[0])} ${fx(C[1])}L${fx(C[0] + 600)} -9999L${fx(A[0] - 600)} -9999Z`);
      // a twisted paper handle: a loop in the plane y, ends at x = ±6 from z0 up to the top at z1, drawn as a thick
      // kraft cord with a darker twist on it
      const handle = (y, z0, z1) => {
        const pts = []; for (let i = 0; i <= 28; i++) { const a = Math.PI - (i / 28) * Math.PI; pts.push(K.iso([Math.cos(a) * 6, y, z0 + (z1 - z0) * Math.sin(a) * (1 + 0.15 * (1 - Math.abs(Math.cos(a))))], P)); }
        const d = K.pathOf(pts), wd = Math.max(1.2, kS * 0.9);
        return `<path d="${d}" fill="none" stroke="#5a3a16" stroke-width="${(wd + 1).toFixed(2)}" stroke-linecap="butt"/><path d="${d}" fill="none" stroke="#c99a62" stroke-width="${wd.toFixed(2)}" stroke-linecap="butt"/>` +
          `<path data-free="" d="${d}" fill="none" stroke="#8a5f2c" stroke-width="${(wd * 0.55).toFixed(2)}" stroke-dasharray="${(wd * 0.5).toFixed(2)} ${(wd * 0.7).toFixed(2)}"/>`;
      };
      const patch = (y) => ISO.tinted(KRAFT, ISO.wbox(P, [-8, 8], [y, y + 0.12], [HZ - 7.5, HZ - 4], "hi"));
      // the shopping: celery at the back right, the baguette leaning out at the back left, an apple at the front
      const celery = [[5, -4, 22], [7.5, -5, 24], [9.5, -3.5, 21]].map(([x, y, h], i) => {
        const F = LAB.A([x, y, 18], [0.12 + i * 0.05, -0.05, 1]);
        const stalk = ISO.tinted(CELERY, S(G.solidOf([[0, 1.1], [h + 2, 0.9]], F, P, { steps: 16 }), { tone: "mid" }));
        const tip = G.pointOf(F, h + 2, 0, 0), leaves = [-0.9, -0.3, 0.3, 0.9].map((a, j) => B.flat(P, [tip[0], tip[1] + 0.2 + j * 0.1, tip[2] + 1], [1, 0, 0], [0, 0, -1], `<path d="${window.B41.leaf(Math.sin(a) * 3, -Math.cos(a) * 3, 6.5, a - Math.PI / 2)}" fill="#7fae4a" stroke="#3e5a16" stroke-width="0.12"/>`)).join("");
        return stalk + leaves;
      }).join("");
      const loafF = LAB.A([-7, -3.5, 14], [-0.28, -0.12, 1]);
      const loaf = ISO.tinted(BREAD, S(G.solidOf([[0, 0.6], [1.5, 2.6, 1], [26, 2.9, 1], [33, 2.5, 1], [34.5, 0.6]], loafF, P, { steps: 28 }), { tone: "mid" })) +
        [27, 30, 33].map((s) => { const a = G.pointOf(loafF, s - 1.2, 2.95, G.angleToward(loafF, G.viewOf(P)) - 0.5), b = G.pointOf(loafF, s + 0.6, 2.75, G.angleToward(loafF, G.viewOf(P)) + 0.5); return `<path data-free="" d="${K.pathOf([K.iso(a, P), K.iso(b, P)])}" stroke="#f3d6a8" stroke-width="${Math.max(0.8, kS * 0.35).toFixed(2)}" stroke-linecap="round"/>`; }).join("");
      const apple = ISO.tinted(APPLE, S(G.sphereOf([8, 4.2, HZ - 0.5], 3.6, P), { tone: "mid" })) +
        `<path d="${K.pathOf([K.iso([8, 4.2, HZ + 2.9], P), K.iso([8.4, 4.2, HZ + 4.2], P)])}" stroke="#5a3a16" stroke-width="${Math.max(0.8, kS * 0.3).toFixed(2)}" stroke-linecap="round"/>` +
        B.flat(P, [8.4, 4.25, HZ + 3.9], [1, 0, 0], [0, 0, -1], `<path d="${window.B41.leaf(1.2, 0, 2.4, -0.4)}" fill="#6fa040" stroke="#3e5a16" stroke-width="0.08"/>`);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.5 }, 0, 0.5, P)}"/><defs>${mDefs}${fDefs}</defs>` +
        `<g data-name="bag">${body}${crease}${seam}${inside}</g>` +
        `${fOpen}<g data-name="handles">${patch(-iy - 0.12)}${handle(-iy - 0.3, HZ - 4.5, HZ + 9)}</g><g data-name="food">${celery}${loaf}${apple}</g></g>` +
        `<g data-name="handles">${patch(HY + 0.15)}${handle(HY + 0.3, HZ - 4.5, HZ + 9)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([HX + 1, 0, HZ - 8], P), "paper bag", "#556", { size: 13, anchor: "start" });
      g.anchors = { top: [0, 0, HZ], handle: [0, HY + 0.3, HZ + 9] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "paper shopping bag · 32 × 18 × 40 cm · baguette, celery and an apple inside";
      B.light(w, g, lit);
      return g;
    },
  });
})();
