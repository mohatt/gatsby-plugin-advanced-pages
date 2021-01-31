import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { compile as compileRoute } from '../../lib/route-compiler'
import { getOption } from '../util'

export default class PagesCreator {
  constructor (pages) {
    this.routeMap = {}
    this.pages = pages.map(page => {
      this.createRoutes(page.routes)
      // Prevent page helpers from mutating page object
      return Object.freeze(page)
    })
  }

  // Processes route objects and adds them to the route map
  // Adds basePath prefix to all route paths
  // Detects any duplicates
  createRoutes (routes) {
    for (const route of routes) {
      const { name } = route
      const exists = this.routeMap[name]
      if (exists) {
        throw new Error(
          `Unable to create a route with name "${name}". ` +
          `Another route with the same name already exists`
        )
      }
      route.path = path.join(getOption('basePath'), route.path)
      route.scopes = {}
      route.pathGenerator = compileRoute(route.path)
      this.routeMap[name] = route
    }
  }

  // Auto generates a new route based scope and parent route
  generateRoute (parent, scope) {
    let scopedPath
    switch (scope) {
      case 'pagination':
        scopedPath = path.join(
          this.routeMap[parent].path,
          getOption('pagination.suffix')
        )
        break
      default:
        throw new TypeError(
          `Unrecognized route scope "${scope}" passed to generateRoute()`
        )
    }
    return {
      name: parent + '.' + scope,
      path: scopedPath,
      pathGenerator: compileRoute(scopedPath)
    }
  }

  async createPages ({ graphql, createPage }) {
    this.createPageAction = createPage
    for (const page of this.pages) {
      this.page = page
      // No page helper? Add static pages for all defined routes
      if (!page.helper) {
        page.routes.map(route => this.createPage({ route: route.name }))
        continue
      }
      // Run the page helper
      try {
        let helperFunction = require(page.helper)
        if (typeof helperFunction.default === 'function') {
          helperFunction = helperFunction.default
        }

        await helperFunction({
          graphql,
          page,
          createAdvancedPage: args => this.createPage(args)
        })
      } catch (e) {
        if (typeof e[0] !== 'undefined') {
          e = e[0]
        }

        const error = new Error(
          `Error occured while running page helper function at "${page.helper}":` +
          `\n${e.message}`
        )
        error.stack = e.stack
        throw error
      }
    }
  }

  createPage ({ route, params = {}, pagination, ...context }) {
    const { page } = this
    if (typeof route !== 'string' || !route) {
      throw new TypeError(
        `Route name passed to createAdvancedPage() at "${page.helper}"` +
        ' must be a non-empty string'
      )
    }

    const routeNode = this.routeMap[route]
    if (!routeNode) {
      throw new TypeError(
        `Unrecognized route "${route}" passed to createAdvancedPage() at "${page.helper}"`
      )
    }

    const gatsbyPage = {
      path: routeNode.pathGenerator(params),
      component: page.template,
      context: {
        id: page.id,
        ...params,
        ...context
      }
    }

    if (pagination) {
      if (typeof pagination.count === 'undefined') {
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at "${page.helper}": ` +
          '"count" paramater is missing'
        )
      }
      pagination.count = parseInt(pagination.count)
      if (!Number.isInteger(pagination.count)) {
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at "${page.helper}": ` +
          `'count' paramater must be a valid number (got "${pagination.count}")`
        )
      }

      pagination.limit = typeof pagination.limit !== 'undefined' && parseInt(pagination.limit)
      if (pagination.limit === false) {
        pagination.limit = getOption('pagination.limit')
      } else if (pagination.limit <= 0 || !Number.isInteger(pagination.limit)) {
        throw new TypeError(
          `Invalid pagination object passed to createAdvancedPage() at "${page.helper}": ` +
          `"limit" paramater must be a valid number (got "${pagination.limit}")`
        )
      }

      if (!routeNode.scopes.pagination) {
        if (typeof pagination.route === 'undefined') {
          // Auto generate a paginated route for main route
          routeNode.scopes.pagination = this.generateRoute(route, 'pagination')
        } else {
          if (!this.routeMap[pagination.route]) {
            throw new TypeError(
              `Invalid pagination object passed to createAdvancedPage() at "${page.helper}": ` +
              `Unrecognized route "${pagination.route}"`
            )
          }
          routeNode.scopes.pagination = this.routeMap[pagination.route]
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
            offset: (i - 1) * pagination.limit
          }
        }

        this.createPageAction(gatsbyPaginatedPage)
      }

      return
    }

    this.createPageAction(gatsbyPage)
  }

  writeRoutesExport (filename) {
    const routes = _.map(this.routeMap, route => {
      route = _.pick(route, ['name', 'path', 'scopes'])
      route.scopes = _.mapValues(route.scopes, 'path')
      return route
    })

    try {
      fs.writeFileSync(
        filename,
        `"use strict";\n\nmodule.exports = ${JSON.stringify(routes, null, 2)};`
      )
      return true
    } catch (e) {
      throw new Error(`Error writing route map export file:\n${e.message}`)
    }
  }
}
