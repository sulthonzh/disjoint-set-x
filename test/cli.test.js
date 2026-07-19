import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const CLI = new URL('../cli.js', import.meta.url);

function run(args = [], opts = {}) {
  return execFileSync(process.execPath, [CLI.pathname, ...args], {
    encoding: 'utf8',
    ...opts,
  });
}

test('CLI demo command produces expected output', () => {
  const out = run(['demo']);
  assert.match(out, /Disjoint Set Demo: Social Network/);
  assert.match(out, /People: Alice, Bob, Carol, Dave, Eve, Frank/);
  assert.match(out, /Components: 6/);
  assert.match(out, /Alice <-> Bob/);
  assert.match(out, /Carol <-> Dave/);
  assert.match(out, /Eve <-> Frank/);
  assert.match(out, /Alice <-> Carol/);
  assert.match(out, /Alice & Dave connected\? true/);
  assert.match(out, /Alice & Eve connected\? false/);
  assert.match(out, /2 components/);
});

test('CLI with no args shows usage', () => {
  const out = run([]);
  assert.match(out, /disjoint-set-x CLI/);
  assert.match(out, /Usage: dsx demo/);
});

test('CLI with unknown command shows error and exits 1', () => {
  assert.throws(() => {
    run(['unknown']);
  }, (err) => {
    assert.equal(err.status, 1);
    assert.match(err.stderr, /Unknown command: unknown/);
    return true;
  });
});

test('CLI demo output shows correct component structure', () => {
  const out = run(['demo']);
  // After all unions: Alice-Bob-Carol-Dave in one group, Eve-Frank in another
  assert.match(out, /\[Alice -- Bob -- Carol -- Dave\]|Dave -- Carol -- Bob -- Alice/);
  assert.match(out, /\[Eve -- Frank\]/);
});
