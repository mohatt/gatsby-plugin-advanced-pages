import { pathToRegexp, compile as pathToRegexpCompile } from 'path-to-regexp'

// Normalizes a route path before passing it to pathToRegexp
function normalize (route) {
  // Strip trailing slashes to allow the resulting regexp
  // to match paths with or without trailing slashes
  // This will also ensure that all paths generated
  // through the plugin are trailing-slash free
  return route.replace(/^(.+?)\/*?$/, '$1')
}

// Checks if the route matches the given path
export function test (route, path) {
  const regexp = pathToRegexp(normalize(route))
  return regexp.test(path)
}

// Picks the first route that matches the given path
export function pick (routes, path) {
  const [pathname] = path.split('?')
  return routes.find(obj => test(obj.realpath, pathname)) || null
}

// Wraps pathToRegexp to handle errors thrown
// Uses Memoization to improve performance
// Returns a function to be used to generate paths for specific route
export function compile (route, encodeURI = true) {
  compile.cache = compile.cache || {}
  if (compile.cache[route]) {
    return compile.cache[route]
  }

  const options = {}
  if (encodeURI) {
    options.encode = encodeURIComponent
  }
  const generator = pathToRegexpCompile(normalize(route), options)

  // eslint-disable-next-line no-return-assign
  return compile.cache[route] = function (data) {
    try {
      return generator(data)
    } catch (e) {
      throw new TypeError(
        `Error generating a path for route "${route}" with ` +
        `params "${JSON.stringify(data)}": ${e.message}`
      )
    }
  }
}
