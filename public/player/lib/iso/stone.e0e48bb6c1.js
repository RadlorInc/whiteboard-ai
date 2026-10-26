// "stone cx cy k water=0|1 depth=0..30 lab=0 lit=stone" — a PART (PARTS.md, batch 5): the density scene's stone, an
// irregular lump of grey granite about 5 × 4 × 3 cm (the convex hull of 26 knobbly corners, flecks of quartz and mica
// on its faces), 2.6 g/cm³. water=0: it rests on a surface, origin the point under its middle. water=1: it is in water,
// origin the water's surface point (at= a glasstank's `water`, depth= that tank's depth); set({ water: 1 }) drops it
// in from 3 cm: it falls under gravity, then sinks under its weight less the upthrust, slowed by drag to its terminal
// speed, shown 4× slower, and rests on the floor depth cm down; the part under water washed blue. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, g9 = 981, RHO = 2.6, DROP = 3;
  const GRANITE = ISO.tint("#c9c6bf", ["#7d7a74", "#8e8b84", "#a09d96", "#b4b1aa"], "#3f3d39");
  // a water-worn lump: 26 points on a squashed ellipsoid pushed in and out a little (seeded, so every build is the same),
  // wrapped in their convex hull (every triple with all the other points on one side is a face)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const P0 = Array.from({ length: 26 }, (_, i) => {
    const zz = 1 - (2 * (i + 0.5)) / 26, r = Math.sqrt(1 - zz * zz), a = i * 2.39996 + rnd() * 0.5, j = 0.9 + rnd() * 0.2;
    return [Math.cos(a) * r * 2.5 * j, Math.sin(a) * r * 2.0 * j, zz * 1.5 * (0.85 + rnd() * 0.25)];
  });
  const zMin = Math.min(...P0.map((v) => v[2])), V = P0.map(([x, y, z]) => [x, y, z - zMin]);
  const F = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) for (let l = j + 1; l < V.length; l++) {
    const [a, b, c] = [V[i], V[j], V[l]], u = b.map((x, n) => x - a[n]), w = c.map((x, n) => x - a[n]);
    const nn = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    let pos = 0, neg = 0;
    for (const q of V) { const d = (q[0] - a[0]) * nn[0] + (q[1] - a[1]) * nn[1] + (q[2] - a[2]) * nn[2]; if (d > 1e-9) pos++; else if (d < -1e-9) neg++; }
    if (!pos || !neg) F.push([i, j, l]);
  }
  const TOP = Math.max(...V.map((v) => v[2]));
  // flecks: points on the faces (pale quartz, dark mica)
  const FLECKS = F.flatMap((f, n) => [[0.2, 0.3], [0.55, 0.25], [0.3, 0.55]].slice(0, 1 + (n % 3)).map(([u, v], m) => {
    const [a, b, c] = f.map((i) => V[i]), p = [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * u + (c[i] - a[i]) * v);
    const mid = [0, 0, TOP / 2];
    return { p: p.map((x, i) => x + (x - mid[i]) * 0.01), face: n, pale: (n + m) % 3 !== 0 };
  }));

  ISO.add({
    name: "stone", title: "Stone (part)", compare: null,
    about: "An irregular granite stone about 5 × 4 × 3 cm (2.6 g/cm³) that rests on a surface, or drops into water and sinks to the floor at its terminal speed. anchors: top",
    line: "stone cx cy k water=0|1 depth=0..30 lab=0 lit=stone",
    demo: { line: "stone 480 200 50 depth=5 lab=1", script: [{ set: {}, hold: 1 }, { set: { water: 1, lit: "stone" }, hold: "settle" }, { set: { lit: "" }, hold: 1.2 }, { set: { water: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const depth = ISO.clamp(ISO.num(o, "depth", 16), 0, 30), view = G.viewOf(P), VOL = B11.volume(V, F), E = B11.edges(F);
      const st = { water: o.water === "1", z: 0, v: 0, lit: o.lit || "" };
      const rest = () => (st.water ? -depth : 0);   // the stone's bottom, from the origin
      st.z = rest();
      // which faces the camera sees (the flecks go only there)
      const seen = F.map((f) => { const [a, b, c] = f.map((i) => V[i]), u = b.map((x, i) => x - a[i]), w = c.map((x, i) => x - a[i]); let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; const fc = f.reduce((s, i) => s.map((x, j) => x + V[i][j] / f.length), [0, 0, 0]); if (n[0] * fc[0] + n[1] * fc[1] + n[2] * (fc[2] - TOP / 2) < 0) n = n.map((x) => -x); return n[0] * view[0] + n[1] * view[1] + n[2] * view[2] > 0; });
      const fl = FLECKS.filter((q) => seen[q.face]);
      const body = `<g data-name="stone">${ISO.tinted(GRANITE, ISO.poly(V, F, P, "lo"))}` +
        K.dotsSvg(fl.filter((q) => q.pale).map((q) => K.iso(q.p, P)), { size: 0.6, tone: "faint" }).replace("<g", '<g style="--anatomy-faint:#efece4"') +
        K.dotsSvg(fl.filter((q) => !q.pale).map((q) => K.iso(q.p, P)), { size: 0.5, tone: "lo" }) + `</g>`;
      g.innerHTML = `<g data-part="shadow"></g><g data-part="body">${body}<g data-part="wet"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const z = Math.round(st.z * 1000) / 1000;
        el.body.setAttribute("transform", K.translateAlong(P, [0, 0, z]));
        w.rebuild(el.wet, st.water ? z.toFixed(3) : "", () => (st.water && z < 0 ? B11.wet(P, V, E, -z) : ""));
        w.rebuild(el.shadow, st.water ? "" : "s", () => st.water ? "" : `<path class="iso-halo" d="${K.haloOf({ x: -2.2, y: -1.7, w: 4.4, d: 3.4, r: 1.6 }, 0, 0.1, P)}"/>`);
        w.rebuild(el.words, lab ? z.toFixed(1) : "", () => lab ? ISO.word(K.iso([2.6, 0, z + TOP + 0.6], P), "stone", "#445", { size: 14, anchor: "start" }) : "");
        g.anchors = { top: [0, 0, +(z + TOP).toFixed(3)] };
        B11.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.water !== undefined) { const on = String(p.water) === "1"; if (on !== st.water) { st.water = on; st.z = on ? DROP : 0; st.v = 0; } }
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        if (ISO.still() || dt > 1 || !st.water || st.z <= rest()) { st.z = rest(); st.v = 0; draw(); return false; }
        // weight less the upthrust of the part under water, and drag ½ρCdAv² in water (Cd ≈ 1 for a rough lump)
        const n = 12, h = (dt * B11.SLOW) / n;
        for (let i = 0; i < n; i++) {
          const f = ISO.clamp(-st.z / TOP, 0, 1), a = -g9 * (1 - f / RHO) - f * 0.075 * st.v * Math.abs(st.v);
          st.v += a * h; st.z += st.v * h;
          if (st.z <= rest()) { st.z = rest(); st.v = 0; break; }
        }
        draw();
        return st.z > rest();
      };
      g.readout = () => {
        const m = Math.round(RHO * VOL), up = VOL * g9 / 1e5, wt = m * g9 / 1e5;
        const head = `granite stone about 5 × 4 × 3 cm · ${Math.round(VOL)} cm³, ${m} g, ${RHO} g/cm³`;
        if (!st.water) return `${head}: denser than water, so in water it sinks`;
        return st.z > rest() ? `${head} · sinking at ${(Math.abs(st.v) / 100).toFixed(2)} m/s (shown 4× slower): weight ${wt.toFixed(2)} N > upthrust ${up.toFixed(2)} N` : `${head} · on the floor ${depth} cm down: weight ${wt.toFixed(2)} N, upthrust only ${up.toFixed(2)} N (the water it pushes aside)`;
      };
      draw();
      return g;
    },
  });
})();
