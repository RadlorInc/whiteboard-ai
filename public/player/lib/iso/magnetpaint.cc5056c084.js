// "magnetpaint cx cy k kind=bar|horseshoe|clasp lines=0|1 spin=-180..180 close=0..1" — a painted magnet. bar and
// horseshoe lie on a pale card with field lines painted from N to S; spin turns the magnet and its lines. clasp is a
// magnetic snap on two cloth tabs: close=0 apart with the field between them, close=1 snapped shut.
(() => {
  const free = { class: "free", "data-free": "1" }, RED = "#b8433b", BLUE = "#2f5f93";
  const rect = (x0, y0, x1, y1) => `M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} L${x0} ${y1} Z`;
  // field lines leaving N at (nx,ny) and arriving at S: loops above and below between two pole points
  const loops = (ax, bx, y, n, up) => { let d = ""; for (let i = 1; i <= n; i++) { const h = 30 + i * 34, s = up ? -1 : 1, spread = 10 + i * 22; d += `M${ax} ${y + s * 6}C${ax - spread} ${y + s * h} ${bx + spread} ${y + s * h} ${bx} ${y + s * 6}`; } return d; };
  ISO.add({
    name: "magnetpaint", title: "Magnet", compare: null,
    about: "A painted magnet. kind=bar or horseshoe lies on a pale card, red north and blue south, with field lines from N to S (lines=1); spin turns it. kind=clasp is a magnetic snap on two cloth tabs, as on a bag or a coat: close=0 apart with the pull between them, close=1 snapped shut. Parts: magnet north south field.",
    line: "magnetpaint cx cy k=0.2..1.5 kind=bar|horseshoe|clasp lines=0|1 spin=-180..180 close=0..1",
    demo: { line: "magnetpaint 480 270 0.8 kind=clasp close=0", script: [{ set: {}, hold: 1 }, { set: { close: 1 }, hold: "settle" }, { set: { close: 0 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, kind = ["bar", "horseshoe", "clasp"].includes(o.kind) ? o.kind : "bar"; P.seed(31);
      const g = P.base(parent, cx, cy, k), fill = (par, d, box, col, f = "polyester") => P.brush(f, par, P.clip(par, d), box, col);
      const showLines = !(o.lines === "0" || o.lines === 0);
      const field = (par, d, op) => { const f = P.el("g", { "data-name": "field", opacity: showLines ? op : 0 }, par);
        P.el("path", { d, fill: "none", stroke: "#8a7d6a", "stroke-width": 9, opacity: 0.35, "stroke-linecap": "round", ...free }, f);
        P.el("path", { d, fill: "none", stroke: "#4c4438", "stroke-width": 2.4, "stroke-dasharray": "3 9", "stroke-linecap": "round", ...free }, f); return f; };
      const st = { spin: ISO.clamp(+o.spin || 0, -180, 180), close: ISO.clamp(+o.close || 0, 0, 1) }, now = { ...st };
      let paint;
      if (kind !== "clasp") {
        const card = rect(-330, -250, 330, 250), sh = P.layer(g); sh.stroke(-320, 258, 340, 258, 16, "#5b4a36", 0.15); sh.done();
        fill(g, card, [-330, 330, -250, 250], "#f3efe4", "cotton"); P.ink(card, g, 3.4);
        const mag = P.el("g", {}, g), body = P.el("g", { "data-name": "magnet" }, mag);
        if (kind === "bar") {
          field(mag, loops(-150, 150, -34, 4, true) + loops(-150, 150, 34, 4, false) + "M-150 0L-320 0M150 0L320 0", 1);
          const N = rect(-150, -34, 0, 34), S = rect(0, -34, 150, 34);
          fill(body, N, [-150, 0, -34, 34], RED); fill(body, S, [0, 150, -34, 34], BLUE);
          const hl = P.layer(body); hl.stroke(-140, -22, 140, -22, 9, "#ffffff", 0.3); hl.done(); P.ink(N + S, body, 3.4);
          body.insertAdjacentHTML("beforeend", ISO.word([-75, 12], "N", "#fff", { size: 34, halo: false }) + ISO.word([75, 12], "S", "#fff", { size: 34, halo: false }));
        } else {
          field(mag, "M-110 140C-100 200 100 200 110 140M-110 140C-150 225 150 225 110 140M-110 140C-200 245 200 245 110 140M-74 140L74 140", 1);
          const U = "M-150 140 L-150 -40 Q-150 -190 0 -190 Q150 -190 150 -40 L150 140 L76 140 L76 -40 Q76 -116 0 -116 Q-76 -116 -76 -40 L-76 140 Z";
          fill(body, U, [-150, 150, -190, 140], "#9a9ea4"); fill(body, rect(-150, 70, -76, 140), [-150, -76, 70, 140], RED); fill(body, rect(76, 70, 150, 140), [76, 150, 70, 140], BLUE);
          const hl = P.layer(body); hl.stroke(-130, 60, -130, -60, 10, "#ffffff", 0.35, -8); hl.done(); P.ink(U + "M-150 70L-76 70M76 70L150 70", body, 3.4);
          body.insertAdjacentHTML("beforeend", ISO.word([-113, 120], "N", "#fff", { size: 30, halo: false }) + ISO.word([113, 120], "S", "#fff", { size: 30, halo: false }));
        }
        paint = () => mag.setAttribute("transform", `rotate(${now.spin.toFixed(1)})`);
      } else {
        // two cloth tabs, each with a round snap; the right one slides in and the gap closes
        const tab = (s) => { const t2 = P.el("g", {}, g), d = s < 0 ? "M-240 -110 L-60 -110 Q-30 -110 -30 -80 L-30 80 Q-30 110 -60 110 L-240 110 Z" : "M240 -110 L60 -110 Q30 -110 30 -80 L30 80 Q30 110 60 110 L240 110 Z";
          fill(t2, d, s < 0 ? [-240, -30, -110, 110] : [30, 240, -110, 110], "#4a1f5c", "velvet");
          P.el("path", { d: s < 0 ? "M-240 -88 L-62 -88 Q-52 -88 -52 -78 L-52 78 Q-52 88 -62 88 L-240 88" : "M240 -88 L62 -88 Q52 -88 52 -78 L52 78 Q52 88 62 88 L240 88", fill: "none", stroke: "#e0cc9e", "stroke-width": 4, "stroke-dasharray": "13 9", ...free }, t2);
          P.ink(d, t2, 3.8); return t2; };
        const left = tab(-1), gapF = P.el("g", {}, g), right = P.el("g", {}, g); right.appendChild(tab(1));
        const fl = field(gapF, "M-24 -40C0 -60 0 -60 24 -40M-24 -16L24 -16M-24 16L24 16M-24 40C0 60 0 60 24 40", 1);
        const snap = (par, s, col, nm) => { const g2 = P.el("g", { "data-name": nm }, par), d = s < 0 ? "M-40 -58 L0 -58 L0 58 L-40 58 Z" : "M0 -58 L40 -58 L40 58 L0 58 Z", f = s < 0 ? rect(-12, -58, 0, 58) : rect(0, -58, 12, 58);
          fill(g2, d, s < 0 ? [-40, 0, -58, 58] : [0, 40, -58, 58], "#b9bdc2"); fill(g2, f, s < 0 ? [-12, 0, -58, 58] : [0, 12, -58, 58], col);
          const l = P.layer(g2); l.stroke(s * 30, -46, s * 30, 46, 6, "#ffffff", 0.45); l.done(); P.ink(d + f, g2, 3.2); };
        snap(left, -1, RED, "north"); snap(right, 1, BLUE, "south");
        paint = () => { const gap = (1 - now.close) * 110; right.setAttribute("transform", `translate(${(gap / 2).toFixed(1)} 0)`); left.setAttribute("transform", `translate(${(-gap / 2).toFixed(1)} 0)`);
          gapF.setAttribute("transform", `scale(${Math.max(gap / 48, 0.01).toFixed(3)} 1)`); fl.setAttribute("opacity", showLines ? ISO.clamp((gap - 8) / 40, 0, 1).toFixed(3) : 0); };
      }
      paint();
      g.set = (p) => { if (p.spin !== undefined) st.spin = ISO.clamp(+p.spin || 0, -180, 180); if (p.close !== undefined) st.close = ISO.clamp(+p.close || 0, 0, 1); };
      g.update = (dt) => { let on = false; for (const q in st) { now[q] = ISO.still() ? st[q] : ISO.follow(now[q], st[q], dt, q === "close" ? 0.25 : 0.5); if (Math.abs(now[q] - st[q]) < 0.003) now[q] = st[q]; else on = true; } paint(); return on; };
      g.readout = () => (kind === "clasp" ? (st.close > 0.5 ? "clasp snapped shut" : "clasp open: the two magnets pull toward each other") : `${kind} magnet turned ${Math.round(st.spin)}°`);
      return g;
    },
  });
})();
