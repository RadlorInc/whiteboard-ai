// "hdd35 cx cy k spin=0|1 track=0..1 lid=0|1 lab=0 lit=…" — a PART (b34): a 3.5-inch hard drive lying flat, its origin
// the surface point under its middle (harddrive.js's open drive at real size, 147 × 101.6 mm). Under the aluminium
// casting the drive's circuit board on four standoffs with the SATA data and power sockets at its +x end (anchor
// `connector`). The casting: a tub with a gasket groove and cover-screw holes round its rim; two glass platters on the
// spindle under a six-screw clamp; the actuator on its bearing: arm, steel suspension, head, and behind the pivot the
// voice coil over its magnet; the parking ramp, the flex cable to the connector bracket, the breather filter. spin=1
// spins the platters up (a few seconds, as a real drive) and the head loads off the ramp; track (0 outer … 1 inner)
// swings the arm across the tracks; lid=1 closes the cover (a drive in a computer's cage). Built in mm.
(() => {
  const K = window.K, T = window.TECH;
  const X0 = -73.5, X1 = 73.5, Y0 = -50.8, Y1 = 50.8, FLOOR = 6, RIM = 18, WALL = 3.2, ZB = 6.5, LID = 1.4;
  const C = [-22.5, 0], PR = 47.5, PZ = [[8, 9.3], [11.5, 12.8]];
  const R_OUT = 45.5, R_IN = 19, R_PARK = 50, A_PARK = (40 * Math.PI) / 180;
  const PK = [C[0] + R_PARK * Math.cos(A_PARK), C[1] + R_PARK * Math.sin(A_PARK)];
  const V = [42, -10], ARM = Math.hypot(PK[0] - V[0], PK[1] - V[1]), AZ = [13.8, 15.4];
  const d = [C[0] - V[0], C[1] - V[1]], DL = Math.hypot(...d), PHI = Math.atan2(d[1], d[0]);
  const SG = (() => { const th = PHI + Math.acos(ISO.clamp((ARM * ARM + DL * DL - R_PARK * R_PARK) / (2 * ARM * DL), -1, 1)); return Math.hypot(V[0] + ARM * Math.cos(th) - PK[0], V[1] + ARM * Math.sin(th) - PK[1]) < 1 ? 1 : -1; })();
  const angleFor = (r) => PHI + SG * Math.acos(ISO.clamp((ARM * ARM + DL * DL - r * r) / (2 * ARM * DL), -1, 1));
  const radiusAt = (th) => Math.hypot(V[0] + ARM * Math.cos(th) - C[0], V[1] + ARM * Math.sin(th) - C[1]);
  const LIT = "platter|spindle|arm|head|coil|magnet|ramp|flex|filter|case|lid|board|connector";

  // the circuit board under the casting (camera Pm: z from the surface): standoffs, board, chips, the two sockets
  function boardSvg(Pm) {
    const s = [], posts = [[X0 + 8, Y0 + 8], [X1 - 8, Y0 + 8], [X0 + 8, Y1 - 8], [X1 - 8, Y1 - 8]].sort((a, b) => K.depthOf([...a, 0], Pm) - K.depthOf([...b, 0], Pm));
    s.push(T.slab(Pm, { x: X0 + 4, y: Y0 + 3, w: X1 - X0 - 8, d: Y1 - Y0 - 6, r: 2 }, 0, 1.6, "mid", T.C.pcb, 4));
    for (const [x, y] of posts) s.push(T.cyl(Pm, x, y, 2.6, 1.6, ZB - 1.6, "mid", T.C.steel, 14));
    // the SATA sockets at the +x end: the 7-pin data socket and the 15-pin power socket, gold pins in each slot
    s.push(`<g data-name="connector">${T.box(Pm, [X1 - 6, X1 + 0.5], [-34, -18], [1.6, ZB], "mid", T.C.black)}${T.box(Pm, [X1 - 6, X1 + 0.5], [-14, 18], [1.6, ZB], "mid", T.C.black)}`);
    for (const [y0, y1, n] of [[-32.5, -19.5, 7], [-12.5, 16.5, 15]]) {
      s.push(T.quad(Pm, [[X1 + 0.52, y0, 2.6], [X1 + 0.52, y1, 2.6], [X1 + 0.52, y1, ZB - 1.2], [X1 + 0.52, y0, ZB - 1.2]], "#16181b", "#0d0e10", 0.4));
      s.push(T.dot(Pm, Array.from({ length: n }, (_, i) => [X1 + 0.54, y0 + 0.9 + ((y1 - y0 - 1.8) * i) / (n - 1), 3.9]), 0.25, "hi"));
    }
    s.push("</g>");
    return `<g data-name="board">${s.join("")}</g>`;
  }
  // the cover: a pressed steel lid over the rim with its screws, the raised boss over the spindle and a blank label
  function lidSvg(Q) {
    const z = RIM, s = [T.slab(Q, { x: X0 + 0.4, y: Y0 + 0.4, w: X1 - X0 - 0.8, d: Y1 - Y0 - 0.8, r: 3 }, z, LID, "hi", T.C.steel, 6, 0.4)];
    const zt = z + LID, holes = [];
    for (const f of [-0.42, 0, 0.42]) holes.push([f * (X1 - X0), Y0 + WALL / 2], [f * (X1 - X0), Y1 - WALL / 2]);
    for (const f of [-0.42, 0.42]) holes.push([X0 + WALL / 2, f * (Y1 - Y0 - 8)], [X1 - WALL / 2, f * (Y1 - Y0 - 8)]);
    s.push(T.L(K.planOutline(K.insetPlan({ x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 3 }, 6), zt, Q, 6), { tone: "faint" }));
    s.push(T.cyl(Q, C[0], C[1], 16, zt, 0.6, "hi", T.C.steel, 40), T.L(K.ring(C[0], C[1], 4, zt + 0.6, Q, 16), { tone: "mid" }), T.cyl(Q, V[0], V[1], 6, zt, 0.4, "hi", T.C.steel, 24));
    s.push(T.L(holes.map(([x, y]) => K.ring(x, y, 1.3, zt, Q, 12)).join(""), { tone: "mid" }), T.dot(Q, holes.map(([x, y]) => [x, y, zt]), 0.45));
    // the label: a white sticker, its printed rows (free rule lines) and a bar code
    const lb = { x: 4, y: -38, w: 52, d: 34, r: 1 };
    s.push(T.slab(Q, lb, zt, 0.15, "hi", T.C.white, 3));
    const zl = zt + 0.16, row = (y, x1) => K.pathOf([K.iso([lb.x + 4, y, zl], Q), K.iso([x1, y, zl], Q)]);
    s.push(T.L([-33, -29, -25, -21].map((y, i) => row(y, lb.x + lb.w - 4 - i * 9)).join(""), { tone: "lo", free: true }));
    s.push(`<path d="${Array.from({ length: 18 }, (_, i) => K.pathOf([K.iso([lb.x + 6 + i * 2.2, -13, zl], Q), K.iso([lb.x + 6 + i * 2.2, -8, zl], Q)])).join("")}" stroke="#2a2e33" stroke-width="${(K.cameraOf(Q).k * 0.9).toFixed(2)}" data-free=""/>`);
    return `<g data-name="lid">${s.join("")}</g>`;
  }

  ISO.add({
    name: "hdd35", title: "3.5-inch hard drive (part)", compare: null,
    about: "A 3.5-inch hard drive lying flat, open or with its lid on: two glass platters on the spindle spin up to 7200 rpm, the arm swings the read/write head across the tracks on its voice coil, and the head parks on the ramp when the disc stops; its circuit board and SATA sockets underneath. anchors: top connector",
    line: `hdd35 cx cy k spin=0|1 track=0..1 lid=0|1 lab=0 lit=${LIT}`,
    demo: { line: "hdd35 480 330 30 lab=1", script: [{ set: { spin: 1 }, hold: 2.6 }, { set: { track: 0.9 }, hold: 2 }, { set: { track: 0.15, lit: "head" }, hold: 2 }, { set: { spin: 0, lit: "" }, hold: "settle" }, { set: { lid: 1, lit: "connector" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), Q = B34.shift(Pm, [0, 0, -ZB]), lab = o.lab === "1";
      const box = (x, y, z, tone, c) => T.box(Q, x, y, z, tone, c), out = [];
      const near = (p) => K.depthOf(p, Q);
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 4 }, 0, ZB + RIM, Pm)}"/>`, boardSvg(Pm));
      out.push(`<g data-name="case">${T.slab(Q, { x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 3 }, 0, FLOOR, "lo", T.C.alu, 6, 0.8)}</g>`);
      const walls = [[[X0, X1], [Y0, Y0 + WALL]], [[X0, X1], [Y1 - WALL, Y1]], [[X0, X0 + WALL], [Y0 + WALL, Y1 - WALL]], [[X1 - WALL, X1], [Y0 + WALL, Y1 - WALL]]]
        .map(([x, y]) => ({ x, y, k: near([(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, RIM / 2]) }));
      const mid = near([0, 0, RIM / 2]), wallSvg = (w) => {
        const along = w.x[1] - w.x[0] > w.y[1] - w.y[0], c = [(w.x[0] + w.x[1]) / 2, (w.y[0] + w.y[1]) / 2], holes = [];
        for (const f of [-0.42, 0, 0.42]) { const p = along ? [c[0] + f * (X1 - X0), c[1]] : [c[0], c[1] + f * (Y1 - Y0 - 8)]; if (along || f) holes.push(K.ring(p[0], p[1], 1.1, RIM, Q, 14)); }
        const groove = along ? K.pathOf([[w.x[0] + WALL / 2, c[1], RIM], [w.x[1] - WALL / 2, c[1], RIM]].map((p) => K.iso(p, Q))) : K.pathOf([[c[0], w.y[0], RIM], [c[0], w.y[1], RIM]].map((p) => K.iso(p, Q)));
        return `<g data-name="case">${box(w.x, w.y, [FLOOR, RIM], "mid", T.C.alu)}${T.L(holes.join(""), { tone: "lo" })}${T.L(groove, { tone: "faint", free: true })}</g>`;
      };
      out.push(walls.filter((w) => w.k <= mid).map(wallSvg).join(""));
      out.push(`<g data-name="filter">${box([X0 + 5, X0 + 17], [Y1 - 14, Y1 - WALL], [FLOOR, FLOOR + 6], "mid", T.C.white)}${T.L(K.ring(X0 + 11, Y1 - 8.6, 3, FLOOR + 6, Q, 16), { tone: "faint" })}</g>`);
      const back = (r) => ((angleFor(r) + Math.PI) * 180) / Math.PI, SW = [Math.min(back(R_IN), back(R_PARK)), Math.max(back(R_IN), back(R_PARK))];
      const sector = (r0, r1, a0, a1) => [[a0, r0], ...[0, 1, 2, 3].map((i) => [a0 + ((a1 - a0) * i) / 3, r1]), [a1, r0]].map(([a, r]) => [V[0] + r * Math.cos((a * Math.PI) / 180), V[1] + r * Math.sin((a * Math.PI) / 180)]);
      out.push(`<g data-name="magnet">${T.plate(Q, sector(8, 26, SW[0] - 26, SW[1] + 26), FLOOR, FLOOR + 1.6, "mid", T.C.dark)}${T.plate(Q, sector(9.5, 24.5, SW[0] - 20, SW[1] + 20), FLOOR + 1.6, FLOOR + 4.6, "mid", T.C.magnet)}</g>`);
      out.push(`<g data-name="flex">${box([X1 - WALL - 10, X1 - WALL], [12, 30], [FLOOR, FLOOR + 5], "mid", T.C.dark)}${T.dot(Q, [[X1 - WALL - 5, 15, FLOOR + 5], [X1 - WALL - 5, 27, FLOOR + 5]], 0.5)}`);
      const flex = [[X1 - WALL - 5, 21, FLOOR + 5], [X1 - WALL - 10, 21, FLOOR + 5], [X1 - WALL - 13, 20.6, FLOOR + 0.05], [V[0] + 3, V[1] + 4, FLOOR + 0.05]];
      const fw = 2.6;
      for (let i = 0; i < flex.length - 1; i++) { const [a, b] = [flex[i], flex[i + 1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = [(-(b[1] - a[1]) / l) * fw, ((b[0] - a[0]) / l) * fw]; out.push(T.quad(Q, [[a[0] + n[0], a[1] + n[1], a[2]], [b[0] + n[0], b[1] + n[1], b[2]], [b[0] - n[0], b[1] - n[1], b[2]], [a[0] - n[0], a[1] - n[1], a[2]]], "#e9b35a", "#8a5a10", 0.5)); }
      out.push("</g>");
      const plat = (z0, z1, top) => `<g data-name="platter">${ISO.tinted(T.C.glass, T.S(K.cylinder(C[0], C[1], PR, z0, z1 - z0, Q, 96, 0.3), { tone: "hi", inner: top ? T.L([24, 30, 36, 42].map((r) => K.ring(C[0], C[1], r, z1, Q, 72)).join(""), { tone: "faint" }) : "" }))}</g>`;
      out.push(`<g data-name="spindle">${T.cyl(Q, C[0], C[1], 14, FLOOR, 2, "mid", T.C.alu, 40)}</g>`, plat(...PZ[0], false));
      out.push(`<g data-name="spindle">${T.cyl(Q, C[0], C[1], 13, PZ[0][1], PZ[1][0] - PZ[0][1], "mid", T.C.alu, 40)}</g>`, plat(...PZ[1], true));
      out.push(`<g data-name="spindle" data-part="clamp"></g>`);
      const RU = [Math.cos(A_PARK), Math.sin(A_PARK)], RN = [-RU[1], RU[0]];
      const rampAt = T.frame([C[0], C[1], FLOOR], [RU[0], RU[1], 0], [RN[0], RN[1], 0], [0, 0, 1]);
      out.push(`<g data-name="ramp">${T.obox(Q, rampAt, [PR + 1, R_PARK + 5], [-4, 4], [0, AZ[0] - FLOOR - 0.6], "mid", T.C.black)}</g>`);
      out.push(`<g data-name="arm">${T.cyl(Q, V[0], V[1], 8.5, FLOOR, 2, "mid", T.C.alu, 32)}</g><g data-part="arm"></g>`);
      out.push(walls.filter((w) => w.k > mid).map(wallSvg).join(""));
      out.push(`<g data-part="lid">${lidSvg(Q)}</g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      g.anchors = { top: [0, 0, +((ZB + RIM + LID) / 10).toFixed(2)], connector: [+((X1 + 0.5) / 10).toFixed(2), -0.8, 0.4] };

      const clampMemo = [], clampSvg = (q) => clampMemo[q] || (clampMemo[q] = (() => {
        const z = PZ[1][1], a0 = (q / 30) * (Math.PI / 3);
        const screws = Array.from({ length: 6 }, (_, i) => { const a = a0 + (i * Math.PI) / 3; return [C[0] + 9.5 * Math.cos(a), C[1] + 9.5 * Math.sin(a)]; });
        return ISO.tinted(T.C.steel, T.S(K.cylinder(C[0], C[1], 14, z, 1, Q, 48, 0.3), { tone: "hi" })) + T.cyl(Q, C[0], C[1], 5, z + 1, 1.6, "hi", T.C.steel, 24) +
          T.L(screws.map(([x, y]) => K.ring(x, y, 1.4, z + 1, Q, 12)).join(""), { tone: "mid" }) + T.dot(Q, screws.map(([x, y]) => [x, y, z + 1]), 0.45);
      })());
      const armMemo = new Map(), armSvg = (th) => {
        const key = Math.round(th * 400);
        if (armMemo.has(key)) return armMemo.get(key);
        const u = [Math.cos(th), Math.sin(th)], n = [-u[1], u[0]], at = (a, b) => [V[0] + u[0] * a + n[0] * b, V[1] + u[1] * a + n[1] * b], s = [];
        s.push(`<g data-name="arm">${T.plate(Q, [at(-4, -7), at(-12, -9), at(-12, 9), at(-4, 7)], AZ[0], AZ[1], "mid", T.C.alu)}</g>`);
        const coil = [at(-11, -10), at(-22, -13), at(-24, -4), at(-24, 4), at(-22, 13), at(-11, 10)];
        s.push(`<g data-name="coil">${T.plate(Q, coil, AZ[0] - 0.6, AZ[1] - 0.4, "hi", T.C.copper)}${T.quad(Q, [at(-14, -6), at(-20, -8), at(-21.5, -2.5), at(-21.5, 2.5), at(-20, 8), at(-14, 6)].map(([x, y]) => [x, y, AZ[1] - 0.38]), "#5a6067", "#6e3a1c", 0.5)}</g>`);
        s.push(`<g data-name="arm">${T.plate(Q, [at(6, -7), at(ARM * 0.62, -3.6), at(ARM * 0.62, 3.6), at(6, 7)], AZ[0], AZ[1], "hi", T.C.alu)}`);
        s.push(T.quad(Q, [at(12, -2.8), at(ARM * 0.5, -1.8), at(ARM * 0.5, 1.8), at(12, 2.8)].map(([x, y]) => [x, y, AZ[1] + 0.02]), "#7d848c", "#4a5058", 0.5));
        s.push(T.plate(Q, [at(ARM * 0.6, -3.2), at(ARM - 1, -1.2), at(ARM - 1, 1.2), at(ARM * 0.6, 3.2)], AZ[0] - 0.5, AZ[0] - 0.1, "hi", T.C.steel), "</g>");
        s.push(`<g data-name="head">${T.plate(Q, [at(ARM - 2.4, -1.2), at(ARM + 0.8, -1.2), at(ARM + 0.8, 1.2), at(ARM - 2.4, 1.2)], PZ[1][1] + 0.1, AZ[0] - 0.5, "hi", T.C.dark)}</g>`);
        s.push(`<g data-name="arm">${T.cyl(Q, V[0], V[1], 7.5, FLOOR + 2, AZ[1] + 1 - FLOOR - 2, "mid", T.C.alu, 32)}${T.cyl(Q, V[0], V[1], 3.6, AZ[1] + 1, 1.4, "hi", T.C.steel, 20)}${T.dot(Q, [[V[0], V[1], AZ[1] + 2.4]], 0.5)}</g>`);
        const svg = s.join("");
        armMemo.set(key, svg);
        return svg;
      };

      const st = { spin: o.spin === "1", rpm: o.spin === "1" ? 7200 : 0, a: 0, track: B34.num(o.track, 0.5, 0, 1), th: 0, lid: o.lid === "1", lit: o.lit || "" };
      const trackR = () => R_OUT - st.track * (R_OUT - R_IN);
      const wantTh = () => (st.rpm > 5000 && st.spin ? angleFor(trackR()) : angleFor(R_PARK));
      st.th = wantTh();
      const draw = () => {
        const q = Math.floor(((st.a % (Math.PI / 3)) / (Math.PI / 3)) * 30) % 30;
        w.rebuild(el.clamp, String(q), () => clampSvg(q));
        w.rebuild(el.arm, String(Math.round(st.th * 400)), () => armSvg(st.th));
        w.shown(el.lid, st.lid);
        B34.light(w, g, st.lit);
        const parked = radiusAt(st.th) > PR;
        w.rebuild(el.words, lab ? `${parked} ${st.lid} ${Math.round(st.th * 40)}` : "", () => !lab ? "" : st.lid ? [
          T.word(Pm, [0, Y1, ZB + RIM + LID], "3.5-inch hard drive, lid on", { dy: 30 }),
          T.word(Pm, [X1, -10, 3], "SATA data + power", { anchor: "start", dx: 12, dy: 6 }),
        ].join("") : [
          T.word(Q, [C[0] - PR, C[1], PZ[1][1]], "platters", { anchor: "end", dx: -10 }),
          T.word(Q, [C[0], C[1] - 14, PZ[1][1] + 3], "spindle + clamp", { anchor: "middle", dy: -14 }),
          T.word(Q, [V[0] + ARM * Math.cos(st.th), V[1] + ARM * Math.sin(st.th), AZ[1]], parked ? "head parked on the ramp" : "read/write head", { color: parked ? "#555" : "#1f4f8f", dy: -16 }),
          T.word(Q, [V[0] + 16, V[1] - 22, FLOOR + 4], "voice coil + magnet", { anchor: "start", dx: 14, dy: -6 }),
          T.word(Pm, [X1, -10, 3], "SATA sockets", { anchor: "start", dx: 12, dy: 6 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.spin !== undefined) st.spin = String(p.spin) === "1";
        if (p.track !== undefined) st.track = B34.num(p.track, st.track, 0, 1);
        if (p.lid !== undefined) st.lid = String(p.lid) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // spin-up and spin-down take a few seconds; the platter is shown turning far slower than 120 turns a second
      g.update = (dt) => {
        const calm = ISO.still(), want = st.spin ? 7200 : 0;
        st.rpm = calm ? want : st.rpm + ISO.clamp(want - st.rpm, -dt * 2600, dt * 3600);
        if (!calm) st.a = (st.a + dt * (st.rpm / 7200) * Math.PI * 0.9) % (Math.PI * 2);
        st.th = ISO.follow(st.th, wantTh(), dt, 0.16, calm);
        if (Math.abs(st.th - wantTh()) < 2e-4) st.th = wantTh();
        draw();
        return st.rpm > 0 || st.th !== wantTh();
      };
      g.readout = () => {
        const r = radiusAt(st.th), lid = st.lid ? "lid on · " : "";
        if (r > PR) return lid + (st.rpm > 0 ? `${Math.round(st.rpm)} rpm · head waits on the ramp until the platters reach speed` : "stopped · head parked on the ramp, off the platter, so it can't scratch it");
        return lid + `${Math.round(st.rpm)} rpm (120 turns a second) · head over radius ${r.toFixed(1)} mm · it flies about 10 nm above the spinning surface on a cushion of air`;
      };
      draw();
      return g;
    },
  });
})();
