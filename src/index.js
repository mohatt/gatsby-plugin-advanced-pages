import { navigate as gatsbyNavigate, withPrefix } from 'gatsby'
import { pick, compile } from './lib/route-compiler'
import { useLocation } from '@reach/router'
import routes from 'gatsby-plugin-advanced-pages-cache/routes.json'

/**
 * Gets an array of all routes or routes nested under a given parent route
 */
export function getRoutes (parent) {
  if (!getRoutes.tree) {
    const tree = []
    for (const { name, path, scopes } of routes) {
      tree.push({
        name,
        path,
        realpath: withPrefix(path),
        parent: null
      })
      for (const scope in scopes) {
        tree.push({
          name: `${name}.${scope}`,
          path: scopes[scope],
          realpath: withPrefix(scopes[scope]),
          parent: { name, scope }
        })
      }
    }
    getRoutes.tree = tree
  }

  return parent
    ? getRoutes.tree.filter(r => r.parent && r.parent.name === parent)
    : getRoutes.tree
}

/**
 * Gets the Route object of a given route name
 */
export function getRoute (route) {
  if (typeof route !== 'string' || !route) {
    throw new TypeError(
      `Expected route name to be a non-empty string (got '${typeof route}')`
    )
  }

  const ro = getRoutes().find(r => r.name === route)
  if (!ro) {
    throw new TypeError(`Unrecognized route name '${route}'`)
  }

  return ro
}

/**
 * Checks if a route is defined with the given name
 */
export function routeExists (route) {
  return getRoutes().find(r => r.name === route) !== undefined
}

/**
 * Gets the current active route based on `@reach/router` location history
 */
export function getActivatedRoute () {
  return getMatchingRoute(useLocation().pathname, true)
}

/**
 * Checks whether a given route is currently active
 */
export function isActivatedRoute (route) {
  const ro = getRoute(route)
  const activeRo = getActivatedRoute()
  return activeRo
    ? Boolean(ro.name === activeRo.name || (activeRo.parent && activeRo.parent.name === ro.name))
    : false
}

/**
 * Gets the route that matches a specific path
 */
export function getMatchingRoute (path, ignorePrefix) {
  return pick(getRoutes(), ignorePrefix ? path : withPrefix(path))
}

/**
 * Returns a function to be used to generate paths for a specific route
 */
export function getPathGenerator (route, scope, ignorePrefix) {
  const ro = getRoute(route)
  if (!scope) {
    return compile(ignorePrefix ? ro.path : ro.realpath)
  }

  const childRo = getRoutes(route).find(r => r.parent.scope === scope)
  if (!childRo) {
    throw new TypeError(`Unrecognized scope '${scope}' on route '${route}'`)
  }

  return compile(ignorePrefix ? childRo.path : childRo.realpath)
}

/**
 * Generates a path for a specific route based on the given parameters
 */
export function generatePath (route, params = {}, scope, ignorePrefix) {
  return getPathGenerator(route, scope, ignorePrefix)(params)
}

/**
 * Extends Gatsby's navigate to allow route names
 */
export function navigate (to, params = {}, scope, options) {
  return gatsbyNavigate(generatePath(to, params, scope), options)
}

export { default as Link } from './components/Link'
export { default as Pagination } from './components/Pagination'
