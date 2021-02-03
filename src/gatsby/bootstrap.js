import { initializeOptions, initializeReporter } from './util'
import { optionsSchema } from './schema'

// Validates user-defined options against schema
// runs before onPreBootstrap
export function pluginOptionsSchema ({ Joi }) {
  return optionsSchema(Joi)
}

// Initializes plugin reporter
export function onPreInit ({ reporter }) {
  initializeReporter(reporter)
}

// Initializes plugin options
export function onPreBootstrap ({ store, reporter }, pluginOptions) {
  // Default values for options
  const defaultOptions = {
    basePath: '/',
    pages: [],
    template: null,
    directories: {
      templates: './src/templates',
      helpers: './gatsby/pages'
    },
    pagination: {
      limit: 10,
      suffix: '/page/:page'
    },
    typeNames: {
      page: 'Page'
    }
  }

  // Initializes and validates options
  // Only runs once at bootstrap
  initializeOptions({
    store,
    defaultOptions,
    pluginOptions
  })
}
