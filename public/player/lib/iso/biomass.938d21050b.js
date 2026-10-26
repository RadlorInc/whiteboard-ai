// "biomass cx baseY width lab=0|1 run=0|1 grow=0-1 lit=fuel|boiler|chimney|generator|trees" — a biomass power plant.
// Fuel that grew recently: a stack of logs and round straw bales, carried up the conveyor into the boiler house,
// where it burns (seen through the cut-away wall: the fire and the water tubes) and boils water; the steam spins a
// turbine and generator in the hall beside it, and the power leaves by the transformer and pole. The smoke from the
// chimney carries CO₂, drifting over the young forest; as the replanted trees grow (grow=) they take that carbon back
// out of the air. Burning a tonne of dry wood gives about 1.8 t of CO₂, the same amount the tree took in while it
// grew, so the cycle is close to even only while the forest is replanted. lab=0 hides its words.
// set({ run, grow, lit }). World units: 1 = 1 m.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const SITE = { x: -42, y: -15, w: 84, d: 30, r: 2 }, CH = [1, -10], CHH = 30, GZ = 1;
  const BRICK = ISO.tint("#f1e3d6", ["#c9a88f", "#d4b6a0", "#dec4b1", "#e8d3c3"], "#6e4a32"), CONC = ISO.tint("#ecebe6", ["#bdbbb3", "#c9c7bf", "#d5d3cc", "#e0ded8"], "#6a685f");
  const LEAF = ISO.tint("#dcefd4", ["#6fa860", "#82b673", "#96c488", "#acd29f"], "#2c5a22"), BARK = ISO.tint("#e8d6bf", ["#9a7650", "#a8855f", "#b6946f", "#c4a481"], "#4a3018");
  const TREES = [[25, -8, 1.0], [31, -2, 0.85], [27, 5, 0.95], [36, -9, 0.8], [36, 4, 1.05], [21, 1, 0.7]];

  function fuelSvg(P) {
    const out = [`<g data-name="fuel">`];
    // logs: three, two, one, stacked along y between two stakes, their cut ends showing rings
    const logs = []; [[0, 3], [1, 2], [2, 1]].forEach(([row, n]) => { for (let i = 0; i < n; i++) logs.push([-34 + (i - (n - 1) / 2) * 1.3, GZ + 0.62 + row * 1.12]); });
    for (const x of [-36.5, -31.5]) out.push(ISO.tinted(BARK, S(K.cylinder(x, 3.4, 0.14, GZ, 3.4, P, 8), { tone: "mid", crease: "none" })));
    for (const [x, z] of logs.sort((a, b) => a[1] - b[1] || K.depthOf([a[0], 0, 0], P) - K.depthOf([b[0], 0, 0], P))) {
      const F = yAx([x, -3, z]);
      out.push(ISO.tinted(BARK, S(G.disc(0, 6.2, 0.62, F, P, { steps: 20 }), { tone: "mid" })));
      out.push(`<path d="${G.circleOf(F, 6.21, 0.4, P, 16)}" fill="none" stroke="#b6946f" stroke-width=".5"/>`);
    }
    // two round straw bales
    for (const [x, y] of [[-27, -6], [-27, 2]]) {
      const F = yAx([x, y, GZ + 1]);
      out.push(ISO.tinted(ISO.T.amber, S(G.lathe([[0, 0], [0, 0.9], [0.1, 1], [2.2, 1], [2.3, 0.9], [2.3, 0]], F, P, { steps: 28 }), { tone: "mid" })));
      out.push(`<path d="${G.circleOf(F, 2.31, 0.6, P, 20) + G.circleOf(F, 2.31, 0.3, P, 14)}" fill="none" stroke="#c99a3a" stroke-width=".5"/>`);
    }
    return out.join("") + "</g>";
  }
  function conveyorSvg(P) {
    const A = [-22, 0, GZ + 0.5], B = [-8, 0, GZ + 15], at = (u, w, v) => [A[0] + (B[0] - A[0]) * u, w, A[2] + (B[2] - A[2]) * u + v], out = [];
    for (const u of [0.3, 0.7]) { const p = at(u, 0, 0); out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [p[0] - 0.25, p[0] + 0.25], [-0.25, 0.25], [GZ, p[2] - 0.6], "mid"))); }
    out.push(ISO.tinted(ISO.T.steel, ISO.box(at, P, [0, 1], [-1, 1], [-0.6, 0.2], "mid")));
    return out.join("");
  }
  function plantSvg(P) {
    const out = [`<g data-name="boiler">${ISO.tinted(BRICK, ISO.wbox(P, [-8, 6], [-8, 6], [GZ, 20], "mid"))}${ISO.tinted(BRICK, ISO.wbox(P, [-8.4, 6.4], [-8.4, 6.4], [20, 21], "mid"))}`];
    const face = (pts, fill, ink, w = 0.6) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 6.03, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}"/>`;
    out.push(face([[-5.5, 3], [3.5, 3], [3.5, 15], [-5.5, 15]], "#2a2422", "#1a1412", 0.8), "</g>");
    // the turbine hall with its roof lantern, the transformer and the pole
    out.push(`<g data-name="generator">${ISO.tinted(CONC, ISO.wbox(P, [7, 18], [-6, 4], [GZ, 9], "mid"))}${ISO.tinted(CONC, ISO.wbox(P, [9, 16], [-2.5, 0.5], [9, 10.2], "mid"))}</g>`);
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [13, 16], [5, 8], [GZ, 3.4], "mid")));
    out.push(ISO.tinted(ISO.T.wood, S(K.cylinder(18.5, 7, 0.16, GZ, 9, P, 12), { tone: "mid" })) + ISO.tinted(ISO.T.wood, ISO.wbox(P, [18.42, 18.58], [6, 8], [GZ + 8.2, GZ + 8.4], "mid")));
    return out.join("");
  }
  function chimneySvg(P) {
    const F = zAx([CH[0], CH[1], 0]);
    return `<g data-name="chimney">${ISO.tinted(CONC, S(K.cylinder(CH[0], CH[1], 2.4, GZ, 1, P, 24), { tone: "mid" }))}${ISO.tinted(CONC, S(G.lathe([[GZ + 1, 0], [GZ + 1, 1.5], [CHH, 1.0], [CHH, 0]], F, P, { steps: 28 }), { tone: "hi" }))}<path d="${G.circleOf(F, CHH + 0.02, 0.75, P, 20)}" fill="#3a3e44"/></g>`;
  }
  function tubesFireSvg(P, f, t) {
    const face = (q, fill, op) => `<path d="${K.pathOf(q.map(([x, z]) => K.iso([x, 6.04, z], P)), true)}" fill="${fill}" opacity="${op}"/>`;
    const pts = (h, k) => { const p = []; for (let i = 0; i <= 14; i++) { const x = -5 + (8 * i) / 14; p.push([x, 3.5 + h * (0.5 + 0.5 * Math.sin(i * 1.4 + t * 7 + k)) * (0.5 + 0.5 * Math.sin((Math.PI * i) / 14))]); } return [[3, 3.5], [-5, 3.5], ...p]; };
    const out = f > 0.01 ? [face([[-5.5, 3], [3.5, 3], [3.5, 15], [-5.5, 15]], "#ff9a3a", (0.25 * f).toFixed(2)), face(pts(7 * f, 0), "#ff8a1a", (0.85 * f).toFixed(2)), face(pts(4 * f, 2), "#ffd25a", (0.9 * f).toFixed(2))] : [];
    const tl = []; for (let x = -5; x <= 3.1; x += 0.9) tl.push(K.pathOf([K.iso([x, 6.05, 3], P), K.iso([x, 6.05, 15], P)]));
    return out.join("") + `<path d="${tl.join("")}" stroke="#8d9096" stroke-width=".7"/>`;
  }
  // the young forest: each tree a trunk and a crown, built once full grown; it grows by a uniform scale about its
  // foot (the camera is orthographic, so that is a screen scale about the foot's projected point)
  // (each trunk runs up into its crown: audit.mjs reports that as sunk)
  function treesSvg(P) {
    const out = [];
    for (const [x, y, h] of [...TREES].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P))) {
      const s = h, F = zAx([x, y, GZ]), f = K.iso([x, y, GZ], P);
      out.push(`<g data-foot="${f[0].toFixed(2)} ${f[1].toFixed(2)}">${ISO.tinted(BARK, S(K.cylinder(x, y, 0.3 * s, GZ, 3.4 * s, P, 12), { tone: "mid" }))}`);
      out.push(ISO.tinted(LEAF, S(G.lathe([[2.4 * s, 0], [2.4 * s, 2.6 * s], [4.6 * s, 2.9 * s, 1], [7.6 * s, 1.8 * s, 1], [9.4 * s, 0]], F, P, { steps: 28 }), { tone: "hi" })), "</g>");
    }
    return out.join("");
  }
  function puffsSvg(P, amt, t, k) {
    if (amt < 0.02) return "";
    const out = [];
    for (let i = 0; i < 7; i++) { const f = (t * 0.12 + i / 7) % 1, p = K.iso([CH[0] + f * 26, CH[1] + f * 6, CHH + 1 + f * 10], P); out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${((1.4 + f * 4) * k).toFixed(1)}" fill="#dfe2e6" stroke="#c4c9cf" stroke-width=".5" opacity="${(amt * 0.75 * (1 - f)).toFixed(2)}"/>`); }
    return out.join("");
  }

  ISO.add({
    name: "biomass", title: "Biomass power plant", compare: "biomass 480 420 480",
    about: "A biomass plant burns logs and straw to boil water for a turbine; its CO₂ drifts to a young forest that takes the carbon back up as it grows.",
    line: "biomass cx baseY width lab=0|1 run=0|1 grow=0-1 lit=fuel|boiler|chimney|generator|trees",
    demo: { line: "biomass 480 420 480 run=0 grow=0", script: [{ set: {}, hold: 1 }, { set: { run: 1, lit: "boiler" }, hold: 3 }, { set: { grow: 1, lit: "trees" }, hold: "settle" }] },
    make([cx, by, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 0.8, cy = by - H / 2 + size * 0.05;
      const { P, g } = ISO.frame([...K.boxCorners(SITE, -1, GZ), [CH[0], CH[1], CHH + 12], [36, 4, GZ + 11]], cx, cy, W, H, { azimuth: 60, elevation: 22 }, parent);
      const k = K.cameraOf(P).k;
      g.innerHTML = `<g>${ISO.tinted(ISO.tint("#e6ead9", ["#b3b9a2", "#bec4ae", "#c9cfba", "#d4d9c6"], "#5a604c"), S(K.slabOf(SITE, -1, GZ + 1, P, 4), { tone: "lo", halo: true }))}</g>
        <g>${chimneySvg(P)}</g><g>${fuelSvg(P)}</g><g>${conveyorSvg(P)}</g><g>${plantSvg(P)}</g><g data-part="fire"></g><g data-name="trees">${treesSvg(P)}</g><g data-part="smoke"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { fire: q("fire"), trees: q("trees"), smoke: q("smoke"), words: q("words") }, w = ISO.writer();
      q("boiler").append(el.fire);
      // the smoke as a shader layer drifting toward the trees; the SVG puffs draw without WebGL
      const fx = ISO.gl(g, P, W, H, el.smoke, `uniform float uA;void main(){gl_FragColor=finish(steamInk(viewOf(gl_FragCoord.xy),vec3(${CH[0]}.,${CH[1]}.,${CHH}.),normalize(vec3(1.3,.3,.75)),30.,1.6,uA,uTime));}`, ["uA"]);
      const s = { run: o.run === "1" ? 1 : 0, want: o.run === "1" ? 1 : 0, grow: ISO.clamp(ISO.num(o, "grow", 0.5), 0, 1), wantGrow: ISO.clamp(ISO.num(o, "grow", 0.5), 0, 1), t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const gq = Math.round(s.grow * 40) / 40, tq = Math.round(s.t * 12) / 12;
        w.rebuild(el.fire, s.run > 0.01 ? `${tq} ${s.run.toFixed(2)}` : "off", () => tubesFireSvg(P, s.run, tq));
        const sc = (0.45 + 0.55 * gq).toFixed(3);
        for (const tr of el.trees.children) { const [fx0, fy0] = tr.dataset.foot.split(" "); w.attr(tr, "transform", `translate(${fx0} ${fy0}) scale(${sc}) translate(${-fx0} ${-fy0})`); }
        if (fx) fx.set({ uA: s.run * 0.8 }, s.run > 0.01);
        else w.rebuild(el.smoke, s.run > 0.02 ? `${(Math.round(s.t * 20) / 20).toFixed(2)} ${s.run.toFixed(2)}` : "", () => puffsSvg(P, s.run, s.t, k));
        w.rebuild(el.words, lab ? `${s.run > 0.5} ${gq > 0.9}` : "", () => !lab ? "" : [
          ISO.word(K.iso([-31, 3, GZ + 4], P), "logs and straw", "#6b4a1c", { size: 13, dy: -4 }),
          ISO.word(K.iso([-1, 6, 21], P), s.run > 0.5 ? "boiler: the fuel burns" : "boiler", s.run > 0.5 ? "#b5541a" : "#444", { size: 13, dy: -8 }),
          ISO.word(K.iso([12.5, 4, GZ], P), "turbine + generator", "#1f4f8f", { size: 13, dy: 16 }),
          ISO.word(K.iso([CH[0] + 22, CH[1] + 5, CHH + 10], P), "CO₂ in the smoke", "#555", { size: 13, anchor: "start" }),
          ISO.word(K.iso([30, 10, GZ], P), gq > 0.9 ? "growing trees take the CO₂ back" : "young trees, replanted", "#2c6a22", { size: 13, dy: 18 })].join(""));
        w.light(["fuel", "boiler", "chimney", "generator", "trees"].map(q), [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.run !== undefined) s.want = +p.run ? 1 : 0;
        if (p.grow !== undefined) s.wantGrow = ISO.clamp(+p.grow, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      // trees take decades to grow back; here a few seconds
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        s.run = ISO.follow(s.run, s.want, dt, 0.8, calm); if (Math.abs(s.run - s.want) < 0.003) s.run = s.want;
        s.grow = ISO.follow(s.grow, s.wantGrow, dt, 0.8, calm); if (Math.abs(s.grow - s.wantGrow) < 0.003) s.grow = s.wantGrow;
        draw();
        return s.run !== s.want || s.grow !== s.wantGrow;
      };
      g.readout = () => s.run < 0.02 ? "stopped · logs and straw are stored sunlight: the plants took CO₂ from the air to grow"
        : `burning · 1 t of dry wood gives ≈ 1.8 t of CO₂ and about 1.4 MWh of electricity · the replanted forest is ${Math.round(s.grow * 100)} % grown and takes the carbon back as it grows`;
      draw();
      if (t) label(parent, cx, by + 26, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
