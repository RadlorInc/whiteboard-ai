// "sponge cx cy k aim=flat wet=0..1 lab=0 lit=sponge" — a PART (PARTS.md): a kitchen sponge lying on a surface, its
// origin the middle of its underside on that surface. A 10 × 7 cm block of yellow polyurethane foam 2.2 cm thick with a
// finger groove moulded along both long sides and open pores on every cut face, a 0.8 cm green non-woven scrub pad
// glued on top (its fibres as specks). wet darkens the foam and the pad, beads water on the pad and runs drops down the
// sides, and a flat glossy puddle spreads round its foot. set({ wet }). World units: 1 = 1 cm.
(() => {
  const K = window.K;
  const X = 5, Y = 3.5, ZF = 2.2, ZT = 3;
  // the foam's end profile in (y, z): rounded foot, the finger groove on each long side, flat top under the pad
  const PROF = [[-Y + 0.3, 0], [Y - 0.3, 0], [Y, 0.3], [Y, 0.7], [Y - 0.35, 0.9], [Y - 0.5, 1.12], [Y - 0.35, 1.34], [Y, 1.55], [Y, ZF],
    [-Y, ZF], [-Y, 1.55], [-Y + 0.35, 1.34], [-Y + 0.5, 1.12], [-Y + 0.35, 0.9], [-Y, 0.7], [-Y, 0.3]];
  // the near long face's y at height z (on the profile's +y side)
  const yAt = (z) => { const side = PROF.slice(1, 9); for (let i = 1; i < side.length; i++) { const [y0, z0] = side[i - 1], [y1, z1] = side[i]; if (z <= z1) return y0 + ((y1 - y0) * (z - z0)) / (z1 - z0 || 1); } return Y; };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  // pores: fixed sets of (u, v, r) placed once, so they stay put as the sponge gets wet
  const R = rng(7), END = [], SIDE = [], PAD = [], PADS = [];
  while (END.length < 46) { const y = -Y + 0.25 + R() * (2 * Y - 0.5), z = 0.2 + R() * (ZF - 0.4); if (Math.abs(y) < yAt(z) - 0.25) END.push([y, z, 0.05 + R() * 0.09]); }
  while (SIDE.length < 80) SIDE.push([-X + 0.25 + R() * (2 * X - 0.5), 0.2 + R() * (ZF - 0.4), 0.05 + R() * 0.09]);
  while (PAD.length < 150) PAD.push([-X + 0.15 + R() * (2 * X - 0.3), -Y + 0.15 + R() * (2 * Y - 0.3), R()]);
  while (PADS.length < 60) PADS.push([-X + 0.15 + R() * (2 * X - 0.3), ZF + 0.1 + R() * (ZT - ZF - 0.2), R()]);
  const BEADS = [[-2.6, -1.2, 0.34], [1.2, 1.6, 0.42], [3.3, -0.4, 0.28], [-0.4, 0.2, 0.22], [2.2, -2.3, 0.3], [-3.6, 2.2, 0.26]];
  const RUNS = [[-2.8, 0.75], [0.9, 0.55], [3.4, 0.9]];   // drops running down the near long face: x, how far down they reach (0..1)

  const ell = (P, c, a, b, r, n = 8) => K.pathOf(Array.from({ length: n }, (_, i) => { const t = (i / n) * 2 * Math.PI; return K.iso(c.map((v, j) => v + a[j] * r * Math.cos(t) + b[j] * r * Math.sin(t)), P); }), true);
  // a bead of water: a glossy dome (flat fill) with its shine
  const bead = (P, c, r) => `<path d="${ell(P, c, [1, 0, 0], [0, 1, 0], r, 12)}" fill="#a9d4f4" fill-opacity=".85" stroke="#2b6cc4" stroke-width="0.45"/><path d="${ell(P, [c[0] - r * 0.3, c[1] - r * 0.3, c[2] + 0.01], [1, 0, 0], [0, 1, 0], r * 0.32, 8)}" fill="#ffffff"/>`;

  function spongeSvg(P, wet) {
    const w = wet, out = [];
    const foam = { dark: mix("#d9a21c", "#8a5e08", w * 0.55), light: mix("#ffe68a", "#d9a632", w * 0.55), face: mix("#fcd955", "#c99418", w * 0.5), ink: "#7a5608" };
    const pore = mix("#b58312", "#6e4a06", w * 0.5);
    // the puddle round the foot: a flat glossy pool on the surface, with its highlight
    if (w > 0.02) {
      const pts = Array.from({ length: 40 }, (_, i) => { const t = (i / 40) * 2 * Math.PI, wob = 1 + 0.07 * Math.sin(3 * t + 1) + 0.05 * Math.sin(5 * t), ex = X + 0.3 + 2.6 * w, ey = Y + 0.3 + 2 * w;
        const c = Math.cos(t), s = Math.sin(t), q = 4, d = Math.pow(Math.pow(Math.abs(c), q) + Math.pow(Math.abs(s), q), -1 / q);
        return K.iso([c * d * ex * wob, s * d * ey * wob, 0.02], P); });
      out.push(`<path d="${K.pathOf(pts, true)}" fill="#9cc8ee" fill-opacity="${(0.25 + 0.4 * w).toFixed(2)}" stroke="#2b6cc4" stroke-width="0.6" stroke-opacity="${Math.min(1, w * 2).toFixed(2)}"/>`);
      out.push(`<path d="${ell(P, [X + 1.2 * w + 0.4, -Y - 0.6 * w, 0.03], [1, 0, 0], [0, 0.35, 0], 0.9 * w + 0.2, 10)}" fill="#ffffff" fill-opacity=".8"/>`);
    }
    // the foam block, then its pores on the near end and the near long face
    out.push(ISO.prismX(P, PROF, -X, X, [foam.dark, foam.light], foam.face, foam.ink));
    out.push(`<path d="${END.map(([y, z, r]) => ell(P, [X + 0.01, y, z], [0, 1, 0], [0, 0, 0.75], r)).join("")}${SIDE.map(([x, z, r]) => ell(P, [x, yAt(z) + 0.01, z], [1, 0, 0], [0, 0, 0.75], r)).join("")}" fill="${pore}" fill-opacity=".8"/>`);
    // the glue line where the pad meets the foam: a darker band just under the pad, all round the seen faces
    out.push(`<path d="${K.pathOf([K.iso([-X, Y, ZF - 0.12], P), K.iso([X, Y, ZF - 0.12], P), K.iso([X, -Y, ZF - 0.12], P)])}" fill="none" stroke="${mix(foam.dark, "#5a3c04", 0.4)}" stroke-width="0.5"/>`);
    // the green scrub pad, its fibres as specks on the top and on the two seen sides
    const pad = ISO.tint(mix("#6fae55", "#3e7a2c", w * 0.6), [mix("#2f6b24", "#1c4615", w * 0.6), mix("#3c7c2e", "#245a1c", w * 0.6), mix("#4a8d39", "#2c6822", w * 0.6), mix("#5a9d46", "#357429", w * 0.6)], "#173d12");
    out.push(ISO.tinted(pad, ISO.wbox(P, [-X, X], [-Y, Y], [ZF, ZT], "mid")));
    const spot = (pts, c, k) => `<path d="${pts.join("")}" fill="${c}"/>`.replace("<path", `<path opacity="${k}"`);
    const top = PAD.map(([x, y, f]) => ell(P, [x, y, ZT + 0.01], [1, 0, 0], [0, 1, 0], 0.06 + f * 0.06, 5));
    const near = PADS.map(([x, z, f]) => ell(P, [x, Y + 0.01, z], [1, 0, 0], [0, 0, 1], 0.05 + f * 0.05, 5));
    const end = PADS.slice(0, 24).map(([x, z, f]) => ell(P, [X + 0.01, ((x + X) / (2 * X)) * (2 * Y - 0.3) - Y + 0.15, z], [0, 1, 0], [0, 0, 1], 0.05 + f * 0.05, 5));
    out.push(spot(top.filter((_, i) => i % 2), mix("#2a5e1f", "#143a10", w), ".75"), spot(top.filter((_, i) => !(i % 2)), mix("#9fd187", "#6fa85a", w), ".8"), spot([...near, ...end], mix("#1f4a17", "#0f2a0b", w), ".6"));
    if (w > 0.02) {
      // wet: a sheen across the pad, beads on it and drops running down the near long face
      out.push(`<path d="${K.pathOf([[-X + 1, -Y + 0.8], [X - 2, -Y + 0.5], [X - 1.4, -Y + 1.4], [-X + 1.6, -Y + 1.7]].map(([x, y]) => K.iso([x, y, ZT + 0.02], P)), true)}" fill="#ffffff" fill-opacity="${(0.18 * w).toFixed(2)}"/>`);
      out.push(BEADS.slice(0, Math.round(2 + 4 * w)).map(([x, y, r]) => bead(P, [x, y, ZT + 0.02], r * (0.6 + 0.4 * w))).join(""));
      out.push(RUNS.map(([x, reach]) => {
        const z1 = ZT - 0.15, z0 = ZT - 0.15 - (ZT - 0.4) * reach * w, r = 0.22, pts = [];
        for (let i = 0; i <= 8; i++) { const z = z1 - ((z1 - z0) * i) / 8, wd = r * (0.45 + 0.55 * (i / 8)); pts.push(K.iso([x - wd, yAt(Math.min(z, ZF)) + 0.03, z], P)); }
        for (let i = 0; i <= 8; i++) { const t = Math.PI * (i / 8); pts.push(K.iso([x - r * Math.cos(t), yAt(Math.max(z0 - r * Math.sin(t), 0.05)) + 0.03, z0 - r * Math.sin(t)], P)); }
        for (let i = 8; i >= 0; i--) { const z = z1 - ((z1 - z0) * i) / 8, wd = r * (0.45 + 0.55 * (i / 8)); pts.push(K.iso([x + wd, yAt(Math.min(z, ZF)) + 0.03, z], P)); }
        const hl = K.iso([x - r * 0.35, yAt(Math.max(z0, 0.05)) + 0.04, z0 + r * 0.1], P);
        return `<path d="${K.pathOf(pts, true)}" fill="#a9d4f4" fill-opacity=".85" stroke="#2b6cc4" stroke-width="0.45"/><circle cx="${hl[0].toFixed(1)}" cy="${hl[1].toFixed(1)}" r="${(0.07 * K.cameraOf(P).k).toFixed(2)}" fill="#ffffff"/>`;
      }).join(""));
    }
    return out.join("");
  }

  ISO.add({
    name: "sponge", title: "Kitchen sponge (part)", compare: null,
    about: "A kitchen sponge, 10 × 7 × 3 cm: yellow foam with pores and a finger groove, a green scrub pad on top; wet darkens it, beads and drips water and leaves a puddle; a part to place in any scene. anchors: top",
    line: "sponge cx cy k aim=flat wet=0..1 lab=0 lit=sponge",
    demo: { line: "sponge 480 300 30 lab=1", script: [{ set: {}, hold: 1 }, { set: { wet: 1 }, hold: "settle" }, { set: { wet: 0.4, lit: "sponge" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const halo = { x: -X - 0.6, y: -Y - 0.6, w: 2 * X + 1.2, d: 2 * Y + 1.2, r: 1 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, -0.3, 0.3, P)}"/><g data-name="sponge" data-part="sponge"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const s = { wet: ISO.clamp(ISO.num(o, "wet", 0), 0, 1), wT: 0, lit: o.lit || "" };
      s.wT = s.wet;
      if (lab) el.words.innerHTML = ISO.word(K.iso([0, Y, 0], P), "sponge", "#444", { size: 13, dy: 22 }).replace('x="', 'dx="8" x="') + ISO.word(K.iso([X, -Y, ZT - 0.4], P), "scrub pad", "#2c6a22", { size: 12, anchor: "start" }).replace('x="', 'dx="10" x="');
      const draw = () => {
        const q = Math.round(s.wet * 20) / 20;   // rebuilt in 5 % steps: the pores are a few hundred shapes
        w.rebuild(el.sponge, q.toFixed(3), () => spongeSvg(P, q));
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.anchors = { top: [0, 0, ZT] };   // the pad's middle: where a hand presses
      g.set = (p) => { if (p.wet !== undefined) s.wT = ISO.clamp(+p.wet || 0, 0, 1); if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => { s.wet = ISO.follow(s.wet, s.wT, dt, 0.5, ISO.still()); draw(); return s.wet !== s.wT; };
      g.readout = () => `kitchen sponge 10 × 7 × 3 cm · ${s.wet < 0.05 ? "dry" : s.wet > 0.95 ? "soaked: holds about 60 mL" : `damp: about ${Math.round(s.wet * 60)} mL of water`}`;
      draw();
      return g;
    },
  });
})();
