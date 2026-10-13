# 0.2.1

- fix: ship `dist/multihook.d.ts`. `dist/interop/tapable-interop.d.ts` re-exports `MultiHook` from
  `../multihook`, and 0.2.0 excluded that declaration from the build, so a consumer typechecking
  without `skipLibCheck` got `TS2307: Cannot find module '../multihook'`. The runtime was never
  affected: `Interop.MultiHook` has been in the bundle throughout
- fix: the declarations typecheck under TypeScript's `nodenext` resolution. Relative imports in
  `src` had no file extension, so every shipped `.d.ts` failed with TS2834 and the entry point
  exported nothing to a `nodenext` consumer. 0.1.2 was unaffected because its declarations were
  rolled into one file; 0.2.0 introduced it
- test: every relative import in a shipped declaration must carry an extension and resolve to a
  shipped file
- docs: the readme said `Multihook` is not exported. It is, as `Interop.MultiHook`
- docs: say what declines. Only `undefined` does: `bail` treats `null` as an answer, and
  `waterfall` treats `null` and `''` as values
- task: the author and copyright holder are Steven Spungin, in `package.json`, `license.txt` and
  the licence header of every shipped file. The `twelvetone` keyword is removed. The licence is
  still MIT

# 0.2.0

- breaking: `bail` now runs in **series** for async hooks, matching the sync `bail`, the readme, and
  tapable's `AsyncSeriesBailHook`. It previously raced every tap through `Promise.any`
- feat: add the `race` topology: every tap starts, the first to resolve wins. This is the behaviour
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
- fix: `race` no longer logs an error when no tap answers. `Promise.any` rejects once every tap has
  rejected, and a tap returning `undefined` is rejected internally, so the normal "nobody answered"
  outcome arrived as an AggregateError and was logged. A real exception in a tap is still reported
- fix: the type documentation had the second and third template parameters the wrong way round. The
  signature is PARAMS, TAPDATA, CONTEXT; the comment said context was second, and `context.spec.ts`
  was written from the comment. Nothing caught it because the tests were never typechecked
- task: bump vite to ^5.4.21 and vitest to ^1.6.1 within their majors, clearing 13 of 17 advisories
  including one critical. Both are devDependencies; this package has no runtime dependencies at all,
  so none of them ever reached a consumer. The remaining four need vite 6.4.2+ and vitest 3.2.6+
- task: tests no longer print. Four `vi.spyOn(console, 'error')` calls recorded the call but had no
  mock implementation, so they called through and every deliberately provoked exception was printed
- fix: `samples/example.cjs` runs. It had top-level `await` in a CommonJS file, so
  `node samples/example.cjs` threw a SyntaxError, including in the published 0.1.2. Its test had
  imported the file through vitest, which transforms it and supports top-level await, so the test
  environment was not the user's and could not see the defect. The test now runs it under plain node
- fix: stop shipping `dist/hookmap.d.ts` and `dist/multihook.d.ts`. Neither module is exported from
  the entry point and neither is in the bundle, so those declarations described an API with no
  runtime behind it. The readme's feature table now says so rather than claiming both are available
- feat: ship `src`, `test` and sourcemaps. The library build mangles identifiers and strips comments, so
  `dist/index.js` was unreadable (every function a single letter), and a consumer's stack trace
  pointed into it with no way back. There is nothing in this package worth withholding, and the
  cost is a tarball of 53 kB instead of 17 kB. The tests ship for the same reason: they are the
  evidence for what this package claims, including its conformance against tapable 2.3.3
- fix: sourcemaps are excluded from the licence-header step. A `.map` is JSON, and prepending a
  comment block to it makes it invalid, so every debugger would have silently fallen back to the
  mangled bundle
- feat: add an `exports` map. `require` now resolves to the UMD build, so CommonJS consumers work on
  Node below 22.12, where `require` of an ES module fails outright. Deep paths under `dist/` still
  resolve, so nothing that reached for the UMD build by hand breaks

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
