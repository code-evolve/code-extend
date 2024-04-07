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
    // @ts-ignore
    : T extends (...args: any[]) => any ? [CONTEXT, ...Parameters<T>] :
      T extends any[]
        ? [CONTEXT, ...T]
        : [CONTEXT, ...T[]]

export type HookCallback<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType, TAPOPTS extends {
  context?: boolean
  data?: any
} = {}> = TAPOPTS extends {
    context: true
  } ? (...params: ParamType<PARAMS, CONTEXT>) => HookReturnType<PARAMS, HOOKTYPE> | Promise<HookReturnType<PARAMS, HOOKTYPE>>
  : (...params: ParamType<PARAMS, void>) => HookReturnType<PARAMS, HOOKTYPE>

export type HookCallbackAsync<PARAMS extends FnInfo, CONTEXT,
  HOOKTYPE extends HookType,
  TAPOPTS extends {
    context?: boolean
    data?: any
  } = {}> =
  TAPOPTS extends {
      context: true
      // TODO done and error should be combined into one?
    } ? (...params: [c: CONTEXT, ...CallType<PARAMS>, done: (arg0: HookReturnType<PARAMS, HOOKTYPE>) => void, err: (arg0: unknown) => void]) => void
    : (...params: [...CallType<PARAMS>, done: (arg0: HookReturnType<PARAMS, HOOKTYPE>) => void, err: (arg0: unknown) => void]) => void

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
}

// export interface Hook<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any, HOOKTYPE extends HookType = undefined> {
//   call(...args: CallType<PARAMS>): CallReturnType<PARAMS, HOOKTYPE> | Promise<CallReturnType<PARAMS, HOOKTYPE>>
//
//   call2(opts: Call2Opts<PARAMS, CONTEXT, TAPDATA>): CallReturnType<PARAMS, HOOKTYPE> | Promise<CallReturnType<PARAMS, HOOKTYPE>>
//
//   tap<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
//   (callbackOrOpts: TAPOPTS | HookCallback<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallback<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn
// }

export interface SyncHook<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any, HOOKTYPE extends HookType = undefined> {
  call(...args: CallType<PARAMS>): CallReturnType<PARAMS, HOOKTYPE>

  call2(opts?: Call2Opts<PARAMS, CONTEXT, TAPDATA>): CallReturnType<PARAMS, HOOKTYPE>

  tap<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
  (callbackOrOpts: TAPOPTS | HookCallback<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallback<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>): UntapHookFn
}

export interface AsyncHook<PARAMS extends FnInfo, CONTEXT = any, TAPDATA = any, HOOKTYPE extends HookType = undefined> {
  call(...args: CallType<PARAMS>): Promise<CallReturnType<PARAMS, HOOKTYPE>>

  call2(opts?: Call2Opts<PARAMS, CONTEXT, TAPDATA>): Promise<CallReturnType<PARAMS, HOOKTYPE>>

  // Same as AsyncHook.tapPromise
  tap<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  tapPromise<TAPOPTS extends TapOptions<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>
  (optsOrCallback: TAPOPTS | HookCallbackAsync<PARAMS, void, HOOKTYPE, TAPOPTS>, callback?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>): UntapHookFn

  intercept(opts: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>): UntapHookFn
}

export type Call2Opts<PARAMS extends FnInfo, CONTEXT, TAPDATA> = {
  args?: CallType<PARAMS>
  context?: CONTEXT
  filter?: (data: TAPDATA) => boolean
}

export type TapOptions<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType> = {
  name?: string
  context?: boolean
  reverse?: boolean
  handler?: HookCallback<PARAMS, CONTEXT, HOOKTYPE>
  data?: any
}

export type TapOptionsAsync<PARAMS extends FnInfo, CONTEXT, HOOKTYPE extends HookType> = {
  name?: string
  context?: boolean
  handler?: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE>
  data?: any
}

export type TapInfoTrue<PARAMS extends FnInfo = any[], CONTEXT = any, HOOKTYPE extends HookType = any, TAPDATA = any> = {
  callback: HookCallback<PARAMS, CONTEXT, HOOKTYPE, {
    context: true
  }>
  useContext: true
  data: TAPDATA
}

export type TapInfoFalse<PARAMS extends FnInfo = any[], CONTEXT = any, HOOKTYPE extends HookType = any, TAPDATA = any> = {
  callback: HookCallback<PARAMS, CONTEXT, HOOKTYPE, {
    context: false
  }>
  useContext: false
  data: TAPDATA
}

export type TapInfoVoid<PARAMS extends FnInfo = any[], HOOKTYPE extends HookType = any, TAPDATA = any> = {
  name: string
  useContext: unknown
  reverse: boolean
  data: TAPDATA
  callback: HookCallback<PARAMS, void, HOOKTYPE>
}

export type TapInfo<PARAMS extends FnInfo = any[], CONTEXT = any, HOOKTYPE extends HookType = any, TAPDATA = any> =
  TapInfoTrue<PARAMS, CONTEXT, HOOKTYPE, TAPDATA> | TapInfoFalse<PARAMS, CONTEXT, HOOKTYPE, TAPDATA> | TapInfoVoid<PARAMS, HOOKTYPE, TAPDATA>

export type CreateHookOptions = string[] | CreateHookOptionObj

export type CreateHookOptionObj = {
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
   * Default: parallel
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