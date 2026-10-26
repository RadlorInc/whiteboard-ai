// "blockmagnet cx cy k aim=left|right pole=N|S tilt=-40..40 x=0..200 v=0|1 lab=0 lit=magnet|pole|holder|screws" — a
// PART (PARTS.md, batch 5): the small block magnet on a dynamics trolley's front (collision.js, k=bounce). Two
// trolleys with the same pole facing (N to N) push apart before they touch, so the bounce is nearly elastic. Its
// origin is the middle of its back on the face it is screwed to; it faces −x (aim=left: a labtrolley's front) or +x
// (aim=right). A grey plastic holder plate with two screws, a 3 × 2 × 0.8 cm ferrite block on it, its outer face
// painted for its pole (N red, S blue) with the letter on the near side. It rides on the trolley: give it the
// trolley's tilt, x and v and it moves with it (labtrolley's road). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G;
  const FERRITE = ISO.tint("#62656b", ["#33353a", "#3d3f44", "#484a50", "#54565c"], "#16171a");
  const HOLDER = ISO.tint("#9a9ea4", ["#5e6268", "#6b6f75", "#797d83", "#878b91"], "#26292d");
  const PAINT = { N: ISO.tint("#e2604f", ["#a8302a", "#b83a32", "#c8463c", "#d65446"], "#5a1410"), S: ISO.tint("#5b8fd6", ["#2a5598", "#3462a8", "#406fb6", "#4f7fc4"], "#132e5c") };
  const T0 = 0.2, T1 = 1, PT = 0.06, HY = 1.5, HZ = 1, TAB = 2.2;

  function magnetSvg(P, rd, sg, pole, lab) {
    const at = rd.at, U = B10.span(sg), out = [];
    const holder = `<g data-name="holder">${ISO.tinted(HOLDER, ISO.box(at, P, U(0, T0), [-HZ - 0.2, HZ + 0.2], [-TAB, TAB], "mid"))}` +
      // a lip round the block's foot that holds it in the plate
      ISO.tinted(HOLDER, ISO.box(at, P, U(T0, T0 + 0.15), [-HZ - 0.1, HZ + 0.1], [-HY - 0.1, HY + 0.1], "mid")) + "</g>";
    const screw = (s) => `<g data-name="screws">${B10.screw(P, rd, sg * T0, 0, s * (TAB - 0.33), sg, 0.2)}</g>`;
    const magnet = `<g data-name="magnet">${ISO.tinted(FERRITE, ISO.box(at, P, U(T0 + 0.15, T1 - PT), [-HZ, HZ], [-HY, HY], "mid"))}</g>`;
    // the painted outer face (the pole) and its letter on the near side (+y), toward the pole end
    const letter = LAB.faceText(P, at(sg * (T1 - 0.28), -0.3, HY + 0.01), rd.d, pole, 0.75, pole === "N" ? "#c0392b" : "#2b6cc4", rd.n);
    const paint = `<g data-name="pole">${ISO.tinted(PAINT[pole], ISO.box(at, P, U(T1 - PT, T1), [-HZ, HZ], [-HY, HY], "hi"))}</g>`;
    // the camera looks from +x: facing +x the pole is nearest, facing −x the holder is (and its screws are behind it)
    out.push(...(sg > 0 ? [holder, screw(-1), magnet, paint, screw(1)] : [paint, screw(-1), screw(1), magnet, holder]), `<g data-name="pole">${letter}</g>`);
    if (lab) out.push(CIRC.word(P, at(sg * T1, HZ + 1, 0), `magnet, ${pole} out`));
    return { svg: out.join(""), anchors: { face: at(sg * T1, 0, 0).map((v) => +v.toFixed(3)) } };
  }

  ISO.add({
    name: "blockmagnet", title: "Block magnet (part)", compare: null,
    about: "A small ferrite block magnet in a holder on a dynamics trolley's front, its outer face one pole (N red, S blue): two trolleys with the same pole facing push apart and bounce; rides with the trolley (same tilt, x, v). anchors: face",
    line: "blockmagnet cx cy k aim=left|right pole=N|S tilt=-40..40 x=0..200 v=0|1 lab=0 lit=magnet|pole|holder|screws",
    demo: { line: "blockmagnet 480 300 60 aim=right", script: [{ set: {}, hold: 1 }, { set: { lit: "pole" }, hold: 1.2 }, { set: { pole: "S", lit: "magnet" }, hold: 1.2 }, { set: { x: 1.5, lit: "holder" }, hold: "settle" }, { set: { aim: "left", x: 0, lit: "screws" }, hold: "settle" }, { set: { tilt: 20, v: 1, x: 2, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      let sg = B10.side(o), pole = o.pole === "S" ? "S" : "N";
      const s = B10.ride(g, P, o, (rd) => magnetSvg(P, rd, sg, pole, lab), (p) => {
        let again = false;
        if (p.aim === "left" || p.aim === "right") { const n = p.aim === "right" ? 1 : -1; if (n !== sg) { sg = n; again = true; } }
        if ((p.pole === "N" || p.pole === "S") && p.pole !== pole) { pole = p.pole; again = true; }
        return again;
      });
      g.readout = () => `block magnet 3 × 2 × 1 cm, ${pole} face out toward ${sg > 0 ? "+x" : "−x"} · like poles repel: the trolleys push apart without touching and bounce (nearly elastic)${s.where()}`;
      return g;
    },
  });
})();
