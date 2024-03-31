export type HookFn<PARAMS extends any[]> = (callback: HookCallback<PARAMS>) => UnregHook
export type HookCallback<PARAMS extends any[]> = (...params: PARAMS) => any | Promise<any>
export type UnregHook = () => void

export interface Hook<PARAMS extends any[]> {
  tap(callbackOrOpts: TapOptions<PARAMS> | HookCallback<PARAMS>, callback?: HookCallback<PARAMS>): UnregHook

  call(...args: PARAMS): any | Promise<any>
}

export interface SyncHook<PARAMS extends any[]> extends Hook<PARAMS> {
  tap(callback: (...args: PARAMS) => any): UnregHook

  call(...args: any[]): any
}

export interface AsyncHook<PARAMS extends any[]> extends Hook<PARAMS> {
  tap(optsOrCallback: TapOptions<PARAMS> | HookCallback<PARAMS>, callback?: HookCallback<PARAMS>): UnregHook

  call(...args: PARAMS): Promise<any>
}

export type TapOptions<PARAMS extends any[]> = {
  name?: string
  context?: boolean
  handler?: HookCallback<PARAMS>
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

export type HookErrorAction = 'log' | 'throw' | 'ignore'

/**
 * `SyncHook` treats `series` and `parallel` the same.
 */
export type HookType = 'parallel' | 'series' | 'waterfall' | 'bail' | 'loop'