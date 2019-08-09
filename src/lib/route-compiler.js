import pathToRegexp from 'path-to-regexp'

// Wraps pathToRegexp to handle errors thrown
// Uses Memoization to improve performance
// Returns a function to be used to generate paths for specific route
export default function compileRoute (routePath) {
  if (!compileRoute.cache) {
    compileRoute.cache = {}
  }

  if (compileRoute.cache[routePath]) {
    return compileRoute.cache[routePath]
  }

  const generator = pathToRegexp.compile(routePath)
  return compileRoute.cache[routePath] = function (data, options) {
    try {
      return generator(data, options)
    } catch (e) {
      throw new TypeError(
        `Error generating a path for route '${routePath}' with ` +
        `params '${JSON.stringify(data)}': ${e.message}`
      )
    }
  }
}
