# Testing
One time
```shell
yarn test
```
Continuous
```shell
yarn testc
```

# Building
To build the ES6 and CJS distribution, us the following command.
The libraries will be placed in the `./dist` directory.
```shell
yarn build
```

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
