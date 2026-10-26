// "chip cx cy size apart=0..1 run=0|1 lab=1 lit=lid|die|substrate|socket|lever |text" — a desktop processor in its socket.
// A patch of motherboard (mounting holes, capacitors round the socket) carries the LGA socket: its body with the field
// of spring contacts (the "pins"), a guide rim and the retention lever on its two hinge blocks. The processor sits in
// it: the green substrate with tiny capacitors round its edge and, under the metal heat spreader (the lid, with CPU or
// the given text on it), the silicon die on a bed of thermal paste. apart (0 … 1) first raises the lever, then lifts
// the processor out and the lid off it, so the die shows with its eight cores and the cache between them. run=1 lights
// the cores. set({ apart, run, lit }). 1 unit = 1 mm (a 37.5 mm package on a 50 mm socket).
(() => {
  const K = window.K, T = window.TECH;
  const B = 42, SK = 25, RIM = 19.6, SUB = 18.75, ZS = 3, ZT = 4.2;                // half sizes; socket top, substrate top
  const LID = { base: 16.5, top: 14, z0: ZT, z1: ZT + 1.2, z2: ZT + 3 }, DIE = { x: 6.2, y: 8, z: ZT + 0.7 };
  const LIFT_SUB = 12, LIFT_LID = 24, SLIDE = 22, LV = { x: SK + 3.2, y0: -SK + 3, len: 2 * SK - 4, z: 2.6 };

  ISO.add({
    name: "chip", title: "Processor (CPU)", compare: "chip 480 270 340",
    about: "A processor in its socket: lift the lever, take the chip out and the lid off, and the silicon die shows, with its cores and the cache, on its green substrate over the socket's contact pins.",
    line: "chip cx cy size apart=0..1 run=0|1 lab=1 lit=lid|die|substrate|socket|lever |text",
    demo: { line: "chip 480 270 340", script: [{ set: { apart: 1 }, hold: "settle" }, { set: { run: 1 }, hold: 3 }, { set: { apart: 0, run: 0 }, hold: "settle" }] },
    make([cx, cy, size = 340], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.3, H = size * 1.45;
      // the lid moves off toward the back as it lifts, so the die under it shows (the camera's far direction)
      const tv = K.towardViewer(K.fitProjection([[0, 0, 0], [1, 1, 1]], 10, 10, { azimuth: 38, elevation: 40 })), fl = Math.hypot(tv[0], tv[1]) || 1, FAR = [-tv[0] / fl, -tv[1] / fl];
      const lidAt = [FAR[0] * SLIDE, FAR[1] * SLIDE, LIFT_LID + LID.z2];
      const { P, g } = ISO.frame([[-B, -B, -2], [B, -B, -2], [-B, B, -2], [B, B, -2], ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [lidAt[0] + a * LID.base, lidAt[1] + b * LID.base, lidAt[2]]), [LV.x + 4, LV.y0 + LV.len, 2]], cx, cy, W, H, { azimuth: 38, elevation: 40, pad: size * 0.06 }, parent);
      const box = (x, y, z, tone, c, lit) => T.box(P, x, y, z, tone, c, lit), out = [];
      // ── the board: halo, the green board with its edge seam, four mounting holes, capacitors round the socket
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: -B, y: -B, w: 2 * B, d: 2 * B, r: 2 }, -1.6, 1.6, P)}"/>`);
      out.push(T.slab(P, { x: -B, y: -B, w: 2 * B, d: 2 * B, r: 2 }, -1.6, 1.6, "lo", T.C.pcbDark, 4, 0.3));
      out.push(T.L(K.corners({ x: -B, y: -B, w: 2 * B, d: 2 * B }, 5).map(([x, y]) => K.ring(x, y, 1.8, 0, P, 16)).join(""), { tone: "mid" }));
      const caps = [];
      for (let i = -3; i <= 3; i++) caps.push([i * 6, -SK - 6], [-SK - 6, i * 6]);
      for (let i = -3; i <= 0; i++) caps.push([i * 6, SK + 6]);
      caps.sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
      for (const [x, y] of caps) { const along = Math.abs(y) > Math.abs(x); out.push(box(along ? [x - 1.6, x + 1.6] : [x - 0.8, x + 0.8], along ? [y - 0.8, y + 0.8] : [y - 1.6, y + 1.6], [0, 1.1], "mid", T.C.paper)); }
      // a row of copper traces leaving the socket for the memory, printed on the board: free lines
      const tr = [];
      for (let i = 0; i < 6; i++) tr.push(K.lineOnTop([SK + 1, 2 + i * 2.6], [B - 2, 2 + i * 2.6], 0.02, P));
      out.push(`<path data-free d="${tr.join("")}" fill="none" stroke="#c98258" stroke-width=".7"/>`);
      // ── the socket: body, the contact field (a dot per pin, 1700 in a real one), the guide rim (far half now)
      out.push(`<g data-name="socket">${T.slab(P, { x: -SK, y: -SK, w: 2 * SK, d: 2 * SK, r: 1 }, 0, ZS, "mid", T.C.black, 4, 0.3)}`);
      out.push(T.L(K.planOutline({ x: -SUB - 0.3, y: -SUB - 0.3, w: 2 * SUB + 0.6, d: 2 * SUB + 0.6, r: 0.6 }, ZS, P), { tone: "faint" }));
      out.push(`<path d="${K.dotGrid(-SUB + 1.6, -SUB + 1.6, 18, 18, (2 * SUB - 3.2) / 17, ZS, P).map(([x, y]) => `M${(x - 0.8).toFixed(1)} ${y.toFixed(1)}h1.6`).join("")}" stroke="#d4ad4e" stroke-width="1" data-free/>`);
      const rims = [[[-RIM - 1.2, RIM + 1.2], [-RIM - 1.2, -RIM]], [[-RIM - 1.2, RIM + 1.2], [RIM, RIM + 1.2]], [[-RIM - 1.2, -RIM], [-RIM, RIM]], [[RIM, RIM + 1.2], [-RIM, RIM]]]
        .map(([x, y]) => ({ svg: box(x, y, [ZS, ZS + 0.9], "mid", T.C.black), k: K.depthOf([(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, ZS], P) }));
      const kc = K.depthOf([0, 0, ZS], P);
      out.push(rims.filter((r) => r.k <= kc).map((r) => r.svg).join(""), `</g>`);
      // the lever's two hinge blocks on the socket's side, and the latch hook at the far end
      out.push(box([SK, SK + 5], [LV.y0 + LV.len - 1, LV.y0 + LV.len + 2], [0, 2], "mid", T.C.steel));
      out.push(`<g data-name="lever"></g>`);
      // the hinge block is drawn after the lever: the lever's pivot pin sits inside it
      out.push(box([SK, SK + 5], [LV.y0 - 2.4, LV.y0 + 1.6], [0, LV.z + 1.4], "mid", T.C.steel));
      out.push(`<g data-part="nearRim">${rims.filter((r) => r.k > kc).map((r) => r.svg).join("")}</g>`);
      // ── the processor: substrate group (with die and paste) and lid group, each lifted by a transform
      const sub = [box([-SUB, SUB], [-SUB, SUB], [ZS, ZT], "mid", T.C.pcb)];
      // gold triangle in the corner (pin 1) and the edge capacitors
      sub.push(T.quad(P, [[-SUB + 1, -SUB + 1, ZT + 0.01], [-SUB + 4, -SUB + 1, ZT + 0.01], [-SUB + 1, -SUB + 4, ZT + 0.01]], "#e0bf66", "#6b4f0e", 0.5));
      const ec = [];
      for (let i = -4; i <= 4; i++) ec.push([i * 3, -SUB + 1.3], [i * 3, SUB - 1.3]);
      ec.sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
      for (const [x, y] of ec) sub.push(box([x - 0.5, x + 0.5], [y - 0.8, y + 0.8], [ZT, ZT + 0.6], "mid", T.C.paper));
      // the die: dark silicon on a paste bed, cores in two rows of four with the cache strip between, I/O at the end
      sub.push(`<g data-name="die">${box([-DIE.x - 0.4, DIE.x + 0.4], [-DIE.y - 0.4, DIE.y + 0.4], [ZT, ZT + 0.2], "lo", T.C.white)}${box([-DIE.x, DIE.x], [-DIE.y, DIE.y], [ZT + 0.2, DIE.z], "hi", T.C.chip)}</g>`);
      sub.push(`<g data-part="cores"></g>`);
      out.push(`<g data-part="sub" data-name="substrate">${sub.join("")}</g>`);
      // the lid: flange, raised top with its sides, the text on top
      const lid = [box([-LID.base, LID.base], [-LID.base, LID.base], [LID.z0, LID.z1], "mid", T.C.steel), box([-LID.top, LID.top], [-LID.top, LID.top], [LID.z1, LID.z2], "hi", T.C.steel)];
      const word = t || (lab ? "CPU" : "");
      // the text on the lid runs along -y (up-right on screen), its lines stacked along +x
      if (word) { const fs = Math.min(7, (2 * LID.top * 0.8) / Math.max(1, word.length * 0.62)); lid.push(T.flat(P, [0, 0, LID.z2 + 0.01], [0, -1, 0], [1, 0, 0], T.text(0, fs * 0.35, word, fs, "#4a5058", "middle", 800))); }
      out.push(`<g data-part="lid" data-name="lid">${lid.join("")}</g>`);
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
      el.lever = g.querySelector('[data-name="lever"]');
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];

      // the lever: an arm pivoting in its hinge about the y axis line at the near block, rising as it is released
      const leverSvg = (a) => {
        const at = T.frame([LV.x, LV.y0, LV.z], [1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
        return T.obox(P, at, [-0.7, 0.7], [-0.6, LV.len + 0.6], [-0.7, 0.7], "hi", T.C.steel) + T.obox(P, at, [0.7, 5], [LV.len - 1.6, LV.len + 0.6], [-0.7, 0.7], "hi", T.C.steel);
      };
      // eight cores (two rows of four) and the cache between, flat on the die; a running core glows amber
      const coresSvg = (phase) => {
        const z = DIE.z + 0.01, s = [], cw = (2 * DIE.x - 1.6) / 2, ch = (2 * DIE.y - 3.4) / 4;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
          const x0 = c ? DIE.x - 0.6 - cw * 0.78 : -DIE.x + 0.6, y0 = -DIE.y + 0.8 + r * (ch + 0.4), on = phase >= 0 && (r * 2 + c + Math.floor(phase)) % 3 !== 0;
          s.push(T.quad(P, [[x0, y0, z], [x0 + cw * 0.78, y0, z], [x0 + cw * 0.78, y0 + ch, z], [x0, y0 + ch, z]], on ? "#f6ad48" : "#4b5058", on ? "#8a4a08" : "#6b7078", 0.4));
        }
        s.push(T.quad(P, [[-DIE.x + 0.6 + cw * 0.78 + 0.5, -DIE.y + 0.8, z], [DIE.x - 0.6 - cw * 0.78 - 0.5, -DIE.y + 0.8, z], [DIE.x - 0.6 - cw * 0.78 - 0.5, DIE.y - 0.8, z], [-DIE.x + 0.6 + cw * 0.78 + 0.5, DIE.y - 0.8, z]], "#6d737c", "#8d9399", 0.4));
        return s.join("");
      };
      const st = { apart: ISO.clamp(ISO.num(o, "apart", 0), 0, 1), want: 0, run: o.run === "1", ph: 0, lit: o.lit || "" };
      st.want = st.apart;
      const draw = () => {
        const a = st.apart, lev = ISO.smooth(0, 0.3, a), up = ISO.smooth(0.3, 0.75, a), off = ISO.smooth(0.45, 1, a);
        w.rebuild(el.lever, String(Math.round(lev * 60)), () => leverSvg((Math.round(lev * 60) / 60) * (Math.PI * 0.5)));
        w.attr(el.sub, "transform", K.translateAlong(P, [0, 0, up * LIFT_SUB]));
        w.attr(el.lid, "transform", K.translateAlong(P, [FAR[0] * off * SLIDE, FAR[1] * off * SLIDE, up * LIFT_SUB + off * (LIFT_LID - LIFT_SUB)]));
        // the near half of the guide rim is in front of the seated chip, behind a lifted one
        w.shown(el.nearRim, true);
        if (up > 0.02 && el.nearRim.nextSibling !== el.sub) g.insertBefore(el.nearRim, el.sub);
        if (up <= 0.02 && el.nearRim.previousSibling !== el.sub) g.insertBefore(el.nearRim, el.sub.nextSibling);
        const phase = st.run && off > 0.9 ? Math.floor(st.ph * 3) : -1;
        w.rebuild(el.cores, String(phase), () => coresSvg(phase));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        w.rebuild(el.words, lab ? `${Math.round(a * 20)}` : "", () => !lab ? "" : [
          T.word(P, [-LID.base + FAR[0] * off * SLIDE, LID.base + FAR[1] * off * SLIDE, LID.z1 + up * LIFT_SUB + off * (LIFT_LID - LIFT_SUB)], off > 0.5 ? "lid (heat spreader)" : "processor", { anchor: "end", dx: -10 }),
          off > 0.5 ? T.word(P, [DIE.x, -DIE.y, DIE.z + up * LIFT_SUB], "silicon die: 8 cores + cache", { anchor: "start", dx: 14, dy: 4, color: "#1f4f8f" }) : "",
          T.word(P, [-SUB, SUB, ZS + up * LIFT_SUB], "substrate", { anchor: "end", dx: -10, dy: 12 }),
          T.word(P, [-SK, SK, 0], up > 0.3 ? "socket: 1700 contact pins" : "socket", { anchor: "end", dx: -8, dy: 16 }),
          T.word(P, [LV.x + 3, LV.y0, LV.z], "lever", { anchor: "start", dx: 10, dy: 6 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.apart !== undefined) st.want = ISO.clamp(+p.apart, 0, 1);
        if (p.run !== undefined) st.run = !!+p.run;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (calm) st.apart = st.want;
        else st.apart += ISO.clamp(st.want - st.apart, -dt * 0.45, dt * 0.45);
        st.ph = (st.ph + dt) % 100;
        draw();
        return st.apart !== st.want || (st.run && st.apart > 0.9);
      };
      g.readout = () => st.apart > 0.9
        ? (st.run ? "running · 8 cores at up to 5 GHz: each does billions of steps a second · the die is about 1.5 cm² with some 10 billion transistors" : "lid off · the die sits on the substrate, which fans its connections out to the socket's 1700 pins")
        : st.apart > 0.02 ? "lever up · lifting the processor out of its socket" : "seated · the lever holds the processor down on the socket's contact pins";
      draw();
      return g;
    },
  });
})();
