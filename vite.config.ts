import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  mode: 'production',
  build: {
    // Ship sourcemaps. The library build mangles identifiers -- every function in dist/index.js is
    // a single letter and every comment is stripped -- so without a map a consumer's stack trace
    // points at `function M` and debugging into this package is guesswork.
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      name: 'code_extend',
      fileName: 'index',
    },
  },
  plugins: [
    dts({
      tsconfigPath: 'tsconfig.build.json',
      // `rollupTypes: true` runs api-extractor, which fails on this source with
      // "Internal Error: Unable to follow symbol for Partial" and ABORTS THE BUILD -- before the
      // UMD pass, so `dist/index.umd.cjs` was never written and `distribution.spec.ts` failed on a
      // file that simply was not there. Per-file declarations are emitted instead: `types` still
      // points at `dist/index.d.ts`, which re-exports them. One bundled .d.ts would be tidier;
      // a build that completes is worth more.
      rollupTypes: false,
      // Declarations are emitted per file, so every module in `src` produces one — including
      // `hookmap`, which nothing reachable from `index.ts` imports and whose code is therefore
      // absent from the bundle. Shipping its .d.ts would advertise an API with no runtime behind
      // it: a consumer sees the types, imports them, and finds nothing.
      //
      // `multihook` is NOT excluded, and was until 0.2.1. `interop/tapable-interop.ts` re-exports
      // `MultiHook`, so it is in the bundle as `Interop.MultiHook`, and the emitted
      // `interop/tapable-interop.d.ts` imports `../multihook`. Excluding it shipped a declaration
      // pointing at a file that was not there: TS2307 for any consumer without `skipLibCheck`.
      exclude: ['src/hookmap.ts'],
    })
  ]

})
