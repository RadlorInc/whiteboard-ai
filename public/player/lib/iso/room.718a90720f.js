// "room cx cy width curtains=0..1 lamp=0|1 lab=1 lit=window|curtains|bed|desk|chair|lamp" — a bedroom, as a cutaway model.
// A 3.6 × 3.0 m room with a 2.5 m ceiling, cut away at the front and right: a plank floor and a rug, two walls with
// skirting, a 1.1 × 1.2 m window with its sill, frame and glazing bars, curtains on a rail, a desk under the window with
// a laptop, books and a pencil pot, a chair, a 140 × 200 cm double bed (legs, frame, mattress, duvet, two pillows, a
// headboard), a bedside table with a lamp, and a chest of drawers with a picture over it on the side wall.
// set({ curtains: 1 }) draws the curtains open along the rail; set({ lamp: 1 }) switches the bedside lamp on, its light
// landing on the floor (WebGL, with an SVG glow without it). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RX = 180, RY = 150, RH = 250, WT = 10;
  const BOARD = { x: -RX - WT - 16, y: -RY - WT - 16, w: 2 * RX + WT + 28, d: 2 * RY + WT + 28, r: 10 };
  const WIN = { x0: -140, x1: -30, z0: 90, z1: 210 }, RAIL = { x0: -168, x1: -2, y: -RY + 9, z: 224 };
  const LAMP = [3, -126], LZ = 55;
  const WOOD = ISO.T.wood, WALL = ISO.tint("#fbf7ef", ["#d9d0bf", "#e2dacb", "#ebe5d8", "#f3eee4"], "#6b6150"), PAINT = ISO.T.paint, STEEL = ISO.T.steel;
  const OAK = ISO.tint("#f3dfbd", ["#c49a62", "#cfa874", "#d9b787", "#e4c79c"], "#6e4a1e"), LINEN = ISO.tint("#fdfdfb", ["#c9ccd2", "#d6d9de", "#e2e4e8", "#eceef1"], "#4a5058");
  const DUVET = ISO.T.blue, RUG = ISO.tint("#f6e3d6", ["#cf9f86", "#d8ae97", "#e1bea9", "#eacdbb"], "#7a4a32");
  const B = (P, [x0, x1], [y0, y1], [z0, z1], tint, tone = "mid") => ISO.tinted(tint, ISO.wbox(P, [x0, x1], [y0, y1], [z0, z1], tone));
  const seam = (P, pts, color = "#8a7a5a", w = 0.6) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}"/>`;

  // the floor with its planks and the rug, the two walls with the window opening, the skirting, the window itself
  function shellSvg(P) {
    const out = [ISO.baseboard(P, BOARD, { h: 7 })];
    const floor = { x: -RX - WT, y: -RY - WT, w: 2 * RX + WT, d: 2 * RY + WT, r: 0 };
    out.push(ISO.tinted(WOOD, S(K.slabOf(floor, 0, 6, P, 1), { tone: "mid", inner: L(K.sideSeam(floor, 3, P, 1), { tone: "faint" }) })));
    // planks: 15 cm boards running left to right, each seam from the side wall to the cut edge
    const planks = [];
    for (let y = -RY + 15; y < RY; y += 15) planks.push(K.pathOf([K.iso([-RX, y, 6], P), K.iso([RX, y, 6], P)]));
    out.push(L(planks.join(""), { tone: "faint" }));
    out.push(ISO.tinted(RUG, S(K.slabOf({ x: -120, y: -70, w: 150, d: 120, r: 4 }, 6, 0.8, P, 4), { tone: "mid", inner: L(K.planOutline(K.insetPlan({ x: -120, y: -70, w: 150, d: 120, r: 4 }, 8), 6.8, P, 4), { tone: "faint" }) })));
    // the back wall in four pieces round the window, then the side wall
    const by = [-RY - WT, -RY], z0 = 6;
    out.push(B(P, [-RX - WT, WIN.x0], by, [z0, RH], WALL), B(P, [WIN.x1, RX], by, [z0, RH], WALL), B(P, [WIN.x0, WIN.x1], by, [z0, WIN.z0], WALL), B(P, [WIN.x0, WIN.x1], by, [WIN.z1, RH], WALL));
    out.push(B(P, [-RX - WT, -RX], [-RY, RY], [z0, RH], WALL));
    out.push(B(P, [-RX, RX], [-RY, -RY + 1.5], [z0, z0 + 10], OAK), B(P, [-RX, -RX + 1.5], [-RY + 1.5, RY], [z0, z0 + 10], OAK));
    // the window: sky in the glass, the frame, a mullion and a transom, the sill
    const gy = -RY - WT / 2, sky = [[WIN.x0, gy, WIN.z0], [WIN.x1, gy, WIN.z0], [WIN.x1, gy, WIN.z1], [WIN.x0, gy, WIN.z1]];
    out.push(`<g data-name="window"><path d="${K.pathOf(sky.map((p) => K.iso(p, P)), true)}" fill="#cfe7f8" stroke="#5d7f96" stroke-width=".6"/>`);
    const hill = [[WIN.x0, gy, WIN.z0], [WIN.x0, gy, 120], [-110, gy, 128], [-80, gy, 122], [-55, gy, 130], [WIN.x1, gy, 124], [WIN.x1, gy, WIN.z0]];
    out.push(`<path d="${K.pathOf(hill.map((p) => K.iso(p, P)), true)}" fill="#bfe0a8" stroke="#2c6a22" stroke-width=".5"/>`);
    const f = 4, fy = [-RY - WT / 2 - 1, -RY - WT / 2 + 1];
    out.push(B(P, [WIN.x0, WIN.x1], fy, [WIN.z0, WIN.z0 + f], PAINT, "hi"), B(P, [WIN.x0, WIN.x0 + f], fy, [WIN.z0 + f, WIN.z1 - f], PAINT, "hi"), B(P, [WIN.x1 - f, WIN.x1], fy, [WIN.z0 + f, WIN.z1 - f], PAINT, "hi"));
    out.push(B(P, [WIN.x0 + f, WIN.x1 - f], fy, [148, 151], PAINT, "hi"), B(P, [-86.5, -83.5], fy, [WIN.z0 + f, 148], PAINT, "hi"), B(P, [-86.5, -83.5], fy, [151, WIN.z1 - f], PAINT, "hi"));
    out.push(B(P, [WIN.x0, WIN.x1], fy, [WIN.z1 - f, WIN.z1], PAINT, "hi"));
    out.push(B(P, [WIN.x0 - 6, WIN.x1 + 6], [-RY, -RY + 5], [WIN.z0 - 3, WIN.z0], PAINT, "hi"), "</g>");
    // the curtain rail on two brackets, with finials
    out.push(B(P, [RAIL.x0 + 6, RAIL.x0 + 9], [-RY, RAIL.y], [RAIL.z + 1, RAIL.z + 4], STEEL), B(P, [RAIL.x1 - 9, RAIL.x1 - 6], [-RY, RAIL.y], [RAIL.z + 1, RAIL.z + 4], STEEL));
    out.push(ISO.tinted(STEEL, S(G.disc(RAIL.x0, RAIL.x1, 1.4, G.frameOf([0, RAIL.y + 1.4, RAIL.z + 2.4], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 14 }), { tone: "hi" })));
    // a picture over the chest of drawers on the side wall: a frame and a mount, a sun and a hill in it
    const pic = (y, z) => [-RX + 0.1, y, z];
    out.push(B(P, [-RX, -RX + 2], [40, 110], [140, 190], OAK, "mid"));
    out.push(`<path d="${K.pathOf([pic(45, 145), pic(105, 145), pic(105, 185), pic(45, 185)].map((p) => K.iso([p[0] + 2, p[1], p[2]], P)), true)}" fill="#fdfaf2" stroke="#6e4a1e" stroke-width=".5"/>`);
    out.push(`<path d="${K.pathOf([[50, 150], [70, 166], [84, 158], [100, 170], [100, 150]].map(([y, z]) => K.iso([-RX + 2.1, y, z], P)), true)}" fill="#bfe0a8" stroke="#2c6a22" stroke-width=".5"/>`);
    // the light switch by the side wall's front edge
    out.push(B(P, [-RX, -RX + 1], [RY - 22, RY - 14], [110, 122], WALL, "mid"), B(P, [-RX + 1, -RX + 1.8], [RY - 19.5, RY - 16.5], [114, 118], LINEN, "hi"));
    return out.join("");
  }
  // the desk under the window: two drawer pedestals, the top, a laptop, books, a pencil pot
  function deskSvg(P) {
    const out = [], y0 = -RY + 2, y1 = -RY + 62, z0 = 6, top = 81;
    out.push(B(P, [-160, -118], [y0, y1 - 2], [z0, top - 3], OAK), B(P, [-46, -40], [y0, y1 - 2], [z0, top - 3], OAK));
    for (const z of [12, 34, 56]) out.push(B(P, [-158, -120], [y1 - 2, y1 - 1], [z + 2, z + 18], OAK, "hi"), B(P, [-142, -136], [y1 - 1, y1], [z + 9, z + 11], STEEL, "hi"));
    out.push(B(P, [-162, -38], [y0, y1], [top - 3, top], OAK, "hi"));
    return `<g data-name="desk">${out.join("")}</g>`;
  }
  function deskTopSvg(P) {
    const out = [], top = 81;
    // the laptop: base, open lid leaning back, a screen face on it
    out.push(B(P, [-110, -76], [-RY + 22, -RY + 46], [top, top + 1.6], ISO.T.steel, "hi"));
    out.push(ISO.tinted(STEEL, ISO.poly([[-110, -RY + 22, top + 1.6], [-76, -RY + 22, top + 1.6], [-76, -RY + 23.4, top + 1.6], [-110, -RY + 23.4, top + 1.6], [-110, -RY + 18, top + 24], [-76, -RY + 18, top + 24], [-76, -RY + 19.4, top + 24], [-110, -RY + 19.4, top + 24]], ISO.BOX_F, P, "hi")));
    out.push(`<path d="${K.pathOf([[-108, -RY + 23.5, top + 3], [-78, -RY + 23.5, top + 3], [-78, -RY + 19.6, top + 22], [-108, -RY + 19.6, top + 22]].map((p) => K.iso(p, P)), true)}" fill="#2a3a52" stroke="#1b2333" stroke-width=".5"/>`);
    // a stack of three books and a pencil pot
    [["#c8352a", 0], ["#2c8a4a", 3], ["#f2a20c", 6]].forEach(([c, dz], i) => out.push(B(P, [-150 + i, -126 - i], [-RY + 10, -RY + 34], [top + dz, top + dz + 3], ISO.tint(c, [c, c, c, c], "#2a2d31"), "mid")));
    out.push(ISO.tinted(PAINT, S(K.cylinder(-56, -RY + 20, 4, top, 10, P, 18), { tone: "mid" })));
    for (const [dx, c] of [[-1.5, "#c8352a"], [1, "#2f6fd0"], [0, "#f2a20c"]]) out.push(seam(P, [[-56 + dx, -RY + 20, top + 10], [-56 + dx * 2.5, -RY + 20, top + 18]], c, 1.6));
    return out.join("");
  }
  // the chair in front of the desk, its back to the room
  function chairSvg(P) {
    const out = [], x0 = -122, x1 = -78, y0 = -RY + 70, y1 = -RY + 112, z = 6.8, seat = 52;
    for (const [x, y] of [[x0 + 1, y0 + 1], [x1 - 4, y0 + 1], [x0 + 1, y1 - 4], [x1 - 4, y1 - 4]]) out.push(B(P, [x, x + 3], [y, y + 3], [z, seat - 3], OAK));
    out.push(B(P, [x0, x1], [y0, y1], [seat - 3, seat], OAK, "hi"));
    out.push(B(P, [x0 + 1, x0 + 4], [y1 - 4, y1 - 1], [seat, seat + 22], OAK), B(P, [x1 - 4, x1 - 1], [y1 - 4, y1 - 1], [seat, seat + 22], OAK));
    out.push(B(P, [x0, x1], [y1 - 4.5, y1 - 0.5], [seat + 22, seat + 38], OAK, "hi"));
    return `<g data-name="chair">${out.join("")}</g>`;
  }
  // the double bed: legs, frame, mattress, duvet turned down, two pillows, headboard against the wall
  function bedSvg(P) {
    const out = [], x0 = 30, x1 = 170, y0 = -RY + 2, y1 = y0 + 200, z0 = 6;
    out.push(B(P, [x0, x1], [-RY + 1.5, -RY + 6], [z0, 110], OAK), B(P, [x0 - 2, x1 + 2], [-RY + 1.5, -RY + 8], [110, 114], OAK, "hi"));
    for (const [x, y] of [[x0 + 2, y1 - 8], [x1 - 8, y1 - 8]]) out.push(B(P, [x, x + 6], [y, y + 6], [z0, z0 + 14], OAK));
    out.push(B(P, [x0, x1], [-RY + 6, y1], [z0 + 14, z0 + 32], OAK));
    out.push(ISO.tinted(LINEN, S(K.slabOf({ x: x0 + 2, y: -RY + 7, w: x1 - x0 - 4, d: y1 + RY - 9, r: 5 }, z0 + 32, 20, P, 4, 1), { tone: "mid", inner: L(K.sideSeam({ x: x0 + 2, y: -RY + 7, w: x1 - x0 - 4, d: y1 + RY - 9, r: 5 }, z0 + 42, P, 4), { tone: "faint" }) })));
    for (const x of [x0 + 8, x0 + 74]) out.push(ISO.tinted(LINEN, S(K.slabOf({ x, y: -RY + 12, w: 58, d: 36, r: 9 }, z0 + 52, 11, P, 6, 2), { tone: "mid" })));
    out.push(ISO.tinted(DUVET, S(K.slabOf({ x: x0 + 1, y: -RY + 58, w: x1 - x0 - 2, d: y1 + RY - 59, r: 4 }, z0 + 52, 6, P, 4, 1.4), { tone: "mid" })));
    out.push(ISO.tinted(LINEN, S(K.slabOf({ x: x0 + 1, y: -RY + 58, w: x1 - x0 - 2, d: 12, r: 3 }, z0 + 58, 1.6, P, 3), { tone: "mid" })));
    return `<g data-name="bed">${out.join("")}</g>`;
  }
  function tableSvg(P) {
    const [x, y] = LAMP, out = [];
    out.push(B(P, [x - 18, x + 18], [y - 22, y + 18], [6, LZ - 3], OAK), B(P, [x - 19, x + 19], [y - 23, y + 19], [LZ - 3, LZ], OAK, "hi"));
    out.push(B(P, [x - 16, x + 16], [y + 18, y + 19], [30, 48], OAK, "hi"), B(P, [x - 3, x + 3], [y + 19, y + 20], [38, 40], STEEL, "hi"));
    out.push(ISO.tinted(PAINT, S(K.cylinder(x, y, 7, LZ, 3, P, 24, 0.8), { tone: "mid" })), ISO.tinted(STEEL, S(K.cylinder(x, y, 1.2, LZ + 3, 21, P, 12), { tone: "hi" })));
    return out.join("");
  }
  // the lamp's shade: a drum on the stem, warm amber while lit
  function shadeSvg(P, on) {
    const [x, y] = LAMP, tint = on ? ISO.tint("#ffe2a8", ["#f2b24a", "#f5c066", "#f8ce84", "#fbdca0"], "#8a5a10") : LINEN;
    return ISO.tinted(tint, S(G.lathe([[0, 0], [0, 15], [17, 10], [17, 0]], G.frameOf([x, y, LZ + 24], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 32 }), { tone: "mid" }));
  }
  function chestSvg(P) {
    const out = [], x0 = -RX + 1.5, x1 = -RX + 46, y0 = 40, y1 = 110;
    out.push(B(P, [x0, x1], [y0, y1], [6, 90], OAK), B(P, [x0, x1 + 1.5], [y0 - 1.5, y1 + 1.5], [90, 93], OAK, "hi"));
    for (const z of [12, 38, 64]) out.push(B(P, [x1, x1 + 1], [y0 + 3, y1 - 3], [z, z + 22], OAK, "hi"), B(P, [x1 + 1, x1 + 2.2], [(y0 + y1) / 2 - 5, (y0 + y1) / 2 + 5], [z + 10, z + 12], STEEL, "hi"));
    // a plant pot on top
    out.push(ISO.tinted(RUG, S(K.cylinder(-RX + 22, 90, 7, 93, 12, P, 20, 0.8), { tone: "mid" })), ISO.tinted(ISO.T.green, S(K.cylinder(-RX + 22, 90, 9, 105, 10, P, 20, 4), { tone: "mid" })));
    return out.join("");
  }
  // curtains: two panels of pleated cloth on the rail; open 0 drawn shut over the window, 1 gathered at each end
  function curtainsSvg(P, open) {
    const out = [], mid = (RAIL.x0 + RAIL.x1) / 2, gath = 22, CL = ISO.tint("#f3d6d0", ["#c98b80", "#d49c92", "#dfaea5", "#e9c0b8"], "#7a3a2e");
    for (const side of [-1, 1]) {
      const outer = side < 0 ? RAIL.x0 + 2 : RAIL.x1 - 2, inner = outer - side * (gath + (1 - open) * (mid - (RAIL.x0 + 2) - gath));
      const a = Math.min(outer, inner), b = Math.max(outer, inner), folds = 6, amp = 1.5 + 4.5 * open, n = folds * 5, ring = [];
      for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; ring.push([x, RAIL.y + 4 + amp * Math.sin((i / n) * folds * 2 * Math.PI) + 0.8]); }
      for (let i = n; i >= 0; i--) { const x = a + ((b - a) * i) / n; ring.push([x, RAIL.y + 4 + amp * Math.sin((i / n) * folds * 2 * Math.PI) - 0.8]); }
      out.push(ISO.tinted(CL, S(K.extrude(ring, 84, RAIL.z - 85, P, { convex: false }), { tone: "mid", crease: "none" })));
      // the hooks on the rail above the cloth
      out.push(K.dotsSvg(Array.from({ length: folds + 1 }, (_, i) => K.iso([a + ((b - a) * i) / folds, RAIL.y + 1.4, RAIL.z + 1], P)), { size: 0.9, tone: "mid" }));
    }
    return out.join("");
  }

  ISO.add({
    name: "room", title: "Bedroom", compare: "room 480 270 600",
    about: "A cutaway model of a bedroom: a window with curtains, a desk and chair under it, a double bed, a bedside lamp and a chest of drawers.",
    line: "room cx cy width curtains=0..1 lamp=0|1 lab=1 lit=window|curtains|bed|desk|chair|lamp",
    demo: { line: "room 480 275 600", script: [{ set: {}, hold: 1 }, { set: { curtains: 1 }, hold: "settle" }, { set: { lamp: 1 }, hold: "settle" }] },
    make([cx, cy, size = 600], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.05, H = size * 0.82;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -13, 0), [-RX - WT, -RY - WT, RH], [RX, -RY - WT, RH], [-RX - WT, RY, RH]], cx, cy, W, H, { azimuth: 38, elevation: 28 }, parent);
      g.innerHTML = `<g>${shellSvg(P)}</g><g data-k="glow"></g><g data-k="furniture">${deskSvg(P)}<g data-name="curtains"></g>${deskTopSvg(P)}${bedSvg(P)}<g data-name="lamp">${tableSvg(P)}<g data-k="shade"></g></g>${chairSvg(P)}${chestSvg(P)}</g><g data-part="words"></g>`;
      const q = (s) => g.querySelector(s), el = { curtains: q('[data-name="curtains"]'), shade: q('[data-k="shade"]'), glow: q('[data-k="glow"]'), words: q('[data-part="words"]') };
      const w = ISO.writer(), B0 = [LAMP[0], LAMP[1], LZ + 30];
      // the lamp's light on the floor: a shader under the furniture, or an SVG glow without WebGL
      const fx = ISO.gl(g, P, W, H, q('[data-k="furniture"]'), `uniform float uV;void main(){gl_FragColor=finish(poolInk(viewOf(gl_FragCoord.xy),vec3(${B0.map((v) => v.toFixed(1)).join(",")}),6.9,vec4(0.,0.,${(RX - 0.5).toFixed(1)},${(RY - 0.5).toFixed(1)}),1.,vec3(1.,.82,.48),2.2)*uV);}`, ["uV"]);
      const s = { c: ISO.clamp(ISO.num(o, "curtains", 0), 0, 1), cw: 0, lamp: o.lamp === "1", lv: o.lamp === "1" ? 1 : 0 };
      s.cw = s.c;
      let lit = o.lit || "";
      const groups = { window: [q('[data-name="window"]')], curtains: [el.curtains], bed: [q('[data-name="bed"]')], desk: [q('[data-name="desk"]')], chair: [q('[data-name="chair"]')], lamp: [q('[data-name="lamp"]')] }, all = Object.values(groups).flat();
      const draw = () => {
        const cq = Math.round(s.c * 40) / 40;
        w.rebuild(el.curtains, String(cq), () => curtainsSvg(P, cq));
        w.rebuild(el.shade, String(s.lv > 0.5), () => shadeSvg(P, s.lv > 0.5));
        if (fx) fx.set({ uV: s.lv }, s.lv > 0.002);
        else w.rebuild(el.glow, s.lv.toFixed(2), () => {
          if (s.lv < 0.01) return "";
          const c = K.iso([LAMP[0], LAMP[1] + 40, 7], P), k = K.cameraOf(P).k;
          return `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(110 * k).toFixed(1)}" ry="${(60 * k).toFixed(1)}" fill="#ffd27a" opacity="${(0.32 * s.lv).toFixed(2)}"/>`;
        });
        w.rebuild(el.words, lab ? `${s.c > 0.5} ${s.lamp}` : "", () => !lab ? "" : [
          ISO.word(K.iso([(WIN.x0 + WIN.x1) / 2, -RY - WT, WIN.z1 + 26], P), "window", "#1f4f8f", { size: 15 }),
          ISO.word(K.iso([RAIL.x0, RAIL.y, 120], P), "curtains", "#7a3a2e", { size: 14, anchor: "end" }),
          ISO.word(K.iso([100, 52, 64], P), "bed", "#444", { size: 15, dy: 24 }),
          ISO.word(K.iso([-100, -RY + 112, 40], P), "chair", "#444", { size: 14, dy: 34 }),
          ISO.word(K.iso([-160, -RY + 62, 81], P), "desk", "#444", { size: 14, anchor: "end", dy: 4 }),
          ISO.word(K.iso([LAMP[0], LAMP[1], LZ + 44], P), s.lamp ? "lamp on" : "lamp", s.lamp ? "#b5541a" : "#444", { size: 14, dy: -6 })].join(""));
        w.light(all, groups[lit || (s.c !== s.cw ? "curtains" : "")] || []);
      };
      g.set = (p) => {
        if (p.curtains !== undefined) s.cw = ISO.clamp(+p.curtains, 0, 1);
        if (p.lamp !== undefined) s.lamp = !!+p.lamp;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the curtains slide at a steady hand-drawn pace; the LED lamp comes up in a fraction of a second
      g.update = (dt) => {
        const calm = ISO.still();
        s.c = calm || Math.abs(s.cw - s.c) <= dt * 0.6 ? s.cw : s.c + Math.sign(s.cw - s.c) * dt * 0.6;
        s.lv = ISO.follow(s.lv, s.lamp ? 1 : 0, dt, 0.12, calm); if (Math.abs(s.lv - (s.lamp ? 1 : 0)) < 0.004) s.lv = s.lamp ? 1 : 0;
        draw();
        return s.c !== s.cw || s.lv !== (s.lamp ? 1 : 0);
      };
      g.readout = () => [`room 3.6 × 3.0 m, ceiling 2.5 m`, s.c > 0.98 ? "curtains open: the 1.1 × 1.2 m window lets the daylight in" : s.c < 0.02 ? "curtains shut" : "curtains opening",
        s.lamp ? "lamp on: an 8 W LED gives about 800 lumens, like an old 60 W bulb" : "desk 75 cm high · bed 140 × 200 cm"].join(" · ");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
