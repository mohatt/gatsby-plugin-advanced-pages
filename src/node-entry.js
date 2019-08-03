module.exports = {
  onPreBootstrap: require('./gatsby/bootstrap'),
  sourceNodes: require('./gatsby/source-nodes'),
  setFieldsOnGraphQLNodeType: require('./gatsby/extend-nodes'),
  onCreateNode: require('./gatsby/on-create-node'),
  createPages: require('./gatsby/create-pages'),
  onPreExtractQueries: require('./gatsby/install-fragments')
}
