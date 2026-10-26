// "salestag cx cy k was=0..999 now=0..999 swing=0..1 lab=0 lit=card|string|prices" — a PART (batch 6, economy): a
// hanging card price tag, its origin the hanging point (where the string loop is tied on to a product or a hook). A
// 5 × 8 cm card 0.5 mm thick with clipped top corners, a reinforced ring round its punched hole, a string loop from the
// hole up to the knot; printed "was" with the old price struck through and "now" with the new price. The tag carries
// its own string and swings in its own plane: swing 0 → 1 is the amplitude (up to about 18°), a pendulum of about
// 0.8 s; set({ swing, was, now }). World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K, G = window.G;
  const W = 5, H = 8, LS = 5, HOLE = 0.9;   // card, string length (knot to hole), hole from the card's top
  ISO.add({
    name: "salestag", title: "Hanging price tag (part)", compare: null,
    about: "A card price tag on a string loop with a reinforced hole: the old price crossed out and the new price; it swings on its string. anchors: top",
    line: "salestag cx cy k was=0..999 now=0..999 swing=0..1 lab=0 lit=card|string|prices",
    demo: { line: "salestag 480 110 30 was=12 now=8 lab=1", script: [{ set: {}, hold: 1 }, { set: { swing: 1, lit: "card" }, hold: 3 }, { set: { swing: 0.3, lit: "string" }, hold: 2 }, { set: { swing: 0, now: 6.5, lit: "prices" }, hold: "settle" }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { was: B.num(o, "was", 12, 0, 999), now: B.num(o, "now", 8, 0, 999), amp: 0, want: B.num(o, "swing", 0, 0, 1), ph: 0, lit: o.lit || "" };
      g.innerHTML = `<g data-name="string"><g data-part="back"></g></g><g data-name="card"><g data-part="card"></g></g><g data-name="prices"><g data-part="prices"></g></g><g data-name="string"><g data-part="front"></g></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, 0] };
      const el = B.parts(g), w = ISO.writer();
      const card = () => {
        const c = 0.9, edge = `M${c} 0H${W - c}L${W} ${c}V${H}H0V${c}Z`, hx = W / 2;
        return `<path d="${edge}" fill="#f7efdc" stroke="#8a7a5a" stroke-width=".06"/>` +
          `<path d="M${c + 0.15} 0.15H${W - c - 0.15}L${W - 0.15} ${c + 0.15}V${H - 0.15}H0.15V${c + 0.15}Z" fill="none" stroke="#c9b48a" stroke-width=".05" stroke-dasharray=".25 .15"/>` +
          `<circle cx="${hx}" cy="${HOLE}" r=".42" fill="#d8c69c" stroke="#8a7a5a" stroke-width=".05"/><circle cx="${hx}" cy="${HOLE}" r=".2" fill="#5a4a2a"/>`;
      };
      const prices = () => {
        const was = st.was.toFixed(2), now = st.now.toFixed(2);
        return B.text(W / 2, 2.6, "was", 0.6, "#6a6050", "middle", 600) + B.text(W / 2, 3.6, was, 0.95, "#6a6050", "middle", 700) +
          `<path d="M${W * 0.18} 3.0L${W * 0.82} 3.55" stroke="#c8352a" stroke-width=".14" stroke-linecap="round"/>` +
          `<path d="M0.5 4.25H${W - 0.5}" stroke="#c9b48a" stroke-width=".05"/>` +
          B.text(W / 2, 5.2, "now", 0.7, "#c8352a", "middle", 700) + B.text(W / 2, 6.9, now, 1.55, "#c8352a", "middle", 800);
      };
      const draw = () => {
        const a = st.amp * 0.31 * Math.sin(st.ph), u = [Math.cos(a), 0, Math.sin(a)], v = [Math.sin(a), 0, -Math.cos(a)];
        const hole = B.add([0, 0.03, 0], v, LS), o0 = B.add(B.add(hole, v, -HOLE), u, -W / 2);
        const tf = B.plane(P, o0, u, v);
        w.rebuild(el.card, "1", () => `<g data-part="cardT">${card()}</g>`);
        w.rebuild(el.prices, `${st.was} ${st.now}`, () => `<g data-part="priceT">${prices()}</g>`);
        g.querySelector('[data-part="cardT"]').setAttribute("transform", tf);
        g.querySelector('[data-part="priceT"]').setAttribute("transform", tf);
        // the loop: two strands from the knot down to either side of the hole; the back strand passes behind the card
        const knot = K.iso([0, 0, 0], P), side = (s) => K.iso(B.add(B.add(hole, u, s * 0.12), [0, s * 0.04, 0]), P);
        const sw = Math.max(0.6, G.scaleOf(P) * 0.06).toFixed(2);
        const strand = (s) => `<path d="${K.pathOf([knot, side(s)])}" fill="none" stroke="#b03a2e" stroke-width="${sw}" stroke-linecap="round"/>`;
        el.back.innerHTML = strand(-1);
        el.front.innerHTML = strand(1) + K.dotsSvg([knot], { size: 0.9 }) + K.dotsSvg([side(1), side(-1)], { size: 0.45 });
        if (lab) w.rebuild(el.words, "1", () => B.word(P, [W / 2 + 0.5, 0, -LS - 3], "price tag"));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.swing !== undefined) st.want = B.num(p, "swing", st.want, 0, 1);
        if (p.was !== undefined) st.was = B.num(p, "was", st.was, 0, 999);
        if (p.now !== undefined) st.now = B.num(p, "now", st.now, 0, 999);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // a pendulum of 0.8 s whose amplitude eases to swing; still: hangs at rest
      g.update = (dt) => {
        if (ISO.still()) { st.amp = 0; st.ph = 0; draw(); return false; }
        st.amp = ISO.follow(st.amp, st.want, dt, 0.6); if (Math.abs(st.amp - st.want) < 0.003) st.amp = st.want;
        if (st.amp > 0) st.ph = (st.ph + (dt * 2 * Math.PI) / 0.8) % (2 * Math.PI); else st.ph = 0;
        draw();
        return st.amp > 0 || st.amp !== st.want;
      };
      g.readout = () => `price tag · was ${st.was.toFixed(2)}, now ${st.now.toFixed(2)} (${st.was > 0 ? Math.round((1 - st.now / st.was) * 100) : 0}% off)${st.want > 0 ? " · swinging" : ""}`;
      draw();
      return g;
    },
  });
})();
