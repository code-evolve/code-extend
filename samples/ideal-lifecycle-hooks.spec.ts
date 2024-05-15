import {expect, test} from 'vitest'
import {idealLifecycleHooks} from './ideal-lifecycle-hooks'

function log(...args: any[]) {
  // log.apply(null, args)
}

export async function asyncWait(milli: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, milli)
  })
}

test('should hook all items', async function () {
  const calling = []
  const called = []

  Object.entries(idealLifecycleHooks.meta).map(it => {
    it[1].tap(() => {
      log(it[0])
      called.push(it[0])
    })
  })

  Object.entries(idealLifecycleHooks.content).map(it => {
    it[1].tap(() => {
      log(it[0])
      called.push(it[0])
    })
  })

  Object.entries(idealLifecycleHooks.install).map(it => {
    it[1].tap(() => {
      log(it[0])
      called.push(it[0])
    })
  })

  Object.entries(idealLifecycleHooks.execute).map(it => {
    it[1].tap(() => {
      called.push(it[0])
    })
  })


  const meta = Object.entries(idealLifecycleHooks.meta).map(async it => {
    calling.push(it[0])
    await asyncWait(10)
    it[1].call().catch(e => console.error(e))
  })

  const content = Object.entries(idealLifecycleHooks.content).map(async it => {
    calling.push(it[0])
    await asyncWait(10)
    it[1].call().catch(e => console.error(e))
  })

  await Promise.all(meta.concat(content))

  const install = Object.entries(idealLifecycleHooks.install).map(async it => {
    calling.push(it[0])
    await asyncWait(10)
    it[1].call().catch(e => console.error(e))
  })
  await Promise.all(install)

  const execute = Object.entries(idealLifecycleHooks.execute).map(async it => {
    calling.push(it[0])
    await asyncWait(10)
    it[1].call().catch(e => console.error(e))
  })
  await Promise.all(execute)

  const keys = [
    ...Object.keys(idealLifecycleHooks.meta),
    ...Object.keys(idealLifecycleHooks.content),
    ...Object.keys(idealLifecycleHooks.install),
    ...Object.keys(idealLifecycleHooks.execute),
  ]
  expect(calling).to.eql(keys)
  expect(called).to.eql(keys)
})
