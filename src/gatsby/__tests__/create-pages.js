import fs from 'fs'
import path from 'path'
import { createPages } from '../'
import { mountOptions, mountFile, mountDir, mountModule } from '../../../test/helpers'
import testCases from '../../../test/__fixtures__/create-pages'

// Use in-memory file system
jest.mock('fs')

describe('createPages', () => {
  const graphql = jest.fn()
  const createPage = jest.fn()
  const actions = { createPage }
  const getNodesByType = jest.fn().mockImplementation(() => 10)
  const helperFile = '/path/to/helper.js'

  beforeEach(() => {
    graphql.mockReset()
    createPage.mockReset()
    fs.reset()
    jest.resetModules()
    mountOptions()
  })

  for (const { id, throws, pages, helper } of testCases) {
    // Set test title
    const title = throws
      ? `throws error on (${id})`
      : `correctly creates pages on (${id})`

    test(title, async () => {
      if (helper) {
        mountFile(helperFile)
        mountModule(helperFile, helper)
      }

      // Create a virtual directory for the 'src' folder
      // so that routes.js file can be written virtually
      mountDir(path.resolve(__dirname, '../../'))

      graphql.mockReturnValue({
        data: {
          allPage: { nodes: pages }
        }
      })

      let error = null
      try {
        await createPages({
          graphql,
          actions,
          getNodesByType
        })
      } catch (e) {
        error = e
      }

      if (throws) {
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
