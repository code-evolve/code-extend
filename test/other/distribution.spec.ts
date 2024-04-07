// noinspection DuplicatedCode

import {expect, test, vi} from 'vitest'

test('distribution - ES6', async () => {
  const {createSyncHook} = await import ('../../dist')
  const hook = createSyncHook<[string]>()
  const spy = vi.fn()
  hook.tap(spy)
  hook.call("1")
  hook.call("2")
  expect(spy).toHaveBeenCalledTimes(2)
  expect(spy).toHaveBeenNthCalledWith(1, "1")
  expect(spy).toHaveBeenNthCalledWith(2, "2")
})

test('distribution - CJS', async () => {
  const {createSyncHook} = await import ('../../dist/index.umd.cjs')
  const hook = createSyncHook<[string]>()
  const spy = vi.fn()
  hook.tap(spy)
  hook.call("1")
  hook.call("2")
  expect(spy).toHaveBeenCalledTimes(2)
  expect(spy).toHaveBeenNthCalledWith(1, "1")
  expect(spy).toHaveBeenNthCalledWith(2, "2")
})