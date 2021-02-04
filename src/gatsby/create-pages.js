import fs from 'fs'
import path from 'path'
import PagesCreator from './lib/pages-creator'
import { getOption, reportError } from './util'

export default async function ({ graphql, actions, getNodesByType, cache }) {
  const { createPage } = actions

  const pageType = getOption('typeNames.page')
  if (getNodesByType(pageType).length === 0) {
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

  // Create the actual pages
  const pageCreator = new PagesCreator(result.data[`all${pageType}`].nodes)
  await pageCreator.createPages({ graphql, createPage })

  // Write routes export file
  const routesFile = path.join(cache.directory, 'routes.json')
  try {
    fs.writeFileSync(routesFile, JSON.stringify(pageCreator.getRoutesExport()))
    return true
  } catch (e) {
    reportError('Error writing route map export file', e)
  }
}
