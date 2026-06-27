# disjoint-set-x

Zero-dependency [Union-Find (Disjoint Set)](https://en.wikipedia.org/wiki/Disjoint-set_data_structure) with path compression and union by size/rank.

O(α(n)) amortized per operation — α is the inverse Ackermann function, effectively O(1) for all practical inputs. Supports both **union by size** and **union by rank** strategies.

## Why this over alternatives?

| Feature | disjoint-set-x | union-find | disjoint-set | wuf |
|---|---|---|---|---|
| Dependencies | **0** | 0 | 0 | 0 |
| Union strategies | **size + rank** | size only | size only | size only |
| Path compression | **✅ iterative two-pass** | ✅ | ❌ | ✅ |
| Auto-create on union | **✅** | ❌ | ❌ | ❌ |
| Serialization | **✅ toJSON/fromJSON** | ❌ | ❌ | ❌ |
| Iterator support | **✅** | ❌ | ❌ | ❌ |
| CLI included | **✅** | ❌ | ❌ | ❌ |
| Test coverage | **99.1%** | ? | ? | ? |

## Install

```bash
npm install disjoint-set-x
```

## Quick Start

```js
import { DisjointSet } from 'disjoint-set-x';

const ds = new DisjointSet();

ds.makeSetAll(['Alice', 'Bob', 'Carol', 'Dave', 'Eve']);

ds.union('Alice', 'Bob');
ds.union('Carol', 'Dave');

ds.connected('Alice', 'Bob');   // true
ds.connected('Alice', 'Carol'); // false
ds.componentCount;              // 3
ds.componentSize('Alice');      // 2
ds.components();
// [['Alice', 'Bob'], ['Carol', 'Dave'], ['Eve']]
```

## API

### `new DisjointSet(options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strategy` | `'size' \| 'rank'` | `'size'` | Union strategy |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `makeSet(x)` | `this` | Add element as singleton set |
| `makeSetAll(iterable)` | `this` | Add multiple elements |
| `find(x)` | `* \| undefined` | Find root of x's set (with path compression) |
| `union(x, y)` | `boolean` | Merge sets containing x and y. Auto-creates unknown elements |
| `connected(x, y)` | `boolean` | Check if x and y are in the same set |
| `componentSize(x)` | `number` | Size of x's component (0 if not found) |
| `members(x)` | `Array` | All elements in x's component |
| `components()` | `Array<Array>` | All components |
| `has(x)` | `boolean` | Check if x exists |
| `clear()` | `this` | Remove everything |
| `toJSON()` | `Object` | Serialize |

### Properties

- `size` — Total elements
- `componentCount` — Number of disjoint sets

### Static

- `DisjointSet.fromJSON(data)` — Deserialize
- `DisjointSet.from(iterable, options?)` — Create from iterable
- `Symbol.iterator` — Iterate over all elements

## Real-World Examples

### 1. Detect Cycles in an Undirected Graph (Kruskal's MST)

```js
import { DisjointSet } from 'disjoint-set-x';

function hasCycle(edges, nodeCount) {
  const ds = new DisjointSet();
  for (let i = 0; i < nodeCount; i++) ds.makeSet(i);

  for (const [u, v] of edges) {
    if (ds.connected(u, v)) return true; // cycle found
    ds.union(u, v);
  }
  return false;
}

// Graph: 0--1--2--0 (triangle = cycle)
console.log(hasCycle([[0,1],[1,2],[2,0]], 3)); // true
// Tree: 0--1, 0--2 (no cycle)
console.log(hasCycle([[0,1],[0,2]], 3)); // false
```

### 2. Group Connected Components in a Social Network

```js
import { DisjointSet } from 'disjoint-set-x';

const friendships = [
  ['Alice', 'Bob'], ['Bob', 'Carol'],
  ['Dave', 'Eve'], ['Frank', 'Grace'],
];

const ds = new DisjointSet();
for (const [a, b] of friendships) ds.union(a, b);

const friendGroups = ds.components();
// [['Alice','Bob','Carol'], ['Dave','Eve'], ['Frank','Grace']]

// Check if two people are in the same friend circle
ds.connected('Alice', 'Carol'); // true
ds.connected('Alice', 'Dave');  // false
```

### 3. Grid Percolation Detection

```js
import { DisjointSet } from 'disjoint-set-x';

// Check if a grid percolates (top connects to bottom)
function percolates(grid, n) {
  const TOP = n * n, BOTTOM = n * n + 1;
  const ds = DisjointSet.from(Array.from({ length: n * n + 2 }, (_, i) => i));

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!grid[r][c]) continue;
      const idx = r * n + c;
      if (r === 0) ds.union(idx, TOP);
      if (r === n - 1) ds.union(idx, BOTTOM);
      if (r > 0 && grid[r-1][c]) ds.union(idx, (r-1)*n + c);
      if (c > 0 && grid[r][c-1]) ds.union(idx, r*n + c - 1);
    }
  }
  return ds.connected(TOP, BOTTOM);
}
```

## Performance

| Operation | Amortized |
|-----------|-----------|
| makeSet | O(1) |
| find | O(α(n)) |
| union | O(α(n)) |
| connected | O(α(n)) |

α(n) < 5 for all n ≤ 10^1948.

## License

MIT
