import {HookCallback, HookErrorAction, TapOptions} from './types'

export function parseParams(optsOrCallback: TapOptions | HookCallback, callback?: HookCallback) {
  let _callback: HookCallback | undefined
  let useContext: boolean
  if (typeof optsOrCallback === 'function') {
    _callback = optsOrCallback
    useContext = false
  } else {
    _callback = optsOrCallback.handler ?? callback
    useContext = optsOrCallback.context ?? false
  }
  if (!_callback) {
    throw new Error('No callback provided')
  }
  return {
    callback: _callback,
    useContext,
  }
}

function logException(e: Error) {
  console.error('Hook exception', e)
}

export function handleException(onError: HookErrorAction, e: Error) {
  switch (onError) {
    case 'log':
      logException(e)
      break
    case 'throw':
      throw e
    case 'ignore':
      break
  }
}

export type HookCallbackInfo = {
  callback: HookCallback,
  useContext: boolean
}

/**
 * Prepends a context object if the tap client requests it.
 * @param info
 * @param context
 * @param params
 */
export function generateParams(info: HookCallbackInfo, context: Record<string, any>, params: any[]): any[] {
  if (info.useContext) {
    return [context, ...params]
  } else {
    return params
  }
}
