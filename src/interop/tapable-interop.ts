/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// Provide class for creating hooks using `new`, and conform to the Tapable API

import {
  Call2Opts, CallReturnType, CallType, FnInfo, HookCallback, HookType, InterceptOptions,
  SyncHook as ISyncHook, AsyncHook as IAsyncHook, TapOptions, UntapHookFn, HookCallbackAsync, TapOptionsAsync, HookInfo, TapOptionsPromise, HookCallbackPromise
} from '../types'

export {MultiHook} from '../multihook'
import {createAsyncHook, createSyncHook} from '../'

abstract class SyncDummy<PARAMS extends FnInfo, CONTEXT, TAPDATA, HOOKTYPE extends HookType> implements ISyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
  call(...args: CallType<PARAMS>): CallReturnType<PARAMS, HOOKTYPE> {
    return undefined
  }

  call2(opts?: Call2Opts<PARAMS, CONTEXT, TAPDATA>): CallReturnType<PARAMS, HOOKTYPE> {
    return undefined
  }

  intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HookType>): UntapHookFn {
    return undefined
  }

  isUsed(): boolean {
    return false
  }

  tap<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
  (callbackOrOpts: TAPOPTS | HookCallback<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallback<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  getInfo(): HookInfo {
    return {
      type: 'series',
      isAsync: false,
    }
  }

  setInfo(info: Partial<HookInfo>) {
  }

  async promise(): Promise<any> {
  }

  callAsync(resolve: Function) {
  }

  withOptions(options: any): ISyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
    return this
  }
}

class AsyncDummy<PARAMS extends FnInfo, CONTEXT, TAPDATA, HOOKTYPE extends HookType> implements IAsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
  call(...args: CallType<PARAMS>): Promise<CallReturnType<any[], undefined>> {
    return undefined
  }

  call2(opts?: Call2Opts<PARAMS, CONTEXT, TAPDATA>): Promise<CallReturnType<PARAMS, HOOKTYPE>> {
    return undefined
  }

  intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HookType>): UntapHookFn {
    return undefined
  }

  isUsed(): boolean {
    return false
  }

  tap<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
  (callbackOrOpts: TAPOPTS | HookCallbackPromise<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  tapPromise<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>(optsOrCallback: HookCallbackPromise<PARAMS, void, HOOKTYPE, TAPOPTS> | TAPOPTS, callback?: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>(optsOrCallback: HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS> | TAPOPTS, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  getInfo(): HookInfo {
    return {
      type: 'parallel',
      isAsync: true,
    }
  }

  setInfo(info: Partial<HookInfo>) {
  }

  async promise(): Promise<any> {
  }

  callAsync(resolve: Function) {
  }

  withOptions(options: any): IAsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
    return this
  }
}

export class SyncHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends SyncDummy<PARAMS, CONTEXT, TAPDATA, 'series'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, CONTEXT, TAPDATA, 'series'>(this, args, name, 'series')
  }
}

export class SyncWaterfallHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends SyncDummy<PARAMS, CONTEXT, TAPDATA, 'waterfall'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, CONTEXT, TAPDATA, 'waterfall'>(this, args, name, 'waterfall')
  }
}

export class SyncLoopHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends SyncDummy<PARAMS, CONTEXT, TAPDATA, 'loop'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, CONTEXT, TAPDATA, 'loop'>(this, args, name, 'loop')
  }
}

export class SyncBailHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends SyncDummy<PARAMS, CONTEXT, TAPDATA, 'bail'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, CONTEXT, TAPDATA, 'bail'>(this, args, name, 'bail')
  }
}

export class AsyncSeriesHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends AsyncDummy<PARAMS, CONTEXT, TAPDATA, 'series'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, CONTEXT, TAPDATA, 'series'>(this, args, name, 'series')
  }
}

export class AsyncParallelHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends AsyncDummy<PARAMS, CONTEXT, TAPDATA, 'parallel'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, CONTEXT, TAPDATA, 'parallel'>(this, args, name, 'parallel')
  }
}

export class AsyncSeriesWaterfallHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends AsyncDummy<PARAMS, CONTEXT, TAPDATA, 'waterfall'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, CONTEXT, TAPDATA, 'waterfall'>(this, args, name, 'waterfall')
  }
}

export class AsyncSeriesLoopHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends AsyncDummy<PARAMS, CONTEXT, TAPDATA, 'loop'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, CONTEXT, TAPDATA, 'loop'>(this, args, name, 'loop')
  }
}

export class AsyncSeriesBailHook<PARAMS extends FnInfo = undefined, CONTEXT = void, TAPDATA = any> extends AsyncDummy<PARAMS, CONTEXT, TAPDATA, 'bail'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, CONTEXT, TAPDATA, 'bail'>(this, args, name, 'bail')
  }
}

/**
 * Methods not included in ISyncHook
 */
interface ITapableExtra {
  promise(): Promise<any>

  callAsync(resolve: Function): void
}

function createSyncProxy<PARAMS extends FnInfo, CONTEXT, TAPDATA, HOOKTYPE extends HookType>(that: any, hookArgs: string[], name: string | undefined, type: HOOKTYPE) {
  const hook = createSyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>({
    name,
    args: hookArgs,
    type,
  })

  return new Proxy<ISyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> & ITapableExtra>(that, {
    get(target, name) {
      switch (name) {
        case 'tap':
          return function (name: string, fn: Function) {
            if (!name) {
              throw new Error('A name is required')
            }
            if (!fn) {
              throw new Error('A callback function is required')
            }
            hook.tap({
              name,
              type: 'sync',
              handler: fn as any
            })
          }
        case 'promise':
          return (...tapArgs: any[]) => {
            const ret = tapArgs.slice()
            for (let i = ret.length; i < hookArgs.length; i++) {
              ret.push(undefined)
            }
            hook.call.apply(undefined, ret)
            return Promise.resolve()
          }
        case 'callAsync':
          return (...tapArgs: any[]) => {
            const resolver = tapArgs.at(-1)
            const ret = tapArgs.slice()
            ret.splice(ret.length - 1, 1)
            for (let i = ret.length; i < hookArgs.length; i++) {
              ret.push(undefined)
            }
            hook.call.apply(undefined, ret)
            resolver()
          }
        default:
          return hook[name]
      }
    }
  })
}

function createAsyncProxy<PARAMS extends FnInfo, CONTEXT, TAPDATA, HOOKTYPE extends HookType>(that: any, hookArgs: string[], name: string | undefined, type: HOOKTYPE) {
  const hook = createAsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>({
    args: hookArgs,
    name,
    type,
    onError: 'throw'
  })

  return new Proxy<IAsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> & ITapableExtra>(that, {
    get(target, name) {
      switch (name) {
        case 'tap':
          return function (name: string, fn: Function) {
            if (!name) {
              throw new Error('A name is required')
            }
            if (!fn) {
              throw new Error('A callback function is required')
            }
            hook.tap({
              name,
              type: 'sync',
              handler: fn as any
            })
          }
        case 'tapPromise':
          return function (name: string, fn: Function) {
            if (!name) {
              throw new Error('A name is required')
            }
            if (!fn) {
              throw new Error('A callback function is required')
            }
            hook.tapPromise({
              name,
              type: 'promise',
              handler: fn as any
            })
          }
        case 'tapAsync':
          return function (name: string, ...fn: any[]) {
            if (!name) {
              throw new Error('A name is required')
            }
            if (!fn.length) {
              throw new Error('A callback function is required')
            }
            hook.tapAsync({
              name,
              type: 'async',
              handler: fn.at(-1) as any
            })
          }
        case 'call':
          return undefined
        case 'promise':
          return async (...tapArgs: any[]) => {
            const ret = tapArgs.slice()
            for (let i = ret.length; i < hookArgs.length; i++) {
              ret.push(undefined)
            }
            return hook.call.apply(undefined, ret)
          }
        case 'callAsync':
          return (...tapArgs: any[]) => {
            const resolver = tapArgs.at(-1)
            const ret = tapArgs.slice(0, tapArgs.length - 1)
            for (let i = ret.length; i < hookArgs.length; i++) {
              ret.push(undefined)
            }
            hook.call.apply(undefined, ret)
              .then(it => {
                resolver(null, it)
              })
              .catch(e => {
                resolver(e)
              })
          }
        default:
          return hook[name]
      }
    }
  })
}
