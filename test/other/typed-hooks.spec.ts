// noinspection JSUnusedLocalSymbols

import {test} from 'vitest'
import {createAsyncHook, createSyncHook} from '../../src'

test('typed hooks - tuple - unnamed', () => {
  const hook = createSyncHook<[string, boolean]>()
  // a:string, b:boolean
  hook.tap((a, b) => {
  })
  // result: any
  const result = hook.call('ok', true)
})

test('typed hooks - tuple - named', () => {
  const hook = createSyncHook<[x: string, y: boolean]>()
  // a:string, b:boolean
  hook.tap((a, b) => {
  })
  // result: any
  const result = hook.call('ok', true)
})

test('typed hooks - tuple - object - named', () => {
  const hook = createSyncHook<[x:{
    a: string,
    b: boolean
  }, y: {
    c: number
  }]>()
  hook.tap((a, b) => {
  })
  // result: any
  const result = hook.call({
    a: 'a',
    b: true
  }, {c: 12})
})

test('typed hooks - return - untyped - type', () => {
  const hook = createSyncHook<(number) => string | void>()
  // a: any
  hook.tap((a) => {
  })
  // result: string | void
  const result = hook.call(1)
})

test('typed hooks - return - name - type', () => {
  const hook = createSyncHook<(x: number) => string | void>()
  // a: number
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

test('typed hooks - async - data', () => {
  const hook = createAsyncHook<[], void, {
    value: string
  }>()

  hook.tap({data: {value: 'x'}}, () => {
  })
  // data: {value: string}
  hook.call2({filter: data => true})
})
