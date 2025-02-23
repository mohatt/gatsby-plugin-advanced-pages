import { initializeOptions, initializeReporter } from './util'
import { optionsSchema } from './schema'

// Validates user-defined options against schema
// runs before onPreBootstrap
export function pluginOptionsSchema ({ Joi }) {
  return optionsSchema(Joi)
}

// Initializes plugin state
export function onPluginInit ({ store, reporter }, pluginOptions) {
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

  // Initializes plugin reporter
  initializeReporter(reporter)
}

// Creatas a webpack alias for the plugin cache directory
// Usually located at <root>/.cache/caches/<plugin>
export function onCreateWebpackConfig ({ actions, cache }) {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        'gatsby-plugin-advanced-pages-cache': cache.directory
      }
    }
  })
}

export { default as createSchemaCustomization } from './schema-customization'
export { default as sourceNodes } from './source-nodes'
export { default as createPages } from './create-pages'
