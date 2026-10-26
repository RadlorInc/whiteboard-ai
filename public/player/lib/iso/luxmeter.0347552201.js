// "luxmeter cx cy k lux=0..2000 mount=post|stand lab=0 lit=sensor|case|display|post" — a PART (PARTS.md, batch 24):
// a school light meter, a grey case 8 wide (y) × 5 deep (x) × 6 cm tall, the sensor (a white diffuser dome in a black
// bezel) on its +x face looking at the light (on the bench light travels −x), the sensor's centre 3.5 cm over the post
// top (13.5 over the foot). On the +y face: the LCD with the reading in lux, ON and HOLD buttons, the range printed,
// four case screws. B24.mount: mount=post slides over a benchrider's post (origin = the post's top), mount=stand has its
// own 10 cm post and foot (origin = the bench). set({ lux }) changes the reading, eased like a real meter settling.
// Reused from polarisation.js (the light meter). World units: 1 = 1 cm. anchors: sensor top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 2.5, HY = 4, H = 6;
  const X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const CASE = ISO.tint("#e4e5e3", ["#9c9e9c", "#b0b2b0", "#c4c6c4", "#d4d6d4"], "#4a4c4a");
  const WHITE = ISO.tint("#ffffff", ["#cfd2d4", "#dcdfe1", "#e8eaeb", "#f3f4f5"], "#5a5e62");

  function caseSvg(P, zb, ZC) {
    const out = [], plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.6 };
    // a rubber foot band under the case, the case on it, the four screws on the +y face
    out.push(`<g data-name="case">${ISO.tinted(ISO.T.rubber, S(K.slabOf({ x: -HX - 0.05, y: -HY - 0.05, w: 2 * HX + 0.1, d: 2 * HY + 0.1, r: 0.65 }, zb, 0.5, P, 4, 0.1), { tone: "mid" }))}`);
    out.push(ISO.tinted(CASE, S(K.slabOf(plan, zb + 0.5, H - 0.5, P, 4, 0.25), { tone: "hi" })));
    out.push(D([[-HX + 0.5, zb + 0.9], [HX - 0.5, zb + 0.9], [-HX + 0.5, zb + H - 0.5], [HX - 0.5, zb + H - 0.5]].map(([x, z]) => K.iso([x, HY + 0.01, z], P)), { size: 0.3 }));
    // printed on the +y face
    out.push(window.LAB.faceText(P, [0, HY + 0.02, zb + 5.42], [1, 0, 0], "LIGHT METER", 0.32, "#3a3c3a"));
    // the buttons: ON (green) and HOLD, with their names
    for (const [x, name, tint] of [[-1.2, "ON", ISO.T.green], [1.2, "HOLD", ISO.T.steel]]) {
      out.push(ISO.tinted(tint, S(G.disc(HY, HY + 0.22, 0.42, Y([x, 0, ZC - 1.35]), P), { tone: "hi" })), window.LAB.faceText(P, [x, HY + 0.02, ZC - 2.12], [1, 0, 0], name, 0.3, "#3a3c3a"));
    }
    out.push(`</g>`);
    // the sensor on the +x face: bezel, diffuser dome
    const F = X([HX, 0, ZC]);
    out.push(`<g data-name="sensor">${ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.3, 1.9, F, P), { tone: "mid" }))}` +
      ISO.tinted(WHITE, S(G.lathe([[0.3, 0], [0.3, 1.45], [0.5, 1.2, 1], [0.62, 0]], F, P), { tone: "hi" })) + `</g>`);
    return out.join("");
  }
  // the LCD on the +y face: a black bezel, the grey-green glass, the digits and "lux"
  function lcdSvg(P, ZC, lux) {
    const y = HY + 0.015, at = (x, z) => K.iso([x, y, z], P), z0 = ZC - 0.35, z1 = ZC + 2.05;
    return `<g data-name="display"><path d="${K.pathOf([at(-2.05, z0 - 0.2), at(2.05, z0 - 0.2), at(2.05, z1 + 0.2), at(-2.05, z1 + 0.2)], true)}" fill="#26282b" stroke="#141517" stroke-width="0.5"/>` +
      `<path d="${K.pathOf([at(-1.8, z0), at(1.8, z0), at(1.8, z1), at(-1.8, z1)], true)}" fill="#bccbb4" stroke="#7d8a76" stroke-width="0.4"/>` +
      window.LAB.faceText(P, [0.2, y + 0.01, z0 + 0.45], [1, 0, 0], String(lux), 1.25, "#1d211b") +
      window.LAB.faceText(P, [1.45, y + 0.01, z0 + 0.25], [1, 0, 0], "lux", 0.34, "#1d211b") + `</g>`;
  }

  ISO.add({
    name: "luxmeter", title: "Light meter (part)", compare: null,
    about: "A light meter 8 × 5 × 6 cm: a white sensor dome facing +x (toward the light on the bench), an LCD with the reading in lux, ON and HOLD buttons; on a benchrider's post or its own stand, the sensor 13.5 cm over the foot; the reading eases to lux. anchors: sensor top",
    line: "luxmeter cx cy k lux=0..2000 mount=post|stand lab=0 lit=sensor|case|display|post",
    demo: { line: "luxmeter 480 470 22 mount=stand lux=400", script: [{ set: {}, hold: 1 }, { set: { lux: 200, lit: "display" }, hold: "settle" }, { set: { lux: 0, lit: "sensor" }, hold: "settle" }, { set: { lux: 400, lit: "case" }, hold: "settle" }, { set: { lit: "post" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", stand = o.mount === "stand";
      const m = window.B24.mount(P, stand), ZC = m.z0 + 3.5, zb = m.z0 + 0.6, w = ISO.writer();
      const st = { v: ISO.clamp(ISO.num(o, "lux", 0), 0, 2000) }; st.vT = st.v;
      let lit = o.lit || "";
      g.innerHTML = m.svg + caseSvg(P, zb, ZC) + `<g data-part="lcd"></g><g data-part="words"></g>`;
      g.anchors = { sensor: [HX + 0.62, 0, ZC], top: [0, 0, zb + H] };
      const el = LAB.parts(g);
      const draw = () => {
        const v = Math.round(st.v);
        w.rebuild(el.lcd, String(v), () => lcdSvg(P, ZC, v));
        if (lab) w.rebuild(el.words, "", () => LAB.word(P, lab, [0, 0, zb + H + 1.2], "light meter", "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.lux !== undefined && Number.isFinite(+p.lux)) st.vT = ISO.clamp(+p.lux, 0, 2000);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => { st.v = ISO.follow(st.v, st.vT, dt, 0.35, ISO.still()); if (Math.abs(st.v - st.vT) < 0.5) st.v = st.vT; draw(); return st.v !== st.vT; };
      g.readout = () => `light meter · ${Math.round(st.v)} lux on the sensor (1 lux = 1 lumen per square metre)`;
      draw();
      return g;
    },
  });
})();
