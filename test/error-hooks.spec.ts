/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {expect, describe, it, vi, afterEach} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'

afterEach(() => {
  vi.clearAllMocks()
})

describe('sync hooks - errors', () => {
  it('should log on exception by default', async function () {
    const hook = createSyncHook()
    const results = []
    const spyLog = vi.spyOn(console, 'error').mockImplementation(() => {})

    hook.tap(() => {
      throw new Error('Hey')
    })

    hook.tap(() => {
      results.push('2')
    })

    await hook.call()
    expect(results).to.eql(['2'])
    expect(spyLog).toBeCalledTimes(1)
  })

  it('should ignore on exception', async function () {
    const hook = createSyncHook({onError: 'ignore'})
    const results = []
    const spyLog = vi.spyOn(console, 'error').mockImplementation(() => {})

    hook.tap(() => {
      throw new Error('Hey')
    })

    hook.tap(() => {
      results.push('2')
    })

    await hook.call()
    expect(spyLog).toBeCalledTimes(0)
  })

  it('should throw on exception', function () {
    const hook = createSyncHook({onError: 'throw'})
    const results = []

    hook.tap(() => {
      throw new Error('Hey')
    })

    hook.tap(() => {
      results.push('2')
    })

    expect(() => hook.call()).to.throw()
  })
})

describe('async hooks - errors', () => {
  it('should log on exception by default', async function () {
    const hook = createAsyncHook()
    const results = []
    const spyLog = vi.spyOn(console, 'error').mockImplementation(() => {})

    hook.tap(async () => {
      throw new Error('Hey')
    })

    hook.tap(async () => {
      results.push('2')
    })

    await hook.call()

    expect(results).to.eql(['2'])
    expect(spyLog).toBeCalledTimes(1)
  })

  it('should ignore on exception', async function () {
    const hook = createAsyncHook({onError: 'ignore'})
    const results = []
    const spyLog = vi.spyOn(console, 'error').mockImplementation(() => {})

    hook.tap(async () => {
      throw new Error('Hey')
    })

    hook.tap(async () => {
      results.push('2')
    })

    await hook.call()

    expect(results).to.eql(['2'])
    expect(spyLog).toBeCalledTimes(0)
  })

  it('should throw on exception', async () => {
    const hook = createAsyncHook({onError: 'throw'})
    const results = []

    hook.tap(async () => {
      throw new Error('Hey')
    })

    hook.tap(async () => {
      results.push('2')
    })

    await hook.call().then(
      () => {
        throw new Error('Expected hook.call to throw')
      },
      () => {
      })
  })
})