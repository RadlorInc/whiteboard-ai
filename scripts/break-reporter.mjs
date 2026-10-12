// The reporter break-check.sh adds to a Vitest or Playwright run. It records what break-verdict.mjs needs and what
// both runners' own JSON reporters lose: whether a failing test failed in its OWN body or in a hook. Measured on
// Vitest 5.0.2 and Playwright 1.63.0 (12 Oct 2026): a beforeEach whose expect() fails is reported by both JSON
// reporters exactly like the test's own assertion failing, with the same message, though the test body never ran.
//
// Writes $BREAK_REPORT:
//   { runner, errors: [string], files: { "<path from the cwd>": { errors: [string], tests: [Test] } } }
//   Test = { name, status: "passed" | "failed" | "skipped", hook: null | "<hook that failed>", own: bool, message }
//   own = the test failed on its own assertion, in its own body, with no hook failing.
//
// One class serves both runners because they call different methods: Vitest calls onTestRunEnd; Playwright calls
// onTestEnd, onError and onEnd. ⚠️ After upgrading either runner, run `npm run break:selftest` before trusting this.
import { writeFileSync } from 'node:fs';
import { relative } from 'node:path';

const strip = (s) => String(s ?? '').replace(/\x1b\[[0-9;]*m/g, '');
const head = (e) => strip(typeof e === 'string' ? e : e?.message ? `${e.name && e.name !== 'Error' ? `${e.name}: ` : ''}${e.message}` : e).split('\n').find((l) => l.trim())?.trim() ?? '';
const rel = (p) => relative(process.cwd(), p);

export default class BreakReporter {
  files = {};
  errors = [];
  file(path) { return (this.files[rel(path)] ??= { errors: [], tests: [] }); }
  write(runner) {
    if (!process.env.BREAK_REPORT) return;
    writeFileSync(process.env.BREAK_REPORT, JSON.stringify({ runner, errors: this.errors, files: this.files }, null, 2));
  }

  // ---------- Vitest ----------
  onTestRunEnd(modules, unhandledErrors = []) {
    for (const m of modules) {
      const f = this.file(m.moduleId);
      for (const e of m.errors()) f.errors.push(head(e)); // did not load, or a file-level hook threw
      for (const s of m.children.allSuites()) for (const e of s.errors()) f.errors.push(`${s.fullName}: ${head(e)}`);
      for (const t of m.children.allTests()) {
        const r = t.result();
        const status = r.state === 'failed' ? 'failed' : r.state === 'passed' ? 'passed' : 'skipped';
        // Vitest marks each hook "run" before calling it and "pass" after it returns, so "run" at the end means it
        // threw. `task` is internal: if it ever disappears, say we cannot tell rather than count the failure as own.
        const hooks = t.task?.result ? t.task.result.hooks ?? {} : null;
        const hook = hooks === null ? (status === 'failed' ? '(cannot tell: vitest gave no hook state)' : null)
          : Object.keys(hooks).find((k) => hooks[k] === 'run') ?? null;
        const first = r.errors?.[0];
        f.tests.push({ name: t.fullName, status, hook, own: status === 'failed' && !hook && first?.name === 'AssertionError', message: head(first) });
      }
    }
    for (const e of unhandledErrors) this.errors.push(head(e));
    this.write('vitest');
  }

  // ---------- Playwright ----------
  printsToStdio() { return false; }
  onTestEnd(test, result) {
    const failed = ['failed', 'timedOut', 'interrupted'].includes(result.status);
    // Playwright files every hook and fixture under a step of category "hook" ("Before Hooks", "After Hooks"); an
    // "expect" step with an error outside those is the body's own assertion.
    const hookStep = (steps) => { for (const s of steps) if (s.category === 'hook' && s.error) return s.steps.find((c) => c.error)?.title ?? s.title; return null; };
    const ownExpect = (steps) => steps.some((s) => s.category !== 'hook' && ((s.category === 'expect' && s.error) || ownExpect(s.steps)));
    const hook = failed ? hookStep(result.steps) : null;
    const project = test.parent.project()?.name;
    this.file(test.location.file).tests.push({
      name: `${project ? `[${project}] ` : ''}${test.titlePath().slice(3).join(' > ') || test.title}`,
      status: failed ? 'failed' : result.status === 'skipped' ? 'skipped' : 'passed',
      hook, own: failed && !hook && result.status === 'failed' && ownExpect(result.steps), message: head(result.error?.message),
    });
  }
  onError(error) {
    if (error.location?.file) this.file(error.location.file).errors.push(head(error.message));
    else this.errors.push(head(error.message));
  }
  onEnd() { this.write('playwright'); }
}
