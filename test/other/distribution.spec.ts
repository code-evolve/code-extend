/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
// noinspection DuplicatedCode

import {expect, suite, test, vi} from 'vitest'
import {ITapableAsyncHook, ITapableSyncHook} from '../../src/interop/tapable-interop'

test('distribution - ES6', async () => {
  const {createSyncHook} = await import ('../../dist')
  const hook = createSyncHook<[string]>()
  const spy = vi.fn()
  hook.tap(spy)
  hook.call("1")
  hook.call("2")
  expect(spy).toHaveBeenCalledTimes(2)
  expect(spy).toHaveBeenNthCalledWith(1, "1")
  expect(spy).toHaveBeenNthCalledWith(2, "2")
})

test('distribution - CJS', async () => {
  // The UMD bundle has no declarations of its own, so this import is untyped and the call
  // cannot take type arguments. That is the point of the test: it exercises the CJS artifact
  // as a plain consumer would, not as a typed one.
  const {createSyncHook} = await import ('../../dist/index.umd.cjs')
  const hook = createSyncHook()
  const spy = vi.fn()
  hook.tap(spy)
  hook.call("1")
  hook.call("2")
  expect(spy).toHaveBeenCalledTimes(2)
  expect(spy).toHaveBeenNthCalledWith(1, "1")
  expect(spy).toHaveBeenNthCalledWith(2, "2")
})

test('example', async () => {
  // Run it with PLAIN NODE, not through `import`. Vitest transforms the file through vite, which
  // supports top-level await — so an `await import(...)` of this sample passed for years while
  // `node samples/example.cjs` threw a SyntaxError, and 0.1.2 shipped it broken. The test
  // environment was not the user's environment, so the test could not see the defect it covered.
  const {execFileSync} = await import('node:child_process')
  const {fileURLToPath} = await import('node:url')
  const sample = fileURLToPath(new URL('../../samples/example.cjs', import.meta.url))
  const out = execFileSync(process.execPath, [sample], {encoding: 'utf8', stdio: 'pipe'})
  expect(out).toContain('Sync Message: Hello')
  expect(out).toContain('Hello+1+2+3')
})

suite('Tapable interop', () => {
  test('SyncHook', async () => {
    const {Interop} = await import ('../../dist')
    const hook = new Interop.SyncHook(['message']) as ITapableSyncHook
    const spy = vi.fn()
    hook.tap('h1', spy)
    hook.call("1")
    expect(spy).toHaveBeenLastCalledWith("1")
  })

  test('AsyncHook', async () => {
    const {Interop} = await import ('../../dist')
    const hook = new Interop.AsyncSeriesHook(['message']) as ITapableAsyncHook
    const spy = vi.fn()
    hook.tap('h1', spy)
    expect(hook.call).to.be.undefined
    await hook.promise("1")
    await new Promise(result=> hook.callAsync("2", result))
    expect(spy).toHaveBeenNthCalledWith(1,"1")
    expect(spy).toHaveBeenNthCalledWith(2,"2")
  })
})

test('distribution - every relative import in a shipped declaration resolves', async () => {
  // 0.2.0 shipped `dist/interop/tapable-interop.d.ts` re-exporting from `../multihook` while the
  // build excluded `multihook.d.ts`. Nothing here caught it: the tests import from `src`, where
  // the file exists, so only a consumer typechecking the installed package could see it.
  const {readdirSync, readFileSync, existsSync} = await import('node:fs')
  const {dirname, join, resolve} = await import('node:path')
  const {fileURLToPath} = await import('node:url')
  const dist = fileURLToPath(new URL('../../dist', import.meta.url))
  const declarations = (readdirSync(dist, {recursive: true}) as string[])
    .filter(file => file.endsWith('.d.ts'))
  expect(declarations.length).toBeGreaterThan(0)
  const unresolved: string[] = []
  for (const file of declarations) {
    const text = readFileSync(join(dist, file), 'utf8')
    for (const match of text.matchAll(/\bfrom\s+['"](\.[^'"]*)['"]/g)) {
      const target = resolve(dirname(join(dist, file)), match[1])
      if (!existsSync(target + '.d.ts') && !existsSync(join(target, 'index.d.ts'))) {
        unresolved.push(`${file} -> ${match[1]}`)
      }
    }
  }
  expect(unresolved).toEqual([])
})
