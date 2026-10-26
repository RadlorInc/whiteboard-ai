// "smokealarm cx cy size k=ok|beep test=0|1 smoke=0|1 lab=1 lit=alarm|button|light|vents" — a ceiling smoke alarm,
// seen from below. A round alarm twisted onto its mounting plate on the ceiling: vent slots all round its side let air
// into the photoelectric chamber, a grille of rings on its face over the horn, the test button in the middle and the
// status light. Inside the chamber an LED shines past a sensor it can't see; smoke scatters that light onto the sensor
// and the 85 dB horn sounds. Holding TEST does the same on purpose. k=ok: the light blinks green; k=beep: the 9 V
// battery is low, the light is red and it chirps every 40 s (shown faster here). set({ k, test, smoke }).
// World units: 1 = 1 cm (a 13.6 cm alarm on a 15 cm plate).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CZ = 30, R = 6.8, HB = 4.2, CEIL = { x: -17, y: -17, w: 34, d: 34 };
  const WHITE = ISO.tint("#fbfbf8", ["#cfcfca", "#dadad5", "#e4e4df", "#eeeeea"], "#77776f"), CEILING = ISO.tint("#f3f2ee", ["#d0cfca", "#d9d8d3", "#e2e1dc", "#ebeae6"], "#8a8983");
  const down = (z) => G.frameOf([0, 0, z], [0, 0, -1], [1, 0, 0], [0, -1, 0]);
  let uid = 0;

  function bodySvg(P) {
    const out = [ISO.tinted(CEILING, ISO.wbox(P, [CEIL.x, CEIL.x + CEIL.w], [CEIL.y, CEIL.y + CEIL.d], [CZ, CZ + 2.5], "hi"))];
    // the mounting plate, then the alarm body: side with vent slots between two seams, a rounded edge, the face
    const F = down(CZ);
    out.push(ISO.tinted(WHITE, S(G.disc(0, 0.9, 7.5, F, P), { tone: "hi" })));
    out.push(ISO.tinted(WHITE, S(G.solidOf([[0.9, R], [HB - 0.8, R, 1], [HB - 0.3, R - 0.5, 1], [HB, R - 1.2]], F, P), { tone: "hi", inner: K.fadedSvg(G.ribsOf(F, 1.6, 3, R, 36, P, { fade: [0.1, 0.5], seams: true }), { tone: "lo" }) })));
    // the face: grille rings over the horn, the status light's window
    out.push(L([1.6, 2.6, 3.6, 4.6].map((r) => G.circleOf(F, HB, r, P)).join(""), { tone: "faint" }));
    return out.join("");
  }
  function buttonSvg(P, press) {
    const F = down(CZ);
    return ISO.tinted(WHITE, S(G.solidOf([[HB, 1.5], [HB + 0.5 - 0.35 * press, 1.5, 1], [HB + 0.6 - 0.35 * press, 1.3, 1], [HB + 0.65 - 0.35 * press, 0]], F, P), { tone: "hi" }));
  }
  function lightSvg(P, color) {
    const c = K.iso(G.pointOf(down(CZ), HB + 0.02, 3.1, 0.6), P);
    return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="3.2" fill="${color}" stroke="#444" stroke-width="0.6"/>`;
  }
  // Sound: arcs spreading out from the alarm's side, fading as they go; a chirp is one short burst.
  function soundSvg(P, phase, strength, color) {
    if (strength < 0.02) return "";
    const c = K.iso([0, 0, CZ - HB / 2], P), out = [], sc = G.scaleOf(P);
    for (let k = 0; k < 3; k++) {
      const f = (phase + k / 3) % 1, r = sc * (8 + f * 9), a = (1 - f) * strength;
      for (const side of [-1, 1]) {
        const pts = []; for (let i = 0; i <= 12; i++) { const t = -0.5 + i / 12; pts.push([c[0] + side * Math.cos(t) * r, c[1] + Math.sin(t) * r * 0.8]); }
        out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="${a.toFixed(2)}"/>`);
      }
    }
    return out.join("");
  }
  // Smoke: grey puffs rising from below toward the vents as f (how much has come) grows.
  function smokeSvg(P, f) {
    if (f < 0.02) return "";
    const out = [];
    for (let i = 0; i < 14; i++) {
      const u = ((i * 0.37 + f * 0.6) % 1), x = Math.sin(i * 2.1) * 9 * (1 - u), y = Math.cos(i * 1.3) * 9 * (1 - u), z = CZ - 26 + u * 22;
      const p = K.iso([x, y, z], P);
      out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(12 + u * 12).toFixed(1)}" fill="#8b8f95" opacity="${(0.2 * Math.min(1, f * 2) * (1 - u * 0.4)).toFixed(2)}"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "smokealarm", title: "Smoke alarm", compare: "smokealarm 480 270 260",
    about: "A ceiling smoke alarm seen from below: holding TEST sounds the 85 dB horn as smoke would; a low battery makes it chirp with a red light.",
    line: "smokealarm cx cy size k=ok|beep test=0|1 smoke=0|1 lab=1 lit=alarm|button|light|vents",
    demo: { line: "smokealarm 480 270 260", script: [{ set: {}, hold: 1.2 }, { set: { test: 1 }, hold: 3 }, { set: { test: 0, smoke: 1 }, hold: 3.6 }, { set: { smoke: 0, k: "beep" }, hold: 3.2 }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.8, H = size * 1.75, id = `sa${++uid}`;
      const { P, g } = ISO.frame([...K.boxCorners({ ...CEIL, r: 0 }, CZ, CZ + 2.5), [0, 0, CZ - 18]], cx, cy, W, H, { azimuth: 50, elevation: -26 }, parent);
      g.innerHTML = `<g data-part="smoke"></g><g data-name="alarm">${bodySvg(P)}</g><g data-name="button"></g><g data-name="light"></g><g data-part="sound"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { smoke: q("smoke"), alarm: q("alarm"), button: q("button"), light: q("light"), sound: q("sound"), words: q("words") }, w = ISO.writer();
      const s = { k: o.k === "beep" ? "beep" : "ok", test: +(o.test === "1"), smoke: +(o.smoke === "1"), press: 0, fog: 0, clock: 0, horn: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const alarm = s.press > 0.9 || s.fog > 0.7, chirp = s.k === "beep" && !alarm && s.clock % 2.5 < 0.25;
        w.rebuild(el.button, s.press.toFixed(2), () => buttonSvg(P, s.press));
        const blink = alarm ? s.clock % 0.5 < 0.25 : s.k === "beep" ? true : s.clock % 2 < 0.2;
        const color = alarm ? (blink ? "#e04b3a" : "#5a1b14") : s.k === "beep" ? "#e04b3a" : blink ? "#47e04b" : "#2c6a22";
        w.rebuild(el.light, color, () => lightSvg(P, color));
        const strength = alarm ? 1 : chirp ? 0.8 : 0, ph = alarm ? (s.clock * 1.4) % 1 : chirp ? (s.clock % 2.5) / 0.25 * 0.33 : 0;
        w.rebuild(el.sound, strength ? `${ph.toFixed(2)} ${strength}` : "", () => soundSvg(P, ph, strength, alarm ? "#d0392b" : "#e0863a"));
        w.rebuild(el.smoke, s.fog > 0.02 ? s.fog.toFixed(2) : "", () => smokeSvg(P, s.fog));
        w.rebuild(el.words, lab ? `${alarm} ${s.k}` : "", () => !lab ? "" : [
          ISO.word(K.iso([R, 0, CZ - 2], P), "vents to the smoke chamber", "#444", { anchor: "start", size: 14, dy: 4 }),
          ISO.word(K.iso([0, 0, CZ - HB - 0.7], P), "TEST", "#444", { size: 14, dy: 24 }),
          alarm ? ISO.word(K.iso([0, 0, CZ - HB], P), "85 dB alarm", "#c0392b", { size: 17, dy: 62 }) : s.k === "beep" ? ISO.word(K.iso([0, 0, CZ - HB], P), "chirp: battery low", "#b5541a", { size: 16, dy: 62 }) : "",
        ].join(""));
        const want = lit || (s.press > 0.05 ? "button" : s.k === "beep" ? "light" : "");
        w.light([el.alarm, el.button, el.light], [q(want)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.k) s.k = p.k === "beep" ? "beep" : "ok";
        if (p.test !== undefined) s.test = +p.test ? 1 : 0;
        if (p.smoke !== undefined) s.smoke = +p.smoke ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        s.clock += dt;
        s.press = ISO.follow(s.press, s.test, dt, 0.06, calm); if (Math.abs(s.press - s.test) < 0.01) s.press = s.test;
        s.fog = calm ? s.smoke : Math.max(0, Math.min(1, s.fog + (s.smoke ? 0.4 : -0.8) * dt));
        draw();
        return s.press !== s.test || (s.fog > 0 && s.fog < 1);
      };
      g.readout = () => {
        if (s.press > 0.9) return "TEST held · the horn sounds at 85 dB, the light flashes red";
        if (s.fog > 0.7) return "smoke in the chamber scatters the LED's light onto the sensor · alarm!";
        if (s.fog > 0.02) return "smoke rising toward the vents…";
        return s.k === "beep" ? "low battery · red light, one chirp every 40 s · change the 9 V battery" : "OK · green light blinks every 40 s · test it once a month";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
