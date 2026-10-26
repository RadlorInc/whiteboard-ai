// "cambattery cx cy k aim=up|flat lab=0 lit=pack|contacts|label" — a PART (batch 6): camera.js's camera battery on
// its own, at real size: a slim black lithium-ion pack 4 × 1.5 × 5.5 cm. At one end, the contact window: a recessed
// panel with three gold contacts (+, a data contact, −) and the key notch that only lets it go in one way; along the
// side, the latch slot the camera's catch drops into; on the big face a printed grey label (7.2 V, Li-ion, rule lines)
// and a few grip ridges at the other end. aim=up stands it on its end, contacts at the top; aim=flat lays it on its
// big face, contacts toward +x. Origin: the surface point under its middle. Static. World: 1 = 1 cm.
// anchors: contacts (the middle of the contact window).
(() => {
  const K = window.K;
  const HU = 2, HW = 0.75, LEN = 5.5;
  const BODY = ISO.tint("#3c4046", ["#1d2024", "#24272c", "#2c3035", "#343840"], "#0b0c0e");
  const GREY = ISO.tint("#8d9299", ["#5d6269", "#666b72", "#70757c", "#7a7f86"], "#2a2d31");
  const GOLD = window.TECH.C.gold;

  function packSvg(P, aim, lab) {
    // the frame: u across the pack (4 cm), w through it (1.5 cm), h along it (5.5 cm, the contacts at h = LEN)
    const at = aim === "flat" ? (u, w, h) => [h - LEN / 2, u, w + HW] : (u, w, h) => [u, w, h];
    const quad = (pts, fill, stroke, sw = 0.5, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(at(...p), P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${extra}/>`;
    const plan = aim === "flat" ? { x: -LEN / 2, y: -HU, w: LEN, d: 2 * HU, r: 0.3 } : { x: -HU, y: -HW, w: 2 * HU, d: 2 * HW, r: 0.3 };
    const out = [`<path class="iso-halo" d="${K.haloOf(plan, 0, 0.02, P)}"/>`];
    // the case: a body with the key notch cut from one corner at the contact end (a step), the end cap a shade lighter
    let pack = ISO.tinted(BODY, ISO.box(at, P, [-HU, HU], [-HW, HW], [0, LEN - 0.6], "mid"));
    pack += ISO.tinted(BODY, ISO.box(at, P, [-HU, HU - 0.5], [-HW, HW], [LEN - 0.6, LEN], "mid"));
    pack += ISO.tinted(BODY, ISO.box(at, P, [HU - 0.5, HU], [-HW, HW - 0.6], [LEN - 0.6, LEN - 0.25], "mid"));
    // the seam between the case's two shells, round the visible sides; the latch slot on the +u side
    pack += quad([[HU + 0.005, -0.2, 3.6], [HU + 0.005, 0.2, 3.6], [HU + 0.005, 0.2, 4.3], [HU + 0.005, -0.2, 4.3]], "#0b0c0e", "#0b0c0e");
    pack += quad([[-HU + 0.15, HW + 0.005, 0.3], [HU - 0.15, HW + 0.005, 0.3], [HU - 0.15, HW + 0.005, 0.6], [-HU + 0.15, HW + 0.005, 0.6]], "none", "#555a61", 0.5);
    // grip ridges near the bottom end of the big face
    for (let i = 0; i < 4; i++) { const h = 0.8 + i * 0.22; pack += ISO.tinted(BODY, ISO.box(at, P, [-HU + 0.35, HU - 0.35], [HW, HW + 0.04], [h, h + 0.1], "mid")); }
    out.push(`<g data-name="pack">${pack}</g>`);
    // the printed label on the big face: a grey panel, its rule lines, the voltage and the chemistry (never a brand)
    let label = quad([[-HU + 0.25, HW + 0.005, 1.9], [HU - 0.25, HW + 0.005, 1.9], [HU - 0.25, HW + 0.005, LEN - 0.9], [-HU + 0.25, HW + 0.005, LEN - 0.9]], "#7d838a", "#2a2d31", 0.5);
    label += `<path d="${[2.3, 2.5, 2.7].map((h, i) => K.pathOf([K.iso(at(-HU + 0.5, HW + 0.01, h), P), K.iso(at(HU - 0.5 - i * 0.6, HW + 0.01, h), P)])).join("")}" stroke="#b8bdc3" stroke-width="0.5" data-free=""/>`;
    // printed upright for the viewer: across the pack standing up; along it (toward +x) lying flat
    const tx = (u, h, text, size) => LAB.faceText(P, at(u, HW + 0.01, h), aim === "flat" ? [1, 0, 0] : [1, 0, 0], text, size, "#f2f3f4", aim === "flat" ? [0, -1, 0] : [0, 0, 1]);
    label += aim === "flat" ? tx(-0.45, 3.4, "7.2 V", 0.62) + tx(0.55, 3.4, "Li-ion", 0.42) : tx(0, 3.75, "7.2 V", 0.62) + tx(0, 3.05, "Li-ion", 0.42);
    out.push(`<g data-name="label">${label}</g>`);
    // the contact window: a recessed dark panel in the end, three gold contacts in their slots, + and − moulded beside
    const e = LEN + 0.005;
    let con = quad([[-HU + 0.3, -HW + 0.25, e], [HU - 0.9, -HW + 0.25, e], [HU - 0.9, HW - 0.25, e], [-HU + 0.3, HW - 0.25, e]], "#121316", "#0b0c0e");
    for (const u of [-1.3, -0.55, 0.2]) con += ISO.tinted(GOLD, ISO.box(at, P, [u, u + 0.32], [-0.35, 0.35], [LEN - 0.08, LEN - 0.02], "hi"));
    out.push(`<g data-name="contacts">${con}</g>`);
    if (lab) out.push(ISO.word(K.iso(at(HU, 0, LEN + 0.4), P), "camera battery", "#444", { size: 13, anchor: "start" }).replace('x="', 'dx="6" x="'));
    return { svg: out.join(""), contacts: at(-0.5, 0, LEN) };
  }

  ISO.add({
    name: "cambattery", title: "Camera battery (part)", compare: null,
    about: "A slim black lithium-ion camera battery, 4 × 1.5 × 5.5 cm: three gold contacts in a keyed window at one end, a latch slot, a printed 7.2 V label. anchors: contacts",
    line: "cambattery cx cy k aim=up|flat lab=0 lit=pack|contacts|label",
    demo: { line: "cambattery 480 360 46", script: [{ set: {}, hold: 1 }, { set: { lit: "contacts" }, hold: 1.2 }, { set: { lit: "label" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const b = packSvg(P, o.aim === "flat" ? "flat" : "up", lab);
      g.innerHTML = b.svg;
      g.anchors = { contacts: b.contacts };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) B31.light(w, g, p.lit); };
      g.update = () => false;
      g.readout = () => "camera battery · lithium-ion, 7.2 V · 4 × 1.5 × 5.5 cm · keyed so it fits only one way";
      B31.light(w, g, o.lit || "");
      return g;
    },
  });
})();
