/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {test, expect, vi, Mock} from 'vitest'
import {AsyncParallelHook, AsyncSeriesBailHook, AsyncSeriesHook, AsyncSeriesLoopHook, AsyncSeriesWaterfallHook, ITapableHook, SyncHook, SyncWaterfallHook} from '../../src/interop/tapable-interop'

async function testHook(hook: ITapableHook) {
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
      let spy: Mock<any>
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
      // ONE tap, sync or async. This asserted 2 for the async case before 0.2.0, which was
      // AsyncParallelBailHook's behaviour wearing AsyncSeriesBailHook's name. The test had been
      // written against the implementation rather than against tapable. Measured against tapable
      // 2.3.3: AsyncSeriesBailHook calls 1, SyncBailHook calls 1, AsyncParallelBailHook calls 2.
      expect(spy).toHaveBeenCalledTimes(1)
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
