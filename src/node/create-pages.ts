import fs from 'fs'
import path from 'path'
import PagesCreator from './lib/pages-creator'
import { createPluginExport, options, PluginError } from './util'

const createPages = createPluginExport(
  'createPages',
  async ({ graphql, actions, getNodesByType, cache }) => {
    const { createPage } = actions

    const pageType = options.get('typeNames').page
    if (getNodesByType(pageType).length === 0) {
      return
    }

    const result = await graphql(`{
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
    }`)

    if (result.errors) {
      throw new PluginError('Failed running "create-pages" GraphQL Query', result.errors.shift())
    }

    // Create the actual pages
    const pageCreator = new PagesCreator(result.data[`all${pageType}`].nodes)
    await pageCreator.createPages({ graphql, createPage })

    // Write routes export file
    const routesFile = path.join(cache.directory, 'routes.json')
    try {
      fs.writeFileSync(routesFile, JSON.stringify(pageCreator.getRoutesExport()))
    } catch (error) {
      throw new PluginError('Error writing route map export file', error)
    }
  },
)

export default createPages
