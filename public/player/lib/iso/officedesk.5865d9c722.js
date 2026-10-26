// "officedesk cx cy k lab=0 lit=top|legs|frame" — a PART (batch 6): an office desk standing on the floor, its origin
// the floor point under its middle. A 162 × 65 cm wooden top 2.5 cm thick with rounded corners and an edge band, at
// 75 cm, on a grey steel frame: four 5 cm square legs with levelling feet, rails under the top round all four sides,
// and a cable hole with its black grommet at the back right. Where a monitor (anchor back), a keyboard and mouse
// (front) or a mic stand sit. From computer.js and mic.js (their desks). Static. World units: 1 = 1 cm.
(() => {
  const K = window.K;
  const HX = 81, HY = 32.5, ZT = 72.5, TH = 2.5, LX = 74, LY = 26, LW = 2.5;
  const OAK = ISO.tint("#f3e2c4", ["#c99d66", "#d4ad7a", "#ddbd90", "#e7cda6"], "#6e4a1e");
  const FRAME = ISO.tint("#d2d4d7", ["#7f838a", "#93979d", "#a6aaaf", "#babdc1"], "#33363b");
  ISO.add({
    name: "officedesk", title: "Office desk (part)", compare: null,
    about: "An office desk: wide rounded-corner wooden top at 75 cm on a steel frame with four legs, a cable hole at the back; where a monitor, keyboard, mouse or mic stand sit. anchors: top back front",
    line: "officedesk cx cy k lab=0 lit=top|legs|frame",
    demo: { line: "officedesk 480 440 3.2 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "legs" }, hold: 1.5 }, { set: { lit: "top" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, B = window.B33;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const box = (x, y, z, c = FRAME, tone = "mid") => ISO.tinted(c, ISO.wbox(P, x, y, z, tone));
      const leg = (x, y) => ISO.tinted(ISO.T.rubber, K.solidSvg(K.cylinder(x, y, 1.6, 0, 1.2, P, 16), { tone: "lo" })) + box([x - LW, x + LW], [y - LW, y + LW], [1.2, ZT - 0.01]);
      const legs = [[-LX, -LY], [LX, -LY], [-LX, LY], [LX, LY]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
      const back = legs.slice(0, 2).map(([x, y]) => leg(x, y)).join(""), front = legs.slice(2).map(([x, y]) => leg(x, y)).join("");
      // rails between the legs just under the top: back, the two sides, front
      const rails = box([-LX + LW, LX - LW], [-LY - 1, -LY + 1], [ZT - 7, ZT]) + box([-LX - 1, -LX + 1], [-LY + LW, LY - LW], [ZT - 7, ZT]) + box([LX - 1, LX + 1], [-LY + LW, LY - LW], [ZT - 7, ZT]) + box([-LX + LW, LX - LW], [LY - 1, LY + 1], [ZT - 7, ZT]);
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 5 }, Z = ZT + TH;
      const top = ISO.tinted(OAK, K.solidSvg(K.slabOf(plan, ZT, TH, P, 6, 0.4), { tone: "mid", inner: K.lineSvg(K.sideSeam(plan, ZT + 0.5, P, 6), { tone: "faint" }) }));
      // a faint wood grain on the top (printed in the laminate) and the cable hole with its grommet
      const grain = [-22, -9, 4, 17, 26].map((y, i) => K.pathOf([K.iso([-HX + 12 + i * 7, y, Z + 0.02], P), K.iso([HX - 18 - i * 5, y + 1.5, Z + 0.02], P)])).join("");
      const hole = `<path d="${B.circle(P, [62, -24, Z + 0.03], [1, 0, 0], [0, 1, 0], 3.2, 24)}" fill="#3a3c40" stroke="#16171a" stroke-width=".6"/><path d="${B.circle(P, [62, -24, Z + 0.04], [1, 0, 0], [0, 1, 0], 2.2, 24)}" fill="#1b1c1f"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, Z, P)}"/><g data-name="legs">${back}</g><g data-name="frame">${rails}</g><g data-name="legs">${front}</g>` +
        `<g data-name="top">${top}${K.lineSvg(grain, { tone: "faint", free: true })}${hole}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(P, lab, [HX, HY, Z], "desk", "#556", { anchor: "start", dx: 8 });
      g.anchors = { top: [0, 0, Z], back: [0, -16, Z], front: [0, 16, Z] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "office desk · top 162 × 65 cm at 75 cm high · steel frame";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
