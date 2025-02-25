import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import debug from 'debug'
import type { NodePluginArgs, Reporter } from 'gatsby'
import type { PluginOptions } from './types'

export interface ResolvedPluginOptions extends PluginOptions {
  _root: string;
}

/**
 * Represents the internal state of the plugin.
 */
const internalState: {
  options?: ResolvedPluginOptions
  reporter?: Reporter
} = {}

// Initializes options
// The function only runs when called with args to initialize and cache
// options object. Subsequent calls without args return the cached value
export const initializeOptions = (args?: Pick<NodePluginArgs, 'store'> & { pluginOptions: Partial<PluginOptions>, defaultOptions: PluginOptions }): ResolvedPluginOptions => {
  if (args === undefined) {
    if (!('options' in internalState)) {
      reportError('Cant fetch options because they are not initialized')
      return null
    }

    return internalState.options
  }

  // Merge user-defined options with defaults
  const options: ResolvedPluginOptions = _.merge(
    // set the root path of the project
    { _root: args.store.getState().program.directory },
    args.defaultOptions,
    args.pluginOptions,
  )
  // Ensure basePath is absolute
  options.basePath = path.join('/', options.basePath)
  // Ensure type names are Title case
  options.typeNames = _.mapValues(options.typeNames, _.upperFirst)
  // Convert directory paths to absolute ones
  options.directories = _.mapValues(options.directories, dir => (
    path.join(options._root, dir)
  ))

  // Cache the options object now so that subsequent
  // calls to lookupPath() dont throw an error
  internalState.options = options

  // Verify default template
  if (options.template) {
    options.template = lookupPath(options.template, options.directories.templates)
  }

  // Debug final options object
  debug('gatsby-plugin-advanced-pages')('Options', options)

  internalState.options = options

  return options
}

// Initializes reporter
// The function only runs when called with args to initialize and cache
// reporter object. Subsequent calls without args return the cached value
export const initializeReporter = (reporter?: Reporter) => {
  if (reporter === undefined) {
    if (!('reporter' in internalState)) {
      throw new Error('Cant fetch reporter because it is not initialized')
    }

    return internalState.reporter
  }

  if (reporter.setErrorMap) {
    reporter.setErrorMap({
      10000: {
        text: context => context.message,
        level: 'ERROR',
        type: 'PLUGIN'
      }
    })
  }

  internalState.reporter = reporter
  return reporter
}

// Gets the initialized reporter object
export const getReporter = () => {
  return initializeReporter()
}

// Prints an error message and terminates the build
export const reportError = (message: string, error?: Error): never => {
  const reporter = getReporter()
  const prefix = '"gatsby-plugin-advanced-pages" threw an error while running'

  if (!error) {
    return reporter.panic({
      id: '10000',
      context: {
        message: prefix
      },
      error: new Error(message)
    })
  }

  return reporter.panic({
    id: '10000',
    context: {
      message: `${prefix}:\n ${message}`
    },
    error
  })
}

// Prints a warning message
export const reportWarning = (message: string) => {
  const reporter = getReporter()
  const prefix = '"gatsby-plugin-advanced-pages" might not be working properly'
  reporter.warn(`${prefix}:\n ${message}`)
}

// Gets the initialized options object
export const getOptions = () => {
  return initializeOptions()
}

// Gets the value of a single option
export const getOption = <T extends keyof ResolvedPluginOptions>(optionName: T): ResolvedPluginOptions[T] => {
  return _.get(getOptions(), optionName)
}

// Checks if a location exists under parent
// if not checks if it exists under project root
// if not check if its an absolute path
// throws an error if cant find any
export const lookupPath = (location: string, parent?: string) => {
  if (!location || typeof location !== 'string') {
    reportError(
      `ensurePath() expected a non-empty string but got ${typeof location}("${location}")`
    )
    return null
  }

  const search = []
  if (parent && typeof parent === 'string') {
    const localPath = path.join(parent, location)
    search.push(localPath)
    if (fs.existsSync(localPath)) {
      return localPath
    }
  }

  const rootPath = path.join(getOption('_root'), location)
  search.push(rootPath)
  if (fs.existsSync(rootPath)) {
    return rootPath
  }

  if (path.isAbsolute(location)) {
    search.push(location)
    if (fs.existsSync(location)) {
      return location
    }
  }

  reportError(
    `A path with value "${location}" could not be found at ` +
    `any of the following locations:\n - "${search.join('\n - "')}"`
  )
  return null
}
