// "screwjack cx cy k h=5..30 lab=0 lit=foot|sleeve|wheel|screw|cap" — a PART (PARTS.md): the screw post that props a
// hinged ramp at its angle, origin the bench point under its middle. A cast foot, a steel sleeve, a knurled thumb
// wheel (the nut) sitting on the sleeve, a 2 cm threaded screw (2 mm pitch) rising out of it and a domed swivel cap
// on top that the ramp's underside rests on; h = the cap's top above the bench (cm), eased: turning the wheel winds
// the screw up or down (the wheel turns 1/pitch times per mm, the screw does not turn). The screw is built once at its
// full length and slid up (a world move is a flat screen move), clipped where it enters the wheel. Reused from
// incline.js (its post), in mm; anchors in cm. set({ h }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RS = 10, PITCH = 2, ZW = 40, WH = 8, CAP = 6, LEN = 300;
  const zF = LAB.Z;

  ISO.add({
    name: "screwjack", title: "Screw post (part)", compare: null,
    about: "A screw post that props a ramp at its angle: cast foot, sleeve, knurled thumb wheel, a 2 cm threaded screw and a domed cap h cm above the bench (5 to 30); set h and the screw winds up or down as the wheel turns. anchors: top",
    line: "screwjack cx cy k h=5..30 lab=0 lit=foot|sleeve|wheel|screw|cap",
    demo: { line: "screwjack 480 440 14 h=8", script: [{ set: {}, hold: 1 }, { set: { h: 22, lit: "screw" }, hold: "settle" }, { set: { lit: "wheel" }, hold: 1.2 }, { set: { h: 12, lit: "cap" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lo = ZW + WH + CAP, clampH = (v) => ISO.clamp(v * 10, lo, LEN - 10);
      const st = { z: clampH(ISO.num(o, "h", 10)), lit: o.lit || "" }, want = { z: st.z }, w = ISO.writer(), clip = B17.id("sjc");
      const top0 = lo;   // the screw is drawn with its cap's top at the lowest h, then moved up by z − top0
      // foot and sleeve
      const foot = ISO.tinted(ISO.T.steel, S(G.lathe([[0, 0], [0, 28], [3, 28, 1], [6, 22, 1], [10, 15], [10, 0]], zF([0, 0, 0]), Pm, { steps: 36 }), { tone: "mid", inner: L(G.arcOf(zF([0, 0, 0]), 3, 28, Pm), { tone: "faint" }) })) +
        ISO.tinted(ISO.T.steel, [0, 1, 2, 3].map((i) => { const a = (i / 4) * 2 * Math.PI + 0.8; return [Math.cos(a) * 21, Math.sin(a) * 21]; }).map(([x, y]) => S(K.cylinder(x, y, 2.6, 4.2, 1.5, Pm, 12), { tone: "mid" })).join(""));
      const sleeve = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 13, 10, ZW - 10, Pm, 28), { tone: "hi" }) + S(K.cylinder(0, 0, 15, ZW - 3, 3, Pm, 28), { tone: "mid" }));
      // the thumb wheel: knurled rim, its top face; its knurl turns as the screw winds
      const wheelBody = ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 22, ZW, WH, Pm, 40), { tone: "mid" }));
      const knurl = (a) => L(G.ribsOf(zF([0, 0, 0]), ZW + 0.6, ZW + WH - 0.6, 22, 36, Pm, { phase: a, seams: true }), { tone: "lo" });
      // the screw from its foot (hidden in the sleeve) to the cap: shank with thread crests every pitch, the cap
      const s0 = top0 - CAP - LEN + ZW, s1 = top0 - CAP, crests = [];
      for (let z = s0 + PITCH; z < s1 - 0.5; z += PITCH) crests.push(G.arcOf(zF([0, 0, 0]), z, RS, Pm));
      const screw = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RS, s0, s1 - s0, Pm, 24), { tone: "hi", crease: "none", inner: L(crests.join(""), { tone: "faint" }) }));
      const cap = ISO.tinted(ISO.T.steel, S(G.lathe([[s1 - 0.01, 0], [s1 - 0.01, 14], [s1 + 2, 14], [s1 + CAP - 1.5, 11, 1], [s1 + CAP, 0]], zF([0, 0, 0]), Pm, { steps: 28 }), { tone: "mid" }));
      // clip: above the wheel's top face (its near half-ellipse at the screw's radius, then straight up)
      const ring = Array.from({ length: 48 }, (_, i) => K.iso([Math.cos((i / 48) * 2 * Math.PI) * (RS + 0.2), Math.sin((i / 48) * 2 * Math.PI) * (RS + 0.2), ZW + WH], Pm));
      const lowY = Math.max(...ring.map((p) => p[1])), l = Math.min(...ring.map((p) => p[0])) - 2, r = Math.max(...ring.map((p) => p[0])) + 2;
      // the screw's visible bottom edge is the near half of that ring: keep everything above it
      const near = ring.filter((p) => p[1] >= (lowY + Math.min(...ring.map((q) => q[1]))) / 2).sort((a, b) => a[0] - b[0]);
      const m = r - l, clipD = `M${l - m} ${near[0][1]}L${near.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}L${r + m} ${near[near.length - 1][1]}L${r + m} -9999L${l - m} -9999Z`;
      g.innerHTML = `<defs><clipPath id="${clip}"><path d="${clipD}"/></clipPath></defs><path class="iso-halo" d="${K.haloOf({ x: -28, y: -28, w: 56, d: 56, r: 28 }, 0, 4, Pm)}"/>` +
        `<g data-name="foot">${foot}</g><g data-name="sleeve">${sleeve}</g><g data-name="wheel">${wheelBody}<g data-part="knurl"></g></g>` +
        `<g clip-path="url(#${clip})"><g data-part="slide"><g data-name="screw">${screw}</g><g data-name="cap">${cap}</g></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      const draw = () => {
        const zq = Math.round(st.z * 4) / 4;
        w.attr(el.slide, "transform", B17.move(Pm, [0, 0, zq - top0]));
        w.rebuild(el.knurl, String(zq), () => knurl((zq / PITCH) * 2 * Math.PI));
        if (lab) w.rebuild(el.words, String(zq), () => ISO.word(K.iso([0, 0, zq + 14], Pm), `screw post ${(zq / 10).toFixed(1)} cm`, "#445", { size: 13 }));
        g.anchors = { top: [0, 0, +(st.z / 10).toFixed(3)] };
        B17.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.h !== undefined && Number.isFinite(+p.h)) want.z = clampH(+p.h);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.z = ISO.follow(st.z, want.z, dt, 0.6, ISO.still());
        if (Math.abs(st.z - want.z) < 0.05) st.z = want.z;
        draw();
        return st.z !== want.z;
      };
      g.readout = () => `screw post, cap ${(st.z / 10).toFixed(1)} cm above the bench · 2 mm thread: the wheel turns ${((st.z - lo) / PITCH).toFixed(0)} times from the bottom`;
      draw();
      return g;
    },
  });
})();
