import path from 'path'
import React from 'react'
const withPrefix = pathname => path.join('/site', pathname)
// Make sure we export this as a cjs module
module.exports = {
  graphql: jest.fn(),
  withPrefix: jest.fn().mockImplementation(withPrefix),
  navigate: jest.fn(),
  Link: jest.fn().mockImplementation(
    ({
      activeClassName,
      activeStyle,
      getProps,
      innerRef,
      ref,
      replace,
      to,
      ...rest
    }) => (
      React.createElement('a', {
        ...rest,
        href: to && withPrefix(to)
      })
    )
  )
}
