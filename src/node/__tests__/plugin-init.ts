import { mountOptions, mountFile } from '@test/util'
import { options, reporter } from '../util'

describe('onPluginInit', () => {
  it('options.get() throws when options are not initialized', () => {
    expect(() => options.get()).toThrowErrorMatchingSnapshot()
  })

  it('reporter.get() throws when reporter is not initialized', () => {
    expect(() => reporter.get()).toThrowErrorMatchingSnapshot()
  })

  it('correctly initializes default options', () => {
    expect(() => mountOptions()).not.toThrow()
    expect(options.get()).toMatchSnapshot()
  })

  it('correctly initializes custom options', () => {
    mountFile('./custom/templates/default.js')
    expect(() =>
      mountOptions({
        basePath: '/blog',
        template: 'default.js',
        directories: {
          templates: './custom/templates',
        },
      }),
    ).not.toThrow()
    expect(options.get()).toMatchSnapshot()
  })

  it('rejects invalid options and throws errors', () => {
    expect(() =>
      mountOptions({
        template: 'whatever',
      }),
    ).toThrowErrorMatchingSnapshot('Invalid Template')
  })
})
