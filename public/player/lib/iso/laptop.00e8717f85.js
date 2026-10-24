// "laptop cx cy width rot=deg open=0..1 deck=0..1 on=1 lab=1 lit=lid|keyboard|battery|board|fan|heatpipe |text" — a
// 13-inch laptop. The bottom case is an aluminium tub on four rubber feet with its ports in the right side and the
// hinge barrels at the back; the lid (aluminium shell, black glass bezel, webcam, the screen showing code or the
// given text) turns on the hinge from shut (open=0) to 110° (open=1). The keyboard deck (keys in their well, the
// glass trackpad, speaker grilles, power key) lifts off (deck=1) to show the inside: two battery packs of three
// cells, the mainboard with the processor, memory and storage, the copper heat pipe carrying the processor's heat
// to the fin stack, and the blower fan that pushes air through the fins and out of the back. on=1 lights the screen
// and runs the fan. rot tilts the whole drawing, as the app's line does. set({ open, deck, on, lit }).
// 1 unit = 1 mm (a 304 × 212 × 15 mm machine).
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const HW = 152, HD = 106, R = 10, FLOOR = 2, WALL = 9, DECK = 15, LID = 6, LV = 216, YH = 110, LIFT = 112, OPEN = 110;
  const pl = (i) => ({ x: -HW + i, y: -HD + i, w: 2 * (HW - i), d: 2 * (HD - i), r: Math.max(1, R - i) });
  const FAN = [-98, 50], FR = 27, CPU = [12, 52];

  ISO.add({
    name: "laptop", title: "Laptop (inside)", compare: "laptop 480 290 400",
    about: "A laptop: the lid turns on its hinge and the screen lights; lift the keyboard deck and the inside shows: battery cells, the mainboard and processor, the heat pipe and the fan.",
    line: "laptop cx cy width rot=deg open=0..1 deck=0..1 on=1 lab=1 lit=lid|keyboard|battery|board|fan|heatpipe |text",
    demo: { line: "laptop 480 290 400 open=0", script: [{ set: { open: 1 }, hold: 3 }, { set: { deck: 1 }, hold: 4 }] },
    make([cx, cy, size = 400], o, text, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.18, on = o.on !== "0";
      const rot = ISO.num(o, "rot", 0), host = rot ? mk("g", { transform: `rotate(${rot} ${cx} ${cy})` }, parent) : parent;
      const th1 = (OPEN * Math.PI) / 180, top = [0, YH - LV * Math.cos(th1), DECK + LV * Math.sin(th1)];
      const { P, g } = ISO.frame([[-HW, -HD, -1.5], [HW, -HD, -1.5], [-HW, HD, -1.5], [HW, HD, -1.5], [-HW, -HD, DECK + LIFT], [HW, -HD, DECK + LIFT], [-HW, top[1], top[2]], [HW, top[1], top[2]]], cx, cy, W, H, { azimuth: -56, elevation: 26, pad: size * 0.03 }, host);
      const box = (x, y, z, tone, c, lit) => T.box(P, x, y, z, tone, c, lit);
      const [vx, vy] = K.towardViewer(P), near = ([x, y]) => x * vx + y * vy > 0;

      // ── the bottom case: feet, floor, and the walls as two concave halves (far now, near after the inside)
      const base = [`<path class="iso-halo" d="${K.haloOf(pl(0), -1.5, 2, P)}"/>`];
      for (const [x, y] of K.corners(pl(0), 24).sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P))) base.push(T.cyl(P, x, y, 6, -1.5, 1.5, "lo", T.C.rubber, 24));
      base.push(T.slab(P, pl(0), 0, FLOOR, "lo", T.C.alu, 6, 0.6));
      const O = K.ringOf(pl(0), 6), I = K.ringOf(pl(2.4), 6), n = O.length, far = O.map((p) => !near(p));
      const runOf = (want) => {
        const s = far.findIndex((f, i) => f === want && far[(i + n - 1) % n] !== want), idx = [(s + n - 1) % n];
        for (let i = s; far[i % n] === want; i++) idx.push(i % n);
        idx.push((idx[idx.length - 1] + 1) % n);
        return idx;
      };
      const half = (want) => { const r = runOf(want); return ISO.tinted(T.C.alu, T.S(K.extrude([...r.map((i) => O[i]), ...r.slice().reverse().map((i) => I[i])], FLOOR, WALL - FLOOR, P, { convex: false }), { tone: "mid" })); };
      base.push(half(true));
      // the hinge barrels on the back wall
      const hingeF = (x) => G.frameOf([x, HD + 4, WALL + 1], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      const hinges = [-110, 110].map((x) => ISO.tinted(T.C.dark, T.S(G.disc(-22, 22, 4, hingeF(x), P, { steps: 24 }), { tone: "mid" })));

      // ── inside: battery packs, mainboard, heat pipe, fan with its fin stack, speakers
      const inside = [];
      const cells = [];
      for (const x0 of [-146, 6]) for (let i = 0; i < 3; i++) cells.push(box([x0 + i * 47, x0 + i * 47 + 45], [-101, -12], [FLOOR, FLOOR + 6], "hi", T.C.battery));
      inside.push(`<g data-name="battery">${cells.join("")}${T.flat(P, [-108, -40, FLOOR + 6.01], [-1, 0, 0], [0, -1, 0], T.text(16, 0, "Li-ion", 7, "#4a453d") + T.text(16, 9, "11.4 V · 58 Wh", 5, "#6b655c", "middle", 600))}</g>`);
      const bz = FLOOR + 1.6, board = [];
      board.push(...[[-58, 14], [88, 14], [-58, 86], [88, 86]].map(([x, y]) => T.cyl(P, x, y, 2.4, FLOOR, 1.6, "mid", T.C.steel, 14)));
      board.push(box([-64, 94], [6, 92], [bz, bz + 1.2], "mid", T.C.pcb));
      const b1 = bz + 1.2;
      board.push(box([-4, 28], [36, 68], [b1, b1 + 1], "mid", T.C.pcbDark), box([2, 22], [42, 62], [b1 + 1, b1 + 1.8], "hi", T.C.chip));
      for (const y of [16, 26]) board.push(box([34, 62], [y, y + 8], [b1, b1 + 1], "mid", T.C.chip));
      for (const y of [16, 26]) board.push(box([-50, -24], [y, y + 8], [b1, b1 + 1], "mid", T.C.chip));
      board.push(box([40, 83], [56, 76], [b1, b1 + 1.4], "mid", T.C.pcbDark), box([46, 60], [60, 72], [b1 + 1.4, b1 + 2.2], "mid", T.C.chip), box([64, 78], [60, 72], [b1 + 1.4, b1 + 2.2], "mid", T.C.chip));
      board.push(box([84, 94], [30, 50], [b1, b1 + 4], "mid", T.C.steel), box([84, 94], [58, 78], [b1, b1 + 4], "mid", T.C.steel));
      inside.push(`<g data-name="board">${board.join("")}</g>`);
      inside.push(...[[104, 146], [-146, -128]].map(([x0, x1]) => box([x0, x1], [20, 86], [FLOOR, FLOOR + 5], "mid", T.C.black)));
      // fin stack against the back vent, the fan housing, then the heat pipe from the processor to the fins
      const FIN = { x: [-134, -66], y: [86, 100.6], z: [FLOOR, FLOOR + 5.5] };
      const finLines = [];
      for (let x = FIN.x[0] + 2.5; x < FIN.x[1] - 1; x += 2.5) finLines.push(K.pathOf([K.iso([x, FIN.y[0], FIN.z[1]], P), K.iso([x, FIN.y[1], FIN.z[1]], P)]));
      inside.push(`<g data-name="fins">${box(FIN.x, FIN.y, FIN.z, "mid", T.C.copper)}${T.L(finLines.join(""), { tone: "lo" })}</g>`);
      // the blower housing and its outlet duct are one moulding, so audit.mjs reports them as sunk into each other
      inside.push(`<g data-name="fan">${T.cyl(P, FAN[0], FAN[1], FR + 3, FLOOR, 6, "mid", T.C.dark, 48)}${box([FAN[0] - 26, FAN[0] + 26], [FAN[1] + 20, FIN.y[0]], [FLOOR, FLOOR + 6], "mid", T.C.dark)}<g data-part="rotor"></g></g>`);
      const pipe = [[CPU[0] - 10, CPU[1] + 6], [-30, 70], [-62, 80], [-96, 90]], pz = [b1 + 2.4, b1 + 4], pw = 4, segs = [];
      for (let i = 0; i < pipe.length - 1; i++) {
        const [a, b] = [pipe[i], pipe[i + 1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l], nn = [-d[1] * pw, d[0] * pw];
        const a2 = [a[0] - d[0] * (i ? pw : 0), a[1] - d[1] * (i ? pw : 0)];
        segs.push(T.plate(P, [[a2[0] + nn[0], a2[1] + nn[1]], [b[0] + nn[0], b[1] + nn[1]], [b[0] - nn[0], b[1] - nn[1]], [a2[0] - nn[0], a2[1] - nn[1]]], pz[0], pz[1], "hi", T.C.copper));
      }
      // the copper spreader on the processor, the pipe on standoffs standing on the board, its flattened end on the fins
      inside.push(`<g data-name="heatpipe">${box([-2, 26], [38, 66], [b1 + 1.8, b1 + 2.4], "hi", T.C.copper)}${T.cyl(P, -30, 70, 2, b1, pz[0] - b1, "mid", T.C.steel, 12)}${T.cyl(P, -62, 80, 2, b1, pz[0] - b1, "mid", T.C.steel, 12)}${segs.join("")}${box([-104, -88], [86, 96], [FIN.z[1], pz[1]], "mid", T.C.copper)}</g>`);

      // ── the ports on the near side wall's outer face (this projection shows +x on the viewer's left: the left side)
      const ports = [[-60, -46], [-38, -24], [10, 18]].map(([y0, y1], i) => T.quad(P, [[HW + 0.02, y0, 3.6], [HW + 0.02, y1, 3.6], [HW + 0.02, y1, 6.8], [HW + 0.02, y0, 6.8]], "#2a2e33", "#1f2226", 0.5, i === 2 ? "" : ""));

      // ── the keyboard deck: the top case with the key well, 79 keys, trackpad, speaker grilles
      const deck = [T.slab(P, pl(0), WALL, DECK - WALL, "hi", T.C.alu, 6, 0.8)];
      const well = { x: -136, y: -18, w: 272, d: 110, r: 4 };
      deck.push(`<path d="${K.planOutline(well, DECK, P, 4)}" fill="#c6cad0" stroke="#4a5058" stroke-width=".6"/>`);
      const keys = [], KEY = T.C.dark, kz = [DECK, DECK + 1.4];
      for (let i = 0; i < 14; i++) keys.push(box([-133 + i * 19, -133 + i * 19 + 16.6], [79, 89], kz, "mid", KEY));
      for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) { const y = 57 - r * 19.5, x = -133 + c * 19; if (c === 13 && r === 3) continue; keys.push(box([x, x + 16.6], [y, y + 16.6], kz, "mid", KEY)); }
      keys.push(box([-133, -116.4], [-15, 0.6], kz, "mid", KEY), box([-114, -97.4], [-15, 0.6], kz, "mid", KEY), box([-95, -59], [-15, 0.6], kz, "mid", KEY), box([-57, 55], [-15, 0.6], kz, "mid", KEY), box([57, 93], [-15, 0.6], kz, "mid", KEY));
      keys.push(box([95, 111.6], [-15, -7.6], kz, "mid", KEY), box([114, 130.6], [-15, -7.6], kz, "mid", KEY), box([114, 130.6], [-7, 0.6], kz, "mid", KEY), box([133, 133.4], [-15, -7.6], kz, "mid", KEY));
      deck.push(`<g data-name="keyboard">${keys.join("")}</g>`);
      deck.push(T.slab(P, { x: -66, y: -98, w: 132, d: 72, r: 5 }, DECK, 0.3, "hi", T.C.glass, 5));
      deck.push(T.D([...K.dotGrid(-148, -14, 3, 30, 3.5, DECK, P), ...K.dotGrid(140, -14, 3, 30, 3.5, DECK, P)], { size: 0.45, tone: "lo" }));

      g.innerHTML = `<g data-part="lidback"></g><g>${base.join("")}</g><g>${inside.join("")}</g><g>${half(false)}${ports.join("")}${hinges.join("")}</g>` +
        `<g data-part="deck">${deck.join("")}</g><g data-part="lidfront"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];

      // the screen picture in face coordinates (x right, y down), clipped to the panel
      const SW = 2 * HW - 20, SH = LV - 22, cid = `lp${T.uid++}`;
      const pic = (lit) => {
        const s = [`<clipPath id="${cid}"><rect width="${SW}" height="${SH}" rx="2"/></clipPath><g clip-path="url(#${cid})"><rect width="${SW}" height="${SH}" fill="${lit ? (text ? "#dff1ff" : "#1f3b4d") : "#14171b"}"/>`];
        if (lit && text) { const fs = Math.min(28, (SW - 20) / (0.56 * Math.max(1, text.length))); s.push(T.text(SW / 2, SH / 2 + fs * 0.35, text, fs.toFixed(1))); }
        else if (lit) s.push(T.code(14, 20, SW * 0.7, 9, 17, 4.2));
        return s.join("") + "</g>";
      };
      // The lid at angle th (radians): shell, bezel panel, the screen on it when it faces you, the webcam.
      const lidMemo = new Map(), lidSvg = (th, lit) => {
        const key = `${Math.round((th * 360) / Math.PI)} ${lit}`;
        if (lidMemo.has(key)) return lidMemo.get(key);
        const vdir = [0, -Math.cos(th), Math.sin(th)], wdir = [0, Math.sin(th), Math.cos(th)], at = T.frame([0, YH, DECK], [1, 0, 0], vdir, wdir);
        const s = [`<g data-name="lid">${T.obox(P, at, [-HW, HW], [0, LV], [0, LID], "mid", T.C.alu)}`];
        const facing = -(wdir[0] * vx + wdir[1] * vy) * Math.cos((26 * Math.PI) / 180) - wdir[2] * Math.sin((26 * Math.PI) / 180) > 0;
        if (th > 0.05) s.push(T.obox(P, at, [-HW + 2, HW - 2], [2, LV - 2], [-0.8, 0], "mid", T.C.black));
        if (facing && th > 0.3) {
          s.push(T.flat(P, at(SW / 2, LV - 10, -0.82), [-1, 0, 0], T.mul(vdir, -1), pic(lit)));
          s.push(T.dot(P, [at(0, LV - 5, -0.82)], 0.6, "lo"));
        }
        const svg = s.join("") + "</g>";
        lidMemo.set(key, svg);
        return svg;
      };
      // the fan rotor: a hub and 24 curved blades, symmetric every 15°, so 15 poses each built once
      const rotorMemo = [], rotorSvg = (q) => rotorMemo[q] || (rotorMemo[q] = (() => {
        const z = FLOOR + 6, a0 = (q / 15) * ((2 * Math.PI) / 24), bl = [];
        for (let i = 0; i < 24; i++) { const a = a0 + (i * 2 * Math.PI) / 24; bl.push(K.pathOf([K.iso([FAN[0] + 9 * Math.cos(a), FAN[1] + 9 * Math.sin(a), z], P), K.iso([FAN[0] + (FR - 0.05) * Math.cos(a + 0.35), FAN[1] + (FR - 0.05) * Math.sin(a + 0.35), z], P)])); }
        return `<path d="${K.ring(FAN[0], FAN[1], FR, z + 0.02, P, 48)}" fill="#3a3f46" stroke="#101215" stroke-width=".6"/>` + T.L(bl.join(""), { tone: "mid" }) + T.cyl(P, FAN[0], FAN[1], 9, z - 0.5, 1.2, "hi", T.C.dark, 28);
      })());

      const st = { open: ISO.clamp(ISO.num(o, "open", 1), 0, 1), deck: ISO.clamp(ISO.num(o, "deck", 0), 0, 1), on, a: 0, lit: o.lit || "" };
      st.wOpen = st.open; st.wDeck = st.deck;
      const lifted = () => st.deck * ISO.smooth(0.7, 1, st.open);
      const draw = () => {
        const th = (st.open * OPEN * Math.PI) / 180, lit = st.on && st.open > 0.5, back = th > (60 * Math.PI) / 180;
        const key = `${Math.round((th * 360) / Math.PI)} ${lit}`;
        w.rebuild(el.lidback, back ? key : "", () => (back ? lidSvg(th, lit) : ""));
        w.rebuild(el.lidfront, back ? "" : key, () => (back ? "" : lidSvg(th, lit)));
        const dz = lifted() * LIFT;
        w.attr(el.deck, "transform", K.translateAlong(P, [0, 0, dz]));
        w.shown(el.deck, true);
        const q = Math.floor(((st.a % ((2 * Math.PI) / 24)) / ((2 * Math.PI) / 24)) * 15) % 15;
        w.rebuild(el.rotor, String(q), () => rotorSvg(q));
        w.light([...g.querySelectorAll("[data-name]")], [...g.querySelectorAll(`[data-name="${st.lit}"]`)]);
        const up = dz > 30;
        w.rebuild(el.words, lab ? `${up} ${back} ${up ? Math.round(dz) : 0}` : "", () => !lab ? "" : (up ? [
          T.word(P, [-70, -101, FLOOR + 6], "battery cells", { dy: 20 }),
          T.word(P, [20, 6, b1], "mainboard + processor", { dy: 14 }),
          T.word(P, [-30, 70, pz[1]], "heat pipe", { anchor: "start", dx: 8, dy: 14 }),
          T.word(P, [FAN[0] - FR, FAN[1] - FR, FLOOR + 6], "fan", { anchor: "end", dx: -6, dy: 6 }),
          T.word(P, [HW, HD, DECK + dz], "keyboard deck, lifted off", { anchor: "end", dx: -8 }),
        ] : [
          back ? T.word(P, [HW, YH, DECK + LV * 0.8], "screen", { anchor: "start", dx: 10 }) : "",
          T.word(P, [HW, -60, DECK], "keyboard", { anchor: "start", dx: 12 }),
          T.word(P, [0, -98, DECK], "trackpad", { dy: 16 }),
          T.word(P, [HW, YH, WALL], "hinge", { anchor: "start", dx: 10, dy: 4 }),
        ]).join(""));
      };
      g.set = (p) => {
        if (p.open !== undefined) st.wOpen = ISO.clamp(+p.open, 0, 1);
        if (p.deck !== undefined) st.wDeck = ISO.clamp(+p.deck, 0, 1);
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // The lid swings on an eased follow (about a second); the deck lifts once the lid is up. The fan turns at a
      // shown pace (a real one spins at ~5000 rpm) while the inside can be seen.
      g.update = (dt) => {
        const calm = ISO.still();
        st.open = ISO.follow(st.open, st.wOpen, dt, 0.3, calm); if (Math.abs(st.open - st.wOpen) < 0.002) st.open = st.wOpen;
        st.deck = ISO.follow(st.deck, st.wDeck, dt, 0.35, calm); if (Math.abs(st.deck - st.wDeck) < 0.002) st.deck = st.wDeck;
        const fan = st.on && lifted() > 0.05 && !calm;
        if (fan) st.a += dt * 3;
        draw();
        return st.open !== st.wOpen || st.deck !== st.wDeck || fan;
      };
      g.readout = () => {
        const deg = Math.round(st.open * OPEN);
        if (lifted() > 0.5) return `inside · battery: 6 cells, 11.4 V, 58 Wh · the processor makes up to 15 W of heat; the heat pipe carries it to the fins and the fan (~5000 rpm) blows it out of the back`;
        return deg < 2 ? "shut · 304 × 212 × 15 mm, 1.3 kg" : `lid open ${deg}° · 13.3-inch screen, 2560 × 1600 pixels${st.on && deg > 55 ? " · on" : ""}`;
      };
      draw();
      return g;
    },
  });
})();
