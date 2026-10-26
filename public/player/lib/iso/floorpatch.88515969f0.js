// "floorpatch cx cy k w=40..400 d=30..300 wet=0..1 lab=0 lit=floor|puddle" — a PART (PARTS.md): a piece of a room's
// floor. Its origin is the floor surface at the wall line, in the middle (0, 0, 0); it spans x ±w/2 and runs y 0..d into
// the room. ¾ in (1.9 cm) solid oak strip flooring, 8.3 cm (3¼ in) boards laid along the wall with their butt joints
// staggered row to row, tongue-and-groove (seen on the cut end), over an 18 mm plywood subfloor. wet = a flat glossy
// puddle of water with a highlight and a damp rim round it; it shrinks as wet → 0 (it dries). set({ wet }).
// World units: 1 = 1 cm (x along the wall, y into the room, z up; the floor surface is z = 0).
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s);
  const PT = 1.9, SUB = 1.8, ROW = 8.3;
  const OAK = ISO.tint("#ecd3a8", ["#b98a52", "#c79b62", "#d3ab74", "#dfbc88"], "#6b4a22");
  const PLY = ISO.tint("#e9d6b0", ["#bfa274", "#cbb083", "#d6bd93", "#e0caa4"], "#6e5a36");
  const TONES = ["#e9cea0", "#e3c494", "#eed8b2", "#dcbb88"];
  const path = (P, pts, closed) => K.pathOf(pts.map((p) => K.iso(p, P)), closed);
  // a fixed pseudo-random sequence, so the same floor always has the same joints
  const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // each row: its y span and its pieces [x0, x1, tone], butt joints staggered at least 15 cm from the last row's
  function rowsOf(w, d) {
    const rows = [];
    let prev = [];
    for (let r = 0, y = 0; y < d - 0.3; r++, y += ROW) {
      const y1 = Math.min(d, y + ROW), xs = [-w / 2];
      let x = -w / 2 + 20 + rnd(r * 7 + 1) * 70, guard = 0;
      while (x < w / 2 - 12 && guard++ < 40) {
        if (prev.every((p) => Math.abs(p - x) > 15)) xs.push(x);
        x += 45 + rnd(r * 13 + xs.length * 3) * 95;
      }
      xs.push(w / 2);
      rows.push({ y0: y, y1, pieces: xs.slice(0, -1).map((a, i) => [a, xs[i + 1], Math.floor(rnd(r * 31 + i * 5) * 4)]) });
      prev = xs.slice(1, -1);
    }
    return rows;
  }
  function floorSvg(P, w, d) {
    const x0 = -w / 2, x1 = w / 2, rows = rowsOf(w, d), out = [];
    out.push(ISO.tinted(PLY, ISO.wbox(P, [x0, x1], [0, d], [-PT - SUB, -PT], "lo")));
    // plywood plies on its two cut faces, each from end to end
    const plies = [-PT - SUB * 0.33, -PT - SUB * 0.66];
    out.push(ISO.tinted(PLY, L(plies.map((z) => path(P, [[x0, d + 0.01, z], [x1, d + 0.01, z]]) + path(P, [[x1 + 0.01, 0, z], [x1 + 0.01, d, z]])).join(""), { tone: "lo" })));
    out.push(ISO.tinted(OAK, ISO.wbox(P, [x0, x1], [0, d], [-PT, 0], "mid")));
    // the boards' tops in four oak tones, then the grain from butt joint to butt joint, then the seams and joints
    const fills = TONES.map(() => []), grain = [], seams = [], joints = [];
    rows.forEach(({ y0, y1, pieces }, r) => {
      if (r) seams.push(path(P, [[x0, y0, 0], [x1, y0, 0]]));
      pieces.forEach(([a, b, tone], i) => {
        fills[tone].push(path(P, [[a, y0, 0.005], [b, y0, 0.005], [b, y1, 0.005], [a, y1, 0.005]], true));
        if (i) joints.push(path(P, [[a, y0, 0], [a, y1, 0]]));
        for (const f of [0.3, 0.62].slice(0, y1 - y0 > 3 ? 2 : 0)) {
          const y = y0 + (y1 - y0) * (f + 0.08 * rnd(r * 3 + i)), pts = [];
          for (let j = 0; j <= 10; j++) { const x = a + (b - a) * (j / 10); pts.push([x, y + 0.35 * Math.sin(x * 0.09 + r + i) * (y1 - y0) / ROW, 0]); }
          grain.push(path(P, pts));
        }
      });
    });
    out.push(fills.map((f, i) => (f.length ? `<path d="${f.join("")}" fill="${TONES[i]}"/>` : "")).join(""));
    out.push(ISO.tinted(OAK, `<path d="${grain.join("")}" fill="none" stroke="#a5804e" stroke-width="0.35" stroke-opacity=".45"/>` + L(seams.join("") + joints.join(""), { tone: "lo" })));
    // the cut end (x = w/2): each seam is a tongue in a groove; the front cut (y = d): the last row's butt joints
    const tg = rows.slice(1).map(({ y0 }) => path(P, [[x1 + 0.01, y0, -PT], [x1 + 0.01, y0, -1.2], [x1 + 0.01, y0 + 0.6, -1.2], [x1 + 0.01, y0 + 0.6, -0.6], [x1 + 0.01, y0, -0.6], [x1 + 0.01, y0, 0]]));
    const last = rows.at(-1), front = last.pieces.slice(1).map(([a]) => path(P, [[a, d + 0.01, -PT], [a, d + 0.01, 0]]));
    out.push(ISO.tinted(OAK, L(tg.join("") + front.join(""), { tone: "lo" })));
    return out.join("");
  }
  // the puddle: a flat blob of water (radius R), a damp darker rim, two highlights
  function puddleSvg(P, c, R) {
    if (R < 0.3) return "";
    const blob = (s, dx = 0, dy = 0, n = 40) => Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2, r = R * s * (1 + 0.16 * Math.sin(2 * a + 1) + 0.09 * Math.sin(3 * a + 2.3) + 0.05 * Math.sin(5 * a + 0.4));
      return [c[0] + dx + Math.cos(a) * r * 1.25, c[1] + dy + Math.sin(a) * r * 0.85, 0.03];
    });
    const hi = (s, dx, dy) => Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [c[0] + dx + Math.cos(a) * R * s * 1.4, c[1] + dy + Math.sin(a) * R * s * 0.28, 0.04]; });
    return `<path d="${path(P, blob(1.13), true)}" fill="#6b4a22" fill-opacity=".14"/>` +
      `<path d="${path(P, blob(1), true)}" fill="#a6c6de" fill-opacity=".6" stroke="#5d7f96" stroke-width="0.7" stroke-opacity=".7"/>` +
      `<path d="${path(P, blob(0.72, R * 0.06, R * 0.05), true)}" fill="#d9e7f0" fill-opacity=".45"/>` +
      `<path d="${path(P, hi(0.3, -R * 0.25, -R * 0.38), true)}" fill="#ffffff" fill-opacity=".85"/>` +
      `<path d="${path(P, hi(0.12, R * 0.35, -R * 0.3), true)}" fill="#ffffff" fill-opacity=".7"/>`;
  }

  ISO.add({
    name: "floorpatch", title: "Floor patch (part)", compare: null,
    about: "A piece of oak strip floor running out from the wall (¾ in boards over a plywood subfloor), with a water puddle that dries up as wet goes to 0; a part to place in any scene, its surface is z = 0. anchors: puddle",
    line: "floorpatch cx cy k w=40..400 d=30..300 wet=0..1 lab=0 lit=floor|puddle",
    demo: { line: "floorpatch 500 195 2.2 w=220 d=150 wet=1 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { wet: 0.4 }, hold: "settle" }, { set: { wet: 0, lit: "floor" }, hold: "settle" }, { set: { wet: 1, lit: "puddle" }, hold: "settle" }] },
    make([cx = 500, cy = 195, k = 2.2], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const w = ISO.clamp(ISO.num(o, "w", 220), 40, 400), d = ISO.clamp(ISO.num(o, "d", 150), 30, 300);
      const c = [w * 0.08, d * 0.55, 0], R0 = Math.min(32, Math.min(w, d) * 0.26);
      g.innerHTML = `<g data-name="floor">${floorSvg(P, w, d)}</g><g data-name="puddle"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { puddle: q("puddle"), words: q("words") }, wr = ISO.writer();
      const parts = [...g.querySelectorAll("[data-name]")];
      g.anchors = { puddle: c };
      let wet = ISO.clamp(ISO.num(o, "wet", 0), 0, 1), goal = wet, lit = o.lit || "";
      const draw = () => {
        wr.rebuild(el.puddle, wet.toFixed(3), () => puddleSvg(P, c, R0 * Math.sqrt(wet)));
        wr.rebuild(el.words, lab ? String(wet > 0.3) : "", () => !lab ? "" :
          ISO.word(K.iso([w / 2, d, 0], P), "oak floor", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') +
          (wet > 0.3 ? ISO.word(K.iso([c[0] + R0 * 1.3, c[1], 0], P), "water", "#33506f", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="6" x="') : ""));
        wr.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.wet !== undefined) goal = ISO.clamp(+p.wet, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      // a puddle dries in minutes; the board shows it in about two seconds (eased)
      g.update = (dt) => {
        wet = ISO.follow(wet, goal, dt, 0.5, ISO.still());
        if (Math.abs(wet - goal) < 0.003) wet = goal;
        draw();
        return wet !== goal;
      };
      g.readout = () => (wet > 0.01 ? `water on the floor · puddle about ${Math.round(2 * R0 * Math.sqrt(wet) * 1.25)} cm across · wipe it up before it soaks into the seams` : `oak strip floor · ¾ in (1.9 cm) boards, 3¼ in (8.3 cm) wide, over a plywood subfloor`);
      draw();
      return g;
    },
  });
})();
