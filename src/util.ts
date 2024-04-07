import {CallType, FnInfo, HookCallback, HookCallbackAsync, HookErrorAction, HookType, ParamType, TapInfo, TapOptions} from './types'

export function parseParams<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE> = {}, TAPDATA = any>
(optsOrCallback: TAPOPTS | HookCallback<PARAMS, void, HOOKTYPE, TAPOPTS> | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallback<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS> | HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>)
  : TapInfo<PARAMS, CONTEXT, HOOKTYPE, TAPDATA> {
  let _callback: HookCallback<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS> | undefined
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
    callback: _callback as any,
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

/**
 * Prepends a context object if the tap client requests it.
 * @param info
 * @param context
 * @param params
 */
export function generateParams<PARAMS extends FnInfo = any[], CONTEXT = any>(info: TapInfo<PARAMS, CONTEXT>, context: CONTEXT, params: CallType<PARAMS>): ParamType<PARAMS, CONTEXT> {
  if (info.useContext) {
    return [context, ...params] as any
  } else {
    return params as any
  }
}
