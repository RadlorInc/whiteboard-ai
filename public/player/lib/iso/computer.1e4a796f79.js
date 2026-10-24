// "computer cx cy width side=0..1 on=0|1 lab=1 lit=monitor|keyboard|tower|board|cooler|ram|gpu|psu|drive |text" — a desktop
// computer on a desk: the monitor on its stand (black bezel, the screen showing code or the given text), the keyboard
// and the mouse, and the tower. side=1 swings the tower's side door open to show the inside, as a builder sees it:
// the motherboard on its tray, the processor's tower cooler with its fan, four memory sticks, the graphics card
// with its backplate, the power supply at the bottom back, the drive cage with a hard drive and an SSD, and the rear
// exhaust fan. on=1 lights the screen and the power light and spins the fans (air in at the front, out at the
// back). set({ side, on, lit }). 1 unit = 1 mm.
(() => {
  const K = window.K, T = window.TECH;
  const DESK = { x: -720, y: -340, w: 1620, d: 650, r: 10 }, MX = -270;   // the monitor, keyboard and mouse sit MX along
  const X0 = 470, X1 = 680, Y0 = -250, Y1 = 200, Z0 = 10, Z1 = 470, SWING = 96;   // the tower's case, the door's swing (°)
  const MON = { x: [-290, 290], y: [130, 156], z: [140, 470] };
  const fanAt = (c, r) => ({ c, r });
  const CPUFAN = fanAt([X0 + 85, 49.9, 370], 56), REARFAN = fanAt([X0 + 92, 171.9, 392], 54);

  ISO.add({
    name: "computer", title: "Desktop computer (inside)", compare: "computer 480 270 440",
    about: "A desktop computer: monitor, keyboard and tower; slide the side panel off and the inside shows: motherboard, processor cooler, memory, graphics card, power supply and drives; switch it on and the fans spin.",
    line: "computer cx cy width side=0..1 on=0|1 lab=1 lit=monitor|keyboard|tower|board|cooler|ram|gpu|psu|drive |text",
    demo: { line: "computer 480 270 440", script: [{ set: { side: 1 }, hold: "settle" }, { set: { on: 1 }, hold: 4 }] },
    make([cx, cy, size = 440], o, text, parent) {
      const lab = o.lab !== "0", W = size * 1.95, H = size * 1.16;
      const { P, g } = ISO.frame([[DESK.x, DESK.y, -30], [DESK.x + DESK.w, DESK.y, -30], [DESK.x, DESK.y + DESK.d, -30], [DESK.x + DESK.w, DESK.y + DESK.d, -30], [X0, Y0, Z1], [X1 + (Y1 - Y0), Y1, Z1], [X1 + (Y1 - Y0), Y1, 0], [MON.x[0] + MX, MON.y[0], MON.z[1]], [MON.x[1] + MX, MON.y[1], MON.z[1]]], cx, cy, W, H, { azimuth: -36, elevation: 24, pad: size * 0.06 }, parent);
      const box = (x, y, z, tone = "mid", c = "", lit) => T.box(P, x, y, z, tone, c, lit), k = K.cameraOf(P).k;
      // a fan seen face on in an x–z plane at y (facing the viewer): its square frame is drawn by the caller
      const ringIn = (c, r, steps = 40) => K.pathOf(Array.from({ length: steps }, (_, i) => { const a = (i / steps) * 2 * Math.PI; return K.iso([c[0] + r * Math.cos(a), c[1], c[2] + r * Math.sin(a)], P); }), true);
      const rotor = (f, a0) => {
        const bl = [];
        for (let i = 0; i < 7; i++) { const a = a0 + (i * 2 * Math.PI) / 7, b = a + 0.55; bl.push(K.pathOf([K.iso([f.c[0] + f.r * 0.32 * Math.cos(a), f.c[1], f.c[2] + f.r * 0.32 * Math.sin(a)], P), K.iso([f.c[0] + (f.r - 0.1) * Math.cos(b), f.c[1], f.c[2] + (f.r - 0.1) * Math.sin(b)], P)])); }
        return `<path d="${ringIn(f.c, f.r)}" fill="#33383f" stroke="#101215" stroke-width=".6"/>${T.L(bl.join(""), { tone: "mid" })}<path d="${ringIn(f.c, f.r * 0.32, 28)}" fill="#4a4f57" stroke="#101215" stroke-width=".6"/>`;
      };

      const out = [`<path class="iso-halo" d="${K.haloOf(DESK, -30, 30, P)}"/>`, T.slab(P, DESK, -30, 30, "lo", ISO.T.wood, 6, 1.2)];
      // ── the tower: feet, bottom, far wall, back wall with the rear fan, then the parts inside
      const tw = [];
      for (const [x, y] of [[X0 + 25, Y0 + 40], [X1 - 25, Y0 + 40], [X0 + 25, Y1 - 40], [X1 - 25, Y1 - 40]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P))) tw.push(T.cyl(P, x, y, 14, 0, Z0, "lo", T.C.rubber, 24));
      tw.push(box([X0, X1], [Y0, Y1], [Z0, Z0 + 3], "lo", T.C.alu), box([X0, X0 + 3], [Y0, Y1], [Z0 + 3, Z1 - 3], "mid", T.C.alu), box([X0 + 3, X1], [Y1 - 3, Y1], [Z0 + 3, Z1 - 3], "mid", T.C.alu));
      tw.push(box([X0 + 30, X0 + 154], [REARFAN.c[1], Y1 - 3], [REARFAN.c[2] - 62, REARFAN.c[2] + 62], "mid", T.C.black), `<g data-part="rearfan"></g>`);
      // motherboard on the tray, with its standoffs hidden behind it, the chipset heatsink and the big power plug
      tw.push(`<g data-name="board">${box([X0 + 3, X0 + 9], [-62, 186], [140, 450], "mid", T.C.pcb)}${box([X0 + 9, X0 + 22], [-50, -10], [170, 210], "mid", T.C.alu)}${box([X0 + 9, X0 + 26], [-58, -44], [330, 420], "mid", T.C.black)}</g>`);
      // power supply at the bottom back, drive cage with a hard drive at the front, an SSD on top of the cage
      tw.push(`<g data-name="psu">${box([X0 + 12, X0 + 165], [40, Y1 - 3], [Z0 + 3, 99], "mid", T.C.dark)}${T.flat(P, [X0 + 165.1, 150, 80], [0, -1, 0], [0, 0, -1], T.text(50, 18, "650 W", 20, "#e8eaed"))}</g>`);
      tw.push(`<g data-name="drive">${box([X0 + 20, X0 + 130], [-238, -130], [Z0 + 3, 16], "mid", T.C.steel)}${box([X0 + 22, X0 + 125], [-232, -136], [16, 42], "mid", T.C.dark)}${box([X0 + 20, X0 + 130], [-238, -232], [16, 130], "mid", T.C.steel)}${box([X0 + 20, X0 + 130], [-136, -130], [16, 130], "mid", T.C.steel)}${box([X0 + 20, X0 + 130], [-238, -130], [130, 134], "mid", T.C.steel)}${box([X0 + 30, X0 + 100], [-225, -142], [134, 141], "hi", T.C.white)}</g>`);
      // graphics card: shroud, its fans face the floor; the backplate on top; bracket against the back wall
      tw.push(`<g data-name="gpu">${box([X0 + 9, X0 + 140], [-70, Y1 - 3], [228, 280], "mid", T.C.dark)}${box([X0 + 9, X0 + 140], [-70, Y1 - 3], [280, 283], "hi", T.C.steel)}${box([X0 + 140, X0 + 141.5], [-60, 150], [246, 262], "hi", T.C.red)}</g>`);
      // processor cooler: copper base on the socket, tower of horizontal fins with heat-pipe ends on top, fan in front
      const fins = [], FX = [X0 + 22, X0 + 150], FY = [75, 126], FZ = [300, 440];
      for (let z = FZ[0] + 5; z < FZ[1] - 1; z += 5) fins.push(K.pathOf([K.iso([FX[1], FY[0], z], P), K.iso([FX[1], FY[1], z], P)]));
      tw.push(`<g data-name="cooler">${box([X0 + 9, X0 + 22], [82, 118], [345, 395], "hi", T.C.copper)}${box(FX, FY, FZ, "hi", T.C.alu)}${T.L(fins.join(""), { tone: "lo" })}` +
        `<path d="${[0, 1, 2, 3].map((i) => K.ring(X0 + 50 + i * 24, 100, 4, FZ[1], P, 16)).join("")}" fill="#e2a985" stroke="#6e3a1c" stroke-width=".6"/>` +
        `${box(FX, [CPUFAN.c[1], FY[0]], [CPUFAN.c[2] - 64, CPUFAN.c[2] + 64], "mid", T.C.black)}<g data-part="cpufan"></g></g>`);
      tw.push(`<g data-name="ram">${[0, 11, 22, 33].map((y) => box([X0 + 9, X0 + 44], [y, y + 7], [300, 433], "mid", y % 22 ? T.C.dark : T.C.red)).join("")}</g>`);
      // front panel with its mesh, the top with its vent, the power button and light
      tw.push(box([X0, X1], [Y0 - 12, Y0], [Z0, Z1], "mid", T.C.alu), box([X0 + 3, X1 - 3], [Y0, Y0 + 3], [Z0 + 3, Z1 - 3], "mid", T.C.alu));
            const mesh = [];
      for (let z = Z0 + 30; z < Z1 - 20; z += 14) for (let x = X0 + 20; x < X1 - 10; x += 14) mesh.push(K.iso([x, Y0 - 12.02, z], P));
      tw.push(T.D(mesh, { size: 0.45, tone: "lo" }));
      tw.push(box([X0, X1], [Y0, Y1], [Z1 - 3, Z1], "mid", T.C.alu));
      tw.push(T.D(K.dotGrid(X0 + 30, Y0 + 60, 7, 12, 22, Z1, P), { size: 0.45, tone: "lo" }));
      tw.push(T.cyl(P, (X0 + X1) / 2 - 30, Y0 + 25, 9, Z1, 3, "hi", T.C.steel, 24), `<g data-part="led"></g>`);
      // the side panel: a steel door with a vent, hung on two hinges at the case's back edge
      const HINGE = [X1, Y1];
      const hinges = [70, 410].map((z) => T.cyl(P, X1 + 3, Y1 - 1.5, 3, z, 26, "mid", T.C.steel, 14)).join("");
      const doorMemo = new Map(), doorSvg = (ph) => {
        const key = Math.round(ph * 90);
        if (doorMemo.has(key)) return doorMemo.get(key);
        const dir = [Math.sin(ph), -Math.cos(ph), 0], nrm = [Math.cos(ph), Math.sin(ph), 0], at = T.frame([HINGE[0] - 3 * Math.cos(ph), HINGE[1] - 3 * Math.sin(ph), 0], dir, nrm, [0, 0, 1]);
        const svg = `<g data-name="side">${T.obox(P, at, [3, Y1 - Y0], [0, 3], [Z0 + 3, Z1 - 3], "hi", T.C.alu)}${T.quad(P, [at(40, 3.05, 300), at(160, 3.05, 300), at(160, 3.05, 440), at(40, 3.05, 440)], "#2a2e33", "#101215", 0.6)}${T.obox(P, at, [420, 432], [3, 9], [220, 300], "mid", T.C.dark)}</g>`;
        doorMemo.set(key, svg);
        return svg;
      };

      // ── the monitor: stand base, neck, bracket, the panel with its bezel, the screen
      const mon = [T.slab(P, { x: -130, y: 160, w: 260, d: 130, r: 30 }, 0, 10, "mid", T.C.alu, 8, 1), box([-28, 28], [220, 244], [10, 330], "mid", T.C.alu), box([-60, 60], [MON.y[1], 220], [280, 330], "mid", T.C.alu)];
      mon.push(box(MON.x, MON.y, MON.z, "mid", T.C.black), `<g data-part="screen"></g>`);
      // ── keyboard and mouse
      const kb = [T.slab(P, { x: -225, y: -290, w: 450, d: 145, r: 8 }, 0, 14, "mid", T.C.alu, 6, 1)], kz = [14, 20];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { const x = 210 - c * 30, y = -165 - r * 24; if (r === 4 && c > 3 && c < 10) continue; kb.push(box([x - 26, x], [y - 20, y], kz, "mid", T.C.dark)); }
      kb.push(box([-90, 90], [-281, -261], kz, "mid", T.C.dark));
      const mouse = [T.slab(P, { x: -360, y: -270, w: 62, d: 105, r: 28 }, 0, 22, "hi", T.C.alu, 8, 2)];
      mouse.push(`<path d="${K.lineOnTop([-329, -165], [-329, -205], 22, P)}" fill="none" stroke="#4a5058" stroke-width=".6"/>`, box([-332, -326], [-198, -180], [22, 25], "mid", T.C.dark));

      g.innerHTML = out.join("") + `<g transform="${K.translateAlong(P, [MX, 0, 0])}"><g data-name="monitor">${mon.join("")}</g><g data-name="keyboard">${kb.join("")}</g><g>${mouse.join("")}</g></g><g data-name="tower">${tw.join("")}</g>${hinges}<g data-part="side"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];

      const SW = MON.x[1] - MON.x[0] - 20, SH = MON.z[1] - MON.z[0] - 20, cid = `pc${T.uid++}`;
      const screenSvg = (lit) => {
        const s = [`<clipPath id="${cid}"><rect width="${SW}" height="${SH}"/></clipPath><g clip-path="url(#${cid})"><rect width="${SW}" height="${SH}" fill="${lit ? (text ? "#dff1ff" : "#1f3b4d") : "#14171b"}"/>`];
        if (lit && text) { const fs = Math.min(48, (SW - 30) / (0.56 * Math.max(1, text.length))); s.push(T.text(SW / 2, SH / 2 + fs * 0.35, text, fs.toFixed(1))); }
        else if (lit) s.push(T.code(26, 36, SW * 0.7, 10, 27, 7));
        return T.flat(P, [MON.x[1] - 10, MON.y[0] - 0.05, MON.z[1] - 10], [-1, 0, 0], [0, 0, -1], s.join("") + "</g>");
      };
      // 7-blade fans repeat every 1/7 turn: 12 poses each, built once
      const memo = {}, fanSvg = (name, f, q) => (memo[name + q] ||= rotor(f, (q / 12) * ((2 * Math.PI) / 7)));

      const st = { side: ISO.clamp(ISO.num(o, "side", 0), 0, 1), on: o.on === "1", a: 0, lit: o.lit || "" };
      st.want = st.side;
      const draw = () => {
        const ph = (st.side * SWING * Math.PI) / 180;
        w.rebuild(el.side, String(Math.round(ph * 90)), () => doorSvg(ph));
        w.rebuild(el.screen, String(st.on), () => screenSvg(st.on));
        w.rebuild(el.led, String(st.on), () => `<path d="${K.ring((X0 + X1) / 2 + 30, Y0 + 25, 3, Z1 + 0.05, P, 16)}" fill="${st.on ? T.LED.blue : T.LED.off}" stroke="#101215" stroke-width=".5"/>`);
        const q = Math.floor(((st.a % ((2 * Math.PI) / 7)) / ((2 * Math.PI) / 7)) * 12) % 12;
        w.rebuild(el.cpufan, String(q), () => fanSvg("c", CPUFAN, q));
        w.rebuild(el.rearfan, String(q), () => fanSvg("r", REARFAN, (q + 5) % 12));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const open = st.side > 0.6;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : (open ? [
          ...[["processor cooler + fan", 418], ["memory (RAM)", 336], ["graphics card", 255], ["motherboard", 185], ["power supply", 60]].map(([t, z]) => T.word(P, [X1, Y1, z], t, { anchor: "end", dx: -12, dy: 4 })),
          T.word(P, [X1, Y0 - 12, 70], "drives", { anchor: "start", dx: 10, dy: 4 }),
        ] : [
          T.word(P, [X1, Y0, Z1], "tower", { dy: -10 }),
          T.word(P, [MON.x[0] + MX, MON.y[0], MON.z[1]], "monitor", { anchor: "start", dx: 10, dy: -10 }),
          T.word(P, [-225 + MX, -290, 14], "keyboard", { anchor: "start", dx: 6, dy: 18 }),
        ]).join(""));
      };
      g.set = (p) => {
        if (p.side !== undefined) st.want = ISO.clamp(+p.side, 0, 1);
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // The door swings on an eased follow; the fans turn at a shown pace (real ones spin at ~1200 rpm).
      g.update = (dt) => {
        const calm = ISO.still();
        st.side = ISO.follow(st.side, st.want, dt, 0.32, calm); if (Math.abs(st.side - st.want) < 0.002) st.side = st.want;
        const spin = st.on && !calm;
        if (spin) st.a += dt * 4;
        draw();
        return st.side !== st.want || spin;
      };
      g.readout = () => {
        const inside = st.side > 0.5 ? "inside: processor (65 W) under its tower cooler · 4 × 8 GB memory · graphics card · 650 W power supply · hard drive + SSD" : "side panel on";
        return st.on ? `on · ${inside} · the fans pull cool air in at the front and push warm air out of the back` : `off · ${inside}`;
      };
      draw();
      return g;
    },
  });
})();
