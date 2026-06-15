#!/usr/bin/env node
import { DisjointSet } from './index.js';

const [cmd] = process.argv.slice(2);

function demo() {
  console.log('=== Disjoint Set Demo: Social Network ===\n');
  const ds = new DisjointSet();
  const people = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank'];
  ds.makeSetAll(people);
  console.log('People:', people.join(', '));
  console.log('Components:', ds.componentCount, '\n');

  ds.union('Alice', 'Bob');
  console.log('Alice <-> Bob');
  ds.union('Carol', 'Dave');
  console.log('Carol <-> Dave');
  ds.union('Eve', 'Frank');
  console.log('Eve <-> Frank');
  console.log('\nGroups:', ds.components().map(c => `[${c.join(', ')}]`).join(' '));

  ds.union('Alice', 'Carol');
  console.log('\nAlice <-> Carol (merging friend groups)');
  console.log(`Alice & Dave connected? ${ds.connected('Alice', 'Dave')}`);
  console.log(`Alice & Eve connected? ${ds.connected('Alice', 'Eve')}`);

  console.log(`\nFinal state (${ds.componentCount} components):`);
  for (const comp of ds.components()) {
    console.log(`  [${comp.join(' -- ')}]`);
  }
}

switch (cmd) {
  case 'demo': demo(); break;
  default:
    console.log(`disjoint-set-x CLI\n\nUsage: dsx demo`);
    if (cmd) { console.error(`\nUnknown command: ${cmd}`); process.exit(1); }
}
