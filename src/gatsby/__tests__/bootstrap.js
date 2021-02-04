import { getOptions } from '../util'
import { mountOptions, mountFile } from '../../../test/node-utils'

// Use in-memory file system
jest.mock('fs')

describe('onPreBootstrap', () => {
  it('correctly initializes default options', () => {
    expect(() => mountOptions()).not.toThrow()
    expect(getOptions()).toMatchSnapshot()
  })

  it('correctly initializes custom options', () => {
    mountFile('./custom/templates/default.js')
    expect(() => mountOptions({
      basePath: '/blog',
      template: 'default.js',
      directories: {
        templates: './custom/templates'
      }
    })).not.toThrow()
    expect(getOptions()).toMatchSnapshot()
  })

  it('rejects invalid options and throws errors', () => {
    expect(() => mountOptions({
      template: 'whatever'
    })).toThrowErrorMatchingSnapshot('Invalid Template')
  })
})
