// "contactscrew cx cy k lab=0 lit=base|post|screw|nut|terminal" — a PART (PARTS.md, batch 5): the contact of the
// bimetal set-up (bimetal.js's post under the strip's free end) at real size, standing on the bench, origin the bench
// point under its middle. A black moulded foot 3 cm across held down by two slotted screws, a brass terminal on the
// foot where the lamp's wire is clamped, a white glazed insulator post with two sheds, a brass hex collar on top, and
// up out of it a threaded brass contact screw (set the gap by turning it) with a lock nut and a silver contact tip.
// 3 × 3 × 10 cm. Static (the strip comes down onto the tip). Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RB = 15, HB = 6, RP = 6, ZP = 72, ZC = 79, ZS = 97, TIP = 100, TY = 9.5, TX = 3;

  const slotScrew = (P, [x, y, z], r = 2.4) => ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, r, z, r * 0.4, P, 16, 0.3), { tone: "hi" })) +
    `<path d="${K.segment([x - r * 0.75, y - r * 0.3, z + r * 0.41], [x + r * 0.75, y + r * 0.3, z + r * 0.41], P)}" stroke="#3c3f45" stroke-width="${Math.max(0.4, G.scaleOf(P) * r * 0.22).toFixed(2)}"/>`;

  function svg(P) {
    const B09 = window.B09, CREAM = window.B08 ? window.B08.CREAM : ISO.T.steel, out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: -RB, y: -RB, w: 2 * RB, d: 2 * RB, r: RB }, 0, 4, P)}"/>`);
    // the foot: a moulded disc with a bevel and a step, two hold-down screws, the terminal toward the front (+y)
    out.push(`<g data-name="base">${ISO.tinted(ISO.T.plastic, S(K.cylinder(0, 0, RB, 0, HB - 1.5, P, 40, 0.6), { tone: "mid" }) + S(K.cylinder(0, 0, RB - 2.5, HB - 1.5, 1.5, P, 36, 0.4), { tone: "mid" }))}` +
      `${slotScrew(P, [-10, 4, HB - 1.5])}${slotScrew(P, [10, -5, HB - 1.5])}</g>`);
    // the post: a glazed insulator with two sheds, sitting in a shallow boss on the foot
    out.push(`<g data-name="post">${ISO.tinted(CREAM, S(K.cylinder(0, 0, RP + 1, HB, 2, P, 28, 0.4), { tone: "mid" }) + S(K.cylinder(0, 0, RP, HB + 2, 24, P, 28), { tone: "hi", crease: "none" }) +
      S(K.cylinder(0, 0, RP + 2.4, HB + 26, 2.4, P, 32, 0.8), { tone: "hi" }) + S(K.cylinder(0, 0, RP, HB + 28.4, 18, P, 28), { tone: "hi", crease: "none" }) +
      S(K.cylinder(0, 0, RP + 2.4, HB + 46.4, 2.4, P, 32, 0.8), { tone: "hi" }) + S(K.cylinder(0, 0, RP, HB + 48.8, ZP - HB - 48.8, P, 28), { tone: "hi", crease: "none" }))}</g>`);
    // the brass collar (hex) and the threaded contact screw out of it: core, thread ribs, lock nut on its washer
    const ribs = [];
    for (let z = ZC + 0.6; z < ZS - 0.6; z += 1.1) ribs.push(S(K.cylinder(0, 0, 2.75, z, 0.5, P, 14), { tone: "hi", crease: "none" }));
    out.push(`<g data-name="screw">${ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, RP + 0.6, ZP, 1, P, 28, 0.3), { tone: "mid" }) + S(K.cylinder(0, 0, 7, ZP + 1, ZC - ZP - 1, P, 6, 0.4), { tone: "hi" }) +
      S(K.cylinder(0, 0, 2.4, ZC, ZS - ZC, P, 14), { tone: "mid", crease: "none" }) + ribs.slice(0, 4).join(""))}</g>`);
    out.push(`<g data-name="nut">${ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 4.6, ZC + 4.6, 0.6, P, 24), { tone: "hi" }) + S(K.cylinder(0, 0, 4.4, ZC + 5.2, 3.6, P, 6, 0.3), { tone: "hi" }))}</g>`);
    out.push(`<g data-name="screw">${ISO.tinted(ISO.T.brass, ribs.slice(8).join(""))}` +
      `${ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 2.8], [1.4, 2.6, 1], [2.4, 1.7, 1], [3, 0.3]], B09.Z([0, 0, ZS]), P), { tone: "hi" }))}</g>`);
    // the terminal: brass washer, stud and a knurled nut that clamps the wire, on the foot's front
    out.push(`<g data-name="terminal">${ISO.tinted(ISO.T.brass, S(K.cylinder(TX, TY, 3.4, HB - 1.5, 0.5, P, 20), { tone: "hi" }) + S(K.cylinder(TX, TY, 1.1, HB - 1, 4.4, P, 12), { tone: "mid", crease: "none" }) +
      S(K.cylinder(TX, TY, 2.8, HB, 2.2, P, 20), { tone: "hi" }) + L(K.knurl(TX, TY, 2.8, HB, HB + 2.2, 12, P), { tone: "lo" }))}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "contactscrew", title: "Contact screw on a post (part)", compare: null,
    about: "An insulated post 10 cm tall with a brass contact screw, lock nut and silver tip: the contact a bimetallic strip bends down onto to close a circuit (a fire alarm, a thermostat); a terminal on the foot takes the wire. anchors: tip terminal",
    line: "contactscrew cx cy k lab=0 lit=base|post|screw|nut|terminal",
    demo: { line: "contactscrew 480 420 34", script: [{ set: {}, hold: 1 }, { set: { lit: "screw" }, hold: 1.2 }, { set: { lit: "nut" }, hold: 1.2 }, { set: { lit: "terminal" }, hold: 1.2 }, { set: { lit: "post" }, hold: 1.2 }] },
    make([cx = 480, cy = 420, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      g.innerHTML = svg(Pm) + (lab ? LAB.word(Pm, lab, [10, 0, TIP + 4], "contact", "#556", { anchor: "start" }) + LAB.word(Pm, lab, [RP + 4, 0, 40], "insulated post", "#556", { anchor: "start" }) : "");
      g.anchors = { tip: [0, 0, TIP / 10], terminal: [TX / 10, TY / 10, (HB + 2.2) / 10] };
      return window.B09.still(g, o, "contact post · brass screw sets the gap · its tip is 10 cm above the bench");
    },
  });
})();
