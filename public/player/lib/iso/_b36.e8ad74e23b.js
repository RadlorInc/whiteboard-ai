// Batch b36 helpers (PARTS.md, batch 6: computer-science parts). Not a recipe: it only defines window.B36.
// Shared by pinpadlock + lockstand (the clamp block), dimmstick + dimmslot (the memory stick), robotarm + cartonbox
// (the carton look). World units are said per function.
(() => {
  const K = window.K;
  const B36 = (window.B36 = {});
  // a finite number from the line, clamped (fuzzed lines pass words, NaN, huge values)
  B36.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B36.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the same camera with 1 unit = f cm (ISO.mm is f = 0.1), its world origin moved to the cm point o
  B36.cam = (P, f, o = [0, 0, 0]) => { const Q = { ...P, scale: P.scale * f }; Q.origin = K.iso(o, P); return Q; };
  B36.parts = (g) => Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
  B36.word = (P, p, text, { color = "#444", anchor = "start", size = 13, dx = 8, dy = 0 } = {}) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], text, color, { anchor, size, dy }); };

  // ── the lock stand's clamp block (cm, in the stand's world): a steel block from the upright plate forward to the
  // lock's cut face, gripping one side of the body, two cap screws in its front. sx = -1 far side, +1 near side.
  // The lock's cut plane is y = Y, its body x ±2.5, z from Z0. pinpadlock clamp=1 draws the near one over itself.
  B36.LOCK = { HW: 2.5, Y: 1, Z0: 7.8, CZ: [1.9, 3.75], CW: 0.62, CY0: -0.55 };
  B36.clamp = (P, sx, L = B36.LOCK) => {
    const x = sx < 0 ? [-L.HW - L.CW, -L.HW] : [L.HW, L.HW + L.CW], y = [L.CY0, L.Y], z = [L.Z0 + L.CZ[0], L.Z0 + L.CZ[1]];
    const xm = (x[0] + x[1]) / 2, screws = [z[0] + 0.45, z[1] - 0.45].map((zz) => K.iso([xm, y[1] + 0.01, zz], P));
    return ISO.tinted(ISO.T.steel, ISO.wbox(P, x, y, z, "mid")) + K.dotsSvg(screws, { size: 0.6 });
  };

  // ── carton (cm): a cardboard box w × w × h, origin under its middle, flaps meeting along x with a tape strip over the
  // seam and down both ends, the flap edges as shut lines, a printed arrow pair and a small label. yaw turns it about z;
  // c = [x, y, z0] where its bottom middle is.
  const CARD = ISO.tint("#ead2a6", ["#b98d52", "#c79c62", "#d3ab74", "#dfbc88"], "#6b4a1e");
  B36.carton = (P, c = [0, 0, 0], yaw = 0, w = 28, h = 20) => {
    const d = [Math.cos(yaw), Math.sin(yaw), 0], q = [-Math.sin(yaw), Math.cos(yaw), 0];
    const f = (u, v, z) => [c[0] + d[0] * u + q[0] * v, c[1] + d[1] * u + q[1] * v, c[2] + z], hw = w / 2, tw = 2.4;
    const at = (u, v, z) => K.iso(f(u, v, z), P), seam = (pts, col, sw) => `<path d="${K.pathOf(pts.map((p) => at(...p)))}" fill="none" stroke="${col}" stroke-width="${sw}"/>`;
    const out = [ISO.tinted(CARD, ISO.box(f, P, [-hw, hw], [-hw, hw], [0, h], "hi"))];
    // the flaps' meeting line across the top, end to end, and the two flap fold lines along the top edges
    out.push(seam([[-hw, 0, h + 0.01], [hw, 0, h + 0.01]], "#7a5a2e", 0.7));
    // tape: over the seam on top and down the two end faces (u = ±hw), each a closed strip
    const tape = (pts) => `<path d="${K.pathOf(pts.map((p) => at(...p)), true)}" fill="#cdb48a" fill-opacity=".9" stroke="#8a6a3a" stroke-width=".4"/>`;
    out.push(tape([[-hw, -tw / 2, h + 0.02], [hw, -tw / 2, h + 0.02], [hw, tw / 2, h + 0.02], [-hw, tw / 2, h + 0.02]]));
    const near = (u, v) => K.depthOf(f(u * 1.1, v * 1.1, h / 2), P) > K.depthOf(f(u, v, h / 2), P);
    for (const s of [-1, 1]) if (near(s * hw, 0)) out.push(tape([[s * (hw + 0.02), -tw / 2, h], [s * (hw + 0.02), tw / 2, h], [s * (hw + 0.02), tw / 2, h - 7], [s * (hw + 0.02), -tw / 2, h - 7]]));
    // "this way up" arrows and a label on the side facing +v
    const vs = (near(0, hw) ? 1 : -1) * (hw + 0.02), ar = (u) => `<path data-free d="${K.pathOf([at(u, vs, h * 0.45), at(u, vs, h * 0.75)])}M${at(u - 1, vs, h * 0.64).map((n) => n.toFixed(1))}L${at(u, vs, h * 0.75).map((n) => n.toFixed(1))}L${at(u + 1, vs, h * 0.64).map((n) => n.toFixed(1))}" fill="none" stroke="#5a3e18" stroke-width=".8" stroke-linejoin="round"/>`;
    out.push(ar(-hw * 0.55), ar(-hw * 0.38));
    out.push(`<path d="${K.pathOf([at(hw * 0.15, vs, h * 0.35), at(hw * 0.75, vs, h * 0.35), at(hw * 0.75, vs, h * 0.7), at(hw * 0.15, vs, h * 0.7)], true)}" fill="#f6f2ea" stroke="#8a7a5a" stroke-width=".5"/>`);
    out.push(`<path data-free d="${[0.47, 0.58].map((z) => K.pathOf([at(hw * 0.22, vs + 0.01, h * z), at(hw * 0.68, vs + 0.01, h * z)])).join("")}" stroke="#9a8a6a" stroke-width=".5"/>`);
    return out.join("");
  };
  // ── the memory stick of ram.js (mm): a 133.4 × 31.2 mm green board, bottom edge (the contacts) at z = 0, its near
  // face at y = +TH. Gold contacts either side of the off-centre key notch, a row of resistors, the settings (SPD)
  // chip, the eight memory chips (a <g data-part="chips"> to fill with B36.chips) and a printed label sticker.
  const S6 = { HL: 66.7, PH: 31.2, TH: 0.64, NOTCH: -9.5 };
  B36.DIMM = S6;
  const OUT = (() => { const { HL, PH, NOTCH } = S6; return [[-HL, 0], [NOTCH - 0.9, 0], [NOTCH - 0.9, 3.2], [NOTCH + 0.9, 3.2], [NOTCH + 0.9, 0], [HL, 0], [HL, 13], [HL - 2, 13], [HL - 2, 16.5], [HL, 16.5], [HL, PH], [-HL, PH], [-HL, 16.5], [-HL + 2, 16.5], [-HL + 2, 13], [-HL, 13]]; })();
  B36.stick = (P) => {
    const T = window.TECH, { HL, TH, NOTCH } = S6, box = (x, y, z, tone, c) => T.box(P, x, y, z, tone, c), out = [];
    out.push(`<g data-name="board">${ISO.prismY(P, OUT, -TH, TH, ["#5f8f57", "#93bb8a"], "#7fae75", "#1f4a1a")}`);
    // printed traces from the chips' rows down toward the contacts (free printed lines on the board face)
    const tr = []; for (let i = 0; i < 24; i++) { const x = -HL + 6 + i * 5.4; if (Math.abs(x - NOTCH) < 3) continue; tr.push(K.pathOf([[x, TH + 0.01, 7.6], [x, TH + 0.01, 10.8]].map((p) => K.iso(p, P)))); }
    out.push(`<path data-free d="${tr.join("")}" stroke="#5e9455" stroke-width=".35"/></g>`);
    const pads = [];
    for (let x = -HL + 2; x < HL - 2; x += 1.85) { if (Math.abs(x - NOTCH) < 1.8) continue; pads.push([[x, TH + 0.02, 0.4], [x + 1.1, TH + 0.02, 0.4], [x + 1.1, TH + 0.02, 4.4], [x, TH + 0.02, 4.4]]); }
    out.push(`<g data-name="contacts">${pads.map((p) => T.quad(P, p, "#e0bf66", "#8a6a1a", 0.35)).join("")}</g>`);
    const res = []; for (let i = 0; i < 16; i++) { const x = -HL + 8 + i * 8.1; res.push(box([x, x + 1.6], [TH, TH + 0.5], [6.2, 7.0], "mid", T.C.paper)); }
    out.push(`<g data-name="resistors">${res.join("")}</g>`);
    out.push(`<g data-name="spd">${box([NOTCH + 4, NOTCH + 9], [TH, TH + 0.8], [6.4, 10.4], "hi", T.C.chip)}</g>`);
    out.push(`<g data-part="chips" data-name="chips"></g>`);
    const lab0 = [[-30, TH + 0.03, 25], [30, TH + 0.03, 25], [30, TH + 0.03, 29.6], [-30, TH + 0.03, 29.6]];
    out.push(`<g data-name="label">${T.quad(P, lab0, "#f4f4f0", "#8a8a84", 0.5)}${T.flat(P, [-28, TH + 0.04, 28.4], [1, 0, 0], [0, 0, -1], T.text(0, 0, "16 GB DDR5 · 5600", 2.6, "#4a5058", "start", 700))}</g>`);
    return out.join("");
  };
  // the eight memory chips; chip lit (and its partner four along) glows amber while data moves, -1 none
  const CHX = Array.from({ length: 8 }, (_, i) => { const x0 = -S6.HL + 5 + i * 16.2; return [x0, x0 + 11]; });
  const GLOW = ISO.tint("#ffd28a", ["#c9762a", "#d6893a", "#e29c50", "#eeb068"], "#6b3a08");
  B36.chips = (P, lit) => CHX.map(([x0, x1], i) => window.TECH.box(P, [x0, x1], [S6.TH, S6.TH + 1.1], [11.5, 23], "hi", lit === i || lit === (i + 4) % 8 ? GLOW : window.TECH.C.chip)).join("");
})();
