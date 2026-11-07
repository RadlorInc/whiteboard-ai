// "lamppaint cx cy k kind=table|pendant on=0|1 tone=warm|cool" — a painted lamp from the front. table: fabric drum
// shade on a brass stem; pendant: a store-style hanging shade on a cord. on lights the bulb, the shade and a pool of
// light below; tone=warm (yellow store light) or cool (white daylight-like light).
(() => {
  const free = { class: "free", "data-free": "1" };
  const TONE = { warm: ["#ffd27a", "#fff0c4"], cool: ["#d6e9ff", "#f7fbff"] };
  ISO.add({
    name: "lamppaint", title: "Lamp", compare: null,
    about: "A lamp painted from the front: kind=table (cloth shade on a stem) or pendant (a hanging store light). on=1 lights the bulb, the shade and a pool of light below it; tone=warm gives yellow light, tone=cool a whiter, daylight-like light. Parts: shade bulb light base.",
    line: "lamppaint cx cy k=0.2..1.5 kind=table|pendant on=0|1 tone=warm|cool",
    demo: { line: "lamppaint 480 270 0.82 kind=table on=0", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { on: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, kind = o.kind === "pendant" ? "pendant" : "table", [glow, hot] = TONE[o.tone === "cool" ? "cool" : "warm"]; P.seed(kind === "table" ? 11 : 13);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "polyester") => P.brush(f, par, P.clip(par, d), box, col);
      const tbl = kind === "table";
      const SHADE = tbl ? "M-100 -250 L100 -250 L160 -60 L-160 -60 Z" : "M-34 -150 L34 -150 L160 -30 L-160 -30 Z";
      const FLOOR = tbl ? 214 : 262, BEAM = tbl ? `M-160 -60 L160 -60 L280 ${FLOOR} L-280 ${FLOOR} Z` : `M-150 -30 L150 -30 L290 ${FLOOR} L-290 ${FLOOR} Z`;
      const sh = P.layer(g); sh.stroke(-120, FLOOR + 6, 120, FLOOR + 6, 18, "#5b4a36", 0.16); sh.done();
      // light: one group under the lamp that fades in
      const light = P.el("g", { "data-name": "light", opacity: 0 }, g);
      for (const r of tbl ? [230, 180] : [170, 120]) P.el("circle", { cx: 0, cy: tbl ? -150 : -60, r, fill: glow, opacity: 0.22 }, light);
      P.el("path", { d: BEAM, fill: glow, opacity: 0.32 }, light);
      P.el("ellipse", { cx: 0, cy: FLOOR, rx: tbl ? 260 : 280, ry: 22, fill: hot, opacity: 0.85 }, light);
      const base = P.el("g", { "data-name": "base" }, g);
      if (tbl) { const STEM = "M-11 -60 L11 -60 L11 184 L-11 184 Z", FOOT = "M-96 214 Q-96 188 -62 182 L62 182 Q96 188 96 214 Z";
        fill(base, STEM, [-11, 11, -60, 184], "#b08a5e"); fill(base, FOOT, [-96, 96, 182, 214], "#5a4a3c");
        const bl = P.layer(base); bl.stroke(-4, -50, -4, 176, 4, "#f0d9a8", 0.6); bl.stroke(-60, 192, 30, 190, 6, "#8a7766", 0.7); bl.done(); P.ink(STEM + FOOT, base, 3.2); }
      else { P.el("path", { d: "M0 -320 L0 -150", stroke: "#3b3631", "stroke-width": 5, fill: "none", ...free }, base); const CAP = "M-18 -168 L18 -168 L22 -148 L-22 -148 Z"; fill(base, CAP, [-22, 22, -168, -148], "#3b3631"); P.ink(CAP, base, 2.6); }
      const bulb = P.el("g", { "data-name": "bulb" }, g), BY = tbl ? -70 : -30, BR = tbl ? 34 : 30;
      const bd = `M${-BR} ${BY}A${BR} ${BR} 0 1 0 ${BR} ${BY}A${BR} ${BR} 0 1 0 ${-BR} ${BY}Z`;
      fill(bulb, bd, [-BR, BR, BY - BR, BY + BR], "#e9e5da"); const bon = P.el("path", { d: bd, fill: hot, opacity: 0 }, bulb); P.ink(bd, bulb, 2.6);
      const shade = P.el("g", { "data-name": "shade" }, g);
      fill(shade, SHADE, tbl ? [-160, 160, -250, -60] : [-160, 160, -150, -30], tbl ? "#e2d3b0" : "#1f6f6a", tbl ? "linen" : "polyester");
      const sl = P.layer(shade, P.clip(shade, SHADE));
      if (tbl) { sl.stroke(-170, -240, 170, -240, 16, "#c8b48c", 0.8); sl.stroke(-170, -70, 170, -70, 18, "#c8b48c", 0.8); }
      else { sl.stroke(-30, -140, -130, -40, 16, P.lt("#1f6f6a", 0.35), 0.6); sl.stroke(-170, -38, 170, -38, 12, P.dk("#1f6f6a", 0.35), 0.8); }
      sl.done();
      const lit = P.el("g", { opacity: 0 }, shade), il = P.layer(lit, P.clip(lit, SHADE));
      if (tbl) { il.stroke(-170, -150, 170, -150, 220, glow, 0.5); il.stroke(-170, -80, 170, -80, 40, hot, 0.45); }
      else il.stroke(-170, -34, 170, -34, 18, hot, 0.9);
      il.done();
      P.ink(SHADE, shade, 3.6);
      const st = { on: o.on === "1" || o.on === 1 ? 1 : 0 }; let v = st.on;
      const paint = () => { const s = v.toFixed(3); light.setAttribute("opacity", s); lit.setAttribute("opacity", s); bon.setAttribute("opacity", s); };
      paint();
      g.set = (p) => { if (p.on !== undefined) st.on = p.on === "1" || p.on === 1 ? 1 : 0; };
      g.update = (dt) => { v = ISO.still() ? st.on : ISO.follow(v, st.on, dt, 0.18); if (Math.abs(v - st.on) < 0.004) v = st.on; paint(); return v !== st.on; };
      g.readout = () => `${kind} lamp ${st.on ? "on" : "off"}`;
      return g;
    },
  });
})();
