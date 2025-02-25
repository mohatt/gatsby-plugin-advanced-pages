import path from 'path'
import _ from 'lodash'
import type { CreatePagesArgs, Page } from 'gatsby'
import { compile as compileRoute, RouteParams, PathGenerator } from '../../lib/route-compiler'
import { getOption, reportError } from '../util'
import { PageNode, SerializedRoute, RouteScope } from '../types'

interface RouteNode {
  name: string
  path: string
  pathGenerator: PathGenerator
  scopes: {
    [key in RouteScope]?: ChildRouteNode
  }
}

type ChildRouteNode = Omit<RouteNode, 'scopes'>

interface CreatePagesProps {
  graphql: CreatePagesArgs['graphql']
  createPage: CreatePagesArgs['actions']['createPage']
}

export interface CreateAdvancedPageProps {
  route: string
  params?: RouteParams
  pagination?: {
    count: number
    limit?: number
    route?: string
  }
}

export interface HelperFunction {
  (props: {
    graphql: CreatePagesProps['graphql']
    page: PageNode
    createAdvancedPage: (props: CreateAdvancedPageProps) => void
  }): void | Promise<void>
}

export default class PagesCreator {
  private readonly routeMap: Record<string, RouteNode>
  private readonly pages: PageNode[]
  private currentPage?: PageNode
  private createPageAction?: CreatePagesProps['createPage']

  constructor (pages: PageNode[]) {
    this.routeMap = {}
    this.pages = pages.map(page => {
      this.createRoutes(page)
      // Prevent page helpers from mutating page object
      return Object.freeze(page)
    })
  }

  // Processes route objects and adds them to the route map
  // Adds basePath prefix to all route paths
  // Detects any duplicates
  createRoutes (page: PageNode) {
    for (const route of page.routes) {
      const { name } = route
      if (this.routeMap[name]) {
        reportError(
          `Unable to create a route with name "${name}". ` +
          'Another route with the same name already exists'
        )
        continue
      }
      this.routeMap[name] = {
        name,
        path: path.join(getOption('basePath'), route.path),
        scopes: {},
        pathGenerator: compileRoute(route.path, false),
      }
    }
  }

  // Auto generates a new route based scope and parent route
  private generateRoute (parent: string, scope: RouteScope): ChildRouteNode {
    let scopedPath: string
    switch (scope) {
      case 'pagination':
        scopedPath = path.join(
          this.routeMap[parent].path,
          getOption('pagination').suffix
        )
        break
      default:
        return null
    }

    return {
      name: parent + '.' + scope,
      path: scopedPath,
      pathGenerator: compileRoute(scopedPath)
    }
  }

  async createPages ({ graphql, createPage }: CreatePagesProps) {
    this.createPageAction = createPage
    for (const page of this.pages) {
      this.currentPage = page
      // No page helper? Add static pages for all defined routes
      if (!page.helper) {
        page.routes.map(route => this.createPage({ route: route.name }))
        continue
      }
      // Run the page helper
      try {
        let helperExport = require(page.helper)
        if (typeof helperExport.default === 'function') {
          helperExport = helperExport.default
        }

        const helperFn: HelperFunction = helperExport
        await helperFn({
          graphql,
          page,
          createAdvancedPage: props => this.createPage(props ?? { route: null })
        })
      } catch (e) {
        reportError(
          `Error occurred while running page helper function at "${page.helper}"`,
          // e[0] to catch thrown graphql errors
          // e.g. throw result.errors
          (e[0] !== undefined) ? e[0] : e
        )
      }
    }
  }

  private createPage ({ route, params = {}, pagination, ...context }: CreateAdvancedPageProps) {
    const { currentPage } = this
    if (typeof route !== 'string' || !route) {
      reportError(
        `Route name passed to createAdvancedPage() at "${currentPage.helper}"` +
        ' must be a non-empty string'
      )
      return
    }

    const routeNode = this.routeMap[route]
    if (!routeNode) {
      reportError(
        `Unrecognized route "${route}" passed to createAdvancedPage() at "${currentPage.helper}"`
      )
      return
    }

    const gatsbyPage: Page = {
      path: routeNode.pathGenerator(params),
      component: currentPage.template,
      context: {
        id: currentPage.id,
        ...params,
        ...context
      }
    }

    if (pagination) {
      let { limit, count, route: paginationRoute } = pagination
      if (typeof count === 'undefined') {
        reportError(
          `Invalid pagination object passed to createAdvancedPage() at "${currentPage.helper}": ` +
          '"count" parameter is missing'
        )
        return
      }

      if (!Number.isInteger(count) || count < 0) {
        reportError(
          `Invalid pagination object passed to createAdvancedPage() at "${currentPage.helper}": ` +
          `"count" parameter must be a valid non-negative number (got "${count}")`
        )
        return
      }

      if (typeof limit === 'undefined') {
        limit = getOption('pagination').limit
      } else if (!Number.isInteger(limit) || limit <= 0) {
        reportError(
          `Invalid pagination object passed to createAdvancedPage() at "${currentPage.helper}": ` +
          `"limit" parameter must be a valid positive number (got "${limit}")`
        )
        return
      }

      if (!routeNode.scopes.pagination) {
        if (typeof paginationRoute === 'undefined') {
          // Auto generate a paginated route for main route
          routeNode.scopes.pagination = this.generateRoute(route, 'pagination')
        } else {
          if (!this.routeMap[paginationRoute]) {
            reportError(
              `Invalid pagination object passed to createAdvancedPage() at "${currentPage.helper}": ` +
              `Unrecognized route "${paginationRoute}"`
            )
            return
          }
          routeNode.scopes.pagination = this.routeMap[paginationRoute]
        }
      }

      const generatePagePath = (page: number) => routeNode.scopes.pagination.pathGenerator(
        { page, ...params }
      )
      const pagesCount = Math.ceil(count / limit)
      for (let i = 1; i <= pagesCount; i++) {
        const gatsbyPaginatedPage: Page = {
          path: i === 1 ? gatsbyPage.path : generatePagePath(i),
          component: gatsbyPage.component,
          context: {
            ...gatsbyPage.context,
            limit,
            offset: (i - 1) * limit
          }
        }

        this.createPageAction(gatsbyPaginatedPage)
      }

      return
    }

    this.createPageAction(gatsbyPage)
  }

  // Creates a serializable form of the route map
  getRoutesExport (): SerializedRoute[] {
    return _.map(this.routeMap, route => {
      return {
        name: route.name,
        path: route.path,
        scopes: _.mapValues(route.scopes, 'path')
      }
    })
  }
}
