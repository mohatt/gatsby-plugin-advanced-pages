import path from "path";
import fs from "fs";
import { validateOptionsSchema, Joi } from 'gatsby-plugin-utils'
import { getOptions, lookupPath, reportError, reportWarning } from './util'
import { pagesSchema } from './schema'

// Searches for a pages config file under {root}
// Loads it, compiles it
function findPagesConfig (root) {
  const file = { path: path.join(root, 'pages.config.js') }
  if(fs.existsSync(file.path)){
    file.contents = require(file.path)
    return file
  }

  file.path = path.join(root, 'pages.config.json')
  if(fs.existsSync(file.path)){
    file.contents = require(file.path)
    return file
  }

  file.path = path.join(root, 'pages.config.yaml')
  if(fs.existsSync(file.path)){
    const yaml = require('js-yaml')
    file.contents =  yaml.load(fs.readFileSync(file.path, 'utf8'), {
      filename: file.path,
      schema: yaml.FAILSAFE_SCHEMA
    });
    return file
  }

  return false
}

// Validates the contents of a pages config file
async function validatePagesConfig (file) {
  const schema = pagesSchema(Joi)
  try {
    return await validateOptionsSchema(schema, file.contents)
  } catch (e) {
    reportError(`Unable to validate pages config file "${file.path}":\n ${e.message}`)
  }
}

export default async function ({ actions, schema, createNodeId, createContentDigest }) {
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

  const configFile = findPagesConfig(options.directories.pages)
  if(!configFile) {
    reportWarning(`Unable to find a valid pages config file under "${options.directories.pages}"`)
    return
  }

  const pages = await validatePagesConfig(configFile)
  let i = 0
  for (const page of pages) {
    // Set template file path
    page.templateName = page.template
    if(page.template) {
      page.template = lookupPath(page.template, options.directories.templates)
    }

    // Set helper file path
    if(page.helper) {
      page.helper = lookupPath(page.helper, options.directories.helpers)
    }

    if (!page.template) {
      if (!options.template) {
        return reportError(
          `Missing "template" metadata for page[${i}]: "${page.title}". No default ` +
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
