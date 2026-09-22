/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {expect, test, vi} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'

test('sync hook', () => {
  const syncHook = createSyncHook<[string | number], string>()

  const spy1 = vi.fn()
  syncHook.tap({data: 'string'}, spy1)

  const spy2 = vi.fn()
  syncHook.tap({data: 'number'}, spy2)

  const spy3 = vi.fn()
  syncHook.tap(spy3)

  syncHook.call2({
    filter: (data => data === 'string'),
    args: ['Hello']
  })

  syncHook.call2({
    filter: (data => data === 'number'),
    args: [12]
  })

  expect(spy1).toHaveBeenCalledTimes(1)
  expect(spy1).toHaveBeenCalledWith('Hello')
  expect(spy2).toHaveBeenCalledTimes(1)
  expect(spy2).toHaveBeenCalledWith(12)
  expect(spy3).toHaveBeenCalledTimes(0)
})

test('async hook', async () => {
  const asyncHook = createAsyncHook<[string|number], string>({onError: 'throw'})

  const spy1 = vi.fn()
  spy1.mockResolvedValue(() => undefined)
  asyncHook.tap({data: 'string'}, spy1)

  const spy2 = vi.fn()
  spy2.mockResolvedValue(() => undefined)
  asyncHook.tap({data: 'number'}, spy2)

  const spy3 = vi.fn()
  spy3.mockResolvedValue(() => undefined)
  asyncHook.tap(spy3)

  await asyncHook.call2({
    filter: (data => data === 'string'),
    args: ['Hello']
  })

  await asyncHook.call2({
    filter: (data => data === 'number'),
    args: [12]
  })

  expect(spy1).toHaveBeenCalledTimes(1)
  expect(spy1).toHaveBeenCalledWith('Hello')
  expect(spy2).toHaveBeenCalledTimes(1)
  expect(spy2).toHaveBeenCalledWith(12)
  expect(spy3).toHaveBeenCalledTimes(0)
})