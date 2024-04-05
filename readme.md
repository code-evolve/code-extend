# Code-Extend
Code-Extend is a framework for enabling your codebase to integrate
plugins, addons, and extensions.

By using a variety of customizable hook topologies,
your codebase will become a highly extensible, loosely coupled system.

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
See [https://github.com/webpack/tapable](https://github.com/webpack/tapable).  The main superpower of `Tapable` is its ability to create
various types of hooks. Although Code-Extend is not a fork of `Tapable`, 
it strives to maintain some API compatibility. 

# Features
* Typesafe hooks
* Custom error handling
* Call filtering
* Variety of hook topologies
* Fully tested
* Small footprint
* Fast

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

## With typed arguments

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

Two named arguments
```ts
const syncHook = createSyncHook<[name:string, age:number]>()
syncHook.tap((name, age) => console.log('The hook was called: ' + message + ' ' + age))
syncHook.call('Woolly', 5)
```

One named argument with return type
```ts
const syncHook = createSyncHook<(message:string)=>void>()
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```
_note: Hook return types are only applicable to waterfall and bail hooks._

## With untyped, named arguments (AKA the Tapable style)

```ts
const syncHook = createSyncHook(['message'])
syncHook.tap(message => console.log('The hook was called: ' + message))
syncHook.call('Hello')
```

## With error handling

```ts
const syncHook = createSyncHook<[message: string]>({onError: 'log'})
syncHook.tap((message) => {
  throw new Error('No way!')
})
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // Exception WILL be logged and second tap WILL be called
```

```ts
const syncHook = createSyncHook<[message: string]>({onError: 'throw'})
syncHook.tap((message) => {
  throw new Error('No way!')
})
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // This WILL throw and second tap will NOT be called
```

```ts
const syncHook = createSyncHook<[message: string]>({onError: 'ignore'})
syncHook.tap((message) => {
  throw new Error('No way!')
})
syncHook.tap((message) => console.log('The hook was called: ' + message))
syncHook.call('Hello') // Exception will NOT be logged and second tap WILL be called
```

## Async hooks

```ts
const asyncHook = createAsyncHook<(message: string) => void>()
asyncHook.tap(message => console.log('Hook1 was called'))
asyncHook.tap(message => console.log('Hook2 was called'))

// tapPromise is Same as hook.tap
asyncHook.tapPromise(message => console.log('Hook3 was called'))

// tapAsync is the old-school callback API
asyncHook.tapAsync((message, done, err) => {
  console.log('Hook4 was called')
  done()
})

await asyncHook.call('Hello') // All taps called in parallel by default
```

### With options

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

Tap data is typed using the third parameter (TAPDATA) of createHook.
```ts
createSyncHook<PARAMS, CONTENT, TAPDATA>()
```

```ts
test('Call filtering', () => {
  const syncHook = createSyncHook<[string | number], void, string>()
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
```ts
import {createSyncHook} from './hooks'

const syncHook = createSyncHook()
syncHook.tap({context: true}, (context, message) => console.log(context, message))
syncHook.call2({
  context: {name: 'Woolly'},
  args: ['Hello']
})
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

* Taps are type-safe and use parameter types, return types, and context types.
* Taps can be removed (untapped).
* Tap callback order can be reversed.
* Hooks can be filtered when called.
* `promises` are used for async functionality with same signature as sync.
* The `name` parameter is optional when calling `hook.tap`.
* Initial `context` can be supplied to the `hook.call`.
* There are only 2 types of hooks: SyncHook and AsyncHook.
  All other types are specified using options (parallel, series, waterfall, bail, loop).
* Options include controlling how exceptions in callbacks are handled.
* Composable functions are used instead of classes.
* Code generated is 1/10 to 1/7 the size for a .02% performance hit.

# Implemented Functionality
Other `Tapable` functionality may be included in a future release.

| Feature (of `Tapable`) | Implemented |
|------------------------|-------------|
| tap                    | yes         |
| tapPromise             | yes         |
| tapAsync               | yes         |
| call                   | yes         |
| sync                   | yes         |
| context                | yes         |
| Interception           | no          |
| HookMap                | no          |
| Multihook              | no          |
