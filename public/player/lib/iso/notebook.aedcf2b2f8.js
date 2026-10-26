// "notebook cx cy width write=0..1 lab=1 lit=page|spiral|pencil |line, line" — a spiral notebook open on a desk.
// A 21 × 16 cm spiral notebook: a blue card back cover, the stack of pages (their edges lined on the sides), the top
// page ruled every 8 mm with a red margin and a row of punched holes, and the wire spiral looping through the holes
// over the top edge. The |text lines are written on the ruled lines in pencil: set({ write }) from 0 to 1 moves a
// pencil along the lines and the words appear behind its point, letter by letter. World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const W2 = 105, D2 = 80, PZ = 8, RULE = 8, MARGIN = -72, FIRST = -48, HOLE = -73;      // PZ: height of the top page
  const DESK = { x: -140, y: -108, w: 300, d: 210, r: 8 };
  const NOTE = { x: -W2, y: -D2, w: 2 * W2, d: 2 * D2, r: 3 };
  const COILS = Array.from({ length: 21 }, (_, i) => -96 + i * 9.6);
  const CARD = ISO.tint("#cfe0f5", ["#3d6fb0", "#4a7fbd", "#5a8fca", "#6b9fd6"], "#173a66");
  const PAPER = ISO.tint("#fffdf5", ["#d9d4c4", "#e2ddcf", "#ebe7db", "#f3f0e7"], "#7a8a9a");
  const YELLOW = [["#c9961a", "#ffe066"], "#ffd84a", "#7a5a08"];
  const FONT = "'Bradley Hand','Segoe Print','Comic Sans MS','Chalkboard SE',cursive";

  function bookSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(NOTE, 0, 6, P)}"/>`];
    out.push(ISO.tinted(CARD, S(K.slabOf({ ...NOTE, x: NOTE.x - 1.5, w: NOTE.w + 3, d: NOTE.d + 2, y: NOTE.y }, 0, 1.4, P, 4), { tone: "mid" })));
    // the page stack: lines along its sides where the pages lie, each a ring round the stack
    const seams = [3, 4.4, 5.8, 7.2].map((z) => K.sideSeam(NOTE, z, P, 4)).join("");
    out.push(ISO.tinted(PAPER, S(K.slabOf(NOTE, 1.4, PZ - 1.4, P, 4), { tone: "mid", inner: L(seams, { tone: "faint" }) })));
    // the top page: ruled lines edge to edge, the margin from the top edge to the bottom one, the punched holes
    const rows = []; for (let y = FIRST; y <= D2 - 4; y += RULE) rows.push(K.lineOnTop([-W2, y], [W2, y], PZ, P));
    out.push(`<path d="${rows.join("")}" fill="none" stroke="#9fc4e6" stroke-width=".8"/>`);
    out.push(`<path d="${K.lineOnTop([MARGIN, -D2], [MARGIN, D2], PZ, P)}" fill="none" stroke="#e07a6a" stroke-width=".9"/>`);
    out.push(`<path d="${COILS.map((x) => K.pathOf([[x - 1.6, HOLE - 1.6], [x + 1.6, HOLE - 1.6], [x + 1.6, HOLE + 1.6], [x - 1.6, HOLE + 1.6]].map(([a, b]) => K.iso([a, b, PZ], P)), true)).join("")}" fill="#5a6470" stroke="#3a434d" stroke-width=".4"/>`);
    return out.join("");
  }
  // Each coil: a wire ring round the top edge, through its hole; only the part outside the paper shows.
  function spiralSvg(P) {
    const k = K.cameraOf(P).k, cy = HOLE - 4.6, cz = PZ / 2 + 0.4, r = Math.hypot(HOLE - cy, PZ + 0.8 - cz), d = [];
    for (const x of COILS) {
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const a = -Math.PI / 2 + (i / 40) * Math.PI * 2, y = cy + Math.cos(a) * r, z = cz + Math.sin(a) * r, inPaper = y > -D2 && z < PZ + 0.6 && z > 0, x2 = x + (i / 40 - 0.5) * 2.4;
        if (!inPaper && z >= 0) pts.push(K.iso([x2, y, z], P)); else if (pts.length) { d.push(K.pathOf(pts)); pts.length = 0; }
      }
      if (pts.length) d.push(K.pathOf(pts));
    }
    return `<path d="${d.join("")}" fill="none" stroke="#3c3f45" stroke-width="${(1.7 * k).toFixed(2)}" stroke-linecap="round"/><path d="${d.join("")}" fill="none" stroke="#c7c9cd" stroke-width="${(0.7 * k).toFixed(2)}" stroke-linecap="round"/>`;
  }

  let clipN = 0;
  ISO.add({
    name: "notebook", title: "Spiral notebook", compare: "notebook 480 270 360 | Homework, Read page 12",
    about: "A spiral notebook open on a desk: a pencil writes the given lines on the ruled page, letter by letter.",
    line: "notebook cx cy width write=0..1 lab=1 lit=page|spiral|pencil |line, line",
    demo: { line: "notebook 480 280 360 write=0 | Homework, Read page 12", script: [{ set: {}, hold: 0.8 }, { set: { write: 1 }, hold: "settle" }, { set: { lit: "spiral" }, hold: 1.2 }] },
    make([cx, cy, size = 360], o, text, parent) {
      const lab = o.lab !== "0", W = size * 1.6, Hh = size * 1.0, id = `nb-${++clipN}`;
      const lines = (text || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 6);
      const { P, g } = ISO.frame([...K.boxCorners(DESK, -10, 0), [150, -30, 130]], cx, cy, W, Hh, { azimuth: 72, elevation: 48 }, parent);
      const mat = K.topMatrix([MARGIN + 4, 0], PZ + 0.05, P);
      g.innerHTML = DAILY.table(P, DESK) + `<g data-name="page">${bookSvg(P)}</g><g data-name="spiral">${spiralSvg(P)}</g>` +
        `<g transform="${mat}">${lines.map((s, i) => `<clipPath id="${id}-${i}"><rect x="-2" y="${FIRST + RULE * i - 9}" width="0" height="11"/></clipPath><text clip-path="url(#${id}-${i})" x="0" y="${FIRST + RULE * i - 1.2}" fill="#2b4f86" style="font:7px ${FONT}">${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`).join("")}</g>` +
        `<g data-name="pencil"></g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["page", "spiral", "pencil", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      const texts = [...g.querySelectorAll("text")], rects = [...g.querySelectorAll("clipPath rect")];
      const widths = texts.map((e, i) => { let v = 0; try { v = e.getComputedTextLength(); } catch {} return v || lines[i].length * 3.4; });
      const total = widths.reduce((a, b) => a + b, 0) + widths.length * 18;   // a little time to move to the next line
      const s = { write: ISO.clamp(ISO.num(o, "write", 1), 0, 1), want: ISO.clamp(ISO.num(o, "write", 1), 0, 1) };
      let lit = o.lit || "";
      // where the point is at progress f: the line, and how far along it
      const at = (f) => {
        let d = f * total;
        for (let i = 0; i < widths.length; i++) { if (d <= widths[i]) return [i, d, false]; d -= widths[i]; if (d <= 18) return [i, widths[i], d / 18]; d -= 18; }
        return [Math.max(0, widths.length - 1), widths.at(-1) || 0, false];
      };
      const draw = () => {
        const [li, x, hop] = at(s.write);
        rects.forEach((r, i) => w.attr(r, "width", (i < li ? widths[i] + 4 : i === li ? x + 1 : 0).toFixed(2)));
        // the pencil: its point on the line (lifted while it hops to the next one), leaning back and to the right
        const writing = s.write > 0.001 && s.write < 0.999 && lines.length;
        const nx = hop ? x + (0 - x) * ISO.ease(hop) : x, ny = FIRST + RULE * (li + (hop ? ISO.ease(hop) : 0)) - 1.6, lift = hop ? Math.sin(Math.PI * hop) * 5 : writing ? 0.1 + 0.4 * Math.abs(Math.sin(x * 0.9)) : 22;
        const tip = [MARGIN + 4 + nx, ny, PZ + 0.2 + lift], dir = G.unit3([-0.68, 0.22, -0.7]);
        const key = `${tip.map((v) => v.toFixed(1)).join(",")}`;
        w.rebuild(el.pencil, lines.length ? key : "", () => (lines.length ? DAILY.pencil(P, G.sub3(tip, G.mul3(dir, 175)), dir, YELLOW) : ""));
        w.rebuild(el.words, lab ? "1" : "", () => !lab ? "" : [
          ISO.word(K.iso([W2, D2, PZ], P), "ruled lines, 8 mm apart", "#1f4f8f", { anchor: "start", size: 13, dy: 14 }),
          ISO.word(K.iso([W2, -D2 - 8, PZ], P), "wire spiral", "#444", { anchor: "start", size: 13, dy: -4 }),
          ISO.word(K.iso([MARGIN, D2, PZ], P), "margin", "#b5402e", { anchor: "end", size: 12, dy: 14 })].join(""));
        const want = lit || (writing ? "pencil" : "");
        const groups = { page: [el.page], spiral: [el.spiral], pencil: [el.pencil] };
        w.light([el.page, el.spiral, el.pencil], (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.write !== undefined) s.want = ISO.clamp(+p.write || 0, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      // About 9 letters a second, a child's steady handwriting.
      g.update = (dt) => {
        const calm = ISO.still(), rate = (3.4 * 9) / Math.max(total, 1);
        s.write = calm ? s.want : Math.abs(s.want - s.write) <= rate * dt ? s.want : s.write + Math.sign(s.want - s.write) * rate * dt;
        draw();
        return s.write !== s.want;
      };
      g.readout = () => {
        const n = lines.join("").length, [li] = at(s.write);
        if (!lines.length) return "21 × 16 cm spiral notebook · lines 8 mm apart, a red margin 33 mm in";
        if (s.write >= 1) return `written: ${lines.length} line${lines.length > 1 ? "s" : ""}, ${n} letters · each line sits on a printed rule 8 mm below the last`;
        return s.write <= 0 ? "a blank page · the pencil is ready" : `writing line ${li + 1} of ${lines.length}`;
      };
      draw();
      return g;
    },
  });
})();
