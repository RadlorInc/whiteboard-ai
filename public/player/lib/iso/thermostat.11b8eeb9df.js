// "thermostat cx cy size temp=N room=N lab=1 lit=display|up|down|mode|vent" — a wall thermostat running the heating.
// A wall thermostat: rounded case with vent slots, an LCD showing the room temperature large and the set point small,
// HEAT mode with a flame mark while the furnace runs, ▲ and ▼ buttons and the HEAT/OFF/COOL slider. Below it, a wall
// register blows warm air while the heat is on. It switches the furnace on when the room falls 0.5 °F below the set
// point and off when it rises 0.5 °F above (so it doesn't flick on and off). set({ temp }) presses ▲/▼ to a new set
// point; the room warms about 1 °F a minute in a real house, here a second. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const CZ = 30, BW = 11, BH = 8, BD = 2.4, BAND = 0.5;
  const CASE = ISO.tint("#f6f6f3", ["#cfcfcb", "#d8d8d4", "#e1e1dd", "#eaeae6"], "#6d6d68"), WALL = ISO.tint("#f1efe9", ["#c9c6be", "#d3d0c8", "#dddad2", "#e7e4dc"], "#7a776f");
  const LCD = "#cfe3c5", INK = "#1d2a1a";
  const round = (w, h, r, n = 5) => { const c = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 1], [-w / 2 + r, -h / 2 + r, 2], [w / 2 - r, -h / 2 + r, 3]], out = []; for (const [x, z, k] of c) for (let i = 0; i <= n; i++) { const a = (k + i / n) * Math.PI / 2; out.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); } return out; };
  const fm = (P, x, y, z, s = 1) => ISO.faceMatrix(P, [x, y, z], s);

  function wallSvg(P) {
    return ISO.tinted(ISO.T.wood, ISO.wbox(P, [-12, -8.2], [-10.2, -1.3], [CZ - 20, CZ + 8], "hi")) + ISO.tinted(WALL, ISO.wbox(P, [-12, 12], [-1.3, 0], [CZ - 20, CZ + 8], "hi"));
  }
  function caseSvg(P) {
    const out = [ISO.prismY(P, round(BW, BH, 1.6).map(([x, z]) => [x, CZ + z]), 0, BD, ["#b9b9b4", "#f4f4f1"], "#f4f4f1", "#6d6d68")];
    // vent slots across the top: closed outlines on the top face
    const vents = [];
    for (let x = -4; x <= 4; x += 1.3) vents.push(K.pathOf([[x - 0.35, 0.6], [x + 0.35, 0.6], [x + 0.35, 1.9], [x - 0.35, 1.9]].map(([a, y]) => K.iso([a, y, CZ + BH / 2 - 0.02], P)), true));
    out.push(`<path d="${vents.join("")}" fill="#55554f" stroke="none"/>`);
    // the LCD window
    out.push(`<path d="${K.pathOf([[-4.6, CZ - 0.6], [2.2, CZ - 0.6], [2.2, CZ + 3.2], [-4.6, CZ + 3.2]].map(([x, z]) => K.iso([x, BD + 0.01, z], P)), true)}" fill="${LCD}" stroke="#55554f" stroke-width="0.6"/>`);
    // the mode slider's track
    out.push(`<path d="${K.pathOf([[-4.6, CZ - 2.9], [-0.6, CZ - 2.9], [-0.6, CZ - 2.3], [-4.6, CZ - 2.3]].map(([x, z]) => K.iso([x, BD + 0.01, z], P)), true)}" fill="#55554f"/>`);
    out.push([["HEAT", -4.4], ["OFF", -2.7], ["COOL", -1.2]].map(([s, x]) => `<g transform="${fm(P, x, BD + 0.01, CZ - 3.25)}"><text font-size="0.42" font-weight="700" fill="#55554f" text-anchor="middle" font-family="Helvetica Neue,Arial">${s}</text></g>`).join(""));
    return out.join("");
  }
  function lcdSvg(P, room, set, heat) {
    const at = fm(P, -4.6, BD + 0.02, CZ + 3.2);
    const flame = heat ? `<path d="M5.6 2.9 C5.0 2.3 5.1 1.7 5.6 1.2 C5.7 1.7 6.1 1.9 6.1 1.4 C6.6 1.9 6.6 2.6 6.0 2.9 Z" fill="#e2602a"/>` : "";
    return `<g transform="${at}"><text x="0.5" y="2.9" font-size="2.6" font-weight="700" fill="${INK}" font-family="Helvetica Neue,Arial">${room.toFixed(0)}°</text>` +
      `<text x="0.5" y="3.6" font-size="0.55" font-weight="700" fill="${INK}" font-family="Helvetica Neue,Arial">INSIDE</text>` +
      `<text x="6.4" y="0.9" font-size="0.55" font-weight="700" fill="${INK}" text-anchor="end" font-family="Helvetica Neue,Arial">SET ${set}°</text>` +
      `<text x="6.4" y="3.6" font-size="0.55" font-weight="700" fill="${INK}" text-anchor="end" font-family="Helvetica Neue,Arial">${heat ? "HEAT ON" : "HEAT"}</text>${flame}</g>`;
  }
  function buttonsSvg(P, up, down) {
    const out = [];
    for (const [z, p, ch] of [[CZ + 2.1, up, "▲"], [CZ - 0.1, down, "▼"]]) {
      out.push(ISO.tinted(CASE, ISO.wbox(P, [2.9, 4.5], [BD, BD + 0.7 - 0.45 * p], [z - 0.8, z + 0.8], "hi")));
      out.push(`<g transform="${fm(P, 3.7, BD + 0.71 - 0.45 * p, z - 0.35)}"><text font-size="0.9" fill="#55554f" text-anchor="middle" font-family="Helvetica Neue,Arial">${ch}</text></g>`);
    }
    out.push(ISO.wbox(P, [-4.4, -3.6], [BD, BD + 0.5], [CZ - 2.95, CZ - 2.25], "mid"));
    return out.join("");
  }
  // The wall register below: a grille in the wall and, while the heat runs, three warm wavy lines leaving it.
  const RZ = CZ - 14;
  function ventSvg(P, on, phase) {
    const out = [ISO.wbox(P, [-6, 6], [0, 0.35], [RZ - 2.5, RZ + 2.5], "mid")];
    const slots = []; for (let z = RZ - 1.8; z <= RZ + 1.9; z += 0.9) slots.push(K.pathOf([[-5.2, z - 0.25], [5.2, z - 0.25], [5.2, z + 0.25], [-5.2, z + 0.25]].map(([x, zz]) => K.iso([x, 0.36, zz], P)), true));
    out.push(`<path d="${slots.join("")}" fill="#55554f"/>`);
    if (on > 0.02) for (const x of [-3.5, 0, 3.5]) {
      const pts = []; for (let i = 0; i <= 16; i++) { const y = 0.6 + i * 0.45, z = RZ + 1 + i * i * 0.03; pts.push(K.iso([x + Math.sin(i * 0.5 - phase) * 0.5, y, z], P)); }
      out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="#e98a4a" stroke-width="1.2" stroke-linecap="round" opacity="${(on * 0.85).toFixed(2)}"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "thermostat", title: "Thermostat", compare: "thermostat 480 270 260 temp=70",
    about: "A wall thermostat: below the set point it turns the furnace on (flame on the display, warm air from the register) and off once the room is warm.",
    line: "thermostat cx cy size temp=N room=N lab=1 lit=display|up|down|mode|vent",
    demo: { line: "thermostat 480 270 260 temp=66 room=66", script: [{ set: {}, hold: 1 }, { set: { temp: 70 }, hold: "settle" }, { set: { temp: 68 }, hold: 2.2 }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.6, H = size * 1.75;
      const { P, g } = ISO.frame([[-12, -10, CZ - 20], [12, 0, CZ - 20], [-12, -10, CZ + 8], [12, 0, CZ + 8], [0, 8, CZ - 6]], cx, cy, W, H, { azimuth: 66, elevation: 14 }, parent);
      g.innerHTML = `<g>${wallSvg(P)}</g><g data-name="vent"></g><g data-name="case">${caseSvg(P)}</g><g data-name="display"></g><g data-name="buttons"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { vent: q("vent"), case: q("case"), display: q("display"), buttons: q("buttons"), words: q("words") }, w = ISO.writer();
      const set0 = Math.round(ISO.num(o, "temp", 70)), room0 = ISO.num(o, "room", set0);
      const s = { set: set0, room: room0, heat: room0 <= set0 - BAND, air: 0, up: 0, down: 0, press: 0, phase: 0 }, goal = { set: set0 };
      s.air = s.heat ? 1 : 0;
      let lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.display, `${s.room.toFixed(0)} ${s.set} ${s.heat}`, () => lcdSvg(P, s.room, s.set, s.heat));
        w.rebuild(el.buttons, `${s.up.toFixed(2)} ${s.down.toFixed(2)}`, () => buttonsSvg(P, s.up, s.down));
        w.rebuild(el.vent, s.air > 0.02 ? `${s.air.toFixed(2)} ${(s.phase % (2 * Math.PI)).toFixed(1)}` : "0", () => ventSvg(P, s.air, s.phase));
        w.rebuild(el.words, lab ? String(s.heat) : "", () => !lab ? "" : [
          ISO.word(K.iso([BW / 2, BD, CZ + 2], P), "▲ ▼ set point", "#444", { anchor: "start", size: 14, dy: 0 }),
          ISO.word(K.iso([-BW / 2, BD, CZ + 2], P), "display", "#444", { anchor: "end", size: 14, dy: 0 }),
          ISO.word(K.iso([6, 0.4, RZ], P), s.heat ? "warm air: furnace on" : "heat register", s.heat ? "#b5541a" : "#444", { anchor: "start", size: 14, dy: 4 })].join(""));
        const want = lit || (s.up > 0.05 ? "buttons" : s.down > 0.05 ? "buttons" : s.heat ? "vent" : "display");
        w.light([el.vent, el.display, el.buttons], [q(want)].filter(Boolean));
      };
      g.set = (p) => { if (p.temp !== undefined) goal.set = ISO.clamp(Math.round(+p.temp), 50, 90); if (p.room !== undefined) s.room = +p.room; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt, clock = 0) => {
        const calm = ISO.still();
        // a press every 0.35 s moves the set point a degree toward the goal
        s.press += dt;
        if (s.set !== goal.set && (s.press > 0.35 || calm)) { const d = Math.sign(goal.set - s.set); s.set += d; s.press = 0; if (d > 0) s.up = 1; else s.down = 1; }
        s.up = ISO.follow(s.up, 0, dt, 0.08, calm); s.down = ISO.follow(s.down, 0, dt, 0.08, calm);
        if (s.up < 0.01) s.up = 0; if (s.down < 0.01) s.down = 0;
        if (s.room <= s.set - BAND) s.heat = true;
        if (s.room >= s.set + BAND) s.heat = false;
        s.room += (s.heat ? 1.0 : -0.05) * dt * (calm ? 0 : 1);
        if (calm && s.heat) { s.room = s.set + BAND; s.heat = false; }
        s.air = ISO.follow(s.air, s.heat ? 1 : 0, dt, 0.4, calm); if (Math.abs(s.air - (s.heat ? 1 : 0)) < 0.01) s.air = s.heat ? 1 : 0;
        s.phase += dt * 3;
        draw();
        return s.set !== goal.set || s.heat || s.up > 0 || s.down > 0 || (s.air > 0 && s.air < 1);
      };
      g.readout = () => `room ${s.room.toFixed(1)} °F · set ${s.set} °F · furnace ${s.heat ? `ON, turns off at ${(s.set + BAND).toFixed(1)} °F` : `off, turns on below ${(s.set - BAND).toFixed(1)} °F`}`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
