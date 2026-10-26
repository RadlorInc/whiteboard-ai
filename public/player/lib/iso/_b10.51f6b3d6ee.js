// Batch b10 helpers (PARTS.md, batch 5): bits the collision, cradle and crystal parts share. Not a recipe: it only
// defines window.B10. World units are cm unless a part says it builds in mm (ISO.mm); anchors stay in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const B10 = (window.B10 = {});
  // Light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups get rebuilt).
  B10.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // A round rod between two world points (legs, rails, ties).
  B10.rod = (P, a, b, r, tone = "mid") => {
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d), ax = d.map((v) => v / L);
    const u = G.unit3(G.cross3(ax, Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1])), v = G.cross3(ax, u);
    return S(G.disc(0, L, r, G.frameOf(a, ax, u, v), P), { tone });
  };

  // ── things that ride on a dynamics trolley (labtrolley's road: tilt°, x cm down the road toward −x, v = a real roll).
  // body(rd) returns { svg, anchors } built in the road frame rd.at(u along the road, w up from it, y across) about the
  // part's own origin; the whole group then moves as one flat screen move, exactly as labtrolley's does, so a pad or a
  // block placed on a trolley with the same tilt, x and v stays on it. keys(p) handles the part's own keys (true = rebuild).
  const g9 = 981, rad = (d) => (d * Math.PI) / 180;
  B10.roadOf = (th) => { const d = [Math.cos(th), 0, Math.sin(th)], n = [-Math.sin(th), 0, Math.cos(th)]; return { d, n, at: (u, w, y) => [u * d[0] + w * n[0], y, u * d[2] + w * n[2]] }; };
  B10.ride = (g, P, o, body, keys = () => false) => {
    const s = { th: rad(ISO.clamp(ISO.num(o, "tilt", 0), -40, 40)), x: ISO.clamp(ISO.num(o, "x", 0), 0, 200), to: 0, vel: 0, v: o.v === "1", lit: o.lit || "" };
    s.to = s.x;
    g.innerHTML = `<g data-part="ride"></g>`;
    const car = g.firstChild, w = ISO.writer();
    const build = () => { const b = body(B10.roadOf(s.th)); car.innerHTML = b.svg; g.anchors = b.anchors; };
    const draw = () => {
      const rd = B10.roadOf(s.th), x = Math.round(s.x * 100) / 100;
      w.attr(car, "transform", K.translateAlong(P, [-x * rd.d[0], 0, -x * rd.d[2]]));
      B10.light(w, g, s.lit);
    };
    s.accel = () => g9 * Math.sin(s.th);
    g.set = (p) => {
      let again = keys(p);
      if (p.tilt !== undefined && Number.isFinite(+p.tilt)) { const th = rad(ISO.clamp(+p.tilt, -40, 40)); if (th !== s.th) { s.th = th; again = true; } }
      if (p.v !== undefined) s.v = String(p.v) === "1";
      if (p.x !== undefined && Number.isFinite(+p.x)) { s.to = ISO.clamp(+p.x, 0, 200); if (s.to < s.x || !s.v) s.vel = 0; }
      if (p.lit !== undefined) s.lit = p.lit;
      if (again) build();
      draw();
    };
    g.update = (dt) => {
      if (ISO.still() || dt > 1) { s.x = s.to; s.vel = 0; }
      else if (s.v && s.accel() > 0 && s.to > s.x) { s.vel += s.accel() * dt; s.x += s.vel * dt; if (s.x >= s.to) { s.x = s.to; s.vel = 0; } }
      else { s.x = ISO.follow(s.x, s.to, dt, 0.35, false); s.vel = 0; }
      draw();
      return s.x !== s.to;
    };
    s.where = () => (s.x ? ` · ridden ${s.x.toFixed(1)} cm down a ${Math.round((s.th * 180) / Math.PI)}° road` : "");
    build(); draw();
    return s;
  };
  // u ranges for a part that faces +u (aim=right) or −u (aim=left): R(a, b) mirrors a..b when it faces −u
  B10.side = (o) => (o.aim === "right" ? 1 : -1);
  B10.span = (sg) => (a, b) => (sg > 0 ? [a, b] : [-b, -a]);
  // a slot-head screw along the road direction (its head toward sg), on a face at u
  B10.screw = (P, rd, u, w, y, sg, r = 0.2) => {
    const F = G.frameOf(rd.at(u, w, y), rd.d.map((v) => v * sg), [0, 1, 0], rd.n);
    return ISO.tinted(ISO.T.steel, S(G.disc(0, r * 0.45, r, F, P), { tone: "hi" })) +
      `<path d="${K.segment(G.pointOf(F, r * 0.46, r * 0.75, 0), G.pointOf(F, r * 0.46, r * 0.75, Math.PI), P)}" stroke="#3c3f45" stroke-width="${Math.max(0.4, G.scaleOf(P) * r * 0.2).toFixed(2)}" data-free=""/>`;
  };

  // ── minerals (crystals.js): plate words, colour and habit
  B10.MIN = {
    purple: { name: "amethyst · quartz, SiO₂", shape: "hex", col: "#a77bd6", ink: "#4b2a7a", say: "six-sided prisms with pointed tips · hardness 7" },
    white: { name: "rock crystal · quartz, SiO₂", shape: "hex", col: "#eef3f8", ink: "#5d7f96", say: "six-sided prisms with pointed tips · hardness 7" },
    blue: { name: "copper(II) sulfate, CuSO₄·5H₂O", shape: "slab", col: "#3f8fe0", ink: "#163f74", say: "slanted blocks (triclinic) · grown from a saturated solution" },
    green: { name: "fluorite, CaF₂", shape: "cube", col: "#7ccf8e", ink: "#22603a", say: "cubes, often twinned · hardness 4" },
  };
  B10.mineral = (c) => B10.MIN[c] || B10.MIN.purple;
})();
