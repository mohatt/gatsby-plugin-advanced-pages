import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import debug from 'debug'

// Initializes options
// The function only runs when called with args to initialize and cache
// options object. Subsequent calls without args return the cached value
export function initializeOptions (args) {
  if (arguments.length === 0) {
    if (typeof initializeOptions.options === 'undefined') {
      return reportError('Cant fetch options because they are not initialized')
    }

    return initializeOptions.options
  }

  // Merge user-defined options with defaults
  const options = _.merge(args.defaultOptions, args.pluginOptions)

  // set the root path of the the project
  options._root = args.store.getState().program.directory

  // Ensure basePath is absolute
  options.basePath = path.join('/', options.basePath)

  // Cache the options object now so that subsequent
  // calls dont throw an error
  initializeOptions.options = options

  // Verify directory locations
  options.directories = _.mapValues(options.directories, dir => {
    return lookupPath(dir)
  })

  // Verify default template
  if(options.template) {
    options.template = lookupPath(options.template, options.directories.templates)
  }

  // Debug final options object
  debug('gatsby-plugin-advanced-pages')('Options', options)

  initializeOptions.options = options
}

// Initializes reporter
// The function only runs when called with args to initialize and cache
// reporter object. Subsequent calls without args return the cached value
export function initializeReporter (reporter) {
  if (arguments.length === 0) {
    if (typeof initializeReporter.reporter === 'undefined') {
      throw new Error('Cant fetch reporter because it is not initialized')
    }

    return initializeReporter.reporter
  }

  const errorMap = {
    [10000]: {
      text: context => context.message,
      level: `ERROR`,
      type: `PLUGIN`,
    },
  }

  if (reporter.setErrorMap) {
    reporter.setErrorMap(errorMap)
  }

  initializeReporter.reporter = reporter
}

// Gets the initialized eporter object
export function getReporter () {
  return initializeReporter()
}

// Gets the initialized eporter object
export function reportError (message, e = null) {
  const reporter = getReporter()
  const prefix = `"gatsby-plugin-advanced-pages" threw an error while running`

  if(!e) {
    reporter.panic({
      id: `10000`,
      context: {
        message: prefix
      },
      error: new Error(message)
    })
    return
  }

  reporter.panic({
    id: `10000`,
    context: {
      message: `${prefix}:\n ${message}`
    },
    error: e
  })
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
export function lookupPath(location, parent = null){
  if(!location || typeof location !== 'string') {
    return reportError(
      `ensurePath() expected a non-empty string but got ${typeof location}("${location}")`
    )
  }

  let search = []
  if(parent) {
    const localPath = path.join(parent, location)
    search.push(localPath)
    if(fs.existsSync(localPath)) {
      return localPath
    }
  }

  const rootPath = path.join(getOption('_root'), location)
  search.push(rootPath)
  if(fs.existsSync(rootPath)) {
    return rootPath
  }

  search.push(location)
  if(fs.existsSync(location)) {
    return location
  }

  reportError(
    `A path with value "${location}" could not be found at ` +
    `any of the following locations:\n - "${search.join(`\n - "`)}"`
  )
}
