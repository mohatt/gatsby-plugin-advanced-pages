const compileRoute = require('./lib/route-compiler')
const routes = require('./routes')

// Returns a function to be used to generate paths for a specific route
function getPathGenerator (routeName, scope) {
  if (typeof routeName !== 'string' || !routeName) {
    throw new TypeError(
      `Expected route name to be a non-empty string (got '${typeof routeName}')`
    )
  }

  const route = routes[routeName]
  if (!route) {
    throw new TypeError(`Unrecognized route name '${routeName}'`)
  }

  if (!scope) {
    return compileRoute(route.path)
  }

  if (!route.scopes[scope]) {
    throw new TypeError(`Unrecognized scope '${scope}' on route '${routeName}'`)
  }

  return compileRoute(route.scopes[scope])
}

// Generates a path for a specific route based on the given parameters.
function generatePath (routeName, args = {}, scope) {
  return getPathGenerator(routeName, scope)(args)
}

module.exports = {
  routes,
  getPathGenerator,
  generatePath
}
