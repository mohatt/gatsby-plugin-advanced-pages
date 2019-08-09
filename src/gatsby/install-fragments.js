import fs from 'fs'
import path from 'path'

export default async function ({ store, getNodesByType }) {
  const { program } = store.getState()
  // Add pagination fragment to .cache/fragments.
  await fs.copyFile(
    path.resolve(__dirname, '../components/Pagination/Pagination.fragment'),
    path.resolve(program.directory, '.cache/fragments/pagination-fragment.js'),
    err => {
      if (err) throw err
    }
  )
}
