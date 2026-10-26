// "blowerfan cx cy k spin=0|1 lab=0 lit=housing|cover|rotor" — a PART (PARTS.md, batch 6): the laptop blower fan of
// laptop.js on its own, lying flat, its origin the surface point under its middle. A plastic scroll housing on a
// steel floor plate, three screw lugs, a steel top cover with the round intake, the 24-blade rotor seen through it
// on its hub (with the motor's round label), and the outlet duct opening on the right (+x) with its guide vanes; the
// fan's four-wire lead off the back. 6 × 6 × 0.6 cm. spin=1 turns the rotor (shown slowed: a real one runs at about
// 5000 rpm). set({ spin }). Built in mm (ISO.mm); the anchor (outlet, the duct mouth's middle) in cm.
(() => {
  const K = window.K;
  const C = [-4, 2], R = 26, HOLE = 16.5, HUB = 7, ZW = [0.4, 5.6], ZC = 6, DUCT = { x: [C[0], 30], y: [-25, -4] };
  ISO.add({
    name: "blowerfan", title: "Laptop blower fan (part)", compare: null,
    about: "A laptop blower fan lying flat: a scroll housing with its outlet duct, a steel cover with the round intake and the 24-blade rotor that spins in it. anchors: outlet",
    line: "blowerfan cx cy k spin=0|1 lab=0 lit=housing|cover|rotor",
    demo: { line: "blowerfan 480 290 55 lab=1", script: [{ set: {}, hold: 1 }, { set: { spin: 1 }, hold: 2.4 }, { set: { lit: "rotor" }, hold: 1.4 }, { set: { spin: 0, lit: "housing" }, hold: "settle" }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const depth = ([x, y]) => K.depthOf([x, y, 0], Pm), dC = depth(C);
      // three lugs round the housing, each a tab with a screw; those nearer than the middle paint after the wall
      const lugs = [130, 250, 20].map((a) => [C[0] + (R + 3) * Math.cos((a * Math.PI) / 180), C[1] + (R + 3) * Math.sin((a * Math.PI) / 180)]);
      const lug = ([x, y]) => T.cyl(Pm, x, y, 4.2, 0, 1, "mid", T.C.dark, 18) + T.cyl(Pm, x, y, 2.2, 1, 0.8, "hi", T.C.steel, 14) +
        `<path d="${K.pathOf([[x - 1.4, y, 1.82], [x + 1.4, y, 1.82]].map((p) => K.iso(p, Pm)))}" stroke="#3c3f45" stroke-width="${Math.max(0.5, K.cameraOf(Pm).k * 0.35).toFixed(2)}"/>`;
      const farLugs = lugs.filter((p) => depth(p) < dC), nearLugs = lugs.filter((p) => depth(p) >= dC);
      // the lead: four thin wires out of the back of the housing, lying on the surface to a small white plug
      const lead = [-1.2, -0.4, 0.4, 1.2].map((d, i) => { const pts = [[C[0] - 14 + d * 1.4, C[1] + R - 3, 0.6], [C[0] - 14 + d * 1.4, C[1] + R + 6, 0.6], [C[0] - 24 + d * 1.4, C[1] + R + 12, 0.6]]; return `<path d="${K.pathOf(pts.map((p) => K.iso(p, Pm)))}" fill="none" stroke="${["#d23a2f", "#202226", "#e8c33a", "#3a6fd0"][i]}" stroke-width="${Math.max(0.6, K.cameraOf(Pm).k * 0.55).toFixed(2)}" stroke-linecap="butt"/>`; }).join("") +
        T.box(Pm, [C[0] - 30, C[0] - 18], [C[1] + R + 12, C[1] + R + 16], [0, 2.4], "mid", T.C.white);
      const housing = [T.cyl(Pm, C[0], C[1], R + 1, 0, ZW[0], "lo", T.C.steel, 48), T.box(Pm, DUCT.x, [DUCT.y[0] - 1, DUCT.y[1]], [0, ZW[0]], "lo", T.C.steel)];
      housing.push(T.cyl(Pm, C[0], C[1], R, ZW[0], ZW[1] - ZW[0], "mid", T.C.dark, 48), T.box(Pm, DUCT.x, DUCT.y, ZW, "mid", T.C.dark));
      // the outlet: the dark mouth on the duct's end face and its guide vanes, each from the floor to the roof
      const ox = DUCT.x[1] + 0.02, vanes = [-21, -16.5, -12, -7.5].map((y) => K.pathOf([[ox, y, ZW[0] + 0.6], [ox, y, ZW[1] - 0.6]].map((p) => K.iso(p, Pm)))).join("");
      const mouth = T.quad(Pm, [[ox, DUCT.y[0] + 1.5, ZW[0] + 0.6], [ox, DUCT.y[1] - 1.5, ZW[0] + 0.6], [ox, DUCT.y[1] - 1.5, ZW[1] - 0.6], [ox, DUCT.y[0] + 1.5, ZW[1] - 0.6]], "#16181b", "#0b0c0e", 0.5) +
        `<path d="${vanes}" stroke="#5a6068" stroke-width="${Math.max(0.5, K.cameraOf(Pm).k * 0.5).toFixed(2)}"/>`;
      // the cover: a steel plate over housing and duct, its intake hole dark, the rim of the hole
      const cover = T.cyl(Pm, C[0], C[1], R, ZW[1], ZC - ZW[1], "hi", T.C.steel, 48) + T.box(Pm, [C[0] + 12, DUCT.x[1]], DUCT.y, [ZW[1], ZC], "hi", T.C.steel) +
        `<path d="${K.ring(C[0], C[1], HOLE, ZC + 0.01, Pm, 48)}" fill="#2a2e33" stroke="#101215" stroke-width=".6"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -34, y: -30, w: 68, d: 62, r: 6 }, 0, ZC, Pm)}"/>` +
        `<g data-name="housing">${farLugs.map(lug).join("")}${lead}${housing.join("")}${mouth}${nearLugs.map(lug).join("")}</g><g data-name="cover">${cover}</g><g data-name="rotor"></g><g data-part="words"></g>`;
      const el = { rotor: g.querySelector('[data-name="rotor"]') };
      // the rotor seen through the intake: 24 curved blades from the hub to the hole's rim, the hub with its label;
      // symmetric every 15°, so 15 poses each built once
      const memo = [], rotorSvg = (q) => memo[q] || (memo[q] = (() => {
        const a0 = (q / 15) * ((2 * Math.PI) / 24), bl = [];
        for (let i = 0; i < 24; i++) {
          const a = a0 + (i * 2 * Math.PI) / 24, pts = [];
          for (let j = 0; j <= 4; j++) { const r = HUB + ((HOLE - 0.05 - HUB) * j) / 4, b = a + 0.45 * (j / 4) ** 1.3; pts.push(K.iso([C[0] + r * Math.cos(b), C[1] + r * Math.sin(b), ZC + 0.02 + 0.6 * (1 - j / 4)], Pm)); }
          bl.push(K.pathOf(pts));
        }
        return T.cyl(Pm, C[0], C[1], HUB, ZC - 0.6, 1.2, "hi", T.C.dark, 32) + T.L(bl.join(""), { tone: "mid" }) + `<path d="${K.ring(C[0], C[1], HUB * 0.62, ZC + 0.62, Pm, 28)}" fill="#e8e6df" stroke="#6b655c" stroke-width=".4"/>`;
      })());
      const st = { spin: o.spin === "1", a: 0, v: o.spin === "1" ? 1 : 0, lit: o.lit || "" };
      const w = ISO.writer();
      const draw = () => {
        const step = (2 * Math.PI) / 24, q = Math.floor(((st.a % step) / step) * 15) % 15;
        w.rebuild(el.rotor, String(q), () => rotorSvg(q));
        B.light(w, g, st.lit);
      };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = T.word(Pm, [C[0], C[1] - HOLE, ZC], "rotor, 24 blades", { anchor: "end", dx: -10, dy: -14 }) + T.word(Pm, [DUCT.x[1], -14, 3], "outlet", { anchor: "start", dx: 8 }) + T.word(Pm, [C[0] - R, C[1], 3], "scroll housing", { anchor: "end", dx: -8 });
      g.anchors = { outlet: [(DUCT.x[1] + 0.5) / 10, (DUCT.y[0] + DUCT.y[1]) / 20, (ZW[0] + ZW[1]) / 20] };
      g.set = (p) => {
        if (p.spin !== undefined) st.spin = String(p.spin) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // spins up and down over about a second; ISO.still() jumps to the target speed and holds the pose
      g.update = (dt) => {
        const calm = ISO.still(), want = st.spin ? 1 : 0;
        st.v = ISO.follow(st.v, want, dt, 0.4, calm); if (Math.abs(st.v - want) < 0.01) st.v = want;
        if (!calm) st.a = (st.a + dt * st.v * 2.6) % (2 * Math.PI);
        draw();
        return st.v > 0 && !calm || st.v !== want;
      };
      g.readout = () => (st.spin ? "blower fan running · draws air in through the round intake and blows it out of the side duct, through the heat-pipe fins (~5000 rpm, shown slowed)" : "laptop blower fan · 60 × 60 × 6 mm, 24 blades · 5 V");
      draw();
      return g;
    },
  });
})();
