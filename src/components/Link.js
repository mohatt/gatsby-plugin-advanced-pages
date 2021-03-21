import React from 'react'
import { Link as GatsbyLink } from 'gatsby'
import { string, object } from 'prop-types'
import { routeExists, generatePath } from '../api'

const Link = ({ to, params, scope, ...props }) => {
  if (to && routeExists(to)) {
    try {
      to = generatePath(to, params, scope, true)
    } catch (e) {
      console.error(
        'Warning: Invalid route params supplied to `Link` component: ' + e.message
      )
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
