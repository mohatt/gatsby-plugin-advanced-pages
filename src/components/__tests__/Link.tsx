// @vitest-environment jsdom
import React from 'react'
import ReactTest from '@testing-library/react'
import { Link, LinkProps } from '../Link'

describe('<Link />', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    consoleError.mockClear()
  })

  const render = (props?: LinkProps<any>) => {
    return ReactTest.render(<Link {...props} />).container.firstChild
  }

  it('should render correctly', () => {
    expect(render({ to: 'home' })).toMatchSnapshot()
  })

  it('should render correctly with route params', () => {
    expect(
      render({
        to: 'blog.post',
        params: {
          post: 'hello-world',
        },
      }),
    ).toMatchSnapshot()
  })

  it('should render correctly with route params and scope', () => {
    expect(
      render({
        to: 'blog.tag',
        scope: 'pagination',
        params: {
          tag: 'news',
          page: 5,
        },
      }),
    ).toMatchSnapshot()
  })

  it('should render correctly with with no route prop', () => {
    expect(render()).toMatchSnapshot()
  })

  it('should log console error when called with invalid props', () => {
    render({ to: 'blog.post' })
    expect(consoleError).toHaveBeenCalledTimes(1)
    consoleError.mockClear()
    render({
      to: 'blog.post',
      params: {
        invalid: 'whatever',
      },
    })
    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  it('should render correctly when called with a non-existent route', () => {
    expect(render({ to: 'invalid-route' })).toMatchSnapshot()
    expect(render({ to: 'some/path' })).toMatchSnapshot()
  })
})
