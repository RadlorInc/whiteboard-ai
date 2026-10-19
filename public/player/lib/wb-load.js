// Loads every whiteboard library file after recipes.js. A category = lib/wb/<name>.js (code) + lib/wb/<name>.txt
// (one catalogue line per recipe: "signature | example | what it draws"). Add new categories to this list.
window.WB_CATS = ["physics", "chemistry", "cells", "body", "earth", "math", "tech", "world", "diagrams", "computing", "health", "history", "daily", "engineering", "economy", "calculus"];
window.WB_EXTRA = ["biology", "anatomy", "life"];   // subject-only categories: loaded here, listed only in their subject's prompt (build-prompts.mjs)
// App copy: no ?cat= (it was written into document.write unescaped: an XSS). Only the listed categories load.
const _extra = null;
for (const c of [...window.WB_CATS, ...window.WB_EXTRA, ...(_extra && !window.WB_CATS.includes(_extra) ? [_extra] : [])]) document.write(`<script src="${document.currentScript.src.replace(/wb-load\.js.*$/, '')}wb/${c}.js"><\/script>`);
