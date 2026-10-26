// "splint cx cy k dip=0..1 in=acid|alkali|water level=1..5 lab=0 lit=splint|red|blue" — a PART (PARTS.md, batch 5): a
// wooden splint (8 cm × 6 mm × 3 mm) laid across a beaker's rim, holding a red and a blue litmus strip (6 mm × 6 cm),
// each folded over the splint and pinned. Origin: the middle of the splint's underside where it rests on the rim
// (place it at= a glassbeaker's rim). dip=1 rests it on the rim with the strips hanging in; dip=0 holds it 4.5 cm
// above. `in` is the liquid in the beaker, its surface `level` cm under the rim: the part of a strip that goes under
// soaks and changes colour in about 1.5 s (acid: blue → red; alkali: red → blue; water: both stay) and keeps it when
// lifted out. Reused from indicator.js (litmus). Built in mm; anchors in cm. set({ dip, in }). anchors: top
(() => {
  const K = window.K;
  const L8 = 40, SW = 3, ST = 3, LIFT = 45, STRIP = 60, SX = 13, HW = 3, SY = SW + 0.4;
  const RED = "#e46a62", BLUE = "#5b7fd6", ACID = "#d8443c", ALK = "#3a68cc";
  const PIN = ISO.tint("#e8e9ec", ["#9a9ea5", "#acb0b6", "#bec1c6", "#cfd2d6"], "#3c3f45");
  const tint = (c) => window.LAB.tintOf(c, window.LAB.mix(c, "#000000", 0.5));

  ISO.add({
    name: "splint", title: "Splint with litmus strips (part)", compare: null,
    about: "A wooden splint across a beaker's rim holding a red and a blue litmus strip; lowered in, acid turns the blue strip red and alkali turns the red strip blue. anchors: top",
    line: "splint cx cy k dip=0..1 in=acid|alkali|water level=1..5 lab=0 lit=splint|red|blue",
    demo: { line: "splint 480 200 50 dip=0 in=acid lab=1", script: [{ set: { lit: "splint" }, hold: 1.2 }, { set: { dip: 1, lit: "blue" }, hold: "settle" }, { set: { dip: 0, lit: "red" }, hold: "settle" }, { set: { in: "alkali", dip: 1 }, hold: "settle" }] },
    make([cx = 480, cy = 220, k = 3], o, t, parent) {
      const LAB = window.LAB, B18 = window.B18;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const liq = (v) => (["acid", "alkali", "water"].includes(v) ? v : "water");
      const st = { dip: ISO.clamp(ISO.num(o, "dip", 0), 0, 1), want: 0, wet: 0, in: liq(o.in), level: ISO.clamp(ISO.num(o, "level", 2.5), 1, 5) * 10 };
      st.want = st.dip; st.wet = st.dip > 0.7 ? 1 : 0;
      const wetCol = (base) => (st.in === "acid" && base === BLUE ? ACID : st.in === "alkali" && base === RED ? ALK : LAB.mix(base, "#000000", 0.12));
      let lit = o.lit || "", wetIn = st.in;
      // one strip: hangs on the splint's near face (y = SY), folds over the top and down the back a little, a pin
      // through the fold; the bottom part that went under the surface keeps the soaked colour
      const strip = (name, x, c0, lift) => {
        const zTop = ST + lift, zBot = zTop - STRIP, soak = LAB.mix(c0, wetCol(c0), st.wet), cut = st.wet > 0 ? Math.min(zTop - 4, zBot + Math.max(0, STRIP - ST - st.level)) : zBot;
        const box = (z0, z1, c) => ISO.tinted(tint(c), ISO.wbox(Pm, [x - HW, x + HW], [SY - 0.3, SY], [z0, z1], "mid"));
        return `<g data-name="${name}">` + ISO.tinted(tint(c0), ISO.wbox(Pm, [x - HW, x + HW], [-SY - 0.3, SY], [zTop, zTop + 0.3], "hi")) +
          (cut > zBot ? box(zBot, cut, soak) : "") + box(cut, zTop, c0) +
          ISO.tinted(PIN, window.K.solidSvg(window.G.disc(SY, SY + 0.8, 1.1, window.LAB.Y([x, 0, zTop - 1.6 + 0 * lift]), Pm), { tone: "hi" })) + `</g>`;
      };
      const draw = () => {
        const dq = Math.round(st.dip * 40) / 40, wq = Math.round(st.wet * 20) / 20, lift = (1 - dq) * LIFT;
        w.rebuild(el.all, `${dq} ${wq} ${wetIn} ${st.level}`, () => {
          const back = [-SX, SX].map((x) => ISO.tinted(tint(x < 0 ? RED : BLUE), ISO.wbox(Pm, [x - HW, x + HW], [-SY - 0.3, -SY], [lift + ST - 6, lift + ST], "mid"))).join("");
          const grain = LAB.L([-0.9, 0.8].map((y) => K.pathOf([K.iso([-L8 + 1, y, lift + ST + 0.01], Pm), K.iso([L8 - 1, y + 0.3, lift + ST + 0.01], Pm)])).join(""), { tone: "faint", free: true });
          const splint = `<g data-name="splint">${ISO.tinted(ISO.T.wood, ISO.wbox(Pm, [-L8, L8], [-SW, SW], [lift, lift + ST], "mid"))}${grain}</g>`;
          return back + splint + strip("red", -SX, RED, lift) + strip("blue", SX, BLUE, lift);
        });
        if (lab) w.rebuild(el.words, `${dq > 0.5} ${wq > 0.5} ${wetIn}`, () => LAB.word(Pm, lab, [0, 0, lift + ST + 14], wq > 0.5 ? (wetIn === "acid" ? "acid: blue litmus turns red" : wetIn === "alkali" ? "alkali: red litmus turns blue" : "water: no change") : "red and blue litmus", "#556"));
        B18.light(w, g, lit);
      };
      g.innerHTML = `<g data-part="all"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, (ST + (1 - st.dip) * LIFT) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      g.set = (p) => {
        if (p.dip !== undefined && Number.isFinite(+p.dip)) st.want = ISO.clamp(+p.dip, 0, 1);
        if (p.in !== undefined) { st.in = liq(p.in); if (st.wet < 0.5) wetIn = st.in; }
        if (p.level !== undefined && Number.isFinite(+p.level)) st.level = ISO.clamp(+p.level, 1, 5) * 10;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.dip = ISO.follow(st.dip, st.want, dt, 0.5, calm); if (Math.abs(st.dip - st.want) < 0.004) st.dip = st.want;
        // dipping into another liquid uses fresh strips (dry colours, then that liquid's change)
        if (st.dip > 0.7 && wetIn !== st.in) { wetIn = st.in; st.wet = 0; }
        const wantWet = st.dip > 0.7 ? 1 : st.wet; st.wet = calm ? wantWet : Math.min(wantWet, st.wet + dt / 1.5);
        draw();
        return st.dip !== st.want || st.wet !== wantWet;
      };
      g.readout = () => (st.wet > 0.5 ? (wetIn === "acid" ? "dipped in acid: blue litmus has turned red, red stays red" : wetIn === "alkali" ? "dipped in alkali: red litmus has turned blue, blue stays blue" : "dipped in water: neither strip changes (neutral)") : `red and blue litmus on a splint${st.dip > 0.7 ? "" : ", held over the beaker"}`) + " · litmus says only acid or alkali, not how strong";
      draw();
      return g;
    },
  });
})();
