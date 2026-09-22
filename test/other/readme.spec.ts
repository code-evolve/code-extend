/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {expect, test} from 'vitest'
import {createAsyncHook, createSyncHook} from '../../src'

// These transcribe the readme's examples. They used to `console.log` and assert NOTHING, so they
// proved only that the documented code does not throw — never that it produces the documented
// RESULT. That is how the readme's tapable-interop example survived for years while silently doing
// nothing. Each test now records what the example would have printed and asserts it, and the
// documented return values ('321' below) are checked rather than left in a comment.

test('Async hooks', async () => {
  const calls: string[] = []
  const asyncHook = createAsyncHook<(message: string) => void>()
  asyncHook.tap(message => { calls.push('Hook1 was called') })
  asyncHook.tap(message => { calls.push('Hook2 was called') })

  // tapPromise is Same as hook.tap
  asyncHook.tapPromise(message => { calls.push('Hook3 was called') })

  // tapAsync is the old-school callback API
  asyncHook.tapAsync((message, callback) => {
    calls.push('Hook4 was called')
    callback(null)
  })

  await asyncHook.call('Hello') // All taps called in series by default

  expect(calls).to.eql([
    'Hook1 was called',
    'Hook2 was called',
    'Hook3 was called',
    'Hook4 was called',
  ])
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

  // The readme says the return value is '321': reverse order appends '2' then '1', and the
  // throwing tap is skipped because onError is 'ignore'. Asserted rather than asserted in a comment.
  expect(await asyncHook.call('3')).to.equal('321')
})

test('Call filtering', () => {
  const withString: unknown[] = []
  const withNumber: unknown[] = []
  const syncHook = createSyncHook<[string | number], string>()
  syncHook.tap({data: 'string'}, (message) => { withString.push(message) })
  syncHook.tap({data: 'number'}, (message) => { withNumber.push(message) })
  syncHook.call2({
    filter: (data => data === 'string'),
    args: ['Hello']
  })
  syncHook.call2({
    filter: (data => data === 'number'),
    args: [12]
  })

  // Each call reaches ONLY the tap whose data the filter selected.
  expect(withString).to.eql(['Hello'])
  expect(withNumber).to.eql([12])
})
