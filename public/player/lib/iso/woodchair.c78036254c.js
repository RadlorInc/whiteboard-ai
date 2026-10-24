// "woodchair cx cy k wobble=0..1 fix=0..1 over=0|1 lab=0 lit=seat|back|legs|joint" — a PART (PARTS.md): a wooden kitchen chair
// standing on the floor; its origin is the floor point under its middle. A 2.5 cm seat glued up from three boards, top at
// 45 cm; four 3.6 cm legs on felt pads, the back legs running on up as the back posts (92 cm) with a crest rail, a lower
// rail and three slats between them; seat rails tenoned into the legs (pegged), side and front stretchers, and a
// triangular corner block glued and screwed under each corner of the seat. At the front-left corner the block's screw
// head faces down (anchor `joint`: a screwdriver from below goes there). wobble opens that leg's joint (up to 0.6 cm,
// its screw backed out); set({ fix }) drives the screw home and closes it. over=1 (set({ over }), a jump): turned upside
// down, seat top on the surface at z = 0, legs up, so the front-left block and its screw head face up at the camera
// (joint = the head's top, for a screwdriver aim=down); the back then hangs 47 cm below the seat, so the surface must
// end at the seat's back edge (y = 18 in this pose): put it on a bench or table with the back over the front edge.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const SZ = 45, ST = 2.5, LG = 3.6, XO = 20, XI = XO - LG, YF0 = 15, YF1 = YF0 + LG, YB1 = -18, YB0 = YB1 - LG, TOP = 92;
  const RZ0 = 36, RZ1 = SZ - ST, RT = 2, BZ0 = RZ1 - 4, GAPMAX = 0.6;
  const SEAT = { x: -21, y: YB1, w: 42, d: 20.5 - YB1, r: 1.5 };
  const BEECH = ISO.tint("#f4dfbf", ["#c29464", "#cfa576", "#dbb689", "#e6c8a0"], "#6a4520");
  const wood = (svg) => ISO.tinted(BEECH, svg);
  // over=1: the chair turned upside down about the x axis (front to the back), seat top on the floor:
  // (x, y, z) → (x, −y, 45 − z). Every world point and box goes through C.T, so both poses are the same build.
  const ctx = (P, ov) => {
    const T = ov ? ([x, y, z]) => [x, -y, SZ - z] : (p) => p;
    const iso = (p) => K.iso(T(p), P);
    return {
      P, ov, T, iso,
      path: (pts, closed) => K.pathOf(pts.map(iso), closed),
      box: (xs, ys, zs) => wood(ov ? ISO.wbox(P, xs, [-ys[1], -ys[0]], [SZ - zs[1], SZ - zs[0]], "mid") : ISO.wbox(P, xs, ys, zs, "mid")),
      poly: (V, F) => wood(ISO.poly(V.map(T), F, P, "mid")),
      fy: (y0, y1) => (ov ? y0 - 0.01 : y1 + 0.01),   // the y face of a part that shows in this pose
    };
  };
  // the front-left corner block's screw: its head's middle, `open` = how far the joint stands open (cm)
  const blockOf = () => { const cx = -XO + RT + 0.5, cy = YF0 + 0.6; return { tri: [[cx, cy], [cx + 7, cy], [cx, cy - 7]], mid: [cx + 7 / 3, cy - 7 / 3] }; };
  const screwHead = (open) => { const { mid } = blockOf(); return [mid[0], mid[1], BZ0 - 0.35 - open * 2.2]; };   // the head's outer face, where a driver's tip goes

  // a leg or post: felt pad, the square leg, pegs where a rail or stretcher is tenoned in (on faces that show)
  function legSvg(C, x0, x1, y0, y1, z1, pegs, kp, dx = 0, dy = 0) {
    const m = [(x0 + x1) / 2 + dx, (y0 + y1) / 2 + dy], P = C.P;
    let s = C.ov ? "" : `<path d="${K.ring(m[0], m[1], 2.2, 0, P, 16)}" fill="#3a2a14" fill-opacity=".26"/>`;
    const pad = C.ov ? K.cylinder(m[0], -m[1], 1.5, SZ - 0.4, 0.4, P, 16) : K.cylinder(m[0], m[1], 1.5, 0, 0.4, P, 16);
    const leg = C.box([x0 + dx, x1 + dx], [y0 + dy, y1 + dy], [0.4, z1]), felt = ISO.tinted(ISO.T.rubber, K.solidSvg(pad, { tone: "lo" }));
    s += C.ov ? leg + felt : felt + leg;
    if (pegs.length) s += `<g style="--anatomy-dot:#6a4520">${D(pegs.map((p) => C.iso([p[0] + dx, p[1] + dy, p[2]])), { size: Math.max(0.35, 0.32 * kp), tone: "mid" })}</g>`;
    return s;
  }
  // a back post's top: eased to a low pyramid
  const capSvg = (C, x0, x1, y0, y1) => C.poly([[x0, y0, TOP], [x1, y0, TOP], [x1, y1, TOP], [x0, y1, TOP], [x0 + 0.9, y0 + 0.9, TOP + 0.8], [x1 - 0.9, y0 + 0.9, TOP + 0.8], [x1 - 0.9, y1 - 0.9, TOP + 0.8], [x0 + 0.9, y1 - 0.9, TOP + 0.8]], ISO.BOX_F);
  const blockSvg = (C, tri) => C.poly([...tri.map(([x, y]) => [x, y, BZ0]), ...tri.map(([x, y]) => [x, y, RZ1])], [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]]);
  // the loose joint: the front-left block and its screw (pan head, Phillips cross), backed out by `open`
  function jointSvg(C, open, kp) {
    const { tri } = blockOf(), h = C.T(screwHead(open)), F = window.G.frameAlong(h, C.ov ? [0, 0, -1] : [0, 0, 1]), P = C.P;
    let s = blockSvg(C, tri);
    if (open > 0.01) s += ISO.tinted(ISO.T.steel, K.solidSvg(window.G.disc(0.35, 0.35 + open * 2.2, 0.22, F, P, { steps: 10 }), { tone: "hi" }));
    s += ISO.tinted(ISO.T.steel, K.solidSvg(window.G.disc(0, 0.35, 0.5, F, P, { steps: 16 }), { tone: "hi" }));
    // the cross recess, on the face that shows (upside down the head faces up at the camera)
    if (C.ov) { const c = (dx, dy) => K.iso([h[0] + dx, h[1] + dy, h[2] + 0.005], P); s += `<path d="${K.pathOf([c(-0.3, 0), c(0.3, 0)])}${K.pathOf([c(0, -0.3), c(0, 0.3)])}" stroke="#3c3f45" stroke-width="${Math.max(0.4, 0.09 * kp).toFixed(2)}"/>`; }
    return s;
  }
  function staticSvg(C, kp) {
    const out = {}, P = C.P, box = C.box, path = C.path;
    const halo = C.ov ? { x: SEAT.x - 1, y: -SEAT.y - SEAT.d - 1, w: SEAT.w + 2, d: SEAT.d + 2, r: 2 } : { x: -XO - 1, y: YB0 - 1, w: 2 * XO + 2, d: YF1 - YB0 + 2, r: 2 };
    out.halo = `<path class="iso-halo" d="${K.haloOf(halo, -1, 1, P)}"/>`;
    const pegFaces = (x0, x1, y0, y1, sx, sy, zs) => { const p = []; for (const z of zs) { if (sx > 0) p.push([x1 + 0.01, (y0 + y1) / 2, z]); if (sy) p.push([(x0 + x1) / 2, C.fy(y0, y1), z]); } return p; };
    out.bl = legSvg(C, -XO, -XI, YB0, YB1, TOP, C.ov ? pegFaces(-XO, -XI, YB0, YB1, 0, 1, [RZ0 + 1.6, RZ0 + 4.8]) : [], kp) + capSvg(C, -XO, -XI, YB0, YB1);
    out.br = legSvg(C, XI, XO, YB0, YB1, TOP, pegFaces(XI, XO, YB0, YB1, 1, C.ov ? 1 : 0, [RZ0 + 3.2, 15.2]), kp) + capSvg(C, XI, XO, YB0, YB1);
    const yr = (YB0 + YB1) / 2;
    out.backrail = box([-XI, XI], [yr - RT / 2, yr + RT / 2], [RZ0, RZ1]) + (C.ov ? wood(L(path([[-XI, yr - RT / 2 - 0.01, RZ0 + 1], [XI, yr - RT / 2 - 0.01, RZ0 + 1]]), { tone: "faint" })) : "");
    // the back: lower rail, three slats, the crest rail (thicker, its top edge eased with a crease line)
    const slats = [-9, 0, 9].map((x) => box([x - 2, x + 2], [yr - 0.6, yr + 0.6], [59, 82])).join("");
    out.back = box([-XI, XI], [yr - 1, yr + 1], [55.5, 59]) + slats + box([-XI, XI], [yr - 1.1, yr + 1.1], [82, 90]) +
      wood(L(path([[-XI, C.fy(yr - 1.1, yr + 1.1), 88.6], [XI, C.fy(yr - 1.1, yr + 1.1), 88.6]]), { tone: "faint" }));
    // stretchers (2 × 2.4) and side rails
    const sx = (s) => s * (XO - LG / 2);
    out.lstretch = box([sx(-1) - 1, sx(-1) + 1], [YB1, YF0], [14, 16.4]);
    out.lrail = box([-XO + 0.5, -XO + 0.5 + RT], [YB1, YF0], [RZ0, RZ1]);
    out.blocks = blockSvg(C, [[-XO + RT + 0.5, YB1], [-XO + RT + 7.5, YB1], [-XO + RT + 0.5, YB1 + 7]]) + blockSvg(C, [[XO - RT - 0.5, YB1], [XO - RT - 7.5, YB1], [XO - RT - 0.5, YB1 + 7]]) +
      blockSvg(C, [[XO - RT - 0.5, YF0 + 0.6], [XO - RT - 7.5, YF0 + 0.6], [XO - RT - 0.5, YF0 - 6.4]]);
    out.rstretch = box([sx(1) - 1, sx(1) + 1], [YB1, YF0], [14, 16.4]);
    out.rrail = box([XO - 0.5 - RT, XO - 0.5], [YB1, YF0], [RZ0, RZ1]) + wood(L(path([[XO - 0.49, YB1, RZ0 + 1], [XO - 0.49, YF0, RZ0 + 1]]), { tone: "faint" }));
    const yf = (YF0 + YF1) / 2;
    out.fstretch = box([-XI, XI], [yf - 1, yf + 1], [20, 22.4]);
    out.frail = box([-XI, XI], [YF1 - 0.5 - RT, YF1 - 0.5], [RZ0, RZ1]) + (C.ov ? "" : wood(L(path([[-XI, YF1 - 0.49, RZ0 + 1], [XI, YF1 - 0.49, RZ0 + 1]]), { tone: "faint" })));
    out.fr = legSvg(C, XI, XO, YF0, YF1, RZ1, pegFaces(XI, XO, YF0, YF1, 1, 1, [RZ0 + 1.6, RZ0 + 4.8]).concat([[XO + 0.01, (YF0 + YF1) / 2, 15.2], [(XI + XO) / 2, C.fy(YF0, YF1), 21.2]]), kp);
    // the seat: three glued boards, the glue lines running back to front and down the edge that shows, grain between
    // (upside down the camera sees the seat's underside and back edge: glue lines only, the grain is on the floor side)
    const sz = RZ1, E = 0.5, seams = [], grain = [];
    const seatSlab = C.ov ? K.slabOf({ ...SEAT, y: -SEAT.y - SEAT.d }, 0, ST, P, 3, E) : K.slabOf(SEAT, sz, ST, P, 3, E);
    const zf = C.ov ? sz : SZ, ye = C.ov ? SEAT.y - 0.01 : SEAT.y + SEAT.d + 0.01;
    for (const f of [1 / 3, 2 / 3]) { const x = SEAT.x + SEAT.w * f; seams.push(path([[x, SEAT.y + E * 0.5, zf], [x, SEAT.y + SEAT.d - E * 0.5, zf]]), path([[x, ye, sz], [x, ye, SZ]])); }
    if (!C.ov) for (let i = 0; i < 3; i++) for (const f of [0.28, 0.7]) {
      const pts = []; for (let j = 0; j <= 10; j++) { const y = SEAT.y + E + (SEAT.d - 2 * E) * (j / 10); pts.push([SEAT.x + SEAT.w * (i + f) / 3 + 0.5 * Math.sin(y * 0.15 + i), y, SZ]); }
      grain.push(path(pts));
    }
    out.seat = wood(K.solidSvg(seatSlab, { tone: "mid" })) + (grain.length ? `<path d="${grain.join("")}" fill="none" stroke="#a5804e" stroke-width="0.4" stroke-opacity=".4"/>` : "") + wood(L(seams.join(""), { tone: "lo" }));
    out.flPegs = pegFaces(-XO, -XI, YF0, YF1, 0, 1, [RZ0 + 1.6, RZ0 + 4.8]).concat([[(-XO - XI) / 2, C.fy(YF0, YF1), 21.2]]);
    return out;
  }

  ISO.add({
    name: "woodchair", title: "Wooden chair (part)", compare: null,
    about: "A wooden kitchen chair, seat 45 cm high, its seat held by a screwed corner block at each corner; wobble opens the front-left leg's joint, over=1 turns it upside down (seat on the floor, the corner block facing up) and fix drives its corner-block screw home to close it; a part to place in any scene. anchors: joint seat",
    line: "woodchair cx cy k wobble=0..1 fix=0..1 over=0|1 lab=0 lit=seat|back|legs|joint",
    demo: { line: "woodchair 480 372 3.2 wobble=1 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { over: 1, lit: "joint" }, hold: 1.2 }, { set: { fix: 1 }, hold: "settle" }, { set: { over: 0, lit: "seat" }, hold: 1.2 }] },
    make([cx = 480, cy = 372, k = 3.2], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", kp = K.cameraOf(P).k;
      const n = (name, svg) => `<g data-name="${name}">${svg}</g>`;
      g.innerHTML = `<g data-part="body"></g><g data-part="words"></g>`;
      const body = g.querySelector('[data-part="body"]'), wr = ISO.writer(), el = { words: g.querySelector('[data-part="words"]') };
      let parts = [], C, s;
      const st = { wobble: ISO.clamp(ISO.num(o, "wobble", 0), 0, 1), fix: ISO.clamp(ISO.num(o, "fix", 0), 0, 1) }, goal = { ...st };
      let lit = o.lit || "", over = o.over === "1";
      const openOf = () => GAPMAX * st.wobble * (1 - st.fix);
      // painter's order per pose: standing, the back is far and the front-left leg near; upside down it is the reverse
      const bodySvg = () => {
        C = ctx(P, over); s = staticSvg(C, kp);
        const J = `<g data-name="joint" data-part="joint"></g>`, FL = `<g data-name="legs" data-part="fl"></g>`;
        return over
          ? s.halo + n("back", s.back) + n("seat", s.seat) + FL + n("legs", s.frail + s.fstretch + s.lrail + s.lstretch) + n("seat", s.blocks) + J +
            n("legs", s.fr + s.rrail + s.rstretch + s.bl + s.backrail + s.br)
          : s.halo + n("legs", s.bl + s.backrail) + n("back", s.back) + n("legs", s.br + s.lstretch + s.lrail) + n("seat", s.blocks) + J +
            n("legs", s.rstretch + s.rrail) + FL + n("legs", s.fstretch + s.frail + s.fr) + n("seat", s.seat);
      };
      const draw = () => {
        wr.rebuild(body, String(over), bodySvg);
        if (body._fresh) { body._fresh = false; el.joint = body.querySelector('[data-part="joint"]'); el.fl = body.querySelector('[data-part="fl"]'); parts = [...body.querySelectorAll("[data-name]")]; }
        const open = openOf(), key = open.toFixed(3), d = open / Math.SQRT2;
        wr.rebuild(el.joint, key, () => jointSvg(C, open, kp));
        wr.rebuild(el.fl, key, () => legSvg(C, -XO, -XI, YF0, YF1, RZ1, s.flPegs, kp, -d, d));
        g.anchors = { joint: C.T(screwHead(open)), seat: C.T([0, SEAT.y + SEAT.d / 2, SZ]) };
        wr.rebuild(el.words, lab ? `${open > 0.05} ${over}` : "", () => !lab ? "" :
          ISO.word(C.iso(over ? [XO, YF0, 0] : [XO, YB0, TOP]), over ? "chair, upside down" : "chair", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') +
          ISO.word(C.iso(over ? [-XO, YF0, RZ0] : [-XO, YF1, RZ0]), open > 0.05 ? "loose joint" : "joint tight", open > 0.05 ? "#8f2a22" : "#2c6a22", { size: 13, anchor: "end", dy: 0 }).replace('x="', 'dx="-8" x="'));
        wr.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.wobble !== undefined) goal.wobble = ISO.clamp(+p.wobble, 0, 1);
        if (p.fix !== undefined) goal.fix = ISO.clamp(+p.fix, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
        if (p.over !== undefined) over = String(p.over) === "1";   // turning it over is a jump
        draw();
      };
      // a screwdriver turns the screw home in about two seconds; the joint closes with it
      g.update = (dt) => {
        let moving = false;
        for (const key of ["wobble", "fix"]) { st[key] = ISO.follow(st[key], goal[key], dt, 0.45, ISO.still()); if (Math.abs(st[key] - goal[key]) < 0.003) st[key] = goal[key]; else moving = true; }
        draw();
        return moving;
      };
      g.readout = () => { const open = openOf(); return open > 0.02 ? `front-left joint open ${open.toFixed(1)} cm · the chair rocks · tighten the corner-block screw from below` : "kitchen chair · seat 45 cm high · each corner block screwed tight"; };
      draw();
      return g;
    },
  });
})();
