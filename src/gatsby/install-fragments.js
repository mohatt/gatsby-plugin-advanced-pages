const fs = require('fs')
const path = require('path')

module.exports = async ({ store, getNodesByType }) => {
  const { program } = store.getState()
  // Add pagination fragment to .cache/fragments.
  await fs.copyFile(
    path.resolve(__dirname, '../components/Pagination/Pagination.fragment.js'),
    path.resolve(program.directory, '.cache/fragments/pagination-fragment.js'),
    err => {
      if (err) throw err;
    }
  )
}
