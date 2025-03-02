import path from 'path'
import lodash from 'lodash'
import { mountFile, setupPlugin, resetVFS, projectRoot } from '@test/util'
import { createPluginExport, getDefaultExport, ensurePath, reporter } from '../util'

describe('util', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    resetVFS()
    setupPlugin()
  })

  describe('createPluginExport', () => {
    const mockApi: any = 'onCreatePage'

    describe.each(['sync', 'async'] as const)('%s function', (type) => {
      it('should execute the original function correctly', async () => {
        const mockFn =
          type === 'sync' ? vi.fn(() => 'return value') : vi.fn(async () => 'async return value')

        const wrappedFn = createPluginExport(mockApi, mockFn)

        if (type === 'sync') {
          let result: any
          expect(() => {
            result = wrappedFn()
          }).not.toThrow()
          expect(result).toBe('return value')
        } else {
          await expect(wrappedFn()).resolves.toBe('async return value')
        }

        expect(mockFn).toHaveBeenCalledTimes(1)
      })

      it('should catch errors and call reporter.error()', async () => {
        const reporterError = new Error('Mocked reporter error')
        vi.spyOn(reporter, 'error').mockImplementation(() => {
          throw reporterError
        })

        const error = new Error('MockFn error')
        const mockFn =
          type === 'sync'
            ? vi.fn(() => {
                throw error
              })
            : vi.fn(async () => {
                throw error
              })

        const wrappedFn = createPluginExport(mockApi, mockFn)

        if (type === 'sync') {
          expect(() => wrappedFn()).toThrow(reporterError)
        } else {
          await expect(wrappedFn()).rejects.toThrow(reporterError)
        }

        expect(mockFn).toHaveBeenCalledTimes(1)
        expect(reporter.error).toHaveBeenCalledWith(mockApi, error)
      })
    })
  })

  describe('getDefaultExport', () => {
    const exportValue = 'DEFAULT_EXPORT'
    const getModulePath = (name: string) => path.join(__dirname, '__fixtures__/files', name)
    const localModules = [
      'test-module.cjs',
      'test-module-default.cjs',
      'test-module.mjs',
      'test-module.json',
    ]

    describe.each(['import', 'require'] as const)('%s', (method) => {
      beforeEach(() => {
        if (method === 'require') {
          vi.stubEnv('VITEST', 'false')
        }
      })

      it.each(localModules)('should correctly load local module (%s)', async (fileName) => {
        await expect(getDefaultExport(getModulePath(fileName))).resolves.toBe(exportValue)
      })

      it('should correctly load external module (lodash)', async () => {
        await expect(getDefaultExport('lodash')).resolves.toBe(lodash)
      })

      it('should correctly load system module (path)', async () => {
        await expect(getDefaultExport('path')).resolves.toBe(path)
      })

      it('throws if the module does not exist', async () => {
        await expect(getDefaultExport('./non-existent.js')).rejects.toMatchSnapshot()
      })

      if (method === 'import') {
        it.each(localModules)('throws for invalid default export (mock: %s)', async (fileName) => {
          const modulePath = getModulePath(fileName)
          vi.doMock(modulePath, () => ({ default: null }))
          await expect(getDefaultExport(modulePath)).rejects.toMatchSnapshot({} as any)
          vi.doUnmock(modulePath)
        })
      }
    })
  })

  describe('ensurePath', () => {
    const cases = [
      {
        case: 'found in parent directory',
        parent: '/mock/parent',
        location: 'file.txt',
        files: ['/mock/parent/file.txt', `${projectRoot}/file.txt`],
      },
      {
        case: 'found in parent directory (absolute)',
        parent: '/mock/parent',
        location: '/to/file.txt',
        files: ['/mock/parent/to/file.txt', `${projectRoot}/to/file.txt`, '/to/file.txt'],
      },
      {
        case: 'found in project root',
        parent: undefined,
        location: 'file.txt',
        files: [`${projectRoot}/file.txt`],
      },
      {
        case: 'found in project root (absolute)',
        parent: undefined,
        location: '/to/file.txt',
        files: [`${projectRoot}/to/file.txt`, '/to/file.txt'],
      },
      {
        case: 'fallback to project root when parent directory is missing',
        parent: '/mock/parent',
        location: 'file.txt',
        files: [`${projectRoot}/file.txt`],
      },
      {
        case: 'found as absolute path',
        parent: '/mock/parent',
        location: '/absolute/file.txt',
        files: ['/absolute/file.txt'],
      },
    ]

    describe.each(cases)('$case', ({ parent, location, files }) => {
      it('should return the correct path if the file exists', () => {
        files.forEach((file) => mountFile(file))
        expect(() => ensurePath(location, parent)).not.toThrow()
        expect(ensurePath(location, parent)).toBe(files[0])
      })
    })

    it.each([['missing.txt'], ['/path/to/missing.txt'], ['/path/to/missing.txt', '/parent']])(
      'throws if the file does not exist (%s)',
      (location, parent) => {
        expect(() => ensurePath(location, parent)).toThrowErrorMatchingSnapshot()
      },
    )
  })
})
