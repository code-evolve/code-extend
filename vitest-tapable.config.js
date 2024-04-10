import { defineConfig } from 'vitest/config';
import { jestToViPlugin } from './src/interop/jest-to-vi-plugin.js';
import { fixupTapableTestsPlugin } from './interop/fixup-tapable-tests-plugin.js';

export default defineConfig({
  test: {
    globals: true,
    include: [
      `${process.env.TAPABLE_DIR}/lib/__tests__/SyncHooks.js`,
      `${process.env.TAPABLE_DIR}/lib/__tests__/AsyncSeriesHooks.js`,
      `${process.env.TAPABLE_DIR}/lib/__tests__/AsyncParallelHooks.js`,
      `${process.env.TAPABLE_DIR}/lib/__tests__/HookStackOverflow.js`,
      `${process.env.TAPABLE_DIR}/lib/__tests__/Multihook.js`,
    ],
    testTimeout: 15000
  },
  plugins: [
    fixupTapableTestsPlugin(),
    jestToViPlugin(),
  ]
})
