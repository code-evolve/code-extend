// noinspection JSUnusedLocalSymbols

import {test} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'

test('typed hooks - primitive', () => {
  const hook = createSyncHook<[string, b: boolean]>()
  hook.tap((a, b) => {
  })
  hook.call('ok', true)
})

test('typed hooks - object', () => {
  const hook = createSyncHook<[{
    a: string,
    b: boolean
  }, {
    c: number
  }]>()
  hook.tap((a, b) => {
  })
  hook.call({
    a: 'a',
    b: true
  }, {c: 12})
})

test('typed hooks - return type', () => {
  const hook = createSyncHook<(a: number) => string | void>()
  hook.tap((a) => {
  })
  hook.call(1)
})

test('typed hooks - context', () => {
  const hook = createSyncHook<[number], {
    value: string
  }>()

  // a:number
  hook.tap((a) => {
  })
  // a:{value: string}, b: number
  hook.tap({context: true}, (a, b) => {
  })
  // a:number
  hook.tap({context: false}, (a) => {
  })
})

test('typed hooks - async - context', () => {
  const hook = createAsyncHook<[number], {
    value: string
  }>()

  // a:number
  hook.tap((a) => {
  })
  // a:{value: string}, b: number
  hook.tap({context: true}, (a, b) => {
  })
  // a:{value: string}, b: number
  hook.tapAsync({context: true}, (a, b) => {
  })
  // a:number
  hook.tap({context: false}, (a) => {
  })
})
