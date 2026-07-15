import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DisjointSet } from './index.js';

// === makeSet ===
test('makeSet creates singleton', () => {
  const ds = new DisjointSet();
  ds.makeSet('a');
  assert.equal(ds.find('a'), 'a');
  assert.equal(ds.size, 1);
  assert.equal(ds.componentCount, 1);
});

test('makeSet on existing element is no-op', () => {
  const ds = new DisjointSet();
  ds.makeSet('a');
  ds.makeSet('a');
  assert.equal(ds.size, 1);
  assert.equal(ds.componentCount, 1);
});

test('makeSet returns this for chaining', () => {
  const ds = new DisjointSet();
  assert.equal(ds.makeSet('a'), ds);
});

test('makeSetAll adds multiple elements', () => {
  const ds = new DisjointSet();
  ds.makeSetAll([1, 2, 3, 4, 5]);
  assert.equal(ds.size, 5);
  assert.equal(ds.componentCount, 5);
});

// === find ===
test('find returns undefined for non-existent', () => {
  const ds = new DisjointSet();
  assert.equal(ds.find('x'), undefined);
});

test('find returns root after unions', () => {
  const ds = new DisjointSet();
  ds.makeSetAll([1, 2, 3]);
  ds.union(1, 2);
  ds.union(2, 3);
  assert.equal(ds.find(1), ds.find(2));
  assert.equal(ds.find(2), ds.find(3));
});

// === union ===
test('union merges different sets', () => {
  const ds = new DisjointSet();
  ds.makeSetAll(['a', 'b']);
  assert.equal(ds.union('a', 'b'), true);
  assert.equal(ds.componentCount, 1);
});

test('union returns false for already connected', () => {
  const ds = new DisjointSet();
  ds.makeSetAll(['a', 'b']);
  ds.union('a', 'b');
  assert.equal(ds.union('a', 'b'), false);
});

test('union auto-creates unknown elements', () => {
  const ds = new DisjointSet();
  ds.union('x', 'y');
  assert.equal(ds.size, 2);
  assert.equal(ds.componentCount, 1);
  assert.ok(ds.connected('x', 'y'));
});

test('union chain reduces component count', () => {
  const ds = DisjointSet.from([1, 2, 3, 4, 5]);
  ds.union(1, 2); assert.equal(ds.componentCount, 4);
  ds.union(3, 4); assert.equal(ds.componentCount, 3);
  ds.union(2, 3); assert.equal(ds.componentCount, 2);
  ds.union(4, 5); assert.equal(ds.componentCount, 1);
});

// === connected ===
test('connected returns false for disconnected', () => {
  const ds = DisjointSet.from([1, 2]);
  assert.equal(ds.connected(1, 2), false);
});

test('connected returns true after union', () => {
  const ds = DisjointSet.from([1, 2]);
  ds.union(1, 2);
  assert.equal(ds.connected(1, 2), true);
});

test('connected returns false for non-existent', () => {
  const ds = new DisjointSet();
  assert.equal(ds.connected('x', 'y'), false);
});

test('connected is transitive', () => {
  const ds = DisjointSet.from([1, 2, 3, 4, 5]);
  ds.union(1, 2);
  ds.union(2, 3);
  ds.union(3, 4);
  ds.union(4, 5);
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 5; j++) {
      assert.ok(ds.connected(i, j), `${i} should be connected to ${j}`);
    }
  }
});

// === componentSize ===
test('componentSize returns correct size', () => {
  const ds = DisjointSet.from([1, 2, 3, 4]);
  ds.union(1, 2);
  ds.union(2, 3);
  assert.equal(ds.componentSize(1), 3);
  assert.equal(ds.componentSize(4), 1);
});

test('componentSize returns 0 for non-existent', () => {
  const ds = new DisjointSet();
  assert.equal(ds.componentSize('x'), 0);
});

// === components ===
test('components returns all groups', () => {
  const ds = DisjointSet.from([1, 2, 3, 4, 5]);
  ds.union(1, 2);
  ds.union(3, 4);
  const comps = ds.components();
  assert.equal(comps.length, 3);
  const sizes = comps.map(c => c.length).sort((a, b) => a - b);
  assert.deepEqual(sizes, [1, 2, 2]);
});

test('components returns singletons initially', () => {
  const ds = DisjointSet.from(['a', 'b', 'c']);
  const comps = ds.components();
  assert.equal(comps.length, 3);
  comps.forEach(c => assert.equal(c.length, 1));
});

// === members ===
test('members returns elements in same component', () => {
  const ds = DisjointSet.from([1, 2, 3]);
  ds.union(1, 2);
  const m = ds.members(1);
  assert.equal(m.length, 2);
  assert.ok(m.includes(1));
  assert.ok(m.includes(2));
  assert.ok(!m.includes(3));
});

test('members returns empty array for non-existent', () => {
  const ds = new DisjointSet();
  assert.deepEqual(ds.members('x'), []);
});

// === has ===
test('has returns correct boolean', () => {
  const ds = new DisjointSet();
  ds.makeSet('a');
  assert.equal(ds.has('a'), true);
  assert.equal(ds.has('b'), false);
});

// === clear ===
test('clear removes all elements', () => {
  const ds = DisjointSet.from([1, 2, 3]);
  ds.clear();
  assert.equal(ds.size, 0);
  assert.equal(ds.componentCount, 0);
  assert.equal(ds.has(1), false);
});

// === union by rank ===
test('union by rank maintains correct ranks', () => {
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll([1, 2, 3, 4]);
  ds.union(1, 2);
  ds.union(3, 4);
  ds.union(1, 3);
  const root = ds.find(1);
  assert.equal(ds._rank.get(root), 2);
});

// === union by size ===
test('union by size maintains correct sizes', () => {
  const ds = new DisjointSet({ strategy: 'size' });
  ds.makeSetAll([1, 2, 3, 4, 5]);
  ds.union(1, 2); assert.equal(ds.componentSize(1), 2);
  ds.union(1, 3); assert.equal(ds.componentSize(1), 3);
  ds.union(1, 4); assert.equal(ds.componentSize(1), 4);
  ds.union(1, 5); assert.equal(ds.componentSize(1), 5);
});

// === rank strategy: unequal rank branches ===
test('rank strategy: union attaches smaller rank tree under larger', () => {
  // Build trees of different ranks: tree A has rank 1, tree B has rank 0
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll([1, 2, 3]);
  ds.union(1, 2); // tree rooted at 1 now has rank 1
  ds.union(1, 3); // 3 has rank 0, should attach under 1 (rankX > rankY branch)
  assert.equal(ds.find(3), ds.find(1));
  assert.equal(ds._rank.get(ds.find(1)), 1); // rank unchanged
  assert.equal(ds.componentSize(1), 3);
});

test('rank strategy: rankX < rankY branch', () => {
  // Ensure the rankX < rankY branch is exercised
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll([1, 2, 3, 4]);
  // Build a rank-1 tree with 3,4
  ds.union(3, 4); // rank(3) = 1
  // Now union 1 (rank 0) with 3 (rank 1) — rankX < rankY
  ds.union(1, 3);
  const root = ds.find(1);
  assert.equal(root, ds.find(3)); // 1's tree attached under 3's root
  assert.equal(ds._rank.get(root), 1); // rank stays 1
  assert.equal(ds.componentSize(1), 3);
});

// === path compression ===
test('path compression flattens tree', () => {
  const ds = DisjointSet.from([1, 2, 3, 4, 5]);
  ds.union(1, 2);
  ds.union(2, 3);
  ds.union(3, 4);
  ds.union(4, 5);
  const root = ds.find(5);
  assert.equal(ds.find(1), root);
  assert.equal(ds.find(2), root);
  assert.equal(ds.find(3), root);
  assert.equal(ds.find(4), root);
  assert.equal(ds.find(5), root);
  let direct = 0;
  for (const el of [1, 2, 3, 4, 5]) {
    if (ds._parent.get(el) === root) direct++;
  }
  assert.ok(direct >= 2, `Expected >= 2 direct pointers, got ${direct}`);
});

// === serialization ===
test('toJSON/fromJSON roundtrip', () => {
  const ds = DisjointSet.from([1, 2, 3, 4, 5]);
  ds.union(1, 2);
  ds.union(3, 4);
  const restored = DisjointSet.fromJSON(ds.toJSON());
  assert.equal(restored.size, 5);
  assert.equal(restored.componentCount, 3);
  assert.equal(restored.connected(1, 2), true);
  assert.equal(restored.connected(3, 4), true);
  assert.equal(restored.connected(1, 3), false);
});

test('toJSON/fromJSON preserves strategy', () => {
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll([1, 2]);
  ds.union(1, 2);
  const restored = DisjointSet.fromJSON(ds.toJSON());
  assert.equal(restored._strategy, 'rank');
});

// === from ===
test('from creates DisjointSet from iterable', () => {
  const ds = DisjointSet.from(['x', 'y', 'z']);
  assert.equal(ds.size, 3);
  assert.equal(ds.componentCount, 3);
});

test('from with options', () => {
  const ds = DisjointSet.from([1, 2, 3], { strategy: 'rank' });
  assert.equal(ds._strategy, 'rank');
});

// === iterator ===
test('Symbol.iterator iterates all elements', () => {
  const ds = DisjointSet.from([1, 2, 3]);
  const els = [...ds];
  assert.equal(els.length, 3);
  assert.ok(els.includes(1));
  assert.ok(els.includes(2));
  assert.ok(els.includes(3));
});

// === stress ===
test('stress: 1000 elements, chain unions', () => {
  const ds = new DisjointSet();
  for (let i = 0; i < 1000; i++) ds.makeSet(i);
  assert.equal(ds.size, 1000);
  for (let i = 0; i < 999; i++) ds.union(i, i + 1);
  assert.equal(ds.componentCount, 1);
  assert.equal(ds.componentSize(0), 1000);
  assert.ok(ds.connected(0, 999));
});

test('stress: random unions consistency', () => {
  const ds = DisjointSet.from(Array.from({ length: 100 }, (_, i) => i));
  for (let i = 0; i < 50; i++) {
    const a = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    ds.union(a, b);
  }
  for (const el of ds) assert.notEqual(ds.find(el), undefined);
  const comps = ds.components();
  const total = comps.reduce((s, c) => s + c.length, 0);
  assert.equal(total, 100);
});

// === properties ===
test('size getter is accurate', () => {
  const ds = new DisjointSet();
  ds.makeSetAll([1, 2, 3]);
  assert.equal(ds.size, 3);
  ds.makeSet(4);
  assert.equal(ds.size, 4);
});

test('componentCount getter tracks merges', () => {
  const ds = DisjointSet.from([1, 2, 3, 4]);
  assert.equal(ds.componentCount, 4);
  ds.union(1, 2); assert.equal(ds.componentCount, 3);
  ds.union(3, 4); assert.equal(ds.componentCount, 2);
  ds.union(1, 3); assert.equal(ds.componentCount, 1);
});

// === strategy defaults ===
test('default strategy is size', () => {
  assert.equal(new DisjointSet()._strategy, 'size');
});

test('invalid strategy falls back to size', () => {
  assert.equal(new DisjointSet({ strategy: 'bogus' })._strategy, 'size');
});

// === componentSize with rank strategy (bug fix) ===
test('componentSize works with rank strategy', () => {
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll([1, 2, 3, 4, 5]);
  ds.union(1, 2);
  ds.union(1, 3);
  ds.union(1, 4);
  ds.union(1, 5);
  assert.equal(ds.componentSize(1), 5);
  assert.equal(ds.componentSize(3), 5);
});

test('componentSize consistent across strategies', () => {
  const sizeDS = DisjointSet.from([1, 2, 3, 4], { strategy: 'size' });
  const rankDS = DisjointSet.from([1, 2, 3, 4], { strategy: 'rank' });
  sizeDS.union(1, 2); sizeDS.union(2, 3); sizeDS.union(3, 4);
  rankDS.union(1, 2); rankDS.union(2, 3); rankDS.union(3, 4);
  assert.equal(sizeDS.componentSize(1), rankDS.componentSize(1));
});

// === members with rank strategy ===
test('members works with rank strategy', () => {
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll(['a', 'b', 'c']);
  ds.union('a', 'b');
  const m = ds.members('a');
  assert.equal(m.length, 2);
  assert.ok(m.includes('a'));
  assert.ok(m.includes('b'));
});

// === components with rank strategy ===
test('components works with rank strategy', () => {
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll([1, 2, 3, 4, 5]);
  ds.union(1, 2);
  ds.union(3, 4);
  const comps = ds.components();
  assert.equal(comps.length, 3);
  const sizes = comps.map(c => c.length).sort((a, b) => a - b);
  assert.deepEqual(sizes, [1, 2, 2]);
});

// === toJSON/fromJSON with rank strategy ===
test('toJSON/fromJSON roundtrip with rank strategy', () => {
  const ds = new DisjointSet({ strategy: 'rank' });
  ds.makeSetAll([1, 2, 3, 4]);
  ds.union(1, 2);
  ds.union(3, 4);
  ds.union(1, 3);
  const restored = DisjointSet.fromJSON(ds.toJSON());
  assert.equal(restored.size, 4);
  assert.equal(restored.componentCount, 1);
  assert.equal(restored.componentSize(1), 4);
  assert.ok(restored.connected(2, 4));
});

// === numeric vs string keys ===
test('handles numeric keys correctly', () => {
  const ds = new DisjointSet();
  ds.makeSetAll([0, 1, 2]);
  ds.union(0, 1);
  assert.ok(ds.connected(0, 1));
  assert.ok(!ds.connected(0, 2));
});

test('handles object keys (by reference)', () => {
  const ds = new DisjointSet();
  const a = { id: 'a' };
  const b = { id: 'b' };
  ds.makeSet(a);
  ds.makeSet(b);
  ds.union(a, b);
  assert.ok(ds.connected(a, b));
  assert.equal(ds.componentSize(a), 2);
});

// === empty components ===
test('empty DisjointSet components returns []', () => {
  const ds = new DisjointSet();
  assert.deepEqual(ds.components(), []);
});

// === clear allows reuse ===
test('clear allows reuse', () => {
  const ds = DisjointSet.from([1, 2, 3]);
  ds.union(1, 2);
  ds.clear();
  assert.equal(ds.size, 0);
  ds.makeSetAll(['x', 'y']);
  ds.union('x', 'y');
  assert.equal(ds.componentCount, 1);
  assert.ok(ds.connected('x', 'y'));
});
