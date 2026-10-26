// "cpusocket cx cy k lever=0..135 lab=0 lit=board|socket|contacts|frame|lever" — a PART (PARTS.md): chip.js's LGA
// processor socket on its patch of motherboard, 8 × 8 cm, 0.8 cm to the top of its frame, its origin the surface point
// under the board's middle. The board (four plated mounting holes, capacitors round the socket, copper traces running
// off toward the memory); the black socket body with its field of spring contacts and the guide rim with its two key
// notches; the steel retention frame (load plate) hinged on the far edge; the lever along the near side on its two
// hinge blocks, its end under the latch hook. lever is its angle in degrees: past about 60 the frame is free and
// swings up with it (to 105° at lever 135). A cpuchip goes at= its `seat` (the contacts' top). set({ lever }).
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const ZB = 1.6, B = 40, SK = 25, RIM = 19.6, SUB = 18.75, ZS = ZB + 3, FR = { o: 23, i: 15, z: ZS + 2.4, t: 0.8 };
  const LV = { x: SK + 3.2, y0: -SK + 3, len: 2 * SK - 4, z: ZB + 2.6 };
  const rad = (d) => (d * Math.PI) / 180, frameAng = (lev) => 105 * ISO.smooth(60, 135, lev);

  ISO.add({
    name: "cpusocket", title: "Processor socket (part)", compare: null,
    about: "An LGA processor socket on a patch of motherboard: the body with its field of spring contacts and guide rim, the steel retention frame and the lever on two hinge blocks, capacitors and mounting holes round it; raise the lever and the frame swings open. anchors: seat",
    line: "cpusocket cx cy k lever=0..135 lab=0 lit=board|socket|contacts|frame|lever",
    demo: { line: "cpusocket 480 330 42 lab=1", script: [{ set: {}, hold: 1 }, { set: { lever: 135, lit: "lever" }, hold: "settle" }, { set: { lit: "contacts" }, hold: 1.2 }, { set: { lever: 45, lit: "frame" }, hold: "settle" }, { set: { lever: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), T = TECH, lab = o.lab === "1";
      const box = (x, y, z, tone, c) => T.box(Pm, x, y, z, tone, c), out = [], dep = (p) => K.depthOf(p, Pm);
      // ── the board: halo, the green slab, plated holes, capacitors, copper traces (printed: free lines)
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -B, y: -B, w: 2 * B, d: 2 * B, r: 2 }, 0, ZB, Pm)}"/>`);
      const brd = [T.slab(Pm, { x: -B, y: -B, w: 2 * B, d: 2 * B, r: 2 }, 0, ZB, "lo", T.C.pcbDark, 4, 0.3)];
      for (const [x, y] of K.corners({ x: -B, y: -B, w: 2 * B, d: 2 * B }, 5)) brd.push(`<path d="${K.ring(x, y, 2.6, ZB + 0.01, Pm, 18)}" fill="#e0bf66" stroke="#6b4f0e" stroke-width=".5"/><path d="${K.ring(x, y, 1.6, ZB + 0.02, Pm, 16)}" fill="#1a2418"/>`);
      const caps = [];
      for (let i = -3; i <= 3; i++) caps.push([i * 6, -SK - 6], [-SK - 6, i * 6]);
      for (let i = -3; i <= 0; i++) caps.push([i * 6, SK + 6]);
      caps.sort((a, b) => dep([...a, 0]) - dep([...b, 0]));
      for (const [x, y] of caps) { const along = Math.abs(y) > Math.abs(x); brd.push(box(along ? [x - 1.6, x + 1.6] : [x - 0.8, x + 0.8], along ? [y - 0.8, y + 0.8] : [y - 1.6, y + 1.6], [ZB, ZB + 1.1], "mid", T.C.paper)); }
      const tr = [];
      for (let i = 0; i < 6; i++) tr.push(K.lineOnTop([2 + i * 2.6, SK + 1], [2 + i * 2.6, B - 2], ZB + 0.02, Pm));
      brd.push(`<path data-free d="${tr.join("")}" fill="none" stroke="#c98258" stroke-width=".7"/>`);
      out.push(`<g data-name="board">${brd.join("")}</g>`);
      // ── the socket body, its contact field (a dash per spring contact; a real one has about 1700)
      out.push(`<g data-name="socket">${T.slab(Pm, { x: -SK, y: -SK, w: 2 * SK, d: 2 * SK, r: 1 }, ZB, 3, "mid", T.C.black, 4, 0.3)}</g>`);
      out.push(`<g data-name="contacts"><path d="${K.dotGrid(-SUB + 1.6, -SUB + 1.6, 18, 18, (2 * SUB - 3.2) / 17, ZS, Pm).map(([x, y]) => `M${(x - 0.8).toFixed(1)} ${y.toFixed(1)}h1.6`).join("")}" stroke="#d4ad4e" stroke-width="1" data-free=""/></g>`);
      // the guide rim: four bars round the seat, each split at a key notch on the two side bars
      const rims = [[[-RIM - 1.2, RIM + 1.2], [-RIM - 1.2, -RIM]], [[-RIM - 1.2, RIM + 1.2], [RIM, RIM + 1.2]], [[-RIM - 1.2, -RIM], [-RIM, -3]], [[-RIM - 1.2, -RIM], [-1, RIM]], [[RIM, RIM + 1.2], [-RIM, 3]], [[RIM, RIM + 1.2], [5, RIM]]]
        .map(([x, y]) => ({ svg: box(x, y, [ZS, ZS + 0.9], "mid", T.C.black), k: dep([(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, ZS]) }));
      const kc = dep([0, 0, ZS]);
      out.push(`<g data-name="socket">${rims.filter((r) => r.k <= kc).map((r) => r.svg).join("")}</g>`);
      // the frame's standoff posts on the body's corners and its hinge knuckles on the far edge (far ones first)
      const posts = [[-21.5, -21.5], [-21.5, 21.5], [21.5, -21.5], [21.5, 21.5]].map(([x, y]) => ({ k: dep([x, y, ZS]), svg: T.cyl(Pm, x, y, 1.1, ZS, FR.z - ZS, "mid", T.C.steel, 12) }));
      const knuckles = [-17, 17].map((y) => ISO.tinted(T.C.steel, K.solidSvg(G.disc(-3, 3, 1.2, G.frameOf([-FR.o, y, FR.z], [0, 1, 0], [1, 0, 0], [0, 0, 1]), Pm, { steps: 12 }), { tone: "mid" }))).join("");
      out.push(`<g data-name="frame">${posts.filter((p) => p.k <= kc).map((p) => p.svg).join("")}${knuckles}</g>`);
      out.push(`<g data-name="frame" data-part="frameBack"></g>`);
      out.push(`<g data-name="socket">${rims.filter((r) => r.k > kc).map((r) => r.svg).join("")}</g>`);
      out.push(`<g data-name="frame">${posts.filter((p) => p.k > kc).map((p) => p.svg).join("")}</g><g data-name="frame" data-part="frameFront"></g>`);
      // the lever's far hinge block with its latch hook, the lever, then the near hinge block (its pin sits inside)
      out.push(`<g data-name="lever">${box([SK, SK + 5], [LV.y0 + LV.len - 1, LV.y0 + LV.len + 2], [ZB, ZB + 2], "mid", T.C.steel)}${box([SK + 4, SK + 5], [LV.y0 + LV.len - 1, LV.y0 + LV.len + 2], [ZB + 2, ZB + 4], "mid", T.C.steel)}</g>`);
      out.push(`<g data-name="lever" data-part="arm"></g>`);
      out.push(`<g data-name="lever">${box([SK, SK + 5], [LV.y0 - 2.4, LV.y0 + 1.6], [ZB, LV.z + 1.4], "mid", T.C.steel)}</g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const q = (n) => g.querySelector(`[data-part="${n}"]`), el = { back: q("frameBack"), front: q("frameFront"), arm: q("arm"), words: q("words") }, w = ISO.writer();
      // the lever: an arm pivoting in its hinge about the x axis at the near block, its handle bent out at the end
      const armSvg = (a) => {
        const at = T.frame([LV.x, LV.y0, LV.z], [1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
        return T.obox(Pm, at, [-0.7, 0.7], [-0.6, LV.len + 0.6], [-0.7, 0.7], "hi", T.C.steel) + T.obox(Pm, at, [0.7, 5], [LV.len - 1.6, LV.len + 0.6], [-0.7, 0.7], "hi", T.C.steel) +
          T.obox(Pm, at, [-3.6, -0.7], [8, 11], [0.7, 4.4], "mid", T.C.steel);
      };
      // the frame: a steel plate with a window, hinged on its far edge (x = −FR.o) about the y axis, its tongue at +x
      const frameSvg = (b) => {
        const c = Math.cos(b), s = Math.sin(b), at = (u, v, h) => [-FR.o + u * c - h * s, v, FR.z + u * s + h * c];
        const fb = (u0, u1, v0, v1) => ISO.tinted(T.C.steel, ISO.box((u, h, v) => at(u, v, h), Pm, [u0, u1], [0, FR.t], [v0, v1], "mid"));
        const parts = [fb(0, 2 * FR.o, -FR.o, -FR.i), fb(0, 2 * FR.o, FR.i, FR.o), fb(0, FR.o - FR.i, -FR.i, FR.i), fb(FR.o + FR.i, 2 * FR.o, -FR.i, FR.i), fb(2 * FR.o, 2 * FR.o + 1.6, -14, -10)];
        // far bars first: sort the five pieces by their middles
        const mids = [[FR.o, -(FR.o + FR.i) / 2], [FR.o, (FR.o + FR.i) / 2], [(FR.o - FR.i) / 2, 0], [FR.o + (FR.o + FR.i) / 2, 0], [2 * FR.o + 0.8, -12]].map(([u, v]) => dep(at(u, v, 0)));
        return parts.map((p, i) => [mids[i], p]).sort((x, y) => x[0] - y[0]).map(([, p]) => p).join("");
      };
      const st = { lever: B37.num(o, "lever", 0, 0, 135), lit: o.lit || "" }, s = { lever: st.lever };
      const draw = () => {
        const lv = Math.round(s.lever * 2) / 2, fa = Math.round(frameAng(lv) * 2) / 2, back = fa > 30;
        w.rebuild(el.arm, String(lv), () => armSvg(rad(lv)));
        w.rebuild(el.back, back ? String(fa) : "", () => (back ? frameSvg(rad(fa)) : ""));
        w.rebuild(el.front, back ? "" : String(fa), () => (back ? "" : frameSvg(rad(fa))));
        w.rebuild(el.words, lab ? String(back) : "", () => !lab ? "" : [
          T.word(Pm, [-SK, SK, ZB], back ? "socket: 1700 spring contacts" : "socket", { anchor: "end", dx: -8, dy: 16 }),
          T.word(Pm, [LV.x + 3, LV.y0, LV.z], "lever", { anchor: "start", dx: 10, dy: 6 })].join(""));
        B37.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.lever !== undefined) st.lever = B37.num(p, "lever", st.lever, 0, 135);
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // a finger lifts the lever at a steady pace (about 90° a second)
      g.update = (dt) => {
        s.lever = ISO.still() ? st.lever : s.lever + ISO.clamp(st.lever - s.lever, -dt * 90, dt * 90);
        draw();
        return s.lever !== st.lever;
      };
      g.readout = () => (s.lever < 5 ? "lever down · the frame presses a processor onto the socket's spring contacts" : frameAng(s.lever) > 5 ? `lever up ${Math.round(s.lever)}° · frame open: a processor lifts straight out (touch only its edges)` : `lever up ${Math.round(s.lever)}° · lift it past about 60° to free the frame`);
      draw();
      g.anchors = { seat: [0, 0, ZS / 10] };
      return g;
    },
  });
})();
