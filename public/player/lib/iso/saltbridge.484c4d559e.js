// "saltbridge cx cy k in=0..1 lab=0 lit=tube|solution|plugs" — a PART (PARTS.md, batch 5): a salt bridge, a glass
// U-tube turned upside down that joins two beakers of solution. Its origin is the middle between its two open ends when
// it is in (place it between two beakers' `inside` points, az= the depth it dips to). A 0.9 cm glass tube (0.6 cm bore),
// legs 10.4 cm apart, 14 cm tall, bent smooth at the top, full of potassium nitrate solution (colourless, faintly
// tinted), each end plugged with a wad of cotton wool so the solution stays in but ions pass. in=1 its ends are down in
// the solutions; in=0 it is lifted 5 cm out (the circuit is broken). set({ in }) lowers or lifts it, eased.
// Reused from ecell.js (its bridge path and plugs). Built in mm; anchors in cm: a (the −x end) b (the +x end) top,
// where they are after the move.
(() => {
  const K = window.K, G = window.G;
  const XL = 52, HT = 140, R = 4.5, BORE = 3, BEND = 20, LIFT = 50;
  // cotton tufts on a unit disc: [x, y, z, r] (a short wad that bulges out of the tube's mouth)
  const TUFTS = Array.from({ length: 14 }, (_, i) => { const a = i * 2.39996, rr = Math.sqrt((i + 0.5) / 14) * 0.8; return [Math.cos(a) * rr, Math.sin(a) * rr, -1.2 + 1.3 * ((i * 0.618) % 1), 0.42 + 0.14 * ((i * 0.37) % 1)]; });
  let n = 0;

  ISO.add({
    name: "saltbridge", title: "Salt bridge (part)", compare: null,
    about: "A salt bridge: an upside-down glass U-tube of potassium nitrate solution with cotton-wool plugs, dipped into two beakers to complete a cell; lift it out and the circuit breaks. anchors: a b top",
    line: "saltbridge cx cy k in=0..1 lab=0 lit=tube|solution|plugs",
    demo: { line: "saltbridge 480 430 22 in=1 lab=1", script: [{ set: { lit: "tube" }, hold: 1.2 }, { set: { in: 0, lit: "plugs" }, hold: "settle" }, { set: { in: 1, lit: "solution" }, hold: "settle" }, { set: { lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 430, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", id = "sb" + n++;
      const st = { u: ISO.clamp(ISO.num(o, "in", 1), 0, 1) }, want = { u: st.u };
      const sc = K.screenRise(1, Pm);
      const path = LAB.bend([[-XL, 0, 0], [-XL, 0, HT - R], [XL, 0, HT - R], [XL, 0, 0]], BEND);
      // the solution stops 3 mm inside each end, where the cotton starts
      const inner = LAB.bend([[-XL, 0, 3], [-XL, 0, HT - R], [XL, 0, HT - R], [XL, 0, 3]], BEND);
      const d = K.pathOf(inner.map((p) => K.iso(p, Pm)));
      const tube = LAB.tube(Pm, path, R, { fill: "#f4f8fa" });
      const solution = `<path d="${d}" fill="none" stroke="#d3e5ef" stroke-width="${(sc * BORE * 2).toFixed(2)}" stroke-linejoin="round"/>` +
        `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${(sc * BORE * 0.6).toFixed(2)}" stroke-linejoin="round" opacity=".75" transform="translate(${(-sc * 1.2).toFixed(2)} 0)"/>`;
      const plug = (x) => TUFTS.map(([a, b, z, r]) => ({ p: [x + a * BORE * 1.1, b * BORE * 1.1, z * 4], r: r * BORE * 1.3 })).sort((p, q) => K.depthOf(p.p, Pm) - K.depthOf(q.p, Pm))
        .map(({ p, r }) => { const [X, Y] = K.iso(p, Pm), s = r * sc; return `<ellipse cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" rx="${(s * 1.08).toFixed(2)}" ry="${s.toFixed(2)}" fill="url(#${id})" stroke="#c9d0d7" stroke-width="0.35"/>`; }).join("");
      // the glass's end rims (fire-polished), a ring round each mouth just above the cotton
      const rims = [-XL, XL].map((x) => `<path d="${K.pathOf(K.circleRing(x, 0, R, 24).map(([a, b]) => K.iso([a, b, 0.2], Pm)), true)}" fill="none" stroke="${LAB.GLASS}" stroke-width="0.6" opacity=".8"/>`).join("");
      g.innerHTML = `<defs><radialGradient id="${id}" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f4f6f8"/><stop offset="1" stop-color="#cfd5dc"/></radialGradient></defs>` +
        `<g data-part="move"><g data-name="tube">${tube}</g><g data-name="solution">${solution}</g><g data-name="tube">${rims}</g><g data-name="plugs">${plug(-XL)}${plug(XL)}</g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const dz = (1 - ISO.ease(st.u)) * LIFT, z = dz / 10;
        w.attr(el.move, "transform", K.translateAlong(Pm, [0, 0, dz]));
        g.anchors = { a: [-XL / 10, 0, +z.toFixed(3)], b: [XL / 10, 0, +z.toFixed(3)], top: [0, 0, +(z + HT / 10).toFixed(3)] };
        if (lab) w.rebuild(el.words, String(Math.round(dz)), () => LAB.word(Pm, lab, [0, 0, HT + dz + 6], "salt bridge (KNO₃)", "#556", { dy: -6 }) + LAB.word(Pm, lab, [XL + 8, 0, dz + 4], "cotton wool", "#556", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      let lit = o.lit || "";
      g.set = (p) => {
        if (p.in !== undefined && Number.isFinite(+p.in)) want.u = ISO.clamp(+p.in, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.u = ISO.follow(st.u, want.u, dt, 0.35, ISO.still());
        if (Math.abs(st.u - want.u) < 0.002) st.u = want.u;
        draw();
        return st.u !== want.u;
      };
      g.readout = () => (st.u > 0.97 ? "salt bridge in: its ends dip into both solutions, ions can move · the circuit is complete" : `salt bridge lifted ${((1 - ISO.ease(st.u)) * LIFT / 10).toFixed(1)} cm · the circuit is broken`);
      draw();
      return g;
    },
  });
})();
