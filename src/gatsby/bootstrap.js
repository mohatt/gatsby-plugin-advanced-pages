import { initializeOptions} from './util'
import { optionsSchema } from './schema'

// Validates user-defined options against schema
// runs before onPreBootstrap
export function pluginOptionsSchema ({ Joi }) {
  return optionsSchema(Joi)
}

// Initializes plugin options
export function onPreBootstrap ({ store, reporter }, pluginOptions) {
  // Default values for options
  const defaultOptions = {
    basePath: '/',
    template: null,
    directories: {
      pages: '.',
      templates: './src/templates',
      helpers: './gatsby/pages'
    },
    pagination: {
      limit: 10,
      suffix: '/page/:page'
    },
    typeNames: {
      page: 'Page',
    },
  }

  // Initializes and validates options
  // Only runs once at bootstrap
  initializeOptions({
    store,
    defaultOptions,
    pluginOptions
  })
}
