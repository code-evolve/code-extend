const {
  createSyncHook,
  createAsyncHook
} = require('../dist/index.umd.cjs')

const syncHook = createSyncHook() // series by default
syncHook.tap(message => console.log(`Sync Message: ${message}`))
syncHook.call('Hello')

const asyncHook = createAsyncHook() // series by default
asyncHook.tap(async message => console.log(`Async Message: ${message}`))
await asyncHook.call('Hello').catch(e => console.error(e))

const waterfallHook = createSyncHook({ type: 'waterfall' })
waterfallHook.tap(value => value + '+1')
waterfallHook.tap(value => value + '+2')
waterfallHook.tap(value => value + '+3')
const waterfallResult = waterfallHook.call('Hello')
console.log(waterfallResult) // 'Hello+1+2+3"

const bailHook = createSyncHook({ type: 'bail' })
bailHook.tap(value => {
  console.log("tap1")
})
bailHook.tap(value => {
  console.log("tap2")
  return "2"
})
bailHook.tap(value => {
  console.log("tap3")
})

// prints "tap1", "tap2, and then  returns "2"
const bailResult = bailHook.call()

const interceptHook = createSyncHook()
interceptHook.intercept({
  tap: (info) => {
    console.log('interceptHook was tapped by ' + info.name)
  }
})
interceptHook.tap({ name: 'the tapper' }, () => {
})
