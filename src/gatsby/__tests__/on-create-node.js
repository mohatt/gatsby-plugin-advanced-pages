import { onCreateNode } from '../'
import { mountOptions } from '../../../test/helpers'
import testCases from '../../../test/__fixtures__/on-create-node'

// Use in-memory file system
jest.mock('fs')

// Mount default options
beforeAll(() => { 
  mountOptions()
})

describe(`onCreateNode`, () => {
  const createNode = jest.fn()
  const createParentChildLink = jest.fn()
  const actions = { createNode, createParentChildLink }

  const getNode = jest.fn()
  const createNodeId = jest.fn().mockImplementation((v) => ('id-' + v).toUpperCase())
  const createContentDigest = jest.fn().mockImplementation((v) => JSON.stringify(v))

  for (const testCase of testCases) {
    it(`correctly creates a Page node from a markdown node (${testCase.title})`, () => {
      getNode.mockReturnValue(testCase.parent)
      onCreateNode({
        node: testCase.node,
        actions,
        getNode,
        createNodeId,
        createContentDigest
      })
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()

      createNode.mockClear()
      createParentChildLink.mockClear()
    })
  }
})
