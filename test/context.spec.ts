/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {expect, it} from 'vitest'
import {createAsyncHook, createSyncHook} from '../src'
import {asyncWait} from '@util-js'

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
