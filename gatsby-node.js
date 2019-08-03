const {
  onPreBootstrap,
  onPreExtractQueries
} = require('./gatsby/util')

module.exports = {
  onPreBootstrap,
  sourceNodes: require('./gatsby/source-nodes'),
  setFieldsOnGraphQLNodeType: require('./gatsby/extend-nodes'),
  onCreateNode: require('./gatsby/on-create-node'),
  createPages: require('./gatsby/create-pages'),
  onPreExtractQueries
}
