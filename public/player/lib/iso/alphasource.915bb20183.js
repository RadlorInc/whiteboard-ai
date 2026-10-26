// "alphasource cx cy k beam=0|1 len=2..30 lab=0 lit=block|source|beam" — a PART (PARTS.md, batch 5): the alpha source
// of goldfoil.js, standing on the bench (or the chamber floor), its origin the point under its middle. A lead block
// 7 × 6 × 6 cm with eased edges; the sealed source (americium-241, about 4 MeV alphas) is on the end of a brass rod
// pushed down into the block from the top (its knurled cap shows), and the alphas leave only through a bore in the −x
// face, behind a steel plate with a narrow vertical slit and two screws. A radiation-trefoil label sits on top. Alphas
// travel toward −x (as light does on an optical bench) at 4.5 cm up: the gold-foil parts (foilframe, scintdetector) put
// their middle at the same height. beam=1 draws the narrow beam leaving the slit, len cm long, with alphas running
// along it; set({ beam }). Anchor `out`: the slit's middle. Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const LEAD = ISO.tint("#b3b8c0", ["#60656d", "#6e737b", "#7d828a", "#8b9098"], "#24272c");
  const HX = 35, HY = 30, HZ = 60, BZ = 45, PX = -HX - 2.5;

  ISO.add({
    name: "alphasource", title: "Alpha source in a lead block (part)", compare: null,
    about: "An alpha source in a lead block: a sealed americium source on a rod inside, the alphas leaving only through a slit in the −x face as a narrow beam toward −x, 4.5 cm up. anchors: out",
    line: "alphasource cx cy k beam=0|1 len=2..30 lab=0 lit=block|source|beam",
    demo: { line: "alphasource 560 360 34 beam=0 len=10 lab=1", script: [{ set: {}, hold: 1 }, { set: { beam: 1, lit: "beam" }, hold: 2 }, { set: { lit: "source" }, hold: 1.2 }, { set: { beam: 0, lit: "block" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { beam: o.beam === "1", len: ISO.clamp(ISO.num(o, "len", 10), 2, 30) * 10, clock: 0 };
      let lit = o.lit || "";
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 3 };
      const block = ISO.tinted(LEAD, S(K.slabOf(plan, 0, HZ, Pm, 4, 1.5), { tone: "mid" }));
      // the trefoil label on top: a yellow square, three black blades and a dot
      const tz = HZ + 0.05, tc = [8, 0], top = (x, y) => K.iso([x, y, tz], Pm);
      const blades = [0, 1, 2].map((i) => {
        const a0 = (i * 2 * Math.PI) / 3 - Math.PI / 6 + Math.PI / 2, pts = [];
        for (let j = 0; j <= 6; j++) { const a = a0 + (j / 6) * (Math.PI / 3); pts.push(top(tc[0] + Math.cos(a) * 9, tc[1] + Math.sin(a) * 9)); }
        for (let j = 6; j >= 0; j--) { const a = a0 + (j / 6) * (Math.PI / 3); pts.push(top(tc[0] + Math.cos(a) * 3, tc[1] + Math.sin(a) * 3)); }
        return K.pathOf(pts, true);
      }).join("");
      const label = `<path d="${K.pathOf([top(-5, -13), top(21, -13), top(21, 13), top(-5, 13)], true)}" fill="#f2c62e" stroke="#6b5114" stroke-width="0.5"/>` +
        `<path d="${blades}" fill="#1b1d20"/><circle cx="${top(...tc)[0].toFixed(1)}" cy="${top(...tc)[1].toFixed(1)}" r="${(G.scaleOf(Pm) * 1.8).toFixed(2)}" fill="#1b1d20"/>`;
      const words = LAB.faceText(Pm, [0, HY + 0.1, 30], [1, 0, 0], "α SOURCE", 6, "#1b1d20") + LAB.faceText(Pm, [0, HY + 0.1, 21], [1, 0, 0], "Am-241 · sealed", 4, "#2b2f35");
      // the source rod's knurled brass cap on top, toward the −x end (the rod runs down to the bore)
      const cap = ISO.tinted(ISO.T.brass, S(K.cylinder(-20, 0, 7, HZ, 3, Pm, 28), { tone: "mid" }) + S(K.cylinder(-20, 0, 5.5, HZ + 3, 7, Pm, 28), { tone: "hi", inner: L(K.knurl(-20, 0, 5.5, HZ + 3, HZ + 10, 24, Pm, 0), { tone: "faint" }) }));
      // the slit plate on the −x face, its two screws, the bore's dark mouth behind the slit
      const plate = ISO.tinted(ISO.T.steel, ISO.wbox(Pm, [PX, -HX], [-18, 18], [22, 58], "mid"));
      const fx = (y, z) => K.iso([PX - 0.05, y, z], Pm);
      const slit = `<path d="${K.pathOf([fx(-0.6, BZ - 7), fx(0.6, BZ - 7), fx(0.6, BZ + 7), fx(-0.6, BZ + 7)], true)}" fill="#0d0e10"/>`;
      const screws = [[-11, 52], [11, 28]].map(([y, z]) => ISO.tinted(ISO.T.steel, S(G.disc(0, 1.6, 2.6, LAB.A([PX, y, z], [-1, 0, 0]), Pm), { tone: "hi" }))).join("");
      // the −x face is turned away from the camera: the plate and slit are hidden behind the block, the beam comes out past it
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, HZ, Pm)}"/><g data-name="beam"><g data-part="beam"></g></g>` +
        `<g data-name="block">${plate}${slit}${screws}</g><g data-name="block">${block}${label}${words}</g><g data-name="source">${cap}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [20, 0, HZ + 16], "alpha source", "#445", { dy: -6 });
      g.anchors = { out: [PX / 10, 0, BZ / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const tq = Math.round(st.clock * 15) / 15;
        w.rebuild(el.beam, st.beam ? `${tq} ${st.len}` : "", () => {
          if (!st.beam) return "";
          const A = K.iso([PX, 0, BZ], Pm), B = K.iso([PX - st.len, 0, BZ], Pm), out = [`<path d="M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}" stroke="#c45a00" stroke-width="${Math.max(0.8, G.scaleOf(Pm) * 1.2).toFixed(2)}" stroke-dasharray="3 3" opacity=".75"/>`];
          for (let i = 0; i < 5; i++) { const f = (tq * 0.8 + i / 5) % 1, p = K.iso([PX - f * st.len, 0, BZ], Pm); out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${Math.max(1, G.scaleOf(Pm) * 1.2).toFixed(2)}" fill="#c45a00"/>`); }
          return out.join("");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.beam !== undefined) st.beam = String(p.beam) === "1";
        if (p.len !== undefined && Number.isFinite(+p.len)) st.len = ISO.clamp(+p.len, 2, 30) * 10;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { if (st.beam && !ISO.still()) st.clock += dt; draw(); return st.beam; };
      g.readout = () => `alpha source (Am-241) in a 7 × 6 × 6 cm lead block · ${st.beam ? `a narrow beam of 4 MeV alphas leaves the slit toward −x` : "beam not shown"} · beam 4.5 cm up`;
      draw();
      return g;
    },
  });
})();
