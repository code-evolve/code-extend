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
      // `hookmap` and `multihook`, which `index.ts` does NOT export and whose code is therefore
      // absent from the bundle. Shipping their .d.ts would advertise an API with no runtime behind
      // it: a consumer sees the types, imports them, and finds nothing. 0.1.2 shipped neither,
      // because the rolled-up build only ever emitted what the entry point reached.
      exclude: ['src/hookmap.ts', 'src/multihook.ts'],
    })
  ]

})
