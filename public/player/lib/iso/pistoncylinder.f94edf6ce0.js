// "pistoncylinder cx cy k v=30..140 pin=0|1 lab=0 lit=cylinder|piston|gas|pin|scale" — a PART (PARTS.md, batch 5):
// the gas syringe of the gas-law experiment (gaslaw.js), standing on its foot, its origin the bench point under its
// middle. A glass cylinder 3.6 cm across and 17.2 cm tall (3.36 cm inside: 1 mL of gas = 1.13 mm of height) with a
// beaded rim, a printed mL scale and a glass side nozzle at its foot (for the pressure gauge's tube); a steel piston
// with two rubber seals in its grooves, its 6 mm rod 14 cm long, and the 5.2 cm platform on top where slotted masses go.
// Air is trapped under the piston, its molecules drawn as dots. v = the gas volume in mL: set it and the piston (rod
// and platform with it) rises or falls to it, eased, as the gas expands or is squeezed. pin=1 pushes the red lock pin
// through the rod across the rim: the volume is then fixed (the pressure law), and a new v waits until the pin is
// pulled (pin=0). set({ v, pin }). Built in mm; anchors in cm: `platform` (its top middle, follows the piston),
// `port` (the nozzle's end) and `rim`.
(() => {
  const K = window.K, G = window.G;
  const CR = 18, CRIN = 16.8, CYH = 172, Z0 = 3, RL = 140, PR = 26;
  const MMPERML = 1000 / (Math.PI * CRIN * CRIN), PORT = G.unit3([-1, 0, 0]);
  const MOL = Array.from({ length: 30 }, (_, i) => { const a = i * 2.39996, r = Math.sqrt((0.5 + i * 0.5698403) % 1) * (CRIN - 2.5), f = (0.5 + i * 0.7548777) % 1, d = (i * 1.7) % (Math.PI * 2); return [Math.cos(a) * r, Math.sin(a) * r, f, Math.cos(d), Math.sin(d) * 0.6, Math.sin(d * 1.3) * 0.8]; });

  ISO.add({
    name: "pistoncylinder", title: "Gas cylinder and piston (part)", compare: null,
    about: "A glass gas cylinder with a sealed steel piston, its rod and a platform for masses: the trapped air's volume (mL, on the scale) moves the piston up or down; a red pin locks it at a fixed volume. anchors: platform port rim",
    line: "pistoncylinder cx cy k v=30..140 pin=0|1 lab=0 lit=cylinder|piston|gas|pin|scale",
    demo: { line: "pistoncylinder 480 505 15 v=100 lab=1", script: [{ set: {}, hold: 1 }, { set: { v: 60, lit: "piston" }, hold: "settle" }, { set: { v: 130, lit: "gas" }, hold: "settle" }, { set: { pin: 1, lit: "pin" }, hold: 1.2 }, { set: { v: 50 }, hold: 1.2 }, { set: { pin: 0, lit: "scale" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const st = { v: ISO.clamp(ISO.num(o, "v", 100), 30, 140), pin: o.pin === "1" };
      st.want = st.v;
      let lit = o.lit || "";
      const cyl = LAB.vessel(Pm, [0, 0, 0], [[0, 2], [1, CR - 1, 1], [2.5, CR, 1], [CYH - 4, CR], [CYH - 2, CR + 1.4, 1], [CYH, CR + 1]], { base: 3, wall: 1.2 });
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -CR - 6, y: -CR, w: 2 * CR + 6, d: 2 * CR, r: CR }, 0, 8, Pm)}"/>` +
        `<g data-name="cylinder">${cyl.back()}</g><g data-name="gas" data-part="gas"></g><g data-name="piston" data-part="piston"></g><g data-name="cylinder" data-part="front"></g><g data-name="scale" data-part="scale"></g>` +
        `<g data-name="pin" data-part="pin"></g><g data-name="piston" data-part="ptop"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      // the near glass, its rim and the side nozzle at the foot (a short glass tube out toward −x, with a bead)
      const Fp = G.frameAlong([0, 0, 7], PORT);
      el.front.innerHTML = cyl.front() + ISO.tinted(ISO.T.glass, S(G.disc(CR - 1, CR + 9, 2.2, Fp, Pm), { tone: "lo" }) + S(G.disc(CR + 7, CR + 8.5, 2.8, Fp, Pm), { tone: "lo" }));
      el.scale.innerHTML = cyl.scale(Z0, Z0 + 140 * MMPERML, 10 * MMPERML, 5, { side: 0.5 }) +
        [50, 100].map((m) => LAB.faceText(Pm, G.pointOf(cyl.F, Z0 + m * MMPERML - 1.4, CR + 0.3, cyl.facing + 0.5 - 0.42), G.mul3(G.tangentOf(cyl.F, cyl.facing + 0.08), -1), String(m), 3.4)).join("") +
        LAB.faceText(Pm, G.pointOf(cyl.F, CYH - 16, CR + 0.3, cyl.facing - 0.2), G.mul3(G.tangentOf(cyl.F, cyl.facing - 0.2), -1), "mL", 3.6);
      // the piston: head with two rubber seals, the rod (built once at the bottom and moved with a translate)
      el.piston.innerHTML = ISO.tinted(ISO.T.steel, S(G.solidOf([[0, CRIN - 0.2], [10, CRIN - 0.2]], LAB.Z([0, 0, Z0]), Pm), { tone: "mid" })) +
        ISO.tinted(ISO.T.rubber, S(G.solidOf([[2, CRIN], [3.6, CRIN]], LAB.Z([0, 0, Z0]), Pm), { tone: "hi" }) + S(G.solidOf([[6.4, CRIN], [8, CRIN]], LAB.Z([0, 0, Z0]), Pm), { tone: "hi" })) +
        ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3, Z0 + 10, RL, Pm, 16), { tone: "mid" }));
      const top = Z0 + 14 + RL;
      // the rod above the rim, the collar and the platform: drawn after the pin (the rod passes through it), rebuilt as it moves
      const ptop = (hq) => { const r0 = Math.max(Z0 + 10 + hq, CYH - 2); return ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3, r0, Z0 + 10 + RL + hq - r0, Pm, 16), { tone: "mid" }) + S(K.cylinder(0, 0, 4.5, Z0 + 10 + RL + hq, 4, Pm, 20), { tone: "mid" }) + S(K.cylinder(0, 0, PR, top + hq, 3, Pm, 40, 0.4), { tone: "mid", inner: LAB.L(K.sideArc(0, 0, PR, top + hq + 1.5, Pm, 30), { tone: "faint" }) })); };
      // the lock pin: a red steel bar through the rod resting across the rim, a ring pull on its +x end
      const ringPts = Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [CR + 13 + Math.cos(a) * 5, 0, CYH + 2 + Math.sin(a) * 5]; });
      const pinSvg = ISO.tinted(ISO.T.red, ISO.wbox(Pm, [-CR - 8, CR + 8], [-2, 2], [CYH, CYH + 4], "hi")) + PHYS.wire(Pm, PHYS.path(Pm, ringPts), 0.8, { ink: "#5a1c19", body: "#d0392b", shine: "#f4a49a" });
      const draw = () => {
        const h = st.v * MMPERML, hq = Math.round(h * 4) / 4, up = K.translateAlong(Pm, [0, 0, hq]);
        w.rebuild(el.gas, String(hq), () => {
          const dots = [], tails = [];
          for (const [x, y, f, dx, dy, dz] of MOL) { const z = Z0 + 1.5 + f * (hq - 3), a = K.iso([x, y, z], Pm), b = K.iso([x - dx * 2.6, y - dy * 2.6, z - dz * 2.6], Pm); dots.push(a); tails.push(K.pathOf([a, b])); }
          return cyl.liquid(Z0 + hq, "#f2f6fa", { from: Z0, opacity: 0.35, meniscus: false }) + `<path d="${tails.join("")}" stroke="#8fb3d9" stroke-width="0.9" fill="none" stroke-linecap="round"/>` + K.dotsSvg(dots, { size: 1, tone: "hi" }).replace("<g", '<g style="--anatomy-hi:#2f6fae"');
        });
        w.attr(el.piston, "transform", up); w.rebuild(el.ptop, String(hq), () => ptop(hq));
        w.rebuild(el.pin, String(st.pin), () => (st.pin ? pinSvg : ""));
        g.anchors = { platform: [0, 0, +((top + 3 + hq) / 10).toFixed(3)], port: [-(CR + 8.5) / 10, 0, 0.7], rim: [0, 0, CYH / 10] };
        if (lab) w.rebuild(el.words, `${Math.round(st.v)} ${st.pin}`, () => LAB.word(Pm, lab, [CR + 6, 0, Z0 + h / 2], `${Math.round(st.v)} mL of air`, "#33506f", { anchor: "start" }) +
          LAB.word(Pm, lab, [-CR - 6, 0, Z0 + h + 5], "piston", "#556", { anchor: "end" }) + LAB.word(Pm, lab, [PR + 6, 0, top + h + 2], "platform", "#556", { anchor: "start" }) + (st.pin ? LAB.word(Pm, lab, [CR + 20, 0, CYH + 2], "lock pin", "#a8382a", { anchor: "start" }) : ""));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.v !== undefined && p.v !== "" && Number.isFinite(+p.v)) st.want = ISO.clamp(+p.v, 30, 140);
        if (p.pin !== undefined) st.pin = String(p.pin) === "1";
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const target = st.pin ? st.v : st.want;
        st.v = ISO.follow(st.v, target, dt, 0.5, ISO.still());
        if (Math.abs(st.v - target) < 0.05) st.v = target;
        draw();
        return st.v !== target;
      };
      g.readout = () => `${st.v.toFixed(1)} mL of trapped air · piston ${(st.v * MMPERML).toFixed(0)} mm up the cylinder${st.pin ? ` · pin in: the volume is locked${st.want !== st.v ? ` (it will go to ${st.want.toFixed(0)} mL when the pin is pulled)` : ""}` : ""}`;
      draw();
      return g;
    },
  });
})();
