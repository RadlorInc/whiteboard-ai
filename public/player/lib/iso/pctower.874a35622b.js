// "pctower cx cy k door=0..100 on=0|1 lab=0 lit=case|side|board|cooler|ram|gpu|psu|drive|fans" — a PART (batch 6): a
// mid-tower desktop case standing on the floor (or a desk), its origin the floor point under its middle, its front
// toward the room (+y), its side door on the +x side. Four rubber feet, a front mesh panel, the top with its vent, the
// power button and its lamp, the rear exhaust fan; the steel side door hangs on two hinges at the back edge and swings
// open door° (eased) to show the inside: the motherboard on its tray with the chipset heatsink and the 24-pin plug,
// the processor's tower cooler with its fan, four memory sticks, the graphics card with its backplate, the power
// supply at the bottom back and the drive cage with a hard drive and an SSD. on=1 lights the lamp and spins the fans
// (air in at the front, out at the back). Reused from computer.js (its tower), turned to face the room.
// Built in mm; anchors in cm.
(() => {
  const K = window.K;
  // computer.js's tower in its own millimetres; M() moves a point of it into this part (front toward +y)
  const X0 = 470, X1 = 680, Y0 = -250, Y1 = 200, Z0 = 10, Z1 = 470, OX = 575, OY = 31;
  const M = ([x, y, z]) => [x - OX, -(y + OY), z], MX = ([a, b]) => [a - OX, b - OX], MY = ([a, b]) => [-(b + OY), -(a + OY)];
  const CPUFAN = { c: M([X0 + 85, 49.9, 370]), r: 56 }, REARFAN = { c: M([X0 + 92, 171.9, 392]), r: 54 };
  ISO.add({
    name: "pctower", title: "Desktop tower (part)", compare: null,
    about: "A mid-tower desktop case: front mesh, top vent, power button and lamp, rear fan; its steel side door swings open to show the motherboard, cooler, memory, graphics card, power supply and drives; on=1 spins the fans. anchors: top front",
    line: "pctower cx cy k door=0..100 on=0|1 lab=0 lit=case|side|board|cooler|ram|gpu|psu|drive|fans",
    demo: { line: "pctower 470 470 8 door=0 on=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { door: 96 }, hold: "settle" }, { set: { on: 1, lit: "fans" }, hold: 3 }, { set: { lit: "gpu" }, hold: 1.3 }, { set: { lit: "psu" }, hold: 1.3 }, { set: { door: 40, on: 0, lit: "side" }, hold: "settle" }, { set: { door: 0, lit: "case" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
      const box = (x, y, z, tone = "mid", c = "") => T.box(Pm, MX(x), MY(y), z, tone, c), cyl = (x, y, r, z, h, tone, c, n) => { const p = M([x, y, 0]); return T.cyl(Pm, p[0], p[1], r, z, h, tone, c, n); };
      const iso = (p) => K.iso(M(p), Pm), named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: X0 - OX, y: -(Y1 + OY), w: X1 - X0, d: Y1 - Y0 + 12, r: 6 }, 0, Z1, Pm)}"/>`];
      // ── the case: feet, bottom, far wall, back wall with the rear fan's housing, the fan
      const feet = [[X0 + 25, Y0 + 40], [X1 - 25, Y0 + 40], [X0 + 25, Y1 - 40], [X1 - 25, Y1 - 40]].sort((a, b) => K.depthOf(M([...a, 0]), Pm) - K.depthOf(M([...b, 0]), Pm));
      out.push(named("case", feet.map(([x, y]) => cyl(x, y, 14, 0, Z0, "lo", T.C.rubber, 24)).join("") + box([X0, X1], [Y0, Y1], [Z0, Z0 + 3], "lo", T.C.alu) + box([X0, X0 + 3], [Y0, Y1], [Z0 + 3, Z1 - 3], "mid", T.C.alu) + box([X0 + 3, X1], [Y1 - 3, Y1], [Z0 + 3, Z1 - 3], "mid", T.C.alu)));
      // the inside is a build part of its own (phone budget): rear fan, board, power supply, drives, graphics card, cooler, memory
      const insideSvg = () => {
        const inner = [];
        inner.push(named("fans", box([X0 + 30, X0 + 154], [171.9, Y1 - 3], [REARFAN.c[2] - 62, REARFAN.c[2] + 62], "mid", T.C.black) + B.bore(Pm, REARFAN.c, X, Z, REARFAN.r) + `<g data-part="rearfan"></g>` + B.hub(Pm, REARFAN.c, Y, 15, 1.2)));
        // the motherboard on the tray, its chipset heatsink, the 24-pin plug
        inner.push(named("board", box([X0 + 3, X0 + 9], [-62, 186], [140, 450], "mid", T.C.pcb) + box([X0 + 9, X0 + 22], [-50, -10], [170, 210], "mid", T.C.alu) + box([X0 + 9, X0 + 26], [-58, -44], [330, 420], "mid", T.C.black)));
        // power supply at the bottom back (its rating on the side), the drive cage at the front with a hard drive and an SSD
        const psuText = T.flat(Pm, M([X0 + 165.1, 50, 80]), [0, -1, 0], [0, 0, -1], T.text(50, 18, B.say("650 W"), 20, "#e8eaed"));
        inner.push(named("psu", box([X0 + 12, X0 + 165], [40, Y1 - 3], [Z0 + 3, 99], "mid", T.C.dark) + psuText));
        inner.push(named("drive", box([X0 + 20, X0 + 130], [-238, -130], [Z0 + 3, 16], "mid", T.C.steel) + box([X0 + 20, X0 + 130], [-136, -130], [16, 130], "mid", T.C.steel) + box([X0 + 22, X0 + 125], [-232, -136], [16, 42], "mid", T.C.dark) + box([X0 + 20, X0 + 130], [-238, -232], [16, 130], "mid", T.C.steel) + box([X0 + 20, X0 + 130], [-238, -130], [130, 134], "mid", T.C.steel) + box([X0 + 30, X0 + 100], [-225, -142], [134, 141], "hi", T.C.white)));
        // graphics card: shroud (its fans face the floor), backplate on top, bracket against the back wall
        inner.push(named("gpu", box([X0 + 9, X0 + 140], [-70, Y1 - 3], [228, 280], "mid", T.C.dark) + box([X0 + 9, X0 + 140], [-70, Y1 - 3], [280, 283], "hi", T.C.steel) + box([X0 + 140, X0 + 141.5], [-60, 150], [246, 262], "hi", T.C.red)));
        // processor cooler: copper base, the fin tower (a fin edge every 5 mm), heat-pipe ends on top, its fan in front
        const FX = [X0 + 22, X0 + 150], FY = [75, 126], FZ = [300, 440], fins = [];
        for (let z = FZ[0] + 5; z < FZ[1] - 1; z += 5) fins.push(K.pathOf([iso([FX[1], FY[0], z]), iso([FX[1], FY[1], z])]));
        const pipeEnds = [0, 1, 2, 3].map((i) => { const p = M([X0 + 50 + i * 24, 100, 0]); return K.ring(p[0], p[1], 4, FZ[1], Pm, 16); }).join("");
        inner.push(named("cooler", box([X0 + 9, X0 + 22], [82, 118], [345, 395], "hi", T.C.copper) + box(FX, FY, FZ, "hi", T.C.alu) + T.L(fins.join(""), { tone: "lo" }) +
          `<path d="${pipeEnds}" fill="#e2a985" stroke="#6e3a1c" stroke-width=".6"/>` + box(FX, [49.9, FY[0]], [CPUFAN.c[2] - 64, CPUFAN.c[2] + 64], "mid", T.C.black) +
          named("fans", B.bore(Pm, CPUFAN.c, X, Z, CPUFAN.r) + `<g data-part="cpufan"></g>` + B.hub(Pm, CPUFAN.c, Y, 16, 1.2))));
        inner.push(named("ram", [0, 11, 22, 33].map((y) => box([X0 + 9, X0 + 44], [y, y + 7], [300, 433], "mid", y % 22 ? T.C.dark : T.C.red)).join("")));
        return inner.join("");
      };
      out.push(`<g data-part="inside"></g>`);
      // front panel with its mesh, the top with its vent, the power button and its lamp
      const mesh = [], vent = [];
      for (let z = Z0 + 30; z < Z1 - 20; z += 14) for (let x = X0 + 20; x < X1 - 10; x += 14) mesh.push(iso([x, Y0 - 12.02, z]));
      for (let i = 0; i < 7; i++) for (let j = 0; j < 12; j++) vent.push(K.iso(M([X0 + 30 + i * 22, Y0 + 60 + j * 22, Z1 + 0.05]), Pm));
      const btn = M([(X0 + X1) / 2 - 30, Y0 + 25, 0]), lamp = M([(X0 + X1) / 2 + 30, Y0 + 25, 0]);
      out.push(named("case", box([X0, X1], [Y0 - 12, Y0], [Z0, Z1], "mid", T.C.alu) + box([X0 + 3, X1 - 3], [Y0, Y0 + 3], [Z0 + 3, Z1 - 3], "mid", T.C.alu) + T.D(mesh, { size: 0.45, tone: "lo" }) +
        box([X0, X1], [Y0, Y1], [Z1 - 3, Z1], "mid", T.C.alu) + T.D(vent, { size: 0.45, tone: "lo" }) + T.cyl(Pm, btn[0], btn[1], 9, Z1, 3, "hi", T.C.steel, 24) +
        `<path data-part="led" d="${K.ring(lamp[0], lamp[1], 3, Z1 + 0.05, Pm, 16)}" fill="${T.LED.off}" stroke="#101215" stroke-width=".5"/>`));
      // the side door: steel, a vent near the top back, a pull at its front edge; hung on two hinges at the back
      const H = M([X1, Y1, 0]);
      out.push(named("side", [70, 410].map((z) => T.cyl(Pm, H[0] + 3, H[1] + 1.5, 3, z, 26, "mid", T.C.steel, 14)).join("")), `<g data-part="side"></g>`, `<g data-part="words"></g>`);
      const doorMemo = new Map(), doorSvg = (deg) => {
        if (doorMemo.has(deg)) return doorMemo.get(deg);
        const ph = (deg * Math.PI) / 180, dir = [Math.sin(ph), Math.cos(ph), 0], nrm = [Math.cos(ph), -Math.sin(ph), 0];
        const at = T.frame([H[0] - 3 * nrm[0], H[1] - 3 * nrm[1], 0], dir, nrm, Z);
        const svg = named("side", T.obox(Pm, at, [3, Y1 - Y0], [0, 3], [Z0 + 3, Z1 - 3], "hi", T.C.alu) + T.quad(Pm, [at(40, 3.05, 300), at(160, 3.05, 300), at(160, 3.05, 440), at(40, 3.05, 440)], "#2a2e33", "#101215", 0.6) + T.obox(Pm, at, [420, 432], [3, 9], [220, 300], "mid", T.C.dark));
        doorMemo.set(deg, svg);
        return svg;
      };
      g.innerHTML = out.join("");
      g.anchors = { top: [0, 0, Z1 / 10], front: [0, -(Y0 - 12 + OY) / 10, 25] };
      const el = LAB.parts(g), w = ISO.writer(), memo = {};
      const st = { door: ISO.clamp(ISO.num(o, "door", 0), 0, 100), on: o.on === "1", a: 0, lit: o.lit || "" };
      st.want = st.door;
      const draw = () => {
        const deg = Math.round(st.door);
        w.rebuild(el.side, String(deg), () => doorSvg(deg));
        w.attr(el.led, "fill", st.on ? T.LED.blue : T.LED.off);
        const q = B.pose(st.a);
        if (el.cpufan) w.rebuild(el.cpufan, String(q), () => (memo["c" + q] ||= B.rotor(Pm, CPUFAN.c, X, Z, CPUFAN.r - 1, B.angle(q))));
        if (el.rearfan) w.rebuild(el.rearfan, String(q), () => (memo["r" + q] ||= B.rotor(Pm, REARFAN.c, X, Z, REARFAN.r - 1, B.angle((q + 5) % 12))));
        const open = st.door > 55;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : (open ? [
          ...[["processor cooler + fan", 418], ["memory", 336], ["graphics card", 255], ["motherboard", 185], ["power supply", 60]].map(([s, z]) => LAB.word(Pm, lab, M([X0, Y0 - 12, z]), s, "#556", { anchor: "end", dx: -10 })),
          LAB.word(Pm, lab, M([X1, Y0 - 12, 70]), "drives", "#556", { anchor: "start", dx: 10 }),
        ] : [LAB.word(Pm, lab, M([X1, Y0 - 12, Z1]), "tower", "#556", { anchor: "start", dx: 10 })]).join(""));
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.door !== undefined && p.door !== "" && Number.isFinite(+p.door)) st.want = ISO.clamp(+p.door, 0, 100);
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the door swings on an eased follow; the fans turn at a shown pace (real ones spin at ~1200 rpm)
      g.update = (dt) => {
        const calm = ISO.still();
        st.door = ISO.follow(st.door, st.want, dt, 0.32, calm); if (Math.abs(st.door - st.want) < 0.2) st.door = st.want;
        const spin = st.on && !calm;
        if (spin) st.a += dt * 4;
        draw();
        return st.door !== st.want || spin;
      };
      ISO.later(() => { el.inside.innerHTML = insideSvg(); Object.assign(el, LAB.parts(el.inside)); draw(); });
      g.readout = () => {
        const inside = st.want > 50 ? "door open: processor under its tower cooler · 4 memory sticks · graphics card · 650 W power supply · hard drive + SSD" : st.want > 0 ? `door open ${Math.round(st.want)}°` : "side door shut";
        return st.on ? `on · ${inside} · the fans pull cool air in at the front and push warm air out of the back` : `off · ${inside}`;
      };
      draw();
      return g;
    },
  });
})();
