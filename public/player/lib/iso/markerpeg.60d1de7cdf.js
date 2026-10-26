// "markerpeg cx cy k tag=none|F|2F lab=0 lit=peg|tag" — a PART (PARTS.md, batch 5): the small red peg of raydiagram.js
// that marks a lens's F or 2F point on the bench, 2 cm tall and 0.5 cm across, standing on a steel magnet foot, its
// origin the surface point under it (place it at=bench.zero ax=<cm>, ay=2.2 to stand on the rail's near edge strip,
// or on the bench). A red plastic shank with a collar and a round head; tag=F or 2F clips a small white card with
// the letter onto its +y side. Static. World units: 1 = 1 cm. anchors: top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RED = ISO.tint("#f26b5b", ["#a8281c", "#bd3326", "#d03f31", "#e2503f"], "#5a120b");
  const CARD = ISO.tint("#fbfbf8", ["#d9d9d2", "#e3e3dc", "#ecece6", "#f3f3ee"], "#55534c");

  ISO.add({
    name: "markerpeg", title: "Marker peg (part)", compare: null,
    about: "A small red peg 2 cm tall on a magnet foot that marks F or 2F beside a lens on the bench; tag=F or 2F clips on a card with the letter. anchors: top",
    line: "markerpeg cx cy k tag=none|F|2F lab=0 lit=peg|tag",
    demo: { line: "markerpeg 480 380 60 tag=2F", script: [{ set: {}, hold: 1 }, { set: { lit: "peg" }, hold: 1.3 }, { set: { lit: "tag" }, hold: 1.3 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const LAB = window.LAB, B25 = window.B25;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      const tag = o.tag === "F" || o.tag === "2F" ? o.tag : "", F = B25.Z([0, 0, 0]);
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -0.5, y: -0.5, w: 1, d: 1, r: 0.5 }, 0, 0.02, P)}"/>`];
      out.push(`<g data-name="peg">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.45, 0, 0.22, P, 28, 0.04), { tone: "mid" }))}` +
        ISO.tinted(RED, S(G.solidOf([[0.22, 0.32], [0.36, 0.25, 1], [1.5, 0.22], [1.5, 0.3], [1.6, 0.3], [1.62, 0.22]], F, P), { tone: "hi" }) + S(G.sphereOf([0, 0, 1.73], 0.27, P, { steps: 32 }), { tone: "hi" })) + `</g>`);
      if (tag) {
        // the card: 0.9 × 0.6 cm, clipped to the shank's near side by a small wire spring
        const y = 0.24;
        out.push(`<g data-name="tag">${ISO.tinted(CARD, ISO.wbox(P, [-0.45, 0.45], [y, y + 0.03], [0.6, 1.2], "hi"))}` +
          ISO.tinted(ISO.T.steel, ISO.wbox(P, [-0.08, 0.08], [0.18, y + 0.035], [1.1, 1.28], "mid")) +
          LAB.faceText(P, [0, y + 0.035, 0.75], [1, 0, 0], tag, 0.42, "#b0281c") + `</g>`);
      }
      out.push(`<g data-part="words">${LAB.word(P, lab, [0, 0, 2.3], tag ? `${tag} marker` : "marker peg", "#556")}</g>`);
      g.innerHTML = out.join("");
      g.anchors = { top: [0, 0, 2] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `marker peg 2 cm tall${tag ? `, card "${tag}"` : ""} · marks ${tag === "2F" ? "twice the focal length (2F)" : tag === "F" ? "the focal point (F)" : "a point"} on the bench`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
