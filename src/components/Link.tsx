import React, { ReactNode } from 'react'
import { Link as GatsbyLink, GatsbyLinkProps } from 'gatsby'
import { routeExists, generatePath } from '@/api'
import type { RouteScope } from '@/node/api'

export interface LinkProps<TState> extends GatsbyLinkProps<TState> {
  to: string
  params?: Record<string, any>
  scope?: RouteScope
}

export const Link = <TState,>({ to, params, scope, ...props }: LinkProps<TState>): ReactNode => {
  if (to != null && routeExists(to)) {
    try {
      to = generatePath(to, params, scope, true)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `gatsby-plugin-advanced-pages: Unable to generate path for route "${to}": ${e.message}`,
        )
      }
      to = '/404.html'
    }
  }

  return <GatsbyLink to={to} {...(props as any)} />
}

export default Link
