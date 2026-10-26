// "whitescreen cx cy k w=10..30 h=8..20 cz=6..40 rider=0|1 x=-70..70 show=blank|patch|shadow|fringes|rings size=0.2..12
// shift=0..20 c=red|green|amber|white lab=0 lit=screen|stand|light" — a PART (PARTS.md, batch 5): a white viewing screen
// standing square to the x axis, its white face toward +x (the light comes from +x), its origin the point under its
// middle: on the bench (rider=0: a cast foot and a rod) or on an optical bench's rail top (rider=1: it rides its own
// bench rider, so it slides with set({ x })). A painted board w × h cm in an aluminium edge, its centre cz cm over the
// origin (match a laser's `beam` height), gripped at the bottom by a clamp block with a thumbscrew.
// What the light makes on it (set({ show, size, shift, c }), size eased): patch = a pool of light `size` cm across
// (radius) brightest in the middle; shadow = a lit pool with a dark disc of radius size; fringes = bright and dark
// vertical bands `size` cm apart (two-slit cos² under the one-slit envelope); rings = circular fringes (radius
// size·√m) that move out as shift (fringes passed) grows. All of it is clipped to the white face.
// World units: 1 = 1 cm. anchors: centre (the face's middle) top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const WHITE = ISO.tint("#fdfdfb", ["#ecece8", "#f1f1ed", "#f5f5f2", "#f9f9f6"], "#6b6a64");
  const PAINT = ISO.tint("#d5dde6", ["#7d8b99", "#909dab", "#a3afbb", "#b8c2cc"], "#2b3640");
  const COL = { red: "#e5302a", green: "#22b04b", amber: "#ffb52e", white: "#ffe7a0" };
  const SHOWS = ["blank", "patch", "shadow", "fringes", "rings"];
  const X = 0.03;   // the light lies just in front of the white face (x = 0)

  // a closed loop on the face (y, z) as a board path
  const loop = (P, pts) => K.pathOf(pts.map(([y, z]) => K.iso([X, y, z], P)), true);
  const circle = (P, cy, cz, r, n = 36) => loop(P, Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return [cy + Math.cos(a) * r, cz + Math.sin(a) * r]; }));
  function lightSvg(P, show, size, shift, c, w, h, cz) {
    const col = COL[c] || COL.red, out = [];
    if (show === "patch" || show === "shadow") {
      const r = show === "shadow" ? Math.min(w, h) * 0.46 : size, pool = show === "shadow" ? COL.white : col;
      for (let i = 5; i >= 1; i--) out.push(`<path d="${circle(P, 0, cz, r * (0.35 + i * 0.13))}" fill="${pool}" fill-opacity="${(0.16 + (5 - i) * 0.07 + (show === "patch" ? ISO.clamp(1.5 / r, 0, 0.3) : 0)).toFixed(2)}"/>`);
      if (show === "shadow") out.push(`<path d="${circle(P, 0, cz, size * 1.12)}" fill="#3b3a36" fill-opacity=".22"/><path d="${circle(P, 0, cz, size)}" fill="#3b3a36" fill-opacity=".72"/>`);
    } else if (show === "fringes") {
      // bands across y: I = sinc²(envelope) · cos²(π y / size), bucketed into six brightness levels (one path each)
      const env = size * 5, step = Math.max(size / 10, w / 320), levels = [[], [], [], [], [], []];
      for (let y = -w / 2; y < w / 2; y += step) {
        const m = y + step / 2, b = (Math.PI * m) / env, e = b === 0 ? 1 : (Math.sin(b) / b) ** 2, I = e * Math.cos((Math.PI * m) / size) ** 2;
        const lv = Math.round(I * 6) - 1;
        if (lv >= 0) levels[Math.min(5, lv)].push(loop(P, [[y, cz - h * 0.36], [y + step + 0.01, cz - h * 0.36], [y + step + 0.01, cz + h * 0.36], [y, cz + h * 0.36]]));
      }
      levels.forEach((d, i) => d.length && out.push(`<path d="${d.join("")}" fill="${col}" fill-opacity="${((i + 1) / 6 * 0.92).toFixed(2)}"/>`));
    } else if (show === "rings") {
      // bright rings at r = size·√(m + frac(shift)): an annulus each (even-odd), thinner and fainter further out
      const f = shift - Math.floor(shift), rmax = Math.hypot(w, h) / 2, out2 = [];
      out.push(`<path d="${circle(P, 0, cz, rmax)}" fill="${col}" fill-opacity=".04"/>`);
      for (let m = 0; m < 16; m++) {
        const r = size * Math.sqrt(m + f), half = Math.max(0.06, size * 0.22 / Math.sqrt(m + f + 1));
        if (r - half > rmax) break;
        out2.push(`<path d="${circle(P, 0, cz, r + half)}${r - half > 0.05 ? circle(P, 0, cz, r - half) : ""}" fill="${col}" fill-rule="evenodd" fill-opacity="${ISO.clamp(0.9 - m * 0.04, 0.35, 0.9).toFixed(2)}"/>`);
      }
      out.push(...out2);
    }
    return out.join("");
  }

  ISO.add({
    name: "whitescreen", title: "White screen (part)", compare: null,
    about: "A white viewing screen on a stand or on its own optical bench rider: it shows a light patch, a shadow, two-slit fringes or circular fringes, and slides along the bench. anchors: centre top",
    line: "whitescreen cx cy k w=10..30 h=8..20 cz=6..40 rider=0|1 x=-70..70 show=blank|patch|shadow|fringes|rings size=0.2..12 shift=0..20 c=red|green|amber|white lab=0 lit=screen|stand|light",
    demo: {
      line: "whitescreen 470 470 14 w=24 h=15 cz=14 rider=1 show=patch size=3 c=amber lab=1",
      script: [{ set: {}, hold: 1 }, { set: { size: 0.6 }, hold: "settle" }, { set: { show: "fringes", size: 1.2, c: "red" }, hold: 1.4 }, { set: { c: "green", size: 0.9 }, hold: "settle" },
        { set: { show: "rings", size: 2, shift: 0, c: "red" }, hold: 1 }, { set: { shift: 2.5 }, hold: "settle" }, { set: { show: "shadow", size: 3, x: -8, lit: "stand" }, hold: "settle" }, { set: { show: "blank", x: 0, lit: "screen" }, hold: "settle" }],
    },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B03 = window.B03, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", rider = o.rider === "1";
      const w = ISO.clamp(ISO.num(o, "w", 15), 10, 30), h = ISO.clamp(ISO.num(o, "h", 10), 8, 20);
      const zmin = h / 2 + 1.6 + (rider ? 5.2 : 3.2), cz = ISO.clamp(ISO.num(o, "cz", rider ? 12 : 14), Math.max(6, zmin), Math.max(40, zmin));
      const z0 = cz - h / 2, z1 = cz + h / 2, zb = z0 - 1.6;   // board bottom, top, the clamp block's bottom
      const st = { x: ISO.clamp(ISO.num(o, "x", 0), -70, 70), size: ISO.clamp(ISO.num(o, "size", 3), 0.2, 12), shift: ISO.clamp(ISO.num(o, "shift", 0), 0, 20) };
      const want = { ...st }, m = { show: SHOWS.includes(o.show) ? o.show : "blank", c: COL[o.c] ? o.c : "red" };
      let lit = o.lit || "";
      // the stand: a cast foot with rubber pads and a rod (rider=0) or the bench rider and its post (rider=1)
      let stand;
      if (rider) { const r = B03.rider(P, zb + 0.3); stand = r.carriage + r.screw + r.post; }
      else {
        stand = `<path class="iso-halo" d="${K.haloOf({ x: -4.2, y: -6.2, w: 8.4, d: 12.4, r: 1 }, 0, 1.4, P)}"/>`;
        for (const y of [-5, 5]) for (const x of [-3, 3]) stand += ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 0.6, 0, 0.3, P, 14), { tone: "lo" }));
        stand += ISO.tinted(PAINT, ISO.wbox(P, [-4, 4], [-6, 6], [0.3, 1.4], "mid")) + ISO.tinted(PAINT, S(K.cylinder(0, 0, 1.3, 1.4, 0.5, P, 24), { tone: "mid" }));
        stand += ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.6, 1.9, zb + 0.3 - 1.9, P, 20, 0.1), { tone: "hi", crease: "none" }));
      }
      // the board: white face, an aluminium edge all round (top and bottom full width, sides between), corner screws
      const yw = w / 2, e = 0.45, edge = (y0, y1, za, zc) => ISO.tinted(B03.ALU, ISO.wbox(P, [-0.75, 0.08], [y0, y1], [za, zc], "mid"));
      const board = ISO.tinted(WHITE, ISO.wbox(P, [-0.6, 0], [-yw, yw], [z0, z1], "hi")) + edge(-yw - e, yw + e, z1, z1 + e) + edge(-yw - e, -yw, z0, z1) + edge(yw, yw + e, z0, z1) + edge(-yw - e, yw + e, z0 - e, z0) +
        D([[-yw - e / 2, z1 + e / 2], [yw + e / 2, z1 + e / 2], [-yw - e / 2, z0 - e / 2], [yw + e / 2, z0 - e / 2]].map(([y, z]) => K.iso([0.09, y, z], P)), { size: 0.4 });
      // the clamp block gripping the bottom edge (the post or rod goes into it), its thumbscrew on the near side
      const Ft = B03.Y([-0.3, 1.6, zb + 0.8]);
      const clamp = ISO.tinted(B03.BLACK, ISO.wbox(P, [-1.5, 0.9], [-1.6, 1.6], [zb, z0 + 0.6], "mid")) + ISO.tinted(ISO.T.steel, S(G.disc(0, 0.35, 0.2, Ft, P), { tone: "mid" })) + B03.knob(P, Ft, 0.35, 0.95, 0.5);
      const id = B03.clipId(), face = loop(P, [[-yw, z0], [yw, z0], [yw, z1], [-yw, z1]]);
      g.innerHTML = `<g data-part="move"><g data-name="stand">${stand}</g><g data-name="screen">${board}</g>` +
        `<clipPath id="${id}"><path d="${face}"/></clipPath><g data-name="light"><g data-part="light" clip-path="url(#${id})"></g></g><g data-name="stand">${clamp}</g>` +
        `<g data-part="words">${LAB.word(P, lab, [0, -yw, z1 + 1], "screen", "#556", { dy: -6 })}</g></g>`;
      const el = LAB.parts(g), wr = ISO.writer();
      const draw = () => {
        wr.attr(el.move, "transform", K.translateAlong(P, [st.x, 0, 0]));
        const sz = Math.round(st.size * 25) / 25, sh = Math.round(st.shift * 40) / 40;   // redrawn every 0.04 cm / 1/40 fringe
        wr.rebuild(el.light, `${m.show} ${m.c} ${sz} ${m.show === "rings" ? sh : ""}`, () => lightSvg(P, m.show, sz, sh, m.c, w, h, cz));
        g.anchors = { centre: [+st.x.toFixed(3), 0, cz], top: [+st.x.toFixed(3), 0, z1 + e] };
        B03.light(wr, g, lit);
      };
      g.set = (p) => {
        if (p.x !== undefined && Number.isFinite(+p.x)) want.x = ISO.clamp(+p.x, -70, 70);
        if (p.size !== undefined && Number.isFinite(+p.size)) want.size = ISO.clamp(+p.size, 0.2, 12);
        if (p.shift !== undefined && Number.isFinite(+p.shift)) want.shift = ISO.clamp(+p.shift, 0, 20);
        if (SHOWS.includes(p.show)) m.show = p.show;
        if (COL[p.c]) m.c = p.c;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        let moving = false;
        for (const [key, tau, eps] of [["x", 0.4, 0.01], ["size", 0.35, 0.005], ["shift", 0.9, 0.002]]) {
          st[key] = ISO.follow(st[key], want[key], dt, tau, ISO.still());
          if (Math.abs(st[key] - want[key]) < eps) st[key] = want[key];
          moving = moving || st[key] !== want[key];
        }
        draw();
        return moving;
      };
      g.readout = () => {
        const what = { blank: "blank", patch: `a patch of light ${(2 * st.size).toFixed(1)} cm across`, shadow: `a shadow ${(2 * st.size).toFixed(1)} cm across`, fringes: `fringes ${(st.size * 10).toFixed(1)} mm apart`, rings: `circular fringes, ${st.shift.toFixed(1)} passed` }[m.show];
        return `white screen ${w} × ${h} cm${rider ? " on a bench rider" : ""} · ${what}`;
      };
      draw();
      return g;
    },
  });
})();
