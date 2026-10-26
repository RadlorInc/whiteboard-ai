// "fulcrum cx cy k lab=0 lit=plinth|wedge|cheeks|pin" — a PART (PARTS.md, batch 5): the lab lever's fulcrum standing on
// the bench, its origin the bench point under the pivot. A steel plinth 6 × 6.8 × 0.75 cm with four screws, a hardwood
// wedge whose edge is 7 cm up, two steel cheek plates either side of the plank's slot and the pivot pin through them
// 7.5 cm up. The plank (leverplank) hangs on `pin`; its rubber stops go at `lstop` and `rstop` (30.5 cm left, 60.5 cm
// right, on the bench). Static. Taken from lever.js (scaled 1:4). World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  ISO.add({
    name: "fulcrum", title: "Lever fulcrum (part)", compare: null,
    about: "The lab lever's fulcrum: a steel plinth, a wooden wedge 7 cm tall, two cheek plates and the pivot pin the plank turns on; static. anchors: pin top lstop rstop",
    line: "fulcrum cx cy k lab=0 lit=plinth|wedge|cheeks|pin",
    demo: { line: "fulcrum 480 380 30 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "wedge" }, hold: 1.2 }, { set: { lit: "cheeks" }, hold: 1.2 }, { set: { lit: "pin" }, hold: 1.2 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const B19 = window.B19, L = B19.LEVER, { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const plan = { x: -3, y: -3.4, w: 6, d: 6.8, r: 0.3 };
      const screws = [[-2.4, -2.8], [2.4, -2.8], [-2.4, 2.8], [2.4, 2.8]].map(([x, y]) => K.iso([x, y, 0.75], P));
      const W = [[-2.75, -2.2, 0.75], [2.75, -2.2, 0.75], [0, -2.2, 7], [-2.75, 2.2, 0.75], [2.75, 2.2, 0.75], [0, 2.2, 7]];
      const grain = [1.6, 2.6, 3.6].map((z) => K.pathOf([[-2.75 * (7 - z) / 6.25, 2.21, z], [2.75 * (7 - z) / 6.25, 2.21, z]].map((p) => K.iso(p, P)))).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, 0.75, P)}"/>` +
        `<g data-name="plinth">${ISO.tinted(ISO.T.steel, S(K.slabOf(plan, 0, 0.75, P, 3, 0.1), { tone: "mid" }) + K.dotsSvg(screws, { size: 0.5 }))}</g>` +
        `<g data-name="cheeks">${B19.cheek(P, -3.1, -2.6)}</g>` +
        `<g data-name="wedge">${ISO.tinted(ISO.T.wood, ISO.poly(W, [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], P, "mid") + `<path d="${grain}" stroke="#7a5a2e" stroke-opacity=".45" stroke-width="0.5"/>`)}</g>` +
        `<g data-name="cheeks">${B19.cheek(P, 2.6, 3.1)}</g><g data-name="pin">${B19.pinEnd(P, L.pinZ)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([0, 3.4, 0], P), "fulcrum", "#555", { size: 14, dy: 22 });
      g.anchors = { pin: [0, 0, L.pinZ], top: [0, 0, 7], lstop: [L.stops[0], 0, 0], rstop: [L.stops[1], 0, 0] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B19.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "lever fulcrum · wedge edge 7 cm up · pivot pin 7.5 cm up";
      B19.light(w, g, lit);
      return g;
    },
  });
})();
