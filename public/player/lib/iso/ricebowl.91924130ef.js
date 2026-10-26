// "ricebowl cx cy size temp=20..100 lab=1 lit=bowl|rice|spoon" — a blue bowl of steaming white rice on a tray.
// A 12 cm porcelain rice bowl (about 300 ml) glazed blue with two white bands, on its foot ring, heaped with about
// 200 g of cooked rice (each grain about 6 × 2 mm), beside a spoon on its rest and a folded napkin on a wooden tray.
// Steam rises off the rice (a WebGL layer; SVG wisps without it) as thick as the rice is hot: set({ temp }) and the
// rice cools (or is warmed) toward it the way a hot thing does, fast at first, then slower (Newton's law of cooling,
// shown about 2 minutes a second). World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const zAx = DAILY.zAx;
  const TRAY = { x: -120, y: -95, w: 250, d: 175, r: 10 }, TZ = 0;
  const RB = 60, HB = 58, RF = 26, HF = 7, RIN = RB - 3.5, DOME = 20;            // bowl: rim radius, height, foot
  const BLUE = ISO.tint("#bcd6f3", ["#2b5f9e", "#346fae", "#4280bd", "#5591ca"], "#173a66");
  const RICE = ISO.tint("#fdfcf7", ["#d5d2c6", "#e0ddd2", "#eae8df", "#f4f2ec"], "#8a877c");
  const prof = (s) => RF + (RB - RF) * Math.sin(((s - HF) / (HB - HF)) * (Math.PI / 2)) ** 0.8;     // the bowl's flare
  const SPOON = [80, 4];

  function traySvg(P) {
    const out = [DAILY.table(P, TRAY, 8)];
    // a raised lip round the tray: four rails
    const R = (x0, x1, y0, y1) => ISO.tinted(ISO.T.wood, ISO.wbox(P, [x0, x1], [y0, y1], [0, 6], "mid"));
    out.push(R(TRAY.x + 3, TRAY.x + TRAY.w - 3, TRAY.y + 3, TRAY.y + 8), R(TRAY.x + 3, TRAY.x + 8, TRAY.y + 8, TRAY.y + TRAY.d - 3));
    // the napkin, folded, under the spoon rest
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [SPOON[0] - 24, SPOON[0] + 24], [SPOON[1] - 38, SPOON[1] + 72], [0, 2], "lo")));
    out.push(L(K.lineOnTop([SPOON[0] - 24, SPOON[1] + 40], [SPOON[0] + 24, SPOON[1] + 40], 2, P), { tone: "faint" }));
    return out.join("");
  }
  function bowlSvg(P) {
    const F = zAx([0, 0, 0]), m = [[0, 0], [0, RF - 2], [1.2, RF, 1], [HF, RF - 0.5], [HF, RF - 3]];
    // the foot ring, then the body flaring up to a rolled rim
    const body = [[HF, 0], [HF, RF - 3]];
    for (let i = 0; i <= 10; i++) { const s = HF + ((HB - HF) * i) / 10; body.push([s, prof(s), 1]); }
    body.push([HB + 1, RB + 0.6, 1], [HB + 2, RB - 1, 1], [HB + 2, 0]);
    const bands = [HB - 6, HB - 9, HF + 10].map((s) => `<path d="${G.arcOf(F, s, prof(s) + 0.15, P)}" fill="none" stroke="#f4f8fc" stroke-width="${s > HB - 7 ? 1.6 : 1}"/>`).join("");
    return ISO.tinted(BLUE, S(G.lathe(m.concat([[HF, 0]]).slice(0, 4).concat([[HF, 0]]), F, P, { steps: 48 }), { tone: "mid" })) +
      ISO.tinted(BLUE, S(G.lathe(body, F, P, { steps: 72 }), { tone: "hi", inner: bands }));
  }
  // The rice: a dome over the rim, and the grains that show on the side facing the viewer.
  function riceSvg(P) {
    const F = zAx([0, 0, HB + 1.5]), out = [];
    const dome = [[0, 0], [0, RIN]]; for (let i = 1; i <= 8; i++) { const t = i / 8; dome.push([DOME * Math.sin((t * Math.PI) / 2), RIN * Math.cos((t * Math.PI) / 2) ** 0.9, 1]); }
    out.push(ISO.tinted(RICE, S(G.lathe(dome.concat([[DOME, 0]]), F, P, { steps: 64 }), { tone: "hi" })));
    const V = G.viewOf(P), k = K.cameraOf(P).k, grains = [];
    for (let i = 0; i < 230; i++) {
      const rr = RIN * 0.97 * Math.sqrt((i + 0.5) / 230), a = i * 2.39996, x = Math.cos(a) * rr, y = Math.sin(a) * rr, t = Math.acos(Math.min(1, rr / RIN)) / (Math.PI / 2);
      const z = HB + 1.5 + DOME * Math.sin((Math.acos(Math.min(1, (rr / RIN) ** (1 / 0.9))) / (Math.PI / 2) * Math.PI) / 2);
      const n = G.unit3([x / RIN, y / RIN, 0.6 + t]);
      if (G.dot3(n, V) < 0.15) continue;
      const p = K.iso([x, y, z], P), ang = ((i * 47) % 180) - 90;
      grains.push(`<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${(3 * k).toFixed(2)}" ry="${(1.1 * k).toFixed(2)}" transform="rotate(${ang} ${p[0].toFixed(1)} ${p[1].toFixed(1)})"/>`);
    }
    out.push(`<g fill="#ffffff" stroke="#bdb9ad" stroke-width=".45">${grains.join("")}</g>`);
    return out.join("");
  }
  // The spoon lying on the napkin: an oval bowl and a flat handle along y, rising a little to its end.
  function spoonSvg(P) {
    const out = [];
    const F = G.frameOf([SPOON[0], 0, 2], [0, 0, 1], [0, 1, 0], [1, 0, 0]);
    out.push(DAILY.prism(P, F, DAILY.band(DAILY.bez([SPOON[1] + 6, 3.2], [SPOON[1] + 26, 3.4], [SPOON[1] + 44, 5.5], [SPOON[1] + 62, 6.4], 10), 1.6), -3.6, 3.6, ["#8d9096", "#e4e5e8"], "#d9dadd", "#3c3f45"));
    const B = zAx([SPOON[0], SPOON[1] - 12, 2]);
    out.push(ISO.tinted(ISO.T.steel, `<g transform="${scaleY(P, B.o, 1.45)}">${S(G.lathe([[0, 0], [0, 6], [2.4, 11, 1], [4, 12.4, 1], [4, 0]], B, P, { steps: 36 }), { tone: "hi" })}<path d="${G.circleOf(B, 4.02, 11.6, P, 36)}" fill="#b6b9be" stroke="#3c3f45" stroke-width=".5"/></g>`));
    return out.join("");
  }
  // stretch a round part along world y about o (the oval spoon bowl from a round lathe)
  const scaleY = (P, o, f) => { const c = K.iso(o, P), e = K.axisVector(P, [0, 1, 0]), l = Math.hypot(e[0], e[1]), ux = e[0] / l, uy = e[1] / l; const a = 1 + (f - 1) * ux * ux, b = (f - 1) * ux * uy, d = 1 + (f - 1) * uy * uy; return `matrix(${a} ${b} ${b} ${d} ${c[0] - a * c[0] - b * c[1]} ${c[1] - b * c[0] - d * c[1]})`; };
  // SVG steam: wisps rising off the rice, used without WebGL
  const wisps = (P, t, amount) => Array.from({ length: 5 }, (_, i) => {
    const f = (t * 0.35 + i / 5) % 1, x0 = -30 + i * 15, pts = Array.from({ length: 9 }, (_, j) => [x0 + Math.sin(j * 0.8 + i * 1.7 + t * 1.5) * 5, -5 + i * 2, HB + DOME + j * 9 + f * 14]);
    return `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#b7c4cf" stroke-width="${(2.6 * (1 - f)).toFixed(2)}" opacity="${(amount * 0.75 * (1 - f)).toFixed(2)}" stroke-linecap="round"/>`;
  }).join("");

  ISO.add({
    name: "ricebowl", title: "Bowl of rice", compare: "ricebowl 480 280 260",
    about: "A blue porcelain bowl heaped with steaming white rice: as the rice cools toward the set temperature the steam thins out.",
    line: "ricebowl cx cy size temp=20..100 lab=1 lit=bowl|rice|spoon",
    demo: { line: "ricebowl 480 280 260 temp=95", script: [{ set: {}, hold: 2 }, { set: { temp: 45 }, hold: "settle" }, { set: { temp: 90 }, hold: "settle" }] },
    make([cx, cy, size = 240], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.3, Hh = size * 1.6;
      const { P, g } = ISO.frame([...K.boxCorners(TRAY, -8, 0), [0, 0, HB + DOME + 120], [-40, 0, HB + DOME + 120]], cx, cy, W, Hh, { azimuth: 50, elevation: 30 }, parent);
      g.innerHTML = `<g>${traySvg(P)}</g><g data-name="spoon">${spoonSvg(P)}</g><path class="iso-halo" d="${K.haloOf({ x: -RF - 4, y: -RF - 4, w: 2 * RF + 8, d: 2 * RF + 8, r: RF }, 0, 4, P)}"/>` +
        `<g data-name="bowl">${bowlSvg(P)}</g><g data-name="rice">${riceSvg(P)}</g><g data-k="steam"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["spoon", "bowl", "rice", "steam", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      // three columns of steam off the rice's crown, drawn over everything
      const O = [[-14, -6], [8, 4], [22, -10]].map(([x, y]) => `steamInk(vb,vec3(${x.toFixed(1)},${y.toFixed(1)},${(HB + DOME).toFixed(1)}),normalize(vec3(.1,0.,1.)),110.,9.,uS,uTime+${(x * 0.07).toFixed(2)})`);
      const fx = ISO.gl(g, P, W, Hh, ISO.end(g), `uniform float uS;void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec4 c=${O[0]};c=over(${O[1]},c);c=over(${O[2]},c);gl_FragColor=finish(c);}`, ["uS"]);
      const T0 = ISO.clamp(ISO.num(o, "temp", 90), 20, 100);
      const s = { temp: T0, want: T0, t: 0 };
      let lit = o.lit || "";
      const steamOf = (T) => ISO.smooth(45, 90, T);                       // visible steam: thick when hot, gone near 45 °C
      const draw = () => {
        const a = steamOf(s.temp);
        if (fx) fx.set({ uS: a * 0.9 }, a > 0.01);
        else w.rebuild(el.steam, a > 0.01 ? `${(s.t % 30).toFixed(2)} ${a.toFixed(2)}` : "", () => (a > 0.01 ? wisps(P, s.t, a) : ""));
        const T = Math.round(s.temp);
        w.rebuild(el.words, lab ? `${T}` : "", () => !lab ? "" : [
          ISO.word(K.iso([-RB, RB * 0.3, HB], P), "bowl", "#173a66", { anchor: "end", size: 15, dy: 4 }),
          ISO.word(K.iso([0, 0, HB + DOME + 4], P), `rice · ${T} °C`, "#5a564c", { size: 15, dy: -10 }),
          ISO.word(K.iso([SPOON[0] + 6, SPOON[1] + 62, 6], P), "spoon", "#444", { anchor: "start", size: 13, dy: 12 })].join(""));
        const groups = { bowl: [el.bowl], rice: [el.rice], spoon: [el.spoon] };
        w.light([el.bowl, el.rice, el.spoon], (groups[lit] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.temp !== undefined) s.want = ISO.clamp(+p.temp || 20, 20, 100); if (p.lit !== undefined) lit = p.lit; };
      // dT/dt = -(T - T_target)/τ with τ = 6 min (a bowl in a room), shown 2.4 minutes a second; the steam keeps drifting while it shows
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        s.temp = calm ? s.want : s.want + (s.temp - s.want) * Math.exp(-dt / 2.5);
        if (Math.abs(s.temp - s.want) < 0.8) s.temp = s.want;
        draw();
        return s.temp !== s.want || (!fx && steamOf(s.temp) > 0.01 && !calm && s.t < 4);
      };
      g.readout = () => {
        const T = Math.round(s.temp);
        return `${T} °C${s.temp !== s.want ? (s.temp > s.want ? " · cooling" : " · warming") : ""} · about 200 g of cooked rice ≈ 260 kcal (1.3 kcal per gram) · ${steamOf(s.temp) > 0.05 ? "steam rises while the rice is hotter than about 50 °C" : "too cool to steam"}`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
