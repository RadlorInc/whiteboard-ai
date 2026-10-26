// "lever cx cy width load=30 at=40 effort=10 e=120 lit=effort lab=1" — a lab lever on a bench board.
// A load (kg) sits `at` from the fulcrum on the left; an effort rider of slotted 5 kg masses sits `e` from it on the
// right. The plank turns toward whichever side turns harder (mass × distance) until an end lands on its rubber stop;
// equal turning settles level, because the pin sits just above the plank's centre of mass. set({ e, load, at, effort })
// moves the rider or changes the masses; the readout is the two turnings and which way it goes.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -200, y: -36, w: 400, d: 72, r: 6 };
  const PX = -60, PIVOT_Z = 27, PLANK = { from: -130, to: 250, t: 6, y: 13 };
  const STOP_U = { left: -122, right: 242 }, STOP_H = 3;
  const stopOf = (u) => Math.asin((PIVOT_Z - STOP_H) / Math.abs(u));
  const STOPS = { left: stopOf(STOP_U.left), right: -stopOf(STOP_U.right) };
  const PHYS = { right: 600, inertia: 40, drag: 2.2, bounce: 0.3 };
  const CHEEK = (y) => ({ x: PX - 6, y, w: 12, d: 2.5, r: 0.6 }), PIN = [PX, PLANK.y + 2.6, PIVOT_Z + 2];
  const onPlank = (tilt) => (u, w, y) => [PX + u * Math.cos(tilt) - w * Math.sin(tilt), y, PIVOT_Z + u * Math.sin(tilt) + w * Math.cos(tilt)];

  function backSvg(P, lab) {
    const at3 = (p) => K.iso(p, P), out = [ISO.baseboard(P, BOARD, { ruler: { zero: PX } }), ISO.plate(P, { x: -176, y: -28, w: 40, d: 16, r: 1.2 })];
    for (const u of [STOP_U.left, STOP_U.right]) {
      const pad = { x: PX + u - 9, y: -10, w: 18, d: 20, r: 1.5 };
      out.push(S(K.slabOf(pad, 0, 1.2, P, 3, 0.4), { tone: "mid" }), D([at3([pad.x + 3, pad.y + 3, 1.2]), at3([pad.x + pad.w - 3, pad.y + pad.d - 3, 1.2])], { size: 0.4 }));
      out.push(S(K.cylinder(PX + u, 0, 5.6, 1.2, STOP_H - 1.2, P, 24), { tone: "lo" }), L(K.ring(PX + u, 0, 3.2, STOP_H, P, 20), { tone: "faint" }));
    }
    const plinth = { x: PX - 16, y: -18, w: 32, d: 36, r: 1.5 };
    out.push(S(K.slabOf(plinth, 0, 3, P, 3, 0.5), { tone: "mid" }), D(K.corners(plinth, 3).map(([x, y]) => at3([x, y, 3])), { size: 0.4 }));
    out.push(S(K.slabOf(CHEEK(-PLANK.y - 2.5), 3, PIVOT_Z + 4, P, 2, 0.4), { tone: "mid" }));
    const W = [[PX - 11, -9, 3], [PX + 11, -9, 3], [PX, -9, PIVOT_Z], [PX - 11, 9, 3], [PX + 11, 9, 3], [PX, 9, PIVOT_Z]];
    out.push(`<g data-name="fulcrum">${ISO.poly(W, [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], P, "mid")}</g>`);
    if (lab) out.push(ISO.word(at3([PX, BOARD.y + BOARD.d, -8]), "Fulcrum", "#555", { dy: 30, size: 17 }));
    return out.join("");
  }
  function plankSvg(P, tilt, m, lab) {
    const at = onPlank(tilt), at3 = (p) => K.iso(p, P), out = [], rider = [m.e - 11, m.e + 11];
    out.push(ISO.tinted(ISO.T.red, ISO.box(at, P, rider, [-2, PLANK.t], [-PLANK.y - 2, -PLANK.y])));
    const wood = [ISO.box(at, P, [PLANK.from, PLANK.to], [0, PLANK.t], [-PLANK.y, PLANK.y])];
    const minor = [], major = [];
    for (let u = -120; u <= 240; u += 20) if (u) (u % 40 ? minor : major).push(K.segment(at(u, PLANK.t, PLANK.y), at(u, PLANK.t, PLANK.y - (u % 40 ? 3 : 5)), P));
    wood.push(L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    wood.push(L(K.segment(at(0, PLANK.t, PLANK.y), at(0, PLANK.t, PLANK.y - 6), P), { tone: "hi", free: "end" }));
    wood.push(D([...[-120, -100, -80, -60, -40, -20], ...[20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240]].map((u) => at3(at(u, PLANK.t, 0))), { size: 1.1, tone: "lo" }));
    out.push(`<g data-name="plank">${ISO.tinted(ISO.T.wood, wood.join(""))}</g>`);
    out.push(ISO.box(at, P, [PLANK.from - 2, PLANK.from + 3], [-0.6, PLANK.t + 0.6], [-PLANK.y - 0.6, PLANK.y + 0.6]));
    out.push(ISO.box(at, P, [PLANK.to - 3, PLANK.to + 2], [-0.6, PLANK.t + 0.6], [-PLANK.y - 0.6, PLANK.y + 0.6]));
    // A spirit level set into the plank: the bubble drifts toward the high end.
    const vial = [m.at > 60 || m.e < 60 ? 14 : 14, 42], bubble = ISO.clamp(-tilt * 70, -11, 11);
    out.push(ISO.box(at, P, vial, [PLANK.t, PLANK.t + 4], [-5, 5]));
    out.push(L(K.pathOf([[16, -2.2], [40, -2.2], [40, 2.2], [16, 2.2]].map(([u, y]) => at3(at(u, PLANK.t + 4, y))), true), { tone: "lo" }));
    out.push(L(K.segment(at(28, PLANK.t + 4, -2.2), at(28, PLANK.t + 4, 2.2), P), { tone: "faint" }), D([at3(at(28 + bubble, PLANK.t + 4, 0))], { size: 1.3, tone: "hi" }));
    // Load: a cast block with a lifting handle, its mass engraved on the front.
    const lu = [-m.at - 20, -m.at + 20], top = PLANK.t + 30, load = [ISO.box(at, P, lu, [PLANK.t, top], [-11, 11], "hi")];
    for (const u of [-m.at - 12, -m.at + 12]) load.push(ISO.box(at, P, [u - 1.5, u + 1.5], [top, top + 6], [-1.5, 1.5], "hi"));
    load.push(ISO.box(at, P, [-m.at - 14, -m.at + 14], [top + 6, top + 8.5], [-2, 2], "hi"));
    const o = K.iso(at(-m.at, PLANK.t + 17, 11), P), a = K.iso(at(-m.at + 1, PLANK.t + 17, 11), P), b = K.iso(at(-m.at, PLANK.t + 16, 11), P);
    load.push(K.faceTextSvg(`matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})`, `${m.load} kg`, { size: 7, tone: "lo", anchor: "middle" }));
    out.push(`<g data-name="load">${ISO.tinted(ISO.T.blue, load.join(""))}</g>`);
    // Effort: a rider clamping the plank with a stack of 5 kg slotted masses.
    const eff = [ISO.box(at, P, rider, [PLANK.t, PLANK.t + 3], [-PLANK.y - 2, PLANK.y + 2])], count = ISO.clamp(Math.round(m.effort / 5), 1, 8);
    for (let i = 0; i < count; i++) eff.push(ISO.box(at, P, [m.e - 8, m.e + 8], [PLANK.t + 3 + i * 6.6, PLANK.t + 9 + i * 6.6], [-9, 9], "hi"));
    eff.push(ISO.box(at, P, rider, [-2, PLANK.t], [PLANK.y, PLANK.y + 2]), ISO.box(at, P, [m.e - 2.4, m.e + 2.4], [0.5, PLANK.t - 0.5], [PLANK.y + 2, PLANK.y + 5]));
    eff.push(D([at3(at(m.e, PLANK.t / 2, PLANK.y + 5))], { size: 0.5 }));
    out.push(`<g data-name="effort">${ISO.tinted(ISO.T.red, eff.join(""))}</g>`);
    if (lab) {
      out.push(ISO.word(at3(at(-m.at, top + 8.5, 0)), `Load ${m.load} kg`, "#2b6cc4", { dy: -10, size: 17 }));
      out.push(ISO.word(at3(at(m.e, PLANK.t + 9 + (count - 1) * 6.6, 0)), `Effort ${m.effort} kg`, "#c0392b", { dy: -10, size: 17 }));
    }
    return out.join("");
  }
  function frontSvg(P) {
    return S(K.slabOf(CHEEK(PLANK.y), 3, PIVOT_Z + 4, P, 2, 0.4), { tone: "mid" }) +
      L(K.sideRing([PIN[0], PIN[1] + 0.1, PIN[2]], 2, "y", P, 18), { tone: "lo" }) + D([K.iso([PIN[0], PIN[1] + 0.1, PIN[2]], P)], { size: 0.9, tone: "hi" });
  }

  ISO.add({
    name: "lever", title: "Lever", compare: "lever 480 300 420",
    about: "Lab lever on a bench board: load × distance against effort × distance; the plank turns to the side that turns harder.",
    line: "lever cx cy width load=30 at=40 effort=10 e=120 lit=effort lab=1",
    demo: { line: "lever 480 300 420", script: [{ set: { e: 160 }, hold: 2.6 }, { set: { e: 120 }, hold: 2.6 }, { set: { e: 80 }, hold: 2.6 }, { set: { e: 120 }, hold: 2.6 }] },
    make([cx, cy, W = 420], o, t, parent) {
      const lab = o.lab !== "0", m = { load: ISO.num(o, "load", 30), at: ISO.clamp(ISO.num(o, "at", 40), 20, 110), effort: ISO.num(o, "effort", 10), e: ISO.clamp(ISO.num(o, "e", 120), 20, 238) };
      const turnOf = (e) => m.load * m.at - m.effort * e;
      const restOf = (e) => (turnOf(e) > 0 ? STOPS.left : turnOf(e) < 0 ? STOPS.right : 0);
      const Wd = W * 1.37, { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [PX + PLANK.to, 0, PIVOT_Z + 20], [PX + PLANK.from, 0, PIVOT_Z + 20], [PX - 40, 0, PIVOT_Z + 70]], cx, cy, Wd, Wd * 0.6, { azimuth: 68, elevation: 26 }, parent);
      g.innerHTML = `<g data-part="back">${backSvg(P, lab)}</g><g data-part="plank"></g><g data-part="front">${frontSvg(P)}</g>`;
      const plank = g.querySelector('[data-part="plank"]'), w = ISO.writer();
      const s = { e: m.e, target: m.e, tilt: restOf(m.e), rate: 0 };
      let lit = o.lit || "effort";
      const draw = () => {
        w.rebuild(plank, `${s.tilt.toFixed(4)} ${s.e.toFixed(2)} ${m.load} ${m.at} ${m.effort}`, () => plankSvg(P, s.tilt, { ...m, e: s.e }, lab));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.e !== undefined) s.target = ISO.clamp(+p.e, 20, 238);
        for (const k of ["load", "at", "effort"]) if (p[k] !== undefined) m[k] = +p[k];
        if (p.lit) lit = p.lit;
      };
      g.update = (dt) => {
        s.e = ISO.follow(s.e, s.target, dt, 0.45, ISO.still());
        let moving = s.e !== s.target;
        if (ISO.still()) { s.tilt = restOf(s.e); s.rate = 0; }
        else for (let i = 0; i < 8; i++) {
          const h = dt / 8;
          s.rate += ((turnOf(s.e) * Math.cos(s.tilt) - PHYS.right * Math.sin(s.tilt)) / PHYS.inertia - PHYS.drag * s.rate) * h;
          s.tilt += s.rate * h;
          if (s.tilt > STOPS.left) { s.tilt = STOPS.left; s.rate = -s.rate * PHYS.bounce; }
          if (s.tilt < STOPS.right) { s.tilt = STOPS.right; s.rate = -s.rate * PHYS.bounce; }
        }
        const rest = restOf(s.e);
        if (Math.abs(s.rate) < 5e-4 && Math.abs(s.tilt - rest) < 5e-4) { s.rate = 0; s.tilt = rest; } else moving = true;
        draw();
        return moving;
      };
      g.readout = () => {
        const e = Math.round(s.e), l = m.load * m.at, r = m.effort * e;
        return `load ${m.load} kg × ${m.at} = ${l} · effort ${m.effort} kg × ${e} = ${r} · ${s.tilt > 1e-3 ? "load side down" : s.tilt < -1e-3 ? "load lifted" : "level"}`;
      };
      draw();
      if (t) label(parent, cx, cy - Wd * 0.3 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
