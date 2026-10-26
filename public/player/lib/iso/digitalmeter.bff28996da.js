// "digitalmeter cx cy k mv=-199.9..199.9 lab=0 lit=case|display|sockets|knob" — a PART (PARTS.md, batch 5): the digital
// millivoltmeter of halleffect.js, standing on the bench, its origin the bench point under its middle, its front panel
// facing the room (+y). A case 15 × 10 × 6 cm on four rubber feet, a bezel and a dark LCD window with green digits
// (the unlit segments faint behind), "mV" beside them, a range knob (200 mV · 2 V · 20 V), a power switch, and a red
// + and black COM 4 mm socket (anchors plus, minus: the sockets' mouths, for wireleads). The reading follows mv the way
// a real meter settles, about three updates a second, to 0.1 mV; past ±199.9 it shows "1" (over range). set({ mv }).
// Built in mm (ISO.mm); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const HX = 75, HY = 50, HZ = 60, FY = HY, WIN = { x0: -62, x1: 22, z0: 26, z1: 50 };
  const CASE = ISO.tint("#e2e0d8", ["#9a978d", "#aca99f", "#bdbab1", "#cecbc3"], "#46443d");
  const DIGIT = "#7fe08a";

  ISO.add({
    name: "digitalmeter", title: "Digital millivoltmeter (part)", compare: null,
    about: "A digital millivoltmeter box: an LCD reading to 0.1 mV that settles to the voltage across its red + and black COM sockets, a range knob and a power switch; a bench part. anchors: plus minus",
    line: "digitalmeter cx cy k mv=-199.9..199.9 lab=0 lit=case|display|sockets|knob",
    demo: { line: "digitalmeter 480 360 30 mv=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { mv: 47, lit: "display" }, hold: 2.4 }, { set: { mv: -47 }, hold: 2.4 }, { set: { mv: 23.5, lit: "sockets" }, hold: 2.4 }, { set: { mv: 250, lit: "knob" }, hold: 2 }, { set: { mv: 0, lit: "case" }, hold: 2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const at = (x, z, y = FY) => K.iso([x, y, z], Pm), quad = (x0, x1, z0, z1, y) => K.pathOf([at(x0, z0, y), at(x1, z0, y), at(x1, z1, y), at(x0, z1, y)], true);
      const st = { mv: ISO.clamp(ISO.num(o, "mv", 0), -1000, 1000), shown: 0, tick: 0 };
      st.want = st.mv; st.shown = st.mv;
      let lit = o.lit || "";
      const face = (x, z, text, size, color, { y = FY + 1.3, font = "'Helvetica Neue',Arial,sans-serif", weight = 700, anchor = "middle" } = {}) =>
        LAB.faceText(Pm, [x, y, z], [1, 0, 0], text, size, color).replace(`style="font:700 ${size}px 'Helvetica Neue',Arial,sans-serif"`, `style="font:${weight} ${size}px ${font}"`).replace('text-anchor="middle"', `text-anchor="${anchor}"`);
      const Fy = (x, z) => LAB.A([x, FY, z], [0, 1, 0]);
      const feet = [[-HX + 12, -HY + 10], [HX - 12, -HY + 10], [-HX + 12, HY - 10], [HX - 12, HY - 10]].map(([x, y]) => S(K.cylinder(x, y, 5, 0, 3, Pm, 16), { tone: "lo" })).join("");
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 6 };
      const body = S(K.slabOf(plan, 3, HZ - 3, Pm, 6, 1.2), { tone: "mid", inner: L(K.sideSeam(plan, 18, Pm, 6), { tone: "faint" }) });
      const bezel = ISO.wbox(Pm, [WIN.x0 - 4, WIN.x1 + 4], [FY, FY + 1], [WIN.z0 - 4, WIN.z1 + 4], "lo");
      const glass = `<path d="${quad(WIN.x0, WIN.x1, WIN.z0, WIN.z1, FY + 1.05)}" fill="#14201a" stroke="#070b09" stroke-width="0.6"/>` +
        `<path d="${K.pathOf([at(WIN.x0 + 2, WIN.z1 - 1.5, FY + 1.1), at(WIN.x0 + 30, WIN.z1 - 1.5, FY + 1.1), at(WIN.x0 + 22, WIN.z1 - 7, FY + 1.1), at(WIN.x0 + 2, WIN.z1 - 7, FY + 1.1)], true)}" fill="#ffffff" fill-opacity=".07"/>`;
      const DZ = WIN.z0 + 6, mono = { font: "'Courier New',monospace", anchor: "end" };
      const ghosts = face(WIN.x1 - 14, DZ, "-188.8", 13, "#1f3a28", mono) + face(WIN.x1 - 3, DZ, "mV", 5, "#5fae6a", { anchor: "end" });
      // the sockets: red + and black COM, their names printed under them
      const sock = (x, red) => ISO.tinted(red ? ISO.T.red : ISO.T.rubber, S(G.disc(0, 4, 4.2, Fy(x, 14), Pm), { tone: "mid" })) + `<path d="${G.circleOf(Fy(x, 14), 4.02, 1.6, Pm)}" fill="#14171a"/>`;
      const sockets = sock(40, true) + sock(60, false) + face(40, 5, "+", 5, "#8f2a22") + face(60, 5, "COM", 3.6, "#46443d");
      // the range knob with its pointer on 200 mV and the marks round it, the power switch
      const kF = Fy(-30, 13), knob = ISO.tinted(ISO.T.rubber, S(G.disc(0, 7, 8, kF, Pm), { tone: "mid", inner: L(G.ribsOf(kF, 0.4, 6.6, 8, 18, Pm, { seams: true }), { tone: "faint" }) })) +
        `<path d="${K.pathOf([K.iso([-30, FY + 7.25, 13], Pm), K.iso([-34.5, FY + 7.25, 17.5], Pm)])}" stroke="#f2f2f2" stroke-width="1.2" stroke-linecap="round"/>` +
        face(-45, 20, "200m", 3, "#46443d") + face(-30, 24, "2", 3, "#46443d") + face(-15, 20, "20", 3, "#46443d");
      const power = ISO.tinted(ISO.T.plastic, ISO.wbox(Pm, [-6, 6], [FY, FY + 3], [8, 18], "mid")) + face(0, 3.5, "POWER", 3, "#46443d") + face(-58, 6, "RANGE", 3, "#46443d");
      const name = face(50, 44, "DIGITAL mV METER", 3.4, "#46443d");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, HZ, Pm)}"/>` +
        `<g data-name="case">${ISO.tinted(ISO.T.rubber, feet)}${ISO.tinted(CASE, body)}${name}${power}</g>` +
        `<g data-name="display">${ISO.tinted(CASE, bezel)}${glass}${ghosts}<g data-part="digits"></g></g><g data-name="sockets">${sockets}</g><g data-name="knob">${knob}</g><g data-part="words"></g>`;
      g.anchors = { plus: [4, (FY + 4) / 10, 1.4], minus: [6, (FY + 4) / 10, 1.4] };
      const el = LAB.parts(g), w = ISO.writer();
      const text = (v) => (Math.abs(v) > 199.95 ? (v < 0 ? "-1   " : "1   ") : v.toFixed(1));
      const draw = () => {
        const s = text(st.shown);
        w.rebuild(el.digits, s, () => face(WIN.x1 - 14, DZ, s, 13, DIGIT, mono));
        if (lab) w.rebuild(el.words, "1", () => LAB.word(Pm, lab, [0, 0, HZ + 10], "millivoltmeter", "#556"));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.mv !== undefined && p.mv !== "" && Number.isFinite(+p.mv)) st.want = ISO.clamp(+p.mv, -1000, 1000);
        if (p.lit !== undefined) lit = p.lit;
      };
      // the input settles smoothly; the display samples it three times a second, as a real meter's converter does
      g.update = (dt) => {
        const calm = ISO.still();
        st.mv = ISO.follow(st.mv, st.want, dt, 0.25, calm); if (Math.abs(st.mv - st.want) < 0.02) st.mv = st.want;
        st.tick += dt;
        if (calm || st.tick >= 0.33) { st.tick = 0; st.shown = st.mv; }
        draw();
        return st.shown !== st.want;
      };
      g.readout = () => (Math.abs(st.want) > 199.95 ? `millivoltmeter · over range on 200 mV (${st.want.toFixed(1)} mV): shows 1` : `millivoltmeter · ${st.want.toFixed(1)} mV between + and COM`);
      draw();
      return g;
    },
  });
})();
