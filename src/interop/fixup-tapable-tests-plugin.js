/*
Copyright 2024 TwelveTone LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { createFilter } from '@rollup/pluginutils';

export function fixupTapableTestsPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'jest-to-vi',
    transform(code, id) {
      if (!filter(id)) return;
      let replaced = code

      const interopPath = new URL('./tapable-interop.ts', import.meta.url).pathname
      const rxRequire = /const (.*?)Hook = require\("..\/(.*?)Hook"\);/g
      replaced = replaced.replace(rxRequire, `import {$1Hook} from "${interopPath}";`);

      if (replaced.length !== code.length) {
        return {
          code: replaced,
          // map: generatedSourceMap
        };
      }
    }
  };
}
