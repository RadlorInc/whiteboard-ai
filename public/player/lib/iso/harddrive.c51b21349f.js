// "harddrive cx cy height spin=0|1 track=0..1 lab=1 lit=platter|spindle|arm|head|coil|ramp" — an open 3.5" hard drive.
// The aluminium casting (a tub with a gasket groove and cover-screw holes round its rim) holds two glass platters on
// the spindle motor, clamped by a six-screw clamp; the actuator turns on its bearing cartridge: the arm with its
// steel suspension and the read/write head at the tip, and behind the pivot the voice coil over its magnet. A plastic
// ramp at the platters' edge parks the head while the disc is still; the flex cable runs from the actuator to the
// connector bracket, and a breather filter sits in the corner. spin=1 spins the platters up to 7200 rpm and the head
// loads off the ramp; track (0 outer edge … 1 inner) swings the arm across the tracks. set({ spin, track, lit }).
// 1 unit = 1 mm (the real 147 × 101.6 mm drive).
(() => {
  const K = window.K, T = window.TECH;
  const X0 = -73.5, X1 = 73.5, Y0 = -50.8, Y1 = 50.8, FLOOR = 6, RIM = 18, WALL = 3.2;
  const C = [-22.5, 0], PR = 47.5, PZ = [[8, 9.3], [11.5, 12.8]];           // platter centre, radius, the two platters
  const R_OUT = 45.5, R_IN = 19, R_PARK = 50, A_PARK = (40 * Math.PI) / 180; // outermost and innermost track, ramp
  // the ramp sits just off the platter's edge toward the free corner; the pivot is placed so the head's arc ends on it
  const PK = [C[0] + R_PARK * Math.cos(A_PARK), C[1] + R_PARK * Math.sin(A_PARK)];
  const V = [42, -10], ARM = Math.hypot(PK[0] - V[0], PK[1] - V[1]), AZ = [13.8, 15.4];   // pivot, head distance, arm height
  const d = [C[0] - V[0], C[1] - V[1]], DL = Math.hypot(...d), PHI = Math.atan2(d[1], d[0]);
  // the arm angle that puts the head over radius r of the platter (law of cosines), swinging toward +y
  const angleFor = (r) => PHI + SG * Math.acos(ISO.clamp((ARM * ARM + DL * DL - r * r) / (2 * ARM * DL), -1, 1));
  // pick the side of the pivot line the ramp is on
  const SG = (() => { const th = PHI + Math.acos(ISO.clamp((ARM * ARM + DL * DL - R_PARK * R_PARK) / (2 * ARM * DL), -1, 1)); return Math.hypot(V[0] + ARM * Math.cos(th) - PK[0], V[1] + ARM * Math.sin(th) - PK[1]) < 1 ? 1 : -1; })();
  const radiusAt = (th) => Math.hypot(V[0] + ARM * Math.cos(th) - C[0], V[1] + ARM * Math.sin(th) - C[1]);

  ISO.add({
    name: "harddrive", title: "Hard drive (open)", compare: "harddrive 480 270 400",
    about: "An open hard drive: the platters spin at 7200 rpm, the arm swings the read/write head across the tracks, the voice coil moves it, and the head parks on the ramp when the disc stops.",
    line: "harddrive cx cy height spin=0|1 track=0..1 lab=1 lit=platter|spindle|arm|head|coil|ramp",
    demo: { line: "harddrive 480 270 400", script: [{ set: { spin: 1 }, hold: 2.6 }, { set: { track: 0.9 }, hold: 2 }, { set: { track: 0.15 }, hold: 2 }, { set: { spin: 0 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.05, H = size * 1.22;
      const { P, g } = ISO.frame([[X0, Y0, 0], [X1, Y0, 0], [X0, Y1, 0], [X1, Y1, 0], [X0, Y0, RIM], [X1, Y1, RIM], [X1, Y0, RIM], [X0, Y1, RIM]], cx, cy, W, H, { azimuth: 28, elevation: 46, pad: size * 0.03 }, parent);
      const box = (x, y, z, tone, c, lit) => T.box(P, x, y, z, tone, c, lit), out = [];
      const near = (p) => K.depthOf(p, P);
      // ── the casting: halo, floor, the four walls (far ones now, near ones after the parts inside)
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 4 }, 0, 4, P)}"/>`);
      out.push(T.slab(P, { x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 3 }, 0, FLOOR, "lo", T.C.alu, 6, 0.8));
      const walls = [
        [[X0, X1], [Y0, Y0 + WALL]], [[X0, X1], [Y1 - WALL, Y1]], [[X0, X0 + WALL], [Y0 + WALL, Y1 - WALL]], [[X1 - WALL, X1], [Y0 + WALL, Y1 - WALL]],
      ].map(([x, y]) => ({ x, y, k: near([(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, RIM / 2]) }));
      const mid = near([0, 0, RIM / 2]), wallSvg = (w) => {
        const top = RIM, holes = [];
        // cover-screw holes on each wall's top, and the gasket groove along it
        const along = w.x[1] - w.x[0] > w.y[1] - w.y[0], c = [(w.x[0] + w.x[1]) / 2, (w.y[0] + w.y[1]) / 2];
        for (const f of [-0.42, 0, 0.42]) { const p = along ? [c[0] + f * (X1 - X0), c[1]] : [c[0], c[1] + f * (Y1 - Y0 - 8)]; holes.push(K.ring(p[0], p[1], 1.1, top, P, 14)); }
        return box(w.x, w.y, [FLOOR, top], "mid", T.C.alu) + T.L(holes.join(""), { tone: "lo" });
      };
      out.push(walls.filter((w) => w.k <= mid).map(wallSvg).join(""));
      // floor details: the breather filter in the far corner, the magnet under the voice coil, the connector bracket
      out.push(`<g data-name="filter">${box([X0 + 5, X0 + 17], [Y1 - 14, Y1 - WALL], [FLOOR, FLOOR + 6], "mid", T.C.white)}</g>`);
      // the voice-coil magnet: a sector round the pivot on its steel yoke plate, under the coil's whole swing
      const back = (r) => ((angleFor(r) + Math.PI) * 180) / Math.PI, SW = [Math.min(back(R_IN), back(R_PARK)), Math.max(back(R_IN), back(R_PARK))];
      const sector = (r0, r1, a0, a1) => [[a0, r0], ...[0, 1, 2, 3].map((i) => [a0 + ((a1 - a0) * i) / 3, r1]), [a1, r0]].map(([a, r]) => [V[0] + r * Math.cos((a * Math.PI) / 180), V[1] + r * Math.sin((a * Math.PI) / 180)]);
      out.push(`<g data-name="magnet">${T.plate(P, sector(8, 26, SW[0] - 26, SW[1] + 26), FLOOR, FLOOR + 1.6, "mid", T.C.dark)}${T.plate(P, sector(9.5, 24.5, SW[0] - 20, SW[1] + 20), FLOOR + 1.6, FLOOR + 4.6, "mid", T.C.magnet)}</g>`);
      // the connector bracket on the near-left wall, where the flex cable leaves for the drive's circuit board
      out.push(box([X1 - WALL - 10, X1 - WALL], [12, 30], [FLOOR, FLOOR + 5], "mid", T.C.dark));
      out.push(T.dot(P, [[X1 - WALL - 5, 15, FLOOR + 5], [X1 - WALL - 5, 27, FLOOR + 5]], 0.5));
      // the flex cable: a strip lying on the floor from the bracket to the actuator's foot, ending on both
      // the flex cable: a strip from the bracket's top, down onto the floor and under the actuator's foot
      const flex = [[X1 - WALL - 5, 21, FLOOR + 5], [X1 - WALL - 10, 21, FLOOR + 5], [X1 - WALL - 13, 20.6, FLOOR + 0.05], [V[0] + 3, V[1] + 4, FLOOR + 0.05]];
      const fw = 2.6, strip = [];
      for (let i = 0; i < flex.length - 1; i++) { const [a, b] = [flex[i], flex[i + 1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = [(-(b[1] - a[1]) / l) * fw, ((b[0] - a[0]) / l) * fw]; strip.push(T.quad(P, [[a[0] + n[0], a[1] + n[1], a[2]], [b[0] + n[0], b[1] + n[1], b[2]], [b[0] - n[0], b[1] - n[1], b[2]], [a[0] - n[0], a[1] - n[1], a[2]]], "#e9b35a", "#8a5a10", 0.5)); }
      out.push(`<g data-name="flex">${strip.join("")}</g>`);
      // ── the spindle: motor hub, the two platters with a spacer between, the clamp (rebuilt as it turns)
      const plat = (z0, z1, top) => `<g data-name="platter">${ISO.tinted(T.C.glass, T.S(K.cylinder(C[0], C[1], PR, z0, z1 - z0, P, 96, 0.3), { tone: "hi", inner: top ? T.L([24, 30, 36, 42].map((r) => K.ring(C[0], C[1], r, z1, P, 72)).join(""), { tone: "faint" }) : "" }))}</g>`;
      out.push(T.cyl(P, C[0], C[1], 14, FLOOR, 2, "mid", T.C.alu, 40));
      out.push(plat(...PZ[0], false));
      out.push(T.cyl(P, C[0], C[1], 13, PZ[0][1], PZ[1][0] - PZ[0][1], "mid", T.C.alu, 40));
      out.push(plat(...PZ[1], true));
      out.push(`<g data-name="spindle"></g>`);
      // ── the ramp at the platters' edge: a plastic block with a sloped lip the head slides up
      const RU = [Math.cos(A_PARK), Math.sin(A_PARK)], RN = [-RU[1], RU[0]];
      const rampAt = T.frame([C[0], C[1], FLOOR], [RU[0], RU[1], 0], [RN[0], RN[1], 0], [0, 0, 1]);
      out.push(`<g data-name="ramp">${T.obox(P, rampAt, [PR + 1, R_PARK + 5], [-4, 4], [0, AZ[0] - FLOOR - 0.6], "mid", T.C.black)}</g>`);
      // ── the bearing cartridge the actuator turns on
      out.push(T.cyl(P, V[0], V[1], 8.5, FLOOR, 2, "mid", T.C.alu, 32));
      out.push(`<g data-name="arm"></g>`);
      out.push(walls.filter((w) => w.k > mid).map(wallSvg).join(""));
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = { spindle: g.querySelector('[data-name="spindle"]'), arm: g.querySelector('[data-name="arm"]'), words: g.querySelector('[data-part="words"]') };
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];

      // the clamp has six screws, so 1/6 turn repeats: 30 poses, each built once
      const clampMemo = [], clampSvg = (q) => clampMemo[q] || (clampMemo[q] = (() => {
        const z = PZ[1][1], a0 = (q / 30) * (Math.PI / 3);
        const screws = Array.from({ length: 6 }, (_, i) => { const a = a0 + (i * Math.PI) / 3; return [C[0] + 9.5 * Math.cos(a), C[1] + 9.5 * Math.sin(a)]; });
        return ISO.tinted(T.C.steel, T.S(K.cylinder(C[0], C[1], 14, z, 1, P, 48, 0.3), { tone: "hi" })) + T.cyl(P, C[0], C[1], 5, z + 1, 1.6, "hi", T.C.steel, 24) +
          T.L(screws.map(([x, y]) => K.ring(x, y, 1.4, z + 1, P, 12)).join(""), { tone: "mid" }) + T.dot(P, screws.map(([x, y]) => [x, y, z + 1]), 0.45);
      })());
      // The actuator at angle th: E-block round the bearing, the arm tapering to the suspension, the slider under the
      // tip, and behind the pivot the yoke carrying the voice coil (its window shows the magnet under it).
      const armMemo = new Map(), armSvg = (th) => {
        const key = Math.round(th * 400);
        if (armMemo.has(key)) return armMemo.get(key);
        const u = [Math.cos(th), Math.sin(th)], n = [-u[1], u[0]], at = (a, b) => [V[0] + u[0] * a + n[0] * b, V[1] + u[1] * a + n[1] * b];
        const s = [];
        // voice coil yoke (behind the pivot) and the coil: a copper loop with the dark window in it
        s.push(T.plate(P, [at(-4, -7), at(-12, -9), at(-12, 9), at(-4, 7)], AZ[0], AZ[1], "mid", T.C.alu));
        const coil = [at(-11, -10), at(-22, -13), at(-24, -4), at(-24, 4), at(-22, 13), at(-11, 10)];
        s.push(`<g data-name="coil">${T.plate(P, coil, AZ[0] - 0.6, AZ[1] - 0.4, "hi", T.C.copper)}${T.quad(P, [at(-14, -6), at(-20, -8), at(-21.5, -2.5), at(-21.5, 2.5), at(-20, 8), at(-14, 6)].map(([x, y]) => [x, y, AZ[1] - 0.38]), "#5a6067", "#6e3a1c", 0.5)}</g>`);
        // the arm: tapered aluminium with a lightening hole, then the steel suspension, then the head
        s.push(T.plate(P, [at(6, -7), at(ARM * 0.62, -3.6), at(ARM * 0.62, 3.6), at(6, 7)], AZ[0], AZ[1], "hi", T.C.alu));
        s.push(T.quad(P, [at(12, -2.8), at(ARM * 0.5, -1.8), at(ARM * 0.5, 1.8), at(12, 2.8)].map(([x, y]) => [x, y, AZ[1] + 0.02]), "#7d848c", "#4a5058", 0.5));
        s.push(T.plate(P, [at(ARM * 0.6, -3.2), at(ARM - 1, -1.2), at(ARM - 1, 1.2), at(ARM * 0.6, 3.2)], AZ[0] - 0.5, AZ[0] - 0.1, "hi", T.C.steel));
        s.push(`<g data-name="head">${T.plate(P, [at(ARM - 2.4, -1.2), at(ARM + 0.8, -1.2), at(ARM + 0.8, 1.2), at(ARM - 2.4, 1.2)], PZ[1][1] + 0.1, AZ[0] - 0.5, "hi", T.C.dark)}</g>`);
        // the E-block hub on the bearing, with the pivot nut on top
        s.push(T.cyl(P, V[0], V[1], 7.5, FLOOR + 2, AZ[1] + 1 - FLOOR - 2, "mid", T.C.alu, 32) + T.cyl(P, V[0], V[1], 3.6, AZ[1] + 1, 1.4, "hi", T.C.steel, 20));
        s.push(T.dot(P, [[V[0], V[1], AZ[1] + 2.4]], 0.5));
        const svg = s.join("");
        armMemo.set(key, svg);
        return svg;
      };

      const st = { spin: o.spin === "1", rpm: o.spin === "1" ? 7200 : 0, a: 0, track: ISO.clamp(ISO.num(o, "track", 0.5), 0, 1), th: 0, lit: o.lit || "" };
      const trackR = () => R_OUT - st.track * (R_OUT - R_IN);
      // the head flies only when the platters are up to speed; otherwise it waits on the ramp
      const wantTh = () => (st.rpm > 5000 && st.spin ? angleFor(trackR()) : angleFor(R_PARK));
      st.th = wantTh();
      const draw = () => {
        const q = Math.floor(((st.a % (Math.PI / 3)) / (Math.PI / 3)) * 30) % 30;
        w.rebuild(el.spindle, String(q), () => clampSvg(q));
        w.rebuild(el.arm, String(Math.round(st.th * 400)), () => armSvg(st.th));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const r = radiusAt(st.th), parked = r > PR;
        w.rebuild(el.words, lab ? `${parked} ${Math.round(st.th * 40)}` : "", () => !lab ? "" : [
          T.word(P, [C[0] - PR, C[1], PZ[1][1]], "platter", { anchor: "end", dx: -10 }),
          T.word(P, [C[0], C[1] - 14, PZ[1][1] + 3], "spindle + clamp", { anchor: "middle", dy: -12 }),
          T.word(P, [V[0] + ARM * Math.cos(st.th), V[1] + ARM * Math.sin(st.th), AZ[1]], parked ? "head parked on the ramp" : "read/write head", { color: parked ? "#555" : "#1f4f8f", dy: -14 }),
          T.word(P, [V[0] + 16, V[1] - 22, FLOOR + 4], "voice coil + magnet", { anchor: "start", dx: 14, dy: 10 }),
          T.word(P, [X1 - WALL, 21, FLOOR + 5], "flex cable to the circuit board", { anchor: "start", dx: 10, dy: 4 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.spin !== undefined) st.spin = !!+p.spin;
        if (p.track !== undefined) st.track = ISO.clamp(+p.track, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // Spin-up and spin-down take a few seconds, as on a real drive; the platter is shown turning far slower than
      // 120 turns a second (it would only blur). The voice coil swings the arm on an eased follow.
      g.update = (dt) => {
        const calm = ISO.still(), want = st.spin ? 7200 : 0;
        st.rpm = calm ? want : st.rpm + ISO.clamp(want - st.rpm, -dt * 2600, dt * 3600);
        st.a += dt * (st.rpm / 7200) * Math.PI * 0.9;
        st.th = ISO.follow(st.th, wantTh(), dt, 0.16, calm);
        if (Math.abs(st.th - wantTh()) < 2e-4) st.th = wantTh();
        draw();
        return st.rpm > 0 || st.th !== wantTh();
      };
      g.readout = () => {
        const r = radiusAt(st.th);
        if (r > PR) return st.rpm > 0 ? `${Math.round(st.rpm)} rpm · head waits on the ramp until the platters reach speed` : "stopped · head parked on the ramp, off the platter, so it can't scratch it";
        return `${Math.round(st.rpm)} rpm (120 turns a second) · head over radius ${r.toFixed(1)} mm · it flies about 10 nm above the spinning surface on a cushion of air`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
