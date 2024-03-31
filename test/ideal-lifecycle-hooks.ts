import {createAsyncHook} from '../src'

export const idealLifecycleHooks = {
  meta: {
    beforeLocateMeta: createAsyncHook(),
    locatedMeta: createAsyncHook(),
    beforeDownloadMeta: createAsyncHook(),
    downloadedMeta: createAsyncHook(),
    beforeCompileMeta: createAsyncHook(),
    compiledMeta: createAsyncHook(),
    beforeLoadMeta: createAsyncHook(),
  },

  content: {
    beforeLocateContent: createAsyncHook(),
    locatedContent: createAsyncHook(),
    beforeDownloadContent: createAsyncHook(),
    downloadedContent: createAsyncHook(),
    beforeCompileContent: createAsyncHook(),
    compiledContent: createAsyncHook(),
    loadedContent: createAsyncHook(),
  },

  install: {
    beforeResolve: createAsyncHook(),
    resolved: createAsyncHook(),
    beforeInstall: createAsyncHook(),
    installed: createAsyncHook(),
  },

  execute: {
    beforeMount: createAsyncHook(),
    mounted: createAsyncHook(),
    beforeActivate: createAsyncHook(),
    activated: createAsyncHook(),
    beforeUpdate: createAsyncHook(),
    updated: createAsyncHook(),
  }
}