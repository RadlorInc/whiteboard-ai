// Shared parts for Anatomy-style whiteboard recipes. Loaded after the kit (window.K), the lathe (window.G) and the
// player's recipes.js (mk, label, TXT). Every recipe file calls ISO.add({...}); see README.md for the contract.
(() => {
  const K = window.K;
  const ISO = (window.ISO = { all: {}, order: [] });

  // ── registry
  // A recipe: { name, line, about, compare?, steps?, demo: [{ set, hold }], make(args, o, t, parent) → g }.
  // g.set(params) changes targets; g.update(dt, clock) moves toward them and returns true while anything still moves.
  // A build split into parts: inside make, ISO.later(fn) keeps fn for later instead of running it. make returns with
  // g.rest = the parts left; the player runs them one per idle slice before the element is shown (each must fit the
  // build budget on its own), or g.finish() runs them all at once (poster, seek). Until then g.update runs one part per
  // frame, so a caller that never looks at g.rest still gets the whole drawing. Outside a make, fn runs at once.
  let laterQueue = null;
  ISO.later = (fn) => (laterQueue ? laterQueue.push(fn) : fn());
  ISO.add = (r) => {
    const make = r.make, clean = ISO.cleaner(r.line), demo = ISO.parse(r.demo.line).n;
    // Everything a script sends passes through clean(): its line says which keys are numbers, ranges or lists.
    r.make = function (n = [], o = {}, t = "", parent) {
      const ok = (v) => v !== "" && v != null && Number.isFinite(+v);
      const args = Array.from({ length: Math.max(n.length, demo.length) }, (_, i) => (ok(n[i]) ? +n[i] : demo[i])).filter((v) => v !== undefined);
      const outer = laterQueue, rest = (laterQueue = []);
      let g;
      try { g = make.call(this, args, clean(o || {}), ISO.esc(t), parent); }   // recipes put the text into SVG markup
      finally { laterQueue = outer; }
      if (!g) return g;
      ISO.only(g, o && o.only);
      if (g.set) { const set = g.set; g.set = (p) => set(clean(p || {})); }
      g.rest = rest;
      g.finish = () => { while (g.rest.length) g.rest.shift()(); };
      if (rest.length) { const up = g.update; g.update = (dt, clock) => { if (g.rest.length) g.rest.shift()(); return (up ? up(dt, clock) : false) || g.rest.length > 0; }; }
      return g;
    };
    // the workshop file that defined it (preview.html starts each recipe's script with "/* <file> */"), for export.mjs
    r.file = /^\/\* (\S+) \*\//.exec(document.currentScript?.textContent || "")?.[1];
    ISO.all[r.name] = r; ISO.order.push(r.name); window.RECIPES[`${r.name}Iso`] = r.make;
  };
  // only=a,b (never "|": it starts a line's text): show just those named parts (data-name groups, the line's lit= names) of a recipe, so a script
  // can use one piece of a big drawing (the burner of a distillation, the battery of a circuit). A CSS rule, so parts a
  // recipe rebuilds as it moves stay hidden; defs (clips, gradients) keep working. Names that are not a-z0-9- are dropped.
  let onlyN = 0;
  ISO.only = (g, spec) => {
    const names = String(spec || "").split(/[|,]/).filter((s) => /^[a-z0-9-]+$/i.test(s));
    if (!names.length || !g.querySelector) return;
    const cls = `iso-only${onlyN++}`, keep = names.map((s) => `[data-name="${s}"]`).join(",");
    g.classList.add(cls);
    const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
    st.textContent = `.${cls} :not(defs,defs *,style,${keep},:is(${keep}) *,:has(${keep})){display:none}`;
    g.insertBefore(st, g.firstChild);
    g.only = names;
  };
  // A key whose example is a number takes only finite numbers; "a-b" / "a..b" clamps into that range; a list of two or
  // more words ("k=open|closed") takes only those words. Anything else (free text, colours, lit names) passes.
  ISO.cleaner = (line) => {
    const rules = {};
    for (const [, k, spec] of line.matchAll(/\b([a-z][a-z0-9]*)=(\S*)/g)) {
      if (spec.includes("…") && spec !== "…") continue;   // "Mon-AM…Sun-PM", "tube1|…|rack": a pattern, not a list
      const range = spec.match(/^(-?\d*\.?\d+)(?:-|\.\.|–)(-?\d*\.?\d+)$/);
      const opts = spec.split("|").flatMap((x) => { const r = x.match(/^(\d+)-(\d+)$/); return r ? Array.from({ length: +r[2] - +r[1] + 1 }, (_, i) => String(+r[1] + i)) : [x]; });   // "1-5" in a list = 1,2,3,4,5
      const open = spec.match(/^(-?\d*\.?\d+)\.\.$/);
      if (range) rules[k] = { lo: Math.min(+range[1], +range[2]), hi: Math.max(+range[1], +range[2]) };
      else if (open) rules[k] = { lo: +open[1], hi: Infinity };
      else if (/^[a-zμ°]+\/[a-z]+$/i.test(spec)) rules[k] = { num: true };   // a unit for a number, e.g. rate=mL/h
      else if (/^-?\d*\.?\d+$/.test(spec) || /^(deg|cm|mm|m|N|kg|g|s|ms|x|n|°|…|\.\.\.)$/.test(spec)) rules[k] = { num: true };
      else if (opts.length > 1 && opts.every((x) => /^-?\d*\.?\d+$/.test(x))) rules[k] = { lo: Math.min(...opts.map(Number)), hi: Math.max(...opts.map(Number)) };
      else if (opts.length > 1 && k !== "lit" && k !== "c" && opts.every((x) => /^[a-z0-9][a-z0-9.-]*$/i.test(x))) rules[k] = { one: new Set(opts) };
    }
    return (p) => {
      const out = {};
      for (const [k, v] of Object.entries(p)) {
        const rule = rules[k];
        if (/^[+-]?(nan|infinity)$/i.test(String(v))) continue;   // never a value, wherever it would land (a label: "NaN solution")
        if (String(v) in {}) continue;   // __proto__, constructor…: a table lookup (COL[o.c]) would find the object itself
        if (!rule) { out[k] = v; continue; }
        if (rule.one) { if (rule.one.has(String(v))) out[k] = v; continue; }
        const x = typeof v === "number" ? v : v === "" || v == null ? NaN : +v;
        if (!Number.isFinite(x)) continue;
        out[k] = rule.lo !== undefined ? String(Math.min(rule.hi, Math.max(rule.lo, x))) : String(x);
      }
      return out;
    };
  };
  ISO.parse = (line) => {
    const [head, text] = line.split("|").map((s) => s?.trim());
    const parts = head.split(/\s+/), type = parts.shift(), n = [], o = {};
    for (const p of parts) p.includes("=") ? (o[p.split("=")[0]] = p.split("=")[1]) : n.push(+p);
    return { type, n, o, text: text || "" };
  };

  // ── numbers and motion
  ISO.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  ISO.smooth = (a, b, x) => { const t = ISO.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  ISO.ease = (t) => ISO.smooth(0, 1, t);
  ISO.follow = (x, target, dt, tau, calm) => (calm ? target : Math.abs(target - x) < 1e-3 ? target : x + (target - x) * (1 - Math.exp(-dt / tau)));
  ISO.num = (o, key, fallback) => (o[key] !== undefined && o[key] !== "" && Number.isFinite(+o[key]) ? +o[key] : fallback);
  // The app's player sets ISO.hold (a seek, a poster, Lite mode, the end of a video: every recipe at its end pose) and
  // ISO.lite (no WebGL: the SVG drawing of each effect instead); the workshop leaves them unset.
  ISO.hold = () => false;
  ISO.lite = () => false;
  ISO.still = () => ISO.hold() || matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── tones: a set of kit tokens for a tinted part (colour that means something: blood, rubber, paint, load vs effort)
  ISO.tint = (top, shades, edge) =>
    `--anatomy-paper:${top};--anatomy-top:${top};--anatomy-face:${top};--anatomy-lit-top:${top};--anatomy-lit-shade:${shades[2]};` +
    shades.map((c, i) => `--anatomy-shade-${i}:${c}`).join(";") + `;--anatomy-hi:${edge};--anatomy-mid:${edge};--anatomy-lit:${edge};--anatomy-lo:${edge}aa;--anatomy-faint:${edge}55`;
  ISO.tinted = (style, svg) => (style ? `<g style="${style}">${svg}</g>` : svg);
  ISO.T = {
    rubber: ISO.tint("#55575c", ["#2a2b2f", "#34353a", "#3e3f44", "#48494e"], "#121214"),
    steel: ISO.tint("#d9dadd", ["#8d9096", "#a2a5ab", "#b6b9be", "#c7c9cd"], "#3c3f45"),
    paint: ISO.tint("#dfe9f4", ["#9fb4cc", "#b3c5d9", "#c6d5e5", "#d5e1ee"], "#33506f"),
    road: ISO.tint("#c9c9c6", ["#9d9d9a", "#a9a9a6", "#b5b5b2", "#bfbfbc"], "#5f5f5c"),
    wood: ISO.tint("#f7e8d0", ["#d9b483", "#e2c398", "#e9d0ad", "#f0dcbf"], "#7a5a2e"),
    blue: ISO.tint("#e6f1fd", ["#a7c9ee", "#bad6f2", "#cde2f6", "#dae9f9"], "#1f4f8f"),
    red: ISO.tint("#fde8e5", ["#eea59c", "#f3b8b0", "#f7cac4", "#fad8d3"], "#8f2a22"),
    brass: ISO.tint("#f6e7bf", ["#c9a85a", "#d6b96f", "#e2c986", "#eed8a0"], "#6b5114"),
    copper: ISO.tint("#f7d9c4", ["#c98258", "#d6956d", "#e2a985", "#edbd9e"], "#6e3a1c"),
    glass: ISO.tint("#eef6fb", ["#c9dde9", "#d4e5ef", "#dfecf4", "#e8f2f8"], "#5d7f96"),
    plastic: ISO.tint("#3a3e44", ["#1f2226", "#272a2f", "#2f3338", "#363a40"], "#0d0e10"),
    green: ISO.tint("#e3f3df", ["#9fcf95", "#b2d9a9", "#c5e3be", "#d5ebd0"], "#2c6a22"),
    amber: ISO.tint("#fdf0d8", ["#efc27a", "#f3cf91", "#f6dca9", "#f9e6c0"], "#8a5a10"),
  };

  // ── words: plain labels, as the whiteboard has them (Anatomy keeps words out; teaching needs names)
  // A thin board-coloured outline behind the letters keeps a label readable where it crosses a drawing.
  // Words can come from the script (the AI's text): escape them, so "F < W" draws and no markup gets into the SVG.
  // Leaves an entity that is already there alone, so text escaped once at the door is not escaped twice.
  ISO.esc = (t) => String(t ?? "").replace(/&(?![a-z]+;|#\d+;)/gi, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // --iso-label on any parent scales every label (a player that shrinks a recipe into a box keeps its words readable)
  // ISO.T9N[ISO.LANG] translates a label written in English (a Dutch video: reviewed strings only, see t9n/); a label
  // under 14 is "minor" (iso-minor), which the player hides in Lite mode on a narrow board.
  // A key is the English label with each number as "#" ("wire # °C · sags # m"); its translation has the same "#"s,
  // which take the numbers back in order. ISO.seen (when set) collects every key drawn (t9n.mjs).
  ISO.LANG = "en"; ISO.T9N = {}; ISO.seen = null;
  const NUM = /-?\d+(?:[.,]\d+)?/g;
  ISO.say = (text) => {
    const s = String(text ?? ""), key = s.replace(NUM, "#");
    ISO.seen?.add(key);
    const t = ISO.T9N[ISO.LANG]?.[key];
    if (t == null) return s;
    const nums = (s.match(NUM) || []).map((n) => (ISO.LANG === "nl" ? n.replace(".", ",") : n));   // Dutch: a decimal comma
    let i = 0; return t.replace(/#/g, () => nums[i++] ?? "#");
  };
  ISO.word = (at, text, color = "#444", { anchor = "middle", size = 16, dy = 0, halo = true } = {}) =>
    `<text${size < 14 ? ' class="iso-minor"' : ""} x="${at[0].toFixed(1)}" y="${(at[1] + dy).toFixed(1)}" text-anchor="${anchor}" fill="${color}" style="font:600 calc(${size}px * var(--iso-label, 1)) 'Helvetica Neue',Arial,sans-serif${halo ? ";paint-order:stroke;stroke:#fdfdfb;stroke-width:calc(3px * var(--iso-label, 1));stroke-linejoin:round" : ""}">${ISO.esc(ISO.say(text))}</text>`;

  // ── solids beyond the kit's floor prisms
  ISO.hullOf = (points) => {
    const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (list) => list.reduce((h, q) => { while (h.length > 1 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop(); h.push(q); return h; }, []);
    const lo = half(p), hi = half([...p].reverse());
    return [...lo.slice(0, -1), ...hi.slice(0, -1)];
  };
  const viewOf = (P) => { const d0 = K.depthOf([0, 0, 0], P); return [K.depthOf([1, 0, 0], P) - d0, K.depthOf([0, 1, 0], P) - d0, K.depthOf([0, 0, 1], P) - d0]; };
  ISO.BOX_F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];

  // A convex solid from world points and faces, in the kit's own classes so it shades and lights like kit parts.
  ISO.poly = (V, F, P, tone = "mid", lit = false) => {
    const at = V.map((v) => K.iso(v, P)), view = viewOf(P);
    const mid = V.reduce((s, v) => s.map((x, i) => x + v[i] / V.length), [0, 0, 0]);
    const { sinA, cosA } = K.cameraOf(P);
    const shades = [[], [], [], []], tops = [], seen = new Map();
    for (const face of F) {
      const [a, b, c] = face.map((i) => V[i]);
      const u = b.map((x, i) => x - a[i]), w = c.map((x, i) => x - a[i]);
      let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const fc = face.reduce((s, i) => s.map((x, j) => x + V[i][j] / face.length), [0, 0, 0]);
      if (n.reduce((s, x, i) => s + x * (fc[i] - mid[i]), 0) < 0) n = n.map((x) => -x);
      const len = Math.hypot(...n) || 1;
      n = n.map((x) => x / len);
      if (n[0] * view[0] + n[1] * view[1] + n[2] * view[2] <= 1e-6) continue;
      const d = K.pathOf(face.map((i) => at[i]), true);
      const kind = n[2] > 0.75 ? "top" : "side";
      if (kind === "top") tops.push(d);
      else {
        const h = Math.hypot(n[0], n[1]) || 1;
        shades[Math.max(0, Math.min(3, Math.floor((((n[0] / h) * -sinA + (n[1] / h) * cosA + 1) / 2) * 4)) || 0)].push(d);   // rounding can dip below -1; a NaN normal draws in shade 0
      }
      face.forEach((i, k) => {
        const j = face[(k + 1) % face.length], key = i < j ? `${i},${j}` : `${j},${i}`;
        seen.set(key, [...(seen.get(key) || []), kind]);
      });
    }
    const crease = [], edges = [];
    for (const [key, kinds] of seen) {
      if (kinds.length < 2) continue;
      const [i, j] = key.split(",").map(Number);
      (kinds.includes("top") ? crease : edges).push(K.pathOf([at[i], at[j]]));
    }
    const hull = K.pathOf(ISO.hullOf(at), true);
    return `<g class="iso-solid"${lit ? " data-lit" : ""}><path class="iso-fill" d="${hull}"/>${shades
      .map((s, i) => (s.length ? `<path class="iso-shade" data-shade="${i}" d="${s.join("")}"/>` : ""))
      .join("")}<path class="iso-top" d="${tops.join("")}"/><path class="iso-line iso-crease" data-tone="faint" d="${crease.join("")}"/><path class="iso-line iso-edge" data-tone="${tone}" d="${edges.join("")}${hull}"/></g>`;
  };
  // A box from eight points produced by a frame function at(u, w, y), spanning u0..u1, w0..w1, y0..y1.
  ISO.box = (at, P, [u0, u1], [w0, w1], [y0, y1], tone = "mid", lit = false) =>
    ISO.poly([[u0, w0, y0], [u1, w0, y0], [u1, w0, y1], [u0, w0, y1], [u0, w1, y0], [u1, w1, y0], [u1, w1, y1], [u0, w1, y1]].map(([u, w, y]) => at(u, w, y)), ISO.BOX_F, P, tone, lit);
  // An axis-aligned box in world coordinates.
  ISO.wbox = (P, [x0, x1], [y0, y1], [z0, z1], tone = "mid", lit = false) => ISO.box((u, w, y) => [u, y, w], P, [x0, x1], [z0, z1], [y0, y1], tone, lit);

  // A prism along y with any outline in x–z (concave allowed), its sides shaded smoothly by facing: wings, bodies,
  // brackets, anything cut from a sheet that stands on edge. colors = [dark, light] for the sides.
  ISO.prismY = (P, pts, y0, y1, [dark, light], face, ink, extra = "") => {
    const view = viewOf(P);
    const F = pts.map(([x, z]) => K.iso([x, y1, z], P)), B = pts.map(([x, z]) => K.iso([x, y0, z], P));
    let area = 0;
    pts.forEach(([x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length]; area += x * z2 - x2 * z; });
    const n = pts.length, quads = [], vis = [];
    for (let i = 0; i < n; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n], len = Math.hypot(bx - ax, bz - az) || 1;
      let nx = (bz - az) / len, nz = -(bx - ax) / len;
      if (area < 0) { nx = -nx; nz = -nz; }
      vis[i] = nx * view[0] + nz * view[2] > 1e-6;
      if (!vis[i]) continue;
      const lit = ISO.clamp(0.5 + 0.5 * (nx * -0.45 + nz * 0.82), 0, 1);
      quads.push({ k: K.depthOf([(ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2], P), i, fill: `color-mix(in srgb, ${light} ${Math.round(lit * 100)}%, ${dark})` });
    }
    quads.sort((a, b) => a.k - b.k);
    const edge = [];
    for (let i = 0; i < n; i++) {
      if (vis[i]) edge.push(K.pathOf([B[i], B[(i + 1) % n]]));
      if (vis[i] !== vis[(i + n - 1) % n]) edge.push(K.pathOf([F[i], B[i]]));
    }
    return quads.map(({ i, fill }) => `<path d="${K.pathOf([F[i], F[(i + 1) % n], B[(i + 1) % n], B[i]], true)}" fill="${fill}" stroke="${fill}" stroke-width="0.6"/>`).join("") +
      `<path d="${edge.join("")}" fill="none" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/><path d="${K.pathOf(F, true)}" fill="${face}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>${extra}`;
  };
  // The same along x, with the outline in y–z: parts seen end-on from the +x side (a bracket, a bottle, a jaw).
  ISO.prismX = (P, pts, x0, x1, [dark, light], face, ink) => {
    const view = viewOf(P);
    const F = pts.map(([y, z]) => K.iso([x1, y, z], P)), B = pts.map(([y, z]) => K.iso([x0, y, z], P));
    let area = 0;
    pts.forEach(([y, z], i) => { const [y2, z2] = pts[(i + 1) % pts.length]; area += y * z2 - y2 * z; });
    const n = pts.length, quads = [], vis = [];
    for (let i = 0; i < n; i++) {
      const [ay, az] = pts[i], [by, bz] = pts[(i + 1) % n], len = Math.hypot(by - ay, bz - az) || 1;
      let ny = (bz - az) / len, nz = -(by - ay) / len;
      if (area < 0) { ny = -ny; nz = -nz; }
      vis[i] = ny * view[1] + nz * view[2] > 1e-6;
      if (!vis[i]) continue;
      const lit = ISO.clamp(0.5 + 0.5 * (ny * 0.35 + nz * 0.82), 0, 1);
      quads.push({ k: K.depthOf([(x0 + x1) / 2, (ay + by) / 2, (az + bz) / 2], P), i, fill: `color-mix(in srgb, ${light} ${Math.round(lit * 100)}%, ${dark})` });
    }
    quads.sort((a, b) => a.k - b.k);
    const edge = [];
    for (let i = 0; i < n; i++) {
      if (vis[i]) edge.push(K.pathOf([B[i], B[(i + 1) % n]]));
      if (vis[i] !== vis[(i + n - 1) % n]) edge.push(K.pathOf([F[i], B[i]]));
    }
    const end = view[0] > 0 ? `<path d="${K.pathOf(F, true)}" fill="${face}" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>` : "";
    return quads.map(({ i, fill }) => `<path d="${K.pathOf([F[i], F[(i + 1) % n], B[(i + 1) % n], B[i]], true)}" fill="${fill}" stroke="${fill}" stroke-width="0.6"/>`).join("") +
      `<path d="${edge.join("")}" fill="none" stroke="${ink}" stroke-width="0.9" stroke-linejoin="round"/>${end}`;
  };
  ISO.arc = (cx, cz, r, a0, a1, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
  // A plain stroke between world points (a seam, a shut line, a rule) in a given colour.
  ISO.seam = (P, pts, color = "#33506f", w = 0.9, closed = false) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), closed)}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
  // A transform that draws flat 2D artwork (x right, y down, in `scale` world units per unit) in the plane y = y0.
  ISO.faceMatrix = (P, [ox, y0, oz], scale = 1) => {
    const o = K.iso([ox, y0, oz], P), a = K.iso([ox + scale, y0, oz], P), b = K.iso([ox, y0, oz - scale], P);
    return `matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})`;
  };
  // Points along an SVG path, evenly spaced by length (for reusing a whiteboard recipe's own shapes as outlines).
  // Absolute M/L/C/Z paths are walked in JS: measuring through the DOM forced a style pass of the whole page per call
  // (heartsection spent 70% of its build there). Anything else still goes through the DOM.
  let probe;
  ISO.sample = (d, n) => {
    const tok = d.match(/[MLCZ]|-?[\d.]+(?:e-?\d+)?/g) || [];
    if (tok.join("").length && /^[\sMLCZ\d.,e-]+$/.test(d)) {
      const pts = []; let i = 0, cmd = "", cur = [0, 0], start = [0, 0];
      const num = () => +tok[i++];
      while (i < tok.length) {
        if (/[MLCZ]/.test(tok[i])) cmd = tok[i++];
        if (cmd === "Z") { pts.push(start); cur = start; continue; }
        if (cmd === "M") { cur = start = [num(), num()]; pts.push(cur); cmd = "L"; continue; }
        if (cmd === "L") { cur = [num(), num()]; pts.push(cur); continue; }
        const [a, b, c] = [[num(), num()], [num(), num()], [num(), num()]], p0 = cur;
        for (let k = 1; k <= 64; k++) { const t = k / 64, u = 1 - t; pts.push([u * u * u * p0[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * c[0], u * u * u * p0[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * c[1]]); }
        cur = c;
      }
      const acc = [0];
      for (let k = 1; k < pts.length; k++) acc.push(acc[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      const len = acc.at(-1), out = [];
      for (let j = 0, k = 1; j < n; j++) {
        const at = (j / n) * len;
        while (k < pts.length - 1 && acc[k] < at) k++;
        const f = acc[k] > acc[k - 1] ? (at - acc[k - 1]) / (acc[k] - acc[k - 1]) : 0;
        out.push([pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f]);
      }
      return out;
    }
    if (!probe) { probe = document.createElementNS("http://www.w3.org/2000/svg", "svg"); probe.style.cssText = "position:absolute;width:0;height:0"; document.body.append(probe); }
    const p = mk("path", { d }, probe), len = p.getTotalLength(), out = [];
    for (let i = 0; i < n; i++) { const q = p.getPointAtLength((i / n) * len); out.push([q.x, q.y]); }
    p.remove();
    return out;
  };

  // ── common furniture
  // A base board on four feet with a groove, corner screws and an optional ruler strip along the front.
  ISO.baseboard = (P, plan, { h = 8, feet = 4, ruler = null, tint = "" } = {}) => {
    const S = (paths, style) => K.solidSvg(paths, style), L = (d, style) => K.lineSvg(d, style), D = (pts, style) => K.dotsSvg(pts, style);
    const top = 0, bottom = -h - feet;
    const out = [`<path class="iso-halo" d="${K.haloOf(plan, bottom, h + feet, P)}"/>`];
    const corners = [...K.corners(plan, Math.min(16, plan.d / 4))].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    for (const [x, y] of corners) out.push(S(K.cylinder(x, y, 6.4, bottom, 1.4, P, 28), { tone: "lo" }), S(K.cylinder(x, y, 5, bottom + 1.4, feet - 1.4, P, 28), { tone: "mid" }));
    out.push(S(K.slabOf(plan, -h, h, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(plan, -h / 2 + 1, P, 8), { tone: "faint" }) }));
    out.push(L(K.planOutline(K.insetPlan(plan, 4), top, P), { tone: "faint" }));
    const screws = K.corners(plan, 9);
    out.push(L(screws.map(([x, y]) => K.ring(x, y, 2, top, P, 14)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => K.iso([x, y, top], P)), { size: 0.5 }));
    if (ruler) {
      const strip = { x: plan.x + 14, y: plan.y + plan.d - 14, w: plan.w - 28, d: 7, r: 1 };
      out.push(S(K.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
      const t = K.topTicks(strip.x + 6, strip.x + strip.w - 6, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
      out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
      if (ruler.zero !== undefined) out.push(L(K.lineOnTop([ruler.zero, strip.y + 0.8], [ruler.zero, strip.y + 5.4], 0.6, P), { tone: "hi" }));
      out.push(D([K.iso([strip.x + 2.5, strip.y + 3.5, 0.6], P), K.iso([strip.x + strip.w - 2.5, strip.y + 3.5, 0.6], P)], { size: 0.45 }));
    }
    return ISO.tinted(tint, out.join(""));
  };
  // A maker's plate: a thin slab with an inset outline, three rule lines and two pins.
  ISO.plate = (P, plan) => {
    const L = (d, style) => K.lineSvg(d, style);
    const out = [K.solidSvg(K.slabOf(plan, 0, 0.8, P, 3), { tone: "lo", crease: "none" }), L(K.planOutline(K.insetPlan(plan, 1.6), 0.8, P, 3), { tone: "faint" })];
    const x0 = plan.x + 6, x1 = plan.x + plan.w - 6, rows = [0.3, 0.5, 0.7].map((f) => plan.y + plan.d * f);
    rows.forEach((y, i) => out.push(L(K.lineOnTop([x0, y], [x1 - (x1 - x0) * [0, 0.25, 0.5][i], y], 0.8, P), { tone: "lo", free: true })));
    out.push(K.dotsSvg([K.iso([plan.x + 2, plan.y + 2, 0.8], P), K.iso([plan.x + plan.w - 2, plan.y + plan.d - 2, 0.8], P)], { size: 0.4 }));
    return out.join("");
  };

  // ── the live loop's writer: touch the DOM only where something changed
  ISO.writer = () => {
    const attr = (e, name, v) => { if (e.getAttribute(name) !== v) e.setAttribute(name, v); };
    const shown = (e, on) => { const v = on ? "" : "hidden"; if (e.style.visibility !== v) e.style.visibility = v; };
    const rebuild = (e, key, svg) => { if (e._key !== key) { e._key = key; e.innerHTML = svg(); e._fresh = true; } };
    // Light the parts in `on` and unlight the rest of `all`; only where the state changed or the part was rebuilt.
    const light = (all, on) => {
      for (const part of all) {
        const want = on.includes(part);
        if (part._lit === want && !part._fresh) continue;
        part._lit = want; part._fresh = false;
        part.classList.toggle("tc-lit", want);
        part.querySelectorAll(".iso-solid").forEach((n) => n.toggleAttribute("data-lit", want));
      }
    };
    return { attr, shown, rebuild, light };
  };
  // Re-append items far to near when their order changes (items: { id: element }, anchors: { id: world point }).
  ISO.sorter = (P, parent) => {
    let order = "";
    return (items, anchors) => {
      const ids = Object.keys(items).sort((a, b) => K.depthOf(anchors[a], P) - K.depthOf(anchors[b], P));
      const key = ids.join();
      if (key !== order) { order = key; for (const id of ids) parent.append(items[id]); }
    };
  };
  // ── WebGL inside the drawing (the skill's references/webgl.md), for what lines can't draw: flame, exhaust, steam,
  // light landing on a surface. The board is paper, so every effect is ink solved from the colour the paper should
  // show (inkFor), stacked with over() and finished with a gated dither. Everything is in world space.
  ISO.FX = `
vec4 over(vec4 top,vec4 under){return top+under*(1.-top.a);}
vec4 inkFor(vec3 seen,float cover){vec3 ab=clamp(1.-seen,0.,1.);float a=max(max(ab.r,max(ab.g,ab.b)),cover);return vec4(vec3(a)-ab,a);}
vec4 finish(vec4 c){c=clamp(c,0.,1.);c.rgb=min(c.rgb,vec3(c.a));
  float n=(hash12(gl_FragCoord.xy+fract(uTime*.61)*91.)+hash12(gl_FragCoord.yx*1.37+fract(uTime*.37)*57.)-1.)/255.;
  return max(c+n*smoothstep(0.,1.5/255.,c.a),0.);}
// This pixel's ray against the axis O + s·D: x = signed distance from the axis, y = s where the ray passes closest.
// The camera is orthographic, so this is exact; a body round the axis reads as a chord through it at that height.
vec2 axisOf(vec2 vb,vec3 O,vec3 D){vec3 V=towardViewer();vec3 w=rayOf(vb)-O;float b=dot(V,D);float d=dot(V,w);float e=dot(D,w);
  float den=max(1.-b*b,1e-4);float t=(b*e-d)/den;float s=(e-b*d)/den;return vec2(dot(w+t*V-s*D,normalize(cross(D,V))),s);}
// Screen distance to a world point over uK = the ray's true distance to it.
float ballOf(vec2 vb,vec3 c){return length(vb-project(c))/uK;}
// A flame standing on O along D, L its length scale. air 0 = luminous yellow (tall, wavy, a cream core over a blue
// root), 1 = roaring blue (short, translucent, with a bright inner cone). The two are crossfaded as finished inks.
// flameUS is the same flame by (distance from its axis, height along it), for a flame seen some other way (an image).
vec4 flameUS(float u,float s,float L,float air,float t){
  float fl=1.+.05*sin(t*17.)+.04*sin(t*29.);
  float hy=L*(1.25+.9*(1.-air))*fl,h=s/hy,hc=clamp(h,0.,1.);
  float sway=(noise2(vec2(h*2.2-t*3.1,1.7))-.5)*L*.26*hc*hc;
  float ry=L*.2*sin(3.1416*pow(hc,.55))*(1.-.3*hc)*(1.+.22*(noise2(vec2(h*6.-t*8.,u*.2))-.5)*hc);
  float qy=clamp(1.-pow((u-sway)/max(ry,.01),2.),0.,1.)*window(h,0.,1.,.03);
  vec3 body=mix(vec3(1.,.55,.14),vec3(1.,.82,.3),smoothstep(.15,.7,qy));
  body=mix(body,vec3(1.,.95,.8),smoothstep(.72,.97,qy)*(1.-smoothstep(.25,.65,h)));
  body=mix(vec3(.5,.62,1.),body,smoothstep(.04,.13,h));
  body=mix(body,vec3(1.,.5,.18),smoothstep(.6,1.,h));
  vec4 yel=inkFor(mix(vec3(1.),body,smoothstep(0.,.3,qy)),.45*smoothstep(.65,.95,qy)*(1.-hc))*mix(1.,.55,smoothstep(.55,1.,h));
  float hb=L*(1.+.25*air)*fl,g=s/hb,gc=clamp(g,0.,1.);
  float rb=L*.17*sin(3.1416*pow(gc,.55))*(1.-.25*gc);
  float qb=clamp(1.-pow(u/max(rb,.01),2.),0.,1.)*window(g,0.,1.,.03);
  float hi=L*.42*fl,c=s/hi,cc=clamp(c,0.,1.);
  float ri=L*.1*sin(3.1416*pow(cc,.6));
  float qi=clamp(1.-pow(u/max(ri,.01),2.),0.,1.)*window(c,0.,1.,.04);
  float shell=qi*(1.-smoothstep(.55,1.,qi));
  vec4 blu=inkFor(mix(vec3(1.),vec3(.55,.66,1.),.75*sqrt(qb)),0.)*.8;
  blu=over(inkFor(mix(vec3(1.),mix(vec3(.25,.45,1.),vec3(.55,.9,1.),qi),smoothstep(0.,.25,qi)),.2*shell),blu);
  return mix(yel,blu,air);
}
vec4 flameInk(vec2 vb,vec3 O,vec3 D,float L,float air,float t){vec2 a=axisOf(vb,O,D);return flameUS(a.x,a.y,L,air,t);}
float sdPlan(vec2 p,vec2 c,vec2 hs,float r){vec2 q=abs(p-c)-hs+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
// Light from a bulb at B landing on the plane z inside a rounded plan (centre, half size, radius): a warm tint that
// falls off as cos/d² (normalised to 1 straight below), ending at the plan's edge stroke.
vec4 poolInk(vec2 vb,vec3 B,float z,vec4 plan,float rr,vec3 warm,float amount){
  vec3 p=onFloor(vb,z);float px=pixelOf()/uCam.z;
  float inside=1.-smoothstep(-.3-.7*px,-.3+.7*px,sdPlan(p.xy,plan.xy,plan.zw,rr));
  vec3 d=B-p;float E=pow(max(d.z,0.)/length(d),3.);
  return inkFor(mix(vec3(1.),warm,1.-exp(-1.8*E*amount)),0.)*inside*.8;}
// Exhaust from a nozzle at O along D: a pale cream core at the nozzle, a yellow-orange body that widens and frays,
// translucent at its edges. T 0..1 is the thrust; the plume is len long at full thrust.
vec4 exhaustInk(vec2 vb,vec3 O,vec3 D,float len,float r0,float T,float t){
  if(T<.002)return vec4(0.);
  vec2 a=axisOf(vb,O,D);float L=len*(.45+.55*T)*(1.+.06*sin(t*47.)+.04*sin(t*83.)),h=a.y/L,hc=clamp(h,0.,1.);
  float r=r0*(1.+.7*hc)*sqrt(max(1.-hc*hc,0.))*(1.+.25*(noise2(vec2(h*7.-t*20.,a.x*.4))-.5)*hc);
  float q=clamp(1.-pow(a.x/max(r,.01),2.),0.,1.)*window(h,0.,1.,.03);
  vec3 body=mix(vec3(1.,.5,.12),vec3(1.,.8,.25),smoothstep(.2,.75,q));
  body=mix(body,vec3(1.,.97,.86),smoothstep(.6,.95,q)*(1.-smoothstep(.35,.8,h)));
  return inkFor(mix(vec3(1.),body,smoothstep(0.,.3,q)),.6*smoothstep(.7,.95,q)*(1.-smoothstep(.2,.6,h)))*mix(1.,.5,smoothstep(.5,1.,h))*smoothstep(0.,.25,T);
}
// Smoke as a cloud of puffs (centre xyz, radius in w) with their own opacities: light grey, lit crowns, shaded undersides.
vec4 puffInk(vec2 vb,vec4 p,float a,float t,float seed,float pale){
  if(a<.002)return vec4(0.);
  vec2 c=project(p.xyz);float d=length(vb-c)/(p.w*uK);
  float n=fbm2((vb-c)/(p.w*uK)*1.6+vec2(seed*7.1,t*.3));
  float dens=a*smoothstep(1.,.25,d+.35*(n-.5));
  float up=clamp(.5-.5*(vb.y-c.y)/(p.w*uK),0.,1.);
  float rim=smoothstep(.45,.95,d);
  vec3 seen=mix(mix(vec3(.64,.68,.74),vec3(.8,.85,.9),pale),mix(vec3(.93,.94,.95),vec3(.985,.99,.995),pale),clamp(up*.75+.25*n-.35*rim,0.,1.));
  // dense smoke is paler than a grey pad under it, so its core covers like paint (cover) rather than only tinting
  return inkFor(seen,.9*smoothstep(.15,.7,dens))*(1.-exp(-3.*dens));
}
// A flame that grows with lv (0 out … 1 full) and fades as one finished ink.
vec4 flameAt(vec2 vb,vec3 O,float L,float air,float lv,float t){return lv<.002?vec4(0.):flameInk(vb,O,vec3(0.,0.,1.),L*(.35+.65*lv),air,t)*smoothstep(0.,.3,lv);}
// Steam rising from O along D (tilted up a little): puffs of light grey haze that widen, drift and thin as they go.
vec4 steamInk(vec2 vb,vec3 O,vec3 D,float len,float r0,float amount,float t){
  vec2 a=axisOf(vb,O,D);float s=a.y,h=s/len;
  float r=r0+s*.32;
  float n=fbm3(vec3(a.x*.12,s*.09-t*.9,t*.15));
  float d=smoothstep(.35,.75,n+.35*(1.-abs(a.x)/r))*window(h,0.,1.,.08)*smoothstep(r,r*.3,abs(a.x))*(1.-.6*h);
  float dens=1.-exp(-2.2*d*amount);
  vec3 seen=mix(vec3(.72,.76,.81),vec3(.97,.975,.98),smoothstep(.3,.8,n));
  return inkFor(mix(vec3(1.),seen,.9),0.)*dens;
}
`;
  // A canvas in a foreignObject placed just before `before`, so parts drawn after it cover the effect. The recipe
  // calls fx.set(values, on); the layer runs its own frame loop while on (a flame keeps flickering after the board
  // settles) and clears when off. Returns null without WebGL, and the recipe keeps drawing its SVG fallback.
  ISO.gl = (g, P, W, H, before, fragment, uniforms) => {
    if (!window.GL || !window.WebGLRenderingContext || ISO.lite()) return null;
    const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    for (const [k, v] of Object.entries({ x: 0, y: 0, width: W, height: H, "pointer-events": "none", "data-fx": "" })) fo.setAttribute(k, v);
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;display:block";
    fo.append(canvas);
    before.parentNode.insertBefore(fo, before);
    const layer = GL.glLayer({ canvas, fragment: ISO.FX + fragment, view: [W, H], camera: GL.glCamera(P), uniforms });
    if (!layer) { fo.remove(); return null; }
    ISO.glLive.add(layer);
    // Draws at most 30 times a second (a flicker needs no more), and not at all while the board is off screen.
    let values = {}, on = false, frame = 0, clock = 0, last = 0, drawn = 0, seen = true;
    const tick = (now) => {
      frame = 0;
      if (!canvas.isConnected) { layer.gl.getExtension("WEBGL_lose_context")?.loseContext(); return; }   // board cleared: free the context
      if (!seen || ISO.paused()) return;
      if (!on) { layer.clear(); return; }
      const calm = ISO.still();
      clock += last ? Math.min((now - last) / 1000, 1 / 20) : 0;
      last = now;
      if (calm || now - drawn > 30) { layer.draw(values, calm ? 0.8 : clock); drawn = now; }
      if (!calm) frame = requestAnimationFrame(tick);
    };
    const run = () => { if (!frame) { last = 0; drawn = 0; frame = requestAnimationFrame(tick); } };
    if (window.IntersectionObserver) new IntersectionObserver((e) => { seen = e[e.length - 1].isIntersecting; if (seen) run(); }).observe(canvas);
    return {
      set(v, isOn = true) {
        const changed = isOn !== on || JSON.stringify(v) !== JSON.stringify(values);
        values = v; on = isOn;
        if (changed) run();
      },
    };
  };
  // Every live shader layer, so a cleared board frees its contexts at once (browsers allow about 16): the player calls
  // ISO.dispose() after it empties the board. ISO.paused: the player's pause holds the effects too.
  ISO.glLive = new Set();
  ISO.paused = () => false;
  ISO.dispose = () => { for (const l of ISO.glLive) if (!l.gl.canvas.isConnected) { l.gl.getExtension("WEBGL_lose_context")?.loseContext(); ISO.glLive.delete(l); } };
  // An empty group at the end of g, for a layer that must cover everything drawn so far (steam over a pan).
  ISO.end = (g) => g.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "g"));
  // Up to n puffs of smoke or steam: fx(list of [x, y, z, radius, opacity]) draws them, an empty list clears.
  // pale 1 for steam (white, thin), 0 for smoke.
  ISO.puffsFx = (g, P, W, H, before, n, pale = 0) => {
    const fx = ISO.gl(g, P, W, H, before, `uniform vec4 uP[${n}];uniform float uA[${n}];void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec4 c=vec4(0.);
      for(int i=0;i<${n};i++)c=over(puffInk(vb,uP[i],uA[i],uTime,float(i),${pale.toFixed(2)}),c);gl_FragColor=finish(c);}`, ["uP", "uA"]);
    if (!fx) return null;
    const pP = new Float32Array(n * 4), pA = new Float32Array(n);
    return (list) => { pA.fill(0); list.slice(0, n).forEach(([x, y, z, r, a], i) => { pP.set([x, y, z, r], i * 4); pA[i] = a; }); fx.set({ uP: pP, uA: pA }, list.some((p) => p[4] > 0.002)); };
  };
  // The common case: one upright flame at world point O with length scale L. fx.flame(air, lv) sets it, off at lv 0.
  ISO.flameFx = (g, P, W, H, before, O, L) => {
    const fx = ISO.gl(g, P, W, H, before, `uniform float uAir;uniform float uLv;void main(){gl_FragColor=finish(flameAt(viewOf(gl_FragCoord.xy),vec3(${O.map((v) => (+v).toFixed(2)).join(",")}),${(+L).toFixed(2)},uAir,uLv,uTime));}`, ["uAir", "uLv"]);
    return fx && { flame: (air, lv = 1) => fx.set({ uAir: air, uLv: lv }, lv > 0.002) };
  };
  // Frame the drawing on the board: a box W × H centred on (cx, cy), fitted to the given world points.
  // ── parts (PARTS.md): small objects that share one camera and one scale, so several placed on one board read as
  // one room. A part's world point [0, 0, 0] (where it stands on the floor, sits on the wall, or a tool's working tip)
  // lands on the board at (cx, cy); k is board px per cm, the same for every part of a scene. World: 1 = 1 cm, x along
  // the wall, y out of the wall into the room (the wall's face is y = 0), z up. flip=1 mirrors it left to right.
  ISO.PART_CAM = { azimuth: 62, elevation: 22 };
  ISO.part = (cx, cy, k = 3, parent, flip = false) => {
    const P = K.fitProjection([[0, 0, 0], [1, 1, 1]], 100, 100, { pad: 0, ...ISO.PART_CAM });
    P.scale = Math.max(0.2, Math.min(60, k)) / K.cameraOf({ scale: 1 }).k; P.origin = [0, 0];
    const o = K.iso([0, 0, 0], P); P.origin = [cx - o[0], cy - o[1]];
    const g = mk("g", { class: "iso", "data-theme": "light", ...(flip && { transform: `translate(${2 * cx} 0) scale(-1 1)` }) }, parent);
    // what other parts attach to: the camera, the scale, and named world points (a joint, a socket, a shelf's top);
    // the player places "at=<id>.<anchor>" (and ax= ay= az= cm offsets) there, in this part's own k
    g.P = P; g.k = k; g.anchors = {}; g.flip = flip;
    return { P, g };
  };
  // the same camera with 1 = 1 mm, for a part built from the mm helpers (LAB, CHEM); anchors stay in cm
  ISO.mm = (P) => ({ ...P, scale: P.scale / 10 });
  // the world point at height z that lands on board point [sx, sy] (the camera is linear, so two probes solve it)
  ISO.unproject = (P, [sx, sy], z = 0) => {
    const o = K.iso([0, 0, z], P), ex = K.iso([1, 0, z], P), ey = K.iso([0, 1, z], P);
    const a = ex[0] - o[0], b = ey[0] - o[0], c = ex[1] - o[1], d = ey[1] - o[1], det = a * d - b * c, u = sx - o[0], v = sy - o[1];
    return [(u * d - b * v) / det, (a * v - c * u) / det, z];
  };
  ISO.frame = (points, cx, cy, W, H, { azimuth = 45, elevation = 30, pad = 0 } = {}, parent) => {
    const P = K.fitProjection(points, W, H, { pad, azimuth, elevation });
    const g = mk("g", { class: "iso", "data-theme": "light", transform: `translate(${cx - W / 2} ${cy - H / 2})` }, parent);
    return { P, g };
  };
})();
