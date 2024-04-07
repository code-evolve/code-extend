const { createSyncHook } = require('../dist/index.umd.cjs')

const hook = createSyncHook()
hook.tap(message => console.log(`Message: ${message}`))
hook.call('Hello')