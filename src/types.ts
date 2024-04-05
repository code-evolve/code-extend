/**
 * Hook types may be expressed using a tuple or function signature.
 * Either approach can use named or unnamed arguments.
 * The function signature approach allows indicating a return type.
 *
 * - Hook<[string, boolean]>
 * - Hook<[a:string, b:boolean]>
 * - Hook<(string, boolean) => number>
 * - Hook<(a:string, b:boolean) => number>
 *
 *   The second template parameter indicates the context type.
 *   Hook<[string], {foo:string, bar: number}>
 *
 */
export type FnInfo = any[] | ((...args: any[]) => any)

export type PType<T extends FnInfo, CONTEXT = void> =
    CONTEXT extends void
        ? T extends (...args: any[]) => any ? Parameters<T> : T
        // @ts-ignore
        : T extends (...args: any[]) => any ? [CONTEXT, ...Parameters<T>] : [CONTEXT, ...T]
// : T extends (...args: any[]) => any ? [CONTEXT, ...Parameters<T>] : [CONTEXT, ...any[]]

export type CallType<T extends FnInfo> =
    T extends (...args: any[]) => any ? Parameters<T> : T

export type RType<T extends FnInfo> =
    T extends (...args: any[]) => any ? ReturnType<T> : any

export type HookFn<PARAMS extends FnInfo = any[]> = (callback: HookCallback<PARAMS>) => UntapHook

export type HookCallback<PARAMS extends FnInfo = any[], CONTEXT = any, TAPOPS extends {
  context?: boolean
  data?: any
} = {}> =
    TAPOPS extends {
          context: true
        } ? (...params: PType<PARAMS, CONTEXT>) => RType<PARAMS> | Promise<RType<PARAMS>>
        : (...params: PType<PARAMS>) => RType<PARAMS> | Promise<RType<PARAMS>>

export type HookCallbackAsync<PARAMS extends FnInfo = any[], CONTEXT = any, TAPOPS extends {
  context?: boolean
  data?: any
} = {}> =
    TAPOPS extends {
          context: true
        } ? (...params: [c: CONTEXT, ...CallType<PARAMS>, done: (arg0: RType<PARAMS>) => void, err: (arg0: unknown) => void]) => void
        : (...params: [...CallType<PARAMS>, done: (arg0: RType<PARAMS>) => void, err: (arg0: unknown) => void]) => void

export type UntapHook = () => void

export interface Hook<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any> {
  call(...args: CallType<PARAMS>): RType<PARAMS> | undefined | Promise<RType<PARAMS> | undefined>

  call2(opts: Call2Opts<PARAMS, CONTEXT, TAPDATA>): RType<PARAMS> | undefined | Promise<RType<PARAMS> | undefined>

  tap<TAPOPS extends TapOptions<PARAMS, CONTEXT>>
  (callbackOrOpts: TAPOPS | HookCallback<PARAMS, void>, callback?: HookCallback<PARAMS, CONTEXT, TAPOPS>): UntapHook
}

export interface SyncHook<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any> extends Hook<PARAMS, CONTEXT> {
  tap<TAPOPS extends TapOptions<PARAMS, CONTEXT>>
  (callbackOrOpts: TAPOPS | HookCallback<PARAMS, void>, callback?: HookCallback<PARAMS, CONTEXT, TAPOPS>): UntapHook

  call(...args: CallType<PARAMS>): RType<PARAMS> | undefined

  call2(opts: Call2Opts<PARAMS, CONTEXT, TAPDATA>): RType<PARAMS> | undefined
}

export interface AsyncHook<PARAMS extends FnInfo, CONTEXT = any, TAPDATA = any> extends Hook<PARAMS, CONTEXT> {
  call(...args: CallType<PARAMS>): Promise<RType<PARAMS> | undefined>

  call2(opts: Call2Opts<PARAMS, CONTEXT, TAPDATA>): Promise<RType<PARAMS> | undefined>

  // Same as AsyncHook.tapPromise
  tap<TAPOPS extends TapOptions<PARAMS, CONTEXT>>
  (optsOrCallback: TAPOPS | HookCallback<PARAMS, void>, callback?: HookCallback<PARAMS, CONTEXT, TAPOPS>): UntapHook

  tapPromise<TAPOPS extends TapOptions<PARAMS, CONTEXT>>
  (optsOrCallback: TAPOPS | HookCallback<PARAMS, void>, callback?: HookCallback<PARAMS, CONTEXT, TAPOPS>): UntapHook

  tapAsync<TAPOPS extends TapOptionsAsync<PARAMS, CONTEXT>>
  (optsOrCallback: TAPOPS | HookCallbackAsync<PARAMS, void>, callback?: HookCallbackAsync<PARAMS, CONTEXT, TAPOPS>): UntapHook
}

export type Call2Opts<PARAMS extends FnInfo = any[], CONTEXT = any, TAPDATA = any> = {
  args?: CallType<PARAMS>
  context?: CONTEXT
  filter?: (data: TAPDATA) => boolean
}

export type TapOptions<PARAMS extends FnInfo = any[], CONTEXT = any> = {
  name?: string
  context?: boolean
  handler?: HookCallback<PARAMS, CONTEXT>
  data?: any
}

export type TapOptionsAsync<PARAMS extends FnInfo = any[], CONTEXT = any> = {
  name?: string
  context?: boolean
  handler?: HookCallbackAsync<PARAMS, CONTEXT>
  data?: any
}

export type CreateHookOptions = string[] | CreateHookOptionObj

export type CreateHookOptionObj = {
  args?: string[]
  /**
   * Default: log
   * The default behavior is to log the error but continue.
   * This ensures one hook will not prevent another hook from running.
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