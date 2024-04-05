import {expect, test} from 'vitest'
import {createAsyncHook} from '../src'

test('tapable async hook - no options', async () => {
  const hook = createAsyncHook<[string]>()
  const results = []

  hook.tapAsync((arg, done, err) => {
    results.push('1')
    if (arg !== '1') {
      return err('expected "1"')
    }
    done(undefined)
  })

  await hook.call('1')
  expect(results).to.eql(['1'])
})

test('tapable async hook - no context', async () => {
  const hook = createAsyncHook<[string]>()
  const results = []

  hook.tapAsync({context: false}, (arg, done, err) => {
    results.push('1')
    if (arg !== '1') {
      return err('expected "1"')
    }
    done(undefined)
  })

  await hook.call('1')
  expect(results).to.eql(['1'])
})


test('tapable async hook - context', async () => {
  const hook = createAsyncHook<(a:string) => number, number>()
  const results = []

  hook.tapAsync({context: true}, (context, arg, done, err) => {
    results.push('1')
    if (typeof context !== 'object') {
      return err('expected context object')
    }
    if (arg !== '1') {
      return err('expected "1"')
    }
    done(undefined)
  })

  await hook.call('1')
  expect(results).to.eql(['1'])
})