import type { GatsbyNode, PluginOptions as GatsbyPluginOptions } from 'gatsby'
import { options, reporter } from './util'
import { getOptionsSchema } from './schema'
import type { PluginOptions } from './index'

// Validates user-defined options against schema
// runs before onPreBootstrap
export const pluginOptionsSchema: GatsbyNode['pluginOptionsSchema'] = ({ Joi }) => {
  return getOptionsSchema(Joi)
}

// Initializes plugin state
export const onPluginInit: GatsbyNode['onPluginInit'] = (
  args,
  pluginOptions: GatsbyPluginOptions & PluginOptions,
) => {
  // Default values for options
  const defaultOptions: PluginOptions = {
    basePath: '/',
    pages: [],
    template: null,
    directories: {
      templates: './src/templates',
      helpers: './gatsby/pages',
    },
    pagination: {
      limit: 10,
      suffix: '/page/:page',
    },
    typeNames: {
      page: 'Page',
      pageRoute: 'PageRoute',
    },
  }

  // Initializes and validates options
  // Only runs once at bootstrap
  options.initialize({
    store: args.store,
    defaultOptions,
    pluginOptions,
  })

  // Initializes plugin reporter
  reporter.initialize(args.reporter)
}

// Creates a webpack alias for the plugin cache directory
// Usually located at <root>/.cache/caches/<plugin>
export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ actions, cache }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        'gatsby-plugin-advanced-pages-cache': cache.directory,
      },
    },
  })
}

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({
  actions,
  schema,
}) => {
  const { createTypes } = actions
  const { page, pageRoute } = options.get('typeNames')

  createTypes([
    schema.buildObjectType({
      name: pageRoute,
      fields: {
        name: 'String!',
        path: 'String!',
      },
    }),
    schema.buildObjectType({
      name: page,
      fields: {
        title: 'String!',
        templateName: 'String',
        template: 'String',
        helper: 'String',
        data: 'JSON',
        routes: `[${pageRoute}!]!`,
      },
      interfaces: ['Node'],
    }),
  ])
}

export { default as sourceNodes } from './source-nodes'
export { default as createPages } from './create-pages'
