// "shallowdish cx cy k clips=0..12 lab=0 lit=dish|clips" — a PART (PARTS.md, batch 5): a small shallow glass dish
// (the base of a 90 mm petri dish, 9 cm across and 1.5 cm deep) with steel paper clips lying in a loose heap on its
// floor, the dish an electromagnet picks them up from. Origin: the bench point under its middle. clips = how many lie
// in it (0 to 12, fixed when it is built: to show clips picked up, place it with fewer). Static. Anchors rim (the
// rim's middle, on the axis) and inside (the middle of its floor). Built in mm (ISO.mm), anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const R = 45, H = 15, BASE = 1.5, MAX = 12;
  const OUTER = [[0, R - 1.2], [0.5, R - 0.4, 1], [1.4, R], [H, R]];
  // where the clips lie: a deterministic scatter, each turned its own way, the later ones on top of the earlier
  const HEAP = (() => {
    const out = []; let a = 7;
    const rnd = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < MAX; i++) { const r = Math.sqrt(rnd()) * 2.3, t = rnd() * Math.PI * 2; out.push({ x: Math.cos(t) * r, y: Math.sin(t) * r, deg: rnd() * Math.PI * 2, z: 0.15 + 0.045 + Math.floor(i / 5) * 0.09 }); }
    return out;
  })();

  ISO.add({
    name: "shallowdish", title: "Shallow dish of clips (part)", compare: null,
    about: "A small shallow glass dish 9 cm across and 1.5 cm deep (a petri dish base) with up to 12 steel paper clips lying in a heap on its floor, for an electromagnet to pick up. anchors: rim inside",
    line: "shallowdish cx cy k clips=0..12 lab=0 lit=dish|clips",
    demo: { line: "shallowdish 480 330 50 clips=8", script: [{ set: {}, hold: 1 }, { set: { lit: "clips" }, hold: 1.2 }, { set: { lit: "dish" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const n = Math.round(ISO.clamp(ISO.num(o, "clips", 8), 0, MAX));
      const V = LAB.vessel(Pm, [0, 0, 0], OUTER, { wall: 1.2, base: BASE });
      const clips = HEAP.slice(0, n).map(({ x, y, deg, z }) => {
        const c = Math.cos(deg), s = Math.sin(deg);
        return B13.clip(P, ([u, v]) => [x + (u - 1.6) * c - v * s, y + (u - 1.6) * s + v * c, z], { floor: BASE / 10 });
      }).join("");
      // the glass floor seen through the mouth: a faint ring where the wall turns into the base
      const floor = `<path d="${G.circleOf(V.F, BASE, R - 2, Pm)}" fill="#eaf3f8" fill-opacity=".5" stroke="${LAB.GLASS}" stroke-width="0.5" opacity=".6"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, 4, Pm)}"/>` +
        `<g data-name="dish">${V.back()}${floor}</g><g data-name="clips">${clips}</g><g data-name="dish">${V.front()}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = CIRC.word(P, [R / 10, 0, H / 10], n ? `dish of ${n} paper clips` : "shallow dish");
      g.anchors = { rim: [0, 0, H / 10], inside: [0, 0, BASE / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) lit = p.lit; B13.light(w, g, lit); };
      g.update = () => false;
      g.readout = () => `shallow glass dish 9 cm × 1.5 cm · ${n} steel paper clip${n === 1 ? "" : "s"} in it`;
      B13.light(w, g, lit);
      return g;
    },
  });
})();
