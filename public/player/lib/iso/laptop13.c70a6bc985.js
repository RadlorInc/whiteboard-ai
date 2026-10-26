// "laptop13 cx cy k open=0..1 deck=0..1 on=0|1 show=code|desktop lab=0 lit=lid|keyboard|battery|board|heatpipe|fan|fins"
// — a PART (PARTS.md, batch 6): the 13-inch laptop of laptop.js, standing on a desk, its origin the desk point under
// its middle, the screen facing the room (+y), the hinge at the back (−y). The bottom case is an aluminium tub on four
// rubber feet with its ports in the right-hand side (+x) and the hinge barrels at the back; the lid (aluminium shell,
// black glass bezel, webcam and the screen) turns on the hinge from shut (open=0) to 110° (open=1). The keyboard deck
// (79 keys in their well, the glass trackpad, speaker grilles) lifts off (deck=1, once the lid is up) to show the
// inside: six battery cells in two packs, the mainboard with the processor, memory and storage, the copper heat pipe
// to the fin stack, and the blower fan. on=1 lights the screen (show=code: lines of code, desktop: windows and a
// dock) and runs the fan while the inside shows. set({ open, deck, on, show }). Built in mm from laptop.js, turned
// to face the room (B35.cam); the anchor in cm.
(() => {
  const K = window.K, G = window.G;
  const HW = 152, HD = 106, R = 10, FLOOR = 2, WALL = 9, DECK = 15, LID = 6, LV = 216, YH = 110, LIFT = 112, OPEN = 110, FEET = 1.5;
  const pl = (i) => ({ x: -HW + i, y: -HD + i, w: 2 * (HW - i), d: 2 * (HD - i), r: Math.max(1, R - i) });
  const FAN = [-98, 50], FR = 27, CPU = [12, 52], SHOWS = ["code", "desktop"];

  ISO.add({
    name: "laptop13", title: "13-inch laptop (part)", compare: null,
    about: "A 13-inch aluminium laptop on a desk: the lid opens on its hinge and the screen lights; lift the keyboard deck off and the inside shows: battery cells, the mainboard and processor, the heat pipe and the fan. anchors: top",
    line: "laptop13 cx cy k open=0..1 deck=0..1 on=0|1 show=code|desktop lab=0 lit=lid|keyboard|battery|board|heatpipe|fan|fins",
    demo: { line: "laptop13 480 390 13 open=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { show: "desktop", lit: "lid" }, hold: 1.4 }, { set: { deck: 1, lit: "" }, hold: "settle" }, { set: { lit: "heatpipe" }, hold: 1.4 }, { set: { on: 0, lit: "fan" }, hold: 1.2 }, { set: { deck: 0, on: 1, show: "code", lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B35;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      // laptop.js builds with the hinge at +y, seen from −y: turned half round, so the screen faces the room
      const P = B.cam(Pc, { div: 10, az: 180, from: [0, 0, -FEET] });
      const box = (x, y, z, tone, c, lit) => T.box(P, x, y, z, tone, c, lit);
      const [vx, vy] = K.towardViewer(P), near = ([x, y]) => x * vx + y * vy > 0;

      // ── the bottom case: feet, floor, and the walls as two concave halves (far now, near after the inside)
      const base = [`<path class="iso-halo" d="${K.haloOf(pl(0), -FEET, 2, P)}"/>`];
      for (const [x, y] of K.corners(pl(0), 24).sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P))) base.push(T.cyl(P, x, y, 6, -FEET, FEET, "lo", T.C.rubber, 24));
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
      const hingeF = (x) => G.frameOf([x, HD + 4, WALL + 1], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
      const hinges = [-110, 110].map((x) => ISO.tinted(T.C.dark, T.S(G.disc(-22, 22, 4, hingeF(x), P, { steps: 24 }), { tone: "mid" })));

      // ── inside: battery packs, mainboard, heat pipe, fan with its fin stack, speakers
      const bz = FLOOR + 1.6, b1 = bz + 1.2, pz = [b1 + 2.4, b1 + 4];
      // a build in three parts (ISO.later): the case and lid now, the inside and the keyboard deck each in a slice
      const insideSvg = () => {
      const inside = [], cells = [];
      for (const x0 of [-146, 6]) for (let i = 0; i < 3; i++) cells.push(box([x0 + i * 47, x0 + i * 47 + 45], [-101, -12], [FLOOR, FLOOR + 6], "hi", T.C.battery));
      inside.push(`<g data-name="battery">${cells.join("")}${T.flat(P, [-108, -40, FLOOR + 6.01], [-1, 0, 0], [0, -1, 0], T.text(16, 0, "Li-ion", 7, "#4a453d") + T.text(16, 9, "11.4 V · 58 Wh", 5, "#6b655c", "middle", 600))}</g>`);
      const board = [];
      board.push(...[[-58, 14], [88, 14], [-58, 86], [88, 86]].map(([x, y]) => T.cyl(P, x, y, 2.4, FLOOR, 1.6, "mid", T.C.steel, 14)));
      board.push(box([-64, 94], [6, 92], [bz, bz + 1.2], "mid", T.C.pcb));
      board.push(box([-4, 28], [36, 68], [b1, b1 + 1], "mid", T.C.pcbDark), box([2, 22], [42, 62], [b1 + 1, b1 + 1.8], "hi", T.C.chip));
      for (const y of [16, 26]) board.push(box([34, 62], [y, y + 8], [b1, b1 + 1], "mid", T.C.chip));
      for (const y of [16, 26]) board.push(box([-50, -24], [y, y + 8], [b1, b1 + 1], "mid", T.C.chip));
      board.push(box([40, 83], [56, 76], [b1, b1 + 1.4], "mid", T.C.pcbDark), box([46, 60], [60, 72], [b1 + 1.4, b1 + 2.2], "mid", T.C.chip), box([64, 78], [60, 72], [b1 + 1.4, b1 + 2.2], "mid", T.C.chip));
      board.push(box([84, 94], [30, 50], [b1, b1 + 4], "mid", T.C.steel), box([84, 94], [58, 78], [b1, b1 + 4], "mid", T.C.steel));
      inside.push(`<g data-name="board">${board.join("")}</g>`);
      inside.push(...[[104, 146], [-146, -128]].map(([x0, x1]) => box([x0, x1], [20, 86], [FLOOR, FLOOR + 5], "mid", T.C.black)));
      const FIN = { x: [-134, -66], y: [86, 100.6], z: [FLOOR, FLOOR + 5.5] }, finLines = [];
      for (let x = FIN.x[0] + 2.5; x < FIN.x[1] - 1; x += 2.5) finLines.push(K.pathOf([K.iso([x, FIN.y[0], FIN.z[1]], P), K.iso([x, FIN.y[1], FIN.z[1]], P)]));
      inside.push(`<g data-name="fins">${box(FIN.x, FIN.y, FIN.z, "mid", T.C.copper)}${T.L(finLines.join(""), { tone: "lo" })}</g>`);
      // the blower housing and its outlet duct are one moulding (audit.mjs reports them as sunk into each other)
      inside.push(`<g data-name="fan">${T.cyl(P, FAN[0], FAN[1], FR + 3, FLOOR, 6, "mid", T.C.dark, 48)}${box([FAN[0] - 26, FAN[0] + 26], [FAN[1] + 20, FIN.y[0]], [FLOOR, FLOOR + 6], "mid", T.C.dark)}<g data-part="rotor"></g></g>`);
      const pipe = [[CPU[0] - 10, CPU[1] + 6], [-30, 70], [-62, 80], [-96, 90]], pw = 4, segs = [];
      for (let i = 0; i < pipe.length - 1; i++) {
        const [a, b] = [pipe[i], pipe[i + 1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l], nn = [-d[1] * pw, d[0] * pw];
        const a2 = [a[0] - d[0] * (i ? pw : 0), a[1] - d[1] * (i ? pw : 0)];
        segs.push(T.plate(P, [[a2[0] + nn[0], a2[1] + nn[1]], [b[0] + nn[0], b[1] + nn[1]], [b[0] - nn[0], b[1] - nn[1]], [a2[0] - nn[0], a2[1] - nn[1]]], pz[0], pz[1], "hi", T.C.copper));
      }
      inside.push(`<g data-name="heatpipe">${box([-2, 26], [38, 66], [b1 + 1.8, b1 + 2.4], "hi", T.C.copper)}${T.cyl(P, -30, 70, 2, b1, pz[0] - b1, "mid", T.C.steel, 12)}${T.cyl(P, -62, 80, 2, b1, pz[0] - b1, "mid", T.C.steel, 12)}${segs.join("")}${box([-104, -88], [86, 96], [FIN.z[1], pz[1]], "mid", T.C.copper)}</g>`);
      return inside.join("");
      };

      // ── the ports in the side wall that faces the room's right (build −x): two USB-C and the headphone socket
      const ports = [[-60, -46], [-38, -24], [10, 18]].map(([y0, y1]) => T.quad(P, [[-HW - 0.02, y0, 3.6], [-HW - 0.02, y1, 3.6], [-HW - 0.02, y1, 6.8], [-HW - 0.02, y0, 6.8]], "#2a2e33", "#1f2226", 0.5));

      // ── the keyboard deck: the top case with the key well, 79 keys, trackpad, speaker grilles
      const deckSvg = () => {
      const deck = [T.slab(P, pl(0), WALL, DECK - WALL, "hi", T.C.alu, 6, 0.8)];
      const well = { x: -136, y: -18, w: 272, d: 110, r: 4 };
      deck.push(`<path d="${K.planOutline(well, DECK, P, 4)}" fill="#c6cad0" stroke="#4a5058" stroke-width=".6"/>`);
      const kb = [], KEY = T.C.dark, kz = [DECK, DECK + 1.4];
      for (let i = 0; i < 14; i++) kb.push([-133 + i * 19, -133 + i * 19 + 16.6, 79, 89]);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) { const y = 57 - r * 19.5, x = -133 + c * 19; if (c === 13 && r === 3) continue; kb.push([x, x + 16.6, y, y + 16.6]); }
      kb.push([-133, -116.4, -15, 0.6], [-114, -97.4, -15, 0.6], [-95, -59, -15, 0.6], [-57, 55, -15, 0.6], [57, 93, -15, 0.6]);
      kb.push([95, 111.6, -15, -7.6], [114, 130.6, -15, -7.6], [114, 130.6, -7, 0.6]);
      // keys painted far to near in this turned view, so a near key's side is never covered by a far key
      const kd = (b) => K.depthOf([(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, DECK], P), keys = kb.sort((a, b) => kd(a) - kd(b)).map((b) => box([b[0], b[1]], [b[2], b[3]], kz, "mid", KEY));
      deck.push(`<g data-name="keyboard">${keys.join("")}</g>`);
      deck.push(T.slab(P, { x: -66, y: -98, w: 132, d: 72, r: 5 }, DECK, 0.3, "hi", T.C.glass, 5));
      deck.push(T.D([...K.dotGrid(-148, -14, 3, 30, 3.5, DECK, P), ...K.dotGrid(140, -14, 3, 30, 3.5, DECK, P)], { size: 0.45, tone: "lo" }));
      return deck.join("");
      };

      g.innerHTML = `<g data-part="lidback"></g><g>${base.join("")}</g><g data-part="inside"></g><g>${half(false)}${ports.join("")}${hinges.join("")}</g>` +
        `<g data-part="deck"></g><g data-part="lidfront"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const fresh = () => { g.querySelectorAll("[data-name]").forEach((e) => (e._fresh = true)); B.light(w, g, st.lit); };
      ISO.later(() => { el.inside.innerHTML = insideSvg(); el.rotor = g.querySelector('[data-part="rotor"]'); draw(); fresh(); });
      ISO.later(() => { el.deck.innerHTML = deckSvg(); fresh(); });

      // the screen picture in face coordinates (x right, y down), clipped to the panel
      const SW = 2 * HW - 20, SH = LV - 22, cid = `lp13_${T.uid++}`;
      const pic = (lit, show) => {
        const s = [`<clipPath id="${cid}"><rect width="${SW}" height="${SH}" rx="2"/></clipPath><g clip-path="url(#${cid})"><rect width="${SW}" height="${SH}" fill="${!lit ? "#14171b" : show === "code" ? "#1f3b4d" : "#7fa9c9"}"/>`];
        if (lit && show === "code") s.push(T.code(14, 20, SW * 0.7, 9, 17, 4.2));
        else if (lit) {
          // the desktop: a soft hill picture, two windows (title bar, lines), the dock along the bottom
          s.push(`<path d="M0 ${SH * 0.7}Q${SW * 0.35} ${SH * 0.45} ${SW} ${SH * 0.66}V${SH}H0Z" fill="#5d8f6a"/>`);
          for (const [x, y, ww, hh] of [[24, 22, 150, 104], [130, 60, 132, 92]]) {
            s.push(`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" rx="3" fill="#f4f6f8" stroke="#3a4752" stroke-width=".8"/><rect x="${x}" y="${y}" width="${ww}" height="12" rx="3" fill="#d8dee4"/>`);
            s.push([0, 1, 2].map((i) => `<circle cx="${x + 7 + i * 7}" cy="${y + 6}" r="2.2" fill="${["#e0463a", "#f0a020", "#3cc45a"][i]}"/>`).join(""));
            for (let i = 0; i < 5; i++) s.push(`<path data-free d="M${x + 10} ${y + 24 + i * 12}H${x + ww * (0.45 + 0.08 * ((i * 3) % 5))}" stroke="#9aa6b1" stroke-width="4" stroke-linecap="round"/>`);
          }
          s.push(`<rect x="${SW / 2 - 70}" y="${SH - 22}" width="140" height="16" rx="5" fill="#ffffff" fill-opacity=".6"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${SW / 2 - 62 + i * 21}" y="${SH - 19}" width="14" height="10" rx="2.5" fill="${["#2f8fe8", "#3cc45a", "#f0a020", "#e0463a", "#7a46b0", "#4a4f57"][i]}"/>`).join(""));
        }
        return s.join("") + "</g>";
      };
      // The lid at angle th (radians): shell, bezel panel, the screen on it when it faces you, the webcam.
      const sinE = Math.sin((ISO.PART_CAM.elevation * Math.PI) / 180), cosE = Math.cos((ISO.PART_CAM.elevation * Math.PI) / 180);
      const lidMemo = new Map(), lidSvg = (th, lit, show) => {
        const key = `${Math.round((th * 360) / Math.PI)} ${lit} ${show}`;
        if (lidMemo.has(key)) return lidMemo.get(key);
        const vdir = [0, -Math.cos(th), Math.sin(th)], wdir = [0, Math.sin(th), Math.cos(th)], at = T.frame([0, YH, DECK], [1, 0, 0], vdir, wdir);
        const s = [`<g data-name="lid">${T.obox(P, at, [-HW, HW], [0, LV], [0, LID], "mid", T.C.alu)}`];
        const facing = -(wdir[0] * vx + wdir[1] * vy) * cosE - wdir[2] * sinE > 0;
        if (th > 0.05) s.push(T.obox(P, at, [-HW + 2, HW - 2], [2, LV - 2], [-0.8, 0], "mid", T.C.black));
        if (facing && th > 0.3) {
          s.push(T.flat(P, at(SW / 2, LV - 10, -0.82), [-1, 0, 0], T.mul(vdir, -1), pic(lit, show)));
          s.push(T.dot(P, [at(0, LV - 5, -0.82)], 0.6, "lo"));
        }
        const svg = s.join("") + "</g>";
        lidMemo.set(key, svg);
        return svg;
      };
      // the fan rotor: a hub and 24 curved blades, symmetric every 15°, so 15 poses each built once
      const rotorMemo = [], rotorSvg = (q) => rotorMemo[q] || (rotorMemo[q] = (() => {
        const z = FLOOR + 6, a0 = (q / 15) * ((2 * Math.PI) / 24), bl = [];
        for (let i = 0; i < 24; i++) { const a = a0 + (i * 2 * Math.PI) / 24; bl.push(K.pathOf([K.iso([FAN[0] + 9 * Math.cos(a), FAN[1] + 9 * Math.sin(a), z + 0.7], P), K.iso([FAN[0] + (FR - 0.05) * Math.cos(a + 0.35), FAN[1] + (FR - 0.05) * Math.sin(a + 0.35), z], P)])); }
        return `<path d="${K.ring(FAN[0], FAN[1], FR, z + 0.02, P, 48)}" fill="#3a3f46" stroke="#101215" stroke-width=".6"/>` + T.cyl(P, FAN[0], FAN[1], 9, z - 0.5, 1.2, "hi", T.C.dark, 28) + T.L(bl.join(""), { tone: "mid" });
      })());

      const st = { open: B.num(o, "open", 1, 0, 1), deck: B.num(o, "deck", 0, 0, 1), on: o.on !== "0", show: SHOWS.includes(o.show) ? o.show : "code", a: 0, lit: o.lit || "" };
      st.wOpen = st.open; st.wDeck = st.deck;
      const lifted = () => st.deck * ISO.smooth(0.7, 1, st.open);
      const draw = () => {
        const th = (st.open * OPEN * Math.PI) / 180, lit = st.on && st.open > 0.5, back = th > (60 * Math.PI) / 180;
        const key = `${Math.round((th * 360) / Math.PI)} ${lit} ${st.show}`;
        w.rebuild(el.lidback, back ? key : "", () => (back ? lidSvg(th, lit, st.show) : ""));
        w.rebuild(el.lidfront, back ? "" : key, () => (back ? "" : lidSvg(th, lit, st.show)));
        const dz = lifted() * LIFT;
        w.attr(el.deck, "transform", K.translateAlong(P, [0, 0, dz]));
        const q = Math.floor(((st.a % ((2 * Math.PI) / 24)) / ((2 * Math.PI) / 24)) * 15) % 15;
        if (el.rotor) w.rebuild(el.rotor, String(q), () => rotorSvg(q));
        B.light(w, g, st.lit);
        const up = dz > 30;
        w.rebuild(el.words, lab ? `${up} ${back} ${up ? Math.round(dz) : 0}` : "", () => !lab ? "" : (up ? [
          T.word(P, [-70, -101, FLOOR + 6], "battery cells", { dy: 20 }),
          T.word(P, [20, 6, b1], "mainboard + processor", { dy: 14 }),
          T.word(P, [-30, 70, pz[1]], "heat pipe", { anchor: "end", dx: -8, dy: -6 }),
          T.word(P, [FAN[0] - FR, FAN[1] - FR, FLOOR + 6], "fan", { anchor: "start", dx: 6, dy: 6 }),
          T.word(P, [-HW, -HD, DECK + dz], "keyboard deck, lifted off", { anchor: "start", dx: 8 }),
        ] : [
          ...(back ? [T.word(P, [-HW, YH, DECK + LV * 0.8], "screen", { anchor: "start", dx: 10 }), T.word(P, [-HW, -60, DECK], "keyboard", { anchor: "start", dx: 12 }), T.word(P, [0, -98, DECK], "trackpad", { dy: 16 })]
            : [T.word(P, [0, -HD, DECK + LID], "lid", { dy: 18 })]),
        ]).join(""));
      };
      g.anchors = { top: [0, 0, (DECK + FEET) / 10] };
      g.set = (p) => {
        if (B.fin(p.open)) st.wOpen = ISO.clamp(+p.open, 0, 1);
        if (B.fin(p.deck)) st.wDeck = ISO.clamp(+p.deck, 0, 1);
        if (p.on !== undefined) st.on = String(p.on) === "1";
        if (SHOWS.includes(p.show)) st.show = p.show;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // The lid swings on an eased follow (about a second); the deck lifts once the lid is up. The fan turns at a
      // shown pace (a real one spins at ~5000 rpm) while the inside can be seen.
      g.update = (dt) => {
        const calm = ISO.still();
        st.open = ISO.follow(st.open, st.wOpen, dt, 0.3, calm); if (Math.abs(st.open - st.wOpen) < 0.002) st.open = st.wOpen;
        st.deck = ISO.follow(st.deck, st.wDeck, dt, 0.35, calm); if (Math.abs(st.deck - st.wDeck) < 0.002) st.deck = st.wDeck;
        const fan = st.on && lifted() > 0.05 && !calm;
        if (fan) st.a = (st.a + dt * 3) % (2 * Math.PI);
        draw();
        return st.open !== st.wOpen || st.deck !== st.wDeck || fan;
      };
      g.readout = () => {
        const deg = Math.round(st.open * OPEN);
        if (lifted() > 0.5) return `inside · battery: 6 cells, 11.4 V, 58 Wh · the processor makes up to 15 W of heat; the heat pipe carries it to the fins and the fan (~5000 rpm) blows it out of the back`;
        return deg < 2 ? "shut · 30.4 × 21.2 × 1.5 cm, 1.3 kg" : `lid open ${deg}° · 13.3-inch screen, 2560 × 1600 pixels${st.on && deg > 55 ? ` · on, showing ${st.show === "code" ? "code" : "the desktop"}` : ""}`;
      };
      draw();
      return g;
    },
  });
})();
