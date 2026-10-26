// "condenser cx cy k tilt=0..30 lab=0 lit=jacket|tube|water|nozzles" — a PART (PARTS.md, batch 5): a Liebig
// condenser, held in a retort-stand clamp by its middle; its origin is that middle, on the axis (place it at=stand.clamp).
// A 0.9 cm glass inner tube 30 cm long runs through a 3 cm water jacket 21.6 cm long, fused to it at both ends; the tube
// falls toward −x at tilt degrees (14 by default, as distill.js), its high end (+x) a ground-glass cone where the still
// head's side arm goes in, its low end a drip tip over the receiver. Two hose nozzles with ridged olives: cold water in
// at the low end (underneath), out at the high end (on top), against the vapour. The jacket is full of cold water
// (tinted blue). Reused from distill.js (its jacket profile and tubes, which it drew in mm). Static.
// Built in mm; anchors in cm: in (the high end's mouth), out (the drip tip), waterin, waterout (the nozzle ends).
(() => {
  const K = window.K, G = window.G;
  const HALF = 150, J = 108, RJ = 15, RT = 4.5, NOZ = 26, NZ = 82;   // mm: tube half-length, jacket half-length, radii
  const GLASS = ISO.tint("#eef6fb", ["#c9dde9", "#d4e5ef", "#dfecf4", "#e8f2f8"], "#5d7f96");

  ISO.add({
    name: "condenser", title: "Liebig condenser (part)", compare: null,
    about: "A Liebig condenser: a glass tube inside a water jacket, cold water in at the low end and out at the high end, so vapour from a still head cools and drips out of its low end. anchors: in out waterin waterout",
    line: "condenser cx cy k tilt=0..30 lab=0 lit=jacket|tube|water|nozzles",
    demo: { line: "condenser 480 280 26 tilt=14 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "jacket" }, hold: 1.3 }, { set: { lit: "tube" }, hold: 1.3 }, { set: { lit: "water" }, hold: 1.3 }, { set: { lit: "nozzles" }, hold: 1.3 }] },
    make([cx = 480, cy = 280, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const tilt = (ISO.clamp(ISO.num(o, "tilt", 14), 0, 30) * Math.PI) / 180;
      const DIR = [-Math.cos(tilt), 0, -Math.sin(tilt)], UP = [-Math.sin(tilt), 0, Math.cos(tilt)];
      // s along the tube: −HALF the high end (+x), +HALF the low end; n across it (toward UP)
      const at = (s, n = 0) => [DIR[0] * s + UP[0] * n, 0, DIR[2] * s + UP[2] * n];
      const jacket = LAB.vessel(Pm, at(-J), [[0, RT + 0.3], [5, RJ - 1, 1], [8, RJ], [2 * J - 8, RJ], [2 * J - 5, RJ - 1, 1], [2 * J, RT + 0.3]], { axis: DIR, rim: false });
      const tube = (s0, s1, r = RT) => LAB.tube(Pm, [at(s0), at(s1)], r, { inner: "#ffffff" });
      // the high end: a ground-glass cone (frosted, a little wider) and its lip; the low end: the drip tip, cut aslant
      const cone = LAB.tube(Pm, [at(-HALF + 1), at(-HALF + 22)], RT + 1.3, { fill: "#e3e8eb", ink: "#7f97a6" }) +
        `<path d="${K.pathOf([K.iso(at(-HALF + 22, RT + 1.3), Pm), K.iso(at(-HALF + 22, -RT - 1.3), Pm)])}" stroke="#7f97a6" stroke-width="0.6"/>`;
      const drip = LAB.tube(Pm, [at(HALF - 14), at(HALF)], RT * 0.8, { inner: "#ffffff" }) + LAB.tube(Pm, [at(HALF - 30), at(HALF - 14)], RT, { inner: "#ffffff" });
      // a nozzle: a glass stub square to the jacket, sign +1 up (at s) or −1 down, an olive ridge near its end
      const nozzle = (s, sg) => {
        const F = G.frameAlong(at(s, sg * (RJ - 2)), [UP[0] * sg, 0, UP[2] * sg]);
        return `<g class="cd-glass">${ISO.tinted(GLASS, S(G.lathe([[0, 0], [0, 3.6], [NOZ - 9, 3.6], [NOZ - 7.5, 4.6, 1], [NOZ - 5, 4.6], [NOZ - 3.6, 3.6, 1], [NOZ, 3.4], [NOZ, 0]], F, Pm, { steps: 24 }), { tone: "hi" }))}</g>` +
          `<path d="${G.arcOf(F, NOZ - 0.05, 2, Pm)}" fill="none" stroke="#ffffff" stroke-width="${Math.max(0.5, K.screenRise(1, Pm) * 1.4).toFixed(2)}"/>`;
      };
      const water = `<path d="${jacket.sil}" fill="#7fbde8" fill-opacity=".34"/>` +
        `<path d="${K.pathOf([K.iso(at(-J + 9, RJ - 2.5), Pm), K.iso(at(J - 9, RJ - 2.5), Pm)])}" fill="none" stroke="#ffffff" stroke-width="${Math.max(0.6, K.screenRise(1, Pm) * 2).toFixed(2)}" stroke-linecap="round" opacity=".55"/>`;
      // painted back to front: the low end (far, −x) and the nozzle under the jacket, the jacket's back, the water,
      // the tube inside it, the jacket's front, then the high end (near) and the top nozzle
      g.innerHTML = `<style>.cd-glass .iso-fill{fill-opacity:.8}.cd-glass .iso-shade,.cd-glass .iso-top{opacity:.65}</style>` +
        `<g data-name="tube">${drip}${tube(J - 2, HALF - 30)}</g><g data-name="nozzles">${nozzle(NZ, -1)}</g>` +
        `<g data-name="jacket">${jacket.back()}</g><g data-name="water">${water}</g><g data-name="tube">${tube(-J + 2, J - 2, RT - 0.4)}</g>` +
        `<g data-name="jacket">${jacket.front({ shine: true })}</g><g data-name="tube">${tube(-HALF + 22, -J + 2)}${cone}</g><g data-name="nozzles">${nozzle(-NZ, 1)}</g><g data-part="words"></g>`;
      const cm = (p) => p.map((v) => +(v / 10).toFixed(3));
      g.anchors = { in: cm(at(-HALF)), out: cm(at(HALF)), waterin: cm(at(NZ, -(RJ - 2 + NOZ))), waterout: cm(at(-NZ, RJ - 2 + NOZ)) };
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, at(0, RJ + 6), "condenser", "#556", { dy: -6 }) +
        LAB.word(Pm, lab, at(NZ, -(RJ + NOZ)), "cold water in", "#2b6cc4", { anchor: "start", dy: 12 }) + LAB.word(Pm, lab, at(-NZ, RJ + NOZ + 2), "water out", "#2b6cc4", { dy: -6 }) +
        LAB.word(Pm, lab, at(-HALF), "vapour in", "#556", { anchor: "start", dy: -8 }) + LAB.word(Pm, lab, at(HALF), "distillate out", "#556", { anchor: "end", dy: 14 });
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `Liebig condenser · tube 0.9 cm × 30 cm in a 3 cm water jacket 21.6 cm long · sloping ${Math.round((tilt * 180) / Math.PI)}° · cold water in at the low end, out at the high end`;
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
