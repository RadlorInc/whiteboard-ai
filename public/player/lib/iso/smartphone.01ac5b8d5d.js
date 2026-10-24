// "smartphone cx cy height on=1 apart=0..1 lab=1 lit=glass|display|board|battery|frame|back |text" — a phone lying
// face up, built from its real layers. From the bottom: the back glass (camera windows and the wireless-charging coil
// on its inside face); the aluminium frame (the mid-plate and the rails with the side buttons and antenna breaks);
// the battery with its printed label and its flex; the L-shaped logic board (the processor under its shield can, the
// modem, storage, the power chip, the SIM tray, the camera module, the vibration motor, the speaker and the USB-C
// port); the OLED display; the cover glass. apart=1 lifts the layers apart in their stacking order (the way a
// repairer takes one apart); apart=0 closes it. on=0 blanks the screen; |text shows on the screen instead of the app
// icons. set({ apart, on, lit }). 1 unit = 1 mm (a 147 × 71.5 × 7.8 mm phone).
(() => {
  const K = window.K, T = window.TECH;
  const HW = 35.75, HL = 73.5, R = 9, DZ = 10, SX = 78, RAIL = 1.6;   // lift per layer, then the spread per layer
  const Z = { back: [0, 0.9], plate: [0.9, 1.5], rail: [0.9, 8], disp: [8, 8.8], glass: [8.8, 9.5] };
  const zh = ([z0, z1]) => [z0, z1 - z0];                                  // a z span as (base, height)
  const pl = (i) => ({ x: -HW + i, y: -HL + i, w: 2 * (HW - i), d: 2 * (HL - i), r: Math.max(1, R - i) });

  ISO.add({
    name: "smartphone", title: "Smartphone (inside)", compare: "smartphone 480 270 380",
    about: "A smartphone taken apart in its real layers: back glass with the charging coil, the aluminium frame, the battery, the logic board with its chips and camera, the OLED display and the cover glass.",
    line: "smartphone cx cy height on=1 apart=0..1 lab=1 lit=glass|display|board|battery|frame|back |text",
    demo: { line: "smartphone 480 270 380", script: [{ set: {}, hold: 1 }, { set: { apart: 1 }, hold: "settle" }, { set: { apart: 0 }, hold: "settle" }] },
    make([cx, cy, size = 380], o, text, parent) {
      const lab = o.lab !== "0", W = size * 2.3, H = size * 1.25, on = o.on !== "0";
      const top = Z.glass[1] + DZ * 5, x0 = -HW - 2.5 * SX, x1 = HW + 2.5 * SX;
      const { P, g } = ISO.frame([[x0, -HL, 0], [x1, -HL, 0], [x0, HL, 0], [x1, HL, 0], [x0, -HL, top], [x1, -HL, top], [x0, HL, top], [x1, HL, top]], cx, cy, W, H, { azimuth: -72, elevation: 42, pad: size * 0.02 }, parent);
      const box = (x, y, z, tone, c, lit) => T.box(P, x, y, z, tone, c, lit);
      const [vx, vy] = K.towardViewer(P), near = ([x, y]) => x * vx + y * vy > 0;

      // ── back glass: the slab, the camera windows and the charging coil on its inside face
      const back = [T.slab(P, pl(0), ...zh(Z.back), "lo", T.C.white, 6, 0.4)];
      const bz = Z.back[1];
      back.push(`<path d="${K.ring(-24, 58, 6.2, bz, P, 32)}${K.ring(-24, 44, 6.2, bz, P, 32)}" fill="#2a2e33" stroke="#4a5058" stroke-width=".6"/>`);
      back.push(`<path d="${K.ring(-24, 58, 3.6, bz, P, 28)}${K.ring(-24, 44, 3.6, bz, P, 28)}" fill="#3f5a74" stroke="#1f2226" stroke-width=".5"/>`);
      back.push(`<path d="${[8, 11, 14, 17, 20].map((r) => K.ring(0, -6, r, bz, P, 48)).join("")}" fill="none" stroke="#c98258" stroke-width=".9"/>`);
      back.push(`<path d="${K.ring(0, -6, 6, bz, P, 32)}" fill="#e9e6df" stroke="#6e3a1c" stroke-width=".6"/>`);

      // ── the frame: mid-plate, then the rails as two concave halves (far before the parts inside, near after)
      const O = K.ringOf(pl(0), 6), I = K.ringOf(pl(RAIL), 6), n = O.length, far = O.map((p) => !near(p));
      const runOf = (want) => {
        const s = far.findIndex((f, i) => f === want && far[(i + n - 1) % n] !== want), idx = [(s + n - 1) % n];
        for (let i = s; far[i % n] === want; i++) idx.push(i % n);
        idx.push((idx[idx.length - 1] + 1) % n);
        return idx;
      };
      const half = (want) => { const r = runOf(want); return T.S(K.extrude([...r.map((i) => O[i]), ...r.slice().reverse().map((i) => I[i])], Z.rail[0], Z.rail[1] - Z.rail[0], P, { convex: false }), { tone: "mid" }); };
      // side buttons (seen from the screen side): power on the right (-x), volume and the mute switch on the left (+x); each drawn with the rail half it sits on
      // (the buttons sit on the rails, concave extrusions audit.mjs doesn't record, so it reads them as loose)
      const buttons = [[-HW, 20, 34], [HW, 14, 24], [HW, 27, 37], [HW, 41, 45]].map(([x, y0, y1]) => ({ x, near: near([x, (y0 + y1) / 2]), svg: box(x > 0 ? [HW, HW + 0.7] : [-HW - 0.7, -HW], [y0, y1], [3.2, 5.6], "mid", T.C.alu) }));
      const frameFar = ISO.tinted(T.C.alu, T.slab(P, pl(RAIL - 0.2), ...zh(Z.plate), "lo", "", 6) + half(true)) + buttons.filter((b) => !b.near).map((b) => b.svg).join("");
      const frameNear = buttons.filter((b) => b.near).map((b) => b.svg).join("") + ISO.tinted(T.C.alu, half(false));

      // ── the battery: a pouch cell with its label, and the flex that plugs it into the board
      const B0 = Z.plate[1];
      const batt = [T.slab(P, { x: -31, y: -52, w: 42, d: 70, r: 2.5 }, B0, 4.1, "hi", T.C.battery, 4)];
      batt.push(T.flat(P, [7, 10, B0 + 4.11], [-1, 0, 0], [0, -1, 0], T.text(17, 8, "Li-ion 3.85 V", 4.2, "#4a453d") + T.text(17, 14, "3279 mAh · 12.6 Wh", 3.4, "#6b655c", "middle", 600)));
      batt.push(box([4, 11], [8, 13], [B0 + 4.1, B0 + 4.5], "mid", T.C.dark));

      // ── the logic board: an L of green board, the chips on it, and the parts that ride with it
      const pcb = (x, y) => box(x, y, [B0, B0 + 1], "mid", T.C.pcb), bt = B0 + 1;
      const board = [pcb([13, 31.5], [-71.5, 56]), pcb([-31, 13], [23, 56]), pcb([-31, 13], [-71.5, -55])];
      board.push(`<g data-name="soc">${box([15, 30], [0, 20], [bt, bt + 1.2], "hi", T.C.steel)}</g>`);
      board.push(box([16, 28.5], [-26, -12], [bt, bt + 0.9], "mid", T.C.chip), box([16, 28], [28, 40], [bt, bt + 0.9], "mid", T.C.chip), box([-6, 3], [29, 37], [bt, bt + 0.8], "mid", T.C.chip), box([4.5, 10], [42, 48], [bt, bt + 0.7], "mid", T.C.chip));
      board.push(box([23, 31.5], [-44, -27], [bt, bt + 1.1], "mid", T.C.steel), T.dot(P, [[24.6, -35.5, bt + 1.1]], 0.5, "lo"));
      // camera module: a block with its two sensor housings, each lens pointing down through the back glass windows
      board.push(box([-30, -15], [37, 54.5], [bt, bt + 3.6], "mid", T.C.dark));
      board.push(T.cyl(P, -24, 46, 4.4, bt + 3.6, 0.8, "mid", T.C.black, 28), T.cyl(P, -24, 46, 2.6, bt + 4.4, 0.5, "hi", T.C.steel, 24));
      // the parts on the board's bottom end: vibration motor, loudspeaker, USB-C port against the bottom rail
      board.push(box([-29, -7], [-69, -58], [bt, bt + 3], "mid", T.C.steel), box([8, 28], [-69.5, -60], [bt, bt + 2.6], "mid", T.C.black));
      board.push(box([-4.5, 4.5], [-71.9, -64], [bt, bt + 3.2], "hi", T.C.steel));
      board.push(T.quad(P, [[-3.2, -71.92, bt + 0.8], [3.2, -71.92, bt + 0.8], [3.2, -71.92, bt + 2.4], [-3.2, -71.92, bt + 2.4]], "#2a2e33", "#1f2226", 0.5));

      // ── the display (its picture drawn on its own face) and the cover glass, seen through
      const disp = [T.slab(P, pl(0.4), ...zh(Z.disp), "mid", T.C.black, 6)];
      disp.push(`<g data-part="screen"></g>`);
      const glass = `<g style="opacity:.3">${T.slab(P, pl(0), ...zh(Z.glass), "hi", T.C.glass, 6, 0.4)}</g>`;

      g.innerHTML = `<g data-name="back" data-l="0"><path class="iso-halo" d="${K.haloOf(pl(0), 0, 1, P)}"/>${back.join("")}</g><g data-name="frame" data-l="1">${frameFar}</g>` +
        `<g data-name="battery" data-l="2">${batt.join("")}</g><g data-name="board" data-l="3">${board.join("")}</g>` +
        `<g data-name="frame" data-l="1">${frameNear}</g><g data-name="display" data-l="4">${disp.join("")}</g><g data-name="glass" data-l="5">${glass}</g><g data-part="words"></g>`;

      // the screen's picture: status bar, the island, a grid of app icons and a dock, or the given text
      const SW = 2 * (HW - 2.2), SH = 2 * (HL - 2.2), ICON = ["#f2a33a", "#3cc45a", "#2f8fe8", "#e0463a", "#8a63d2", "#1fb5b0", "#f05a9a", "#7a8794"];
      const pic = (() => {
        const clip = `sp${T.uid++}`, s = [`<clipPath id="${clip}"><rect width="${SW}" height="${SH}" rx="7"/></clipPath><g clip-path="url(#${clip})">`];
        s.push(`<rect width="${SW}" height="${SH}" fill="${on ? (text ? "#dff1ff" : "#1d2b3a") : "#101215"}"/>`);
        if (on) {
          s.push(`<rect x="${SW / 2 - 9}" y="3" width="18" height="5" rx="2.5" fill="#050607"/>`, T.text(8, 7.4, "9:41", 3.2, text ? "#1f3b4d" : "#fff", "start"));
          if (text) {
            const fs = Math.min(9, (SW - 8) / (0.56 * Math.max(1, text.length)));
            s.push(T.text(SW / 2, SH / 2 + fs * 0.35, text, fs.toFixed(2), "#1f3b4d"));
          } else {
            for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) s.push(`<rect x="${6.5 + c * 15.5}" y="${18 + r * 18}" width="11" height="11" rx="3" fill="${ICON[(r * 4 + c * 3) % 8]}"/>`);
            s.push(`<rect x="4" y="${SH - 20}" width="${SW - 8}" height="15" rx="6" fill="#3a4a5a"/>`);
            for (let c = 0; c < 4; c++) s.push(`<rect x="${7.5 + c * 15.2}" y="${SH - 18}" width="11" height="11" rx="3" fill="${ICON[(c * 5 + 1) % 8]}"/>`);
          }
        }
        return s.join("") + "</g>";
      })();
      g.querySelector('[data-part="screen"]').innerHTML = T.flat(P, [SW / 2, SH / 2, Z.disp[1] + 0.01], [-1, 0, 0], [0, -1, 0], pic);

      const layers = [...g.querySelectorAll("[data-l]")], words = g.querySelector('[data-part="words"]'), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const st = { apart: ISO.clamp(ISO.num(o, "apart", 0), 0, 1), want: 0, lit: o.lit || "", up: null };
      st.want = st.apart;
      const [farEl, nearEl] = g.querySelectorAll('[data-name="frame"]'), dispEl = g.querySelector('[data-name="display"]');
      // The layers first lift straight up out of each other, then spread sideways like a teardown laid out on a mat.
      const lift = () => ISO.smooth(0, 0.45, st.apart), spread = () => ISO.smooth(0.4, 1, st.apart);
      const at = (l) => [(l - 2.5) * SX * spread(), 0, l * DZ * lift()];
      const draw = () => {
        for (const e of layers) w.attr(e, "transform", K.translateAlong(P, at(+e.dataset.l)));
        // once everything has lifted clear, the frame's near rails go behind the parts that now ride above them
        const up = lift() > 0.999;
        if (up !== st.up) { st.up = up; up ? farEl.after(nearEl) : dispEl.before(nearEl); }
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const show = lab && st.apart > 0.7;
        w.rebuild(words, show ? st.apart.toFixed(2) : "", () => !show ? "" : [
          ["back glass", 0, Z.back[1]], ["frame", 1, Z.plate[1]], ["battery", 2, B0], ["logic board", 3, B0], ["display", 4, Z.disp[0]], ["cover glass", 5, Z.glass[0]],
        ].map(([s, l, z]) => { const a = at(l); return T.word(P, [a[0], -HL, z + a[2]], s, { dy: 18 }); }).join(""));
      };
      g.set = (p) => {
        if (p.apart !== undefined) st.want = ISO.clamp(+p.apart, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.apart = ISO.follow(st.apart, st.want, dt, 0.35, ISO.still());
        if (Math.abs(st.apart - st.want) < 0.002) st.apart = st.want;
        draw();
        return st.apart !== st.want;
      };
      g.readout = () => (st.apart > 0.05 ? `taken apart · 6 layers, 7.8 mm in all · the battery stores 3.85 V × 3.279 Ah = 12.6 Wh · the processor sits under the steel shield can`
        : `closed · 147 × 71.5 × 7.8 mm · 6.1-inch OLED, 2532 × 1170 pixels${on ? "" : " · screen off"}`);
      draw();
      return g;
    },
  });
})();
