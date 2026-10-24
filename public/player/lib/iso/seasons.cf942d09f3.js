// "seasons cx cy width labels=0 month=1..12 day=1..365 lab=1 lit=lamp|globe|arm|ring" — a tellurion on a bench.
// A bare bulb on a stand is the Sun; a brass arm turns round it carrying a small globe whose axis leans 23.4° and
// always points the same way (at the Pole Star), over a calendar ring. The lamp's light lands on the ball and leaves
// its night side dark: in June the north leans toward the lamp (long days, summer), in December away from it.
// set({ month }) moves the arm forward to the 21st of that month; set({ day }) to a day of the year.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const { add3, sub3, mul3, unit3, dot3 } = G;
  const RO = 96, LZ = 46, RE = 22, BR = 9, TILT = 23.44;
  const MONTH0 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const Tn = unit3([-1, 1, 0]), A = unit3(add3(mul3(Tn, Math.sin(TILT * EARTH.R)), [0, 0, Math.cos(TILT * EARTH.R)]));
  // where the Earth is on day d: on 21 June (day 172) it sits on the side the north end leans away from
  const posOf = (d) => { const f = -Math.PI / 4 + (2 * Math.PI * (d - 172)) / 365.25; return [RO * Math.cos(f), RO * Math.sin(f), LZ]; };
  const declOf = (d) => TILT * Math.sin((2 * Math.PI * (d - 80)) / 365.25);
  const dateOf = (d) => { const n = ((Math.round(d) - 1) % 365 + 365) % 365; let m = 11; while (MONTH0[m] > n) m--; return `${n - MONTH0[m] + 1} ${MN[m]}`; };

  ISO.add({
    name: "seasons", title: "Seasons (tellurion)", compare: "seasons 480 270 500",
    about: "A lamp for the Sun and a tilted globe on an arm round it: the axis keeps leaning the same way, so each half of the Earth leans toward the light for half the year.",
    line: "seasons cx cy width labels=0 month=1..12 day=1..365 lab=1 lit=lamp|globe|arm|ring",
    demo: { line: "seasons 480 270 500 month=6", script: [{ set: {}, hold: 1.2 }, { set: { month: 9 }, hold: "settle" }, { set: { month: 12 }, hold: "settle" }, { set: { month: 3 }, hold: "settle" }, { set: { month: 6 }, hold: "settle" }] },
    make([cx, cy, w = 480], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = w * 1.15, H = Math.min(w * 0.98, 520);
      const PL = { x: -132, y: -132, w: 264, d: 264, r: 14 };
      const { P, g } = ISO.frame([[PL.x, PL.y, -12], [-PL.x, -PL.y, -12], [-PL.x, PL.y, 0], [PL.x, -PL.y, 0], [0, 0, LZ + 30], [RO * 0.7, -RO * 0.7, LZ + RE + 12], [-RO * 0.7, RO * 0.7, LZ + RE + 12]], cx, cy, W, H, { azimuth: 45, elevation: 34 }, parent);
      const V = G.viewOf(P), B = [0, 0, LZ];
      // the bench: a base board, the calendar ring with a tick for each month, the lamp's foot
      const ticks = MN.map((_, i) => { const p = posOf(MONTH0[i] + 21), u = [p[0] / RO, p[1] / RO]; return K.pathOf([[u[0] * (RO + 5), u[1] * (RO + 5), 1.2], [u[0] * (RO + 1), u[1] * (RO + 1), 1.2]].map((q) => K.iso(q, P))); }).join("");
      const ring = EARTH.track(P, [0, 0, 0], RO, 5) + `<path d="${ticks}" fill="none" stroke="#33506f" stroke-width=".9"/>`;
      const words = lab ? MN.map((m, i) => { const p = posOf(MONTH0[i] + 21); return ISO.word(K.iso([p[0] * 1.17, p[1] * 1.17, 0], P), m, "#556", { size: 12, dy: 4 }); }).join("") : "";
      const foot = EARTH.lamp(P, B, BR);
      // lamp stem, collar for the arm, bulb (sorted against the moving globe)
      const stemTop = ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 4, 9, 4, P, 24, 0.4), { tone: "mid" }));
      const lampG = `<g data-name="lamp">${stemTop}${EARTH.bulb(P, B, BR)}</g>`;
      // audit: the bulb sits 3 units into its socket and the axis pins into the globe and joint, on purpose
      // the moving part: arm, carriage post, ball joint, tilted axis rod and the globe
      const J0 = mul3(A, -(RE + 7)), rodFront = dot3(A, V) > 0;
      g.innerHTML = `<g>${ISO.baseboard(P, PL, { h: 7, tint: ISO.T.wood })}</g><g data-name="ring">${ring}</g><g data-part="words">${words}</g><g data-name="lampfoot">${foot}</g><g data-part="movers"><g data-part="lamp">${lampG}</g><g data-part="earth"></g></g><g data-part="tag"></g>`;
      const el = LAB.parts(g), wr = ISO.writer(), sort = ISO.sorter(P, el.movers);
      const glow = EARTH.glow(g, P, W, H, el.movers, B, 46);
      const st = { d: 172 }, want = { d: 172 };
      const dayOf = (m) => MONTH0[(Math.round(m) - 1 + 1200) % 12] + 21;
      if (o.month !== undefined) st.d = want.d = dayOf(+o.month);
      if (o.day !== undefined) st.d = want.d = ISO.clamp(+o.day, 1, 365);
      let lit = o.lit || "";
      const earthSvg = (d) => {
        const C = posOf(d), J = add3(C, J0), out = [];
        const dir = unit3([J[0], J[1], 0]), side = [-dir[1], dir[0], 0], r0 = 4, r1 = Math.hypot(J[0], J[1]);
        const bar = (x0, x1, h0, h1, wd) => [[x0, -wd, h0], [x1, -wd, h0], [x1, wd, h0], [x0, wd, h0], [x0, -wd, h1], [x1, -wd, h1], [x1, wd, h1], [x0, wd, h1]].map(([s, q, z]) => [dir[0] * s + side[0] * q, dir[1] * s + side[1] * q, z]);
        out.push(ISO.tinted(ISO.T.brass, ISO.poly(bar(r0, r1 + 3, 10, 12, 2.6), [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid")));
        // the counterweight on the arm's short end balances the globe
        const cw = [-dir[0] * 22, -dir[1] * 22];
        out[0] = ISO.tinted(ISO.T.brass, ISO.poly(bar(-24, -r0, 10, 12, 2.2), [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid")) + ISO.tinted(ISO.T.steel, S(K.cylinder(cw[0], cw[1], 5.5, 3.6, 6.4, P, 28, 0.6), { tone: "mid" })) + out[0];
        // a pointer from the carriage down to the calendar ring, reading the date
        const tip = [dir[0] * (RO + 4), dir[1] * (RO + 4)], pv = [[J[0] - side[0] * 1.6, J[1] - side[1] * 1.6, 1.2], [J[0] + side[0] * 1.6, J[1] + side[1] * 1.6, 1.2], [tip[0], tip[1], 1.2], [J[0] - side[0] * 1.6, J[1] - side[1] * 1.6, 1.8], [J[0] + side[0] * 1.6, J[1] + side[1] * 1.6, 1.8], [tip[0], tip[1], 1.8]];
        out.push(ISO.tinted(ISO.T.red, ISO.poly(pv, [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], P, "mid")) + ISO.tinted(ISO.T.brass, S(K.cylinder(J[0], J[1], 2.2, 1.8, J[2] - 3.8, P, 18), { tone: "mid", crease: "none" })) + ISO.tinted(ISO.T.brass, S(G.sphereOf(J, 2.8, P), { tone: "mid" })));
        const low = EARTH.rod(P, J, add3(C, mul3(A, -(RE - 1))), 1), top = EARTH.rod(P, add3(C, mul3(A, RE - 1)), add3(C, mul3(A, RE + 6)), 1) + ISO.tinted(ISO.T.brass, S(G.sphereOf(add3(C, mul3(A, RE + 6)), 1.6, P), { tone: "mid" }));
        out.push(rodFront ? low : top);
        const F = EARTH.frame(C, RE, A, 0.4);
        out.push(EARTH.ball(P, F, { flat: true, tint: ISO.tint("#e8f2fb", ["#a9c9e8", "#bcd6ee", "#cfe2f4", "#dceaf7"], "#1f4f8f"), land: "#cfe7b9", lats: [[0, "#4d7fb8"], [23.4, "#c0392b"], [-23.4, "#c0392b"], [66.6, "#7fa5cf"], [-66.6, "#7fa5cf"]], light: unit3(sub3(B, C)), dark: 0.68 }));
        out.push(rodFront ? top : low);
        return `<g data-name="arm">${out.slice(0, 2).join("")}</g><g data-name="globe">${out.slice(2).join("")}</g>`;
      };
      const draw = () => {
        const key = Math.round(st.d / 2) * 2;
        wr.rebuild(el.earth, String(key), () => earthSvg(key));
        sort({ lamp: el.lamp, earth: el.earth }, { lamp: [0, 0, LZ], earth: posOf(key) });
        if (lab) wr.rebuild(el.tag, String(key), () => { const C = posOf(key); return ISO.word(K.iso(add3(C, [0, 0, RE + 12]), P), dateOf(key), "#1f4f8f", { size: 14 }) + ISO.word(K.iso([0, 0, LZ + BR + 2], P), "lamp = Sun", "#8a6a10", { size: 13, anchor: "end", dy: -14 }); });
        glow(1);
        LAB.light(wr, g, lit);
      };
      g.set = (p) => {
        const to = p.month !== undefined ? dayOf(+p.month) : p.day !== undefined ? ISO.clamp(+p.day, 1, 365) : null;
        if (to !== null) { let d = to; while (d < want.d - 0.5) d += 365.25; while (d - want.d > 365.25) d -= 365.25; want.d = d; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.d = ISO.follow(st.d, want.d, dt, 0.7, ISO.still());
        if (Math.abs(st.d - want.d) < 0.05) st.d = want.d;
        draw();
        return st.d !== want.d;
      };
      g.readout = () => {
        const d = st.d, dec = declOf(d), H = Math.acos(ISO.clamp(-Math.tan(51.5 * EARTH.R) * Math.tan(dec * EARTH.R), -1, 1)) / EARTH.R;
        const north = dec > 8 ? "summer in the north, winter in the south" : dec < -8 ? "winter in the north, summer in the south" : dec > 0 ? "spring in the north, autumn in the south" : "autumn in the north, spring in the south";
        return `${dateOf(d)} · noon Sun overhead at ${Math.abs(dec).toFixed(1)}° ${dec >= 0 ? "N" : "S"} · ${north} · London (51.5° N) gets ${(H / 7.5).toFixed(1)} h of daylight · axis 23.4°, same direction all year`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
