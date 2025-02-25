import { pathToRegexp, compile as pathToRegexpCompile, PathFunction } from 'path-to-regexp'

export interface RouteParams {
  [index: string]: string | number
}

export type PathGenerator<T extends RouteParams = RouteParams> = PathFunction<T>

// Normalizes a route path before passing it to pathToRegexp
const normalize = (route: string) => {
  // Strip trailing slashes to allow the resulting regexp
  // to match paths with or without trailing slashes
  // This will also ensure that all paths generated
  // through the plugin are trailing-slash free
  return route.replace(/^(.+?)\/*?$/, '$1')
}

// Checks if the route matches the given path
export const test = (route: string, path: string) => {
  const regexp = pathToRegexp(normalize(route))
  return regexp.test(path)
}

// Picks the first route that matches the given path
export const pick = <T extends { realpath: string }>(routes: readonly T[], path: string) => {
  const [pathname] = path.split('?')
  return routes.find(obj => test(obj.realpath, pathname)) || null
}

const compileCache: Record<string, PathGenerator> = {}

// Wraps pathToRegexp to handle errors thrown
// Uses Memoization to improve performance
// Returns a function to be used to generate paths for specific route
export const compile = (route: string, encodeURI = true) => {
  const cached = compileCache[route]
  if (cached) {
    return cached
  }

  const generator = pathToRegexpCompile(normalize(route), encodeURI ? { encode: encodeURIComponent } : {})
  // eslint-disable-next-line no-return-assign
  return compileCache[route] = (data) => {
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
