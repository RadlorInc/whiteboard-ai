// "slitslide cx cy k d=0.1..0.5 lab=0 lit=holder|slide|slits" — a PART (PARTS.md, batch 5): a double-slit slide in its
// holder, for the optical bench. Its origin is the top of a benchrider's post (place it at=rider.post): a steel socket
// slides over the post (thumbscrew toward +y), and on it an aluminium channel with two guide cheeks holds a 5 × 5 cm
// slide mount upright, square to x (the light runs along x). The mount's dark film window carries two slits 0.05 mm
// wide, 1 cm long, d mm apart (drawn 6× wider apart so two lines show; the number is true), their centre 3.5 cm over the post's top (13.5 cm over the rail with post=10, the bench's
// beam height); d is printed on the mount. set({ d }) swaps the slide: it lifts out of the channel, a slide with the new
// spacing goes in and drops back. Reused from doubleslit.js (its slide holder, slit width, d range). World units: 1 = 1 cm.
// anchors: slits (their centre) top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const ZC = 3.5, Z0 = 1.0, HW = 2.5, T = 0.08, LIFT = 6.5, SPREAD = 6;   // slits drawn 6× wider apart than true, to be seen   // slit centre, mount bottom, half width, mount half thickness
  const ALU = ISO.tint("#e4e7ea", ["#9aa1a8", "#adb3b9", "#bfc4c9", "#d0d4d8"], "#3f464d");
  const MOUNT = ISO.tint("#eceae4", ["#b9b6ad", "#c7c4bb", "#d4d1c9", "#e0ddd6"], "#5f5b52");
  const Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  // the socket over the post, its thumbscrew, the channel and the far (−y) guide cheek
  function holderBack(P) {
    const out = [];
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.75, -1.6, 2.2, P, 24, 0.08), { tone: "mid", inner: L(K.sideArc(0, 0, 0.75, -0.9, P, 16), { tone: "faint" }) })));
    out.push(ISO.tinted(ALU, ISO.wbox(P, [-0.32, 0.32], [-HW - 0.3, HW + 0.3], [0.6, Z0 + 0.35], "mid")));
    out.push(ISO.tinted(ALU, ISO.wbox(P, [-0.32, 0.32], [-HW - 0.3, -HW + 0.02], [Z0 + 0.35, 3.6], "mid")));
    return out.join("");
  }
  // the near guide cheek with its two rivets, and the thumbscrew that locks the socket on the post (both on +y)
  function holderFront(P) {
    const out = [ISO.tinted(ALU, ISO.wbox(P, [-0.32, 0.32], [HW - 0.02, HW + 0.3], [Z0 + 0.35, 3.6], "mid"))];
    out.push(D([[0, HW + 0.31, 1.9], [0, HW + 0.31, 3.1]].map((p) => K.iso(p, P)), { size: 0.4 }));
    out.push(D([[0.33, -1.8, 0.8], [0.33, 1.8, 0.8]].map((p) => K.iso(p, P)), { size: 0.4 }));
    const F = Y([0, 0, -0.7]);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0.74, 1.1, 0.18, F, P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(1.1, 1.55, 0.42, F, P), { tone: "hi", inner: L(G.ribsOf(F, 1.1, 1.55, 0.42, 12, P, { seams: true }), { tone: "lo" }) })));
    return out.join("");
  }
  // the slide: a 5 × 5 cm mount, its dark film window, the two slits, the printed spacing; lifted dz
  function slideSvg(P, d) {
    const x = T + 0.005, at = (y, z) => K.iso([x, y, z], P), out = [];
    out.push(ISO.tinted(MOUNT, ISO.wbox(P, [-T, T], [-HW, HW], [Z0, Z0 + 2 * HW], "mid")));
    const win = [[-1.8, ZC - 0.8], [1.8, ZC - 0.8], [1.8, ZC + 0.8], [-1.8, ZC + 0.8]];
    out.push(`<path d="${K.pathOf(win.map(([y, z]) => at(y, z)), true)}" fill="#1c1d20" stroke="#55534c" stroke-width="0.5"/>`);
    const sw = Math.max(0.45, G.scaleOf(P) * 0.012).toFixed(2), h = (d / 20) * SPREAD;
    out.push(`<path d="${K.pathOf([at(-h, ZC - 0.5), at(-h, ZC + 0.5)])}${K.pathOf([at(h, ZC - 0.5), at(h, ZC + 0.5)])}" stroke="#fff4d0" stroke-width="${sw}" stroke-linecap="butt" data-name="slits"/>`);
    out.push(window.LAB.faceText(P, [x + 0.01, 0, Z0 + 2 * HW - 0.75], [0, -1, 0], `d = ${d} mm`, 0.42, "#33506f"));
    out.push(window.LAB.faceText(P, [x + 0.01, 0, Z0 + 0.45], [0, -1, 0], "DOUBLE SLIT · a 0.05 mm", 0.26, "#6b6a64"));
    out.push(D([[-1.6, Z0 + 0.4], [1.6, Z0 + 0.4]].map(([y, z]) => at(y, z)), { size: 0.35 }));
    return out.join("");
  }

  ISO.add({
    name: "slitslide", title: "Double-slit slide (part)", compare: null,
    about: "A double-slit slide (5 × 5 cm mount, two 0.05 mm slits d mm apart) standing in its holder on an optical-bench rider's post, slits 3.5 cm over the post top; swap the slide to change the spacing. anchors: slits top",
    line: "slitslide cx cy k d=0.1..0.5 lab=0 lit=holder|slide|slits",
    demo: { line: "slitslide 480 380 42 d=0.25 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "slits" }, hold: 1.4 }, { set: { d: 0.15, lit: "slide" }, hold: "settle" }, { set: { d: 0.5, lit: "holder" }, hold: "settle" }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const dOf = (v) => Math.round(ISO.clamp(v, 0.1, 0.5) * 100) / 100;
      const st = { d: dOf(ISO.num(o, "d", 0.25)), want: 0, u: 0 };
      st.want = st.d;
      let lit = o.lit || "";
      g.innerHTML = `<g data-name="holder">${holderBack(P)}</g><g data-part="slide" data-name="slide"></g><g data-name="holder">${holderFront(P)}</g><g data-part="words"></g>`;
      g.anchors = { slits: [0, 0, ZC], top: [0, 0, Z0 + 2 * HW] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const dz = LIFT * ISO.ease(st.u);
        w.rebuild(el.slide, String(st.d), () => slideSvg(P, st.d));
        w.attr(el.slide, "transform", K.translateAlong(P, [0, 0, dz]));
        if (lab) w.rebuild(el.words, String(st.d), () => LAB.word(P, lab, [0, -HW - 0.4, ZC], `two slits, ${st.d} mm apart`, "#556", { anchor: "start" }) + LAB.word(P, lab, [0, HW + 0.4, 0.8], "holder", "#556", { anchor: "start", dy: 6 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.d !== undefined && Number.isFinite(+p.d)) st.want = dOf(+p.d);
        if (p.lit !== undefined) lit = p.lit;
      };
      // a swap: lift (u → 1), change the slide at the top, drop back (u → 0)
      let dir = 0;
      g.update = (dt) => {
        if (ISO.still()) { st.d = st.want; st.u = 0; dir = 0; draw(); return false; }
        if (st.want !== st.d && dir === 0) dir = 1;
        if (dir) {
          st.u = ISO.clamp(st.u + dir * dt / 0.7, 0, 1);
          if (st.u === 1) { st.d = st.want; dir = -1; }
          if (st.u === 0 && dir < 0) dir = st.want !== st.d ? 1 : 0;
        }
        draw();
        return dir !== 0;
      };
      g.readout = () => `double-slit slide · slits 0.05 mm wide, ${st.d} mm apart · centre 3.5 cm over the post (on the bench's beam)${st.u > 0 ? " · swapping the slide" : ""}`;
      draw();
      return g;
    },
  });
})();
