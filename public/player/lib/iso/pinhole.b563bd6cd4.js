// "pinhole cx cy width d=25 lab=1 lit=…" — a pinhole camera on a bench, its near side cut away, and a candle.
// Light from each point of the candle passes straight through the pinhole and lands on the tracing-paper screen at the
// back, so the image is upside down and its height is h × (screen distance ÷ candle distance). The box is 15 cm long and
// the candle 12.5 cm tall. set({ d: cm }) slides the candle along the bench.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CM = 4, BOX = 60, ZH = 27, BOARD = { x: -226, y: -46, w: 310, d: 92, r: 7 }, HC = [2, 40, 52];   // candle: base, wax top, flame tip
  const wb = (P, x, y, z, tone = "mid") => ISO.wbox(P, x, y, z, tone);
  const flame = (P, x, z0, z1, k = 1) => {
    const h = z1 - z0, pts = [];
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * 2 * Math.PI, r = Math.sin(a / 2), y = Math.sin(a) * 3.4 * k * (1 - Math.cos(a / 2) * 0.3); pts.push([x, y, z0 + h * (1 - Math.cos(a)) * 0.5 * (0.35 + 0.65 * r)]); }
    return pts;
  };
  const rayLine = (P, pts, color, w = 1.2, op = 1) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;

  function benchSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: 30, y: -40, w: 40, d: 14, r: 1.2 })];
    // A scale strip from the pinhole toward the candle, centimetres from the hole (major every 5 cm).
    const strip = { x: -214, y: 26, w: 212, d: 8, r: 1 };
    out.push(S(K.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
    const minor = [], major = [];
    for (let c = 0; c * CM <= 208; c++) (c % 5 ? minor : major).push(K.lineOnTop([-c * CM - 2, strip.y + 0.6], [-c * CM - 2, strip.y + 0.6 + (c % 5 ? 2.2 : 4)], 0.6, P));
    out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }), L(K.lineOnTop([-2, strip.y], [-2, strip.y + strip.d], 0.6, P), { tone: "hi" }));
    return out.join("");
  }
  function cameraSvg(P) {
    const out = [];
    // Camera: two feet, then the walls behind the light (floor, far wall, roof, the front wall with the pinhole).
    out.push(`<g data-name="camera">`);
    for (const x of [6, 50]) out.push(wb(P, [x - 4, x + 4], [-20, 20], [0, 4]));
    out.push(ISO.tinted(ISO.T.plastic, wb(P, [-2, BOX], [-24, 24], [4, 6], "hi") + wb(P, [-2, BOX], [-24, -22], [6, 58], "hi") + wb(P, [-2, 0], [-22, 24], [6, 58], "hi")));
    out.push(`<path d="${K.pathOf(Array.from({ length: 16 }, (_, k) => K.iso([0.05, Math.cos((k / 16) * 6.283) * 2.4, ZH + Math.sin((k / 16) * 6.283) * 2.4], P)), true)}" fill="#8a8f96" stroke="#55575c" stroke-width="0.5"/>`, D([K.iso([0.06, 0, ZH], P)], { size: 0.9, tone: "lo" }));
    out.push(`</g>`);
    return out.join("");
  }
  // Near side: roof, the strip left of the cut-away near wall, and the paper screen in its frame at the back.
  function frontSvg(P) {
    const out = [`<g data-name="camera">`, ISO.tinted(ISO.T.plastic, wb(P, [-2, BOX], [-24, 24], [58, 60], "hi") + wb(P, [-2, BOX - 2], [22, 24], [6, 10], "hi") + wb(P, [-2, BOX - 2], [22, 24], [54, 58], "hi")), D([[2, -21], [BOX - 3, -21], [2, 21], [BOX - 3, 21], [BOX / 2, -21], [BOX / 2, 21]].map(([x, y]) => K.iso([x, y, 60], P)), { size: 0.55, tone: "hi" }), `</g>`];
    out.push(`<g data-name="screen">`, ISO.tinted(ISO.T.plastic, wb(P, [BOX - 2, BOX], [-24, 24], [4, 8], "hi") + wb(P, [BOX - 2, BOX], [-24, 24], [56, 60], "hi") + wb(P, [BOX - 2, BOX], [-24, -20], [8, 56], "hi") + wb(P, [BOX - 2, BOX], [20, 24], [8, 56], "hi")));
    out.push(`<path d="${K.pathOf([[BOX - 1, -20, 8], [BOX - 1, 20, 8], [BOX - 1, 20, 56], [BOX - 1, -20, 56]].map((p) => K.iso(p, P)), true)}" fill="#f4efe2" fill-opacity=".72" stroke="#8a8f96" stroke-width="0.5"/>`, `</g>`);
    return out.join("");
  }
  function candleSvg(P, x, gl) {
    const out = [S(K.cylinder(x, 0, 10, 0, 1.4, P, 32, 0.4), { tone: "mid" }), S(K.cylinder(x, 0, 5.5, 1.4, 1.2, P, 24), { tone: "mid" })];
    out.push(ISO.tinted(ISO.tint("#fbf3df", ["#e3d3ae", "#ead9b8", "#f0e2c6", "#f5ead3"], "#8a7340"), S(K.cylinder(x, 0, 5, HC[0] + 0.6, HC[1] - HC[0] - 0.6, P, 24), { tone: "hi" })));
    out.push(`<path d="${K.segment([x, 0, HC[1]], [x, 0, HC[1] + 2], P)}" stroke="#2a2b2f" stroke-width="0.9"/>`);
    if (!gl) out.push(`<path d="${K.pathOf(flame(P, x, HC[1] + 0.5, HC[2]).map((p) => K.iso(p, P)), true)}" fill="#f6b73c" stroke="#d9861a" stroke-width="0.5"/>`, `<path d="${K.pathOf(flame(P, x, HC[1] + 1.5, HC[2] - 4, 0.5).map((p) => K.iso(p, P)), true)}" fill="#fff3c4"/>`);
    return out.join("");
  }

  ISO.add({
    name: "pinhole", title: "Pinhole camera", compare: "pinhole 480 280 440",
    about: "A candle and a pinhole camera cut open: rays cross at the hole, so the image on the paper screen is upside down and h × 15 cm ÷ d tall.",
    line: "pinhole cx cy width d=25 lab=1 lit=camera|screen|candle",
    demo: { line: "pinhole 480 280 460", script: [{ set: { d: 20 }, hold: "settle" }, { set: { d: 34 }, hold: "settle" }, { set: { d: 48 }, hold: "settle" }, { set: { d: 25 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.72;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [0, -24, 62], [-200, 0, 56]], cx, cy, W, H, { azimuth: 40, elevation: 24 }, parent);
      const s = { d: ISO.clamp(ISO.num(o, "d", 25), 18, 52) }; s.dT = s.d;
      g.innerHTML = `<g>${benchSvg(P)}</g><g data-part="candle" data-name="candle"></g><g data-part="out"></g><g>${cameraSvg(P)}</g><g data-part="in"></g><g>${frontSvg(P)}</g><g data-part="image"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "screen";
      // the candle flame and its image on the screen as one shader layer: each screen point is traced back through the
      // pinhole to the point of the flame it sees, so the image is the same flicker, upside down and m times as big
      const fx = ISO.gl(g, P, W, H, el.image, `uniform float uX;uniform float uM;
        const float ZH=${ZH.toFixed(1)},WZ=${(HC[1] + 0.5).toFixed(1)},SX=${(BOX - 0.95).toFixed(2)};
        void main(){vec2 vb=viewOf(gl_FragCoord.xy);
          vec4 c=flameInk(vb,vec3(uX,0.,WZ),vec3(0.,0.,1.),7.,0.,uTime);
          vec3 q=onWallX(vb,SX);float px=pixelOf()/uCam.w;
          float inside=window(q.y,-20.,20.,.7*px)*window(q.z,8.,56.,.7*px);
          vec4 im=flameUS(-q.y/uM,ZH-(q.z-ZH)/uM-WZ,7.,0.,uTime);
          c=over(c,vec4(im.rgb,im.a)*.75*inside);
          gl_FragColor=finish(c);}`, ["uX", "uM"]);
      const draw = () => {
        const x = -s.d * CM, m = BOX / (s.d * CM), img = (z) => ZH - (z - ZH) * m, key = s.d.toFixed(3);
        if (fx) fx.set({ uX: x, uM: m });
        w.rebuild(el.candle, key, () => candleSvg(P, x, !!fx));
        w.rebuild(el.out, key, () => rayLine(P, [[x, 0, HC[2] - 1], [0, 0, ZH]], "#e09a00", 1.3) + rayLine(P, [[x + 4, 0, HC[0] + 2], [0, 0, ZH]], "#b07a2a", 1.1, 0.8));
        w.rebuild(el.in, key, () => rayLine(P, [[0, 0, ZH], [BOX - 1, 0, img(HC[2] - 1)]], "#e09a00", 1.3) + rayLine(P, [[0, 0, ZH], [BOX - 1, 0, img(HC[0] + 2)]], "#b07a2a", 1.1, 0.8));
        w.rebuild(el.image, key, () => {
          const at = (y, z) => K.iso([BOX + 0.05, y * m, img(z)], P);
          const body = K.pathOf([[-5, HC[0] + 0.6], [5, HC[0] + 0.6], [5, HC[1]], [-5, HC[1]]].map(([y, z]) => at(y, z)), true);
          const fl = K.pathOf(flame(P, 0, HC[1] + 0.5, HC[2]).map(([, y, z]) => at(y, z)), true);
          return `<g opacity=".85"><path d="${body}" fill="#ecdcb6" stroke="#b49a62" stroke-width="0.5"/>${fx ? "" : `<path d="${fl}" fill="#f6b73c"/>`}</g>`;
        });
        w.rebuild(el.words, lab ? key : "", () => !lab ? "" :
          ISO.word(K.iso([x, 0, HC[2]], P), "candle", "#555", { size: 14, dy: -10 }) + ISO.word(K.iso([BOX, 24, 0], P), "upside-down image", "#8a5a10", { size: 14, anchor: "start", dy: 16 }) +
          ISO.word(K.iso([0, 24, 60], P), "pinhole", "#555", { size: 14, dy: -8 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.d !== undefined) s.dT = ISO.clamp(+p.d, 18, 52); if (p.lit) lit = p.lit; };
      g.update = (dt) => { s.d = ISO.follow(s.d, s.dT, dt, 0.6, ISO.still()); draw(); return s.d !== s.dT; };
      g.readout = () => {
        const h = (HC[2] - HC[0]) / CM, di = BOX / CM;
        return `candle ${h} cm tall, ${s.d.toFixed(0)} cm from the hole · screen ${di} cm behind · image = ${h} × ${di} ÷ ${s.d.toFixed(0)} = ${((h * di) / s.d).toFixed(1)} cm, upside down`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
