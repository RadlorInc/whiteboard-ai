// "modelhome cx cy k lab=0 lit=walls|roof|door|windows|chimney|gutter" — a PART (batch 6, money): a small detached
// house, 8 × 6 m on the ground and 6.5 m to the chimney top, standing on its plot, its origin the ground point under
// its middle; the front with the door faces the room (+y), a gable end faces +x. A brick plinth, rendered walls 3.8 m
// high with corner quoins, a pitched tiled roof (ridge along x, 35° pitch, eaves and verges overhanging) whose tile
// rows end on the roof's edges, a brick chimney with its cap and two pots, a front door with its frame, step, knob
// and fanlight, four windows with frames, cross bars and sills, a round vent in the gable, and a gutter along the
// front eave with its downpipe and shoe. Static: the thing an insurance policy protects, or a home's costs. 1 = 1 cm.
// anchors: top (the ridge's middle) door (the doorstep's middle) front (the front wall's middle, 2 m up)
(() => {
  const K = window.K;
  const HX = 400, HY = 300, WH = 380, PITCH = 0.7, OV = 30, VG = 25, RT = 14;
  const RIDGE = WH + (HY + OV) * PITCH;
  const WALL = ISO.tint("#f6f0e4", ["#d8cdb7", "#e1d7c3", "#e9e1cf", "#f0e9da"], "#6d6250");
  const BRICK = ISO.tint("#d98a6a", ["#9c4f35", "#ab5c40", "#bb6a4c", "#c97a5b"], "#5a2a18");
  const TILE = ISO.tint("#9a5040", ["#5e2a20", "#6c3327", "#7a3c2f", "#8a4637"], "#3a1810");
  const TRIM = ISO.tint("#ffffff", ["#c5c9ce", "#d3d6da", "#e0e2e5", "#eceef0"], "#5a6068");
  const DOOR = ISO.tint("#3f6f8f", ["#244257", "#2b4e66", "#335a75", "#3b6683"], "#152a38");
  const GLASS = "#bfd6e6";
  // a roof plane as a thin tilted slab: from the eave line (y = ye, z = ze) up to the ridge, x0..x1
  const roofAt = (y) => WH + (HY + OV - Math.abs(y)) * PITCH;
  function slope(P, side) {
    const s = side, ye = s * (HY + OV), x0 = -HX - VG, x1 = HX + VG;
    const n = [0, s * PITCH, 1], len = Math.hypot(n[1], 1), up = [0, (s * PITCH) / len * RT, RT / len];
    const pts = [[x0, ye, roofAt(ye)], [x1, ye, roofAt(ye)], [x1, 0, RIDGE], [x0, 0, RIDGE]];
    const V = [...pts, ...pts.map((p) => [p[0] + up[0], p[1] + up[1], p[2] + up[2]])];
    const F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
    let svg = ISO.tinted(TILE, ISO.poly(V, F, P, "mid"));
    if (s > 0) {
      // tile courses across the front slope, each from verge to verge, and short joints staggered between them
      const rows = [], joints = [];
      for (let i = 1; i < 12; i++) {
        const f = i / 12, y = ye * (1 - f), z = roofAt(y) + up[2] + 0.5, yy = y + up[1];
        rows.push(K.pathOf([K.iso([x0 + 2, yy, z], P), K.iso([x1 - 2, yy, z], P)]));
        if (i < 11) for (let x = x0 + 25 + (i % 2) * 15; x < x1 - 10; x += 30) { const f2 = (i + 1) / 12, y2 = ye * (1 - f2) + up[1]; joints.push(K.pathOf([K.iso([x, yy, z], P), K.iso([x, y2, roofAt(ye * (1 - f2)) + up[2] + 0.5], P)])); }
      }
      svg += `<path d="${rows.join("")}" stroke="#4a2017" stroke-width="0.7" fill="none"/><path d="${joints.join("")}" stroke="#5e2a20" stroke-width="0.4" fill="none" opacity=".7"/>`;
    }
    return svg;
  }
  // a window in the front wall (y = HY) or the gable wall (x = HX): frame, glass, cross bars, sill
  function windowFront(P, x, z0, w, h) {
    const y = HY;
    return ISO.tinted(TRIM, ISO.wbox(P, [x - w / 2 - 6, x + w / 2 + 6], [y, y + 4], [z0 - 6, z0 + h + 6], "hi")) +
      `<path d="${K.pathOf([[x - w / 2, y + 4.2, z0], [x + w / 2, y + 4.2, z0], [x + w / 2, y + 4.2, z0 + h], [x - w / 2, y + 4.2, z0 + h]].map((p) => K.iso(p, P)), true)}" fill="${GLASS}" stroke="#5a6068" stroke-width="0.6"/>` +
      ISO.tinted(TRIM, ISO.wbox(P, [x - 2, x + 2], [y + 4, y + 6], [z0, z0 + h], "hi") + ISO.wbox(P, [x - w / 2, x + w / 2], [y + 4, y + 6], [z0 + h * 0.62 - 2, z0 + h * 0.62 + 2], "hi")) +
      ISO.tinted(TRIM, ISO.wbox(P, [x - w / 2 - 10, x + w / 2 + 10], [y, y + 10], [z0 - 10, z0 - 5], "hi"));
  }
  function windowSide(P, y, z0, w, h) {
    const x = HX;
    return ISO.tinted(TRIM, ISO.wbox(P, [x, x + 4], [y - w / 2 - 6, y + w / 2 + 6], [z0 - 6, z0 + h + 6], "hi")) +
      `<path d="${K.pathOf([[x + 4.2, y - w / 2, z0], [x + 4.2, y + w / 2, z0], [x + 4.2, y + w / 2, z0 + h], [x + 4.2, y - w / 2, z0 + h]].map((p) => K.iso(p, P)), true)}" fill="${GLASS}" stroke="#5a6068" stroke-width="0.6"/>` +
      ISO.tinted(TRIM, ISO.wbox(P, [x + 4, x + 6], [y - 2, y + 2], [z0, z0 + h], "hi") + ISO.wbox(P, [x + 4, x + 6], [y - w / 2, y + w / 2], [z0 + h * 0.62 - 2, z0 + h * 0.62 + 2], "hi")) +
      ISO.tinted(TRIM, ISO.wbox(P, [x, x + 10], [y - w / 2 - 10, y + w / 2 + 10], [z0 - 10, z0 - 5], "hi"));
  }
  function build(P) {
    const out = [];
    const halo = { x: -HX - 40, y: -HY - 40, w: 2 * HX + 80, d: 2 * HY + 80, r: 20 };
    out.push(`<path class="iso-halo" d="${K.haloOf(halo, 0, 10, P)}"/>`);
    // back slope first (it hides behind the ridge), then the house body, then the front slope
    out.push(`<g data-name="roof">${slope(P, -1)}</g>`);
    // the body: a pentagon prism along x (gable walls at both ends), a brick plinth under it
    const gable = [[-HY, 0], [HY, 0], [HY, WH], [0, WH + HY * PITCH], [-HY, WH]];
    const walls = [ISO.tinted(BRICK, ISO.wbox(P, [-HX - 4, HX + 4], [-HY - 4, HY + 4], [0, 45], "mid"))];
    walls.push(ISO.prismX(P, gable.map(([y, z]) => [y, Math.max(z, 45)]), -HX, HX, ["#d8cdb7", "#f0e9da"], "#f6f0e4", "#6d6250"));
    // brick courses on the plinth, corner quoins up the near corner, each a block on the wall
    const cour = [];
    for (let z = 9; z < 45; z += 9) cour.push(K.pathOf([K.iso([-HX - 4, HY + 4.3, z], P), K.iso([HX + 4, HY + 4.3, z], P), K.iso([HX + 4.3, -HY - 4, z], P)]));
    walls.push(`<path d="${cour.join("")}" stroke="#7a3a24" stroke-width="0.5" fill="none"/>`);
    for (let z = 60, i = 0; z < WH - 20; z += 36, i++) walls.push(ISO.tinted(WALL, ISO.wbox(P, [HX - (i % 2 ? 22 : 34), HX + 2], [HY - (i % 2 ? 34 : 22), HY + 2], [z, z + 30], "hi")));
    // the gable's round vent
    const vz = WH + 90, vent = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; vent.push(K.iso([HX + 0.5, Math.cos(a) * 24, vz + Math.sin(a) * 24], P)); }
    walls.push(`<path d="${K.pathOf(vent, true)}" fill="#e4dccb" stroke="#6d6250" stroke-width="0.7"/><path d="${[-12, 0, 12].map((d) => K.pathOf([K.iso([HX + 0.6, -20, vz + d], P), K.iso([HX + 0.6, 20, vz + d], P)])).join("")}" stroke="#6d6250" stroke-width="0.6" fill="none"/>`);
    out.push(`<g data-name="walls">${ISO.tinted(WALL, walls.join(""))}</g>`);
    // windows: two on the front, two on the gable end
    out.push(`<g data-name="windows">${windowFront(P, 190, 110, 120, 140)}${windowFront(P, -230, 110, 120, 140)}${windowSide(P, -140, 110, 110, 140)}${windowSide(P, 130, 110, 110, 140)}</g>`);
    // the door: frame, a panelled leaf, fanlight, knob, a stone step
    const dx = -30, dw = 95, dh = 210, y = HY;
    const door = [ISO.tinted(TRIM, ISO.wbox(P, [dx - dw / 2 - 8, dx + dw / 2 + 8], [y, y + 5], [45, 45 + dh + 40], "hi"))];
    door.push(ISO.tinted(DOOR, ISO.wbox(P, [dx - dw / 2, dx + dw / 2], [y + 5, y + 7], [45, 45 + dh], "mid")));
    door.push(`<path d="${K.pathOf([[dx - dw / 2 + 4, y + 7.2, 45 + dh + 6], [dx + dw / 2 - 4, y + 7.2, 45 + dh + 6], [dx + dw / 2 - 4, y + 7.2, 45 + dh + 32], [dx - dw / 2 + 4, y + 7.2, 45 + dh + 32]].map((p) => K.iso(p, P)), true)}" fill="${GLASS}" stroke="#5a6068" stroke-width="0.6"/>`);
    door.push(`<path d="${[[45 + 18, 45 + 95], [45 + 115, 45 + dh - 15]].map(([z0, z1]) => [dx - dw / 2 + 12, dx + 6].map((x0) => K.pathOf([[x0, y + 7.3, z0], [x0 + dw / 2 - 18, y + 7.3, z0], [x0 + dw / 2 - 18, y + 7.3, z1], [x0, y + 7.3, z1]].map((p) => K.iso(p, P)), true)).join("")).join("")}" fill="none" stroke="#152a38" stroke-width="0.6"/>`);
    door.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [dx + dw / 2 - 15, dx + dw / 2 - 9], [y + 7, y + 11], [45 + 97, 45 + 103], "hi")));
    door.push(ISO.tinted(ISO.T.road, ISO.wbox(P, [dx - dw / 2 - 25, dx + dw / 2 + 25], [y + 4, y + 45], [0, 22], "mid") + ISO.wbox(P, [dx - dw / 2 - 15, dx + dw / 2 + 15], [y + 4, y + 25], [22, 44], "mid")));
    out.push(`<g data-name="door">${door.join("")}</g>`);
    // the gutter along the front eave: a half-round channel on brackets, the downpipe down the near corner to a shoe
    const gz = roofAt(HY + OV) - 6, gy = HY + OV + 6;
    const gutter = [ISO.tinted(TRIM, ISO.wbox(P, [-HX - VG, HX + VG - 10], [gy - 8, gy + 4], [gz - 12, gz], "mid"))];
    gutter.push(ISO.tinted(TRIM, ISO.wbox(P, [HX + VG - 30, HX + VG - 16], [gy - 6, gy + 2], [gz - 24, gz - 12], "mid")));
    gutter.push(ISO.tinted(TRIM, ISO.wbox(P, [HX - 2, HX + 10], [HY + 2, HY + 14], [10, gz - 30], "mid")));
    gutter.push(ISO.tinted(TRIM, ISO.wbox(P, [HX - 2, HX + 10], [HY + 2, gy + 1], [gz - 34, gz - 22], "mid")));
    gutter.push(ISO.tinted(TRIM, ISO.wbox(P, [HX - 2, HX + 10], [HY + 2, HY + 28], [0, 12], "mid")));
    [100, 220].forEach((z) => gutter.push(ISO.tinted(TRIM, ISO.wbox(P, [HX - 4, HX + 12], [HY + 1, HY + 15], [z, z + 5], "lo"))));
    // the front slope and its fascia board, then the gutter in front of it
    out.push(`<g data-name="roof">${slope(P, 1)}${ISO.tinted(TRIM, ISO.wbox(P, [-HX - VG, HX + VG], [HY + OV - 2, HY + OV + 2], [roofAt(HY + OV) - 14, roofAt(HY + OV) + 6], "hi"))}` +
      `${ISO.tinted(TILE, ISO.wbox(P, [-HX - VG, HX + VG], [-8, 8], [RIDGE + 2, RIDGE + 18], "mid"))}</g>`);
    out.push(`<g data-name="gutter">${gutter.join("")}</g>`);
    // the chimney on the front slope near the −x end: brick stack cut to the slope, courses, a cap and two pots
    const c0 = -HX + 70, c1 = c0 + 70, y0 = 30, y1 = 90, zt = 610;
    const stack = ISO.prismX(P, [[y0, roofAt(y0) - 10], [y1, roofAt(y1) - 10], [y1, zt], [y0, zt]], c0, c1, ["#9c4f35", "#c97a5b"], "#d98a6a", "#5a2a18");
    const ck = []; for (let z = zt - 12; z > roofAt(y0); z -= 12) ck.push(K.pathOf([K.iso([c1 + 0.3, Math.max(y0, 0), z], P), K.iso([c1 + 0.3, Math.min(y1, HY + OV - (z - WH) / PITCH), z], P), K.iso([c0, Math.min(y1, HY + OV - (z - WH) / PITCH) + 0.3, z], P)]));
    const pots = [c0 + 20, c0 + 50].map((x) => ISO.tinted(BRICK, K.solidSvg(K.cylinder(x, (y0 + y1) / 2, 8, zt + 10, 30, P, 16), { tone: "mid" }))).join("");
    out.push(`<g data-name="chimney">${stack}<path d="${ck.join("")}" stroke="#7a3a24" stroke-width="0.5" fill="none"/>${ISO.tinted(ISO.T.road, ISO.wbox(P, [c0 - 6, c1 + 6], [y0 - 6, y1 + 6], [zt, zt + 10], "mid"))}${pots}</g>`);
    return out.join("");
  }
  ISO.add({
    name: "modelhome", title: "House (part)", compare: null,
    about: "A small detached house, 8 × 6 m, 6.5 m to the chimney: rendered walls on a brick plinth, a pitched tiled roof, a chimney, a front door with its step, four windows, a gable vent and a gutter with its downpipe; what an insurance policy protects, or a home's costs. anchors: top door front",
    line: "modelhome cx cy k lab=0 lit=walls|roof|door|windows|chimney|gutter",
    demo: { line: "modelhome 470 430 0.5 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "roof" }, hold: 1.2 }, { set: { lit: "door" }, hold: 1.2 }, { set: { lit: "windows" }, hold: 1.2 }, { set: { lit: "chimney" }, hold: 1.2 }, { set: { lit: "gutter" }, hold: 1.2 }, { set: { lit: "walls" }, hold: 1.2 }] },
    make([cx = 480, cy = 430, k = 0.5], o, t, parent) {
      const B = window.B42;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = build(P) + `<g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([HX + VG, 0, RIDGE + 20], P), "house", "#556", { size: 13, anchor: "start" });
      g.anchors = { top: [0, 0, RIDGE + 18], door: [-30, HY + 25, 44], front: [0, HY, 200] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "house · 8 × 6 m on the ground · walls 3.8 m · 35° tiled roof · 6.5 m to the chimney top";
      B.light(w, g, lit);
      return g;
    },
  });
})();
