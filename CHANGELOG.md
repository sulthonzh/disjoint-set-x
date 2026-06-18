# Changelog

## [1.1.0] - 2026-06-18

### Fixed
- **Critical**: `componentSize()` returned incorrect results when using `strategy: 'rank'`.
  The `_size` map was not updated during rank-based unions. Now both strategies track
  component sizes correctly.

### Added
- Tests for `componentSize`, `members`, `components`, and `toJSON/fromJSON` with rank strategy
- Tests for numeric/object keys, empty set, and clear-reuse edge cases
- CHANGELOG.md

## [1.0.0] - 2026-06-15

### Initial Release
- Union-Find (Disjoint Set) with path compression (iterative two-pass)
- Union by size or union by rank strategies
- O(α(n)) amortized per operation
- `makeSet`, `makeSetAll`, `find`, `union`, `connected`, `componentSize`, `members`, `components`
- `toJSON`/`fromJSON` serialization
- `DisjointSet.from()` static factory
- `Symbol.iterator` support
- CLI with demo command
- 36 tests, zero dependencies
