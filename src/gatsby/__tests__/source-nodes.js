import fs from 'fs'
import { sourceNodes } from '../'
import { mountFile, mountModule, mountOptions } from '../../../test/helpers'
import testCases from './__fixtures__/source-nodes'

// Use in-memory file system
jest.mock('fs')

describe('sourceNodes', () => {
  const createTypes = jest.fn()
  const createNode = jest.fn()
  const actions = { createTypes, createNode }
  const createNodeId = jest.fn().mockImplementation((v) => ('id-' + v).toUpperCase())
  const createContentDigest = jest.fn().mockImplementation((v) => JSON.stringify(v))
  const schema = { buildObjectType: jest.fn() }

  beforeEach(() => {
    createNode.mockReset()
    jest.resetModules()
    fs.reset()
    // Reset options before each test
    mountOptions()
  })

  for (const { title, files, throws, options } of testCases) {
    test(title, async () => {
      options && mountOptions(options)
      files.map(file => typeof file === 'string'
        ? mountFile(file)
        : Array.isArray(file.data)
          ? mountFile(file.path) || mountModule(file.path, file.data)
          : mountFile(file.path, file.data)
      )

      let error = null
      try {
        await sourceNodes({
          actions,
          schema,
          createNodeId,
          createContentDigest
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
      expect(createNode.mock.calls).toMatchSnapshot()
    })
  }
})
