import {createAsyncHook, createSyncHook} from '@frontend/lib/hooks/src/hooks'
import {expect} from 'chai'

describe('sync hooks - errors', () => {
  it('should log on exceptions by default', function () {
    const hook = createSyncHook()
    const results = []

    hook.tap(() => {
      throw new Error('Hey')
    })

    hook.tap(() => {
      results.push('2')
    })

    hook.call()

    expect(results).to.eql(['2'])
    //TODO expect console.error to have been called
  })

  it('should ignore on exceptions', function () {
    const hook = createSyncHook({onError: 'ignore'})
    const results = []

    hook.tap(() => {
      throw new Error('Hey')
    })

    hook.tap(() => {
      results.push('2')
    })

    hook.call()
    //TODO expect console.error to not have been called
  })

  it('should throw on exceptions', function () {
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
  it('should log by default', async function () {
    const hook = createAsyncHook()
    const results = []

    hook.tap(async () => {
      throw new Error('Hey')
    })

    hook.tap(async () => {
      results.push('2')
    })

    await hook.call()

    expect(results).to.eql(['2'])
    //TODO expect console.error to have been called
  })

  it('should ignore', async function () {
    const hook = createAsyncHook({onError: 'ignore'})
    const results = []

    hook.tap(async () => {
      throw new Error('Hey')
    })

    hook.tap(async () => {
      results.push('2')
    })

    await hook.call()

    expect(results).to.eql(['2'])
    //TODO expect console.error to not have been called
  })

  it('should throw', async function () {
    const hook = createAsyncHook({onError: 'throw'})
    const results = []

    hook.tap(async () => {
      throw new Error('Hey')
    })

    hook.tap(async () => {
      results.push('2')
    })

    hook.call().then(
      () => {
        throw new Error('Expected hook.call to throw')
      }),
      () => {
      }
  })
})