// "fusebox cx cy width blown=N act=0|1|2" — an open fuse box with two rows of six blade fuses.
// The box sits on a body panel with its wiring loom; the lid stands open behind it with the fuse map printed inside,
// one spare of every rating clipped in a row, and the white puller parked in it. Fuse colours follow the real blade
// code: 5 A tan, 7.5 A brown, 10 A red, 15 A blue, 20 A yellow, 25 A clear, 30 A green. blown=N (1–12, row by row)
// shows fuse N with its strip broken. set({ act: 1 }) pulls fuse N out with the puller and puts it down on the panel;
// set({ act: 2 }) takes the spare of the same rating from the lid and pushes it into the slot.
// Local helpers: fuseSvg / pullerSvg (drawn in any pose from one frame), poseLerp (moves a frame between poses).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. A standard blade (ATO) fuse is 19 × 5 mm; 9 mm of body shows above the socket.
  const PLATE = { x: -92, y: -58, w: 214, d: 112, r: 4 };
  const BOX = { x: -70, y: -40, w: 140, d: 80, r: 3 }, WALL = 4, FLOOR = 18, RIM = 28;
  const FUSE = { w: 19, t: 5.2, body: 9, cap: 5 }, COLS = [-55, -33, -11, 11, 33, 55], ROWS = [-14, 14];
  const AMPS = [10, 15, 20, 7.5, 5, 25, 30, 10, 15, 20, 15, 10];
  const CODE = { 5: ["#d9b98c", "tan"], 7.5: ["#8a5a32", "brown"], 10: ["#d8392d", "red"], 15: ["#2f6fd1", "blue"], 20: ["#f0c419", "yellow"], 25: ["#eef1f2", "clear"], 30: ["#3a9c48", "green"] };
  const SPARES = [5, 7.5, 10, 15, 20, 25, 30];
  const tintOf = (c) => ISO.tint(c, [55, 65, 75, 85].map((k) => `color-mix(in srgb, ${c} ${k}%, #000)`), `color-mix(in srgb, ${c} 45%, #000)`);
  const GREY = ISO.tint("#9aa0a7", ["#5f656c", "#6c727a", "#7a8088", "#878d95"], "#2a2e33");
  // The lid turns 105° open about the hinge along the back of the rim.
  const LID_OPEN = (105 * Math.PI) / 180, HINGE = [0, BOX.y, RIM];
  const lidAt = (u, v, t) => [u, HINGE[1] + v * Math.cos(LID_OPEN) - t * Math.sin(LID_OPEN), HINGE[2] + v * Math.sin(LID_OPEN) + t * Math.cos(LID_OPEN)];
  const LID_N = G.unit3(G.sub3(lidAt(0, 0, -1), lidAt(0, 0, 0))), LID_V = G.unit3(G.sub3(lidAt(0, 1, 0), lidAt(0, 0, 0)));
  const slotOf = (i) => [COLS[i % 6], ROWS[i < 6 ? 0 : 1], FLOOR];
  const DROP = [102, 18, 0.8];

  // A pose is a frame { o, a, s }: o the base, a "up" for the part, s its width axis.
  const poseLerp = (p, q, e, lift = 0) => {
    const a = G.unit3(G.lerp3(p.a, q.a, e)), s0 = G.lerp3(p.s, q.s, e), n = G.unit3(G.cross3(a, s0));
    return { o: G.add3(G.lerp3(p.o, q.o, e), [0, 0, lift * Math.sin(Math.PI * e)]), a, s: G.unit3(G.cross3(n, a)) };
  };
  const up = (o) => ({ o, a: [0, 0, 1], s: [1, 0, 0] });
  const atOf = ({ o, a, s }) => { const f = G.cross3(a, s); return (u, w, y) => G.add3(o, G.add3(G.mul3(s, u), G.add3(G.mul3(f, w), G.mul3(a, y)))); };

  // A blade fuse: translucent body with its two legs and the strip between them, a grip cap with the rating on top.
  function fuseSvg(P, pose, amps, blown, lit) {
    const at = atOf(pose), h = FUSE.w / 2, t = FUSE.t / 2, tint = tintOf(CODE[amps][0]), out = [];
    out.push(ISO.tinted(tint, ISO.box(at, P, [-h + 0.8, h - 0.8], [-t + 0.3, t - 0.3], [0, FUSE.body], "hi", lit) + ISO.box(at, P, [-h, h], [-t, t], [FUSE.body, FUSE.body + FUSE.cap], "hi", lit)));
    const V = G.viewOf(P), front = G.dot3(G.cross3(pose.a, pose.s), V) > 0.05, topSeen = G.dot3(pose.a, V) > 0.05;
    const face = (u, y) => K.iso(at(u, t - 0.28, y), P), ink = amps === 25 ? "#6c7178" : "#3b3f45";
    if (!front) return out.join("") + (topSeen ? capText() : "");
    const legs = [[-5, 0.6], [-5, 6.6]].map(([u, y]) => face(u, y)).concat([[5, 6.6], [5, 0.6]].map(([u, y]) => face(u, y)));
    const strip = blown ? K.pathOf([face(-5, 6.6), face(-1.6, 7.6)]) + K.pathOf([face(1.6, 7.6), face(5, 6.6)]) : K.pathOf([face(-5, 6.6), face(-2.5, 7.8), face(0, 6.6), face(2.5, 7.8), face(5, 6.6)]);
    out.push(`<path d="${K.pathOf(legs.slice(0, 2))}${K.pathOf(legs.slice(2))}" stroke="${ink}" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="${strip}" stroke="${ink}" stroke-width="0.8" fill="none" stroke-linecap="round"/>`);
    if (blown) out.push(`<circle cx="${face(0, 7.4)[0].toFixed(1)}" cy="${face(0, 7.4)[1].toFixed(1)}" r="1.1" fill="#2a2523" opacity="0.75"/>`);
    return out.join("") + (topSeen ? capText() : "");
    // The rating, printed on the cap's top face along the fuse's width.
    function capText() {
    const o2 = K.iso(at(0, 0, FUSE.body + FUSE.cap), P), ax = K.iso(at(1, 0, FUSE.body + FUSE.cap), P), ay = K.iso(at(0, 1, FUSE.body + FUSE.cap), P);
    const m = `matrix(${ax[0] - o2[0]} ${ax[1] - o2[1]} ${ay[0] - o2[0]} ${ay[1] - o2[1]} ${o2[0]} ${o2[1] + 0}) translate(0 1.3)`;
    return `<g style="--anatomy-mid:${amps === 25 || amps === 5 || amps === 20 ? "#3b3f45" : "#fff"}">${K.faceTextSvg(m, String(amps), { size: 3.6, tone: "mid", anchor: "middle" })}</g>`;
    }
  }
  // The puller: two white arms with grip ridges, joined at the top, jaws at the bottom; s is the axis the jaws close on.
  function pullerSvg(P, pose, lit) {
    const at = atOf(pose), out = [];
    for (const u of [[-6.2, -3], [3, 6.2]]) out.push(ISO.box(at, P, u, [-3.4, 3.4], [-1, 34], "hi", lit), ISO.box(at, P, u[0] < 0 ? [-3, -2.4] : [2.4, 3], [-3.4, 3.4], [-1, 1.6], "hi", lit));
    out.push(ISO.box(at, P, [-6.2, 6.2], [-3.4, 3.4], [34, 38], "hi", lit));
    const ridges = [];
    for (const y of [14, 17, 20, 23, 26]) for (const u of [-6.2, 6.2]) { const f = Math.sign(u); ridges.push(K.iso(at(u + f * 0.02, 3.4, y), P)); }
    out.push(D(ridges, { size: 0.5, tone: "lo" }));
    return out.join("");
  }

  function staticSvg(P, blown, lab) {
    const back = [], front = [], at3 = (p) => K.iso(p, P);
    back.push(`<path class="iso-halo" d="${K.haloOf(PLATE, -4, 4, P)}"/>`);
    back.push(ISO.tinted(ISO.T.paint, S(K.slabOf(PLATE, -4, 4.8, P, 4, 0.8), { tone: "mid" }) + L(K.planOutline(K.insetPlan(PLATE, 5), 0.8, P, 4), { tone: "faint" })));
    back.push(D(K.corners(PLATE, 9).map(([x, y]) => at3([x, y, 0.8])), { size: 0.6 }), L(K.corners(PLATE, 9).map(([x, y]) => K.ring(x, y, 2.4, 0.8, P, 14)).join(""), { tone: "lo" }));
    // Mounting feet with their bolts at the box's four corners.
    for (const [x, y] of K.corners(BOX, -4).sort((p, q) => K.depthOf([...p, 0], P) - K.depthOf([...q, 0], P))) back.push(ISO.tinted(GREY, S(K.cylinder(x, y, 5, 0.8, 3, P, 20), { tone: "mid" })), D([at3([x, y, 3.8])], { size: 0.7, tone: "lo" }));
    // Lid: a shell turned open on its hinge, the map inside, a clip strip with one spare of each rating.
    const lid = ISO.box(lidAt, P, [BOX.x, BOX.x + BOX.w], [0, BOX.d], [0, 3.2], "mid");
    back.push(ISO.tinted(GREY, lid));
    const map = [], rules = [];
    COLS.forEach((x, c) => ROWS.forEach((_, r) => {
      const v0 = 66 - r * 12, pts = [[x - 9, v0], [x + 9, v0], [x + 9, v0 + 9], [x - 9, v0 + 9]];
      map.push(K.pathOf(pts.map(([u, v]) => at3(lidAt(u, v, -0.02))), true));
      rules.push(K.pathOf([at3(lidAt(x - 6, v0 + 6.4, -0.02)), at3(lidAt(x + 2, v0 + 6.4, -0.02))]));
    }));
    back.push(`<g style="--anatomy-lo:#30353b;--anatomy-faint:#4a5058">${L(map.join(""), { tone: "lo" })}${L(rules.join(""), { tone: "faint", free: true })}</g>`);
    COLS.forEach((x, c) => ROWS.forEach((_, r) => {
      const i = r * 6 + c, v0 = 66 - r * 12, o2 = at3(lidAt(x - 6, v0 + 3.6, -0.02)), ax = at3(lidAt(x - 5, v0 + 3.6, -0.02)), ay = at3(lidAt(x - 6, v0 + 2.6, -0.02));
      back.push(`<g style="--anatomy-mid:#f2f3f4">${K.faceTextSvg(`matrix(${ax[0] - o2[0]} ${ax[1] - o2[1]} ${ay[0] - o2[0]} ${ay[1] - o2[1]} ${o2[0]} ${o2[1]})`, `${i + 1} · ${AMPS[i]}A`, { size: 3.2, tone: "mid" })}</g>`);
    }));
    back.push(ISO.tinted(GREY, ISO.box(lidAt, P, [-66, 66], [30, 40], [-2.2, 0], "mid")));
    // Box: back wall, left wall, floor with its sockets — then the fuses — then right and front walls.
    const wall = (xs, ys) => ISO.tinted(GREY, ISO.wbox(P, xs, ys, [0, RIM], "mid"));
    back.push(wall([BOX.x, BOX.x + BOX.w], [BOX.y, BOX.y + WALL]), wall([BOX.x, BOX.x + WALL], [BOX.y + WALL, BOX.y + BOX.d - WALL]));
    back.push(ISO.tinted(GREY, ISO.wbox(P, [BOX.x + WALL, BOX.x + BOX.w - WALL], [BOX.y + WALL, BOX.y + BOX.d - WALL], [0, FLOOR], "lo")));
    const sockets = [];
    COLS.forEach((x) => ROWS.forEach((y) => sockets.push(K.pathOf([[x - 10.5, y - 3.6], [x + 10.5, y - 3.6], [x + 10.5, y + 3.6], [x - 10.5, y + 3.6]].map(([a, b]) => at3([a, b, FLOOR])), true))));
    back.push(L(sockets.join(""), { tone: "lo" }));
    back.push(L(K.lineOnTop([BOX.x + WALL, 0], [BOX.x + BOX.w - WALL, 0], FLOOR, P), { tone: "faint" }));
    front.push(wall([BOX.x + BOX.w - WALL, BOX.x + BOX.w], [BOX.y + WALL, BOX.y + BOX.d - WALL]), wall([BOX.x, BOX.x + BOX.w], [BOX.y + BOX.d - WALL, BOX.y + BOX.d]));
    // Two latches on the front wall that the lid clips onto, and the loom through its grommet.
    for (const x of [-40, 40]) front.push(ISO.tinted(GREY, ISO.wbox(P, [x - 6, x + 6], [BOX.y + BOX.d, BOX.y + BOX.d + 2.4], [RIM - 9, RIM - 1], "mid")));
    const F = G.frameAlong([-20, BOX.y + BOX.d, 8], [0, 1, 0]);
    front.push(S(G.disc(0, 3, 7, F, P), { tone: "mid" }), L(G.circleOf(F, 3, 4.6, P), { tone: "faint" }));
    const loom = G.fillet([[-20, BOX.y + BOX.d + 3, 8], [-20, 50, 8], [-60, 50, 6], [-84, 50, 5.2], [-92, 50, -3.4]], 9, 6).map((p) => at3(p));
    const k = G.scaleOf(P), d = K.pathOf(loom);
    front.push(`<g fill="none" stroke-linecap="butt" stroke-linejoin="round"><path d="${d}" stroke="#121315" stroke-width="${(9 * k + 1.2).toFixed(2)}"/><path d="${d}" stroke="#3a3d42" stroke-width="${(9 * k).toFixed(2)}"/><path d="${d}" stroke="#6d7279" stroke-width="${(2.4 * k).toFixed(2)}" transform="translate(${(-1.6 * k).toFixed(2)} ${(-2 * k).toFixed(2)})"/></g>`);
    if (lab) back.push(ISO.word(at3(lidAt(-40, BOX.d, 3)), "map and spares", "#555", { dy: -18, size: 15 }));
    return { back: back.join(""), front: front.join("") };
  }

  ISO.add({
    name: "fusebox", title: "Fuse box", compare: "fusebox 480 270 380 blown=3",
    about: "An open fuse box with twelve colour-coded blade fuses, its lid with the map and spares, and the puller; the blown fuse is pulled and a spare of the same rating goes in.",
    line: "fusebox cx cy width blown=N act=0|1|2",
    demo: { line: "fusebox 480 270 380 blown=3", script: [{ set: { act: 0 }, hold: 1.6 }, { set: { act: 1 }, hold: "settle" }, { set: { act: 2 }, hold: "settle" }] },
    make([cx, cy, W = 380], o, t, parent) {
      const lab = o.lab !== "0", N = ISO.clamp(Math.round(ISO.num(o, "blown", 3)), 0, 12), Wd = W * 1.9, H = Wd * 0.6;
      const { P, g } = ISO.frame([...K.boxCorners(PLATE, -4, 0), lidAt(BOX.x, BOX.d, 3), lidAt(BOX.x + BOX.w, BOX.d, 3), [BOX.x + BOX.w, BOX.y + BOX.d, 40]], cx, cy, Wd, H, { azimuth: 62, elevation: 34 }, parent);
      const st = staticSvg(P, N, lab);
      const order = AMPS.map((_, i) => i).sort((a, b) => K.depthOf(slotOf(a), P) - K.depthOf(slotOf(b), P));
      g.innerHTML = st.back + `<g data-part="spares"></g>` + order.map((i) => `<g data-slot="${i}"></g>`).join("") + st.front + `<g data-part="top"></g>`;
      const slots = Object.fromEntries([...g.querySelectorAll("[data-slot]")].map((e) => [+e.dataset.slot, e]));
      const spares = g.querySelector('[data-part="spares"]'), top = g.querySelector('[data-part="top"]');
      const mk2 = (name) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.dataset.name = name; return e; };
      const el = { old: mk2("old"), fresh: mk2("fresh"), puller: mk2("puller") };
      top.append(el.puller);
      const i0 = N ? N - 1 : 0, amps = AMPS[i0], spareAt = SPARES.indexOf(amps);
      AMPS.forEach((a, i) => { if (i !== i0) slots[i].innerHTML = fuseSvg(P, up(slotOf(i)), a, false, false); });
      // Poses: the spares stand out of the lid's clip strip; the puller lies in the lid above them.
      const spareOf = (k) => ({ o: lidAt(-54 + k * 18, 35, -2.2), a: LID_N, s: [1, 0, 0] });
      const PARK = { o: G.add3(lidAt(-17, 16, 0), G.mul3(LID_N, 3.4)), a: [1, 0, 0], s: LID_V };
      const SLOT = up(slotOf(i0)), RAISED = up(G.add3(slotOf(i0), [0, 0, 24])), ABOVE = up([DROP[0], DROP[1], 24]), DOWN = up([DROP[0], DROP[1], DROP[2]]);
      const LYING = { o: [DROP[0], DROP[1] - 2.6, DROP[2] + FUSE.t / 2 + 0.1], a: [0, -1, 0], s: [1, 0, 0] };
      const grip = (f) => ({ o: G.add3(f.o, G.mul3(f.a, FUSE.body + 0.6)), a: f.a, s: G.cross3(f.a, f.s) });
      const T1 = 5.2, T2 = 7.4;
      // Everything at time t of the whole job: 0 rest, T1 pulled and put down, T2 new fuse in.
      const poseAt = (t) => {
        const k = (a, b) => ISO.ease((t - a) / (b - a));
        let old = SLOT, puller = PARK, fresh = spareOf(spareAt), label = N ? `fuse ${N} · ${amps} A ${CODE[amps][1]} · its strip is broken: blown` : "all twelve fuses good";
        if (t > 0) { puller = poseLerp(PARK, grip(RAISED), k(0, 1.1), 14); label = "puller onto the fuse"; }
        if (t > 1.1) puller = poseLerp(grip(RAISED), grip(SLOT), k(1.1, 1.6));
        if (t > 1.6) { old = poseLerp(SLOT, RAISED, k(1.6, 2.4)); puller = grip(old); label = "pulled straight up"; }
        if (t > 2.4) { old = poseLerp(RAISED, ABOVE, k(2.4, 3.5), 10); puller = grip(old); }
        if (t > 3.5) { old = poseLerp(ABOVE, DOWN, k(3.5, 3.9)); puller = grip(old); label = `look through the side: the ${amps} A strip has melted through`; }
        if (t > 3.9) { puller = poseLerp(grip(DOWN), PARK, k(3.9, 5.0), 14); old = poseLerp(DOWN, LYING, k(4.0, 4.5)); }
        if (t > T1) { fresh = poseLerp(spareOf(spareAt), RAISED, k(T1, T1 + 1.3), 12); label = `spare ${amps} A ${CODE[amps][1]} from the lid`; }
        if (t > T1 + 1.3) { fresh = poseLerp(RAISED, SLOT, k(T1 + 1.3, T2)); label = `new ${amps} A in · same rating; a bigger fuse would let the wire overheat`; }
        return { old, puller, fresh, label };
      };
      const s = { t: 0, target: 0, label: "" }, w = ISO.writer();
      const key = (p) => [...p.o, ...p.a, ...p.s].map((v) => v.toFixed(2)).join();
      let litName = "";
      const draw = () => {
        const q = poseAt(s.t);
        s.label = q.label;
        if (!N) return;
        // A fuse below the rim is drawn in its slot's place; lifted clear of the walls it moves to the top layer.
        const place = (e, pose, slotEl) => { const parent = pose.o[2] > RIM - 1.5 || pose.o[0] > BOX.x + BOX.w ? top : slotEl; if (e.parentNode !== parent) parent.insertBefore(e, parent === top ? el.puller : null); };
        place(el.old, q.old, slots[i0]);
        w.rebuild(el.old, key(q.old), () => fuseSvg(P, q.old, amps, true, false));
        const freshOut = s.t > T1;
        if (freshOut) place(el.fresh, q.fresh, slots[i0]);
        else if (el.fresh.parentNode !== spares) spares.append(el.fresh);
        w.rebuild(el.fresh, key(q.fresh), () => fuseSvg(P, q.fresh, amps, false, false));
        w.rebuild(el.puller, key(q.puller), () => pullerSvg(P, q.puller, false));
        litName = s.t <= 0 || Math.abs(s.t - T1) < 1e-6 ? "old" : s.t < T1 ? "puller" : "fresh";
        w.light([el.old, el.fresh, el.puller], [el[litName]]);
      };
      spares.innerHTML = SPARES.map((a, k) => (N && k === spareAt ? "" : fuseSvg(P, spareOf(k), a, false, false))).join("");
      spares.append(el.fresh);
      g.set = (p) => {
        if (p.act === undefined) return;
        const a = ISO.clamp(Math.round(+p.act), 0, 2);
        s.target = [0, T1, T2][a];
        if (s.target < s.t) s.t = a === 1 ? 0 : s.target;
      };
      g.update = (dt) => {
        s.t = ISO.still() ? s.target : Math.min(s.target, s.t + dt);
        draw();
        return s.t < s.target;
      };
      g.readout = () => s.label;
      if (o.act) g.set({ act: o.act });
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
