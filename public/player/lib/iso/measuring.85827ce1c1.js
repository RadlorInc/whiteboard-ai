// "measuring cx cy width k=cups|spoons fill=0..1.5 lab=1 lit=jug|water|marks|tap|spoons|sugar|knife" — kitchen measures.
// cups: a clear measuring jug (460 ml to the brim) with red cup marks (¼, ½, 1 US cup = 60, 120, 240 ml) on one side
// and millilitre ticks on the other, its handle and pouring lip, under a chrome kitchen tap. set({ fill: cups }) opens
// the tap's lever and water runs in until the surface reaches that mark (a lower fill just pours some out).
// spoons: four measuring spoons on a ring (1 tbsp 15 ml, 1 tsp 5 ml, ½ tsp 2.5 ml, ¼ tsp 1.25 ml), each bowl sized to
// hold its amount; set({ fill: 1 }) heaps sugar in the tablespoon, then a knife slides across the rim and levels it.
// World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const GLASS = ISO.T.glass, WATER = ISO.tint("#cfe6f8", ["#7fb2dd", "#8fbee3", "#a2cbe9", "#b6d7ef"], "#2f6a9c"), CHROME = ISO.T.steel;
  const zAx = DAILY.zAx;
  // ── the jug
  const H = 104, R0 = 38, R1 = 45, WALL = 2.2, BASE = 5;
  const rOut = (s) => R0 + ((R1 - R0) * s) / H, rIn = (s) => rOut(s) - WALL;
  const vol = (z) => { const h = z - BASE, a = rIn(BASE), b = rIn(z); return (Math.PI / 3) * h * (a * a + a * b + b * b) / 1000; };
  const zFor = (ml) => { let lo = BASE, hi = H; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; vol(m) < ml ? (lo = m) : (hi = m); } return (lo + hi) / 2; };
  const CUP = 240, MAXC = 1.75;
  const TAP = [0, -108], TAPZ = 236, NOZ = [0, -8, 214];
  const COUNTER1 = { x: -95, y: -140, w: 200, d: 200, r: 8 };

  function counterSvg(P, plan) { return DAILY.table(P, plan, 12, ISO.tint("#f2f0ea", ["#b9b5aa", "#c8c4b9", "#d6d3ca", "#e4e2db"], "#5a564c")); }
  // (audit: the column, its elbow ball and the arm meet as a ball tee, so they read as "sunk" into each other; so
  // does the water body inside the glass.)
  function tapSvg(P) {
    const out = [];
    out.push(ISO.tinted(CHROME, S(G.lathe([[0, 0], [0, 26], [3, 26, 1], [8, 20, 1], [10, 13], [10, 0]], zAx([TAP[0], TAP[1], 0]), P, { steps: 40 }), { tone: "mid" })));
    out.push(ISO.tinted(CHROME, S(G.disc(10, TAPZ - 12, 11, zAx([TAP[0], TAP[1], 0]), P, { steps: 32 }), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.sphereOf([TAP[0], TAP[1], TAPZ - 12], 11, P, { steps: 40 }), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.disc(0, NOZ[1] - TAP[1], 8, DAILY.yAx([TAP[0], TAP[1], TAPZ - 12]), P, { steps: 28 }), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.lathe([[0, 0], [0, 8], [8, 8], [13, 9.5, 1], [16, 9.5], [16, 0]], G.frameOf([NOZ[0], NOZ[1], TAPZ - 12], [0, 0, -1], [1, 0, 0], [0, 1, 0]), P, { steps: 28 }), { tone: "hi" })));
    return out.join("");
  }
  // the tap's lever on the column's top: turned a (0 shut … 1 full on) about the column
  function leverSvg(P, a) {
    const th = -0.2 + a * 0.9, F = G.frameOf([TAP[0], TAP[1], TAPZ - 2], [0, 0, 1], [Math.cos(th), Math.sin(th), 0], [-Math.sin(th), Math.cos(th), 0]);
    return ISO.tinted(CHROME, S(G.disc(0, 8, 9, F, P, { steps: 24 }), { tone: "mid" })) + DAILY.box(P, F, [4, 52], [3, 8], [-3.5, 3.5], "hi");
  }
  function jugSvg(P) {
    const F = zAx([0, 0, 0]), out = [];
    // the handle on the back left, then the glass
    const Fh = G.frameOf([0, 0, 0], [0, 0, 1], G.unit3([-0.2, 1, 0]), G.unit3([-1, -0.2, 0]));
    out.push(DAILY.prism(P, Fh, DAILY.band(DAILY.bez([R1 - 3, 92], [R1 + 40, 98], [R1 + 40, 28], [R0 - 1, 22], 18), 9), -7, 7, ["#9fb8c9", "#eef5f9"], "#d8e5ee", "#4d6f86"));
    out.push(ISO.tinted(GLASS, S(G.lathe([[0, 0], [0, R0 - 1.4], [1.4, R0, 1], [H, R1], [H, 0]], F, P, { steps: 72 }), { tone: "hi" })));
    out.push(`<path d="${G.circleOf(F, BASE, rIn(BASE), P)}" fill="#e3eef6" stroke="#7d9db3" stroke-width=".6"/>`);
    return out.join("");
  }
  // marks on the side facing the viewer: cups in red on the left of centre, ml in blue on the right
  function marksSvg(P) {
    const V = G.viewOf(P), a0 = Math.atan2(V[1], V[0]), at = (a, z, dr = 0.15) => K.iso([Math.cos(a) * (rOut(z) + dr), Math.sin(a) * (rOut(z) + dr), z], P);
    const red = [], blue = [], words = [];
    for (const [c, txt] of [[0.25, "¼"], [0.5, "½"], [0.75, "¾"], [1, "1 cup"], [1.5, "1½"]]) {
      const z = zFor(c * CUP), long = c === 1 || c === 0.5;
      red.push(K.pathOf(Array.from({ length: 7 }, (_, i) => at(a0 - 0.45 + (i / 6) * (long ? 0.36 : 0.22), z))));
      words.push([at(a0 - 0.45 + (long ? 0.36 : 0.22), z), txt]);
    }
    for (let ml = 50; ml <= 400; ml += 50) { const z = zFor(ml), long = ml % 100 === 0; blue.push(K.pathOf(Array.from({ length: 5 }, (_, i) => at(a0 + 0.42 - (i / 4) * (long ? 0.26 : 0.16), z)))); if (long) words.push([at(a0 + 0.46, z), `${ml}`, 1]); }
    return L(red.join(""), { tone: "lo", free: true }).replace('class="iso-line', 'style="stroke:#c0392b;stroke-width:1.4" class="iso-line') +
      L(blue.join(""), { tone: "lo", free: true }).replace('class="iso-line', 'style="stroke:#2f6a9c;stroke-width:1" class="iso-line') +
      words.map(([p, txt, b]) => `<text x="${(p[0] - 2).toFixed(1)}" y="${(p[1] + 3).toFixed(1)}" text-anchor="${b ? "end" : "end"}" fill="${b ? "#2f6a9c" : "#c0392b"}" style="font:700 ${b ? 7.5 : 9}px 'Helvetica Neue',Arial,sans-serif">${txt}</text>`).join("");
  }
  function rimSvg(P) {
    const F = zAx([0, 0, 0]), V = G.viewOf(P), a = Math.atan2(V[1], V[0]);
    // the pouring lip on the right (+x), pinched out of the rim, then the rim's two edges and a highlight
    const lip = DAILY.prism(P, G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), [[R1 - 6, H - 12], [R1 + 3, H - 3], [R1 + 9, H + 2], [R1 + 6, H + 2.4], [R1 - 4, H]], -8, 8, ["#b9cfdd", "#f1f7fb"], "#e2ecf2", "#5d7f96");
    const sliver = (da, w, s0, s1) => K.pathOf([[da - w, s0], [da + w, s0], [da + w * 0.6, s1], [da - w * 0.6, s1]].map(([d, s]) => K.iso([Math.cos(a + d) * (rOut(s) + 0.1), Math.sin(a + d) * (rOut(s) + 0.1), s], P)), true);
    return lip + `<path d="${G.circleOf(F, H, R1, P, 72)}" fill="none" stroke="#5d7f96" stroke-width="1"/><path d="${G.circleOf(F, H, R1 - WALL, P, 72)}" fill="none" stroke="#7d9db3" stroke-width=".7"/>` +
      `<path d="${sliver(-0.75, 0.05, 10, H - 10)}" fill="#ffffff" opacity=".8"/>`;
  }
  // water: one body built once, clipped on screen to what lies under the surface (see waterglass.js)
  function waterBody(P, id) {
    return `<clipPath id="${id}"><path/><path/></clipPath><g clip-path="url(#${id})">` + ISO.tinted(WATER, S(G.lathe([[BASE, 0], [BASE, rIn(BASE)], [H - 2, rIn(H - 2)], [H - 2, 0]], zAx([0, 0, 0]), P, { steps: 64 }), { tone: "hi" })) + "</g><path/><path/>";
  }
  function waterSet(P, el, z, on) {
    const r = rIn(z), ring = Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * Math.PI * 2; return K.iso([Math.cos(a) * r, Math.sin(a) * r, z], P); });
    let lo = 0, hi = 0; ring.forEach((p, i) => { if (p[0] < ring[lo][0]) lo = i; if (p[0] > ring[hi][0]) hi = i; });
    const arc = [], dir = ring[(lo + 1) % 64][1] > ring[(lo + 63) % 64][1] ? 1 : -1;
    for (let i = lo; ; i = (i + dir + 64) % 64) { arc.push(ring[i]); if (i === hi) break; }
    const d = K.pathOf([...arc, [ring[hi][0], ring[hi][1] + 2000], [ring[lo][0], ring[lo][1] + 2000]], true), e = K.pathOf(ring, true);
    const [c1, c2] = el.querySelectorAll("clipPath path"), body = el.querySelector("g[clip-path]"), [top, glint] = el.querySelectorAll(":scope > path");
    c1.setAttribute("d", on ? d : ""); c2.setAttribute("d", on ? e : "");
    top.setAttribute("d", on ? e : ""); top.setAttribute("fill", "#b9d8f0"); top.setAttribute("stroke", "#2f6a9c"); top.setAttribute("stroke-width", ".8");
    glint.setAttribute("d", on ? G.circleOf(zAx([0, 0, 0]), z + 0.05, r - 1.6, P, 48) : ""); glint.setAttribute("fill", "none"); glint.setAttribute("stroke", "#f4f9fd"); glint.setAttribute("stroke-width", "1.1");
    body.style.visibility = on ? "" : "hidden";
  }

  // ── the spoons: bowl radius from its volume (a hemisphere's worth, a little shallower), handles fanned on a ring
  const RING0 = [-75, 30];
  const SPOONS = [["1 tbsp", 15], ["1 tsp", 5], ["½ tsp", 2.5], ["¼ tsp", 1.25]].map(([name, ml], i) => {
    const r = Math.cbrt((3 * ml * 1000) / (2 * Math.PI)) * 1.08, ang = (-0.95 + i * 0.5) + Math.PI / 2;
    const dir = [Math.cos(ang), -Math.sin(ang), 0], c = [RING0[0] + dir[0] * (70 + r), RING0[1] + dir[1] * (70 + r)];
    return { name, ml, r, dir, c, depth: r * 0.85 };
  });
  function spoonsSvg(P) {
    const out = [];
    for (const sp of [...SPOONS].sort((a, b) => K.depthOf([a.c[0], a.c[1], 0], P) - K.depthOf([b.c[0], b.c[1], 0], P))) out.push(spoonSvg(P, sp));
    // the steel ring through the handles' holes
    const k = K.cameraOf(P).k, d = K.ring(RING0[0], RING0[1], 18, 4.2, P, 48);
    out.push(`<path d="${d}" fill="none" stroke="#3c3f45" stroke-width="${(3 * k).toFixed(2)}"/><path d="${d}" fill="none" stroke="#d9dadd" stroke-width="${(1.4 * k).toFixed(2)}"/>`);
    return out.join("");
  }
  function spoonSvg(P, sp) {
    const { r, dir, c, depth } = sp, z0 = depth * 0.0, side = [-dir[1], dir[0], 0], out = [];
    // handle: a flat bar from the ring to the bowl's rim, rounded at the ring end with a hole, stamped with its size
    const F = G.frameOf([RING0[0], RING0[1], 0], [0, 0, 1], dir, side), len = Math.hypot(c[0] - RING0[0], c[1] - RING0[1]) - r * 0.7;
    const outline = [...DAILY.rrect(4, -7, len, 7, 6.5, 4)].map(([u, v]) => [u, v]);
    out.push(DAILY.prism(P, G.frameOf(F.o, side, dir, [0, 0, 1]), outline.map(([u, v]) => [u, v]), depth - 2, depth, ["#8d9096", "#e4e5e8"], "#d9dadd", "#3c3f45",
      `<path d="${K.ring(RING0[0] + dir[0] * 11, RING0[1] + dir[1] * 11, 3.2, depth + 0.05, P, 20)}" fill="#f2f0ea" stroke="#3c3f45" stroke-width=".6"/>`));
    const mid = G.add3(F.o, G.mul3(dir, len * 0.55));
    out.push(`<text transform="${K.topMatrix([mid[0], mid[1]], depth + 0.05, P)} rotate(${(Math.atan2(dir[1], dir[0]) * 180) / Math.PI})" x="0" y="2" text-anchor="middle" fill="#3c3f45" style="font:700 5.5px 'Helvetica Neue',Arial,sans-serif">${sp.name}</text>`);
    // the bowl: a spherical cup standing on its bottom, its rim at the handle's height
    const Fz = zAx([c[0], c[1], 0]), prof = [[0, 0]];
    for (let i = 1; i <= 8; i++) { const s = (depth * i) / 8, rr = Math.sqrt(Math.max(0, r * r - (r - s * (r / depth)) ** 2)); prof.push([s, rr, 1]); }
    prof.push([depth, 0]);
    out.push(ISO.tinted(CHROME, S(G.lathe(prof, Fz, P, { steps: 40 }), { tone: "hi" })));
    out.push(`<path d="${G.circleOf(Fz, depth + 0.02, r - 0.8, P, 40)}" fill="#9a9ea5" stroke="#3c3f45" stroke-width=".6"/>`);
    return `<g data-spoon="${sp.name}">${out.join("")}</g>`;
  }
  // sugar in the tablespoon: a heaped cap that the knife cuts flat (h: heap height above the rim, cut: level line x)
  function sugarSvg(P, heap, cutAt) {
    const sp = SPOONS[0], { r, c, depth } = sp;
    if (heap <= 0.01) return "";
    const top = depth + heap * r * 0.55, pts = [], n = 36;
    // the cap seen from the camera: an ellipse at the rim plus a dome; cut flat past the knife (cutAt 0…1 across)
    const V = G.viewOf(P), u = G.unit3([V[0], V[1], 0]), w = [-u[1], u[0], 0];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2, x = Math.cos(t) * (r - 1), y = Math.sin(t) * (r - 1);
      pts.push(K.iso([c[0] + x, c[1] + y, depth + 0.1], P));
    }
    const ring = K.pathOf(pts, true), dome = [];
    for (let i = 0; i <= n; i++) {
      const t = -Math.PI / 2 + (i / n) * Math.PI, along = Math.sin(t) * (r - 1), h = Math.cos(t);
      const across = -1 + 2 * cutAt, cutH = (along / (r - 1)) < across ? 0 : 1;      // where the knife has passed, flat
      const zz = depth + (top - depth) * h * cutH;
      dome.push(K.iso([c[0] + w[0] * along, c[1] + w[1] * along, zz], P));
    }
    return `<path d="${ring}" fill="#fbfaf6" stroke="#9a968a" stroke-width=".6"/><path d="${K.pathOf(dome)}Z" fill="#ffffff" stroke="#9a968a" stroke-width=".6"/>` +
      `<g fill="#d8d4c8">${Array.from({ length: 14 }, (_, i) => { const a = i * 2.4, rr = (r - 3) * Math.sqrt((i + 0.5) / 14), p = K.iso([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, depth + 0.2 + (cutAt < 1 ? (top - depth) * 0.6 * Math.sqrt(Math.max(0, 1 - (rr / r) ** 2)) : 0)], P); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r=".7"/>`; }).join("")}</g>`;
  }
  // the knife: a flat blade with a handle, sliding across the bowl's rim (f 0 … 1)
  function knifeSvg(P, f) {
    const sp = SPOONS[0], V = G.viewOf(P), u = G.unit3([V[0], V[1], 0]), w = [-u[1], u[0], 0];
    const at = G.add3([sp.c[0], sp.c[1], sp.depth + 0.4], G.mul3(w, -sp.r - 8 + (2 * sp.r + 16) * f));
    const F = G.frameOf(at, [0, 0, 1], u, w);
    return DAILY.box(P, F, [-70, 30], [0, 1.2], [-1, 1], "hi") + DAILY.prism(P, G.frameOf(G.add3(at, G.mul3(u, -70)), w, u, [0, 0, 1]), DAILY.rrect(-58, -6, 0, 6, 5, 3), -2, 6, ["#5a3a1a", "#a8743e"], "#94622e", "#3a220a");
  }

  let clipN = 0;
  ISO.add({
    name: "measuring", title: "Measuring jug and spoons", compare: "measuring 480 270 320 k=cups",
    about: "Kitchen measures: the tap fills a measuring jug to the ¼, ½ or 1 cup mark (1 cup = 240 ml); or sugar is heaped in a tablespoon and levelled off with a knife (1 tbsp = 15 ml).",
    line: "measuring cx cy width k=cups|spoons fill=0..1.5 lab=1 lit=jug|water|marks|tap|spoons|sugar|knife",
    demo: { line: "measuring 480 270 320 k=cups fill=0", script: [{ set: {}, hold: 0.8 }, { set: { fill: 0.5 }, hold: "settle" }, { set: { fill: 1 }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", spoons = o.k === "spoons";
      const W = size * 2.1, Hh = size * 1.35, id = `ms-${++clipN}`;
      if (spoons) return makeSpoons([cx, cy, size], o, t, parent, W, Hh, lab);
      const { P, g } = ISO.frame([...K.boxCorners(COUNTER1, -12, 0), [TAP[0], TAP[1], TAPZ + 6], [R1 + 40, 0, H + 6]], cx, cy, W, Hh, { azimuth: 52, elevation: 22 }, parent);
      g.innerHTML = counterSvg(P, COUNTER1) + `<g data-name="tap">${tapSvg(P)}</g><g data-k="lever"></g><g data-name="jug">${jugSvg(P)}</g><g data-name="water">${waterBody(P, id)}</g><g data-k="stream"></g><g data-name="marks">${marksSvg(P)}</g><g data-k="rim">${rimSvg(P)}</g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["tap", "lever", "jug", "water", "stream", "marks", "rim", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      const f0 = ISO.clamp(ISO.num(o, "fill", 1), 0, MAXC);
      const s = { ml: f0 * CUP, want: f0 * CUP, tap: 0, t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const z = zFor(Math.max(0.5, s.ml)), on = s.ml > 0.5, running = s.tap > 0.6;
        if (el.water._z !== z || el.water._on !== on) { el.water._z = z; el.water._on = on; waterSet(P, el.water, z, on); }
        w.rebuild(el.lever, s.tap.toFixed(2), () => leverSvg(P, s.tap));
        w.rebuild(el.stream, running ? `${(s.t % 30).toFixed(2)} ${z.toFixed(1)}` : "", () => {
          if (!running) return "";
          const a = K.iso([NOZ[0], NOZ[1], TAPZ - 28], P), b = K.iso([NOZ[0], NOZ[1], on ? z : BASE], P), k = K.cameraOf(P).k, wob = Math.sin(s.t * 23) * 0.3 * k;
          const d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${(a[0] + wob).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
          const rip = on ? Array.from({ length: 3 }, (_, i) => { const f = (s.t * 1.6 + i / 3) % 1; return `<path d="${G.circleOf(zAx([NOZ[0], NOZ[1], z + 0.1]), 0, 2 + f * 14, P, 32)}" fill="none" stroke="#5f93bf" stroke-width="${(0.9 * (1 - f)).toFixed(2)}" opacity="${(1 - f).toFixed(2)}"/>`; }).join("") : "";
          return rip + `<path d="${d}" fill="none" stroke="#3f7fb5" stroke-width="${(5 * k).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#bcdaf1" stroke-width="${(2.6 * k).toFixed(2)}" stroke-linecap="round"/>`;
        });
        const cups = s.ml / CUP;
        w.rebuild(el.words, lab ? `${Math.round(s.ml)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([-R1, R1 * 0.2, H], P), "measuring jug", "#444", { anchor: "end", size: 14, dy: -6 }),
          ISO.word(K.iso([TAP[0], TAP[1], TAPZ + 4], P), "tap", "#444", { anchor: "middle", size: 14, dy: -8 }),
          on ? ISO.word(K.iso([R1 + 4, R1 * 0.3, z], P), `${Math.round(s.ml)} ml`, "#1f4f8f", { anchor: "start", size: 14, dy: 5 }) : "",
        ].join(""));
        const want = lit || (running ? "water" : "");
        const groups = { jug: [el.jug, el.rim], water: [el.water, el.stream], marks: [el.marks], tap: [el.tap, el.lever] };
        w.light([el.jug, el.rim, el.water, el.stream, el.marks, el.tap, el.lever], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.fill !== undefined) s.want = ISO.clamp(+p.fill || 0, 0, MAXC) * CUP; if (p.lit !== undefined) lit = p.lit; };
      // A kitchen tap runs about 6 L a minute, 100 ml a second; here 60 ml a second so it can be followed.
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, rate) => (calm ? to : Math.abs(to - v) <= rate * dt ? to : v + Math.sign(to - v) * rate * dt);
        s.t += dt;
        const filling = s.want > s.ml + 0.1;
        if (calm) { s.ml = s.want; s.tap = 0; }
        else if (filling) { s.tap = step(s.tap, 1, 2.5); if (s.tap >= 1) s.ml = step(s.ml, s.want, 60); }
        else { s.tap = step(s.tap, 0, 2.5); s.ml = step(s.ml, s.want, 120); }
        draw();
        return s.ml !== s.want || s.tap > 0;
      };
      g.readout = () => {
        const c = s.ml / CUP, near = [[0.25, "¼ cup"], [0.5, "½ cup"], [0.75, "¾ cup"], [1, "1 cup"], [1.5, "1½ cups"]].find(([v]) => Math.abs(v - c) < 0.01);
        if (s.tap > 0.6) return `tap on · ${Math.round(s.ml)} ml, filling to the ${Math.round(s.want)} ml line`;
        return near ? `${near[1]} = ${Math.round(s.ml)} ml · read the mark level with the water's surface, eye at the same height` : `${Math.round(s.ml)} ml · 1 US cup = 240 ml, ½ cup = 120 ml, ¼ cup = 60 ml`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });

  function makeSpoons([cx, cy, size], o, t, parent, W, Hh, lab) {
    const PLAN = { x: -105, y: -75, w: 215, d: 150, r: 8 };
    const { P, g } = ISO.frame([...K.boxCorners(PLAN, -12, 0), [0, 0, 60]], cx, cy, W, Hh, { azimuth: 40, elevation: 46 }, parent);
    // a sugar bowl at the back right, the spoons, the sugar heap, the knife
    const SB = [70, -36];
    const bowl = ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 16], [2, 19, 1], [24, 26, 1], [30, 27], [30, 0]], zAx([SB[0], SB[1], 0]), P, { steps: 48 }), { tone: "hi" })) +
      `<path d="${G.circleOf(zAx([SB[0], SB[1], 0]), 28, 25.5, P, 48)}" fill="#fbfaf6" stroke="#9a968a" stroke-width=".7"/>`;
    g.innerHTML = counterSvg(P, PLAN) + `<g data-k="sbowl">${bowl}</g><g data-name="spoons">${spoonsSvg(P)}</g><g data-name="sugar"></g><g data-name="knife"></g><g data-k="words"></g>`;
    const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["spoons", "sugar", "knife", "words"].map((n) => [n, q(n)])), w = ISO.writer();
    const f0 = ISO.num(o, "fill", 1) > 0.5 ? 1 : 0;
    const s = { f: f0, want: f0 };
    let lit = o.lit || "";
    const draw = () => {
      const heap = ISO.smooth(0, 0.4, s.f), cut = ISO.smooth(0.5, 1, s.f), knifeOn = s.f > 0.4 && s.f < 1;
      w.rebuild(el.sugar, `${heap.toFixed(2)} ${cut.toFixed(2)}`, () => sugarSvg(P, heap, cut));
      w.rebuild(el.knife, knifeOn ? cut.toFixed(3) : "", () => (knifeOn ? knifeSvg(P, cut) : ""));
      w.rebuild(el.words, lab ? `${s.f >= 1}` : "", () => !lab ? "" : ISO.word(K.iso([SB[0], SB[1] + 30, 0], P), "sugar", "#555", { anchor: "start", size: 13, dy: 14 }) +
        ISO.word(K.iso([SPOONS[0].c[0], SPOONS[0].c[1] + SPOONS[0].r, 0], P), s.f >= 1 ? "1 tbsp, levelled" : "1 tbsp", "#7a5a2e", { size: 14, dy: 16 }));
      const want = lit || (knifeOn ? "knife" : s.f > 0 && s.f < 1 ? "sugar" : "");
      const groups = { spoons: [el.spoons], sugar: [el.sugar], knife: [el.knife] };
      w.light([el.spoons, el.sugar, el.knife], (groups[want] || []).filter(Boolean));
    };
    g.set = (p) => { if (p.fill !== undefined) s.want = +p.fill > 0.5 ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
    g.update = (dt) => {
      const calm = ISO.still();
      s.f = calm ? s.want : Math.abs(s.want - s.f) <= dt * 0.45 ? s.want : s.f + Math.sign(s.want - s.f) * dt * (s.want > s.f ? 0.45 : 1.5);
      draw();
      return s.f !== s.want;
    };
    g.readout = () => (s.f >= 1 ? "1 level tablespoon = 15 ml of sugar, about 12.5 g · a heaped one holds about half as much again"
      : s.f > 0.4 ? "sliding the knife across the rim: what sits above it falls off" : s.f > 0 ? "heaping sugar into the tablespoon" : "1 tbsp 15 ml · 1 tsp 5 ml · ½ tsp 2.5 ml · ¼ tsp 1.25 ml (3 teaspoons make a tablespoon)");
    draw();
    if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
    return g;
  }
})();
