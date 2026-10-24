// "wheelchair cx cy size roll=cm brake=0|1 lab=1 lit=wheel|pushrim|caster|brake|footrest|seat" — a manual wheelchair.
// Two 24-inch (61 cm) rear wheels with spokes and push rims, two front castors in their forks, the side frames with
// the seat and back slings, a cross-brace under the seat (it folds), armrests, push handles, footrests and the brake
// levers that press a shoe against each tyre. One turn of the push rim moves the chair π × 61 cm = 1.92 m.
// set({ roll }) rolls it forward that far (the wheels and castors turn as it goes); set({ brake: 1 }) pushes the
// levers forward: the shoes grip the tyres and it won't roll.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Forward is +x; the rear axle at x = 0; the side you see is +y.
  const R = 30.5, AZ = 30.5, WY = 28, FY = 23, CR = 9, CX = 46, CY = 20;
  const STEEL = "#3c3f45", TUBE = "#c9ccd1", SLING = ISO.tint("#3b4f66", ["#1f2b38", "#263443", "#2e3d4e", "#354658"], "#0f1720");
  const open = (svg) => svg.replace(/<path class="iso-fill"[^>]*>/, "").replace(/<path class="iso-top"[^>]*>/, "");
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const pipe = (P, pts, r) => { const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 2 * r * G.scaleOf(P); return `<path d="${d}" fill="none" stroke="${STEEL}" stroke-width="${(w + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${TUBE}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#f2f3f5" stroke-width="${(w * 0.3).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-0.3 -0.5)"/>`; };
  // A wheel's spokes, rim and hub flange, drawn flat in its own plane (x right, y down = −z) so it can turn by rotate().
  const spokesArt = (r, n, hub) => {
    let d = "";
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = a + (i % 2 ? 0.5 : -0.5); d += `M${(Math.cos(a) * hub).toFixed(2)} ${(Math.sin(a) * hub).toFixed(2)}L${(Math.cos(b) * r).toFixed(2)} ${(Math.sin(b) * r).toFixed(2)}`; }
    return `<path d="${d}" stroke="#7d838b" stroke-width="0.32" fill="none"/><circle r="${r}" fill="none" stroke="#5d636b" stroke-width="1.4"/><circle r="${r - 0.9}" fill="none" stroke="#d6d9dd" stroke-width="0.5"/><circle r="${hub + 0.3}" fill="#c9ccd1" stroke="#3c3f45" stroke-width="0.4"/>`;
  };

  function wheelSvg(P, side) {
    const y = side * WY, F = yAx([0, y, AZ]), out = [];
    out.push(ISO.tinted(ISO.T.rubber, open(S(G.ringBand(-1.7, 1.7, R - 2.6, R, F, P), { tone: "mid" }))));
    out.push(`<g transform="${ISO.faceMatrix(P, [0, y + 0.4, AZ], 1)}"><g data-spin>${spokesArt(R - 2.8, 24, 3.4)}</g></g>`);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-3.2, 3.2, 2.2, F, P), { tone: "mid" }) + S(G.disc(side > 0 ? 3.2 : -4, side > 0 ? 4 : -3.2, 1.2, F, P), { tone: "mid" })));
    return out.join("");
  }
  // The push rim: a ring just outside the tyre, held by six standoffs that turn with the wheel.
  function pushrimSvg(P, side) {
    const y = side * (WY + 3.4), F = yAx([0, y, AZ]);
    return `<g transform="${ISO.faceMatrix(P, [0, side * (WY + 1.8), AZ], 1)}"><g data-spin>${Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 26).toFixed(2)}" cy="${(Math.sin(a) * 26).toFixed(2)}" r="0.9" fill="#c9ccd1" stroke="#3c3f45" stroke-width="0.35"/>`; }).join("")}</g></g>` +
      ISO.tinted(ISO.T.steel, open(S(G.ringBand(-0.8, 0.8, 25.2, 26.8, F, P), { tone: "hi" })));
  }
  // A castor: the stem socket, the fork and the small wheel (its spokes turn).
  function casterSvg(P, side) {
    const y = side * CY, F = yAx([CX + 4, y, CR]), out = [];
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [CX - 1, CX + 6], [y - 3, y - 2.2], [CR, CR + 13], "mid")));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-1.4, 1.4, CR - 2, F, P), { tone: "hi" })), ISO.tinted(ISO.T.rubber, open(S(G.ringBand(-1.6, 1.6, CR - 2, CR, F, P), { tone: "mid" }))));
    out.push(`<g transform="${ISO.faceMatrix(P, [CX + 4, y + 1.5, CR], 1)}"><g data-spin><path d="M-5 0H5M0 -5V5" stroke="#7d838b" stroke-width="0.8"/></g></g>`);
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [CX - 1, CX + 6], [y + 2.2, y + 3], [CR, CR + 13], "mid") + ISO.wbox(P, [CX - 1.5, CX + 6.5], [y - 3, y + 3], [CR + 13, CR + 15], "mid")));
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(CX + 2.5, y, 1.8, CR + 15, 7, P, 16), { tone: "mid" })));
    return out.join("");
  }
  // One side frame: rear upright with the push handle, seat rail, front upright to the castor socket, lower rail,
  // armrest posts and pad, the footrest hanger and plate.
  function sideSvg(P, side) {
    const y = side * FY, out = [];
    out.push(pipe(P, [[CX + 2.5, y, 22], [-1, y, 30], [-1, y, 50], [-5, y, 92], [-14, y, 92]], 1.2));
    out.push(pipe(P, [[-1, y, 50], [44, y, 50], [CX + 2.5, y, 22]], 1.2));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 2.6, 4, yAx([0, y + side * 0, AZ]), P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-1.4, 1.4, 1.7, G.frameAlong([-10, y, 92], [1, 0, 0]), P), { tone: "hi" }) + S(G.disc(-5, 3, 1.9, G.frameAlong([-10, y, 92], [1, 0, 0]), P), { tone: "hi" })));
    out.push(pipe(P, [[8, y, 50], [8, y, 69]], 1) + pipe(P, [[36, y, 50], [36, y, 69]], 1));
    out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: 4, y: y - 2.6, w: 36, d: 5.2, r: 2 }, 69, 3.4, P, 3, 0.4), { tone: "hi" })));
    out.push(pipe(P, [[44, y, 50], [54, y - side * 1, 14]], 1));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [49, 64], side > 0 ? [y - 15, y + 1] : [y - 1, y + 15], [11.6, 13.2], "hi")));
    return out.join("");
  }
  function seatSvg(P) {
    const out = [];
    // cross-brace under the seat (the chair folds about it)
    out.push(pipe(P, [[22, -FY + 2, 49], [22, FY - 2, 31]], 1) + pipe(P, [[22, FY - 2, 49], [22, -FY + 2, 31]], 1));
    out.push(ISO.tinted(SLING, ISO.poly([[0, -FY, 49.5], [43, -FY, 49.5], [43, FY, 49.5], [0, FY, 49.5], [0, -FY, 51.5], [43, -FY, 51.5], [43, FY, 51.5], [0, FY, 51.5]], ISO.BOX_F, P, "mid")));
    out.push(ISO.tinted(SLING, ISO.poly([[-1.6, -FY, 54], [-1, -FY, 54], [-1, FY, 54], [-1.6, FY, 54], [-5.2, -FY, 88], [-4.6, -FY, 88], [-4.6, FY, 88], [-5.2, FY, 88]], ISO.BOX_F, P, "mid")));
    return out.join("");
  }
  // The brake: a lever on the seat rail; off it stands up and back, on it is pushed forward and the shoe meets the tyre.
  function brakeSvg(P, side, b) {
    const y = side * (FY + 2.4), a = -0.9 + b * 1.25, pv = [24, y, 47.5], tip = [pv[0] + Math.sin(a) * 15, y, pv[2] + Math.cos(a) * 15];
    const shoeX = 23 + b * 2.8, out = [];
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [20, 28], [y - 1.2, y + 1.2], [45, 50], "mid")));
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [shoeX, shoeX + 3.6], [side * WY - 1.4, side * WY + 1.4], [43.2, 46.2], "mid")));
    out.push(pipe(P, [pv, tip], 0.7), ISO.tinted(ISO.T.red, S(G.sphereOf(tip, 1.8, P), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "wheelchair", title: "Wheelchair", compare: "wheelchair 480 270 320",
    about: "A manual wheelchair: push the rims and the 61 cm rear wheels roll it 1.92 m a turn; push the brake levers forward and the shoes lock the tyres.",
    line: "wheelchair cx cy size roll=cm brake=0|1 lab=1 lit=wheel|pushrim|caster|brake|footrest|seat",
    demo: { line: "wheelchair 480 270 320 brake=0", script: [{ set: { roll: 60, lit: "pushrim" }, hold: "settle" }, { set: { brake: 1, lit: "brake" }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = size * 2, H = size * 1.36, START = -30;
      const pts = [[START - R, -WY - 4, 0], [START + 66, WY + 4, 0], [START - R, WY + 4, 0], [START + 66, -WY - 4, 0], [START - 14, 0, 94], [30 + 66, WY + 4, 0], [30 - R, WY + 4, 0], [30 - 14, 0, 94]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 36, elevation: 22 }, parent);
      const FL = { x: -70, y: -46, w: 180, d: 92, r: 4 };
      g.innerHTML = `<g>${ISO.tinted(ISO.T.road, S(K.slabOf(FL, -3, 3, P, 4, 0.5), { tone: "lo", inner: L(K.sideSeam(FL, -1.5, P, 4), { tone: "faint" }) }))}</g><g data-part="chair">` +
        `<path class="iso-halo" d="${K.haloOf({ x: -30, y: -30, w: 90, d: 60, r: 20 }, 0, 10, P)}"/>` +
        `<g data-name="pushrim-far">${pushrimSvg(P, -1)}</g><g data-name="wheel-far">${wheelSvg(P, -1)}</g><g data-name="caster-far">${casterSvg(P, -1)}</g><g data-name="brake-far"></g><g data-name="frame-far">${sideSvg(P, -1)}</g>` +
        `<g data-name="seat">${seatSvg(P)}</g><g data-name="frame">${sideSvg(P, 1)}</g><g data-name="brake"></g><g data-name="caster">${casterSvg(P, 1)}</g>` +
        `<g data-name="wheel">${wheelSvg(P, 1)}</g><g data-name="pushrim">${pushrimSvg(P, 1)}</g><g data-part="words"></g></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const big = [...g.querySelectorAll('[data-name^="wheel"] [data-spin], [data-name^="pushrim"] [data-spin]')], small = [...g.querySelectorAll('[data-name^="caster"] [data-spin]')];
      const s = { roll: ISO.clamp(ISO.num(o, "roll", 0), 0, 120), x: 0, brake: o.brake === "1", b: 0, lit: o.lit || "" };
      s.x = s.roll; s.b = s.brake ? 1 : 0;
      if (lab) {
        const word = (p, txt, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word([0, WY + 3.4, AZ + 27], "Push rim", "end", -4, -6) + word([0, WY, 0], "Rear wheel", "middle", 26) + word([CX + 4, CY, 0], "Castor", "middle", 22) +
          word([62, FY, 12], "Footrest", "start", 4, 8) + word([24, FY + 2.4, 62], "Brake", "middle", -8);
      }
      const draw = () => {
        const dx = START + s.x;
        w.attr(q("chair"), "transform", K.translateAlong(P, [dx, 0, 0]));
        // rolling without slipping: the wheel turns x / r radians (clockwise as seen from the +y side when going +x)
        const a = ((s.x / R) * 180) / Math.PI, c = ((s.x / CR) * 180) / Math.PI;
        big.forEach((e) => w.attr(e, "transform", `rotate(${a.toFixed(2)})`));
        small.forEach((e) => w.attr(e, "transform", `rotate(${c.toFixed(2)})`));
        w.rebuild(nm("brake"), s.b.toFixed(3), () => brakeSvg(P, 1, s.b));
        w.rebuild(nm("brake-far"), s.b.toFixed(3), () => brakeSvg(P, -1, s.b));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
        return dx;
      };
      g.set = (p) => { if (p.roll !== undefined) s.roll = ISO.clamp(+p.roll, 0, 120); if (p.brake !== undefined) s.brake = !!+p.brake; if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        // rolls at a walking push (about 0.5 m/s), easing at the ends; a braked chair stays put
        if (!s.brake || s.b < 0.5) { const gap = s.roll - s.x; s.x = calm || Math.abs(gap) < 0.05 ? s.roll : s.x + Math.sign(gap) * Math.min(Math.abs(gap), Math.max(6, Math.min(50, Math.abs(gap) * 3)) * dt); }
        s.b = ISO.follow(s.b, s.brake ? 1 : 0, dt, 0.15, calm);
        draw();
        return Math.abs(s.x - s.roll) > 0.01 && !(s.brake && s.b > 0.5) || Math.abs(s.b - (s.brake ? 1 : 0)) > 1e-3;
      };
      g.readout = () => {
        const turns = s.x / (Math.PI * 2 * R);
        return `${s.brake ? "brakes on: shoes grip the tyres, the chair won't roll" : "brakes off"} · rolled ${(s.x / 100).toFixed(2)} m = ${turns.toFixed(2)} turns of the 61 cm wheel (1.92 m a turn)`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
