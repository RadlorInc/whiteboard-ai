// "plasticball cx cy k c=orange|yellow|red|blue|white water=0|1 lab=0 lit=ball" — a PART (PARTS.md, batch 5): the density
// scene's hollow plastic ball, 5 cm across, two moulded halves joined at a seam, a small gate dimple at one pole, 33 g
// (0.5 g/cm³). water=0: it rests on a surface, origin the point under it. water=1: it floats, origin the water's
// surface point (at= a glasstank's `water`); set({ water: 1 }) drops it in from 4 cm and it bobs into place under real
// buoyancy (the cap under water weighs as much as the ball) and drag, shown 4× slower; at rest exactly half under, the
// wet half washed blue with its waterline. The ball moves as one flat screen move. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), g9 = 981;
  const R = 2.5, RHO = 0.5, DROP = 4, VOL = (4 / 3) * Math.PI * R ** 3;
  const COL = { orange: "#f39a3c", yellow: "#f4cf3a", red: "#e0533f", blue: "#4a8fd8", white: "#f2f2ee" };
  const tintOf = (c) => ISO.tint(LAB.mix(c, "#ffffff", 0.3), [LAB.mix(c, "#000000", 0.25), LAB.mix(c, "#000000", 0.12), c, LAB.mix(c, "#ffffff", 0.15)], LAB.mix(c, "#000000", 0.55));
  // the fraction of the ball's volume under the plane, its centre zc above it (a spherical cap)
  const under = (zc) => { const h = ISO.clamp(R - zc, 0, 2 * R); return (Math.PI * h * h * (3 * R - h)) / 3 / VOL; };
  // the near half of a circle on the sphere: centre c, the circle in the plane through c + n·d (n a unit normal)
  const nearArc = (P, n, d, view, full = false) => {
    const r = Math.sqrt(Math.max(0, R * R - d * d)), u = G.unit3(Math.abs(n[2]) > 0.9 ? G.cross3(n, [1, 0, 0]) : G.cross3(n, [0, 0, 1])), v = G.cross3(n, u), pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2, q = [0, 1, 2].map((j) => n[j] * d + (u[j] * Math.cos(a) + v[j] * Math.sin(a)) * r);
      pts.push({ ok: full || G.dot3(q, view) >= -0.02 * R, p: K.iso(q, P) });
    }
    if (full) return pts.map((q) => q.p);
    const i0 = pts.findIndex((q, i) => q.ok && !pts[(i + 64) % 65].ok), out = [];
    for (let i = 0, j = Math.max(0, i0); i < 65; i++, j = (j + 1) % 65) { if (!pts[j].ok) break; out.push(pts[j].p); }
    return out;
  };

  ISO.add({
    name: "plasticball", title: "Plastic ball (part)", compare: null,
    about: "A hollow plastic ball 5 cm across (33 g, 0.5 g/cm³) that rests on a surface, or drops into water and bobs into place floating exactly half under. anchors: top",
    line: "plasticball cx cy k c=orange|yellow|red|blue|white water=0|1 lab=0 lit=ball",
    demo: { line: "plasticball 480 300 50 c=orange lab=1", script: [{ set: {}, hold: 1 }, { set: { water: 1, lit: "ball" }, hold: "settle" }, { set: { lit: "" }, hold: 1.2 }, { set: { water: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const c = COL[o.c] || COL.orange, view = G.viewOf(P);
      const st = { water: o.water === "1", z: 0, v: 0, lit: o.lit || "" };
      const rest = () => (st.water ? 0 : R);   // the centre's height above the origin at rest (afloat: R − depth under = 0)
      st.z = rest();
      // the ball built once at the origin's centre, moved by a translate; the waterline and wash rebuilt as it bobs
      const ball = `<g data-name="ball">${ISO.tinted(tintOf(c), S(G.sphereOf([0, 0, 0], R, P), { tone: "hi", lit: true }))}` +
        // the moulding seam: a great circle round the ball (well away from where a waterline falls), its near half
        `<path d="${K.pathOf(nearArc(P, G.unit3([0.55, -0.35, 0.3]), 0, view))}" fill="none" stroke="${LAB.mix(c, "#000000", 0.4)}" stroke-width="${Math.max(0.5, k * 0.03).toFixed(2)}" opacity=".7" data-free=""/>` +
        // the gate dimple at the top pole, and a soft highlight
        `<ellipse cx="${K.iso([0, 0, R], P)[0].toFixed(2)}" cy="${(K.iso([0, 0, R], P)[1] + k * 0.05).toFixed(2)}" rx="${(k * 0.22).toFixed(2)}" ry="${(k * 0.08).toFixed(2)}" fill="${LAB.mix(c, "#000000", 0.25)}" opacity=".7"/>` +
        (() => { const h = K.iso([-0.9, 0.6, 1.4], P); return `<ellipse cx="${h[0].toFixed(2)}" cy="${h[1].toFixed(2)}" rx="${(k * 0.55).toFixed(2)}" ry="${(k * 0.32).toFixed(2)}" transform="rotate(-25 ${h[0].toFixed(2)} ${h[1].toFixed(2)})" fill="#fff" opacity=".45"/>`; })() + `</g>`;
      g.innerHTML = `<g data-part="shadow"></g><g data-part="body">${ball}<g data-part="wet"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      // the wet cap: sample the sphere below the water plane, hull it; the waterline's near half on top
      const cap = Array.from({ length: 96 }, (_, i) => { const zz = 1 - (2 * (i + 0.5)) / 96, r = Math.sqrt(1 - zz * zz), a = i * 2.39996; return [Math.cos(a) * r * R, Math.sin(a) * r * R, zz * R]; });
      const draw = () => {
        const z = Math.round(st.z * 1000) / 1000;
        el.body.setAttribute("transform", K.translateAlong(P, [0, 0, z]));
        w.rebuild(el.wet, st.water ? z.toFixed(3) : "", () => {
          if (!st.water || z >= R) return "";
          const dz = -z, pts = cap.filter((p) => p[2] < dz).map((p) => K.iso(p, P)), out = [];
          if (Math.abs(dz) < R) for (const p of nearArc(P, [0, 0, 1], dz, view, true)) pts.push(p);
          if (pts.length > 2) out.push(`<path d="${K.pathOf(ISO.hullOf(pts), true)}" fill="#3d8fe0" fill-opacity=".3"/>`);
          if (Math.abs(dz) < R * 0.98) out.push(`<path d="${K.pathOf(nearArc(P, [0, 0, 1], dz, view))}" fill="none" stroke="#2b6cc4" stroke-width="0.9" opacity=".85" data-free=""/>`);
          return out.join("");
        });
        w.rebuild(el.shadow, st.water ? "" : "s", () => st.water ? "" : `<path class="iso-halo" d="${K.haloOf({ x: -R * 0.7, y: -R * 0.7, w: R * 1.4, d: R * 1.4, r: R * 0.7 }, 0, 0.1, P)}"/>`);
        w.rebuild(el.words, lab ? `${st.water} ${z.toFixed(1)}` : "", () => lab ? ISO.word(K.iso([R, 0, z + R + 0.6], P), "plastic ball", "#445", { size: 14, anchor: "start" }) : "");
        g.anchors = { top: [0, 0, +(z + R).toFixed(3)] };
        B11.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.water !== undefined) { const on = String(p.water) === "1"; if (on !== st.water) { st.water = on; st.z = on ? R + DROP : R; st.v = 0; } }
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        if (ISO.still() || dt > 1 || !st.water) { st.z = rest(); st.v = 0; draw(); return false; }
        // real forces on the ball (cm, s): weight, the upthrust of the water it pushes aside, and drag in the water
        const n = 12, h = (dt * B11.SLOW) / n;
        for (let i = 0; i < n; i++) {
          const f = under(st.z), a = g9 * (f / RHO - 1) - (f > 0 ? 0.15 * f * st.v * Math.abs(st.v) + 6 * f * st.v : 0);
          st.v += a * h; st.z += st.v * h;
        }
        const done = Math.abs(st.z) < 0.004 && Math.abs(st.v) < 0.3;
        if (done) { st.z = 0; st.v = 0; }
        draw();
        return !done;
      };
      g.readout = () => {
        const m = Math.round(RHO * VOL), f = under(st.z);
        return st.water ? `hollow plastic ball 5 cm · ${m} g, ${RHO} g/cm³ · ${Math.round(f * 100)} % under water: it floats where the water it pushes aside (${Math.round(f * VOL)} cm³ = ${Math.round(f * VOL)} g) weighs as much as it does${st.z ? " (shown 4× slower)" : ""}`
          : `hollow plastic ball 5 cm · ${m} g, ${RHO} g/cm³: half as dense as water, so in water it floats half under`;
      };
      draw();
      return g;
    },
  });
})();
