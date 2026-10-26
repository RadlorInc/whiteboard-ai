// "jumperwire cx cy k to=<id>.<anchor> span=1..10 dir=x|y c=black|red|blue|green|yellow|white lab=0 lit=wire|ends" — a PART (PARTS.md,
// batch 6): the breadboard jumper of led.js, its origin the first end's hole on the surface. A 22 AWG solid wire
// (1 mm over its insulation) in an arch from one hole to the other: to=<id>.<anchor> (the player passes tox toy, as
// wirelead; the far hole on the same surface), or else span cm along +x (dir=x) or +y (dir=y); the last
// 5 mm of each end bare, stiff tinned copper, going straight down into its hole, the insulation's cut end a short
// collar above it. The arch rises about a third of the span (at most 2.5 cm). Static. Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const COL = { black: ["#2e3136", "#0c0d0f", "#7a7f88"], red: ["#d8402f", "#6e1a12", "#f39a8e"], blue: ["#3478cc", "#123766", "#9cc2f2"], green: ["#3e9e4c", "#154a1d", "#9ad8a2"], yellow: ["#f2c230", "#7a5a08", "#fff0b0"], white: ["#eeeeea", "#77776f", "#ffffff"] };
  const BARE = 5, DIA = 1, N = 28;
  ISO.add({
    name: "jumperwire", title: "Breadboard jumper wire (part)", compare: null,
    about: "A breadboard jumper wire: an arch of insulated wire from one hole to another (to=<id>.<anchor>, or span cm along dir), its stiff bare ends pushed into the holes. anchors: end",
    line: "jumperwire cx cy k to=<id>.<anchor> span=1..10 dir=x|y c=black|red|blue|green|yellow|white lab=0 lit=wire|ends",
    demo: { line: "jumperwire 330 380 50 span=6 c=red lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "ends" }, hold: 1.2 }, { set: { lit: "wire" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const c = Object.hasOwn(COL, o.c) ? o.c : "black";
      // the far hole: to= (the player's tox toy, on the surface) or span cm along dir
      let span = B.num(o, "span", 3, 1, 10) * 10, u = o.dir === "y" ? [0, 1] : [1, 0];
      if (B.fin(o.tox) && B.fin(o.toy)) { const E = ISO.unproject(P, [+o.tox, +o.toy], 0), l = Math.hypot(E[0], E[1]); if (l > 0.05) { span = ISO.clamp(l * 10, 1, 1000); u = [E[0] / l, E[1] / l]; } }
      const at = (s, z) => [u[0] * s, u[1] * s, z], h = Math.min(span / 3, 25);
      // the insulated arch: a half-sine from collar to collar, BARE mm up
      const arch = []; for (let i = 0; i <= N; i++) { const u = i / N; arch.push(K.iso(at(span * u, BARE + h * Math.sin(Math.PI * u)), Pm)); }
      const wpx = Math.max(1, G.scaleOf(Pm) * DIA), bw = Math.max(0.7, wpx * 0.62), d = K.pathOf(arch);
      const bare = (s) => { const e = K.pathOf([K.iso(at(s, 0), Pm), K.iso(at(s, BARE + 0.4), Pm)]); return `<path d="${e}" fill="none" stroke="#5c5f64" stroke-width="${(bw + 0.7).toFixed(2)}" stroke-linecap="butt"/><path d="${e}" fill="none" stroke="#d6d8dc" stroke-width="${bw.toFixed(2)}" stroke-linecap="butt"/>`; };
      // the cut ends of the insulation: a short tube from BARE to BARE + 1.5 at each end, under the arch's start
      const collar = (s) => { const e = K.pathOf([K.iso(at(s, BARE), Pm), K.iso(at(s, BARE + 1.5), Pm)]); return `<path d="${e}" fill="none" stroke="${COL[c][1]}" stroke-width="${(wpx + 1.2).toFixed(2)}" stroke-linecap="butt"/><path d="${e}" fill="none" stroke="${COL[c][0]}" stroke-width="${wpx.toFixed(2)}" stroke-linecap="butt"/>`; };
      g.innerHTML = `<g data-name="ends">${bare(0)}${bare(span)}</g><g data-name="wire">${collar(0)}${collar(span)}${B.tube(d, wpx, COL[c][0], COL[c][1], COL[c][2])}</g>` +
        (lab ? ISO.word(K.iso(at(span / 2, BARE + h + 2), Pm), `${c} jumper`, "#444", { size: 13, dy: -6 }) : "");
      g.anchors = { end: at(span / 10, 0) };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `${c} jumper wire · ${+(span / 10).toFixed(1)} cm hole to hole · solid copper, joins the two holes`;
      B.light(w, g, lit);
      return g;
    },
  });
})();
