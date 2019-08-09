import fs from 'fs'
import path from 'path'
import { createPages } from '../'
import { getOption } from '../util'
import { mountOptions, mountFile, mountDir, mountModule } from '../../../test/helpers'
import testCase from '../../../test/__fixtures__/create-pages'

// Use in-memory file system
jest.mock('fs')

beforeAll(() => {
  // Mount default options
  mountOptions()

  // Create virtual files for testing
  const { files } = testCase
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
})

describe(`createPages`, () => {
  it(`correctly creates pages`, async () => {
    const graphql = jest.fn().mockReturnValue({
      data: {
        allPage: { nodes: testCase.pages },
        allRoute: { nodes: testCase.routes }
      }
    })
    const createPage = jest.fn()
    const actions = { createPage }

    await createPages({ graphql, actions })
    expect(createPage.mock.calls).toMatchSnapshot()
    expect(
      fs.readFileSync(path.resolve(__dirname, '../../routes.js'), 'utf8')
    ).toMatchSnapshot()
  })
})
