import path from 'path'
import { setupPlugin, mountDir, mountModule, readFile, resetVFS } from '@test/util'
import testCases from './__fixtures__/create-pages'
import { createPages } from '../plugin'

describe('createPages', () => {
  const graphql = vi.fn()
  const createPage = vi.fn()
  const cache = { directory: '/path/to/.cache' }
  const actions = { createPage }
  const getNodesByType = vi.fn().mockReturnValue({ length: 10 })
  const args: any = {
    graphql,
    actions,
    cache,
    getNodesByType,
  }
  const helperFile = '/path/to/helper.js'

  beforeEach(() => {
    setupPlugin()
    resetVFS()
    graphql.mockReset()
    createPage.mockReset()
    getNodesByType.mockClear()
  })

  it('correctly calls graphql pages query', async () => {
    graphql.mockReturnValue(Promise.reject(new Error('Test error')))
    await expect(createPages(args)).rejects.toThrow()
    expect(graphql.mock.calls).toMatchSnapshot()
  })

  it.each(testCases)('$title', async ({ throws, pages, helper }) => {
    if (helper !== undefined) mountModule(helperFile, helper)

    // Create a virtual directory for cache.directory
    // so that routes.json file can be written virtually
    mountDir(cache.directory)

    graphql.mockReturnValue(
      Promise.resolve({
        data: {
          allPage: { nodes: pages },
        },
      }),
    )

    const promise = expect(createPages(args))
    if (throws) {
      await promise.rejects.toMatchSnapshot('error')
      return
    }

    await promise.resolves.toBeUndefined()
    expect(createPage.mock.calls).toMatchSnapshot('createPage')
    expect(readFile(path.join(cache.directory, 'routes.json'))).toMatchSnapshot('routes.json')
  })

  it('correctly handles graphql result errors', async () => {
    const errors = [new Error('Some error')]
    graphql.mockReturnValue(Promise.resolve({ errors }))
    await expect(createPages(args)).rejects.toMatchSnapshot()
  })

  it('correctly handles graphql errors', async () => {
    graphql.mockReturnValue(Promise.reject(new Error('Some fatal error')))
    await expect(createPages(args)).rejects.toMatchSnapshot()
  })

  it('correctly handles empty getNodesByType result', async () => {
    getNodesByType.mockReturnValueOnce({ length: 0 })
    await expect(createPages(args)).resolves.toBeUndefined()
  })

  it('correctly handles routeMap write errors', async () => {
    graphql.mockReturnValue(
      Promise.resolve({
        data: {
          allPage: { nodes: [] },
        },
      }),
    )
    await expect(createPages(args)).rejects.toMatchSnapshot()
  })
})
