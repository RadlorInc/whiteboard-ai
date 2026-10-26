// "easelcard cx cy k graph=blank|heating|boyle|charles|pressure lab=0 lit=card|easel|graph" — a PART (PARTS.md): a white
// card standing on a small wooden table easel, facing the room (+y), origin the bench point under the easel's middle.
// The easel (9.2 cm tall, as statechange.js and gaslaw.js draw it): two front legs leaning back 10°, a cross rail and a
// hinge block at the top, a back strut down to the bench, and a ledge across the legs that the 10.4 × 8.2 cm card rests
// on. The card carries a printed graph: heating (temperature against heat put in for ice → steam, statechange.js),
// boyle (p against V), charles (V against T), pressure (p against T, both with the dashed line to 0 K), or blank axes.
// A moving dot on the graph is the lesson's own diagram, not this part. Static. Built in mm.
(() => {
  const K = window.K;
  const LEAN = (10 * Math.PI) / 180, TAN = Math.tan(LEAN), HT = 92, CW = 104, CH = 82, CZ0 = 20, T = 1.2, LEG = 4;
  const yAt = (z) => -z * TAN;   // the legs' front face line: leaning back as it rises
  const J = [42, 334, 418, 2260], TOT = J.reduce((a, b) => a + b, 0), B = J.map(((s) => (v) => (s += v) / TOT)(0));
  const tempOf = (e) => (e < B[0] ? -20 + 20 * (e / B[0]) : e < B[1] ? 0 : e < B[2] ? 100 * ((e - B[1]) / (B[2] - B[1])) : 100);
  // a leaning bar: a box whose x × y section slides back with height
  const bar = (P, [x0, x1], [y0, y1], [z0, z1], tone = "mid") => ISO.poly([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0 + yAt(z1), z1], [x1, y0 + yAt(z1), z1], [x1, y1 + yAt(z1), z1], [x0, y1 + yAt(z1), z1]].map((p, i) => (i < 4 ? [p[0], p[1] + yAt(z0), p[2]] : p)), ISO.BOX_F, P, tone);

  ISO.add({
    name: "easelcard", title: "Card on an easel (part)", compare: null,
    about: "A white card on a small wooden table easel carrying a printed graph (a heating curve or a gas law), facing the room; a bench part. anchors: card top",
    line: "easelcard cx cy k graph=blank|heating|boyle|charles|pressure lab=0 lit=card|easel|graph",
    demo: { line: "easelcard 480 420 32 graph=heating", script: [{ set: { lit: "graph" }, hold: 1.5 }, { set: { lit: "easel" }, hold: 1.5 }, { set: { lit: "card" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const kind = ["heating", "boyle", "charles", "pressure"].includes(o.graph) ? o.graph : "blank";
      const XL = CW / 2 - 1, wood = ISO.T.wood;
      // the easel: back strut (from the hinge down to the bench behind), the two legs, the cross rail, the hinge block
      const sTop = [0, yAt(HT - 6) - LEG, HT - 6], sFoot = [0, -46, 0], sd = [sFoot[0] - sTop[0], sFoot[1] - sTop[1], sFoot[2] - sTop[2]], sl = Math.hypot(...sd);
      const nrm = [0, -sd[2] / sl, sd[1] / sl];   // across the strut in its y–z plane
      const strut = ISO.poly([[-3, 0, 0], [3, 0, 0], [3, 1, 0], [-3, 1, 0], [-3, 0, 1], [3, 0, 1], [3, 1, 1], [-3, 1, 1]].map(([x, a, b]) => [x, sTop[1] + sd[1] * b + nrm[1] * a * 4, sTop[2] + sd[2] * b + nrm[2] * a * 4]), ISO.BOX_F, Pm, "mid");
      const easelBack = ISO.tinted(wood, strut + bar(Pm, [-3.5, 3.5], [-LEG - 7, -LEG], [HT - 14, HT], "mid"));
      const legs = ISO.tinted(wood, bar(Pm, [-XL - LEG, -XL], [-LEG, 0], [0, HT]) + bar(Pm, [XL, XL + LEG], [-LEG, 0], [0, HT]) + bar(Pm, [-XL - LEG, XL + LEG], [-LEG - 0.01, -0.5], [HT - 30, HT - 24], "lo"));
      // the card leans on the legs, its foot on the ledge; then the ledge's lip in front of the card's foot
      const cy0 = 0.2, card = ISO.tinted(ISO.tint("#ffffff", ["#d9dcdf", "#e3e6e8", "#eceef0", "#f5f6f7"], "#7c8389"), bar(Pm, [-CW / 2, CW / 2], [cy0, cy0 + T], [CZ0, CZ0 + CH], "hi"));
      const ledge = ISO.tinted(wood, bar(Pm, [-CW / 2 - 6, CW / 2 + 6], [0, 7], [CZ0 - 4, CZ0], "mid") + bar(Pm, [-CW / 2 - 6, CW / 2 + 6], [5.5, 7], [CZ0, CZ0 + 3], "mid"));
      // the graph, drawn in card units (mm, x right, y down from the card's top-left) on the leaning face
      const o0 = [-CW / 2, cy0 + T + 0.05 + yAt(CZ0 + CH), CZ0 + CH], a = K.iso([o0[0] + 1, o0[1], o0[2]], Pm), b = K.iso([o0[0], o0[1] + TAN * Math.cos(LEAN), o0[2] - Math.cos(LEAN)], Pm), c0 = K.iso(o0, Pm);
      const m = `matrix(${(a[0] - c0[0]).toFixed(4)} ${(a[1] - c0[1]).toFixed(4)} ${(b[0] - c0[0]).toFixed(4)} ${(b[1] - c0[1]).toFixed(4)} ${c0[0].toFixed(2)} ${c0[1].toFixed(2)})`;
      const HC = CH / Math.cos(LEAN);   // the card's slant height
      const gx = (u) => 14 + u * (CW - 22), gy = (v) => HC - 14 - v * (HC - 26);
      const tag = (x, y, s, an = "start", f = 3.8, col = "#33404c") => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${an}" fill="${col}" style="font:600 ${f}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;
      let curve = "", xl = "", yl = "", extra = "";
      if (kind === "heating") {
        const ty = (T0) => gy((T0 + 20) / 130), q = [];
        for (let i = 0; i <= 60; i++) q.push(i / 60);
        q.push(...B.slice(0, 3)); q.sort((p, r) => p - r);
        curve = "M" + q.map((e) => `${gx(e).toFixed(2)} ${ty(tempOf(e)).toFixed(2)}`).join(" L");
        xl = "heat put in →"; yl = "temperature";
        extra = `<path d="M14 ${ty(0).toFixed(2)} H${CW - 6} M14 ${ty(100).toFixed(2)} H${CW - 6}" stroke="#9fb0c2" stroke-width="0.35" stroke-dasharray="1.5 1.5"/>` + tag(12, ty(0) + 1.4, "0 °C", "end", 3.6) + tag(12, ty(100) + 1.4, "100 °C", "end", 3.6) +
          tag(gx(B[0] + 0.02), ty(0) - 2, "melting", "start", 3.6, "#2f6fae") + tag(gx(B[2] + 0.18), ty(100) - 2, "boiling", "start", 3.6, "#a8382a");
      } else if (kind === "boyle") {
        const q = []; for (let V = 30; V <= 130; V += 4) q.push(`${gx((V - 25) / 110).toFixed(2)} ${gy((10000 / V - 50) / 300).toFixed(2)}`);
        curve = "M" + q.join(" L"); xl = "volume V (mL) →"; yl = "pressure p";
      } else if (kind === "charles" || kind === "pressure") {
        curve = `M${gx(0)} ${gy(0)} L${gx(1)} ${gy(1)}`; xl = "temperature (K) →"; yl = kind === "charles" ? "volume V" : "pressure p";
        extra = `<path d="M${gx(0)} ${gy(0)} L14 ${HC - 14}" stroke="#2f6fae" stroke-width="0.6" stroke-dasharray="1.5 1.5"/>` + tag(15, HC - 9.5, "0 K = −273 °C", "start", 3.2, "#2f6fae");
      }
      const graph = `<g transform="${m}"><path d="M14 8 V${HC - 14} H${CW - 6}" fill="none" stroke="#33404c" stroke-width="0.6"/><path d="M14 8 l-1.2 2.4 h2.4 Z M${CW - 6} ${HC - 14} l-2.4 -1.2 v2.4 Z" fill="#33404c"/>` +
        (curve ? `<path d="${curve}" fill="none" stroke="#2f6fae" stroke-width="1"/>` : "") + extra + (xl ? tag(CW / 2 + 4, HC - 5, xl, "middle") : "") + (yl ? tag(6, 6, yl) : "") + `</g>`;
      const halo = { x: -CW / 2 - 4, y: -48, w: CW + 8, d: 56, r: 4 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, 0, 4, Pm)}"/><g data-name="easel">${easelBack}${legs}</g><g data-name="card">${card}</g><g data-name="easel">${ledge}</g><g data-name="graph">${graph}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [CW / 2 + 6, 4, CZ0 + CH * 0.6], kind === "blank" ? "card" : "graph", "#556", { anchor: "start" });
      g.anchors = { card: [0, (cy0 + T + yAt(CZ0 + CH / 2)) / 10, (CZ0 + CH / 2) / 10], top: [0, yAt(CZ0 + CH) / 10, (CZ0 + CH) / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `a ${CW / 10} × ${CH / 10} cm card on a wooden easel · ${kind === "heating" ? "heating curve: flat at 0 °C while ice melts and at 100 °C while water boils" : kind === "boyle" ? "Boyle's law: p falls as V grows (pV constant)" : kind === "charles" ? "Charles's law: V rises in step with T in kelvin" : kind === "pressure" ? "pressure law: p rises in step with T in kelvin" : "blank axes"}`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
