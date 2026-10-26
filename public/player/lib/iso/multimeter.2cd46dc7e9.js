// "multimeter cx cy k value=-1999..1999 unit=V|A|mA|ohm|off leads=1|0 lab=0 lit=case|display|dial|sockets|leads"
// — a PART (PARTS.md, batch 5): the digital multimeter of rccircuit.js (the voltmeter across the capacitor), standing
// upright on the bench in its rubber holster, its front facing the room (+y), its origin the bench point under its
// middle. 8 × 4 × 15 cm: a yellow holster with corner bumpers, a dark front panel, a grey LCD (3½ digits, autoranging:
// 1.999 / 19.99 / 199.9 / 1999, "OL" past that) with the unit beside the digits, HOLD and RANGE buttons, a knurled
// rotary dial pointing at the unit (OFF · V⎓ · V~ · Ω · mA · A, printed round it), and three 4 mm sockets: 10A, COM,
// VΩmA. leads=1 plugs a red lead into VΩmA and a black one into COM, each running down to a probe lying on the bench in
// front (anchors red, black: the probe tips). The reading settles like a real meter, about three updates a second.
// set({ value, unit }). Anchors (cm): plus (the VΩmA socket), com (the COM socket), red, black. Built in mm.
(() => {
  const K = window.K, G = window.G, HX = 40, HY = 20, HZ = 150, FY = HY + 1.2;
  const HOLSTER = ISO.tint("#f5c84a", ["#c08a12", "#d29d22", "#e2b236", "#eec455"], "#5e4205");
  const PANEL = ISO.tint("#4a4e55", ["#26282c", "#2e3135", "#373a3f", "#404349"], "#0d0e10");
  const PROBE_RED = ISO.tint("#e8685a", ["#a8302a", "#bb3d33", "#cc4b3f", "#dc5b4d"], "#5a140e");
  const LCD = { x0: -27, x1: 27, z0: 106, z1: 132 };
  // dial positions: unit → angle (radians on the face, 0 = right, + = up)
  const DIAL = { off: Math.PI / 2, V: Math.PI / 4, A: (3 * Math.PI) / 4, mA: Math.PI * 0.98, ohm: -Math.PI * 0.02 };
  const DLAB = [["OFF", "off"], ["V⎓", "V"], ["A", "A"], ["mA", "mA"], ["Ω", "ohm"]];
  const SYM = { V: "V", A: "A", mA: "mA", ohm: "Ω", off: "" };
  const SOCK = { a10: -24, com: 0, plus: 24 }, SZ = 23;
  // 3½ digits, autoranging: as many decimals as fit under 2000 counts
  const shown = (v, unit) => {
    if (unit === "off") return "";
    const a = Math.abs(v);
    if (a >= 1999.5) return "OL";
    const d = a < 1.9995 ? 3 : a < 19.995 ? 2 : a < 199.95 ? 1 : 0;
    return (v < 0 ? "-" : "") + a.toFixed(d);
  };

  ISO.add({
    name: "multimeter", title: "Digital multimeter (part)", compare: null,
    about: "A handheld digital multimeter in a yellow holster: autoranging LCD, a rotary dial set to the unit, 10A / COM / VΩmA sockets and red and black probe leads lying in front; the reading settles to value. anchors: plus com red black",
    line: "multimeter cx cy k value=-1999..1999 unit=V|A|mA|ohm|off leads=1|0 lab=0 lit=case|display|dial|sockets|leads",
    demo: { line: "multimeter 480 390 20 value=0 unit=V lab=1", script: [{ set: {}, hold: 1 }, { set: { value: 3.79, lit: "display" }, hold: 2.4 }, { set: { value: 5.97 }, hold: 2.4 }, { set: { unit: "ohm", value: 47.0, lit: "dial" }, hold: 2.4 }, { set: { unit: "mA", value: 0.128, lit: "sockets" }, hold: 2 }, { set: { unit: "V", value: 2500, lit: "leads" }, hold: 2 }, { set: { unit: "off", lit: "case" }, hold: 2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", leads = o.leads !== "0";
      const units = Object.keys(SYM), st = { unit: units.includes(o.unit) ? o.unit : "V", v: ISO.clamp(ISO.num(o, "value", 0), -1e5, 1e5), tick: 0, ang: 0 };
      st.want = st.v; st.shownV = st.v; st.ang = st.angT = DIAL[st.unit];
      let lit = o.lit || "";
      const at = (x, z, y = FY) => K.iso([x, y, z], Pm), quad = (x0, x1, z0, z1, y) => K.pathOf([at(x0, z0, y), at(x1, z0, y), at(x1, z1, y), at(x0, z1, y)], true);
      const face = (x, z, text, size, color, { y = FY + 0.15, font = "'Helvetica Neue',Arial,sans-serif", weight = 700, anchor = "middle" } = {}) =>
        LAB.faceText(Pm, [x, y, z], [1, 0, 0], text, size, color).replace(`style="font:700 ${size}px 'Helvetica Neue',Arial,sans-serif"`, `style="font:${weight} ${size}px ${font}"`).replace('text-anchor="middle"', `text-anchor="${anchor}"`);
      const Fy = (x, z, y = FY) => LAB.A([x, y, z], [0, 1, 0]);
      // the holster: a rounded yellow body, bumper ridges at the four corners, the dark front panel set into it
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 7 };
      const holster = ISO.tinted(HOLSTER, S(K.slabOf(plan, 0, HZ, Pm, 6, 1.5), { tone: "mid", inner: L(K.sideSeam(plan, 10, Pm, 6), { tone: "faint" }) + L(K.sideSeam(plan, HZ - 10, Pm, 6), { tone: "faint" }) }));
      const panel = ISO.tinted(PANEL, ISO.wbox(Pm, [-HX + 6, HX - 6], [HY, FY], [10, HZ - 8], "mid"));
      // the LCD in its bezel with a glare, then the live digits and unit
      const bezel = ISO.tinted(ISO.T.plastic, ISO.wbox(Pm, [LCD.x0 - 3, LCD.x1 + 3], [FY, FY + 0.8], [LCD.z0 - 3, LCD.z1 + 3], "lo"));
      const glass = `<path d="${quad(LCD.x0, LCD.x1, LCD.z0, LCD.z1, FY + 0.85)}" fill="#b9c3ad" stroke="#5f6858" stroke-width="0.5"/>` +
        `<path d="${K.pathOf([at(LCD.x0 + 1.5, LCD.z1 - 1.2, FY + 0.9), at(LCD.x0 + 22, LCD.z1 - 1.2, FY + 0.9), at(LCD.x0 + 16, LCD.z1 - 6, FY + 0.9), at(LCD.x0 + 1.5, LCD.z1 - 6, FY + 0.9)], true)}" fill="#ffffff" fill-opacity=".18"/>`;
      const DZ = LCD.z0 + 7, mono = { font: "'Courier New',monospace", anchor: "end", y: FY + 0.95 };
            // HOLD and RANGE buttons under the display, the brand line
      const btn = (x, txt) => ISO.tinted(ISO.T.rubber, ISO.wbox(Pm, [x - 8, x + 8], [FY, FY + 2], [92, 99], "mid")) + face(x, 94.6, txt, 3, "#e6e6e6", { y: FY + 2.05 });
      const buttons = btn(-16, "HOLD") + btn(16, "RANGE") + face(0, HZ - 14, "DIGITAL MULTIMETER", 3.6, "#d9d9d9");
      // the dial: a knurled knob 30 mm across, a skirt under it, the positions printed round it
      const DC = [0, 62], kF = Fy(DC[0], DC[1]);
      const marks = DLAB.map(([txt, u]) => { const a = DIAL[u]; return face(DC[0] + Math.cos(a) * 21, DC[1] + Math.sin(a) * 21 - 1.4, txt, 3.6, u === "off" ? "#e8e8e8" : "#f2c84a"); }).join("");
      const ticks = `<path d="${DLAB.map(([, u]) => { const a = DIAL[u]; return K.pathOf([at(DC[0] + Math.cos(a) * 15.6, DC[1] + Math.sin(a) * 15.6, FY + 0.1), at(DC[0] + Math.cos(a) * 17.6, DC[1] + Math.sin(a) * 17.6, FY + 0.1)]); }).join("")}" stroke="#d9d9d9" stroke-width="0.8" data-free=""/>`;
      const skirt = () => ISO.tinted(ISO.T.plastic, S(G.disc(0, 1.2, 15, kF, Pm, { steps: 36 }), { tone: "lo" }));
      const knobBody = () => ISO.tinted(ISO.T.rubber, S(G.disc(1.2, 7, 12.5, kF, Pm, { steps: 36 }), { tone: "mid", inner: L(G.ribsOf(kF, 1.6, 6.6, 12.5, 24, Pm, { seams: true }), { tone: "faint" }) }));
      // the sockets: shrouded 4 mm jacks, their names printed under them
      const sock = (x, red) => ISO.tinted(red ? ISO.T.red : ISO.T.rubber, S(G.disc(0, 2.4, 5, Fy(x, SZ), Pm, { steps: 24 }), { tone: "mid" })) + `<path d="${G.circleOf(Fy(x, SZ), 2.42, 2.2, Pm)}" fill="#14171a"/>`;
      const sockets = sock(SOCK.a10, true) + sock(SOCK.com, false) + sock(SOCK.plus, true) + face(SOCK.a10, 12.2, "10A", 3.2, "#f08a7c") + face(SOCK.com, 12.2, "COM", 3.2, "#e6e6e6") + face(SOCK.plus, 12.2, "VΩmA", 3.2, "#f08a7c");
      // the leads: a plug in the socket, the cable down to the bench and forward, a probe lying on the bench
      const PROBE = [[0, 2.4], [2, 3.2, 1], [30, 3.6], [44, 4.2], [46, 6, 1], [49, 6, 1], [51, 4], [88, 3.6], [90, 1.2], [100, 0.9], [106, 0.3]];
      const lead = (x, red) => {
        const tint = red ? PROBE_RED : ISO.T.rubber, y0 = FY + 2.4, out = [];
        out.push(ISO.tinted(tint, S(G.solidOf([[0, 4.2], [8, 4.2], [9, 3.4, 1], [16, 3], [22, 2]], Fy(x, SZ, y0), Pm, { steps: 18 }), { tone: "hi" })));
        // the cable drops to the bench, turns along d and climbs into the probe's back; the probe lies along d
        const d = [0.6, 0.8, 0], C = [x, y0 + 42, 2.2], B = [x + d[0] * 24, C[1] + d[1] * 24, 6];
        const pts = LAB.bend([[x, y0 + 22, SZ], [x, y0 + 30, SZ - 3], C, [x + d[0] * 12, C[1] + d[1] * 12, 2.2], B], 6);
        out.push(`<path d="${K.pathOf(pts.map((p) => K.iso(p, Pm)))}" fill="none" stroke="${red ? "#b8322a" : "#25272b"}" stroke-width="${(3 * G.scaleOf(Pm)).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
        const pF = LAB.A(B, d);
        out.push(ISO.tinted(tint, S(G.solidOf(PROBE.slice(0, 9), pF, Pm, { steps: 18 }), { tone: "hi", inner: L(G.ribsOf(pF, 54, 86, 3.6, 10, Pm, { seams: true }), { tone: "faint" }) })));
        out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[88, 1.2], [90, 1.2], [100, 0.9], [106, 0.3]], pF, Pm, { steps: 10 }), { tone: "hi" })));
        const tipAt = [B[0] + d[0] * 106, B[1] + d[1] * 106, 6];
        return { svg: out.join(""), tip: tipAt };
      };
      const tipOf = (x) => [x + 0.6 * 130, FY + 2.4 + 42 + 0.8 * 130, 6], red = { tip: tipOf(SOCK.plus) }, black = { tip: tipOf(SOCK.com) };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, HZ, Pm)}"/>` +
        `<g data-name="case">${holster}${panel}${buttons}</g><g data-name="display">${bezel}${glass}<g data-part="digits"></g></g>` +
        `<g data-name="dial">${marks}${ticks}<g data-part="knob"></g><g data-part="pointer"></g></g><g data-name="sockets">${sockets}</g>` +
        `<g data-name="leads" data-part="leads"></g><g data-part="words"></g>`;
      g.anchors = { plus: [SOCK.plus / 10, FY / 10, SZ / 10], com: [SOCK.com / 10, FY / 10, SZ / 10], red: red.tip.map((v) => v / 10), black: black.tip.map((v) => v / 10) };
      const el = LAB.parts(g), w = ISO.writer();
      // the knob and the leads are build parts of their own (ISO.later), so a slow phone builds them a slice at a time
      ISO.later(() => { el.knob.innerHTML = skirt() + knobBody(); });
      if (leads) ISO.later(() => { el.leads.innerHTML = lead(SOCK.com, false).svg + lead(SOCK.plus, true).svg; draw(); });
      const draw = () => {
        const s = shown(st.shownV, st.unit);
        w.rebuild(el.digits, `${s}|${st.unit}`, () => face(LCD.x1 - 9, DZ, s, 13, "#1b1f1a", mono) + face(LCD.x1 - 2, DZ, SYM[st.unit], 5, "#1b1f1a", { anchor: "end", y: FY + 0.95 }) + (st.unit === "V" ? face(LCD.x0 + 6, LCD.z1 - 6, "DC", 3.4, "#1b1f1a", { y: FY + 0.95 }) : ""));
        w.rebuild(el.pointer, st.ang.toFixed(3), () => { const c = [DC[0], FY + 7.05, DC[1]], a = st.ang; return `<path d="${K.pathOf([K.iso([c[0] + Math.cos(a) * 3, c[1], c[2] + Math.sin(a) * 3], Pm), K.iso([c[0] + Math.cos(a) * 11.5, c[1], c[2] + Math.sin(a) * 11.5], Pm)])}" stroke="#f2f2f2" stroke-width="${(1.4 * G.scaleOf(Pm)).toFixed(2)}" stroke-linecap="round" data-free=""/>`; });
        if (lab) w.rebuild(el.words, "1", () => LAB.word(Pm, lab, [0, 0, HZ + 8], "multimeter", "#556") + (leads ? LAB.word(Pm, lab, red.tip, "probes", "#556", { anchor: "start", dy: -8 }) : ""));
        window.B26.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.value !== undefined && p.value !== "" && Number.isFinite(+p.value)) st.want = ISO.clamp(+p.value, -1e5, 1e5);
        if (p.unit !== undefined && SYM[p.unit] !== undefined) { st.unit = p.unit; st.angT = DIAL[p.unit]; }
        if (p.lit !== undefined) lit = p.lit;
      };
      // the input settles smoothly; the display samples it three times a second; the dial turns to its click
      g.update = (dt) => {
        const calm = ISO.still();
        st.v = ISO.follow(st.v, st.want, dt, 0.25, calm); if (Math.abs(st.v - st.want) < Math.abs(st.want) * 1e-4 + 1e-4) st.v = st.want;
        st.ang = ISO.follow(st.ang, st.angT, dt, 0.08, calm);
        st.tick += dt;
        if (calm || st.tick >= 0.33) { st.tick = 0; st.shownV = st.v; }
        draw();
        return st.shownV !== st.want || st.ang !== st.angT;
      };
      g.readout = () => (st.unit === "off" ? "multimeter · switched off" : `multimeter on ${st.unit === "ohm" ? "Ω" : st.unit} · reads ${shown(st.want, st.unit)} ${SYM[st.unit]}${Math.abs(st.want) >= 1999.5 ? " (over range)" : ""} · probes in COM and VΩmA`);
      draw();
      return g;
    },
  });
})();
