// "wallstuds cx cy width see=0|1 hang=0|1 lab=1 lit=studs|drywall|plates|screws|bracket" — a framed wall and its studs.
// A section of an interior wall: 2×4 studs (1½ × 3½ in) standing 16 in (40.6 cm) apart, centre to centre, between a
// bottom plate nailed to the floor and a doubled top plate; ½ in drywall screwed to their faces, a baseboard along the
// bottom, an outlet box fixed to one stud's side with its cable through the next. The only signs of the studs from the
// room are the rows of screw heads. see=1 makes the drywall see-through; hang=1 drives a shelf bracket's screws into a
// stud (about 45 kg each in wood, against about 5 kg in drywall alone). set({ see, hang }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const OC = 40.64, SW = 3.8, SD = 8.9, DW = 1.27, X0 = -72, X1 = 72, HZ = 110, BP = 3.8;
  const STUDS = [-1.5, -0.5, 0.5, 1.5].map((k) => k * OC);
  const WOOD = ISO.T.wood, WALL = ISO.tint("#f3f1ec", ["#cfccc4", "#d9d6ce", "#e3e0d8", "#ecebe5"], "#7a776f"), STEEL = ISO.T.steel;
  const FLOOR = { x: X0 - 6, y: -SD - 6, w: X1 - X0 + 12, d: SD + 30, r: 3 };
  const wood = (svg) => ISO.tinted(WOOD, svg);
  let uid = 0;

  function frameSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -3, 3, P)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(FLOOR, -3, 3, P, 3, 0.6), { tone: "lo", inner: L(K.sideSeam(FLOOR, -1.5, P, 3), { tone: "faint" }) }))];
    out.push(`<g data-name="plates">${wood(ISO.wbox(P, [X0, X1], [-SD, 0], [0, BP], "mid") + ISO.wbox(P, [X0, X1], [-SD, 0], [HZ - 2 * BP, HZ - BP], "mid") + ISO.wbox(P, [X0, X1], [-SD, 0], [HZ - BP, HZ], "mid"))}`);
    out.push(D([X0 + 8, -20, 20, X1 - 8].map((x) => K.iso([x, -SD / 2, BP], P)), { size: 0.5 }) + "</g>");
    // the studs, each with end-grain rings on its cut top and its nail heads in the plates
    out.push(`<g data-name="studs">` + STUDS.map((x) => wood(ISO.wbox(P, [x - SW / 2, x + SW / 2], [-SD, 0], [BP, HZ - 2 * BP], "mid"))).join("") + "</g>");
    // the outlet box on the second stud's side, its cable through holes bored in the studs
    const bx = STUDS[1] + SW / 2;
    out.push(ISO.tinted(ISO.T.blue, ISO.wbox(P, [bx, bx + 5.6], [-7, 0], [30, 39], "hi")));
    out.push(ISO.tinted(ISO.T.amber, S(G.disc(0, STUDS[2] - SW / 2 - bx - 5.6, 0.5, G.frameAlong([bx + 5.6, -4, 36], [1, 0, 0]), P, { steps: 10 }), { tone: "hi" })));
    out.push(L(K.sideRing([STUDS[2] + SW / 2 + 0.01, -4, 36], 0.7, "x", P, 12), { tone: "lo" }));
    return out.join("");
  }
  // The drywall sheet (alpha = how solid it looks), its taped joint, the screw heads over each stud, the baseboard.
  function drywallSvg(P, alpha) {
    const out = [`<g opacity="${alpha.toFixed(2)}">${ISO.tinted(WALL, ISO.wbox(P, [X0, X1], [0, DW], [BP * 0 + 0.5, HZ], "hi"))}</g>`];
    out.push(`<path d="${K.pathOf([[STUDS[2] - 2.6, 0.5], [STUDS[2] + 2.6, 0.5], [STUDS[2] + 2.6, HZ], [STUDS[2] - 2.6, HZ]].map(([x, z]) => K.iso([x, DW + 0.02, z], P)), true)}" fill="#ebe7dc" fill-opacity="${alpha.toFixed(2)}" stroke="none"/>`);
    const heads = [];
    for (const x of STUDS) for (let z = 16; z < HZ - 6; z += 30) heads.push(K.iso([x, DW + 0.03, z], P));
    out.push(`<g style="--anatomy-dot:#8f8b80">${D(heads, { size: 0.9, tone: "hi" })}</g>`);
    out.push(wood(ISO.wbox(P, [X0, X1], [DW, DW + 1.4], [0, 9], "hi")));
    return out.join("");
  }
  // A shelf bracket on the second stud: the steel L, and its two screws turned in by f (0 out, 1 home).
  function bracketSvg(P, f) {
    const x = STUDS[1], z0 = 70, out = [];
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [x - 1.4, x + 1.4], [DW, DW + 0.4], [z0 - 18, z0], "hi") + ISO.wbox(P, [x - 1.4, x + 1.4], [DW, DW + 18], [z0 - 0.4, z0], "hi")));
    out.push(ISO.tinted(STEEL, ISO.poly([[x - 0.4, DW + 0.4, z0 - 14], [x + 0.4, DW + 0.4, z0 - 14], [x + 0.4, DW + 14, z0 - 0.4], [x - 0.4, DW + 14, z0 - 0.4], [x - 0.4, DW + 0.4, z0 - 12], [x + 0.4, DW + 0.4, z0 - 12], [x + 0.4, DW + 12, z0 - 0.4], [x - 0.4, DW + 12, z0 - 0.4]], ISO.BOX_F, P, "hi")));
    for (const z of [z0 - 4, z0 - 15]) {
      const y = DW + 0.4 + (1 - f) * 3.5, F = G.frameOf([x, y, z], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
      out.push(ISO.tinted(STEEL, S(G.disc(-0.4, 0, 0.55, F, P, { steps: 14 }), { tone: "hi" }) + (f < 1 ? S(G.disc(0, Math.min(3.5, (1 - f) * 3.5), 0.22, F, P, { steps: 8 }), { tone: "hi" }) : "")));
      const a = f * 9, c = K.iso([x, y + 0.41, z], P), sc = G.scaleOf(P) * 0.42;
      out.push(`<path d="M${(c[0] - Math.cos(a) * sc).toFixed(1)} ${(c[1] - Math.sin(a) * sc * 0.5).toFixed(1)} L${(c[0] + Math.cos(a) * sc).toFixed(1)} ${(c[1] + Math.sin(a) * sc * 0.5).toFixed(1)}" stroke="#3c3f45" stroke-width="0.7"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "wallstuds", title: "Wall studs", compare: "wallstuds 480 270 440",
    about: "A framed wall: 2×4 studs 16 in apart behind the drywall, found by their rows of screw heads; the drywall goes see-through and a shelf bracket is screwed into a stud.",
    line: "wallstuds cx cy width see=0|1 hang=0|1 lab=1 lit=studs|drywall|plates|screws|bracket",
    demo: { line: "wallstuds 480 270 440", script: [{ set: {}, hold: 1.4 }, { set: { see: 1 }, hold: "settle" }, { set: { hang: 1 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.05, id = `ws${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -3, 0), [X0, -SD, HZ], [X1, DW, HZ], [STUDS[1], DW + 18, 70]], cx, cy, W, H, { azimuth: 66, elevation: 18 }, parent);
      g.innerHTML = `<g>${frameSvg(P)}</g><g data-name="drywall"></g><g data-name="bracket"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { drywall: q("drywall"), bracket: q("bracket"), words: q("words"), studs: q("studs"), plates: q("plates") }, w = ISO.writer();
      const s = { see: +(o.see === "1"), hang: +(o.hang === "1") }, goal = { see: s.see, hang: s.hang };
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.drywall, s.see.toFixed(2), () => drywallSvg(P, 1 - 0.78 * s.see));
        w.rebuild(el.bracket, s.hang > 0.001 ? s.hang.toFixed(3) : "", () => (s.hang > 0.001 || goal.hang ? bracketSvg(P, s.hang) : ""));
        w.attr(el.bracket, "opacity", goal.hang ? "1" : "0");
        w.rebuild(el.words, lab ? `${s.see > 0.5} ${s.hang > 0.99}` : "", () => {
          if (!lab) return "";
          const out = [];
          if (s.see > 0.5) {
            out.push(ISO.word(K.iso([(STUDS[2] + STUDS[3]) / 2, DW, HZ + 1], P), "16 in (40.6 cm) centre to centre", "#7a5a2e", { size: 14, dy: -8 }));
            out.push(ISO.word(K.iso([STUDS[3], DW, 50], P), "stud: 2×4", "#7a5a2e", { anchor: "start", size: 14, dy: 0 }).replace('x="', 'dx="12" x="'));
          } else out.push(ISO.word(K.iso([STUDS[3], DW, 76], P), "screw heads in a column = a stud", "#444", { anchor: "start", size: 14, dy: 0 }).replace('x="', 'dx="10" x="'));
          out.push(ISO.word(K.iso([X0, DW, HZ - 20], P), "drywall", "#444", { anchor: "end", size: 14, dy: 0 }));
          if (s.hang > 0.99) out.push(ISO.word(K.iso([STUDS[1], DW + 18, 70], P), "bracket screwed into the stud", "#444", { anchor: "start", size: 14, dy: -8 }));
          return out.join("");
        });
        const want = lit || (s.hang > 0.01 && s.hang < 1 ? "bracket" : s.see > 0.5 ? "studs" : "");
        w.light([el.studs, el.plates, el.drywall, el.bracket], [q(want)].filter(Boolean));
      };
      g.set = (p) => { if (p.see !== undefined) goal.see = +p.see ? 1 : 0; if (p.hang !== undefined) goal.hang = +p.hang ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.see = ISO.follow(s.see, goal.see, dt, 0.35, calm); if (Math.abs(s.see - goal.see) < 0.005) s.see = goal.see;
        // a driver sinks each screw in about 2 s
        const st = dt / 2; s.hang = calm || Math.abs(goal.hang - s.hang) <= st ? goal.hang : s.hang + Math.sign(goal.hang - s.hang) * st;
        draw();
        return s.see !== goal.see || s.hang !== goal.hang;
      };
      g.readout = () => {
        if (s.hang > 0.99) return "bracket screwed into the stud · each screw holds about 45 kg in wood (about 5 kg in drywall alone)";
        if (s.see > 0.5) return `studs every 16 in (40.6 cm) centre to centre · each 2×4 is really 1½ × 3½ in (3.8 × 8.9 cm)`;
        return "a painted wall · the drywall screws are driven into the studs, so their heads line up over each one";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
