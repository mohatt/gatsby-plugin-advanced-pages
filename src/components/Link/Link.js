import React from 'react'
import { Link as GatsbyLink } from 'gatsby'
import { string, object } from 'prop-types'
import { generatePath } from '../../api'

const Link = ({ to, params, scope, ...props }) => {
  let href
  if (to !== undefined) {
    try {
      href = generatePath(to, params, scope)
    } catch (e) {
      if (process.env.NODE_ENV !== `production`) {
        console.error(
          'Warning: Invalid route props supplied to `Link` component: ' + e.message
        )
      }
    }
  }

  return (
    <GatsbyLink to={href} {...props} />
  )
}

Link.propTypes = {
  to: string.isRequired,
  params: object,
  scope: string
}

export default Link
