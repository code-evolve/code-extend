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
