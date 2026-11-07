/* eslint-disable @typescript-eslint/no-explicit-any */
// 3D machines (MODELS_3D): the answer writer finds a machine with find_drawing, the script drives it with set, and the
// checks hold the script to what the machine has. No real model, database or API.
import { describe, it, expect } from 'vitest';
import { check, findDrawing, namedMachines } from '../../src/lib/generation/checks.mjs';
import { runGeneration } from '../../src/lib/generation/run';
import { prefix, promptSha } from '../../src/lib/generation/model';
import P from '../../src/lib/generation/prompts.json' with { type: 'json' };
import { fakeDb, fakeClient } from './fakes';

type Any = any;
const jet = (P as Any).m3.lib.lines.find((l: Any) => l.name === 'jet-3d');
const example = JSON.parse(/example: (\{.*\})$/.exec(jet.desc)![1]);
const answer = (steps: string[][], els: Record<string, string> = { m: 'm3 id=jet' }) =>
  ({ els, steps: steps.map((d, i) => ({ say: `Step ${i + 1}: the jet engine, its fan and compressor.`, do: d })) });

describe('3D machine scripts', () => {
  it('every machine\'s example lesson passes the checks', () => {
    const bad = (P as Any).m3.lib.lines.map((l: Any) => [l.name, check(JSON.parse(/example: (\{.*\})$/.exec(l.desc)![1]))]).filter(([, e]: Any) => e.length);
    expect(bad).toEqual([]);
    expect(check(example)).toEqual([]);
  });
  it('set may use only the machine\'s views, parts and effects', () => {
    const errs = check(answer([
      ['set m view=top'], ['set m hi=fan,wing labels=propeller'], ['set m explode=1'], ['set m cut=2 speed=99 mt=-1'], ['set m colour=red'],
    ]));
    expect(errs.join('\n')).toMatch(/no view "top"/);
    expect(errs.join('\n')).toMatch(/no part wing/);
    expect(errs.join('\n')).toMatch(/no part propeller/);
    expect(errs.join('\n')).toMatch(/has no explode/);
    expect(errs.join('\n')).toMatch(/cut must be 0 to 1/);
    expect(errs.join('\n')).toMatch(/speed must be 0 to 20/);
    expect(errs.join('\n')).toMatch(/mt must be seconds/);
    expect(errs.join('\n')).toMatch(/unknown key "colour"/);
  });
  it('clearing highlights and labels is allowed', () => {
    expect(check(answer([['set m view=side hi=fan'], ['set m hi= labels=']]))).toEqual([]);
  });
  it('a machine is the only element, and only a machine in the library', () => {
    expect(check(answer([['set m view=side']], { m: 'm3 id=jet', t: 'text 10 10 | hi' })).join()).toMatch(/must be the only element/);
    expect(check(answer([['set m view=side']], { m: 'm3 id=spaceship' })).join()).toMatch(/needs id=<a machine/);
    expect(check(answer([['set m view=side']], { m: 'm3 id=__proto__' })).join()).toMatch(/needs id=<a machine/);
  });
});

describe('finding a machine', () => {
  it('a plain question finds it, and its name gives its line', () => {
    expect(findDrawing([(P as Any).m3.lib], { names: [], query: 'how does a jet engine work' })).toMatch(/^m3 id=jet — /);
    expect(findDrawing([(P as Any).m3.lib], { names: ['jet-3d'] as never[], query: '' })).toMatch(/views: front side core rear/);
  });
});

describe('the machine a question names', () => {
  it('a question about a machine names it; one about none names none', () => {
    expect(namedMachines('How does a huge airplane stay up in the air?')).toEqual(['plane-3d']);
    expect(namedMachines('How does a refrigerator make things cold?')).toEqual(['fridge-3d']);
    expect(namedMachines('What is photosynthesis?')).toEqual([]);
  });
  it('with the switch on, the model is told before the question; off, it is not', async () => {
    for (const m3 of [true, false]) {
      const { db } = fakeDb(), f = fakeClient([{ text: JSON.stringify(example) }]);
      await runGeneration({ id: '00000000-0000-4000-8000-000000000001', style: 'whiteboard', subject: 'aeronautics', question: 'How does a huge airplane stay up?',
        client: f.client, db, send: () => {}, retryWaitMs: () => 0, m3, iso: true });
      expect(JSON.stringify(f.seen[0])).toMatch(m3 ? /3D machine for this question: plane-3d/ : /^(?!.*3D machine for this question)/);
    }
  });
});

describe('the switch', () => {
  it('off: every prompt is as before; on: physics and asks outside a chat get the machines', () => {
    expect(promptSha('whiteboard', 'physics', false)).toBe((P as Any).subjects.physics.sha256);
    expect(prefix('whiteboard', 'physics', false).system[0].text).not.toMatch(/3D machines/);
    expect(prefix('whiteboard', 'physics', true).system[0].text).toMatch(/3D machines \(find_drawing them; names: .*jet-3d/);
    expect(prefix('whiteboard', null, true).system[0].text).toMatch(/3D machines/);
    expect(prefix('whiteboard', 'biology', true).system[0].text).not.toMatch(/3D machines/);
    for (const s of ['mechanical', 'aeronautics', 'aerospace', 'fashion'] as const) expect(prefix('whiteboard', s, true).system[0].text).toMatch(/3D machines/);
    expect(prefix('whiteboard', 'mechanical', false).system[0].text).not.toMatch(/3D machines/);
    expect(promptSha('whiteboard', 'physics', true)).not.toBe(promptSha('whiteboard', 'physics', false));
  });
  it('a whole run: looks the machine up, streams the steps, saves the video', async () => {
    for (const iso of [false, true]) {
      const { db, log } = fakeDb(), f = fakeClient([{ tool: { names: ['jet-3d'] } }, { text: JSON.stringify(example) }]), events: Any[] = [];
      await runGeneration({ id: '00000000-0000-4000-8000-000000000001', style: 'whiteboard', subject: 'physics', question: 'How does a jet engine push a plane?',
        client: f.client, db, send: (event, data) => events.push({ event, data }), retryWaitMs: () => 0, m3: true, iso });
      expect(events.at(-1).event).toBe('done');
      expect(log.finish[0].metrics).toMatchObject({ misses: [] });
      expect((log.finish[0].script as Any).els).toEqual({ m: 'm3 id=jet' });
      expect(JSON.stringify(f.seen[1])).toMatch(/views: front side core rear/);     // the lookup's answer went back to the model
      expect(events.filter(e => e.event === 'need').flatMap(e => e.data.cats)).not.toContain('machines');
    }
  });
  it('switch off: the machine is not in the lookup, so a script using it is sent back', async () => {
    const { db, log } = fakeDb(), f = fakeClient([{ tool: { names: ['jet-3d'] } }, { text: JSON.stringify(example) }]);
    await runGeneration({ id: '00000000-0000-4000-8000-000000000001', style: 'whiteboard', subject: 'physics', question: 'How does a jet engine work?',
      client: f.client, db, send: () => {}, retryWaitMs: () => 0, m3: false, iso: false });
    expect(log.finish[0].metrics).toMatchObject({ misses: ['jet-3d'] });
  });
});
