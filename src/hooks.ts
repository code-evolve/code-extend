import {
  AsyncHook, Call2Opts, CallType,
  CreateHookOptions,
  FnInfo,
  HookCallback, HookCallbackAsync,
  HookErrorAction,
  HookType,
  ParamType,
  CallReturnType,
  SyncHook,
  TapOptions, TapOptionsAsync, UntapHookFn, HookReturnType, InterceptOptions, TapInfo
} from './types'
import {generateParams, handleException, parseParams} from './util'
import {removeOne} from './array'

export function createSyncHook<PARAMS extends FnInfo, CONTEXT = void, TAPDATA = any, HOOKTYPE extends HookType = undefined>(opts?: CreateHookOptions): SyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
  const callbacks: TapInfo<PARAMS, CONTEXT, HOOKTYPE, TAPDATA>[] = []
  const {
    interceptors,
    notifyCall,
    notifyTap,
    notifyUntap,
    notifyLoop,
  } = useInterceptors()

  // WORKAROUND Should not need to ts-ignore
  // @ts-ignore
  const onError: HookErrorAction = typeof opts === 'string' ? 'log' : opts?.onError ?? 'log'
  // WORKAROUND Should not need to ts-ignore
  // @ts-ignore
  const hookType: HookType = typeof opts === 'string' ? 'series' : opts?.type ?? 'series'

  return {
    call,
    call2,
    tap,
    intercept
  }

  function tap<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallback<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallback<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>) {
    let info = parseParams<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS, TAPDATA>(optsOrCallback, callback)

    notifyTap(info)
    callbacks.push(info)

    return () => {
      removeOne(callbacks, it => it === info)
      notifyUntap(info)
    }
  }

  function call(...args: CallType<PARAMS>): CallReturnType<PARAMS, HOOKTYPE> {
    return call2({args})
  }

  function call2(callOpts: Call2Opts<PARAMS, CONTEXT, TAPDATA> = {}): CallReturnType<PARAMS, HOOKTYPE> {
    const args = callOpts.args ?? {} as CallType<PARAMS>
    const context = callOpts.context ?? {} as CONTEXT
    const {filter} = callOpts

    notifyCall(args)

    let items = opts?.reverse ? callbacks.slice().reverse() : callbacks
    if (filter) {
      items = items.filter(it => filter(it.data))
    }

    switch (hookType) {
      case 'parallel':
      case 'series': {
        for (const info of items) {
          try {
            info.callback.apply(undefined, generateParams(info, context, args))
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
            value = info.callback.apply(undefined, generateParams(info, context, [value] as any))
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return value
      }
      case 'bail': {
        for (const info of items) {
          try {
            const result = info.callback.apply(undefined, generateParams(info, context, args))
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
          notifyLoop(args)
          loop = false
          for (const info of items) {
            try {
              const result = info.callback.apply(undefined, generateParams(info, context, args))
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

function useBasicHook<PARAMS extends FnInfo, CONTEXT, TAPDATA, HOOKTYPE extends HookType>(opts?: CreateHookOptions) {
  const callbacks: TapInfo<any, CONTEXT, HOOKTYPE, TAPDATA>[] = []
  const onError: HookErrorAction = Array.isArray(opts) ? 'log' : opts?.onError ?? 'log'
  const hookType: HookType = Array.isArray(opts) ? 'parallel' : opts?.type ?? 'parallel'

  return {
    callbacks,
    onError,
    hookType
  }
}

export function createAsyncHook<PARAMS extends FnInfo, CONTEXT = any, TAPDATA = any, HOOKTYPE extends HookType = undefined>(opts?: CreateHookOptions):
  AsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE> {
  // const callbacks: TapInfo<any, CONTEXT, HOOKTYPE, TAPDATA>[] = []
  // const onError: HookErrorAction = Array.isArray(opts) ? 'log' : opts?.onError ?? 'log'
  // const hookType: HookType = Array.isArray(opts) ? 'parallel' : opts?.type ?? 'parallel'

  const {
    callbacks,
    onError,
    hookType
  } = useBasicHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>(opts)

  const {
    interceptors,
    notifyCall,
    notifyTap,
    notifyUntap,
    notifyLoop,
  } = useInterceptors()

  return {
    call,
    call2,
    tap: tapPromise,
    tapPromise,
    tapAsync,
    intercept,
  }

  function tapPromise<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    const info = parseParams<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>(optsOrCallback, callback)
    notifyTap(info)
    callbacks.push(info)
    return () => {
      removeOne(callbacks, it => it === info)
      notifyUntap(info)
    }
  }

  function tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn {
    const cb = callback ?? optsOrCallback as any

    const callbackAdapter = async (...args: ParamType<PARAMS, CONTEXT>) => {
      return new Promise<HookReturnType<PARAMS, HOOKTYPE>>((resolve, reject) => {
        cb.apply(undefined, [
          ...args,
          // done
          (value: any) => {
            resolve(value)
          },
          // err
          (e: any) => {
            reject(e)
          }
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

    notifyCall(args)

    let items = (typeof opts === 'object' && opts?.reverse) ? callbacks.slice().reverse() : callbacks
    if (filter) {
      items = items.filter(it => filter(it.data))
    }

    switch (hookType) {
      case 'parallel': {
        const promises = items.map(async info => {
          try {
            await info.callback.apply(undefined, generateParams(info, context, args))
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
            await info.callback.apply(undefined, generateParams(info, context, args))
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
            value = await info.callback.apply(undefined, generateParams(info, context, [value]))
          } catch (e: any) {
            handleException(onError, e)
          }
        }
        return value
      }
      case 'bail': {
        const promises = items.map(async info => {
          return wrappedPromise(info.callback.apply(undefined, generateParams(info, context, args)), onError)
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
          notifyLoop(args)
          try {
            loop = false
            for (const info of items) {
              const value = await info.callback.apply(undefined, generateParams(info, context, args))
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

function useInterceptors<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPDATA>() {
  const interceptors: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>[] = []
  const ERROR_MESSAGE = 'An interceptor threw an exception'
  return {
    interceptors,
    notifyCall,
    notifyTap,
    notifyUntap,
    notifyLoop,
  }

  function notifyCall(args: CallType<PARAMS>) {
    interceptors.forEach(it => {
      try {
        it.call?.(...args)
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })
  }

  function notifyTap(info: TapInfo<PARAMS, CONTEXT, HOOKTYPE, any>) {
    interceptors.forEach(it => {
      try {
        it.tap?.(info)
        const newInfo = it.register?.(info)
        if (newInfo && newInfo !== info) {
          info = newInfo
        }
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })
  }

  function notifyUntap(info: TapInfo<PARAMS, CONTEXT, HOOKTYPE, any>) {
    interceptors.forEach(it => {
      try {
        it.untap?.(info)
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })
  }

  function notifyLoop(args: CallType<PARAMS>) {
    interceptors.forEach(it => {
      try {
        it.loop?.apply(undefined, args)
      } catch (e) {
        console.error(ERROR_MESSAGE, e)
      }
    })
  }
}
