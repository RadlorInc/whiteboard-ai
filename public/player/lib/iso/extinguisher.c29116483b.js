// "extinguisher cx cy height k=plain|1|2|3|4 lab=1 lit=pin|hose|lever|gauge|cylinder|fire" — a fire extinguisher and PASS.
// A 2.3 kg ABC dry-powder extinguisher: red steel cylinder with its instruction label, the valve head with the
// pressure gauge (needle in the green), the carry handle and the squeeze lever above it, the safety pin with its ring
// and tamper seal through both, and the hose with its nozzle clipped to the side. A small fire burns in a tray.
// k is the PASS step: 1 Pull the pin; 2 Aim the nozzle at the base of the fire; 3 Squeeze the lever (powder for about
// 10 s); 4 Sweep side to side until the fire is out. lab=0 hides the step names. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 5.5, HZ = 36, FIRE = [34, 0], FLOOR = { x: -16, y: -16, w: 66, d: 32, r: 3 };
  const RED = ISO.tint("#f5a397", ["#a3271b", "#b8382a", "#cc4a3a", "#dc5f4f"], "#5e120a"), BLACK = ISO.T.plastic, CHROME = ISO.tint("#eef0f2", ["#9ea4ab", "#b1b7bd", "#c4c9ce", "#d6dadd"], "#4a5058");
  const STEPS = ["", "Pull the pin", "Aim at the base of the fire", "Squeeze the lever", "Sweep side to side"];
  const zA = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  let uid = 0;

  function cylinderSvg(P) {
    const F = zA([0, 0, 0]), out = [`<path class="iso-halo" d="${K.haloOf(FLOOR, -2, 2, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(FLOOR, -2, 2, P, 3, 0.6), { tone: "mid" }))];
    out.push(ISO.tinted(BLACK, S(G.disc(0, 0.8, R + 0.3, F, P), { tone: "hi" })));
    out.push(ISO.tinted(RED, S(G.solidOf([[0.8, R], [29, R, 1], [31, R - 0.6, 1], [32.6, R - 2, 1], [33.4, 2.2, 1], [33.6, 1.8], [HZ - 1, 1.8]], F, P), { tone: "hi", inner: L(G.arcOf(F, 1.6, R, P), { tone: "faint" }) })));
    // the label: a white panel on the front with rule lines for its printed words and the ABC classes
    const a0 = -0.2, a1 = 1.5, lab = (s, a) => K.iso(G.pointOf(F, s, R + 0.02, a), P), arc = (s) => Array.from({ length: 13 }, (_, i) => lab(s, a0 + ((a1 - a0) * i) / 12));
    out.push(`<path d="${K.pathOf([...arc(10), ...arc(25).reverse()], true)}" fill="#fbfbf8" stroke="#5e120a" stroke-width="0.5"/>`);
    out.push(L([14, 16, 18, 20].map((s, k) => K.pathOf(Array.from({ length: 9 }, (_, i) => lab(s, a0 + 0.12 + ((a1 - a0 - 0.24 - k * 0.15) * i) / 8)))).join(""), { tone: "lo", free: true }));
    out.push(["A", "B", "C"].map((c, i) => { const p = lab(22.6, a0 + 0.25 + i * 0.45); return `<text x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" font-size="9" font-weight="800" fill="#1f4f8f" text-anchor="middle" font-family="Helvetica Neue,Arial">${c}</text>`; }).join(""));
    // hose clip bracket on the side
    out.push(ISO.tinted(CHROME, ISO.wbox(P, [-R - 0.8, -R + 0.2], [-1, 1], [14, 18], "mid")));
    return out.join("");
  }
  function headSvg(P) {
    const out = [ISO.tinted(BLACK, S(G.disc(HZ - 1, HZ + 3, 2.4, zA([0, 0, 0]), P), { tone: "hi" }))];
    // the carry handle (fixed) out to +x; the gauge on the front
    out.push(ISO.tinted(CHROME, ISO.box((u, w, y) => [u, y, HZ + 1.4 + w], P, [1.6, 12], [-0.5, 0.5], [-1.2, 1.2], "hi")));
    const g = [0, 2.6, HZ + 1.2], F = G.frameOf(g, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(ISO.tinted(CHROME, S(G.disc(-0.2, 0.6, 1.5, F, P), { tone: "hi" })));
    const c = K.iso(G.add3(g, [0, 0.62, 0]), P), sc = G.scaleOf(P);
    out.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(1.2 * sc).toFixed(1)}" fill="#fbfbf8" stroke="#333" stroke-width="0.4"/>`);
    out.push(`<path d="M${(c[0] - 0.7 * sc).toFixed(1)} ${(c[1] - 0.5 * sc).toFixed(1)} A${(0.9 * sc).toFixed(1)} ${(0.9 * sc).toFixed(1)} 0 0 1 ${(c[0] + 0.7 * sc).toFixed(1)} ${(c[1] - 0.5 * sc).toFixed(1)}" fill="none" stroke="#3aa04a" stroke-width="${(0.35 * sc).toFixed(1)}"/>`);
    out.push(`<path d="M${c[0].toFixed(1)} ${c[1].toFixed(1)} L${(c[0] + 0.1 * sc).toFixed(1)} ${(c[1] - 0.9 * sc).toFixed(1)}" stroke="#111" stroke-width="0.8"/>`);
    return out.join("");
  }
  // The squeeze lever, hinged at the head's back, open by angle a above the carry handle.
  function leverSvg(P, a) {
    const at = (u, w, y) => [Math.cos(a) * u - Math.sin(a) * w + 1.4, y, HZ + 3.4 + Math.sin(a) * u + Math.cos(a) * w];
    return ISO.tinted(CHROME, ISO.box(at, P, [0, 11], [-0.45, 0.45], [-1.2, 1.2], "hi"));
  }
  // The pin through lever and handle by the head, its ring, and the plastic seal; pulled out along +y by p.
  function pinSvg(P, p) {
    const y = 1.8 + p * 9, at = [3.2, y, HZ + 2.6], out = [];
    out.push(ISO.tinted(CHROME, S(G.disc(-3.2, 0, 0.3, G.frameAlong(at, [0, 1, 0]), P, { steps: 10 }), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.ringBand(-0.25, 0.25, 1.2, 1.6, G.frameAlong([at[0], at[1] + 1.6, at[2]], [1, 0, 0]), P), { tone: "hi" })));
    if (p < 0.05) out.push(`<path d="${K.pathOf([K.iso([3.2, 1.6, HZ + 2.4], P), K.iso([2.2, 1.6, HZ + 1.6], P)])}" stroke="#2eb34a" stroke-width="1.4"/>`);
    return out.join("");
  }
  // The hose from the head's outlet to the nozzle at N, pointing along d (unit).
  function hoseSvg(P, N, d) {
    const a = [-2.4, 0, HZ + 1.2], b = [-6, 0, HZ - 1], tail = G.sub3(N, G.mul3(d, 6));
    const pts = [a, b, tail, N].map((p) => K.iso(p, P)), sc = G.scaleOf(P);
    const path = `M${pts[0][0]} ${pts[0][1]} C${pts[1][0]} ${pts[1][1] + 40} ${pts[2][0]} ${pts[2][1]} ${pts[3][0]} ${pts[3][1]}`;
    const out = [`<path d="${path}" fill="none" stroke="#0d0e10" stroke-width="${(1.5 * sc + 1).toFixed(1)}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="#3a3e44" stroke-width="${(1.5 * sc).toFixed(1)}" stroke-linecap="round"/>`];
    out.push(ISO.tinted(BLACK, S(G.solidOf([[0, 0.9], [3.2, 1.5, 1], [4.2, 1.9]], G.frameAlong(N, d), P, { steps: 18 }), { tone: "hi" })));
    out.push(ISO.tinted(CHROME, S(G.disc(-0.6, 0.6, 1.1, G.frameAlong(a, [-1, 0, 0]), P), { tone: "mid" })));
    return out.join("");
  }
  function fireSvg(P, f, clock) {
    const [x, y] = FIRE, out = [ISO.wbox(P, [x - 7, x + 7], [y - 5, y + 5], [0, 2.5], "mid")];
    if (f > 0.02) for (let i = 0; i < 7; i++) {
      const fx = x - 5 + i * 1.7, h = (6 + 5 * Math.sin(i * 1.9 + clock * 7)) * f + 2 * f, b = K.iso([fx, y, 2.5], P), tp = K.iso([fx + Math.sin(clock * 5 + i) * 0.6, y, 2.5 + h], P), w = 0.9 * G.scaleOf(P);
      out.push(`<path d="M${(b[0] - w).toFixed(1)} ${b[1].toFixed(1)} Q${b[0].toFixed(1)} ${((b[1] + tp[1]) / 2).toFixed(1)} ${tp[0].toFixed(1)} ${tp[1].toFixed(1)} Q${b[0].toFixed(1)} ${((b[1] + tp[1]) / 2).toFixed(1)} ${(b[0] + w).toFixed(1)} ${b[1].toFixed(1)} Z" fill="${i % 2 ? "#f6a43a" : "#e8542a"}" opacity=".9"/>`);
    }
    return out.join("");
  }
  function powderSvg(P, N, d, f, clock) {
    if (f < 0.02) return "";
    const out = [];
    for (let i = 0; i < 16; i++) {
      const u = (clock * 1.6 + i / 16) % 1, p = G.add3(N, G.mul3(d, 4 + u * 22)), q = K.iso([p[0], p[1] + Math.sin(i * 2.7) * u * 3, p[2] + Math.cos(i * 1.7) * u * 2], P);
      out.push(`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(3 + u * 10).toFixed(1)}" fill="#f4f1ea" stroke="#c9c3b4" stroke-width="0.6" opacity="${(f * (1 - u * 0.7)).toFixed(2)}"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "extinguisher", title: "Fire extinguisher (PASS)", compare: "extinguisher 480 280 340",
    about: "An ABC extinguisher and a small fire, one PASS step at a time: pull the pin, aim at the base, squeeze the lever, sweep side to side.",
    line: "extinguisher cx cy height k=plain|1|2|3|4 lab=1 lit=pin|hose|lever|gauge|cylinder|fire",
    steps: STEPS.slice(1).map((title, i) => ({ title, say: ["Twist and pull the pin out; it breaks the plastic seal.", "Point the nozzle low, at the base of the flames, from about 2 m away.", "Squeeze the lever down onto the handle: powder for about 10 seconds.", "Sweep the nozzle side to side across the base until the fire is out."][i], lit: ["pin", "hose", "lever", "hose"][i] })),
    demo: { line: "extinguisher 480 280 340", script: [{ set: {}, hold: 1 }, { set: { step: 1 }, hold: "settle" }, { set: { step: 2 }, hold: "settle" }, { set: { step: 3 }, hold: 2 }, { set: { step: 4 }, hold: "settle" }] },
    make([cx, cy, size = 340], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.4, H = size * 1.35, id = `ex${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -2, 0), [0, 0, HZ + 9], [12, 0, HZ + 4], [FIRE[0], 0, 16]], cx, cy, W, H, { azimuth: 62, elevation: 18 }, parent);
      g.innerHTML = `<g data-name="cylinder">${cylinderSvg(P)}</g><g data-name="fire"></g><g data-k="head">${headSvg(P)}</g><g data-name="lever"></g><g data-name="pin"></g><g data-name="hose"></g><g data-part="powder"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"],[data-k="${n}"]`), el = Object.fromEntries(["cylinder", "fire", "lever", "pin", "hose", "powder", "words"].map((n) => [n, q(n)])), w = ISO.writer();
      const k0 = ["1", "2", "3", "4"].includes(o.k) ? +o.k : 0;
      const s = { step: k0, pin: k0 >= 1 ? 1 : 0, aim: k0 >= 2 ? 1 : 0, sq: k0 >= 3 ? 1 : 0, sweep: 0, fire: k0 >= 4 ? 0 : 1, clock: 0, u: 0 };
      let lit = o.lit || "";
      const N0 = [-R - 0.4, 0, 16], D0 = [0, 0, -1];
      const nozzle = () => {
        const sw = s.step >= 4 ? Math.sin(s.u * 3) * 7 * Math.min(1, s.fire * 3 + 0.3) : 0, aimAt = [FIRE[0] - 6, sw, 2.5], N1 = [13, 5, 16];
        const N = G.lerp3(N0, N1, ISO.ease(s.aim)), d1 = G.unit3(G.sub3(aimAt, N1)), d = G.unit3(G.lerp3(D0, d1, ISO.ease(s.aim)));
        return { N, d };
      };
      const draw = () => {
        const { N, d } = nozzle(), out = s.sq > 0.9 && s.fire > 0 ? 1 : s.sq > 0.9 && s.step >= 3 ? 0.4 : 0;
        w.rebuild(el.lever, s.sq.toFixed(2), () => leverSvg(P, 0.32 - 0.28 * +s.sq.toFixed(2)));
        w.rebuild(el.pin, s.pin.toFixed(2), () => (s.pin < 0.999 ? pinSvg(P, +s.pin.toFixed(2)) : ""));
        w.attr(el.pin, "opacity", (1 - Math.max(0, s.pin - 0.7) / 0.3).toFixed(2));
        w.rebuild(el.hose, `${N.map((v) => v.toFixed(1))} ${d.map((v) => v.toFixed(2))}`, () => hoseSvg(P, N, d));   // quantised: the hose redraws only when it visibly moves
        w.rebuild(el.fire, s.fire > 0.02 ? `${s.fire.toFixed(2)} ${Math.floor(s.clock * 12)}` : "out", () => fireSvg(P, s.fire, s.clock));
        w.rebuild(el.powder, out ? `${Math.floor(s.clock * 30)} ${N.map((v) => v.toFixed(1))}` : "", () => powderSvg(P, N, d, out, s.clock));
        w.rebuild(el.words, lab ? `${s.step} ${s.fire > 0.02}` : "", () => !lab ? "" : (s.step ? ISO.word(K.iso([0, 0, HZ + 8], P), `${s.step}. ${STEPS[s.step]}`, "#c0392b", { size: 17, dy: -6 }) : "") +
          ISO.word(K.iso([FIRE[0] + 7, FIRE[1] + 5, 0], P), s.fire > 0.02 ? "fire" : "fire out", s.fire > 0.02 ? "#b5541a" : "#2c6a22", { anchor: "start", size: 14, dy: 14 }) +
          (s.step === 0 ? ISO.word(K.iso([0, 2.6, HZ + 1.2], P), "pressure gauge", "#444", { anchor: "end", size: 13, dy: -8 }).replace('x="', 'dx="-12" x="') + ISO.word(K.iso([3.2, 1.8, HZ + 3], P), "pin", "#444", { anchor: "start", size: 13, dy: -8 }) : ""));
        const want = lit || ["", "pin", "hose", "lever", "hose"][s.step];
        w.light([el.cylinder, el.lever, el.pin, el.hose, el.fire], [q(want)].filter(Boolean));
      };
      g.set = (p) => {
        const k = p.step !== undefined ? +p.step : p.k !== undefined ? (p.k === "plain" ? 0 : +p.k) : undefined;
        if (k !== undefined && k >= 0 && k <= 4) { s.step = k; if (k < 4) s.fire = 1; s.u = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), k = s.step, to = (v, want, rate) => (calm ? want : Math.abs(want - v) <= rate * dt ? want : v + Math.sign(want - v) * rate * dt);
        s.clock += dt; s.u += dt;
        s.pin = to(s.pin, k >= 1 ? 1 : 0, 1.2);
        s.aim = to(s.aim, k >= 2 ? 1 : 0, 1.1);
        s.sq = to(s.sq, k >= 3 ? 1 : 0, 3);
        // sweeping across the base, the powder knocks the fire down in about 4 s
        if (k >= 4 && s.sq >= 1) s.fire = calm ? 0 : Math.max(0, s.fire - dt / 4);
        draw();
        return s.pin !== (k >= 1 ? 1 : 0) || s.aim !== (k >= 2 ? 1 : 0) || s.sq !== (k >= 3 ? 1 : 0) || (k >= 4 && s.fire > 0);
      };
      g.readout = () => [
        "ABC dry powder, 2.3 kg · gauge needle in the green: charged · about 10 s of powder, reach 3–5 m",
        "P: pin pulled, the plastic seal broken · the lever can move now",
        "A: nozzle aimed low, at the base of the flames, from about 2 m back",
        "S: lever squeezed onto the handle · the gas pushes the powder out",
        s.fire > 0 ? `S: sweeping side to side across the base · fire ${Math.round(s.fire * 100)} %` : "fire out · back away, watch it doesn't flare up again",
      ][s.step];
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
