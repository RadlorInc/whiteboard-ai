// "usbpowermod cx cy k on=0|1 lab=0 lit=board|socket|switch|lamp|pins" — a PART (PARTS.md, batch 6): the breadboard
// USB power module of led.js, its origin the surface point under its middle. A green board 5 × 3.5 cm, its 5 cm
// across the breadboard (along y), on two black header strips whose pins go down into both pairs of power rails
// (front and back: − 2.032 cm and + 2.286 cm out from the middle, as on the breadboard part),
// a USB socket on the right-hand edge (+x, its mouth and tongue showing), a black barrel jack, the latching push switch,
// a small green lamp, two voltage regulators and two capacitors, and a yellow jumper on each side choosing 5 V or
// 3.3 V. 5 × 3.5 × 1.5 cm. on=1: the switch latches down and the lamp lights. set({ on }). Built in mm (ISO.mm);
// anchors plus minus (the front (+y) strip's two pins, at the surface) in cm.
(() => {
  const K = window.K;
  const HX = 25, HY = 17.5, PZ = [2.5, 4.1], RAILS = [20.32, 22.86], YP = -1;
  const LAMP = { off: ISO.tint("#cfe8cf", ["#5f8f60", "#6f9f70", "#82b083", "#97c098"], "#1f4a20"), on: ISO.tint("#eaffe8", ["#6ee06a", "#86ea80", "#a2f29c", "#c0f8ba"], "#1f6a20") };
  ISO.add({
    name: "usbpowermod", title: "Breadboard USB power module (part)", compare: null,
    about: "A breadboard power module: a small green board with a USB socket, a push switch and a lamp, whose pins go into the breadboard's two power rails to feed them 5 V. anchors: plus minus",
    line: "usbpowermod cx cy k on=0|1 lab=0 lit=board|socket|switch|lamp|pins",
    demo: { line: "usbpowermod 480 330 55 lab=1", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { lit: "socket" }, hold: 1.2 }, { set: { lit: "pins" }, hold: 1.2 }, { set: { on: 0, lit: "switch" }, hold: "settle" }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = window.B35.cam(P, { div: 10, az: 90 }), lab = o.lab === "1";
      const box = (x, y, z, c, tone = "mid") => T.box(Pm, x, y, z, tone, c), zt = PZ[1], kp = K.cameraOf(Pm).k;
      const text = (x, y, s, size) => T.flat(Pm, [x, y, zt + 0.02], [1, 0, 0], [0, 1, 0], T.text(0, 0, s, size, "#f4f6f2"));
      // built long along x; turned a quarter round (build +x → room −y) so its 5 cm spans the breadboard across both
      // rail pairs, the USB socket toward +x
      const turn = (p) => [p[1], -p[0], p[2]], PINS = [-1, 1].flatMap((sx) => RAILS.map((x) => sx * x));
      // the board, its four corner holes and printing
      const board = [T.slab(Pm, { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1.5 }, PZ[0], PZ[1] - PZ[0], "mid", T.C.pcbDark, 4)];
      for (const [x, y] of [[-22, -14.5], [22, -14.5], [-22, 14.5], [22, 14.5]]) board.push(`<path d="${K.ring(x, y, 1.4, zt + 0.02, Pm, 14)}" fill="#e0bf66" stroke="#6b4f0e" stroke-width=".3"/>`);
      // regulators (black with their steel tab), capacitors, the two yellow jumpers and their pin rows
      board.push(box([-24, -12], [-16, -4], [zt, zt + 11], T.C.black));
      for (const y0 of [-12, -3]) board.push(box([2, 6], [y0, y0 + 7], [zt, zt + 0.6], T.C.steel), box([0, 8], [y0, y0 + 7], [zt + 0.6, zt + 2.2], T.C.chip));
      for (const [x, y] of [[-8, -12], [12, 8]]) board.push(T.cyl(Pm, x, y, 2.5, zt, 5, "mid", T.C.dark, 18) + `<path d="${K.ring(x, y, 1.5, zt + 5.02, Pm, 14)}" fill="none" stroke="#9aa0a8" stroke-width=".4"/>`);
      for (const y of [-8.7, 6.7]) board.push(box([15, 22.6], [y, y + 2.2], [zt, zt + 2.4], T.C.black), box([15.2, 20.2], [y + 0.1, y + 2.1], [zt + 2.4, zt + 6], T.C.amber));
      board.push(text(18.8, -3, "5V 3V3", 1.8), text(-20, 3, "MB102", 2.4));
      // the barrel jack at the back left, the USB socket at the front left with its mouth and tongue on the front
      const socket = box([-20, -8], [3, HY + 1.2], [zt, zt + 7], T.C.steel) +
        T.quad(Pm, [[-19, HY + 1.22, zt + 0.8], [-9, HY + 1.22, zt + 0.8], [-9, HY + 1.22, zt + 6.2], [-19, HY + 1.22, zt + 6.2]], "#202327", "#0b0c0e", 0.5) +
        T.quad(Pm, [[-18, HY + 1.24, zt + 3.1], [-10, HY + 1.24, zt + 3.1], [-10, HY + 1.24, zt + 4.2], [-18, HY + 1.24, zt + 4.2]], "#f4f2ec", "#77746a", 0.4);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 1, y: -HY - 1, w: 2 * HX + 2, d: 2 * HY + 3, r: 2 }, 0, 15, Pm)}"/>` +
        `<g data-name="pins">${[-1, 1].map((sx) => box([sx > 0 ? RAILS[0] - 1.6 : -RAILS[1] - 1.6, sx > 0 ? RAILS[1] + 1.6 : -RAILS[0] + 1.6], [YP - 1.3, YP + 1.3], [0, PZ[0]], T.C.black)).join("")}</g><g data-name="board">${board.join("")}</g>` +
        `<g data-name="pins">${T.D(PINS.map((x) => K.iso([x, YP, zt + 0.02], Pm)), { size: 0.5, tone: "mid" })}</g>` +
        `<g data-name="socket">${socket}</g><g data-name="switch">${box([-5, 2], [8, 15], [zt, zt + 3.6], T.C.dark)}<g data-part="button"></g></g><g data-name="lamp"></g><g data-part="glow"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), lampEl = g.querySelector('[data-name="lamp"]'), w = ISO.writer();
      const st = { on: o.on === "1", amt: o.on === "1" ? 1 : 0, lit: o.lit || "" };
      // the switch's round cap: 3.4 mm proud when off, latched down to 1.6 mm when on
      const button = (d) => T.cyl(Pm, -1.5, 11.5, 2.2, zt + 3.6, 3.4 - 1.8 * d, "hi", T.C.steel, 18);
      const lamp = (on) => box([3.8, 6.2], [13, 14.6], [zt, zt + 0.8], on ? LAMP.on : LAMP.off, "hi") + text(5, 16.6, "PWR", 1.6);
      const glow = (a) => { if (a < 0.03) return ""; const p = K.iso([5, 13.8, zt + 0.8], Pm); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(kp * 4).toFixed(1)}" fill="#7dff74" fill-opacity="${(0.45 * a).toFixed(2)}"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(kp * 1.6).toFixed(1)}" fill="#efffea" fill-opacity="${(0.8 * a).toFixed(2)}"/>`; };
      const draw = () => {
        const a = Math.round(st.amt * 20) / 20;
        w.rebuild(el.button, String(a), () => button(a));
        w.rebuild(lampEl, String(a > 0.5), () => lamp(a > 0.5));
        w.rebuild(el.glow, String(a), () => glow(a));
        B.light(w, g, st.lit);
      };
      if (lab) el.words.innerHTML = T.word(Pm, [-14, HY + 1, zt + 7], "USB in", { anchor: "end", dx: -6, dy: -4 }) + T.word(Pm, [-1.5, 11.5, zt + 7], "switch", { dy: -12 }) + T.word(Pm, [6, 14, zt], "lamp", { anchor: "start", dx: 8, dy: 10 }) + T.word(Pm, [-RAILS[1], YP, 0], "pins into the rails", { anchor: "start", dx: 14, dy: 14 });
      g.anchors = { plus: turn([-RAILS[1] / 10, YP / 10, 0]), minus: turn([-RAILS[0] / 10, YP / 10, 0]) };
      g.set = (p) => {
        if (p.on !== undefined) st.on = String(p.on) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the cap latches in about a fifth of a second; the lamp follows the current at once
      g.update = (dt) => {
        const want = st.on ? 1 : 0;
        st.amt = ISO.follow(st.amt, want, dt, 0.06, ISO.still()); if (Math.abs(st.amt - want) < 0.01) st.amt = want;
        draw();
        return st.amt !== want;
      };
      g.readout = () => (st.on ? "power module on · 5 V from the USB socket onto both power rails (up to about 0.7 A) · lamp lit" : "breadboard power module · off · switch out, rails dead");
      draw();
      return g;
    },
  });
})();
