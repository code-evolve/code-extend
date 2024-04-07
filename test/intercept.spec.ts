import {test, expect, vi} from 'vitest'
import {createAsyncHook, createSyncHook, InterceptOptions} from '../src'

type Route = {
  message: string
}

test('interceptor - call, tap, and register', async () => {
  {
    const hook = createSyncHook<[string, string, Route[]], void, void, 'series'>()
    await testInterceptor(hook)
  }
  {
    const hook = createAsyncHook<[string, string, Route[]], void, void, 'series'>()
    await testInterceptor(hook)
  }
})

test('interceptor - loop', async () => {
  {
    const hook1 = createSyncHook<[string], void, void, 'loop'>({type: 'loop'})
    await testLoopInterceptor(hook1)
  }
  {
    const hook1 = createAsyncHook<[string], void, void, 'loop'>({type: 'loop'})
    await testLoopInterceptor(hook1)
  }
})

async function testInterceptor(hook) {
  const spyCall = vi.fn()
  const spyRegister = vi.fn()
  const spyTap = vi.fn()
  const spyUntap = vi.fn()

  const unreg = hook.intercept(<InterceptOptions<[string, string, Route[]], void, void, 'series'>>{
    call: (source, target, routesList) => {
      spyCall.call(undefined, source, target, routesList)
    },
    // may return a new tapInfo object
    register: (tapInfo) => {
      spyRegister.call(undefined, tapInfo)
      return tapInfo
    },
    tap: (tapInfo) => {
      spyTap.call(undefined, tapInfo)
    },
    untap: (tapInfo) => {
      spyUntap.call(undefined, tapInfo)
    }
  })

  const list: {
    message: string
  }[] = []
  const untap = hook.tap((source, destination, routeList) => {
    routeList.push({message: 'go here go there'})
  })
  await hook.call("a", "b", list)
  untap()

  expect(spyRegister).toHaveBeenCalledOnce()
  expect(spyTap).toHaveBeenCalledOnce()
  expect(spyCall).toHaveBeenCalledOnce()
  expect(spyUntap).toHaveBeenCalledOnce()
  unreg()
}

async function testLoopInterceptor(hook) {
  let loops = 2

  const spyIntercept = vi.fn()
  hook.intercept({
    loop(message) {
      spyIntercept.call(undefined, message)
    },
  })

  const spy1 = vi.fn()
  hook.tap((message) => {
    spy1.call(undefined, message)
  })

  const spy2 = vi.fn()
  hook.tap((message) => {
    spy2.call(undefined, message)
    if (--loops) {
      return true
    }
  })

  await hook.call("looping")

  expect(spy1).toHaveBeenCalledTimes(2)
  expect(spy2).toHaveBeenCalledTimes(2)
  expect(spyIntercept).toHaveBeenCalledTimes(2)
  expect(spyIntercept).toHaveBeenNthCalledWith(1, 'looping')
  expect(spyIntercept).toHaveBeenNthCalledWith(2, 'looping')
}