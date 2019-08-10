import path from 'path'
import PagesCreator from './lib/pages-creator'
import { getOption } from './util'

export default async function ({ graphql, actions }) {
  const { createPage } = actions

  const types = getOption('typeNames')
  const result = await graphql(`
    {
      all${types.page} {
        nodes {
          id
          routes {
            name
            path
          }
          path
          template
          helper
        }
      }
      all${types.route} {
        nodes {
          name
          path
          page {
            path
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const pageCreator = new PagesCreator({
    routes: result.data[`all${types.route}`].nodes,
    pages: result.data[`all${types.page}`].nodes
  })

  // Create the actual pages
  await pageCreator.createPages({ graphql, createPage })

  // Write the route map export file
  pageCreator.writeRouteMap(path.resolve(__dirname, '../routes.js'))
}
