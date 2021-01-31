import path from 'path'
import PagesCreator from './lib/pages-creator'
import { getOption, reportError } from './util'

export default async function ({ graphql, actions, getNodesByType }) {
  const { createPage } = actions

  const pageType = getOption('typeNames.page')
  if(getNodesByType(pageType).length === 0) {
    return
  }

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
    return reportError('Failed running "create-pages" GraphQL Query', result.errors.shift())
  }

  const pageCreator = new PagesCreator(
    result.data[`all${pageType}`].nodes
  )

  // Create the actual pages
  await pageCreator.createPages({ graphql, createPage })

  // Write routes export file
  pageCreator.writeRoutesExport(path.resolve(__dirname, '../routes.js'))
}
