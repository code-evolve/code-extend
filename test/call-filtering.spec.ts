import {expect, test, vi} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'

test('sync hook', () => {
  const syncHook = createSyncHook()

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
  const asyncHook = createAsyncHook({onError: 'throw'})

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