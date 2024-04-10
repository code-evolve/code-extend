/*
Copyright 2024 TwelveTone LLC

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
} from './types'
import {generateParams, handleException, parseParams} from './util'
import {removeOne} from './array'

export function createSyncHook<PARAMS extends FnInfo, CONTEXT = void, TAPDATA = any, HOOKTYPE extends HookType = undefined>
(opts?: CreateHookOptions): SyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
  const {
    interceptors,
    interceptCall,
    interceptTap,
    interceptUntap,
    interceptLoop,
  } = useInterceptors<PARAMS, CONTEXT, HOOKTYPE, TAPDATA>()

  const {
    onError,
    getActiveCallbacks,
    addCallback,
    callbacks,
  } = useBasicHook<CONTEXT, TAPDATA, HOOKTYPE>(opts)

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

  function withOptions(options: any): SyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
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
    let info = parseParams<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS, TAPDATA>('sync', optsOrCallback, callback)

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

  function call2(callOpts: Call2Opts<PARAMS, CONTEXT, TAPDATA> = {}): CallReturnType<PARAMS, HOOKTYPE> {
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
        return undefined
      }
      case 'waterfall': {
        let value = args.length > 0 ? args[0] : undefined
        for (const info of items) {
          try {
            value = info.fn.apply(undefined, generateParams(info, context, [value] as any))
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return value
      }
      case 'bail': {
        for (const info of items) {
          try {
            const result = info.fn.apply(undefined, generateParams(info, context, args))
            if (result !== undefined) {
              return undefined
            }
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return undefined
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
        return undefined
      }
    }
  }

  function intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>) {
    interceptors.push(opts)

    return () => {
      removeOne(interceptors, it => it === opts)
    }
  }
}

export function createAsyncHook<PARAMS extends FnInfo, CONTEXT = any, TAPDATA = any, HOOKTYPE extends HookType = undefined>
(opts?: CreateHookOptions):
  AsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
  const {
    callbacks,
    onError,
    getActiveCallbacks,
    addCallback,
  } = useBasicHook<CONTEXT, TAPDATA, HOOKTYPE>(opts)

  const {
    interceptors,
    interceptCall,
    interceptTap,
    interceptUntap,
    interceptLoop,
  } = useInterceptors()

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

  function withOptions(options: Record<string, any>): AsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
    if (typeof options === 'string') {
      options = {name: options}
    }
    Object.apply(me, options)
    return me
  }

  function isUsed(): boolean {
    return callbacks.length > 0
  }

  function tapPromise<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackPromise<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    let info = parseParams<PARAMS, CONTEXT, HOOKTYPE>('promise', optsOrCallback, callback as any)
    info = interceptTap(info, callbacks)
    addCallback(info)
    return () => {
      removeOne(callbacks, it => it === info)
      interceptUntap(info)
    }
  }

  function tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    const cb = callback ??
      (typeof optsOrCallback === 'function' ? optsOrCallback : optsOrCallback.handler)

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

  async function call2(callOpts: Call2Opts<PARAMS, CONTEXT, TAPDATA> = {}): Promise<CallReturnType<PARAMS, HOOKTYPE>> {
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
            value = await info.fn.apply(undefined, generateParams(info, context, args.length === 0 ? [] : [value]))
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return value
      }
      case 'bail': {
        const promises = items.map(async info => {
          return wrappedPromise(info.fn.apply(undefined, generateParams(info, context, args)), onError)
        })
        try {
          return await Promise.any(promises)
        } catch (e) {
          handleException(onError, e)
          return undefined
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
        return undefined
      }
    }
  }

  function intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>) {
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

function useBasicHook<CONTEXT, TAPDATA, HOOKTYPE extends HookType>(opts?: CreateHookOptions) {
  const callbacks: TapInfo<any, CONTEXT, HOOKTYPE, TAPDATA>[] = []
  const onError: HookErrorAction = Array.isArray(opts) ? 'log' : opts?.onError ?? 'log'

  /**
   * Return callbacks, taking into account interceptors, filters, and reverse settings
   * @param filter
   */
  function getActiveCallbacks(filter: Function) {
    let items = opts?.reverse ? callbacks.slice().reverse() : callbacks
    if (filter) {
      items = items.filter(it => filter(it.data))
    }
    return items
  }

  function addCallback(callback: TapInfo<any, CONTEXT, HOOKTYPE, TAPDATA>) {
    callbacks.push(callback)
  }

  return {
    callbacks,
    addCallback,
    onError,
    getActiveCallbacks
  }
}

function useInterceptors<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPDATA>() {
  const interceptors: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>[] = []
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

  function interceptTap(info: TapInfo<PARAMS, CONTEXT, HOOKTYPE, TAPDATA>, callbacks: TapInfo<any, CONTEXT, HOOKTYPE, TAPDATA>[]): TapInfo<PARAMS, CONTEXT, HOOKTYPE, TAPDATA> {
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

  function interceptUntap(info: TapInfo<PARAMS, CONTEXT, HOOKTYPE, TAPDATA>) {
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
