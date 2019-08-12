'use strict';

const React = require('react');

module.exports = {
  withPrefix: jest.fn().mockImplementation(path => path),
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
        href: to,
      })
    )
  ),
  graphql: jest.fn(),
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn()
};
