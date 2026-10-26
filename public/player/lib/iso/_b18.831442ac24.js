// Batch b18 helpers (PARTS.md, batch 5): shared by the b18 parts (splint, phchart, solenoid, the balances, the He-Ne
// laser set). Not a recipe: it only defines window.B18.
(() => {
  const B18 = (window.B18 = {});
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups may be rebuilt)
  B18.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the axis frame along x through o (the laser parts and the solenoid lie along x)
  B18.X = (o) => window.G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  // the He-Ne laser set's beam axis: 6.1 cm over the surface the cradles and the mirror mounts stand on (a 3 cm tube
  // resting in a 90° V whose bottom is at 4 cm: 4 + 1.5·√2)
  B18.LASER_Z = 4 + 1.5 * Math.SQRT2;
})();
