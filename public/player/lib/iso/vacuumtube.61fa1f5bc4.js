// "vacuumtube cx cy k half=all|back|front lab=0 lit=glass|ends|saddles|rail|port" — a PART (PARTS.md, batch 5): the
// evacuated tube of sterngerlach.js that the whole experiment runs in (air would scatter the atoms). A 60 cm glass
// tube, 15 cm across and 4 mm thick, lying along x on two felt-lined wooden saddles with steel straps, closed by steel
// flanges: the −x end blank, the +x end with two electrical feedthroughs (the oven's heater current). A glass side arm
// near the −x end leads to the pump through a stopcock. Inside, a flat aluminium rail along the bottom carries the
// apparatus: its top (anchor `floor`) is 5 cm under the axis, so an atomoven, sgmagnet and glassplate placed at=
// floor have their beam on the tube's axis. half=back draws only what is behind the apparatus (far flange, the tube's
// glass, the rail), half=front only what is in front of it (saddles, straps, near flange, side arm, glints): place
// back first, then the apparatus, then front. Origin the bench under its middle. Static.
// anchors: floor axis left right port. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 30, R = 7.5, AZ = 12, FLOOR = 7, SX = 20, PORT = -23;
  const X = (o) => window.B29.X(o), Z = (o) => window.B29.Z(o);
  const PINE = ISO.tint("#f6e6c9", ["#d2a96f", "#ddb985", "#e6c89c", "#eed6b1"], "#74521f");
  const FELT = "#3d5a3a";
  // a saddle in y–z (seen from +x): a block whose top is cut to the tube's curve (radius R + 0.15 felt)
  const seat = (y) => AZ - Math.sqrt((R + 0.15) ** 2 - y * y);
  function saddle(P, x) {
    const top = []; for (let i = 0; i <= 16; i++) { const y = 6 - (12 * i) / 16; top.push([y, seat(y)]); }
    const out = [ISO.tinted(PINE, ISO.prismX(P, [[-6.5, 0], [6.5, 0], [6.5, seat(6) - 0.4], [6, seat(6)], ...top.slice(1, -1), [-6, seat(-6)], [-6.5, seat(6) - 0.4]], x - 1.5, x + 1.5, ["#d2a96f", "#eed6b1"], "#f6e6c9", "#74521f"))];
    // the felt lining's edge on the near face, and the steel strap over the tube with its two bolts into the saddle
    out.push(`<path d="${K.pathOf(top.slice(1, -1).map(([y, z]) => K.iso([x + 1.51, y, z], P)))}" fill="none" stroke="${FELT}" stroke-width="1.4"/>`);
    out.push(strap(P, x, -0.66, Math.PI / 2), ISO.tinted(ISO.T.steel, S(K.cylinder(x, 6.2, 0.45, seat(6) - 0.2, 0.5, P, 6), { tone: "hi" })));
    return out.join("");
  }
  // a steel strap over the tube, from angle a0 to a1 round it (0 = toward +y, π/2 = the top): a band 1.2 cm wide
  function strap(P, x, a0, a1) {
    const F = X([x, 0, AZ]), n = 18, e = (s) => Array.from({ length: n + 1 }, (_, i) => G.pointOf(F, s, R + 0.12, a0 + ((a1 - a0) * i) / n));
    const pts = [...e(-0.6), ...e(0.6).reverse()].map((p) => K.iso(p, P));
    return `<path d="${K.pathOf(pts, true)}" fill="#c7c9cd" stroke="#3c3f45" stroke-width="0.8" stroke-linejoin="round"/>`;
  }
  // a flange: a steel ring band round the tube's end with its bolt heads, and the end plate
  function flange(P, x, sgn) {
    const F = X([x, 0, AZ]), s0 = sgn > 0 ? -1.2 : 0, s1 = sgn > 0 ? 0 : 1.2, face = sgn > 0 ? 0.51 : 1.21;
    const ring = S(G.ringBand(s0, s1, R - 0.1, R + 1.1, F, P, { hole: [s1, R - 0.1] }), { tone: "hi" }), plate = S(G.disc(sgn > 0 ? 0 : -0.5, sgn > 0 ? 0.5 : 0, R + 1.1, F, P), { tone: "mid" });
    const bolts = D(Array.from({ length: 8 }, (_, i) => K.iso(G.pointOf(F, face, sgn > 0 ? R + 0.55 : R + 0.5, (i / 8) * Math.PI * 2 + 0.2), P)), { size: 0.7 });
    return ISO.tinted(ISO.T.steel, sgn > 0 ? ring + plate : plate + ring) + bolts;
  }
  // the +x end plate's two feedthroughs: ceramic bushes with brass posts
  const feed = (P) => [-2, 2].map((y) => { const F = X([HX + 0.5, y, AZ + 1.5]); return ISO.tinted(ISO.T.plastic, S(G.disc(0, 0.8, 0.7, F, P), { tone: "hi" })) + ISO.tinted(ISO.T.brass, S(G.disc(0.8, 1.9, 0.22, F, P), { tone: "hi", crease: "none" }) + S(G.disc(1.4, 1.7, 0.42, F, P, { steps: 6 }), { tone: "mid" })); }).join("");
  // the glass side arm up from the top near −x, a stopcock with its key, a hose barb toward the pump
  function port(P) {
    const F = Z([PORT, 0, AZ + R - 0.6]), out = [];
    out.push(`<g class="b29-glass" style="${ISO.T.glass}">${S(G.disc(0, 4.2, 0.9, F, P), { tone: "hi" })}</g>`);
    out.push(`<g class="b29-glass" style="${ISO.T.glass}">${S(G.solidOf([[4.2, 0.9], [4.4, 1.5, 1], [6, 1.5, 1], [6.2, 0.9]], F, P), { tone: "hi" })}</g>`);
    out.push(ISO.tinted(ISO.T.glass, S(G.disc(-1.6, 1.6, 0.42, X([PORT, 0, AZ + R + 4.6]), P), { tone: "mid" }) + S(G.disc(1.6, 2.2, 1.0, X([PORT, 0, AZ + R + 4.6]), P), { tone: "hi" })));
    out.push(`<g class="b29-glass" style="${ISO.T.glass}">${S(G.solidOf([[6.2, 0.6], [7.6, 0.6, 1], [7.8, 0.75], [8.4, 0.5]], F, P), { tone: "hi" })}</g>`);
    out.push(ISO.tinted(ISO.T.rubber, S(G.disc(8.0, 9.2, 0.82, F, P), { tone: "mid" })));
    return out.join("");
  }

  ISO.add({
    name: "vacuumtube", title: "Vacuum tube (part)", compare: null,
    about: "A 60 cm evacuated glass tube, 15 cm across, on two saddles with steel end flanges, a pump arm with a stopcock and a rail inside for the Stern–Gerlach oven, magnet and plate, so the silver atoms fly without hitting air. anchors: floor axis left right port",
    line: "vacuumtube cx cy k half=all|back|front lab=0 lit=glass|ends|saddles|rail|port",
    demo: { line: "vacuumtube 480 390 11 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "glass" }, hold: 1.2 }, { set: { lit: "rail" }, hold: 1.2 }, { set: { lit: "port" }, hold: 1.2 }, { set: { lit: "ends" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kS = G.scaleOf(P), B29 = window.B29;
      const half = ["back", "front"].includes(o.half) ? o.half : "all", back = half !== "front", front = half !== "back";
      const F = X([0, 0, AZ]);
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 1, y: -R - 1, w: 2 * HX + 2, d: 2 * R + 2, r: 3 }, 0, 0.5, P)}"/>`;
      // the rail: an aluminium bar on two feet resting on the glass floor, a row of tapped holes along its top
      const rail = ISO.tinted(ISO.T.steel, [-24, 24].map((x) => ISO.wbox(P, [x - 1.5, x + 1.5], [-2.4, 2.4], [AZ - R + 0.4 + 0.45, FLOOR - 1.2], "lo")).join("") + ISO.wbox(P, [-27, 27], [-2, 2], [FLOOR - 1.2, FLOOR], "mid") +
        D(Array.from({ length: 11 }, (_, i) => K.iso([-25 + i * 5, 0, FLOOR], P)), { size: 0.45 }));
      const glass = `<g class="b29-glass" style="${ISO.T.glass}">${S(G.ringBand(-HX + 1.2, HX - 1.2, R - 0.4, R, F, P), { tone: "hi" })}</g>`;
      const glints = `<path d="${[[0.35, 0.82], [0.5, 0.7]].map(([a, f]) => K.pathOf([K.iso(G.pointOf(F, -HX + 6, R + 0.02, a), P), K.iso(G.pointOf(F, -HX + 6 + 48 * f, R + 0.02, a), P)])).join("")}" stroke="#fff" stroke-width="${Math.max(0.8, kS * 0.12).toFixed(2)}" stroke-linecap="round" opacity=".9" data-free=""/>`;
      const parts = [];
      if (back) parts.push(halo, `<g data-name="ends">${flange(P, -HX, -1)}</g><g data-name="glass">${glass}</g><g data-name="saddles">${strap(P, -SX, Math.PI / 2, Math.PI + 0.66)}${strap(P, SX, Math.PI / 2, Math.PI + 0.66)}</g><g data-name="rail">${rail}</g>`);
      if (front) parts.push(`<g data-name="saddles">${saddle(P, -SX)}${saddle(P, SX)}</g><g data-name="glass">${glints}</g><g data-name="port">${port(P)}</g><g data-name="ends">${flange(P, HX, 1)}${feed(P)}</g>`,
        `<g data-part="words">${lab ? ISO.word(K.iso([PORT, 0, AZ + R + 9.4], P), "to the pump", "#555", { size: 13, anchor: "end", dy: -4 }) + ISO.word(K.iso([HX + 1, R + 1, AZ - R], P), "vacuum tube", "#555", { size: 13, anchor: "start", dy: 14 }) : ""}</g>`);
      g.innerHTML = B29.GLASS + parts.join("");
      g.anchors = { floor: [0, 0, FLOOR], axis: [0, 0, AZ], left: [-HX, 0, AZ], right: [HX, 0, AZ], port: [PORT, 0, AZ + R + 9.2] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B29.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "glass vacuum tube 60 × 15 cm · pumped down to about a millionth of a millibar, so a silver atom flies its whole length without hitting a gas molecule";
      B29.light(w, g, lit);
      return g;
    },
  });
})();
