import React from 'react'
import { PathFunction as PathGeneratorFunction } from 'path-to-regexp'

export type RouteScope = 'pagination'

export interface Route {
  name: string
  path: string
  realpath: string
  parent: {
    name: string
    scope: RouteScope
  } | null
}

export interface RouteParams {
  [index: string]: string
}

export interface PaginationInfo {
  itemCount: number
  perPage: number
  pageCount: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginationProps {
  route: string
  params?: RouteParams
  ui?: string
  range?: number
  className?: string
  renderDisabled?: boolean
  pageInfo: PaginationInfo
  labels?: {
    [index: string]: string | React.ReactNode
  }
  theme?: {
    [index: string]: string
  }
}

export interface LinkProps {
  to: string
  params?: RouteParams
  scope?: string
}

export const Pagination: React.ComponentType<PaginationProps>
export const Link: React.ComponentType<LinkProps>

export function getRoutes(parent?: string): [Route]
export function routeExists(route: string): boolean
export function getRoute(route: string): Route
export function getActivatedRoute(): Route
export function isActivatedRoute(route: string): boolean
export function getMatchingRoute(path: string, ignorePrefix?: boolean): Route
export function getPathGenerator(route: string, scope?: RouteScope, ignorePrefix?: boolean): PathGeneratorFunction<RouteParams>
export function generatePath(route: string, params?: RouteParams, scope?: RouteScope, ignorePrefix?: boolean): string
export function navigate(to: string, params?: RouteParams, scope?: RouteScope, options?: {}): void
