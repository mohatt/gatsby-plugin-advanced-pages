import { withPrefix } from 'gatsby'
import routes from '../../test/__fixtures__/routes'
import {
  getRoutes,
  routeExists,
  getRoute,
  getActivatedRoute,
  isActivatedRoute,
  getMatchingRoute,
  generatePath
} from '../api'

// Create a virtual mock for routes.js
jest.doMock('../routes', () => routes, { virtual: true })

jest.doMock('@reach/router', () => ({
  globalHistory: {
    location: {
      pathname: withPrefix('/blog/page/5')
    }
  }
}), { virtual: true })

describe(`API`, () => {
  it(`correctly fetchs routes`, () => {
    expect(getRoutes()).toBe(routes)
    expect(routeExists('blog.post')).toBe(true)
    expect(routeExists('invalid')).toBe(false)
    expect(getRoute('blog.post')).toMatchSnapshot()
    expect(() => getRoute('invalid')).toThrow()
    expect(() => getRoute(false)).toThrow()
    expect(() => getRoute(23)).toThrow()
  })

  it(`picks the correct matching route`, () => {
    expect(getActivatedRoute()).toMatchSnapshot()
    expect(isActivatedRoute('home')).toBe(false)
    expect(isActivatedRoute('blog')).toBe(true)
    expect(() => isActivatedRoute('invalid')).toThrow()
    expect(getMatchingRoute(withPrefix('/'))).toMatchSnapshot()
    expect(getMatchingRoute(withPrefix('/blog/tag/test/page/4'))).toMatchSnapshot()
    expect(getMatchingRoute(withPrefix('/blog/post/hi'))).toMatchSnapshot()
  })

  it(`correctly generates paths`, () => {
    expect(generatePath('home')).toMatchSnapshot()
    expect(generatePath('blog.post', { post: 'hello' })).toMatchSnapshot()
    expect(() => generatePath('invalid')).toThrow()
  })
})