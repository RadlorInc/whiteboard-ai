// "sharecert cx cy k shares=1..9999 lab=0 lit=frame|certificate|seal" — a PART (batch 6, economy): a framed share
// certificate hanging on a wall, its origin the wall point behind the frame's middle (the wall face is y = 0, the
// frame stands out 2 cm into the room). A 30 × 22 cm wooden moulding frame with mitred corners and a lip, a cream mat,
// the certificate behind glass: a guilloche border of interlaced waves, corner rosettes, "SHARE CERTIFICATE", a blank
// company-name panel (no brand), "this certifies that the holder owns" the number of shares in words-free digits, a
// certificate number, two signature lines and a red embossed seal with ribbon tails. Owning a piece of a company.
// Static. World: 1 = 1 cm. anchors: hook (the nail behind the top rail), front
(() => {
  const K = window.K;
  const HW = 15, HH = 11, FW = 1.8, D = 2;
  ISO.add({
    name: "sharecert", title: "Framed share certificate (part)", compare: null,
    about: "A framed share certificate on a wall: ornamental border, a blank company name panel, the number of shares, a certificate number and a red seal; owning a piece of a company; static. anchors: hook front",
    line: "sharecert cx cy k shares=1..9999 lab=0 lit=frame|certificate|seal",
    demo: { line: "sharecert 470 270 15 shares=100 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "certificate" }, hold: 1.4 }, { set: { lit: "seal" }, hold: 1.4 }, { set: { lit: "frame" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const shares = Math.round(B.num(o, "shares", 100, 1, 9999));
      const WOOD = ISO.tint("#c48a52", ["#6e3e18", "#7e4a20", "#8e582a", "#a06a38"], "#3a1e08");
      // the moulding: four rails, each a stepped prism (outer bead, lip down to the glass), corners mitred by order
      const railX = (z0, z1) => ISO.wbox(P, [-HW, HW], [0, D], [z0, z1], "mid") + ISO.wbox(P, [-HW + 0.3, HW - 0.3], [D, D + 0.25], [z0 + 0.3, z1 - 0.3], "mid");
      const railZ = (x0, x1) => ISO.wbox(P, [x0, x1], [0, D], [-HH + FW, HH - FW], "mid") + ISO.wbox(P, [x0 + 0.3, x1 - 0.3], [D, D + 0.25], [-HH + FW, HH - FW], "mid");
      const mitres = B.free(P, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => [[sx * HW, D + 0.26, sz * HH], [sx * (HW - FW), D + 0.26, sz * (HH - FW)]]), "#3a1e08", 0.5);
      const IW = HW - FW, IH = HH - FW, yA = D * 0.55;
      const mat = B.poly(P, [[-IW, yA, -IH], [IW, yA, -IH], [IW, yA, IH], [-IW, yA, IH]], "#f3ecd8", "#8a7a5a", 0.4);
      // the certificate (artwork 24 × 16 cm, x right, y down) on the mat, a 0.6 cm margin round it
      const cw = 2 * IW - 1.2, ch = 2 * IH - 1.2;
      const wave = (y0, x0, x1, ph) => { const p = []; for (let i = 0; i <= 60; i++) { const x = x0 + ((x1 - x0) * i) / 60; p.push(`${x.toFixed(2)} ${(y0 + Math.sin(i * 0.9 + ph) * 0.18).toFixed(2)}`); } return `M${p.join("L")}`; };
      const waveV = (x0, y0, y1, ph) => { const p = []; for (let i = 0; i <= 44; i++) { const y = y0 + ((y1 - y0) * i) / 44; p.push(`${(x0 + Math.sin(i * 0.9 + ph) * 0.18).toFixed(2)} ${y.toFixed(2)}`); } return `M${p.join("L")}`; };
      const m = 0.7, border = [wave(m, m, cw - m, 0), wave(m, m, cw - m, Math.PI), wave(ch - m, m, cw - m, 0), wave(ch - m, m, cw - m, Math.PI), waveV(m, m, ch - m, 0), waveV(m, m, ch - m, Math.PI), waveV(cw - m, m, ch - m, 0), waveV(cw - m, m, ch - m, Math.PI)].join("");
      const rosette = (x, y) => { let s = ""; for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; s += `<circle cx="${(x + Math.cos(a) * 0.35).toFixed(2)}" cy="${(y + Math.sin(a) * 0.35).toFixed(2)}" r=".35" fill="none" stroke="#2f6a52" stroke-width=".05"/>`; } return s + `<circle cx="${x}" cy="${y}" r=".15" fill="#2f6a52"/>`; };
      const fmt = String(shares).padStart(4, "0");
      const art = `<rect width="${cw}" height="${ch}" fill="#fbf6e6" stroke="#b9a77a" stroke-width=".06"/>` +
        `<rect x=".25" y=".25" width="${cw - 0.5}" height="${ch - 0.5}" fill="none" stroke="#2f6a52" stroke-width=".08"/>` +
        `<path d="${border}" fill="none" stroke="#2f6a52" stroke-width=".07"/>` +
        `<rect x="1.25" y="1.25" width="${cw - 2.5}" height="${ch - 2.5}" fill="none" stroke="#2f6a52" stroke-width=".05"/>` +
        rosette(m, m) + rosette(cw - m, m) + rosette(m, ch - m) + rosette(cw - m, ch - m) +
        B.text(cw / 2, 3.1, "SHARE CERTIFICATE", 1.35, "#1f4a3a", "middle", 800, "Georgia,serif") +
        `<rect x="${cw / 2 - 6}" y="3.9" width="12" height="1.7" rx=".2" fill="#efe6cc" stroke="#9a8a5a" stroke-width=".05"/>` + B.text(cw / 2, 5.05, "COMPANY NAME", 0.7, "#9a8a5a", "middle", 700) +
        B.text(cw / 2, 7.0, "this certifies that the holder owns", 0.62, "#3a4a42", "middle", 500, "Georgia,serif") +
        `<rect x="${cw / 2 - 4.2}" y="7.6" width="8.4" height="2.2" fill="#ffffff" stroke="#2f6a52" stroke-width=".07"/>` + B.text(cw / 2, 9.3, `${shares}`, 1.5, "#1f4a3a", "middle", 800) +
        B.text(cw / 2, 10.8, "shares of the company", 0.62, "#3a4a42", "middle", 500, "Georgia,serif") +
        B.text(2, 2.6, `No. ${fmt}`, 0.6, "#8a2a22", "start", 700) +
        `<path d="M2.2 13.2H8.2M${cw - 8.2} 13.2H${cw - 2.2}" stroke="#3a4a42" stroke-width=".05"/>` +
        `<path d="M2.6 12.9c.8-.9 1.4.5 2.1-.2s1.2-.4 1.9-.1" fill="none" stroke="#2a3a8a" stroke-width=".06"/>` +
        B.text(5.2, 13.9, "director", 0.48, "#5a6058", "middle", 500) + B.text(cw - 5.2, 13.9, "secretary", 0.48, "#5a6058", "middle", 500);
      const cert = B.front(P, [-IW + 0.6, yA + 0.01, IH - 0.6], art);
      // the seal, a little proud: ribbon tails, then the red wafer with its scalloped edge and pressed ring
      const sx = cw * 0.5, sy = 12.7, scal = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 1.05 : 1.2; scal.push(`${(sx + Math.cos(a) * r).toFixed(2)} ${(sy + Math.sin(a) * r).toFixed(2)}`); }
      const seal = B.front(P, [-IW + 0.6, yA + 0.05, IH - 0.6],
        `<path d="M${sx - 0.4} ${sy}l-.7 2.4l.55-.3l.35.5l.4-2.4zM${sx + 0.4} ${sy}l.7 2.4l-.55-.3l-.35.5l-.4-2.4z" fill="#b8302a" stroke="#6a1410" stroke-width=".05"/>` +
        `<path d="M${scal.join("L")}Z" fill="#c8352a" stroke="#6a1410" stroke-width=".06"/><circle cx="${sx}" cy="${sy}" r=".75" fill="none" stroke="#8a2018" stroke-width=".08"/><circle cx="${sx}" cy="${sy}" r=".45" fill="#d8544a"/>`);
      // the glass in front of it all: a faint sheet with two diagonal glints
      const yG = D - 0.2;
      const glass = B.poly(P, [[-IW, yG, -IH], [IW, yG, -IH], [IW, yG, IH], [-IW, yG, IH]], "#dfeef6", "none", 0, ' fill-opacity=".14"') +
        B.free(P, [[[-IW + 2, yG, IH - 1], [-IW + 6, yG, IH - 6]], [[-IW + 3.5, yG, IH - 1], [-IW + 5.5, yG, IH - 3.5]]], "#ffffff", 1.2, ' opacity=".7" stroke-linecap="round"');
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HW - 0.8, y: 0, w: 2 * HW + 1.6, d: D + 0.8, r: 0.4 }, -HH - 0.8, 2 * HH + 1.6, P)}"/>` +
        `<g data-name="frame">${ISO.tinted(WOOD, railX(HH - FW, HH) + railZ(-HW, -HW + FW))}</g><g data-name="certificate">${mat}${cert}</g><g data-name="seal">${seal}</g>` +
        `<g data-name="frame">${glass}${ISO.tinted(WOOD, railZ(HW - FW, HW) + railX(-HH, -HH + FW))}${mitres}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = B.word(P, [HW + 0.6, D, 3], "share certificate") + B.word(P, [HW + 0.6, D, 0], `${shares} shares`, { size: 12, color: "#667" });
      g.anchors = { hook: [0, 0, HH - FW / 2], front: [0, D + 0.25, 0] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `share certificate · ${shares} share${shares === 1 ? "" : "s"} · a part of the company`;
      B.light(w, g, lit);
      return g;
    },
  });
})();
