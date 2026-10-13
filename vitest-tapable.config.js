import { defineConfig } from 'vitest/config';
import { jestToViPlugin } from './src/interop/jest-to-vi-plugin.js';
import { fixupTapableTestsPlugin } from './src/interop/fixup-tapable-tests-plugin.js';

// Runs tapable's own test suite against the interop. TAPABLE_DIR is a checkout of
// https://github.com/webpack/tapable, which this repository does not vendor.
if (!process.env.TAPABLE_DIR) {
  throw new Error('TAPABLE_DIR must name a checkout of webpack/tapable')
}

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
