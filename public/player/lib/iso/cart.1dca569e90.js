// "cart cx cy width push=cm lab=1 lit=basket|castor|handle|groceries|tray" — a supermarket trolley with groceries.
// A wire basket (it tapers so trolleys nest), a top rim, a handle with a grip, the fold-down child seat, a lower tray
// on a tube chassis and four castors: the two at the front swivel, the two at the back are fixed. set({ push }) rolls
// it to that position (cm, forward is to the left). A swivel castor's wheel sits 4 cm behind its pivot, so it always
// swings round to trail the way the trolley moves (dψ/ds = −sin(ψ − trail)/4 cm): pull it back and the front castors
// flip round in the first few centimetres, then roll straight.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm; forward is −x, the handle end at +x; the side you see is +y.
  const BOT = { x0: 8, x1: 76, y: 21, z: 46 }, TOP = { x0: -2, x1: 84, y: 26, z: 94 }, RAIL = 13, CR = 6, TRAIL = 4, PIV = [[8, -19], [8, 19]], FIX = [[78, -19], [78, 19]];
  const WIRE = "#7d838b", INK = "#3c3f45", TUBE = "#c9ccd1";
  const f2 = (v) => v.toFixed(2);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const pipe = (P, pts, r, ink = INK, fill = TUBE, hi = "#f2f3f5") => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 2 * r * G.scaleOf(P);
    return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${f2(w + 1)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${f2(w)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${hi}" stroke-width="${f2(w * 0.3)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-0.2 -0.4)"/>`;
  };
  // A wire panel between four corners (a→b along the bottom, d→c along the top): nu wires one way, nv the other.
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const panel = (P, [a, b, c, d], nu, nv) => {
    const k = G.scaleOf(P), segs = [];
    for (let i = 1; i < nu; i++) segs.push([lerp(a, b, i / nu), lerp(d, c, i / nu)]);
    for (let j = 1; j < nv; j++) segs.push([lerp(a, d, j / nv), lerp(b, c, j / nv)]);
    const path = segs.map(([p, q]) => K.pathOf([K.iso(p, P), K.iso(q, P)])).join("");
    return `<path d="${path}" stroke="${INK}" stroke-width="${f2(0.75 * k)}" fill="none"/><path d="${path}" stroke="#d6d9dd" stroke-width="${f2(0.4 * k)}" fill="none"/>`;
  };
  const corner = (u, y, z) => [u, y, z];
  // basket corners: bottom (b) and top rim (t), far (−y) and near (+y), front (−x) and back (+x)
  const B = { ff: [BOT.x0, -BOT.y, BOT.z], bf: [BOT.x1, -BOT.y, BOT.z], bn: [BOT.x1, BOT.y, BOT.z], fn: [BOT.x0, BOT.y, BOT.z] };
  const T = { ff: [TOP.x0, -TOP.y, TOP.z], bf: [TOP.x1, -TOP.y, TOP.z], bn: [TOP.x1, TOP.y, TOP.z], fn: [TOP.x0, TOP.y, TOP.z] };

  function chassisSvg(P, side) {
    const y = side * 19, out = [];
    // side rail from the front castor to the back castor, and the legs up to the basket's bottom corners
    out.push(pipe(P, [[2, y, RAIL + 3], [86, y, RAIL + 3]], 1.2));
    out.push(pipe(P, [[12, y, RAIL + 3], [BOT.x0 + 4, side * BOT.y, BOT.z - 1]], 1.1), pipe(P, [[84, y, RAIL + 3], [BOT.x1 + 2, side * BOT.y, BOT.z - 1], [TOP.x1 + 1, side * (TOP.y - 1), TOP.z - 2]], 1.1));
    return out.join("");
  }
  // the lower tray: a wire deck between the rails, carrying six bottles of water
  function traySvg(P) {
    const a = [16, -18, RAIL + 7], b = [74, -18, RAIL + 7], c = [74, 18, RAIL + 7], d = [16, 18, RAIL + 7];
    const out = [pipe(P, [[16, -18, RAIL + 7], [74, -18, RAIL + 7], [74, 18, RAIL + 7], [16, 18, RAIL + 7], [16, -18, RAIL + 7]], 0.6), panel(P, [a, b, c, d], 10, 6)];
    for (const x of [16, 74]) for (const y of [-18, 18]) out.push(pipe(P, [[x, y, RAIL + 7], [x, y, RAIL + 3]], 0.5));
    const pack = ISO.T.blue;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) out.push(ISO.tinted(pack, S(G.solidOf([[0, 3.6], [16, 3.6, 1], [18.5, 2], [20, 1.2], [21, 1.2]], G.frameOf([30 + i * 7.6, -4 + j * 7.6, RAIL + 7.4], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" })));
    return out.join("");
  }
  // a castor at pivot pv: top plate, swivel bearing, fork and wheel. psi = direction from the pivot to the wheel (x–y),
  // roll = the wheel's turn. A fixed castor has psi = 0 (wheel behind) and no bearing.
  function castorSvg(P, pv, psi, roll, swivel) {
    const tr = swivel ? TRAIL : 0, c = [pv[0] + Math.cos(psi) * tr, pv[1] + Math.sin(psi) * tr, CR], ax = [-Math.sin(psi), Math.cos(psi), 0];
    const out = [ISO.tinted(ISO.T.steel, ISO.wbox(P, [pv[0] - 4, pv[0] + 4], [pv[1] - 4, pv[1] + 4], [RAIL + 1.6, RAIL + 2.4], "mid"))];
    if (swivel) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(pv[0], pv[1], 3, RAIL - 0.6, 2.2, P, 20), { tone: "mid" })));
    const F = G.frameAlong(c, ax), toward = K.towardViewer(P), near = ax[0] * toward[0] + ax[1] * toward[1] > 0 ? 1 : -1;
    const plate = (side) => {
      // a fork leg: from the swivel's rim down to the axle, in the wheel's plane offset by ±2.4 along the axle
      const dirv = [Math.cos(psi), Math.sin(psi)], m = (l) => side * 2.4 + l;
      const at = (s, l, z) => [pv[0] + dirv[0] * s + ax[0] * m(l), pv[1] + dirv[1] * s + ax[1] * m(l), z];
      return ISO.tinted(ISO.T.steel, ISO.box((s, l, z) => at(s, l, z), P, [-1.6, tr + 1.6], [-0.4, 0.4], [CR - 1, RAIL - 0.6], "mid"));
    };
    out.push(plate(-near));
    out.push(ISO.tinted(ISO.T.rubber, S(G.ringBand(-1.6, 1.6, 2.4, CR, F, P), { tone: "mid" })), ISO.tinted(ISO.T.red, S(G.ringBand(-1.7, 1.7, 0.7, 2.4, F, P), { tone: "hi" })));
    // two hub marks on the wheel's face you see: they turn as it rolls
    const m = [0, Math.PI].map((da) => K.iso(G.pointOf(F, near * 1.72, 1.6, roll + da), P));
    out.push(D(m, { size: 0.9, tone: "hi" }));
    out.push(plate(near), ISO.tinted(ISO.T.steel, S(G.disc(-2.9, 2.9, 0.7, F, P), { tone: "hi" })));
    return out.join("");
  }
  function basketBack(P) {
    const out = [panel(P, [B.ff, B.fn, T.fn, T.ff], 10, 6), panel(P, [B.ff, B.bf, T.bf, T.ff], 16, 8), panel(P, [B.ff, B.bf, B.bn, B.fn], 14, 8)];
    out.push(pipe(P, [B.ff, B.bf, B.bn, B.fn, B.ff], 0.7), pipe(P, [B.ff, T.ff], 0.7), pipe(P, [B.bf, T.bf], 0.7));
    return out.join("");
  }
  function basketFront(P) {
    const out = [panel(P, [B.fn, B.bn, T.bn, T.fn], 16, 8), panel(P, [B.bf, B.bn, T.bn, T.bf], 9, 6)];
    out.push(pipe(P, [B.fn, T.fn], 0.7), pipe(P, [B.bn, T.bn], 0.7), pipe(P, [T.ff, T.bf, T.bn, T.fn, T.ff], 1.1));
    // the fold-down child seat flap on the back gate, in red plastic
    out.push(ISO.tinted(ISO.T.red, ISO.poly([[TOP.x1 - 1, -14, TOP.z - 2], [TOP.x1 + 1, -14, TOP.z - 2], [TOP.x1 + 1, 14, TOP.z - 2], [TOP.x1 - 1, 14, TOP.z - 2], [TOP.x1 - 4, -14, TOP.z - 22], [TOP.x1 - 2, -14, TOP.z - 22], [TOP.x1 - 2, 14, TOP.z - 22], [TOP.x1 - 4, 14, TOP.z - 22]], ISO.BOX_F, P, "mid")));
    return out.join("");
  }
  function handleSvg(P) {
    const out = [];
    for (const y of [-24, 24]) out.push(pipe(P, [[TOP.x1, y, TOP.z], [TOP.x1 + 9, y, TOP.z + 6]], 1));
    const F = G.frameOf([TOP.x1 + 9, 0, TOP.z + 6], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-25, -18, 1.2, F, P), { tone: "hi" }) + S(G.disc(18, 25, 1.2, F, P), { tone: "hi" })), ISO.tinted(ISO.T.red, S(G.solidOf([[-18, 1.6], [-17, 2.1, 1], [17, 2.1, 1], [18, 1.6]], F, P), { tone: "hi" })));
    return out.join("");
  }
  // the shopping, standing on the basket's wire bottom (and the water on the tray's wire deck): the wires are strokes the
  // audit can't see, so it lists these as loose; each one stands on a wire deck.
  function groceriesSvg(P) {
    const z = BOT.z, out = [];
    out.push(ISO.tinted(ISO.T.amber, ISO.wbox(P, [52, 58], [-16, 2], [z, z + 28], "hi")));                                  // cereal box
    out.push(ISO.tinted(ISO.T.wood, S(K.slabOf({ x: 20, y: -16, w: 26, d: 11, r: 4 }, z, 9, P, 6, 1.5), { tone: "hi" })));  // a loaf
    const milk = (x, y) => ISO.poly([[x, y, z], [x + 7, y, z], [x + 7, y + 7, z], [x, y + 7, z], [x, y, z + 18], [x + 7, y, z + 18], [x + 7, y + 7, z + 18], [x, y + 7, z + 18], [x + 3.5, y, z + 22], [x + 3.5, y + 7, z + 22]],
      [[0, 1, 2, 3], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 8], [7, 6, 9], [4, 8, 9, 7], [5, 8, 9, 6]], P, "mid");
    out.push(milk(62, -12), milk(62, -2));
    out.push(ISO.tinted(ISO.T.green, S(G.solidOf([[0, 3.8], [20, 3.8, 1], [24, 2.2], [27, 1.4], [30, 1.4]], G.frameOf([40, 8, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" })));
    for (const [x, y] of [[30, 4], [24, 12]]) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 3.6, z, 10, P, 24, 0.5), { tone: "mid" })));     // tins
    for (const [x, y, zz] of [[50, 12, 3.6], [57, 13, 3.6], [53, 6, 3.6], [54, 10, 9.6]]) out.push(ISO.tinted(ISO.T.red, S(G.sphereOf([x, y, z + zz], 3.6, P), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "cart", title: "Shopping trolley", compare: "cart 480 270 440",
    about: "A supermarket trolley full of shopping: a tapered wire basket on a tube chassis with a lower tray, fixed back castors and swivel front castors that swing round to trail whichever way you push.",
    line: "cart cx cy width push=cm lab=1 lit=basket|castor|handle|groceries|tray",
    demo: { line: "cart 480 270 440", script: [{ set: { push: -50, lit: "castor" }, hold: "settle" }, { set: { push: 0 }, hold: "settle" }, { set: { push: -40, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.95, H = size * 1.15;
      const FLOOR = { x: -64, y: -36, w: 180, d: 72, r: 3 };
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -4, 0), [TOP.x1 + 10, -26, TOP.z + 8], [TOP.x0, 26, TOP.z]], cx, cy, W, H, { azimuth: 64, elevation: 22, pad: 6 }, parent);
      // floor tiles: a slab with tile joints running edge to edge (they end on the slab's outline)
      const joints = [];
      for (let x = FLOOR.x + 30; x < FLOOR.x + FLOOR.w; x += 30) joints.push(K.lineOnTop([x, FLOOR.y], [x, FLOOR.y + FLOOR.d], 0, P));
      for (let y = FLOOR.y + 40; y < FLOOR.y + FLOOR.d; y += 40) joints.push(K.lineOnTop([FLOOR.x, y], [FLOOR.x + FLOOR.w, y], 0, P));
      const floor = ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -4, 4, P, 3, 0.5), { tone: "lo", inner: L(K.sideSeam(FLOOR, -2, P, 3), { tone: "faint" }) }) + L(joints.join(""), { tone: "faint" }));
      g.innerHTML = `<g>${floor}</g><g data-part="cart"><path class="iso-halo" d="${K.haloOf({ x: 0, y: -24, w: 90, d: 48, r: 10 }, 0, 2, P)}"/>` +
        `<g data-name="castor"><g data-part="c0"></g><g data-part="c2"></g></g>` + named("basket", chassisSvg(P, -1)) + named("tray", traySvg(P)) +
        `<g data-name="castor"><g data-part="c1"></g><g data-part="c3"></g></g>` + named("basket", chassisSvg(P, 1) + basketBack(P)) +
        named("groceries", groceriesSvg(P)) + named("basket", basketFront(P)) + named("handle", handleSvg(P)) + `<g data-part="words"></g></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      if (lab) {
        const word = (p, txt, anchor = "middle", dy = 0) => ISO.word(K.iso(p, P), txt, "#555", { size: 14, anchor, dy });
        el.words.innerHTML = word([TOP.x1 + 9, 26, TOP.z + 6], "handle", "start", -6) + word([PIV[1][0] + 2, 22, 0], "swivel castor", "middle", 22) + word([FIX[1][0], 22, 0], "fixed castor", "middle", 22) + word([45, 18, RAIL + 7], "tray", "start", 16);
      }
      const s = { x: ISO.num(o, "push", 0), want: 0, psi: [0, 0], roll: 0, trail: 0 };
      s.want = s.x = ISO.clamp(s.x, -60, 30);
      let lit = o.lit || "";
      const memo = new Map();
      const swap = (e, key, svg) => {
        if (e._key === key) return;
        if (!memo.has(key)) { const n = document.createElementNS("http://www.w3.org/2000/svg", "g"); n.innerHTML = svg(); memo.set(key, n); }
        e._key = key; e.replaceChildren(memo.get(key)); e.parentNode._fresh = true;
      };
      const draw = () => {
        w.attr(el.cart, "transform", K.translateAlong(P, [s.x, 0, 0]));
        // cached castor nodes: the hub marks repeat every half turn (6 steps), the swivel in 0.05 rad steps
        const rq = ((Math.round((s.roll * 6) / Math.PI) % 6) + 6) % 6, r = (rq * Math.PI) / 6;
        PIV.forEach((pv, i) => { const pq = Math.round(Math.atan2(Math.sin(s.psi[i]), Math.cos(s.psi[i])) / 0.05); swap(el[`c${i}`], `${i}:${pq}:${rq}`, () => castorSvg(P, pv, pq * 0.05, r, true)); });
        FIX.forEach((pv, i) => swap(el[`c${i + 2}`], `${i + 2}:${rq}`, () => castorSvg(P, pv, 0, r, false)));
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.push !== undefined) s.want = ISO.clamp(+p.push, -60, 30); if (p.lit !== undefined) lit = p.lit; };
      // pushed at a walk (up to 40 cm/s, easing at the ends); the castors follow the trailing law as it goes
      g.update = (dt) => {
        const gap = s.want - s.x, calm = ISO.still();
        const ds = calm || Math.abs(gap) < 0.05 ? gap : Math.sign(gap) * Math.min(Math.abs(gap), Math.max(4, Math.min(40, Math.abs(gap) * 2)) * dt);
        s.x += ds;
        if (ds) {
          const trail = (s.trail = ds < 0 ? 0 : Math.PI);                                             // moving −x the wheel trails at +x (ψ = 0)
          for (let i = 0; i < 2; i++) {
            let d = s.psi[i] - trail; d = Math.atan2(Math.sin(d), Math.cos(d));
            if (Math.abs(Math.abs(d) - Math.PI) < 0.02) d += i ? -0.04 : 0.04;              // balanced on the pivot: the slightest nudge tips it
            s.psi[i] = calm ? trail : trail + d - Math.sin(d) * Math.min(1, Math.abs(ds) / TRAIL);
          }
          s.roll += -ds / CR;
        }
        draw();
        return s.x !== s.want;
      };
      g.readout = () => {
        const dir = s.psi.map((p) => (Math.abs(Math.atan2(Math.sin(p - s.trail), Math.cos(p - s.trail))) < 0.3 ? "trailing" : "swinging round"));
        return `trolley at ${s.x.toFixed(0)} cm · front castors ${dir[0]} (wheel 4 cm behind the swivel, so it lines up behind the way you push) · back castors fixed · wheels ${(2 * CR * 10).toFixed(0)} mm, ${(Math.abs(s.x) / (2 * Math.PI * CR)).toFixed(2)} turns`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
