// "garment cx cy k kind=… fabric=… c=… on=hanger|flat hang=wood|wire bump=0..1 corner=0|1" — one piece of modest
// clothing, flat or on a hanger, never on a body. Painted with its fabric's brush, a thin ink line over it.
(() => {
  const FAB = "denim|silk|satin|linen|cotton|polyester|wool|cashmere|flannel|velvet|corduroy|fleece";
  const LONG = ["M380 390 Q322 420 300 520 L250 900 Q282 924 322 908 L378 610 Z", "M700 390 Q758 420 780 520 L830 900 Q798 924 758 908 L702 610 Z"];
  const SHORT = ["M380 392 Q330 416 300 480 L272 586 Q320 606 362 594 L378 520 Z", "M700 392 Q750 416 780 480 L808 586 Q760 606 718 594 L702 520 Z"];
  const TOP = "M478 330 L602 330 L618 366 L700 392 L716 640 L722 860 Q540 900 358 860 L364 640 L380 392 L462 366 Z";
  const BAND = "M458 332 Q460 348 474 350 L606 350 Q620 348 622 332 Q620 316 606 316 L474 316 Q460 316 458 332 Z";
  const KINDS = {
    dress: { body: "M478 322 L602 322 L618 366 L700 392 L735 640 L812 1250 Q540 1290 268 1250 L345 640 L380 392 L462 366 Z", sleeves: LONG, fabric: "denim", flare: 0.25, band: 1, buttons: [396, 730], fold: "M470 720 Q440 900 400 1110 M610 720 Q640 880 672 1050 M430 960 Q410 1080 380 1200 M655 1000 Q680 1100 700 1210", shade: [[470, 520, 350, 1270], [610, 520, 730, 1270], [430, 700, 300, 1260], [650, 700, 780, 1260]], hem: "M278 1232 Q540 1270 802 1232", corner: "M726 1264 L790 1160 L816 1250 Q770 1260 726 1264 Z", cuffs: 1 },
    coat: { body: "M478 322 L602 322 L618 366 L700 392 L720 700 L760 1180 Q540 1210 320 1180 L360 700 L380 392 L462 366 Z", sleeves: LONG, fabric: "wool", flare: 0.1, lapel: 1, buttons: [470, 860], fold: "M470 800 Q455 980 430 1120 M620 800 Q640 980 660 1120", shade: [[450, 700, 400, 1170], [640, 700, 690, 1170]], hem: "M330 1164 Q540 1194 750 1164", cuffs: 1 },
    shirt: { body: TOP, sleeves: LONG, fabric: "cotton", flare: 0, lapel: 1, buttons: [400, 840], fold: "M450 640 Q440 730 430 830 M635 620 Q645 720 650 830", shade: [[450, 520, 420, 860], [640, 520, 670, 860]], hem: "M368 846 Q540 884 712 846", cuffs: 1 },
    top: { body: TOP, sleeves: LONG, fabric: "silk", flare: 0, band: 1, fold: "M450 560 Q435 700 425 840 M630 560 Q645 700 655 840", shade: [[450, 480, 420, 860], [630, 480, 670, 860]], hem: "M368 846 Q540 884 712 846", cuffs: 1 },
    tshirt: { body: TOP, sleeves: SHORT, fabric: "cotton", flare: 0, crew: 1, fold: "M455 600 Q445 720 440 830 M625 600 Q640 720 648 830", shade: [[455, 500, 420, 860], [625, 500, 670, 860]], hem: "M368 846 Q540 884 712 846" },
    sweater: { body: TOP, sleeves: LONG, fabric: "wool", flare: 0, crew: 1, ribs: 1, fold: "M455 600 Q445 700 440 800 M625 600 Q640 700 648 800", shade: [[455, 500, 420, 830], [625, 500, 670, 830]] },
    fleece: { body: TOP, sleeves: LONG, fabric: "fleece", flare: 0, band: 1, zip: 860, shade: [[450, 480, 420, 860], [630, 480, 670, 860]], cuffs: 1 },
    puffer: { body: "M478 322 L602 322 L618 366 L712 392 L732 640 L738 930 Q540 966 342 930 L348 640 L368 392 L462 366 Z", sleeves: LONG, fabric: "polyester", flare: 0, band: 1, zip: 940, puff: 1 },
    jeans: { body: "M420 330 L660 330 L690 620 L720 1250 L590 1250 L540 720 L490 1250 L360 1250 L390 620 Z", sleeves: [], fabric: "denim", flare: 0, jeans: 1, shade: [[440, 720, 410, 1240], [640, 720, 670, 1240]], hem: "M366 1228 L486 1228 M594 1228 L714 1228", corner: "M612 1250 L690 1130 L720 1250 Z" },
  };
  ISO.add({
    name: "garment", title: "Piece of clothing", compare: null,
    about: "One piece of modest clothing, flat or on a hanger, never on a body: long dress, coat, shirt, top, T-shirt, sweater, fleece, puffer, jeans. corner=1 turns back a hem corner to show the pale inside (dress, jeans; named part corner). hang=wire and bump show a wire hanger pushing a shoulder out of shape.",
    line: `garment cx cy k=0.1..1 kind=dress|coat|shirt|top|tshirt|sweater|fleece|puffer|jeans fabric=${FAB} c=rose|blue|teal|mustard|cream|black|white|grey|olive|rust|plum|camel|sage|red on=hanger|flat hang=wood|wire bump=0..1 corner=0|1`,
    demo: { line: "garment 480 280 0.42 kind=sweater hang=wire", script: [{ set: { bump: 0 }, hold: 1 }, { set: { bump: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, name = Object.hasOwn(KINDS, o.kind) ? o.kind : "dress", K_ = KINDS[name];
      const fabric = P.FABRICS.includes(o.fabric) ? o.fabric : K_.fabric, col = P.colorOf(fabric, o.c);
      P.seed(23 + name.length * 13);
      const g = P.base(parent, cx, cy, k), D = P.el("g", { transform: "translate(-540 -730)" }, g);
      const flat = o.on === "flat" || name === "jeans", wire = o.hang === "wire";
      if (!flat) { const h = P.el("g", {}, D);
        P.el("path", { d: "M540 300 L540 258 Q540 236 560 230 Q580 220 566 204 Q550 192 530 208", fill: "none", stroke: "#77736c", "stroke-width": 8, "stroke-linecap": "round", class: "free", "data-free": "1" }, h);
        if (wire) P.el("path", { d: "M540 300 L350 392 L730 392 Z", fill: "none", stroke: "#77736c", "stroke-width": 7, "stroke-linejoin": "round", class: "free", "data-free": "1" }, h);
        else { const l = P.layer(h); l.stroke(540, 298, 370, 388, 21, "#a97f4f"); l.stroke(540, 298, 710, 388, 21, "#a97f4f"); l.done(); P.ink("M540 290 L364 382 L372 398 L540 310 L708 398 L716 382 Z", h, 3.6); } }
      const cloth = P.el("g", {}, D);
      for (const s of K_.sleeves) { const left = s === K_.sleeves[0]; P.brush(fabric, cloth, P.clip(cloth, s), left ? [240, 390, 380, 930] : [690, 840, 380, 930], col, { density: 0.5, down: true }); }
      const bottom = name === "jeans" || name === "dress" ? 1290 : name === "coat" ? 1215 : 970;
      const bodyClip = P.clip(cloth, K_.body);
      P.brush(fabric, cloth, bodyClip, [260, 820, 310, bottom], col, { flare: K_.flare, mid: 540, density: 0.65, down: true });
      const ov = P.layer(cloth, bodyClip);
      for (const [a, b, c, d] of K_.shade || []) { ov.stroke(a, b, c, d, 30, P.dk(col, 0.22), 0.2, 4); ov.stroke(a + 28, b + 60, c + 30, d, 16, P.lt(col, 0.3), 0.2, 4); }
      if (K_.puff) for (let y = 450; y < 950; y += 72) { ov.stroke(340, y + 30, 740, y + 30, 26, P.dk(col, 0.45), 0.45, 8); ov.stroke(340, y, 740, y, 24, P.lt(col, 0.32), 0.45, -10); }
      ov.done();
      const tr = P.layer(cloth);
      if (K_.band) tr.thread(474, 332, 606, 332, 34, P.dk(col, 0.22));
      if (K_.crew) tr.thread(482, 340, 598, 340, 22, P.dk(col, 0.18));
      if (K_.buttons && !K_.lapel) tr.stroke(540, 360, 540, K_.buttons[1], 34, P.dk(col, 0.16), 0.95);
      if (K_.lapel) { tr.stroke(540, 350, 540, K_.buttons[1] + 30, 30, P.dk(col, 0.1), 0.9); tr.stroke(470, 340, 530, 470, 44, P.dk(col, 0.2), 0.95); tr.stroke(610, 340, 550, 470, 44, P.dk(col, 0.2), 0.95); }
      if (K_.jeans) tr.stroke(420, 352, 660, 352, 44, P.dk(col, 0.2), 1);
      tr.done();
      if (K_.buttons) for (let y = K_.buttons[0]; y <= K_.buttons[1]; y += K_.lapel ? 92 : 66) P.el("circle", { cx: 540, cy: y, r: 11, fill: "#c79b52", stroke: P.INK, "stroke-width": 3 }, cloth);
      if (K_.corner && (o.corner === "1" || o.corner === 1)) { const c = P.el("g", { "data-name": "corner" }, cloth); P.el("path", { d: K_.corner, fill: P.lt(col, 0.68) }, c); }
      const bumps = P.el("g", { opacity: 0, "data-name": "bump" }, cloth), bl = P.layer(bumps);
      for (const [s, x] of [[-1, 372], [1, 708]]) { bl.stroke(x - s * 28, 432, x + s * 4, 374, 34, col, 1); bl.stroke(x - s * 14, 426, x + s * 6, 382, 12, P.lt(col, 0.3), 0.7); } bl.done();
      P.el("path", { d: "M350 420 Q352 384 376 366 Q388 392 402 402 M730 420 Q728 384 704 366 Q692 392 678 402", fill: "none", stroke: P.INK, "stroke-width": 3.4, "stroke-linecap": "round", class: "free", "data-free": "1" }, bumps);
      const lines = P.el("g", {}, D);
      P.ink(K_.body, lines, 4.6); for (const s of K_.sleeves) P.ink(s, lines, 4.6);
      if (K_.fold) P.ink(K_.fold, lines, 3.2);
      if (K_.band) P.ink(BAND, lines, 3.6);
      if (K_.crew) P.ink("M470 340 Q480 362 540 366 Q600 362 610 340 Q600 322 540 324 Q480 322 470 340 Z", lines, 3.6);
      if (K_.buttons && !K_.lapel) P.ink(`M523 350 L523 ${K_.buttons[1]} Q540 ${K_.buttons[1] + 8} 557 ${K_.buttons[1]} L557 350`, lines, 3);
      if (K_.lapel) P.ink("M478 322 L540 480 L602 322 M450 360 L505 500 L540 480 L575 500 L630 360", lines, 3.4);
      if (K_.zip) { P.el("path", { d: `M540 340 L540 ${K_.zip}`, stroke: "#c7c3ba", "stroke-width": 8, "stroke-dasharray": "5 5", fill: "none", class: "free", "data-free": "1" }, lines); P.ink(`M532 340 L532 ${K_.zip} M548 340 L548 ${K_.zip}`, lines, 2.8); }
      if (K_.ribs) { let r = ""; for (let x = 366; x < 716; x += 15) r += `M${x} 816 L${x} ${862 + (x - 366 < 175 ? (x - 366) * 0.11 : (716 - x) * 0.11)}`; for (const [a, b] of [[254, 322], [758, 826]]) for (let x = a; x < b; x += 12) r += `M${x} 860 L${x + 2} 912`; P.ink(r + "M360 816 Q540 852 720 816 M252 860 L322 860 M758 860 L828 860", lines, 2.4, false); }
      if (K_.jeans) P.ink("M420 374 L660 374 M540 374 L540 720 M450 400 Q490 470 420 480 M630 400 Q590 470 660 480 M540 374 Q570 500 540 560", lines, 3);
      if (K_.corner && (o.corner === "1" || o.corner === 1)) P.ink(K_.corner, lines, 3.4);
      const stitch = (K_.hem || "") + (K_.cuffs ? " M260 878 Q286 896 318 884 M820 878 Q794 896 762 884" : "");
      if (stitch) P.el("path", { d: stitch, fill: "none", stroke: "#e0cc9e", "stroke-width": 5, "stroke-dasharray": "15 10", class: "free", "data-free": "1" }, lines);
      const st = { bump: ISO.clamp(+o.bump || 0, 0, 1) }; let now = st.bump; bumps.setAttribute("opacity", now);
      g.set = (p) => { if (p.bump !== undefined) st.bump = ISO.clamp(+p.bump || 0, 0, 1); };
      g.update = (dt) => { now = ISO.still() ? st.bump : ISO.follow(now, st.bump, dt, 0.25); if (Math.abs(now - st.bump) < 0.004) now = st.bump; bumps.setAttribute("opacity", now.toFixed(3)); return now !== st.bump; };
      g.readout = () => `${name} in ${fabric}${flat ? ", flat" : wire ? ", wire hanger" : ", wood hanger"}`;
      return g;
    },
  });
})();
