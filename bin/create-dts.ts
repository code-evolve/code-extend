/**
 * This module generates a matching `.d.ts` file for each distributed entry point.
 * Some IDEs require it when finding types.
 */
import {writeFileSync} from 'node:fs'

const template = `\
export * from './types/index';
`

writeFileSync('dist/index.d.ts', template, 'utf-8');
writeFileSync('dist/index.umd.cjs.d.ts', template, 'utf-8');
