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
  PAGE_HELPER_FUNCTION,
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

    // Set pages dict so it can be accessed later by other APIs
    opts._pages = {}

    pages.forEach((page, i) => {
      if (!page.template && !opts.template) {
        throw new PluginError(
          `Missing "template" metadata for page[${i}]: "${page.title}". ` +
            'No default template is set in plugin options either.',
        )
      }

      let pageHelper: string
      if (page.helper != null) {
        pageHelper =
          typeof page.helper === 'function'
            ? PAGE_HELPER_FUNCTION // String placeholder for helper function
            : ensurePath(page.helper, opts.directories.helpers) // Set helper file path
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
        helper: pageHelper,
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

      // Set page object for later use
      opts._pages[node.id] = page
    })
  },
)

export default sourceNodes
