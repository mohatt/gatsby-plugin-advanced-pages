import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import Yaml from 'js-yaml'
import { validateOptionsSchema, Joi, PluginOptionsSchemaJoi, Schema } from 'gatsby-plugin-utils'
import _ from 'lodash'
import debug from 'debug'
import type { GatsbyNode, NodePluginArgs, Reporter } from 'gatsby'
import type { DefaultPluginOptions, PluginOptions } from './api'

/**
 * Represents the resolved internal options for the plugin.
 * It includes additional properties required for internal processing.
 */
interface ResolvedPluginOptions extends DefaultPluginOptions {
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
    pluginOptions: PluginOptions
    defaultOptions: DefaultPluginOptions
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
    if (opts.template != null) {
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
      throw new PluginError('Cant fetch options because they are not initialized')
    }

    if (args.length === 0) {
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
    if (instance.setErrorMap != null) {
      instance.setErrorMap({
        10000: {
          text: (context) => context.message,
          category: 'USER',
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
  const get = (): Reporter => {
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
   * @param api The Gatsby Node API that caused the error.
   *
   * @param titleOrError The error message or PluginError object to display.
   *
   * @param error (Optional) The original error instance.
   *
   * @throws - This function never returns; it always terminates execution.
   */
  const error = (
    api: keyof GatsbyNode,
    titleOrError: string | PluginError | Error,
    error?: Error,
  ): never => {
    const instance = get()
    const prefix = `"gatsby-plugin-advanced-pages" threw an error during "${api}" hook`

    let title: string | undefined
    let mainError: Error | undefined

    if (titleOrError instanceof PluginError) {
      title = titleOrError.message
      mainError = titleOrError.originalError
    } else if (titleOrError instanceof Error) {
      mainError = titleOrError
    } else {
      title = titleOrError
    }

    if (error) {
      mainError = error
    }

    return instance.panic({
      id: '10000',
      context: {
        message: mainError && title ? `${prefix}:\n ${title}` : prefix,
      },
      error: mainError ?? (title ? new Error(title) : undefined),
    })
  }

  /**
   * Logs a warning message in the Gatsby CLI.
   *
   * @param message The warning message to display.
   */
  const warning = (message: string): void => {
    const instance = get()
    const prefix = '"gatsby-plugin-advanced-pages" might not be working properly'
    instance.warn(`${prefix}:\n ${message}`)
  }

  return { initialize, get, error, warning }
})()

/**
 * Validates the input data using Joi schema validation.
 *
 * @param schema The Joi schema (or schema factory) to validate against.
 * @param data The input data to validate.
 * @param [name] (Optional) The prop name of the data being validated. Default is `data`.
 *
 * @returns A promise that resolves to the validated and typed data.
 *
 * @throws {ValidationError} Throws an error if the input does not meet the schema requirements.
 */
export const validateSchema = async <E>(
  schema: Schema | ((Joi: PluginOptionsSchemaJoi) => Schema),
  data: unknown,
  name = 'data',
): Promise<E> => {
  const objSchema = Joi.object({ [name]: schema instanceof Function ? schema(Joi) : schema })
  const { value } = await validateOptionsSchema(objSchema, { [name]: data })
  return value[name] as E
}

/**
 * Ensures a path exists based on different search locations:
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
 * @throws PluginError if the path is not found.
 */
export const ensurePath = (location: string, parent?: string): string => {
  const search = []
  if (parent != null) {
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

  throw new PluginError(
    `A path with value "${location}" could not be found at ` +
      `any of the following locations:\n - "${search.join('\n - "')}"`,
  )
}

/**
 * Retrieves the default export of a module.
 */
export const getDefaultExport = async <T = unknown>(modulePath: string): Promise<T> => {
  const noop = {}
  let defaultExport: any = noop

  // Avoid require in tests since Vitest doesn't support mocking require calls
  if (process.env.VITEST !== 'true') {
    const nodeRequire = require ?? createRequire(import.meta.url)
    try {
      defaultExport = nodeRequire(modulePath)
      if (defaultExport?.__esModule === true && 'default' in defaultExport) {
        defaultExport = defaultExport.default
      }
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM') {
        throw new PluginError(`Unable to import module "${modulePath}"`, error)
      }
    }
  }

  if (defaultExport === noop) {
    try {
      const esmExports = await import(modulePath)
      defaultExport = esmExports.default
    } catch (error) {
      throw new PluginError(`Unable to import ESM module "${modulePath}"`, error)
    }
  }

  if (defaultExport == null) {
    throw new PluginError(
      `Unable to import module "${modulePath}"`,
      new Error(`Couldn't find valid default export`),
    )
  }

  return defaultExport as T
}

/**
 * Searches for a configuration file under the given root directory and loads its content.
 *
 * @param root The root directory to search in.
 * @param baseName The base name of the config file (e.g., `"pages.config"`).
 *
 * @returns An object containing the file path and its parsed data, or `null` if not found.
 */
export const findConfigFile = async (
  root: string,
  baseName: string,
): Promise<{ path: string; data: unknown } | null> => {
  const extensions = ['yaml', 'yml', 'json', 'js', 'cjs', 'mjs']

  for (const ext of extensions) {
    const filePath = path.join(root, `${baseName}.${ext}`)
    if (!fs.existsSync(filePath)) {
      continue
    }

    try {
      switch (ext) {
        case 'yaml':
        case 'yml':
          return {
            path: filePath,
            data: Yaml.load(fs.readFileSync(filePath, 'utf8'), {
              filename: filePath,
              schema: Yaml.FAILSAFE_SCHEMA,
            }),
          }

        case 'json':
          return {
            path: filePath,
            data: JSON.parse(fs.readFileSync(filePath, 'utf8')),
          }

        default:
          return { path: filePath, data: await getDefaultExport(filePath) }
      }
    } catch (error) {
      throw new PluginError(`Failed to load config file "${filePath}"`, error)
    }
  }

  return null
}

/**
 * Wraps a Gatsby API function with error handling.
 *
 * @param api - The name of the Gatsby API being wrapped (e.g., `"onCreatePage"`).
 * @param fn - The original Gatsby API function to be wrapped.
 *
 * @returns The wrapped function with error handling.
 */
export const createPluginExport = <T extends keyof GatsbyNode, F extends GatsbyNode[T]>(
  api: T,
  fn: F,
): F => {
  return ((...args: any[]) => {
    try {
      // Call the original function with provided arguments
      const result = (fn as any)(...args)

      // If the function returns a Promise, attach error handling
      if (result instanceof Promise) {
        return result.catch((error) => reporter.error(api, error))
      }

      // Return the result (for synchronous functions)
      return result
    } catch (error) {
      // Catch synchronous errors and report them
      reporter.error(api, error)
    }
  }) as F
}

/**
 * Custom error class for plugin-related errors.
 */
export class PluginError extends Error {
  /**
   * @param message - A description of the error.
   * @param originalError - The original error that caused this issue (optional).
   */
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message)
  }
}
