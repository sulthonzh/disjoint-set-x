/**
 * disjoint-set-x — Zero-dependency Union-Find (Disjoint Set) data structure.
 *
 * Path compression (iterative two-pass) + union by size or union by rank.
 * O(α(n)) amortized per operation — effectively O(1) for all practical inputs.
 *
 * @module disjoint-set-x
 */

export class DisjointSet {
  /**
   * @param {Object} [options]
   * @param {string} [options.strategy='size'] - 'size' or 'rank'
   */
  constructor(options = {}) {
    this._strategy = options.strategy === 'rank' ? 'rank' : 'size';
    this._parent = new Map();
    this._rank = new Map();
    this._size = new Map();
    this._count = 0;
  }

  /** Total number of elements. */
  get size() {
    return this._parent.size;
  }

  /** Number of disjoint components. */
  get componentCount() {
    return this._count;
  }

  /**
   * Add element x as a new singleton set.
   * No effect if x already exists.
   * @returns {DisjointSet} this (chaining)
   */
  makeSet(x) {
    if (!this._parent.has(x)) {
      this._parent.set(x, x);
      this._rank.set(x, 0);
      this._size.set(x, 1);
      this._count++;
    }
    return this;
  }

  /**
   * Add multiple elements.
   * @param {Iterable} elements
   * @returns {DisjointSet} this (chaining)
   */
  makeSetAll(elements) {
    for (const x of elements) this.makeSet(x);
    return this;
  }

  /**
   * Find the root (representative) of x's set.
   * Applies iterative path compression (two-pass).
   * @returns {*} Root element, or undefined if x doesn't exist.
   */
  find(x) {
    if (!this._parent.has(x)) return undefined;

    // Find root
    let root = x;
    while (this._parent.get(root) !== root) {
      root = this._parent.get(root);
    }

    // Path compression: point all nodes on path directly to root
    let cur = x;
    while (this._parent.get(cur) !== root) {
      const next = this._parent.get(cur);
      this._parent.set(cur, root);
      cur = next;
    }

    return root;
  }

  /**
   * Merge the sets containing x and y.
   * Auto-creates unknown elements.
   * @returns {boolean} true if merged, false if already same set.
   */
  union(x, y) {
    this.makeSet(x);
    this.makeSet(y);

    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;

    // Always track size (for componentSize), regardless of union strategy
    const sx = this._size.get(rx);
    const sy = this._size.get(ry);

    if (this._strategy === 'rank') {
      const rankX = this._rank.get(rx);
      const rankY = this._rank.get(ry);
      if (rankX < rankY) {
        this._parent.set(rx, ry);
        this._size.set(ry, sx + sy);
      } else if (rankX > rankY) {
        this._parent.set(ry, rx);
        this._size.set(rx, sx + sy);
      } else {
        this._parent.set(ry, rx);
        this._rank.set(rx, rankX + 1);
        this._size.set(rx, sx + sy);
      }
    } else {
      if (sx < sy) {
        this._parent.set(rx, ry);
        this._size.set(ry, sx + sy);
      } else {
        this._parent.set(ry, rx);
        this._size.set(rx, sx + sy);
      }
    }

    this._count--;
    return true;
  }

  /**
   * Check if x and y are in the same set.
   * @returns {boolean}
   */
  connected(x, y) {
    const rx = this.find(x);
    const ry = this.find(y);
    return rx !== undefined && rx === ry;
  }

  /**
   * Size of the component containing x.
   * @returns {number} 0 if x doesn't exist.
   */
  componentSize(x) {
    const root = this.find(x);
    return root !== undefined ? this._size.get(root) : 0;
  }

  /** Check if element x exists. */
  has(x) {
    return this._parent.has(x);
  }

  /**
   * Get all elements in the same component as x.
   * @returns {Array} Empty array if x doesn't exist.
   */
  members(x) {
    const root = this.find(x);
    if (root === undefined) return [];
    const result = [];
    for (const el of this._parent.keys()) {
      if (this.find(el) === root) result.push(el);
    }
    return result;
  }

  /**
   * Get all components.
   * @returns {Array<Array>}
   */
  components() {
    const groups = new Map();
    for (const el of this._parent.keys()) {
      const root = this.find(el);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(el);
    }
    return [...groups.values()];
  }

  /** Remove all elements. Returns this (chaining). */
  clear() {
    this._parent.clear();
    this._rank.clear();
    this._size.clear();
    this._count = 0;
    return this;
  }

  /** Iterate over all elements. */
  [Symbol.iterator]() {
    return this._parent.keys();
  }

  /** Serialize to plain object. */
  toJSON() {
    return {
      strategy: this._strategy,
      parent: [...this._parent.entries()],
      rank: [...this._rank.entries()],
      size: [...this._size.entries()],
      count: this._count,
    };
  }

  /** Deserialize from plain object. */
  static fromJSON(data) {
    const ds = new DisjointSet({ strategy: data.strategy });
    ds._parent = new Map(data.parent);
    ds._rank = new Map(data.rank);
    ds._size = new Map(data.size);
    ds._count = data.count;
    return ds;
  }

  /** Create a DisjointSet from an iterable of elements. */
  static from(iterable, options) {
    const ds = new DisjointSet(options);
    ds.makeSetAll(iterable);
    return ds;
  }
}

export default DisjointSet;
