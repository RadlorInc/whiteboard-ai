// "pendantlamp cx cy k drop=20..120 on=0|1 lab=0 lit=canopy|cord|shade|socket" — a PART (PARTS.md): a ceiling pendant
// lamp, its origin the ceiling point it hangs from. A 12.4 cm steel canopy held to the ceiling box by two cap nuts on
// its side, a cord grip under it, a fabric cord `drop` cm long, a threaded nipple with a knurled ring that holds a
// 13 cm enamelled metal dome shade, and inside the shade a brass E26 keyless socket (cap, seam ring, shell). Anchor
// `socket` is the socket's centre contact, where a bulb's base contact goes, pointing down: a `lightbulb aim=down`
// placed there hangs from the socket with its base hidden in it. on=1 lights the shade's rim from inside and throws a
// warm cone of light below it. set({ on }). World units: 1 = 1 cm (z down from the ceiling).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const SHADE = ISO.tint("#6a7480", ["#2f353d", "#3a414a", "#465059", "#535d68"], "#15181c");
  const CORD = ISO.tint("#4a4d52", ["#25272b", "#2d3034", "#36393e", "#3f4247"], "#111214");
  const S0 = 4.4, SH = 0.866;   // the cord leaves the grip 4.4 cm below the ceiling; the shade profile's height scale
  // the shade from its top (s = 0): outer surface down to the rim
  const OUTER = [[0, 0.65], [0.05, 1.3], [0.25, 2.3, 1], [0.8, 3.3, 1], [1.8, 4.3, 1], [3.4, 5.3, 1], [5.4, 6.0, 1], [7.0, 6.3]];
  const RIM = 7.0 * SH;
  const geo = (drop) => { const T = S0 + drop + 0.9, C = T + 0.5, M = C + 5.3; return { T, C, M, contact: M - 2.62, rim: T + RIM }; };
  let uid = 0;

  function lampSvg(P, F, drop, id, part) {   // part 0: light, socket and shade; part 1: nipple, cord, canopy
    const { T, C, M, rim } = geo(drop), sc = (pts) => pts.map(([s, r, m]) => (m ? [T + s * SH, r, 1] : [T + s * SH, r]));
    const d0 = K.depthOf([0, 0, 0], P), view = [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0];
    const toward = G.angleToward(F, view);
    const out = [], k = G.scaleOf(P);
    if (part === 0) {
    // light under the shade: a warm cone from the rim, fading out
    const c0 = K.iso([0, 0, -rim], P), c1 = K.iso([0, 0, -rim - 14], P);
    out.push(`<defs><linearGradient id="${id}" x1="0" y1="${c0[1].toFixed(1)}" x2="0" y2="${c1[1].toFixed(1)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd87a" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></linearGradient></defs>`);
    out.push(`<path data-part="light" opacity="0" d="M${(c0[0] - 6.3 * k).toFixed(1)} ${c0[1].toFixed(1)}L${(c0[0] + 6.3 * k).toFixed(1)} ${c0[1].toFixed(1)}L${(c1[0] + 13 * k).toFixed(1)} ${c1[1].toFixed(1)}L${(c1[0] - 13 * k).toFixed(1)} ${c1[1].toFixed(1)}Z" fill="url(#${id})"/>`);
    // the socket (inside the shade, mostly hidden by it): cap, seam ring, shell, mouth lip
    out.push(`<g data-name="socket">${ISO.tinted(ISO.T.brass,
      S(G.lathe([[C + 5.0, 0], [C + 5.0, 1.98], [C + 5.3, 1.9], [C + 5.3, 0]], F, P, { steps: 24 }), { tone: "mid" }) +
      S(G.disc(C + 1.2, C + 5.0, 2.0, F, P, { steps: 24 }), { tone: "hi" }) +
      S(G.disc(C + 1.0, C + 1.2, 2.06, F, P, { steps: 24 }), { tone: "hi" }) +
      S(G.solidOf([[C, 0.7], [C + 0.3, 1.4, 1], [C + 0.7, 1.9, 1], [C + 1.0, 2.0]], F, P, { steps: 24 }), { tone: "hi" }))}</g>`);
    // the shade with its rolled rim bead (drawn closed: from above its inside never shows); lit, the bead's front glows warm from the bulb inside
    const bead = [[RIM / SH + 0.02, 6.32], [RIM / SH + 0.16, 6.42, 1], [RIM / SH + 0.32, 6.36, 1], [RIM / SH + 0.36, 6.22], [RIM / SH + 0.24, 6.16]];
    out.push(`<g data-name="shade">${ISO.tinted(SHADE, S(G.lathe(sc([[0, 0], ...OUTER, ...bead, [bead.at(-1)[0], 0]]), F, P, { steps: 44 }), { tone: "mid" }))}` +
      `<path data-part="rimlit" style="visibility:hidden" d="${G.arcOf(F, rim + 0.14 * SH, 6.42, P)}" fill="none" stroke="#f2a93b" stroke-width="${Math.max(0.6, k * 0.1).toFixed(2)}" stroke-linecap="round"/></g>`);
    return out.join("");
    }
    // the threaded nipple and its knurled ring on the shade's top
    out.push(ISO.tinted(ISO.T.brass, S(G.ringBand(T - 0.5, T, 0.45, 1.1, F, P, { steps: 36 }), { tone: "hi", inner: K.fadedSvg(G.ribsOf(F, T - 0.48, T - 0.02, 1.1, 24, P, { fade: [0.1, 0.5], seams: true }), { tone: "lo" }) }) +
      S(G.lathe([[T - 0.9, 0], [T - 0.9, 0.45], [T - 0.8, 0.5], [T - 0.7, 0.45], [T - 0.6, 0.5], [T - 0.5, 0.45], [T - 0.5, 0]], F, P, { steps: 24 }), { tone: "hi" })));
    // the cord, from the grip to the nipple
    out.push(`<g data-name="cord">${ISO.tinted(CORD, S(G.disc(S0, T - 0.9, 0.3, F, P, { steps: 20 }), { tone: "mid" }))}</g>`);
    // the cord grip: a knurled nut on the canopy's bottom and a rubber strain-relief cone
    out.push(`<g data-name="canopy">` + ISO.tinted(ISO.T.rubber, S(G.solidOf([[3.3, 0.72], [3.9, 0.55, 1], [S0 + 0.02, 0.4]], F, P, { steps: 24 }), { tone: "mid" })) +
      ISO.tinted(ISO.T.steel, S(G.disc(2.7, 3.3, 0.95, F, P, { steps: 32 }), { tone: "hi", inner: K.fadedSvg(G.ribsOf(F, 2.72, 3.28, 0.95, 20, P, { fade: [0.1, 0.5], seams: true }), { tone: "lo" }) })) +
      // the canopy cup, and its two cap nuts on the side facing us
      ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 6.2], [0.25, 6.2], [0.45, 6.05, 1], [1.2, 5.72, 1], [2.0, 4.9, 1], [2.5, 3.8, 1], [2.7, 2.4]], F, P, { steps: 44 }), { tone: "hi", inner: `<path d="${G.arcOf(F, 0.3, 6.19, P)}" fill="none" stroke="#8d9096" stroke-width=".5"/>` })));
    for (const a of [toward - 1.1, toward + 1.1]) {
      const at = G.pointOf(F, 1.1, 5.7, a), rad = G.radialOf(F, a), Fs = G.frameAlong(at, rad);
      out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[-0.1, 0.42], [0.12, 0.4, 1], [0.3, 0.28, 1], [0.38, 0.12]], Fs, P, { steps: 18 }), { tone: "hi" })));
    }
    out.push(`</g>`);
    return out.join("");
  }

  ISO.add({
    name: "pendantlamp", title: "Pendant lamp (part)", compare: null,
    about: "A ceiling pendant lamp: canopy with two cap nuts, cord grip, fabric cord, a metal dome shade on a threaded nipple, an E26 socket inside; on=1 lights the rim and throws warm light below. anchors: socket",
    line: "pendantlamp cx cy k drop=20..120 on=0|1 lab=0 lit=canopy|cord|shade|socket",
    demo: { line: "pendantlamp 480 50 8 drop=30", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { on: 0, lit: "shade" }, hold: "settle" }] },
    make([cx = 480, cy = 40, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", id = `plg${++uid}`;
      const drop = ISO.clamp(ISO.num(o, "drop", 40), 20, 120), F = G.frameAlong([0, 0, 0], [0, 0, -1]), gm = geo(drop);
      g.innerHTML = `<g data-part="lamp"><g data-part="low"></g><g data-part="high"></g></g><g data-part="words"></g>`;
      const el = { lamp: g.querySelector('[data-part="lamp"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const s = { on: o.on === "1", light: o.on === "1" ? 1 : 0 };
      let lit = o.lit || "";
      g.anchors.socket = [0, 0, -gm.contact];
      const sp = K.iso(g.anchors.socket, P);
      g.setAttribute("data-socket", `${sp[0].toFixed(2)},${sp[1].toFixed(2)}`);   // lightbulb.js finds the lamp by this
      const draw = () => {
        const light = el.lamp.querySelector('[data-part="light"]');
        if (light) { w.attr(light, "opacity", s.light.toFixed(2)); w.shown(el.lamp.querySelector('[data-part="rimlit"]'), s.light > 0.5); }
        w.rebuild(el.words, lab ? "1" : "", () => (lab ? ISO.word(K.iso([6.3, 0, -(gm.T + 3)], P), "pendant lamp", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') : ""));
        const parts = [...el.lamp.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.on !== undefined) s.on = String(p.on) === "1"; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const to = s.on ? 1 : 0;
        s.light = ISO.follow(s.light, to, dt, 0.12, ISO.still()); if (Math.abs(s.light - to) < 0.01) s.light = to;
        draw();
        return s.light !== to;
      };
      g.readout = () => `pendant lamp · cord ${drop} cm · shade 13 cm across · E26 socket ${s.on ? "· on" : "· off"}`;
      // the drawing in two slices: the shade end now, the canopy end in the next idle slice
      const piece = (i) => { el.lamp.children[i].innerHTML = lampSvg(P, F, drop, id, i); draw(); };
      piece(0);
      ISO.later(() => piece(1));
      return g;
    },
  });
})();
