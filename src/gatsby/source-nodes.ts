import path from 'path'
import fs from 'fs'
import type { GatsbyNode, NodeInput } from 'gatsby'
import { validateOptionsSchema, Joi } from 'gatsby-plugin-utils'
import { options, reporter, ensurePath } from './util'
import { getPagesSchema } from './schema'
import type { PageOptions, PageNode } from './types'

// Searches for a pages config file under {root} and loads it
const findPagesConfig = (root: string) => {
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
const validatePagesConfig = async (pages: unknown) => {
  const schema = Joi.object({ pages: getPagesSchema(Joi) })
  const { value } = await validateOptionsSchema(schema, { pages })
  return value.pages as PageOptions[]
}

const sourceNodes: GatsbyNode['sourceNodes'] = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions
  const opts = options.get()

  let pages = opts.pages
  if (pages.length === 0) {
    const configFile = findPagesConfig(opts._root)
    if (!configFile) {
      reporter.warning(
        '- No pages config is defined in plugin options.\n ' +
          `- Unable to find a valid pages config file (eg. "pages.config.js") under "${opts._root}"`,
      )
      return
    }

    try {
      pages = await validatePagesConfig(configFile.data)
    } catch (e) {
      reporter.error(`Unable to validate pages config file "${configFile.path}":\n ${e.message}`)
      return
    }
  }

  pages.forEach((page, i) => {
    if (!page.template && !opts.template) {
      reporter.error(
        `Missing "template" metadata for page[${i}]: "${page.title}". No default ` +
          'template is set in plugin options either.',
      )
      return
    }

    // Create the page node data
    const pageNode: PageNode = {
      id: createNodeId(`${i} - ${page.title}`),
      ...page,
      // Set template file path
      templateName: page.template,
      template:
        page.template != null
          ? ensurePath(page.template, opts.directories.templates)
          : opts.template,
      // Set helper file path
      helper: page.helper != null ? ensurePath(page.helper, opts.directories.helpers) : undefined,
      // Set page routes
      routes: Object.entries(page.routes).map(([name, path]) => ({ name, path })),
    }

    const node = {
      ...pageNode,
      parent: null,
      children: [],
      internal: {
        type: opts.typeNames.page,
        description: `Advanced Page: ${page.title}`,
        contentDigest: createContentDigest(pageNode),
      },
    } satisfies NodeInput & PageNode

    createNode(node)
  })
}

export default sourceNodes
