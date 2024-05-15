/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {CallType, FnInfo, HookCallbackSync, HookCallbackAsync, HookCallbackPromise, HookErrorAction, HookType, ParamType, TapInfo, TapOptionsSync, TapOptionsAsync, TapOptionsPromise} from './types'

let nextHookId = 1

export function parseParams<PARAMS extends FnInfo, TAPDATA, CONTEXT, HOOKTYPE extends HookType | undefined, TAPOPTS extends TapOptionsSync<PARAMS, CONTEXT, HOOKTYPE> | TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE> | TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE> = {}>
(
  callbackType: 'sync' | 'promise' | 'async',
  optsOrCallback: TAPOPTS
    | HookCallbackSync<PARAMS, void, HOOKTYPE, TAPOPTS> | HookCallbackPromise<PARAMS, void, HOOKTYPE, TAPOPTS> | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>,
  callback?: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS> | HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS> | HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>)
  : TapInfo<PARAMS, TAPDATA, CONTEXT, HOOKTYPE> {
  let _callback: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS> | undefined
  let useContext: boolean
  let data: TAPDATA
  let name: string
  let reverse: boolean
  if (typeof optsOrCallback === 'function') {
    _callback = optsOrCallback as any
    useContext = false
    data = undefined as any
    name = 'Unnamed Hook ' + nextHookId++
    reverse = false
  } else {
    _callback = optsOrCallback.handler ?? callback as any
    useContext = optsOrCallback.context ?? false
    data = optsOrCallback.data
    name = optsOrCallback.name ?? 'Unnamed Hook ' + nextHookId++
    reverse = optsOrCallback.reverse ?? false
  }
  if (!_callback) {
    throw new Error('No callback provided')
  }

  return {
    name,
    fn: _callback as any,
    useContext,
    reverse,
    data,
    type: callbackType,
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
export function generateParams<PARAMS extends FnInfo = any[], CONTEXT = any, HOOKTYPE extends HookType | undefined = undefined>(info: TapInfo<PARAMS, any, CONTEXT, HOOKTYPE>, context: CONTEXT, params: CallType<PARAMS>): ParamType<PARAMS, CONTEXT> {
  if (info.useContext) {
    return [context, ...params] as any
  } else {
    return params as any
  }
}
