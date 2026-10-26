// "brickwall cx cy k w=100..300 h=60..200 aim=x|y move=-500..500 lab=0 lit=bricks|footing|coping" — a PART (PARTS.md,
// batch 5): a free-standing brick garden wall, its origin the ground point under its middle. A concrete footing 30 cm
// wide showing 10 cm above the ground, a one-brick (21.5 cm) wall in English bond (a course of stretchers, then a
// course of headers, a queen closer at the end), 1 cm mortar joints that run round the corner onto the end, a black
// damp-proof course in the third bed joint, bricks a little different in colour, and a concrete coping on top in
// 60 cm lengths. aim=x: it runs along x, its face toward +y; aim=y: it runs along y, its face toward +x (across a
// bench's axis: an echo wall, a wall in front of a periscope). set({ move }) slides it along its face's normal
// (cm, eased), to set a distance. Bricks 215 × 102.5 × 65 mm. World units: 1 = 1 cm. anchors: face top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const BRICK = ISO.tint("#d27a5c", ["#93432e", "#a44f37", "#b55c42", "#c46a4e"], "#4e1f12");
  const CONC = ISO.tint("#d9d7d1", ["#9a9891", "#a8a69f", "#b6b4ad", "#c4c2bb"], "#4f4d47");
  const T = 21.5, FH = 10, FT = 30, CH = 5, CO = 2.5, C = 7.5, BL = 22.5, HD = 11.25, QC = 5.6;
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };

  function wallSvg(P, L, n, aimY, lab) {
    const at = aimY ? (u, v, z) => [v, u, z] : (u, v, z) => [u, v, z], box = (U, V, Z, tone) => ISO.box(at, P, U, V, Z, tone);
    const iso = (u, v, z) => K.iso(at(u, v, z), P), u0 = -L / 2, u1 = L / 2, zt = FH + n * C, out = [];
    const halo = aimY ? { x: -FT / 2, y: u0 - 5, w: FT, d: L + 10, r: 2 } : { x: u0 - 5, y: -FT / 2, w: L + 10, d: FT, r: 2 };
    out.push(`<path class="iso-halo" d="${K.haloOf(halo, 0, zt + CH, P)}"/>`);
    // the footing, speckled (aggregate) on its face
    const sp = []; for (let i = 0; i < Math.round(L / 3); i++) sp.push(iso(u0 - 5 + hash(i, 1) * (L + 10), FT / 2 + 0.02, 1 + hash(i, 2) * (FH - 2)));
    out.push(`<g data-name="footing">${ISO.tinted(CONC, box([u0 - 5, u1 + 5], [-FT / 2, FT / 2], [0, FH], "mid"))}${D(sp, { size: 0.3, tone: "faint" })}</g>`);
    // the brickwork: one block, then the bricks' colour (a few darker or lighter, on both faces we see), then the joints
    const tints = [[], [], []], f = T / 2 + 0.02, rect = (pts) => K.pathOf(pts, true);
    const bricksOf = (row, cuts, face) => {   // cuts: joint positions across a course; face: "front" (v = T/2) or "end" (u = u1)
      const z0 = FH + row * C + 0.5, z1 = FH + (row + 1) * C - 0.5;
      for (let i = 0; i + 1 < cuts.length; i++) {
        const a = cuts[i] + 0.5, b = cuts[i + 1] - 0.5, hv = hash(row * 7 + (face === "end" ? 3 : 0), i);
        if (b - a < 0.6 || hv < 0.55) continue;
        const k = hv < 0.75 ? 0 : hv < 0.92 ? 1 : 2;
        tints[k].push(rect(face === "end" ? [iso(u1 + 0.02, a, z0), iso(u1 + 0.02, b, z0), iso(u1 + 0.02, b, z1), iso(u1 + 0.02, a, z1)] : [iso(a, f, z0), iso(b, f, z0), iso(b, f, z1), iso(a, f, z1)]));
      }
    };
    const beds = [], dpc = [], perps = [];
    for (let row = 0; row < n; row++) {
      const z0 = FH + row * C, z1 = z0 + C, stretch = row % 2 === 0, cuts = [u0];
      if (stretch) for (let u = u0 + BL; u < u1 - 2; u += BL) cuts.push(u);
      else { cuts.push(u0 + HD); for (let u = u0 + HD + QC; u < u1 - 2; u += HD) cuts.push(u); }
      cuts.push(u1);
      bricksOf(row, cuts, "front");
      bricksOf(row, stretch ? [-T / 2, 0, T / 2] : [-T / 2, T / 2], "end");
      for (const u of cuts.slice(1, -1)) perps.push(K.pathOf([iso(u, f, z0), iso(u, f, z1)]));
      if (stretch) perps.push(K.pathOf([iso(u1 + 0.02, 0, z0), iso(u1 + 0.02, 0, z1)]));   // the two stretcher ends on the return
      if (row > 0) (row === 3 ? dpc : beds).push(K.pathOf([iso(u0, f, z0), iso(u1, f, z0), iso(u1, -T / 2, z0)]));
    }
    const sw = Math.max(0.5, G.scaleOf(P) * 0.9).toFixed(2);
    out.push(`<g data-name="bricks">${ISO.tinted(BRICK, box([u0, u1], [-T / 2, T / 2], [FH, zt], "mid"))}` +
      `<path d="${tints[0].join("")}" fill="#5a2416" fill-opacity=".14"/><path d="${tints[1].join("")}" fill="#fff4ea" fill-opacity=".16"/><path d="${tints[2].join("")}" fill="#3a170d" fill-opacity=".26"/>` +
      `<path d="${beds.join("")}${perps.join("")}" fill="none" stroke="#e4d9c8" stroke-width="${sw}" stroke-linecap="butt" stroke-linejoin="miter"/>` +
      `<path d="${dpc.join("")}" fill="none" stroke="#2c2a28" stroke-width="${sw}" stroke-linejoin="miter"/></g>`);
    // the coping: concrete lengths of 60 cm, overhanging 2.5 cm each side; the joints go over the top and down the face
    const cj = [], tc = T / 2 + CO;
    for (let u = u0 - CO + 60; u < u1 + CO - 10; u += 60) cj.push(K.pathOf([iso(u, -tc, zt + CH), iso(u, tc, zt + CH), iso(u, tc, zt)]));
    out.push(`<g data-name="coping">${ISO.tinted(CONC, box([u0 - CO, u1 + CO], [-tc, tc], [zt, zt + CH], "hi"))}${K.lineSvg(cj.join(""), { tone: "lo" })}</g>`);
    out.push(`<g data-part="words">${lab ? ISO.word(iso(u1, T / 2, zt + CH + 4), "brick wall", "#8f2a22", { size: 14, anchor: "start" }) : ""}</g>`);
    return { svg: out.join(""), zt };
  }

  ISO.add({
    name: "brickwall", title: "Brick wall (part)", compare: null,
    about: "A free-standing brick wall in English bond on a concrete footing, with mortar joints, a damp-proof course and a concrete coping; runs along x or y, slides to set a distance (an echo wall, a wall to see over). anchors: face top",
    line: "brickwall cx cy k w=100..300 h=60..200 aim=x|y move=-500..500 lab=0 lit=bricks|footing|coping",
    demo: { line: "brickwall 470 420 1.7 w=300 h=200 aim=x lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "bricks" }, hold: 1.2 }, { set: { move: -40, lit: "coping" }, hold: "settle" }, { set: { move: 0, lit: "footing" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 2], o, t, parent) {
      const LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", aimY = o.aim === "y";
      const L = ISO.clamp(ISO.num(o, "w", 300), 100, 300), n = Math.max(6, Math.round((ISO.clamp(ISO.num(o, "h", 200), 60, 200) - FH - CH) / C));
      const st = { move: ISO.clamp(ISO.num(o, "move", 0), -500, 500) }, want = { move: st.move };
      let lit = o.lit || "";
      const wall = wallSvg(P, L, n, aimY, lab), H = wall.zt + CH, nrm = aimY ? [1, 0, 0] : [0, 1, 0];
      g.innerHTML = `<g data-part="move">${wall.svg}</g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        w.attr(el.move, "transform", K.translateAlong(P, nrm.map((c) => c * st.move)));
        const d = +st.move.toFixed(3), f = T / 2 + d;
        g.anchors = { face: aimY ? [f, 0, H / 2] : [0, f, H / 2], top: aimY ? [d, 0, H] : [0, d, H] };
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.move !== undefined && Number.isFinite(+p.move)) want.move = ISO.clamp(+p.move, -500, 500);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.move = ISO.follow(st.move, want.move, dt, 0.5, ISO.still());
        if (Math.abs(st.move - want.move) < 0.05) st.move = want.move;
        draw();
        return st.move !== want.move;
      };
      g.readout = () => `brick wall ${L} × ${H.toFixed(0)} cm, ${T} cm thick, English bond, ${n} courses${st.move ? ` · moved ${st.move.toFixed(0)} cm` : ""}`;
      draw();
      return g;
    },
  });
})();
