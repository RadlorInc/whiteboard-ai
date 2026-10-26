// "woodtuberack cx cy k n=2..12 c=red,blue,green,yellow shelf=0|1 lab=0 lit=rack|tubes" — a PART (PARTS.md): a wooden
// test-tube rack on the bench, origin the bench point under its middle. A base board with a routed seam, two end posts,
// a middle shelf and a drilled top shelf (holes for 16 mm tubes every 3 cm), and a drying peg behind each hole on the
// base (testtube.js's own rack; indicator.js and rust.js use the same). n holes: 4.8 cm deep, n × 3 + 2.6 cm long
// (6 holes = 20.6 cm), 8.0 cm tall. c lists what stands in the holes, left to right: a colour is a 16 × 150 mm tube of
// that liquid, "empty" an empty tube, "none" an empty hole; the rack carries them itself so each is held by both shelves
// (drawn in three slices: under the middle shelf, between, above the top). shelf=0 leaves out the middle shelf. Built in mm.
(() => {
  const K = window.K, G = window.G;
  const GAP = 30, TOP = 74, MID = 34, TL = 150, R = 8;
  let n0 = 0;

  ISO.add({
    name: "woodtuberack", title: "Wooden test-tube rack (part)", compare: null,
    about: "A wooden test-tube rack with a drilled top shelf, a middle shelf, end posts and drying pegs, holding 16 mm test tubes of coloured liquids (or empty holes); a bench part. anchors: hole1 hole2 hole3 … (the bench point under each hole, where a tube's bottom stands) top",
    line: "woodtuberack cx cy k n=2..12 c=red,blue,green,yellow shelf=1|0 lab=0 lit=rack|tubes",
    demo: { line: "woodtuberack 480 400 22 n=6 c=red,orange,yellow,empty,blue,none", script: [{ set: { lit: "tubes" }, hold: 1.5 }, { set: { lit: "rack" }, hold: 1.5 }, { set: { lit: "" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const cs = String(o.c ?? "").split(",").map((c) => c.trim()).filter(Boolean).slice(0, 12);
      const n = Math.round(ISO.clamp(ISO.num(o, "n", Math.max(4, cs.length)), 2, 12)), mid = o.shelf !== "0";
      const XW = n * GAP + 26, X0 = -XW / 2, xs = Array.from({ length: n }, (_, i) => X0 + 13 + GAP / 2 + i * GAP), wood = ISO.T.wood, tag = "wr" + n0++;
      const what = xs.map((_, i) => { const c = cs[i] || "none"; return c === "none" || c === "0" ? null : c; });
      const tubes = xs.map((x, i) => (what[i] ? LAB.vessel(Pm, [x, 0, 8], window.CHEM.tube(TL, R), { base: 1, wall: 0.9 }) : null));
      const levels = xs.map((_, i) => TL * (0.3 + 0.1 * (i % 3)));
      const tubeSvg = (i) => tubes[i].back() + (what[i] !== "empty" ? tubes[i].liquid(levels[i], what[i], { opacity: 0.6 }) : "") + tubes[i].front();
      const plate = (z, h, holeR) => {
        const plan = { x: X0 + 8, y: -14, w: XW - 16, d: 28, r: 2 };
        const holes = xs.map((x) => `<path d="${K.pathOf(K.circleRing(x, 0, holeR, 32).map(([a, b]) => K.iso([a, b, z + h], Pm)), true)}" fill="#5a4022" stroke="#7a5a2e" stroke-width="0.6"/>`).join("");
        return S(K.slabOf(plan, z, h, Pm, 3, 0.5), { tone: "mid" }) + holes;
      };
      const clipAbove = (i, z, id) => { const c = K.iso([xs[i], 0, z], Pm); return `<clipPath id="${id}"><path d="M${c[0] - 400} ${c[1] - 4000} H${c[0] + 400} V${c[1]} H${c[0] - 400} Z ${K.pathOf(K.circleRing(xs[i], 0, R + 0.2, 32).map(([a, b]) => K.iso([a, b, z], Pm)), true)}"/></clipPath>`; };
      const base = { x: X0, y: -24, w: XW, d: 48, r: 3 }, out = [`<path class="iso-halo" d="${K.haloOf(base, 0, 8, Pm)}"/>`];
      out.push(`<g data-name="rack" style="${wood}">${S(K.slabOf(base, 0, 8, Pm, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(base, 4, Pm, 3), { tone: "faint" }) })}`);
      xs.forEach((x) => out.push(S(K.cylinder(x, -18, 2.2, 8, 34, Pm, 14), { tone: "mid" })));                  // drying pegs
      out.push(S(K.slabOf({ x: X0 + 2, y: -14, w: 6, d: 28, r: 1 }, 8, TOP - 2, Pm, 2, 0.4), { tone: "mid" }), `</g>`);   // far end post
      xs.forEach((_, i) => what[i] && out.push(`<g data-name="tubes">${tubeSvg(i)}</g>`));
      if (mid) {
        out.push(`<g data-name="rack" style="${wood}">${plate(MID, 4, R + 1.2)}</g>`);
        xs.forEach((_, i) => what[i] && out.push(`<defs>${clipAbove(i, MID + 4, `${tag}m${i}`)}</defs><g data-name="tubes" clip-path="url(#${tag}m${i})">${tubeSvg(i)}</g>`));
      }
      out.push(`<g data-name="rack" style="${wood}">${plate(TOP, 6, R + 1)}${D(K.corners({ x: X0 + 8, y: -14, w: XW - 16, d: 28, r: 2 }, 3).map(([x, y]) => K.iso([x, y, TOP + 6], Pm)), { size: 0.5 })}</g>`);
      xs.forEach((_, i) => what[i] && out.push(`<defs>${clipAbove(i, TOP + 6, `${tag}t${i}`)}</defs><g data-name="tubes" clip-path="url(#${tag}t${i})">${tubeSvg(i)}</g>`));
      out.push(`<g data-name="rack" style="${wood}">${S(K.slabOf({ x: -X0 - 8, y: -14, w: 6, d: 28, r: 1 }, 8, TOP - 2, Pm, 2, 0.4), { tone: "mid" })}</g><g data-part="words"></g>`);   // near end post
      g.innerHTML = out.join("");
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [0, 0, (what.some(Boolean) ? TL + 8 : TOP + 6) + 14], "test-tube rack", "#556");
      g.anchors = { top: [0, 0, (TOP + 6) / 10] };
      xs.forEach((x, i) => (g.anchors["hole" + (i + 1)] = [x / 10, 0, 0.8]));
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      const held = what.filter(Boolean);
      g.readout = () => `wooden test-tube rack, ${n} holes, ${(XW / 10).toFixed(1)} cm long · ${held.length ? held.length + " tube" + (held.length === 1 ? "" : "s") + ": " + held.join(", ") : "empty"}`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
