// "ssd25 cx cy k lab=0 lit=case|label|connector" — a PART (batch 6): a 2.5-inch SATA SSD lying flat, its origin its
// middle on the surface. A thin aluminium case 100 × 70 × 7 mm in two halves (the seam round its side), a printed label
// on top (plain: "SSD", the size and "SATA"), four screw holes in its sides, and at its +x end the SATA connector: the
// short 7-pin data slot and the long 15-pin power slot, gold contacts inside. From computer.js (its drive cage SSD).
// Static. Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const HX = 50, HY = 35, H = 7;
  ISO.add({
    name: "ssd25", title: "2.5-inch SSD (part)", compare: null,
    about: "A 2.5-inch SATA solid-state drive: thin metal case with a label, the SATA data and power connector at one end; static. anchors: plug top",
    line: "ssd25 cx cy k lab=0 lit=case|label|connector",
    demo: { line: "ssd25 480 330 45 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "connector" }, hold: 1.5 }, { set: { lit: "label" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 2.5 };
      const body = ISO.tinted(T.C.alu, K.solidSvg(K.slabOf(plan, 0, H, Pm, 4, 0.5), { tone: "mid", inner: K.lineSvg(K.sideSeam(plan, 3.2, Pm, 4), { tone: "faint" }) }));
      // screw holes: two in the +y side
      const holes = [-36, 40].map((x) => `<path d="${B.circle(Pm, [x, HY + 0.05, 3.5], [1, 0, 0], [0, 0, 1], 1.4, 14)}" fill="#2a2d31"/>`).join("");
      // the label: a grey sticker with its printed words, upright for someone in front
      const top = (x, y) => K.iso([x, y, H + 0.05], Pm), text = (x, y, s, size, c = "#2b2f35") => LAB.faceText(Pm, [x, y, H + 0.06], [1, 0, 0], B.say(s), size, c, [0, -1, 0]);
      const label = `<path d="${K.pathOf([top(-42, -28), top(36, -28), top(36, 28), top(-42, 28)], true)}" fill="#d8dbe0" stroke="#7d838b" stroke-width=".5"/>` +
        `<path d="${K.pathOf([top(-42, -28), top(-30, -28), top(-30, 28), top(-42, 28)], true)}" fill="#3b4f6b"/>` +
        text(4, 2, "SSD", 16) + text(4, 12, "1 TB · SATA", 5.5, "#4a5058") + text(4, 21, "2.5 inch · 7 mm", 4, "#6a7078");
      // the SATA connector on the +x end face: two slots with gold contacts
      const end = (y, z) => K.iso([HX + 0.05, y, z], Pm), slot = (y0, y1, pins) => {
        const box = `<path d="${K.pathOf([end(y0, 1.4), end(y1, 1.4), end(y1, 5), end(y0, 5)], true)}" fill="#14161a" stroke="#3a3e44" stroke-width=".5"/>`;
        const gold = Array.from({ length: pins }, (_, i) => { const y = y0 + ((i + 0.5) * (y1 - y0)) / pins; return K.pathOf([end(y, 2.2), end(y, 3.4)]); }).join("");
        return box + K.lineSvg(gold, { tone: "lo", free: true }).replace('class="iso-line"', 'class="iso-line" style="stroke:#d4ad4e"');
      };
      const plug = slot(-26, -14, 7) + slot(-9, 19, 15);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, H, Pm)}"/><g data-name="case">${body}${holes}</g><g data-name="label">${label}</g><g data-name="connector">${plug}</g><g data-part="words"></g>`;
      g.anchors = { plug: [HX / 10, 0, 0.3], top: [0, 0, H / 10] };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [HX, -HY, H], "SATA connector", "#556", { anchor: "start", dx: 8 });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "2.5-inch SATA SSD · 100 × 70 × 7 mm · data (7 pins) and power (15 pins) plugs at one end";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
