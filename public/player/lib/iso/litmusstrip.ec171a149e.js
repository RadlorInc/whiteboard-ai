// "litmusstrip cx cy k c=red|blue in=acid|alkali|water lift=0..10 level=0..6 lab=0 lit=strip|splint" — a PART
// (PARTS.md): a 7 × 66 mm strip of red or blue litmus paper hanging from a wooden splint, origin the middle of the
// splint's underside (where it rests across a beaker's `rim`). lift = how high the splint is held above that (cm,
// eased: 0 lowers it in); level = how far the liquid's surface is under the rim (cm, default 2.4). The part of the strip
// that has gone under the surface soaks (about 1.5 s) and keeps the colour it takes: in an acid blue litmus turns red,
// in an alkali red litmus turns blue, in water (or the colour it already is) it only darkens wet. The strip and splint
// are built once and slid (a world move is a flat screen move); only the soaked part is redrawn. Reused from
// indicator.js (its litmus strips), in mm; anchors in cm. set({ lift, in, c }).
(() => {
  const K = window.K;
  const W = 3.5, LEN = 66, TOP = 3, SPL = 40;
  const COL = { red: "#e46a62", blue: "#5b7fd6" }, TURN = { acid: "#d8443c", alkali: "#3a68cc" };
  const tint = (c) => LAB.tintOf(c, LAB.mix(c, "#000000", 0.5));

  ISO.add({
    name: "litmusstrip", title: "Litmus paper strip (part)", compare: null,
    about: "A red or blue litmus paper strip (7 × 66 mm) hanging from a wooden splint laid across a beaker's rim; lift=0 lowers it into the liquid (level cm under the rim) and the soaked part changes colour: blue turns red in acid, red turns blue in alkali. anchors: tip",
    line: "litmusstrip cx cy k c=red|blue in=acid|alkali|water lift=0..10 level=0..6 lab=0 lit=strip|splint",
    demo: { line: "litmusstrip 480 215 44 c=blue in=acid lift=3.4", script: [{ set: {}, hold: 1 }, { set: { lift: 0, lit: "strip" }, hold: "settle" }, { set: { lift: 3.4, lit: "" }, hold: "settle" }, { set: { c: "red", in: "alkali", lift: 0, lit: "splint" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const pick = (v, set, d) => (set.includes(v) ? v : d);
      const st = { c: pick(o.c, ["red", "blue"], "red"), liq: pick(o.in, ["acid", "alkali", "water"], "acid"), lift: ISO.clamp(ISO.num(o, "lift", 0), 0, 10) * 10, level: ISO.clamp(ISO.num(o, "level", 2.4), 0, 6) * 10, soak: 0, wet: 0, lit: o.lit || "" };
      const want = { lift: st.lift }, w = ISO.writer(), zBot = TOP - LEN;
      const under = () => Math.max(0, -st.level - (zBot + st.lift));   // mm of strip under the surface now
      st.soak = under(); st.wet = st.soak > 0 ? 1 : 0;
      const wetCol = () => (st.liq === "acid" && st.c === "blue" ? TURN.acid : st.liq === "alkali" && st.c === "red" ? TURN.alkali : LAB.mix(COL[st.c], "#000000", 0.15));
      const strip = (soak, wet) => {
        const cut = zBot + soak, soaked = LAB.mix(COL[st.c], wetCol(), wet);
        return (soak > 0.2 ? ISO.tinted(tint(soaked), ISO.wbox(Pm, [-W, W], [-3.3, -3], [zBot, cut], "mid")) : "") + ISO.tinted(tint(COL[st.c]), ISO.wbox(Pm, [-W, W], [-3.3, -3], [cut, TOP], "mid")) +
          (soak > 0.2 && soak < LEN - 0.5 ? `<path d="${K.pathOf([K.iso([-W, -2.95, cut], Pm), K.iso([W, -2.95, cut], Pm)])}" stroke="${LAB.mix(soaked, "#000000", 0.35)}" stroke-width="0.8"/>` : "");
      };
      const splint = ISO.tinted(ISO.T.wood, ISO.wbox(Pm, [-SPL, SPL], [-3, 3], [0, 3.5], "mid")) + K.dotsSvg([K.iso([0, 3.05, 1.75], Pm)], { size: 0.6 });
      g.innerHTML = `<g data-part="slide"><g data-name="strip" data-part="strip"></g><g data-name="splint">${splint}</g></g><g data-part="words"></g>`;
      const el = LAB.parts(g);
      const draw = () => {
        const lq = Math.round(st.lift * 4) / 4, sq = Math.round(st.soak * 2) / 2, wq = Math.round(st.wet * 20) / 20;
        w.attr(el.slide, "transform", B17.move(Pm, [0, 0, lq]));
        w.rebuild(el.strip, `${sq} ${wq} ${st.c} ${st.liq}`, () => strip(sq, wq));
        if (lab) w.rebuild(el.words, `${st.c} ${wq > 0.5} ${st.liq}`, () => ISO.word(K.iso([SPL, 0, lq + 12], Pm), `${st.c} litmus${wq > 0.5 && sq > 0 ? ` (in ${st.liq})` : ""}`, COL[st.c], { size: 13, anchor: "start" }));
        g.anchors = { tip: [0, -0.315, +((zBot + st.lift) / 10).toFixed(3)] };
        B17.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.lift !== undefined && Number.isFinite(+p.lift)) want.lift = ISO.clamp(+p.lift, 0, 10) * 10;
        if (p.level !== undefined && Number.isFinite(+p.level)) st.level = ISO.clamp(+p.level, 0, 6) * 10;
        // a new strip (another colour) or another liquid starts dry
        if ((p.c && COL[p.c] && p.c !== st.c) || (p.in && ["acid", "alkali", "water"].includes(p.in) && p.in !== st.liq)) { st.c = COL[p.c] ? p.c : st.c; st.liq = pick(p.in, ["acid", "alkali", "water"], st.liq); st.soak = 0; st.wet = 0; }
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.lift = ISO.follow(st.lift, want.lift, dt, 0.5, calm);
        if (Math.abs(st.lift - want.lift) < 0.05) st.lift = want.lift;
        // the soaked length only grows (paper stays wet); its colour takes about 1.5 s to come through
        const sub = under(), soak0 = st.soak;
        if (sub > st.soak) st.soak = sub;
        const wantWet = st.soak > 0 ? 1 : 0, wet0 = st.wet;
        st.wet = calm ? wantWet : Math.min(wantWet, st.wet + dt / 1.5);
        draw();
        return st.lift !== want.lift || st.wet !== wet0 || st.soak !== soak0;
      };
      g.readout = () => `${st.c} litmus strip · ${st.soak > 0 ? `${(st.soak / 10).toFixed(1)} cm soaked in ${st.liq}: ${wetCol() === TURN.acid ? "blue turns red (acid)" : wetCol() === TURN.alkali ? "red turns blue (alkali)" : `stays ${st.c}`}` : "dry"} · splint ${(st.lift / 10).toFixed(1)} cm above the rim`;
      draw();
      return g;
    },
  });
})();
