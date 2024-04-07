import {test} from 'vitest'
import {createAsyncHook, createSyncHook} from '../../src'

// See https://github.com/microsoft/TypeScript/issues/26242
// Limitation requiring all template params or none in order to get inference

test('hook.call return type should be void except for waterfall', async () => {
  //
  // ret:string | void
  //
  {
    const hook = createSyncHook<() => string>()
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  //
  // ret: any
  //
  {
    const hook = createSyncHook()
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }

  //
  // ret:void
  //
  {
    const hook = createSyncHook<() => string, void, any, 'series'>({type: 'series'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createSyncHook<() => string, void, any, 'parallel'>({type: 'parallel'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createSyncHook<() => string, void, any, 'loop'>({type: 'loop'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }

  //
  // ret:string
  //
  {
    const hook = createSyncHook<() => string, void, any, 'bail'>({type: 'bail'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createSyncHook<() => string, void, any, 'waterfall'>({type: 'waterfall'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createAsyncHook<() => string, void, any, 'waterfall'>({type: 'waterfall'})
    const ret1 = await hook.call()
    const ret2 = await hook.call2()
  }
})
