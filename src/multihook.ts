/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {AsyncHook, FnInfo, Hook, HookCallbackSync, HookCallbackAsync, HookInfo, HookType, InterceptOptions, SyncHook, TapOptionsSync, TapOptionsAsync, HookCallbackPromise, TapOptionsPromise} from './index'

export class MultiHook<PARAMS extends FnInfo, CONTEXT = void, TAPDATA = any, HOOKTYPE extends HookType | undefined = undefined> {
  hooks: Hook[] = []
  name?: string

  constructor(hooks: Hook[], name?: string) {
    this.hooks = hooks
    this.name = name
  }

  tap<TAPOPTS extends TapOptionsSync<PARAMS, CONTEXT, HOOKTYPE>>(opts: TAPOPTS, callback?: HookCallbackSync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>) {
    this.hooks.forEach(it => {
      (it as SyncHook).tap(opts, callback)
    })
  }

  tapPromise<TAPOPTS extends TapOptionsPromise<PARAMS, CONTEXT, HOOKTYPE>>(opts: TAPOPTS, callback: HookCallbackPromise<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>) {
    this.hooks.forEach(it => {
      (it as AsyncHook).tapPromise(opts, callback)
    })
  }

  tapAsync<TAPOPTS extends TapOptionsAsync<PARAMS, CONTEXT, HOOKTYPE>>(opts: TAPOPTS, callback: HookCallbackAsync<PARAMS, CONTEXT, HOOKTYPE, TAPOPTS>) {
    this.hooks.forEach(it => {
      (it as AsyncHook).tapAsync(opts, callback)
    })
  }

  intercept(interceptor: InterceptOptions<PARAMS, CONTEXT, TAPDATA, HOOKTYPE>) {
    this.hooks.forEach(it => {
      it.intercept(interceptor)
    })
  }

  isUsed() {
    return this.hooks.some(it => it.isUsed())
  }

  setInfo(info: Partial<HookInfo>) {
    this.hooks.forEach(it => {
      it.setInfo(info)
    })
    return this
  }

  /**
   * For Tapable interop testing only
   * @param options
   */
  withOptions(options: any) {
    this.hooks.forEach(it => {
      const update = it.withOptions(options)
      if (typeof update === 'object') {
        Object.assign(it, update)
      }
    })
    return this
  }
}
