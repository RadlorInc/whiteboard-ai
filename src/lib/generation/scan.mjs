// Incremental scanner over the model's streamed JSON text (PLAN.md §7.3). It finds where top-level values close and
// hands back the exact substring through JSON.parse, so the real parser does the parsing.
//   whiteboard: {type:'els', els} when "els" closes, then {type:'step', i, step} for each element of "steps";
//               steps that close before "els" are held back until "els" arrives (no key order is assumed).
//   paper:      each element of "steps".   matchcut: nothing early (the whole script is checked first).
export const SCAN_LIMIT = 200 * 1024;

export function createScanner(style) {
  let buf = '', pos = 0, started = false, done = false;
  let depth = 0, inStr = false, esc = false;
  let strStart = -1, lastStr = null, key = null;   // the depth-1 key whose value is being read
  let valStart = -1, itemStart = -1, nStep = 0;
  let els = null; const held = [];

  return {
    push(chunk) {
      const out = [];
      if (done) return out;
      buf += chunk;
      if (buf.length > SCAN_LIMIT) throw Object.assign(new Error(`more than ${SCAN_LIMIT} bytes of script text`), { code: 'scan_limit' });
      for (; pos < buf.length; pos++) {
        const ch = buf[pos];
        if (!started) { if (ch === '{') { started = true; depth = 1; } continue; }
        if (inStr) {
          if (esc) esc = false;
          else if (ch === '\\') esc = true;
          else if (ch === '"') { inStr = false; if (depth === 1) lastStr = buf.slice(strStart, pos + 1); }
          continue;
        }
        if (ch === '"') { inStr = true; strStart = pos; continue; }
        if (ch === ':' && depth === 1) { try { key = JSON.parse(lastStr); } catch { key = null; } continue; }
        if (ch === '{' || ch === '[') {
          depth++;
          if (depth === 2) valStart = pos;
          else if (depth === 3 && key === 'steps') itemStart = pos;
          continue;
        }
        if (ch === '}' || ch === ']') {
          depth--;
          if (depth === 0) { done = true; break; }
          if (depth === 2 && key === 'steps' && itemStart >= 0 && style !== 'matchcut') {
            const step = JSON.parse(buf.slice(itemStart, pos + 1)); itemStart = -1;
            const ev = { type: 'step', i: nStep++, step };
            if (style === 'whiteboard' && !els) held.push(ev); else out.push(ev);
          } else if (depth === 1 && key === 'els' && style === 'whiteboard' && !els) {
            els = JSON.parse(buf.slice(valStart, pos + 1));
            out.push({ type: 'els', els }, ...held.splice(0));
          }
        }
      }
      return out;
    },
  };
}
