// "breaker cx cy height trip=N lab=1 lit=…" — a home breaker panel on a wall, door swung open.
// The panel box carries a main breaker (100 A, handle up = ON) and ten branch breakers in two columns, odd numbers on
// the left and even on the right as in a real panel. A branch handle points toward the middle when ON, outward when
// OFF, and a tripped breaker's handle springs to the middle and shows red in its trip window. The door's inside
// carries the printed circuit directory. set({ trip: N }) trips breaker N; set({ handle: "off" | "on" }) moves the
// tripped breaker's handle: the real reset is fully OFF first, then ON. Local helper: doorAt (door frame).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. A surface panel 36 × 60 cm, 9 cm deep, on a wall.
  const BOX = { x0: -18, x1: 18, y0: -12, y1: -3, z0: 14, z1: 74 };
  const TRIM = { x0: -19.5, x1: 19.5, z0: 12.5, z1: 75.5, y0: -3, y1: -2 };
  const OPEN = { x0: -14, x1: 14, z0: 17, z1: 71 };
  const ROWS = [51, 44.5, 38, 31.5, 25];          // breaker centre heights, top to bottom
  const COL = { left: [-11.2, -1.6], right: [1.6, 11.2] };
  const MAIN = { x0: -6, x1: 6, z0: 58, z1: 67 };
  const CIRCUITS = [
    ["Kitchen counter", 20], ["Fridge", 20], ["Microwave", 20], ["Bathroom outlets", 20], ["Lights upstairs", 15],
    ["Lights downstairs", 15], ["Bedrooms", 15], ["Living room", 15], ["Washer", 20], ["Garage", 20],
  ];
  // Breaker n (1–10): odd on the left, even on the right, top to bottom.
  const spot = (n) => { const left = n % 2 === 1, [a, b] = left ? COL.left : COL.right; return { left, x0: a, x1: b, z: ROWS[Math.floor((n - 1) / 2)] }; };
  const DOOR = { hx: TRIM.x0, hy: -2, w: 37, z0: 14, z1: 74, t: 1.1, angle: 118 * Math.PI / 180 };
  // A point on the door: u along it from the hinge, t through it (0 = inside face), z up.
  const doorAt = (u, t, z) => { const c = Math.cos(DOOR.angle), s = Math.sin(DOOR.angle); return [DOOR.hx + u * c - t * s, DOOR.hy + u * s + t * c, z]; };
  const AMBER = "#c0392b";

  function staticSvg(P, lab) {
    const at3 = (p) => K.iso(p, P), out = [];
    const floor = { x: -44, y: -16, w: 78, d: 34, r: 2 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -3, 3, P)}"/>`, S(K.slabOf(floor, -3, 3, P, 3, 0.6), { tone: "lo" }));
    // The wall: drywall on the floor with a skirting board, a stud line where the panel is screwed.
    out.push(ISO.wbox(P, [-44, 34], [-16, -12], [0, 84], "mid"));
    out.push(ISO.wbox(P, [-44, 34], [-12, -11.2], [0, 7], "mid"));
    // Box, with knockouts on top and a cable connector feeding it from above.
    out.push(ISO.wbox(P, [BOX.x0, BOX.x1], [BOX.y0, BOX.y1], [BOX.z0, BOX.z1], "mid"));
    const ko = [-12, -5, 5, 12];
    out.push(L(ko.map((x) => K.ring(x, -7.5, 1.4, BOX.z1, P, 16)).join(""), { tone: "lo" }));
    out.push(S(K.cylinder(0, -7.5, 2.4, BOX.z1, 1, P, 6), { tone: "mid" }), L(K.ring(0, -7.5, 1.2, BOX.z1 + 1, P, 14), { tone: "lo" }));
    // Trim frame round the opening (four bars), the dead front behind it, and the cover screws.
    out.push(ISO.wbox(P, [TRIM.x0, TRIM.x1], [TRIM.y0, TRIM.y1], [OPEN.z1, TRIM.z1], "mid"), ISO.wbox(P, [TRIM.x0, OPEN.x0], [TRIM.y0, TRIM.y1], [TRIM.z0, OPEN.z1], "mid"));
    out.push(ISO.wbox(P, [OPEN.x1, TRIM.x1], [TRIM.y0, TRIM.y1], [TRIM.z0, OPEN.z1], "mid"), ISO.wbox(P, [OPEN.x0, OPEN.x1], [TRIM.y0, TRIM.y1], [TRIM.z0, OPEN.z0], "mid"));
    const screws = [[-16.8, 73.4], [16.8, 73.4], [-16.8, 14.6], [16.8, 14.6]];
    out.push(L(screws.map(([x, z]) => K.sideRing([x, TRIM.y1, z], 0.9, "y", P, 14)).join(""), { tone: "lo" }), D(screws.map(([x, z]) => at3([x, TRIM.y1, z])), { size: 0.5 }));
    // The dead front's centre rib (bus cover) between the two columns, with its screws.
    out.push(ISO.wbox(P, [-0.9, 0.9], [-3, -2.4], [18.5, 55], "lo"), D([at3([0, -2.4, 20]), at3([0, -2.4, 53.5])], { size: 0.45 }));
    // Numbers beside each slot, printed on the dead front.
    const nums = [];
    for (let n = 1; n <= 10; n++) {
      const p = spot(n), x = p.left ? -12.6 : 12.6;
      nums.push(`<g transform="${ISO.faceMatrix(P, [x, -3, p.z - 0.9], 1)}"><text text-anchor="middle" style="font:700 2.2px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">${n}</text></g>`);
    }
    out.push(nums.join(""));
    // Main breaker body (two poles wide) with its rating.
    out.push(`<g data-name="main">${ISO.wbox(P, [MAIN.x0, MAIN.x1], [-3, -1.5], [MAIN.z0, MAIN.z1], "mid")}` +
      `<g transform="${ISO.faceMatrix(P, [MAIN.x1 - 1.2, -1.5, MAIN.z0 + 1.3], 1)}"><text text-anchor="end" style="font:700 1.9px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">100</text></g>` +
      `<g transform="${ISO.faceMatrix(P, [MAIN.x0 + 1.2, -1.5, MAIN.z1 - 1], 1)}"><text style="font:700 1.6px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">ON</text></g>` +
      `<g transform="${ISO.faceMatrix(P, [MAIN.x0 + 1.2, -1.5, MAIN.z0 + 1.3], 1)}"><text style="font:700 1.6px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">OFF</text></g>` +
      `<g data-part="mainhandle">${ISO.wbox(P, [-4, 4], [-1.5, 0.4], [63.2, 65.4], "hi")}</g></g>`);
    if (lab) out.push(ISO.word(at3([BOX.x1 + 2, -2, 64]), "Main switch", "#444", { anchor: "start", size: 13 }));
    return out.join("");
  }
  // One branch breaker: its body through the dead front, the amp rating, the trip window and the handle at p
  // (1 = ON toward the middle, 0 = tripped, −1 = OFF toward the side).
  function breakerSvg(P, n, p) {
    const s = spot(n), side = s.left ? 1 : -1, cx = (s.x0 + s.x1) / 2, out = [];
    out.push(ISO.wbox(P, [s.x0, s.x1], [-3, -1.6], [s.z - 2.1, s.z + 2.1], "mid"));
    const win = s.left ? [s.x0 + 0.8, s.x0 + 2.6] : [s.x1 - 2.6, s.x1 - 0.8];
    const red = p < 0.5;
    out.push(`<path d="${K.pathOf([[win[0], s.z + 0.3], [win[1], s.z + 0.3], [win[1], s.z + 1.5], [win[0], s.z + 1.5]].map(([x, z]) => K.iso([x, -1.55, z], P)), true)}" fill="${red ? "#e04b3a" : "#cfd2d6"}" stroke="#3c3f45" stroke-width="0.5"/>`);
    out.push(`<g transform="${ISO.faceMatrix(P, [win[0] + (win[1] - win[0]) / 2, -1.55, s.z - 1.6], 1)}"><text text-anchor="middle" style="font:700 1.5px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">${CIRCUITS[n - 1][1]}</text></g>`);
    const hx = cx + side * (0.9 + p * 1.8);
    out.push(ISO.wbox(P, [hx - 1, hx + 1], [-1.6, 0.8], [s.z - 1.2, s.z + 1.2], "hi"));
    return out.join("");
  }
  function doorSvg(P, lab) {
    const T = DOOR, at3 = (p) => K.iso(p, P), V = [], out = [];
    for (const [u, t, z] of [[0, 0, T.z0], [T.w, 0, T.z0], [T.w, 0, T.z1], [0, 0, T.z1], [0, T.t, T.z0], [T.w, T.t, T.z0], [T.w, T.t, T.z1], [0, T.t, T.z1]]) V.push(doorAt(u, t, z));
    out.push(ISO.poly(V, ISO.BOX_F, P, "mid"));
    // Hinge knuckles on the hinge edge, a latch tab on the free edge.
    for (const z of [T.z0 + 6, T.z1 - 6]) { const [x, y] = doorAt(0, T.t / 2, 0); out.push(S(K.cylinder(x, y, 0.9, z - 2.5, 5, P, 16), { tone: "mid" })); }
    const lt = [doorAt(T.w - 2.4, 0, 43), doorAt(T.w - 1, 0, 43), doorAt(T.w - 1, 0, 47), doorAt(T.w - 2.4, 0, 47), doorAt(T.w - 2.4, -1.4, 43), doorAt(T.w - 1, -1.4, 43), doorAt(T.w - 1, -1.4, 47), doorAt(T.w - 2.4, -1.4, 47)];
    out.push(ISO.poly(lt, ISO.BOX_F, P, "mid"));
    // The circuit directory: a paper card on the inside face, ruled into ten rows.
    const card = [[4, 68], [33, 68], [33, 22], [4, 22]];
    out.push(`<path d="${K.pathOf(card.map(([u, z]) => K.iso(doorAt(u, -0.05, z), P)), true)}" fill="#fbfaf4" stroke="#7a7466" stroke-width="0.6"/>`);
    // Seen from inside, the hinge is on the right: the card reads from the free edge toward the hinge.
    const o = K.iso(doorAt(33, -0.06, 68), P), a = K.iso(doorAt(32, -0.06, 68), P), b = K.iso(doorAt(33, -0.06, 67), P);
    const m = `matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})`;
    const rows = [`<path d="M0 4.2 H29" stroke="#7a7466" stroke-width="0.35"/>`, `<text x="14.5" y="3.1" text-anchor="middle" style="font:700 2.2px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">CIRCUIT DIRECTORY</text>`];
    CIRCUITS.forEach(([name, amps], i) => {
      const y = 4.2 + (i + 1) * 4.1;
      rows.push(`<g data-row="${i + 1}"><text x="1" y="${y - 1.1}" style="font:600 2px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">${i + 1}</text>` +
        `<text x="4" y="${y - 1.1}" style="font:600 2px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">${name}</text>` +
        `<text x="28" y="${y - 1.1}" text-anchor="end" style="font:600 2px 'Helvetica Neue',Arial,sans-serif" fill="#3c3f45">${amps} A</text></g>`);
      if (i < 9) rows.push(`<path d="M0 ${y} H29" stroke="#c9c4b4" stroke-width="0.3"/>`);
    });
    rows.push(`<path d="M3 4.2 V45.9" stroke="#c9c4b4" stroke-width="0.3"/>`);
    out.push(`<g transform="${m}">${rows.join("")}</g>`);
    if (lab) out.push(ISO.word(at3(doorAt(T.w * 0.55, 0, T.z0)), "Circuit directory", "#444", { dy: 18, size: 13 }));
    return out.join("");
  }

  ISO.add({
    name: "breaker", title: "Breaker panel", compare: "breaker 480 270 320 trip=4",
    about: "Home breaker panel with its door open: main switch, ten numbered breakers and the circuit directory; a tripped breaker sits in the middle with a red window, and the reset is fully OFF, then ON.",
    line: "breaker cx cy height trip=N lab=1 lit=main|N",
    demo: { line: "breaker 480 270 320", script: [{ set: {}, hold: 1.2 }, { set: { trip: 4 }, hold: 2.6 }, { set: { handle: "off" }, hold: 2.2 }, { set: { handle: "on" }, hold: 2.6 }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.3, H = size * 1.4;
      const pts = [[-44, -16, -3], [34, -16, -3], [-44, 18, -3], [34, 18, -3], [-44, -16, 84], [34, -16, 84], doorAt(DOOR.w, 0, DOOR.z1), doorAt(DOOR.w, 0, DOOR.z0)];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 58, elevation: 22 }, parent);
      g.innerHTML = `<g>${staticSvg(P, lab)}</g>` + Array.from({ length: 10 }, (_, i) => `<g data-name="b${i + 1}"></g>`).join("") + `<g data-part="door">${doorSvg(P, lab)}</g><g data-part="words"></g>`;
      const w = ISO.writer(), el = [...g.querySelectorAll("[data-name^=b]")], words = g.querySelector('[data-part="words"]');
      const parts = [...g.querySelectorAll("[data-name]")];
      const s = { p: Array(10).fill(1), v: Array(10).fill(0), target: Array(10).fill(1), trip: 0, lit: o.lit || "" };
      const n0 = ISO.clamp(Math.round(ISO.num(o, "trip", 0)), 0, 10);
      if (n0) { s.trip = n0; s.p[n0 - 1] = s.target[n0 - 1] = 0; }
      const draw = () => {
        el.forEach((e, i) => w.rebuild(e, s.p[i].toFixed(3), () => breakerSvg(P, i + 1, s.p[i])));
        const lit = s.lit === "main" ? ["main"] : s.lit ? [`b${s.lit}`] : s.trip ? [`b${s.trip}`] : [];
        w.light(parts, parts.filter((p) => lit.includes(p.dataset.name)));
        w.rebuild(words, `${s.trip} ${lab}`, () => {
          if (!lab || !s.trip) return "";
          const sp = spot(s.trip), at = K.iso([sp.left ? BOX.x0 - 1 : BOX.x1 + 1, -2, sp.z], P);
          return ISO.word(at, `Breaker ${s.trip}`, AMBER, { anchor: sp.left ? "end" : "start", size: 13, dy: 4 });
        });
      };
      g.set = (q) => {
        if (q.trip !== undefined) { const n = ISO.clamp(Math.round(+q.trip), 0, 10); s.target = s.target.map((v, i) => (i + 1 === n ? 0 : 1)); s.trip = n; }
        if (q.handle && s.trip) s.target[s.trip - 1] = q.handle === "off" ? -1 : 1;
        if (q.lit !== undefined) s.lit = q.lit;
      };
      g.update = (dt) => {
        let moving = false;
        for (let i = 0; i < 10; i++) {
          if (ISO.still()) { s.p[i] = s.target[i]; s.v[i] = 0; continue; }
          // A trip is the spring inside letting go: fast, with a little bounce. A hand push is slower and firm.
          const k = s.target[i] === 0 ? 900 : 260, c = s.target[i] === 0 ? 30 : 32;
          for (let j = 0; j < 4; j++) { const h = dt / 4; s.v[i] += (k * (s.target[i] - s.p[i]) - c * s.v[i]) * h; s.p[i] += s.v[i] * h; }
          if (Math.abs(s.v[i]) < 0.01 && Math.abs(s.target[i] - s.p[i]) < 0.002) { s.p[i] = s.target[i]; s.v[i] = 0; } else moving = true;
        }
        draw();
        return moving;
      };
      g.readout = () => {
        if (!s.trip) return "main 100 A ON · all ten breakers ON";
        const [name, amps] = CIRCUITS[s.trip - 1], p = s.p[s.trip - 1];
        if (p > 0.9) return `breaker ${s.trip} back ON · ${name} has power again`;
        if (p < -0.9) return `breaker ${s.trip} pushed fully OFF · now push it ON`;
        return `breaker ${s.trip} tripped · ${name} · ${amps} A · no power on that circuit`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
