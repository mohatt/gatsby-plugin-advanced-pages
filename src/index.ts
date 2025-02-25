import { navigate as gatsbyNavigate, withPrefix } from 'gatsby'
import { useLocation, NavigateOptions } from '@reach/router'
import { pick, compile, RouteParams } from './lib/route-compiler'
import type { RouteScope, SerializedRoute } from './gatsby/types'
import type { Route } from './types'

// @ts-ignore
import routes from 'gatsby-plugin-advanced-pages-cache/routes.json'

// Represents a cache for storing routes.
let cachedRoutes: Route[] | null = null

/**
 * Gets an array of all routes or routes nested under a given parent route
 */
export const getRoutes = (parent?: string): readonly Route[] => {
  if (!cachedRoutes) {
    cachedRoutes = []
    for (const { name, path, scopes } of routes as SerializedRoute[]) {
      cachedRoutes.push({
        name,
        path,
        realpath: withPrefix(path),
        parent: null,
      })
      Object.entries(scopes).forEach(([scope, scopePath]: [RouteScope, string]) => {
        cachedRoutes.push({
          name: `${name}.${scope}`,
          path: scopePath,
          realpath: withPrefix(scopePath),
          parent: { name, scope },
        })
      })
    }
  }

  return parent ? cachedRoutes.filter((r) => r.parent?.name === parent) : cachedRoutes
}

/**
 * Gets the Route object of a given route name
 */
export const getRoute = (route: string) => {
  if (typeof route !== 'string' || !route) {
    throw new TypeError(
      `Expected route name to be a non-empty string (got '${typeof route}')`
    )
  }

  const ro = getRoutes().find(r => r.name === route)
  if (!ro) {
    throw new TypeError(`Unrecognized route name '${route}'`)
  }

  return ro
}

/**
 * Checks if a route is defined with the given name
 */
export const routeExists = (route: string) => getRoutes().some(r => r.name === route)

/**
 * Gets the route that matches a specific path
 * use `ignorePrefix` if the path provided already contains `pathPrefix`
 */
export const getMatchingRoute = (path: string, ignorePrefix = false) =>
  pick(getRoutes(), ignorePrefix ? path : withPrefix(path))

/**
 * Returns a function to be used to generate paths for a specific route
 * use `ignorePrefix` to ignore adding `pathPrefix` to generated paths
 */
export const getPathGenerator = (route: string, scope: RouteScope, ignorePrefix = false) => {
  const ro = getRoute(route)
  if (!scope) {
    return compile(ignorePrefix ? ro.path : ro.realpath)
  }

  const childRo = getRoutes(route).find(r => r.parent?.scope === scope)
  if (!childRo) {
    throw new TypeError(`Unrecognized scope '${scope}' on route '${route}'`)
  }

  return compile(ignorePrefix ? childRo.path : childRo.realpath)
}

/**
 * Generates a path for a specific route based on the given parameters
 */
export const generatePath = (route: string, params: RouteParams = {}, scope?: RouteScope, ignorePrefix = false) =>
  getPathGenerator(route, scope, ignorePrefix)(params)

/**
 * Extends Gatsby's navigate to allow route names
 */
export const navigate = (to: string, params: RouteParams = {}, scope?: RouteScope, options?: NavigateOptions<{}>) =>
  gatsbyNavigate(generatePath(to, params, scope), options)

/**
 * Gets the current active route based on `@reach/router` location history
 */
export const useRoute = () => {
  const { pathname } = useLocation()
  return getMatchingRoute(pathname, true)
}

/**
 * Checks whether a given route is currently active
 */
export const useIsRoute = (route: string) => {
  const current = useRoute()
  const ro = getRoute(route)
  return current ? Boolean(ro.name === current.name || (current.parent && current.parent.name === ro.name)) : false
}

export * from './types'
export { default as Link, LinkProps } from './components/Link'
export { default as Pagination, PaginationInfo, PaginationProps } from './components/Pagination'
