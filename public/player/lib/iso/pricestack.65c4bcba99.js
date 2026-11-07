// "pricestack cx cy k build=0..1 | Fabric:5,Labor:3,…" — a price tag split into stacked colored parts, one per name and
// dollar amount in the line's text, each part as tall as its share of the price; the total on top is their sum. build
// drops the parts in one by one from the bottom. With no text the tag stays empty: no numbers are made up.
(() => {
  const TW = 104, TOP = -128, BOT = 196, MAX = 8;
  const TAG = `M${-TW} ${TOP - 20}L${-TW + 42} -214L${TW - 42} -214L${TW} ${TOP - 20}L${TW} ${BOT}L${-TW} ${BOT}Z`;
  const BANDS = ["rose", "teal", "mustard", "blue", "olive", "plum", "rust", "sage"];
  const free = { class: "free", "data-free": "1" };
  const money = (v) => "$" + (Number.isInteger(v) ? String(v) : v.toFixed(2));
  const parse = (t) => String(t || "").split(",").map((s) => { const i = s.lastIndexOf(":"); if (i < 0) return null;
    const name = s.slice(0, i).trim().slice(0, 22).replace(/&[^;]*$/, ""), amt = parseFloat(s.slice(i + 1).replace(/[$\s]/g, ""));
    return name && Number.isFinite(amt) && amt > 0 && amt < 1e6 ? { name, amt: Math.round(amt * 100) / 100 } : null; }).filter(Boolean).slice(0, MAX);
  ISO.add({
    name: "pricestack", title: "Where the price goes", compare: null,
    about: "A price tag split into stacked colored parts, one per item in the line's text (after |, as Name:amount pairs, e.g. Fabric:5,Labor:3); each part's height is its share of the price, its name and dollar amount sit beside it, and the total on top is their sum. build=0 empty tag, build=1 every part stacked. Parts are named part1, part2, … from the bottom.",
    line: "pricestack cx cy k=0.2..1.5 build=0..1 | Name:amount,Name:amount,…",
    demo: { line: "pricestack 480 280 0.98 build=0 | Fabric:5,Labor:3,Shipping:2,Store:15", script: [{ set: { build: 0 }, hold: 1 }, { set: { build: 0.5 }, hold: "settle" }, { set: { build: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(29);
      const parts = parse(t), total = Math.round(parts.reduce((s, p) => s + p.amt, 0) * 100) / 100;
      const g = P.base(parent, cx, cy, k), cl = P.clip(g, TAG);
      // the paper tag, its hole and string
      P.el("path", { d: "M0 -196Q-30 -250 18 -268Q70 -280 60 -300", fill: "none", stroke: "#b08a5e", "stroke-width": 5, "stroke-linecap": "round", ...free }, g);
      const paper = P.layer(g, cl);
      for (let i = 0; i < 12; i++) { const y = P.rr(-220, BOT); paper.stroke(-TW - 20, y, TW + 20, y + P.rr(-10, 10), P.rr(26, 44), P.pick(["#f3ead6", "#efe3cb", "#f7f0e2"]), 0.9); }
      paper.done();
      const stack = P.el("g", { "clip-path": `url(#${cl})` }, g), labels = P.el("g", {}, g);
      const H = BOT - TOP; let y = BOT, lastY = Infinity;
      const items = parts.map((p, i) => {
        const h = (p.amt / total) * H, y1 = y - h, col = P.COLORS[BANDS[i % BANDS.length]], mid = (y + y1) / 2;
        const band = P.el("g", { opacity: 0, "data-name": `part${i + 1}` }, stack);
        P.el("rect", { x: -TW - 4, y: y1.toFixed(1), width: TW * 2 + 8, height: (h + 0.6).toFixed(1), fill: col }, band);
        const w = Math.min(14, h * 0.4), bl = P.layer(band);
        for (let s = 0; s < Math.max(2, Math.round(h / 16)); s++) { const sy = P.rr(y1 + w / 2 + 1, y - w / 2 - 1); bl.stroke(-TW - 10, sy, TW + 10, sy + P.rr(-2, 2), P.rr(w * 0.5, w), P.pick([P.dk(col, 0.14), P.lt(col, 0.14)]), 0.7); }
        bl.done();
        if (i < parts.length - 1) P.el("path", { d: `M${-TW} ${y1.toFixed(1)}L${TW} ${y1.toFixed(1)}`, fill: "none", stroke: P.INK, "stroke-width": 2.4, ...free }, band);
        // labels to the right, pushed up so they never sit on each other
        const ly = Math.min(mid, lastY - 30); lastY = ly;
        const lab = P.el("g", { opacity: 0 }, labels);
        P.el("path", { d: `M${TW + 4} ${mid.toFixed(1)}L${TW + 22} ${ly.toFixed(1)}`, fill: "none", stroke: P.INK, "stroke-width": 2, ...free }, lab);
        P.el("rect", { x: TW + 26, y: ly - 9, width: 14, height: 18, rx: 3, fill: col, stroke: P.INK, "stroke-width": 1.6 }, lab);
        lab.insertAdjacentHTML("beforeend", ISO.word([TW + 48, ly + 7], `${p.name} ${money(p.amt)}`, "#333", { anchor: "start", size: 20 }));
        y = y1;
        return { band, lab, now: -1 };
      });
      P.ink(TAG, g, 3.6);
      P.el("circle", { cx: 0, cy: -196, r: 9, fill: "#eadfc8", stroke: P.INK, "stroke-width": 2.6 }, g);
      P.ink(`M${-TW} ${TOP}H${TW}`, g, 2.4, false);
      if (parts.length) g.insertAdjacentHTML("beforeend", ISO.word([0, TOP - 16], money(total), "#16233b", { size: 32, halo: false }));
      const st = { build: ISO.clamp(+o.build || 0, 0, 1) }; let b = st.build;
      const N = items.length;
      const paint = () => items.forEach((q, i) => {
        const p = ISO.clamp(b * N - i, 0, 1); if (p === q.now) return; q.now = p;
        q.band.setAttribute("opacity", Math.min(1, p * 1.6).toFixed(3)); q.band.setAttribute("transform", `translate(0 ${(-(1 - p) * 90).toFixed(1)})`);
        q.lab.setAttribute("opacity", ISO.smooth(0.5, 1, p).toFixed(3));
      });
      paint();
      g.set = (p) => { if (p.build !== undefined) st.build = ISO.clamp(+p.build || 0, 0, 1); };
      g.update = (dt) => { b = ISO.still() ? st.build : ISO.follow(b, st.build, dt, 0.6); if (Math.abs(b - st.build) < 0.0005) b = st.build; paint(); return b !== st.build; };
      g.readout = () => (parts.length ? `${money(total)} = ` + parts.map((p) => `${p.name} ${money(p.amt)}`).join(" + ") : "empty tag (no parts given)");
      return g;
    },
  });
})();
