// "dynamicstrack cx cy k lab=0 lit=track|lips|scale|buffers|feet" — a PART (PARTS.md, batch 5): the school dynamics
// track of collision.js at real size, standing level on the bench, origin the bench point under its middle. A 120 cm
// anodised aluminium extrusion 2 cm deep on two black end feet with levelling thumbscrews; two guide lips along its
// edges keep a trolley's wheels on (12.6 cm across, so a labtrolley's wheels run between them); a printed cm scale
// 0–120 on the near side (a tick every cm, longer every 5, numbers every 10, ticks hanging from the top edge); an end
// stop at each end with a rubber buffer facing in, held by two cap screws; a maker's label. Static. World: 1 = 1 cm.
// anchors: top = the running surface's middle (a labtrolley's origin at x = 0, tilt 0), left and right = the running
// surface 10 cm in from each end stop.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HL = 60, HW = 6.3, LIP = 0.6, FZ = 1.6, TZ = 3.6, LZ = 0.6, FX = 52, STOP = 2.5;

  function svg(P) {
    const B09 = window.B09, out = [`<path class="iso-halo" d="${K.haloOf({ x: -HL, y: -HW - 1, w: 2 * HL, d: 2 * HW + 2, r: 1 }, 0, 2, P)}"/>`];
    // the feet: a moulded block under each end on four rubber pads
    const feet = [-FX, FX].map((x) => ISO.tinted(ISO.T.rubber, [-1, 1].map((s) => ISO.wbox(P, [x - 2.6, x + 2.6], s < 0 ? [-6.8, -5.2] : [5.2, 6.8], [0, 0.3], "lo")).join("")) +
      ISO.tinted(B09.BLACK, ISO.wbox(P, [x - 3, x + 3], [-7, 7], [0.3, FZ], "mid"))).join("");
    out.push(`<g data-name="feet">${feet}</g>`);
    // the extrusion's body, then the far lip
    out.push(`<g data-name="track">${ISO.tinted(B09.ALU, ISO.wbox(P, [-HL, HL], [-HW, HW], [FZ, TZ], "hi"))}</g>`);
    out.push(`<g data-name="lips">${ISO.tinted(B09.ALU, ISO.wbox(P, [-HL, HL], [-HW, -HW + LIP], [TZ, TZ + LZ], "mid"))}</g>`);
    // the end stops: an aluminium block across the track, a rubber buffer facing in, two cap screws on top
    const stop = (x0, x1, dir) => {
      const xi = dir > 0 ? x1 : x0, F = G.frameOf([xi, 0, TZ + 1.5], [dir, 0, 0], [0, 1, 0], [0, 0, 1]);
      return ISO.tinted(B09.ALU, ISO.wbox(P, [x0, x1], [-HW + LIP, HW - LIP], [TZ, TZ + 3], "mid")) +
        ISO.tinted(ISO.T.rubber, S(G.disc(0, 0.25, 1.5, F, P), { tone: "mid" }) + S(G.disc(0.25, 1.2, 1.25, F, P), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, [-2.6, 2.6].map((y) => S(K.cylinder((x0 + x1) / 2, y, 0.45, TZ + 3, 0.35, P, 14, 0.1), { tone: "hi" })).join(""));
    };
    out.push(`<g data-name="buffers">${stop(-HL, -HL + STOP, 1)}${stop(HL - STOP, HL, -1)}</g>`);
    out.push(`<g data-name="lips">${ISO.tinted(B09.ALU, ISO.wbox(P, [-HL, HL], [HW - LIP, HW], [TZ, TZ + LZ], "mid"))}</g>`);
    // the levelling thumbscrews on the feet's near side
    out.push(`<g data-name="feet">${[-FX, FX].map((x) => { const F = G.frameOf([x, 7, 0.95], [0, 1, 0], [1, 0, 0], [0, 0, 1]); return ISO.tinted(ISO.T.steel, S(G.disc(0, 0.5, 0.25, F, P), { tone: "mid" })) + ISO.tinted(ISO.T.plastic, S(G.disc(0.5, 1.1, 0.6, F, P), { tone: "mid" })); }).join("")}</g>`);
    // the scale on the near face: a tick every cm from the top edge (longer every 5), numbers every 10, the label
    const y = HW + 0.02, minor = [], major = [], nums = [];
    for (let c = 0; c <= 120; c++) { const x = -HL + c, big = c % 5 === 0; (big ? major : minor).push(K.segment([x, y, TZ + LZ], [x, y, TZ + LZ - (big ? 0.7 : 0.4)], P)); if (c % 10 === 0 && c > 0 && c < 120) nums.push(LAB.faceText(P, [x, y, TZ - 0.6], [1, 0, 0], String(c), 0.55, "#2f3a44")); }
    out.push(`<g data-name="scale">${L(minor.join(""), { tone: "lo", free: "end" })}${L(major.join(""), { tone: "mid", free: "end" })}${nums.join("")}` +
      `${ISO.tinted(ISO.T.paint, ISO.wbox(P, [-HL + 2.6, -HL + 9.2], [HW, HW + 0.05], [FZ + 0.35, TZ - 0.75], "hi"))}${LAB.faceText(P, [-HL + 5.9, HW + 0.08, FZ + 0.75], [1, 0, 0], "DYNAMICS TRACK 1.2 m", 0.36, "#33506f")}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "dynamicstrack", title: "Dynamics track (part)", compare: null,
    about: "A 120 cm aluminium dynamics track on two end feet, with guide lips, a printed cm scale and a rubber buffer at each end: the road a labtrolley runs on for collisions and momentum. anchors: top left right",
    line: "dynamicstrack cx cy k lab=0 lit=track|lips|scale|buffers|feet",
    demo: { line: "dynamicstrack 480 300 6.4", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.2 }, { set: { lit: "buffers" }, hold: 1.2 }, { set: { lit: "lips" }, hold: 1.2 }, { set: { lit: "feet" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = svg(P) + (lab ? LAB.word(P, lab, [0, HW + 2, 0], "dynamics track", "#556", { dy: 16 }) : "");
      g.anchors = { top: [0, 0, TZ], left: [-HL + STOP + 10, 0, TZ], right: [HL - STOP - 10, 0, TZ] };
      return window.B09.still(g, o, "dynamics track · 120 cm long · running surface 3.6 cm above the bench · cm scale 0–120");
    },
  });
})();
