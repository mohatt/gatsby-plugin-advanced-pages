const path = require('path')
const { initializeOptions, getOptions } = require('./gatsby/util')
const { sourceNodes, setFieldsOnGraphQLNodeType } = require('./gatsby/source-nodes')

const onPreBootstrap = ({ store, reporter }, pluginOptions) => {
	// Default values for options
	const defaultOptions = {
		basePath: '/',
		template: null,
		typeNames: {
			page: 'Page',
			route: 'Route'
		},
		pagination: {
			limit: 10,
			suffix: '/page/:page'
		},
		directories: {
			pages: 'content/pages',
			templates: 'src/templates',
			helpers: 'gatsby/pages',
		},
	}

	// Initializes and validates options
	// Only runs once at bootstrap
	initializeOptions({
		store,
		reporter,
		defaultOptions,
		pluginOptions
	})
}

// Add local plugins to webapck modules path
const onCreateWebpackConfig = ({ store, actions }) => {
	const { program } = store.getState()
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(program.directory, 'plugins'), 'node_modules'],
    },
  })
}

module.exports = {
	onPreBootstrap,
	sourceNodes,
	setFieldsOnGraphQLNodeType,
	onCreateNode: require('./gatsby/on-create-node'),
	createPages: require('./gatsby/create-pages'),
	onCreateWebpackConfig,
}
