// "sectorpanel cx cy k deg=0..360 on=0|1 lab=0 lit=antenna|radio|bracket|pipe" — a PART (batch 6): celltower.js's
// sector antenna at real size: a panel antenna 30 × 12 × 140 cm (white radome, grey end caps, two connectors under
// it, a label plate) on two brackets clamped to a 7.6 cm mount pipe 160 cm long, and its remote radio unit (26 × 15
// × 50 cm, cooling fins, a handle, three connectors, a status LED) clamped behind the pipe, two jumper cables from the
// radio round under the pipe to the panel. deg = the bearing the panel faces (0 = +x, 90 = +y, on the ground plan).
// on=1: the sector is carrying calls: the radome shows amber and the radio's LED green; set({ on }). Origin: the
// pipe's axis at the panel's middle height (where it is placed on a mast's head frame). World: 1 = 1 cm.
// anchors: top (the pipe's top), face (the middle of the radome's front).
(() => {
  const K = window.K;
  ISO.add({
    name: "sectorpanel", title: "Sector panel antenna with radio (part)", compare: null,
    about: "A mobile mast's sector antenna: a 140 cm panel on brackets on a mount pipe, its radio unit clamped behind with jumper cables; it lights amber while it carries calls. anchors: top face",
    line: "sectorpanel cx cy k deg=0..360 on=0|1 lab=0 lit=antenna|radio|bracket|pipe",
    demo: { line: "sectorpanel 480 270 2.6 deg=30", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: 1.4 }, { set: { lit: "radio" }, hold: 1.2 }, { set: { lit: "antenna", on: 0 }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const a = (B31.num(o, "deg", 60, 0, 360) * Math.PI) / 180, n = [Math.cos(a), Math.sin(a), 0];
      const st = { on: o.on === "1", lit: o.lit || "" }, w = ISO.writer();
      g.innerHTML = `<g data-part="body"></g>`;
      const body = g.firstChild;                                   // rebuilt inside, so only= (a style on g) survives
      g.anchors = { top: [0, 0, 80], face: [21 * n[0], 21 * n[1], 0] };
      const draw = () => {
        w.rebuild(body, String(st.on), () => {
          const items = B31.panelItems(P, [0, 0, 0], n, { on: st.on });
          items[0].svg = `<g data-name="pipe">${items[0].svg}</g>`;
          return `<path class="iso-halo" d="${K.haloOf({ x: -24, y: -24, w: 48, d: 48, r: 24 }, -80, 0.1, P)}"/>` + B31.sorted(items) +
            (lab ? ISO.word(K.iso([21 * n[0], 21 * n[1], 76], P), st.on ? "sector antenna (active)" : "sector antenna", st.on ? "#8a5a10" : "#444", { size: 13 }) : "");
        });
        B31.light(w, g, st.lit);
      };
      g.set = (p) => { if (p.on !== undefined) st.on = String(p.on) === "1"; if (p.lit !== undefined) st.lit = p.lit; draw(); };
      g.update = () => false;
      g.readout = () => `sector antenna · panel 30 × 12 × 140 cm on a mount pipe, its radio unit behind · ${st.on ? "active: carrying calls in its 120° sector" : "idle"}`;
      draw();
      return g;
    },
  });
})();
