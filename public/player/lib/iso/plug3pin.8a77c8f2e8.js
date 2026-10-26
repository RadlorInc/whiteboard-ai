// "plug3pin cx cy k kind=uk|india lab=0 lit=case|pins|fuse|grip|live|neutral|earth" — a PART (PARTS.md, batch 5):
// the opened three-pin plug of plug3.js, its back cover off, lying face down on the bench on its own pins (as an open
// plug does), origin the bench point under its middle; 5 × 4 cm, 2.5 cm to the case's rim. kind=uk (BS 1363): square
// pins, the live and neutral pins half-sleeved, earth (green/yellow) to the top pin, live (brown) to the right pin
// through a 13 A cartridge fuse in its clips, neutral (blue) to the left; kind=india (IS 1293): round pins, a thicker
// earth, live red, neutral black, no fuse. Brass terminal screws, the cord grip bar with two screws, the cord out of the
// near end. Static: lit= lights one wire (or the fuse) to talk about it. Reuses plug3.js's shapes in its own units
// (17.2 to the cm). World units: 1 = 1 cm. anchors: cord
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const U = 17.2, BODY = { x: -34, y: -40, w: 68, d: 86, r: 10 }, FLOOR = 6, RIM = 7, PIN = 30;
  const WIRES = {
    uk: { earth: { c: "#2c9a3a", c2: "#f2c230", to: [0, -24] }, live: { c: "#7a4a1c", to: [20, 8] }, neutral: { c: "#2b6cc4", to: [-20, 8] } },
    india: { earth: { c: "#2c9a3a", to: [0, -24] }, live: { c: "#c0392b", to: [20, 8] }, neutral: { c: "#1d1f22", to: [-20, 8] } },
  };
  const CASE = ISO.tint("#f4f3ef", ["#c9c7c0", "#d6d4cd", "#e2e0da", "#ecebe6"], "#55534c");
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const px = (Pu, u) => (G.scaleOf(Pu) * u).toFixed(2);

  // one half of the case's rim wall, far (near = false) or near the camera, as an extruded strip of its plan
  function rimHalf(Pu, near) {
    const v = [K.depthOf([1, 0, 0], Pu) - K.depthOf([0, 0, 0], Pu), K.depthOf([0, 1, 0], Pu) - K.depthOf([0, 0, 0], Pu)];
    const c = [BODY.x + BODY.w / 2, BODY.y + BODY.d / 2], side = (p) => ((p[0] - c[0]) * v[0] + (p[1] - c[1]) * v[1] > 0) === near;
    const run = (ring) => { const n = ring.length; let s = 0; while (!(side(ring[s]) && !side(ring[(s + n - 1) % n]))) s++; const out = []; for (let i = 0; i < n && side(ring[(s + i) % n]); i++) out.push(ring[(s + i) % n]); return out; };
    const plan = [...run(K.ringOf(BODY, 10)), ...run(K.ringOf(K.insetPlan(BODY, 2.4), 10)).reverse()];
    return ISO.tinted(CASE, S(K.extrude(plan, FLOOR, RIM, Pu, { convex: false }), { tone: "mid" }));
  }
  function pinsSvg(Pu, k) {
    // what stands out of the face, under the case: the pins (UK live and neutral with their black sleeves)
    const pins = k === "uk" ? [[0, -24, 7, 4], [20, 8, 6, 3], [-20, 8, 6, 3]] : [[0, -24, 5, 5], [20, 8, 4, 4], [-20, 8, 4, 4]];
    const order = pins.map((p) => [K.depthOf([p[0], p[1], 0], Pu), p]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const out = [`<path class="iso-halo" d="${K.haloOf(BODY, -PIN, 2, Pu)}"/>`];
    for (const [x, y, w, d] of order) {
      const earth = y < 0;
      if (k === "uk") {
        out.push(ISO.tinted(ISO.T.brass, S(K.slabOf({ x: x - w, y: y - d, w: 2 * w, d: 2 * d, r: 0.6 }, -PIN, earth ? PIN : 15, Pu, 2, 0.4), { tone: "hi" })));
        if (!earth) out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: x - w - 0.3, y: y - d - 0.3, w: 2 * w + 0.6, d: 2 * d + 0.6, r: 0.6 }, -15, 15, Pu, 2, 0.3), { tone: "mid" })));
      } else out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, w, -PIN, PIN, Pu, 24, 0.8), { tone: "hi", inner: L(K.sideArc(x, y, w, -PIN + 6, Pu, 20), { tone: "faint" }) })));
    }
    return `<g data-name="pins">${out.join("")}</g>`;
  }
  function bodySvg(Pu, k) {
    const out = [`<g data-name="case">${ISO.tinted(CASE, S(K.slabOf(BODY, 0, FLOOR, Pu, 10, 1), { tone: "mid" }))}${rimHalf(Pu, false)}` +
      ISO.tinted(CASE, L(K.planOutline(K.insetPlan(BODY, 4), FLOOR, Pu, 10), { tone: "faint" })) + `</g>`];
    // pin bosses, the pins' inner ends and a terminal screw on each
    const pins = k === "uk" ? [[0, -24, 7, 4], [20, 8, 6, 3], [-20, 8, 6, 3]] : [[0, -24, 5, 5], [20, 8, 4, 4], [-20, 8, 4, 4]];
    for (const [x, y, w, d] of pins) {
      out.push(`<g data-name="case">${ISO.tinted(CASE, S(K.slabOf({ x: x - w - 2, y: y - d - 2, w: 2 * w + 4, d: 2 * d + 4, r: 2 }, FLOOR, 2, Pu, 3), { tone: "mid" }))}</g>`);
      out.push(`<g data-name="pins">${ISO.tinted(ISO.T.brass, (k === "uk" ? S(K.slabOf({ x: x - w, y: y - d, w: 2 * w, d: 2 * d, r: 0.6 }, FLOOR + 2, 7, Pu, 2, 0.4), { tone: "hi" }) : S(K.cylinder(x, y, w, FLOOR + 2, 7, Pu, 24, 0.4), { tone: "hi" })) +
        S(K.cylinder(x, y, 2, FLOOR + 9, 1.4, Pu, 16), { tone: "mid" }))}` + ISO.tinted(ISO.T.brass, L(K.lineOnTop([x - 1.6, y], [x + 1.6, y], FLOOR + 10.4, Pu), { tone: "lo" })) + `</g>`);
    }
    // the fuse (UK only): a 13 A cartridge between two brass clips, next to the live pin
    if (k === "uk") {
      const F = yAx([20, -18, FLOOR + 6]);
      out.push(`<g data-name="fuse">${ISO.tinted(ISO.T.brass, ISO.wbox(Pu, [16, 24], [-30, -27], [FLOOR, FLOOR + 9], "hi"))}` +
        ISO.tinted(ISO.T.red, S(G.disc(-9, 9, 3.4, F, Pu), { tone: "hi" })) + ISO.tinted(ISO.T.steel, S(G.disc(-11, -9, 3.4, F, Pu), { tone: "mid" }) + S(G.disc(9, 11, 3.4, F, Pu), { tone: "mid" })) +
        ISO.tinted(ISO.T.brass, ISO.wbox(Pu, [16, 24], [-9, -6], [FLOOR, FLOOR + 9], "hi")) +
        window.LAB.faceText(Pu, [19.4, -18, FLOOR + 9.45], [0, -1, 0], "13A", 3.2, "#ffffff", [-1, 0, 0]) + `</g>`);
    }
    // the cord grip: a bar across the cord with two screws (drawn after the cord, it clamps it)
    return out.join("");
  }
  const gripSvg = (Pu) => `<g data-name="grip">${ISO.tinted(CASE, ISO.wbox(Pu, [-14, 14], [32, 37], [FLOOR + 9, FLOOR + 12], "mid"))}` +
    ISO.tinted(ISO.T.steel, S(K.cylinder(-10, 34.5, 1.6, FLOOR + 12, 0.6, Pu, 14), { tone: "hi" }) + S(K.cylinder(10, 34.5, 1.6, FLOOR + 12, 0.6, Pu, 14), { tone: "hi" })) +
    ISO.tinted(ISO.T.steel, L(K.lineOnTop([-11.2, 34.5], [-8.8, 34.5], FLOOR + 12.6, Pu) + K.lineOnTop([8.8, 34.5], [11.2, 34.5], FLOOR + 12.6, Pu), { tone: "lo" })) + `</g>`;
  // the cord: its outer sheath from the grip out through the near end
  // (inside the case up to its near wall, then outside, drawn after the wall), a little moulded sleeve where it leaves
  const cordSvg = (Pu, out) => { const F = yAx([0, 36, FLOOR + 4.5]); return `<g data-name="case">${ISO.tinted(ISO.T.plastic, out ? S(G.disc(10, 13, 5.2, F, Pu), { tone: "mid" }) + S(G.disc(13, 34, 4.5, F, Pu), { tone: "lo" }) : S(G.disc(0, 10, 4.5, F, Pu), { tone: "lo" }))}</g>`; };
  // one wire: from the cord to its terminal, insulated, the bare copper end under the screw
  function wireSvg(Pu, w, from) {
    const z = FLOOR + 5, mid = [w.to[0] * 0.8, (from[1] + w.to[1]) / 2], pts = [[from[0], from[1], z], [mid[0], mid[1], z + 1], [w.to[0], w.to[1] + 6, z + 2]];
    const d = K.pathOf(pts.map((p) => K.iso(p, Pu)));
    const out = [`<path d="${d}" fill="none" stroke="#1d1f22" stroke-width="${px(Pu, 3.4)}" stroke-linecap="round"/>`, `<path d="${d}" fill="none" stroke="${w.c}" stroke-width="${px(Pu, 2.6)}" stroke-linecap="round"/>`];
    if (w.c2) out.push(`<path d="${d}" fill="none" stroke="${w.c2}" stroke-width="${px(Pu, 2.6)}" stroke-dasharray="${px(Pu, 3)} ${px(Pu, 3)}" stroke-linecap="butt"/>`);
    out.push(`<path d="${K.pathOf([[w.to[0], w.to[1] + 6, z + 2], [w.to[0], w.to[1] + 1, FLOOR + 9]].map((p) => K.iso(p, Pu)))}" fill="none" stroke="#c98258" stroke-width="${px(Pu, 1.4)}" stroke-linecap="round"/>`);
    return out.join("");
  }

  ISO.add({
    name: "plug3pin", title: "Three-pin plug, opened (part)", compare: null,
    about: "A three-pin mains plug with its cover off, lying on its pins: UK (square pins, brown live through a 13 A fuse, blue neutral, green/yellow earth) or India (round pins, no fuse); each wire on its terminal screw, the cord in its grip. anchors: cord",
    line: "plug3pin cx cy k kind=uk|india lab=0 lit=case|pins|fuse|grip|live|neutral|earth",
    demo: { line: "plug3pin 480 300 60 kind=uk", script: [{ set: {}, hold: 1 }, { set: { lit: "live" }, hold: 1.6 }, { set: { lit: "neutral" }, hold: 1.4 }, { set: { lit: "earth" }, hold: 1.4 }, { set: { lit: "fuse" }, hold: 1.4 }, { set: { lit: "grip" }, hold: 1.2 }, { set: { lit: "pins" }, hold: 1.2 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kind = o.kind === "india" ? "india" : "uk";
      // the plug's own units (17.2 to the cm), lifted onto its pins: z = 0 is the case's face, PIN over the bench
      const Pu = { ...P, scale: P.scale / U }, a = K.iso([0, 0, 0], Pu), b = K.iso([0, 0, PIN], Pu);
      Pu.origin = [P.origin[0] + b[0] - a[0], P.origin[1] + b[1] - a[1]];
      const ws = WIRES[kind];
      g.innerHTML = pinsSvg(Pu, kind) + bodySvg(Pu, kind) + cordSvg(Pu, false) +
        Object.entries(ws).map(([n, wi]) => `<g data-name="${n}">${wireSvg(Pu, wi, [n === "earth" ? 0 : n === "live" ? 2.5 : -2.5, 36])}</g>`).join("") +
        gripSvg(Pu) + `<g data-name="case">${rimHalf(Pu, true)}</g>` + cordSvg(Pu, true) + `<g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = [
        window.LAB.word(Pu, lab, [0, -24, FLOOR + 14], kind === "uk" ? "earth (green/yellow)" : "earth (green)", "#2c6a22", { dy: -8 }),
        window.LAB.word(Pu, lab, [BODY.x + BODY.w, 8, FLOOR + 10], kind === "uk" ? "live (brown)" : "live (red)", kind === "uk" ? "#7a4a1c" : "#c0392b", { anchor: "start", dy: 4 }),
        window.LAB.word(Pu, lab, [BODY.x, 8, FLOOR + 10], kind === "uk" ? "neutral (blue)" : "neutral (black)", kind === "uk" ? "#1f4f8f" : "#222", { anchor: "end", dy: 4 }),
        kind === "uk" ? window.LAB.word(Pu, lab, [BODY.x + BODY.w, -18, FLOOR + 8], "13 A fuse", "#a3271b", { anchor: "start" }) : "",
      ].join("");
      g.anchors = { cord: [0, 70 / U, (PIN + FLOOR + 4.5) / U] };
      let lit = o.lit || "";
      const NOTES = {
        live: "live carries the current in at 230 V; it goes through the fuse so a fault blows the fuse, not the wire",
        neutral: "neutral takes the current back, close to 0 V",
        earth: "earth is a safety path: if a live wire touches a metal case, current runs to earth and blows the fuse",
        fuse: kind === "uk" ? "13 A fuse: a thin wire that melts if too much current flows (3 A for small lamps)" : "Indian plugs have no fuse; the house's MCB protects the circuit",
      };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B20.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => NOTES[lit] || (kind === "uk" ? "UK plug: brown live right (via fuse), blue neutral left, green/yellow earth top" : "Indian plug: red live right, black neutral left, green earth on the big top pin");
      B20.light(w, g, lit);
      return g;
    },
  });
})();
