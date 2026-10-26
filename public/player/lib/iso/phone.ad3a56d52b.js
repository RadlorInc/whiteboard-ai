// "phone cx cy k apart=0..1 on=0|1 show=home|call|msg lab=0 lit=glass|display|board|battery|frame|back" — a PART
// (PARTS.md, batch 6): the smartphone of smartphone.js lying face up on a surface, its origin the surface point under
// its middle, 71.5 × 147 × 7.8 mm, the long side along y. From the bottom: the back glass (the two camera windows and
// the charging coil on its inside face); the aluminium frame (mid-plate, rails with the power and volume buttons, the
// mute switch and the plastic antenna breaks); the pouch battery with its label and flex; the L-shaped logic board
// (phoneboard: the processor under its shield can, modem, storage, power chips, SIM reader, vibration motor,
// loudspeaker, USB-C) with the camera module and the earpiece; the OLED display; the cover glass. apart=1 lifts the
// layers out of each other and lays them side by side along x (a teardown on a mat); on=1 lights the screen with one
// of three fixed pictures and their own words: home (app icons and a dock), call (a call screen) or msg (two message
// bubbles). set({ apart, on, show }). Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const HW = 35.75, HL = 73.5, R = 9, DZ = 8, SX = 76, RAIL = 1.6, SHOWS = ["home", "call", "msg"];
  const Z = { back: [0, 0.8], plate: [0.8, 1.3], rail: [0.8, 6.6], disp: [6.6, 7.2], glass: [7.2, 7.8] };
  const zh = ([z0, z1]) => [z0, z1 - z0];
  const pl = (i) => ({ x: -HW + i, y: -HL + i, w: 2 * (HW - i), d: 2 * (HL - i), r: Math.max(1, R - i) });
  const SW = 2 * (HW - 2.2), SH = 2 * (HL - 2.2), ICON = ["#f2a33a", "#3cc45a", "#2f8fe8", "#e0463a", "#8a63d2", "#1fb5b0", "#f05a9a", "#7a8794"];
  let uid = 0;

  // the screen's picture in flat screen units (x right, y down, 1 = 1 mm): status bar, then the chosen page
  function picture(on, show, id) {
    const B = window.B39, s = [`<clipPath id="${id}"><rect width="${SW}" height="${SH}" rx="7"/></clipPath><g clip-path="url(#${id})">`];
    const light = show !== "home";
    s.push(`<rect width="${SW}" height="${SH}" fill="${!on ? "#101215" : light ? "#eef3f7" : "#1d2b3a"}"/>`);
    if (!on) return s.join("") + `<path d="M${SW * 0.55} 0L${SW * 0.8} 0L${SW * 0.3} ${SH}L${SW * 0.05} ${SH}Z" fill="#fff" fill-opacity=".05"/></g>`;
    const ink = light ? "#1f3b4d" : "#ffffff";
    s.push(`<rect x="${SW / 2 - 9}" y="3" width="18" height="5" rx="2.5" fill="#050607"/>`, B.text(8, 7.4, "9:41", 3.2, ink, "start"));
    for (let i = 0; i < 4; i++) s.push(`<rect x="${SW - 19 + i * 1.6}" y="${7.6 - 1 - i * 0.8}" width="1.1" height="${1 + i * 0.8}" fill="${ink}"/>`);
    s.push(`<rect x="${SW - 11.5}" y="4.6" width="6" height="3" rx=".8" fill="none" stroke="${ink}" stroke-width=".5"/><rect x="${SW - 11}" y="5.1" width="4.2" height="2" fill="${ink}"/>`);
    if (show === "home") {
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) s.push(`<rect x="${6.5 + c * 15.5}" y="${18 + r * 18}" width="11" height="11" rx="3" fill="${ICON[(r * 4 + c * 3) % 8]}"/>`);
      s.push(`<rect x="4" y="${SH - 20}" width="${SW - 8}" height="15" rx="6" fill="#3a4a5a"/>`);
      for (let c = 0; c < 4; c++) s.push(`<rect x="${7.5 + c * 15.2}" y="${SH - 18}" width="11" height="11" rx="3" fill="${ICON[(c * 5 + 1) % 8]}"/>`);
    } else if (show === "call") {
      s.push(`<rect width="${SW}" height="${SH}" y="10" fill="#2c3e50"/>`, B.text(SW / 2, 30, "calling", 4, "#c9d6e2", "middle", 500), B.text(SW / 2, 42, "Home", 8, "#ffffff"));
      s.push(`<circle cx="${SW / 2}" cy="70" r="13" fill="#7a8794"/><circle cx="${SW / 2}" cy="66" r="5" fill="#c9d6e2"/><path d="M${SW / 2 - 8} 79a8 7 0 0 1 16 0z" fill="#c9d6e2"/>`);
      for (const [x, c] of [[SW / 2 - 14, "#e0463a"], [SW / 2 + 14, "#3cc45a"]]) s.push(`<circle cx="${x}" cy="${SH - 24}" r="7" fill="${c}"/>`);
      s.push(B.text(SW / 2 - 14, SH - 11, "end", 3.4, "#c9d6e2", "middle", 500), B.text(SW / 2 + 14, SH - 11, "speaker", 3.4, "#c9d6e2", "middle", 500));
    } else {
      s.push(`<rect y="10" width="${SW}" height="14" fill="#dde6ee"/>`, B.text(SW / 2, 20, "Messages", 4.6, "#1f3b4d"));
      s.push(`<rect x="5" y="34" width="44" height="13" rx="6" fill="#d5dde4"/>`, B.text(9, 42.6, "Are you home?", 3.6, "#1f3b4d", "start", 500));
      s.push(`<rect x="${SW - 52}" y="54" width="47" height="13" rx="6" fill="#2f8fe8"/>`, B.text(SW - 48, 62.6, "Yes, see you at 5", 3.6, "#ffffff", "start", 500));
      s.push(`<rect x="4" y="${SH - 16}" width="${SW - 8}" height="10" rx="5" fill="#ffffff" stroke="#b9c4ce" stroke-width=".5"/>`, B.text(9, SH - 9.6, "Message", 3.4, "#9aa6b1", "start", 500));
    }
    return s.join("") + "</g>";
  }

  ISO.add({
    name: "phone", title: "Smartphone (part)", compare: null,
    about: "A smartphone lying face up, built from its real layers: back glass with the camera windows and charging coil, the aluminium frame with its buttons and antenna breaks, the battery, the L-shaped logic board, the OLED display and the cover glass; apart lifts the layers and lays them side by side, on lights the screen. anchors: top",
    line: "phone cx cy k apart=0..1 on=0|1 show=home|call|msg lab=0 lit=glass|display|board|battery|frame|back",
    demo: { line: "phone 480 290 22 lab=1", script: [{ set: {}, hold: 1 }, { set: { show: "call", lit: "glass" }, hold: 1.4 }, { set: { apart: 1, lit: "" }, hold: "settle" }, { set: { lit: "board" }, hold: 1.4 }, { set: { show: "msg", lit: "battery" }, hold: 1.4 }, { set: { on: 0, lit: "frame" }, hold: 1.2 }, { set: { apart: 0, on: 1, show: "home", lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B39;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = B.cam(ISO.mm(Pc), 180), lab = o.lab === "1";
      const box = (x, y, z, tone, c) => T.box(P, x, y, z, tone, c);
      const [vx, vy] = K.towardViewer(P), near = ([x, y]) => x * vx + y * vy > 0;

      // ── back glass: the slab, the camera windows and the charging coil on its inside face
      const back = [T.slab(P, pl(0), ...zh(Z.back), "lo", T.C.white, 6, 0.3)], bz = Z.back[1];
      back.push(`<path d="${K.ring(24, 64, 6.2, bz, P, 32)}${K.ring(24, 50, 6.2, bz, P, 32)}" fill="#2a2e33" stroke="#4a5058" stroke-width=".6"/>`);
      back.push(`<path d="${K.ring(24, 64, 3.6, bz, P, 28)}${K.ring(24, 50, 3.6, bz, P, 28)}" fill="#3f5a74" stroke="#1f2226" stroke-width=".5"/>`);
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
      // (the buttons and the antenna breaks sit on the rails, concave extrusions the audit doesn't record as support)
      const half = (want) => { const r = runOf(want); return T.S(K.extrude([...r.map((i) => O[i]), ...r.slice().reverse().map((i) => I[i])], Z.rail[0], Z.rail[1] - Z.rail[0], P, { convex: false }), { tone: "mid" }); };
      const buttons = [[HW, 20, 34], [-HW, 14, 24], [-HW, 27, 37], [-HW, 41, 45]].map(([x, y0, y1]) => ({ near: near([x, (y0 + y1) / 2]), svg: box(x > 0 ? [HW, HW + 0.6] : [-HW - 0.6, -HW], [y0, y1], [2.6, 4.8], "mid", T.C.alu) }));
      const breaks = [[HW, 58], [HW, -58], [-HW, 58], [-HW, -58]].filter(([x, y]) => near([x, y])).map(([x, y]) =>
        T.quad(P, [[x + Math.sign(x) * 0.02, y, Z.rail[0] + 0.3], [x + Math.sign(x) * 0.02, y + 1.4, Z.rail[0] + 0.3], [x + Math.sign(x) * 0.02, y + 1.4, Z.rail[1] - 0.3], [x + Math.sign(x) * 0.02, y, Z.rail[1] - 0.3]], "#5a5f66", "#2a2e33", 0.4)).join("");
      const frameFar = ISO.tinted(T.C.alu, T.slab(P, pl(RAIL - 0.2), ...zh(Z.plate), "lo", "", 6) + half(true)) + box([-6, 6], [64.5, 69.5], [Z.plate[1], Z.plate[1] + 2], "mid", T.C.black) + buttons.filter((b) => !b.near).map((b) => b.svg).join("");
      const frameNear = ISO.tinted(T.C.alu, half(false)) + breaks + buttons.filter((b) => b.near).map((b) => b.svg).join("");

      // ── the battery (phonebattery's cell), its flex reaching down to the board's foot
      const B0 = Z.plate[1], batt = B.battery(P, { x0: -33, x1: 14, y0: -49, y1: 30, z0: B0, h: 5, fx: -10.5, flen: 4.35, fz: 3.5 });

      // ── the logic board (phoneboard), the camera module lying lens-down over its windows, its flex to the board,
      // the earpiece at the top
      const board = [B.board(P, 3.5, -26.5, B0, 0).svg];
      const cam = `<g data-name="camera">${box([17.5, 30.5], [44.5, 69.5], [Z.back[1], 6], "mid", T.C.dark)}${box([18.5, 29.5], [46, 68], [6, 6.25], "hi", T.C.steel)}` +
        box([20, 26], [16, 44.6], [3.5, 3.7], "mid", T.C.copper) + box([19.5, 26.5], [14, 18], [B0 + 1, 3.5], "mid", T.C.dark) + "</g>";
      board.push(cam);

      // ── the display (its picture drawn on its own face) and the cover glass, seen through
      const disp = [T.slab(P, pl(0.4), ...zh(Z.disp), "mid", T.C.black, 6), `<g data-part="screen"></g>`];
      const glass = `<g style="opacity:.3">${T.slab(P, pl(0), ...zh(Z.glass), "hi", T.C.glass, 6, 0.3)}</g>`;

      g.innerHTML = `<g data-name="back" data-l="0"><path class="iso-halo" d="${K.haloOf(pl(0), 0, 1, P)}"/>${back.join("")}</g><g data-name="frame" data-l="1">${frameFar}</g>` +
        `<g data-name="battery" data-l="2">${batt.svg}</g><g data-name="board" data-l="3">${board.join("")}</g>` +
        `<g data-name="frame" data-l="1">${frameNear}</g><g data-name="display" data-l="4">${disp.join("")}</g><g data-name="glass" data-l="5">${glass}</g><g data-part="words"></g>`;

      const layers = [...g.querySelectorAll("[data-l]")], words = g.querySelector('[data-part="words"]'), screen = g.querySelector('[data-part="screen"]'), w = ISO.writer();
      const st = { apart: B.num(o, "apart", 0, 0, 1), on: o.on !== "0", show: SHOWS.includes(o.show) ? o.show : "home", lit: o.lit || "", up: null };
      st.want = st.apart;
      const cid = `b39p${uid++}`;
      const [farEl, nearEl] = g.querySelectorAll('[data-name="frame"]'), dispEl = g.querySelector('[data-name="display"]');
      // the layers first lift straight up out of each other, then spread sideways like a teardown laid out on a mat
      const lift = () => ISO.smooth(0, 0.45, st.apart), spread = () => ISO.smooth(0.4, 1, st.apart);
      const at = (l) => [(2.5 - l) * SX * spread(), 0, l * DZ * lift()];
      const draw = () => {
        w.rebuild(screen, `${st.on} ${st.show}`, () => T.flat(P, [SW / 2, SH / 2, Z.disp[1] + 0.01], [-1, 0, 0], [0, -1, 0], picture(st.on, st.show, cid)));
        for (const e of layers) w.attr(e, "transform", K.translateAlong(P, at(+e.dataset.l)));
        // once everything has lifted clear, the frame's near rails go behind the parts that now ride above them
        const up = lift() > 0.999;
        if (up !== st.up) { st.up = up; up ? farEl.after(nearEl) : dispEl.before(nearEl); }
        B.light(w, g, st.lit);
        const show = lab ? (st.apart > 0.7 ? "apart" : st.apart < 0.05 ? "shut" : "") : "";
        w.rebuild(words, show && (show === "shut" ? show : st.apart.toFixed(2)), () => show === "apart" ? [
          ["back glass", 0, Z.back[1]], ["frame", 1, Z.plate[1]], ["battery", 2, B0], ["logic board", 3, B0], ["display", 4, Z.disp[0]], ["cover glass", 5, Z.glass[0]],
        ].map(([s, l, z]) => { const a = at(l); return T.word(P, [a[0], -HL, z + a[2]], s, { dy: 18 }); }).join("") : show ? T.word(P, [HW, 0, Z.glass[1]], "phone", { anchor: "start", dx: 12 }) : "");
      };
      g.anchors = { top: [0, 0, Z.glass[1] / 10] };
      g.set = (p) => {
        if (B.fin(p.apart)) st.want = ISO.clamp(+p.apart, 0, 1);
        if (p.on !== undefined) st.on = String(p.on) === "1";
        if (SHOWS.includes(p.show)) st.show = p.show;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.apart = ISO.follow(st.apart, st.want, dt, 0.35, ISO.still());
        if (Math.abs(st.apart - st.want) < 0.002) st.apart = st.want;
        draw();
        return st.apart !== st.want;
      };
      g.readout = () => (st.apart > 0.05 ? "taken apart · 6 layers, 7.8 mm in all · the battery stores 3.85 V × 3.279 Ah = 12.6 Wh · the processor sits under the steel shield can"
        : `closed · 147 × 71.5 × 7.8 mm · 6.1-inch OLED, 2532 × 1170 pixels · ${st.on ? `screen on, ${st.show === "home" ? "home screen" : st.show === "call" ? "a call" : "messages"}` : "screen off"}`);
      draw();
      return g;
    },
  });
})();
