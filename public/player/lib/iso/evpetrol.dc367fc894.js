// "evpetrol cx cy width labels=1 run=0|1 lab=1 lit=battery|motor|inverter|charger|engine|gearbox|driveshaft|tank|exhaust|pump"
// — two model cars on one base with see-through bodies, so their drivetrains show. Left, electric: the flat battery
// pack in the floor between the axles, the inverter and the motor with its reduction gear on the rear axle, the
// orange high-voltage cable, the charge port and a charging post with its cable. Right, petrol: the engine in the
// nose with its radiator, the gearbox, the driveshaft to the rear differential, the fuel tank under the back seat and
// its fuel line, the exhaust pipe with its silencer, and the fuel pump with its hose. set({ run: 1 }) drives both:
// the wheels turn, current flows from the battery to the motor, fuel from the tank to the engine, and the petrol car's
// exhaust puffs out while the electric car gives off none. Battery to wheels ≈ 85–90 %; petrol tank to wheels ≈ 25–30 %
// (the rest leaves as heat through the radiator and exhaust); burning 1 L of petrol makes about 2.3 kg of CO₂.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BASE = { x: -176, y: -78, w: 352, d: 124, r: 5 }, XE = -88, XP = 88, WB = 40, RW = 12.5, WY = 24;
  const BODY = [[-60, 9], [-62, 18], [-58, 26], [-30, 30], [-14, 46], [-8, 49], [24, 49], [40, 44], [58, 34], [61, 22], [60, 9]];
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const ORANGE = ISO.tint("#f39a3a", ["#b5631a", "#c87224", "#da822e", "#e98f35"], "#6b3a0c"), BATT = ISO.tint("#7fb0e6", ["#3f6fa8", "#4d7fba", "#5c8fcb", "#6c9fda"], "#1d3d66");
  const IRON = ISO.tint("#9aa0a8", ["#5c626a", "#686e76", "#757b83", "#838990"], "#2c3036");

  ISO.add({
    name: "evpetrol", title: "Electric car and petrol car", compare: "evpetrol 480 270 500",
    about: "An electric car beside a petrol car, bodies see-through: battery and motor against tank, engine, gearbox, driveshaft and exhaust.",
    line: "evpetrol cx cy width labels=1 run=0|1 lab=1 lit=battery|motor|inverter|charger|engine|gearbox|driveshaft|tank|exhaust|pump",
    demo: { line: "evpetrol 480 270 500", script: [{ set: { run: 1, lit: "battery,motor" }, hold: 2.6 }, { set: { lit: "tank,engine,exhaust" }, hold: 2.6 }, { set: { run: 0, lit: "" }, hold: 1.4 }] },
    make([cx, cy, size = 500], o, t, parent) {
      const LAB = window.LAB;
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.3, H = size * 0.8;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -10, 0), [-176, -70, 66], [176, 40, 50]], cx, cy, W, H, { azimuth: 68, elevation: 28 }, parent);
      const st = { run: o.run === "1" ? 1 : 0, sp: 0, ang: 0, clock: 0, lit: o.lit || "", litDrawn: null };
      st.sp = st.run;
      const wheel = (x, y0, y1) => ISO.tinted(ISO.T.rubber, S(G.disc(y0, y1, RW, yAx([x, 0, RW]), P), { tone: "hi" })) + ISO.tinted(ISO.T.steel, S(G.disc(y1 > 0 ? y1 : y0 - 0.4, y1 > 0 ? y1 + 0.4 : y0, 7.5, yAx([x, 0, RW]), P), { tone: "mid" }));
      // the floor pan stops short of the rear axle, where the motor or the differential sits low between the wheels
      const floor = (xc) => ISO.tinted(IRON, ISO.wbox(P, [xc - 56, xc + WB - 8], [-16.5, 16.5], [7, 9], "mid"));
      const shaft = (x, y0, y1, z, r = 1.4) => ISO.tinted(ISO.T.steel, S(G.disc(y0, y1, r, yAx([x, 0, z]), P), { tone: "mid" }));
      // a see-through body: the shell's side outline pushed across the car's width, drawn faint over the parts
      const ghost = (xc) => `<g opacity=".34">${ISO.prismY(P, BODY.map(([x, z]) => [xc + x, z + 2]), -WY + 1, WY - 1, ["#8fa6bd", "#e9f1f8"], "#dce8f2", "#33506f")}</g>` +
        `<path d="${K.pathOf(BODY.map(([x, z]) => K.iso([xc + x, WY - 1, z + 2], P)), true)}${K.pathOf(BODY.map(([x, z]) => K.iso([xc + x, -WY + 1, z + 2], P)).slice(3, 9))}" fill="none" stroke="#33506f" stroke-width="1.1" opacity=".85"/>` +
        // the side windows and the door shut lines on the near flank
        `<path d="${K.pathOf([[-27, 32], [-13, 46], [22, 46], [37, 34]].map(([x, z]) => K.iso([xc + x, WY - 0.9, z + 2], P)), true)}${K.pathOf([[2, 46], [2, 12]].map(([x, z]) => K.iso([xc + x, WY - 0.9, z + 2], P)))}${K.pathOf([[-27, 32], [-27, 12]].map(([x, z]) => K.iso([xc + x, WY - 0.9, z + 2], P)))}${K.pathOf([[33, 36], [33, 12]].map(([x, z]) => K.iso([xc + x, WY - 0.9, z + 2], P)))}" fill="none" stroke="#33506f" stroke-width="0.8" opacity=".7"/>`;

      // ── base and the two stations behind the cars
      const out = [ISO.baseboard(P, BASE, { h: 6, feet: 3, tint: ISO.T.wood })];
      out.push(ISO.tinted(ISO.T.road, S(K.slabOf(K.insetPlan(BASE, 6), 0, 1, P, 3), { tone: "hi" })));
      for (const xc of [XE, XP]) out.push(`<path d="${K.pathOf([[xc - 72, -WY - 8], [xc + 72, -WY - 8], [xc + 72, WY + 8], [xc - 72, WY + 8]].map(([x, y]) => K.iso([x, y, 1.02], P)), true)}" fill="none" stroke="#fbfbf7" stroke-width="1.6"/>`);
      // charging post (left) and fuel pump (right) on plinths at the back
      const CHX = XE + 40, PUX = XP + 40, SY = -58;
      out.push(named("charger", ISO.tinted(ISO.T.paint, ISO.wbox(P, [CHX - 10, CHX + 10], [SY - 6, SY + 6], [1, 4], "mid") + ISO.wbox(P, [CHX - 6, CHX + 6], [SY - 4, SY + 4], [4, 56], "mid")) +
        ISO.tinted(ISO.T.green, ISO.wbox(P, [CHX - 6.2, CHX + 6.2], [SY + 4, SY + 4.6], [36, 50], "hi")) + `<path d="${K.pathOf([[CHX - 4, SY + 4.7, 40], [CHX + 4, SY + 4.7, 40], [CHX + 4, SY + 4.7, 47], [CHX - 4, SY + 4.7, 47]].map((p) => K.iso(p, P)), true)}" fill="#1f2a22"/>` +
        LAB.hose(P, LAB.bend([[CHX + 3, SY + 4.6, 30], [CHX + 6, SY + 10, 14], [XE + 46, -WY - 4, 12], [XE + 52, -WY + 0.4, 30]], 6), 1.4, "#2b2e33")));
      out.push(named("pump", ISO.tinted(ISO.T.paint, ISO.wbox(P, [PUX - 12, PUX + 12], [SY - 7, SY + 7], [1, 4], "mid")) + ISO.tinted(ISO.T.red, ISO.wbox(P, [PUX - 8, PUX + 8], [SY - 5, SY + 5], [4, 52], "mid")) +
        ISO.tinted(ISO.T.paint, ISO.wbox(P, [PUX - 8.2, PUX + 8.2], [SY + 5, SY + 5.6], [30, 46], "hi")) + `<g transform="${ISO.faceMatrix(P, [PUX, SY + 5.7, 40], 1)}"><text text-anchor="middle" style="font:700 4px 'Helvetica Neue',Arial,sans-serif" fill="#8f2a22">PETROL</text></g>` +
        LAB.hose(P, LAB.bend([[PUX - 6, SY + 5.6, 26], [PUX - 6, SY + 12, 10], [XP + 46, -WY - 5, 10], [XP + 50, -WY + 0.4, 30]], 6), 1.4, "#2b2e33")));
      // far wheels of both cars
      for (const xc of [XE, XP]) out.push(wheel(xc - WB, -WY, -WY + 7), wheel(xc + WB, -WY, -WY + 7));

      // ── electric car: floor, battery pack, inverter, motor + reduction gear on the rear axle, HV cable, charge port
      const e = [floor(XE)];
      const pack = { x0: XE - 32, x1: XE + 26 };
      e.push(named("battery", ISO.tinted(BATT, ISO.wbox(P, [pack.x0, pack.x1], [-15.5, 15.5], [9, 16], "mid")) + `<path d="${[1, 2, 3, 4, 5].map((k) => K.lineOnTop([pack.x0 + k * 9.6, -15], [pack.x0 + k * 9.6, 15], 16, P)).join("")}${K.lineOnTop([pack.x0 + 1, 0], [pack.x1 - 1, 0], 16, P)}" stroke="#1d3d66" stroke-width="0.6" fill="none"/>`));
      e.push(shaft(XE - WB, -WY + 7, WY - 7, RW), shaft(XE + WB, -WY + 7, -6, RW), shaft(XE + WB, 6, WY - 7, RW));
      e.push(named("motor", ISO.tinted(IRON, S(G.disc(-6, 6, 7.5, yAx([XE + WB, 0, RW]), P), { tone: "mid", inner: L(G.ribsOf(yAx([XE + WB, 0, RW]), -5, 5, 7.5, 18, P, { seams: true }), { tone: "lo" }) })) +
        ISO.tinted(ISO.T.steel, ISO.wbox(P, [XE + WB - 15, XE + WB - 7.5], [-6, 6], [9, 19], "mid"))));
      e.push(named("inverter", ISO.tinted(ISO.T.paint, ISO.wbox(P, [XE + WB - 10, XE + WB + 4], [-9, 9], [20, 25], "mid"))));
      const hv = [[pack.x1, 8, 13], [XE + WB - 14, 8, 16], [XE + WB - 9, 8, 22.5]];
      e.push(`<g data-name="battery">${LAB.hose(P, hv, 0.9, "#f08a2a")}</g>`, ISO.tinted(ISO.T.plastic, ISO.wbox(P, [XE - 52, XE - 44], [-8, 2], [9, 17], "hi")) /* the 12 V battery */);
      // charge port on the car's far rear flank (set in the see-through body, a prism the audit does not record: 'loose')
      e.push(named("charger", ISO.tinted(ISO.T.plastic, ISO.wbox(P, [XE + 49, XE + 55], [-WY + 0.2, -WY + 1.4], [27, 33], "hi"))));
      out.push(e.join(""));

      // ── petrol car: radiator, engine (block, head, plugs, manifold), gearbox, driveshaft, diff, tank, exhaust
      const p = [floor(XP)], EX0 = XP - 52, EX1 = XP - 22;
      p.push(named("engine", ISO.tinted(ISO.T.steel, ISO.wbox(P, [XP - 59, XP - 56], [-16, 16], [9, 30], "mid")) + ISO.tinted(IRON, ISO.wbox(P, [EX0, EX1], [-11, 11], [9, 26], "mid")) +
        ISO.tinted(ISO.T.red, ISO.wbox(P, [EX0 + 1, EX1 - 1], [-8, 8], [26, 31], "mid")) + [0, 1, 2, 3].map((k) => ISO.tinted(ISO.T.plastic, S(K.cylinder(EX0 + 5 + k * 6.6, 0, 1.2, 31, 2.4, P, 10), { tone: "hi" }))).join("") +
        ISO.tinted(ISO.T.steel, ISO.wbox(P, [EX0 + 2, EX1 - 2], [11, 14], [17, 23], "mid"))));
      p.push(shaft(XP - WB, -WY + 7, -11, RW), shaft(XP - WB, 11, WY - 7, RW), shaft(XP + WB, -WY + 7, -5, RW), shaft(XP + WB, 5, WY - 7, RW));
      // the gearbox is a tapered ISO.poly (the audit doesn't record it); the driveshaft rests on the floor's tunnel
      p.push(named("gearbox", ISO.tinted(IRON, ISO.poly([[EX1, -9, 12], [EX1 + 16, -5, 12], [EX1 + 16, 5, 12], [EX1, 9, 12], [EX1, -9, 25], [EX1 + 16, -5, 19], [EX1 + 16, 5, 19], [EX1, 9, 25]], ISO.BOX_F, P, "mid"))));
      p.push(named("driveshaft", ISO.tinted(ISO.T.steel, S(G.disc(0, XP + WB - 6 - (EX1 + 16), 1.6, xAx([EX1 + 16, 0, 10.6]), P), { tone: "mid" })) + ISO.tinted(IRON, S(G.sphereOf([XP + WB, 0, RW], 6, P), { tone: "mid" }))));
      p.push(named("tank", ISO.tinted(ISO.T.amber, ISO.wbox(P, [XP + 8, XP + 30], [-16.5, -3], [9, 18], "mid")) + LAB.hose(P, [[XP + 8, -14, 12], [EX1 - 4, -14, 12], [EX1 - 6, -11.5, 16]], 0.6, "#c99a2a")));
      const exh = [[EX0 + 10, 14, 17], [EX0 + 12, 17, 12], [EX0 + 18, 17, 6.4], [XP + 2, 15, 6.4]];
      p.push(named("exhaust", LAB.hose(P, LAB.bend(exh, 3), 1.4, "#8a9099") + ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 3.2], [1.4, 4.6, 1], [20, 4.6, 1], [22, 3.2]], xAx([XP + 34, 13, 7.2]), P), { tone: "mid" })) +
        LAB.hose(P, [[XP + 2, 15, 6.4], [XP + 34, 14, 7]], 1.4, "#8a9099") + ISO.tinted(ISO.T.steel, S(G.disc(56, 64, 1.6, xAx([XP, 13, 7.2]), P), { tone: "mid" }))));
      p.push(named("tank", ISO.tinted(ISO.T.plastic, ISO.wbox(P, [XP + 49, XP + 55], [-WY + 0.2, -WY + 1.4], [27, 33], "hi"))));
      out.push(p.join(""));
      g.innerHTML = out.join("") + `<g data-part="flow"></g><g data-part="ghosts"></g><g data-part="near"></g><g data-part="spokes"></g><g data-part="smoke"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      el.ghosts.innerHTML = ghost(XE) + ghost(XP);
      el.near.innerHTML = [XE, XP].map((xc) => wheel(xc - WB, WY - 7, WY) + wheel(xc + WB, WY - 7, WY)).join("");
      const namedEls = [...g.querySelectorAll("[data-name]")];
      const fx = ISO.puffsFx(g, P, W, H, el.words, 5);
      // energy on the move: dashes along the HV cable (current) and the fuel line (petrol)
      const flowSvg = () => `<g class="hs-flow" fill="none" stroke-linecap="round"><path d="${K.pathOf(hv.map((q) => K.iso(q, P)))}" stroke="#ffe08a" stroke-width="1.4"/><path d="${K.pathOf([[XP + 8, -14, 12], [EX1 - 4, -14, 12], [EX1 - 6, -11.5, 16]].map((q) => K.iso(q, P)))}" stroke="#fff3c4" stroke-width="1.1"/></g>`;
      const spokeSvg = (a) => [XE, XP].flatMap((xc) => [xc - WB, xc + WB]).map((x) => {
        const c = [x, WY + 0.5, RW], d = [];
        for (let k = 0; k < 5; k++) { const b = a + (k * Math.PI * 2) / 5; d.push(K.pathOf([K.iso([x + Math.cos(b) * 1.6, WY + 0.5, RW + Math.sin(b) * 1.6], P), K.iso([x + Math.cos(b) * 7, WY + 0.5, RW + Math.sin(b) * 7], P)])); }
        return `<path d="${d.join("")}" stroke="#6b7078" stroke-width="1.4" stroke-linecap="round" fill="none"/>` + K.dotsSvg([K.iso(c, P)], { size: 0.9, tone: "mid" });
      }).join("");
      const TIP = [XP + 64, 13, 7.2];
      const puffs = () => Array.from({ length: 5 }, (_, k) => { const f = (st.clock * 0.7 + k / 5) % 1; return [TIP[0] + 4 + f * 30, TIP[1] + f * 4, TIP[2] + f * 12, 2 + f * 7, 0.55 * Math.sin(Math.PI * f) * st.sp]; });
      const draw = () => {
        w.rebuild(el.flow, String(st.run && st.sp > 0.5), () => (st.run && st.sp > 0.5 ? flowSvg() : ""));
        const aq = Math.round(st.ang / 0.1) * 0.1;
        w.rebuild(el.spokes, aq.toFixed(1), () => spokeSvg(-aq));
        if (fx) fx(st.sp > 0.02 ? puffs() : []);
        else w.rebuild(el.smoke, st.sp > 0.02 ? (st.clock * 30 | 0) + " " + st.sp.toFixed(2) : "off", () => st.sp > 0.02 ? puffs().map(([x, y, z, r, a]) => { const c = K.iso([x, y, z], P); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(r * G.scaleOf(P)).toFixed(1)}" fill="#cfd6dd" stroke="#9aa3ad" stroke-width="0.5" opacity="${a.toFixed(2)}"/>`; }).join("") : "");
        if (lab) w.rebuild(el.words, String(st.run), () => ISO.word(K.iso([XE, 0, 70], P), "electric", "#2b5cc4", { size: 15 }) + ISO.word(K.iso([XP, 0, 70], P), "petrol", "#a8382a", { size: 15 }) +
          ISO.word(K.iso([XE - 3, WY, 4], P), "battery pack", "#1d3d66", { size: 12, dy: 14 }) + ISO.word(K.iso([XE + WB, WY, 30], P), "motor", "#445", { size: 12, dy: -4 }) +
          ISO.word(K.iso([XP - 37, WY, 40], P), "engine", "#445", { size: 12 }) + ISO.word(K.iso([XP + 19, WY, 4], P), "fuel tank", "#8a5a10", { size: 12, dy: 14 }) + ISO.word(K.iso([XP + 66, 13, 4], P), "exhaust", "#556", { size: 12, dy: 14, anchor: "start" }) +
          ISO.word(K.iso([CHX, SY, 60], P), "charger", "#2c6a22", { size: 12 }) + ISO.word(K.iso([PUX, SY, 56], P), "fuel pump", "#8f2a22", { size: 12 }));
        if (st.litDrawn !== st.lit) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((x) => on.includes(x.dataset.name))); }
      };
      g.set = (q) => {
        if (q.run !== undefined) st.run = +q.run ? 1 : 0;
        if (q.lit !== undefined) st.lit = q.lit;
      };
      // the wheels spin up and down (and keep turning while run = 1); it reports moving only while the speed changes
      g.update = (dt) => {
        const calm = ISO.still();
        st.sp = ISO.follow(st.sp, st.run, dt, 0.5, calm); if (Math.abs(st.sp - st.run) < 0.01) st.sp = st.run;
        if (!calm) { st.ang += st.sp * dt * 6; st.clock += dt; }
        draw();
        return st.sp !== st.run;
      };
      g.readout = () => (st.run ? "driving · electric: battery → inverter → motor → wheels, about 85–90 % of the energy reaches the road, no exhaust · petrol: tank → engine → gearbox → driveshaft → wheels, about 25–30 % reaches the road, the rest is heat; 1 L of petrol burnt ≈ 2.3 kg CO₂" :
        "parked · electric car: 60 kWh battery charged from the post (7 kW: about 8 h from empty) · petrol car: 45 L tank filled at the pump in about 2 minutes");
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
