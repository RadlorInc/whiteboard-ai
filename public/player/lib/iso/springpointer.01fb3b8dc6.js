// "springpointer cx cy k drop=0..40 lab=0 lit=pointer|collar" — a PART (PARTS.md, batch 5): the pointer clamped at a
// spring's foot that reads a metre rule beside it: a brass split collar round the hanger's rod (Ø 5 mm), its knurled
// thumb screw, and a 4 cm aluminium blade along +x tapering to a red knife-edge tip. Origin = the collar's middle (the
// point on the rod it grips). drop = how far it has moved down (cm), as a loaded spring's foot does: it gets there
// like a spring, with a small bounce (ω 6 rad/s, ζ 0.5). `tip` = the knife edge at drop 0 (line it up with a rule's
// edge). Note: coilspring already carries its own pointer; this one is for a rig drawn from separate parts, a lesson
// moving it with set({ drop }) in step with the spring. hooke.js's pointer, made real. Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RI = 2.6, RO = 5.5, H = 4, LEN = 40, T = 0.8, W0 = 6, ZETA = 0.5;
  const RED = ISO.tint("#e0574a", ["#9a2a20", "#b0352a", "#c44436", "#d24f40"], "#4a120c");
  const ALU = ISO.tint("#eceef1", ["#a9adb4", "#b9bcc2", "#c9ccd1", "#d9dbdf"], "#45484e");

  function pointerSvg(P, lab) {
    const Fz = G.frameOf([0, 0, -H], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    // the collar: a ring with its split toward −x, the blade's root clamped in its +x side, the thumb screw toward +y
    const out = [`<g data-name="collar">${ISO.tinted(ISO.T.brass, S(G.ringBand(0, 2 * H, RI, RO, Fz, P), { tone: "mid" }))}` +
      `<path d="${K.ring(0, 0, RI, H + 0.02, P, 20)}" fill="#3a2c0c" fill-opacity=".85"/><path d="${K.pathOf([[-RO - 0.02, -0.4, H], [-RI, -0.4, H], [-RI, 0.4, H], [-RO - 0.02, 0.4, H]].map((p) => K.iso(p, P)), true)}" fill="#5c4512"/></g>`];
    const blade = [[RO - 1, -3], [LEN - 6, -1.1], [LEN, 0], [LEN - 6, 1.1], [RO - 1, 3]], tip = [[LEN - 9, -1.6], [LEN - 6, -1.1], [LEN, 0], [LEN - 6, 1.1], [LEN - 9, 1.6]];
    out.push(`<g data-name="pointer">${ISO.tinted(ALU, S(K.extrude(blade, -T / 2, T, P), { tone: "hi" }))}${ISO.tinted(RED, S(K.extrude(tip, T / 2, 0.05, P), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.steel, S(K.cylinder(RO + 2.5, 0, 1, T / 2, 0.5, P, 10), { tone: "hi" })) + `</g>`);
    const Fs = G.frameOf([0, RO, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(`<g data-name="collar">${ISO.tinted(ISO.T.steel, S(G.disc(-0.5, 3.5, 1.3, Fs, P), { tone: "mid" }) + S(G.disc(3.5, 6.5, 2.8, Fs, P), { tone: "hi" }) + L(G.ribsOf(Fs, 3.5, 6.5, 2.8, 12, P, { seams: true }), { tone: "lo" }))}</g>`);
    if (lab) out.push(CIRC.word(P, [LEN / 10, 0, 0.6], "pointer"));
    return out.join("");
  }

  ISO.add({
    name: "springpointer", title: "Spring pointer (part)", compare: null,
    about: "The pointer at a spring's foot that reads the rule: a brass collar on the hanger rod and a 4 cm blade with a red knife-edge tip; moved down by drop cm, it settles with a small bounce like the spring. anchors: tip",
    line: "springpointer cx cy k drop=0..40 lab=0 lit=pointer|collar",
    demo: { line: "springpointer 430 200 60 drop=0", script: [{ set: {}, hold: 1 }, { set: { drop: 2, lit: "pointer" }, hold: "settle" }, { set: { drop: 4.5, lit: "collar" }, hold: "settle" }, { set: { drop: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = `<g data-part="move">${pointerSvg(Pm, lab)}</g>`;
      g.anchors = { tip: [LEN / 10, 0, 0] };
      const el = g.querySelector('[data-part="move"]'), w = ISO.writer(), light = CIRC.lighter(g), PHYS = window.PHYS;
      const s = { x: ISO.clamp(ISO.num(o, "drop", 0), 0, 40) / 100, v: 0 };
      s.to = s.x;
      let lit = o.lit || "";
      const draw = () => { w.attr(el, "transform", K.translateAlong(P, [0, 0, -(Math.round(s.x * 2000) / 20)])); light(lit); };
      g.set = (p) => {
        if (p.drop !== undefined && Number.isFinite(+p.drop)) s.to = ISO.clamp(+p.drop, 0, 40) / 100;
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => { const moving = PHYS.bounce(s, s.to, Math.min(dt, 0.1), W0, ZETA); draw(); return moving; };
      g.readout = () => `pointer ${(s.x * 100).toFixed(1)} cm below where it started · read the rule at its red tip, eye level with it`;
      draw();
      return g;
    },
  });
})();
