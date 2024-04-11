/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// noinspection DuplicatedCode

import {expect, suite, test, vi} from 'vitest'
import {ITapableAsyncHook, ITapableSyncHook} from '../../src/interop/tapable-interop'

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

test('example', async () => {
  await import ('../../samples/example.cjs')
})

suite('Tapable interop', () => {
  test('SyncHook', async () => {
    const {Interop} = await import ('../../dist')
    const hook = new Interop.SyncHook(['message']) as ITapableSyncHook
    const spy = vi.fn()
    hook.tap('h1', spy)
    hook.call("1")
    expect(spy).toHaveBeenLastCalledWith("1")
  })

  test('AsyncHook', async () => {
    const {Interop} = await import ('../../dist')
    const hook = new Interop.AsyncSeriesHook(['message']) as ITapableAsyncHook
    const spy = vi.fn()
    hook.tap('h1', spy)
    expect(hook.call).to.be.undefined
    await hook.promise("1")
    await new Promise(result=> hook.callAsync("2", result))
    expect(spy).toHaveBeenNthCalledWith(1,"1")
    expect(spy).toHaveBeenNthCalledWith(2,"2")
  })
})
