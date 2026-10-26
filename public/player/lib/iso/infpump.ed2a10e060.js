// "infpump cx cy size rate=mL/h door=0|1 lab=1 lit=screen|keypad|door|line|battery |text" — a volumetric infusion pump.
// The pump stands on a bedside table: a screen showing the rate, the volume infused so far, the volume to be infused,
// the time left and the battery; a keypad with START and STOP; and on the right a door with a clear window over the
// pumping channel. The IV line comes over the top from the bag behind, runs down the channel and out at the bottom to
// its capped end on the table. Twelve fingers squeeze the line one after another in a wave, pushing the fluid down.
// `text` (or rate=) sets the rate, e.g. 125 mL/h. set({ rate }) changes it; set({ door: 1 }) opens the door: the
// pump stops and alarms. Volume infused counts at the true rate (mL/h ÷ 3600 each second).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. Body 120 wide, 70 deep, 180 tall; front face at y = 0.
  const B = { x: -60, y: -70, w: 120, d: 70, r: 8 }, Z0 = 8, Z1 = 188, VTBI = 1000;
  const DOOR = { x0: 16, x1: 54, z0: 22, z1: 172 }, CH = { x0: 22, x1: 48, z0: 40, z1: 154 }, TX = 35, FINGERS = 12;
  const SCR = { x0: -52, x1: 8, z0: 116, z1: 170 };
  const BODY = ISO.tint("#eef1f4", ["#b9c0c8", "#c8ced5", "#d6dbe1", "#e2e6ea"], "#46505b");
  const DARK = ISO.tint("#3a4048", ["#1d2126", "#252a30", "#2d3239", "#343a41"], "#0d0f12");
  const at3 = (P) => (p) => K.iso(p, P);
  const tube = (P, pts, r) => {
    const d = K.pathOf(pts.map(at3(P))), w = 2 * r * G.scaleOf(P);
    return `<path d="${d}" fill="none" stroke="#6d8798" stroke-width="${(w + 1).toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#f1f7fb" stroke-width="${w.toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#a9cfee" stroke-width="${(w * 0.45).toFixed(2)}"/>`;
  };
  const txt = (x, y, s, size, fill, weight = 700, anchor = "start") => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" style="font:${weight} ${size}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;

  function tableSvg(P) {
    const T = { x: -95, y: -100, w: 205, d: 175, r: 6 };
    return `<path class="iso-halo" d="${K.haloOf(B, 0, Z1, P)}"/>` + ISO.tinted(ISO.T.wood, S(K.slabOf(T, -14, 14, P, 6, 0.8), { tone: "lo", inner: L(K.sideSeam(T, -5, P, 6), { tone: "faint" }) }));
  }
  function bodySvg(P) {
    const out = [];
    for (const [x, y] of K.corners(B, 12)) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 6, 0, Z0, P, 20), { tone: "mid" })));
    out.push(ISO.tinted(BODY, S(K.slabOf(B, Z0, Z1 - Z0, P, 8, 1.4), { tone: "mid", inner: L(K.sideSeam(B, Z0 + 14, P, 8) + K.sideSeam(B, Z1 - 18, P, 8), { tone: "faint" }) })));
    // carry handle on top, with the line holder clip
    out.push(ISO.tinted(BODY, ISO.wbox(P, [-40, -32], [-44, -26], [Z1, Z1 + 16], "mid") + ISO.wbox(P, [32, 40], [-44, -26], [Z1, Z1 + 16], "mid") + ISO.wbox(P, [-40, 40], [-44, -26], [Z1 + 16, Z1 + 24], "mid")));
    out.push(ISO.tinted(DARK, ISO.wbox(P, [TX - 5, TX + 5], [-30, -14], [Z1, Z1 + 7], "mid")));
    // battery door on the right side, with its latch and vent slots
    const sx = B.x + B.w + 0.2, side = (pts) => K.pathOf(pts.map(([y, z]) => K.iso([sx, y, z], P)), true);
    out.push(`<path d="${side([[-60, 26], [-14, 26], [-14, 76], [-60, 76]])}" fill="none" stroke="#7d8792" stroke-width="0.8"/>`);
    out.push(`<path d="${side([[-42, 70], [-32, 70], [-32, 73], [-42, 73]])}" fill="#7d8792"/>`);
    for (let i = 0; i < 6; i++) out.push(`<path d="${side([[-58 + i * 8, 120], [-53 + i * 8, 120], [-53 + i * 8, 150], [-58 + i * 8, 150]])}" fill="#5d6670"/>`);
    return out.join("");
  }
  // The front: screen recess, keypad, status lights.
  function faceSvg(P) {
    const out = [], fm = (x, z) => ISO.faceMatrix(P, [x, 0.6, z], 1);
    out.push(ISO.tinted(DARK, ISO.wbox(P, [SCR.x0 - 4, SCR.x1 + 4], [0, 0.6], [SCR.z0 - 4, SCR.z1 + 4], "mid")));
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "◀", "0", "▶"];
    keys.forEach((k, i) => {
      const x = -50 + (i % 3) * 15, z = 96 - Math.floor(i / 3) * 15;
      out.push(ISO.tinted(BODY, ISO.wbox(P, [x, x + 12], [0, 2.4], [z - 12, z], "hi")), `<g style="--anatomy-mid:#33404d">${K.faceTextSvg(fm(x + 6, z - 8.6), k, { size: 6.4, tone: "mid", anchor: "middle" })}</g>`);
    });
    const big = [["START", ISO.T.green, 96], ["STOP", ISO.T.red, 74], ["MUTE", BODY, 52], ["⏻", BODY, 30]];
    big.forEach(([k, tint, z]) => out.push(ISO.tinted(tint, ISO.wbox(P, [-3, 11], [0, 2.4], [z - 14, z], "hi")), `<g style="--anatomy-mid:#26313c">${K.faceTextSvg(fm(4, z - 9), k, { size: k.length > 2 ? 3.6 : 6, tone: "mid", anchor: "middle" })}</g>`));
    return out.join("");
  }
  // The pumping channel behind the door: a dark recess, sensors at both ends, the line, the fingers (moved by translate).
  function channelSvg(P) {
    const out = [ISO.tinted(DARK, ISO.wbox(P, [CH.x0, CH.x1], [-0.6, 0.2], [CH.z0, CH.z1], "mid"))];
    out.push(ISO.tinted(BODY, ISO.wbox(P, [CH.x0, CH.x1], [-0.6, 4], [CH.z1 - 12, CH.z1], "mid") + ISO.wbox(P, [CH.x0, CH.x1], [-0.6, 4], [CH.z0, CH.z0 + 12], "mid")));
    out.push(ISO.tinted(ISO.T.blue, ISO.wbox(P, [TX - 9, TX - 5], [3.6, 5], [CH.z1 - 10, CH.z1 - 3], "hi") + ISO.wbox(P, [TX - 9, TX - 5], [3.6, 5], [CH.z0 + 3, CH.z0 + 10], "hi")));
    return out.join("");
  }
  const fingerSvg = (P, i) => { const z = CH.z0 + 15 + i * 7.3; return ISO.tinted(ISO.T.steel, ISO.wbox(P, [CH.x0 + 1, TX - 2.6], [0.2, 4], [z, z + 5.4], "mid")); };
  // The door, hinged on its right edge, open by angle a (radians); a clear window and a latch on the left edge.
  function doorSvg(P, a) {
    const hx = DOOR.x1, hy = 6, at = (u, w, z) => [hx - u * Math.cos(a) - w * Math.sin(a), hy + u * Math.sin(a) - w * Math.cos(a) + 0, z];
    const out = [];
    const T = ISO.tint("#e4e8ec", ["#aeb6bf", "#bec5cd", "#cdd3d9", "#dadfe4"], "#46505b");
    // frame bars around the window, then the window, then the latch lever
    const wx0 = DOOR.x1 - CH.x1 + 1, wx1 = DOOR.x1 - CH.x0 - 1;
    out.push(ISO.tinted(T, ISO.box(at, P, [0, wx0], [-3, 0], [DOOR.z0, DOOR.z1], "mid") + ISO.box(at, P, [wx1, DOOR.x1 - DOOR.x0], [-3, 0], [DOOR.z0, DOOR.z1], "mid") +
      ISO.box(at, P, [wx0, wx1], [-3, 0], [DOOR.z0, CH.z0 + 1], "mid") + ISO.box(at, P, [wx0, wx1], [-3, 0], [CH.z1 - 1, DOOR.z1], "mid")));
    const win = [[wx0, CH.z0 + 1], [wx1, CH.z0 + 1], [wx1, CH.z1 - 1], [wx0, CH.z1 - 1]].map(([u, z]) => K.iso(at(u, -1.5, z), P));
    out.push(`<path d="${K.pathOf(win, true)}" fill="#dceaf3" fill-opacity=".28" stroke="#5d7f96" stroke-width="0.6"/>`);
    const glint = [[wx0 + 3, CH.z1 - 10], [wx0 + 9, CH.z1 - 10], [wx1 - 3, CH.z0 + 30], [wx1 - 9, CH.z0 + 30]].map(([u, z]) => K.iso(at(u, -1.5, z), P));
    out.push(`<path d="${K.pathOf(glint, true)}" fill="#fff" fill-opacity=".35"/>`);
    out.push(ISO.tinted(DARK, ISO.box(at, P, [DOOR.x1 - DOOR.x0 - 2, DOOR.x1 - DOOR.x0 + 3], [-1, 3], [92, 112], "hi")));
    for (const z of [DOOR.z0 + 10, DOOR.z1 - 22]) out.push(ISO.tinted(T, S(G.disc(0, 12, 2.6, G.frameOf([hx + 1.5, 4, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "mid" })));
    return out.join("");
  }
  // The screen in the face plane: state line, rate, volumes, time left, battery.
  function screenSvg(P, s, rate) {
    const m = ISO.faceMatrix(P, [SCR.x0, 0.65, SCR.z1], 1), w = SCR.x1 - SCR.x0, h = SCR.z1 - SCR.z0;
    const alarm = s.door > 0.05, left = Math.max(0, VTBI - s.vi), hrs = left / rate;
    let a = `<rect width="${w}" height="${h}" rx="2" fill="${alarm ? "#3a2412" : "#0f2a3d"}"/>`;
    a += `<rect width="${w}" height="9" rx="2" fill="${alarm ? "#f4a531" : "#2f9e5b"}"/>` + txt(3, 7, alarm ? "DOOR OPEN · PUMP STOPPED" : "INFUSING ▸▸▸", 5.4, "#fff");
    // battery: 4 cells, 3 full, and the mains plug mark
    a += `<rect x="${w - 15}" y="1.6" width="11" height="5.6" rx="0.8" fill="none" stroke="#fff" stroke-width="0.7"/><rect x="${w - 4}" y="3.3" width="1.2" height="2.2" fill="#fff"/>` + [0, 1, 2].map((i) => `<rect x="${w - 14 + i * 2.6}" y="2.6" width="2" height="3.6" fill="#fff"/>`).join("");
    a += txt(3, 26, rate.toFixed(0), 15, "#e9f4ff") + txt(3 + String(rate.toFixed(0)).length * 8.6, 26, "mL/h", 6.4, "#9fc4e0", 600);
    a += txt(3, 34.5, `VI ${s.vi.toFixed(1)} mL infused`, 5.2, "#cfe3f3", 600) + txt(3, 42, `VTBI ${VTBI} mL to go in`, 5.2, "#cfe3f3", 600);
    a += txt(3, 50.5, alarm ? "close the door to resume" : `${Math.floor(hrs)} h ${String(Math.round((hrs % 1) * 60)).padStart(2, "0")} min left`, 5.2, alarm ? "#f4c27a" : "#cfe3f3", 600);
    return `<g transform="${m}">${a}</g>`;
  }

  ISO.add({
    name: "infpump", title: "Infusion pump", compare: "infpump 480 270 320 |125 mL/h",
    about: "A volumetric infusion pump: twelve fingers squeeze the line behind a clear door in a wave; the screen shows the rate, volume infused, time left and battery.",
    line: "infpump cx cy size rate=mL/h door=0|1 lab=1 lit=screen|keypad|door|line|battery |text",
    demo: { line: "infpump 480 270 320 |125 mL/h", script: [{ set: { lit: "line" }, hold: 3 }, { set: { rate: 250, lit: "screen" }, hold: 3 }, { set: { door: 1, lit: "door" }, hold: 3 }, { set: { door: 0, lit: "" }, hold: 2.5 }] },
    make([cx, cy, size = 320], o, text, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.2;
      const { P, g } = ISO.frame([[-95, -100, -14], [110, 75, -14], [-95, 75, -14], [110, -100, -14], [-60, -70, Z1 + 24], [60, 0, Z1 + 24], [DOOR.x1 + 60, 0, DOOR.z1]], cx, cy, W, H, { azimuth: 58, elevation: 22 }, parent);
      const back = tube(P, G.fillet([[TX, -60, Z1 + 3.5], [TX, -84, Z1 + 3.5], [TX, -84, 120]], 12, 9), 1.9);
      const front = tube(P, G.fillet([[TX, 2.4, CH.z1 + 4], [TX, 2.4, Z1 + 3.5], [TX, -60, Z1 + 3.5]], 10, 9), 1.9);
      const inside = tube(P, [[TX, 2.4, CH.z0 - 0.5], [TX, 2.4, CH.z1 + 4.5]], 1.9);
      const down = G.fillet([[TX, 2.4, CH.z0], [TX, 2.4, 1.9], [TX + 30, 40, 1.9], [TX + 46, 40, 1.9]], 14, 9);
      g.innerHTML = `<g>${tableSvg(P)}</g><g data-name="line-back">${back}</g><g data-name="battery">${bodySvg(P)}</g><g data-name="keypad">${faceSvg(P)}</g><g data-name="screen"></g>` +
        `<g data-name="channel">${channelSvg(P)}</g><g data-name="line">${inside}${tube(P, down, 1.9)}${front}` +
        S(G.disc(0, 7, 2.6, G.frameAlong([TX + 46, 40, 2.6], [1, 0, 0]), P), { tone: "mid" }) + ISO.tinted(ISO.T.blue, S(G.disc(7, 13, 3.4, G.frameAlong([TX + 46, 40, 3.4], [1, 0, 0]), P), { tone: "hi" })) + `</g>` +
        `<g data-part="fingers">${Array.from({ length: FINGERS }, (_, i) => `<g>${fingerSvg(P, i)}</g>`).join("")}</g><g data-name="door"></g>` +
        `<circle data-part="led" r="2.2" stroke="#1d2126" stroke-width=".6"/><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer();
      const fingers = [...q("fingers").children], led = q("led"), screen = nm("screen"), door = nm("door"), parts = [...g.querySelectorAll("[data-name]")];
      const ledAt = K.iso([-45, 0.6, 108], P);
      w.attr(led, "cx", ledAt[0].toFixed(1)); w.attr(led, "cy", ledAt[1].toFixed(1));
      const rate0 = parseFloat(text) || ISO.num(o, "rate", 125);
      const s = { rate: ISO.clamp(ISO.num(o, "rate", rate0), 0.1, 999), vi: 48.6, door: o.door === "1" ? 1 : 0, wantDoor: o.door === "1" ? 1 : 0, phase: 0, t: 0, lit: o.lit || "" };
      if (lab) {
        const word = (p, t, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], t, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word([SCR.x0 - 4, 0, 160], "Screen", "end", 0, -6) + word([-60, 0, 62], "Keypad", "end", 0, -6) + word([DOOR.x1 + 4, 0, 150], "Door over the pumping fingers", "start", 0, 8) +
          word([TX + 52, 40, 0], "Line to the patient", "start", 14) + word([TX, -84, Z1 + 4], "Line from the bag", "start", 4, 10);
      }
      const draw = () => {
        const running = s.door < 0.02;
        // the wave: each finger presses in turn, a period of 1.2 s at 125 mL/h, faster as the rate rises
        fingers.forEach((f, i) => { const push = running ? Math.max(0, Math.sin(s.phase - i * 0.55)) : 0; w.attr(f, "transform", K.translateAlong(P, [push * 3.2, 0, 0])); });
        w.attr(led, "fill", running ? (Math.sin(s.t * 4) > 0 ? "#3ccf6e" : "#1d5e33") : (Math.sin(s.t * 8) > 0 ? "#f4a531" : "#5a3d10"));
        w.rebuild(screen, `${s.rate} ${s.vi.toFixed(1)} ${s.door > 0.05}`, () => screenSvg(P, s, s.rate));
        w.rebuild(door, s.door.toFixed(3), () => doorSvg(P, s.door * 1.25));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
      };
      g.set = (p) => {
        if (p.rate !== undefined) s.rate = ISO.clamp(+p.rate, 0.1, 999);
        if (p.door !== undefined) s.wantDoor = +p.door ? 1 : 0;
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        s.t += dt;
        s.door = ISO.follow(s.door, s.wantDoor, dt, 0.3, ISO.still());
        if (s.door < 0.02) { s.vi += (s.rate / 3600) * dt; s.phase += dt * (2 * Math.PI / 1.2) * Math.min(4, s.rate / 125); }
        draw();
        return true;
      };
      g.readout = () => s.door > 0.05 ? "door open · pump stopped, alarm sounding · close the door to carry on" :
        `${s.rate.toFixed(0)} mL/h = ${(s.rate / 60).toFixed(2)} mL a minute · ${s.vi.toFixed(1)} of ${VTBI} mL in · ${((VTBI - s.vi) / s.rate).toFixed(1)} h left · on mains, battery 75%`;
      draw();
      return g;
    },
  });
})();
