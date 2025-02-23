import { getOptions } from './util'

export default ({ actions, schema }) => {
  const { createTypes } = actions
  const options = getOptions()

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
