import { createFilter } from '@rollup/pluginutils';

export function jestToViPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'jest-to-vi',
    transform(code, id) {
      if (!filter(id)) return;
      let replaced = code

      const rxJest = /\bjest\.fn\((.*)/g
      replaced = replaced.replace(rxJest, 'vi.fn($1')

      // Allow for extra fields
      const rxCalledWith = /(toHaveBeenLastCalledWith\()({.*?})(\);)/gs
      replaced = replaced.replace(rxCalledWith, "$1 expect.objectContaining($2) $3")

      if (replaced.length !== code.length) {
        return {
          code: replaced,
          // map: generatedSourceMap
        };
      }
    }
  };
}
