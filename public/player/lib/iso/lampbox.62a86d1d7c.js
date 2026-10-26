// "lampbox cx cy k x=-70..70 on=0|1 lab=0 lit=carriage|box|plate|arrow|lamp" — a PART (PARTS.md, batch 5): the object of
// raydiagram.js, a lamp box 8 × 8 × 10 cm with an arrow cut in its front plate, lit from inside, riding the optical
// bench on its own carriage; its origin the rail's top under the carriage (place it at=bench.zero ax=<cm>). The
// front plate faces −x (the bench's rule: the light travels −x, toward the lens); the arrow's foot is on the 13.5 cm
// beam axis and it stands 4 cm tall, so the lens makes an image of it on a screen. A painted steel frame with a clear
// acrylic back and near side (so the lit arrow is seen from behind), three vent slots in its lid, a rocker switch, a
// bulb on the floor and a maker's plate on the near rail, standing on a
// mounting plate on the rider's post (B03.rider). set({ x }) slides it along the rail (cm, eased).
// World units: 1 = 1 cm. anchors: tip foot (the arrow's tip and foot on the front plate) top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 4, HY = 4, Z0 = 9.6, Z1 = 19.3, BZ = 13.5, HO = 4, XF = -HX - 0.4;   // the arrow: foot BZ, HO tall
  const PAINT = ISO.tint("#e2e6ea", ["#7e8893", "#919aa4", "#a4acb5", "#b8bfc6"], "#2b333b");

  // The box is a painted steel frame (floor, lid, far side, the −x front plate and corner posts) with its +x back and
  // +y side in clear acrylic, so from the part camera (which sees the +x and +y faces) you look in past the lamp at
  // the inside of the front plate: the arrow cut through it, lit, seen from behind (world points on the plate's inner
  // face, so it comes out mirrored as it truly is from this side), and the lamp's warm light on the inner walls.
  const ACRYLIC = ISO.tint("#eef6fb", ["#c9dde9", "#d4e5ef", "#dfecf4", "#e8f2f8"], "#5d7f96");
  function boxSvg(P, on) {
    const out = [`<style>.lb-acr .iso-fill{fill-opacity:.16}.lb-acr .iso-shade,.lb-acr .iso-top{opacity:.22}</style>`];
    const XI = -HX + 0.3, quad = (pts, fill, op) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" fill-opacity="${op}" stroke="none"/>`;
    // the mounting plate on the post
    out.push(`<g data-name="carriage">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.95, 8.4, 0.8, P, 24, 0.1), { tone: "mid" }) + ISO.wbox(P, [-2.6, 2.6], [-2.6, 2.6], [9.2, Z0], "mid"))}</g>`);
    // far parts first: the front plate (its flange proud of the box on −x), the far side wall, the floor
    out.push(`<g data-name="plate">${ISO.tinted(ISO.T.plastic, ISO.wbox(P, [XF, XI], [-HY, HY], [Z0, Z1], "mid"))}</g>`);
    out.push(`<g data-name="box">${ISO.tinted(PAINT, ISO.wbox(P, [XI, HX], [-HY, -HY + 0.3], [Z0, Z1], "mid") + ISO.wbox(P, [XI, HX], [-HY + 0.3, HY], [Z0, Z0 + 0.3], "mid"))}</g>`);
    // the lamp's light on the inner walls: warm on the plate's inner face, the far wall and the floor
    const warm = on ? "#ffcf5a" : "#000000", wo = on ? 0.32 : 0.12;
    out.push(quad([[XI + 0.01, -HY + 0.3, Z0 + 0.3], [XI + 0.01, HY, Z0 + 0.3], [XI + 0.01, HY, Z1], [XI + 0.01, -HY + 0.3, Z1]], warm, wo) +
      quad([[XI, -HY + 0.31, Z0 + 0.3], [HX, -HY + 0.31, Z0 + 0.3], [HX, -HY + 0.31, Z1], [XI, -HY + 0.31, Z1]], warm, wo * 0.8) +
      quad([[XI, -HY + 0.3, Z0 + 0.31], [HX, -HY + 0.3, Z0 + 0.31], [HX, HY, Z0 + 0.31], [XI, HY, Z0 + 0.31]], warm, wo * 0.7));
    // the arrow cut through the plate, seen from inside: the opal glass behind the cut glows
    const a = (y, z) => K.iso([XI + 0.02, y, z], P), h = HO;
    const arrow = [[-0.25, BZ], [-0.25, BZ + h - 0.95], [-0.72, BZ + h - 0.95], [0, BZ + h], [0.72, BZ + h - 0.95], [0.25, BZ + h - 0.95], [0.25, BZ]].map(([y, z]) => a(y, z));
    out.push(`<g data-name="arrow"><path d="${K.pathOf(arrow, true)}" fill="${on ? "#fff4c8" : "#56606b"}" stroke="${on ? "#d79a1c" : "#2b333b"}" stroke-width="0.9" stroke-linejoin="round"/></g>`);
    // the lamp: a batten holder on the floor near the back and a 24 W bulb, glowing when on
    const bc = [2.2, -1.2, Z0 + 2.1], kS = G.scaleOf(P), c = K.iso(bc, P);
    out.push(`<g data-name="lamp">${ISO.tinted(ISO.T.plastic, S(K.cylinder(bc[0], bc[1], 0.8, Z0 + 0.3, 0.5, P, 20, 0.08), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.brass, S(K.cylinder(bc[0], bc[1], 0.45, Z0 + 0.8, 0.5, P, 16), { tone: "hi", crease: "none" })) +
      ISO.tinted(on ? ISO.T.amber : ISO.T.glass, S(G.sphereOf(bc, 0.85, P), { tone: "hi" })) +
      (on ? `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(kS * 2.2).toFixed(1)}" fill="#ffd36a" fill-opacity=".22"/><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(kS * 1.2).toFixed(1)}" fill="#fff3c4" fill-opacity=".35"/>` : "") + `</g>`);
    // near parts: corner posts, the lid with its vents and switch, the near side's bottom rail with the plate
    const glow = on ? "#ffd36a" : "#2c3b4c", vents = [];
    for (let i = 0; i < 3; i++) vents.push(K.planOutline({ x: -2.4 + i * 1.9, y: -2.6, w: 0.7, d: 5.2, r: 0.35 }, Z1 + 0.31, P, 3));
    const sy = HY + 0.01, at = (x, z) => K.iso([x, sy, z], P);
    out.push(`<g data-name="box">${ISO.tinted(PAINT, ISO.wbox(P, [HX - 0.3, HX], [-HY + 0.3, -HY + 0.6], [Z0 + 0.3, Z1], "mid") + ISO.wbox(P, [XI, XI + 0.3], [HY - 0.3, HY], [Z0 + 0.3, Z1], "mid") +
      ISO.wbox(P, [XI + 0.3, HX], [HY - 0.3, HY], [Z0, Z0 + 1.4], "mid") + ISO.wbox(P, [HX - 0.3, HX], [HY - 0.3, HY], [Z0 + 0.3, Z1], "mid") +
      ISO.wbox(P, [XF, HX], [-HY, HY], [Z1, Z1 + 0.3], "mid"))}` +
      `<path d="${vents.join("")}" fill="${glow}" fill-opacity="${on ? 0.9 : 0.55}" stroke="#2b333b" stroke-width="0.5"/>` +
      ISO.tinted(ISO.T.plastic, ISO.wbox(P, [2.2, 3.4], [1.6, 3.2], [Z1 + 0.3, Z1 + 0.6], "mid") + ISO.wbox(P, [2.5, 3.1], [2.4, 3.0], [Z1 + 0.6, Z1 + 1.0], "hi")) +
      `<path d="${K.pathOf([at(-2.4, Z0 + 0.2), at(1.4, Z0 + 0.2), at(1.4, Z0 + 1.2), at(-2.4, Z0 + 1.2)], true)}" fill="#eef0f2" stroke="#55534c" stroke-width="0.5"/>` +
      window.LAB.faceText(P, [-0.5, sy + 0.01, Z0 + 0.5], [1, 0, 0], "OBJECT 12 V 24 W", 0.42, "#33506f") + `</g>`);
    // the clear acrylic back (+x) and near side (+y), held by screws in the posts
    out.push(`<g data-name="box"><g class="lb-acr" style="${ACRYLIC}">${ISO.wbox(P, [HX, HX + 0.15], [-HY + 0.3, HY - 0.3], [Z0 + 0.3, Z1], "hi")}${ISO.wbox(P, [XI + 0.3, HX - 0.3], [HY, HY + 0.15], [Z0 + 1.4, Z1], "hi")}</g>` +
      D([[HX + 0.16, -HY + 0.45, Z0 + 0.7], [HX + 0.16, -HY + 0.45, Z1 - 0.4], [HX - 0.15, HY + 0.16, Z0 + 1.8], [HX - 0.15, HY + 0.16, Z1 - 0.4], [XI + 0.15, HY + 0.16, Z0 + 1.8], [XI + 0.15, HY + 0.16, Z1 - 0.4]].map((p) => K.iso(p, P)), { size: 0.4 }) + `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "lampbox", title: "Lamp box object on a carriage (part)", compare: null,
    about: "A lamp box 8 × 8 × 10 cm with a lit 4 cm arrow cut in its front plate (foot on the 13.5 cm beam axis, facing −x toward the lens), on a rider that slides along an optical bench. anchors: tip foot top",
    line: "lampbox cx cy k x=-70..70 on=0|1 lab=0 lit=carriage|box|plate|arrow|lamp",
    demo: { line: "lampbox 470 450 18", script: [{ set: {}, hold: 1 }, { set: { lit: "arrow" }, hold: 1.3 }, { set: { lit: "lamp" }, hold: 1.1 }, { set: { x: 6, lit: "carriage" }, hold: "settle" }, { set: { x: 0, lit: "box" }, hold: "settle" }] },
    make([cx = 470, cy = 450, k = 3], o, t, parent) {
      const B03 = window.B03, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", on = o.on !== "0", w = ISO.writer();
      const st = { x: ISO.clamp(ISO.num(o, "x", 0), -70, 70) }, want = { x: st.x }, r = B03.rider(P, 8.6);
      let lit = o.lit || "";
      g.innerHTML = `<g data-part="move"><g data-name="carriage">${r.carriage}${r.screw}${r.post}</g>${boxSvg(P, on)}` +
        `<g data-part="words">${LAB.word(P, lab, [0, 0, Z1 + 1.6], on ? "object (lit arrow)" : "object", "#556")}</g></g>`;
      const el = LAB.parts(g);
      const draw = () => {
        w.attr(el.move, "transform", K.translateAlong(P, [st.x, 0, 0]));
        const x = +st.x.toFixed(3);
        g.anchors = { tip: [x + XF, 0, BZ + HO], foot: [x + XF, 0, BZ], top: [x, 0, Z1 + 0.3] };
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.x !== undefined && Number.isFinite(+p.x)) want.x = ISO.clamp(+p.x, -70, 70);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.x = ISO.follow(st.x, want.x, dt, 0.4, ISO.still());
        if (Math.abs(st.x - want.x) < 0.01) st.x = want.x;
        draw();
        return st.x !== want.x;
      };
      g.readout = () => `lamp box object ${on ? "lit" : "off"} · arrow 4 cm tall, its foot on the 13.5 cm axis, facing −x · ${st.x >= 0 ? "+" : ""}${st.x.toFixed(1)} cm along the rail`;
      draw();
      return g;
    },
  });
})();
