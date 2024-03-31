import {
  AsyncHook,
  CreateHookOptions,
  FnInfo,
  Hook,
  HookCallback,
  HookErrorAction,
  HookType,
  PType,
  RType,
  TapOptions
} from './types'
import {generateParams, handleException, HookCallbackInfo, parseParams} from './util'
import {removeOne} from '../../../util'

export function createSyncHook<PARAMS extends FnInfo>(opts?: CreateHookOptions): Hook<PARAMS> {
  const callbacks: HookCallbackInfo[] = []
  // WORKAROUND Should not need to ts-ignore
  // @ts-ignore
  const onError: HookErrorAction = typeof opts === 'string' ? 'log' : opts?.onError ?? 'log'
  // WORKAROUND Should not need to ts-ignore
  // @ts-ignore
  const hookType: HookType = typeof opts === 'string' ? 'series' : opts?.type ?? 'series'

  return {
    tap,
    call,
  }

  function tap(optsOrCallback: TapOptions<PARAMS> | HookCallback<PARAMS>, callback?: HookCallback<PARAMS>) {
    const info = parseParams(optsOrCallback, callback)
    callbacks.push(info)

    return () => {
      removeOne(callbacks, it => it === info)
    }
  }

  function call(...args: PType<PARAMS>): RType<PARAMS> | undefined {
    const context = {}
    const items = opts?.reverse ? callbacks.slice().reverse() : callbacks

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
            value = info.callback.apply(undefined, generateParams(info, context, [value]))
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

export function createAsyncHook<PARAMS extends FnInfo>(opts?: CreateHookOptions): AsyncHook<PARAMS> {
  const callbacks: HookCallbackInfo[] = []
  // WORKAROUND Should not need to ts-ignore
  // @ts-ignore
  const onError: HookErrorAction = typeof opts === 'string' ? 'log' : opts?.onError ?? 'log'
  // WORKAROUND Should not need to ts-ignore
  // @ts-ignore
  const hookType: HookType = typeof opts === 'string' ? 'parallel' : opts?.type ?? 'parallel'

  return {
    tap,
    call,
  }

  function tap(optsOrCallback: TapOptions<PARAMS> | HookCallback<PARAMS>, callback?: HookCallback<PARAMS>) {
    const info = parseParams(optsOrCallback, callback)
    callbacks.push(info)
    return () => {
      removeOne(callbacks, it => it === info)
    }
  }

  async function call(...args: PType<PARAMS>): Promise<RType<PARAMS> | undefined> {
    const items = (typeof opts === 'object' && opts?.reverse) ? callbacks.slice().reverse() : callbacks
    const context = {}

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
