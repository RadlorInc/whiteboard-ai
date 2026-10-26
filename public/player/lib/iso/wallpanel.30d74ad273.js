// "wallpanel cx cy k w=40..300 h=60..260 see=0|1 lab=0 lit=wall|studs|baseboard" — a PART (PARTS.md): a piece of a
// framed interior wall, cut out of the room. Its origin is the wall face at the floor, in the middle (0, 0, 0); it spans
// x ±w/2 and z 0..h, the painted face is the plane y = 0 and the wall goes back into −y. Inside: 2×4 studs (really
// 3.8 × 8.9 cm) standing 16 in (40.6 cm) apart centre to centre on a bottom plate, ½ in (1.27 cm) drywall screwed to
// both faces, its sheet joints (every 4 ft, over a stud) taped, a painted baseboard nailed into the studs. The drywall
// screw heads show faintly in columns over each stud. The cut edges show the drywall's thickness, its paper faces and
// the studs' end grain. see=1 makes the front drywall see-through; set({ see }). World units: 1 = 1 cm.
(() => {
  const K = window.K, L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const OC = 40.64, SW = 3.8, SD = 8.9, DW = 1.27, BP = 3.8, SHEET = 121.92, BB = 9, BT = 1.4;
  const WALL = ISO.tint("#f4f2ed", ["#cfccc4", "#d9d6ce", "#e3e0d8", "#ecebe5"], "#7a776f"), WOOD = ISO.T.wood;
  const path = (P, pts, closed) => K.pathOf(pts.map((p) => K.iso(p, P)), closed);
  // the baseboard's profile in (y, z): flat back on the wall, a flat face, an eased top bead
  const BASE = [[0, 0], [BT, 0], [BT, 7.2], [1.15, 8.1], [0.7, 8.7], [0, BB]];
  const studsOf = (w) => { const out = []; for (let n = -10; n <= 10; n++) { const x = n * OC, a = Math.max(-w / 2, x - SW / 2), b = Math.min(w / 2, x + SW / 2); if (b - a > 0.4) out.push([a, b, x]); } return out; };

  // behind the face: the back sheet, the bottom plate, the studs (far −x first), a doubled top plate on a full wall
  function frameSvg(P, w, h) {
    const x0 = -w / 2, x1 = w / 2, yb = -DW - SD, out = [];
    out.push(ISO.tinted(WALL, ISO.wbox(P, [x0, x1], [yb - DW, yb], [1, h], "mid")));
    const top = h >= 240, zs = top ? h - 2 * BP : h;
    const wood = [ISO.wbox(P, [x0, x1], [yb, -DW], [0, BP], "mid")];
    const ends = [];
    for (const [a, b, x] of studsOf(w)) {
      wood.push(ISO.wbox(P, [a, b], [yb, -DW], [BP, zs], "mid"));
      // end grain on a cut top: two growth-ring arcs across the stud, each from one long edge to the other
      if (!top) for (const r of [5.5, 7.5]) {
        const pts = []; for (let i = 0; i <= 8; i++) { const y = yb + (SD * i) / 8, dx = Math.sqrt(Math.max(0, r * r - (y - (yb + SD / 2)) ** 2)); pts.push([x - SW / 2 - 3.6 + dx * 0.5 + 1.2, y, h]); }
        if (pts.every(([px]) => px > a && px < b)) ends.push(path(P, pts));
      }
    }
    if (top) wood.push(ISO.wbox(P, [x0, x1], [yb, -DW], [h - 2 * BP, h - BP], "mid"), ISO.wbox(P, [x0, x1], [yb, -DW], [h - BP, h], "mid"));
    out.push(ISO.tinted(WOOD, wood.join("") + L(ends.join(""), { tone: "lo" })));
    // the plate's nails up into each stud, seen on the plate's top beside it
    out.push(D(studsOf(w).filter(([a, b]) => b - a > SW - 0.1).map(([, , x]) => K.iso([x + SW / 2 + 1.2, yb + SD / 2, BP], P)), { size: 0.45 * K.cameraOf(P).k, tone: "mid" }));
    return out.join("");
  }
  // the front sheet: paint, the taped joints, the screw heads over the studs, its cut edge (paper, gypsum, paper)
  function faceSvg(P, w, h) {
    const x0 = -w / 2, x1 = w / 2, out = [ISO.tinted(WALL, ISO.wbox(P, [x0, x1], [-DW, 0], [1, h], "mid"))];
    const tape = [];
    for (let m = -3; m <= 3; m++) {
      const x = m * SHEET, a = Math.max(x0, x - 7), b = Math.min(x1, x + 7);
      if (b - a > 1) tape.push(path(P, [[a, 0.01, 1], [b, 0.01, 1], [b, 0.01, h], [a, 0.01, h]], true));
    }
    out.push(`<path d="${tape.join("")}" fill="#e9e6de" fill-opacity=".7"/>`);
    const heads = [], r = Math.max(0.6, 0.55 * K.cameraOf(P).k);
    for (const [a, b, x] of studsOf(w)) if (x > x0 + 1 && x < x1 - 1 && b - a > 1) for (let z = 15; z < h - 4; z += 30.5) heads.push(K.iso([x, 0.02, z], P));
    out.push(`<g style="--anatomy-dot:#8f8b80">${D(heads, { size: r, tone: "lo" })}</g>`);
    // the cut edge at +x and along the top: a paper skin on each face of the gypsum core
    const skin = [-0.12, -DW + 0.12];
    out.push(L(skin.map((y) => path(P, [[x1, y, 1], [x1, y, h]])).join("") + skin.map((y) => path(P, [[x0, y, h], [x1, y, h]])).join(""), { tone: "faint" }));
    return out.join("");
  }
  // the baseboard: profiled, painted, two finish nails into each stud
  function baseSvg(P, w) {
    const out = [ISO.prismX(P, BASE, -w / 2, w / 2, ["#d6d4cc", "#f7f6f1"], "#efeee8", "#7a776f")];
    const nails = [];
    for (const [a, b, x] of studsOf(w)) if (b - a > SW - 0.1) for (const z of [2.2, 6.4]) nails.push(K.iso([x, BT + 0.01, z], P));
    out.push(`<g style="--anatomy-dot:#6f6c64">${D(nails, { size: Math.max(0.3, 0.2 * K.cameraOf(P).k), tone: "mid" })}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "wallpanel", title: "Wall panel (part)", compare: null,
    about: "A piece of a painted interior wall: ½ in drywall screwed to 2×4 studs 16 in (40.6 cm) apart, a baseboard along the floor; see=1 shows the studs through it; a part to place in any scene, its face is y = 0. anchors: —",
    line: "wallpanel cx cy k w=40..300 h=60..260 see=0|1 lab=0 lit=wall|studs|baseboard",
    demo: { line: "wallpanel 480 445 1.6 w=160 h=200 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { see: 1 }, hold: "settle" }, { set: { lit: "studs" }, hold: 1.5 }, { set: { see: 0, lit: "baseboard" }, hold: "settle" }] },
    make([cx = 480, cy = 445, k = 1.6], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const w = ISO.clamp(ISO.num(o, "w", 160), 40, 300), h = ISO.clamp(ISO.num(o, "h", 200), 60, 260);
      g.innerHTML = `<g data-name="studs">${frameSvg(P, w, h)}</g><g data-name="wall">${faceSvg(P, w, h)}</g><g data-name="baseboard">${baseSvg(P, w)}</g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), face = q("wall"), words = q("words"), wr = ISO.writer();
      const parts = [...g.querySelectorAll("[data-name]")];
      let see = +(o.see === "1"), goal = see, lit = o.lit || "";
      const draw = () => {
        wr.attr(face, "opacity", (1 - 0.8 * see).toFixed(3));
        wr.rebuild(words, lab ? String(see > 0.5) : "", () => {
          if (!lab) return "";
          const st = studsOf(w).filter(([a, b]) => b - a > SW - 0.1).at(-1);
          return ISO.word(K.iso([w / 2, 0, h * 0.75], P), "drywall", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') +
            ISO.word(K.iso([w / 2, BT, BB], P), "baseboard", "#444", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') +
            (see > 0.5 && st ? ISO.word(K.iso([st[2], 0, h * 0.5], P), "stud", "#7a5a2e", { size: 13, anchor: "start", dy: 0 }).replace('x="', 'dx="8" x="') : "");
        });
        wr.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.see !== undefined) goal = +p.see ? 1 : 0; if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        see = ISO.follow(see, goal, dt, 0.3, ISO.still());
        if (Math.abs(see - goal) < 0.004) see = goal;
        draw();
        return see !== goal;
      };
      g.readout = () => (see > 0.5 ? "studs 16 in (40.6 cm) apart · each 2×4 is really 3.8 × 8.9 cm · screw into a stud, not the drywall" : `painted wall · ½ in (1.27 cm) drywall on 2×4 studs · ${Math.round(w)} × ${Math.round(h)} cm`);
      draw();
      return g;
    },
  });
})();
