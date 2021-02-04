import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'
import { mapValues, merge } from 'lodash'
import Pagination from '../Pagination'
import testCases, { defaultTestCase } from './__fixtures__/pagination'

describe('<Pagination />', () => {
  const render = (props = {}) => {
    props = merge({}, defaultTestCase, props)
    return ShallowRenderer.createRenderer().render(
      <Pagination {...props} />
    )
  }

  it('should render correctly with defaults', () => {
    expect(render()).toMatchSnapshot()
  })

  it('should render correctly with custom theme', () => {
    expect(render({
      theme: mapValues(Pagination.defaultProps.theme, v => v + '-custom')
    })).toMatchSnapshot()
  })

  it('should render correctly with custom labels', () => {
    expect(render({
      labels: mapValues(Pagination.defaultProps.labels, v => v + ' custom')
    })).toMatchSnapshot()
  })

  it('should render correctly with mini ui', () => {
    expect(render({ ui: 'mini' })).toMatchSnapshot()
  })

  it('should render correctly with simple ui', () => {
    expect(render({ ui: 'simple' })).toMatchSnapshot()
  })

  it('should render correctly with full ui', () => {
    expect(render({ ui: 'full' })).toMatchSnapshot()
  })

  it('should render correctly with custom range', () => {
    expect(render({ range: 1 })).toMatchSnapshot()
    expect(render({ range: 3 })).toMatchSnapshot()
    expect(render({ range: 7 })).toMatchSnapshot()
    expect(render({ range: 9 })).toMatchSnapshot()
  })

  it('shouldn\'t render disabled nav items when renderDisabled is false', () => {
    expect(render({
      pageInfo: { currentPage: 1, hasPreviousPage: false },
      renderDisabled: false
    })).toMatchSnapshot()
    expect(render({
      pageInfo: { currentPage: defaultTestCase.pageInfo.pageCount, hasNextPage: false },
      renderDisabled: false
    })).toMatchSnapshot()
    expect(render({
      pageInfo: {
        itemCount: 1,
        perPage: 10,
        pageCount: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      renderDisabled: false
    })).toMatchSnapshot()
  })

  it('should be able to handle different pageInfos', () => {
    for (const testCase of testCases) {
      expect(render(testCase)).toMatchSnapshot()
    }
  })
})
