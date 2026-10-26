// "dipstick cx cy length level=0-100 lab=1 lit=handle" — checking the engine oil with the dipstick.
// A corner of an engine: block with cooling fins, rocker cover with its yellow oil cap and bolts, and the dipstick tube
// rising at 25° from a boss, held by a bracket. The dipstick has a yellow loop handle, a cap with a rubber seal, and a
// steel blade with MIN and MAX holes and a cross-hatched band between them. set({ do }) plays one move of the check:
// "pull" (out of the tube, held up beside it, smeared with oil), "wipe" (a rag runs down the blade), "dip" (all the
// way back in and out again) and "read" (the clean film shows the true level). set({ level }) changes the oil level:
// 0 is below MIN, 100 is MAX; MIN to MAX is 1 litre on most cars, so the readout says how much to top up.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const TILT = 40 * Math.PI / 180, DIR = [Math.sin(TILT), 0, Math.cos(TILT)], NRM = [Math.cos(TILT), 0, -Math.sin(TILT)];
  const BLOCK = { x: -80, y: -30, w: 140, d: 60, r: 3 }, TOP = 30;
  const BASE = [30, 14, TOP + 4], TUBE = 40, TUBE_R = 3;     // the tube leaves its boss at BASE and ends at s = TUBE
  // The stick, measured from its tip (u = 0) along DIR: MIN and MAX holes, blade, cap, neck and loop.
  const MIN = 7, MAX = 21, BLADE = 60, CAP = [60, 66], LOOP = { u: 79, r0: 5.6, r1: 9.4 };
  const REST = -(BLADE - TUBE);                              // the cap sits on the tube's mouth at rest
  const OUT = TUBE - REST + 4;                               // how far it slides to clear the mouth
  const ASIDE = [57, 16, -36];                               // where it is held up to read, from the pulled-out spot
  const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
  const onStick = (u, w, y) => add(add(add(BASE, DIR, REST + u), NRM, w), [0, 1, 0], y);
  const OIL = ISO.tint("#e6a63c", ["#9c5f0c", "#b06f14", "#c4821f", "#d6942c"], "#6a3f06");
  const YELLOW = ISO.tint("#ffe27a", ["#c9a21c", "#d8b22a", "#e6c23a", "#f2d24f"], "#6b5208");
  const RAG = ISO.tint("#f3b7ae", ["#c4554a", "#d0675c", "#dc7a6f", "#e88f85"], "#7a2a22");
  const filmTop = (level) => MIN - 4 + (MAX - MIN + 4) * level / 100;
  let uid = 0;

  // ── the engine corner, built once
  function engineSvg(P, lab) {
    const PAN = { x: -72, y: -24, w: 124, d: 50, r: 3 };
    const out = [`<path class="iso-halo" d="${K.haloOf(PAN, -12, TOP + 12, P)}"/>`];
    // the oil pan under the block, its flange, and the drain plug on its front face
    out.push(S(K.slabOf(PAN, -12, 10, P, 3, 0.5), { tone: "lo" }), S(K.slabOf(K.insetPlan(BLOCK, 2), -2, 2, P, 3), { tone: "mid" }));
    const Fd = G.frameOf([-20, PAN.y + PAN.d, -6], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(S(G.prismOf(Fd, Array.from({ length: 6 }, (_, i) => [Math.cos(i * 1.047) * 2.6, Math.sin(i * 1.047) * 2.6]), 0, 2, P), { tone: "mid" }), D([K.iso(G.pointOf(Fd, 2, 0, 0), P)], { size: 0.6 }));
    out.push(S(K.slabOf(BLOCK, 0, TOP, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(BLOCK, 9, P, 3), { tone: "faint" }) }));
    // cooling fins on the front face, top seam to bottom edge, and a casting boss with two bolts
    const fins = [];
    for (let x = -72; x <= 16; x += 8) fins.push(K.segment([x, BLOCK.y + BLOCK.d, 9], [x, BLOCK.y + BLOCK.d, TOP], P));
    out.push(L(fins.join(""), { tone: "faint" }));
    // the crank pulley on the front face: hub, ribbed rim for the belt, centre bolt
    const Fp = G.frameOf([38, BLOCK.y + BLOCK.d, 17], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(S(G.disc(0, 1.2, 6, Fp, P), { tone: "mid" }), S(G.disc(1.2, 4.4, 11, Fp, P), { tone: "hi", inner: L(G.ribsOf(Fp, 1.6, 4, 11, 40, P, { seams: true }), { tone: "faint" }) }));
    out.push(L(G.circleOf(Fp, 4.4, 7, P), { tone: "lo" }), S(G.disc(4.4, 6, 3, Fp, P), { tone: "mid" }), D([K.iso(G.pointOf(Fp, 6, 0, 0), P)], { size: 0.7 }));
    // the rocker cover: a gasket rail, the cover with ribs on top, bolts at the corners, and the yellow oil cap
    const rail = { x: -74, y: -24, w: 82, d: 48, r: 4 }, cover = { x: -70, y: -20, w: 74, d: 40, r: 6 };
    out.push(S(K.slabOf(rail, TOP, 2, P, 4, 0.4), { tone: "lo" }));
    out.push(S(K.slabOf(cover, TOP + 2, 14, P, 6, 1), { tone: "mid", inner: L(K.sideSeam(cover, TOP + 6, P, 6), { tone: "faint" }) }));
    // three ignition coils down the middle, each with its plug connector
    const coils = [-34, -20, -6].map((x) => ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: x - 4, y: -9, w: 8, d: 18, r: 1.2 }, TOP + 16, 5, P, 2, 0.4), { tone: "hi" }) +
      S(K.slabOf({ x: x - 2.4, y: 5, w: 4.8, d: 5, r: 0.8 }, TOP + 21, 2.6, P, 2), { tone: "hi" }))).join("");
    out.push(coils);
    const bolts = [[-66, -16], [0, -16], [-66, 16], [0, 16], [-33, -16], [-33, 16]];
    out.push(L(bolts.map(([x, y]) => K.ring(x, y, 1.8, TOP + 16, P, 12)).join(""), { tone: "lo" }), D(bolts.map(([x, y]) => K.iso([x, y, TOP + 16], P)), { size: 0.55 }));
    const cap = [-50, 0];
    out.push(`<g data-name="oilcap">${ISO.tinted(YELLOW, S(K.cylinder(cap[0], cap[1], 9, TOP + 16, 2, P, 40), { tone: "hi" }) +
      S(K.cylinder(cap[0], cap[1], 7.6, TOP + 18, 5, P, 40, 0.5), { tone: "hi", inner: L(K.knurl(cap[0], cap[1], 7.6, TOP + 18, TOP + 23, 26, P, 0), { tone: "lo" }) }) +
      L(K.ring(cap[0], cap[1], 4.4, TOP + 23, P, 28), { tone: "lo" }) + S(K.slabOf({ x: cap[0] - 5, y: cap[1] - 1.2, w: 10, d: 2.4, r: 0.8 }, TOP + 23, 1.4, P, 2), { tone: "hi" }))}</g>`);
    // the dipstick tube: a boss on the block, the tube, a clamp band with a strap down to the block, and the flared mouth
    const F = G.frameAlong(BASE, DIR), Fz = G.frameOf([BASE[0], BASE[1], TOP], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(S(G.disc(0, 4, 6, Fz, P), { tone: "mid" }), L(G.circleOf(Fz, 4, 4.2, P), { tone: "faint" }));
    const tube = [S(G.disc(0, 16, TUBE_R, F, P), { tone: "hi" }), S(G.ringBand(16, 20, TUBE_R, TUBE_R + 1.2, F, P), { tone: "mid" }), S(G.disc(20, TUBE - 3, TUBE_R, F, P), { tone: "hi" })];
    tube.push(S(G.solidOf([[TUBE - 3, TUBE_R], [TUBE - 1.5, TUBE_R + 0.9, 1], [TUBE, TUBE_R + 2]], F, P), { tone: "hi" }));
    tube.push(`<path d="${G.circleOf(F, TUBE + 0.02, TUBE_R + 0.6, P)}" fill="#3a3324" stroke="none"/>`, L(G.circleOf(F, TUBE + 0.02, TUBE_R + 0.6, P), { tone: "lo" }));
    out.push(`<g data-name="tube">${tube.join("")}</g>`);
    if (lab) {
      out.push(ISO.word(K.iso([cap[0], cap[1], TOP + 25], P), "Oil cap", "#555", { dy: -12, size: 15 }));
      out.push(ISO.word(K.iso([BLOCK.x + 30, BLOCK.y + BLOCK.d, -12], P), "Engine", "#555", { dy: 24, size: 15 }));
    }
    return out.join("");
  }

  // ── the dipstick at rest, built once and moved
  function stickSvg(P, lab) {
    const at3 = (p) => K.iso(p, P), out = [];
    const blade = [ISO.box(onStick, P, [0, BLADE], [-2.6, 2.6], [-0.5, 0.5], "hi")];
    // the hatched band between the holes, edge to edge on the face, and the two holes
    const hatch = [];
    for (let u = MIN + 2; u <= MAX - 6; u += 2.2) hatch.push(K.pathOf([at3(onStick(u, -2.6, 0.51)), at3(onStick(u + 3.4, 2.6, 0.51))]));
    blade.push(L(hatch.join(""), { tone: "lo" }));
    const hole = (u) => Array.from({ length: 14 }, (_, i) => at3(onStick(u + Math.cos(i / 14 * 6.283) * 1.3, Math.sin(i / 14 * 6.283) * 1.3, 0.51)));
    for (const u of [MIN, MAX]) blade.push(`<path d="${K.pathOf(hole(u), true)}" fill="#59606a"/>`, L(K.pathOf(hole(u), true), { tone: "mid" }));
    blade.push(L(K.pathOf([at3(onStick(0, -2.6, 0.51)), at3(onStick(-1.6, 0, 0.51)), at3(onStick(0, 2.6, 0.51))]), { tone: "faint" }));
    out.push(`<g data-name="blade">${ISO.tinted(ISO.T.steel, blade.join(""))}</g>`);
    // cap: rubber seal ring, the cap, a neck and the yellow loop in the blade's plane
    const F = G.frameAlong(onStick(0, 0, 0), DIR);
    out.push(ISO.tinted(ISO.T.rubber, S(G.disc(CAP[0], CAP[0] + 1.6, 3.6, F, P), { tone: "hi" })));
    const handle = [S(G.solidOf([[CAP[0] + 1.6, 4.2], [CAP[1] - 1, 4.2], [CAP[1], 3.4, 1], [CAP[1] + 0.6, 2.4]], F, P), { tone: "hi" })];
    handle.push(L(G.ribsOf(F, CAP[0] + 2.2, CAP[1] - 1.4, 4.2, 18, P, { seams: true }), { tone: "lo" }));
    handle.push(ISO.box(onStick, P, [CAP[1] + 0.4, LOOP.u - LOOP.r1 + 1], [-1.8, 1.8], [-1.1, 1.1], "hi"));
    const Fl = G.frameOf(onStick(LOOP.u, 0, 0), [0, 1, 0], DIR, NRM);
    handle.push(S(G.ringBand(-1.2, 1.2, LOOP.r0, LOOP.r1, Fl, P), { tone: "hi" }), `<path d="${G.circleOf(Fl, 1.2, LOOP.r0, P)}" fill="#fdfdfb" stroke="none"/>`);
    out.push(`<g data-name="handle">${ISO.tinted(YELLOW, handle.join(""))}</g>`);
    if (lab) {
      out.push(ISO.word(at3(onStick(MAX, 5, 0)), "MAX", "#2c6a22", { anchor: "start", dy: 5, size: 15 }));
      out.push(ISO.word(at3(onStick(MIN, 5, 0)), "MIN", "#c0392b", { anchor: "start", dy: 5, size: 15 }));
    }
    return out.join("");
  }
  // Oil on the blade: from the tip up to `top`, both faces, a hair proud of the steel; a drop hangs at the tip.
  function filmSvg(P, top, drops) {
    if (top <= 0.3) return "";
    let svg = ISO.box(onStick, P, [0, top], [-2.75, 2.75], [-0.65, 0.65], "hi");
    if (drops) svg += S(G.sphereOf(onStick(-1.2, 0, 0), 1.1, P), { tone: "hi" });
    return `<g data-name="film" opacity="0.82">${ISO.tinted(OIL, svg)}</g>`;
  }
  function ragSvg(P, u) {
    return `<g data-name="rag">` + ISO.tinted(RAG, ISO.box(onStick, P, [u - 4, u + 4], [-4.2, 4.2], [-2.6, 2.6], "hi") + ISO.box(onStick, P, [u + 1, u + 6], [3.4, 6], [-2.2, 2.2], "hi")) + "</g>";
  }

  // ── the check as timed moves; a pose holds out (0–1 along the tube), aside (0–1 to the reading spot),
  // smear (oil wiped about, up to u), film (the true film shown, 0–1), rag (u of the rag, or -1)
  const zero = () => ({ out: 0, aside: 0, smear: 0, film: 0, ragOn: 0, ragU: BLADE - 6, label: "dipstick in its tube" });
  function movesOf(what) {
    if (what === "pull") return [{ t: 1.6, set: { out: 1, smear: 52, film: 0 }, label: "pulled out · oil smeared up the blade" }, { t: 1.1, set: { aside: 1 }, label: "held up beside the engine" }];
    if (what === "wipe") return [{ t: 0.4, set: { ragOn: 1, ragU: BLADE - 6 }, label: "rag on the blade" }, { t: 1.5, set: { ragU: 2 }, label: "wiped clean with the rag" }, { t: 0.4, set: { ragOn: 0, smear: 0 }, label: "blade clean" }];
    if (what === "dip") return [{ t: 1, set: { aside: 0 } , label: "back to the tube" }, { t: 1.3, set: { out: 0 }, label: "pushed all the way in" }, { t: 0.5, set: {}, label: "seated · oil wets the blade" }, { t: 1.3, set: { out: 1, film: 1 }, label: "pulled out again" }];
    if (what === "read") return [{ t: 1.1, set: { aside: 1, film: 1 }, label: "read where the film stops" }];
    return [];
  }
  const lerp = (a, b, k) => (typeof a === "number" ? a + (b - a) * k : k < 1 ? a : b);
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  function poseAt(from, moves, t) {
    let s = { ...from }, clock = 0;
    for (const m of moves) {
      if (t < clock) break;
      const end = { ...s, ...m.set }, k = ease((t - clock) / m.t);
      s = Object.fromEntries(Object.keys(s).map((key) => [key, lerp(s[key], end[key], k)]));
      s.label = m.label;
      clock += m.t;
    }
    return s;
  }

  ISO.add({
    name: "dipstick", title: "Oil dipstick", compare: "dipstick 480 270 440 level=60",
    about: "Engine corner with the dipstick in its tube: pull it out, wipe it, dip it, and read the oil film between MIN and MAX.",
    line: "dipstick cx cy length level=0-100 lab=1 lit=handle|blade|film|rag|tube|oilcap",
    demo: { line: "dipstick 480 270 440 level=60", script: [{ set: { do: "pull", lit: "handle" }, hold: "settle" }, { set: { do: "wipe", lit: "rag" }, hold: "settle" }, { set: { do: "dip", lit: "tube" }, hold: "settle" }, { set: { do: "read", lit: "film" }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", m = { level: ISO.clamp(ISO.num(o, "level", 60), 0, 100) };
      const top = add(onStick(LOOP.u + LOOP.r1, 0, 0), DIR, OUT);
      const W = size * 1.75, H = size * 1.08;
      const { P, g } = ISO.frame([...K.boxCorners(BLOCK, -12, TOP), top, add(top, ASIDE), add(onStick(-2, 6, 0), add(DIR.map((v) => v * OUT), ASIDE))], cx, cy, W, H, { azimuth: 64, elevation: 24 }, parent);
      const id = `dip-clip-${++uid}`;
      // The stick is clipped to the open side of the tube's mouth, so the part inside the tube is hidden.
      const F = G.frameAlong(BASE, DIR), mouth = [];
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; mouth.push(K.iso(G.pointOf(F, TUBE, 7, a), P), K.iso(G.pointOf(F, TUBE + 400, 7, a), P)); }
      g.innerHTML = `<defs><clipPath id="${id}"><path d="${K.pathOf(ISO.hullOf(mouth), true)}"/></clipPath></defs><g data-part="engine">${engineSvg(P, lab)}</g>` +
        `<g data-part="clip"><g data-part="stick">${stickSvg(P, lab)}<g data-part="film"></g><g data-part="rag"></g></g></g>`;
      const q = (s) => g.querySelector(`[data-part="${s}"]`), clip = q("clip"), stick = q("stick"), film = q("film"), rag = q("rag"), w = ISO.writer();
      let lit = o.lit || "handle", cur = { from: zero(), moves: [], t: 0 }, s = zero();
      const draw = () => {
        const off = add(DIR.map((v) => v * OUT * s.out), ASIDE.map((v) => v * s.aside));
        w.attr(stick, "transform", K.translateAlong(P, off));
        w.attr(clip, "clip-path", s.aside > 0.001 ? "none" : `url(#${id})`);
        const top = s.film > 0.5 ? filmTop(m.level) : 0, wiped = s.ragOn > 0.01 ? Math.min(s.smear, s.ragU - 4) : s.smear, smear = Math.max(wiped, top);
        w.rebuild(film, `${smear.toFixed(2)} ${s.film > 0.5}`, () => filmSvg(P, smear, (s.film > 0.5 && m.level > 0) || wiped > 1));
        w.rebuild(rag, s.ragOn > 0.01 ? s.ragU.toFixed(2) : "", () => (s.ragOn > 0.01 ? ragSvg(P, s.ragU) : ""));
        w.attr(rag, "opacity", Math.min(1, s.ragOn * 1.5).toFixed(2));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.level !== undefined) m.level = ISO.clamp(+p.level, 0, 100);
        if (p.lit) lit = p.lit;
        if (p.do) cur = { from: { ...s }, moves: movesOf(p.do), t: 0 };
      };
      g.update = (dt) => {
        cur.t += dt;
        const total = cur.moves.reduce((a, mv) => a + mv.t, 0);
        s = poseAt(cur.from, cur.moves, ISO.still() ? 1e9 : cur.t);
        draw();
        return cur.t < total + 0.05;
      };
      g.readout = () => {
        if (s.film < 0.5 || s.aside < 0.99) return s.label;
        const lv = m.level, need = Math.round((1 - lv / 100) * 10) / 10;
        return lv <= 0 ? "below MIN · add 1 L now, wait 5 min, check again" : lv >= 100 ? "at MAX · full, no top-up" :
          `oil at ${lv}% from MIN to MAX · ${need.toFixed(1)} L to MAX · ${lv < 50 ? `top up about ${need.toFixed(1)} L` : "fine, no top-up needed"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
