const { getOption } = require('../util/options')

module.exports = ({ actions, schema }) => {
  const { createTypes } = actions
  const types = getOption('typeNames')

  createTypes([
    schema.buildObjectType({
      name: types.page,
      fields: {
        title: 'String!',
        routes: {
          type: `[${types.route}]!`,
          resolve: (source, args, context, info) => {
            return context.nodeModel.getNodesByIds({
              ids: source.children,
              type: types.route,
            })
          },
        },
        path: {
          type: `String!`,
          resolve: (source, args, context, info) => {
            const fileNode = context.nodeModel.findRootNodeAncestor(source)
            return fileNode && fileNode.absolutePath
          },
        },
        template: 'String',
        helper: 'String',
        data: 'JSON',
        body: {
          type: 'String',
          resolve: async function (source, args, context, info) {
            const fieldName = getOption('engine.bodyFieldName')
            const type = info.schema.getType(getOption('engine.typeName'))
            const resolver = type.getFields()[fieldName].resolve
            const node = context.nodeModel.getNodeById({ id: source.parent })
            const result = await resolver(node, args, context, { fieldName })
            return result
          },
        },
      },
      extensions: {
        infer: false,
      },
      interfaces: [`Node`],
    }),
    schema.buildObjectType({
      name: types.route,
      fields: {
        name: 'String!',
        path: 'String!',
        page: {
          type: types.page,
          resolve: (source, args, context, info) => {
            return context.nodeModel.getNodeById({
              id: source.parent,
              type: types.page,
            })
          },
        },
      },
      extensions: {
        infer: false
      },
      interfaces: [`Node`],
    })
  ])
}
