/**
 * Hook types may be expressed as a tuple or function signature.
 * The function signature approach allows for a return type.
 * The type approach allows for excluding argument names.
 *
 * - Hook<[string, boolean]>
 * - Hook<[a:string, b:boolean]>
 * - Hook<(a:string, b:boolean)=>number>
 *
 */
export type FnInfo = any[] | ((...args: any[]) => any)

export type PType<T extends FnInfo> =
    T extends (...args: any[]) => any ? Parameters<T> : T

export type RType<T extends FnInfo> =
    T extends (...args: any[]) => any ? ReturnType<T> : any

export type HookFn<PARAMS extends FnInfo = any[]> = (callback: HookCallback<PARAMS>) => UnregHook
export type HookCallback<PARAMS extends FnInfo = any[]> = (...params: PType<PARAMS>) => any | Promise<any>
export type UnregHook = () => void

export interface Hook<PARAMS extends FnInfo = any[]> {
    tap(callbackOrOpts: TapOptions<PARAMS> | HookCallback<PARAMS>, callback?: HookCallback<PARAMS>): UnregHook

    call(...args: PType<PARAMS>): RType<PARAMS> | undefined | Promise<RType<PARAMS> | undefined>
}

export interface SyncHook<PARAMS extends FnInfo = any[]> extends Hook<PARAMS> {
    tap(callback: (...args: PType<PARAMS>) => RType<PARAMS>): UnregHook

    call(...args: PType<PARAMS>): RType<PARAMS> | undefined
}

export interface AsyncHook<PARAMS extends FnInfo> extends Hook<PARAMS> {
    tap(optsOrCallback: TapOptions<PARAMS> | HookCallback<PARAMS>, callback?: HookCallback<PARAMS>): UnregHook

    call(...args: PType<PARAMS>): Promise<RType<PARAMS> | undefined>
}

export type TapOptions<PARAMS extends FnInfo = any[]> = {
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