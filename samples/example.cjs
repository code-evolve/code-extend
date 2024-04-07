const {
  createSyncHook,
  createAsyncHook
} = require('../dist/index.umd.cjs')

// It is a good practice to define all hooks in an object
const hooks = {
  syncHook: createSyncHook(), // series by default
  asyncHook: createAsyncHook(), // parallel by default
  waterfallHook: createSyncHook({ type: 'waterfall' }),
  interceptHook: createSyncHook()
}

hooks.syncHook.tap(message => console.log(`Sync Message: ${message}`))
hooks.syncHook.call('Hello')

hooks.asyncHook.tap(async message => console.log(`Async Message: ${message}`))
hooks.asyncHook.call('Hello').catch(e => console.error(e))

console.log('\nWaterfall hooks')
hooks.waterfallHook.tap(value => value + '+1')
hooks.waterfallHook.tap(value => value + '+2')
hooks.waterfallHook.tap(value => value + '+3')
const result = hooks.waterfallHook.call('Hello')
console.log(result) // 'Hello+1+2+3"

console.log('\nInterceptors')
hooks.interceptHook.intercept({
  tap: (info) => {
    console.log('interceptHook was tapped by ' + info.name)
  }
})
hooks.interceptHook.tap({ name: 'The tapper' }, () => {
})
