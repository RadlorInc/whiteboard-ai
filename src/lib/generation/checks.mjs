// The script checks (PLAN.md §7.4). The prototype's functions are copied verbatim from prototype/server.mjs
// (check, checkPaper, checkMatchcut, expandMatchcut, FIND_TOOL, findDrawing, parse); their data now comes from
// prompts.json. Added: the per-step splits (checkEls/checkStep, checkPaperStep: `check`/`checkPaper` are their
// compositions, with identical results), checkPolicy (server only) and checkSafety (server and, from M4, the player).
import P from './prompts.json' with { type: 'json' };

const TYPES = new Set(P.types), COMMANDS = new Set(P.commands), LOOPS = new Set(P.loops);
const LIB_NAMES = new Set(P.libNames), FLOW_ITEMS = new Set(P.flowItems), BLOOD_PATHS = new Set(P.bloodPaths);
const TEXTURES = new Set(P.textures), PARTS = P.parts ?? {}, SV_IDS = new Set(P.svIds ?? []), SV_PARTS = P.svParts ?? {};
export const BUILT_IN = { whiteboard: new Set(P.builtIn.whiteboard), paper: new Set(P.builtIn.paper) };
export const MC_LIB = P.mcLib, WB_LIB = P.wbLib, PAPER_LIB = P.paperLib, EXAMPLES = P.examples;

// ---------- Anatomy recipes (ANATOMY_RECIPES switch; build-prompts.mjs ISO_RULES) ----------
// While the switch is on, an Anatomy element's type is written "<name>Iso" (the player draws the new recipe; old
// videos keep the old one) and its options are cleaned by its own catalogue line, the same rules as the player's
// ISO.cleaner (workshop shared.js): numbers stay finite, ranges clamp, a list keeps its words, unknown keys go (box
// stays). Fixed, not sent back: a repair costs a whole model call. What only the writer can fix is an error (checkEls,
// checkStep): boxes on top of each other or off the board, a part that does not exist, set on a plain drawing.
const ISO_LINE = new Map((P.iso?.lib.lines ?? []).map(l => [l.name, l.sig]));
// a part (workshop PARTS.md: "name cx cy k …") composes with others; its anchors are listed at the end of its line
const ISO_ANCHORS = new Map((P.iso?.lib.lines ?? []).map(l => [l.name, /anchors: ([a-z0-9 ]+)\s*$/.exec(l.desc)?.[1].trim().split(/\s+/) ?? []]));
const isPart = name => ISO_LINE.get(name)?.startsWith(`${name} cx cy k`);
export const ISO_NAMES = new Set(ISO_LINE.keys());
export const isoLibOf = lib => [...lib.map(c => c.cat.startsWith('servier') ? c : { ...c, lines: c.lines.filter(l => !ISO_NAMES.has(l.name)) }), P.iso.lib];
export function isoCleaner(line) {
  const rules = {};
  for (const [, k, spec] of line.matchAll(/\b([a-z][a-z0-9]*)=(\S*)/g)) {
    if (spec.includes('…') && spec !== '…') continue;
    const range = spec.match(/^(-?\d*\.?\d+)(?:-|\.\.|–)(-?\d*\.?\d+)$/);
    const opts = spec.split('|').flatMap(x => { const r = x.match(/^(\d+)-(\d+)$/); return r ? Array.from({ length: +r[2] - +r[1] + 1 }, (_, i) => String(+r[1] + i)) : [x]; });
    const open = spec.match(/^(-?\d*\.?\d+)\.\.$/);
    if (range) rules[k] = { lo: Math.min(+range[1], +range[2]), hi: Math.max(+range[1], +range[2]) };
    else if (open) rules[k] = { lo: +open[1], hi: Infinity };
    else if (/^[a-zμ°]+\/[a-z]+$/i.test(spec)) rules[k] = { num: true };
    else if (/^-?\d*\.?\d+$/.test(spec) || /^(deg|cm|mm|m|N|kg|g|s|ms|x|n|°|…|\.\.\.)$/.test(spec)) rules[k] = { num: true };
    else if (opts.length > 1 && opts.every(x => /^-?\d*\.?\d+$/.test(x))) rules[k] = { lo: Math.min(...opts.map(Number)), hi: Math.max(...opts.map(Number)) };
    else if (opts.length > 1 && k !== 'lit' && k !== 'c' && opts.every(x => /^[a-z0-9][a-z0-9.-]*$/i.test(x))) rules[k] = { one: new Set(opts) };
  }
  return p => {
    const out = {};
    for (const [k, v] of Object.entries(p)) {
      const rule = rules[k];
      if (/^[+-]?(nan|infinity)$/i.test(String(v))) continue;   // never a value (the player's ISO.cleaner does the same)
      if (String(v) in {}) continue;   // __proto__, constructor…: never a value (the player does the same)
      if (!rule) { out[k] = v; continue; }
      if (rule.one) { if (rule.one.has(String(v))) out[k] = v; continue; }
      const x = typeof v === 'number' ? v : v === '' || v == null ? NaN : +v;
      if (!Number.isFinite(x)) continue;
      out[k] = rule.lo !== undefined ? String(Math.min(rule.hi, Math.max(rule.lo, x))) : String(x);
    }
    return out;
  };
}
const isoBase = type => ISO_NAMES.has(type) ? type : type.endsWith('Iso') && ISO_NAMES.has(type.slice(0, -3)) ? type.slice(0, -3) : null;
const isoKeys = name => new Set([...ISO_LINE.get(name).matchAll(/\b([a-z][a-z0-9]*)=/g)].map(m => m[1]));
const cleaners = new Map();
// k=v tokens through a recipe's rules: unknown keys dropped (keep: also allowed), bad values dropped or clamped
function cleanOpts(name, toks, keep = []) {
  if (!cleaners.has(name)) cleaners.set(name, isoCleaner(ISO_LINE.get(name)));
  const keys = isoKeys(name);
  return toks.flatMap(t => {
    const eq = t.indexOf('='); if (eq < 1) return [t];
    const k = t.slice(0, eq), v = t.slice(eq + 1);
    if (!/^[\w.,#|°%+-]{1,60}$/.test(v)) return [];   // a value is a word, number or list: never markup or quotes
    if (keep.includes(k)) return [t];
    if (!keys.has(k)) return [];
    const c = cleaners.get(name)({ [k]: v });
    return k in c ? [`${k}=${c[k]}`] : [];
  });
}
// One element line: an Anatomy one renamed "<name>Iso" and cleaned; anything else as it is.
function isoLine(spec) {
  const s = String(spec), bar = s.indexOf('|'), head = bar < 0 ? s : s.slice(0, bar), [type, ...toks] = head.trim().split(/\s+/), name = isoBase(type);
  if (!name) return spec;
  // only=a,b: just those named parts (its lit= names); names it does not have are dropped
  const parts = /\blit=(\S+)/.exec(ISO_LINE.get(name))?.[1].split('|') ?? [];
  const only = t => { if (!t.startsWith('only=')) return [t]; const ok = t.slice(5).split(/[|,]/).filter(p => parts.includes(p)); return ok.length ? [`only=${ok.join(',')}`] : []; };
  return [`${name}Iso`, ...cleanOpts(name, toks, ['box', 'at', 'to', 'ax', 'ay', 'az', 'flip', 'only']).flatMap(only)].join(' ') + (bar < 0 ? '' : ' ' + s.slice(bar));
}
export const isoEls = els => Object.fromEntries(Object.entries(els).map(([id, v]) => [id, isoLine(v)]));
// set <id> k=v …: cleaned by that element's recipe (the cue and & before it kept)
export function isoStep(step, els) {
  if (!step || !Array.isArray(step.do)) return step;
  return { ...step, do: step.do.map(cmd => {
    const t = String(cmd).trim(), b = bare(t), [op, id, ...kv] = b.split(/\s+/);
    const name = op === 'set' && Object.hasOwn(els, id) ? isoBase(String(els[id]).trim().split(/\s+/)[0]) : null;
    return name ? `${t.slice(0, t.length - b.length)}${['set', id, ...cleanOpts(name, kv)].join(' ')}` : cmd;
  }) };
}
const boxOf = spec => { const m = /\bbox=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+),(-?[\d.]+)/.exec(String(spec)); return m ? m.slice(1).map(Number) : null; };
const overlap = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
function isoPlaceErrs(els) {
  const errs = [], boxes = [], tags = [];
  for (const [id, spec] of Object.entries(els)) {
    const [type, ...n] = String(spec).split('|')[0].trim().split(/\s+/);
    if (type === 'tag' && n.length >= 4) { const [cx, cy, w, h] = n.map(Number); tags.push([id, [cx - w / 2, cy - h / 2, w, h]]); }
    if (!isoBase(type)) continue;
    const b = boxOf(spec); if (!b) continue;
    if (!(b[2] > 20 && b[3] > 20)) errs.push(`els.${id}: box=x,y,w,h needs a width and height over 20`);
    else if (b[0] < -4 || b[1] < -4 || b[0] + b[2] > 964 || b[1] + b[3] > 544) errs.push(`els.${id}: box ${b.join(',')} runs off the 960x540 board`);
    boxes.push([id, b]);
  }
  // a phone builds and moves every one (and each may hold a shader layer): a lesson needs one or two big drawings;
  // parts are small, and a scene of them may have more (up to 16 in all)
  const names = Object.values(els).map(v => isoBase(String(v).trim().split(/\s+/)[0])).filter(Boolean);
  const big = names.filter(nm => !isPart(nm)).length;
  if (big > 4) errs.push(`els: ${big} detailed 3D drawings, at most 4 on one board`);
  if (names.length > 16) errs.push(`els: ${names.length} detailed 3D drawings and parts, at most 16 on one board`);
  // a part placed by cx cy k: its point on the board, its scale a real one (px per cm)
  for (const [id, spec] of Object.entries(els)) {
    const [type, ...toks] = String(spec).split('|')[0].trim().split(/\s+/), nm = isoBase(type);
    if (!nm || !isPart(nm) || /\bat=/.test(spec)) continue;
    const [cx, cy, k] = toks.filter(t => !t.includes('=')).map(Number);
    if (!(cx >= -10 && cx <= 970 && cy >= -10 && cy <= 550)) errs.push(`els.${id}: ${nm} at ${cx},${cy} is off the 960x540 board`);
    if (k !== undefined && !(k >= 0.5 && k <= 30)) errs.push(`els.${id}: k=${k} px per cm is not a real scale (0.5-30; one scene shares one k)`);
  }
  // at=<id>[.<anchor>]: on a part listed before it, at an anchor that part has
  const order = Object.keys(els);
  // to=<id>[.<anchor>] (a wire's other end): the same rule
  for (const [id, spec] of Object.entries(els)) for (const key of ['at', 'to']) {
    const at = new RegExp(`\\b${key}=(\\S+)`).exec(String(spec))?.[1]; if (!at || !isoBase(String(spec).trim().split(/\s+/)[0])) continue;
    const [tid, an] = at.split('.'), tname = Object.hasOwn(els, tid) ? isoBase(String(els[tid]).trim().split(/\s+/)[0]) : null;
    if (!tname || !isPart(tname) || order.indexOf(tid) >= order.indexOf(id)) errs.push(`els.${id}: ${key}=${at} needs a part listed before it`);
    else if (an && !ISO_ANCHORS.get(tname).includes(an)) errs.push(`els.${id}: ${tname} has no anchor "${an}" (anchors: ${ISO_ANCHORS.get(tname).join(' ') || 'none'})`);
  }
  boxes.forEach(([id, b], i) => {
    for (const [o, c] of boxes.slice(i + 1)) if (overlap(b, c) > .1 * Math.min(b[2] * b[3], c[2] * c[3])) errs.push(`els.${id} and els.${o}: their boxes overlap; give each drawing its own part of the board`);
    for (const [t, c] of tags) if (overlap(b, c) > .1 * c[2] * c[3]) errs.push(`els.${t}: the tag sits on drawing ${id}; move it clear of box ${b.join(',')}`);
  });
  return errs;
}
// mark <id>.<part>: a part the recipe names (its lit= list); set: an Anatomy drawing
function isoCmdErrs(op, arg, i, els) {
  const [id, part] = String(arg[0] ?? '').split('.'), name = Object.hasOwn(els, id) ? isoBase(String(els[id]).trim().split(/\s+/)[0]) : null;
  if (op === 'set' && Object.hasOwn(els, id) && !name) return [`steps[${i}]: set ${id}: only a detailed 3D drawing (the iso category) takes set`];
  if (op === 'mark' && part !== undefined) {
    if (!name) return [`steps[${i}]: mark ${arg[0]}: only a detailed 3D drawing has named parts`];
    const parts = /\blit=(\S+)/.exec(ISO_LINE.get(name))?.[1].split('|') ?? [];
    if (!parts.includes(part)) return [`steps[${i}]: mark ${arg[0]}: ${name} has no part "${part}" (parts: ${parts.join(' ')})`];
  }
  return [];
}

// ---------- whiteboard: check(a) = shape + checkEls + every checkStep (prototype `check`, split) ----------
// extraSv: the approved library drawings' slugs (library_drawings), which a script may also use as sv ids.
export function checkEls(els, extraSv) {
  const errs = [];
  for (const [id, spec] of Object.entries(els)) {
    const type = String(spec).split('|')[0].trim().split(/\s+/)[0];
    if (!TYPES.has(type)) errs.push(`els.${id}: unknown type "${type}"`);
    if (type === 'sv' && !(id => SV_IDS.has(id) || extraSv?.has(id))(/\bid=(\S+)/.exec(spec)?.[1])) errs.push(`els.${id}: sv needs id=<a name find_drawing returned>`);
    if (type === 'pin') {               // anatomy pins (18 Oct 2026): "pin of=<earlier drawing id> part=<one of its parts>"
      const of = /\bof=(\S+)/.exec(spec)?.[1], part = /\bpart=(\S+)/.exec(spec)?.[1];
      const ofSpec = Object.hasOwn(els, of) ? String(els[of]).trim() : '', ofType = ofSpec.split(/\s+/)[0] || null, before = Object.keys(els).indexOf(of) < Object.keys(els).indexOf(id);
      const svId = ofType === 'sv' ? /\bid=(\S+)/.exec(ofSpec)?.[1] : null, list = svId ? SV_PARTS[svId] : PARTS[ofType], what = svId ?? ofType;
      if (!ofType || !list || !before) errs.push(`els.${id}: pin needs of=<an anatomy drawing listed before it>`);
      else if (!list.includes(part)) errs.push(`els.${id}: ${what} has no part "${part}" (parts: ${list.join(' ')})`);
    }
  }
  return [...errs, ...isoPlaceErrs(els)];
}
// A command may start with a word cue, "@nucleus draw n1" (the player draws it when the voice says that word):
// bare() drops the & and the cue (either order: the model writes "@word &fade x" too), cueOf() gives the cue's word.
export const bare = cmd => String(cmd).trim().replace(/^&\s*/, '').replace(/^@\S+\s+/, '').replace(/^&\s*/, '');
const cueOf = cmd => /^&?\s*@(\S+)/.exec(String(cmd).trim())?.[1];
const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const MARKS = new Set(['circle', 'underline', 'point']);
export function checkStep(s, i, els) {
  const errs = [];
  if (typeof s.say !== 'string' || !Array.isArray(s.do)) return [`steps[${i}]: needs say + do`];
  // cues are found in spoken order, as the player finds them (bridge.js wordAt)
  const words = [...s.say.matchAll(/\S+/g)].map(m => norm(m[0]));
  let from = 0;
  for (const cmd of s.do) {
    const cue = cueOf(cmd);
    if (cue !== undefined) {
      const k = words.indexOf(norm(cue), from);
      if (k < 0) errs.push(`steps[${i}]: "${cmd}" cues "${cue}", which is not ${words.includes(norm(cue)) ? 'in the say after the cue before it' : 'a word of this step\'s say'}`);
      else from = k;                 // the same word may cue several commands (draw it, then name it)
    }
    const [op, ...arg] = bare(cmd).split(/\s+/);
    if (!COMMANDS.has(op)) { errs.push(`steps[${i}]: unknown command "${op}"`); continue; }
    if (op === 'mark' && !MARKS.has(arg[1])) errs.push(`steps[${i}]: unknown mark "${arg[1]}" (circle, underline or point)`);
    const ids = op === 'travel' ? arg[0]?.split(',') : op === 'fill' ? arg : ['cam', 'wait'].includes(op) ? [] : [op === 'mark' ? arg[0]?.split('.')[0] : arg[0]];
    for (const id of ids ?? []) if (!Object.hasOwn(els, id)) errs.push(`steps[${i}]: "${cmd}" uses missing id "${id}"`);
    if (op === 'loop' && !LOOPS.has(arg[1])) errs.push(`steps[${i}]: unknown loop "${arg[1]}"`);
    errs.push(...isoCmdErrs(op, arg, i, els));
  }
  return errs;
}
export function check(a, extraSv) {
  if (!a || typeof a !== 'object' || !a.els || !Array.isArray(a.steps)) return ['not {q, els, steps}'];
  return [...checkEls(a.els, extraSv), ...a.steps.flatMap((s, i) => checkStep(s, i, a.els))];
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
export function findDrawing(lib, { names = [], query = '' }, builtIn = new Set()) {
  const all = lib.flatMap(c => c.lines), out = [];
  for (const n of names) { const ls = all.filter(x => x.name === n), l = ls[0];   // a recipe and a realistic drawing may share a name: give both
    ls.slice(1).forEach(x => out.push(`${x.sig} — ${x.desc}`));
    out.push(l ? `${l.sig} — ${l.desc}` : builtIn.has(n) ? `${n}: built in — use it exactly as your instructions show it (no lookup needed)` : `${n}: not in the library` +
    (() => { const near = all.filter(x => x.name.includes(n) || n.includes(x.name)).slice(0, 5).map(x => x.name); return near.length ? ` (close: ${near.join(', ')})` : ''; })()); }
  // Search (18 Oct 2026): words of 3+ letters ("a" matched everything), matched on a shared stem of up to 5 letters
  // ("alveolus" finds "alveoli"); a drawing with named parts (pins) wins a tie, being the better teaching picture, and
  // one whose name is a query word ranks above stem matches ("transpiration" above "transport").
  // 19 Oct 2026 (university biology): a 1-2 letter word is glued to the next, so "B cell", "T cell", "NK cell" are
  // searchable as "bcell", "tcell", "nkcell" (on both sides) instead of falling to the 3-letter cut.
  const glue = ws => [...ws, ...ws.slice(0, -1).flatMap((w, i) => w.length <= 2 ? [w + ws[i + 1]] : [])];
  const stem = w => w.slice(0, Math.min(5, w.length)), q = glue(words(query)).filter(w => w.length >= 3);
  if (q.length) all.map(l => { const ws = glue(words(`${l.name} ${l.desc}`)).filter(x => x.length >= 3);
      const own = glue(words(l.name));                                   // 19 Oct 2026: a word that is the drawing's own name wins
      return [l, q.filter(w => ws.some(x => x.startsWith(stem(w)) || w.startsWith(stem(x)))).length + (/; parts: /.test(l.desc) ? .5 : 0)
        + (q.some(w => own.includes(w)) ? 1 : 0)]; })
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
      if (bare(cmd).split(/\s+/)[0] === 'cam') errs.push(`steps[${i}]: no cam (the whole board is always in view)`);
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
      if (!OPT_KEY.test(k) || /^on./i.test(k) || BAD_KEYS.has(k)) errs.push(`${where}: option "${k}" not allowed`);
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
      const [op, ...arg] = (style === 'whiteboard' ? bare(c) : String(c).replace(/^&/, '').trim()).split(/\s+/);
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
