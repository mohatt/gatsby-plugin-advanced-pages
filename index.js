const pathToRegexp = require('path-to-regexp')
const routes = require('./routes')

// Returns a function to be used to generate paths for a specific route
function compileRoute (route) {
  if (typeof route !== 'string' || !route) {
    throw new TypeError(`Expected route name to be a non-empty string (got '${typeof route}')`)
  }

  const path = routes[route]
  if (!path) {
    throw new TypeError(`Unrecognized route name '${route}'`)
  }

  return pathToRegexp.compile(path)
}

// Generates a path for a specific route based on the given parameters.
function generatePath (route, args = {}) {
  const generator = compileRoute(route)
  if (!generator) {
    return false
  }

  return generator(args)
}

module.exports = {
  routes,
  getRoutePath,
  getRoutePathGenerator
}
