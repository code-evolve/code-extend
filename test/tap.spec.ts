import {expect, it, vi} from 'vitest'
import {createSyncHook} from '../src'

it('uses supplied name', function () {
  const hook = createSyncHook<[]>()

  const spy = vi.fn()
  hook.intercept({
    tap: spy
  })

  hook.tap({
    name: 'Hook 1'
  }, () => {
  })

  expect(spy.mock.calls[0][0].name).to.equal('Hook 1')
})

it('uses default name', function () {
  const hook = createSyncHook<[]>()

  const spy = vi.fn()
  hook.intercept({
    tap: spy
  })

  hook.tap(() => {
  })

  expect(spy.mock.calls[0][0].name).to.equal('Unnamed Hook 1')
})


it('uses default reverse', function () {
  const hook = createSyncHook<[]>()

  const spy = vi.fn()
  hook.intercept({
    tap: spy
  })

  hook.tap(() => {
  })

  expect(spy.mock.calls[0][0].reverse).to.be.false
})

it('uses supplied reverse', function () {
  const hook = createSyncHook<[]>()

  const spy = vi.fn()
  hook.intercept({
    tap: spy
  })

  hook.tap({reverse: true}, () => {
  })

  expect(spy.mock.calls[0][0].reverse).to.be.true
})
