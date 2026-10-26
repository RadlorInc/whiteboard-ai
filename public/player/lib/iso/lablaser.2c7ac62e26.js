// "lablaser cx cy k on=0|1 c=red|green bz=6..30 beam=0..300 lab=0 lit=body|mount|switch|beam" — a PART (PARTS.md,
// batch 5): a school lab laser (red 650 nm or green 532 nm diode, class 2) lying along x in a V-mount, its aperture
// toward −x, its origin the surface point under its middle. A black base plate with four cap screws, a post and
// collar, the V-block the 3 cm tube rests in (the tube's axis bz cm over the origin), a strap over the tube; the
// 15 cm aluminium tube with a yellow warning band, a knurled front bezel and the nose with its aperture; on the back
// cap a key switch, an emission LED and a DC socket. on=1: the beam leaves the aperture along −x for `beam` cm (place a
// screen there) and the LED glows. set({ on, c, beam }). World units: 1 = 1 cm. anchors: beam (the aperture) end.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const COL = { red: { c: "#e5302a", nm: 650 }, green: { c: "#22b04b", nm: 532 } };
  const R = 1.5, HL = 7.5, NOSE = 8.6;   // tube radius, half length; the nose's end (the aperture) at x = −NOSE
  const YELLOW = ISO.tint("#ffd84a", ["#c9a21a", "#d6b02a", "#e2c03a", "#efcf44"], "#5a4508");

  function bodySvg(P, bz) {
    const F = G.frameOf([0, 0, bz], [-1, 0, 0], [0, -1, 0], [0, 0, 1]), out = [];
    const face = G.angleToward(F, G.viewOf(P));
    // the back cap (at +x, s = −HL), the tube, the warning band, the bezel and the nose (s toward the aperture)
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[-HL, 0], [-HL, R * 0.9], [-HL + 0.15, R + 0.05], [-HL + 1.1, R + 0.05], [-HL + 1.1, R - 0.02]], F, P), { tone: "mid" })));
    out.push(ISO.tinted(window.B03.ALU, S(G.lathe([[-HL + 1.1, R - 0.02], [-HL + 1.1, R], [HL - 1.6, R], [HL - 1.6, R - 0.02]], F, P), { tone: "hi", inner: L(G.arcOf(F, -HL + 4.2, R, P), { tone: "faint" }) })));
    out.push(ISO.tinted(YELLOW, S(G.lathe([[-1.2, R - 0.01], [-1.2, R + 0.02], [2.2, R + 0.02], [2.2, R - 0.01]], F, P), { tone: "mid" })));
    const up = G.tangentOf(F, face).map((x) => -x), at = (s, a = face) => G.pointOf(F, s, R + 0.03, a);
    out.push(window.LAB.faceText(P, at(0.5, face + 0.28), [1, 0, 0], "CLASS 2 LASER", 0.42, "#2b2208", up), window.LAB.faceText(P, at(0.5, face - 0.3), [1, 0, 0], "do not stare into beam", 0.3, "#2b2208", up));
    out.push(ISO.tinted(ISO.T.plastic, S(G.lathe([[HL - 1.6, 0], [HL - 1.6, R + 0.08], [HL - 0.1, R + 0.08], [HL, R - 0.2], [HL, 0]], F, P), { tone: "mid", inner: L(G.ribsOf(F, HL - 1.45, HL - 0.25, R + 0.08, 28, P, { seams: true }), { tone: "lo" }) })));
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[HL, 0], [HL, 0.8], [NOSE - 0.15, 0.8], [NOSE, 0.65], [NOSE, 0]], F, P), { tone: "mid" })));
    return out.join("");
  }
  // the back cap's face (x = +HL): key switch, LED, DC socket
  function backSvg(P, bz, on, c) {
    const Fx = (y, z) => G.frameOf([HL, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]), out = [];
    const Fk = Fx(-0.45, bz + 0.35);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 0.35, 0.5, Fk, P), { tone: "mid" }) + S(G.disc(0.35, 0.5, 0.38, Fk, P), { tone: "hi" })));
    const a = K.iso([HL + 0.51, -0.45, bz + 0.6], P), b = K.iso([HL + 0.51, -0.45, bz + 0.1], P);
    out.push(`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#2a2c30" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.1).toFixed(2)}" stroke-linecap="round" data-free=""/>`);
    const Fl = Fx(0.6, bz + 0.55), lc = on ? COL[c].c : "#5b2a26";
    out.push(S(G.disc(0, 0.12, 0.26, Fl, P), { tone: "mid" }), `<g style="${ISO.tint(lc, [lc, lc, lc, lc], "#3a1410")}">${S(G.lathe([[0.12, 0], [0.12, 0.18], [0.28, 0.12, 1], [0.34, 0]], Fl, P), { tone: "hi" })}</g>`);
    if (on) { const p = K.iso([HL + 0.3, 0.6, bz + 0.55], P); out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(G.scaleOf(P) * 0.6).toFixed(1)}" fill="${lc}" fill-opacity=".3"/>`); }
    const Fd = Fx(0.1, bz - 0.6);
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(0, 0.25, 0.22, 0.42, Fd, P), { tone: "mid" })), D([K.iso([HL + 0.02, 0.1, bz - 0.6], P)], { size: 0.5 }));
    return out.join("");
  }
  function mountSvg(P, bz) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -4, y: -3, w: 8, d: 6, r: 0.5 }, 0, 0.8, P)}"/>`];
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-4, 4], [-3, 3], [0, 0.8], "mid")));
    out.push(D([[-3.3, -2.3], [3.3, -2.3], [-3.3, 2.3], [3.3, 2.3]].map(([x, y]) => K.iso([x, y, 0.81], P)), { size: 0.55 }));
    // the post, its collar and the V-block: its V holds the tube at two lines, 45° down each side
    const vt = bz - R * Math.SQRT1_2, va = bz - R * Math.SQRT2, vb0 = bz - 3.4, ye = vt - va;
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.1, 0.8, 0.5, P, 24), { tone: "mid" }) + S(K.cylinder(0, 0, 0.6, 1.3, vb0 - 1.3, P, 20), { tone: "hi", crease: "none" })));
    out.push(ISO.tinted(ISO.T.plastic, S(G.prismOf(window.B03.X([-2.4, 0, 0]), [[-1.8, vb0], [1.8, vb0], [1.8, vt], [ye, vt], [0, va], [-ye, vt], [-1.8, vt]], 0, 4.8, P), { tone: "mid" })));
    return out.join("");
  }
  // the strap over the tube, its two screws into the V-block's top
  const strapSvg = (P, bz) => ISO.tinted(ISO.T.steel, S(G.ringBand(-0.4, 0.4, R, R + 0.1, G.frameOf([0, 0, bz], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" }));

  ISO.add({
    name: "lablaser", title: "Lab laser on a V-mount (part)", compare: null,
    about: "A school lab laser (red 650 nm or green 532 nm) in a V-mount on a base plate: key switch, emission LED, warning band; its beam leaves the aperture along −x. anchors: beam end",
    line: "lablaser cx cy k on=0|1 c=red|green bz=6..30 beam=0..300 lab=0 lit=body|mount|switch|beam",
    demo: { line: "lablaser 560 320 30 bz=6 beam=10 lab=1", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: 1.4 }, { set: { c: "green", lit: "switch" }, hold: 1.4 }, { set: { c: "red", lit: "mount" }, hold: 1.2 }, { set: { on: 0, lit: "body" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B03 = window.B03, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const bz = ISO.clamp(ISO.num(o, "bz", 13.5), 6, 30);   // 13.5: the beam height of lamphousing, lensholder and whitescreen over a rail
      const m = { on: o.on === "1", c: COL[o.c] ? o.c : "red", beam: ISO.clamp(ISO.num(o, "beam", 30), 0, 300) };
      let lit = o.lit || "";
      // painted: mount (base, post, V-block), the beam (it leaves at −x, behind the tube), the tube, its strap, the back
      g.innerHTML = `<g data-name="mount">${mountSvg(P, bz)}</g><g data-name="beam"><g data-part="beam"></g></g><g data-name="body">${bodySvg(P, bz)}</g><g data-name="mount">${strapSvg(P, bz)}</g>` +
        `<g data-name="switch"><g data-part="back"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const key = `${m.on} ${m.c} ${m.beam}`;
        w.rebuild(el.beam, key, () => {
          if (!m.on) return "";
          const a = K.iso([-NOSE, 0, bz], P), col = COL[m.c].c, s = G.scaleOf(P);
          let out = `<circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="${(s * 0.5).toFixed(1)}" fill="${col}" fill-opacity=".35"/>`;
          if (m.beam > 0) { const b = K.iso([-NOSE - m.beam, 0, bz], P), d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
            out += `<path d="${d}" stroke="${col}" stroke-width="${Math.max(2, s * 0.4).toFixed(2)}" stroke-opacity=".25" stroke-linecap="round" data-free=""/><path d="${d}" stroke="${col}" stroke-width="${Math.max(0.9, s * 0.12).toFixed(2)}" stroke-linecap="round" data-free=""/>`; }
          return out;
        });
        w.rebuild(el.back, `${m.on} ${m.c}`, () => backSvg(P, bz, m.on, m.c));
        w.rebuild(el.words, lab ? key : "", () => LAB.word(P, lab, [0, 0, bz + R + 1], `laser ${COL[m.c].nm} nm`, "#556", { dy: -4 }) + LAB.word(P, lab, [HL + 0.6, 0, bz + 1.2], "key switch", "#556", { anchor: "start", dy: -6 }));
        g.anchors = { beam: [-NOSE, 0, bz], end: [-NOSE - m.beam, 0, bz] };
        B03.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) m.on = String(p.on) === "1";
        if (COL[p.c]) m.c = p.c;
        if (p.beam !== undefined && Number.isFinite(+p.beam)) m.beam = ISO.clamp(+p.beam, 0, 300);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = () => false;
      g.readout = () => `${m.c} laser ${COL[m.c].nm} nm, class 2 · ${m.on ? `on, beam ${m.beam} cm along the bench` : "off"} · beam ${bz} cm over its base`;
      draw();
      return g;
    },
  });
})();
