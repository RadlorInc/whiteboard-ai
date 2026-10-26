// "opticalbench cx cy k len=100..150 lab=0 lit=rail|feet|scale" — a PART (PARTS.md, batch 5): a school optical bench
// standing on the bench top, its origin the bench point under the rail's middle. A 4 × 4 cm aluminium rail (a slot
// down its top) `len` cm long with black end caps, on two cast feet with levelling screws and rubber pads; a printed
// cm scale along its near (+y) face (ticks every cm hang from the strip's top edge, longer every 5, numbers every 10,
// 0 at the −x end). Riders, the laser and the screen go on it: `zero` = the rail's top at the scale's 0 (place a
// rider at=bench.zero ax=<cm on the scale>), `top` = the rail's top middle, `end` = the top at the +x end. Static.
// World units: 1 = 1 cm. Built from B03.RAIL (_b03.js), the same section the riders clamp.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const PAINT = ISO.tint("#d5dde6", ["#7d8b99", "#909dab", "#a3afbb", "#b8c2cc"], "#2b3640");
  const STRIP = ISO.tint("#f7f7f2", ["#cfcfc8", "#d9d9d2", "#e3e3dc", "#ecece6"], "#55534c");

  function foot(P, xf) {
    const out = [];
    // rubber pads under the four corners, the cast plate, levelling knobs at its two y ends, the pedestal under the rail
    for (const y of [-7.5, 7.5]) for (const x of [xf - 1.8, xf + 1.8]) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 0.9, 0, 0.6, P, 16), { tone: "lo" })));
    out.push(ISO.tinted(PAINT, ISO.wbox(P, [xf - 3, xf + 3], [-9, 9], [0.6, 1.8], "mid")));
    const knob = (y) => { const F = G.frameOf([xf, y, 1.8], [0, 0, 1], [1, 0, 0], [0, 1, 0]); return window.B03.knob(P, F, 0, 0.7, 1.1) + ISO.tinted(ISO.T.steel, S(G.disc(0.7, 1.0, 0.3, F, P), { tone: "mid" })); };
    out.push(knob(-7.5), ISO.tinted(PAINT, ISO.wbox(P, [xf - 2.4, xf + 2.4], [-2.6, 2.6], [1.8, 3], "mid")), knob(7.5));
    // the bolts that hold the rail, on the pedestal's near face
    out.push(D([K.iso([xf - 1.4, 2.62, 2.4], P), K.iso([xf + 1.4, 2.62, 2.4], P)], { size: 0.5 }));
    return out.join("");
  }

  ISO.add({
    name: "opticalbench", title: "Optical bench (part)", compare: null,
    about: "A school optical bench: a 1 to 1.5 m aluminium rail with a cm scale, on two feet with levelling screws; riders with a lens, a slide or a screen slide along it. anchors: zero top end",
    line: "opticalbench cx cy k len=100..150 lab=0 lit=rail|feet|scale",
    demo: { line: "opticalbench 480 300 5.4 len=120 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.4 }, { set: { lit: "feet" }, hold: 1.4 }, { set: { lit: "rail" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B03 = window.B03, LAB = window.LAB, { hw, top, h, strip } = B03.RAIL;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const len = Math.round(ISO.clamp(ISO.num(o, "len", 120), 100, 150)), x0 = -len / 2, x1 = len / 2, xf = len / 2 - 12;
      const z0 = top - h, sx0 = x0 + 3, n = Math.floor(len - 6);
      let lit = o.lit || "";
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: x0 - 1, y: -9.5, w: len + 2, d: 19, r: 2 }, 0, top, P)}"/>`];
      out.push(`<g data-name="feet">${foot(P, -xf)}${foot(P, xf)}</g>`);
      // the rail: its section with the slot down the top, eased top edges; an end cap on each end
      const sec = [[-hw, z0], [hw, z0], [hw, top - 0.35], [hw - 0.35, top], [0.45, top], [0.45, top - 0.5], [-0.45, top - 0.5], [-0.45, top], [-hw + 0.35, top], [-hw, top - 0.35]];
      const cap = (a, b) => ISO.tinted(B03.BLACK, ISO.wbox(P, [a, b], [-hw - 0.1, hw + 0.1], [z0 - 0.1, top + 0.05], "mid"));
      out.push(`<g data-name="rail">${cap(x0, x0 + 0.8)}${ISO.tinted(B03.ALU, S(G.prismOf(B03.X([x0 + 0.8, 0, 0]), sec, 0, len - 1.6, P), { tone: "hi" }))}${cap(x1 - 0.8, x1)}</g>`);
      // the scale: a printed strip on the near face; ticks hang from its top edge, numbers under the 10 cm ticks
      const zs0 = top + strip[0], zs1 = top + strip[1], y = hw + 0.06, minor = [], mid = [], major = [], nums = [];
      for (let c = 0; c <= n; c++) {
        const x = sx0 + c, big = c % 10 === 0, half = c % 5 === 0, d = K.segment([x, y, zs1], [x, y, zs1 - (big ? 1.0 : half ? 0.7 : 0.45)], P);
        (big ? major : half ? mid : minor).push(d);
        if (big) nums.push(LAB.faceText(P, [x, y + 0.01, zs0 + 0.3], [1, 0, 0], String(c), 0.85, "#2b2b28"));
      }
      out.push(`<g data-name="scale">${ISO.tinted(STRIP, ISO.wbox(P, [x0 + 1.4, x1 - 1.4], [hw, hw + 0.05], [zs0, zs1], "hi"))}` +
        ISO.tinted(ISO.tint("#2b2b28", ["#2b2b28", "#2b2b28", "#2b2b28", "#2b2b28"], "#2b2b28"), L(minor.join(""), { tone: "lo", free: "end" }) + L(mid.join(""), { tone: "mid", free: "end" }) + L(major.join(""), { tone: "hi", free: "end" })) +
        nums.join("") + LAB.faceText(P, [x1 - 6, y + 0.01, zs0 + 0.3], [1, 0, 0], "cm", 0.7, "#55534c") + `</g>`);
      out.push(`<g data-part="words">${LAB.word(P, lab, [x0 + 4, hw, top + 3], "optical bench", "#556", { anchor: "start" })}</g>`);
      g.innerHTML = out.join("");
      g.anchors = { zero: [sx0, 0, top], top: [0, 0, top], end: [x1 - 0.8, 0, top] };
      const w = ISO.writer(), draw = () => B03.light(w, g, lit);
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
      g.update = () => false;
      g.readout = () => `optical bench · ${len} cm rail, scale 0 to ${n} cm · rail top ${top} cm over the bench`;
      draw();
      return g;
    },
  });
})();
