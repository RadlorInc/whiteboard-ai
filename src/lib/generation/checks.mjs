// The script checks (PLAN.md §7.4). The prototype's functions are copied verbatim from prototype/server.mjs
// (check, checkPaper, checkMatchcut, expandMatchcut, FIND_TOOL, findDrawing, parse); their data now comes from
// prompts.json. Added: the per-step splits (checkEls/checkStep, checkPaperStep: `check`/`checkPaper` are their
// compositions, with identical results), checkPolicy (server only) and checkSafety (server and, from M4, the player).
import P from './prompts.json' with { type: 'json' };

const TYPES = new Set(P.types), COMMANDS = new Set(P.commands), LOOPS = new Set(P.loops);
const LIB_NAMES = new Set(P.libNames), FLOW_ITEMS = new Set(P.flowItems), BLOOD_PATHS = new Set(P.bloodPaths);
const TEXTURES = new Set(P.textures), PARTS = P.parts ?? {}, SV_IDS = new Set(P.svIds ?? []), SV_PARTS = P.svParts ?? {};
export const MC_LIB = P.mcLib, WB_LIB = P.wbLib, PAPER_LIB = P.paperLib, EXAMPLES = P.examples;

// ---------- whiteboard: check(a) = shape + checkEls + every checkStep (prototype `check`, split) ----------
export function checkEls(els) {
  const errs = [];
  for (const [id, spec] of Object.entries(els)) {
    const type = String(spec).split('|')[0].trim().split(/\s+/)[0];
    if (!TYPES.has(type)) errs.push(`els.${id}: unknown type "${type}"`);
    if (type === 'sv' && !SV_IDS.has(/\bid=(\S+)/.exec(spec)?.[1])) errs.push(`els.${id}: sv needs id=<a name find_drawing returned>`);
    if (type === 'pin') {               // anatomy pins (18 Oct 2026): "pin of=<earlier drawing id> part=<one of its parts>"
      const of = /\bof=(\S+)/.exec(spec)?.[1], part = /\bpart=(\S+)/.exec(spec)?.[1];
      const ofSpec = of in els ? String(els[of]).trim() : '', ofType = ofSpec.split(/\s+/)[0] || null, before = Object.keys(els).indexOf(of) < Object.keys(els).indexOf(id);
      const svId = ofType === 'sv' ? /\bid=(\S+)/.exec(ofSpec)?.[1] : null, list = svId ? SV_PARTS[svId] : PARTS[ofType], what = svId ?? ofType;
      if (!ofType || !list || !before) errs.push(`els.${id}: pin needs of=<an anatomy drawing listed before it>`);
      else if (!list.includes(part)) errs.push(`els.${id}: ${what} has no part "${part}" (parts: ${list.join(' ')})`);
    }
  }
  return errs;
}
export function checkStep(s, i, els) {
  const errs = [];
  if (typeof s.say !== 'string' || !Array.isArray(s.do)) return [`steps[${i}]: needs say + do`];
  for (const cmd of s.do) {
    const [op, ...arg] = String(cmd).replace(/^&/, '').trim().split(/\s+/);
    if (!COMMANDS.has(op)) { errs.push(`steps[${i}]: unknown command "${op}"`); continue; }
    const ids = op === 'travel' ? arg[0]?.split(',') : op === 'fill' ? arg : ['cam', 'wait'].includes(op) ? [] : [arg[0]];
    for (const id of ids ?? []) if (!(id in els)) errs.push(`steps[${i}]: "${cmd}" uses missing id "${id}"`);
    if (op === 'loop' && !LOOPS.has(arg[1])) errs.push(`steps[${i}]: unknown loop "${arg[1]}"`);
  }
  return errs;
}
export function check(a) {
  if (!a || typeof a !== 'object' || !a.els || !Array.isArray(a.steps)) return ['not {q, els, steps}'];
  return [...checkEls(a.els), ...a.steps.flatMap((s, i) => checkStep(s, i, a.els))];
}

// ---------- paper: checkPaper(a) = shape + every checkPaperStep ----------
export function checkPaperStep(s, i) {
  const errs = [];
  if (typeof s.say !== 'string' || !Array.isArray(s.do)) return [`steps[${i}]: needs say + do`];
  if (!/^#[0-9a-f]{6}$/i.test(s.bg || '')) errs.push(`steps[${i}]: bg must be #rrggbb`);
  for (const cmd of s.do) {
    const [name, ...rest] = String(cmd).trim().split(/\s+/);
    if (!LIB_NAMES.has(name)) { errs.push(`steps[${i}]: unknown drawing "${name}"`); continue; }
    if (name === 'flow' && !FLOW_ITEMS.has(rest[0])) errs.push(`steps[${i}]: unknown flow item "${rest[0]}"`);
    if (name === 'blood' && !BLOOD_PATHS.has(rest[0])) errs.push(`steps[${i}]: unknown blood path "${rest[0]}"`);
    if (/\bw=/.test(cmd)) errs.push(`steps[${i}]: "${cmd}" uses w=; line width is lw=`);
  }
  return errs;
}
export function checkPaper(a) {
  if (!a || typeof a !== 'object' || !Array.isArray(a.steps) || !a.steps.length) return ['not {key, q, steps}'];
  return a.steps.flatMap((s, i) => checkPaperStep(s, i));
}

// ---------- match-cut (verbatim) ----------
// {"use": "car", ...} -> the library profile, with any fields the model set on top (it may recolour a library object)
export function expandMatchcut(a) {
  for (const o of a?.objects || []) if (o.use != null) {
    const lib = MC_LIB[o.use]; if (!lib) continue;          // checkMatchcut reports the unknown name
    const { desc, ...shape } = lib; // eslint-disable-line @typescript-eslint/no-unused-vars
    Object.assign(o, { ...shape, ...o }); delete o.use;
  }
  return a;
}
export function checkMatchcut(a) {
  const errs = [], hex = c => /^#[0-9a-f]{6}$/i.test(c || '');
  if (!a || typeof a !== 'object' || !Array.isArray(a.objects)) return ['not {q, move, objects}'];
  expandMatchcut(a);
  a.objects.forEach((o, i) => { if (o.use != null) errs.push(`objects[${i}]: no library object "${o.use}"`); });
  if (!['fly', 'write'].includes(a.move)) errs.push('move must be "fly" or "write"');
  if (a.objects.length < 3 || a.objects.length > 8) errs.push(`needs 3-8 objects, got ${a.objects.length}`);
  a.objects.forEach((o, i) => {
    if (typeof o.say !== 'string' || !o.say) errs.push(`objects[${i}]: needs say`);
    if (!(o.L >= 150 && o.L <= 450)) errs.push(`objects[${i}]: L must be 150-450`);
    for (const side of ['top', 'bot'])
      if (!Array.isArray(o[side]) || o[side].length !== 11 || !o[side].every(v => typeof v === 'number' && v >= 0 && v <= 90)) errs.push(`objects[${i}]: ${side} must be 11 numbers 0-90`);
    for (const c of ['fill', 'edge', 'bg']) if (!hex(o[c])) errs.push(`objects[${i}]: ${c} must be #rrggbb`);
    for (const c of ['tex', 'mark', 'glow']) if (o[c] != null && !hex(o[c])) errs.push(`objects[${i}]: ${c} must be #rrggbb`);
    if (o.texture != null && !TEXTURES.has(o.texture)) errs.push(`objects[${i}]: unknown texture "${o.texture}"`);
    (o.parts || []).forEach((p, k) => { if (!(Array.isArray(p) && p[0] >= 0 && p[1] <= 1 && p[0] < p[1] && hex(p[2]))) errs.push(`objects[${i}].parts[${k}]: [u0 < u1 in 0-1, "#rrggbb"]`); });
    (o.lines || []).forEach((l, k) => { if (!(Array.isArray(l) && l.slice(0, 4).every(v => typeof v === 'number') && hex(l[4]))) errs.push(`objects[${i}].lines[${k}]: [u0, v0, u1, v1, "#rrggbb", width]`); });
  });
  return errs;
}

export const STYLE_CHECK = { whiteboard: check, paper: checkPaper, matchcut: checkMatchcut };

// ---------- find_drawing (verbatim) ----------
export const FIND_TOOL = {
  name: 'find_drawing', strict: true,
  description: 'Look up library drawings. Give exact names from the index to get their signature, options and what they draw; or a short query (e.g. "blood pressure") to search descriptions. Returns catalogue lines.',
  input_schema: { type: 'object', additionalProperties: false, required: ['names', 'query'],
    properties: { names: { type: 'array', items: { type: 'string' }, description: 'exact drawing names, may be empty' },
      query: { type: 'string', description: 'words to search for, may be empty' } } },
};
const words = t => String(t).toLowerCase().match(/[a-z0-9]+/g) || [];
export function findDrawing(lib, { names = [], query = '' }) {
  const all = lib.flatMap(c => c.lines), out = [];
  for (const n of names) { const ls = all.filter(x => x.name === n), l = ls[0];   // a recipe and a realistic drawing may share a name: give both
    ls.slice(1).forEach(x => out.push(`${x.sig} — ${x.desc}`));
    out.push(l ? `${l.sig} — ${l.desc}` : `${n}: not in the library` +
    (() => { const near = all.filter(x => x.name.includes(n) || n.includes(x.name)).slice(0, 5).map(x => x.name); return near.length ? ` (close: ${near.join(', ')})` : ''; })()); }
  // Search (18 Oct 2026): words of 3+ letters ("a" matched everything), matched on a shared stem of up to 5 letters
  // ("alveolus" finds "alveoli"); a drawing with named parts (pins) wins a tie, being the better teaching picture.
  const stem = w => w.slice(0, Math.min(5, w.length)), q = words(query).filter(w => w.length >= 3);
  if (q.length) all.map(l => { const ws = words(`${l.name} ${l.desc}`).filter(x => x.length >= 3);
      return [l, q.filter(w => ws.some(x => x.startsWith(stem(w)) || w.startsWith(stem(x)))).length + (/; parts: /.test(l.desc) ? .5 : 0)]; })
    .filter(([, s]) => s >= 1).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([l]) => out.push(`${l.sig} — ${l.desc}`));
  return out.length ? [...new Set(out)].join('\n') : 'Nothing found. Use a drawing from the index or the primitives.';
}
// §7.6 input guard, before findDrawing runs: ≤40 names of ≤40 characters, query cut to 200.
export const guardFindInput = input => ({
  names: (Array.isArray(input?.names) ? input.names : []).slice(0, 40).map(n => String(n).slice(0, 40)),
  query: String(input?.query ?? '').slice(0, 200),
});

export const parse = text => JSON.parse(text.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));

// ---------- checkPolicy: the founder's format rules. Server only, never the player (§7.4) ----------
export const POLICY_VERSION = 1;
const codePoints = s => [...s].length;               // = Postgres char_length, which narration_chars() bills on
export function checkPolicy(a, style) {
  const items = style === 'matchcut' ? a?.objects : a?.steps;
  if (!Array.isArray(items)) return ['policy: no steps'];
  const errs = [], cap = style === 'matchcut' ? 700 : 900;
  const chars = items.reduce((n, s) => n + (typeof s?.say === 'string' ? codePoints(s.say) : 0), 0);
  if (chars > cap) errs.push(`policy: ${chars} spoken characters, at most ${cap}`);
  if (style !== 'matchcut' && items.length > 7) errs.push(`policy: ${items.length} steps, at most 7`);
  if (style === 'whiteboard') items.forEach((s, i) => {
    if (typeof s?.say === 'string' && !s.say.startsWith(`Step ${i + 1}:`)) errs.push(`steps[${i}]: say must begin "Step ${i + 1}:"`);
    for (const cmd of Array.isArray(s?.do) ? s.do : [])
      if (String(cmd).replace(/^&/, '').trim().split(/\s+/)[0] === 'cam') errs.push(`steps[${i}]: no cam (the whole board is always in view)`);
  });
  return errs;
}

// ---------- checkSafety: share pages make model text public (§9.4). Server now; the player iframe from M4 ----------
// Loosened under the corpus rule (§7.4), measured on the hand-made, saved and key-day answers:
// colour names are any short word (the library uses purple, pink, white…), not only INK/FILL keys; and f= is checked
// as a colour only on primitives (on tangent/secant it is the function, e.g. f=x^2).
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const CONTROL = /[\u0000-\u0009\u000b-\u001f\u007f]/;                       // newline is allowed
const CONTACT = [/https?:\/\//i, /www\./i, /\b[\w-]+\.(com|net|org|io|ly|gg|xyz|app|co)\b/i, /@\w{2,}/];
const ID = /^[A-Za-z][\w-]{0,31}$/;
const COLOUR = /^(#[0-9a-f]{3,8}|[a-z]{1,16})$/i;
const OPT_KEY = /^[a-z][a-z0-9]{0,11}$/i;
const PRIMITIVES = new Set(['circle', 'ellipse', 'rect', 'line', 'arrow', 'path', 'text', 'tag']);   // f= is a fill only on these
const PATH_D = /^[MmLlHhVvCcSsQqTtAaZz0-9 ,.\-eE]{1,4000}$/;
const NUM = /^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i;
function textErrs(where, t, max) {
  const errs = [];
  if (typeof t !== 'string') return errs;
  if (CONTROL.test(t)) errs.push(`${where}: control character`);
  if (CONTACT.some(r => r.test(t))) errs.push(`${where}: no links, emails or @handles`);
  if (max && codePoints(t) > max) errs.push(`${where}: text over ${max} characters`);
  return errs;
}
function keyErrs(v, where = 'script') {
  if (!v || typeof v !== 'object') return [];
  const errs = [];
  for (const k of Object.keys(v)) {
    if (BAD_KEYS.has(k)) errs.push(`${where}: forbidden key "${k}"`);
    else errs.push(...keyErrs(v[k], `${where}.${k}`));
  }
  return errs;
}
// One element line or command: "type a b k=v … | text". Returns its errors.
function lineErrs(where, line, { coordMin = -200, coordMax = 2000, textMax = 200, pathText = false } = {}) {
  const errs = [], s = String(line), bar = s.indexOf('|');
  const head = bar < 0 ? s : s.slice(0, bar), text = bar < 0 ? null : s.slice(bar + 1).trim();
  const [type, ...toks] = head.trim().split(/\s+/);
  for (const tok of toks) {
    const eq = tok.indexOf('=');
    if (eq > 0) {
      const k = tok.slice(0, eq), v = tok.slice(eq + 1);
      if (!OPT_KEY.test(k) || /^on/i.test(k) || BAD_KEYS.has(k)) errs.push(`${where}: option "${k}" not allowed`);
      if ((k === 'c' || (k === 'f' && PRIMITIVES.has(type))) && v && !COLOUR.test(v)) errs.push(`${where}: colour "${v}" not allowed`);
      if (NUM.test(v) && !Number.isFinite(+v)) errs.push(`${where}: "${tok}" is not a finite number`);
    } else if (NUM.test(tok) && !(+tok >= coordMin && +tok <= coordMax)) errs.push(`${where}: number ${tok} out of range`);
  }
  if (text != null) {
    if (pathText) { if (!PATH_D.test(text)) errs.push(`${where}: path d has characters a path cannot`); }
    else errs.push(...textErrs(where, text, textMax));
  }
  return errs;
}
export function checkSafety(a, style) {
  if (!a || typeof a !== 'object') return ['safety: not an object'];
  const errs = keyErrs(a);
  let size = 0; try { size = new TextEncoder().encode(JSON.stringify(a)).length; } catch { return ['safety: not JSON']; }
  if (size > 65536) errs.push(`safety: ${size} bytes of JSON, at most 65536`);
  errs.push(...textErrs('q', a.q, 500));
  const items = style === 'matchcut' ? a.objects : a.steps;
  (Array.isArray(items) ? items : []).forEach((s, i) => {
    errs.push(...textErrs(`${style === 'matchcut' ? 'objects' : 'steps'}[${i}].say`, s?.say, 0));
    if (style === 'matchcut') return;
    const cmds = Array.isArray(s?.do) ? s.do : [];
    if (cmds.length > 40) errs.push(`steps[${i}]: ${cmds.length} commands, at most 40`);
    cmds.forEach(c => {
      const [op, ...arg] = String(c).replace(/^&/, '').trim().split(/\s+/);
      if (style === 'whiteboard') {
        for (const t of arg) if (NUM.test(t) && !(Number.isFinite(+t) && +t >= -200 && +t <= 20000)) errs.push(`steps[${i}]: "${c}" number out of range`);
        if (op === 'go' && arg.length > 2 + 64) errs.push(`steps[${i}]: go has more than 32 points`);
      } else errs.push(...lineErrs(`steps[${i}]`, c, { coordMin: -200, coordMax: 2000 }));
    });
  });
  if (style === 'whiteboard' && a.els && typeof a.els === 'object') {
    const ids = Object.keys(a.els);
    if (ids.length > 120) errs.push(`els: ${ids.length} elements, at most 120`);
    for (const id of ids) {
      if (!ID.test(id)) errs.push(`els: id "${id}" not allowed`);
      const spec = a.els[id];
      if (typeof spec !== 'string') { errs.push(`els.${id}: must be a string`); continue; }
      errs.push(...lineErrs(`els.${id}`, spec, { pathText: spec.trim().split(/\s+/)[0] === 'path' }));
    }
  }
  return errs;
}
