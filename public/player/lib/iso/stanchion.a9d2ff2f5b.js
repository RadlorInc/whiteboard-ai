// "stanchion cx cy k pull=0..1 reach=50..300 c=red|blue|black lab=0 lit=base|post|head|belt" — a PART (batch 6, money):
// a queue post with a retractable belt, standing on the floor, its origin the floor point under its middle. A 30 cm
// weighted round base (a cast dome on a rubber ring), a 6.4 cm chrome post, and at 88–95 cm the belt head: a cassette
// with the belt's exit slot facing +x and a receiving slot on its −x side, under a domed cap. The 5 cm belt runs out
// along +x for pull × reach cm (reach is how far this belt goes, up to 3 m) to its metal end clip; pull 0 = wound in,
// the clip docked at the head. To make a queue line, place the next post so its socket meets this one's end
// (at=<id>.end, with the next post's own ax= −… as needed, or line them up along x). set({ pull }) draws the belt out or
// lets it wind back in. World: 1 = 1 cm. anchors: top end socket
(() => {
  const K = window.K, G = window.G;
  const RB = 15, RP = 3.2, RH = 3.7, Z0 = 88, ZT = 95, BZ0 = 88.6, BZ1 = 93.6, XS = RH;
  const BELT = { red: ["#c8382b", "#e25446", "#7a1a12"], blue: ["#2b5fa8", "#477fca", "#173765"], black: ["#2a2c31", "#45484f", "#0f1012"] };
  const CHROME = ISO.tint("#eef0f3", ["#8e939a", "#a9adb4", "#c3c7cc", "#dadde1"], "#3c4047");
  const CAST = ISO.tint("#5a5e65", ["#2c2f34", "#363a40", "#41454b", "#4c5057"], "#15171a");
  ISO.add({
    name: "stanchion", title: "Queue post (part)", compare: null,
    about: "A queue post: weighted round base, chrome post, and a head with a retractable 5 cm belt that pulls out along +x to its end clip; join posts end to socket to make a bank or shop queue line. anchors: top end socket",
    line: "stanchion cx cy k pull=0..1 reach=50..300 c=red|blue|black lab=0 lit=base|post|head|belt",
    demo: { line: "stanchion 300 470 4 pull=0 reach=120 lab=1", script: [{ set: {}, hold: 1 }, { set: { pull: 1, lit: "belt" }, hold: "settle" }, { set: { pull: 0.4, lit: "head" }, hold: "settle" }, { set: { c: "blue", pull: 0.8, lit: "base" }, hold: "settle" }, { set: { pull: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { pull: B.num(o, "pull", 0, 0, 1), reach: B.num(o, "reach", 200, 50, 300), c: BELT[o.c] ? o.c : "red", lit: o.lit || "" };
      st.want = st.pull;
      const Z = (z) => LAB.Z([0, 0, z]);
      // the base: rubber ring, the cast dome, a chrome collar where the post goes in
      const base = ISO.tinted(ISO.T.rubber, K.solidSvg(G.disc(0, 0.8, RB, Z(0), P), { tone: "lo" })) +
        ISO.tinted(CAST, K.solidSvg(G.solidOf([[0, RB - 0.3], [1.2, RB - 0.5], [2.4, RB - 2.5], [3.4, 9], [3.9, 5.5], [4.1, 4.4]], Z(0.8), P), { tone: "mid" })) +
        ISO.tinted(CHROME, K.solidSvg(G.solidOf([[0, 4.4], [0.6, 4.2], [1.4, 3.6]], Z(4.8), P), { tone: "hi" }));
      const post = ISO.tinted(CHROME, K.solidSvg(G.disc(0, Z0 - 6, RP, Z(6), P), { tone: "mid", inner: K.lineSvg(K.sideArc(0, 0, RP, 6.4, P, 20), { tone: "faint" }) }));
      // the head: cassette body with a seam ring, the exit slot (+x) and the receiving slot (−x, hidden behind), a cap
      const slot = (y0, y1) => `<path d="${K.pathOf([[XS + 0.02, y0, BZ0 - 0.2], [XS + 0.02, y1, BZ0 - 0.2], [XS + 0.02, y1, BZ1 + 0.2], [XS + 0.02, y0, BZ1 + 0.2]].map((p) => K.iso(p, P)), true)}" fill="#16181b" stroke="#0a0b0d" stroke-width="0.5"/>`;
      const head = ISO.tinted(CHROME, K.solidSvg(G.disc(0, ZT - Z0 - 1.2, RH, Z(Z0), P), { tone: "mid", inner: K.lineSvg(K.sideArc(0, 0, RH, Z0 + 0.6, P, 20) + K.sideArc(0, 0, RH, ZT - 1.8, P, 20), { tone: "lo" }) }) +
        K.solidSvg(G.solidOf([[0, RH], [0.5, RH - 0.3], [0.9, RH - 1.2], [1.2, 1.4]], Z(ZT - 1.2), P), { tone: "hi" })) + slot(-0.4, 0.4);
      // the belt and its clip: a 5 cm band from the exit slot to x, the clip a small steel block with a hook tongue
      const beltSvg = (len, c) => {
        const [col, light, ink] = BELT[c], x1 = XS + len, out = [];
        if (len > 0.2) out.push(ISO.tinted(ISO.tint(light, [ink, col, col, light], ink), ISO.wbox(P, [XS, x1], [-0.12, 0.12], [BZ0, BZ1], "mid")) +
          `<path data-free d="${K.pathOf([[XS + 0.4, 0.13, BZ0 + 0.35], [x1 - 0.2, 0.13, BZ0 + 0.35]].map((p) => K.iso(p, P)))}M${K.pathOf([[XS + 0.4, 0.13, BZ1 - 0.35], [x1 - 0.2, 0.13, BZ1 - 0.35]].map((p) => K.iso(p, P))).slice(1)}" stroke="${ink}" stroke-width="0.5" stroke-dasharray="1.2 0.9" fill="none"/>`);
        out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x1, x1 + 1.1], [-0.45, 0.45], [BZ0 - 0.3, BZ1 + 0.3], "mid") + ISO.wbox(P, [x1 + 1.1, x1 + 2], [-0.15, 0.15], [BZ0 + 0.7, BZ1 - 0.7], "lo")));
        return out.join("");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RB, y: -RB, w: 2 * RB, d: 2 * RB, r: RB }, 0, 0.02, P)}"/>` +
        `<g data-name="base">${base}</g><g data-name="post">${post}</g><g data-name="head">${head}</g><g data-name="belt" data-part="belt"></g><g data-part="words"></g>`;
      const endOf = () => [+(XS + st.want * st.reach + 2).toFixed(2), 0, (BZ0 + BZ1) / 2];
      g.anchors = { top: [0, 0, ZT], end: endOf(), socket: [-RH, 0, (BZ0 + BZ1) / 2] };
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(K.iso([0, 0, ZT + 4], P), "queue post", "#556", { size: 13 });
      const draw = () => {
        const len = Math.round(st.pull * st.reach * 10) / 10;
        w.rebuild(el.belt, `${len} ${st.c}`, () => beltSvg(len, st.c));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.pull !== undefined) st.want = ISO.clamp(+p.pull, 0, 1);
        if (p.c !== undefined && BELT[p.c]) st.c = p.c;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // pulled out by hand at a steady walk; wound back in by its spring, quicker at first
      g.update = (dt) => {
        st.pull = ISO.follow(st.pull, st.want, dt, st.want < st.pull ? 0.25 : 0.45, ISO.still());
        if (Math.abs(st.pull - st.want) < 0.002) st.pull = st.want;
        draw();
        return st.pull !== st.want;
      };
      g.readout = () => `queue post · belt out ${(st.want * st.reach).toFixed(0)} cm of ${st.reach.toFixed(0)} cm · belt at ${((BZ0 + BZ1) / 2).toFixed(0)} cm high`;
      draw();
      return g;
    },
  });
})();
