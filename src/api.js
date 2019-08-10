import compilePath from './lib/compile-path'

// Gets the route map object
export function getRouteMap () {
  return require('./routes')
}

// Gets a specific route
export function getRoute (routeName) {
  if (typeof routeName !== 'string' || !routeName) {
    throw new TypeError(
      `Expected route name to be a non-empty string (got '${typeof routeName}')`
    )
  }

  const routes = getRouteMap()
  const route = routes[routeName]
  if (!route) {
    throw new TypeError(`Unrecognized route name '${routeName}'`)
  }

  return route
}

// Returns a function to be used to generate paths for a specific route
export function getPathGenerator (routeName, scope) {
  const route = getRoute(routeName)
  if (!route) {
    return false
  }

  if (!scope) {
    return compilePath(route.path)
  }

  if (!route.scopes[scope]) {
    throw new TypeError(`Unrecognized scope '${scope}' on route '${routeName}'`)
  }

  return compilePath(route.scopes[scope])
}

// Generates a path for a specific route based on the given parameters.
export function generatePath (routeName, args = {}, scope) {
  return getPathGenerator(routeName, scope)(args)
}

export { compilePath }
export { Pagination, Link } from './components'
