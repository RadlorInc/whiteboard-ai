// "digithermo cx cy k t=-50..300 to=<id>.<anchor> dx= dy= dz= lab=0 lit=case|display|probe|tape" — a PART (PARTS.md):
// a pocket digital thermometer standing on the bench, origin the bench point under its middle. The case is 8 × 2 × 4 cm
// (x × y × z), its LCD on the +y face reading t °C to 0.1 (eased), three buttons under it, rubber feet, and the probe
// lead leaving a socket on the +x end. The lead ends in a steel probe taped (an amber patch) to whatever it measures:
// the player turns to=<id>.<anchor> (a mug's `side`) into tox= toy=, the end is the world point there at height dz;
// without it, dx dy dz (cm) from the origin. Reused from heatengine.js (its thermometer), in mm; anchors in cm.
// set({ t }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 40, HY = 10, HZ = 40, SOCK = [HX + 6, 0, 30];
  const CASE = ISO.tint("#e9edf1", ["#9aa3ad", "#b0b8c1", "#c4cbd2", "#d6dce1"], "#3d454f");
  const unit = (v) => { const l = Math.hypot(...v); return l > 1e-9 ? v.map((x) => x / l) : [1, 0, 0]; };

  ISO.add({
    name: "digithermo", title: "Digital thermometer (part)", compare: null,
    about: "A pocket digital thermometer (8 × 2 × 4 cm) whose LCD reads t °C; its probe lead runs to to=<id>.<anchor> (a mug's side, or dx dy dz cm), the steel probe held on with a patch of tape. anchors: probe",
    line: "digithermo cx cy k t=-50..300 to=<id>.<anchor> dx=-100..100 dy=-100..100 dz=0..100 lab=0 lit=case|display|probe|tape",
    demo: { line: "digithermo 440 380 34 t=21.5 dx=-8 dy=-3 dz=5", script: [{ set: {}, hold: 1 }, { set: { t: 80, lit: "display" }, hold: "settle" }, { set: { lit: "probe" }, hold: 1.2 }, { set: { t: 6, lit: "tape" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(v, -100, 100);
      const st = { t: ISO.clamp(ISO.num(o, "t", 21), -50, 300), lit: o.lit || "" }, want = { t: st.t };
      const endCm = B17.fin(o.tox) && B17.fin(o.toy) ? ISO.unproject(P, [+o.tox, +o.toy], lim(ISO.num(o, "dz", 5))) : [lim(ISO.num(o, "dx", -8)), lim(ISO.num(o, "dy", -3)), lim(ISO.num(o, "dz", 5))];
      const E = endCm.map((v) => v * 10), w = ISO.writer();
      const fy = HY + 0.05, onFace = (x, z) => K.iso([x, fy, z], Pm), quad = (x0, x1, z0, z1, y = fy) => K.pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map((p) => K.iso(p, Pm)), true);
      // the case: a rounded slab on two rubber feet, a seam round its middle, the socket on the +x end
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 4 }, 0, 2, Pm)}"/>`, `<g data-name="case">`];
      out.push(ISO.tinted(ISO.T.rubber, [-28, 28].map((x) => ISO.wbox(Pm, [x - 7, x + 7], [-HY + 2, HY - 2], [0, 2], "lo")).join("")));
      out.push(ISO.tinted(CASE, S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 5 }, 2, HZ - 2, Pm, 6, 1.5), { tone: "mid", inner: K.lineSvg(K.planOutline({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 5 }, 21, Pm, 6), { tone: "faint" }) })));
      out.push(ISO.tinted(ISO.T.plastic, S(G.disc(HX - 0.5, HX + 6, 3.4, G.frameOf([0, 0, SOCK[2]], [1, 0, 0], [0, 1, 0], [0, 0, 1]), Pm, { steps: 16 }), { tone: "mid" })));
      // the face: a dark bezel, the LCD window, three buttons with their names, the maker's line
      out.push(`<path d="${quad(-34, 34, 15, 36)}" fill="#2b3036" stroke="#121417" stroke-width="0.6"/>`);
      out.push(`</g><g data-name="display"><path d="${quad(-31, 31, 18, 33)}" fill="#c9d8b4" stroke="#55624a" stroke-width="0.5"/><g data-part="digits"></g></g><g data-name="case">`);
      const btn = [["ON", -22], ["°C/°F", 0], ["HOLD", 22]];
      out.push(ISO.tinted(ISO.T.plastic, btn.map(([, x]) => ISO.wbox(Pm, [x - 7, x + 7], [HY, HY + 1.4], [5, 10], "mid")).join("")));
      out.push(btn.map(([n, x]) => LAB.faceText(Pm, [x, fy, 11.3], [1, 0, 0], n, 2.4, "#3d454f")).join(""));
      out.push(LAB.faceText(Pm, [-24, fy, 37.2], [1, 0, 0], "THERMO", 2.4, "#6a737c"), LAB.faceText(Pm, [22, fy, 37.2], [1, 0, 0], "−50…300 °C", 2.2, "#6a737c"), `</g>`);
      // the lead: out of the socket, down to the bench in a soft loop, up to the probe; the probe's last 25 mm is steel
      const a = unit([E[0] - SOCK[0], E[1] - SOCK[1], 0]), tip0 = [E[0] - a[0] * 25, E[1] - a[1] * 25, E[2]];
      const lowZ = Math.max(1.5, Math.min(SOCK[2], E[2]) - 22), mid = [(SOCK[0] + tip0[0]) / 2, (SOCK[1] + tip0[1]) / 2, lowZ];
      const lead = LAB.bend([SOCK, [SOCK[0] + 10, SOCK[1], SOCK[2] - 4], mid, [tip0[0] - a[0] * 14, tip0[1] - a[1] * 14, tip0[2] - 6], tip0], 10).map((p) => K.iso(p, Pm));
      const lw = Math.max(1, K.screenRise(1, Pm) * 2.4), ld = K.pathOf(lead);
      out.push(`<g data-name="probe"><path d="${ld}" fill="none" stroke="#121417" stroke-width="${(lw + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${ld}" fill="none" stroke="#3a3e44" stroke-width="${lw.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
      const Fp = G.frameOf(tip0, a, [-a[1], a[0], 0], [0, 0, 1]);
      out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-6, 3, 2.6, Fp, Pm, { steps: 14 }), { tone: "mid" })), ISO.tinted(ISO.T.steel, S(G.lathe([[3, 0], [3, 1.6], [23, 1.6], [25, 1, 1], [25, 0]], Fp, Pm, { steps: 14 }), { tone: "hi" })), `</g>`);
      // the tape: a thin amber patch square to the probe over its tip, as stuck on a wall
      const u = [-a[1], a[0], 0];
      out.push(`<g data-name="tape">${ISO.tinted(ISO.T.amber, ISO.box((p, q, r) => [E[0] - a[0] * (r + 1) + u[0] * p, E[1] - a[1] * (r + 1) + u[1] * p, E[2] + q], Pm, [-8, 8], [-10, 10], [-0.6, 0], "mid"))}</g>`);
      out.push(`<g data-part="words"></g>`);
      // a probe behind the case (−y) runs behind it: paint the lead and the tape first
      if (E[1] < 0) { const i = out.findIndex((s) => s.startsWith(`<g data-name="probe"`)); out.splice(1, 0, ...out.splice(i, out.length - 1 - i)); }
      g.innerHTML = out.join("");
      g.anchors = { probe: endCm.map((v) => +v.toFixed(3)) };
      const el = LAB.parts(g);
      const draw = () => {
        const tq = Math.round(st.t * 10) / 10;
        w.rebuild(el.digits, String(tq), () => LAB.faceText(Pm, [4, fy + 0.05, 21.6], [1, 0, 0], tq.toFixed(1), 10.5, "#1d2418") + LAB.faceText(Pm, [25, fy + 0.05, 27], [1, 0, 0], "°C", 4.2, "#1d2418"));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(K.iso([0, 0, HZ + 16], Pm), "digital thermometer", "#445", { size: 13 }));
        B17.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.t !== undefined && Number.isFinite(+p.t)) want.t = ISO.clamp(+p.t, -50, 300);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.t = ISO.follow(st.t, want.t, dt, 0.7, ISO.still());
        if (Math.abs(st.t - want.t) < 0.05) st.t = want.t;
        draw();
        return st.t !== want.t;
      };
      g.readout = () => `digital thermometer reads ${st.t.toFixed(1)} °C at its probe`;
      draw();
      return g;
    },
  });
})();
