import { onCreateWebpackConfig } from '../'

describe('onCreateWebpackConfig', () => {
  it('should set the correct webpack alias', () => {
    const actions = {
      setWebpackConfig: jest.fn(),
    }

    const cache = {
      directory: '/mock/cache/directory',
    }

    onCreateWebpackConfig({ actions, cache })

    expect(actions.setWebpackConfig).toHaveBeenCalledWith({
      resolve: {
        alias: {
          'gatsby-plugin-advanced-pages-cache': cache.directory,
        },
      },
    })
  })
})
