import { onCreateWebpackConfig } from '../plugin'

describe('onCreateWebpackConfig', () => {
  const actions = { setWebpackConfig: vi.fn() }
  const cache = { directory: '/mock/cache/directory' }

  it('should set the correct webpack alias', () => {
    onCreateWebpackConfig(<any>{ actions, cache })

    expect(actions.setWebpackConfig).toHaveBeenCalledWith({
      resolve: {
        alias: {
          'gatsby-plugin-advanced-pages-cache': cache.directory,
        },
      },
    })
  })
})
