'use strict'

module.exports = new (require('metro-memory-fs'))({
  cwd: () => '/virtual/project'
})
