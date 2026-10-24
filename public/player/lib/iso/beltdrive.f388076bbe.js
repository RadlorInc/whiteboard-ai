// "beltdrive cx cy width spin=1 d1=80 d2=240 lab=1 lit=motor|driver|driven|belt" — a V-belt drive on a steel frame.
// An electric motor on slide rails (a tension bolt pushes it back to tighten the belt) carries a small driver pulley;
// a V-belt runs to a big driven pulley on a shaft held by two pillow-block bearings on a pedestal. The belt moves at
// one speed v = π·d1·n1 = π·d2·n2, so the speed ratio is the diameter ratio: n2 = n1 × d1/d2 (1440 → 480 rpm for
// 80 and 240 mm), and the torque goes up by the same factor. spin=1 runs it; the belt's marks move with the rims.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -128, y: -42, w: 236, d: 84, r: 6 }, N1 = 1440, SHOWN = 1.2;          // driver shown at 1.2 rev/s
  const C1 = [-72, 40], C2 = [56, 70], BY = 27, MM = 0.125;                                   // pulley centres (x, z), belt plane, world units per mm
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`, hex = (r) => Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * r, Math.sin(i * Math.PI / 3) * r]);

  // The open belt: two outer tangents and the arcs it wraps, as (x, z) points; returns the points and its length.
  function beltPts(r1, r2) {
    const dx = C2[0] - C1[0], dz = C2[1] - C1[1], d = Math.hypot(dx, dz), ph = Math.atan2(dz, dx), al = Math.acos((r1 - r2) / d);
    const on = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)], pts = [];
    for (let i = 0; i <= 40; i++) pts.push(on(C2, r2, ph + al - (2 * al * i) / 40));
    for (let i = 0; i <= 24; i++) pts.push(on(C1, r1, ph - al - ((2 * Math.PI - 2 * al) * i) / 24));
    pts.push(pts[0]);
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return { pts, len };
  }
  function frameSvg(P) {
    const out = [ISO.baseboard(P, BOARD), ISO.plate(P, { x: -40, y: 22, w: 40, d: 12, r: 1.2 })];
    // motor slide rails with slots and the tension bolt in its lug
    for (const y of [-24, 6]) out.push(ISO.wbox(P, [-104, -40], [y, y + 10], [0, 4], "mid"), L(K.planOutline({ x: -96, y: y + 3.5, w: 48, d: 3, r: 1.5 }, 4, P, 2), { tone: "lo" }));
    out.push(ISO.wbox(P, [-122, -114], [-14, 2], [0, 12], "mid"), S(G.disc(0, 16, 1.6, G.frameOf([-114, -6, 8], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }), S(G.prismOf(G.frameOf([-122, -6, 8], [1, 0, 0], [0, 1, 0], [0, 0, 1]), hex(3), -3, 0, P), { tone: "mid" }));
    // the driven shaft's pedestal
    out.push(ISO.wbox(P, [38, 74], [-30, 18], [0, 40], "mid"), D([[42, 14], [70, 14], [42, -26], [70, -26]].map(([x, y]) => K.iso([x, y, 40], P)), { size: 0.6 }));
    return out.join("");
  }
  function motorSvg(P) {
    const F = yAx([C1[0], -32, C1[1]]), out = [];
    for (const y of [-22, 8]) out.push(ISO.wbox(P, [-88, -56], [y, y + 6], [4, C1[1] - 15], "mid"), D([K.iso([-84, y + 3, 4], P), K.iso([-60, y + 3, 4], P)], { size: 0.6 }));
    out.push(ISO.tinted(ISO.T.paint, S(G.solidOf([[0, 15], [2, 17, 1], [11, 17], [11, 18], [44, 18], [44, 16], [48, 15, 1], [49, 9]], F, P), { tone: "hi" }) +
      K.fadedSvg(G.ribsOf(F, 11, 44, 18.05, 28, P, { fade: [0.1, 0.5] }), { tone: "lo" }) + K.fadedSvg(G.ribsOf(F, 3, 10, 17.05, 30, P, { fade: [0.1, 0.5], seams: true }), { tone: "lo" })));
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [C1[0] - 8, C1[0] + 8], [-16, 0], [C1[1] + 16, C1[1] + 27], "hi") + ISO.wbox(P, [C1[0] - 9, C1[0] + 9], [-17, 1], [C1[1] + 27, C1[1] + 29], "hi")));
    out.push(S(G.disc(49, 54, 2.6, F, P), { tone: "mid" }));
    return named("motor", out.join(""));
  }
  function pillowSvg(P, y) {
    const F = yAx([C2[0], y, C2[1]]);
    return ISO.wbox(P, [C2[0] - 16, C2[0] + 16], [y - 5, y + 5], [40, C2[1] - 6], "mid") + D([K.iso([C2[0] - 12, y + 5, 46], P), K.iso([C2[0] + 12, y + 5, 46], P)], { size: 0.6 }) +
      S(G.solidOf([[-5, 7], [-5, 10], [5, 10], [5, 7]], F, P), { tone: "mid" }) + S(K.cylinder(C2[0], y, 1.4, C2[1] + 9.6, 2.4, P, 14), { tone: "hi" });
  }
  // A pulley: back flange, groove core (the belt runs between), front flange with a hub and set screw.
  const pulleyBack = (P, c, r) => { const F = yAx([c[0], 0, c[1]]); return S(G.disc(BY - 4.5, BY - 2.5, r + 1.5, F, P), { tone: "mid" }) + S(G.disc(BY - 2.5, BY + 2.5, r - 2.5, F, P), { tone: "lo" }); };
  const pulleyFront = (P, c, r) => { const F = yAx([c[0], 0, c[1]]); return S(G.disc(BY + 2.5, BY + 4.5, r + 1.5, F, P), { tone: "hi" }) + S(G.disc(BY + 4.5, BY + 7.5, Math.max(4, r * 0.28), F, P), { tone: "hi" }); };
  // What turns: the web holes (or marks) on the front face and the key on the hub.
  function turnSvg(P, c, r, a) {
    const F = yAx([c[0], 0, c[1]]), out = [];
    {
      const nh = r > 20 ? 5 : 3, holes = []; for (let i = 0; i < nh; i++) holes.push(K.pathOf(Array.from({ length: 19 }, (_, j) => K.iso(G.pointOf({ ...F, o: G.pointOf(F, 0, r * 0.6, a + (i * 2 * Math.PI) / nh) }, BY + 4.52, r * (r > 20 ? 0.2 : 0.16), (j / 18) * Math.PI * 2), P)), true));
      out.push(`<path d="${holes.join("")}" fill="#cfd3d8" stroke="#3c3f45" stroke-width="0.7"/>`);
    }
    const hubR = Math.max(4, r * 0.28);
    out.push(`<path class="iso-line" data-tone="lit" data-free="" d="${K.pathOf([K.iso(G.pointOf(F, BY + 7.52, 1.4, a), P), K.iso(G.pointOf(F, BY + 7.52, hubR, a), P)])}" style="stroke-width:1.4"/>`);
    out.push(D([K.iso(G.pointOf(F, BY + 7.52, 0, 0), P)], { size: 1.1, tone: "hi" }));
    return out.join("");
  }
  const style = `<style>.bd-belt{fill:none;stroke-linejoin:round}</style>`;

  ISO.add({
    name: "beltdrive", title: "Belt drive", compare: "beltdrive 480 270 460 spin=1",
    about: "A motor's small pulley drives a big pulley by a V-belt, both shafts in bearings on a frame: the big pulley turns slower, by the ratio of the diameters.",
    line: "beltdrive cx cy width spin=1 d1=80 d2=240 lab=1 lit=motor|driver|driven|belt",
    demo: { line: "beltdrive 480 270 460", script: [{ set: { spin: 1 }, hold: 4 }, { set: { lit: "driven" }, hold: 2.5 }, { set: { spin: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H = size * 0.98;
      const d1 = ISO.clamp(ISO.num(o, "d1", 80), 60, 140), d2 = ISO.clamp(ISO.num(o, "d2", 240), 120, 300);
      const r1 = d1 * MM * 1.2, r2 = d2 * MM * 1.2;                                          // drawn in proportion: radius ratio = d2/d1
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [C2[0], BY, C2[1] + r2 + 2], [C1[0], -30, C1[1] + 30]], cx, cy, W, H, { azimuth: 66, elevation: 22 }, parent);
      const s = { on: o.spin === "1", w: o.spin === "1" ? 1 : 0, belt: 0 };
      const B = beltPts(r1 - 1, r2 - 1), beltD = K.pathOf(B.pts.map(([x, z]) => K.iso([x, BY, z], P)), true), k = K.cameraOf(P).k;
      const words = !lab ? "" : [
        ISO.word(K.iso([C1[0], -24, C1[1] + 30], P), "motor 1440 rpm", "#555", { size: 15, dy: -8 }),
        ISO.word(K.iso([C1[0], BY, C1[1] - r1 - 2], P), `driver Ø${d1}`, "#555", { size: 14, dy: 22 }),
        ISO.word(K.iso([C2[0] + r2 + 2, BY, C2[1]], P), `driven Ø${d2}`, "#555", { size: 14, anchor: "start", dy: 4 }),
        ISO.word(K.iso([(C1[0] + C2[0]) / 2, BY, (C1[1] + C2[1]) / 2 + r1 + 8], P), "V-belt", "#555", { size: 14, dy: -24 }),
      ].join("");
      g.innerHTML = style + `<g>${frameSvg(P)}${motorSvg(P)}${pillowSvg(P, -22)}${S(G.disc(-30, BY, 3, yAx([C2[0], 0, C2[1]]), P), { tone: "mid" })}${pillowSvg(P, 8)}</g>` +
        `<g data-name="driver">${pulleyBack(P, C1, r1)}</g><g data-name="driven">${pulleyBack(P, C2, r2)}</g>` +
        `<g data-name="belt"><path class="bd-belt" d="${beltD}" stroke="#1f2226" stroke-width="${(4.2 * k).toFixed(2)}"/><path class="bd-belt" d="${beltD}" stroke="#3a3e44" stroke-width="${(2.8 * k).toFixed(2)}"/>` +
        `<path class="bd-belt" data-part="marks" d="${beltD}" stroke="#9aa0a7" stroke-width="${(1.4 * k).toFixed(2)}" stroke-dasharray="${(2 * k).toFixed(2)} ${(10 * k).toFixed(2)}"/></g>` +
        `<g data-name="driver">${pulleyFront(P, C1, r1)}<g data-part="t1"></g></g><g data-name="driven">${pulleyFront(P, C2, r2)}<g data-part="t2"></g></g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const marks = el.marks, segLen = marks.getTotalLength ? marks.getTotalLength() / B.len : k;  // screen px per world unit along the belt (average)
      let lit = o.lit || "";
      const draw = () => {
        const a1 = -s.belt / (r1 - 1), a2 = -s.belt / (r2 - 1);
        w.rebuild(el.t1, a1.toFixed(3), () => turnSvg(P, C1, r1, a1));
        w.rebuild(el.t2, a2.toFixed(3), () => turnSvg(P, C2, r2, a2));
        w.attr(marks, "stroke-dashoffset", (s.belt * segLen).toFixed(1));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.spin !== undefined) s.on = !!+p.spin; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.w = ISO.follow(s.w, target, dt, s.on ? 0.5 : 0.8, ISO.still());
        if (s.w < 0.002 && !s.on) s.w = 0;
        if (!ISO.still()) s.belt += s.w * SHOWN * 2 * Math.PI * (r1 - 1) * dt;
        draw();
        return s.w !== target || s.w > 0;
      };
      g.readout = () => {
        const n1 = N1 * s.w, n2 = n1 * d1 / d2, v = Math.PI * (d1 / 1000) * (n1 / 60);
        return `speed ratio = d2/d1 = ${d2}/${d1} = ${(d2 / d1).toFixed(2)} · driver ${n1.toFixed(0)} rpm → driven ${n2.toFixed(0)} rpm · belt ${v.toFixed(1)} m/s · torque ×${(d2 / d1).toFixed(2)} (less a few % slip)`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
