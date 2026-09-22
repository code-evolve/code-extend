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
  // Was `expect(result).to.be.undefined`, which ASSERTED the defect: bail short-circuited
  // correctly but discarded the value that made it short-circuit. The async bail has always
  // returned it, so the two APIs disagreed and only the sync side was wrong. Fixed in 0.2.0.
  expect(result).to.equal(true)
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
  // Also asserted the defect — see the note on 'bail' above.
  expect(result).to.equal(true)
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

// --- Regressions for the 0.2.0 fixes ----------------------------------------------------
// Each test below fails against 0.1.2.

it('bail returns the value that caused the bail', function () {
  const hook = createSyncHook<() => string | void>({type: 'bail'})
  hook.tap(() => undefined)
  hook.tap(() => 'answered')
  hook.tap(() => 'never reached')
  expect(hook.call()).to.equal('answered')
})

it('bail returns undefined when nobody answers — declining stays distinguishable', function () {
  const hook = createSyncHook<() => string | void>({type: 'bail'})
  hook.tap(() => undefined)
  hook.tap(() => undefined)
  expect(hook.call()).to.be.undefined
})

it('waterfall passes the value through a tap that returns nothing', function () {
  const hook = createSyncHook<(a: string) => string | void>({type: 'waterfall'})
  hook.tap((v) => v + '-a')
  hook.tap(() => { /* contributes nothing */ })
  hook.tap((v) => v + '-c')
  // Against 0.1.2 this produced the literal string 'undefined-c'.
  expect(hook.call('start')).to.equal('start-a-c')
})

it('waterfall survives EVERY tap declining', function () {
  const hook = createSyncHook<(a: string) => string | void>({type: 'waterfall'})
  hook.tap(() => { /* nothing */ })
  hook.tap(() => { /* nothing */ })
  expect(hook.call('start')).to.equal('start')
})
