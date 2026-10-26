// "electricbell cx cy k ring=0|1 lab=0 lit=base|magnet|gong|hammer|contact|terminals" — a PART (PARTS.md, batch 5):
// the electric bell inside belljar.js, at real size (18 × 10 × 25 cm), standing on its base, origin the surface point
// under its middle. A wooden base; a soft-iron yoke with two coils of copper wire on fibre bobbins (the
// electromagnet); a pillar with an arm that holds a brass gong overhead; a sprung iron armature over the coils' poles,
// fixed to a brass post by a steel spring strip, carrying the hammer rod and its ball; a contact screw on its own
// pillar resting on the spring (the make-and-break); two terminal screws on the front. ring=1: current flows, the
// magnet pulls the armature down, the hammer strikes the gong, the contact opens, the spring throws it back, about 7
// times a second (rotation about the spring's root, true to the gaps: 4 mm at the poles, 3 mm at the gong).
// set({ ring }). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B = { x: -94, y: -47, w: 180, d: 94, r: 4 }, BZ = 20, POST = -70, GONG = [31, 0, 175], PIV = [67, 0, 105], BALL = [108, 0, 178];
  const COILS = [-26, 10], STRIKE = 3 / (BALL[2] - PIV[2]);          // the angle that closes the 3 mm gap
  const FIBRE = ISO.tint("#d9a28a", ["#8f4a32", "#9e573d", "#ad664a", "#bb7659"], "#4a1f10");
  const rot = ([x, y, z], th) => { const dx = x - PIV[0], dz = z - PIV[2], c = Math.cos(th), s = Math.sin(th); return [PIV[0] + dx * c - dz * s, y, PIV[2] + dx * s + dz * c]; };

  function backSvg(P) {
    const B08 = window.B08, out = [`<path class="iso-halo" d="${K.haloOf(B, 0, 4, P)}"/>`];
    out.push(`<g data-name="base">${ISO.tinted(ISO.T.wood, S(K.slabOf(B, 0, BZ, P, 4, 1.5), { tone: "mid" }))}`);
    for (const [x, y] of [[POST - 14, -14], [POST - 14, 14], [-44, -18], [28, -18], [PIV[0], -14]]) out.push(B08.screwHead(P, [x, y, BZ], 3));
    out.push("</g>");
    // the pillar and its arm over to the gong; the gong's stud and the gong itself
    out.push(`<g data-name="gong">${ISO.tinted(ISO.T.brass, S(K.cylinder(POST, 0, 13, BZ, 5, P, 28, 0.6), { tone: "mid" }))}${ISO.tinted(ISO.T.steel, S(K.cylinder(POST, 0, 7.5, BZ + 5, 233 - BZ - 5, P, 24), { tone: "mid", crease: "none" }))}` +
      ISO.tinted(ISO.T.steel, ISO.wbox(P, [POST - 9, 40], [-7, 7], [233, 245], "mid")) + B08.screwHead(P, [GONG[0], 0, 245], 3.5) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(GONG[0], 0, 5, 218, 15, P, 16), { tone: "mid", crease: "none" })) +
      ISO.tinted(ISO.T.brass, S(G.solidOf([[0, 62], [3, 62, 1], [16, 58, 1], [31, 45, 1], [41, 23, 1], [44.5, 0]], B08.Z(GONG), P), { tone: "hi" })) + "</g>");
    // the electromagnet: iron yoke, two bobbins (fibre cheeks, copper winding), iron pole tips
    out.push(`<g data-name="magnet">${ISO.tinted(B08.IRON, ISO.wbox(P, [-48, 32], [-14, 14], [BZ, BZ + 8], "mid"))}`);
    for (const x of COILS) {
      const z0 = BZ + 8;
      out.push(ISO.tinted(FIBRE, S(K.cylinder(x, 0, 19, z0, 3, P, 32), { tone: "mid" })),
        ISO.tinted(ISO.T.copper, S(K.cylinder(x, 0, 16.5, z0 + 3, 58, P, 32), { tone: "hi" }) + L(K.knurl(x, 0, 16.5, z0 + 3, z0 + 61, 22, P, 0.02), { tone: "lo" })),
        ISO.tinted(FIBRE, S(K.cylinder(x, 0, 19, z0 + 61, 3, P, 32), { tone: "mid" })), ISO.tinted(B08.IRON, S(K.cylinder(x, 0, 6, z0 + 64, 4, P, 18), { tone: "mid" })));
    }
    out.push("</g>");
    // the spring's post (brass block) under the pivot
    out.push(`<g data-name="hammer">${ISO.tinted(ISO.T.brass, ISO.wbox(P, [PIV[0] - 5, PIV[0] + 5], [-8, 8], [BZ, PIV[2] - 0.8], "hi"))}</g>`);
    return out.join("");
  }
  // what moves: the armature (iron), the spring strip, the hammer rod and ball, all rotating about the spring's root
  function hammerSvg(P, th) {
    const B08 = window.B08, R = (pts) => pts.map(([x, z]) => { const p = rot([x, 0, z], th); return [p[0], p[2]]; });
    const out = [ISO.prismY(P, R([[-44, 100], [22, 100], [22, 106], [-44, 106]]), -9, 9, ["#6f7379", "#a6a9ae"], "#c4c6ca", "#2b2e33")];
    out.push(ISO.prismY(P, R([[18, 104.2], [PIV[0] + 9, 104.2], [PIV[0] + 9, 105.8], [18, 105.8]]), -6, 6, ["#8d9096", "#c7c9cd"], "#d9dadd", "#3c3f45"));
    const a = rot([PIV[0] + 7, 0, 105.8], th), b = rot(BALL, th);
    out.push(`<path d="${K.segment(a, b, P)}" stroke="#3c3f45" stroke-width="${(G.scaleOf(P) * 4.4).toFixed(2)}" stroke-linecap="round"/><path d="${K.segment(a, b, P)}" stroke="#b6b9be" stroke-width="${(G.scaleOf(P) * 2.6).toFixed(2)}" stroke-linecap="round"/>`);
    out.push(ISO.tinted(ISO.T.steel, S(G.sphereOf(b, 12, P), { tone: "hi", lit: true })));
    return out.join("");
  }
  function frontSvg(P, lab) {
    const B08 = window.B08, out = [];
    // the clamp plate and screw that fix the spring to its post
    out.push(`<g data-name="hammer">${ISO.tinted(ISO.T.brass, ISO.wbox(P, [PIV[0] - 5, PIV[0] + 5], [-8, 8], [105.8, 108.5], "hi"))}${B08.screwHead(P, [PIV[0], 0, 108.5], 3)}</g>`);
    // the contact pillar beside the spring, its arm over it and the contact screw (lock nut, knurled head) down to it
    const cx = 40, out2 = [ISO.tinted(ISO.T.brass, S(K.cylinder(cx, 16, 7, BZ, 3, P, 20, 0.4), { tone: "mid" }) + S(K.cylinder(cx, 16, 4, BZ + 3, 116 - BZ - 3, P, 16), { tone: "hi", crease: "none" }) + ISO.wbox(P, [cx - 4, cx + 4], [-4, 20], [116, 121], "hi"))];
    out2.push(ISO.tinted(ISO.T.steel, S(K.cylinder(cx, 0, 1.6, 106, 10, P, 12), { tone: "mid", crease: "none" }) + S(K.cylinder(cx, 0, 4, 121, 3, P, 6), { tone: "hi" })),
      ISO.tinted(ISO.T.brass, S(K.cylinder(cx, 0, 5, 124, 6, P, 20), { tone: "hi" }) + L(K.knurl(cx, 0, 5, 124, 130, 14, P, 0.02), { tone: "lo" })));
    out.push(`<g data-name="contact">${out2.join("")}</g>`);
    // the wires on the base: terminal a → the near coil, the contact pillar → terminal b
    const ta = [-60, 32], tb = [52, 32];
    out.push(B08.wire(P, [[ta[0], ta[1], BZ + 1], [-40, 30, BZ + 1], [-28, 17, BZ + 9], [-28, 16.6, BZ + 14]], "#c0392b"));
    out.push(B08.wire(P, [[cx + 2, 22, BZ + 1], [46, 30, BZ + 1], [tb[0], tb[1], BZ + 1]], "#2a2b2f"));
    const A = B08.terminal(P, [ta[0], ta[1], BZ], ISO.T.brass, { r: 4, boss: false }), Bt = B08.terminal(P, [tb[0], tb[1], BZ], ISO.T.brass, { r: 4, boss: false });
    out.push(`<g data-name="terminals">${A.svg}${Bt.svg}</g>`);
    if (lab) out.push(CIRC.word(P, [BALL[0] + 14, 0, BALL[2]], "electric bell"));
    return { svg: out.join(""), a: [ta[0] / 10, ta[1] / 10, +(A.top / 10).toFixed(2)], b: [tb[0] / 10, tb[1] / 10, +(Bt.top / 10).toFixed(2)] };
  }

  ISO.add({
    name: "electricbell", title: "Electric bell (part)", compare: null,
    about: "An electric bell 18 × 10 × 25 cm: wooden base, two-coil electromagnet, a pillar holding a brass gong, a sprung iron armature with the hammer, and a contact screw that breaks the current each stroke; ring=1 the hammer strikes the gong about 7 times a second. anchors: a b gong",
    line: "electricbell cx cy k ring=0|1 lab=0 lit=base|magnet|gong|hammer|contact|terminals",
    demo: { line: "electricbell 480 440 14", script: [{ set: {}, hold: 1 }, { set: { ring: 1, lit: "hammer" }, hold: 2 }, { set: { lit: "magnet" }, hold: 1.2 }, { set: { lit: "contact" }, hold: 1.2 }, { set: { ring: 0, lit: "gong" }, hold: 1.2 }] },
    make([cx = 480, cy = 440, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const f = frontSvg(Pm, lab);
      g.innerHTML = backSvg(Pm) + `<g data-name="hammer" data-part="hammer"></g>` + f.svg;
      g.anchors = { a: f.a, b: f.b, gong: [GONG[0] / 10, 0, 22] };
      const el = g.querySelector('[data-part="hammer"]'), w = ISO.writer();
      const s = { ring: o.ring === "1", clock: 0, th: 0 };
      let lit = o.lit || "";
      const draw = () => { w.rebuild(el, s.th.toFixed(4), () => hammerSvg(Pm, s.th)); window.B08.light(w, g, lit); };
      g.set = (p) => {
        if (p.ring !== undefined) s.ring = String(p.ring) === "1";
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt, clock) => {
        s.clock = clock ?? s.clock + dt;
        const beat = (s.clock * 7) % 1;
        s.th = s.ring && !ISO.still() ? STRIKE * Math.max(0, Math.sin(beat * 2 * Math.PI)) ** 0.6 : 0;
        draw();
        return s.ring && !ISO.still();
      };
      g.readout = () => s.ring ? "current on · magnet pulls the armature, the hammer strikes the gong and the contact opens, about 7 strokes a second" : "no current · the spring holds the hammer 3 mm off the gong, the contact closed";
      draw();
      return g;
    },
  });
})();
