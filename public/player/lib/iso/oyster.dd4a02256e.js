// "oyster cx cy k grow=0..1" — an opened oyster on the table with a pearl in it, and a round close-up of the pearl cut
// in half: a tiny grain in the middle and the shiny layers the oyster lays around it. grow adds layers and the pearl in
// the shell gets bigger with them.
(() => {
  const N = 9, F = { class: "free", "data-free": "1" };
  const blob = (cx, cy, rx, ry, wob, n = 22, seedA = 0) => { let d = ""; for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, r = 1 + wob * Math.sin(a * 5 + seedA) * Math.cos(a * 3 - seedA); d += (i ? "L" : "M") + (cx + Math.cos(a) * rx * r).toFixed(1) + " " + (cy + Math.sin(a) * ry * r).toFixed(1); } return d + "Z"; };
  ISO.add({
    name: "oyster", title: "Pearl in an oyster", compare: null,
    about: "An opened oyster on the table with a pearl in it, and a round close-up of the pearl cut in half: a tiny grain at the center with shiny layers laid around it. grow=0 just the grain, grow=1 a full pearl of many layers; the pearl in the shell grows too. Parts: shell, pearl, zoom, grain, layers.",
    line: "oyster cx cy k=0.2..1.5 grow=0..1",
    demo: { line: "oyster 480 270 0.75 grow=0", script: [{ set: { grow: 0 }, hold: 1 }, { set: { grow: 0.5 }, hold: "settle" }, { set: { grow: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(113);
      const g = P.base(parent, cx, cy, k);
      const shell = P.el("g", { "data-name": "shell" }, g);
      // one half, drawn with its hinge tip at the origin and opening to +x: rough outside, pearly inside
      const tear = (len, h, wob, s, inset = 0) => { let d = ""; for (let i = 0; i < 40; i++) { const a = (i / 40) * 6.283, w = 0.5 - 0.5 * Math.cos(a), r = 1 + wob * Math.sin(a * 6 + s) * Math.sin(a * 2 + s); d += (i ? "L" : "M") + ((len / 2) * (1 - Math.cos(a)) * (1 - inset) + len * inset * 0.7).toFixed(1) + " " + (Math.sin(a) * h * (0.35 + 0.65 * w) * r * (1 - inset)).toFixed(1); } return d + "Z"; };
      const half = (rot, len, h, s) => {
        const hg = P.el("g", { transform: `translate(-300 -10) rotate(${rot})` }, shell), out = tear(len, h, 0.06, s), inn = tear(len, h, 0.04, s + 1, 0.16);
        const oc = P.clip(hg, out), a = P.layer(hg, oc); P.el("path", { d: out, fill: "#8a7f70" }, a.g);
        for (let i = 0; i < 14; i++) { const r = P.rr(0.3, 1); a.stroke(len * r, -h, len * r + P.rr(-20, 20), h, P.rr(6, 14), P.pick(["#6f6556", "#a39885", "#b8ad98"]), 0.7, P.rr(-30, 30)); }
        a.done(); P.ink(out, hg, 3.2);
        const ic = P.clip(hg, inn), b = P.layer(hg, ic); P.el("path", { d: inn, fill: "#e9e4ec" }, b.g);
        for (let i = 0; i < 9; i++) { const y = P.rr(-h, h) * 0.7; b.stroke(0, y, len, y + P.rr(-14, 14), P.rr(10, 22), P.pick(["#d7cfe4", "#cfe3e2", "#f6f2f6", "#e6d8e2"]), 0.7, P.rr(-16, 16)); }
        b.done(); P.ink(inn, hg, 2.4);
      };
      half(-26, 250, 92, 1);     // the top half, opened up behind
      half(10, 270, 100, 2.4);    // the bottom half, cupped, the pearl sits in it
      P.el("circle", { cx: -300, cy: -10, r: 10, fill: "#5d544a", stroke: P.INK, "stroke-width": 2.4 }, shell);   // the hinge
      // the soft body: a pale fold in the bottom half
      const body = blob(-130, 40, 88, 40, 0.06, 40, 3);
      P.el("path", { d: body, fill: "#d9cdb9", opacity: 0.9 }, shell); P.ink(body, shell, 2);
      // the pearl in the shell
      const pearl = P.el("g", { "data-name": "pearl" }, g), pg = P.el("g", {}, pearl);
      P.el("circle", { r: 26, fill: "#f3ede6", stroke: P.INK, "stroke-width": 3 }, pg);
      const ph = P.layer(pg); ph.dab(6, 8, 14, "#e4d6d8", 0.7); ph.dab(-9, -9, 7, "#ffffff", 0.95); ph.done();
      const PX = -120, PY = 40;
      P.ink(`M${PX + 24} ${PY - 20} L50 -10`, g, 2.4);
      // the close-up: the pearl cut in half
      const ZX = 190, ZY = 0, ZR = 140, zoom = P.el("g", { "data-name": "zoom" }, g);
      P.el("circle", { cx: ZX, cy: ZY, r: ZR, fill: "#efe9df" }, zoom);
      const layers = P.el("g", { "data-name": "layers" }, zoom), rings = [];
      for (let i = N - 1; i >= 0; i--) { const r = 20 + (i + 1) * 12.5, e = P.el("g", { opacity: 0 }, layers);
        P.el("circle", { cx: ZX, cy: ZY, r, fill: i % 2 ? "#f4eef0" : "#e7ddea" }, e);
        P.el("circle", { cx: ZX, cy: ZY, r, fill: "none", stroke: i % 3 === 2 ? "#b9cfd0" : "#cdb9c8", "stroke-width": 2.4 }, e);
        if (i === N - 1) { const sh = P.layer(e); sh.stroke(ZX - 90, ZY - 70, ZX - 30, ZY - 112, 10, "#ffffff", 0.7, -14); sh.done(); }
        rings[i] = e; }
      const grain = P.el("g", { "data-name": "grain" }, zoom), gd = blob(ZX, ZY, 13, 10, 0.18, 9, 1.3);
      P.el("path", { d: gd, fill: "#9a7a52", stroke: P.INK, "stroke-width": 2.2 }, grain);
      P.el("circle", { cx: ZX, cy: ZY, r: ZR, fill: "none", stroke: "#7a5532", "stroke-width": 10 }, zoom);
      P.el("circle", { cx: ZX, cy: ZY, r: ZR + 5, fill: "none", stroke: P.INK, "stroke-width": 2.4 }, zoom);
      const st = { grow: ISO.clamp(+o.grow || 0, 0, 1) }; let v = st.grow;
      const draw = () => {
        for (let i = 0; i < N; i++) rings[i].setAttribute("opacity", ISO.clamp(v * N - i, 0, 1).toFixed(2));
        const s = 0.18 + 0.82 * v;
        pg.setAttribute("transform", `translate(${PX} ${PY}) scale(${s.toFixed(3)})`);
      };
      draw();
      g.set = (q) => { if (q.grow !== undefined) st.grow = ISO.clamp(+q.grow || 0, 0, 1); };
      g.update = (dt) => { const was = v; v = ISO.still() ? st.grow : ISO.follow(v, st.grow, dt, 0.6); if (Math.abs(v - st.grow) < 0.002) v = st.grow; if (v !== was) draw(); return v !== st.grow; };
      g.readout = () => (st.grow > 0 ? `pearl: layers laid around the grain, ${Math.round(st.grow * 100)}% grown` : "a tiny grain inside the oyster");
      return g;
    },
  });
})();
