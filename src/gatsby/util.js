import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import debug from 'debug'

// Initializes options
// The function only runs when called with args to initialize and cache
// options object. Subsequent calls without args return the cached value
export function initializeOptions (options) {
  if (arguments.length === 0) {
    if (typeof initializeOptions.options === 'undefined') {
      throw new Error('Cant fetch options because they are not initialized')
    }

    return initializeOptions.options
  }

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

// Checks if a location exists under parent
// if not checks if it exists under project root
// if not check if its an absolute path
// throws an error if cant find any
export function lookupPath(location, parent = false, root = true){
  if(!location || typeof location !== 'string') {
    throw new TypeError(
      `ensurePath() expected a non-empty string but got ${typeof location}("${location}")`
    )
  }

  let search = []
  if(parent && typeof parent === 'string') {
    const localPath = path.join(parent, location)
    search.push(localPath)
    if(fs.existsSync(localPath)) {
      return localPath
    }
  }

  if(root) {
    const rootPath = typeof root === 'string'
      ? path.join(root, location)
      : path.join(getOption('_root'), location)
    search.push(rootPath)
    if(fs.existsSync(rootPath)) {
      return rootPath
    }
  }

  search.push(location)
  if(fs.existsSync(location)) {
    return location
  }

  throw new Error(
    `A path with value "${location}" could not be found at ` +
    `any of the following locations:\n - "${search.join(`\n - "`)}"`
  )
}
