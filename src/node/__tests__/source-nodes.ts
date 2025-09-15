import { mountFile, mountModule, setupPlugin, resetVFS } from '@test/util'
import testCases from './__fixtures__/source-nodes'
import { options as pluginOptions } from '../util'
import { sourceNodes } from '../plugin'

describe('sourceNodes', () => {
  const createNode = vi.fn()
  const createNodeId = vi.fn().mockImplementation((v) => ('id-' + v).toUpperCase())
  const createContentDigest = vi.fn().mockImplementation((v) => JSON.stringify(v))
  const actions = { createNode }
  const args: any = {
    actions,
    createNodeId,
    createContentDigest,
  }

  beforeEach(() => {
    setupPlugin()
    resetVFS()
    createNode.mockReset()
  })

  it.each(testCases)('$title', async ({ files, throws, options }) => {
    if (options) setupPlugin(options)
    files.forEach((file) => {
      if (typeof file === 'string') mountFile(file)
      else if (Array.isArray(file.data)) mountModule(file.path, file.data)
      else mountFile(file.path, file.data)
    })

    const promise = expect(sourceNodes(args))
    if (throws) {
      await promise.rejects.toMatchSnapshot()
      return
    }

    await promise.resolves.toBeUndefined()
    expect(createNode.mock.calls).toMatchSnapshot()
    expect(pluginOptions.get('_pages')).toMatchSnapshot()
  })
})
