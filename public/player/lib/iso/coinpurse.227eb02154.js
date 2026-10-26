// "coinpurse cx cy k zip=0..1 lab=0 lit=pouch|zip|coins" — a PART (batch 6, money): a small zip pouch for coins
// standing on a table, its origin the table point under its middle, its front toward the room (+y). A padded fabric
// pouch 10 × 3 × 8 cm with rounded bottom corners and a stitched seam round its front, a zip along the top: two fabric
// tapes, metal teeth, an end stop at each end and a slider with its pull tab hanging down the front. zip 0 = shut
// (the slider at the right end), 1 = open (the slider at the left end, the tapes parted into a mouth with coins
// showing inside: generic gold and silver coins, a plain 1 on each). set({ zip }) runs the slider along.
// World: 1 = 1 cm. anchors: slider (the pull tab's end, where fingers hold it) mouth (the middle of the opening)
(() => {
  const K = window.K;
  const HX = 5, HY = 1.4, ZT = 7.4, XL = -4.3, XR = 4.3, TAPE = 0.35;
  const FABRIC = ["#2c6f73", "#4f9a9c", "#1a4447"];
  ISO.add({
    name: "coinpurse", title: "Coin purse (part)", compare: null,
    about: "A small zip pouch for coins: padded fabric with a stitched seam, a zip with teeth, end stops and a pull tab; zip opens it to show the coins inside. anchors: slider mouth",
    line: "coinpurse cx cy k zip=0..1 lab=0 lit=pouch|zip|coins",
    demo: { line: "coinpurse 480 400 34 zip=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { zip: 1, lit: "coins" }, hold: "settle" }, { set: { zip: 0.5, lit: "zip" }, hold: "settle" }, { set: { zip: 0, lit: "pouch" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { zip: B.num(o, "zip", 0, 0, 1), lit: o.lit || "" };
      st.want = st.zip;
      const [col, light, ink] = FABRIC;
      // the pouch: an outline in x–z (flat top under the zip, puffed sides, round bottom corners), a prism along y
      // the pouch: a lower body (an outline in x–z with round bottom corners, a prism along y) and its top pinched in
      // toward the zip (a frustum from 5 cm up)
      const ZB = 5, ZZ = ZT - 0.4, out = [[-HX, ZB], ...ISO.arc(-HX + 1.2, 1.2, 1.2, Math.PI, Math.PI * 1.5, 6), ...ISO.arc(HX - 1.2, 1.2, 1.2, Math.PI * 1.5, Math.PI * 2, 6), [HX, ZB]];
      const seam = [[-HX + 0.45, ZB - 0.3], ...ISO.arc(-HX + 1.2, 1.2, 0.75, Math.PI, Math.PI * 1.5, 6), ...ISO.arc(HX - 1.2, 1.2, 0.75, Math.PI * 1.5, Math.PI * 2, 6), [HX - 0.45, ZB - 0.3]].map(([x, z]) => [x, HY + 0.01, z]);
      const V = [[-HX, -HY, ZB], [HX, -HY, ZB], [HX, HY, ZB], [-HX, HY, ZB], [-HX + 0.5, -0.5, ZZ], [HX - 0.5, -0.5, ZZ], [HX - 0.5, 0.5, ZZ], [-HX + 0.5, 0.5, ZZ]];
      const pouch = ISO.prismY(P, out, -HY, HY, [ink, light], col, ink, B.stitch(P, seam, "#e8f2f2", 0.7, "1.4 1")) + ISO.poly(V, ISO.BOX_F, P, "mid");
      // the zip, shut from the left stop to the slider at xs and open (a mouth between parted tapes) from xs to the right
      const zipSvg = (xs) => {
        const s = [], half = (x) => (x <= xs ? 0 : 0.95 * Math.sin((Math.PI * (x - xs)) / (XR + 0.3 - xs))), N = 14;
        const xsAt = (i) => xs + ((XR + 0.3 - xs) * i) / N, zz = ZT - 0.38;
        if (XR - xs > 0.3) {
          const lip = [], lipB = [];
          for (let i = 0; i <= N; i++) { const x = xsAt(i); lip.push([x, half(x), zz]); lipB.push([x, -half(x), zz]); }
          const mouth = [...lip, ...lipB.reverse()].map((p) => K.iso(p, P)), id = `b40m${B.uid = (B.uid || 0) + 1}`;
          s.push(`<clipPath id="${id}"><path d="${K.pathOf(mouth, true)}"/></clipPath><path d="${K.pathOf(mouth, true)}" fill="#14191a"/>`);
          // coins inside, seen through the mouth: lying tilted on the pile below
          const coins = [[xs + (XR - xs) * 0.3, -0.2, "gold"], [xs + (XR - xs) * 0.55, 0.3, "silver"], [xs + (XR - xs) * 0.78, -0.1, "gold"], [xs + (XR - xs) * 0.45, -0.6, "silver"]];
          s.push(`<g data-name="coins" clip-path="url(#${id})">${coins.map(([x, y, m]) => B.coin(P, [x, y, ZT - 1.2], 1.1, 0.2, m, true, 0)).join("")}</g>`);
          // the two tapes along the mouth's edges, each with its row of teeth
          for (const sy of [1, -1]) {
            const edge = [], outer = [];
            for (let i = 0; i <= N; i++) { const x = xsAt(i), h = sy * half(x); edge.push([x, h, ZT - 0.36]); outer.push([x, h + sy * TAPE, ZT - 0.36]); }
            s.push(TE.quad(P, [...edge, ...outer.reverse()], "#2a2d31", "#111214", 0.5));
            s.push(`<path data-free d="${edge.slice(1, -1).map((p) => K.pathOf([K.iso(p, P), K.iso([p[0], p[1] + sy * 0.14, p[2]], P)])).join("")}" stroke="#c9ccd1" stroke-width="${Math.max(0.6, window.G.scaleOf(P) * 0.12).toFixed(2)}"/>`);
          }
        }
        // the shut part: one band of tape with the meshed teeth across it
        if (xs - XL > 0.05) {
          s.push(TE.box(P, [XL - 0.3, xs], [-TAPE, TAPE], [ZT - 0.42, ZT - 0.34], "mid", ISO.T.plastic));
          const teeth = []; for (let x = XL - 0.15; x < xs - 0.05; x += 0.2) teeth.push(K.pathOf([K.iso([x, -0.12, ZT - 0.33], P), K.iso([x, 0.12, ZT - 0.33], P)]));
          s.push(`<path data-free d="${teeth.join("")}" stroke="#c9ccd1" stroke-width="${Math.max(0.6, window.G.scaleOf(P) * 0.1).toFixed(2)}"/>`);
        }
        // the end stops, the slider and its pull tab down the front
        s.push(TE.box(P, [XL - 0.45, XL - 0.25], [-0.25, 0.25], [ZT - 0.42, ZT - 0.2], "mid", ISO.T.steel) + TE.box(P, [XR + 0.3, XR + 0.5], [-0.25, 0.25], [ZT - 0.42, ZT - 0.2], "mid", ISO.T.steel));
        s.push(TE.box(P, [xs - 0.35, xs + 0.35], [-0.45, 0.45], [ZT - 0.42, ZT - 0.1], "mid", ISO.T.steel));
        const tab = [[xs - 0.3, 0.5, ZT - 0.2], [xs + 0.3, 0.5, ZT - 0.2], [xs + 0.36, 1.3, ZT - 1.9], [xs - 0.36, 1.3, ZT - 1.9]];
        s.push(TE.quad(P, tab, "#d9dadd", "#3c3f45", 0.6) + TE.quad(P, [[xs - 0.14, 0.98, ZT - 1.25], [xs + 0.14, 0.98, ZT - 1.25], [xs + 0.16, 1.2, ZT - 1.65], [xs - 0.16, 1.2, ZT - 1.65]], "#55595f", "#3c3f45", 0.5));
        return s.join("");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1.2 }, 0, 0.02, P)}"/>` +
        `<g data-name="pouch">${ISO.tinted(ISO.tint(light, [ink, col, col, light], ink), pouch)}</g><g data-name="zip" data-part="zip"></g><g data-part="words"></g>`;
      const xsOf = (z) => XR - (XR - XL) * z;
      g.anchors = { slider: [+xsOf(st.zip).toFixed(2), 1.3, ZT - 1.9], mouth: [(xsOf(st.zip) + XR) / 2, 0, ZT - 0.4] };
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(K.iso([HX, 0, ZT + 0.8], P), "coin purse", "#556", { size: 13, anchor: "start" });
      const draw = () => {
        const zq = Math.round(st.zip * 40) / 40;
        w.rebuild(el.zip, `${zq}`, () => zipSvg(xsOf(zq)));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.zip !== undefined) st.want = ISO.clamp(+p.zip, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the slider is pulled along at an easy steady pace, slowing at the end
      g.update = (dt) => {
        st.zip = ISO.follow(st.zip, st.want, dt, 0.3, ISO.still());
        if (Math.abs(st.zip - st.want) < 0.004) st.zip = st.want;
        draw();
        return st.zip !== st.want;
      };
      g.readout = () => `coin purse · zip ${st.want > 0.95 ? "open" : st.want < 0.05 ? "shut" : `${Math.round(st.want * 100)}% open`}${st.want > 0.2 ? " · coins showing" : ""}`;
      draw();
      return g;
    },
  });
})();
