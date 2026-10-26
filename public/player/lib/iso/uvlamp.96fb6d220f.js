// "uvlamp cx cy k on=0..1 value=1..100 lab=0 lit=base|hood|tube|note|switch" — a PART (batch 6, money): a small
// counterfeit-note checker on a shop counter, its origin the counter point under its middle, open toward the room (+y).
// 20 × 15 × 12 cm: a white plastic base with a dark matte inspection plate, a back wall rising to a hood, and under
// the hood's front lip a violet UV tube in two end holders; a rocker switch on the base. A generic banknote (the
// cashnote artwork, 15 × 7 cm, its value printed) lies on the plate. on 0 → 1 switches the lamp on: the tube lights
// violet, the plate and note go dim in its light, and the note's hidden security strip and a small star glow bright
// green-blue (a real note's paper stays dull under UV; the hidden print is what is hard to copy). set({ on, value }).
// World: 1 = 1 cm. anchors: plate (the note's middle)
(() => {
  const K = window.K, G = window.G;
  const HX = 10, HY = 7.5, ZB = 1.5, NW = 15, NH = 7;
  const WHITE = ISO.tint("#f7f8fa", ["#c3c7cd", "#d1d4d9", "#dee1e5", "#e9ebee"], "#4a5058");
  // the back wall and hood in (y, z): an upside-down L
  const HOOD = [[-HY, ZB], [-HY + 2, ZB], [-HY + 2, 10], [3.5, 10], [3.5, 9.2], [4.6, 9.2], [4.6, 12], [-HY, 12]];
  ISO.add({
    name: "uvlamp", title: "UV note checker (part)", compare: null,
    about: "A small UV fake-note checker, 20 × 15 × 12 cm: a violet UV tube under a hood over a plate with a banknote on it; on lights the tube and the note's hidden strip glows (why real notes are hard to copy). anchors: plate",
    line: "uvlamp cx cy k on=0..1 value=1..100 lab=0 lit=base|hood|tube|note|switch",
    demo: { line: "uvlamp 480 380 22 on=0 value=20 lab=1", script: [{ set: { lit: "note" }, hold: 1.2 }, { set: { on: 1, lit: "tube" }, hold: "settle" }, { set: { lit: "" }, hold: 1.5 }, { set: { on: 0, lit: "switch" }, hold: "settle" }, { set: { value: 50, on: 1, lit: "hood" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1", S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { on: B.num(o, "on", 0, 0, 1), value: Math.round(B.num(o, "value", 20, 1, 100)), lit: o.lit || "" };
      st.want = st.on;
      const at = (p) => K.iso(p, P), kS = G.scaleOf(P), NY = -0.5;
      const quad = (x0, x1, y0, y1, z) => K.pathOf([at([x0, y0, z]), at([x1, y0, z]), at([x1, y1, z]), at([x0, y1, z])], true);
      const base = ISO.tinted(ISO.T.rubber, [[-HX + 1.5, -HY + 1.5], [HX - 1.5, -HY + 1.5], [-HX + 1.5, HY - 1.5], [HX - 1.5, HY - 1.5]].map(([x, y]) => S(K.cylinder(x, y, 0.8, -0.4, 0.4, P, 12), { tone: "lo" })).join("")) +
        ISO.tinted(WHITE, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.8 }, 0, ZB, P, 4, 0.2), { tone: "mid" })) +
        `<path d="${quad(-HX + 1, HX - 1, -HY + 2.2, HY - 1, ZB + 0.01)}" fill="#2b2d33" stroke="#15161a" stroke-width="0.6"/>` +
        `<g transform="${B.plane(P, [-HX, HY + 0.02, ZB], [1, 0, 0], [0, 0, -1])}">${B.text(HX, 1.05, "UV NOTE CHECK", 0.75, "#6a7079", "middle", 700)}</g>`;
      const hood = ISO.tinted(WHITE, ISO.prismX(P, HOOD, -HX, HX, ["#c3c7cd", "#f7f8fa"], "#eceef0", "#4a5058")) +
        `<g transform="${B.plane(P, [-HX, 4.62, 12], [1, 0, 0], [0, 0, -1])}"><rect x="1" y="0.55" width="${2 * HX - 2}" height="1.7" rx=".3" fill="#5b2a91"/>${B.text(HX, 1.8, "UV  365 nm", 1.1, "#f2e9ff", "middle", 800)}</g>`;
      const noteM = B.plane(P, [-NW / 2, NY - NH / 2, ZB + 0.02], [1, 0, 0], [0, 1, 0]);
      // the rocker switch at the base's front right: its seat and the rocker tilted toward the side that is pressed
      const sw = (on) => { const tilt = on ? 0.35 : -0.35; return ISO.tinted(ISO.T.plastic, ISO.wbox(P, [HX - 2.4, HX - 0.6], [HY - 1.9, HY - 0.5], [ZB, ZB + 0.3], "lo")) + ISO.tinted(on ? ISO.T.red : ISO.T.plastic, ISO.box((u, w, v) => [u, v, w + (v - (HY - 1.2)) * tilt], P, [HX - 2.2, HX - 0.8], [ZB + 0.3, ZB + 0.8], [HY - 1.7, HY - 0.7], "mid")); };
      // the tube: two end holders down from the lip, the glass tube between, lit violet by `on`
      const tubeSvg = (on) => {
        const F = LAB.X([0, 4.1, 8.4]), glass = B.mix("#ece8f3", "#b77bff", on), out = [];
        if (on > 0.02) out.push(`<path d="${K.pathOf([at([-7.5, 4.1, 8.4]), at([7.5, 4.1, 8.4])])}" stroke="#9b4dff" stroke-width="${(kS * 3.2).toFixed(2)}" stroke-linecap="round" opacity="${(0.28 * on).toFixed(2)}"/>`,
          `<path d="${K.pathOf([at([-7.5, 4.1, 8]), at([7.5, 4.1, 8]), at([NW / 2, NY + NH / 2, ZB]), at([-NW / 2, NY + NH / 2, ZB])], true)}" fill="#8f3dff" opacity="${(0.1 * on).toFixed(2)}"/>`);
        out.push(ISO.tinted(ISO.tint(glass, [B.mix(glass, "#000000", 0.25), B.mix(glass, "#000000", 0.15), B.mix(glass, "#000000", 0.07), glass], on > 0.5 ? "#5b2a91" : "#6f6a7a"), S(G.disc(-7.6, 7.6, 0.6, F, P), { tone: "mid" })));
        out.push(ISO.tinted(WHITE, [-8.4, 8.4].map((x) => ISO.wbox(P, [x - 0.8, x + 0.8], [3.4, 4.8], [7.6, 9.2], "mid")).join("")));
        return out.join("");
      };
      const noteSvg = (on, value) => `<g transform="${noteM}">${B.note(NW, NH, value)}<rect width="${NW}" height="${NH}" fill="#2a1450" opacity="${(0.55 * on).toFixed(2)}"/>${on > 0.02 ? B.note(NW, NH, value, false, on).split("<rect").filter((x) => /7dffb8/.test(x)).map((x) => "<rect" + x).join("") + `<path d="${B.star(NW * 0.2, NH * 0.62, NH * 0.12)}" fill="#a8f5ff" opacity="${(0.85 * on).toFixed(2)}"/>` : ""}</g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1 }, 0, 12, P)}"/>` +
        `<g data-name="base">${base}</g><g data-name="note" data-part="note"></g><g data-name="switch" data-part="sw"></g><g data-name="hood">${hood}</g><g data-name="tube" data-part="tube"></g><g data-part="words"></g>`;
      g.anchors = { plate: [0, NY, ZB] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.on * 40) / 40;
        w.rebuild(el.note, `${q} ${st.value}`, () => noteSvg(q, st.value));
        w.rebuild(el.tube, `${q}`, () => tubeSvg(q));
        w.rebuild(el.sw, `${st.want > 0.5}`, () => sw(st.want > 0.5));
        if (lab) w.rebuild(el.words, `${st.want > 0.5}`, () => ISO.word(at([HX + 1, 0, 6]), st.want > 0.5 ? "hidden strip glows" : "UV lamp off", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) st.want = B.num(p, "on", st.want, 0, 1);
        if (p.value !== undefined) st.value = Math.round(B.num(p, "value", st.value, 1, 100));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // a UV tube warms up over a moment and goes out quickly
      g.update = (dt) => {
        st.on = ISO.follow(st.on, st.want, dt, st.want > st.on ? 0.25 : 0.1, ISO.still());
        if (Math.abs(st.on - st.want) < 0.01) st.on = st.want;
        draw();
        return st.on !== st.want;
      };
      g.readout = () => `UV note checker · lamp ${st.want > 0.5 ? "on: the note's hidden strip glows" : "off"} · note of ${st.value}`;
      draw();
      return g;
    },
  });
})();
