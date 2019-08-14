import fs from 'fs'
import path from 'path'
import { createPages } from '../'
import { getOption } from '../util'
import { mountOptions, mountFile, mountDir, mountModule } from '../../../test/helpers'
import testCases from '../../../test/__fixtures__/create-pages'

// Use in-memory file system
jest.mock('fs')

describe(`createPages`, () => {
  const graphql = jest.fn()
  const createPage = jest.fn()
  const actions = { createPage }

  beforeEach(() => {
    graphql.mockReset()
    createPage.mockReset()
    fs.reset()
    jest.resetModules()
    // re-mount options
    mountOptions()
  })

  for (const { id, throws, routes, pages, files = {} } of testCases) {
    // Set test title
    const title = throws
      ? `throws error on (${id})`
      : `correctly creates pages on (${id})`

    test(title, async () => {
      const { templates, helpers } = getOption('directories')
      // Create virtual templates
      if (files.templates) {
        files.templates.map(name => mountFile(path.join(templates, `${name}.js`), '//noop'))
      }

      // Create virtual helpers
      if (files.helpers) {
        for (const name in files.helpers) {
          const file = path.join(helpers, `${name}.js`)
          mountFile(file, '//noop')
          mountModule(file, files.helpers[name])
        }
      }

      // Create a virtual directory for the 'src' folder
      // so that routes.js file can be written virtually
      mountDir(path.resolve(__dirname, '../../'))

      graphql.mockReturnValue({
        data: {
          allPage: { nodes: pages },
          allRoute: { nodes: routes }
        }
      })

      let error = null
      try {
        await createPages({ graphql, actions })
      } catch (e) {
        error = e
      }

      if(throws) {
        expect(error).not.toBeNull()
        expect(error).toMatchSnapshot()
        return
      }

      expect(error).toBeNull()
      expect(createPage.mock.calls).toMatchSnapshot()
      expect(
        fs.readFileSync(path.resolve(__dirname, '../../routes.js'), 'utf8')
      ).toMatchSnapshot()
    })
  }
})
