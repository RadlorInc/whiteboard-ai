// "zoomlens cx cy k f=2.8..16 lab=0 lit=barrel|glass|aperture|mount" — a PART (batch 6): camera.js's interchangeable
// zoom lens on its own, cut in half down its axis, lying on its side on the table (axis along x, the mount toward −x,
// the front toward +x). 7.4 cm across, 7.6 cm long: a steel bayonet mount, the barrel with its rubber zoom ring (focal
// marks printed on it) and focus ring and the front ring; inside, five glass elements in their retaining rings and an
// iris of seven blades (B31.lens, B31.iris). f = the aperture's f-number: the blades close in as f grows (the opening
// is about 3.6 cm / f across), letting in 1/f² as much light; set({ f }) eases them. Origin: the table point under the
// lens's middle, on the cut. Built in mm (ISO.mm), anchors in cm: mount (the back of the mount on the axis), front.
(() => {
  const K = window.K, G = window.G;
  const AXZ = 37, OFF = [48, 0, 0];
  const radiusOf = (f) => 36 / f;
  let uid = 0;

  ISO.add({
    name: "zoomlens", title: "Zoom lens, cut open (part)", compare: null,
    about: "An interchangeable zoom lens cut in half: mount, zoom and focus rings, five glass elements in retaining rings and an iris whose seven blades close as the f-number grows. anchors: mount front",
    line: "zoomlens cx cy k f=2.8..16 lab=0 lit=barrel|glass|aperture|mount",
    demo: { line: "zoomlens 480 340 38 f=4", script: [{ set: {}, hold: 1 }, { set: { f: 11 }, hold: "settle" }, { set: { f: 2.8 }, hold: "settle" }, { set: { lit: "glass" }, hold: 1.2 }, { set: { lit: "mount", f: 5.6 }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const P = B31.shift(ISO.mm(Pc), OFF), id = ++uid, lens = B31.lens(P, AXZ);
      // the mount ring (first of the barrel's rings) is drawn on its own so it can light
      const [mountRing] = [B31.RINGS[0]];
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: 10, y: -37, w: 76, d: 37, r: 4 }, 0, 0.1, P)}"/>` +
        `<g data-name="barrel">${lens.rings}</g><g data-name="mount"></g><g data-name="aperture" data-part="iris"></g><g data-name="glass">${lens.glass}</g><g data-part="words"></g>`;
      // light the mount: its steel ring and the bayonet's three tabs on the cut face's edge
      const mount = g.querySelector('[data-name="mount"]');
      mount.innerHTML = lens.cut([[mountRing[0], AXZ + mountRing[2] - mountRing[3]], [mountRing[1], AXZ + mountRing[2] - mountRing[3]], [mountRing[1], AXZ + mountRing[2]], [mountRing[0], AXZ + mountRing[2]]], "#c7c9cd", "#3c3f45") +
        lens.cut([[mountRing[0], AXZ - mountRing[2]], [mountRing[1], AXZ - mountRing[2]], [mountRing[1], AXZ - mountRing[2] + mountRing[3]], [mountRing[0], AXZ - mountRing[2] + mountRing[3]]], "#c7c9cd", "#3c3f45");
      g.anchors = { mount: [(10 - OFF[0]) / 10, 0, AXZ / 10], front: [(B31.FRONT - OFF[0]) / 10, 0, AXZ / 10] };
      const el = { iris: g.querySelector('[data-part="iris"]'), words: g.querySelector('[data-part="words"]') }, w = ISO.writer();
      const f0 = B31.num(o, "f", 4, 2.8, 16);
      const st = { f: f0, want: f0, lit: o.lit || "" };
      const draw = () => {
        const r = radiusOf(st.f), q = Math.round(r * 4) / 4;
        w.rebuild(el.iris, String(q), () => B31.iris(P, AXZ, q, `zlis${id}`));
        w.rebuild(el.words, lab ? `${Math.round(st.f * 10)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([B31.LENSES[0][0], 0, AXZ + 40], P), "glass elements", "#1f4f8f", { size: 13, dy: -6 }),
          ISO.word(K.iso([B31.APX, 0, AXZ - 36], P), `aperture f/${(Math.round(st.f * 10) / 10)}`, "#444", { size: 13, dy: 18 }),
          ISO.word(K.iso([12, 0, AXZ + 33], P), "mount", "#444", { size: 13, anchor: "end", dy: -6 }).replace('x="', 'dx="-6" x="'),
        ].join(""));
        B31.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.f !== undefined) { const v = +p.f; if (Number.isFinite(v)) st.want = ISO.clamp(v, 2.8, 16); }
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the blades turn in or out over about half a second
      g.update = (dt) => {
        st.f = ISO.follow(st.f, st.want, Math.min(Math.max(+dt || 0, 0), 0.1), 0.15, ISO.still());
        if (Math.abs(st.f - st.want) < 0.01) st.f = st.want;
        draw();
        return st.f !== st.want;
      };
      g.readout = () => { const f = Math.round(st.want * 10) / 10; return `aperture f/${f} · opening ${(36 / f / 10 * 2).toFixed(1)} cm across · lets in ${Math.round((2.8 / f) ** 2 * 100)} % of the light it lets in at f/2.8`; };
      draw();
      return g;
    },
  });
})();
