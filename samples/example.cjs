const {
  createSyncHook,
  createAsyncHook
} = require('../dist/index.umd.cjs')

const syncHook = createSyncHook() // series by default
syncHook.tap(message => console.log(`Sync Message: ${message}`))
syncHook.call('Hello')

const asyncHook = createAsyncHook() // parallel by default
asyncHook.tap(async message => console.log(`Async Message: ${message}`))
await asyncHook.call('Hello').catch(e => console.error(e))

const waterfallHook = createSyncHook({ type: 'waterfall' })
waterfallHook.tap(value => value + '+1')
waterfallHook.tap(value => value + '+2')
waterfallHook.tap(value => value + '+3')
const result = waterfallHook.call('Hello')
console.log(result) // 'Hello+1+2+3"

const bailHook = createSyncHook({ type: 'bail' })
bailHook.tap(value => {
  console.log("bail1")
})
bailHook.tap(value => {
  return "2"
})
bailHook.tap(value => {
  console.log("bail3")
})
bailHook.call() // prints "bail1" & returns "2"

const interceptHook = createSyncHook()
interceptHook.intercept({
  tap: (info) => {
    console.log('interceptHook was tapped by ' + info.name)
  }
})
interceptHook.tap({ name: 'the tapper' }, () => {
})
