import type { PluginOptionsSchemaJoi } from 'gatsby-plugin-utils'

const getPagesSchema = (Joi: PluginOptionsSchemaJoi) => {
  return Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      template: Joi.string(),
      helper: Joi.string(),
      routes: Joi.object({})
        .required()
        .min(1)
        .unknown(true)
        .pattern(Joi.any(), Joi.string()
          .pattern(/^\//)
          .message('{{#label}}: Route path must be a string starting with \'/\'')
        ),
      data: Joi.object({})
        .default({})
        .unknown(true)
    })
  ).label('root').default([])
}

export default getPagesSchema
