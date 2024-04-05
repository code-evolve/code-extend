import {
  AsyncHook, Call2Opts, CallType,
  CreateHookOptions,
  FnInfo,
  HookCallback, HookCallbackAsync,
  HookErrorAction,
  HookType,
  PType,
  RType,
  SyncHook,
  TapOptions, TapOptionsAsync, UntapHook
} from './types'
import {generateParams, handleException, HookCallbackInfo, parseParams} from './util'
import {removeOne} from '../../../util'

export function createSyncHook<PARAMS extends FnInfo, CONTEXT = void, TAPDATA = any>(opts?: CreateHookOptions): SyncHook<PARAMS, CONTEXT, TAPDATA> {
  const callbacks: HookCallbackInfo<any, CONTEXT, TAPDATA>[] = []
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
  }

  function tap<TAPOPTS extends TapOptions<PARAMS, CONTEXT>>
  (optsOrCallback: TAPOPTS | HookCallback<PARAMS, void>, callback?: HookCallback<PARAMS, CONTEXT, TAPOPTS>) {
    const info = parseParams<PARAMS, CONTEXT, TAPOPTS>(optsOrCallback, callback)
    callbacks.push(info)

    return () => {
      removeOne(callbacks, it => it === info)
    }
  }

  function call(...args: CallType<PARAMS>): RType<PARAMS> | undefined {
    return call2({args})
  }

  function call2(callOpts: Call2Opts<PARAMS, CONTEXT>): RType<PARAMS> | undefined {
    const args = callOpts.args
    const context = callOpts.context ?? {} as CONTEXT
    const {filter} = callOpts

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

}

export function createAsyncHook<PARAMS extends FnInfo, CONTEXT = any, TAPDATA = any>(opts?: CreateHookOptions): AsyncHook<PARAMS, CONTEXT, TAPDATA> {
  const callbacks: HookCallbackInfo<any, CONTEXT, TAPDATA>[] = []
  const onError: HookErrorAction = Array.isArray(opts) ? 'log' : opts?.onError ?? 'log'
  const hookType: HookType = Array.isArray(opts) ? 'parallel' : opts?.type ?? 'parallel'

  return {
    call,
    call2,
    tap: tapPromise,
    tapPromise,
    tapAsync,
  }

  function tapPromise<TAPOPTS extends TapOptions<PARAMS, CONTEXT>>
  (optsOrCallback: TAPOPTS | HookCallback<PARAMS, void>, callback?: HookCallback<PARAMS, CONTEXT, TAPOPTS>): UntapHook {
    const info = parseParams(optsOrCallback, callback)
    callbacks.push(info)
    return () => {
      removeOne(callbacks, it => it === info)
    }
  }

  function tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void>, callback?: HookCallbackAsync<PARAMS, CONTEXT, TAPOPTS>): UntapHook {
    const cb = callback ?? optsOrCallback as any
    const callbackAdapter = async (...args: CallType<PARAMS>) => {
      return new Promise<RType<PARAMS>>((resolve, reject) => {
        cb.apply(undefined, [
          ...args,
          (value: any) => {
            resolve(value)
          },
          (e: any) => {
            reject(e)
          }
        ])
      })
    }
    if (!callback) {
      return tapPromise(callbackAdapter)
    } else {
      const optsAdapter: TapOptions<PARAMS, CONTEXT> = Object.assign(
        {},
        optsOrCallback,
        {handler: callbackAdapter}
      )
      return tapPromise(optsAdapter, callbackAdapter)
    }
  }

  async function call(...args: PType<PARAMS>): Promise<RType<PARAMS> | undefined> {
    return call2({args})
  }

  async function call2(callOpts: Call2Opts<PARAMS, CONTEXT>): Promise<RType<PARAMS> | undefined> {
    const args = callOpts.args ?? [] as CallType<PARAMS>
    const context = callOpts.context ?? {} as CONTEXT
    const {filter} = callOpts

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
            return
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
        // Throw if returned value is undefined
        async function wrappedPromise<T = any>(promise: Promise<T>): Promise<T> {
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

        const promises = items.map(async info => {
          return wrappedPromise(info.callback.apply(undefined, generateParams(info, context, args)))
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
}
