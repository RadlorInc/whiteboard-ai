// "plaidseam cx cy k match=0..1 c=…" — two pieces of plaid cloth sewn together down a seam. match=1 the checks line up
// across the seam; match=0 the right piece is off by half a check, so every stripe breaks at the seam.
(() => {
  const W = 250, H = 340, Y0 = -H / 2, CHECK = 74;
  const free = { class: "free", "data-free": "1" };
  ISO.add({
    name: "plaidseam", title: "Plaid seam", compare: null,
    about: "Two pieces of plaid cloth sewn together down a center seam. match=1: the stripes run straight across the seam, which takes extra cloth and careful cutting. match=0: the right piece is off by half a check, so the stripes jump at the seam. Values between slide the right piece. Named parts: left, right, seam.",
    line: "plaidseam cx cy k=0.2..1.5 match=0..1 c=rose|blue|teal|mustard|black|grey|olive|rust|plum|camel|sage|red",
    demo: { line: "plaidseam 480 270 0.9 match=0", script: [{ set: { match: 0 }, hold: 1.2 }, { set: { match: 1 }, hold: "settle" }, { set: { match: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, col = P.colorOf("flannel", o.c);
      const g = P.base(parent, cx, cy, k);
      const piece = (x0, name) => {
        const d = `M${x0} ${Y0}H${x0 + W}V${Y0 + H}H${x0}Z`, at = P.el("g", { "data-name": name }, g), cl = P.clip(at, d);
        const inner = P.el("g", {}, P.el("g", { "clip-path": `url(#${cl})` }, at));
        P.seed(61); P.brush("flannel", inner, null, [x0, x0 + W, Y0 - CHECK, Y0 + H + CHECK], col, { density: 0.9 });
        // a bright thread in the check, so where it breaks at the seam is easy to see
        const acc = P.layer(inner), yb = Y0 - CHECK - 30 + CHECK / 2;
        for (let y = yb; y < Y0 + H + CHECK; y += CHECK) acc.stroke(x0 - 20, y, x0 + W + 20, y + P.rr(-1, 1), 8, "#e3b23c", 0.9);
        for (let x = x0 - 30 + CHECK / 2; x < x0 + W + 20; x += CHECK) acc.stroke(x, Y0 - CHECK - 20, x + P.rr(-1, 1), Y0 + H + CHECK + 20, 8, "#e3b23c", 0.75);
        acc.done();
        P.ink(d, at, 3.4);
        return inner;
      };
      piece(-W, "left"); const right = piece(0, "right");
      const seam = P.el("g", { "data-name": "seam" }, g);
      P.el("path", { d: `M-9 ${Y0 + 4}V${Y0 + H - 4}M9 ${Y0 + 4}V${Y0 + H - 4}`, fill: "none", stroke: "#e0cc9e", "stroke-width": 4, "stroke-dasharray": "12 8", ...free }, seam);
      P.el("path", { d: `M0 ${Y0}V${Y0 + H}`, fill: "none", stroke: P.INK, "stroke-width": 4.2, ...free }, seam);
      const st = { match: ISO.clamp(o.match === undefined ? 1 : +o.match || 0, 0, 1) }; let m = st.match;
      const paint = () => right.setAttribute("transform", `translate(0 ${((1 - m) * CHECK / 2).toFixed(2)})`);
      paint();
      g.set = (p) => { if (p.match !== undefined) st.match = ISO.clamp(+p.match || 0, 0, 1); };
      g.update = (dt) => { m = ISO.still() ? st.match : ISO.follow(m, st.match, dt, 0.35); if (Math.abs(m - st.match) < 0.002) m = st.match; paint(); return m !== st.match; };
      g.readout = () => (st.match >= 0.99 ? "checks line up at the seam" : st.match <= 0.01 ? "checks off by half at the seam" : `checks ${Math.round(st.match * 100)}% lined up`);
      return g;
    },
  });
})();
