'use strict';

module.exports = {
  roots: [
  	'<rootDir>/test/',
  	'<rootDir>/src/'
  ],
  moduleNameMapper: {
    '^\\.[\\./]+routes$': '<rootDir>/test/__mocks__/routes.js'
  }
};