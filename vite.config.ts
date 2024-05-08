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
      rollupTypes: true,
    })
  ]

})
