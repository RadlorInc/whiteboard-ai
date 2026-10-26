// "bankcard cx cy k aim=flat|up|wall c=blue|green|grey|black lab=0 lit=card|chip|wave|digits" — a PART (batch 6,
// money): a plastic bank card, 8.56 × 5.4 cm and 0.08 cm thick (the real ID-1 size) with rounded corners. Its face:
// a plain colour with one lighter diagonal stripe, a gold chip with its contact pads, the contactless mark (four
// waves), embossed placeholder digits 0000 0000 0000 0000, an expiry 00/00 and the words CARD HOLDER. No bank name
// and no logo. aim=flat lies face up on a surface (origin its middle there); aim=up stands on its long bottom edge,
// face toward the room (origin the middle of that edge); aim=wall points into a slot, chip end first, lying face up
// (origin the middle of its leading short edge, the card running out toward +y). Static. World: 1 = 1 cm.
// anchors: chip (the chip's middle) end (the far edge's middle: where a hand holds it)
(() => {
  const K = window.K;
  const W = 8.56, H = 5.4, T = 0.08, R = 0.32;
  const COL = { blue: ["#2f5f9e", "#4b7fc0", "#1c3a63"], green: ["#2f7a5a", "#4c9a77", "#1a4a36"], grey: ["#6f757d", "#8c939b", "#3c4047"], black: ["#2a2c31", "#44474e", "#0f1012"] };
  // the face as flat art, x right along the card, y down, 1 = 1 cm, origin the top-left corner
  function faceArt(c, B) {
    const [base, light, ink] = COL[c], s = [];
    s.push(`<rect width="${W}" height="${H}" rx="${R}" fill="${base}" stroke="${ink}" stroke-width="0.03"/>`);
    s.push(`<path d="M${W * 0.55} 0H${W * 0.8}L${W * 0.42} ${H}H${W * 0.17}Z" fill="${light}" opacity=".45"/>`);
    // the chip: gold pad, its contact areas, the centre pad
    const cx = 0.9, cy = 1.75, cw = 1.15, ch = 0.9;
    s.push(`<g data-name="chip"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="0.14" fill="#e6c76a" stroke="#8a6a1c" stroke-width="0.035"/>` +
      `<path data-free d="M${cx} ${cy + ch / 3}H${cx + cw * 0.36}M${cx} ${cy + (2 * ch) / 3}H${cx + cw * 0.36}M${cx + cw} ${cy + ch / 3}H${cx + cw * 0.64}M${cx + cw} ${cy + (2 * ch) / 3}H${cx + cw * 0.64}M${cx + cw * 0.36} ${cy}V${cy + ch}M${cx + cw * 0.64} ${cy}V${cy + ch}" stroke="#8a6a1c" stroke-width="0.03" fill="none"/>` +
      `<rect x="${cx + cw * 0.36}" y="${cy + ch * 0.3}" width="${cw * 0.28}" height="${ch * 0.4}" rx="0.05" fill="#f1d98c" stroke="#8a6a1c" stroke-width="0.03"/></g>`);
    // the contactless mark: four waves, growing to the right
    const wx = 2.55, wy = cy + ch / 2;
    s.push(`<g data-name="wave">${[0.18, 0.32, 0.46, 0.6].map((r) => `<path data-free d="M${wx + r * 0.7} ${wy - r}A${r} ${r} 0 0 1 ${wx + r * 0.7} ${wy + r}" fill="none" stroke="#f4f6f8" stroke-width="0.07" stroke-linecap="round"/>`).join("")}</g>`);
    // embossed digits: a dark shadow under each light glyph row
    const dig = (dy, col) => B.text(0.75, 3.55 + dy, "0000 0000 0000 0000", 0.5, col, "start", 700, "'Courier New',monospace");
    s.push(`<g data-name="digits">${dig(0.03, ink)}${dig(0, "#eef2f6")}${B.text(3.2, 4.2, "VALID THRU", 0.17, "#dfe7ef", "start", 600)}${B.text(4.45, 4.22, "00/00", 0.3, "#eef2f6", "start", 700, "'Courier New',monospace")}` +
      `${B.text(0.75, 4.85, "CARD HOLDER", 0.3, "#eef2f6", "start", 700, "'Courier New',monospace")}</g>`);
    return s.join("");
  }
  ISO.add({
    name: "bankcard", title: "Bank card (part)", compare: null,
    about: "A plastic bank card, 8.56 × 5.4 cm, plain colour with a stripe, a gold chip, the contactless mark and embossed placeholder digits; no brand. Lies flat, stands up, or points into a slot. anchors: chip end",
    line: "bankcard cx cy k aim=flat|up|wall c=blue|green|grey|black lab=0 lit=card|chip|wave|digits",
    demo: { line: "bankcard 480 300 55 aim=flat lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "chip" }, hold: 1.4 }, { set: { lit: "wave" }, hold: 1.4 }, { set: { lit: "digits" }, hold: 1.4 }, { set: { lit: "card" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const aim = ["flat", "up", "wall"].includes(o.aim) ? o.aim : "flat", c = COL[o.c] ? o.c : "blue";
      const [base, light, ink] = COL[c], tint = ISO.tint(light, [ink, base, base, light], ink);
      // the card's frame: its top-left corner o, U along its length, V down its face, N out of its face
      let O, U, V, N, body, plan;
      if (aim === "flat") { O = [-W / 2, -H / 2, T]; U = [1, 0, 0]; V = [0, 1, 0]; N = [0, 0, 1]; plan = { x: -W / 2, y: -H / 2, w: W, d: H, r: R }; body = TE.slab(P, plan, 0, T, "mid", tint, 4); }
      else if (aim === "wall") { O = [H / 2, 0, T]; U = [0, 1, 0]; V = [-1, 0, 0]; N = [0, 0, 1]; plan = { x: -H / 2, y: 0, w: H, d: W, r: R }; body = TE.slab(P, plan, 0, T, "mid", tint, 4); }
      else {
        O = [-W / 2, T / 2, H]; U = [1, 0, 0]; V = [0, 0, -1]; N = [0, 1, 0]; plan = { x: -W / 2, y: -T / 2, w: W, d: T, r: 0 };
        const out = [...ISO.arc(W / 2 - R, R, R, -Math.PI / 2, 0, 5), ...ISO.arc(W / 2 - R, H - R, R, 0, Math.PI / 2, 5), ...ISO.arc(-W / 2 + R, H - R, R, Math.PI / 2, Math.PI, 5), ...ISO.arc(-W / 2 + R, R, R, Math.PI, Math.PI * 1.5, 5)];
        body = ISO.prismY(P, out, -T / 2, T / 2, [ink, light], base, ink);
      }
      const at = (u, v) => [O[0] + U[0] * u + V[0] * v, O[1] + U[1] * u + V[1] * v, O[2] + U[2] * u + V[2] * v];
      const lift = TE.mul(N, 0.002);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(aim === "up" ? { x: -W / 2, y: -1, w: W, d: 2, r: 0.5 } : plan, 0, 0.02, P)}"/>` +
        `<g data-name="card">${body}${TE.flat(P, TE.add(O, lift), U, V, faceArt(c, B))}</g><g data-part="words"></g>`;
      g.anchors = { chip: at(0.9 + 0.575, 1.75 + 0.45), end: at(W, H / 2) };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso(at(W, 0), P), "bank card", "#556", { size: 13, anchor: "start" });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "bank card · 8.56 × 5.4 cm · chip and contactless · placeholder digits";
      B.light(w, g, lit);
      return g;
    },
  });
})();
