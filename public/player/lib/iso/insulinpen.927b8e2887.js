// "insulinpen cx cy length rot=deg cap=0|1 dose=0-60 lab=1 lit=needle|cartridge|window|dial|button|cap |text" — an insulin pen.
// A reusable-style pen lying on a mat: pen needle (outer cap off) on its hub, a clear cartridge holder with the
// 3 mL cartridge of U-100 insulin and its rubber plunger, the body with the dose window, the knurled dose dial and
// the push button, which comes out as you dial. `text` is the dose to dial (default 10). set({ cap: 0 }) takes the
// cap off; set({ dose }) turns the dial, the window counting one unit a click; set({ press: 1 }) pushes the button
// home: the window counts back to 0 and the plunger moves the dose (U-100: 10 units = 0.10 mL) out through the needle.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. The pen lies along +x from the needle hub (x = 0) to the button, axis height ZA.
  const ZA = 8.4, R = 8, FULL = 300, CART = [5, 57], EXT = 0.34;
  const BODY = ISO.tint("#dfe7f0", ["#93a6bb", "#a6b7c9", "#b8c6d5", "#c9d4e0"], "#2c4560");
  const WHITE = ISO.tint("#fbfbfa", ["#cfd1d4", "#dcdee0", "#e7e8ea", "#f1f2f3"], "#5d6268");
  const STYLE = `<style>.ip-clear .iso-fill{fill-opacity:.25}.ip-clear .iso-shade{fill-opacity:.45}.ip-clear .iso-top{fill-opacity:.35}</style>`;
  const F = (x, y = 0) => G.frameOf([x, y, ZA], [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function needleSvg(P) {
    const out = [];
    out.push(S(G.disc(-16, -3.5, 0.3, F(0), P), { tone: "hi" }));
    out.push(ISO.tinted(WHITE, S(G.solidOf([[-6, 2.2], [-4, 3.6], [0, 4.4], [2, 4.4]], F(0), P), { tone: "hi", inner: L(G.ribsOf(F(0), 0, 2, 4.4, 14, P, { seams: true }), { tone: "faint" }) })));
    return out.join("");
  }
  // The cartridge (insulin, the plunger at `left` units) and the clear holder over it with its unit scale.
  function cartridgeSvg(P, left) {
    const st = CART[0] + 2 + ((CART[1] - CART[0] - 6) * left) / FULL, out = [];
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(1.6, CART[0], 3.4, F(0), P), { tone: "mid" })));
    out.push(ISO.tinted(ISO.tint("#f3f8ec", ["#c6d6b3", "#d2dfc2", "#dde7d1", "#e7eedd"], "#5f7344"), S(G.disc(CART[0], st, 5.2, F(0), P), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.rubber, S(G.disc(st, st + 4, 5.2, F(0), P), { tone: "mid", inner: L(G.arcOf(F(0), st + 1.3, 5.2, P) + G.arcOf(F(0), st + 2.7, 5.2, P), { tone: "lo" }) })));
    return out.join("");
  }
  function holderSvg(P) {
    const out = [`<g class="ip-clear">${ISO.tinted(ISO.T.glass, S(G.solidOf([[0, 4.4], [3, 6.6, 1], [6, 7.2], [60, 7.2]], F(0), P), { tone: "hi", inner: L(G.arcOf(F(0), 6, 7.2, P), { tone: "faint" }) }))}</g>`];
    // printed scale on the holder: a ring every 50 units of the cartridge
    for (let u = 50; u < FULL; u += 50) out.push(`<path d="${G.arcOf(F(0), CART[0] + 2 + ((CART[1] - CART[0] - 6) * u) / FULL, 7.25, P, { from: 0.9, to: 2.2 })}" stroke="#5d7f96" stroke-width="0.7" fill="none"/>`);
    return out.join("");
  }
  function bodySvg(P) {
    const out = [ISO.tinted(BODY, S(G.solidOf([[60, 7.6], [62, R], [128, R], [130, 7.7]], F(0), P), { tone: "hi", inner: L(G.arcOf(F(0), 64, R, P), { tone: "faint" }) }))];
    // the clip along the top
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [96, 126], [-1.6, 1.6], [ZA + R, ZA + R + 1.6], "hi") + ISO.wbox(P, [122, 126], [-1.6, 1.6], [ZA + R - 1, ZA + R], "hi")));
    return out.join("");
  }
  // The dose window: a frame on the body's side toward you, the drum's number in it.
  const winAt = (P) => { const a = G.angleToward(F(0), G.viewOf(P)) - 0.25; return a; };
  function windowSvg(P, units) {
    const a = winAt(P), Fw = F(0), c = (s, along) => G.pointOf(Fw, s, R + 0.05, a + along / R);
    const corners = [c(100, -4.6), c(116, -4.6), c(116, 4.6), c(100, 4.6)].map((p) => K.iso(p, P));
    const o = c(116, 4.6), ex = c(115, 4.6), ey = c(116, 3.6);
    const [O, X, Y] = [o, ex, ey].map((p) => K.iso(p, P));
    const m = `matrix(${X[0] - O[0]} ${X[1] - O[1]} ${Y[0] - O[0]} ${Y[1] - O[1]} ${O[0]} ${O[1]})`;
    return `<path d="${K.pathOf(corners, true)}" fill="#fbfbfa" stroke="#2c4560" stroke-width="0.8"/><g transform="${m}"><text x="8" y="7" text-anchor="middle" fill="#111" style="font:700 7px 'Helvetica Neue',Arial,sans-serif">${units}</text><path d="M0.6 4.6H2.4M13.6 4.6H15.4" stroke="#c0392b" stroke-width="0.8"/></g>`;
  }
  function dialSvg(P, units) {
    const Fd = F(0);
    return ISO.tinted(BODY, S(G.disc(130, 147, R + 0.4, Fd, P), { tone: "mid", inner: L(G.ribsOf(Fd, 130, 147, R + 0.4, 40, P, { phase: units * 0.26, seams: true }), { tone: "lo" }) }));
  }
    const buttonSvg = (P, ext) => ISO.tinted(WHITE, S(G.solidOf([[147, 5.8], [150 + ext, 5.8], [152 + ext, 5.2, 1], [153 + ext, 4]], F(0), P), { tone: "hi" }));
  function capSvg(P) {
    return ISO.tinted(BODY, S(G.solidOf([[-20, 0], [-20, 7.4], [-18, 8.6, 1], [-14, 9], [44, 9]], F(0), P), { tone: "hi", inner: L(G.arcOf(F(0), 36, 9, P), { tone: "faint" }) })) +
      ISO.tinted(ISO.T.steel, ISO.wbox(P, [10, 40], [-1.6, 1.6], [ZA + 9, ZA + 10.6], "hi"));
  }

  ISO.add({
    name: "insulinpen", title: "Insulin pen", compare: "insulinpen 480 270 360 rot=-10 |10",
    about: "An insulin pen: dial the dose (the window counts units, the button comes out), press the button home and the plunger pushes that dose out: U-100 means 10 units = 0.1 mL.",
    line: "insulinpen cx cy length rot=deg cap=0|1 dose=0-60 lab=1 lit=needle|cartridge|window|dial|button|cap |text",
    demo: { line: "insulinpen 480 270 360 cap=1 dose=0 |10", script: [{ set: { cap: 0, lit: "cap" }, hold: "settle" }, { set: { dose: 10, lit: "dial" }, hold: "settle" }, { set: { press: 1, lit: "button" }, hold: "settle" }] },
    make([cx, cy, length = 360], o, text, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = length * 1.5, H = length * 0.78;
      const target = ISO.clamp(Math.round(parseFloat(text) || 10), 1, 60);
      const pts = [[-30, -40, 0], [170, 24, 0], [-30, 24, 0], [170, -40, 0], [-20, 0, 2 * ZA + 2], [160, 0, 2 * ZA + 2]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 72 + ISO.num(o, "rot", 0) * 0.3, elevation: 30 }, parent);
      const MAT = { x: -30, y: -40, w: 200, d: 64, r: 6 };
      g.innerHTML = STYLE + `<g>${ISO.tinted(ISO.tint("#e9eef2", ["#b9c4cd", "#c6d0d8", "#d2dae1", "#dde3e8"], "#4d5a66"), S(K.slabOf(MAT, -2, 2, P, 6, 0.6), { tone: "lo", inner: L(K.sideSeam(MAT, -1, P, 6), { tone: "faint" }) }))}` +
        `<path class="iso-halo" d="${K.haloOf({ x: -16, y: -R, w: 170, d: 2 * R, r: R }, 0, 4, P)}"/></g>` +
        `<g data-name="needle">${needleSvg(P)}</g><g data-name="cartridge"></g><g data-name="holder">${holderSvg(P)}</g><g data-name="body">${bodySvg(P)}</g>` +
        `<g data-name="window"></g><g data-name="dial"></g><g data-name="button"></g><g data-name="cap"><g data-part="cap">${capSvg(P)}</g></g><g data-part="words"></g>`;
      const nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")], cap = g.querySelector('[data-part="cap"]');
      const s = { cap: o.cap === "1" ? 1 : 0, c: 0, dose: ISO.clamp(ISO.num(o, "dose", target), 0, 60), u: 0, left: 220, pressing: false, given: 0, hold: 0, lit: o.lit || "" };
      s.c = s.cap; s.u = s.dose;
      if (lab) {
        const word = (p, txt, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 14, dy }); };
        g.querySelector('[data-part="words"]').innerHTML = word([-16, 0, ZA], "Needle", "end", 4, -6) + word([30, R, 0], "Insulin cartridge", "middle", 26) +
          word([108, R, ZA - 4], "Dose window", "middle", 30) + word([138, 0, ZA + R + 2], "Dose dial", "middle", -10) + word([156, 0, ZA], "Button", "start", 4, 10);
      }
      const memo = {}, cached = (key, f) => memo[key] || (memo[key] = f());
      const draw = () => {
        const u = Math.round(s.u);
        w.attr(cap, "transform", K.translateAlong(P, [-(1 - s.c) * 10, -(1 - s.c) * 30, 0]));
        // off, the cap lies behind the pen (drawn first); on, it covers the front of the pen (drawn last)
        const capG = nm("cap"), want = s.c < 0.5 ? nm("needle") : g.querySelector('[data-part="words"]');
        if (capG.nextElementSibling !== want) g.insertBefore(capG, want);
        w.rebuild(nm("cartridge"), s.left.toFixed(1), () => cartridgeSvg(P, s.left));
        w.rebuild(nm("window"), String(u), () => windowSvg(P, u));
        w.rebuild(nm("dial"), String(u), () => cached(`d${u}`, () => dialSvg(P, u)));
        const half = Math.round(s.u * 2) / 2;
        w.rebuild(nm("button"), String(half), () => cached(`b${half}`, () => buttonSvg(P, half * EXT)));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name === s.lit));
      };
      g.set = (p) => {
        if (p.cap !== undefined) s.cap = +p.cap ? 1 : 0;
        if (p.dose !== undefined) s.dose = ISO.clamp(Math.round(+p.dose), 0, 60);
        if (p.press) { s.pressing = true; s.given = Math.round(s.u); s.dose = 0; s.hold = 0; }
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), before = s.u;
        s.c = ISO.follow(s.c, s.cap, dt, 0.25, calm);
        if (Math.abs(s.c - s.cap) < 2e-3) s.c = s.cap;
        // dialling: about 6 clicks a second; pressing: about 5 units a second, the plunger moving with it
        const speed = s.pressing ? 5 : 6;
        s.u = calm ? s.dose : Math.abs(s.dose - s.u) < speed * dt ? s.dose : s.u + Math.sign(s.dose - s.u) * speed * dt;
        if (s.pressing) s.left = Math.max(0, s.left - Math.max(0, before - s.u));
        if (s.pressing && s.u === 0) { s.hold += dt; if (s.hold > 1.2 || calm) s.pressing = false; }
        draw();
        return s.c !== s.cap || s.u !== s.dose || s.pressing;
      };
      g.readout = () => {
        const u = Math.round(s.u);
        if (s.c > 0.5) return "cap on · take it off, fit a new needle and prime 2 units first";
        if (s.pressing || s.given) return s.pressing && s.u > 0 ? `pressing · ${u} units still to go` : `${s.given} units given = ${(s.given / 100).toFixed(2)} mL of U-100 insulin · keep the button down for 10 s · ${Math.round(s.left)} units left in the cartridge`;
        return u ? `${u} units dialled = ${(u / 100).toFixed(2)} mL (U-100: 100 units in each mL) · the button has come out ${(u * EXT).toFixed(1)} mm` : `dial at 0 · ${Math.round(s.left)} units in the 300-unit cartridge`;
      };
      draw();
      return g;
    },
  });
})();
