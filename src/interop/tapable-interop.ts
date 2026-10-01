/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// Provide class for creating hooks using `new`, and conform to the Tapable API

import {
  Call2Opts,
  CallReturnType,
  CallType,
  FnInfo,
  HookCallbackSync,
  HookType,
  InterceptOptions,
  SyncHook as ISyncHook,
  AsyncHook as IAsyncHook,
  TapOptionsSync,
  UntapHookFn,
  HookCallbackAsync,
  TapOptionsAsync,
  HookInfo,
  TapOptionsPromise,
  HookCallbackPromise
} from '../types'

export {MultiHook} from '../multihook'
import {createAsyncHook, createSyncHook} from '../hooks'

type AsyncCallback<E = unknown, T = any> = (err?: E, result?: T) => void

export type ITapableHook<PARAMS extends FnInfo = any[], TAPDATA = any, CONTEXT = any, HOOKTYPE extends HookType | undefined = undefined>
  = ITapableSyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> | ITapableAsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>

export type ITapableSyncHook<PARAMS extends FnInfo = any[], TAPDATA = any, CONTEXT = any, HOOKTYPE extends HookType | undefined = undefined> =
  Omit<ISyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>, 'tap' | 'withOptions'>
  & {
  tap<TAPOPTS extends TapOptionsSync<PARAMS, CONTEXT, HOOKTYPE>>
  (nameOrOpts: string | TAPOPTS, callback: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  promise(): Promise<any>

  callAsync(resolve: Function): void

  withOptions(options: any): ITapableSyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>
}

export type ITapableAsyncHook<PARAMS extends FnInfo = any[], TAPDATA = any, CONTEXT = any, HOOKTYPE extends HookType | undefined = undefined> =
  Omit<IAsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>, 'tap' | 'tapPromise' | 'tapAsync' | 'withOptions'>
  & {
  tap<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (_nameOrOpts: string | TAPOPTS, _callback: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  tapPromise<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (_nameOrOpts: string | TAPOPTS, _callback: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>
  (_nameOrOpts: string | TAPOPTS, _callback: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  withOptions(_options: any): ITapableAsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>

  promise(..._args: CallType<PARAMS>): Promise<CallReturnType<PARAMS, HOOKTYPE>>

  callAsync(..._args: [...args: CallType<PARAMS>, _callback: Function]): void
}

abstract class SyncDummy<PARAMS extends FnInfo, TAPDATA, CONTEXT, HOOKTYPE extends HookType | undefined> implements ITapableSyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
  call(..._args: CallType<PARAMS>): CallReturnType<PARAMS, HOOKTYPE> {
    return undefined as any
  }

  call2(_opts?: Call2Opts<PARAMS, TAPDATA, CONTEXT>): CallReturnType<PARAMS, HOOKTYPE> {
    return undefined as any
  }

  intercept(_opts: InterceptOptions<PARAMS, TAPDATA, CONTEXT, HookType>): UntapHookFn {
    return () => {
    }
  }

  isUsed(): boolean {
    return false
  }

  tap<TAPOPTS extends TapOptionsSync<PARAMS, CONTEXT, HOOKTYPE>>
  (_nameOrOpts: string | TAPOPTS, _callback: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  getInfo(): HookInfo {
    return {
      type: 'series',
      isAsync: false,
    }
  }

  setInfo(_info: Partial<HookInfo>) {
  }

  async promise(): Promise<any> {
    return Promise.resolve(undefined)
  }

  callAsync(_resolve: Function) {
  }

  withOptions(_options: any): ITapableSyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
    return this
  }
}

class AsyncDummy<PARAMS extends FnInfo, TAPDATA, CONTEXT, HOOKTYPE extends HookType | undefined> implements ITapableAsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
  call(..._args: CallType<PARAMS>): Promise<CallReturnType<any[], undefined>> {
    return Promise.resolve(undefined) as any
  }

  call2(_opts?: Call2Opts<PARAMS, TAPDATA, CONTEXT>): Promise<CallReturnType<PARAMS, HOOKTYPE>> {
    return Promise.resolve(undefined) as any
  }

  intercept(_opts: InterceptOptions<PARAMS, TAPDATA, CONTEXT, HookType>): UntapHookFn {
    return () => {
    }
  }

  isUsed(): boolean {
    return false
  }

  tap<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (_nameOrOpts: string | TAPOPTS, _callback: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  tapPromise<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (_nameOrOpts: string | TAPOPTS, _callback: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>
  (_nameOrOpts: string | TAPOPTS, _callback: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    return () => {
    }
  }

  getInfo(): HookInfo {
    return {
      type: 'parallel',
      isAsync: true,
    }
  }

  setInfo(_info: Partial<HookInfo>) {
  }

  promise(..._args: CallType<PARAMS>): Promise<CallReturnType<PARAMS, HOOKTYPE>> {
    return Promise.resolve(undefined) as any
  }

  callAsync(..._args: [...args: CallType<PARAMS>, _callback: AsyncCallback]): void {

  }

  withOptions(_options: any): ITapableAsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
    return this
  }
}

export class SyncHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends SyncDummy<PARAMS, TAPDATA, CONTEXT, 'series'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, TAPDATA, CONTEXT, 'series'>(this, args, name, 'series')
  }
}

export class SyncWaterfallHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends SyncDummy<PARAMS, TAPDATA, CONTEXT, 'waterfall'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, TAPDATA, CONTEXT, 'waterfall'>(this, args, name, 'waterfall')
  }
}

export class SyncLoopHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends SyncDummy<PARAMS, TAPDATA, CONTEXT, 'loop'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, TAPDATA, CONTEXT, 'loop'>(this, args, name, 'loop')
  }
}

export class SyncBailHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends SyncDummy<PARAMS, TAPDATA, CONTEXT, 'bail'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createSyncProxy<PARAMS, TAPDATA, CONTEXT, 'bail'>(this, args, name, 'bail')
  }
}

export class AsyncSeriesHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends AsyncDummy<PARAMS, TAPDATA, CONTEXT, 'series'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, TAPDATA, CONTEXT, 'series'>(this, args, name, 'series')
  }
}

export class AsyncParallelHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends AsyncDummy<PARAMS, TAPDATA, CONTEXT, 'parallel'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, TAPDATA, CONTEXT, 'parallel'>(this, args, name, 'parallel')
  }
}

export class AsyncSeriesWaterfallHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends AsyncDummy<PARAMS, TAPDATA, CONTEXT, 'waterfall'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, TAPDATA, CONTEXT, 'waterfall'>(this, args, name, 'waterfall')
  }
}

export class AsyncSeriesLoopHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends AsyncDummy<PARAMS, TAPDATA, CONTEXT, 'loop'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, TAPDATA, CONTEXT, 'loop'>(this, args, name, 'loop')
  }
}

export class AsyncSeriesBailHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends AsyncDummy<PARAMS, TAPDATA, CONTEXT, 'bail'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, TAPDATA, CONTEXT, 'bail'>(this, args, name, 'bail')
  }
}

/**
 * Tapable's parallel bail: every tap starts, the first to produce a value wins, the rest are
 * abandoned.
 *
 * **Added in 0.2.0, when the behaviour turned out to already exist under the wrong name.** The
 * async `bail` used to run `Promise.any` over all taps, which is precisely this hook — so for
 * `AsyncSeriesBailHook` it was the wrong semantics, and for `AsyncParallelBailHook` it was the right
 * ones with nothing exposing them. Measured against tapable 2.3.3 with two taps that both answer:
 * `AsyncSeriesBailHook` calls **1**, `AsyncParallelBailHook` calls **2**, and both return the value.
 * `bail` now matches the first and `race` matches the second.
 */
export class AsyncParallelBailHook<PARAMS extends FnInfo = any, TAPDATA = any, CONTEXT = any> extends AsyncDummy<PARAMS, TAPDATA, CONTEXT, 'race'> {
  constructor(args: string[] = [], name?: string) {
    super()
    return createAsyncProxy<PARAMS, TAPDATA, CONTEXT, 'race'>(this, args, name, 'race')
  }
}

function createSyncProxy<PARAMS extends FnInfo, TAPDATA, CONTEXT, HOOKTYPE extends HookType | undefined>(that: any, hookArgs: string[], name: string | undefined, type: HOOKTYPE) {
  const hook = createSyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>({
    name,
    args: hookArgs,
    type,
  })

  return new Proxy<ITapableSyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>>(that, {
    get(_, name) {
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
            hook.call.apply(undefined, ret as any)
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
            hook.call.apply(undefined, ret as any)
            resolver()
          }
        default:
          return (hook as any)[name]
      }
    }
  })
}

function createAsyncProxy<PARAMS extends FnInfo, TAPDATA, CONTEXT, HOOKTYPE extends HookType | undefined>(that: any, hookArgs: string[], name: string | undefined, type: HOOKTYPE) {
  const hook = createAsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>({
    args: hookArgs,
    name,
    type,
    onError: 'throw'
  })

  return new Proxy<ITapableAsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>>(that, {
    get(_, name) {
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
            return hook.call.apply(undefined, ret as any)
          }
        case 'callAsync':
          return (...tapArgs: [...CallType<PARAMS>, callback: AsyncCallback]) => {
            const resolver = tapArgs.at(-1) as AsyncCallback
            const ret = tapArgs.slice(0, tapArgs.length - 1)
            for (let i = ret.length; i < hookArgs.length; i++) {
              ret.push(undefined)
            }
            hook.call.apply(undefined, ret as any)
              .then(it => {
                resolver(null, it)
              })
              .catch(e => {
                resolver(e)
              })
          }
        default:
          return (hook as any)[name]
      }
    }
  })
}
