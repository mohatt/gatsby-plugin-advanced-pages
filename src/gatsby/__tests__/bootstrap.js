import { getOptions } from '../util'
import { mountOptions } from '../../../test/helpers'
    
// Use in-memory file system
jest.mock('fs')

describe(`onPreBootstrap`, () => {
  it(`correctly initializes default options`, () => {
    expect(() => mountOptions()).not.toThrow()
    expect(getOptions()).toMatchSnapshot()
  })

  it(`correctly initializes custom options`, () => {
    expect(() => mountOptions({
      basePath: '/blog',
    })).not.toThrow()
    expect(getOptions()).toMatchSnapshot()
  })

  it(`rejects invalid options and throws errors`, () => {
    expect(() => mountOptions({
      engine: 'whatever'
    })).toThrowErrorMatchingSnapshot('Invalid Engine')
  })
})
