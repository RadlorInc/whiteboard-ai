// "marketstall cx cy k flutter=0..1 lab=0 lit=table|canopy|poles|crates|boards" — a PART (batch 6, economy): a street
// market stall standing on the pavement, its origin the ground point under its middle, its front toward the room (+y).
// 200 × 100 × 220 cm: a trestle table (a planked top on two A-frame trestles with cross rails), four steel poles on
// square foot plates holding a striped canopy that slopes down to the front (220 cm at the back, 200 at the front) with
// a scalloped valance; three crates of produce on the table (red, green and yellow apples) with a
// chalk price board stuck in each. The simplest business. flutter 0 → 1 sets how hard the wind ripples the valance.
// set({ flutter }). World: 1 = 1 cm. anchors: top (the table top's middle), front (the table's front edge middle)
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const HX = 100, HY = 50, ZT = 78, ZB = 220, ZF = 200;
  const CRATES = [[-58, "red", "1.20"], [0, "green", "0.90"], [58, "yellow", "1.50"]];
  ISO.add({
    name: "marketstall", title: "Market stall (part)", compare: null,
    about: "A street market stall 200 × 100 × 220 cm: trestle table, striped canopy on four poles, three crates of apples with chalk price boards; flutter ripples the canopy's edge in the wind. anchors: top front",
    line: "marketstall cx cy k flutter=0..1 lab=0 lit=table|canopy|poles|crates|boards",
    demo: { line: "marketstall 470 470 1.9 flutter=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { flutter: 1, lit: "canopy" }, hold: 3 }, { set: { lit: "crates" }, hold: 1.4 }, { set: { flutter: 0.3, lit: "boards" }, hold: 2 }, { set: { flutter: 0, lit: "table" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { amp: 0, want: B.num(o, "flutter", 0, 0, 1), ph: 0, lit: o.lit || "" };
      st.amp = st.want;
      const box = (x, y, z) => ISO.wbox(P, x, y, z, "mid");
      // a straight timber from p0 to p1 (cm), section a (along x) × b
      const beam = (p0, p1, a, b) => {
        const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], L = Math.hypot(...d), u = d.map((q) => q / L);
        const side = Math.abs(u[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0], n = [u[1] * side[2] - u[2] * side[1], u[2] * side[0] - u[0] * side[2], u[0] * side[1] - u[1] * side[0]];
        return ISO.box((s, w, q) => [p0[0] + u[0] * w * L + side[0] * s + n[0] * q, p0[1] + u[1] * w * L + side[1] * s + n[1] * q, p0[2] + u[2] * w * L + side[2] * s + n[2] * q], P, [-a / 2, a / 2], [0, 1], [-b / 2, b / 2], "mid");
      };
      const STEEL = ISO.T.steel, WOOD = B.PINE;
      const pole = (x, y, z1) => ISO.tinted(STEEL, box([x - 6, x + 6], [y - 6, y + 6], [0, 0.8]) + S(K.cylinder(x, y, 1.6, 0.8, z1 - 0.8, P, 14), { tone: "mid" }));
      // the trestles (A-frames in y–z at x = ±72) and their cross rails
      const trestle = (x) => beam([x, -40, 0], [x, -14, ZT - 3], 3.5, 5) + beam([x, 40, 0], [x, 14, ZT - 3], 3.5, 5) + box([x - 1.75, x + 1.75], [-30, 30], [28, 33]) + box([x - 2, x + 2], [-20, 20], [ZT - 6, ZT - 3]);
      const top = box([-96, 96], [-44, 44], [ZT - 3, ZT]);
      const seams = B.free(P, [-22, 0, 22].map((y) => [[-96, y, ZT + 0.01], [96, y, ZT + 0.01]]), "#8a6a3a", 0.6);
      // the crates, each full of apples on an insert, and the chalk board on a stick at its front
      const crateAt = ([x, c, price]) => {
        const c0 = B.APPLE_C[c];
        const sp = B.appleSpots(x - 18, x + 18, -13, 13, ZT + 8, 12, 4, 3, 3.8);
        const inside = sp.map(([ax, ay, az, i]) => B.apple(P, [ax, ay, az], { r: 3.8, c: i === 1 ? B.mix(c0, "#000000", 0.08) : i === 2 ? B.mix(c0, "#ffffff", 0.08) : c0 })).join("");
        return B.crate(P, [x, 0, ZT], { w: 40, d: 30, h: 15, inside, tint: B.OLDWOOD });
      };
      const board = ([x, , price]) => {
        const yb = 16.5, s = ISO.tinted(WOOD, box([x - 0.6, x + 0.6], [yb - 0.6, yb + 0.6], [ZT + 4, ZT + 22]));
        const art = `<rect width="16" height="10" rx=".6" fill="#2b302c" stroke="#8a6a3a" stroke-width=".9"/>` +
          B.text(8, 5.6, price, 4.2, "#f4f1e6", "middle", 700, "'Chalkboard SE','Comic Sans MS',cursive") + B.text(8, 8.4, "per kg", 1.9, "#d9d6cc", "middle", 600, "'Chalkboard SE','Comic Sans MS',cursive");
        return s + B.front(P, [x - 8, yb + 0.62, ZT + 30], art);
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 4, y: -HY - 4, w: 2 * HX + 8, d: 2 * HY + 8, r: 4 }, 0, ZB, P)}"/>` +
        `<g data-name="poles">${pole(-HX, -HY, ZB) + pole(HX, -HY, ZB)}</g>` +
        `<g data-name="table">${ISO.tinted(WOOD, trestle(-72) + trestle(72) + top)}${seams}</g>` +
        `<g data-name="crates" data-part="crates"></g><g data-name="boards" data-part="boards"></g>` +
        `<g data-name="poles">${pole(-HX, HY, ZF) + pole(HX, HY, ZF)}</g>` +
        `<g data-name="canopy"><g data-part="canopy"></g><g data-part="valance"></g></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, ZT], front: [0, 44, ZT] };
      const el = B.parts(g), w = ISO.writer();
      // the canopy: ten stripes from back to front, each a flat panel; a frame tube round its edge
      const RED = "#c8352a", CREAM = "#f6f0e2", NS = 10;
      const cz = (y) => ZB + ((y + HY) / (2 * HY)) * (ZF - ZB);
      let can = "";
      for (let i = 0; i < NS; i++) { const x0 = -HX + (2 * HX * i) / NS, x1 = -HX + (2 * HX * (i + 1)) / NS; can += B.poly(P, [[x0, -HY, ZB], [x1, -HY, ZB], [x1, HY, ZF], [x0, HY, ZF]], i % 2 ? CREAM : RED, "#7a2a20", 0.5); }
      can += `<path d="${K.pathOf([[-HX, -HY, ZB], [HX, -HY, ZB], [HX, HY, ZF], [-HX, HY, ZF]].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#5a5d62" stroke-width="${Math.max(1, k * 1.6).toFixed(2)}" stroke-linejoin="round"/>`;
      el.canopy.innerHTML = can;
      // the valance: a scalloped strip hanging 14 cm from the front edge, each stripe a tab; the wind lifts it outward
      const valance = (amp, ph) => {
        let s = "";
        for (let i = 0; i < NS; i++) {
          const x0 = -HX + (2 * HX * i) / NS, x1 = -HX + (2 * HX * (i + 1)) / NS, pts = [[x0, HY, ZF], [x1, HY, ZF]];
          const lift = (x) => amp * (4 + 3 * Math.sin(x * 0.05 + ph)), drop = (x) => 14 - amp * 2 * (1 + Math.sin(x * 0.05 + ph));
          for (let j = 0; j <= 8; j++) { const x = x1 - ((x1 - x0) * j) / 8, sc = 3 * Math.sin((j / 8) * Math.PI); pts.push([x, HY + lift(x), ZF - drop(x) - sc]); }
          s += B.poly(P, pts, i % 2 ? CREAM : RED, "#7a2a20", 0.5);
        }
        return s;
      };
      const draw = () => {
        const a = Math.round(st.amp * 100) / 100, ph = Math.round(st.ph * 30) / 30;
        w.rebuild(el.valance, `${a} ${a ? ph : 0}`, () => valance(a, a ? ph : 0));
        if (lab) w.rebuild(el.words, "1", () => B.word(P, [HX, HY, ZF - 30], "market stall") + B.word(P, [HX, HY, ZT], "table", { size: 12, color: "#667" }));
        B.light(w, g, st.lit);
      };
      // one build slice per crate of apples (12 apples each), the boards with the last
      CRATES.forEach((c, i) => ISO.later(() => { el.crates.insertAdjacentHTML("beforeend", crateAt(c)); if (i === 2) el.boards.innerHTML = CRATES.map(board).join(""); B.light(w, g, st.lit); }));
      g.set = (p) => {
        if (p.flutter !== undefined) st.want = B.num(p, "flutter", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the wind: a ripple running along the valance about once a second, its size easing to flutter
      g.update = (dt) => {
        if (ISO.still()) { st.amp = st.want; st.ph = 0; draw(); return false; }
        st.amp = ISO.follow(st.amp, st.want, dt, 0.6); if (Math.abs(st.amp - st.want) < 0.005) st.amp = st.want;
        st.ph = st.amp > 0 ? (st.ph + dt * 6) % (Math.PI * 2) : 0;
        draw();
        return st.amp > 0 || st.amp !== st.want;
      };
      g.readout = () => `market stall · 2 m table, canopy at 2.2 m · three crates of apples at 1.20, 0.90 and 1.50 per kg${st.want > 0 ? " · windy" : ""}`;
      draw();
      return g;
    },
  });
})();
