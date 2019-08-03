const path = require('path')
const debug = require("debug")("gatsby-plugin-advanced-pages")

// Checks if a path is a child of another one
function isPathChildof (child, parent) {
  const relative = path.relative(parent, child)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

module.exports = {
  debug,
  isPathChildof,
}
