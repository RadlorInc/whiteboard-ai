// "plotcompass cx cy k deg=0..360 lab=0 lit=case|needle" — a PART (PARTS.md): a 2 cm plotting compass lying on the
// bench, its origin the surface point under its middle. A white base with a printed card (a ring, 10° ticks, N E S W
// with N toward +x and E toward +y, so the card reads bearings the same way deg does), a steel pivot pin, a
// magnetised needle (red north half, pale south half) on a brass jewel cap, and a clear case: wall and lid with a
// glint. deg = the bench heading of the north end (0 = +x, 90 = +y); set({ deg }) swings it the short way round like
// a real needle, a damped swing (ζ 0.6) that passes its mark by about a tenth and settles. World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 1, H = 0.62, BASE = 0.16, NZ = 0.3, NL = 0.78, NW = 0.12, W0 = 7.5, ZETA = 0.6;
  const NEEDLE_N = ISO.tint("#f6c9c2", ["#c2392b", "#cf4a3b", "#dc5d4e", "#e77a6d"], "#6e1610");
  const NEEDLE_S = ISO.tint("#f1f2f4", ["#a9adb4", "#b9bcc2", "#c9ccd1", "#d9dbdf"], "#45484e");
  const rad = (d) => (d * Math.PI) / 180;

  function bodySvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: 2 * R, d: 2 * R, r: R }, 0, H, P)}"/>`];
    // the white base and its printed card
    out.push(`<g data-name="case">${S(K.cylinder(0, 0, R, 0, BASE, P, 40, 0.03), { tone: "mid" })}</g>`);
    const z = BASE + 0.002, rr = R * 0.84, t = K.radialTicks(0, 0, rr, 36, 9, z, [0.09, 0.17], P);
    out.push(L(K.ring(0, 0, rr, z, P, 40), { tone: "lo" }), L(t.minor, { tone: "faint", free: "start" }), L(t.major, { tone: "lo", free: "start" }));
    // letters with their tops outward, reading from the outside like a compass card
    for (const [a, ch] of [[0, "N"], [90, "E"], [180, "S"], [270, "W"]]) {
      const c = Math.cos(rad(a)), s = Math.sin(rad(a)), r0 = rr - 0.42;
      out.push(LAB.faceText(P, [c * r0, s * r0, z], [-s, c, 0], ch, 0.2, ch === "N" ? "#b0281c" : "#3c3f45", [c, s, 0]));
    }
    // the pivot pin the needle turns on
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.035, BASE, NZ - BASE, P, 10), { tone: "mid", crease: "none" })));
    if (lab) out.push(CIRC.word(P, [0, R, H], "plotting compass"));
    return out.join("");
  }
  // the needle: two thin flat triangles (north red, south pale) on a brass jewel cap, heading a (rad, bench angle)
  function needleSvg(P, a) {
    const c = Math.cos(a), s = Math.sin(a), at = ([u, v]) => [u * c - v * s, u * s + v * c];
    const north = [[NL, 0], [0, NW], [0, -NW]].map(at), south = [[-NL, 0], [0, -NW], [0, NW]].map(at);
    const half = (ring, tint, mid) => ({ k: K.depthOf([...mid, NZ], P), svg: ISO.tinted(tint, S(K.extrude(ring, NZ, 0.035, P), { tone: "mid" })) });
    const parts = [half(north, NEEDLE_N, at([NL / 2, 0])), half(south, NEEDLE_S, at([-NL / 2, 0]))].sort((p, q) => p.k - q.k);
    return parts.map((p) => p.svg).join("") + ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 0.07, NZ + 0.035, 0.05, P, 12), { tone: "mid" }));
  }
  // the clear case over it all: wall and lid, see-through, with a glint on the lid
  function caseSvg(P) {
    const g0 = K.iso([-0.55, -0.25, H + 0.002], P), g1 = K.iso([0.1, -0.72, H + 0.002], P), g2 = K.iso([-0.62, 0.05, H + 0.002], P);
    return `<g data-name="case"><g opacity=".32">${ISO.tinted(ISO.T.glass, S(K.cylinder(0, 0, R, BASE, H - BASE, P, 40, 0.04), { tone: "mid" }))}</g>` +
      `<path d="M${g2[0].toFixed(1)} ${g2[1].toFixed(1)} Q${g0[0].toFixed(1)} ${g0[1].toFixed(1)} ${g1[0].toFixed(1)} ${g1[1].toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="${Math.max(0.6, K.cameraOf(P).k * 0.06).toFixed(2)}" stroke-linecap="round" opacity=".9"/></g>`;
  }

  ISO.add({
    name: "plotcompass", title: "Plotting compass (part)", compare: null,
    about: "A 2 cm plotting compass on the bench: clear case, a card with N E S W, a needle with a red north half that swings to deg (the bench heading of the north end, 0 = +x, 90 = +y) and settles with a small overshoot. anchors: none",
    line: "plotcompass cx cy k deg=0..360 lab=0 lit=case|needle",
    demo: { line: "plotcompass 480 300 60 deg=0", script: [{ set: {}, hold: 1 }, { set: { deg: 90 }, hold: "settle" }, { set: { deg: 225, lit: "needle" }, hold: "settle" }, { set: { deg: 330, lit: "case" }, hold: "settle" }, { set: { deg: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      g.innerHTML = bodySvg(P, lab) + `<g data-name="needle"></g>` + caseSvg(P);
      const el = g.querySelector('[data-name="needle"]'), w = ISO.writer(), light = CIRC.lighter(g);
      const s = { to: rad(ISO.num(o, "deg", 0) % 360), a: 0, v: 0 };
      s.a = s.to;
      let lit = o.lit || "";
      const draw = () => { const a = Math.round(s.a * 500) / 500; w.rebuild(el, String(a), () => needleSvg(P, a)); light(lit); };
      g.set = (p) => {
        if (p.deg !== undefined && Number.isFinite(+p.deg)) {
          // the needle takes the short way round: keep the target within half a turn of where it is now
          let to = rad(+p.deg); to += Math.round((s.a - to) / (2 * Math.PI)) * 2 * Math.PI; s.to = to;
        }
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        if (ISO.still() || dt > 1) { s.a = s.to; s.v = 0; }
        else for (let left = dt; left > 1e-6; left -= 1 / 120) {   // a damped swing, in small steps so it stays stable
          const h = Math.min(left, 1 / 120);
          s.v += (W0 * W0 * (s.to - s.a) - 2 * ZETA * W0 * s.v) * h; s.a += s.v * h;
        }
        if (Math.abs(s.to - s.a) < 0.001 && Math.abs(s.v) < 0.01) { s.a = s.to; s.v = 0; }
        draw();
        return s.a !== s.to;
      };
      g.readout = () => {
        const d = Math.round((((s.a * 180) / Math.PI) % 360 + 360) % 360);
        return `plotting compass · north end heading ${d}° on the bench (0° = +x, 90° = +y) · it lines up with the magnetic field where it sits`;
      };
      draw();
      return g;
    },
  });
})();
