// "depositbox cx cy k out=0..1 lid=0..1 wall=0|1 lab=0 lit=wall|box|front|lid|papers|cash" — a PART (batch 6, money):
// a bank safe-deposit box in its cell in a vault wall, its origin the wall face at the middle of its cell's mouth; the
// box slides out along +y (into the room). A long steel drawer 14 × 60 × 8 cm: a front with a pull handle, two
// keyholes (the bank's guard key and the holder's key) and its number plate; a lid over the front 46 cm hinged along
// its left edge. wall=1 draws the eight cells round it as the wall of boxes they line. out 0 → 1 slides the box 50 cm
// out of its cell; lid 0 → 1 lifts the lid (only once the box is out) and shows the papers and cash kept inside.
// set({ out, lid }). World: 1 = 1 cm. anchors: front top
(() => {
  const K = window.K;
  const HX = 7, HZ = 4, LEN = 60, OUT = 50, LID0 = 4, PX = 15, PZ = 9;
  const BOXT = ISO.tint("#d4d8dd", ["#868c94", "#9aa0a7", "#adb2b8", "#c0c4c9"], "#33383e");
  const WALLT = ISO.tint("#c2b48f", ["#857650", "#96875f", "#a7986f", "#b8a980"], "#40361c");
  ISO.add({
    name: "depositbox", title: "Safe-deposit box (part)", compare: null,
    about: "A bank safe-deposit box, a 14 × 60 × 8 cm steel drawer with a handle, two keyholes and its number, in a cell of a vault wall of boxes; out slides it out, lid lifts its lid on the papers and cash inside. anchors: front top",
    line: "depositbox cx cy k out=0..1 lid=0..1 wall=0|1 lab=0 lit=wall|box|front|lid|papers|cash",
    demo: { line: "depositbox 380 260 7 out=0 lid=0 wall=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "front" }, hold: 1 }, { set: { out: 1, lit: "box" }, hold: "settle" }, { set: { lid: 1, lit: "lid" }, hold: "settle" }, { set: { lit: "papers" }, hold: 1.2 }, { set: { lid: 0, lit: "" }, hold: "settle" }, { set: { out: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1", wall = o.wall === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { out: A.num(o, "out", 0, 0, 1), lid: A.num(o, "lid", 0, 0, 1), lit: o.lit || "" };
      st.oWant = st.out; st.lWant = st.lid;
      // a cell's front art (x right, y down, 14 × 8 cm): the number plate, two keyholes, a rim
      const keyhole = (x, y) => `<circle cx="${x}" cy="${y}" r="0.55" fill="#e2c986" stroke="#6b5114" stroke-width="0.06"/><path d="M${x} ${y - 0.3}a0.18 0.18 0 1 1 0.01 0L${x + 0.12} ${y + 0.3}H${x - 0.12}Z" fill="#26292e"/>`;
      const frontArt = (num) => `<rect x="0.25" y="0.25" width="13.5" height="7.5" fill="none" stroke="#6f757c" stroke-width="0.06"/>` +
        `<rect x="1" y="1" width="3.6" height="1.6" rx="0.15" fill="#f1ede0" stroke="#5a5f66" stroke-width="0.05"/>${A.text(2.8, 2.17, num, 0.95, "#26292e", "middle", 800)}` + keyhole(9.3, 2.1) + keyhole(11.8, 2.1);
      const plate = (x, z, y, num, handle = true) => {
        let s = B.box(P, [x - HX, x + HX], [y, y + 0.4], [z - HZ, z + HZ], BOXT) + `<g transform="${A.plane(P, [x - HX, y + 0.41, z + HZ], [1, 0, 0], [0, 0, -1])}">${frontArt(num)}</g>`;
        if (handle) s += [-3.5, 3.5].map((dx) => B.box(P, [x + dx - 0.35, x + dx + 0.35], [y + 0.4, y + 1.6], [z - 2.1, z - 1.4], ISO.T.steel)).join("") + B.box(P, [x - 3.85, x + 3.85], [y + 1.6, y + 2.1], [z - 2.1, z - 1.4], ISO.T.steel);
        return s;
      };
      // the wall: the frame round the cells (a brass-coloured face), the eight neighbours' fronts, the middle cell's mouth
      let wallSvg = "";
      const cols = wall ? [-1, 0, 1] : [0], rows = wall ? [1, 0, -1] : [0];
      const W0 = Math.min(...cols) * PX - PX / 2, W1 = Math.max(...cols) * PX + PX / 2, Z0 = Math.min(...rows) * PZ - PZ / 2, Z1 = Math.max(...rows) * PZ + PZ / 2;
      wallSvg += B.box(P, [W0, W1], [-1.5, -0.4], [Z0, Z1], WALLT, "lo");
      for (const r of rows) for (const c of cols) if (r || c) wallSvg += plate(c * PX, r * PZ, -0.4, String(214 + c + 1 + (1 - r) * 3 + 1).padStart(4, "0"), true);
      wallSvg += B.quad(P, [[-HX - 0.1, -0.39, -HZ - 0.1], [HX + 0.1, -0.39, -HZ - 0.1], [HX + 0.1, -0.39, HZ + 0.1], [-HX - 0.1, -0.39, HZ + 0.1]], "#1b1d20", "#0b0c0e", 0.6);
      // what is kept inside: papers in a folder, a banded bundle
      const goods = (y0) => `<g data-name="papers">${B.box(P, [-6, 3.5], [y0 + 13, y0 + 34], [-3.5, -2.9], B.PAPER, "lo")}${B.box(P, [-5.6, 3.2], [y0 + 13.6, y0 + 33], [-2.9, -2.6], B.KRAFT)}</g>` +
        `<g data-name="cash">${B.bundle(P, [2.2, y0 + 42, -3.5], { n: 100, value: 50, alongY: true })}</g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: W0, y: -1.5, w: W1 - W0, d: 1.5, r: 0.5 }, Z0, Z1 - Z0, P)}"/>` +
        `<g data-name="wall">${wallSvg}</g><g data-part="lidback"></g><g data-part="box"></g><g data-part="lidfront"></g><g data-part="words"></g>`;
      const el = B.parts(g), w = ISO.writer();
      const draw = () => {
        const s = (Math.round(st.out * 400) / 400) * OUT, la = (Math.round(Math.min(st.lid, s >= OUT - 0.5 ? 1 : 0) * 200) / 200) * 1.85;
        const y0 = Math.max(0, s - LEN), yb = s - LEN;   // the box runs yb .. s; only y > 0 is out of the wall
        w.rebuild(el.box, `${s} ${la > 0}`, () => {
          let out = `<g data-name="box">`;
          if (s > 0.05) {
            if (la > 0) {
              // open tray: far wall, floor, the goods, then the near wall; the fixed back part of the top
              out += B.box(P, [-HX + 0.2, -HX + 0.4], [y0, s], [-HZ + 0.2, HZ - 0.4], BOXT, "lo") + B.box(P, [-HX + 0.2, HX - 0.2], [y0, s], [-HZ + 0.2, -HZ + 0.5], B.DARK, "lo");
              out += `</g>${goods(yb)}<g data-name="box">`;
              out += B.box(P, [HX - 0.4, HX - 0.2], [y0, s], [-HZ + 0.2, HZ - 0.4], BOXT) + B.box(P, [-HX + 0.2, HX - 0.2], [y0, yb + LID0 + 10], [HZ - 0.4, HZ - 0.2], BOXT);
            } else out += B.box(P, [-HX + 0.2, HX - 0.2], [y0, s], [-HZ + 0.2, HZ - 0.2], BOXT);
          }
          out += `</g><g data-name="front">${plate(0, 0, s - 0.4, "0219", true)}</g>`;
          return out;
        });
        // the lid, turned la radians up about its left edge; drawn behind the tray once it stands past 60°
        const lidSvg = () => {
          if (la <= 0) return "";
          const U = [Math.cos(la), 0, Math.sin(la)], N = [-Math.sin(la), 0, Math.cos(la)], at = B.frame([-HX + 0.2, 0, HZ - 0.2], U, N, [0, 1, 0]);
          return `<g data-name="lid">${B.obox(P, at, [0, 2 * HX - 0.4], [0, 0.2], [Math.max(0.01, yb + LID0 + 10), s - 0.05], BOXT)}</g>`;
        };
        const back = la > 1.05;
        w.rebuild(el.lidback, `${la} ${s} b`, () => (back ? lidSvg() : ""));
        w.rebuild(el.lidfront, `${la} ${s} f`, () => (back ? "" : lidSvg()));
        g.anchors = { front: [0, s + 1.7, -1.75], top: [0, s / 2, HZ] };
        if (lab) w.rebuild(el.words, `${st.oWant > 0.5} ${st.lWant > 0.5}`, () => B.word(P, [HX, s + 0.4, HZ], st.oWant < 0.5 ? "safe-deposit box 0219" : st.lWant > 0.5 ? "box out, lid open" : "box slid out"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.out !== undefined) st.oWant = A.num(p, "out", st.oWant, 0, 1);
        if (p.lid !== undefined) st.lWant = A.num(p, "lid", st.lWant, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // the lid shuts before the box goes in, and lifts only once the box is out
        const lidTo = st.oWant < 0.99 || st.out < 0.99 ? 0 : st.lWant, outTo = st.lid > 0.01 ? st.out : st.oWant;
        st.lid = ISO.follow(st.lid, lidTo, dt, 0.3, calm); if (Math.abs(st.lid - lidTo) < 0.003) st.lid = lidTo;
        st.out = ISO.follow(st.out, outTo, dt, 0.45, calm); if (Math.abs(st.out - outTo) < 0.002) st.out = outTo;
        draw();
        return st.lid !== st.lWant * (st.oWant >= 0.99 ? 1 : 0) || st.out !== st.oWant;
      };
      g.readout = () => `safe-deposit box 0219 · ${st.oWant > 0.5 ? "slid out" : "in its cell"}${st.lWant > 0.5 && st.oWant > 0.99 ? " · lid open: papers and cash" : ""}`;
      draw();
      return g;
    },
  });
})();
