import { pathToRegexp, compile as pathToRegexpCompile, PathFunction } from 'path-to-regexp'

/**
 * Represents route parameters that can be passed to a compiled path generator.
 */
export interface RouteParams {
  [index: string]: string | number
}

/**
 * A function that generates a URL path from given parameters.
 */
export type PathGenerator<T extends RouteParams = RouteParams> = PathFunction<T>

/**
 * A utility class for compiling and matching route paths.
 *
 * @internal
 */
export class RouteCompiler {
  /**
   * A cache for storing compiled path generators to optimize performance.
   */
  static compileCache: Record<string, PathGenerator> = {}

  /**
   * Finds the first route from a list of routes that matches the given path.
   *
   * @param routes - An array of route objects containing `realpath` props.
   * @param path - The actual path to match against the route patterns.
   *
   * @returns The first matching route object, or `null` if no match is found.
   */
  static pick<T extends { realpath: string }>(routes: readonly T[], path: string) {
    const [pathname] = path.split('?') // Remove query parameters
    return routes.find(obj => this.test(obj.realpath, pathname)) || null
  }

  /**
   * Compiles a route pattern into a reusable function for generating paths.
   *
   * @param route - The route pattern to compile (e.g., `/users/:id`).
   * @param encodeURI - Whether to encode URI components (default: `true`).
   *
   * @returns A function that generates a URL path given the required parameters.
   */
  static compile(route: string, encodeURI = true) {
    const cached = this.compileCache[route]
    if (cached) {
      return cached
    }

    const generator = pathToRegexpCompile(this.normalize(route), encodeURI ? { encode: encodeURIComponent } : {})

    // Cache and return the compiled path generator
    return this.compileCache[route] = (data) => {
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

  /**
   * Tests if a given path matches a specified route pattern.
   *
   * @param route - The route pattern to match against (e.g., `/users/:id`).
   * @param path - The actual path to check (e.g., `/users/123`).
   *
   * @returns `true` if the path matches the route pattern, otherwise `false`.
   */
  static test(route: string, path: string) {
    const regexp = pathToRegexp(this.normalize(route))
    return regexp.test(path)
  }

  /**
   * Normalizes a route path by removing trailing slashes.
   *
   * Ensures that:
   * - Routes can match paths with or without a trailing slash.
   * - All generated paths maintain a consistent format.
   *
   * @param route - The route to normalize.
   *
   * @returns The normalized route string without trailing slashes.
   */
  private static normalize(route: string) {
    return route.replace(/^(.+?)\/*?$/, '$1')
  }
}
