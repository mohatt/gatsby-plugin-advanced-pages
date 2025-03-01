import { Mock } from 'vitest'
import { withPrefix, navigate as gatsbyNavigate } from 'gatsby'
import { useLocation } from '@reach/router'
import {
  getRoutes,
  routeExists,
  getRoute,
  useRoute,
  useIsRoute,
  getMatchingRoute,
  generatePath,
  navigate,
} from '../index'

describe('API', () => {
  describe('getRoutes', () => {
    it('correctly fetches routes', () => {
      expect(getRoutes()).toMatchSnapshot()
      expect(getRoutes('blog')).toMatchSnapshot()
    })
  })

  describe('getRoute', () => {
    it('correctly fetches routes', () => {
      expect(getRoute('blog.post')).toMatchSnapshot()
      expect(() => getRoute('invalid')).toThrow()
      expect(() => getRoute(<any>false)).toThrow()
      expect(() => getRoute(<any>23)).toThrow()
    })
  })

  describe('routeExists', () => {
    it('correctly checks for valid routes', () => {
      expect(routeExists('blog.post')).toBe(true)
      expect(routeExists('invalid')).toBe(false)
    })
  })

  describe('useRoute', () => {
    it('correctly gets the current active route', () => {
      expect(useRoute()).toMatchSnapshot()
    })

    it('returns null when no route is active', () => {
      ;(<Mock>useLocation).mockReturnValueOnce({ pathname: '/' })
      expect(useRoute()).toBe(null)
    })
  })

  describe('useIsRoute', () => {
    it('picks the correct matching route', () => {
      expect(useIsRoute('home')).toBe(false)
      expect(useIsRoute('blog')).toBe(true)
      expect(() => useIsRoute('invalid')).toThrow()
    })

    it('returns false when no route is active', () => {
      ;(<Mock>useLocation).mockReturnValueOnce({ pathname: '/' })
      expect(useIsRoute('blog')).toBe(false)
    })
  })

  describe('getMatchingRoute', () => {
    it('picks the correct matching route', () => {
      expect(getMatchingRoute('/')).toMatchSnapshot()
      expect(getMatchingRoute(withPrefix('/'), true)).toMatchSnapshot()
      expect(getMatchingRoute('/blog/tag/test/page/4')).toMatchSnapshot()
      expect(getMatchingRoute('/blog/post/hi')).toMatchSnapshot()
    })
  })

  describe('generatePath', () => {
    it('correctly generates paths', () => {
      expect(generatePath('home')).toMatchSnapshot()
      expect(generatePath('blog', { page: 5 }, 'pagination')).toMatchSnapshot()
      expect(generatePath('blog.post', { post: 'hello' })).toMatchSnapshot()
      expect(() => generatePath('invalid')).toThrow()
    })

    it('throws for unrecognized scope', () => {
      expect(() => generatePath('about', {}, 'pagination')).toThrowErrorMatchingSnapshot()
    })
  })

  describe('navigate', () => {
    it('correctly calls gatsby.navigate()', async () => {
      const gMock = <Mock>gatsbyNavigate
      await navigate('home')
      expect(gMock.mock.calls).toMatchSnapshot()
      gMock.mockClear()
      await navigate('blog.post', { post: 'hello' })
      expect(gMock.mock.calls).toMatchSnapshot()
      gMock.mockClear()
      await navigate('blog', { page: 4 }, 'pagination', { replace: true })
      expect(gMock.mock.calls).toMatchSnapshot()
      gMock.mockClear()
    })
  })
})
