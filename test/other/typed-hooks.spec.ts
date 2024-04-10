/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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
