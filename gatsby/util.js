const path = require('path')
const _ = require("lodash")
const debug = require("debug")("gatsby-plugin-advanced-pages")

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
const initializeOptions = _.once(({ store, reporter, defaultOptions, userOptions }) => {
  const { program } = store.getState()
  const o = _.merge(defaultOptions, userOptions)

  // Ensure basePath is absolute
  o.basePath = path.join('/', o.basePath)

  // Ensure we have a valid engine
  // Replace the engine name with the engine object from ENGINES map
  o.engine = ENGINES[_.toLower(o.engine)]
  if(o.engine === undefined) {
    throw new TypeError(
      `Invalid engine option provided '${o.engine}' (available engines ` +
      `are '${Object.keys(ENGINES).join(`' or '`)}')`
    )
  }

  // Convert directory paths to absolute ones
  o.directories = _.mapValues(o.directories, dir => (
    path.join(program.directory, dir)
  ))

  // Ensure we have a valid positive number
  o.pagination.limit = parseInt(o.pagination.limit)
  if(o.pagination.limit <= 0 || isNaN(o.pagination.limit)){
    throw new TypeError(`Expected a positive number for 'pagination.limit' option`)
  }

  // Ensure type names are Capitalized
  o.typeNames = _.mapValues(o.typeNames, _.upperFirst)

  // Debug final options object
  debug("Options", o)

  return o
})

// Gets the initialized options object
function getOptions () {
  return initializeOptions()
}

// Gets the value of a single option
function getOption (optionName) {
  return _.get(getOptions(), optionName)
}

// Checks if a path is child of another one
function isPathChildof (child, parent) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

module.exports = {
  debug,
  initializeOptions,
  getOptions,
  getOption,
  isPathChildof
}
