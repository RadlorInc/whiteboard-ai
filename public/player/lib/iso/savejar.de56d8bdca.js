// "savejar cx cy k fill=0..1 drop=0..1 goal=1..9999 lab=0 lit=jar|lid|coins|label" — a PART (batch 6, money): a clear
// glass savings jar 10 cm across and 15 cm tall standing on a table, its origin the table point under its middle (the
// savings object; never a pig). A glass jar with a thick base and a shoulder, a ribbed metal screw lid with a coin slot
// cut across its top, a paper label round the middle reading MY GOAL with the goal written on it by hand, and the coins
// saved so far piled inside, seen through the glass. fill = how full of coins it is (0 empty, 1 up to the shoulder);
// drop = a coin going in: 0 it is held standing above the slot, 1 it has dropped through (and is gone into the jar).
// set({ fill, drop }). Built in mm (ISO.mm); anchors in cm. anchors: slot top
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 50, RIM = 130, LID = 150, PILE = 110, CR = 11;
  const OUTER = [[0, 46], [4, 50], [112, 50], [122, 44], [RIM, 44]];
  ISO.add({
    name: "savejar", title: "Savings jar (part)", compare: null,
    about: "A clear glass savings jar 10 × 15 cm with a metal screw lid and a coin slot in it, a MY GOAL paper label, and the coins saved piled inside; fill sets how full it is, drop drops a coin in through the slot. anchors: slot top",
    line: "savejar cx cy k fill=0..1 drop=0..1 goal=1..9999 lab=0 lit=jar|lid|coins|label",
    demo: { line: "savejar 480 410 22 fill=0.2 drop=0 goal=200 lab=1", script: [{ set: {}, hold: 1 }, { set: { drop: 1, lit: "lid" }, hold: "settle" }, { set: { fill: 0.6, lit: "coins" }, hold: "settle" }, { set: { drop: 0, lit: "label" }, hold: 1 }, { set: { drop: 1, fill: 0.9, lit: "jar" }, hold: "settle" }, { set: { fill: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), kS = G.scaleOf(Pm);
      const st = { fill: B.num(o, "fill", 0.3, 0, 1), drop: B.num(o, "drop", 1, 0, 1), goal: Math.round(B.num(o, "goal", 100, 1, 9999)), lit: o.lit || "" };
      st.wF = st.fill; st.wD = st.drop;
      const V = LAB.vessel(Pm, [0, 0, 0], OUTER, { wall: 3, base: 6, rim: true });
      // the label: a paper band round the middle, its words on the side toward the camera
      const Fz = LAB.Z([0, 0, 0]), facing = G.angleToward(Fz, G.viewOf(Pm)), tg = G.tangentOf(Fz, facing).map((q) => -q), rp = G.pointOf(Fz, 0, R + 0.6, facing);
      const at = (z, off = 0) => [rp[0] + tg[0] * off, rp[1] + tg[1] * off, z];
      const band = (() => { const arc = (z) => Array.from({ length: 33 }, (_, i) => K.iso(G.pointOf(LAB.Z([0, 0, z]), 0, R + 0.5, facing - Math.PI / 2 + (i / 32) * Math.PI), Pm)); return K.pathOf([...arc(84), ...arc(38).reverse()], true); })();
      const label = `<path d="${band}" fill="#f3ebd3" stroke="#7a6a3e" stroke-width="0.7" stroke-linejoin="round"/>` +
        `<path d="${K.pathOf(Array.from({ length: 33 }, (_, i) => K.iso(G.pointOf(LAB.Z([0, 0, 80]), 0, R + 0.5, facing - Math.PI / 2 + (i / 32) * Math.PI), Pm)))}" fill="none" stroke="#c9b98c" stroke-width="0.5"/>` +
        LAB.faceText(Pm, at(70), tg, B.say("MY GOAL"), 9, "#7a5a1e") +
        LAB.faceText(Pm, at(54), tg, String(st.goal), 13, "#2f4f8f").replace("'Helvetica Neue',Arial,sans-serif", "'Bradley Hand','Segoe Script','Comic Sans MS',cursive") +
        `<path d="${K.pathOf([K.iso(at(48, -22), Pm), K.iso(at(48, 22), Pm)])}" stroke="#2f4f8f" stroke-width="${Math.max(0.6, kS * 0.8).toFixed(2)}" stroke-linecap="round" data-free=""/>`;
      // the lid: a ribbed band, a domed top and the slot across it
      const lid = ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 46.5, RIM - 6, LID - RIM + 4, Pm, 48, 1), { tone: "mid", inner: L(K.knurl(0, 0, 46.5, RIM - 6, LID - 2, 60, Pm, 0.01), { tone: "faint" }) }) +
        S(K.cylinder(0, 0, 44, LID - 2, 2, Pm, 48, 1), { tone: "hi" })) +
        B.quad(Pm, [[-15, -1.8, LID + 0.05], [15, -1.8, LID + 0.05], [15, 1.8, LID + 0.05], [-15, 1.8, LID + 0.05]], "#17191c", "#0b0c0e", 0.5) +
        L(K.pathOf([K.iso([-17, -3.6, LID + 0.05], Pm), K.iso([17, -3.6, LID + 0.05], Pm), K.iso([17, 3.6, LID + 0.05], Pm), K.iso([-17, 3.6, LID + 0.05], Pm)]) + "Z", { tone: "lo" });
      // the coins inside: a pile whose sides show stacked coin edges, a few loose coins on its top
      const pile = (f) => {
        const h = f * PILE;
        if (h < 2) return "";
        const zs = []; for (let z = 9; z < h; z += 5.5) zs.push(z);
        const top = [[-20, -12, "gold"], [10, -18, "silver"], [18, 8, "gold"], [-8, 14, "silver"], [-26, 10, "gold"], [2, -2, "gold"]];
        return ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, R - 4, 6, Math.max(1, h - 6 + 6), Pm, 40), { tone: "mid", inner: L(zs.map((z) => K.sideArc(0, 0, R - 4, z, Pm, 28)).join(""), { tone: "faint" }) })) +
          top.map(([x, y, m], i) => B.coin(Pm, [x, y, h + 6 + (i % 2) * 1.5], CR, 2, m, true, 0)).join("");
      };
      // the coin being dropped in: standing on its edge across the slot, its face toward the room
      const [dDefs, dOpen] = B.clip(B.above(Pm, [-60, 0, LID], [60, 0, LID]));
      const dropCoin = (d) => {
        const zc = LID + CR + 3 - d * (2 * CR + 8), Fc = LAB.Y([0, 0, zc]);
        return ISO.tinted(ISO.T.brass, S(G.disc(-1, 1, CR, Fc, Pm, { steps: 32 }), { tone: "mid", inner: L(G.ribsOf(Fc, -1, 1, CR, 40, Pm, { seams: true }), { tone: "faint" }) })) +
          `<path d="${G.circleOf(Fc, 1.02, CR * 0.82, Pm)}" fill="none" stroke="#6b5114" stroke-width="0.5" opacity=".7"/>` + LAB.faceText(Pm, [0, 1.05, zc - CR * 0.32], [1, 0, 0], "1", CR * 0.9, "#6b5114");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, 2, Pm)}"/><defs>${dDefs}</defs>` +
        `<g data-name="jar">${V.back()}</g><g data-name="coins" data-part="pile"></g><g data-name="jar">${V.front()}</g><g data-name="label">${label}</g>` +
        `<g data-name="lid">${lid}</g><g data-name="coins">${dOpen}<g data-part="drop"></g></g></g><g data-part="words"></g>`;
      g.anchors = { slot: [0, 0, LID / 10], top: [0, 0, LID / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const f = Math.round(st.fill * 80) / 80, d = Math.round(st.drop * 100) / 100;
        w.rebuild(el.pile, String(f), () => pile(f));
        w.rebuild(el.drop, String(d), () => (d < 0.995 ? dropCoin(d) : ""));
        if (lab) w.rebuild(el.words, "1", () => LAB.word(Pm, lab, [R + 8, 0, LID + 10], "savings jar", "#556", { anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) st.wF = B.num(p, "fill", st.wF, 0, 1);
        if (p.drop !== undefined) { st.wD = B.num(p, "drop", st.wD, 0, 1); if (st.wD < st.drop) st.drop = st.wD; }
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the coin falls under gravity (about 0.25 s through its 3 cm), the pile settles gently
      g.update = (dt) => {
        const calm = ISO.still();
        st.fill = ISO.follow(st.fill, st.wF, dt, 0.4, calm); if (Math.abs(st.fill - st.wF) < 0.003) st.fill = st.wF;
        st.drop = calm ? st.wD : Math.min(st.wD, st.drop + dt * 4 * (0.3 + st.drop * 2));
        draw();
        return st.fill !== st.wF || st.drop !== st.wD;
      };
      g.readout = () => `savings jar · about ${Math.round(st.wF * 100)}% full of coins · goal ${st.goal}${st.wD < 0.99 ? " · a coin held over the slot" : ""}`;
      draw();
      return g;
    },
  });
})();
