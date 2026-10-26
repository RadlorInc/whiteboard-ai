// "cottonwool cx cy k d=0.7..2 lab=0 lit=wool" — a PART (PARTS.md): a loose wad of cotton wool, origin the middle of
// its underside (on the bench, or az= down into a tube's mouth or a U-tube's end as a plug, as rust.js and ecell.js use
// it). A soft squashed ball d cm across (1.2 by default), built from overlapping tufts, each shaded white to a cool
// grey on its underside, with a few loose fibres curling off its edge. Static. Built in mm.
(() => {
  const K = window.K;
  // tufts in the unit ball: [x, y, z, r]; a golden-angle scatter, flattened a little (a wad sags)
  const TUFTS = Array.from({ length: 36 }, (_, i) => {
    const a = i * 2.39996, f = (i + 0.5) / 36, rr = Math.sqrt(f) * 0.74, z = 0.17 + 0.5 * Math.sqrt(Math.max(0, 1 - rr * rr * 1.6)) * (0.75 + 0.25 * Math.cos(i * 1.7));
    return [Math.cos(a) * rr, Math.sin(a) * rr, z, 0.2 + 0.09 * ((i * 0.618) % 1)];
  });
  let n = 0;

  ISO.add({
    name: "cottonwool", title: "Cotton wool (part)", compare: null,
    about: "A small wad of cotton wool, 0.7 to 2 cm across, on the bench or pushed into the mouth of a tube as a loose plug that lets gas through but keeps solids or drops in. anchors: top",
    line: "cottonwool cx cy k d=0.7..2 lab=0 lit=wool",
    demo: { line: "cottonwool 480 320 60 d=2", script: [{ set: {}, hold: 1 }, { set: { lit: "wool" }, hold: 1.5 }, { set: { lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const D = ISO.clamp(ISO.num(o, "d", 1.2), 0.7, 2) * 10, R = D / 2, H = D * 0.78, sc = K.screenRise(1, Pm), id = "cw" + n++;
      // far tufts first: sort by depth so near tufts overlap far ones
      const tufts = TUFTS.map(([x, y, z, r]) => ({ p: [x * R, y * R, z * H], r: r * R })).sort((a, b) => K.depthOf(a.p, Pm) - K.depthOf(b.p, Pm));
      const shade = `<defs><radialGradient id="${id}" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f4f6f8"/><stop offset="1" stop-color="#cfd5dc"/></radialGradient></defs>`;
      const blobs = tufts.map(({ p, r }) => { const [x, y] = K.iso(p, Pm), s = r * sc; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(s * 1.08).toFixed(2)}" ry="${s.toFixed(2)}" fill="url(#${id})" stroke="#c9d0d7" stroke-width="0.35"/>`; }).join("");
      // a few loose fibres, each starting inside a tuft and curling out past the edge
      const fib = [0.4, 1.1, 1.9, 2.6, 3.3, 4.0, 4.6, 5.2, 5.9].map((a, i) => {
        const q = []; for (let j = 0; j <= 6; j++) { const u = j / 6, rr = R * (0.62 + (0.18 + 0.12 * (i % 3)) * u), aa = a + 0.9 * u * (i % 2 ? 1 : -1); q.push(K.iso([Math.cos(aa) * rr, Math.sin(aa) * rr, H * (0.3 + 0.12 * Math.sin(u * 5 + i))], Pm)); }
        return K.pathOf(q);
      }).join("");
      const shadow = K.pathOf(Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return K.iso([Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75, 0], Pm); }), true);
      g.innerHTML = shade + `<path d="${shadow}" fill="#8a929a" opacity=".22"/><g data-name="wool"><path d="${fib}" fill="none" stroke="#c3cad1" stroke-width="${Math.max(0.3, sc * 0.08).toFixed(2)}" stroke-linecap="round"/>${blobs}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [R, R, H], "cotton wool", "#556", { anchor: "start", dy: -6 });
      g.anchors = { top: [0, 0, H / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `a wad of cotton wool about ${(D / 10).toFixed(1)} cm across · lets gas through, holds back solids and drops`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
