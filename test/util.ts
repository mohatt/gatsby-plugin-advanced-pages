import fs from 'fs'
import path from 'path'
import { vi } from 'vitest'
import { vol, IFs } from 'memfs'
import { onPluginInit } from '../src/node/plugin'
import type { PluginOptions } from '../src/node/api'

// Virtual Project Root
export const projectRoot = '/virtual/project'

/**
 * Changes plugin options by invoking the onPluginInit hook
 */
export function mountOptions(options?: PluginOptions) {
  onPluginInit(
    <any>{
      store: {
        getState: () => ({
          program: { directory: projectRoot },
        }),
      },
      reporter: {
        warn: vi.fn().mockImplementation((msg) => {
          const error = new Error(msg)
          error.name = 'Warning'
          throw error
        }),
        panic: vi.fn().mockImplementation(({ error, context: { message: title } }) => {
          throw { title, error }
        }),
      },
    },
    { ...options, plugins: [] },
  )
}

/**
 * Creates a virtual directory at the specified path if it does not already exist.
 */
export const mountDir = (name: string) => {
  const mountPath = path.resolve(projectRoot, name)
  vol.fromJSON({ [mountPath]: null })
}

/**
 * Creates a virtual file with the specified name and content.
 */
export const mountFile = (name: string, content = '//noop') => {
  const mountPath = path.resolve(projectRoot, name)
  vol.fromJSON({ [mountPath]: content })
}

/**
 * Mocks a virtual module by path.
 * Useful when requiring a module that doesn't exist on the filesystem
 */
export const mountModule = (name: string, exports: any) => {
  const mountPath = path.resolve(projectRoot, name)
  vol.fromJSON({ [mountPath]: '//noop' })
  vi.doMock(mountPath, () => ({ default: exports }))
}

/**
 * Retrieves the actual filesystem instance being used in Node.
 */
export const getActualFS = () => {
  return <IFs>(fs as any).__realFs
}

/**
 * Reads the content of a file synchronously.
 */
export const readFile = (filename: string, virtual = true) => {
  return (virtual ? vol : getActualFS()).readFileSync(filename, { encoding: 'utf8' })
}

/**
 * Resets the memory filesystem to its initial state.
 */
export const resetVFS = () => {
  vol.reset()
}
