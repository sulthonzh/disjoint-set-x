# disjoint-set-x

Zero-dependency [Union-Find (Disjoint Set)](https://en.wikipedia.org/wiki/Disjoint-set_data_structure) with path compression and union by size/rank.

O(α(n)) amortized per operation — α is the inverse Ackermann function, effectively O(1) for all practical inputs.

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

## Use Cases

- **Graph algorithms**: Kruskal's MST, connected components, cycle detection
- **Network connectivity**: percolation, social network analysis
- **Image processing**: connected component labeling
- **Type systems**: unification, equivalence classes
- **Dynamic connectivity**: online pair queries

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
