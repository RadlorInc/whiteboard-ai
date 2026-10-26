// "henetube cx cy k on=0|1 beam=0..100 lab=0 lit=glass|bore|cathode|caps|glow" — a PART (PARTS.md, batch 5): a
// helium-neon laser tube lying along x, origin the middle of its axis (place it at= a tubecradle's axis; a second
// cradle 30 cm along). A 50 cm × 3 cm glass envelope, a thin capillary bore down its middle, an aluminium cathode can
// inside toward +x, an anode pin on top near −x, metal end caps. on=1: the supply (about 1.5 kV) excites the gas, the
// bore glows pink, photons at 633 nm run back and forth between the cavity mirrors, and a thin red beam `beam` cm long
// leaves the −x end (on the bench light travels −x). Reused from laser.js (glow, photons, beam, glass).
// set({ on, beam }). anchors: out back anode cathode
(() => {
  const K = window.K, G = window.G;
  const HL = 25, R = 1.5, CAP = 1.6;
  const CAPT = ISO.tint("#e4e7ea", ["#8f969d", "#a3a9af", "#b7bcc1", "#c9cdd1"], "#3f464d");

  ISO.add({
    name: "henetube", title: "He-Ne laser tube (part)", compare: null,
    about: "A helium-neon laser tube (50 cm × 3 cm glass, capillary bore, cathode, anode pin, end caps); switched on, the gas glows pink, photons bounce along it and a red beam leaves the −x end. anchors: out back anode cathode",
    line: "henetube cx cy k on=0|1 beam=0..100 lab=0 lit=glass|bore|cathode|caps|glow",
    demo: { line: "henetube 480 290 13 on=0 beam=20 lab=1", script: [{ set: { lit: "bore" }, hold: 1 }, { set: { on: 1, lit: "glow" }, hold: 3 }, { set: { beam: 40, lit: "cathode" }, hold: 2 }, { set: { on: 0, lit: "caps" }, hold: "settle" }] },
    make([cx = 480, cy = 290, k = 3], o, t, parent) {
      const LAB = window.LAB, B18 = window.B18, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", F = B18.X([0, 0, 0]);
      const beamOf = (v) => (Number.isFinite(+v) ? ISO.clamp(+v, 0, 100) : 30);
      const st = { on: o.on === "1", glow: 0, t: 0, beam: beamOf(ISO.num(o, "beam", 30)) };
      st.glow = st.on ? 1 : 0;
      let lit = o.lit || "";
      const X0 = -HL - CAP, X1 = HL + CAP;
      const cap = (x0, x1) => ISO.tinted(CAPT, S(G.disc(x0, x1, R + 0.08, F, P, { steps: 32 }), { tone: "mid" }) + S(G.ringBand(x1 > 0 ? x1 - 0.3 : x0, x1 > 0 ? x1 : x0 + 0.3, 0.4, R - 0.2, F, P, { steps: 24 }), { tone: "hi" }));
      const inner = ISO.tinted(ISO.T.glass, S(G.disc(-HL, HL, 0.3, F, P, { steps: 16 }), { tone: "mid", crease: "none" }));
      const cathode = ISO.tinted(CAPT, S(G.disc(6, 22, 1.05, F, P, { steps: 28 }), { tone: "mid", crease: "none" }));
      const glass = `<g opacity=".45">${ISO.tinted(ISO.T.glass, S(G.disc(-HL, HL, R, F, P, { steps: 40 }), { tone: "hi" }))}</g>`;
      // the anode: a pin through a glass seal on top near −x, and the cathode's lug on the +x cap
      const anode = ISO.tinted(ISO.T.glass, S(K.cylinder(-20, 0, 0.45, R - 0.1, 0.7, P, 16), { tone: "mid" })) + ISO.tinted(ISO.T.steel, S(K.cylinder(-20, 0, 0.18, R + 0.6, 0.9, P, 12), { tone: "hi" }));
      const lug = ISO.tinted(ISO.T.steel, ISO.wbox(P, [HL + 0.4, HL + 1.2], [-0.25, 0.25], [R, R + 0.8], "mid"));
      g.innerHTML = `<g data-part="beam"></g><g data-name="caps">${cap(X0, -HL)}</g><g data-name="cathode">${cathode}</g><g data-name="bore">${inner}</g>` +
        `<g data-part="glow" data-name="glow"></g><g data-name="glass">${glass}${anode}</g><g data-name="caps">${cap(HL, X1)}${lug}</g><g data-part="words"></g>`;
      g.anchors = { out: [X0, 0, 0], back: [X1, 0, 0], anode: [-20, 0, R + 1.5], cathode: [HL + 0.8, 0, R + 0.8] };
      const el = LAB.parts(g), w = ISO.writer();
      const seg = (a, b, attrs) => { const p = K.iso(a, P), q = K.iso(b, P); return `<path d="M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${q[0].toFixed(1)} ${q[1].toFixed(1)}" ${attrs}/>`; };
      const draw = () => {
        const gq = Math.round(st.glow * 20) / 20, ph = gq > 0.02 ? Math.round(((st.t * 0.9) % 1) * 60) / 60 : 0, sw = Math.max(1, 0.5 * G.scaleOf(P));
        w.rebuild(el.glow, `${gq} ${ph}`, () => {
          if (gq <= 0.02) return "";
          const out = [seg([-HL + 0.5, 0, 0], [HL - 0.5, 0, 0], `stroke="#ff7ab0" stroke-width="${(sw * 2.4 * gq).toFixed(1)}" stroke-linecap="round" opacity="${(0.55 * gq).toFixed(2)}"`)];
          for (let i = 0; i < 8; i++) {
            const f = (ph + i / 8) % 1, dir = i % 2 ? 1 : -1, x = dir > 0 ? -HL + 1 + f * (2 * HL - 4) : HL - 1 - f * (2 * HL - 4), dz = ((i % 3) - 1) * 0.1;
            out.push(seg([x, 0, dz], [x + dir * 2, 0, dz], `stroke="#e5302a" stroke-width="${(sw * 0.7).toFixed(2)}" stroke-linecap="round" opacity="${gq.toFixed(2)}"`));
          }
          return out.join("");
        });
        w.rebuild(el.beam, `${gq} ${st.beam}`, () => (gq > 0.6 && st.beam > 0 ? seg([X0, 0, 0], [X0 - st.beam, 0, 0], `stroke="#e5302a" stroke-width="${(sw * 0.8).toFixed(2)}" stroke-linecap="round" opacity="${((gq - 0.6) * 2.5).toFixed(2)}"`) : ""));
        if (lab) w.rebuild(el.words, String(gq > 0.5), () => LAB.word(P, lab, [0, 0, R + 3], gq > 0.5 ? "helium-neon glowing · photons bounce, 633 nm" : "helium-neon tube", "#556") + LAB.word(P, lab, [X0 - Math.min(st.beam, 20), 0, 0], gq > 0.6 ? "beam" : "", "#c0392b", { dy: -8 }));
        B18.light(w, g, lit);
      };
      g.set = (p) => { if (p.on !== undefined) st.on = String(p.on) === "1"; if (p.beam !== undefined) st.beam = beamOf(p.beam); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => { st.glow = ISO.follow(st.glow, st.on ? 1 : 0, dt, 0.5, ISO.still()); if (Math.abs(st.glow - (st.on ? 1 : 0)) < 0.01) st.glow = st.on ? 1 : 0; st.t += dt; draw(); return st.on || st.glow > 0; };
      g.readout = () => (st.on ? `supply on (≈ 1.5 kV) · the gas glows · photons at 633 nm bounce between the mirrors and multiply · 1 % leaks out the −x end as a ${st.beam} cm red beam` : "supply off · no glow, no beam") + " · tube 50 cm × 3 cm";
      draw();
      return g;
    },
  });
})();
