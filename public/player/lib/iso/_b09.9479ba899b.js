// Batch b09 helpers (PARTS.md, batch 5): bits the calorimeter, chromatography, bimetal, circular-motion and collision
// parts share. Not a recipe: it only defines window.B09. World units are whatever the caller's camera uses.
(() => {
  const G = window.G;
  const B09 = (window.B09 = {});
  B09.Z = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  B09.X = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  B09.Y = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  // white expanded polystyrene, buff card, anodised aluminium, black japanned steel
  B09.FOAM = ISO.tint("#fbfbf8", ["#cfd0cb", "#dcddd8", "#e8e8e4", "#f2f2ef"], "#8f908a");
  B09.CARD = ISO.tint("#e9dcc2", ["#b9a988", "#c7b897", "#d4c6a7", "#dfd2b6"], "#6e5f40");
  B09.ALU = ISO.tint("#e4e7ea", ["#9aa1a8", "#adb3b9", "#c0c5ca", "#d2d6da"], "#4a5058");
  B09.BLACK = ISO.tint("#4a4d52", ["#1c1d20", "#25272a", "#2e3034", "#383a3e"], "#0b0c0d");
  // see-through glass: a class on the group, its css once per part
  B09.glassCss = (cls, fill = 0.14, shade = 0.3) => `<style>.${cls} .iso-fill{fill-opacity:${fill}}.${cls} .iso-shade,.${cls} .iso-top{opacity:${shade}}</style>`;
  // light every [data-name] in g named in lit ("a|b" or "a,b"); looked up each time (groups get rebuilt)
  B09.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // the usual static part tail: lit, update, readout
  B09.still = (g, o, text) => {
    const w = ISO.writer();
    let lit = o.lit || "";
    g.set = (q) => { if (q.lit !== undefined) { lit = q.lit; B09.light(w, g, lit); } };
    g.update = () => false;
    g.readout = () => text;
    B09.light(w, g, lit);
    return g;
  };
})();
