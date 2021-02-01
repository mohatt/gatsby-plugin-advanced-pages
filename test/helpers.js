import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import { onPreBootstrap } from '../src/gatsby'

/**
 * Make sure to mock the fs module in your test
 * file before using any of these functions
 */

// Virtual Project Root
export const programRoot = '/virtual/project'

// Changes plugin options by invoking the preBootstrap hook
// Tests that run after calling this function will receive
// the mounted options
// Mae sure to wrap this in a try..catch block when you pass
// custom options
export function mountOptions(options = {}) {
  onPreBootstrap({
    store: {
      getState: () => ({
        program: { directory: programRoot }
      })
    }
  }, options)
}

// Filesystem helpers
export function mountDir(name) {
  const dirPath = path.resolve(programRoot, name)
  return !fs.existsSync(dirPath) ? mkdirp.sync(dirPath) : null
}

export function mountFile(name, content = '') {
  mountDir(path.dirname(name))
  return fs.writeFileSync(path.resolve(programRoot, name), content.toString())
}

// Mocks a virtual module by path
// Usefull when requiring a module that doesn't
// exist on the filesystem
export function mountModule(name, exports) {
  jest.doMock(path.resolve(programRoot, name), () => exports, { virtual: true })
}
