// Batch b21 helpers (PARTS.md, batch 5): shared by the b21 parts (the motor's coil, split ring, brush, bearing post and
// crank; the pendulum's clamp, bob and protractor). Not a recipe: it only defines window.B21. World units: 1 = 1 cm.
(() => {
  const B21 = (window.B21 = {});
  const K = () => window.K;
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B21.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // painter's order for convex pieces that turn: [world centre, svg] sorted far → near
  B21.sorted = (items, P) => items.map(([c, svg]) => [K().depthOf(c, P), svg]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).join("");
  // a frame → at(a, u, v) world point, for ISO.box along any axis
  B21.at = (F) => (a, u, v) => [0, 1, 2].map((i) => F.o[i] + F.a[i] * a + F.u[i] * u + F.v[i] * v);
  // The turning of everything on the motor's axle (coil, split ring, crank): one law, so parts set alike turn alike.
  // rpm eased up or down over about a second (a real rotor's inertia), angle = where it starts (deg about +x).
  B21.spin = (o) => {
    const s = { a: (ISO.num(o, "angle", 35) * Math.PI) / 180, w: 0, rpm: ISO.clamp(ISO.num(o, "rpm", 0), 0, 300) };
    s.w = s.rpm / 60;                                       // rev/s, already turning when built with rpm
    s.set = (p) => {
      if (p.rpm !== undefined && p.rpm !== "" && Number.isFinite(+p.rpm)) s.rpm = ISO.clamp(+p.rpm, 0, 300);
      if (p.angle !== undefined && p.angle !== "" && Number.isFinite(+p.angle)) s.a = (ISO.clamp(+p.angle, -360, 360) * Math.PI) / 180;
    };
    s.step = (dt) => {
      const calm = ISO.still() || dt > 1, T = s.rpm / 60;
      s.w = ISO.follow(s.w, T, dt, T > s.w ? 0.5 : 0.8, calm);
      if (!calm) s.a = (s.a + s.w * Math.PI * 2 * dt) % (Math.PI * 2);
      return !calm && (s.w > 0 || s.w !== T);
    };
    return s;
  };
})();
