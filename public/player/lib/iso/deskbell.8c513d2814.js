// "deskbell cx cy k press=0..1 lab=0 lit=base|dome|plunger" — a PART (batch 6, money): the chrome service bell on a
// shop or bank counter, 8 cm across and 6 cm tall, its origin the counter point under its middle. A black cast base on
// a felt ring, a chrome dome bolted on its middle, and the plunger through the dome's top with a round cap. press pushes
// the plunger down (0 up, 1 pressed 0.5 cm); each time it goes down the bell rings for a moment (sound rings drawn
// round the dome, fading). set({ press }). World: 1 = 1 cm. anchors: top
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const RB = 4, HB = 1.1, RD = 3.6, Z0 = HB + 0.15, TOP = 6, TRAVEL = 0.5;
  const BASE = ISO.tint("#4a4c52", ["#1e1f23", "#26282c", "#303236", "#3b3d42"], "#0c0d0f");
  ISO.add({
    name: "deskbell", title: "Counter service bell (part)", compare: null,
    about: "A chrome counter service bell 8 cm across on a black base; press pushes the plunger down and the bell rings (rings drawn round it). anchors: top",
    line: "deskbell cx cy k press=0..1 lab=0 lit=base|dome|plunger",
    demo: { line: "deskbell 480 370 40 press=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { press: 1, lit: "plunger" }, hold: 1.2 }, { set: { press: 0 }, hold: 0.8 }, { set: { press: 1, lit: "dome" }, hold: 1.2 }, { set: { press: 0, lit: "base" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B44, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { press: B.num(o, "press", 0, 0, 1), ring: 0, lit: o.lit || "" };
      st.want = st.press;
      const F = LAB.Z([0, 0, Z0]), kS = G.scaleOf(P);
      const dome = []; for (let i = 0; i <= 6; i++) { const s = (i / 6) * (RD - 0.06); dome.push([s, Math.max(0.5, Math.sqrt(RD * RD - s * s)), 1]); }
      const base = ISO.tinted(ISO.T.rubber, S(K.cylinder(0, 0, RB - 0.3, 0, 0.15, P, 40), { tone: "lo" })) +
        ISO.tinted(BASE, S(G.solidOf([[0, RB - 0.1], [0.2, RB], [HB - 0.25, RB], [HB, RB - 0.3]], LAB.Z([0, 0, 0.15]), P, { steps: 40 }), { tone: "mid" })) +
        ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.9, HB + 0.15, 0.12, P, 20), { tone: "mid" }));
      const domeSvg = ISO.tinted(ISO.T.steel, S(G.solidOf(dome, F, P, { steps: 40 }), { tone: "hi" }) +
        S(G.disc(RD - 0.1, RD + 0.15, 0.6, F, P, { steps: 18 }), { tone: "mid" })) +
        // the chrome's highlight: a soft white streak on the near shoulder
        (() => { const pts = []; for (let i = 3; i <= 11; i++) { const s = (i / 14) * RD, r = Math.sqrt(RD * RD - s * s) + 0.02; pts.push(K.iso(G.pointOf(F, s, r, G.angleToward(F, G.viewOf(P)) + 0.9), P)); } return `<path data-free="" d="${K.pathOf(pts)}" fill="none" stroke="#ffffff" stroke-width="${Math.max(1, kS * 0.25).toFixed(2)}" stroke-linecap="round" opacity=".85"/>`; })();
      const plunger = (pr) => {
        const zc = TOP - 0.35 - pr * TRAVEL, Fp = LAB.Z([0, 0, Z0 + RD + 0.1]);
        return ISO.tinted(ISO.T.steel, S(G.disc(0, zc - (Z0 + RD + 0.1), 0.3, Fp, P, { steps: 14 }), { tone: "mid" }) +
          S(G.solidOf([[0, 0.85], [0.22, 0.9], [0.35, 0.7]], LAB.Z([0, 0, zc]), P, { steps: 24 }), { tone: "hi" }));
      };
      const rings = (r) => {
        if (r < 0.02) return "";
        const c = K.iso([0, 0, Z0 + RD * 0.5], P), out = [], sc = kS;
        for (let i = 0; i < 3; i++) {
          const rr = (RD + 0.8 + i * 0.9 + (1 - r) * 1.2) * sc, op = (r * (1 - i * 0.28)).toFixed(2);
          for (const sg of [-1, 1]) {
            const a0 = -0.5, a1 = 0.5, pts = []; for (let j = 0; j <= 10; j++) { const a = a0 + ((a1 - a0) * j) / 10; pts.push([c[0] + sg * Math.cos(a) * rr * 1.25, c[1] + Math.sin(a) * rr * 0.7]); }
            out.push(`<path data-free="" d="${K.pathOf(pts)}" fill="none" stroke="#8a8f98" stroke-width="${Math.max(0.8, sc * 0.12).toFixed(2)}" stroke-linecap="round" opacity="${op}"/>`);
          }
        }
        return out.join("");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -RB, y: -RB, w: 2 * RB, d: 2 * RB, r: RB }, 0, HB, P)}"/>` +
        `<g data-name="base">${base}</g><g data-name="plunger" data-part="plunger"></g><g data-name="dome">${domeSvg}</g><g data-name="plunger" data-part="cap"></g><g data-part="rings"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, TOP] };
      const el = LAB.parts(g), w = ISO.writer();
      // the plunger's stem below the dome top is hidden by the dome, so the part above the dome is drawn after it
      el.plunger.remove();
      const draw = () => {
        const pr = Math.round(st.press * 40) / 40, r = Math.round(st.ring * 30) / 30;
        w.rebuild(el.cap, String(pr), () => plunger(pr));
        w.rebuild(el.rings, String(r), () => rings(r));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([RB, 0, TOP], P), "service bell", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.press !== undefined) st.want = B.num(p, "press", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), was = st.press;
        st.press = ISO.follow(st.press, st.want, dt, 0.05, calm); if (Math.abs(st.press - st.want) < 0.01) st.press = st.want;
        if (was < 0.8 && st.press >= 0.8 && !calm) st.ring = 1;
        st.ring = Math.max(0, st.ring - dt / 1.2);
        draw();
        return st.press !== st.want || st.ring > 0;
      };
      g.readout = () => `service bell · plunger ${st.want > 0.5 ? "pressed: ding" : "up"}`;
      draw();
      return g;
    },
  });
})();
