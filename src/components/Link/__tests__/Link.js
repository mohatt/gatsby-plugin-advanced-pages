import React from 'react'
import TestRenderer from 'react-test-renderer'
import Link from '../Link'
import routes from '../../../../test/__fixtures__/routes'

// Create a virtual mock for routes.js
jest.doMock('../../../routes', () => routes, { virtual: true })

describe(`<Link />`, () => {
  const render = (props = {}) => {
    return TestRenderer.create(<Link {...props} />).toJSON()
  }

  it(`should render correctly`, () => {
    expect(render({ to: 'home' })).toMatchSnapshot()
  })

  it(`should render correctly with route params`, () => {
    expect(render({
      to: 'blog.post',
      params: {
        post: 'hello-world'
      }
    })).toMatchSnapshot()
  })

  it(`should render correctly with route params and scope`, () => {
    expect(render({
      to: 'blog.tag',
      scope: 'pagination',
      params: {
        tag: 'news',
        page: 5
      }
    })).toMatchSnapshot()
  })

  it(`should log console error when called with invalid props`, () => {
    const spy = jest.spyOn(console, 'error').mockImplementation()
    render()
    expect(spy.mock.calls).toMatchSnapshot()
    spy.mockClear()
    render({ to: 'blog.post' })
    expect(spy.mock.calls).toMatchSnapshot()
    spy.mockClear()
    render({
      to: 'blog.post',
      params: {
        invalid: 'whatever'
      }
    })
    expect(spy.mock.calls).toMatchSnapshot()
    spy.mockRestore()
  })

  it(`should render correctly when called with a non-existent route`, () => {
    expect(render({ to: 'invalid-route' })).toMatchSnapshot()
    expect(render({ to: 'some/path' })).toMatchSnapshot()
  })
})
