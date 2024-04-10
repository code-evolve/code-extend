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
