// "releasemagnet cx cy k on=0|1 lab=0 lit=core|coil|arm|terminals|field" — a PART (PARTS.md, batch 5): the release
// electromagnet at the top of a free-fall drop (freefall.js), its origin the middle of the soft-iron core's pole face
// at the bottom (the working tip: a steel ball held by it touches there, so `steelball … at=<id> az=-<d>` hangs a ball
// of d cm under it). A soft-iron core 1 cm across through a plastic bobbin wound with enamelled copper wire (3 cm
// across, 4 cm tall, a paper band printed "12 V" round it), an iron cap block on top, two brass terminal posts with
// knurled nuts, and a 1 cm steel arm 11 cm long out along −y to clamp in a boss. on=1: the coil carries current, the
// core is a magnet and holds iron (its field loops shown faint round the coil); on=0: no current, the field dies and
// the ball (or a paper case on an iron washer) is let go, at once and with no push. set({ on }) eases the field.
// Built in mm; anchors in cm: `pole` (the origin), `mount` (the arm's end), `plus` and `minus` (the terminal tops).
(() => {
  const K = window.K, G = window.G;
  const RC = 5, RB = 15, RW = 14, Z1 = 3, Z2 = 47, ARMZ = 55, ARM = 110;

  ISO.add({
    name: "releasemagnet", title: "Release electromagnet (part)", compare: null,
    about: "A release electromagnet on a clamp arm: while current flows its soft-iron core holds a steel ball; switch it off and it lets go at once, with no push (the start of a free-fall drop). anchors: pole mount plus minus",
    line: "releasemagnet cx cy k on=0|1 lab=0 lit=core|coil|arm|terminals|field",
    demo: { line: "releasemagnet 450 420 34 on=1 lab=1", script: [{ set: { lit: "coil" }, hold: 1.2 }, { set: { on: 0, lit: "field" }, hold: "settle" }, { set: { on: 1, lit: "core" }, hold: "settle" }, { set: { lit: "terminals" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { f: o.on === "0" ? 0 : 1 };
      st.want = st.f;
      let lit = o.lit || "";
      const Fz = (z) => LAB.Z([0, 0, z]), face = G.angleToward(Fz(0), G.viewOf(P));
      // the arm (furthest back): a steel bar out of the cap block toward −y, an end cap where it goes into the boss
      const Fa = LAB.A([0, 0, ARMZ], [0, -1, 0]);
      const arm = ISO.tinted(ISO.T.steel, S(G.disc(7, ARM, 5, Fa, Pm), { tone: "mid", crease: "none" }) + S(G.disc(ARM - 0.8, ARM, 5.3, Fa, Pm), { tone: "mid" }));
      // the core's lower end below the bobbin (the pole face), the bobbin's flanges and its winding
      const core = ISO.tinted(ISO.T.steel, S(G.solidOf([[0, RC - 0.6], [0.6, RC, 1], [Z1 + 0.5, RC]], Fz(0), Pm), { tone: "mid" }));
      const winding = L(Array.from({ length: 26 }, (_, i) => K.sideArc(0, 0, RW, Z1 + 3.5 + i * 1.6, Pm, 24)).join(""), { tone: "faint" });   // the turns of wire
      // the paper band: a patch on the side of the winding that faces us (a band all round would show its top edge only)
      const band = (() => { const pts = [], a0 = face - 1.45, a1 = face + 1.45; for (let i = 0; i <= 24; i++) pts.push(K.iso(G.pointOf(Fz(0), 20, RW + 0.2, a0 + ((a1 - a0) * i) / 24), Pm)); for (let i = 24; i >= 0; i--) pts.push(K.iso(G.pointOf(Fz(0), 30, RW + 0.2, a0 + ((a1 - a0) * i) / 24), Pm)); return `<path d="${K.pathOf(pts, true)}" fill="#f1ead8" stroke="#8a7f66" stroke-width="0.6"/>`; })();
      const coil = `<g style="${ISO.T.plastic}">${S(G.disc(Z1, Z1 + 2, RB, Fz(0), Pm), { tone: "lo" })}</g>` +
        ISO.tinted(ISO.T.copper, S(K.cylinder(0, 0, RW, Z1 + 2, Z2 - Z1 - 2, Pm, 40), { tone: "mid", inner: winding })) + band +
        LAB.faceText(Pm, G.pointOf(Fz(0), 26.6, RW + 0.4, face), G.mul3(G.tangentOf(Fz(0), face), -1), "12 V", 5, "#4a3f2a") +
        `<g style="${ISO.T.plastic}">${S(G.disc(Z2, Z2 + 2, RB, Fz(0), Pm), { tone: "lo" })}</g>`;
      // the cap block the arm and the core screw into; the core's top end and its lock nut in the block's top
      const cap = ISO.tinted(ISO.T.steel, ISO.wbox(Pm, [-8, 8], [-8, 8], [Z2 + 2, 63], "mid") + S(K.cylinder(0, 0, 4, 63, 2, Pm, 6), { tone: "mid" }));
      // the terminal posts on the top flange (toward +x), each a threaded post with a knurled brass nut
      const post = (y) => ISO.tinted(ISO.T.brass, S(K.cylinder(11, y, 1.2, Z2 + 2, 7, Pm, 12), { tone: "mid" }) + S(K.cylinder(11, y, 2.6, Z2 + 4, 3, Pm, 40), { tone: "mid", inner: L(K.knurl(11, y, 2.6, Z2 + 4, Z2 + 7, 12, Pm, 0.1), { tone: "faint" }) }));
      const posts = post(-5) + post(5);
      g.innerHTML = `<g data-name="arm">${arm}</g><g data-name="core">${core}</g><g data-name="coil">${coil}</g><g data-name="core">${cap}</g>` +
        `<g data-name="terminals">${posts}</g><g data-name="field" data-part="field"></g><g data-part="words"></g>`;
      g.anchors = { pole: [0, 0, 0], mount: [0, -ARM / 10, ARMZ / 10], plus: [1.1, -0.5, (Z2 + 9) / 10], minus: [1.1, 0.5, (Z2 + 9) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      // the field: loops from the pole face out round the coil and back into the cap block (the magnetic circuit), in
      // the plane square to the view, so they pass beside the coil, from the pole face round to the top flange
      const loop = (r, ang) => Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI, u = i / 24, x = RC * 0.7 + (RB - 1 - RC * 0.7) * u + (r - RB) * Math.sin(a) * 1.15, z = (Z2 + 1) / 2 - ((Z2 + 3) / 2) * Math.cos(a); return K.iso(G.pointOf(Fz(0), z, x, ang), Pm); });
      const fieldSvg = (f) => {
        if (f < 0.02) return "";
        const d = [];
        for (const r of [RB + 6, RB + 13]) for (const sgn of [-1, 1]) d.push(K.pathOf(loop(r, face + (sgn * Math.PI) / 2)));
        return `<path d="${d.join("")}" fill="none" stroke="#2f6fae" stroke-width="1.1" stroke-dasharray="3 2.4" stroke-linecap="round" opacity="${(0.75 * f).toFixed(2)}"/>`;
      };
      const draw = () => {
        const fq = Math.round(st.f * 20) / 20;
        w.rebuild(el.field, String(fq), () => fieldSvg(fq));
        if (lab) w.rebuild(el.words, "1", () => LAB.word(Pm, lab, [RB + 6, 0, 30], "coil", "#a0522d", { anchor: "start" }) + LAB.word(Pm, lab, [-RC - 6, 0, -2], "soft-iron core", "#556", { anchor: "end" }) + LAB.word(Pm, lab, [0, -ARM + 10, ARMZ + 8], "clamp arm", "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => { if (p.on !== undefined) st.want = String(p.on) === "1" ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      // a soft-iron core keeps almost no magnetism: the field builds and dies in a few hundredths of a second (shown slower)
      g.update = (dt) => { st.f = ISO.follow(st.f, st.want, dt, 0.18, ISO.still()); draw(); return st.f !== st.want; };
      g.readout = () => (st.want ? "electromagnet on: current in the coil makes the soft-iron core a magnet, it holds the steel ball" : "electromagnet off: no current, no magnetism, the ball is let go and falls from rest");
      draw();
      return g;
    },
  });
})();
