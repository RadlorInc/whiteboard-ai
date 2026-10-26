// "rubberstamp cx cy k press=0..1 word=paid|received|copy lab=0 lit=stamp|handle|face|pad|print" — a PART (batch 6,
// money): a hand rubber stamp, 6 × 3 cm and 8 cm tall, held just above a desk (or an invoice) with its ink pad tin
// beside it on the −x side. Its origin is the surface point under the middle of the stamp's face, where it prints. A
// red rubber die with the word cut in reverse, on a foam layer and a wooden mount whose top carries the word printed
// the right way round as its index label, a turned wooden handle. The tin: a steel base with a rolled edge, a red
// ink felt, its lid off, upside down behind it. press 0 → 1 brings the stamp down onto the surface and lifts it again; from the
// moment it touches, the word is printed in red ink on the surface, inside its double frame. set({ press }). 1 = 1 cm.
// anchors: print (the printed word's middle) pad (the ink felt's middle) top (the handle's top)
(() => {
  const K = window.K, G = window.G;
  const FX = 2.5, FY = 1.2, LIFT = 2.6, RUB = 0.3, FOAM = 0.25, MOUNT = 1.3, MX = 3, MY = 1.5;
  const WORDS = { paid: "PAID", received: "RECEIVED", copy: "COPY" };
  const RUBBER = ISO.tint("#d9534a", ["#8f2a22", "#a2342b", "#b43e34", "#c5483e"], "#4a120d");
  const WOOD = ISO.tint("#e9c99a", ["#a8773f", "#b9884e", "#c99a5e", "#d9ae74"], "#5a3a18");
  const FOAMT = ISO.tint("#5a5d63", ["#2c2e32", "#36383d", "#404247", "#4a4c51"], "#141518");
  const PX = -8.5, PW = 7, PD = 4.4;
  ISO.add({
    name: "rubberstamp", title: "Rubber stamp (part)", compare: null,
    about: "A wooden-handled rubber stamp with its word cut in reverse on a red rubber die, and its ink pad tin beside it; press brings it down onto the surface and up again, leaving the word printed in red. anchors: print pad top",
    line: "rubberstamp cx cy k press=0..1 word=paid|received|copy lab=0 lit=stamp|handle|face|pad|print",
    demo: { line: "rubberstamp 540 360 34 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "pad" }, hold: 1.2 }, { set: { press: 1, lit: "" }, hold: 3 }, { set: { lit: "print" }, hold: 1.4 }, { set: { lit: "handle" }, hold: 1.2 }, { set: { press: 0, lit: "face" }, hold: 3 }] },
    make([cx = 480, cy = 360, k = 3], o, t, parent) {
      const B = window.B42, S = (p, s) => K.solidSvg(p, s);
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const word = Object.hasOwn(WORDS, o.word) ? WORDS[o.word] : WORDS.paid;
      const st = { press: B.val(o, "press", 0, 0, 1) }; st.want = st.press;
      const h = Math.min(0.95, 4.7 / B.stampW(word));
      // the ink pad tin: base with a rolled rim, the felt, the lid hinged open behind it (toward −y), leaning back
      const tin = ISO.tinted(ISO.T.steel, ISO.wbox(P, [PX - PW / 2, PX + PW / 2], [-PD / 2, PD / 2], [0, 0.9], "mid")) +
        ISO.tinted(ISO.T.red, ISO.wbox(P, [PX - PW / 2 + 0.3, PX + PW / 2 - 0.3], [-PD / 2 + 0.3, PD / 2 - 0.3], [0.9, 1.0], "lo")) +
        B.quad(P, [[PX - PW / 2 + 0.3, -PD / 2 + 0.3, 1.003], [PX + PW / 2 - 0.3, -PD / 2 + 0.3, 1.003], [PX + PW / 2 - 0.3, PD / 2 - 0.3, 1.003], [PX - PW / 2 + 0.3, PD / 2 - 0.3, 1.003]], "#7a1d18", "#4a120d", 0.4) +
        ISO.tinted(ISO.T.steel, ISO.wbox(P, [PX - PW / 2, PX + PW / 2], [-PD * 1.5 - 0.3, -PD / 2 - 0.3], [0, 0.7], "mid")) +
        B.quad(P, [[PX - PW / 2 + 0.2, -PD * 1.5 - 0.1, 0.703], [PX + PW / 2 - 0.2, -PD * 1.5 - 0.1, 0.703], [PX + PW / 2 - 0.2, -PD / 2 - 0.5, 0.703], [PX - PW / 2 + 0.2, -PD / 2 - 0.5, 0.703]], "#b6b9be", "#3c3f45", 0.4);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: PX - PW / 2 - 0.5, y: -PD * 1.5 - 0.8, w: PW + 13, d: PD * 2 + 1.5, r: 0.8 }, 0, 0.5, P)}"/>` +
        `<g data-name="pad">${tin}</g><g data-name="print"><g data-part="print">${B.flat(P, [0, 0, 0.002], [1, 0, 0], [0, 1, 0], B.stampArt(0, 0, h, word))}</g></g>` +
        `<g data-name="stamp"><g data-part="stamp"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      g.anchors = { print: [0, 0, 0], pad: [PX, 0, 1], top: [0, 0, LIFT + RUB + FOAM + MOUNT + 6.3] };
      const label = `<rect x="${-MX + 0.3}" y="${-MY + 0.3}" width="${2 * MX - 0.6}" height="${2 * MY - 0.6}" fill="#f7f3ea" stroke="#8a6a3a" stroke-width="0.04"/>` + B.stampArt(0, MY - 0.62, 0.36, word);
      const stampAt = (z) => {
        const z1 = z + RUB, z2 = z1 + FOAM, z3 = z2 + MOUNT, F = G.frameAlong([0, 0, z3], [0, 0, 1]);
        return `<g data-name="face">${ISO.tinted(RUBBER, ISO.wbox(P, [-FX, FX], [-FY, FY], [z, z1], "mid"))}</g>` +
          ISO.tinted(FOAMT, ISO.wbox(P, [-FX - 0.2, FX + 0.2], [-FY - 0.2, FY + 0.2], [z1, z2], "mid")) +
          ISO.tinted(WOOD, ISO.wbox(P, [-MX, MX], [-MY, MY], [z2, z3], "mid")) + B.flat(P, [0, 0, z3 + 0.003], [1, 0, 0], [0, 1, 0], label) +
          `<g data-name="handle">${ISO.tinted(WOOD, S(G.solidOf([[0, 1.1], [0.4, 0.9, 1], [2.2, 0.62, 1], [3.6, 0.75, 1], [5.0, 1.35, 1], [5.9, 1.2, 1], [6.3, 0]], F, P, { steps: 24 }), { tone: "mid" }))}</g>`;
      };
      // built once at the surface; a lift along z is a flat move on the board
      el.stamp.innerHTML = stampAt(0.001);
      const o0 = K.iso([0, 0, 0], P), o1 = K.iso([0, 0, 1], P), up = [o1[0] - o0[0], o1[1] - o0[1]];
      let lit = o.lit || "";
      const draw = () => {
        const e = st.press, z = LIFT * Math.abs(1 - 2 * B.smooth(0, 1, e));
        w.attr(el.stamp, "transform", `translate(${(up[0] * z).toFixed(2)} ${(up[1] * z).toFixed(2)})`);
        w.shown(el.print, e >= 0.5);
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([MX + 1, 0, LIFT + 8], P), "rubber stamp", "#556", { size: 13, anchor: "start" }) + ISO.word(K.iso([PX, PD / 2 + 1, 0], P), "ink pad", "#556", { size: 13, dy: 16 }));
        B.light(w, g, lit);
      };
      g.set = (p) => { st.want = B.pick(p, "press", st.want, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const was = st.press;
        st.press = ISO.still() || Math.abs(st.want - st.press) < 0.003 ? st.want : st.press + Math.sign(st.want - st.press) * Math.min(Math.abs(st.want - st.press), dt * 0.8);
        if (st.press !== was) draw();
        return st.press !== st.want;
      };
      g.readout = () => `rubber stamp · ${word} · ${st.want >= 0.5 ? "pressed: printed in red" : "held above, not printed yet"}`;
      draw();
      return g;
    },
  });
})();
