// "dimmslot cx cy k seat=0..1 run=0|1 stick=0|1 lab=0 lit=board|slot|latch|stick|chips|contacts" — a PART (PARTS.md,
// batch 6): a strip of motherboard 17.2 × 4 cm with two black DIMM slots, from ram.js, lying flat, origin the middle of
// the strip's underside. Each slot has its contact groove, the key ridge and a white latch at each end; the near slot
// carries its memory stick (stick=0 leaves it empty), which moves with it: seat 0 holds the stick 2.6 cm above the
// slot, 1 pressed home: it lowers in and in the last fifth both latches swing up and hook its end notches. run=1
// (seated) lights the chips as data moves. set({ seat, run }). anchors: near far
(() => {
  const K = window.K, T = window.TECH;
  const D = B36.DIMM, ZIN = 3, LIFT = 26;
  const SL = { x: 72, y: 3.6, z: 8, g: 0.9 }, Y2 = -16, LA = { x: 70, w: 4.5, h: 15 }, BP = { x: -86, y: -26, w: 172, d: 40, r: 2 };
  ISO.add({
    name: "dimmslot", title: "Memory slots (part)", compare: null,
    about: "A strip of motherboard with two black memory (DIMM) slots, a latch at each end; its stick lowers in (seat 0..1) and the latches swing up and hook it; run=1 lights the chips. anchors: near far",
    line: "dimmslot cx cy k seat=0..1 run=0|1 stick=0|1 lab=0 lit=board|slot|latch|stick|chips|contacts",
    demo: { line: "dimmslot 480 330 42 seat=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { seat: 1, lit: "latch" }, hold: "settle" }, { set: { run: 1, lit: "chips" }, hold: 2.4 }, { set: { run: 0, seat: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", has = o.stick !== "0";
      // 1 unit = 1 mm, world origin moved so the strip's underside middle (0, -6, -1.6) lands on the part's origin
      const Q = B36.cam(P, 0.1, [0, 0.6, 0.16]);
      const box = (x, y, z, tone, c) => T.box(Q, x, y, z, tone, c), out = [];
      out.push(`<path class="iso-halo" d="${K.haloOf(BP, -1.6, 1.6, Q)}"/>`, `<g data-name="board">${T.slab(Q, BP, -1.6, 1.6, "lo", T.C.pcbDark, 4, 0.3)}`);
      const tr = [];
      for (let i = 0; i < 9; i++) { const x = -60 + i * 14; tr.push(K.lineOnTop([x, BP.y + 3], [x, Y2 - SL.y - 1], 0.02, Q), K.lineOnTop([x + 4, Y2 + SL.y + 1], [x + 4, -SL.y - 1], 0.02, Q)); }
      out.push(`<path data-free d="${tr.join("")}" fill="none" stroke="#8fbf86" stroke-width=".6"/>`);
      out.push(T.L(K.corners(BP, 5).map(([x, y]) => K.ring(x, y, 1.6, 0, Q, 14)).join(""), { tone: "mid" }), "</g>");
      const slotBack = (y0) => box([-SL.x, SL.x], [y0 - SL.y, y0 - SL.g], [0, SL.z], "mid", T.C.black) + box([-SL.x, SL.x], [y0 - SL.g, y0 + SL.g], [0, ZIN], "lo", T.C.black) +
        box([D.NOTCH - 0.7, D.NOTCH + 0.7], [y0 - SL.g, y0 + SL.g], [ZIN, ZIN + 3], "mid", T.C.black);
      const slotFront = (y0) => box([-SL.x, SL.x], [y0 + SL.g, y0 + SL.y], [0, SL.z], "mid", T.C.black);
      const latch = (x0, sgn, a, y0) => {
        const at = T.frame([x0, y0, 2], [Math.cos(a) * sgn, 0, -Math.sin(a)], [0, 1, 0], [Math.sin(a) * sgn, 0, Math.cos(a)]);
        return T.obox(Q, at, [0, LA.w], [-SL.y + 0.4, SL.y - 0.4], [0, LA.h], "hi", T.C.white) + T.obox(Q, at, [-1.6, 0], [-SL.y + 0.4, SL.y - 0.4], [LA.h - 3.5, LA.h], "hi", T.C.white);
      };
      const housings = (y0) => box([-SL.x - 7, -SL.x], [y0 - SL.y, y0 + SL.y], [0, 2], "mid", T.C.black) + box([SL.x, SL.x + 7], [y0 - SL.y, y0 + SL.y], [0, 2], "mid", T.C.black);
      // the far, empty slot whole with its latches open; then the near slot's housings and far half
      out.push(`<g data-name="slot">${housings(Y2)}${slotBack(Y2)}${slotFront(Y2)}</g><g data-name="latch">${latch(-LA.x, -1, 0.6, Y2)}${latch(LA.x, 1, 0.6, Y2)}</g>`);
      out.push(`<g data-name="slot">${housings(0)}${slotBack(0)}</g>`);
      out.push(has ? `<g data-part="stick" data-name="stick">${B36.stick(Q)}</g>` : "");
      out.push(`<g data-name="slot">${slotFront(0)}</g><g data-part="latches" data-name="latch"></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      g.anchors = { near: [0, 0.6, 0.16 + ZIN / 10], far: [0, 0.6 + Y2 / 10, 0.16 + ZIN / 10] };
      const el = B36.parts(g), w = ISO.writer();
      const st = { seat: has ? B36.num(o, "seat", 1, 0, 1) : 0, want: 0, run: o.run === "1", ph: 0, lit: o.lit || "" };
      st.want = st.seat;
      const latchMemo = new Map();
      const draw = () => {
        const s = st.seat, drop = ISO.smooth(0, 0.85, s), snap = has ? ISO.smooth(0.8, 1, s) : 0;
        if (has) w.attr(el.stick, "transform", K.translateAlong(Q, [0, 0, ZIN + (1 - drop) * LIFT]));
        const q = Math.round(snap * 30);
        w.rebuild(el.latches, String(q), () => latchMemo.get(q) || (latchMemo.set(q, latch(-LA.x, -1, 0.6 * (1 - q / 30), 0) + latch(LA.x, 1, 0.6 * (1 - q / 30), 0)), latchMemo.get(q)));
        const lit = has && st.run && s > 0.99 ? Math.floor(st.ph * 6) % 8 : -1;
        if (has) w.rebuild(el.chips, String(lit), () => B36.chips(Q, lit));
        B36.light(w, g, st.lit);
        const z = ZIN + (1 - drop) * LIFT;
        w.rebuild(el.words, lab ? `${Math.round(drop * 10)} ${q > 15}` : "", () => !lab ? "" : [
          has ? T.word(Q, [-D.HL, D.TH, z + 18], "memory stick", { anchor: "end", dx: -10 }) : "",
          has && s < 0.85 ? T.word(Q, [D.NOTCH, D.TH, z], "key notch", { dy: 16, color: "#1f4f8f" }) : "",
          T.word(Q, [LA.x + 5, SL.y, 10], q > 15 ? "latch closed" : "latch", { anchor: "start", dx: 8 }),
          T.word(Q, [0, SL.y, 0], "slots on the motherboard", { dy: 18 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.seat !== undefined && has) st.want = ISO.clamp(+p.seat, 0, 1);
        if (p.run !== undefined) st.run = String(p.run) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.seat = calm ? st.want : st.seat + ISO.clamp(st.want - st.seat, -dt * 0.5, dt * 0.5);
        st.ph = (st.ph + dt) % 100;
        draw();
        return st.seat !== st.want || (st.run && st.seat > 0.99);
      };
      g.readout = () => !has ? "two empty memory slots, latches open" : st.seat > 0.99
        ? (st.run ? "running · 5600 million transfers a second × 8 bytes = 44.8 GB/s" : "seated · both latches hook the stick's end notches; its 288 contacts touch the slot's")
        : st.seat > 0.02 ? "pressing in · the key notch lines up with the ridge in the slot" : "above the slot · the notch is off centre, so the stick only fits one way round";
      draw();
      return g;
    },
  });
})();
