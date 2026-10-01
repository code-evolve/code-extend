/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {expect, test, vi} from 'vitest'
import {createAsyncHook} from '../src'

test('tapable async hook - no options', async () => {
  const hook = createAsyncHook<[string]>()
  const results = []

  hook.tapAsync((arg, callback) => {
    results.push('1')
    if (arg !== '1') {
      return callback('expected "1"')
    }
    callback(null, undefined)
  })

  await hook.call('1')
  expect(results).to.eql(['1'])
})

test('tapable async hook - no context', async () => {
  const hook = createAsyncHook<[string]>()
  const results = []

  hook.tapAsync({context: false}, (arg, callback) => {
    results.push('1')
    if (arg !== '1') {
      return callback('expected "1"')
    }
    callback(null, undefined)
  })

  await hook.call('1')
  expect(results).to.eql(['1'])
})


test('tapable async hook - context', async () => {
  const hook = createAsyncHook<(a: string) => number, number>()
  const results = []

  hook.tapAsync({context: true}, (context, arg, callback) => {
    results.push('1')
    if (typeof context !== 'object') {
      return callback('expected context object')
    }
    if (arg !== '1') {
      return callback('expected "1"')
    }
    callback(null, undefined)
  })

  await hook.call('1')
  expect(results).to.eql(['1'])
})

test('tapable async hook - error', async () => {
  // This tap deliberately calls back with an error, and the default onError is 'log' -- so the
  // library correctly prints it. Suppress it here and assert it happened, rather than letting a
  // provoked exception scroll past in every test run.
  const spyLog = vi.spyOn(console, 'error').mockImplementation(() => {})
  const hook = createAsyncHook<(message:string) => string>({type: 'waterfall'})

  hook.tapAsync((message, callback) => {
    callback('no')
  })

  hook.tapAsync((message, callback) => {
    callback(null, '2')
  })

  const val = await hook.call('')
  expect(val).to.equal('2')
  expect(spyLog).toHaveBeenCalled()
  spyLog.mockRestore()
})
