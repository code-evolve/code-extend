import {defineConfig} from 'vitest/config'
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
      rollupConfig: true,
    })
  ]

})
