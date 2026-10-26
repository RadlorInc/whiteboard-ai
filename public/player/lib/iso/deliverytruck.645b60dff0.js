// "deliverytruck cx cy k door=0..1 roll=0..1 lab=0 lit=cab|box|door|ramp|wheels|cartons" — a PART (batch 6, economy):
// a box delivery truck on the road, its origin the road point under its middle at roll 0, its length along x with the
// cab at −x (driving toward −x) and the cargo box's back door at +x, its near side toward the room (+y). 650 × 230 ×
// 300 cm: a cab with a sloped windscreen, side window, door seams, handle, mirror and step over its wheel arch; a
// chassis with side guard rails and a fuel tank; a cargo box with corner posts and a roll-up back door in its frame,
// cartons inside, a ramp stowed under the floor; front wheels and twin rear wheels with hubs and wheel nuts. door 0 → 1
// rolls the back door up (to 0.6), then slides the ramp out and down to the road; roll 0 → 1 drives it 4 m forward
// (−x), the wheels turning as they roll. set({ door, roll }). World: 1 = 1 cm. anchors: back (the cargo floor's back
// edge), ramp (the ramp's foot on the road when out), top — placed at roll 0
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const X0 = -325, X1 = 325, HY = 115, BX = -140, ZF = 110, ZT = 300, R = 48, AX = [-240, 180], RUN = 400, RL = 200;
  let uid = 0;
  ISO.add({
    name: "deliverytruck", title: "Delivery truck (part)", compare: null,
    about: "A box delivery truck 650 × 230 × 300 cm: cab, cargo box with a roll-up back door, a ramp, twin rear wheels; door opens the back and lowers the ramp, roll drives it forward with the wheels turning. anchors: back ramp top",
    line: "deliverytruck cx cy k door=0..1 roll=0..1 lab=0 lit=cab|box|door|ramp|wheels|cartons",
    demo: { line: "deliverytruck 560 410 0.7 door=0 roll=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { door: 1, lit: "door" }, hold: "settle" }, { set: { lit: "cartons" }, hold: 1.4 }, { set: { door: 0, lit: "ramp" }, hold: "settle" }, { set: { roll: 1, lit: "wheels" }, hold: "settle" }, { set: { roll: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { door: B.num(o, "door", 0, 0, 1), roll: B.num(o, "roll", 0, 0, 1), lit: o.lit || "" };
      st.wd = st.door; st.wr = st.roll;
      const box = (x, y, z) => ISO.wbox(P, x, y, z, "mid");
      const CAB = ISO.tint("#f2f4f6", ["#a9b0b8", "#b8bec5", "#c7ccd2", "#d6dadf"], "#3a424a");
      const BOXT = ISO.tint("#f7f7f2", ["#bcbcb4", "#c9c9c2", "#d6d6d0", "#e3e3de"], "#4a4a44");
      const TRIM = ISO.tint("#5a6e88", ["#24324a", "#2c3c56", "#354762", "#40526e"], "#0e1626");
      const RUB = ISO.T.rubber, STEEL = ISO.T.steel, id = "b45t" + uid++;
      // ── the cab profile in (x, z) with the front wheel arch cut, extruded across y
      const arch = []; for (let i = 0; i <= 14; i++) { const a = Math.PI - (i / 14) * Math.PI; arch.push([AX[0] + Math.cos(a) * 58, 48 + Math.sin(a) * 58]); }
      const prof = [[X0, 45], [AX[0] - 58, 45], ...arch.slice(1, -1), [AX[0] + 58, 45], [-150, 45], [-150, 268], [-245, 268], [-302, 200], [-320, 150], [X0, 90]];
      const cab = ISO.prismY(P, prof, -HY + 5, HY - 5, ["#9aa2aa", "#e6e9ec"], "#eef0f2", "#3a424a");
      const ys = HY - 4.98, at = (x, z) => [x, ys, z];
      const cabWin = B.poly(P, [at(-250, 255), at(-168, 255), at(-168, 182), at(-293, 182), at(-293, 196)], "#9fbcd0", "#1e2a36", 0.8) +
        B.free(P, [[at(-280, 186), at(-250, 248)]], "#ffffff", 1.4, ' opacity=".6" stroke-linecap="round"');
      const seams = B.free(P, [[at(-160, 62), at(-160, 262)], [at(-160, 262), at(-247, 262)], [at(-262, 62), at(-262, 120)], [at(-262, 62), at(-160, 62)]], "#3a424a", 0.7);
      const cabBits = ISO.tinted(TRIM, box([-196, -176], [ys, ys + 3], [160, 166]) + box([X0 - 3, -300], [-HY + 5, HY - 5], [45, 75]) + box([-262, -175], [ys - 10, ys + 8], [40, 48])) +
        ISO.tinted(ISO.T.plastic, box([-256, -252], [ys, ys + 22], [214, 218]) + box([-258, -250], [ys + 18, ys + 26], [190, 240]));
      // ── chassis, guard rails, fuel tank, rear bumper
      const chassis = ISO.tinted(ISO.T.plastic, box([X0 + 30, X1 - 5], [-70, -50], [70, 100]) + box([X0 + 30, X1 - 5], [50, 70], [70, 100]));
      const tank = ISO.tinted(STEEL, S(G.disc(-120, -40, 22, LAB.X([0, 82, 74]), P, { steps: 20 }), { tone: "mid" }));
      const guards = ISO.tinted(STEEL, box([-30, AX[1] - 62], [HY - 6, HY - 2], [56, 62]) + box([-30, AX[1] - 62], [HY - 6, HY - 2], [80, 86]) + box([-30, -24], [HY - 8, HY - 2], [56, 104]) + box([AX[1] - 68, AX[1] - 62], [HY - 8, HY - 2], [56, 104]));
      const bumper = ISO.tinted(TRIM, box([X1 - 12, X1], [-HY + 10, HY - 10], [48, 66]));
      // ── the cargo box: the shell, corner posts and the back frame; a clipped view into the back through the opening
      const shell = ISO.tinted(BOXT, box([BX, X1 - 4], [-HY, HY], [ZF, ZT]));
      const posts = ISO.tinted(TRIM, box([X1 - 10, X1], [HY - 8, HY], [ZF, ZT]) + box([X1 - 10, X1], [-HY, -HY + 8], [ZF, ZT]) + box([X1 - 10, X1], [-HY, HY], [ZT - 14, ZT]) + box([X1 - 10, X1], [-HY, HY], [ZF - 6, ZF]) +
        box([BX, X1], [HY - 2, HY + 1], [ZT - 6, ZT]) + box([BX, X1], [HY - 2, HY + 1], [ZF, ZF + 6]));
      const xo = X1 + 0.02, op = [[xo, -HY + 8, ZF], [xo, HY - 8, ZF], [xo, HY - 8, ZT - 14], [xo, -HY + 8, ZT - 14]];
      const clip = `<clipPath id="${id}"><path d="${K.pathOf(op.map((p) => K.iso(p, P)), true)}"/></clipPath>`;
      const inside = B.poly(P, op, "#2c3034", "none") + B.poly(P, [[X1 - 160, -HY + 8, ZF], [X1, -HY + 8, ZF], [X1, HY - 8, ZF], [X1 - 160, HY - 8, ZF]], "#55595e", "none") +
        B.carton(P, [X1 - 120, X1 - 60], [-90, -40], [ZF, ZF + 45], { label: false }) + B.carton(P, [X1 - 120, X1 - 60], [-90, -40], [ZF + 45, ZF + 90], { label: false }) +
        B.carton(P, [X1 - 70, X1 - 15], [-30, 25], [ZF, ZF + 50]) + B.carton(P, [X1 - 120, X1 - 70], [40, 90], [ZF, ZF + 40], { label: false });
      // ── wheels: a tyre (disc along y), its rim face, the hub and ten nuts at the turn angle; the far ones plain
      const wheel = (x, y0, y1, face, turn) => {
        const F = LAB.Y([x, 0, R]), out = [ISO.tinted(RUB, S(G.disc(y0, y1, R, F, P, { steps: 32 }), { tone: "mid" }))];
        if (face) {
          out.push(ISO.tinted(STEEL, S(G.disc(y1, y1 + 1.5, 30, F, P, { steps: 28 }), { tone: "mid" }) + S(G.disc(y1 + 1.5, y1 + 6, 11, F, P, { steps: 16 }), { tone: "mid" })));
          const nuts = [], holes = [];
          for (let i = 0; i < 10; i++) { const a = turn + (i * Math.PI) / 5; nuts.push(K.iso([x + Math.cos(a) * 15, y1 + 1.6, R + Math.sin(a) * 15], P)); }
          for (let i = 0; i < 5; i++) { const a = turn + (i * 2 * Math.PI) / 5 + 0.3, c = [x + Math.cos(a) * 23, y1 + 1.55, R + Math.sin(a) * 23], hp = []; for (let j = 0; j <= 12; j++) { const b = (j / 12) * Math.PI * 2; hp.push([c[0] + Math.cos(b) * 4, c[1], c[2] + Math.sin(b) * 3]); } holes.push(B.poly(P, hp, "#3a3c40", "#2a2b2f", 0.4)); }
          out.push(holes.join(""), K.dotsSvg(nuts, { size: 0.55 }));
        }
        return out.join("");
      };
      const mud = ISO.tinted(ISO.T.plastic, box([AX[1] + 52, AX[1] + 55], [HY - 32, HY - 2], [22, 96]));
      g.innerHTML = `<g data-part="move"><path class="iso-halo" d="${K.haloOf({ x: X0 - 10, y: -HY - 10, w: X1 - X0 + 20, d: 2 * HY + 20, r: 10 }, 0, ZT, P)}"/>` +
        `<g data-name="wheels">${wheel(AX[0], -HY + 5, -HY + 30, false, 0)}${wheel(AX[1], -HY, -HY + 28, false, 0)}</g>` +
        `<g data-name="box">${chassis}${tank}</g>` +
        `<g data-name="cab">${cab}${cabWin}${seams}${cabBits}</g><g data-name="box">${shell}</g>` +
        `<g clip-path="url(#${id})"><g data-name="cartons">${inside}</g></g><g data-name="door" data-part="curtain"></g><g data-name="box">${posts}${bumper}${guards}</g>` +
        `<g data-name="wheels" data-part="wheels"></g><g data-name="box">${mud}</g><g data-name="ramp" data-part="ramp"></g></g><g data-part="words"></g>`;
      g.insertAdjacentHTML("afterbegin", `<defs>${clip}</defs>`);
      g.anchors = { back: [X1, 0, ZF], ramp: [X1 + Math.sqrt(RL * RL - ZF * ZF), 0, 0], top: [0, 0, ZT] };
      const el = B.parts(g), w = ISO.writer();
      const curtain = (f) => {
        const zb = ZF + (ZT - 14 - ZF) * f, x = X1 + 0.05;
        if (zb > ZT - 16) return "";
        const sl = []; for (let z = zb + 10; z < ZT - 14; z += 10) sl.push([[x + 0.01, -HY + 8, z], [x + 0.01, HY - 8, z]]);
        return B.poly(P, [[x, -HY + 8, zb], [x, HY - 8, zb], [x, HY - 8, ZT - 14], [x, -HY + 8, ZT - 14]], "#dfe2e5", "#4a4a44", 0.7) + B.free(P, sl, "#9aa0a6", 0.6) +
          ISO.tinted(ISO.T.steel, box([X1, X1 + 3], [-20, 20], [zb + 4, zb + 9]));
      };
      // the ramp: an aluminium plank from the floor's back edge, sliding out and tilting down by r
      const ramp = (r) => {
        if (r < 0.01) return "";
        const reach = Math.sqrt(RL * RL - ZF * ZF) * r, end = [X1 + reach, 0, ZF - 4 - (ZF - 4) * r];
        const a = Math.atan2(ZF - 4 - end[2], reach || 1), L = Math.hypot(reach, ZF - 4 - end[2]);
        const at2 = (s, h, y) => [X1 + Math.cos(a) * s + Math.sin(a) * h, y, ZF - 4 - Math.sin(a) * s + Math.cos(a) * h];
        const s = ISO.tinted(STEEL, ISO.box(at2, P, [0, L], [-3, 0], [-50, 50], "mid"));
        const ribs = []; for (let q = 15; q < L - 5; q += 15) ribs.push([at2(q, 0.05, -48), at2(q, 0.05, 48)]);
        return s + B.free(P, ribs, "#8d9096", 0.6);
      };
      const draw = () => {
        const d = Math.round(st.door * 200) / 200, up = Math.min(1, d / 0.6), r = ISO.clamp((d - 0.6) / 0.4, 0, 1);
        const dist = st.roll * RUN, turn = Math.round((dist / R) * 40) / 40;
        w.attr(el.move, "transform", K.translateAlong(P, [-dist, 0, 0]));
        w.rebuild(el.curtain, `${up}`, () => curtain(up));
        w.rebuild(el.ramp, `${r}`, () => ramp(r));
        w.rebuild(el.wheels, `${turn}`, () => wheel(AX[0], HY - 30, HY - 5, true, turn) + wheel(AX[1], HY - 56, HY - 29, false, 0) + wheel(AX[1], HY - 28, HY, true, turn));
        if (lab) w.rebuild(el.words, "1", () => B.word(P, [X1, HY, ZT + 20], "delivery truck") + B.word(P, [X1, HY, ZT - 10], "back door and ramp", { size: 12, color: "#667" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.door !== undefined) st.wd = B.num(p, "door", st.wd, 0, 1);
        if (p.roll !== undefined) st.wr = B.num(p, "roll", st.wr, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the door and ramp move at a steady pace; the truck pulls away and stops smoothly (an eased drive)
      g.update = (dt) => {
        if (ISO.still()) { st.door = st.wd; st.roll = st.wr; draw(); return false; }
        st.door += ISO.clamp(st.wd - st.door, -dt / 3, dt / 3);
        st.roll = ISO.follow(st.roll, st.wr, dt, 0.9); if (Math.abs(st.roll - st.wr) < 0.001) st.roll = st.wr;
        draw();
        return st.door !== st.wd || st.roll !== st.wr;
      };
      g.readout = () => `delivery truck · back door ${st.wd > 0.6 ? "open, ramp down" : st.wd > 0.05 ? "opening" : "shut"} · ${st.wr > 0 ? `driven ${Math.round(st.wr * RUN)} cm forward` : "parked"} · 6.5 m long`;
      draw();
      return g;
    },
  });
})();
