import {expect, it} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'
import {asyncWait} from '../../../util'

it('accept context - async', async function () {
  const hook = createAsyncHook<[message: string], {
    value: string
  }>({
    args: ["message"],
    type: 'series'
  })
  let _context, _message

  hook.tap({
    context: true
  }, async (context, message) => {
    await asyncWait(10)
    context.value = 'a'
    _message = message
  })

  hook.tap({
    context: true
  }, async (context, message) => {
    await asyncWait(5)
    _context = context
    _message = message
  })

  await hook.call('Hello')

  expect(_context).eql({value: 'a'})
  expect(_message).equal('Hello')
})

it('accept context - sync', function () {
  const hook = createSyncHook<[message: string], {
    value: string
  }>()
  let _context, _message

  hook.tap({
    context: true
  }, (context, message) => {
    context.value = 'a'
    _message = message
  })

  hook.tap({
    context: true
  }, (context, message) => {
    _context = context
    _message = message
  })

  hook.call('Hello')

  expect(_context).eql({value: 'a'})
  expect(_message).equal('Hello')
})

it('provide context - sync', function () {
  const hook = createSyncHook<[message: string], {
    value: string
  }>()

  const results = []
  hook.tap({
    context: true
  }, (context, message) => {
    results.push(context, message)
  })

  hook.call2({
    context: {value: 'a'},
    args: ['Hello']
  })
  expect(results).to.eql([
    {value: 'a'},
    'Hello'
  ])
})

it('provide context - async', async function () {
  const hook = createAsyncHook<[message: string], {
    value: string
  }>()

  const results = []
  hook.tap({
    context: true
  }, (context, message) => {
    results.push(context, message)
  })

  await hook.call2({
    context: {value: 'a'},
    args: ['Hello']
  })
  expect(results).to.eql([
    {value: 'a'},
    'Hello'
  ])
})
