// "woodblock cx cy k kind=float|pull tilt=-40..40 x=0..200 v=0|1 mu=0.1..0.9 water=0|1 lab=0 lit=block|eye" — a PART
// (PARTS.md, batch 5): a wooden block. kind=float: a 6 × 4 × 3.5 cm pine block (0.6 g/cm³, 50 g), the density tank's;
// kind=pull: a 10 × 6 × 6 cm beech block (0.7 g/cm³, 252 g) with a screw eye in its +x end for a string or a force
// meter, the ramp's. Eased edges, long grain on the top and sides, growth rings on the end grain, its mass stamped on
// top. Its origin the surface point under its middle on a road rising along +x at tilt degrees (as labtrolley: at=
// <rampboard>.top tilt=<deg> sits it on the board). x = how far it has slid down its road (toward −x, cm). v=1: let go
// from rest, it sticks while tan θ ≤ μ (static friction holds it, mu = μs), and once the road is steeper it slides,
// speeding up at a = g(sin θ − μk cos θ), μk = 0.75 μs, until it gets there; v=0 it is pushed or pulled there, eased.
// water=1: it floats, its origin the water's surface point, 60 % (70 %) of its height under; set({ water: 1 }) drops it
// in from 2 cm and it bobs into place under real buoyancy (ω² = g / depth, a little drag). set({ tilt, x, v, mu, water }).
// The block moves as one flat screen move (a world move), rebuilt only when tilt or kind changes. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), g9 = 981;
  const KIND = {
    float: { l: 6, w: 4, h: 3.5, rho: 0.6, wood: "pine", tint: ISO.tint("#f9ecd2", ["#dcb987", "#e5c89c", "#ecd5b1", "#f3e1c4"], "#7a5a2e"), grain: "#c49a5e" },
    pull: { l: 10, w: 6, h: 6, rho: 0.7, wood: "beech", tint: ISO.tint("#f6e3c4", ["#d2a46c", "#dbb37f", "#e3c294", "#ebd0aa"], "#74511f"), grain: "#b4844a" },
  };
  const rad = (d) => (d * Math.PI) / 180;
  const roadOf = (th) => { const d = [Math.cos(th), 0, Math.sin(th)], n = [-Math.sin(th), 0, Math.cos(th)]; return { d, n, at: (u, w, y) => [u * d[0] + w * n[0], y, u * d[2] + w * n[2]] }; };

  function blockSvg(P, kd, rd, eye, lab, flat) {
    const { l, w: wd, h } = kd, hl = l / 2, hy = wd / 2, c = Math.min(0.3, h * 0.08), at = rd.at, out = [];
    if (flat) out.push(`<path class="iso-halo" d="${K.haloOf({ x: -hl - 0.4, y: -hy - 0.4, w: l + 0.8, d: wd + 0.8, r: 0.6 }, 0, 0.2, P)}"/>`);
    // the block: an eight-sided section (all four long edges eased) run along u
    const sec = [[-hy + c, 0], [hy - c, 0], [hy, c], [hy, h - c], [hy - c, h], [-hy + c, h], [-hy, h - c], [-hy, c]];
    const V = [...sec.map(([y, z]) => at(-hl, z, y)), ...sec.map(([y, z]) => at(hl, z, y))], n = sec.length;
    const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => i + n), ...sec.map((_, i) => [i, (i + 1) % n, ((i + 1) % n) + n, i + n])];
    out.push(`<g data-name="block">${ISO.tinted(kd.tint, ISO.poly(V, F, P, "mid"))}`);
    // grain: long lines on the top and the near side (+y), each from end to end; growth rings on the +x end grain
    const run = (pts) => K.pathOf(pts.map((p) => K.iso(p, P)));
    const grain = [];
    for (const [f, a] of [[0.22, 0.05], [0.46, -0.06], [0.7, 0.04]]) grain.push(run(Array.from({ length: 9 }, (_, i) => at(-hl + 0.02 + ((l - 0.04) * i) / 8, h + 0.005, -hy + c + (wd - 2 * c) * f + a * Math.sin(i * 1.3)))));
    for (const [f, a] of [[0.3, 0.06], [0.62, -0.05]]) grain.push(run(Array.from({ length: 9 }, (_, i) => at(-hl + 0.02 + ((l - 0.04) * i) / 8, c + (h - 2 * c) * f + a * Math.sin(i * 1.1 + 1), hy + 0.005))));
    const rings = [];
    for (const r of [0.45, 0.85, 1.3].map((q) => q * h)) {
      const pts = [];
      for (let i = 0; i <= 24; i++) { const q = Math.PI * (0.05 + (0.9 * i) / 24), y = -hy * 0.4 + Math.cos(q) * r, z = -h * 0.35 + Math.sin(q) * r; if (Math.abs(y) < hy - c && z > c && z < h - c) pts.push(at(hl + 0.005, z, y)); }
      if (pts.length > 1) rings.push(run(pts));
    }
    out.push(`<path d="${grain.join("")}" fill="none" stroke="${kd.grain}" stroke-width="0.6" stroke-linecap="round"/><path d="${rings.join("")}" fill="none" stroke="${kd.grain}" stroke-width="0.6"/>`);
    // its mass stamped on the top, read from the near side
    const m = Math.round(kd.rho * l * wd * h);
    out.push(LAB.faceText(P, at(-hl * 0.3, h + 0.01, hy * 0.25), rd.d, `${m} g`, Math.min(1.1, wd * 0.22), "#8a6a3a", [0, -1, 0]), "</g>");
    if (eye) {
      // the screw eye in the +x end, at mid height: a threaded shank into the end grain and a ring in the x–z plane
      const Fo = G.frameOf(at(hl, h / 2, 0), rd.d, [0, 1, 0], rd.n), rr = 0.45, rw = 0.07, ring = [];
      for (let i = 0; i <= 28; i++) { const q = (i / 28) * Math.PI * 2; ring.push(G.pointOf(Fo, 0.55 + rr - Math.cos(q) * rr, 0, 0).map((v, j) => v + rd.n[j] * Math.sin(q) * rr)); }
      out.push(`<g data-name="eye">${ISO.tinted(ISO.T.steel, S(G.disc(-0.02, 0.12, 0.2, Fo, P), { tone: "lo" }) + S(G.disc(0.12, 0.55, 0.09, Fo, P), { tone: "mid" }))}${PHYS.wire(P, PHYS.path(P, ring), rw, { ink: "#3c3f45", body: "#b6b9be", shine: "#eef0f2" })}</g>`);
    }
    if (lab) out.push(CIRC.word(P, at(hl, h + 0.5, hy), `${kd.wood} block`));
    const eyeAt = at(hl + 0.55 + 2 * 0.45, h / 2, 0);
    return { svg: out.join(""), anchors: { top: at(0, h, 0).map((v) => +v.toFixed(3)), eye: eyeAt.map((v) => +v.toFixed(3)) } };
  }

  ISO.add({
    name: "woodblock", title: "Wooden block (part)", compare: null,
    about: "A wooden block: a 6 × 4 × 3.5 cm pine block that floats 60 % under and bobs into place, or a 10 × 6 × 6 cm beech block with a screw eye that sticks on a slope while tan θ ≤ μ, then slides at g(sin θ − μk cos θ). anchors: top eye",
    line: "woodblock cx cy k kind=float|pull tilt=-40..40 x=0..200 v=0|1 mu=0.1..0.9 water=0|1 lab=0 lit=block|eye",
    demo: { line: "woodblock 560 320 30 kind=pull tilt=15 v=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { x: 6, lit: "block" }, hold: 1.5 }, { set: { tilt: 28, lit: "eye" }, hold: "settle" }, { set: { tilt: 0, x: 0, v: 0, mu: 0.5, lit: "" }, hold: "settle" }, { set: { kind: "float", water: 1, lit: "block" }, hold: "settle" }, { set: { water: 0 }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { kind: KIND[o.kind] ? o.kind : "float", th: rad(ISO.clamp(ISO.num(o, "tilt", 0), -40, 40)), mu: ISO.clamp(ISO.num(o, "mu", 0.4), 0.1, 0.9), v: o.v === "1", water: o.water === "1", lit: o.lit || "" };
      const s = { x: ISO.clamp(ISO.num(o, "x", 0), 0, 200), to: 0, vel: 0, bob: { x: 0, v: 0 }, holding: false };
      s.to = s.x;
      g.innerHTML = `<g data-part="body"></g>`;
      const body = g.firstChild, w = ISO.writer();
      const kd = () => KIND[st.kind], th = () => (st.water ? 0 : st.th), sunk = () => kd().rho * kd().h;
      let built = "";
      const build = () => {
        const key = `${st.kind} ${th()} ${st.water}`;
        if (key === built) return;
        built = key;
        const b = blockSvg(P, kd(), roadOf(th()), st.kind === "pull", lab, th() === 0 && !st.water);
        body.innerHTML = b.svg;
        // floating, the origin is the water's surface point: the block sits `sunk` under it
        g.anchors = st.water ? Object.fromEntries(Object.entries(b.anchors).map(([n, p]) => [n, [p[0], p[1], +(p[2] - sunk()).toFixed(3)]])) : b.anchors;
      };
      const draw = () => {
        build();
        const rd = roadOf(th()), x = Math.round(s.x * 100) / 100, dz = st.water ? -sunk() + s.bob.x : 0;
        body.setAttribute("transform", K.translateAlong(P, [-x * rd.d[0], 0, -x * rd.d[2] + Math.round(dz * 1000) / 1000]));
        LAB.light(w, g, st.lit);
      };
      const slides = () => Math.tan(th()) > st.mu + 1e-9;
      const accel = () => g9 * (Math.sin(th()) - 0.75 * st.mu * Math.cos(th()));   // cm/s² down the road while it slides
      g.set = (p) => {
        const fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
        if (p.kind !== undefined && KIND[p.kind]) st.kind = p.kind;
        if (fin(p.tilt)) st.th = rad(ISO.clamp(+p.tilt, -40, 40));
        if (fin(p.mu)) st.mu = ISO.clamp(+p.mu, 0.1, 0.9);
        if (p.v !== undefined) st.v = String(p.v) === "1";
        if (fin(p.x)) { s.to = ISO.clamp(+p.x, 0, 200); if (s.to < s.x || !st.v) s.vel = 0; }
        if (p.water !== undefined) { const on = String(p.water) === "1"; if (on && !st.water) { s.bob = { x: 2, v: 0 }; s.x = s.to = 0; s.vel = 0; } if (!on) s.bob = { x: 0, v: 0 }; st.water = on; }
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still() || dt > 1;
        let moving = false;
        if (st.water) {
          // the bob: buoyancy is a spring of ω² = g / (depth under water), with water's drag (ζ ≈ 0.15)
          if (calm) s.bob = { x: 0, v: 0 }; else moving = PHYS.bounce(s.bob, 0, dt, Math.sqrt(g9 / 100 / (sunk() / 100)), 0.15);
          s.holding = false;
        } else if (s.x !== s.to) {
          if (calm) { s.x = s.to; s.vel = 0; }
          else if (st.v && s.to > s.x) {
            // let go: static friction holds it while tan θ ≤ μs; steeper, it slides from rest, a = g(sin θ − μk cos θ)
            s.holding = !slides();
            if (!s.holding) { s.vel += accel() * dt; s.x = Math.min(s.to, s.x + s.vel * dt); if (s.x === s.to) s.vel = 0; }
          } else { s.x = ISO.follow(s.x, s.to, dt, 0.35, false); s.vel = 0; s.holding = false; }
          moving = s.x !== s.to && !s.holding;
        } else s.holding = false;
        draw();
        return moving;
      };
      g.readout = () => {
        const d = kd(), m = Math.round(d.rho * d.l * d.w * d.h), deg = Math.round((th() * 180) / Math.PI), head = `${d.wood} block ${d.l} × ${d.w} × ${d.h} cm · ${m} g`;
        if (st.water) return `${head} · ${d.rho} g/cm³ floats ${Math.round(d.rho * 100)} % under: it pushes aside its own weight of water`;
        const tn = Math.tan(th()).toFixed(2);
        if (s.holding || (st.v && !slides() && deg > 0)) return `${head} · on a ${deg}° slope: tan θ = ${tn} ≤ μ = ${st.mu}, friction holds it`;
        if (s.vel > 0) return `${head} · sliding: tan θ = ${tn} > μ = ${st.mu}, a = g(sin θ − μk cos θ) = ${(accel() / 100).toFixed(2)} m/s² · ${(s.vel / 100).toFixed(2)} m/s`;
        return `${head} · ${s.x.toFixed(1)} cm down a ${deg}° road`;
      };
      draw();
      return g;
    },
  });
})();
