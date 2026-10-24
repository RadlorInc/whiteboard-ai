// "ram cx cy width seat=0..1 run=0|1 lab=1 lit=stick|chips|contacts|slot|latch" — a memory stick in its motherboard slot.
// A strip of motherboard carries two black DIMM slots, each with its contact groove and a latch at either end; the
// near one takes the stick: a green board with eight black memory chips, a small settings chip, a row of resistors and
// 144 gold contacts a side along its bottom edge, split by the off-centre key notch so it only fits one way round, with
// a notch in each end for the latches. seat (0 above the slot … 1 pressed in) lowers it in: the latches swing up and
// hook its end notches. run=1 lights the chips as data moves. set({ seat, run, lit }). 1 unit = 1 mm (a 133 mm DIMM).
(() => {
  const K = window.K, T = window.TECH;
  const HL = 66.7, PH = 31.2, TH = 0.64, ZIN = 3, LIFT = 26, NOTCH = -9.5;   // half length, height, half thickness
  const SL = { x: 72, y: 3.6, z: 8, g: 0.9 }, Y2 = -16;                       // slot half length, half width, height
  const LA = { x: 70, w: 4.5, h: 15 };                                          // latch pivot x, width, height
  // the board's outline in x–z (concave: key notch in the bottom edge, a latch notch in each end)
  const OUT = [[-HL, 0], [NOTCH - 0.9, 0], [NOTCH - 0.9, 3.2], [NOTCH + 0.9, 3.2], [NOTCH + 0.9, 0], [HL, 0], [HL, 13], [HL - 2, 13], [HL - 2, 16.5], [HL, 16.5], [HL, PH], [-HL, PH], [-HL, 16.5], [-HL + 2, 16.5], [-HL + 2, 13], [-HL, 13]];

  ISO.add({
    name: "ram", title: "Memory stick (RAM)", compare: "ram 480 270 460",
    about: "A memory stick: a green board with black memory chips and gold contacts, its key notch lined up with the slot so it fits one way; pressed in, the latches snap up and hold it.",
    line: "ram cx cy width seat=0..1 run=0|1 lab=1 lit=stick|chips|contacts|slot|latch",
    demo: { line: "ram 480 270 460 seat=0", script: [{ set: { seat: 1 }, hold: "settle" }, { set: { run: 1 }, hold: 3 }] },
    make([cx, cy, size = 460], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.9;
      const BP = { x: -86, y: -26, w: 172, d: 40, r: 2 };
      const { P, g } = ISO.frame([...K.boxCorners(BP, -1.6, 0), [-HL, 0, PH + LIFT + ZIN], [HL, 0, PH + LIFT + ZIN]], cx, cy, W, H, { azimuth: 68, elevation: 24, pad: size * 0.03 }, parent);
      const box = (x, y, z, tone, c, lit) => T.box(P, x, y, z, tone, c, lit), out = [];
      // ── the motherboard strip: halo, board, printed traces running to the slots (free printed lines)
      out.push(`<path class="iso-halo" d="${K.haloOf(BP, -1.6, 1.6, P)}"/>`, T.slab(P, BP, -1.6, 1.6, "lo", T.C.pcbDark, 4, 0.3));
      const tr = [];
      for (let i = 0; i < 9; i++) { const x = -60 + i * 14; tr.push(K.lineOnTop([x, BP.y + 3], [x, Y2 - SL.y - 1], 0.02, P), K.lineOnTop([x + 4, Y2 + SL.y + 1], [x + 4, -SL.y - 1], 0.02, P)); }
      out.push(`<path data-free d="${tr.join("")}" fill="none" stroke="#8fbf86" stroke-width=".6"/>`);
      out.push(T.L(K.corners(BP, 5).map(([x, y]) => K.ring(x, y, 1.6, 0, P, 14)).join(""), { tone: "mid" }));
      // a slot: body in two halves round its groove (far half, floor, near half), contact rows seen in the groove
      const slotBack = (y0) => box([-SL.x, SL.x], [y0 - SL.y, y0 - SL.g], [0, SL.z], "mid", T.C.black) + box([-SL.x, SL.x], [y0 - SL.g, y0 + SL.g], [0, ZIN], "lo", T.C.black) +
        box([NOTCH - 0.7, NOTCH + 0.7], [y0 - SL.g, y0 + SL.g], [ZIN, ZIN + 3], "mid", T.C.black);
      const slotFront = (y0) => box([-SL.x, SL.x], [y0 + SL.g, y0 + SL.y], [0, SL.z], "mid", T.C.black);
      const latch = (x0, sgn, a, y0) => {
        // a latch pivots about the y axis at the slot's end: up (a = 0) its hook bears on the stick's end notch
        const at = T.frame([x0, y0, 2], [Math.cos(a) * sgn, 0, -Math.sin(a)], [0, 1, 0], [Math.sin(a) * sgn, 0, Math.cos(a)]);
        return T.obox(P, at, [0, LA.w], [-SL.y + 0.4, SL.y - 0.4], [0, LA.h], "hi", T.C.white) + T.obox(P, at, [-1.6, 0], [-SL.y + 0.4, SL.y - 0.4], [LA.h - 3.5, LA.h], "hi", T.C.white);
      };
      // the far, empty slot, whole, with its latches open
      out.push(slotBack(Y2), slotFront(Y2), latch(-LA.x, -1, 0.6, Y2), latch(LA.x, 1, 0.6, Y2));
      // the near slot's housings for the latches, then its far half
      out.push(`<g data-name="slot">${box([-SL.x - 7, -SL.x], [-SL.y, SL.y], [0, 2], "mid", T.C.black)}${box([SL.x, SL.x + 7], [-SL.y, SL.y], [0, 2], "mid", T.C.black)}${slotBack(0)}</g>`);
      // ── the stick (built once, lowered by a transform)
      const st0 = [];
      st0.push(ISO.prismY(P, OUT, -TH, TH, ["#5f8f57", "#93bb8a"], "#7fae75", "#1f4a1a"));
      // gold contacts on the near face: 2 mm pitch-ish fingers either side of the key notch, each a closed pad
      const pads = [];
      for (let x = -HL + 2; x < HL - 2; x += 1.85) { if (Math.abs(x - NOTCH) < 1.8) continue; pads.push([[x, TH + 0.02, 0.4], [x + 1.1, TH + 0.02, 0.4], [x + 1.1, TH + 0.02, 4.4], [x, TH + 0.02, 4.4]]); }
      st0.push(`<g data-name="contacts">${pads.map((p) => T.quad(P, p, "#e0bf66", "#8a6a1a", 0.35)).join("")}</g>`);
      // a row of tiny resistors above the contacts, the settings (SPD) chip, then the eight memory chips
      for (let i = 0; i < 16; i++) { const x = -HL + 8 + i * 8.1; st0.push(box([x, x + 1.6], [TH, TH + 0.5], [6.2, 7.0], "mid", T.C.paper)); }
      st0.push(box([NOTCH + 4, NOTCH + 9], [TH, TH + 0.8], [6.4, 10.4], "hi", T.C.chip));
      st0.push(`<g data-part="chips" data-name="chips"></g>`);
      // a printed label sticker across the top, with its rule lines
      const lab0 = [[-30, TH + 0.03, 25], [30, TH + 0.03, 25], [30, TH + 0.03, 29.6], [-30, TH + 0.03, 29.6]];
      st0.push(T.quad(P, lab0, "#f4f4f0", "#8a8a84", 0.5));
      st0.push(T.flat(P, [-28, TH + 0.04, 28.4], [1, 0, 0], [0, 0, -1], T.text(0, 0, "16 GB DDR5 · 5600", 2.6, "#4a5058", "start", 700)));
      out.push(`<g data-part="stick" data-name="stick">${st0.join("")}</g>`);
      out.push(slotFront(0));
      out.push(`<g data-part="latches" data-name="latch"></g>`);
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e]));
      const w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];

      const CH = Array.from({ length: 8 }, (_, i) => { const x0 = -HL + 5 + i * 16.2 + (i >= 4 ? 4 : 0) - (i >= 4 ? 4 : 0); return [x0, x0 + 11]; });
      // The chips sit on the board's face; the board is an ISO.prismY, which audit.mjs doesn't record, so it lists
      // the eight chips as loose.
      const chipsSvg = (lit) => CH.map(([x0, x1], i) => box([x0, x1], [TH, TH + 1.1], [11.5, 23], "hi", lit === i || lit === (i + 4) % 8 ? ISO.tint("#ffd28a", ["#c9762a", "#d6893a", "#e29c50", "#eeb068"], "#6b3a08") : T.C.chip)).join("");
      const st = { seat: ISO.clamp(ISO.num(o, "seat", 1), 0, 1), want: 0, run: o.run === "1", ph: 0, lit: o.lit || "" };
      st.want = st.seat;
      const latchMemo = new Map();
      const draw = () => {
        const s = st.seat, drop = ISO.smooth(0, 0.85, s), snap = ISO.smooth(0.8, 1, s);
        w.attr(el.stick, "transform", K.translateAlong(P, [0, 0, ZIN + (1 - drop) * LIFT]));
        const q = Math.round(snap * 30);
        w.rebuild(el.latches, String(q), () => latchMemo.get(q) || (latchMemo.set(q, latch(-LA.x, -1, 0.6 * (1 - q / 30), 0) + latch(LA.x, 1, 0.6 * (1 - q / 30), 0)), latchMemo.get(q)));
        const lit = st.run && s > 0.99 ? Math.floor(st.ph * 6) % 8 : -1;
        w.rebuild(el.chips, String(lit), () => chipsSvg(lit));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const z = ZIN + (1 - drop) * LIFT;
        w.rebuild(el.words, lab ? `${Math.round(drop * 10)} ${q > 15}` : "", () => !lab ? "" : [
          T.word(P, [-HL, TH, z + 18], "memory chips", { anchor: "end", dx: -10 }),
          T.word(P, [NOTCH, TH, z], s < 0.85 ? "key notch" : "", { dy: 16, color: "#1f4f8f" }),
          s < 0.85 ? T.word(P, [HL, TH, z + 2], "gold contacts", { anchor: "start", dx: 10 }) : "",
          T.word(P, [LA.x + 5, SL.y, 10], q > 15 ? "latch closed" : "latch", { anchor: "start", dx: 8 }),
          T.word(P, [0, SL.y, 0], "slot on the motherboard", { dy: 18 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.seat !== undefined) st.want = ISO.clamp(+p.seat, 0, 1);
        if (p.run !== undefined) st.run = !!+p.run;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.seat = calm ? st.want : st.seat + ISO.clamp(st.want - st.seat, -dt * 0.5, dt * 0.5);
        st.ph = (st.ph + dt) % 100;
        draw();
        return st.seat !== st.want || (st.run && st.seat > 0.99);
      };
      g.readout = () => st.seat > 0.99
        ? (st.run ? "running · 5600 million transfers a second × 8 bytes = 44.8 GB/s · each chip holds 2 GB in billions of tiny charge cells, lost when the power goes off" : "seated · both latches hook the stick's end notches; its 288 contacts touch the slot's")
        : st.seat > 0.02 ? "pressing in · the key notch lines up with the ridge in the slot" : "above the slot · the notch is off centre, so the stick only fits one way round";
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
