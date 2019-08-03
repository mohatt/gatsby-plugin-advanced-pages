const fs = require('fs')
const path = require('path')
const { initializeOptions } = require('../util/options')

const onPreBootstrap = ({ store, reporter }, pluginOptions) => {
  // Default values for options
  const defaultOptions = {
    basePath: '/',
    engine: 'remark',
    template: null,
    directories: {
      pages: 'content/pages',
      templates: 'src/templates',
      helpers: 'gatsby/pages'
    },
    pagination: {
      limit: 10,
      suffix: '/page/:page'
    },
    typeNames: {
      page: 'Page',
      route: 'Route'
    }
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

const onPreExtractQueries = async ({ store, getNodesByType }) => {
  const { program } = store.getState()
  // Add pagination fragment to .cache/fragments.
  await fs.copyFile(
    path.resolve(__dirname, '../components/Pagination/Pagination.fragment.js'),
    path.resolve(program.directory, '.cache/fragments/pagination-fragment.js'),
    err => {
      if (err) throw err;
    }
  )
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
  onPreExtractQueries,
  onCreateWebpackConfig
}
