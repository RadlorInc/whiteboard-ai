// "meshfence cx cy k w=60..600 lab=0 lit=posts|rail|mesh" — a PART (batch 6): one run of celltower.js's compound
// fence at real size, w cm long (300 by default) along x and 200 cm high: galvanised tube posts 5 cm across with
// domed caps at both ends and every 2.5 m or less between (each set in a small concrete footing), a 4 cm top rail
// through loop caps, a tension wire along the bottom, and the chain-link mesh (5 cm diamonds) between them, every
// wire ending on a post, the rail or the bottom wire. Runs meet at their end posts (place the next at an end anchor
// with flip or a turned run). Origin: the ground point under the run's middle, the mesh in the plane y = 0. Static.
// World: 1 = 1 cm. anchors: left right (the end posts' feet), top (the rail's middle).
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const H = 200, RP = 2.5, RR = 2, ZW = 6, ZR = H - 6, D = 5;
  const CONC = ISO.tint("#e4e2dc", ["#aeaba3", "#bab7af", "#c6c3bb", "#d2cfc7"], "#5f5c55");

  function fenceSvg(P, W, lab) {
    const n = Math.max(1, Math.ceil(W / 250)), xs = Array.from({ length: n + 1 }, (_, i) => -W / 2 + (W * i) / n);
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -W / 2 - 6, y: -6, w: W + 12, d: 12, r: 4 }, 0, 0.1, P)}"/>`];
    out.push(ISO.tinted(CONC, xs.map((x) => S(K.cylinder(x, 0, 7, 0, 3, P, 20), { tone: "mid" })).join("")));
    // the mesh: two families of 45° wires in the plane y = 0, each clipped to its bay (post face to post face,
    // bottom wire to rail), so every wire ends on the frame
    const wires = [];
    for (let i = 0; i < n; i++) {
      const x0 = xs[i] + RP, x1 = xs[i + 1] - RP, z0 = ZW, z1 = ZR - RR + 0.5, bh = z1 - z0;
      for (const dir of [1, -1]) {
        // a wire z = z0 + dir·(x − c), c on a 5 cm grid: it spans x ∈ [c, c + bh] (or [c − bh, c]) between the
        // bottom wire and the rail; cut that to the bay between the post faces
        for (let c = x0 - bh; c <= x1 + bh; c += D) {
          const xa = Math.max(x0, dir > 0 ? c : c - bh), xb = Math.min(x1, dir > 0 ? c + bh : c);
          if (xb - xa < 0.7) continue;
          wires.push(K.pathOf([xa, xb].map((x) => K.iso([x, 0, z0 + dir * (x - c)], P))));
        }
      }
    }
    out.push(`<g data-name="mesh"><path d="${wires.join("")}" fill="none" stroke="#8d939a" stroke-width="${Math.max(0.35, K.cameraOf(P).k * 0.35).toFixed(2)}"/>` +
      `<path d="${K.pathOf([K.iso([xs[0], 0, ZW], P), K.iso([xs[n], 0, ZW], P)])}" stroke="#6a7078" stroke-width="${Math.max(0.6, K.cameraOf(P).k * 0.5).toFixed(2)}"/></g>`);
    // the posts with their caps (loop caps between, domed caps at the ends) and the rail through them
    const posts = xs.map((x, i) => ISO.tinted(B31.GALV, S(K.cylinder(x, 0, RP, 3, H - 5, P, 18), { tone: "mid", crease: "none" }) +
      (i === 0 || i === n ? S(window.G.solidOf([[H - 2, RP + 0.5], [H, RP + 0.3, 1], [H + 1.6, 1.2, 1], [H + 2, 0]], window.G.frameOf([x, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P, { steps: 18 }), { tone: "mid" }) : S(K.cylinder(x, 0, RP + 0.6, ZR - 4, 8, P, 18), { tone: "mid" }))));
    out.push(`<g data-name="posts">${posts.join("")}</g>`);
    out.push(`<g data-name="rail">${ISO.tinted(B31.GALV, S(window.G.disc(xs[0] + RP, xs[n] - RP, RR, window.G.frameAlong([0, 0, ZR], [1, 0, 0]), P), { tone: "mid", crease: "none" }))}</g>`);
    if (lab) out.push(ISO.word(K.iso([xs[n], 0, H + 6], P), "fence", "#444", { size: 13, anchor: "start" }).replace('x="', 'dx="6" x="'));
    return out.join("");
  }

  ISO.add({
    name: "meshfence", title: "Chain-link fence run (part)", compare: null,
    about: "One run of a compound's chain-link fence, w cm long and 2 m high: galvanised posts at the ends and every 2.5 m, a top rail, a bottom tension wire and 5 cm diamond mesh. anchors: left right top",
    line: "meshfence cx cy k w=60..600 lab=0 lit=posts|rail|mesh",
    demo: { line: "meshfence 480 410 1.5 w=300", script: [{ set: {}, hold: 1 }, { set: { lit: "posts" }, hold: 1.2 }, { set: { lit: "mesh" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", W = Math.round(B31.num(o, "w", 300, 60, 600));
      g.innerHTML = fenceSvg(P, W, lab);
      g.anchors = { left: [-W / 2, 0, 0], right: [W / 2, 0, 0], top: [0, 0, H] };
      const w = ISO.writer();
      g.set = (p) => { if (p.lit !== undefined) B31.light(w, g, p.lit); };
      g.update = () => false;
      g.readout = () => `chain-link fence · a ${(W / 100).toFixed(1)} m run, 2 m high · posts every ${(W / Math.max(1, Math.ceil(W / 250)) / 100).toFixed(1)} m`;
      B31.light(w, g, o.lit || "");
      return g;
    },
  });
})();
