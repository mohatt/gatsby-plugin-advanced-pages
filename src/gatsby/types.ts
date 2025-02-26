import { RouteParams } from '../lib/route-compiler'
import type { CreatePagesArgs } from 'gatsby'

export interface PageOptions {
  title: string
  template?: string
  helper?: string
  data?: Record<string, any>
  routes: Record<string, string>
}

export interface PluginOptions {
  basePath: string
  pages: PageOptions[]
  template?: string
  directories: {
    templates: string
    helpers: string
  }
  pagination: {
    limit: number
    suffix: string
  }
  typeNames: {
    page: string
    pageRoute: string
  }
}

export interface PageRouteNode {
  name: string
  path: string
}

export interface PageNode {
  id: string
  title: string
  template?: string
  templateName?: string
  helper?: string
  data?: Record<string, any>
  routes: PageRouteNode[]
}

export type RouteScope = 'pagination'

export interface SerializedRoute {
  name: string
  path: string
  scopes: {
    [key in RouteScope]?: string
  }
}

export interface CreateAdvancedPageProps {
  route: string
  params?: RouteParams
  pagination?: {
    count: number
    limit?: number
    route?: string
  }
}

export interface PageHelperProps {
  graphql: CreatePagesArgs['graphql']
  page: PageNode
  createAdvancedPage: (props: CreateAdvancedPageProps) => void
}

export type PageHelperFunction = (props: PageHelperProps) => void | Promise<void>
