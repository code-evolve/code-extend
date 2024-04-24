/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// noinspection BadExpressionStatementJS

import {it, expect} from 'vitest'
import {createAsyncHook} from '../src'
import {asyncWait} from '../../../util'

it('series', async function () {
  const hook = createAsyncHook<() => number, void>({type: 'series'})
  const results = []

  hook.tap(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        results.push('1')
        resolve(1)
      }, 20)
    })
  })

  hook.tap(() => {
    results.push('2')
    return 2
  })

  expect(results).to.eql([])
  const promise = hook.call()
  expect(results).to.eql([])
  const result = await promise
  expect(result).to.be.undefined
  expect(results).to.eql(['1', '2'])
})

it('series reverse', async function () {
  const hook = createAsyncHook<() => number, void>({
    type: 'series',
    reverse: true
  })
  const results = []

  hook.tap(async () => {
    results.push('1')
    return 1
  })

  hook.tap(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        results.push('2')
        resolve(2)
      }, 20)
    })
  })

  expect(results).to.eql([])
  const promise = hook.call()
  expect(results).to.eql([])
  const result = await promise
  expect(result).to.be.undefined
  expect(results).to.eql(['2', '1'])
})

it('parallel', async function () {
  const hook = createAsyncHook<() => number, void>({type: 'parallel'})
  const results = []

  hook.tap(async () => {
    await asyncWait(10)
    results.push('1')
    return 1
  })

  hook.tap(async () => {
    await asyncWait(5)
    results.push('2')
    return 2
  })

  expect(results).to.eql([])
  const result = await hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['2', '1'])
})

it('parallel reverse', async function () {
  const hook = createAsyncHook<() => number, void>({
    type: 'parallel',
    reverse: true
  })
  const results = []

  hook.tap(async () => {
    results.push('1')
    return 1
  })

  hook.tap(async () => {
    results.push('2')
    return 2
  })

  expect(results).to.eql([])
  const result = await hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['2', '1'])
})

it('waterfall', async function () {
  const hook = createAsyncHook<(a: string) => string, void>({type: 'waterfall'})

  hook.tap(async (message) => {
    await asyncWait(10)
    return message + '1'
  })

  hook.tap(async (message) => {
    await asyncWait(5)
    return message + '2'
  })

  const processed = await hook.call('0')
  expect(processed).to.equal('012')
})

it('waterfall - no taps', async function () {
  const hook = createAsyncHook<(a: string) => string, void>({type: 'waterfall'})

  const processed = await hook.call('0')
  expect(processed).to.equal('0')
})

it('waterfall reverse', async function () {
  const hook = createAsyncHook<(a: string) => string, void>({
    type: 'waterfall',
    reverse: true
  })

  hook.tap(async (message) => {
    await asyncWait(10)
    return message + '1'
  })

  hook.tap(async (message) => {
    await asyncWait(10)
    return message + '2'
  })

  const processed = await hook.call('0')
  expect(processed).to.equal('021')
})

it('bail', async function () {
  const hook = createAsyncHook<() => number, void>({type: 'bail'})
  const results = []

  hook.tap(async () => {
    await asyncWait(10)
    results.push('1')
    return 1
  })

  hook.tap(async () => {
    await asyncWait(5)
    results.push('2')
    return 2
  })

  const res = await hook.call()
  expect(res).to.equal(2)
  expect(results).to.eql(['2'])
})

it('bail reverse', async function () {
  const hook = createAsyncHook<() => number, void>({
    type: 'bail',
    reverse: true
  })
  const results = []

  hook.tap(async () => {
    await asyncWait(10)
    results.push('1')
    return 1
  })

  hook.tap(async () => {
    await asyncWait(5)
    results.push('2')
    return 2
  })

  const res = await hook.call()
  expect(res).to.eql(2)
  expect(results).to.eql(['2'])
})

it('bail no result', async function () {
  const hook = createAsyncHook<() => void, void>({type: 'bail'})
  const results = []

  hook.tap(async () => {
    await asyncWait(10)
    results.push('1')
  })

  hook.tap(async () => {
    await asyncWait(5)
    results.push('2')
  })

  const res = await hook.call()
  expect(res).to.be.undefined
  expect(results).to.eql(['2', '1'])
})

it('loop', async function () {
  const hook = createAsyncHook<() => boolean | void, void>({type: 'loop'})
  const results = []
  let shouldLoop = true

  hook.tap(() => {
    results.push('1')
  })

  hook.tap(() => {
    results.push('2')
    if (shouldLoop) {
      shouldLoop = false
      return true
    } else {
      return undefined
    }
  })

  const result = await hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['1', '2', '1', '2'])
})

it('loop reverse', async function () {
  const hook = createAsyncHook<() => boolean | void, void>({
    type: 'loop',
    reverse: true
  })

  const results = []
  let shouldLoop = true

  hook.tap(() => {
    results.push('1')
    if (shouldLoop) {
      shouldLoop = false
      return true
    } else {
      return undefined
    }
  })

  hook.tap(() => {
    results.push('2')
  })

  const result = await hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['2', '1', '2', '1'])
})
