// "grocerscale cx cy k kg=0..5 perkg=0..99.99 label=0|1 lab=0 lit=body|pan|display|keys|printer" — a PART (batch 6,
// money): a shop counter weighing scale on the counter, its origin the counter point under its middle, its display
// toward the room (+y). 35 × 35 × 12 cm: a cast body on four rubber feet, a flat stainless pan with a raised lip on
// top (anchor `pan`, where the food goes), a sloping front panel with three LCD windows (weight in kg to 5 g, the
// price per kg, the price to pay = weight × price per kg, worked out by the scale), a row of keys, and a label printer
// in the right side. kg is the true load on the pan: the weight display samples it and settles, as a real scale does;
// perkg is keyed in; label=1 prints a label that slides out of the side with the weight, price per kg and price to
// pay (label=0 tears it off). Built-in words only ("kg", "PRICE / kg", "TO PAY"). set({ kg, perkg, label }).
// World: 1 = 1 cm. anchors: pan
(() => {
  const K = window.K, G = window.G;
  const HX = 17.5, HY = 17.5, ZT = 9, YR = 6, ZF = 4, LCD = "#c4d9b0", INK = "#1d2a14", GHOST = "#b0c79c";
  const BODY = [[HY, 0], [-HY, 0], [-HY, ZT], [YR, ZT], [HY, ZF]];
  let uidN = 0;
  const PAN = { x0: -15, x1: 15, y0: -16, y1: 5, z: ZT + 1.5 };
  ISO.add({
    name: "grocerscale", title: "Grocer's scale (part)", compare: null,
    about: "A shop counter scale, 35 × 35 × 12 cm: a flat steel pan, a display showing the weight, the price per kg and the price to pay (worked out), and a label printer in its side. anchors: pan",
    line: "grocerscale cx cy k kg=0..5 perkg=0..99.99 label=0|1 lab=0 lit=body|pan|display|keys|printer",
    demo: { line: "grocerscale 480 370 13 kg=0 perkg=2.40 lab=1", script: [{ set: {}, hold: 1 }, { set: { kg: 1.25, lit: "pan" }, hold: "settle" }, { set: { perkg: 3.6, lit: "display" }, hold: 1.5 }, { set: { label: 1, lit: "printer" }, hold: "settle" }, { set: { kg: 0, label: 0, lit: "keys" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B41, lab = o.lab === "1", S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const kgOf = (v, d) => Math.round(B.num({ v }, "v", d, 0, 5) * 200) / 200;   // the scale reads to 5 g
      const st = { kg: kgOf(o.kg, 0), perkg: Math.round(B.num(o, "perkg", 2.4, 0, 99.99) * 100) / 100, label: o.label === "1" ? 1 : 0, lit: o.lit || "" };
      st.shown = st.kg; st.out = st.label; st.printed = st.kg;
      const at = (p) => K.iso(p, P), uid = uidN++;
      // the sloping panel as flat artwork: x along +x, down the slope toward the front, 1 unit = 1 cm
      const len = Math.hypot(HY - YR, ZT - ZF), dn = [0, (HY - YR) / len, (ZF - ZT) / len];
      const panelM = B.plane(P, [-HX + 0.6, YR + dn[1] * 0.4, ZT + dn[2] * 0.4 + 0.02], [1, 0, 0], dn);
      const WINS = [[1.2, 9.4], [12, 9.4], [22.8, 10.6]], WY = [0.9, 4.6];
      const body = () => {
        const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 1.5 }, 0, 12, P)}"/>`];
        for (const [x, y] of [[-HX + 3, -HY + 3], [HX - 3, -HY + 3], [-HX + 3, HY - 3], [HX - 3, HY - 3]]) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 1.4, -0.6, 0.6, P, 16), { tone: "lo" })));
        out.push(ISO.prismX(P, BODY, -HX, HX, ["#c4c8cd", "#f1f2f4"], "#eceef0", "#4a5058"));
        // the front strip's printing and the seam round the body
        out.push(`<path d="${K.pathOf([at([-HX, HY + 0.01, 1.2]), at([HX, HY + 0.01, 1.2])])}" stroke="#9aa0a7" stroke-width="0.6"/>`);
        out.push(`<g transform="${B.plane(P, [-HX, HY + 0.02, ZF], [1, 0, 0], [0, 0, -1])}">${B.text(HX, 2.2, "Max 15 kg   d = 5 g", 1, "#6a7079", "middle", 600)}</g>`);
        return out.join("");
      };
      const panel = () => {
        const s = [`<rect x="0" y="0" width="${2 * HX - 1.2}" height="${len - 0.8}" rx=".5" fill="#dfe2e6" stroke="#8a9097" stroke-width=".08"/>`];
        WINS.forEach(([x, wd]) => s.push(`<rect x="${x - 0.4}" y="${WY[0] - 0.4}" width="${wd + 0.8}" height="${WY[1] - WY[0] + 0.8}" rx=".4" fill="#2a3036"/><rect x="${x}" y="${WY[0]}" width="${wd}" height="${WY[1] - WY[0]}" rx=".2" fill="${LCD}"/>`));
        s.push(B.text(WINS[0][0] + WINS[0][1] / 2, 6.3, "WEIGHT kg", 0.95, "#3a4048"), B.text(WINS[1][0] + WINS[1][1] / 2, 6.3, "PRICE / kg", 0.95, "#3a4048"), B.text(WINS[2][0] + WINS[2][1] / 2, 6.3, "TO PAY", 0.95, "#3a4048"));
        return `<g transform="${panelM}">${s.join("")}</g>`;
      };
      const keys = () => {
        const s = [];
        for (let i = 0; i < 10; i++) { const x = 1.4 + i * 2.15; s.push(`<rect x="${x}" y="7.3" width="1.8" height="1.8" rx=".25" fill="#f7f8f9" stroke="#6a7079" stroke-width=".08"/>${B.text(x + 0.9, 8.6, String((i + 1) % 10), 0.9, "#3a4048")}`); }
        s.push(`<rect x="23.4" y="7.3" width="4.4" height="1.8" rx=".25" fill="#d2402f" stroke="#7a1d12" stroke-width=".08"/>${B.text(25.6, 8.6, "PRINT", 0.8, "#ffffff")}`);
        s.push(`<rect x="28.4" y="7.3" width="4.4" height="1.8" rx=".25" fill="#3d7fc4" stroke="#1f4f8f" stroke-width=".08"/>${B.text(30.6, 8.6, "ZERO", 0.8, "#ffffff")}`);
        return `<g transform="${panelM}">${s.join("")}</g>`;
      };
      const pan = () => {
        const out = [ISO.tinted(ISO.T.steel, S(K.cylinder(0, (PAN.y0 + PAN.y1) / 2, 2.5, ZT, 1, P, 16), { tone: "lo" }))];
        const plan = { x: PAN.x0, y: PAN.y0, w: PAN.x1 - PAN.x0, d: PAN.y1 - PAN.y0, r: 1.5 };
        out.push(ISO.tinted(ISO.T.steel, S(K.slabOf(plan, ZT + 1, 0.5, P, 6, 0.15), { tone: "mid", inner: L(K.sideSeam(plan, ZT + 1.25, P, 6), { tone: "faint" }) })));
        out.push(`<path d="${K.pathOf(K.ringOf(K.insetPlan(plan, 1.2), 6).map(([x, y]) => at([x, y, PAN.z])), true)}" fill="#eef0f2" stroke="#9aa1a8" stroke-width="0.6"/>`);
        out.push(`<path d="${[0.3, 0.5, 0.7].map((f) => K.pathOf([at([PAN.x0 + 3, PAN.y0 + (PAN.y1 - PAN.y0) * f, PAN.z + 0.01]), at([PAN.x1 - 3, PAN.y0 + (PAN.y1 - PAN.y0) * f + 2, PAN.z + 0.01])])).join("")}" stroke="#ffffff" stroke-width="${Math.max(1, G.scaleOf(P) * 0.5).toFixed(2)}" stroke-linecap="round" opacity=".7"/>`);
        return out.join("");
      };
      // the label printer: its slot in the right side; the label slides out along +x by `out` (0..1 → 0..6 cm)
      const slot = () => `<path d="${K.pathOf([at([HX + 0.01, -4, 4.2]), at([HX + 0.01, 4, 4.2]), at([HX + 0.01, 4, 5]), at([HX + 0.01, -4, 5])], true)}" fill="#1d2126" stroke="#4a5058" stroke-width="0.5"/>`;
      const labelSvg = (out, kgv, per) => {
        if (out < 0.01) return "";
        const L6 = 6.5 * out, pay = (kgv * per).toFixed(2);
        return `<g transform="${B.plane(P, [HX, -3.5, 4.6], [1, 0, 0], [0, 1, 0])}"><rect x="0" y="0" width="${L6.toFixed(2)}" height="7" fill="#fbfaf6" stroke="#8a8f96" stroke-width=".06"/>` +
          `<clipPath id="b41l${uid}"><rect x="0" y="0" width="${L6.toFixed(2)}" height="7"/></clipPath><g clip-path="url(#b41l${uid})"><g transform="translate(${(L6 - 6.5).toFixed(2)} 0)">` +
          `${B.text(0.4, 1.4, `${kgv.toFixed(3)} kg`, 0.9, "#1f2a33", "start")}${B.text(0.4, 2.6, `${per.toFixed(2)} / kg`, 0.9, "#1f2a33", "start")}${B.text(0.4, 4.3, "TO PAY", 0.8, "#1f2a33", "start", 600)}${B.text(6.1, 5.9, pay, 1.5, "#1f2a33", "end", 800)}` +
          `<path d="${[0.8, 1.0, 1.3, 1.5, 1.6].map((x, i) => `M${(3.6 + x + i * 0.35).toFixed(2)} 0.6v2`).join("")}" stroke="#1f2a33" stroke-width=".18"/></g></g></g>`;
      };
      g.innerHTML = `<g data-name="body">${body()}${slot()}</g><g data-name="display">${panel()}<g data-part="lcd"></g></g><g data-name="keys">${keys()}</g>` +
        `<g data-name="pan">${pan()}</g><g data-name="printer" data-part="label"></g><g data-part="words"></g>`;
      g.anchors = { pan: [0, (PAN.y0 + PAN.y1) / 2, PAN.z] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const kgv = st.shown, pay = Math.min(99999.99, kgv * st.perkg), key = `${kgv.toFixed(3)} ${st.perkg} ${pay.toFixed(2)}`;
        w.rebuild(el.lcd, key, () => `<g transform="${panelM}">` +
          B.seg(WINS[0][0] + WINS[0][1] - 0.5, WY[1] - 0.8, kgv.toFixed(3), 2.4, INK, GHOST, 4) +
          B.seg(WINS[1][0] + WINS[1][1] - 0.5, WY[1] - 0.8, st.perkg.toFixed(2), 2.4, INK, GHOST, 4) +
          B.seg(WINS[2][0] + WINS[2][1] - 0.5, WY[1] - 0.8, pay.toFixed(2), 2.2, INK, GHOST, 5) + `</g>`);
        const q = Math.round(st.out * 100) / 100;
        w.rebuild(el.label, `${q} ${st.printed} ${st.perkg}`, () => labelSvg(q, st.printed, st.perkg));
        if (lab) w.rebuild(el.words, "w", () => ISO.word(at([HX + 2, 0, 12]), "counter scale", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.kg !== undefined) st.kg = kgOf(p.kg, st.kg);
        if (p.perkg !== undefined) st.perkg = Math.round(B.num(p, "perkg", st.perkg, 0, 99.99) * 100) / 100;
        if (p.label !== undefined) { const on = String(p.label) === "1" ? 1 : String(p.label) === "0" ? 0 : st.label; if (on && !st.label) { st.printed = st.kg; st.out = 0; } if (!on) st.out = 0; st.label = on; }
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the weight display samples about 5 times a second and steps to the load, then holds
      let tick = 0;
      g.update = (dt) => {
        const calm = ISO.still();
        tick += dt;
        if (calm) st.shown = st.kg;
        else if (tick > 0.2) { tick = 0; st.shown = Math.abs(st.kg - st.shown) < 0.006 ? st.kg : Math.round((st.shown + (st.kg - st.shown) * 0.6) * 200) / 200; }
        if (st.label && st.out < 1) st.out = calm ? 1 : Math.min(1, st.out + dt * 0.8);
        draw();
        return st.shown !== st.kg || (st.label === 1 && st.out < 1);
      };
      g.readout = () => `scale · ${st.kg.toFixed(3)} kg × ${st.perkg.toFixed(2)} per kg = ${(st.kg * st.perkg).toFixed(2)} to pay${st.label ? " · label printed" : ""}`;
      draw();
      return g;
    },
  });
})();
