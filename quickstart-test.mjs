import { DisjointSet } from './index.js';

const ds = new DisjointSet();
ds.makeSetAll(['Alice', 'Bob', 'Carol', 'Dave', 'Eve']);
ds.union('Alice', 'Bob');
ds.union('Carol', 'Dave');

console.log('Alice-Bob connected:', ds.connected('Alice', 'Bob'));
console.log('Alice-Carol connected:', ds.connected('Alice', 'Carol'));
console.log('componentCount:', ds.componentCount);
console.log('componentSize(Alice):', ds.componentSize('Alice'));
console.log('components:', JSON.stringify(ds.components()));