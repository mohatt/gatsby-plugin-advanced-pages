import { navigate as gatsbyNavigate, withPrefix } from 'gatsby'
import { pick, compile } from './lib/route-compiler'
import { useLocation } from '@reach/router'
import routes from 'gatsby-plugin-advanced-pages-cache/routes.json'

// Gets an array of all routes
export function getRoutes () {
  return routes
}

// Gets a specific route
export function getRoute (route) {
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

// Checks if there is a route defined with the given name
export function routeExists (route) {
  return getRoutes().find(r => r.name === route) !== undefined
}

// Gets the current active route based on `@reach/router` location history
export function getActivatedRoute () {
  return getMatchingRoute(useLocation().pathname)
}

// Checks whether a given route is currently active
export function isActivatedRoute (route) {
  const ro = getRoute(route)
  const activeRo = getActivatedRoute()
  return activeRo ? ro.name === activeRo.name : false
}

// Gets the route that matches a specific path
export function getMatchingRoute (path) {
  if (!getMatchingRoute.routes) {
    const prefixedRoutes = []
    for (const { name, path, scopes } of getRoutes()) {
      prefixedRoutes.push({ name, scope: null, path: withPrefix(path) })
      for (const scope in scopes) {
        prefixedRoutes.push({ name, scope, path: withPrefix(scopes[scope]) })
      }
    }

    getMatchingRoute.routes = prefixedRoutes
  }

  return pick(getMatchingRoute.routes, path)
}

// Returns a function to be used to generate paths for a specific route
export function getPathGenerator (route, scope, ignorePrefix) {
  const ro = getRoute(route)
  if (!scope) {
    return compile(ignorePrefix ? ro.path : withPrefix(ro.path))
  }

  if (!ro.scopes[scope]) {
    throw new TypeError(`Unrecognized scope '${scope}' on route '${route}'`)
  }

  return compile(ignorePrefix ? ro.scopes[scope] : withPrefix(ro.scopes[scope]))
}

// Generates a path for a specific route based on the given parameters.
export function generatePath (route, params = {}, scope, ignorePrefix) {
  return getPathGenerator(route, scope, ignorePrefix)(params)
}

// Extends Gatsby's navigate to allow route names
export function navigate (to, params = {}, scope, options) {
  return gatsbyNavigate(generatePath(to, params, scope), options)
}

export { default as Link } from './components/Link'
export { default as Pagination } from './components/Pagination'
