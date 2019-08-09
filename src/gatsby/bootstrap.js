import { initializeOptions } from './util'

export default function ({ store }, pluginOptions) {
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
    defaultOptions,
    pluginOptions
  })
}
