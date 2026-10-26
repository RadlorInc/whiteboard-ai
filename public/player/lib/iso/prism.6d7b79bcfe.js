// "prism cx cy size i=54 lab=1 lit=…" — a 60° flint-glass prism on a turntable on an optical bench.
// A ray box throws a narrow white beam through a slit; the prism refracts each colour by its own index (red 1.615 bends
// least, violet 1.650 most) and a screen catches the spectrum, a row of slit images. Rays are traced with Snell's law at
// both faces. set({ i }) turns the table so the beam meets the first face at i degrees; deviation is least near
// i ≈ 54°, where the beam passes through the prism symmetrically (minimum deviation).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -160, y: -96, w: 300, d: 130, r: 8 }, PC = [0, 0], SIDE = 46, BEAM = 23, Y0 = 10, TABLE = 34, RHO = (25 * Math.PI) / 180;
  const DIR = [Math.cos(RHO), Math.sin(RHO)], PERP = [-Math.sin(RHO), Math.cos(RHO)];
  const loc = (u, v) => [PC[0] + DIR[0] * u + PERP[0] * v, PC[1] + DIR[1] * u + PERP[1] * v];   // the bench's beam axis: u along the beam, v across
  const atL = (u, w, y) => [...loc(u, y), w];
  const COLORS = [["red", 1.615, "#e0302a"], ["orange", 1.618, "#f08a12"], ["yellow", 1.621, "#f2c80f"], ["green", 1.627, "#2f9e44"], ["blue", 1.636, "#1c7ed6"], ["indigo", 1.643, "#4c3fb8"], ["violet", 1.650, "#8e2fc0"]];
  const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
  const triOf = (phi) => [90, 210, 330].map((a) => [PC[0] + (SIDE / Math.sqrt(3)) * Math.cos(rad(a) + phi), PC[1] + (SIDE / Math.sqrt(3)) * Math.sin(rad(a) + phi)]);
  const phiOf = (i) => RHO + rad(30 - i);                          // turn of the table that gives incidence i on the first face

  // Snell's law at both faces of the triangle V for a ray from o along d; returns the entry, exit and the leaving direction.
  function trace(V, n) {
    let p = loc(-200, Y0), dir = DIR.slice();
    const pts = [];
    for (let k = 0; k < 2; k++) {
      let best = null;
      for (let e = 0; e < 3; e++) {
        const a = V[e], b = V[(e + 1) % 3], ex = b[0] - a[0], ey = b[1] - a[1], den = dir[0] * ey - dir[1] * ex;
        if (Math.abs(den) < 1e-9) continue;
        const t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den, u = ((a[0] - p[0]) * dir[1] - (a[1] - p[1]) * dir[0]) / den;
        if (t > 1e-6 && u >= 0 && u <= 1 && (!best || t < best.t)) best = { t, ex, ey };
      }
      if (!best) return null;
      const q = [p[0] + dir[0] * best.t, p[1] + dir[1] * best.t];
      let nx = best.ey, ny = -best.ex;
      const l = Math.hypot(nx, ny); nx /= l; ny /= l;
      if ((q[0] - PC[0]) * nx + (q[1] - PC[1]) * ny < 0) { nx = -nx; ny = -ny; }
      const eta = k ? n : 1 / n, nn = k ? [-nx, -ny] : [nx, ny], cosi = -(dir[0] * nn[0] + dir[1] * nn[1]), k2 = 1 - eta * eta * (1 - cosi * cosi);
      if (k2 < 0) return null;
      dir = [eta * dir[0] + (eta * cosi - Math.sqrt(k2)) * nn[0], eta * dir[1] + (eta * cosi - Math.sqrt(k2)) * nn[1]];
      pts.push(q); p = q;
    }
    return { a: pts[0], b: pts[1], dir, dev: deg(Math.acos(dir[0] * DIR[0] + dir[1] * DIR[1])) };
  }
  // The screen stands square to the green ray at minimum deviation, 105 units past the prism.
  const SCR = (() => {
    const tr = trace(triOf(phiOf(deg(Math.asin(1.627 / 2)))), 1.627), back = Math.atan2(-tr.dir[1], -tr.dir[0]), n = [Math.cos(back - 0.5), Math.sin(back - 0.5)];   // turned 29° toward the viewer
    return { c: [tr.b[0] + tr.dir[0] * 125, tr.b[1] + tr.dir[1] * 125], n, t: [n[1], -n[0]] };
  })();
  const onScreen = (u, z, y = 0) => [SCR.c[0] + SCR.t[0] * u + SCR.n[0] * y, SCR.c[1] + SCR.t[1] * u + SCR.n[1] * y, z];
  const hitOf = (tr) => { const s = ((SCR.c[0] - tr.b[0]) * SCR.n[0] + (SCR.c[1] - tr.b[1]) * SCR.n[1]) / (tr.dir[0] * SCR.n[0] + tr.dir[1] * SCR.n[1]); return [tr.b[0] + tr.dir[0] * s, tr.b[1] + tr.dir[1] * s]; };
  const ray = (P, pts, color, w = 1.3, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

  function benchSvg(P, lab) {
    const out = [ISO.baseboard(P, BOARD, { ruler: {} }), ISO.plate(P, { x: -40, y: 14, w: 40, d: 14, r: 1.2 })];
    // Screen on a post and foot, square to the spectrum, its white face toward the prism.
    out.push(`<g data-name="screen">`);
    out.push(S(K.cylinder(SCR.c[0] - SCR.n[0] * 4, SCR.c[1] - SCR.n[1] * 4, 9, 0, 2.4, P, 32, 0.5), { tone: "mid" }), S(K.cylinder(SCR.c[0] - SCR.n[0] * 4, SCR.c[1] - SCR.n[1] * 4, 2.2, 2.4, 8, P, 18), { tone: "mid", crease: "none" }));
    const at = (u, w, y) => onScreen(u, w, y);
    out.push(ISO.box(at, P, [-6, 6], [9, 13], [-7, -1.8], "mid"));
    out.push(ISO.box(at, P, [-34, 34], [10, 48], [-1.8, 0], "hi"));
    out.push(D([[-30, 15], [30, 15], [-30, 45], [30, 45]].map(([u, z]) => K.iso(onScreen(u, z, 0.05), P)), { size: 0.5 }));
    out.push(`</g>`);
    // Ray box on its own foot plate: a housing with closed vent slots, a slit plate on its face, a knob and a lead.
    out.push(`<g data-name="raybox">`);
    out.push(ISO.box(atL, P, [-138, -86], [0, 3], [Y0 - 16, Y0 + 16], "mid"));
    out.push(ISO.box(atL, P, [-134, -96], [3, 36], [Y0 - 13, Y0 + 13], "mid"));
    for (let k = 0; k < 4; k++) { const u = -128 + k * 7.5; out.push(L(K.pathOf([[u, Y0 - 8], [u + 3, Y0 - 8], [u + 3, Y0 + 8], [u, Y0 + 8]].map(([a, b]) => K.iso([...loc(a, b), 36], P)), true), { tone: "lo" })); }
    out.push(ISO.box(atL, P, [-96, -94], [6, 34], [Y0 - 11, Y0 + 11], "hi"));
    out.push(`<path d="${K.pathOf([[Y0 - 0.6, 14], [Y0 + 0.6, 14], [Y0 + 0.6, 32], [Y0 - 0.6, 32]].map(([v, z]) => K.iso(atL(-93.95, z, v), P)), true)}" fill="#2a2b2f" stroke="#2a2b2f" stroke-width="0.4"/>`);
    out.push(D([[Y0 - 8, 9], [Y0 + 8, 9], [Y0 - 8, 31], [Y0 + 8, 31]].map(([v, z]) => K.iso(atL(-93.95, z, v), P)), { size: 0.5 }));
    const kF = G.frameOf(atL(-115, 12, Y0 + 13), [...PERP, 0], [...DIR, 0], [0, 0, 1]);
    out.push(S(G.disc(0, 1.6, 4.4, kF, P), { tone: "mid" }), ISO.tinted(ISO.T.plastic, S(G.disc(1.6, 5, 3.4, kF, P), { tone: "hi" }) + L(G.ribsOf(kF, 1.6, 5, 3.4, 16, P, { seams: true }), { tone: "lo" })));
    const lead = [atL(-134, 12, Y0 - 4), atL(-142, 12, Y0 - 4), atL(-144, 3, Y0 - 4)];
    out.push(ray(P, lead, "#1d1f22", 2.4), ISO.box(atL, P, [-150, -140], [0, 3], [Y0 - 9, Y0 + 1], "mid"), D([K.iso(lead[0], P)], { size: 0.9, tone: "hi" }));
    out.push(`</g>`);
    // Turntable: pedestal, a degree ring with ticks hanging from its rim.
    out.push(`<g data-name="table">`, S(K.cylinder(PC[0], PC[1], 12, 0, 4, P, 40, 0.5), { tone: "mid" }), S(K.cylinder(PC[0], PC[1], TABLE, 4, 4, P, 72, 0.6), { tone: "mid" }));
    const t = K.radialTicks(PC[0], PC[1], TABLE, 72, 6, 8, [1.4, 2.8], P);
    out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }), `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "prism", title: "Glass prism (spectrum)", compare: "prism 450 280 280",
    about: "Ray box, a flint prism on a turntable and a screen: white light splits into red (bent least) through violet (bent most); turn the table to minimum deviation.",
    line: "prism cx cy size i=54 lab=1 lit=prism|raybox|screen|table",
    demo: { line: "prism 480 280 300", script: [{ set: { i: 44 }, hold: "settle" }, { set: { i: 54 }, hold: "settle" }, { set: { i: 70 }, hold: "settle" }, { set: { i: 54 }, hold: "settle" }] },
    make([cx, cy, size = 280], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.0, H = size * 1.1;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), atL(-150, 40, Y0), [SCR.c[0], SCR.c[1], 50]], cx, cy, W, H, { azimuth: 100, elevation: 30 }, parent);
      const s = { i: ISO.clamp(ISO.num(o, "i", 44), 42, 75) }; s.iT = s.i;
      g.innerHTML = `<g>${benchSvg(P, lab)}</g><g data-part="out"></g><g data-part="prism" data-name="prism"></g><g data-part="in"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "prism", traces = [];
      // the spectrum on the screen as light landing on paper: a continuous band from where red lands to where violet
      // lands, found by meeting each pixel's ray with the screen's plane; without WebGL, seven coloured slit images
      const fx = ISO.gl(g, P, W, H, el.prism, `uniform vec2 uRV;const vec3 C=vec3(${SCR.c[0].toFixed(3)},${SCR.c[1].toFixed(3)},0.),T=vec3(${SCR.t[0].toFixed(5)},${SCR.t[1].toFixed(5)},0.),N=vec3(${SCR.n[0].toFixed(5)},${SCR.n[1].toFixed(5)},0.);
        vec3 spec(float f){vec3 c=mix(vec3(.85,.1,.08),vec3(1.,.5,.05),smoothstep(0.,.18,f));c=mix(c,vec3(1.,.88,.1),smoothstep(.15,.32,f));
          c=mix(c,vec3(.15,.72,.25),smoothstep(.32,.5,f));c=mix(c,vec3(.12,.55,.9),smoothstep(.5,.66,f));c=mix(c,vec3(.15,.25,.9),smoothstep(.66,.82,f));return mix(c,vec3(.45,.15,.8),smoothstep(.82,1.,f));}
        void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec3 V=towardViewer();vec3 p0=rayOf(vb);vec3 q=p0+V*dot(C+.1*N-p0,N)/dot(V,N);
          float u=dot(q-C,T),f=(u-uRV.x)/(uRV.y-uRV.x),px=pixelOf();
          float m=window(f,0.,1.,.05)*window(q.z,${BEAM - 8}.,${BEAM + 8}.,.7*px)*step(0.,dot(V,N));
          gl_FragColor=finish(inkFor(mix(vec3(1.),spec(clamp(f,0.,1.)),.9),0.)*m);}`, ["uRV"]);
      const draw = () => {
        const phi = phiOf(s.i), V = triOf(phi), key = s.i.toFixed(2);
        traces = COLORS.map(([, n]) => trace(V, n));
        const uOf = (tr) => { const h = hitOf(tr); return (h[0] - SCR.c[0]) * SCR.t[0] + (h[1] - SCR.c[1]) * SCR.t[1]; };
        if (fx) { const ur = uOf(traces[0]), uv = uOf(traces[COLORS.length - 1]), pad = (uv - ur) / 12; fx.set({ uRV: [ur - pad, uv + pad] }); }
        w.rebuild(el.out, key, () => traces.map((tr, k) => {
          const h = hitOf(tr), u = (h[0] - SCR.c[0]) * SCR.t[0] + (h[1] - SCR.c[1]) * SCR.t[1];
          return ray(P, [[...tr.b, BEAM], [...h, BEAM]], COLORS[k][2], 1.1) + (fx ? "" : ray(P, [onScreen(u, BEAM - 8, 0.1), onScreen(u, BEAM + 8, 0.1)], COLORS[k][2], 2.2, ' stroke-linecap="butt"'));
        }).join(""));
        w.rebuild(el.prism, key, () => {
          const idx = [PC[0] + Math.cos(phi - Math.PI / 2) * (TABLE - 3), PC[1] + Math.sin(phi - Math.PI / 2) * (TABLE - 3)];
          return S(K.cylinder(PC[0], PC[1], 27, 8, 1.4, P, 64, 0.4), { tone: "mid" }) +
            L(K.lineOnTop([PC[0] + Math.cos(phi - Math.PI / 2) * 27, PC[1] + Math.sin(phi - Math.PI / 2) * 27], idx, 8, P), { tone: "hi" }) + D([K.iso([...idx, 8], P)], { size: 0.7, tone: "hi" }) +
            `<g style="${ISO.T.glass}" class="pr-glass">${S(K.extrude(V, 9.4, 30, P, { bevel: 0.6 }), { tone: "hi" })}</g>`;
        });
        w.rebuild(el.in, key, () => ray(P, [atL(-93.9, BEAM, Y0), [...traces[0].a, BEAM]], "#8d939b", 3.2) + ray(P, [atL(-93.9, BEAM, Y0), [...traces[0].a, BEAM]], "#fffdf2", 1.8) +
          traces.map((tr, k) => ray(P, [[...tr.a, BEAM], [...tr.b, BEAM]], COLORS[k][2], 0.8)).reverse().join(""));
        w.rebuild(el.words, lab ? key : "", () => {
          if (!lab) return "";
          const hu = (tr) => { const h = hitOf(tr); return (h[0] - SCR.c[0]) * SCR.t[0] + (h[1] - SCR.c[1]) * SCR.t[1]; };
          const r = K.iso(onScreen(hu(traces[0]), BEAM + 9, 0.1), P), v = K.iso(onScreen(hu(traces[6]), BEAM + 9, 0.1), P);
          return ISO.word(K.iso(atL(-150, 0, Y0 + 16), P), "ray box", "#555", { size: 14, dy: 20 }) + ISO.word(K.iso(atL(-55, BEAM, Y0), P), "white light", "#555", { size: 14, dy: -8 }) +
            ISO.word(K.iso([PC[0], PC[1] + TABLE, 0], P), "glass prism", "#555", { size: 14, dy: 22 }) + ISO.word(K.iso(onScreen(0, 48), P), "screen", "#555", { size: 14, dy: -8 }) +
            ISO.word(r, "red", COLORS[0][2], { size: 13, dy: -4, anchor: r[0] < v[0] ? "end" : "start" }) + ISO.word(v, "violet", COLORS[6][2], { size: 13, dy: -4, anchor: r[0] < v[0] ? "start" : "end" });
        });
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.i !== undefined) s.iT = ISO.clamp(+p.i, 42, 75); if (p.lit) lit = p.lit; };
      g.update = (dt) => { s.i = ISO.follow(s.i, s.iT, dt, 0.45, ISO.still()); draw(); return s.i !== s.iT; };
      g.readout = () => {
        const r = traces[0], v = traces[6], dmin = 2 * deg(Math.asin(1.627 / 2)) - 60;
        return `incidence ${s.i.toFixed(0)}° · deviation red ${r.dev.toFixed(1)}°, violet ${v.dev.toFixed(1)}° · ${Math.abs(s.i - deg(Math.asin(1.627 / 2))) < 1.5 ? "minimum deviation" : `least is ${dmin.toFixed(1)}° (green) at ${deg(Math.asin(1.627 / 2)).toFixed(0)}°`}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
