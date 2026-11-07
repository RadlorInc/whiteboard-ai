// "lockstitch cx cy k t=0..1 run=0|1" — a sewing machine cut open from the side. The needle takes the blue top thread
// down through the cloth; a loop opens; the turning hook carries it round the bobbin; the needle rises and pulls the
// two threads into a lock inside the cloth; the cloth steps along. t is one turn of that cycle.
(() => {
  const S = 58, BY = 188, CR = 74;
  const smooth = (a, b, x) => { const t = ISO.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  ISO.add({
    name: "lockstitch", title: "Sewing machine stitch", compare: null,
    about: "A sewing machine cut open from the side, showing how a stitch locks two threads: the needle takes the top thread down, the hook carries its loop around the bobbin, the needle pulls the lock up into the cloth, the cloth steps along. t=0 needle up, 0.35 needle down, 0.55 loop around the bobbin, 0.8 stitch locked, 1 cloth moved. run=1 sews.",
    line: "lockstitch cx cy k=0.2..1.5 t=0..1 run=0|1",
    demo: { line: "lockstitch 480 280 0.72 t=0", script: [{ set: { t: 0 }, hold: 1 }, { set: { t: 0.35 }, hold: "settle" }, { set: { t: 0.55 }, hold: "settle" }, { set: { t: 0.8 }, hold: "settle" }, { set: { t: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(53);
      const g = P.base(parent, cx, cy, k), frame = P.el("g", {}, g);
      const free = { class: "free", "data-free": "1" };
      // the cloth, cut through, and the plate under it
      const cl = P.clip(frame, "M-330 -24 H330 V24 H-330 Z");
      P.brush("denim", frame, cl, [-330, 330, -24, 24], P.COLORS.blue, { density: 1.6 });
      P.ink("M-330 -24 H330 M-330 24 H330", frame, 3.2, false);
      const plate = P.layer(frame); plate.stroke(-330, 34, -22, 34, 18, "#a8abb0"); plate.stroke(22, 34, 330, 34, 18, "#a8abb0"); plate.done();
      // the presser foot
      const foot = P.layer(frame); foot.stroke(-96, -36, -12, -36, 20, "#9095a0"); foot.stroke(12, -36, 96, -36, 20, "#9095a0"); foot.stroke(-60, -46, -44, -150, 18, "#777c86"); foot.stroke(60, -46, 44, -150, 18, "#777c86"); foot.done();
      // bobbin case and bobbin
      P.el("circle", { cx: 0, cy: BY, r: CR, fill: "#c9cdd2", stroke: P.INK, "stroke-width": 3.2 }, frame);
      P.el("circle", { cx: 0, cy: BY, r: 40, fill: "#e6d6dc", stroke: P.INK, "stroke-width": 2.6 }, frame);
      const wrap = P.layer(frame); for (let r = 16; r < 38; r += 6) wrap.stroke(-r, BY - r * 0.1, r, BY + r * 0.1, 6, P.COLORS.rose, 0.9, r * 0.7); wrap.done();
      P.el("circle", { cx: 0, cy: BY, r: 11, fill: "#777c86", stroke: P.INK, "stroke-width": 2.4 }, frame);
      const hook = P.el("g", {}, g);
      P.el("path", { d: `M${CR + 8} 0 A${CR + 8} ${CR + 8} 0 1 1 ${(CR + 8) * 0.87} ${-(CR + 8) * 0.5} L${CR + 30} ${-(CR + 8) * 0.72}`, fill: "none", stroke: "#5d626b", "stroke-width": 11, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, hook);
      const line = (c, w) => P.el("path", { fill: "none", stroke: c, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, g);
      const under = line(P.COLORS.rose, 7), done = line(P.COLORS.rose, 7), doneTop = line("#1e7fd0", 7), top = line("#1e7fd0", 7);
      // needle: its bar, shank and eye move together; the thread is redrawn to the eye every frame
      const nd = P.el("g", {}, g), nl = P.layer(nd); nl.stroke(0, -300, 0, -120, 34, "#777c86"); nl.done();
      P.el("path", { d: "M-7 -122 L7 -122 L3 -8 L0 0 L-3 -8 Z", fill: "#d7dade", stroke: P.INK, "stroke-width": 2.6, "stroke-linejoin": "round" }, nd);
      P.el("circle", { cx: 0, cy: -22, r: 3, fill: P.INK }, nd);
      const st = { t: ISO.clamp(+o.t || 0, 0, 1), run: o.run === "1" || o.run === 1 }; let p = st.t, n = 5;
      const draw = () => {
        const ph = p % 1, cos = (1 + Math.cos(ph * 2 * Math.PI * (ph < 0.7 ? 1 / 0.7 : 0))) / 2, tip = ph < 0.7 ? -74 + (1 - cos) * 200 : -74;
        nd.setAttribute("transform", `translate(0 ${tip.toFixed(1)})`);
        hook.setAttribute("transform", `translate(0 ${BY}) rotate(${((ph - 0.37) * 720).toFixed(1)})`);
        const adv = smooth(0.82, 1, ph) * S, eye = tip - 22, loop = smooth(0.36, 0.5, ph) * (1 - smooth(0.58, 0.8, ph));
        const lockY = ph < 0.58 ? null : ph < 0.8 ? (1 - smooth(0.58, 0.8, ph)) * (BY + CR + 16) : 0, x = -adv;
        // sewn stitches, moving with the cloth
        let dT = "", dB = ""; const last = -S - adv;
        for (let i = 0; i < n; i++) { const a = last - i * S; dT += `M${(a - S).toFixed(1)} -27L${a.toFixed(1)} -27`; dB += `M${(a - S).toFixed(1)} 27L${a.toFixed(1)} 27`; dT += `M${a.toFixed(1)} -27L${a.toFixed(1)} 2`; dB += `M${a.toFixed(1)} 27L${a.toFixed(1)} -2`; }
        doneTop.setAttribute("d", dT); done.setAttribute("d", dB);
        // the live stitch: its lock was made at the hole and travels off with the cloth
        const prev = ph >= 0.82 ? x : -S - adv, hole = ph >= 0.82 ? x : 0;
        const bobTop = `M0 ${BY - 40}`;
        let dU, dTop;
        const lastTop = `M${(-S - adv).toFixed(1)} -27`;
        if (lockY === null) {            // the loop has not been caught: the under thread still runs to the last stitch
          dU = `${bobTop}Q-10 90 ${(-8).toFixed(1)} 50 L${(-S - adv).toFixed(1)} 27`;
          const R = 22 + loop * (CR + 24), deep = Math.max(eye, 0) + loop * (BY + CR + 16 - Math.max(eye, 0));
          dTop = loop > 0.01 ? `${lastTop}L0 -27L0 0C${-R} 60 ${-R} ${deep} 0 ${deep}C${R} ${deep} ${R} ${Math.max(eye, 60)} 0 ${eye}` : `${lastTop}L0 -27L0 ${eye}`;
        } else if (ph < 0.82) {          // the needle rises and pulls the lock up to the cloth
          const R = 18 + loop * (CR + 18);
          dU = `${bobTop}L0 ${(lockY + 2).toFixed(1)}`;
          dTop = `${lastTop}L0 -27L0 0C${-R} ${lockY * 0.5} ${-R} ${lockY} 0 ${lockY}C${R} ${lockY} ${R} ${lockY * 0.5} 0 -27L0 ${eye}`;
        } else {                         // locked: the cloth steps along with it
          dU = `${bobTop}L4 26L${hole.toFixed(1)} 27`;
          dTop = `${lastTop}L${hole.toFixed(1)} -27L${hole.toFixed(1)} 2M${hole.toFixed(1)} -27L0 ${eye}`;
        }
        under.setAttribute("d", dU);
        top.setAttribute("d", `${dTop}M0 ${eye}L18 -180L150 -300`);
      };
      draw();
      g.set = (q) => { if (q.t !== undefined) st.t = ISO.clamp(+q.t || 0, 0, 1); if (q.run !== undefined) st.run = q.run === "1" || q.run === 1; };
      g.update = (dt) => {
        if (ISO.still()) { p = st.t; draw(); return false; }
        if (st.run) { p += dt / 2.6; if (p >= 1) p -= 1; draw(); return true; }
        p = ISO.follow(p, st.t, dt, 0.35); if (Math.abs(p - st.t) < 0.002) p = st.t; draw(); return p !== st.t;
      };
      g.readout = () => { const f = p % 1; return f < 0.36 ? "needle going down" : f < 0.58 ? "hook carries the loop round the bobbin" : f < 0.82 ? "needle pulls the lock into the cloth" : "cloth steps along"; };
      return g;
    },
  });
})();
