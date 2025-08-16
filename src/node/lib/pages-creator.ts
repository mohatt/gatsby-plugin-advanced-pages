import path from 'path'
import _ from 'lodash'
import type { CreatePagesArgs, Page } from 'gatsby'
import { RouteCompiler, PathGenerator } from '@/lib/route-compiler'
import { options, getDefaultExport, PluginError } from '../util'
import {
  PageNode,
  SerializedRoute,
  RouteScope,
  PageHelperFunction,
  CreateAdvancedPageProps,
} from '../api'

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

class PageHelperError extends Error {
  constructor(
    public subject: string,
    public reason?: string,
  ) {
    super(subject, { cause: reason })
  }
}

export default class PagesCreator {
  private readonly routeMap: Record<string, RouteNode>
  private readonly pages: PageNode[]
  private currentPage?: PageNode
  private createPageAction?: CreatePagesProps['createPage']

  constructor(pages: PageNode[]) {
    this.routeMap = {}
    this.pages = pages.map((page) => {
      this.createRoutes(page)
      // Prevent page helpers from mutating page object
      return Object.freeze(page)
    })
  }

  /**
   * Creates pages based on the provided GraphQL data and route definitions.
   */
  async createPages({ graphql, createPage }: CreatePagesProps) {
    this.createPageAction = createPage
    for (const page of this.pages) {
      this.currentPage = page

      // No page helper? Add static pages for all defined routes
      if (!page.helper) {
        page.routes.forEach((route) => this.createPage({ route: route.name }))
        continue
      }

      // Run the page helper
      try {
        const helperFn = await getDefaultExport<PageHelperFunction>(page.helper)
        await helperFn({
          graphql,
          page,
          createAdvancedPage: (props) => this.createPage(props ?? { route: null }),
        })
      } catch (error) {
        if (error instanceof PageHelperError) {
          throw new PluginError(
            `${error.subject} passed to createAdvancedPage() at "${page.helper}"${error.reason || ''}`,
          )
        }

        throw new PluginError(
          `Error while running page helper function at "${page.helper}"`,
          // error[0] to catch thrown graphql errors
          // e.g. throw result.errors
          error[0] ?? error,
        )
      }
    }
  }

  /**
   * Returns a serializable form of the route map.
   */
  getRoutesExport(): SerializedRoute[] {
    return Object.values(this.routeMap).map((route) => {
      return {
        name: route.name,
        path: route.path,
        scopes: _.mapValues(route.scopes, 'path'),
      }
    })
  }

  /**
   * Creates a Gatsby page with optional pagination.
   */
  private createPage({
    route,
    params = {},
    templateArgs,
    pagination,
    ...context
  }: CreateAdvancedPageProps) {
    const { currentPage } = this
    if (typeof route !== 'string' || !route) {
      throw new PageHelperError('Route name', ' must be a non-empty string')
    }

    const routeNode = this.routeMap[route]
    if (!routeNode) {
      throw new PageHelperError(`Unrecognized route "${route}"`)
    }

    const template = currentPage.template
    const templateQuery =
      templateArgs &&
      new URLSearchParams(Object.entries(templateArgs).map(([k, v]) => [k, String(v)])).toString()
    const templateUrl = templateQuery ? `${template}?${templateQuery}` : template

    const gatsbyPage: Page = {
      path: routeNode.pathGenerator(params),
      component: templateUrl,
      context: {
        id: currentPage.id,
        ...params,
        ...context,
      },
    }

    if (!pagination) {
      return this.createPageAction(gatsbyPage)
    }

    let { limit, count, route: paginationRoute } = pagination
    if (typeof count === 'undefined') {
      throw new PageHelperError('Invalid pagination object', ': "count" parameter is missing')
    }

    if (typeof count === 'undefined' || !Number.isSafeInteger(count) || count < 0) {
      throw new PageHelperError(
        'Invalid pagination object',
        `: "count" parameter must be a non-negative integer. Got: "${count}"`,
      )
    }

    limit = limit ?? options.get('pagination').limit

    if (!Number.isSafeInteger(limit) || limit <= 0) {
      throw new PageHelperError(
        'Invalid pagination object',
        `: "limit" parameter must be a positive integer. Got: "${limit}"`,
      )
    }

    if (!routeNode.scopes.pagination) {
      if (typeof paginationRoute === 'undefined') {
        // Auto generate a paginated route for main route
        routeNode.scopes.pagination = this.generateRoute(route, 'pagination')
      } else {
        if (!this.routeMap[paginationRoute]) {
          throw new PageHelperError(
            'Invalid pagination object',
            `: Unrecognized route "${paginationRoute}"`,
          )
        }
        routeNode.scopes.pagination = this.routeMap[paginationRoute]
      }
    }

    const generatePagePath = (page: number) =>
      routeNode.scopes.pagination.pathGenerator({ page, ...params })

    const pagesCount = Math.ceil(count / limit)
    for (let i = 1; i <= pagesCount; i++) {
      this.createPageAction({
        path: i === 1 ? gatsbyPage.path : generatePagePath(i),
        component: gatsbyPage.component,
        context: {
          ...gatsbyPage.context,
          limit,
          offset: (i - 1) * limit,
        },
      })
    }
  }

  /**
   * Processes routes and adds them to the route map.
   * Ensures all routes have a unique name and prepends the base path.
   * Adds basePath prefix to all route paths
   */
  private createRoutes(page: PageNode) {
    for (const route of page.routes) {
      const { name } = route
      if (this.routeMap[name]) {
        throw new PluginError(
          `Unable to create route with name "${name}". Route name already exists.`,
        )
      }
      this.routeMap[name] = {
        name,
        path: path.join(options.get('basePath'), route.path),
        scopes: {},
        pathGenerator: RouteCompiler.compile(route.path, false),
      }
    }
  }

  /**
   * Generates a scoped child route for pagination or other extensions.
   */
  private generateRoute(parent: string, scope: RouteScope): ChildRouteNode {
    let scopedPath: string
    switch (scope) {
      case 'pagination':
        scopedPath = path.join(this.routeMap[parent].path, options.get('pagination').suffix)
        break
      default:
        return null
    }

    return {
      name: parent + '.' + scope,
      path: scopedPath,
      pathGenerator: RouteCompiler.compile(scopedPath),
    }
  }
}
