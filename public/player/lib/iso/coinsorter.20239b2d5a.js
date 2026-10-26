// "coinsorter cx cy k t1=0..1 t2=0..1 t3=0..1 t4=0..1 count=0..9999 on=0|1 lab=0 lit=body|hopper|rail|tubes|display|keys"
// — a PART (batch 6, money): a bank counter's coin sorter standing on a counter, its origin the counter point under
// its middle, its front toward the room (+y). 30 × 25 × 25 cm: a hopper tray on top where loose coins are tipped, a
// sloped sorting rail behind a window with four holes that grow from left to right (the smallest coin drops first),
// a chute from each hole into a clear tube standing on the front tray, and a counter window with START, STOP and CLEAR
// keys. Tube 1 to 4 take coins of 1, 2, 5 and 10 (generic, plain numbers); t1 … t4 = how full each tube is (eased,
// 0 → 65 coins), count = the number in the counter window; on=0 dark. set({ t1, t2, t3, t4, count, on }).
// World: 1 = 1 cm. anchors: hopper tube1 tube2 tube3 tube4
(() => {
  const K = window.K, G = window.G;
  const HX = 15, YB = -12.5, YF = 4, YT = 12.5, HZ = 22, TZ = 1.6, TH = 12.9, TR = 1.5;
  const TX = [-10.5, -3.5, 3.5, 10.5], CR = [0.9, 1.0, 1.15, 1.3], VAL = [1, 2, 5, 10], MET = ["bronze", "bronze", "silver", "gold"];
  const CASE = ISO.tint("#eef0f2", ["#a8adb3", "#b9bdc2", "#c9ccd0", "#dadcdf"], "#3c4047");
  ISO.add({
    name: "coinsorter", title: "Coin sorter (part)", compare: null,
    about: "A bank coin sorter, 30 × 25 × 25 cm: hopper tray on top, a sloped sorting rail with holes that grow, chutes into four clear tubes of rising coin piles (1, 2, 5, 10), a counter window and keys; t1 … t4 fill the tubes, count sets the digits. anchors: hopper tube1 tube2 tube3 tube4",
    line: "coinsorter cx cy k t1=0..1 t2=0..1 t3=0..1 t4=0..1 count=0..9999 on=0|1 lab=0 lit=body|hopper|rail|tubes|display|keys",
    demo: { line: "coinsorter 480 420 11 t1=0.2 t2=0.1 t3=0 t4=0 count=0 on=1 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "hopper" }, hold: 1 }, { set: { lit: "rail", t1: 0.6, t2: 0.4, t3: 0.3, t4: 0.15, count: 148 }, hold: "settle" }, { set: { lit: "tubes", t1: 1, t2: 0.8, t3: 0.7, t4: 0.5, count: 236 }, hold: "settle" }, { set: { lit: "display", count: 236 }, hold: 1.2 }, { set: { t1: 0, t2: 0, t3: 0, t4: 0, count: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { on: o.on !== "0", count: Math.round(A.num(o, "count", 0, 0, 9999)), lit: o.lit || "" };
      st.f = [1, 2, 3, 4].map((i) => A.num(o, "t" + i, 0, 0, 1)); st.want = [...st.f];
      // the housing, the front tray the tubes stand on (each tube's value printed on its front), the hopper on top
      const body = B.box(P, [-HX, HX], [YB, YF], [0, HZ], CASE) +
        B.free(P, [[[HX + 0.01, YB, 14.8], [HX + 0.01, YF, 14.8]], [[-HX, YF + 0.01, 14.8], [HX, YF + 0.01, 14.8]]], "#8a8f96", 0.5) +
        `<g transform="${A.plane(P, [HX + 0.02, -2, 9], [0, -1, 0], [0, 0, -1])}"><rect width="7" height="4" fill="none" stroke="#a8adb3" stroke-width="0.08"/>${[0.8, 1.6, 2.4, 3.2].map((y) => `<path data-free d="M0.8 ${y}H6.2" stroke="#8a8f96" stroke-width="0.25" stroke-linecap="round"/>`).join("")}</g>`;
      const tray = B.box(P, [-HX + 0.6, HX - 0.6], [YF, YT], [0, TZ], CASE) +
        TX.map((x, i) => B.face(P, [x, YT + 0.01, 0.45], [1, 0, 0], [0, 0, 1], String(VAL[i]), 0.9, "#2b3440")).join("");
      // the hopper: a tray narrowing down into the machine, a few loose coins lying in it
      const HV = [[-13, -11.5, HZ], [13, -11.5, HZ], [13, 2.5, HZ], [-13, 2.5, HZ], [-13.5, -12, HZ + 3], [13.5, -12, HZ + 3], [13.5, 3, HZ + 3], [-13.5, 3, HZ + 3]];
      const coinsIn = [[-6, -6, "gold", 1.3], [-2.5, -3.5, "silver", 1.15], [1, -7, "bronze", 1], [4.5, -4, "bronze", 0.9], [-9, -3, "silver", 1.15], [8, -7.5, "gold", 1.3], [2, -1, "bronze", 0.9]];
      const hopper = ISO.tinted(CASE, ISO.poly(HV, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid")) +
        B.quad(P, [[-12.6, -11.1, HZ + 3.01], [12.6, -11.1, HZ + 3.01], [12.6, 2.1, HZ + 3.01], [-12.6, 2.1, HZ + 3.01]], "#5a5f66", "#24272b", 0.6) +
        coinsIn.map(([x, y, m, r]) => ISO.tinted(A.METAL[m], K.solidSvg(G.disc(0, 0.2, r, LAB.Z([x, y, HZ + 3.02]), P), { tone: "mid" }))).join("");
      // the front: the rail window (a sloped rail, its four holes, coins rolling on it), the counter window, the keys
      const RW = 26, RH = 2.4, rail = (() => {
        const s = [`<rect width="${RW}" height="${RH}" fill="#1f2226" stroke="#3c4047" stroke-width="0.08"/>`];
        s.push(`<path d="M0.4 0.9L${RW - 0.4} 1.9V2.2L0.4 1.2Z" fill="#c7c9cd" stroke="#5a5f66" stroke-width="0.04"/>`);
        TX.forEach((x, i) => { const u = x + 13, y = 0.9 + (u / RW) * 1.0; s.push(`<rect x="${(u - CR[i]).toFixed(2)}" y="${(y + 0.02).toFixed(2)}" width="${(2 * CR[i]).toFixed(2)}" height="0.3" fill="#0b0c0e"/>`); });
        [[3, 0.95, "#c98e60"], [9.6, 1.0, "#c7c9cd"], [16.4, 1.1, "#e2c986"]].forEach(([u, r, c]) => { const y = 0.9 + (u / RW) * 1.0; s.push(`<ellipse cx="${u}" cy="${(y - r * 0.5).toFixed(2)}" rx="${r * 0.45}" ry="${r * 0.5}" fill="${c}" stroke="#3c3f45" stroke-width="0.05"/>`); });
        s.push(`<path d="M0 0H${RW}L${RW * 0.6} ${RH}H${RW * 0.35}Z" fill="#ffffff" fill-opacity=".07"/>`);
        return s.join("");
      })();
      const front = `<g data-name="rail">${B.quad(P, [[-13.4, YF + 0.01, 14.4], [13.4, YF + 0.01, 14.4], [13.4, YF + 0.01, 17.2], [-13.4, YF + 0.01, 17.2]], "#8a8f96", "#3c4047", 0.6)}` +
        `<g transform="${A.plane(P, [-13, YF + 0.02, 17], [1, 0, 0], [0, 0, -1])}">${rail}</g></g>`;
      const chutes = TX.map((x, i) => ISO.tinted(ISO.T.steel, ISO.box(B.frame([x, YF, 15.2], [1, 0, 0], [0, -0.35, 0.94], [0, 0.94, 0.35]), P, [-CR[i] - 0.25, CR[i] + 0.25], [-0.15, 0.15], [0, 4.3], "mid"))).join("");
      const keys = [["START", ISO.T.green, -12.6], ["STOP", ISO.T.red, -9], ["CLEAR", ISO.T.steel, -5.4]].map(([t2, c, x]) =>
        B.box(P, [x, x + 3], [YF, YF + 0.5], [18.6, 20.2], c) + B.face(P, [x + 1.5, YF + 0.51, 19.1], [1, 0, 0], [0, 0, 1], t2, 0.55, "#26292e")).join("");
      const LX0 = 0.5, LX1 = 13.4, LZ0 = 18, LZ1 = 21.2, id = B.id();
      const lcd = B.quad(P, [[LX0 - 0.4, YF + 0.01, LZ0 - 0.4], [LX1 + 0.4, YF + 0.01, LZ0 - 0.4], [LX1 + 0.4, YF + 0.01, LZ1 + 0.4], [LX0 - 0.4, YF + 0.01, LZ1 + 0.4]], "#2a2d31", "#14171a", 0.6) +
        `<g transform="${A.plane(P, [LX0, YF + 0.02, LZ1], [1, 0, 0], [0, 0, -1])}"><clipPath id="${id}"><rect width="${LX1 - LX0}" height="${LZ1 - LZ0}"/></clipPath><g clip-path="url(#${id})" data-part="lcd"></g></g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 0.5, y: YB - 0.5, w: 2 * HX + 1, d: YT - YB + 1, r: 1 }, 0, HZ + 3, P)}"/>` +
        `<g data-name="body">${body}</g><g data-name="hopper">${hopper}</g>${front}<g data-name="display">${lcd}</g><g data-name="keys">${keys}</g>` +
        `<g data-name="rail">${chutes}</g><g data-name="body">${tray}</g><g data-name="tubes">${TX.map((_, i) => `<g data-part="tube${i}"></g>`).join("")}</g><g data-part="words"></g>`;
      g.anchors = { hopper: [0, -4.5, HZ + 3], ...Object.fromEntries(TX.map((x, i) => [`tube${i + 1}`, [x, (YF + YT) / 2, TZ + TH]])) };
      const el = B.parts(g), w = ISO.writer(), ty = (YF + YT) / 2;
      // a clear tube with its pile: the tube's back half, the coins, then the tube's front rim and shine
      const tubeSvg = (i, f) => {
        const x = TX[i], F = LAB.Z([x, ty, TZ]), h = f * (TH - 0.3);
        let s = ISO.tinted(ISO.T.glass, K.solidSvg(K.cylinder(x, ty, TR, TZ, TH, P, 28), { tone: "lo" }));
        s += B.coinPile(P, x, ty, CR[i], TZ + 0.1, h, A.METAL[MET[i]], A.METAL_INK[MET[i]]);
        s += `<path d="${G.circleOf(F, TH, TR, P)}" fill="none" stroke="#5d7f96" stroke-width="0.9"/>`;
        const a = K.iso([x + TR * 0.55, ty + TR * 0.75, TZ + 0.6], P), b = K.iso([x + TR * 0.55, ty + TR * 0.75, TZ + TH - 0.6], P);
        s += `<path data-free d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#ffffff" stroke-opacity=".7" stroke-width="${Math.max(0.8, 0.15 * K.cameraOf(P).k).toFixed(2)}" stroke-linecap="round"/>`;
        return s;
      };
      const draw = () => {
        TX.forEach((_, i) => { const q = Math.round(st.f[i] * 130) / 130; w.rebuild(el["tube" + i], `${q}`, () => tubeSvg(i, q)); });
        w.rebuild(el.lcd, `${st.on} ${st.count}`, () => st.on ? `<rect width="${LX1 - LX0}" height="${LZ1 - LZ0}" fill="#bfe3b0"/>${B.digits(LX1 - LX0 - 0.5, LZ1 - LZ0 - 0.5, String(st.count), 2.2, "#1f3a18", "#a9cf9a", 4)}${A.text(0.4, 0.8, "COINS", 0.55, "#1f3a18", "start", 800)}` : `<rect width="${LX1 - LX0}" height="${LZ1 - LZ0}" fill="#3a4038"/>`);
        if (lab) w.rebuild(el.words, "w", () => B.word(P, [HX, YB, HZ + 3], "coin sorter"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        [1, 2, 3, 4].forEach((i) => { if (p["t" + i] !== undefined) st.want[i - 1] = A.num(p, "t" + i, st.want[i - 1], 0, 1); });
        if (p.count !== undefined) st.count = Math.round(A.num(p, "count", st.count, 0, 9999));
        if (p.on !== undefined) st.on = p.on !== "0" && p.on !== 0;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        st.f = st.f.map((f, i) => { let v = ISO.follow(f, st.want[i], dt, 0.5 + i * 0.12, calm); if (Math.abs(v - st.want[i]) < 0.002) v = st.want[i]; if (v !== st.want[i]) moving = true; return v; });
        draw();
        return moving;
      };
      g.readout = () => { const n = st.want.map((f) => Math.round((f * (TH - 0.3)) / 0.2)), tot = n.reduce((s, c, i) => s + c * VAL[i], 0); return `coin sorter · tubes ${n.join(", ")} coins of 1, 2, 5, 10 = ${tot} · counter ${st.count}`; };
      draw();
      return g;
    },
  });
})();
