import {test, expect, vi, Mock} from 'vitest'
import {AsyncParallelHook, AsyncSeriesBailHook, AsyncSeriesHook, AsyncSeriesLoopHook, AsyncSeriesWaterfallHook, SyncHook, SyncWaterfallHook} from './tapable-interop'
import {Hook} from '../src'

async function testHook(hook: Hook) {
  const type = hook.getInfo().type
  const isAsync = hook.getInfo().isAsync
  switch (type) {
    case "parallel":
    case "series": {
      const spy = vi.fn()
      await (hook as any).tap('h1', spy)
      await (hook as any).tap('h2', spy)
      if (isAsync) {
        expect(hook.call).to.be.undefined
        await (hook as any).promise("Hello")
        await new Promise(resolve => (hook as any).callAsync(it => resolve(it)))
        expect(spy).toHaveBeenCalledTimes(4)
      } else {
        await hook.call("Hello")
        expect(spy).toHaveBeenCalledTimes(2)
      }
      break
    }
    case "waterfall": {
      await (hook as any).tap('h1', message => message + '1')
      await (hook as any).tap('h2', message => message + '2')
      let result: any
      if (isAsync) {
        expect(hook.call).to.be.undefined
        result = await (hook as any).promise("Hello")
      } else {
        result = await hook.call("Hello")
      }
      expect(result).to.equal("Hello12")
      break
    }
    case "loop": {
      let spy = vi.fn()
      let loops = 4;
      (hook as any).tap('h1', () => {
        spy()
        if (--loops > 0) {
          return true
        }
      })
      await (hook as any).tap('h2', spy)
      await (hook as any).tap('h3', spy)
      if (isAsync) {
        expect(hook.call).to.be.undefined
        await (hook as any).promise("Hello")
      } else {
        await hook.call("Hello")
      }
      expect(spy).toHaveBeenCalledTimes(6)
      break
    }
    case "bail": {
      let spy: Mock<any, any>
      if (hook.getInfo().isAsync) {
        expect(hook.call).to.be.undefined
        spy = vi.fn().mockResolvedValue("Goodbye")
      } else {
        spy = vi.fn().mockReturnValue("Goodbye")
      }
      await (hook as any).tap('h1', spy)
      await (hook as any).tap('h2', spy)
      if (isAsync) {
        await (hook as any).promise("Hello")
      } else {
        await hook.call("Hello")
      }
      if (hook.getInfo().isAsync) {
        expect(spy).toHaveBeenCalledTimes(2)
      } else {
        expect(spy).toHaveBeenCalledTimes(1)
      }
      break
    }
  }
}

test('SyncHook', async () => {
  const hook = new SyncHook<[string]>()
  await testHook(hook)
})

test('SyncHook 2', async () => {
  const hook = new SyncHook<[string]>()
  await hook.promise()
  await new Promise(resolve => hook.callAsync(resolve))
})

test('SyncWaterfallHook', async () => {
  const hook = new SyncWaterfallHook<[string]>()
  await testHook(hook)
})

test('AsyncSeriesHook', async () => {
  const hook = new AsyncSeriesHook<[string]>()
  await testHook(hook)
})

test('AsyncParallelHook', async () => {
  const hook = new AsyncParallelHook<[string]>()
  await testHook(hook)
})

test('AsyncSeriesLoopHook', async () => {
  const hook = new AsyncSeriesLoopHook<[string]>()
  await testHook(hook)
})

test('AsyncSeriesBailHook', async () => {
  const hook = new AsyncSeriesBailHook<[string]>()
  await testHook(hook)
})

test('AsyncSeriesWaterfallHook', async () => {
  const hook = new AsyncSeriesWaterfallHook<[string]>()
  await testHook(hook)
})
