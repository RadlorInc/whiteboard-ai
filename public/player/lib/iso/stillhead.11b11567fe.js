// "stillhead cx cy k lab=0 lit=head|arm|bung" — a PART (PARTS.md, batch 5): the distill scene's still head, origin the
// top of the flask neck it sits in (at= a roundflask's `neck`). A 1.9 cm glass tube 6 cm tall: a frosted ground-glass
// cone that goes 1.5 cm down into the neck, a bead that rests on the neck's lip, the tube, a lip at its top and a rubber
// bung in it with a hole for the thermometer. The side arm (0.9 cm) leaves the tube 2.6 cm above the neck and slopes
// 14° down toward −x (flip=1 sends it to +x on the board) to its frosted end cone, where a condenser's inner tube
// joins (anchor `arm`). A thermometer at= `therm` (labthermo aim=down, its bulb pointing down) has its bulb level with the side arm, so it reads
// the vapour that leaves. Static. Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const SLOPE = (14 * Math.PI) / 180, DIR = [-Math.cos(SLOPE), 0, -Math.sin(SLOPE)], ARMZ = 26, ARM = 85, R = 9.5, RA = 4.4;
  // the outer meridian from the cone's tip (s = 0 at z = −15): cone, bead on the lip, tube, top lip
  const PROFILE = [[0, 9.6], [15, 10.6], [15.4, 12.2, 1], [17.6, 12.2, 1], [18, R], [61, R], [61.4, 10.4, 1], [63, 10.4]];
  const along = (s) => [Math.cos(SLOPE) * -(R - 1) + DIR[0] * s, 0, ARMZ + DIR[2] * s];

  ISO.add({
    name: "stillhead", title: "Still head (part)", compare: null,
    about: "A glass still head that sits in a flask's neck: a 1.9 cm tube with a bung for the thermometer on top and a side arm sloping 14° down to the condenser; the thermometer bulb sits level with the side arm. anchors: arm therm top",
    line: "stillhead cx cy k lab=0 lit=head|arm|bung",
    demo: { line: "stillhead 560 380 30 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "arm" }, hold: 1.5 }, { set: { lit: "bung" }, hold: 1.5 }, { set: { lit: "head" }, hold: 1.5 }] },
    make([cx = 480, cy = 380, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const V = LAB.vessel(Pm, [0, 0, -15], PROFILE, { wall: 1.1, base: 0.5 });
      const end = along(ARM), cone0 = along(ARM - 14);
      // the side arm (behind the tube from this camera): fused into the tube's wall, a glass tube to the frosted end cone
      const arm = LAB.tube(Pm, [along(-2), cone0], RA, { inner: "#ffffff" }) + LAB.tube(Pm, [cone0, end], RA + 0.9, { fill: "#f2f5f7" }) +
        LAB.tube(Pm, [along(ARM - 15.5), along(ARM - 14)], RA + 1.2) +
        // ground-glass texture on the cone: short rings across it
        `<path d="${[2, 5, 8, 11].map((s) => { const c = along(ARM - 14 + s), n = [Math.sin(SLOPE) * (RA + 0.9), 0, Math.cos(SLOPE) * (RA + 0.9)]; return K.segment([c[0] - n[0], 0, c[2] - n[2]], [c[0] + n[0], 0, c[2] + n[2]], Pm); }).join("")}" stroke="#b9c7d1" stroke-width="0.6" data-free=""/>`;
      // the frosted cone in the neck (its ground surface)
      const frost = LAB.tube(Pm, [[0, 0, -14.5], [0, 0, -0.4]], 10, { fill: "#f4f7f9" }) +
        `<path d="${[-12, -9, -6, -3].map((z) => K.segment([-9.9 - (z + 15) * 0.05, 0, z], [9.9 + (z + 15) * 0.05, 0, z], Pm)).join("")}" stroke="#c4d0d8" stroke-width="0.6" opacity=".8" data-free=""/>`;
      const bungZ = 42, bung = LAB.bung(Pm, [0, 0], bungZ, 8.6, 10);
      const hole = `<path d="${K.pathOf(K.circleRing(0, 0, 2.9, 24).map(([a, b]) => K.iso([a, b, bungZ + 10.02], Pm)), true)}" fill="#3a3c40" stroke="#1f2023" stroke-width="0.5"/>`;
      g.innerHTML = `<g data-name="arm">${arm}</g><g data-name="head">${V.back()}${frost}${V.front()}</g><g data-name="bung">${bung}${hole}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([12, 0, 56], Pm), "still head", "#445", { size: 14, anchor: "start" }) + ISO.word(K.iso(along(ARM * 0.6), Pm), "side arm", "#445", { size: 13, dy: -14 });
      const cm = (p) => p.map((v) => +(v / 10).toFixed(3));
      g.anchors = { arm: cm(end), therm: [0, 0, (ARMZ - 3) / 10], top: [0, 0, (bungZ + 10) / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B11.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "still head on the flask neck · 1.9 cm tube, bung on top for the thermometer · side arm 0.9 cm sloping 14° down to the condenser · the thermometer bulb level with the side arm reads the vapour that leaves";
      B11.light(w, g, lit);
      return g;
    },
  });
})();
