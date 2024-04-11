/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {test} from 'vitest'
import {createAsyncHook, createSyncHook} from '../../src'

test('Async hooks', async () => {
  const asyncHook = createAsyncHook<(message: string) => void>()
  asyncHook.tap(message => console.log('Hook1 was called'))
  asyncHook.tap(message => console.log('Hook2 was called'))

  // tapPromise is Same as hook.tap
  asyncHook.tapPromise(message => console.log('Hook3 was called'))

  // tapAsync is the old-school callback API
  asyncHook.tapAsync((message, callback) => {
    console.log('Hook4 was called')
    callback(null)
  })

  await asyncHook.call('Hello') // All taps called in series by default
})

test('Async hook with options', async () => {
  const asyncHook = createAsyncHook<(string) => string>({
    type: 'waterfall',
    onError: 'ignore',
    reverse: true
  })
  asyncHook.tap(packet => packet + '1')
  asyncHook.tap(packet => {
    throw new Error('Should be ignored')
  })
  asyncHook.tap(packet => packet + '2')
  await asyncHook.call('3') // return value is '321'
})

test('Call filtering', () => {
  const syncHook = createSyncHook<[string | number], void, string>()
  syncHook.tap({data: 'string'}, (message) => console.log('withString', message))
  syncHook.tap({data: 'number'}, (message) => console.log('withNumber', message))
  syncHook.call2({
    filter: (data => data === 'string'),
    args: ['Hello']
  })
  syncHook.call2({
    filter: (data => data === 'number'),
    args: [12]
  })
})
