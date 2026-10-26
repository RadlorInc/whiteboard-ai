// "mug cx cy k t=0..100 lab=0 lit=mug|handle|water" — a PART (PARTS.md): a glazed ceramic mug of water standing on the
// bench, origin the bench point under its middle. 9 cm across the rim, 10 cm tall, 4.5 mm walls, a thick foot ring and
// a loop handle toward +x; the water stands 1.5 cm under the rim. t = the water's temperature (°C), eased: above 45 °C
// steam wisps rise off it, below 12 °C beads of condensation sit on the outside (the heat engine's fridge mode cools it
// to about 6 °C). Reused from heatengine.js (its mug), in mm (ISO.mm); anchors in cm. set({ t }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const H = 100, RB = 40, RT = 45, WALL = 4.5, ZW = H - 15, FLOOR = 10;
  const rOut = (z) => RB + ((RT - RB) * z) / H, rIn = (z) => rOut(z) - WALL;
  // the handle's centre line: half an ellipse out from the wall, its roots at 22 and 82 mm
  const HANDLE = Array.from({ length: 25 }, (_, i) => { const a = ((80 - (160 * i) / 24) * Math.PI) / 180; return [RT - 4 + 26 * Math.cos(a), 0, 52 + 30 * Math.sin(a)]; });

  ISO.add({
    name: "mug", title: "Mug of water (part)", compare: null,
    about: "A glazed ceramic mug (9 cm × 10 cm) with a loop handle, holding water at t °C: steam wisps when hot, beads of condensation when cooled below 12 °C; the heat engine stands on its rim. anchors: rim water side",
    line: "mug cx cy k t=0..100 lab=0 lit=mug|handle|water",
    demo: { line: "mug 480 400 30 t=80", script: [{ set: {}, hold: 2 }, { set: { lit: "handle" }, hold: 1.2 }, { set: { t: 6, lit: "water" }, hold: 5 }, { set: { t: 60, lit: "" }, hold: 5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { t: ISO.clamp(ISO.num(o, "t", 60), 0, 100), lit: o.lit || "", ph: 0 }, want = { t: st.t };
      const F = LAB.Z([0, 0, 0]), face = G.angleToward(F, G.viewOf(Pm)), w = ISO.writer(), clip = B17.id("mugw");
      const ring = (z, r, n = 64) => Array.from({ length: n }, (_, i) => K.iso([Math.cos((i / n) * 2 * Math.PI) * r, Math.sin((i / n) * 2 * Math.PI) * r, z], Pm));
      // the body: foot ring, wall flaring up to a rounded rim, the inner wall back down to a thick floor
      const body = ISO.tinted(ISO.T.paint, S(G.lathe([[0, RB - 4], [0, RB - 1], [2, RB, 1], [6, rOut(6)], [H - 1.5, RT, 1], [H, RT - 1.2, 1], [H, 0]], F, Pm, { steps: 64 }), { tone: "hi", inner: L(G.arcOf(F, 6, rOut(6) + 0.1, Pm), { tone: "faint" }) }));
      // the handle: a round-section loop, its two roots pressed into the wall
      const hp = K.pathOf(HANDLE.map((p) => K.iso(p, Pm))), hw = K.screenRise(1, Pm) * 9;
      const handle = `<path d="${hp}" fill="none" stroke="#33506f" stroke-width="${(hw + 1.4).toFixed(1)}" stroke-linecap="round"/><path d="${hp}" fill="none" stroke="#c6d5e5" stroke-width="${hw.toFixed(1)}" stroke-linecap="round"/><path d="${hp}" fill="none" stroke="#eef4fa" stroke-width="${(hw * 0.35).toFixed(1)}" stroke-linecap="round" transform="translate(-0.5 -0.8)"/>` +
        [HANDLE[0], HANDLE[24]].map((p) => ISO.tinted(ISO.T.paint, S(G.disc(0, 3, 5.5, G.frameOf([p[0] - 1, 0, p[2]], [1, 0, 0], [0, 1, 0], [0, 0, 1]), Pm, { steps: 16 }), { tone: "mid" }))).join("");
      // the water: its surface seen through the rim's opening (clipped to it), a meniscus line and a soft highlight
      const water = () => {
        const surf = K.pathOf(ring(ZW, rIn(ZW)), true);
        return `<path d="${K.pathOf(ring(H, rIn(H)), true)}" fill="#b3c5d9" stroke="#33506f" stroke-width="0.7"/><path d="${surf}" fill="#cfe6f5" stroke="#6f9cc0" stroke-width="0.8" clip-path="url(#${clip})"/>` +
          `<path d="${K.pathOf(ring(ZW, rIn(ZW) * 0.55, 32).slice(4, 12))}" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity=".8" clip-path="url(#${clip})"/>`;
      };
      const steam = (amt, ph) => {
        if (amt <= 0) return "";
        const out = [];
        for (let i = 0; i < 3; i++) {
          const x0 = (i - 1) * 16, f = (ph + i / 3) % 1, pts = [];
          for (let j = 0; j <= 10; j++) { const z = H + 4 + f * 30 + j * 5; pts.push(K.iso([x0 + Math.sin(j * 0.8 + i * 2 + f * 4) * 5, -8 + i * 6, z], Pm)); }
          out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="#9fb0c0" stroke-width="${(K.screenRise(1, Pm) * 3).toFixed(1)}" stroke-linecap="round" opacity="${(amt * 0.55 * Math.sin(Math.PI * Math.min(1, f + 0.15))).toFixed(2)}"/>`);
        }
        return out.join("");
      };
      const beads = (amt) => {
        if (amt <= 0) return "";
        const pts = [];
        for (let i = 0; i < 26; i++) { const a = face + ((i * 0.618) % 1 - 0.5) * 2.4, z = 14 + ((i * 37) % 70); pts.push(K.iso(G.pointOf(F, z, rOut(z) + 0.4, a), Pm)); }
        const r = (K.screenRise(1, Pm) * 1.5).toFixed(2);
        return `<g opacity="${amt.toFixed(2)}" fill="#f4f9fd" stroke="#7f98b0" stroke-width="0.5">${pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}"/>`).join("")}</g>`;
      };
      g.innerHTML = `<defs><clipPath id="${clip}"><path d="${K.pathOf(ring(H, rIn(H) + 0.3), true)}"/></clipPath></defs>` +
        `<path class="iso-halo" d="${K.haloOf({ x: -RB, y: -RB, w: 2 * RB, d: 2 * RB, r: RB }, 0, 2, Pm)}"/>` +
        `<g data-name="mug">${body}</g><g data-name="water">${water()}</g><g data-part="beads"></g><g data-name="handle">${handle}</g><g data-part="steam"></g><g data-part="words"></g>`;
      g.anchors = { rim: [0, 0, H / 10], water: [0, 0, ZW / 10], side: [0, +(rOut(50) / 10).toFixed(3), 5] };
      const el = LAB.parts(g);
      const draw = () => {
        const hot = ISO.clamp((st.t - 45) / 35, 0, 1), cold = ISO.clamp((12 - st.t) / 6, 0, 1), phq = Math.round(st.ph * 30) / 30;
        w.rebuild(el.steam, hot ? `${hot.toFixed(2)} ${phq}` : "", () => steam(hot, phq));
        w.rebuild(el.beads, cold.toFixed(2), () => beads(cold));
        if (lab) w.rebuild(el.words, String(Math.round(st.t)), () => ISO.word(K.iso([0, 0, H + 44], Pm), `water ${Math.round(st.t)} °C`, st.t > 30 ? "#c0392b" : "#2b6cc4", { size: 14 }));
        B17.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.t !== undefined && Number.isFinite(+p.t)) want.t = ISO.clamp(+p.t, 0, 100);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.t = ISO.follow(st.t, want.t, dt, 0.9, calm);
        if (Math.abs(st.t - want.t) < 0.05) st.t = want.t;
        if (!calm) st.ph = (st.ph + dt * 0.35) % 1;
        draw();
        return st.t !== want.t || (!calm && st.t > 45);
      };
      g.readout = () => `mug of water at ${st.t.toFixed(0)} °C · 9 cm × 10 cm, about ${Math.round((Math.PI * rIn(ZW) ** 2 * (ZW - FLOOR)) / 1000)} mL of water`;
      draw();
      return g;
    },
  });
})();
