// Loads every paper-motion library file after the page's own LIB. A category = lib/paper/<name>.js
// (Object.assign(LIB, {...})) + lib/paper/<name>.txt (catalogue lines). Add new categories to this list.
window.PAPER_CATS = ["science", "world", "nature", "everyday"];
const _extra = new URLSearchParams(location.search).get('gallery');   // the gallery can load a category that is not listed yet
for (const c of [...window.PAPER_CATS, ...(_extra && !window.PAPER_CATS.includes(_extra) ? [_extra] : [])]) document.write(`<script src="${document.currentScript.src.replace(/paper-load\.js.*$/, '')}paper/${c}.js"><\/script>`);
