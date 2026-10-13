// Safari's ReadableStream has no async iterator, and kokoro.web.js's espeak loader reads its data with
// `for await` over one: without this, Kokoro never makes a line in Safari (measured on Mac Safari, 13 Oct 2026).
if (!ReadableStream.prototype[Symbol.asyncIterator]) {
  ReadableStream.prototype[Symbol.asyncIterator] = async function* () {
    const r = this.getReader();
    try { for (;;) { const { done, value } = await r.read(); if (done) return; yield value; } } finally { r.releaseLock(); }
  };
}
