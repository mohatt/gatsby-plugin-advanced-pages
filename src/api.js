import { withPrefix } from 'gatsby'
import compilePath from './lib/compile-path'

// Gets the route map object
export function getRouteMap () {
  return require('./routes')
}

// Gets a specific route
export function getRoute (route) {
  if (typeof route !== 'string' || !route) {
    throw new TypeError(
      `Expected route name to be a non-empty string (got '${typeof route}')`
    )
  }

  const routes = getRouteMap()
  const ro = routes[route]
  if (!ro) {
    throw new TypeError(`Unrecognized route name '${route}'`)
  }

  return ro
}

// Returns a function to be used to generate paths for a specific route
export function getPathGenerator (route, scope, ignorePrefix) {
  const ro = getRoute(route)
  if (!ro) {
    return false
  }

  if (!scope) {
    return compilePath(ignorePrefix ? ro.path : withPrefix(ro.path))
  }

  if (!ro.scopes[scope]) {
    throw new TypeError(`Unrecognized scope '${scope}' on route '${route}'`)
  }

  return compilePath(ignorePrefix ? ro.scopes[scope] : withPrefix(ro.scopes[scope]))
}

// Generates a path for a specific route based on the given parameters.
export function generatePath (route, params = {}, scope, ignorePrefix) {
  return getPathGenerator(route, scope, ignorePrefix)(params)
}

export { compilePath }
export { Pagination, Link } from './components'
