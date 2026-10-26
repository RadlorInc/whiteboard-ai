// "plug3 cx cy size k=uk|india lab=1" — a three-pin plug opened up to show its wiring.
// UK (BS 1363): seen from the back with the cover off and the cord at the bottom: earth (green/yellow) to the top
// pin, live (brown) to the right pin through a 13 A cartridge fuse, neutral (blue) to the left pin, the cord held by
// a grip bar. India (IS 1293): round pins, the thicker earth on top, live right, neutral left, no fuse in the plug.
// The demo lights each wire in turn and the readout says what it does.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BODY = { x: -34, y: -40, w: 68, d: 86, r: 10 }, FLOOR = 6;
  const WIRES = {
    uk: { earth: { c: "#2c9a3a", c2: "#f2c230", to: [0, -24] }, live: { c: "#7a4a1c", to: [20, 8] }, neutral: { c: "#2b6cc4", to: [-20, 8] } },
    india: { earth: { c: "#2c9a3a", to: [0, -24] }, live: { c: "#c0392b", to: [20, 8] }, neutral: { c: "#1d1f22", to: [-20, 8] } },
  };
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);

  function bodySvg(P, k) {
    const out = [`<path class="iso-halo" d="${K.haloOf(BODY, 0, FLOOR, P)}"/>`];
    // The front half of the case (the part the pins go through), with its rim, seen from the inside.
    out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf(BODY, 0, FLOOR, P, 10, 1), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.plastic, S(K.extrude(K.ringOf(BODY, 10), FLOOR, 7, P, { convex: true }), { tone: "hi" }).replace('class="iso-fill"', 'class="iso-fill" fill-opacity="0"')));
    out.push(L(K.planOutline(K.insetPlan(BODY, 3), FLOOR, P, 10), { tone: "lo" }));
    // Pin bosses and terminals: brass pins seen end-on with a terminal screw each.
    const pins = k === "uk" ? [[0, -24, 7, 4], [20, 8, 6, 3], [-20, 8, 6, 3]] : [[0, -24, 5, 5], [20, 8, 4, 4], [-20, 8, 4, 4]];
    for (const [x, y, w, d] of pins) {
      out.push(S(K.slabOf({ x: x - w - 2, y: y - d - 2, w: 2 * w + 4, d: 2 * d + 4, r: 2 }, FLOOR, 2, P, 3), { tone: "mid" }));
      out.push(ISO.tinted(ISO.T.brass, k === "uk" ? S(K.slabOf({ x: x - w, y: y - d, w: 2 * w, d: 2 * d, r: 0.6 }, FLOOR + 2, 7, P, 2, 0.4), { tone: "hi" }) : S(K.cylinder(x, y, w, FLOOR + 2, 7, P, 24, 0.4), { tone: "hi" })));
      out.push(S(K.cylinder(x, y, 2, FLOOR + 9, 1.4, P, 16), { tone: "mid" }), L(K.lineOnTop([x - 2, y], [x + 2, y], FLOOR + 10.4, P), { tone: "lo" }));
    }
    // The fuse (UK only): a 13 A cartridge between two brass clips, next to the live pin.
    if (k === "uk") {
      const F = yAx([20, -18, FLOOR + 6]);
      out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [16, 24], [-30, -27], [FLOOR, FLOOR + 9], "hi") + ISO.wbox(P, [16, 24], [-9, -6], [FLOOR, FLOOR + 9], "hi")));
      out.push(ISO.tinted(ISO.T.red, S(G.disc(-9, 9, 3.4, F, P), { tone: "hi" })), S(G.disc(-11, -9, 3.4, F, P), { tone: "mid" }), S(G.disc(9, 11, 3.4, F, P), { tone: "mid" }));
      out.push(K.faceTextSvg(K.topMatrix([17.6, -16], FLOOR + 9.4, P, "y"), "13A", { size: 3.4, tone: "hi" }));
    }
    // The cord grip: a bar across the cord with two screws.
    out.push(ISO.wbox(P, [-14, 14], [32, 37], [FLOOR + 6, FLOOR + 9], "mid"), D([K.iso([-10, 34.5, FLOOR + 9], P), K.iso([10, 34.5, FLOOR + 9], P)], { size: 0.8, tone: "hi" }));
    return out.join("");
  }
  // One wire: from the cord to its terminal, insulated, with the bare copper end under the screw.
  function wireSvg(P, w, from, k) {
    const z = FLOOR + 5, mid = [w.to[0] * 0.8, (from[1] + w.to[1]) / 2], pts = [[from[0], from[1], z], [mid[0], mid[1], z + 1], [w.to[0], w.to[1] + 6, z + 2]];
    const d = K.pathOf(pts.map((p) => K.iso(p, P)));
    const out = [`<path d="${d}" fill="none" stroke="#1d1f22" stroke-width="5" stroke-linecap="round"/>`, `<path d="${d}" fill="none" stroke="${w.c}" stroke-width="3.6" stroke-linecap="round"/>`];
    if (w.c2) out.push(`<path d="${d}" fill="none" stroke="${w.c2}" stroke-width="3.6" stroke-dasharray="4 4" stroke-linecap="butt"/>`);
    out.push(`<path d="${K.pathOf([[w.to[0], w.to[1] + 6, z + 2], [w.to[0], w.to[1] + 1, FLOOR + 9]].map((p) => K.iso(p, P)))}" fill="none" stroke="#c98258" stroke-width="2" stroke-linecap="round"/>`);
    void k;
    return out.join("");
  }

  ISO.add({
    name: "plug3", title: "Three-pin plug wiring", compare: "plug3 480 250 300 k=uk",
    about: "A plug opened up: brown live through the fuse to the right pin, blue neutral left, green/yellow earth to the top pin, the cord held by a grip.",
    line: "plug3 cx cy size k=uk|india lab=1",
    demo: { line: "plug3 480 270 320", script: [{ set: { lit: "live" }, hold: 2.4 }, { set: { lit: "neutral" }, hold: 2.4 }, { set: { lit: "earth" }, hold: 2.4 }, { set: { lit: "fuse" }, hold: 2.4 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", k = o.k === "india" ? "india" : "uk", W = size * 1.4, H = size * 1.15;
      const { P, g } = ISO.frame([...K.boxCorners({ ...BODY, d: BODY.d + 30 }, 0, FLOOR + 12)], cx, cy, W, H, { azimuth: 78, elevation: 56 }, parent);
      const ws = WIRES[k];
      const cord = (P) => { const F = yAx([0, 60, FLOOR + 5]); return S(G.disc(-24, 0, 7, F, P), { tone: "lo" }) + S(G.disc(0, 4, 7, F, P), { tone: "lo" }); };
      g.innerHTML = `<g>${bodySvg(P, k)}</g><g>${cord(P)}</g>` + Object.entries(ws).map(([n, w]) => `<g data-name="${n}">${wireSvg(P, w, [n === "earth" ? 0 : n === "live" ? 4 : -4, 36], k)}</g>`).join("") +
        `<g data-part="words"></g>`;
      const words = g.querySelector('[data-part="words"]'), w = ISO.writer();
      if (lab) words.innerHTML = [
        ISO.word(K.iso([0, -24, FLOOR + 12], P), k === "uk" ? "earth (green/yellow)" : "earth (green)", "#2c6a22", { size: 13, dy: -8 }),
        ISO.word(K.iso([BODY.x + BODY.w, 8, FLOOR + 10], P), k === "uk" ? "live (brown)" : "live (red)", k === "uk" ? "#7a4a1c" : "#c0392b", { size: 13, anchor: "start", dy: 4 }),
        ISO.word(K.iso([BODY.x, 8, FLOOR + 10], P), k === "uk" ? "neutral (blue)" : "neutral (black)", k === "uk" ? "#1f4f8f" : "#222", { size: 13, anchor: "end", dy: 4 }),
        k === "uk" ? ISO.word(K.iso([BODY.x + BODY.w, -18, FLOOR + 8], P), "13 A fuse", "#a3271b", { size: 13, anchor: "start" }) : "",
        ISO.word(K.iso([0, 64, FLOOR], P), "cord grip", "#555", { size: 13, dy: 16 }),
      ].join("");
      let lit = o.lit || "";
      const NOTES = {
        live: "live carries the current in at 230 V; it goes through the fuse so a fault blows the fuse, not the wire",
        neutral: "neutral takes the current back, close to 0 V",
        earth: "earth is a safety path: if a live wire touches a metal case, current runs to earth and blows the fuse",
        fuse: k === "uk" ? "13 A fuse: a thin wire that melts if too much current flows (3 A for small lamps)" : "Indian plugs have no fuse; the house's MCB protects the circuit",
      };
      g.set = (p) => { if (p.lit !== undefined) lit = p.lit; };
      g.update = () => {
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((q) => q.dataset.name === (lit === "fuse" ? "live" : lit)));
        return false;
      };
      g.readout = () => NOTES[lit] || (k === "uk" ? "UK plug: brown live right (via fuse), blue neutral left, green/yellow earth top" : "Indian plug: red/brown live right, black/blue neutral left, green earth on the big top pin");
      g.update();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
