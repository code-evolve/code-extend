/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {
  AsyncHook, Call2Opts, CallType,
  CreateHookOptions,
  FnInfo,
  HookCallbackSync, HookCallbackAsync,
  HookErrorAction,
  HookType,
  ParamType,
  CallReturnType,
  SyncHook,
  TapOptionsSync,
  TapOptionsAsync,
  UntapHookFn,
  HookReturnType,
  InterceptOptions,
  TapInfo, HookInfo,
  HookCallbackPromise,
  TapOptionsPromise
} from './types.js'
import {generateParams, handleException, parseParams} from './util.js'
import {removeOne} from './array.js'

export function createSyncHook<PARAMS extends FnInfo, TAPDATA = any, CONTEXT = void, HOOKTYPE extends HookType | undefined = undefined>
(opts?: CreateHookOptions): SyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
  const {
    interceptors,
    interceptCall,
    interceptTap,
    interceptUntap,
    interceptLoop,
  } = useInterceptors<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>()

  const {
    onError,
    getActiveCallbacks,
    addCallback,
    callbacks,
  } = useBasicHook<TAPDATA, CONTEXT, HOOKTYPE>(opts)

  let _info: HookInfo = {
    type: Array.isArray(opts) ? 'series' : opts?.type ?? 'series',
    isAsync: false,
  }

  function setInfo(options: Partial<HookInfo>) {
    Object.assign(_info, options)
  }

  function getInfo() {
    return _info
  }

  const me = {
    call,
    call2,
    tap,
    intercept,
    isUsed,
    setInfo,
    getInfo,
    withOptions,
  }
  return me

  function withOptions(options: any): SyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
    if (typeof options === 'string') {
      options = {name: options}
    }
    Object.apply(me, options)
    return me
  }


  // TODO move to composite
  function isUsed(): boolean {
    return callbacks.length > 0
  }

  function tap<TAPOPTS extends TapOptionsSync<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackSync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>) {
    let info = parseParams<PARAMS, TAPDATA, CONTEXT, HOOKTYPE, TAPOPTS>('sync', optsOrCallback, callback)

    info = interceptTap(info, callbacks)
    addCallback(info)

    // TODO Use callback type from tapable
    setInfo({
      isAsync: false,
    })

    return () => {
      removeOne(callbacks, it => it === info)
      interceptUntap(info)
    }
  }

  function call(...args: CallType<PARAMS>): CallReturnType<PARAMS, HOOKTYPE> {
    return call2({args})
  }

  function call2(callOpts: Call2Opts<PARAMS, TAPDATA, CONTEXT>): CallReturnType<PARAMS, HOOKTYPE> {
    callOpts = callOpts ?? {}
    const args = callOpts.args ?? {} as CallType<PARAMS>
    const context = callOpts.context ?? {} as CONTEXT
    const {filter} = callOpts

    interceptCall(args, context)

    const items = getActiveCallbacks(filter)

    switch (_info.type) {
      case 'parallel':
      case 'series': {
        for (const info of items) {
          try {
            info.fn.apply(undefined, generateParams(info, context, args))
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return undefined as any
      }
      case 'waterfall': {
        let value = args.length > 0 ? args[0] : undefined
        for (const info of items) {
          try {
            // A tap that returns nothing PASSES THE VALUE THROUGH, matching tapable. Before this
            // fix the accumulator was overwritten unconditionally, so one silent tap turned the
            // chain into the literal string "undefined" for every tap after it -- silently, with
            // nothing in the stack naming the tap responsible. In a UI that renames every item to
            // "undefined...". `undefined` is already this file's "no answer" everywhere else
            // (bail and loop both test it), so this makes waterfall agree with its neighbours.
            const next = info.fn.apply(undefined, generateParams(info, context, [value] as any))
            if (next !== undefined) {
              value = next
            }
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return value
      }
      // A SYNC `race` has no concurrency to race: taps run one after another, so "first to finish"
      // and "first to answer" are the same event. It therefore behaves exactly as `bail` rather
      // than being rejected, so a hook type can be chosen for what it MEANS and still work if the
      // hook is later made sync.
      case 'race':
      case 'bail': {
        for (const info of items) {
          try {
            const result = info.fn.apply(undefined, generateParams(info, context, args))
            // RETURN the bailed value, do not discard it. Bailing worked before this fix --
            // later taps really were skipped -- but `call()` answered `undefined` whether the
            // first tap answered, a later one did, or nobody did. That collapses "answered" and
            // "declined" into one value, so a caller cannot tell them apart and the topology
            // cannot do the one thing it exists for. The async `bail` already returned the value
            // (see test/async-hooks.spec.ts 'bail'), so this was the two APIs disagreeing rather
            // than a deliberate design.
            if (result !== undefined) {
              return result as any
            }
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return undefined as any
      }
      case 'loop': {
        let loop = true
        while (loop) {
          interceptLoop(args)
          loop = false
          for (const info of items) {
            try {
              const result = info.fn.apply(undefined, generateParams(info, context, args))
              if (result !== undefined) {
                loop = true
                break
              }
            } catch (e: any) {
              handleException(onError, e)
            }
          }
        }
        return undefined as any
      }
    }
  }

  function intercept(opts: InterceptOptions<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>) {
    interceptors.push(opts)

    return () => {
      removeOne(interceptors, it => it === opts)
    }
  }
}

export function createAsyncHook<PARAMS extends FnInfo, TAPDATA = any, CONTEXT = void, HOOKTYPE extends HookType | undefined = undefined>
(opts?: CreateHookOptions):
  AsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
  const {
    callbacks,
    onError,
    getActiveCallbacks,
    addCallback,
  } = useBasicHook<TAPDATA, CONTEXT, HOOKTYPE>(opts)

  const {
    interceptors,
    interceptCall,
    interceptTap,
    interceptUntap,
    interceptLoop,
  } = useInterceptors<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>()

  let _info: HookInfo = {
    type: Array.isArray(opts) ? 'series' : opts?.type ?? 'series',
    isAsync: true,
  }

  function getInfo() {
    return _info
  }

  function setInfo(options: Partial<HookInfo>) {
    Object.assign(_info, options)
  }

  const me = {
    call,
    call2,
    tap: tapPromise,
    tapPromise,
    tapAsync,
    intercept,
    isUsed,
    getInfo,
    setInfo,
    withOptions,
  }
  return me

  function withOptions(options: Record<string, any>): AsyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
    if (typeof options === 'string') {
      options = {name: options}
    }
    Object.apply(me, options as any)
    return me
  }

  function isUsed(): boolean {
    return callbacks.length > 0
  }

  function tapPromise<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackPromise<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    let info = parseParams<PARAMS, any, CONTEXT, HOOKTYPE>('promise', optsOrCallback, callback as any)
    info = interceptTap(info, callbacks)
    addCallback(info)
    return () => {
      removeOne(callbacks, it => it === info)
      interceptUntap(info)
    }
  }

  function tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    const cb: Function | undefined = callback ??
      (typeof optsOrCallback === 'function' ? optsOrCallback : optsOrCallback.handler)
    if (!cb) {
      throw new Error('No callback was provided')
    }

    const callbackAdapter = async (...args: ParamType<PARAMS, CONTEXT>) => {
      return new Promise<HookReturnType<PARAMS, HOOKTYPE>>((resolve, reject) => {
        cb.apply(undefined, [
          ...args,
          (error: unknown, value: any) => {
            if (error) {
              reject(error)
            } else {
              resolve(value)
            }
          },
        ])
      })
    }

    if (!callback) {
      return tapPromise(callbackAdapter as any)
    } else {
      const optsAdapter = Object.assign(
        {},
        optsOrCallback,
        {handler: callbackAdapter}
      )
      return tapPromise(optsAdapter as any, callbackAdapter as any)
    }
  }

  async function call(...args: CallType<PARAMS>): Promise<CallReturnType<PARAMS, HOOKTYPE>> {
    return call2({args})
  }

  async function call2(callOpts: Call2Opts<PARAMS, TAPDATA, CONTEXT> = {}): Promise<CallReturnType<PARAMS, HOOKTYPE>> {
    const args = callOpts.args ?? [] as unknown as CallType<PARAMS>
    const context = callOpts.context ?? {} as CONTEXT
    const {filter} = callOpts

    interceptCall(args, context)
    const items = getActiveCallbacks(filter)

    switch (_info.type) {
      case 'parallel': {
        const promises = items.map(async info => {
          try {
            await info.fn.apply(undefined, generateParams(info, context, args))
          } catch (e: any) {
            handleException(onError, e)
          }
        })
        try {
          await Promise.all(promises)
        } catch (e) {
          handleException(onError, e)
        }
        break
      }
      case 'series': {
        for (const info of items) {
          try {
            await info.fn.apply(undefined, generateParams(info, context, args))
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        break
      }
      case 'waterfall': {
        let value = args.length === 0 ? undefined : args[0]
        for (const info of items) {
          try {
            // Same pass-through rule as the sync waterfall above, for the same reason.
            const next = await info.fn.apply(undefined, generateParams(info, context, args.length === 0 ? [] : [value]))
            if (next !== undefined) {
              value = next
            }
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return value
      }
      case 'bail': {
        // SERIES, matching the sync `bail` and the readme. Before 0.2.0 this fired every tap
        // through `Promise.any` and returned whichever resolved FIRST, so one name meant two
        // different things depending on which API you reached for, and the documented behaviour was
        // only ever true of the sync side. The racing behaviour was real and useful, so it was not
        // deleted -- it moved to `race` below.
        for (const info of items) {
          try {
            const result = await info.fn.apply(undefined, generateParams(info, context, args))
            if (result !== undefined) {
              return result as any
            }
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return undefined as any
      }
      case 'race': {
        // First to RESOLVE wins, and the rest are abandoned -- what the async `bail` used to do.
        // Use this when the taps are independent lookups and the fastest answer is as good as any
        // other; use `bail` when their ORDER is the point.
        const promises = items.map(async info => {
          return wrappedPromise(info.fn.apply(undefined, generateParams(info, context, args)), onError)
        })
        try {
          return await Promise.any(promises)
        } catch (e) {
          // `Promise.any` rejects with an AggregateError once every tap has rejected -- and a tap
          // that simply returned `undefined` is rejected internally with the 'not handled'
          // sentinel. So "nobody answered", which is a NORMAL outcome, arrived here as an error
          // and was logged. `bail` returns undefined silently in exactly that case; `race` now
          // agrees. A real exception in a tap is still reported.
          const errors = (e as AggregateError)?.errors
          const everyTapDeclined = Array.isArray(errors) && errors.length > 0 &&
            errors.every((inner: any) => inner?.message === 'not handled')
          if (!everyTapDeclined) {
            handleException(onError, e)
          }
          return undefined as any
        }
      }
      case 'loop': {
        let loop = true
        while (loop) {
          interceptLoop(args)
          try {
            loop = false
            for (const info of items) {
              const value = await info.fn.apply(undefined, generateParams(info, context, args))
              if (value !== undefined) {
                loop = true
                break
              }
            }
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return undefined as any
      }
      default:
        throw new Error('Unexpected hook type')
    }
    return undefined as any
  }

  function intercept(opts: InterceptOptions<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>) {
    interceptors.push(opts)

    return () => {
      removeOne(interceptors, it => it === opts)
    }
  }
}

// Throw if returned value is undefined
async function wrappedPromise<T = any>(promise: Promise<T>, onError: HookErrorAction): Promise<T> {
  try {
    const result = await promise
    if (result !== undefined) {
      return result
    } else {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error('not handled')
    }
  } catch (e) {
    // @ts-ignore
    if (e.message !== 'not handled') {
      handleException(onError, e)
    }
    throw new Error('not handled')
  }
}

function useBasicHook<TAPDATA, CONTEXT, HOOKTYPE extends HookType | undefined>(opts?: CreateHookOptions) {
  const callbacks: TapInfo<any, TAPDATA, CONTEXT, HOOKTYPE>[] = []
  const onError: HookErrorAction = Array.isArray(opts) ? 'log' : opts?.onError ?? 'log'

  /**
   * Return callbacks, taking into account interceptors, filters, and reverse settings
   * @param filter
   */
  function getActiveCallbacks(filter?: Function) {
    let items = opts?.reverse ? callbacks.slice().reverse() : callbacks
    if (filter) {
      items = items.filter(it => filter(it.data))
    }
    return items
  }

  function addCallback(callback: TapInfo<any, TAPDATA, CONTEXT, HOOKTYPE>) {
    callbacks.push(callback)
  }

  return {
    callbacks,
    addCallback,
    onError,
    getActiveCallbacks
  }
}

function useInterceptors<PARAMS extends FnInfo, TAPDATA, CONTEXT, HOOKTYPE extends HookType | undefined>() {
  const interceptors: InterceptOptions<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>[] = []
  const ERROR_MESSAGE = 'An interceptor threw an exception'
  return {
    interceptors,
    interceptCall,
    interceptTap,
    interceptUntap,
    interceptLoop,
  }

  function interceptCall(args: CallType<PARAMS>, context: CONTEXT) {
    // const interceptor = interceptors.find(it => !!it.call)
    // if (interceptor) {
    //   interceptor.call(...args)
    //   return true
    // } else {
    //   return false
    // }
    interceptors.forEach(it => {
      try {
        if (it.context) {
          // @ts-ignore
          it.call?.(context, ...args)
        } else {
          it.call?.(...args)
        }
        return true
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })
  }

  function interceptTap(info: TapInfo<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>, callbacks: TapInfo<any, TAPDATA, CONTEXT, HOOKTYPE>[]): TapInfo<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
    let origInfo = info
    interceptors.forEach(it => {
      try {
        const newInfo = it.register?.(info)
        if (newInfo && newInfo !== info) {
          info = newInfo
        }
        it.tap?.(info)
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })

    if (origInfo !== info) {
      callbacks.forEach(it => {
        if (it.fn !== info.fn) {
          it.fn = info.fn
        }
      })
    }
    return info
  }

  function interceptUntap(info: TapInfo<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>) {
    interceptors.forEach(it => {
      try {
        it.untap?.(info)
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })
  }

  function interceptLoop(args: CallType<PARAMS>) {
    interceptors.forEach(it => {
      try {
        it.loop?.apply(undefined, args)
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })
  }
}
