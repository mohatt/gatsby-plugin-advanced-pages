const { getOption } = require('./util')

const getMdxResolver = fieldName => async (source, args, context, info) => {
  const type = info.schema.getType(`Mdx`)
  const mdxNode = context.nodeModel.getNodeById({ id: source.parent })
  const mdxResolver = type.getFields()[fieldName].resolve
  const result = await mdxResolver(mdxNode, args, context, { fieldName })
  return result
}

exports.sourceNodes = ({ actions, schema }) => {
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
            const mdxNode = context.nodeModel.getNodeById({
              id: source.parent,
              type: 'Mdx',
            })
            const fileNode = mdxNode && context.nodeModel.getNodeById({
              id: mdxNode.parent,
              type: 'File',
            })
            return fileNode && fileNode.absolutePath
          },
        },
        template: 'String',
        helper: 'String',
        data: 'JSON',
        body: {
          type: 'String',
          resolve: getMdxResolver('body'),
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
    }),
    schema.buildObjectType({
      name: types.mdxFrontmatter,
      fields: {
      	title: 'String',
      	routes: 'JSON',
      	template: 'String',
        helper: 'String',
        data: 'JSON',
      },
    }),
  ])
}

// Mdx doesn't allow extending his own type definitions
// so we have to to it this way
exports.setFieldsOnGraphQLNodeType = ({ type }) => {
  if (type.name === `Mdx`) {
    return {
      frontmatter: getOption('typeNames.mdxFrontmatter'),
    }
  }

  return {}
}
