/*
Copyright (c) 2024-present Steven Spungin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {test, expect} from 'vitest'
import {createSyncHook} from '../src'
import {HookMap} from '../src/hookmap'

test('for and get', () => {
  const hookMap = new HookMap(key => createSyncHook())

  const hook1 = hookMap.for('1')
  const hook2 = hookMap.for('2')

  expect(hook1).to.equal(hookMap.for('1'))
  expect(hook2).to.equal(hookMap.for('2'))
  expect(hook1).to.not.equal(hookMap.for('2'))

  expect(hookMap.get('1')).to.equal(hook1)
  expect(hookMap.get('X')).to.be.undefined
})

test('intercept', () => {

  const origHook = createSyncHook()
  const hookMap = new HookMap(key => origHook)

  hookMap.intercept({
    factory(key, hook) {
      if (key === '1') {
        return createSyncHook()
      }else{
        return hook
      }
    }
  })
  const hook1 = hookMap.for('1')
  const hook2 = hookMap.for('2')

  expect(hook1).to.not.equal(origHook)
  expect(hook2).to.equal(origHook)
})
