// "floortape cx cy k len=1..50 lab=0 lit=tape|reel|ring" — a PART (PARTS.md, batch 5): a surveyor's fibreglass
// measuring tape laid out straight along the floor (along x), 1.3 cm wide, len metres of it pulled out, its zero end's
// brass ring at −x and its closed reel case at +x. Origin: the floor point under the middle of the laid-out tape.
// Printed in black on yellow: a tick right across at every metre with its number, a half-width tick every 10 cm and a
// short one every centimetre (drawn only as close as they can be seen at this k). Static. Anchors zero (the zero mark,
// at the end plate) and end (where the tape goes into the reel). From the echo scene's floor tape. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HW = 0.65, T = 0.05, RR = 7, RH = 3.6;
  const YELLOW = ISO.tint("#ffe27a", ["#c9a422", "#d8b434", "#e6c64a", "#f2d660"], "#6e5608");
  const INK = ISO.tint("#1a1a1a", ["#1a1a1a", "#1a1a1a", "#1a1a1a", "#1a1a1a"], "#1a1a1a");
  const ORANGE = ISO.tint("#ffb36a", ["#c9661e", "#d8772c", "#e6893e", "#f29c52"], "#5e2a06");

  function tapeSvg(P, len, k) {
    const L0 = (-len * 100) / 2, out = [], z = T + 0.005, at = (x, y) => K.iso([x, y, z], P);
    out.push(ISO.tinted(YELLOW, S(K.slabOf({ x: L0, y: -HW, w: len * 100, d: 2 * HW, r: 0.05 }, 0, T, P, 2), { tone: "mid", crease: "none" })));
    // ticks hang from the near edge (y = +HW): every metre right across, every 10 cm half way, every cm a short one
    const m = [], dm = [], cm = [], step = k * 1 >= 2.5 ? 1 : k * 10 >= 3 ? 10 : 0;
    for (let c = step || 100; c <= len * 100 + 1e-6; c += step || 100) {
      const x = L0 + c, y = HW - 0.01;
      if (c % 100 === 0) m.push(K.pathOf([at(x, y), at(x, -HW + 0.01)]));
      else if (c % 10 === 0) dm.push(K.pathOf([at(x, y), at(x, y - HW)]));
      else cm.push(K.pathOf([at(x, y), at(x, y - HW * 0.45)]));
    }
    out.push(ISO.tinted(INK, L(m.join(""), { tone: "mid" }) + (dm.length ? L(dm.join(""), { tone: "mid", free: "end" }) : "") + (cm.length ? L(cm.join(""), { tone: "lo", free: "end" }) : "")));
    // the 10 cm numbers, when they fit (about 14 px each)
    if (step && 10 * k * 0.55 >= 14) for (let c = 10; c < len * 100; c += 10) if (c % 100) out.push(LAB.faceText(P, [L0 + c + 0.4, -0.15, z], [1, 0, 0], String(c % 100), 0.55, "#1a1a1a", [0, -1, 0]));
    // the metre numbers, as often as they fit (each needs about 22 px)
    const every = [1, 2, 5, 10, 20, 50].find((n) => n * 100 * k * 0.55 >= 22) || 50;
    for (let n = every; n < len; n += every) out.push(LAB.faceText(P, [L0 + n * 100 + 0.55, -0.1, z], [1, 0, 0], `${n} m`, 0.75, "#1a1a1a", [0, -1, 0]));
    return out.join("");
  }
  function ringSvg(P, x0) {
    // the zero end: a riveted brass end plate and a brass pull ring lying flat on the floor
    const F = LAB.Z([x0 - 1.6, 0, 0]);
    return ISO.tinted(ISO.T.brass, ISO.wbox(P, [x0 - 0.7, x0 + 0.6], [-HW - 0.05, HW + 0.05], [0, T + 0.08], "mid")) +
      `<path d="${G.circleOf(F, 0.12, 1.15, P)}" fill="none" stroke="#6b4c12" stroke-width="${Math.max(1.4, G.scaleOf(P) * 0.32).toFixed(2)}"/><path d="${G.circleOf(F, 0.12, 1.15, P)}" fill="none" stroke="#e0b44a" stroke-width="${Math.max(0.8, G.scaleOf(P) * 0.2).toFixed(2)}"/>`;
  }
  function reelSvg(P, x1) {
    // the closed reel: a round orange case lying flat, the tape going in through a slot, a hub and a folding crank
    const x = x1 + RR, out = [];
    out.push(ISO.tinted(ORANGE, S(K.cylinder(x, 0, RR, 0, RH, P, 48, 0.4), { tone: "mid", inner: L(K.sideArc(x, 0, RR, RH * 0.5, P, 40), { tone: "faint" }) })));
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(x, 0, RR * 0.32, RH, 0.4, P, 28, 0.1), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 0.4, x + 0.4], [0, RR * 0.72], [RH + 0.4, RH + 0.75], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(x, RR * 0.66, 0.55, RH + 0.75, 2.2, P, 18, 0.2), { tone: "hi" })));
    out.push(LAB.faceText(P, [x, -RR * 0.58, RH + 0.01], [1, 0, 0], "50 m", 1.3, "#5e2a06", [0, -1, 0]));
    return out.join("");
  }

  ISO.add({
    name: "floortape", title: "Floor measuring tape (part)", compare: null,
    about: "A surveyor's fibreglass tape 1.3 cm wide laid straight along the floor, len metres of it (up to 50) from its brass zero ring to its reel, with a tick and a number every metre and finer ticks every 10 cm and 1 cm. anchors: zero end",
    line: "floortape cx cy k len=1..50 lab=0 lit=tape|reel|ring",
    demo: { line: "floortape 430 250 7 len=1", script: [{ set: {}, hold: 1 }, { set: { lit: "tape" }, hold: 1.2 }, { set: { lit: "reel" }, hold: 1 }, { set: { lit: "ring" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const len = Math.round(ISO.clamp(ISO.num(o, "len", 50), 1, 50)), x0 = (-len * 100) / 2, x1 = -x0;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: x0 - 3, y: -RR, w: len * 100 + 2 * RR + 3, d: 2 * RR, r: RR }, 0, 0.1, P)}"/>` +
        `<g data-name="tape">${tapeSvg(P, len, G.scaleOf(P))}</g><g data-name="ring">${ringSvg(P, x0)}</g><g data-name="reel">${reelSvg(P, x1)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = CIRC.word(P, [x1 + RR * 2, 0, RH], `measuring tape, ${len} m`);
      g.anchors = { zero: [x0, 0, T], end: [x1, 0, T] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) lit = p.lit; B13.light(w, g, lit); };
      g.update = () => false;
      g.readout = () => `fibreglass tape laid along the floor · ${len} m from the zero mark to the reel · ticks every metre, 10 cm and 1 cm`;
      B13.light(w, g, lit);
      return g;
    },
  });
})();
