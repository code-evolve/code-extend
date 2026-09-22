/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// noinspection BadExpressionStatementJS

import {it, expect} from 'vitest'
import {createAsyncHook} from '../src'
import {asyncWait} from './async-wait'

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

// Renamed from 'bail' in 0.2.0, unchanged otherwise. It asserts that the FASTEST tap wins
// (tap 2 waits 5ms against tap 1's 10ms), which is the racing behaviour the async `bail` used to
// have. That behaviour was not removed, it was named: it is `race`, and it matches tapable's
// AsyncParallelBailHook. Before 0.2.0 this file could not be loaded -- it imported `@util-js`,
// declared nowhere -- so these assertions had never run.
it('race', async function () {
  const hook = createAsyncHook<() => number, void>({type: 'race'})
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

it('race reverse', async function () {
  const hook = createAsyncHook<() => number, void>({
    type: 'race',
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

// Also renamed: it asserts completion ORDER ['2','1'], i.e. taps running concurrently.
it('race no result', async function () {
  const hook = createAsyncHook<() => void, void>({type: 'race'})
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

// --- async `bail` is SERIES, matching the sync bail, the readme, and tapable ---------------
// Measured against tapable 2.3.3: AsyncSeriesBailHook calls ONE tap of two that both answer and
// returns its value; AsyncParallelBailHook calls two. Until 0.2.0 the async bail did the latter.

it('bail runs in series and returns the first answer, not the fastest', async function () {
  const hook = createAsyncHook<() => string | void, void>({type: 'bail'})
  const results = []

  hook.tap(async () => {
    await asyncWait(10)   // SLOWER, but first in order
    results.push('1')
    return 'first'
  })

  hook.tap(async () => {
    await asyncWait(1)
    results.push('2')
    return 'second'
  })

  expect(await hook.call()).to.equal('first')
  expect(results).to.eql(['1'])   // the second tap never runs
})

it('bail returns undefined when no tap answers, having run them all in order', async function () {
  const hook = createAsyncHook<() => string | void, void>({type: 'bail'})
  const results = []

  hook.tap(async () => { await asyncWait(10); results.push('1') })
  hook.tap(async () => { await asyncWait(1); results.push('2') })

  expect(await hook.call()).to.be.undefined
  expect(results).to.eql(['1', '2'])   // series order, not completion order
})
