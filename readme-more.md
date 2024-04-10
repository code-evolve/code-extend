# Refactoring (deprecated)
We define Typescript definitions for `SyncHook`, `AsyncHook`, and `Hook`.
The `Hook` interface uses union types and can be used for both `sync` and `async` hook types.  
Our approach is  to _always await synchronous calls_,
giving us the flexibility refactor synchronous hooks into asynchronous,
without needing to modify the implementation.

For example, instead of writing

```ts
import {createSyncHook} from './hooks'

const myHook = createSyncHook()
myHook.call()
```
We write
```ts
import {createSyncHook as createHook} from './hooks'

const myHook = createHook()
await myHook.call()
```
This way, if we ever decide to go async, we can just leave the code as is.


# Overriding Defaults
If you would like to change the default behavior of a hook, you can simply override.
```ts
import {createAsyncHook as createAsyncHook2} from 'async_hooks'
import {CreateHookOptions} from './types'

export function createAsyncHook(opts: CreateHookOptions) {
  return createAsyncHook2(Object.assign({type: 'waterfall', reverse: true}, opts))
}
```
