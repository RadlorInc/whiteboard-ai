// "calculator cx cy k num=-9999999..99999999 key=none|ac|c|percent|divide|7|8|9|times|4|5|6|minus|1|2|3|plus|0|00|dot|equals
// press=0..1 lab=0 lit=body|solar|display|keys" — a PART (batch 6, money): a desk calculator lying on a table, its origin
// the table point under its middle, its keys toward the room (+y). A dark plastic body 10 × 15 cm, sloped from 1.5 cm
// at the back to 0.8 cm at the front, on four rubber feet; at the back a solar strip of four dark cells, then a grey
// LCD in its bezel showing num in 8 digits (the unlit 8s faint behind, a minus sign at the left), then a 4 × 5 grid of
// keys: AC C % ÷ · 7 8 9 × · 4 5 6 − · 1 2 3 + · 0 00 . = (clear keys red, operators dark, equals orange). key names
// the key a finger is on and press (0..1) pushes it down its 1.2 mm travel; set({ num }) shows a new number at once,
// set({ key, press }) presses a key. World: 1 = 1 cm. anchors: display key (the middle of the key named by key=)
(() => {
  const K = window.K;
  const HX = 5, HY = 7.5, ZF = 0.8, ZB = 1.5, PL = 0.3;
  const zf = (y) => PL + ZF + ((HY - y) / (2 * HY)) * (ZB - ZF);   // the top's height above the table at y
  const KEYS = [["ac", "AC"], ["c", "C"], ["percent", "%"], ["divide", "÷"], ["7", "7"], ["8", "8"], ["9", "9"], ["times", "×"], ["4", "4"], ["5", "5"], ["6", "6"], ["minus", "−"], ["1", "1"], ["2", "2"], ["3", "3"], ["plus", "+"], ["0", "0"], ["00", "00"], ["dot", "."], ["equals", "="]];
  const KW = 1.75, KD = 1.2, PX = 2.25, PY = 1.62, KY0 = -1.05;
  const keyAt = (i) => [(i % 4 - 1.5) * PX, KY0 + Math.floor(i / 4) * PY];
  const UP = (() => { const s = (ZB - ZF) / (2 * HY), l = Math.hypot(1, s); return [0, -1 / l, s / l]; })();
  const BODY = ISO.tint("#4a4f57", ["#23262b", "#2c3035", "#353a40", "#41464d"], "#0f1114");
  const KEY = { digit: ISO.tint("#e9ebee", ["#9da2a9", "#b0b4ba", "#c3c6cb", "#d6d8dc"], "#3c4047"), op: ISO.tint("#7b8089", ["#3e4248", "#4b4f56", "#585d64", "#666b73"], "#1c1e22"),
    clear: ISO.tint("#f2b3a9", ["#b0503f", "#c2604e", "#d27464", "#e28d7f"], "#5a1a10"), eq: ISO.tint("#f7cf8a", ["#c27a1c", "#d08b2c", "#dd9d44", "#e9b264"], "#5f3a06") };
  const kindOf = (id) => (id === "ac" || id === "c" ? "clear" : id === "equals" ? "eq" : /^\d+$/.test(id) || id === "dot" ? "digit" : "op");
  // 8 digits as a real LCD shows them: rounded to fit, a minus sign, "E" past the range
  const lcd = (v) => {
    if (!Number.isFinite(v)) return "0";
    if (Math.abs(v) > 99999999.5) return "E";
    let s = String(Math.round(v * 1e7) / 1e7);
    if (s.replace(/[-.]/g, "").length > 8) { const int = String(Math.trunc(Math.abs(v))).length; s = v.toFixed(Math.max(0, 8 - int)); }
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s;
  };
  ISO.add({
    name: "calculator", title: "Desk calculator (part)", compare: null,
    about: "A desk calculator: solar strip, an 8-digit LCD, a 4 × 5 grid of keys on a sloped dark body; a lesson types a sum (key, press) and shows the answer (num). anchors: display key",
    line: "calculator cx cy k num=-9999999..99999999 key=none|ac|c|percent|divide|7|8|9|times|4|5|6|minus|1|2|3|plus|0|00|dot|equals press=0..1 lab=0 lit=body|solar|display|keys",
    demo: { line: "calculator 480 280 34 num=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { key: "1", press: 1, num: 1, lit: "keys" }, hold: 0.5 }, { set: { press: 0 }, hold: 0.4 }, { set: { key: "2", press: 1, num: 12 }, hold: 0.5 }, { set: { key: "plus", press: 0 }, hold: 0.4 }, { set: { press: 1 }, hold: 0.5 },
      { set: { key: "3", press: 0, num: 3 }, hold: 0.4 }, { set: { press: 1 }, hold: 0.5 }, { set: { key: "equals", press: 0 }, hold: 0.4 }, { set: { press: 1, num: 15, lit: "display" }, hold: 1.2 }, { set: { press: 0, num: 1234.5678, lit: "solar" }, hold: 1.4 }, { set: { key: "none", num: -48.25, lit: "body" }, hold: 1.4 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const ids = KEYS.map(([id]) => id);
      const st = { num: B.num(o, "num", 0, -99999999, 99999999), key: ids.includes(o.key) ? o.key : "none", press: B.num(o, "press", 0, 0, 1), lit: o.lit || "" };
      st.want = st.press;
      const on = (x, y, h = 0) => [x, y, zf(y) + h];
      const at = (u, w, v) => [u, v, zf(v) + w];   // a frame on the sloped top: u along x, w up from it, v along y
      const quadOn = (x0, x1, y0, y1, h, fill, stroke = "none", sw = 0.5) => TE.quad(P, [on(x0, y0, h), on(x1, y0, h), on(x1, y1, h), on(x0, y1, h)], fill, stroke, sw);
      // the body: rubber feet, the sloped shell cut as a prism along x, an inset line round the top
      const feet = ISO.tinted(ISO.T.rubber, [[-HX + 1, -HY + 1], [HX - 1, -HY + 1], [-HX + 1, HY - 1], [HX - 1, HY - 1]].map(([x, y]) => K.solidSvg(K.cylinder(x, y, 0.45, 0, PL, P, 14), { tone: "lo" })).join(""));
      const R = 0.35, outline = [[-HY + R, PL], [HY - R, PL], ...ISO.arc(HY - R, PL + R, R, -Math.PI / 2, 0, 4).slice(1), ...ISO.arc(HY - R, PL + ZF - R, R, 0, Math.PI / 2, 4), ...ISO.arc(-HY + R, PL + ZB - R, R, Math.PI / 2, Math.PI, 4), ...ISO.arc(-HY + R, PL + R, R, Math.PI, Math.PI * 1.5, 4).slice(0, -1)];
      const body = ISO.prismX(P, outline, -HX, HX, ["#202328", "#5a6068"], "#3a3f46", "#0f1114") + quadOn(-HX + 0.25, HX - 0.25, -HY + 0.25, HY - 0.25, 0.01, "#40454c", "#22252a", 0.5);
      // the solar strip: four dark cells in a frame
      const solar = quadOn(-1.6, 4.2, -6.85, -5.75, 0.02, "#3a2f2a", "#16120f", 0.5) + [0, 1, 2, 3].map((i) => quadOn(-1.48 + i * 1.42, -1.48 + i * 1.42 + 1.32, -6.75, -5.85, 0.03, "#4a3426", "#2a1b12", 0.35)).join("") +
        B.face(P, on(-4.3, -6.1, 0.03), [1, 0, 0], UP, "SOLAR", 0.36, "#9aa1a9", { anchor: "start" });
      // the display: bezel, the grey-green glass, the faint unlit 8s
      const DX0 = -4.3, DX1 = 4.3, DY0 = -5.25, DY1 = -2.35, mono = { font: "'Courier New',monospace", anchor: "end", weight: 700 };
      const display = quadOn(DX0, DX1, DY0, DY1, 0.02, "#22252a", "#0f1114", 0.5) + quadOn(DX0 + 0.3, DX1 - 0.3, DY0 + 0.3, DY1 - 0.3, 0.03, "#b9c4a8", "#4c5644", 0.5) +
        B.face(P, on(DX1 - 0.55, DY1 - 0.75, 0.035), [1, 0, 0], UP, "88888888", 1.55, "#a9b498", mono);
      const keySvg = (i, down) => {
        const [id, txt] = KEYS[i], [x, y] = keyAt(i), dz = 0.12 * down, tint = KEY[kindOf(id)];
        const box = ISO.tinted(tint, ISO.box(at, P, [x - KW / 2, x + KW / 2], [0.02 - dz, 0.32 - dz], [y - KD / 2, y + KD / 2], "mid"));
        const ink = kindOf(id) === "op" ? "#f2f3f5" : "#26292e";
        return box + B.face(P, on(x, y + 0.24, 0.33 - dz), [1, 0, 0], UP, txt, txt.length > 1 ? 0.5 : 0.62, ink);
      };
      // the key wells under every key (dark gaps), then the keys back row first
      const wells = KEYS.map((_, i) => { const [x, y] = keyAt(i); return quadOn(x - KW / 2 - 0.08, x + KW / 2 + 0.08, y - KD / 2 - 0.08, y + KD / 2 + 0.08, 0.015, "#1b1d21"); }).join("");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.4 }, 0, 0.02, P)}"/>` +
        `<g data-name="body">${feet}${body}${wells}</g><g data-name="solar">${solar}</g><g data-name="display">${display}<g data-part="digits"></g></g>` +
        `<g data-name="keys"><g data-part="keysA"></g><g data-part="keyP"></g><g data-part="keysB"></g></g><g data-part="words"></g>`;
      const ki = () => ids.indexOf(st.key);
      g.anchors = { display: on(0, (DY0 + DY1) / 2, 0.03), key: ki() >= 0 ? on(...keyAt(ki()), 0.32) : on(0, 3, 0.32) };
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(K.iso([HX, -HY, ZB + 1], P), "calculator", "#556", { size: 13, anchor: "start" });
      const draw = () => {
        const i = ki(), row = i >= 0 ? Math.floor(i / 4) : 99;
        // keys in rows before the pressed key's row, the pressed key's row (with that key at its depth), the rest
        w.rebuild(el.keysA, `${st.key}`, () => KEYS.map((_, j) => (Math.floor(j / 4) < row || (Math.floor(j / 4) === row && j < i) ? keySvg(j, 0) : "")).join(""));
        const pq = Math.round(st.press * 12) / 12;
        w.rebuild(el.keyP, `${st.key} ${pq}`, () => (i >= 0 ? keySvg(i, pq) : ""));
        w.rebuild(el.keysB, `${st.key}`, () => KEYS.map((_, j) => (i < 0 || Math.floor(j / 4) > row || (Math.floor(j / 4) === row && j > i) ? keySvg(j, 0) : "")).join(""));
        const s = lcd(st.num);
        w.rebuild(el.digits, s, () => B.face(P, on(DX1 - 0.55, DY1 - 0.75, 0.04), [1, 0, 0], UP, s, 1.55, "#1f2a1c", mono));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.num !== undefined) st.num = ISO.clamp(+p.num, -99999999, 99999999);
        if (p.key !== undefined && (ids.includes(p.key) || p.key === "none")) { if (p.key !== st.key) st.press = 0; st.key = p.key; }
        if (p.press !== undefined) st.want = ISO.clamp(+p.press, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // a key goes down fast and springs back a little slower
      g.update = (dt) => {
        st.press = ISO.follow(st.press, st.want, dt, st.want > st.press ? 0.04 : 0.07, ISO.still());
        if (Math.abs(st.press - st.want) < 0.01) st.press = st.want;
        draw();
        return st.press !== st.want;
      };
      g.readout = () => `calculator · display ${lcd(st.num)}${st.key !== "none" ? ` · key ${KEYS[ki()][1]} ${st.want > 0.5 ? "pressed" : "up"}` : ""}`;
      draw();
      return g;
    },
  });
})();
