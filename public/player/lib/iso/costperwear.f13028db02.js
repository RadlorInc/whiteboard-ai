// "costperwear cx cy k price1= price2= wears1= wears2= t=0..1" — two coats on hangers with their price tags; under each a
// tally of times worn and the cost per wear (price / times worn), which falls as t runs the tally up. Every number on
// the drawing comes from the line. The coats are the garment drawing.
(() => {
  const X = 175, TY = 112, PER = 30, ROWS = 2;
  const free = { class: "free", "data-free": "1" };
  const money = (v) => "$" + (Number.isInteger(v) ? String(v) : v.toFixed(2));
  ISO.add({
    name: "costperwear", title: "Cost per wear", compare: null,
    about: "Two coats side by side on hangers, a cheaper one (price1) and a dearer one (price2), each with a price tag. Under each, a tally of times worn (wears1, wears2) counts up as t goes from 0 to 1, with the cost per wear (price divided by times worn) beneath it; the lower cost per wear turns green. If a tally is too long for its box, each mark stands for several wears and the drawing says so. Named parts: left, right.",
    line: "costperwear cx cy k=0.2..1.5 price1=1..5000 price2=1..5000 wears1=1..1000 wears2=1..1000 t=0..1",
    demo: { line: "costperwear 480 268 0.88 price1=40 price2=200 wears1=10 wears2=120 t=0", script: [{ set: { t: 0 }, hold: 1 }, { set: { t: 0.3 }, hold: "settle" }, { set: { t: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(17);
      const g = P.base(parent, cx, cy, k);
      const num = (v, d, lo, hi) => { const x = +v; return Number.isFinite(x) && x > 0 ? ISO.clamp(Math.round(x * 100) / 100, lo, hi) : d; };
      const coats = [
        { price: num(o.price1, 40, 1, 5000), wears: Math.round(num(o.wears1, 10, 1, 1000)), x: -X, fabric: "polyester", c: "grey", name: "left" },
        { price: num(o.price2, 200, 1, 5000), wears: Math.round(num(o.wears2, 100, 1, 1000)), x: X, fabric: "wool", c: "camel", name: "right" },
      ];
      const unit = Math.max(1, Math.ceil(Math.max(coats[0].wears, coats[1].wears) / (PER * ROWS)));
      for (const q of coats) {
        const at = P.el("g", { "data-name": q.name }, g);
        ISO.all.garment.make([q.x, -92, 0.3], { kind: "coat", fabric: q.fabric, c: q.c }, "", at);
        // price tag on a string from the hanger hook
        const tx = q.x + 92, ty = -200;
        P.el("path", { d: `M${q.x + 8} -246Q${q.x + 50} -250 ${tx - 30} ${ty - 8}`, fill: "none", stroke: "#8a8680", "stroke-width": 2.4, ...free }, at);
        const tag = `M${tx - 34} ${ty - 16}L${tx + 46} ${ty - 16}L${tx + 46} ${ty + 22}L${tx - 34} ${ty + 22}L${tx - 46} ${ty + 3}Z`;
        const tl = P.layer(at, P.clip(at, tag)); tl.stroke(tx - 50, ty + 3, tx + 50, ty + 3, 44, "#f6efdf"); tl.stroke(tx - 30, ty + 14, tx + 40, ty + 14, 6, "#e6dcc4", 0.8); tl.done();
        P.ink(tag, at, 2.6, false); P.el("circle", { cx: tx - 32, cy: ty + 3, r: 4, fill: "#eadfc8", stroke: P.INK, "stroke-width": 2 }, at);
        at.insertAdjacentHTML("beforeend", ISO.word([tx + 6, ty + 11], money(q.price), "#16233b", { size: 21, halo: false }));
        // tally box, marks, and the two lines of numbers
        P.el("rect", { x: q.x - 135, y: TY - 14, width: 270, height: 96, rx: 10, fill: "#f6efdf", stroke: P.INK, "stroke-width": 2.4, ...free }, at);
        q.marks = P.el("path", { d: "", fill: "none", stroke: P.INK, "stroke-width": 3, "stroke-linecap": "round", ...free }, at);
        at.insertAdjacentHTML("beforeend", ISO.word([q.x, TY + 112], "", "#444", { size: 20 }) + ISO.word([q.x, TY + 142], "", "#444", { size: 24 }));
        const words = at.querySelectorAll("text"); q.count = words[words.length - 2]; q.per = words[words.length - 1];
        q.shown = -1;
      }
      if (unit > 1) g.insertAdjacentHTML("beforeend", ISO.word([0, TY + 178], `each mark = ${unit} wears`, "#666", { size: 16 }));
      const tally = (q, n) => {
        let d = ""; const marks = Math.ceil(n / unit);
        for (let i = 0; i < marks; i++) {
          const row = Math.floor(i / PER), b = Math.floor((i % PER) / 5), m = i % 5, x0 = q.x - 122 + b * 42, y0 = TY - 2 + row * 44;
          d += m < 4 ? `M${x0 + m * 8} ${y0}l${(Math.sin(i * 7) * 1.5).toFixed(1)} 32` : `M${x0 - 5} ${y0 + 26}L${x0 + 30} ${y0 + 6}`;
        }
        q.marks.setAttribute("d", d);
      };
      const st = { t: ISO.clamp(+o.t || 0, 0, 1) }; let v = st.t;
      const paint = () => {
        const per = coats.map((q) => { const n = Math.round(v * q.wears); return n > 0 ? q.price / n : null; });
        coats.forEach((q, i) => {
          const n = Math.round(v * q.wears);
          if (n !== q.shown) { q.shown = n; tally(q, n); q.count.textContent = ISO.say(n === 1 ? "worn 1 time" : `worn ${n} times`); q.per.textContent = per[i] == null ? ISO.say("not worn yet") : ISO.say(`${money(Math.round(per[i] * 100) / 100)} per wear`); }
          const best = per[0] != null && per[1] != null && per[i] < per[1 - i];
          q.per.setAttribute("fill", best ? "#2c6a22" : "#444");
        });
      };
      paint();
      g.set = (p) => { if (p.t !== undefined) st.t = ISO.clamp(+p.t || 0, 0, 1); };
      g.update = (dt) => { v = ISO.still() ? st.t : ISO.follow(v, st.t, dt, 0.6); if (Math.abs(v - st.t) < 0.0005) v = st.t; paint(); return v !== st.t; };
      g.readout = () => coats.map((q) => `${money(q.price)} coat worn ${Math.round(st.t * q.wears)} times`).join(", ");
      return g;
    },
  });
})();
