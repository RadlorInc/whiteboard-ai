// "lightcompare cx cy k fabric=… c=… light=store|day|both" — the same piece of cloth twice: on the left under a warm
// store lamp, on the right in daylight from a window. light= turns each light on; a piece in the dark is dimmed.
// The cloth itself is the clothswatch drawing, placed twice; this recipe adds the lights and the tint they cast.
(() => {
  const FAB = "denim|silk|satin|linen|cotton|polyester|wool|cashmere|flannel|velvet|corduroy|fleece";
  const SX = 210, SY = 60, SK = 0.55;
  const free = { class: "free", "data-free": "1" };
  ISO.add({
    name: "lightcompare", title: "Store light and daylight", compare: null,
    about: "One piece of cloth shown twice: left under a warm yellow store lamp, right in daylight from a window. Under the lamp the color turns warmer and darker; in daylight it shows its true color. light=store lights only the lamp side, day only the window side, both lights both. Named parts: lamp, window, store, day.",
    line: `lightcompare cx cy k=0.2..1.5 fabric=${FAB} c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red light=store|day|both`,
    demo: { line: "lightcompare 480 275 0.78 fabric=cotton c=teal", script: [{ set: { light: "store" }, hold: "settle" }, { set: { light: "day" }, hold: "settle" }, { set: { light: "both" }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT; P.seed(83);
      const g = P.base(parent, cx, cy, k);
      // the window, top right
      const win = P.el("g", { "data-name": "window" }, g), wx = SX, wy = -190;
      const wl = P.layer(win);
      wl.stroke(wx - 92, wy, wx + 92, wy, 120, "#bcd4e4"); for (let i = 0; i < 6; i++) wl.stroke(wx - 90, wy + P.rr(-50, 50), wx + 90, wy + P.rr(-50, 50), P.rr(10, 22), P.pick(["#d6e6f0", "#a9c6da"]), 0.7, P.rr(-8, 8));
      wl.done();
      const fr = P.layer(win); fr.stroke(wx - 100, wy - 64, wx + 100, wy - 64, 16, "#b08a5e"); fr.stroke(wx - 100, wy + 64, wx + 100, wy + 64, 16, "#b08a5e"); fr.stroke(wx - 100, wy - 64, wx - 100, wy + 64, 16, "#b08a5e"); fr.stroke(wx + 100, wy - 64, wx + 100, wy + 64, 16, "#b08a5e"); fr.stroke(wx, wy - 64, wx, wy + 64, 9, "#a07a50"); fr.stroke(wx - 100, wy, wx + 100, wy, 9, "#a07a50"); fr.stroke(wx - 116, wy + 76, wx + 116, wy + 76, 14, "#9a7550"); fr.done();
      P.ink(`M${wx - 108} ${wy - 72}H${wx + 108}V${wy + 70}H${wx - 108}Z M${wx - 92} ${wy - 56}H${wx + 92}V${wy + 56}H${wx - 92}Z M${wx} ${wy - 56}V${wy + 56} M${wx - 92} ${wy}H${wx + 92} M${wx - 120} ${wy + 70}H${wx + 120}V${wy + 84}H${wx - 120}Z`, win, 3);
      // the lamp, top left, hanging from a cord
      const lamp = P.el("g", { "data-name": "lamp" }, g), lx = -SX, ly = -190;
      P.el("path", { d: `M${lx} -262V${ly - 34}`, stroke: P.INK, "stroke-width": 3, fill: "none", ...free }, lamp);
      const shade = `M${lx - 22} ${ly - 36}L${lx + 22} ${ly - 36}L${lx + 62} ${ly + 8}L${lx - 62} ${ly + 8}Z`;
      const ll = P.layer(lamp, P.clip(lamp, shade)); ll.stroke(lx - 70, ly - 12, lx + 70, ly - 12, 60, "#1f6f6a"); ll.stroke(lx - 40, ly - 24, lx + 10, ly + 4, 10, P.lt("#1f6f6a", 0.3), 0.6); ll.done();
      P.ink(shade, lamp, 3.2);
      const bulbOff = P.el("circle", { cx: lx, cy: ly + 14, r: 15, fill: "#d8d0bd", stroke: P.INK, "stroke-width": 2.6 }, lamp);
      const bulbOn = P.el("circle", { cx: lx, cy: ly + 14, r: 15, fill: "#ffd36b", stroke: P.INK, "stroke-width": 2.6, opacity: 0 }, lamp);
      // the light each one casts
      const cone = P.el("path", { d: `M${lx - 50} ${ly + 8}L${lx + 50} ${ly + 8}L${lx + 150} ${SY + 130}L${lx - 150} ${SY + 130}Z`, fill: "#f6c35a", opacity: 0 }, g);
      const beams = P.el("path", { d: [-70, 0, 70].map((d) => `M${wx - 40 + d * 0.9} ${wy + 84}L${wx - 10 + d * 0.9} ${wy + 84}L${SX + 10 + d * 1.25} ${SY + 130}L${SX - 34 + d * 1.25} ${SY + 130}Z`).join(""), fill: "#fbfdff", opacity: 0 }, g);
      // the cloth, twice, each with the tint its light gives it laid over the paint
      const fabric = P.FABRICS.includes(o.fabric) ? o.fabric : "cotton";
      const piece = (x, name, tint) => {
        const at = P.el("g", { "data-name": name }, g), sw = ISO.all.clothswatch.make([x, SY, SK], { fabric, c: o.c, pin: "1" }, "", at);
        const S = sw.firstChild, id = S.querySelector("clipPath").id, outline = [...S.children].find((e) => e.tagName === "path");
        const lit = P.el("rect", { x: -200, y: -230, width: 400, height: 460, fill: tint, opacity: 0, "clip-path": `url(#${id})` });
        const dark = P.el("rect", { x: -200, y: -230, width: 400, height: 460, fill: "#2b2a33", opacity: 0, "clip-path": `url(#${id})` });
        S.insertBefore(lit, outline); S.insertBefore(dark, outline);
        return { lit, dark };
      };
      const store = piece(-SX, "store", "#f2a23a"), day = piece(SX, "day", "#f4f8ff");
      g.insertAdjacentHTML("beforeend", ISO.word([-SX, SY + 175], "Store lamp", "#444", { size: 22 }) + ISO.word([SX, SY + 175], "Daylight", "#444", { size: 22 }));
      const goal = { store: 1, day: 1 }, now = { store: 1, day: 1 };
      const aim = (light) => { goal.store = light === "day" ? 0 : 1; goal.day = light === "store" ? 0 : 1; };
      const paint = () => {
        store.lit.setAttribute("opacity", (now.store * 0.34).toFixed(3)); store.dark.setAttribute("opacity", ((1 - now.store) * 0.42).toFixed(3));
        day.lit.setAttribute("opacity", (now.day * 0.1).toFixed(3)); day.dark.setAttribute("opacity", ((1 - now.day) * 0.42).toFixed(3));
        cone.setAttribute("opacity", (now.store * 0.3).toFixed(3)); bulbOn.setAttribute("opacity", now.store.toFixed(3));
        beams.setAttribute("opacity", (now.day * 0.55).toFixed(3));
      };
      aim(o.light || "both"); Object.assign(now, goal); paint();
      g.set = (p) => { if (p.light !== undefined) aim(p.light); };
      g.update = (dt) => {
        let on = false;
        for (const q in goal) { now[q] = ISO.still() ? goal[q] : ISO.follow(now[q], goal[q], dt, 0.25); if (Math.abs(now[q] - goal[q]) < 0.003) now[q] = goal[q]; else on = true; }
        paint(); return on;
      };
      g.readout = () => `${fabric}: store lamp ${goal.store ? "on" : "off"}, daylight ${goal.day ? "on" : "off"}`;
      return g;
    },
  });
})();
