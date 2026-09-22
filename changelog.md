# 0.2.0

- breaking: `bail` now runs in **series** for async hooks, matching the sync `bail`, the readme, and
  tapable's `AsyncSeriesBailHook`. It previously raced every tap through `Promise.any`
- feat: add the `race` topology — every tap starts, the first to resolve wins. This is the behaviour
  the async `bail` used to have, and it matches tapable's `AsyncParallelBailHook`
- feat: expose `Interop.AsyncParallelBailHook`, which had no equivalent before
- fix: `bail` returns the value that caused it to bail. It short-circuited correctly but discarded
  the value, so `call` answered `undefined` whether a tap answered or none did
- fix: `waterfall` passes the accumulated value through a tap that returns nothing, matching tapable.
  A silent tap previously handed the literal `undefined` to the next tap
- fix: `vite build` completes. `rollupTypes` aborted it on "Unable to follow symbol for Partial",
  before the UMD pass, so `dist/index.umd.cjs` was never emitted
- test: three tests asserted the old behaviour rather than the contract; corrected, with notes.
  Verified against tapable 2.3.3 directly

# 0.1.1

- task: Upgrade dependencies

# 0.1.0

- breaking: Change parameter order of TAPDATA and CONTEXT
- fix: Fix typo in function name
- docs: Update docs

# 0.0.6

- fix: Fix types

# 0.0.5

- task: Rollup types

# 0.0.4

- task: Add dts plugin
- task: Upgrade dependencies

# 0.0.3

- docs: Update readme

# 0.0.2

- task: Upgrade dependencies
- docs: Update readme

# 0.0.1

- fix: restore prepack
- docs: Update readme

# 0.0.1-beta.7

- fix: disable prepack
- docs: Update readme

# 0.0.1-beta.6

- fix: Update types
- task: Update vitest, vitenode

# 0.0.1-beta.5

- fix: Fix interop types
- docs: Update readme
- docs: Update examples

# 0.0.1-beta.4

- task: Refactor types
- docs: Update parameter, usage, and error handling

# 0.0.1-beta.3

- task: Update docs
- fix: Remove console.log
- docs: Add usage overview
- docs: Add more interop info

# 0.0.1-beta.2

- task: Publish initial project
- task: Monkeypatch Tapable unit tests
- feat: Add Tapable interop

# 0.0.1-beta.1

- task: Publish initial project shell
