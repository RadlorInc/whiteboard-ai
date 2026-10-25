// "forcemeter cx cy k max=1|5|10|20 load=0..2000 lab=0 lit=case|scale|hook|load" — a PART (PARTS.md, batch 3): a
// school newton meter (spring balance) hanging from its top ring, origin the inside of the ring's crown (the hook
// point). A clear tube Ø 22 mm between two dark caps, the scale printed on it (0..max N over 100 mm: minor ticks hang
// from a printed rule line, numbers beside them), the spring inside pulling a red pointer disc, the rod through the
// bottom cap to the hook. load (g) hangs a turned steel mass of that many grams on the hook (its size from steel's
// density, 7.9 g/cm³) and the pointer goes to load × 9.8 / 1000 N (stopped at max), with the small bounce of a real
// spring. set({ load }). Built in mm with PHYS (recipes/_phys.js); the inner spring is cached per visible step.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const TR = 11, CAP = 13, Z0 = -42, SPAN = 100, ZETA = 0.5;
  const TICKS = { 1: [0.02, 0.1, 0.1], 5: [0.1, 0.5, 1], 10: [0.2, 1, 1], 20: [0.5, 2, 2] };   // minor, major, numbered
  ISO.add({
    name: "forcemeter", title: "Newton meter (part)", compare: null,
    about: "A newton meter (spring balance) with a clear tube, a printed N scale and the spring inside; a mass on its hook pulls the pointer to its weight. anchors: top hook",
    line: "forcemeter cx cy k max=1|5|10|20 load=0..2000 lab=0 lit=case|scale|hook|load",
    demo: { line: "forcemeter 480 50 11 max=10 load=0", script: [{ set: { load: 200 }, hold: "settle" }, { set: { load: 800, lit: "scale" }, hold: "settle" }, { set: { load: 500, lit: "load" }, hold: "settle" }, { set: { load: 0, lit: "hook" }, hold: "settle" }, { set: { lit: "case" }, hold: 1.2 }] },
    make([cx = 480, cy = 50, k = 3], o, t, parent) {
      const LAB = window.LAB, PHYS = window.PHYS, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const max = [1, 5, 10, 20].reduce((a, b) => (Math.abs(b - ISO.num(o, "max", 10)) < Math.abs(a - ISO.num(o, "max", 10)) ? b : a)), [minor, major, every] = TICKS[max];
      const m = { load: ISO.clamp(Math.round(ISO.num(o, "load", 0)), 0, 2000) }, kS = max / (SPAN / 1000);   // spring rate, N/m
      const rest = () => Math.min((m.load * 9.8) / 1000, max) / kS, s = { x: rest(), v: 0 };
      const va = PHYS.viewAngle(Pm), a0 = va + 0.02, step = 5 / Math.max(0.2, k);
      let lit = o.lit || "", relight = true;
      const ring = (cz, r, plane = "x") => { const pts = []; for (let j = 0; j <= 36; j++) { const a = (j / 36) * Math.PI * 2; pts.push(plane === "x" ? [Math.sin(a) * r, 0, cz + Math.cos(a) * r] : [0, Math.sin(a) * r, cz + Math.cos(a) * r]); } return PHYS.path(Pm, pts); };
      const cyl = (r, z0, z1, n = 40, bevel = 0.5) => S(K.cylinder(0, 0, r, z0, z1 - z0, Pm, n, bevel), { tone: "mid" });
      // ── what hangs below the bottom cap, drawn at zero reading and moved down by d: rod, hook, the load on it
      const ZE = -200, hookIn = ZE - 12 + 1.2;
      const lower = () => {
        const hook = []; for (let j = 0; j <= 30; j++) { const t = (j / 30) * Math.PI * 1.75; hook.push([Math.sin(t) * 6, 0, ZE - 6 + Math.cos(t) * 6]); }
        const out = [`<g data-name="hook">${PHYS.wire(Pm, PHYS.path(Pm, hook), 1.2)}</g>`];
        if (m.load > 0) {
          // a turned steel mass, height = diameter, with an eye on top that hangs in the hook
          const r = Math.cbrt(m.load / 7.9 / (2 * Math.PI)) * 10, eyeR = 3.6, top = hookIn - 2 * eyeR - 4, z0 = top - 2 * r;
          const blk = [S(K.cylinder(0, 0, r, z0, 2 * r, Pm, 56, 0.8), { tone: "mid" }), S(K.cylinder(0, 0, 2.6, top, 3, Pm, 20, 0.3), { tone: "mid" }), PHYS.wire(Pm, ring(top + 3 + eyeR, eyeR, "y"), 1)];
          blk.push(LAB.faceText(Pm, [Math.cos(va) * (r + 0.1), Math.sin(va) * (r + 0.1), z0 + r * 0.85], [Math.sin(va), -Math.cos(va), 0], `${m.load} g`, Math.max(3, Math.min(8, r * 0.42)), "#3c3f45"));
          out.unshift(`<g data-name="load">${ISO.tinted(ISO.T.steel, blk.join(""))}${lab ? LAB.word(Pm, lab, [-r - 8, 0, z0 + r], `${m.load} g`, "#2b6cc4", { anchor: "end", size: 14 }) : ""}</g>`);
        }
        return out.join("");
      };
      // the rod from inside the bottom cap down to the hook (it grows as the hook comes down)
      const rod = (d) => `<g data-name="hook">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.4, ZE - d, d - 180 - ZE, Pm, 14), { tone: "mid", crease: "none" }))}</g>`;
      // ── inside the tube: the spring from the top cap to the pointer disc, the disc, the rod under it
      const inner = (d) => {
        const zp = Z0 - d, h = PHYS.helix(Pm, 0, 0, -32, zp + 2.2, 6.2, 15, 18);
        return PHYS.wire(Pm, h.back, 0.7, { ink: "#2e3237", body: "#7d8187", shine: "#b9bcc1" }) +
          ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.4, -176, zp + 176, Pm, 14), { tone: "mid", crease: "none" })) +
          ISO.tinted(ISO.T.red, S(K.cylinder(0, 0, TR - 1.6, zp - 1.6, 1.6, Pm, 40, 0.3), { tone: "mid" })) + PHYS.wire(Pm, h.front, 0.7);
      };
      // ── the scale printed on the tube's front: a rule line, ticks hanging from it, the numbers, "N"
      const on = (z, da, r = TR + 0.06) => [Math.cos(a0 + da) * r, Math.sin(a0 + da) * r, z];
      const scale = () => {
        const out = [], mi = [], ma = [], n = Math.round(max / minor), band = [];
        // a white printed band under the ticks and numbers; the clear tube beside it shows the spring and the pointer disc
        for (let j = 0; j <= 8; j++) band.push(K.iso(on(Z0 + 11, -0.04 + (j / 8) * 0.84), Pm));
        for (let j = 8; j >= 0; j--) band.push(K.iso(on(Z0 - SPAN - 13, -0.04 + (j / 8) * 0.84), Pm));
        out.push(`<path d="${K.pathOf(band, true)}" fill="#fbfcfd" stroke="#c9dde9" stroke-width="0.5"/>`);
        out.push(L(K.segment(on(Z0 + 0.6, 0), on(Z0 - SPAN - 0.6, 0), Pm), { tone: "mid", free: true }));
        for (let i = 0; i <= n; i++) {
          const v = i * minor, z = Z0 - (SPAN * v) / max, big = Math.abs(v / major - Math.round(v / major)) < 1e-6;
          (big ? ma : mi).push(K.pathOf([K.iso(on(z, 0), Pm), K.iso(on(z, big ? 0.36 : 0.2), Pm)]));
          if (Math.abs(v / every - Math.round(v / every)) < 1e-6) out.push(LAB.faceText(Pm, on(z - 1.3, 0.56), [Math.sin(a0 + 0.56), -Math.cos(a0 + 0.56), 0], String(+v.toFixed(2)), 3.6, "#1d2a36"));
        }
        out.push(L(mi.join(""), { tone: "lo", free: "end" }), L(ma.join(""), { tone: "hi", free: "end" }));
        out.push(LAB.faceText(Pm, on(Z0 + 6, 0.4), [Math.sin(a0 + 0.4), -Math.cos(a0 + 0.4), 0], "N", 5, "#1d2a36"), LAB.faceText(Pm, on(Z0 - SPAN - 8, 0.4), [Math.sin(a0 + 0.4), -Math.cos(a0 + 0.4), 0], `0–${max} N`, 3.2, "#5d7f96"));
        return out.join("");
      };
      const tube = K.cylinder(0, 0, TR, -178, 150, Pm, 48);
      const dark = ISO.T.plastic;
      g.innerHTML = `<g data-part="lower"></g><g data-part="rod"></g>` +
        `<g data-name="case">${ISO.tinted(dark, cyl(CAP, -184, -176, 48, 0.8))}${ISO.tinted(ISO.T.glass, S(tube, { tone: "mid", crease: "none" }))}</g>` +
        `<g data-part="inner"></g>` +
        `<g data-name="case"><path d="${tube.outline}" fill="#ffffff" fill-opacity=".18" stroke="#5d7f96" stroke-width="0.9"/>` +
        `<path d="${PHYS.path(Pm, [[Math.cos(va - 0.55) * TR, Math.sin(va - 0.55) * TR, -36], [Math.cos(va - 0.55) * TR, Math.sin(va - 0.55) * TR, -170]])}" stroke="#ffffff" stroke-width="${(K.screenRise(1, Pm) * 1.6).toFixed(2)}" stroke-linecap="round" opacity=".75"/></g>` +
        `<g data-name="scale" style="paint-order:stroke">${scale()}</g>` +
        `<g data-name="case">${ISO.tinted(dark, cyl(CAP, -30, -18, 48, 0.8) + cyl(4, -18, -15, 20, 0.3))}${PHYS.wire(Pm, ring(1.2 - 7, 7), 1.2)}</g>` +
        `<g data-part="words">${lab ? LAB.word(Pm, lab, [0, CAP + 8, -60], "newton meter", "#556", { anchor: "start" }) : ""}</g>`;
      const el = LAB.parts(g), w = ISO.writer(), cache = new Map();
      const innerAt = (q) => { let c = cache.get(q); if (!c) { if (cache.size > 600) cache.clear(); cache.set(q, (c = { inner: inner(q * step), rod: rod(q * step) })); } return c; };
      g.anchors = { top: [0, 0, 0], hook: [0, 0, (hookIn - s.x * 1000) / 10] };
      const draw = () => {
        const q = Math.round((s.x * 1000) / step);
        w.rebuild(el.inner, String(q), () => innerAt(q).inner);
        w.rebuild(el.rod, String(q), () => { if (lit.includes("hook")) relight = true; return innerAt(q).rod; });
        w.rebuild(el.lower, String(m.load), () => { relight = true; return lower(); });
        w.attr(el.lower, "transform", K.translateAlong(Pm, [0, 0, -q * step]));
        if (relight) { relight = false; LAB.light(w, g, lit); }
      };
      g.set = (p) => {
        if (p.load !== undefined) m.load = ISO.clamp(Math.round(+p.load), 0, 2000);
        if (p.lit !== undefined) { lit = p.lit; relight = true; }
      };
      g.update = (dt) => {
        const moving = PHYS.bounce(s, rest(), dt, Math.sqrt(kS / (m.load / 1000 + 0.02)), ZETA);
        draw();
        return moving;
      };
      g.readout = () => {
        const F = (m.load * 9.8) / 1000, read = (s.x * kS);
        return `${m.load} g · weight ${F.toFixed(2)} N · the meter reads ${read.toFixed(max > 5 ? 1 : 2)} N (0–${max} N)${F > max ? " · over its range" : ""}`;
      };
      draw();
      return g;
    },
  });
})();
