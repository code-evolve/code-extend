/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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
    const hook = createSyncHook<() => string, any, void, 'series'>({type: 'series'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createSyncHook<() => string, any, void, 'parallel'>({type: 'parallel'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createSyncHook<() => string, any, void, 'loop'>({type: 'loop'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }

  //
  // ret:string
  //
  {
    const hook = createSyncHook<() => string, any, void, 'bail'>({type: 'bail'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createSyncHook<() => string, any, void, 'waterfall'>({type: 'waterfall'})
    const ret1 = hook.call()
    const ret2 = hook.call2()
  }
  {
    const hook = createAsyncHook<() => string, any, void, 'waterfall'>({type: 'waterfall'})
    const ret1 = await hook.call()
    const ret2 = await hook.call2()
  }
})
