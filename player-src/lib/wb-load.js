// Loads every whiteboard library file after recipes.js. A category = lib/wb/<name>.js (code) + lib/wb/<name>.txt
// (one catalogue line per recipe: "signature | example | what it draws"). Add new categories to this list.
window.WB_CATS = ["physics", "chemistry", "cells", "body", "earth", "math", "tech", "world", "diagrams", "computing", "health", "history", "daily", "engineering", "economy", "calculus"];
const _extra = new URLSearchParams(location.search).get('cat');   // the gallery can load a category that is not listed yet
for (const c of [...window.WB_CATS, ...(_extra && !window.WB_CATS.includes(_extra) ? [_extra] : [])]) document.write(`<script src="${document.currentScript.src.replace(/wb-load\.js.*$/, '')}wb/${c}.js"><\/script>`);
