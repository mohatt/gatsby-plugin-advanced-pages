const { getOptions, isPathChildof } = require('./util')

// Create Page and Route nodes
module.exports = ({ node, actions, getNode, createNodeId, createContentDigest }) => {
  const { createNode, createParentChildLink } = actions
  const options = getOptions()

  // Make sure it's an Engine node
  if (node.internal.type !== options.engine.typeName) {
    return
  }

  // Get parent file node
  const fileNode = getNode(node.parent)

  // Ignore files outside contentPath 
  const contentPath = options.directories.pages
  if (!fileNode.dir ||
    (contentPath !== fileNode.dir && !isPathChildof(fileNode.dir, contentPath))) {
    return
  }

  const page = {
    id: createNodeId(`${node.id} >>> Page`),
    title: node.frontmatter.title,
    template: node.frontmatter.template,
    helper: node.frontmatter.helper,
    data: node.frontmatter.data || {},
    parent: node.id,
    children: [],
    internal: {
      type: options.typeNames.page,
      description: `Advanced Pages (Page): ${node.frontmatter.title}`,
    },
  }

  if(!page.template){
    if(!options.template){
      throw new Error(
        `Missing 'template' metadata at '${fileNode.relativePath}'. No default ` +
        `template is set in plugin options either.`
      )
    }
    page.template = options.template
  }

  const routes = node.frontmatter.routes
  if(typeof routes !== 'object'){
    throw new Error(
      `Expected 'routes' metadata in ${fileNode.relativePath} to be an ` +
      `Object (got ${typeof routes})`
    )
  }

  for(const routeName of Object.keys(routes)) {
    const routePath = routes[routeName]
    if(typeof routePath !== 'string' || '/' !== routePath.charAt(0)){
      throw new Error(
        `Value assigned to 'routes[${routeName}]' in ${fileNode.relativePath} ` +
        `must be a string starting with '/'`
      )
    }

    const route = {
      id: createNodeId(routePath),
      name: routeName,
      path: routePath,
      parent: page.id,
      children: [],
      internal: {
        type: options.typeNames.route,
        description: `Advanced Pages (Route): ${routePath}`,
      },
    }

    route.internal.contentDigest = createContentDigest(route)
    createNode(route)

    page.children.push(route.id)
  }

  page.internal.contentDigest = createContentDigest(page)
  createNode(page)
  createParentChildLink({ parent: node, child: page })
}
