import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import debug from 'debug'

// Available transformer engines
const ENGINES = {
  mdx: {
    name: 'mdx',
    typeName: 'Mdx',
    bodyFieldName: 'body'
  },
  remark: {
    title: 'remark',
    typeName: 'MarkdownRemark',
    bodyFieldName: 'html'
  }
}

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

  const { program } = args.store.getState()
  const o = _.merge(args.defaultOptions, args.pluginOptions)

  // Ensure basePath is absolute
  o.basePath = path.join('/', o.basePath)

  // Ensure we have a valid engine
  // Replace the engine name with the engine object from ENGINES map
  o.engine = ENGINES[_.toLower(o.engine)]
  if (!o.engine) {
    throw new TypeError(
      `Invalid engine option provided '${args.pluginOptions.engine}' (available engines` +
      ` are '${Object.keys(ENGINES).join('\' or \'')}')`
    )
  }

  // Convert directory paths to absolute ones
  o.directories = _.mapValues(o.directories, dir => {
    const dirPath = path.join(program.directory, dir)
    if (!fs.existsSync(dirPath)) {
      mkdirp.sync(dirPath)
    }
    return dirPath
  })

  // Ensure we have a valid positive number
  o.pagination.limit = parseInt(o.pagination.limit)
  if (o.pagination.limit <= 0 || isNaN(o.pagination.limit)) {
    throw new TypeError('Expected a positive number for \'pagination.limit\' option')
  }

  // Ensure type names are Capitalized
  o.typeNames = _.mapValues(o.typeNames, _.upperFirst)

  // Debug final options object
  debug('gatsby-plugin-advanced-pages')('Options', o)

  return initializeOptions.options = o
}

// Gets the initialized options object
export function getOptions () {
  return initializeOptions()
}

// Gets the value of a single option
export function getOption (optionName) {
  return _.get(getOptions(), optionName)
}

// Checks if a path is a child of another one
export function isPathChildof (child, parent) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
