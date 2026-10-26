// "gatetimer cx cy k t1=0..99 t2=0..99 lab=0 lit=case|display|sockets|buttons" — a PART (PARTS.md, batch 5): the
// two-gate timer of the free-fall experiment (freefall.js), standing on the bench, its origin the bench point under its
// middle, its front panel facing the room (+y). A grey case 15 × 10 × 6 cm on four rubber feet, a front bezel, a dark
// red-filtered LED window with two lines (gate A's time t1 and gate B's t2, in seconds to the millisecond, the unlit
// segments faint behind), a pair of 4 mm sockets for each gate (A, B), a start and a reset key, a mode knob and a
// power lamp. set({ t1, t2 }): the display counts up to each new time at true speed, as the real timer counts while
// it runs (0 = blank, "-.---"). World units: built in mm, anchors in cm: `a`, `b` = the middle of each gate's sockets.
(() => {
  const K = window.K, G = window.G;
  const HX = 75, HY = 50, HZ = 60, FY = HY, WIN = { x0: -62, x1: 22, z0: 25, z1: 50 };
  const CASE = ISO.tint("#d9dde1", ["#8d959d", "#a0a8b0", "#b4bbc2", "#c6ccd1"], "#3b434b");
  const DIGIT = "#ff5a3c";

  ISO.add({
    name: "gatetimer", title: "Two-gate timer (part)", compare: null,
    about: "A two-gate timer for light gates: its display shows the time at gate A and gate B to the millisecond, counting up as the ball falls; a bench part. anchors: a b",
    line: "gatetimer cx cy k t1=0..99 t2=0..99 lab=0 lit=case|display|sockets|buttons",
    demo: { line: "gatetimer 480 360 30 lab=1", script: [{ set: {}, hold: 1 }, { set: { t1: 0.202, lit: "display" }, hold: "settle" }, { set: { t2: 0.404 }, hold: "settle" }, { set: { lit: "sockets" }, hold: 1.2 }, { set: { t1: 0, t2: 0, lit: "buttons" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const at = (x, z, y = FY) => K.iso([x, y, z], Pm), quad = (x0, x1, z0, z1, y) => K.pathOf([at(x0, z0, y), at(x1, z0, y), at(x1, z1, y), at(x0, z1, y)], true);
      const st = { t: [ISO.clamp(ISO.num(o, "t1", 0), 0, 99), ISO.clamp(ISO.num(o, "t2", 0), 0, 99)] };
      st.want = [...st.t];
      let lit = o.lit || "";
      // text on the front panel (or a +y face at y): monospace for the digits
      const face = (x, z, text, size, color, { y = FY + 1.3, font = "'Helvetica Neue',Arial,sans-serif", weight = 700, anchor = "middle" } = {}) =>
        LAB.faceText(Pm, [x, y, z], [1, 0, 0], text, size, color).replace(`style="font:700 ${size}px 'Helvetica Neue',Arial,sans-serif"`, `style="font:${weight} ${size}px ${font}"`).replace('text-anchor="middle"', `text-anchor="${anchor}"`);
      const Fy = (x, z, y) => LAB.A([x, y, z], [0, 1, 0]);
      // the case, feet, bezel and window
      const feet = [[-HX + 12, -HY + 10], [HX - 12, -HY + 10], [-HX + 12, HY - 10], [HX - 12, HY - 10]].map(([x, y]) => S(K.cylinder(x, y, 5, 0, 3, Pm, 16), { tone: "lo" })).join("");
      const body = S(K.slabOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 6 }, 3, HZ - 3, Pm, 6, 1.2), { tone: "mid", inner: L(K.sideSeam({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 6 }, 18, Pm, 6), { tone: "faint" }) });
      const bezel = ISO.wbox(Pm, [WIN.x0 - 4, WIN.x1 + 4], [FY, FY + 1], [WIN.z0 - 4, WIN.z1 + 4], "lo");
      const glass = `<path d="${quad(WIN.x0, WIN.x1, WIN.z0, WIN.z1, FY + 1.05)}" fill="#2a1512" stroke="#120807" stroke-width="0.6"/>` +
        `<path d="${K.pathOf([at(WIN.x0 + 2, WIN.z1 - 1.5, FY + 1.1), at(WIN.x0 + 30, WIN.z1 - 1.5, FY + 1.1), at(WIN.x0 + 22, WIN.z1 - 7, FY + 1.1), at(WIN.x0 + 2, WIN.z1 - 7, FY + 1.1)], true)}" fill="#ffffff" fill-opacity=".07"/>`;
      const ghosts = [0, 1].map((i) => face(WIN.x1 - 4, WIN.z1 - 11 - i * 12, "8.888", 10, "#3d1c16", { font: "'Courier New',monospace", anchor: "end" })).join("") +
        [0, 1].map((i) => face(WIN.x0 + 5, WIN.z1 - 11 - i * 12, i ? "B" : "A", 6, "#c9a39a", { anchor: "start" })).join("");
      // the gate sockets: a red and a black 4 mm socket for each gate, with their printed names
      const sock = (x, z, red) => ISO.tinted(red ? ISO.T.red : ISO.T.rubber, S(G.disc(0, 4, 4.2, Fy(x, z, FY), Pm), { tone: "mid" })) + `<path d="${G.circleOf(Fy(x, z, FY), 4.02, 1.6, Pm)}" fill="#14171a"/>`;
      const sockets = [[-52, "A"], [-22, "B"]].map(([x, n]) => sock(x - 6, 13, true) + sock(x + 6, 13, false) + face(x, 4.5, `GATE ${n}`, 4.2, "#3b434b")).join("");
      // keys: start (green), reset (grey), the mode knob with its pointer and marks, the power lamp
      const key = (x, z, tint) => ISO.tinted(tint, S(G.disc(0, 3.5, 5, Fy(x, z, FY), Pm), { tone: "hi" }));
      const knobF = Fy(48, 16, FY), pointer = G.frameOf([48, FY + 7.2, 16], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
      const buttons = key(36, 44, ISO.T.green) + key(58, 44, ISO.T.steel) + face(36, 35.5, "START", 3.6, "#3b434b") + face(58, 35.5, "RESET", 3.6, "#3b434b") +
        ISO.tinted(ISO.T.rubber, S(G.disc(0, 7, 8, knobF, Pm), { tone: "mid", inner: L(G.ribsOf(knobF, 0.4, 6.6, 8, 18, Pm, { seams: true }), { tone: "faint" }) })) +
        `<path d="${K.pathOf([K.iso(G.pointOf(pointer, 0, 0, 0), Pm), K.iso([48 - 4.5, FY + 7.25, 16 + 4.5], Pm)])}" stroke="#f2f2f2" stroke-width="1.2" stroke-linecap="round"/>` +
        face(34, 24, "A→B", 3.2, "#3b434b") + face(62, 24, "A", 3.2, "#3b434b") + face(64, 6, "MODE", 3.2, "#3b434b");
      const lamp = S(G.disc(0, 2, 2.6, Fy(30, 50, FY), Pm), { tone: "hi" });
      const name = face(-20, 59, "TWO-GATE TIMER", 3.4, "#3b434b");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 6 }, 0, HZ, Pm)}"/>` +
        `<g data-name="case">${ISO.tinted(ISO.T.rubber, feet)}${ISO.tinted(CASE, body)}${name}<g style="${ISO.T.red}">${lamp}</g></g>` +
        `<g data-name="display">${ISO.tinted(CASE, bezel)}${glass}${ghosts}<g data-part="digits"></g></g><g data-name="sockets">${sockets}</g><g data-name="buttons">${buttons}</g><g data-part="words"></g>`;
      g.anchors = { a: [-5.2, (FY + 4) / 10, 1.3], b: [-2.2, (FY + 4) / 10, 1.3] };
      const el = LAB.parts(g), w = ISO.writer();
      const shown = (v) => (v > 0 ? Math.min(v, 9.999).toFixed(3) : "-.---");
      const draw = () => {
        const txt = st.t.map(shown);
        w.rebuild(el.digits, txt.join(" "), () => txt.map((s, i) => face(WIN.x1 - 4, WIN.z1 - 11 - i * 12, s, 10, DIGIT, { font: "'Courier New',monospace", anchor: "end" })).join(""));
        if (lab) w.rebuild(el.words, "1", () => LAB.word(Pm, lab, [0, 0, HZ + 10], "timer", "#556") + LAB.word(Pm, lab, [-37, FY, -6], "to the light gates", "#556", { dy: 12, size: 12 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        ["t1", "t2"].forEach((key, i) => { if (p[key] !== undefined && p[key] !== "" && Number.isFinite(+p[key])) { const v = ISO.clamp(+p[key], 0, 99); if (v !== st.want[i]) { st.want[i] = v; st.t[i] = 0; } } });
        if (p.lit !== undefined) lit = p.lit;
      };
      // it counts at true speed: each display runs from 0 up to its new time, then holds
      g.update = (dt) => {
        const calm = ISO.still();
        st.t = st.t.map((v, i) => (calm ? st.want[i] : Math.min(st.want[i], v + dt)));
        draw();
        return st.t.some((v, i) => v !== st.want[i]);
      };
      g.readout = () => {
        const [a, b] = st.want;
        return `two-gate timer · gate A ${a ? a.toFixed(3) + " s" : "—"} · gate B ${b ? b.toFixed(3) + " s" : "—"}${a && b ? ` · between the gates ${(b - a).toFixed(3)} s` : ""}`;
      };
      draw();
      return g;
    },
  });
})();
