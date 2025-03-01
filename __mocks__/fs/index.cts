import { fs } from 'memfs'
import __realFs from 'fs'

/**
 * An internal reference to the real Node.js `fs` module.
 * Provides access to the native filesystem instance.
 */
Object.assign(fs, { __realFs })

module.exports = fs
