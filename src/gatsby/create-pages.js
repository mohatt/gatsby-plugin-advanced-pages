import path from 'path'
import PagesCreator from './lib/pages-creator'
import { getOption } from './util'

export default async function ({ graphql, actions }) {
  const { createPage } = actions

  const pageType = getOption('typeNames.page')
  const result = await graphql(`
    {
      all${pageType} {
        nodes {
          id
          routes {
            name
            path
          }
          title
          templateName
          template
          helper
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const pageCreator = new PagesCreator(
    result.data[`all${pageType}`].nodes
  )

  // Create the actual pages
  await pageCreator.createPages({ graphql, createPage })

  // Write routes export file
  pageCreator.writeRoutesExport(path.resolve(__dirname, '../routes.js'))
}
