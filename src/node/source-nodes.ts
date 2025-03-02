import type { NodeInput } from 'gatsby'
import type { PageNode } from './api'
import {
  options,
  reporter,
  ensurePath,
  findConfigFile,
  createPluginExport,
  PluginError,
  validateSchema,
} from './util'
import { getPagesSchema } from './schema'

const sourceNodes = createPluginExport(
  'sourceNodes',
  async ({ actions, createNodeId, createContentDigest }) => {
    const { createNode } = actions
    const opts = options.get()

    let pages = opts.pages
    if (pages.length === 0) {
      const configFile = await findConfigFile(opts._root, 'pages.config')
      if (!configFile) {
        return reporter.warning(
          '- No pages config is defined in plugin options.\n ' +
            `- Unable to find a valid pages config file (eg. "pages.config.js") under "${opts._root}"`,
        )
      }

      try {
        pages = await validateSchema(getPagesSchema, configFile.data, 'pages')
      } catch (error) {
        throw new PluginError(`Unable to validate pages config file "${configFile.path}"`, error)
      }
    }

    pages.forEach((page, i) => {
      if (!page.template && !opts.template) {
        throw new PluginError(
          `Missing "template" metadata for page[${i}]: "${page.title}". ` +
            'No default template is set in plugin options either.',
        )
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
  },
)

export default sourceNodes
