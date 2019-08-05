import React from "react"
import TestRenderer from 'react-test-renderer';
import Link from "../Link"

const render = (props = {}) => {
  return TestRenderer.create(<Link {...props} />).toJSON()
}

describe(`<Link />`, () => {
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
    render({ to: 25 })
    expect(spy.mock.calls).toMatchSnapshot()
    spy.mockClear()
    render({ to: 'invalid-route' })
    expect(spy.mock.calls).toMatchSnapshot()
    spy.mockRestore()
  })
})
