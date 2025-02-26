import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import debug from 'debug'
import type { NodePluginArgs, Reporter } from 'gatsby'
import type { PluginOptions } from './types'

/**
 * Represents the resolved internal options for the plugin.
 * It includes additional properties required for internal processing.
 *
 * @internal
 */
export interface ResolvedPluginOptions extends PluginOptions {
  /**
   * Absolute path to the root of the Gatsby project.
   * Used to resolve relative paths for templates, directories, etc.
   */
  _root: string
}

/**
 * Provides functionality to initialize, merge, and retrieve plugin options.
 *
 * @internal
 */
export const options = (() => {
  let ref: ResolvedPluginOptions | undefined

  /**
   * Initializes and merges plugin options with defaults.
   */
  const initialize = (args: {
    store: NodePluginArgs['store']
    pluginOptions: Partial<PluginOptions>
    defaultOptions: PluginOptions
  }): ResolvedPluginOptions => {
    // Merge user-defined options with defaults
    const opts: ResolvedPluginOptions = _.merge(
      // set the root path of the project
      { _root: args.store.getState().program.directory },
      args.defaultOptions,
      args.pluginOptions,
    )
    // Normalize options
    Object.assign(opts, {
      // Ensure basePath is absolute
      basePath: path.join('/', opts.basePath),
      // Ensure type names are Title case
      typeNames: _.mapValues(opts.typeNames, _.upperFirst),
      // Convert directory paths to absolute ones
      directories: _.mapValues(opts.directories, (dir) => path.join(opts._root, dir)),
    })

    // Cache the options object now so that subsequent
    // calls to ensurePath() don't throw an error
    ref = opts

    // Verify default template exists
    if (opts.template) {
      opts.template = ensurePath(opts.template, opts.directories.templates)
    }

    // Debug final options object
    debug('gatsby-plugin-advanced-pages')('Options', opts)

    ref = opts

    return opts
  }

  /**
   * Retrieves a specific option value or the entire options object.
   *
   * - If called without arguments, returns the entire options object.
   * - If called with a key, retrieves the corresponding value.
   * - Throws an error if options are not initialized.
   *
   * @param optionName (Optional) The key of the option to retrieve.
   *
   * @returns The requested option value or the entire options object.
   *
   * @throws - Terminates execution if options are not initialized.
   */
  const get: {
    (): ResolvedPluginOptions
    <T extends keyof ResolvedPluginOptions>(optionName: T): ResolvedPluginOptions[T]
  } = (...args: [] | [string]) => {
    if (ref === undefined) {
      // throw new Error('Plugin options are not initialized.')
      return reporter.error('Cant fetch options because they are not initialized')
    }

    if (!args.length) {
      return ref
    }

    return _.get(ref, ...args)
  }

  return { initialize, get }
})()

/**
 * Manages Gatsby's reporter instance, providing functionalities for structured error logging,
 * warnings, and instance management.
 *
 * @internal
 */
export const reporter = (() => {
  let ref: Reporter | undefined

  // Initializes reporter
  /**
   * Initializes and caches the Gatsby reporter instance.
   *
   * If `setErrorMap` is available, it registers custom error messages
   * for better debugging in Gatsby's CLI.
   */
  const initialize = (instance: Reporter): Reporter => {
    if (instance.setErrorMap) {
      instance.setErrorMap({
        10000: {
          text: (context) => context.message,
          level: 'ERROR',
          type: 'PLUGIN',
        },
      })
    }

    ref = instance
    return instance
  }

  /**
   * Retrieves the cached reporter instance.

   * @throws Error if the reporter is accessed before being initialized.
   */
  const get = () => {
    if (ref === undefined) {
      throw new Error('Cant fetch reporter instance because it is not initialized')
    }

    return ref
  }

  /**
   * Logs an error and terminates the build process.
   *
   * - Uses Gatsby's `panic()` method to log structured errors.
   * - If an `Error` object is provided, includes it in the error report.
   * - Otherwise, creates a new error instance from the given message.
   *
   * @param message The error message to display.
   *
   * @param error (Optional) The original error instance.
   *
   * @throws - This function never returns; it always terminates execution.
   */
  const error = (message: string, error?: Error): never => {
    const instance = get()
    const prefix = '"gatsby-plugin-advanced-pages" threw an error while running'

    if (!error) {
      return instance.panic({
        id: '10000',
        context: {
          message: prefix,
        },
        error: new Error(message),
      })
    }

    return instance.panic({
      id: '10000',
      context: {
        message: `${prefix}:\n ${message}`,
      },
      error,
    })
  }

  /**
   * Logs a warning message in the Gatsby CLI.
   *
   * @param message The warning message to display.
   */
  const warning = (message: string) => {
    const instance = get()
    const prefix = '"gatsby-plugin-advanced-pages" might not be working properly'
    instance.warn(`${prefix}:\n ${message}`)
  }

  return { initialize, get, error, warning }
})()

/**
 * Resolves a file path based on different search locations:
 *
 * The function checks in the following order:
 * 1. If `location` exists under the given `parent` directory, return it.
 * 2. If not found, checks under the Gatsby project root (`_root`).
 * 3. If still not found and `location` is absolute, it verifies the path exists.
 * 4. If none of the above match, logs an error and terminates execution.
 *
 * @param location The relative or absolute file path to resolve.
 * @param parent (Optional) A parent directory to check first.
 *
 * @returns The absolute path if found; otherwise, throws an error.
 *
 * @throws - Terminates execution if the path is not found.
 *
 * @internal
 */
export const ensurePath = (location: string, parent?: string) => {
  const search = []
  if (parent && typeof parent === 'string') {
    const localPath = path.join(parent, location)
    search.push(localPath)
    if (fs.existsSync(localPath)) {
      return localPath
    }
  }

  const rootPath = path.join(options.get('_root'), location)
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

  return reporter.error(
    `A path with value "${location}" could not be found at ` +
      `any of the following locations:\n - "${search.join('\n - "')}"`,
  )
}
