'use strict'

const path = require('path')
const React = require('react')
const withPrefix = pathname => path.join('/site', pathname)

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
