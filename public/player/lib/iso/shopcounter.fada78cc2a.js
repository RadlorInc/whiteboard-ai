// "shopcounter cx cy k belt=0..1 lab=0 lit=counter|belt|divider|scale|bagging" — a PART (batch 6, money): a shop's
// checkout counter 180 × 70 × 90 cm standing on the floor, its origin the floor point under its middle, the cashier's
// side toward the room (+y). A recessed black kick plate, a cupboard front of four laminate doors with steel bar handles,
// a 4 cm worktop; on it, from the left: a short conveyor belt section between steel rails with its end roller and a
// divider bar lying on the ledge beside it, a steel scale plate set in the worktop, the till's place, and a sunken
// bagging area with a steel lip at the right. belt = the belt's speed (0 stopped, 1 about 20 cm a second toward the
// cashier, +x). Anchors on the worktop where the other parts go: till, scanner, scale (the plate's top), bag, belt.
// set({ belt }). World: 1 = 1 cm. anchors: till scanner scale bag belt
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HX = 90, HY = 30, TOP = 90, WT = 4, BX0 = -88, BX1 = -26, BY0 = -20, BY1 = 18, BZ = TOP + 3.05, PITCH = 4;
  const LAM = ISO.tint("#e8e6e1", ["#a6a39b", "#b6b3ab", "#c6c3bb", "#d6d3cc"], "#4a4840");
  const WORK = ISO.tint("#8c6f52", ["#4e3a26", "#5a4430", "#664f3a", "#735a44"], "#2a1c10");
  const RED = ISO.tint("#f08070", ["#a8281e", "#bb3428", "#cc4434", "#dc5a48"], "#5a120c");
  ISO.add({
    name: "shopcounter", title: "Checkout counter (part)", compare: null,
    about: "A shop checkout counter 180 × 70 × 90 cm: cupboard front and kick plate, worktop with a short conveyor belt, a divider bar, a scale plate, the till's place and a sunken bagging area; belt runs the belt. anchors: till scanner scale bag belt",
    line: "shopcounter cx cy k belt=0..1 lab=0 lit=counter|belt|divider|scale|bagging",
    demo: { line: "shopcounter 480 400 3.3 belt=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { belt: 1, lit: "belt" }, hold: 2.5 }, { set: { lit: "divider" }, hold: 1.2 }, { set: { belt: 0, lit: "scale" }, hold: "settle" }, { set: { lit: "bagging" }, hold: 1 }, { set: { lit: "counter" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), kS = G.scaleOf(P);
      const st = { belt: B.num(o, "belt", 0, 0, 1), phase: 0, lit: o.lit || "" };
      st.want = st.belt;
      const seg = (a, b) => K.pathOf([K.iso(a, P), K.iso(b, P)]), Z0 = 10, Z1 = TOP - WT, FY = HY;
      // kick plate, the cupboard with its four doors, handles, the worktop
      const kick = ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-HX + 2, HX - 2], [-HY + 2, HY - 6], [0, Z0], "lo"));
      const cupboard = ISO.tinted(LAM, ISO.wbox(P, [-HX, HX], [-HY, HY], [Z0, Z1], "mid")) +
        L([-45, 0, 45].map((x) => seg([x, FY, Z0], [x, FY, Z1])).join(""), { tone: "lo" }) +
        L(seg([-HX, FY, Z0 + 1.5], [HX, FY, Z0 + 1.5]), { tone: "faint" }) +
        ISO.tinted(ISO.T.steel, [-49, -4, 4, 49].map((x) => ISO.wbox(P, [x - 0.6, x + 0.6], [FY, FY + 2.2], [Z1 - 26, Z1 - 8], "mid")).join(""));
      const top = ISO.tinted(WORK, S(K.slabOf({ x: -HX, y: -HY - 5, w: 2 * HX, d: 2 * HY + 10, r: 1.5 }, Z1, WT, P, 4, 0.4), { tone: "mid" }));
      // the belt: its bed, the moving rubber with ribs across it, the steel rails, the end roller
      const bed = ISO.tinted(ISO.T.plastic, ISO.wbox(P, [BX0 - 1, BX1], [BY0, BY1], [TOP, BZ - 0.05], "lo")) + B.quad(P, [[BX0, BY0, BZ], [BX1, BY0, BZ], [BX1, BY1, BZ], [BX0, BY1, BZ]], "#2a2c30", "#111214", 0.6);
      const rails = ISO.tinted(ISO.T.steel, ISO.wbox(P, [BX0 - 1, BX1 + 2], [BY0 - 1.2, BY0], [TOP, BZ + 1], "mid") + S(G.disc(BY0, BY1, 1.5, LAB.Y([BX1, 0, BZ - 1.5]), P, { steps: 20 }), { tone: "hi" }));
      const railNear = ISO.tinted(ISO.T.steel, ISO.wbox(P, [BX0 - 1, BX1 + 2], [BY1, BY1 + 1.2], [TOP, BZ + 1], "mid"));
      const ribs = (ph) => { let d = ""; for (let x = BX0 + (ph % PITCH); x < BX1 - 0.2; x += PITCH) d += seg([x, BY0, BZ + 0.01], [x, BY1, BZ + 0.01]); return `<path d="${d}" stroke="#4a4d53" stroke-width="${Math.max(0.6, kS * 0.35).toFixed(2)}"/>`; };
      // the divider bar on the ledge beside the belt: a long triangular bar with a printed band
      const divider = ISO.tinted(RED, ISO.prismX(P, [[BY1 + 2.5, TOP], [BY1 + 7.5, TOP], [BY1 + 5, TOP + 4]], -78, -38, ["#a8281e", "#dc5a48"], "#f08070", "#5a120c")) +
        B.flat(P, [-66, BY1 + 5.4, TOP + 3.25], [1, 0, 0], [0, 0.53, -0.85], B.text(0, 0.9, "NEXT CUSTOMER", 1.1, "#ffffff", "start", 800));
      // the scale plate set in the worktop, its little display on the cashier's side
      const SC = { x0: -22, x1: -6, y0: -8, y1: 10 };
      const scale = ISO.tinted(ISO.T.steel, ISO.wbox(P, [SC.x0, SC.x1], [SC.y0, SC.y1], [TOP, TOP + 0.6], "hi")) +
        L([SC.y0 + 4, SC.y0 + 8, SC.y0 + 12].map((y) => seg([SC.x0, y, TOP + 0.61], [SC.x1, y, TOP + 0.61])).join(""), { tone: "faint" }) +
        ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-14, -7], [SC.y1 + 3, SC.y1 + 5], [TOP, TOP + 3], "mid")) +
        B.flat(P, [-13.5, SC.y1 + 5.02, TOP + 2.6], [1, 0, 0], [0, 0, -1], `<rect width="6" height="2.2" fill="#18301f"/>${B.seg(5.6, 1.85, "0.000", 1.4, "#7fe08a", "#21402a", 5)}`);
      // the bagging area: a sunken steel tray with a lip
      const bag = B.well(P, { x: 42, y: -24, w: 44, d: 48, r: 1.5 }, TOP, 3, "", { wall: "#8d9096", floor: "#b6b9be", ink: "#3c3f45", inset: 0.6 }) +
        ISO.tinted(ISO.T.steel, ISO.wbox(P, [40.5, 87.5], [24, 25.5], [TOP, TOP + 0.8], "mid"));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY - 5, w: 2 * HX, d: 2 * HY + 10, r: 1 }, 0, 1, P)}"/>` +
        `<g data-name="counter">${kick}${cupboard}${top}</g><g data-name="belt">${bed}<g data-part="ribs"></g>${rails}${railNear}</g>` +
        `<g data-name="divider">${divider}</g><g data-name="scale">${scale}</g><g data-name="bagging">${bag}</g><g data-part="words"></g>`;
      g.anchors = { till: [18, -12, TOP], scanner: [-14, 22, TOP], scale: [(SC.x0 + SC.x1) / 2, (SC.y0 + SC.y1) / 2, TOP + 0.6], bag: [64, 0, TOP - 3], belt: [(BX0 + BX1) / 2, (BY0 + BY1) / 2, BZ] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const ph = Math.round(st.phase * 10) / 10;
        w.rebuild(el.ribs, String(ph), () => ribs(ph));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([HX, 0, TOP + 8], P), "checkout counter", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.belt !== undefined) st.want = B.num(p, "belt", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the belt speeds up and slows down over about half a second; still: it stops where it is
      g.update = (dt) => {
        const calm = ISO.still();
        st.belt = ISO.follow(st.belt, st.want, dt, 0.25, calm); if (Math.abs(st.belt - st.want) < 0.005) st.belt = st.want;
        if (!calm) st.phase = (st.phase + dt * 20 * st.belt) % PITCH;
        draw();
        return st.belt > 0 || st.belt !== st.want;
      };
      g.readout = () => `checkout counter · belt ${st.want > 0.01 ? `running ${(20 * st.want).toFixed(0)} cm/s` : "stopped"}`;
      draw();
      return g;
    },
  });
})();
