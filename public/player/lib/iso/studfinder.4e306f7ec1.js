// "studfinder cx cy width scan=1 at=x lab=1 lit=…" — a stud wall cut open, and a stud finder on the drywall.
// Three 2×4 studs (1½" × 3½", 3.8 × 8.9 cm) stand on a bottom plate at 16" (40.6 cm) centres; ½" drywall covers
// the upper part, cut away below so the studs show, with its screws in rows over each stud. The stud finder sits on
// the drywall: eight LEDs over eight sensor pads light where a pad is over wood (denser than the hollow between
// studs), and the arrow on top lights when the stud's centre is under it. scan=1 slides it back and forth;
// set({ at }) parks it at x cm. A tape lies on the floor with its 16" marks under the studs.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const OC = 40.64, STUD = { w: 3.8, d: 8.9 }, STUDS = [-OC, 0, OC], DW = 1.27;
  const X0 = -50, X1 = 50, TOPZ = 70, CUT = 30, PLATE = 3.8;
  const BODY = { w: 15, h: 7.5, d: 3 }, FZ = 52, LEDS = 8, PITCH = 1.45;
  const GREEN = "#38b24a", OFF = "#c9cdd2";
  const ledX = (i) => (i - (LEDS - 1) / 2) * PITCH;

  function wallSvg(P, lab) {
    const out = [], at3 = (p) => K.iso(p, P);
    const floor = { x: X0 - 4, y: -14, w: X1 - X0 + 8, d: 34, r: 2 };
    out.push(`<path class="iso-halo" d="${K.haloOf(floor, -3, 3, P)}"/>`, S(K.slabOf(floor, -3, 3, P, 3, 0.6), { tone: "lo" }));
    // Bottom plate, then the studs on it, with a cable run through holes bored in the middle of the studs: each run
    // comes out of one stud's near face and goes into the next stud's far face, so it is drawn between the two.
    const holeZ = 17, holeY = -STUD.d / 2, wood = (svg) => ISO.tinted(ISO.T.wood, svg);
    const edges = [X0, ...STUDS.flatMap((x) => [x - STUD.w / 2, x + STUD.w / 2]), X1];
    const run = (i) => ISO.tinted(ISO.T.amber, S(G.disc(0, edges[2 * i + 1] - edges[2 * i], 0.65, G.frameOf([edges[2 * i], holeY, holeZ], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));
    out.push(wood(ISO.wbox(P, [X0, X1], [-STUD.d, 0], [0, PLATE], "mid")), run(0));
    STUDS.forEach((x, i) => {
      // End grain on the cut top: a growth ring, closed so it ends on nothing.
      out.push(wood(`<g data-name="stud">${ISO.wbox(P, [x - STUD.w / 2, x + STUD.w / 2], [-STUD.d, 0], [PLATE, TOPZ], "mid")}</g>` + L(K.planOutline({ x: x - 1.2, y: -STUD.d + 2, w: 2.4, d: 4.9, r: 1.1 }, TOPZ, P, 4), { tone: "faint" })));
      out.push(L(K.sideRing([x + STUD.w / 2 + 0.01, holeY, holeZ], 0.85, "x", P, 14), { tone: "lo" }), run(i + 1));
    });
    out.push(D([X0 + 2, X1 - 2].map((x) => at3([x, -STUD.d / 2, PLATE])), { size: 0.5 }));
    // Drywall over the upper part, its lower edge cut away; screws in a column over each stud, every 30 cm.
    out.push(`<g data-name="drywall">${ISO.wbox(P, [X0, X1], [0, DW], [CUT, TOPZ], "mid")}</g>`);
    // Two sheets meet on the middle stud: the joint is taped and the tape bedded in compound.
    out.push(ISO.wbox(P, [-2.6, 2.6], [DW, DW + 0.1], [CUT, TOPZ], "lo"));
    // An outlet beside the left stud: cover plate, two receptacles and the plate screw.
    out.push(ISO.wbox(P, [-37.6, -31.4], [DW, DW + 0.4], [33, 44], "mid"));
    for (const z of [35.2, 39.6]) out.push(ISO.wbox(P, [-36.2, -32.8], [DW + 0.4, DW + 0.8], [z, z + 2.8], "mid"));
    out.push(D([at3([-34.5, DW + 0.4, 38.8])], { size: 0.45 }));
    const screws = [];
    for (const x of STUDS) for (const z of [CUT + 5, CUT + 35]) for (const dx of x ? [0] : [-1.2, 1.2]) screws.push([x + dx, DW + (x ? 0 : 0.1), z]);
    out.push(L(screws.map((p) => K.sideRing(p, 0.55, "y", P, 12)).join(""), { tone: "lo" }), D(screws.map(at3), { size: 0.45, tone: "mid" }));
    // A tape on the floor along the wall, hooked so 0 is under the left stud: inch ticks, a major every 16".
    const tape = { x: X0, y: 4, w: X1 - X0, d: 3.2, r: 0.4 };
    out.push(ISO.tinted(ISO.T.amber, S(K.slabOf(tape, 0, 0.3, P, 2), { tone: "mid", crease: "none" })));
    const minor = [], major = [];
    for (let i = -4; i <= 36; i++) { const x = -OC + i * 2.54; if (x < X0 + 1 || x > X1 - 1) continue; const big = i % 16 === 0; (big ? major : minor).push(K.lineOnTop([x, tape.y + 0.05], [x, tape.y + (big ? 2.2 : 1)], 0.3, P)); }
    out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "hi" }));
    if (lab) {
      out.push(ISO.word(at3([OC, 0, CUT / 2]), "Stud", "#7a5a2e", { size: 13, dy: 4 }));
      out.push(ISO.word(at3([X0, DW, TOPZ - 10]), "Drywall", "#444", { anchor: "end", size: 13, dy: 0 }));
      out.push(ISO.word(at3([OC / 2, tape.y + tape.d, 0]), "16 in (40.6 cm) apart", "#444", { size: 12, dy: 16 }));
    }
    return out.join("");
  }
  // The finder built at x = 0; the group is moved along x. LEDs and the arrow are recoloured, never rebuilt.
  function finderSvg(P, lab) {
    const y0 = DW, y1 = DW + BODY.d, z0 = FZ - BODY.h / 2, z1 = FZ + BODY.h / 2, out = [];
    const body = { x: -BODY.w / 2, y: y0, w: BODY.w, d: BODY.d, r: 1.2 };
    out.push(`<g data-name="finder">${S(K.slabOf(body, z0, BODY.h, P, 5, 0.6), { tone: "hi", inner: L(K.sideSeam(body, z0 + 1.6, P, 5), { tone: "faint" }) })}`);
    // Grip pads on the ends, the dark LED window and the scan button.
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-BODY.w / 2 + 0.4, -BODY.w / 2 + 2.2], [y1, y1 + 0.3], [z0 + 1.8, z1 - 0.8], "mid") + ISO.wbox(P, [BODY.w / 2 - 2.2, BODY.w / 2 - 0.4], [y1, y1 + 0.3], [z0 + 1.8, z1 - 0.8], "mid") +
      ISO.wbox(P, [-6, 6], [y1, y1 + 0.2], [FZ + 0.2, FZ + 2.6], "mid")));
    out.push(S(K.cylinder(0, y1 - 1.4, 1, z1, 0.6, P, 16), { tone: "mid" }));
    const led = [];
    for (let i = 0; i < LEDS; i++) { const c = K.iso([ledX(i), y1 + 0.25, FZ + 1.4], P); led.push(`<circle data-led="${i}" cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="1.5" fill="${OFF}" stroke="#1d2024" stroke-width="0.4"/>`); }
    out.push(led.join(""));
    // The centre arrow on the top face.
    const tri = [[-1, y0 + 0.4], [1, y0 + 0.4], [0, y0 + 1.9]].map(([x, y]) => K.iso([x, y, z1 + 0.02], P));
    out.push(`<path data-arrow d="${K.pathOf(tri, true)}" fill="${OFF}" stroke="#1d2024" stroke-width="0.4"/>`);
    out.push(`</g>`);
    if (lab) out.push(ISO.word(K.iso([0, y1, z0], P), "Stud finder", "#444", { size: 13, dy: 18 }));
    return out.join("");
  }

  ISO.add({
    name: "studfinder", title: "Stud finder", compare: "studfinder 480 270 240 scan=1",
    about: "A stud wall cut open (2×4 studs at 16 in centres behind ½ in drywall) and a stud finder whose LEDs light over the wood as it slides.",
    line: "studfinder cx cy width scan=1 at=x lab=1 lit=finder|stud|drywall",
    demo: { line: "studfinder 480 270 240 scan=1", script: [{ set: { scan: 1 }, hold: 7 }, { set: { scan: 0, at: 0 }, hold: "settle" }, { set: { at: OC, lit: "stud" }, hold: "settle" }] },
    make([cx, cy, width = 240], o, t, parent) {
      const lab = o.lab !== "0", W = width * 2.6, H = width * 1.6;
      const { P, g } = ISO.frame([[X0 - 4, -14, -3], [X1 + 4, -14, -3], [X0 - 4, 20, -3], [X1 + 4, 20, -3], [X0, -STUD.d, TOPZ], [X1, -STUD.d, TOPZ], [X0, DW, TOPZ]], cx, cy, W, H, { azimuth: 74, elevation: 20 }, parent);
      g.innerHTML = `<g>${wallSvg(P, lab)}</g><g data-part="finder">${finderSvg(P, lab)}</g>`;
      const fg = g.querySelector('[data-part="finder"]'), leds = [...g.querySelectorAll("[data-led]")], arrow = g.querySelector("[data-arrow]"), w = ISO.writer();
      const parts = [...g.querySelectorAll("[data-name]")];
      const s = { x: ISO.clamp(ISO.num(o, "at", -50), X0 + 9, X1 - 9), target: 0, scan: o.scan === "1", dir: 1, clock: 0, lit: o.lit || "finder" };
      s.target = s.x;
      const nearest = (x) => STUDS.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));
      const draw = () => {
        w.attr(fg, "transform", K.translateAlong(P, [s.x, 0, 0]));
        // A pad reads "stud" when its centre is over wood; the arrow lights within 6 mm of the stud's centre line.
        leds.forEach((e, i) => { const over = STUDS.some((sx) => Math.abs(s.x + ledX(i) - sx) <= STUD.w / 2); w.attr(e, "fill", over ? GREEN : OFF); });
        w.attr(arrow, "fill", Math.abs(s.x - nearest(s.x)) < 0.6 ? GREEN : OFF);
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.set = (p) => {
        if (p.scan !== undefined) s.scan = !!+p.scan;
        if (p.at !== undefined) s.target = ISO.clamp(+p.at, X0 + 9, X1 - 9);
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        if (s.scan && !ISO.still()) {
          // Slid by hand at about 10 cm/s, turning at the ends of the wall.
          s.x += s.dir * 10 * dt;
          if (s.x > X1 - 9) { s.x = X1 - 9; s.dir = -1; }
          if (s.x < X0 + 9) { s.x = X0 + 9; s.dir = 1; }
          s.target = s.x;
        } else s.x = ISO.follow(s.x, s.target, dt, 0.5, ISO.still());
        draw();
        return !s.scan && s.x !== s.target;
      };
      g.readout = () => {
        const n = nearest(s.x), off = s.x - n, lit = leds.filter((e) => e.getAttribute("fill") === GREEN).length;
        if (Math.abs(off) < 0.6) return `stud centre found at ${((n + OC) / 2.54).toFixed(0)} in on the tape · studs are 16 in (40.6 cm) apart`;
        if (lit) return `${lit} of 8 pads over wood · stud is ${off > 0 ? "left" : "right"} by ${Math.abs(off).toFixed(1)} cm`;
        return `hollow behind the drywall · next stud ${Math.abs(off).toFixed(0)} cm ${off > 0 ? "left" : "right"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
