// Batch b35 helpers (PARTS.md, batch 6: laptop, LED-on-a-breadboard and microphone parts). Not a recipe: it only
// defines window.B35, which those part files call at make time.
(() => {
  const K = window.K;
  const B35 = (window.B35 = {});
  // a finite number from the line or a set(), clamped (fuzzed lines pass words, NaN, huge values)
  B35.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  B35.fin = (v) => v !== undefined && v !== null && v !== "" && Number.isFinite(+v);
  // light every [data-name] named in lit ("a|b" or "a,b"); looked up each time, since groups get rebuilt
  B35.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // The part's camera in other units and turned about z: a world unit of `div` (10 = mm, 100 = 0.1 mm), the drawing
  // turned by `az` degrees (180: a scene recipe built facing the other way), and the build's point `from` landing on the
  // part's origin. A turn about z is the same as a camera azimuth change, so depth order and lighting stay right.
  B35.cam = (P, { div = 10, az = 0, from = [0, 0, 0] } = {}) => {
    const Q = { ...P, scale: P.scale / div, azimuth: (P.azimuth ?? ISO.PART_CAM.azimuth) + az };
    const a = K.iso([0, 0, 0], P), b = K.iso(from, Q);
    Q.origin = [P.origin[0] + a[0] - b[0], P.origin[1] + a[1] - b[1]];
    return Q;
  };
  // a round cable drawn as a stroked path: dark outline, body colour, a thin highlight along it
  B35.tube = (d, w, col, ink, hi) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(w + 1.2).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    (hi ? `<path d="${d}" fill="none" stroke="${hi}" stroke-width="${Math.max(0.4, w * 0.22).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity=".55" transform="translate(${(-w * 0.18).toFixed(2)} ${(-w * 0.18).toFixed(2)})"/>` : "");
  // the eleven colours of a resistor's value bands, and the bands for a value (two digits, multiplier, gold 5 %)
  B35.BANDS = ["#1e1e1e", "#7a4a1c", "#c8322a", "#e07a1f", "#f1cc2a", "#3f9a46", "#2f62c4", "#7a46b0", "#8a8a8a", "#f4f4f0"];
  B35.BANDNAMES = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"];
  B35.GOLD = "#c9a640"; B35.SILVER = "#b9bcc1";
  B35.bandsOf = (ohm) => {
    let e = Math.floor(Math.log10(ohm)) - 1, d = Math.round(ohm / 10 ** e);
    if (d >= 100) { d = 10; e++; }
    return [B35.BANDS[Math.floor(d / 10)], B35.BANDS[d % 10], e === -1 ? B35.GOLD : e === -2 ? B35.SILVER : B35.BANDS[e], B35.GOLD];
  };
  B35.ohmsText = (ohm) => (ohm >= 1e6 ? `${+(ohm / 1e6).toPrecision(2)} MΩ` : ohm >= 1e3 ? `${+(ohm / 1e3).toPrecision(2)} kΩ` : `${+ohm.toPrecision(2)} Ω`);
})();
