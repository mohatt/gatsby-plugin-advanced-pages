import pathToRegexp from 'path-to-regexp'

// Wraps pathToRegexp to handle errors thrown
// Uses Memoization to improve performance
// Returns a function to be used to generate paths for specific route
export default function compilePath (path) {
  if (!compilePath.cache) {
    compilePath.cache = {}
  }

  if (compilePath.cache[path]) {
    return compilePath.cache[path]
  }

  const generator = pathToRegexp.compile(path)
  return compilePath.cache[path] = function (data, options) {
    try {
      return generator(data, options)
    } catch (e) {
      throw new TypeError(
        `Error generating a path for '${path}' with ` +
        `params '${JSON.stringify(data)}': ${e.message}`
      )
    }
  }
}
