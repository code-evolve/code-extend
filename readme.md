This project is inspired by the `Tapable` project contributed by the `Webpack` team.

# Motivation
A plugin system requires an event bus for communication between the host and extensions.
The standard `EventEmitter` has two main limitations:  It is not asynchronous, and it
disregards the return value of listeners.

This library solves both of these issues, and offers additional features to
manage the topology and behavior of the event bus.

# Differences From Tapable

* Taps can be removed (untapped)
* Tap callback order can be reversed
* Only `promises` are used for async functionality
* The `name` parameter is optional
* There are only 2 types of hooks: SyncHook and AsyncHook
  All other types are specified using options (parallel, series, waterfall, bail, loop)
* Options include controlling how exceptions in callbacks are handled
* Composables are used instead of classes
* Code generated is 1/10 to 1/7 the size for a .02% performance difference

# Implemented Functionality

| Feature      | Implemented |
|--------------|-------------|
| tap          | yes         |
| tapPromise   | yes         |
| tapAsync     | no          |
| call         | yes         |
| sync         | yes         |
| context      | yes         |
| Interception | no          |
| HookMap      | no          |
| Multihook    | no          |

Other Tapable functionality may be included in a future release.

# Examples

Hooks are created using `createSyncHook(...)` and `createAsyncHook(...)`

## Sync hooks

No Args

```ts
const syncHook = createSyncHook()
syncHook.tap(() => console.log('The hook was called'))
syncHook.call()
```

With arguments

```ts
const syncHook = createSyncHook(['message'])
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

With options and error handling

```ts
const syncHook = createSyncHook({args: ['message'], onError: 'log'})
syncHook.tap((message) => throw new Error('No way!'))
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // Exception will be logged and second tap will be called
```

```ts
const syncHook = createSyncHook({args: ['message'], onError: 'throw'})
syncHook.tap((message) => throw new Error('No way!'))
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // This will throw and second tap will not be called
```

## Async hooks

```ts
const asyncHook = createAsyncHook()
syncHook.tap(message => console.log('Hook1 was called'))
syncHook.tap(message => console.log('Hook2 was called'))
await asyncHook.call() // All taps called in parallel by default
```

With options

```ts
const asyncHook = createAsyncHook({asyncType: 'waterfall', onError: 'ignore', reverse: true})
syncHook.tap(packet => packet + '1')
syncHook.tap(packet => packet + '2')
await asyncHook.call('3') // return value is '321'
```

## Untapping

```ts
const syncHook = createSyncHook()
const untap1 = syncHook.tap(() => console.log('Hook 1'))
const untap2 = syncHook.tap(() => console.log('Hook 2'))
syncHook.call()
untap1()
syncHook.call()
untap2()
syncHook.call()
```

## Overriding Defaults
If you would like to change the default behavior of a hook, you can simply override.
```ts
import {createAsyncHook as createAsyncHook2} from 'async_hooks'
import {CreateHookOptions} from './types'

export function createAsyncHook(opts: CreateHookOptions) {
  return createAsyncHook2(Object.assign({type: 'waterfall', reverse: true}, opts))
}
```

## Refactoring
We define typescript definitions for `SyncHook`, `AsyncHook`, and `Hook`. 
The `Hook` interface uses union types and can be used for both.  
Our approach is always await synchronous calls,
giving us the flexibility to make it to asynchronous without needing to modify.

For example, instead of writing

```ts
import {createSyncHook} from './hooks'

const myHook = createSyncHook()
myHook.call()
```
We write
```ts
import {Hook, createSyncHook} from './hooks'

const myHook = createSyncHook()
await myHook.call()
```
This way, if we ever decide to go async, we can just leave the code as is.
# References

https://github.com/webpack/tapable