export type HookFn = (callback: HookCallback) => UnregHook
export type HookCallback = (...params: any[]) => any | Promise<any>
export type UnregHook = () => void

export interface Hook {
  tap(callbackOrOpts: TapOptions | HookCallback, callback?: HookCallback): UnregHook

  call(...args: any[]): any | Promise<any>
}

export interface SyncHook extends Hook {
  tap(callback: (...args: any[]) => any): UnregHook

  call(...args: any[]): any
}

export interface AsyncHook extends Hook {
  tap(optsOrCallback: TapOptions | HookCallback, callback?: HookCallback): UnregHook

  call(...args: any[]): Promise<any>
}

export type TapOptions = {
  name?: string
  context?: boolean
  handler?: HookCallback
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