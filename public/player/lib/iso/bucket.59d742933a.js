// "bucket cx cy k water=0..1 lab=0 lit=bucket|handle|water" — a PART (PARTS.md): a 12 L plastic bucket standing on
// the floor, its origin the floor point under its middle. A tapered moulded body (22 cm across at the foot, 28 cm at
// the rim, 28 cm tall) on a foot ring, two raised hoops, stacking ribs under a rolled rim, two lugs at the sides with
// a steel wire bail through them and a ribbed plastic grip on the bail. Inside, litre marks moulded up the far wall
// and the floor; the water is a flat glossy surface at water × the inside depth (12 L when full). set({ water }).
// World units: 1 = 1 cm (x along the wall, y into the room, z up).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const H = 28, RB = 11, RT = 14, WALL = 0.6, FL = 1.4, RIM = 14.9, ZR = 26.4;   // body, rim (outer r), rim's foot
  const rOut = (z) => RB + ((RT - RB) * (z - 0.8)) / (ZR - 0.8);                    // the body's outer radius at z
  const rIn = (z) => rOut(Math.min(z, ZR)) - WALL;                                   // the inside wall
  const DEPTH = H - FL;
  // litres held up to height z (a frustum from the inside floor), and the full 12 L-ish
  const vol = (z) => { const h = Math.max(0, z - FL), a = rIn(FL), b = rIn(FL + h); return (Math.PI * h * (a * a + a * b + b * b)) / 3 / 1000; };
  const FULL = vol(H - 1.6);                                                          // brim-full stops 1.6 cm under the rim
  const zFor = (l) => { let lo = FL, hi = H - 1.6; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; vol(m) < l ? (lo = m) : (hi = m); } return lo; };
  const BLUE = ISO.tint("#bfe0f7", ["#3f86c4", "#5598d0", "#6eaadb", "#8cbde4"], "#123f6a");
  const GRIP = ISO.T.plastic, STEEL = ISO.T.steel;
  let uid = 0;
  const ring = (P, z, r, n = 72) => Array.from({ length: n }, (_, i) => K.iso([r * Math.cos((i / n) * 2 * Math.PI), r * Math.sin((i / n) * 2 * Math.PI), z], P));

  // a bent wire through world points (G.fillet rounds the corners), drawn as short rods far to near
  function wire(P, pts, r, bend) {
    const path = G.fillet(pts, bend, 4), segs = [];
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1], d = b.map((v, j) => v - a[j]), l = Math.hypot(...d);
      if (l > 1e-3) segs.push({ a, d: d.map((v) => v / l), l });
    }
    return segs.map((sg, i) => ({ sg, i, k: K.depthOf(sg.a.map((v, j) => v + (sg.d[j] * sg.l) / 2), P) })).sort((p, q) => p.k - q.k)
      .map(({ sg, i }) => S(G.disc(i ? -0.05 : 0, sg.l, r, G.frameAlong(sg.a, sg.d), P, { rims: i === 0 ? "first" : i === segs.length - 1 ? "last" : "none", steps: 10 }), { tone: "hi", crease: "none" })).join("");
  }

  // a raised band round the body (a hoop), only its seen half: quads in the kit's shade tones by where they sit
  // across the bucket (light on the left, dark on the right), closed by its own outline
  function strip(P, face, z0, z1, dr) {
    const n = 36, a = (i) => face - Math.PI / 2 + (Math.PI * i) / n, at = (i, z) => K.iso([(rOut(z) + dr) * Math.cos(a(i)), (rOut(z) + dr) * Math.sin(a(i)), z], P);
    const out = [], x0 = at(0, z0)[0], x1 = at(n, z0)[0];
    for (let i = 0; i < n; i++) {
      const f = ((at(i, z0)[0] + at(i + 1, z0)[0]) / 2 - Math.min(x0, x1)) / Math.abs(x1 - x0), k = f < 0.2 ? 3 : f < 0.45 ? 2 : f < 0.75 ? 1 : 0;
      out.push(`<path d="${K.pathOf([at(i, z0), at(i + 1, z0), at(i + 1, z1), at(i, z1)], true)}" fill="var(--anatomy-shade-${k})" stroke="var(--anatomy-shade-${k})" stroke-width="0.4"/>`);
    }
    const top = Array.from({ length: n + 1 }, (_, i) => at(i, z1)), bot = Array.from({ length: n + 1 }, (_, i) => at(n - i, z0));
    const mid = Array.from({ length: n + 1 }, (_, i) => at(i, (z0 + z1) / 2));
    return out.join("") + `<path d="${K.pathOf(mid)}" fill="none" stroke="#bfe0f7" stroke-width="0.5" opacity=".7"/><path d="${K.pathOf([...top, ...bot], true)}" fill="none" stroke="#123f6a" stroke-width="0.6" stroke-linejoin="round"/>`;
  }
  // foot ring, body, hoops, stacking ribs, the litre label panel on the front
  function bodySvg(P, face) {
    const F = zAx([0, 0, 0]), out = [];
    out.push(S(G.lathe([[0, RB - 0.9], [0, RB - 0.2], [0.8, RB, 1], [0.8, RB - 0.9]], F, P, { steps: 72 }), { tone: "lo" }));
    out.push(S(G.lathe([[0.8, 0], [0.8, RB], [ZR, RT], [ZR, 0]], F, P, { steps: 64 }), { tone: "mid",
      inner: L(G.arcOf(F, 2.4, rOut(2.4) + 0.01, P, { trim: 0 }) + G.arcOf(F, 6, rOut(6) + 0.01, P, { trim: 0 }), { tone: "faint" }) }));
    for (const z of [9.5, 18.5]) out.push(strip(P, face, z, z + 1.2, 0.4));
    // stacking ribs under the rim: short vertical ribs from a band to the rim's skirt, ending on both
    const z0 = 21.5, z1 = ZR;
    out.push(strip(P, face, z0 - 0.6, z0, 0.3));
    out.push(L(G.ribsOf(F, z0, z1, rOut(z0) + 0.02, 40, P, { r1: rOut(z1) + 0.02, seams: true, least: 0.18 }), { tone: "lo" }));
    // the moulded label panel on the front (a slightly raised rounded patch) with its printed lines
    const pad = (s, a, dr = 0.08) => K.iso(G.pointOf(F, s, rOut(s) + dr, a), P), a0 = face - 0.32, a1 = face + 0.32, rr = [];
    for (let i = 0; i <= 12; i++) rr.push(pad(11.4, a0 + ((a1 - a0) * i) / 12));
    for (let i = 12; i >= 0; i--) rr.push(pad(16.8, a0 + ((a1 - a0) * i) / 12));
    out.push(`<path d="${K.pathOf(rr, true)}" fill="#e6f3fc" stroke="#123f6a" stroke-width="0.6" stroke-linejoin="round"/>`);
    const rule = (s, f) => K.pathOf(Array.from({ length: 7 }, (_, i) => pad(s, a0 + 0.07 + ((a1 - a0 - 0.14) * f * i) / 6, 0.1)));
    out.push(L(rule(15.4, 1) + rule(14, 0.7) + rule(12.6, 0.45), { tone: "lo", free: true }));
    return out.join("");
  }
  // lugs at the two sides (where the bucket's outline turns), each with the bail's pivot hole
  const lugAt = (side, face) => face + side * (Math.PI / 2);
  function lugSvg(P, a) {
    const e = [Math.cos(a), Math.sin(a), 0], t = [-Math.sin(a), Math.cos(a), 0], zc = 24.2;
    const at = (u, w, y) => [e[0] * (rOut(w) - 0.4 + u) + t[0] * y, e[1] * (rOut(w) - 0.4 + u) + t[1] * y, w];
    const hole = K.iso([e[0] * (rOut(zc) + 1.42) , e[1] * (rOut(zc) + 1.42), zc + 0.4], P);
    return ISO.box(at, P, [0, 1.4], [zc - 1.6, ZR], [-1.3, 1.3], "mid") + D([hole], { size: 0.5 }) +
      ISO.box(at, P, [1.35, 1.75], [zc - 0.6, zc + 1.4], [-0.9, 0.9], "mid");
  }
  // the rolled rim: a thick lip with a skirt hanging round the top of the body
  function rimSvg(P) {
    const F = zAx([0, 0, 0]);
    return S(G.lathe([[ZR - 0.9, RT - 0.1], [ZR - 0.9, RIM - 0.4], [ZR - 0.3, RIM, 1], [H - 0.6, RIM, 1], [H, RIM - 0.6, 1], [H, RT - 0.6], [H - 0.4, RT - 0.75]], F, P, { steps: 72, hole: [H, RT - 0.6] }), { tone: "mid" });
  }
  // what is seen through the mouth: the far inside wall, the litre marks, the floor, the water
  function insideSvg(P, id, face, zw) {
    const F = zAx([0, 0, 0]), mouth = K.pathOf(ring(P, H, RT - 0.6), true), out = [];
    out.push(`<defs><clipPath id="${id}"><path d="${mouth}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8dbde6"/><stop offset=".25" stop-color="#cfe6f8"/><stop offset="1" stop-color="#b4d8f3"/></linearGradient></defs>`);
    out.push(`<path d="${mouth}" fill="url(#${id}g)" stroke="none"/><g clip-path="url(#${id})">`);
    out.push(`<path d="${K.pathOf(ring(P, FL, rIn(FL)), true)}" fill="#a9d2ef" stroke="#123f6a" stroke-width="0.6"/>`);
    out.push(`<path d="${G.circleOf(F, FL + 0.01, 3.2, P)}" fill="none" stroke="#3f86c4" stroke-width="0.6"/>`);
    // litre marks: a moulded rule up the far wall with a tick every 2 L, a long one at 4, 8 and 12 L
    const back = face + Math.PI, tick = [], big = [], rule = [];
    const onWall = (z, da) => K.iso(G.pointOf(F, z, rIn(z) - 0.03, back + da / rIn(z)), P);
    const zs = [2, 4, 6, 8, 10, 12].map(zFor);
    for (let z = zs[0]; z <= zs.at(-1) + 0.01; z += 0.5) rule.push(onWall(z, 0));
    zs.forEach((z, i) => (i % 2 ? big : tick).push(K.pathOf([onWall(z, 0), onWall(z, i % 2 ? 2.2 : 1.2)])));
    out.push(`<path d="${K.pathOf(rule)}" fill="none" stroke="#2c6aa3" stroke-width="0.6"/><path d="${tick.join("")}" fill="none" stroke="#2c6aa3" stroke-width="0.5"/><path d="${big.join("")}" fill="none" stroke="#123f6a" stroke-width="0.6"/>`);
    if (zw > FL + 0.05) {
      const r = rIn(zw), surf = K.pathOf(ring(P, zw, r), true);
      const lens = (s, w, a, da) => { const pts = []; for (let i = 0; i <= 16; i++) pts.push(K.iso(G.pointOf(F, zw + 0.01, r * s, a - da + (2 * da * i) / 16), P)); for (let i = 16; i >= 0; i--) pts.push(K.iso(G.pointOf(F, zw + 0.01, r * (s - w), a - da + (2 * da * i) / 16), P)); return K.pathOf(pts, true); };
      out.push(`<path d="${surf}" fill="#4f93d4" stroke="#174f86" stroke-width="0.8"/>`);
      out.push(`<path d="${K.pathOf(ring(P, zw + 0.01, r * 0.72), true)}" fill="#6aa8e0" stroke="none"/>`);
      out.push(`<path d="${lens(0.86, 0.12, back + 0.5, 0.55)}" fill="#ffffff" fill-opacity=".85"/><path d="${lens(0.55, 0.07, back + 0.9, 0.35)}" fill="#ffffff" fill-opacity=".6"/>`);
    }
    out.push("</g>");
    return out.join("");
  }
  function handleSvg(P, face) {
    const e = [Math.cos(face + Math.PI / 2), Math.sin(face + Math.PI / 2), 0], back = [-Math.cos(face), -Math.sin(face), 0];
    const tilt = 0.28, up = [back[0] * Math.sin(tilt), back[1] * Math.sin(tilt), Math.cos(tilt)], zc = 24.6, R0 = rOut(24.2) + 1.42, h = 16.5;
    const at = (s, v) => [e[0] * s + up[0] * v, e[1] * s + up[1] * v, zc + up[2] * v];
    const out = [];
    // the bail: hooked into one lug, up, across the top, down into the other
    out.push(ISO.tinted(STEEL, wire(P, [at(-R0 + 1, 0), at(-R0 - 0.4, 0), at(-R0 - 0.4, 3), at(-R0 + 2.5, h), at(R0 - 2.5, h), at(R0 + 0.4, 3), at(R0 + 0.4, 0), at(R0 - 1, 0)], 0.22, 3.2)));
    // the grip: a ribbed plastic sleeve on the bail's top
    const top = at(0, h), Fg = G.frameAlong(G.add3(top, G.mul3(e, -6)), e), prof = [];
    prof.push([0, 0.4], [0.3, 0.95, 1]);
    for (let i = 0; i < 6; i++) { const s = 1.2 + i * 1.9; prof.push([s, 1.05, 1], [s + 0.95, 1.2, 1]); }
    prof.push([12 - 0.3, 0.95, 1], [12, 0.4]);
    out.push(ISO.tinted(GRIP, S(G.solidOf(prof, Fg, P, { steps: 24 }), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "bucket", title: "Bucket (part)", compare: null,
    about: "A 12 L plastic bucket with a steel wire handle and grip, litre marks inside and water up to `water` × its depth; a part to place in any scene. anchors: rim",
    line: "bucket cx cy k water=0..1 lab=0 lit=bucket|handle|water",
    demo: { line: "bucket 480 420 8 water=0.2 lab=1", script: [{ set: { water: 0.7 }, hold: "settle" }, { set: { lit: "handle" }, hold: 1.5 }, { set: { water: 0, lit: "water" }, hold: "settle" }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", id = `bucket-in${uid++}`;
      const face = G.angleToward(zAx([0, 0, 0]), G.viewOf(P));
      const halo = { x: -RB - 2, y: -RB - 2, w: 2 * RB + 4, d: 2 * RB + 4, r: RB + 2 };
      const far = lugAt(-1, face), near = lugAt(1, face);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, -1, 1, P)}"/>` +
        `<g data-name="bucket" style="${BLUE}">${bodySvg(P, face)}${lugSvg(P, far)}${lugSvg(P, near)}</g>` +
        `<g data-name="bucket" style="${BLUE}">${rimSvg(P)}</g><g data-name="water" data-part="inside"></g>` +
        `<g data-name="handle" data-part="handle"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      ISO.later(() => { el.handle.innerHTML = handleSvg(P, face); el.handle._fresh = true; draw(); });   // the bail and grip: a build part of their own
      const s = { f: ISO.clamp(ISO.num(o, "water", 0), 0, 1), fT: 0, lit: o.lit || "" };
      s.fT = s.f;
      const zOf = (f) => zFor(f * FULL);
      const draw = () => {
        w.rebuild(el.inside, s.f.toFixed(3), () => insideSvg(P, id, face, zOf(s.f)));
        if (lab) w.rebuild(el.words, s.f.toFixed(2), () => ISO.word(K.iso([0, RB + 3, 0], P), "bucket", "#444", { size: 13, dy: 18 }) +
          (s.f > 0.02 ? ISO.word(K.iso(G.pointOf(zAx([0, 0, 0]), H, RIM, face + 1.1), P), `${(s.f * FULL).toFixed(1)} L`, "#1f5f9c", { size: 13, anchor: "start", dy: -4 }).replace('x="', 'dx="10" x="') : ""));
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.anchors = { rim: [0, RIM, H] };   // the rim's front middle: a sponge or a glove hangs over it here
      g.set = (p) => { if (p.water !== undefined) s.fT = ISO.clamp(+p.water || 0, 0, 1); if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => { s.f = ISO.follow(s.f, s.fT, dt, 0.5, ISO.still()); draw(); return s.f !== s.fT; };
      g.readout = () => `bucket 28 cm tall · ${(s.f * FULL).toFixed(1)} L of water of ${FULL.toFixed(0)} L · ${(zOf(s.f) - FL).toFixed(1)} cm deep`;
      draw();
      return g;
    },
  });
})();
