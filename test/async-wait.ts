/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 * A local copy of `asyncWait`, so the test suite has no undeclared dependency.
 *
 * `async-hooks.spec.ts` and `context.spec.ts` imported this one function from `@util-js`, an alias
 * that is declared nowhere in this package — not a dependency, not in `vite.config.ts`, not in
 * `tsconfig.json`. It resolved only inside an enclosing workspace, so **the suite could not
 * run against a checkout of this package alone**, and the two files that failed to load happened to
 * be the ones covering async behaviour. Two async defects shipped in 0.1.2 with their tests
 * silently not running.
 *
 * Behaviour is identical to the original in `util-js/src/async-util.ts`.
 */
export async function asyncWait(milli: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, milli)
  })
}
