const fs = require(`fs`)
const SystemPath = require('path')
const _ = require("lodash")
const existsSync = require(`fs-exists-cached`).sync
const pathToRegexp = require('path-to-regexp')
const { getOptions } = require('./util')

module.exports = async function ({ graphql, actions }) {
  const options = getOptions()
  const result = await graphql(`
    {
      all${options.typeNames.page} {
        nodes {
          id
          routes {
            name
            path
          }
          path
          template
          helper
        }
      }
      all${options.typeNames.route} {
        nodes {
          name
          path
          page {
            path
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const routeMap = {}
  const generatedRouteMap = {}

  // Add basePath prefix to all route paths
  // Detect any duplicates
  // Update route map
  for (const route of result.data[`all${options.typeNames.route}`].nodes) {
    const { name } = route
    const exists = routeMap[name]
    if(exists) {
      throw new Error(
        `Page '${route.page.path}' is trying to define a route named '${name}' ` +
        `which is already defined in '${exists.page.path}'`
      )      
    }
    route.path = SystemPath.join(options.basePath, route.path)
    route.pathGenerator = getPathGenerator(route)
    routeMap[name] = route
  }

  // Use let to allow inner functions to access page object
  let page
  for (page of result.data[`all${options.typeNames.page}`].nodes) {
    // Set file paths
    page.templatePath = SystemPath.join(
      options.directories.templates,
      `${page.template}.js`
    )
    page.helperPath = page.helper && SystemPath.join(
      options.directories.helpers,
      `${page.helper}.js`
    )

    // Run page helper if defined
    if(page.helper){
      await runPageHelper()
      continue
    }

    // No page helper; Add static pages for all defined routes
    page.routes.map(route => createAdvancedPage({ route: route.name }))
  }

  // Write the final route map export file
  writeRouteMap().catch(err => {
    throw new Error(`Error writing route map export file:\n${err}`)
  })

  // Wraps pathToRegexp to handle errors thrown
  function getPathGenerator(route) {
    const pathGenerator = pathToRegexp.compile(route.path)
    return function (data, options) {
      try {
        return pathGenerator(data, options)
      } catch(e) {
        throw new TypeError(
          `Error generating a path for route '${route.name}' ` +
          `with params '${JSON.stringify(data)}':\n${e.message}`
        )
      }
    }
  }

  // Auto generates a new route based scope and parent route
  function generateRoute(parent, scope) {
    const name = parent + '.' + scope
    if(!generatedRouteMap[name]) {
      let path
      switch(scope) {
        case 'paginated':
          path = SystemPath.join(routeMap[parent].path, options.pagination.suffix)
          break
        default:
            throw new TypeError(
              `Unrecognized route scope '${scope}' passed to generateRoute()`
            )
      }
      const route = {
        name,
        path,
        page: {
          path: page.path
        }
      }
      route.pathGenerator = getPathGenerator(route)
      generatedRouteMap[name] = route
    }

    return generatedRouteMap[name]
  }

  async function runPageHelper() {
    if (!existsSync(page.helperPath)) {
      throw new Error(`Page helper file does not exist at '${page.helperPath}'`)
    }

    const helperFunction = require(page.helperPath)
    try {
      // Prevent page helpers from mutating page object
      Object.freeze(page)
      await helperFunction({ graphql, page, createAdvancedPage })
    } catch(e) {
      const error = new Error(
        `Error occured while running page helper function at '${page.helperPath}':\n` +
        `${e.message}`
      )
      error.stack = e.stack
      throw error
    }
  }

  function createAdvancedPage({ route, params = {}, pagination }) {
    if(typeof route !== 'string' || !route) {
      throw new TypeError(
        `Route name passed to createAdvancedPage() at '${page.helperPath}' ` +
        `must be a non-empty string`
      )
    }

    const routeNode = routeMap[route]
    if(!routeNode) {
      throw new TypeError(
        `Unrecognized route '${route}' passed to createAdvancedPage() at '${page.helperPath}'`
      )
    }
    
    const gatsbyPage = {
      path: routeNode.pathGenerator(params),
      component: page.templatePath,
      context: {
        id: page.id,
        ...params,
      }
    }

    if(pagination){
      if(typeof pagination.count === 'undefined'){
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
          `'count' paramater is missing`
        )
      }
      pagination.count = parseInt(pagination.count)
      if (isNaN(pagination.count) || pagination.count < 0){
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
          `'count' paramater must be a valid number with a zero or more value`
        )
      }

      pagination.limit = typeof pagination.limit !== 'undefined' && parseInt(pagination.limit)
      if(pagination.limit === false){
        pagination.limit = options.pagination.limit
      }
      else if (isNaN(pagination.limit) || pagination.limit <= 0){
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
          `'limit' paramater must be a positive number`
        )
      }
      
      // Auto generate a paginated route for main route
      if(typeof pagination.route === 'undefined') {
        const getPaginatedPath = generateRoute(route, 'paginated').pathGenerator
      } else {
        if(!routeMap[pagination.route]) {
          throw new TypeError(
            `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
            `Unrecognized route '${pagination.route}' provided`
          )
        }
        const getPaginatedPath = routeMap[pagination.route].pathGenerator
      }

      const generatePagePath = n => getPaginatedPath({ page: n, ...params })
      const pagesCount = Math.ceil(pagination.count / pagination.limit)
      for (let i = 1; i <= pagesCount; i++) {
        const gatsbyPaginatedPage = {
          path: i === 1 ? gatsbyPage.path : generatePagePath(i),
          component: gatsbyPage.component,
          context: {
            ...gatsbyPage.context,
            limit: pagination.limit,
            offset: (i-1) * pagination.limit,
            filter: pagination.filter,
            pagination: {
              page: i,
              prevPath: i === 1 ? null : generatePagePath(i-1),
              nextPath: i === pagesCount ? null : generatePagePath(i+1),
              hasPrev: i !== 1,
              hasNext: i < pagesCount,
            }
          }
        }

        actions.createPage(gatsbyPaginatedPage)
      }

      return
    }

    actions.createPage(gatsbyPage)
  }

  function writeRouteMap() {
    return new Promise((resolve, reject) => {
      const map = _.mapValues(routeMap, 'path')
      const content = `module.exports = ${JSON.stringify(map, null, 2)}\n`
      fs.writeFile(SystemPath.resolve(__dirname, '../routes.js'), content, err => {
         if (err) reject(err)
         else resolve(content)
      })
    })
  }
}
