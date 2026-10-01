/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {expect, test, vi} from 'vitest'
import {createAsyncHook, createSyncHook, Hook, HookInfo} from '../src'
import {MultiHook} from '../src/multihook'

const types: [string, () => Hook][] = [
  ["tap", () => createSyncHook()],
  ["tap", () => createAsyncHook()],
  ["tapPromise", () => createAsyncHook()],
  ["tapAsync", () => createAsyncHook()],
]
for (const type of types) {
  test(`tap of ${type[0]}`, () => {
    const hook = type[1]()
    const spy = vi.spyOn(hook, type[0] as any)

    const opts = {}
    const callback = () => {
    }
    new MultiHook([hook, hook])[type[0]](opts, callback)
    expect(spy.mock.calls).to.eql([
      [opts, callback],
      [opts, callback],
    ])
  })
}

test("intercept", () => {
  const hook = createSyncHook()
  const spy = vi.spyOn(hook, 'intercept')

  const interceptor = {}
  new MultiHook([hook, hook]).intercept({})

  expect(spy.mock.calls).to.eql([[interceptor], [interceptor]])
})

test("setInfo", () => {
  const hook = createSyncHook()

  const options: Partial<HookInfo> = {type: "series",}
  const options2: Partial<HookInfo> = {type: 'parallel'}

  expect(hook.getInfo().type).to.eql('series')
  const multihook = new MultiHook([hook, hook]).setInfo(options2)
  expect(hook.getInfo().type).to.eql('parallel')
  multihook.setInfo(options)
  expect(hook.getInfo().type).to.eql('series')
})

// test("withOptions", () => {
//   const hook = createSyncHook()
//   const spy = vi.spyOn(hook, 'withOptions')
//
//   const options: CreateHookOptionObj = {type: "series",}
//   const options2: CreateHookOptionObj = {type: 'parallel'}
//
//   const multihook = new MultiHook([hook, hook]).withOptions(options)
//   const callback = () => {
//   }
//   multihook.tap(options2, callback)
//   expect(spy.mock.calls).to.eql([
//     [options],
//     [options],
//     [
//       options2,
//       callback
//     ],
//     [
//       options2,
//       callback
//     ],
//   ])
// })

test("isUsed", () => {
  const hook1 = createSyncHook()
  const hook2 = createSyncHook()

  hook1.tap(() => {
  })

  expect(new MultiHook([hook1, hook1]).isUsed()).to.be.true
  expect(new MultiHook([hook1, hook2]).isUsed()).to.be.true
  expect(new MultiHook([hook2, hook2]).isUsed()).to.be.false
})
