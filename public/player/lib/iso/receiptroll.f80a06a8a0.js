// "receiptroll cx cy k len=0..1 lab=0 lit=roll|core|strip" — a PART (batch 6, money): a till's thermal paper roll
// lying on a counter, 8 cm across and 8 cm wide, its origin the counter point under its middle (its axis along x). The
// paper runs off the top of the roll, falls in a soft curve behind it and lies along the counter (toward −y) as a
// printed till receipt up to 30 cm long: RECEIPT, the items with their prices, TOTAL, PAID, CHANGE (true sums), a
// barcode and THANK YOU, its far end curling up. The roll's end shows the wound layers and the cardboard core.
// len = how much has run out (0 a short tail, 1 the whole receipt); the strip slides out as paper does. set({ len }).
// World: 1 = 1 cm. anchors: top end
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 4, HX = 3.9, DROP = 7, FLAT = 23;
  const PAPER = ISO.tint("#fbfbf8", ["#c9ccd0", "#d6d8db", "#e2e4e6", "#eeeff0"], "#7d848c");
  ISO.add({
    name: "receiptroll", title: "Receipt roll (part)", compare: null,
    about: "A thermal paper till roll 8 cm across on its cardboard core, its paper running off into a printed receipt (items, TOTAL, PAID, CHANGE, THANK YOU) lying along the counter with a curling end; len runs more of it out. anchors: top end",
    line: "receiptroll cx cy k len=0..1 lab=0 lit=roll|core|strip",
    demo: { line: "receiptroll 400 360 19 len=0.2 lab=1", script: [{ set: {}, hold: 1 }, { set: { len: 1, lit: "strip" }, hold: "settle" }, { set: { lit: "roll" }, hold: 1 }, { set: { lit: "core" }, hold: 1 }, { set: { len: 0.5, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { len: B.num(o, "len", 0.5, 0, 1), lit: o.lit || "" };
      st.want = st.len;
      const ribbon = (pts, fill, stroke = "#8d949c") => {
        // a paper ribbon across x through (y, z) points: one quad per step, then its two edges
        let s = "";
        for (let i = 0; i < pts.length - 1; i++) { const [y0, z0] = pts[i], [y1, z1] = pts[i + 1]; s += B.quad(P, [[-HX, y0, z0], [HX, y0, z0], [HX, y1, z1], [-HX, y1, z1]], fill, fill, 0.3); }
        const edge = (x) => K.pathOf(pts.map(([y, z]) => K.iso([x, y, z], P)));
        return s + `<path d="${edge(-HX)}${edge(HX)}" fill="none" stroke="${stroke}" stroke-width="0.6"/>`;
      };
      // the fall behind the roll: a cubic from the roll's top to the counter
      const fall = []; for (let i = 0; i <= 14; i++) { const u = i / 14, a = 1 - u; fall.push([a * a * a * 0 + 3 * a * a * u * -4 + 3 * a * u * u * -4.6 + u * u * u * -DROP, a * a * a * 2 * R + 3 * a * a * u * 2 * R + 3 * a * u * u * 0 + 0]); }
      const shade = fall.map(([y, z], i) => (i < 5 ? "#eef0f2" : i < 10 ? "#dfe2e6" : "#e8eaed"));
      const fallSvg = fall.slice(0, -1).map(([y0, z0], i) => B.quad(P, [[-HX, y0, z0], [HX, y0, z0], [HX, fall[i + 1][0], fall[i + 1][1]], [-HX, fall[i + 1][0], fall[i + 1][1]]], shade[i], shade[i], 0.3)).join("") +
        `<path d="${K.pathOf(fall.map(([y, z]) => K.iso([-HX, y, z], P)))}${K.pathOf(fall.map(([y, z]) => K.iso([HX, y, z], P)))}" fill="none" stroke="#8d949c" stroke-width="0.6"/>`;
      // the lying strip at len = 1: its far end at y = -DROP - FLAT, the receipt's top there
      const yFar = -DROP - FLAT, rc = B.receipt(2 * HX, { items: 7, seed: 6 });
      const art = `<rect width="${2 * HX}" height="${FLAT + 0.3}" fill="#fbfbf8" stroke="#8d949c" stroke-width="0.06"/>${rc.svg}`;
      const curl = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 - (i / 12) * Math.PI * 1.25; curl.push([yFar + Math.cos(a) * 0.9, 0.9 + Math.sin(a) * 0.9]); }
      const [cDefs, cOpen] = B.clip(B.above(P, [-40, -DROP, 0], [40, -DROP, 0]));
      // the roll: wound paper, its end face with the layers, the core ring and its hole
      const F = LAB.X([0, 0, R]);
      const roll = ISO.tinted(PAPER, S(G.disc(-HX, HX, R, F, P, { steps: 48 }), { tone: "mid" })) +
        [3.6, 3.1, 2.6, 2.1].map((r) => `<path d="${G.circleOf(F, HX + 0.01, r, P)}" fill="none" stroke="#c3c7cc" stroke-width="0.4"/>`).join("");
      const core = `<path d="${G.circleOf(F, HX + 0.02, 1.5, P)}" fill="#c8a16f" stroke="#5e4220" stroke-width="0.6"/><path d="${G.circleOf(F, HX + 0.03, 1.2, P)}" fill="none" stroke="#a8814e" stroke-width="0.4"/><path d="${G.circleOf(F, HX + 0.04, 0.95, P)}" fill="#3a2a18"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 1, y: yFar - 2, w: 2 * HX + 2, d: -yFar + R + 3, r: 1 }, 0, 0.05, P)}"/><defs>${cDefs}</defs>` +
        `<g data-name="strip">${cOpen}<g data-part="flat">${B.flat(P, [-HX, yFar, 0.02], [1, 0, 0], [0, 1, 0], art)}${ribbon(curl, "#e9ebee")}</g></g>${fallSvg}</g>` +
        `<g data-name="roll">${roll}</g><g data-name="core">${core}</g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, 2 * R], end: [0, -DROP - FLAT * st.len, 0] };
      const el = LAB.parts(g), w = ISO.writer(), o0 = K.iso([0, 0, 0], P), oy = K.iso([0, 1, 0], P);
      const draw = () => {
        const s = (1 - st.len) * FLAT;
        w.attr(el.flat, "transform", `translate(${((oy[0] - o0[0]) * s).toFixed(2)} ${((oy[1] - o0[1]) * s).toFixed(2)})`);
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([-HX, 0, 2 * R + 1], P), "receipt roll", "#556", { size: 13, anchor: "end" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.len !== undefined) st.want = B.num(p, "len", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.len = ISO.follow(st.len, st.want, dt, 0.4, ISO.still());
        if (Math.abs(st.len - st.want) < 0.001) st.len = st.want;
        draw();
        return st.len !== st.want;
      };
      g.readout = () => `receipt roll · ${(DROP + FLAT * st.want).toFixed(0)} cm of paper out · total ${rc.total.toFixed(2)}, paid ${rc.paid.toFixed(2)}, change ${(rc.paid - rc.total).toFixed(2)}`;
      draw();
      return g;
    },
  });
})();
