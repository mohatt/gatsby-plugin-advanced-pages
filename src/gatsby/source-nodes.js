import path from "path";
import fs from "fs";
import { validateOptionsSchema, Joi } from 'gatsby-plugin-utils'
import { getOptions } from './util'
import { pagesSchema } from './schema'

// Searches for a valid pages config file under {root}, loads it and then validates it
async function getPagesConfig (root) {
  let loadedConfigFile;

  const loadPagesConfig = () => {
    const jsFile = path.join(root, 'pages.config.js')
    if(fs.existsSync(jsFile)){
      loadedConfigFile = jsFile
      return require(jsFile)
    }

    const jsonFile = path.join(root, 'pages.config.json')
    if(fs.existsSync(jsonFile)){
      loadedConfigFile = jsonFile
      return require(jsonFile)
    }

    const yamlFile = path.join(root, 'pages.config.yaml')
    if(fs.existsSync(yamlFile)){
      loadedConfigFile = yamlFile
      const yaml = require('js-yaml')
      return yaml.load(fs.readFileSync(yamlFile, 'utf8'), {
        filename: yamlFile,
        schema: yaml.FAILSAFE_SCHEMA
      });
    }

    throw new Error(`Unable to find a valid pages config file under '${root}'`)
  }

  const content = loadPagesConfig()
  const schema = pagesSchema(Joi)
  try {
    return await validateOptionsSchema(schema, content)
  } catch (e) {
    throw new Error(`Unable to validate pages config file '${loadedConfigFile}': ${e.message}`)
  }
}

export default async function ({ store, actions, schema, createNodeId, createContentDigest }) {
  const { createTypes, createNode } = actions
  const options = getOptions()

  createTypes([
    schema.buildObjectType({
      name: options.typeNames.page,
      fields: {
        templateName: 'String',
        template: 'String',
        helper: 'String',
        data: 'JSON',
      },
      interfaces: ['Node']
    }),
  ])

  const root = store.getState().program.directory
  const pages = await getPagesConfig(root)

  let i = 0
  for (const page of pages) {
    // Set template file path
    page.templateName = page.template
    if(page.template) {
      const templatePath = path.join(options.directories.templates, page.template)
      if(fs.existsSync(templatePath)) {
        page.template = templatePath
      } else {
        const templatePathAbs = path.join(root, page.template)
        if(fs.existsSync(templatePathAbs)) {
          page.template = templatePathAbs
        } else {
          throw new Error(
            `Page template with value "${page.template}" could not be found ` +
            `at "${templatePath}" or "${templatePathAbs}".`
          )
        }
      }
    }

    // Set helper file path
    if(page.helper) {
      const helperPath = path.join(options.directories.helpers, page.helper)
      if(fs.existsSync(helperPath)) {
        page.helper = helperPath
      } else {
        const helperPathAbs = path.join(root, page.helper)
        if(fs.existsSync(helperPathAbs)) {
          page.helper = helperPathAbs
        } else {
          throw new Error(
            `Page helper with value "${page.helper}" could not be found ` +
            `at "${helperPath}" or "${helperPathAbs}".`
          )
        }
      }
    }

    if (!page.template) {
      if (!options.template) {
        throw new Error(
          `Missing 'template' metadata for page[${i}]: "${page.title}". No default ` +
          'template is set in plugin options either.'
        )
      }
      page.template = options.template
    }

    const node = {
      id: createNodeId(`${i} - ${page.title}`),
      ...page,
      parent: null,
      children: [],
      internal: {
        type: options.typeNames.page,
        description: `Advanced Page: ${page.title}`
      }
    }

    node.routes = []
    for (const [n, p] of Object.entries(page.routes)) {
      node.routes.push({ name: n, path: p })
    }

    node.internal.contentDigest = createContentDigest(node)
    createNode(node)

    i++
  }
}
