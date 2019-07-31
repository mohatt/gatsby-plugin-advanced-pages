const pathToRegexp = require('path-to-regexp')
const routes = require('./routes')

function getRoutePathGenerator (route) {
  if (typeof route !== 'string' || !route) {
    throw new TypeError(`Expected route name to be a non-empty string (got '${typeof route}')`)
  }

  const path = routes[route]
  if (!path) {
    throw new TypeError(`Unrecognized route name '${route}'`)
  }

  return pathToRegexp.compile(path)
}

function getRoutePath (route, args = {}) {
  const generator = getRoutePathGenerator(route)
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
