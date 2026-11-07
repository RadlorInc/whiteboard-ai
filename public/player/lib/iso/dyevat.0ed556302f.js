// "dyevat cx cy k kind=indigo|plant item=cloth|skein dip=0..1 air=0..1 dyed=0|1 tie=0|1|2 c=rust|mustard|olive" — a
// wooden dye tub under a frame; a pole on two ropes lowers cloth (or a skein of thread) into the bath and lifts it out.
// indigo: the bath is yellow-green with a dark blue froth; cloth comes out green-yellow and turns blue as air rises.
// plant: a red, yellow or olive plant-dye bath with a bowl of leaves and roots and a mordant jar beside it; wet cloth
// is darker and dries lighter. tie=1 the cloth is bound with cord, so bands under the cord stay white; tie=2 untied.
(() => {
  const SURF = 30, L = 285, CW = 85, BANDS = [80, 160, 240];
  const PLANT = { rust: ["#8e3324", "#b85a40"], mustard: ["#b08a1c", "#d4ad3e"], olive: ["#5f6526", "#8a8f45"] };
  const WHITE = "#f1ede2", GY = "#a9b748", BLUE = "#2b4c8a";
  const fill = (P, par, d, [x0, x1, y0, y1], col, o = {}) => {
    const id = P.clip(par, d), a = P.layer(par, id);
    P.el("path", { d, fill: col }, a.g);
    const n = Math.min(44, Math.max(5, Math.round(((x1 - x0) * (y1 - y0)) / 900)));
    for (let i = 0; i < n; i++) { const x = P.rr(x0, x1), y = P.rr(y0, y1), t = (o.ang || 0) + P.rr(-0.4, 0.4), L_ = P.rr(16, 46);
      a.stroke(x, y, x + Math.cos(t) * L_, y + Math.sin(t) * L_, P.rr(6, 14), P.pick([P.dk(col, 0.12), P.lt(col, 0.16), col]), 0.75, P.rr(-5, 5)); }
    a.done(); if (o.ink !== false) P.ink(d, par, o.iw || 2.8);
  };
  ISO.add({
    name: "dyevat", title: "Dye tub", compare: null,
    about: "A wooden dye tub under a frame; a pole on two ropes lowers cloth or a skein of thread into the bath (dip=1) and lifts it out (dip=0). kind=indigo: a yellow-green bath with a dark blue froth; the cloth comes out green-yellow and turns blue in the air (air=0..1). kind=plant: a plant-dye bath (c=rust|mustard|olive) with a bowl of leaves and roots and a mordant jar with a blank label; wet cloth dries lighter as air rises. dyed=0 white undyed cloth (it dyes itself once dipped). tie=1 cloth bound with cord: bands under the cord stay white; tie=2 the cord is off and the white bands show. Parts: frame, pole, tub, bath, cloth, cord, bowl, jar.",
    line: "dyevat cx cy k=0.2..1.5 kind=indigo|plant item=cloth|skein dip=0..1 air=0..1 dyed=0|1 tie=0|1|2 c=rust|mustard|olive",
    demo: { line: "dyevat 480 280 0.5 kind=indigo dip=0 dyed=0", script: [{ set: { dip: 0 }, hold: 1 }, { set: { dip: 1 }, hold: "settle" }, { set: { dip: 0 }, hold: "settle" }, { set: { air: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, plant = o.kind === "plant", skein = o.item === "skein", tie = skein ? 0 : +o.tie === 1 ? 1 : +o.tie === 2 ? 2 : 0;
      const PC = PLANT[Object.hasOwn(PLANT, o.c) ? o.c : "rust"]; P.seed(plant ? 151 : 149);
      const g = P.base(parent, cx, cy, k), free = { class: "free", "data-free": "1" }, WOOD = "#8f6440";
      // the frame: two posts and a crossbar, ropes down to the pole
      const fr = P.el("g", { "data-name": "frame" }, g), fl = P.layer(fr);
      fl.stroke(-250, -340, -250, 214, 22, WOOD); fl.stroke(250, -340, 250, 214, 22, WOOD); fl.stroke(-276, -334, 276, -334, 24, P.dk(WOOD, 0.1));
      fl.stroke(-254, -330, -254, 210, 5, P.lt(WOOD, 0.3), 0.6); fl.stroke(246, -330, 246, 210, 5, P.lt(WOOD, 0.3), 0.6); fl.done();
      P.ink("M-261 -346 H261 V-322 H-261 Z", fr, 2.2, false);
      const ropes = P.el("path", { fill: "none", stroke: "#b89a68", "stroke-width": 4, ...free }, g);
      // plant kind: a bowl of leaves and roots on the left, a mordant jar with a blank label on the right
      if (plant) {
        const bw = P.el("g", { "data-name": "bowl", transform: "translate(118 -76) scale(1.4)" }, g), bl = P.layer(bw);
        for (let i = 0; i < 9; i++) { const x = P.rr(-370, -290), y = P.rr(150, 172), a = P.rr(-0.6, 0.6); bl.stroke(x - 16, y, x + 16, y + 30 * a, 10, P.pick(["#5d8a45", "#4f7a3a", "#6b9a50"]), 1, 4); }
        for (let i = 0; i < 6; i++) { const x = P.rr(-360, -300), y = P.rr(150, 166); bl.stroke(x - 22, y, x + 22, y + P.rr(-8, 8), 6, P.pick([PC[0], "#9a5a3a"]), 1, P.rr(-6, 6)); }
        bl.done(); fill(P, bw, "M-392 166 H-268 Q-276 214 -330 216 Q-384 214 -392 166 Z", [-392, -268, 164, 218], "#c7a77a", { iw: 2.6 });
        const jr = P.el("g", { "data-name": "jar", transform: "translate(-122 -66) scale(1.4)" }, g), JD = "M300 120 H354 V132 Q372 140 372 160 V206 Q372 216 360 216 H294 Q282 216 282 206 V160 Q282 140 300 132 Z";
        { const id = P.clip(jr, JD), a = P.layer(jr, id); P.el("path", { d: JD, fill: "#d6e4e6", opacity: 0.8 }, a.g); a.stroke(282, 196, 372, 196, 40, "#f4f2ee", 1); a.stroke(292, 150, 292, 206, 6, "#ffffff", 0.7); a.done(); }
        P.ink(JD, jr, 2.4); P.el("path", { d: "M296 108 H358 V122 H296 Z", fill: "#8a6a4a", stroke: P.INK, "stroke-width": 2, "stroke-linejoin": "round" }, jr);
        P.el("path", { "data-name": "label", d: "M298 152 H356 V178 H298 Z", fill: "#fbf6e8", stroke: P.INK, "stroke-width": 1.6 }, jr);
      }
      // the tub: inside wall, bath surface, froth (indigo)
      const tb = P.el("g", { "data-name": "tub" }, g);
      P.el("path", { d: "M-190 20 A190 40 0 0 1 190 20 A190 40 0 0 1 -190 20 Z", fill: P.dk(WOOD, 0.35) }, tb);
      const bath = P.el("g", { "data-name": "bath" }, g), BC = plant ? PC[0] : GY, BD = `M-176 ${SURF} A176 32 0 0 1 176 ${SURF} A176 32 0 0 1 -176 ${SURF} Z`;
      { const id = P.clip(bath, BD), a = P.layer(bath, id); P.el("path", { d: BD, fill: BC }, a.g);
        for (let i = 0; i < 10; i++) { const x = P.rr(-170, 170), y = P.rr(SURF - 30, SURF + 30); a.stroke(x - 40, y, x + 40, y + P.rr(-4, 4), P.rr(6, 12), P.pick([P.lt(BC, 0.2), P.dk(BC, 0.15)]), 0.6); }
        a.stroke(-120, SURF - 14, 60, SURF - 18, 6, "#ffffff", 0.35, -3); a.done(); }
      if (!plant) { const fo = P.layer(bath); for (let i = 0; i < 14; i++) { const a = P.rr(0, 6.28), q = P.rr(0, 1); fo.dab(Math.cos(a) * q * 70 + 40, SURF - 6 + Math.sin(a) * q * 14, P.rr(7, 14), P.pick(["#1f3a73", "#2c4c86", "#5a4a6e"]), 0.95); }
        for (let i = 0; i < 8; i++) fo.dab(P.rr(-10, 90), P.rr(SURF - 16, SURF + 4), P.rr(2, 4), "#b87a4a", 0.8); fo.done(); }
      const ripple = P.el("path", { fill: "none", stroke: "#ffffff", "stroke-width": 2.4, ...free }, g);
      // the hanging piece: clipped at the bath surface, moved by one transform; its colour is one fill (or stroke)
      const hid = P.clip(g, `M-400 -420 H400 V${SURF} H-400 Z`), hold = P.el("g", { "clip-path": `url(#${hid})` }, g), item = P.el("g", { "data-name": "cloth" }, hold);
      let paintEl, attr = "fill";
      if (skein) {
        let sd = ""; for (let i = 0; i < 14; i++) { const x1 = -26 - i * 2.6, x2 = 26 + i * 2.6, b = L - 20 + (i % 3) * 4; sd += `M${x1.toFixed(1)} 0L${x1.toFixed(1)} ${b - 50}Q${x1.toFixed(1)} ${b} 0 ${b}Q${x2.toFixed(1)} ${b} ${x2.toFixed(1)} ${b - 50}L${x2.toFixed(1)} 0`; }
        paintEl = P.el("path", { d: sd, fill: "none", "stroke-width": 4.2, "stroke-linecap": "round", ...free }, item); attr = "stroke";
        P.el("path", { d: sd, fill: "none", stroke: "#ffffff", "stroke-width": 1.2, opacity: 0.35, transform: "translate(1.5 0)", ...free }, item);
        P.el("path", { d: sd, fill: "none", stroke: P.INK, "stroke-width": 0.7, opacity: 0.35, transform: "translate(-2 0)", ...free }, item);
        P.el("path", { d: "M-64 190 Q0 204 64 190 M-64 198 Q0 212 64 198", fill: "none", stroke: "#5a4632", "stroke-width": 3, ...free }, item);
      } else {
        const w = tie === 1 ? 46 : CW, D = `M${-w} -8 H${w} L${w + 4} ${L - 30} Q${w * 0.5} ${L + 4} 0 ${L - 10} Q${-w * 0.5} ${L + 10} ${-w - 4} ${L - 24} Z`;
        const cid = P.clip(item, D), cg = P.el("g", { "clip-path": `url(#${cid})` }, item);
        paintEl = P.el("path", { d: D }, cg);
        if (tie === 2) { const wl = P.layer(cg); for (const y of BANDS) { wl.stroke(-w - 10, y, w + 10, y + P.rr(-4, 4), 26, WHITE, 1, P.rr(-5, 5));
            for (let i = 0; i < 16; i++) { const x = -w + (i + 0.5) * (2 * w) / 16, s = P.pick([-1, 1]); wl.stroke(x, y, x + P.rr(-4, 4), y + s * P.rr(16, 30), P.rr(3, 6), WHITE, 0.8); } } wl.done(); }
        const tx = P.layer(cg); for (let i = 0; i < (tie === 1 ? 12 : 8); i++) { const x = P.rr(-w, w); tx.stroke(x, -10, x + P.rr(-10, 10), L, P.rr(8, 18), P.pick(["#0b1a33", "#ffffff"]), 0.1, P.rr(-10, 10)); }
        tx.flecks(160, -w, -8, w, L, "#0b1a33", 0.12); tx.done();
        P.ink(D, item, 2.6);
        if (tie === 1) { const cd = P.el("g", { "data-name": "cord" }, item), wl = P.layer(cd);
          for (const y of BANDS) { wl.stroke(-w - 6, y, w + 6, y, 30, WHITE, 1, 3); for (let j = -1; j <= 1; j++) wl.stroke(-w - 8, y + j * 7, w + 8, y + j * 7 + 3, 5, "#6a4a2c", 1, 3); }
          wl.done(); }
      }
      const pole = P.el("g", { "data-name": "pole" }, item), pl = P.layer(pole); pl.stroke(-184, -6, 184, -6, 16, WOOD); pl.stroke(-180, -10, 180, -10, 4, P.lt(WOOD, 0.35), 0.7); pl.done();
      P.el("path", { d: "M-184 -14 H184 V2 H-184 Z", fill: "none", stroke: P.INK, "stroke-width": 1.8, "stroke-linejoin": "round", ...free }, pole);
      // the tub's front, over everything that hangs inside it
      const FD = "M-190 20 A190 40 0 0 0 190 20 L172 196 Q0 230 -172 196 Z";
      fill(P, g, FD, [-190, 190, 18, 226], WOOD, { ang: 1.5, iw: 3 });
      const st_ = P.layer(g); for (const x of [-120, -60, 0, 60, 120]) st_.stroke(x * 1.0, 58 + Math.abs(x) * -0.15, x * 0.92, 210, 2.6, P.dk(WOOD, 0.35), 0.8);
      st_.stroke(-188, 70, 188, 70, 12, "#5b5f66", 1, -30); st_.stroke(-176, 172, 176, 172, 12, "#5b5f66", 1, -26); st_.done();
      P.el("path", { d: "M-190 20 A190 40 0 0 1 190 20", fill: "none", stroke: P.INK, "stroke-width": 2.4, ...free }, g);
      const s = { dip: ISO.clamp(+o.dip || 0, 0, 1), air: ISO.clamp(+o.air || 0, 0, 1), dyed: 0 };
      s.dyed = o.dyed !== undefined && o.dyed !== "" ? (+o.dyed ? 1 : 0) : s.dip > 0.3 || s.air > 0 ? 1 : 0;
      const now = { ...s };
      const out = () => (plant ? P.mix(PC[0], PC[1], now.air) : P.mix(GY, BLUE, now.air));
      const draw = () => {
        const py = -316 + now.dip * 262, bottom = py + L;
        item.setAttribute("transform", `translate(0 ${py.toFixed(1)})`);
        paintEl.setAttribute(attr, P.mix(WHITE, out(), now.dyed));
        ropes.setAttribute("d", `M-150 -322 L-150 ${(py - 8).toFixed(1)} M150 -322 L150 ${(py - 8).toFixed(1)}`);
        const r = skein ? 70 : (tie === 1 ? 54 : CW + 8); ripple.setAttribute("d", bottom > SURF + 4 ? `M${-r} ${SURF}A${r} 9 0 0 0 ${r} ${SURF}` : "M0 0"); ripple.setAttribute("opacity", ISO.clamp((bottom - SURF) / 40, 0, 1).toFixed(2));
      };
      draw();
      g.set = (q) => { for (const key of ["dip", "air"]) if (q[key] !== undefined) s[key] = ISO.clamp(+q[key] || 0, 0, 1); if (q.dyed !== undefined) s.dyed = +q.dyed ? 1 : 0; else if (q.air !== undefined && s.air > 0) s.dyed = 1; };
      g.update = (dt) => {
        let on = false; if ((ISO.still() ? s.dip : now.dip) > 0.6) s.dyed = 1;
        for (const q of ["dip", "air", "dyed"]) { now[q] = ISO.still() ? s[q] : ISO.follow(now[q], s[q], dt, q === "dip" ? 0.5 : 0.6); if (Math.abs(now[q] - s[q]) < 0.003) now[q] = s[q]; else on = true; }
        draw(); return on;
      };
      g.readout = () => `${plant ? "plant dye" : "indigo"}: ${s.dip > 0.5 ? "in the bath" : "lifted out"}${!s.dyed ? ", still white" : plant ? (s.air > 0.5 ? ", dried" : ", wet") : s.air > 0.5 ? ", turned blue in the air" : ", green-yellow"}`;
      return g;
    },
  });
})();
