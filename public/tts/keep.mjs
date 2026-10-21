// Pinned voice files, downloaded once, hash-checked and kept in the browser. Shared by the voice workers
// (pocket-worker.js: English, piper-worker.js: Dutch); moved out of pocket-worker.js unchanged, 21 Oct 2026.
// A file is {name, url, bytes, sha256}. keeper(prefix, total) gives keptOnce(file) -> Blob; while it downloads the
// worker posts {download, total} (bytes across all its files, which come in parallel).

const hex = async (buf) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map((b) => b.toString(16).padStart(2, "0")).join("");
// Taken before a worker replaces self.fetch (pocket-worker.js serves the demo's own fetches from here).
const realFetch = self.fetch.bind(self);

export function keeper(prefix, total) {
    const got = new Map();
    const progress = (f, n) => { got.set(f.name, n); self.postMessage({ download: [...got.values()].reduce((a, b) => a + b, 0), total }); };

    // A file is kept in OPFS under its hash, and only after the hash matched: what is stored is always right. The
    // download is written into "<name>.part" as it arrives (a sync access handle commits each write), so a reload
    // carries on with an HTTP Range request instead of starting again. (From the Kokoro worker, 13 Oct 2026.)
    async function kept(f) {
        // Some WebKit browsers have no OPFS: getDirectory() throws UnknownError ("unknown transient reason") in a
        // private window, and Chrome on an iPhone turned the voice off with it (13 Oct 2026). Those keep files in
        // Cache Storage.
        let dir = null;
        try { dir = await navigator.storage.getDirectory(); } catch { return cached(f); }
        const name = `${prefix}-${f.sha256}`;
        try { const file = await (await dir.getFileHandle(name)).getFile(); if (file.size === f.bytes) { got.set(f.name, f.bytes); return file; } } catch {}   // kept: counts, no bar
        let part = null, sync = null, have = 0, chunks = [];
        try {
            part = await dir.getFileHandle(name + ".part", { create: true });
            sync = await part.createSyncAccessHandle();                    // one writer: another tab gets the in-memory way
            have = sync.getSize();
            if (have > f.bytes) { sync.truncate(0); have = 0; }
        } catch { sync?.close(); part = sync = null; have = 0; }
        try {
            if (have < f.bytes) {
                const res = await realFetch(f.url, have ? { headers: { Range: `bytes=${have}-` } } : undefined);
                if (!res.ok) throw new Error(`${f.name}: HTTP ${res.status}`);
                if (have && res.status !== 206) { sync.truncate(0); have = 0; }   // the server sent it all: start again
                const reader = res.body.getReader();
                for (;;) {
                    const { done, value } = await reader.read(); if (done) break;
                    if (have + value.length > f.bytes) throw new Error(`${f.name}: longer than ${f.bytes} bytes`);
                    if (sync) sync.write(value, { at: have }); else chunks.push(value);   // no OPFS: in memory this once
                    have += value.length;
                    progress(f, have);
                }
                if (have !== f.bytes) throw new Error(`${f.name}: ${have} bytes, expected ${f.bytes}`);
            }
        } finally { sync?.flush(); sync?.close(); }
        const blob = part ? await part.getFile() : new Blob(chunks);
        const hash = await hex(await blob.arrayBuffer());
        if (hash !== f.sha256) {
            if (part) await dir.removeEntry(name + ".part").catch(() => {});   // a bad piece: the next try starts clean
            throw new Error(`${f.name}: hash ${hash.slice(0, 12)}… is not ${f.sha256.slice(0, 12)}…`);
        }
        if (part) try { await part.move(name); return await (await dir.getFileHandle(name)).getFile(); } catch {}
        return blob;
    }

    // Without OPFS: Cache Storage under the file's hash (checked before it is kept), or memory only when that fails too.
    async function cached(f) {
        const key = `/tts/kept/${f.sha256}`;
        let cache = null;
        try { cache = await caches.open(prefix); } catch {}
        try { const hit = await cache?.match(key); if (hit) { const b = await hit.blob(); if (b.size === f.bytes) { got.set(f.name, f.bytes); return b; } } } catch {}
        const res = await realFetch(f.url);
        if (!res.ok) throw new Error(`${f.name}: HTTP ${res.status}`);
        const chunks = [], reader = res.body.getReader();
        let have = 0;
        for (;;) {
            const { done, value } = await reader.read(); if (done) break;
            if (have + value.length > f.bytes) throw new Error(`${f.name}: longer than ${f.bytes} bytes`);
            chunks.push(value); have += value.length; progress(f, have);
        }
        if (have !== f.bytes) throw new Error(`${f.name}: ${have} bytes, expected ${f.bytes}`);
        const blob = new Blob(chunks), hash = await hex(await blob.arrayBuffer());
        if (hash !== f.sha256) throw new Error(`${f.name}: hash ${hash.slice(0, 12)}… is not ${f.sha256.slice(0, 12)}…`);
        try { await cache?.put(key, new Response(blob)); } catch {}   // a full quota: this visit only
        return blob;
    }

    // Each file once per worker: a load and then the model's own fetches ask for the same files (without OPFS, a
    // second ask would download again). A failure is not kept, so the next warm tries again.
    const once = new Map();
    return (f) => {
        if (!once.has(f.name)) once.set(f.name, kept(f).catch((e) => { once.delete(f.name); throw e; }));
        return once.get(f.name);
    };
}
