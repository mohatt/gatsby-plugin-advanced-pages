const fs = require(`fs`)
const systemPath = require('path')
const _ = require("lodash")
const existsSync = require(`fs-exists-cached`).sync
const compileRoute = require('../lib/route-compiler')
const { getOptions } = require('../util/options')

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

  // Add basePath prefix to all route paths
  // Detect any duplicates
  // Update route map
  const routeMap = {}
  for (const route of result.data[`all${options.typeNames.route}`].nodes) {
    const { name } = route
    const exists = routeMap[name]
    if(exists) {
      throw new Error(
        `'${route.page.path}' is trying to define a route named '${name}' ` +
        `which is already defined in '${exists.page.path}'`
      )
    }
    route.path = systemPath.join(options.basePath, route.path)
    route.scopes = {}
    route.pathGenerator = compileRoute(route.path)
    routeMap[name] = route
  }

  // Use let to allow inner functions to access page object
  let page
  for (page of result.data[`all${options.typeNames.page}`].nodes) {
    // Set file paths
    page.templatePath = systemPath.join(
      options.directories.templates,
      `${page.template}.js`
    )
    page.helperPath = page.helper && systemPath.join(
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

  // Auto generates a new route based scope and parent route
  function generateRoute(parent, scope) {
    let path
    switch(scope) {
      case 'pagination':
        path = systemPath.join(routeMap[parent].path, options.pagination.suffix)
        break
      default:
          throw new TypeError(
            `Unrecognized route scope '${scope}' passed to generateRoute()`
          )
    }
    return {
      name: parent + '.' + scope,
      path,
      page: {
        path: page.path
      },
      pathGenerator: compileRoute(path)
    }
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
        ...params
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

      if(!routeNode.scopes.pagination) {
        if(typeof pagination.route === 'undefined') {
          // Auto generate a paginated route for main route
          routeNode.scopes.pagination = generateRoute(route, 'pagination')
        } else {
          if(!routeMap[pagination.route]) {
            throw new TypeError(
              `Invalid pagination object passed to createAdvancedPage() at '${page.helperPath}': ` +
              `Unrecognized route '${pagination.route}'`
            )
          }
          routeNode.scopes.pagination = routeMap[pagination.route]
        }
      }

      const generatePagePath = n => routeNode.scopes.pagination.pathGenerator(
        { page: n, ...params }
      )
      const pagesCount = Math.ceil(pagination.count / pagination.limit)
      for (let i = 1; i <= pagesCount; i++) {
        const gatsbyPaginatedPage = {
          path: i === 1 ? gatsbyPage.path : generatePagePath(i),
          component: gatsbyPage.component,
          context: {
            ...gatsbyPage.context,
            limit: pagination.limit,
            offset: (i-1) * pagination.limit,
            filter: pagination.filter
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
      const map = _.mapValues(routeMap, route => ({
        path: route.path,
        scopes: _.mapValues(route.scopes, 'path') 
      }))
      const content = `module.exports = ${JSON.stringify(map, null, 2)}\n`
      fs.writeFile(systemPath.resolve(__dirname, '../routes.js'), content, err => {
         if (err) reject(err)
         else resolve(content)
      })
    })
  }
}
