// "fridge cx cy height open=1 lab=1" — a two-door fridge-freezer, built from its parts.
// Two front feet and two rear rollers under the plinth, a kickplate grille; the insulated cabinet (5 cm walls) with a
// divider between the freezer (below, its own door, gasket and recessed handle) and the fridge (above). In the fridge:
// shelf runners on both walls, two glass shelves with front trims, the glass cover over the crisper drawer, a few things
// to eat, the light housing under the roof with its lens and the thermostat dial. The fridge door hangs on hinge pins
// (top plate and middle bracket) and carries its magnetic gasket, the moulded inner liner and three door bins (bottles,
// jars, the egg tray). set({ open: 1 }) swings it about its true hinge axis to 100°; its outer and inner sides are
// re-sorted by depth as it turns, and the light comes on as the door leaves the switch. 1 unit = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const X = 30, BK = -30, FR = 28, WALL = 5, TOP = 180, DIV = [70, 76];
  const FZ = [11, 74.5], DZ = [76.6, 179.4], AXIS = [-28.5, 32.5], OPEN = (100 * Math.PI) / 180;
  const SHELVES = [92, 114, 136], BINS = [92, 118, 146];
  const zF = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yF = (o) => G.frameAlong(o, [0, 1, 0]);
  const LINER = ISO.tint("#fbfcfd", ["#cfd6dd", "#dae0e6", "#e5e9ee", "#f0f3f6"], "#56606b");
  const LIT = ISO.tint("#fffbea", ["#e8dcb4", "#efe5c5", "#f5edd5", "#faf5e4"], "#6f6440");
  const SKIN = ISO.tint("#f6f7f8", ["#c3c8cd", "#d0d4d8", "#dde0e3", "#e9ebed"], "#4a525b");
  const BOTTLE = [[0, 0], [0, 2.6], [12, 2.6, 1], [15.5, 1.3, 1], [17, 1.1], [17, 0]];

  ISO.add({
    name: "fridge", title: "Fridge", compare: "fridge 480 270 300",
    about: "A two-door fridge-freezer: open the fridge door and the light comes on over the shelves; the fridge is at 4 °C, the freezer at −18 °C.",
    line: "fridge cx cy height open=1 lab=1",
    demo: { line: "fridge 480 270 320", script: [{ set: { open: 1 }, hold: "settle" }, { set: { open: 0 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.35, H = size * 1.4;
      const { P, g } = ISO.frame([[-X, BK, 0], [X, BK, 0], [X, FR + 7, 0], [-42, 91, DZ[0]], [-42, 91, TOP], [-X, BK, TOP + 2], [X, FR + 7, TOP]], cx, cy, W, H, { azimuth: 58, elevation: 18, pad: size * 0.1 }, parent);
      const box = (x, y, z, tone = "mid", tint = "", lit = false) => ISO.tinted(tint, ISO.wbox(P, x, y, z, tone, lit));
      const quad = (pts, attrs) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" ${attrs}/>`;
      const out = [];

      // ── feet and rollers, plinth, kickplate grille
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -X, y: BK, w: 2 * X, d: FR + 6 - BK, r: 2 }, 0, 4, P)}"/>`);
      for (const x of [-X + 4, X - 4]) out.push(ISO.tinted(ISO.T.rubber, S(G.disc(-0.8, 0.8, 1.6, G.frameAlong([x, BK + 4, 1.6], [1, 0, 0]), P), { tone: "mid" })), box([x - 1.2, x + 1.2], [BK + 2.5, BK + 5.5], [3.2, 4], "lo"));
      out.push(box([-X + 1, X - 1], [BK + 1, FR - 4], [4, 10], "lo"));
      for (const x of [-X + 4, X - 4]) out.push(S(K.cylinder(x, FR - 6, 1.8, 0, 1, P, 20), { tone: "lo" }), S(K.cylinder(x, FR - 6, 1.1, 1, 3, P, 16), { tone: "mid" }));
      out.push(box([-X + 1, X - 1], [FR - 4, FR - 2], [2, 10.4], "mid"));
      const vent = [];
      for (let i = 0; i < 14; i++) { const x = -24 + i * 3.6; vent.push(quad([[x, FR - 1.98, 4], [x + 1.6, FR - 1.98, 4], [x + 1.6, FR - 1.98, 8.6], [x, FR - 1.98, 8.6]], `fill="#3a3e44" stroke="#1f2226" stroke-width=".4"`)); }
      out.push(vent.join(""));
      // ── cabinet: back, far wall, floor and divider; the fridge interior (lit while the door is open)
      out.push(box([-X + WALL, X - WALL], [BK, BK + WALL], [10, TOP - 4], "lo", LINER), box([-X, -X + WALL], [BK, FR], [10, TOP - 4], "mid", LINER));
      out.push(box([-X + WALL, X - WALL], [BK + WALL, FR], [10, 14], "mid", LINER), box([-X + WALL, X - WALL], [BK + WALL, FR], DIV, "mid", LINER));
      const inside = [];
      // runners (ribs moulded into both walls), the crisper drawer and the glass cover over it
      const rib = (x0, z) => box([x0, x0 + 1], [BK + WALL + 2, 14], [z - 1, z], "hi");
      for (const z of SHELVES) inside.push(rib(-X + WALL, z));
      inside.push(box([-23, 23], [BK + WALL + 1, 13], [DIV[1], DIV[1] + 14], "mid"), box([-23, 23], [13, 15.5], [DIV[1], DIV[1] + 15], "hi", ISO.T.glass), box([-8, 8], [15.5, 16.5], [DIV[1] + 11, DIV[1] + 13], "mid"));
      for (const z of SHELVES) {
        inside.push(box([-X + WALL + 1, X - WALL - 1], [BK + WALL + 1, 13], [z, z + 0.6], "hi", ISO.T.glass), box([-X + WALL + 1, X - WALL - 1], [13, 14.6], [z - 0.6, z + 1.2], "mid"));
        // what's on each shelf (the crisper cover carries nothing)
        if (z === SHELVES[1]) inside.push(box([-18, -11], [-14, -7], [z + 0.6, z + 19], "hi", ISO.T.blue), box([-16.5, -12.5], [-12, -9], [z + 19, z + 20.5], "hi"),
          S(K.cylinder(4, -8, 4, z + 0.6, 9, P, 32), { tone: "hi" }), ISO.tinted(ISO.T.red, S(K.cylinder(4, -8, 4.2, z + 9.6, 1.6, P, 32), { tone: "hi" })));
        if (z === SHELVES[2]) inside.push(box([-16, -2], [-16, -6], [z + 0.6, z + 6.6], "hi", ISO.T.amber), ISO.tinted(ISO.T.green, S(G.lathe([[0, 0], [0, 4], [4, 6.5, 1], [4.6, 7], [4.6, 0]], zF([10, -6, z + 0.6]), P, { steps: 40 }), { tone: "hi" })));
      }
      // light housing under the roof: lens (glows) and thermostat dial
      inside.push(box([-14, 14], [-6, 10], [166, TOP - 4], "mid"), `<g data-part="lens"></g>`, `<g data-part="dial"></g>`);
      out.push(`<g data-part="inside">${inside.join("")}</g>`);
      for (const z of SHELVES) out.push(rib(X - WALL - 1, z));
      // near wall and roof (cabinet skin), the freezer door with its gasket and recessed handle, the middle hinge
      out.push(box([X - WALL, X], [BK, FR], [10, TOP - 4], "mid", SKIN), box([-X, X], [BK, FR], [TOP - 4, TOP], "mid", SKIN));
      out.push(box([-X + 1, X - 1], [FR, FR + 1], [FZ[0] + 1, FZ[1] - 1], "mid", ISO.T.rubber), box([-X, X], [FR + 1, FR + 6], FZ, "hi", SKIN));
      out.push(quad([[10, FR + 6.01, FZ[1] - 4], [26, FR + 6.01, FZ[1] - 4], [26, FR + 6.01, FZ[1] - 1], [10, FR + 6.01, FZ[1] - 1]], `fill="#9aa1a8" stroke="#4a525b" stroke-width=".5"`), box([10, 26], [FR + 6, FR + 7], [FZ[1] - 1, FZ[1]], "hi", SKIN));
      out.push(box([-X, -X + 5], [FR, FR + 6], [FZ[1], DZ[0] - 0.6], "mid", ISO.T.steel), ISO.tinted(ISO.T.steel, S(K.cylinder(AXIS[0], AXIS[1], 0.6, DZ[0] - 0.6, 0.6, P, 12), { tone: "hi" })));
      out.push(`<g data-part="door"><g data-part="dout"></g><g data-part="din"></g></g>`);
      // top hinge: a plate on the roof over the door's hinge corner, two screws, the pin down into the door
      out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(AXIS[0], AXIS[1], 0.6, DZ[1], TOP - DZ[1], P, 12), { tone: "hi" }) + ISO.wbox(P, [-X, -X + 6], [FR - 8, FR + 6], [TOP, TOP + 1.4], "mid")));
      out.push(K.dotsSvg([K.iso([-X + 3, FR - 5, TOP + 1.4], P), K.iso([-X + 3, FR - 1, TOP + 1.4], P)], { size: 0.5 }));
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), wr = ISO.writer();

      // The door's own frame: u across from the hinge edge (0–60), w up (world z), v out from the cabinet face
      // (gasket 0–1, panel 1–6). The hinge axis is at u 1.5, v 4.5; a door at angle a turns about it.
      const doorOf = (a, seen) => {
        const c = Math.cos(a), s = Math.sin(a);
        const at = (u, w, v) => [AXIS[0] + (u - 1.5) * c - (v - 4.5) * s, AXIS[1] + (u - 1.5) * s + (v - 4.5) * c, w];
        // closed, the door is drawn with world boxes (so the audit sees it); open, with boxes in the door's frame
        const b = (u, w, v, tone = "hi", tint = "") => ISO.tinted(tint, a === 0 ? ISO.wbox(P, [-X + u[0], -X + u[1]], [FR + v[0], FR + v[1]], w, tone) : ISO.box(at, P, u, w, v, tone));
        const outer = [b([0, 60], DZ, [1, 6], "hi", SKIN)];
        // recessed handle: the finger pocket on the face and the lip under it, at the free edge
        outer.push(`<path d="${K.pathOf([[40, DZ[0] + 1], [56, DZ[0] + 1], [56, DZ[0] + 4], [40, DZ[0] + 4]].map(([u, w]) => K.iso(at(u, w, 6.01), P)), true)}" fill="#9aa1a8" stroke="#4a525b" stroke-width=".5"/>`);
        outer.push(b([40, 56], [DZ[0], DZ[0] + 1], [6, 7], "hi", SKIN));
        const inner = [];
        if (seen) {
        // magnetic gasket round the inner face, then the moulded liner
        inner.push(b([2, 58], [DZ[0] + 1.4, DZ[0] + 4.4], [0, 1], "mid", ISO.T.rubber), b([2, 5], [DZ[0] + 4.4, DZ[1] - 4.4], [0, 1], "mid", ISO.T.rubber), b([55, 58], [DZ[0] + 4.4, DZ[1] - 4.4], [0, 1], "mid", ISO.T.rubber), b([2, 58], [DZ[1] - 4.4, DZ[1] - 1.4], [0, 1], "mid", ISO.T.rubber));
        inner.push(b([5, 55], [DZ[0] + 4.4, DZ[1] - 4.4], [-3, 1], "mid", LINER));
        BINS.forEach((wb, i) => {
          inner.push(b([6, 54], [wb, wb + 1], [-10, -3], "hi", ISO.T.glass));
          if (i === 0) [[13, 17, ISO.T.green], [21, 14, ISO.T.blue], [29, 17, ISO.T.glass], [37, 12, ISO.T.amber]].forEach(([u, h, tint]) => {
            const c0 = at(u, wb + 1, -6.5), F = zF(c0), sc = h / 17;
            inner.push(ISO.tinted(tint, S(G.lathe(BOTTLE.map(([q, r, f]) => (f ? [q * sc, r, f] : [q * sc, r])), F, P, { steps: 18, smooth: false }), { tone: "hi" })), S(K.cylinder(c0[0], c0[1], 1.3, wb + 1 + h, 1.4, P, 14), { tone: "mid" }));
          });
          if (i === 1) { const j = at(16, wb + 1, -6.5), k = at(27, wb + 1, -6.5); inner.push(S(K.cylinder(j[0], j[1], 3, wb + 1, 6, P, 24), { tone: "hi" }), ISO.tinted(ISO.T.red, S(K.cylinder(j[0], j[1], 3.1, wb + 7, 1.2, P, 24), { tone: "hi" })), ISO.tinted(ISO.T.amber, b([33, 45], [wb + 1, wb + 5], [-9, -4], "hi"))); }
          if (i === 2) {
            inner.push(b([8, 30], [wb + 1, wb + 2], [-9.5, -3.5], "mid"));
            const eggs = [];
            for (const v of [-8, -5]) for (const u of [10.5, 15.5, 20.5, 25.5]) eggs.push(at(u, wb + 3.6, v));
            eggs.sort((p, q) => K.depthOf(p, P) - K.depthOf(q, P)).forEach((p) => inner.push(ISO.tinted(ISO.T.amber, S(G.sphereOf(p, 1.6, P, { steps: 12 }), { tone: "hi" }))));
          }
          inner.push(b([6, 7], [wb + 1, wb + 4], [-9, -3], "hi", ISO.T.glass), b([53, 54], [wb + 1, wb + 4], [-9, -3], "hi", ISO.T.glass), b([6, 54], [wb + 1, wb + 5], [-10, -9], "hi", ISO.T.glass));
        });
        }
        return { outer: outer.join(""), inner: inner.join(""), at };
      };
      const memo = new Map();
      const sort = ISO.sorter(P, el.door);
      const st = { a: o.open === "1" ? 1 : 0, aT: o.open === "1" ? 1 : 0 };
      const draw = () => {
        const k = Math.round(st.a * 30) / 30, a = k * OPEN, on = k > 0.12;
        if (!memo.has(k)) memo.set(k, doorOf(a, k > 0.25 || k === 0));
        const d = memo.get(k);
        wr.rebuild(el.dout, String(k), () => d.outer);
        // below 25° the inner side is still behind the panel, inside the cabinet: nothing of it can be seen (it is
        // built once closed all the same, so the audit sees the bins where they sit)
        wr.rebuild(el.din, k > 0.25 ? String(k) : "hidden", () => (k > 0.25 ? d.inner : ""));
        // the inner side is drawn over the outer once it faces you (past the camera's azimuth), and under it before
        sort({ dout: el.dout, din: el.din }, { dout: d.at(30, 128, 6), din: d.at(30, 128, -4) });
        wr.attr(el.inside, "style", on ? LIT : LINER);
        wr.rebuild(el.lens, String(on), () => box([-4, 6], [10, 10.6], [167.5, 172], "hi", on ? ISO.tint("#fff6d0", ["#f2d983", "#f5e19a", "#f8e9b1", "#fbf1c8"], "#8a6a10") : ISO.T.glass, on));
        wr.rebuild(el.dial, "", () => S(G.disc(0, 1.2, 2.4, yF([-9, 10, 170]), P), { tone: "hi" }) + `<path d="${K.pathOf([K.iso([-9, 11.25, 170], P), K.iso([-10.4, 11.25, 171.6], P)])}" stroke="#2a2e33" stroke-width="1.1" stroke-linecap="round"/>`);
        const full = k > 0.95;
        if (lab) wr.rebuild(el.words, `${on} ${full}`, () => {
          const w = (p, txt, color = "#444", anchor = "middle", dy = 0, dx = 0) => { const q = K.iso(p, P); return ISO.word([q[0] + dx, q[1]], txt, color, { anchor, size: 13, dy }); };
          return w([X, FR + 6, 150], "fridge 4 °C", "#2b6cc4", "start", 0, 10) + w([X, FR + 6, 44], "freezer −18 °C", "#1f4f8f", "start", 0, 10) + w([X, FR, 6], "kickplate grille", "#444", "start", 4, 10) +
            (on ? w([0, 10, 166], "light", "#444", "middle", 14) + w([2, 14.6, SHELVES[1]], "glass shelf", "#444", "middle", 14) + w([0, 15.5, DIV[1] + 4], "crisper drawer", "#444", "middle", 4) +
              (full ? w([-42, 91, DZ[0]], "door bins", "#444", "middle", 18) + w([-42, 91, TOP], "door gasket", "#444", "middle", -8) : "") : "");
        });
      };
      g.set = (p) => { if (p.open !== undefined) st.aT = +p.open ? 1 : 0; };
      g.update = (dt) => { st.a = ISO.follow(st.a, st.aT, dt, 0.4, ISO.still()); draw(); return st.a !== st.aT; };
      g.readout = () => (st.a > 0.5 ? "door open · light on · cold air (4 °C) spills out at the bottom; close it soon" : "closed · the gasket's magnet seals the door · the compressor pumps heat from inside out through the coils at the back");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
