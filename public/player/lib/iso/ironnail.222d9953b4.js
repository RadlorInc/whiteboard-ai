// "ironnail cx cy k aim=down|flat lean=0..30 rust=0..1 wl=0..6.6 lab=0 lit=nail|rust" — a PART (PARTS.md, batch 5): a
// 66 mm steel round wire nail (3.5 mm shank, 7.6 mm flat head, a four-facet point), as rust.js draws it in its tubes.
// aim=down: it stands on its point (origin = the point), leaning `lean` degrees toward +x, as it rests in a boiling
// tube; aim=flat: lying along x on a surface (origin = its middle on the surface), resting on its head and point.
// rust 0 → 1 spreads brown hydrated iron(III) oxide over it, worst at `wl` cm up from the point (the waterline, where
// air and water meet). set({ rust }) eases it. Built in mm with the lab helpers; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const LEN = 66, RS = 1.75, RH = 3.8, HT = 1.6;
  const NAIL = [[0, 0.2], [6, RS], [LEN - HT, RS], [LEN - HT, RH], [LEN, RH]];
  const RUST = ["#b5562a", "#c9662e", "#a84a22", "#d9792e"];

  ISO.add({
    name: "ironnail", title: "Iron nail (part)", compare: null,
    about: "A 6.6 cm iron nail standing on its point (as in a boiling tube) or lying flat; rust spreads over it, worst at the waterline. anchors: head",
    line: "ironnail cx cy k aim=down|flat lean=0..30 rust=0..1 wl=0..6.6 lab=0 lit=nail|rust",
    demo: { line: "ironnail 480 420 50 lean=8", script: [{ set: {}, hold: 1 }, { set: { rust: 0.5, lit: "rust" }, hold: "settle" }, { set: { rust: 1, lit: "" }, hold: "settle" }, { set: { lit: "nail" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const flat = o.aim === "flat", kS = G.scaleOf(Pm);
      let ax, o0;
      if (flat) { const th = Math.asin((RH - 0.2) / LEN); ax = [Math.cos(th), 0, Math.sin(th)]; o0 = [-(LEN / 2) * ax[0], 0, 0.2]; }
      else { const le = (ISO.clamp(ISO.num(o, "lean", 0), 0, 30) * Math.PI) / 180; ax = [Math.sin(le), 0, Math.cos(le)]; o0 = [0, 0, 0]; }
      const wl = ISO.clamp(ISO.num(o, "wl", 4.4), 0, 6.6) * 10;
      const st = { r: ISO.clamp(ISO.num(o, "rust", 0), 0, 1) }, want = { r: st.r };
      let lit = o.lit || "";
      const at = (s) => [o0[0] + ax[0] * s, o0[1] + ax[1] * s, o0[2] + ax[2] * s];
      // the head's top: a few grip rings stamped on it (circles on the flat top), the shank's grip marks under the head
      const F = G.frameAlong(o0, ax);
      const head = window.K.lineSvg([G.circleOf(F, LEN + 0.01, RH * 0.55, Pm), G.circleOf(F, LEN + 0.01, RH * 0.25, Pm)].join(""), { tone: "faint" });
      const grip = window.K.lineSvg(G.ribsOf(F, LEN - HT - 6, LEN - HT - 0.6, RS, 10, Pm, { seams: true }), { tone: "lo" });
      // rust: blotches on the near side of the shank, more and bigger near the waterline, growing with rust
      const rustSvg = (f) => {
        if (f < 0.02) return "";
        const spots = [], view = G.viewOf(Pm), face = G.angleToward(F, view);
        for (let i = 0; i < 34; i++) {
          const s = 7 + ((i * 37) % 56) + (i % 3) * 0.4, near = Math.max(0.35, 1 - Math.abs(s - wl) / 16), a = face + (((i * 53) % 9) - 4) * 0.28;
          const p = K.iso(G.pointOf(F, s, RS + 0.05, a), Pm), r = (0.8 + (i % 3) * 0.4) * kS * Math.min(1, f * 1.5 * near + 0.08);
          spots.push(`<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${(r * 0.9).toFixed(2)}" ry="${(r * 1.4).toFixed(2)}" fill="${RUST[i % 4]}" opacity="${Math.min(0.95, f * 1.3 * near).toFixed(2)}"/>`);
        }
        // a brown film over the whole shank once it is well rusted
        return `<g opacity="${(Math.max(0, f - 0.3) * 0.5).toFixed(2)}">${LAB.turned(Pm, at(6), [[0, RS + 0.03], [LEN - HT - 6.3, RS + 0.03]], ["#9c4520", "#c9662e"], "#5a2410", { axis: ax })}</g>` + spots.join("");
      };
      g.innerHTML = `<g data-name="nail">${LAB.turned(Pm, o0, NAIL, ["#6f757c", "#d9dde1"], "#2e3338", { axis: ax })}${grip}${head}</g><g data-name="rust" data-part="rust"></g><g data-part="words"></g>`;
      g.anchors = { head: at(LEN).map((v) => +(v / 10).toFixed(3)) };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.r * 40) / 40;
        w.rebuild(el.rust, String(q), () => rustSvg(q));
        if (lab) w.rebuild(el.words, q > 0.3 ? "r" : "n", () => LAB.word(Pm, lab, at(LEN + 8), "iron nail", "#556") + (q > 0.3 ? LAB.word(Pm, lab, at(wl), "rust", "#a84a22", { anchor: "start", dy: 0 }).replace('x="', 'dx="10" x="') : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.rust !== undefined && Number.isFinite(+p.rust)) want.r = ISO.clamp(+p.rust, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.r = ISO.follow(st.r, want.r, dt, 0.6, ISO.still()); draw(); return st.r !== want.r; };
      g.readout = () => `iron nail 66 × 3.5 mm · ${st.r < 0.05 ? "shiny" : st.r < 0.4 ? "first brown rust spots" : "rusting, worst at the waterline"} (iron + oxygen + water → hydrated iron(III) oxide)`;
      draw();
      return g;
    },
  });
})();
