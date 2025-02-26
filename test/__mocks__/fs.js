import MemoryFS from 'metro-memory-fs'
// Make sure we export this as a cjs module
module.exports = new MemoryFS({
  cwd: () => '/virtual/project',
})
