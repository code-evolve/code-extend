import {defineConfig} from 'vitest/config'

export default defineConfig({
  mode: 'production',
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'code_extend',
      fileName: 'index',
    },
  },

})