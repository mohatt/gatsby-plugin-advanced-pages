import type { GatsbyNode, PluginOptions as GatsbyPluginOptions } from 'gatsby'
import { getOptions, initializeOptions, initializeReporter } from './util'
import { optionsSchema } from './schema'
import type { PluginOptions } from './types'

// Validates user-defined options against schema
// runs before onPreBootstrap
export const pluginOptionsSchema: GatsbyNode['pluginOptionsSchema'] = ({ Joi }) => {
  return optionsSchema(Joi)
}

// Initializes plugin state
export const onPluginInit: GatsbyNode['onPluginInit'] = ({ store, reporter }, pluginOptions: GatsbyPluginOptions & PluginOptions) => {
  // Default values for options
  const defaultOptions: PluginOptions = {
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

// Creates a webpack alias for the plugin cache directory
// Usually located at <root>/.cache/caches/<plugin>
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig']  = ({ actions, cache }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        'gatsby-plugin-advanced-pages-cache': cache.directory
      }
    }
  })
}

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions, schema }) => {
  const { createTypes } = actions
  const options = getOptions()

  // @todo where are other page fields
  createTypes([
    schema.buildObjectType({
      name: options.typeNames.page,
      fields: {
        templateName: 'String',
        template: 'String',
        helper: 'String',
        data: 'JSON'
      },
      interfaces: ['Node']
    })
  ])
}

export { default as sourceNodes } from './source-nodes'
export { default as createPages } from './create-pages'
