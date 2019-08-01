const path = require('path')
const _ = require("lodash")
const debug = require("debug")("gatsby-plugin-advanced-pages")

// Initializes options
const initializeOptions = _.once(({ store, reporter, defaultOptions, userOptions }) => {
  const { program } = store.getState()
  const o = _.merge(defaultOptions, userOptions)

  // Ensure basePath is absolute
  o.basePath = path.join('/', o.basePath)

  // Ensure type names are Capitalized
  o.typeNames = _.mapValues(o.typeNames, _.upperFirst)

  // Generate mdxFrontmatter type name based on page type
  o.typeNames.mdxFrontmatter = 'Mdx' + o.typeNames.page + 'Frontmatter'

  // Convert directory paths to absolute ones
  o.directories = _.mapValues(o.directories, dir => (
    path.join(program.directory, dir)
  ))

  // Make sure we have a valid positive number
  o.pagination.limit = parseInt(o.pagination.limit)
  if(o.pagination.limit <= 0 || isNaN(o.pagination.limit)){
    throw new TypeError(`Expected a positive number for 'pagination.limit' option`)
  }

  // Debug final options object
  debug("Options", o)

  return o
})

// Gets the initialized options object
const getOptions = () => {
  return initializeOptions()
}

// Gets the value of a single option
const getOption = (optionName) => {
  return _.get(getOptions(), optionName)
}

// Checks if a path is child of another one
const isPathChildof = (child, parent) => {
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
