import {createSyncHook} from '../src/hooks'
import {expect} from 'chai'

describe('sync hooks', async () => {
  it('should series', function () {
    const hook = createSyncHook({type: 'series'})
    const results = []

    hook.tap(() => {
      results.push('1')
    })

    hook.tap(() => {
      results.push('2')
    })

    hook.call()

    expect(results).to.eql(['1', '2'])
  })

  it('should series reverse', function () {
    const hook = createSyncHook({type: 'series', reverse: true})
    const results = []

    hook.tap(() => {
      results.push('1')
    })

    hook.tap(() => {
      results.push('2')
    })

    hook.call()

    expect(results).to.eql(['2', '1'])
  })

  it('should waterfall', function () {
    const hook = createSyncHook({type: 'waterfall'})

    hook.tap(message => message + '1')

    hook.tap(message => message + '2')

    const processed = hook.call('0')

    expect(processed).to.equal('012')
  })

  it('should waterfall reverse', function () {
    const hook = createSyncHook({type: 'waterfall', reverse: true})

    hook.tap(message => message + '1')

    hook.tap(message => message + '2')

    const processed = hook.call('0')

    expect(processed).to.equal('021')
  })

  it('should bail', function () {
    const hook = createSyncHook({type: 'bail'})
    const results = []

    hook.tap(() => {
      results.push('1')
      return true
    })

    hook.tap(() => {
      results.push('2')
    })

    hook.call()

    expect(results).to.eql(['1'])
  })

  it('should bail reverse', function () {
    const hook = createSyncHook({type: 'bail', reverse: true})
    const results = []

    hook.tap(() => {
      results.push('1')
    })

    hook.tap(() => {
      results.push('2')
      return true
    })

    hook.call()

    expect(results).to.eql(['2'])
  })

  it('should loop', function () {
    const hook = createSyncHook({type: 'loop'})
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

    hook.call()

    expect(results).to.eql(['1', '1', '2'])
  })

  it('should loop reverse', function () {
    const hook = createSyncHook({type: 'loop', reverse: true})
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

    hook.call()

    expect(results).to.eql(['2', '1', '2', '1'])
  })

  it('should accept context', function () {
    const hook = createSyncHook(["message"])
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

    hook.call('Hello')

    expect(_context).eql({value: 'a'})
    expect(_message).equal('Hello')
  })
})