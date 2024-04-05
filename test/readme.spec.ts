import {test} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'

test('Async hooks', async () => {
  const asyncHook = createAsyncHook<(message: string) => void>()
  asyncHook.tap(message => console.log('Hook1 was called'))
  asyncHook.tap(message => console.log('Hook2 was called'))

  // tapPromise is Same as hook.tap
  asyncHook.tapPromise(message => console.log('Hook3 was called'))

  // tapAsync is the old-school callback API
  asyncHook.tapAsync((message, done, err) => {
    console.log('Hook4 was called')
    done()
  })

  await asyncHook.call('Hello') // All taps called in parallel by default
})

test('Async hook with options', async () => {
  const asyncHook = createAsyncHook<(string) => string>({
    type: 'waterfall',
    onError: 'ignore',
    reverse: true
  })
  asyncHook.tap(packet => packet + '1')
  asyncHook.tap(packet => {
    throw new Error('Should be ignored')
  })
  asyncHook.tap(packet => packet + '2')
  await asyncHook.call('3') // return value is '321'
})

test('Call filtering', () => {
  const syncHook = createSyncHook<[string | number], void, string>()
  syncHook.tap({data: 'string'}, (message) => console.log('withString', message))
  syncHook.tap({data: 'number'}, (message) => console.log('withNumber', message))
  syncHook.call2({
    filter: (data => data === 'string'),
    args: ['Hello']
  })
  syncHook.call2({
    filter: (data => data === 'number'),
    args: [12]
  })
})