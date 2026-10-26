// "receiveradapter cx cy k drip=0|1 fall=0..30 lab=0 lit=adapter|drops" — a PART (PARTS.md, batch 5): the distill
// scene's bent receiver adapter, a 1 cm glass tube about 10 cm long, origin its top end, where it hangs on a condenser's
// lower end (at= the condenser's end, or a stillhead's `arm`). A frosted ground-glass socket over the condenser's cone,
// 4 cm on down the same 14° slope toward −x (flip=1: +x), a smooth bend and 5.5 cm straight down to a drip tip drawn
// in and cut at a slant. drip=1: distillate gathers at the tip into a drop that grows, lets go and falls fall cm (into a
// receiver flask's neck below), about one drop a second, shown 4× slower in the fall. set({ drip }). Built in mm.
(() => {
  const K = window.K, G = window.G, g9 = 9810;   // mm/s²
  const SLOPE = (14 * Math.PI) / 180, DIR = [-Math.cos(SLOPE), 0, -Math.sin(SLOPE)], R = 5, SOCK = 16, RUN = 40, DOWN = 55;
  const along = (s) => [DIR[0] * s, 0, DIR[2] * s];
  const BEND = along(RUN), FOOT = [BEND[0], 0, BEND[2] - DOWN], TIP = [FOOT[0], 0, FOOT[2] - 8];

  ISO.add({
    name: "receiveradapter", title: "Receiver adapter (part)", compare: null,
    about: "A bent glass receiver adapter about 10 cm long that hangs on a condenser's lower end and leads the distillate down into a receiver flask; drip=1 drops gather at its tip and fall. anchors: tip drop",
    line: "receiveradapter cx cy k drip=0|1 fall=0..30 lab=0 lit=adapter|drops",
    demo: { line: "receiveradapter 560 170 30 fall=4 lab=1", script: [{ set: {}, hold: 1 }, { set: { drip: 1, lit: "drops" }, hold: 4 }, { set: { lit: "adapter" }, hold: 1.5 }, { set: { drip: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 200, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const fall = ISO.clamp(ISO.num(o, "fall", 4), 0, 30) * 10, st = { drip: o.drip === "1", grow: 0, drops: [], lit: o.lit || "" };
      // socket (frosted, a bead at its mouth), the tube on down the slope, the bend, straight down, the drawn-in tip
      const path = LAB.bend([along(SOCK - 1), BEND, FOOT], 14);
      const tip = [0, 1, 2, 3].map((i) => LAB.tube(Pm, [[FOOT[0], 0, FOOT[2] - i * 2 + 0.3], [FOOT[0], 0, FOOT[2] - (i + 1) * 2]], R - 0.7 * (i + 1))).join("");
      const sock = LAB.tube(Pm, [[0, 0, 0], along(SOCK)], R + 2, { fill: "#f2f5f7" }) + LAB.tube(Pm, [along(-0.2), along(1.6)], R + 2.6) +
        `<path d="${[4, 7, 10, 13].map((s) => { const c = along(s), n = [Math.sin(SLOPE) * (R + 2), 0, Math.cos(SLOPE) * (R + 2)]; return K.segment([c[0] - n[0], 0, c[2] - n[2]], [c[0] + n[0], 0, c[2] + n[2]], Pm); }).join("")}" stroke="#b9c7d1" stroke-width="0.6" data-free=""/>` +
        LAB.tube(Pm, [along(SOCK - 0.4), along(SOCK + 1.2)], R + 1.2);
      // the slanted cut at the tip: a small ellipse of the glass's end
      const cut = (() => { const c = K.iso(TIP, Pm), s = K.screenRise(1, Pm); return `<ellipse cx="${(c[0]).toFixed(2)}" cy="${c[1].toFixed(2)}" rx="${(s * 1.9).toFixed(2)}" ry="${(s * 0.9).toFixed(2)}" fill="#e8f2f8" stroke="${LAB.GLASS}" stroke-width="0.6" transform="rotate(-18 ${c[0].toFixed(2)} ${c[1].toFixed(2)})"/>`; })();
      g.innerHTML = `<g data-name="adapter">${LAB.tube(Pm, path, R, { inner: "#ffffff" })}${tip}${cut}${sock}</g><g data-name="drops" data-part="drops"></g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = ISO.word(K.iso([FOOT[0], 0, FOOT[2] + 20], Pm), "adapter", "#445", { size: 14, anchor: "end", dy: 0 }).replace('x="', 'dx="-10" x="');
      const cm = (p) => p.map((v) => +(v / 10).toFixed(3));
      g.anchors = { tip: cm(TIP), drop: cm([TIP[0], 0, TIP[2] - fall]) };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const key = `${st.grow.toFixed(2)} ${st.drops.map((d) => d.z.toFixed(1)).join()}`;
        w.rebuild(el.drops, key, () => {
          const out = [];
          if (st.grow > 0.05) out.push(LAB.drop(Pm, [TIP[0], 0, TIP[2] - 1.6 * st.grow], 1.8 * Math.sqrt(st.grow), "clear"));
          for (const d of st.drops) out.push(LAB.drop(Pm, [TIP[0], 0, d.z], 1.8, "clear"));
          return out.join("");
        });
        B11.light(w, g, st.lit);
      };
      g.set = (p) => { if (p.drip !== undefined) st.drip = String(p.drip) === "1"; if (p.lit !== undefined) st.lit = p.lit; draw(); };
      g.update = (dt) => {
        if (ISO.still() || dt > 1) { st.drops = []; st.grow = st.drip ? 0.6 : 0; draw(); return false; }
        // a drop gathers at the tip for about a second, lets go and falls under gravity (shown 4× slower)
        if (st.drip) { st.grow += dt / 1.1; if (st.grow >= 1) { st.grow = 0; st.drops.push({ z: TIP[2] - 1.6, v: 0 }); } }
        else st.grow = Math.max(0, st.grow - dt / 0.6);
        const h = dt * B11.SLOW;
        st.drops = st.drops.filter((d) => { d.v += g9 * h; d.z -= d.v * h; return d.z > TIP[2] - 1.6 - fall; });
        draw();
        return st.drip || st.grow > 0 || st.drops.length > 0;
      };
      g.readout = () => `receiver adapter · 1 cm glass, 14° slope then straight down · ${st.drip ? `the condensed liquid drips from its tip about once a second and falls ${fall / 10} cm into the receiver` : "dry"}`;
      draw();
      return g;
    },
  });
})();
