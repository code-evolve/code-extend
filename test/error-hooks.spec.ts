import {expect, describe, it, vi, afterEach} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'

afterEach(() => {
  vi.clearAllMocks()
})

describe('sync hooks - errors', () => {
  it('should log on exception by default', async function () {
    const hook = createSyncHook()
    const results = []
    const spyLog = vi.spyOn(console, 'error')

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
    const spyLog = vi.spyOn(console, 'error')

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
    const spyLog = vi.spyOn(console, 'error')

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
    const spyLog = vi.spyOn(console, 'error')

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