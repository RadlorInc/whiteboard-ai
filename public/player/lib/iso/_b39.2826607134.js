// Batch b39 helpers (PARTS.md, batch 6: phone and loudspeaker parts). Not a recipe: it only defines window.B39, which
// those part files call at make time. Everything here is built in mm (ISO.mm); anchors stay in cm.
(() => {
  const K = window.K, G = window.G;
  const B = (window.B39 = {});
  B.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  B.fin = (v) => v !== undefined && v !== null && v !== "" && Number.isFinite(+v);
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time, since groups get rebuilt
  B.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the same camera turned by az degrees about z (the part's origin stays put): a turn is an azimuth change, so depth
  // order and light stay right. 180 lets a lying phone's screen read upright, its top end away from the viewer.
  // `from`: the build's point that lands on the part's origin (a cabinet built from its front face, placed by its middle)
  B.cam = (P, az = 0, from = [0, 0, 0]) => {
    const Q = { ...P, azimuth: (P.azimuth ?? ISO.PART_CAM.azimuth) + az }, a = K.iso([0, 0, 0], P), b = K.iso(from, Q);
    Q.origin = [P.origin[0] + a[0] - b[0], P.origin[1] + a[1] - b[1]];
    return Q;
  };
  // printed or on-screen words: through the label helper (ISO.say) like every other label, in the machine's own type
  B.text = (x, y, t, size, color = "#1f3b4d", anchor = "middle", weight = 700) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px 'Helvetica Neue',Arial,sans-serif">${ISO.esc(ISO.say(t))}</text>`;

  // ── the phone's pouch battery: a silver laminate cell with soft edges, a printed label and its flex with the
  // board-to-board connector. Plan x0..x1, y0..y1 at z0, h tall; the flex leaves the −y end at fx and runs flen.
  B.battery = (P, { x0, x1, y0, y1, z0 = 0, h = 5, fx = (x0 + x1) / 2 + 8, flen = 8, fz }) => {
    const T = window.TECH, w = x1 - x0, d = y1 - y0, zt = z0 + h, s = [];
    s.push(`<g data-name="cell">${T.slab(P, { x: x0, y: y0, w, d, r: 2.5 }, z0, h, "hi", T.C.battery, 4, 0.6)}`);
    // the sealed seam (a pressed lip) round the cell, just under the top
    s.push(`<path d="${K.planOutline({ x: x0 + 1, y: y0 + 1, w: w - 2, d: d - 2, r: 1.8 }, zt, P, 4)}" fill="none" stroke="#a9a39a" stroke-width=".5"/></g>`);
    // the label: a white sticker with the cell's chemistry, voltage, capacity and energy, and the printed warning lines
    const lx = x0 + 4, ly = y0 + 6, lw = w - 8, ld = d - 14;
    s.push(`<g data-name="label">${T.slab(P, { x: lx, y: ly, w: lw, d: ld, r: 1.5 }, zt, 0.08, "hi", T.C.white, 3)}`);
    const sc = lw / 42, rows = [];
    for (let i = 0; i < 4; i++) rows.push(`<path data-free d="M${4} ${ld * 0.52 + i * 4.2}H${lw - 4 - (i % 2) * 8}" stroke="#a9a39a" stroke-width="1.1"/>`);
    s.push(T.flat(P, [lx + lw, ly + ld, zt + 0.09], [-1, 0, 0], [0, -1, 0], B.text(lw / 2, ld * 0.2, "Li-ion polymer", (4.4 * sc).toFixed(2), "#4a453d") +
      B.text(lw / 2, ld * 0.2 + 6.4 * sc, "3.85 V · 3279 mAh · 12.6 Wh", (2.6 * sc).toFixed(2), "#6b655c", "middle", 600) + rows.join("")) + "</g>");
    // the flex: a thin copper-brown ribbon from the cell's end, stiffened where its connector sits
    if (fz === undefined) fz = z0 + h * 0.6;
    s.push(`<g data-name="flex">${T.box(P, [fx - 2.6, fx + 2.6], [y0 - flen, y0 + 0.5], [fz, fz + 0.2], "mid", T.C.copper)}` +
      T.box(P, [fx - 3.4, fx + 3.4], [y0 - flen - 3.4, y0 - flen + 0.6], [fz, fz + 0.3], "mid", T.C.pcbDark) +
      T.box(P, [fx - 3, fx + 3], [y0 - flen - 3, y0 - flen + 0.2], [fz + 0.3, fz + 1.2], "mid", T.C.dark) + "</g>");
    return { svg: s.join(""), plug: [fx, y0 - flen - 1.4, fz + 1.2] };
  };

  // ── the phone's logic board: an L of green board 60 × 90 mm, its middle at (ox, oy), from z0. The long strip runs up
  // the +x side; the foot along the −y end carries the USB-C port (at x = ux, the phone's middle), the loudspeaker
  // and the vibration motor. Returns its svg and the battery connector's place.
  B.board = (P, ox = 0, oy = 0, z0 = 0, ux = 0) => {
    const T = window.TECH, s = [], X = (a, b) => [ox + a, ox + b], Y = (a, b) => [oy + a, oy + b];
    const box = (x, y, z, tone, c) => T.box(P, X(...x), Y(...y), z, tone, c), bt = z0 + 1, u = ux - ox;
    s.push(box([12, 30], [-25, 45], [z0, bt], "mid", T.C.pcb), box([-30, 30], [-45, -25], [z0, bt], "mid", T.C.pcb));
    // three screw pads with their screws, gold test pads
    for (const [x, y] of [[27, 42], [-27, -28], [27, -42]]) s.push(T.cyl(P, ox + x, oy + y, 1.6, bt, 0.15, "hi", T.C.gold, 14), T.cyl(P, ox + x, oy + y, 0.9, bt + 0.15, 0.5, "hi", T.C.steel, 12));
    // a row of small capacitors and resistors down the strip
    for (let i = 0; i < 6; i++) s.push(box([13.2, 14.6], [-22 + i * 5.5, -20.8 + i * 5.5], [bt, bt + 0.5], "mid", i % 2 ? T.C.dark : T.C.battery));
    // the processor under its steel shield can (a pressed lid with a seam), the modem, the storage, the power chips
    s.push(`<g data-name="soc">${box([15.5, 28.5], [14, 30], [bt, bt + 1.3], "hi", T.C.steel)}${T.slab(P, { x: ox + 17, y: oy + 15.5, w: 10, d: 13, r: 1 }, bt + 1.3, 0.05, "mid", T.C.alu, 3)}</g>`);
    s.push(`<g data-name="chips">${box([16, 28], [33, 42], [bt, bt + 0.9], "mid", T.C.chip)}${box([16, 28], [0, 10], [bt, bt + 0.9], "mid", T.C.chip)}` +
      `${box([16, 22], [-13, -6], [bt, bt + 0.7], "mid", T.C.chip)}${box([23.5, 28], [-12, -7], [bt, bt + 0.6], "mid", T.C.chip)}</g>`);
    // the SIM reader: a steel cage at the strip's +x edge, the tray's head showing at the edge with its pin hole
    s.push(`<g data-name="sim">${box([17, 29.4], [-24, -15], [bt, bt + 1.5], "mid", T.C.steel)}${box([29.4, 30.4], [-23.6, -15.4], [bt + 0.1, bt + 1.4], "hi", T.C.alu)}` +
      `${T.dot(P, [[ox + 30.42, oy - 21.2, bt + 0.75]], 0.4, "lo")}</g>`);
    // the battery's connector on the foot, the vibration motor, the loudspeaker (its grille on the −y edge) and USB-C
    s.push(box([u - 14, u - 7], [-30, -26.5], [bt, bt + 1.2], "mid", T.C.dark));
    s.push(`<g data-name="motor">${box([-29, -17], [-42, -30], [bt, bt + 3], "mid", T.C.steel)}${T.slab(P, { x: ox - 27.5, y: oy - 40.5, w: 9, d: 9, r: 1 }, bt + 3, 0.05, "lo", T.C.alu, 3)}</g>`);
    s.push(`<g data-name="speaker">${box([u + 5.5, 24], [-44.6, -31], [bt, bt + 2.6], "mid", T.C.black)}` +
      T.quad(P, [[ox + u + 6.5, oy - 44.62, bt + 0.6], [ox + 23.4, oy - 44.62, bt + 0.6], [ox + 23.4, oy - 44.62, bt + 2], [ox + u + 6.5, oy - 44.62, bt + 2]], "#2a2e33", "#101215", 0.4) + "</g>");
    s.push(`<g data-name="usb">${box([u - 4.5, u + 4.5], [-45.4, -38], [bt, bt + 3.2], "hi", T.C.steel)}` +
      T.quad(P, [[ox + u - 3.2, oy - 45.42, bt + 0.8], [ox + u + 3.2, oy - 45.42, bt + 0.8], [ox + u + 3.2, oy - 45.42, bt + 2.4], [ox + u - 3.2, oy - 45.42, bt + 2.4]], "#2a2e33", "#1f2226", 0.5) + "</g>");
    return { svg: s.join(""), plug: [ox + u - 10.5, oy - 28, bt + 1.2] };
  };

  // ── loudspeaker drivers, from speaker.js, given as (s along the axis, r out from it), s = 0 the mounting face (the
  // flange's back, flat on the baffle), +s toward the listener. speaker.js's woofer is scaled to a 16.5 cm × 7 cm unit.
  const WS = 0.62, WR = 0.9;
  const w = (pts) => pts.map(([s, r, c]) => (c === undefined ? [s * WS, r * WR] : [s * WS, r * WR, c]));
  B.WOOF = {
    flange: w([[0, 74], [0, 92], [3, 92], [3, 74]]), fr: 92 * WR, holes: 87 * WR,
    surround: w([[3, 75], [3, 76], [5, 76.6, 1], [6.6, 80, 1], [5, 83.4, 1], [3, 84], [3, 85]]),
    cone: w([[3, 77], [-38, 22], [-38, 23.6], [3, 78.6]]), rim: [3 * WS, 77 * WR], neck: [-38 * WS, 22 * WR],
    cap: w([[-38, 0], [-38, 22], [-34, 19.6, 1], [-30, 13, 1], [-28, 6, 1], [-27.5, 0]]),
    spider: w((() => { const top = [], bot = []; for (let i = 0; i <= 12; i++) { const r = 22 + (i / 12) * 34, s = -50 + (i % 2 ? 2.4 : -2.4); top.push([s + 0.6, r]); bot.unshift([s - 0.6, r]); } return [...top, ...bot]; })()),
    seat: w([[-56, 54], [-56, 62], [-50, 62], [-50, 54]]),
    leg: [[0, 88], [-58, 60]].map(([s, r]) => [s * WS, r * WR]),
    plate: w([[-60, 25.5], [-60, 68], [-70, 68], [-70, 25.5]]),
    magnet: w([[-70, 27], [-70, 68], [-100, 68], [-100, 27]]),
    back: w([[-100, 0], [-100, 68], [-110, 68], [-110, 0]]),
    pole: w([[-100, 0], [-100, 19.5], [-60, 19.5], [-60, 4], [-60, 0]]),
    vent: [-110 * WS, 4 * WR],
    // the sections at x = 0 (speaker.js's cut): basket, surround, spider, top plate, magnet, yoke, cone, coil
    secBasket: w([[0, 86], [0, 91], [-60, 63], [-60, 57]]), secSeat: w([[-56, 54], [-50, 54], [-50, 62], [-56, 62]]),
    secFlange: w([[0, 76], [3, 76], [3, 92], [0, 92]]),
    secSurround: w([...ISO.arc(3, 80, 4, 0, Math.PI, 10), ...ISO.arc(3, 80, 2.6, Math.PI, 0, 10)]),
    secPlate: w([[-60, 25.5], [-70, 25.5], [-70, 68], [-60, 68]]), secMagnet: w([[-70, 27], [-100, 27], [-100, 68], [-70, 68]]),
    secYoke: w([[-110, -68], [-110, 68], [-100, 68], [-100, 19.5], [-60, 19.5], [-60, -19.5], [-100, -19.5], [-100, -68]]),
    secVent: w([[-60, -4], [-110, -4], [-110, 4], [-60, 4]]),
    secCap: w([...ISO.arc(-55.8, 0, 28.3, 0.89, -0.89, 16), ...ISO.arc(-55.8, 0, 27.1, -0.89, 0.89, 16)]),
    secFormer: w([[-38, 20], [-68, 20], [-68, 21], [-38, 21]]), secCoil: w([[-53, 21], [-68, 21], [-68, 24.8], [-53, 24.8]]),
    depth: 110 * WS, front: 6.6 * WS,
  };
  // the dome tweeter: a round faceplate 96 mm across, a 26 mm soft dome, its small magnet behind
  B.TWEET = {
    face: [[0, 13], [0, 48], [4, 48], [4.4, 46, 1], [4.4, 15], [4, 13]], fr: 48, holes: 42,
    ring: [[4.4, 13], [4.4, 15], [5.4, 14.2, 1], [5.4, 13]],
    dome: [[4.4, 0], [4.4, 13], [7, 12, 1], [10, 8, 1], [11.5, 0]],
    magnet: [[0, 0], [0, 24], [-3, 24], [-3, 26], [-14, 26], [-14, 24], [-15, 22], [-15, 0]],
    back: [[-15, 0], [-15, 16], [-18, 16], [-18, 0]],
    secFace: [[0, 13], [4, 13], [4.4, 15], [4.4, 46], [4, 48], [0, 48]], secMagnet: [[-3, 8], [-14, 8], [-14, 26], [-3, 26]],
    secBack: [[-14, -16], [-14, 16], [-18, 16], [-18, -16]], secDome: [...ISO.arc(-3, 0, 14.5, Math.PI / 2, 0.45, 10), ...ISO.arc(-3, 0, 13.3, 0.45, Math.PI / 2, 10)],
    depth: 18, front: 11.5,
  };
  // section materials for ISO.prismX (speaker.js): [dark, light] sides, face, ink
  B.M = {
    steel: [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"], magnet: [["#3e434a", "#7d838b"], "#5d636a", "#1a1d20"],
    paper: [["#9a8a6a", "#efe4ca"], "#ddd0b0", "#5a4a2a"], rubber: [["#2a2b2f", "#55575c"], "#3e3f44", "#121214"],
    copper: [["#c98258", "#f7d9c4"], "#e2a985", "#6e3a1c"], cloth: [["#c9a85a", "#f6e7bf"], "#ecd394", "#6b5114"],
    basket: [["#262a30", "#5a6068"], "#40454c", "#101215"], wood: [["#c9a477", "#f7e8d0"], "#e9d0ad", "#7a5a2e"],
    tube: [["#2a2d31", "#5a5f66"], "#45494f", "#101215"],
  };
  // a section face at x = 0 (a thin prism from x = −1.2) of a part given in (s, r) about the axis at (y0, zc): s runs +y
  // sx: the side the viewer is on (+1: +x, the near half cut away is x > 0; −1: x < 0), the slab sits on the far side
  B.sec = (P, pts, y0, zc, m, sx = 1) => ISO.prismX(P, pts.map(([s, r]) => [y0 + s, zc + r]), sx > 0 ? -1.2 : 0, sx > 0 ? 0 : 1.2, ...B.M[m]);
  B.both = (P, pts, y0, zc, m, sx = 1) => B.sec(P, pts, y0, zc, m, sx) + B.sec(P, pts.map(([s, r]) => [s, -r]), y0, zc, m, sx);
  // a loose driver's camera: aim=front faces the room (+y, to sit on a baffle), aim=side turns it 40° toward −x so its
  // side (basket, magnet, terminals) shows and a cut through it faces you; and the world point of a build point
  const TURN = 40, tc = Math.cos((TURN * Math.PI) / 180), ts = Math.sin((TURN * Math.PI) / 180);
  B.aimCam = (P, aim) => (aim === "side" ? B.cam(P, -TURN) : P);
  B.aimed = (aim, [x, y, z]) => (aim === "side" ? [x * tc - y * ts, x * ts + y * tc, z] : [x, y, z]).map((v) => +v.toFixed(3));
  // a driver's axis frame: centre (0, y0, zc), pointing +y
  B.axis = (y0, zc) => G.frameAlong([0, y0, zc], [0, 1, 0]);
  // four screws on a flange's front face at radius r (s = sf)
  B.screws = (P, F, sf, r) => window.TECH.D([0, 1, 2, 3].map((i) => K.iso(G.pointOf(F, sf, r, Math.PI / 4 + (i * Math.PI) / 2), P)), { size: 0.55 });
  // the moving cone seen from the front (speaker.js coneFront): the funnel's mouth, its corrugation rings, the dust cap
  // (seen from the side, the dust cap and the neck deep inside show only through the cone's mouth: clipped to it)
  let uid = 0;
  B.coneFront = (P, F) => {
    const T = window.TECH, W = B.WOOF, [rs, rr] = W.rim, [ns, nr] = W.neck, mouth = G.circleOf(F, rs, rr, P), id = `b39c${uid++}`;
    const s = [`<clipPath id="${id}"><path d="${mouth}"/></clipPath><path d="${mouth}" fill="#cfc2a2" stroke="#5a4a2a" stroke-width=".7"/><g clip-path="url(#${id})">`];
    s.push(`<path d="${[0.3, 0.55, 0.78].map((f) => G.circleOf(F, rs + f * (ns - rs), rr + f * (nr - rr), P)).join("")}" fill="none" stroke="#a8987a" stroke-width=".5"/>`);
    s.push(`<path d="${G.circleOf(F, ns, nr, P)}" fill="#bfb18f" stroke="#5a4a2a" stroke-width=".6"/>`);
    s.push(ISO.tinted(T.C.paper, T.S(G.lathe(W.cap, F, P, { steps: 48 }), { tone: "hi" })));
    return s.join("") + "</g>";
  };
  // the woofer's flange ring and its rubber surround seen from the front
  B.wooferRing = (P, F) => {
    const T = window.TECH, W = B.WOOF;
    return ISO.tinted(T.C.dark, T.S(G.ringBand(0, W.flange[2][0], 74 * WR, W.fr, F, P, { hole: [W.flange[2][0], 74 * WR] }), { tone: "mid" })) + B.screws(P, F, W.flange[2][0], W.holes) +
      ISO.tinted(T.C.rubber, T.S(G.lathe(W.surround, F, P, { steps: 72 }), { tone: "mid" }));
  };
  // the tweeter seen from the front: faceplate, its screws, the ring and the soft dome (dz: how far the dome is pushed)
  B.tweeterFace = (P, F) => {
    const T = window.TECH, W = B.TWEET;
    return ISO.tinted(T.C.dark, T.S(G.lathe(W.face, F, P, { steps: 48 }), { tone: "mid" })) + B.screws(P, F, 4.45, W.holes) +
      ISO.tinted(T.C.dark, T.S(G.lathe(W.ring, F, P, { steps: 36 }), { tone: "lo" }));
  };
  B.dome = (P, F) => ISO.tinted(window.TECH.C.white, window.TECH.S(G.lathe(B.TWEET.dome, F, P, { steps: 36 }), { tone: "hi" }));
  // sound rings spreading from a driver: q = phase step 0..23, amp 0..1
  B.rings = (P, F, s0, r0, q, amp, n = 3, grow = 60, rg = 30) => [...Array(n).keys()].map((i) => {
    const f = (q / 24 + i / n) % 1;
    return `<path data-free d="${G.circleOf(F, s0 + f * grow, r0 + f * rg, P)}" fill="none" stroke="#2f7fd6" stroke-width="${(2.2 - f * 1.4).toFixed(2)}" opacity="${(amp * (1 - f) * 0.8).toFixed(2)}"/>`;
  }).join("");
})();
