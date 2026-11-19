import type { UserConfig } from 'tsdown'

// package.json declares lib/index.js + lib/client.js; bare tsdown defaults to
// dist/, so without this config the snapshot ships a package whose declared
// entry points do not exist (the split script warns "main lib/index.js missing").
//
// Client externals match the module table this package actually requires at
// runtime (react, react/jsx-runtime — see the historical lib/client.js require
// table). @deepseek-ai/dsh-client-ui-* imports are intentionally inlined: the
// shipped artifact bundled them, the web shell does not share those specifiers,
// and externalizing them would break require() at runtime.

const CLIENT_EXTERNALS = ['react', 'react/jsx-runtime']

export default [
  {
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  },
  {
    entry: { client: 'src/client/index.tsx' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    external: [...CLIENT_EXTERNALS],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    },
    noExternal: (id: string) => (CLIENT_EXTERNALS.includes(id) ? undefined : true),
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: "dsh-visualize", factory: (require) => {`,
      footer: `return module.exports; } });`,
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      codeSplitting: false,
    },
  },
] satisfies UserConfig[]
