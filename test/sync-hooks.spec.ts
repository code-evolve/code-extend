/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// noinspection BadExpressionStatementJS

import {expect, it} from 'vitest'
import {createSyncHook} from '../src'

it('series', function () {
  const hook = createSyncHook<[]>({type: 'series'})
  const results = []

  hook.tap(() => {
    results.push('1')
  })

  hook.tap(() => {
    results.push('2')
  })

  const result = hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['1', '2'])
})

it('series reverse', function () {
  const hook = createSyncHook<() => void>({
    type: 'series',
    reverse: true
  })
  const results = []

  hook.tap(() => {
    results.push('1')
  })

  hook.tap(() => {
    results.push('2')
  })

  // noinspection JSVoidFunctionReturnValueUsed
  const result = hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['2', '1'])
})

it('waterfall', function () {
  const hook = createSyncHook<(a: string) => string>({type: 'waterfall'})

  hook.tap(message => message + '1')
  hook.tap(message => message + '2')

  const processed = hook.call('0')
  expect(processed).to.equal('012')
})

it('waterfall reverse', function () {
  const hook = createSyncHook({
    type: 'waterfall',
    reverse: true
  })

  hook.tap(message => message + '1')
  hook.tap(message => message + '2')

  const processed = hook.call('0')
  expect(processed).to.equal('021')
})

it('bail', function () {
  const hook = createSyncHook<() => boolean | void>({type: 'bail'})
  const results = []

  hook.tap(() => {
    results.push('1')
    return true
  })

  hook.tap(() => {
    results.push('2')
  })

  const result = hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['1'])
})

it('bail reverse', function () {
  const hook = createSyncHook<() => true | void, void>({
    type: 'bail',
    reverse: true
  })
  const results = []

  hook.tap(() => {
    results.push('1')
  })

  hook.tap(() => {
    results.push('2')
    return true
  })

  const result = hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['2'])
})

it('loop', function () {
  const hook = createSyncHook<() => boolean | void>({type: 'loop'})
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

  const result = hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['1', '1', '2'])
})

it('loop reverse', function () {
  const hook = createSyncHook<() => boolean | void>({
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

  const result = hook.call()
  expect(result).to.be.undefined
  expect(results).to.eql(['2', '1', '2', '1'])
})
