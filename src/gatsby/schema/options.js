export default function (Joi) {
  return Joi.object({
    basePath: Joi.string()
      .default('/')
      .description(`Root url for all pages created through the plugin.`),
    template: Joi.string()
      .default(null)
      .description(`Default template to be used for pages with no "template" metadata defined.`),
    directories: Joi.object({
      pages: Joi.string()
        .default('.')
        .description(`Location to look for the pages config file.`),
      templates: Joi.string()
        .default('./src/templates')
        .description(`Location of template components used to render pages.`),
      helpers: Joi.string()
        .default('./gatsby/pages')
        .description(`Location of page helpers.`),
    }).default(),
    pagination: Joi.object({
      limit: Joi.number()
        .positive()
        .default(10)
        .description(`Default page size to be used when no "limit" parameter is passed to "createAdvancedPage()".`),
      suffix: Joi.string()
        .pattern(/\/\:page(\/|$)/)
        .default('/page/:page')
        .description(`Suffix to be added to the original route to generate a paginated route. This is only used when no paginated route is passed to "createAdvancedPage()".`)
        .messages({
          'string.pattern.base': `{{#label}} with value "{{#value}}": Route suffix must contain the ':page' paramater (e.g '/pages/:page')`
        }),
    }).default(),
    typeNames: Joi.object({
      page: Joi.string()
        .pattern(/^[A-Z]\w+$/)
        .default('Page')
        .description(`Name of the Page object type.`)
        .messages({
          'string.pattern.base': '{{#label}} with value "{{#value}}": Object type must be Title-cased'
        }),
    }).default(),
  })
}
