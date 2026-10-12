// PLAN.md §12.3 storage: bucket `voice` has no policies, so no client (anon, or the owner with a real JWT) can read,
// list, upload, sign or delete; the server (secret key) can upload audio/mpeg up to 2 MB and sign 1-hour URLs.
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { newUser, stack } from './stack.mjs';

const mp3 = (bytes) => new Blob([new Uint8Array(bytes).fill(0xff)], { type: 'audio/mpeg' });
let user;
let path;
const uploaded = [];

beforeAll(async () => {
  user = await newUser('storage-a');
  path = `${user.id}/${randomUUID()}/0.mp3`;
  const up = await stack().admin.storage.from('voice').upload(path, mp3(1024), { contentType: 'audio/mpeg' });
  expect(up.error).toBeNull();                       // positive control: the server CAN write the object we probe
  uploaded.push(path);
}, 60_000);

afterAll(async () => {
  if (uploaded.length) await stack().admin.storage.from('voice').remove(uploaded);
});

describe('voice bucket, client side: everything denied', () => {
  for (const who of ['owner', 'anon']) {
    const client = () => (who === 'owner' ? stack().as(user.token) : stack().anon());

    test(`${who} cannot download a clip`, async () => {
      const r = await client().storage.from('voice').download(path);
      expect(r.data).toBeNull();
      expect(r.error).not.toBeNull();
    });

    test(`${who} cannot list the prefix`, async () => {
      const r = await client().storage.from('voice').list(`${user.id}`);
      expect(r.data ?? []).toEqual([]);
    });

    test(`${who} cannot upload`, async () => {
      const p = `${user.id}/${randomUUID()}/0.mp3`;
      const r = await client().storage.from('voice').upload(p, mp3(512), { contentType: 'audio/mpeg' });
      expect(r.error).not.toBeNull();
      if (!r.error) uploaded.push(p);
    });

    test(`${who} cannot overwrite`, async () => {
      const r = await client().storage.from('voice').upload(path, mp3(10), { contentType: 'audio/mpeg', upsert: true });
      expect(r.error).not.toBeNull();
    });

    test(`${who} cannot sign a URL`, async () => {
      const r = await client().storage.from('voice').createSignedUrl(path, 3600);
      expect(r.data?.signedUrl ?? null).toBeNull();
    });

    test(`${who} cannot delete`, async () => {
      await client().storage.from('voice').remove([path]);
      const still = await stack().admin.storage.from('voice').download(path);
      expect(still.error).toBeNull();                 // the object is still there, byte for byte
      expect((await still.data.arrayBuffer()).byteLength).toBe(1024);
    });
  }
});

describe('voice bucket, server side', () => {
  test('the server lists the prefix (positive control for the empty client listings)', async () => {
    const r = await stack().admin.storage.from('voice').list(`${user.id}`);
    expect(r.error).toBeNull();
    expect(r.data.map((e) => e.name)).toEqual([path.split('/')[1]]);
  });

  test('the server signs a 1-hour URL and it serves the clip', async () => {
    const s = await stack().admin.storage.from('voice').createSignedUrl(path, 3600);
    expect(s.error).toBeNull();
    const res = await fetch(s.data.signedUrl);
    expect(res.status).toBe(200);
    expect((await res.arrayBuffer()).byteLength).toBe(1024);
  });

  test('2 MB exactly is accepted', async () => {
    const p = `${user.id}/${randomUUID()}/1.mp3`;
    const r = await stack().admin.storage.from('voice').upload(p, mp3(2 * 1024 * 1024), { contentType: 'audio/mpeg' });
    expect(r.error).toBeNull();
    uploaded.push(p);
  });

  test('3 MB is refused even with the secret key', async () => {
    const p = `${user.id}/${randomUUID()}/2.mp3`;
    const r = await stack().admin.storage.from('voice').upload(p, mp3(3 * 1024 * 1024), { contentType: 'audio/mpeg' });
    expect(r.error).not.toBeNull();
    if (!r.error) uploaded.push(p);
  });

  test('text/html is refused even with the secret key (nobody hosts HTML on the storage domain)', async () => {
    const p = `${user.id}/${randomUUID()}/x.html`;
    const r = await stack().admin.storage.from('voice').upload(p, new Blob(['<script>alert(1)</script>'], { type: 'text/html' }),
      { contentType: 'text/html' });
    expect(r.error).not.toBeNull();
    if (!r.error) uploaded.push(p);
  });
});
