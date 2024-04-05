import {FnInfo, HookCallback, HookErrorAction, PType, TapOptions} from './types'

export function parseParams<PARAMS extends FnInfo, CONTEXT = any, TAPOPTS extends TapOptions<PARAMS, CONTEXT> = {}>
(optsOrCallback: TAPOPTS | HookCallback<PARAMS, void>, callback?: HookCallback<PARAMS, CONTEXT, TAPOPTS>) {
  let _callback: HookCallback<PARAMS, CONTEXT, TAPOPTS> | undefined
  let useContext: boolean
  let data: any
  if (typeof optsOrCallback === 'function') {
    _callback = optsOrCallback as any
    useContext = false
    data = undefined
  } else {
    _callback = optsOrCallback.handler ?? callback as any
    useContext = optsOrCallback.context ?? false
    data = optsOrCallback.data
  }
  if (!_callback) {
    throw new Error('No callback provided')
  }
  return {
    callback: _callback,
    useContext,
    data,
  }
}

function logException(e: unknown) {
  console.error('Hook exception', e)
}

export function handleException(onError: HookErrorAction, e: unknown) {
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

export type HookCallbackInfoTrue<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any> = {
  callback: HookCallback<PARAMS, CONTEXT, {
    context: true
  }>
  useContext: true
  data: TAPDATA
}

export type HookCallbackInfoFalse<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any> = {
  callback: HookCallback<PARAMS, CONTEXT, {
    context: false
  }>
  useContext: false
  data: TAPDATA
}

export type HookCallbackInfoVoid<PARAMS extends FnInfo = any[], TAPDATA = any> = {
  callback: HookCallback<PARAMS, void>
  useContext: unknown
  data: TAPDATA
}

export type HookCallbackInfo<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any> =
  HookCallbackInfoTrue<PARAMS, CONTEXT, TAPDATA> | HookCallbackInfoFalse<PARAMS, CONTEXT, TAPDATA> | HookCallbackInfoVoid<PARAMS, TAPDATA>

/**
 * Prepends a context object if the tap client requests it.
 * @param info
 * @param context
 * @param params
 */
export function generateParams<PARAMS extends FnInfo = any[], CONTEXT = any>(info: HookCallbackInfo<PARAMS, CONTEXT>, context: CONTEXT, params: PType<PARAMS>): PType<PARAMS, CONTEXT> {
  if (info.useContext) {
    return [context, ...params] as any
  } else {
    return params as any
  }
}
