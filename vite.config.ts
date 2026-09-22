import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  mode: 'production',
  build: {
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
    })
  ]

})
