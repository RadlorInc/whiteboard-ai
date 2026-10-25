// "evapbasin cx cy k fill=0..1 c=clear|blue|… crystals=0..1 steam=0|1 lab=0 lit=basin|liquid|crystals" — a PART
// (PARTS.md, batch 4): a glazed porcelain evaporating basin 9 cm across and 3.4 cm deep standing on a surface (a
// tripod's `top`), its origin the point under its middle. Round-bottomed bowl on a small unglazed foot ring, a rolled
// rim and a pouring lip; glazed white inside. The solution stands at fill (a fraction of the bowl's depth) and its
// volume is integrated from the bowl's own profile. crystals 0→1 grow small cubes (in the solution's colour) on the
// floor and up the walls, with a crust at the tide line where the liquid stood; steam=1 sends up wisps (SVG puffs) as
// it boils. Porcelain is opaque, so from this camera the floor hides behind the near rim once it is nearly dry.
// Built in mm (LAB's units); anchors in cm. set({ fill, c, crystals, steam }).
(() => {
  const K = window.K, G = window.G;
  // outer meridian [s, r, smooth?]: foot, the round bottom, the wall, the rolled rim
  const OUT = [[0, 16], [1.2, 18, 1], [3, 22, 1], [8, 31, 1], [15, 38, 1], [24, 42.5, 1], [31, 44.4, 1], [33, 45, 1], [34, 44.6]];
  const H = 34, WALL = 2.6, BASE = 2.8, TOP = H * 0.86, TIDE = 0.72;
  const PORC = ISO.tint("#fbfaf6", ["#cfcbc1", "#dcd8cf", "#e8e5de", "#f2f0ea"], "#7d786c");
  const BISQUE = ISO.tint("#e9dcc4", ["#bba98a", "#c8b797", "#d4c4a6", "#dfd0b5"], "#7a6a4c");
  let uid = 0;
  // seeded crystal sites on the inside: [s (height), angle, size mm, spin, delay]; a third of them at the tide line
  let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // angles are from the far wall (the side seen through the mouth; the near wall hides behind the rim)
  const SITES = Array.from({ length: 96 }, (_, i) => {
    const tide = i % 3 === 0, s = tide ? 0 : BASE + 0.4 + Math.pow(rnd(), 1.2) * (TOP * 0.92 - BASE);
    return [tide ? -1 : s, Math.PI + (rnd() * 2 - 1) * (tide ? 2.2 : 1.8), 1.4 + rnd() * (tide ? 1.6 : 2.6), rnd() * Math.PI, rnd() * 0.55];
  });

  ISO.add({
    name: "evapbasin", title: "Evaporating basin (part)", compare: null,
    about: "A porcelain evaporating basin 9 cm across with a pouring lip, holding a solution that boils down (fill) while crystals grow on its floor and walls (crystals) and steam rises (steam); stands on a tripod's top. anchors: rim inside",
    line: "evapbasin cx cy k fill=0..1 c=clear|blue|… crystals=0..1 steam=0|1 lab=0 lit=basin|liquid|crystals",
    demo: { line: "evapbasin 480 350 55 fill=0.8 c=blue lab=1", script: [{ set: { steam: 1 }, hold: 1.6 }, { set: { fill: 0.45, crystals: 0.4, lit: "liquid" }, hold: "settle" }, { set: { fill: 0.15, crystals: 1, lit: "crystals" }, hold: "settle" }, { set: { steam: 0, lit: "basin" }, hold: 1.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", id = "eb" + uid++;
      const V = LAB.vessel(Pm, [0, 0, 0], OUT, { wall: WALL, base: BASE }), F = V.F;
      const rIn = (s) => Math.max(0.5, V.rAt(s) - WALL), rimIn = rIn(H) + 0.6;
      const st = { f: ISO.clamp(ISO.num(o, "fill", 0.6), 0, 1), x: ISO.clamp(ISO.num(o, "crystals", 0), 0, 1), c0: o.c || "clear", c1: o.c || "clear", mixT: 1, steam: ISO.num(o, "steam", 0) >= 0.5 ? 1 : 0 };
      const want = { f: st.f, x: st.x }, s = { amt: st.steam, ph: 0 };
      let lit = o.lit || "";
      const levelZ = () => BASE + (TOP - BASE) * st.f, tideZ = BASE + (TOP - BASE) * TIDE;
      const mouth = G.circleOf(F, H, rimIn, Pm);
      // the bowl: an unglazed foot ring, the glazed body, the inner edge of the rolled rim and a pulled lip
      const lipA = V.facing + 1.0;
      // the lip: the rim pinched out to a short point, with the pouring groove along its top
      const lipPts = []; for (let i = 0; i <= 8; i++) lipPts.push(K.iso(G.pointOf(F, H - 0.2, 44.7, lipA - 0.2 + (0.4 * i) / 8), Pm));
      lipPts.push(K.iso(G.pointOf(F, H + 0.5, 47.4, lipA), Pm));
      const groove = K.pathOf([K.iso(G.pointOf(F, H + 0.1, 43.6, lipA), Pm), K.iso(G.pointOf(F, H + 0.45, 46.6, lipA), Pm)]);
      const body = ISO.tinted(BISQUE, LAB.S(K.cylinder(0, 0, 15.2, 0, 1.4, Pm, 40, 0.3), { tone: "mid" })) +
        ISO.tinted(PORC, LAB.S(G.solidOf(OUT.slice(1).map(([a, r, sm]) => [a, r, sm]), F, Pm), { tone: "mid" })) +
        `<path d="${G.arcOf(F, 31, 44.45, Pm)}" fill="none" stroke="#7d786c" stroke-width="0.6" opacity=".45"/>` +
        `<path d="${K.pathOf(lipPts, true)}" fill="#f8f7f2"/><path d="${K.pathOf([lipPts[0], lipPts[9], lipPts[8]])}" fill="none" stroke="#7d786c" stroke-width="0.9" stroke-linejoin="round"/><path d="${groove}" fill="none" stroke="#a9a397" stroke-width="0.7"/>`;
      // the glazed inside seen through the mouth: shaded down toward the floor, lit on the far wall
      const inside = `<path d="${mouth}" fill="url(#${id}in)"/>`;
      const rim = `<path d="${mouth}" fill="none" stroke="#7d786c" stroke-width="0.9"/><path d="${G.arcOf(F, H - 0.2, rimIn + 1.1, Pm, { inward: true, trim: 0 })}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".9"/>`;
      g.innerHTML = `<defs><clipPath id="${id}m"><path d="${mouth}"/></clipPath><linearGradient id="${id}in" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e4e1d9"/><stop offset=".35" stop-color="#fbfaf7"/><stop offset="1" stop-color="#d3cfc5"/></linearGradient></defs>` +
        `<path class="iso-halo" d="${K.haloOf({ x: -45, y: -45, w: 90, d: 90, r: 45 }, 0, 4, Pm)}"/>` +
        `<g data-name="basin">${body}${inside}</g><g clip-path="url(#${id}m)"><g data-name="crystals" data-part="under"></g><g data-name="liquid" data-part="liquid"></g><g data-name="crystals" data-part="over"></g></g>` +
        `<g data-name="basin">${rim}</g><g data-part="steam"></g><g data-part="words"></g>`;
      g.anchors = { rim: [0, 0, H / 10], inside: [0, 0, BASE / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      // steam: five columns of soft puffs that rise, widen and thin out
      const NP = 5, NC = 5;
      el.steam.innerHTML = Array.from({ length: NP * NC }, () => `<circle r="1" fill="#cdd6de" opacity="0"/>`).join("");
      const puffs = [...el.steam.children];
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      // crystals take the solution's colour; a colourless solution leaves white salt
      const crystalTint = (c) => { const base = /^(clear|colourless|white)$/.test(c) ? "#f3f5f7" : LAB.mix(LAB.col(c), "#000000", 0.08), ink = /^(clear|colourless|white)$/.test(c) ? "#7f8a94" : LAB.ink(c); return ISO.tint(LAB.mix(base, "#ffffff", 0.3), [LAB.mix(base, "#000000", 0.22), LAB.mix(base, "#000000", 0.12), base, LAB.mix(base, "#ffffff", 0.15)], ink); };
      const cube = (p, a, h) => { const c = Math.cos(a), sn = Math.sin(a), q = h / 2, pt = (x, y, z) => [p[0] + x * c - y * sn, p[1] + x * sn + y * c, p[2] + z]; return ISO.poly([pt(-q, -q, 0), pt(q, -q, 0), pt(q, -q, h), pt(-q, -q, h), pt(-q, q, 0), pt(q, q, 0), pt(q, q, h), pt(-q, q, h)], ISO.BOX_F, Pm, "mid"); };
      const memo = new Map();   // a crystal's solid, by site and size (the same few sizes come back as it grows)
      const crystalsSvg = (x, z, below) => {
        if (x < 0.02) return "";
        const out = [], list = [];
        for (const [s0, a, size, spin, delay] of SITES) {
          const f = ISO.ease(ISO.clamp((x - delay) / (1 - delay), 0, 1)); if (f < 0.05) continue;
          const sz = s0 < 0 ? tideZ - 0.6 : s0, h = size * (0.3 + 0.7 * f);
          if ((sz < z) !== below) continue;
          const p = G.pointOf(F, sz, Math.max(0, rIn(sz) - h * 0.45), V.facing + a), key = `${a} ${s0} ${h.toFixed(1)}`;
          if (!memo.has(key)) memo.set(key, cube(p, spin, +h.toFixed(1)));
          list.push([K.depthOf(p, Pm), memo.get(key)]);
        }
        // the crust at the tide line: a rough pale ring where the solution first stood, under the crystals on it
        if (!below && z < tideZ) out.push(`<path d="${G.circleOf(F, tideZ - 0.4, rIn(tideZ) - 0.2, Pm)}" fill="none" stroke="${LAB.ink(st.c1)}" stroke-width="${Math.max(0.5, G.scaleOf(Pm) * 0.6).toFixed(2)}" stroke-dasharray="2.2 1.1 0.6 1.4" opacity="${(0.35 * x).toFixed(2)}"/>`);
        list.sort((p, q) => p[0] - q[0]).forEach((q) => out.push(q[1]));
        return `<g style="${crystalTint(st.c1)}">${out.join("")}</g>`;
      };
      const draw = () => {
        const z = levelZ(), c = colour(), xq = Math.round(st.x * 25) / 25, zq = Math.round(z * 4) / 4;
        w.rebuild(el.liquid, `${zq} ${c}`, () => (zq > BASE + 0.3 ? `<path d="${G.circleOf(F, zq, rIn(zq), Pm)}" fill="${c}" fill-opacity=".85" stroke="${LAB.ink(st.c1)}" stroke-width="0.8" stroke-opacity=".7"/><path d="${G.arcOf(F, zq, rIn(zq) * 0.62, Pm, { inward: true })}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".55"/>` : ""));
        w.rebuild(el.under, `${xq} ${zq} ${st.c1}`, () => crystalsSvg(xq, zq, true));
        w.rebuild(el.over, `${xq} ${zq} ${st.c1}`, () => crystalsSvg(xq, zq, false));
        if (lab) w.rebuild(el.words, `${Math.round(V.vol(z))} ${xq > 0.1}`, () => LAB.word(Pm, lab, [0, 0, H + 26], "evaporating basin", "#556") +
          LAB.word(Pm, lab, V.at(H * 0.5, -1.4, 6), xq > 0.1 ? "crystals" : `${Math.round(V.vol(z))} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      const drawSteam = () => {
        const z = Math.max(levelZ(), BASE), sc = G.scaleOf(Pm);
        puffs.forEach((c, i) => {
          const col = Math.floor(i / NC), j = i % NC, ph = (s.ph * 0.35 + j / NC + col * 0.13) % 1, a = col * 2.4 + 0.5, r0 = rIn(z) * 0.45 * ((col % 3) / 2);
          const h = ph * 60, drift = Math.sin(ph * 5 + col) * 4 * ph;
          const p = K.iso([Math.cos(a) * r0 + drift, Math.sin(a) * r0, z + 2 + h], Pm), op = s.amt * 0.7 * Math.sin(Math.PI * Math.min(1, ph * 1.3)) * (1 - ph * 0.6);
          w.attr(c, "cx", p[0].toFixed(1)); w.attr(c, "cy", p[1].toFixed(1)); w.attr(c, "r", (sc * (2.5 + ph * 7)).toFixed(1)); w.attr(c, "opacity", Math.max(0, op).toFixed(2));
        });
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.crystals !== undefined) want.x = ISO.clamp(+p.crystals, 0, 1);
        if (p.steam !== undefined) st.steam = +p.steam >= 0.5 ? 1 : 0;
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // it boils down slowly, and the crystals grow layer by layer
        st.f = ISO.follow(st.f, want.f, dt, 1.2, calm);
        st.x = calm ? want.x : st.x + Math.sign(want.x - st.x) * Math.min(Math.abs(want.x - st.x), dt * 0.35);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        s.amt = ISO.follow(s.amt, calm ? 0 : st.steam, dt, 0.5, calm); if (Math.abs(s.amt - st.steam) < 0.004) s.amt = calm ? 0 : st.steam;
        if (!calm) s.ph += dt;
        draw();
        if (s.amt > 0.002 || el.steam._on) { el.steam._on = s.amt > 0.002; drawSteam(); }
        return st.f !== want.f || st.x !== want.x || st.mixT < 1 || s.amt !== (calm ? 0 : st.steam);
      };
      g.readout = () => `evaporating basin 9 cm · ${Math.round(V.vol(levelZ()))} mL of ${st.c1} solution${st.steam ? " · boiling, steam rising" : ""}${st.x > 0.05 ? ` · crystals ${st.x > 0.95 ? "fully grown" : "growing"} on the floor and walls` : ""}`;
      draw(); drawSteam();
      return g;
    },
  });
})();
