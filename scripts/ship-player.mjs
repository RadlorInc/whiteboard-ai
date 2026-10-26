// What the browser gets of public/player (founder, 26 Oct 2026: nothing may hint at how a video is made).
//   node scripts/ship-player.mjs --out <dir>   writes a shipped copy of public/player to <dir> (to check it)
//   VERCEL=1 node scripts/ship-player.mjs      ships public/player in place (the deploy's build runs this)
// It drops every comment (JS, inline scripts, CSS, HTML), the prompt catalogues (lib/wb, lib/paper *.txt: only the
// server reads them, at build time) and the dev page's example answers, gives lib/iso and lib/sv neutral names, then
// fails if a word that tells how it is made is still in any file. Sources stay as they are in git.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'player');
const outAt = process.argv.indexOf('--out'), OUT = outAt > 0 ? path.resolve(process.argv[outAt + 1]) : process.env.VERCEL ? SRC : null;
if (!OUT) { console.log('ship-player: not a deploy (no VERCEL, no --out): nothing to do'); process.exit(0); }
if (OUT !== SRC) { fs.rmSync(OUT, { recursive: true, force: true }); fs.cpSync(SRC, OUT, { recursive: true }); }

const DIRS = { iso: 'k', sv: 'v' };                       // lib/<old> → lib/<new>
const TELL = /founder|claude|anthropic|ponytail|PLAN\.md|ARCHITECTURE\.md|PROCESS\.md|system prompt|\bMOCK\b|Anatomy (recipe|drawing|skill|workshop)|workshop|cost \$/i;

// a comment becomes a space, or a newline if it held one (so a line comment never joins two statements)
function stripJs(code, where) {
  const cut = [];
  const opts = { ecmaVersion: 'latest', allowHashBang: true, allowReturnOutsideFunction: true, onComment: (_b, _t, s, e) => cut.push([s, e]) };
  try { acorn.parse(code, { ...opts, sourceType: 'script' }); }
  catch { cut.length = 0; try { acorn.parse(code, { ...opts, sourceType: 'module' }); } catch (e) { throw new Error(`${where}: does not parse (${e.message})`); } }
  let out = code;
  for (const [s, e] of cut.reverse()) out = out.slice(0, s) + (/\n/.test(code.slice(s, e)) ? '\n' : ' ') + out.slice(e);
  return out.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
}
const stripCss = css => css.replace(/\/\*[\s\S]*?\*\//g, '');
function stripHtml(html, where) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, a, js, b) => a + stripJs(js, where) + b)
    .replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, a, css, b) => a + stripCss(css) + b);
}
const rename = t => Object.entries(DIRS).reduce((s, [a, b]) => s.split(`lib/${a}/`).join(`lib/${b}/`), t);

// 1. the catalogues and the dev page's examples
for (const d of ['wb', 'paper']) for (const f of fs.readdirSync(path.join(OUT, 'lib', d))) if (f.endsWith('.txt')) fs.rmSync(path.join(OUT, 'lib', d, f));
fs.writeFileSync(path.join(OUT, 'answers.js'), 'window.ANSWERS = [];\n');
// 2. neutral folder names
for (const [a, b] of Object.entries(DIRS)) fs.renameSync(path.join(OUT, 'lib', a), path.join(OUT, 'lib', b));
// 3. every text file: no comments, new folder names; then nothing that tells
const files = fs.readdirSync(OUT, { recursive: true }).map(f => path.join(OUT, f)).filter(f => /\.(js|html|css|json)$/.test(f) && fs.statSync(f).isFile());
const tells = [];
for (const f of files) {
  const where = path.relative(OUT, f), t = fs.readFileSync(f, 'utf8');
  const out = rename(f.endsWith('.html') ? stripHtml(t, where) : f.endsWith('.js') ? stripJs(t, where) : f.endsWith('.css') ? stripCss(t) : t);
  if (out !== t) fs.writeFileSync(f, out);
  const m = TELL.exec(out); if (m) tells.push(`${where}: "${out.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ')}"`);
}
const left = fs.readdirSync(OUT, { recursive: true }).filter(f => f.endsWith('.txt'));
if (left.length) tells.push(...left.map(f => `${f}: a catalogue file is still shipped`));
if (tells.length) { console.error(`ship-player: ${tells.length} file(s) still tell how it is made:\n  ${tells.slice(0, 30).join('\n  ')}`); process.exit(1); }
console.log(`ship-player: ${files.length} files shipped to ${path.relative(process.cwd(), OUT) || '.'} (no comments, no catalogues, lib/${Object.values(DIRS).join(', lib/')})`);
