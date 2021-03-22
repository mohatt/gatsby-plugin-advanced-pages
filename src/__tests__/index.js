import { withPrefix } from 'gatsby'
import mockRoutes from './__fixtures__/routes'
import router from '@reach/router'
import {
  getRoutes,
  routeExists,
  getRoute,
  getActivatedRoute,
  isActivatedRoute,
  getMatchingRoute,
  generatePath
} from '../index'

// Create a virtual mock for routes.json
jest.mock(
  'gatsby-plugin-advanced-pages-cache/routes.json',
  () => mockRoutes,
  { virtual: true }
)

router.useLocation = jest.fn().mockReturnValue({
  pathname: withPrefix('/blog/page/5')
})

describe('API', () => {
  it('correctly fetchs routes', () => {
    expect(getRoutes()).toMatchSnapshot()
    expect(getRoutes('blog')).toMatchSnapshot()
    expect(routeExists('blog.post')).toBe(true)
    expect(routeExists('invalid')).toBe(false)
    expect(getRoute('blog.post')).toMatchSnapshot()
    expect(() => getRoute('invalid')).toThrow()
    expect(() => getRoute(false)).toThrow()
    expect(() => getRoute(23)).toThrow()
  })

  it('picks the correct matching route', () => {
    expect(getActivatedRoute()).toMatchSnapshot()
    expect(isActivatedRoute('home')).toBe(false)
    expect(isActivatedRoute('blog')).toBe(true)
    expect(() => isActivatedRoute('invalid')).toThrow()
    expect(getMatchingRoute('/')).toMatchSnapshot()
    expect(getMatchingRoute(withPrefix('/'), true)).toMatchSnapshot()
    expect(getMatchingRoute('/blog/tag/test/page/4')).toMatchSnapshot()
    expect(getMatchingRoute('/blog/post/hi')).toMatchSnapshot()
  })

  it('correctly generates paths', () => {
    expect(generatePath('home')).toMatchSnapshot()
    expect(generatePath('blog.post', { post: 'hello' })).toMatchSnapshot()
    expect(() => generatePath('invalid')).toThrow()
  })
})
