// Small shared pieces for the batch-9 chemistry recipes (indicator, crystals, dissolve, precipitate, statechange,
// gaslaw). Not a recipe: it only defines window.CHEM. Builds on window.LAB (_lab.js). Millimetres, z up.
(() => {
  const K = window.K, G = window.G;
  const CHEM = (window.CHEM = {});
  // a 16 mm test tube's outer meridian, round bottom to a slightly flared rim
  CHEM.tube = (len, R = 8) => {
    const out = [];
    for (let i = 1; i <= 7; i++) { const s = (i / 7) * R; out.push([s, Math.sqrt(Math.max(0.09, R * R - (R - s) ** 2)), 1]); }
    return [[0, 0.3], ...out, [len - 2, R], [len - 1, R + 0.9, 1], [len, R + 0.7]];
  };
  // a beaker's outer meridian: rounded heel, straight wall
  CHEM.beaker = (R, H) => [[0, R - 3], [0.7, R - 1.2, 1], [2.2, R - 0.2, 1], [4, R], [H, R]];
  // universal indicator, pH 0 … 14 (the printed chart's colours)
  CHEM.UI = ["#b8202a", "#e0302a", "#ee4b2b", "#f47a2b", "#f9a72d", "#f7d23c", "#cfdc3c", "#78c043", "#3ea85a", "#2e9b8c", "#2b7fc1", "#3a5db7", "#4a46a8", "#5a3a98", "#4a2a7c"];
  CHEM.ui = (ph) => { const p = ISO.clamp(ph, 0, 14), i = Math.min(13, Math.floor(p)); return window.LAB.mix(CHEM.UI[i], CHEM.UI[i + 1], p - i); };
  // A wooden rack: base, two end posts, a drilled top shelf; one tube per x, each drawn whole, then the shelf, then the
  // part of the tube above the shelf again (clipped above its hole), so the shelf really holds it.
  let n = 0;
  CHEM.rack = (P, xs, y, len, fill, { shelf: sh = 62, z0 = 0 } = {}) => {
    const shelf = sh + z0;
    const LAB = window.LAB, S = LAB.S, L = LAB.L, wood = ISO.T.wood, R = 8, tag = "ck" + n++;
    const x0 = Math.min(...xs) - 18, x1 = Math.max(...xs) + 18, base = { x: x0, y: y - 22, w: x1 - x0, d: 44, r: 3 };
    const tubes = xs.map((x) => LAB.vessel(P, [x, y, 8 + z0], CHEM.tube(len), { base: 1, wall: 0.9 }));
    const tubeSvg = (i) => tubes[i].back() + (fill(i) ? tubes[i].liquid(fill(i)[0], fill(i)[1], { opacity: fill(i)[2] || 0.55 }) : "") + tubes[i].front();
    const plan = { x: x0 + 6, y: y - 12, w: x1 - x0 - 12, d: 24, r: 2 };
    const out = [`<path class="iso-halo" d="${K.haloOf(base, z0, 8, P)}"/>`, `<g style="${wood}">${S(K.slabOf(base, z0, 8, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(base, z0 + 4, P, 3), { tone: "faint" }) })}`];
    out.push(S(K.slabOf({ x: x0 + 2, y: y - 12, w: 6, d: 24, r: 1 }, z0 + 8, shelf - 8 - z0, P, 2, 0.4), { tone: "mid" }), `</g>`);
    xs.forEach((_, i) => out.push(tubeSvg(i)));
    const holes = xs.map((x) => `<path d="${K.pathOf(K.circleRing(x, y, R + 1, 32).map(([a, b]) => K.iso([a, b, shelf + 5], P)), true)}" fill="#5a4022" stroke="#7a5a2e" stroke-width="0.6"/>`).join("");
    out.push(`<g style="${wood}">${S(K.slabOf(plan, shelf, 5, P, 3, 0.5), { tone: "mid" })}${holes}</g>`);
    xs.forEach((x, i) => {
      const c = K.iso([x, y, shelf + 5], P), id = `${tag}t${i}`;
      out.push(`<defs><clipPath id="${id}"><path d="M${c[0] - 40} ${c[1] - 600} H${c[0] + 40} V${c[1]} H${c[0] - 40} Z ${K.pathOf(K.circleRing(x, y, R + 0.2, 32).map(([a, b]) => K.iso([a, b, shelf + 5], P)), true)}"/></clipPath></defs><g clip-path="url(#${id})">${tubeSvg(i)}</g>`);
    });
    out.push(`<g style="${wood}">${S(K.slabOf({ x: x1 - 8, y: y - 12, w: 6, d: 24, r: 1 }, z0 + 8, shelf - 8 - z0, P, 2, 0.4), { tone: "mid" })}</g>`);
    return out.join("");
  };
})();
