// "deskkeyboard cx cy k lab=0 lit=case|keys|letters|numpad" — a PART (batch 6): a full-size slim desktop keyboard lying
// on the desk, its origin its middle on the surface, its space bar toward the room (+y). A dark case 440 × 130 mm,
// white keys on a 19 mm pitch with their letters printed upright for the typist: the function row (Esc, F1–F12),
// five main rows (QWERTY), the arrow and edit keys, and the number pad; two status lamps; rubber feet. From
// computer.js (its keyboard). Static. Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const HX = 220, HY = 65, ZC = 14, ZK = 21, U = 19, GAP = 3;
  // the rows, back to front: [legend, width in keys]; a key with no legend is blank, a null legend is a gap
  const ROWS = [
    [["Esc", 1], [null, 1], ["F1", 1], ["F2", 1], ["F3", 1], ["F4", 1], [null, 0.5], ["F5", 1], ["F6", 1], ["F7", 1], ["F8", 1], [null, 0.5], ["F9", 1], ["F10", 1], ["F11", 1], ["F12", 1]],
    [["`", 1], ...[..."1234567890-="].map((c) => [c, 1]), ["Back", 2]],
    [["Tab", 1.5], ...[..."QWERTYUIOP[]"].map((c) => [c, 1]), ["\\", 1.5]],
    [["Caps", 1.75], ...[..."ASDFGHJKL;'"].map((c) => [c, 1]), ["Enter", 2.25]],
    [["Shift", 2.25], ...[..."ZXCVBNM,./"].map((c) => [c, 1]), ["Shift", 2.75]],
    [["Ctrl", 1.25], ["", 1.25], ["Alt", 1.25], ["", 6.25], ["Alt", 1.25], ["Fn", 1.25], ["", 1.25], ["Ctrl", 1.25]],
  ];
  const X0 = -214, NAV = 78, PAD = 142, Y0 = -60;
  const rowY = (r) => (r === 0 ? Y0 : Y0 + 5 + r * U);
  // every key as [x0, x1, y0, y1, legend, group]
  function keys() {
    const out = [];
    ROWS.forEach((row, r) => { let x = X0; for (const [s, w] of row) { if (s !== null) out.push([x, x + w * U, rowY(r), rowY(r) + U, s, r === 0 || s.length > 1 ? "keys" : "letters"]); x += w * U; } });
    [["Ins", 0, 1], ["Home", 1, 1], ["PgUp", 2, 1], ["Del", 0, 2], ["End", 1, 2], ["PgDn", 2, 2], ["↑", 1, 4], ["←", 0, 5], ["↓", 1, 5], ["→", 2, 5]].forEach(([s, c, r]) => out.push([NAV + c * U, NAV + (c + 1) * U, rowY(r), rowY(r) + U, s, "keys"]));
    [["Num", 0, 1, 1, 1], ["/", 1, 1, 1, 1], ["*", 2, 1, 1, 1], ["-", 3, 1, 1, 1], ["7", 0, 2, 1, 1], ["8", 1, 2, 1, 1], ["9", 2, 2, 1, 1], ["+", 3, 2, 1, 2], ["4", 0, 3, 1, 1], ["5", 1, 3, 1, 1], ["6", 2, 3, 1, 1],
      ["1", 0, 4, 1, 1], ["2", 1, 4, 1, 1], ["3", 2, 4, 1, 1], ["Enter", 3, 4, 1, 2], ["0", 0, 5, 2, 1], [".", 2, 5, 1, 1]].forEach(([s, c, r, w, h]) => out.push([PAD + c * U, PAD + (c + w) * U, rowY(r), rowY(r + h - 1) + U, s, "numpad"]));
    return out;
  }
  ISO.add({
    name: "deskkeyboard", title: "Desktop keyboard (part)", compare: null,
    about: "A full-size slim desktop keyboard: dark case, white keys with their letters, the function row, arrow keys and the number pad; static. anchors: top",
    line: "deskkeyboard cx cy k lab=0 lit=case|keys|letters|numpad",
    demo: { line: "deskkeyboard 480 300 18 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "letters" }, hold: 1.5 }, { set: { lit: "numpad" }, hold: 1.5 }, { set: { lit: "case" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 7 };
      const feet = [[-HX + 15, -HY + 10], [HX - 15, -HY + 10], [-HX + 15, HY - 10], [HX - 15, HY - 10]].map(([x, y]) => K.solidSvg(K.cylinder(x, y, 5, 0, 1.5, Pm, 14), { tone: "lo" })).join("");
      const body = T.slab(Pm, plan, 1.5, ZC - 1.5, "mid", T.C.dark, 6, 1);
      // the keys, back row first and left to right in each row (a nearer key hides the face of the one behind),
      // each with its legend printed on its top; a tall key goes with its lowest row
      const rows = Array.from({ length: 6 }, () => []);
      for (const kk of keys()) rows[Math.max(0, Math.round((kk[3] - U - Y0 - 5) / U))].push(kk);
      const keySvg = ([x0, x1, y0, y1, s]) => {
        let out = ISO.wbox(Pm, [x0 + GAP / 2, x1 - GAP / 2], [y0 + GAP / 2, y1 - GAP / 2], [ZC, ZK], "mid");
        if (s) { const size = s.length === 1 || /^F\d$/.test(s) ? 6.5 : 3.6; out += LAB.faceText(Pm, [(x0 + x1) / 2, (y0 + y1) / 2 + size * 0.36, ZK + 0.05], [1, 0, 0], ISO.esc(s), size, "#33373d", [0, -1, 0]); }
        return out;
      };
      const keySvgAll = rows.map((row) => row.sort((a, b) => a[0] - b[0]).map((kk) => `<g data-name="${kk[5]}">${ISO.tinted(T.C.white, keySvg(kk))}</g>`).join("")).join("");
      // two status lamps over the number pad
      const lamps = [PAD + 20, PAD + 40].map((x) => `<path d="${window.B33.circle(Pm, [x, Y0 + 9, ZC + 0.05], [1, 0, 0], [0, 1, 0], 1.6, 12)}" fill="#7fe08a" stroke="#1d5f2c" stroke-width=".4"/>`).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(plan, 0, ZK, Pm)}"/><g data-name="case">${ISO.tinted(ISO.T.rubber, feet)}${body}${lamps}</g>${keySvgAll}<g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [HX, HY, ZC], "keyboard", "#556", { anchor: "start", dx: 8 });
      g.anchors = { top: [0, 0, ZK / 10] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; LAB.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "full-size keyboard · 104 keys · function row, letters, arrows and number pad";
      LAB.light(w, g, lit);
      return g;
    },
  });
})();
