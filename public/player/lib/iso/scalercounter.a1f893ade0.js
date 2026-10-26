// "scalercounter cx cy k rate=0..10000 run=0|1 count=0..99999 lab=0 lit=case|display|input|buttons|knob" — a PART
// (PARTS.md, batch 5): the counter of penetration.js, its origin the bench point under its middle. A school scaler /
// ratemeter 20 × 12 × 8 cm on rubber feet: a dark front panel facing +y with a green count display, the rate under it,
// START, STOP and RESET buttons, a count-time knob, a power rocker with its pilot light, and the GM tube's BNC input
// (anchor `input`, the socket's mouth: a gmtube's cable plugs in there, to=<id>.input). rate = what reaches the tube
// in counts a minute (background alone is about 20); with run=1 the count rises in real time at that rate, eased
// display of the rate; count= sets the count (0 resets). set({ rate, run, count }).
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const HX = 100, HY = 60, Z0 = 4, Z1 = 80, FY = HY + 0.6, LED = "#7fe08a";
  ISO.add({
    name: "scalercounter", title: "Scaler counter (part)", compare: null,
    about: "A school scaler / ratemeter for a Geiger–Müller tube: green count display that rises as counts come in, the rate in counts a minute under it, buttons, a count-time knob and the tube's BNC input on the front (+y). anchors: input top",
    line: "scalercounter cx cy k rate=0..10000 run=0|1 count=0..99999 lab=0 lit=case|display|input|buttons|knob",
    demo: { line: "scalercounter 480 360 30 rate=20 run=1 lab=1", script: [{ set: {}, hold: 1.5 }, { set: { rate: 1500, lit: "display" }, hold: 2.5 }, { set: { rate: 450, count: 0, lit: "input" }, hold: 2 }, { set: { run: 0, lit: "buttons" }, hold: 1.2 }, { set: { run: 1, rate: 20, lit: "knob" }, hold: 1.2 }, { set: { lit: "case" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const s = { rate: ISO.clamp(ISO.num(o, "rate", 20), 0, 10000), run: o.run !== "0", count: ISO.clamp(ISO.num(o, "count", 0), 0, 99999) };
      s.shown = s.rate;
      let lit = o.lit || "";
      const steel = (svg) => ISO.tinted(ISO.T.steel, svg), plastic = (svg) => ISO.tinted(ISO.T.plastic, svg);
      const fy = (x, z, y = FY + 0.05) => K.iso([x, y, z], Pm), quad = (x0, x1, z0, z1, y) => K.pathOf([fy(x0, z0, y), fy(x1, z0, y), fy(x1, z1, y), fy(x0, z1, y)], true);
      const AY = (x, z) => G.frameOf([x, FY, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 6 };
      const feet = ISO.tinted(ISO.T.rubber, [[-HX + 12, -HY + 12], [HX - 12, -HY + 12], [-HX + 12, HY - 12], [HX - 12, HY - 12]].map(([x, y]) => S(K.cylinder(x, y, 7, 0, Z0, Pm, 20), { tone: "lo" })).join(""));
      const body = ISO.tinted(ISO.T.paint, S(K.slabOf(plan, Z0, Z1 - Z0, Pm, 4, 2), { tone: "mid" }));
      // vent slots on top toward the back: closed dark slots
      const vents = `<path d="${[-60, -45, -30, -15, 0, 15, 30, 45, 60].map((x) => K.pathOf([[x - 1.3, -40], [x + 1.3, -40], [x + 1.3, -10], [x - 1.3, -10]].map(([a, b]) => K.iso([a, b, Z1 + 0.05], Pm)), true)).join("")}" fill="#2c3440" stroke="#1a1f26" stroke-width="0.4"/>`;
      // the front panel: a dark plate set on the +y face, the display window, print
      const panel = plastic(ISO.wbox(Pm, [-HX + 8, HX - 8], [HY, FY], [Z0 + 6, Z1 - 6], "mid"));
      const display = `<path d="${quad(-84, 6, 38, 68)}" fill="#0f1a12" stroke="#5a6a60" stroke-width="0.6"/>`;
      const print = LAB.faceText(Pm, [-39, FY + 0.06, 70.5], [1, 0, 0], "SCALER · RATEMETER", 4, "#cfd6de") +
        LAB.faceText(Pm, [70, FY + 0.06, 44], [1, 0, 0], "GM INPUT", 3.6, "#cfd6de") + LAB.faceText(Pm, [30, FY + 0.06, 34], [1, 0, 0], "TIME", 3.4, "#cfd6de") +
        [["START", -68], ["STOP", -48], ["RESET", -28]].map(([w, x]) => LAB.faceText(Pm, [x, FY + 0.06, 13], [1, 0, 0], w, 3, "#cfd6de")).join("");
      // the buttons: short round push buttons standing out of the panel
      const btn = (x, tint) => ISO.tinted(tint, S(G.disc(0, 3.5, 5, AY(x, 22), Pm), { tone: "hi" }));
      const buttons = btn(-68, ISO.T.green) + btn(-48, ISO.T.red) + btn(-28, ISO.T.steel);
      // the count-time knob: a skirt with ticks round it, a knurled cap, a white pointer line on its face
      const ticks = []; for (let i = 0; i <= 6; i++) { const a = Math.PI * (1.25 - i * 0.25), r0 = 12.5, r1 = 15; ticks.push(K.pathOf([fy(30 + Math.cos(a) * r0, 52 + Math.sin(a) * r0), fy(30 + Math.cos(a) * r1, 52 + Math.sin(a) * r1)])); }
      const kf = AY(30, 52);
      const knob = `<path d="${ticks.join("")}" stroke="#cfd6de" stroke-width="0.7" fill="none"/>` + plastic(S(G.disc(0, 2, 11, kf, Pm), { tone: "mid" }) + S(G.disc(2, 9, 8.5, kf, Pm), { tone: "hi", inner: L([3.5, 5, 6.5].map((v) => G.arcOf(kf, v, 8.5, Pm)).join(""), { tone: "faint" }) })) +
        `<path d="${K.pathOf([K.iso([30, FY + 9.06, 52], Pm), K.iso([30 + 6, FY + 9.06, 52 + 6], Pm)])}" stroke="#f4f6f8" stroke-width="${Math.max(0.6, G.scaleOf(Pm) * 1).toFixed(2)}" stroke-linecap="round"/>`;
      // the BNC input: flange, barrel with its two bayonet pins, the dark mouth
      const bf = AY(70, 30);
      const input = steel(S(G.disc(0, 1.2, 8, bf, Pm), { tone: "mid" }) + S(G.disc(1.2, 9, 5.2, bf, Pm), { tone: "hi" }) + S(G.disc(0, 2, 1, G.frameOf([70 + 5.2, FY + 6, 30], [1, 0, 0], [0, 1, 0], [0, 0, 1]), Pm), { tone: "mid" })) + B22.hole(Pm, [70, FY + 9.05, 30], [1, 0, 0], [0, 0, 1], 3.2);
      // the power rocker and its pilot light
      const rocker = ISO.tinted(ISO.T.red, ISO.wbox(Pm, [62, 78], [FY, FY + 3], [56, 66], "hi")) + `<circle cx="${fy(86, 61)[0].toFixed(1)}" cy="${fy(86, 61)[1].toFixed(1)}" r="${(G.scaleOf(Pm) * 2).toFixed(2)}" fill="#ffd34d" stroke="#6b5114" stroke-width="0.5"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, Z1, Pm)}"/><g data-name="case">${feet}${body}${vents}${panel}${rocker}${print}</g>` +
        `<g data-name="display">${display}<g data-part="digits"></g></g><g data-name="buttons">${buttons}</g><g data-name="knob">${knob}</g><g data-name="input">${input}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, Z1 + 40], "counter", "#445", { dy: -6 });
      g.anchors = { input: [7, (FY + 9) / 10, 3], top: [0, 0, Z1 / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const n = Math.floor(s.count), r = Math.round(s.shown);
        w.rebuild(el.digits, `${n} ${r} ${s.run}`, () => LAB.faceText(Pm, [-39, FY + 0.1, 48], [1, 0, 0], String(n).padStart(5, "0"), 17, LED) +
          LAB.faceText(Pm, [-39, FY + 0.1, 41], [1, 0, 0], `${r} /min${s.run ? "" : " · stopped"}`, 4.2, LED));
        B22.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.rate !== undefined && p.rate !== "" && Number.isFinite(+p.rate)) s.rate = ISO.clamp(+p.rate, 0, 10000);
        if (p.run !== undefined) s.run = String(p.run) !== "0";
        if (p.count !== undefined && p.count !== "" && Number.isFinite(+p.count)) s.count = ISO.clamp(+p.count, 0, 99999);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        if (s.run && !ISO.still() && dt < 1) s.count = Math.min(99999, s.count + (s.rate / 60) * dt);
        s.shown = ISO.follow(s.shown, s.rate, dt, 0.6, ISO.still());
        draw();
        return s.run || s.shown !== s.rate;
      };
      g.readout = () => `counter · ${Math.floor(s.count)} counts · about ${Math.round(s.rate)} counts a minute${s.rate <= 25 ? " (background only)" : ""}${s.run ? "" : " · stopped"}`;
      draw();
      return g;
    },
  });
})();
