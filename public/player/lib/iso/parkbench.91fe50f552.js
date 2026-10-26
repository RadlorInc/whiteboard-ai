// "parkbench cx cy k lab=0 lit=seat|back|frames|feet" — a PART (batch 6): celltower.js's bench at real size, 150 ×
// 60 × 80 cm: two painted steel side frames (a front leg, a back leg that leans back to carry the backrest, the seat
// rail between them, an arm post and armrest), each on two foot plates bolted down; five hardwood seat slats 45 cm up
// and three backrest slats, every slat bolted to both frames (round bolt heads) with a grain line along it. Origin:
// the ground point under its middle (the seat faces +y). Static. World: 1 = 1 cm. anchors: seat (the middle of the
// seat's top), back (the middle of the backrest's front).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const FX = 62, XS = 75, ZS = 42, ST = 3.5, BK = 0.22;            // frame x, slat half length, seat height, slat thickness, backrest lean
  const FRAME = ISO.tint("#5f6e62", ["#334036", "#3b483e", "#435047", "#4c5a50"], "#141c16");
  const SLAT = ISO.tint("#e3c49a", ["#a9773f", "#b8864d", "#c6965f", "#d3a874"], "#5e3d18");
  // the back leg and the backrest lean back: y = y0 − BK·(z − z0)
  const BY = -24, BZ0 = ZS, back = (z) => BY - BK * (z - BZ0);

  function frameParts(P, x) {
    const t = 1.2, at = (u, w, h) => [x + u, w, h], lean = (u, w, h) => [x + u, back(h) + w, h];
    const near = [], far = [];
    // the back leg: straight from its foot up to the seat rail, then leaning back to the top of the backrest
    far.push(ISO.tinted(FRAME, ISO.box(at, P, [-t, t], [BY - 2, BY + 2], [1, BZ0], "mid")));
    far.push(ISO.tinted(FRAME, ISO.box(lean, P, [-t, t], [-2, 2], [BZ0, 80], "mid")));
    // the seat rail and the front leg
    far.push(ISO.tinted(FRAME, ISO.box(at, P, [-t, t], [BY - 2, 26], [ZS - 5, ZS], "mid")));
    near.push(ISO.tinted(FRAME, ISO.box(at, P, [-t, t], [20, 24], [1, ZS - 5], "mid")));
    // the arm post on the front slat and the armrest back to the leaning leg
    const arm = [ISO.tinted(FRAME, ISO.box(at, P, [-t, t], [19.5, 22.5], [ZS + ST, 64], "mid")), ISO.tinted(FRAME, ISO.box(at, P, [-2, 2], [back(64) + 2, 25], [64, 66.5], "hi"))];
    // the foot plates with their bolts
    const feet = [BY, 22].map((y) => ISO.tinted(FRAME, ISO.wbox(P, [x - 3.5, x + 3.5], [y - 4, y + 4], [0, 1], "lo")) +
      ISO.tinted(ISO.T.steel, [y - 2.5, y + 2.5].map((yy) => S(K.cylinder(x, yy, 0.7, 1, 0.6, P, 8), { tone: "mid" })).join(""))).join("");
    return { far: far.join(""), near: near.join(""), arm: arm.join(""), feet };
  }
  // a slat along x, given its frame function; a grain line along its top and a bolt head over each frame
  function slat(P, at, [w0, w1], [h0, h1], grainAt) {
    let s = ISO.tinted(SLAT, ISO.box(at, P, [-XS, XS], [w0, w1], [h0, h1], "mid"));
    if (grainAt !== null) s += `<path d="${K.pathOf([K.iso(at(-XS, grainAt, h1 + 0.01), P), K.iso(at(XS, grainAt, h1 + 0.01), P)])}" stroke="#b58a55" stroke-width="0.5"/>`;
    s += ISO.tinted(ISO.T.steel, [-FX, FX].map((x) => { const c = at(x, (w0 + w1) / 2, h1); return S(K.cylinder(c[0], c[1], 0.9, c[2], 0.4, P, 10), { tone: "mid" }); }).join(""));
    return s;
  }

  ISO.add({
    name: "parkbench", title: "Park bench (part)", compare: null,
    about: "An outdoor bench 150 cm long: five hardwood seat slats at 45 cm and three backrest slats, bolted to two painted steel side frames with armrests, bolted down on foot plates. anchors: seat back",
    line: "parkbench cx cy k lab=0 lit=seat|back|frames|feet",
    demo: { line: "parkbench 480 400 3.4", script: [{ set: {}, hold: 1 }, { set: { lit: "seat" }, hold: 1.2 }, { set: { lit: "frames" }, hold: 1.2 }, { set: { lit: "back" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const L = frameParts(P, -FX), R = frameParts(P, FX);
      const flat = (u, w, h) => [u, w, h];
      // the seat: five slats 9 cm wide with 2 cm gaps, back to front
      const seat = [0, 1, 2, 3, 4].map((i) => { const y0 = BY - 2 + i * 10.6; return slat(P, flat, [y0, y0 + 9], [ZS, ZS + ST], y0 + 4.5); }).join("");
      // the backrest: three slats 9 cm tall on the leaning legs' front, from 52 cm up
      const lean = (u, w, h) => [u, back(h) + w, h];
      const backrest = [2, 1, 0].map((i) => { const h0 = 52 + i * 10; return slat(P, lean, [2, 2 + ST], [h0, h0 + 9], null); }).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -XS - 2, y: BY - 8, w: 2 * XS + 4, d: 60, r: 3 }, 0, 0.1, P)}"/>` +
        `<g data-name="feet">${L.feet}${R.feet}</g><g data-name="frames">${L.far}${L.near}${R.far}</g><g data-name="back">${backrest}</g>` +
        `<g data-name="frames">${R.near}</g><g data-name="seat">${seat}</g><g data-name="frames">${L.arm}${R.arm}</g>` +
        (lab ? ISO.word(K.iso([XS, 0, 82], P), "park bench", "#444", { size: 13, anchor: "start" }) : "");
      g.anchors = { seat: [0, 0, ZS + ST], back: [0, back(66) + 2 + ST, 66] };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) B31.light(w, g, p.lit); };
      g.update = () => false;
      g.readout = () => "park bench · 150 cm long, seat 45 cm up · hardwood slats bolted to steel frames";
      B31.light(w, g, o.lit || "");
      return g;
    },
  });
})();
