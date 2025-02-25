import type { RouteScope } from './gatsby/types'

export interface Route {
  name: string
  path: string
  realpath: string
  parent?: {
    name: string
    scope: RouteScope
  }
}
