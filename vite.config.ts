import { resolve } from 'path'
import { defineConfig, defaultExclude } from 'vitest/config'

export default defineConfig({
  test: {
    expandSnapshotDiff: true,
    globals: true,
    unstubEnvs: true,
    unstubGlobals: true,
    name: 'unit',
    include: ['**/*.test.?(c|m)[jt]s?(x)', '**/__tests__/*.?(c|m)[jt]s?(x)'],
    exclude: [...defaultExclude, '**/__fixtures__'],
    globalSetup: ['./test/setup.ts'],
    setupFiles: ['./test/setup-test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.?(c|m)[jt]s?(x)'],
    },
    chaiConfig: {
      truncateThreshold: 500,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@test': resolve(__dirname, 'test'),
      // Virtual modules need to be aliased
      '@reach/router': resolve(__dirname, '__mocks__/@reach/router'),
      'gatsby-plugin-advanced-pages-cache/routes.json': resolve(__dirname, '__mocks__/routes.ts'),
    },
  },
})
