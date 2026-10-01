/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {Hook, HookMapInterceptor, IHookMap} from './types'

export class HookMap<T extends Hook> implements IHookMap<T> {
  map = new Map<any, T>()
  fn: (key: any) => T
  interceptors: HookMapInterceptor<T>[] = []

  constructor(fn: (key: any) => T) {
    this.fn = fn
  }

  for(key: any): T {
    let ret: T

    ret = this.map.get(key)
    if (!ret) {
      ret = this.fn(key)

      for (const it of this.interceptors) {
        ret = it.factory(key, ret)
      }

      this.map.set(key, ret)
    }
    return ret
  }

  get(key: any): T | undefined {
    return this.map.get(key)
  }

  intercept(interceptor: HookMapInterceptor<T>) {
    this.interceptors.push(interceptor)
  }
}

