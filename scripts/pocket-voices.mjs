// Writes public/tts/pocket-voices.bin: the Pocket TTS voices we may use commercially, and only those. The voices.bin
// in KevinAHM's Space (pinned below) holds 8 voices; two come from non-commercial datasets (cosette: Expresso, jean:
// EARS, both CC BY-NC 4.0 per huggingface.co/kyutai/tts-voices), so we do not send them to anyone (founder, 13 Oct
// 2026). Same "PTVB1" format, the kept voices copied byte for byte. Run it (`node scripts/pocket-voices.mjs`) only
// to change the list, then commit the file; tests/voice/pocket-files.test.ts checks what the committed file holds.
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { POCKET_VOICES_SOURCE as SRC, VOICES } from "../public/tts/pocket-files.mjs";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public/tts/pocket-voices.bin");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const res = await fetch(SRC.url);
if (!res.ok) throw new Error(`pocket-voices: HTTP ${res.status}`);
const src = Buffer.from(await res.arrayBuffer());
if (sha(src) !== SRC.sha256) throw new Error(`pocket-voices: SHA-256 ${sha(src)}, expected ${SRC.sha256}`);

// Walk the file: "PTVB1", u32 voice count, then per voice u16 name length + name, u16 tensor count, and per tensor
// u16 key length + key, u8 dtype, u8 rank, rank × u32 dims, u32 byte length + bytes (all little-endian).
if (src.toString("latin1", 0, 5) !== "PTVB1") throw new Error("pocket-voices: not a PTVB1 file");
let at = 9;
const voices = new Map();
for (let v = src.readUInt32LE(5); v > 0; v--) {
  const start = at, nameLen = src.readUInt16LE(at), name = src.toString("utf8", at + 2, at + 2 + nameLen);
  at += 2 + nameLen;
  const tensors = src.readUInt16LE(at); at += 2;
  for (let t = tensors; t > 0; t--) {
    at += 2 + src.readUInt16LE(at);                   // key
    const rank = src[at + 1]; at += 2 + 4 * rank;     // dtype, rank, dims
    at += 4 + src.readUInt32LE(at);                   // bytes
  }
  voices.set(name, src.subarray(start, at));
}
if (at !== src.length) throw new Error(`pocket-voices: ${src.length - at} bytes left after the last voice`);

const keep = VOICES.map((v) => v.id);
const missing = keep.filter((id) => !voices.has(id));
if (missing.length) throw new Error(`pocket-voices: not in the source: ${missing.join(", ")}`);
const head = Buffer.alloc(9); head.write("PTVB1", "latin1"); head.writeUInt32LE(keep.length, 5);
const bytes = Buffer.concat([head, ...keep.map((id) => voices.get(id))]);
writeFileSync(out, bytes);
console.log(`pocket-voices: ${keep.join(", ")} (left out: ${[...voices.keys()].filter((n) => !keep.includes(n)).join(", ")})`);
console.log(`pocket-voices: ${bytes.length} bytes, SHA-256 ${sha(bytes)}`);
