// "ecell cx cy size lab=1 lit=zinc|copper|bridge|voltmeter" — a zinc–copper (Daniell) cell.
// A zinc strip stands in zinc sulfate solution (colourless) and a copper strip in copper sulfate solution (blue), each in
// its own beaker. A salt bridge (a glass U-tube of potassium nitrate solution, plugged with cotton wool) joins the two
// solutions so ions can move, and leads with crocodile clips run from the strips to a voltmeter. Zinc gives up electrons
// more readily than copper, so zinc is the negative electrode and the meter reads E = 0.34 − (−0.76) = 1.10 V. Lift the
// salt bridge out and the circuit is broken: 0 V. set({ bridge: 1|0 }).
(() => {
  const K = window.K, G = window.G;
  const R = 32, H = 84, OUTER = [[0, R - 3], [0.7, R - 1.2, 1], [2.2, R - 0.2, 1], [4, R], [H, R]];
  const ZX = -52, CX = 52, BZ = 3, LIQ = 60, METER = { x: -176, y: -6, w: 56, d: 30, h: 46 };

  ISO.add({
    name: "ecell", title: "Simple cell (zinc and copper)", compare: "ecell 480 275 300",
    about: "Zinc in zinc sulfate and copper in copper sulfate, joined by a salt bridge: the voltmeter reads 1.10 V.",
    line: "ecell cx cy size bridge=1|0 lab=1 lit=zinc|copper|bridge|voltmeter",
    demo: { line: "ecell 480 275 300 bridge=0", script: [{ set: { bridge: 1, lit: "bridge" }, hold: "settle" }, { set: { lit: "voltmeter" }, hold: 1.5 }, { set: { bridge: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.7, H2 = size * 1.05;
      const BENCH = { x: -190, y: -60, w: 290, d: 120, r: 4 };
      const { P, g } = ISO.frame([...K.boxCorners(BENCH, 0, 3), [0, 0, BZ + H + 60], [0, METER.y, METER.h + 10]], cx, cy, W, H2, { azimuth: 60, elevation: 22 }, parent);
      const st = { b: o.bridge === "0" ? 0 : 1, want: o.bridge === "0" ? 0 : 1, V: 0 };
      st.V = st.b ? 1.1 : 0;
      let lit = o.lit || "";
      const bz = LAB.vessel(P, [ZX, 0, BZ], OUTER), bc = LAB.vessel(P, [CX, 0, BZ], OUTER);
      const strip = (x, tint, h) => ISO.tinted(tint, ISO.wbox(P, [x - 9, x + 9], [-1.2, 1.2], [BZ + 10, BZ + H + h], "hi"));
      const ZINC = ISO.tint("#e3e6ea", ["#9ea4ab", "#b0b5bb", "#c2c6cb", "#d3d6da"], "#4a5058");
      // crocodile clips on the strip tops and the leads to the meter's terminals
      const clip = (x, z, col) => ISO.tinted(col, ISO.wbox(P, [x - 4, x + 4], [-2.6, 2.6], [z - 3, z + 6], "hi") + ISO.wbox(P, [x - 1.5, x + 1.5], [-2, 2], [z + 6, z + 11], "hi"));
      const zt = BZ + H + 28, termZ = METER.h + 3;
      const leads = LAB.hose(P, LAB.bend([[ZX, 0, zt + 11], [ZX, 0, zt + 26], [METER.x + 12, METER.y + 14, termZ + 26], [METER.x + 12, METER.y + 14, termZ + 3]], 10), 1.4, "#26282c") +
        LAB.hose(P, LAB.bend([[CX, 0, zt + 11], [CX, 0, zt + 26], [METER.x + METER.w - 12, METER.y + 14, termZ + 26], [METER.x + METER.w - 12, METER.y + 14, termZ + 3]], 10), 1.4, "#d0392b");
      // the voltmeter: a case with an analogue dial on its front (0–2 V)
      const meter = (V) => {
        const { x, y, w, d, h } = METER, out = [ISO.tinted(ISO.T.paint, ISO.wbox(P, [x, x + w], [y, y + d], [0, h], "mid"))];
        const fy = y + d + 0.05, c = [x + w / 2, fy, 10], rr = 17, q = (a, r) => [c[0] + Math.sin(a) * r, fy, c[2] + Math.cos(a) * r];
        out.push(`<path d="${K.pathOf([[x + 4, fy, 3], [x + w - 4, fy, 3], [x + w - 4, fy, h - 4], [x + 4, fy, h - 4]].map((p) => K.iso(p, P)), true)}" fill="#fbfbfa" stroke="#8a8a8f" stroke-width="0.6"/>`);
        const arc = [], minor = [], major = [];
        for (let i = 0; i <= 40; i++) arc.push(K.iso(q(-0.9 + (1.8 * i) / 40, rr), P));
        for (let i = 0; i <= 20; i++) { const a = -0.9 + (1.8 * i) / 20; (i % 5 ? minor : major).push(K.pathOf([K.iso(q(a, rr), P), K.iso(q(a, rr + (i % 5 ? 2 : 3.6)), P)])); }
        out.push(L(K.pathOf(arc), { tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
        ["0", "1", "2"].forEach((n, i) => out.push(LAB.faceText(P, q(-0.9 + 0.9 * i, rr + 7.5), [1, 0, 0], n, 4.5, "#3d4650", [0, 0, 1])));
        out.push(LAB.faceText(P, [x + w / 2, fy, 17], [1, 0, 0], "V", 5, "#3d4650", [0, 0, 1]));
        const a = -0.9 + 1.8 * ISO.clamp(V / 2, 0, 1);
        out.push(`<path class="iso-line" data-tone="lit" data-free="end" d="${K.pathOf([K.iso(c, P), K.iso(q(a, rr + 1), P)])}" style="stroke-width:1.2"/>`, D([K.iso(c, P)], { size: 0.9, tone: "hi" }));
        for (const [xx, col] of [[x + 12, ISO.T.plastic], [x + w - 12, ISO.T.red]]) out.push(ISO.tinted(col, S(K.cylinder(xx, y + 14, 3.4, h, 3, P, 16, 0.4), { tone: "hi" })));
        return out.join("");
      };
      // the salt bridge: a ∩ glass tube from one solution to the other, lifted by `lift`
      const bridge = (lift) => {
        const pts = LAB.bend([[ZX + 14, 10, BZ + 34 + lift], [ZX + 14, 10, BZ + H + 30 + lift], [CX - 14, 10, BZ + H + 30 + lift], [CX - 14, 10, BZ + 34 + lift]], 14);
        return LAB.tube(P, pts, 4.6, { fill: "#f2f5f7", inner: "#ffffff" }) + [pts[0], pts[pts.length - 1]].map((p) => `<circle cx="${K.iso(p, P)[0].toFixed(1)}" cy="${K.iso(p, P)[1].toFixed(1)}" r="${(G.scaleOf(P) * 3.6).toFixed(1)}" fill="#fdfcf6" stroke="#b9b3a3" stroke-width="0.6"/>`).join("");
      };
      g.innerHTML = `<g>${LAB.mat(P, BENCH, 3, "lo", ISO.T.wood)}</g><g data-name="voltmeter" data-part="meter"></g>` +
        `<g>${bz.back()}</g><g data-name="zinc">${strip(ZX, ZINC, 28)}</g><g>${bz.liquid(LIQ, "colourless", { opacity: 0.55 })}</g>` +
        `<g>${bc.back()}</g><g data-name="copper">${strip(CX, ISO.T.copper, 28)}</g><g>${bc.liquid(LIQ, "blue", { opacity: 0.6 })}</g>` +
        `<g data-part="bridge" data-name="bridge"></g><g>${bz.front()}${bc.front()}</g><g>${clip(ZX, zt, ISO.T.steel)}${clip(CX, zt, ISO.T.steel)}</g><g data-name="voltmeter">${leads}</g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.rebuild(el.meter, st.V.toFixed(3), () => meter(st.V));
        w.rebuild(el.bridge, st.b.toFixed(3), () => bridge((1 - ISO.ease(st.b)) * 46));
        if (lab) w.rebuild(el.words, st.V.toFixed(2), () => [
          LAB.word(P, lab, [ZX, R, 0], "zinc (−)", "#4a5058", { dy: 16 }), LAB.word(P, lab, [CX, R, 0], "copper (+)", "#6e3a1c", { dy: 16 }),
          LAB.word(P, lab, [ZX, R, BZ + 24], "zinc sulfate", "#556", { size: 12 }), LAB.word(P, lab, [CX + R, 0, BZ + 30], "copper sulfate", "#2f6fae", { anchor: "start", size: 12 }),
          LAB.word(P, lab, [0, 10, BZ + H + 40], "salt bridge", "#556", { dy: -6, size: 12 }), LAB.word(P, lab, [METER.x + METER.w, METER.y, METER.h], `${st.V.toFixed(2)} V`, "#c0392b", { anchor: "start", size: 15 }),
        ].join(""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.bridge !== undefined) st.want = +p.bridge ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        st.b = ISO.follow(st.b, st.want, dt, 0.35, calm);
        if (Math.abs(st.b - st.want) < 0.002) st.b = st.want;
        // the meter only reads once the bridge's ends are under both surfaces
        const dipped = st.b > 0.97 ? 1.1 : 0;
        st.V = ISO.follow(st.V, dipped, dt, 0.3, calm);
        if (Math.abs(st.V - dipped) < 0.002) st.V = dipped;
        draw();
        return st.b !== st.want || st.V !== dipped;
      };
      g.readout = () => (st.V > 0.05 ? `voltmeter ${st.V.toFixed(2)} V · zinc is the negative electrode · E = +0.34 − (−0.76) = 1.10 V` : "salt bridge out: no complete circuit · 0.00 V");
      draw();
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
