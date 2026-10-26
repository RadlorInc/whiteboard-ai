// "pumpplate cx cy k lab=0 lit=plate|pedestal|port|terminals" — a PART (PARTS.md, batch 5): the vacuum-pump plate of
// the bell-jar set-up (belljar.js's pedestal and ground plate at real size), standing on the bench, origin the bench
// point under its middle. A cast pedestal 11 cm across, a ground steel plate 30 cm across on it (3 cm high in all),
// two greased grooves on the top where a 25 cm bell jar's flange seats, the air hole in the middle, a hose port with
// a barbed tail on the +x edge (where the pump's hose goes on), two insulated terminals on the −x rim (they carry the
// bell's current through the plate). Static. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 150, RP = 55, Z1 = 12, TOP = 30, PZ = 21, TX = -138, TY = 20;   // plate radius, pedestal, plate from Z1 to TOP

  function plateSvg(P) {
    const B08 = window.B08, out = [`<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, 4, P)}"/>`];
    out.push(`<g data-name="pedestal">${ISO.tinted(ISO.T.paint, S(K.cylinder(0, 0, RP + 6, 0, 3, P, 48, 0.6), { tone: "mid" }) + S(K.cylinder(0, 0, RP, 3, Z1 - 3, P, 48), { tone: "mid" }))}</g>`);
    // the plate: its edge band, the ground top with the seat grooves (rings), the air hole and its counterbore
    out.push(`<g data-name="plate">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, R, Z1, TOP - Z1, P, 120, 1.2), { tone: "mid", inner: L(K.sideArc(0, 0, R, Z1 + 6, P, 96), { tone: "faint" }) }))}`);
    out.push(ISO.tinted(ISO.T.steel, L(K.ring(0, 0, 113, TOP, P, 120) + K.ring(0, 0, 129, TOP, P, 120), { tone: "lo" })));
    out.push(`<path d="${K.ring(0, 0, 121, TOP, P, 120)}" fill="none" stroke="#b9a06a" stroke-width="${(G.scaleOf(P) * 6).toFixed(2)}" opacity=".45"/>`);
    out.push(`<path d="${K.ring(0, 0, 9, TOP, P, 32)}" fill="#c3c6cb" stroke="#3c3f45" stroke-width="0.7"/><path d="${K.ring(0, 0, 4.5, TOP, P, 24)}" fill="#2a2b2f" stroke="#121214" stroke-width="0.5"/>`);
    out.push("</g>");
    // the hose port: a boss out of the +x edge, a hex, the barbed tail (three ridges) to its open end
    const F = B08.X([0, 0, PZ]), barb = [[R + 22, 0], [R + 22, 6.5]];
    for (let i = 0; i < 3; i++) { const s = R + 22 + i * 7; barb.push([s + 1, 6.5], [s + 6, 8.4], [s + 7, 6.5]); }
    barb.push([R + 44, 6.5], [R + 44, 0]);
    out.push(`<g data-name="port">${ISO.tinted(ISO.T.brass, S(G.disc(R - 6, R + 10, 7.5, F, P), { tone: "mid" }) + S(G.disc(R + 10, R + 22, 10, F, P, { steps: 6 }), { tone: "hi" }) + S(G.lathe(barb, F, P), { tone: "hi" }))}` +
      `${S(G.disc(R + 44, R + 44.2, 3.6, F, P), { tone: "lo" })}</g>`);
    // two terminals on the far rim, outside the jar's seat
    const a = B08.terminal(P, [TX, -TY, TOP], ISO.T.plastic, { r: 5 }), b = B08.terminal(P, [TX, TY, TOP], B08.RED, { r: 5 });
    out.push(`<g data-name="terminals">${a.svg}${b.svg}</g>`);
    return { svg: out.join(""), tz: a.top };
  }

  ISO.add({
    name: "pumpplate", title: "Vacuum pump plate (part)", compare: null,
    about: "The ground steel plate a bell jar stands on, 30 cm across on its pedestal (3 cm high): greased seat grooves for the jar's flange, the air hole in the middle, a hose port on the +x edge for the vacuum pump, two terminals on the far rim that carry a bell's current through. anchors: top port t1 t2",
    line: "pumpplate cx cy k lab=0 lit=plate|pedestal|port|terminals",
    demo: { line: "pumpplate 470 330 16", script: [{ set: {}, hold: 1 }, { set: { lit: "port" }, hold: 1.2 }, { set: { lit: "terminals" }, hold: 1.2 }, { set: { lit: "plate" }, hold: 1.2 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const p = plateSvg(Pm);
      g.innerHTML = p.svg + (lab ? CIRC.word(P, [R / 10, 0, TOP / 10 + 1], "pump plate") : "");
      g.anchors = { top: [0, 0, TOP / 10], port: [(R + 44) / 10, 0, PZ / 10], t1: [TX / 10, -TY / 10, +(p.tz / 10).toFixed(2)], t2: [TX / 10, TY / 10, +(p.tz / 10).toFixed(2)] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (q) => { if (q.lit !== undefined) { lit = q.lit; window.B08.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "vacuum plate · 30 cm ground steel plate, greased seat for a 25 cm bell jar · hose port to the pump · two terminals through the plate";
      window.B08.light(w, g, lit);
      return g;
    },
  });
})();
