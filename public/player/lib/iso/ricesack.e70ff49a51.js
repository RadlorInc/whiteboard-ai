// "ricesack cx cy k kg=5|10|25 lab=0 lit=sack|top|print" — a PART (batch 6, groceries): a stitched woven sack of rice
// standing on the floor or a shop shelf, its origin the floor point under its middle, its wide face toward the room
// (+y). 35 × 15 × 55 cm: a soft woven polypropylene body (the weave shows on the front as a fine grid), the top
// pinched flat into a folded hem sewn with a chain stitch, the side fold, the bottom seam, and a plain printed panel
// on the front: "RICE", the weight (kg) and a simple grain ear (no brand). Static. World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K;
  const HX = 17.5, HY = 7.5, ZB = 44, ZT = 55, KGS = ["5", "10", "25"];
  const WEAVE = ISO.tint("#f6f2e8", ["#c9c1ae", "#d6cfbe", "#e2dccd", "#ece7db"], "#6d6553");
  ISO.add({
    name: "ricesack", title: "Rice sack (part)", compare: null,
    about: "A stitched woven sack of rice, 35 × 15 × 55 cm, folded and sewn at the top, the weight printed plainly on the front; a bulk grocery item. anchors: top",
    line: "ricesack cx cy k kg=5|10|25 lab=0 lit=sack|top|print",
    demo: { line: "ricesack 480 470 7 kg=25 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "top" }, hold: 1.5 }, { set: { lit: "print" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1", S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const kg = B.pick(o.kg, KGS, "25"), at = (x, y, z) => K.iso([x, y, z], P);
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 5 };
      // the body: a soft slab, the weave grid on the flat of the front face, the side fold and the bottom seam
      const grid = [];
      for (let x = -12; x <= 12; x += 0.8) grid.push(K.pathOf([at(x, HY + 0.02, 3), at(x, HY + 0.02, ZB - 3)]));
      for (let z = 3; z <= ZB - 3; z += 0.8) grid.push(K.pathOf([at(-12, HY + 0.02, z), at(12, HY + 0.02, z)]));
      const body = S(K.slabOf(plan, 0, ZB, P, 8, 3), { tone: "mid" }) +
        `<path d="${grid.join("")}" fill="none" stroke="#c9c1ae" stroke-width="0.35" opacity=".55"/>` +
        B.stitchPath(P, [[-HX + 3, HY + 0.05, 2.2], [HX - 3, HY + 0.05, 2.2]]) +
        `<path d="${K.pathOf([at(HX + 0.02, 0, 4), at(HX + 0.02, 0, ZB - 2)])}" stroke="#b3ab98" stroke-width="0.9"/>`;
      // the top: the sack pinched in to a flat hem, folded over once and sewn through
      const prof = [[-HY + 1, ZB - 0.5], [HY - 1, ZB - 0.5], [1.2, ZT - 3], [-1.2, ZT - 3]];
      const top = ISO.prismX(P, prof, -HX + 1.5, HX - 1.5, ["#cfc8b6", "#f4f0e6"], "#e8e2d4", "#6d6553") +
        ISO.wbox(P, [-HX + 1, HX - 1], [-1, 1], [ZT - 3, ZT], "mid") + ISO.wbox(P, [-HX + 1, HX - 1], [1, 1.5], [ZT - 3, ZT - 1.2], "mid") +
        B.stitchPath(P, [[-HX + 2, 1.55, ZT - 2.1], [HX - 2, 1.55, ZT - 2.1]]);
      // the print, flat on the front face
      const ear = [0, 1, 2, 3, 4].map((i) => `<path d="${B.leaf(3 + i * 0.1, 5.2 - i * 1.25, 1.6, -0.5)}" fill="#c08a2a"/><path d="${B.leaf(5 - i * 0.1, 5.2 - i * 1.25, 1.6, 0.5 + Math.PI)}" fill="#c08a2a"/>`).join("");
      const print = `<g transform="${B.plane(P, [-11, HY + 0.05, ZB - 6], [1, 0, 0], [0, 0, -1])}"><rect width="22" height="26" rx="1" fill="#fbf8f0" stroke="#2f6a3a" stroke-width=".35"/><rect x="1" y="1" width="20" height="24" rx=".6" fill="none" stroke="#2f6a3a" stroke-width=".15"/>` +
        `<path d="M4 10.5 L4 -0.5" stroke="#8a6220" stroke-width=".35" transform="translate(0 4)"/>${ear.replace(/<path d="/g, '<path transform="translate(0 4)" d="')}` +
        `${B.text(14, 9, "RICE", 4.6, "#2f6a3a", "middle", 800)}${B.text(14, 12.5, "LONG GRAIN", 1.5, "#2f6a3a", "middle", 600)}` +
        `<rect x="3" y="16.5" width="16" height="6" rx="3" fill="#2f6a3a"/>${B.text(11, 21, `${kg} kg`, 4, "#fbf8f0", "middle", 800)}</g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, ZT, P)}"/>` +
        `<g data-name="sack">${ISO.tinted(WEAVE, body)}</g><g data-name="top">${ISO.tinted(WEAVE, top)}</g><g data-name="print">${print}</g>` +
        (lab ? ISO.word(at(HX + 2, 0, ZB * 0.6), `rice sack, ${kg} kg`, "#556", { size: 13, anchor: "start" }) : "");
      g.anchors = { top: [0, 0, ZT] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `woven rice sack · ${kg} kg · 35 × 15 × 55 cm`;
      B.light(w, g, lit);
      return g;
    },
  });
})();
