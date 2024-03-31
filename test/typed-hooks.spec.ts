import {test} from 'vitest'
import {createSyncHook} from '../src'

test('typed hooks - primitive', () => {
  const hook = createSyncHook<[string, boolean]>()
  hook.tap((a, b) => {
    console.log(a, b)
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
    console.log(a, b)
  })
  hook.call({
    a: 'a',
    b: true
  }, {c: 12})
})

// test('typed hooks - implicit', () => {
//   const hook = createSyncHook<[string, number]>(['a', 'b'])
//   hook.tap((a, b) => {
//     console.log(a, b)
//   })
//   hook.call('ok', 12)
// })
//
// function foo<A extends Record<string, any>>(){
//   return {
//     a(...args: Array<[keyof A]>){
//       console.log(args)
//     }
//   }
// }
//
// let f = foo<{a:string, b:number}>()
// f.a