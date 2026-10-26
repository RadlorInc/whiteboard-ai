// "vehicle cx cy length k=car|bus|train c=red|blue|green|yellow|orange drive=0|1 lift=0..1 lab=1 lit=body|engine|gearbox|shaft|axle|wheel|motor"
// A car, a bus or a diesel-electric locomotive, side on and facing right, with its drive train under the body.
// drive=1 drives it (the wheels turn and the road or the sleepers run back underneath); lift=1 raises the body off the
// chassis to show how the wheels are driven. Car: front engine → gearbox → propeller shaft → rear axle's differential
// (3.9 : 1) → half shafts → rear wheels. Bus: the engine sits at the back behind the driven rear axle. Locomotive: the
// diesel engine turns a generator, cables carry the current to a traction motor geared (4.4 : 1) to every axle.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm; forward is +x; the side you see is +y; z up from the road (or the rail top).
  const PAL = { red: ["#a8322a", "#ef7a6e", "#f6b1a9", "#6e1c16"], blue: ["#2f5f99", "#7fb0e6", "#b3d1f2", "#163a63"], green: ["#2f7a3a", "#86c98f", "#bfe5c4", "#1b4a22"], yellow: ["#c9951a", "#f5cc55", "#fbe39a", "#6b5208"], orange: ["#c2621a", "#f3a259", "#f9cda0", "#6e3a10"] };
  const DEF = { car: "red", bus: "yellow", train: "blue" };
  const f2 = (v) => v.toFixed(2);
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const GLASS = "#cfe6f5", INK = "#3c3f45";
  // The bottom edge of a body from x0 to x1 at height z0, with a wheel arch of radius ra round each axle (centre wc).
  const sill = (x0, x1, z0, axles, ra, wc) => {
    const pts = [[x0, z0]];
    for (const ax of [...axles].sort((a, b) => a - b)) { const a0 = Math.asin(ISO.clamp((z0 - wc) / ra, -1, 1)); for (let i = 0; i <= 14; i++) { const a = Math.PI - a0 - ((Math.PI - 2 * a0) * i) / 14; pts.push([ax + ra * Math.cos(a), wc + ra * Math.sin(a)]); } }
    pts.push([x1, z0]);
    return pts;
  };
  const KINDS = {
    car: { L: 420, half: 88, axles: [80, 340], driven: [80], wr: 32, tw: 11, track: 74, lift: 120, km: 50, ratio: 3.9 },
    bus: { L: 1100, half: 125, axles: [300, 880], driven: [300], wr: 50, tw: 15, track: 104, lift: 200, km: 50, ratio: 4.6 },
    train: { L: 1700, half: 150, axles: [295, 505, 1195, 1405], driven: [295, 505, 1195, 1405], wr: 48, tw: 7, track: 72, lift: 210, km: 80, ratio: 4.4 },
  };
  const pipe = (P, pts, r, ink = "#2f343a", fill = "#9a9da3") => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 2 * r * G.scaleOf(P);
    return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${f2(w + 1)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${f2(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const glass = (P, pts, y) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${GLASS}" stroke="${INK}" stroke-width="0.9" stroke-linejoin="round"/>`;
  const seam = (P, pts, y) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)))}" fill="none" stroke="${INK}" stroke-width="0.7" opacity=".6"/>`;

  // ── bodies (the part that lifts)
  function bodySvg(P, kind, pal) {
    const k = KINDS[kind], [dark, light, face, ink] = pal, out = [];
    const prism = (pts, h) => ISO.prismY(P, pts, -h, h, [dark, light], face, ink);
    if (kind === "car") {
      const z0 = 24, ra = 37, wc = k.wr;
      const upper = [[416, 30], [422, 52], [419, 74], [398, 86], [300, 92], [120, 94], [30, 92], [6, 84], [0, 62], [4, 30]];
      out.push(prism([...upper, ...sill(4, 416, z0, k.axles, ra, wc).slice(1, -1)], k.half));
      const cab = [[305, 93], [252, 138], [118, 140], [55, 94]];
      out.push(prism(cab, 72));
      // windscreen on the sloping front of the cabin, side windows, door seams, handles, mirror, lights, bumpers
      const wn = [0.63, 0.77];
      out.push(`<path d="${K.pathOf([[300, -66, 96], [256, -64, 133], [256, 64, 133], [300, 66, 96]].map(([x, y, z]) => K.iso([x + wn[0] * 0.4, y, z + wn[1] * 0.4], P)), true)}" fill="${GLASS}" stroke="${INK}" stroke-width="0.9" stroke-linejoin="round"/>`);
      out.push(glass(P, [[292, 97], [248, 133], [190, 134], [190, 97]], 72.1), glass(P, [[182, 97], [182, 134], [124, 135], [76, 97]], 72.1));
      for (const x of [296, 186, 84]) out.push(seam(P, [[x, 92], [x, 30]], k.half + 0.05));
      out.push(seam(P, [[410, 88], [300, 92]], k.half + 0.05));
      for (const x of [252, 148]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x, x + 14], [k.half, k.half + 1.4], [78, 81], "mid")));
      out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [286, 298], [72, 84], [96, 106], "mid")));
      out.push(ISO.tinted(ISO.T.amber, ISO.wbox(P, [414, 421], [54, 82], [66, 74], "hi")), ISO.tinted(ISO.T.red, ISO.wbox(P, [-1, 4], [60, 84], [66, 78], "hi")));
      out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [418, 428], [-84, 84], [30, 44], "mid") + ISO.wbox(P, [-8, 2], [-84, 84], [30, 44], "mid")));
    } else if (kind === "bus") {
      const z0 = 38, ra = 58, wc = k.wr;
      out.push(prism([[1100, 44], [1100, 290], [1080, 312], [14, 312], [0, 298], [0, 44], ...sill(0, 1100, z0, k.axles, ra, wc).slice(1, -1)], k.half));
      for (let i = 0; i < 8; i++) { const x = 60 + i * 108; out.push(glass(P, [[x, 190], [x + 96, 190], [x + 96, 290], [x, 290]], k.half + 0.1)); }
      out.push(glass(P, [[960, 50], [1050, 50], [1050, 290], [960, 290]], k.half + 0.1), seam(P, [[1005, 50], [1005, 290]], k.half + 0.15));
      out.push(seam(P, [[0, 176], [1100, 176]], k.half + 0.05), seam(P, [[0, 120], [940, 120]], k.half + 0.05));
      out.push(ISO.tinted(ISO.T.amber, ISO.wbox(P, [1098, 1104], [90, 120], [70, 86], "hi")), ISO.tinted(ISO.T.red, ISO.wbox(P, [-4, 2], [90, 120], [70, 96], "hi")));
      out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [1100, 1112], [-120, 120], [40, 62], "mid") + ISO.wbox(P, [-12, 0], [-120, 120], [40, 62], "mid")));
      out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [1060, 1080], [118, 140], [250, 262], "mid")));
    } else {
      out.push(prism([[0, 135], [0, 400], [20, 420], [1560, 420], [1640, 402], [1700, 330], [1700, 135]], k.half));
      out.push(glass(P, [[1560, 300], [1630, 300], [1636, 390], [1566, 404]], k.half + 0.1), glass(P, [[30, 300], [100, 300], [100, 390], [30, 390]], k.half + 0.1));
      out.push(seam(P, [[1520, 150], [1520, 412]], k.half + 0.05), seam(P, [[140, 150], [140, 412]], k.half + 0.05), seam(P, [[0, 160], [1700, 160]], k.half + 0.05));
      // engine-room louvres: short slots in rows between the door seams
      const lv = [];
      for (let x = 400; x < 1300; x += 30) lv.push(`M${K.iso([x, k.half + 0.05, 330], P).map(f2).join(" ")}L${K.iso([x + 18, k.half + 0.05, 330], P).map(f2).join(" ")}`, `M${K.iso([x, k.half + 0.05, 350], P).map(f2).join(" ")}L${K.iso([x + 18, k.half + 0.05, 350], P).map(f2).join(" ")}`);
      out.push(`<path d="${lv.join("")}" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>`);
      out.push(ISO.tinted(ISO.T.amber, ISO.wbox(P, [1696, 1704], [80, 130], [200, 222], "hi")), ISO.tinted(ISO.T.steel, ISO.wbox(P, [700, 1000], [-60, 60], [420, 440], "mid")));
    }
    return out.join("");
  }

  // ── chassis and drive train (what stays when the body lifts). The audit lists the frame as loose: it stands on the
  // wheels, whose tyres are ring bands the audit doesn't record.
  function chassisSvg(P, kind) {
    const k = KINDS[kind], out = { engine: [], gearbox: [], shaft: [], axle: [], frame: [], motor: [] };
    const box = (x, y, z, tone = "mid") => ISO.wbox(P, x, y, z, tone);
    if (kind === "car" || kind === "bus") {
      const s = kind === "car" ? 1 : 1.6, rz = k.wr + (kind === "car" ? 6 : 10), rw = kind === "car" ? 8 : 10, ry = kind === "car" ? 44 : 60;
      out.frame.push(ISO.tinted(ISO.T.steel, box([20 * s, k.L - 20 * s], [-ry - rw, -ry], [rz, rz + 8])));
      for (const x of kind === "car" ? [40, 200, 392] : [80, 450, 700, 1060]) out.frame.push(ISO.tinted(ISO.T.steel, box([x, x + 8], [-ry, ry], [rz + 1, rz + 7])));
      // engine (block, head, cover), mounts, radiator and fan; for the bus all of it sits behind the rear axle
      const e = kind === "car" ? { x0: 312, x1: 382, h: 44, y: 30, z: rz + 14 } : { x0: 60, x1: 230, h: 90, y: 44, z: rz + 16 };
      out.engine.push(ISO.tinted(ISO.T.steel, box([e.x0 + 6, e.x0 + 16], [-ry, ry], [rz + 8, e.z])));
      out.engine.push(ISO.tinted(ISO.T.paint, box([e.x0, e.x1], [-e.y, e.y], [e.z, e.z + e.h], "hi")), box([e.x0 + 4, e.x1 - 4], [-e.y + 6, e.y - 6], [e.z + e.h, e.z + e.h + 8 * s], "mid"));
      out.engine.push(ISO.tinted(ISO.T.red, box([e.x0 + 8, e.x1 - 8], [-e.y + 10, e.y - 10], [e.z + e.h + 8 * s, e.z + e.h + 14 * s], "hi")));
      const plugs = []; for (let i = 0; i < 4; i++) plugs.push(K.iso([e.x0 + 14 + i * (e.x1 - e.x0 - 28) / 3, 0, e.z + e.h + 14 * s], P));
      out.engine.push(D(plugs, { size: 1.4, tone: "hi" }));
      const rx = kind === "car" ? 396 : 30, rd = kind === "car" ? 1 : -1;
      out.engine.push(ISO.tinted(ISO.T.steel, box([rx, rx + 8], [-ry + 4, ry - 4], [rz + 8, e.z + e.h - 4], "mid")));
      // gearbox: a tapered casing out of the engine's back (car) or front (bus)
      const gx = kind === "car" ? e.x0 : e.x1, gl = kind === "car" ? 64 : 40, gz = e.z + e.h * 0.35;
      out.gearbox.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[0, e.h * 0.42], [gl * 0.3, e.h * 0.4, 1], [gl, e.h * 0.24]], G.frameAlong([gx, 0, gz], [-rd, 0, 0]), P), { tone: "hi" })));
      // the propeller shaft from the gearbox to the differential on the driven axle, a joint at each end
      const a = [gx - rd * gl, 0, gz], dx = k.driven[0], b = [dx + rd * 18 * s, 0, k.wr];
      const dir = [b[0] - a[0], 0, b[2] - a[2]], len = Math.hypot(dir[0], dir[2]), F = G.frameAlong(a, dir);
      out.shaft.push(ISO.tinted(ISO.T.steel, S(G.disc(1.2, 5, 5 * s, F, P), { tone: "mid" }) + S(G.disc(5, len - 5, 3.2 * s, F, P), { tone: "hi" }) + S(G.disc(len - 5, len - 1.2, 5 * s, F, P), { tone: "mid" })));
      // the differential and the axle casing out to both rear wheels; the front beam and steering rack
      out.axle.push(ISO.tinted(ISO.T.steel, S(G.disc(-k.track + k.tw, -14 * s, 4.5 * s, yAx([dx, 0, k.wr]), P), { tone: "mid" })));
      out.axle.push(ISO.tinted(ISO.T.steel, S(G.sphereOf([dx, 0, k.wr], 15 * s, P), { tone: "hi" }) + S(G.disc(0, 4 * s, 9 * s, G.frameAlong([dx + rd * 14 * s, 0, k.wr], [rd, 0, 0]), P), { tone: "mid" })));
      out.axle.push(ISO.tinted(ISO.T.steel, S(G.disc(14 * s, k.track - k.tw, 4.5 * s, yAx([dx, 0, k.wr]), P), { tone: "mid" })));
      const fx = kind === "car" ? 340 : 880;
      out.frame.push(ISO.tinted(ISO.T.steel, S(G.disc(-k.track + k.tw, k.track - k.tw, 3 * s, yAx([fx, 0, k.wr]), P), { tone: "mid" })));
      // fuel tank and the exhaust with its silencer (a pipe beside the shaft out to the back)
      const tx = kind === "car" ? [110, 160] : [520, 680];
      out.frame.push(ISO.tinted(ISO.T.plastic, box(tx, [-ry + 4, -10 * s], [rz - 2, rz + 16 * s], "mid")));
      const xz = kind === "car" ? 14 : 22, ex = kind === "car" ? [[e.x0 + 20, e.y, e.z + 10], [e.x0 - 10, e.y + 2, xz], [260, e.y + 2, xz]] : [[e.x1 - 20, e.y, e.z + 10], [e.x1 - 10, e.y + 6, xz], [e.x1 + 20, e.y + 6, xz]];
      out.frame.push(pipe(P, ex, 2.4 * s));
      const mF = G.frameAlong(kind === "car" ? [260, e.y + 2, xz] : [e.x1 + 20, e.y + 6, xz], [-1, 0, 0]);
      out.frame.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 4 * s], [4, 9 * s, 1], [56 * s, 9 * s, 1], [60 * s, 4 * s]], mF, P), { tone: "hi" })), pipe(P, [G.pointOf(mF, 60 * s, 0, 0), [kind === "car" ? 120 : 20, e.y + 2, xz], [kind === "car" ? -2 : 20, e.y + 2, xz]], 2 * s));
      out.frame.push(ISO.tinted(ISO.T.steel, box([20 * s, k.L - 20 * s], [ry, ry + rw], [rz, rz + 8])));
    } else {
      // locomotive: deck frame, fuel tank, the two bogies (side frames, axle boxes, springs, bolster) and the motors;
      // on the deck the diesel engine, the generator and the radiator; cables from the generator to the motors
      out.frame.push(ISO.tinted(ISO.T.plastic, box([600, 1100], [-110, 110], [68, 120], "mid")));
      for (const bc of [400, 1300]) {
        out.frame.push(ISO.tinted(ISO.T.steel, box([bc - 170, bc + 170], [-96, -84], [46, 82])));
        out.frame.push(ISO.tinted(ISO.T.steel, box([bc - 30, bc + 30], [-96, 96], [82, 100], "mid")), ISO.tinted(ISO.T.steel, S(K.cylinder(bc, 0, 24, 100, 20, P, 28), { tone: "mid" })));
      }
      out.frame.push(ISO.tinted(ISO.T.steel, box([0, 1700], [-150, 150], [120, 135], "mid")));
      out.engine.push(ISO.tinted(ISO.T.paint, box([740, 1100], [-70, 70], [135, 300], "hi")), box([760, 1080], [-56, 56], [300, 316], "mid"));
      const cyl = []; for (let i = 0; i < 8; i++) cyl.push(K.iso([770 + i * 40, 0, 316], P));
      out.engine.push(D(cyl, { size: 2, tone: "hi" }));
      out.engine.push(ISO.tinted(ISO.T.steel, box([1150, 1380], [-120, 120], [135, 330], "mid")));
      out.gearbox.push(ISO.tinted(ISO.T.copper, S(G.disc(0, 170, 62, G.frameAlong([570, 0, 210], [1, 0, 0]), P), { tone: "hi" }) + S(G.disc(170, 176, 30, G.frameAlong([570, 0, 210], [1, 0, 0]), P), { tone: "mid" })));
      out.frame.push(ISO.tinted(ISO.T.steel, box([300, 560], [-80, 80], [135, 240], "mid")));                                                      // cab equipment rack
      for (const bc of [400, 1300]) out.frame.push(ISO.tinted(ISO.T.steel, box([bc - 170, bc + 170], [84, 96], [46, 82])));
    }
    return out;
  }
  // The parts per axle that sit between the frame and the wheels, drawn before the near wheels.
  function axleBits(P, kind) {
    const k = KINDS[kind], out = [];
    if (kind !== "train") return "";
    for (const ax of k.axles) {
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(-k.track + k.tw, k.track - k.tw, 8, yAx([ax, 0, k.wr]), P), { tone: "mid" })));
      const mx = ax + (ax % 900 < 400 ? 34 : -34);
      out.push(ISO.tinted(ISO.T.paint, S(G.disc(-46, 46, 28, yAx([mx, 0, k.wr + 6]), P), { tone: "hi" })));
      for (const y of [-1, 1]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [ax - 16, ax + 16], y < 0 ? [-98, -80] : [80, 98], [k.wr - 14, k.wr + 10], "mid")), L(K.coil([ax, y * 89, k.wr + 10], [ax, y * 89, 46], [ax, y * 89], 6, 4, "z", P), { tone: "mid" }));
    }
    return out.join("");
  }
  // A wheel: tyre (or steel tread and flange), and the turning face art in its outer plane.
  const wheelArt = (kind, r) => {
    const n = kind === "car" ? 5 : kind === "bus" ? 8 : 10, hub = r * 0.22, out = [];
    if (kind === "car") for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = r * 0.92; out.push(`<path d="M${f2(Math.cos(a - 0.12) * hub)} ${f2(Math.sin(a - 0.12) * hub)}L${f2(Math.cos(a - 0.2) * b)} ${f2(Math.sin(a - 0.2) * b)}L${f2(Math.cos(a + 0.2) * b)} ${f2(Math.sin(a + 0.2) * b)}L${f2(Math.cos(a + 0.12) * hub)} ${f2(Math.sin(a + 0.12) * hub)}Z" fill="#d9dadd" stroke="${INK}" stroke-width="0.5"/>`); }
    else for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; out.push(`<circle cx="${f2(Math.cos(a) * r * 0.62)}" cy="${f2(Math.sin(a) * r * 0.62)}" r="${f2(r * 0.11)}" fill="#6b7078" stroke="${INK}" stroke-width="0.5"/>`); }
    const nuts = Array.from({ length: kind === "train" ? 0 : 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2 + 0.6; return `<circle cx="${f2(Math.cos(a) * hub * 0.62)}" cy="${f2(Math.sin(a) * hub * 0.62)}" r="${f2(hub * 0.14)}" fill="${INK}"/>`; });
    return (kind === "car" ? `<circle r="${f2(r)}" fill="#3a3e44" stroke="${INK}" stroke-width="0.6"/>` : `<circle r="${f2(r)}" fill="#c9ccd1" stroke="${INK}" stroke-width="0.6"/>`) + out.join("") +
      `<circle r="${f2(hub)}" fill="#e3e4e7" stroke="${INK}" stroke-width="0.6"/>${nuts.join("")}<path d="M${f2(-r * 0.97)} 0H${f2(-r * 0.75)}" stroke="#c4382c" stroke-width="${f2(r * 0.06)}" stroke-linecap="round"/>`;
  };
  function wheelSvg(P, kind, x, side) {
    const k = KINDS[kind], F = yAx([x, side * k.track, k.wr]), out = [], rim = kind === "train" ? k.wr - 1 : k.wr * 0.62;
    if (kind === "train") {
      out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(-side * k.tw - side * 3, -side * k.tw, k.wr * 0.4, k.wr + 4, F, P), { tone: "mid" })));     // flange on the inside
      out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(-k.tw, k.tw, k.wr * 0.4, k.wr, F, P), { tone: "hi" })));
    } else out.push(ISO.tinted(ISO.T.rubber, S(G.ringBand(-k.tw, k.tw, rim, k.wr, F, P), { tone: "mid" })));
    if (side > 0) out.push(`<g transform="${ISO.faceMatrix(P, [x, k.track + k.tw + 0.3, k.wr], 1)}"><g data-spin>${wheelArt(kind, rim)}</g></g>`);
    return out.join("");
  }

  ISO.add({
    name: "vehicle", title: "Vehicle and its drive", compare: "vehicle 480 290 440 k=car",
    about: "A car, bus or diesel-electric locomotive, side on: drive it and the wheels turn; lift the body to see how the engine drives them (shaft and differential, or generator, cables and traction motors).",
    line: "vehicle cx cy length k=car|bus|train c=red|blue|green|yellow|orange drive=0|1 lift=0..1 lab=1 lit=body|engine|gearbox|shaft|axle|wheel|motor",
    demo: { line: "vehicle 480 290 440 k=car", script: [{ set: { drive: 1 }, hold: 3 }, { set: { lift: 1, lit: "shaft" }, hold: 4 }, { set: { lift: 0, drive: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const kind = KINDS[o.k] ? o.k : "car", k = KINDS[kind], pal = PAL[o.c] || PAL[DEF[kind]], lab = o.lab !== "0";
      const W = size * 1.7, H = size * (kind === "car" ? 0.95 : kind === "bus" ? 0.8 : 0.72);
      const GR = { x: -k.L * 0.12, y: -k.half - 40, w: k.L * 1.24, d: 2 * k.half + 80, r: 4 };
      const top = kind === "car" ? 140 : kind === "bus" ? 312 : 440;
      const { P, g } = ISO.frame([...K.boxCorners(GR, kind === "train" ? -36 : -8, 0), [0, -k.half, top + k.lift], [k.L, k.half, top + k.lift]], cx, cy, W, H, { azimuth: 72, elevation: 18, pad: 6 }, parent);
      const kk = K.cameraOf(P).k;
      // the ground: a road with a dashed line (car, bus), or ballast with sleepers and two rails (train)
      let ground = "";
      if (kind === "train") {
        ground = ISO.tinted(ISO.T.road, S(K.slabOf(GR, -36, 22, P, 3, 0.6), { tone: "lo", inner: L(K.sideSeam(GR, -24, P, 3), { tone: "faint" }) }));
      } else {
        const line = K.pathOf([K.iso([GR.x + 4, k.half + 20, 0], P), K.iso([GR.x + GR.w - 4, k.half + 20, 0], P)]);
        ground = ISO.tinted(ISO.T.road, S(K.slabOf(GR, -8, 8, P, 3, 0.5), { tone: "lo", inner: L(K.sideSeam(GR, -4, P, 3), { tone: "faint" }) })) +
          `<path data-part="dash" d="${line}" stroke="#fdfdfb" stroke-width="${f2(4 * kk)}" stroke-dasharray="${f2(k.L * 0.08 * kk)} ${f2(k.L * 0.08 * kk)}" fill="none"/>`;
      }
      const rails = kind === "train" ? [-1, 1].map((sd) => ISO.tinted(ISO.T.steel, ISO.wbox(P, [GR.x + 4, GR.x + GR.w - 4], [sd * k.track - 4, sd * k.track + 4], [-6, 0], "hi"))) : ["", ""];
      const ch = chassisSvg(P, kind);
      // the turning parts of the drive: a stripe on the shaft (car, bus) or on each motor's end (train)
      const words = !lab ? "" : (kind === "train"
        ? ISO.word(K.iso([900, 0, 300], P), "diesel engine", "#555", { size: 14, dy: -26 }) + ISO.word(K.iso([650, 0, 272], P), "generator", "#555", { size: 14, dy: -8 }) + ISO.word(K.iso([505, 96, 20], P), "traction motors", "#555", { size: 14, dy: 34 })
        : (kind === "car" ? ISO.word(K.iso([190, 0, k.wr + 10], P), "propeller shaft", "#555", { size: 14, dy: -14 }) : "") + ISO.word(K.iso([kind === "car" ? 346 : 145, 0, kind === "car" ? 110 : 190], P), kind === "car" ? "engine" : "engine at the back", "#555", { size: 14, dy: -10 }) + ISO.word(K.iso([k.driven[0], k.half, 0], P), "driven axle", "#555", { size: 14, dy: 22 }));
      g.innerHTML = `<g>${ground}</g><g data-part="sleepers"></g><g>${rails[0]}</g>` +
        named("wheel", k.axles.map((x) => wheelSvg(P, kind, x, -1)).join("")) +
        named("axle", ch.frame.join("") + ch.axle.join("")) + named("motor", axleBits(P, kind)) + `<g data-name="shaft">${ch.shaft.join("")}<g data-part="stripe"></g></g>` + named("gearbox", ch.gearbox.join("")) + named("engine", ch.engine.join("")) +
        (kind === "train" ? `<g data-part="cables"></g>` : "") +
        `<g data-part="body">${named("body", bodySvg(P, kind, pal))}</g>` +
        `<g>${rails[1]}</g>` + named("wheel", k.axles.map((x) => wheelSvg(P, kind, x, 1)).join("")) + `<g data-part="words">${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const spins = [...g.querySelectorAll("[data-spin]")];
      const dashK = el.dash?.getTotalLength ? el.dash.getTotalLength() / (GR.w - 8) : kk;
      // cables from the generator to each traction motor (train): drawn under the body, seen once it lifts
      if (el.cables) el.cables.innerHTML = k.axles.map((ax) => { const mx = ax + (ax % 900 < 400 ? 34 : -34); return `<path d="${K.pathOf([[650, 40, 160], [650, 60, 128], [mx, 60, 128], [mx, 40, k.wr + 30]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c2621a" stroke-width="${f2(3 * kk)}" stroke-linejoin="round"/>`; }).join("");
      const memo = new Map();
      const swap = (e, key, svg) => {
        if (e._key === key) return;
        if (!memo.has(key)) { const n = document.createElementNS("http://www.w3.org/2000/svg", "g"); n.innerHTML = svg(); memo.set(key, n); }
        e._key = key; e.replaceChildren(memo.get(key)); e.parentNode._fresh = true;
      };
      // shaft frame for the stripe (same numbers as chassisSvg)
      let shaftLine = null;
      if (kind !== "train") {
        const s = kind === "car" ? 1 : 1.6, e = kind === "car" ? { x0: 312, h: 44, z: 40 } : { x1: 230, h: 90, z: 60 }, rd = kind === "car" ? 1 : -1, gl = kind === "car" ? 64 : 40;
        const gx = kind === "car" ? e.x0 : e.x1, gz = e.z + e.h * 0.35, a = [gx - rd * gl, 0, gz], b = [k.driven[0] + rd * 18 * s, 0, k.wr];
        const dir = [b[0] - a[0], 0, b[2] - a[2]], len = Math.hypot(dir[0], dir[2]);
        shaftLine = { F: G.frameAlong(a, dir), len, r: 3.25 * s };
      }
      const stripe = (q) => {
        const { F, len, r } = shaftLine, a = (q / 16) * Math.PI * 2;
        if (G.facingOf(F, a, P) <= 0.05) return "";
        return `<path d="${K.pathOf([K.iso(G.pointOf(F, 6, r, a), P), K.iso(G.pointOf(F, len - 6, r, a), P)])}" stroke="#c4382c" stroke-width="${f2(1.6 * kk)}" stroke-linecap="round"/>`;
      };
      // sleepers under the rails, 60 cm apart, cached in 20 offsets; the end ones fade in and out
      const sleepers = (q) => {
        const off = (q / 20) * 60, out = [];
        for (let x = GR.x + 10 - 60 + off; x < GR.x + GR.w - 10; x += 60) {
          const a = ISO.smooth(GR.x + 10, GR.x + 70, x) * ISO.smooth(GR.x + GR.w - 10, GR.x + GR.w - 70, x + 24);
          if (a > 0.02) out.push(`<g opacity="${a.toFixed(2)}">${ISO.tinted(ISO.T.wood, ISO.wbox(P, [x, x + 24], [-k.track - 30, k.track + 30], [-14, -6], "mid"))}</g>`);
        }
        return out.join("");
      };
      const s = { on: o.drive === "1", w: o.drive === "1" ? 1 : 0, lift: ISO.clamp(ISO.num(o, "lift", 0), 0, 1), want: ISO.clamp(ISO.num(o, "lift", 0), 0, 1), d: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const wheelA = s.d / k.wr, deg = (wheelA * 180) / Math.PI;
        spins.forEach((e) => w.attr(e, "transform", `rotate(${f2(deg)})`));
        if (el.dash) w.attr(el.dash, "stroke-dashoffset", f2((s.d * dashK) % (k.L * 0.16 * kk)));
        if (kind === "train") { const q = ((Math.round(((s.d % 60) / 60) * 20) % 20) + 20) % 20; swap(el.sleepers, `s${q}`, () => sleepers(-q)); }
        else { const q = ((Math.round((wheelA * k.ratio * 16) / (Math.PI * 2)) % 16) + 16) % 16; swap(el.stripe, `t${q}`, () => stripe(q)); }
        w.attr(el.body, "transform", K.translateAlong(P, [0, 0, s.lift * k.lift]));
        w.attr(el.words, "opacity", ISO.smooth(0.3, 0.9, s.lift).toFixed(2));                  // the drive-train names show once the body is up
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.drive !== undefined) s.on = !!+p.drive; if (p.lift !== undefined) s.want = ISO.clamp(+p.lift, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      // shown slowed: the wheels at 0.5 turns a second at full speed; the readout gives the true numbers
      g.update = (dt) => {
        const calm = ISO.still(), target = s.on ? 1 : 0;
        s.w = ISO.follow(s.w, target, dt, 0.8, calm);
        if (s.w < 0.002 && !s.on) s.w = 0;
        if (!calm) s.d += s.w * 0.5 * 2 * Math.PI * k.wr * dt;
        s.lift = ISO.follow(s.lift, s.want, dt, 0.45, calm);
        draw();
        return s.w !== target || s.w > 0 || s.lift !== s.want;
      };
      g.readout = () => {
        const v = k.km * s.w, wheel = (v / 3.6 / (2 * Math.PI * k.wr / 100)) * 60, shaft = wheel * k.ratio;
        return kind === "train"
          ? `${v.toFixed(0)} km/h · wheels Ø${2 * k.wr * 10} mm ${wheel.toFixed(0)} rpm · each traction motor ${shaft.toFixed(0)} rpm (gear ${k.ratio} : 1) · diesel → generator → cables → 4 motors, one per axle`
          : `${v.toFixed(0)} km/h · wheels ${wheel.toFixed(0)} rpm · propeller shaft ${shaft.toFixed(0)} rpm (differential ${k.ratio} : 1, top gear 1 : 1) · ${kind === "car" ? "front engine, rear-wheel drive" : "rear engine drives the rear axle"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
