import fs from 'fs'
import path from 'path'
import type { GatsbyNode } from 'gatsby'
import PagesCreator from './lib/pages-creator'
import { options, reporter } from './util'

const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, getNodesByType, cache }) => {
  const { createPage } = actions

  const pageType = options.get('typeNames').page
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
    reporter.error('Failed running "create-pages" GraphQL Query', result.errors.shift())
    return
  }

  // Create the actual pages
  const pageCreator = new PagesCreator(result.data[`all${pageType}`].nodes)
  await pageCreator.createPages({ graphql, createPage })

  // Write routes export file
  const routesFile = path.join(cache.directory, 'routes.json')
  try {
    fs.writeFileSync(routesFile, JSON.stringify(pageCreator.getRoutesExport()))
  } catch (e) {
    reporter.error('Error writing route map export file', e)
  }
}

export default createPages
