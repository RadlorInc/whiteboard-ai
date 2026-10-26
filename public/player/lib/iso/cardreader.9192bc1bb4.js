// "cardreader cx cy k lights=0..4 swivel=0..1 lab=0 lit=base|neck|head|pad|lights" — a PART (batch 6, money): a small
// contactless tap reader on a counter, 8 cm across and 10 cm tall, its origin the counter point under its middle. A
// weighted round base with a rubber foot, a swivel neck, and the reader head (8 × 7.2 × 1.8 cm) leaning back 20° on
// it: a dark face with the contactless mark (a card and four waves) in the middle and a row of four status lights
// along its top. lights 0 → 4 lights them one after another in green as a tap goes through (4 = paid); swivel 0 → 1
// turns the head on its neck from facing the customer (+y) through 90° to face +x (the cashier's side). A phone or a
// card is held in front of the face to pay. set({ lights, swivel }). 1 = 1 cm.
// anchors: pad (2 cm in front of the face's middle, where a phone or card is held) top (the head's top edge)
(() => {
  const K = window.K, G = window.G;
  const HW = 4, HH = 7.2, HT = 1.8, TILT = (20 * Math.PI) / 180, PZ = 2.6;
  const HEAD = ISO.tint("#3d4046", ["#1d1f23", "#25272b", "#2d3034", "#35383d"], "#0a0b0c");
  const BASE = ISO.tint("#d9dbde", ["#8f9399", "#a1a5ab", "#b3b6bb", "#c6c8cc"], "#3c3f45");
  const frameOf = (sw) => {
    const a = (sw * Math.PI) / 2, d = [Math.sin(a), Math.cos(a), 0];
    const U = [d[1], -d[0], 0], W = [-d[0] * Math.sin(TILT), -d[1] * Math.sin(TILT), Math.cos(TILT)], V = [d[0] * Math.cos(TILT), d[1] * Math.cos(TILT), Math.sin(TILT)];
    const o = [d[0] * 0.6, d[1] * 0.6, PZ];
    return { o, U, W, V, at: (u, w, y) => [0, 1, 2].map((i) => o[i] + U[i] * u + W[i] * w + V[i] * y) };
  };
  function faceArt(B) {
    let s = `<rect width="${2 * HW - 0.5}" height="${HH - 0.5}" rx="0.5" fill="#22252a" stroke="#4a4e55" stroke-width="0.06"/>`;
    // the contactless mark: a card outline with four waves beside it
    const cx = HW - 0.25, cy = 3.9;
    s += `<rect x="${(cx - 1.9).toFixed(2)}" y="${(cy - 1.0).toFixed(2)}" width="2.0" height="2.6" rx="0.25" fill="none" stroke="#d7dde3" stroke-width="0.12"/>`;
    s += [0.55, 0.9, 1.25, 1.6].map((r) => `<path d="M${(cx + 0.2 + r * 0.55).toFixed(2)} ${(cy + 0.3 - r).toFixed(2)}A${r} ${r} 0 0 1 ${(cx + 0.2 + r * 0.55).toFixed(2)} ${(cy + 0.3 + r).toFixed(2)}" fill="none" stroke="#d7dde3" stroke-width="0.16" stroke-linecap="round"/>`).join("");
    s += B.text(cx, HH - 1.0, "TAP HERE", 0.42, "#aab3bd", "middle", 700);
    return s;
  }
  // the four status lights along the top
  function lightsArt(n) {
    const cx = HW - 0.25;
    let s = "";
    for (let i = 0; i < 4; i++) {
      const x = cx - 2.4 + i * 1.6, on = i < n;
      s += `<circle cx="${x.toFixed(2)}" cy="0.9" r="0.42" fill="${on ? "#3fe07a" : "#555a61"}" stroke="#0a0b0c" stroke-width="0.05"/>` + (on ? `<circle cx="${x.toFixed(2)}" cy="0.9" r="0.75" fill="#3fe07a" opacity=".28"/>` : "");
    }
    return s;
  }
  ISO.add({
    name: "cardreader", title: "Tap card reader (part)", compare: null,
    about: "A small counter tap reader: a weighted base, a swivel neck and a leaning head with the contactless mark and four status lights that light in turn as a phone or card is tapped; the head swivels toward the customer or the cashier. anchors: pad top",
    line: "cardreader cx cy k lights=0..4 swivel=0..1 lab=0 lit=base|neck|head|pad|lights",
    demo: { line: "cardreader 480 400 30 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "pad" }, hold: 1.2 }, { set: { lights: 4, lit: "lights" }, hold: 3 }, { set: { swivel: 1, lit: "" }, hold: 2.6 }, { set: { lit: "neck" }, hold: 1.2 }, { set: { swivel: 0, lights: 0, lit: "base" }, hold: 2.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B42, S = (p, s) => K.solidSvg(p, s);
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { lights: B.val(o, "lights", 0, 0, 4), swivel: B.val(o, "swivel", 0, 0, 1) }; st.wl = st.lights; st.ws = st.swivel;
      const Z = G.frameAlong([0, 0, 0], [0, 0, 1]);
      const base = ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, 3.8, 0, 0.25, P, 32), { tone: "lo" })) +
        ISO.tinted(BASE, S(G.solidOf([[0.25, 4.0], [0.5, 4.0, 1], [0.9, 3.6, 1], [1.0, 3.2], [1.0, 0]], Z, P, { steps: 36 }), { tone: "mid" }));
      const neck = ISO.tinted(BASE, S(G.solidOf([[1.0, 1.3], [1.4, 1.2, 1], [2.3, 1.1], [2.6, 0.9]], Z, P, { steps: 24 }), { tone: "mid" }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -4.2, y: -4.2, w: 8.4, d: 8.4, r: 4.2 }, 0, 1, P)}"/>` +
        `<g data-name="base">${base}</g><g data-name="neck">${neck}</g><g data-name="head"><g data-part="head"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const art = faceArt(B);
      let lit = o.lit || "";
      const draw = () => {
        const n = Math.floor(st.lights + 1e-3), key = st.swivel.toFixed(3) + "|" + n;
        const f = frameOf(st.swivel);
        w.rebuild(el.head, key, () => {
          // the head shell, a hinge knuckle under it, and the face artwork on its front (V side), upright
          const shell = ISO.tinted(HEAD, ISO.box(f.at, P, [-HW, HW], [0, HH], [-HT, 0], "mid"));
          const knuckle = ISO.tinted(BASE, ISO.box(f.at, P, [-1.2, 1.2], [-0.4, 0.8], [-HT * 0.9, -HT * 0.1], "mid"));
          const tl = f.at(-HW + 0.25, HH - 0.25, 0.005), down = f.W.map((x) => -x);
          const facing = G.dot3(f.V, G.viewOf(P)) > 0;
          const face = facing ? `<g data-name="pad">${B.flat(P, tl, f.U, down, art)}</g><g data-name="lights">${B.flat(P, tl, f.U, down, lightsArt(n))}</g>` : "";
          return knuckle + shell + face;
        });
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([HW + 2, -5, 10], P), "tap reader", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      g.anchors = (() => { const f = frameOf(st.swivel); return { pad: f.at(0, HH / 2, 2), top: f.at(0, HH, -HT / 2) }; })();
      g.set = (p) => { st.wl = B.pick(p, "lights", st.wl, 0, 4); st.ws = B.pick(p, "swivel", st.ws, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const calm = ISO.still(), was = st.lights + st.swivel;
        // the lights step on at about 2.5 a second (a tap's progress), the head turns smoothly
        st.lights = calm || Math.abs(st.wl - st.lights) < 0.004 ? st.wl : st.lights + Math.sign(st.wl - st.lights) * Math.min(Math.abs(st.wl - st.lights), dt * 2.5);
        st.swivel = ISO.follow(st.swivel, st.ws, dt, 0.4, calm);
        if (st.lights + st.swivel !== was) draw();
        return st.lights !== st.wl || st.swivel !== st.ws;
      };
      g.readout = () => { const n = Math.floor(st.wl + 1e-3); return `tap reader · ${n}/4 lights${n >= 4 ? " · paid" : n ? " · reading" : " · ready"} · facing ${st.ws > 0.5 ? "the cashier" : "the customer"}`; };
      draw();
      return g;
    },
  });
})();
