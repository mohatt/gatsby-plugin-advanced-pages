import pagesSchema from './pages'

export default function (Joi) {
  return Joi.object({
    basePath: Joi.string()
      .description('Root url for all pages created through the plugin.'),
    pages: pagesSchema(Joi)
      .description('Inline pages configuration to use instead of pages.config.js.'),
    template: Joi.string()
      .description('Default template to be used for pages with no "template" metadata defined.'),
    directories: Joi.object({
      templates: Joi.string()
        .description('Location of template components used to render pages.'),
      helpers: Joi.string()
        .description('Location of page helpers.')
    }),
    pagination: Joi.object({
      limit: Joi.number()
        .positive()
        .description('Default page size to be used when no "limit" parameter is passed to "createAdvancedPage()".'),
      suffix: Joi.string()
        .pattern(/\/:page(\/|$)/)
        .description('Suffix to be added to the original route to generate a paginated route. This is only used when no paginated route is passed to "createAdvancedPage()".')
        .messages({
          'string.pattern.base': '{{#label}} with value "{{#value}}": Route suffix must contain the \':page\' paramater (e.g \'/pages/:page\')'
        })
    }),
    typeNames: Joi.object({
      page: Joi.string()
        .description('Name of the Page object type.')
    })
  })
}
