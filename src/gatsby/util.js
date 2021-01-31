import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import debug from 'debug'

// Initializes options
// The function only runs when called with args to initialize and cache
// options object. Subsequent calls without args return the cached value
export function initializeOptions (args) {
  if (arguments.length === 0) {
    if (typeof initializeOptions.options === 'undefined') {
      throw new Error('Cant fetch options because they are not initialized')
    }

    return initializeOptions.options
  }

  const options = args.pluginOptions
  const root = args.store.getState().program.directory

  // Ensure basePath is absolute
  options.basePath = path.join('/', options.basePath)

  // Convert directory paths to absolute ones
  options.directories = _.mapValues(options.directories, dir => {
    const dirPath = path.join(root, dir)
    if (!fs.existsSync(dirPath)) {
      mkdirp.sync(dirPath)
    }
    return dirPath
  })

  // Debug final options object
  debug('gatsby-plugin-advanced-pages')('Options', options)

  initializeOptions.options = options
  return options
}

// Gets the initialized options object
export function getOptions () {
  return initializeOptions()
}

// Gets the value of a single option
export function getOption (optionName) {
  return _.get(getOptions(), optionName)
}
