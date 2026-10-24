// "ivbag cx cy height rate=0-60 lbl=0 lab=0 lit=bag|chamber|clamp|line|pole |text" — an IV drip on a rolling pole.
// A 1000 mL bag (its label prints `text`, default Saline) hangs by its eyelet on the pole's hook; the spike of a
// 20 drops/mL giving set sits in the bag's port. Drops form at the drip orifice, fall into the pool in the drip chamber
// and land with a ripple, at the set rate. The roller clamp's wheel rolls up its ramp to open the line and down to
// pinch it shut. The line loops down to a cannula in a teaching practice arm resting on its foam cradle.
// Flow: mL/h = drops/min × 60 ÷ 20. set({ rate }) rolls the wheel to give that many drops a minute.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm.
  const DF = 20, BAG_ML = 1000, BX = 9, BW = 15, BZ0 = 74, BZ1 = 104, PX = BX - 2.5;
  const CH = { z0: 51, z1: 64, r: 1.7, pool: 54.2, orifice: 62.6 }, CLAMP = { z0: 28, z1: 37 };
  const ARM = { x0: 30, x1: 64, y: 7, z: 9.2 }, HUB = [36, ARM.y, 13.3];
  const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const xAx = (x, y, z) => G.frameOf([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const armR = (x) => 3.1 + (1.15 * (x - ARM.x0)) / (ARM.x1 - ARM.x0);
  const SKIN = ISO.tint("#ece7df", ["#bdb4a8", "#cbc3b8", "#d8d1c7", "#e3ddd4"], "#5e554a");
  const FOAM = ISO.tint("#8fa3b5", ["#5d7184", "#687c8f", "#73879a", "#7f93a6"], "#2a3a4a");
  const GLASS = "ib-glass", STYLE = `<style>.${GLASS} .iso-fill{fill-opacity:.15}.${GLASS} .iso-shade{fill-opacity:.32}.${GLASS} .iso-top{fill-opacity:.25}</style>`;

  // A clear plastic line along 3D points: dark rim, pale body, a thin core of fluid.
  const tube = (P, pts, r) => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 2 * r * G.scaleOf(P);
    return `<path d="${d}" fill="none" stroke="#6d8798" stroke-width="${(w + 1).toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#f1f7fb" stroke-width="${w.toFixed(2)}" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="#a9cfee" stroke-width="${(w * 0.45).toFixed(2)}" stroke-linejoin="round"/>`;
  };
  // A steel hook or wire: a darker rim under a steel body.
  const wire = (P, pts, w) => { const d = K.pathOf(pts.map((p) => K.iso(p, P))); return `<path d="${d}" fill="none" stroke="#3c3f45" stroke-width="${w + 1}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#cfd2d6" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; };
  // The part of a closed (x, z) outline below z = level.
  const below = (pts, level) => {
    const out = [];
    pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; if (p[1] <= level) out.push(p); if ((p[1] < level) !== (q[1] < level)) { const t = (level - p[1]) / (q[1] - p[1]); out.push([p[0] + (q[0] - p[0]) * t, level]); } });
    return out;
  };
  const rounded = (x0, z0, x1, z1, r, n = 6) => [[x1 - r, z0 + r, -Math.PI / 2], [x1 - r, z1 - r, 0], [x0 + r, z1 - r, Math.PI / 2], [x0 + r, z0 + r, Math.PI]]
    .flatMap(([cx, cz, a]) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(a + (i / n) * (Math.PI / 2)), cz + r * Math.sin(a + (i / n) * (Math.PI / 2))]));

  function baseSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -26, y: -26, w: 52, d: 52, r: 26 }, 0, 8, P)}"/>`], legs = [];
    for (let k = 0; k < 5; k++) {
      const a = Math.PI / 2 + (k * 2 * Math.PI) / 5, c = Math.cos(a), s = Math.sin(a), tip = [c * 23, s * 23];
      legs.push({ k: K.depthOf([tip[0], tip[1], 0], P), svg: () => {
        const at = (u, w, z) => [c * u - s * w, s * u + c * w, z];
        const fork = ISO.box(at, P, [21.6, 24.4], [-1.3, 1.3], [5.6, 8.4], "mid");
        const F = G.frameOf([tip[0], tip[1], 3.2], [-s, c, 0], [c, s, 0], [0, 0, 1]);
        const wheel = ISO.tinted(ISO.T.rubber, S(G.disc(-1, 1, 3.2, F, P), { tone: "mid" })) + S(G.disc(1, 1.25, 1.2, F, P), { tone: "mid" });
        const leg = ISO.tinted(ISO.T.steel, ISO.poly([[2, -1.6, 8.2], [23.8, -1.2, 8.2], [23.8, 1.2, 8.2], [2, 1.6, 8.2], [2, -1.6, 11], [23.8, -1.2, 10], [23.8, 1.2, 10], [2, 1.6, 11]].map(([u, w, z]) => at(u, w, z)), ISO.BOX_F, P, "mid"));
        return wheel + fork + leg;
      } });
    }
    legs.sort((a, b) => a.k - b.k);
    // the far legs, the hub, then the near legs
    out.push(...legs.slice(0, 2).map((l) => l.svg()));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3.4, 8, 4, P, 32, 0.4), { tone: "mid" }) + S(K.cylinder(0, 0, 2.2, 12, 1.4, P, 24), { tone: "mid" })));
    out.push(...legs.slice(2).map((l) => l.svg()));
    return out.join("");
  }
  function poleSvg(P) {
    const out = [];
    out.push(S(K.cylinder(0, 0, 1.6, 13.4, 56.6, P, 24), { tone: "mid", crease: "none", inner: L(K.sideArc(0, 0, 1.6, 40, P, 16), { tone: "faint" }) }));
    // height collar with its locking knob
    out.push(S(K.cylinder(0, 0, 2.3, 70, 4.4, P, 28, 0.3), { tone: "mid", inner: L(K.knurl(0, 0, 2.3, 70, 74.4, 22, P, 0), { tone: "faint" }) }));
    const kf = G.frameAlong([0, 0, 72.2], [0.5, 0.866, 0]);
    out.push(S(G.disc(2.2, 3.6, 0.6, kf, P), { tone: "mid" }), ISO.tinted(ISO.T.plastic, S(G.disc(3.6, 5.4, 1.5, kf, P), { tone: "hi" }) + L(G.ribsOf(kf, 3.6, 5.4, 1.5, 12, P, { seams: true }), { tone: "lo" })));
    out.push(S(K.cylinder(0, 0, 1.1, 74.4, 37.6, P, 20), { tone: "mid", crease: "none" }), S(G.sphereOf([0, 0, 112.6], 1.4, P), { tone: "mid" }));
    // the hook crown: a ring on the pole and two J-hooks
    out.push(S(K.cylinder(0, 0, 1.7, 107.4, 2, P, 24), { tone: "mid" }));
    for (const sx of [-1, 1]) out.push(wire(P, [[sx * 1.6, 0, 108.4], [sx * 9.4, 0, 108.4], [sx * 10.6, 0, 109.2], [sx * 10.8, 0, 110.8]], 1.6), D([K.iso([sx * 10.8, 0, 110.8], P)], { size: 0.9, tone: "mid" }));
    return ISO.tinted(ISO.T.steel, out.join(""));
  }
  function armSvg(P) {
    const out = [];
    for (const x of [36, 57]) out.push(ISO.tinted(FOAM, S(K.slabOf({ x: x - 3.5, y: ARM.y - 4.5, w: 7, d: 9, r: 1 }, 0, ARM.z - armR(x) + 0.5, P, 3, 0.4), { tone: "mid" })));
    // a plain practice forearm: a smooth tapered limb with rounded ends, no hand, nothing else
    const F = xAx(ARM.x0, ARM.y, ARM.z), len = ARM.x1 - ARM.x0, prof = [[0, 0]];
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push([armR(ARM.x0) * (1 - Math.cos(a)), armR(ARM.x0) * Math.sin(a), 1]); }
    prof.push([len * 0.5, armR(ARM.x0 + len * 0.5), 1]);
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2), r = armR(ARM.x1); prof.push([len - r + r * Math.sin(a), r * Math.cos(a), 1]); }
    prof[prof.length - 1] = [len, 0];
    out.push(ISO.tinted(SKIN, S(G.lathe(prof, F, P), { tone: "hi" })));
    return out.join("");
  }
  function hubSvg(P) {
    // Luer connector on the line, the cannula hub with its wings, and the tape over it
    const F = xAx(HUB[0] - 1.6, HUB[1], HUB[2]), out = [];
    out.push(S(G.disc(0, 1.6, 0.75, F, P), { tone: "mid", inner: L(G.ribsOf(F, 0.2, 1.4, 0.75, 8, P, { seams: true }), { tone: "faint" }) }));
    out.push(ISO.tinted(ISO.T.amber, S(G.disc(1.6, 3.4, 0.62, F, P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.amber, ISO.wbox(P, [HUB[0] + 2.2, HUB[0] + 3.4], [HUB[1] - 2.2, HUB[1] + 2.2], [HUB[2] - 0.75, HUB[2] - 0.45], "hi")));
    out.push(ISO.tinted(ISO.tint("#fbfbfa", ["#d8d8d4", "#e2e2de", "#ebebe7", "#f3f3f0"], "#8a8a86"), ISO.wbox(P, [HUB[0] + 3.6, HUB[0] + 6.2], [HUB[1] - 2.8, HUB[1] + 2.8], [HUB[2] - 0.55, HUB[2] - 0.35], "lo")));
    return out.join("");
  }
  function bagSvg(P, text, lab) {
    const outline = rounded(BX - BW / 2, BZ0, BX + BW / 2, BZ1, 2.6);
    const level = BZ0 + (BZ1 - BZ0 - 1.5) * 0.93, fluid = below(outline, level);
    const fm = ISO.faceMatrix(P, [BX - BW / 2, 1.62, BZ1], 0.1);
    const face = fluid.length > 2 ? `<path d="${K.pathOf(fluid.map(([x, z]) => K.iso([x, 1.61, z], P)), true)}" fill="#d3e7f6" stroke="#9cc3e2" stroke-width="0.6"/>` : "";
    // printed scale on the right (every 100 mL), and the label with the fluid's name
    const ticks = [];
    for (let i = 1; i <= 9; i++) { const y = 30 + i * 26; ticks.push(`M128 ${y}H${i % 5 ? 138 : 142}`); }
    const art = `<path d="M128 56V264${ticks.join("")}" stroke="#4a6a85" stroke-width="1.4" fill="none"/>` +
      `<rect x="16" y="70" width="98" height="112" rx="5" fill="#fbfbfa" stroke="#4a6a85" stroke-width="1.6"/><rect x="16" y="70" width="98" height="20" rx="5" fill="#2b6cc4"/>` +
      (lab ? `<text x="65" y="122" text-anchor="middle" fill="#1f3550" style="font:700 22px 'Helvetica Neue',Arial,sans-serif">${text}</text>` : "") +
      `<text x="65" y="150" text-anchor="middle" fill="#1f3550" style="font:700 18px 'Helvetica Neue',Arial,sans-serif">1000 mL</text><path d="M30 164H100M30 172H80" stroke="#7a8fa3" stroke-width="2"/>`;
    const out = [];
    // hanger tab with its eyelet, the bag, its two ports
    out.push(ISO.prismY(P, [[BX - 3, BZ1 - 1], [BX + 3, BZ1 - 1], [BX + 2.2, BZ1 + 5], [BX - 2.2, BZ1 + 5]], -0.4, 0.4, ["#b9c9d6", "#eef4f8"], "#f4f8fb", "#5d7f96",
      `<path d="${G.circleOf(G.frameOf([BX, 0.42, BZ1 + 3.5], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, 0.9, P)}" fill="#fdfdfb" stroke="#5d7f96" stroke-width="0.8"/>`));
    out.push(ISO.prismY(P, outline, -1.6, 1.6, ["#b9c9d6", "#eef4f8"], "#f4f8fb", "#5d7f96", face + `<g transform="${fm}">${art}</g>` +
      ISO.seam(P, [[BX - BW / 2 + 0.8, 1.62, BZ0 + 1.6], [BX + BW / 2 - 0.8, 1.62, BZ0 + 1.6]], "#9fb6c8", 0.7)));
    out.push(ISO.tinted(ISO.T.glass, S(G.disc(0, 6, 0.95, up(PX, 0, BZ0 - 6), P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.glass, S(G.disc(1, 5, 0.85, up(BX + 2.5, 0, BZ0 - 5), P), { tone: "hi" })), ISO.tinted(ISO.T.blue, S(G.disc(0, 1.6, 1.2, up(BX + 2.5, 0, BZ0 - 5.6), P), { tone: "hi" })));
    return out.join("");
  }
  // Drip chamber: the spike cap (white) with finger flange, the pool, the orifice tube; the clear wall goes on top.
  function chamberBackSvg(P) {
    const F = up(PX, 0, CH.z0), out = [];
    out.push(ISO.tinted(ISO.T.blue, S(G.solidOf([[-1.6, 0.55], [0, CH.r - 0.1], [CH.pool - CH.z0, CH.r - 0.1]], F, P), { tone: "hi" })));
    out.push(S(G.disc(CH.orifice - CH.z0, CH.z1 - CH.z0, 0.35, F, P), { tone: "mid" }));
    return out.join("");
  }
  function chamberFrontSvg(P) {
    const F = up(PX, 0, CH.z0), out = [];
    out.push(`<g class="${GLASS}">${ISO.tinted(ISO.T.glass, S(G.lathe([[-2, 0.5], [-1.6, 0.55], [0, CH.r, 1], [0.4, CH.r], [CH.z1 - CH.z0, CH.r]], F, P, { rims: "first" }), { tone: "hi" }))}</g>`);
    const cap = up(PX, 0, CH.z1);
    out.push(ISO.tinted(ISO.tint("#fbfbfa", ["#cfd1d4", "#dcdee0", "#e7e8ea", "#f1f2f3"], "#5d6268"), S(G.disc(0, 1.8, CH.r + 0.25, cap, P), { tone: "hi" }) + S(G.disc(1.8, 2.4, 2.8, cap, P), { tone: "hi" }) + S(G.disc(2.4, 4, 1.25, cap, P), { tone: "hi" })));
    return out.join("");
  }
  function clampSvg(P, back) {
    const x0 = PX - 1.5, x1 = PX + 1.5, out = [], T = ISO.tint("#f4f6f7", ["#c6cbd0", "#d3d7db", "#dfe2e5", "#e9ebed"], "#4e555c");
    if (back) return ISO.tinted(T, ISO.wbox(P, [x0, x1], [-1.4, -0.7], [CLAMP.z0, CLAMP.z1], "mid"));
    for (const x of [x0 - 0.5, x1]) out.push(ISO.tinted(T, ISO.poly([[x, -1.4, CLAMP.z0], [x + 0.5, -1.4, CLAMP.z0], [x + 0.5, -1.4, CLAMP.z1], [x, -1.4, CLAMP.z1], [x, 1.5, CLAMP.z0 + 1], [x + 0.5, 1.5, CLAMP.z0 + 1], [x + 0.5, 0.7, CLAMP.z1], [x, 0.7, CLAMP.z1]], ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(T, ISO.wbox(P, [x0 - 0.5, x1 + 0.5], [-1.4, 1.5], [CLAMP.z0 - 0.6, CLAMP.z0], "mid")));
    return out.join("");
  }
  // The roller wheel at clamp opening u (0 shut, at the bottom of the ramp; 1 open, at the top).
  function wheelSvg(P, u) {
    const z = CLAMP.z0 + 2 + u * (CLAMP.z1 - CLAMP.z0 - 4), F = xAx(PX - 1.15, 0.55, z);
    return ISO.tinted(ISO.T.blue, S(G.disc(0, 2.3, 1.45, F, P), { tone: "hi", inner: L(G.ribsOf(F, 0, 2.3, 1.45, 18, P), { tone: "lo" }) }));
  }

  ISO.add({
    name: "ivbag", title: "IV drip", compare: "ivbag 470 270 360 |Saline",
    about: "A 1000 mL bag on an IV pole: drops fall in the drip chamber at the rate the roller clamp sets; with a 20 drops/mL set, mL/h = drops/min × 3.",
    line: "ivbag cx cy height rate=0-60 lbl=0 lab=0 lit=bag|chamber|clamp|line|pole |text",
    demo: { line: "ivbag 470 270 360 rate=21 |Saline", script: [{ set: { lit: "chamber" }, hold: 4 }, { set: { rate: 42, lit: "clamp" }, hold: 5 }, { set: { rate: 0 }, hold: 3 }] },
    make([cx, cy, height = 360], o, text, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = height * 1.4, H = height * 1.16;
      const pts = [[-26, -26, 0], [26, 26, 0], [-26, 26, 0], [26, -26, 0], [0, 0, 113], [-11, 0, 111], [BX + BW / 2, 1.6, BZ1], [ARM.x1, ARM.y + 4.5, 0], [ARM.x1, ARM.y - 4.5, 13.5]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 64, elevation: 18 }, parent);
      const route = G.fillet([[PX, 0, CH.z0 - 2], [PX, 0, 17], [PX + 6, 3, 13.3], [HUB[0] - 1.6, HUB[1], HUB[2]]], 4, 9);
      g.innerHTML = STYLE + `<g>${baseSvg(P)}${armSvg(P)}</g><g data-name="pole">${poleSvg(P)}</g><g data-name="bag">${bagSvg(P, text || "Saline", lab)}</g>` +
        `<g data-name="clamp-back">${clampSvg(P, true)}</g><g data-name="line">${tube(P, route, 0.34)}${hubSvg(P)}</g>` +
        `<g data-name="chamber">${chamberBackSvg(P)}<circle data-part="hang" fill="#4f93d6" stroke="#1f4f8f" stroke-width=".5"/><circle data-part="fall" fill="#4f93d6" stroke="#1f4f8f" stroke-width=".5"/>` +
        `<ellipse data-part="ripple" fill="none" stroke="#2b6cc4" stroke-width=".6"/>${chamberFrontSvg(P)}</g><g data-name="clamp">${clampSvg(P, false)}<g data-part="wheel"></g></g><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), w = ISO.writer(), wheel = q("wheel"), hang = q("hang"), fall = q("fall"), ripple = q("ripple");
      const parts = [...g.querySelectorAll("[data-name]")];
      const s = { rate: ISO.clamp(ISO.num(o, "rate", 21), 0, 60), u: 0, t: 0, fallT: 9, lit: o.lit || "" };
      s.u = s.rate / 60;
      const sc = G.scaleOf(P), orifice = K.iso([PX, 0, CH.orifice], P), pool = K.iso([PX, 0, CH.pool], P);
      const dropR = 0.32 * sc;
      if (lab) {
        const word = (p, txt, anchor, dx = 0, dy = 4) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word([BX + BW / 2, 0, (BZ0 + BZ1) / 2], "IV bag", "start", 8) + word([PX - CH.r, 0, (CH.z0 + CH.z1) / 2], "Drip chamber", "end", -8) +
          word([PX - 2, 0, (CLAMP.z0 + CLAMP.z1) / 2], "Roller clamp", "end", -8) + word([ARM.x1 - 6, ARM.y + 4, 0], "Cannula in practice arm", "middle", 0, 18) + word([0, 0, 92], "IV pole", "end", -8);
      }
      const draw = () => {
        w.rebuild(wheel, s.u.toFixed(3), () => wheelSvg(P, s.u));
        // a hanging drop grows at the orifice; a freed drop falls the 8 mm to the pool (½gt²) and leaves a ripple
        const T = s.rate > 0.2 ? 60 / s.rate : Infinity, grow = Math.cbrt(ISO.clamp(s.t / Math.min(T, 3), 0, 1));
        w.attr(hang, "cx", orifice[0].toFixed(1)); w.attr(hang, "cy", (orifice[1] + grow * dropR).toFixed(1)); w.attr(hang, "r", (grow * dropR).toFixed(2));
        const fallen = 490 * s.fallT * s.fallT, gap = CH.orifice - CH.pool;
        w.shown(fall, fallen < gap);
        if (fallen < gap) { const p = K.iso([PX, 0, CH.orifice - 0.3 - fallen], P); w.attr(fall, "cx", p[0].toFixed(1)); w.attr(fall, "cy", p[1].toFixed(1)); w.attr(fall, "r", (dropR * 0.95).toFixed(2)); }
        const land = Math.sqrt(gap / 490), rip = (s.fallT - land) / 0.5;
        w.shown(ripple, rip > 0 && rip < 1);
        if (rip > 0 && rip < 1) { w.attr(ripple, "cx", pool[0].toFixed(1)); w.attr(ripple, "cy", pool[1].toFixed(1)); w.attr(ripple, "rx", (rip * (CH.r - 0.3) * sc).toFixed(2)); w.attr(ripple, "ry", (rip * (CH.r - 0.3) * sc * 0.31).toFixed(2)); w.attr(ripple, "opacity", (1 - rip).toFixed(2)); }
        w.light(parts, parts.filter((p) => p.dataset.name.startsWith(s.lit) && s.lit));
      };
      g.set = (p) => { if (p.rate !== undefined) s.rate = ISO.clamp(+p.rate, 0, 60); if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.u = ISO.follow(s.u, s.rate / 60, dt, 0.35, calm);
        const flowing = s.u > 0.01;
        // the wheel sets the rate; drops come at the rate the wheel gives now
        const now = s.u * 60;
        s.t += dt; s.fallT += dt;
        if (flowing && s.t >= 60 / now) { s.t = 0; s.fallT = 0; }
        if (!flowing) s.t = Math.min(s.t, 1.5);
        draw();
        return true;
      };
      g.readout = () => {
        const r = Math.round(s.u * 60);
        if (r < 1) return "roller clamp shut · no drops · 0 mL/h";
        const mlh = (r * 60) / DF;
        return `${r} drops/min × 60 ÷ ${DF} drops/mL = ${mlh.toFixed(0)} mL/h · a ${BAG_ML} mL bag lasts ${(BAG_ML / mlh).toFixed(1)} h`;
      };
      draw();
      return g;
    },
  });
})();
