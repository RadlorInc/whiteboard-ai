// "wifirouter cx cy k on=0|1 lid=0..1 ant=0..90 lab=0 lit=tray|lid|board|soc|wifi|ports|antenna|leds" — a PART (PARTS.md,
// batch 6): the Wi-Fi router of router.js, 22 × 15 × 4.4 cm (antennas 16 cm tall), standing on a shelf or desk,
// origin the point under its middle. A white case on rubber feet: the tray holds the circuit board on four standoffs,
// the lid carries the vent slots and the four light windows (power, internet, Wi-Fi, home). Inside: the processor
// under its finned heatsink, memory and flash chips, two metal cans shielding the 2.4 and 5 GHz radio chips, the
// switch chip, five network jacks (one internet, four home) in the back wall (+y, the camera's side), the power jack
// and reset button, thin cables to the two antennas, each on a hinge. on=1 lights the power and internet lights, the
// Wi-Fi and home lights flicker with traffic and rings of radio waves spread out; lid 0..1 lifts the lid off; ant
// folds both antennas out from upright (0) to flat (90°). set({ on, lid, ant }). anchors: top power
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const F = 0.115, X0 = -95, X1 = 95, Y0 = -65, Y1 = 65, FT = 3, FL = 7, WT = 27, LT = 38, WALL = 2.4, PB = 11.6;
  const ANT = [-68, 68], AH = 140, AY = Y1 + 4.6, LIDV = [0, -120, 46];
  const JACKS = [-50, -31, -12, 7, 26];                                   // jack centres: the first is the internet port
  const LEDS = [-45, -15, 15, 45];                                        // power, internet, Wi-Fi, home network

  ISO.add({
    name: "wifirouter", title: "Wi-Fi router (part)", compare: null,
    about: "A Wi-Fi router 22 × 15 × 4 cm: white case on rubber feet, lid with vents and four lights, inside the board with processor and heatsink, two radio cans, five network jacks; on=1 lights and flickers it and radio waves spread, lid=1 lifts the lid off, ant= folds the antennas. anchors: top power",
    line: "wifirouter cx cy k on=0|1 lid=0..1 ant=0..90 lab=0 lit=tray|lid|board|soc|wifi|ports|antenna|leds",
    demo: { line: "wifirouter 480 330 22 lab=1", script: [{ set: { on: 1 }, hold: 2.4 }, { set: { lid: 1, lit: "soc" }, hold: 2.6 }, { set: { lid: 0, ant: 60, lit: "antenna" }, hold: 2 }, { set: { ant: 0, on: 0, lit: "" }, hold: 1.6 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P: P0, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const P = B36.cam(P0, F);   // 1 unit = 1.15 mm: the router recipe's mm drawing made 22 cm wide
      const box = (x, y, z, tone = "mid", c = "", lit = false) => T.box(P, x, y, z, tone, c, lit), out = [];
      const depth = (p) => K.depthOf(p, P);
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 4 }, 0, LT, P)}"/>`);
      // ── rubber feet, then the tray: floor and the two far walls
      const feet = [[X0 + 14, Y0 + 14], [X1 - 14, Y0 + 14], [X0 + 14, Y1 - 14], [X1 - 14, Y1 - 14]].sort((a, b) => depth([...a, 0]) - depth([...b, 0]));
      for (const [x, y] of feet) out.push(T.cyl(P, x, y, 6, 0, FT, "lo", T.C.rubber, 20));
      out.push(T.slab(P, { x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 2 }, FT, FL - FT, "lo", T.C.white, 4));
      out.push(`<g data-name="tray">${box([X0, X1], [Y0, Y0 + WALL], [FL, WT], "mid", T.C.white)}${box([X0, X0 + WALL], [Y0 + WALL, Y1 - WALL], [FL, WT], "mid", T.C.white)}</g>`);
      // ── the board on four standoffs, and everything on it, far to near
      const bx = [X0 + 9, X1 - 9], by = [Y0 + 7, Y1 - 3];
      const stand = [[bx[0] + 6, by[0] + 6], [bx[1] - 6, by[0] + 6], [bx[0] + 6, by[1] - 8], [bx[1] - 6, by[1] - 8]];
      out.push(stand.map(([x, y]) => T.cyl(P, x, y, 2.6, FL, 10 - FL, "mid", T.C.white, 16)).join(""));
      out.push(`<g data-part="boardin"></g><g data-part="boardleds"></g>`);
      // ── the near walls: the side with vent slots, the back with the port openings
      const vents = [];
      for (let i = 0; i < 9; i++) { const y = -36 + i * 8; vents.push(T.quad(P, [[X1 + 0.02, y, 13], [X1 + 0.02, y + 3, 13], [X1 + 0.02, y + 3, 23], [X1 + 0.02, y, 23]], "#5a6068", "#2a2e33", 0.4)); }
      out.push(`<g data-name="tray">${box([X1 - WALL, X1], [Y0 + WALL, Y1 - WALL], [FL, WT], "mid", T.C.white)}${vents.join("")}</g>`);
      const yf = Y1 + 0.02, holes = [];
      JACKS.forEach((x, i) => {
        holes.push(T.quad(P, [[x - 6.5, yf, PB + 1], [x + 6.5, yf, PB + 1], [x + 6.5, yf, PB + 12], [x - 6.5, yf, PB + 12]], i ? "#3c5f86" : "#c99a2a", "#1a1d21", 0.6));
        holes.push(T.quad(P, [[x - 4.6, yf, PB + 2.4], [x + 4.6, yf, PB + 2.4], [x + 4.6, yf, PB + 8.6], [x + 2, yf, PB + 8.6], [x + 2, yf, PB + 10.2], [x - 2, yf, PB + 10.2], [x - 2, yf, PB + 8.6], [x - 4.6, yf, PB + 8.6]], "#16191d", "#0d0e10", 0.4));
      });
      holes.push(T.quad(P, [[49.5, yf, PB + 2], [56.5, yf, PB + 2], [56.5, yf, PB + 9], [49.5, yf, PB + 9]], "#16191d", "#0d0e10", 0.5));
      holes.push(T.L(K.pathOf([[63.5, yf, PB + 3.5], [66.5, yf, PB + 3.5], [66.5, yf, PB + 6.5], [63.5, yf, PB + 6.5]].map((p) => K.iso(p, P)), true), { tone: "mid" }));
      out.push(`<g data-name="tray">${box([X0, X1], [Y1 - WALL, Y1], [FL, WT], "mid", T.C.white)}</g><g data-name="ports">${holes.join("")}</g>`);
      // ── the lid: a shallow white cap with vent slots over the processor and the four light windows
      const slots = [];
      for (let r = 0; r < 5; r++) for (const [a, b] of [[-62, -22], [-14, 26]]) { const y = 6 + r * 8; slots.push(T.quad(P, [[a, y, LT + 0.02], [b, y, LT + 0.02], [b, y + 3, LT + 0.02], [a, y + 3, LT + 0.02]], "#7d848c", "#4a5058", 0.4)); }
      out.push(`<g data-part="lid"><g data-name="lid">${T.slab(P, { x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 2 }, WT, LT - WT, "hi", T.C.white, 4, 0.8, T.L(K.sideSeam({ x: X0, y: Y0, w: X1 - X0, d: Y1 - Y0, r: 2 }, WT + 2, P, 4), { tone: "faint" }))}${slots.join("")}</g><g data-part="lidleds" data-name="leds"></g></g>`);
      // ── the two antennas: a fixed hinge block on the back wall, the paddle turning about x at the hinge pin (ant° out)
      const hinge = (x) => box([x - 7, x + 7], [Y1, Y1 + 9.2], [16, 26], "mid", T.C.black) + ISO.tinted(T.C.black, T.S(G.disc(-6.5, -3.2, 4.5, G.frameAlong([x, AY, 30.5], [1, 0, 0]), P), { tone: "mid" }) + T.S(G.disc(3.2, 6.5, 4.5, G.frameAlong([x, AY, 30.5], [1, 0, 0]), P), { tone: "mid" }));
      const paddle = (x, a) => {
        const V = [0, Math.sin(a), Math.cos(a)], Wv = [0, Math.cos(a), -Math.sin(a)], o0 = [x, AY, 30.5];
        const at = T.frame(o0, [1, 0, 0], Wv, V), tip = T.add(o0, T.mul(V, AH - 6 - 30.5));
        // the knuckle turning between the hinge's two cheeks, the paddle, its rounded tip
        return ISO.tinted(T.C.black, T.S(G.disc(-3.2, 3.2, 4.2, G.frameAlong(o0, [1, 0, 0]), P), { tone: "hi" })) + T.obox(P, at, [-6, 6], [-3, 3], [4.5, AH - 6 - 30.5], "hi", T.C.black) +
          ISO.tinted(T.C.black, T.S(G.disc(-3, 3, 6, G.frameAlong(tip, Wv), P), { tone: "hi" }));
      };
      out.push(`<g data-name="antenna">${hinge(ANT[0])}${hinge(ANT[1])}</g><g data-part="ant" data-name="antenna"></g><g data-part="waves"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];

      const st = { on: o.on === "1", lid: B36.num(o, "lid", 0, 0, 1), want: 0, ant: B36.num(o, "ant", 0, 0, 90), antW: 0, t: 0, lit: o.lit || "" };
      st.want = st.lid; st.antW = st.ant;
      g.anchors = { top: [0, 0, LT * F], power: [53 * F, Y1 * F, (PB + 5.5) * F] };
      // light colours from the state: power steady, internet after a second, Wi-Fi and home flicker with traffic
      const ledColours = () => {
        if (!st.on) return LEDS.map(() => T.LED.off);
        const b = Math.floor(st.t * 7), flick = (n) => ((b * 2654435761 + n * 97) >>> 7) % 3 !== 0;
        return [T.LED.green, st.t > 1 ? T.LED.green : T.LED.off, flick(1) ? T.LED.blue : T.LED.off, flick(2) ? T.LED.green : T.LED.off];
      };
      const ledSvg = (cols, z, board) => cols.map((c, i) => {
        const x = LEDS[i], y = board ? -56 : -53;
        return board ? box([x - 2, x + 2], [y, y + 2.4], [PB, PB + 1.2], "hi", ISO.tint(c, [c, c, c, c], "#1a1d21")) : T.quad(P, [[x - 5, y, z], [x + 5, y, z], [x + 5, y + 3, z], [x - 5, y + 3, z]], c, "#4a5058", 0.5);
      }).join("");
      // radio waves: three rings spreading out round the router at antenna height, born and fading out
      const waveMemo = [], wavesSvg = (q) => waveMemo[q] || (waveMemo[q] = [0, 1, 2].map((i) => {
        const f = ((q / 36) + i / 3) % 1, r = 55 + f * 120, a = Math.sin(Math.PI * f) * 0.5;
        return `<path d="${K.ring(0, 20, r, AH * 0.62, P, 72)}" fill="none" stroke="#2f8fe8" stroke-width="1.6" opacity="${a.toFixed(2)}"/>`;
      }).join(""));
      const draw = () => {
        w.attr(el.lid, "transform", K.translateAlong(P, LIDV.map((v) => v * st.lid)));
        const cols = ledColours(), key = cols.join();
        w.rebuild(el.lidleds, key, () => ledSvg(cols, LT + 0.03, false));
        w.rebuild(el.boardleds, key, () => ledSvg(cols, 0, true));
        const q = Math.floor((st.t / 2.4) * 36) % 36;
        w.rebuild(el.waves, st.on ? String(q) : "", () => (st.on ? wavesSvg(q) : ""));
        const aq = Math.round(st.ant);
        w.rebuild(el.ant, String(aq), () => paddle(ANT[0], (aq * Math.PI) / 180) + paddle(ANT[1], (aq * Math.PI) / 180));
        B36.light(w, g, st.lit);
        const up = st.lid > 0.5;
        w.rebuild(el.words, lab ? `${up} ${st.ant > 30}` : "", () => !lab ? "" : [
          st.ant > 30 ? T.word(P, [ANT[1], AY + 60, 70], "antennas folded out", { anchor: "start", dx: 14 }) : T.word(P, [ANT[1], AY, AH * 0.8], "antenna", { anchor: "start", dx: 10 }),
          T.word(P, [JACKS[2], Y1, PB], "internet + 4 home ports", { dy: 26 }),
          T.word(P, [0, Y0, up ? LT + LIDV[2] : LT], up ? "lid" : "lights", { anchor: "end", dx: -36, dy: -6 }),
          up ? T.word(P, [-20, 0, PB + 16], "processor + heatsink", { dy: -10 }) : "",
          up ? T.word(P, [46, -32, PB + 4], "radio chips under metal cans", { anchor: "start", dx: 14, dy: 4 }) : "",
        ].join(""));
      };
      g.set = (p) => {
        if (p.on !== undefined) { st.on = !!+p.on; st.t = 0; }
        if (p.lid !== undefined) st.want = ISO.clamp(+p.lid, 0, 1);
        if (p.ant !== undefined) st.antW = ISO.clamp(+p.ant, 0, 90);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.t += dt;
        st.lid = ISO.follow(st.lid, st.want, dt, 0.25, ISO.still());
        if (Math.abs(st.lid - st.want) < 0.002) st.lid = st.want;
        st.ant = ISO.follow(st.ant, st.antW, dt, 0.3, ISO.still());
        if (Math.abs(st.ant - st.antW) < 0.2) st.ant = st.antW;
        draw();
        return st.on || st.lid !== st.want || st.ant !== st.antW;
      };
      g.readout = () => (st.lid > 0.5 ? "lid off · the processor (under its heatsink) passes data between the ports and the radios; the metal cans shield the 2.4 GHz and 5 GHz radio chips; thin cables carry their signal to the antennas"
        : st.on ? "on · Wi-Fi sends on 2.4 GHz (waves 12.5 cm long) and 5 GHz (6 cm), spreading out in all directions · one internet port, four home ports" : "off");
      // the board and everything on it is under the lid: built in a second part (the build budget)
      ISO.later(() => {
        const items = [];
        const put = (c, svg) => items.push({ k: depth(c), svg });
        // processor: the chip under an aluminium heatsink with seven fins across the air flow
        const soc = [box([-31, -9], [-11, 11], [PB, PB + 1.6], "mid", T.C.chip), box([-34, -6], [-14, 14], [PB + 1.6, PB + 4], "mid", T.C.alu)];
        for (let i = 0; i < 7; i++) { const x = -33.4 + i * 4.3; soc.push(box([x, x + 1.3], [-14, 14], [PB + 4, PB + 16], "hi", T.C.alu)); }
        put([-20, 0, PB], `<g data-name="soc">${soc.join("")}</g>`);
        put([9, -2, PB], box([2, 16], [-8, 4], [PB, PB + 1.2], "mid", T.C.chip));
        put([7, 12, PB], box([2, 12], [8, 16], [PB, PB + 1.2], "mid", T.C.chip));
        put([2, 32, PB], box([-10, 14], [24, 40], [PB, PB + 1.4], "mid", T.C.chip));
        // the two radio chips under their shield cans (2.4 GHz left, 5 GHz right)
        const can = (x) => `${box(x, [-47, -17], [PB, PB + 3.6], "hi", T.C.steel)}${T.L(K.planOutline(K.insetPlan({ x: x[0], y: -47, w: x[1] - x[0], d: 30, r: 0 }, 3), PB + 3.6, P, 1), { tone: "faint" })}`;
        put([-60, -32, PB], `<g data-name="wifi">${can([-76, -44])}</g>`);
        put([46, -32, PB], `<g data-name="wifi">${can([30, 62])}</g>`);
        // capacitors by the power jack
        for (const x of [44, 53, 62]) put([x, 30, PB], T.cyl(P, x, 30, 3, PB, 8, "hi", T.C.dark, 16) + T.L(K.ring(x, 30, 1.8, PB + 8, P, 12), { tone: "lo" }));
        // the network jacks, the power jack and the reset button, all against the back wall
        put([-12, 53, PB], `<g data-name="ports">${JACKS.map((x) => box([x - 7.5, x + 7.5], [44, Y1 - WALL], [PB, PB + 13.5], "mid", T.C.steel)).join("")}</g>`);
        put([53, 55, PB], box([48, 58], [48, Y1 - WALL], [PB, PB + 11], "mid", T.C.black));
        put([65, 59, PB], box([62.5, 67.5], [56, Y1 - WALL], [PB, PB + 5], "mid", T.C.black));
        // the radio connectors and their cables up to the antennas' feet in the back wall
        for (const x of ANT) {
          put([x, 44, PB], T.cyl(P, x, 44, 1.8, PB, 1.6, "hi", T.C.gold, 14) +
            T.quad(P, [[x - 0.7, 44, PB + 1.6], [x + 0.7, 44, PB + 1.6], [x + 0.7, Y1 - WALL, 22], [x - 0.7, Y1 - WALL, 22]], "#3a3e44", "#0d0e10", 0.4));
        }
        items.sort((a, b) => a.k - b.k);
        el.boardin.innerHTML = `<g data-name="board">${box(bx, by, [10, PB], "lo", T.C.pcb)}${items.map((i) => i.svg).join("")}</g>`;
        B36.light(w, g, st.lit);
      });
      draw();
      return g;
    },
  });
})();
