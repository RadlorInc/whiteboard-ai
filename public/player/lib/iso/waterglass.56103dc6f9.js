// "waterglass cx cy height level=0-100 lab=1 lit=glass|water|jug|bubbles" — a glass tumbler of water on a coaster.
// A 340 ml tumbler (31 mm radius at the foot, 38 at the rim, 118 mm tall, a 9 mm heavy base, 2.4 mm walls) on a cork
// coaster on a wooden table, the water inside with its flat surface and bubbles clinging to the wall, and a glass jug
// with a hinged lid and a handle beside it. set({ level }) to a higher level: the jug lifts, tips over the glass and
// pours a stream until the water reaches the level, then goes back; a lower level just drops (someone drank it).
// The readout's millilitres come from the frustum the water fills. World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const TOP = { x: -120, y: -96, w: 240, d: 176, r: 8 };
  const H = 118, R0 = 31, R1 = 38, WALL = 2.4, BASE = 9, FULL = H - 6;          // FULL: brim line 6 mm under the rim
  const rOut = (s) => R0 + ((R1 - R0) * s) / H, rIn = (s) => rOut(s) - WALL;
  const zOf = (lv) => BASE + ((FULL - BASE) * lv) / 100;
  const mlOf = (lv) => { const h = zOf(lv) - BASE, a = rIn(BASE), b = rIn(BASE + h); return (Math.PI / 3) * h * (a * a + a * b + b * b) / 1000; };
  const GZ = 3;                                                            // the glass stands on the coaster
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const GLASS = ISO.T.glass, WATER = ISO.tint("#cfe6f8", ["#7fb2dd", "#8fbee3", "#a2cbe9", "#b6d7ef"], "#2f6a9c");
  const JUGT = ISO.tint("#f1f7fb", ["#b9cfdd", "#c7d9e5", "#d5e3ec", "#e2ecf2"], "#4d6f86");
  // bubbles stuck to the inside of the wall: (angle, height, radius); only the front half shows through the glass
  const BUB = [[0.5, 16, 1.6], [0.9, 30, 1.2], [1.25, 22, 1.9], [1.6, 44, 1.3], [1.95, 18, 1.1], [2.3, 36, 1.7], [0.7, 58, 1.2], [1.4, 70, 1.5], [2.0, 62, 1.0], [1.1, 84, 1.3], [1.8, 92, 1.1], [0.3, 40, 1.0]];
  // the jug: standing at J0, axis up; pouring, its spout tip sits over the glass's far side
  const J0 = [88, -52, 1.2], JH = 128, JR = (s) => (s < 10 ? 30 + s * 0.3 : s < 80 ? 33 - ((s - 10) / 70) ** 2 * 2 : 31 - ((s - 80) / 48) * 5);
  const TIPL = [36, JH + 2], TILT = (78 * Math.PI) / 180;
  const D = G.unit3([J0[0], J0[1], 0]);                                    // from the glass toward the jug
  const SIDE = G.unit3(G.cross3([0, 0, 1], D));
  // the jug's frame at pose p (0 standing … 1 pouring): tilt about SIDE, base moved so the tip ends over the glass
  const jugFrame = (p) => {
    const e = ISO.ease(p), th = TILT * ISO.smooth(0.25, 1, p), a = G.add3(G.mul3([0, 0, 1], Math.cos(th)), G.mul3(D, -Math.sin(th)));
    const u = G.add3(G.mul3(D, -Math.cos(th)), G.mul3([0, 0, 1], -Math.sin(th)));
    const target = G.add3(G.mul3(D, 14), [0, 0, GZ + H + 16]);
    const pourBase = G.sub3(G.sub3(target, G.mul3(u, TIPL[0])), G.mul3(a, TIPL[1]));
    const base = G.add3(G.lerp3(J0, pourBase, e), [0, 0, Math.sin(Math.PI * Math.min(1, p * 1.4)) * 30]);
    return { F: G.frameOf(base, a, u, G.cross3(a, u)), tip: G.add3(G.add3(base, G.mul3(u, TIPL[0])), G.mul3(a, TIPL[1])) };
  };

  function tableSvg(P) {
    return `<path class="iso-halo" d="${K.haloOf(TOP, -12, 12, P)}"/>` + ISO.tinted(ISO.T.wood, S(K.slabOf(TOP, -12, 12, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(TOP, -6, P, 8), { tone: "faint" }) })) +
      L(K.planOutline(K.insetPlan(TOP, 5), 0, P), { tone: "faint" }) +
      // the cork coaster with its pressed rim ring
      ISO.tinted(ISO.T.wood, S(K.cylinder(0, 0, 47, 0, GZ, P, 64, 0.6), { tone: "lo", inner: "" })) + L(K.ring(0, 0, 42, GZ, P, 64), { tone: "faint" }) +
      // a folded napkin under where the jug stands
      ISO.tinted(ISO.T.paint, ISO.wbox(P, [J0[0] - 36, J0[0] + 36], [J0[1] - 36, J0[1] + 36], [0, 1.2], "lo")) + L(K.lineOnTop([J0[0] - 36, J0[1] + 24], [J0[0] + 36, J0[1] + 24], 1.2, P), { tone: "faint" });
  }
  // The glass: outer body (glass tint), the water in it, then the rim; the water is drawn over the glass because the
  // glass is clear and the water shows through its front wall.
  function bodySvg(P) {
    const F = zAx([0, 0, GZ]);
    return ISO.tinted(GLASS, S(G.lathe([[0, 0], [0, R0 - 1.4], [1.4, R0, 1], [H, R1], [H, 0]], F, P, { steps: 72 }), { tone: "hi" })) +
      // the heavy base: its inner floor seen through the side
      `<path d="${G.circleOf(F, BASE, rIn(BASE), P)}" fill="#e3eef6" stroke="#7d9db3" stroke-width=".6"/>`;
  }
  // The water: one full-height body built once, clipped on screen to what lies under the surface at this level
  // (the surface ellipse and everything below its front arc), with the surface drawn over it.
  let clipN = 0;
  function waterBody(P, id) {
    const F = zAx([0, 0, GZ]);
    // (audit: this body is inside the glass's lathe on purpose: water seen through a clear wall)
    return `<clipPath id="${id}"><path/><path/></clipPath><g clip-path="url(#${id})">` + ISO.tinted(WATER, S(G.lathe([[BASE, 0], [BASE, rIn(BASE)], [FULL, rIn(FULL)], [FULL, 0]], F, P, { steps: 64 }), { tone: "hi" })) + "</g><path/><path/>";
  }
  function waterSet(P, el, level) {
    const z = zOf(level), r = rIn(z), ring = Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * Math.PI * 2; return K.iso([Math.cos(a) * r, Math.sin(a) * r, GZ + z], P); });
    let lo = 0, hi = 0;
    ring.forEach((p, i) => { if (p[0] < ring[lo][0]) lo = i; if (p[0] > ring[hi][0]) hi = i; });
    const arc = [];                                                         // the front arc: from lo to hi through the lower side
    const dir = ring[(lo + 1) % 64][1] > ring[(lo + 63) % 64][1] ? 1 : -1;
    for (let i = lo; ; i = (i + dir + 64) % 64) { arc.push(ring[i]); if (i === hi) break; }
    const down = 2000, d = K.pathOf([...arc, [ring[hi][0], ring[hi][1] + down], [ring[lo][0], ring[lo][1] + down]], true), e = K.pathOf(ring, true);
    const [c1, c2] = el.querySelectorAll("clipPath path"), body = el.querySelector("g[clip-path]"), [top, glint] = el.querySelectorAll(":scope > path");
    const on = level > 0.3;
    c1.setAttribute("d", on ? d : ""); c2.setAttribute("d", on ? e : "");
    top.setAttribute("d", on ? e : ""); top.setAttribute("fill", "#b9d8f0"); top.setAttribute("stroke", "#2f6a9c"); top.setAttribute("stroke-width", ".8");
    glint.setAttribute("d", on ? G.circleOf(zAx([0, 0, GZ]), z + 0.05, r - 1.6, P, 48) : ""); glint.setAttribute("fill", "none"); glint.setAttribute("stroke", "#f4f9fd"); glint.setAttribute("stroke-width", "1.1");
    body.style.visibility = on ? "" : "hidden";
  }
  // Ripples where the stream lands, and the bubbles.
  function fizzSvg(P, level, t, pouring) {
    const out = [], z = zOf(level);
    {
      if (pouring) for (let i = 0; i < 3; i++) { const f = (t * 1.6 + i / 3) % 1, c = G.add3([0, 0, GZ + z + 0.1], G.mul3(D, 14)); out.push(`<path d="${G.circleOf(zAx(c), 0, 2 + f * 16, P, 32)}" fill="none" stroke="#5f93bf" stroke-width="${(0.9 * (1 - f)).toFixed(2)}" opacity="${(1 - f).toFixed(2)}"/>`); }
    }
    // bubbles on the front of the inner wall, under the surface; rising ones while it pours
    const k = K.cameraOf(P).k, bub = [];
    const V = G.viewOf(P);
    for (const [a0, s, r] of BUB) {
      const a = Math.atan2(V[1], V[0]) - 1.2 + a0;
      if (BASE + s + r > z - 1) continue;
      const p = K.iso([Math.cos(a) * (rIn(BASE + s) - r), Math.sin(a) * (rIn(BASE + s) - r), GZ + BASE + s], P);
      bub.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r * k).toFixed(2)}"/>`);
    }
    if (pouring) for (let i = 0; i < 8; i++) {
      const f = (t * 0.9 + i / 8) % 1, s = BASE + 4 + f * (z - BASE - 6), a = Math.atan2(D[1], D[0]) + Math.sin(i * 2.1) * 0.5, rr = 8 + (i % 3) * 5;
      const p = K.iso([Math.cos(a) * rr, Math.sin(a) * rr, GZ + s], P);
      bub.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${((0.7 + f) * k).toFixed(2)}"/>`);
    }
    out.push(`<g data-name="bubbles" fill="#f6fafd" stroke="#4f86b4" stroke-width=".5">${bub.join("")}</g>`);
    return out.join("");
  }
  // The rim's band and the front wall's highlights (closed slivers, so no line stops in mid-air).
  function rimSvg(P) {
    const F = zAx([0, 0, GZ]), V = G.viewOf(P), a = Math.atan2(V[1], V[0]);
    const sliver = (da, w, s0, s1) => K.pathOf([[da - w, s0], [da + w, s0], [da + w * 0.6, s1], [da - w * 0.6, s1]].map(([d, s]) => K.iso([Math.cos(a + d) * (rOut(s) + 0.1), Math.sin(a + d) * (rOut(s) + 0.1), GZ + s], P)), true);
    // the rim: its outer and inner edges (open at the top, so the stream shows going in)
    return `<path d="${G.circleOf(F, H, R1, P, 72)}" fill="none" stroke="#5d7f96" stroke-width="1"/><path d="${G.circleOf(F, H, R1 - WALL, P, 72)}" fill="none" stroke="#7d9db3" stroke-width=".7"/>` +
      `<path d="${sliver(-0.55, 0.07, 14, H - 10) + sliver(-0.36, 0.025, 20, H - 18)}" fill="#ffffff" opacity=".85"/>` +
      `<path d="${sliver(0.62, 0.05, 10, H - 6)}" fill="#ffffff" opacity=".55"/>`;
  }
  // (audit: the lid knob sits on the jug's lid, a DAILY.prism the audit does not record, so it reads as "loose".)
  // The jug in its frame: a glass body, a pinched spout, a hinged lid with a knob, and the handle on the back.
  function jugSvg(P, F) {
    const at = (u, s, v = 0) => G.add3(G.add3(G.add3(F.o, G.mul3(F.u, u)), G.mul3(F.a, s)), G.mul3(F.v, v));
    const out = [], back = G.dot3(F.u, G.viewOf(P)) > 0;             // the handle side is away from the viewer?
    const handle = () => {
      const pts = DAILY.bez([-29, 108], [-62, 110], [-62, 34], [-29, 36], 18);
      return DAILY.prism(P, F, DAILY.band(pts, 7), -6, 6, ["#a9c1d1", "#eef5f9"], "#dce8f0", "#4d6f86");
    };
    if (back) out.push(handle());
    // a rounded-square body (cheap to rebuild as it tips: prisms, not turned solids), its foot a shade darker
    const Fb = G.frameOf(F.o, F.v, F.u, F.a), body = DAILY.rrect(-30, -27, 30, 27, 13, 5), foot = DAILY.rrect(-29, -26, 29, 26, 12, 5);
    out.push(DAILY.prism(P, Fb, foot, 0, 4, ["#93aec0", "#d6e4ee"], "#c9dbe7", "#4d6f86"));
    out.push(DAILY.prism(P, Fb, body, 4, JH, ["#a9c1d1", "#f1f7fb"], "#e2ecf2", "#4d6f86"));
    // fill marks on the side that faces the glass: the litre lines, closed slots so they end on themselves
    if (G.dot3(F.u, G.viewOf(P)) > 0) out.push(`<path d="${[40, 70, 100].map((h, i) => K.pathOf([[-9, h - 0.7], [i === 1 ? 4 : 9, h - 0.7], [i === 1 ? 4 : 9, h + 0.7], [-9, h + 0.7]].map(([v, ss]) => K.iso(at(30.1, ss, v), P)), true)).join("")}" fill="#7d9db3"/>`);
    // the spout: a lip pulled out of the rim toward +u
    out.push(DAILY.prism(P, F, [[24, JH - 18], [31, JH - 7], [38.5, JH + 1.2], [38, JH + 3], [25, JH + 1.5], [23, JH]], -8, 8, ["#a9c1d1", "#eef5f9"], "#dce8f0", "#4d6f86"));
    // lid: a disc hinged at the back, with a knob
    out.push(DAILY.prism(P, Fb, DAILY.rrect(-27, -25, 22, 25, 11, 4), JH, JH + 3, ["#93aec0", "#d6e4ee"], "#dce8f0", "#4d6f86"));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(JH + 3, JH + 5, 3, G.frameOf(at(-2, 0), F.a, F.u, F.v), P, { steps: 16 }), { tone: "mid" }) + S(G.disc(JH + 5, JH + 8, 5, G.frameOf(at(-2, 0), F.a, F.u, F.v), P, { steps: 20 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-7, 7, 2.2, G.frameOf(at(-29.4, JH + 1.5), F.v, F.u, F.a), P, { steps: 16 }), { tone: "mid" })));
    if (!back) out.push(handle());
    return out.join("");
  }

  ISO.add({
    name: "waterglass", title: "Glass of water", compare: "waterglass 480 270 240 level=70",
    about: "A glass tumbler of water on a coaster: set a higher level and the jug tips and pours until the water reaches it; the millilitres are the glass's real volume.",
    line: "waterglass cx cy height level=0-100 lab=1 lit=glass|water|jug|bubbles",
    demo: { line: "waterglass 480 270 300 level=25", script: [{ set: {}, hold: 1 }, { set: { level: 75 }, hold: "settle" }, { set: { level: 40 }, hold: "settle" }] },
    make([cx, cy, size = 240], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.4, Hh = size * 1.55;
      const pour = jugFrame(1);
      const { P, g } = ISO.frame([...K.boxCorners(TOP, -12, 0), [0, 0, GZ + H + 70], pour.F.o, G.add3(pour.F.o, G.mul3(pour.F.a, JH + 10)), [J0[0], J0[1], JH + 10]], cx, cy, W, Hh, { azimuth: 38, elevation: 24 }, parent);
      g.innerHTML = `<g>${tableSvg(P)}</g><g data-k="jugback"></g><g data-name="glass">${bodySvg(P)}</g><g data-name="water">${waterBody(P, `wg-water-${++clipN}`)}</g><g data-k="fizz"></g><g data-k="stream"></g><g data-k="rim">${rimSvg(P)}</g><g data-name="jug"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = { jugback: q("jugback"), glass: q("glass"), water: q("water"), fizz: q("fizz"), stream: q("stream"), rim: q("rim"), jug: q("jug"), words: q("words") }, w = ISO.writer();
      const lv0 = ISO.clamp(ISO.num(o, "level", 70), 0, 100);
      const memo = DAILY.memo();
      const s = { level: lv0, want: lv0, jug: 0, t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const pouring = s.jug > 0.98 && s.level < s.want - 0.05, J = jugFrame(s.jug), behind = s.jug < 0.3;
        if (el.water._lv !== s.level) { el.water._lv = s.level; waterSet(P, el.water, s.level); }
        w.rebuild(el.fizz, pouring ? `p${s.level.toFixed(1)} ${(s.t % 30).toFixed(2)}` : s.level.toFixed(1), () => fizzSvg(P, s.level, s.t, pouring));
        const jk = (Math.round(s.jug * 50) / 50).toFixed(2), jug = () => memo(jk, () => jugSvg(P, jugFrame(+jk).F));
        w.rebuild(el.jugback, behind ? jk : "", () => (behind ? jug() : ""));
        w.rebuild(el.jug, behind ? "" : jk, () => (behind ? "" : jug()));
        w.rebuild(el.stream, pouring ? (s.t % 30).toFixed(2) + s.level.toFixed(1) : "", () => {
          if (!pouring) return "";
          const a = K.iso(J.tip, P), b = K.iso([J.tip[0], J.tip[1], GZ + zOf(s.level)], P), k = K.cameraOf(P).k, wob = Math.sin(s.t * 23) * 0.4 * k;
          const d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${(a[0] + wob).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
          return `<path d="${d}" fill="none" stroke="#3f7fb5" stroke-width="${(4.6 * k).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#bcdaf1" stroke-width="${(2.4 * k).toFixed(2)}" stroke-linecap="round"/>`;
        });
        const ml = Math.round(mlOf(s.level) / 5) * 5;
        w.rebuild(el.words, lab ? `${ml} ${s.jug > 0.02}` : "", () => !lab ? "" : [
          s.level > 3 ? ISO.word(K.iso([-rOut(zOf(s.level)) * 0.7, rOut(zOf(s.level)) * 0.7, GZ + zOf(s.level)], P), `water · ${ml} ml`, "#1f4f8f", { anchor: "end", size: 15, dy: 5 }) : "",
          ISO.word(K.iso([-R1 * 0.7, R1 * 0.7, GZ + H - 20], P), "glass", "#444", { anchor: "end", size: 14, dy: -4 }),
          s.jug < 0.02 ? ISO.word(K.iso([J0[0] + 30, J0[1] + 30, 40], P), "jug", "#444", { anchor: "start", size: 14 }) : "",
          ISO.word(K.iso([0, 47, 0], P), "coaster", "#555", { size: 13, dy: 16 })].join(""));
        const want = lit || (pouring ? "water" : s.jug > 0.02 ? "jug" : "");
        const groups = { glass: [el.glass, el.rim], water: [el.water, el.stream], jug: [el.jug, el.jugback], bubbles: [el.fizz] };
        w.light(Object.values(groups).flat().filter(Boolean), (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.level !== undefined) s.want = ISO.clamp(+p.level || 0, 0, 100); if (p.lit !== undefined) lit = p.lit; };
      // Filling: the jug goes over first, then the water rises at about 60 ml a second, then the jug goes back.
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, rate) => (calm ? to : Math.abs(to - v) <= rate * dt ? to : v + Math.sign(to - v) * rate * dt);
        s.t += dt;
        const fill = s.want > s.level + 0.05;
        if (calm) { s.level = s.want; s.jug = 0; }
        else if (fill) { s.jug = step(s.jug, 1, 0.7); if (s.jug >= 1) s.level = step(s.level, s.want, 18); }
        else { s.level = step(s.level, s.want, 25); s.jug = step(s.jug, 0, 0.8); }
        draw();
        return s.level !== s.want || s.jug > 0;
      };
      g.readout = () => {
        const ml = Math.round(mlOf(s.level)), full = Math.round(mlOf(100));
        if (s.jug > 0.98 && s.level < s.want) return `pouring · ${ml} ml of ${full} ml to the brim line · a 9 mm heavy base, so the water starts above the table`;
        if (s.jug > 0.02) return s.level >= s.want ? "jug going back to the napkin" : "jug lifting and tipping over the glass";
        return `${Math.round(s.level)}% full · ${ml} ml (a frustum: π/3 · h · (r₁² + r₁r₂ + r₂²)) · glass holds ${full} ml to the brim line`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
