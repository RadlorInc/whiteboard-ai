// "eggtray cx cy k open=0..1 eggs=0..6 lab=0 lit=tray|lid|eggs" — a PART (batch 6, groceries): a moulded paper-pulp
// carton of six eggs on a table, its origin the table point under its middle, its long side along x. 16 × 10 × 7 cm
// closed: the grey pulp base with three cups a row in two rows, their bulges showing on the front wall, two cones
// between the cups, the pulp's speckle; six brown-white eggs (5.6 cm tall) standing in the cups; the lid hinged along
// the back edge, with its raised top, a printed "6 EGGS" panel and the front latch tab. open 0 → 1 swings the lid up
// and back (115°) on its hinge; eggs = how many are in the cups (filled back row first). set({ open, eggs }).
// World: 1 = 1 cm. anchors: top (the closed lid's top)
(() => {
  const K = window.K, G = window.G;
  const HX = 8, HY = 5, ZB = 4.2, LH = 2.8, CUPS = [];
  for (const y of [-2.5, 2.5]) for (const x of [-5.2, 0, 5.2]) CUPS.push([x, y]);
  const PULP = ISO.tint("#ddd6c8", ["#a59d8e", "#b3ab9c", "#c1baab", "#cfc8ba"], "#5d574c");
  const EGG = [[0, 2.12], [0.5, 2.05], [1.0, 1.86], [1.5, 1.52], [1.9, 1.08], [2.2, 0.62], [2.38, 0.18], [2.42, 0.02]];
  ISO.add({
    name: "eggtray", title: "Egg carton (part)", compare: null,
    about: "A moulded pulp egg carton of six, 16 × 10 × 7 cm; open swings its lid up on the back hinge to show the eggs in their cups; a grocery item to price. anchors: top",
    line: "eggtray cx cy k open=0..1 eggs=0..6 lab=0 lit=tray|lid|eggs",
    demo: { line: "eggtray 480 400 26 open=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { open: 1, lit: "eggs" }, hold: "settle" }, { set: { eggs: 4, lit: "tray" }, hold: 1.5 }, { set: { eggs: 6, open: 0.5, lit: "lid" }, hold: "settle" }, { set: { open: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { open: B.num(o, "open", 0, 0, 1), eggs: Math.round(B.num(o, "eggs", 6, 0, 6)), lit: o.lit || "" };
      st.want = st.open;
      const at = (x, y, z) => K.iso([x, y, z], P), ring = (x, y, r, z, n = 28) => K.pathOf(K.circleRing(x, y, r, n).map(([a, b]) => at(a, b, z)), true);
      // the base: a pulp tray with cup holes on top, the cups' bulges on the front wall, cones between the cups
      const base = () => {
        const out = [];
        out.push(ISO.wbox(P, [-HX + 0.4, HX - 0.4], [-HY + 0.4, HY - 0.4], [0, 0.3], "lo"), ISO.wbox(P, [-HX, HX], [-HY, HY], [0.3, ZB], "mid"));
        const bulge = [];
        for (const [x] of CUPS.slice(3)) { const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; pts.push(at(x + Math.cos(a) * 2.4, HY + 0.01, ZB - 0.2 + Math.sin(a) * 3.4)); } bulge.push(K.pathOf(pts)); }
        for (const [, y] of [CUPS[2], CUPS[5]]) { const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; pts.push(at(HX + 0.01, y - Math.cos(a) * 2.2, ZB - 0.2 + Math.sin(a) * 3.4)); } bulge.push(K.pathOf(pts)); }
        out.push(`<path d="${bulge.join("")}" fill="none" stroke="#8d8576" stroke-width="0.8" opacity=".7"/>`);
        out.push(`<path d="${CUPS.map(([x, y]) => ring(x, y, 2.2, ZB + 0.01)).join("")}" fill="#9c9484" stroke="#6f685b" stroke-width="0.6"/>`);
        // speckles in the pulp
        const sp = []; let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        for (let i = 0; i < 30; i++) { const p = rnd() < 0.5 ? at(-HX + rnd() * 2 * HX, HY + 0.02, 0.6 + rnd() * 3.2) : at(HX + 0.02, -HY + rnd() * 2 * HY, 0.6 + rnd() * 3.2); sp.push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)}h0.01`); }
        out.push(`<path d="${sp.join("")}" stroke="#8a8274" stroke-width="${Math.max(0.8, G.scaleOf(P) * 0.08).toFixed(2)}" stroke-linecap="round" opacity=".6"/>`);
        return ISO.tinted(PULP, out.join(""));
      };
      const cones = () => ISO.tinted(PULP, [-2.6, 2.6].map((x) => LAB.turned(P, [x, 0, ZB], [[0, 0.9], [1.0, 0.55], [1.5, 0.3], [1.6, 0.05]], ["#a59d8e", "#e3ddd0"], "#5d574c")).join(""));
      const eggSvg = (n, row) => CUPS.slice(0, n).filter(([, y]) => (y < 0) === (row === 0)).map(([x, y]) => LAB.turned(P, [x, y, ZB], EGG, ["#c9a982", "#f6ead8"], "#7a6248")).join("");
      // the lid, swung by phi about the hinge line (y = −HY, z = ZB); local (u along x, h up from its rim, d from the hinge)
      const lidSvg = (phi) => {
        const c = Math.cos(phi), s = Math.sin(phi), Lw = (u, h, d) => [u, -HY + d * c - h * s, ZB + d * s + h * c];
        const box = (u, h, d) => ISO.box(Lw, P, u, h, d, "mid");
        let out = box([-HX, HX], [0, LH - 0.5], [0, 2 * HY]) + box([-HX + 0.8, HX - 0.8], [LH - 0.5, LH], [0.8, 2 * HY - 0.8]) + box([-1.6, 1.6], [-1.2, 0.4], [2 * HY, 2 * HY + 0.5]);
        // the printed panel on the raised top, when its face is toward the camera
        const u = [1, 0, 0], v = [0, c, s];
        const vw = G.viewOf(P);
        if (-s * vw[1] + c * vw[2] > 0.05 && G.scaleOf(P) > 3) {
          const o3 = Lw(-4.5, LH + 0.01, 3);
          out += `<g transform="${B.plane(P, o3, u, v)}"><rect width="9" height="4" rx=".4" fill="#f7f2e6" stroke="#7a6248" stroke-width=".1"/>${B.text(4.5, 2.1, "6 EGGS", 1.5, "#6b4a28", "middle", 800)}${B.text(4.5, 3.4, "FRESH", 0.8, "#6b4a28", "middle", 600)}</g>`;
        }
        return ISO.tinted(PULP, out);
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.6 }, 0, 7, P)}"/>` +
        `<g data-name="lid" data-part="lidBack"></g><g data-name="tray">${base()}</g><g data-name="eggs" data-part="eggs0"></g><g data-name="tray">${cones()}</g><g data-name="eggs" data-part="eggs1"></g><g data-name="lid" data-part="lidFront"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, ZB + LH] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.open * 200) / 200, phi = q * (115 * Math.PI) / 180, behind = phi > 0.95;
        w.rebuild(el.lidBack, behind ? `${q}` : "", () => (behind ? lidSvg(phi) : ""));
        w.rebuild(el.lidFront, behind ? "" : `${q}`, () => (behind ? "" : lidSvg(phi)));
        w.rebuild(el.eggs0, `${st.eggs}`, () => eggSvg(st.eggs, 0)); w.rebuild(el.eggs1, `${st.eggs}`, () => eggSvg(st.eggs, 1));
        if (lab) w.rebuild(el.words, `${st.want > 0.5} ${st.eggs}`, () => ISO.word(at(HX + 1, 0, 3), st.want > 0.5 ? `${st.eggs} eggs` : "egg carton", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.open !== undefined) st.want = B.num(p, "open", st.want, 0, 1);
        if (p.eggs !== undefined) st.eggs = Math.round(B.num(p, "eggs", st.eggs, 0, 6));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.open = ISO.follow(st.open, st.want, dt, 0.3, ISO.still());
        if (Math.abs(st.open - st.want) < 0.003) st.open = st.want;
        draw();
        return st.open !== st.want;
      };
      g.readout = () => `egg carton · ${st.eggs} of 6 eggs · lid ${st.want < 0.05 ? "closed" : st.want > 0.9 ? "open" : "half open"}`;
      draw();
      return g;
    },
  });
})();
