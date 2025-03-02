import type { PluginOptionsSchemaJoi } from 'gatsby-plugin-utils'

/**
 * Defines the schema for page definitions.
 *
 * @internal
 */
export const getPagesSchema = (Joi: PluginOptionsSchemaJoi) => {
  return Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      template: Joi.string(),
      helper: Joi.string(),
      routes: Joi.object({})
        .required()
        .min(1)
        .unknown(true)
        .pattern(
          Joi.any(),
          Joi.string()
            .pattern(/^\//)
            .message("{{#label}}: Route paths must be strings that start with '/'"),
        ),
      data: Joi.object({}).default({}).unknown(true),
    }),
  )
}

/**
 * Defines the schema for plugin options.
 *
 * @internal
 */
export const getOptionsSchema = (Joi: PluginOptionsSchemaJoi) => {
  return Joi.object({
    basePath: Joi.string().description('Root URL for all pages created using this plugin.'),
    pages: getPagesSchema(Joi)
      .default([])
      .description('Inline pages configuration, used instead of a separate pages.config.* file.'),
    template: Joi.string().description(
      'Default template to be used when no "template" metadata is provided.',
    ),
    directories: Joi.object({
      templates: Joi.string().description('Path to template components used to render pages.'),
      helpers: Joi.string().description('Path to page helper functions.'),
    }),
    pagination: Joi.object({
      limit: Joi.number()
        .positive()
        .description(
          'Default number of items per page when "limit" is not explicitly provided in "createAdvancedPage()".',
        ),
      suffix: Joi.string()
        .pattern(/\/:page(\/|$)/)
        .description(
          'Suffix added to a route to generate paginated paths. Used only when no custom pagination route is provided in "createAdvancedPage()".',
        )
        .messages({
          'string.pattern.base':
            "{{#label}} with value \"{{#value}}\" must contain ':page' (e.g., '/pages/:page') to support pagination.",
        }),
    }),
    typeNames: Joi.object({
      page: Joi.string().description('GraphQL type name for pages.'),
      pageRoute: Joi.string().description('GraphQL type name for page routes.'),
    }),
  })
}
