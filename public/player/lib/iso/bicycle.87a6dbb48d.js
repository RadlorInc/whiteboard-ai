// "bicycle cx cy length pedal=0|1 front=44 rear=16 lab=1 lit=frame|wheel|chain|chainring|cog|crank|saddle" — a road bike.
// Seen from its chain side (it faces left): a diamond frame of tubes, 700c wheels with 32 spokes, the 44-tooth
// chainring on the cranks and a 16-tooth cog on the rear hub joined by the chain. pedal=1 turns the cranks: the chain
// carries every tooth of the chainring past the cog, so the rear wheel turns front/rear = 44/16 = 2.75 times per pedal
// turn and the bike goes 2.75 × 2.11 m = 5.8 m. The road runs under the wheels at that speed.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Forward is −x (it faces left so its chain side, +y, faces you); z up.
  const R = 34, RA = [100, 34], FA = [0, 34], BB = [58, 27], ST = [70, 79], HT = [13, 77], HB = [9, 63], CRANK = 17, CIRC = 211;
  const STEEL = "#3c3f45", TUBE = "#c4382c", TUBE_HI = "#ef8e84";
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const open = (svg) => svg.replace(/<path class="iso-fill"[^>]*>/, "").replace(/<path class="iso-top"[^>]*>/, "");
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const pipe = (P, pts, r, ink = STEEL, fill = TUBE, hi = TUBE_HI) => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 2 * r * G.scaleOf(P);
    return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(w + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${hi}" stroke-width="${(w * 0.28).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-0.3 -0.6)"/>`;
  };
  const at = (xz, y) => [xz[0], y, xz[1]];
  // 2D art in a wheel's own plane (x right, y down = −z), turned by rotate() on its [data-spin] group.
  const onFace = (P, o, svg) => `<g transform="${ISO.faceMatrix(P, o, 1)}"><g data-spin>${svg}</g></g>`;
  const f2 = (v) => v.toFixed(2);
  const spokesArt = (r, n, hub) => {
    let d = "";
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = a + (i % 2 ? 0.55 : -0.55); d += `M${f2(Math.cos(a) * hub)} ${f2(Math.sin(a) * hub)}L${f2(Math.cos(b) * r)} ${f2(Math.sin(b) * r)}`; }
    return `<path d="${d}" stroke="#7d838b" stroke-width="0.3" fill="none"/><circle r="${r}" fill="none" stroke="#5d636b" stroke-width="1.8"/><circle r="${r - 1.2}" fill="none" stroke="#d6d9dd" stroke-width="0.5"/>` +
      `<rect x="-0.6" y="${-r - 1.6}" width="1.2" height="2.4" fill="#c9ccd1" stroke="${STEEL}" stroke-width="0.25"/>`;                  // the valve
  };
  // A sprocket: n teeth round a pitch radius (chain pitch 1.27 cm), with a spider of k arms and bolts.
  const sprocketArt = (n, k) => {
    const r = (1.27 * n) / (2 * Math.PI), pts = [];
    for (let i = 0; i < n; i++) for (const [f, rr] of [[-0.5, r - 0.45], [-0.22, r - 0.45], [-0.1, r + 0.45], [0.1, r + 0.45], [0.22, r - 0.45]]) { const a = ((i + f + 0.5) / n) * Math.PI * 2; pts.push(`${f2(Math.cos(a) * rr)} ${f2(Math.sin(a) * rr)}`); }
    let arms = "";
    if (k) for (let i = 0; i < k; i++) { const a = (i / k) * Math.PI * 2; arms += `<path d="M0 0L${f2(Math.cos(a) * (r - 2))} ${f2(Math.sin(a) * (r - 2))}" stroke="${STEEL}" stroke-width="2.2" stroke-linecap="round"/><path d="M0 0L${f2(Math.cos(a) * (r - 2))} ${f2(Math.sin(a) * (r - 2))}" stroke="#b6b9be" stroke-width="1.4" stroke-linecap="round"/><circle cx="${f2(Math.cos(a) * (r - 2))}" cy="${f2(Math.sin(a) * (r - 2))}" r="0.5" fill="${STEEL}"/>`; }
    const inner = k ? `<circle r="${f2(r - 1.6)}" fill="#fdfdfb" stroke="${STEEL}" stroke-width="0.35"/>` : `<circle r="${f2(r - 1.1)}" fill="none" stroke="#9a9da3" stroke-width="0.3"/>`;
    return `<path d="M${pts.join("L")}Z" fill="#d9dadd" stroke="${STEEL}" stroke-width="0.35" stroke-linejoin="round"/>${inner}${arms}<circle r="${k ? 2.2 : 1.2}" fill="#c9ccd1" stroke="${STEEL}" stroke-width="0.35"/>`;
  };
  // The open chain path round the chainring (r1, at BB) and the cog (r2, at the rear axle), as (x, z) points.
  function chainPts(r1, r2) {
    const C1 = BB, C2 = RA, dx = C2[0] - C1[0], dz = C2[1] - C1[1], d = Math.hypot(dx, dz), ph = Math.atan2(dz, dx), al = Math.acos((r1 - r2) / d);
    const on = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)], pts = [];
    for (let i = 0; i <= 24; i++) pts.push(on(C2, r2, ph + al - (2 * al * i) / 24));
    for (let i = 0; i <= 40; i++) pts.push(on(C1, r1, ph - al - ((2 * Math.PI - 2 * al) * i) / 40));
    pts.push(pts[0]);
    return pts;
  }
  // A pedal on its spindle at the end of a crank turned to angle a (radians, in x–z), on side sy (+1 near, −1 far).
  function pedalSvg(P, a, sy) {
    const e = [BB[0] + Math.cos(a) * CRANK, BB[1] + Math.sin(a) * CRANK], y0 = sy * 9.5, y1 = sy * 11, y2 = sy * 19;
    return ISO.tinted(ISO.T.steel, S(G.disc(Math.min(y0, y1), Math.max(y0, y1), 0.8, yAx([e[0], 0, e[1]]), P), { tone: "mid" })) +
      ISO.tinted(ISO.T.plastic, ISO.wbox(P, [e[0] - 4.5, e[0] + 4.5], [Math.min(y1, y2), Math.max(y1, y2)], [e[1] - 1.2, e[1] + 1.2], "mid") +
        ISO.wbox(P, [e[0] - 4.5, e[0] - 3.5], [Math.min(y1, y2), Math.max(y1, y2)], [e[1] - 1.8, e[1] + 1.8], "mid") + ISO.wbox(P, [e[0] + 3.5, e[0] + 4.5], [Math.min(y1, y2), Math.max(y1, y2)], [e[1] - 1.8, e[1] + 1.8], "mid"));
  }
  const crankArt = `<path d="M0 0L${CRANK} 0" stroke="${STEEL}" stroke-width="3.4" stroke-linecap="round"/><path d="M0 0L${CRANK} 0" stroke="#c7c9cd" stroke-width="2.6" stroke-linecap="round"/><circle r="1.3" fill="#9a9da3" stroke="${STEEL}" stroke-width="0.3"/><circle cx="${CRANK}" r="0.7" fill="${STEEL}"/>`;

  function wheelSvg(P, c) {
    const F = yAx(at(c, 0)), out = [];
    out.push(ISO.tinted(ISO.T.rubber, open(S(G.ringBand(-1.4, 1.4, R - 2.4, R, F, P), { tone: "mid" }))));
    out.push(onFace(P, at(c, 0.3), spokesArt(R - 2.5, 32, 2.6)));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-5, 5, 1.6, F, P), { tone: "mid" }) + S(G.ringBand(-3.2, -2.4, 1.6, 3, F, P), { tone: "mid" }) + S(G.ringBand(2.4, 3.2, 1.6, 3, F, P), { tone: "mid" }) + S(G.disc(5, 6.2, 1.9, F, P), { tone: "hi" })));
    return out.join("");
  }
  // audit: the hubs, head tube, shell and fittings hang on the frame tubes and spokes, drawn as strokes (pipe, spokesArt)
  // that the audit can't see, so it lists them loose; each one sits on its tube end or axle.
  function frameSvg(P) {
    const out = [];
    // stays and fork legs on both sides of the wheels, the main triangle in the middle
    for (const y of [-3.5, 3.5]) out.push(pipe(P, [at(RA, y), at([BB[0] + 3, BB[1]], y * 0.6)], 0.9), pipe(P, [at(RA, y), at([ST[0] + 1, ST[1] - 3], y * 0.4)], 0.8));
    for (const y of [-4, 4]) out.push(pipe(P, [at(FA, y), at([4, 52], y * 0.9), at([HB[0] - 0.4, HB[1] - 2], y * 0.5)], 0.9, STEEL, "#d9dadd", "#f6f6f7"));
    out.push(pipe(P, [at(BB, 0), at([ST[0] + 1.5, ST[1] + 3], 0)], 1.4), pipe(P, [at([ST[0] + 0.5, ST[1]], 0), at([HT[0] + 1.5, HT[1] - 1], 0)], 1.3), pipe(P, [at(BB, 0), at([HB[0] + 1.5, HB[1] + 2], 0)], 1.8));
    // head tube with its headset cups, the bottom bracket shell, the seat clamp
    const hd = [HT[0] - HB[0], 0, HT[1] - HB[1]], hl = Math.hypot(hd[0], hd[2]), hF = G.frameAlong(at(HB, 0), hd.map((v) => v / hl));
    out.push(ISO.tinted(ISO.T.red, S(G.disc(0, hl, 2.1, hF, P), { tone: "mid" })), ISO.tinted(ISO.T.steel, S(G.disc(-1.2, 0, 2.5, hF, P), { tone: "mid" }) + S(G.disc(hl, hl + 1.2, 2.5, hF, P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.red, S(G.disc(-3.5, 3.5, 2.4, yAx(at(BB, 0)), P), { tone: "mid" })));
    const sd = [ST[0] - BB[0], 0, ST[1] - BB[1]], sl = Math.hypot(sd[0], sd[2]), sF = G.frameAlong(at(BB, 0), sd.map((v) => v / sl));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(sl + 1, sl + 3.5, 1.9, sF, P), { tone: "mid" }) + S(G.disc(sl + 3.5, sl + 14, 1.3, sF, P), { tone: "hi" })));
    // bottle cage and bottle on the down tube, brake calipers on the fork crown and seat-stay bridge
    const dd = [HB[0] - BB[0], 0, HB[1] - BB[1]], dl = Math.hypot(dd[0], dd[2]), du = dd.map((v) => v / dl), dn = [du[2], 0, -du[0]];
    const bo = [BB[0] + du[0] * 12 + dn[0] * 5.2, 0, BB[1] + du[2] * 12 + dn[2] * 5.2];
    // the cage: two bosses on the down tube and a wire band round the bottle
    for (const sAt of [16, 26]) out.push(ISO.tinted(ISO.T.steel, S(G.disc(1.6, 2.3, 0.8, G.frameAlong([BB[0] + du[0] * sAt, 0, BB[1] + du[2] * sAt], dn), P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.blue, S(G.solidOf([[0, 3.2], [16, 3.2, 1], [18, 2.2], [19.5, 1.2], [21, 1.2]], G.frameAlong(bo, du), P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(4, 5, 3.2, 3.6, G.frameAlong(bo, du), P), { tone: "mid" }) + S(G.ringBand(12, 13, 3.2, 3.6, G.frameAlong(bo, du), P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, ISO.box((s, l, y) => [HB[0] + l, y, HB[1] - 3 + s], P, [-3, -1], [-1.5, 3.5], [-3, 3], "mid") + ISO.box((s, l, y) => [RA[0] - 24 + l, y, 64 + s], P, [-2, 0], [-1.5, 2.5], [-3, 3], "mid")));
    // saddle on its rails, stem and drop handlebar with bar tape and brake hoods
    const top = [BB[0] + (sd[0] / sl) * (sl + 14), BB[1] + (sd[2] / sl) * (sl + 14) - 1];
    out.push(ISO.tinted(ISO.T.plastic, ISO.poly([[top[0] - 10, -2, top[1] + 1], [top[0] + 14, -6, top[1] + 1], [top[0] + 14, 6, top[1] + 1], [top[0] - 10, 2, top[1] + 1], [top[0] - 10, -2, top[1] + 3.2], [top[0] + 14, -6, top[1] + 3.6], [top[0] + 14, 6, top[1] + 3.6], [top[0] - 10, 2, top[1] + 3.2]], ISO.BOX_F, P, "mid")));
    const sTop = [HT[0] + 0.5, HT[1] + 5];
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(hl + 1.2, hl + 5, 1.6, hF, P), { tone: "mid" }) + ISO.box((s, l, y) => [sTop[0] - l, y, sTop[1] + s], P, [-1.2, 1.2], [0, 9], [-1.5, 1.5], "mid")));
    const bar = [sTop[0] - 9, sTop[1]];
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-21, 21, 1.2, yAx(at(bar, 0)), P), { tone: "hi" })));
    for (const y of [-20, 20]) out.push(pipe(P, [[bar[0], y, bar[1]], [bar[0] - 7, y, bar[1] - 1], [bar[0] - 8, y, bar[1] - 8], [bar[0] - 3, y, bar[1] - 13], [bar[0] + 2, y, bar[1] - 13]], 1.3, "#121214", "#3a3e44", "#6b7078"));
    for (const y of [-20, 20]) out.push(ISO.tinted(ISO.T.plastic, ISO.box((s, l, yy) => [bar[0] - 6 + l, y + yy, bar[1] + s], P, [-2, 2.5], [-1.5, 1.5], [-1.4, 1.4], "mid")));
    return out.join("");
  }

  ISO.add({
    name: "bicycle", title: "Bicycle", compare: "bicycle 480 270 420",
    about: "A road bike seen from its chain side: pedalling turns the chainring, the chain turns the small cog on the rear hub 2.75 times per pedal turn, and the wheels roll the bike 5.8 m.",
    line: "bicycle cx cy length pedal=0|1 front=44 rear=16 lab=1 lit=frame|wheel|chain|chainring|cog|crank|saddle",
    demo: { line: "bicycle 480 270 420", script: [{ set: { pedal: 1, lit: "chain" }, hold: 4 }, { set: { lit: "cog" }, hold: 3 }, { set: { pedal: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.7, H = size * 1.05;
      const nf = Math.round(ISO.clamp(ISO.num(o, "front", 44), 28, 56)), nr = Math.round(ISO.clamp(ISO.num(o, "rear", 16), 11, 34));
      const r1 = (1.27 * nf) / (2 * Math.PI), r2 = (1.27 * nr) / (2 * Math.PI), ratio = nf / nr;
      const ROAD = { x: -46, y: -30, w: 192, d: 60, r: 3 };
      const { P, g } = ISO.frame([...K.boxCorners(ROAD, -4, 0), [ST[0] + 10, 0, 100], [HT[0] - 20, 21, 92]], cx, cy, W, H, { azimuth: 72, elevation: 18, pad: 6 }, parent);
      const k = K.cameraOf(P).k;
      // the road: a slab with a dashed centre line that runs back under the wheels as the bike moves
      const roadLine = K.pathOf([K.iso([ROAD.x + 3, 14, 0], P), K.iso([ROAD.x + ROAD.w - 3, 14, 0], P)]);
      const road = ISO.tinted(ISO.T.road, S(K.slabOf(ROAD, -4, 4, P, 3, 0.5), { tone: "lo", inner: L(K.sideSeam(ROAD, -2, P, 3), { tone: "faint" }) })) +
        `<path data-part="dash" d="${roadLine}" stroke="#fdfdfb" stroke-width="${f2(1.6 * k)}" stroke-dasharray="${f2(8 * k)} ${f2(8 * k)}" fill="none"/>` +
        `<path class="iso-halo" d="${K.haloOf({ x: -10, y: -8, w: 120, d: 16, r: 8 }, 0, 2, P)}"/>`;
      const chain = K.pathOf(chainPts(r1 + 0.25, r2 + 0.25).map((p) => K.iso(at(p, 4.5), P)), true);
      const words = !lab ? "" : [
        ISO.word(K.iso(at([BB[0], BB[1] - r1 - 18], 6), P), `chainring ${nf} teeth`, "#555", { size: 14, dy: 14 }),
        ISO.word(K.iso(at([RA[0] + 6, RA[1] - 5], 4), P), `cog ${nr}`, "#555", { size: 14, anchor: "start", dy: 30 }),
        ISO.word(K.iso(at([(BB[0] + RA[0]) / 2 + 4, BB[1] - r1], 4), P), "chain", "#555", { size: 14, dy: 22 }),
      ].join("");
      g.innerHTML = `<g>${road}</g><g data-part="pedalFar"></g><g data-name="crank">${onFace(P, at(BB, -9), crankArt)}</g>` +
        named("wheel", wheelSvg(P, RA) + wheelSvg(P, FA)) + named("frame", frameSvg(P)) +
        named("cog", onFace(P, at(RA, 4), sprocketArt(nr, 0))) + named("chainring", onFace(P, at(BB, 5), sprocketArt(nf, 5))) +
        named("chain", `<path d="${chain}" fill="none" stroke="#1f2226" stroke-width="${f2(1.25 * k)}" stroke-linejoin="round"/><path data-part="links" d="${chain}" fill="none" stroke="#9aa0a7" stroke-width="${f2(0.6 * k)}" stroke-dasharray="${f2(0.5 * k)} ${f2(0.77 * k)}"/>`) +
        `<g data-name="crank">${onFace(P, at(BB, 9), crankArt)}</g><g data-part="pedalNear"></g><g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const spin = (sel) => [...g.querySelectorAll(`[data-name="${sel}"] [data-spin]`)];
      const wheels = spin("wheel"), cog = spin("cog"), ring = spin("chainring"), cranks = spin("crank");
      const linkK = el.links.getTotalLength ? el.links.getTotalLength() / G.pathLength(chainPts(r1 + 0.25, r2 + 0.25).map(([x, z]) => [x, 0, z])) : k;
      const dashK = el.dash.getTotalLength ? el.dash.getTotalLength() / (ROAD.w - 6) : k;
      // cached pedal nodes, one per 5° of crank
      const memo = new Map();
      const pedalNode = (q, sy) => {
        const key = `${q}:${sy}`;
        if (!memo.has(key)) { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = pedalSvg(P, (q * Math.PI) / 36 + (sy < 0 ? Math.PI : 0), sy); memo.set(key, e); }
        return memo.get(key);
      };
      const swap = (e, key, node) => { if (e._key !== key) { e._key = key; e.replaceChildren(node); } };
      const s = { on: o.pedal === "1", w: o.pedal === "1" ? 1 : 0, a: -0.6 };          // a: crank angle in x–z (radians)
      let lit = o.lit || "";
      const draw = () => {
        // forward is −x, so pedalling turns the cranks anticlockwise as you see them (a grows); SVG's y is down
        const deg = (-s.a * 180) / Math.PI, chainS = s.a * (r1 + 0.25), wheelDeg = deg * ratio;
        cranks.forEach((e, i) => w.attr(e, "transform", `rotate(${f2(deg + (i === 0 ? 180 : 0))})`));
        ring.forEach((e) => w.attr(e, "transform", `rotate(${f2(deg)})`));
        cog.forEach((e) => w.attr(e, "transform", `rotate(${f2(wheelDeg)})`));
        wheels.forEach((e) => w.attr(e, "transform", `rotate(${f2(wheelDeg)})`));
        w.attr(el.links, "stroke-dashoffset", f2(chainS * linkK));
        // the road moves back (+x) by the distance rolled: wheel turns × circumference (drawn: 2πR)
        w.attr(el.dash, "stroke-dashoffset", f2(-(s.a * ratio * R) * dashK % (16 * dashK)));
        const q = ((Math.round((s.a * 36) / Math.PI) % 72) + 72) % 72;
        swap(el.pedalNear, q, pedalNode(q, 1)); swap(el.pedalFar, q, pedalNode(q, -1));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.pedal !== undefined) s.on = !!+p.pedal; if (p.lit !== undefined) lit = p.lit; };
      // shown at 0.5 pedal turns a second (a slow 30 rpm) so the chain can be followed; the readout gives 80 rpm
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.w = ISO.follow(s.w, target, dt, 0.7, ISO.still());
        if (s.w < 0.002 && !s.on) s.w = 0;
        if (!ISO.still()) s.a += s.w * 0.5 * 2 * Math.PI * dt;
        draw();
        return s.w !== target || s.w > 0;
      };
      g.readout = () => {
        const per = ratio * CIRC / 100, cad = 80 * s.w, v = (cad * per) / 60;
        return `gear ${nf}/${nr} = ${ratio.toFixed(2)} wheel turns per pedal turn · ${per.toFixed(1)} m per pedal turn (700c wheel, 2.11 m round) · at ${cad.toFixed(0)} rpm: ${(v * 3.6).toFixed(1)} km/h`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
