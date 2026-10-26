// "bimetalstrip cx cy k t=20..300 lab=0 lit=brass|steel|rivets|contact" — a PART (PARTS.md, batch 5): the bimetallic
// strip of bimetal.js at real size, held level along +x, origin the middle of its held end (place it at= a
// retortstand's `clamp`; the first 1.5 cm sits in the jaws). 15 cm long, 1.5 cm wide: a 1 mm brass layer welded on a
// 1 mm steel layer, two rivets through the held end, a silver contact under the free end. Heated to t °C it curls
// toward the steel (down): brass expands 19, steel 12 µm per m per °C, so the curvature is κ = 1.5·Δα·ΔT ÷ 2 mm and the
// free end drops (1 − cos κs) ÷ κ, about 13 mm at 300 °C. The temperature follows t with a 2 s lag (it takes time to
// heat through). Anchors are where things are cold: `tip` is the contact's face. set({ t }). Built in mm (ISO.mm).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const LEN = 150, HELD = 15, HW = 7.5, T1 = 1, DA = 7e-6, ROOM = 20;
  const kOf = (T) => (1.5 * DA * Math.max(0, T - ROOM)) / (2 * T1);
  // the strip's centre line (the weld) and its normal at distance s along it: straight in the jaws, an arc beyond
  const at = (k, s) => {
    if (s <= HELD) return { x: s, z: 0, nx: 0, nz: 1 };
    const u = s - HELD, th = k * u;
    return k < 1e-9 ? { x: s, z: 0, nx: 0, nz: 1 } : { x: HELD + Math.sin(th) / k, z: -(1 - Math.cos(th)) / k, nx: Math.sin(th), nz: Math.cos(th) };
  };
  const dropOf = (k) => -at(k, LEN).z;

  function stripSvg(P, k) {
    const mid = [], up = [], lo = [];
    for (let i = 0; i <= 32; i++) {
      const s = i === 0 ? 0 : HELD + ((LEN - HELD) * (i - 1)) / 31, p = at(k, s);
      mid.push([p.x, p.z]); up.push([p.x + p.nx * T1, p.z + p.nz * T1]); lo.push([p.x - p.nx * T1, p.z - p.nz * T1]);
    }
    const out = [`<g data-name="steel">${ISO.prismY(P, [...mid, ...lo.slice().reverse()], -HW, HW, ["#8d9096", "#c7c9cd"], "#d9dadd", "#3c3f45")}</g>`];
    // the silver contact under the free end, square to the strip
    const e = at(k, LEN - 4), c = [e.x - e.nx * T1, 0, e.z - e.nz * T1], F = G.frameOf(c, [-e.nx, 0, -e.nz], [e.nz, 0, -e.nx], [0, 1, 0]);
    out.push(`<g data-name="contact">${ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 2.6], [0.9, 2.6], [1.5, 1.8, 1], [1.8, 0]], F, P), { tone: "hi" }))}</g>`);
    out.push(`<g data-name="brass">${ISO.prismY(P, [...up, ...mid.slice().reverse()], -HW, HW, ["#c9a85a", "#eed8a0"], "#f6e7bf", "#6b5114")}</g>`);
    return out.join("");
  }
  // two rivet heads on the held end (domed, steel), its tails show under the steel side
  const rivetsSvg = (P) => `<g data-name="rivets">${[-3.5, 3.5].map((y) => ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 2.2], [0.5, 2.1, 1], [1.1, 1.3, 1], [1.3, 0]], window.B08.Z([7.5, y, T1]), P), { tone: "hi" }))).join("")}</g>`;

  ISO.add({
    name: "bimetalstrip", title: "Bimetallic strip (part)", compare: null,
    about: "A bimetallic strip 15 × 1.5 cm, brass welded on steel, held at one end with two rivets and a contact under the free end; heated to t °C it curls toward the steel (down), about 13 mm at the free end at 300 °C. anchors: tip",
    line: "bimetalstrip cx cy k t=20..300 lab=0 lit=brass|steel|rivets|contact",
    demo: { line: "bimetalstrip 330 250 38", script: [{ set: {}, hold: 1 }, { set: { t: 300, lit: "brass" }, hold: "settle" }, { set: { lit: "steel" }, hold: 1 }, { set: { lit: "rivets" }, hold: 1 }, { set: { t: 20, lit: "contact" }, hold: "settle" }] },
    make([cx = 330, cy = 250, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const s = { T: ISO.clamp(ISO.num(o, "t", ROOM), ROOM, 300) };
      s.to = s.T;
      g.innerHTML = `<g data-part="strip"></g>${rivetsSvg(Pm)}<g data-part="words"></g>`;
      const tip = at(0, LEN - 4);
      g.anchors = { tip: [tip.x / 10, 0, -(T1 + 1.8) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      let lit = o.lit || "";
      const draw = () => {
        const k = kOf(Math.round(s.T * 2) / 2);   // redrawn every half degree (0.02 mm at the free end)
        w.rebuild(el.strip, k.toExponential(4), () => stripSvg(Pm, k));
        if (lab) w.rebuild(el.words, s.T.toFixed(0), () => CIRC.word(P, [LEN / 10, 0, -dropOf(k) / 10 + 0.3], `${s.T.toFixed(0)} °C`) + ISO.word(K.iso([6, -0.75, 0.2], P), "brass", "#8a6a10", { size: 12, dy: -8 }) + ISO.word(K.iso([6, 0.75, -0.2], P), "steel", "#4d5158", { size: 12, dy: 16 }));
        window.B08.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.t !== undefined && Number.isFinite(+p.t)) s.to = ISO.clamp(+p.t, ROOM, 300);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        s.T = ISO.follow(s.T, s.to, Math.min(dt, 0.25), 2, ISO.still());
        if (Math.abs(s.T - s.to) < 0.3) s.T = s.to;
        draw();
        return s.T !== s.to;
      };
      g.readout = () => `strip ${s.T.toFixed(0)} °C · free end bent ${dropOf(kOf(s.T)).toFixed(1)} mm toward the steel (brass expands 19, steel 12 µm per m per °C)${s.T <= ROOM + 0.5 ? " · cold: straight" : ""}`;
      draw();
      return g;
    },
  });
})();
