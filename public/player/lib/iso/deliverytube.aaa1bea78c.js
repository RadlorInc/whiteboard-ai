// "deliverytube cx cy k to=<id>.<anchor> dx= dy= dz= bubbles=0|1 lab=0 lit=tube|bung" — a PART (PARTS.md, batch 4): a
// glass delivery tube (6 mm across, 4 mm bore) through a one-holed rubber bung, its origin the bung's top, placed
// at= a flask's `neck`. The bung (a tapered No. 25 stopper, 24 mm tall) sits in the neck, its lower part seen through
// the glass; the tube starts 1.6 cm below it inside the flask, rises 6 cm, bends over, runs across, bends down and
// turns into its end with every corner bent smooth (a heated glass bend). The end: the player turns to=<id>.<anchor>
// into tox= toy= (that anchor's board point in this part's own frame) and dz (cm, the height of that anchor over this
// part's origin), as for wirelead; without them dx dy dz (cm) from the origin. The tube rises to at least 3 cm over the
// end, so it clears a trough's wall. bubbles=1: gas bubbles leave the end and rise. Built in mm; anchors in cm.
// set({ bubbles, dx, dy, dz, tox, toy }).
(() => {
  const K = window.K, G = window.G;
  const R = 3, BUNG = 24, BT = 16.8, BB = 14.6, IN = 16, UP = 60, NB = 6;
  // the rubber inside the neck, seen through the glass: paler, as the glass and its film of light lie over it
  const SEEN = ISO.tint("#8a8c92", ["#5e6066", "#686a70", "#73757b", "#7d7f85"], "#3a3b40");
  const unit = (v) => { const l = Math.hypot(...v); return l > 1e-9 ? v.map((x) => x / l) : null; };

  ISO.add({
    name: "deliverytube", title: "Delivery tube and bung (part)", compare: null,
    about: "A bent glass delivery tube through a rubber bung that sits in a flask's neck: up 6 cm, over and down to its end at to=<id>.<anchor> (or dx dy dz cm), carrying a gas; bubbles=1 sends gas bubbles out of the end. anchors: end",
    line: "deliverytube cx cy k to=<id>.<anchor> dx= dy= dz= bubbles=0|1 lab=0 lit=tube|bung",
    demo: { line: "deliverytube 290 250 19 dx=24 dy=-2 dz=-8 lab=1", script: [{ set: {}, hold: 1 }, { set: { bubbles: 1, lit: "tube" }, hold: 2.5 }, { set: { lit: "bung" }, hold: 1.4 }, { set: { bubbles: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(v, -300, 300), fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
      const st = { bub: ISO.num(o, "bubbles", 0) >= 0.5 ? 1 : 0, lit: o.lit || "", dx: lim(ISO.num(o, "dx", 20)), dy: lim(ISO.num(o, "dy", 0)), dz: lim(ISO.num(o, "dz", -6)), tox: o.tox, toy: o.toy };
      const s = { amt: st.bub, ph: 0 }, w = ISO.writer();
      let E = [0, 0, 0], Em = [0, 0, 0], bubbles = [];
      const endOf = () => (fin(st.tox) && fin(st.toy) ? ISO.unproject(P, [+st.tox, +st.toy], st.dz) : [st.dx, st.dy, st.dz]).map((v) => lim(v));
      // the bung: a tapered rubber plug, its lower part inside the neck (seen through the glass), the hole in its top
      const Fb = LAB.Z([0, 0, -BUNG]), rAt = (z) => BB + ((BT - BB) * (z + BUNG)) / BUNG;
      const plug = (z0, z1, tint = ISO.T.rubber) => ISO.tinted(tint, LAB.S(G.solidOf([[z0 + BUNG, rAt(z0)], [z1 + BUNG, rAt(z1)]], Fb, Pm), { tone: "hi" }));
      const bungSvg = plug(-BUNG, -7, SEEN) + plug(-7, 0) +
        `<path d="${G.circleOf(LAB.Z([0, 0, 0]), 0.05, BT - 2.2, Pm)}" fill="none" stroke="#121214" stroke-width="0.6" opacity=".5"/><path d="${G.circleOf(LAB.Z([0, 0, 0]), 0.06, R + 0.4, Pm)}" fill="#1b1c1f"/>`;
      const build = () => {
        E = endOf(); Em = E.map((v) => v * 10);
        const flat = Math.hypot(Em[0], Em[1]), h = unit([Em[0], Em[1], 0]) || [1, 0, 0], lead = Math.min(30, flat * 0.35);
        const top = Math.max(UP, Em[2] + 30), Q = [Em[0] - h[0] * lead, Em[1] - h[1] * lead];
        const route = [[0, 0, -1], [0, 0, top], [Q[0], Q[1], top], [Q[0], Q[1], Em[2]], Em];
        const bend = Math.max(2, Math.min(12, lead * 0.45, (top - Em[2]) * 0.3, flat * 0.2));
        const pts = G.fillet(route.filter((p, i) => !i || Math.hypot(...p.map((v, j) => v - route[i - 1][j])) > 0.5), bend, 7);
        // the end: a fire-polished rim square to the last run
        const last = unit(Em.map((v, i) => v - pts[pts.length - 2][i])) || [1, 0, 0];
        const rim = `<path d="${G.circleOf(LAB.A(Em, last), 0, R, Pm)}" fill="#e8f2f8" stroke="${LAB.GLASS}" stroke-width="0.9"/><path d="${G.circleOf(LAB.A(Em, last), 0.05, R - 1, Pm)}" fill="#cfe0ec"/>`;
        const shine = `<path d="${K.pathOf(pts.map((p) => K.iso([p[0] - 0.9, p[1] + 0.9, p[2] + 0.9], Pm)))}" fill="none" stroke="#ffffff" stroke-width="${Math.max(0.5, G.scaleOf(Pm) * 0.7).toFixed(2)}" opacity=".75"/>`;
        g.innerHTML = `<g data-name="tube">${LAB.tube(Pm, [[0, 0, -BUNG - IN], [0, 0, -BUNG + 2]], R, { inner: "#ffffff" })}</g><g data-name="bung">${bungSvg}</g>` +
          `<g data-name="tube">${LAB.tube(Pm, pts, R, { inner: "#ffffff" })}${shine}${rim}</g><g data-part="bubbles">${Array.from({ length: NB }, () => `<circle r="1" fill="#ffffff" fill-opacity=".6" stroke="#4d7590" stroke-width="0.6" opacity="0"/>`).join("")}</g><g data-part="words"></g>`;
        bubbles = [...g.querySelectorAll('[data-part="bubbles"] circle')];
        if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [Q[0] / 2, Q[1] / 2, top + 8], "delivery tube", "#556") + LAB.word(Pm, lab, [BT + 4, 0, -8], "bung", "#556", { anchor: "start" });
        g.anchors = { end: E };
        move();
        LAB.light(w, g, st.lit);
      };
      // the bubbles: each leaves the end, grows a little, wobbles up about 1.5 cm and is gone (into a shelf, a jar or the air)
      const move = () => {
        const sc = G.scaleOf(Pm);
        bubbles.forEach((c, i) => {
          const ph = (s.ph * 0.9 + i / NB) % 1, p = K.iso([Em[0] + Math.sin(ph * 9 + i) * 1.6, Em[1] + Math.cos(i * 1.7) * 1.2, Em[2] + R + ph * 14], Pm);
          w.attr(c, "cx", p[0].toFixed(1)); w.attr(c, "cy", p[1].toFixed(1)); w.attr(c, "r", Math.max(0.6, sc * (1.4 + ph * 1.4)).toFixed(2));
          w.attr(c, "opacity", (s.amt * Math.min(1, ph * 6) * (1 - ph * ph)).toFixed(2));
        });
      };
      g.set = (p) => {
        let again = false;
        for (const key of ["dx", "dy", "dz"]) if (p[key] !== undefined && fin(p[key])) { st[key] = lim(+p[key]); again = true; }
        for (const key of ["tox", "toy"]) if (p[key] !== undefined && fin(p[key])) { st[key] = +p[key]; again = true; }
        if (p.bubbles !== undefined) st.bub = +p.bubbles >= 0.5 ? 1 : 0;
        if (p.lit !== undefined) st.lit = p.lit;
        if (again) build();
        LAB.light(w, g, st.lit);
      };
      g.update = (dt) => {
        const calm = ISO.still(), target = calm ? 0 : st.bub;
        s.amt = ISO.follow(s.amt, target, dt, 0.35, calm); if (Math.abs(s.amt - target) < 0.004) s.amt = target;
        if (!calm) s.ph += dt;
        move();
        return s.amt !== target;
      };
      g.readout = () => `glass delivery tube through a rubber bung · end ${Math.round(Math.hypot(E[0], E[1]))} cm across and ${Math.abs(E[2]).toFixed(0)} cm ${E[2] < 0 ? "lower" : "higher"}${st.bub ? " · gas bubbling out of the end" : ""}`;
      build();
      return g;
    },
  });
})();
