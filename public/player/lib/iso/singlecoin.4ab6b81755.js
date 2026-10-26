// "singlecoin cx cy k turn=0..1 metal=bronze|silver|gold value=1|2|5|10 lab=0 lit=coin|face" — a PART (batch 6, money):
// one generic metal coin lying flat on a table, its origin the table point under its middle. 2.4 cm across, 0.2 cm
// thick, a milled (reeded) edge and a raised rim on both faces. One face: the plain value with a small star under it;
// the other: a big star with the value small under it (no faces, no real design). turn rolls it over on its edge
// about the x axis: 0 = value face up, 0.5 = standing on its edge, 1 = star face up (it lifts as it turns, so its edge
// never sinks into the table). set({ turn, metal }). World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K, G = window.G;
  const R = 1.2, H = 0.2, VALUES = ["1", "2", "5", "10"], METALS = ["bronze", "silver", "gold"];
  ISO.add({
    name: "singlecoin", title: "Single coin (part)", compare: null,
    about: "One generic coin, 2.4 cm, milled edge, a plain number on one face and a star on the other (no real design); turn rolls it over on its edge to show the other face. anchors: top",
    line: "singlecoin cx cy k turn=0..1 metal=bronze|silver|gold value=1|2|5|10 lab=0 lit=coin|face",
    demo: { line: "singlecoin 480 330 60 turn=0 metal=gold lab=1", script: [{ set: {}, hold: 1 }, { set: { turn: 0.5, lit: "coin" }, hold: "settle" }, { set: { turn: 1, lit: "face" }, hold: "settle" }, { set: { turn: 0, metal: "silver", lit: "" }, hold: "settle" }, { set: { metal: "bronze", value: 5 }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { turn: B.num(o, "turn", 0, 0, 1), metal: B.pick(o.metal, METALS, "gold"), value: B.pick(o.value, VALUES, "1"), lit: o.lit || "" };
      st.want = st.turn;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R - 0.3, y: -R - 0.3, w: 2 * R + 0.6, d: 2 * R + 0.6, r: R }, 0, 0.02, P)}"/>` +
        `<g data-name="coin" data-part="coin"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H] };
      const el = LAB.parts(g), w = ISO.writer(), view = G.viewOf(P), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const coinSvg = (turn, metal, value) => {
        const th = turn * Math.PI, c = Math.cos(th), s = Math.sin(th);
        const o3 = [0, 0, (H / 2) * Math.abs(c) + R * Math.abs(s)], a = [0, -s, c], v = [0, c, s], u = [1, 0, 0];
        const F = G.frameOf(o3, a, u, v), ink = B.METAL_INK[metal], kS = G.scaleOf(P);
        let out = ISO.tinted(B.METAL[metal], K.solidSvg(G.disc(-H / 2, H / 2, R, F, P), { tone: "mid", inner: K.lineSvg(G.ribsOf(F, -H / 2, H / 2, R, 60, P, { seams: true }), { tone: "faint" }) }));
        // the face toward the camera: value face at +a, star face at −a (seen from its own side, so its x runs −x)
        const up = dot(a, view) >= 0, sg = up ? 1 : -1, fs = (H / 2 + 0.004) * sg;
        if (Math.abs(dot(a, view)) < 0.04 || kS * R < 3) return out;
        const upv = v.map((q) => -q * sg), at = (x, y) => [0, 1, 2].map((i) => o3[i] + a[i] * fs + u[i] * x + upv[i] * y);
        const loop = (r, steps = 40) => K.pathOf(Array.from({ length: steps }, (_, i) => { const q = (i / steps) * Math.PI * 2; return K.iso(at(Math.cos(q) * r, Math.sin(q) * r), P); }), true);
        out += `<g data-name="face"><path d="${loop(R * 0.86)}" fill="none" stroke="${ink}" stroke-width="${Math.max(0.5, kS * 0.03).toFixed(2)}" opacity=".7"/>` +
          `<path d="${loop(R * 0.93, 48)}" fill="none" stroke="${ink}" stroke-width="0.4" opacity=".35"/>`;
        const star = (x, y, r) => { const p = []; for (let i = 0; i < 10; i++) { const q = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; p.push(K.iso(at(x + Math.cos(q) * rr, y + Math.sin(q) * rr), P)); } return `<path d="${K.pathOf(p, true)}" fill="${ink}" opacity=".75"/>`; };
        const txt = (x, y, str, size) => LAB.faceText(P, at(x, y), u, str, size, ink, upv);
        if (kS * R > 9) {
          if (up) out += txt(0, -0.2, value, value.length > 1 ? 0.75 : 0.95) + star(0, -0.62, 0.17);
          else out += star(0, 0.15, 0.55) + txt(0, -0.85, value, 0.32);
        }
        return out + `</g>`;
      };
      const draw = () => {
        const q = Math.round(st.turn * 400) / 400;
        w.rebuild(el.coin, `${q} ${st.metal} ${st.value}`, () => coinSvg(q, st.metal, st.value));
        const side = st.want < 0.25 ? "number side" : st.want > 0.75 ? "star side" : "on its edge";
        if (lab) w.rebuild(el.words, side, () => ISO.word(K.iso([R + 0.3, 0, st.want > 0.25 && st.want < 0.75 ? 1.6 : 0.5], P), side, "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.turn !== undefined) st.want = B.num(p, "turn", st.want, 0, 1);
        if (p.metal !== undefined) st.metal = B.pick(p.metal, METALS, st.metal);
        if (p.value !== undefined) st.value = B.pick(p.value, VALUES, st.value);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.turn = ISO.follow(st.turn, st.want, dt, 0.22, ISO.still());
        if (Math.abs(st.turn - st.want) < 0.002) st.turn = st.want;
        draw();
        return st.turn !== st.want;
      };
      g.readout = () => `coin of ${st.value} · ${st.metal} · ${st.want < 0.25 ? "number side up" : st.want > 0.75 ? "star side up" : "on its edge"}`;
      draw();
      return g;
    },
  });
})();
