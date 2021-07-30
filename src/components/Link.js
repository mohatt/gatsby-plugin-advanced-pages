import React from 'react'
import { Link as GatsbyLink } from 'gatsby'
import { string, object } from 'prop-types'
import { routeExists, generatePath } from '../index'

const Link = ({ to, params, scope, ...props }) => {
  if (to && routeExists(to)) {
    try {
      to = generatePath(to, params, scope, true)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`gatsby-plugin-advanced-pages: Unable to generate path for route "${to}": ${e.message}`)
      }
      to = '/404.html'
    }
  }

  return (
    <GatsbyLink to={to} {...props} />
  )
}

Link.propTypes = {
  to: string.isRequired,
  params: object,
  scope: string
}

export default Link
