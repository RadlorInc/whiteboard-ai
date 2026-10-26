// "mainscord cx cy k len=5..200 strip=0|1 lab=0 lit=sheath|live|neutral|earth" — a PART (PARTS.md, batch 24): a
// three-core mains flex (7 mm white PVC sheath, three 0.75 mm² cores) lying on a surface, its origin the point where
// the sheath ends. The sheath runs len cm toward +y in a soft bend and ends in a cut face showing the three cores.
// strip=1 (default): at the origin the sheath is cut back and the cores fan out toward −y as in a plug, brown live to
// +x, blue neutral to −x, the green/yellow earth longest in the middle, each with 6 mm of twisted bare copper (anchors
// live, neutral, earth: the copper tips, where a terminal screw goes); strip=0: a plain cut end. Reused from plug3.js
// (wires and cord). Static. World units: 1 = 1 cm. anchors: live neutral earth end.
(() => {
  const K = window.K, G = window.G;
  const R = 0.35, RC = 0.12, Z = R;
  const SHEATH = ["#eef0ee", "#6c706c"], CORE = { live: ["#8a5426", "#3a200c"], neutral: ["#2f6fc6", "#123766"], earth: ["#2c9a3a", "#0f4a18"] };
  const ENDS = { live: [1.0, -3.0], neutral: [-1.0, -3.0], earth: [0, -3.8] };
  const tube = (d, w, c) => window.CIRC.tube(d, w, c);

  // the sheath's centre line from the origin toward +y, a soft S
  const pathOf = (len) => Array.from({ length: 33 }, (_, i) => { const t = i / 32; return [Math.sin(Math.PI * t) * Math.min(3, len * 0.08) * (1 - t * 0.6), len * t, Z]; });
  function cordSvg(P, len, strip) {
    const s = G.scaleOf(P), out = [], anchors = {};
    if (strip) {
      for (const n of ["earth", "live", "neutral"]) {
        const [ex, ey] = ENDS[n], pts = [];
        for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([ex * (t * t * (3 - 2 * t)) * 0.9 + ex * 0.1 * t, ey * t, RC]); }
        const d = K.pathOf(pts.map((p) => K.iso([p[0], p[1] + 0.2, p[2]], P)));
        const tip = [ex, ey - 0.4, RC], cu = K.pathOf([K.iso([ex, ey + 0.2, RC], P), K.iso(tip, P)]);
        out.push(`<g data-name="${n}">${tube(d, s * RC * 2, CORE[n])}` +
          (n === "earth" ? `<path d="${d}" fill="none" stroke="#f2c230" stroke-width="${(s * RC * 2).toFixed(2)}" stroke-dasharray="${(s * 0.35).toFixed(2)} ${(s * 0.35).toFixed(2)}"/>` : "") +
          `<path d="${cu}" fill="none" stroke="#7a3e1c" stroke-width="${(s * 0.16 + 0.8).toFixed(2)}" stroke-linecap="round"/><path d="${cu}" fill="none" stroke="#d98a58" stroke-width="${(s * 0.16).toFixed(2)}" stroke-linecap="round"/>` +
          `<path d="${cu}" fill="none" stroke="#f3c09a" stroke-width="${(s * 0.05).toFixed(2)}" stroke-dasharray="${(s * 0.06).toFixed(2)} ${(s * 0.08).toFixed(2)}"/></g>`);
        anchors[n] = tip.map((v) => +v.toFixed(3));
      }
    }
    const pts = pathOf(len), scr = pts.map((p) => K.iso(p, P)), end = scr.at(-1);
    out.push(`<g data-name="sheath">${tube(K.pathOf(scr), s * R * 2, SHEATH)}`);
    // the cut faces: at the far end (three cores in the sheath) and, unstripped, at the origin too
    const face = (c) => `<circle cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="${(s * R).toFixed(2)}" fill="#f7f8f7" stroke="#6c706c" stroke-width="0.6"/>` +
      [["earth", 0, 0.12], ["live", 0.11, -0.07], ["neutral", -0.11, -0.07]].map(([n, dx, dy]) => `<circle cx="${(c[0] + dx * s).toFixed(2)}" cy="${(c[1] + dy * s).toFixed(2)}" r="${(s * RC * 0.85).toFixed(2)}" fill="${CORE[n][0]}" stroke="${CORE[n][1]}" stroke-width="0.4"/>`).join("");
    out.push(face(end), strip ? "" : face(scr[0]), `</g>`);
    anchors.end = pts.at(-1).map((v) => +v.toFixed(3));
    if (!strip) for (const n of Object.keys(ENDS)) anchors[n] = [0, 0, Z];
    return { svg: out.join(""), anchors };
  }

  ISO.add({
    name: "mainscord", title: "Mains flex (part)", compare: null,
    about: "A three-core mains flex (7 mm white sheath; brown live, blue neutral, green/yellow earth) lying on a surface, stripped at one end with the cores fanned out and bare copper tips for terminals, len cm long. anchors: live neutral earth end",
    line: "mainscord cx cy k len=5..200 strip=0|1 lab=0 lit=sheath|live|neutral|earth",
    demo: { line: "mainscord 440 150 40 len=9 strip=1", script: [{ set: {}, hold: 1 }, { set: { lit: "live" }, hold: 1.2 }, { set: { lit: "neutral" }, hold: 1.2 }, { set: { lit: "earth" }, hold: 1.2 }, { set: { lit: "sheath" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const len = ISO.clamp(ISO.num(o, "len", 30), 5, 200), strip = o.strip !== "0", c = cordSvg(P, len, strip);
      g.innerHTML = c.svg + (lab ? window.CIRC.word(P, [ENDS.live[0], ENDS.live[1], 0.5], "brown live") + window.CIRC.word(P, [2, len * 0.5, 0.5], "mains flex") : "");
      g.anchors = c.anchors;
      let lit = o.lit || "";
      const light = window.CIRC.lighter(g);
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => `three-core mains flex, ${len} cm · brown live, blue neutral, green/yellow earth · 0.75 mm² cores, for up to 6 A`;
      light(lit);
      return g;
    },
  });
})();
