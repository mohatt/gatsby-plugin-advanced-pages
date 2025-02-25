import path from 'path'
import fs from 'fs'
import type { GatsbyNode, NodeInput } from 'gatsby'
import { validateOptionsSchema, Joi } from 'gatsby-plugin-utils'
import { getOptions, lookupPath, reportError, reportWarning } from './util'
import { pagesSchema } from './schema'
import type { PageDefinition, PageNode } from './types'

interface ConfigFile {
  path: string
  data: PageDefinition[]
}

// Searches for a pages config file under {root} and loads it
const findPagesConfig = (root: string): ConfigFile => {
  const configs = ['pages.config.js', 'pages.config.json', 'pages.config.yaml']

  for (const config of configs) {
    const filePath = path.join(root, config)
    if (fs.existsSync(filePath)) {
      if (config.endsWith('.yaml')) {
        const Yaml = require('js-yaml')
        return {
          path: filePath,
          data: Yaml.load(fs.readFileSync(filePath, 'utf8'), {
            filename: filePath,
            schema: Yaml.FAILSAFE_SCHEMA,
          }),
        }
      }
      return { path: filePath, data: require(filePath) }
    }
  }

  return null
}

// Validates the contents of a pages config file
const validatePagesConfig = async (file: ConfigFile) => {
  const schema = Joi.object({ pages: pagesSchema(Joi) })
  try {
    const { value } = await validateOptionsSchema(schema, { pages: file.data })
    return value.pages as PageDefinition[]
  } catch (e) {
    reportError(`Unable to validate pages config file "${file.path}":\n ${e.message}`)
  }
  return []
}

const sourceNodes: GatsbyNode['sourceNodes'] = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions
  const options = getOptions()

  let pages = options.pages
  if (pages.length === 0) {
    const configFile = findPagesConfig(options._root)
    if (!configFile) {
      reportWarning(
        '- No pages config is defined in plugin options.\n ' +
        `- Unable to find a valid pages config file (eg. "pages.config.js") under "${options._root}"`
      )
      return
    }

    pages = await validatePagesConfig(configFile)
  }

  let i = 0
  for (const page of pages) {
    if (!page.template && !options.template) {
      reportError(
        `Missing "template" metadata for page[${i}]: "${page.title}". No default ` +
        'template is set in plugin options either.'
      )
      continue
    }

    // Create the page node data
    const pageNode: PageNode = {
      id: createNodeId(`${i} - ${page.title}`),
      ...page,
      // Set template file path
      templateName: page.template,
      template: page.template ? lookupPath(page.template, options.directories.templates) : options.template,
      // Set helper file path
      helper: page.helper && lookupPath(page.helper, options.directories.helpers),
      // Set page routes
      routes: Object.entries(page.routes).map(([name, path]) => ({ name, path })),
    }

    const node = {
      ...pageNode,
      parent: null,
      children: [],
      internal: {
        type: options.typeNames.page,
        description: `Advanced Page: ${page.title}`,
        contentDigest: createContentDigest(pageNode)
      }
    } satisfies NodeInput & PageNode

    createNode(node)
    i++
  }
}

export default sourceNodes
