// "shelfpaint cx cy k items=0..8" — a painted store shelf unit from the front: wooden frame, four shelves with price
// rails and blank tags, each holding up to 8 stacks of folded T-shirts. items sets how many stacks stand on every shelf.
(() => {
  const free = { class: "free", "data-free": "1" };
  const X0 = -280, X1 = 280, TOP = -300, BOT = 270, SHELF = [-158, -28, 102, 232], PITCH = 64;
  const COLS = ["#9d3a56", "#28507f", "#dfe5ea", "#c6952f", "#1f6f6a", "#7f9a8c", "#a8562c", "#23252b"];
  ISO.add({
    name: "shelfpaint", title: "Store shelf", compare: null,
    about: "A store shelf unit painted from the front: wooden frame, four shelves with price rails and blank tags, stacks of folded T-shirts. items=0..8 is how many stacks stand on each shelf, from fully stocked to empty. Parts: frame shelves rails stock.",
    line: "shelfpaint cx cy k=0.2..1.5 items=0..8",
    demo: { line: "shelfpaint 480 280 0.86 items=8", script: [{ set: {}, hold: 1 }, { set: { items: 3 }, hold: "settle" }, { set: { items: 0 }, hold: "settle" }, { set: { items: 8 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(53);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "polyester") => P.brush(f, par, P.clip(par, d), box, col);
      const rect = (x0, y0, x1, y1) => `M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} L${x0} ${y1} Z`;
      const sh = P.layer(g); sh.stroke(X0 - 30, BOT + 6, X1 + 30, BOT + 6, 20, "#5b4a36", 0.16); sh.done();
      const frame = P.el("g", { "data-name": "frame" }, g);
      fill(frame, rect(X0, TOP, X1, BOT), [X0, X1, TOP, BOT], "#c8bfa6");
      const wood = "#a97f4f", WOODS = [rect(X0 - 22, TOP - 30, X0, BOT), rect(X1, TOP - 30, X1 + 22, BOT), rect(X0 - 22, TOP - 54, X1 + 22, TOP - 20), rect(X0 - 22, BOT - 18, X1 + 22, BOT + 4)];
      const BX = [[X0 - 22, X0, TOP - 30, BOT], [X1, X1 + 22, TOP - 30, BOT], [X0 - 22, X1 + 22, TOP - 54, TOP - 20], [X0 - 22, X1 + 22, BOT - 18, BOT + 4]];
      WOODS.forEach((d, i) => fill(frame, d, BX[i], wood, "linen"));
      const hd = P.layer(frame); hd.stroke(-110, TOP - 37, 110, TOP - 37, 16, P.lt(wood, 0.25), 0.6); hd.done();
      P.ink(WOODS.join("") + rect(X0, TOP - 20, X1, BOT - 18), frame, 3.6);
      const st = { items: ISO.clamp(Math.round(+o.items), 0, 8) }; if (!Number.isFinite(st.items)) st.items = 8; let now = st.items;
      const paint = () => slots.forEach((s, j) => s.setAttribute("opacity", ISO.clamp(now - (j % 8), 0, 1).toFixed(3)));
      const stock = P.el("g", { "data-name": "stock" }, g), slots = [];
      SHELF.forEach((y, si) => ISO.later(() => { P.seed(90 + si); for (let i = 0; i < 8; i++) {
        const s = P.el("g", {}, stock), x = X0 + 18 + i * PITCH + 4, w = 54, col = COLS[(i * 3 + si * 5) % 8], l = P.layer(s); let ink = "";
        for (let j = 0; j < 4; j++) { const yb = y - 4 - j * 24; l.stroke(x, yb - 11, x + w, yb - 11, 22, j % 2 ? P.dk(col, 0.06) : col, 1); l.stroke(x + 2, yb - 19, x + w - 2, yb - 19, 5, P.lt(col, 0.3), 0.7); ink += `M${x} ${yb}L${x + w} ${yb}L${x + w} ${yb - 22}L${x} ${yb - 22}Z`; }
        const ty = y - 4 - 3 * 24 - 22; l.done();
        P.el("path", { d: `M${x + w / 2 - 10} ${ty}L${x + w / 2} ${ty + 9}L${x + w / 2 + 10} ${ty}`, fill: "none", stroke: P.dk(col, 0.4), "stroke-width": 2.6, ...free }, s);
        P.ink(ink, s, 2.4, false); slots.push(s); } paint(); }));
      const shelves = P.el("g", { "data-name": "shelves" }, g), rails = P.el("g", { "data-name": "rails" }, g); let sd = "", rd = "";
      for (const y of SHELF) { sd += rect(X0, y - 2, X1, y + 10); rd += rect(X0, y + 10, X1, y + 26); }
      for (const y of SHELF) { fill(shelves, rect(X0, y - 2, X1, y + 10), [X0, X1, y - 2, y + 10], P.dk(wood, 0.05), "linen"); fill(rails, rect(X0, y + 10, X1, y + 26), [X0, X1, y + 10, y + 26], "#d9dcdf");
        const tl = P.layer(rails); for (let i = 0; i < 8; i += 2) tl.stroke(X0 + 30 + i * PITCH, y + 18, X0 + 66 + i * PITCH, y + 18, 11, "#fbfaf4", 1); tl.done(); }
      P.ink(sd, shelves, 2.8, false); P.ink(rd, rails, 2.4, false);
      g.set = (p) => { if (p.items !== undefined) { const v = Math.round(+p.items); if (Number.isFinite(v)) st.items = ISO.clamp(v, 0, 8); } };
      g.update = (dt) => { now = ISO.still() ? st.items : ISO.follow(now, st.items, dt, 0.35); if (Math.abs(now - st.items) < 0.01) now = st.items; paint(); return now !== st.items; };
      g.readout = () => `${st.items} of 8 stacks on each shelf`;
      return g;
    },
  });
})();
