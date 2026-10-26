// "mirrormount cx cy k aim=+x|-x|+y|-y lab=0 lit=mirror|mount|knobs|post" — a PART (PARTS.md, batch 5): the fixed
// mirror of michelson.js in a kinematic mount on a post, its origin the table point under the post (place it on an
// opticaltable's `top`, ax= ay= on its 2.5 cm hole grid). A 25 mm silvered mirror in the mount's front plate, which a
// ball pivot and two springs hold off the back plate; two knurled adjusting screws through the back plate tip it
// (left–right and up–down). The mount (4 × 4 × 2 cm) sits on a 12 mm post in a post holder with a thumbscrew, on a
// slotted clamping fork. The mirror's centre is 13.5 cm over the foot (the library's beam height); aim = the way its
// face looks (light comes in against it and goes back the way it came). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const Z = 13.5, H = 2, B0 = -2.2, B1 = -1.4, F0 = -1.15, F1 = -0.45, MR = 1.27, POST_A = -1.8;
  const ANOD = ISO.tint("#4a4e55", ["#24272c", "#2d3036", "#363a40", "#41454c"], "#0f1012");
  const SILVER = ISO.tint("#f4f6f9", ["#a7adb6", "#bcc1c8", "#d0d4d9", "#e3e6ea"], "#3a3e44");

  function mountSvg(P, n) {
    const at = B20.frame(n, [-n[0] * POST_A, -n[1] * POST_A, 0]), out = [];
    const st = B20.stand(P, Z - H + 0.05, { fork: n });
    // a block under the back plate where the post screws in
    const items = [];
    const box = (a, b, z, tint, tone = "mid") => [at((a[0] + a[1]) / 2, 0, Z), ISO.tinted(tint, ISO.box(at, P, a, b, z, tone))];
    items.push(box([B0, B1], [-H, H], [Z - H, Z + H], ANOD));
    items.push(box([F0, F1], [-H + 0.25, H - 0.25], [Z - H + 0.25, Z + H - 0.25], ANOD, "hi"));
    // the ball pivot and two springs in the gap, at three corners
    const c3 = [[1.4, -1.4], [-0.2, -1.6], [-1.4, 1.4]];   // springs at the free corner and the bottom; the pivot ball at the top
    const gap = (b, z, r, tint) => { const F = G.frameAlong(at(B1, b, z), [n[0], n[1], 0]); return [at((B1 + F0) / 2, 0, Z), ISO.tinted(tint, S(G.disc(0, F0 - B1, r, F, P), { tone: "hi" }))]; };
    items.push(gap(c3[2][0], Z + c3[2][1], 0.24, ISO.T.steel), gap(c3[0][0], Z + c3[0][1], 0.2, ISO.T.copper), gap(c3[1][0], Z + c3[1][1], 0.2, ISO.T.copper));
    // the two adjusting screws: knob behind the back plate, its shank through it into the front plate
    for (const [b, z] of [[1.4, Z + 1.4], [-1.4, Z - 1.4]]) {
      const o = at(B0, b, z), d = [-n[0], -n[1], 0];
      items.push([at(B0 - 0.4, 0, Z), ISO.tinted(ISO.T.steel, S(G.disc(0, 0.5, 0.16, G.frameAlong(o, d), P), { tone: "mid" }))]);
      items.push([at(B0 - 1.0, 0, Z), `<g data-name="knobs">${B20.knob(P, o, d, 0.5, 1.4, 0.42, 14)}</g>`]);
    }
    // the mirror in its bore in the front plate, face toward n, a bright streak across it
    const Fm = G.frameAlong(at(F1 - 0.15, 0, Z), [n[0], n[1], 0]);
    items.push([at(F1 + 0.05, 0, Z), `<g data-name="mirror">${ISO.tinted(SILVER, S(G.disc(0, 0.3, MR, Fm, P), { tone: "hi", lit: true }))}` +
      `<path d="${K.pathOf([at(F1 + 0.16, -0.7, Z + 0.6), at(F1 + 0.16, 0.3, Z - 0.5)].map((p) => K.iso(p, P)))}" stroke="#fff" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.12).toFixed(2)}" stroke-linecap="round" opacity=".8" data-free=""/></g>`]);
    // the retaining ring's two screws on the front plate's face
    for (const [b, z] of [[1.6, Z + 1.6], [-1.6, Z - 1.6]]) items.push([at(F1 + 0.02, 0, Z), ISO.tinted(ISO.T.steel, S(G.disc(0, 0.08, 0.15, G.frameAlong(at(F1, b, z), [n[0], n[1], 0]), P), { tone: "hi" }))]);
    // painter's order across groups: sort everything, then wrap each piece in its group
    const all = items.map(([c, svg]) => [K.depthOf(c, P), svg.startsWith("<g data-name") ? svg : `<g data-name="mount">${svg}</g>`]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).join("");
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: -4.4, y: -1.4, w: 5.8, d: 2.8, r: 0.6 }, 0, 0.6, P)}"/>`);
    out.push(`<g data-name="post">${st.base}${st.holder}${st.thumb}${st.post}</g>`, all);
    return out.join("");
  }

  ISO.add({
    name: "mirrormount", title: "Mirror in a kinematic mount (part)", compare: null,
    about: "A 25 mm flat mirror in a kinematic mount (ball pivot, two springs, two adjusting screws) on a post and a clamping fork, its centre 13.5 cm up, facing aim; the fixed mirror of a Michelson interferometer. anchors: face",
    line: "mirrormount cx cy k aim=+x|-x|+y|-y lab=0 lit=mirror|mount|knobs|post",
    demo: { line: "mirrormount 480 420 22 aim=+x", script: [{ set: {}, hold: 1 }, { set: { lit: "mirror" }, hold: 1.2 }, { set: { lit: "knobs" }, hold: 1.2 }, { set: { aim: "-y", lit: "mount" }, hold: 1.2 }, { set: { aim: "+y", lit: "post" }, hold: 1.2 }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let aim = ["+x", "-x", "+y", "-y"].includes(o.aim) ? o.aim : "+x", lit = o.lit || "";
      const build = () => {
        const n = B20.aimOf(aim), f = [-n[0] * POST_A + n[0] * (F1 + 0.15), -n[1] * POST_A + n[1] * (F1 + 0.15)];
        g.innerHTML = mountSvg(P, n) + (lab ? window.LAB.word(P, lab, [f[0], f[1], Z + H + 1.2], "fixed mirror", "#556") : "");
        g.anchors = { face: [+f[0].toFixed(3), +f[1].toFixed(3), Z] };
        B20.light(w, g, lit);
      };
      g.set = (p) => {
        if (["+x", "-x", "+y", "-y"].includes(p.aim) && p.aim !== aim) { aim = p.aim; build(); }
        if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); }
      };
      g.update = () => false;
      g.readout = () => `fixed mirror, 25 mm, in a kinematic mount · centre 13.5 cm up, facing ${aim} · the two screws tip it a few milliradians to line the beam up`;
      build();
      return g;
    },
  });
})();
