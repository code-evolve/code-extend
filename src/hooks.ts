import {AsyncHook, CreateHookOptions, Hook, HookCallback, HookErrorAction, HookType, TapOptions} from './types'
import {generateParams, handleException, HookCallbackInfo, parseParams} from './util'
import {removeOne} from '../../../util'

export function createSyncHook(opts?: CreateHookOptions): Hook {
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

  function tap(optsOrCallback: TapOptions | HookCallback, callback?: HookCallback) {
    const info = parseParams(optsOrCallback, callback)
    callbacks.push(info)

    return () => {
      removeOne(callbacks, it => it === info)
    }
  }

  function call(...args: any[]) {
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

export function createAsyncHook(opts?: CreateHookOptions): AsyncHook {
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

  function tap(optsOrCallback: TapOptions | HookCallback, callback?: HookCallback) {
    const info = parseParams(optsOrCallback, callback)
    callbacks.push(info)
    return () => {
      removeOne(callbacks, it => it === info)
    }
  }

  async function call(...args: any[]) {
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
        await Promise.all(promises)
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
        for (const info of items) {
          try {
            const value = await info.callback.apply(undefined, generateParams(info, context, args))
            if (value !== undefined) {
              return value
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
