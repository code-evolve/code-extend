# Code-Extend
Code-Extend is a framework for enabling a codebase to integrate
plugins, addons, and extensions.

By using a variety of customizable hook topologies, 
and a comprehensive set of configurable options,
your architecture will become highly extensible and loosely coupled.

Code-Extend leverages `Typescript`, supercharging your development
with compile-time type checking and code completion.
This type safety includes all hooks, taps, calls, contexts,
tap data, and interceptors.

# Usage Overview
## Installing
```shell
yarn add code-extend
npm install code-extend
```
## Basic Usage

With type safety
```ts
import {createSyncHook} from 'code-extend'

const hook = createSyncHook<[string]>()
// Typescript knows that the `tap` callback receives 1 string)
hook.tap(message => { console.log(message) })
// Typescript knows that the `call` method requires 1 string)
hook.call('hello')
```

Async with type safety
```ts
import {createAsyncHook} from 'code-extend'

const hook = createAsyncHook<[message:string]>()
hook.tap(async message => { console.log(message) })
await hook.call('hello')
```

Without type safety
```ts
import {createSyncHook} from 'code-extend'

const hook = createSyncHook()
hook.tap(message => { console.log(message) })
hook.call('hello')
```

# Motivation
A plugin system requires an event bus for communication between the host and extensions.
The standard Node `EventEmitter` has a many limitations:
It is inherently synchronous, it is not typed, and it
disregards the return value of listeners.

Other libraries, such as `Tapable`, 
are limited in their functionality.

The Code-Extend library solves these issues, while also offering additional features to
manage the topology and behavior of the system.

# Features and Benefits
* Typesafe hooks and interceptors
* Custom error handling
* Call filtering
* Synchronous and asynchronous hooks using interchangeable API
* Variety of hook topologies
* Written from the ground up using ES6 and composable functions
* Fully tested
* Lightning fast
* Tiny footprint
* No external dependencies
* Interop with the `Tapable` library

# Usage

Hooks are created using `createSyncHook(...)` and `createAsyncHook(...)`

## Untyped hooks
```ts
const syncHook = createSyncHook()
syncHook.tap(message => console.log('The hook was called:' + message))
syncHook.call('Hello')

const asyncHook = createAsyncHook()
asyncHook.tap(async message => console.log('The hook was called:' + message))
await asyncHook.call('Hello')
```

## Typed parameters

No callback parameters
```ts
const syncHook = createSyncHook<[]>()
syncHook.tap(() => console.log('The hook was called'))
syncHook.call()
```

One unnamed callback parameter
```ts
const syncHook = createSyncHook<[string]>()
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

Two named callback parameters
```ts
const syncHook = createSyncHook<[name:string, age:number]>()
syncHook.tap((name, age) => console.log('The hook was called: ' + message + ' ' + age))
syncHook.call('Woolly', 5)
```

One named callback parameter with a return type. When specifying return types, 
use the `function style` `(arg1, arg2)=>returnValue` 
instead of the `list style` `[arg1, arg2]`.
```ts
const syncHook = createSyncHook<(message:string)=>string>({type: 'waterfall'})
syncHook.tap(message => { console.log('The hook was called: ' + message); return message })
const result = syncHook.call('Hello')
```
> Note: _Hook and call return types are only applicable to waterfall and bail hooks._

## Untyped named arguments 
This uses the Tapable style, and **not recommended**.

```ts
const syncHook = createSyncHook(['message'])
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

## Error handling
There are three ways to handle errors that occur within a tap callback.
These errors are configured per-hook using the `onError` configuration property.

| Strategy | Description                                                                    |
|----------|--------------------------------------------------------------------------------|
| log      | Log the error / Ignore the return value / Continue to call the next tap        |
| ignore   | Do not log the error / Ignore the return value / Continue to call the next tap |
| throw    | Throw an exception / Do not call any more taps                                 |


```ts
const syncHook = createSyncHook<[message: string]>({onError: 'log'})
syncHook.tap((message) => {
  throw new Error('No way!')
})
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // Exception WILL be logged and second tap WILL be called
```

```ts
const syncHook = createSyncHook<[message: string]>({onError: 'ignore'})
syncHook.tap((message) => {
  throw new Error('No way!')
})
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // Exception will NOT be logged and second tap WILL be called
```

```ts
const syncHook = createSyncHook<[message: string]>({onError: 'throw'})
syncHook.tap((message) => {
  throw new Error('No way!')
})
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // This WILL throw and second tap will NOT be called
```

## Async hooks

```ts
const asyncHook = createAsyncHook<(message: string) => void>()
asyncHook.tap(async message => console.log('Hook1 was called'))
asyncHook.tap(async message => console.log('Hook2 was called'))

// tapPromise is same as hook.tap for async hooks
// We suggest sticking with `tap`
asyncHook.tapPromise(async message => console.log('Hook3 was called'))

// tapAsync is the old-school callback API (error,result):void
// We suggest sticking with `tap`, and only using if you need it
asyncHook.tapAsync((message, callback) => {
  console.log('Hook4 was called')
  callback(null)
})

await asyncHook.call('Hello') // All taps called in series by default
```

### Hook options

```ts
  const asyncHook = createAsyncHook<(string) => string>({
  type: 'waterfall',
  onError: 'ignore',
  reverse: true
})
asyncHook.tap(packet => packet + '1')
asyncHook.tap(packet => {
  throw new Error('Should be ignored')
})
asyncHook.tap(packet => packet + '2')
await asyncHook.call('3') // return value is '321'
```

## Call filtering
Hooks can be filtered when called.  The caller can inspect tap data that
was provided when the hook was tapped.

Tap data is typed using the second parameter (TAPDATA) of createHook.
```ts
createSyncHook<PARAMS, TAPDATA, CONTEXT>()
```

```ts
test('Call filtering', () => {
  const syncHook = createSyncHook<[string | number], string>()
  syncHook.tap({data: 'string'}, (message) => console.log('withString', message))
  syncHook.tap({data: 'number'}, (message) => console.log('withNumber', message))
  syncHook.call2({
    filter: (data => data === 'string'),
    args: ['Hello']
  })
  syncHook.call2({
    filter: (data => data === 'number'),
    args: [12]
  })
})
```

## Providing a context

The default `hook.call` method will create an empty object
as the context and provide it to the first hook. 
Use the `hook.call2` method to provide your own context.

Context is typed using the third parameter (CONTEXT) of createHook.
```ts
createSyncHook<PARAMS, TAPDATA, CONTEXT>()
```

A tap opts-in to receiving context as the first callback parameter by
setting the `context` property in the tap options.

`call2` may be used to explicitly set the context object. 
When using `call`, the object is initialed as an empty object.

```ts
import {createSyncHook} from './hooks'

const syncHook = createSyncHook<[string], {name:string}>()
syncHook.tap({context: true}, (context, message) => console.log(context, message))
syncHook.call2({
  context: {name: 'Woolly'},
  args: ['Hello']
})
```

## Untapping
Removing a `tap` is called  `untapping`. Tapped hooks return an `Untap Function`.

```ts
const syncHook = createSyncHook()
const untap1 = syncHook.tap(() => console.log('Hook 1'))
const untap2 = syncHook.tap(() => console.log('Hook 2'))
syncHook.call()  // logs "Hook 1" and "Hook 2"
untap1()
syncHook.call() // logs "Hook 2"
untap2()
syncHook.call() // logs nothing
```

## Typing `hook.call` and `hook.call2`
There is currently an issue with Typescript that
prevents inferring the hook type
unless provided with _all_ or _no_ template parameters.
This means you need to be redundant when you want your
waterfall hook or bail hook return values to be typed.

Not a big deal, but now you know!

```ts
const hook = createSyncHook()
// result: any
const result = hook.call()
```

```ts
const hook = createSyncHook<() => string, any, void, 'bail'>({type:'bail'})
// result: string
const result = hook.call()
```

```ts
const hook = createSyncHook<() => string, any, void, 'sync'>({type:'sync'})
// result: void
const result = hook.call()
```

```ts
// This partial template parameter condition will not be as accurate due to Typescript bug
const hook = createSyncHook<()=>string>({type: 'bail'})
// result: string | void
const result = hook.call()
```

# Reference

## Hook Parameters
There are four parameters that are used to indicate the Typescript types.

```createSyncHook<PARAMS, TAPDATA, CONTEXT, HOOKTYPE>()```

| Parameter | Description                                                                                                                                                      | Default                          |
|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| PARAMS    | Specifies the call and tap callback parameters. This can use function style or list style syntax.                                                                | any parameters / any return type |
| TAPDATA   | Each tap can store a custom data object used for filtering calls.                                                                                                | any type                         |
| CONTEXT   | The type to use when requesting a custom context to be provided in the tap callback.                                                                             | any type                         |
| HOOKTYPE  | The type of hook; This should be the same value that is specified in the hook creation object. This redundant parameter is needed due to Typescript limitations. | 'series'                         |

## Hook Types

### series
Each hook is called one after another.
Return values are ignored.

### parallel
Each hook is called in parallel.
`hook.call` will resolve after all taps resolve or reject.
Return values are ignored.

### waterfall
Each hook is called in series,
receiving the value that the previous hook returned.
`hook.call` returns the final value,
after all taps have resolved or rejected.
This hook is essentially a `pipeline`.

**A hook that returns `undefined` passes the value through unchanged.**
Contributing nothing is not the same as contributing nothing *useful*,
so a hook that declines to alter the value does not destroy it.
Only `undefined` declines: `null` and `''` are real values and replace the accumulated one.

```ts
const hook = createSyncHook<(a: string) => string | void>({type: 'waterfall'})
hook.tap(v => v + '-a')
hook.tap(() => { /* declines */ })
hook.tap(v => v + '-c')
hook.call('start') // 'start-a-c'
```

> Before 0.2.0 the value was overwritten unconditionally, so the example above produced the literal
> string `'undefined-c'`. One declining hook corrupted every value after it, silently.

### bail
Each hook is called in series.
Once one hook returns a value other than `undefined`,
any remaining hooks will not be called
and `call` returns that value.

If no hook returns a value, `call` returns `undefined`,
so *answered* and *declined* stay distinguishable.
Only `undefined` declines. `null` is an answer, so a tap returning `null` stops the hook.

This matches tapable's `SyncBailHook` and `AsyncSeriesBailHook`.

### race
Every hook is started at once.
The first to **resolve** wins, and the remaining hooks are abandoned.

Use `race` when the taps are independent lookups
and the fastest answer is as good as any other;
use `bail` when their **order** is the point.

This matches tapable's `AsyncParallelBailHook`.
For a sync hook there is no concurrency to race,
so `race` behaves exactly as `bail`.

> Added in 0.2.0. The async `bail` previously raced its taps, which is this behaviour under the
> wrong name: it matched `AsyncParallelBailHook` while being called `AsyncSeriesBailHook`. The two
> are now named separately, so `bail` means the same thing in both APIs.

### loop
Each hook is called in series.
If one hook returns a value other than `undefined`,
the `hook.call` will restart from the first hook.
This will continue until all hooks return `undefined`.
The return `not-undefined` value 
that is used to initiate the loop
is not returned from `hook.call`.

# Inspiration
This project was inspired by the `Tapable` project
that was contributed to the open-source community by the `Webpack` team.
See [https://github.com/webpack/tapable](https://github.com/webpack/tapable).  The main superpower of `Tapable` is its ability to create
various types of hooks. Although Code-Extend is not a fork of `Tapable`,
it strives to maintain some API compatibility.  If you already use
Tapable, Code-Extend includes features that will supercharge your
experience.

## Differences From `Tapable`
If you are familiar with Tapable, you might find this section of interest.

* Hooks are type-safe.  This includes taps, calls, return types, context, filter
    data and interceptors.
* Taps can be removed (untapped).
* Tap callback order can be reversed.
* Untap interception was added.
* `call` and `tap` can be used for both sync and async hooks.
* Hooks can be filtered when called, using a typesafe hook filter object.
* `promises` are used for async functionality with same signature as sync.
* The `name` parameter is optional when calling `hook.tap`.
* Initial `context` can be supplied to the `hook.call`.
* There are only 2 types of hooks: SyncHook and AsyncHook.
  All other types are specified using options (parallel, series, waterfall, bail, race, loop).
* Options include controlling how exceptions in callbacks are handled.
* Composable functions are used internally, instead of classes.
* Code generated is 1/10 to 1/7 the size of `Tapable`, for a .02% performance hit.

### Implemented Functionality

| Feature | Implemented | Comment                                              |
|---------------------|-------------|------------------------------------------------------|
| tap                 | yes         | When async, same as `tapPromise`                     |
| tapPromise          | yes         | Recommended to use `tap` instead                     |
| tapAsync            | yes         |                                                      |
| call                | yes         | Extended using `call2`                               |
| sync                | yes         | Recommended to use `tap` instead                     |
| context             | yes         | Can be provided in `hook.call`                       |
| Interception        | yes         | `tap`, `untap`, `register`, and `loop`               |
| HookMap             | not exported | In `src`, but not exported from the entry point; use `call2({filter})` |
| Multihook           | yes         | As `Interop.MultiHook`                               |

### Tapable Interop
We have included an interop library that allows using `Code-Extend`
with the `Tapable` API.  This library uses ES6 proxies to embed our
composable architecture inside class instances.
We have tested this library against the `Tapable` unit tests.

The hooks provided are
`SyncHook`, `SyncWaterfallHook`, `SyncLoopHook`, `SyncBailHook`,
`AsyncSeriesHook`, `AsyncParallelHook`, `AsyncSeriesWaterfallHook`,
`AsyncSeriesLoopHook`, `AsyncSeriesBailHook` and `AsyncParallelBailHook`.

> `AsyncParallelBailHook` was added in 0.2.0, alongside the `race` topology it maps to.

```ts
import {Interop} from 'code-extend'
// Now use Interop as if it was 'tapable'
const {SyncHook} = Interop

// Notice you will be required to name your taps, 
// as mandated by the `Tapable` API.

const hook = new SyncHook(['message'])
hook.tap('hook1', message => { console.log(message) })
hook.call('Hello')

// Notice async hooks do not have `tap` or `call` methods
// in the `Tapable` API: you tap with `tapPromise` or `tapAsync`,
// and you call with `promise` or `callAsync`.

const {AsyncSeriesHook} = Interop
const hook2 = new AsyncSeriesHook(['message'])

hook2.tapPromise('hook1', async message => { console.log(message) })
await hook2.promise('Hello')

hook2.tapAsync('hook2', (message, done) => { console.log(message); done() })
hook2.callAsync('Hello', () => { console.log('every tap finished') })

// This will not work: async hooks have no `call` in the `Tapable` API
// hook2.call('Hello')
```

# Developer

## Testing
One time
```shell
yarn test
```
Continuous
```shell
yarn testc
```

## Building
To build the ES6 and UMD distribution, use the following command.
All libraries and type definitions will be placed inside the `./dist` directory.

_Note: This will first **clean** the `./dist` directory._
```shell
yarn build
```
