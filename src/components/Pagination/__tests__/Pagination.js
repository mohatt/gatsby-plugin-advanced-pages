import React from "react"
import TestRenderer from 'react-test-renderer';
import { mapValues, merge } from 'lodash'
import Pagination from "../Pagination"

describe(`<Pagination />`, () => {
  const render = (props = {}) => {
    props = merge({
      route: 'blog',
      pageInfo: {
        perPage: 10,
        itemCount: 90,
        currentPage: 4,
      }
    }, props)
    return TestRenderer.create(<Pagination {...props} />).toJSON()
  }

  it(`should render correctly with defaults`, () => {
    expect(render()).toMatchSnapshot()
  })

  it(`should render correctly with custom theme`, () => {
    expect(render({
      theme: mapValues(Pagination.defaultProps.theme, v => v + '-custom')
    })).toMatchSnapshot()
  })

  it(`should render correctly with custom labels`, () => {
    expect(render({
      labels: mapValues(Pagination.defaultProps.labels, v => v + ' custom')
    })).toMatchSnapshot()
  })

  it(`should render correctly with mini ui`, () => {
    expect(render({ ui: 'mini' })).toMatchSnapshot()
  })

  it(`should render correctly with simple ui`, () => {
    expect(render({ ui: 'simple' })).toMatchSnapshot()
  })

  it(`should render correctly with full ui`, () => {
    expect(render({ ui: 'full' })).toMatchSnapshot()
  })

  it(`should render correctly with custom range`, () => {
    expect(render({ range: 1 })).toMatchSnapshot()
    expect(render({ range: 3 })).toMatchSnapshot()
    expect(render({ range: 7 })).toMatchSnapshot()
    expect(render({ range: 9 })).toMatchSnapshot()
  })

  it(`shouldn\'t render disabled nav items when renderDisabled is false`, () => {
    expect(render({
      pageInfo: { currentPage: 1 },
      renderDisabled: false
    })).toMatchSnapshot()
    expect(render({
      pageInfo: { currentPage: 9 },
      renderDisabled: false
    })).toMatchSnapshot()
    expect(render({
      pageInfo: { itemCount: 5, currentPage: 1 },
      renderDisabled: false
    })).toMatchSnapshot()
  })

  it(`should log console error when called with invalid pageInfo prop`, () => {
    const spy = jest.spyOn(console, 'error').mockImplementation()
    render({ pageInfo: { perPage: 0, itemCount: 10 } })
    expect(spy.mock.calls).toMatchSnapshot()
    spy.mockClear()
    render({ pageInfo: { perPage: 0, itemCount: 0 } })
    expect(spy.mock.calls).toMatchSnapshot()
    spy.mockRestore()
  })
})
