// "heatpipe cx cy k lab=0 lit=spreader|pipe|fins" — a PART (PARTS.md, batch 6): the copper heat pipe of laptop.js
// on its own, lying on a surface, its origin the surface point under its middle. A copper spreader plate (24 × 20 mm)
// that sits on the processor, held down by a steel spring strap with two screws; the flattened copper pipe soldered
// along it runs +x, bends up and lies along the top of the fin stack (50 × 10 × 5 mm of thin copper fins, each fin a
// line across the stack) at the other end, sealed with a crimped tip. 12 × 2 × 0.6 cm. Static. Built in mm
// (ISO.mm); anchors in cm: cpu (the spreader's underside, where it presses on the chip) and fins (the stack's middle).
(() => {
  const K = window.K;
  const SP = { x: [-60, -36], y: [-10, 10], z: [0, 1.2] }, FIN = { x: [8, 58], y: [-7, 7], z: [0, 5] }, PW = 3.5, PT = 1.6;
  // the pipe's centre line in (x, z of its underside): along the spreader, a bend up, along the fins
  const PATH = [[-57, 1.2], [-14, 1.2], [-8, 1.6], [-2, 3.4], [3, 4.6], [8, 5], [59, 5]];
  ISO.add({
    name: "heatpipe", title: "Laptop heat pipe (part)", compare: null,
    about: "A copper heat pipe from a laptop: a spreader plate that sits on the processor, the flattened pipe that carries the heat away, and the stack of thin copper fins the fan blows through. anchors: cpu fins",
    line: "heatpipe cx cy k lab=0 lit=spreader|pipe|fins",
    demo: { line: "heatpipe 480 290 55 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "spreader" }, hold: 1.2 }, { set: { lit: "pipe" }, hold: 1.2 }, { set: { lit: "fins" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1", kp = K.cameraOf(Pm).k;
      // the spreader, the strap across it (its feet down to the surface) and its two screws
      const spreader = [T.box(Pm, SP.x, SP.y, SP.z, "hi", T.C.copper)];
      const SX = [-52, -44];
      spreader.push(T.box(Pm, SX, [-14, -10], [0, 0.4], "mid", T.C.steel), T.box(Pm, SX, [10, 14], [0, 0.4], "mid", T.C.steel));
      // the pipe: slab segments following PATH, each a sloped box PW either side of y = 0
      const seg = (a, b) => {
        const V = [[a[0], -PW, a[1]], [b[0], -PW, b[1]], [b[0], PW, b[1]], [a[0], PW, a[1]]], U = V.map(([x, y, z]) => [x, y, z + PT]);
        return ISO.poly([...V, ...U], [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], Pm, "hi");
      };
      const pipe = PATH.slice(1).map((b, i) => seg(PATH[i], b)).join("");
      // the strap: a steel band arching over the pipe, from foot to foot
      const strap = T.box(Pm, SX, [-10, -PW - 0.4], [0.4, SP.z[1] + 0.4], "mid", T.C.steel) + T.box(Pm, SX, [PW + 0.4, 10], [0.4, SP.z[1] + 0.4], "mid", T.C.steel) +
        T.box(Pm, SX, [-PW - 0.4, PW + 0.4], [SP.z[1] + PT, SP.z[1] + PT + 0.4], "mid", T.C.steel) + T.box(Pm, SX, [-PW - 0.4, -PW], [SP.z[1], SP.z[1] + PT], "mid", T.C.steel) + T.box(Pm, SX, [PW, PW + 0.4], [SP.z[1], SP.z[1] + PT], "mid", T.C.steel);
      const screws = [-12, 12].map((y) => T.cyl(Pm, -48, y, 1.8, 0.4, 1, "hi", T.C.steel, 14) + `<path d="${K.pathOf([[-49.2, y, 1.42], [-46.8, y, 1.42]].map((p) => K.iso(p, Pm)))}" stroke="#3c3f45" stroke-width="${Math.max(0.5, kp * 0.3).toFixed(2)}"/>`).join("");
      // the fin stack: a block of thin fins, each a line across its top and down its front face
      const fins = [T.box(Pm, FIN.x, FIN.y, FIN.z, "mid", T.C.copper)], top = [], face = [];
      for (let x = FIN.x[0] + 1.2; x < FIN.x[1] - 0.6; x += 1.2) {
        top.push(K.pathOf([K.iso([x, FIN.y[0], FIN.z[1]], Pm), K.iso([x, FIN.y[1], FIN.z[1]], Pm)]));
        face.push(K.pathOf([K.iso([x, FIN.y[1], FIN.z[0]], Pm), K.iso([x, FIN.y[1], FIN.z[1]], Pm)]));
      }
      fins.push(T.L(top.join("") + face.join(""), { tone: "mid" }));
      // the crimped, soldered tip at the far end of the pipe
      const tip = T.box(Pm, [59, 61], [-PW + 1, PW - 1], [5.2, 6.2], "mid", T.C.copper);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -62, y: -15, w: 125, d: 30, r: 3 }, 0, 6.6, Pm)}"/>` +
        `<g data-name="spreader">${spreader.join("")}</g><g data-name="fins">${fins.join("")}</g><g data-name="pipe">${ISO.tinted(T.C.copper, pipe)}${tip}</g><g data-name="spreader">${strap}${screws}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = T.word(Pm, [-48, 10, 1.2], "spreader (on the processor)", { anchor: "end", dx: -6, dy: 18 }) + T.word(Pm, [-20, 0, 3], "flattened copper pipe", { dy: -16 }) + T.word(Pm, [58, 5, 2.5], "fins", { anchor: "start", dx: 8 });
      g.anchors = { cpu: [-4.8, 0, 0], fins: [3.3, 0, 0.25] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "copper heat pipe · liquid inside boils at the hot end, the vapour carries the heat to the fins and condenses, and the wick brings it back · moves about 15 W";
      B.light(w, g, lit);
      return g;
    },
  });
})();
