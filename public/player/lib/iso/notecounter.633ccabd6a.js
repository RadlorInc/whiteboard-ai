// "notecounter cx cy k moved=0..100 value=1..100 on=0|1 lab=0 lit=body|hopper|rollers|stacker|display|keys" — a PART
// (batch 6, money): a banknote counting machine standing on a counter, its origin the counter point under its
// middle, its front toward the room (+y). 28 × 25 × 20 cm: a sloped hopper tray at the back with two side guides,
// where a pile of 100 generic notes leans; black feed rollers at its foot; a stacker pocket at the front where counted
// notes land; on the top a count window and START, ADD and CLEAR keys. moved = how many notes have gone through
// (hopper → stacker), at a real machine's pace of about 16 a second, the count window shows it, one note riffles
// through while it runs. set({ moved, value, on }). World: 1 = 1 cm. anchors: hopper stacker
(() => {
  const K = window.K, G = window.G;
  const HX = 14, YB = -12.5, YF = 12.5, HZ = 12, NW = 15, ND = 7, PY0 = -1.5, PZ0 = 12.4, PY1 = -11.5, PZ1 = 19.4;
  const CASE = ISO.tint("#e9ebee", ["#a2a7ae", "#b3b8be", "#c5c9ce", "#d7dadd"], "#3c4047");
  ISO.add({
    name: "notecounter", title: "Note counter (part)", compare: null,
    about: "A banknote counting machine, 28 × 25 × 20 cm: sloped hopper with guides, feed rollers, a stacker pocket at the front, a count window and keys; moved runs notes from the hopper to the stacker and the count follows. anchors: hopper stacker",
    line: "notecounter cx cy k moved=0..100 value=1..100 on=0|1 lab=0 lit=body|hopper|rollers|stacker|display|keys",
    demo: { line: "notecounter 470 410 13 moved=0 value=20 on=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "hopper" }, hold: 1 }, { set: { moved: 60, lit: "rollers" }, hold: "settle" }, { set: { moved: 100, lit: "stacker" }, hold: "settle" }, { set: { lit: "display" }, hold: 1.2 }, { set: { moved: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { moved: Math.round(A.num(o, "moved", 0, 0, 100)), value: Math.round(A.num(o, "value", 20, 1, 100)), on: o.on !== "0", lit: o.lit || "" };
      st.n = st.moved;
      const sl = Math.hypot(PY1 - PY0, PZ1 - PZ0), V = [0, (PY1 - PY0) / sl, (PZ1 - PZ0) / sl], N = [0, V[2], -V[1]];   // up the slope; the plate's normal (toward +y and up)
      const at = B.frame([0, PY0, PZ0], [1, 0, 0], N, V);   // u along x, w along the normal, y up the slope
      // the body: the lower case, the raised back that carries the hopper, the stacker pocket's mouth (dark)
      const back = ISO.prismX(P, [[YB, HZ], [PY0 + 1, HZ], [PY1 + 1, PZ1 - 0.6], [YB, PZ1 - 0.6]], -HX + 1, HX - 1, ["#a2a7ae", "#e3e5e8"], "#d7dadd", "#3c4047");
      const mouth = [[-8.5, YF, 1.6], [8.5, YF, 1.6], [8.5, YF, 8.4], [-8.5, YF, 8.4]];
      const body = B.box(P, [-HX, HX], [YB, YF], [0, HZ], CASE) + back + B.quad(P, mouth, "#2a2d31", "#14171a", 0.8) +
        B.free(P, [[[HX + 0.01, YB, 3], [HX + 0.01, YF, 3]]], "#8a8f96", 0.5) +
        `<g transform="${A.plane(P, [HX + 0.02, 2, 9.5], [0, -1, 0], [0, 0, -1])}">${[0.6, 1.4, 2.2, 3, 3.8].map((y) => `<path data-free d="M0.6 ${y}H8.4" stroke="#8a8f96" stroke-width="0.3" stroke-linecap="round"/>`).join("")}</g>`;
      // the hopper plate with its two guides, and the rollers in the feed slot at its foot
      const plate = B.obox(P, at, [-8.6, 8.6], [-0.3, 0], [0, sl], ISO.T.steel);
      const guide = (x) => B.obox(P, at, [x - 0.25, x + 0.25], [0, 3.2], [0.3, sl - 1], CASE);
      const rollers = B.box(P, [-8.6, 8.6], [PY0 - 0.3, PY0 + 1.6], [HZ - 0.01, HZ + 0.02], B.DARK, "lo") +
        [-5, 0, 5].map((x) => ISO.tinted(ISO.T.rubber, K.solidSvg(G.disc(-1.6, 1.6, 0.55, G.frameOf([x, PY0 + 0.8, HZ + 0.2], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }))).join("");
      // the top: the count window and three keys, in front of the hopper
      const LX0 = -12, LX1 = -1, LY0 = 4.5, LY1 = 10.5, id = B.id();
      const lcd = B.box(P, [LX0 - 0.5, LX1 + 0.5], [LY0 - 0.5, LY1 + 0.5], [HZ, HZ + 0.2], B.DARK) +
        `<g transform="${A.plane(P, [LX0, LY0, HZ + 0.21], [1, 0, 0], [0, 1, 0])}"><clipPath id="${id}"><rect width="${LX1 - LX0}" height="${LY1 - LY0}"/></clipPath><g clip-path="url(#${id})" data-part="lcd"></g></g>`;
      const keys = [["START", ISO.T.green, 1.5], ["ADD", ISO.T.steel, 5.5], ["CLEAR", ISO.T.red, 9.5]].map(([t2, c, x]) =>
        B.box(P, [x, x + 3], [6, 9], [HZ, HZ + 0.5], c) + B.face(P, [x + 1.5, 7.8, HZ + 0.51], [1, 0, 0], [0, -1, 0], t2, 0.6, "#26292e")).join("");
      // the stacker: inside the pocket, seen through its mouth only (the counted pile and the note coming in)
      const sid = B.id();
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 0.5, y: YB - 0.5, w: 2 * HX + 1, d: YF - YB + 1, r: 1 }, 0, PZ1, P)}"/>` +
        `<g data-name="body">${body}</g><g data-name="stacker"><clipPath id="${sid}"><path d="${K.pathOf(mouth.map((p) => K.iso(p, P)), true)}"/></clipPath><g clip-path="url(#${sid})">` +
        `${B.box(P, [-8.5, 8.5], [3, YF], [1.2, 1.6], B.GREY, "lo")}<g data-part="stack"></g></g></g>` +
        `<g data-name="rollers">${rollers}</g><g data-name="hopper">${plate}${guide(-8.3)}<g data-part="pile"></g>${guide(8.3)}</g>` +
        `<g data-name="display">${lcd}</g><g data-name="keys">${keys}</g><g data-part="words"></g>`;
      g.anchors = { hopper: at(0, 0, ND / 2), stacker: [0, 8.5, 1.6] };
      const el = B.parts(g), w = ISO.writer();
      const draw = () => {
        const n = st.n, done = Math.floor(n + 1e-6), left = 100 - done, run = n !== st.moved;
        // the hopper pile: left notes leaning on the plate, the top note's art
        w.rebuild(el.pile, `${left} ${st.value}`, () => {
          if (left <= 0) return "";
          const h = left * B.NOTE_T;
          return B.obox(P, at, [-NW / 2, NW / 2], [0, h], [0.3, 0.3 + ND], B.noteTint(st.value), "lo") + `<g transform="${A.plane(P, at(-NW / 2, h + 0.003, 0.3 + ND), [1, 0, 0], V.map((q) => -q))}">${A.note(NW, ND, st.value)}</g>`;
        });
        // the stacker pile and, while it runs, the next note sliding in over it from the back of the pocket
        const slide = run ? n - done : 0, qs = Math.round(slide * 20) / 20;
        w.rebuild(el.stack, `${done} ${qs} ${st.value}`, () => {
          let s = B.stack(P, [0, 8.2, 1.6], done, st.value, { w: NW, d: ND });
          if (run) s += `<g transform="${A.plane(P, [-NW / 2, 1 + qs * 3.7, 1.6 + done * B.NOTE_T + 0.25], [1, 0, 0], [0, 1, 0])}">${A.note(NW, ND, st.value)}</g>`;
          return s;
        });
        w.rebuild(el.lcd, `${st.on} ${done}`, () => st.on ? `<rect width="${LX1 - LX0}" height="${LY1 - LY0}" fill="#bfe3b0"/>${B.digits(LX1 - LX0 - 0.6, LY1 - LY0 - 1.2, String(done), 3.2, "#1f3a18", "#a9cf9a", 3)}${A.text(0.5, 1.1, "COUNT", 0.8, "#1f3a18", "start", 800)}` : `<rect width="${LX1 - LX0}" height="${LY1 - LY0}" fill="#3a4038"/>`);
        if (lab) w.rebuild(el.words, "w", () => B.word(P, [HX, YB, PZ1], "note counter"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.moved !== undefined) st.moved = Math.round(A.num(p, "moved", st.moved, 0, 100));
        if (p.value !== undefined) st.value = Math.round(A.num(p, "value", st.value, 1, 100));
        if (p.on !== undefined) st.on = p.on !== "0" && p.on !== 0;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        // counting runs at about 16 notes a second; putting the notes back (moved goes down) is quick
        if (ISO.still()) st.n = st.moved;
        else { const d = st.moved - st.n; st.n = Math.abs(d) < 1e-3 ? st.moved : st.n + Math.sign(d) * Math.min(Math.abs(d), dt * (d > 0 ? 16 : 60)); }
        draw();
        return st.n !== st.moved;
      };
      g.readout = () => `note counter · ${st.moved} of 100 notes counted = ${st.moved * st.value} · ${100 - st.moved} left in the hopper`;
      draw();
      return g;
    },
  });
})();
