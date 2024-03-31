# Code-Extend
Code-Extend is a framework for enabling your codebase to incorporate
plugins, addons, and extensions.

By using a variety of customizable hooks, you will be able
to create a highly extensible, loosely coupled system.

Code-Extend hooks leverage Typescript, giving your hooks
compile-time type checking and IDE code completion.

# Motivation
A plugin system requires an event bus for communication between the host and extensions.
The standard Node `EventEmitter` has a many limitations:
It is inherently synchronous, it is not typed, and it
disregards the return value of listeners.

The Code-Extend library solves these issues, while also offering additional features to
manage the topology and behavior of the event bus.

# Inspiration
This project was inspired by the `Tapable` project 
that was contributed to the open-source community by the `Webpack` team.
See [https://github.com/webpack/tapable](https://github.com/webpack/tapable).  The main super power of `Tapable` is its ability to create
various types of hooks. Although Code-Extend is not a fork of `Tapable`, 
it strives to maintain some API compatibility. 

# Usage

Hooks are created using `createSyncHook(...)` and `createAsyncHook(...)`

## Sync hooks

### With typed arguments

No arguments
```ts
const syncHook = createSyncHook<[]>()
syncHook.tap(() => console.log('The hook was called'))
syncHook.call()
```

One unnamed argument
```ts
const syncHook = createSyncHook<[string]>()
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

One named argument
```ts
const syncHook = createSyncHook<[message:string]>()
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

One named argument with a return value
```ts
const syncHook = createSyncHook<(message:string)=>void>()
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

Two named arguments
```ts
const syncHook = createSyncHook<[string,number]>()
syncHook.tap((name, age) => console.log('The hook was called: ' + message + ' ' + age))
syncHook.call('Woolly', 5)
```

### No Args Specified

```ts
const syncHook = createSyncHook()
syncHook.tap(() => console.log('The hook was called'))
syncHook.call()
```

### With untyped arguments

```ts
const syncHook = createSyncHook(['message'])
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

### With options and error handling

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
Tapped hooks return an `Untap Function`.  Removing a `tap` is called  `untapping`.

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

# Differences From `Tapable`
If you are familiar with Tapable, you might find this section of interest.

* Taps are type-safe using parameter types and return types
* Taps can be removed (untapped)
* Tap callback order can be reversed
* Only `promises` are used for async functionality
* The `name` parameter is optional
* There are only 2 types of hooks: SyncHook and AsyncHook
  All other types are specified using options (parallel, series, waterfall, bail, loop)
* Options include controlling how exceptions in callbacks are handled
* Composable functions are used instead of classes
* Code generated is 1/10 to 1/7 the size for a .02% performance hit

# Implemented Functionality
Other `Tapable` functionality may be included in a future release.

| Feature (of `Tapable`) | Implemented |
|------------------------|-------------|
| tap                    | yes         |
| tapPromise             | yes         |
| tapAsync               | no          |
| call                   | yes         |
| sync                   | yes         |
| context                | yes         |
| Interception           | no          |
| HookMap                | no          |
| Multihook              | no          |


# More Info

## Refactoring
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
