import {expect, describe, it} from 'vitest'
import {createAsyncHook} from '../src/hooks'

describe('async hooks', async () => {
  it('should series', async function () {
    const hook = createAsyncHook({type: 'series'})
    const results = []

    hook.tap(async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          results.push('1')
          resolve(undefined)
        }, 20)
      })
    })

    hook.tap(() => {
      results.push('2')
    })

    await hook.call()

    expect(results).to.eql(['1', '2'])
  })

  it('should series reverse', async function () {
    const hook = createAsyncHook({type: 'series', reverse: true})
    const results = []

    hook.tap(async () => {
      results.push('1')
    })

    hook.tap(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          results.push('2')
          resolve(undefined)
        }, 20)
      })
    })

    await hook.call()

    expect(results).to.eql(['2', '1'])
  })

  it('should parallel', async function () {
    const hook = createAsyncHook({type: 'parallel'})
    const results = []

    hook.tap(() => {
      results.push('1')
    })

    hook.tap(() => {
      results.push('2')
    })

    await hook.call()

    expect(results).to.eql(['1', '2'])
  })

  it('should parallel reverse', async function () {
    const hook = createAsyncHook({type: 'series', reverse: true})
    const results = []

    hook.tap(() => {
      results.push('1')
    })

    hook.tap(() => {
      results.push('2')
    })

    await hook.call()

    expect(results).to.eql(['2', '1'])
  })

  it('should waterfall', async function () {
    const hook = createAsyncHook({type: 'waterfall'})

    hook.tap((message) => {
      return message + '1'
    })

    hook.tap((message) => {
      return message + '2'
    })

    const processed = await hook.call('0')

    expect(processed).to.equal('012')
  })

  it('should reverse waterfall', async function () {
    const hook = createAsyncHook({type: 'waterfall', reverse: true})

    hook.tap((message) => {
      return message + '1'
    })

    hook.tap((message) => {
      return message + '2'
    })

    const processed = await hook.call('0')

    expect(processed).to.equal('021')
  })

  it('should bail', async function () {
    const hook = createAsyncHook({type: 'bail'})
    const results = []

    hook.tap(() => {
      results.push('1')
      return true
    })

    hook.tap(() => {
      results.push('2')
    })

    await hook.call()
    expect(results).to.eql(['1'])
  })

  it('should bail reverse', async function () {
    const hook = createAsyncHook({type: 'bail', reverse: true})
    const results = []

    hook.tap(() => {
      results.push('1')
    })

    hook.tap(() => {
      results.push('2')
      return true
    })

    await hook.call()
    expect(results).to.eql(['2'])
  })

  it('should loop', async function () {
    const hook = createAsyncHook({type: 'loop'})

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

    await hook.call()
    expect(results).to.eql(['1', '1', '2'])
  })

  it('should loop reverse', async function () {
    const hook = createAsyncHook({type: 'loop', reverse: true})

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

    await hook.call()
    expect(results).to.eql(['2', '1', '2', '1'])
  })

  it('should accept context', async function () {
    const hook = createAsyncHook({args: ["message"], type: 'series'})
    let _context, _message

    hook.tap({
      context: true
    }, (context, message) => {
      context.value = 'a'
      _message = message
    })

    hook.tap({
      context: true
    }, (context, message) => {
      _context = context
      _message = message
    })

    await hook.call('Hello')

    expect(_context).eql({value: 'a'})
    expect(_message).equal('Hello')
  })

})