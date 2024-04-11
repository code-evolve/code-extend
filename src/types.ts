/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 * Hook types can be expressed using a tuple or function signature.
 * Either approach can use named or unnamed arguments.
 * The function signature approach allows indicating a return type.
 * The return type is only applicable for waterfall hooks.
 *
 * - Hook<[string, boolean]>()
 * - Hook<[a:string, b:boolean]>()
 * - Hook<(string, boolean) => number>()
 * - Hook<(a:string, b:boolean) => number>()
 *
 *   The second template parameter indicates the context type.
 *   Hook<[string], {foo:string, bar: number}>()
 *
 *   The third template parameter indicates the tap data type.
 *   Hook<[string],  {foo:string, bar: number}, MyDataType>()
 *
 */
export type FnInfo = any[] | ((...args: any[]) => any)

export type CallType<T extends FnInfo> =
  T extends (...args: infer X) => any ? X : T

/**
 * For waterfall and bail hooks, when the tuple style is used, the return type is `any`.
 * Otherwise, it is the provided function's return type,
 * or any if no information was provided.
 * For all other hooks, the return type is void.
 */
export type CallReturnType<PARAMS extends FnInfo, HOOKTYPE extends HookType | undefined> =
  HOOKTYPE extends undefined
    ? (PARAMS extends (...args: any[]) => infer D ? D : any) | void
    : HOOKTYPE extends 'waterfall' | 'bail'
      ? PARAMS extends (...args: any[]) => infer D ? D : any
      : void


/**
 * When the tuple style is used, the return type is `any`.
 * For waterfall and bail hooks, the return type is always any (or a fn style return value)
 * For loop hooks, the return type is always any.
 * For all other hooks, the return type is void.
 */
export type HookReturnType<T extends FnInfo, HOOKTYPE extends HookType> =
  HOOKTYPE extends 'waterfall' | 'bail'
    ? T extends (...args: any[]) => infer D ? D : any
    : HookType extends 'loop'
      ? any
      : void

/**
 * When a tap requests content, the context will be the first parameter,
 * followed by the FnInfo parameters.
 */
export type ParamType<T extends FnInfo, CONTEXT> =
  CONTEXT extends void
    ? T extends (...args: any[]) => any ? Parameters<T> : T
    : T extends (...args: any[]) => any ? [CONTEXT, ...Parameters<T>] :
      T extends any[]
        ? [CONTEXT, ...T]
        : [CONTEXT, ...T[]]

export type HookCallbackSync<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPOPTS extends {
  context?: boolean
  data?: any
} = {}> = TAPOPTS extends {
    context: true
  } ? (...params: ParamType<PARAMS, CONTEXT>) => HookReturnType<PARAMS, HOOKTYPE>
  : (...params: ParamType<PARAMS, void>) => HookReturnType<PARAMS, HOOKTYPE>

export type HookCallbackPromise<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPOPTS extends {
  context?: boolean
  data?: any
} = {}> = TAPOPTS extends {
    context: true
  } ? (...params: ParamType<PARAMS, CONTEXT>) => HookReturnType<PARAMS, HOOKTYPE> | Promise<HookReturnType<PARAMS, HOOKTYPE>>
  : (...params: ParamType<PARAMS, void>) => HookReturnType<PARAMS, HOOKTYPE> | Promise<HookReturnType<PARAMS, HOOKTYPE>>

export type HookCallbackAsync<PARAMS extends FnInfo, CONTEXT,
  HOOKTYPE extends HookType,
  TAPOPTS extends {
    context?: boolean
    data?: any
  } = {}> =
  TAPOPTS extends {
      context: true
    } ? (...params: [...ParamType<PARAMS, CONTEXT>, callback: (error: unknown, result?: HookReturnType<PARAMS, HOOKTYPE>) => void]) => void
    : (...params: [...ParamType<PARAMS, void>, callback: (error: unknown, result?: HookReturnType<PARAMS, HOOKTYPE>) => void]) => void

export type UntapHookFn = () => void

// TODO match Tapable tapInfo
// tapInfo = { type: "promise", name: "GoogleMapsPlugin", fn: ... }
export type InterceptOptions<PARAMS extends FnInfo, CONTEXT, TAPDATA, HOOKTYPE extends HookType> = {
  call?: (...args: CallType<PARAMS>) => void
  // Read only
  tap?: (info: TapInfo<PARAMS, CONTEXT, HOOKTYPE, unknown>) => void
  untap?: (info: TapInfo<PARAMS, CONTEXT, HOOKTYPE, unknown>) => void
  // Writable
  register?: (info: TapInfo<PARAMS, CONTEXT, HOOKTYPE, TAPDATA>) => TapInfo<PARAMS, CONTEXT, HOOKTYPE, TAPDATA> | undefined
  loop?: (...args: CallType<PARAMS>) => void
  context?: boolean
}

export type Hook = SyncHook | AsyncHook

export type HookInfo = {
  type: HookType
  isAsync: boolean
}

export interface SyncHook<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any, HOOKTYPE extends HookType = undefined> {
  call(...args: CallType<PARAMS>): CallReturnType<PARAMS, HOOKTYPE>

  call2(opts?: Call2Opts<PARAMS, CONTEXT, TAPDATA>): CallReturnType<PARAMS, HOOKTYPE>

  tap<TAPOPTS extends TapOptionsSync<PARAMS, CONTEXT, HOOKTYPE>>
  (callbackOrOpts: TAPOPTS | HookCallbackSync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>): UntapHookFn

  isUsed(): boolean

  setInfo(info: Partial<HookInfo>): void

  getInfo(): HookInfo

  /**
   * For Tapable interop testing only
   * @param options
   */
  withOptions(options: any): SyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>
}

export interface AsyncHook<PARAMS extends FnInfo = undefined, CONTEXT = any, TAPDATA = any, HOOKTYPE extends HookType = undefined> {
  call(...args: CallType<PARAMS>): Promise<CallReturnType<PARAMS, HOOKTYPE>>

  call2(opts?: Call2Opts<PARAMS, CONTEXT, TAPDATA>): Promise<CallReturnType<PARAMS, HOOKTYPE>>

  // Same as AsyncHook.tapPromise
  tap<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackPromise<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  tapPromise<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackPromise<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>): UntapHookFn

  isUsed(): boolean

  setInfo(info: Partial<HookInfo>): void

  getInfo(): HookInfo

  /**
   * For Tapable interop testing only
   * @param options
   */
  withOptions(options: any): AsyncHook<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>
}

export type Call2Opts<PARAMS extends FnInfo, CONTEXT, TAPDATA> = {
  args?: CallType<PARAMS>
  context?: CONTEXT
  filter?: (data: TAPDATA) => boolean
}

export type TapOptionsSync<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType> = {
  name?: string // Tapable style name
  context?: boolean
  reverse?: boolean
  handler?: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE>
  data?: any
}

export type TapOptionsPromise<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType> = {
  name?: string
  context?: boolean
  reverse?: boolean
  handler?: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE>
  data?: any
}

export type TapOptionsAsync<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType> = {
  name?: string
  context?: boolean
  reverse?: boolean
  handler?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE>
  data?: any
}

export interface TapInfoBase<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPDATA> {
  name: string
  type: 'sync' | 'promise' | 'async'
  fn: Function
  data: TAPDATA
  useContext: boolean
  reverse: boolean
}

export interface TapInfoTrue<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPDATA> extends TapInfoBase<PARAMS, void, HOOKTYPE, TAPDATA> {
  fn: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, {
    context: true
  }>
  useContext: true
}

export interface TapInfoFalse<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPDATA> extends TapInfoBase<PARAMS, void, HOOKTYPE, TAPDATA> {
  fn: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, {
    context: false
  }>
  useContext: false
}

export interface TapInfoVoid<PARAMS extends FnInfo, HOOKTYPE extends HookType, TAPDATA> extends TapInfoBase<PARAMS, void, HOOKTYPE, TAPDATA> {
  fn: HookCallbackSync<PARAMS, void, HOOKTYPE>
}

export type TapInfo<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPDATA> =
  TapInfoTrue<PARAMS, CONTEXT, HOOKTYPE, TAPDATA> | TapInfoFalse<PARAMS, CONTEXT, HOOKTYPE, TAPDATA> | TapInfoVoid<PARAMS, HOOKTYPE, TAPDATA>

export type CreateHookOptions = string[] | CreateHookOptionObj

export type CreateHookOptionObj = {
  name?: string
  /**
   * Tapable style arguments.
   * These are names, and not typed.
   */
  args?: string[]
  /**
   * Default: log
   * The default behavior is to log the error but continue.
   * This ensures one hook throwing will not prevent another hook from running.
   */
  onError?: HookErrorAction
  /**
   * Default: series
   */
  type?: HookType
  reverse?: boolean
}

/**
 * log: log error, return undefined
 * throw: throw error
 * ignore: do not log, return undefined
 */
export type HookErrorAction = 'log' | 'throw' | 'ignore'

/**
 * `SyncHook` treats `series` and `parallel` the same.
 */
export type HookType = 'parallel' | 'series' | 'waterfall' | 'bail' | 'loop'

export interface IHookMap<T extends Hook> {
  /**
   * Creates a hook if the item does not already exist
   * @param key
   */
  for: (key: any) => T,
  /**
   * Returns undefined if the item does not already exist
   * @param key
   */
  get: (key: any) => T | undefined,
  /**
   * Return the existing item, or substitute a new one.
   * @param interceptor
   */
  intercept: (interceptor: HookMapInterceptor<T>) => void
}

export interface HookMapInterceptor<T extends Hook> {
  factory: (key: any, hook: T) => T
}
