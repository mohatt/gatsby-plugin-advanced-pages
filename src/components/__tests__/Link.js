import React from 'react'
import TestRenderer from 'react-test-renderer'
import mockRoutes from '../../__tests__/__fixtures__/routes'
import Link from '../Link'

// Create a virtual mock for routes.json
jest.mock(
  'gatsby-plugin-advanced-pages-cache/routes.json',
  () => mockRoutes,
  { virtual: true }
)

describe('<Link />', () => {
  const render = (props = {}) => {
    return TestRenderer.create(<Link {...props} />).toJSON()
  }

  it('should render correctly', () => {
    expect(render({ to: 'home' })).toMatchSnapshot()
  })

  it('should render correctly with route params', () => {
    expect(render({
      to: 'blog.post',
      params: {
        post: 'hello-world'
      }
    })).toMatchSnapshot()
  })

  it('should render correctly with route params and scope', () => {
    expect(render({
      to: 'blog.tag',
      scope: 'pagination',
      params: {
        tag: 'news',
        page: 5
      }
    })).toMatchSnapshot()
  })

  it('should log console error when called with invalid props', () => {
    const error = jest.spyOn(console, 'error').mockImplementation()
    render()
    expect(error).toHaveBeenCalledTimes(1)
    error.mockClear()
    render({ to: 'blog.post' })
    expect(error).toHaveBeenCalledTimes(1)
    error.mockClear()
    render({
      to: 'blog.post',
      params: {
        invalid: 'whatever'
      }
    })
    expect(error).toHaveBeenCalledTimes(1)
    error.mockRestore()
  })

  it('should render correctly when called with a non-existent route', () => {
    expect(render({ to: 'invalid-route' })).toMatchSnapshot()
    expect(render({ to: 'some/path' })).toMatchSnapshot()
  })
})
