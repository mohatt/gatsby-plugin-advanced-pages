'use strict';

const React = require('react');

module.exports = {
  graphql: jest.fn(),
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
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn()
};
