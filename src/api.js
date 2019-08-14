import { navigate as gatsbyNavigate, withPrefix } from 'gatsby'
import { pick, compile } from './lib/route-compiler'

// Gets the route map object
export function getRoutes () {
  return require('./routes')
}

// Gets a specific route
export function getRoute (route) {
  if (typeof route !== 'string' || !route) {
    throw new TypeError(
      `Expected route name to be a non-empty string (got '${typeof route}')`
    )
  }

  const routes = getRoutes()
  const ro = routes.find(r => r.name === route)
  if (!ro) {
    throw new TypeError(`Unrecognized route name '${route}'`)
  }

  return ro
}

// Gets the current active route based on window location
export function getActivatedRoute () {
  return getMatchingRoute(
    require('@reach/router').globalHistory.location.pathname
  )
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
  if (!ro) {
    return false
  }

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

// Extends gatsby's navigate to allow route names
export function navigate (to, params = {}, scope, options) {
  return gatsbyNavigate(generatePath(to, params, scope), options)
}

export { Pagination, Link } from './components'
