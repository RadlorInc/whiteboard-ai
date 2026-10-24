// Loads every whiteboard library file after recipes.js. A category = lib/wb/<name>.js (code) + lib/wb/<name>.txt
// (one catalogue line per recipe: "signature | example | what it draws"). Add new categories to this list.
window.WB_CATS = ["physics", "chemistry", "cells", "body", "earth", "math", "tech", "world", "diagrams", "computing", "health", "history", "daily", "engineering", "economy", "calculus"];
window.WB_EXTRA = ["biology", "anatomy", "life", "phys", "physuni", "physadv", "biouni", "chemuni", "physgr", "chemgr", "biogr", "carfix", "homefix", "objects"];   // subject-only categories: loaded here, listed only in their subject's prompt (build-prompts.mjs)
// App copy: no ?cat= (it was written into document.write unescaped: an XSS). Only the listed categories load.
const _extra = null;
// Subject-only categories per chat subject (each subject's WB_EXTRA cats in build-prompts.mjs SUBJECTS; a test keeps them
// in step). The page is given ?subject=; an unknown or missing subject (old videos, Explore, shares) loads all of WB_EXTRA.
window.WB_SUBJECT = { biology: ["biology", "anatomy", "life", "biouni", "biogr", "objects"], physics: ["anatomy", "phys", "physuni", "physadv", "physgr", "objects"], chemistry: ["anatomy", "chemuni", "chemgr", "objects"], car: ["anatomy", "carfix", "objects"], home: ["anatomy", "homefix", "objects"] };
const _s = new URLSearchParams(location.search).get('subject');
const _sub = Object.hasOwn(window.WB_SUBJECT, _s ?? '') ? window.WB_SUBJECT[_s] : window.WB_EXTRA;   // only listed names reach document.write
// lazy=1 (the page sets it while the Anatomy switch is on, ARCHITECTURE.md §A): only the index and anatomy (realistic
// drawings and pins, which a message may carry before any board) load now; bridge.js needLib loads each board's
// categories before it is built. Without it every listed category loads, as before.
window.WB_LAZY = new URLSearchParams(location.search).get('lazy') === '1';
const _base = document.currentScript.src.replace(/wb-load\.js.*$/, '');
if (window.WB_LAZY) for (const f of ['wb-index.js', 'wb/anatomy.js']) document.write(`<script src="${_base}${f}"><\/script>`);
else for (const c of [...window.WB_CATS, ..._sub, ...(_extra && !window.WB_CATS.includes(_extra) ? [_extra] : [])]) document.write(`<script src="${_base}wb/${c}.js"><\/script>`);
