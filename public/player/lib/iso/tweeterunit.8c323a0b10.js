// "tweeterunit cx cy k aim=side|front play=0|1 lab=0 lit=faceplate|dome|magnet|terminals" — a PART (PARTS.md, batch 6): the dome
// tweeter of speaker.js as a loose driver, 9.6 cm across and 3 cm deep, facing the room (+y). Its origin is the middle
// of its mounting face (the faceplate's back, flat on a baffle). A round black faceplate with four screws and a
// raised ring round a 26 mm soft fabric dome; behind it the small ferrite magnet with its back plate and the two
// solder tabs (red +, black −). play=1 drives it: the dome vibrates (shown slowed, travel enlarged) and small rings
// of sound leave it. aim=front faces the room (+y) to sit on a baffle; aim=side turns it 40° toward −x so the magnet and
// tabs show. set({ play }). Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  ISO.add({
    name: "tweeterunit", title: "Dome tweeter (part)", compare: null,
    about: "A dome tweeter for the treble: round faceplate, a small soft dome that vibrates, and its little magnet behind. anchors: front back",
    line: "tweeterunit cx cy k aim=side|front play=0|1 lab=0 lit=faceplate|dome|magnet|terminals",
    demo: { line: "tweeterunit 480 270 40 lab=1", script: [{ set: {}, hold: 1 }, { set: { play: 1 }, hold: 2.4 }, { set: { play: 0, lit: "magnet" }, hold: 1.2 }, { set: { lit: "dome" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B39, T = window.TECH, W = B.TWEET;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), aim = o.aim === "front" ? "front" : "side", P = B.aimCam(ISO.mm(Pc), aim), lab = o.lab === "1";
      const F = B.axis(0, 0), lathe = (pts, c, tone = "mid", steps = 32) => ISO.tinted(c, T.S(G.lathe(pts, F, P, { steps }), { tone }));
      // the solder tabs stick out of the back plate's side that faces the viewer
      const tx = G.viewOf(P)[0] >= 0 ? 1 : -1, X = (a, b) => (tx > 0 ? [a, b] : [-b, -a]);
      const tabs = T.box(P, X(15, 24), [-17.5, -16], [3, 7], "hi", T.C.red) + T.box(P, X(15, 24), [-17.5, -16], [-7, -3], "hi", T.C.dark) +
        T.dot(P, [[21 * tx, -15.98, 5], [21 * tx, -15.98, -5]], 0.45, "lo");
      // built in two parts (ISO.later): the magnet and tabs behind, the faceplate and dome in front
      g.innerHTML = `<g data-part="back"></g><g data-part="face"></g><g data-part="waves"></g><g data-part="words"></g>`;
      const el = window.LAB.parts(g), w = ISO.writer(), st = { play: o.play === "1", amp: 0, ph: 0, wph: 0, lit: o.lit || "" };
      const fill = (key, fn) => ISO.later(() => { el[key].innerHTML = fn(); Object.assign(el, window.LAB.parts(g)); draw(); });
      const draw = () => {
        if (el.dome) w.attr(el.dome, "transform", K.translateAlong(P, [0, st.amp * Math.sin(st.ph) * 0.8, 0]));
        const q = Math.floor((st.wph % 1) * 24), on = st.amp > 0.02;
        w.rebuild(el.waves, on ? `${q} ${st.amp.toFixed(1)}` : "", () => (on ? B.rings(P, F, 12, 16, q, st.amp, 3, 30, 22) : ""));
        B.light(w, g, st.lit);
        w.rebuild(el.words, lab ? "1" : "", () => (lab ? T.word(P, [W.fr, 4, 0], "tweeter", { anchor: "start", dx: 10 }) + T.word(P, [0, 12, 0], "dome", { dy: -26 }) : ""));
      };
      g.anchors = { front: B.aimed(aim, [0, W.front / 10, 0]), back: B.aimed(aim, [0, -W.depth / 10, 0]) };
      g.set = (p) => {
        if (p.play !== undefined) st.play = String(p.play) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // A real dome moves a few hundredths of a mm, 2000–20 000 times a second: shown slowed, the travel enlarged.
      g.update = (dt) => {
        const calm = ISO.still();
        st.amp = ISO.follow(st.amp, st.play ? 1 : 0, dt, 0.2, calm); if (!st.play && st.amp < 0.01) st.amp = 0;
        if (!calm) { st.ph += dt * Math.PI * 10; st.wph += dt * 1.4; }
        draw();
        return st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? "playing · the small light dome vibrates 2000–20 000 times a second for the treble (shown slowed, its travel enlarged)" : "dome tweeter · a 26 mm soft dome on a 96 mm faceplate · the small magnet behind drives its voice coil");
      draw();
      fill("back", () => `<g data-name="magnet">${lathe(W.back, T.C.steel)}${lathe(W.magnet, T.C.magnet, "lo")}</g><g data-name="terminals">${T.box(P, X(10, 16), [-18, -15.5], [-9, 9], "mid", T.C.black)}${tabs}</g>`);
      fill("face", () => `<g data-name="faceplate">${B.tweeterFace(P, F)}</g><g data-name="dome"><g data-part="dome">${B.dome(P, F)}</g></g>`);
      return g;
    },
  });
})();
